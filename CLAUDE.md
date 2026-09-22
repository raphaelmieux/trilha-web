# Trilha.Web()

Plataforma de trilhas de especialidades dos Desbravadores. React 18 + TypeScript
+ Vite + Tailwind no frontend; Supabase (Postgres, Auth, Storage, Edge Functions)
atrás. Tudo sai de um push em `main`: o frontend vai para o GitHub Pages, e o
schema, as Edge Functions e os segredos delas vão pelo `supabase.yml`. Não há
passo manual nem CLI local em lugar nenhum do caminho.

O público é desbravador a partir de dez anos. Frase curta, exemplo do dia a dia
deles, e nada de conselho que ninguém segue no Brasil.

## A licença

A plataforma é **AGPL-3.0-only**, e não MIT como nasceu. Não foi escolha de
princípio: ela embute o `scratch-gui`, que é AGPL, e a AGPL exige que o
trabalho combinado saia sob ela. A titularidade continua sendo do autor — a
licença obriga quem recebe, não quem escreveu.

O que isso cobra de nós, na prática, é uma coisa só e todo dia: a seção 13 diz
que quem usa o programa **pela rede** precisa ter como obter a fonte
correspondente. É o `CodigoFonte`, no rodapé de toda tela, montado em `App` e
não em cada página — página que esquecesse o link seria tela servida sem
cumprir a licença.

E cobra uma coisa de cada dependência nova: ela precisa ser compatível com
AGPL. MIT, BSD e Apache-2.0 entram; licença proprietária, não.

## Como o trabalho fecha

**PR verde entra sozinho.** O dono da plataforma autorizou de forma permanente:
não se pergunta se pode dar merge, dá-se. Isso vale para todo PR aberto aqui,
sempre, e não uma vez.

Verde é a condição, e não uma formalidade a contornar: merge só depois de o
`ci.yml` fechar em sucesso no commit que está no topo do PR, e só com o PR
sem conflito. PR vermelho ou conflitado é trabalho, não é decisão a tomar —
conserta-se e então entra. Autorização para dar merge não é autorização para
dar merge no que está quebrado.

Depois do merge: acompanhar o `deploy.yml` e, quando a mudança mexeu em
`supabase/`, o `supabase.yml`. Publicar e não olhar o resultado é entregar
pela metade.

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

- `public/curriculum files/` — **os requisitos oficiais, em PDF, um por trilha e
  um para as veredas**. É daqui que sai toda trilha e toda vereda, anunciada ou
  não: os módulos, as lições e os laboratórios se constroem sobre esta lista, e
  nada além dela. Trilha nova que ainda não esteja aqui vai ser posta aqui — não
  se procura o documento em outro lugar, e muito menos se inventa a ementa: os
  títulos gravados no banco são os que o relatório entregue ao clube cita como
  oficiais, e `requisitosOficiais.test.ts` vigia essa coincidência.
- `src/curriculum/` — **o conteúdo é código**. Módulos, lições e questões em TS.
  O banco guarda identidade e progresso, nunca o conteúdo.
- `src/labs/` — os laboratórios, um arquivo por tipo (`LabType` em `src/types`).
- `src/curriculum/veredas.ts` — o registro das veredas; o conteúdo de cada uma
  num arquivo ao lado, como `sintaxeHtml.ts`.
- `public/assets/specialties/<CODIGO>.png` — o emblema, de trilha **e** de
  vereda, na mesma pasta e pelo mesmo componente (`Emblema`).
- `public/assets/certificates/<CODIGO>.png` — o fundo do certificado.

  **Estas duas pastas são a fonte da verdade da arte.** Quando alguém disser
  que a arte foi acrescentada, atualizada ou retirada, é aqui que se olha — e
  só aqui. Repare no nome: `specialties`, sem o "i" de *specialities*, que é o
  erro de digitação que manda procurar numa pasta que não existe.

  **Não há dicionário ligando código a arquivo, e é decisão.** O caminho é
  montado a partir do `code` em três lugares — `Emblema`, `CertificateCanvas`
  e `pdf.ts` —, então arte nova não pede alteração de código nenhuma: basta o
  arquivo estar na pasta com o nome do percurso. O que se confere depois de uma
  leva nova é outra coisa: se todo percurso registrado tem as duas imagens, se
  a forma de cada uma bate com o tipo, e se não sobrou arte sem percurso.
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

**`ON CONFLICT` cita a restrição que existe, e não a que faria sentido.**
`modules` tem `UNIQUE(specialty_id, code)`; `requirements` tem `UNIQUE` só em
`code`. Escrever `ON CONFLICT (specialty_id, code)` para requirements parece
simétrico, compila em lugar nenhum — SQL não compila — e o Postgres recusa com
"there is no unique or exclusion constraint matching the ON CONFLICT
specification". Como o corpo do seed é um bloco DO inteiro, que é uma instrução
só, nada entra: a trilha inteira fica de fora e o `db push` para ali.

É irmã do delimitador errado, e pior pelo mesmo motivo: o `ci.yml` não fala com
banco nenhum, então o erro só aparece quando o `supabase.yml` corre — depois do
merge, em `main`. `migrations.test.ts` passou a ler as restrições UNIQUE
declaradas nas próprias migrations e a conferir toda cláusula contra elas, sem
subir Postgres.

**Publicação em paralelo, não em ordem.** O frontend e o Supabase saem do mesmo
push e correm ao mesmo tempo. Quando a mudança precisa do schema primeiro —
trilha nova, coluna nova que a tela já lê — separe em dois pushes: o de
`supabase/` antes, o da tela depois. O contrário abre a trilha com laboratório
quebrado.

**Insígnia sem linha na tabela `badges` é ignorada sem erro e sem prêmio.** O
critério mora em `src/lib/insignias.ts`; a linha, na migration do catálogo. Ao
abrir trilha nova, o código nasce sozinho (`codigoDaInsigniaDaTrilha`), mas a
linha ainda é à mão — `src/lib/insignias.test.ts` cobra.

**Número guardado não responde por "hoje".** A ofensiva — dias seguidos de
atividade — ficou meses parada em "2 dias", e não era conta errada: era conta
que ninguém refazia. `enrollments.streak_days` era escrita na hora da
atividade e lida na tela, e número guardado só muda quando alguém o muda, então
quem parava de estudar continuava vendo a ofensiva do último dia em que
estudou, para sempre. Nada disso estoura: o contador mostra um número
plausível, que é o que se espera de um contador funcionando.

Zerar pedia alguém rodando à meia-noite, e não há onde — o frontend é estático
no Pages e não existe agendador neste Supabase. Hoje ela se **deriva na
leitura**, em `src/lib/ofensiva.ts`, dos eventos datados que já existem.
Parar de estudar zera sozinho, sem nada rodando enquanto ninguém olha.

**A ofensiva é da pessoa, e a matrícula é da trilha.** `enrollments` tem uma
linha por trilha (`UNIQUE(user_id, specialty_id)`), então `streak_days` era a
sequência *dentro de uma trilha*, e a tela mostrava a maior entre elas. Quem
estudasse AP034 na segunda e AP042 na terça tinha duas matrículas com
sequência 1 e via **1** — dois dias seguidos contados como um. A regra é
"qualquer módulo na plataforma", e quem responde por "qualquer" é
`activity_events`, que é da pessoa.

Por tabela nenhuma nova: é a mesma decisão de "lição vencida é um evento". De
lambuja, a **vereda passou a contar** — ela não tem linha em `specialties`,
logo nunca teve matrícula onde marcar dia, e vencer a teoria de uma vereda não
mexia na ofensiva. E o histórico de quem já percorreu entra junto, porque os
eventos sempre estiveram lá.

**A virada do dia é meia-noite em Brasília, e o fuso se diz pelo nome.**
`new Date().toISOString().split('T')[0]` é o dia em **UTC**, que vira às 21h
daqui: quem estudava às 20h e voltava às 22h da mesma noite ganhava dois dias
por uma noite só, e quem estuda à noite — que é quando o clube se reúne —
vivia um dia à frente do calendário, com toda comparação a "ontem" caindo no
lugar errado. O fuso é `America/Sao_Paulo` por `Intl`, e não `-3` escrito à
mão: o Brasil acabou com o horário de verão em 2019, mas propostas de trazê-lo
de volta aparecem, e um `-3` erraria calado quatro meses por ano.

Eram **três** definições de dia na mesma base: UTC na ofensiva, o fuso do
aparelho em `diasAtivos`/`horas`/`diasDaSemana`, e nenhuma delas Brasília — as
insígnias de horário premiavam a configuração da máquina do clube. Hoje é uma
só, e `ofensiva.ts` é dona dela.

E a conta de dia é `Date.UTC`, nunca `Date.now() - 86400000`: 1º de março
menos um dia é 28 ou 29 de fevereiro, e nenhuma subtração de milissegundos
sabe disso.

**Tentativa reprovada não é módulo vencido.** O laboratório grava o evento
depois do `setCompleted`, e a teoria da vereda só chama o registro acima do
`LIMIAR_DOMINIO` — os dois só existem vencidos. A lição de trilha e a prova
final, não: elas gravam **toda** tentativa, com a nota junto. Sem o corte,
errar tudo numa lição valia um dia de ofensiva, e "completou um módulo"
passava a querer dizer "abriu e respondeu qualquer coisa", que é a
autodeclaração que a plataforma inteira evita. A nota sai da metadata que já
era gravada, então nada novo é escrito e o corte vale para o histórico.

Por causa disso o `LIMIAR_DOMINIO` saiu de `progress.ts` para
`limiarDeDominio.ts`, e continua sendo reexportado de lá. `progress.ts` importa
a conta de dia de `ofensiva.ts`, e `gamification.ts` também lê a ofensiva: as
três se fechariam em laço. Ciclo de ESM não estoura — devolve `undefined` no
meio da inicialização, e limiar `undefined` reprovaria toda lição em silêncio.

**A lista de eventos que contam existe duas vezes, e é conferida.** O painel
calcula no navegador e o ranking do clube calcula no Postgres — `leaderboard`
cruza dados de todo mundo e roda `security definer`, então a conta dele tem de
acontecer lá. `EVENTOS_DA_OFENSIVA` e `public.eventos_da_ofensiva()` são a
mesma lista em dois lugares, e duas cópias divergem no primeiro ajuste: o
clube veria dois números para a mesma pessoa na mesma tarde, nenhum com cara
de errado. `ofensiva.test.ts` lê o SQL publicado e compara nome por nome — e
lê também toda chamada de `logActivity` do repositório, cobrando que cada
evento esteja classificado como módulo vencido ou como passo do meio do
caminho (`text_saved`, `mail_sent`). Laboratório novo reprova ali até alguém
decidir de que lado ele fica; sem isso a ofensiva não andaria na lição dele e
nada mais reprovaria.

**A insígnia tem sete classes, e elas são as dos Desbravadores.** Eram bronze,
prata e ouro — escala de pódio, que não diz nada sobre percurso e não tem
degrau nenhum entre "comecei" e "terminei". Hoje são Amigo, Companheiro,
Pesquisador, Pioneiro, Excursionista, Guia e Líder: a única escala de sete que
o clube não precisa aprender, porque já sabe ordenar de cor.

**Forma e cor, e não só cor.** Cada classe tem um polígono — triângulo para
cima, triângulo para baixo, losango, pentágono, hexágono, heptágono, octógono
—, e o número de lados cresce com a classe. Cor sozinha não se lê: quem não
distingue vermelho de verde via duas insígnias idênticas, e numa estante
impressa em preto e branco ninguém via nenhuma. É o mesmo motivo de
`MarcaDaLicao` ter ícone **e** disco.

**A cor preenche a forma; o glifo vai por cima.** A composição era disco
translúcido com o glifo traçado na cor do nível, e medida contra o cartão da
plataforma — que é escuro — cinco das sete cores ficavam entre 1,1:1 e 3,0:1.
O marinho do topo media **1,10:1**, que é invisível. Com a cor no
preenchimento e o glifo em branco ou quase-preto, nenhuma classe fica abaixo
de 5,2:1. Qual dos dois se usa sai de comparar as duas contas, e não de um
limiar de luminosidade: o cinza do Pioneiro fica logo abaixo de qualquer corte
plausível e receberia branco a 2,7:1.

**O triângulo é quem manda na geometria.** As sete formas têm a mesma altura,
então o círculo inscrito do triângulo — altura sobre três — é o menor dos
sete, e é ele que decide o glifo máximo. A 61,8% da altura em diâmetro sobram
7,9%; acima de 66,7% o desenho sai pelos lados do Amigo e do Companheiro, **e
só nesses dois** — nas outras cinco continua bonito, que é o que faria ninguém
perceber. E o glifo se centra no **centro do polígono**, que no triângulo é o
centroide e não o meio da caixa: centrar na caixa o empurra para fora pela
ponta.

**"Mesmo tamanho" é o disco que a tinta ocupa, e não o fator de escala.** Os
catorze desenhos preenchem a caixa de 24 de maneiras muito diferentes — de
10,00 a 12,81 de raio, 28%. Com um fator único a chama sai visivelmente menor
que o troféu e a fileira parece desalinhada sem nenhuma conta estar errada.
Cada glifo é normalizado por `RAIO_DA_TINTA`, e o traço desfaz a escala para
os catorze saírem com a mesma espessura. Esses números são medidos fora do
repositório; trocar um ícone por outro de tamanho parecido passa pela trava, e
aí o número tem de ser remedido à mão.

**O glifo tem uma fonte só, e é a do PDF.** Havia um mapa de componentes do
lucide na tela e os traçados crus em `badgeIcons.ts` — os mesmos desenhos
escritos duas vezes. Pior: um componente do lucide renderiza um `<svg>`
inteiro, e aninhado dentro do `<g>` que escala o glifo ele abriria viewport
próprio, ignoraria a escala e jogaria o ícone no canto em tamanho fixo. Hoje
os dois lados desenham de `iconShape`.

**Toda família de conquista vai de ponta a ponta da escala.** São treze
escadas de sete degraus — requisitos, lições, módulos, laboratórios, ofensiva,
constância, sem erro, avaliações, nota máxima, trilhas, veredas, Token.Web() e
XP. Antes cada família tinha o número de marcas que coubesse, e "quinze
módulos" e "cinquenta lições" eram as duas de ouro sem custar nem de longe o
mesmo.

As escadas foram montadas **em volta dos limiares que já existiam**: 5, 10, 25
e 50 lições continuam sendo 5, 10, 25 e 50, com os mesmos códigos e os mesmos
nomes. Nenhum dos 79 códigos antigos foi aposentado — 36 degraus herdam o que
havia, 55 são novos. E o topo mira a plataforma **escrita**, e não a de hoje:
os degraus altos existem antes de serem alcançáveis de propósito, porque é o
conteúdo que vai subir até eles.

**A classe da insígnia de identidade vem da dificuldade do que ela marca.** A
trilha pelo nível dela, o laboratório pelo nível da trilha a que pertence — um
patamar abaixo, porque um laboratório é uma lição dentro dela e não pode valer
o mesmo que fechá-la —, e a vereda pelo tamanho, que é a única medida honesta
dela: vereda não tem nível, grava `'basico'` justamente para não reivindicar
grau nenhum.

**As de horário ficam fora da escala.** Coruja, Madrugador, Fim de Semana e
Semana Inteira medem **quando** se estuda, e não quanto — não são acúmulo e
não formam escada. Dar a elas uma das sete fingiria uma ordem que não existe;
inventar cinco degraus para completar a série seria inventar conquista que
ninguém pediu. Vão em círculo off-white, a forma que nenhuma classe usa.

**A estante mostra o topo de cada família, e a escada abre no clique.** Com
treze escadas, quem está adiantado tem dezenas de insígnias, e despejar todas
daria noventa e uma numa tela — o muro que os trinta e dois cartões de vereda
já foram uma vez. Na escada aberta o degrau por vencer aparece em contorno
**com a forma da classe dele**, e não como silhueta genérica: ver que o
próximo é um pentágono é o que o degrau por vencer tem a dizer.

**O catálogo em TypeScript e o banco são conferidos tupla a tupla.** O `tier`
de `insignias.ts` **nunca era lido** — a tela lê o do banco —, então os dois
divergiram em silêncio por meses: `primeira_licao` era `theory` aqui e
`footprints` na migration; `licoes_5` era `theory` aqui e `layers` lá. A trava
antiga só conferia que o **código** existia nos dois lados.
`insignias.test.ts` passou a comparar ícone e classe também.

**Apagar linha de `badges` tira insígnia da estante de alguém, e não avisa.**
`user_badges.badge_id` é `REFERENCES badges(id) ON DELETE CASCADE`: o DELETE no
catálogo leva junto toda conquista pendurada nele, sem erro e sem sinal — a
pessoa abre o perfil com uma insígnia a menos e nada explica.

Apagar é legítimo quando a insígnia foi renomeada ou dividida, que foi o caso
de `mini_html` (a vereda de HTML de quando ela se chamava mini-trilha) e
`lab_image_lab` (o laboratório de imagens antes de virar dois). O que não é
legítimo é apagar **sem antes dar a de hoje a quem tem a de ontem**, com o
`awarded_at` original — reescrever a data faria o perfil dizer que a pessoa
conquistou hoje o que conquistou no ano passado.

O destino de cada uma não foi escolha nova: `veredasConcluidas` já lê os
eventos de mini-trilha, e `LABORATORIO_DO_EVENTO` já traduz
`image_lab_completed` para `image_compress`. A migration só alcança quem não
voltou desde a mudança — `evaluateBadges` roda quando a pessoa faz alguma
coisa, e quem parou antes nunca foi reavaliado.

**Ordem de inicialização não avisa, quebra.** `INSIGNIAS` é um literal
avaliado quando o módulo carrega, e chama `classeDoLaboratorio` para cada
laboratório. Com as tabelas de classe declaradas **abaixo** dele, a chamada cai
na zona morta do `const` e o módulo inteiro estoura com "Cannot access before
initialization" — em toda tela que mostra insígnia. É a irmã do ciclo de ESM
que tirou o `LIMIAR_DOMINIO` de `progress.ts`.

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

**E é a mesma na insígnia que a lição rendeu.** O módulo de laboratório saía com
o erlenmeyer e a insígnia do mesmo laboratório com a proveta reta — dois vidros
diferentes, nada ligando um ao outro. Eram dois mapas de ícone, e dois mapas
divergem: agora é um só, `ICONE_DA_LICAO` em `components/ui/`, de onde
`MarcaDaLicao` e `BadgeIcon` tiram o desenho. Por isso o nome do ícone no
catálogo é `lab` e `theory`, e não `flask` e `book`: escolhe-se "o ícone do
laboratório", e o desenho vem atrás.

O nome do ícone também mora no banco, em `badges.icon`, semeado por migration —
e o `supabase.yml` corre em paralelo com o frontend, nunca antes. `iconeCanonico`
em `badgeIcons.ts` traduz os nomes velhos justamente por causa dessa janela, e
de quem restaura um dump antigo.

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

**Emblema de trilha é oval; o de vereda é círculo.** A arte da especialidade é
o patch que se costura na faixa, 710×558 deitado; a da vereda é um disco de
592×592. O `Emblema` travava largura e altura no mesmo número e espremia o oval
para dentro de um quadrado — a trilha saía como um círculo achatado, com o texto
do emblema estreitado junto, e ninguém tinha desenhado aquele círculo. Hoje a
proporção sai da própria imagem no `onLoad` e a moldura toma a forma dela:
`border-radius: 50%` numa caixa 1.27:1 é elipse, numa caixa 1:1 é círculo. Sem
lista de códigos por forma — arte nova, em qualquer proporção, chega certa.

O outro lado dessa decisão é que a **forma passou a ser responsabilidade do
arquivo**, e não do código. Emblema de trilha entregue quadrado não estoura
nada: é desenhado como um círculo perfeito, e o que o desbravador lê no painel é
"isto é uma vereda". O contrário também. Com quarenta e três desenhos no
repositório e mais por vir, conferir isso a olho é conferir a primeira leva e
confiar no resto — `formaDaArte.test.ts` lê o cabeçalho de cada PNG e compara a
proporção com o tipo do percurso. Ela olha só o que já chegou, porque arte é
condição para abrir e não para anunciar; quem cobra a existência do arquivo são
as travas de `index.test.ts` e `veredas.test.ts`.

O espaço reservado continua quadrado, para que as duas formas se alinhem na
mesma coluna. E o selo de estado pousa **sobre a curva, a 45°**, e não no canto
da caixa: no círculo o canto quase encosta na borda, na elipse fica longe dela.

**Cartão que anuncia um prêmio leva até ele, num clique.** O cartão da trilha
concluída mostrava "Token.Web() emitido!" num `<div>` dentro do `<Link>` do
cartão: um aviso com cara de botão, que fazia o que todo o resto do cartão faz —
abrir a trilha. Quem via o aviso clicava ali esperando o documento, chegava na
trilha, e só então achava o botão de verdade no cabeçalho. Dois cliques para o
certificado, e o primeiro deles parecendo o certo, que é pior do que não ter
botão nenhum: ensina que aquele caminho não funciona.

Por isso o cartão **deixou de ser um `<Link>` só**. Âncora dentro de âncora é
HTML inválido — o navegador desmancha o encaixe e decide sozinho o que o clique
de dentro faz —, então a caixa virou um `<div>` com dois links irmãos: um para o
percurso e outro para o documento. É o mesmo defeito do `<button>` dentro de
`<button>` que o laboratório de Configurações já teve.

O bloco é um só, em `TokenNoCartao`, e serve à trilha e à vereda: as duas emitem
o mesmo documento, e duas cópias divergem no primeiro ajuste — foi por serem
duas telas diferentes que a vereda ficou anos sem ele.

**E a vereda concluída mostrava um cartão de 100% sem prêmio nenhum à vista.**
Ela nem recebia a certificação: sem `cert`, o emblema nunca chegava a
`'certificado'` e o bloco não existia. Quem terminava via um cartão igual ao de
quem não tinha recebido nada, e o Token.Web() só aparecia entrando na vereda. A
seção passou a ler `useCertifications`, o mesmo gancho do painel — a emissão
grava o `code` da vereda em `curriculum_code`, então `getByCurriculum` acha o
dela sem nada novo.

**E o cabeçalho da página usa o `Emblema`, não um `<img>`.** O defeito voltou por
ali depois de corrigido no cartão: a tela da trilha desenhava a arte por conta
própria, num `w-14 h-14`, e o oval chegava espremido de novo. Quem sabe a forma
da arte é o componente — toda tela que mostra emblema passa por ele, no tamanho
do cartão do painel, para que a medalha que se clicou seja a que se reencontra.

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

**Trinta e duas de uma vez é muro, não convite.** Eram duas, e listar tudo era
listar tudo. Com as seis famílias registradas a seção passou a despejar trinta e
dois cartões — dezesseis fileiras — em cima de quem só queria chegar às
certificações logo abaixo. Fechada, ela mostra quatro, e as **abertas vêm
primeiro**: resumo feito só de cartão cinza anuncia que ali não há o que fazer.
Aberta, volta a grade por família — fechado é o convite, aberto é o catálogo, e
catálogo sem família não se navega.

**A vereda emite Token.Web(), e é o mesmo documento.** O clube não tem por que
aprender dois: mesma tabela `certifications`, mesma verificação pública em
`/verificar`, mesmo PDF, e conta nas insígnias de certificado. O que impedia
era `specialty_id NOT NULL` — a vereda não tem linha em `specialties`, e não
ter é a decisão que a mantém fora do percentual e do XP. Nenhuma tela lia essa
coluna, então ela passou a aceitar nulo.

A emissão confere **o evento**, e não requisitos: a trilha guarda os requisitos
no banco, a vereda não guarda nada — o conteúdo é código. A confiança é a
mesma dos dois lados, porque `requirement_progress` também é escrito pelo
aplicativo de quem estuda; quem protege é a RLS.

**E sai sozinho, como o da trilha.** Era botão, e a razão de então era boa: o
pedido atravessa a rede, e falhar em silêncio na hora da vitória é a pior hora.
Só que silêncio não era a única saída, e o que o botão produzia era uma vereda
concluída com o prêmio parado atrás de um clique que quem terminou não tinha
razão nenhuma para saber que existia. Hoje `TokenDaVereda` emite ao aparecer, e
o que se temia continua coberto: a falha aparece escrita, com o botão de tentar
de novo ao lado, e voltar à vereda tenta outra vez sozinho.

Emitir sozinho cobra duas guardas que o clique não cobrava. Uma tentativa por
montagem, num `ref` — o `StrictMode` monta duas vezes de propósito, e duas
emissões simultâneas passariam as duas pela conferência de "já existe?" do
servidor, que é uma leitura seguida de uma escrita. E **revogado não se emite
de novo**: a conferência do servidor só enxerga os ativos, então olhar apenas
para o ativo devolveria um documento novo a cada visita — abrir a vereda
desfaria a revogação da liderança, e ninguém saberia. Por isso o cartão recebe
os certificados daquele percurso em **qualquer** estado, e só monta depois que
essa lista chegou.

