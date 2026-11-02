import type { ResultadoDoNode } from '../labs/nodeSimulado';
import { IDS_DA_ANALISE, type IdDaAnalise } from '../labs/javascriptAnalise';
import { mesmaSaida, type CheckResult } from './pythonValidator';

/**
 * O que um programa de JavaScript precisa ter, e como se confere.
 *
 * Duas fontes, como no Python: a árvore, lida pelo `acorn`, e a execução no
 * Node simulado. Rodar é verificação, e não pressuposto — um programa pode
 * ter todas as estruturas e parar no meio com `TypeError`.
 *
 * O que a pasta guarda depois de rodar também conta. O requisito 6 pede
 * **gravar** JSON, e um programa que lê, monta o objeto e o imprime na tela
 * fez metade: o arquivo continua como estava, e quem abrir amanhã não acha o
 * inscrito novo.
 */

/** O arquivo JSON que o programa tem de deixar gravado, e como. */
export interface JsonEsperado { arquivo: string; valor: unknown }

export interface ContextoDeJavascript {
  achados: Partial<Record<IdDaAnalise, boolean>>;
  /** Os arquivos que o leitor não conseguiu ler. */
  ilegiveis: string[];
  execucao: ResultadoDoNode | null;
  saidaEsperada?: string;
  saidaContem?: string[];
  jsonEsperado?: JsonEsperado;
}

interface Spec {
  id: string;
  label: string;
  hint: string;
  run: (ctx: ContextoDeJavascript) => { passed: boolean; detail?: string };
}

const daArvore = (id: IdDaAnalise, label: string, hint: string, faltou: string): Spec => ({
  id, label, hint,
  run: ctx => (ctx.achados[id]
    ? { passed: true }
    : {
      passed: false,
      detail: ctx.ilegiveis.length
        ? 'O programa não pôde ser lido: corrija o erro de sintaxe primeiro — ele aparece ao executar.'
        : faltou,
    }),
});

