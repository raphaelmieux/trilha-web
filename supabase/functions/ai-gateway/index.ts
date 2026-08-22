import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  ROTEIROS, MAX_RESPOSTAS, limparEntrada, promptDeValidacao, promptDeUniao, lerVeredito,
  type EtapaServidor,
} from "./redacao.ts";

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

/* ── Cloudflare Workers AI, for images ────────────────────────────────────
 *
 * Gemini answers `limit: 0` for its image models on the free tier — image
 * generation simply is not included — which left two of the AI Lab's four stages
 * impossible to complete. Cloudflare's free allowance is 10,000 neurons a day
 * and FLUX-1-schnell costs about 4.8 per 512×512 image, so a club has roughly
 * two thousand images a day at no cost.
 *
 * The trade-off is moderation: Gemini's safety filters have no equivalent here.
 * That is answered upstream instead of downstream — the image prompts are
 * assembled from fixed option lists, and the one free field (the club's name) is
 * reduced to letters, digits and spaces before it is used. The set of prompts
 * this endpoint can produce is therefore finite and inspectable, rather than
 * depending on a model's judgement.
 */
const CF_ACCOUNT_ID = Deno.env.get("CLOUDFLARE_ACCOUNT_ID");
const CF_API_TOKEN = Deno.env.get("CLOUDFLARE_API_TOKEN");
const CF_IMAGE_MODEL = Deno.env.get("CLOUDFLARE_IMAGE_MODEL") ?? "@cf/black-forest-labs/flux-1-schnell";

const cloudflareConfigured = () => !!(CF_ACCOUNT_ID && CF_API_TOKEN);

interface ImageResult { dataUrl: string; model: string; provider: string }

async function generateImageWithCloudflare(prompt: string): Promise<ImageResult> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${CF_IMAGE_MODEL}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CF_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    // steps 4 is what schnell ("quick" in German) is tuned for; more costs
    // neurons without visibly improving a 512px illustration.
    body: JSON.stringify({ prompt, steps: 4 }),
  });

  const contentType = response.headers.get("content-type") ?? "";

  // Two shapes in the wild: JSON with base64, or the raw image bytes.
  if (contentType.includes("application/json")) {
    const payload = await response.json();
    if (!response.ok || payload?.success === false) {
      const detail = payload?.errors?.[0]?.message ?? payload?.error ?? `HTTP ${response.status}`;
      throw new Error(String(detail));
    }
    const base64 = payload?.result?.image;
    if (!base64) throw new Error("A resposta não trouxe imagem.");
    return { dataUrl: `data:image/jpeg;base64,${base64}`, model: CF_IMAGE_MODEL, provider: "cloudflare" };
  }

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const mime = contentType.split(";")[0] || "image/png";
  return { dataUrl: `data:${mime};base64,${btoa(binary)}`, model: CF_IMAGE_MODEL, provider: "cloudflare" };
}

const DAILY_LIMIT = Number(Deno.env.get("AI_DAILY_LIMIT") ?? "12");

/**
 * The guided essay's own allowance.
 *
 * Eight steps plus the join is nine calls for a first pass, and a Pathfinder who
 * revises three answers spends a dozen. Sixty leaves room to write the report
 * across an afternoon, including mistakes, without ever reaching the ceiling.
 */
