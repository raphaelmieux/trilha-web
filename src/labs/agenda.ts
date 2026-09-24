/**
 * O calendário da CC-ES007: o modelo, e a agenda de onde as lições partem.
 *
 * ── O que ele tem de carregar ────────────────────────────────────────────
 * O requisito 5 tem cinco demonstrações, e cada uma tem um lado que não dá
 * erro nenhum: o evento sem local, que manda metade do clube para a igreja e
 * metade para a escola; o convite que nunca chegou, que na tela é igualzinho
 * ao de quem ainda não respondeu; a série que se apaga inteira quando alguém
 * quer cancelar um sábado; o calendário aberto de mais, em que qualquer um
 * apaga o acampamento; e a grade de disponibilidade, que responde sobre as
 * agendas que ela conseguiu consultar e não sobre a vida das pessoas.
 *
 * ── E o fuso se diz pelo nome ────────────────────────────────────────────
 * Está escrito em `ofensiva.ts` e vale aqui pela mesma razão: o Brasil acabou
 * com o horário de verão em 2019, mas propostas de trazê-lo de volta
 * aparecem, e um `-3` escrito à mão erraria calado quatro meses por ano. O
 * cálculo sai do `Intl`, com o nome IANA do fuso.
 */

import { FUSO_DE_BRASILIA } from '../lib/ofensiva';
import { HOJE } from './correspondencia';

export { FUSO_DE_BRASILIA, HOJE };

/**
 * O fuso do Acre, que é onde mora quem torna o requisito 2.5 concreto.
 *
 * Duas horas atrás de Brasília, o ano inteiro — e é um fuso do mesmo país, o
 * que é o que faz o erro acontecer: ninguém desconfia do fuso quando a reunião
 * é com gente do Brasil.
 */
export const FUSO_DO_ACRE = 'America/Rio_Branco';

/* ── Instantes e fusos ────────────────────────────────────────────────────── */

const partes = (fuso: string, instante: number) => {
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone: fuso,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  });
  return Object.fromEntries(f.formatToParts(instante).map(p => [p.type, p.value]));
};

/** Quanto este fuso está deslocado do UTC **neste instante**, em milissegundos. */
function deslocamento(fuso: string, instante: number): number {
  const p = partes(fuso, instante);
  const comoSeFosseUtc = Date.UTC(
    Number(p.year), Number(p.month) - 1, Number(p.day),
    Number(p.hour), Number(p.minute), Number(p.second));
  return comoSeFosseUtc - instante;
}

/**
 * O instante em que cai esta hora de parede, escrita neste fuso.
 *
 * A conta é por aproximação e não por uma tabela de deslocamentos: trata a
 * hora escrita como se fosse UTC, pergunta ao `Intl` quanto o fuso desloca
 * naquele instante, e corrige. A segunda passada existe para a virada do
 * horário de verão, onde o deslocamento do palpite e o do instante de verdade
 * são diferentes — sem ela a conta erraria uma hora, dois dias por ano, no
 * país que tivesse horário de verão.
 */
export function instanteDe(dia: string, hora: string, fuso: string): number {
  const [ano, mes, d] = dia.split('-').map(Number);
  const [h, min] = hora.split(':').map(Number);
  const palpite = Date.UTC(ano, mes - 1, d, h, min);
  let instante = palpite - deslocamento(fuso, palpite);
  instante = palpite - deslocamento(fuso, instante);
  return instante;
}

/** A hora de parede, 'HH:MM', que este instante mostra neste fuso. */
export function horaEm(instante: number, fuso: string): string {
  const p = partes(fuso, instante);
  return `${p.hour}:${p.minute}`;
}

/** O dia, AAAA-MM-DD, que este instante mostra neste fuso. */
export function diaEm(instante: number, fuso: string): string {
  const p = partes(fuso, instante);
  return `${p.year}-${p.month}-${p.day}`;
}

/* ── Eventos ──────────────────────────────────────────────────────────────── */

