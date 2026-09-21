/**
 * Os documentos do clube, que as sete lições da CC-ES004 compartilham.
 *
 * É o arranjo do `cadernoDoClube()` da CC-ES003, do `discoDoClube()` da
 * CC-ES001 e do terminal da CC003, pelo motivo escrito nos três: sete pastas
 * diferentes ensinariam que cada exercício acontece num computador de
 * mentira. Quem abre o módulo 7 reencontra a ata que exportou no módulo 1.
 *
 * ── E cada lição parte de um estado da pasta ─────────────────────────────
 * A pasta é uma só, mas o módulo 2 recebe os três PDFs que o módulo 1
 * produziu, e o módulo 7 recebe o dossiê já quase montado. Começar cada lição
 * mandando refazer a anterior ensinaria que o trabalho anterior não conta. É
 * o campo `documento` da CC-ES002 e o `caderno` da CC-ES003 outra vez.
 */

import {
  type DocumentoPdf, type Pagina, type Captura, type CampoDeFormulario,
  CAPTURA_BOA, reconhecerTexto,
} from './documentoPdf';

/* ── As páginas ───────────────────────────────────────────────────────────── */

/** Uma página que saiu de um programa: o texto é o próprio conteúdo. */
export const paginaDigital = (id: string, linhas: string[], origem: string): Pagina =>
  ({ id, linhas, texto: linhas.join('\n'), origem });

/**
 * Uma página que é foto de papel: o que existe são pixels.
 *
 * Ela **não** tem `texto`, e é por isso que o requisito 5 pede prova em vez
 * de olhada. A captura padrão é a boa; quem chega torto diz que chega torto.
 */
export const paginaDePapel = (
  id: string, linhas: string[], captura: Captura = CAPTURA_BOA,
): Pagina => ({ id, linhas, captura, origem: 'papel' });

/*
  Como a foto cai do celular do clube: torta, com a mesa em volta e sem
  contraste. É o estado que o requisito 5 manda corrigir, e é por isso que ela
  é assim — uma foto que chegasse reta faria do requisito um par de cliques
  sem consequência.
*/
export const COMO_A_FOTO_CAI: Captura = {
  inclinacao: 9, margem: 28, contraste: 38, nitidez: 100,
};

/* ── O que o clube tem escrito ────────────────────────────────────────────── */

export const ATA = [
  'Ata da reunião ordinária do Clube de Desbravadores',
  'Aos quatorze dias do mês de março de 2026, reuniu-se a diretoria.',
  'O acampamento de inverno foi aprovado por unanimidade.',
  'Ficou definido o valor da diária em quarenta e cinco reais.',
  'Nada mais havendo a tratar, encerrou-se a reunião.',
];

export const ORCAMENTO = [
  'Orçamento do acampamento de inverno — 2026',
  'Alimentação: R$ 2.480,00',
  'Transporte: R$ 1.900,00',
  'Estrutura: R$ 1.180,00',
  'Total: R$ 5.560,00',
];

export const APRESENTACAO = [
  'Acampamento de Inverno 2026',
  'Quando: de 17 a 19 de julho',
  'Onde: Chácara Recanto, Sobradinho',
  'Quanto: três diárias de R$ 45,00',
];

export const CIRCULAR = [
  'Circular 03/2026 — Às famílias',
  'O acampamento de inverno acontecerá de 17 a 19 de julho.',
  'A autorização em anexo deve voltar assinada até o dia 30 de junho.',
  'Dúvidas com a secretaria do clube.',
];

export const FICHA_MEDICA = [
  'Ficha médica — Clube de Desbravadores',
  'Nome: ______________________  Unidade: ____________',
  'Alergias: ___________________________________________',
  'Medicação de uso contínuo: __________________________',
  'Responsável: ________________  Telefone: ____________',
];

export const RECIBO = [
  'Recibo 118 — Chácara Recanto',
  'Recebemos do Clube de Desbravadores a quantia de R$ 1.180,00',
  'referente à locação da estrutura para o acampamento de inverno.',
  'Sobradinho, 2 de julho de 2026.',
];

export const LISTA_DE_PRESENCA = [
  'Lista de presença — Acampamento de Inverno 2026',
  'Unidade Falcão: 12 desbravadores',
  'Unidade Águia: 9 desbravadores',
  'Unidade Tucano: 11 desbravadores',
];

/* ── Os arquivos que ainda não são PDF ────────────────────────────────────── */

/**
 * O que está na pasta antes de alguém exportar coisa nenhuma.
 *
 * São os três programas que o requisito 4.1 nomeia — texto, planilha e
 * apresentação —, e eles importam separados porque a tarefa precisa saber que
 * **os três** aconteceram: contar três PDFs não serve, já que três exportações
 * do mesmo documento também dariam três.
 */
export interface ArquivoDeOrigem {
  nome: string;
  programa: 'texto' | 'planilha' | 'apresentacao';
  linhas: string[];
}