**Quem escreve o mural é o servidor.** A emissão gravava `certification_issued`
dos dois lados — na Edge Function e no aplicativo —, e toda "Atividade Recente"
saía com duas linhas de "Certificado emitido" por certificado, uma com o código
e outra sem, porque os dois lados chamavam o campo por nomes diferentes. Com a
emissão tentando de novo sozinha isso viraria uma linha por tentativa. Só o
servidor escreve; `descreverAtividade` lê `code`, e continua lendo o `certCode`
antigo de quem já tem o registro gravado.

Vereda não tem nível, tem tamanho. Grava `'basico'` — o lado que reivindica
menos — e a tela pública não imprime grau nenhum para ela: escreve que é
vereda.

**Vereda com conteúdo é conferida, publicada ou não.** As travas olhavam para
`veredasAbertas()`, e uma vereda leva vários dias para ficar pronta: enquanto
`emConstrucao`, laboratório abrindo resolvido e questão repetida só reprovariam
no dia da abertura, com tudo já escrito. Hoje elas olham para
`veredasComConteudo()` — quem tem lição é conferido. Insígnia e certificado
continuam saindo das abertas: prometer prêmio por percurso que ninguém pode
percorrer é outra coisa.

**CSS não se vê sozinho, e não se verifica por busca de texto.** A lição de
laboratório diz a `linguagem` e traz a `marcacao` a que a folha se aplica —
fixa, aberta e só de leitura na lateral, porque sem ler o `class=` não há como
escrever seletor que acerte alguém. O validador (`cssValidator.ts`) analisa a
folha pelo CSSOM do próprio navegador: o que ele descarta não conta, que é
justamente a armadilha do CSS — `colr: red` não dá erro, some. E seletor que
não casa com a página não vale: regra para uma classe inexistente é CSS que não
pinta nada. `display: flex` sozinho também não passa — o requisito é
*alinhamento*, e quem alinha é a propriedade seguinte. E a propriedade se procura por
**família**, e não por nome exato: `border: 2px solid #333` não deixa nenhuma
declaração chamada `border` — o motor expande a forma curta, e cada um expande
de um jeito. A lista de nomes exatos passava no jsdom e reprovava no Chromium,
dizendo a quem escreveu a borda certa que ela não existe.

**O exemplo da teoria se desenha do jeito que o assunto é, e quem diz é o
tópico.** Havia um desenho só, e era o do W3Schools: "você escreve" à esquerda,
"o navegador mostra" à direita. Serve ao HTML, que foi onde a vereda nasceu, e
era aplicado a tudo — na CC001 o realce de HTML não achava tag nenhuma nas
pilhas de blocos e não pintava nada, e o quadro do navegador exibia o algoritmo
da bicicleta como parágrafo. `exemploComo` decide entre `html`, `css`, `blocos`
e `texto`, e é escrito à mão de propósito: adivinhar pelo conteúdo erraria
justamente nos casos mistos. Bloco vira bloco por `blocosDoScratch.ts`, com a
cor da categoria de verdade — cor errada manda procurar na gaveta errada da
paleta —, e o que não se reconhece sai cinza, porque cinza diz "não sei".

**No CSS, o quadro do resultado precisa de uma página, e ela é escrita à mão.**
Folha de estilo posta dentro do `<body>` é só texto: o quadro mostrava a regra
escrita na tela em vez do efeito dela. Hoje a folha vai no `<style>` e o que ela
pinta é o `exemploMarcacao` do tópico — pequeno e específico, porque uma página
cheia esconderia o efeito da regra no meio de tudo o mais. Sem marcação não há
quadro nenhum: os tópicos de consulta de mídia não têm, porque um quadro de
largura fixa mostraria um estado só e ensinaria o contrário.

E a marcação erra em silêncio, que é o de sempre: as duas caixas continuam
aparecendo e a da direita mostra a página intacta. `exemplosDaTeoria.test.ts`
cobra que todo seletor da lição ache alguém — a mesma regra que o
`cssValidator` já cobra de quem estuda. Escrever a marcação obriga a olhar o
quadro: `#topo { background-color: rgb(27, 77, 62); }` saía com o texto escuro
padrão em cima do verde-escuro, e "a margem entre os dois cartões é a soma
destas duas" estava errado — margens verticais vizinhas se fundem numa só.

**Consertar é meia lição; a outra metade é dizer de que família era.** O
requisito 6 da CC002 pede identificar, corrigir **e classificar**. As duas
primeiras o computador já ajuda a fazer — o Python aponta a linha do erro de
sintaxe e escreve o traceback do de execução. Sobre o de lógica ele não escreve
nada, e é o de lógica que custa caro a vida inteira. Classificar é o que obriga
a olhar **quando** o erro apareceu, e é por aí que se acha o terceiro: é o que
sobra depois que o programa roda até o fim sem reclamar.

As famílias moram em `falhasDePython.ts`; as falhas de cada lição, no currículo,
em `falhas` — porque são conteúdo. O sintoma se escreve como quem vê a tela
veria: "a média sai sempre zero" é sintoma, "falta um int() na linha 4" é
gabarito, e gabarito faria o painel abrir resolvido.

**A classificação acontece no painel de Problemas, e não num formulário da
plataforma.** É a mesma regra do laboratório de IA, onde a avaliação crítica
mora no polegar que o próprio aplicativo tem. Todo editor de código tem um
painel de problemas embaixo — o que muda aqui é de quem é a resposta.

E quem erra recebe o que **teria visto** se a família marcada fosse a certa, e
nunca qual é a certa: com a resposta na tela, três botões viram três tentativas
e a tarefa passa a medir paciência. O painel tem altura fixa justamente porque
a moldura precisa desse número — a cápsula da plataforma sobe a altura do que o
programa imitado tem colado no pé, e painel que muda de tamanho com a tela não
dá número nenhum para subir.

**Escrever é meia lição; a outra metade é explicar o que se escreveu.** O
requisito 7 da CC002 pede um programa livre de quarenta linhas **e** apresentá-lo
dizendo o que cada parte faz — o mesmo requisito difícil da CC001, pela mesma
razão: escrever copiando é possível, explicar copiando não é. A apresentação
acontece fora do aplicativo e a plataforma não confere nada dela; o que ela faz
é preparar, lendo a estrutura e escrevendo em português o que cada pedaço faz,
para a pessoa treinar com o **próprio** programa na frente.

Quem lê o programa é o `ast`, dentro do Pyodide, e o que ele devolve é
estrutura — `esboco`, que vem junto dos achados porque as duas leituras são da
mesma árvore. As frases moram em `roteiroDePython.ts`, em TypeScript, onde se
testam sem subir doze megabytes de Pyodide. Primeira pessoa, porque é para
falar: "este laço soma as notas" se lê, "eu somo as notas" se fala.

Duas coisas que ele diz e que a árvore esconde: `x = x + 1` e `x += 1` viram a
mesma frase, porque quem escreveu a forma longa vai apresentar "somo 1"; e a
cadeia de `elif`, que na árvore é um `if` dentro do `else` do anterior, sai toda
no mesmo nível — falada, ela não é encaixada, é a próxima pergunta da mesma
série, e uma escada de degraus faria a pessoa dizer em voz alta a coisa errada
sobre o próprio programa. Função escrita e nunca chamada diz que nunca roda: é
a pilha sem chapéu da CC001, do outro lado da estante.

**O que a trava mede é a palavra da plataforma, e não a linha.** O roteiro cita
o código de quem escreveu, então uma variável chamada `faltaram` fazia a trava
do "descreve, e não julga" acusar a plataforma de uma palavra que ela não
disse. O esboço do teste é neutro por isso — um nó de cada tipo, com nomes que
não dizem nada.

**O nome do bloco na lição é o nome que está na paleta — sem tradução nossa.**
A CC001 abre o Scratch de verdade, em português, e as lições diziam
"quando a bandeira verde for clicada" (a paleta diz "quando ⚑ for clicado", com
a bandeira desenhada no lugar da palavra), "defina placar para 0" (é "mude
placar para 0"), "mude placar em 1" (é "adicione 1 a placar"), "pare tudo" (é
"pare todos"), "próximo traje" (é "próxima fantasia"), "suba 10 passos" (é
"adicione 10 a y"). E chamava o ator de "personagem", que é a palavra que a
tela não usa: sprite é **ator** no Scratch em português, costume é **fantasia**,
e o controle vermelho é um octógono de parar, e não uma bandeira.

Nada disso estoura. O desbravador lê a lição, vai procurar na gaveta, não acha,
e conclui que está no lugar errado — é o mesmo defeito de pintar o bloco da cor
errada, só que nas palavras.

A resposta vem de `scratch-l10n`, o arquivo de tradução do próprio MIT, que é o
que o editor embutido carrega; não há segunda fonte. `blocosDaLicao.test.ts`
confere cada bloco escrito nas lições contra ele, e confere também os rótulos do
editor de reserva — uma reserva com outros nomes ensinaria uma paleta que não
existe. O molde tem buracos (`mova %1 passos`), então a comparação é por padrão,
e o bloco de parar mostra que o item de menu é uma tradução à parte: o texto que
se lê é "pare" mais "todos".

**Em Python o resultado é o que sai escrito, e ele é conferido rodando.** O
tópico traz o código e, ao lado, a saída que ele produz — `exemploSaida`, com
`exemploEntrada` quando o exemplo pergunta alguma coisa. Escrever essa saída de
cabeça erra por pouco e com frequência: `10 / 3` não é 3.33, é
3.3333333333333335; `print("a", 1)` põe um espaço e `print("a" + "1")` não põe;
`input()` escreve a pergunta e não ecoa a resposta. Nada disso estoura, e quem
confere o próprio programa contra um exemplo errado conclui que o **seu**
programa é que está errado. `exemplosDePython.test.ts` roda cada exemplo no
Pyodide — o mesmo CPython do navegador — e compara linha por linha.

**As cores do realce moram num lugar só.** Elas eram do editor e ninguém mais as
tinha: o exemplo da teoria emitia as mesmas classes e nenhuma regra as pintava,
então todo bloco de código das lições saía cinza do primeiro ao último
caractere, em todas as veredas. `CORES_DO_REALCE` sai de `ide.tsx` e serve às
duas telas — duas cópias divergiriam no primeiro ajuste, e a lição passaria a
mostrar uma paleta que o editor não usa.

**Vereda em construção pode ter conteúdo, e a trava disso mudou.** A antiga
exigia que toda vereda `emConstrucao` estivesse vazia, o que deixou de ser
verdade quando a teoria da CC002 chegou antes dos laboratórios. O que continua
valendo são duas contas: vereda sem lição nenhuma nunca conta como concluída, e
vereda em construção não conta nem com tudo o que ela já tem vencido.

**Laboratório que ninguém consegue vencer é pior do que um que abre
resolvido.** Um abre com tarefa verde de graça; o outro deixa quem fez tudo
certo olhando uma lista vermelha sem nada na tela que explique — uma saída
esperada com um espaço a mais, um enunciado que pede o que a verificação não
aceita. Por isso cada laboratório de Python tem uma solução de referência em
`laboratoriosDePython.test.ts`, e ela precisa deixar a lista inteira verde. A
solução mora no teste, e não no currículo: gabarito no currículo fica a um
import de distância da tela.

E a trava de "abre sem verificação verde" precisou de uma segunda versão aqui.
A de `veredas.test.ts` não executa nada — em HTML e em CSS não há o que
executar —, então ela aprova qualquer modelo de Python, inclusive um que já
estivesse pronto. A daqui roda o modelo no Pyodide antes de conferir.

**"O programa roda até o fim" é verdade num arquivo só de comentários**, e por
isso `roda` quase não é cobrado: quem carrega o peso é `saidaEsperada`, que
exige rodar **e** acertar. Ele fica onde significa alguma coisa — no laboratório
de consertar, cujo modelo não roda mesmo, e no programa livre, que não tem saída
fixa para comparar. O enunciado mora dentro do próprio modelo, em comentário, e
não num cartão fora do editor: é onde ele fica à vista enquanto se escreve.

**A lição escreve código no meio da frase, e a tela precisa saber disso.** A
prosa das veredas nomeia código entre crases — `int`, `NameError`,
`placar = placar + 1` — e destaca uma palavra entre asteriscos, e a tela imprimia
tudo cru. Numa vereda de HTML isso aparecia três vezes e passava por descuido;
numa de Python aparece em quase todo parágrafo, porque é assim que se escreve
sobre código. `TextoDaLicao` entende as duas marcações, e só as duas — não é
markdown, e não vai ser: a lição já tem lugar próprio para título, exemplo e
aviso. Ele devolve um `span` só, porque a caixa de atenção é `display: flex` e
uma lista de pedaços soltos sai partida em linhas.

**Questão não desenha marcação nenhuma.** Ela vai para o mesmo
`QuestionRenderer` das provas das trilhas, que imprime texto puro — escrever
crase ali põe a crase na tela, e no arquivo ela parece certa.
`qualidade.test.ts` cobra.

**De onde a vereda saiu nem sempre é uma trilha.** A de CSS sai da de HTML, e a
de Python sai da de blocos; a tela dizia "saiu da trilha CC-FE001" de uma
vereda, e chamar de trilha o que não é ensina errado justamente sobre a
distinção que a plataforma passou meses estabelecendo. `textoDaOrigem` escolhe a
palavra procurando o código em `VEREDAS`, e `veredas.test.ts` cobra que toda
origem declarada exista de verdade.

**A exigência de uma vereda é uma lista, mesmo quando é uma só.** Era um campo
único, e bastava enquanto nenhuma vereda dependia de mais de uma. As de
escritório não são assim: Trabalho Compartilhado pede Editor de Texto **e**
Contas e Segurança, Dados e Formulários pede duas, Projeto Documental pede
três. Guardar só a primeira abriria a vereda para quem não fez as outras. É
lista sempre, e não "ou um ou vários": união de escalar e lista dá duas formas
para a mesma coisa e todo leitor precisa lembrar qual veio. `veredasQueFaltamAntes`
devolve **quais** faltam, porque com três exigências dizer "conclua a anterior"
manda a pessoa concluir uma e voltar para descobrir que falta outra — a tela
nomeia todas, e põe um botão para cada.

E o grafo não pode ter ciclo. A exigência de si mesma era o único caso
cobrado — o ciclo de tamanho um. Com dezenove veredas em grafo, um laço de três
passa por qualquer revisão e tranca todas as veredas dele para sempre, cada uma
esperando a seguinte. `veredas.test.ts` percorre e nomeia o caminho inteiro.

**Vereda pode exigir outra, e a exigência é por `id`.** A CC002 se apoia nos
blocos em toda página — "o sempre é o `while`", "a boca do bloco é o recuo" —, e
quem chega sem ter percorrido a CC001 lê comparações com uma coisa que não viu.
`preRequisitoDaVeredaCumprido` é a irmã de `preRequisitoCumprido` das trilhas, e
a diferença é o que ela recebe: o **id**, e não o código. Escrever
`preRequisito: 'CC001'` compila, passa por qualquer revisão, e tranca a vereda
seguinte para sempre — nenhum percurso é gravado com esse nome, então a resposta
é sempre não. `veredas.test.ts` cobra isso, mais o pré-requisito que aponta para
vereda em construção (que também nunca destrava) e o que aponta para si mesma.

E, enquanto o percurso carrega, a resposta é **sim**: responder "não" faria a
tela de quem já concluiu a CC001 piscar bloqueada, e ver "bloqueada" onde havia
acesso é a forma mais rápida de alguém achar que perdeu o que fez. O outro lado
do erro é inofensivo — quem não cumpriu vê a vereda um instante e ela se fecha.

O cartão bloqueado diz **qual** é a chave, e não só que está trancado: "em
construção" significa que não há o que fazer, e "conclua a CC001" significa que a
chave existe e é sua. Dois cartões cinzas sem essa diferença mandam alguém
esperar por uma coisa que já está pronta.

**O painel de certificações nomeia os dois currículos.** Ele chamava
`getSpecialty(cert.curriculum_code)` direto, que só conhece trilha: a linha de
uma vereda caía no `??` e saía escrita "CC001", só o código, ao lado de "AP034
Internet". Quem percorreu a vereda inteira via o documento dela sem nome
próprio, na única tela que lista os certificados. É a mesma falta que o painel
administrativo já teve, consertada lá e não aqui.

`percursoDoCertificado` já respondia pelos dois — é ela que a página pública
usa — e passou a escrever o par por `nomeCompleto`, e não montado à mão com
travessão. Sem isso, a vereda ganharia nome e o painel ficaria com dois
formatos na mesma grade.

**A contabilidade do clube conta vereda também.** O painel administrativo
listava uma linha por trilha aberta — e vereda não é `Specialty`, então ela
sumia: a que já tinha emitido Token.Web() aparecia com o código cru no lugar do
nome, e a que ainda não tinha emitido não aparecia de jeito nenhum. Vereda emite
o mesmo documento, pela mesma tabela; a lista sai dos dois currículos, com uma
coluna dizendo qual é qual.

E **contagem que falhou não pode parecer contagem zero**. A RPC é
`security definer` e reprova quem não for admin; num banco restaurado sem ela, a
resposta é 404. Nos dois casos o `data` volta vazio e a tabela saía com zero em
toda linha, igualzinha a um clube que ainda não certificou ninguém. O erro agora
aparece escrito, dizendo que os números não valem.

**O relatório fala das veredas, e não só das concluídas.** Ele citava vereda
apenas quando ela estava inteira — e quem está no meio de uma, que é quase todo
mundo, não aparecia: a seção sumia, e o documento entregue ao clube dizia por
omissão que a pessoa não fez nada além das trilhas. Pior, no PDF nem a versão
concluída entrava; a seção existia só na tela, e o papel é o que o clube
arquiva.

O texto mora em `relatorioDeVeredas.ts`, fora da tela, porque o texto é a
entrega. Ele abre explicando **o que é uma vereda** — quem lê conhece a ficha
das especialidades e nunca ouviu falar disto —, lista uma por uma com o ponto em
que a pessoa está, e fecha com o que o percurso rendeu. Desempenho aqui é
percurso, e não nota: a vereda não tem nota, os eventos gravam qual lição foi
vencida e nada mais, e inventar um número seria pior do que não ter. O que se
diz é quantas lições, de que metade — teoria ou prática —, e se saiu
Token.Web(). Vereda com zero lições vencidas não vira linha: um relatório de
aprendizagem fala do que foi feito.

**O relatório tem capa, sumário e páginas numeradas.** Ele é entregue impresso
à liderança e arquivado junto da ficha do desbravador, e começava no meio de um
bloco de identificação — a única linha que dizia de longe do que ele tratava
era `Trilha.Web() — Especialidades A, B e C`, escrita com um `doc.text` sem
quebra nenhuma: com três especialidades ela já saía pelas margens.

A capa responde ao que se pergunta **antes** de ler: de quem é, de que clube,
de quando, sobre quais trilhas — uma por linha, que é o que conserta a linha
estourada — e o que vem anexado. São trilhas e o rótulo diz trilhas: o
relatório cobre as especialidades escolhidas na tela, e as veredas entram numa
seção própria mais adiante. O que a capa não tem é emblema: eles são a arte dos
certificados e chegam inteiros, sangrados, nas folhas de anexo.

O sumário se escreve em folhas **reservadas antes** do corpo, porque só se sabe
em que página uma seção caiu depois de compor, e inserir folhas depois
empurraria todas as seguintes — todo número apontaria para a anterior à certa.
A reserva e a quebra contam **entradas**, e não milímetros, pelo mesmo motivo
que `sortearCobrindo` e `minimoParaCobrir` dividem o laço: duas contas
parecidas discordam um dia, e aí a última entrada cai numa folha que não existe.

A capa não se numera, que é a convenção de todo impresso, e as folhas de anexo
também não — carimbar número por cima da arte seria escrever no documento que
a pessoa vai emoldurar. Elas contam no total, porque quem recebe um documento
de nove folhas precisa saber que recebeu as nove.

E as conquistas saem **da mais antiga para a mais nova, com a data ao lado**.
`useBadges` traz decrescente, que é o certo na estante — lá a pergunta é "o que
eu ganhei agora?" —, mas o documento conta um percurso, e percurso se lê do
começo. A que não tiver data vai para o fim: pô-la no começo afirmaria que foi
a primeira, que é justamente o que não se sabe.

**Toda trilha e toda vereda registrada tem emblema e fundo de certificado.** A
regra foi esta, virou "arte é condição para abrir e não para anunciar", e
voltou — e o vaivém é o registro de uma circunstância, não de uma indecisão.

Ela valia para as anunciadas também, "porque a arte chega antes do conteúdo
para que o cartão anunciado mostre o que vem". As dezenove veredas de
escritório e de design, e as duas especialidades de Artes e Habilidades
Manuais, inverteram a ordem: os requisitos oficiais saíram e a arte ainda
estava sendo desenhada. Cobrar arte para anunciar deixava duas saídas ruins —
segurar o registro do percurso inteiro até o último desenho ficar pronto, ou
pôr no repositório vinte e uma imagens de mentira que alguém teria de lembrar
de trocar. Então as travas passaram a filtrar por `emConstrucao`.

A arte definitiva chegou inteira: **as sessenta e quatro** — treze trilhas e
cinquenta e uma veredas — têm as duas imagens. A exceção acabou junto com o
motivo dela, e o que se ganha voltando é o dia em que alguém registrar o
próximo percurso: com o filtro, ele entraria sem arte e ninguém saberia até o
dia de abrir, que é quando o desbravador já está dentro. Sem ele, a falta
aparece no primeiro `ci.yml`.

As duas travas continuam com a guarda contra o vazio: lista vazia deixaria a
build verde por não ter conferido nada, que é a armadilha do "zero link não é
zero link quebrado" aplicada à própria trava. E `formaDaArte.test.ts` ganhou a
dela na mesma volta — ela lia só o que existia, tolerância que virou buraco no
dia em que as outras duas passaram a cobrar de todo mundo: arte que sumisse
encolheria a lista de formas em silêncio. Hoje ela confere a lista contra o
registro inteiro antes de medir qualquer coisa.

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

**A insígnia e a abertura saem no mesmo push, e é exceção consciente.** O
normal é `supabase/` antes e a tela depois. Aqui não dá: `estante.test.ts`
cobra que toda insígnia semeada no banco tenha lugar na estante, e o lugar da
vereda sai de `veredasAbertas()` — semear a linha com a vereda ainda
`emConstrucao` reprova ali, e com razão. O que sobra de risco é a janela de
alguns minutos em que o `deploy.yml` termina antes do `supabase.yml`, e ela não
alcança ninguém: a vereda leva catorze lições para ser concluída, e
`evaluateBadges` roda de novo na atividade seguinte de quem quer que seja.

**A janela do Explorador saiu do laboratório que era dono dela.** Ela morava
dentro de `FileManagerLab.tsx` — barra de endereço, painel de navegação,
cabeçalhos, linha, os dois menus e a barra de tarefas —, tudo privado ao
exercício da AP043. A CC-ES001 precisava de um segundo laboratório de
Explorador, e copiar a janela é como a plataforma já teve dois "Word"
diferentes uma vez. `explorer.tsx` é ela, extraída **antes** de a cópia
existir: a mesma decisão de `word.tsx` e de `excel.tsx`, pelo motivo escrito
nos dois.

O que ficou em `explorer.tsx` é do **programa** — como uma linha se desenha, o
que a barra de endereço tem. O que ficou em cada laboratório é do
**exercício** — que comandos a barra oferece, que tarefas se cobram, de que
disco se parte. Nenhuma peça
guarda estado: uma janela com estado próprio obrigaria os dois lados a
concordar sobre a mesma árvore, que é a forma mais rápida de mostrarem coisas
diferentes.

Por causa dela, `ehRaiz` passou a ler a árvore em vez de uma lista de três
nomes. A CC-ES001 acrescenta duas raízes — o pen drive e o disco de cópia de
segurança —, e a lista fixa diria que elas têm pai: arrastáveis, renomeáveis e
excluíveis. Arrastar o pen drive para dentro de Documentos não estoura nada.
Some o dispositivo, aparece uma pasta, e nada explica.

**Um computador, sete lições.** Os sete laboratórios da CC-ES001 são o mesmo
Explorador, e o disco de partida é um só — `discoDoClube()`. Quem abre o módulo
5 reencontra a mesma Área de Trabalho bagunçada que o módulo 1 deixou, e é dela
que a lição fala; sete discos diferentes ensinariam que cada exercício acontece
numa máquina de mentira. É o arranjo do terminal da CC003, e vale o que está
escrito lá: o disco não vem do currículo, porque um currículo que pudesse
descrevê-lo poderia descrevê-lo com a hierarquia já montada.

