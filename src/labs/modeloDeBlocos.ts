import type { Projeto } from './blocos';

/**
 * O palco de onde o editor de blocos parte.
 *
 * ── Por que ele existe, agora que o Scratch é o de verdade ───────────────
 * `LaboratorioDeBlocos` é a reserva: fica no repositório para o caso de o
 * Scratch embutido se mostrar pesado demais para o computador do clube. Reserva
 * sem modelo não é reserva — cairia num palco vazio, e num palco vazio não há
 * o que fazer.
 *
 * ── Abre com tudo por fazer ──────────────────────────────────────────────
 * Dois personagens e **nenhuma pilha**. O elenco vem montado de propósito, e
 * isso não é adiantar trabalho: escolher personagem é o que se faz antes de
 * programar. A lógica está toda por escrever.
 *
 * ── Os dois na mesma altura ──────────────────────────────────────────────
 * Estiveram em y diferentes, e o jogo montado certo nunca marcava ponto: a seta
 * só muda x, e "tocando" pede as duas distâncias pequenas. O sintoma era o pior
 * possível — programa correto, verificação verde, e o placar parado em zero.
 *
 * É função, e não constante: cada laboratório precisa do seu próprio objeto,
 * senão o que um monta aparece no outro.
 */
export const palcoInicial = (): Projeto => ({
  variaveis: [],
  personagens: [
    { id: 'gato', nome: 'Gato', trajes: ['🐱', '😺'], x: -120, y: 0, pilhas: [] },
    { id: 'maca', nome: 'Maçã', trajes: ['🍎'], x: 120, y: 0, pilhas: [] },
  ],
});
