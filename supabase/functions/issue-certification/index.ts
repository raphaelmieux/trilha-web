import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const segments: string[] = [];
  for (let s = 0; s < 4; s++) {
    let seg = "";
    for (let i = 0; i < 4; i++) {
      seg += chars[Math.floor(Math.random() * chars.length)];
    }
    segments.push(seg);
  }
  return "TW-" + segments.join("-");
}

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Autenticação necessária." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: callerError } = await supabaseAuth.auth.getUser();
    if (callerError || !caller) {
      return new Response(JSON.stringify({ error: "Sessão inválida." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { userId, specialtyCode, level } = await req.json();

    if (!userId || !specialtyCode || !level) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    if (caller.id !== userId) {
      const { data: callerProfile } = await supabase
        .from("user_profiles")
        .select("is_admin")
        .eq("id", caller.id)
        .maybeSingle();
      if (!callerProfile?.is_admin) {
        return new Response(JSON.stringify({ error: "Não autorizado a emitir certificação para este usuário." }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Check if certification already exists
    const { data: existing } = await supabase
      .from("certifications")
      .select("*")
      .eq("user_id", userId)
      .eq("level", level)
      .eq("status", "active")
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ success: true, code: existing.code, message: "Already certified" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // For advanced level, check fundamental certification exists first
    if (level === "advanced") {
      const { data: fundamental } = await supabase
        .from("certifications")
        .select("*")
        .eq("user_id", userId)
        .eq("level", "fundamental")
        .eq("status", "active")
        .maybeSingle();

      if (!fundamental) {
        return new Response(JSON.stringify({ error: "Fundamental certification required first" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Get specialty
    const { data: specialty } = await supabase
      .from("specialties")
      .select("*")
      .eq("code", specialtyCode)
      .maybeSingle();

    if (!specialty) {
      return new Response(JSON.stringify({ error: "Specialty not found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify all requirements are completed — applies to every level, not just advanced.
    const { data: requirements } = await supabase
      .from("requirements")
      .select("id, code")
      .eq("specialty_id", specialty.id);

    if (requirements) {
      for (const req of requirements) {
        const { data: prog } = await supabase
          .from("requirement_progress")
          .select("status")
          .eq("user_id", userId)
          .eq("requirement_id", req.id)
          .maybeSingle();

        if (!prog || prog.status !== "completed") {
          return new Response(JSON.stringify({ error: `Requirement ${req.code} not completed` }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    // Generate code and hash
    const code = generateCode();
    const hashInput = `${userId}:${specialtyCode}:${level}:${code}:${Date.now()}`;
    const hash = await sha256(hashInput);
    const signature = await sha256(hash + Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!.substring(0, 32));

    // Get curriculum version
    const { data: curriculum } = await supabase
      .from("curriculum_versions")
      .select("*")
      .eq("id", specialty.curriculum_version_id)
      .maybeSingle();

    // Get reference certification for advanced
    let referenceId = null;
    if (level === "advanced") {
      const { data: fundamental } = await supabase
        .from("certifications")
        .select("id")
        .eq("user_id", userId)
        .eq("level", "fundamental")
        .eq("status", "active")
        .maybeSingle();
      referenceId = fundamental?.id || null;
    }

    // Insert certification
    const { data: cert, error: certError } = await supabase
      .from("certifications")
      .insert({
        user_id: userId,
        specialty_id: specialty.id,
        code,
        hash,
        signature,
        level,
        curriculum_code: specialtyCode,
        curriculum_version: curriculum?.version || "1.0",
        status: "active",
        reference_certification_id: referenceId,
      })
      .select()
      .single();

    if (certError) {
      return new Response(JSON.stringify({ error: certError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create snapshot
    const { data: progressData } = await supabase
      .from("requirement_progress")
      .select("*, requirements(code)")
      .eq("user_id", userId);

    await supabase.from("certification_snapshots").insert({
      certification_id: cert.id,
      requirements_snapshot: requirements || [],
      progress_snapshot: progressData || [],
    });

    // Log event
    await supabase.from("certification_events").insert({
      certification_id: cert.id,
      event_type: "issued",
      metadata: { code, level, specialtyCode },
    });

    // Log activity
    await supabase.from("activity_events").insert({
      user_id: userId,
      event_type: "certification_issued",
      metadata: { code, level, specialtyCode },
    });

    return new Response(JSON.stringify({ success: true, code, hash: hash.substring(0, 32) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
