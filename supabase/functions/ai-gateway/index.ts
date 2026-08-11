import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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
    const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: callerError } = await supabaseAuth.auth.getUser();
    if (callerError || !caller) {
      return new Response(JSON.stringify({ error: "Sessão inválida." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { type, prompt, userId, clubName } = await req.json();

    if (!type || !prompt || !userId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (caller.id !== userId) {
      return new Response(JSON.stringify({ error: "Não autorizado." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check AI provider settings
    const { data: provider } = await supabase
      .from("ai_provider_settings")
      .select("*")
      .eq("is_active", true)
      .eq("service_type", type === "text" ? "text" : "image")
      .maybeSingle();

    // Demo mode - generate placeholder content
    if (!provider) {
      let result = "";

      if (type === "text") {
        result = `O Clube de Desbravadores é uma organização que desempenha um papel fundamental na formação de jovens. ` +
          `Através de atividades ao ar livre, ensino de habilidades práticas e desenvolvimento de valores, ` +
          `o clube contribui para o crescimento integral dos participantes. ` +
          `Os desbravadores aprendem sobre natureza, liderança, trabalho em equipe e serviço à comunidade. ` +
          `Este ambiente promove amizades saudáveis e o desenvolvimento do caráter. ` +
          `A importância do clube reside em seu compromisso com a formação de cidadãos responsáveis ` +
          `e conscientes de seu papel na sociedade.\n\n[Modo demonstração - este texto foi gerado para fins educacionais.]`;
      } else if (type === "image") {
        // Generate a simple SVG placeholder
        const svg = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
<rect width="400" height="300" fill="#0B6E4F"/>
<circle cx="200" cy="120" r="40" fill="#F2B705"/>
<text x="200" y="200" text-anchor="middle" fill="white" font-size="20" font-family="sans-serif">Acampamento</text>
<text x="200" y="230" text-anchor="middle" fill="#F2B705" font-size="14" font-family="sans-serif">[Demo]</text>
</svg>`;
        const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;
        return new Response(JSON.stringify({
          result: dataUrl,
          model: "demo",
          provider: "demo",
          note: "Modo demonstração - não produz evidência final de IA real",
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else if (type === "logo") {
        const svg = `<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
<circle cx="150" cy="150" r="140" fill="#0B6E4F" stroke="#F2B705" stroke-width="4"/>
<text x="150" y="140" text-anchor="middle" fill="white" font-size="24" font-weight="bold" font-family="sans-serif">${clubName || "Clube"}</text>
<text x="150" y="170" text-anchor="middle" fill="#F2B705" font-size="14" font-family="sans-serif">Desbravadores</text>
</svg>`;
        const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;
        return new Response(JSON.stringify({
          result: dataUrl,
          model: "demo",
          provider: "demo",
          note: "Modo demonstração - não produz evidência final de IA real",
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({
        result,
        model: "demo",
        provider: "demo",
        note: "Modo demonstração - não produz evidência final de IA real",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If provider exists, call the actual API (implementation depends on provider)
    // For now, return demo mode with note
    return new Response(JSON.stringify({
      result: "Provider configurado mas não implementado neste MVP.",
      model: provider.model || "unknown",
      provider: provider.provider_name,
      note: "Configure o provedor no painel admin",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
