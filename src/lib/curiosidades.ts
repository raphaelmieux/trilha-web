import { VEREDAS, licoesDaVereda } from '../curriculum/veredas';
import { objeto, trilhaDoEvento, type EventoDeAtividade } from './atividade';
import { diaEmBrasilia, horaEmBrasilia, diaDaSemanaEmBrasilia, eventoDeModuloVencido } from './ofensiva';
import { LIMIAR_DOMINIO } from './limiarDeDominio';
import { CURIOSIDADES } from './catalogoDeCuriosidades';

/*
  As regras das curiosidades: o que cada uma pede, lido do que já está gravado.

  Cada regra devolve **quando** a curiosidade foi alcançada — o instante do
  evento que a completou —, e não só se foi. É por isso que a conquista sai
  com a data verdadeira: quem estudou na semana do Dia do π em março e só
  voltou em novembro recebe a insígnia com a data de março, e não com a de
  hoje. E `evaluateBadges` anuncia só o que acabou de acontecer: as antigas
  entram em silêncio, em vez de trinta avisos de uma vez.

  `null` quer dizer "alcançada, mas sem data que se possa afirmar" (a Ponte
  sai de duas conclusões que não guardam data); aí vale a de hoje.

  As regras moram aqui, e não numa migration: escritas também em SQL, seriam
  duas cópias da mesma regra, e duas cópias divergem no primeiro ajuste.
*/

export interface EntradaDasCuriosidades {
  eventos: readonly EventoDeAtividade[];
  /** Tentativas de lição de trilha: quando terminou e se passou. */
  tentativas: readonly { lesson_id: string; passed: boolean; quando: string | null }[];
  /** Quando a primeira palavra entrou no dicionário pessoal, se entrou. */
  primeiraPalavra: string | null;
  /** Trilhas e veredas concluídas, pelo código e pelo id. */
  trilhasConcluidas: readonly string[];
  veredasConcluidas: readonly string[];
}

type Quando = string | null | undefined;
const DIA = 86_400_000;
const texto = (v: unknown) => (typeof v === 'string' && v ? v : undefined);

/* ── O calendário ───────────────────────────────────────────────────────── */
const instanteDoDia = (dia: string) => { const [a, m, d] = dia.split('-').map(Number); return Date.UTC(a, m - 1, d); };
const fixo = (mes: number, dia: number) => (ano: number) => Date.UTC(ano, mes - 1, dia);
/** O n-ésimo dia da semana (0 = domingo) de um mês. */
const enesimo = (mes: number, semana: number, n: number) => (ano: number) => {
  const primeiro = new Date(Date.UTC(ano, mes - 1, 1)).getUTCDay();
  return Date.UTC(ano, mes - 1, 1 + ((semana - primeiro + 7) % 7) + 7 * (n - 1));
};
const diaDoAno = (n: number) => (ano: number) => Date.UTC(ano, 0, n);
/* "Na semana da data" é a semana em volta dela, três dias para cada lado:
   quem tem dez anos não escolhe o dia em que vai ao computador do clube. */
const naSemanaDe = (ancora: (ano: number) => number) => (dia: string) => {
  const t = instanteDoDia(dia), ano = new Date(t).getUTCFullYear();
  return [ano - 1, ano, ano + 1].some(a => Math.abs(t - ancora(a)) <= 3 * DIA);
};

