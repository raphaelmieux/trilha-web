import type { Acao, Roteiro } from '../roteiros';
import { ESCURO, MARINHO, NOME_DO_BURITI, assinaturaDoBuriti } from '../marcaDoBuriti';
import { larguraMinimaMedida } from '../../labs/identidade';

/* CC-DG004 Identidade Visual, no editor de design, com a marca da unidade Buriti. */

const V = 'CC-DG004';
const obj = (id: string) => `.dz-mesa [data-objeto="${id}"]`;
const campo = (rotulo: string) => `.dz-entrada[aria-label="${rotulo}"]`;
const menu = (nome: string) => `.dz-menu-botao:text-is("${nome}")`;
const item = (nome: string) => `.dz-menu-item:has-text("${nome}")`;
const prancha = (nome: string) => `.dz-esquerda .dz-secao:first-child .dz-lista-item:text-is("${nome}")`;
const PRANCHAS = '.dz-esquerda .dz-secao:first-child';
const camada = (nome: string) => `.dz-esquerda .dz-secao:nth-child(2) .dz-lista-item:text-is("${nome}")`;
const CAMADAS = '.dz-esquerda .dz-secao:nth-child(2)';
const aba = (nome: string) => `.dz-aba:text-is("${nome}")`;
const MESA = '.dz-prancha-e-guias';
const DUPLICAR_PRANCHA = '.dz-esquerda .dz-bt:has-text("Duplicar prancha")';

/** Escreve num campo e confirma com Enter, como quem digita. */
const mudar = (rotulo: string, valor: string): Acao[] => [
  { clicar: campo(rotulo) }, { tecla: 'Control+a' }, { digitar: valor }, { tecla: 'Enter' },
];

/** A assinatura posta no tamanho mínimo medido, que é o que a lição ensina a achar. */
const LARGURA_NO_MINIMO = String(larguraMinimaMedida(assinaturaDoBuriti(), NOME_DO_BURITI));

export const ROTEIROS_DA_IDENTIDADE_VISUAL: Roteiro[] = [
  {
    vereda: V, topico: 'tres-pecas', cena: 'buriti-pecas',
    acoes: [
      { clicar: camada('Leque') },
      { clicar: camada('Tronco'), com: 'Shift' },
      { foto: true, destaque: [[obj('buriti-leque'), obj('buriti-tronco')], CAMADAS] },
      { clicar: camada('Logotipo'), com: 'Shift' },
      { tecla: 'Control+g' },
      ...mudar('Nome da camada', 'Assinatura'),
      { foto: true, destaque: [CAMADAS, campo('Nome da camada')] },
    ],
  },
  {
    vereda: V, topico: 'do-papel-ao-vetor', cena: 'buriti-pecas',
    acoes: [
      { clicar: camada('Leque') },
      { foto: true, destaque: [obj('buriti-leque'), [campo('L'), campo('A')]] },
      { clicar: camada('Tronco') },
      { foto: true, destaque: [obj('buriti-tronco'), [campo('L'), campo('A')]] },
      { clicar: menu('Exibir') },
      { clicar: item('Ver em 64, 32 e 16 px') },
      { foto: true, destaque: '.dz-tamanhos' },
    ],
  },
  {
    vereda: V, topico: 'colorida-mono-negativa', cena: 'buriti-assinatura',
    acoes: [
      { foto: true, destaque: MESA },
      { clicar: DUPLICAR_PRANCHA },
      ...mudar('Nome da prancha', 'Monocromática'),
      { clicar: camada('Assinatura') },
      ...mudar('Recolorir tudo', ESCURO),
      { foto: true, destaque: [MESA, campo('Recolorir tudo')] },
      { clicar: DUPLICAR_PRANCHA },
      ...mudar('Nome da prancha', 'Negativa'),
      ...mudar('Fundo da prancha', MARINHO),
      { clicar: camada('Assinatura') },
      ...mudar('Recolorir tudo', '#FFFFFF'),
      { foto: true, destaque: [MESA, PRANCHAS] },
    ],
  },
  {
    vereda: V, topico: 'uma-cor-e-pequena', cena: 'buriti-assinatura',
    acoes: [
      { clicar: menu('Exibir') },
      { clicar: item('Tons de cinza') },
      { foto: true, destaque: MESA },
      { clicar: menu('Exibir') },
      { clicar: item('Ver em 64, 32 e 16 px') },
      { foto: true, destaque: '.dz-tamanhos' },
    ],
  },
  {
    vereda: V, topico: 'a-paleta', cena: 'buriti-paleta', altura: 1180,
    acoes: [
      { clicar: aba('Cores') },
      { foto: true, destaque: '.dz-direita' },
      { clicar: aba('Propriedades') },
      { clicar: camada('Logotipo') },
      { foto: true, destaque: [obj('buriti-logotipo'), campo('Cor do texto')] },
    ],
  },
  {
    vereda: V, topico: 'a-tipografia', cena: 'buriti-paleta',
    acoes: [
      { clicar: prancha('Tipografia') },
      { clicar: camada('Exemplo de título') },
      { foto: true, destaque: [obj('tipo-titulo'), [campo('Família'), campo('Peso')]] },
      { clicar: camada('Exemplo de texto corrido') },
      { foto: true, destaque: [obj('tipo-corpo'), [campo('Família'), campo('Corpo')]] },
    ],
  },
  {
    vereda: V, topico: 'area-de-protecao', cena: 'buriti-protecao',
    acoes: [
      { foto: true, destaque: obj('protecao-area') },
      { clicar: camada('Leque') },
      { foto: true, destaque: [obj('protecao-leque'), [campo('Y'), campo('A')]] },
      { clicar: camada('Área de proteção') },
      { foto: true, destaque: [obj('protecao-area'), [campo('X'), campo('A')]] },
    ],
  },
  {
    vereda: V, topico: 'tamanho-minimo', cena: 'buriti-assinatura',
    acoes: [
      { clicar: camada('Assinatura') },
      { foto: true, destaque: [MESA, campo('L')] },
      ...mudar('L', LARGURA_NO_MINIMO),
      { foto: true, destaque: [MESA, campo('L')] },
    ],
  },
  {
    vereda: V, topico: 'tres-naturezas', cena: 'buriti-aplicacoes', altura: 1000,
    acoes: [
      { clicar: camada('Assinatura') },
      { clicar: menu('Editar') },
      { clicar: item('Copiar') },
      { clicar: prancha('Camiseta') },
      { clicar: menu('Editar') },
      { clicar: item('Colar') },
      { foto: true, destaque: [MESA, PRANCHAS] },
      ...mudar('Recolorir tudo', '#FFFFFF'),
      ...mudar('L', '420'),
      { foto: true, destaque: [MESA, [campo('L'), campo('Recolorir tudo')]] },
    ],
  },
  {
    vereda: V, topico: 'o-manual', cena: 'buriti-manual', altura: 1000,
    acoes: [
      { foto: true, destaque: [PRANCHAS, MESA] },
      { clicar: prancha('Manual — 2') },
      { foto: true, destaque: [prancha('Manual — 2'), MESA] },
    ],
  },
  {
    vereda: V, topico: 'usos-incorretos', cena: 'buriti-incorretos', altura: 1000,
    acoes: [
      { foto: true, destaque: MESA },
    ],
  },
];
