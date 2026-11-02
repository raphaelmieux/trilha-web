import { CAPTURA_BOA, reconhecerTexto, type CampoDeFormulario, type DocumentoPdf } from '../labs/documentoPdf';
import {
  exportarDeOrigem, paginaDePapel, paginaDigital, type ArquivoDeOrigem, type PastaDoClube,
} from '../labs/dossieDoClube';

/*
 * Os documentos da gincana da primavera: a pasta que as telas da CC-ES004
 * percorrem.
 *
 * ── Por que outra pasta ──────────────────────────────────────────────────
 * O laboratório abre a pasta do Acampamento de Inverno (`dossieDoClube.ts`),
 * e quase tudo nela é resposta de alguma lição: a ata, o orçamento e a
 * apresentação que o módulo 1 exporta, as fichas médicas que o módulo 3
 * reduz, o recibo da Chácara Recanto que o módulo 4 digitaliza e procura, a
 * pergunta da Tia Rute na margem da circular, os quatro nomes sem padrão do
 * dossiê. Os quadros de texto da teoria citavam isso tudo — "Chácara",
 * "Filcia", "ata-2026-03-14-v01.pdf" —, que é pôr o gabarito na teoria. É a
 * decisão da excursão de outubro da CC-ES003 e do notebook da unidade Tucano
 * da CC-ES001.
 *
 * Aqui é outra atividade (a gincana de setembro), outros arquivos, outro papel
 * fotografado (a nota da papelaria) e outras pessoas. `exemplosDePdf.test.ts`
 * confere as legendas contra esta pasta, pelo motor do laboratório, e reprova
 * se as duas pastas passarem a dividir um nome de arquivo ou uma linha.
 */

export const ATIVIDADE = 'Gincana da Primavera 2026 — Clube de Desbravadores';

export const REGULAMENTO = [
  'Regulamento da Gincana da Primavera',
  'A gincana acontece no sábado, 19 de setembro, no pátio da igreja.',
  'Cada unidade monta uma equipe de seis desbravadores.',
  'A inscrição custa doze reais por pessoa.',
  'Casos não previstos são decididos pela diretoria.',
];

export const PONTUACAO = [
  'Pontuação da Gincana — 2026',
  'Prova da corda: 30 pontos',
  'Prova dos nós: 20 pontos',
  'Prova bíblica: 50 pontos',
  'Total possível: 100 pontos',
];

export const ABERTURA = [
  'Gincana da Primavera',
  'Quando: sábado, 19 de setembro',
  'Onde: pátio da igreja',
  'Equipes: seis por unidade',
];

export const ORIGENS_DA_GINCANA: ArquivoDeOrigem[] = [
  { nome: 'regulamento-gincana.docx', programa: 'texto', linhas: REGULAMENTO },
  { nome: 'pontuacao-gincana.xlsx', programa: 'planilha', linhas: PONTUACAO },
  { nome: 'abertura-gincana.pptx', programa: 'apresentacao', linhas: ABERTURA },
];

/** O termo de uso de imagem, assinado à mão e digitalizado: cinco folhas em imagem. */
export const TERMO_DE_IMAGEM = [
  'Termo de autorização de uso de imagem',
  'Autorizo o uso de fotos do desbravador abaixo nas redes do clube.',
  'Nome: ______________________  Unidade: ____________',
  'Responsável: ________________  Assinatura: _________',
];

/** A nota da papelaria, o papel que as telas do digitalizador fotografam. */
export const NOTA_DA_PAPELARIA = [
  'Papelaria Estrela — Nota 2046',
  'Cartolinas, canetas e fita para a gincana: R$ 86,40',
  'Pago em dinheiro pelo Clube de Desbravadores.',
  'Taguatinga, 12 de setembro de 2026.',
];
export const NOME_DA_FOTO_DA_NOTA = 'IMG_20260912_174802.pdf';

export const COMUNICADO = [
  'Comunicado 07/2026 — Às unidades',
  'A gincana acontece no sábado, 19 de setembro.',
  'As inscrições das equipes vão até o dia 12 de setembro.',
  'Cada desbravador traz garrafa de água e boné.',
];

export const QUEM_COMENTOU = 'Tio Leandro';
export const PERGUNTA_NA_MARGEM = 'O prazo das inscrições não ficou curto demais? Confira com a secretaria.';

