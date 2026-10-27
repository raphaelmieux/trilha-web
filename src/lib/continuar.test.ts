import { describe, it, expect } from 'vitest';
import { trilhaParaContinuar, veredaParaContinuar, ordenarParaContinuar, type ParaContinuar } from './continuar';
import { percursoDosEventos, percursoVazio, EVENTO_TEORIA, EVENTO_LABORATORIO } from './veredas';
import type { ProgressMap } from './progress';
import type { Specialty } from '../types';
import type { Vereda } from '../curriculum/veredas';

/*
  "Continue de onde parou" — o que entra na fila, por onde cada um continua, e
  em que ordem.

  Nada aqui estoura quando erra: um cartão que leva à lição já feita, uma
  trilha terminada que continua aparecendo, ou a mais antiga no topo são todos
  cartões plausíveis. É por isso que cada um tem caso próprio.
*/

const trilha = {
  code: 'TX001', name: 'Teste', level: 'basico', familia: 'Computação',
  description: '', emConstrucao: false,
  requirements: [{ code: 'R1' }, { code: 'R2' }, { code: 'R3' }],
  modules: [
    { code: 'TX001.1', title: 'Um', description: '', lessons: [
      { code: 'TX001.1-L1', title: 'Primeira', type: 'theory', requirementCodes: ['R1'] },
      { code: 'TX001.1-L2', title: 'Segunda', type: 'lab', requirementCodes: ['R2'] },
    ] },
    { code: 'TX001.2', title: 'Dois', description: '', lessons: [
      { code: 'TX001.2-L1', title: 'Terceira', type: 'theory', requirementCodes: ['R3'] },
      { code: 'TX001.F-L1', title: 'Avaliação final', type: 'final', requirementCodes: [] },
    ] },
  ],
} as unknown as Specialty;

const cumpridos = (codes: string[]): ProgressMap =>
  Object.fromEntries(codes.map(c => [c, { status: 'completed', mastery_score: 100 } as never]));

describe('a trilha na fila', () => {
  it('não entra quem nunca começou', () => {
    expect(trilhaParaContinuar(trilha, {}, new Set(), undefined)).toBeNull();
  });

  /* A lição grava a matrícula já na primeira tentativa, passando ou não. Quem
     errou tudo começou — e é quem mais precisa do caminho de volta. */
  it('entra quem só tem a matrícula, sem nada vencido', () => {
    const c = trilhaParaContinuar(trilha, {}, new Set(), '2026-10-20T10:00:00+00:00');
    expect(c?.proxima.titulo).toBe('Primeira');
  });

  it('não entra a trilha terminada', () => {
    expect(trilhaParaContinuar(trilha, cumpridos(['R1', 'R2', 'R3']), new Set(), '2026-10-20T10:00:00+00:00'))
      .toBeNull();
  });

  it('não entra a trilha anunciada', () => {
    const anunciada = { ...trilha, emConstrucao: true } as Specialty;
    expect(trilhaParaContinuar(anunciada, cumpridos(['R1']), new Set(['TX001.1-L1']), undefined)).toBeNull();
  });

  it('leva à primeira lição por fazer, com o endereço da lição', () => {
    const c = trilhaParaContinuar(trilha, cumpridos(['R1']), new Set(['TX001.1-L1']), undefined);
    expect(c?.proxima).toEqual({
      titulo: 'Segunda', tipo: 'lab', rota: '/licao/TX001/TX001.1/TX001.1-L2',
    });
    expect(c?.feitas).toBe(1);
    expect(c?.total).toBe(3);
  });

  /* Quem pulou a primeira e fez as outras tem a primeira por fazer: a trilha
     não se conclui sem ela, e "a seguinte à última feita" a esconderia. */
  it('volta à lição pulada, e não à seguinte da última feita', () => {
    const c = trilhaParaContinuar(trilha, cumpridos(['R2']), new Set(['TX001.1-L2']), undefined);
    expect(c?.proxima.titulo).toBe('Primeira');
  });

  it('só oferece a avaliação final quando não sobrou lição antes dela', () => {
    const c = trilhaParaContinuar(trilha, cumpridos(['R1', 'R2']),
      new Set(['TX001.1-L1', 'TX001.1-L2', 'TX001.2-L1']), undefined);
    expect(c?.proxima.tipo).toBe('final');
    expect(c?.feitas).toBe(3);
  });

  it('mostra o mesmo percentual do cartão da trilha, que é de requisitos', () => {
    const c = trilhaParaContinuar(trilha, cumpridos(['R1']), new Set(['TX001.1-L1']), undefined);
    expect(c?.percent).toBe(33);
  });
});

