import type { Acao, Roteiro } from '../roteiros';
import { IPE_NAS_DUAS, LOBO_NAS_DUAS, MALHA_DO_GUIA, guia } from '../guiaDaCaminhada';
import { colunasDa } from '../../labs/diagramacao';

/* CC-DG005 Diagramação e Impressão, no diagramador, com o guia da caminhada. */

const V = 'CC-DG005';
const L = 1280;
const A = 900;
const menu = (nome: string) => `.dg-menu-botao:text-is("${nome}")`;
const item = (nome: string) => `.dg-menu-item:has-text("${nome}")`;
const DIALOGO = '.dg-dialogo';
const campoDoDialogo = (rotulo: string) => `.dg-dialogo .dg-entrada[aria-label="${rotulo}"]`;
const OK = '.dg-dialogo .dg-dialogo-acoes .dg-botao';
const campo = (rotulo: string) => `.dg-direita .dg-entrada[aria-label="${rotulo}"]`;
const PAPEL = '.dg-papel';
const PAINEL = '.dg-direita .dg-painel:first-child';
const pagina = (n: number) => (n === 1 ? '.dg-pagina-botao:has-text("(capa)")' : `.dg-pagina-botao:text-is("Página ${n}")`);
const imagem = (arquivo: string) => `.dg-imagem[aria-label="Imagem ${arquivo}"]`;
const ferramenta = (nome: string) => `.dg-ferramentas .dg-bt[aria-label="${nome}"]`;
const linhaDaMateria = (n: number) => `.dg-materia-linha:nth-child(${n})`;

/** Escreve num campo e confirma com Enter, como quem digita. */
const escrever = (seletor: string, valor: string): Acao[] => [
  { clicar: seletor }, { tecla: 'Control+a' }, { digitar: valor }, { tecla: 'Enter' },
];
const mudar = (rotulo: string, valor: string) => escrever(campo(rotulo), valor);
const noDialogo = (rotulo: string, valor: string) => escrever(campoDoDialogo(rotulo), valor);

/** O ponto da página em fração da largura e da altura dela, a partir de milímetros. */
const em = (x: number, y: number): [number, number] => [x / 148, y / 210];

const m = MALHA_DO_GUIA.margens;
/** A terceira coluna da página 3, que ninguém criou e que recebe o fim do texto. */
const TERCEIRA_DA_P3 = colunasDa(guia(), 2)[2].x;

