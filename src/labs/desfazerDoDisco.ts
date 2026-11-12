import { useCallback, useRef, useState } from 'react';

/*
 * O Ctrl+Z do Explorador.
 *
 * O Windows desfaz a última operação de arquivo — mover, copiar, renomear,
 * excluir, criar pasta — e o Ctrl+Y a refaz. Os dois Exploradores daqui não
 * desfaziam nada: arrastar a pasta errada para dentro de outra só tinha volta
 * arrastando de novo, e renomear errado só tinha volta digitando o nome de
 * antes de memória. A Lixeira cobre a exclusão e mais nada.
 *
 * ── O que entra e o que não entra ─────────────────────────────────────────
 * Entra o que o Explorador fez com o disco: é por `mudar` que passa. Não entra
 * o que outro programa fez — salvar no editor de texto, restaurar uma versão
 * anterior pelas Propriedades —, porque o Ctrl+Z do Explorador também não
 * desfaz o Bloco de Notas. Esses passam pelo setter cru.
 *
 * E há o que **apaga a história**: esvaziar a Lixeira e ligar ou tirar o pen
 * drive. Depois de esvaziar, desfazer até um estado de antes ressuscitaria o
 * que foi apagado para sempre; depois de tirar o pen drive, desfazer a cópia
 * mexeria num disco que não está mais ali. O Windows também não desfaz
 * nenhum dos dois, e quem chama `esquecer` diz isso ao gancho.
 *
 * ── Por que o atual mora num ref ──────────────────────────────────────────
 * `mudar` recebe a função que transforma o disco, e não o disco novo, como o
 * setter do React. Só que a pilha precisa do disco **de antes**, e ler isso de
 * dentro do atualizador do `setState` é efeito colateral que o React pode
 * rodar duas vezes — a mesma razão de as pilhas do Word morarem em ref. Duas
 * chamadas seguidas no mesmo gesto também precisam ver uma a outra, e o ref é
 * atualizado na hora.
 */
export function useDesfazerDoDisco<T>(valor: T, definir: (v: T) => void) {
  const agora = useRef(valor);
  agora.current = valor;
  const passado = useRef<T[]>([]);
  const futuro = useRef<T[]>([]);
  const [, setContagem] = useState(0);

  const mudar = useCallback((f: (atual: T) => T) => {
    const antes = agora.current;
    const depois = f(antes);
    if (depois === antes) return;
    passado.current = [...passado.current.slice(-49), antes];
    futuro.current = [];
    agora.current = depois;
    definir(depois);
    setContagem(n => n + 1);
  }, [definir]);

  const andar = useCallback((de: React.MutableRefObject<T[]>, para: React.MutableRefObject<T[]>) => {
    const alvo = de.current[de.current.length - 1];
    if (alvo === undefined) return false;
    de.current = de.current.slice(0, -1);
    para.current = [...para.current, agora.current];
    agora.current = alvo;
    definir(alvo);
    setContagem(n => n + 1);
    return true;
  }, [definir]);

  const desfazer = useCallback(() => andar(passado, futuro), [andar]);
  const refazer = useCallback(() => andar(futuro, passado), [andar]);

  const esquecer = useCallback(() => {
    passado.current = [];
    futuro.current = [];
    setContagem(n => n + 1);
  }, []);

  return {
    mudar,
    desfazer,
    refazer,
    esquecer,
    podeDesfazer: passado.current.length > 0,
    podeRefazer: futuro.current.length > 0,
  };
}
