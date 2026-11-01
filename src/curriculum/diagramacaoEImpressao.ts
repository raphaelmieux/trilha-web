import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DA_DIAGRAMACAO as Q } from './questoesDaDiagramacao';
import { telasDoTopico } from './telas';

/*
 * A vereda CC-DG005 Diagramação e Impressão.
 *
 * ── O que ela é ─────────────────────────────────────────────────────────
 * A quinta da família de Design, e a que leva o trabalho da tela para o
 * papel. Os seis termos do requisito 2, a explicação do 3, as cinco
 * demonstrações do 4, a gráfica do 5 e a prova de cores do 6 viram sete
 * lições — sobre o mesmo boletim de inverno do clube, montado do zero até o
 * PDF que a gráfica aceitaria.
 *
 * ── O que fica fora do aplicativo ────────────────────────────────────────
 * Imprimir de verdade, consultar uma gráfica de verdade e apresentar a peça
 * impressa. A plataforma prepara cada um: a prova de cores na tela, a tabela
 * de serviços de uma gráfica para aprender a ler, e o PDF.
 *
 * ── As telas são do guia da caminhada ────────────────────────────────────
 * Os tópicos que ensinam um gesto do programa o mostram tela por tela, no
 * diagramador, sobre o guia da caminhada ecológica — e não sobre o boletim,
 * cujas margens, colunas, ppi e cores são as respostas do laboratório. O
 * motivo está em `src/exemplos/guiaDaCaminhada.ts`. Os que não têm gesto —
 * RGB e CMYK, a tabela da gráfica, a gramatura, a comparação com o papel —
 * ficam só no texto.
 *
 * ── Os números ──────────────────────────────────────────────────────────
 * Os que a teoria cita — milímetros, ppi, larguras de coluna — saem do mesmo
 * motor que confere as lições, e `exemplosDaDiagramacao.test.ts` os confere.
 */

const V = 'CC-DG005';

const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], atencao: string, marcas: string[],
  telas?: [legenda: string, descricao: string][],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, atencao, marcas, ...(telas ? { telas: telasDoTopico(V, id, telas) } : {}),
});

/* ── Módulo 1: a malha ────────────────────────────────────────────────────── */

