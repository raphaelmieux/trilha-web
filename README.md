# Trilha.Web()

Plataforma de trilha de especialidades para Desbravadores — **Líder Máster (AP034)**
e **Líder Máster Avançado (AP035)**. Aulas teóricas, laboratórios interativos
(navegador, e-mail, editor de código, imagens, site, IA), acompanhamento de
progresso com XP/sequência/badges, ranking opcional e emissão/verificação pública
de certificado (Token.Web()).

## Stack

- [React](https://react.dev) + TypeScript + [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase](https://supabase.com) (Postgres + Auth + Storage + Edge Functions)

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencha com as credenciais do seu projeto Supabase
npm run dev
```

Outros comandos úteis:

```bash
npm run typecheck   # TypeScript, sem emitir arquivos
npm run lint         # ESLint
npm test             # Vitest
npm run build        # build de produção em dist/
```

## Configurando o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Em **Project Settings → API**, copie a `URL` e a `anon key` para o seu `.env`.
3. Aplique as migrations em `supabase/migrations/` **na ordem em que aparecem**
   (nome do arquivo = timestamp), via SQL Editor do painel ou `supabase db push`
   se estiver usando a [Supabase CLI](https://supabase.com/docs/guides/cli).
4. Faça deploy das cinco Edge Functions em `supabase/functions/` (`issue-certification`,
   `admin-reset-password`, `self-reset-password`,
   `clubes`, `ai-gateway`) — pelo painel ou `supabase functions deploy <nome>`.
5. Em **Authentication**, na página de configurações gerais, **desligue `Confirm email`**
   (o campo `MAILER_AUTOCONFIRM` da API). Ver *Confirmação de e-mail*, abaixo — sem isso
   o cadastro trava depois de poucas contas.
6. Crie sua conta pelo app e promova-a a administrador rodando no SQL Editor:
   ```sql
   select promote_first_admin('seu@email.com');
   ```
   (só funciona uma vez, enquanto nenhum admin existir ainda).

Sem SMTP configurado no projeto, a recuperação de senha é feita pelo administrador
do clube (aba **Admin**), não por e-mail — ver `supabase/functions/admin-reset-password`.

### Integração com IA

Dois laboratórios usam um modelo de linguagem, e sempre através da Edge Function
`ai-gateway` — a chave nunca chega ao navegador. Os segredos ficam em
**Project Settings → Edge Functions → Secrets**:

| Segredo | Para quê | Padrão |
| --- | --- | --- |
| `GEMINI_API_KEY` | Obrigatório para qualquer uso de IA | — |
| `AI_DAILY_LIMIT` | Gerações do laboratório de IA, por pessoa e por dia | 12 |
| `AI_REDACAO_DAILY_LIMIT` | Conferências da redação guiada, por pessoa e por dia | 60 |
| `CLOUDFLARE_ACCOUNT_ID` e `CLOUDFLARE_API_TOKEN` | Imagens, que o plano gratuito do Gemini não inclui | — |

Os dois orçamentos são contados em separado, a partir do log de auditoria:
escrever o relatório da AP041 custa cerca de nove conferências, e não pode
esgotar o laboratório de IA do mesmo dia.

**Sem `GEMINI_API_KEY` a AP041 continua completável.** A redação guiada passa a
aceitar as respostas sem conferir os fatos, e monta o texto final emendando os
parágrafos no próprio navegador; a tela diz que a conferência está desligada, em
vez de prometer uma verificação que não aconteceu. O laboratório de IA, esse sim,
fica indisponível.

### Confirmação de e-mail

`Confirm email` fica **desligado** de propósito, e religar quebra o cadastro.

O Supabase hospedado liga essa opção por padrão. Com ela ligada e sem SMTP próprio,
todo cadastro dispara um e-mail de confirmação pelo servidor compartilhado do
Supabase, que aceita poucas mensagens por hora. Esgotada a cota, todo cadastro
seguinte falha com `email rate limit exceeded` — foi o que aconteceu em 20/08/2026,
e a mensagem não tem relação aparente com a causa, o que torna o diagnóstico lento.

Ligar de volta exige um SMTP próprio (Resend, SendGrid) e, com ele, **um domínio
verificado** — o provedor não entrega para terceiros a partir de domínio não
verificado, e `raphaelmieux.github.io` não serve, porque o DNS é do GitHub.

Nada no app depende de e-mail: ele é só identificador de login, e a recuperação de
senha é por pergunta de segurança.

## Arquitetura

```
src/
  components/
    questions/      # renderizadores de questão compartilhados (lição + prova final)
    ui/              # kit de UI mínimo (ProgressBar, StatusBadge, PageState, BadgeIcon)
  context/           # AuthContext (sessão + perfil)
  curriculum/         # conteúdo das trilhas AP034/AP035/AP041, hardcoded em TS
  hooks/              # useRequirementProgress, useCertifications, useBadges
  labs/               # 14 laboratórios interativos (WebLab, MailLab, CodeLab, ...)
  lib/                # supabase client, progress.ts, gamification.ts, checkAnswer
  pages/              # uma página por rota
supabase/
  functions/          # Edge Functions (Deno) — certificação, reset de senha, IA
  migrations/         # schema SQL, em ordem cronológica
```

O currículo (módulos, lições, perguntas) é definido em código (`src/curriculum/`),
não no banco — o Supabase guarda apenas identidade, progresso, certificações e
gamificação por usuário. As tabelas `specialties`/`requirements`/`lessons` existem
só para resolver IDs usados nas tabelas de progresso.

## Segurança

- RLS habilitado em todas as tabelas; `user_profiles` só é legível pelo dono (+ admin).
  As páginas públicas não leem tabela nenhuma diretamente: a verificação de
  certificado chama `verify_certificate(codigo)`, que devolve um único registro e
  não permite listar, e o ranking chama `leaderboard(periodo)`, que só inclui quem
  optou por aparecer. `certifications` não é mais legível por `anon`.
- Emissão de certificado (`issue-certification`) exige o JWT do usuário autenticado e
  valida que todos os requisitos da especialidade foram concluídos — nunca é inserida
  diretamente pelo cliente.
- Redefinição de senha (`admin-reset-password`) exige que o chamador seja um admin
  verificado no servidor, não confia em nenhum dado enviado pelo cliente para isso.

## Deploy

Publicado no GitHub Pages via `.github/workflows/deploy.yml`, a cada push em `main`.
Configure os secrets do repositório (`Settings → Secrets and variables → Actions`):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

E habilite Pages em `Settings → Pages → Source: GitHub Actions`.

## Licença

[MIT](LICENSE)
