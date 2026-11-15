import { describe, it, expect } from 'vitest';
import {
  trilhaParaContinuar, veredaParaContinuar, ordenarParaContinuar, trilhaParaComecar, veredaParaComecar,
  continueAprendendo, type ParaContinuar,
} from './continuar';
import { percursoDosEventos, percursoVazio, EVENTO_TEORIA, EVENTO_LABORATORIO } from './veredas';
import type { ProgressMap } from './progress';
import type { Specialty } from '../types';
import type { Vereda } from '../curriculum/veredas';
import { getAllSpecialties, getFamilias, nomeDoGrupo } from '../curriculum';
import { mestrados } from './mestrados';

/*
  "Continue aprendendo" — o que entra na fila, por onde cada um continua, e
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

describe('a trilha ou vereda para começar', () => {
  it('oferece a trilha nunca começada pela primeira lição dela', () => {
    const c = trilhaParaComecar(trilha, {}, new Set(), undefined);
    expect(c?.estado).toBe('para-comecar');
    expect(c?.grupo).toBe('Computação');
    expect(c?.proxima.rota).toBe('/licao/TX001/TX001.1/TX001.1-L1');
    expect(c?.total).toBe(3);
  });

  /* Começada é cartão de continuar; oferecer de novo para começar daria dois
     caminhos para a mesma trilha na mesma seção. */
  it('não oferece a trilha já começada, nem só pela matrícula', () => {
    expect(trilhaParaComecar(trilha, cumpridos(['R1']), new Set(['TX001.1-L1']), undefined)).toBeNull();
    expect(trilhaParaComecar(trilha, {}, new Set(), '2026-10-20T10:00:00+00:00')).toBeNull();
  });

  it('não oferece a trilha terminada nem a anunciada', () => {
    expect(trilhaParaComecar(trilha, cumpridos(['R1', 'R2', 'R3']), new Set(), undefined)).toBeNull();
    expect(trilhaParaComecar({ ...trilha, emConstrucao: true } as Specialty, {}, new Set(), undefined)).toBeNull();
  });

  it('oferece a vereda sem lição vencida pela primeira lição, e só ela', () => {
    expect(veredaParaComecar(vereda, undefined)?.proxima.rota).toBe('/vereda/VT001?licao=m1-teoria');
    expect(veredaParaComecar(vereda, vencidas('m1-lab'))).toBeNull();
    expect(veredaParaComecar({ ...vereda, modulos: [] } as Vereda, undefined)).toBeNull();
    expect(veredaParaComecar({ ...vereda, emConstrucao: true } as Vereda, undefined)).toBeNull();
  });
});

