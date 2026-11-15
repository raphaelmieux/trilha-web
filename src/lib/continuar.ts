import { statusDasLicoes, getProgressPercent, getProgressDetail, type ProgressMap } from './progress';
import { licaoVencida, type PercursoDeVereda } from './veredas';
import { licoesDaVereda, type Vereda } from '../curriculum/veredas';
import { nomeCompleto, type LessonType, type Specialty } from '../types';

/*
 * O que está em andamento, por onde continuar — e o que começar.
 *
 * ── Por que isto existe ──────────────────────────────────────────────────
 * O painel lista treze trilhas por família e cinquenta e uma veredas, cada uma
 * no seu lugar fixo. Quem estuda três coisas ao mesmo tempo precisava lembrar
 * quais eram e rolar até achar cada uma — e, dentro dela, procurar qual lição
 * faltava. É o "Continuar assistindo" de qualquer serviço de vídeo: o que
 * ficou pela metade, do mais recente para o mais antigo, com um clique até o
 * próximo passo.
 *
 * ── Trilha e vereda na mesma fila ────────────────────────────────────────
 * Separadas, a pergunta "o que eu estava fazendo?" teria duas respostas em
 * dois lugares. A fila é uma só, ordenada pela última vez em que a pessoa
 * mexeu em cada uma. O cartão diz qual das duas é — chamar as duas de
 * "percurso" na tela desfaria a distinção que o resto da plataforma sustenta.
 *
 * ── E o próximo passo de cada grupo que ficou parado ─────────────────────
 * Só o que está pela metade deixava de fora quem terminou uma coisa e não
 * começou a seguinte: concluir a CC-ES002 tirava as veredas de Escritório
 * inteiras da seção, e a CC-ES003, aberta e esperando, só se achava rolando o
 * catálogo. Por isso cada grupo — as famílias de trilha e as de vereda,
 * separadas — que não tem nada em andamento oferece a primeira que dá para
 * começar. Grupo com algo pela metade não oferece nada: o próximo passo dele
 * já está no cartão do que está em andamento, e dois caminhos para o mesmo
 * grupo dividiriam a pessoa em vez de levá-la adiante.
 */

export interface ParaContinuar {
  tipo: 'trilha' | 'vereda';
  /**
   * Pela metade, ou a primeira do grupo que dá para começar. As duas viajam no
   * mesmo formato porque o cartão é quase o mesmo — e o que muda nele é
   * justamente o que este campo diz.
   */
  estado: 'em-andamento' | 'para-comecar';
  /** A família da trilha ou da vereda, que é o grupo do painel. */
  grupo: string;
  code: string;
  /** Código + nome, por `nomeCompleto`. */
  nome: string;
  /** Lições vencidas e o total, sem a avaliação final — é a conta da tela da trilha. */
  feitas: number;
  total: number;
  /**
   * O percentual que o cartão do painel mostra para a mesma trilha ou vereda.
   * Na trilha ele é de requisitos, e não de lições: escrever outro número aqui
   * faria o mesmo percurso aparecer com duas porcentagens na mesma tela.
   */
  percent: number;
  /** O pedaço âmbar da barra da trilha — ver `getProgressDetail`. */
  parcial: number;
  /** A próxima lição a fazer: o que o botão abre. */
  proxima: { titulo: string; tipo: LessonType; rota: string };
  /** ISO da última atividade; sem ela, a trilha ou vereda vai para o fim da fila. */
  ultimaVez?: string;
}

/**
 * A trilha está em andamento? Se estiver, por onde continuar.
 *
 * Começou é qualquer sinal de que a pessoa entrou: lição feita, requisito com
 * nota, ou matrícula (que a lição grava já na primeira tentativa, passando ou
 * não). Errar tudo numa lição continua sendo ter começado — e é justamente quem
 * mais precisa de um caminho de volta.
 *
 * A próxima é a **primeira** lição por fazer, na ordem do currículo, e não a
 * seguinte à última feita: quem pulou a lição 1 e fez a 2 e a 3 tem a 1 por
 * fazer, e a trilha não se conclui sem ela. A avaliação final só aparece quando
 * não sobrou lição nenhuma antes dela.
 */