const MALHA: TopicoDeVereda[] = [
  t(
    'malha-de-diagramacao',
    'A malha de diagramação',
    'As linhas invisíveis que dizem onde cada coisa pode ficar na página.',
    [
      'A **malha** é o esqueleto da página: as **margens** em volta e as **colunas** dentro delas. Ela não aparece impressa, mas tudo o que aparece se apoia nela — o texto corre nas colunas, as fotos começam e terminam nas bordas delas.',
      'O vão entre duas colunas se chama **medianiz**. Pequeno demais, o olho pula de uma coluna para a outra no meio da linha; grande demais, a página parece duas folhas separadas.',
      'A malha se monta em **Layout › Margens e colunas**, antes de pôr qualquer texto: as quatro margens, quantas colunas, e a medianiz. O programa divide o que sobra entre as colunas, e as guias aparecem na página. Nas telas, o guia da caminhada do clube ganha três colunas de 36 mm — coluna estreita, boa para um guia de bolso que se lê aos pedaços.',
      'Depois, cada **quadro de texto** se encaixa numa coluna. Com a ferramenta de texto, clica-se dentro da coluna e se acertam X, Y e altura no painel de propriedades: o quadro fica exatamente entre as duas guias, e o texto corre dentro dele.',
      'Página que segue a malha parece arrumada mesmo sem ninguém saber dizer por quê. Página sem malha tem cada foto num lugar, e o olho cansa procurando onde começa a próxima coisa.',
    ],
    'Malha não é prisão: uma foto pode ocupar duas colunas, desde que comece e termine nas guias.',
    ['malha', 'coluna', 'medianiz'],
    [
      ['A malha mora em Layout › Margens e colunas', 'O diagramador com a página 2 do guia ainda sem malha: só uma margem fina em volta e uma coluna. O menu Layout está aberto, e o item Margens e colunas aparece circulado.'],
      ['Quatro margens, três colunas e 6 mm de medianiz', 'A caixa Margens e colunas preenchida: 14 mm em cima, 16 embaixo, 17 de margem interna, 11 de externa, 3 colunas e medianiz de 6 mm.'],
      ['As guias aparecem na página', 'A página 2 com as guias da malha nova: o retângulo das margens e as linhas que marcam as três colunas, com o vão da medianiz entre elas. O painel da direita confirma 14 mm em cima, 3 colunas.'],
      ['O quadro de texto se encaixa na primeira coluna', 'Um quadro de texto criado na primeira coluna, com X 11 mm e largura 36 mm no painel: o texto do guia corre dentro dele, de guia a guia.'],
    ],
  ),
  t(
    'margem-e-sangria',
    'Margem e sangria',
    'A margem é o espaço de dentro; a sangria é o espaço de fora.',
    [
      'A **margem** é a faixa entre a borda do papel e o texto. Ela dá respiro e protege o texto do corte. A **margem interna**, junto da dobra, costuma ser maior: num livreto grampeado, um pedaço dela some na dobra.',
      'A **sangria** é o contrário: uma faixa **fora** do papel, de uns 3 mm, onde passa tudo o que precisa chegar até a borda — a foto da capa, uma faixa de cor. A guilhotina nunca corta exatamente na linha, e o que para na borda deixa um fio branco do lado que o corte errou.',
      'São dois passos. Primeiro o documento **reserva** a sangria, em **Arquivo › Configurar documento**: aparece uma linha tracejada vermelha 3 mm fora do papel. Depois a foto é **esticada até ela**: a capa do guia, que estava em X 0 e Y 0, passa para X −3, Y −3, com 6 mm a mais de largura e de altura — 3 de cada lado.',
      'Por isso a regra é: o que encosta na borda, passa da borda. Texto nunca vai para a sangria; foto e fundo de cor, sim.',
    ],
    'Margem interna e externa trocam de lado entre a página da esquerda e a da direita. A interna fica sempre junto da dobra.',
    ['margem', 'sangria'],
    [
      ['Reserve a sangria em Arquivo › Configurar documento', 'A caixa Configurar documento, com o formato A5 e o campo Sangria preenchido com 3 mm.'],
      ['A capa ainda para na borda do papel', 'A capa do guia selecionada, com X 0 e Y 0 no painel. Em volta do papel aparece a linha tracejada vermelha da sangria, e a foto não chega até ela.'],
      ['Estique a foto até a linha tracejada', 'A mesma capa com X −3, Y −3, largura 154 e altura 216 mm: agora a foto cobre a faixa da sangria em volta do papel inteiro.'],
    ],
  ),
];

/* ── Módulo 2: os estilos ─────────────────────────────────────────────────── */

const ESTILOS: TopicoDeVereda[] = [
  t(
    'estilos-de-paragrafo',
    'Estilos de parágrafo',
    'Um nome para cada tipo de texto, com a letra, o corpo e a entrelinha dele.',
    [
      'Num texto longo, cada **tipo** de parágrafo tem um **estilo**: Título, Corpo, Legenda. O estilo guarda a família, o corpo, a entrelinha e o espaço antes — e todo parágrafo daquele tipo usa o mesmo.',
      'É a mesma ideia dos estilos da CC-ES002, no editor de texto: mudar o estilo muda todos os parágrafos dele de uma vez, em todas as páginas. Mudar à mão, um por um, deixa o terceiro título diferente dos outros sem ninguém perceber.',
      'Na diagramação, corpo e entrelinha se dizem em **pontos**, e se escrevem juntos: "10/13,5" é letra de 10 pontos com 13,5 pontos de uma linha para a outra. No guia da caminhada, o Corpo é Times New Roman 10/13,5 e o Título é Verdana em negrito, 13/16.',
      'O estilo de cada parágrafo aparece em **Texto › Editar matéria**: o nome vem antes do começo do parágrafo, e a caixa ao lado troca o estilo.',
    ],
    'Um título feito de Corpo aumentado à mão parece título na tela e não é título para o programa: ele não muda quando o estilo muda.',
    ['estilo de parágrafo', 'corpo e entrelinha'],
    [
      ['Cada tipo de texto com a sua letra', 'A página 2 do guia diagramada: os títulos Antes de sair, O que observar no caminho e Regras da trilha em letra sem serifa e negrito, e o texto corrido em letra serifada menor, nas três colunas.'],
      ['O estilo de cada parágrafo, em Texto › Editar matéria', 'A caixa Editar matéria com a lista dos parágrafos. Antes de cada um aparece o nome do estilo, Título ou Corpo, e ao lado a caixa que troca o estilo.'],
    ],
  ),
  t(
    'o-mais-do-estilo',
    'O "+" do estilo',
    'A formatação feita à mão por cima do estilo, e por que limpar.',
    [
      'Quando alguém muda a letra ou o tamanho de um parágrafo à mão, o programa mostra um **"+"** depois do nome do estilo: "Corpo+". É a **formatação direta**, e ela vence o estilo.',
      'Num texto escrito por várias pessoas e colado de vários lugares, o "+" aparece em todo canto: um parágrafo em outra letra porque veio de um e-mail, um título que é corpo engordado. **Limpar a formatação** devolve o parágrafo ao estilo dele.',
      'Depois de limpar, confira se cada parágrafo está no **estilo certo**: o título que era corpo engordado volta a ser corpo comum, e precisa virar Título de verdade na caixa de estilo.',
    ],
    'Limpar a formatação não troca o estilo. O título que estava em Corpo continua em Corpo até alguém mudar.',
    ['formatação direta'],
    [
      ['O "+" denuncia o que foi mexido à mão', 'A caixa Editar matéria com dois parágrafos marcados Corpo+: o título O que observar no caminho, que é corpo engordado, e o parágrafo Não arranque flor nem folha, colado de um e-mail em outra letra.'],
      ['Limpar formatação devolve os dois ao estilo', 'Os mesmos dois parágrafos depois de Limpar formatação: o "+" sumiu e os dois aparecem como Corpo, com o botão Limpar formatação apagado.'],
      ['O título passa a ser Título', 'Na linha O que observar no caminho, a caixa de estilo foi trocada de Corpo para Título.'],
      ['Na página, os títulos ficam iguais', 'A página 2 depois de fechar a caixa: O que observar no caminho tem a mesma letra e o mesmo tamanho dos outros títulos, e o parágrafo colado voltou à letra do resto do texto.'],
    ],
  ),
];

