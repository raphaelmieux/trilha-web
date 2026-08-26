# Trilha.Web()

Plataforma de trilhas de especialidades dos Desbravadores. React 18 + TypeScript
+ Vite + Tailwind no frontend; Supabase (Postgres, Auth, Storage, Edge Functions)
atrás. Tudo sai de um push em `main`: o frontend vai para o GitHub Pages, e o
schema, as Edge Functions e os segredos delas vão pelo `supabase.yml`. Não há
passo manual nem CLI local em lugar nenhum do caminho.

O público é desbravador a partir de dez anos. Frase curta, exemplo do dia a dia
deles, e nada de conselho que ninguém segue no Brasil.

## Comandos

```bash
npm install
npm run dev        # servidor local em :5173
npm test           # vitest, ~600 testes
npm run typecheck
npm run lint
npm run build
```

Precisa de um `.env` (veja `.env.example`) com `VITE_SUPABASE_URL` e
`VITE_SUPABASE_ANON_KEY`. Os dois são valores publicáveis — já vão dentro do
pacote servido a qualquer visitante, e quem protege os dados é o RLS. A chave
`service_role` **nunca** entra aqui, nem em variável de ambiente de sessão.

Sem `.env`, o app sobe e as telas de conteúdo funcionam; o que depende de login
e de banco, não.

**O `.env` nunca entra no repositório.** Ele já está no `.gitignore`, e mesmo
assim entrou uma vez — upload pela interface do GitHub não consulta o
`.gitignore`. Pior: uma vez rastreado, a regra para de valer para ele, e todo
push seguinte o carrega em silêncio. O `ci.yml` reprova se ele voltar.

## Onde as coisas moram

- `src/curriculum/` — **o conteúdo é código**. Módulos, lições e questões em TS.
  O banco guarda identidade e progresso, nunca o conteúdo.
- `src/labs/` — os laboratórios, um arquivo por tipo (`LabType` em `src/types`).
- `src/lib/` — regras puras, testáveis sem servidor.
- `src/types/index.ts` — os tipos do domínio, escritos à mão.
- `src/types/database.ts` — **gerado**, espelha o schema. Não edite: o
  `supabase.yml` regera a cada execução e reprova se divergir, publicando o
  arquivo corrigido como artifact para você commitar.
- `supabase/migrations/` — schema e seeds, em ordem de data.
- `supabase/functions/` — Edge Functions (Deno).

## Convenções

**Mensagens de commit em inglês; comentários de código e todo texto de tela em
português.** O commit explica *por que* a mudança existe e o que estava errado
antes, não o que o diff já mostra.

Comentário explica a decisão e o que ela evita — não repete o código.

## Armadilhas que já custaram caro

**Nível não é identidade.** `level` é `'basico' | 'intermediario' | 'avancado'`,
e várias trilhas compartilham o mesmo. Quem identifica é `code`. Esse erro
apareceu em nove lugares diferentes; se você estiver escrevendo
`level === 'avancado'` para dizer "a AP035", está reintroduzindo ele.

**Nome de trilha é sempre código + nome**, por `nomeCompleto()` em `src/types`.
Nunca interpole `e.name` sozinho, nem monte o par à mão.

**Não se edita migration já aplicada.** Escreva outra, idempotente. O `db push`
roda no `supabase.yml`, sem ninguém no meio, e seleciona pelas versões ausentes
da tabela de histórico — nunca reaplica o que já consta lá. Existe **uma**
exceção documentada, no topo da `20260821230000_ap041_licoes`, e o motivo está
escrito nela: aquele arquivo nunca chegou a executar.

**Migration que não analisa derruba a fila inteira.** Um delimitador errado
(`END $;` no lugar de `END $$;`) faz o Postgres recusar o arquivo, o `db push`
para ali, e as migrations seguintes nem são lidas. Em banco que já tem histórico
não se percebe; em banco novo — restauração, staging — o resultado é um banco
pela metade. `supabase/migrations/migrations.test.ts` pega isso — mas repare que
ele vive no `ci.yml`, que corre em paralelo com o `supabase.yml`, não antes
dele. Num PR isso reprova antes do merge; num push direto em `main`, os dois
começam juntos. Num branch o `ci.yml` corre sozinho — o `supabase.yml` só
dispara em `main` —, e é a única janela em que a migration é lida sem nada
correndo para aplicá-la: escreva no branch, deixe conferir, leve para `main`
depois.

