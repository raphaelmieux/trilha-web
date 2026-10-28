import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DO_EDITOR } from './questoesDoEditor';
import { telasDoTopico } from './telas';

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
  Os exemplos desta vereda são telas do Word do laboratório, fotografadas pela
  página de bastidor seguindo `src/exemplos/roteiros/editorDeTexto.ts`.

  Eram quadros de texto puro — "Sem estilo │ Com estilo", uma seta entre
  "18h" e "19h", um sumário desenhado com pontinhos —, no molde do W3Schools:
  explicação em cima, exemplo embaixo. Só que o exemplo do W3Schools roda, e
  estes repetiam o parágrafo de cima em outro formato. Os que mostravam uma
  operação viraram a operação na tela, num documento do clube que não é o do
  laboratório; os que só resumiam saíram, e o que eles tinham de útil foi para
  a explicação.
*/
const V = 'CC-ES002';
const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], atencao: string, marcas: string[],
  telas?: [legenda: string, descricao: string][],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, atencao, marcas,
  ...(telas ? { telas: telasDoTopico(V, id, telas) } : {}),
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
      'Dá para conferir isso em qualquer documento: clique num título e olhe a galeria de Estilos, em Início. Se ela marca **Normal**, aquele título é um parágrafo comum enfeitado à mão — e o grupo Fonte ao lado mostra o enfeite: negrito ligado, tamanho maior.',
    ],
    'Formatação direta não é errada — é local. O erro é usá-la para dizer uma coisa que se repete: se você vai fazer o mesmo em outros lugares do documento, o que você quer é estilo.',
    ['formatação direta', 'negrito', 'seleção'],
    [
      ['O cursor está em “Sábado”, que parece título: azul, negrito e maior. Mas a galeria de Estilos marca **Normal** — para o Word, é um parágrafo comum enfeitado à mão.',
        'Janela do Word com o programa do campori. O título Sábado está circulado no documento; na faixa de opções, a galeria de Estilos mostra Normal selecionado, e o grupo Fonte mostra tamanho 13 com o Negrito ligado.'],
    ],
  ),
  t(
    'estilo',
    'Estilo',
    'Um nome que guarda a decisão, e que o texto inteiro usa.',
    [
      'Estilo é a formatação com um nome. Em vez de dizer "negrito, 16, azul" oito vezes, você diz "isto é Título 1" oito vezes — e o que Título 1 significa fica escrito num lugar só.',
      'Trocar o que ele significa muda os oito de uma vez. É essa a demonstração que o requisito 8 pede, e ela dura três segundos: botão direito no estilo da galeria, Modificar, uma cor nova — e o documento inteiro acompanha.',
      'Todo editor de texto vem com estilos prontos — Normal, Título 1, Título 2, Citação, Legenda —, e todos eles podem ser modificados. Modificar o que existe é quase sempre melhor do que criar um novo: o sumário, a legenda e o navegador de documento já sabem procurar os nomes de fábrica.',
    ],
    'Aplicar o estilo é clicar no parágrafo e escolher o nome na galeria — não é preciso selecionar a linha inteira. Estilo de parágrafo vale para o parágrafo em que o cursor está, do começo ao fim dele.',
    ['estilo', 'galeria de estilos', 'Título 1'],
    [
      ['Aqui os dias já são títulos de verdade: com o cursor em “Sábado”, a galeria acende **Título 2**.',
        'Programa do campori com os dias como títulos azuis. O título Sábado e o botão Título 2 da galeria de Estilos estão circulados.'],
      ['Botão direito sobre Título 2, na galeria, e escolha Modificar…',
        'Menu aberto embaixo do botão Título 2, com os itens Modificar e Atualizar para Corresponder à Seleção. Modificar está circulado.'],
      ['Na caixa Modificar Estilo a decisão é tomada uma vez: tamanho 16 e vermelho escuro. A prévia mostra como fica.',
        'Caixa Modificar Estilo sobre o documento, com Tamanho 16, Cor Vermelho escuro, Negrito marcado e a frase de prévia em vermelho.'],
      ['Um OK, e Sexta-feira, Sábado e Domingo mudaram juntos. Ninguém selecionou nenhum dos três.',
        'Documento depois da mudança: os três títulos dos dias estão maiores e vermelho-escuros, cada um circulado.'],
    ],
  ),
  t(
    'dois-problemas',
    'O que a formatação direta cobra depois',
    'Ela custa na hora de mudar, e custa na hora de montar o sumário.',
    [
      'O primeiro problema é a **manutenção**. Num relatório de quatro páginas há uns dez títulos; num de vinte, uns cinquenta. Quando a liderança pede que os títulos fiquem menores, quem formatou à mão passa uma tarde caçando um por um — e sempre esquece um, que fica diferente e ninguém vê até o documento estar impresso. Com estilo, o mesmo pedido é uma mudança só, na caixa Modificar.',
      'O segundo é o **sumário**. Ele não é escrito: é gerado, e o que ele procura são os parágrafos marcados como título. Um texto que só *parece* um título, porque alguém o deixou em negrito e grande, não aparece nele. O sumário sai com metade das seções, ou sai vazio, e não há erro nenhum na tela para explicar.',
      'Os dois problemas são da mesma família: o documento não sabe o que cada pedaço é. Estilo é o que conta isso a ele.',
    ],
    'Há um terceiro que aparece sozinho: o documento fica pesado e lento. Cada pedaço formatado à mão é uma instrução guardada, e um texto com milhares delas demora a abrir. Mas os dois que o requisito 3 pede são a manutenção e o sumário.',
    ['manutenção', 'sumário', 'consistência'],
    [
      ['No programa com os títulos feitos à mão: Referências › Sumário › Sumário Automático 1.',
        'Guia Referências aberta, com o menu do botão Sumário mostrando Sumário Automático 1, circulado, e Atualizar Sumário.'],
      ['O sumário sai vazio — “Nenhuma entrada de sumário foi encontrada”. Os três dias parecem títulos, e nenhum é.',
        'Documento com uma caixa de sumário logo abaixo do título, circulada, dizendo que nenhuma entrada foi encontrada; os dias continuam azuis e em negrito mais abaixo.'],
    ],
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
      'Um parágrafo vazio é um Enter sem nada dentro, e é assim que muita gente empurra texto para baixo ou para a página seguinte. Funciona até alguém acrescentar uma frase acima, e aí o empurrão vai parar no lugar errado.',
      'O botão **Mostrar Tudo** (o ¶, em Início › Parágrafo) desenha um ¶ no fim de cada parágrafo. Ele não sai na impressão; é o jeito de ver o que o documento é por dentro, e não só o que ele parece.',
    ],
    'Para empurrar texto para a página seguinte não se apertam oito Enters: usa-se Inserir › Quebra de Página. O Enter empurra hoje e desarruma amanhã, quando o texto de cima crescer ou encolher.',
    ['parágrafo', 'Enter', 'quebra de página', 'Mostrar Tudo'],
    [
      ['Na tela, o convite parece pronto: a assinatura bem embaixo, longe do texto.',
        'Convite da investidura no Word, com um espaço grande em branco entre o endereço e a assinatura da diretoria, que está circulada.'],
      ['Com o ¶ ligado, o espaço revela o que é: quatro ¶ sozinhos, quatro Enters vazios empurrando a assinatura.',
        'O mesmo convite com as marcas de parágrafo visíveis; o botão Mostrar Tudo está circulado na faixa, e um círculo envolve as quatro linhas que só têm o símbolo de parágrafo.'],
    ],
  ),
  t(
    'quebra-de-linha',
    'Quebra de linha',
    'Pula para a linha de baixo sem fechar o parágrafo.',
    [
      'Quebra de linha é `Shift+Enter`. Ela desce uma linha e continua no **mesmo** parágrafo — o que significa que o espaçamento entre parágrafos não entra, e o estilo continua sendo o mesmo.',
      'Ela serve para as poucas coisas em que a linha importa e o parágrafo não: endereço, verso de música, assinatura em duas linhas. Em texto corrido ela não serve para nada.',
      'A diferença aparece na hora do estilo: um endereço escrito com três Enters são três parágrafos, e ganham três vezes o espaçamento de depois; escrito com duas quebras de linha é um parágrafo só, com as três linhas coladas como devem ficar.',
      'Para consertar um endereço já escrito com Enter, vá ao fim da primeira linha, aperte Delete (as duas linhas se juntam) e depois Shift+Enter. Nenhuma letra é redigitada.',
    ],
    'Com as marcas ligadas, o Enter aparece como ¶ e a quebra de linha como uma seta ↵. Com elas desligadas, as duas são invisíveis e o documento erra calado.',
    ['quebra de linha', 'Shift+Enter', 'marcas de formatação'],
    [
      ['Com o ¶ ligado, o endereço mostra três ¶: são três parágrafos, e o vão entre as linhas é o espaçamento de parágrafo.',
        'Convite com as marcas visíveis. As três linhas do endereço — Igreja Central de Sobradinho, Quadra 6, Sobradinho — estão circuladas, cada uma terminando em ¶, com espaço entre elas.'],
      ['Delete no fim da linha e Shift+Enter, duas vezes: o endereço vira um parágrafo só, com as setas ↵ e as linhas coladas.',
        'O mesmo endereço circulado, agora com as três linhas juntas: as duas primeiras terminam numa seta de quebra de linha e só a última termina em ¶.'],
    ],
  ),
  t(
    'serifa',
    'Serifada e sem serifa',
    'Com pezinho e sem pezinho, e onde cada uma se lê melhor.',
    [
      'Serifa é o pequeno traço nas pontas das letras. Fontes serifadas — Cambria, Georgia, Times New Roman, Garamond — têm esses traços; as sem serifa — Calibri, Arial, Verdana — não têm. A própria caixa Fonte do Word desenha cada nome com a sua letra, e é ali que se vê a diferença de perto.',
      'A regra prática do dia a dia: serifada para texto longo impresso, sem serifa para tela e para títulos. Os traços ajudam o olho a seguir a linha no papel; em tela pequena eles somem e viram sujeira.',
      'O que **não** é regra é escolher pelo gosto de quem escreve. Um relatório entregue impresso e um cartaz projetado no telão pedem coisas diferentes, e quem decide é onde o texto vai ser lido.',
    ],
    'Não misture mais de duas fontes no mesmo documento — uma para título e uma para corpo basta. Documento com cinco fontes não parece rico, parece remendado, e é o erro mais comum de quem está aprendendo.',
    ['serifa', 'fonte', 'legibilidade'],
    [
      ['Com o texto todo selecionado (Ctrl+A), a caixa Fonte abre a lista — e cada nome vem escrito com a própria letra. Cambria, Georgia, Times e Garamond têm os pezinhos.',
        'Lista de fontes aberta embaixo da caixa Fonte, com Calibri, Arial, Verdana e Segoe UI sem serifa e Cambria, Georgia, Times New Roman e Garamond serifadas; Georgia está circulada. O documento atrás está todo selecionado.'],
      ['Georgia escolhida: o convite inteiro passa a ser serifado, que é o que convém ao papel que vai para as famílias.',
        'Convite agora escrito em Georgia, com o primeiro parágrafo circulado e a caixa Fonte, também circulada, mostrando Georgia.'],
    ],
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
      'Há dois caminhos, os dois em Inserir › Tabela. **Inserir Tabela** cria a grade vazia, com quantas colunas e linhas você pedir, e `Tab` na última célula acrescenta uma linha nova — é como se digita uma lista inteira sem tocar no mouse. **Converter Texto em Tabela** serve quando a lista já existe separada por Tab, que é como ela chega quando alguém a cola de uma planilha: cada Tab vira a divisa de uma coluna.',
      'O que ela **não** é: um jeito de alinhar texto. Lista alinhada com Tab parece tabela até um nome crescer, e aí a linha inteira escorrega; tabela invisível usada para pôr duas coisas lado a lado desmonta quando alguém abre o documento em outro computador.',
    ],
    'A primeira linha costuma ser o cabeçalho, e vale marcá-la como tal (Layout da Tabela › Linha de Cabeçalho): numa tabela que atravessa duas páginas, o cabeçalho marcado se repete no alto da segunda. Sem isso, a página seguinte é uma tabela sem títulos de coluna.',
    ['tabela', 'linha', 'coluna', 'cabeçalho da tabela', 'converter texto em tabela'],
    [
      ['A lista de vendas veio colada da planilha do caixa. Com o ¶ ligado, cada linha termina num ¶: são cinco parágrafos alinhados com Tab, e não uma tabela.',
        'Relatório da cantina com as vendas em cinco linhas — Item, Pastel, Suco, Pipoca e Água — alinhadas em três colunas por tabulação, circuladas, cada uma terminando em ¶.'],
      ['Selecione as cinco linhas e vá em Inserir › Tabela › Converter Texto em Tabela…',
        'Guia Inserir aberta com o menu do botão Tabela mostrando Inserir Tabela e Converter Texto em Tabela, este circulado.'],
      ['Cada Tab virou uma divisa de coluna: agora é uma tabela de verdade, e o texto de uma célula não empurra o da vizinha.',
        'A mesma lista transformada numa tabela de três colunas e cinco linhas com bordas, circulada.'],
    ],
  ),
  t(
    'linha-e-coluna',
    'Acrescentar e remover',
    'A tabela muda depois de pronta, e há botão para isso.',
    [
      'Com o cursor numa célula, duas guias novas aparecem no fim da fileira: **Design da Tabela**, com os estilos, e **Layout da Tabela**, com o que muda a forma — inserir linha acima ou abaixo, coluna à esquerda ou à direita, e excluir.',
      'Remover é pelo mesmo caminho, e ali mora uma confusão que custa caro: **apagar o conteúdo não é remover a linha**. Selecionar as células e apertar Delete esvazia o que estava escrito e deixa a linha vazia lá, ocupando espaço. Quem tira a linha é Layout da Tabela › Excluir › Excluir Linhas.',
      'A guia contextual é a mesma ideia do resto do editor: ela só existe enquanto o cursor está dentro da tabela, porque comandos de tabela não têm o que fazer fora dela.',
    ],
    'Se a guia de Layout sumiu, o cursor saiu da tabela. Não é um defeito do programa: é a guia contextual fazendo o que ela faz.',
    ['inserir linha', 'excluir linha', 'guia contextual'],
    [
      ['Com o cursor na célula “Gelo”, aparecem duas guias no fim da fileira: Design da Tabela e Layout da Tabela.',
        'Word com a tabela de vendas; o cursor está na célula Gelo, na última linha, e as guias Design da Tabela e Layout da Tabela, em vermelho no fim da fileira de guias, estão circuladas.'],
      ['Em Layout da Tabela › Excluir, escolha Excluir Linhas — e não o Delete nas células.',
        'Guia Layout da Tabela aberta, com o menu do botão Excluir mostrando Excluir Linhas, circulado, e Excluir Colunas.'],
      ['A linha do gelo saiu inteira. Com Delete ela teria ficado ali, vazia, ocupando espaço.',
        'A tabela de vendas circulada, agora com cinco linhas e sem a do gelo.'],
    ],
  ),
  t(
    'imagem-no-texto',
    'A imagem e o texto em volta',
    'O que decide onde ela fica é a disposição.',
    [
      'Inserida, a imagem nasce *alinhada com o texto*: ela se comporta como se fosse uma letra gigante, sozinha numa linha enorme, com um vazio do lado. Isso quase nunca é o que se quer.',
      'A disposição do texto, em Formato da Imagem › Dispor Texto, é o que decide o resto. **Quadrada** faz o texto contornar a caixa da imagem; **Próxima** contorna o desenho; **Acima e Abaixo** a deixa sozinha na largura da página. **Atrás** e **À Frente** tiram a imagem da linha, e o texto passa a ignorá-la — o que quase nunca é arrumar.',
      'Escolhida a disposição, a imagem passa a ter uma **âncora**: um parágrafo ao qual ela está presa. Apagar aquele parágrafo leva a imagem junto, e é assim que uma foto some de um documento sem ninguém ter apagado foto nenhuma.',
    ],
    'Imagem esticada para caber é o defeito que mais aparece em documento de clube. Arraste sempre pelo canto, e nunca pelo meio da borda: o canto mantém a proporção, e o meio achata as pessoas da foto.',
    ['imagem', 'disposição do texto', 'âncora', 'proporção'],
    [
      ['A foto da fila entrou alinhada com o texto: ocupa uma linha só para ela, com um vazio do lado.',
        'Relatório da cantina com uma foto entre dois parágrafos; o trecho circulado mostra a foto à esquerda e um espaço branco à direita dela, antes do parágrafo seguinte.'],
      ['Com a foto escolhida, Formato da Imagem › Dispor Texto mostra as seis disposições.',
        'Guia contextual Formato da Imagem aberta, com o menu Dispor Texto listando Alinhada com o Texto, Quadrada (circulada), Próxima, Atrás do Texto, À Frente do Texto e Acima e Abaixo.'],
      ['Em Quadrada, o texto passa a contornar a caixa da foto, e o vazio sumiu.',
        'A foto e os dois parágrafos seguintes circulados: o texto agora corre ao lado direito da foto.'],
    ],
  ),
  t(
    'legenda',
    'A legenda',
    'Um campo que se numera sozinho, e não uma frase embaixo da foto.',
    [
      'Legenda é o texto que identifica a imagem ou a tabela, e no editor ela é um recurso, não uma linha escrita à mão: escolha a figura e vá em Referências › Inserir Legenda.',
      'A diferença é a numeração. A legenda inserida assim traz um **campo** — o "Figura 1" de fundo cinza —, e o campo se renumera sozinho quando alguém acrescenta uma figura no meio do documento. Escrita à mão, a figura 3 vira a 4 e ninguém corrige a 5, a 6 e a 7.',
      'E ela usa o estilo Legenda, o que faz todas ficarem iguais, e permite gerar um índice de figuras depois — pelo mesmo caminho do sumário.',
    ],
    'A legenda fica acima da tabela e abaixo da figura — é a convenção de todo texto técnico. Não é exigência do programa; é o que quem lê espera encontrar.',
    ['legenda', 'campo', 'numeração automática', 'índice de figuras'],
    [
      ['A segunda foto já tem legenda, inserida pelo Word: o “Figura 1” de fundo cinza é um campo, e não texto digitado.',
        'Relatório com duas fotos; só a de baixo tem legenda, circulada, começando por Figura 1 com fundo cinza.'],
      ['Escolha a primeira foto e vá em Referências › Inserir Legenda.',
        'Guia Referências aberta, com o botão Inserir Legenda circulado no grupo Legendas.'],
      ['A legenda nova nasce “Figura 1”, e a que era 1 virou “Figura 2” sozinha. Digitadas à mão, as duas diriam “Figura 1”.',
        'As duas legendas circuladas: embaixo da primeira foto, Figura 1; embaixo da segunda, Figura 2.'],
    ],
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
      'Eles não fazem parte do corpo do texto, e é por isso que o cursor não chega neles digitando — entra-se por Inserir › Cabeçalho (ou Rodapé), ou com dois cliques na área.',
      'A primeira página costuma ser diferente: uma capa não leva cabeçalho. A caixa **Primeira Página Diferente**, no mesmo grupo, existe justamente para isso, e é ela que evita a gambiarra de pôr a capa num arquivo separado.',
    ],
    'Escrever o nome do clube no alto da primeira página, dentro do corpo, parece a mesma coisa e não é: ele não vai se repetir, e vai empurrar o texto quando alguém acrescentar um parágrafo acima.',
    ['cabeçalho', 'rodapé', 'primeira página diferente'],
    [
      ['Inserir › Cabeçalho abre a faixa de cima da folha, fora do corpo do texto.',
        'Guia Inserir aberta, com o botão Cabeçalho circulado no grupo Cabeçalho e Rodapé, ao lado de Rodapé, Número de Página e Primeira Página Diferente.'],
      ['Escrito uma vez na folha 1, o cabeçalho aparece igual na 2 e na 3. Com o zoom em 50%, dá para ver duas folhas de uma vez.',
        'Duas folhas do manual em zoom de 50%; no alto de cada uma, circulado, o mesmo cabeçalho: Unidade Falcão — Manual de Acampamento 2026.'],
    ],
  ),
  t(
    'numeracao',
    'Numeração de páginas',
    'Um campo, e não um número digitado.',
    [
      'O número da página é um campo que o editor calcula: Inserir › Número de Página. Acrescentar ou tirar páginas renumera tudo sozinho.',
      'Ele mora no cabeçalho ou no rodapé, porque é lá que ele precisa se repetir. E é aí que mora o engano: o que se digita no rodapé também se repete — igual em todas as folhas. "Página 1" digitado na primeira aparece na segunda, na terceira e na décima.',
      'Documento com capa costuma não numerar a capa, e costuma começar a contar do 1 na página seguinte. As duas coisas são configuráveis, e são o que separa um relatório entregue de um rascunho impresso.',
    ],
    'Se o número não muda de página para página, ele foi digitado, e não inserido como campo. É o mesmo teste do sumário: o que o editor calcula, ele recalcula.',
    ['número de página', 'campo', 'capa'],
    [
      ['O rodapé desta folha diz “Página 1”, e ela é a segunda. Alguém digitou o número, e ele se repete igual em todas.',
        'Segunda folha do manual em zoom de 50%, com o rodapé circulado dizendo Página 1; embaixo dela, o rótulo Folha 2 de 3.'],
      ['Inserir › Número de Página troca o número digitado por um campo de fundo cinza: esta folha passa a dizer 2, a seguinte 3, e ninguém digitou nada.',
        'A mesma folha depois do comando: o botão Número de Página está circulado na faixa e o rodapé, também circulado, mostra Página seguido do número 2 num campo cinza.'],
    ],
  ),
  t(
    'sumario',
    'O sumário',
    'Ele é lido dos estilos, e não escrito à mão.',
    [
      'O sumário se gera em Referências › Sumário, e o que ele procura são os parágrafos marcados com os estilos de título — Título 1 vira entrada de primeiro nível, Título 2 de segundo, e cada entrada leva a folha em que o título está.',
      'É aqui que o módulo 1 se paga. Num documento formatado à mão o sumário sai vazio, e a tela não diz por quê: não há erro, há uma caixa sem nada dentro.',
      'E ele **guarda o que leu**. Mudar um título de folha, ou trocar o texto dele, depois de gerar deixa o sumário mostrando o documento de antes, e nada no texto avisa. O botão Atualizar Sumário é o que o alcança, e ele é metade da lição: um sumário desatualizado é pior do que nenhum, porque quem lê confia nele.',
    ],
    'Sumário gerado antes de o documento acabar aponta para páginas que ainda vão mudar. Gere quando quiser, mas atualize antes de exportar — e confira, porque o que ele mostra é o que o clube vai arquivar.',
    ['sumário', 'atualizar sumário', 'níveis de título'],
    [
      ['Referências › Sumário lê os títulos do manual e anota a folha de cada um: “O fogo” está na 3.',
        'Primeira folha do manual com o sumário gerado e circulado, listando os títulos e subtítulos com os números de folha à direita; O fogo aparece na folha 3.'],
      ['Uma quebra de página antes de “O fogo” o mandou para a folha 4 — e o sumário continua dizendo 3. A barra de status diz “Sumário desatualizado”.',
        'O mesmo sumário, com a linha O fogo circulada ainda apontando para a folha 3; na barra de status, embaixo, Sumário desatualizado e 4 folhas.'],
      ['Atualizar Sumário relê o documento, e “O fogo” passa a apontar para a folha 4.',
        'Guia Referências com o botão Atualizar Sumário circulado; no sumário, a linha O fogo, também circulada, agora termina em 4.'],
    ],
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
      'Nada disso é definitivo. No fim, quem é dono do documento percorre as marcas — o botão **Próxima** vai de uma em outra — e **aceita** ou **rejeita** cada uma. É só aí que o texto de verdade muda.',
      'É o que permite mandar um documento para a liderança revisar sem perder o que estava escrito. Sem ele, a devolução vem com o texto já trocado e ninguém sabe o que foi mexido.',
    ],
    'Documento entregue com alterações ainda marcadas é documento entregue pela metade. Antes de exportar, aceite ou rejeite tudo — e repare que "Sem Marcações" só **esconde** as marcas: elas continuam lá, e reaparecem para quem abrir depois.',
    ['controlar alterações', 'aceitar', 'rejeitar'],
    [
      ['Na guia Revisão, Controlar Alterações liga a marcação. Daqui em diante, toda edição fica registrada.',
        'Ata da diretoria aberta na guia Revisão, com o botão Controlar Alterações circulado no grupo Controle.'],
      ['Trocando “18h” por “19h” com o controle ligado, nada some: o 18h fica riscado e o 19h entra sublinhado, na cor de quem mexeu.',
        'O primeiro parágrafo da ata circulado: no horário da saída, 18h aparece riscado e 19h logo depois, sublinhado em azul. A barra de status diz 2 marcas pendentes.'],
      ['Próxima e Aceitar, marca por marca: depois das duas, sobra o texto final, sem marca nenhuma.',
        'O mesmo parágrafo circulado, agora dizendo apenas às 19h, sem risco nem sublinhado; a barra de status diz Sem marcas pendentes.'],
    ],
  ),
  t(
    'comentario',
    'Comentário',
    'Recado na margem, que não entra no texto.',
    [
      'Comentário é uma anotação presa a um pedaço do texto, e que fica na margem. Ele não é o texto: não sai na impressão comum e não aparece para quem lê o documento depois de resolvido.',
      'Serve para o que é pergunta, e não correção: "confirmou a data com a igreja?", "esta tabela não bate com a do ano passado". Quem recebe responde no próprio balão, e a conversa fica encadeada ali, junto do trecho de que ela fala.',
      'Resolvido o assunto, o comentário se marca como resolvido, ou se exclui. Comentário que fica aberto para sempre vira ruído, e o próximo leitor não sabe se aquilo ainda importa.',
    ],
    'Comentário não é controle de alterações. Um pergunta, o outro muda — e quem escreve a correção dentro do comentário obriga a outra pessoa a digitá-la de novo.',
    ['comentário', 'revisão', 'resolver'],
    [
      ['A liderança devolveu a ata com uma pergunta na margem, presa ao parágrafo do gás — que aparece destacado em amarelo.',
        'Ata da diretoria com o parágrafo sobre o gás destacado em amarelo e circulado; à direita, na margem, um balão circulado com a pergunta da Liderança sobre quem vai comprar o gás.'],
      ['A resposta entra no próprio balão, embaixo da pergunta: a conversa fica junta, e não espalhada em mensagens.',
        'O balão da margem circulado, agora com a resposta de Você embaixo da pergunta, dizendo que o Tiago fica com a compra, e os botões Responder e Resolver.'],
      ['Resolvido, o balão fica apagado e marcado “Resolvido”: continua lá para quem procurar, e para de pedir atenção.',
        'O mesmo balão circulado, em cinza, com a pergunta, a resposta e a palavra Resolvido no pé.'],
    ],
  ),
  t(
    'substituicao',
    'Substituição automática',
    'Trocar tudo de uma vez, e conferir antes de confiar.',
    [
      'Localizar e Substituir (`Ctrl+H`, ou Início › Substituir) troca um texto por outro em todo o documento. É o que conserta em dois segundos o nome de um lugar escrito errado dezoito vezes.',
      'E é onde se estraga um documento inteiro em dois segundos também. Procurar "ana" acha o nome Ana — e acha também o "ana" de dentro de "semana", "Mariana" e "banana". Substituir Tudo troca todos, de uma vez, sem perguntar.',
      'Por isso existem as duas opções que quase ninguém marca: **diferenciar maiúsculas de minúsculas** e **localizar palavras inteiras**. Antes de apertar Substituir Tudo, olhe a contagem de ocorrências: se ela é maior do que o que você esperava, é porque a busca está pegando pedaço de outra palavra.',
    ],
    'O Ctrl+Z desfaz um Substituir Tudo inteiro, e é a primeira coisa a apertar quando o documento fica estranho. Mas ele só alcança enquanto o documento não foi fechado — depois disso, o que vale é a cópia de segurança.',
    ['localizar e substituir', 'palavras inteiras', 'Ctrl+H'],
    [
      ['Procurar “ana” e trocar por “Ana”, sem marcar nada: o Word conta 6 ocorrências, e o nome só aparece duas vezes.',
        'Caixa Localizar e Substituir aberta e circulada, com ana em Localizar, Ana em Substituir por, as duas caixas de opção desmarcadas e a contagem de 6 ocorrências no documento.'],
      ['Substituir Tudo estragou o texto: semAna, MariAna, bAnana — tudo de uma vez, sem aviso.',
        'Os dois parágrafos da escala circulados, agora com semAna, MariAna e bAnana escritos errado ao lado de Ana.'],
      ['Ctrl+Z desfaz tudo. Com as duas caixas marcadas, a mesma busca acha só 2 ocorrências: as duas “ana” sozinhas.',
        'A caixa Localizar e Substituir com Diferenciar maiúsculas de minúsculas e Localizar palavras inteiras marcadas e a contagem de 2 ocorrências, tudo circulado; o texto atrás voltou ao original.'],
      ['Agora sim: só o nome mudou, e semana, Mariana e banana ficaram intactas.',
        'Os dois parágrafos circulados com Ana em maiúscula nos dois lugares e semana, Mariana e banana escritas certo.'],
    ],
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
      'É o oposto do arquivo editável. O `.docx` guarda as **instruções** — "isto é Título 1, e Título 1 é Calibri 16" — e monta a página na hora de abrir, com o que a máquina tiver. Se ela não tiver a fonte, usa outra; a outra é um pouco mais larga, a linha quebra noutro lugar, e o título que fechava a folha 3 abre a folha 4. Quem conferiu o relatório no computador de casa e o imprime no do clube vê um documento que não foi o que conferiu.',
      'Por isso o PDF é o formato de entrega, e não o formato de trabalho: ele está certo em toda máquina justamente porque quase não dá para editá-lo.',
    ],
    'PDF não é imagem, e não é seguro. O texto continua dentro dele — dá para copiar, dá para procurar palavra, e dá para editar com o programa certo. Ele congela a aparência, e não o conteúdo.',
    ['PDF', 'formato portátil', 'docx'],
  ),
  t(
    'exportar',
    'Exportar em PDF',
    'Um gesto, e um retrato do documento naquele instante.',
    [
      'Exportar se faz por Arquivo › Exportar › Criar PDF/XPS, ou por Arquivo › Salvar como, escolhendo PDF na lista de tipos. Os dois caminhos chegam no mesmo lugar.',
      'E o PDF **congela o que existir na hora**, exatamente como o sumário guarda o que leu. Exportar cedo e continuar mexendo é o que se faz sem pensar, e o arquivo entregue fica sem o que veio depois — sem nada na tela dizendo isso.',
      'A ordem que evita isso é sempre a mesma: terminar o texto; aceitar ou rejeitar as marcas de revisão; atualizar o sumário; só então exportar; e guardar o editável junto.',
    ],
    'O PDF exportado não se corrige: corrige-se o documento editável e exporta-se de novo. Quem conserta no PDF acaba com dois documentos diferentes, e o editável — que é o que vai ser usado no ano que vem — fica sendo o errado.',
    ['exportar', 'Salvar Como', 'ordem de entrega'],
    [
      ['O botão Exportar abre a mesma tela de Arquivo › Exportar.',
        'Manual da Unidade Falcão aberto no Word, com o botão Exportar circulado no grupo Entrega, no fim da faixa.'],
      ['Criar PDF/XPS. O próprio Word diz o que o PDF faz: mantém o layout, as fontes e as imagens, e não se altera facilmente.',
        'Tela azul de bastidores do Word na seção Exportar, com a explicação de Criar Documento PDF/XPS e o botão Criar PDF/XPS circulado.'],
      ['A barra de status passa a listar o PDF gravado. Ele é um retrato: o que mudar no documento daqui em diante não entra nele.',
        'De volta ao documento, a barra de status embaixo mostra, circulado, o arquivo Manual da Unidade Falcão.pdf.'],
    ],
  ),
  t(
    'editavel-e-pdf',
    'Por que se entrega os dois',
    'Um para ler agora, outro para mexer no ano que vem.',
    [
      'O requisito 7 pede o relatório em PDF **e** em formato editável, e não é redundância: são dois usos diferentes do mesmo trabalho.',
      'O PDF é o que se lê, se imprime e se arquiva: ele é o documento como ele ficou, e ninguém o desconfigura por acidente.',
      'O editável é o que a próxima diretoria abre para fazer o relatório do ano seguinte. Sem ele, o clube tem um retrato bonito de um trabalho que vai ter de ser refeito do zero — e é por isso que a entrega é dupla.',
      'Os dois levam o mesmo nome, com data e versão — `manual-falcao-2026-03-14-v01.docx` e `manual-falcao-2026-03-14-v01.pdf` —, que é o padrão de nomeação da CC-ES001 aplicado aqui.',
    ],
    'Um par com nomes diferentes vira, seis meses depois, duas coisas que ninguém sabe se são a mesma. E um editável salvo antes de terminar, ao lado de um PDF novo, tem o mesmo nome e outro conteúdo — salve os dois depois da última mudança.',
    ['entrega', 'formato editável', 'versão'],
    [
      ['Arquivo › Salvar como: o nome leva data e versão, e o tipo é Documento do Word (.docx).',
        'Tela de bastidores Salvar como, com o campo Nome do arquivo preenchido com manual-falcao-2026-03-14-v01 e o Tipo Documento do Word, os dois circulados.'],
      ['Salvo o editável e exportado o PDF, a barra de status lista o par: o mesmo nome, um .docx e um .pdf.',
        'Documento de volta à tela, com a barra de status circulada mostrando manual-falcao-2026-03-14-v01.docx e manual-falcao-2026-03-14-v01.pdf.'],
    ],
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
      {
        /*
          Os requisitos 4.2 e 4.3, num documento que chega **incompleto**.

          É a variação que faltava: os módulos 1 e 2 chegam errados de um jeito
          que não se vê, e este chega com a lista de inscritos torta na
          primeira olhada — porque ela foi alinhada com Tab e abriu noutra
          fonte. O que continua invisível é a legenda da foto do mastro, que
          foi digitada e por isso vai continuar dizendo "Figura 1" quando
          entrar uma figura antes dela.
        */
        id: 'm3-lab', tipo: 'word', documento: 'relatorio',
        titulo: 'Completando o relatório do acampamento',
        resumo: 'Uma lista alinhada com Tab, uma foto que falta, e uma legenda que não se renumera.',
        verificacoes: ['tabela', 'formatar', 'linhas-e-colunas', 'imagem', 'disposicao', 'legendas'],
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
      {
        /*
          Os requisitos 4.4 e 4.5, num documento de quatro folhas.

          O defeito deste **muda de página**: o rodapé diz "Página 2" em todas
          elas, porque alguém digitou isso no dia em que o documento tinha
          duas. Na folha 2 está certo; nas outras três, não. É a irmã exata da
          legenda digitada do módulo 3, com o outro campo que a vereda ensina.

          E o sumário envelhece enquanto se trabalha: a seção que a liderança
          pediu entra depois, e quem gerou o sumário antes o vê ficar velho na
          própria tela, sem nada avisar.
        */
        id: 'm4-lab', tipo: 'word', documento: 'anual',
        titulo: 'Arrumando o relatório anual',
        resumo: 'Um rodapé digitado que erra em três folhas, e um sumário que envelhece enquanto se trabalha.',
        verificacoes: ['cabecalho', 'numeracao', 'primeira-diferente', 'secao', 'sumario'],
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
      {
        /*
          O requisito 5 inteiro, e o único documento da vereda com duas
          autorias.

          Os quatro anteriores chegam errados e quem conserta é quem abre.
          Este chega **já mexido**: a liderança leu, marcou duas alterações e
          deixou uma pergunta na margem. Uma das marcas está certa e a outra
          não — e é por isso que Aceitar Todas e Rejeitar Todas falham os dois,
          cada um do seu jeito, e o desbravador precisa percorrer marca a
          marca.

          A substituição tem de poder errar, e erra: o documento traz a palavra
          no singular e no plural, e um Substituir Tudo sem "palavras inteiras"
          deixa "desbravadors" em dois lugares sem nada avisar. Ctrl+Z desfaz a
          troca inteira, que é o que a teoria diz e é o que o laboratório faz.
        */
        id: 'm5-lab', tipo: 'word', documento: 'revisao',
        titulo: 'Fechando o relato que voltou revisado',
        resumo: 'Duas marcas da liderança, uma pergunta na margem, e uma troca que pode estragar o texto.',
        verificacoes: ['controlar', 'resolver', 'responder', 'comentar', 'substituir'],
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
      {
        /*
          Os requisitos 4.6 e 7, no único documento da vereda que chega pronto.

          As quatro peças que o requisito 7 nomeia — sumário, cabeçalho, imagem
          legendada e tabela — já estão lá, porque construí-las é o que os
          módulos 3 e 4 cobraram, e repetir a tarefa aqui mediria de novo o que
          já foi medido. O que falta é a **entrega**, e ela tem ordem.

          Duas coisas ficaram para trás, e nenhuma se vê sem procurar: uma
          marca de revisão que ninguém resolveu, e o sumário, gerado quando o
          relatório tinha três folhas. Exportar agora é o gesto que se faz sem
          pensar, e o PDF sai com as duas dentro — o PDF congela o que existir
          na hora, e do lado de fora um velho e um novo são o mesmo ícone.
        */
        id: 'm6-lab', tipo: 'word', documento: 'entrega',
        titulo: 'Entregando o relatório do ano',
        resumo: 'O relatório pronto, a ordem de entrega, e o par de arquivos que fica com o clube.',
        verificacoes: ['terminar', 'nomear', 'exportar', 'pdf-em-dia', 'entrega-dupla'],
      },
    ],
  },
];
