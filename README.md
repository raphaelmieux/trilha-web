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
4. Faça deploy das três Edge Functions em `supabase/functions/` (`issue-certification`,
   `admin-reset-password`, `ai-gateway`) — pelo painel ou `supabase functions deploy <nome>`.
5. Crie sua conta pelo app e promova-a a administrador rodando no SQL Editor:
   ```sql
   select promote_first_admin('seu@email.com');
   ```
   (só funciona uma vez, enquanto nenhum admin existir ainda).

Sem SMTP configurado no projeto, a recuperação de senha é feita pelo administrador
do clube (aba **Admin**), não por e-mail — ver `supabase/functions/admin-reset-password`.

## Arquitetura

```
src/
  components/
    questions/      # renderizadores de questão compartilhados (lição + prova final)
    ui/              # kit de UI mínimo (ProgressBar, StatusBadge, PageState, BadgeIcon)
  context/           # AuthContext (sessão + perfil)
  curriculum/         # conteúdo das trilhas AP034/AP035, hardcoded em TS
  hooks/              # useRequirementProgress, useCertifications, useBadges
  labs/               # 9 laboratórios interativos (WebLab, MailLab, CodeLab, ...)
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

- RLS habilitado em todas as tabelas; `user_profiles` só é legível pelo dono (+ admin);
  páginas públicas (verificação de certificado, ranking) usam as views
  `public_profiles`/`public_leaderboard`, que expõem só campos não sensíveis.
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
