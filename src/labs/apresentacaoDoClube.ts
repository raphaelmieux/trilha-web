/**
 * O que o laboratório de apresentações da AP044 cobra, e de onde ele parte.
 *
 * Mesma razão de `metasDaAp043.ts` e `metasDaAp044.ts`: o modelo e o critério
 * moram fora do componente para que um teste os alcance sem montar tela.
 *
 * ── O requisito 9, e o eixo da trilha ────────────────────────────────────
 * Sete itens, e os dois primeiros são o mesmo "descrever uma vez" que a AP044
 * repete em cinco programas. **Modelo** é isso para a aparência de todos os
 * slides; **layout** é isso para a posição das caixas de um slide.
 *
 * Quem não usa layout desenha caixa de texto à mão em cada slide. Vinte slides
 * depois, o título de cada um está alguns milímetros deslocado do anterior, e a
 * apresentação pisca a cada troca: o olho de quem assiste acompanha o título
 * pulando em vez de ler. De dentro, cada slide parece perfeito — o defeito só
 * existe na sequência, e é por isso que o laboratório mede o **layout
 * declarado**, e não a posição que ficou na tela.
 *
 * ── E o vídeo é onde a apresentação quebra na hora H ─────────────────────
 * Inserir tem dois caminhos que se parecem na hora de clicar: incorporar põe o
 * arquivo dentro da apresentação; vincular guarda só o endereço. Os dois se
 * chamam "inserir", e a diferença só aparece longe de casa — no computador do
 * clube, com o quadro preto e ninguém entendendo por quê.
 *
 * Aqui ela aparece antes: a prévia do pen drive mostra o quadro preto enquanto
 * o vídeo estiver vinculado. Simulação que só é verdadeira no caminho previsto
 * vira muro; esta mostra o estrago onde ele acontece.
 */

export type Modelo = 'branco' | 'madison' | 'facetas' | 'berlim';
export type Layout = 'titulo' | 'titulo-conteudo' | 'duas-partes' | 'so-titulo' | 'em-branco';
export type Midia = 'nenhuma' | 'vinculada' | 'incorporada';

export interface Imagem {
  id: string;
  legenda: string;
  /** Largura em por cento do slide. A altura sai da proporção, sempre. */
  largura: number;
}

export interface Slide {
  id: string;
  titulo: string;
  /** Os tópicos do corpo. Slide de título não tem nenhum. */
  topicos: string[];
  layout: Layout;
  imagens: Imagem[];
  /** As imagens foram alinhadas pelo comando, e não arrastadas pelo olho. */
  imagensAlinhadas: boolean;
  video: Midia;
  audio: Midia;
}

export interface Apresentacao {
  modelo: Modelo;
  slides: Slide[];
  /** Os slides exportados em PDF, ou `null` enquanto ninguém exportou. */
  pdf: string[] | null;
}

export const NOMES_DOS_MODELOS: Record<Modelo, string> = {
  branco: 'Apresentação em Branco',
  madison: 'Madison',
  facetas: 'Facetas',
  berlim: 'Berlim',
};

export const NOMES_DOS_LAYOUTS: Record<Layout, string> = {
  'titulo': 'Slide de Título',
  'titulo-conteudo': 'Título e Conteúdo',
  'duas-partes': 'Duas Partes de Conteúdo',
  'so-titulo': 'Somente Título',
  'em-branco': 'Em Branco',
};

const slide = (id: string, titulo: string, topicos: string[], layout: Layout): Slide =>
  ({ id, titulo, topicos, layout, imagens: [], imagensAlinhadas: false, video: 'nenhuma', audio: 'nenhuma' });

/**
 * A apresentação como ela chega: escrita, e sem uma decisão tomada.
 *
 * Está em branco (sem modelo), o slide dos tópicos veio no layout de título —
 * que é o erro de quem cria slide novo e não repara no que escolheu —, há um
 * slide vazio sobrando no meio e a ordem está trocada: o encerramento vem antes
 * do que ele encerra.
 *
 * Na tela isso passa por apresentação começada, que é o de sempre nesta trilha.
 */
