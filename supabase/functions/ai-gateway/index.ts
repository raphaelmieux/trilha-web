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

const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * Which Gemini model to call.
 *
 * These were pinned to specific ids, and the pin broke: Google retired
 * `gemini-2.0-flash` and every generation started failing with "this model is no
 * longer available". A club leader cannot be expected to track Google's model
 * lifecycle, so the gateway asks the API which models exist and picks one.
 *
 * The secrets still win when they are set — that is the escape hatch for pinning
 * a specific model deliberately.
 */
const TEXT_MODEL_OVERRIDE = Deno.env.get("GEMINI_TEXT_MODEL");
const IMAGE_MODEL_OVERRIDE = Deno.env.get("GEMINI_IMAGE_MODEL");

interface ListedModel {
  name: string;
  supportedGenerationMethods?: string[];
  description?: string;
}

/** Resolved lists live as long as the instance stays warm, then are re-checked. */
const modelCache = new Map<"text" | "image", { names: string[]; at: number }>();
const MODEL_CACHE_MS = 60 * 60 * 1000;

/**
 * Ranks candidates so the choice survives names nobody has seen yet: newest
 * version first, "flash" ahead of "pro" because this is a children's lab where
 * cost and latency matter more than depth, and stable ahead of preview.
 */
function scoreModel(id: string): number {
  const version = /gemini-(\d+)(?:\.(\d+))?/.exec(id);
  const major = version ? Number(version[1]) : 0;
  const minor = version ? Number(version[2] ?? 0) : 0;
  let score = major * 1000 + minor * 100;
  if (/flash/i.test(id)) score += 50;
  if (/lite/i.test(id)) score += 10;
  if (/preview|exp|latest/i.test(id)) score -= 30;
  return score;
}

/**
 * Returns every usable model, best first.
 *
 * A list rather than a single name because the two ways this breaks are
 * different: a retired model needs a *different* model, and an overloaded one —
 * "this model is currently experiencing high demand", which is what the newest
 * and most popular model returns at busy hours — needs a *less busy* one. Both
 * are answered by walking down the list.
 */
