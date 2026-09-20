/**
 * De que estado da pasta de trabalho cada lição da CC-ES003 parte, e o que ela
 * cobra.
 *
 * ── Por que um `Record` sobre a união, e não um ternário ─────────────────
 * É a decisão do despacho de telas da CC-ES002, do outro lado da mesma ponte:
 * com dois cadernos um ternário funcionava; com sete, o `else` vira "todo o
 * resto" e a lição nova cai calada na aba do módulo 1 — o desbravador abre a
 * lição certa e encontra a planilha errada. Aqui a oitava lição **não compila**
 * até dizer de onde parte e o que cobra.
 *
 * ── E por que ele mora fora do componente e fora do teste ────────────────
 * Quem lê este mapa é a tela, que precisa montar a lição, **e** a trava, que
 * precisa conferir que nenhuma meta abre verde. Escrito só no teste — como o
 * de Word foi, quando só o teste precisava dele —, a tela teria de repetir a
 * escolha, e as duas divergiriam no primeiro caderno novo.
 */

import type { Caderno } from './planilha';
import type { MetaDaPlanilha } from './cadernoDoClube';
import { METAS_DE_ARRUMAR, cadernoDeArrumar } from './arrumarAsInscricoes';
import { METAS_DAS_CONTAS, cadernoDasContas } from './contasDoAcampamento';
import { METAS_DOS_CUSTOS, cadernoDosCustos } from './custosPorInscrito';
import { METAS_DAS_UNIDADES, cadernoDasUnidades } from './unidadesEConselheiros';
import { METAS_DO_DESTAQUE, cadernoDoDestaque } from './destaqueDasInscricoes';
import { METAS_DO_ORCAMENTO, cadernoDoOrcamento } from './orcamentoDoClube';
import { METAS_DA_CONFERENCIA, cadernoDaConferencia } from './conferenciaDaTesouraria';

export type CadernoDaLicao =
  | 'arrumar' | 'contas' | 'custos' | 'unidades' | 'destaque' | 'orcamento' | 'conferencia';

export interface LicaoDeCaderno {
  /** A pasta como a lição a encontra. Função, e não constante: cada abertura é nova. */
  inicial: () => Caderno;
  metas: MetaDaPlanilha[];
  /**
   * O roteiro da apresentação aparece nesta lição.
   *
   * Só na última: nas outras ele descreveria uma planilha pela metade, e a
   * pessoa ensaiaria em cima de nada. É a mesma regra do roteiro da estrutura
   * na CC-ES001, e do de Python na CC004 — ele não é tarefa, porque o
   * requisito 8 acontece na conversa com o examinador e a plataforma não
   * confere nada dela.
   */
  roteiro?: true;
}

export const CADERNOS_DA_CC_ES003: Record<CadernoDaLicao, LicaoDeCaderno> = {
  arrumar: { inicial: cadernoDeArrumar, metas: METAS_DE_ARRUMAR },
  contas: { inicial: cadernoDasContas, metas: METAS_DAS_CONTAS },
  custos: { inicial: cadernoDosCustos, metas: METAS_DOS_CUSTOS },
  unidades: { inicial: cadernoDasUnidades, metas: METAS_DAS_UNIDADES },
  destaque: { inicial: cadernoDoDestaque, metas: METAS_DO_DESTAQUE },
  orcamento: { inicial: cadernoDoOrcamento, metas: METAS_DO_ORCAMENTO },
  conferencia: { inicial: cadernoDaConferencia, metas: METAS_DA_CONFERENCIA, roteiro: true },
};
