/**
 * O que cada lição da CC-DG005 cobra, e de que estado do boletim ela parte.
 *
 * Mora fora do componente e fora da trava, pelo motivo escrito em
 * `metasDaCcDg001.ts`: quem lê é a tela **e** a trava.
 *
 * ── O boletim é um só ────────────────────────────────────────────────────
 * Cada lição parte de onde a anterior chegou, pelo motivo escrito em
 * `boletimDoClube.ts`.
 *
 * ── O que fica fora do aplicativo ────────────────────────────────────────
 * Imprimir a peça, levar a uma gráfica de verdade e apresentar ao
 * examinador. O que a plataforma faz é o que vem antes de cada um: a prova
 * de cores na tela, que diz quais cores vão mudar no papel; a tabela de
 * serviços de uma gráfica, para aprender a ler o que ela exige; e o PDF que
 * ela aceitaria.
 */

import {
  coresForaDaGama, encostaSemSangrar, estilosConsistentes, exportarPdf, fluxo, naMalha, numerosDigitados,
  pdfParaGrafica, ppiEfetivo, sangraPor, temFormatacaoDireta, PPI_DE_IMPRESSAO, SANGRIA_DA_GRAFICA,
  type Documento, type Papel, type Pdf, type QuadroDeImagem,
} from './diagramacao';
import { HISTORIA_ARRUMADA, IMAGENS_COMO_CHEGARAM, MALHA_FEITA, boletim, quadrosDaMalha } from './boletimDoClube';

/* ── A lição, e o que viaja com ela ───────────────────────────────────────── */

export type LicaoDaCcDg005 = 'malha' | 'estilos' | 'imagens' | 'paginas' | 'exportar' | 'grafica' | 'prova';

export type ProgramaDaLicao = 'diagramador' | 'plataforma';

export interface CadernoDaImpressao {
  porQueRgb: string;
  exigencias: string[];
  gramaturaCapa: number | null;
  gramaturaMiolo: number | null;
  descricao: string;
  coresQueMudam: string[];
  relato: string;
}

export interface ContextoDaDiagramacao {
  documento: Documento;
  pdfs: Pdf[];
  descobertas: string[];
  caderno: CadernoDaImpressao;
}

export const CADERNO_VAZIO: CadernoDaImpressao = {
  porQueRgb: '', exigencias: [], gramaturaCapa: null, gramaturaMiolo: null, descricao: '', coresQueMudam: [], relato: '',
};

export const VIU_A_PROVA = 'prova-de-cores';

/* ── A tabela da gráfica ─────────────────────────────────────────────────── */

/**
 * O que a tabela de serviços da gráfica pede do arquivo, misturado com o que
 * ela não pede. Os três errados são os que se mandam sem pensar: o arquivo
 * do editor de texto, as cores como estão na tela, e a imagem leve do site.
 */
export const EXIGENCIAS: { id: string; texto: string; pede: boolean }[] = [
  { id: 'pdf', texto: 'Arquivo em PDF', pede: true },
  { id: 'cmyk', texto: 'Cores em CMYK', pede: true },
  { id: 'sangria', texto: 'Sangria de 3 mm em volta', pede: true },
  { id: 'marcas', texto: 'Marcas de corte', pede: true },
  { id: 'resolucao', texto: 'Imagens com 300 ppi no tamanho impresso', pede: true },
  { id: 'fontes', texto: 'Fontes incorporadas ou convertidas em curvas', pede: true },
  { id: 'docx', texto: 'O arquivo do editor de texto, para eles ajustarem', pede: false },
  { id: 'rgb', texto: 'Cores em RGB, como aparecem na tela', pede: false },
  { id: 'png', texto: 'Imagens em PNG de 72 ppi, como as do site', pede: false },
];

export const GRAMATURAS = [75, 90, 120, 150, 250, 300];
export const CAPA_ACEITA = [250, 300];
export const MIOLO_ACEITO = [75, 90, 120];

/* ── Contas de apoio ─────────────────────────────────────────────────────── */

const palavrasDe = (s: string) => s.trim().split(/\s+/).filter(Boolean);
const sem = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const mesmoConjunto = (a: string[], b: string[]) => a.length === b.length && a.every(x => b.includes(x));

