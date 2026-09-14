import { useEffect, useRef } from 'react';

/**
 * Se quem chamou ainda está na tela.
 *
 * ── Por que isto existe ───────────────────────────────────────────────────
 * Consulta que volta depois de a tela sair escreve estado em componente que
 * não existe mais. No navegador isso é desperdício e nada mais — o React
 * ignora. Num ambiente já desmontado é **erro**: ele procura o `window` para
 * decidir a prioridade da atualização e não acha. Foi assim que o `ci.yml`
 * reprovou duas vezes com todos os testes passando e nenhuma asserção
 * quebrada, o que é a pior forma de reprovar, porque tem cara de flake.
 *
 * ── Por que um `ref`, e não um `let` no efeito ────────────────────────────
 * Onde a busca mora inteira dentro do efeito, `let vivo = true` com a limpeza
 * ao lado basta, e é o que `useMinhasPosicoes` e `AuthProvider` já faziam. Não
 * basta quando a função que escreve o estado é **devolvida** ao chamador: o
 * `refresh` destes ganchos é chamado de dentro do efeito **e** da tela — a
 * `VeredaPage` chama `recarregar` ao fechar um laboratório, a `LessonPage`
 * chama `refreshProgress` ao vencer uma lição. Uma variável do efeito não
 * alcança essa segunda chamada, e é justamente ela que costuma estar no ar
 * quando a pessoa sai da tela.
 *
 * ── Por que ele volta a `true` ────────────────────────────────────────────
 * O `StrictMode` monta, desmonta e remonta de propósito, no mesmo fiber — e
 * `ref` sobrevive a isso. Uma limpeza que só sabe descer deixaria o gancho
 * morto pelo resto da sessão em desenvolvimento: nenhuma consulta chegaria à
 * tela, e nada diria por quê.
 */
export function useMontado() {
  const montado = useRef(true);
  useEffect(() => {
    montado.current = true;
    return () => { montado.current = false; };
  }, []);
  return montado;
}
