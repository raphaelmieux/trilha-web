import { jsPDF } from 'jspdf';
import type { Certification, CertificadoImprimivel } from '../types';
import { CERT_WIDTH } from '../components/CertificateCanvas';
import { codigoDaArte } from './certificados';
import { renderBadgeIconPng, TIER_LABELS } from './badgeIcons';
import { VERMELHO_DA_MARCA } from './marca';
import {
  vestirAMarca, linhaComMarca, linhaCentralizadaComMarca, larguraComMarca,
} from './marcaEmPdf';
import { dataPorExtenso } from './explicacaoDaInsignia';
import { emOrdemDeConquista, type InsigniaConquistada } from './conquista';

/**
 * Native PDF export.
 *
 * Printing through the browser dialog could not produce a correct file. The
 * certificate is A4 landscape while the report is A4 portrait, and mixed
 * orientations in one document require named pages (`@page cert-sheet { size: A4
 * landscape }`) — which is valid CSS Paged Media that no browser implements. A
 * test export came back with all six pages in portrait and the 297mm-wide
 * certificate squeezed onto a 210mm sheet. The browser also imposes its own
 * margins, headers and footers, which the page cannot override.
 *
 * Generating the PDF directly removes every one of those variables: exact page
 * size and orientation per page, full-bleed artwork, no browser furniture, and
 * an identical file on any machine.
 *
 * Helvetica is one of the 14 standard PDF fonts, so the body type used here is
 * the real thing rather than a substitute. A marca é a exceção, e vai na fonte
 * dela: ver `marcaEmPdf.ts`.
 */

const A4_LANDSCAPE = { width: 297, height: 210 };
const A4_PORTRAIT = { width: 210, height: 297 };
const MM_PER_PT = 25.4 / 72;

/** Certificate artwork units (2340 x 1655 px) → millimetres on the sheet. */
const PX_TO_MM = A4_LANDSCAPE.width / CERT_WIDTH;
const pxToMm = (px: number) => px * PX_TO_MM;
/** jsPDF sets type size in points regardless of the document unit. */
const pxToPt = (px: number) => pxToMm(px) / MM_PER_PT;

