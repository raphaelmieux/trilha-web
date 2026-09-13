/*
 * A ofensiva: dias seguidos em que o desbravador venceu alguma coisa.
 *
 * ── Por que ela não é um número guardado ─────────────────────────────────
 * Era. `enrollments.streak_days` era escrito na hora da atividade e lido na
 * tela, e um número guardado só muda quando alguém o muda — então quem parava
 * de estudar continuava vendo a ofensiva do último dia em que estudou, para
 * sempre. O "2 dias" que não saía do lugar era isso: não era uma conta errada,
 * era uma conta que ninguém refazia. Ofensiva é uma afirmação sobre **hoje**,
 * e afirmação sobre hoje se calcula hoje.
 *
 * Aqui ela se deriva dos eventos datados a cada leitura. Parar de estudar
 * zera sozinho, sem CRON, sem job noturno e sem nada que precise rodar
 * enquanto ninguém está olhando — o que é bom, porque não há onde rodar: o
 * frontend é estático no GitHub Pages e não existe agendador no Supabase
 * deste projeto.
 *
 * ── Por que não sai mais da matrícula ────────────────────────────────────
 * `enrollments` tem uma linha por **trilha** (`UNIQUE(user_id, specialty_id)`),
 * então `streak_days` era a sequência dentro de uma trilha só, e a tela
 * mostrava o maior entre elas. Quem estudasse AP034 na segunda e AP042 na
 * terça tinha duas matrículas com sequência 1, e a tela dizia 1 — dois dias
 * seguidos de estudo que a plataforma contava como um. A regra é "qualquer
 * módulo na plataforma", e quem responde por "qualquer" é o registro de
 * atividade, que é de a pessoa e não da trilha.
 *
 * De lambuja, isso faz a **vereda contar**. Ela não tem linha em
 * `specialties` — é a decisão que a mantém fora do percentual e do XP —,
 * então nunca teve matrícula onde marcar dia nenhum: vencer a teoria de uma
 * vereda não mexia na ofensiva. Como `vereda_teoria` e `vereda_laboratorio`
 * são eventos como os outros, passam a contar sem nada de novo, e com o
 * histórico de quem já percorreu.
 */

import type { EventoDeAtividade } from './atividade';

/*
  O fuso é o de Brasília, e ele é dito pelo nome — não por "-3".

  O Brasil acabou com o horário de verão em 2019, então hoje o deslocamento é
  fixo. "Hoje" é a palavra importante: propostas de trazê-lo de volta aparecem
  de tempos em tempos, e no dia em que uma passar, um `-3` escrito à mão erra
  em silêncio durante quatro meses por ano — a virada do dia cairia às 23h e a
  ofensiva de quem estuda à noite quebraria sem nada na tela dizendo por quê.
  `Intl` lê a base de fusos do próprio navegador, que é atualizada por quem
  cuida disso.
*/
export const FUSO_DE_BRASILIA = 'America/Sao_Paulo';

const FORMATO_DO_DIA = new Intl.DateTimeFormat('en-US', {
  timeZone: FUSO_DE_BRASILIA,
  year: 'numeric', month: '2-digit', day: '2-digit',
});

/**
 * O dia civil em Brasília, como 'AAAA-MM-DD'.
 *
 * Era `new Date().toISOString().split('T')[0]`, que é o dia em **UTC**: a
 * virada acontecia às 21h de Brasília. Duas consequências, as duas invisíveis
 * de dentro. Quem estudasse às 20h e de novo às 22h ganhava +1 por dois
 * exercícios da mesma noite; e quem estuda só à noite — que é quando o clube
 * se reúne — vivia um dia à frente do calendário, então a comparação com
 * "ontem" caía sempre no lugar errado.
 *
 * Os pedaços são montados um a um em vez de se pedir uma data pronta a algum
 * `locale`: formato de locale é escolha de quem mantém o navegador, e já
 * mudou; a ordem dos campos aqui é nossa.
 */
