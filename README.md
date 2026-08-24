# Trilha.Web()

Plataforma de trilhas de especialidades dos Desbravadores. Três abertas —
**AP034 Internet**, **AP035 Internet, Avançado** e **AP041 Computação 1** — e a
família de Computação anunciada até a AP045. Aulas teóricas, laboratórios
interativos (navegador, e-mail, editor de código, imagens, site, arquivos, IA),
acompanhamento de progresso com XP, sequência e 57 insígnias, ranking opcional e
certificado (Token.Web()) privado, conferível por código.

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
3. Aponte `PROJECT_REF`, em `.github/workflows/supabase.yml`, para o seu projeto,
   e preencha os secrets do repositório (ver *Deploy*). O schema e as cinco Edge
   Functions passam a ser publicados de lá — não há passo à mão nem CLI local.
   Para semear um projeto novo, execute o workflow pela aba **Actions**.
4. À mão, se preferir: aplique `supabase/migrations/` no SQL Editor **na ordem em
   que aparecem** (nome do arquivo = timestamp) e publique as funções de
   `supabase/functions/` pelo painel. `clubes` tem que ficar com a verificação de
   JWT **desligada** — é chamada no cadastro, antes de existir sessão.
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
**Project Settings → Edge Functions → Secrets**, e podem também ser mantidos como
secrets do repositório, de onde `supabase.yml` os escreve no projeto a cada
deploy (ver *Deploy*):

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
  curriculum/         # conteúdo das trilhas, em TS (ap041/ tem um arquivo por módulo)
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

Tudo o que chega em produção sai de um push em `main`. Nenhuma etapa exige máquina
local — o projeto pode ser conduzido inteiro pelo navegador.

| Workflow | Dispara em | O que faz |
| --- | --- | --- |
| `ci.yml` | push e PR em `main` | lint, typecheck, testes e build |
| `deploy.yml` | push em `main` | build e publicação no GitHub Pages |
| `supabase.yml` | push em `main` que toque `supabase/**` ou `src/types/database.ts` | aplica as migrations, publica as cinco Edge Functions, escreve os segredos de função, confere `src/types/database.ts` contra o schema real e verifica que `Confirm email` continua desligado |

Os dois últimos também rodam sob demanda pela aba **Actions**
(`workflow_dispatch`), o que é o caminho depois de acrescentar um secret.

Habilite Pages em `Settings → Pages → Source: GitHub Actions`.

### Secrets do repositório

Em `Settings → Secrets and variables → Actions`.

| Secret | Para quê |
| --- | --- |
| `VITE_SUPABASE_URL` | entra no pacote do navegador, no build |
| `VITE_SUPABASE_ANON_KEY` | idem — publicável; quem protege os dados é o RLS |
| `SUPABASE_ACCESS_TOKEN` | [token de conta](https://supabase.com/dashboard/account/tokens), para migrations e funções |
| `SUPABASE_DB_PASSWORD` | senha do banco do projeto |

Os segredos das Edge Functions (`GEMINI_API_KEY` e os demais de *Integração com
IA*) são opcionais aqui. Cada um só é escrito no projeto quando existe como secret
do repositório: ausente significa **"o painel manda nesse"**, nunca "apague" — um
deploy não pode derrubar a IA por causa de um secret que ninguém cadastrou aqui.

### O que ainda mora só no painel

As configurações de **Authentication** — SMTP, URLs de redirecionamento, limites de
taxa. `supabase config push` aplicaria o bloco `[auth]` inteiro, então um
`config.toml` escrito sem conhecer os valores atuais do projeto apagaria em
silêncio os que não mencionasse. O que dá para fazer com segurança daqui é
conferir: `supabase.yml` lê a Management API e reprova a execução se `Confirm
email` voltar a ficar ligado.

## Licença

[MIT](LICENSE)
