/**
 * Acerto mínimo para um requisito contar como cumprido.
 *
 * Era 80%, e uma lição de 8 questões exigia 7 acertos — 6 de 8 reprovava por
 * uma questão. Nas primeiras 42 conclusões registradas, 17 caíram em "a
 * recuperar", a maioria exatamente nessa borda. A 75%, 6 de 8 passa e 5 de 8
 * continua pendente.
 *
 * A prova final usa o mesmo número (ver FinalExam), para não haver duas réguas
 * no mesmo percurso: seria estranho concluir todos os requisitos a 75% e depois
 * esbarrar num corte mais alto na última etapa.
 *
 * ── Por que ele mora sozinho num arquivo ─────────────────────────────────
 * Ele nasceu em `progress.ts` e continua sendo exportado de lá, para quem já o
 * importava. Só que a ofensiva passou a precisar dele — ela agora recusa a
 * tentativa reprovada —, e `progress.ts` importa a conta de dia de
 * `ofensiva.ts`: as duas se importariam em círculo, e `gamification.ts`, que
 * também lê a ofensiva, fecharia o laço. Ciclo de ESM não estoura na hora;
 * ele devolve `undefined` no meio da inicialização, e um limiar `undefined`
 * reprovaria toda lição em silêncio.
 *
 * Um número sem dependência nenhuma pode ser importado por todos sem fechar
 * laço com ninguém. É por isso que este arquivo tem uma linha.
 */
export const LIMIAR_DOMINIO = 75;