export type Resposta = 'sim' | 'nao' | 'talvez' | 'aguardando';

/**
 * Um convidado.
 *
 * `naoChegou` é a metade do requisito 5.2 que não se vê: um convite mandado
 * para um endereço errado fica "aguardando" para sempre, e na tela isso é
 * exatamente o que se vê de quem recebeu e não decidiu. Três situações
 * diferentes — não viu, viu e não decidiu, nunca recebeu — com a mesma
 * palavra em cima.
 */
export interface Convidado {
  endereco: string;
  resposta: Resposta;
  naoChegou?: boolean;
}

/**
 * A repetição de um evento.
 *
 * `ate` vazio é "para sempre", que é o que o calendário oferece por padrão e
 * o que põe a reunião de sábado do clube em 2075. `pulados` são as ocorrências
 * canceladas uma a uma — a série continua de pé, que é o que separa "este
 * evento" de "todos os eventos".
 */
export interface Recorrencia {
  cada: 'semana' | 'mes';
  ate: string;
  pulados: string[];
}

export interface Evento {
  id: string;
  titulo: string;
  local: string;
  descricao: string;
  /** O dia da primeira ocorrência, AAAA-MM-DD, lido no fuso do evento. */
  dia: string;
  /** 'HH:MM' no fuso do evento. */
  inicio: string;
  fim: string;
  /**
   * O fuso em que as horas acima foram escritas, pelo nome IANA.
   *
   * Escrever "15h (horário do Acre)" na descrição **não** põe nada aqui — e é
   * esse o erro do requisito 2.5: a descrição fica certa, o campo fica errado,
   * e quem lê confia no calendário. É o "Figura 1" digitado da CC-ES002, com
   * outro assunto.
   */
  fuso: string;
  convidados: Convidado[];
  repete?: Recorrencia;
  /** O vínculo da reunião a distância, quando o evento tem uma. */
  linkDaReuniao?: string;
  calendario: string;
}

/** O instante em que o evento começa, seja quem for que esteja olhando. */
export const comecaEm = (e: Evento, dia = e.dia): number =>
  instanteDe(dia, e.inicio, e.fuso);

export const terminaEm = (e: Evento, dia = e.dia): number =>
  instanteDe(dia, e.fim, e.fuso);

/**
 * Que horas este evento mostra para quem está neste fuso.
 *
 * É a função inteira do requisito 2.5. Um evento não tem "um horário": tem um
 * instante, e cada pessoa lê o instante no relógio dela. Combinar 15h com
 * alguém em Rio Branco e criar o evento no fuso de Brasília põe a pessoa às
 * 13h, na agenda dela, sem erro nenhum em lugar nenhum.
 */
export const horaPara = (e: Evento, fuso: string, dia = e.dia): string =>
  horaEm(comecaEm(e, dia), fuso);

/* ── Os campos que um evento precisa ter ──────────────────────────────────── */

/**
 * O evento diz onde.
 *
 * Um evento sem local não estoura: ele aparece na agenda de todo mundo, com
 * hora e título. Metade do clube vai para a igreja e metade para a escola, e
 * às sete da noite alguém começa a telefonar.
 */
export const temLocal = (e: Evento): boolean => e.local.trim().length >= 3;

/**
 * A descrição diz o que não cabe no título.
 *
 * Duas frases, que é o que separa uma descrição de uma palavra escrita para a
 * tarefa ficar verde. O que levar, o que vai acontecer, quem procurar.
 */
export const temDescricao = (e: Evento): boolean => e.descricao.trim().length >= 40;

/* ── Ocorrências ──────────────────────────────────────────────────────────── */

const UM_DIA = 86400000;

const somarDias = (dia: string, n: number): string => {
  const [a, m, d] = dia.split('-').map(Number);
  const i = new Date(Date.UTC(a, m - 1, d) + n * UM_DIA);
  return i.toISOString().slice(0, 10);
};

