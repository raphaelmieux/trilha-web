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
- `src/curriculum/veredas.ts` — o registro das veredas; o conteúdo de cada uma
  num arquivo ao lado, como `sintaxeHtml.ts`.
- `public/assets/specialties/<CODIGO>.png` — o emblema, de trilha **e** de
  vereda, na mesma pasta e pelo mesmo componente (`Emblema`).
- `public/assets/certificates/<CODIGO>.png` — o fundo do certificado.
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

**Laboratório que abre resolvido não ensina nada.** Já aconteceu duas vezes, e
das duas o erro é invisível de dentro: o painel mostra tarefas concluídas, que é
exatamente o que se espera de um laboratório funcionando.

O de desenhar imagens nascia com sigla curta, fundo transparente, contraste bom
e cinco rótulos preenchidos — bastava clicar em Baixar três vezes. O da tabela
abria com **oito das doze** verificações verdes. E o do site de quatro páginas
era o pior: **vinte e duas das vinte e seis**, porque as quatro páginas vinham
com esqueleto, título e o menu de navegação inteiro montado — e interligar as
páginas *é* o requisito, que chegava resolvido de fábrica.

Hoje só a página inicial do site traz o esqueleto, e as outras três chegam
vazias: copiar a estrutura de uma para as outras é o que se faz na vida, e é a
lição.

Por isso o modelo mora fora do componente nos dois — `src/labs/modeloInicial.ts`
e `src/labs/desafioDeHtml.ts` —, com um teste que confere item por item que ele
continua abrindo com tudo por fazer. Modelo é o que sai de quem aceita o que veio
na frente, e não o gabarito.

E tirar o andaime só é honesto se o caminho ficar: as doze verificações da tabela
não tinham passo a passo nenhum, então o desafio que mais dava trabalho era o
único em que a moldura não tinha o que oferecer a quem travasse. Modelo vazio
pede `passos` completos, e o teste cobra os dois juntos.

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

A moldura avisa **uma vez por programa imitado**, no celular, que a experiência
é melhor em tela maior, e guarda a resposta em `programa` — cada laboratório
diz qual imita, e os dois que imitam o mesmo editor avisam juntos. A lembrança
já foi uma chave só para tudo, e aí quem dispensava o aviso no Explorador
entrava no editor de código sem ser avisado, que é onde escrever pelo celular
custa mais caro. Aviso que volta a cada lição é o que ensina a pessoa a não ler
avisos; aviso que nunca mais volta é o que deixa ela se prejudicar em silêncio.

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

**Um laboratório, um assunto.** 'Deixando as imagens leves' fazia quatro
coisas: espremer foto, desenhar logo, desenhar botões e desenhar header. São
dois assuntos — escolher o que jogar fora e escolher o que pôr —, e na vida são
dois programas. Viraram dois laboratórios, os dois apontando para o mesmo
requisito oficial, que continua sendo um só no documento.

**Webapp também é aplicativo.** Vale a mesma regra dos programas de Windows: o
compressor tem divisória arrastável entre antes e depois, porque comprimir só
ensina quando dá para ver o que se perdeu; o editor de imagens tem peças na
lateral, prancheta no meio e propriedades à direita; o de IA é a conversa do
Gemini, e a avaliação crítica acontece no polegar que o próprio aplicativo tem
embaixo de cada resposta — não num formulário da plataforma logo abaixo.

**No editor de código, a linha quebra — e a régua quebra junto.** Não quebrava,
e uma linha de `<img src="..." alt="...">` saía pela direita: no computador dava
para rolar de lado, no celular o desbravador escrevia às cegas o que já não
cabia. Quebrar custa a régua, porque uma coluna de alturas fixas ao lado
desalinha na primeira quebra — então cada linha lógica virou uma faixa de
grade, número numa célula e código na outra, e a faixa cresce com o que contém.
A faixa que continua uma linha não recebe número, e é por aí que se lê que ela é
continuação.

A continuação começa na margem, sem herdar o recuo: `<textarea>` é um bloco só,
e recuo pendente por linha não existe nele — se o realce recuasse e o campo não,
o cursor deixaria de cair em cima da letra que a pessoa vê. **Tab recua** dois
espaços, Enter repete o recuo da linha anterior e abre miolo entre uma tag e o
fechamento dela; **Esc sai do campo**, senão o Tab capturado prende quem navega
por teclado. Tudo escrito por `execCommand('insertText')`, obsoleto e ainda
assim o único jeito de não zerar o Ctrl+Z.

