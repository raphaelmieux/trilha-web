import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DA_DIAGRAMACAO as Q } from './questoesDaDiagramacao';

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
 * ── Os números ──────────────────────────────────────────────────────────
 * Os que a teoria cita — milímetros, ppi, larguras de coluna — saem do mesmo
 * motor que confere as lições, e `exemplosDaDiagramacao.test.ts` os confere.
 */

const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], exemplo: string, atencao: string, marcas: string[],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, exemplo, exemploComo: 'texto' as const, atencao, marcas,
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
      'Página que segue a malha parece arrumada mesmo sem ninguém saber dizer por quê. Página sem malha tem cada foto num lugar, e o olho cansa procurando onde começa a próxima coisa.',
    ],
    `A malha do boletim de inverno (A5, 148 × 210 mm)

  Margens:    15 em cima, 18 embaixo, 16 interna, 13 externa
  Colunas:    2
  Medianiz:   5 mm
  Cada coluna fica com 57 mm de largura`,
    'Malha não é prisão: uma foto pode ocupar duas colunas, desde que comece e termine nas guias.',
    ['malha', 'coluna', 'medianiz'],
  ),
  t(
    'margem-e-sangria',
    'Margem e sangria',
    'A margem é o espaço de dentro; a sangria é o espaço de fora.',
    [
      'A **margem** é a faixa entre a borda do papel e o texto. Ela dá respiro e protege o texto do corte. A **margem interna**, junto da dobra, costuma ser maior: num boletim grampeado, um pedaço dela some na dobra.',
      'A **sangria** é o contrário: uma faixa **fora** do papel, de uns 3 mm, onde passa tudo o que precisa chegar até a borda — a foto da capa, uma faixa de cor. A guilhotina nunca corta exatamente na linha, e o que para na borda deixa um fio branco do lado que o corte errou.',
      'Por isso a regra é: o que encosta na borda, passa da borda. Texto nunca vai para a sangria; foto e fundo de cor, sim.',
    ],
    `A foto da capa do boletim

  Parando na borda:   X 0, Y 0, 148 × 210 mm  → fio branco no corte
  Sangrando 3 mm:     X -3, Y -3, 154 × 216 mm → corte limpo`,
    'Margem interna e externa trocam de lado entre a página da esquerda e a da direita. A interna fica sempre junto da dobra.',
    ['margem', 'sangria'],
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
      'É a mesma ideia dos estilos da CC-ES002, no editor de texto: mudar o estilo muda todos os parágrafos dele de uma vez, nas quatro páginas. Mudar à mão, um por um, deixa o terceiro título diferente dos outros sem ninguém perceber.',
      'Na diagramação, corpo e entrelinha se dizem em **pontos**, e se escrevem juntos: "9,5/13" é letra de 9,5 pontos com 13 pontos de uma linha para a outra.',
    ],
    `Os estilos do boletim

  Título   Trebuchet MS, negrito, 16/19
  Corpo    Georgia, 9,5/13
  Legenda  Trebuchet MS, 8/10`,
    'Um título feito de Corpo aumentado à mão parece título na tela e não é título para o programa: ele não muda quando o estilo muda.',
    ['estilo de parágrafo', 'corpo e entrelinha'],
  ),
  t(
    'o-mais-do-estilo',
    'O "+" do estilo',
    'A formatação feita à mão por cima do estilo, e por que limpar.',
    [
      'Quando alguém muda a letra ou o tamanho de um parágrafo à mão, o programa mostra um **"+"** depois do nome do estilo: "Corpo+". É a **formatação direta**, e ela vence o estilo.',
      'Num boletim escrito por quatro pessoas e colado de quatro lugares, o "+" aparece em todo canto: um parágrafo em outra letra porque veio de um e-mail, um título que é corpo engordado. **Limpar a formatação** devolve o parágrafo ao estilo dele.',
      'Depois de limpar, confira se cada parágrafo está no **estilo certo**: o título que era corpo engordado precisa virar Título de verdade.',
    ],
    `Editar matéria

  Título   · Acampamento de inverno na Chapada
  Corpo+   · A unidade Ipê ganhou marca nova   ← corpo engordado à mão
  Corpo+   · A marca já aparece na camiseta…   ← letra de outro lugar`,
    'Limpar a formatação não troca o estilo. O título que estava em Corpo continua em Corpo até alguém mudar.',
    ['formatação direta'],
  ),
];

