/**
 * O pen drive, e a razão de ele ser uma peça própria.
 *
 * ── O que o requisito 4.6 pede de verdade ────────────────────────────────
 * "Copiar arquivos para dispositivo externo e removê-lo com segurança" parece
 * duas ações e é uma lição só: a cópia **não termina** quando a barra chega a
 * 100%. O sistema guarda parte do que foi copiado na memória e só termina de
 * gravar quando alguém pede a remoção — puxar antes deixa o arquivo pela
 * metade, do outro lado, onde ninguém está olhando.
 *
 * Um pen drive que fosse só uma quarta raiz na árvore não teria como ensinar
 * isso: copiar e aparecer seria a mesma coisa, e a remoção segura viraria um
 * botão sem consequência — a tarefa verde de graça que a plataforma inteira
 * evita.
 *
 * Por isso existe este arquivo. O que ele acrescenta ao disco é uma única
 * ideia: **há coisas copiadas que ainda não estão gravadas**, e quem decide
 * quando elas ficam é a remoção segura.
 *
 * ── E o estrago é silencioso, como todo o resto desta vereda ─────────────
 * Puxar sem remover não dá erro, não pisca nada e não avisa. O arquivo aparece
 * na lista do outro computador, com o nome certo e um tamanho plausível — e não
 * abre. É o mesmo formato de falha da cópia de segurança nunca testada, e é por
 * isso que os dois assuntos moram na mesma vereda.
 */

import type { No } from './arquivos';

/** A raiz do dispositivo, como o Windows a nomeia. */
export const PENDRIVE = 'pendrive';

export interface DispositivoExterno {
  /** Conectado ao computador? Desconectado, ele some da lateral. */
  conectado: boolean;
  /**
   * Os ids copiados para cá que ainda não foram gravados de verdade.
   *
   * É a memória intermediária do sistema, e é a única razão de este arquivo
   * existir. Ela esvazia na remoção segura, e é perdida quando alguém puxa.
   */
  porGravar: string[];
  /**
   * Os ids que chegaram pela metade porque alguém puxou cedo.
   *
   * Eles continuam na árvore, com nome e tamanho, e não abrem — que é o que
   * acontece na vida. Guardá-los como lista, e não apagá-los, é o que permite
   * a tela mostrar o defeito em vez de escondê-lo.
   */
  corrompidos: string[];
}

export const dispositivoInicial = (): DispositivoExterno => ({
  conectado: false,
  porGravar: [],
  corrompidos: [],
});

export const conectar = (d: DispositivoExterno): DispositivoExterno =>
  ({ ...d, conectado: true });

/** Registra que estes ids foram copiados para o dispositivo e estão pendentes. */
export const copiadoParaODispositivo = (
  d: DispositivoExterno, ids: string[],
): DispositivoExterno => ({
  ...d,
  porGravar: [...new Set([...d.porGravar, ...ids])],
});

/**
 * A remoção segura: termina de gravar o que estava pendente e desconecta.
 *
 * Só funciona com o dispositivo conectado — pedir a remoção de um pen drive já
 * puxado não conserta nada, e fingir que conserta seria pior do que recusar.
 */
export function removerComSeguranca(d: DispositivoExterno): DispositivoExterno {
  if (!d.conectado) return d;
  return { ...d, conectado: false, porGravar: [] };
}

/**
 * Puxar sem pedir a remoção: o que estava pendente chega quebrado.
 *
 * O que já tinha sido gravado continua bom. É essa mistura que torna o defeito
 * difícil de ler na vida real — alguns arquivos abrem, e a pessoa conclui que
 * o problema foi do arquivo que não abriu.
 */
export function puxarSemRemover(d: DispositivoExterno): DispositivoExterno {
  if (!d.conectado) return d;
  return {
    ...d,
    conectado: false,
    porGravar: [],
    corrompidos: [...new Set([...d.corrompidos, ...d.porGravar])],
  };
}

/** Aquele arquivo chegou inteiro do outro lado? */
export const chegouInteiro = (d: DispositivoExterno, id: string) =>
  !d.corrompidos.includes(id);

/**
 * O que está no dispositivo e chegou inteiro.
 *
 * É esta a lista que responde "a cópia deu certo?", e ela é diferente da lista
 * do que está lá: a segunda inclui o que aparece e não abre.
 */
export const gravadosDeVerdade = (
  arvore: No[], d: DispositivoExterno,
): No[] => arvore.filter(n => n.paiId === PENDRIVE && chegouInteiro(d, n.id));
