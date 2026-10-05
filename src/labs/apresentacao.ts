/**
 * O modelo de uma apresentação: o slide, o layout, o modelo de design.
 *
 * Ele morava dentro de `apresentacaoDoClube.ts`, junto da apresentação de
 * partida e das sete tarefas do requisito 9 da AP044 — então o tipo de um
 * slide dependia das metas de um exercício. É o mesmo encaixe que `planilha.ts`
 * tinha com `metasDaAp043.ts`, e desceu pelo mesmo motivo, escrito lá: a
 * CC-ES011 é a vereda de Apresentações e precisa deste modelo, e descer
 * **antes** de a cópia existir é a decisão de `word.tsx`, `excel.tsx`,
 * `explorer.tsx`, `leitorDePdf.tsx` e `correio.tsx`.
 *
 * O que ficou em `apresentacaoDoClube.ts` é do **exercício**: de que
 * apresentação a AP044 parte e o que ela cobra.
 */

export type Modelo = 'branco' | 'madison' | 'facetas' | 'berlim';
export type Layout = 'titulo' | 'titulo-conteudo' | 'duas-partes' | 'so-titulo' | 'em-branco';
export type Midia = 'nenhuma' | 'vinculada' | 'incorporada';

export interface Imagem {
  id: string;
  legenda: string;
  /** Largura em por cento do slide. A altura sai da proporção, sempre. */
  largura: number;
  /**
   * O tamanho do arquivo, em pixels — e é ele que diz se a projeção serve.
   *
   * O requisito 4.3 da CC-ES011 pede *resolução adequada à projeção*, e isso
   * não se vê na tela do computador: a foto pequena esticada fica bonita na
   * miniatura e serrilhada no telão, e a foto grande demais faz um arquivo que
   * não abre no computador do clube. As duas são plausíveis, e por isso o
   * modelo guarda o tamanho de verdade em vez de um rótulo escrito nele.
   */
  pixelsLargura: number;
  pixelsAltura: number;
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
  /**
   * As notas do apresentador: o que se diz, e que **não** vai para o telão.
   *
   * É o requisito 2.4 e o 4.5, e é a distância entre o que a plateia lê e o
   * que ela ouve. `palavrasQueProjetam` nunca as conta, justamente porque elas
   * não projetam — contá-las faria o orçamento de vinte palavras do requisito
   * 6 medir a fala em vez do slide.
   */
  notas: string;
  /** As caixas desenhadas à mão, que é o que o layout existe para dispensar. */
  caixas: CaixaAMao[];
  /** A formatação aplicada à mão, que vence o mestre ao desenhar. */
  diretoNoTitulo?: AjusteDoSlide;
  diretoNoCorpo?: AjusteDoSlide;
  /** O gráfico que veio da planilha, quando veio. */
  grafico?: GraficoNoSlide;
}