export const ARQUIVOS_DE_ORIGEM: ArquivoDeOrigem[] = [
  { nome: 'ata-2026-03-14-v01.docx', programa: 'texto', linhas: ATA },
  { nome: 'orcamento-2026-07-01-v02.xlsx', programa: 'planilha', linhas: ORCAMENTO },
  { nome: 'acampamento-2026-07-10-v01.pptx', programa: 'apresentacao', linhas: APRESENTACAO },
];

/* ── A pasta ──────────────────────────────────────────────────────────────── */

/**
 * O que a lição tem em mãos.
 *
 * `origens` são os arquivos que ainda não viraram PDF; `pdfs` é o que já
 * virou. Quem exporta tira de um e põe no outro, que é o que o programa faz.
 */
export interface PastaDoClube {
  origens: ArquivoDeOrigem[];
  pdfs: DocumentoPdf[];
  /**
   * O que o desbravador demonstrou e que não deixa marca em arquivo nenhum.
   *
   * É a exceção que a CC-ES001 já documentou — "verificação que só existe
   * como gesto é a exceção, e se justifica uma a uma" —, e aqui ela se
   * justifica duas vezes, as duas no módulo 6:
   *
   * `senha-nao-protege` — copiar o texto de um PDF com "não permitir copiar"
   * ligado. O documento sai igualzinho da operação; o que mudou foi o que a
   * pessoa sabe. Conferir o estado do arquivo não alcançaria isso, e é
   * justamente a descoberta que o requisito 7 pede que ela explique.
   *
   * `assinatura-quebra` — mexer no documento depois de assinar e ver o selo
   * virar "não confere". Quem vê isso conserta em seguida, e o estado final é
   * o mesmo de quem nunca mexeu: a diferença do requisito 6 só existe no
   * instante em que ela acontece.
   */
  descobertas: string[];
}

export const comDescoberta = (p: PastaDoClube, o: string): PastaDoClube =>
  (p.descobertas.includes(o) ? p : { ...p, descobertas: [...p.descobertas, o] });

export const pdfDe = (p: PastaDoClube, nome: string): DocumentoPdf | undefined =>
  p.pdfs.find(d => d.nome === nome);

export const comPdf = (p: PastaDoClube, doc: DocumentoPdf): PastaDoClube => ({
  ...p,
  pdfs: p.pdfs.some(d => d.nome === doc.nome)
    ? p.pdfs.map(d => (d.nome === doc.nome ? doc : d))
    : [...p.pdfs, doc],
});

export const semPdf = (p: PastaDoClube, nome: string): PastaDoClube =>
  ({ ...p, pdfs: p.pdfs.filter(d => d.nome !== nome) });

/* ── Os documentos, prontos ───────────────────────────────────────────────── */

const pdf = (nome: string, paginas: Pagina[], extras: Partial<DocumentoPdf> = {}): DocumentoPdf =>
  ({ nome, paginas, campos: [], anotacoes: [], ...extras });

/** O PDF que sai de um dos três programas. Ele nasce pesquisável. */
export const exportarDeOrigem = (a: ArquivoDeOrigem): DocumentoPdf => pdf(
  a.nome.replace(/\.(docx|xlsx|pptx)$/, '.pdf'),
  [paginaDigital(`${a.programa}-1`, a.linhas, a.programa)],
  { geradoDe: a.programa },
);

/** A autorização em branco, com os campos que o requisito 4.5 manda preencher. */
export const CAMPOS_DA_AUTORIZACAO: CampoDeFormulario[] = [
  { id: 'nome', rotulo: 'Nome do desbravador', valor: '', obrigatorio: true },
  { id: 'unidade', rotulo: 'Unidade', valor: '', obrigatorio: true },
  { id: 'responsavel', rotulo: 'Responsável', valor: '', obrigatorio: true },
  { id: 'telefone', rotulo: 'Telefone', valor: '', obrigatorio: true },
  { id: 'observacoes', rotulo: 'Observações', valor: '', obrigatorio: false },
];

export const autorizacaoEmBranco = (): DocumentoPdf => pdf(
  'autorizacao-2026-06-15-v01.pdf',
  [paginaDigital('aut-1', [
    'Autorização de participação — Acampamento de Inverno 2026',
    'Autorizo a participação do desbravador abaixo identificado.',
    'A autorização deve voltar assinada até o dia 30 de junho.',
  ], 'texto')],
  { campos: CAMPOS_DA_AUTORIZACAO },
);

/**
 * A circular que chegou da liderança, com uma pergunta na margem.
 *
 * Ela chega **com** comentário de outra pessoa, porque o requisito 4.6 fala de
 * "PDF recebido" — e um documento que chegasse limpo faria a lição ser sobre
 * comentar por comentar, em vez de sobre responder a quem perguntou.
 */
export const circularRecebida = (): DocumentoPdf => pdf(
  'circular-2026-06-02-v01.pdf',
  [paginaDigital('circ-1', CIRCULAR, 'texto')],
  {
    anotacoes: [{
      id: 'pergunta-da-lideranca',
      paginaId: 'circ-1',
      tipo: 'comentario',
      texto: 'A data de devolução bate com a do calendário da igreja? Confira antes de enviar.',
      por: 'Tia Rute',
    }],
  },
);