**Código escrito é trabalho de horas, e mora no navegador até a entrega.** Os
dois laboratórios de HTML gravam por `useRascunhoLocal` a cada pausa e na hora
em que a página some — recarregar sem querer apagava tudo, e quem perde meia
hora de trabalho não recomeça: desiste. Ao voltar, a tela **diz** que voltou,
porque encontrar o próprio texto sem explicação assusta mais do que ajuda. Na
entrega o rascunho é descartado: o computador do clube costuma ser de todo
mundo.

**Zero link não é zero link quebrado.** A verificação "sem links quebrados"
passava num site em que ninguém tinha escrito link nenhum — nada quebrado
porque nada existia. Numa lista de tarefas isso é uma tarefa verde de graça.
Toda verificação que pode ser satisfeita pelo vazio precisa exigir que algo
exista primeiro.

**Vereda é percurso curto que vale sozinho.** Vereda é o caminho estreito que
sai da trilha principal, e é isso que ela é: nasce de uma trilha completa e se
solta dela — a sintaxe do HTML saiu da AP035 porque quem escreve HTML precisa
dela, tenha ou não feito a especialidade de Internet; presa ali, só quem
estivesse naquela trilha a encontraria. Chamou-se "mini-trilha" por uma hora,
nome que dizia o tamanho e não dizia o que a coisa é.

**Tem a forma de uma trilha, e não o peso dela.** Módulos, cada um com uma
lição de teoria e um laboratório a vencer, e progresso à vista — porque é assim
que o desbravador já sabe percorrer uma coisa aqui, e inventar uma segunda
gramática de percurso só para o material curto seria pedir que ele aprendesse
duas. O que ela não tem é requisito oficial, nota, ou entrada em percentual
nenhum. É **bônus**: rende insígnia e uma seção própria no relatório.

**Não vira uma `Specialty`**, e é decisão, não preguiça: uma especialidade
precisa de linha em `specialties`, `modules`, `lessons` e `requirements` para
gravar progresso, e a partir daí entra no percentual, na família do painel, no
XP e nas insígnias de trilha — o contrário de bônus. O progresso da vereda sai
de eventos de atividade, que é onde as insígnias já procuram tudo.

A vereda aparece no painel como **último bloco de cursos, antes das
certificações** — junto dos percursos, porque é um; depois deles, porque é o
extra. Ficou uma vez no pé da página, atrás do mural de atividade, onde
ninguém procura curso.

**A lição de teoria da vereda é uma lição da plataforma**, e não um leitor.
Abria em tela cheia, escura, com sumário e setas, e se vencia rolando até o
fim — a pessoa entrava numa coisa que não se parecia com nenhuma lição daqui, e
o que a conclusão media era rolagem. Hoje é `TeoriaDaVereda`: o conteúdo
primeiro, as questões depois, o mesmo `QuestionRenderer` da trilha, e o mesmo
`LIMIAR_DOMINIO` para vencer.

`LeitorDeVereda` continua existindo como **referência**, por cima do editor
pelo ícone de livro, e não grava nada. Os dois desenham o mesmo conteúdo:
referência que diverge do que o laboratório mostra é pior do que referência
nenhuma. Cada exemplo roda num iframe sem `allow-scripts`, e o realce sai do
mesmo `realce.ts` do editor.

**A marca da lição é a mesma na trilha e na vereda.** `MarcaDaLicao` — um disco
com o ícone do tipo — nasceu na vereda e virou padrão. A trilha mostrava quatro
ícones soltos que só diziam feito/não feito: play não é teoria, estrela não é
laboratório, e o mesmo triângulo servia para tudo o que faltava. Agora o
**ícone diz o tipo** e o **disco diz o estado**.

O laboratório é o mesmo editor da trilha — as peças saem de `ide.tsx` —, e o
que ele cobra é uma lista de ids de `htmlValidator` escrita na lição. Assim um
laboratório novo é uma lista, e não uma tela.

**Lição vencida é um evento, e não tabela nova.** `vereda_teoria` e
`vereda_laboratorio` gravam cada lição na primeira vez; a vereda está concluída
quando todas apareceram — a teoria respondida **e** os laboratórios feitos. Fica no servidor, e não no navegador, porque quem lê
metade no celular e metade no computador do clube nunca chegaria ao fim se cada
aparelho contasse a sua metade. O mural de Atividade Recente não mostra o
evento de tópico: vinte e dois deles viraria o registro de rolagem de página de
alguém.