/** As fotos que o boletim tem de ter: a capa, a fogueira e a da unidade. Nenhuma pode sumir. */
export const FOTOS = ['capa', 'fogueira', 'unidade'];

const fotos = (d: Documento): QuadroDeImagem[] => d.imagens.filter(i => FOTOS.includes(i.imagem));
const todasAsFotos = (d: Documento) => FOTOS.every(f => d.imagens.some(i => i.imagem === f));

/** O PDF mais novo que ainda é retrato do documento de agora. */
const pdfAtual = (c: ContextoDaDiagramacao) =>
  [...c.pdfs].reverse().find(p => pdfParaGrafica(c.documento, p).atual) ?? null;

/* ── As metas ────────────────────────────────────────────────────────────── */

export interface MetaDaDiagramacao {
  id: string;
  titulo: string;
  detalhe: string;
  onde: string;
  passos: string[];
  feita: (c: ContextoDaDiagramacao) => boolean;
}

/* Módulo 1 — a malha */

export const MARGEM_MINIMA = 12;

const METAS_DA_MALHA: MetaDaDiagramacao[] = [
  {
    id: 'margens', titulo: 'Montar as margens',
    detalhe: `Pelo menos ${MARGEM_MINIMA} mm em cada lado, e a interna maior que a externa — é ela que some na dobra do grampo.`,
    onde: 'Layout → Margens e colunas',
    passos: ['Abra Layout, Margens e colunas.', `Ponha pelo menos ${MARGEM_MINIMA} mm em cima, embaixo e fora.`, 'Ponha na interna um pouco mais que na externa.'],
    feita: c => {
      const m = c.documento.malha.margens;
      return [m.topo, m.base, m.interna, m.externa].every(v => v >= MARGEM_MINIMA) && m.interna > m.externa;
    },
  },
  {
    id: 'colunas', titulo: 'Dividir a página em colunas',
    detalhe: 'Duas a quatro colunas, com um vão entre elas de 4 a 8 mm.',
    onde: 'Layout → Margens e colunas',
    passos: ['No mesmo diálogo, escolha o número de colunas.', 'Ponha a medianiz, o vão entre as colunas.'],
    feita: c => {
      const { colunas, medianiz } = c.documento.malha;
      return colunas >= 2 && colunas <= 4 && medianiz >= 4 && medianiz <= 8;
    },
  },
  {
    id: 'sangria', titulo: 'Reservar a sangria',
    detalhe: `${SANGRIA_DA_GRAFICA} mm em volta do papel, para o que vai até a borda passar dela.`,
    onde: 'Arquivo → Configurar documento',
    passos: ['Abra Arquivo, Configurar documento.', `Ponha ${SANGRIA_DA_GRAFICA} mm de sangria.`],
    feita: c => c.documento.sangria >= SANGRIA_DA_GRAFICA,
  },
];

/* Módulo 2 — os estilos */

const um = (d: Documento, papel: Papel) => new Set(d.historia.filter(p => p.papel === papel).map(p => p.estilo));

const METAS_DOS_ESTILOS: MetaDaDiagramacao[] = [
  {
    id: 'sem-formatacao-direta', titulo: 'Tirar a formatação feita à mão',
    detalhe: 'Nenhum parágrafo com letra ou corpo mudado por cima do estilo. O "+" ao lado do nome do estilo denuncia.',
    onde: 'Texto → Editar matéria → Limpar formatação',
    passos: ['Abra Texto, Editar matéria.', 'Procure os parágrafos com "+" depois do nome do estilo.', 'Clique em Limpar formatação em cada um.'],
    feita: c => !c.documento.historia.some(temFormatacaoDireta),
  },
  {
    id: 'um-estilo-por-papel', titulo: 'Um estilo para cada papel do texto',
    detalhe: 'Todo título no estilo Título, e todo texto corrido no estilo Corpo — em todas as páginas.',
    onde: 'Texto → Editar matéria → Estilo',
    passos: ['Na lista da matéria, confira o estilo de cada título.', 'Troque os que estão em outro estilo.'],
    feita: c => {
      const d = c.documento;
      const t = um(d, 'titulo');
      const corpo = um(d, 'corpo');
      return estilosConsistentes(d) && [...t][0] !== [...corpo][0];
    },
  },
];