/* ── Módulo 3: as imagens ─────────────────────────────────────────────────── */

const IMAGENS: TopicoDeVereda[] = [
  t(
    'imagem-na-malha',
    'A imagem na malha',
    'A foto começa e termina nas guias das colunas.',
    [
      'Uma foto **respeita a malha** quando as bordas dela caem nas guias: ocupa uma coluna inteira, ou duas, mas não para no meio da medianiz nem dois milímetros antes da margem. No guia, duas colunas são 78 mm: 36 de cada uma mais os 6 da medianiz.',
      'Põe-se a foto com a ferramenta **Quadro de imagem**: escolhe-se o arquivo, clica-se na página, e no painel se acertam X, Y e largura. **Ajustar altura à foto** calcula a altura certa para ela não ficar esticada.',
      'O texto **contorna** a foto: ele pula o espaço que ela ocupa e continua embaixo. Por isso pôr uma foto empurra o texto para a frente — e o fim do texto pode ficar sem lugar.',
      'Quando o texto não cabe, o programa avisa com um **"+" vermelho** no último quadro e com "Texto excedente" na barra de baixo. O texto não some do arquivo, mas some da página, e ninguém percebe que faltou o fim. O remédio é dar a ele um quadro novo para correr: no guia, o quadro da terceira coluna da página 3.',
    ],
    'Texto excedente se resolve criando um quadro novo para o texto correr, ou cortando texto. Diminuir a letra para caber muda o estilo do documento inteiro.',
    ['imagem na malha', 'texto excedente'],
    [
      ['Escolha a ferramenta e a foto', 'A barra de ferramentas com Quadro de imagem ligado e, ao lado, a caixa de escolha com ipe-amarelo.jpg selecionado.'],
      ['A foto nas guias, e o texto que sobrou', 'A foto do ipê nas duas primeiras colunas da página 2, de guia a guia, com X 11 e largura 78 mm. O texto pulou a foto, e a barra de baixo avisa Texto excedente: 12 linhas.'],
      ['Um quadro novo recebe o fim do texto', 'Na página 3, um quadro de texto novo na terceira coluna, com X 101 mm, recebe o fim do guia. A barra de baixo diz Sem texto excedente.'],
    ],
  ),
  t(
    'resolucao-de-impressao',
    'Resolução de impressão',
    'Os pontos por polegada que a foto tem no tamanho em que foi posta.',
    [
      'A **resolução de impressão** é quantos pixels a foto tem em cada polegada de papel, **no tamanho em que ela foi posta na página**. A gráfica pede uns 300 ppi; abaixo de 240, os pixels começam a aparecer no papel.',
      'É a conta da CC-DG003, aplicada à página: a mesma foto tem mais ppi pequena e menos ppi grande. A foto do lobo-guará, de 900 × 600 pixels, tirada com o celular, tem **191 ppi** atravessando as três colunas do guia, com 120 mm, e **293 ppi** em duas colunas, com 78 mm.',
      'O programa mostra o **ppi efetivo** de cada foto: na própria foto e no painel, em vermelho quando fica baixo. O remédio é diminuir a foto — ou trocar por uma com mais pixels. Aumentar o ppi no programa só inventa pixels.',
    ],
    'Foto tirada de grupo de mensagens costuma vir comprimida e pequena. Peça o arquivo original a quem tirou.',
    ['resolução de impressão', 'ppi efetivo'],
    [
      ['Grande demais: 191 ppi em vermelho', 'A foto do lobo-guará atravessando as três colunas da página 3, com 120 mm de largura. O selo na foto diz 191 ppi em vermelho, e o painel avisa ppi efetivo: 191.'],
      ['Em duas colunas, a mesma foto passa', 'A mesma foto com 78 mm de largura e altura ajustada. O selo agora diz 293 ppi, sem vermelho.'],
    ],
  ),
];