export function diaEmBrasilia(instante: Date | string | number = new Date()): string {
  const d = instante instanceof Date ? instante : new Date(instante);
  if (Number.isNaN(d.getTime())) return '';
  const p = Object.fromEntries(
    FORMATO_DO_DIA.formatToParts(d).map(({ type, value }) => [type, value]),
  );
  return `${p.year}-${p.month}-${p.day}`;
}

/*
  A hora e o dia da semana vêm do mesmo relógio pelo mesmo motivo.

  As insígnias premiam hábito — estudar de manhã, estudar no fim de semana —,
  e `getHours()` responde pelo fuso do aparelho: no computador do clube com o
  fuso errado, ou no celular de quem viaja, a madrugada de alguém virava tarde
  e o domingo virava sábado, premiando a configuração da máquina em vez do que
  a pessoa fez.
*/
const FORMATO_DA_HORA = new Intl.DateTimeFormat('en-US', {
  timeZone: FUSO_DE_BRASILIA, hour: '2-digit', hourCycle: 'h23',
});

/** A hora do dia (0–23) em Brasília. */
export function horaEmBrasilia(instante: Date | string | number = new Date()): number {
  const d = instante instanceof Date ? instante : new Date(instante);
  if (Number.isNaN(d.getTime())) return NaN;
  return Number(FORMATO_DA_HORA.format(d));
}

/** O dia da semana em Brasília, domingo = 0, como `Date#getDay`. */
export function diaDaSemanaEmBrasilia(instante: Date | string | number = new Date()): number {
  const dia = diaEmBrasilia(instante);
  /* O dia civil lido como meia-noite UTC: `getUTCDay` devolve então o dia da
     semana daquela data, sem o fuso do aparelho entrar de novo pela janela. */
  return dia ? new Date(`${dia}T00:00:00Z`).getUTCDay() : NaN;
}

/*
  Somar e subtrair dia em 'AAAA-MM-DD' pede uma data, e não aritmética de
  texto: 2026-03-01 menos um dia é 2026-02-28, ou 29 em ano bissexto, e
  nenhuma conta feita sobre a string acerta isso. `Date.UTC` já sabe de mês
  curto, ano bissexto e virada de ano; UTC de propósito, porque um dia civil
  tratado como meia-noite UTC tem sempre 24 horas — em fuso com horário de
  verão, dois dos dias do ano não têm, e "menos 86400000" erraria neles.
*/
const UM_DIA = 86_400_000;

function comoInstante(dia: string): number {
  const [ano, mes, d] = dia.split('-').map(Number);
  return Date.UTC(ano, mes - 1, d);
}

const comoDia = (instante: number): string =>
  new Date(instante).toISOString().slice(0, 10);

/** O dia seguinte a um dia civil. */
export const diaSeguinte = (dia: string): string => comoDia(comoInstante(dia) + UM_DIA);

/** O dia anterior a um dia civil. */
export const diaAnterior = (dia: string): string => comoDia(comoInstante(dia) - UM_DIA);

/**
 * Os eventos que fazem a ofensiva andar.
 *
 * A regra do clube é "completou um módulo, de teoria ou laboratório". Aqui
 * estão os eventos que a plataforma grava quando isso acontece — e só eles:
 * `text_saved`, `mail_sent`, `threat_sim_run` e `redacao_montada` são passos
 * do meio do caminho, e ofensiva que andasse com passo do meio mediria ter
 * aberto o laboratório.
 *
 * A lista é escrita à mão e **conferida por teste** contra o que os
 * laboratórios de fato gravam. Lista escrita à mão para de conferir sozinha:
 * um laboratório novo estrearia com um nome de evento que não está aqui, a
 * ofensiva não andaria naquela lição, e nada reprovaria — que é a pior forma
 * de falhar, porque é indistinguível de estar tudo certo. `ofensiva.test.ts`
 * lê as chamadas de `logActivity` do repositório e cobra que cada uma esteja
 * classificada de um lado ou do outro.
 */
