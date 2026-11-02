import type { Acao, Roteiro } from '../roteiros';

/* CC-DG001 Fundamentos Visuais, no editor de design. */

const V = 'CC-DG001';
const obj = (id: string) => `.dz-mesa [data-objeto="${id}"]`;
const campo = (rotulo: string) => `.dz-entrada[aria-label="${rotulo}"]`;
const botao = (rotulo: string) => `.dz-barra button[aria-label="${rotulo}"]`;
const menu = (nome: string) => `.dz-menu-botao:text-is("${nome}")`;
const item = (nome: string) => `.dz-menu-item:has-text("${nome}")`;
const prancha = (nome: string) => `.dz-esquerda .dz-secao:first-child .dz-lista-item:text-is("${nome}")`;
const PRANCHAS = '.dz-esquerda .dz-secao:first-child .dz-lista-item';
const aba = (nome: string) => `.dz-aba:text-is("${nome}")`;
const cor = (papel: string) => `.dz-cor[aria-label="Cor ${papel}"]`;

/** Escreve num campo de número e confirma, como quem digita e aperta Enter. */
const mudar = (rotulo: string, valor: string): Acao[] => [
  { clicar: campo(rotulo) }, { tecla: 'Control+a' }, { digitar: valor }, { tecla: 'Enter' },
];

const medidor: Acao[] = [{ clicar: menu('Plugins') }, { clicar: item('Medidor de contraste') }];

