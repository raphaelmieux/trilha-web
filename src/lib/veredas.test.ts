// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { VEREDAS, licoesDaVereda, topicosDaVereda } from '../curriculum/veredas';
import {
  EVENTO_TOPICO, EVENTO_LABORATORIO,
  percursoDosEventos, veredasConcluidas, licaoVencida, licoesVencidas,
} from './veredas';
import type { EventoDeAtividade } from './atividade';
import { validateHtml } from './htmlValidator';
import { PASSOS } from '../labs/desafioDeHtml';

const vereda = VEREDAS[0];
const licoes = licoesDaVereda(vereda);
const topicos = topicosDaVereda(vereda).map(t => t.id);
const laboratorios = licoes.filter(l => l.tipo === 'laboratorio').map(l => l.id);

const lido = (topico: string, qual = vereda.id): EventoDeAtividade =>
  ({ event_type: EVENTO_TOPICO, metadata: { vereda: qual, topico } });
const vencido = (licao: string, qual = vereda.id): EventoDeAtividade =>
  ({ event_type: EVENTO_LABORATORIO, metadata: { vereda: qual, licao } });

const tudo = [...topicos.map(t => lido(t)), ...laboratorios.map(l => vencido(l))];

describe('o percurso de uma vereda', () => {
  it('separa o que foi lido do que foi vencido', () => {
    const p = percursoDosEventos([lido(topicos[0]), vencido(laboratorios[0])])[vereda.id];
    expect(p.topicos).toEqual(new Set([topicos[0]]));
    expect(p.laboratorios).toEqual(new Set([laboratorios[0]]));
  });

  it('não conta a mesma coisa duas vezes', () => {
    const p = percursoDosEventos([lido(topicos[0]), lido(topicos[0])])[vereda.id];
    expect(p.topicos.size).toBe(1);
  });

  /* A vereda se chamou mini-trilha por uma hora, e nessa hora houve quem
     lesse. Apagar o que essa pessoa fez para arrumar um nome nosso seria
     cobrar dela o preço da nossa decisão. */
  it('ainda lê os eventos gravados com o nome antigo', () => {
    const antigo: EventoDeAtividade = {
      event_type: 'mini_trilha_topico',
      metadata: { trilha: vereda.id, topico: topicos[0] },
    };
    expect(percursoDosEventos([antigo])[vereda.id].topicos).toEqual(new Set([topicos[0]]));
  });
});

describe('o que conta como lição vencida', () => {
  it('a teoria pede todos os tópicos dela, e não um a menos', () => {
    const teoria = licoes.find(l => l.tipo === 'teoria')!;
    const seus = teoria.tipo === 'teoria' ? teoria.topicos.map(t => t.id) : [];
    const quaseTodos = percursoDosEventos(seus.slice(0, -1).map(t => lido(t)))[vereda.id];
    expect(licaoVencida(teoria, quaseTodos)).toBe(false);
    expect(licaoVencida(teoria, percursoDosEventos(seus.map(t => lido(t)))[vereda.id])).toBe(true);
  });

  it('o laboratório pede o evento dele, e ler a teoria não o vence', () => {
    const lab = licoes.find(l => l.tipo === 'laboratorio')!;
    expect(licaoVencida(lab, percursoDosEventos(topicos.map(t => lido(t)))[vereda.id])).toBe(false);
    expect(licaoVencida(lab, percursoDosEventos([vencido(lab.id)])[vereda.id])).toBe(true);
  });
});

describe('quando a vereda acaba', () => {
  it('não acaba com a teoria toda lida e os laboratórios por fazer', () => {
    expect(veredasConcluidas(topicos.map(t => lido(t)))).toEqual([]);
  });

  it('não acaba com os laboratórios feitos e a teoria por ler', () => {
    expect(veredasConcluidas(laboratorios.map(l => vencido(l)))).toEqual([]);
  });

  it('acaba quando as duas metades estão vencidas', () => {
    expect(licoesVencidas(vereda, percursoDosEventos(tudo)[vereda.id])).toBe(licoes.length);
    expect(veredasConcluidas(tudo)).toEqual([vereda.id]);
  });

  /*
    A coluna é jsonb, e jsonb aceita lista e escalar. Um evento de outra
    versão do aplicativo não pode derrubar o percurso de quem já andou.
  */
  it('ignora evento com metadata que não é do formato esperado', () => {
    const torto: EventoDeAtividade[] = [
      { event_type: EVENTO_TOPICO, metadata: null },
      { event_type: EVENTO_TOPICO, metadata: [1, 2] },
      { event_type: EVENTO_TOPICO, metadata: { vereda: vereda.id } },
      { event_type: EVENTO_LABORATORIO, metadata: { vereda: vereda.id } },
      { event_type: 'outra_coisa', metadata: { vereda: vereda.id, topico: topicos[0] } },
    ];
    expect(percursoDosEventos(torto)).toEqual({});
    expect(veredasConcluidas(torto)).toEqual([]);
  });
});

/*
  Nenhum laboratório de vereda abre resolvido.

  É a mesma trava dos desafios da trilha, e pela mesma razão: o erro é
  invisível de dentro, porque o painel mostra tarefas concluídas — que é
  exatamente o que se espera de quem já trabalhou. Sete laboratórios são sete
  chances de repetir o erro sem ninguém ver.
*/
describe('os modelos dos laboratórios da vereda', () => {
  for (const vereda of VEREDAS) {
    for (const licao of licoesDaVereda(vereda)) {
      if (licao.tipo !== 'laboratorio') continue;
      it(`${vereda.codigo} · ${licao.id} abre sem nenhuma verificação verde`, () => {
        const verdes = validateHtml(licao.modelo, licao.verificacoes)
          .filter(r => r.passed).map(r => r.id);
        expect(verdes).toEqual([]);
      });
    }
  }

  it('toda verificação cobrada tem passo a passo para quem travar', () => {
    const sem = VEREDAS.flatMap(v => licoesDaVereda(v))
      .flatMap(l => (l.tipo === 'laboratorio' ? l.verificacoes : []))
      .filter(id => !PASSOS[id]?.length);
    expect([...new Set(sem)]).toEqual([]);
  });
});

/*
  Módulo e lição não repetem a mesma frase.

  A primeira montagem herdava o título e o resumo do capítulo para a lição de
  teoria, e o cartão do módulo saía dizendo duas vezes a mesma coisa, uma
  embaixo da outra — que lido de cima parece erro de montagem, e não hierarquia.
*/
describe('os nomes dentro de um módulo', () => {
  for (const vereda of VEREDAS) {
    for (const modulo of vereda.modulos) {
      it(`${modulo.id} não repete o próprio nome numa lição`, () => {
        for (const licao of modulo.licoes) {
          expect(licao.titulo).not.toBe(modulo.titulo);
          expect(licao.resumo).not.toBe(modulo.resumo);
        }
      });
    }
  }
});
