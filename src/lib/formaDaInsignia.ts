import { CLASSES, type NivelDaInsignia } from './nivelDaInsignia';

/*
 * O desenho da insígnia: o polígono da classe e onde o glifo se encaixa nele.
 *
 * Mora aqui, e não no componente, porque o **PDF precisa do mesmo desenho**.
 * O relatório é gerado pelo jsPDF, que não monta React: se a forma fosse
 * escrita no JSX, o papel entregue ao clube mostraria o círculo antigo e a
 * tela mostraria o heptágono. É a mesma decisão de `word.tsx` e `excel.tsx` —
 * duas cópias divergem no primeiro ajuste.
 */

/** A caixa em que toda insígnia é desenhada. */
export const ALTURA = 26;
/*
  A largura é maior que a altura por causa do triângulo, e só dele: um
  triângulo equilátero de altura 26 tem 30,02 de base. Todas as sete formas
  usam a mesma caixa para alinharem em coluna na estante — as outras seis
  apenas não chegam nas beiradas.
*/
export const LARGURA = 30.1;

/*
  O glifo tem o mesmo tamanho nas sete formas, e "mesmo tamanho" é o círculo
  que a tinta de fato ocupa — não um fator de escala.

  Com fator único, a chama sai 28% menor que o troféu: os catorze desenhos
  preenchem a caixa de 24 de maneiras muito diferentes, e a insígnia passa a
  parecer desalinhada sem que nada esteja errado. Normalizando pelo raio da
  tinta, os catorze ocupam exatamente o mesmo disco.

  61,8% da altura, em diâmetro. O número é escolha de proporção, e o que ele
  precisa respeitar é o triângulo: o círculo inscrito de um triângulo de
  altura H tem raio H/3, então o glifo cabe enquanto 0,618/2 < 1/3 — sobra
  7,9%. Aumentar isto para 66,7% encosta na parede, e acima disso o glifo
  vaza pelos lados do Amigo e do Companheiro, e só nesses dois.
*/
export const RAIO_DO_GLIFO = 0.618 * ALTURA / 2;

/** Espessura do traço do glifo, já na escala final da caixa. */
export const TRACO_DO_GLIFO = 1.55;

export interface Forma {
  /** Os vértices, prontos para o atributo `points` de um `<polygon>`. */
  pontos: string;
  /** O centro do polígono, que é onde o glifo se centra — e não o da caixa. */
  centroX: number;
  centroY: number;
  /** Raio do círculo inscrito: o maior glifo que cabe sem vazar. */
  raioInscrito: number;
}

/**
 * O polígono de uma classe, de altura fixa.
 *
 * Os três casos existem porque a altura de um polígono regular depende de como
 * ele se apoia: o triângulo mede 1,5 circunraio, um de lados ímpares mede
 * `R(1 + cos(π/n))`, e um de lados pares mede `2R` porque tem vértice em cima
 * e embaixo. Travar o circunraio em vez da altura deixaria as sete formas com
 * tamanhos diferentes na mesma fileira.
 */
export function formaDaClasse(nivel: NivelDaInsignia): Forma {
  const { lados: n, invertido = false } = CLASSES[nivel];
  let R: number;
  let centroY: number;
  if (n === 3) {
    /* O centro de um triângulo é o centroide, a 2/3 da altura desde o ápice —
       e não o meio da caixa. Centrar o glifo no meio da caixa o empurraria
       para fora pela ponta. */
    R = (2 * ALTURA) / 3;
    centroY = invertido ? ALTURA - R : R;
  } else if (n % 2) {
    R = ALTURA / (1 + Math.cos(Math.PI / n));
    centroY = R;
  } else {
    R = ALTURA / 2;
    centroY = R;
  }
  const centroX = LARGURA / 2;
  const inicio = invertido ? Math.PI / 2 : -Math.PI / 2;
  const pontos = Array.from({ length: n }, (_, i) => {
    const a = inicio + (2 * Math.PI * i) / n;
    return `${(centroX + R * Math.cos(a)).toFixed(2)},${(centroY + R * Math.sin(a)).toFixed(2)}`;
  }).join(' ');
  return { pontos, centroX, centroY, raioInscrito: R * Math.cos(Math.PI / n) };
}

/**
 * A transformação que põe um glifo de 24×24 dentro da forma.
 *
 * `escala` normaliza pelo raio da tinta daquele desenho; `traco` desfaz a
 * escala, senão o glifo mais reduzido sairia com o traço mais fino e os
 * catorze teriam espessuras diferentes na mesma fileira.
 */
export function encaixeDoGlifo(forma: Forma, raioDaTinta: number) {
  const escala = RAIO_DO_GLIFO / raioDaTinta;
  return {
    transform: `translate(${forma.centroX} ${forma.centroY.toFixed(2)}) `
      + `scale(${escala.toFixed(4)}) translate(-12 -12)`,
    traco: TRACO_DO_GLIFO / escala,
  };
}

/*
  Branco ou quase-preto sobre a cor da classe — o que medir mais contraste.

  Escolher por limiar de luminosidade erra na fronteira: o cinza do Pioneiro
  fica a 0,335, logo abaixo de um corte "acima de 0,35 usa escuro", e receberia
  glifo branco a 2,7:1. Comparar as duas contas e ficar com a maior não tem
  fronteira onde errar.
*/
const CLARO = '#FFFFFF';
const ESCURO = '#141007';

function luminancia(hex: string): number {
  const canais = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = canais.map(c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contraste(a: string, b: string): number {
  const [la, lb] = [luminancia(a), luminancia(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** A cor do glifo sobre um fundo: a que se lê melhor em cima dele. */
export const corDoGlifo = (fundo: string): string =>
  contraste(CLARO, fundo) >= contraste(ESCURO, fundo) ? CLARO : ESCURO;

/*
  As de horário não têm classe, e por isso não têm forma.

  Coruja, Madrugador, Fim de Semana e Semana Inteira medem **quando** se
  estuda, não quanto — não são acúmulo e não formam escada. Dar a elas uma das
  sete classes seria fingir uma ordem que não existe; inventar cinco degraus
  para completar a escada seria inventar conquista que ninguém pediu. Ficam em
  círculo off-white, que é a forma que nenhuma classe usa, e é assim que se lê
  que elas são de outra natureza.
*/
export const CIRCULO_SEM_CLASSE = '#FAF9F6';