/* Módulo 3 — as imagens */

const METAS_DAS_IMAGENS: MetaDaDiagramacao[] = [
  {
    id: 'capa-sangra', titulo: 'Fazer a foto da capa sangrar',
    detalhe: `A foto passa ${SANGRIA_DA_GRAFICA} mm da borda nos quatro lados. Parar na borda deixa um fio branco onde o corte errar.`,
    onde: 'Página 1 → foto da capa → X, Y, L, A',
    passos: [`Selecione a foto da capa.`, `Ponha X e Y em -${SANGRIA_DA_GRAFICA}.`, `Some ${2 * SANGRIA_DA_GRAFICA} mm à largura e à altura.`],
    feita: c => {
      const capa = c.documento.imagens.find(i => i.imagem === 'capa');
      if (!capa) return false;
      const s = sangraPor(c.documento, capa);
      return s.esquerda && s.direita && s.topo && s.base;
    },
  },
  {
    id: 'fotos-na-malha', titulo: 'Pôr as fotos na malha',
    detalhe: 'Cada borda lateral numa guia de coluna ou de margem. Nenhuma foto encostando na borda do papel sem sangrar.',
    onde: 'Selecionar → X e L',
    passos: ['Selecione cada foto.', 'Leve a borda esquerda para uma guia de coluna.', 'Ajuste a largura até a borda direita cair noutra guia.'],
    feita: c => todasAsFotos(c.documento) && fotos(c.documento).every(q => naMalha(c.documento, q) && !encostaSemSangrar(c.documento, q)),
  },
  {
    id: 'resolucao-de-impressao', titulo: `Toda foto com ${PPI_DE_IMPRESSAO} ppi ou mais`,
    detalhe: 'No tamanho em que foi posta. A foto do celular, grande demais, sai serrilhada no papel.',
    onde: 'Propriedades → ppi efetivo',
    passos: ['Selecione a foto da unidade e leia o ppi efetivo.', 'Diminua a largura até passar de 240.'],
    feita: c => todasAsFotos(c.documento) && fotos(c.documento).every(q => ppiEfetivo(c.documento, q) >= PPI_DE_IMPRESSAO),
  },
  {
    id: 'texto-cabe', titulo: 'Sem texto excedente',
    detalhe: 'As fotos empurram o texto. O que não cabe nos quadros some da página — o programa avisa com um "+" vermelho.',
    onde: 'Ferramenta Quadro de texto',
    passos: ['Veja na barra de status quantas linhas sobraram.', 'Crie um quadro de texto na coluna vazia da página 4: o texto corre para ele.'],
    feita: c => todasAsFotos(c.documento) && fluxo(c.documento).excesso === 0,
  },
];

/* Módulo 4 — as páginas */

const METAS_DAS_PAGINAS: MetaDaDiagramacao[] = [
  {
    id: 'numeracao-automatica', titulo: 'Numerar as páginas pela página-mestre',
    detalhe: 'O número que muda sozinho, e nenhum número digitado à mão no pé da página.',
    onde: 'Páginas → Página-mestre A',
    passos: ['Abra a página-mestre A.', 'Ligue o número de página automático.', 'Apague os números digitados no pé de cada página.'],
    feita: c => c.documento.mestre.numero && numerosDigitados(c.documento).length === 0,
  },
  {
    id: 'cabecalho-corrente', titulo: 'Pôr o cabeçalho corrente',
    detalhe: 'O nome do boletim no alto de cada página, vindo da mestre.',
    onde: 'Páginas → Página-mestre A',
    passos: ['Na página-mestre A, escreva o cabeçalho.'],
    feita: c => palavrasDe(c.documento.mestre.cabecalho).length >= 2,
  },
  {
    id: 'capa-sem-mestre', titulo: 'Tirar a mestre da capa',
    detalhe: 'A capa não leva número nem cabeçalho; as outras levam.',
    onde: 'Páginas → página 1 → Mestre: Nenhuma',
    passos: ['No painel de páginas, escolha a página 1.', 'Troque a mestre dela para Nenhuma.'],
    feita: c => c.documento.paginas[0]?.mestre === 'nenhuma' && c.documento.paginas.slice(1).every(p => p.mestre === 'A'),
  },
];

