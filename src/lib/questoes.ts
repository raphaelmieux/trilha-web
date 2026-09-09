import type { Question } from '../types';
import { shuffleArray } from './progress';

/*
 * O embaralhamento das questões, num lugar só.
 *
 * Havia três cópias disto — em ap034.ts, em ap035.ts e em finalExams.ts —, todas
 * embaralhando apenas `options` e `scenarios`. As de ordenar nunca passaram por
 * nenhuma delas: apareciam na ordem em que foram escritas no currículo, que é a
 * ordem certa. A questão estava resolvida antes de o desbravador tocar nela.
 *
 * A cópia em ap035.ts não era importada por ninguém, e a de ap034.ts era
 * importada pela página de lição para embaralhar questões de qualquer trilha —
 * inclusive da AP041, que nada tem a ver com aquele arquivo.
 */

/**
 * A ordem correta de uma questão de ordenar, pelos ids.
 *
 * `order` sempre esteve no tipo e em toda questão do currículo, e nunca foi
 * lido: tanto a correção quanto o retorno na tela deduziam o certo pela posição
 * no array. Enquanto o array vinha ordenado isso funcionava por coincidência —
 * e era a mesma coincidência que entregava a resposta pronta. Ao embaralhar,
 * essa dedução passaria a reprovar todo mundo, então a fonte de verdade volta a
 * ser o campo que existe para isso.
 */
export function sequenciaCorreta(items: NonNullable<Question['data']['items']>): string[] {
  return [...items].sort((a, b) => a.order - b.order).map(i => i.id);
}

/** Quantas vezes tentar de novo antes de aceitar o que saiu. */
const TENTATIVAS = 8;

/**
 * Embaralha os itens sem devolver a questão já resolvida.
 *
 * Com cinco itens, um sorteio em cada 120 sai na ordem certa; com quatro, um em
 * 24. Não é erro, mas é um desbravador abrindo a lição e encontrando a resposta
 * montada — exatamente o que este código existe para impedir. O laço tenta de
 * novo, e desiste depois de algumas voltas para nunca girar sem fim (dois itens
 * com o mesmo `order`, por exemplo, tornariam a saída correta inevitável).
 */
function embaralharItens(items: NonNullable<Question['data']['items']>) {
  if (items.length < 2) return items;
  const certa = sequenciaCorreta(items).join('|');

  for (let i = 0; i < TENTATIVAS; i++) {
    const tentativa = shuffleArray(items);
    if (tentativa.map(x => x.id).join('|') !== certa) return tentativa;
  }
  return shuffleArray(items);
}

/**
 * Embaralha o que pode ser embaralhado numa questão.
 *
 * Cada forma é tratada por conta própria, e não com um `return` na primeira que
 * aparecer: era assim que as de ordenar escapavam — sem `options` e sem
 * `scenarios`, caíam no fim da função e voltavam intactas.
 *
 * `pairs` fica de fora de propósito: numa questão de ligar, a coluna da esquerda
 * é o enunciado, e quem precisa ser embaralhada é a lista de opções da direita.
 * Isso acontece na hora de desenhar, em QuestionRenderer.
 */
export function embaralharQuestao(q: Question): Question {
  const data = { ...q.data };
  if (data.options) data.options = shuffleArray(data.options);
  if (data.scenarios) data.scenarios = shuffleArray(data.scenarios);
  if (data.items) data.items = embaralharItens(data.items);
  return { ...q, data };
}

export function embaralharQuestoes(questions: Question[]): Question[] {
  return questions.map(embaralharQuestao);
}

/*
 * ── O sorteio da tentativa ────────────────────────────────────────────────
 *
 * Embaralhar as alternativas já se fazia, e funciona. O que faltava era o
 * resto: a ordem das questões era sempre a mesma, e o conjunto perguntado era
 * sempre o conjunto inteiro. Duas pessoas que fizessem o mesmo módulo viam as
 * mesmas perguntas, nas mesmas posições — e "a terceira é a certa da segunda"
 * vira um recado que se passa adiante sem ninguém ler a lição.
 *
 * Três medidas, e as três se multiplicam:
 *
 *   as alternativas embaralham   — já existia, e o `porque` de cada errada
 *                                  continua colado nela, porque o retorno é
 *                                  por id e não por posição;
 *   a ordem das questões         — quem decorou "a 5 é a do relógio" perde a
 *                                  referência;
 *   o reservatório maior         — com x+3 escritas e x perguntadas, duas
 *                                  tentativas quase nunca trazem o mesmo
 *                                  conjunto.
 *
 * Com quatro alternativas, seis questões sorteadas de nove e ordem livre, a
 * chance de duas pessoas verem a mesma prova na mesma ordem é de uma em
 * dezenas de milhares. Decorar deixa de compensar antes de estudar.
 */

/**
 * Quantas questões a tentativa pede.
 *
 * Sem `perguntas` declarado, pergunta todas — que é o que a plataforma inteira
 * fazia, e continua fazendo em toda lição que ainda não ganhou extras. A
 * mudança de comportamento acompanha o conteúdo, e não a data do deploy.
 */
export function quantasPerguntar(pool: Question[], perguntas?: number): number {
  if (!perguntas || perguntas >= pool.length) return pool.length;
  return Math.max(1, perguntas);
}

