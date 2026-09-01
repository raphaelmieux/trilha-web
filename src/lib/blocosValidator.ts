import {
  ehContainer, todosOsBlocos,
  type Bloco, type Personagem, type Projeto,
} from '../labs/blocos';

/**
 * O que um projeto de blocos precisa ter, e como se confere.
 *
 * ── A armadilha aqui é o vazio ───────────────────────────────────────────
 * Um `repita` sem nada dentro não é um laço: é um bloco na tela. Um `se` de
 * corpo vazio não decide nada. Uma variável criada e nunca alterada não
 * demonstra variável — o documento pede "criar uma variável **e alterar seu
 * valor durante a execução**". Toda verificação daqui exige que a coisa
 * aconteça, e não que o bloco exista, porque arrastar o bloco é a parte fácil
 * e é exatamente o que um laboratório mal feito aprovaria.
 *
 * É a mesma regra do "zero link não é zero link quebrado", e do `display: flex`
 * que sozinho não alinha nada.
 *
 * ── E exige que a pilha rode ─────────────────────────────────────────────
 * Blocos soltos numa pilha sem chapéu nunca executam. Uma verificação que os
 * contasse aprovaria um projeto que, ao clicar na bandeira, não faz nada — e o
 * desbravador levaria isso ao examinador.
 */

export interface CheckResult {
  id: string;
  label: string;
  hint: string;
  passed: boolean;
  detail?: string;
}

interface Contexto {
  projeto: Projeto;
  /** As pilhas que de fato rodam: as que começam com um chapéu. */
  pilhasVivas: { personagem: Personagem; blocos: Bloco[] }[];
  /** Todos os blocos alcançáveis a partir de um chapéu. */
  vivos: Bloco[];
}

export interface BlocoCheckSpec {
  id: string;
  label: string;
  hint: string;
  run: (ctx: Contexto) => { passed: boolean; detail?: string };
}

const CHAPEUS = new Set(['quandoBandeira', 'quandoTecla', 'quandoClicado']);

/** Achata uma lista de blocos, entrando nos containers. */
function achatar(blocos: Bloco[]): Bloco[] {
  const saida: Bloco[] = [];
  for (const b of blocos) {
    saida.push(b);
    if (ehContainer(b)) saida.push(...achatar(b.corpo));
  }
  return saida;
}

function contexto(projeto: Projeto): Contexto {
  const pilhasVivas: Contexto['pilhasVivas'] = [];
  for (const p of projeto.personagens) {
    for (const pilha of p.pilhas) {
      const chapeu = pilha.blocos[0];
      if (chapeu && CHAPEUS.has(chapeu.tipo)) {
        pilhasVivas.push({ personagem: p, blocos: pilha.blocos });
      }
    }
  }
  return { projeto, pilhasVivas, vivos: pilhasVivas.flatMap(p => achatar(p.blocos)) };
}

/** Um container que tem alguma coisa dentro — só ele conta. */
const containerCheio = (b: Bloco, tipos: Bloco['tipo'][]) =>
  tipos.includes(b.tipo) && ehContainer(b) && b.corpo.length > 0;

