import type { Bloco, Categoria, TipoDeBloco } from './blocos';

/**
 * O que a paleta oferece, e com que valores o bloco nasce.
 *
 * Mora fora do arquivo de componentes pela mesma razão que `ICONE_DA_LICAO`:
 * exportar constante junto com componente desliga o recarregamento rápido do
 * Vite, e a lista de blocos é justamente o que mais se mexe enquanto se
 * escreve uma lição.
 */

/** Um bloco de exemplo por tipo — é o que a paleta mostra e o que ela entrega. */
export const MODELOS: Record<Categoria, TipoDeBloco[]> = {
  eventos: ['quandoBandeira', 'quandoTecla', 'quandoClicado'],
  movimento: ['mover', 'subir', 'irPara'],
  aparencia: ['proximaFantasia', 'diga'],
  som: ['toqueSom'],
  controle: ['espere', 'repita', 'sempre', 'se', 'pareTudo'],
  sensores: [],
  variaveis: ['definaVariavel', 'mudeVariavel'],
};

/** O bloco novo que a paleta entrega, com os valores de partida. */
export function blocoNovo(tipo: TipoDeBloco, id: string, variavel: string, outro: string): Bloco {
  switch (tipo) {
    case 'quandoTecla': return { id, tipo, tecla: 'direita' };
    case 'mover': return { id, tipo, passos: 10 };
    case 'subir': return { id, tipo, passos: 10 };
    case 'irPara': return { id, tipo, x: 0, y: 0 };
    case 'diga': return { id, tipo, texto: 'Olá!' };
    case 'espere': return { id, tipo, segundos: 1 };
    case 'repita': return { id, tipo, vezes: 10, corpo: [] };
    case 'sempre': return { id, tipo, corpo: [] };
    case 'se': return { id, tipo, condicao: { tipo: 'tocando', quem: outro }, corpo: [] };
    case 'definaVariavel': return { id, tipo, nome: variavel, valor: 0 };
    case 'mudeVariavel': return { id, tipo, nome: variavel, por: 1 };
    default: return { id, tipo } as Bloco;
  }
}
