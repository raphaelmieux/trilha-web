/**
 * A bandeira verde do Scratch, desenhada.
 *
 * ── Por que ela é um desenho, e não uma palavra ──────────────────────────
 * O bloco que abre quase toda pilha se chama, na paleta em português, "quando
 * ⚑ for clicado" — e o ⚑ ali é a figura da bandeira, ocupando o lugar do
 * primeiro parâmetro. As lições diziam "quando a bandeira verde for clicada",
 * uma frase que não existe em lugar nenhum da tela: quem procurasse por ela na
 * gaveta de Eventos não acharia nada, e nada explicaria por quê.
 *
 * Escrever só o símbolo tipográfico resolveria metade: `⚑` sai da cor do texto,
 * e uma bandeira que não é verde perde a única coisa que a identifica. Por isso
 * é um desenho, e por isso ele é verde.
 */
export function BandeiraVerde({ tamanho = 15 }: { tamanho?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={tamanho} height={tamanho} role="img"
      aria-label="bandeira verde"
      /* `display: inline-block` dito à mão: o reset do Tailwind põe
         `svg { display: block }`, e um bloco no meio da frase quebra a linha —
         o rótulo saía com "quando" em cima e "for clicado" embaixo. */
      style={{ display: 'inline-block', verticalAlign: '-2px', margin: '0 1px' }}>
      <path d="M5 2.5v19" stroke="#45993D" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M7 4.2c4-2.5 8 2.5 12 0v9c-4 2.5-8-2.5-12 0z" fill="#4CBF56" />
    </svg>
  );
}

/** O caractere que marca, no texto de um bloco, o lugar da bandeira. */
export const MARCA_DA_BANDEIRA = '⚑';

/**
 * O texto de um bloco com a bandeira desenhada no lugar da marca.
 *
 * Um componente só, usado pelo exemplo da teoria e pelo editor de reserva: se
 * cada um desenhasse a sua, as duas divergiriam no primeiro ajuste — e a
 * plataforma passaria a mostrar duas bandeiras diferentes para o mesmo bloco.
 */
export function TextoDeBloco({ texto }: { texto: string }) {
  if (!texto.includes(MARCA_DA_BANDEIRA)) return <>{texto}</>;
  /*
    Tudo dentro de um `span` só, e não uma lista de pedaços.

    O bloco é desenhado com `display: inline-flex`, e ali cada filho vira um
    item da fila: devolver "quando", a bandeira e "for clicado" soltos partia a
    frase em três itens, que quebravam em linhas diferentes e desalinhavam a
    bandeira. Com um invólucro, o bloco vê um filho e o texto volta a ser texto.
  */
  return (
    <span>
      {texto.split(MARCA_DA_BANDEIRA).map((parte, i) => (
        <span key={i}>
          {i > 0 && <BandeiraVerde />}
          {parte}
        </span>
      ))}
    </span>
  );
}