const somarMeses = (dia: string, n: number): string => {
  const [a, m, d] = dia.split('-').map(Number);
  const i = new Date(Date.UTC(a, m - 1 + n, d));
  return i.toISOString().slice(0, 10);
};

/**
 * Os dias em que este evento acontece, entre dois dias.
 *
 * A conta de dia é `Date.UTC`, nunca uma subtração de milissegundos: 1º de
 * março menos um dia é 28 ou 29 de fevereiro, e nenhuma subtração de
 * milissegundos sabe disso. Está escrito em `ofensiva.ts` e vale aqui.
 *
 * Um evento sem `ate` é cortado pela janela que se pede, e não pela série —
 * série sem fim é infinita de verdade, que é o defeito que o requisito 5.3
 * manda perceber.
 */
export function ocorrencias(e: Evento, de: string, ate: string): string[] {
  if (!e.repete) return e.dia >= de && e.dia <= ate ? [e.dia] : [];
  const fim = e.repete.ate && e.repete.ate < ate ? e.repete.ate : ate;
  const passo = e.repete.cada === 'semana'
    ? (d: string) => somarDias(d, 7)
    : (d: string) => somarMeses(d, 1);
  const dias: string[] = [];
  for (let d = e.dia; d <= fim; d = passo(d)) {
    if (d >= de && !e.repete.pulados.includes(d)) dias.push(d);
    /* Guarda contra série mal escrita: um passo que não anda faria laço infinito. */
    if (passo(d) <= d) break;
  }
  return dias;
}

/** A série tem fim declarado? Sem ele, a reunião de sábado chega a 2075. */
export const serieTemFim = (e: Evento): boolean =>
  !e.repete || e.repete.ate.trim().length > 0;

/* ── Como um mês se desenha ───────────────────────────────────────────────── */

export const NOMES_DOS_DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

export const NOMES_DOS_MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

export interface CelulaDoMes {
  /** O dia, AAAA-MM-DD. */
  dia: string;
  /** Está no mês que se está olhando, e não na sobra da semana. */
  doMes: boolean;
  hoje: boolean;
}

/**
 * Os quarenta e dois dias que um mês desenha.
 *
 * Seis semanas sempre, começando no domingo — que é o que todo calendário faz,
 * porque uma grade que mudasse de altura conforme o mês pularia debaixo do
 * ponteiro na troca de mês. A conta de dia é `Date.UTC`, e não subtração de
 * milissegundos: está escrito em `ofensiva.ts` e vale aqui.
 *
 * Ela mora no modelo e não na tela porque é conta de calendário, e não
 * desenho: é o corte de `capturaDoScanner.ts`, e foi o lint que o apontou.
 */
export function diasDoMes(ano: number, mes: number, hoje: string): CelulaDoMes[] {
  const primeiro = new Date(Date.UTC(ano, mes, 1));
  const comeco = new Date(Date.UTC(ano, mes, 1 - primeiro.getUTCDay()));
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(comeco.getTime() + i * 86400000);
    const dia = d.toISOString().slice(0, 10);
    return { dia, doMes: d.getUTCMonth() === mes, hoje: dia === hoje };
  });
}

/* ── Calendários e permissão ──────────────────────────────────────────────── */

/**
 * Os quatro níveis, que são os do calendário de verdade e não três graus de
 * confiança.
 *
 * Eles não formam uma escada de "quanto eu confio": `livre-ocupado` é o que se
 * dá a quem precisa marcar hora com você e não tem nada que ver com o que você
 * faz; `ver-detalhes` é para quem participa; `alterar` é para quem organiza; e
 * `gerenciar` é quem pode dar acesso a outros — que é o único que se propaga.
 */
export type NivelNoCalendario = 'livre-ocupado' | 'ver-detalhes' | 'alterar' | 'gerenciar';

export const NIVEIS: NivelNoCalendario[] = [
  'livre-ocupado', 'ver-detalhes', 'alterar', 'gerenciar',
];

