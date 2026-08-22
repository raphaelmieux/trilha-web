import { useEffect, useRef } from 'react';
import { salvarRascunho } from '../lib/rascunho';

/**
 * Guarda o conteúdo no navegador a cada pausa na digitação.
 *
 * O atraso existe para não escrever em `localStorage` a cada tecla; meio segundo
 * é curto o bastante para que uma recarga inesperada custe no máximo a última
 * frase, e longo o bastante para não pesar enquanto a pessoa escreve.
 *
 * `ativo` desliga a gravação quando não há mais o que proteger — depois de
 * enviado, ou enquanto o laboratório ainda está carregando o que veio do
 * servidor. Sem isso, o estado vazio do primeiro instante sobrescreveria um
 * rascunho bom.
 *
 * ── Meio segundo é uma eternidade quando a página some ────────────────────
 * Quem faz a pesquisa do laboratório de navegação pelo celular voltava e
 * encontrava "0 de 4": a marca de que a busca foi aberta era perdida sempre. O
 * clique liga o estado e, no mesmo instante, o navegador troca de página — o
 * temporizador de meio segundo nunca chega a disparar, e no telefone essa troca
 * é imediata, enquanto no computador a aba de origem continua viva e gravando.
 * Um laboratório que só funciona no computador não serve: boa parte dos
 * desbravadores abre a trilha pelo telefone.
 *
 * Por isso a gravação também acontece na hora em que a página é escondida ou
 * descarregada, e ao desmontar a tela. Nessas horas o conteúdo é lido de uma ref
 * atualizada no próprio render, e não do que o efeito agendou: efeito de
 * `useEffect` roda depois da pintura, e a página pode sumir antes disso.
 */
export function useRascunhoLocal<T>(
  userId: string | undefined,
  lessonCode: string | undefined,
  conteudo: T,
  ativo: boolean,
  atrasoMs = 500,
): void {
  /* Numa ref para não entrar nas dependências: o efeito reage à mudança do
     conteúdo, não à identidade da função. */
  const ultimo = useRef<string>('');

  /* O padrão da "ref mais recente": atualizada no render, que num clique
     acontece antes de o navegador seguir com a navegação. */
  const atual = useRef({ userId, lessonCode, conteudo, ativo });
  atual.current = { userId, lessonCode, conteudo, ativo };

  useEffect(() => {
    if (!ativo || !userId || !lessonCode) return;

    const serializado = JSON.stringify(conteudo);
    if (serializado === ultimo.current) return;

    const id = setTimeout(() => {
      ultimo.current = serializado;
      salvarRascunho(userId, lessonCode, conteudo);
    }, atrasoMs);

    return () => clearTimeout(id);
  }, [userId, lessonCode, conteudo, ativo, atrasoMs]);

  useEffect(() => {
    const gravarAgora = () => {
      const { userId: u, lessonCode: l, conteudo: c, ativo: a } = atual.current;
      if (!a || !u || !l) return;
      const serializado = JSON.stringify(c);
      if (serializado === ultimo.current) return;
      ultimo.current = serializado;
      salvarRascunho(u, l, c);
    };

    /*
      `visibilitychange` é o que dispara quando outra aba assume — é o caso da
      pesquisa aberta pelo celular. `pagehide` cobre sair da página de vez,
      inclusive quando ela vai para o cache de retorno; `beforeunload` não é
      usado porque em telefone ele muitas vezes não chega a disparar.
    */
    const aoEsconder = () => { if (document.visibilityState === 'hidden') gravarAgora(); };
    document.addEventListener('visibilitychange', aoEsconder);
    window.addEventListener('pagehide', gravarAgora);

    /* Ao desmontar também: trocar de tela dentro do aplicativo não passa por
       nenhum dos dois eventos, e levaria embora a última meia pausa. */
    return () => {
      document.removeEventListener('visibilitychange', aoEsconder);
      window.removeEventListener('pagehide', gravarAgora);
      gravarAgora();
    };
  }, []);
}