E o Explorador não ganha botão conforme o exercício: tem todos os comandos o
tempo todo, porque é assim que um programa é. Um que só mostrasse "Compactar"
na lição de compactar ensinaria a procurar o botão que a tarefa quer, e não a
procurar no programa.

**Três lugares onde o erro precisa poder acontecer.** "Abrir com" lista todos
os programas e abre no que se escolher — errado, aparecem os bytes lidos como
texto, que é o que de fato acontece, e não um aviso que o Windows não dá.
Puxar o pen drive fica ao lado de Ejetar, porque no computador de verdade
puxar não precisa de menu nenhum: é a mão, e esconder isso faria o requisito
4.6 virar um botão com um caminho só. E renomear com a extensão escondida
**guarda** a extensão, que é o que o Windows faz: gravar o que está no campo
tiraria o `.jpg` de dez arquivos em silêncio, que é o defeito que o requisito
4.4 existe para nomear.

**O padrão de nomeação é próprio, e mesmo assim se confere.** O requisito 5
pede padrão **próprio**, então a trava não pode ditar um. Ela reduz cada nome a
um molde — números viram `#`, letras viram uma letra — e cobra dez no mesmo
molde; **separadamente**, cobra de cada nome uma data e uma versão. As duas
contas são necessárias e não se substituem: o molde é justamente o que apaga a
diferença entre uma data e um número qualquer (`ata-2026-03-14-v01` e
`ata-1-2-3-v03` têm o mesmo molde), e dez datados em dez moldes não ordenam.

**Verificação que só existe como gesto é a exceção, e se justifica uma a uma.**
O validador do Explorador lê o disco, e não o clique — apertar "Compactar" sem
nada selecionado não faz pacote nenhum, e um teste de clique aprovaria. Quatro
fogem disso porque não deixam marca: extrair um pacote cujo original continua
lá dá uma árvore igual à de quem copiou à mão, restaurar da Lixeira devolve a
árvore ao que ela era, e "Salvar como" grava um arquivo que qualquer caminho
gravaria.

E o contexto carrega o disco de agora **e** o de quando a lição abriu. Sem
isso, o histórico de versões que o relatório já traz diria que alguém salvou
por cima de um arquivo que nem abriu.

**Escolher vários é uma ferramenta, e ela mora fora dos dois laboratórios.**
A lista aceitava um item por vez, e com isso metade do requisito 4.5 não tinha
gesto: "compactar um conjunto de arquivos" só se alcançava compactando uma
**pasta**, que é o caminho que não exercita a escolha. `selecao.ts` tem as
regras — Ctrl alterna, Shift pega a faixa, Ctrl+Shift soma uma segunda faixa,
Ctrl+A pega tudo — e os dois Exploradores as usam. Duas seleções ligeiramente
diferentes seriam dois Windows, que é a mesma razão de `explorer.tsx` existir.

Quatro detalhes dela erram calado, e é por isso que são funções puras e não um
`if` dentro de um `onClick`:

- **o intervalo do Shift corre a ordem da tela**, e não a da árvore. Depois de
  classificar por data as duas deixam de coincidir, e a faixa pegaria linhas que
  não estão entre as duas em que a pessoa clicou;
- **o botão direito numa linha já selecionada preserva a seleção.** Sem isso,
  escolher cinco e mandar compactar pelo menu encolhe para um no caminho: o
  pacote sai com um arquivo, e a tarefa diz "o pacote tem menos de três itens"
  — acusando a pessoa de um erro que a tela cometeu. Arrastar segue a mesma
  regra;
- **a âncora não se move com o Shift.** Movê-la faria a faixa caminhar, e
  encolher a seleção clicando mais perto do começo passaria a ser impossível;
- **a seleção é podada contra o que está à vista.** O id de um arquivo excluído
  continuaria lá, e o comando seguinte agiria sobre o que ninguém vê.

**No celular não há Ctrl nem Shift, e a resposta é a do Windows.** O menu
Exibir ganhou "Caixas de seleção de item", que é como o Explorer de verdade
resolve isso — e elas nascem ligadas quando `(pointer: coarse)` diz que não há
mouse. A pergunta é essa, e não a largura: um tablet de dez polegadas tem a
largura de um computador e o mesmo problema. É a regra de sempre — reduzir a
tela nunca reduz o que dá para fazer nela.

**E as teclas que a barra prometia passaram a existir.** "Copiar (Ctrl+C)",
"Renomear (F2)", "Excluir (Del)" estavam escritas nos botões dos dois
laboratórios desde sempre, e **nenhuma fazia nada**: não havia ouvinte de
teclado em lugar nenhum. Dica que nomeia um gesto que o programa não tem é pior
do que dica nenhuma — o desbravador aperta, nada acontece, e conclui que errou.
`useAtalhosDoExplorador` ignora o que vem de campo de texto, senão o Ctrl+A de
dentro do campo de renomear selecionaria a pasta em vez do texto, e o Del
apagaria o arquivo em vez da letra. E fica **acima** do `if (salvo)` do
`FileManagerLab`: hook depois de um return antecipado deixa de ser chamado em
algumas renderizações, e o React conta os hooks pela ordem.

**Trava de motor não é trava de tela.** `exploradorValidator.test.ts` prova que
cada verificação pode ficar verde chamando o motor. Isso não prova que a janela
chama alguma delas: um botão sem `onClick`, um menu que não abre, uma caixa de
pesquisa que não pesquisa — o motor continua correto e o laboratório fica
impossível de vencer, que é pior do que um que abre resolvido. Por isso as sete
lições são levadas até o fim pelos mesmos cliques que o desbravador daria.

**Peça que só funciona numa largura de tela é peça que some.** A caixa de
pesquisa desaparece abaixo de 1024 px, e na AP043 isso é o certo — lá ela é
enfeite. Na CC-ES001 ela é o requisito 4.3 inteiro, e sumir junto tirava o
único caminho até a tarefa no celular. Ela encolhe para o ícone, como o
Explorador de verdade faz, e quem diz qual das duas é qual é a presença de
`aoBuscar`.

Do mesmo dia: o diálogo do sistema subiu no celular, porque a cápsula de
tarefas mora no canto de baixo e um diálogo centrado punha Cancelar e
Confirmar debaixo dela — via-se o formulário inteiro e não se via como
confirmar. A regra que o sobe vem **depois** da que o centra: as duas têm a
mesma especificidade, e escrita antes ela não valeria nada, sem nada estourar.
`explorer.test.ts` confere a ordem, e não só a existência da regra.

**O programa da lição pode ter mais de um arquivo.** `arquivosDoProjeto`, na
lição de laboratório de Python, é o que existe na pasta ao lado do que se
digita: o CSV que a lição entrega para ser lido (só de leitura, como a
`marcacao` do CSS) e o segundo arquivo-fonte do requisito 8 (`editavel`, porque
escrevê-lo é o exercício). Quem os escreve em disco antes de executar é
`preambuloDoProjeto`, e quatro coisas ali erram calado — todas porque o worker
é um só e o Pyodide vive entre execuções.

A pasta é apagada e refeita a cada execução: arquivo gravado numa execução
sobreviveria à seguinte, e um programa que grava errado, é corrigido para não
gravar mais nada e roda de novo passaria pela sobra. É o "laboratório que abre
resolvido" em outra roupa. Os módulos carregados de lá saem do `sys.modules`
antes: sem isso, editar o segundo arquivo-fonte e rodar de novo executa a
versão anterior dele, e quem está aprendendo a dividir um programa conclui que
dividir não funciona. O preâmbulo roda dentro de uma função, para os `import`
dele não valerem para quem estuda — um programa que esquecesse o `import json`
funcionaria aqui e estouraria no computador do clube. E ele sai da pasta antes
de apagá-la: o sistema de arquivos do Pyodide recusa remover o diretório de
trabalho atual, então a primeira execução funcionava e a **segunda** morria com
"Resource busy".

**A análise lê o projeto, e não o arquivo aberto.** Duas contas do requisito 8
não se respondem arquivo a arquivo — a definição da função mora num e as
chamadas moram no outro, e cada metade sozinha diz "não". O `ANALISADOR` recebe
todas as fontes por `preparoDaAnalise`, une os achados, e recalcula essas duas
sobre todas as árvores; o esboço e a lista de chamadas continuam saindo do
principal, porque servem ao roteiro da apresentação. E o erro de sintaxe passou
a dizer **em que arquivo**: num projeto de dois, apontar "programa.py, linha 4"
para um erro do `caixa.py` manda ler o arquivo errado.

**O `pip` mora no terminal da CC003, e não num segundo.** O requisito 7 da
CC004 pede demonstrar a instalação pelo gerenciador de pacotes, e ele vive na
linha de comando: um botão da plataforma ensinaria o gesto errado. Duas telas
de terminal diferentes ensinariam que cada vereda tem a sua, e ele é um só.

O `reqeusts` do catálogo é o `requests` com duas letras trocadas, e ele
**instala**, sem reclamar — porque é assim que a armadilha funciona: quem
publica pacote falso escolhe o erro de digitação comum. Se todo nome errado
respondesse "não encontrado", a lição seria a de que o pip protege, e ele não
protege. O que o denuncia está no `pip show` — autor desconhecido, quatro dias,
trinta e um downloads —, que é o que se leria na página do pacote, e não num
alerta escrito por cima.

**O fundo de toda tela é o moiré, e ele mora em dois arquivos.** Era uma
textura de globo em `body::before`, com vinheta em `body::after` — dois
pseudo-elementos e um SVG. O moiré precisa de cinco camadas, porque o que
produz o padrão é uma multiplicar contra a outra, e pseudo-elemento não dá
cinco.

A marcação ficou no `index.html`, e não num componente montado no `App` como o
`CodigoFonte`. São duas razões. O fundo é decoração do **documento**: não tem
estado, não tem texto, não muda de rota, e o que ele substitui também não
passava por React nenhum. E de lá ele é pintado no primeiro byte — montado no
`App`, toda abertura a frio começaria preta e ganharia o fundo depois que o
pacote de JavaScript baixasse e analisasse, que no computador do clube se vê.

O preço dessa escolha é que marcação e folha não sabem uma da outra. Apagar a
`div`, renomear uma classe ou tirar uma regra deixa a tela **preta** — e preto
é a cor que a plataforma já tinha, então ninguém estranha. `fundoDaPlataforma.test.ts`
compara os dois conjuntos de classes, com a guarda contra o vazio de sempre:
dois conjuntos vazios são iguais.

**O pixel mais claro do fundo é o que decide a escala de texto.** O card é
translúcido a 50%, então a superfície em que o texto pousa é metade da cor dele
mais metade do que passa por trás. O traço branco do globo chegava a
rgb(46,46,46) e punha o card em rgb(57,57,61); a base do moiré é rgb(29,29,29) e
põe em rgb(48.5,48.5,52.5) — por cima dela só há `multiply`, que nunca clareia, e
a vinheta, que vai de transparente a preto. Todas as razões de contraste
subiram meio ponto, e as declaradas ao lado de cada cor foram remedidas.

O granulado é a exceção: ele usa `screen`, que clareia, e está em opacidade
zero. A trava não o proíbe — ligá-lo é legítimo no dia em que uma tela de 8 bits
mostrar as faixas —, ela **inclui** a opacidade dele na conta. Clarear até o
texto cair abaixo de AA é que reprova.

E o fundo é de tela, nunca de papel: `position: fixed` cobrindo o viewport sai
no papel como um retângulo quase preto por cima da primeira página do que
alguém quis imprimir. A regra de `@media print` também é conferida.

**O que o Scratch pendura no `<body>` precisa passar por cima do `#root`.**
`#root` leva `position: relative; z-index: 1` para ficar acima do fundo, que é
`.moire` em 0, e isso o torna um contexto de empilhamento pintado depois de todo irmão
sem z-index próprio. O `scratch-gui` põe várias coisas ali fora — janelas em
510, menus e balões do Blockly em 1000 e acima —, e todas trazem o próprio
número. **Uma não traz**: o popover do `react-popover`, que é o seletor de
cores do editor de pintura. Ele existia, na posição certa e do tamanho certo, e
era desenhado debaixo do aplicativo inteiro: clicar em "Preencher" não mudava
nada na tela, o console ficava limpo, e trocar a cor de um ator — metade do que
se faz num editor de desenho — era impossível. `body > .Popover` sobe para 2 no
`index.css`, e `seletorDeCores.test.ts` compara os dois números na folha
publicada, não no arquivo de origem: quem um dia levantar o `#root` mexeria só
nele, e o seletor voltaria a sumir calado.

**O painel de tarefas é branco, e o que cai nele vem da plataforma.** `acoes`
é escrito pelo laboratório e desenhado pela moldura em **duas** superfícies: o
painel lateral do computador, branco como o do Word, e a bolha do celular, que é
escura. As classes de botão da plataforma foram medidas contra o aplicativo
escuro — `--color-text-soft` é 8.9:1 lá e **1.7:1** no branco, e
`--color-bg-hover` é branco a 9%, que sobre branco não é nada. "Recomeçar" saía
quase invisível em cinco laboratórios, sem erro em lugar nenhum, e "Recomeçar" é
a saída de quem estragou o exercício. Quem veste a superfície clara é a moldura,
em `CSS_DA_MOLDURA`, e só ela: na bolha escura as mesmas classes estão certas,
então a regra é escopada em `.lab-painel-claro` e não trocada em geral.

Pelo mesmo caminho apareceu `.btn-ghost`, que três laboratórios usavam e **não
existia em folha nenhuma** — saía como texto solto, sem área de clique. E o
parágrafo de ajuda do Explorador fixava `--color-text-dim`, que só podia acertar
numa das duas superfícies: hoje herda a cor de quem o desenha.
`painelDoLaboratorio.test.ts` refaz a conta sobre as folhas de verdade.

**A formatação direta é estado, e ela vence o estilo.** A CC-ES002 existe por
causa do requisito 6 — consertar um documento mal formatado trocando toda a
formatação direta por estilos, *sem alterar uma palavra do texto* —, e isso
pediu três coisas do modelo do documento.

O `Trecho` sabia carregar ênfase e sobrescrito, mas não o negrito-e-16pt que
alguém aplica apertando os botões da barra. Sem isso o documento não podia
**chegar** mal formatado, e o exercício ficaria dependendo de acreditar num
enunciado. E ela vence o estilo ao desenhar, como no Word: é essa precedência
que faz a lição existir — aplicar o estilo e nada mudar na tela significa que a
direta continua lá, ganhando.

**As definições de estilo moram no documento, e não num módulo.** Eram
constante global, o que basta enquanto ninguém as edita e fica impossível no
instante em que o requisito 8 pede para demonstrar que mudar um estilo muda o
documento inteiro. No Word o estilo é do arquivo — mexer em Título 1 aqui não
mexe no de outro documento —, e uma tabela global faria a plataforma inteira
trocar de aparência quando alguém editasse um exercício. `AjusteDeEstilo` não é
`CSSProperties` de propósito: a caixa "Modificar Estilo" oferece fonte, tamanho,
cor, negrito e itálico, e abrir a porta para qualquer propriedade CSS daria ao
laboratório poderes que o programa imitado não tem.

**"Sem alterar uma palavra" se mede contra o documento de partida.** Conferir
contra uma cópia tirada no meio do caminho deixaria passar o atalho mais rápido
e mais errado que existe: apagar o parágrafo feio e redigitá-lo — que num
documento de verdade é como se perde um parágrafo inteiro sem perceber.
`TEXTO_ORIGINAL` é derivado de `OFICIO_INICIAL`, e não escrito à parte: duas
cópias do mesmo texto divergiriam no primeiro ajuste de redação.

E é **condição, não tarefa**: viaja como conjunção de cada meta que mexe em
parágrafo. Como item próprio da lista ela abriria verde, que `veredas.test.ts`
reprova — e com razão, porque lista com item já marcado no segundo zero ensina a
não ler a lista.

**A folha desceu para `word.tsx`, e o tipo da lição não diz de que documento
ela parte.** O segundo laboratório de Word da vereda é outro componente
vestindo a mesma janela — `LaboratorioDeWord` é a **lição do módulo 1**, e não a
janela —, que é o arranjo de `FileManagerLab` e `LaboratorioDeExplorador` sobre
`explorer.tsx`. Então a folha, o parágrafo, a quebra de linha, as marcas e o
sumário desceram **antes** de a cópia existir.

E `tipo: 'word'` não basta para escolher a tela: os dois módulos abrem o Word e
partem de documentos diferentes. A lição diz `documento: 'oficio' | 'circular'`,
e é ele que o despacho lê — amarrar a tela ao **id** do módulo faria o terceiro
laboratório de Word pedir um `if` novo na página em vez de um campo no
currículo. É o mesmo campo que diz à trava de "abre sem nada consertado" qual
par documento/metas conferir: sem ele, ela olharia sempre para o primeiro e a
lição nova escaparia sem nada acusar — que é o defeito que o `switch` exaustivo
logo abaixo acabou de consertar do outro lado.

**Dois trechos sem quebra saem grudados, e é isso que um parágrafo é.** A
assinatura da circular tinha dois trechos e nenhuma quebra entre eles, e a tela
mostrou "PioneirosSobradinho" — que é exatamente o que um parágrafo sem quebra
de linha faz, e o defeito só apareceu no navegador. A correção não foi pôr a
quebra: com ela, o documento chegaria com a resposta do endereço desenhada
dentro dele. Virou uma linha só.

**Tabela e imagem não são parágrafo, e o bloco virou união.** O `Bloco` tinha
`trechos` e ponto, e o módulo 3 da CC-ES002 precisa dos dois. Pendurar
`tabela?:` dentro do parágrafo deixaria representável o parágrafo que é tabela
**e** tem trechos, que não existe, e cada leitor teria de lembrar qual dos dois
vale. Hoje `Bloco` é `Paragrafo | TabelaDoDoc | ImagemDoDoc`, discriminado por
`tipo`, com o que é comum — `id`, `secao`, `quebraDePagina` — numa base.

O compilador apontou os vinte e seis lugares que supunham parágrafo, e a
correção quase sempre foi pedir `paragrafos(d)` ao modelo em vez de
`d.blocos`. Dois deles importavam: `paragrafosVazios` contaria a imagem, que
não tem texto nenhum — e aí a meta do módulo 2 passaria a exigir que se
apagasse a foto para ficar verde; e `titulosDoDoc` leria estilo de um bloco que
não tem.

A legenda, essa, **é** parágrafo: no Word ela é um parágrafo de estilo Legenda
com um campo dentro. Pendurá-la na imagem tiraria dela o estilo, e com ele o
índice de figuras e metade do requisito 4.3.

**A legenda é campo, e campo não guarda número.** É a armadilha inteira do
requisito 4.3: quem digita "Figura 1" entrega um documento em que a Figura 2
vem antes da Figura 1 depois da primeira revisão, e nada avisa. `Trecho.campo`
é `'figura' | 'tabela'` e o `texto` dele fica **vazio** — o número sai de
`numeroDoCampo`, que é a posição dele entre os campos do mesmo tipo na ordem do
documento. Um campo que gravasse `'Figura 1'` seria texto digitado com outro
nome.

Figura e tabela contam em séries separadas, como no Word: a Figura 1 e a
Tabela 1 convivem, e contar tudo junto daria "Tabela 2" à primeira tabela do
documento — um número plausível apontando para nada.

São duas leituras, e é de propósito: `textoDoBloco` devolve o que foi
**digitado** (é ele que responde por "sem alterar uma palavra do texto") e
`textoDoTrecho` devolve o que se **lê**. A distância entre as duas é a lição —
na legenda digitada elas dizem a mesma coisa, e é por isso que ela não se
corrige sozinha.

E o que separa as duas na tela é o **sombreado cinza do campo**, que é do Word
e não nosso. Sem ele as duas legendas ficam idênticas e a diferença só existe
dentro do modelo; um aviso da plataforma poria na nossa tela a resposta que o
programa imitado já dá na dele.

**A tabulação some no HTML, e com ela o defeito que a lição mostra.** A lista
de inscritos do módulo 3 chega alinhada com Tab — é o defeito do requisito 4.2,
e o único dos três documentos da vereda que se vê na primeira olhada. Só que
`white-space: normal` colapsa `\t` num espaço, e a lista saía **reta**: o
exercício virava "converta porque a tarefa mandou".

O jsdom não denuncia — lá o `\t` continua no `textContent`, e a trava passava.
Quem viu foi o Chromium. `.wd-tab` liga `pre-wrap` e uma `tab-size` medida:
de 28 a 38 os quatro nomes curtos param na mesma coluna e só o comprido salta
para a parada seguinte. Ficou 32, no meio da faixa, porque o número depende da
métrica da fonte e um valor na beirada viraria "alinhado" noutra máquina sem
nada acusar.

**Float não vale em item de flex.** A folha é `display: flex` por causa da
altura mínima dela, e com os blocos soltos ali dentro o navegador ignora o
`float` — Quadrada e Próxima prometiam que o texto contorna a imagem e faziam
exatamente o que Acima e Abaixo faz. Três das seis disposições idênticas, sem
erro nenhum, numa lição cujo assunto **é** a diferença entre elas. Os blocos
moram num `.wd-corpo` comum dentro do flex, e o float volta a valer entre
irmãos.

Da mesma volta: a legenda de uma figura que flutua flutua junto, na largura
dela. Sem isso ela é um parágrafo comum depois do float, e o "Figura 1 — ..."
sai ao lado da foto em vez de embaixo — com cara de documento mal montado pelo
desbravador, e não de defeito nosso.

**"Ajustar ao texto" não é qualquer disposição.** Atrás e à frente tiram a
imagem da linha, o que parece resolver, e é o contrário do que o requisito
pede: elas fazem o texto **ignorar** a imagem. É a família do "abrir com" que
não é "definir padrão". As seis existem no menu, porque um programa tem todos
os comandos; a meta aceita as três que arrumam o texto em volta, e o
laboratório explica por que as outras duas não respondem — e as desenha
cobrindo o texto, porque desenhar as seis iguais faria a recusa parecer
capricho.

**Comentário dentro de template de CSS não leva crase.** `CSS_WORD` e
`CSS_FOLHA` são template literals, e um `` `flex: 1` `` escrito dentro de um
comentário fecha a string no meio. Aconteceu três vezes num dia. O `tsc` pega —
é erro de sintaxe —, mas o servidor de desenvolvimento continua servindo o
módulo antigo, então a tela parece certa e a medida que se faz nela é de um
arquivo que não existe mais. Rode o `tsc` **antes** de medir qualquer coisa no
navegador.

**Escada de `if` por tipo de lição ignora em silêncio o tipo novo.** As travas
de vereda escolhiam o mapa de passo a passo com uma escada de `if` terminada em
`if (l.tipo !== 'laboratorio') return []`. O editor de texto entrou como sexto
tipo e **passou por três travas sem ser olhado**: não abriu resolvido por sorte,
não citou meta inexistente por sorte, e não ficou sem passo a passo por sorte. É
a mesma família do `describe.each` com quatro trilhas escritas à mão. Hoje é um
`switch` exaustivo com `never` no `default`: o sétimo tipo não compila até
alguém dizer de onde sai o passo a passo dele.

**A folha reparte de verdade, e foi o requisito 4.4 que cobrou.** Havia uma
folha só, e a quebra de página era uma régua tracejada desenhada no meio dela.
Servia enquanto nenhuma lição falava do que se repete **por página** — e a
partir do módulo 4 não serve: cabeçalho que se repete numa folha só não se
repete, e número de página que nunca muda não mostra a diferença entre o campo
e o número digitado, que é a lição inteira.

`paginasDoDoc` reparte pelas quebras que o documento carrega, e não pela altura
do que cabe. A diferença não custa a lição — o que os requisitos 4.4 e 4.5
pedem é ver a faixa se repetir e o número mudar, e para isso basta haver mais
de uma folha —, e simular o corte por altura pediria medir texto no modelo, que
é trabalho do navegador: daria uma paginação que muda com a fonte de quem está
olhando. A régua tracejada saiu junto, porque uma quebra que abre folha nova e
ainda desenha um aviso de quebra diz duas vezes a mesma coisa. Os três
laboratórios anteriores ganharam isso de lambuja, e o do módulo 2 passou a
mostrar duas folhas onde mostrava uma linha pontilhada — que é o que uma quebra
de página de fato faz.

**O número da página é campo, e é de outra natureza que os outros dois.**
Figura e Tabela contam quantos vieram antes no texto; o da página conta em que
folha ele está sendo desenhado, e a **mesma** ocorrência dele — uma só, no
rodapé — mostra um número diferente em cada página. No Word são dois campos
diferentes pelo mesmo motivo, SEQ e PAGE, e aqui `CAMPOS_EM_SERIE` separa os
dois comportamentos: `textoDoTrecho` recebe a folha e resolve o da página com
ela.