O registro antigo continua sendo **lido**: os nomes de quando a vereda se
chamava mini-trilha, e a regra de quando abrir todos os tópicos vencia a
teoria. Nada novo entra por esses caminhos — o evento de tópico deixou de ser
escrito —, mas quem percorreu a vereda antes não perde o que fez. Uma decisão
nossa não se cobra de quem já andou.

**Vereda tem os campos de uma trilha, e o cartão de uma trilha.** `code`,
`name`, `familia`, `description`, `emConstrucao` — os mesmos nomes de
`Specialty`, para que `nomeCompleto` sirva aos dois e o cartão seja o mesmo
cartão. Quem aprendeu a ler o de uma trilha não deveria ter de aprender outro.

**O `id` da vereda é interno e nunca muda.** É por ele que a insígnia se chama
e que os eventos de percurso são gravados; o `code` da tela pode ser renomeado
— o da vereda de HTML já foi, de `VD01` para `CC-FE001` — sem que ninguém
perca o que percorreu. Por isso a de HTML ainda tem `id: 'html'` e insígnia
`vereda_html`.

**Vereda anunciada tem zero lições, e zero de zero é tudo.** As trinta e uma
por escrever apareciam concluídas para todo mundo, com insígnia, porque
"vencidas === total" é verdade quando os dois são zero. `veredasConcluidas`
exige que exista lição, e só olha para `veredasAbertas()` — a mesma armadilha
do "zero link não é zero link quebrado". As travas de conteúdo e a de insígnia
também só valem para as abertas: semear insígnia de percurso que não existe é
prometer prêmio por nada.

**Para acrescentar uma vereda:** os módulos num arquivo como `sintaxeHtml.ts`,
a entrada em `VEREDAS` com o código dela, e a linha da insígnia
(`vereda_<id>`) numa migration nova — `insignias.test.ts` cobra, e só depois
que ela deixa de ser `emConstrucao`. A arte vai em
`public/assets/specialties/<CODIGO>.png` e o fundo do certificado em
`public/assets/certificates/<CODIGO>.png`; `veredas.test.ts` cobra as duas. `veredas.test.ts` reprova laboratório que abra com verificação
já verde, verificação sem passo a passo, e módulo que repita o próprio nome
numa lição.

As questões da vereda passam pelas mesmas travas das provas: `qualidade.test.ts`
as inclui, então alternativa errada sem `porque`, correta sistematicamente mais
comprida e pergunta repetida reprovam ali também.

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

E a definição vale uma vez **na prova inteira**. A AP035 perguntava "O que é
Inteligência Artificial generativa?" e, sete questões depois, "O que é IA
generativa?" — mesmas alternativas, mesma explicação. Quem sabia uma acertava
duas, e a nota deixava de dizer o que dizia. O teste compara enunciados depois
de normalizar as siglas, e compara também a alternativa correta, que é o que a
repetição de fato entrega.

## As outras travas

Quase todas nasceram de um erro que já aconteceu. Se uma delas reprovar, ela
está fazendo o trabalho dela — leia a mensagem antes de contorná-la. O `ci.yml`
roda em push de qualquer branch, então elas te encontram antes de existir PR.

| Onde | O que reprova |
| --- | --- |
| `supabase/migrations/migrations.test.ts` | migration que não fecha um bloco que abre; timestamp repetido |
| `src/lib/certificados.test.ts` | o padrão de um certificado ilegível — inverter para `'active'` reprova |
| `src/lib/insignias.test.ts` | insígnia com critério no código e sem linha no catálogo |
| `src/labs/modeloInicial.test.ts` | laboratório de imagens que abre já atendendo ao requisito |
| `src/labs/desafioDeHtml.test.ts` | desafio de HTML que abre com verificação já verde, ou sem passo a passo |
| `src/lib/veredas.test.ts` | laboratório de vereda que abre resolvido, sem passo a passo, ou vereda sem emblema e sem certificado |
| `src/curriculum/qualidade.test.ts` | duas questões da mesma prova com o mesmo enunciado ou a mesma resposta certa |
| `ci.yml` | `.env` rastreado pelo git |
| `supabase.yml` | `src/types/database.ts` divergente do schema; função no repo que o workflow não publica; `Confirm email` religado no painel |

No `supabase.yml`, a checagem dos tipos e a do `Confirm email` rodam **depois**
dos deploys, de propósito: deixam a execução vermelha sem segurar o que já
estava pronto para subir. As duas foram parar ali por terem feito o contrário
uma vez.