/* Módulo 5 — o PDF */

export const PALAVRAS_DO_PORQUE = 15;

const METAS_DO_PDF: MetaDaDiagramacao[] = [
  {
    id: 'pdf-com-sangria', titulo: 'Exportar o PDF com sangria',
    detalhe: `${SANGRIA_DA_GRAFICA} mm de sangria no PDF — exportado do boletim como ele está agora.`,
    onde: 'Arquivo → Exportar PDF',
    passos: ['Abra Arquivo, Exportar PDF.', `Ponha ${SANGRIA_DA_GRAFICA} mm de sangria.`, 'Exporte.'],
    feita: c => { const p = pdfAtual(c); return !!p && pdfParaGrafica(c.documento, p).sangria; },
  },
  {
    id: 'pdf-com-marcas', titulo: 'Com marcas de corte',
    detalhe: 'Os riscos nos cantos, fora do papel, que dizem à guilhotina onde cortar.',
    onde: 'Arquivo → Exportar PDF',
    passos: ['No mesmo diálogo, marque Marcas de corte.'],
    feita: c => { const p = pdfAtual(c); return !!p && pdfParaGrafica(c.documento, p).marcas && pdfParaGrafica(c.documento, p).sangria; },
  },
  {
    id: 'pdf-em-cmyk', titulo: 'Em CMYK',
    detalhe: 'As cores das quatro tintas da impressora, e não as três luzes da tela.',
    onde: 'Arquivo → Exportar PDF → Cor',
    passos: ['No mesmo diálogo, troque a cor para CMYK.'],
    feita: c => { const p = pdfAtual(c); return !!p && pdfParaGrafica(c.documento, p).cmyk && pdfParaGrafica(c.documento, p).sangria; },
  },
  {
    id: 'porque-rgb-nao-serve', titulo: 'Explicar por que RGB e baixa resolução não servem para imprimir',
    detalhe: `Pelo menos ${PALAVRAS_DO_PORQUE} palavras, falando das cores e da resolução.`,
    onde: 'Painel de tarefas → Abrir o caderno',
    passos: ['Pense em de onde vem a cor da tela e de onde vem a do papel.', 'Pense no que acontece com uma foto de site impressa grande.'],
    feita: c => {
      const t = sem(c.caderno.porQueRgb);
      return palavrasDe(t).length >= PALAVRAS_DO_PORQUE && /(rgb|tela|luz)/.test(t) && /(resolu|ppi|pixel)/.test(t);
    },
  },
];

/* Módulo 6 — a gráfica */

export const PALAVRAS_DA_DESCRICAO = 25;

const METAS_DA_GRAFICA: MetaDaDiagramacao[] = [
  {
    id: 'leu-as-exigencias', titulo: 'Marcar o que a gráfica exige do arquivo',
    detalhe: 'Só o que a tabela de serviços pede — e nada do que ela não pede.',
    onde: 'Caderno → Tabela de serviços',
    passos: ['Leia a tabela de serviços da gráfica.', 'Marque cada exigência que ela faz quanto ao arquivo.'],
    feita: c => mesmoConjunto(c.caderno.exigencias, EXIGENCIAS.filter(e => e.pede).map(e => e.id)),
  },
  {
    id: 'escolheu-o-papel', titulo: 'Escolher a gramatura da capa e do miolo',
    detalhe: 'A capa mais grossa, que aguenta a mochila; o miolo fino, que dobra e não pesa.',
    onde: 'Caderno → Papel',
    passos: ['Leia na tabela os papéis que a gráfica oferece.', 'Escolha um para a capa e outro para o miolo.'],
    feita: c => c.caderno.gramaturaCapa !== null && CAPA_ACEITA.includes(c.caderno.gramaturaCapa)
      && c.caderno.gramaturaMiolo !== null && MIOLO_ACEITO.includes(c.caderno.gramaturaMiolo),
  },
  {
    id: 'descreveu-o-arquivo', titulo: 'Descrever por escrito o que foi exigido',
    detalhe: `Pelo menos ${PALAVRAS_DA_DESCRICAO} palavras, como se fosse para quem vai preparar o arquivo do próximo boletim.`,
    onde: 'Caderno → Descrição',
    passos: ['Escreva o que a gráfica pede quanto ao arquivo.', 'Diga por que cada exigência existe.'],
    feita: c => {
      const t = sem(c.caderno.descricao);
      return palavrasDe(t).length >= PALAVRAS_DA_DESCRICAO && t.includes('sangria') && t.includes('cmyk');
    },
  },
];

