// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { VEREDAS, veredasAbertas, veredasComConteudo, licoesDaVereda, topicosDaVereda,
  textoDaOrigem } from '../curriculum/veredas';
import { getAllSpecialties } from '../curriculum';
import {
  EVENTO_TOPICO, EVENTO_TEORIA, EVENTO_LABORATORIO,
  percursoDosEventos, veredasConcluidas, licaoVencida, licoesVencidas,
} from './veredas';
import type { EventoDeAtividade } from './atividade';
import { validateHtml, CHECKS, TABLE_CHALLENGE_CHECKS, SITE_CHECKS } from './htmlValidator';
import { validateCss, IDS_DE_CSS } from './cssValidator';
import { validarBlocos, IDS_DE_BLOCOS } from './blocosValidator';
import { validarScratch, IDS_DE_SCRATCH, type ProjetoSb3 } from './scratchValidator';
import { validarAmbiente, IDS_DO_AMBIENTE, estadoInicial } from '../labs/ambientePython';
import { PASSOS_DO_AMBIENTE } from '../labs/passosDoAmbiente';
import { validarPython, IDS_DE_PYTHON } from './pythonValidator';
import { classificacaoInicial } from '../labs/falhasDePython';
import { PASSOS } from '../labs/desafioDeHtml';
import { PASSOS_DE_CSS } from '../labs/passosDeCss';
import { PASSOS_DE_BLOCOS } from '../labs/passosDeBlocos';
import { PASSOS_DE_SCRATCH } from '../labs/passosDeScratch';
import { PASSOS_DE_PYTHON } from '../labs/passosDePython';
import { ROTEIROS } from '../labs/redacaoGuiada';

/* O validador de HTML lança em id desconhecido, então a lista dele se monta
   dos três registros que `validateHtml` consulta. */
const IDS_DE_HTML = Object.keys({ ...CHECKS, ...TABLE_CHALLENGE_CHECKS, ...SITE_CHECKS });

const vereda = veredasAbertas()[0];
const licoes = licoesDaVereda(vereda);
const topicos = topicosDaVereda(vereda).map(t => t.id);
const teorias = licoes.filter(l => l.tipo === 'teoria').map(l => l.id);
/*
  Tudo o que não é teoria: laboratório e redação.

  Estava escrito `tipo === 'laboratorio'`, e por isso a redação da CC001 ficou
  de fora de `tudo` — o conjunto que representa "a vereda inteira vencida"
  cobria treze das quatorze lições, e o teste da conclusão reprovou. A trava
  fez o trabalho dela; o defeito era do próprio conjunto.

  Escrito pela negativa de propósito: um quarto tipo de lição entra aqui
  sozinho, em vez de sumir em silêncio como este sumiu.
*/
const deFazer = licoes.filter(l => l.tipo !== 'teoria').map(l => l.id);

const lido = (topico: string, qual = vereda.id): EventoDeAtividade =>
  ({ event_type: EVENTO_TOPICO, metadata: { vereda: qual, topico } });
const vencido = (licao: string, evento = EVENTO_LABORATORIO, qual = vereda.id): EventoDeAtividade =>
  ({ event_type: evento, metadata: { vereda: qual, licao } });

const tudo = [
  ...teorias.map(l => vencido(l, EVENTO_TEORIA)),
  ...deFazer.map(l => vencido(l)),
];

/* `tudo` precisa ser mesmo tudo: é ele que representa a vereda inteira
   vencida, e um conjunto incompleto faria a trava da conclusão medir outra
   coisa. */
if (tudo.length !== licoes.length) {
  throw new Error(`o conjunto do teste cobre ${tudo.length} de ${licoes.length} lições`);
}

