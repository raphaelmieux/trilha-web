/**
 * O arquivo de desenho vetorial do clube: as pranchas que a CC-DG002 abre.
 *
 * É o arranjo de `arteDoClube.ts` — um arquivo, nove lições, cada prancha com
 * o que a lição dela precisa e nada consertado de antemão — pelo motivo
 * escrito lá.
 *
 * ── As peças começam em formas, e não em caminhos ────────────────────────
 * A lição de booleanas recebe círculos e retângulos soltos, e não a lua já
 * desenhada: é combinando que a lua aparece. E a de curvas recebe a bandeira
 * de quinas e o guia ondulado ao lado, para que editar nós tenha de onde
 * partir e aonde chegar.
 */

import {
  comCaixaRefeita,
  type Arte, type Caminho, type Forma, type Foto, type Objeto, type Prancha, type Referencia, type Texto, type Traco,
} from './design';
import {
  booleana, contornoDaElipse, contornoDoPoligono, contornoDoRetangulo, moverNo, trocarTipo,
  type Contorno, type Ponto,
} from './vetor';

const LADO = 400;

const prancha = (id: string, nome: string, objetos: Objeto[], lado = LADO): Prancha =>
  ({ id, nome, largura: lado, altura: lado, fundo: '#FFFFFF', objetos });

const elipse = (id: string, nome: string, x: number, y: number, l: number, a: number, preenchimento: string): Forma =>
  ({ id, nome, tipo: 'elipse', x, y, largura: l, altura: a, preenchimento });

const retangulo = (id: string, nome: string, x: number, y: number, l: number, a: number, preenchimento: string): Forma =>
  ({ id, nome, tipo: 'retangulo', x, y, largura: l, altura: a, preenchimento });

export const caminho = (id: string, nome: string, contornos: Contorno[], preenchimento: string | null,
  traco: Traco | null = null): Caminho =>
  comCaixaRefeita<Caminho>({ id, nome, tipo: 'caminho', x: 0, y: 0, largura: 0, altura: 0, contornos, preenchimento, traco });

const poligono = (pts: Ponto[]) => contornoDoPoligono(pts);
const aberto = (pts: Ponto[]): Contorno => ({ ...contornoDoPoligono(pts), fechado: false });

const referencia = (id: string, nome: string, contornos: Contorno[]): Referencia =>
  comCaixaRefeita<Referencia>({ id, nome, tipo: 'referencia', x: 0, y: 0, largura: 0, altura: 0, contornos, opacidade: 0.25 });

/* ── Módulo 1: o mesmo emblema em vetor, e uma foto em pontos ────────────── */

export const EMBLEMA = 'emblema';
export const FOTO_EM_PONTOS = 'foto';
export const EMBLEMA_E_FOTO = prancha(EMBLEMA, 'Emblema e foto', [
  elipse('circulo', 'Círculo do emblema', 40, 120, 150, 150, '#1B4D3E'),
  caminho('barraca', 'Barraca do emblema', [poligono([{ x: 115, y: 150 }, { x: 160, y: 235 }, { x: 70, y: 235 }])], '#F2C14E'),
  {
    id: FOTO_EM_PONTOS, nome: 'Foto da serra', tipo: 'foto', motivo: 'trilha',
    x: 215, y: 120, largura: 150, altura: 150, tons: ['#2F4A3A', '#E8EEF2'], resolucao: 32,
  } satisfies Foto,
  texto('rotulo-vetor', 'Rótulo do vetor', 'Vetor', 40, 290, 150),
  texto('rotulo-pontos', 'Rótulo da foto', 'Imagem de pontos', 215, 290, 150),
]);

function texto(id: string, nome: string, t: string, x: number, y: number, largura: number, extra: Partial<Texto> = {}): Texto {
  return {
    id, nome, tipo: 'texto', texto: t, x, y, largura,
    familia: 'Arial', peso: 700, corpo: 16, entrelinha: 1.4, cor: '#1F2A24', alinhamento: 'centro', ...extra,
  };
}