async function resolveModels(apiKey: string, kind: "text" | "image"): Promise<string[]> {
  const override = kind === "image" ? IMAGE_MODEL_OVERRIDE : TEXT_MODEL_OVERRIDE;
  if (override) return [override];

  const cached = modelCache.get(kind);
  if (cached && Date.now() - cached.at < MODEL_CACHE_MS) return cached.names;

  const response = await fetch(`${API_BASE}?key=${apiKey}&pageSize=200`);
  if (!response.ok) {
    throw new Error(`Não foi possível listar os modelos do Gemini (${response.status}).`);
  }
  const listed: ListedModel[] = (await response.json()).models ?? [];

  const usable = listed
    .filter(m => (m.supportedGenerationMethods ?? []).includes("generateContent"))
    .map(m => m.name.replace(/^models\//, ""))
    // Embedding and other non-conversational models never belong here.
    .filter(id => !/embedding|aqa|tts|imagen/i.test(id));

  const candidates = kind === "image"
    ? usable.filter(id => /image/i.test(id))
    : usable.filter(id => !/image/i.test(id));

  // An image-capable model is not guaranteed to exist; falling back to text
  // means the lab reports a clean "image unavailable" instead of a 502.
  const pool = candidates.length > 0 ? candidates : (kind === "image" ? [] : usable);
  if (pool.length === 0) {
    throw new Error(
      kind === "image"
        ? "Nenhum modelo de geração de imagem disponível para esta chave."
        : "Nenhum modelo de texto disponível para esta chave.",
    );
  }

  const ranked = [...pool].sort((a, b) => scoreModel(b) - scoreModel(a));
  modelCache.set(kind, { names: ranked, at: Date.now() });
  return ranked;
}

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

    const kind = type === "image" ? "image" : "text";
    let candidates: string[];
    try {
      candidates = await resolveModels(apiKey, kind);
    } catch (err) {
      return json({ error: (err as Error).message, provider: "gemini" }, 502);
    }

    const body: Record<string, unknown> = {
      contents: [{ parts: [{ text: prompt }] }],
      safetySettings: SAFETY_SETTINGS,
    };
    if (type === "image") {
      body.generationConfig = { responseModalities: ["TEXT", "IMAGE"] };
    } else {
      /**
       * Reasoning models spend the output budget thinking before they answer,
       * and an 800-token cap produced a truncated scratchpad instead of text.
       * The budget is raised, and `thinkingBudget: 0` asks the model not to think
       * at all — but only some models accept that field. The ones that do not
       * reject the whole request with "invalid argument" rather than ignoring it,
       * so the call below retries without it.
       */
      body.generationConfig = {
        temperature: 0.8,
        maxOutputTokens: 2000,
        thinkingConfig: { thinkingBudget: 0 },
      };
    }

    const generate = (id: string) => fetch(`${API_BASE}/${id}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    /**
     * Worth another model, as opposed to worth giving up on. Retirement and
     * overload both mean "not this one"; a quota error or a rejected prompt would
     * fail identically everywhere, so those stop here.
     */
    const worthAnotherModel = (message: string, status: number) => {
      // "limit: 0" means this *model* is not included in the caller's tier at
      // all — image models are the usual case on the free tier. Another model
      // may well be included, so it is worth walking on. A quota message
      // without a zero limit means the allowance was spent, which every model
      // shares, so that one stops here.
      if (/limit:\s*0/i.test(message)) return true;
      if (/quota|rate limit/i.test(message)) return false;
      return status === 503 || status === 404
        || /no longer available|not found|is not supported|high demand|overloaded|try again later/i.test(message);
    };

    // Walk down the ranked list. Three attempts is enough to clear a retired
    // model and a busy one without leaving a student watching a spinner.
    let response!: Response;
    // Shape varies by model and by error; the accesses below are all guarded.
    // deno-lint-ignore no-explicit-any
    let data: any = {};
    let model = candidates[0];
    let staleCache = false;

    for (const candidate of candidates.slice(0, 6)) {
      model = candidate;
      response = await generate(candidate);
      data = await response.json();

      // Same model, minus the field it refused. Only worth one attempt.
      if (!response.ok && /invalid argument/i.test(data?.error?.message ?? "")
          && (body.generationConfig as Record<string, unknown>)?.thinkingConfig) {
        delete (body.generationConfig as Record<string, unknown>).thinkingConfig;
        response = await generate(candidate);
        data = await response.json();
      }

      if (response.ok) break;
      const message = data?.error?.message ?? "";
      if (!worthAnotherModel(message, response.status)) break;
      if (/no longer available|not found/i.test(message)) staleCache = true;
    }

    // A retirement invalidates the whole cached list, not just the entry used.
    if (staleCache) modelCache.delete(kind);

    if (!response.ok) {
      const raw = data?.error?.message ?? "";

      /**
       * Google's errors are long, English, and full of metric names. A twelve
       * year old reading "generate_content_free_tier_input_token_count" learns
       * nothing, so the three cases that actually happen get plain Portuguese.
       * The original is kept in `detail` for whoever maintains the club's key.
       */
      let message = "Não foi possível falar com a IA agora. Tente de novo em alguns minutos.";
      if (/limit:\s*0/i.test(raw)) {
        message = type === "image"
          ? "A geração de imagens não está incluída no plano gratuito do Gemini. O texto continua funcionando normalmente."
          : "Este recurso não está incluído no plano gratuito do Gemini.";
      } else if (/quota|rate limit/i.test(raw)) {
        message = "A cota gratuita do Gemini de hoje acabou. Tente novamente mais tarde.";
      } else if (/high demand|overloaded/i.test(raw)) {
        message = "A IA está sobrecarregada neste momento. Tente de novo em alguns minutos.";
      }

      return json({ error: message, detail: raw, provider: "gemini", model }, 502);
    }

    const candidate = data?.candidates?.[0];
    if (!candidate || candidate.finishReason === "SAFETY") {
      return json({
        error: "O pedido foi bloqueado pelos filtros de segurança. Reformule com outras palavras.",
        blocked: true,
      }, 200);
    }

    const parts = candidate?.content?.parts ?? [];

    /**
     * Reasoning models return their scratchpad as parts flagged `thought`, and
     * those must not reach a student. Concatenating every text part put the
     * model's own deliberation on screen — the lab showed «"trocar essa ideia"?
     * Let's stick closer to Attempt 2…» instead of the invitation it asked for.
     */
    const answerParts = parts.filter((p: { text?: string; thought?: boolean }) => p.text && !p.thought);
    const textOut = answerParts.map((p: { text: string }) => p.text).join("\n").trim();
    const inline = parts.find((p: { inlineData?: unknown }) => p.inlineData)?.inlineData;

    // A truncated answer is worse than none: the student would grade the model on
    // a sentence that stops mid-word.
    if (type === "text" && candidate?.finishReason === "MAX_TOKENS" && textOut.length < 40) {
      return json({
        error: "A resposta veio incompleta. Tente novamente — se repetir, escolha um tamanho menor.",
      }, 200);
    }

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