/**
 * As fichas médicas, digitalizadas e **sem** texto dentro.
 *
 * São cinco páginas pesadas: é este o documento que o módulo 3 manda reduzir,
 * e é nele que a ordem entre comprimir e reconhecer custa.
 */
export const fichasDigitalizadas = (captura: Captura = CAPTURA_BOA): DocumentoPdf => pdf(
  'fichas-2026-06-20-v01.pdf',
  Array.from({ length: 5 }, (_, i) =>
    paginaDePapel(`ficha-${i + 1}`, FICHA_MEDICA, captura)),
);

/** O recibo da chácara, fotografado do jeito que se fotografa. */
export const reciboFotografado = (captura: Captura = COMO_A_FOTO_CAI): DocumentoPdf => pdf(
  'recibo-2026-07-02-v01.pdf',
  [paginaDePapel('recibo-1', RECIBO, captura)],
);

/* ── A pasta de cada lição ────────────────────────────────────────────────── */

/** O módulo 1 abre com os três arquivos e nenhum PDF: é ele que os produz. */
export const pastaAntesDeExportar = (): PastaDoClube => ({
  descobertas: [],
  origens: ARQUIVOS_DE_ORIGEM,
  pdfs: [],
});

/** Do módulo 2 em diante, os três PDFs já existem. */
export const pastaComOsTresPdfs = (): PastaDoClube => ({
  descobertas: [],
  origens: ARQUIVOS_DE_ORIGEM,
  pdfs: ARQUIVOS_DE_ORIGEM.map(exportarDeOrigem),
});

export const pastaDasFichas = (): PastaDoClube => ({
  descobertas: [],
  origens: [],
  pdfs: [fichasDigitalizadas()],
});

export const pastaDoRecibo = (): PastaDoClube => ({
  descobertas: [],
  origens: [],
  pdfs: [],
});

export const pastaDosFormularios = (): PastaDoClube => ({
  descobertas: [],
  origens: [],
  pdfs: [autorizacaoEmBranco(), circularRecebida()],
});

export const pastaParaAssinar = (): PastaDoClube => ({
  descobertas: [],
  origens: [],
  /* A autorização já preenchida: assinar em branco e completar depois é
     outra lição, e esta é sobre o que a assinatura garante. */
  pdfs: [{
    ...autorizacaoEmBranco(),
    campos: CAMPOS_DA_AUTORIZACAO.map(c => ({
      ...c,
      valor: { nome: 'Ana Beatriz Rocha', unidade: 'Águia', responsavel: 'Marta Rocha', telefone: '(61) 99999-0000' }[c.id] ?? '',
    })),
  }],
});

/**
 * O dossiê quase montado do módulo 7.
 *
 * São **quatro**, e não cinco. O requisito 8 pede no mínimo cinco, e reunir é
 * metade do que ele manda fazer — começar com os cinco na pasta faria a
 * primeira tarefa nascer verde, que foi exatamente o que a trava pegou quando
 * ela começou com cinco. O quinto é o recibo que a pessoa digitalizou no
 * módulo 4: é o mesmo computador e a mesma atividade do clube, e trazer para
 * o dossiê o que se produziu antes é o que montar um dossiê é.
 *
 * E os quatro também chegam com **dois problemas plantados**: um deles é foto
 * sem texto dentro, e os nomes não seguem padrão nenhum. Nada na tela grita,
 * que é o de sempre.
 */
export const pastaDoDossie = (): PastaDoClube => ({
  descobertas: [],
  origens: [],
  pdfs: [
    reconhecerTexto(pdf('Ata reunião.pdf', [paginaDePapel('d1', ATA)])),
    reconhecerTexto(pdf('orcamento final.pdf', [paginaDePapel('d2', ORCAMENTO)])),
    /* O nome da câmera, e **não** o mesmo da digitalização do módulo 4: são
       duas fotos do mesmo celular em dias diferentes, e nomes iguais fariam a
       segunda substituir a primeira em silêncio, deixando o dossiê com quatro
       documentos onde a pessoa acabou de pôr cinco. Foi o que aconteceu, e
       quem viu foi a trava que clica. */
    pdf('IMG_20260719_101204.pdf', [paginaDePapel('d3', LISTA_DE_PRESENCA)]),
    reconhecerTexto(pdf('circular 03.pdf', [paginaDePapel('d4', CIRCULAR)])),
  ],
});

/* ── As metas ─────────────────────────────────────────────────────────────── */

/**
 * O que uma lição cobra.
 *
 * É a mesma forma da `MetaDaPlanilha` da CC-ES003 e da `MetaDoDocumento` da
 * CC-ES002: título, o porquê, onde o caminho começa no programa, o passo a
 * passo para quem travar, e a conta.
 */
export interface MetaDoPdf {
  id: string;
  titulo: string;
  detalhe: string;
  /** Onde, na janela do programa, o caminho até esta tarefa começa. */
  onde: string;
  passos: string[];
  feita: (p: PastaDoClube) => boolean;
}
