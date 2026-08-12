import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// Fully self-service password reset: e-mail + security question + answer, verified
// server-side against the hash stored at registration/profile-edit time. No admin
// involvement needed for the common case of "I forgot my password".
//
// Anti-enumeration: every failure path (unknown e-mail, no security question set,
// wrong question, wrong answer) returns the exact same generic error, so a caller
// can't use this endpoint to discover which e-mails have accounts.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GENERIC_ERROR = "E-mail, pergunta ou resposta incorretos.";

function genericFailure() {
  return new Response(JSON.stringify({ error: GENERIC_ERROR }), {
    status: 400,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { email, questionCode, answerHash, newPassword } = await req.json();

    if (
      !email || typeof email !== "string" ||
      !questionCode || typeof questionCode !== "string" ||
      !answerHash || typeof answerHash !== "string" ||
      !newPassword || typeof newPassword !== "string" || newPassword.length < 6
    ) {
      return new Response(JSON.stringify({ error: "Preencha todos os campos (senha com pelo menos 6 caracteres)." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      return new Response(JSON.stringify({ error: "Erro ao processar solicitação." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase().trim());
    if (!user) return genericFailure();

    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("security_question_code, security_answer_hash")
      .eq("id", user.id)
      .maybeSingle();

    if (
      !profile?.security_question_code ||
      !profile?.security_answer_hash ||
      profile.security_question_code !== questionCode ||
      profile.security_answer_hash !== answerHash
    ) {
      return genericFailure();
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newPassword },
    );
    if (updateError) {
      return new Response(JSON.stringify({ error: "Erro ao redefinir a senha. Tente novamente." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabaseAdmin.from("activity_events").insert({
      user_id: user.id,
      event_type: "password_self_reset",
      metadata: {},
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Erro interno do servidor." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
