import type { Acao, Roteiro } from '../roteiros';

/* CC-DG002 Desenho Vetorial, no editor de design com as ferramentas de vetor. */

const V = 'CC-DG002';
const obj = (id: string) => `.dz-mesa [data-objeto="${id}"]`;
const campo = (rotulo: string) => `.dz-entrada[aria-label="${rotulo}"]`;
const ferramenta = (rotulo: string) => `.dz-barra button[aria-label^="${rotulo}"]`;
const menu = (nome: string) => `.dz-menu-botao:text-is("${nome}")`;
const item = (nome: string) => `.dz-menu-item:has-text("${nome}")`;
const prancha = (nome: string) => `.dz-esquerda .dz-secao:first-child .dz-lista-item:text-is("${nome}")`;
/* Selecionar pela lista de camadas, e não pela prancha: o meio da caixa de um
   triângulo ou de uma linha aberta pode cair fora da tinta. */
const camada = (nome: string) => `.dz-esquerda .dz-secao:nth-child(2) .dz-lista-item:text-is("${nome}")`;
const CAMADAS = '.dz-esquerda .dz-secao:nth-child(2)';
const ICONES = [obj('l-luz'), obj('c-corpo'), obj('b-caixa'), obj('l-corpo')];
const ESCUDO = [obj('g-topo'), obj('g-ponta')];
const CANETA = 'svg[aria-label="Área da caneta"]';
const tarefa = (nome: string) => `.bn-tarefa:has-text("${nome}")`;

const mudar = (rotulo: string, valor: string): Acao[] => [
  { clicar: campo(rotulo) }, { tecla: 'Control+a' }, { digitar: valor }, { tecla: 'Enter' },
];

