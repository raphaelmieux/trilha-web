/**
 * O que um projeto do Scratch precisa ter, lido do sb3 que o próprio VM produz.
 *
 * ── Por que isto substitui o validador de blocos nosso ───────────────────
 * O editor de blocos que a plataforma tinha existia por uma razão só: um
 * Scratch dentro de um iframe é caixa fechada, e o laboratório cairia em
 * "clicou em salvar, então passou". Com o `scratch-gui` embutido, `vm.toJSON()`
 * devolve o projeto inteiro, e a objeção some — a verificação passa a olhar a
 * árvore de verdade, montada no programa de verdade.
 *
 * ── A armadilha continua sendo o vazio ───────────────────────────────────
 * Um `repeat` sem nada dentro não é um laço, um `if` de corpo vazio não decide,
 * e uma variável criada e nunca alterada não demonstra variável. Toda
 * verificação exige que a coisa aconteça, e não que o bloco exista — arrastar o
 * bloco é a parte fácil, e é o que um laboratório mal feito aprovaria.
 *
 * ── E o que não sai de um chapéu não roda ────────────────────────────────
 * No Scratch uma pilha solta fica na tela e nunca executa. Contá-la aprovaria
 * um projeto que não faz nada ao clicar na bandeira — e o desbravador levaria
 * isso ao examinador.
 */

export interface CheckResult {
  id: string;
  label: string;
  hint: string;
  passed: boolean;
  detail?: string;
}

/* ────────────────────────────────────────────────────────────────────────
   A forma do sb3, do tamanho do que lemos
   ──────────────────────────────────────────────────────────────────────── */

export interface BlocoSb3 {
  opcode: string;
  next: string | null;
  parent: string | null;
  /** `[nome, [tipo, valor]]` para literais, ou `[nome, idDoBloco]` para encaixes. */
  inputs: Record<string, unknown>;
  fields: Record<string, unknown>;
  topLevel?: boolean;
  shadow?: boolean;
}

export interface AlvoSb3 {
  isStage: boolean;
  name: string;
  blocks: Record<string, BlocoSb3 | unknown[]>;
  variables: Record<string, unknown>;
}

export interface ProjetoSb3 {
  targets: AlvoSb3[];
}

/** O sb3 traz blocos comprimidos como array; esses nunca são estruturas. */
const ehBloco = (b: BlocoSb3 | unknown[]): b is BlocoSb3 =>
  !Array.isArray(b) && typeof (b as BlocoSb3)?.opcode === 'string';

/* ────────────────────────────────────────────────────────────────────────
   O contexto: só o que roda
   ──────────────────────────────────────────────────────────────────────── */

const CHAPEUS = new Set([
  'event_whenflagclicked', 'event_whenkeypressed', 'event_whenthisspriteclicked',
  'event_whenbroadcastreceived', 'event_whenbackdropswitchesto',
  'event_whengreaterthan', 'control_start_as_clone',
]);

const MOVIMENTO = new Set([
  'motion_movesteps', 'motion_gotoxy', 'motion_goto', 'motion_glidesecstoxy',
  'motion_glideto', 'motion_changexby', 'motion_setx', 'motion_changeyby',
  'motion_sety', 'motion_turnright', 'motion_turnleft', 'motion_pointindirection',
]);

const APARENCIA_OU_SOM = new Set([
  'looks_nextcostume', 'looks_switchcostumeto', 'looks_nextbackdrop',
  'looks_switchbackdropto', 'looks_changesizeby', 'looks_seteffectto',
  'looks_changeeffectby', 'sound_play', 'sound_playuntildone',
]);

const LACOS = new Set(['control_repeat', 'control_forever', 'control_repeat_until']);
const SES = new Set(['control_if', 'control_if_else']);

interface Pilha {
  alvo: AlvoSb3;
  /** O chapéu que a abre. */
  chapeu: BlocoSb3;
  /** Todos os blocos alcançáveis a partir dele, incluindo os de dentro. */
  blocos: BlocoSb3[];
}

interface Contexto {
  projeto: ProjetoSb3;
  pilhas: Pilha[];
  /** Todos os blocos que rodam, de todos os alvos. */
  vivos: BlocoSb3[];
  /** Nome dos personagens, sem o palco. */
  personagens: string[];
  temVariavel: boolean;
}

