import type { ResultadoDoDart } from '../labs/dartSimulado';
import { IDS_DA_ANALISE_DART, type AchadosDart, type IdDaAnaliseDart } from '../labs/dartAnalise';
import { mesmaSaida, type CheckResult } from './pythonValidator';

/**
 * O que um programa de Dart precisa ter, e como se confere.
 *
 * As duas fontes do Python e do JavaScript: a árvore, lida pelo analisador da
 * plataforma, e a execução no simulador. No Dart a execução tem uma etapa a
 * mais na frente — o compilador —, e "roda" passa a querer dizer as duas
 * coisas: compilou sem erro **e** chegou ao fim sem exceção.
 */

export interface ContextoDeDart {
  achados: AchadosDart | null;
  execucao: ResultadoDoDart | null;
  saidaEsperada?: string;
  saidaContem?: string[];
}

interface Spec {
  id: string;
  label: string;
  hint: string;
  run: (ctx: ContextoDeDart) => { passed: boolean; detail?: string };
}

const daArvore = (id: IdDaAnaliseDart, label: string, hint: string, faltou: string): Spec => ({
  id, label, hint,
  run: ctx => {
    if (!ctx.achados) {
      return { passed: false, detail: ctx.execucao ? 'O programa não pôde ser lido: corrija o erro de sintaxe que o terminal mostra.' : 'O programa ainda não foi executado.' };
    }
    return ctx.achados[id] ? { passed: true } : { passed: false, detail: faltou };
  },
});