export const EVENTOS_DA_OFENSIVA: readonly string[] = [
  /* Lição de teoria e prova final da trilha. */
  'lesson_completed',
  'final_exam_completed',
  /* Laboratórios — um evento por laboratório, como cada um já gravava. */
  'agenda_concluida',
  'ai_lab_completed',
  'apresentacao_concluida',
  'area_de_trabalho_concluida',
  'code_lab_completed',
  'configuracoes_concluidas',
  'correio_concluido',
  'cuidados_concluido',
  'estilos_concluidos',
  'file_manager_completed',
  'filipenses_completed',
  'formatacao_concluida',
  'image_compress_completed',
  'image_create_completed',
  'insercao_concluida',
  'mail_lab_completed',
  'operacoes_concluidas',
  'pact_completed',
  'planilha_avancada_concluida',
  'planilha_concluida',
  'site_lab_completed',
  'text_submitted',
  'threat_lab_completed',
  'web_lab_completed',
  /*
    E as duas da vereda, que é onde a conta antiga não chegava de jeito
    nenhum: a vereda não tem matrícula, e era na matrícula que o dia era
    marcado.
  */
  'vereda_teoria',
  'vereda_laboratorio',
];

const CONTA_PARA_A_OFENSIVA = new Set(EVENTOS_DA_OFENSIVA);

/**
 * Os dias distintos, em Brasília, em que houve atividade que conta.
 *
 * Distintos porque a ofensiva conta **dias**, e não exercícios: uma lição com
 * três requisitos grava três `lesson_completed`, e três de uma vez não são
 * três dias.
 */
export function diasDeAtividade(eventos: readonly EventoDeAtividade[]): string[] {
  const dias = new Set<string>();
  for (const e of eventos) {
    if (!e.created_at || !CONTA_PARA_A_OFENSIVA.has(e.event_type)) continue;
    const dia = diaEmBrasilia(e.created_at);
    if (dia) dias.add(dia);
  }
  return [...dias].sort();
}

/**
 * A ofensiva de hoje: dias seguidos até hoje ou até ontem.
 *
 * Ontem ainda conta porque a regra é perder a ofensiva depois de **um dia
 * civil inteiro** sem atividade: quem venceu alguma coisa ontem e ainda não
 * abriu a plataforma hoje não perdeu nada — tem até a meia-noite de Brasília.
 * Zerar à primeira hora do dia seguinte cobraria estudar todo santo dia antes
 * de dormir, e o que a ofensiva mede é constância, não insônia.
 *
 * Dia no futuro é descartado. O `created_at` vem do servidor, mas o "hoje"
 * sai do relógio do aparelho, e computador de clube com a data errada é coisa
 * que existe — sem isso, um relógio adiantado inventaria uma ofensiva que
 * ninguém percorreu.
 */
export function ofensivaCorrente(
  dias: readonly string[],
  hoje: string = diaEmBrasilia(),
): number {
  const havidos = new Set(dias.filter(d => d <= hoje));
  /* Começa em hoje se houve hoje; senão em ontem, que ainda está vivo. */
  let dia = havidos.has(hoje) ? hoje : diaAnterior(hoje);
  let total = 0;
  while (havidos.has(dia)) {
    total++;
    dia = diaAnterior(dia);
  }
  return total;
}

/**
 * A maior ofensiva já alcançada, que é o que as insígnias premiam.
 *
 * Ela também saía de `enrollments.streak_days`, e ali não era a maior de
 * sempre: era a corrente, da trilha de maior valor. Quem fizesse sete dias
 * seguidos alternando duas trilhas nunca via a insígnia de sete dias, porque
 * nenhuma das duas matrículas chegava a sete. Derivada do registro, ela
 * aparece com o histórico junto — e insígnia não se perde, então quem já tem
 * continua tendo.
 */
export function melhorOfensiva(dias: readonly string[]): number {
  const ordenados = [...new Set(dias)].sort();
  let melhor = 0;
  let corrente = 0;
  let anterior = '';
  for (const dia of ordenados) {
    corrente = anterior && diaSeguinte(anterior) === dia ? corrente + 1 : 1;
    anterior = dia;
    if (corrente > melhor) melhor = corrente;
  }
  return melhor;
}