describe('o percurso de uma vereda', () => {
  it('junta as lições vencidas, de qualquer tipo', () => {
    const p = percursoDosEventos([
      vencido(teorias[0], EVENTO_TEORIA), vencido(deFazer[0]),
    ])[vereda.id];
    expect(p.licoes).toEqual(new Set([teorias[0], deFazer[0]]));
  });

  it('não conta a mesma lição duas vezes', () => {
    const p = percursoDosEventos([vencido(deFazer[0]), vencido(deFazer[0])])[vereda.id];
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
    expect(veredasConcluidas(deFazer.map(l => vencido(l)))).toEqual([]);
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
      { event_type: 'outra_coisa', metadata: { vereda: vereda.id, licao: deFazer[0] } },
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
  for (const vereda of veredasComConteudo()) {
    for (const licao of licoesDaVereda(vereda)) {
      if (licao.tipo !== 'laboratorio') continue;
      it(`${vereda.code} · ${licao.id} abre sem nenhuma verificação verde`, () => {
        /*
          Cada linguagem tem o seu validador, e o modelo é conferido pelo mesmo
          que o laboratório usa — conferir CSS com o validador de HTML não
          mediria nada.

          E blocos precisou entrar aqui explicitamente. Caindo no `else`, o
          modelo vazio de um laboratório de blocos era conferido pelo validador
          de HTML, que não conhece nenhum daqueles ids: nada passava, a lista
          saía vazia e o teste ficava verde sem ter conferido coisa alguma. É a
          armadilha do "zero link não é zero link quebrado", agora na trava que
          existe justamente para pegá-la. Toda linguagem nova entra aqui — foi
          por isso que `scratch` entrou junto com o editor de verdade.
        */
        const verdes = (licao.linguagem === 'python'
          /* Sem execução não há resultado, e é justamente esse o estado em que
             o laboratório abre: nada rodou ainda, então nada pode estar verde. */
          ? validarPython({
            codigo: licao.modelo, achados: {}, erroDeAnalise: null,
            execucao: null, saidaEsperada: licao.saidaEsperada,
            /* As falhas da própria lição, e o painel como ele abre: sem isto a
               trava conferiria uma lição sem falha nenhuma, que é o contrário
               do que ela existe para conferir. */
            falhas: licao.falhas,
            classificacao: classificacaoInicial(licao.falhas ?? []),
          }, licao.verificacoes)
          : licao.linguagem === 'scratch'
            ? validarScratch(
              JSON.parse(licao.projetoDeScratch ?? '{"targets":[]}') as ProjetoSb3,
              licao.verificacoes)
            : licao.linguagem === 'blocos'
              ? validarBlocos(licao.projetoDeBlocos ?? { atores: [], variaveis: [] }, licao.verificacoes)
              : licao.linguagem === 'css'
                ? validateCss(licao.modelo, licao.marcacao ?? '', licao.verificacoes)
                : validateHtml(licao.modelo, licao.verificacoes))
          .filter(r => r.passed).map(r => r.id);
        expect(verdes).toEqual([]);
      });

      it(`${vereda.code} · ${licao.id} cobra verificação que o validador conhece`, () => {
        /*
          Id desconhecido vira uma verificação que nunca passa — os validadores
          fazem isso de propósito, para o laboratório não encolher em silêncio.
          O efeito colateral é que a trava acima aprova qualquer lista de ids
          inventados. Aqui se confere que cada um existe de verdade.
        */
        const conhecidos = licao.linguagem === 'python' ? IDS_DE_PYTHON
          : licao.linguagem === 'scratch' ? IDS_DE_SCRATCH
            : licao.linguagem === 'blocos' ? IDS_DE_BLOCOS
              : licao.linguagem === 'css' ? IDS_DE_CSS : IDS_DE_HTML;
        expect(licao.verificacoes.filter(id => !conhecidos.includes(id))).toEqual([]);
      });
    }
  }

  /*
    O computador simulado passa pelas mesmas travas, e por um caminho próprio:
    o ponto de partida dele não vem da lição, vem de `estadoInicial()`. Não há
    `modelo` a conferir — há um computador, e o que se cobra é que ele comece
    sem nada baixado e sem nada instalado.
  */
  for (const vereda of veredasComConteudo()) {
    for (const licao of licoesDaVereda(vereda)) {
      if (licao.tipo !== 'ambiente') continue;

      it(`${vereda.code} · ${licao.id} abre num computador sem nada feito`, () => {
        const verdes = validarAmbiente(estadoInicial(), licao.verificacoes)
          .filter(r => r.passed).map(r => r.id);
        expect(verdes).toEqual([]);
      });

      it(`${vereda.code} · ${licao.id} cobra verificação que o validador conhece`, () => {
        expect(licao.verificacoes.filter(id => !IDS_DO_AMBIENTE.includes(id))).toEqual([]);
      });
    }
  }

  /*
    Falha plantada e verificação são as duas metades da mesma coisa.

    Uma lição que cobra `classificouAsFalhas` e não escreve falha nenhuma dá uma
    tarefa que ninguém pode cumprir; uma que escreve as falhas e não cobra a
    verificação põe um painel na tela que não conta para nada. Nos dois casos
    nada estoura — a lista simplesmente diz uma coisa e a lição faz outra.
  */
  describe('as falhas plantadas e a verificação que as cobra', () => {
    /* Um `it` que varre tudo, e não um por lição: enquanto nenhuma lição
       plantar falha, um laço por lição não geraria teste nenhum — e suíte
       vazia é o próprio "zero de zero" que estas travas existem para pegar. */
    const laboratorios = veredasComConteudo().flatMap(v => licoesDaVereda(v)
      .filter(l => l.tipo === 'laboratorio')
      .map(l => [`${v.code}/${l.id}`, l] as const));

    it('nenhuma cobra a classificação sem escrever falha nenhuma', () => {
      const vazias = laboratorios
        .filter(([, l]) => l.verificacoes.includes('classificouAsFalhas') && !(l.falhas ?? []).length)
        .map(([nome]) => nome);
      expect(vazias).toEqual([]);
    });

    it('nenhuma escreve falha que a lista de tarefas não cobra', () => {
      const soltas = laboratorios
        .filter(([, l]) => (l.falhas ?? []).length > 0 && !l.verificacoes.includes('classificouAsFalhas'))
        .map(([nome]) => nome);
      expect(soltas).toEqual([]);
    });

    it('nenhuma repete o id de uma falha', () => {
      const repetidas = laboratorios
        .filter(([, l]) => {
          const ids = (l.falhas ?? []).map(f => f.id);
          return new Set(ids).size !== ids.length;
        })
        .map(([nome]) => nome);
      expect(repetidas).toEqual([]);
    });
  });

  it('toda verificação cobrada tem passo a passo para quem travar', () => {
    const passosDe = (linguagem: string | undefined) =>
      (linguagem === 'python' ? PASSOS_DE_PYTHON
        /* Scratch e blocos cobram os mesmos dez ids e mesmo assim têm passo a
           passo separado: um é de arrastar e o outro era de tocar, e a
           instrução errada chega justamente para quem já travou. */
        : linguagem === 'scratch' ? PASSOS_DE_SCRATCH
          : linguagem === 'blocos' ? PASSOS_DE_BLOCOS
            : linguagem === 'css' ? PASSOS_DE_CSS : PASSOS);
    const sem = veredasComConteudo().flatMap(v => licoesDaVereda(v))
      .flatMap(l => {
        /* O computador simulado não tem linguagem: o passo a passo dele é o
           do ambiente, e a escolha se faz pelo tipo da lição. */
        if (l.tipo === 'ambiente') {
          return l.verificacoes.map(id => [PASSOS_DO_AMBIENTE, id] as const);
        }
        if (l.tipo !== 'laboratorio') return [];
        return l.verificacoes.map(id => [passosDe(l.linguagem), id] as const);
      })
      .filter(([mapa, id]) => !mapa[id]?.length)
      .map(([, id]) => id);
    expect([...new Set(sem)]).toEqual([]);
  });

  /*
    A redação não tem modelo nem verificação, e por isso escapa das duas travas
    acima. O que ela pode quebrar é o par com o servidor: um roteiro que a tela
    aponta e o servidor não conhece devolve "Etapa desconhecida" depois de a
    pessoa já ter escrito. `redacao.test.ts` confere os ids das etapas; aqui se
    confere que o roteiro citado pela lição existe.
  */
  it('toda lição de redação aponta para um roteiro que existe', () => {
    const sem = veredasComConteudo().flatMap(v => licoesDaVereda(v))
      .filter(l => l.tipo === 'redacao' && !ROTEIROS[l.roteiro])
      .map(l => (l.tipo === 'redacao' ? `${l.id} → ${l.roteiro}` : ''));
    expect(sem).toEqual([]);
  });
});

/*
  Módulo e lição não repetem a mesma frase.

  A primeira montagem herdava o título e o resumo do capítulo para a lição de
  teoria, e o cartão do módulo saía dizendo duas vezes a mesma coisa, uma
  embaixo da outra — que lido de cima parece erro de montagem, e não hierarquia.
*/
describe('os nomes dentro de um módulo', () => {
  for (const vereda of veredasComConteudo()) {
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
/*
  De onde a vereda saiu tem de existir, e ser chamado pelo nome certo.

  `origem` é um código solto, e a tela o imprime sem conferir nada: um caractere
  trocado vira "saiu da trilha CC0O1", que ninguém percebe relendo o currículo.
  E a palavra importa — a de CSS sai da de HTML, e chamar uma vereda de trilha
  ensina errado justamente sobre a distinção que a plataforma estabeleceu.
*/
describe('a origem de cada vereda', () => {
  const codigos = () => new Set([
    ...VEREDAS.map(v => v.code),
    ...getAllSpecialties().map(e => e.code),
  ]);

  it('toda origem declarada existe', () => {
    const orfas = VEREDAS
      .filter(v => v.origem && !codigos().has(v.origem))
      .map(v => `${v.code} → ${v.origem}`);
    expect(orfas).toEqual([]);
  });

  it('vereda é chamada de vereda, e trilha de trilha', () => {
    expect(textoDaOrigem('CC001')).toBe('da vereda CC001');
    expect(textoDaOrigem('AP035')).toBe('da trilha AP035');
  });
});

describe('a arte de cada vereda', () => {
  for (const v of VEREDAS) {
    it(`${v.code} tem emblema e certificado no repositório`, () => {
      expect(existsSync(`public/assets/specialties/${v.code}.png`), 'emblema').toBe(true);
      expect(existsSync(`public/assets/certificates/${v.code}.png`), 'certificado').toBe(true);
    });
  }
});

/*
  A mesma conta, feita em dois lugares, divergiu.

  `veredasConcluidas` foi corrigida quando as trinta e uma anunciadas
  apareceram concluídas para todo mundo. O `andamento` do hook é outra cópia da
  mesma comparação e ficou para trás — e é dele que o relatório entregue ao
  clube tirava a lista de veredas cumpridas.
*/
describe('zero de zero não é tudo, em nenhuma das contas', () => {
  /*
    A trava dizia que vereda em construção está vazia, e isso deixou de ser
    verdade: uma vereda leva vários dias para ficar pronta, e a teoria chega
    antes dos laboratórios — foi por isso que `veredasComConteudo()` passou a
    existir. O que continua tendo de valer não é o vazio, são as duas contas
    abaixo.
  */
  it('vereda sem lição nenhuma nunca conta como concluída', () => {
    const vazias = VEREDAS.filter(v => licoesDaVereda(v).length === 0);
    expect(vazias.length).toBeGreaterThan(0);
    for (const v of vazias) {
      /* A conta do hook: `total > 0 && vencidas === total`. Sem o `total > 0`,
         isto seria verdadeiro para todas elas. */
      const total = licoesDaVereda(v).length;
      expect(total > 0 && 0 === total, v.code).toBe(false);
    }
  });

  /*
    E a que ainda não abriu não conta, mesmo com tudo o que ela já tem vencido:
    semear insígnia e certificado por um percurso que ninguém pode percorrer
    inteiro é prometer prêmio por nada.
  */
  it('vereda em construção não conta como concluída nem com tudo feito', () => {
    const emConstrucao = VEREDAS.filter(v => v.emConstrucao && licoesDaVereda(v).length > 0);
    for (const v of emConstrucao) {
      const tudo: EventoDeAtividade[] = licoesDaVereda(v).map((l, i) => ({
        id: `e${i}`,
        type: l.tipo === 'teoria' ? 'vereda_teoria' : 'vereda_laboratorio',
        created_at: '2026-01-01T00:00:00Z',
        metadata: { vereda: v.id, licao: l.id },
      } as unknown as EventoDeAtividade));
      expect(veredasConcluidas(tudo), v.code).not.toContain(v.id);
    }
  });
});
