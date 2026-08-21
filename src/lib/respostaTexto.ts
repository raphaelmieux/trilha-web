/*
 * Comparação de resposta escrita à mão.
 *
 * A verificação era igualdade exata depois de minúsculas e trim. Quem escrevia
 * "roteadores", "Roteador." ou "rotedor" era reprovado sabendo a matéria — a
 * questão media digitação, não entendimento.
 *
 * São três camadas, da mais segura para a mais tolerante: normalização
 * (acento, caixa, pontuação, espaços), equivalência de singular/plural, e por
 * fim distância de edição, com folga proporcional ao tamanho da palavra.
 */

/** Sem acento, sem caixa, sem pontuação, sem espaço repetido. */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')   // os acentos que o NFD separou
    .toLowerCase()
    .replace(/[.,;:!?"'`´()[\]{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Distância de Levenshtein entre duas cadeias já normalizadas.
 * Duas linhas de matriz bastam: só a anterior importa a cada passo.
 */
export function distancia(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let anterior = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const atual = [i];
    for (let j = 1; j <= b.length; j++) {
      atual[j] = Math.min(
        anterior[j] + 1,                                   // remoção
        atual[j - 1] + 1,                                  // inserção
        anterior[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1), // troca
      );
    }
    anterior = atual;
  }
  return anterior[b.length];
}

/**
 * Quantos caracteres de folga uma resposta desse tamanho merece.
 *
 * Numa resposta curta a folga não pode existir: com um caractere de tolerância,
 * "80" aceitaria "90", e a porta 80 e a 443 são justamente o que a questão
 * pergunta. A partir de cinco caracteres um deslize de digitação já não confunde
 * dois conceitos diferentes.
 */
function folga(esperada: string): number {
  if (esperada.length <= 4) return 0;
  if (esperada.length <= 8) return 1;
  return 2;
}

/**
 * Mesma palavra no singular e no plural?
 *
 * Português não faz plural de um jeito só: "roteador" ganha -es, "pacote" ganha
 * -s, "conexão" vira "conexões". Em vez de tentar adivinhar a regra certa, cada
 * palavra gera as formas que poderia ter, e basta que as duas listas se cruzem.
 */
function mesmaRaiz(a: string, b: string): boolean {
  const variantes = (t: string) => new Set([
    t,
    t.replace(/s$/, ''),
    t.replace(/es$/, ''),
    t.replace(/oes$/, 'ao'),
    t.replace(/aes$/, 'ao'),
    t.replace(/ais$/, 'al'),
    t.replace(/eis$/, 'el'),
    t.replace(/is$/, 'il'),
    t.replace(/ns$/, 'm'),
  ]);
  const va = variantes(a);
  const vb = variantes(b);
  for (const forma of va) {
    /* Menos de três letras não é raiz, é coincidência. */
    if (forma.length >= 3 && vb.has(forma)) return true;
  }
  return false;
}

/**
 * A resposta escrita corresponde ao esperado?
 *
 * @param escrita    o que a pessoa digitou
 * @param esperada   a resposta canônica
 * @param aceitas    outras formas de dizer o mesmo, se houver
 */
export function respostaConfere(
  escrita: string,
  esperada: string,
  aceitas: string[] = [],
): boolean {
  const dada = normalizar(escrita || '');
  if (!dada) return false;

  for (const alvo of [esperada, ...aceitas]) {
    const certa = normalizar(alvo);
    if (!certa) continue;
    if (dada === certa) return true;
    if (mesmaRaiz(dada, certa)) return true;
    if (distancia(dada, certa) <= folga(certa)) return true;
  }
  return false;
}