/* ── Módulo 2: formas soltas que viram quatro ícones ─────────────────────── */

export const ICONES = 'icones';
export const ICONES_SOLTOS = prancha(ICONES, 'Ícones do acampamento', [
  caminho('lona', 'Lona da barraca', [poligono([{ x: 90, y: 30 }, { x: 160, y: 140 }, { x: 20, y: 140 }])], '#C13516'),
  retangulo('porta', 'Porta da barraca', 78, 95, 24, 45, '#9AA0A6'),
  elipse('lua-a', 'Lua', 220, 30, 110, 110, '#F2C14E'),
  elipse('lua-b', 'Lua — o que sai', 255, 15, 110, 110, '#9AA0A6'),
  elipse('folha-a', 'Folha', 20, 220, 130, 130, '#3F8F3F'),
  elipse('folha-b', 'Folha — a outra metade', 80, 220, 130, 130, '#9AA0A6'),
  elipse('nuvem-a', 'Nuvem 1', 220, 270, 70, 70, '#9AB8D8'),
  elipse('nuvem-b', 'Nuvem 2', 260, 240, 90, 90, '#9AB8D8'),
  elipse('nuvem-c', 'Nuvem 3', 315, 275, 70, 70, '#9AB8D8'),
]);

/* ── Módulo 3: a bandeira de quinas, e o guia da folha ───────────────────── */

export const CURVAS = 'curvas';

const BANDEIRA_DE_QUINAS = poligono([
  { x: 40, y: 50 }, { x: 130, y: 50 }, { x: 220, y: 50 },
  { x: 220, y: 150 }, { x: 130, y: 150 }, { x: 40, y: 150 },
]);

/**
 * A bandeira ondulada: os dois nós do meio viram suaves e sobem vinte.
 *
 * É a mesma operação que a lição pede — trocar o tipo e mover —, e não um
 * desenho à parte: o guia sai do que os comandos do editor fazem, e por isso
 * quem os usa chega nele.
 */
export const BANDEIRA_ONDULADA: Contorno = (() => {
  let c = trocarTipo(trocarTipo(BANDEIRA_DE_QUINAS, 1, 'suave'), 4, 'suave');
  c = moverNo(c, 1, 130, 30);
  c = moverNo(c, 4, 130, 130);
  return c;
})();

/** A folha que a caneta tem de seguir: a lente entre dois círculos. */
export const FOLHA_GUIA: Contorno[] = booleana(
  [contornoDaElipse(100, 140, 200, 200)], [contornoDaElipse(100, 240, 200, 200)], 'intersecao');

export const CURVAS_E_FOLHA = prancha(CURVAS, 'Bandeira e folha', [
  referencia('guia-bandeira', 'Guia da bandeira', [BANDEIRA_ONDULADA]),
  referencia('guia-folha', 'Guia da folha', FOLHA_GUIA),
  caminho('bandeira', 'Bandeira', [BANDEIRA_DE_QUINAS], '#C13516'),
]);

/* ── Módulo 4: a placa da trilha, com traço fino e seta preenchida ───────── */

export const PLACA = 'placa';
export const PLACA_DA_TRILHA = prancha(PLACA, 'Placa da trilha', [
  elipse('placa', 'Placa', 80, 60, 240, 240, '#F2C14E'),
  caminho('trilha', 'Trilha', [aberto([{ x: 130, y: 240 }, { x: 170, y: 180 }, { x: 210, y: 220 }, { x: 255, y: 145 }])], null,
    { cor: '#1F2A24', espessura: 2, extremidade: 'reta' }),
  caminho('seta', 'Seta', [aberto([{ x: 232, y: 140 }, { x: 260, y: 138 }, { x: 266, y: 165 }])], '#1F2A24',
    { cor: '#1F2A24', espessura: 2, extremidade: 'reta' }),
]);

/* ── Módulo 5: três ícones desmontados ───────────────────────────────────── */