export const ROTEIROS_DA_DIAGRAMACAO: Roteiro[] = [
  {
    vereda: V, topico: 'malha-de-diagramacao', cena: 'guia-sem-malha', largura: L, altura: A,
    acoes: [
      { clicar: menu('Layout') },
      { foto: true, destaque: [PAPEL, item('Margens e colunas')] },
      { clicar: item('Margens e colunas') },
      ...noDialogo('Margem de cima (mm)', String(m.topo)),
      ...noDialogo('Margem de baixo (mm)', String(m.base)),
      ...noDialogo('Margem interna (mm)', String(m.interna)),
      ...noDialogo('Margem externa (mm)', String(m.externa)),
      ...noDialogo('Colunas', String(MALHA_DO_GUIA.colunas)),
      ...noDialogo('Medianiz (mm)', String(MALHA_DO_GUIA.medianiz)),
      { foto: true, destaque: DIALOGO },
      { clicar: OK },
      { foto: true, destaque: [PAPEL, PAINEL] },
      { clicar: ferramenta('Quadro de texto (T)') },
      { ponto: PAPEL, em: em(m.externa + 2, m.topo + 10) },
      ...mudar('X (mm)', String(m.externa)),
      ...mudar('Y (mm)', String(m.topo + 8)),
      ...mudar('Altura (mm)', String(210 - m.topo - m.base - 8)),
      { foto: true, destaque: ['.dg-quadro', [campo('X (mm)'), campo('Largura (mm)')]] },
    ],
  },
  {
    vereda: V, topico: 'margem-e-sangria', cena: 'guia-sem-sangria', largura: L, altura: A,
    acoes: [
      { clicar: menu('Arquivo') },
      { clicar: item('Configurar documento') },
      ...noDialogo('Sangria (mm)', '3'),
      { foto: true, destaque: DIALOGO },
      { clicar: OK },
      { clicar: imagem('capa-trilha.jpg') },
      { foto: true, destaque: ['.dg-sangria', [campo('X (mm)'), campo('Y (mm)')]] },
      ...mudar('X (mm)', '-3'),
      ...mudar('Y (mm)', '-3'),
      ...mudar('Largura (mm)', '154'),
      ...mudar('Altura (mm)', '216'),
      { foto: true, destaque: ['.dg-sangria', [campo('X (mm)'), campo('Altura (mm)')]] },
    ],
  },
  {
    vereda: V, topico: 'estilos-de-paragrafo', cena: 'guia-pronto', largura: L, altura: A,
    acoes: [
      { foto: true, destaque: PAPEL },
      { clicar: menu('Texto') },
      { clicar: item('Editar matéria') },
      { foto: true, destaque: [[`${linhaDaMateria(1)} .dg-materia-estilo`, `${linhaDaMateria(2)} .dg-materia-estilo`]] },
    ],
  },
  {
    vereda: V, topico: 'o-mais-do-estilo', cena: 'guia-texto-colado', largura: L, altura: A,
    acoes: [
      { clicar: menu('Texto') },
      { clicar: item('Editar matéria') },
      { foto: true, destaque: [`${linhaDaMateria(6)} .dg-materia-estilo`, `${linhaDaMateria(11)} .dg-materia-estilo`] },
      { clicar: '.dg-botao-claro[aria-label="Limpar formatação do parágrafo 6"]' },
      { clicar: '.dg-botao-claro[aria-label="Limpar formatação do parágrafo 11"]' },
      { foto: true, destaque: [linhaDaMateria(6), linhaDaMateria(11)] },
      { escolher: 'select[aria-label="Estilo do parágrafo 6"]', valor: 'titulo' },
      { foto: true, destaque: linhaDaMateria(6) },
      { clicar: '.dg-dialogo .dg-botao:text-is("Fechar")' },
      { foto: true, destaque: PAPEL },
    ],
  },
  {
    vereda: V, topico: 'imagem-na-malha', cena: 'guia-sem-fotos', largura: L, altura: A,
    acoes: [
      { clicar: ferramenta('Quadro de imagem (F)') },
      { escolher: 'select[aria-label="Imagem a pôr"]', valor: 'ipe' },
      { foto: true, destaque: [[ferramenta('Quadro de imagem (F)'), 'select[aria-label="Imagem a pôr"]']] },
      { ponto: PAPEL, em: em(20, 110) },
      ...mudar('X (mm)', String(IPE_NAS_DUAS.x)),
      ...mudar('Y (mm)', String(IPE_NAS_DUAS.y)),
      ...mudar('Largura (mm)', String(IPE_NAS_DUAS.largura)),
      { clicar: '.dg-direita .dg-botao-claro:has-text("Ajustar altura")' },
      { foto: true, destaque: [imagem('ipe-amarelo.jpg'), '.dg-status-excesso'] },
      { clicar: pagina(3) },
      { clicar: ferramenta('Quadro de texto (T)') },
      { ponto: PAPEL, em: em(110, 40) },
      ...mudar('X (mm)', String(TERCEIRA_DA_P3)),
      ...mudar('Y (mm)', String(m.topo + 8)),
      ...mudar('Altura (mm)', String(210 - m.topo - m.base - 8)),
      { foto: true, destaque: ['.dg-quadro[aria-selected="true"]', '.dg-status span:text-is("Sem texto excedente")'] },
    ],
  },
  {
    vereda: V, topico: 'resolucao-de-impressao', cena: 'guia-lobo-grande', largura: L, altura: A,
    acoes: [
      { clicar: imagem('lobo-guara-celular.jpg') },
      { foto: true, destaque: [`${imagem('lobo-guara-celular.jpg')} .dg-imagem-ppi`, '.dg-direita .dg-aviso'] },
      ...mudar('Largura (mm)', String(LOBO_NAS_DUAS.largura)),
      { clicar: '.dg-direita .dg-botao-claro:has-text("Ajustar altura")' },
      { foto: true, destaque: [`${imagem('lobo-guara-celular.jpg')} .dg-imagem-ppi`, [campo('Largura (mm)'), campo('Altura (mm)')]] },
    ],
  },
  {
    vereda: V, topico: 'pagina-mestre', cena: 'guia-numeros-digitados', largura: L, altura: A,
    acoes: [
      { clicar: menu('Páginas') },
      { clicar: item('Página-mestre A') },
      { clicar: '.dg-dialogo input[aria-label="Número de página automático"]' },
      ...noDialogo('Cabeçalho corrente', 'Guia da Caminhada'),
      { foto: true, destaque: DIALOGO },
      { clicar: OK },
      { foto: true, destaque: [['.dg-solto:text-is("2")', '[aria-label="Número da página"]']] },
      { clicar: '.dg-solto:text-is("2")' },
      { clicar: menu('Editar') },
      { clicar: item('Excluir') },
      { foto: true, destaque: '[aria-label="Número da página"]' },
      { clicar: pagina(1) },
      { escolher: 'select[aria-label="Mestre da página 1"]', valor: 'nenhuma' },
      { foto: true, destaque: 'select[aria-label="Mestre da página 1"]' },
    ],
  },
  {
    vereda: V, topico: 'elementos-correntes', cena: 'guia-pronto-p3', largura: L, altura: A,
    acoes: [
      { foto: true, destaque: ['.dg-papel .dg-mestre:not([aria-label])', '[aria-label="Número da página"]'] },
    ],
  },
  {
    vereda: V, topico: 'marcas-de-corte', cena: 'guia-exportar', largura: L, altura: A,
    acoes: [
      { clicar: menu('Arquivo') },
      { clicar: item('Exportar PDF') },
      ...noDialogo('Nome do arquivo', 'guia-da-caminhada.pdf'),
      { foto: true, destaque: '.dg-previa' },
      ...noDialogo('Sangria no PDF (mm)', '3'),
      { clicar: '.dg-dialogo input[aria-label="Marcas de corte"]' },
      { escolher: '.dg-dialogo select[aria-label="Cor"]', valor: 'cmyk' },
      { foto: true, destaque: ['.dg-previa', [campoDoDialogo('Sangria no PDF (mm)'), '.dg-dialogo select[aria-label="Cor"]']] },
    ],
  },
  {
    vereda: V, topico: 'prova-de-impressao', cena: 'guia-pronto', largura: L, altura: A,
    acoes: [
      { clicar: menu('Exibir') },
      { foto: true, destaque: [item('Prova de cores'), '.dg-amostras'] },
      { clicar: item('Prova de cores') },
      { foto: true, destaque: ['.dg-amostras', '.dg-faixa'] },
    ],
  },
];