/* ── Módulo 4: as páginas ─────────────────────────────────────────────────── */

const PAGINAS: TopicoDeVereda[] = [
  t(
    'pagina-mestre',
    'A página-mestre',
    'O que se repete em toda página mora num lugar só.',
    [
      'A **página-mestre** é um modelo que as páginas herdam: o que está nela aparece em todas as que a usam. É ali que mora o **número da página** e o **cabeçalho corrente** — o nome da publicação no alto de cada página. Abre-se em **Páginas › Página-mestre A**.',
      'O número na mestre é um **campo**: ele mostra o número da página em que está, e muda sozinho quando uma página entra no meio. Número **digitado** em cada página é texto: acerta no dia em que foi digitado e erra no dia em que o documento muda.',
      'Ligar o automático **não apaga** os digitados: a página sai com dois números, um em cima do outro. Cada número digitado se seleciona e se exclui, em **Editar › Excluir**.',
      'A **capa** não leva a mestre: capa não tem número nem cabeçalho. Na lista de páginas, a mestre da capa vira "Nenhuma".',
    ],
    'Ligar o número automático e esquecer os digitados deixa dois números em cada página, um em cima do outro.',
    ['página-mestre', 'número de página'],
    [
      ['Número automático e cabeçalho, na página-mestre', 'A caixa Página-mestre A com Número de página automático marcado e o cabeçalho corrente preenchido com Guia da Caminhada.'],
      ['Dois números no pé da página', 'O pé da página 2 com dois "2" quase um em cima do outro: o que alguém digitou e o que a mestre põe sozinha.'],
      ['Excluído o digitado, fica o campo', 'O mesmo pé de página depois de selecionar o número digitado e mandar Editar › Excluir: sobrou um "2" só, o da mestre.'],
      ['A capa sem mestre', 'Na lista de páginas, a Página 1 (capa) com Mestre: Nenhuma. A capa não mostra número nem cabeçalho.'],
    ],
  ),
  t(
    'elementos-correntes',
    'Elementos correntes',
    'O que corre de página em página e ajuda o leitor a se achar.',
    [
      'Os **elementos correntes** são os que aparecem em toda página do miolo: o número, o cabeçalho com o nome da publicação, às vezes o nome da seção.',
      'Eles servem a quem folheia: o número diz onde se está e permite o sumário funcionar; o cabeçalho diz de que publicação é aquela folha, mesmo solta.',
      'Por virem da mestre, eles ficam sempre no mesmo lugar, na mesma letra e no mesmo tamanho. É a consistência que os estilos dão ao texto, aplicada ao que se repete.',
    ],
    'Cabeçalho escrito à mão em cada página é como número digitado: um dia ele fica diferente em uma delas.',
    ['elementos correntes', 'cabeçalho'],
    [
      ['O que corre no alto e no pé', 'A página 3 do guia com o cabeçalho Guia da Caminhada no alto, à esquerda, e o número 3 no pé, ao centro — os dois vindos da página-mestre.'],
    ],
  ),
];

/* ── Módulo 5: o PDF da gráfica ───────────────────────────────────────────── */