export const DATAS: Record<string, (dia: string) => boolean> = {
  virada_sem_bug: naSemanaDe(fixo(1, 1)),
  /* O Dia da Internet Segura cai numa terça da segunda semana de fevereiro, e
     a regra exata do calendário dele muda de ano para ano: a semana inteira
     de 8 a 14 cobre todas. */
  internet_segura: dia => { const [, m, d] = dia.split('-').map(Number); return m === 2 && d >= 8 && d <= 14; },
  mulheres_na_ciencia: naSemanaDe(fixo(2, 11)),
  /* Só no dia: a semana em volta diluiria o que torna este raro. */
  dia_que_quase_nao_existe: dia => dia.endsWith('-02-29'),
  nascimento_da_web: naSemanaDe(fixo(3, 12)),
  dia_do_pi: naSemanaDe(fixo(3, 14)),
  copia_de_seguranca: naSemanaDe(fixo(3, 31)),
  meninas_nas_tic: naSemanaDe(enesimo(4, 4, 4)),
  senha_forte: naSemanaDe(enesimo(5, 4, 1)),
  homem_que_calculava: naSemanaDe(fixo(5, 6)),
  sociedade_da_informacao: naSemanaDe(fixo(5, 17)),
  alan_turing: naSemanaDe(fixo(6, 23)),
  dia_do_emoji: naSemanaDe(fixo(7, 17)),
  primeiro_site: naSemanaDe(fixo(8, 6)),
  dia_da_fotografia: naSemanaDe(fixo(8, 19)),
  pinguim: naSemanaDe(fixo(8, 25)),
  byte_do_ano: naSemanaDe(diaDoAno(256)),
  codigo_aberto: naSemanaDe(enesimo(9, 6, 3)),
  ada_lovelace: naSemanaDe(enesimo(10, 2, 2)),
  quadro_a_quadro: naSemanaDe(fixo(10, 28)),
  dia_do_designer: naSemanaDe(fixo(11, 5)),
  seguranca_da_informacao: naSemanaDe(fixo(11, 30)),
  grace_hopper: naSemanaDe(fixo(12, 9)),
};

/* ── O que cada lição de vereda é ───────────────────────────────────────── */
const LICAO = new Map<string, { vereda: string; familia: string; modulo: string; tipo: string }>();
for (const v of VEREDAS) for (const l of licoesDaVereda(v)) LICAO.set(`${v.id}/${l.id}`, { vereda: v.code, familia: v.familia, modulo: l.moduloId, tipo: l.tipo });
const FAMILIAS_DE_VEREDA = new Set(VEREDAS.map(v => v.familia));

/*
  Os programas que a plataforma imita, cada um pela vereda que o ensina. É
  declarado, e não deduzido da tela: a moldura sabe que programa desenha, mas o
  evento gravado não sabe. Mudar de vereda que ensina um programa é mudar
  aqui.
*/
export const VEREDA_DO_PROGRAMA: Record<string, string> = {
  Word: 'CC-ES002', Excel: 'CC-ES003', PowerPoint: 'CC-ES011', Explorador: 'CC-ES001',
  correio: 'CC-ES007', terminal: 'CC003', 'editor de código': 'CC-FE001', 'editor de design': 'CC-DG001',
};

/* As linguagens, cada uma pelas veredas em que se escreve nela. */
export const LINGUAGEM_DA_VEREDA: Record<string, string> = {
  CC001: 'blocos', CC002: 'Python', CC004: 'Python', CC005: 'SQL', CC003: 'Bash', 'CC-IE001': 'Bash',
  'CC-FE001': 'HTML', 'CC-FE002': 'CSS', 'CC-FE003': 'JavaScript', 'CC-FE005': 'TypeScript',
  'CC-MB001': 'Dart', 'CC-MB003': 'Kotlin', 'CC-MB004': 'Swift', 'CC-BE002': 'C#', 'CC-BE003': 'Java',
  'CC-BE005': 'R', 'CC-SI001': 'C', 'CC-SI002': 'C++', 'CC-SI003': 'Go', 'CC-SI004': 'Rust',
};

/* Os eventos que as simulações gravam para as curiosidades (etapa 2). */
export const EVENTOS_DAS_CURIOSIDADES = {
  referencia: 'referencia_consultada',
  atalho: 'atalho_usado',
  menu: 'menu_de_contexto_aberto',
  tokenBaixado: 'token_baixado',
  tokenImpresso: 'token_impresso',
  relatorio: 'relatorio_gerado',
  verificacao: 'token_verificado',
  segredo: 'segredo_achado',
} as const;

interface Lido { e: EventoDeAtividade; quando: string; t: number; dia: string; m: Record<string, unknown> }

/**
 * As curiosidades alcançadas, cada uma com o instante em que foi alcançada
 * (`null` quando não há data que se possa afirmar).
 */