/** Segue `next` e desce por todo encaixe, juntando o que a pilha executa. */
function percorrer(mapa: Record<string, BlocoSb3 | unknown[]>, id: string | null): BlocoSb3[] {
  const saida: BlocoSb3[] = [];
  const vistos = new Set<string>();

  const descer = (atual: string | null) => {
    while (atual && !vistos.has(atual)) {
      vistos.add(atual);
      const b = mapa[atual];
      if (!ehBloco(b)) return;
      saida.push(b);
      /* Os encaixes: SUBSTACK e SUBSTACK2 são o miolo dos laços e do se;
         os outros são operandos, e contam igual — um `>` dentro da condição
         é parte do que a pilha faz. */
      for (const valor of Object.values(b.inputs ?? {})) {
        if (!Array.isArray(valor)) continue;
        for (const parte of valor) {
          if (typeof parte === 'string' && mapa[parte]) descer(parte);
        }
      }
      atual = b.next;
    }
  };

  descer(id);
  return saida;
}

/** O bloco encaixado num input, quando há um. */
function encaixe(
  mapa: Record<string, BlocoSb3 | unknown[]>, b: BlocoSb3, nome: string,
): BlocoSb3 | null {
  const valor = b.inputs?.[nome];
  if (!Array.isArray(valor)) return null;
  for (const parte of valor) {
    if (typeof parte === 'string') {
      const alvo = mapa[parte];
      if (ehBloco(alvo)) return alvo;
    }
  }
  return null;
}

/*
  Uma variável usada como operando não é um bloco no sb3.

  Arrastando `placar` para dentro de um `>`, o editor mostra um bloco redondo —
  mas ao serializar, o `data_variable` **some**: o sb3 o comprime dentro do
  próprio input, como `[12, "placar", "<id>"]`. O 12 é o código de variável na
  tabela de primitivos do formato.

  Procurar o opcode `data_variable`, que é o caminho óbvio, reprovava todo
  projeto certo — e a mensagem mandava a pessoa fazer exatamente o que ela já
  tinha feito. Só apareceu porque o teste monta o jogo no editor de verdade e
  cobra que as dez fiquem verdes.
*/
const VARIAVEL_COMPRIMIDA = 12;

function operandoEhVariavel(
  mapa: Record<string, BlocoSb3 | unknown[]>, b: BlocoSb3, nome: string,
): boolean {
  if (encaixe(mapa, b, nome)?.opcode === 'data_variable') return true;
  const valor = b.inputs?.[nome];
  if (!Array.isArray(valor)) return false;
  return valor.some(parte => Array.isArray(parte) && parte[0] === VARIAVEL_COMPRIMIDA);
}

/** O miolo de um container tem algum bloco? É o que separa laço de bloco na tela. */
const corpoCheio = (mapa: Record<string, BlocoSb3 | unknown[]>, b: BlocoSb3) =>
  encaixe(mapa, b, 'SUBSTACK') !== null || encaixe(mapa, b, 'SUBSTACK2') !== null;

export function contexto(projeto: ProjetoSb3): Contexto {
  const pilhas: Pilha[] = [];
  for (const alvo of projeto.targets ?? []) {
    for (const [id, b] of Object.entries(alvo.blocks ?? {})) {
      if (!ehBloco(b) || !CHAPEUS.has(b.opcode)) continue;
      pilhas.push({ alvo, chapeu: b, blocos: percorrer(alvo.blocks, id) });
    }
  }
  return {
    projeto,
    pilhas,
    vivos: pilhas.flatMap(p => p.blocos),
    personagens: (projeto.targets ?? []).filter(t => !t.isStage).map(t => t.name),
    temVariavel: (projeto.targets ?? [])
      .some(t => Object.keys(t.variables ?? {}).length > 0),
  };
}

/** O mapa de blocos do alvo de uma pilha — os encaixes se resolvem nele. */
const mapaDa = (p: Pilha) => p.alvo.blocks;

/* ────────────────────────────────────────────────────────────────────────
   As verificações
   ──────────────────────────────────────────────────────────────────────── */

interface Spec {
  id: string;
  label: string;
  hint: string;
  run: (ctx: Contexto) => { passed: boolean; detail?: string };
}

