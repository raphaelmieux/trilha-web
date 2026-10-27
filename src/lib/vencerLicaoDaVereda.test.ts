import { describe, it, expect, vi, beforeEach } from 'vitest';
import { veredasAbertas, licoesDaVereda } from '../curriculum/veredas';

/*
  A lição de vereda vencida avalia as insígnias, e só quando gravou alguma
  coisa.

  Sem a avaliação, o laboratório de vereda — que rende insígnia própria —
  ficava sem prêmio até a pessoa fazer qualquer coisa numa trilha, e quem só
  percorre veredas podia nunca receber. Nada estoura nesse caso: a lição fica
  verde, a estante fica igual, e ninguém sabe que faltou um aviso.
*/

const chamadas = vi.hoisted(() => ({
  gravou: true,
  avaliacoes: [] as unknown[][],
}));

vi.mock('./veredas', async original => ({
  ...(await original<typeof import('./veredas')>()),
  registrarLicaoVencida: async () => chamadas.gravou,
}));
vi.mock('./gamification', () => ({
  evaluateBadges: async (...args: unknown[]) => { chamadas.avaliacoes.push(args); return []; },
}));

const { vencerLicaoDaVereda } = await import('./vencerLicaoDaVereda');
const { percursoVazio } = await import('./veredas');

const vereda = veredasAbertas()[0];
const laboratorio = licoesDaVereda(vereda).find(l => l.tipo !== 'teoria')!;
const teoria = licoesDaVereda(vereda).find(l => l.tipo === 'teoria')!;

beforeEach(() => {
  chamadas.gravou = true;
  chamadas.avaliacoes = [];
});

describe('vencer uma lição de vereda', () => {
  it('avalia as insígnias logo depois de gravar o laboratório, dizendo onde', async () => {
    await vencerLicaoDaVereda('u1', vereda, laboratorio, percursoVazio());
    expect(chamadas.avaliacoes).toEqual([[
      'u1', { evento: 'vereda_laboratorio', percurso: vereda.code, licao: laboratorio.id },
    ]]);
  });

  it('avalia também depois da teoria, que anda nas escadas', async () => {
    await vencerLicaoDaVereda('u1', vereda, teoria, percursoVazio());
    expect(chamadas.avaliacoes[0]?.[1]).toMatchObject({ evento: 'vereda_teoria' });
  });

  it('não avalia quando nada novo foi gravado', async () => {
    chamadas.gravou = false;
    await vencerLicaoDaVereda('u1', vereda, laboratorio, percursoVazio());
    expect(chamadas.avaliacoes).toEqual([]);
  });
});
