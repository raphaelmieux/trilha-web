import { jsPDF } from 'jspdf';
import type { Badge, Certification } from '../types';
import { CERT_WIDTH } from '../components/CertificateCanvas';
import { renderBadgeIconPng, TIER_LABELS } from './badgeIcons';

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
 * Helvetica is one of the 14 standard PDF fonts, so the type used here is the
 * real thing rather than a substitute — and it matches the app's identity.
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

function formatIssuedDate(cert: Certification): string {
  return new Date(cert.issued_at).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

/**
 * Draws one full-bleed certificate onto the current page.
 * Mirrors CertificateCanvas exactly: the same measured coordinates, the same
 * shrink-to-fit rule for long names.
 */
async function drawCertificate(doc: jsPDF, cert: Certification, studentName: string): Promise<void> {
  const specialtyCode = cert.curriculum_code === 'AP035' ? 'AP035' : 'AP034';
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
export async function exportCertificatePdf(cert: Certification, studentName: string): Promise<void> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
  await drawCertificate(doc, cert, studentName);
  doc.save(`Token.Web ${cert.curriculum_code} - ${studentName}.pdf`);
}

/**
 * The WebLab's research sheet.
 *
 * Requirement AP034-6.1 ends with "fazer o download de um arquivo". The old lab
 * satisfied that by pushing a filename into an array — no file existed. This
 * produces a real PDF of the student's own work, which is also the thing a
 * club leader can look at afterwards.
 */
export function exportStudySheetPdf(input: {
  studentName: string;
  subject: string;
  query: string;
  searchUrl: string;
  addresses: { url: string; verdict: string }[];
  downloads: { name: string; verdict: string }[];
}): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
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
  doc.text('Trilha.Web() — WebLab · AP034, requisito 6.1', width / 2, y, { align: 'center' });
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
export function exportPactPdf(input: {
  studentName: string;
  club: string;
  clauses: { title: string; text: string }[];
}): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
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
  doc.text('Trilha.Web() — AP034, requisitos 5.1 a 5.9', width / 2, y, { align: 'center' });
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

export interface ReportSection {
  heading: string;
  paragraphs: string[];
}

export interface ReportPdfInput {
  studentName: string;
  club: string;
  unit: string;
  issuedOn: string;
  intro: string;
  sections: ReportSection[];
  /** Introductory sentence for the achievements section; omitted when there are none. */
  badgeIntro?: string;
  badges: Badge[];
  annexNote?: string;
  certificates: Certification[];
}

const MARGIN = { top: 20, right: 18, bottom: 20, left: 18 };
const BODY_SIZE = 10.5;
const LINE_HEIGHT = 5.1;

/**
 * The competency report: flowing portrait pages, then one landscape sheet per
 * earned certificate. Mixing orientations is the part CSS could not do.
 */
export async function exportReportPdf(input: ReportPdfInput): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const textWidth = A4_PORTRAIT.width - MARGIN.left - MARGIN.right;
  let y = MARGIN.top;

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

  // ── Title block ──
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text('Relatório de Competências', A4_PORTRAIT.width / 2, y, { align: 'center' });
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(70, 70, 70);
  doc.text(
    'Trilha.Web() — Especialidades AP034 (Internet) e AP035 (Internet, Avançado)',
    A4_PORTRAIT.width / 2, y, { align: 'center' }
  );
  y += 5;

  doc.setDrawColor(193, 53, 22);
  doc.setLineWidth(0.6);
  doc.line(MARGIN.left, y, A4_PORTRAIT.width - MARGIN.right, y);
  y += 7;

  // ── Identification ──
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(10);
  const idRows: [string, string][] = [
    ['Desbravador(a):', input.studentName],
    ['Clube:', input.club || '—'],
    ['Unidade:', input.unit || '—'],
    ['Emitido em:', input.issuedOn],
  ];
  for (const [label, value] of idRows) {
    ensureSpace(LINE_HEIGHT);
    doc.setFont('helvetica', 'bold');
    doc.text(label, MARGIN.left, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, MARGIN.left + 32, y);
    y += LINE_HEIGHT;
  }
  y += 2;

  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.2);
  doc.line(MARGIN.left, y, A4_PORTRAIT.width - MARGIN.right, y);
  y += 7;

  // ── Body ──
  doc.setTextColor(26, 26, 26);
  writeParagraph(input.intro);

  for (const section of input.sections) {
    // Keep a heading with at least the first two lines of its section.
    ensureSpace(LINE_HEIGHT * 3 + 6);
    y += 2;
    doc.setTextColor(193, 53, 22);
    writeParagraph(section.heading, { size: 12, style: 'bold', gap: 1.5 });
    doc.setDrawColor(200, 200, 200);
    doc.line(MARGIN.left, y - 2.5, A4_PORTRAIT.width - MARGIN.right, y - 2.5);
    y += 1.5;
    doc.setTextColor(26, 26, 26);
    for (const p of section.paragraphs) writeParagraph(p);
  }

  // ── Conquistas ──
  if (input.badges.length > 0) {
    ensureSpace(LINE_HEIGHT * 4 + 8);
    y += 2;
    doc.setTextColor(193, 53, 22);
    writeParagraph('Conquistas', { size: 12, style: 'bold', gap: 1.5 });
    doc.setDrawColor(200, 200, 200);
    doc.line(MARGIN.left, y - 2.5, A4_PORTRAIT.width - MARGIN.right, y - 2.5);
    y += 1.5;
    doc.setTextColor(26, 26, 26);
    if (input.badgeIntro) writeParagraph(input.badgeIntro);

    // The icons are rasterised once each: a student who earned the same tier
    // twice should not pay for two identical images inside the file.
    const iconCache = new Map<string, string>();
    const ICON_MM = 9;

    for (const badge of input.badges) {
      const rowHeight = Math.max(ICON_MM, LINE_HEIGHT * 2) + 2.5;
      ensureSpace(rowHeight);
      const rowTop = y - 3.6;

      const cacheKey = `${badge.icon}|${badge.tier}`;
      let png = iconCache.get(cacheKey);
      if (!png) {
        png = await renderBadgeIconPng(badge.icon, badge.tier);
        iconCache.set(cacheKey, png);
      }
      doc.addImage(png, 'PNG', MARGIN.left, rowTop, ICON_MM, ICON_MM);

      const textLeft = MARGIN.left + ICON_MM + 4;
      const textRight = A4_PORTRAIT.width - MARGIN.right;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(26, 26, 26);
      doc.text(`${badge.name} (${TIER_LABELS[badge.tier]})`, textLeft, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      const lines = doc.splitTextToSize(badge.description, textRight - textLeft) as string[];
      let descY = y + 4.4;
      for (const line of lines) {
        doc.text(line, textLeft, descY);
        descY += 4.2;
      }
      y = Math.max(rowTop + ICON_MM, descY - 4.2) + 4.5;
    }
    y += 1;
  }

  if (input.annexNote) {
    ensureSpace(LINE_HEIGHT * 2 + 6);
    y += 3;
    doc.setDrawColor(180, 180, 180);
    doc.line(MARGIN.left, y, A4_PORTRAIT.width - MARGIN.right, y);
    y += 5;
    doc.setTextColor(90, 90, 90);
    writeParagraph(input.annexNote, { size: 9 });
  }

  // ── Attached certificates, landscape ──
  for (const cert of input.certificates) {
    doc.addPage('a4', 'landscape');
    await drawCertificate(doc, cert, input.studentName);
  }

  doc.save(`Relatorio de Competencias - ${input.studentName}.pdf`);
}