const SPECS: Spec[] = [
  {
    id: 'bandeira',
    label: 'Uma pilha que começa na bandeira verde',
    hint: 'Em Eventos, pegue "quando ⚑ for clicado" e encaixe algo embaixo dele.',
    run: ctx => {
      const p = ctx.pilhas.find(x => x.chapeu.opcode === 'event_whenflagclicked');
      if (!p) return { passed: false, detail: 'Nenhuma pilha começa com "quando ⚑ for clicado". Sem esse bloco, nada acontece ao clicar na bandeira.' };
      return p.blocos.length > 1
        ? { passed: true }
        : { passed: false, detail: 'O chapéu da bandeira está sozinho. Encaixe pelo menos um bloco embaixo dele.' };
    },
  },
  {
    id: 'moverPorTecla',
    label: 'Mover um personagem pelo teclado',
    hint: 'Um "quando a tecla ... for pressionada" com um bloco de Movimento embaixo.',
    run: ctx => {
      const teclas = ctx.pilhas.filter(p => p.chapeu.opcode === 'event_whenkeypressed');
      if (teclas.length === 0) return { passed: false, detail: 'Nenhuma pilha começa com um chapéu de tecla.' };
      return teclas.some(p => p.blocos.some(b => MOVIMENTO.has(b.opcode)))
        ? { passed: true }
        : { passed: false, detail: 'A tecla dispara uma pilha, mas nada nela move o personagem. Falta um bloco de Movimento.' };
    },
  },
  {
    id: 'laco',
    label: 'Um laço de repetição',
    hint: '"repita ... vezes" ou "sempre", com blocos dentro.',
    run: ctx => {
      const cheio = ctx.pilhas.some(p =>
        p.blocos.some(b => LACOS.has(b.opcode) && corpoCheio(mapaDa(p), b)));
      if (cheio) return { passed: true };
      const vazio = ctx.vivos.some(b => LACOS.has(b.opcode));
      return {
        passed: false,
        detail: vazio
          ? 'Há um laço, e ele está vazio. Um laço sem nada dentro repete o nada — ponha os blocos que devem se repetir na boca dele.'
          : 'Nenhuma pilha usa "repita" nem "sempre".',
      };
    },
  },
  {
    id: 'condicional',
    label: 'Um bloco condicional',
    hint: '"se ... então", com blocos dentro.',
    run: ctx => {
      const cheio = ctx.pilhas.some(p =>
        p.blocos.some(b => SES.has(b.opcode) && corpoCheio(mapaDa(p), b)));
      if (cheio) return { passed: true };
      const vazio = ctx.vivos.some(b => SES.has(b.opcode));
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
    hint: 'Crie a variável em Variáveis e use "mude ... em ..." ou "defina ... para ...".',
    run: ctx => {
      if (!ctx.temVariavel) return { passed: false, detail: 'Nenhuma variável foi criada. O botão fica em Variáveis, na paleta.' };
      const muda = ctx.vivos.some(b =>
        b.opcode === 'data_setvariableto' || b.opcode === 'data_changevariableby');
      return muda
        ? { passed: true }
        : { passed: false, detail: 'A variável existe e ninguém a altera. O requisito pede que o valor mude durante a execução — não basta criá-la.' };
    },
  },
  {
    id: 'aparenciaOuSom',
    label: 'Trocar de aparência ou emitir som por um evento',
    hint: '"próxima fantasia" ou "toque o som ..." dentro de uma pilha que um evento dispara.',
    run: ctx => (ctx.vivos.some(b => APARENCIA_OU_SOM.has(b.opcode))
      ? { passed: true }
      : { passed: false, detail: 'Nenhuma pilha troca a fantasia nem toca um som.' }),
  },
  {
    id: 'doisPersonagens',
    label: 'Dois personagens com programa',
    hint: 'Os dois precisam ter pelo menos uma pilha que começa num chapéu.',
    run: ctx => {
      const comPrograma = new Set(
        ctx.pilhas.filter(p => !p.alvo.isStage && p.blocos.length > 1).map(p => p.alvo.name));
      return comPrograma.size >= 2
        ? { passed: true }
        : {
          passed: false,
          detail: comPrograma.size === 1
            ? 'Só um personagem tem pilha que roda. O jogo precisa de dois que façam alguma coisa.'
            : 'Nenhum personagem tem pilha começando por um chapéu.',
        };
    },
  },
  {
    id: 'interacao',
    label: 'Os dois personagens interagem',
    hint: 'Um "se tocando em ..." escolhendo o outro personagem.',
    run: ctx => {
      /* O menu do sensor guarda o alvo em `fields.TOUCHINGOBJECTMENU`. A borda
         e o ponteiro são `_edge_` e `_mouse_`: tocar a borda é tocar o palco, e
         não o outro personagem — o requisito pede que os dois se encontrem. */
      let naBorda = false;
      for (const p of ctx.pilhas) {
        for (const b of p.blocos) {
          if (b.opcode !== 'sensing_touchingobject') continue;
          const menu = encaixe(mapaDa(p), b, 'TOUCHINGOBJECTMENU');
          const campo = (menu?.fields?.TOUCHINGOBJECTMENU ?? b.fields?.TOUCHINGOBJECTMENU) as unknown[] | undefined;
          const quem = Array.isArray(campo) ? String(campo[0]) : '';
          if (ctx.personagens.includes(quem)) return { passed: true };
          if (quem === '_edge_' || quem === '_mouse_') naBorda = true;
        }
      }
      return {
        passed: false,
        detail: naBorda
          ? 'Há um "tocando", mas ele fala da borda ou do ponteiro. O requisito pede que os dois personagens se encontrem — escolha o outro personagem no menu.'
          : 'Nenhuma condição pergunta se um personagem está tocando no outro.',
      };
    },
  },
  {
    id: 'placar',
    label: 'Um placar que sobe quando algo acontece',
    hint: 'Um "mude ... em ..." dentro da boca de um "se".',
    run: ctx => {
      for (const p of ctx.pilhas) {
        for (const b of p.blocos) {
          if (!SES.has(b.opcode)) continue;
          for (const boca of ['SUBSTACK', 'SUBSTACK2']) {
            const dentro = encaixe(mapaDa(p), b, boca);
            if (!dentro) continue;
            const idDentro = Object.entries(p.alvo.blocks)
              .find(([, x]) => x === dentro)?.[0] ?? null;
            if (percorrer(p.alvo.blocks, idDentro)
              .some(x => x.opcode === 'data_changevariableby')) return { passed: true };
          }
        }
      }
      return {
        passed: false,
        detail: 'Nenhum "mude a variável" está dentro de um "se". Um placar que sobe fora de qualquer condição não marca ponto por nada — sobe o tempo todo.',
      };
    },
  },
  {
    id: 'fimDeJogo',
    label: 'Uma condição de vitória ou derrota',
    hint: 'Um "se" cuja pergunta compara a variável com um número.',
    run: ctx => {
      const COMPARA = new Set(['operator_gt', 'operator_lt', 'operator_equals']);
      for (const p of ctx.pilhas) {
        for (const b of p.blocos) {
          if (!SES.has(b.opcode)) continue;
          const cond = encaixe(mapaDa(p), b, 'CONDITION');
          if (!cond || !COMPARA.has(cond.opcode)) continue;
          /* Um dos lados precisa ser a variável: comparar dois números fixos
             dá sempre a mesma resposta, e não decide nada. */
          const temVariavel = ['OPERAND1', 'OPERAND2']
            .some(n => operandoEhVariavel(mapaDa(p), cond, n));
          if (temVariavel && corpoCheio(mapaDa(p), b)) return { passed: true };
        }
      }
      return {
        passed: false,
        detail: 'Nenhum "se" compara uma variável com um número. É essa comparação que decide quando o jogo acabou.',
      };
    },
  },
];

const POR_ID = new Map(SPECS.map(s => [s.id, s]));

/** Todos os ids que existem — é contra esta lista que o currículo é conferido. */
export const IDS_DE_SCRATCH = SPECS.map(s => s.id);

/**
 * Roda as verificações pedidas contra o projeto em sb3.
 *
 * Id desconhecido não some em silêncio: vira verificação que nunca passa, com o
 * motivo escrito. Ignorar produziria um laboratório com menos tarefas do que a
 * lição prometeu, e ninguém veria.
 */
export function validarScratch(projeto: ProjetoSb3, ids: string[]): CheckResult[] {
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
