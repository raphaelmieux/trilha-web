/**
 * As marcas da plataforma, e a regra de como elas se escrevem.
 *
 * São duas, e as duas têm a mesma forma: um nome que é uma **chamada de
 * função**. `Trilha.Web()` é a plataforma; `Token.Web()` é o certificado que
 * ela emite. As duas em Space Mono Bold, e nas duas **os parênteses são
 * vermelhos** — são eles que dizem que o nome é uma chamada, e não uma frase
 * com pontuação sobrando.
 *
 * A regra é uma só de propósito. O clube encontra os dois nomes na mesma tela —
 * a de entrada traz a marca no alto e o "Recebeu um Token.Web()?" logo abaixo —,
 * e vesti-los de formas diferentes ensinaria que um deles é nome próprio e o
 * outro é texto comum, quando os dois são a mesma ideia.
 *
 * Isto aqui é TypeScript puro, sem React, de propósito. As marcas aparecem na
 * tela — onde quem desenha é o CSS — e também dentro dos PDFs que a plataforma
 * gera, onde quem desenha é o jsPDF, que não sabe o que é uma folha de estilo.
 * Os dois precisam dos mesmos nomes e da mesma cor, e duas cópias divergem no
 * primeiro ajuste: bastaria alguém renomear de um lado para a plataforma passar
 * a mostrar duas marcas diferentes, uma delas em papel entregue ao clube.
 */

/** Os parênteses vermelhos, iguais nas duas marcas. */
export const PARENTESES = '()';

/**
 * As duas marcas, pelo que elas são.
 *
 * `miolo` é o que fica na cor do texto em volta; `nome` é o que se lê em voz
 * alta e o que vai para `aria-label`. `marca.test.tsx` confere que um mais os
 * parênteses dá o outro — a regra inteira depende dessa igualdade.
 */
export const MARCAS = {
  /** A plataforma. */
  plataforma: { nome: 'Trilha.Web()', miolo: 'Trilha.Web' },
  /** O certificado que ela emite, de trilha e de vereda. */
  token: { nome: 'Token.Web()', miolo: 'Token.Web' },
} as const;

export type QualMarca = keyof typeof MARCAS;

/** O nome da plataforma. Atalho para o que mais se usa. */
export const NOME = MARCAS.plataforma.nome;
export const MIOLO = MARCAS.plataforma.miolo;

/**
 * O vermelho da marca em RGB, para o jsPDF.
 *
 * Na tela quem responde é `var(--color-primary)`, e é de lá que este número
 * sai: #C13516. O PDF não tem custom property nenhuma, então o valor precisa
 * ser escrito — e `marca.test.tsx` confere que ele continua igual ao token do
 * `index.css`, porque um vermelho que se muda num lugar só é a divergência que
 * este arquivo existe para evitar.
 */
export const VERMELHO_DA_MARCA: [number, number, number] = [193, 53, 22];

/** Um pedaço de texto, e se ele é ou não parte vermelha de uma marca. */
export type PedacoDaMarca = { texto: string; daMarca: boolean };

const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/*
  Uma alternação com as duas marcas, para achar a que vier primeiro na frase.
  Partir duas vezes — uma por marca — devolveria os pedaços na ordem errada
  numa frase que cita as duas, e há uma dessas na tela de entrada.
*/
const PADRAO = new RegExp(
  `(${Object.values(MARCAS).map(m => escapar(m.nome)).join('|')})`, 'g');

/**
 * Parte uma frase nos pedaços que a marca colore.
 *
 * Devolve a frase inteira num pedaço só quando nenhuma marca aparece nela,
 * então é seguro passar qualquer texto. Quem chama desenha cada pedaço com a
 * cor que o `daMarca` pede.
 */
export function partirNaMarca(texto: string): PedacoDaMarca[] {
  const pedacos: PedacoDaMarca[] = [];
  let lido = 0;

  for (const achado of texto.matchAll(PADRAO)) {
    const nome = achado[1];
    const inicio = achado.index ?? 0;

    const antes = texto.slice(lido, inicio);
    if (antes) pedacos.push({ texto: antes, daMarca: false });

    pedacos.push({ texto: nome.slice(0, -PARENTESES.length), daMarca: false });
    pedacos.push({ texto: PARENTESES, daMarca: true });
    lido = inicio + nome.length;
  }

  const resto = texto.slice(lido);
  if (resto) pedacos.push({ texto: resto, daMarca: false });

  return pedacos;
}
