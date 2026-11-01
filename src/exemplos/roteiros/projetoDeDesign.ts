import type { Acao, Roteiro } from '../roteiros';
import { FINAIS_DO_MUTIRAO } from '../mutiraoDoCorrego';

/*
 * CC-DG006 Projeto de Design. Símbolo, post e pasta são os do mutirão do
 * córrego; a foto é o lago da CC-DG003 e o vetor no papel é o mapa do guia
 * da CC-DG005 — o gesto é o mesmo, e a peça não é a do laboratório.
 */

const V = 'CC-DG006';
const L = 1280;
const A = 900;

/* O editor de design */
const campo = (rotulo: string) => `.dz-entrada[aria-label="${rotulo}"]`;
const menuDz = (nome: string) => `.dz-menu-botao:text-is("${nome}")`;
const itemDz = (nome: string) => `.dz-menu-item:has-text("${nome}")`;
const camada = (nome: string) => `.dz-esquerda .dz-secao:nth-child(2) .dz-lista-item:text-is("${nome}")`;
const CAMADAS = '.dz-esquerda .dz-secao:nth-child(2)';
const PRANCHAS = '.dz-esquerda .dz-secao:first-child';
const prancha = (nome: string) => `${PRANCHAS} .dz-lista-item:text-is("${nome}")`;
const MESA = '.dz-prancha-e-guias';
const DUPLICAR_PRANCHA = '.dz-esquerda .dz-bt:has-text("Duplicar prancha")';
const escrever = (seletor: string, valor: string): Acao[] => [
  { clicar: seletor }, { tecla: 'Control+a' }, { digitar: valor }, { tecla: 'Enter' },
];

/* O editor de foto */
const menuFt = (nome: string) => `.ft-menu-botao:text-is("${nome}")`;
const itemFt = (nome: string) => `.ft-menu-item:has-text("${nome}")`;
const dialogoFt = (nome: string) => `.ft-dialogo[aria-label="${nome}"]`;

/* A nuvem */
const linha = (nome: string) => `.nv-linha:has-text("${nome}")`;
const maisAcoes = (nome: string) => `[aria-label="Mais ações de ${nome}"]`;
const itemNv = (nome: string) => `.nv-item:text-is("${nome}")`;

export const ROTEIROS_DO_PROJETO_DE_DESIGN: Roteiro[] = [
  {
    vereda: V, topico: 'simbolo-de-autoria', cena: 'mutirao-pecas', largura: L, altura: A,
    acoes: [
      { clicar: camada('Gota') },
      { clicar: camada('Folha'), com: 'Shift' },
      { clicar: camada('Margem'), com: 'Shift' },
      { foto: true, destaque: [MESA, CAMADAS] },
      { tecla: 'Control+g' },
      ...escrever(campo('Nome da camada'), 'Símbolo'),
      { foto: true, destaque: [CAMADAS, campo('Nome da camada')] },
    ],
  },
  {
    vereda: V, topico: 'simbolo-pequeno', cena: 'mutirao-duas-ideias', largura: L, altura: A,
    acoes: [
      { clicar: menuDz('Exibir') },
      { clicar: itemDz('Ver em 64, 32 e 16 px') },
      { foto: true, destaque: '.dz-tamanhos' },
      { clicar: prancha('Símbolo') },
      { foto: true, destaque: '.dz-tamanhos' },
    ],
  },
  {
    vereda: V, topico: 'tratar-a-foto', cena: 'foto-lago-ajustado', largura: L, altura: A,
    acoes: [
      { clicar: menuFt('Arquivo') },
      { clicar: itemFt('Exportar como') },
      ...escrever(`${dialogoFt('Exportar como')} .ft-entrada[aria-label="Nome do arquivo"]`, 'IMG_lago'),
      { foto: true, destaque: [`${dialogoFt('Exportar como')} .ft-aviso`, `${dialogoFt('Exportar como')} .ft-botao`] },
      ...escrever(`${dialogoFt('Exportar como')} .ft-entrada[aria-label="Nome do arquivo"]`, 'lago-tratada'),
      { foto: true, destaque: [`${dialogoFt('Exportar como')} .ft-entrada[aria-label="Nome do arquivo"]`, `${dialogoFt('Exportar como')} .ft-botao`] },
      { clicar: `${dialogoFt('Exportar como')} .ft-botao` },
      { clicar: menuFt('Arquivo') },
      { clicar: itemFt('Abrir') },
      { foto: true, destaque: dialogoFt('Abrir') },
    ],
  },
  {
    vereda: V, topico: 'convite-para-a-grafica', cena: 'guia-pronto-p4', largura: L, altura: A,
    acoes: [
      { clicar: '.dg-imagem[aria-label="Imagem mapa-da-trilha.svg"]' },
      { foto: true, destaque: ['.dg-imagem[aria-label="Imagem mapa-da-trilha.svg"] .dg-imagem-ppi', '.dg-direita .dg-nota:text-is("Vetor: nítido em qualquer tamanho")'] },
    ],
  },
  {
    vereda: V, topico: 'proporcao-do-meio', cena: 'mutirao-post', largura: L, altura: A,
    acoes: [
      { foto: true, destaque: [MESA, campo('Tamanho da prancha')] },
      { clicar: DUPLICAR_PRANCHA },
      ...escrever(campo('Nome da prancha'), 'Post — cartaz encolhido'),
      { clicar: prancha('Post') },
      { escolher: campo('Tamanho da prancha'), valor: '1080x1350' },
      { foto: true, destaque: [MESA, PRANCHAS, campo('Tamanho da prancha')] },
    ],
  },
  {
    vereda: V, topico: 'editavel-e-final', cena: 'mutirao-pasta', largura: L, altura: A,
    acoes: [
      { foto: true, destaque: '.nv-lista' },
      { clicar: '.nv-btn:has-text("Nova pasta")' },
      { clicar: 'input[aria-label="Nome da pasta nova"]' },
      { digitar: 'Editáveis' },
      { tecla: 'Enter' },
      { clicar: maisAcoes('simbolo.svg') },
      { clicar: itemNv('Mover para') },
      { escolher: 'select[aria-label="Pasta de destino"]', valor: 'pasta-nova-1' },
      { foto: true, destaque: '.nv-caixa' },
    ],
  },
  {
    vereda: V, topico: 'nomes-e-pastas', cena: 'mutirao-pasta-separada', largura: L, altura: A,
    acoes: [
      { clicar: linha('Finais'), duplo: true },
      { foto: true, destaque: linha('cartaz-final-FINAL2.pdf') },
      { clicar: maisAcoes('cartaz-final-FINAL2.pdf') },
      { clicar: itemNv('Renomear') },
      { tecla: 'Control+a' },
      { digitar: FINAIS_DO_MUTIRAO.cartaz },
      { foto: true, destaque: 'input[aria-label="Novo nome de cartaz-final-FINAL2.pdf"]' },
      { tecla: 'Enter' },
      { foto: true, destaque: '.nv-lista' },
    ],
  },
];