export const APRESENTACAO_INICIAL: Apresentacao = {
  modelo: 'branco',
  slides: [
    slide('s1', 'Acampamento de Inverno', ['Clube de Desbravadores Pioneiros'], 'titulo'),
    /* Layout errado: os quatro tópicos estão numa caixa de subtítulo, que é o
       que o layout de título oferece. */
    slide('s2', 'O que levar', [
      'Saco de dormir e isolante',
      'Lanterna com pilha de reserva',
      'Agasalho, touca e luva',
      'Bíblia e caderno',
    ], 'titulo'),
    slide('s3', 'A programação', [
      'Sexta: chegada e montagem',
      'Sábado: culto, classes e fogueira',
      'Domingo: desmontagem antes do almoço',
    ], 'titulo-conteudo'),
    slide('s4', 'Até lá!', ['Dúvidas com a liderança da sua unidade'], 'so-titulo'),
    slide('s5', 'O acampamento do ano passado', [], 'titulo-conteudo'),
    /* O slide vazio que sobrou de um Ctrl+M sem querer. Ele existe, ocupa lugar
       na tira lateral e aparece na apresentação — e é o que a tarefa manda
       excluir. */
    slide('s6', '', [], 'em-branco'),
  ],
  pdf: null,
};

/** O slide que a tarefa das fotos usa, e que precisa de duas imagens. */
export const SLIDE_DAS_FOTOS = 's5';
/** O slide de tópicos que está no layout errado. */
export const SLIDE_DO_LAYOUT = 's2';

export const umSlide = (a: Apresentacao, id: string) => a.slides.find(s => s.id === id);

/** Um slide sem título e sem nada dentro — o que sobra de um Ctrl+M sem querer. */
export const vazio = (s: Slide) =>
  !s.titulo.trim() && s.topicos.length === 0 && s.imagens.length === 0
  && s.video === 'nenhuma' && s.audio === 'nenhuma';

export interface MetaDaApresentacao {
  id: string;
  titulo: string;
  detalhe: string;
  onde: string;
  passos: string[];
  feita: (a: Apresentacao) => boolean;
}