export interface Apresentacao {
  modelo: Modelo;
  /** A aparência que vale para todos os slides de uma vez. */
  mestre: SlideMestre;
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

/**
 * O que cada modelo de design pinta, que é o que muda em todos os slides de
 * uma vez.
 *
 * Madison, Facetas e Berlim são os nomes dos modelos do PowerPoint, e o que
 * eles fazem é o que o slide mestre faz — então a tabela é do programa, e não
 * de um exercício. Ela mora aqui, e não em `powerpoint.tsx`, porque é dado:
 * arquivo que exporta componente e constante junto perde o recarregamento
 * rápido, e foi o próprio lint que apontou — a mesma divisão de
 * `capturaDoScanner.ts` com `digitalizador.tsx`.
 */
export const CORES_DO_MODELO: Record<Modelo, {
  fundo: string; titulo: string; texto: string; faixa: string;
}> = {
  branco: { fundo: '#FFFFFF', titulo: '#262626', texto: '#404040', faixa: 'transparent' },
  madison: { fundo: '#F4F1EA', titulo: '#7B3F00', texto: '#3D3128', faixa: '#C9A227' },
  facetas: { fundo: '#FFFFFF', titulo: '#1F6F63', texto: '#2E4A45', faixa: '#7FBFA8' },
  berlim: { fundo: '#1B1B1B', titulo: '#FFFFFF', texto: '#D6D6D6', faixa: '#E8562A' },
};

export type CoresDoModelo = (typeof CORES_DO_MODELO)[Modelo];

export const umSlide = (a: Apresentacao, id: string) => a.slides.find(s => s.id === id);

/** Um slide sem título e sem nada dentro — o que sobra de um Ctrl+M sem querer. */
export const vazio = (s: Slide) =>
  !s.titulo.trim() && s.topicos.length === 0 && s.imagens.length === 0
  && s.video === 'nenhuma' && s.audio === 'nenhuma';

/* ── O slide mestre, e a formatação que vence ele ─────────────────────────── */

/**
 * O slide mestre: a aparência que vale para **todos** os slides de uma vez.
 *
 * É o requisito 2.1 e o 4.1 da CC-ES011, e é o estilo da CC-ES002 visto de
 * outro ângulo — que é por que aquela vereda é exigida antes desta. No
 * PowerPoint o mestre é do arquivo: mexer no título daqui não mexe no de outra
 * apresentação, e por isso ele mora na `Apresentacao` e não numa constante
 * global, pela razão escrita em `documento.ts`.
 *
 * Fonte vazia quer dizer "a do programa", e não "nenhuma": é o que deixa a
 * AP044 desenhar como ela sempre desenhou, sem um nome de fonte inventado.
 */
export interface SlideMestre {
  fonteDoTitulo: string;
  tamanhoDoTitulo: number;
  corDoTitulo: string;
  fonteDoCorpo: string;
  tamanhoDoCorpo: number;
  corDoCorpo: string;
  corDoFundo: string;
  /** A faixa de destaque do modelo, ou `'transparent'` quando ele não tem uma. */
  corDaFaixa: string;
  /** O logo do clube no canto, que é o que ninguém quer repetir em vinte slides. */
  logo: boolean;
  /** O número do slide no pé — campo, como na CC-ES002, e não número digitado. */
  numeroNoPe: boolean;
}

/**
 * A formatação aplicada **à mão** num slide, que vence o mestre ao desenhar.
 *
 * É a precedência do Word, e é ela que faz a lição existir: mexer no mestre e
 * nada mudar na tela significa que a direta continua lá, ganhando. Não é
 * `CSSProperties` de propósito — a caixa de fonte do PowerPoint oferece fonte,
 * tamanho, cor, negrito e itálico, e abrir a porta para qualquer propriedade
 * daria ao laboratório poderes que o programa imitado não tem.
 */
export interface AjusteDoSlide {
  fonte?: string;
  tamanho?: number;
  cor?: string;
  negrito?: boolean;
  italico?: boolean;
}

/** O mestre com que um modelo de design começa: as cores dele, e nada de fonte. */
export const mestreDoModelo = (m: Modelo): SlideMestre => {
  const c = CORES_DO_MODELO[m];
  return {
    fonteDoTitulo: '', tamanhoDoTitulo: 40, corDoTitulo: c.titulo,
    fonteDoCorpo: '', tamanhoDoCorpo: 24, corDoCorpo: c.texto,
    corDoFundo: c.fundo, corDaFaixa: c.faixa, logo: false, numeroNoPe: false,
  };
};

/* ── A caixa desenhada à mão ──────────────────────────────────────────────── */

/**
 * Uma caixa de texto desenhada à mão, com a posição em que ela ficou.
 *
 * O requisito 4.2 pede aplicar layouts **em vez de** posicionar caixas
 * manualmente, e o defeito de não fazer isso não existe num slide: existe na
 * sequência. Por isso a caixa guarda `x` e `y` e o espaço reservado do layout
 * não guarda nenhum — vinte slides depois, o título de cada um está alguns
 * milímetros deslocado do anterior, e a apresentação pisca a cada troca. De
 * dentro, cada slide parece perfeito.
 */
export interface CaixaAMao {
  id: string;
  texto: string;
  /** Em por cento do slide: é a posição que ficou, e é ela que desalinha. */
  x: number;
  y: number;
  largura: number;
  tamanho: number;
  /** A caixa guarda o papel que ela faz na marra, para o layout saber onde pôr. */
  papel: 'titulo' | 'corpo';
}

/* ── A imagem, e o que a projeção precisa dela ────────────────────────────── */

/**
 * O que um projetor de hoje mostra.
 *
 * É daqui que sai se uma imagem serve: o que importa não é o tamanho do
 * arquivo em si, é quantos pixels dele caem em cada pixel da tela. Projetor
 * antigo é 1024×768 e o de hoje é 1920×1080 — medir pelo maior cobre os dois,
 * e a conta ao contrário deixaria a imagem serrilhada no equipamento melhor.
 */
export const PROJECAO = { largura: 1920, altura: 1080 } as const;

/**
 * A largura de um slide 16:9, em polegadas — 960 pontos, a 72 por polegada.
 *
 * Ela existe porque os dois números do requisito 4.3 falam línguas
 * diferentes: a projeção fala em **pixels** e a caixa Compactar Imagens do
 * PowerPoint fala em **pontos por polegada**. É esta medida que liga as duas,
 * e é dela que sai que um telão de 1920 resolve 144 ppi no slide — então 96
 * ppi serrilha e 220 ppi é mais do que ele mostra.
 */
export const POLEGADAS_DO_SLIDE = 960 / 72;

/**
 * Quantas vezes a mais que o necessário já é peso jogado fora.
 *
 * O dobro cobre o projetor de hoje e a tela de quem for ler o PDF depois num
 * aparelho de pontos pequenos. Acima disso o arquivo cresce e ninguém vê a
 * diferença — que é a metade do requisito 4.3 que não se vê na tela.
 */
export const LIMITE_DO_EXCESSO = 2;

/**
 * Quanto um pixel de foto pesa no arquivo.
 *
 * Três bytes por pixel é a imagem crua; o JPEG de qualidade alta chega perto de
 * um décimo disso. O número não precisa ser exato — ele precisa ser **honesto
 * na ordem de grandeza**, porque é dele que sai por que três fotos de celular
 * fazem uma apresentação que não passa por anexo de e-mail.
 */
export const BYTES_POR_PIXEL = 0.3;

export type ResolucaoDaImagem = 'baixa' | 'adequada' | 'excessiva';

/** Quantos pixels de largura a projeção pede de uma imagem deste tamanho. */
export const pixelsQueAProjecaoPede = (larguraEmPorCento: number) =>
  Math.round((PROJECAO.largura * larguraEmPorCento) / 100);

/**
 * Se a imagem serve à projeção — e é conta, e não um campo escrito nela.
 *
 * Campo seria a resposta impressa no modelo: o laboratório leria "baixa" e
 * trocaria a foto sem ter olhado o tamanho dela, que é o contrário de
 * *demonstrar resolução adequada*.
 */
export function resolucaoDaImagem(img: Imagem): ResolucaoDaImagem {
  const precisa = pixelsQueAProjecaoPede(img.largura);
  if (img.pixelsLargura < precisa) return 'baixa';
  if (img.pixelsLargura > precisa * LIMITE_DO_EXCESSO) return 'excessiva';
  return 'adequada';
}

/**
 * Quantas vezes cada pixel da foto é esticado para caber no espaço dela.
 *
 * Acima de 1 a foto é ampliada, e é esse número que a tela desenha como bloco:
 * serrilhado que se vê na projeção e não se vê na miniatura é o estrago que a
 * simulação precisa mostrar onde ele acontece.
 */
export const esticamentoDaImagem = (img: Imagem) =>
  pixelsQueAProjecaoPede(img.largura) / Math.max(1, img.pixelsLargura);

/** O peso do arquivo, em megabytes, que é o que as fotos fazem com ele. */
export function pesoEmMegabytes(a: Apresentacao): number {
  const pixels = a.slides
    .flatMap(s => s.imagens)
    .reduce((t, i) => t + i.pixelsLargura * i.pixelsAltura, 0);
  return (pixels * BYTES_POR_PIXEL) / (1024 * 1024);
}

/**
 * Compactar imagens, que é o comando do PowerPoint — e ele reduz de verdade.
 *
 * O `ppi` é o que a caixa "Compactar Imagens" oferece. Reduzir é destrutivo e
 * não volta, como no programa de verdade: é por isso que a ordem entre
 * compactar e trocar a foto custa, do mesmo jeito que comprimir antes de
 * reconhecer custa na CC-ES004.
 */
export function compactarImagem(img: Imagem, ppi: number): Imagem {
  const alvo = Math.round((POLEGADAS_DO_SLIDE * img.largura * ppi) / 100);
  if (alvo >= img.pixelsLargura) return img;
  const fator = alvo / img.pixelsLargura;
  return {
    ...img,
    pixelsLargura: alvo,
    pixelsAltura: Math.max(1, Math.round(img.pixelsAltura * fator)),
  };
}

/* ── O gráfico que veio da planilha ───────────────────────────────────────── */

/**
 * De que jeito o gráfico da planilha entrou no slide.
 *
 * São os três que o PowerPoint oferece ao colar, e a diferença aparece longe
 * de casa — que é a família do vídeo vinculado da AP044:
 *
 * - `imagem` **congela** os números de quando foi colado. O arquivo viaja
 *   inteiro e nunca mais muda, e a apresentação do ano que vem mostra os
 *   números do ano passado sem nada avisar;
 * - `vinculado` lê a planilha de verdade, e **precisa** que ela viaje junto:
 *   sem ela, o quadro fica vazio no computador do clube;
 * - `incorporado` leva uma cópia da planilha dentro do arquivo, e é a única
 *   que acompanha e viaja sozinha.
 *
 * O que nenhuma delas é: digitar os números numa tabela do PowerPoint. Isso
 * não vem da planilha, não acompanha nada, e está certo **hoje** — é a família
 * do "número guardado não responde por hoje".
 */
export type VindoDaPlanilha = 'imagem' | 'vinculado' | 'incorporado';

export interface GraficoNoSlide {
  id: string;
  como: VindoDaPlanilha;
  /** O nome da planilha de onde ele veio, que é o que o vínculo guarda. */
  planilha: string;
  /**
   * Os números de quando ele foi colado.
   *
   * É o retrato, e é o que `imagem` mostra para sempre. Quem acompanha a
   * planilha lê os de agora, e a divergência entre as duas leituras é a lição
   * inteira do requisito 4.4.
   */
  retrato: { rotulo: string; valor: number }[];
}

/* ── O que projeta, e o que não projeta ───────────────────────────────────── */

/**
 * As palavras que a plateia **lê** no telão.
 *
 * Título, tópicos e caixas desenhadas à mão. Não as notas, que são o que se
 * fala; não a legenda da imagem — ela é legenda, e contá-la puniria quem
 * legenda a foto, que é o certo.
 */
export function palavrasQueProjetam(s: Slide): string[] {
  const texto = [s.titulo, ...s.topicos, ...s.caixas.map(c => c.texto)].join(' ');
  return texto.split(/\s+/).filter(p => /[\p{L}\p{N}]/u.test(p));
}

/** Quantas palavras este slide põe no telão. */
export const palavrasDoSlide = (s: Slide) => palavrasQueProjetam(s).length;

/** O slide mais carregado da apresentação, que é o que estoura o orçamento. */
export const maisPalavrasNumSlide = (a: Apresentacao) =>
  a.slides.reduce((m, s) => Math.max(m, palavrasDoSlide(s)), 0);

/* ── O desalinho, que só existe na sequência ──────────────────────────────── */

/**
 * Quantos pontos percentuais separam a caixa mais alta da mais baixa, entre os
 * slides que desenharam o mesmo papel à mão.
 *
 * Zero quer dizer que não há caixa à mão fazendo aquele papel — o layout está
 * cuidando dele. É a conta que torna o requisito 4.2 mensurável sem medir
 * pixel de tela: o defeito é a **diferença** entre slides, e não a posição de
 * nenhum deles.
 */
export function desalinhoDasCaixas(a: Apresentacao, papel: CaixaAMao['papel']): number {
  const ys = a.slides.flatMap(s => s.caixas.filter(c => c.papel === papel).map(c => c.y));
  if (ys.length < 2) return 0;
  return Math.max(...ys) - Math.min(...ys);
}

/**
 * Pôr no layout o que estava na caixa à mão.
 *
 * É o que o comando Layout faz: o texto vai para o espaço reservado, que tem
 * posição fixa, e a caixa deixa de existir. Sem isto, aplicar o layout
 * deixaria o texto duas vezes na tela — uma no espaço reservado e outra na
 * caixa solta por cima.
 */
export function aplicarLayout(s: Slide, layout: Layout): Slide {
  const doTitulo = s.caixas.find(c => c.papel === 'titulo');
  const doCorpo = s.caixas.filter(c => c.papel === 'corpo');
  return {
    ...s,
    layout,
    titulo: s.titulo || (doTitulo?.texto ?? ''),
    topicos: s.topicos.length > 0 ? s.topicos : doCorpo.map(c => c.texto),
    caixas: [],
  };
}

/* ── Como um slide e uma imagem nascem ────────────────────────────────────── */

/**
 * Um slide novo, do jeito que o Ctrl+M o cria: vazio, no layout escolhido.
 *
 * Mora aqui e não em cada laboratório porque dois laboratórios que criem slide
 * de maneiras ligeiramente diferentes são dois PowerPoint, que é a razão de
 * `powerpoint.tsx` existir — e porque campo novo no slide precisa de **um**
 * lugar onde o padrão dele se decide.
 */
export const slideNovo = (id: string, layout: Layout): Slide => ({
  id, titulo: '', topicos: [], layout, imagens: [], imagensAlinhadas: false,
  video: 'nenhuma', audio: 'nenhuma', notas: '', caixas: [],
});

/** Uma imagem inserida: o arquivo, o tamanho dele, e a largura em que ela entra. */
export const imagemInserida = (
  id: string, arquivo: string, pixelsLargura: number, pixelsAltura: number, largura = 40,
): Imagem => ({ id, legenda: arquivo, largura, pixelsLargura, pixelsAltura });

/* ── O que o mestre manda desenhar, depois da formatação direta ───────────── */

/**
 * Quantos pixels de tela vale um ponto, no slide desenhado em tamanho cheio.
 *
 * Um slide 16:9 do PowerPoint tem 960 × 540 pontos, e o palco o desenha com
 * 620 pixels de largura. O tamanho mora no mestre **em pontos** porque é em
 * pontos que a caixa de fonte do programa fala; a tela converte na hora de
 * desenhar.
 */
export const PX_POR_PONTO = 620 / 960;

/** A aparência de um pedaço do slide: o mestre, e por cima dele o que é direto. */
export function aparenciaDoSlide(
  mestre: SlideMestre, papel: 'titulo' | 'corpo', direto?: AjusteDoSlide,
) {
  const doMestre = papel === 'titulo'
    ? { fonte: mestre.fonteDoTitulo, tamanho: mestre.tamanhoDoTitulo, cor: mestre.corDoTitulo }
    : { fonte: mestre.fonteDoCorpo, tamanho: mestre.tamanhoDoCorpo, cor: mestre.corDoCorpo };
  return {
    fonte: direto?.fonte ?? doMestre.fonte,
    tamanho: direto?.tamanho ?? doMestre.tamanho,
    cor: direto?.cor ?? doMestre.cor,
    negrito: direto?.negrito ?? papel === 'titulo',
    italico: direto?.italico ?? false,
  };
}

/** Se o slide carrega formatação aplicada à mão, que é o que vence o mestre. */
export const temFormatacaoDireta = (s: Slide) =>
  s.diretoNoTitulo !== undefined || s.diretoNoCorpo !== undefined;

/** Quantos slides ainda têm formatação direta por cima do mestre. */
export const slidesComFormatacaoDireta = (a: Apresentacao) =>
  a.slides.filter(temFormatacaoDireta).map(s => s.id);

/**
 * Tirar a formatação direta de um slide — o Limpar Formatação do PowerPoint.
 *
 * Ele não encosta no texto, e é essa a condição que viaja com a lição: "sem
 * alterar uma palavra" é o que separa consertar a formatação de redigitar o
 * slide, como na CC-ES002.
 */
export const limparFormatacaoDireta = (s: Slide): Slide => {
  const resto = { ...s };
  delete resto.diretoNoTitulo;
  delete resto.diretoNoCorpo;
  return resto;
};

/**
 * Todo o texto digitado nos slides, que é o que não pode mudar.
 *
 * Pedaço vazio não entra: um título em branco é a ausência de texto, e não um
 * texto. Sem isso, pôr a caixa à mão no espaço reservado do layout — que move
 * o texto e não muda uma palavra dele — mudaria esta cadeia, porque o título
 * vazio do slide em branco deixa de estar lá. A condição "sem alterar uma
 * palavra" acusaria justamente quem cumpriu o requisito 4.2.
 */
export const textoDaApresentacao = (a: Apresentacao) => a.slides
  .map(s => [s.titulo, ...s.topicos, ...s.caixas.map(c => c.texto)]
    .map(t => t.trim()).filter(t => t !== '').join('\n'))
  .join('\n--\n');
