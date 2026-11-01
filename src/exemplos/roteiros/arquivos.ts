import type { Acao, Roteiro } from '../roteiros';
import { PRESTACAO, SO_NA_COPIA } from '../discoDaUnidade';

/*
 * CC-ES001 Arquivos e Armazenamento, no Explorador do laboratório, com o
 * notebook da unidade Tucano — e não o computador do clube que as lições
 * arrumam. O motivo está em `discoDaUnidade.ts`.
 */

const V = 'CC-ES001';
const L = 1280;
const A = 800;
const CENA = 'explorador-tucano';

const painel = (nome: string) => `.win-painel span.truncate:text-is("${nome}")`;
const linha = (nome: string) => `.win-linha:has-text("${nome}")`;
const cmd = (dica: string) => `.win-cmd[title="${dica}"]`;
const itemDoMenu = (nome: string) => `.win-menu button:has-text("${nome}")`;
const LISTA = '.win-lista';
const CAMINHO = '.win-caminho';

const abrir = (...pastas: string[]): Acao[] => pastas.map(p => ({ clicar: linha(p), duplo: true }));
const renomearPara = (nome: string): Acao[] => [
  { tecla: 'F2' }, { tecla: 'Control+a' }, { digitar: nome },
];

export const ROTEIROS_DE_ARQUIVOS: Roteiro[] = [
  {
    vereda: V, topico: 'arquivo-e-pasta', cena: CENA, largura: L, altura: A,
    acoes: [
      { foto: true, destaque: [linha('cartaz bazar FINAL'), '.win-painel'] },
      { clicar: cmd('Nova pasta') },
      { tecla: 'Control+a' }, { digitar: 'Bazar de Verão' },
      { foto: true, destaque: [cmd('Nova pasta'), `${LISTA} input`] },
    ],
  },
  {
    vereda: V, topico: 'caminho', cena: CENA, largura: L, altura: A,
    acoes: [
      { clicar: painel('Documentos') },
      ...abrir('Bazar de Inverno', 'Fotos'),
      { foto: true, destaque: CAMINHO },
    ],
  },
  {
    vereda: V, topico: 'ver-a-extensao', cena: CENA, largura: L, altura: A,
    acoes: [
      { clicar: cmd('Exibir') },
      { foto: true, destaque: [linha('lista de doacoes'), itemDoMenu('Extensões de nomes de arquivos')] },
      { clicar: itemDoMenu('Extensões de nomes de arquivos') },
      { foto: true, destaque: linha('lista de doacoes') },
    ],
  },
  {
    vereda: V, topico: 'compactacao', cena: CENA, largura: L, altura: A,
    acoes: [
      { clicar: painel('Documentos') },
      ...abrir('Bazar de Inverno', 'Fotos'),
      { clicar: linha('barraca das roupas') },
      { clicar: linha('mesa dos livros'), com: 'Control' },
      { clicar: linha('caixa'), com: 'Control' },
      { clicar: linha('caixa'), direito: true },
      /* As três linhas escolhidas já se veem em azul; contorná-las cobriria o
         topo do menu, que abre em cima delas. Quem diz "três" é a régua. */
      { foto: true, destaque: [itemDoMenu('Compactar'), '.win-status span:nth-child(2)'] },
      { clicar: itemDoMenu('Compactar') },
      { foto: true, destaque: `${linha('.zip')}, .win-linha.escolhida` },
    ],
  },
  {
    vereda: V, topico: 'excluir-nao-e-apagar', cena: CENA, largura: L, altura: A,
    acoes: [
      { clicar: linha('troco do caixa') },
      { clicar: cmd('Excluir (Del)') },
      { clicar: painel('Lixeira') },
      { foto: true, destaque: [painel('Lixeira'), linha('troco do caixa')] },
      { clicar: linha('troco do caixa'), direito: true },
      { foto: true, destaque: itemDoMenu('Restaurar') },
    ],
  },
  {
    vereda: V, topico: 'ordenar', cena: CENA, largura: L, altura: A,
    acoes: [
      { clicar: cmd('Classificar') },
      { foto: true, destaque: itemDoMenu('Data de modificação') },
      { clicar: itemDoMenu('Data de modificação') },
      { foto: true, destaque: LISTA },
    ],
  },
  {
    vereda: V, topico: 'buscar', cena: CENA, largura: L, altura: A,
    acoes: [
      { clicar: painel('Documentos') },
      { clicar: '.win-busca' },
      { escolher: '#busca-tipo', valor: 'imagem' },
      { foto: true, destaque: '#busca-tipo' },
      { clicar: '.win-bt.primario' },
      { foto: true, destaque: LISTA },
    ],
  },
  {
    vereda: V, topico: 'nome-que-ordena', cena: CENA, largura: L, altura: A,
    acoes: [
      { clicar: linha('10.12.31') },
      { foto: true, destaque: linha('10.12.31') },
      ...renomearPara('2026-05-03-bazar-montagem-das-barracas'),
      { foto: true, destaque: `${LISTA} input` },
    ],
  },
  {
    vereda: V, topico: 'restaurar', cena: CENA, largura: L, altura: A,
    acoes: [
      { clicar: painel('Cópia de Segurança (D:)') },
      { clicar: linha(SO_NA_COPIA.replace(/\.xlsx$/, '')), direito: true },
      { foto: true, destaque: itemDoMenu('Copiar') },
      { clicar: itemDoMenu('Copiar') },
      { clicar: painel('Documentos') },
      ...abrir('Bazar de Inverno'),
      { clicar: cmd('Colar (Ctrl+V)') },
      { foto: true, destaque: [CAMINHO, linha(SO_NA_COPIA.replace(/\.xlsx$/, ''))] },
    ],
  },
  {
    vereda: V, topico: 'versao-anterior', cena: CENA, largura: L, altura: A,
    acoes: [
      { clicar: painel('Documentos') },
      ...abrir('Bazar de Inverno'),
      { clicar: linha(PRESTACAO.replace(/\.docx$/, '')), direito: true },
      { foto: true, destaque: itemDoMenu('Versões anteriores') },
      { clicar: itemDoMenu('Versões anteriores') },
      { foto: true, destaque: '[role="dialog"]' },
    ],
  },
  {
    vereda: V, topico: 'externo', cena: CENA, largura: L, altura: A,
    acoes: [
      { clicar: '[aria-label="Pen drive"]' },
      { foto: true, destaque: ['[aria-label="Pen drive"]', '.win-painel'] },
      { clicar: '[aria-label="Pen drive"]' },
      { foto: true, destaque: '.win-menu' },
    ],
  },
];