/**
 * Sorteia as questões de uma tentativa: quais, em que ordem, e embaralhadas
 * por dentro.
 *
 * O sorteio de *quais* vem antes do de *ordem* de propósito. Fossem juntos —
 * embaralhar tudo e cortar as primeiras x —, as questões do fim do currículo
 * apareceriam com a mesma frequência das do começo, o que está certo, mas
 * ficaria impossível ler no código qual das duas coisas está acontecendo.
 */
export function sortearQuestoes(pool: Question[], perguntas?: number): Question[] {
  const quantas = quantasPerguntar(pool, perguntas);
  const escolhidas = quantas >= pool.length ? [...pool] : shuffleArray(pool).slice(0, quantas);
  return shuffleArray(escolhidas).map(embaralharQuestao);
}

/*
 * ── O sorteio que não deixa requisito de fora ─────────────────────────────
 *
 * `sortearQuestoes` escolhe ao acaso, e para uma lição isso basta: as questões
 * dela são todas do mesmo assunto, então qualquer subconjunto cobre o que a
 * lição ensina.
 *
 * A prova final é outra coisa. Ela foi escrita para cobrir os requisitos da
 * trilha, e alguns têm uma questão só — sorteando ao acaso, o desbravador
 * podia fazer a prova inteira sem que a placa de som fosse mencionada, e a
 * prova deixava de ser o que ela diz ser. Era por isso que a margem do sorteio
 * dela era pequena: sem saber o que estava deixando de fora, a única defesa era
 * deixar pouco de fora.
 *
 * Agora cada questão diz em `requisitos` o que ela mede, e o sorteio pode
 * garantir em vez de torcer: primeiro uma questão para cada requisito, depois o
 * resto ao acaso. A garantia é o teto da margem — dá para sortear tão pouco
 * quanto o número de requisitos, e nem uma questão menos.
 */

/** Os requisitos que uma questão mede. Sem declaração, nenhum. */
const requisitosDe = (q: Question): string[] => q.requisitos ?? [];

/*
  O conjunto mínimo de questões que toca em todo requisito do reservatório.

  A cada passo escolhe a questão que cobre mais requisitos ainda descobertos:
  a de ligar, que mede sete de uma vez, vale sete vagas, e preferi-la é o que
  deixa sobrar espaço para o sorteio livre.

  `aoAcaso` embaralha antes de escolher, e é a única diferença entre as duas
  chamadas. Sem ele o resultado é sempre o mesmo, e é assim que a trava mede o
  dimensionamento; com ele, empates se desfazem de um jeito diferente a cada
  tentativa — e o **tamanho** do conjunto é o mesmo nos dois casos, que é o que
  torna o número da trava o número de que o sorteio precisa. Foram duas funções
  com dois laços parecidos por uma hora, e aí a trava passaria a conferir uma
  conta que o sorteio não faz.
*/
function conjuntoQueCobre(pool: Question[], aoAcaso: boolean): Question[] {
  const faltando = new Set(pool.flatMap(requisitosDe));
  const disponiveis = aoAcaso ? shuffleArray(pool) : [...pool];
  const escolhidas: Question[] = [];

  while (faltando.size && disponiveis.length) {
    const quanto = (q: Question) => requisitosDe(q).filter(r => faltando.has(r)).length;
    const melhor = disponiveis.reduce((a, b) => (quanto(b) > quanto(a) ? b : a));
    /* Nenhuma das que sobraram ajuda: o resto do reservatório não mede nada que
       ainda falte. Sair aqui evita o laço sem fim. */
    if (!quanto(melhor)) break;
    for (const r of requisitosDe(melhor)) faltando.delete(r);
    disponiveis.splice(disponiveis.indexOf(melhor), 1);
    escolhidas.push(melhor);
  }
  return escolhidas;
}

/**
 * Sorteia cobrindo todo requisito que o reservatório cobre.
 *
 * Primeiro o conjunto que cobre, depois o resto ao acaso até completar as
 * vagas. Quando as vagas acabam antes da cobertura, o que sair de fora sai: é
 * uma prova mal dimensionada, e quem reprova por isso é `qualidade.test.ts`,
 * antes de a build passar. Aqui não se estoura na cara de quem está fazendo a
 * prova.
 */
export function sortearCobrindo(pool: Question[], perguntas?: number): Question[] {
  const quantas = quantasPerguntar(pool, perguntas);
  if (quantas >= pool.length) return shuffleArray(pool).map(embaralharQuestao);

  const cobertura = conjuntoQueCobre(pool, true).slice(0, quantas);
  const escolhidos = new Set(cobertura.map(q => q.id));
  const resto = shuffleArray(pool.filter(q => !escolhidos.has(q.id)));

  const escolhidas = [...cobertura, ...resto.slice(0, quantas - cobertura.length)];
  return shuffleArray(escolhidas).map(embaralharQuestao);
}

/**
 * Quantas questões, no mínimo, uma prova precisa perguntar para cobrir tudo.
 *
 * Não é o número de requisitos: uma questão que mede sete resolve sete de uma
 * vez. É o mesmo conjunto que o sorteio monta, contado sem sorteio nenhum.
 */
export function minimoParaCobrir(pool: Question[]): number {
  return conjuntoQueCobre(pool, false).length;
}
