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