const PDF: TopicoDeVereda[] = [
  t(
    'rgb-e-cmyk',
    'Por que RGB e baixa resolução não servem para imprimir',
    'A tela faz cor com luz; o papel, com tinta. E o papel mostra cada pixel que falta.',
    [
      'A tela faz cada cor somando três **luzes**: vermelho, verde e azul — **RGB**. A impressora faz cada cor com quatro **tintas** sobre papel branco: ciano, magenta, amarelo e preto — **CMYK**. Algumas cores da tela, as muito vivas, nenhuma tinta alcança.',
      'Um arquivo em RGB, mandado para a gráfica, é convertido lá — e as cores mudam no caminho, sem ninguém ver antes. Convertendo em casa, na hora de exportar o PDF, a mudança acontece no seu computador, e a prova de cores mostra antes como vai ficar.',
      'E a resolução: a foto que fica bonita no site tem poucos pixels para o papel. Uma imagem de 600 pixels de largura enche a tela de um celular e, impressa a 300 ppi, cobre só 5 cm. Esticada para ocupar a página, ela vira quadradinhos.',
    ],
    'Converter para CMYK não estraga a foto: mostra antes o que a gráfica faria depois.',
    ['RGB', 'CMYK'],
  ),
  t(
    'marcas-de-corte',
    'Marcas de corte e o PDF da gráfica',
    'Os riscos fora do papel que dizem à guilhotina onde cortar.',
    [
      'As **marcas de corte** são riscos finos nos quatro cantos, **fora** da área do papel e da sangria. Elas mostram à gráfica exatamente onde fica a borda do papel depois do corte.',
      'O **PDF para a gráfica** sai em **Arquivo › Exportar PDF** e junta tudo: as páginas com a sangria de 3 mm em volta, as marcas de corte fora dela e as cores em CMYK. As opções que vêm marcadas são as de tela — sem sangria, sem marcas, em RGB —, e a prévia mostra a diferença antes de exportar.',
      'O PDF é um **retrato**: ele congela o documento de quando foi exportado. Mexeu no documento depois, o PDF ficou velho — exporte de novo, senão a gráfica imprime a versão de antes.',
    ],
    'Sangria no PDF sem sangria no documento sai como 3 mm de branco em volta. Reserve a sangria antes de diagramar.',
    ['marca de corte', 'PDF'],
    [
      ['O PDF que vem marcado é o de tela', 'A caixa Exportar PDF com o nome guia-da-caminhada.pdf, sangria 0, sem marcas de corte e em RGB. A prévia mostra a capa cortada rente à borda.'],
      ['Sangria, marcas e CMYK: o PDF da gráfica', 'A mesma caixa com sangria de 3 mm, Marcas de corte ligado e Cor em CMYK. A prévia agora mostra a foto passando da borda e os riscos de corte nos quatro cantos, do lado de fora.'],
    ],
  ),
];

/* ── Módulo 6: a gráfica ──────────────────────────────────────────────────── */

const GRAFICA: TopicoDeVereda[] = [
  t(
    'ler-a-grafica',
    'O que a gráfica pede',
    'Toda gráfica escreve na tabela de serviços como quer receber o arquivo.',
    [
      'Antes de mandar o arquivo, consulte a **tabela de serviços** da gráfica, ou peça um **orçamento**. Ela diz os formatos, os papéis, os prazos e, quase sempre, **como enviar o arquivo**.',
      'As exigências mais comuns são cinco: **PDF**, cores em **CMYK**, **3 mm de sangria** com **marcas de corte**, imagens a **300 ppi** no tamanho impresso, e **fontes incorporadas** ou convertidas em curvas. São exatamente as que os módulos anteriores ensinaram a preparar.',
      'A tabela também diz o que a gráfica **não** aceita — arquivo do editor de texto, imagem solta, fonte que ela não tem. Ler as duas metades é o que separa o arquivo que entra direto na máquina do que volta com um telefonema.',
      'Escrever essas exigências por escrito é o que deixa a próxima peça sair certa, mesmo que outra pessoa prepare o arquivo.',
    ],
    'Gráfica que aceita qualquer arquivo sem perguntar nada costuma corrigir por conta própria — e a correção dela pode não ser a sua.',
    ['orçamento', 'exigências do arquivo'],
  ),
  t(
    'gramatura',
    'Gramatura de papel',
    'O peso de um metro quadrado do papel, que diz quão grosso ele é.',
    [
      'A **gramatura** é quanto pesa um metro quadrado do papel, em gramas: 75 g/m² é o papel de impressora de casa; 250 g/m² é papel de capa, quase cartão.',
      'Capa e miolo pedem gramaturas diferentes. A **capa** precisa aguentar a mochila e o manuseio: 250 ou 300 g/m². O **miolo** precisa dobrar no grampo e não pesar: 75, 90 ou um couché de 120 g/m².',
      'O tipo do papel também conta. **Offset** é o papel fosco, bom de escrever por cima — o do caderno de campo. **Couché** tem uma camada lisa que deixa a foto mais viva, e é o das capas.',
      'Papel mais grosso custa mais e pesa mais no correio. Escolher a gramatura é escolher entre durar e caber no orçamento.',
    ],
    'Miolo em papel de capa não dobra direito no grampo, e o livreto não fecha.',
    ['gramatura'],
  ),
];