const SPECS: BlocoCheckSpec[] = [
  {
    id: 'bandeira',
    label: 'Uma pilha que começa na bandeira verde',
    hint: 'Pegue o bloco "quando a bandeira verde for clicada" e ponha algo embaixo dele.',
    run: ctx => {
      const p = ctx.pilhasVivas.find(x => x.blocos[0].tipo === 'quandoBandeira');
      if (!p) return { passed: false, detail: 'Nenhuma pilha começa com o chapéu da bandeira verde. Sem ele, nada acontece ao clicar em ▶.' };
      return p.blocos.length > 1
        ? { passed: true }
        : { passed: false, detail: 'O chapéu da bandeira está sozinho. Encaixe pelo menos um bloco embaixo dele.' };
    },
  },
  {
    id: 'moverPorTecla',
    label: 'Mover um personagem pelo teclado',
    hint: 'Um chapéu "quando a tecla ... for pressionada" com um bloco de movimento embaixo.',
    run: ctx => {
      const teclas = ctx.pilhasVivas.filter(p => p.blocos[0].tipo === 'quandoTecla');
      if (teclas.length === 0) {
        return { passed: false, detail: 'Nenhuma pilha começa com um chapéu de tecla.' };
      }
      const move = teclas.some(p =>
        achatar(p.blocos).some(b => b.tipo === 'mover' || b.tipo === 'subir' || b.tipo === 'irPara'));
      return move
        ? { passed: true }
        : { passed: false, detail: 'A tecla dispara uma pilha, mas nada nela move o personagem. Falta um bloco de movimento.' };
    },
  },
  {
    id: 'laco',
    label: 'Um laço de repetição',
    hint: '"repita ... vezes" ou "sempre", com blocos dentro.',
    run: ctx => {
      const tem = ctx.vivos.some(b => containerCheio(b, ['repita', 'sempre']));
      if (tem) return { passed: true };
      const vazio = ctx.vivos.some(b => b.tipo === 'repita' || b.tipo === 'sempre');
      return {
        passed: false,
        detail: vazio
          ? 'Há um laço, e ele está vazio. Um laço sem nada dentro repete o nada — ponha os blocos que devem se repetir dentro dele.'
          : 'Nenhuma pilha usa "repita" nem "sempre".',
      };
    },
  },
  {
    id: 'condicional',
    label: 'Um bloco condicional',
    hint: '"se ..., então" com blocos dentro.',
    run: ctx => {
      const tem = ctx.vivos.some(b => containerCheio(b, ['se']));
      if (tem) return { passed: true };
      const vazio = ctx.vivos.some(b => b.tipo === 'se');
      return {
        passed: false,
        detail: vazio
          ? 'O "se" está vazio. Ele decide se algo acontece — sem nada dentro, não decide nada.'
          : 'Nenhuma pilha usa o bloco "se".',
      };
    },
  },
  {
    id: 'variavel',
    label: 'Uma variável que muda durante a execução',
    hint: 'Crie a variável e use "mude ... em ..." ou "defina ... para ..." numa pilha que roda.',
    run: ctx => {
      if (ctx.projeto.variaveis.length === 0) {
        return { passed: false, detail: 'Nenhuma variável foi criada.' };
      }
      const muda = ctx.vivos.some(b => b.tipo === 'mudeVariavel' || b.tipo === 'definaVariavel');
      return muda
        ? { passed: true }
        : { passed: false, detail: 'A variável existe e ninguém a altera. O requisito pede que o valor mude durante a execução — não basta criá-la.' };
    },
  },
  {
    id: 'aparenciaOuSom',
    label: 'Trocar de aparência ou emitir som por um evento',
    hint: '"próximo traje" ou "toque um som" dentro de uma pilha que um evento dispara.',
    run: ctx => {
      const tem = ctx.vivos.some(b => b.tipo === 'proximoTraje' || b.tipo === 'toqueSom');
      return tem
        ? { passed: true }
        : { passed: false, detail: 'Nenhuma pilha troca o traje nem toca um som.' };
    },
  },
  {
    id: 'doisPersonagens',
    label: 'Dois personagens com programa',
    hint: 'Os dois precisam ter pelo menos uma pilha que roda.',
    run: ctx => {
      const comPrograma = new Set(ctx.pilhasVivas.map(p => p.personagem.id));
      return comPrograma.size >= 2
        ? { passed: true }
        : {
          passed: false,
          detail: comPrograma.size === 1
            ? 'Só um personagem tem pilha começando por um chapéu. O jogo precisa de dois que façam alguma coisa.'
            : 'Nenhum personagem tem pilha começando por um chapéu. O jogo precisa de dois que façam alguma coisa.',
        };
    },
  },
  {
    id: 'interacao',
    label: 'Os dois personagens interagem',
    hint: 'Um "se tocando em ..." que nomeie o outro personagem.',
    run: ctx => {
      const nomes = new Set(ctx.projeto.personagens.map(p => p.id));
      const tem = ctx.vivos.some(b =>
        b.tipo === 'se' && b.condicao.tipo === 'tocando' && nomes.has(b.condicao.quem) && b.corpo.length > 0);
      if (tem) return { passed: true };
      const naBorda = ctx.vivos.some(b => b.tipo === 'se' && b.condicao.tipo === 'tocando');
      return {
        passed: false,
        detail: naBorda
          ? 'Há um "tocando", mas ele fala da borda do palco. O requisito pede que os dois personagens se encontrem — escolha o outro personagem na condição.'
          : 'Nenhuma condição pergunta se um personagem está tocando no outro.',
      };
    },
  },
  {
    id: 'placar',
    label: 'Um placar que sobe quando algo acontece',
    hint: 'Um "mude ... em ..." dentro de um "se".',
    run: ctx => {
      const dentroDeSe = (blocos: Bloco[]): boolean => blocos.some(b => {
        if (b.tipo === 'se') {
          return achatar(b.corpo).some(x => x.tipo === 'mudeVariavel')
            || dentroDeSe(b.corpo);
        }
        return ehContainer(b) && dentroDeSe(b.corpo);
      });
      const tem = ctx.pilhasVivas.some(p => dentroDeSe(p.blocos));
      return tem
        ? { passed: true }
        : { passed: false, detail: 'Nenhum "mude a variável" está dentro de um "se". Um placar que sobe sozinho, fora de qualquer condição, não marca ponto por nada — sobe o tempo todo.' };
    },
  },
  {
    id: 'fimDeJogo',
    label: 'Uma condição de vitória ou derrota',
    hint: 'Um "se" que compara a variável com um número.',
    run: ctx => {
      const tem = ctx.vivos.some(b =>
        b.tipo === 'se' && b.condicao.tipo === 'variavelMaiorQue' && b.corpo.length > 0);
      return tem
        ? { passed: true }
        : { passed: false, detail: 'Nenhum "se" compara uma variável com um número. É essa comparação que decide quando o jogo acabou.' };
    },
  },
];

const POR_ID = new Map(SPECS.map(s => [s.id, s]));

/** Todos os ids que existem — é contra esta lista que o currículo é conferido. */
export const IDS_DE_BLOCOS = SPECS.map(s => s.id);

/**
 * Roda as verificações pedidas contra o projeto.
 *
 * Id desconhecido não some em silêncio: vira uma verificação que nunca passa,
 * com o motivo escrito. Ignorar produziria um laboratório com menos tarefas do
 * que a lição prometeu, e ninguém veria.
 */
export function validarBlocos(projeto: Projeto, ids: string[]): CheckResult[] {
  const ctx = contexto(projeto);
  return ids.map(id => {
    const spec = POR_ID.get(id);
    if (!spec) {
      return { id, label: id, hint: '', passed: false, detail: `Verificação desconhecida: ${id}.` };
    }
    const r = spec.run(ctx);
    return { id, label: spec.label, hint: spec.hint, passed: r.passed, detail: r.detail };
  });
}

/** Quantos blocos o projeto tem, contando os de dentro dos containers. */
export const contarBlocos = (p: Projeto) => todosOsBlocos(p).length;
