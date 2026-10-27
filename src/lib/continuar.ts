import { statusDasLicoes, getProgressPercent, getProgressDetail, type ProgressMap } from './progress';
import { licaoVencida, type PercursoDeVereda } from './veredas';
import { licoesDaVereda, type Vereda } from '../curriculum/veredas';
import { nomeCompleto, type LessonType, type Specialty } from '../types';

/*
 * O que está em andamento, e por onde continuar.
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
 */

export interface ParaContinuar {
  tipo: 'trilha' | 'vereda';
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