describe('as duas partes da seção', () => {
  const verVereda = (id: string, code: string, familia: string) =>
    ({ ...vereda, id, code, familia }) as Vereda;
  const es1 = verVereda('es1', 'ES001', 'Escritório');
  const es2 = verVereda('es2', 'ES002', 'Escritório');
  const es3 = verVereda('es3', 'ES003', 'Escritório');
  const dg1 = verVereda('dg1', 'DG001', 'Design');
  const dg2 = verVereda('dg2', 'DG002', 'Design');
  const tudo = (...ids: string[]) => vencidas(...ids);
  const todasAsLicoes = ['m1-teoria', 'm1-lab', 'm2-teoria'];

  const montar = (percurso: Record<string, ReturnType<typeof vencidas>>, bloqueadas: string[] = []) =>
    continueAprendendo({
      trilhas: [{ nome: 'Computação', trilhas: [trilha] }],
      veredas: [{ nome: 'Escritório', veredas: [es1, es2, es3] }, { nome: 'Design', veredas: [dg1, dg2] }],
      progress: {},
      feitas: new Set(),
      ultimaAtividade: { TX001: '2026-10-20T10:00:00+00:00' },
      percursoDe: id => percurso[id],
      trilhaLiberada: () => true,
      veredaLiberada: v => !bloqueadas.includes(v.id),
    });

  /* É o caso que pediu esta parte: Escritório terminado até a ES002, nada pela
     metade nele, e a ES003 esperando aberta — antes, o grupo sumia da seção. */
  it('oferece a próxima do grupo que não tem nada em andamento', () => {
    const r = montar({ es1: tudo(...todasAsLicoes), es2: tudo(...todasAsLicoes), dg1: tudo('m1-teoria') });
    expect(r.emAndamento.map(c => c.code)).toEqual(['TX001', 'DG001']);
    expect(r.paraComecar.map(c => c.code)).toEqual(['ES003']);
  });

  it('não oferece nada no grupo que já tem algo em andamento', () => {
    const r = montar({ es1: tudo('m1-teoria'), dg1: tudo('m1-teoria') });
    expect(r.paraComecar).toEqual([]);
  });

  /* A próxima disponível é a primeira liberada, e não a primeira da lista:
     oferecer a trancada levaria o "Começar" a um cadeado. */
  it('pula a vereda trancada e oferece a seguinte que abre', () => {
    const r = montar({ es1: tudo(...todasAsLicoes), dg1: tudo('m1-teoria') }, ['es2']);
    expect(r.paraComecar.map(c => c.code)).toEqual(['ES003']);
  });

  it('não oferece nada no grupo inteiro concluído', () => {
    const t = todasAsLicoes;
    const r = montar({ es1: tudo(...t), es2: tudo(...t), es3: tudo(...t), dg1: tudo('m1-teoria') });
    expect(r.paraComecar).toEqual([]);
  });

  it('oferece um começo por grupo, na ordem dos grupos, a quem nunca começou nada', () => {
    const r = continueAprendendo({
      trilhas: [{ nome: 'Computação', trilhas: [trilha] }],
      veredas: [{ nome: 'Escritório', veredas: [es1, es2] }, { nome: 'Design', veredas: [dg1, dg2] }],
      progress: {}, feitas: new Set(), ultimaAtividade: {}, percursoDe: () => undefined,
      trilhaLiberada: () => true, veredaLiberada: () => true,
    });
    expect(r.emAndamento).toEqual([]);
    expect(r.paraComecar.map(c => `${c.tipo}:${c.code}`)).toEqual(['trilha:TX001', 'vereda:ES001', 'vereda:DG001']);
  });

  /* Trilha e vereda do mesmo nome de família são grupos diferentes: a trilha de
     Computação pela metade não tira da seção as veredas de Computação. */
  it('separa os grupos de trilha dos de vereda', () => {
    const cc = verVereda('cc1', 'VC001', 'Computação');
    const r = continueAprendendo({
      trilhas: [{ nome: 'Computação', trilhas: [trilha] }],
      veredas: [{ nome: 'Computação', veredas: [cc] }],
      progress: {}, feitas: new Set(), ultimaAtividade: { TX001: '2026-10-20T10:00:00+00:00' },
      percursoDe: () => undefined, trilhaLiberada: () => true, veredaLiberada: () => true,
    });
    expect(r.emAndamento.map(c => c.code)).toEqual(['TX001']);
    expect(r.paraComecar.map(c => c.code)).toEqual(['VC001']);
  });

  it('não oferece a trilha que ainda não está liberada', () => {
    const r = continueAprendendo({
      trilhas: [{ nome: 'Computação', trilhas: [trilha] }], veredas: [],
      progress: {}, feitas: new Set(), ultimaAtividade: {}, percursoDe: () => undefined,
      trilhaLiberada: () => false, veredaLiberada: () => true,
    });
    expect(r.paraComecar).toEqual([]);
  });
});

/* O grupo de HM079 e HM090 se lê "Design" na tela, e só na tela: a família é
   o que dá o código do Mestrado, e trocá-la no registro daria ao Mestrado da
   trilha o mesmo código do Mestrado das veredas de Design. */
describe('o nome do grupo na tela', () => {
  it('escreve Design para a família de Artes e Habilidades Manuais', () => {
    expect(nomeDoGrupo('Artes e Habilidades Manuais')).toBe('Design');
    expect(nomeDoGrupo('Computação')).toBe('Computação');
    expect(getFamilias().map(f => f.nome)).toContain('Design');
    expect(getFamilias().map(f => f.nome)).not.toContain('Artes e Habilidades Manuais');
  });

  it('não muda a família no registro, nem o código do Mestrado', () => {
    expect(getAllSpecialties().filter(s => s.code.startsWith('HM')).map(s => s.familia))
      .toEqual(['Artes e Habilidades Manuais', 'Artes e Habilidades Manuais']);
    const codigos = mestrados().map(m => m.code);
    expect(codigos).toContain('mestrado_artes_e_habilidades_manuais');
    expect(new Set(codigos).size).toBe(codigos.length);
  });

  it('chega ao cartão com o nome da tela', () => {
    const hm = { ...getAllSpecialties().find(s => s.code === 'HM079')!, emConstrucao: false } as Specialty;
    const c = trilhaParaComecar({ ...hm, modules: trilha.modules, requirements: trilha.requirements } as Specialty,
      {}, new Set(), undefined);
    expect(c?.grupo).toBe('Design');
  });
});