/* Módulo 7 — a prova de cores */

export const PALAVRAS_DO_RELATO = 20;

const METAS_DA_PROVA: MetaDaDiagramacao[] = [
  {
    id: 'viu-a-prova', titulo: 'Ver a prova de cores na tela',
    detalhe: 'A simulação de como as cores saem no papel.',
    onde: 'Exibir → Prova de cores (CMYK)',
    passos: ['Abra Exibir.', 'Ligue Prova de cores (CMYK).', 'Compare com a prova desligada.'],
    feita: c => c.descobertas.includes(VIU_A_PROVA),
  },
  {
    id: 'apontou-as-cores', titulo: 'Apontar as cores que mudam no papel',
    detalhe: 'Só as que a prova mostra diferentes — as outras saem iguais.',
    onde: 'Caderno → Cores',
    passos: ['Ligue e desligue a prova olhando cada cor do boletim.', 'Marque no caderno as que mudaram.'],
    feita: c => mesmoConjunto(c.caderno.coresQueMudam.map(x => x.toLowerCase()), coresForaDaGama(c.documento).map(x => x.toLowerCase())),
  },
  {
    id: 'relatou-a-diferenca', titulo: 'Relatar a diferença entre a tela e o papel',
    detalhe: `Pelo menos ${PALAVRAS_DO_RELATO} palavras: o que mudou, e por quê.`,
    onde: 'Caderno → Relato',
    passos: ['Escreva quais cores perderam o brilho.', 'Diga por que a tela mostra cores que a tinta não alcança.'],
    feita: c => {
      const t = sem(c.caderno.relato);
      return palavrasDe(t).length >= PALAVRAS_DO_RELATO && t.includes('tela') && /(papel|impress|tinta)/.test(t);
    },
  },
];

/* ── As soluções de referência, que são também o ponto de partida ────────── */

export const POR_QUE_RGB = 'A tela faz a cor com luz em RGB e o papel com tinta em CMYK, então o verde vivo da tela sai apagado; e a foto do site tem poucos pixels, que no papel viram quadradinhos porque a resolução de impressão pede uns 300 ppi.';
export const DESCRICAO_DO_ARQUIVO = 'A gráfica pede o boletim em PDF com as cores em CMYK, sangria de 3 mm em volta e marcas de corte, as fotos com 300 ppi no tamanho impresso e as fontes incorporadas, porque sem isso a cor muda, o corte deixa fio branco e a letra pode trocar.';
export const RELATO_DA_PROVA = 'Na prova de cores o azul do título e o laranja da agenda perderam o brilho, porque a tela faz cor com luz e a tinta do papel não alcança cores tão vivas; o roxo e o verde ficaram iguais.';

/** As fotos no lugar: a capa sangrando, a fogueira nas duas colunas, a da unidade numa coluna. */
export const IMAGENS_NO_LUGAR: QuadroDeImagem[] = [
  { id: 'img-capa', pagina: 0, imagem: 'capa', x: -3, y: -3, largura: 154, altura: 216 },
  { id: 'img-fogueira', pagina: 1, imagem: 'fogueira', x: 13, y: 23, largura: 119, altura: 79.3 },
  { id: 'img-unidade', pagina: 2, imagem: 'unidade', x: 16, y: 23, largura: 57, altura: 42.75 },
];