E ele **não é editável na tela**. Deixar digitar por cima ensinaria que dá para
consertar o número errado escrevendo o certo, que é exatamente o gesto que a
lição existe para desfazer — e o documento chega com "Página 2" digitado em
todas as quatro folhas, certo numa e errado em três.

**O sumário guarda a folha, e não a posição da linha.** Ele imprimia `i + 1`,
que é o índice da entrada: num documento de quatro folhas o sumário mandava
todo mundo para as folhas 1, 2, 3, 4 na ordem em que os títulos aparecem, o que
só por acaso bate com o papel. `ItemDeSumario` grava `pagina`, e
`sumarioAtualizado` compara também por ela — porque é o número de página que
envelhece primeiro num documento de verdade: acrescentar uma seção no meio
empurra todas as seguintes sem mudar uma palavra de título nenhum, e um sumário
que só comparasse texto e nível continuaria se dizendo em dia.

**E ele fica embaixo do título, e quem diz isso é a seção.** Ele abria a folha
1, acima do nome do documento: quem abre o relatório lia a lista das seções
antes de saber de que documento elas eram. `sumario` é campo do documento e não
bloco posicionado — ele guarda o que leu, e isso não muda —, então a posição sai
de uma regra, e a regra é a `secao`: o sumário fecha a **abertura**, que é o
título e as linhas que viajam com ele.

Ela não pergunta por título de propósito. O ofício do módulo 1 chega com os
cinco títulos em negrito à mão e nenhum com estilo — é o defeito que a lição
existe para mostrar —, e uma regra que procurasse estilo de título não acharia
nenhum: jogaria o sumário vazio no pé da última folha, que é justamente onde
ninguém lê "Nenhuma entrada de sumário foi encontrada". A `secao` responde o
mesmo antes e depois de os estilos entrarem, então o sumário também não muda de
lugar enquanto se trabalha nele.

E a trava é de **ordem no DOM**, e não de existência: voltar o sumário para o
topo deixa as cinco metas verdes, as folhas certas e nada mais reclamando.

**Faixa aberta e nunca escrita não conta.** Abrir o cabeçalho é um clique, e um
cabeçalho vazio se repete em toda folha dizendo nada. É "zero link não é zero
link quebrado" aplicado à faixa, e por isso `cabecalhoEscrito` olha o texto e
não a existência.

**O documento do módulo 5 tem duas autorias, e é o único.** Os quatro
anteriores chegam errados e quem conserta é quem abre; este chega **já mexido
por outra pessoa** — a liderança leu, marcou duas alterações e deixou uma
pergunta na margem. É o requisito 5, e ele só existe com duas pessoas, o que
obrigou `Autor` a entrar no modelo. Ele é união de dois valores e não o nome
de quem quer que seja: com nome livre, "aceite as marcas da liderança" viraria
comparação de texto, e um erro de digitação deixaria a tarefa impossível sem
nada acusar.

**A marca é do trecho, e não do parágrafo.** No Word o mesmo parágrafo tem
palavra inserida, palavra riscada e palavra intocada ao mesmo tempo. Marca por
parágrafo obrigaria a lição a riscar a frase inteira para trocar uma palavra,
que é o contrário do que o recurso mostra. E nada disso é definitivo: um
`'excluido'` continua na tela, riscado, e volta inteiro se for rejeitado — é a
distância entre `textoDoDoc`, que responde pelo que foi digitado, e
`textoVisivel`, que responde pelo que a página diz.

**Aceitar e rejeitar são a mesma operação espelhada, e por isso são uma
função.** Aceitar um inserido é tirar a marca e deixar o texto; aceitar um
excluído é apagar o trecho, e rejeitar troca os dois. Escritas como dois `if`
separados elas divergiram na primeira correção: aceitar deixou de apagar o
excluído, e o texto riscado ficava no documento final sem marca nenhuma
explicando por que estava ali.

**Uma marca certa e uma errada, para que os dois botões grossos falhem.**
Aceitar Todas e Rejeitar Todas estão na faixa porque um programa tem todos os
comandos. Com a correção de um erro de digitação e uma troca de data que o
próprio documento desmente em outros dois lugares, nenhum dos dois fecha a
tarefa — e é isso que põe o desbravador a percorrer marca a marca, que é o que
o recurso existe para ensinar. A evidência de qual rejeitar está **dentro do
documento**: sem ela, rejeitar seria adivinhação.

**A substituição precisa poder errar, e erra.** A teoria diz com todas as
letras que o programa não protege — ele oferece as caixas. O documento traz a
palavra no singular e no plural, e um Substituir Tudo sem "palavras inteiras"
deixa "desbravadors" em dois lugares, de uma vez, sem nada avisar. Há dois
caminhos certos, e não um: marcar a caixa e fazer duas passagens, ou trocar o
**plural primeiro**, que funciona com as caixas desmarcadas. As quatro frases
trocadas são escolhidas para sobreviver à troca — "cada", "quarenta e nove" e
"mais de trinta" não têm gênero, e uma frase mal escolhida entregaria
"Nenhuma desbravador", fazendo o exercício premiar um texto que ninguém
entregaria.

Três decisões da substituição são do Word e erram calado se invertidas. **O
que está riscado não se substitui**: ele já saiu do texto, e trocar palavra
dentro dele mudaria o texto que voltaria se alguém rejeitasse a marca. **Com o
controle ligado a troca sai marcada**, porque o controle marca toda edição,
inclusive a que se fez de uma vez em quatro lugares. E **o pedaço de antes fica
com o id original**: comentário se pendura em id de trecho, e renumerar tudo
faria a margem esvaziar sozinha na primeira substituição. Essa última só erra
quando a palavra abre o trecho **e** o controle está ligado — nas outras três
combinações o id sobrevive sozinho, e é por isso que ela se testa construída,
em `documento.test.ts`.

**Desfazer é peça desta lição, e não enfeite.** A teoria promete que o Ctrl+Z
desfaz um Substituir Tudo inteiro e é a primeira coisa a apertar quando o
documento fica estranho. Sem ele, a referência divergiria do que o laboratório
faz — que é pior do que referência nenhuma —, e quem estragasse o texto só
teria Recomeçar, que joga fora tudo o mais que já foi feito. A pilha guarda o
documento inteiro a cada comando: é barato, e não tem como divergir do que está
na tela.

**Resolver é um clique, e responder não.** O comentário da liderança faz uma
pergunta, e a meta exige a resposta **e** o resolvido: sem isso ela premiaria
fechar o assunto sem dizer nada a quem perguntou — "zero link não é zero link
quebrado" aplicado a uma conversa. Pelo mesmo motivo, rejeitar em silêncio não
basta: a outra meta pede um comentário próprio no parágrafo da data, porque
rejeitar sem explicar devolve o documento com a marca sumida e quem revisou
achando que você não viu.

**A cor do revisor vai inline, e a folha não alcança.** `aparenciaDoTrecho`
devolve `style` inline — é ela que carrega a formatação direta —, e estilo
inline vence classe. A regra de folha existia, media 7,3:1 e 5,4:1 sobre o
papel branco, e **nunca chegava à tela**: as duas marcas saíam na cor do corpo
do documento, com o traço e o sublinhado certos e a autoria dizendo nada. Quem
viu foi o Chromium; no jsdom não há cascata para atropelar, então o que se
testa é a promessa — a cor está no elemento, e não à espera de uma regra. É a
irmã do `float` ignorado em item de flex, e do `\t` colapsado.

E é riscado **e** sublinhado, além da cor: quem não distingue as duas cores
continua vendo o traço. Mesma razão de a insígnia ter forma e cor.

**A margem de revisão é irmã da folha, e não filha.** No Word os balões ficam
fora do papel: desenhá-los dentro faria o comentário sair na impressão e
empurrar o texto, que é justamente o que a lição diz que ele não faz. No
celular não há 210 px de sobra ao lado, e ela desce para baixo do papel
**inteira** — esconder os balões tiraria o único caminho até duas das cinco
tarefas, e reduzir a tela nunca reduz o que dá para fazer nela.

**Comando sem alvo escolhido não age.** Aceitar e Rejeitar sem marca
selecionada avisam, em vez de agir na primeira pendente: agir pareceria
funcionar e resolveria a marca errada — a pessoa clicaria pensando no nome do
clube e aceitaria a data. É a mesma decisão do "selecione primeiro" do
laboratório de Word e do cursor na célula do módulo 3, e nenhum teste de motor
a sente.

**O documento do módulo 6 chega pronto, e é o único.** As quatro peças que o
requisito 7 nomeia — sumário, cabeçalho, imagem legendada e tabela — já estão
lá, porque construí-las é o que os módulos 3 e 4 cobraram, e repetir a tarefa
aqui mediria de novo o que já foi medido. O que falta é a **entrega**, e quem
garante que as quatro peças estão no documento é a trava do repositório, e não
um item da lista: tarefa que abre verde ensina a não ler a lista.

**Duas coisas ficaram para trás, e nenhuma se vê.** Uma marca de revisão que
ninguém resolveu e o sumário, gerado quando o relatório tinha três folhas.
Exportar agora é o gesto que se faz sem pensar, e o PDF sai com as duas
dentro. As duas são uma meta só — "terminar antes de exportar" —, porque o
assunto dela é a **ordem**, e não cada um dos dois consertos; mas ela exige as
duas metades, senão a que ficasse de fora entraria no PDF com a lista verde.

**O PDF congela porque guarda um retrato, e o retrato não é só o texto.** Ele
inclui o sumário gravado e as marcas pendentes, porque as três coisas aparecem
no papel: marca não resolvida sai impressa, e sumário velho manda o leitor para
a folha errada. Um retrato só de texto deixaria as duas passarem, e o arquivo
entregue sairia errado com a tarefa verde. O conserto é exportar de novo — quem
conserta dentro do PDF acaba com dois documentos diferentes, e o editável, que é
o que vai ser usado no ano que vem, fica sendo o errado.

**A entrega dupla pede três coisas, e nenhuma se substitui**: os dois arquivos
existirem, terem o mesmo nome, e o **editável** estar em dia como o PDF. Um
.docx salvo antes de terminar ao lado de um PDF novo é o pior dos dois mundos —
o papel mostra o relatório pronto e o arquivo que a próxima diretoria abre é o
de antes, com os dois na pasta e o mesmo nome.

**O padrão de nome daqui é mais frouxo que o da CC-ES001, e é de propósito.**
Lá o requisito pede padrão **próprio**, e a conferência reduz dez nomes a um
molde comum. Aqui o que a teoria escreve é só "mesmo nome, mesma data, mesma
versão", e cobrar o molde de um nome só não mediria nada: um nome sozinho sempre
tem o próprio molde. Data e versão são duas contas separadas, porque faltar uma
ou faltar a outra são erros diferentes.

**A CC-ES002 abriu com doze lições, e a classe da insígnia saiu do tamanho.**
São seis módulos, cada um com teoria e laboratório; doze cai na faixa que vai
até treze, que é Pioneiro. Vereda não tem nível — grava `'basico'` justamente
para não reivindicar grau nenhum —, então o tamanho é a única medida honesta
dela, e escrever outra classe na migration não estouraria nada: a tela lê a do
banco, e `insignias.test.ts` compara as duas justamente porque elas já
divergiram em silêncio por meses.

**A janela compartilhada tinha dentro dela o documento de um exercício.** A
prévia de impressão de `BastidoresDoWord` era o texto do relatório da AP042,
escrito na janela: o segundo laboratório a abrir Imprimir mostraria a prévia do
documento do outro — prévia que diverge do documento é pior do que prévia
nenhuma, e é o mesmo defeito do `LeitorDeVereda` que discorda do laboratório.
Ela passou a vir de fora, e a AP042 leva a dela.

Pelo mesmo caminho, duas peças da janela passaram a decidir por **presença de
setter**, como o `aoBuscar` do Explorador: o nome do arquivo vira campo de
digitar quando o laboratório entrega `aoMudarNome` — na AP042 ele é enfeite, e
um campo editável ali prometeria um gesto que não muda nada; na CC-ES002 ele é o
requisito, e um campo travado tiraria o único caminho até a tarefa. E a guia
**Arquivo** abre os bastidores quando o laboratório entrega `aoAbrirArquivo`, em
vez de só avisar que não faz parte: sem isso, quem precisa da porta redesenha a
fileira de guias à mão — que foi o que o laboratório de operações fez, e é como
a plataforma ficou com dois "Words" uma vez.

**A régua de status conta o que está na pasta, e não julga o arquivo.** Ela diz
os nomes gravados e não escreve "PDF desatualizado": o Word não sabe disso, e
escrevê-lo poria na nossa tela a resposta que a lição existe para o desbravador
descobrir sozinho, olhando a ordem. É a mesma regra do polegar do laboratório de
IA e do painel de Problemas do de Python.

**Despacho de três telas não é ternário.** Com dois documentos de Word o
`documento === 'circular' ? A : B` funcionava; com três, o `else` passa a ser
"todo o resto" e um documento novo cairia calado no laboratório do módulo 1 —
o desbravador abriria a lição certa e encontraria o documento errado. Hoje é um
`Record` sobre a união, então a quarta lição de Word não compila até ter tela.
É a mesma decisão do `switch` exaustivo das travas da vereda, do outro lado da
mesma ponte.

**A planilha passou a calcular, e é um motor só.** Ela não calculava: `valorDe`
entendia exatamente `=SOMA(A1:B2)` e `=MÉDIA(A1:B2)` e devolvia `#NOME?` para
todo o resto, e o laboratório da AP044 confere a fórmula do total por **prefixo
de texto**. Bastava enquanto o que se cobrava era ter escrito a fórmula.

A CC-ES003 cobra outra coisa. O requisito 7 manda achar, numa planilha
defeituosa, um **número armazenado como texto** — e isso só significa alguma
coisa se a `SOMA` de fato pular a célula e mostrar um total plausível e errado.
O 4.3 manda mostrar *quando* a referência absoluta é necessária, o que só se
entende arrastando a fórmula e vendo as relativas andarem enquanto as travadas
ficam. Nenhuma das duas se mede comparando texto.

`formulas.ts` é o motor, e `valorDe` passou a chamar dele. Dois avaliadores na
mesma base seriam os dois "Word" outra vez, com a divergência aparecendo como
número plausível — a pior forma de aparecer.

**O apóstrofo é o requisito 7 inteiro.** `'1620` é o gesto do Excel para dizer
"isto é texto"; ele aparece na barra de fórmulas e **não** aparece na célula.
Sem essa distinção, "número armazenado como texto" seria um enunciado sem nada
por trás: a `SOMA` somaria tudo e o defeito que a lição manda achar não
existiria. O que denuncia são duas coisas independentes — o alinhamento e a
`CONT.NÚM`, que conta um a menos do que a `CONT.VALORES`. É forma **e** cor
outra vez.

**E o alinhamento perguntava à pessoa errada.** Ele se lia `ehNumero(mostrado)`,
em cima do texto **já impresso** — e imprimir joga fora justamente a distinção
de que ele precisa: um `'1620` imprime `1620`, que é caractere por caractere o
que um número de verdade imprime. Então o motor entendia texto, a `SOMA` pulava
a célula, e a célula ia para a direita com todas as outras.

O estrago era a primeira das duas pistas, que é a que se usa primeiro: a lição
manda olhar a coluna, quem olhava via doze números arrumados e concluía que não
havia defeito ali. Duas pistas existem porque uma sozinha escapa de quem não
repara — com uma só, o requisito 7 passava a depender de alguém lembrar da
`CONT.NÚM`. E nada estourava: coluna bonita, total plausível e errado, que é o
que esta vereda inteira existe para ensinar a desconfiar.

Hoje `alinhamentoDe` recebe o **`Valor`**, e `valorCalculado` é quem o entrega —
`valorDe` passou a ser ele mais `mostrar`. Trocar a assinatura em vez de
acrescentar uma segunda função é a decisão: a antiga era estruturalmente
incapaz de acertar, e deixada de pé seria chamada pelo laboratório seguinte.
O compilador apontou os três lugares.

Nenhum teste sentiu isso por meses porque a AP043 não tem número guardado como
texto — sem apóstrofo em lugar nenhum, `ehNumero(mostrado)` e o tipo do valor
concordam sempre.

**E texto numérico entra na conta e não entra na função.** `=D4+0` devolve 1620
e `=SOMA(D2:D13)` pula a célula. A assimetria é do Excel e não nossa, e é ela
que esconde o defeito: quem confere uma célula por vez não vê nada de errado.
A regra exata é "texto vindo de **faixa** se ignora; texto escrito **direto** no
argumento se converte", e as duas metades são conferidas.

**Três coisas do motor erram calado se escritas do jeito óbvio.** O menos unário
liga mais forte que a potência — `=-2^2` é 4 no Excel, e não −4: copiar a
matemática da escola faria a plataforma discordar do programa que ela imita. A
comparação de texto sai por `localeCompare` em pt-BR e nunca por `<` entre
strings, porque `á` vale 225 em UTF-16 e cairia depois de `z` — numa coluna de
unidades isso põe Águia atrás de Tucano, e quem paga é o PROCV aproximado, que
lê a coluna como ordenada e para na linha errada. E `PROCV` sem o quarto
argumento procura **aproximado**, que é o padrão do Excel: numa tabela fora de
ordem — que é toda tabela digitada à mão — ele devolve a linha errada com toda
a confiança, e acerta em algumas e erra em outras, que é pior do que errar
sempre.

**Referência circular não devolve zero.** O Excel recusa a fórmula numa caixa de
diálogo e deixa zero na célula, com um aviso na barra de status que ninguém lê.
Zero aqui seria o número plausível e errado que esta plataforma existe para não
mostrar, e quem digita `=A1` em A1 é justamente quem não faz ideia do que
aconteceu. A célula diz `Ref. circular` — e a guarda em si não é opcional: sem
ela a recursão trava a aba e leva junto o trabalho da lição inteira.

**O modelo da planilha desceu para `planilha.ts`.** A célula, a grade, a faixa
e o valor moravam em `metasDaAp043.ts`, junto das tarefas daquele laboratório —
e `planilha.ts`, que só tinha as operações, importava de lá: as contas
dependiam das metas de um exercício. Desceram no dia em que a CC-ES003 precisou
da mesma grade com formato de célula, formatação condicional e mais de uma aba,
e desceram **antes** de a cópia existir, que é a decisão de `word.tsx`, de
`explorer.tsx` e do próprio `excel.tsx`. O que ficou em `metasDaAp043.ts` é do
**exercício**: o conteúdo da planilha de partida e o que se cobra dela.

**Uma pasta de trabalho, sete lições.** As sete planilhas da CC-ES003 são abas
de um arquivo só — `Caderno` —, e é o arranjo do `discoDoClube()` da CC-ES001 e
do terminal da CC003, pelo motivo escrito nos dois: sete arquivos diferentes
ensinariam que cada exercício acontece numa planilha de mentira.

**Ordenar mexe nos dados; filtrar e congelar são de tela.** Filtro esconde
linha e nunca apaga nenhuma — e a escondida continua na `SOMA`, que é a lição
que a AP044 já cobra. Ordenar é o contrário: a linha troca de lugar de verdade,
e por isso ela anda **sempre inteira**. Ordenar só a coluna da chave embaralha
o cadastro — o nome de uma unidade passa a ficar ao lado do telefone de outra,
sem erro nenhum e sem volta. É também por isso que `tabela` é **declarada** na
planilha em vez de adivinhada pelo que está preenchido: uma planilha de verdade
tem título solto e bloco de cálculos ao lado, e ordenar "a tabela" adivinhada
levaria o título junto.

**O cabeçalho nunca é escondido pelo filtro.** Sem ele não haveria onde clicar
para tirar o filtro, e a tabela ficaria escondida para sempre — o desbravador
veria a planilha vazia e concluiria que apagou tudo.

**A célula vazia vale zero na formatação condicional, e isso é o Excel.** A
primeira versão a excluía, e estava errada nos dois sentidos. Era **código
morto** — a guarda de "regra sem valor de comparação" já cobria tudo o que ela
alcançava, e a mutação que a apagou não derrubou teste nenhum, que foi como ela
apareceu. E era mentira sobre o programa: no Excel, "menor que 10" pinta a
metade em branco da coluna, e é uma das reclamações mais antigas que a
formatação condicional tem. Simulação que "conserta" isso ensina errado — a
mesma regra no computador do clube acenderia a coluna inteira, sem nada aqui
tendo avisado. A lição de módulo 5 nomeia o caso: a faixa da regra vai até a
última linha com dado, e não até o fim da coluna.

O que **não** casa é a regra com o campo de comparação em branco, e essa guarda
é nossa: `Number('')` é **zero**, e não NaN, então "maior que" em branco
pintaria toda célula positiva da faixa e "igual a" em branco pintaria todas as
vazias. Nos dois casos a planilha fica colorida e a regra parece ter
funcionado. É "zero link não é zero link quebrado" outra vez.

**E vale a última regra que casa, não a primeira.** Regras se empilham, como no
Excel. Devolver a primeira faria a regra recém-criada não pintar nada, e quem
acabou de criá-la concluiria que ela não funciona.

**A CC-ES003 parte de uma pasta de trabalho, e cada lição parte de um estado
dela.** A pasta é uma só — `Inscrições`, `Custos`, `Unidades`, `Orçamento`,
`Conferir` —, mas o módulo 1 recebe a aba de inscrições bagunçada e o módulo 2
recebe a mesma aba **já arrumada**. Começar a segunda lição mandando refazer a
primeira ensinaria que o trabalho anterior não conta, e as quatro tarefas do
módulo 1 apareceriam cumpridas ou não ao acaso. É o campo `documento` da
CC-ES002 outra vez, pelo motivo escrito lá.

**A estrutura vem rotulada; a arrumação, não.** O requisito 3 pede explicar por
que a planilha separa dado bruto, cálculo e apresentação. "Organize como achar
melhor" mediria gosto; uma planilha que chegasse já separada não mediria nada.
Então a zona de Cálculos chega escrita, com os rótulos do que se quer, e o que
se cobra é pôr cada coisa na zona dela. A coluna entre os dois blocos fica
vazia de propósito: é a calha que os separa, e sem ela ordenar os dados levaria
os cálculos junto.

**Arrumar não é apagar.** A tarefa de limpar o bloco de dados exige que os doze
inscritos continuem lá. Sem isso, apagar a tabela inteira deixaria a tarefa
verde — o bloco ficaria "só com dado" por não ter dado nenhum. É "zero link não
é zero link quebrado" aplicado a uma limpeza, e numa lista de tarefas isso é
uma tarefa verde de graça.

**A tarefa confere a função e o resultado, nunca só um dos dois.** Conferir só
o texto deixaria passar `=SOMA(D3:D13)` — a função certa sobre o intervalo
errado, que é o erro de planilha mais comum que existe e o que o requisito 2.1
existe para evitar. Conferir só o número deixaria passar o número digitado.

**E o que separa a fórmula do número digitado é simular a mudança.** A tarefa
"ver a conta se refazer" muda uma diária **dentro da conferência**, olha se o
total acompanhou, e descarta a planilha alterada. Pedir que a mudança aconteça
de verdade obrigaria a lembrar de desfazer, e deixaria a tarefa verde numa
planilha alterada — a lição seguinte partiria de dados errados.

É a mesma conta no módulo 3, e lá ela pega o caso que mais ninguém pega:
`=B4*45`, com o valor da diária digitado dentro da fórmula, sai com os doze
valores certos e passa pelas duas primeiras tarefas. A planilha do ano que vem,
com a diária a 50, sairia inteira errada sem nada acusar.

**O cifrão que a trava cobra é o que a tarefa precisa, e não os dois.**
Arrastando **para baixo**, quem precisa ficar parada é a linha: `B$1` está
certo. Exigir `$B$1` reprovaria uma fórmula correta e ensinaria a decorar a
forma em vez de entender o que cada cifrão faz. A lição explica os dois.

**A tabela de procura não está em ordem alfabética, e é o requisito 4.5
inteiro.** Ela está na ordem em que o clube escreve as unidades, que é a ordem
em que foram fundadas — e é assim que toda tabela digitada à mão fica. O
`PROCV` sem o quarto argumento lê a coluna como ordenada e erra de **dois
jeitos** nela: procurando "Águia" devolve `#N/D`, que pelo menos se vê;
procurando "Onça" devolve **Tia Rute**, que é da Águia — um nome plausível,
numa célula sem erro nenhum, ao lado de um desbravador que não é da unidade
dela. Com a tabela ordenada, o `FALSO` pareceria não fazer diferença e a lição
seria sobre um argumento que ninguém precisa escrever.

**`usaFuncao` procura o nome seguido de parêntese, e não o nome.** `SOMA`
dentro de `SOMASE` casaria, e a tarefa da soma ficaria verde com uma fórmula
que soma condicionalmente — um número plausível a mais.

