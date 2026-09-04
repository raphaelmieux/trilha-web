import type { ResultadoDeExecucao } from '../labs/pythonRuntime';
import {
  resumoDaClassificacao, type Classificacao, type FalhaPlantada,
} from '../labs/falhasDePython';

/**
 * O que um programa de Python precisa ter, e como se confere.
 *
 * ── Quem lê o código é o Python ──────────────────────────────────────────
 * A estrutura sai do módulo `ast`, rodado dentro do próprio Pyodide, e não de
 * busca de texto. Procurar a palavra `while` acha o `while` que está dentro de
 * um comentário, dentro de uma string, e dentro de uma variável chamada
 * `while_ativo` — e nada disso é um laço. É a mesma lição do validador de CSS,
 * que lê a folha pelo CSSOM: quem sabe o que o código tem é o analisador da
 * linguagem.
 *
 * ── E a armadilha continua sendo o vazio ─────────────────────────────────
 * `while False: pass` é um `while` que não repete nada, e `if/elif/else` com
 * três `pass` não decide coisa alguma. O analisador exige corpo com pelo menos
 * uma instrução que não seja `pass`, do mesmo modo que o laço vazio dos blocos
 * reprova. Escrever a palavra-chave é a parte fácil.
 *
 * ── Rodar é uma verificação, e não um pressuposto ────────────────────────
 * Um programa pode ter todas as estruturas e não executar. O requisito 7 pede
 * um programa que resolva um problema, e programa que não roda não resolve
 * nada — então `roda` é uma tarefa da lista, com a mensagem de erro real do
 * Python ao lado.
 */

export interface CheckResult {
  id: string;
  label: string;
  hint: string;
  passed: boolean;
  detail?: string;
}

export interface ContextoDePython {
  codigo: string;
  /** O que o `ast` encontrou. Vazio quando o código nem compila. */
  achados: Record<string, boolean>;
  /** O erro de compilação, quando existe: é ele que impede a análise. */
  erroDeAnalise: string | null;
  /** A última execução, quando houve uma. */
  execucao: ResultadoDeExecucao | null;
  /** Só para os laboratórios que comparam a saída. */
  saidaEsperada?: string;
  /** Só para o laboratório de consertar: as falhas plantadas no programa. */
  falhas?: FalhaPlantada[];
  /** O que a pessoa marcou para cada falha, até agora. */
  classificacao?: Classificacao;
}

interface Spec {
  id: string;
  label: string;
  hint: string;
  run: (ctx: ContextoDePython) => { passed: boolean; detail?: string };
}

/**
 * Linhas que contam como programa.
 *
 * Linha em branco não é linha de programa, e linha só de comentário também
 * não — senão quarenta linhas se alcançam com quarenta comentários. Comentário
 * ao lado de código continua valendo: a linha tem código.
 */
export function linhasDePrograma(codigo: string): number {
  return codigo.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('#'))
    .length;
}

/** Compara saídas ignorando espaço no fim das linhas e linhas em branco finais. */
export function mesmaSaida(a: string, b: string): boolean {
  const limpar = (s: string) => s.replace(/\r/g, '').split('\n')
    .map(l => l.trimEnd()).join('\n').replace(/\n+$/, '');
  return limpar(a) === limpar(b);
}

/** Uma verificação que só olha o que o `ast` achou. */
const daArvore = (id: string, label: string, hint: string, faltou: string): Spec => ({
  id, label, hint,
  run: ctx => (ctx.achados[id]
    ? { passed: true }
    : {
      passed: false,
      detail: ctx.erroDeAnalise
        ? 'O programa não pôde ser lido: corrija o erro de sintaxe primeiro.'
        : faltou,
    }),
});