const docDaMalha = () => boletim({ malha: MALHA_FEITA, sangria: 3 });
const docDosEstilos = () => ({ ...docDaMalha(), historia: HISTORIA_ARRUMADA });
const docDasImagens = () => ({ ...docDosEstilos(), imagens: IMAGENS_NO_LUGAR, quadros: quadrosDaMalha(false) });
const docDasPaginas = (): Documento => ({
  ...docDasImagens(),
  soltos: docDasImagens().soltos.filter(s => !/^\d+$/.test(s.texto)),
  mestre: { numero: true, cabecalho: 'Boletim de Inverno' },
  paginas: docDasImagens().paginas.map((p, i) => ({ ...p, mestre: i === 0 ? 'nenhuma' as const : 'A' as const })),
});

const ctx = (documento: Documento, caderno: CadernoDaImpressao = CADERNO_VAZIO, pdfs: Pdf[] = [], descobertas: string[] = []): ContextoDaDiagramacao =>
  ({ documento, caderno, pdfs, descobertas });

const cadernoDoPdf = (): CadernoDaImpressao => ({ ...CADERNO_VAZIO, porQueRgb: POR_QUE_RGB });

export interface LicaoDaDiagramacao {
  contexto: () => ContextoDaDiagramacao;
  programa: ProgramaDaLicao;
  pagina: number;
  caderno: boolean;
  metas: MetaDaDiagramacao[];
}

export const LICOES_DA_CC_DG005: Record<LicaoDaCcDg005, LicaoDaDiagramacao> = {
  'malha': { contexto: () => ctx(boletim()), programa: 'diagramador', pagina: 1, caderno: false, metas: METAS_DA_MALHA },
  'estilos': { contexto: () => ctx(docDaMalha()), programa: 'diagramador', pagina: 1, caderno: false, metas: METAS_DOS_ESTILOS },
  'imagens': { contexto: () => ctx({ ...docDosEstilos(), imagens: IMAGENS_COMO_CHEGARAM }), programa: 'diagramador', pagina: 0, caderno: false, metas: METAS_DAS_IMAGENS },
  'paginas': { contexto: () => ctx(docDasImagens()), programa: 'diagramador', pagina: 1, caderno: false, metas: METAS_DAS_PAGINAS },
  'exportar': { contexto: () => ctx(docDasPaginas()), programa: 'diagramador', pagina: 0, caderno: true, metas: METAS_DO_PDF },
  'grafica': { contexto: () => ctx(docDasPaginas(), cadernoDoPdf()), programa: 'plataforma', pagina: 0, caderno: true, metas: METAS_DA_GRAFICA },
  'prova': { contexto: () => ctx(docDasPaginas(), cadernoDoPdf()), programa: 'diagramador', pagina: 1, caderno: true, metas: METAS_DA_PROVA },
};

export const metasDa = (licao: LicaoDaCcDg005) => LICOES_DA_CC_DG005[licao].metas;

/** O estado depois de cada lição — a solução de referência que a trava usa. */
export function estadoDepois(licao: LicaoDaCcDg005): ContextoDaDiagramacao {
  switch (licao) {
    case 'malha': return ctx(docDaMalha());
    case 'estilos': return ctx(docDosEstilos());
    case 'imagens': return ctx(docDasImagens());
    case 'paginas': return ctx(docDasPaginas());
    case 'exportar': {
      const d = docDasPaginas();
      return ctx(d, cadernoDoPdf(), [exportarPdf(d, 'boletim-de-inverno.pdf', { sangria: 3, marcasDeCorte: true, cor: 'cmyk' })]);
    }
    case 'grafica': return ctx(docDasPaginas(), {
      ...cadernoDoPdf(), exigencias: EXIGENCIAS.filter(e => e.pede).map(e => e.id), gramaturaCapa: 250, gramaturaMiolo: 90,
      descricao: DESCRICAO_DO_ARQUIVO,
    });
    case 'prova': return ctx(docDasPaginas(), {
      ...cadernoDoPdf(), coresQueMudam: coresForaDaGama(docDasPaginas()), relato: RELATO_DA_PROVA,
    }, [], [VIU_A_PROVA]);
    default: {
      const nunca: never = licao;
      return nunca;
    }
  }
}