/* ── Módulo 3: as imagens ─────────────────────────────────────────────────── */

const IMAGENS: TopicoDeVereda[] = [
  t(
    'imagem-na-malha',
    'A imagem na malha',
    'A foto começa e termina nas guias das colunas.',
    [
      'Uma foto **respeita a malha** quando as bordas dela caem nas guias: ocupa uma coluna inteira, ou duas, mas não para no meio da medianiz nem dois milímetros antes da margem.',
      'O texto **contorna** a foto: ele pula o espaço que ela ocupa e continua embaixo. Por isso pôr uma foto empurra o texto para a frente — e o fim da matéria pode ficar sem lugar.',
      'Quando o texto não cabe, o programa avisa com um **"+" vermelho** no último quadro: é o **texto excedente**. Ele não some do arquivo, mas some da página, e ninguém percebe que faltou o fim.',
    ],
    `A fogueira, nas duas colunas da página 2

  X 13 mm, largura 119 mm: da guia da margem externa
  até a guia da margem interna — as duas colunas inteiras`,
    'Texto excedente se resolve criando um quadro novo para o texto correr, ou cortando texto. Diminuir a letra para caber muda o estilo do boletim inteiro.',
    ['imagem na malha', 'texto excedente'],
  ),
  t(
    'resolucao-de-impressao',
    'Resolução de impressão',
    'Os pontos por polegada que a foto tem no tamanho em que foi posta.',
    [
      'A **resolução de impressão** é quantos pixels a foto tem em cada polegada de papel, **no tamanho em que ela foi posta na página**. A gráfica pede uns 300 ppi; abaixo de 240, os pixels começam a aparecer no papel.',
      'É a conta da CC-DG003, aplicada à página: a mesma foto tem mais ppi pequena e menos ppi grande. A foto da unidade, de 640 pixels, tem **137 ppi** ocupando a página inteira e **285 ppi** numa coluna.',
      'O programa mostra o **ppi efetivo** de cada foto. Quando ele fica baixo, o remédio é diminuir a foto — ou trocar por uma com mais pixels. Aumentar o ppi no programa só inventa pixels.',
    ],
    `A foto da unidade, 640 × 480 pixels

  Na largura da página, 119 mm:  137 ppi  → serrilhada
  Numa coluna, 57 mm:            285 ppi  → nítida`,
    'Foto tirada de grupo de mensagens costuma vir comprimida e pequena. Peça o arquivo original a quem tirou.',
    ['resolução de impressão', 'ppi efetivo'],
  ),
];

/* ── Módulo 4: as páginas ─────────────────────────────────────────────────── */

