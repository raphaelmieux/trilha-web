import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Toda tela abre no começo dela.
 *
 * ── O defeito ────────────────────────────────────────────────────────────
 * Num aplicativo de uma página só, trocar de rota **não** mexe na rolagem: o
 * navegador guarda o ponto em que a pessoa estava e a tela nova nasce ali. Quem
 * rolasse o painel até as certificações e abrisse uma trilha chegava na trilha
 * já rolada — com o emblema, o nome e o progresso acima da dobra, e o meio da
 * página como primeira coisa a aparecer. O `react-router` não faz isso sozinho,
 * e o `HashRouter` menos ainda: `ScrollRestoration` só existe nos roteadores de
 * dados (`createBrowserRouter`), que não é o daqui.
 *
 * Nada estoura, e é por isso que durou: a tela abre inteira, certa e no lugar
 * errado. O desbravador conclui que a trilha começa no meio, ou que falta
 * conteúdo em cima — e "ordem correta das coisas" é exatamente o que uma página
 * aberta pela metade desfaz.
 *
 * ── Por que mora no `App`, e não em cada página ──────────────────────────
 * É a decisão do `CodigoFonte`, pelo mesmo motivo escrito lá: página que
 * esquecesse seria página servida aberta no meio, e a falta não aparece em
 * lugar nenhum — só quem vem rolado a vê. E já havia começado a acontecer: a
 * `LessonPage` tinha a conta dela sozinha (no "refazer", que é outra coisa e
 * continua lá) e as outras doze telas não tinham nenhuma.
 *
 * ── Três detalhes que erram calado ───────────────────────────────────────
 */
export default function AoTopoAoNavegar() {
  /*
    Só o caminho, e não a busca. Mudar um filtro ou uma aba pela query não é
    trocar de página, e jogar a pessoa para o topo a cada ajuste faria ela
    perder o lugar em que estava lendo — é o contrário do conserto.
  */
  const { pathname } = useLocation();

  /*
    `useLayoutEffect`, e não `useEffect`: o layout corre **antes** de pintar.
    Com o efeito comum há um quadro em que a tela nova aparece na rolagem
    antiga e salta em seguida — um pisca que parece defeito, e que aparece
    justamente nas páginas longas, que são as que precisam do conserto.
  */
  useLayoutEffect(() => {
    /*
      `scrollRestoration: 'manual'` tira do navegador a restauração do voltar.
      Sem isso ele devolve a rolagem antiga **depois** do nosso efeito, e o
      conserto funcionaria para a frente e falharia no botão voltar — de
      maneira intermitente, que é a pior forma de falhar.
    */
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';

    /*
      `behavior: 'instant'` escrito, e não omitido: omitido, ele obedece ao
      `scroll-behavior` da folha, e o dia em que alguém escrever
      `scroll-behavior: smooth` ali a troca de página passa a **deslizar**
      dois mil pixels por um conteúdo que já não é o da tela em que se está.
      Instantâneo também é o certo para quem pediu menos movimento.

      Suave continua certo onde é gesto da pessoa dentro da mesma página — o
      "refazer" da lição —, e é por isso que aquele não vem para cá.
    */
    window.scrollTo?.({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
