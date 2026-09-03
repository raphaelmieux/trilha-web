import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Fecha o que está aberto por estado quando a pessoa navega — inclusive para
 * esta mesma página.
 *
 * ── O defeito que isto conserta ──────────────────────────────────────────
 * "Vereda Atual", no menu, não fazia nada dentro de uma lição da CC001. E o
 * botão estava certo: a lição da vereda não tem endereço próprio, ela abre
 * dentro de `/vereda/:code` por estado. Então o menu mandava para o endereço em
 * que a pessoa já estava, o React Router não tinha rota nenhuma a trocar, e a
 * lição continuava exatamente onde estava. O clique acendia e não acontecia.
 *
 * A trilha não tinha o problema porque lá a lição *é* uma rota
 * (`/licao/:trilha/:modulo/:licao`), e sair dela é uma navegação de verdade.
 *
 * ── Por que `location.key`, e não o caminho ──────────────────────────────
 * O caminho não muda — é o mesmo antes e depois, e é essa a razão do defeito.
 * O que muda é a entrada no histórico: o React Router dá uma chave nova a cada
 * navegação, mesmo quando o destino é idêntico à origem. É o único sinal que
 * distingue "a pessoa clicou para vir para cá" de "a pessoa já estava aqui".
 *
 * A chave da montagem é ignorada de propósito: senão qualquer página que abrisse
 * algo já aberto o fecharia sozinha no primeiro quadro.
 */
export function useFecharAoNavegar(fechar: () => void) {
  const { key } = useLocation();
  const chaveDaMontagem = useRef(key);
  /* Numa ref para o efeito depender só da chave. Passar a função nas
     dependências a faria disparar a cada render, que é fechar sem ninguém ter
     navegado. */
  const ultimoFechar = useRef(fechar);
  ultimoFechar.current = fechar;

  useEffect(() => {
    if (key === chaveDaMontagem.current) return;
    ultimoFechar.current();
  }, [key]);
}
