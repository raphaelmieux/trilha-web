import { describe, it, expect } from 'vitest';
import { curiosidadesConquistadas, EVENTOS_DAS_CURIOSIDADES, type EntradaDasCuriosidades } from './curiosidades';
import { CURIOSIDADES, CODIGOS_DAS_CURIOSIDADES } from './catalogoDeCuriosidades';
import { VEREDAS, licoesDaVereda } from '../curriculum/veredas';
import type { EventoDeAtividade } from './atividade';
import type { Json } from '../types/database';

/*
  Cada curiosidade tem regra, e nenhuma vem de graça.

  As duas formas de errar são caladas. A curiosidade sem regra fica com um
  lugar na Faixa que ninguém consegue preencher, e a Faixa nunca fecha. A que
  vem de graça acende para todo mundo no primeiro dia, e deixa de dizer o que
  diz. Por isso cada uma tem aqui um exemplo que a alcança — e o conjunto
  vazio não alcança nenhuma.

  Os horários são escritos em UTC; Brasília está três horas atrás.
*/

const ev = (event_type: string, created_at: string, metadata: Json = {}): EventoDeAtividade => ({ event_type, created_at, metadata });
const vazia: EntradaDasCuriosidades = { eventos: [], tentativas: [], primeiraPalavra: null, trilhasConcluidas: [], veredasConcluidas: [] };
const com = (parcial: Partial<EntradaDasCuriosidades>) => curiosidadesConquistadas({ ...vazia, ...parcial });
const so = (...eventos: EventoDeAtividade[]) => com({ eventos });

const cc001 = VEREDAS.find(v => v.id === 'cc001')!;
const [teoria1, lab1] = licoesDaVereda(cc001);
const veredaComOrigem = VEREDAS.find(v => !v.emConstrucao && v.origem)!;

