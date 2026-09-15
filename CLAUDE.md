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

**Despacho de três telas não é ternário.** Com dois documentos de Word o
`documento === 'circular' ? A : B` funcionava; com três, o `else` passa a ser
"todo o resto" e um documento novo cairia calado no laboratório do módulo 1 —
o desbravador abriria a lição certa e encontraria o documento errado. Hoje é um
`Record` sobre a união, então a quarta lição de Word não compila até ter tela.
É a mesma decisão do `switch` exaustivo das travas da vereda, do outro lado da
mesma ponte.

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
são lições a vencer e módulos a fechar, e é exatamente isso que essas duas
escadas contam.

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
| `src/components/LaboratorioDaCircular.test.tsx` | botão ¶ que liga o estado e não desenha marca nenhuma, ou Excluir que apaga parágrafo com texto |
| `src/labs/EstilosTextoLab.test.tsx` | botão do laboratório de estilos que não chega ao documento, ou sumário velho valendo por novo |
| `src/labs/BancoDeDadosLab.test.tsx` | assistente de importação que já chega com o mapeamento certo, ou relatório sem os quatro campos |
| `src/labs/apresentacaoDoClube.test.ts` | apresentação que abre sem os defeitos que as tarefas consertam, ou mídia vinculada valendo por incorporada |
| `src/labs/ApresentacaoLab.test.tsx` | operação de slide que age no slide errado, ou PDF velho valendo por novo |
| `src/labs/planilhaDoAcampamento.test.ts` | planilha pequena demais para o filtro fazer falta, ou SUBTOTAL escrito sem filtro nenhum |
| `src/labs/PlanilhaAvancadaLab.test.tsx` | os dois laboratórios de planilha mostrando janelas de Excel diferentes |
| `src/labs/correioDoClube.test.ts` | Cco preenchido com a lista grande vazando pelo Para, ou assinatura configurada e nunca usada |
| `src/labs/maquinaDoClube.test.ts` | "abrir com" que mudou o padrão junto, ou usuário novo criado administrador |
| `src/labs/ConfiguracoesLab.test.tsx` | caminho de Configurações que não leva à tarefa, ou botão de otimizar com o nome errado para o disco |
| `src/lib/veredas.test.ts` | laboratório de vereda que abre resolvido, sem passo a passo, ou vereda sem emblema e sem certificado |
| `src/lib/exploradorValidator.test.ts` | verificação do Explorador que nasce verde no disco do clube, ou que ninguém consegue vencer |
| `src/labs/explorer.test.tsx` | peça da janela do Explorador que sumiu no recorte, ou pesquisa que some na tela estreita |
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
| `src/lib/formaDaArte.test.ts` | emblema de trilha quadrado ou de vereda deitado, que troca no painel o tipo do percurso |
| `src/lib/formaDaInsignia.test.ts` | glifo maior que o círculo inscrito do triângulo, que vaza só no Amigo e no Companheiro |
| `src/lib/formaDaInsignia.test.ts` | classe cujo glifo não se lê sobre a própria cor, ou ícone sem raio de tinta medido |
| `src/lib/insignias.test.ts` | ícone ou classe do catálogo divergindo do que a migration semeia |
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
