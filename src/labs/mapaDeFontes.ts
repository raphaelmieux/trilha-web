/**
 * A linha do `.tsx` que gerou uma linha do JavaScript.
 *
 * O erro que escapa na página aponta o JavaScript que o compilador gerou, e
 * o JSX gerado não fica nas mesmas linhas do escrito: um elemento de cinco
 * linhas vira uma chamada numa só. O navegador de verdade traduz isso pelo
 * mapa de fontes que o Vite serve junto, e o console mostra `App.tsx:12`.
 * A pilha que chega ao bastidor não passa por essa tradução — ela é do
 * console, e não da pilha —, então quem traduz é a tela, com o mesmo mapa
 * que o TypeScript gerou.
 *
 * É a parte do formato que importa aqui: as linhas são separadas por `;`, os
 * trechos por `,`, e cada trecho é uma lista de números em VLQ de base 64,
 * relativos ao trecho anterior. Só a linha de origem do primeiro trecho de
 * cada linha gerada interessa.
 */
const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function decodificar(trecho: string): number[] {
  const numeros: number[] = [];
  let valor = 0;
  let deslocamento = 0;
  for (const c of trecho) {
    const d = BASE64.indexOf(c);
    if (d < 0) return numeros;
    valor += (d & 31) << deslocamento;
    if (d & 32) { deslocamento += 5; continue; }
    numeros.push(valor & 1 ? -(valor >>> 1) : valor >>> 1);
    valor = 0;
    deslocamento = 0;
  }
  return numeros;
}

/** Para cada linha gerada (a partir de 1), a linha de origem — ou `null` se a linha não veio de lugar nenhum. */
export function linhasDeOrigem(mapa: string): (number | null)[] {
  let dados: { mappings?: string };
  try { dados = JSON.parse(mapa); } catch { return []; }
  const saida: (number | null)[] = [];
  let linhaDeOrigem = 0;
  for (const linha of (dados.mappings ?? '').split(';')) {
    let primeira: number | null = null;
    for (const trecho of linha.split(',')) {
      if (!trecho) continue;
      const n = decodificar(trecho);
      if (n.length >= 4) {
        linhaDeOrigem += n[2];
        if (primeira === null) primeira = linhaDeOrigem + 1;
      }
    }
    saida.push(primeira);
  }
  return saida;
}

/** A linha de origem de uma linha gerada. Sem mapa, ou sem trecho naquela linha, devolve a mesma. */
export function linhaOriginal(mapa: string | null, linhaGerada: number): number {
  if (!mapa) return linhaGerada;
  const linhas = linhasDeOrigem(mapa);
  for (let l = linhaGerada; l >= 1; l--) {
    const o = linhas[l - 1];
    if (o !== null && o !== undefined) return o;
  }
  return linhaGerada;
}
