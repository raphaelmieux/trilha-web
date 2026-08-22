/*
 * O rascunho local dos laboratórios de escrita.
 *
 * Um desbravador escreveu mais de cem palavras e perdeu tudo quando o
 * aplicativo se atualizou por baixo dele. O texto só ia para o servidor ao
 * salvar, ao trocar de etapa ou ao sair do campo — e entre uma dessas e a
 * seguinte cabe um parágrafo inteiro, que uma recarga leva embora.
 *
 * Aqui o texto é gravado no próprio navegador a cada pausa na digitação. Não
 * substitui o salvamento no servidor: é a rede embaixo dele, para o intervalo em
 * que o trabalho existe só na tela. `localStorage` sobrevive a recarregar a
 * página, a fechar a aba e a uma atualização do aplicativo.
 *
 * A chave leva o id da pessoa porque o navegador pode ser compartilhado — um
 * clube costuma ter um computador só, e o rascunho de um não pode aparecer para
 * o próximo. Ao sair, `limparRascunhos` apaga tudo.
 */

const PREFIXO = 'trilha-web:rascunho:';

export interface RascunhoGuardado<T> {
  conteudo: T;
  /** Quando foi digitado, em ms — comparado com o `updated_at` do servidor. */
  em: number;
}

function chave(userId: string, lessonCode: string): string {
  return `${PREFIXO}${userId}:${lessonCode}`;
}

/*
  Todo acesso é protegido.

  `localStorage` lança quando a cota estoura e quando o navegador está em modo
  privado com armazenamento bloqueado. Nenhum dos dois pode derrubar o
  laboratório: sem rascunho local a pessoa ainda escreve e ainda salva no
  servidor, que é o caminho principal.
*/
export function salvarRascunho<T>(userId: string, lessonCode: string, conteudo: T): void {
  try {
    const pacote: RascunhoGuardado<T> = { conteudo, em: Date.now() };
    localStorage.setItem(chave(userId, lessonCode), JSON.stringify(pacote));
  } catch {
    /* Sem espaço ou sem permissão: segue sem rede embaixo. */
  }
}

export function lerRascunho<T>(userId: string, lessonCode: string): RascunhoGuardado<T> | undefined {
  try {
    const bruto = localStorage.getItem(chave(userId, lessonCode));
    if (!bruto) return undefined;
    const pacote = JSON.parse(bruto) as RascunhoGuardado<T>;
    return typeof pacote?.em === 'number' ? pacote : undefined;
  } catch {
    return undefined;
  }
}

export function descartarRascunho(userId: string, lessonCode: string): void {
  try {
    localStorage.removeItem(chave(userId, lessonCode));
  } catch { /* nada a fazer */ }
}

/** Apaga os rascunhos de todo mundo neste navegador. Chamado ao sair. */
export function limparRascunhos(): void {
  try {
    const alvos: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(PREFIXO)) alvos.push(k);
    }
    for (const k of alvos) localStorage.removeItem(k);
  } catch { /* nada a fazer */ }
}

/**
 * O rascunho local é mais novo do que o que veio do servidor?
 *
 * Só nesse caso ele vale: se o servidor já tem o texto, restaurar por cima
 * devolveria uma versão antiga. A margem de dois segundos evita que a diferença
 * entre o relógio do navegador e o do banco — que são relógios diferentes —
 * faça um salvamento bem-sucedido parecer velho e reviva o que ele substituiu.
 */
export function rascunhoEhMaisNovo(
  rascunho: { em: number } | undefined,
  updatedAt: string | null | undefined,
): boolean {
  if (!rascunho) return false;
  if (!updatedAt) return true;
  const doServidor = Date.parse(updatedAt);
  if (Number.isNaN(doServidor)) return true;
  return rascunho.em > doServidor + 2000;
}