**Publicação em paralelo, não em ordem.** O frontend e o Supabase saem do mesmo
push e correm ao mesmo tempo. Quando a mudança precisa do schema primeiro —
trilha nova, coluna nova que a tela já lê — separe em dois pushes: o de
`supabase/` antes, o da tela depois. O contrário abre a trilha com laboratório
quebrado.

**Insígnia sem linha na tabela `badges` é ignorada sem erro e sem prêmio.** O
critério mora em `src/lib/insignias.ts`; a linha, na migration do catálogo. Ao
abrir trilha nova, o código nasce sozinho (`codigoDaInsigniaDaTrilha`), mas a
linha ainda é à mão — `src/lib/insignias.test.ts` cobra.

**Questão de ordenar tem uma interface só**: `ListaOrdenavel`, com arrastar e
setas. A resposta sai do campo `order`, nunca da posição no array, porque os
itens são embaralhados antes de aparecer.

**"Parecer um aplicativo" quer dizer a tela inteira.** Quando um laboratório
imita um programa, ele não é um cartão dentro da página: ocupa a tela e a
plataforma sai de cena. `LaboratorioEmTelaCheia` é a moldura que faz isso, e ela
devolve por cima o que é da plataforma — tarefas, progresso e o caminho de volta,
que sem ela ficaria só no botão voltar do navegador.

De preferência na forma que o próprio programa imitado usaria: no editor de
texto, a lista de tarefas é painel lateral, porque o Word tem painéis laterais.
No celular não cabe painel — vira bolha no canto, que recolhe. A escolha entre as
duas é do CSS, por largura.

O que a sobreposição não cobre: **barra de título e faixa de opções**. São elas
que o desbravador precisa reconhecer depois, e tapá-las para caber um aviso seria
esconder a matéria. Canto inferior e lateral são de quem sobrepõe — e quando o
programa imitado tem coisa própria colada no pé (barra de tarefas, régua de
status), o laboratório diz a altura dela em `rodape` e a cápsula sobe.

**Mais de um programa quer dizer área de trabalho, não sanfona.** O laboratório
de compactar precisa de quatro — Explorador, WinRAR, editor e Configurações —, e
empilhá-los em cartões faria um acordeão que não existe em computador nenhum.
Existe área de trabalho com janelas por cima e barra de tarefas embaixo. As peças
de janela moram em `src/labs/windows.tsx`, compartilhadas: duas cópias divergem
no primeiro ajuste, e a trilha passa a mostrar dois "Windows" diferentes.

**A janela encolhe como a de verdade encolhe.** Abaixo de 768 px o Explorador
tira o texto dos comandos, a caixa de pesquisa e as colunas do meio, e o painel
de navegação afina. Quando isso tira o único caminho até uma tarefa — ordenar por
data, que só existia no cabeçalho da coluna —, o caminho que falta é o que o
programa de verdade também tem: o menu Classificar. Reduzir a tela nunca reduz o
que dá para fazer nela.

A moldura avisa **uma vez**, no celular, que a experiência é melhor em tela
maior, e guarda a resposta. Aviso que volta a cada lição é o que ensina a pessoa
a não ler avisos.

Superfície clara dentro da moldura precisa **dizer a própria cor**: a plataforma
pinta `h1..h4` de quase branco, o que está certo num aplicativo escuro e some em
cima de painel branco.

**A simulação tem de aguentar curiosidade.** Ela é verdadeira no caminho
previsto e vira muro em todo o resto — dois cliques num .jpg respondendo "isto
abriria no programa do computador" —, e muro ensina a andar no trilho, que é o
que não existe fora daqui. Todo arquivo abre; todo passo que o programa de
verdade tem, aparece. Instalar não é um clique: é a página do produto, o
download, a permissão do sistema, o idioma, o contrato, a pasta, os atalhos e a
barra de progresso — e as escolhas valem, senão a caixinha que ninguém lê
continua não sendo lida.

**Quem trava precisa de saída.** Depois de um tempo sem ninguém concluir nada,
a moldura oferece o passo a passo da tarefa da vez, escrito em `passos`. É
convite, não despejo: quem está achando sozinho tem o direito de achar sozinho.