export const CAMPOS_DA_INSCRICAO: CampoDeFormulario[] = [
  { id: 'nome', rotulo: 'Nome do desbravador', valor: '', obrigatorio: true },
  { id: 'unidade', rotulo: 'Unidade', valor: '', obrigatorio: true },
  { id: 'camiseta', rotulo: 'Tamanho da camiseta', valor: '', obrigatorio: true },
  { id: 'responsavel', rotulo: 'Responsável', valor: '', obrigatorio: true },
  { id: 'observacoes', rotulo: 'Observações', valor: '', obrigatorio: false },
];

/** Quem preenche, assina e comenta nas telas — e não a Ana Beatriz e a Marta do laboratório. */
export const QUEM_PREENCHE = { nome: 'Rafael Moura', unidade: 'Falcão', camiseta: 'M', responsavel: 'Sílvia Moura' };
export const PESSOAS = { assina: 'Sílvia Moura', comenta: 'Rafael Moura' };

const pdf = (nome: string, paginas: DocumentoPdf['paginas'], extras: Partial<DocumentoPdf> = {}): DocumentoPdf =>
  ({ nome, paginas, campos: [], anotacoes: [], ...extras });

export const termosDigitalizados = (): DocumentoPdf => pdf(
  'termos-de-imagem.pdf',
  Array.from({ length: 5 }, (_, i) => paginaDePapel(`termo-${i + 1}`, TERMO_DE_IMAGEM, CAPTURA_BOA)),
);

export const inscricaoEmBranco = (): DocumentoPdf => pdf(
  'inscricao-gincana.pdf',
  [paginaDigital('insc-1', [
    'Ficha de inscrição — Gincana da Primavera',
    'Preencha um formulário por desbravador.',
    'As inscrições vão até o dia 12 de setembro.',
  ], 'texto')],
  { campos: CAMPOS_DA_INSCRICAO },
);

export const inscricaoPreenchida = (): DocumentoPdf => ({
  ...inscricaoEmBranco(),
  campos: CAMPOS_DA_INSCRICAO.map(c => ({ ...c, valor: (QUEM_PREENCHE as Record<string, string>)[c.id] ?? '' })),
});

export const comunicadoRecebido = (): DocumentoPdf => pdf(
  'comunicado-07.pdf',
  [paginaDigital('com-1', COMUNICADO, 'texto')],
  {
    anotacoes: [{
      id: 'pergunta', paginaId: 'com-1', tipo: 'comentario',
      texto: PERGUNTA_NA_MARGEM, por: QUEM_COMENTOU,
    }],
  },
);

/* ── Os estados da pasta que as cenas abrem ───────────────────────────────── */

const vazia = (): PastaDoClube => ({ descobertas: [], origens: [], pdfs: [] });

export const GINCANA = {
  /** Só os três arquivos dos programas: é daqui que o PDF se gera. */
  origens: (): PastaDoClube => ({ ...vazia(), origens: ORIGENS_DA_GINCANA }),
  /** Os três PDFs já gerados, ao lado dos originais. */
  tresPdfs: (): PastaDoClube => ({
    ...vazia(), origens: ORIGENS_DA_GINCANA, pdfs: ORIGENS_DA_GINCANA.map(exportarDeOrigem),
  }),
  /** O regulamento gerado do editor e os termos fotografados: um com texto, outro sem. */
  termos: (): PastaDoClube => ({
    ...vazia(), pdfs: [exportarDeOrigem(ORIGENS_DA_GINCANA[0]), termosDigitalizados()],
  }),
  /** Nada na pasta: a nota vai entrar pelo digitalizador. */
  scanner: vazia,
  formularios: (): PastaDoClube => ({ ...vazia(), pdfs: [inscricaoEmBranco(), comunicadoRecebido()] }),
  assinar: (): PastaDoClube => ({ ...vazia(), pdfs: [inscricaoPreenchida()] }),
  /** O dossiê da gincana como a pasta ficou: cada arquivo com o nome que o caminho lhe deu. */
  dossie: (): PastaDoClube => ({
    ...vazia(),
    pdfs: [
      exportarDeOrigem({ ...ORIGENS_DA_GINCANA[0], nome: 'Regulamento NOVO.docx' }),
      exportarDeOrigem({ ...ORIGENS_DA_GINCANA[1], nome: 'pontos (2).xlsx' }),
      reconhecerTexto(pdf(NOME_DA_FOTO_DA_NOTA, [paginaDePapel('nota-1', NOTA_DA_PAPELARIA)])),
      pdf('scan termos.pdf', termosDigitalizados().paginas),
    ],
  }),
} as const;

export type EstadoDaGincana = keyof typeof GINCANA;