/* ── Módulo 7: a prova ────────────────────────────────────────────────────── */

const PROVA: TopicoDeVereda[] = [
  t(
    'prova-de-impressao',
    'Prova de impressão',
    'Ver antes, na tela ou num papel de teste, como a peça vai sair.',
    [
      'A **prova de impressão** é ver a peça como ela vai sair antes de imprimir tudo. Há duas: a **prova na tela**, em que o programa simula as tintas, e a **prova impressa**, uma cópia de teste que a gráfica entrega para aprovar.',
      'A da tela se liga em **Exibir › Prova de cores (CMYK)**. As cores que a tinta não alcança perdem o brilho na hora, na faixa da página e nas amostras. No guia da caminhada, o **âmbar** e o **verde vivo** mudam; o verde-escuro, o marrom e o quase preto ficam iguais.',
      'A prova impressa é a que vale: o papel, a luz e a tinta de verdade. A da tela avisa antes e economiza papel.',
    ],
    'Cor que muda na prova não é defeito do programa: é a tela avisando o que a tinta não consegue.',
    ['prova de impressão'],
    [
      ['A prova de cores mora em Exibir', 'O menu Exibir aberto, com o item Prova de cores (CMYK) circulado, e as cinco amostras do guia no painel: verde-escuro, marrom, âmbar, verde vivo e quase preto.'],
      ['O âmbar e o verde vivo perdem o brilho', 'A mesma página com a prova ligada: na faixa do alto e nas amostras, o âmbar ficou cor de mostarda e o verde vivo ficou mais apagado. As outras três cores não mudaram.'],
    ],
  ),
  t(
    'comparar-tela-e-papel',
    'Comparar a tela com o papel',
    'Imprimir, pôr ao lado da tela, e anotar o que mudou.',
    [
      'O requisito pede para **imprimir** a peça e **comparar** as cores do papel com as da tela, relatando as diferenças. A comparação se faz com a peça ao lado da tela, na mesma luz.',
      'Quase sempre o papel sai **mais escuro e menos vivo**: a tela tem luz própria e o papel só reflete a luz da sala. Os azuis, os verdes e os laranjas muito vivos são os que mais mudam.',
      'Anote cor por cor, e diga o porquê: "o verde vivo da faixa saiu apagado, porque a tela faz cor com luz e a tinta não alcança verdes tão vivos; o marrom ficou igual". É esse relato que ensina a escolher, na próxima peça, cores que saem iguais nos dois lugares.',
    ],
    'Compare com a tela no brilho normal. Brilho no máximo deixa toda cor da tela mais viva do que qualquer papel.',
    ['tela e papel'],
  ),
];

/* ── Os módulos ───────────────────────────────────────────────────────────── */

