import type { Acao, Roteiro } from '../roteiros';
import {
  ALTURA_DO_EMBLEMA, ALTURA_DO_LAGO, CLIQUES_NO_PISO, LARGURA_DO_EMBLEMA, LARGURA_DO_LAGO, RECORTE_DO_LAGO,
  TOLERANCIA_DO_PISO, INCLINACAO_DO_LAGO,
} from '../fotosDeExemplo';

/* CC-DG003 Imagem Digital, no editor de foto. */

const V = 'CC-DG003';
const TELA = '.ft-tela[aria-label="Área da imagem"]';
const ferramenta = (rotulo: string) => `.ft-ferramentas button[aria-label="${rotulo}"]`;
const campo = (rotulo: string) => `.ft-entrada[aria-label="${rotulo}"]`;
const menu = (nome: string) => `.ft-menu-botao:text-is("${nome}")`;
const item = (nome: string) => `.ft-menu-item:has-text("${nome}")`;
const painel = (nome: string) => `.ft-painel[aria-label="${nome}"]`;
const botao = (nome: string) => `.ft-botao:text-is("${nome}")`;
const dialogo = (nome: string) => `.ft-dialogo[aria-label="${nome}"]`;
const STATUS = '.ft-status';
const INFO = painel('Info');

const mudar = (rotulo: string, valor: string): Acao[] => [
  { clicar: campo(rotulo) }, { tecla: 'Control+a' }, { digitar: valor },
];

/* Um pixel da foto em fração da área da imagem. O quarto de pixel a mais
   evita que o arredondamento do editor caia no vizinho. */
const naFoto = (x: number, y: number, l: number, a: number): [number, number] => [(x + 0.25) / l, (y + 0.25) / a];
const RETO = { l: RECORTE_DO_LAGO.l, a: RECORTE_DO_LAGO.a };
const noLago = (x: number, y: number) => naFoto(x, y, LARGURA_DO_LAGO, ALTURA_DO_LAGO);
const noReto = (x: number, y: number) => naFoto(x, y, RETO.l, RETO.a);
const noEmblema = (x: number, y: number) => naFoto(x, y, LARGURA_DO_EMBLEMA, ALTURA_DO_EMBLEMA);

/** O pixel do céu e o da placa que o conta-gotas lê nas telas. `exemplosDaImagemDigital.test.ts` os relê. */
export const PIXEL_DO_CEU = { x: 900, y: 150 };
export const PIXEL_DA_PLACA = { x: 320, y: 595 };

const endireitar: Acao[] = [
  { clicar: ferramenta('Recortar (C)') },
  ...mudar('Endireitar (graus)', String(-INCLINACAO_DO_LAGO)),
];
const recorte: Acao[] = [
  ...mudar('X do recorte', String(RECORTE_DO_LAGO.x)),
  ...mudar('Y do recorte', String(RECORTE_DO_LAGO.y)),
  ...mudar('Largura do recorte', String(RECORTE_DO_LAGO.l)),
  ...mudar('Altura do recorte', String(RECORTE_DO_LAGO.a)),
];
const sobreOCone: Acao = { ponto: TELA, em: noReto(1398, 905), ate: noReto(1398, 1000) };
const PISO: Acao[] = [
  { clicar: ferramenta('Varinha (W)') },
  ...mudar('Tolerância', String(TOLERANCIA_DO_PISO)),
];
const cliquesNoPiso = CLIQUES_NO_PISO.map((p, i): Acao => ({ ponto: TELA, em: noEmblema(p.x, p.y), ...(i ? { com: 'Shift' as const } : {}) }));
const excluirEDesmarcar: Acao[] = [
  { clicar: menu('Editar') }, { clicar: item('Excluir') },
  { clicar: menu('Seleção') }, { clicar: item('Desmarcar') },
];
const semPiso: Acao[] = [...PISO, ...cliquesNoPiso, ...excluirEDesmarcar];
const exportarComo: Acao[] = [{ clicar: menu('Arquivo') }, { clicar: item('Exportar como') }];
const formato = (f: string): Acao => ({ escolher: campo('Formato'), valor: f });
const TAMANHO_DO_ARQUIVO = `${dialogo('Exportar como')} .ft-info`;

const L = 1600;
const A = 1000;

