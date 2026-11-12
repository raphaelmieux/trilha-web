import { useCallback, useEffect, useRef } from 'react';

/*
 * Agendar uma coisa para daqui a pouco — e desistir dela se a tela sair antes.
 *
 * O aviso que some sozinho era escrito em quinze laboratórios do mesmo jeito:
 * `window.setTimeout(() => setAviso(...), 7000)`, solto, sem guardar o
 * número do relógio. Na tela isso não aparece; num teste que desmonta antes
 * dos sete segundos, o relógio dispara num componente que não existe mais, o
 * React procura o `window` para decidir a prioridade da atualização e não
 * acha — e a execução sai vermelha com todos os testes passando. Foi assim que
 * a publicação de 12 de novembro reprovou: "window is not defined", vinda do
 * aviso do laboratório de estatística, depois do fim do arquivo de teste.
 *
 * É a família da consulta que volta para tela que já saiu, e tem a mesma cara
 * de flake: ganha-se a corrida numa máquina e perde-se noutra.
 *
 * O gancho guarda todo relógio que agendou e cancela os que sobraram quando a
 * tela sai. `escritaDepoisDoDesmonte.test.ts` reprova `setTimeout` que escreve
 * estado fora de um efeito — dentro de um efeito, quem cancela é a limpeza
 * dele.
 */
export function useAgendar() {
  const pendentes = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const p = pendentes.current;
    return () => {
      p.forEach(t => clearTimeout(t));
      p.clear();
    };
  }, []);

  return useCallback((f: () => void, ms: number) => {
    const t = setTimeout(() => {
      pendentes.current.delete(t);
      f();
    }, ms);
    pendentes.current.add(t);
  }, []);
}
