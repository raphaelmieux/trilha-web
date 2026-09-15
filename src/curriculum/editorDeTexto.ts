import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DO_EDITOR } from './questoesDoEditor';

/*
 * A vereda CC-ES002 Editor de Texto.
 *
 * ── O que ela é, e o que ela não repete ──────────────────────────────────
 * A AP042 e a AP044 já ensinam o Word como programa: onde ficam os botões,
 * como se insere uma imagem, o que a faixa de opções tem. Aqui a pergunta é
 * outra — **por que** o documento está formatado do jeito que está, e o que
 * acontece quando ele precisa mudar.
 *
 * O documento do clube não é escrito uma vez. Ele é escrito, revisado,
 * devolvido com pedidos, e entregue numa reunião em que alguém pede um título
 * maior. Quem formatou à mão refaz o documento inteiro; quem usou estilo troca
 * uma coisa só. É esta a diferença que o documento oficial cobra no requisito
 * 3, e é ela que o requisito 8 manda **demonstrar** ao examinador.
 *
 * ── Por que ela exige a CC-ES001 ─────────────────────────────────────────
 * Está escrito no requisito 1, e a razão é a de sempre: quem escreve um ofício
 * e não sabe achá-lo no sábado seguinte escreve o ofício duas vezes. E o
 * requisito 7 pede a entrega em dois formatos, o que é conversa de quem já
 * sabe o que é extensão.
 *
 * ── E o requisito 8 acontece fora daqui ──────────────────────────────────
 * Apresentar ao examinador é conversa com uma pessoa, e a plataforma não
 * confere nada dela — como já vale para o requisito 9 da CC-ES001 e o 7 da
 * CC002. O que ela faz é preparar: o laboratório do módulo 1 deixa a
 * demonstração à mão, porque mudar um estilo e ver o documento inteiro mudar
 * junto é uma coisa que se mostra em três segundos e não se explica em três
 * parágrafos.
 */

/*
  Todo exemplo desta vereda é `'texto'`: um parágrafo, um par de nomes de
  estilo lado a lado, um pedaço de sumário. Não há linguagem para realçar nem
  página para desenhar — é a mesma decisão da CC003 e da CC-ES001, e o helper é
  o mesmo.
*/
const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], exemplo: string, atencao: string, marcas: string[],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, exemplo, exemploComo: 'texto' as const, atencao, marcas,
});

/* ────────────────────────────────────────────────────────────────────────
   Módulo 1 — Formatar é decidir uma vez (requisitos 2.1, 2.2 e 3)
   ──────────────────────────────────────────────────────────────────────── */

