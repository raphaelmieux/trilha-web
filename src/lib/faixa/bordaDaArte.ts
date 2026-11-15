/*
  O contorno e a cor da beirada de uma arte de patch, lidos do próprio arquivo.

  O overloque de um patch bordado segue a forma dele e tem a cor da borda dele.
  As duas coisas moram na arte: o oval de uma especialidade, os cantos
  arredondados da tarja do ME006, o azul das HM e o vermelho das AP. Ler daqui
  é a regra das pastas de arte — o arquivo é a fonte da verdade, e não uma lista
  por código que alguém teria de lembrar de mudar quando uma arte nova chegasse.

  O contorno sai da transparência: 240 raios a partir do centro, cada um
  parando no último pixel opaco. Um retângulo arredondado desenhado à mão errava
  os cantos do ME006 no P1, e o overloque saía para fora da tarja onde ela fecha.

  A leitura pede canvas. Onde não há (no jsdom, ou se a arte não carregar), a
  função devolve `null`, e o patch fica com o oval vermelho de reserva.
*/

export interface BordaDaArte {
  /** O contorno, num quadro de 0 a 1000 nos dois eixos. */
  contorno: string;
  /** A cor dominante da beirada. */
  cor: string;
}

const RAIOS = 240;
const LADO = 200;
const lidas = new Map<string, Promise<BordaDaArte | null>>();

/** Lê uma vez por arquivo: são treze patches na tela, e alguns repetem a mesma arte. */
export function bordaDaArte(src: string): Promise<BordaDaArte | null> {
  const ja = lidas.get(src);
  if (ja) return ja;
  const lendo = ler(src);
  lidas.set(src, lendo);
  return lendo;
}

function ler(src: string): Promise<BordaDaArte | null> {
  return new Promise(resolve => {
    if (typeof Image === 'undefined' || typeof document === 'undefined') { resolve(null); return; }
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = LADO;
        canvas.height = LADO;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) { resolve(null); return; }
        ctx.drawImage(img, 0, 0, LADO, LADO);
        resolve(contornoDosPixels(ctx.getImageData(0, 0, LADO, LADO).data, LADO));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * A conta, separada da leitura para se testar sem canvas: dado um quadrado de
 * pixels RGBA, o contorno da parte opaca e a cor dela perto da borda.
 */
export function contornoDosPixels(dados: Uint8ClampedArray, lado: number): BordaDaArte | null {
  const alfa = (x: number, y: number) => dados[(y * lado + x) * 4 + 3];
  const c = lado / 2;
  const pontos: [number, number][] = [];
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < RAIOS; i++) {
    const a = (i / RAIOS) * 2 * Math.PI;
    const cos = Math.cos(a), sin = Math.sin(a);
    let ultimo = -1;
    for (let d = 0; d < lado; d += 0.5) {
      const x = Math.round(c + d * cos), y = Math.round(c + d * sin);
      if (x < 0 || y < 0 || x >= lado || y >= lado) break;
      if (alfa(x, y) > 128) ultimo = d;
    }
    if (ultimo < 0) continue;
    pontos.push([c + ultimo * cos, c + ultimo * sin]);
    /* A cor da beirada: um passo para dentro do último pixel opaco, onde a
       borda bordada da arte mora. */
    const dentro = Math.max(0, ultimo - 2);
    const x = Math.round(c + dentro * cos), y = Math.round(c + dentro * sin);
    const k = (y * lado + x) * 4;
    r += dados[k]; g += dados[k + 1]; b += dados[k + 2]; n++;
  }
  if (pontos.length < RAIOS / 2 || n === 0) return null;
  const escala = 1000 / lado;
  const contorno = pontos.map(([x, y], i) => `${i ? 'L' : 'M'} ${(x * escala).toFixed(1)} ${(y * escala).toFixed(1)}`).join(' ') + ' Z';
  const hex = (v: number) => Math.round(v / n).toString(16).padStart(2, '0');
  return { contorno, cor: `#${hex(r)}${hex(g)}${hex(b)}` };
}