export const TRES_ICONES = 'tres-icones';
export const PECAS: Record<'barraca' | 'fogueira' | 'arvore', string[]> = {
  barraca: ['b-lona', 'b-porta'],
  fogueira: ['f-lenha-1', 'f-lenha-2', 'f-chama'],
  arvore: ['a-tronco', 'a-copa'],
};
export const TRES_ICONES_SOLTOS = prancha(TRES_ICONES, 'Três ícones', [
  caminho('b-lona', 'Lona', [poligono([{ x: 70, y: 110 }, { x: 125, y: 200 }, { x: 15, y: 200 }])], '#C13516'),
  retangulo('b-porta', 'Porta', 61, 168, 18, 32, '#7A1F2B'),
  retangulo('f-lenha-1', 'Lenha 1', 160, 232, 76, 12, '#7A4B12'),
  retangulo('f-lenha-2', 'Lenha 2', 168, 220, 60, 12, '#8A5A20'),
  elipse('f-chama', 'Chama', 180, 160, 36, 60, '#E07A1F'),
  retangulo('a-tronco', 'Tronco', 318, 262, 14, 38, '#7A4B12'),
  elipse('a-copa', 'Copa', 292, 196, 66, 72, '#3F8F3F'),
]);

/* ── Módulo 6: o nome do clube, em Space Mono ────────────────────────────── */

export const ASSINATURA = 'assinatura';
export const NOME_DO_CLUBE = 'PIONEIROS';
export const ASSINATURA_DO_CLUBE = prancha(ASSINATURA, 'Assinatura do clube', [
  elipse('emblema', 'Emblema', 150, 50, 100, 100, '#1B4D3E'),
  texto('nome', 'Nome do clube', NOME_DO_CLUBE, 40, 180, 320,
    { familia: 'Space Mono', corpo: 44, entrelinha: 1.2, cor: '#1B4D3E' }),
]);

/* ── Módulo 7: o logotipo que o examinador entregou ──────────────────────── */

export const LOGOTIPO = 'logotipo';

/**
 * O logotipo pedido: um anel, a barraca dentro, e o chão embaixo.
 *
 * Ele é referência, e não vetor: a pessoa vê o desenho por baixo, a 25%, e
 * reproduz com as próprias formas — o anel sai de um círculo menos outro, que
 * é a lição de booleanas usada de verdade.
 */
export const LOGOTIPO_PEDIDO: Contorno[] = (() => {
  const anel = booleana([contornoDaElipse(20, 20, 160, 160)], [contornoDaElipse(45, 45, 110, 110)], 'subtracao');
  const barraca = [poligono([{ x: 100, y: 60 }, { x: 145, y: 140 }, { x: 55, y: 140 }])];
  const chao = [contornoDoRetangulo(10, 165, 180, 18)];
  return booleana(booleana(anel, barraca, 'uniao'), chao, 'uniao');
})();

export const LOGOTIPO_DO_EXAMINADOR = prancha(LOGOTIPO, 'Logotipo do examinador', [
  referencia('modelo', 'Logotipo entregue', LOGOTIPO_PEDIDO),
]);

/* ── Módulos 8 e 9: o ícone próprio ──────────────────────────────────────── */

export const ICONE = 'icone';
export const LADO_DO_ICONE = 256;
export const ICONE_VAZIO = prancha(ICONE, 'Meu ícone', [], LADO_DO_ICONE);

/* ── O arquivo ───────────────────────────────────────────────────────────── */

export const ARTE_VETORIAL: Arte = {
  pranchas: [
    EMBLEMA_E_FOTO, ICONES_SOLTOS, CURVAS_E_FOLHA, PLACA_DA_TRILHA, TRES_ICONES_SOLTOS,
    ASSINATURA_DO_CLUBE, LOGOTIPO_DO_EXAMINADOR, ICONE_VAZIO,
  ],
  paleta: { fundo: '#FFFFFF', texto: '#1F2A24', destaque: '#C13516', apoio: '#F2C14E', neutro: '#9AA0A6' },
};