**A tarefa de formatação condicional confere o que ficou pintado, e não a
regra.** Há mais de uma regra certa — "menor que 3" e "igual a 2" acendem as
mesmas três linhas —, e cobrar uma delas mediria ter adivinhado a nossa. E
conferindo o resultado ela cobra de lambuja o detalhe que a lição existe para
ensinar: a faixa da regra para na última linha com dado. Esticada até o fim da
coluna, a metade em branco acende — célula vazia vale zero, e zero é menor que
três —, e planilha toda colorida não destaca coisa nenhuma.

**Ordenar sem levar a linha inteira não estoura, e não tem volta.** A tabela
continua com doze linhas, doze nomes e doze unidades, todos plausíveis, e cada
nome ao lado da unidade de outro. Por isso a tarefa não confere só que houve
ordenação: confere que os pares continuam de pé.

**O gráfico da CC-ES003 responde outra pergunta que o da AP044.** Lá é
evolução — como a inscrição cresceu mês a mês —, e só a linha responde. Aqui é
**composição**: para onde vai o dinheiro do acampamento, que é o que a pizza
responde. Repetir a pergunta mediria de novo o que já foi medido; ligar
Alimentação a Transporte com um traço afirma que uma virou a outra.

**Total que começa por igual ainda pode ser um número parado.**
`=820+910+1180` começa por `=`, devolve o número certo, e não acompanha nada;
`=33` é a versão curta do mesmo. O requisito 6 pede que nenhum total seja
digitado, e quem mede isso é **mexer num gasto dentro da conferência e olhar
se o total andou** — a mesma conta simulada do módulo 2 e do módulo 7.

**Os três defeitos do requisito 7 são de três naturezas, e é por isso que são
estes três.** A fórmula quebrada **grita**: `#REF!` aparece na célula e é o
único que se acha olhando a tela. O número guardado como texto **não grita**,
e tem duas pistas independentes — encosta à esquerda, e a `CONT.NÚM` conta onze
onde a `CONT.VALORES` conta doze; uma pista sozinha escaparia de quem não
repara em alinhamento. O total digitado à mão **não tem pista nenhuma**: está
certo hoje, e continua mostrando o número de hoje amanhã. É a família do
"número guardado não responde por hoje", a mesma da ofensiva parada em dois
dias.

**E apagar não é consertar.** Apagar a célula do número-como-texto tira o
apóstrofo junto e deixa a coluna com onze valores e um buraco — o defeito
"consertado" virando outro defeito. A conferência pede as duas coisas: sem
apóstrofo, **e** com o número lá.

**O exemplo da teoria declara resultado, e quem o confere é o motor.** É a
mesma trava de `exemplosDePython.test.ts`, pelo mesmo motivo escrito lá:
escrever de cabeça o que uma fórmula devolve erra por pouco e com frequência,
nada estoura, e quem confere a **própria** planilha contra um exemplo errado
conclui que a planilha dele é que está errada. Lá o resultado sai do CPython do
navegador; aqui sai de `formulas.ts`, que é o mesmo motor que responde ao
desbravador — lição e laboratório não podem discordar.

A diferença para a de Python é o contexto. Um programa traz tudo consigo; uma
fórmula só significa alguma coisa sobre uma planilha, e a planilha do exemplo
está **desenhada** no texto. Ler o desenho seria máquina frágil que um dia para
de achar o que procura e aprova tudo calada — a armadilha do "zero link não é
zero link quebrado" aplicada à própria trava. Então a divisão é esta: a
**grade** se declara no teste, e a **afirmação** se lê da lição. O número que a
tela mostra nunca é o número que o teste escreveu, e mudar o desenho sem mudar
a conta reprova, que é a falha certa. Com a guarda contra o vazio de sempre:
cada exemplo diz quantas afirmações tem, e um reescrito sem as setas reprova em
vez de passar por não ter conferido nada.

Ela achou, na primeira execução, o alinhamento que perguntava ao texto impresso.

**O roteiro da apresentação lê a forma da fórmula, e não uma árvore.** O
`roteiroDePython.ts` percorre o `ast` porque um programa tem forma livre; uma
fórmula de planilha, nesta vereda, tem um punhado de formas, e são as que as
lições ensinam. Descrever genericamente daria frases que ninguém diz em voz
alta — "aplico a função SOMA ao argumento D3:D14". O preço é que função nova
pede frase nova, e a trava cobra: toda fórmula que as sete lições produzem sai
com frase própria, nunca com a de último recurso.

E a coluna arrastada vira **uma** entrada, e não doze: doze frases idênticas
não são um roteiro, são o que faz alguém parar de ler. Ele fala em primeira
pessoa, porque é para falar, e **descreve sem julgar** — é a mesma trava do
roteiro de Python, pelo mesmo motivo escrito lá.

**A grade do Excel saiu do laboratório que era dono dela.** Ela morava dentro
de `PlanilhaLab.tsx` — cabeçalhos com letra e número, alças de redimensionar,
seleção de faixa por arrasto, edição na célula —, tudo privado à AP043. A
CC-ES003 precisa da mesma grade, e copiá-la é como a plataforma já teve dois
"Word". `GradeDoExcel` é ela, extraída **antes** de a cópia existir: a mesma
decisão de `word.tsx`, de `explorer.tsx` e do próprio `excel.tsx`.

O que ficou em `excel.tsx` é do **programa** — como uma célula se desenha, onde
ficam as alças, o que a faixa selecionada mostra. O que ficou em cada
laboratório é do **exercício**. E ela não guarda estado nenhum: uma grade com
seleção própria obrigaria os dois lados a concordar sobre a mesma célula ativa,
que é a forma mais rápida de mostrarem coisas diferentes.

**Formatação condicional, filtro e congelamento saem do modelo.** A planilha
guarda as regras, o filtro e quantas linhas estão congeladas, então a mesma
grade desenha as duas telas — e a da AP043 simplesmente não tem nenhuma das
três. Sem isso, cada laboratório teria de dizer à grade como pintar, e dois
laboratórios pintariam diferente, que é a razão de a grade existir.

**E as peças novas aparecem pela presença do setter.** É a regra do `aoBuscar`
do Explorador: a alça de preenchimento só existe quando o laboratório passa
`aoPreencher`, e a setinha do filtro quando ele passa `aoAbrirFiltro`. A AP043
não passa nenhum dos dois, e desenhá-los lá prometeria gestos que aquele
laboratório não faz — gesto sem efeito é o que ensina a desconfiar do programa.
A setinha, além disso, só nasce nas colunas da tabela **declarada**: pô-la em
toda coluna prometeria filtrar a coluna vazia da direita.

**Um componente para as sete lições da CC-ES003.** Elas abrem a mesma pasta de
trabalho e usam os mesmos comandos: o que muda é de que estado se parte e o que
se cobra. Sete componentes seriam sete Excel. É o arranjo do
`LaboratorioDeExplorador` sobre `explorer.tsx`, e a escolha do caderno sai de um
`Record` sobre a união — com dois cadernos um ternário funcionava; com sete, o
`else` vira "todo o resto" e a lição nova cai calada na aba do módulo 1. A
oitava não compila até dizer de onde parte e o que cobra.

E o mapa dos cadernos mora **fora do teste**, ao contrário do de Word: quem o
lê é a tela, que monta a lição, **e** a trava, que confere que nenhuma meta
abre verde. Escrito só no teste, a tela repetiria a escolha e as duas
divergiriam no primeiro caderno novo.

**A alça de preenchimento é arrasto, e não clique.** A primeira versão
preenchia no clique e exigia a faixa já selecionada — o gesto ao contrário, que
ninguém que conhece Excel descobriria. Hoje ela começa um arrasto, a faixa
cresce debaixo do ponteiro, e soltar preenche para o lado que andou mais:
arrastar na diagonal é um gesto que o Excel resolve de um jeito só, e adivinhar
o outro faria a coluna aparecer preenchida onde ninguém pediu.

**A AutoSoma para na primeira célula vazia subindo.** Somar tudo o que está
acima pegaria o cabeçalho e o título, e daria erro ou um número maior. É a
conta que o Excel faz, e escrever outra aqui ensinaria um botão que não existe.

**`onPointerEnter` não se testa com `pointerenter`.** O React não escuta esse
evento — ele não borbulha —, e implementa `onPointerEnter` a partir de
`pointerover` na raiz. Uma trava que despachasse `pointerenter` veria a janela
não reagir e acusaria o componente de um defeito que é do teste: foi assim que
a trava de tela da CC-ES003 nasceu vermelha com o navegador verde, em cinco das
sete lições. É irmã do `float` ignorado em item de flex e do `\t` colapsado — o
jsdom mentindo em cima de uma diferença que o navegador não tem.

**Os três laboratórios de planilha avisam juntos.** A lembrança do aviso de
tela pequena é por programa imitado, e o da AP043 dizia `programa="planilha"`
enquanto o da AP044 dizia `"excel"`: quem dispensava o aviso num era avisado de
novo no outro. Com um terceiro laboratório o estrago passou a ser duplo, e
aviso que volta é o que ensina a pessoa a não ler avisos.

**O PDF calcula, porque a CC-ES004 cobra o que não se vê.** O requisito 5
manda digitalizar um papel, reconhecer o texto e **comprovar o resultado
localizando uma palavra dentro do arquivo** — enunciado vazio se a procura
achar a palavra de qualquer jeito. O 4.4 manda reduzir o tamanho *explicando o
que se perde*, o que não se explica sem haver perda. O 6 manda distinguir a
assinatura colada da verificável, e as duas desenham o mesmo rabisco na mesma
página.

Então `documentoPdf.ts` é motor: a procura lê a camada de texto que existir, a
compressão tira nitidez de quem é imagem, o reconhecimento erra quando a
captura está ruim, e a assinatura verificável guarda o documento de quando foi
assinada.

**A página desenha igual, com texto dentro ou sem.** `linhas` é a tinta e
existe sempre; `texto` é a camada por baixo, e `undefined` nela é documento em
imagem. `procurar` lê `texto` e nunca `linhas` — lendo o desenho, a palavra
apareceria em qualquer documento, inclusive na foto de papel que não tem uma
letra dentro, e a comprovação do requisito 5 passaria a comprovar nada.

**O reconhecimento erra, e erra parecido.** Captura torta, escura ou sem
nitidez não devolve garrancho: devolve `Acarnpamento`, com o `m` virando `rn`,
que é a troca mais famosa que existe e a mais cruel — lida rápido, ela é a
palavra certa. Texto que **falta** se percebe olhando o tamanho; texto **quase
certo** não se percebe de jeito nenhum, e os dois falham na procura igual. Do
lado de fora o arquivo passou a ser "pesquisável", e é essa a parte que
engana.

**A ordem entre comprimir e reconhecer custa, e nada avisa.** A nitidez só
desce. Comprimir **antes** deixa o reconhecimento com menos do que ler e o
texto sai furado; comprimir **depois** não mexe no texto, que é leve e já está
gravado — o arquivo continua pesquisável e só a foto fica feia. Nos dois casos
o arquivo encolhe o mesmo tanto. É a família do sumário que guarda o que leu e
do PDF que congela.

**E a foto de papel pesar muito mais que a página digitada é premissa, não
constante solta.** É dela que sai por que comprimir um documento digitado não
adianta e comprimir um digitalizado adianta muito. Igualadas as duas, todas as
contas relativas continuariam passando e o requisito 4.4 viraria um botão que
mexe num número — por isso ela tem trava própria.

**Reconhecer não passa por cima de quem já tem texto**, e a trava disso precisa
de uma digitalizada **já reconhecida**, nunca de uma digital: a digital não tem
captura, então a primeira metade da guarda sozinha já a protege e a segunda
nunca é exercitada. O caso de verdade é o do requisito 8 — juntam-se cinco
documentos, manda-se reconhecer o dossiê inteiro, e as páginas que estavam
boas são relidas, trocando texto exato por texto adivinhado num arquivo que
continua dizendo "pesquisável".

**A assinatura colada e a verificável são iguais no dia de assinar.** O que
muda é **depois**: a verificável guarda a impressão do documento e quebra se
alguém mexer; a colada é um desenho, não tem o que comparar, e por isso nunca
acusa nada — que é exatamente por que ela não prova. Quem escolhe pela tela
escolhe no escuro. A impressão lê também os campos de formulário, senão daria
para assinar a ficha em branco e preencher depois.

**Juntar não leva assinatura adiante.** A verificável afirma sobre o documento
que foi assinado, e o juntado é outro: sobrevivendo à junção, ela estaria
afirmando sobre páginas que nunca viu, e mostrando "válida" para quem
conferisse.

**"Não permitir copiar" é pedido, e não trava.** O campo se chama
`pedeAoLeitor` por isso. `copiarTexto` devolve o texto **apesar** dele, de
propósito: fazer a simulação obedecer ensinaria que a restrição é uma trava —
que é a crença que o requisito 7 existe para desfazer — e ensinaria pela via
pior, a de quem confiou e mandou o documento adiante. Pelo mesmo motivo
`removerSenha` existe: quem sabe a senha salva sem senha, e a partir daí o
arquivo circula aberto. A ferramenta que faz isso não é de invasor, é o
próprio programa.

**O leitor de PDF saiu antes de a cópia existir.** A CC-ES004 abre o mesmo
leitor em cinco dos sete módulos — juntar, comprimir, preencher, assinar e
montar o dossiê. `leitorDePdf.tsx` é a janela, e é a mesma decisão de
`word.tsx`, `excel.tsx` e `explorer.tsx`, pelo motivo escrito nos três. Como
eles, ela exporta **peças sem estado**: quem guarda página ativa e documento é
o laboratório, que é quem responde à verificação.

**A folha desenha igual, e é a premissa da vereda.** As duas espécies de
página chegam ao desenho iguais, e nada na função que as pinta consegue
distingui-las — porque não há o que distinguir **na tinta**. Se a folha
marcasse na tela qual é qual, o requisito 5 não teria o que comprovar:
bastaria olhar.

O que muda é a foto de papel: a inclinação, a margem sobrando e o contraste
aparecem de verdade, senão corrigir o enquadramento seria um clique que não
muda nada na tela e a tarefa passaria a medir obediência.

**O aviso de digitalização some assim que existir qualquer texto.** Inclusive o
que um reconhecimento malfeito produziu — e é o que o leitor de verdade faz.
Um aviso que continuasse enquanto o texto estivesse ruim poria na nossa tela a
resposta que a lição existe para o desbravador achar sozinho, e faria a
procura virar enfeite. Conferido no Chromium: o aviso sai, o documento passa a
dizer "pesquisável", e a palavra continua sem aparecer.

**A marca de "imagem" na miniatura ficava com altura visível zero no
celular.** A tira tinha teto de altura, e a conta não fechava: prévia mais
número mais marca passavam do teto, e o que sobrava de fora era a última
linha — justamente a que diz que aquela página não tem texto dentro. Hoje a
tira encolhe a **prévia**, e não o painel. É "peça que só funciona numa largura
de tela é peça que some", e quem viu foi o navegador: no jsdom não há altura
nenhuma para estourar, então o que se testa é a promessa.

**E o nome do botão é o que ele faz.** Um comando da faixa nasceu com rótulo
"Organizar páginas" e dica "Extrair ou dividir páginas", e a trava reprovou na
hora — ela lê o **rótulo**, que é o que a pessoa lê, e não o `title`. Ler o
`title` deixaria passar um botão cujo nome na tela discordasse da dica.

**O digitalizador é arquivo à parte porque é outro programa**, e não porque
uma cópia esteja a caminho — hoje só a CC-ES004 digitaliza. A arquitetura da
casa separa o programa do exercício, e escrevê-lo dentro do componente da
lição faria daquele componente duas coisas. Ele imita o arranjo que o Adobe
Scan, o Microsoft Lens e a digitalização do Google Drive têm em comum: câmera
com a borda detectada sozinha, tela de recorte com quatro cantos, fileira de
filtros, e só então salvar.

**E ele chega errado de propósito.** O requisito 5 manda **corrigir**
enquadramento e contraste; um aplicativo que detectasse a borda certa e
escolhesse o filtro bom sozinho entregaria a lição resolvida — e aqui seria
pior do que de costume, porque o gesto que ele apagaria é o gesto que o
requisito nomeia. A detecção erra como erra de verdade: pega a beirada da mesa
em vez da folha.

**O filtro é como o celular corrige contraste, e ele muda o que dá para ler.**
Original deixa a foto acinzentada e o reconhecimento erra; Preto e branco lê o
texto inteiro. Se escolher um ou outro desse na mesma qualidade de leitura, a
fileira viraria enfeite e a metade do requisito 5 que fala de contraste
deixaria de existir. A ordem da fileira sobe em contraste, e o **primeiro** é o
pior — porque é onde a foto cai sozinha.

**E consertar metade não basta, que é o ponto.** Medido no Chromium: a foto
cai torta, com mesa em volta e sem contraste, e o aviso diz "ruim". Depois de
endireitar e enquadrar pelos cantos ela fica reta e sem margem — e o aviso
continua dizendo "ruim", porque o contraste ainda é o de Original. Só com o
filtro trocado ele passa a "bom". As duas metades do requisito precisam
acontecer, e a do meio é a honesta: arrumou e ainda não serve.

**Os cantos são botões, e não só alvos de arrasto.** No celular arrastar um
alvo de 26px é difícil, e quem navega por teclado não arrasta nada. Apertar o
canto encaixa, que é o mesmo resultado do arrasto bem-feito — "reduzir a tela
nunca reduz o que dá para fazer nela", e o teclado vale a mesma regra.

**O aviso de qualidade diz o que o aplicativo mediu, nunca se a tarefa está
cumprida.** Digitalizador de verdade avisa "imagem escura" e "endireite a
página"; nenhum diz "seu exercício está errado". É a regra da régua de status
do Word e do painel de Problemas do Python.

A trava disso nasceu grossa demais: ela proibia a palavra "errado" e reprovou
a frase **verdadeira** "o texto pode sair errado", que é o aplicativo relatando
o que mediu. Ela passou a procurar o vocabulário do **exercício** — tarefa,
lição, cumprida —, porque trava que mede vocabulário em vez de papel reprova
o certo e ensina a contorná-la.

**O modelo do scanner desceu para `capturaDoScanner.ts`, e o corte caiu onde o
ícone começa.** A lista de filtros é conteúdo — o nome, o contraste que deixa,
o que custa — e o desenho é aparência. `FILTROS` nasceu carregando o
componente de ícone, o que a tornava meio modelo e meio tela; o ícone ficou em
`digitalizador.tsx`, **sem sair dele**, porque exportar um mapa que ninguém de
fora lê é oferecer segunda fonte para a mesma coisa. É a divisão de
`iconesDeLicao.ts`, e foi o próprio lint que a apontou.

**`input.value = x` não chega ao React.** Ele guarda o último valor que ele
mesmo pôs e descarta o evento quando os dois batem, então uma trava que
escrevesse direto veria a régua não reagir e acusaria o componente de um
defeito que é do teste. Quem desfaz isso é o setter nativo do protótipo. É a
mesma família do `pointerenter` que o React não escuta.

**Uma pasta do clube, sete lições.** Os documentos da CC-ES004 moram em
`dossieDoClube.ts` e são os mesmos nas sete: a ata, o orçamento, a
apresentação, a circular, as fichas e o recibo. É o arranjo do
`cadernoDoClube()` da CC-ES003, do `discoDoClube()` da CC-ES001 e do terminal
da CC003, pelo motivo escrito nos três — sete pastas diferentes ensinariam que
cada exercício acontece num computador de mentira. E cada lição parte de um
**estado** dela: o módulo 2 recebe os três PDFs que o módulo 1 gerou, e o
módulo 7 recebe o dossiê quase montado. É o campo `documento` da CC-ES002 e o
`caderno` da CC-ES003 outra vez.

**O reconhecimento ruim precisa cobrir a língua, e o buraco não se via.** A
lista de trocas do OCR começou com quatro — `m`→`rn`, `l`→`I`, `0`→`O`,
`ç`→`c` —, que é a lista das confusões famosas, e parecia bastar. Só que a
troca é **uma por palavra**, e palavra sem nenhuma dessas quatro letras saía
**intacta** de um reconhecimento péssimo: de oito palavras portuguesas comuns,
cinco passavam ilesas, e entre elas estavam "Ficha", "Recibo" e "Chácara" —
que são exatamente as três que as lições mandam procurar.

O estrago é o de sempre: a página ficava mal lida e **perfeitamente
pesquisável**. O aviso de digitalização sumia, o leitor passava a dizer
"pesquisável", a procura achava a palavra, e a armadilha do módulo 3 — reduzir
antes de reconhecer — deixava de existir para metade das buscas. Nada
estourava, e o requisito 5 comprovava coisa nenhuma.

Hoje são doze trocas, todas confusões que o reconhecimento comete de verdade,
e a cobertura é **conferida**: `documentoPdf.test.ts` passa uma lista de
palavras portuguesas comuns e cobra que nenhuma escape. A trava nomeia a
palavra que escapou, porque "alguma escapou" não diz onde procurar.

**O dossiê abre com quatro documentos, e o quinto é o recibo do módulo 4.** Ele
abria com cinco, e a meta "reunir cinco" nascia verde — a própria trava de
"nenhuma meta abre verde" pegou o desenho de quem a escreveu. Consertar
mudando a meta para seis seria contornar a trava; o que estava errado era a
pasta. Reunir **é** metade do que o requisito 8 manda fazer, e o documento que
falta é justamente o que o desbravador digitalizou dois módulos atrás.

**O padrão de nome é o da CC-ES001, e as funções são as de lá.** O requisito 8
manda nomear "conforme o padrão adotado na vereda CC-ES001", e a lição repete
isso com todas as letras. Então `moldeDoNome` e `nomeTemDataEVersao` são
importadas, e não reescritas — e escritas aqui elas **já tinham divergido**:
as daqui aceitavam `v 2` com espaço e a data em dia-mês-ano, que as de lá
recusam. O desbravador levaria bronca num nome que a outra vereda aprovou, ou
o contrário, e nenhuma das duas telas teria como saber.

A mutação é que mostrou isso. Trocar `moldes.size === 1` por `>= 1` **não
derrubou teste nenhum**: o caso que eu tinha escrito para o molde divergente
vinha sem versão, então reprovava pela conta da versão e a do molde nunca era
exercitada. É a trava passando por acaso, que é indistinguível de estar certa.

**As duas descobertas do módulo 6 não deixam marca no documento.** Ver a
assinatura quebrar e copiar o texto apesar de "não permitir copiar" não mudam
nada no arquivo — são o desbravador **olhando**, e o requisito 6 e o 7 são
sobre isso. É a família das quatro verificações do Explorador que só existem
como gesto, e como lá se justifica uma a uma: `descobertas` é uma lista na
pasta, e não um campo do PDF, porque o que aconteceu foi com quem estuda.

Elas também não podem sair de graça: assinar não basta para "viu quebrar", e
pôr senha não basta para "senha não protege". Contá-las pelo estado do
documento premiaria o clique e não a descoberta, que é o contrário do que as
duas lições existem para mostrar.

**Juntar é juntar coisas diferentes.** A meta contava páginas, e o mesmo
documento combinado consigo mesmo três vezes dava um arquivo de três páginas
sem nada reunido. Ela conta origens distintas. É "zero link não é zero link
quebrado" na forma que mais engana: o número está certo, e não é o número que
a tarefa queria.

Pelo mesmo caminho, "o PDF congela" se mede pela **divergência** entre o PDF e
a origem, e não por "editou": um documento que voltasse ao texto original
depois da edição deixaria a tarefa verde sem ter mostrado nada.

**As sete lições da CC-ES004 são um componente só, e o mapa mora fora do
teste.** É o arranjo do `LaboratorioDePlanilha` sobre `excel.tsx` e do
`LaboratorioDeExplorador` sobre `explorer.tsx`, pelo motivo escrito nos dois:
sete componentes seriam sete leitores de PDF. `PASTAS_DA_CC_ES004` traz o
estado de partida **junto** das metas, e mora no mesmo arquivo que a tela lê —
escrito só na trava, como o de Word já foi, a tela repetiria a escolha e as
duas divergiriam na primeira pasta nova, com a trava continuando verde
conferindo uma pasta que a tela não abre.

**A tela inicial do leitor é do programa, e não do exercício.** Todo leitor de
PDF tem uma — Recentes no Acrobat, Início no Foxit —, então ela mora em
`leitorDePdf.tsx` e não dentro do laboratório. E ela **não** é uma janela do
Explorador: a CC-ES001 é a vereda do Explorador, e imitá-lo aqui seria a
terceira cópia de um programa que esta vereda não ensina. Os arquivos que ainda
não são PDF aparecem na mesma lista, porque é assim que a pasta do clube está —
esconder os outros formatos tiraria da tela o gesto inteiro do requisito 4.1,
que é partir de um arquivo que não é PDF.

