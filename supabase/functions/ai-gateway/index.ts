import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * Gemini gateway for the AI Lab.
 *
 * The API key lives here, in a Supabase secret, and never reaches the browser —
 * a key shipped to the client can be read by anyone who opens devtools and used
 * until the quota is gone.
 *
 * The students are Pathfinders, typically 10–15 years old, so this endpoint is
 * deliberately narrow:
 *  - only signed-in users, and only for their own user id;
 *  - prompts are assembled from a fixed catalogue of options plus one short free
 *    field, and the whole thing is capped, so there is no open channel to a
 *    generative model;
 *  - Gemini's safety filters are set to their strictest usable setting;
 *  - a per-user daily cap bounds both exposure and cost;
 *  - every generation is written to activity_events so a club admin can audit
 *    what was asked and what came back.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Overridable without a redeploy, since model ids get retired.
const TEXT_MODEL = Deno.env.get("GEMINI_TEXT_MODEL") ?? "gemini-2.0-flash";
const IMAGE_MODEL = Deno.env.get("GEMINI_IMAGE_MODEL") ?? "gemini-2.0-flash-preview-image-generation";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

const DAILY_LIMIT = Number(Deno.env.get("AI_DAILY_LIMIT") ?? "12");

// Strictest setting the API accepts for every category it exposes.
const SAFETY_SETTINGS = [
  "HARM_CATEGORY_HARASSMENT",
  "HARM_CATEGORY_HATE_SPEECH",
  "HARM_CATEGORY_SEXUALLY_EXPLICIT",
  "HARM_CATEGORY_DANGEROUS_CONTENT",
].map(category => ({ category, threshold: "BLOCK_LOW_AND_ABOVE" }));

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return json({
        error: "A integração com IA ainda não foi configurada.",
        hint: "Defina o segredo GEMINI_API_KEY no projeto Supabase.",
        notConfigured: true,
      }, 503);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Autenticação necessária." }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: callerError } = await supabaseAuth.auth.getUser();
    if (callerError || !caller) return json({ error: "Sessão inválida." }, 401);

    const { type, prompt, userId } = await req.json();
    if (!type || !prompt || !userId) return json({ error: "Missing required fields" }, 400);
    if (caller.id !== userId) return json({ error: "Não autorizado." }, 403);
    if (typeof prompt !== "string" || prompt.length > 1200) {
      return json({ error: "Pedido muito longo." }, 400);
    }
    if (type !== "text" && type !== "image") {
      return json({ error: "Tipo de geração inválido." }, 400);
    }

    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Daily cap, counted from the audit log so it cannot be bypassed client-side.
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const { count } = await admin
      .from("activity_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("event_type", "ai_generation")
      .gte("created_at", since.toISOString());

    if ((count ?? 0) >= DAILY_LIMIT) {
      return json({
        error: `Limite de ${DAILY_LIMIT} gerações por dia atingido. Tente novamente amanhã.`,
        limitReached: true,
      }, 429);
    }

    const model = type === "image" ? IMAGE_MODEL : TEXT_MODEL;
    const body: Record<string, unknown> = {
      contents: [{ parts: [{ text: prompt }] }],
      safetySettings: SAFETY_SETTINGS,
    };
    if (type === "image") {
      body.generationConfig = { responseModalities: ["TEXT", "IMAGE"] };
    } else {
      body.generationConfig = { temperature: 0.8, maxOutputTokens: 800 };
    }

    const response = await fetch(`${API_BASE}/${model}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data?.error?.message ?? "Erro ao contatar a IA.";
      return json({ error: message, provider: "gemini", model }, 502);
    }

    const candidate = data?.candidates?.[0];
    if (!candidate || candidate.finishReason === "SAFETY") {
      return json({
        error: "O pedido foi bloqueado pelos filtros de segurança. Reformule com outras palavras.",
        blocked: true,
      }, 200);
    }

    const parts = candidate?.content?.parts ?? [];
    const textOut = parts.filter((p: { text?: string }) => p.text).map((p: { text: string }) => p.text).join("\n").trim();
    const inline = parts.find((p: { inlineData?: unknown }) => p.inlineData)?.inlineData;

    if (type === "image") {
      if (!inline?.data) {
        return json({ error: "A IA não retornou uma imagem. Tente reformular o pedido." }, 200);
      }
      await admin.from("activity_events").insert({
        user_id: userId,
        event_type: "ai_generation",
        metadata: { type, model, prompt: prompt.slice(0, 500) },
      });
      return json({
        result: `data:${inline.mimeType ?? "image/png"};base64,${inline.data}`,
        note: textOut || undefined,
        model,
        provider: "gemini",
      });
    }

    if (!textOut) return json({ error: "A IA não retornou texto. Tente novamente." }, 200);

    await admin.from("activity_events").insert({
      user_id: userId,
      event_type: "ai_generation",
      metadata: { type, model, prompt: prompt.slice(0, 500) },
    });

    return json({ result: textOut, model, provider: "gemini" });
  } catch (err) {
    return json({ error: (err as Error).message ?? "Erro interno." }, 500);
  }
});