const SPECS: Spec[] = [
  {
    id: 'roda',
    label: 'O programa compila e roda até o fim, sem erro',
    hint: 'Clique em Executar. Erro de compilação aparece antes de qualquer linha rodar; exceção aparece no meio, depois do que já foi escrito.',
    run: ctx => {
      const r = ctx.execucao;
      if (!r) return { passed: false, detail: 'O programa ainda não foi executado.' };
      if (r.problemas.length) return { passed: false, detail: 'O compilador recusou o programa — leia o primeiro erro no terminal.' };
      if (r.semFim) return { passed: false, detail: 'O programa não terminou sozinho.' };
      if (r.erro) return { passed: false, detail: 'O programa parou com uma exceção — leia o terminal.' };
      return { passed: true };
    },
  },
  {
    id: 'saidaEsperada',
    label: 'Escreve no terminal exatamente o que o enunciado pede',
    hint: 'Compare linha por linha: texto, ordem, maiúsculas e o espaço entre as palavras.',
    run: ctx => {
      if (ctx.saidaEsperada === undefined) return { passed: false, detail: 'Este laboratório não diz que saída esperar.' };
      const r = ctx.execucao;
      if (!r) return { passed: false, detail: 'O programa ainda não foi executado.' };
      if (r.problemas.length) return { passed: false, detail: 'O programa nem chegou a rodar: o compilador o recusou.' };
      if (r.erro || r.semFim) return { passed: false, detail: 'O programa parou antes do fim.' };
      if (mesmaSaida(r.saida, ctx.saidaEsperada)) return { passed: true };
      const tem = r.saida.replace(/\r/g, '').split('\n');
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
      const r = ctx.execucao;
      if (!r) return { passed: false, detail: 'O programa ainda não foi executado.' };
      if (r.problemas.length) return { passed: false, detail: 'O programa nem chegou a rodar: o compilador o recusou.' };
      const falta = ctx.saidaContem.find(t => !r.saida.includes(t));
      return falta === undefined ? { passed: true } : { passed: false, detail: `A saída não traz "${falta}".` };
    },
  },
  daArvore('tipoExplicito', 'Declara pelo menos duas variáveis com o tipo escrito',
    'int idade = 12; String nome = "Ana"; — o tipo vem antes do nome.',
    'Faltam variáveis com o tipo escrito na frente: há menos de duas.'),
  daArvore('tipoInferido', 'Declara pelo menos duas variáveis com o tipo inferido',
    'var e final sem tipo: o compilador descobre o tipo pelo valor inicial.',
    'Faltam variáveis com var ou final sem tipo, cada uma com valor inicial.'),
  daArvore('interpolacao', 'Monta texto com interpolação, e não com +',
    'Dentro das aspas, $nome põe o valor da variável; ${conta} põe o resultado de uma expressão.',
    'Nenhum texto do programa usa $ para pôr um valor dentro das aspas.'),
  daArvore('tipoAnulavel', 'Declara um tipo anulável, com ?',
    'String? diz que ali pode não haver texto. Sem o ?, o compilador garante que sempre há.',
    'Nenhuma variável, parâmetro ou campo do programa tem tipo com ?.'),
  daArvore('usoSeguroDoNulo', 'Trata o nulo antes de usar o valor',
    '?? dá um valor para o caso de nulo; ?. só chama se houver objeto; if (x != null) promove a variável dentro do bloco.',
    'O programa não usa ??, ?., ??= nem compara com null.'),
  daArvore('semExclamacao', 'Trata o nulo sem o operador !',
    'O ! diz ao compilador "confie em mim": se o valor for nulo, o programa para. Troque por ?? ou por um if.',
    'Ainda há ! depois de um valor, ou nenhum nulo foi tratado.'),
  daArvore('usaLista', 'Usa uma lista', 'Lista é [ ] com os itens em ordem: List<String> nomes = [\'Ana\', \'Bia\'];',
    'O programa não tem lista nenhuma.'),
  daArvore('usaMapa', 'Usa um mapa', 'Mapa liga chave a valor: Map<String, int> pontos = {\'Ana\': 10};',
    'O programa não tem mapa nenhum.'),
  daArvore('usaConjunto', 'Usa um conjunto', 'Conjunto é { } sem repetição e sem chave: Set<String> unidades = {\'Águia\'};',
    'O programa não tem conjunto nenhum.'),
  daArvore('iteraColecao', 'Percorre uma coleção',
    'for (final item in lista) { ... } — ou forEach, map, where.',
    'Nenhum for-in nem forEach, map ou where no programa.'),
  daArvore('funcaoPropria', 'Tem uma função sua, fora do main, e ela é chamada',
    'Escreva a função acima do main, com tipo de retorno e parâmetros, e chame-a lá dentro.',
    'Falta uma função fora do main que o programa chame.'),
  daArvore('classeCompleta', 'Tem uma classe com atributos, construtor e método, e ela é usada',
    'class Nome { campos; Nome(this.campo); void metodo() { ... } } — e depois Nome(...) no main.',
    'Falta uma classe com campo, construtor e um método além do toString, instanciada no programa.'),
  daArvore('doisObjetos', 'Cria pelo menos dois objetos da mesma classe',
    'Cada chamada ao construtor faz um objeto novo, com os seus próprios valores.',
    'Nenhuma classe é instanciada duas vezes.'),
  daArvore('heranca', 'Tem uma classe que herda de outra, e ela é usada',
    'class Filha extends Mae { ... } — e um objeto da filha criado no programa.',
    'Falta uma classe com extends apontando para outra classe sua, instanciada no programa.'),
  daArvore('sobrescreve', 'A classe filha sobrescreve um método da mãe, com @override',
    'Escreva na filha um método com o mesmo nome do da mãe, com @override na linha de cima.',
    'Nenhum método com @override na filha tem o nome de um método da mãe.'),
  daArvore('chamaMae', 'O construtor da filha passa os dados para o construtor da mãe',
    'super.nome no parâmetro, ou : super(nome) depois dos parênteses.',
    'O construtor da filha não chama o da mãe.'),
  daArvore('importaArquivo', 'O programa usa o que está no outro arquivo, com import',
    'import \'unidade.dart\'; no alto do principal — e depois use a classe que mora lá.',
    'O principal não importa o outro arquivo, ou não usa nada do que está nele.'),
  daArvore('usaBiblioteca', 'Usa uma biblioteca do Dart, com import \'dart:...\'',
    'import \'dart:math\'; dá max, min, sqrt e pi; import \'dart:io\'; dá stdin e stdout.',
    'Falta importar uma biblioteca dart: e usar alguma coisa dela.'),
  daArvore('duasClassesRelacionadas', 'Tem duas classes que se relacionam',
    'Uma guarda a outra num campo — uma Unidade com List<Desbravador> — ou herda dela.',
    'Faltam duas classes suas em que uma guarde a outra num campo, ou herde dela.'),
  daArvore('leEntrada', 'Lê o que se digita no terminal',
    'stdin.readLineSync() devolve a linha digitada — ou null quando a entrada acaba.',
    'O programa não chama stdin.readLineSync().'),
];

const POR_ID = new Map(SPECS.map(s => [s.id, s]));

/** Todos os ids que existem — é contra esta lista que o currículo é conferido. */
export const IDS_DE_DART = SPECS.map(s => s.id);

/** Os que respondem pela última execução: envelhecem quando o código muda. */
export const IDS_DA_EXECUCAO_DART = ['roda', 'saidaEsperada', 'saidaContem', ...IDS_DA_ANALISE_DART];

export function validarDart(ctx: ContextoDeDart, ids: string[]): CheckResult[] {
  return ids.map(id => {
    const spec = POR_ID.get(id);
    if (!spec) return { id, label: id, hint: '', passed: false, detail: `Verificação desconhecida: ${id}.` };
    const r = spec.run(ctx);
    return { id, label: spec.label, hint: spec.hint, passed: r.passed, detail: r.detail };
  });
}