export const METAS_DA_APRESENTACAO: MetaDaApresentacao[] = [
  {
    id: 'modelo',
    titulo: 'Escolher um modelo',
    detalhe: 'A apresentação está em branco: fundo branco, letra padrão, nada combinado. Escolha um modelo e repare que os seis slides mudam juntos.',
    onde: 'Design › Temas',
    passos: [
      'Vá na guia Design.',
      'Escolha um dos modelos da galeria.',
      'Olhe a tira lateral: os seis mudaram de uma vez, e não um por um.',
    ],
    feita: a => a.modelo !== 'branco',
  },
  {
    id: 'layout',
    titulo: 'Consertar o layout do slide "O que levar"',
    detalhe: 'Os quatro itens dele estão numa caixa de subtítulo, porque o slide ficou no layout de título. Troque para "Título e Conteúdo".',
    onde: 'Página Inicial › Slides › Layout',
    passos: [
      'Clique no slide "O que levar", na tira lateral.',
      'Em Página Inicial, abra Layout.',
      'Escolha "Título e Conteúdo": é o layout que tem caixa de tópicos.',
    ],
    feita: a => umSlide(a, SLIDE_DO_LAYOUT)?.layout === 'titulo-conteudo',
  },
  {
    id: 'slides',
    titulo: 'Criar, duplicar, reorganizar e excluir slides',
    detalhe: 'Quatro gestos: exclua o slide vazio que sobrou, mova o "Até lá!" para o fim, duplique o das fotos para caber a segunda foto, e crie um slide novo para o versículo.',
    onde: 'Página Inicial › Slides, e a tira lateral',
    passos: [
      'Clique no slide vazio, na tira lateral, e use Excluir Slide.',
      'Arraste o "Até lá!" para o fim da tira — ou use as setas ao lado dele.',
      'Clique no slide das fotos e use Duplicar Slide.',
      'Use Novo Slide para o versículo, e escreva o título dele.',
    ],
    /*
      Quatro condições, e cada uma é um dos quatro gestos que o item nomeia.

      Contar só os slides deixaria passar quem excluiu dois e criou dois — o
      número fecha e nada foi aprendido. Cada gesto tem a marca dele: o vazio
      sumiu, o encerramento está no fim, existe cópia de um slide que já
      existia, e existe um slide que ninguém tinha.
    */
    feita: a => {
      const semVazio = !a.slides.some(vazio);
      const encerraNoFim = a.slides[a.slides.length - 1]?.titulo === 'Até lá!';
      const duplicado = a.slides.filter(s => s.titulo === 'O acampamento do ano passado').length >= 2;
      const inicial = new Set(APRESENTACAO_INICIAL.slides.map(s => s.titulo));
      const novo = a.slides.some(s => s.titulo.trim() && !inicial.has(s.titulo));
      return semVazio && encerraNoFim && duplicado && novo;
    },
  },
  {
    id: 'imagens',
    titulo: 'Pôr as fotos e alinhá-las',
    detalhe: 'Duas fotos no slide do acampamento passado — e alinhadas pelo comando, não pelo olho. Quatro fotos arrastadas ficam quase alinhadas, e "quase" é o que se vê projetado.',
    onde: 'Inserir › Imagens, e Formato da Imagem › Organizar › Alinhar',
    passos: [
      'Clique no slide "O acampamento do ano passado".',
      'Em Inserir, clique em Imagens e escolha duas do computador.',
      'Selecione as duas e use Organizar › Alinhar › Alinhar em Cima.',
    ],
    feita: a => {
      const s = umSlide(a, SLIDE_DAS_FOTOS);
      return !!s && s.imagens.length >= 2 && s.imagensAlinhadas;
    },
  },
  {
    id: 'video',
    titulo: 'Inserir o vídeo — e fazê-lo viajar junto',
    detalhe: 'Um vídeo no slide da programação. Repare na diferença entre incorporar e vincular: a prévia do pen drive mostra qual das duas você escolheu.',
    onde: 'Inserir › Mídia › Vídeo',
    passos: [
      'Clique no slide "A programação".',
      'Em Inserir, abra Vídeo e escolha o arquivo do computador.',
      'Escolha Inserir (incorporar), e não Vincular ao Arquivo.',
      'Confira na prévia do pen drive: incorporado, ele toca em qualquer máquina.',
    ],
    feita: a => a.slides.some(s => s.video === 'incorporada'),
  },
  {
    id: 'audio',
    titulo: 'Inserir o áudio',
    detalhe: 'O hino do clube no slide de abertura. Vale a mesma regra do vídeo: o que não está dentro do arquivo pode não estar lá na hora.',
    onde: 'Inserir › Mídia › Áudio',
    passos: [
      'Clique no slide de abertura.',
      'Em Inserir, abra Áudio e escolha o arquivo do computador.',
      'Escolha Inserir, para que ele viaje dentro da apresentação.',
    ],
    feita: a => a.slides.some(s => s.audio === 'incorporada'),
  },
  {
    id: 'pdf',
    titulo: 'Salvar em PDF',
    detalhe: 'O PDF é o que se entrega a quem pediu: abre em qualquer aparelho, com as letras certas. Em troca é papel — e a prévia mostra o que ele deixa para trás.',
    onde: 'Arquivo › Exportar › Criar Documento PDF/XPS',
    passos: [
      'Termine os slides antes: o PDF congela o que existir na hora.',
      'Vá em Arquivo › Exportar.',
      'Clique em Criar Documento PDF/XPS.',
    ],
    /*
      Exige que o PDF tenha todos os slides que existem hoje.

      Exportar cedo e continuar mexendo é o que se faz sem pensar, e o PDF
      entregue fica sem os slides que vieram depois — sem nada na tela dizendo
      isso. É a mesma armadilha do sumário do Word, que guarda o que leu.
    */
    feita: a => !!a.pdf && a.pdf.length === a.slides.length && a.slides.length > 0,
  },
];