**O nome da lição desce do currículo.** Laboratório não escreve o próprio
título: recebe `lessonTitle`. Oito escreviam, e a lição "Montando um site de
quatro páginas" abria um cartão escrito "SiteLab — Site com quatro páginas".
`src/curriculum/titulos.test.ts` cobra.

**Editor de código não imita marca.** Word e Explorador são *aquele* programa;
editor de código não é — o desbravador pode encontrar o VS Code, o Notepad++ ou
o editor do celular. O que se repete entre os três é o arranjo, e é ele que
`src/labs/ide.tsx` desenha: lateral com os arquivos, guias, números de linha,
cores por tipo de coisa, prévia ao lado e régua de status. O realce mora em
`src/labs/realce.ts`, e o que ele devolve vai para a página como HTML — por
isso **todo texto passa por `escapar` antes de sair**, sem exceção.

Vale para laboratório que imita um programa. Os que não imitam nada — ordenar,
classificar, escrever — continuam sendo tela da plataforma, e moldura de
aplicativo neles seria fantasia sem ganho.

**Link externo é sempre `<a target="_blank">`**, pelo componente `LinkExterno`.
`window.open` funciona no computador e falha no celular.

**`select('*')` engole coluna que divide nome com função do schema.** Existe uma
função `is_admin()`, e o supabase-js lê nome de função como campo computado —
que só entra quando pedido. O `*` devolvia a linha inteira **menos** `is_admin`,
justamente o campo que libera o painel administrativo. O banco nunca errou: quem
parou de saber da coluna foi o compilador. Nomeie as colunas que a tela usa —
resolve isso e para de arrastar `security_answer_hash` para o navegador.

**Forma que vai para coluna jsonb é `type`, nunca `interface`.** O TypeScript só
dá index signature implícita a apelido de tipo, então a mesma forma é aceita
como `type` e recusada por `Json` como `interface`. Trocar de volta parece
inofensivo e quebra a gravação do rascunho. Está anotado em `ConferenciaEtapa`,
`RespostaEtapa` e `ParDeLigar`.

**Texto do banco vira união do domínio por `umDe`, nunca por `as`.** Não há enum
no Postgres aqui: `public_name_form`, `status`, `level` e `tier` são `text` com
CHECK, e chegam como `string`. `umDe` confere contra a lista e reclama no
console quando não reconhece. **O padrão sempre cai para o lado que reivindica
menos** — `'anonymous'`, `'revoked'`, `'basico'`, `'not_started'`. A assimetria é
o ponto: exibir como válido um certificado cujo estado não se conseguiu ler é
afirmar o que não foi conferido.

## O que os testes cobram do currículo

`src/curriculum/qualidade.test.ts` reprova a build quando:

- a alternativa correta é sistematicamente a mais comprida (é a estratégia de
  quem não estudou);
- alguma alternativa errada não diz *por que* está errada (campo `porque`);
- a alternativa certa carrega `porque`;
- questão de ordenar traz o ano do próprio evento, ou numera fora de 1..n;
- verdadeiro/falso pende demais para um lado.

Questão nova: a definição vale uma vez. Depois dela vêm as que medem
entendimento — consequência, discriminação entre o que se confunde, e
diagnóstico. Cobrar melhor não é usar palavra difícil.

## As outras travas

Quase todas nasceram de um erro que já aconteceu. Se uma delas reprovar, ela
está fazendo o trabalho dela — leia a mensagem antes de contorná-la. O `ci.yml`
roda em push de qualquer branch, então elas te encontram antes de existir PR.

| Onde | O que reprova |
| --- | --- |
| `supabase/migrations/migrations.test.ts` | migration que não fecha um bloco que abre; timestamp repetido |
| `src/lib/certificados.test.ts` | o padrão de um certificado ilegível — inverter para `'active'` reprova |
| `src/lib/insignias.test.ts` | insígnia com critério no código e sem linha no catálogo |
| `ci.yml` | `.env` rastreado pelo git |
| `supabase.yml` | `src/types/database.ts` divergente do schema; função no repo que o workflow não publica; `Confirm email` religado no painel |

No `supabase.yml`, a checagem dos tipos e a do `Confirm email` rodam **depois**
dos deploys, de propósito: deixam a execução vermelha sem segurar o que já
estava pronto para subir. As duas foram parar ali por terem feito o contrário
uma vez.