export function curiosidadesConquistadas(entrada: EntradaDasCuriosidades): Map<string, string | null> {
  const lidos: Lido[] = entrada.eventos
    .filter(e => !!e.created_at)
    .map(e => ({ e, quando: e.created_at as string, t: Date.parse(e.created_at as string), dia: diaEmBrasilia(e.created_at as string), m: objeto(e.metadata) }))
    .sort((a, b) => a.t - b.t);

  const primeiro = (pred: (x: Lido) => boolean): Quando => lidos.find(pred)?.quando;
  const doTipo = (...tipos: string[]) => primeiro(x => tipos.includes(x.e.event_type));
  /** O instante em que um conjunto, enchido evento a evento, chegou a `n`. */
  const quandoChegaA = (n: number, chave: (x: Lido) => string | undefined, filtro: (x: Lido) => boolean = () => true): Quando => {
    const vistos = new Set<string>();
    for (const x of lidos) {
      if (!filtro(x)) continue;
      const k = chave(x);
      if (k === undefined) continue;
      vistos.add(k);
      if (vistos.size >= n) return x.quando;
    }
    return undefined;
  };
  const daVereda = (x: Lido) => {
    if (x.e.event_type !== 'vereda_teoria' && x.e.event_type !== 'vereda_laboratorio') return undefined;
    const vereda = texto(x.m.vereda) ?? texto(x.m.trilha), licao = texto(x.m.licao);
    return vereda && licao ? LICAO.get(`${vereda}/${licao}`) : undefined;
  };
  const labDeVereda = (x: Lido) => (x.e.event_type === 'vereda_laboratorio' ? daVereda(x) : undefined);

  const regras: Record<string, () => Quando> = {};

  for (const [code, naData] of Object.entries(DATAS)) regras[code] = () => primeiro(x => naData(x.dia));

  const hora = (x: Lido) => horaEmBrasilia(x.quando);
  regras.madrugador = () => primeiro(x => hora(x) < 6);
  regras.pessoa_da_manha = () => primeiro(x => hora(x) >= 6 && hora(x) < 12);
  regras.pessoa_da_tarde = () => primeiro(x => hora(x) >= 12 && hora(x) < 18);
  regras.noturno = () => primeiro(x => hora(x) >= 18);
  regras.fim_de_semana = () => primeiro(x => [0, 6].includes(diaDaSemanaEmBrasilia(x.quando)));
  regras.semana_inteira = () => quandoChegaA(7, x => String(diaDaSemanaEmBrasilia(x.quando)));
  regras.doze_meses = () => quandoChegaA(12, x => x.dia.slice(5, 7));
  regras.pausa_boa = () => {
    let anterior: Lido | undefined;
    for (const x of lidos) {
      if (anterior && anterior.dia === x.dia && x.t - anterior.t >= 2 * 3_600_000) return x.quando;
      anterior = x;
    }
    return undefined;
  };
  regras.um_ano_de_faixa = () => {
    if (lidos.length === 0) return undefined;
    const inicio = instanteDoDia(lidos[0].dia), base = new Date(inicio);
    return primeiro(x => {
      const anos = new Date(instanteDoDia(x.dia)).getUTCFullYear() - base.getUTCFullYear();
      return [anos - 1, anos, anos + 1].some(n => n >= 1
        && Math.abs(instanteDoDia(x.dia) - Date.UTC(base.getUTCFullYear() + n, base.getUTCMonth(), base.getUTCDate())) <= 3 * DIA);
    });
  };

  regras.revisao = () => {
    const vencidas = new Map<string, number>();
    const ordenadas = entrada.tentativas.filter(t => t.passed && t.quando).sort((a, b) => Date.parse(a.quando!) - Date.parse(b.quando!));
    for (const t of ordenadas) {
      const n = (vencidas.get(t.lesson_id) ?? 0) + 1;
      vencidas.set(t.lesson_id, n);
      if (n === 2) return t.quando;
    }
    return undefined;
  };
  regras.de_primeira = () => {
    const vistas = new Set<string>();
    for (const x of lidos) {
      if (x.e.event_type !== 'final_exam_completed') continue;
      const trilha = trilhaDoEvento(x.e);
      if (!trilha || vistas.has(trilha)) continue;
      vistas.add(trilha);
      const { score, total } = x.m;
      if (typeof score === 'number' && typeof total === 'number' && total > 0 && (score / total) * 100 >= LIMIAR_DOMINIO) return x.quando;
    }
    return undefined;
  };
  regras.modulo_de_uma_vez = () => {
    const metades = new Map<string, Set<string>>();
    for (const x of lidos) {
      const l = daVereda(x);
      if (!l) continue;
      const k = `${l.vereda}/${l.modulo}/${x.dia}`;
      const s = metades.get(k) ?? new Set<string>();
      s.add(x.e.event_type);
      metades.set(k, s);
      if (s.size === 2) return x.quando;
    }
    return undefined;
  };
  regras.consulta = () => {
    const consultadas = new Set<string>();
    for (const x of lidos) {
      const chave = `${texto(x.m.vereda) ?? ''}/${texto(x.m.licao) ?? ''}`;
      if (x.e.event_type === EVENTOS_DAS_CURIOSIDADES.referencia) consultadas.add(chave);
      else if (x.e.event_type === 'vereda_laboratorio' && consultadas.has(chave)) return x.quando;
    }
    return undefined;
  };
  regras.palavra_propria = () => entrada.primeiraPalavra ?? undefined;
  regras.mao_no_teclado = () => quandoChegaA(5, x => texto(x.m.atalho), x => x.e.event_type === EVENTOS_DAS_CURIOSIDADES.atalho);
  regras.botao_direito = () => doTipo(EVENTOS_DAS_CURIOSIDADES.menu);
  regras.na_parede = () => doTipo(EVENTOS_DAS_CURIOSIDADES.tokenBaixado, EVENTOS_DAS_CURIOSIDADES.tokenImpresso);
  regras.relatorio_entregue = () => doTipo(EVENTOS_DAS_CURIOSIDADES.relatorio);
  regras.conferido = () => doTipo(EVENTOS_DAS_CURIOSIDADES.verificacao);

  regras.rosa_dos_ventos = () => quandoChegaA(FAMILIAS_DE_VEREDA.size, x => daVereda(x)?.familia);
  regras.tres_frentes = () => {
    const porSemana = new Map<number, Set<string>>();
    for (const x of lidos) {
      if (!eventoDeModuloVencido(x.e)) continue;
      const trilha = trilhaDoEvento(x.e);
      if (!trilha) continue;
      const domingo = instanteDoDia(x.dia) - diaDaSemanaEmBrasilia(x.quando) * DIA;
      const s = porSemana.get(domingo) ?? new Set<string>();
      s.add(trilha);
      porSemana.set(domingo, s);
      if (s.size >= 3) return x.quando;
    }
    return undefined;
  };
  regras.ponte = () => {
    const concluidas = new Set([...entrada.trilhasConcluidas, ...VEREDAS.filter(v => entrada.veredasConcluidas.includes(v.id)).map(v => v.code)]);
    return VEREDAS.some(v => entrada.veredasConcluidas.includes(v.id) && v.origem && concluidas.has(v.origem)) ? null : undefined;
  };
  regras.todas_as_janelas = () => {
    const programas = Object.entries(VEREDA_DO_PROGRAMA);
    return quandoChegaA(programas.length, x => {
      const l = labDeVereda(x);
      return l ? programas.find(([, vereda]) => vereda === l.vereda)?.[0] : undefined;
    });
  };
  regras.poliglota = () => quandoChegaA(5, x => { const l = labDeVereda(x); return l ? LINGUAGEM_DA_VEREDA[l.vereda] : undefined; });

  for (const s of CURIOSIDADES.filter(x => x.tema === 'segredo'))
    regras[s.code] = () => primeiro(x => x.e.event_type === EVENTOS_DAS_CURIOSIDADES.segredo && x.m.segredo === s.code);

  const alcancadas = new Map<string, string | null>();
  for (const { code } of CURIOSIDADES) {
    const quando = regras[code]?.();
    if (quando !== undefined) alcancadas.set(code, quando);
  }
  return alcancadas;
}