/* Um exemplo que alcança cada curiosidade, pelo código. */
const EXEMPLOS: Record<string, Partial<EntradaDasCuriosidades>> = {
  virada_sem_bug: { eventos: [ev('lesson_completed', '2027-12-30T15:00:00Z')] },
  internet_segura: { eventos: [ev('lesson_completed', '2027-02-10T15:00:00Z')] },
  mulheres_na_ciencia: { eventos: [ev('lesson_completed', '2027-02-12T15:00:00Z')] },
  dia_que_quase_nao_existe: { eventos: [ev('lesson_completed', '2028-02-29T15:00:00Z')] },
  nascimento_da_web: { eventos: [ev('lesson_completed', '2027-03-10T15:00:00Z')] },
  dia_do_pi: { eventos: [ev('lesson_completed', '2027-03-15T15:00:00Z')] },
  copia_de_seguranca: { eventos: [ev('lesson_completed', '2027-04-02T15:00:00Z')] },
  meninas_nas_tic: { eventos: [ev('lesson_completed', '2027-04-22T15:00:00Z')] },
  senha_forte: { eventos: [ev('lesson_completed', '2027-05-06T15:00:00Z')] },
  homem_que_calculava: { eventos: [ev('lesson_completed', '2027-05-06T15:00:00Z')] },
  sociedade_da_informacao: { eventos: [ev('lesson_completed', '2027-05-17T15:00:00Z')] },
  alan_turing: { eventos: [ev('lesson_completed', '2027-06-23T15:00:00Z')] },
  dia_do_emoji: { eventos: [ev('lesson_completed', '2027-07-17T15:00:00Z')] },
  primeiro_site: { eventos: [ev('lesson_completed', '2027-08-06T15:00:00Z')] },
  dia_da_fotografia: { eventos: [ev('lesson_completed', '2027-08-19T15:00:00Z')] },
  pinguim: { eventos: [ev('lesson_completed', '2027-08-25T15:00:00Z')] },
  byte_do_ano: { eventos: [ev('lesson_completed', '2026-09-13T15:00:00Z')] },
  codigo_aberto: { eventos: [ev('lesson_completed', '2026-09-19T15:00:00Z')] },
  ada_lovelace: { eventos: [ev('lesson_completed', '2026-10-13T15:00:00Z')] },
  quadro_a_quadro: { eventos: [ev('lesson_completed', '2026-10-28T15:00:00Z')] },
  dia_do_designer: { eventos: [ev('lesson_completed', '2026-11-05T15:00:00Z')] },
  seguranca_da_informacao: { eventos: [ev('lesson_completed', '2026-11-30T15:00:00Z')] },
  grace_hopper: { eventos: [ev('lesson_completed', '2026-12-09T15:00:00Z')] },

  madrugador: { eventos: [ev('lesson_completed', '2026-11-10T05:00:00Z')] },
  pessoa_da_manha: { eventos: [ev('lesson_completed', '2026-11-10T13:00:00Z')] },
  pessoa_da_tarde: { eventos: [ev('lesson_completed', '2026-11-10T18:00:00Z')] },
  noturno: { eventos: [ev('lesson_completed', '2026-11-10T23:30:00Z')] },
  fim_de_semana: { eventos: [ev('lesson_completed', '2026-11-14T15:00:00Z')] },
  semana_inteira: { eventos: [9, 10, 11, 12, 13, 14, 15].map(d => ev('lesson_completed', `2026-11-${d}T15:00:00Z`)) },
  pausa_boa: { eventos: [ev('lesson_completed', '2026-11-10T13:00:00Z'), ev('lesson_completed', '2026-11-10T15:30:00Z')] },
  doze_meses: { eventos: Array.from({ length: 12 }, (_, i) => ev('lesson_completed', `2027-${String(i + 1).padStart(2, '0')}-20T15:00:00Z`)) },
  um_ano_de_faixa: { eventos: [ev('lesson_completed', '2026-01-10T15:00:00Z'), ev('lesson_completed', '2027-01-12T15:00:00Z')] },

  revisao: { tentativas: [{ lesson_id: 'l1', passed: true, quando: '2026-11-10T15:00:00Z' }, { lesson_id: 'l1', passed: true, quando: '2026-11-12T15:00:00Z' }] },
  de_primeira: { eventos: [ev('final_exam_completed', '2026-11-10T15:00:00Z', { specialtyCode: 'AP034', score: 10, total: 10 })] },
  modulo_de_uma_vez: { eventos: [ev('vereda_teoria', '2026-11-10T13:00:00Z', { vereda: 'cc001', licao: teoria1.id }), ev('vereda_laboratorio', '2026-11-10T15:00:00Z', { vereda: 'cc001', licao: lab1.id })] },
  consulta: { eventos: [ev(EVENTOS_DAS_CURIOSIDADES.referencia, '2026-11-10T13:00:00Z', { vereda: 'cc001', licao: lab1.id }), ev('vereda_laboratorio', '2026-11-10T15:00:00Z', { vereda: 'cc001', licao: lab1.id })] },
  palavra_propria: { primeiraPalavra: '2026-11-10T15:00:00Z' },
  mao_no_teclado: { eventos: ['ctrl+z', 'ctrl+c', 'ctrl+v', 'f2', 'ctrl+b'].map((atalho, i) => ev(EVENTOS_DAS_CURIOSIDADES.atalho, `2026-11-1${i}T15:00:00Z`, { atalho })) },
  botao_direito: { eventos: [ev(EVENTOS_DAS_CURIOSIDADES.menu, '2026-11-10T15:00:00Z')] },
  na_parede: { eventos: [ev(EVENTOS_DAS_CURIOSIDADES.tokenImpresso, '2026-11-10T15:00:00Z')] },
  relatorio_entregue: { eventos: [ev(EVENTOS_DAS_CURIOSIDADES.relatorio, '2026-11-10T15:00:00Z')] },
  conferido: { eventos: [ev(EVENTOS_DAS_CURIOSIDADES.verificacao, '2026-11-10T15:00:00Z')] },

  tres_frentes: { eventos: ['AP034', 'AP041', 'AP042'].map((specialtyCode, i) => ev('lesson_completed', `2026-11-1${i}T15:00:00Z`, { specialtyCode, score: 9, total: 10 })) },
  ponte: { veredasConcluidas: [veredaComOrigem.id], trilhasConcluidas: [veredaComOrigem.origem!] },
  todas_as_janelas: { eventos: ['cc-es002', 'cc-es003', 'cc-es011', 'cc-es001', 'cc-es007', 'cc003', 'html', 'cc-dg001'].map((id, i) => {
    const v = VEREDAS.find(x => x.id === id)!;
    const lab = licoesDaVereda(v).find(l => l.tipo !== 'teoria')!;
    return ev('vereda_laboratorio', `2026-11-${10 + i}T15:00:00Z`, { vereda: id, licao: lab.id });
  }) },
  poliglota: { eventos: ['cc001', 'cc002', 'cc005', 'html', 'css'].map((id, i) => {
    const v = VEREDAS.find(x => x.id === id)!;
    const lab = licoesDaVereda(v).find(l => l.tipo !== 'teoria')!;
    return ev('vereda_laboratorio', `2026-11-1${i}T15:00:00Z`, { vereda: id, licao: lab.id });
  }) },
};
for (const s of CURIOSIDADES.filter(c => c.tema === 'segredo'))
  EXEMPLOS[s.code] = { eventos: [ev(EVENTOS_DAS_CURIOSIDADES.segredo, '2026-11-10T15:00:00Z', { segredo: s.code })] };

/*
  A Rosa dos Ventos pede uma lição em cada família de vereda, e hoje há
  família sem vereda aberta nenhuma (Mobile, Back-end...). Ela é a única que
  ainda não tem como ser alcançada, e é de propósito: fecha quando a última
  família abrir. A trava abaixo conta as famílias para saber quando parar de
  aceitar a exceção.
*/
const FAMILIAS_SEM_LICAO = [...new Set(VEREDAS.map(v => v.familia))]
  .filter(f => VEREDAS.filter(v => v.familia === f).every(v => licoesDaVereda(v).length === 0));
const AINDA_INALCANCAVEIS = FAMILIAS_SEM_LICAO.length > 0 ? ['rosa_dos_ventos'] : [];

