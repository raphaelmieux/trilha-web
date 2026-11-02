import type { Acao, Roteiro } from '../roteiros';

/*
 * CC-ES004 Documentos Portáteis, no leitor de PDF do laboratório, com a pasta
 * da gincana da primavera — e não a do acampamento que as lições arrumam. O
 * motivo está em `gincanaDaPrimavera.ts`.
 */

const V = 'CC-ES004';
const L = 1280;
const A = 800;

const linha = (nome: string) => `.pdf-linha:has-text("${nome}")`;
const comando = (rotulo: string) => `.pdf-bt[title="${rotulo}"]`;
const DIALOGO = '.pdf-dialogo';
const CONFIRMAR = `${DIALOGO} .pdf-dialogo-bt[data-tom="principal"]`;
const CAMPO_DO_DIALOGO = `${DIALOGO} input[type="text"]`;
const VOLTAR = '.pdf-linha-acao:has-text("Voltar à pasta")';
const PROCURAR = '[aria-label="Procurar no documento"]';
const ACHADOS = '.pdf-achados';
const AVISO_DE_IMAGEM = '.pdf-aviso-scan';
const MINIATURAS = '[aria-label="Páginas"]';
const SELO = '.pdf-selo';
const FOLHA = '.pdf-folha';
const MARGEM = '[aria-label="Comentários"]';
const campo = (id: string) => `#campo-${id}`;

/** Troca o que estiver escrito no campo do diálogo. */
const nomear = (nome: string): Acao[] => [
  { clicar: CAMPO_DO_DIALOGO }, { tecla: 'Control+a' }, { digitar: nome },
];

const r = (topico: string, cena: string, acoes: Acao[]): Roteiro =>
  ({ vereda: V, topico, cena: `gincana-${cena}`, largura: L, altura: A, acoes });