/** Igualdade de valores de JSON: a ordem das chaves de um objeto não importa, a de um arranjo sim. */
export function mesmoJson(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) || Array.isArray(b)) {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, i) => mesmoJson(x, b[i]));
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const ka = Object.keys(a).sort();
    const kb = Object.keys(b).sort();
    return ka.length === kb.length && ka.every((k, i) => k === kb[i]
      && mesmoJson((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
  }
  return false;
}

const SPECS: Spec[] = [
  {
    id: 'roda',
    label: 'O programa roda até o fim, sem erro',
    hint: 'Clique em Executar. Se aparecer erro, a última linha diz o tipo, e a primeira diz o arquivo e a linha.',
    run: ctx => {
      if (!ctx.execucao) return { passed: false, detail: 'O programa ainda não foi executado.' };
      if (ctx.execucao.semFim) return { passed: false, detail: 'O programa não terminou sozinho.' };
      if (ctx.execucao.erro) return { passed: false, detail: 'O programa parou com erro — leia o terminal.' };
      return { passed: true };
    },
  },
  {
    id: 'saidaEsperada',
    label: 'Escreve no terminal exatamente o que o enunciado pede',
    hint: 'Compare linha por linha: texto, ordem, maiúsculas e o espaço entre as palavras.',
    run: ctx => {
      if (ctx.saidaEsperada === undefined) return { passed: false, detail: 'Este laboratório não diz que saída esperar.' };
      if (!ctx.execucao) return { passed: false, detail: 'O programa ainda não foi executado.' };
      if (ctx.execucao.erro || ctx.execucao.semFim) return { passed: false, detail: 'O programa parou antes do fim.' };
      if (mesmaSaida(ctx.execucao.saida, ctx.saidaEsperada)) return { passed: true };
      const tem = ctx.execucao.saida.replace(/\r/g, '').split('\n');
      const quer = ctx.saidaEsperada.split('\n');
      const i = quer.findIndex((l, k) => (tem[k] ?? '').trimEnd() !== l.trimEnd());
      return {
        passed: false,
        detail: i < 0
          ? 'A saída tem linhas a mais no fim.'
          : `A linha ${i + 1} devia ser "${quer[i]}" e saiu "${tem[i] ?? '(nada)'}".`,
      };
    },
  },
  {
    id: 'saidaContem',
    label: 'O terminal traz o que o enunciado combina',
    hint: 'Cada frase combinada tem de aparecer em algum lugar da saída, escrita igual.',
    run: ctx => {
      if (!ctx.saidaContem?.length) return { passed: false, detail: 'Este laboratório não diz o que esperar na saída.' };
      if (!ctx.execucao) return { passed: false, detail: 'O programa ainda não foi executado.' };
      const falta = ctx.saidaContem.find(t => !ctx.execucao!.saida.includes(t));
      return falta === undefined ? { passed: true } : { passed: false, detail: `A saída não traz "${falta}".` };
    },
  },
  {
    id: 'jsonEsperado',
    label: 'O arquivo JSON fica gravado com o que o enunciado pede',
    hint: 'Ler, mudar o objeto e gravar de volta: o arquivo só muda quando o programa escreve nele.',
    run: ctx => {
      const e = ctx.jsonEsperado;
      if (!e) return { passed: false, detail: 'Este laboratório não diz que arquivo esperar.' };
      if (!ctx.execucao) return { passed: false, detail: 'O programa ainda não foi executado.' };
      const texto = ctx.execucao.pasta[e.arquivo];
      if (texto === undefined) return { passed: false, detail: `Depois do programa, não há ${e.arquivo} na pasta.` };
      let valor: unknown;
      try { valor = JSON.parse(texto); } catch {
        return { passed: false, detail: `${e.arquivo} não é JSON válido depois do programa — gravou-se o objeto sem JSON.stringify?` };
      }
      return mesmoJson(valor, e.valor)
        ? { passed: true }
        : { passed: false, detail: `${e.arquivo} foi lido, mas não tem o que o enunciado pede. Abra o arquivo na lateral e compare.` };
    },
  },
  {
    id: 'jsonLegivel',
    label: 'O JSON é gravado com recuo, para uma pessoa conseguir ler',
    hint: 'JSON.stringify aceita mais dois argumentos: o segundo fica null, o terceiro é o tamanho do recuo.',
    run: ctx => {
      const e = ctx.jsonEsperado;
      if (!e) return { passed: false, detail: 'Este laboratório não diz que arquivo esperar.' };
      const texto = ctx.execucao?.pasta[e.arquivo];
      if (!ctx.execucao || texto === undefined) return { passed: false, detail: 'O programa ainda não gravou o arquivo.' };
      return /\n[ \t]+["{[\d]/.test(texto)
        ? { passed: true }
        : { passed: false, detail: `${e.arquivo} saiu numa linha só. Funciona para o programa, e ninguém consegue conferir à mão.` };
    },
  },
  daArvore('semVar', 'Declara com let e const, e nenhum var',
    'var é o jeito antigo: ele ignora as chaves do bloco. Troque cada um por let ou const.',
    'Ainda há var no programa, ou nenhuma variável declarada.'),
  daArvore('letEConst', 'Usa const para o que não muda e let para o que muda',
    'Um let que nunca muda devia ser const; e é preciso haver pelo menos um de cada.',
    'Falta um let que de fato mude, ou um const ao lado dele.'),
  daArvore('igualdadeEstrita', 'Compara com === e !==, e nunca com == ou !=',
    'O == converte antes de comparar, e "5" == 5 dá true. O === compara sem converter.',
    'Há == ou != no programa, ou nenhuma comparação.'),
  daArvore('seSenao', 'Tem um if com else, cada lado fazendo alguma coisa',
    'O else é o caminho de quando a condição não vale. Os dois blocos precisam ter instrução dentro.',
    'Falta um if com else, ou um dos dois lados está vazio.'),
  daArvore('laco', 'Tem um laço que repete alguma coisa',
    'for, for...of ou while — com pelo menos uma instrução dentro das chaves.',
    'Falta um laço com corpo.'),
  daArvore('funcaoNomeada', 'Tem uma função declarada com function, e ela é chamada',
    'function nome(parâmetros) { ... } — e depois o nome com parênteses, em algum lugar.',
    'Falta uma função com function que o programa chame.'),
  daArvore('funcaoDeSeta', 'Tem uma função de seta guardada numa const, e ela é chamada',
    'const nome = (parâmetros) => ... — e depois o nome com parênteses, em algum lugar.',
    'Falta uma função de seta numa const que o programa chame.'),
  daArvore('usaMap', 'Usa map para transformar cada item',
    'arranjo.map(item => ...) devolve um arranjo novo, do mesmo tamanho.',
    'Falta um map com uma função dentro.'),
  daArvore('usaFilter', 'Usa filter para escolher itens',
    'arranjo.filter(item => condição) devolve só os itens em que a condição deu true.',
    'Falta um filter com uma função dentro.'),
  daArvore('usaReduce', 'Usa reduce, com valor inicial, para juntar tudo num valor',
    'arranjo.reduce((acumulado, item) => ..., inicial) — o inicial vai depois da função.',
    'Falta um reduce com a função e o valor inicial.'),
  daArvore('objetoComMetodo', 'Tem um objeto com propriedades e um método que usa this',
    'O método é escrito como nome() { ... } dentro das chaves, e lê as propriedades por this.',
    'Falta um objeto com duas propriedades e um método que use this e seja chamado.'),
  daArvore('promessaPropria', 'Cria uma promessa com new Promise',
    'new Promise(resolve => ...) — e, dentro, alguma coisa que chame resolve quando terminar.',
    'Falta um new Promise com uma função que receba o resolve.'),
  daArvore('asyncAwait', 'Espera uma promessa com await',
    'await só funciona dentro de uma função async (ou no topo de um arquivo com import).',
    'Falta um await.'),
  daArvore('trataErroDaPromessa', 'Trata a promessa que falha, com try/catch em volta do await',
    'try { ... await ... } catch (erro) { ... } — o catch precisa fazer alguma coisa com o erro.',
    'Falta um try/catch em volta de um await, com o catch fazendo alguma coisa.'),
  daArvore('leArquivo', 'Lê um arquivo da pasta',
    'readFileSync(nome, "utf8") devolve o texto do arquivo; sem o "utf8", devolve bytes.',
    'Falta ler um arquivo com readFileSync ou readFile.'),
  daArvore('gravaArquivo', 'Grava um arquivo na pasta',
    'writeFileSync(nome, texto) substitui o arquivo inteiro pelo texto.',
    'Falta gravar um arquivo com writeFileSync ou writeFile.'),
  daArvore('jsonParse', 'Transforma texto JSON em objeto com JSON.parse',
    'O que se lê do arquivo é texto; JSON.parse o transforma em objetos e arranjos.',
    'Falta um JSON.parse.'),
  daArvore('jsonStringify', 'Transforma o objeto em texto JSON com JSON.stringify',
    'Arquivo só guarda texto; JSON.stringify faz o caminho de volta.',
    'Falta um JSON.stringify.'),
  daArvore('tresFuncoes', 'Tem pelo menos três funções suas, e todas são chamadas',
    'Cada uma resolve uma parte do problema. Função escrita e nunca chamada não conta: ela não roda.',
    'O programa tem menos de três funções próprias com corpo que alguém chame.'),
];

const POR_ID = new Map(SPECS.map(s => [s.id, s]));

/** Todos os ids que existem — é contra esta lista que o currículo é conferido. */
export const IDS_DE_JAVASCRIPT = SPECS.map(s => s.id);

/** Os que respondem pela última execução: envelhecem quando o código muda. */
export const IDS_DA_EXECUCAO_JS = ['roda', 'saidaEsperada', 'saidaContem', 'jsonEsperado', 'jsonLegivel', ...IDS_DA_ANALISE];

/** Roda as verificações pedidas. Id desconhecido vira verificação que nunca passa. */
export function validarJavascript(ctx: ContextoDeJavascript, ids: string[]): CheckResult[] {
  return ids.map(id => {
    const spec = POR_ID.get(id);
    if (!spec) return { id, label: id, hint: '', passed: false, detail: `Verificação desconhecida: ${id}.` };
    const r = spec.run(ctx);
    return { id, label: spec.label, hint: spec.hint, passed: r.passed, detail: r.detail };
  });
}
