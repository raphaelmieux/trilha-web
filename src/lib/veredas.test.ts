// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { VEREDAS, veredasAbertas, licoesDaVereda, topicosDaVereda } from '../curriculum/veredas';
import {
  EVENTO_TOPICO, EVENTO_TEORIA, EVENTO_LABORATORIO,
  percursoDosEventos, veredasConcluidas, licaoVencida, licoesVencidas,
} from './veredas';
import type { EventoDeAtividade } from './atividade';
import { validateHtml } from './htmlValidator';
import { PASSOS } from '../labs/desafioDeHtml';

const vereda = veredasAbertas()[0];
const licoes = licoesDaVereda(vereda);
const topicos = topicosDaVereda(vereda).map(t => t.id);
const teorias = licoes.filter(l => l.tipo === 'teoria').map(l => l.id);
const laboratorios = licoes.filter(l => l.tipo === 'laboratorio').map(l => l.id);

const lido = (topico: string, qual = vereda.id): EventoDeAtividade =>
  ({ event_type: EVENTO_TOPICO, metadata: { vereda: qual, topico } });
const vencido = (licao: string, evento = EVENTO_LABORATORIO, qual = vereda.id): EventoDeAtividade =>
  ({ event_type: evento, metadata: { vereda: qual, licao } });

const tudo = [
  ...teorias.map(l => vencido(l, EVENTO_TEORIA)),
  ...laboratorios.map(l => vencido(l)),
];

describe('o percurso de uma vereda', () => {
  it('junta as lições vencidas, de qualquer tipo', () => {
    const p = percursoDosEventos([
      vencido(teorias[0], EVENTO_TEORIA), vencido(laboratorios[0]),
    ])[vereda.id];
    expect(p.licoes).toEqual(new Set([teorias[0], laboratorios[0]]));
  });

  it('não conta a mesma lição duas vezes', () => {
    const p = percursoDosEventos([vencido(laboratorios[0]), vencido(laboratorios[0])])[vereda.id];
    expect(p.licoes.size).toBe(1);
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
  it('a teoria pede o evento dela: abrir os tópicos não vence mais', () => {
    const teoria = licoes.find(l => l.tipo === 'teoria')!;
    expect(licaoVencida(teoria, percursoDosEventos([vencido(teoria.id, EVENTO_TEORIA)])[vereda.id]))
      .toBe(true);
  });

  /*
    A regra mudou depois que a vereda ganhou questões, e quem percorreu a
    teoria pelo caminho antigo — todos os tópicos abertos — continua com ela
    vencida. Nada novo entra por aí: o evento de tópico deixou de ser escrito.
  */
  it('aceita a teoria vencida pela regra antiga, com todos os tópicos abertos', () => {
    const teoria = licoes.find(l => l.tipo === 'teoria')!;
    const seus = teoria.tipo === 'teoria' ? teoria.topicos.map(t => t.id) : [];
    expect(licaoVencida(teoria, percursoDosEventos(seus.slice(0, -1).map(t => lido(t)))[vereda.id]))
      .toBe(false);
    expect(licaoVencida(teoria, percursoDosEventos(seus.map(t => lido(t)))[vereda.id]))
      .toBe(true);
  });

  it('o laboratório pede o evento dele, e ler a teoria não o vence', () => {
    const lab = licoes.find(l => l.tipo === 'laboratorio')!;
    expect(licaoVencida(lab, percursoDosEventos(topicos.map(t => lido(t)))[vereda.id])).toBe(false);
    expect(licaoVencida(lab, percursoDosEventos([vencido(lab.id)])[vereda.id])).toBe(true);
  });
});

describe('quando a vereda acaba', () => {
  it('não acaba com a teoria toda vencida e os laboratórios por fazer', () => {
    expect(veredasConcluidas(teorias.map(l => vencido(l, EVENTO_TEORIA)))).toEqual([]);
  });

  it('não acaba com os laboratórios feitos e a teoria por vencer', () => {
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
      { event_type: 'outra_coisa', metadata: { vereda: vereda.id, licao: laboratorios[0] } },
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
  for (const vereda of veredasAbertas()) {
    for (const licao of licoesDaVereda(vereda)) {
      if (licao.tipo !== 'laboratorio') continue;
      it(`${vereda.code} · ${licao.id} abre sem nenhuma verificação verde`, () => {
        const verdes = validateHtml(licao.modelo, licao.verificacoes)
          .filter(r => r.passed).map(r => r.id);
        expect(verdes).toEqual([]);
      });
    }
  }

  it('toda verificação cobrada tem passo a passo para quem travar', () => {
    const sem = veredasAbertas().flatMap(v => licoesDaVereda(v))
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
  for (const vereda of veredasAbertas()) {
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

/*
  A vereda anunciada não se conclui sozinha.

  Ela tem zero lições, e "zero vencidas de zero" satisfazia a comparação: as
  trinta e uma que ainda não existem apareciam concluídas para todo mundo, com
  insígnia. É o mesmo vazio que já enganou a verificação de links quebrados.
*/
describe('as veredas ainda em construção', () => {
  it('não contam como concluídas, nem para quem nunca abriu nada', () => {
    expect(veredasConcluidas([])).toEqual([]);
    expect(veredasConcluidas(tudo)).toEqual([vereda.id]);
  });

  it('ficam de fora do que se cobra insígnia', () => {
    const anunciadas = VEREDAS.filter(v => v.emConstrucao).map(v => v.id);
    expect(anunciadas.length).toBeGreaterThan(0);
    for (const id of anunciadas) expect(veredasConcluidas(tudo)).not.toContain(id);
  });
});

/*
  Toda vereda anunciada tem emblema e certificado esperando por ela.

  A arte foi enviada antes do conteúdo, de propósito: o cartão em construção
  mostra o emblema, e é ele que faz o clube ver o que vem. Um código sem
  arquivo cai no ícone de reserva e some da lista do que está por vir.
*/
describe('a arte de cada vereda', () => {
  for (const v of VEREDAS) {
    it(`${v.code} tem emblema e certificado no repositório`, () => {
      expect(existsSync(`public/assets/specialties/${v.code}.png`), 'emblema').toBe(true);
      expect(existsSync(`public/assets/certificates/${v.code}.png`), 'certificado').toBe(true);
    });
  }
});
