import { describe, expect, it } from 'vitest';
import {
  type FormaDeEnviesar,
  COLETAS, NOME_DA_FORMA, POPULACOES,
  coletaDe, coletasEnviesadas, populacaoCerta,
} from './amostraDoClube';

/*
  O módulo 1 da CC-ES010: de quem a base fala, e de quem ela não fala.

  Requisitos 2.1, 2.2 e 4. O que esta trava guarda não é a prosa — é a forma
  da lista, que é onde este exercício pode deixar de ensinar sem nada
  estourar.
*/

describe('as coletas que a lição põe à mesa', () => {
  /*
    ── A guarda que a CC-ES005 já pagou para aprender ──────────────────────

    Sem uma coleta honesta na lista, "marque todas como enviesadas" é a
    resposta certa, e o que a lição ensinaria é desconfiar de toda pesquisa —
    que é inútil, porque ninguém decide nada assim e todo mundo volta a
    acreditar em tudo na semana seguinte. É a decisão da caixa de correio de
    lá, onde há mensagem verdadeira pelo mesmo motivo.
  */
  it('tem ao menos uma coleta que não torceu a amostra', () => {
    expect(COLETAS.some(c => c.forma === null)).toBe(true);
  });

  it('tem mais torcidas do que honestas, senão o palpite fácil é o contrário', () => {
    /* Com metade e metade, "marque nenhuma" acerta tanto quanto "marque
       todas", e a lista passa a medir qual chute a pessoa deu. */
    expect(coletasEnviesadas().length).toBeGreaterThan(COLETAS.length - coletasEnviesadas().length);
  });

  /*
    O requisito 4 pede **três formas**, e três coletas do mesmo mecanismo são
    uma forma repetida: acertar as três seria acertar uma. A lista tem de
    exercitar cada mecanismo que ela declara.
  */
  it('cobre as três formas de enviesar, uma coleta por forma', () => {
    const formas = coletasEnviesadas().map(c => c.forma);
    const declaradas = Object.keys(NOME_DA_FORMA) as FormaDeEnviesar[];
    expect(new Set(formas).size).toBe(formas.length);
    for (const f of declaradas) {
      expect(formas, `nenhuma coleta exercita "${NOME_DA_FORMA[f]}"`).toContain(f);
    }
  });

  /*
    E uma delas é a **nossa**. É a metade desconfortável do requisito 4: a base
    desta vereda veio de uma coleta enviesada, e uma lição que descrevesse três
    coletas de mentira e deixasse a nossa de fora ensinaria a enxergar viés em
    pesquisa alheia — que é a metade fácil.
  */
  it('exatamente uma é a coleta do próprio clube', () => {
    const doClube = COLETAS.filter(c => c.doClube);
    expect(doClube).toHaveLength(1);
    /* E ela é enviesada: se a nossa fosse a honesta, o requisito pediria para
       apontar viés em todo lugar menos onde a conclusão vai ser usada. */
    expect(doClube[0].forma).not.toBeNull();
  });

  /*
    A tela mostra "quem fica de fora" **depois** de a pessoa classificar.
    Escrito dentro da descrição, a classificação deixaria de ser decisão e
    viraria leitura — é a regra do aviso do digitalizador da CC-ES004, que
    relata o que mediu e nunca se a tarefa está cumprida.
  */
  it('a descrição não entrega o mecanismo nem quem ficou de fora', () => {
    const palavras = ['enviesad', 'viés', 'vies', 'torc', 'ficou de fora', 'ficam de fora'];
    for (const c of COLETAS) {
      const d = c.descricao.toLowerCase();
      for (const p of palavras) {
        expect(d, `a descrição de "${c.id}" entrega a resposta ao dizer "${p}"`).not.toContain(p);
      }
    }
  });

  it('toda coleta diz quem fica de fora, inclusive a honesta', () => {
    /* A honesta precisa da dela: "ninguém fica de fora" é a frase que explica
       por que ela não é amostra, e deixá-la vazia faria a tela não ter nada a
       dizer justamente sobre a que está certa. */
    for (const c of COLETAS) {
      expect(c.quemFicaDeFora.trim().length, `"${c.id}" não diz quem fica de fora`)
        .toBeGreaterThan(40);
    }
  });

  it('cada coleta tem id próprio, e `coletaDe` acha todas', () => {
    expect(new Set(COLETAS.map(c => c.id)).size).toBe(COLETAS.length);
    for (const c of COLETAS) expect(coletaDe(c.id)).toBe(c);
  });
});

describe('de que população a base é amostra', () => {
  it('exatamente uma está certa, e é o clube', () => {
    expect(POPULACOES.filter(p => p.certa)).toHaveLength(1);
    expect(populacaoCerta()).toBe('clube');
  });

  /*
    ── As duas erradas erram para lados opostos, e é de propósito ───────────

    Uma chama de população **a própria amostra** — o erro que faz alguém dizer
    "no clube, a média é de dois acampamentos" quando o que se mediu foi quem
    respondeu ao formulário. A outra estica a base para além do que ela
    alcança. Com as duas erradas do mesmo lado, acertar seria eliminar uma
    direção e não distinguir amostra de população.
  */
  it('as erradas erram para lados opostos: uma estreita demais, uma larga demais', () => {
    const ids = POPULACOES.filter(p => !p.certa).map(p => p.id);
    expect(ids).toContain('inscritos');
    expect(ids).toContain('brasil');
  });

  it('cada candidata diz por que é ou não é, e as erradas não ficam sem razão', () => {
    /* Alternativa errada sem o porquê é o que `qualidade.test.ts` reprova nas
       provas, e aqui vale o mesmo: a pessoa que escolheu errado precisa saber
       **o que** ela confundiu, e não só que errou. */
    for (const p of POPULACOES) {
      expect(p.porque.trim().length, `"${p.id}" não diz por quê`).toBeGreaterThan(40);
    }
  });

  it('nenhum rótulo entrega a resposta dizendo "população" ou "amostra"', () => {
    /* Os rótulos são as três opções que a pessoa lê para escolher. Um que
       dissesse "a amostra: os quarenta e oito" resolveria a questão na própria
       alternativa. */
    for (const p of POPULACOES) {
      const r = p.rotulo.toLowerCase();
      expect(r, `o rótulo de "${p.id}" entrega a resposta`).not.toContain('popula');
      expect(r, `o rótulo de "${p.id}" entrega a resposta`).not.toContain('amostra');
    }
  });
});