async function loadImageAsDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Não foi possível carregar a arte do certificado (${response.status}).`);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Falha ao ler a arte do certificado.'));
    reader.readAsDataURL(blob);
  });
}

function formatIssuedDate(cert: CertificadoImprimivel): string {
  return new Date(cert.issued_at).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

/**
 * Draws one full-bleed certificate onto the current page.
 * Mirrors CertificateCanvas exactly: the same measured coordinates, the same
 * shrink-to-fit rule for long names.
 */
async function drawCertificate(doc: jsPDF, cert: CertificadoImprimivel, studentName: string): Promise<void> {
  const specialtyCode = codigoDaArte(cert.curriculum_code);
  const artwork = await loadImageAsDataUrl(
    `${import.meta.env.BASE_URL}assets/certificates/${specialtyCode}.png`
  );

  // Edge to edge — no margin, so the artwork bleeds off all four sides.
  doc.addImage(artwork, 'PNG', 0, 0, A4_LANDSCAPE.width, A4_LANDSCAPE.height, undefined, 'FAST');

  // Student name, centred on the artwork's clear band (baseline y=598px).
  doc.setTextColor(10, 10, 10);
  doc.setFont('helvetica', 'normal');
  let nameSize = pxToPt(150);
  doc.setFontSize(nameSize);
  const maxNameWidth = pxToMm(1800);
  if (doc.getTextWidth(studentName) > maxNameWidth) {
    nameSize = nameSize * (maxNameWidth / doc.getTextWidth(studentName));
    doc.setFontSize(nameSize);
  }
  doc.text(studentName, A4_LANDSCAPE.width / 2, pxToMm(598), { align: 'center', baseline: 'alphabetic' });

  // Footer: token code left, issue date right, sharing one baseline (y=1520px).
  doc.setTextColor(26, 26, 26);
  doc.setFontSize(pxToPt(32));
  const footerY = pxToMm(1520);
  doc.text(cert.code, pxToMm(120), footerY, { baseline: 'alphabetic' });
  doc.text(formatIssuedDate(cert), A4_LANDSCAPE.width - pxToMm(120), footerY, {
    align: 'right', baseline: 'alphabetic',
  });
}

/** A single certificate: one A4 landscape page, artwork only. */
export async function exportCertificatePdf(cert: CertificadoImprimivel, studentName: string): Promise<void> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
  await vestirAMarca(doc);
  await drawCertificate(doc, cert, studentName);
  doc.save(`Token.Web ${cert.curriculum_code} - ${studentName}.pdf`);
}

/**
 * The WebLab's research sheet.
 *
 * Requirement AP034-6.3 is "fazer o download de um arquivo", and the old lab
 * satisfied it by pushing a filename into an array — no file existed.
 *
 * The sheet also asks the student to *show* the instructor the first page of
 * three sites (6.1) and the three passages found in three versions (6.2). Those
 * are in-person checks; carrying the evidence here is what lets a leader confirm
 * them by reading, which is how this club chose to run it.
 */
export async function exportStudySheetPdf(input: {
  studentName: string;
  subject: string;
  query: string;
  searchUrl: string;
  /** AP034-6.1: the three sites and what their first page showed. */
  visits: { url: string; note: string }[];
  /** AP034-6.2: three passages, each in a different translation. */
  bibleSite: string;
  passages: { reference: string; version: string; text: string }[];
  addresses: { url: string; verdict: string }[];
  downloads: { name: string; verdict: string }[];
}): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  await vestirAMarca(doc);
  const width = A4_PORTRAIT.width;
  const left = 18;
  const textWidth = width - left * 2;
  let y = 22;

  const line = (text: string, opts: { size?: number; style?: 'normal' | 'bold'; gap?: number; colour?: [number, number, number] } = {}) => {
    const { size = 10.5, style = 'normal', gap = 2.4, colour = [26, 26, 26] } = opts;
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.setTextColor(...colour);
    for (const l of doc.splitTextToSize(text, textWidth) as string[]) {
      if (y > A4_PORTRAIT.height - 20) { doc.addPage('a4', 'portrait'); y = 22; }
      doc.text(l, left, y);
      y += 5;
    }
    y += gap;
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Ficha de Pesquisa na Internet', width / 2, y, { align: 'center' });
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(70, 70, 70);
  linhaCentralizadaComMarca(doc, 'Trilha.Web() — WebLab · AP034, requisitos 6.1 a 6.3', width / 2, y, [70, 70, 70]);
  y += 5;
  doc.setDrawColor(193, 53, 22);
  doc.setLineWidth(0.6);
  doc.line(left, y, width - left, y);
  y += 8;

  line(`Desbravador(a): ${input.studentName}`, { style: 'bold', gap: 0.5 });
  line(`Tema pesquisado: ${input.subject}`, { gap: 0.5 });
  line(`Emitido em: ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`, { gap: 5 });

  line('Consulta construída', { size: 12, style: 'bold', colour: [193, 53, 22], gap: 1 });
  line(input.query || '—', { style: 'bold' });
  line(input.searchUrl, { size: 8.5, colour: [90, 90, 90] });

  line('Sites visitados (requisito 6.1)', { size: 12, style: 'bold', colour: [193, 53, 22], gap: 1 });
  for (const v of input.visits) {
    line(`• ${v.url}`, { gap: 0 });
    line(`   Primeira página: ${v.note}`, { size: 9, colour: [90, 90, 90], gap: 1.4 });
  }

  line('Textos bíblicos encontrados (requisito 6.2)', { size: 12, style: 'bold', colour: [193, 53, 22], gap: 1 });
  line(`Site utilizado: ${input.bibleSite}`, { size: 9, colour: [90, 90, 90], gap: 2 });
  for (const passage of input.passages) {
    line(`• ${passage.reference} — versão ${passage.version}`, { gap: 0 });
    line(`   "${passage.text}"`, { size: 9, colour: [90, 90, 90], gap: 1.4 });
  }

  line('Endereços analisados', { size: 12, style: 'bold', colour: [193, 53, 22], gap: 1 });
  for (const a of input.addresses) {
    line(`• ${a.url}`, { gap: 0 });
    line(`   ${a.verdict}`, { size: 9, colour: [90, 90, 90], gap: 1.4 });
  }

  line('Arquivos analisados', { size: 12, style: 'bold', colour: [193, 53, 22], gap: 1 });
  for (const d of input.downloads) {
    line(`• ${d.name}`, { gap: 0 });
    line(`   ${d.verdict}`, { size: 9, colour: [90, 90, 90], gap: 1.4 });
  }

  doc.save(`Ficha de Pesquisa - ${input.studentName}.pdf`);
}

/**
 * The personal internet commitment, as a sheet that can be printed and signed.
 *
 * A commitment that exists only as a green tick on a screen is not a commitment.
 * This is the artefact the requirement is really about: something the student
 * and a guardian can put on the wall next to the computer.
 */
export async function exportPactPdf(input: {
  studentName: string;
  club: string;
  clauses: { title: string; text: string }[];
}): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  await vestirAMarca(doc);
  const width = A4_PORTRAIT.width;
  const left = 20;
  const textWidth = width - left * 2;
  let y = 24;

  const write = (text: string, opts: { size?: number; style?: 'normal' | 'bold'; gap?: number; colour?: [number, number, number] } = {}) => {
    const { size = 10.5, style = 'normal', gap = 2, colour = [26, 26, 26] } = opts;
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.setTextColor(...colour);
    for (const l of doc.splitTextToSize(text, textWidth) as string[]) {
      if (y > A4_PORTRAIT.height - 24) { doc.addPage('a4', 'portrait'); y = 24; }
      doc.text(l, left, y);
      y += 5;
    }
    y += gap;
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text('Meu Compromisso Digital', width / 2, y, { align: 'center' });
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(70, 70, 70);
  linhaCentralizadaComMarca(doc, 'Trilha.Web() — AP034, requisitos 5.1 a 5.9', width / 2, y, [70, 70, 70]);
  y += 5;
  doc.setDrawColor(193, 53, 22);
  doc.setLineWidth(0.6);
  doc.line(left, y, width - left, y);
  y += 9;

  write(`Eu, ${input.studentName}${input.club ? `, do Clube ${input.club}` : ''}, assumo os compromissos abaixo sobre o meu uso da internet.`, { gap: 5 });

  input.clauses.forEach((clause, i) => {
    write(`${i + 1}. ${clause.title}`, { style: 'bold', size: 10, colour: [193, 53, 22], gap: 0.5 });
    write(clause.text, { gap: 3.5 });
  });

  y += 6;
  if (y > A4_PORTRAIT.height - 60) { doc.addPage('a4', 'portrait'); y = 30; }
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.3);
  const half = (textWidth - 12) / 2;
  doc.line(left, y + 14, left + half, y + 14);
  doc.line(left + half + 12, y + 14, width - left, y + 14);
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text(input.studentName, left, y + 19);
  doc.text('Responsável', left + half + 12, y + 19);
  doc.text(
    `Assinado em ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`,
    left, y + 27,
  );

  doc.save(`Meu Compromisso Digital - ${input.studentName}.pdf`);
}

/**
 * The MailLab's attachment, as a file that really exists.
 *
 * AP034-7.3 is "fazer o download de um anexo no e-mail e abri-lo". The lab used
 * to satisfy it with a button that set a flag — nothing was downloaded and there
 * was nothing to open. This generates the schedule the message says it carries,
 * so the student downloads a real PDF and opens it in a real reader, which is
 * what the requirement describes.
 */
export async function exportAttachmentPdf(studentName: string): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  await vestirAMarca(doc);
  const width = A4_PORTRAIT.width;
  const left = 20;
  let y = 26;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(0, 0, 0);
  doc.text('Escala das Unidades', width / 2, y, { align: 'center' });
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(70, 70, 70);
  linhaCentralizadaComMarca(doc, 'Anexo recebido no MailLab — Trilha.Web()', width / 2, y, [70, 70, 70]);
  y += 5;
  doc.setDrawColor(193, 53, 22);
  doc.setLineWidth(0.6);
  doc.line(left, y, width - left, y);
  y += 10;

  const rows: [string, string, string][] = [
    ['Sábado', 'Unidade', 'Tarefa'],
    ['03/05', 'Falcão', 'Recepção e bandeirim'],
    ['10/05', 'Águia', 'Oração inicial'],
    ['17/05', 'Pantera', 'Louvor'],
    ['24/05', 'Tigre', 'Mensagem'],
  ];
  const columns = [left, left + 40, left + 90];

  rows.forEach(([a, b, c], index) => {
    doc.setFont('helvetica', index === 0 ? 'bold' : 'normal');
    doc.setFontSize(index === 0 ? 10.5 : 10);
    doc.setTextColor(index === 0 ? 26 : 60, index === 0 ? 26 : 60, index === 0 ? 26 : 60);
    doc.text(a, columns[0], y);
    doc.text(b, columns[1], y);
    doc.text(c, columns[2], y);
    y += 6;
    if (index === 0) {
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.2);
      doc.line(left, y - 4, width - left, y - 4);
      y += 1;
    }
  });

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text(`Baixado por ${studentName}.`, left, y);
  doc.text('Este é um anexo real: o requisito 7.3 pede baixar e abrir, não simular.', left, y + 5);

  doc.save('escala-das-unidades.pdf');
}

export interface ReportSection {
  heading: string;
  paragraphs: string[];
}

export interface ReportPdfInput {
  studentName: string;
  club: string;
  unit: string;
  issuedOn: string;
  /**
   * As trilhas que este relatório descreve, uma por linha na capa.
   *
   * Era uma frase só — "Trilha.Web() — Especialidades A, B e C" — escrita com
   * um `doc.text` sem quebra nenhuma: com três especialidades ela já saía
   * pelas margens, e o documento abria com o próprio assunto cortado no meio
   * de uma palavra. Lista não tem esse problema, cresce com a plataforma, e
   * responde de relance a pergunta que a liderança faz primeiro — "este
   * relatório fala da AP044?" —, que numa linha comprida se lê varrendo.
   *
   * São trilhas, e o campo se chama assim: o relatório cobre as especialidades
   * escolhidas na tela, e as veredas entram numa seção própria mais adiante.
   * Um nome guarda-chuva aqui faria a capa prometer o que ela não lista.
   */
  trilhas: string[];
  intro: string;
  sections: ReportSection[];
  /** Introductory sentence for the achievements section; omitted when there are none. */
  badgeIntro?: string;
  badges: InsigniaConquistada[];
  annexNote?: string;
  certificates: Certification[];
}

const MARGIN = { top: 20, right: 18, bottom: 22, left: 18 };
const BODY_SIZE = 10.5;
const LINE_HEIGHT = 5.1;

const PRETO: [number, number, number] = [0, 0, 0];
const TINTA: [number, number, number] = [26, 26, 26];
const CINZA: [number, number, number] = [90, 90, 90];
const CINZA_CLARO: [number, number, number] = [140, 140, 140];

/*
  A capa.

  ── Por que ela existe, e por que não é só enfeite ────────────────────────
  O documento é entregue impresso à liderança e arquivado com a ficha do
  desbravador. Sem capa ele começava no meio de um parágrafo de identificação,
  e a única coisa que dizia de longe o que era — o assunto — estava numa linha
  que estourava a margem.

  Tudo o que está aqui responde a uma pergunta que alguém faz **antes** de ler:
  de quem é, de que clube, de quando, sobre quais percursos, e o que vem
  anexado. É a folha que se olha com o documento fechado em cima da mesa.

  ── O que ela não tem ─────────────────────────────────────────────────────
  Os emblemas das trilhas. Eles são a arte dos certificados e chegam inteiros,
  sangrados, nas folhas de anexo — repetir miniaturas na capa acrescentaria
  decoração e nenhuma informação.
*/
function desenharCapa(doc: jsPDF, input: ReportPdfInput): void {
  const largura = A4_PORTRAIT.width;
  const centro = largura / 2;
  const direita = largura - MARGIN.right;
  const util = direita - MARGIN.left;

  /* A faixa do topo é a cor da plataforma, e é a mesma dos parênteses da
     marca: um hexadecimal escrito à parte aqui divergiria no primeiro ajuste
     de tema. */
  doc.setFillColor(...VERMELHO_DA_MARCA);
  doc.rect(0, 0, largura, 9, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  linhaCentralizadaComMarca(doc, 'Trilha.Web()', centro, 36, TINTA);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...CINZA);
  doc.text('Trilhas de especialidades do Clube de Desbravadores', centro, 43, { align: 'center' });

  doc.setDrawColor(...VERMELHO_DA_MARCA);
  doc.setLineWidth(0.6);
  doc.line(MARGIN.left, 52, direita, 52);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.setTextColor(...PRETO);
  doc.text('Relatório de', centro, 74, { align: 'center' });
  doc.text('Competências', centro, 87, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(...CINZA);
  doc.text('Registro de aprendizagem para apresentação à liderança do Clube',
    centro, 97, { align: 'center' });

  // ── O bloco de identificação ──
  const topoDoBloco = 110;
  const alturaDoBloco = 44;
  doc.setFillColor(246, 246, 246);
  doc.setDrawColor(215, 215, 215);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN.left, topoDoBloco, util, alturaDoBloco, 2, 2, 'FD');

  const dentro = MARGIN.left + 8;
  rotulo(doc, 'DESBRAVADOR(A)', dentro, topoDoBloco + 10);

  /* O nome encolhe para caber, como no certificado: cortar o nome de alguém
     na capa do documento sobre ela é o pior lugar para cortar. */
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PRETO);
  let corpoDoNome = 18;
  doc.setFontSize(corpoDoNome);
  const larguraMaxima = util - 16;
  if (doc.getTextWidth(input.studentName) > larguraMaxima) {
    corpoDoNome = corpoDoNome * (larguraMaxima / doc.getTextWidth(input.studentName));
    doc.setFontSize(corpoDoNome);
  }
  doc.text(input.studentName, dentro, topoDoBloco + 20);

  const meio = MARGIN.left + util / 2;
  rotulo(doc, 'CLUBE', dentro, topoDoBloco + 30);
  valor(doc, input.club || '—', dentro, topoDoBloco + 36, meio - dentro - 6);
  rotulo(doc, 'UNIDADE', meio, topoDoBloco + 30);
  valor(doc, input.unit || '—', meio, topoDoBloco + 36, direita - meio - 8);

  // ── As trilhas, uma por linha ──
  /*
    Uma coluna enquanto couber, duas quando não couber.

    Treze trilhas cabem numa coluna hoje; a plataforma cresce, e uma lista que
    passasse do rodapé escreveria por cima dele sem erro nenhum. A segunda
    coluna é a saída barata, e ela só aparece quando faz falta.
  */
  const rodapeDaCapa = 252;
  const ALTURA_CONFORTAVEL = 6;
  const inicioDoEspaco = topoDoBloco + alturaDoBloco + 14;
  const alturaDoEspaco = rodapeDaCapa - inicioDoEspaco;
  const espacoDasLinhas = alturaDoEspaco - 8;
  const quantos = Math.max(1, input.trilhas.length);

  /*
    Colunas primeiro, e só então a linha encolhe.

    A conta antiga era "mais do que cabe numa coluna? então duas", e duas
    colunas não bastam para qualquer lista: com trinta e quatro trilhas ela
    passava do rodapé e escrevia por cima da data de emissão e do aviso de
    anexo, sem erro nenhum. Quantas trilhas a plataforma vai ter é justamente o
    que ninguém sabe — a capa precisa continuar legível quando esse número
    dobrar.
  */
  const cabemPorColuna = Math.max(1, Math.floor(espacoDasLinhas / ALTURA_CONFORTAVEL));
  const colunas = Math.min(3, Math.max(1, Math.ceil(quantos / cabemPorColuna)));
  const porColuna = Math.ceil(quantos / colunas);
  const larguraDaColuna = util / colunas;
  const alturaDaLinha = Math.min(ALTURA_CONFORTAVEL, espacoDasLinhas / porColuna);
  /* O corpo acompanha a linha, com piso: letra que encolhe sem limite vira
     uma capa que ninguém lê de longe, que é para o que a capa serve. */
  const corpoDaLista = Math.min(11, Math.max(7, alturaDaLinha * 1.55));

  /* O bloco se centra no que sobra entre o bloco de identificação e o rodapé:
     com três percursos, ancorá-lo no topo abre um buraco de dez centímetros no
     meio da capa, e com treze ele encosta no rodapé. Centrado, a composição
     fecha nos dois casos. */
  const alturaDaLista = 8 + porColuna * alturaDaLinha;
  const topoDaLista = inicioDoEspaco + Math.max(0, (alturaDoEspaco - alturaDaLista) / 2);
  rotulo(doc, 'TRILHAS DESCRITAS NESTE RELATÓRIO', MARGIN.left, topoDaLista);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(corpoDaLista);
  input.trilhas.forEach((trilha, i) => {
    const coluna = Math.floor(i / porColuna);
    const x = MARGIN.left + coluna * larguraDaColuna;
    const y = topoDaLista + 8 + (i % porColuna) * alturaDaLinha;

    doc.setFillColor(...VERMELHO_DA_MARCA);
    doc.rect(x, y - 2.4, 2.2, 2.2, 'F');

    doc.setTextColor(...TINTA);
    const [primeira] = doc.splitTextToSize(trilha, larguraDaColuna - 8) as string[];
    doc.text(primeira, x + 5.5, y);
  });

  // ── O pé da capa ──
  doc.setDrawColor(215, 215, 215);
  doc.setLineWidth(0.3);
  doc.line(MARGIN.left, rodapeDaCapa + 8, direita, rodapeDaCapa + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...CINZA);
  doc.text(`Emitido em ${input.issuedOn}`, MARGIN.left, rodapeDaCapa + 15);
  if (input.annexNote) {
    /* Com os parênteses vermelhos: é uma linha só, e a exceção que deixa o
       corpo do relatório sem a marca existe porque lá o nome cai no meio de um
       parágrafo quebrado em linhas. Aqui não cai. */
    const [primeira] = doc.splitTextToSize(input.annexNote, util) as string[];
    linhaComMarca(doc, primeira, MARGIN.left, rodapeDaCapa + 20.5, CINZA);
  }

  doc.setFontSize(8.5);
  linhaComMarca(doc, 'Documento gerado pela Trilha.Web()', MARGIN.left, rodapeDaCapa + 30, CINZA_CLARO);
}

/** O rótulo pequeno, em caixa alta, que nomeia um campo da capa. */
function rotulo(doc: jsPDF, texto: string, x: number, y: number): void {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...CINZA_CLARO);
  doc.text(texto, x, y);
}

/** O valor de um campo da capa, encurtado ao que couber na coluna dele. */
function valor(doc: jsPDF, texto: string, x: number, y: number, largura: number): void {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...TINTA);
  const [primeira] = doc.splitTextToSize(texto, largura) as string[];
  doc.text(primeira, x, y);
}

/*
  O sumário.

  ── Por que ele precisa de páginas reservadas ─────────────────────────────
  Só se sabe em que página uma seção caiu **depois** de compor o corpo, e
  inserir o sumário depois empurraria todas as páginas seguintes — os números
  recém-apurados passariam a apontar para a página anterior à certa. Um erro
  de um, em toda linha, que ninguém confere lendo.

  A saída é reservar as folhas antes e escrevê-las no fim, e ela só é honesta
  porque o número de entradas é conhecido de antemão: são as seções, mais a
  apresentação, mais as conquistas e o anexo quando existem. `paginasDoSumario`
  faz essa conta, e é ela — e não um palpite — que decide quantas folhas ficam
  em branco esperando.
*/
const ENTRADAS_POR_PAGINA_DO_SUMARIO = 30;
const ALTURA_DA_ENTRADA = 7;
const ALTURA_DO_CABECALHO_DO_SUMARIO = 14;

/**
 * A geometria do sumário, exportada para a trava refazer a conta.
 *
 * Reservar menos folhas do que as entradas pedem não estoura: a última entrada
 * simplesmente não é desenhada, ou é desenhada por cima do rodapé. Um sumário
 * a que falta a última linha é indistinguível de um sumário completo para quem
 * não conhece o documento.
 */
export const GEOMETRIA_DO_SUMARIO = {
  entradasPorPagina: ENTRADAS_POR_PAGINA_DO_SUMARIO,
  alturaDaEntrada: ALTURA_DA_ENTRADA,
  alturaDoCabecalho: ALTURA_DO_CABECALHO_DO_SUMARIO,
  alturaUtil: A4_PORTRAIT.height - MARGIN.top - MARGIN.bottom,
};

/** Quantas folhas o sumário vai ocupar, sabendo quantas entradas terá. */
export function paginasDoSumario(entradas: number): number {
  return Math.max(1, Math.ceil(entradas / ENTRADAS_POR_PAGINA_DO_SUMARIO));
}

interface EntradaDoSumario {
  titulo: string;
  pagina: number;
}

function desenharSumario(doc: jsPDF, entradas: EntradaDoSumario[], primeiraFolha: number): void {
  const direita = A4_PORTRAIT.width - MARGIN.right;

  doc.setPage(primeiraFolha);
  let y = MARGIN.top + 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...PRETO);
  doc.text('Sumário', MARGIN.left, y);
  y += 4;
  doc.setDrawColor(...VERMELHO_DA_MARCA);
  doc.setLineWidth(0.6);
  doc.line(MARGIN.left, y, direita, y);
  y += ALTURA_DO_CABECALHO_DO_SUMARIO - 4;

  entradas.forEach((entrada, i) => {
    /*
      A quebra conta entradas, e não milímetros — de propósito.

      `paginasDoSumario` reservou as folhas contando entradas; se aqui a
      quebra fosse por altura, as duas contas seriam parecidas e não iguais, e
      no dia em que discordassem a última entrada cairia numa folha que não
      foi reservada. É a mesma razão pela qual `sortearCobrindo` e
      `minimoParaCobrir` compartilham o laço.
    */
    if (i > 0 && i % ENTRADAS_POR_PAGINA_DO_SUMARIO === 0) {
      doc.setPage(primeiraFolha + i / ENTRADAS_POR_PAGINA_DO_SUMARIO);
      y = MARGIN.top;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(...TINTA);
    const numero = String(entrada.pagina);
    const larguraDoNumero = doc.getTextWidth(numero);
    const [titulo] = doc.splitTextToSize(entrada.titulo, direita - MARGIN.left - larguraDoNumero - 10) as string[];
    /* "Anexos — 2 certificados Token.Web()" é entrada de sumário, não corpo de
       parágrafo: a marca vem vestida aqui. */
    linhaComMarca(doc, titulo, MARGIN.left, y, TINTA);

    /* A régua entre o título e o número, no lugar do pontilhado: ela liga os
       dois lados da linha sem depender de uma fonte que meça o ponto. */
    /* `larguraComMarca` e não `getTextWidth`: "Anexos — 2 certificados
       Token.Web()" sai em duas fontes, e a medida em Helvetica poria a régua
       por cima do que já foi escrito. */
    const fimDoTitulo = MARGIN.left + larguraComMarca(doc, titulo) + 2.5;
    const inicioDoNumero = direita - larguraDoNumero - 2.5;
    if (inicioDoNumero > fimDoTitulo) {
      doc.setDrawColor(205, 205, 205);
      doc.setLineWidth(0.2);
      doc.line(fimDoTitulo, y - 1.1, inicioDoNumero, y - 1.1);
    }

    doc.setTextColor(...CINZA);
    doc.text(numero, direita, y, { align: 'right' });
    y += ALTURA_DA_ENTRADA;
  });
}

/*
  O rodapé, com a numeração.

  A capa não se numera — é a convenção de todo documento impresso, e um "1"
  embaixo do título estragaria a folha. As folhas de anexo também não: elas são
  a arte do certificado sangrada até a borda, e carimbar um número por cima
  seria escrever no documento que a pessoa vai emoldurar.

  Elas continuam contando no total, porque contam mesmo: quem recebe um
  documento de nove folhas precisa saber que recebeu as nove.
*/
function carimbarRodape(doc: jsPDF, studentName: string, folhasDeAnexo: number): void {
  const total = doc.getNumberOfPages();
  const direita = A4_PORTRAIT.width - MARGIN.right;
  const base = A4_PORTRAIT.height - 10;

  for (let pagina = 2; pagina <= total - folhasDeAnexo; pagina++) {
    doc.setPage(pagina);

    doc.setDrawColor(225, 225, 225);
    doc.setLineWidth(0.2);
    doc.line(MARGIN.left, base - 4, direita, base - 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    linhaComMarca(doc, `Trilha.Web() · ${studentName}`, MARGIN.left, base, CINZA_CLARO);

    doc.setTextColor(...CINZA_CLARO);
    doc.text(`página ${pagina} de ${total}`, direita, base, { align: 'right' });
  }
}

/**
 * The competency report: a cover, a table of contents, flowing portrait pages,
 * then one landscape sheet per earned certificate. Mixing orientations is the
 * part CSS could not do.
 */
export async function exportReportPdf(input: ReportPdfInput): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  /* Antes de qualquer traço: a capa abre com a marca, e medir a linha dela em
     Helvetica para depois desenhá-la em Space Mono a tiraria do meio. */
  await vestirAMarca(doc);
  const textWidth = A4_PORTRAIT.width - MARGIN.left - MARGIN.right;

  // ── Capa, folha 1 ──
  desenharCapa(doc, input);

  /*
    As folhas do sumário, em branco por enquanto.

    A conta é feita antes de compor o corpo porque as entradas são conhecidas
    antes: a apresentação, cada seção, e — quando existem — as conquistas e o
    anexo. O que não se sabe ainda é o número de cada uma, e é só isso que o
    fim preenche.
  */
  const entradasPrevistas = 1
    + input.sections.length
    + (input.badges.length > 0 ? 1 : 0)
    + (input.certificates.length > 0 ? 1 : 0);
  const folhasDeSumario = paginasDoSumario(entradasPrevistas);
  const primeiraDoSumario = 2;
  for (let i = 0; i < folhasDeSumario; i++) doc.addPage('a4', 'portrait');

  // ── Corpo ──
  doc.addPage('a4', 'portrait');
  let y = MARGIN.top;
  const entradas: EntradaDoSumario[] = [];

  /** Starts a new page when the next block would cross the bottom margin. */
  const ensureSpace = (needed: number) => {
    if (y + needed > A4_PORTRAIT.height - MARGIN.bottom) {
      doc.addPage('a4', 'portrait');
      y = MARGIN.top;
    }
  };

  const writeParagraph = (text: string, opts: { size?: number; style?: 'normal' | 'bold'; gap?: number } = {}) => {
    const { size = BODY_SIZE, style = 'normal', gap = 3.4 } = opts;
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, textWidth) as string[];
    for (const line of lines) {
      // Paginate line by line: a paragraph longer than a page must continue on the
      // next one rather than be pushed whole, which is what left the old printed
      // version with half-empty pages.
      ensureSpace(LINE_HEIGHT);
      doc.text(line, MARGIN.left, y, { baseline: 'alphabetic' });
      y += LINE_HEIGHT;
    }
    y += gap;
  };

  /** Abre uma seção e anota em que folha ela caiu, para o sumário. */
  const abrirSecao = (titulo: string) => {
    // Keep a heading with at least the first two lines of its section.
    ensureSpace(LINE_HEIGHT * 3 + 6);
    entradas.push({ titulo, pagina: doc.getNumberOfPages() });
    y += 2;
    doc.setTextColor(...VERMELHO_DA_MARCA);
    writeParagraph(titulo, { size: 12, style: 'bold', gap: 1.5 });
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(MARGIN.left, y - 2.5, A4_PORTRAIT.width - MARGIN.right, y - 2.5);
    y += 1.5;
    doc.setTextColor(...TINTA);
  };

  /* A introdução ganhou título porque o sumário precisa de um: seção sem nome
     é linha que não dá para citar. */
  abrirSecao('Apresentação');
  writeParagraph(input.intro);

  for (const section of input.sections) {
    abrirSecao(section.heading);
    for (const p of section.paragraphs) writeParagraph(p);
  }

  // ── Conquistas ──
  if (input.badges.length > 0) {
    abrirSecao('Conquistas');
    if (input.badgeIntro) writeParagraph(input.badgeIntro);

    // The icons are rasterised once each: a student who earned the same tier
    // twice should not pay for two identical images inside the file.
    const iconCache = new Map<string, string>();
    const ICON_MM = 9;

    /* Da mais antiga para a mais nova: o relatório conta um percurso, e
       percurso se lê do começo. Ver `emOrdemDeConquista`. */
    const textLeft = MARGIN.left + ICON_MM + 4;
    const textRight = A4_PORTRAIT.width - MARGIN.right;

    for (const badge of emOrdemDeConquista(input.badges)) {
      /*
        A data da conquista, à direita e na linha do nome.

        Ela sempre esteve em `awarded_at` e o relatório não a imprimia: a seção
        dizia o que a pessoa conquistou e não dizia **quando**, que é metade do
        que a liderança lê num histórico. Sai por `dataPorExtenso`, a mesma do
        cartão da estante — em Brasília pelo nome do fuso, porque quem estuda
        às 22h não pode ter a conquista datada do dia seguinte.
      */
      const quando = badge.conquistadaEm ? dataPorExtenso(badge.conquistadaEm) : undefined;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      const larguraDaData = quando ? doc.getTextWidth(quando) + 4 : 0;

      /*
        As linhas se medem antes de desenhar, e a altura da fileira sai delas.

        Com uma altura fixa, o nome comprido era cortado na primeira linha — e
        o que se perdia calado era a classe, que vai no fim: "Primeiro
        Token.Web() de uma vereda inteira" saía sem o "(Amigo)". Nome de
        insígnia é curto hoje, então isso quase nunca acontecia, que é
        exatamente o tipo de corte que passa despercebido até o dia em que
        passa a acontecer sempre.
      */
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      const linhasDoNome = doc.splitTextToSize(
        `${badge.name} (${TIER_LABELS[badge.tier]})`,
        textRight - textLeft - larguraDaData,
      ) as string[];
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const linhasDaDescricao = doc.splitTextToSize(badge.description, textRight - textLeft) as string[];
      const alturaDoTexto = linhasDoNome.length * 4.4 + linhasDaDescricao.length * 4.2;

      ensureSpace(Math.max(ICON_MM, alturaDoTexto) + 2.5);
      const rowTop = y - 3.6;

      const cacheKey = `${badge.icon}|${badge.tier}`;
      let png = iconCache.get(cacheKey);
      if (!png) {
        png = await renderBadgeIconPng(badge.icon, badge.tier);
        iconCache.set(cacheKey, png);
      }
      doc.addImage(png, 'PNG', MARGIN.left, rowTop, ICON_MM, ICON_MM);

      if (quando) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...CINZA_CLARO);
        doc.text(quando, textRight, y, { align: 'right' });
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...TINTA);
      let cursor = y;
      for (const linha of linhasDoNome) {
        doc.text(linha, textLeft, cursor);
        cursor += 4.4;
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...CINZA);
      for (const linha of linhasDaDescricao) {
        doc.text(linha, textLeft, cursor);
        cursor += 4.2;
      }
      y = Math.max(rowTop + ICON_MM, cursor - 4.2) + 4.5;
    }
    y += 1;
  }

  if (input.annexNote) {
    ensureSpace(LINE_HEIGHT * 2 + 6);
    y += 3;
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.2);
    doc.line(MARGIN.left, y, A4_PORTRAIT.width - MARGIN.right, y);
    y += 5;
    doc.setTextColor(...CINZA);
    writeParagraph(input.annexNote, { size: 9 });
  }

  // ── Attached certificates, landscape ──
  if (input.certificates.length > 0) {
    entradas.push({
      titulo: input.certificates.length === 1
        ? 'Anexo — certificado Token.Web()'
        : `Anexos — ${input.certificates.length} certificados Token.Web()`,
      pagina: doc.getNumberOfPages() + 1,
    });
  }
  for (const cert of input.certificates) {
    doc.addPage('a4', 'landscape');
    await drawCertificate(doc, cert, input.studentName);
  }

  desenharSumario(doc, entradas, primeiraDoSumario);
  carimbarRodape(doc, input.studentName, input.certificates.length);

  doc.save(`Relatorio de Competencias - ${input.studentName}.pdf`);
}
