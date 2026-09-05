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

O espaço reservado continua quadrado, para que as duas formas se alinhem na
mesma coluna. E o selo de estado pousa **sobre a curva, a 45°**, e não no canto
da caixa: no círculo o canto quase encosta na borda, na elipse fica longe dela.

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
aplicativo de quem estuda; quem protege é a RLS. E é botão, não automático ao
vencer a última lição: o pedido atravessa a rede, e falhar em silêncio bem na
hora da vitória é a pior hora.

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
| `src/labs/falhasDePython.test.ts` | painel de falhas que abre respondido, ou recado de erro que entrega a resposta |
| `src/labs/roteiroDePython.test.ts` | roteiro que julga o programa, ou que faz escada com a cadeia de elif |
| `src/curriculum/blocosDaLicao.test.ts` | bloco escrito na lição que não existe com essas palavras na paleta do Scratch |
| `src/curriculum/exemplosDePython.test.ts` | exemplo de Python cuja saída declarada não é a que o programa escreve |
| `src/curriculum/laboratoriosDePython.test.ts` | laboratório de Python impossível de vencer, ou cujo modelo já abre resolvido |
| `src/curriculum/index.test.ts` | trilha sem emblema ou sem fundo de certificado no repositório |
| `src/curriculum/exemplosDaTeoria.test.ts` | seletor do exemplo de CSS que não acha ninguém na marcação do tópico |
| `src/curriculum/qualidade.test.ts` | duas questões da mesma prova com o mesmo enunciado ou a mesma resposta certa |
| `ci.yml` | `.env` rastreado pelo git |
| `supabase.yml` | `src/types/database.ts` divergente do schema; função no repo que o workflow não publica; `Confirm email` religado no painel |

No `supabase.yml`, a checagem dos tipos e a do `Confirm email` rodam **depois**
dos deploys, de propósito: deixam a execução vermelha sem segurar o que já
estava pronto para subir. As duas foram parar ali por terem feito o contrário
uma vez.