export const ROTEIROS_DOS_FUNDAMENTOS: Roteiro[] = [
  {
    vereda: V, topico: 'por-onde-o-olho-comeca', cena: 'design-talentos',
    acoes: [
      { foto: true, destaque: [[obj('titulo'), obj('texto')]] },
      { clicar: prancha('Com degraus') },
      { foto: true, destaque: [obj('titulo'), obj('data')] },
    ],
  },
  {
    vereda: V, topico: 'tamanho-peso-e-posicao', cena: 'design-talentos',
    acoes: [
      { clicar: obj('titulo') },
      { foto: true, destaque: [obj('titulo'), [campo('Corpo'), campo('Peso')]] },
      ...mudar('Corpo', '40'),
      { escolher: campo('Peso'), valor: '700' },
      { foto: true, destaque: [obj('titulo'), [campo('Corpo'), campo('Peso')]] },
      { clicar: obj('data') },
      ...mudar('Corpo', '24'),
      { escolher: campo('Peso'), valor: '700' },
      { foto: true, destaque: [obj('data'), [campo('Corpo'), campo('Peso')]] },
    ],
  },
  {
    vereda: V, topico: 'nada-por-acaso', cena: 'design-convite-torto',
    acoes: [
      { clicar: obj('onde') },
      { foto: true, destaque: [obj('onde'), campo('X')] },
      { tecla: 'Control+a' },
      { foto: true, destaque: botao('Alinhar à esquerda') },
      { clicar: botao('Alinhar à esquerda') },
      { foto: true, destaque: [[obj('titulo'), obj('onde')]] },
    ],
  },
  {
    vereda: V, topico: 'perto-quer-dizer-junto', cena: 'design-aviso',
    acoes: [
      { foto: true, destaque: [[obj('dia'), obj('saco')]] },
      { clicar: prancha('Vão que agrupa') },
      { foto: true, destaque: [[obj('dia'), obj('lugar')], [obj('traga'), obj('saco')]] },
    ],
  },
  {
    vereda: V, topico: 'repetir-e-dizer-que-e-igual', cena: 'design-classes',
    acoes: [
      { foto: true, destaque: [obj('t1'), obj('t2'), obj('t3')] },
      { clicar: obj('t1') },
      { clicar: botao('Copiar estilo') },
      { foto: true, destaque: [obj('t1'), botao('Copiar estilo')] },
      { clicar: obj('t2') },
      { clicar: obj('t3'), com: 'Shift' },
      { clicar: botao('Colar estilo') },
      { foto: true, destaque: [obj('t1'), obj('t2'), obj('t3')] },
    ],
  },
  {
    vereda: V, topico: 'o-vazio-trabalha', cena: 'design-feira',
    acoes: [
      { clicar: obj('titulo') },
      { foto: true, destaque: [obj('titulo'), [campo('X'), campo('L')]] },
      ...mudar('X', '32'),
      ...mudar('Y', '32'),
      ...mudar('L', '416'),
      { foto: true, destaque: [obj('titulo'), [campo('X'), campo('L')]] },
    ],
  },
  {
    vereda: V, topico: 'matiz-saturacao-luminosidade', cena: 'design-paleta', altura: 1180,
    acoes: [
      { clicar: aba('Cores') },
      { foto: true, destaque: [cor('Destaque'), cor('Apoio')] },
      ...mudar('Destaque — S', '5'),
      { foto: true, destaque: cor('Destaque') },
    ],
  },
  {
    vereda: V, topico: 'luz-e-tinta', cena: 'design-neon', altura: 1180,
    acoes: [
      { clicar: aba('Cores') },
      { foto: true, destaque: [obj('titulo'), `${cor('Destaque')} .dz-aviso`] },
      { clicar: menu('Exibir') },
      { foto: true, destaque: item('Prova de impressão') },
      { clicar: item('Prova de impressão') },
      { foto: true, destaque: obj('titulo') },
    ],
  },
  {
    vereda: V, topico: 'uma-paleta-de-cinco', cena: 'design-paleta', altura: 1180,
    acoes: [
      { clicar: aba('Cores') },
      { foto: true, destaque: [[cor('Fundo'), cor('Neutro')]] },
      { clicar: obj('data') },
      { clicar: aba('Propriedades') },
      { foto: true, destaque: [obj('data'), campo('Cor do texto')] },
    ],
  },
  {
    vereda: V, topico: 'familia-e-peso', cena: 'design-folheto',
    acoes: [
      { clicar: obj('titulo') },
      { foto: true, destaque: [obj('titulo'), [campo('Família'), campo('Peso')]] },
      { clicar: obj('texto') },
      { foto: true, destaque: [obj('texto'), [campo('Família'), campo('Peso')]] },
    ],
  },
  {
    vereda: V, topico: 'corpo-e-entrelinha', cena: 'design-folheto',
    acoes: [
      { clicar: obj('texto') },
      { foto: true, destaque: [obj('texto'), campo('Entrelinha')] },
      ...mudar('Entrelinha', '1.5'),
      { foto: true, destaque: [obj('texto'), campo('Entrelinha')] },
    ],
  },
  {
    vereda: V, topico: 'tres-familias-e-um-par', cena: 'design-folheto',
    acoes: [
      { foto: true, destaque: [obj('titulo'), obj('texto')] },
      { clicar: prancha('Arial + Verdana') },
      { foto: true, destaque: [obj('titulo'), obj('texto')] },
    ],
  },
  {
    vereda: V, topico: 'diferente-de-verdade', cena: 'design-medidas',
    acoes: [
      ...medidor,
      { clicar: obj('titulo') },
      { foto: true, destaque: [obj('titulo'), '.dz-medida'] },
      { clicar: obj('hora') },
      { foto: true, destaque: [obj('hora'), '.dz-medida'] },
    ],
  },
  {
    vereda: V, topico: 'medir-e-nao-achar', cena: 'design-medidas',
    acoes: [
      ...medidor,
      { foto: true, destaque: aba('Contraste') },
      { clicar: obj('raspando') },
      { foto: true, destaque: [obj('raspando'), '.dz-medida'] },
      { clicar: obj('quase') },
      { foto: true, destaque: [obj('quase'), '.dz-medida'] },
    ],
  },
  {
    vereda: V, topico: 'a-cor-nao-carrega-sozinha', cena: 'design-caminhada',
    acoes: [
      { foto: true, destaque: [[obj('p0'), obj('p4')]] },
      { clicar: menu('Exibir') },
      { clicar: item('Deuteranopia') },
      { foto: true, destaque: [[obj('p0'), obj('p4')]] },
      { clicar: prancha('Cor e palavra') },
      { foto: true, destaque: [[obj('n0'), obj('n4')]] },
    ],
  },
  {
    vereda: V, topico: 'refazer-sem-perder', cena: 'design-aniversario',
    acoes: [
      { foto: true, destaque: '.dz-esquerda .dz-bt:has-text("Duplicar prancha")' },
      { clicar: '.dz-esquerda .dz-bt:has-text("Duplicar prancha")' },
      { foto: true, destaque: [[`${PRANCHAS} >> nth=0`, `${PRANCHAS} >> nth=1`]] },
    ],
  },
];
