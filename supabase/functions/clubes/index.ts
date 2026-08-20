import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * Club lookup against the official Adventist portal.
 *
 * The club a Pathfinder types at registration used to be free text, so
 * "Olho de Tigre", "olho de tigre" and "Clube Olho do Tigri" were three
 * different clubs as far as the platform knew — and a certificate is meant to be
 * handed to a real club's leadership.
 *
 * clubes.adventistas.org (the South American Division's own portal) drives its
 * search with three cascading endpoints. This proxies them, because they send no
 * CORS headers and a browser therefore cannot call them directly.
 *
 * Deliberately a proxy rather than a copy. Harvesting the whole directory would
 * mean thousands of requests to their server and a snapshot that silently goes
 * stale; asking one question per selection is the same load a person browsing
 * their site produces, and the answer is always current.
 */

const PORTAL = "https://clubes.adventistas.org";
const BRASIL = "1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function json(body: unknown, status = 200, cache = 0) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      ...(cache ? { "Cache-Control": `public, max-age=${cache}` } : {}),
    },
  });
}

/**
 * Warm-instance memo. States and cities are effectively immutable; clubs change
 * when one is founded or closed. An hour of staleness is invisible to a student
 * and removes almost all of the load this places on the portal.
 */
const cache = new Map<string, { at: number; data: unknown }>();
const TTL_MS = 60 * 60 * 1000;

async function askPortal(endpoint: string, body: Record<string, string>): Promise<string> {
  const response = await fetch(`${PORTAL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      // The portal answers 403 to a bare client; it is checking for a browser.
      "User-Agent": "Mozilla/5.0 (compatible; Trilha.Web/1.0; +https://raphaelmieux.github.io/trilha-web/)",
      "Referer": `${PORTAL}/br/`,
    },
    body: new URLSearchParams(body).toString(),
  });
  if (!response.ok) throw new Error(`portal respondeu ${response.status}`);
  return await response.text();
}

interface Option { cod: string; nome: string }

/** The endpoints answer with a fragment of <option> tags, not with data. */
function parseOptions(html: string): Option[] {
  const out: Option[] = [];
  for (const m of html.matchAll(/<option\s+value\s*=\s*'?"?(\d+)'?"?\s*>([^<]*)<\/option>/gi)) {
    const cod = m[1];
    const nome = decodeEntities(m[2]).trim();
    // value 0 is the "SELECIONE…" placeholder.
    if (cod === "0" || !nome) continue;
    out.push({ cod, nome });
  }
  return out;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&nbsp;/g, " ");
}

export interface Clube {
  cod: string;
  nome: string;
  associacao: string;
}

/**
 * The portal lists both ministries in one dropdown, formatted
 * "DESBRAVADORES | NOME - ASSOCIAÇÃO". Aventureiros serve ages 6 to 9 and this
 * platform is for the 10-to-15 specialties, so a club of theirs appearing here
 * would be an invitation to register the wrong one.
 */
function parseClubes(html: string): Clube[] {
  return parseOptions(html)
    .filter(o => o.nome.toUpperCase().startsWith("DESBRAVADORES"))
    .map(o => {
      const semTipo = o.nome.slice(o.nome.indexOf("|") + 1).trim();
      const corte = semTipo.lastIndexOf(" - ");
      return corte === -1
        ? { cod: o.cod, nome: semTipo, associacao: "" }
        : { cod: o.cod, nome: semTipo.slice(0, corte).trim(), associacao: semTipo.slice(corte + 3).trim() };
    })
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const nivel = url.searchParams.get("nivel");
    const chave = url.search;

    const memo = cache.get(chave);
    if (memo && Date.now() - memo.at < TTL_MS) return json(memo.data, 200, 3600);

    let data: unknown;

    if (nivel === "estados") {
      data = parseOptions(await askPortal("busca_estado.php", { cod_pais: BRASIL }));
    } else if (nivel === "cidades") {
      const estado = url.searchParams.get("estado");
      if (!estado || !/^\d+$/.test(estado)) return json({ error: "Informe o estado." }, 400);
      data = parseOptions(await askPortal("busca_cidade.php", { cod_estado: estado }));
    } else if (nivel === "clubes") {
      const cidade = url.searchParams.get("cidade");
      if (!cidade || !/^\d+$/.test(cidade)) return json({ error: "Informe a cidade." }, 400);
      data = parseClubes(await askPortal("busca_clube.php", { cod_cidade: cidade }));
    } else {
      return json({ error: "Use nivel=estados, cidades ou clubes." }, 400);
    }

    cache.set(chave, { at: Date.now(), data });
    return json(data, 200, 3600);
  } catch (err) {
    // The portal being down must not block a registration.
    return json({
      error: "Não foi possível consultar a lista oficial de clubes agora.",
      detail: (err as Error).message,
      indisponivel: true,
    }, 503);
  }
});