export function trilhaParaContinuar(
  e: Specialty,
  progress: ProgressMap,
  feitas: Set<string>,
  ultimaVez: string | undefined,
): ParaContinuar | null {
  if (e.emConstrucao) return null;

  const codes = e.requirements.map(r => r.code);
  const percent = getProgressPercent(codes, progress);
  if (percent >= 100) return null;

  const todas = e.modules.flatMap(m => m.lessons.map(l => ({ l, m })));
  const status = statusDasLicoes(todas.map(x => x.l), progress, feitas);
  const licoes = todas.filter(x => x.l.type !== 'final');
  const vencidas = licoes.filter(x => status[x.l.code] === 'completed').length;
  const parcial = getProgressDetail(codes, progress).parcial;

  const comecou = ultimaVez !== undefined || percent > 0 || parcial > 0 || vencidas > 0;
  if (!comecou) return null;

  const proxima = todas.find(x => status[x.l.code] !== 'completed');
  if (!proxima) return null;

  return {
    tipo: 'trilha',
    estado: 'em-andamento',
    grupo: e.familia,
    code: e.code,
    nome: nomeCompleto(e),
    feitas: vencidas,
    total: licoes.length,
    percent,
    parcial,
    proxima: {
      titulo: proxima.l.title,
      tipo: proxima.l.type,
      rota: `/licao/${e.code}/${proxima.m.code}/${proxima.l.code}`,
    },
    ultimaVez,
  };
}

/**
 * A vereda está em andamento? Se estiver, por onde continuar.
 *
 * Aqui começar é ter vencido alguma lição — a vereda não tem matrícula, e
 * abrir a página não grava nada. A próxima é a primeira não vencida, pela
 * mesma razão da trilha, e o endereço a abre direto pelo `?licao=` da
 * `VeredaPage`.
 */
export function veredaParaContinuar(
  v: Vereda,
  feito: PercursoDeVereda | undefined,
): ParaContinuar | null {
  if (v.emConstrucao) return null;
  const licoes = licoesDaVereda(v);
  const vencidas = licoes.filter(l => licaoVencida(l, feito)).length;
  /* Zero de zero não é andamento, nem é tudo: é a vereda sem lição. */
  if (licoes.length === 0 || vencidas === 0 || vencidas === licoes.length) return null;

  const proxima = licoes.find(l => !licaoVencida(l, feito));
  if (!proxima) return null;

  return {
    tipo: 'vereda',
    estado: 'em-andamento',
    grupo: v.familia,
    code: v.code,
    nome: nomeCompleto(v),
    feitas: vencidas,
    total: licoes.length,
    percent: Math.round((vencidas / licoes.length) * 100),
    parcial: 0,
    proxima: {
      titulo: proxima.titulo,
      tipo: proxima.tipo === 'teoria' ? 'theory' : 'lab',
      rota: `/vereda/${v.code}?licao=${encodeURIComponent(proxima.id)}`,
    },
    ultimaVez: feito?.ultimaVez,
  };
}

/**
 * A fila: a mais recente primeiro.
 *
 * Sem data vai para o fim, e não para o começo: pôr no topo afirmaria que foi
 * a última coisa estudada, que é justamente o que não se sabe. É a regra das
 * conquistas sem data no relatório, do outro lado.
 */
export function ordenarParaContinuar(lista: ParaContinuar[]): ParaContinuar[] {
  return [...lista].sort((a, b) => {
    if (a.ultimaVez === b.ultimaVez) return 0;
    if (!a.ultimaVez) return 1;
    if (!b.ultimaVez) return -1;
    return a.ultimaVez < b.ultimaVez ? 1 : -1;
  });
}

/**
 * A trilha está aberta e ainda não começada? Então ela pode ser oferecida.
 *
 * "Não começada" é o avesso exato de `trilhaParaContinuar`: nenhum sinal de
 * entrada. Uma trilha começada nunca é oferecida para começar — ela já é um
 * cartão de continuar —, e uma terminada não é oferecida de jeito nenhum.
 */
export function trilhaParaComecar(
  e: Specialty,
  progress: ProgressMap,
  feitas: Set<string>,
  ultimaVez: string | undefined,
): ParaContinuar | null {
  if (e.emConstrucao) return null;
  const codes = e.requirements.map(r => r.code);
  if (getProgressPercent(codes, progress) >= 100) return null;
  if (trilhaParaContinuar(e, progress, feitas, ultimaVez)) return null;

  const todas = e.modules.flatMap(m => m.lessons.map(l => ({ l, m })));
  const primeira = todas[0];
  if (!primeira) return null;

  return {
    tipo: 'trilha',
    estado: 'para-comecar',
    grupo: e.familia,
    code: e.code,
    nome: nomeCompleto(e),
    feitas: 0,
    total: todas.filter(x => x.l.type !== 'final').length,
    percent: 0,
    parcial: 0,
    proxima: {
      titulo: primeira.l.title,
      tipo: primeira.l.type,
      rota: `/licao/${e.code}/${primeira.m.code}/${primeira.l.code}`,
    },
  };
}

