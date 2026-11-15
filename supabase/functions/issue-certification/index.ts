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

/**
 * Qual certificado cada trilha exige antes da sua.
 *
 * Era deduzido do grau: "avançada" pedia qualquer certificado "fundamental".
 * Enquanto a AP034 era a única fundamental, isso acertava por acidente. Com a
 * AP041 aberta, concluir Computação 1 passaria a destravar a emissão de
 * Internet, Avançado — que exige a trilha de Internet, e não outra.
 *
 * Explícito por trilha, e por código: quem não aparece aqui não depende de
 * ninguém.
 */
const PRE_REQUISITO: Record<string, string> = {
  AP035: "AP034",
};

/**
 * O Mestrado oficial que a plataforma também atesta: quais trilhas daqui
 * contam, e quantas bastam.
 *
 * A lista é a de `TRILHAS_DO_ME006` em `src/lib/mestrados.ts`, escrita aqui
 * outra vez porque a Edge Function não importa o aplicativo — e duas cópias
 * divergem no primeiro ajuste. `mestrados.test.ts` lê este arquivo e compara
 * as duas, código por código, e o mínimo junto.
 *
 * O que o certificado afirma é o que a plataforma confere: que as trilhas da
 * lista foram concluídas aqui, pelos Token.Web() ativos de cada uma. O Mestrado
 * oficial continua sendo entregue pelo clube.
 */