const FORMATAR: TopicoDeVereda[] = [
  t(
    'formatacao-direta',
    'Formatação direta',
    'Selecionar um pedaço e mandar ele ficar de um jeito.',
    [
      'Formatação direta é o que acontece quando você seleciona um texto e clica em negrito, ou escolhe o tamanho 16, ou troca a cor. A ordem vale para *aquele pedaço*, e para mais nada.',
      'É o jeito que todo mundo aprende primeiro, e ele funciona — para um documento de uma página que ninguém vai mexer de novo. O convite do acampamento, o cartaz da cantina.',
      'O problema não é o resultado; é que a decisão fica guardada em cada pedaço, um por um. O documento não sabe que aqueles oito textos de 16 pontos e negrito são todos títulos de seção: para ele são oito pedaços que por acaso estão parecidos.',
    ],
    `Você selecionou:   "Programação do sábado"
Você clicou em:    Negrito, Tamanho 16, Cor azul

O documento guardou:
  parágrafo 12 → negrito, 16pt, azul

O documento NÃO guardou:
  "isto é um título de seção"`,
    'Formatação direta não é errada — é local. O erro é usá-la para dizer uma coisa que se repete: se você vai fazer o mesmo em outros lugares do documento, o que você quer é estilo.',
    ['formatação direta', 'negrito', 'seleção'],
  ),
  t(
    'estilo',
    'Estilo',
    'Um nome que guarda a decisão, e que o texto inteiro usa.',
    [
      'Estilo é a formatação com um nome. Em vez de dizer "negrito, 16, azul" oito vezes, você diz "isto é Título 1" oito vezes — e o que Título 1 significa fica escrito num lugar só.',
      'Trocar o que ele significa muda os oito de uma vez. É essa a demonstração que o requisito 8 pede, e ela dura três segundos: abra a galeria, mude a cor de Título 1, e o documento inteiro acompanha.',
      'Todo editor de texto vem com estilos prontos — Normal, Título 1, Título 2, Citação, Legenda —, e todos eles podem ser modificados. Modificar o que existe é quase sempre melhor do que criar um novo: o sumário, a legenda e o navegador de documento já sabem procurar os nomes de fábrica.',
    ],
    `Sem estilo                        Com estilo
─────────────────────────         ─────────────────────────
8 pedaços formatados à mão        8 parágrafos marcados Título 1
mudar a cor = 8 edições           mudar a cor = 1 edição
o sumário não acha nada           o sumário acha os 8`,
    'Aplicar o estilo é clicar no parágrafo e escolher o nome na galeria — não é selecionar a linha inteira. Estilo de parágrafo vale para o parágrafo em que o cursor está, do começo ao fim dele.',
    ['estilo', 'galeria de estilos', 'Título 1'],
  ),
  t(
    'dois-problemas',
    'O que a formatação direta cobra depois',
    'Ela custa na hora de mudar, e custa na hora de montar o sumário.',
    [
      'O primeiro problema é a **manutenção**. Num relatório de quatro páginas há uns dez títulos; num de vinte, uns cinquenta. Quando a liderança pede que os títulos fiquem menores, quem formatou à mão passa uma tarde caçando um por um — e sempre esquece um, que fica diferente e ninguém vê até o documento estar impresso.',
      'O segundo é o **sumário**. Ele não é escrito: é gerado, e o que ele procura são os parágrafos marcados como título. Um texto que só *parece* um título, porque alguém o deixou em negrito e grande, não aparece nele. O sumário sai com metade das seções, ou sai vazio, e não há erro nenhum na tela para explicar.',
      'Os dois problemas são da mesma família: o documento não sabe o que cada pedaço é. Estilo é o que conta isso a ele.',
    ],
    `Pedido da liderança: "os títulos estão grandes demais"

Com formatação direta        Com estilo
────────────────────         ─────────────
achar cada título            abrir a galeria
mudar o tamanho              modificar Título 1
repetir 50 vezes             pronto
conferir se sobrou algum`,
    'Há um terceiro que aparece sozinho: o documento fica pesado e lento. Cada pedaço formatado à mão é uma instrução guardada, e um texto com milhares delas demora a abrir. Mas os dois que o requisito 3 pede são a manutenção e o sumário.',
    ['manutenção', 'sumário', 'consistência'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 2 — A linha, o parágrafo e a letra (requisitos 2.3 e 2.4)
   ──────────────────────────────────────────────────────────────────────── */

const PARAGRAFO_E_LETRA: TopicoDeVereda[] = [
  t(
    'paragrafo',
    'Parágrafo',
    'O pedaço que o Enter fecha, e a unidade de quase tudo.',
    [
      'Parágrafo é tudo o que existe entre um Enter e o seguinte. Pode ter dez linhas ou uma palavra; o que o define não é o tamanho, é o Enter no fim.',
      'Ele é a unidade de quase toda formatação: alinhamento, espaçamento antes e depois, recuo, e o estilo de parágrafo inteiro valem para ele, não para a linha. É por isso que aplicar Título 1 com o cursor no meio da frase funciona — o editor sabe onde o parágrafo começa e onde acaba.',
      'Um parágrafo vazio é um Enter sem nada dentro, e é assim que muita gente empurra texto para a página seguinte. Funciona até alguém acrescentar uma frase acima, e aí o empurrão vai parar no lugar errado.',
    ],
    `[Enter] fecha o parágrafo e abre outro

  Parágrafo 1 ──→ "No sábado de manhã o clube se reúne às 8h."[Enter]
  Parágrafo 2 ──→ "Cada unidade leva a própria bandeira."[Enter]

Alinhamento, recuo e espaçamento valem por parágrafo.`,
    'Para empurrar texto para a página seguinte não se apertam oito Enters: usa-se quebra de página. O Enter empurra hoje e desarruma amanhã, quando o texto de cima crescer ou encolher.',
    ['parágrafo', 'Enter', 'quebra de página'],
  ),
  t(
    'quebra-de-linha',
    'Quebra de linha',
    'Pula para a linha de baixo sem fechar o parágrafo.',
    [
      'Quebra de linha é `Shift+Enter`. Ela desce uma linha e continua no **mesmo** parágrafo — o que significa que o espaçamento entre parágrafos não entra, e o estilo continua sendo o mesmo.',
      'Ela serve para as poucas coisas em que a linha importa e o parágrafo não: endereço, verso de música, assinatura em duas linhas. Em texto corrido ela não serve para nada.',
      'A diferença aparece na hora do estilo: um endereço escrito com três Enters são três parágrafos, e ganham três vezes o espaçamento de depois; escrito com duas quebras de linha é um parágrafo só, com as três linhas coladas como devem ficar.',
    ],
    `Com Enter (3 parágrafos)      Com Shift+Enter (1 parágrafo)
─────────────────────────      ─────────────────────────────
Rua das Palmeiras, 120         Rua das Palmeiras, 120
                               Sobradinho, DF
Sobradinho, DF                 73000-000

73000-000                      (sem os vãos no meio)`,
    'Ligar as marcas de parágrafo (o botão com o símbolo de parágrafo, em Início) mostra as duas: o Enter aparece como um símbolo de parágrafo, e a quebra de linha como uma seta virada. Com elas desligadas, as duas são invisíveis e o documento erra calado.',
    ['quebra de linha', 'Shift+Enter', 'marcas de formatação'],
  ),
  t(
    'serifa',
    'Serifada e sem serifa',
    'Com pezinho e sem pezinho, e onde cada uma se lê melhor.',
    [
      'Serifa é o pequeno traço nas pontas das letras. Fontes serifadas — Times New Roman, Georgia, Garamond — têm esses traços; as sem serifa — Arial, Calibri, Helvetica — não têm.',
      'A regra prática do dia a dia: serifada para texto longo impresso, sem serifa para tela e para títulos. Os traços ajudam o olho a seguir a linha no papel, e atrapalham pouco na tela de hoje — mas em tela pequena eles somem e viram sujeira.',
      'O que **não** é regra é escolher pelo gosto de quem escreve. Um relatório entregue impresso e um cartaz projetado no telão pedem coisas diferentes, e quem decide é onde o texto vai ser lido.',
    ],
    `Serifada (pezinho nas pontas)    Sem serifa (traço limpo)
─────────────────────────────    ────────────────────────
Times New Roman                  Arial
Georgia                          Calibri
Garamond                         Helvetica

texto longo no papel             tela, título, placa`,
    'Não misture mais de duas fontes no mesmo documento — uma para título e uma para corpo basta. Documento com cinco fontes não parece rico, parece remendado, e é o erro mais comum de quem está aprendendo.',
    ['serifa', 'fonte', 'legibilidade'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 3 — O que entra no meio do texto (requisitos 4.2 e 4.3)
   ──────────────────────────────────────────────────────────────────────── */

const NO_MEIO_DO_TEXTO: TopicoDeVereda[] = [
  t(
    'tabela',
    'A tabela',
    'Para dado que tem colunas, e não para alinhar texto.',
    [
      'Tabela serve para o que tem linha e coluna de verdade: a lista de inscritos com nome, unidade e telefone; o orçamento com item, quantidade e valor.',
      'Ela se insere por Inserir › Tabela, escolhendo quantas colunas e quantas linhas. Depois disso ela cresce sozinha: `Tab` na última célula acrescenta uma linha nova, que é como se digita uma lista inteira sem tocar no mouse.',
      'O que ela **não** é: um jeito de alinhar texto. Quem usa tabela invisível para pôr duas coisas lado a lado descobre o problema quando o texto muda de tamanho, ou quando alguém abre o documento em outro computador.',
    ],
    `Inserir › Tabela › 3 colunas × 5 linhas

┌──────────────┬──────────┬──────────────┐
│ Nome         │ Unidade  │ Telefone     │
├──────────────┼──────────┼──────────────┤
│ Ana          │ Falcão   │ (61) 99999…  │
└──────────────┴──────────┴──────────────┘

Tab na última célula → linha nova`,
    'A primeira linha costuma ser o cabeçalho, e vale marcá-la como tal: numa tabela que atravessa duas páginas, o cabeçalho marcado se repete no alto da segunda. Sem isso, a página seguinte é uma tabela sem títulos de coluna.',
    ['tabela', 'linha', 'coluna', 'cabeçalho da tabela'],
  ),
  t(
    'linha-e-coluna',
    'Acrescentar e remover',
    'A tabela muda depois de pronta, e há botão para isso.',
    [
      'Acrescentar linha ou coluna se faz pelo botão direito sobre a tabela, ou pela guia contextual de Layout que aparece quando o cursor está dentro dela. Dá para inserir acima, abaixo, à esquerda e à direita.',
      'Remover é pelo mesmo caminho, e ali mora uma confusão que custa caro: **apagar o conteúdo não é remover a linha**. Selecionar as células e apertar Delete esvazia o que estava escrito e deixa a linha vazia lá, ocupando espaço.',
      'A guia contextual é a mesma ideia do resto do editor: ela só existe enquanto o cursor está dentro da tabela, porque comandos de tabela não têm o que fazer fora dela.',
    ],
    `Cursor dentro da tabela → aparecem duas guias novas
                           "Design da Tabela" e "Layout"

Layout › Inserir Acima / Abaixo / À Esquerda / À Direita
Layout › Excluir › Linhas / Colunas / Tabela

Delete nas células = esvazia
Excluir › Linhas   = tira a linha`,
    'Se a guia de Layout sumiu, o cursor saiu da tabela. Não é um defeito do programa: é a guia contextual fazendo o que ela faz.',
    ['inserir linha', 'excluir linha', 'guia contextual'],
  ),
  t(
    'imagem-no-texto',
    'A imagem e o texto em volta',
    'O que decide onde ela fica é a disposição.',
    [
      'Inserida, a imagem nasce *alinhada com o texto*: ela se comporta como se fosse uma letra gigante, empurrando a linha inteira. Isso quase nunca é o que se quer.',
      'A disposição do texto — quadrada, próxima, atrás, à frente, acima e abaixo — é o que decide o resto. "Quadrada" faz o texto contornar a caixa da imagem; "acima e abaixo" a deixa sozinha na largura da página.',
      'Escolhida a disposição, a imagem passa a ter uma **âncora**: um parágrafo ao qual ela está presa. Apagar aquele parágrafo leva a imagem junto, e é assim que uma foto some de um documento sem ninguém ter apagado foto nenhuma.',
    ],
    `Alinhada com o texto   → a imagem é uma letra enorme
Quadrada               → o texto contorna a caixa
Próxima                → o texto contorna o desenho
Atrás / À frente       → o texto ignora a imagem
Acima e abaixo         → a imagem toma a largura

Âncora: o parágrafo a que a imagem está presa.`,
    'Imagem esticada para caber é o defeito que mais aparece em documento de clube. Arraste sempre pelo canto, e nunca pelo meio da borda: o canto mantém a proporção, e o meio achata as pessoas da foto.',
    ['imagem', 'disposição do texto', 'âncora', 'proporção'],
  ),
  t(
    'legenda',
    'A legenda',
    'Um campo que se numera sozinho, e não uma frase embaixo da foto.',
    [
      'Legenda é o texto que identifica a imagem ou a tabela, e no editor ela é um recurso, não uma linha escrita à mão: Referências › Inserir Legenda.',
      'A diferença é a numeração. A legenda inserida assim traz um campo — "Figura 1", "Figura 2" —, e o campo se renumera sozinho quando alguém acrescenta uma figura no meio do documento. Escrita à mão, a figura 3 vira a 4 e ninguém corrige a 5, a 6 e a 7.',
      'E ela usa o estilo Legenda, o que faz todas ficarem iguais, e permite gerar um índice de figuras depois — pelo mesmo caminho do sumário.',
    ],
    `Referências › Inserir Legenda

  Figura 1 — A fogueira na noite de sábado
  Figura 2 — A bandeira da Unidade Falcão

Acrescente uma figura entre as duas:
  Figura 1 — …
  Figura 2 — a nova
  Figura 3 — a que era a 2   ← renumerada sozinha`,
    'A legenda fica acima da tabela e abaixo da figura — é a convenção de todo texto técnico, e o editor oferece as duas posições na mesma caixa. Não é exigência do programa; é o que quem lê espera encontrar.',
    ['legenda', 'campo', 'numeração automática', 'índice de figuras'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 4 — O que se repete em toda página (requisitos 4.4 e 4.5)
   ──────────────────────────────────────────────────────────────────────── */

const EM_TODA_PAGINA: TopicoDeVereda[] = [
  t(
    'cabecalho-rodape',
    'Cabeçalho e rodapé',
    'A faixa de cima e a de baixo, escritas uma vez e repetidas em todas.',
    [
      'Cabeçalho é a área acima da margem superior; rodapé, a abaixo da inferior. O que se escreve neles aparece em **toda** página, e é para isso que eles existem: o nome do clube, o título do documento, a data.',
      'Eles não fazem parte do corpo do texto, e é por isso que o cursor não chega neles digitando — entra-se por Inserir › Cabeçalho, ou com dois cliques na área.',
      'A primeira página costuma ser diferente: uma capa não leva cabeçalho. A caixa "primeira página diferente" existe justamente para isso, e é ela que evita a gambiarra de pôr a capa num arquivo separado.',
    ],
    `┌─────────────────────────────────────┐
│ Clube Pioneiros do Cerrado    2026  │ ← cabeçalho
├─────────────────────────────────────┤
│                                     │
│   (o corpo do documento)            │
│                                     │
├─────────────────────────────────────┤
│                 3                   │ ← rodapé
└─────────────────────────────────────┘`,
    'Escrever o nome do clube no alto da primeira página, dentro do corpo, parece a mesma coisa e não é: ele não vai se repetir, e vai empurrar o texto quando alguém acrescentar um parágrafo acima.',
    ['cabeçalho', 'rodapé', 'primeira página diferente'],
  ),
  t(
    'numeracao',
    'Numeração de páginas',
    'Um campo, e não um número digitado.',
    [
      'O número da página é um campo que o editor calcula: Inserir › Número de Página, escolhendo onde ele fica. Acrescentar ou tirar páginas renumera tudo sozinho.',
      'Ele mora no cabeçalho ou no rodapé, porque é lá que ele precisa se repetir. Digitar "3" no pé da terceira página funciona até alguém acrescentar um parágrafo na primeira.',
      'Documento com capa costuma não numerar a capa, e costuma começar a contar do 1 na página seguinte. As duas coisas são configuráveis, e são o que separa um relatório entregue de um rascunho impresso.',
    ],
    `Inserir › Número de Página › Fim da Página

Página 1 (capa)     → sem número
Página 2            → 1
Página 3            → 2

Acrescente uma página no meio:
o campo renumera as seguintes sozinho.`,
    'Se o número não muda de página para página, ele foi digitado, e não inserido como campo. É o mesmo teste do sumário: o que o editor calcula, ele recalcula.',
    ['número de página', 'campo', 'capa'],
  ),
  t(
    'sumario',
    'O sumário',
    'Ele é lido dos estilos, e não escrito à mão.',
    [
      'O sumário se gera em Referências › Sumário, e o que ele procura são os parágrafos marcados com os estilos de título — Título 1 vira entrada de primeiro nível, Título 2 de segundo, e assim por diante.',
      'É aqui que o módulo 1 se paga. Num documento formatado à mão o sumário sai vazio, e a tela não diz por quê: não há erro, há uma caixa sem nada dentro.',
      'E ele **guarda o que leu**. Trocar um título depois de gerar deixa o sumário mostrando o texto velho, e nada avisa. O botão Atualizar Sumário é o que o alcança, e ele é metade da lição: um sumário desatualizado é pior do que nenhum, porque quem lê confia nele.',
    ],
    `Sumário
───────────────────────────────────────
1. Antes do acampamento .............. 2
   1.1 A lista de inscritos .......... 2
   1.2 O que levar ................... 3
2. Durante ........................... 4
3. Depois ............................ 6

Título 1 → nível 1     Título 2 → nível 2`,
    'Sumário gerado antes de o documento acabar aponta para páginas que ainda vão mudar. Gere quando quiser, mas atualize antes de exportar — e confira, porque o que ele mostra é o que o clube vai arquivar.',
    ['sumário', 'atualizar sumário', 'níveis de título'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 5 — Revisar com outra pessoa (requisito 5)
   ──────────────────────────────────────────────────────────────────────── */

const REVISAR: TopicoDeVereda[] = [
  t(
    'controle-de-alteracoes',
    'Controle de alterações',
    'O editor passa a marcar o que mudou, em vez de só mudar.',
    [
      'Ligado o controle de alterações (Revisão › Controlar Alterações), toda edição fica marcada: o que entrou aparece sublinhado e colorido, o que saiu aparece riscado, e cada marca leva o nome de quem a fez.',
      'Nada disso é definitivo. No fim, quem é dono do documento percorre as marcas e **aceita** ou **rejeita** cada uma — e é só aí que o texto de verdade muda.',
      'É o que permite mandar um documento para a liderança revisar sem perder o que estava escrito. Sem ele, a devolução vem com o texto já trocado e ninguém sabe o que foi mexido.',
    ],
    `Revisão › Controlar Alterações (ligado)

  "A reunião começa às ~~8h~~ 9h da manhã."
                        ↑      ↑
                    riscado   inserido
                    (saiu)    (entrou)

Depois: Aceitar ou Rejeitar, uma a uma.`,
    'Documento entregue com alterações ainda marcadas é documento entregue pela metade. Antes de exportar, aceite ou rejeite tudo — e repare que "Sem Marcações" só **esconde** as marcas: elas continuam lá, e reaparecem para quem abrir depois.',
    ['controlar alterações', 'aceitar', 'rejeitar'],
  ),
  t(
    'comentario',
    'Comentário',
    'Recado na margem, que não entra no texto.',
    [
      'Comentário é uma anotação presa a um pedaço do texto, e que fica na margem. Ele não é o texto: não sai na impressão comum e não aparece para quem lê o documento depois de resolvido.',
      'Serve para o que é pergunta, e não correção: "confirmou a data com a igreja?", "esta tabela não bate com a do ano passado". Quem recebe responde no próprio comentário, e a conversa fica encadeada ali.',
      'Resolvido o assunto, o comentário se marca como resolvido, ou se exclui. Comentário que fica para sempre vira ruído, e o próximo leitor não sabe se aquilo ainda importa.',
    ],
    `Texto                          Margem
─────────────────────────      ────────────────────────
A saída é dia 14 de março.  ┤  Raphael: confirmou com
                               a igreja?
                                 └ Ana: confirmado ontem.
                                   [Resolver]`,
    'Comentário não é controle de alterações. Um pergunta, o outro muda — e quem escreve a correção dentro do comentário obriga a outra pessoa a digitá-la de novo.',
    ['comentário', 'revisão', 'resolver'],
  ),
  t(
    'substituicao',
    'Substituição automática',
    'Trocar tudo de uma vez, e conferir antes de confiar.',
    [
      'Localizar e Substituir (`Ctrl+H`) troca um texto por outro em todo o documento. É o que conserta em dois segundos o nome de um lugar escrito errado dezoito vezes.',
      'E é onde se perde um documento inteiro em dois segundos também. Substituir "ana" por "Ana" sem marcar "palavras inteiras" transforma "manhã" em "mAnahã" e "semana" em "semAnaa" — em todo o texto, de uma vez.',
      'Por isso existem as duas opções que quase ninguém marca: **diferenciar maiúsculas de minúsculas** e **palavras inteiras**. E existe o "Substituir" um a um, que mostra cada ocorrência antes de trocar — mais lento, e o único jeito de ver o que vai acontecer.',
    ],
    `Substituir "ana" por "Ana"

Sem "palavras inteiras":
  manhã   → mAnahã
  semana  → semAnaa
  Ana     → AnAna

Com "palavras inteiras" marcado:
  manhã   → manhã
  semana  → semana
  ana     → Ana`,
    'O Ctrl+Z desfaz um Substituir Tudo inteiro, e é a primeira coisa a apertar quando o documento fica estranho. Mas ele só alcança enquanto o documento não foi fechado — depois disso, o que vale é a cópia de segurança.',
    ['localizar e substituir', 'palavras inteiras', 'Ctrl+H'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 6 — Entregar (requisitos 2.5, 4.6 e 7)
   ──────────────────────────────────────────────────────────────────────── */

const ENTREGAR: TopicoDeVereda[] = [
  t(
    'pdf',
    'PDF',
    'O documento como ele vai ser visto, e não como ele foi escrito.',
    [
      'PDF quer dizer *formato de documento portátil*, e a palavra que importa é portátil: ele carrega dentro dele as fontes, as imagens e as medidas, de modo que abre igual em qualquer computador, em qualquer celular, em qualquer impressora.',
      'É o oposto do arquivo editável. O `.docx` guarda as **instruções** — "isto é Título 1, e Título 1 é Calibri 16" — e monta a página na hora de abrir, com o que a máquina tiver. Se ela não tiver a fonte, usa outra, e a quebra de página muda.',
      'Por isso o PDF é o formato de entrega, e não o formato de trabalho: ele está certo em toda máquina justamente porque quase não dá para editá-lo.',
    ],
    `.docx  →  instruções, montadas na hora de abrir
           (a fonte pode faltar; a página pode mudar)

.pdf   →  a página pronta, com tudo dentro
           (abre igual em qualquer lugar)`,
    'PDF não é imagem, e não é seguro. O texto continua dentro dele — dá para copiar, dá para procurar palavra, e dá para editar com o programa certo. Ele congela a aparência, e não o conteúdo.',
    ['PDF', 'formato portátil', 'docx'],
  ),
  t(
    'exportar',
    'Exportar em PDF',
    'Um gesto, e um retrato do documento naquele instante.',
    [
      'Exportar se faz por Arquivo › Exportar › Criar PDF, ou por Salvar Como escolhendo PDF na lista de tipos. Os dois caminhos chegam no mesmo lugar.',
      'E o PDF **congela o que existir na hora**, exatamente como o sumário guarda o que leu. Exportar cedo e continuar mexendo é o que se faz sem pensar, e o arquivo entregue fica sem o que veio depois — sem nada na tela dizendo isso.',
      'A ordem que evita isso é sempre a mesma: terminar, aceitar as alterações, atualizar o sumário, e só então exportar.',
    ],
    `Ordem de entrega
────────────────────────────────
1. terminar o texto
2. aceitar ou rejeitar as marcas
3. atualizar o sumário
4. exportar em PDF
5. guardar o editável junto`,
    'O PDF exportado não se corrige: corrige-se o documento editável e exporta-se de novo. Quem conserta no PDF acaba com dois documentos diferentes, e o editável — que é o que vai ser usado no ano que vem — fica sendo o errado.',
    ['exportar', 'Salvar Como', 'ordem de entrega'],
  ),
  t(
    'editavel-e-pdf',
    'Por que se entrega os dois',
    'Um para ler agora, outro para mexer no ano que vem.',
    [
      'O requisito 7 pede o relatório em PDF **e** em formato editável, e não é redundância: são dois usos diferentes do mesmo trabalho.',
      'O PDF é o que se lê, se imprime e se arquiva: ele é o documento como ele ficou, e ninguém o desconfigura por acidente.',
      'O editável é o que a próxima diretoria abre para fazer o relatório do ano seguinte. Sem ele, o clube tem um retrato bonito de um trabalho que vai ter de ser refeito do zero — e é por isso que a entrega é dupla.',
    ],
    `relatorio-2026-03-14-v01.docx   ← o que se mexe
relatorio-2026-03-14-v01.pdf    ← o que se lê

Mesmo nome, mesma data, mesma versão.
É o padrão de nomeação da CC-ES001, aplicado aqui.`,
    'Os dois saem com o mesmo nome e a mesma versão, de propósito. Um par com nomes diferentes vira, seis meses depois, duas coisas que ninguém sabe se são a mesma.',
    ['entrega', 'formato editável', 'versão'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Os módulos

   Só teoria por enquanto: os laboratórios vêm na etapa seguinte, e a vereda
   fica `emConstrucao` até eles chegarem. É o que "vereda em construção pode ter
   conteúdo" permite, e é o que mantém cada PR pequeno — o que já está escrito
   passa pelas travas de qualidade desde agora.
   ──────────────────────────────────────────────────────────────────────── */

export const MODULOS_DO_EDITOR: ModuloDeVereda[] = [
  {
    id: 'm1',
    titulo: 'Formatar é decidir uma vez',
    resumo: 'O que a formatação direta guarda, o que o estilo guarda, e o que a primeira cobra depois.',
    licoes: [
      {
        id: 'm1-teoria', tipo: 'teoria',
        questoes: QUESTOES_DO_EDITOR['m1-teoria'],
        perguntas: 4,
        titulo: 'Negrito à mão contra estilo',
        resumo: 'A decisão local, a decisão com nome, e os dois problemas que separam as duas.',
        topicos: FORMATAR,
      },
      {
        /*
          O requisito 6 inteiro, mais o 4.1 e o 8.

          O documento chega formatado à mão e parece pronto. Consertá-lo é
          trocar cada decisão local por uma com nome, sem mexer no texto — e a
          prova de que valeu a pena é o último gesto: modificar a definição de
          Título 2 e as quatro seções mudarem juntas.
        */
        id: 'm1-lab', tipo: 'word', documento: 'oficio',
        titulo: 'Consertando o relatório do clube',
        resumo: 'Um relatório formatado inteiro à mão, e a troca por estilos sem mudar uma palavra.',
        verificacoes: ['titulos', 'citacao-legenda', 'limpar', 'modificar', 'sumario'],
      },
    ],
  },
  {
    id: 'm2',
    titulo: 'A linha, o parágrafo e a letra',
    resumo: 'Onde o Enter fecha, onde ele não devia, e que fonte se lê onde.',
    licoes: [
      {
        id: 'm2-teoria', tipo: 'teoria',
        questoes: QUESTOES_DO_EDITOR['m2-teoria'],
        perguntas: 4,
        titulo: 'O que o Enter faz e o que ele não faz',
        resumo: 'Parágrafo, quebra de linha, e a serifa que decide onde o texto se lê.',
        topicos: PARAGRAFO_E_LETRA,
      },
      {
        /*
          Os requisitos 2.3 e 2.4, num documento cujo defeito é estrutural.

          Nada está errado na tela: cinco parágrafos vazios empurram a
          assinatura e o endereço foi escrito com três Enters. O que denuncia é
          acrescentar uma frase no meio e ver o empurrão ir parar no lugar
          errado — e é por isso que uma das tarefas **acrescenta** esse
          parágrafo em vez de descrever o problema.
        */
        id: 'm2-lab', tipo: 'word', documento: 'circular',
        titulo: 'Consertando a circular às famílias',
        resumo: 'Enter usado como régua, endereço partido em três, e a fonte que ninguém escolheu.',
        verificacoes: ['marcas', 'endereco', 'cresceu', 'quebra', 'fonte'],
      },
    ],
  },
  {
    id: 'm3',
    titulo: 'O que entra no meio do texto',
    resumo: 'Tabela para o que tem coluna, imagem presa a um parágrafo, e legenda que se numera sozinha.',
    licoes: [
      {
        id: 'm3-teoria', tipo: 'teoria',
        questoes: QUESTOES_DO_EDITOR['m3-teoria'],
        perguntas: 4,
        titulo: 'Tabela, imagem e legenda',
        resumo: 'Inserir, mudar depois de pronto, e o que a disposição do texto decide.',
        topicos: NO_MEIO_DO_TEXTO,
      },
    ],
  },
  {
    id: 'm4',
    titulo: 'O que se repete em toda página',
    resumo: 'A faixa de cima, a de baixo, o número que se calcula e o sumário que se lê dos estilos.',
    licoes: [
      {
        id: 'm4-teoria', tipo: 'teoria',
        questoes: QUESTOES_DO_EDITOR['m4-teoria'],
        perguntas: 4,
        titulo: 'Cabeçalho, rodapé, número e sumário',
        resumo: 'O que o editor calcula, ele recalcula — e o que se digita fica errado sozinho.',
        topicos: EM_TODA_PAGINA,
      },
    ],
  },
  {
    id: 'm5',
    titulo: 'Revisar com outra pessoa',
    resumo: 'Marcar em vez de mudar, perguntar na margem, e trocar tudo de uma vez sem se arrepender.',
    licoes: [
      {
        id: 'm5-teoria', tipo: 'teoria',
        questoes: QUESTOES_DO_EDITOR['m5-teoria'],
        perguntas: 4,
        titulo: 'Alteração marcada, comentário e substituição',
        resumo: 'Os três recursos de quem manda o documento para alguém ler antes.',
        topicos: REVISAR,
      },
    ],
  },
  {
    id: 'm6',
    titulo: 'Entregar',
    resumo: 'O formato que abre igual em toda parte, o que ele congela, e por que a entrega é dupla.',
    licoes: [
      {
        id: 'm6-teoria', tipo: 'teoria',
        questoes: QUESTOES_DO_EDITOR['m6-teoria'],
        perguntas: 4,
        titulo: 'PDF, e o que sai junto com ele',
        resumo: 'O que o PDF carrega dentro, a ordem de exportar, e o editável que vai junto.',
        topicos: ENTREGAR,
      },
    ],
  },
];