export const ROTEIROS_DO_DESENHO_VETORIAL: Roteiro[] = [
  {
    vereda: V, topico: 'receita-ou-mosaico', cena: 'vetor-estrela-e-foto',
    acoes: [
      { foto: true, destaque: obj('estrela') },
      { clicar: menu('Exibir') },
      { clicar: item('800%') },
      { foto: true, destaque: '.dz-status' },
      { clicar: prancha('Foto') },
      { foto: true, destaque: prancha('Foto') },
    ],
  },
  {
    vereda: V, topico: 'comecar-pelo-simples', cena: 'vetor-formas',
    acoes: [
      { foto: true, destaque: [[ferramenta('Retângulo'), ferramenta('Triângulo')], [obj('parede'), obj('telhado')]] },
    ],
  },
  {
    vereda: V, topico: 'unir-subtrair-intersectar', cena: 'vetor-formas',
    acoes: [
      { clicar: camada('Parede') },
      { clicar: camada('Telhado'), com: 'Shift' },
      { foto: true, destaque: [[obj('parede'), obj('telhado')], ferramenta('Unir')] },
      { clicar: ferramenta('Unir') },
      { clicar: camada('Bandeirola — o que sai') },
      { clicar: camada('Bandeirola'), com: 'Shift' },
      { foto: true, destaque: [[camada('Bandeirola — o que sai'), camada('Bandeirola')], ferramenta('Subtrair')] },
      { clicar: ferramenta('Subtrair') },
      { clicar: camada('Melancia') },
      { clicar: camada('Melancia — o que fica'), com: 'Shift' },
      { clicar: ferramenta('Intersectar') },
      { foto: true, destaque: [obj('parede'), obj('pano'), obj('melancia')] },
    ],
  },
  {
    vereda: V, topico: 'no-e-alca', cena: 'vetor-pedra',
    acoes: [
      { clicar: camada('Pedra') },
      { clicar: ferramenta('Editar nós') },
      { clicar: '[aria-label="Nó 2"]' },
      { foto: true, destaque: ['[aria-label="Nó 2"]', '.dz-secao[aria-label="Nó escolhido"]'] },
      { clicar: '.dz-secao[aria-label="Nó escolhido"] button:text-is("Canto")' },
      { foto: true, destaque: ['[aria-label="Nó 2"]', '.dz-secao[aria-label="Nó escolhido"] button:text-is("Canto")'] },
    ],
  },
  {
    vereda: V, topico: 'a-curva-de-bezier', cena: 'vetor-gota',
    acoes: [
      { clicar: ferramenta('Caneta') },
      { ponto: CANETA, em: [0.5, 0.15] },
      { ponto: CANETA, em: [0.675, 0.625], ate: [0.675, 0.775] },
      { foto: true, destaque: [ferramenta('Caneta')] },
      { ponto: CANETA, em: [0.325, 0.625], ate: [0.325, 0.475] },
      { ponto: CANETA, em: [0.5, 0.15] },
      { foto: true, destaque: CAMADAS },
    ],
  },
  {
    vereda: V, topico: 'dentro-e-borda', cena: 'vetor-etiqueta',
    acoes: [
      { clicar: camada('Etiqueta da mochila') },
      { foto: true, destaque: [obj('etiqueta'), [campo('Preenchimento'), campo('Espessura do traço')]] },
      { clicar: camada('Caminho do mapa') },
      { foto: true, destaque: [obj('mapa'), ['.dz-caixa:has-text("Sem preenchimento")', campo('Espessura do traço')]] },
    ],
  },
  {
    vereda: V, topico: 'espessura-e-extremidade', cena: 'vetor-pontas',
    acoes: [
      { foto: true, destaque: [obj('reta'), obj('redonda'), obj('quadrada')] },
      { clicar: camada('Ponta reta') },
      { escolher: campo('Extremidade do traço'), valor: 'redonda' },
      { foto: true, destaque: [obj('reta'), campo('Extremidade do traço')] },
    ],
  },
  {
    vereda: V, topico: 'camada-e-grupo', cena: 'vetor-bandeira',
    acoes: [
      { clicar: camada('Mastro') },
      { clicar: camada('Pano'), com: 'Shift' },
      { clicar: camada('Base'), com: 'Shift' },
      { foto: true, destaque: CAMADAS },
      { tecla: 'Control+g' },
      { foto: true, destaque: [CAMADAS, campo('Nome da camada')] },
      { clicar: campo('Nome da camada') },
      { tecla: 'Control+a' },
      { digitar: 'Bandeira da unidade' },
      { tecla: 'Enter' },
      { foto: true, destaque: CAMADAS },
    ],
  },
  {
    vereda: V, topico: 'alinhar-e-distribuir', cena: 'vetor-mochila',
    acoes: [
      { clicar: camada('Lanterna') },
      { tecla: 'Control+a' },
      { foto: true, destaque: [ICONES, ferramenta('Alinhar à base')] },
      { clicar: ferramenta('Alinhar à base') },
      { foto: true, destaque: [ICONES, ferramenta('Distribuir horizontalmente')] },
      { clicar: ferramenta('Distribuir horizontalmente') },
      { foto: true, destaque: [ICONES] },
    ],
  },
  {
    vereda: V, topico: 'a-fonte-mora-no-computador', cena: 'vetor-nome',
    acoes: [
      { clicar: camada('Nome do evento') },
      { foto: true, destaque: [obj('nome'), campo('Família')] },
      { clicar: menu('Objeto') },
      { foto: true, destaque: item('Converter em curvas') },
      { clicar: item('Converter em curvas') },
      { foto: true, destaque: [obj('nome'), CAMADAS] },
      { clicar: camada('Subtítulo') },
      { clicar: menu('Objeto') },
      { clicar: item('Converter em curvas') },
      { foto: true, destaque: '.dz-recado' },
    ],
  },
  {
    vereda: V, topico: 'converter-nao-tem-volta', cena: 'vetor-nome',
    acoes: [
      { clicar: '.dz-esquerda .dz-bt:has-text("Duplicar prancha")' },
      { clicar: camada('Nome do evento') },
      { clicar: menu('Objeto') },
      { clicar: item('Converter em curvas') },
      { foto: true, destaque: ['.dz-esquerda .dz-secao:first-child', '.dz-direita'] },
    ],
  },
  {
    vereda: V, topico: 'olhar-antes-de-desenhar', cena: 'vetor-escudo',
    acoes: [
      { foto: true, destaque: [CAMADAS, obj('e-topo'), obj('e-ponta'), obj('e-sol')] },
      { clicar: camada('Sol') },
      { foto: true, destaque: [obj('e-sol'), [campo('X'), campo('A')]] },
    ],
  },
  {
    vereda: V, topico: 'manter-a-proporcao', cena: 'vetor-proporcao',
    acoes: [
      { clicar: camada('Escudo') },
      { foto: true, destaque: [ESCUDO, [campo('L'), campo('A')]] },
      ...mudar('L', '192'),
      { foto: true, destaque: [ESCUDO, [campo('L'), campo('A')]] },
      { clicar: camada('Estrela') },
      ...mudar('L', '140'),
      { foto: true, destaque: [obj('estrela'), [campo('L'), campo('A')]] },
    ],
  },
  {
    vereda: V, topico: 'o-icone-pequeno', cena: 'vetor-lanterna',
    acoes: [
      { clicar: menu('Exibir') },
      { clicar: item('Ver em 64, 32 e 16 px') },
      { foto: true, destaque: '.dz-tamanhos' },
      { clicar: prancha('Lanterna simples') },
      { foto: true, destaque: '.dz-tamanhos' },
    ],
  },
  {
    vereda: V, topico: 'ver-em-tres-tamanhos', cena: 'vetor-lanterna',
    acoes: [
      { clicar: menu('Exibir') },
      { foto: true, destaque: item('Ver em 64, 32 e 16 px') },
      { clicar: item('Ver em 64, 32 e 16 px') },
      { foto: true, destaque: ['.dz-aba:text-is("Tamanhos")', '.dz-tamanhos'] },
    ],
  },
  {
    vereda: V, topico: 'svg-e-texto', cena: 'vetor-svg',
    acoes: [
      { clicar: menu('Arquivo') },
      { foto: true, destaque: item('Exportar como SVG') },
      { clicar: item('Exportar como SVG') },
      { clicar: tarefa('Editor de texto') },
      { foto: true, destaque: '.bn-editavel' },
    ],
  },
  {
    vereda: V, topico: 'mexer-com-a-mao', cena: 'vetor-svg',
    acoes: [
      { clicar: menu('Arquivo') },
      { clicar: item('Exportar como SVG') },
      { clicar: tarefa('Editor de texto') },
      { selecionar: '.bn-editavel', texto: 'y="200"' },
      { digitar: 'y="30"' },
      { tecla: 'Control+s' },
      { foto: true, destaque: ['.bn-editavel', '.bn-status'] },
      { clicar: tarefa('Editor de design') },
      { clicar: menu('Arquivo') },
      { foto: true, destaque: item('placa-de-saida.svg') },
      { clicar: item('placa-de-saida.svg') },
      { foto: true, destaque: obj('faixa') },
    ],
  },
];
