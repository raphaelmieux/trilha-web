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
}