**A lição de assinar era impossível de vencer, e as duas metas se excluíam.**
"Assinou" pede assinatura válida; "viu quebrar" pede ter mexido depois de
assinar, o que derruba a primeira. Quem fizesse as duas coisas ficaria com uma
lista que nunca fecha — e a trava de motor passava, porque a solução de
referência dela **pulava o meio do caminho**: assinava, protegia, e carimbava
as duas descobertas à mão.

O conserto não foi afrouxar a meta, e sim escrever a sequência que a pessoa
faz: assinar, mexer para ver o selo virar "não confere", e **assinar de novo**.
É o que se faz na vida, e entregar um documento com assinatura que não confere
é o contrário do que o requisito 6 ensina. A solução de referência passou a
fazer o mesmo — solução que pula o meio prova o fim e não prova o caminho.

Quem achou foi a trava que **clica**. É a diferença que `exploradorValidator`
já documentou: trava de motor não é trava de tela.

**Dois documentos com o mesmo nome: o segundo apaga o primeiro, calado.**
`comPdf` casa por nome, então a digitalização do módulo 4 substituía a foto que
o dossiê do módulo 7 já tinha — a pessoa punha o quinto documento na pasta e
continuava com quatro, sem nada na tela dizendo que alguma coisa sumiu. As duas
são fotos do mesmo celular, e agora têm a data de cada uma no nome:
`IMG_20260719_101204` para a lista de presença, `IMG_20260702_143512` para o
recibo.

**No celular o diálogo sobe, e a regra vem depois da que o centra.** A cápsula
de tarefas mora no canto de baixo: centrado, o diálogo mais alto — o de
Imprimir — terminava a **19px** do aviso de tela pequena. Dezenove pixels não
são uma decisão. É o conserto que a CC-ES001 já fez no diálogo do sistema, e a
ordem importa: as duas regras têm a mesma especificidade, e escrita antes a que
sobe não valeria nada, sem nada estourar. A trava lê a folha e confere a
**ordem**, e não só a existência.

**E a crase dentro de comentário de template de CSS fechou a string pela
quarta vez.** Um nome de arquivo entre crases num comentário de
`CSS_DO_LABORATORIO` virou erro de sintaxe, e o servidor de desenvolvimento
continuou servindo o módulo antigo — a tela parecia certa e a medida que se
fazia nela era de um arquivo que não existia mais. Está escrito acima e
continua valendo: rode o `tsc` **antes** de medir qualquer coisa no navegador.

**A classe da insígnia de vereda nunca era conferida, e este documento
afirmava que era.** Está escrito acima, na migration da CC-ES003 e na da
CC-ES002: "escrever outra classe na migration não estouraria nada — a tela lê
a do banco, e `insignias.test.ts` compara as duas". Ela não comparava. A trava
filtra por `INSIGNIAS`, e a insígnia de vereda **não está lá**: ela nasce da
estante, de `classeDaVereda` e do ícone `route`. O filtro passava por cima
dela em silêncio.

O efeito é o de sempre: qualquer classe escrita numa migration de vereda
passava, e a estante mostraria um degrau que a plataforma não calculou. Achou-se
mutando `excursionista` para `pioneiro` na migration da CC-ES004 — nenhum teste
caiu. E o sintoma de que alguma coisa estava errada estava à vista havia meses:
`classeDaVereda` é exportada de `insignias.ts` e **não é usada lá dentro**.

A comparação nova sai da **estante**, e não do catálogo, porque é a estante
que a tela desenha — e ela cobre de uma vez as três origens de insígnia:
degrau de escada, trilha e vereda. Família nova entra sozinha. Com a guarda
contra o vazio de sempre, que aqui é um piso de cinquenta: uma estante que
esvaziasse, ou um filtro que tirasse tudo, deixaria a trava verde por não ter
conferido nada.

**A janela do correio saiu antes da cópia, e a da AP034 não é uma janela.**
A CC-ES005 precisa de uma segunda caixa de correio — o requisito 5 manda
analisar três mensagens fraudulentas —, então `correio.tsx` saiu de
`CorreioLab.tsx` pelo motivo escrito em `word.tsx`, `excel.tsx`, `explorer.tsx`
e `leitorDePdf.tsx`: extrair **antes** de a cópia existir.

O laboratório de correio da AP034 ficou de fora, e não é esquecimento: ele é
cartão da plataforma, não imita programa nenhum e não tem janela para
compartilhar. Vesti-lo com esta moldura mudaria uma trilha já entregue, e não
é disto que a vereda trata. Havia **uma** cópia do Gmail aqui, e não duas.

**A mensagem mostra o endereço inteiro, e é premissa da lição seguinte.** O
primeiro indício de uma mensagem fraudulenta é o domínio de quem a mandou —
"Banco do Brasil" escrevendo de `bancodobrasil-verificacao.com`. Um correio
que mostrasse só o nome de exibição apagaria esse indício da tela, e o
requisito 5 passaria a pedir que se apontasse o que não está à vista.
`correio.test.tsx` cobra.

**E a lateral deita no celular, que é comportamento novo.** Ela era uma coluna
de 190px ao lado da lista, e no celular isso deixava a mensagem sem largura
nenhuma — ler a mensagem é justamente o que a lição seguinte pede. Vira uma
fileira de 50px no alto, com as quatro pastas no lugar: reduzir a tela nunca
reduz o que dá para fazer nela. A trava confere que a regra não esconde pasta
nenhuma, e não só que ela existe.

**A CC-ES005 é a primeira vereda com três programas, e por isso o `tipo` é um
só.** Cofre de senhas, página de configurações da conta e correio. Um `tipo`
por programa daria três variantes quase iguais em `veredas.ts`, e o que muda
entre elas não é o que a lição **é** — é em qual janela ela abre, e isso já
está escrito em `LICOES_DA_CC_ES005`. Então o campo é `licao`, e é ele que diz
as duas coisas: de que estado se parte e qual programa abre. O componente
despacha por `switch` exaustivo com `never` no `default`.

O registro mora **fora do teste**, como o de planilha e o de PDF: quem o lê é
a tela, que monta a lição, **e** a trava, que confere que nenhuma meta abre
verde. Escrito só na trava, a tela repetiria a escolha e as duas divergiriam
na primeira lição nova, com a trava continuando verde conferindo uma lição
que a tela não abre.

**Reutilizar senha não é "quatro vezes pior".** O requisito 3 manda comparar
repetir a senha com usar uma senha curta num serviço só, e a assimetria é a
lição inteira: a curta depende de alguém escolher **você**; a repetida depende
de alguém escolher **qualquer um** dos serviços em que ela está. `cairiamJunto`
responde a metade que nenhuma entrada do cofre mostra sozinha — quem vazou foi
um serviço, e quem cai são todos os que repetem aquela senha, nenhum deles
atacado e nenhum deles com defeito.

E senha de lista é frágil por mais classes que tenha, antes de qualquer conta:
`Senha@123` tem as quatro, doze caracteres, e passa em qualquer cadastro.
Ninguém a adivinha — alguém a tenta. No resto quem manda é o comprimento, e
não a classe.

**De quem é a conta se declara, e não se adivinha pelo endereço.** Adivinhar
exigiria uma lista de nomes de gente, e erraria nos dois sentidos:
`tesouraria.pioneiros` parece nome de pessoa e é do clube. É a mesma decisão
da `tabela` declarada na planilha.

E as duas contas do requisito 7 **não se substituem**, que é o par inteiro:
conta no nome de uma pessoa que duas pessoas abrem continua morrendo com o
endereço dela, porque é para lá que vai a recuperação; conta do clube que só
uma pessoa abre continua se perdendo no dia em que essa pessoa some. Corrigir
uma e declarar o cofre resolvido é o que o par existe para não deixar
acontecer, e há trava para cada sentido.

**Tirar o acesso de quem saiu não apaga a senha da memória dela.** É a meta
silenciosa do módulo 8, e a mais fácil de escrever errado: o cofre passa a
dizer que a pessoa não tem acesso, ela continua entrando em tudo, e as duas
telas concordam. Saber **quais** senhas ela chegou a usar exige o cofre de
quando a lição abriu — é a mesma razão de a CC-ES001 carregar o disco de agora
e o de quando abriu.

**Ligar as duas etapas é um clique; ficar com a conta não é.** `ativa` e
`codigosGuardados` são campos separados de propósito. O serviço mostra os
códigos de reserva uma vez, fechar a caixa sem baixá-los é um clique, a tela
continua escrita "ativada", e a conta se perde no dia em que o telefone se
perder. É "zero link não é zero link quebrado" aplicado à caixa de duas etapas,
e a caixa **fecha sem guardar** de propósito: uma que só fechasse depois de
baixar apagaria o gesto que a lição existe para mostrar.

Os três métodos existem porque um programa tem todos os comandos, e cada um
traz **o que ele não cobre** escrito ao lado. Um método sem esse lado seria a
plataforma recomendando dentro do programa imitado, e a escolha do requisito
4.2 deixaria de ser da pessoa.

**O que se lê de um aplicativo autorizado é o último uso, e não um `emUso`.**
Um campo booleano seria a resposta impressa na tela: o desbravador leria "em
uso" e revogaria o resto sem ter olhado nada, que é o contrário de *revisar*.
E revogar todos é mais rápido e quebra a inscrição do acampamento, que passa
pelo aplicativo dos formulários — quem o desligou não vai desconfiar dele
quando as inscrições pararem de chegar.

**Meta de preservação abre verde, e por isso vira condição.** "Sem tirar o que
o clube usa" e "sem sumir da busca" são verdadeiras no segundo zero, e como
item próprio da lista ensinariam a não ler a lista. `metasDaCcEs005.test.ts`
reprovou as duas na primeira execução. Elas viajam como conjunção de cada meta
que revoga ou que fecha — a decisão de "sem alterar uma palavra do texto" na
CC-ES002 —, e aí "Deixar tudo privado" deixa as **duas** metas de privacidade
vermelhas, e não uma terceira que a pessoa leria como detalhe à parte.

**Consulta de vazamento que não acha nada não é atestado.** Ela responde sobre
as listas públicas que consultou, e o programa diz isso em vez de escrever
"você está seguro" — é o erro mais fácil de ensinar aqui. O que dá para onde ir
ao requisito 4.4 é `vazamentosQueAindaValem`: vazamento de 2022 cuja senha já
foi trocada é história, vazamento de abril cuja senha nunca mudou é a conta
aberta agora. A comparação é de mês, e as duas datas são `AAAA-MM` porque dia
e hora seriam precisão que a lista pública não tem.

**A ordem do requisito 6 custa, e a simulação deixa isso acontecer.** Encerrar
as sessões antes de trocar a senha põe para fora alguém que **ainda sabe a
senha**: ele volta no minuto seguinte, e o que se perdeu foi o celular de quem
trabalha no clube. Uma simulação que o mantivesse fora depois de um clique
ensinaria que a ordem dá na mesma, que é o que o requisito existe para
desmentir.

E `portasAbertas` nomeia as três que a senha nova **não** fecha — a recuperação
que ele trocou para o endereço dele, o crachá de aplicativo que é separado da
senha, e a regra de encaminhamento, que nem precisa que ele volte: a conta
manda tudo sozinha, todo dia, e a caixa de entrada continua exatamente igual.
Cada uma sobrevive ao fechamento das outras, e isso é testado nas três
direções.

**Os indícios de uma mensagem se comparam por conjunto igual, e não por
conjunto que contém.** Exigir só que os verdadeiros estejam marcados deixaria
"marque todos os sete em todas" passar com louvor. E há **mensagem verdadeira**
na caixa, pela mesma razão do Aceitar Todas: sem ela, "denuncie tudo" é a
resposta certa, e o que a lição ensina é desconfiar de toda mensagem — que é
inútil, porque ninguém vive assim e todo mundo volta a clicar em tudo na semana
seguinte.

As duas verdadeiras derrubam as duas regras erradas que alguém aprenderia
depressa: a da secretária **tem prazo** e não é golpe, porque o indício é a
ameaça junto do prazo; a do provedor **tem link** e não é golpe, porque o
indício é o link cujo texto discorda do destino. E o destino de verdade aparece
na barra de baixo ao apontar, como no navegador — escrevê-lo ao lado do link
poria na nossa tela a resposta que o programa imitado já dá na dele.

**Toda mensagem pede um veredito, e são dois botões e não um que alterna.** A
trava que clica achou isto: sem um gesto para "li e é verdadeira", a mensagem
honesta ficava sem análise nenhuma, e não ter opinião era indistinguível de
nunca ter aberto a mensagem — quem fizesse exatamente o que a lição pede não
conseguia fechá-la.

**O gerador entregava a mesma senha duas vezes.** Ele sorteava ao montar e
guardava o valor, então usar a senha gerada em duas contas punha a **mesma**
senha nas duas: o cofre da plataforma cometendo exatamente a reutilização que
a lição existe para desfazer, com o medidor dizendo "forte" nas duas. Um
gerenciador de verdade sorteia outra assim que a anterior é usada.

**A regra do botão desligado vem depois da do principal, e não antes.** Mesma
especificidade, então escrita primeiro ela perde: o botão principal desligado
saía azul e branco, com cara de clicável, e clicar não fazia nada — que é o que
ensina a desconfiar do programa. Estava nas **duas** janelas novas. É a mesma
ordem que o diálogo do celular precisou na CC-ES001 e na CC-ES004, e errá-la
não estoura nada; a trava lê a **ordem** na folha, e uma segunda cobra que o
desligado troque o fundo, porque um retângulo azul continua parecendo botão por
mais clara que fique a palavra dentro dele.

**E a crase dentro de comentário de template de CSS fechou a string pela
quinta vez**, no primeiro arquivo escrito no dia. Está escrito acima, aconteceu
de novo, e o `tsc` pegou — como sempre pega.

**A alternativa certa era a mais comprida em 79% das questões.** Não foi
descuido pontual: é um hábito de escrita, o de pôr o porquê dentro da
alternativa certa enquanto as erradas ficam secas. Quem nunca estudou passaria
escolhendo a mais longa, que é exatamente a estratégia que
`qualidade.test.ts` existe para reprovar — e ele reprovou. O porquê já tem
lugar próprio, o campo `explanation`, e a certa voltou a ser uma afirmação
curta: 79% viraram 4,7%.

**A CC-ES006 é um programa em duas telas, e por isso o `tipo` é um só.** A
lista de arquivos da nuvem e o editor de documento são duas telas do mesmo
serviço, como a tela inicial e o documento são duas telas do leitor de PDF — e
quase toda lição começa numa e termina na outra. Dois tipos diriam que são
dois programas, e a lição teria de escolher entre eles. O campo é `licao`,
como na CC-ES005, e um `Record` sobre a união faz a décima não compilar até
alguém dizer de que estado ela parte e que arquivo ela abre.

**O documento não nasce aqui.** É o `Doc` da CC-ES002, com os trechos, as
marcas de revisão por autor e os comentários com resposta e resolução — e o
papel continua sendo desenhado por `FolhaDoWord`. Não é economia: é a razão de
o requisito 1 pedir aquela vereda antes desta. O modo de sugestão do editor de
navegador **é** a marca de revisão do Word vista de outro ângulo, e os
comentários são os mesmos comentários. O que muda entre os dois programas é a
**casca**: o Word tem barra de título, faixa e guias; o editor de navegador
tem o nome do arquivo em cima, um menu de palavras e as bolhas de quem está
junto.

**E a folha passou a aceitar digitação, em `word.tsx`.** Os laboratórios da
CC-ES002 formatam, e nunca escrevem; esta vereda escreve. `aoEscreverNoParagrafo`
entra pela presença do setter, então aqueles quatro laboratórios não mudam —
e entra **na janela compartilhada**, e não numa segunda folha ao lado, pela
razão de `word.tsx` existir. Só parágrafo simples a aceita: digitar por cima
de um campo apagaria a diferença entre o número calculado e o digitado, e por
cima de uma marca de revisão desfaria calado a proposta de outra pessoa.

**A primeira vereda a abrir com duas exigências.** CC-ES002 e CC-ES005, e está
escrito no requisito 1. A lista já existia — as de escritório anunciadas
declaram duas e até três —, e esta é a primeira em que ela vale para alguém:
guardar só a primeira abriria a vereda para quem não fez a outra, e
`veredasQueFaltamAntes` nomeia as duas em vez de mandar a pessoa concluir uma
e voltar para descobrir que falta outra.

**A permissão da pasta alcança o que está dentro, e vence a do arquivo.**
`papelDe` toma o mais permissivo entre o que o arquivo dá e o que cada pasta
acima dele dá. O efeito é o que ninguém espera: pôr um arquivo restrito dentro
de uma pasta compartilhada com o clube **não o restringe** — ele continua com
o "só você" escrito na caixa dele, e todo mundo o abre. É a ficha médica das
crianças, e o conserto é **mover**: tirar o nome de cada pessoa da caixa do
arquivo não tira nada, porque não há nome nenhum lá.

**E a janela não pode contar isso.** A lista nunca escreve o papel de ninguém,
nem como texto para leitor de tela — resolveria o requisito 5 numa palavra, e
só para uma parte das pessoas. O selo "Compartilhado" lê o acesso **próprio**,
e não o efetivo: lido do efetivo, ele marcaria a ficha médica e diria em uma
sílaba o que a lição manda descobrir. E quem herda pela pasta aparece
**recolhido**, como a nuvem de verdade faz — expandido poria a resposta na
nossa tela, escondido faria o programa mentir. Recolhido, ninguém abre, que é
por que o arquivo fica aberto sem ninguém saber.

**Dar permissão de editar não é dar a conta.** O arquivo mora na conta do
dono, e some com ela — por mais gente que tenha acesso. Transferir a
propriedade é gesto separado, e mora **dentro** do seletor de papel, que é
onde a nuvem o esconde: é por isso que o requisito 4.6 existe como
demonstração. E transferir não é perder: quem entrega continua editor, senão
ninguém transferiria nunca e o clube ficaria com tudo na conta de uma pessoa.

**Restaurar uma versão não apaga as mais novas: acrescenta uma.** É a metade
do requisito 4.5 que decide se alguém usa o recurso — quem acha que restaurar
destrói o que veio depois nunca restaura, e refaz o trabalho à mão. O painel
**escreve** isso, e um painel sem essa linha funciona perfeitamente e ensina o
medo. E o histórico nomeia quem **escreveu**, nunca quem leu: um histórico que
contasse leitura deixaria "produzimos juntos" verdadeiro para quem só abriu, e
para quem colou o texto das outras duas.

**O conflito é do arquivo sincronizado, e a cópia vai para a lixeira.** No
navegador não há conflito: as duas edições entram e nada precisa ser
resolvido. O conflito nasce na pasta que sincroniza com o computador, quando a
internet de alguém volta — e a nuvem guarda as duas, com a segunda virando um
arquivo ao lado. O trabalho não se perde por ser sobrescrito: se perde por
ficar num arquivo que ninguém abre, na mesma pasta, com nome quase igual.

Resolver pede as duas metades, e a cópia vai para a **lixeira** em vez de
deixar de existir. Apagá-la de verdade deixaria a nuvem igualzinha à de quem
nunca teve conflito nenhum, e aí "não há cópia em conflito na pasta" seria
verdade no segundo zero: a meta abriria verde.

**A meta que apagava a própria prova.** "Provocar o conflito" lia
`copiasEmConflito`, e a meta duas linhas abaixo manda tirar a cópia da pasta —
quem fizesse tudo certo via a primeira tarefa ficar vermelha de novo no fim,
com uma lista que nunca fecha. É o defeito que a CC-ES004 teve na lição de
assinar, e desta vez a trava o achou antes de alguém clicar. "Propor em modo
de Sugestão" tinha a mesma forma, e lê a descoberta — que não sai de graça: ela
só é gravada quando o que se digita vira marca em vez de virar texto.

**As metas de preservação são condição, e não item da lista.** O link deixado
restrito, a pasta do clube deixada compartilhada, nenhuma cópia solta na mão
do Ronaldo — as três são verdadeiras antes de alguém fazer qualquer coisa, e
como item ensinariam a não ler a lista. Cada uma viaja conjugada com a meta que
de fato pede um gesto, de modo que o caminho rápido e errado deixa **aquela**
meta vermelha.

**Enter leva o cursor junto.** `paragrafoDepoisDe` devolve o id do parágrafo
novo, e o editor o seleciona. Sem isso aparece uma linha em branco e o que se
digita continua entrando na linha de cima: a tecla parece quebrada e nada
estoura. Foi a trava que clica quem achou, junto com "Mover para a lixeira"
travado por propriedade — a cópia em conflito é do dono do **original**, e não
de quem a provocou, então o único gesto que o requisito 6 pede vinha
desligado.

**E as outras pessoas escrevem depois da sua primeira edição, e não num
relógio.** Um temporizador faria a lição depender de esperar, e uma trava que
clica nunca saberia quanto. Além disso, o que o requisito 4.2 manda ver é que
as duas edições entram sem uma esperar a outra — o que só se vê quando a sua
já está lá. Cada consequência acontece uma vez: uma linha da Marta por tecla
seria um documento que ninguém lê.

**O contador de folhas media 2,64:1, desde a CC-ES002.** `#A19F9D` é o cinza
do Word, e ele funciona lá porque a interface inteira daquele programa é
clara; aqui ele pousa numa mesa mais escura, a 9px, e é a única legenda que a
folha tem. Hoje é `#706E6C`, a 5,08:1. E as bolhas de presença desenhavam
"Você" duas vezes, porque você costuma estar na lista de acesso **e** ser quem
abriu — duas bolhas iguais dizem que há duas pessoas com o seu nome dentro do
documento, numa lição cujo assunto é quem está ali.

**A correta mais comprida se mede na vereda, e não no corpus.** A trava de
`qualidade.test.ts` soma todas as lições de todas as trilhas e veredas, e
sessenta e uma questões novas se diluem em mil e quinhentas: a CC-ES006 abriu
com 18% das questões entregando a resposta pelo tamanho — a pior com sessenta
e quatro caracteres de vantagem — e a trava passou. Ela está certa sobre o
corpus e não diz nada sobre o arquivo novo. Medir o arquivo sozinho, antes de
abrir, é o que pega isso; 18% viraram 8,2%.

**Trilha nova não estende o laboratório da trilha anterior.** O requisito 7 da
AP044 pede nove coisas num editor de texto, e o caminho barato era acrescentar
nove tarefas ao laboratório de formatação da AP042. Seria mudar o que a trilha
anterior avalia como concluído: quem já entregou aquele documento veria tarefas
novas aparecerem num exercício que ele fechou. `EstilosTextoLab` é outro
laboratório, na **mesma janela** de `word.tsx` — o desbravador reencontra a
faixa que já conhece, com grupos novos onde eles de fato estão: Estilos em
Início, Colunas em Layout, Sumário e Nota de Rodapé em Referências, que é uma
guia que ele nunca teve motivo de abrir.

E o documento dele chega **escrito por inteiro**, o que é o contrário da regra
de sempre e é o ponto: título, três seções, oito itens, versículo. Na tela
parece um manual acabado, e é por isso que o painel abre com nove tarefas
vermelhas sem que se veja o que falta. O que falta aparece num clique — mandar
gerar o sumário, que sai vazio porque não há um único parágrafo marcado como
título.

**O sumário guarda o que leu, e é essa a metade da lição que ninguém conta.** No
Word ele não se refaz sozinho: trocar um título depois de gerar deixa o sumário
mostrando o texto velho, e nada na tela avisa. Se a tarefa apenas conferisse
"existe sumário", o desbravador entregaria um manual cujo sumário diz MANUAL DO
ACAMPAMENTO DE INVERNO em caixa alta — o título que ele consertou — e a
plataforma daria por bom. A trava confere que ele está em dia, e o botão
Atualizar Sumário existe porque é o que o alcança.

**Estilo de parágrafo e estilo de caractere não são a mesma coisa**, e não é
detalhe de implementação: é a razão de Ênfase não entrar no sumário e Título 2
entrar. Os dois moram lado a lado na mesma galeria, que é onde o Word os põe.
Realce entra pela mesma porta: ele pinta e não diz nada ao programa, então o
sumário não fica sabendo dele.

**Ninguém digita vinte e cinco fichas para provar que sabe montar um banco.**
O requisito 6 da AP044 pede uma agenda com nome, endereço, telefone e e-mail de
vinte e cinco pessoas, e digitar cem campos numa tela simulada ensina a digitar.
O que se mede é **montar**: declarar os campos, dizer o tipo de cada um, e então
pôr os dados lá dentro — e o jeito de verdade de pôr vinte e cinco pessoas num
banco é **importar**.

O assistente de importação é a teoria inteira virando gesto: ele pergunta,
coluna por coluna, a que campo ela corresponde. E ele **erra**, porque as
colunas do clube se chamam "Zap" e "Onde mora" — sem nome para casar, ele cai no
palpite por posição e troca duas. Assistente que chegasse certo seria uma tarefa
que abre resolvida; aceitar o palpite põe endereço no telefone e nada estoura,
que é exatamente o que a lição de teoria diz sobre o dado na coluna errada.