const PAGINAS: TopicoDeVereda[] = [
  t(
    'pagina-mestre',
    'A página-mestre',
    'O que se repete em toda página mora num lugar só.',
    [
      'A **página-mestre** é um modelo que as páginas herdam: o que está nela aparece em todas as que a usam. É ali que mora o **número da página** e o **cabeçalho corrente** — o nome do boletim no alto de cada página.',
      'O número na mestre é um **campo**: ele mostra o número da página em que está, e muda sozinho quando uma página entra no meio. Número **digitado** em cada página é texto: acerta no dia em que foi digitado e erra no dia em que o boletim muda.',
      'A **capa** não leva a mestre: capa não tem número nem cabeçalho. No programa, troca-se a mestre da capa para "Nenhuma".',
    ],
    `As páginas do boletim

  Página 1 (capa)  Mestre: Nenhuma  → sem número
  Página 2         Mestre: A        → número 2 e cabeçalho
  Página 3         Mestre: A        → número 3 e cabeçalho
  Página 4         Mestre: A        → número 4 e cabeçalho`,
    'Ligar o número automático e esquecer os digitados deixa dois números em cada página, um em cima do outro.',
    ['página-mestre', 'número de página'],
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
    `No alto de cada página do miolo
  Boletim de Inverno

  No pé de cada página do miolo
  2   3   4`,
    'Cabeçalho escrito à mão em cada página é como número digitado: um dia ele fica diferente em uma delas.',
    ['elementos correntes', 'cabeçalho'],
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
      'Um arquivo em RGB, mandado para a gráfica, é convertido lá — e as cores mudam no caminho, sem ninguém ver antes. Convertendo em casa, a mudança aparece na tela, a tempo de ajustar.',
      'E a resolução: a foto que fica bonita no site com 72 ppi tem poucos pixels para o papel, que pede uns 300. Impressa grande, ela vira quadradinhos.',
    ],
    `Tela e papel

  Tela:   luz, RGB, 3 canais
  Papel:  tinta, CMYK, 4 tintas
  Site:   72 ppi bastam
  Papel:  uns 300 ppi no tamanho impresso`,
    'Converter para CMYK não estraga a foto: mostra antes o que a gráfica faria depois.',
    ['RGB', 'CMYK'],
  ),
  t(
    'marcas-de-corte',
    'Marcas de corte e o PDF da gráfica',
    'Os riscos fora do papel que dizem à guilhotina onde cortar.',
    [
      'As **marcas de corte** são riscos finos nos quatro cantos, **fora** da área do papel e da sangria. Elas mostram à gráfica exatamente onde fica a borda do papel depois do corte.',
      'O **PDF para a gráfica** junta tudo: as páginas com a sangria de 3 mm em volta, as marcas de corte fora dela, as cores em CMYK e as fontes incorporadas.',
      'O PDF é um **retrato**: ele congela o documento de quando foi exportado. Mexeu no boletim depois, o PDF ficou velho — exporte de novo, senão a gráfica imprime a versão de antes.',
    ],
    `O PDF do boletim de inverno

  Sangria:         3 mm
  Marcas de corte: sim
  Cor:             CMYK`,
    'Sangria no PDF sem sangria no documento sai como 3 mm de branco em volta. Reserve a sangria antes de diagramar.',
    ['marca de corte', 'PDF'],
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
      'As exigências mais comuns: PDF, cores em CMYK, 3 mm de sangria, marcas de corte, imagens a 300 ppi no tamanho impresso e fontes incorporadas ou convertidas em curvas.',
      'Escrever essas exigências por escrito é o que deixa o próximo boletim sair certo, mesmo que outra pessoa prepare o arquivo.',
    ],
    `Da tabela da Gráfica Cerrado

  PDF único, cores em CMYK
  3 mm de sangria e marcas de corte
  Imagens com 300 ppi no tamanho impresso
  Fontes incorporadas ou em curvas`,
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
      'Papel mais grosso custa mais e pesa mais no correio. Escolher a gramatura é escolher entre durar e caber no orçamento.',
    ],
    `Os papéis do boletim

  Capa:   couché 250 g/m²  → aguenta a mochila
  Miolo:  offset 90 g/m²   → dobra no grampo`,
    'Miolo em papel de capa não dobra direito no grampo, e o boletim não fecha.',
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
      'Na prova da tela, as cores que a tinta não alcança perdem o brilho na hora. No boletim, o **azul vivo** e o **laranja** da faixa mudam; o roxo e o verde ficam iguais.',
      'A prova impressa é a que vale: o papel, a luz e a tinta de verdade. A da tela avisa antes e economiza papel.',
    ],
    `A faixa de cores do boletim, na prova da tela

  #7B3F98 roxo      igual
  #1B4D3E verde     igual
  #00B3FF azul      perde o brilho
  #FF6A00 laranja   perde o brilho
  #1F2A24 escuro    igual`,
    'Cor que muda na prova não é defeito do programa: é a tela avisando o que a tinta não consegue.',
    ['prova de impressão'],
  ),
  t(
    'comparar-tela-e-papel',
    'Comparar a tela com o papel',
    'Imprimir, pôr ao lado da tela, e anotar o que mudou.',
    [
      'O requisito pede para **imprimir** a peça e **comparar** as cores do papel com as da tela, relatando as diferenças. A comparação se faz com a peça ao lado da tela, na mesma luz.',
      'Quase sempre o papel sai **mais escuro e menos vivo**: a tela tem luz própria e o papel só reflete a luz da sala. Os azuis e os laranjas vivos são os que mais mudam.',
      'Anote cor por cor, e diga o porquê. É esse relato que ensina a escolher, na próxima peça, cores que saem iguais nos dois lugares.',
    ],
    `Um relato de prova

  O azul do título e o laranja da agenda perderam o brilho:
  a tela faz cor com luz e a tinta não alcança cores tão vivas.
  O roxo e o verde ficaram iguais.`,
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
