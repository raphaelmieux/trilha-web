/**
 * O tipo do VM do Scratch, do tamanho do que usamos.
 *
 * O `scratch-vm` não traz tipos, e escrever `any` no laboratório espalharia a
 * ausência deles por toda a tela. Aqui fica a superfície que de fato tocamos —
 * quatro métodos —, e o resto do código volta a ser conferido pelo compilador.
 */
export interface VmDeScratch {
  /** Carrega um projeto em sb3. É como o laboratório entrega o modelo. */
  loadProject: (projeto: string) => Promise<void>;
  /** Devolve o projeto em sb3. É por aqui que o validador lê o que foi montado. */
  toJSON: () => string;
  greenFlag: () => void;
  stopAll: () => void;
  on: (evento: string, ouvinte: (...args: unknown[]) => void) => void;
  off: (evento: string, ouvinte: (...args: unknown[]) => void) => void;
  /** Diz ao VM de onde buscar fantasias e sons. Ver `armazenamento.ts`. */
  attachStorage: (armazenamento: unknown) => void;
  /** O motor. Do que se lê daqui: `renderer` só existe depois que o editor
      montou o palco, e é o sinal de que dá para carregar o projeto. */
  runtime?: { renderer?: unknown; targets?: unknown[]; storage?: unknown };
}