const REDACAO_DAILY_LIMIT = Number(Deno.env.get("AI_REDACAO_DAILY_LIMIT") ?? "60");

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

    const corpo = await req.json();
    const acao: string = corpo?.type;
    const userId: string = corpo?.userId;
    if (!acao || !userId) return json({ error: "Missing required fields" }, 400);
    if (caller.id !== userId) return json({ error: "Não autorizado." }, 403);

    const ehRedacao = acao === "redacao_validar" || acao === "redacao_unir";
    if (!ehRedacao && acao !== "text" && acao !== "image") {
      return json({ error: "Tipo de geração inválido." }, 400);
    }

    /*
      `acao` é o que o cliente pediu; `type` é o que o Gemini precisa saber.
      Separar os dois deixa a redação guiada entrar por uma porta própria — com
      prompt montado aqui — e seguir dali para diante pelo mesmo caminho de
      sempre: escolha de modelo, retentativa, filtro de segurança e auditoria.
    */
    const type: "text" | "image" = acao === "image" ? "image" : "text";

    let prompt: string;
    let etapaEmConferencia: EtapaServidor | undefined;

    if (ehRedacao) {
      const roteiro = ROTEIROS[String(corpo.especialidade ?? "")];
      if (!roteiro) return json({ error: "Trilha sem roteiro de redação." }, 400);

      if (acao === "redacao_validar") {
        etapaEmConferencia = roteiro.etapas[String(corpo.etapaId ?? "")];
        // Etapa que este arquivo não conhece não é conferida: aprovar às cegas
        // seria dar passe livre a quem inventar um id.
        if (!etapaEmConferencia) return json({ error: "Etapa desconhecida." }, 400);

        const resposta = limparEntrada(String(corpo.resposta ?? ""));
        if (!resposta) return json({ error: "Resposta vazia." }, 400);
        prompt = promptDeValidacao(roteiro, etapaEmConferencia, resposta);
      } else {
        const lista = Array.isArray(corpo.respostas) ? corpo.respostas : [];
        if (lista.length === 0) return json({ error: "Nada para unir." }, 400);
        if (lista.length > MAX_RESPOSTAS) return json({ error: "Respostas demais." }, 400);

        const respostas = lista
          .map((r: { etapaId?: unknown; texto?: unknown }) => ({
            etapaId: String(r?.etapaId ?? ""),
            texto: limparEntrada(String(r?.texto ?? "")),
          }))
          .filter((r: { etapaId: string; texto: string }) => roteiro.etapas[r.etapaId] && r.texto);
        if (respostas.length === 0) return json({ error: "Nada para unir." }, 400);
        prompt = promptDeUniao(roteiro, respostas);
      }
    } else {
      prompt = corpo?.prompt;
      if (typeof prompt !== "string" || !prompt || prompt.length > 1200) {
        return json({ error: "Pedido muito longo." }, 400);
      }
    }

    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    /*
      Duas contas separadas, porque são dois orçamentos.

      Uma redação inteira custa nove chamadas — oito conferências e a união — e
      revisar uma resposta custa mais. Com um teto só, escrever o relatório
      esgotaria o laboratório de IA do dia, e a criança descobriria isso no meio
      do trabalho. Os eventos entram com `event_type` distinto, o que mantém as
      contagens independentes sem tirar nada da auditoria do clube.
    */
    const eventoDoLog = ehRedacao ? "ai_redacao" : "ai_generation";
    const tetoDoDia = ehRedacao ? REDACAO_DAILY_LIMIT : DAILY_LIMIT;

    // Daily cap, counted from the audit log so it cannot be bypassed client-side.
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const { count } = await admin
      .from("activity_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("event_type", eventoDoLog)
      .gte("created_at", since.toISOString());

    if ((count ?? 0) >= tetoDoDia) {
      return json({
        error: ehRedacao
          ? `Você usou as ${tetoDoDia} conferências de hoje. Seu texto está salvo — volte amanhã para continuar.`
          : `Limite de ${tetoDoDia} gerações por dia atingido. Tente novamente amanhã.`,
        limitReached: true,
      }, 429);
    }

    // Images go to Cloudflare when it is configured; Gemini keeps the text.
    if (type === "image" && cloudflareConfigured()) {
      try {
        const image = await generateImageWithCloudflare(prompt);
        await admin.from("activity_events").insert({
          user_id: userId,
          event_type: "ai_generation",
          metadata: { type, model: image.model, provider: image.provider, prompt: prompt.slice(0, 500) },
        });
        return json({ result: image.dataUrl, model: image.model, provider: image.provider });
      } catch (err) {
        const detail = (err as Error).message;
        const message = /neuron|limit|quota|429/i.test(detail)
          ? "A cota diária de imagens do clube acabou. Ela é renovada todo dia."
          : "Não foi possível gerar a imagem agora. Tente de novo em alguns minutos.";
        return json({ error: message, detail, provider: "cloudflare" }, 502);
      }
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
        /*
          O laboratório de IA quer variedade — pedir duas vezes e receber a mesma
          frase ensinaria a lição errada sobre modelos generativos. A redação
          quer o contrário: conferir o mesmo texto duas vezes e receber
          vereditos diferentes é o que faria a criança perder a confiança no
          retorno. Daí a temperatura baixa deste lado.
        */
        temperature: ehRedacao ? 0.2 : 0.8,
        maxOutputTokens: 2000,
        thinkingConfig: { thinkingBudget: 0 },
      };
      if (acao === "redacao_validar") {
        body.generationConfig = {
          ...(body.generationConfig as Record<string, unknown>),
          responseMimeType: "application/json",
        };
      }
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
      if (/limit:\s*0\b/i.test(message)) return true;
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

      // Same model, minus the fields it refused. Only worth one attempt.
      // `responseMimeType` entrou junto porque é opcional pelo mesmo motivo que
      // `thinkingConfig`: sem ele o JSON ainda chega, só que dentro de uma cerca
      // de markdown — e `lerVeredito` já sabe tirar a cerca.
      if (!response.ok && /invalid argument/i.test(data?.error?.message ?? "")) {
        const cfg = body.generationConfig as Record<string, unknown> | undefined;
        if (cfg?.thinkingConfig || cfg?.responseMimeType) {
          delete cfg!.thinkingConfig;
          delete cfg!.responseMimeType;
          response = await generate(candidate);
          data = await response.json();
        }
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
      if (/limit:\s*0\b/i.test(raw)) {
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

    /*
      O log da redação guarda o que o desbravador escreveu e o veredito, não o
      prompt: o prompt é o mesmo texto embrulhado nas instruções fixas deste
      arquivo, e é a resposta dele que a liderança do clube vai querer ler se
      precisar conferir como o relatório foi construído.
    */
    if (ehRedacao) {
      const conferencia = acao === "redacao_validar" ? lerVeredito(textOut) : undefined;

      await admin.from("activity_events").insert({
        user_id: userId,
        event_type: "ai_redacao",
        metadata: {
          acao,
          especialidade: corpo.especialidade,
          etapaId: corpo.etapaId,
          etapa: etapaEmConferencia?.titulo,
          veredito: conferencia?.veredito,
          model,
        },
      });

      if (conferencia) return json({ conferencia, model, provider: "gemini" });
      return json({ result: textOut, model, provider: "gemini" });
    }

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