export const ROTEIROS_DE_PDF: Roteiro[] = [
  r('como-se-gera', 'origens', [
    { clicar: linha('regulamento-gincana.docx') },
    { foto: true, destaque: [`${DIALOGO} p`, CONFIRMAR] },
    { clicar: CONFIRMAR },
    { foto: true, destaque: ['.pdf-titulo', FOLHA] },
  ]),
  r('distribuir-e-editar', 'tresPdfs', [
    { clicar: linha('regulamento-gincana.docx') },
    { clicar: `${DIALOGO} .pdf-dialogo-bt:has-text("Editar o arquivo")` },
    { clicar: CAMPO_DO_DIALOGO },
    { digitar: 'A premiação acontece logo depois do almoço.' },
    { foto: true, destaque: [DIALOGO] },
    { clicar: CONFIRMAR },
    { clicar: linha('regulamento-gincana.pdf') },
    { foto: true, destaque: [FOLHA] },
  ]),
  r('juntar', 'tresPdfs', [
    { clicar: comando('Combinar') },
    ...nomear('gincana-2026-09-19-v01.pdf'),
    { foto: true, destaque: [`${DIALOGO} .pdf-dialogo-lista`, CAMPO_DO_DIALOGO] },
    { clicar: CONFIRMAR },
    { foto: true, destaque: [MINIATURAS, '.pdf-titulo-dados'] },
  ]),
  r('extrair-e-dividir', 'tresPdfs', [
    { clicar: comando('Combinar') },
    ...nomear('gincana-2026-09-19-v01.pdf'),
    { clicar: CONFIRMAR },
    { clicar: `${MINIATURAS} .pdf-mini >> nth=1` },
    { clicar: comando('Extrair páginas') },
    ...nomear('pontuacao-2026-09-19-v01.pdf'),
    { foto: true, destaque: [`${MINIATURAS} .pdf-mini >> nth=1`, DIALOGO] },
    { clicar: CONFIRMAR },
    { clicar: VOLTAR },
    { foto: true, destaque: [linha('gincana-2026-09-19-v01.pdf'), linha('pontuacao-2026-09-19-v01.pdf')] },
  ]),
  r('pesquisavel-ou-imagem', 'termos', [
    { clicar: linha('regulamento-gincana.pdf') },
    { clicar: PROCURAR }, { digitar: 'inscrição' },
    { foto: true, destaque: [PROCURAR, ACHADOS] },
    { clicar: VOLTAR },
    { clicar: linha('termos-de-imagem.pdf') },
    { clicar: PROCURAR }, { tecla: 'Control+a' }, { digitar: 'imagem' },
    { foto: true, destaque: [ACHADOS, AVISO_DE_IMAGEM, FOLHA] },
  ]),
  r('compressao', 'termos', [
    { foto: true, destaque: ['.pdf-lista'] },
    { clicar: linha('termos-de-imagem.pdf') },
    { clicar: comando('Reduzir tamanho') },
    { foto: true, destaque: [DIALOGO] },
    { clicar: CONFIRMAR },
    { clicar: VOLTAR },
    { foto: true, destaque: [linha('termos-de-imagem.pdf')] },
  ]),
  r('digitalizar-bem', 'scanner', [
    { clicar: '.pdf-bt:has-text("Digitalizar com o celular")' },
    { foto: true, destaque: ['.scan-qualidade'] },
    { clicar: '.scan-bt:has-text("Tirar a foto")' },
    { clicar: '.scan-canto >> nth=0' },
    { clicar: '.scan-canto >> nth=1' },
    { clicar: '.scan-canto >> nth=2' },
    { ponto: '#scan-girar', em: [0.5, 0.5] },
    { foto: true, destaque: ['.scan-reguas', '.scan-qualidade'] },
    { clicar: '.scan-bt:has-text("Confirmar o recorte")' },
    { clicar: '.scan-filtro:has-text("Preto e branco")' },
    { foto: true, destaque: ['.scan-filtro:has-text("Preto e branco")', '.scan-qualidade'] },
  ]),
  r('ocr', 'termos', [
    { clicar: linha('termos-de-imagem.pdf') },
    { foto: true, destaque: [AVISO_DE_IMAGEM, comando('Reconhecer texto')] },
    { clicar: comando('Reconhecer texto') },
    { clicar: comando('Copiar texto') },
    { foto: true, destaque: [DIALOGO] },
  ]),
  r('comprovar', 'termos', [
    { clicar: linha('termos-de-imagem.pdf') },
    { clicar: comando('Reconhecer texto') },
    { clicar: PROCURAR }, { digitar: 'imagem' },
    { foto: true, destaque: [PROCURAR, ACHADOS] },
  ]),
  r('formulario', 'formularios', [
    { clicar: linha('inscricao-gincana.pdf') },
    { clicar: campo('nome') }, { digitar: 'Rafael Moura' },
    { clicar: campo('unidade') }, { digitar: 'Falcão' },
    { foto: true, destaque: [campo('nome'), campo('unidade'), campo('camiseta'), campo('responsavel')] },
  ]),
  r('marcar-e-comentar', 'formularios', [
    { clicar: linha('comunicado-07.pdf') },
    { foto: true, destaque: [MARGEM] },
    { clicar: comando('Comentário') },
    { digitar: 'Conferi com a secretaria: o prazo fica, e quem se atrasar inscreve no dia.' },
    { clicar: CONFIRMAR },
    { foto: true, destaque: [MARGEM] },
  ]),
  r('assinatura-eletronica', 'assinar', [
    { clicar: linha('inscricao-gincana.pdf') },
    { clicar: comando('Assinar') },
    { foto: true, destaque: [DIALOGO] },
    { clicar: CONFIRMAR },
    { foto: true, destaque: [SELO] },
  ]),
  r('colada-ou-verificavel', 'assinar', [
    { clicar: linha('inscricao-gincana.pdf') },
    { clicar: comando('Assinar') },
    { clicar: CONFIRMAR },
    { clicar: campo('camiseta') }, { tecla: 'Control+a' }, { digitar: 'G' },
    { foto: true, destaque: [campo('camiseta'), SELO] },
  ]),
  r('senha-nao-e-seguranca', 'assinar', [
    { clicar: linha('inscricao-gincana.pdf') },
    { clicar: comando('Proteger') },
    { digitar: 'falcao2026' },
    { foto: true, destaque: [DIALOGO] },
    { clicar: CONFIRMAR },
    { clicar: comando('Copiar texto') },
    { foto: true, destaque: [DIALOGO] },
  ]),
  r('nomear', 'dossie', [
    { foto: true, destaque: ['.pdf-lista'] },
    { clicar: `${linha('scan termos.pdf')} ~ .pdf-linha-acao` },
    ...nomear('termos-2026-09-19-v01.pdf'),
    { foto: true, destaque: [DIALOGO] },
  ]),
];