**Telefone parece número e é texto**, e escolher Número não estoura: a coluna
aceita, e o que se perde são os parênteses, o traço e o zero da frente. Aqui o
programa diz isso em vez de deixar acontecer calado — é a mesma decisão do
"selecione primeiro" do laboratório de Word. Por isso todo telefone da lista de
origem vem escrito `(61) 99999-0000`: sem parêntese e sem traço, a armadilha não
teria o que destruir, e `metasDaAp044.test.ts` cobra a forma.

**O tipo diz o que cabe; a regra de validação diz o que vale.** São tarefas
separadas porque são coisas separadas, e a teoria da CC-AP044 dizia que existia
um "tipo e-mail" — o que nem o Access nem o LibreOffice Base têm. Foi o
laboratório que expôs a divergência, e ela se corrige no lado da lição:
referência que diverge do que o laboratório mostra é pior do que referência
nenhuma. Uma ficha da lista tem e-mail sem arroba justamente para a regra ter o
que recusar; sem ela, escrever a regra seria um clique que não muda nada na
tela.

**O que não viaja dentro do arquivo não conta.** Inserir vídeo tem dois
caminhos que se parecem na hora de clicar: incorporar põe o arquivo dentro da
apresentação, vincular guarda só o endereço. Os dois se chamam "inserir", e a
diferença aparece longe de casa — no computador do clube, com o quadro preto e
ninguém entendendo por quê. Se a tarefa aceitasse os dois, o desbravador
entregaria uma apresentação que abre quebrada e a plataforma daria por boa.

A diferença é mostrada onde o PowerPoint de verdade a mostra: o vinculado
escreve o caminho do arquivo embaixo do quadro, que é o que o painel de
informações relata. Inventar um "prévia no pen drive" dentro do programa imitado
seria pôr coisa da plataforma dentro dele — o contrário do que a moldura existe
para fazer.

**Quatro gestos são quatro condições, e não um número de slides.** O item c) do
requisito 9 pede criar, duplicar, reorganizar e excluir. Contar slides deixaria
passar quem excluiu dois e criou dois: o total fecha e nada foi aprendido. Cada
gesto tem a marca dele — o vazio sumiu, o encerramento está no fim, existe cópia
de um slide que já existia, e existe um slide que ninguém tinha.

**E o PDF congela o que existir na hora**, como o sumário do Word guarda o que
leu. Exportar cedo e continuar mexendo é o que se faz sem pensar, e o PDF
entregue fica sem os slides que vieram depois, sem nada na tela dizendo isso.

**A janela do Excel saiu do laboratório e virou `excel.tsx`.** Ela morava
dentro de `PlanilhaLab.tsx`, e saiu no dia em que a AP044 precisou de um segundo
laboratório de planilha — antes de a cópia existir, e não depois. É a mesma
decisão de `word.tsx`, e pelo mesmo motivo escrito lá: duas cópias divergem no
primeiro ajuste, e a plataforma passa a mostrar dois "Excel" diferentes. O
`PlanilhaAvancadaLab.test.tsx` monta os dois laboratórios e compara a fileira de
guias, a barra de título, as abas do pé e a barra de status.

**Os dois números da planilha filtrada.** A tela mostra ao mesmo tempo a célula
do total, que é a `SOMA`, e a barra de status, que soma o que está à vista —
como o Excel de verdade faz. Com filtro aplicado eles **não batem**, e é aí que
a lição acontece: quem não sabe disso lê o número da célula e o manda para a
liderança. `SUBTOTAL` é a fórmula que respeita o filtro.

A tarefa exige as duas coisas — a fórmula trocada **e** um filtro aplicado.
Escrever `SUBTOTAL` numa planilha sem filtro é trocar uma coisa que não estava
errada, e a lição inteira é a diferença entre os dois números, que só existe com
linha escondida.

**E o tipo do gráfico sai da pergunta.** A pergunta aqui é de evolução — como a
inscrição cresceu mês a mês —, e só a linha responde. Pizza e colunas desenham
sem erro nenhum: se a tarefa aceitasse qualquer tipo, ela mediria ter clicado em
Inserir. O programa explica por que a escolha errada não responde, em vez de só
deixar a tarefa vermelha.

**Cco não é "o terceiro campo".** Uma mensagem com uma família no Cco e as
outras cinquenta e nove no Para tem o campo preenchido e vazou tudo. O que a
tarefa mede é o **vazamento não ter acontecido** — quantos endereços ficam
visíveis —, e não o Cco estar vazio ou não.

E enviar errado não é bloqueado: a prévia diz, antes do clique, quantos
endereços cada pessoa vai ver; depois do clique a mensagem está enviada, a
tarefa continua vermelha, e o jeito de consertar é escrever de novo. Simulação
que vira muro no primeiro desvio ensina a andar no trilho, e "o que sai não
volta" é a lição.

**A assinatura configurada e nunca usada não demonstra nada** — é a família do
"zero link não é zero link quebrado", e a tarefa exige que ela tenha saído numa
mensagem.

**A ferramenta é a mesma; o disco responde por si.** A máquina do laboratório de
Configurações tem um SSD e um HD, e é isso que faz a lição do requisito 13
existir: na janela de otimizar, a coluna "Tipo de mídia" diz qual é qual, e o
botão troca de nome sozinho — Otimizar no SSD, Desfragmentar no HD. Ensinar a
desfragmentar SSD é ensinar a gastar a vida útil do disco à toa, e o Windows de
verdade já mostra isso escrito ali. A tarefa exige passar pelos dois: com um
disco só, a diferença não é vista.

**E "abrir com" não é "definir padrão".** Um vale para aquele arquivo, desta
vez; o outro muda a regra para todos os arquivos daquele tipo. A tarefa do
"abrir com" só fecha se o padrão **não** tiver mudado junto — é a diferença que
faz alguém abrir uma foto no editor uma vez e passar a abrir todas ali.

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

**São duas marcas, e a regra é a mesma.** `Trilha.Web()` é a plataforma;
`Token.Web()` é o certificado que ela emite, de trilha e de vereda. As duas em
Space Mono Bold, e nas duas os parênteses em `#C13516` — que é o
`--color-primary` da plataforma, e não um hexadecimal escrito à parte. Os
parênteses são o que diz que o nome é uma chamada de função, e não uma frase
com pontuação sobrando; sem eles pintados a marca lê como um nome com um par de
parênteses vazios esquecido no fim.

A regra é uma só de propósito. O clube encontra os dois nomes na **mesma tela** —
a de entrada traz a plataforma no alto e "Recebeu um Token.Web()?" logo abaixo —,
e vestir um e não o outro ensinaria que um deles é nome próprio e o outro é
texto comum, quando os dois são a mesma ideia.

Vale **em toda parte**: a digitação da tela de entrada, a barra fixa, o nome
citado no meio de um parágrafo e os rodapés das fichas em PDF. O cursor da
digitação é do mesmo vermelho — era `currentColor`, que na barra fixa é branco.

**Nenhuma tela escreve nenhum dos dois à mão.** Eles moram partidos em
`src/lib/marca.ts`, em `MARCAS` — TypeScript puro, sem React, porque quem
desenha no papel é o jsPDF, que não lê folha de estilo. Na tela vem
`<MarcaEmTexto />` para a plataforma e `<MarcaEmTexto marca="token" />` para o
certificado, ou `comMarca(frase)` quando o nome chega no meio de um texto já
montado por interpolação: a frase continua sendo `string`, que é o que vai para
o PDF, e quem veste a marca é a tela na hora de desenhar. `partirNaMarca`
procura as duas numa alternação só, e não uma de cada vez — partir duas vezes
devolveria os pedaços fora de ordem na frase que cita as duas, e há uma dessas
na tela de entrada.

A trava de `marca.test.tsx` olha para o **texto do JSX**, e não para toda
ocorrência dos nomes — `pdf.ts`, `reportNarrative.ts`, `relatorioDeVeredas.ts` e
o `ReportPage` guardam o nome em literal de propósito. Atributo também é
literal, e é onde os dois seguem crus com razão: o `title` do selo do `Emblema`
e o `aria-label` da estante de insígnias são texto que o navegador **lê**, e não
texto que ele pinta — é também por isso que os nomes de insígnia no catálogo
(`Primeiro Token.Web()`) não pedem migration nova. Ela apaga comentários e
literais antes de procurar, e confere que ainda enxerga um nome plantado no meio
do JSX: um apagador que engolisse o arquivo inteiro aprovaria qualquer coisa,
calado.

**No PDF vem a cor e vem a fonte — e antes não vinha.** A decisão anterior era
"a cor vem, a fonte não": o jsPDF desenha em Helvetica, uma das 14 do padrão, e
embutir a Space Mono parecia caro para servir a três rodapés. A conta mudou
quando o relatório ganhou capa: a marca deixou de ser rodapé e passou a abrir o
documento que o clube arquiva, que é onde ela mais é vista fora da tela — e uma
marca em Helvetica no papel e em Space Mono na tela são duas marcas.

O custo também acabou. O TTF **não** entra no pacote: ele fica em
`public/assets/fonts/`, ao lado do woff2 que a folha de estilo já carrega, e
`marcaEmPdf.ts` o busca na hora de gerar o PDF — o mesmo caminho pelo qual a
arte do certificado já vem. Quem nunca gera um PDF nunca baixa a fonte. Se ela
não chegar, o documento sai em Helvetica com a cor certa: derrubar a emissão de
um certificado porque uma fonte não carregou é trocar defeito de estilo por
defeito de função, na hora da vitória de alguém.

A fonte veste o **nome inteiro**, e por isso `partirNaMarca` devolve três
partes e não duas: `fora`, `miolo` e `parenteses`. Com dois estados o miolo
vinha marcado como prosa comum e saía em Helvetica bem no meio da marca. E
medir passou a ser trabalho: a Space Mono é mais larga, então centralizar pela
largura em Helvetica tira a linha do meio da página — quem mede é
`larguraComMarca`, somando pedaço a pedaço com a fonte certa em cada um.

Centralizar já cobrava desenhar à mão: `align: 'center'` centraliza cada chamada
de `text` separadamente, então os pedaços sairiam empilhados no mesmo ponto. O
corpo do relatório em PDF continua de fora: lá o nome cai no meio de parágrafo
quebrado em linhas, e colorir dentro da quebra pediria reimplementar a quebra.

**Consulta que volta para tela que já saiu não avisa, e depois avisa errado.**
Efeito busca, a pessoa sai, a resposta chega e o `setX` cai num componente que
não existe mais. No navegador o React ignora e segue — é desperdício e nada
mais. Num ambiente já desmontado é **erro**: ele procura o `window` para
decidir a prioridade da atualização e não acha. O `ci.yml` reprovou duas vezes
assim, com todos os testes passando e nenhuma asserção quebrada — a execução
saía vermelha por uma rejeição não tratada depois do fim de um arquivo de
teste. É a pior forma de reprovar, porque tem cara de flake: ganha-se a corrida
numa máquina e perde-se noutra, e ninguém desconfia do código.

São duas guardas, e qual usar depende de onde o `setX` mora. Dentro do próprio
efeito, `let vivo = true` com `return () => { vivo = false; }` ao lado. Quando a
função que escreve é **devolvida** ao chamador — o `refresh` de um gancho, que a
tela também chama —, a variável do efeito não a alcança, e aí é o ref de
`useMontado`. Ele nasce `true` e volta a `true` ao montar, porque o `StrictMode`
desmonta e remonta de propósito no mesmo fiber: guarda que só sabe descer
deixaria o gancho morto pelo resto da sessão, sem nada dizendo por quê.

E `setX(await f())` não tem onde receber guarda — a espera acontece dentro do
setter. Parte-se em duas linhas.

**`position: fixed` só mede a janela enquanto nenhum ancestral filtrar.**
`transform`, `filter` e `backdrop-filter` viram bloco de contenção, e aí o
`inset: 0` de um modal passa a ser o retângulo daquele ancestral, e não a tela.
O `.card` da plataforma tem `backdrop-filter` — é o vidro fosco dele —, então o
cartão de explicação da insígnia, chamado de dentro de um cartão, escurecia só
a área daquele cartão e se centrava dentro dela: metade do cabeçalho saía por
cima da borda, levando junto o nome da insígnia e o botão de fechar.

Quem vê isso é navegador; o jsdom não calcula bloco de contenção nenhum, então
nenhum teste de unidade pega o sintoma. O que se testa é a promessa —
`ExplicacaoDaInsignia` se desenha no `body`, por `createPortal`, e não onde o
JSX o põe. Assim "ocupa a tela" é verdade seja de onde for que alguém o chame.

**O contador da home dizia o nome da tabela.** "890 XP", "3 dias", "82
**badges**" — o nome da tabela do banco, escrito na tela, ao lado de dois
rótulos em português. Não estoura e não confunde ninguém que já conheça a
plataforma; o que ele faz é dizer ao desbravador de dez anos que a coisa se
chama assim, e aí "insígnia" — a palavra que a estante, o relatório, o perfil e
o aviso de conquista usam — passa a parecer sinônimo de outra coisa.

`vocabulario.test.ts` ganhou a segunda regra, e ela olha para **menos** do que a
primeira, de propósito. "Percurso" é palavra portuguesa e só erra quando chega
à tela, então lá vale todo literal. "Badge" é nome de tabela e de campo, e
aparece com razão em `from('badges')`, em `badge_id` e no código de toda
insígnia do catálogo — procurar em todo literal daria dezenas de acusações a
código que está certo, e trava que se aprende a ignorar não é trava. Então ela
lê só o que é de fato pintado ou anunciado: texto de JSX e os atributos que o
navegador mostra ou lê em voz alta.

**O que a vereda rende não contava em escada nenhuma.** As escadas de Lições e
de Módulos se alimentam de duas coisas que a vereda não tem: `lesson_attempts`,
que só a lição de trilha escreve, e requisito cumprido, que ela não guarda de
propósito. O efeito era que catorze lições de vereda vencidas somavam **zero**
em toda escada menos a de Veredas — quem percorresse três veredas inteiras e
nenhuma trilha via a estante dizer que não tinha estudado. É a família do
"número guardado não responde por hoje": o contador mostra um número plausível,
que é o que se espera de um contador funcionando.

Contar o que a vereda tem não desfaz a decisão de ela não virar uma
`Specialty`. Requisito oficial ela continua não tendo, e inventar um a puxaria
para dentro do percentual e do XP, que é o contrário de bônus. O que ela tem
são lições a vencer e módulos a fechar, e é exatamente isso que essas escadas
contam.

**E a de Requisitos também, porque a trilha já a conta assim.** Lá, passar numa
lição grava o `requirement_progress` dos códigos que ela cita: a mesma lição
anda na escada de Lições **e** na de Requisitos. Deixar a vereda fora da
segunda não seria neutralidade, seria dar à lição dela metade do valor da lição
de trilha — pela falta de um código oficial que ela não vai ter. Quem responde
é a lição, que é a unidade que a vereda pede que se demonstre.

São dois nomes para o mesmo número hoje, e mesmo assim `requisitos` é campo
separado em `ConquistasNasVeredas`: somar `licoes` nas duas escadas lá dentro
do resumo esconderia a escolha numa linha com cara de erro de digitação. O
número alimenta uma escada só — `escadasDeInsignia` é o único leitor —, e não
entra em percentual nenhum.

`conquistasNasVeredas` mora em `lib/veredas.ts`, com as outras regras puras, e
não dentro de `montarResumo`: o resumo fala com o banco, e conta escondida lá
dentro só se testaria subindo um. Ela lê os mesmos eventos que o resumo já
buscou — nenhuma consulta nova, nenhum campo novo —, e o histórico de quem
percorreu vereda antes disto entra junto, porque os eventos sempre estiveram lá.

Duas guardas. Módulo sem lição nenhuma não conta, que é o "zero de zero é tudo"
de novo, agora premiando módulo que ninguém percorreu; e o registro de vereda é
**parâmetro** com o de verdade por padrão, porque hoje vereda anunciada vem com
a lista de módulos vazia e não com módulo vazio dentro — sem o parâmetro, a
guarda seria código que ninguém nunca leu e a trava passaria sem conferir nada.

E há um buraco entre a conta e a soma que é calado dos dois lados: campo novo
aqui vale zero na estante de todo mundo sem nada reprovar, porque toda trava
deste arquivo continua verde conferindo a conta, que está certa. A trava lê a
fonte de `montarResumo` e cobra **cada** campo do retorno — tirados do próprio
retorno, e não de uma lista escrita à mão, que é o que deixou de conferir a
AP043 e a AP044 no dia em que elas abriram.

**O mural mostrava "Vereda teoria".** Os eventos de vereda não tinham frase, e
caíam na saída de último recurso: o `event_type` cru com os sublinhados
trocados por espaço. Catorze lições viravam catorze linhas iguais, sem dizer de
qual vereda nem de qual lição, ao lado de "AP041 · Laboratório concluído:
Mexendo em pastas e arquivos" no mesmo mural, para a mesma pessoa.

Tudo o que a frase precisa já estava gravado: o **id** da vereda e o **id** da
lição. O nome de campo antigo também é lido — quando a vereda se chamava
mini-trilha o id dela ia em `trilha` —, pela regra de sempre: uma decisão nossa
não se cobra de quem já andou.

E a trava que cobra isso não procura a palavra "vereda" na frase, porque as
frases certas também a têm: ela compara com o que a saída de último recurso
produziria. Evento de vereda novo sem frase reprova ali.

**Trilha se chama trilha; vereda se chama vereda.** No código as duas precisam
de um nome que sirva às duas — o certificado é o mesmo documento, o emblema é o
mesmo componente, o relatório lista as duas —, e "percurso" é esse nome. De
dentro do código ele escorregou para a tela: "Percurso bloqueado" no selo do
emblema, "Percurso" no cabeçalho da contabilidade do clube, "está em percurso"
no relatório entregue à liderança.

Nada disso estoura, e o estrago é lento: a plataforma passou meses
estabelecendo que as duas são coisas diferentes — vereda não tem requisito
oficial, não tem nota, não entra em percentual nenhum —, e uma terceira palavra
que cobre as duas desfaz isso em silêncio. Quem lê "percurso" não sabe qual das
duas está vendo.

Na tela, então, só trilha e vereda. Como nome de identificador a palavra
continua valendo, e é por isso que ela aparece tanto neste documento:
`percursoDoCertificado` responde pelos dois currículos e precisa de um nome que
sirva aos dois. `vocabulario.test.ts` lê a árvore do TypeScript e olha só para
texto de JSX e literais — comentário não é nó e fica de fora sozinho, e o miolo
de `${...}` também, porque ali dentro é código. A CC003 é a exceção declarada:
lá "o caminho absoluto diz o percurso inteiro" fala de pasta, e é português
comum.

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

## Ninguém faz a mesma prova duas vezes

A ordem das questões era a mesma para todo mundo, e o conjunto perguntado era
o conjunto inteiro. "A terceira é a certa da segunda" é um recado que se passa
adiante em dez segundos e vale para sempre — e quem o recebe atravessa o módulo
sem ler uma linha. São três medidas, e as três se multiplicam:

- **as alternativas embaralham** — isto já existia, e o `porque` de cada errada
  continua colado nela porque o retorno é por id, e não por posição;
- **a ordem das questões embaralha** — quem decorou "a 5 é a do relógio" perde
  a referência;
- **o reservatório é maior do que a prova** — com x+3 escritas e x perguntadas,
  duas tentativas quase nunca trazem o mesmo conjunto.

Tudo isso mora em `sortearQuestoes`, em `src/lib/questoes.ts`, e vale para
lição de trilha, teoria de vereda e prova final — as três passam por ela.

**A lição diz quanto pergunta, e a prova diz numa tabela.** `perguntas` é um
campo da lição; a prova usa `PERGUNTAS_POR_PROVA`, em `finalExams.ts`. Sem
declarar nada, pergunta-se tudo — que é o que a plataforma sempre fez, e o que
continua acontecendo em lição que ainda não ganhou extras. **A mudança de
comportamento acompanha o conteúdo, e não a data do deploy.**

Declarar sem ter as extras seria pior do que não declarar: a lição encolheria
em silêncio, cobrando menos do que o requisito pede. `qualidade.test.ts` cobra
os dois lados — reservatório de pelo menos `perguntas + 3`, e nunca menos de
três perguntas, porque numa prova de duas questões cada acerto vale 50% e o
`LIMIAR_DOMINIO` para de medir qualquer coisa.

**Na prova final, o sorteio cobre antes de completar.** Cada prova foi escrita
para cobrir os requisitos da trilha, e a nota é uma porcentagem sobre o que foi
sorteado — não uma marcação requisito a requisito. Enquanto nenhuma questão
dizia o que media, sortear era abrir buraco às cegas: requisito com uma questão
só podia não cair.

Hoje toda questão de prova declara em `requisitos` os códigos que ela mede — e
uma pode medir vários, como a de ligar sete termos às definições. `sortearCobrindo`
monta primeiro o conjunto que toca em todo requisito e só então completa ao
acaso; `minimoParaCobrir` conta esse conjunto sem sortear, e é o piso que a
trava confere. **As duas usam o mesmo laço**, de propósito: por uma hora foram
dois parecidos, e aí a trava passaria a conferir uma conta que o sorteio não
faz.

A lição não declara requisito, e não é esquecimento: as questões dela são todas
do mesmo assunto, que já está em `requirementCodes` — qualquer subconjunto
cobre o que ela ensina.

**Ligar as questões aos requisitos mostrou o que a prova não perguntava.** A da
AP034 nunca mencionava website, site de busca nem filtros de conteúdo; a da
AP042 nunca mencionava o tipo de monitor. Quatro requisitos de teoria que a
trilha ensina e a prova não cobrava — e as duas diziam, no próprio comentário,
que cobriam os requisitos. Ganharam questão, e a trava agora exige que todo
requisito que não seja de prática tenha pelo menos uma.

**E a prova cobra requisito de prática medindo o que governa o gesto.** As cinco
provas cobrem hoje todos os requisitos das suas trilhas, os de fazer inclusive —
o pacto de uso, as marcas de HTML escritas à mão, copiar e mover pasta, produzir
imagem com IA. Quem mede o gesto é o laboratório, que observa cada um acontecer;
a prova mede a decisão que está por trás dele. Não "você assinou o pacto", e sim
o que cada cláusula evita; não "você copiou uma pasta", e sim o que copiar e
mover deixam no lugar de origem; não "você baixou um arquivo", e sim o que um
nome terminado em .pdf.exe faz com quem lê só o começo. Escrever a pergunta como
autodeclaração — "você fez?" — seria devolver à prova exatamente o que a
plataforma inteira evita.

**Questão que mede vários requisitos é o que mantém a prova curta.** O piso do
sorteio não é o número de requisitos: é quantas questões bastam para tocar em
todos. Uma de associar que liga sete marcas ao que cada uma produz cobre sete
gastando uma vaga — e foi assim que as cinco provas passaram a cobrir tudo com o
piso **caindo**, e não subindo. É o que `minimoParaCobrir` conta, e a trava
confere.

**Trava que lê o sorteio não é trava.** Ligar o sorteio na prova fez dois testes
passarem a examinar uma amostra onde eles queriam examinar o que foi escrito: o
de enunciado repetido compararia o subconjunto do dia, e duas questões iguais
escapariam até o sorteio trazer as duas juntas; e o de variedade de tipos
perguntava se a prova da AP041 tem questão de ligar, que é uma só — a resposta
passou a depender do embaralhamento, e a build ficou vermelha sem ninguém ter
mexido em nada. Os dois leem `todasAsQuestoesDaProva`, que devolve o
reservatório sem sortear e existe para isso. O sorteio tem travas próprias, em
`index.test.ts`.

**Trava com lista de trilhas escrita à mão para de conferir sozinha.** As travas
estruturais do `index.test.ts` — código de lição repetido, requisito citado que
não existe, requisito sem lição, dois módulos apontando para o mesmo
laboratório — enumeravam quatro trilhas num `describe.each`. A AP043 abriu e não
entrou na lista; a AP044 também não. Nenhuma das duas omissões reprova coisa
alguma: a build segue verde conferindo as trilhas velhas, que é a pior forma de
falhar, porque é indistinguível de estar tudo certo. As listas saem de
`getOpenSpecialties()` hoje, e trilha aberta é conferida no dia em que abre. Com
a guarda contra o vazio junto, que é o de sempre — lista que esvaziasse deixaria
a build verde por não ter conferido nada.

## As outras travas

Quase todas nasceram de um erro que já aconteceu. Se uma delas reprovar, ela
está fazendo o trabalho dela — leia a mensagem antes de contorná-la. O `ci.yml`
roda em push de qualquer branch, então elas te encontram antes de existir PR.