const SPECS: Spec[] = [
  {
    id: 'roda',
    label: 'O programa roda até o fim',
    hint: 'Clique em Executar. Se aparecer erro, leia a última linha da mensagem: é ela que diz o quê.',
    run: ctx => {
      if (!ctx.execucao) {
        return { passed: false, detail: 'O programa ainda não foi executado. Clique em Executar.' };
      }
      if (ctx.execucao.erro) {
        return {
          passed: false,
          detail: ctx.execucao.semFim
            ? 'O programa não terminou sozinho — provavelmente um "while" cuja condição nunca fica falsa.'
            : 'O programa parou com erro. A mensagem está no painel de saída.',
        };
      }
      return { passed: true };
    },
  },
  {
    id: 'saidaEsperada',
    label: 'A saída é a esperada',
    hint: 'Compare o painel de saída com o que o enunciado pede, linha por linha.',
    run: ctx => {
      if (ctx.saidaEsperada === undefined) {
        return { passed: false, detail: 'Este laboratório não define a saída esperada.' };
      }
      if (!ctx.execucao) return { passed: false, detail: 'O programa ainda não foi executado.' };
      if (ctx.execucao.erro) return { passed: false, detail: 'O programa parou com erro antes de produzir a saída.' };
      return mesmaSaida(ctx.execucao.saida, ctx.saidaEsperada)
        ? { passed: true }
        : { passed: false, detail: 'A saída saiu diferente da esperada. Confira o texto, os espaços e a ordem das linhas.' };
    },
  },
  {
    /*
      O requisito 6 pede identificar, corrigir **e classificar**. Consertar sem
      classificar é o que o depurador já faz por você; o que fica da lição é
      saber que o erro que ninguém acusa existe, e é o pior dos três.

      A verificação não diz qual falha está mal classificada — isso está no
      painel, com o recado ao lado de cada uma. Se dissesse aqui também, as
      duas diriam metade.
    */
    id: 'classificouAsFalhas',
    label: 'Cada falha classificada na família certa',
    hint: 'Três famílias, e o que as separa é quando o erro aparece: antes de rodar, no meio, ou nunca.',
    run: ctx => {
      const r = resumoDaClassificacao(ctx.falhas ?? [], ctx.classificacao ?? {});
      return r.completa ? { passed: true } : { passed: false, detail: r.detalhe };
    },
  },
  daArvore('leEExibe', 'Lê um dado do usuário e mostra o resultado',
    'Use input() para ler e print() para escrever.',
    'Falta input(), print(), ou os dois. O requisito pede que o programa leia algo e mostre um resultado.'),
  daArvore('tipoInteiro', 'Uma variável de número inteiro',
    'Um valor sem vírgula, como idade = 12, ou int(input(...)).',
    'Nenhuma variável recebe um número inteiro.'),
  daArvore('tipoDecimal', 'Uma variável de número decimal',
    'Um valor com ponto, como altura = 1.75, ou float(input(...)).',
    'Nenhuma variável recebe um número com casas decimais. Em Python a casa decimal é ponto, e não vírgula.'),
  daArvore('tipoTexto', 'Uma variável de texto',
    'Um valor entre aspas, como nome = "Raphael".',
    'Nenhuma variável recebe um texto entre aspas.'),
  daArvore('tipoBooleano', 'Uma variável de verdadeiro ou falso',
    'True ou False, com a primeira letra maiúscula.',
    'Nenhuma variável recebe True nem False. Repare na maiúscula: em Python é True, e não true.'),
  daArvore('operadorAritmetico', 'Uma conta',
    'Soma, subtração, multiplicação, divisão, resto ou potência.',
    'O programa não faz conta nenhuma.'),
  daArvore('operadorComparacao', 'Uma comparação',
    'Um teste com ==, !=, <, >, <= ou >=.',
    'O programa não compara nada. Cuidado com == e =: um compara, o outro atribui.'),
  daArvore('condicionalCompleto', 'Um if com elif e else',
    'Os três juntos, e cada um com algo dentro.',
    'Falta o conjunto completo: um if, um elif e um else, cada um fazendo alguma coisa.'),
  daArvore('lacoFor', 'Um laço for',
    'for item in ..., com blocos dentro.',
    'Nenhum laço for com corpo. Um for cujo corpo é só "pass" não repete nada.'),
  daArvore('lacoWhile', 'Um laço while',
    'while condição:, com blocos dentro e algo que faça a condição virar falsa.',
    'Nenhum laço while com corpo. Um while cujo corpo é só "pass" não repete nada.'),
  {
    id: 'quarentaLinhas',
    label: 'Pelo menos 40 linhas de programa',
    hint: 'Linha em branco e linha só de comentário não contam — o requisito é de programa.',
    run: ctx => {
      const n = linhasDePrograma(ctx.codigo);
      return n >= 40
        ? { passed: true }
        : { passed: false, detail: `O programa tem ${n} linha${n === 1 ? '' : 's'} de código. O requisito pede 40.` };
    },
  },
];

const POR_ID = new Map(SPECS.map(s => [s.id, s]));

/** Todos os ids que existem — é contra esta lista que o currículo é conferido. */
export const IDS_DE_PYTHON = SPECS.map(s => s.id);

/** Os ids que precisam da árvore, e por isso de uma análise antes. */
const FORA_DA_ARVORE = ['roda', 'saidaEsperada', 'quarentaLinhas', 'classificouAsFalhas'];
export const IDS_DA_ARVORE = SPECS.filter(s => !FORA_DA_ARVORE.includes(s.id)).map(s => s.id);

/**
 * As que respondem pela última execução, e não pelo texto de agora.
 *
 * A tela precisa saber a diferença. Quando o código muda depois de rodar, estas
 * envelhecem e a lista tem de dizer isso; as outras — contar linhas,
 * classificar as falhas — continuam valendo, e apagá-las junto diria que a
 * pessoa desfez um trabalho que ela não desfez.
 */
export const IDS_DA_EXECUCAO = ['roda', 'saidaEsperada', ...IDS_DA_ARVORE];

/**
 * Roda as verificações pedidas.
 *
 * Id desconhecido não some em silêncio: vira verificação que nunca passa, com o
 * motivo escrito — a lição prometeria uma tarefa que ninguém veria faltar.
 */
export function validarPython(ctx: ContextoDePython, ids: string[]): CheckResult[] {
  return ids.map(id => {
    const spec = POR_ID.get(id);
    if (!spec) {
      return { id, label: id, hint: '', passed: false, detail: `Verificação desconhecida: ${id}.` };
    }
    const r = spec.run(ctx);
    return { id, label: spec.label, hint: spec.hint, passed: r.passed, detail: r.detail };
  });
}
