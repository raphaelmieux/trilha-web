/**
 * Acha o construtor dentro de um módulo CommonJS empacotado.
 *
 * O `scratch-vm` e o `scratch-storage` são CommonJS, e a ponte que o Vite monta
 * para eles nem sempre põe o construtor em `default`: às vezes ele está no
 * próprio módulo, às vezes num `default` dentro do `default`. Escrever
 * `mod.default` e torcer deu `TypeError: s is not a constructor` no navegador —
 * e no build, onde nada avisa antes.
 *
 * Isto olha os três lugares e devolve o primeiro que é função. Falhar aqui é
 * melhor do que falhar na linha do `new`, porque a mensagem diz o que faltou.
 */
function camadas(modulo: unknown): unknown[] {
  return [
    modulo,
    (modulo as { default?: unknown })?.default,
    ((modulo as { default?: { default?: unknown } })?.default)?.default,
  ].filter(c => c != null);
}

/** O construtor exportado como `default`, ou como o nome dado. */
export function construtorDe<T>(
  modulo: unknown, nome: string, exportado?: string,
): new () => T {
  for (const c of camadas(modulo)) {
    if (typeof c === 'function') return c as new () => T;
    if (exportado) {
      const nomeado = (c as Record<string, unknown>)[exportado];
      if (typeof nomeado === 'function') return nomeado as new () => T;
    }
  }
  throw new Error(`${nome}: o módulo não expõe um construtor${exportado ? ` chamado ${exportado}` : ''}.`);
}

/** Um valor qualquer exportado por nome, procurado nas mesmas camadas. */
export function exportadoDe<T>(modulo: unknown, nome: string, chave: string): T {
  for (const c of camadas(modulo)) {
    const valor = (c as Record<string, unknown>)?.[chave];
    if (valor != null) return valor as T;
  }
  throw new Error(`${nome}: o módulo não exporta ${chave}.`);
}