export const NOME_DO_NIVEL: Record<NivelNoCalendario, string> = {
  'livre-ocupado': 'Ver apenas livre/ocupado',
  'ver-detalhes': 'Ver todos os detalhes',
  alterar: 'Fazer alterações',
  gerenciar: 'Fazer alterações e gerenciar compartilhamento',
};

/** O que cada nível **não** deixa fazer, que é o que os separa. */
export const OQUE_O_NIVEL_NAO_DEIXA: Record<NivelNoCalendario, string> = {
  'livre-ocupado': 'Não mostra título, local nem descrição: só que o horário está tomado.',
  'ver-detalhes': 'Não deixa criar, mudar nem apagar evento nenhum.',
  alterar: 'Não deixa dar acesso a mais ninguém.',
  gerenciar: 'Deixa tudo, inclusive tirar o acesso de quem já tem.',
};

export interface AcessoAoCalendario {
  quem: string;
  nivel: NivelNoCalendario;
}

export interface Calendario {
  id: string;
  nome: string;
  dono: string;
  acessos: AcessoAoCalendario[];
  /**
   * Publicado na web.
   *
   * O calendário público é o que um clube faz para as famílias acharem os
   * horários — e ele leva junto **a descrição de cada evento**, para qualquer
   * pessoa e para os buscadores. A descrição é onde se escreve o telefone de
   * quem vai abrir o salão.
   */
  publico: boolean;
}

export const nivelDe = (c: Calendario, quem: string): NivelNoCalendario | undefined =>
  c.dono === quem ? 'gerenciar' : c.acessos.find(a => a.quem === quem)?.nivel;

const ORDEM: NivelNoCalendario[] = NIVEIS;

const peloMenos = (c: Calendario, quem: string, alvo: NivelNoCalendario): boolean => {
  const n = nivelDe(c, quem);
  return n !== undefined && ORDEM.indexOf(n) >= ORDEM.indexOf(alvo);
};

export const podeVerDetalhes = (c: Calendario, quem: string) =>
  peloMenos(c, quem, 'ver-detalhes');
export const podeAlterar = (c: Calendario, quem: string) => peloMenos(c, quem, 'alterar');
export const podeGerenciar = (c: Calendario, quem: string) => peloMenos(c, quem, 'gerenciar');

/**
 * Quem pode apagar o acampamento.
 *
 * É o atalho errado do requisito 5.4: dar "fazer alterações" a todo mundo
 * resolve a reclamação de que ninguém consegue marcar nada, e põe o
 * acampamento ao alcance de trinta pessoas. Ninguém apaga de propósito — apaga
 * arrastando sem querer, e o evento some da agenda de todos ao mesmo tempo.
 */
export const quemPodeApagar = (c: Calendario): string[] =>
  [c.dono, ...c.acessos.filter(a => podeAlterar(c, a.quem)).map(a => a.quem)];

/**
 * O que um calendário público entrega, e que não é só o horário.
 *
 * Devolve as descrições que passam a ser lidas por qualquer pessoa. Um
 * calendário fechado devolve lista vazia — e a lista vazia aqui é resposta, e
 * não ausência de resposta.
 */
export const oQuePublicoMostra = (eventos: readonly Evento[], c: Calendario): string[] =>
  c.publico
    ? eventos.filter(e => e.calendario === c.id && e.descricao.trim()).map(e => e.descricao)
    : [];

/* ── Disponibilidade ──────────────────────────────────────────────────────── */

export interface Bloco {
  dia: string;
  inicio: string;
  fim: string;
}

/**
 * Uma pessoa, do ponto de vista de quem quer marcar hora com ela.
 *
 * `compartilha` é o campo que faz o requisito 5.5 ser uma decisão e não uma
 * consulta: a grade só sabe das agendas que alguém compartilhou com você.
 * Quem não compartilhou aparece **sem informação**, e não livre — e é aí que
 * a lição acontece, porque livre e desconhecido cabem no mesmo espaço em
 * branco.
 */
