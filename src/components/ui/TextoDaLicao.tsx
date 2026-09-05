/**
 * O texto de uma lição, com as duas marcações que ele usa.
 *
 * ── O que estava errado ──────────────────────────────────────────────────
 * A prosa das veredas escreve nome de código entre crases — `int`, `NameError`,
 * `placar = placar + 1` — e destaca uma palavra entre asteriscos. A tela
 * imprimia tudo cru: o desbravador lia "a mensagem é \`NameError\`" com as
 * crases à vista, e "a casa decimal é **ponto**" com os asteriscos.
 *
 * Numa vereda de HTML isso aparecia três vezes e passava por descuido de
 * digitação. Numa de Python aparece em quase todo parágrafo, porque é assim que
 * se escreve sobre código: o nome da função é uma coisa, e a frase em volta é
 * outra. Sem a distinção, `int` no meio de uma frase vira uma palavra qualquer.
 *
 * ── Duas marcações, e só duas ────────────────────────────────────────────
 * Crase é código; dois asteriscos é ênfase. Não é markdown: não há título, nem
 * lista, nem link, e não vai haver — a lição já tem lugar próprio para cada uma
 * dessas coisas, e um interpretador de markdown inteiro traria junto a
 * possibilidade de a lição desenhar coisas que a plataforma não desenha.
 *
 * O texto vira nós de React, e não HTML: nada aqui passa por
 * `dangerouslySetInnerHTML`, e por isso não há o que escapar.
 */

/* O separador captura os dois formatos de uma vez, mantendo os delimitadores
   para que cada pedaço se reconheça pelo próprio começo. */
const PEDACOS = /(`[^`]+`|\*\*[^*]+\*\*)/g;

export function TextoDaLicao({ texto }: { texto: string }) {
  /*
    Um invólucro só, e não uma lista de pedaços soltos.

    A caixa de atenção é desenhada com `display: flex`, e ali cada filho vira um
    item da fila: a frase saía partida, com o pedaço de código numa linha e o
    resto noutra. Devolvendo um `span`, o container vê um filho e o texto volta
    a ser texto — em qualquer caixa, inclusive nas que ainda não existem.
  */
  return (
    <span>
      {texto.split(PEDACOS).map((pedaco, i) => {
        if (pedaco.startsWith('`') && pedaco.endsWith('`') && pedaco.length > 2) {
          return <code key={i} className="licao-codigo">{pedaco.slice(1, -1)}</code>;
        }
        if (pedaco.startsWith('**') && pedaco.endsWith('**') && pedaco.length > 4) {
          return <strong key={i}>{pedaco.slice(2, -2)}</strong>;
        }
        return pedaco;
      })}
    </span>
  );
}

/**
 * O estilo do código no meio da frase.
 *
 * Fica aqui, junto do componente, e é injetado pelas duas telas que o usam — a
 * lição e a referência. Elas desenham o mesmo conteúdo, e conteúdo que se lê
 * diferente nos dois lugares é pior do que referência nenhuma.
 */
export const CSS_TEXTO_DA_LICAO = `
  .licao-codigo {
    font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
    font-size: 0.9em;
    padding: 1px 5px;
    border-radius: 4px;
    background: var(--color-bg-hover);
    color: var(--color-text);
    white-space: nowrap;
  }
`;