const MESTRADOS_OFICIAIS: Record<string, { trilhas: string[]; minimo: number }> = {
  ME006: {
    trilhas: ["AP041", "AP042", "AP043", "AP044", "AP045", "AP049", "AP052", "AP034", "AP035", "AP063", "AP064"],
    minimo: 7,
  },
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

    /*
      `tipo` diz qual percurso está sendo certificado.

      A vereda também emite Token.Web(), e o caminho dela é outro: ela não tem
      linha em `specialties` nem requisitos no banco — o conteúdo é código, e o
      que fica gravado é o percurso, em eventos de atividade. Ausente, o padrão
      é 'trilha', que é como todo chamador antigo continua funcionando.

      `veredaId` é a chave interna da vereda, e serve só para reconhecer o
      registro antigo: quem concluiu quando ela se chamava VD01 tem um evento
      com aquele código, e não perde o certificado por causa de uma renomeação
      nossa.
    */
    const { userId, specialtyCode, level, tipo, veredaId } = await req.json();

    if (!userId || !specialtyCode || !level) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ehVereda = tipo === "vereda";
    const ehMestrado = tipo === "mestrado";

    /*
      O código entra em filtro, então ele é conferido antes — e a forma é a
      mesma dos dois lados: letras, números e hífen. Um código fora disso não
      existe no currículo, e recusá-lo aqui é mais barato do que confiar.
    */
    if (!/^[A-Za-z0-9-]{3,20}$/.test(specialtyCode)) {
      return new Response(JSON.stringify({ error: "Código de percurso inválido." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (veredaId !== undefined && !/^[a-z0-9_-]{1,40}$/.test(String(veredaId))) {
      return new Response(JSON.stringify({ error: "Identificador de vereda inválido." }), {
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

    /*
      Já existe certificado DESTA trilha?

      A pergunta era feita pelo grau, e devolvia o primeiro certificado do mesmo
      grau que a pessoa tivesse. Quem já tinha o de Internet e concluísse
      Computação 1 — as duas fundamentais — receberia de volta o código da
      Internet com "Already certified", e o token de Computação 1 nunca seria
      emitido. E, com dois certificados do mesmo grau na conta, o maybeSingle()
      passaria a falhar.
    */
    const { data: existing } = await supabase
      .from("certifications")
      .select("*")
      .eq("user_id", userId)
      .eq("curriculum_code", specialtyCode)
      .eq("status", "active")
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ success: true, code: existing.code, message: "Already certified" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    /*
      ── A vereda: percurso conferido nos eventos, e não em requisitos ────────

      A trilha guarda os requisitos no banco, e é contra eles que a emissão
      confere. A vereda não guarda — "o conteúdo é código, o banco guarda
      identidade e progresso" —, então o que se confere é o evento que a
      plataforma escreve quando a última lição é vencida. É a mesma confiança
      do outro caminho: `requirement_progress` também é escrito pelo aplicativo
      da própria pessoa; o que protege os dois é a RLS, não a origem do dado.
    */
    if (ehVereda) {
      const concluiu = async (coluna: string, valor: string) => {
        const { count } = await supabase
          .from("activity_events")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .in("event_type", ["vereda_completed", "mini_trilha_completed"])
          .eq(coluna, valor);
        return (count ?? 0) > 0;
      };

      /* Pelo código de hoje ou pela chave interna: a chave é a que sobrevive à
         renomeação, e o registro antigo guarda o código de então. */
      const venceu = await concluiu("metadata->>codigo", specialtyCode)
        || (veredaId ? await concluiu("metadata->>vereda", String(veredaId)) : false);

      if (!venceu) {
        return new Response(JSON.stringify({ error: "Vereda ainda não concluída." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const code = generateCode();
      const hashInput = `${userId}:${specialtyCode}:${level}:${code}:${Date.now()}`;
      const hash = await sha256(hashInput);
      const signature = await sha256(hash + Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!.substring(0, 32));

      const { data: cert, error: certError } = await supabase
        .from("certifications")
        .insert({
          user_id: userId,
          /* Nulo de propósito: a vereda não é `Specialty`, e não ter linha em
             `specialties` é a decisão que a mantém fora do percentual e do XP. */
          specialty_id: null,
          code,
          hash,
          signature,
          level,
          curriculum_code: specialtyCode,
          curriculum_version: "1.0",
          status: "active",
        })
        .select()
        .single();

      if (certError) {
        return new Response(JSON.stringify({ error: certError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      /* O retrato do percurso: as lições vencidas, que é o que a vereda tem no
         lugar dos requisitos. Um certificado sem retrato não se audita. */
      const { data: licoes } = await supabase
        .from("activity_events")
        .select("event_type, metadata, created_at")
        .eq("user_id", userId)
        .in("event_type", ["vereda_teoria", "vereda_laboratorio"]);

      await supabase.from("certification_snapshots").insert({
        certification_id: cert.id,
        requirements_snapshot: [],
        progress_snapshot: licoes ?? [],
      });

      await supabase.from("certification_events").insert({
        certification_id: cert.id,
        event_type: "issued",
        metadata: { code, level, specialtyCode, tipo: "vereda" },
      });

      await supabase.from("activity_events").insert({
        user_id: userId,
        event_type: "certification_issued",
        metadata: { code, level, specialtyCode, tipo: "vereda" },
      });

      return new Response(JSON.stringify({ success: true, code, hash: hash.substring(0, 32) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    /*
      ── O Mestrado oficial: conferido nos Token.Web() das trilhas ─────────

      Ele não tem requisito próprio no banco nem lição: o que ele exige é ter
      concluído trilhas da lista, e a prova de cada uma é o certificado ativo
      dela. Revogado não conta — o Mestrado não pode valer mais do que as
      trilhas em que se apoia.
    */
    if (ehMestrado) {
      const mestrado = MESTRADOS_OFICIAIS[specialtyCode];
      if (!mestrado) {
        return new Response(JSON.stringify({ error: "Mestrado desconhecido." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: daLista } = await supabase
        .from("certifications")
        .select("id, code, curriculum_code")
        .eq("user_id", userId)
        .eq("status", "active")
        .in("curriculum_code", mestrado.trilhas);
      const concluidas = new Set((daLista ?? []).map((c) => c.curriculum_code));
      if (concluidas.size < mestrado.minimo) {
        return new Response(JSON.stringify({
          error: `O ${specialtyCode} pede ${mestrado.minimo} trilhas da lista concluídas; há ${concluidas.size}.`,
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const code = generateCode();
      const hashInput = `${userId}:${specialtyCode}:${level}:${code}:${Date.now()}`;
      const hash = await sha256(hashInput);
      const signature = await sha256(hash + Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!.substring(0, 32));

      const { data: cert, error: certError } = await supabase
        .from("certifications")
        .insert({
          user_id: userId,
          /* Nulo, como na vereda: o Mestrado não é `Specialty`. */
          specialty_id: null,
          code,
          hash,
          signature,
          level,
          curriculum_code: specialtyCode,
          curriculum_version: "1.0",
          status: "active",
        })
        .select()
        .single();

      if (certError) {
        return new Response(JSON.stringify({ error: certError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      /* O retrato: os certificados em que ele se apoia. */
      await supabase.from("certification_snapshots").insert({
        certification_id: cert.id,
        requirements_snapshot: [],
        progress_snapshot: daLista ?? [],
      });

      await supabase.from("certification_events").insert({
        certification_id: cert.id,
        event_type: "issued",
        metadata: { code, level, specialtyCode, tipo: "mestrado" },
      });

      await supabase.from("activity_events").insert({
        user_id: userId,
        event_type: "certification_issued",
        metadata: { code, level, specialtyCode, tipo: "mestrado" },
      });

      return new Response(JSON.stringify({ success: true, code, hash: hash.substring(0, 32) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // A trilha exigida antes desta, quando houver.
    const exigido = PRE_REQUISITO[specialtyCode];
    if (exigido) {
      const { data: anterior } = await supabase
        .from("certifications")
        .select("*")
        .eq("user_id", userId)
        .eq("curriculum_code", exigido)
        .eq("status", "active")
        .maybeSingle();

      if (!anterior) {
        return new Response(JSON.stringify({ error: `Certificação ${exigido} exigida antes desta.` }), {
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

    /* O certificado que este cita como base — o mesmo que foi exigido acima,
       e pelo mesmo código, para os dois não poderem discordar. */
    let referenceId = null;
    if (exigido) {
      const { data: anterior } = await supabase
        .from("certifications")
        .select("id")
        .eq("user_id", userId)
        .eq("curriculum_code", exigido)
        .eq("status", "active")
        .maybeSingle();
      referenceId = anterior?.id || null;
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