export interface PessoaNaAgenda {
  endereco: string;
  nome: string;
  compartilha: boolean;
  ocupado: Bloco[];
}

const minutos = (hora: string): number => {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
};

const comoHora = (min: number): string =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

export type EstadoNaGrade = 'livre' | 'ocupado' | 'sem-acesso';

/** Como esta pessoa aparece neste pedaço de tempo. */
export function estadoEm(p: PessoaNaAgenda, dia: string, de: string, ate: string): EstadoNaGrade {
  if (!p.compartilha) return 'sem-acesso';
  const i = minutos(de);
  const f = minutos(ate);
  const bate = p.ocupado.some(b => b.dia === dia && minutos(b.inicio) < f && minutos(b.fim) > i);
  return bate ? 'ocupado' : 'livre';
}

export const PASSO_DA_GRADE = 30;

/**
 * As janelas em que **todo mundo que compartilhou** está livre.
 *
 * Ela nomeia o que responde: quem não compartilhou não entra na conta, e por
 * isso a janela que ela devolve não é "todo mundo pode" — é "ninguém que eu
 * consigo ver está ocupado". A diferença entre as duas frases é o requisito
 * 5.5 inteiro, e é a mesma decisão da consulta de vazamento da CC-ES005, que
 * responde sobre as listas que consultou.
 */
export function janelasLivres(
  pessoas: readonly PessoaNaAgenda[], dia: string,
  de: string, ate: string, duracaoMin: number,
): Bloco[] {
  const inicio = minutos(de);
  const fim = minutos(ate);
  const janelas: Bloco[] = [];
  for (let t = inicio; t + duracaoMin <= fim; t += PASSO_DA_GRADE) {
    const trecho = { de: comoHora(t), ate: comoHora(t + duracaoMin) };
    const livre = pessoas.every(p =>
      !p.compartilha || estadoEm(p, dia, trecho.de, trecho.ate) === 'livre');
    if (livre) janelas.push({ dia, inicio: trecho.de, fim: trecho.ate });
  }
  return janelas;
}

/** Quem não compartilhou a agenda, e por isso precisa ser perguntado. */
export const semAgendaCompartilhada = (pessoas: readonly PessoaNaAgenda[]): PessoaNaAgenda[] =>
  pessoas.filter(p => !p.compartilha);

/** Algum convidado está ocupado neste horário, entre os que dá para ver? */
export const alguemOcupado = (
  pessoas: readonly PessoaNaAgenda[], dia: string, de: string, ate: string,
): boolean => pessoas.some(p => estadoEm(p, dia, de, ate) === 'ocupado');

/* ── Respostas aos convites ───────────────────────────────────────────────── */

export const responderam = (e: Evento, r: Resposta): Convidado[] =>
  e.convidados.filter(c => c.resposta === r);

/**
 * Os convites que nunca chegaram.
 *
 * Na tela eles são "aguardando", igualzinho a quem viu e não decidiu — e é por
 * isso que o requisito 5.2 diz "acompanhar as confirmações" e não "enviar os
 * convites". Quem lê a tela sem saber disso conclui que faltam três respostas;
 * uma das três nunca vai chegar.
 */
export const naoChegaram = (e: Evento): Convidado[] =>
  e.convidados.filter(c => c.naoChegou);

/* ── Mexer na agenda ──────────────────────────────────────────────────────── */

export interface Agenda {
  calendarios: Calendario[];
  eventos: Evento[];
  /** Em que fuso **você** está lendo a agenda. */
  fuso: string;
}

export const eventoDe = (a: Agenda, id: string): Evento | undefined =>
  a.eventos.find(e => e.id === id);

export const criarEvento = (a: Agenda, e: Evento): Agenda =>
  ({ ...a, eventos: [...a.eventos, e] });

