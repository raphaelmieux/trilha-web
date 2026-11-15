import type { LabType, Specialty } from '../types';
import type { Vereda } from './veredas';

/*
  Quantos laboratórios cada trilha e vereda anunciada vai ter.

  A Faixa reserva desde já o lugar de toda conquista da plataforma escrita, e o
  laboratório é a maior parte delas: cada um é um pin que orbita o patch ou o
  button do seu percurso. Para reservar o lugar de quem ainda não foi escrito,
  é preciso saber quantos serão, e o número vem daqui.

  ── É compromisso, e não estimativa solta ─────────────────────────────────
  Os números saíram da leitura de cada PDF de requisitos, item por item (a
  tabela inteira está em `docs/faixa-planejamento.md`). Quando a trilha ou a
  vereda abre, `laboratoriosPrevistos.test.ts` confere que ela abriu com
  exatamente este número. Abrir com outro não é proibido, mas é edição
  consciente daqui: o anel de satélites do percurso muda de tamanho, e a Faixa
  de quem já a tinha aberta muda junto.

  A entrada continua aqui depois da abertura, de propósito. Apagá-la deixaria a
  conferência sem nada a conferir, e é justamente no dia de abrir que ela
  importa.

  Mora num arquivo próprio, e não em cada `anunciada(...)`, porque as duas
  listas de anunciadas (trilhas em `anunciadas.ts`, veredas em `veredas.ts`)
  leem daqui; um número espalhado em vinte e nove chamadas não se revisa de
  uma vez.
*/
export const LABORATORIOS_PREVISTOS: Readonly<Record<string, number>> = {
  /* Trilhas — laboratórios distintos, sem contar a prova final. */
  AP049: 3,
  AP052: 3,
  AP063: 2,
  AP064: 4,
  HM079: 3,
  HM090: 3,

  /* Veredas — um laboratório por módulo. */
  'CC-FE004': 9,
  'CC-FE005': 8,
  'CC-FE006': 9,
  'CC-FE007': 9,
  'CC-MB001': 8,
  'CC-MB002': 10,
  'CC-MB003': 7,
  'CC-MB004': 7,
  'CC-MB005': 10,
  'CC-BE001': 9,
  'CC-BE002': 8,
  'CC-BE003': 8,
  'CC-BE004': 10,
  'CC-BE005': 8,
  'CC-BE006': 9,
  'CC-SI001': 9,
  'CC-SI002': 8,
  'CC-SI003': 8,
  'CC-SI004': 8,
  'CC-SI005': 9,
  'CC-IE001': 8,
  'CC-IE002': 9,
  'CC-IE003': 9,
};


/*
  A prova final é um `labType` também, e não é laboratório: ela não rende
  insígnia de laboratório, e na Faixa não vira satélite.
*/
const NAO_E_LABORATORIO: ReadonlySet<LabType> = new Set<LabType>(['final_exam']);

/** Os tipos de laboratório de uma trilha, cada um uma vez, na ordem do currículo. */
export function tiposDeLaboratorioDaTrilha(trilha: Specialty): LabType[] {
  const tipos: LabType[] = [];
  for (const m of trilha.modules)
    for (const l of m.lessons)
      if (l.labType && !NAO_E_LABORATORIO.has(l.labType) && !tipos.includes(l.labType)) tipos.push(l.labType);
  return tipos;
}

/** Quantos laboratórios a trilha tem, ou vai ter, se ainda é anunciada. */
export function laboratoriosDaTrilha(trilha: Specialty): number {
  return trilha.emConstrucao
    ? LABORATORIOS_PREVISTOS[trilha.code] ?? 0
    : tiposDeLaboratorioDaTrilha(trilha).length;
}

/** Quantos laboratórios a vereda tem, ou vai ter, se ainda é anunciada. */
export function laboratoriosDaVereda(vereda: Vereda): number {
  return vereda.emConstrucao
    ? LABORATORIOS_PREVISTOS[vereda.code] ?? 0
    : vereda.modulos.flatMap(m => m.licoes).filter(l => l.tipo !== 'teoria').length;
}