const vereda = {
  id: 'teste', code: 'VT001', name: 'Vereda de teste', familia: 'Computação',
  description: '', emConstrucao: false,
  modulos: [
    { id: 'm1', titulo: 'Um', resumo: '', licoes: [
      { id: 'm1-teoria', tipo: 'teoria', titulo: 'Teoria um', resumo: '', topicos: [{ id: 't1' }] },
      { id: 'm1-lab', tipo: 'laboratorio', titulo: 'Lab um', resumo: '' },
    ] },
    { id: 'm2', titulo: 'Dois', resumo: '', licoes: [
      { id: 'm2-teoria', tipo: 'teoria', titulo: 'Teoria dois', resumo: '', topicos: [{ id: 't2' }] },
    ] },
  ],
} as unknown as Vereda;

const vencidas = (...ids: string[]) => ({ ...percursoVazio(), licoes: new Set(ids) });

describe('a vereda na fila', () => {
  it('não entra sem nenhuma lição vencida', () => {
    expect(veredaParaContinuar(vereda, undefined)).toBeNull();
    expect(veredaParaContinuar(vereda, percursoVazio())).toBeNull();
  });

  it('não entra a vereda concluída', () => {
    expect(veredaParaContinuar(vereda, vencidas('m1-teoria', 'm1-lab', 'm2-teoria'))).toBeNull();
  });

  /* Zero de zero não é andamento: é a vereda que ainda não tem lição. */
  it('não entra a vereda sem lição nenhuma', () => {
    const vazia = { ...vereda, modulos: [] } as Vereda;
    expect(veredaParaContinuar(vazia, vencidas('m1-teoria'))).toBeNull();
  });

  it('não entra a vereda anunciada', () => {
    const anunciada = { ...vereda, emConstrucao: true } as Vereda;
    expect(veredaParaContinuar(anunciada, vencidas('m1-teoria'))).toBeNull();
  });

  /* O endereço abre a lição direto, pelo `?licao=` da VeredaPage: o cartão
     que diz qual é a próxima e leva à lista para procurá-la de novo seria o
     caminho que ele existe para encurtar. */
  it('abre a primeira lição não vencida pelo endereço', () => {
    const c = veredaParaContinuar(vereda, vencidas('m1-teoria'));
    expect(c?.proxima).toEqual({ titulo: 'Lab um', tipo: 'lab', rota: '/vereda/VT001?licao=m1-lab' });
    expect(c?.feitas).toBe(1);
    expect(c?.total).toBe(3);
    expect(c?.percent).toBe(33);
  });
});

describe('quando a vereda foi tocada por último', () => {
  const evento = (licao: string, created_at: string, event_type = EVENTO_LABORATORIO) =>
    ({ event_type, metadata: { vereda: 'teste', licao }, created_at });

  /* A mais recente vence em qualquer ordem de chegada: a consulta não ordena,
     e confiar na ordem do banco é confiar no que ninguém prometeu. */
  it('é o evento mais recente, chegue ele em que ordem chegar', () => {
    const p = percursoDosEventos([
      evento('m1-lab', '2026-10-25T10:00:00+00:00'),
      evento('m1-teoria', '2026-10-26T09:00:00+00:00', EVENTO_TEORIA),
      evento('m2-teoria', '2026-10-24T08:00:00+00:00', EVENTO_TEORIA),
    ]);
    expect(p.teste.ultimaVez).toBe('2026-10-26T09:00:00+00:00');
  });

  it('chega até a fila', () => {
    const p = percursoDosEventos([evento('m1-teoria', '2026-10-26T09:00:00+00:00', EVENTO_TEORIA)]);
    expect(veredaParaContinuar(vereda, p.teste)?.ultimaVez).toBe('2026-10-26T09:00:00+00:00');
  });
});

describe('a ordem da fila', () => {
  const item = (code: string, ultimaVez?: string) => ({ code, ultimaVez }) as ParaContinuar;

  it('põe a mais recente primeiro, trilha e vereda misturadas', () => {
    const fila = ordenarParaContinuar([
      item('AP034', '2026-10-20T10:00:00+00:00'),
      item('CC002', '2026-10-26T10:00:00+00:00'),
      item('AP043', '2026-10-23T10:00:00+00:00'),
    ]);
    expect(fila.map(c => c.code)).toEqual(['CC002', 'AP043', 'AP034']);
  });

  /* No topo, a sem data afirmaria ser a última estudada — que é justamente o
     que não se sabe. */
  it('manda para o fim quem não tem data', () => {
    const fila = ordenarParaContinuar([item('SEM'), item('AP034', '2026-10-20T10:00:00+00:00')]);
    expect(fila.map(c => c.code)).toEqual(['AP034', 'SEM']);
  });
});