export const ROTEIROS_DA_IMAGEM_DIGITAL: Roteiro[] = [
  {
    vereda: V, topico: 'o-quadradinho', cena: 'foto-lago', largura: L, altura: A,
    acoes: [
      { foto: true, destaque: STATUS },
      { clicar: ferramenta('Conta-gotas (I)') },
      { ponto: TELA, em: noLago(PIXEL_DO_CEU.x, PIXEL_DO_CEU.y) },
      { foto: true, destaque: [ferramenta('Conta-gotas (I)'), INFO] },
    ],
  },
  {
    vereda: V, topico: 'ampliar-a-foto', cena: 'foto-miniatura', largura: L, altura: A,
    acoes: [
      { clicar: menu('Exibir') },
      { clicar: item('800%') },
      { foto: true, destaque: STATUS },
      { clicar: menu('Imagem') },
      { clicar: item('Tamanho da imagem') },
      ...mudar('Largura (px)', '1000'),
      { foto: true, destaque: [campo('Largura (px)'), 'input[aria-label="Reamostrar"]'] },
      { clicar: botao('OK') },
      { clicar: menu('Exibir') },
      { clicar: item('Antes e depois') },
      { foto: true, destaque: '.ft-comparar' },
    ],
  },
  {
    vereda: V, topico: 'o-horizonte', cena: 'foto-lago', largura: L, altura: A,
    acoes: [
      { clicar: ferramenta('Recortar (C)') },
      { foto: true, destaque: TELA },
      ...endireitar,
      { foto: true, destaque: [TELA, campo('Endireitar (graus)')] },
    ],
  },
  {
    vereda: V, topico: 'o-recorte', cena: 'foto-lago', largura: L, altura: A,
    acoes: [
      ...endireitar,
      ...recorte,
      { foto: true, destaque: [[campo('X do recorte'), campo('Altura do recorte')]] },
      { clicar: botao('Aplicar recorte') },
      { foto: true, destaque: STATUS },
    ],
  },
  {
    vereda: V, topico: 'o-histograma', cena: 'foto-lago-reto', largura: L, altura: A,
    acoes: [
      { foto: true, destaque: painel('Histograma') },
      ...mudar('Exposição', '0.8'),
      { foto: true, destaque: [campo('Exposição'), painel('Histograma')] },
      ...mudar('Exposição', '2.5'),
      { foto: true, destaque: [campo('Exposição'), painel('Histograma')] },
    ],
  },
  {
    vereda: V, topico: 'os-tres-ajustes', cena: 'foto-lago-reto', largura: L, altura: A,
    acoes: [
      { clicar: ferramenta('Conta-gotas (I)') },
      { ponto: TELA, em: noReto(PIXEL_DA_PLACA.x, PIXEL_DA_PLACA.y) },
      { foto: true, destaque: INFO },
      ...mudar('Exposição', '0.8'),
      ...mudar('Contraste', '28'),
      ...mudar('Temperatura', '-50'),
      { foto: true, destaque: [[campo('Exposição'), campo('Temperatura')]] },
      { clicar: botao('Aplicar ajustes') },
      { ponto: TELA, em: noReto(PIXEL_DA_PLACA.x, PIXEL_DA_PLACA.y) },
      { foto: true, destaque: INFO },
    ],
  },
  {
    vereda: V, topico: 'o-carimbo', cena: 'foto-lago-ajustado', largura: L, altura: A,
    acoes: [
      { clicar: ferramenta('Carimbo (S)') },
      ...mudar('Raio do pincel', '45'),
      { ponto: TELA, em: noReto(1290, 955) },
      { foto: true, destaque: [ferramenta('Carimbo (S)'), painel('Carimbo')] },
      sobreOCone,
      { foto: true, destaque: painel('Carimbo') },
    ],
  },
  {
    vereda: V, topico: 'remendo-liso', cena: 'foto-lago-ajustado', largura: L, altura: A,
    acoes: [
      { clicar: ferramenta('Pincel (B)') },
      ...mudar('Raio do pincel', '45'),
      sobreOCone,
      { foto: true, destaque: [ferramenta('Pincel (B)'), 'input[aria-label="Cor do pincel"]'] },
    ],
  },
  {
    vereda: V, topico: 'as-camadas', cena: 'foto-lago-ajustado', largura: L, altura: A,
    acoes: [
      { clicar: menu('Camada') },
      { foto: true, destaque: item('Duplicar camada') },
      { clicar: item('Duplicar camada') },
      { foto: true, destaque: painel('Camadas') },
    ],
  },
  {
    vereda: V, topico: 'a-mascara', cena: 'foto-lago-ajustado', largura: L, altura: A,
    acoes: [
      { clicar: menu('Camada') },
      { clicar: item('Duplicar camada') },
      ...mudar('Exposição', '1'),
      { clicar: botao('Aplicar ajustes') },
      { foto: true, destaque: painel('Camadas') },
      { clicar: ferramenta('Varinha (W)') },
      { ponto: TELA, em: noReto(1120, 733) },
      { foto: true, destaque: [ferramenta('Varinha (W)'), STATUS] },
      { clicar: menu('Camada') },
      { clicar: item('Adicionar máscara') },
      { foto: true, destaque: painel('Camadas') },
    ],
  },
  {
    vereda: V, topico: 'o-canal', cena: 'foto-emblema', largura: L, altura: A,
    acoes: [
      ...semPiso,
      { foto: true, destaque: TELA },
    ],
  },
  {
    vereda: V, topico: 'tirar-o-fundo', cena: 'foto-emblema', largura: L, altura: A,
    acoes: [
      ...PISO,
      cliquesNoPiso[0],
      { foto: true, destaque: [ferramenta('Varinha (W)'), campo('Tolerância')] },
      ...cliquesNoPiso.slice(1),
      { foto: true, destaque: `${painel('Varinha')} .ft-ajuda` },
      ...excluirEDesmarcar,
      ...exportarComo,
      formato('png'),
      { foto: true, destaque: [campo('Formato'), TAMANHO_DO_ARQUIVO] },
      formato('jpg'),
      { foto: true, destaque: ['.ft-previa', TAMANHO_DO_ARQUIVO] },
    ],
  },
  {
    vereda: V, topico: 'pontos-por-polegada', cena: 'foto-lago', largura: L, altura: A,
    acoes: [
      { foto: true, destaque: STATUS },
      { clicar: menu('Imagem') },
      { clicar: item('Tamanho da imagem') },
      { clicar: 'input[aria-label="Reamostrar"]' },
      ...mudar('Resolução (ppi)', '300'),
      { foto: true, destaque: [['input[aria-label="Reamostrar"]', `${dialogo('Tamanho da imagem')} .ft-info`]] },
    ],
  },
  {
    vereda: V, topico: 'tela-e-papel', cena: 'foto-lago-ajustado', largura: L, altura: A,
    acoes: [
      { clicar: menu('Imagem') },
      { clicar: item('Tamanho da imagem') },
      ...mudar('Largura (px)', '1080'),
      { foto: true, destaque: [campo('Largura (px)'), `${dialogo('Tamanho da imagem')} .ft-info`] },
      { clicar: '.ft-botao-claro:text-is("Cancelar")' },
      { clicar: menu('Imagem') },
      { clicar: item('Tamanho da imagem') },
      { clicar: 'input[aria-label="Reamostrar"]' },
      ...mudar('Resolução (ppi)', '240'),
      { foto: true, destaque: [campo('Resolução (ppi)'), `${dialogo('Tamanho da imagem')} .ft-info`] },
    ],
  },
  {
    vereda: V, topico: 'com-e-sem-perda', cena: 'foto-lago-ajustado', largura: L, altura: A,
    acoes: [
      ...exportarComo,
      formato('tiff'),
      { foto: true, destaque: [campo('Formato'), TAMANHO_DO_ARQUIVO] },
      formato('png'),
      { foto: true, destaque: [campo('Formato'), TAMANHO_DO_ARQUIVO] },
      formato('jpg'),
      { foto: true, destaque: [campo('Qualidade'), TAMANHO_DO_ARQUIVO] },
      ...mudar('Qualidade', '5'),
      { foto: true, destaque: ['.ft-previa', TAMANHO_DO_ARQUIVO] },
    ],
  },
  {
    vereda: V, topico: 'cada-formato-o-seu', cena: 'foto-lago-ajustado', largura: L, altura: A,
    acoes: [
      ...exportarComo,
      formato('webp'),
      { foto: true, destaque: [campo('Formato'), TAMANHO_DO_ARQUIVO] },
      { clicar: '.ft-botao-claro:text-is("Cancelar")' },
      { clicar: menu('Imagem') },
      { clicar: item('Tamanho da imagem') },
      ...mudar('Largura (px)', '1200'),
      { clicar: botao('OK') },
      ...exportarComo,
      ...mudar('Qualidade', '75'),
      { foto: true, destaque: [campo('Qualidade'), TAMANHO_DO_ARQUIVO] },
    ],
  },
  {
    vereda: V, topico: 'antes-e-depois', cena: 'foto-lago-comparar', largura: L, altura: A,
    acoes: [
      { clicar: menu('Exibir') },
      { foto: true, destaque: item('Antes e depois') },
      { clicar: item('Antes e depois') },
      { foto: true, destaque: '.ft-comparar' },
    ],
  },
];