| Onde | O que reprova |
| --- | --- |
| `supabase/migrations/migrations.test.ts` | migration que não fecha um bloco que abre; timestamp repetido |
| `supabase/migrations/migrations.test.ts` | `ON CONFLICT` citando coluna sem restrição UNIQUE, que derruba o arquivo inteiro |
| `supabase/migrations/migrations.test.ts` | `DELETE FROM badges` sem reconceder a conquista antes, que apaga insígnia de quem a tinha |
| `src/lib/certificados.test.ts` | o padrão de um certificado ilegível — inverter para `'active'` reprova |
| `src/lib/insignias.test.ts` | insígnia com critério no código e sem linha no catálogo |
| `src/labs/modeloInicial.test.ts` | laboratório de imagens que abre já atendendo ao requisito |
| `src/labs/desafioDeHtml.test.ts` | desafio de HTML que abre com verificação já verde, ou sem passo a passo |
| `src/labs/metasDaAp044.test.ts` | tarefa do laboratório de estilos que nasce verde, ou que ninguém consegue vencer |
| `src/labs/oficioDoClube.test.ts` | relatório que abre com estilo aplicado, ou meta que passa com o texto alterado |
| `src/components/LaboratorioDeWord.test.tsx` | caixa Modificar cujo OK não grava ou cujo Cancelar grava, ou os dois Words divergindo |
| `src/labs/circularDoClube.test.ts` | circular que chega com o endereço já junto, ou meta de quebra que aceita só apagar |
| `src/labs/relatorioDoAcampamento.test.ts` | legenda digitada valendo por campo, ou documento sem legenda nenhuma passando por legendado |
| `src/labs/relatorioDoAcampamento.test.ts` | coluna esvaziada valendo por coluna removida, ou disposição que cobre o texto valendo por ajuste |
| `src/labs/documento.test.ts` | imagem contada como parágrafo vazio, ou figura e tabela numerando na mesma série |
| `src/components/LaboratorioDoRelatorio.test.tsx` | tabulação colapsada, que apaga o único defeito visível do documento |
| `src/components/LaboratorioDoRelatorio.test.tsx` | bloco solto na folha de flex, onde o float é ignorado e três disposições viram uma |
| `src/labs/relatorioAnual.test.ts` | número de página digitado valendo por campo, ou cabeçalho vazio valendo por escrito |
| `src/labs/relatorioAnual.test.ts` | título empurrado de folha sem envelhecer o sumário, que passa a apontar para a folha errada |
| `src/labs/diaDoDesbravador.test.ts` | Aceitar Todas fechando a tarefa, ou documento sem plural para o Substituir Tudo estragar |
| `src/labs/diaDoDesbravador.test.ts` | comentário resolvido sem resposta, ou substituição que mexe no texto riscado |
| `src/labs/documento.test.ts` | substituição que renumera o trecho comentado e deixa a margem pendurada em nada |
| `src/components/LaboratorioDaRevisao.test.tsx` | Aceitar que age na primeira marca pendente em vez da escolhida |
| `src/components/LaboratorioDaRevisao.test.tsx` | cor do revisor que fica na folha e não no elemento, e some debaixo do estilo inline |
| `src/components/LaboratorioDaRevisao.test.tsx` | Substituir Tudo que não estraga na tela, ou Desfazer que não devolve o documento |
| `src/labs/entregaDoRelatorio.test.ts` | relatório de entrega sem uma das quatro peças do requisito 7, ou com menos de quatro folhas |
| `src/labs/entregaDoRelatorio.test.ts` | PDF que não congela, retrato que olha só o texto, ou editável velho valendo por entrega |
| `src/components/LaboratorioDaEntrega.test.tsx` | Salvar como que ignora o tipo escolhido, ou nome de arquivo que não se digita |
| `src/components/LaboratorioDaEntrega.test.tsx` | prévia de impressão mostrando o documento de outro laboratório |
| `src/components/LaboratorioDoRelatorioAnual.test.tsx` | folha que para de repartir, onde o cabeçalho não tem onde se repetir |
| `src/components/LaboratorioDoRelatorioAnual.test.tsx` | campo de página que aceita ser digitado por cima, ou posto ao lado do número errado |
| `src/components/LaboratorioDoRelatorioAnual.test.tsx` | sumário desenhado acima do título do documento, ou repetido em toda folha |
| `src/labs/documento.test.ts` | regra do sumário que só acha a abertura quando existe estilo de título |
| `src/components/LaboratorioDaCircular.test.tsx` | botão ¶ que liga o estado e não desenha marca nenhuma, ou Excluir que apaga parágrafo com texto |
| `src/labs/EstilosTextoLab.test.tsx` | botão do laboratório de estilos que não chega ao documento, ou sumário velho valendo por novo |
| `src/labs/BancoDeDadosLab.test.tsx` | assistente de importação que já chega com o mapeamento certo, ou relatório sem os quatro campos |
| `src/labs/apresentacaoDoClube.test.ts` | apresentação que abre sem os defeitos que as tarefas consertam, ou mídia vinculada valendo por incorporada |
| `src/labs/ApresentacaoLab.test.tsx` | operação de slide que age no slide errado, ou PDF velho valendo por novo |
| `src/labs/planilhaDoAcampamento.test.ts` | planilha pequena demais para o filtro fazer falta, ou SUBTOTAL escrito sem filtro nenhum |
| `src/labs/PlanilhaAvancadaLab.test.tsx` | os dois laboratórios de planilha mostrando janelas de Excel diferentes |
| `src/labs/documentoPdf.test.ts` | procura que lê o desenho da página, achando a palavra no documento em imagem |
| `src/labs/leitorDePdf.test.tsx` | folha que marca na tela qual página é imagem, ou que ignora a captura |
| `src/labs/digitalizador.test.tsx` | filtro que não muda o que o reconhecimento lê, ou fileira que abre no filtro bom |
| `src/labs/digitalizador.test.tsx` | papel que desenha igual torto e reto, ou canto que enquadra além do zero |
| `src/labs/digitalizador.test.tsx` | aviso do digitalizador que julga a tarefa em vez de relatar o que mediu |
| `src/labs/leitorDePdf.test.tsx` | aviso de digitalização que fica de pé depois de um reconhecimento malfeito |
| `src/labs/leitorDePdf.test.tsx` | comando da faixa que some em vez de ficar desligado, ou rótulo que discorda da dica |
| `src/labs/leitorDePdf.test.tsx` | selo da assinatura colada dizendo "válida", ou régua escrevendo veredito |
| `src/labs/leitorDePdf.test.tsx` | tira de miniaturas do celular com teto de altura, que corta a marca de "imagem" |
| `src/labs/documentoPdf.test.ts` | reconhecimento que acerta com a captura torta, ou que relê página já reconhecida |
| `src/labs/documentoPdf.test.ts` | comprimir antes de reconhecer saindo igual a comprimir depois |
| `src/labs/documentoPdf.test.ts` | foto de papel pesando como página digitada, que apaga o sentido de comprimir |
| `src/labs/documentoPdf.test.ts` | assinatura colada que quebra ao mexer no documento, ou verificável que não quebra |
| `src/labs/documentoPdf.test.ts` | "não permitir copiar" tratado como trava, ou PDF sem página dizendo-se pesquisável |
| `src/labs/documentoPdf.test.ts` | palavra portuguesa comum saindo intacta de um reconhecimento péssimo |
| `src/labs/metasDaCcEs004.test.ts` | meta da CC-ES004 que abre verde, ou que a solução de referência não fecha |
| `src/labs/metasDaCcEs004.test.ts` | dossiê nomeado em cinco moldes, ou num molde só e sem data nenhuma |
| `src/labs/metasDaCcEs004.test.ts` | nome que a CC-ES001 recusa passando aqui, que são duas contas do mesmo padrão |
| `src/labs/metasDaCcEs004.test.ts` | reduzir antes de reconhecer fechando a lição, com o arquivo leve e sem achar nada |
| `src/labs/metasDaCcEs004.test.ts` | balão da liderança contando como resposta, ou campo preenchido com espaço |
| `src/labs/metasDaCcEs004.test.ts` | descoberta do módulo 6 saindo do estado do documento em vez do gesto |
| `src/labs/metasDaCcEs004.test.ts` | documento combinado consigo mesmo valendo por três reunidos |
| `src/labs/metasDaCcEs004.test.ts` | quebrar a assinatura sem assinar de novo, que deixa a lição impossível de fechar |
| `src/components/LaboratorioDePdf.test.tsx` | lição da CC-ES004 impossível de vencer clicando |
| `src/components/LaboratorioDePdf.test.tsx` | faixa que muda conforme o exercício, ou comando que age sem documento escolhido |
| `src/components/LaboratorioDePdf.test.tsx` | diálogo centrado no celular, com Confirmar debaixo da cápsula de tarefas |
| `src/labs/formulas.test.ts` | SOMA que soma o número guardado como texto, apagando o defeito que o requisito 7 manda achar |
| `src/labs/formulas.test.ts` | PROCV exato por padrão, ou ordem de texto por UTF-16, que põe Águia depois de Tucano |
| `src/labs/formulas.test.ts` | cifrão ignorado ao arrastar a fórmula, que apaga a diferença entre relativa e absoluta |
| `src/labs/formulas.test.ts` | referência circular devolvendo zero, ou travando a aba |
| `src/labs/metasDaAp043.test.ts` | segundo avaliador de fórmula escrito fora de `formulas.ts` |
| `src/labs/planilha.test.ts` | filtro que esconde o cabeçalho, deixando a tabela sem como voltar |
| `src/labs/planilha.test.ts` | ordenação que leva só a coluna da chave, embaralhando o cadastro |
| `src/labs/planilha.test.ts` | alça de preenchimento que copia a fórmula sem transpor a referência |
| `src/labs/planilha.test.ts` | regra condicional com o campo em branco pintando meia planilha |
| `src/labs/cadernoDoClube.test.ts` | tarefa da CC-ES003 que abre verde, ou que a solução de referência não fecha |
| `src/labs/cadernoDoClube.test.ts` | limpeza do bloco de dados que aceita a tabela apagada junto |
| `src/labs/cadernoDoClube.test.ts` | total digitado valendo por soma, ou intervalo que deixa um inscrito de fora |
| `src/labs/cadernoDoClube.test.ts` | valor da diária digitado dentro da fórmula, que erra calado no ano seguinte |
| `src/labs/cadernoDoClube.test.ts` | tabela de procura ordenada, que apaga a armadilha do PROCV aproximado |
| `src/labs/cadernoDoClube.test.ts` | regra condicional esticada até o fim da coluna, que acende a metade em branco |
| `src/labs/cadernoDoClube.test.ts` | ordenação que deixa cada nome ao lado da unidade de outro |
| `src/labs/cadernoDoClube.test.ts` | total escrito como `=820+910+1180` ou `=33`, que começa por igual e não acompanha |
| `src/labs/cadernoDoClube.test.ts` | gráfico de tipo que não responde à pergunta, ou sem eixo identificado |
| `src/labs/cadernoDoClube.test.ts` | número-como-texto "consertado" apagando a célula |
| `src/labs/cadernoDoClube.test.ts` | fórmula das lições que sai no roteiro sem frase própria, ou coluna arrastada virando doze frases |
| `src/curriculum/exemplosDePlanilha.test.ts` | exemplo da teoria cujo resultado declarado não é o que o motor devolve |
| `src/curriculum/exemplosDePlanilha.test.ts` | número guardado como texto encostando à direita, que apaga a primeira pista do requisito 7 |
| `src/labs/metasDaAp043.test.ts` | alinhamento decidido pelo texto impresso, que já perdeu o tipo do valor |
| `src/labs/excel.test.tsx` | peça da grade que sumiu no recorte, ou que aparece sem o laboratório ter pedido |
| `src/labs/excel.test.tsx` | grade que guarda a própria seleção, em vez de desenhar a que o chamador diz |
| `src/components/LaboratorioDePlanilha.test.tsx` | lição da CC-ES003 impossível de vencer clicando |
| `src/components/LaboratorioDePlanilha.test.tsx` | trocar de aba perdendo o que foi escrito, ou faixa que muda conforme o exercício |
| `src/labs/correioDoClube.test.ts` | Cco preenchido com a lista grande vazando pelo Para, ou assinatura configurada e nunca usada |
| `src/labs/maquinaDoClube.test.ts` | "abrir com" que mudou o padrão junto, ou usuário novo criado administrador |
| `src/labs/ConfiguracoesLab.test.tsx` | caminho de Configurações que não leva à tarefa, ou botão de otimizar com o nome errado para o disco |
| `src/lib/veredas.test.ts` | laboratório de vereda que abre resolvido, sem passo a passo, ou vereda sem emblema e sem certificado |
| `src/lib/exploradorValidator.test.ts` | verificação do Explorador que nasce verde no disco do clube, ou que ninguém consegue vencer |
| `src/labs/explorer.test.tsx` | peça da janela do Explorador que sumiu no recorte, ou pesquisa que some na tela estreita |
| `src/labs/correio.test.tsx` | peça da janela do correio que sumiu no recorte, ou que aparece sem o laboratório ter pedido |
| `src/labs/correio.test.tsx` | mensagem mostrando só o nome de exibição, que apaga o primeiro indício do golpe |
| `src/labs/correio.test.tsx` | lateral que guarda a própria pasta, ou que esconde pasta na tela estreita |
| `src/labs/correio.test.tsx` | link cujo destino sai escrito ao lado do texto, ou que não avisa ao ser apontado |
| `src/labs/nuvem.test.tsx` | linha da nuvem que escreve o papel de alguém, entregando o requisito 5 |
| `src/labs/nuvem.test.tsx` | selo de compartilhado lido do acesso efetivo, que marca a ficha médica |
| `src/labs/nuvem.test.tsx` | herança pela pasta desenhada já expandida, ou aberta sem ninguém dentro |
| `src/labs/nuvem.test.tsx` | "Transferir propriedade" ou "Remover acesso" oferecidos sem quem os atenda |
| `src/labs/editorNaNuvem.test.tsx` | painel de histórico que não diz que a versão de agora continua nele |
| `src/labs/editorNaNuvem.test.tsx` | versão sem os nomes de quem escreveu, que deixa o requisito 8 sem prova |
| `src/labs/editorNaNuvem.test.tsx` | Restaurar ligado na versão já aberta, que é botão que não faz nada |
| `src/labs/editorNaNuvem.test.tsx` | cursor do outro desenhado sem achar o parágrafo, apontando para o lugar errado |
| `src/labs/arquivoCompartilhado.test.ts` | permissão do arquivo vencendo a da pasta, que fecharia a ficha médica sozinha |
| `src/labs/arquivoCompartilhado.test.ts` | restaurar apagando as versões mais novas, que é o medo que trava o recurso |
| `src/labs/arquivoCompartilhado.test.ts` | cópia por anexo que se religa ao original, ou acesso que alcança a cópia |
| `src/labs/arquivoCompartilhado.test.ts` | link aberto entrando em `papelDe`, ou pasta movida para dentro dela mesma |
| `src/labs/metasDaCcEs006.test.ts` | meta da CC-ES006 que abre verde, ou que a solução de referência não fecha |
| `src/labs/metasDaCcEs006.test.ts` | link aberto para qualquer pessoa fechando a lição dos três níveis |
| `src/labs/metasDaCcEs006.test.ts` | fechar a pasta do clube valendo por tirar a ficha de dentro dela |
| `src/labs/metasDaCcEs006.test.ts` | apagar a cópia em conflito sem juntar, ou juntar sem tirá-la da pasta |
| `src/labs/metasDaCcEs006.test.ts` | comentário resolvido em silêncio, ou vínculo mandado junto de uma cópia |
| `src/components/LaboratorioDaNuvem.test.tsx` | lição da CC-ES006 impossível de vencer clicando |
| `src/components/LaboratorioDaNuvem.test.tsx` | Enter que deixa o cursor no parágrafo de cima, com a tecla parecendo quebrada |
| `src/components/LaboratorioDaNuvem.test.tsx` | linha da Marta chegando a cada tecla, ou escrita de comentarista virando texto |
| `src/labs/cofreDeSenhas.test.ts` | senha de lista dada por forte, ou comprimento que não vence classe de caractere |
| `src/labs/cofreDeSenhas.test.ts` | as duas contas do requisito 7 colapsadas numa, que deixa metade do defeito de pé |
| `src/labs/contaOnline.test.ts` | duas etapas que já nascem com os códigos de reserva guardados |
| `src/labs/contaOnline.test.ts` | consulta de vazamento sem o corte da senha ou o da data, que pede troca à toa |
| `src/labs/contaOnline.test.ts` | intruso que fica fora sem a senha ter mudado, ou porta que some de `portasAbertas` |
| `src/labs/contaOnline.test.ts` | "deixar tudo privado" poupando a busca, que apaga a decisão do requisito 4.5 |
| `src/labs/golpesDoClube.test.ts` | análise por conjunto que contém, que deixa marcar todos os indícios passar |
| `src/labs/golpesDoClube.test.ts` | caixa sem mensagem verdadeira, onde "denuncie tudo" é a resposta certa |
| `src/labs/golpesDoClube.test.ts` | indício que não aparece na mensagem, ou explicação que nomeia o remetente |
| `src/labs/gerenciadorDeSenhas.test.tsx` | medidor que diz a força só pela cor, ou senha que abre à mostra no cofre |
| `src/labs/paginaDaConta.test.tsx` | método de duas etapas sem o lado que ele não cobre, ou escopo cru na tela |
| `src/labs/paginaDaConta.test.tsx` | consulta vazia virando atestado de segurança |
| `src/labs/gerenciadorDeSenhas.test.tsx` | regra do botão desligado escrita antes da do principal, que o deixa com cara de clicável |
| `src/labs/paginaDaConta.test.tsx` | a mesma ordem, na janela da conta |
| `src/labs/metasDaCcEs005.test.ts` | meta da CC-ES005 que abre verde, ou que a solução de referência não fecha |
| `src/labs/metasDaCcEs005.test.ts` | revogar todos os aplicativos ou fechar toda a privacidade fechando a lição |
| `src/labs/metasDaCcEs005.test.ts` | acesso tirado sem a senha trocada, que deixa quem saiu entrando em tudo |
| `src/components/LaboratorioDeContas.test.tsx` | lição da CC-ES005 impossível de vencer clicando |
| `src/components/LaboratorioDeContas.test.tsx` | gerador que entrega a mesma senha duas vezes, criando reutilização |
| `src/components/LaboratorioDeContas.test.tsx` | sessão encerrada antes da troca de senha sem o intruso voltar |
| `src/labs/selecao.test.ts` | faixa do Shift medida fora da ordem da tela, ou botão direito que encolhe a seleção |
| `src/components/LaboratorioDeExplorador.test.tsx` | Explorador que joga fora Ctrl e Shift no clique, ou um dos dois sem as caixas de seleção |
| `src/labs/roteiroDaEstrutura.test.ts` | roteiro da apresentação que julga a organização alheia, ou que lê os arquivos um por um |
| `src/components/LaboratorioDeExplorador.test.tsx` | lição da CC-ES001 impossível de vencer clicando, ou os dois Exploradores mostrando janelas diferentes |
| `src/labs/scratch/seletorDeCores.test.ts` | seletor de cores do Scratch empilhado abaixo do `#root`, que o faz sumir sem erro |
| `src/lib/fundoDaPlataforma.test.ts` | camada do fundo que existe na folha e não na marcação, ou o contrário, que deixa a tela preta |
| `src/lib/fundoDaPlataforma.test.ts` | fundo clareado a ponto de derrubar o texto abaixo de AA por trás do card, ou saindo no papel |
| `src/components/painelDoLaboratorio.test.ts` | botão que o laboratório entrega à moldura e não se lê no painel branco, ou classe de botão que não existe |
| `src/components/ui/TokenNoCartao.test.tsx` | cartão que anuncia certificado e não leva a ele, ou que volta a ser uma âncora em volta de tudo |
| `src/components/ui/PainelDeTokens.test.tsx` | uma das duas telas montando a própria lista de Token.Web(), ou o revogado contando como conquista |
| `src/components/ui/EstanteDeInsignias.test.tsx` | insígnia do painel que leva ao formulário do perfil em vez de contar o que rendeu |
| `src/components/ui/ExplicacaoDaInsignia.test.tsx` | cartão de explicação desenhado dentro de quem o chamou, onde o `backdrop-filter` prende o `fixed` |
| `src/lib/relatorioEmPdf.test.ts` | conquista sem data dizendo-se a primeira, ou sumário reservando menos folhas do que tem entradas |
| `src/lib/vocabulario.test.ts` | trilha ou vereda chamada de "percurso" em texto que chega à tela |
| `src/lib/vocabulario.test.ts` | insígnia chamada de "badge" ou ofensiva de "streak" no texto de JSX |
| `src/lib/atividade.test.ts` | evento de vereda que cai no mural com o nome cru do `event_type` |
| `src/lib/veredas.test.ts` | lição de vereda que não soma em escada nenhuma, ou módulo vazio contando como fechado |
| `src/lib/veredas.test.ts` | campo novo da conta das veredas que o resumo não soma, e que conta zero calado |
| `src/lib/formaDaArte.test.ts` | emblema de trilha quadrado ou de vereda deitado, que troca no painel o tipo do percurso |
| `src/lib/formaDaInsignia.test.ts` | glifo maior que o círculo inscrito do triângulo, que vaza só no Amigo e no Companheiro |
| `src/lib/formaDaInsignia.test.ts` | classe cujo glifo não se lê sobre a própria cor, ou ícone sem raio de tinta medido |
| `src/lib/insignias.test.ts` | ícone ou classe do catálogo divergindo do que a migration semeia |
| `src/lib/insignias.test.ts` | classe de insígnia de vereda ou de trilha divergindo da que a estante desenha |
| `src/hooks/escritaDepoisDoDesmonte.test.ts` | efeito que escreve estado depois de esperar sem saber se a tela ainda está lá |
| `src/lib/ofensiva.test.ts` | evento de laboratório que ninguém classificou, e que por isso não faria a ofensiva andar |
| `src/lib/ofensiva.test.ts` | a lista de eventos do banco divergindo da do navegador, que daria duas ofensivas à mesma pessoa |
| `src/components/ui/marca.test.tsx` | `Trilha.Web()` ou `Token.Web()` escrito à mão no JSX, parênteses sem o vermelho da plataforma, ou o vermelho do PDF divergindo do token |
| `src/components/TokenDaVereda.test.tsx` | Token.Web() de vereda que espera clique, que pede duas vezes, ou que reemite um revogado |
| `src/labs/falhasDePython.test.ts` | painel de falhas que abre respondido, ou recado de erro que entrega a resposta |
| `src/labs/roteiroDePython.test.ts` | roteiro que julga o programa, ou que faz escada com a cadeia de elif |
| `src/labs/projetoDePython.test.ts` | pasta do projeto que guarda a sobra da execução anterior, ou que não relê o arquivo importado |
| `src/labs/pip.test.ts` | laboratório de instalar biblioteca que abre resolvido, ou requirements.txt gravado vazio valendo por lista |
| `src/components/LaboratorioDePython.test.tsx` | dado da lição que chega editável, ou segundo arquivo-fonte que muda sem envelhecer a lista |
| `src/curriculum/blocosDaLicao.test.ts` | bloco escrito na lição que não existe com essas palavras na paleta do Scratch |
| `src/curriculum/exemplosDePython.test.ts` | exemplo de Python cuja saída declarada não é a que o programa escreve |
| `src/curriculum/laboratoriosDePython.test.ts` | laboratório de Python impossível de vencer, ou cujo modelo já abre resolvido |
| `src/curriculum/index.test.ts` | trilha sem emblema ou sem fundo de certificado no repositório |
| `src/curriculum/index.test.ts` | trilha aberta com lição, módulo ou laboratório repetido, ou requisito sem lição |
| `src/curriculum/exemplosDaTeoria.test.ts` | seletor do exemplo de CSS que não acha ninguém na marcação do tópico |
| `src/curriculum/qualidade.test.ts` | duas questões da mesma prova com o mesmo enunciado ou a mesma resposta certa |
| `src/curriculum/qualidade.test.ts` | lição ou prova que sorteia sem ter três questões de sobra |
| `src/curriculum/qualidade.test.ts` | questão de prova sem requisito, requisito de teoria sem questão, ou sorteio que não cabe a cobertura |
| `ci.yml` | `.env` rastreado pelo git |
| `supabase.yml` | `src/types/database.ts` divergente do schema; função no repo que o workflow não publica; `Confirm email` religado no painel |

No `supabase.yml`, a checagem dos tipos e a do `Confirm email` rodam **depois**
dos deploys, de propósito: deixam a execução vermelha sem segurar o que já
estava pronto para subir. As duas foram parar ali por terem feito o contrário
uma vez.