describe('as curiosidades', () => {
  it('são 58, com códigos únicos', () => {
    expect(CURIOSIDADES).toHaveLength(58);
    expect(CODIGOS_DAS_CURIOSIDADES.size).toBe(58);
  });

  it('nenhuma vem de graça', () => {
    expect([...com({}).keys()]).toEqual([]);
  });

  it('toda curiosidade tem um exemplo que a alcança', () => {
    for (const { code } of CURIOSIDADES) {
      if (AINDA_INALCANCAVEIS.includes(code)) continue;
      expect(EXEMPLOS[code], `${code} sem exemplo`).toBeTruthy();
      expect(com(EXEMPLOS[code]).has(code), `${code} não foi alcançada pelo exemplo dela`).toBe(true);
    }
  });

  it('a data é a do evento que completou, e não a de hoje', () => {
    expect(so(ev('x', '2026-03-14T15:00:00Z')).get('dia_do_pi')).toBe('2026-03-14T15:00:00Z');
    expect(com(EXEMPLOS.pausa_boa).get('pausa_boa')).toBe('2026-11-10T15:30:00Z');
    expect(com(EXEMPLOS.ponte).get('ponte')).toBeNull();
  });
});

describe('o calendário', () => {
  it('vale a semana em volta da data, e não mais', () => {
    expect(so(ev('x', '2027-03-17T15:00:00Z')).has('dia_do_pi')).toBe(true);
    expect(so(ev('x', '2027-03-18T15:00:00Z')).has('dia_do_pi')).toBe(false);
  });

  it('atravessa a virada do ano', () => {
    expect(so(ev('x', '2027-01-03T15:00:00Z')).has('virada_sem_bug')).toBe(true);
    expect(so(ev('x', '2027-01-05T15:00:00Z')).has('virada_sem_bug')).toBe(false);
  });

  it('o 29 de fevereiro é só no dia', () => {
    expect(so(ev('x', '2028-02-28T15:00:00Z')).has('dia_que_quase_nao_existe')).toBe(false);
  });

  /* O dia é o de Brasília: 1h da manhã do dia 15 em UTC ainda é dia 14 aqui. */
  it('usa o dia de Brasília, e não o de UTC', () => {
    expect(so(ev('x', '2027-03-22T01:00:00Z')).has('dia_do_pi')).toBe(false);
    expect(so(ev('x', '2027-03-18T01:00:00Z')).has('dia_do_pi')).toBe(true);
  });
});

describe('os turnos', () => {
  it('a virada das seis da manhã separa o Madrugador da Pessoa da Manhã', () => {
    const quase = so(ev('x', '2026-11-10T08:59:00Z'));
    expect(quase.has('madrugador')).toBe(true);
    expect(quase.has('pessoa_da_manha')).toBe(false);
    const ja = so(ev('x', '2026-11-10T09:00:00Z'));
    expect(ja.has('pessoa_da_manha')).toBe(true);
    expect(ja.has('madrugador')).toBe(false);
  });
});

describe('o que não alcança', () => {
  it('pausa curta não é pausa boa', () => {
    expect(so(ev('x', '2026-11-10T13:00:00Z'), ev('x', '2026-11-10T14:00:00Z')).has('pausa_boa')).toBe(false);
  });

  it('a segunda tentativa vencida não é "de primeira"', () => {
    expect(so(
      ev('final_exam_completed', '2026-11-10T15:00:00Z', { specialtyCode: 'AP034', score: 2, total: 10 }),
      ev('final_exam_completed', '2026-11-11T15:00:00Z', { specialtyCode: 'AP034', score: 10, total: 10 }),
    ).has('de_primeira')).toBe(false);
  });

  it('quatro atalhos não bastam, nem o mesmo atalho cinco vezes', () => {
    const quatro = EXEMPLOS.mao_no_teclado.eventos!.slice(0, 4);
    expect(so(...quatro).has('mao_no_teclado')).toBe(false);
    const repetido = Array.from({ length: 5 }, () => ev(EVENTOS_DAS_CURIOSIDADES.atalho, '2026-11-10T15:00:00Z', { atalho: 'ctrl+z' }));
    expect(so(...repetido).has('mao_no_teclado')).toBe(false);
  });

  it('reprovar não conta para Três Frentes', () => {
    const fracos = ['AP034', 'AP041', 'AP042'].map(s => ev('lesson_completed', '2026-11-10T15:00:00Z', { specialtyCode: s, score: 1, total: 10 }));
    expect(so(...fracos).has('tres_frentes')).toBe(false);
  });

  it('consultar a referência sem vencer o laboratório não é Consulta', () => {
    expect(so(EXEMPLOS.consulta.eventos![0]).has('consulta')).toBe(false);
  });

  it('a Rosa dos Ventos espera todas as famílias de vereda', () => {
    const todasAsAbertas = VEREDAS.filter(v => licoesDaVereda(v).length > 0)
      .map((v, i) => ev('vereda_teoria', `2026-11-10T1${i % 10}:00:00Z`, { vereda: v.id, licao: licoesDaVereda(v)[0].id }));
    expect(so(...todasAsAbertas).has('rosa_dos_ventos')).toBe(FAMILIAS_SEM_LICAO.length === 0);
  });
});