export const mudarEvento = (a: Agenda, id: string, mudanca: Partial<Evento>): Agenda => ({
  ...a,
  eventos: a.eventos.map(e => (e.id === id ? { ...e, ...mudanca } : e)),
});

export const apagarEvento = (a: Agenda, id: string): Agenda =>
  ({ ...a, eventos: a.eventos.filter(e => e.id !== id) });

/**
 * Cancelar **uma** ocorrência: a série continua de pé.
 *
 * É a primeira das três opções da caixa que o calendário abre, e a que quase
 * ninguém escolhe porque as três estão escritas em letra pequena. Escolher
 * "todos os eventos" para desmarcar um sábado apaga o ano inteiro — e não
 * pergunta de novo.
 */
export function cancelarOcorrencia(a: Agenda, id: string, dia: string): Agenda {
  const e = eventoDe(a, id);
  if (!e?.repete) return a;
  return mudarEvento(a, id, {
    repete: { ...e.repete, pulados: [...e.repete.pulados, dia] },
  });
}

/**
 * "Este e os seguintes": corta a série neste dia e abre outra a partir dele.
 *
 * O que sobra atrás fica intacto, que é o ponto — mudar o horário da reunião a
 * partir de agosto não pode reescrever o que já aconteceu em junho.
 */
export function mudarDaquiEmDiante(
  a: Agenda, id: string, dia: string, mudanca: Partial<Evento>,
): Agenda {
  const e = eventoDe(a, id);
  if (!e?.repete) return a;
  const antes = somarDias(dia, -1);
  const nova: Evento = {
    ...e, ...mudanca,
    id: `${e.id}-de-${dia}`,
    dia,
    repete: { ...e.repete, ...(mudanca.repete ?? {}), pulados: e.repete.pulados.filter(p => p >= dia) },
  };
  const cortada = mudarEvento(a, id, {
    repete: { ...e.repete, ate: antes, pulados: e.repete.pulados.filter(p => p < dia) },
  });
  return criarEvento(cortada, nova);
}

export const compartilharCalendario = (
  a: Agenda, id: string, quem: string, nivel: NivelNoCalendario,
): Agenda => ({
  ...a,
  calendarios: a.calendarios.map(c => (c.id === id
    ? { ...c, acessos: [...c.acessos.filter(x => x.quem !== quem), { quem, nivel }] }
    : c)),
});

export const tirarDoCalendario = (a: Agenda, id: string, quem: string): Agenda => ({
  ...a,
  calendarios: a.calendarios.map(c => (c.id === id
    ? { ...c, acessos: c.acessos.filter(x => x.quem !== quem) }
    : c)),
});

export const publicarCalendario = (a: Agenda, id: string, publico: boolean): Agenda => ({
  ...a,
  calendarios: a.calendarios.map(c => (c.id === id ? { ...c, publico } : c)),
});

export const responder = (a: Agenda, id: string, quem: string, r: Resposta): Agenda => {
  const e = eventoDe(a, id);
  if (!e) return a;
  return mudarEvento(a, id, {
    convidados: e.convidados.map(c => (c.endereco === quem && !c.naoChegou
      ? { ...c, resposta: r } : c)),
  });
};

/** Quantos dias distintos do mês têm evento no calendário do clube. */
export function diasPlanejados(a: Agenda, calendario: string, de: string, ate: string): string[] {
  const dias = a.eventos
    .filter(e => e.calendario === calendario)
    .flatMap(e => ocorrencias(e, de, ate));
  return [...new Set(dias)].sort();
}

/* ── A agenda do clube ────────────────────────────────────────────────────── */

export const CALENDARIO_DO_CLUBE = 'clube';
export const MINHA_AGENDA = 'minha';

export const JULHO = { de: '2026-07-01', ate: '2026-07-31' };