export const MODULOS_DA_DIAGRAMACAO: ModuloDeVereda[] = [
  {
    id: 'm1', titulo: 'A malha',
    resumo: 'Margens, colunas e a sangria do boletim.',
    licoes: [
      { id: 'm1-teoria', tipo: 'teoria', questoes: Q['m1-teoria'], perguntas: 4, titulo: 'Malha, margem e sangria', resumo: 'O esqueleto da página, o espaço de dentro e o de fora.', topicos: MALHA },
      { id: 'm1-lab', tipo: 'diagramacao', licao: 'malha', titulo: 'Montando a malha do boletim', resumo: 'Margens, duas colunas, medianiz e 3 mm de sangria.', verificacoes: ['margens', 'colunas', 'sangria'] },
    ],
  },
  {
    id: 'm2', titulo: 'Os estilos',
    resumo: 'Texto longo com o mesmo estilo em todas as páginas.',
    licoes: [
      { id: 'm2-teoria', tipo: 'teoria', questoes: Q['m2-teoria'], perguntas: 4, titulo: 'Estilos de parágrafo', resumo: 'Um nome para cada tipo de texto, e o "+" que denuncia a mão.', topicos: ESTILOS },
      { id: 'm2-lab', tipo: 'diagramacao', licao: 'estilos', titulo: 'Limpando a matéria do boletim', resumo: 'Sem formatação à mão, um estilo por papel.', verificacoes: ['sem-formatacao-direta', 'um-estilo-por-papel'] },
    ],
  },
  {
    id: 'm3', titulo: 'As imagens',
    resumo: 'Fotos na malha, a capa sangrando, e resolução de impressão.',
    licoes: [
      { id: 'm3-teoria', tipo: 'teoria', questoes: Q['m3-teoria'], perguntas: 4, titulo: 'Imagens e resolução de impressão', resumo: 'A foto nas guias, o texto que contorna, e o ppi no tamanho posto.', topicos: IMAGENS },
      { id: 'm3-lab', tipo: 'diagramacao', licao: 'imagens', titulo: 'Pondo as fotos no lugar', resumo: 'A capa até a sangria, as fotos nas colunas, e o texto que sobrou.', verificacoes: ['capa-sangra', 'fotos-na-malha', 'resolucao-de-impressao', 'texto-cabe'] },
    ],
  },
  {
    id: 'm4', titulo: 'As páginas',
    resumo: 'Número e cabeçalho pela página-mestre.',
    licoes: [
      { id: 'm4-teoria', tipo: 'teoria', questoes: Q['m4-teoria'], perguntas: 4, titulo: 'Página-mestre e elementos correntes', resumo: 'O que se repete mora num lugar só.', topicos: PAGINAS },
      { id: 'm4-lab', tipo: 'diagramacao', licao: 'paginas', titulo: 'Numerando o boletim', resumo: 'Número automático, cabeçalho corrente e a capa limpa.', verificacoes: ['numeracao-automatica', 'cabecalho-corrente', 'capa-sem-mestre'] },
    ],
  },
  {
    id: 'm5', titulo: 'O PDF',
    resumo: 'Sangria, marcas de corte e CMYK.',
    licoes: [
      { id: 'm5-teoria', tipo: 'teoria', questoes: Q['m5-teoria'], perguntas: 4, titulo: 'Tela, papel e o PDF da gráfica', resumo: 'RGB e CMYK, resolução, e as marcas de corte.', topicos: PDF },
      { id: 'm5-lab', tipo: 'diagramacao', licao: 'exportar', titulo: 'Exportando para a gráfica', resumo: 'O PDF que a gráfica aceita, e por que o de tela não serve.', verificacoes: ['pdf-com-sangria', 'pdf-com-marcas', 'pdf-em-cmyk', 'porque-rgb-nao-serve'] },
    ],
  },
  {
    id: 'm6', titulo: 'A gráfica',
    resumo: 'O que ela exige do arquivo, e o papel.',
    licoes: [
      { id: 'm6-teoria', tipo: 'teoria', questoes: Q['m6-teoria'], perguntas: 4, titulo: 'Orçamento e gramatura', resumo: 'Ler a tabela de serviços, e escolher o papel.', topicos: GRAFICA },
      { id: 'm6-lab', tipo: 'diagramacao', licao: 'grafica', titulo: 'Lendo a tabela da gráfica', resumo: 'As exigências, a gramatura, e tudo por escrito.', verificacoes: ['leu-as-exigencias', 'escolheu-o-papel', 'descreveu-o-arquivo'] },
    ],
  },
  {
    id: 'm7', titulo: 'A prova',
    resumo: 'Como as cores vão sair no papel.',
    licoes: [
      { id: 'm7-teoria', tipo: 'teoria', questoes: Q['m7-teoria'], perguntas: 4, titulo: 'Prova de impressão', resumo: 'Ver antes, e comparar depois.', topicos: PROVA },
      { id: 'm7-lab', tipo: 'diagramacao', licao: 'prova', titulo: 'Conferindo as cores antes de imprimir', resumo: 'A prova na tela, as cores que mudam, e o relato.', verificacoes: ['viu-a-prova', 'apontou-as-cores', 'relatou-a-diferenca'] },
    ],
  },
];