/** A vereda está aberta, tem lição, e nenhuma foi vencida? Então ela pode ser oferecida. */
export function veredaParaComecar(
  v: Vereda,
  feito: PercursoDeVereda | undefined,
): ParaContinuar | null {
  if (v.emConstrucao) return null;
  const licoes = licoesDaVereda(v);
  if (licoes.length === 0 || licoes.some(l => licaoVencida(l, feito))) return null;
  const primeira = licoes[0];

  return {
    tipo: 'vereda',
    estado: 'para-comecar',
    grupo: v.familia,
    code: v.code,
    nome: nomeCompleto(v),
    feitas: 0,
    total: licoes.length,
    percent: 0,
    parcial: 0,
    proxima: {
      titulo: primeira.titulo,
      tipo: primeira.tipo === 'teoria' ? 'theory' : 'lab',
      rota: `/vereda/${v.code}?licao=${encodeURIComponent(primeira.id)}`,
    },
  };
}

/** O que a seção "Continue aprendendo" mostra, nas duas partes dela. */
export interface ContinueAprendendo {
  /** Pela metade, da mais recente para a mais antiga. */
  emAndamento: ParaContinuar[];
  /** Uma por grupo sem nada em andamento, na ordem dos grupos do painel. */
  paraComecar: ParaContinuar[];
}

/**
 * Monta as duas partes da seção.
 *
 * Os grupos chegam na ordem do painel — as famílias de trilha, depois as de
 * vereda — e cada um com os itens na ordem dele, que é a ordem em que se
 * percorre: o nível na trilha, o registro na vereda. "A próxima disponível" é
 * a primeira dessa ordem que está liberada e não foi começada nem terminada.
 *
 * Liberada é a mesma regra dos cartões do painel, e vale para os dois lados:
 * oferecer uma vereda que pede outra antes levaria a uma porta trancada, e o
 * cartão que promete "Começar" não pode abrir num cadeado.
 */
export function continueAprendendo(entrada: {
  trilhas: { nome: string; trilhas: Specialty[] }[];
  veredas: { nome: string; veredas: Vereda[] }[];
  progress: ProgressMap;
  feitas: Set<string>;
  ultimaAtividade: Record<string, string>;
  percursoDe: (id: string) => PercursoDeVereda | undefined;
  trilhaLiberada: (e: Specialty) => boolean;
  veredaLiberada: (v: Vereda) => boolean;
}): ContinueAprendendo {
  const emAndamento: ParaContinuar[] = [];
  const paraComecar: ParaContinuar[] = [];
  const naoNulo = (c: ParaContinuar | null): c is ParaContinuar => c !== null;

  for (const grupo of entrada.trilhas) {
    const liberadas = grupo.trilhas.filter(entrada.trilhaLiberada);
    const andando = liberadas
      .map(e => trilhaParaContinuar(e, entrada.progress, entrada.feitas, entrada.ultimaAtividade[e.code]))
      .filter(naoNulo);
    emAndamento.push(...andando);
    if (andando.length > 0) continue;
    const proxima = liberadas
      .map(e => trilhaParaComecar(e, entrada.progress, entrada.feitas, entrada.ultimaAtividade[e.code]))
      .find(naoNulo);
    if (proxima) paraComecar.push(proxima);
  }

  for (const grupo of entrada.veredas) {
    const liberadas = grupo.veredas.filter(entrada.veredaLiberada);
    const andando = liberadas.map(v => veredaParaContinuar(v, entrada.percursoDe(v.id))).filter(naoNulo);
    emAndamento.push(...andando);
    if (andando.length > 0) continue;
    const proxima = liberadas.map(v => veredaParaComecar(v, entrada.percursoDe(v.id))).find(naoNulo);
    if (proxima) paraComecar.push(proxima);
  }

  return { emAndamento: ordenarParaContinuar(emAndamento), paraComecar };
}