/**
 * Quantos dias de julho precisam ter alguma coisa para o mês estar planejado.
 *
 * O requisito 8 diz "no mínimo, um mês planejado", e um clube planeja o mês
 * pelas reuniões semanais mais o que for específico daquele mês. Quatro
 * sábados mais o acampamento mais a reunião do conselho dão seis — e é este
 * o número, e não um dia com um evento, que é o que "planejado" quer dizer.
 */
export const DIAS_DE_UM_MES_PLANEJADO = 6;

/**
 * As quatro pessoas que o módulo da disponibilidade convida.
 *
 * Três compartilham a agenda e uma não — e a que não compartilha é o
 * requisito 5.5 inteiro: na grade ela aparece com um espaço em branco, que é
 * o mesmo espaço em branco de quem está livre.
 */
export const CONVIDADOS_DA_REUNIAO: PessoaNaAgenda[] = [
  {
    endereco: 'falcao@clubepioneiros.org.br', nome: 'Tio Samuel (Falcão)',
    compartilha: true,
    ocupado: [{ dia: '2026-06-26', inicio: '14:00', fim: '15:30' }],
  },
  {
    endereco: 'aguia@clubepioneiros.org.br', nome: 'Tia Rute (Águia)',
    compartilha: true,
    ocupado: [{ dia: '2026-06-26', inicio: '16:00', fim: '18:00' }],
  },
  {
    endereco: 'tucano@clubepioneiros.org.br', nome: 'Tia Joana (Tucano)',
    compartilha: true,
    ocupado: [{ dia: '2026-06-26', inicio: '09:00', fim: '12:00' }],
  },
  {
    endereco: 'arara@clubepioneiros.org.br', nome: 'Tio Márcio (Arara)',
    compartilha: false,
    ocupado: [],
  },
];

/** O dia em que a reunião dos conselheiros vai ser marcada. */
export const DIA_DA_REUNIAO = '2026-06-26';
export const GRADE = { de: '08:00', ate: '20:00', duracao: 90 };

/**
 * A partir de que hora o Tio Márcio pode.
 *
 * Ele trabalha, e o trabalho dele não está em calendário nenhum que o clube
 * possa ver — que é a situação da maioria das pessoas. Perguntar é o gesto que
 * o requisito 5.5 pede, e é o único jeito de saber disto.
 */
export const MARCIO_SO_DEPOIS_DE = '18:00';

export function agendaDoClube(): Agenda {
  return {
    fuso: FUSO_DE_BRASILIA,
    calendarios: [
      {
        id: CALENDARIO_DO_CLUBE, nome: 'Clube Pioneiros', dono: 'voce',
        acessos: [], publico: false,
      },
      {
        id: MINHA_AGENDA, nome: 'Minha agenda', dono: 'voce',
        acessos: [], publico: false,
      },
    ],
    eventos: [
      {
        id: 'saida',
        titulo: 'Saída para o Acampamento de Inverno',
        local: 'Igreja Central — estacionamento',
        descricao: 'O ônibus sai às 6h em ponto. Levar mochila, saco de dormir, '
          + 'cantil e a autorização assinada. Quem chegar depois das 6h segue por conta própria.',
        dia: '2026-07-03', inicio: '06:00', fim: '07:00',
        fuso: FUSO_DE_BRASILIA,
        convidados: [],
        calendario: CALENDARIO_DO_CLUBE,
      },
      {
        id: 'conselho',
        titulo: 'Reunião do conselho',
        local: 'Sala da secretaria',
        descricao: '',
        dia: '2026-06-30', inicio: '19:30', fim: '21:00',
        fuso: FUSO_DE_BRASILIA,
        convidados: [],
        calendario: CALENDARIO_DO_CLUBE,
      },
      {
        id: 'dentista',
        titulo: 'Dentista',
        local: 'Clínica da 308',
        descricao: '',
        dia: '2026-06-26', inicio: '08:00', fim: '09:00',
        fuso: FUSO_DE_BRASILIA,
        convidados: [],
        calendario: MINHA_AGENDA,
      },
    ],
  };
}
