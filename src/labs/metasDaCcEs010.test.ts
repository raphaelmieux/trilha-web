import { describe, expect, it } from 'vitest';
import {
  type ContextoDaEstatistica, type LicaoDaCcEs010,
  LICOES_DA_CC_ES010, SOLUCOES_DA_CC_ES010,
} from './metasDaCcEs010';
import { COLETAS, populacaoCerta } from './amostraDoClube';

/*
  As metas da CC-ES010.

  ── As duas contas que carregam todas as veredas ─────────────────────────
  Nenhuma meta abre verde, e a solução de referência fecha todas. A primeira
  reprova lista com item já marcado no segundo zero, que ensina a não ler a
  lista; a segunda reprova lição impossível de vencer, que é pior — um
  laboratório que abre resolvido dá tarefa verde de graça, o outro deixa quem
  fez tudo certo olhando uma lista vermelha sem nada na tela que explique.

  ── E a lista de lições sai do registro ──────────────────────────────────
  Trava com lista escrita à mão para de conferir sozinha: a lição nova entra,
  ninguém a acrescenta, e a build segue verde conferindo as velhas — que é
  indistinguível de estar tudo certo. É o que deixou de conferir a AP043 e a
  AP044 no dia em que elas abriram.
*/

const licoes = Object.keys(LICOES_DA_CC_ES010) as LicaoDaCcEs010[];

/* A guarda contra o vazio de sempre: um registro que esvaziasse, ou uma chave
   renomeada sem a trava saber, deixaria tudo abaixo verde por não ter
   conferido nada. */
it('o registro tem lição', () => {
  expect(licoes.length).toBeGreaterThan(0);
});

describe.each(licoes)('a lição "%s"', (qual) => {
  const licao = LICOES_DA_CC_ES010[qual];

  it('abre com todas as metas por fazer', () => {
    const c = licao.inicial();
    for (const m of licao.metas) {
      expect(m.feita(c), `"${m.titulo}" já está verde ao abrir a lição`).toBe(false);
    }
  });

  it('fecha inteira com a solução de referência', () => {
    const c = SOLUCOES_DA_CC_ES010[qual](licao.inicial());
    for (const m of licao.metas) {
      expect(m.feita(c), `"${m.titulo}" não fecha nem com a solução de referência`).toBe(true);
    }
  });

  it('tem meta, e cada uma diz onde e como', () => {
    expect(licao.metas.length).toBeGreaterThan(0);
    for (const m of licao.metas) {
      expect(m.onde.trim(), `"${m.titulo}" não diz onde`).not.toBe('');
      /* Passo a passo é a saída de quem travou, e meta sem ele é a tarefa em
         que a moldura não tem o que oferecer — o defeito que a tabela da
         AP035 teve. */
      expect(m.passos.length, `"${m.titulo}" não tem passo a passo`).toBeGreaterThan(0);
      expect(m.detalhe.trim(), `"${m.titulo}" não diz por que importa`).not.toBe('');
    }
  });

  it('tem id próprio em cada meta', () => {
    const ids = licao.metas.map(m => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

/*
  ── E o caminho rápido e errado não fecha ────────────────────────────────

  As duas contas de cima provam que a lição abre por fazer e fecha com a
  solução certa. Elas não provam que ela **recusa** a resposta errada — e é por
  aí que um exercício vira clique: a trava fica verde, a lição fecha, e o que
  ela mediu foi paciência.
*/
describe('o módulo 1 recusa o atalho', () => {
  const abrir = () => LICOES_DA_CC_ES010.amostra.inicial();
  const meta = (id: string) => LICOES_DA_CC_ES010.amostra.metas.find(m => m.id === id)!;

  it('marcar a mesma forma em todas não fecha a classificação', () => {
    /*
      Conjunto **igual**, e não conjunto que contém. Exigir só que as torcidas
      estivessem marcadas deixaria isto passar com louvor — e "desconfie de
      toda pesquisa" é a lição inútil, porque ninguém decide nada assim.
    */
    const c: ContextoDaEstatistica = {
      ...abrir(),
      classificacoes: Object.fromEntries(COLETAS.map(co => [co.id, 'nao-alcancou' as const])),
    };
    expect(meta('toda-coleta-classificada').feita(c)).toBe(true);
    expect(meta('classificacao-certa').feita(c)).toBe(false);
  });

  it('marcar todas como honestas também não fecha', () => {
    /* O outro lado do mesmo chute. Sem esta, a trava de cima aprovaria a
       pessoa que não acredita em viés nenhum. */
    const c: ContextoDaEstatistica = {
      ...abrir(),
      classificacoes: Object.fromEntries(COLETAS.map(co => [co.id, 'honesta' as const])),
    };
    expect(meta('classificacao-certa').feita(c)).toBe(false);
  });

  it('deixar uma coleta sem marcar deixa as duas metas vermelhas', () => {
    const todas = Object.fromEntries(COLETAS.map(co => [co.id, 'honesta' as const]));
    delete todas[COLETAS[0].id];
    const c: ContextoDaEstatistica = { ...abrir(), classificacoes: todas };
    expect(meta('toda-coleta-classificada').feita(c)).toBe(false);
  });

  /*
    "Classifiquei como honesta" e "não classifiquei ainda" são duas coisas, e
    colapsá-las faria a meta de "toda coleta classificada" fechar sozinha com a
    lista em branco. É "zero link não é zero link quebrado" aplicado a uma
    classificação.
  */
  it('lista em branco não conta como lista classificada', () => {
    expect(meta('toda-coleta-classificada').feita(abrir())).toBe(false);
  });

  /*
    ── A que a mutação achou ────────────────────────────────────────────────

    Uma meta que conferisse só as coletas **torcidas** fecharia com a honesta
    marcada errada — e chamar de enviesada a coleta que não torceu nada é
    exatamente o erro que a coleta honesta existe para pegar. É "zero link não
    é zero link quebrado" aplicado a esta lista: a conta fica certa sobre três
    das quatro e não diz nada sobre a quarta.

    As outras duas asserções de atalho não alcançam este caso: "a mesma forma
    em todas" já erra as torcidas, e "todas honestas" também. O caso é
    justamente o de quem acertou as três e errou a que estava certa.
  */
  it('acertar as três torcidas e errar a honesta não fecha', () => {
    const honesta = COLETAS.find(co => co.forma === null)!;
    const c: ContextoDaEstatistica = {
      ...abrir(),
      classificacoes: Object.fromEntries(COLETAS.map(co => [
        co.id,
        co.forma ?? 'nao-alcancou',
      ])),
    };
    /* Todas marcadas, então a primeira meta fecha... */
    expect(meta('toda-coleta-classificada').feita(c)).toBe(true);
    /* ...e a segunda não, por causa de uma só. */
    expect(
      meta('classificacao-certa').feita(c),
      `a classificação fecha com "${honesta.id}" marcada como enviesada`,
    ).toBe(false);
  });

  /*
    E o que a coleta honesta **é** se afirma aqui, e não só dentro da função
    que a meta usa.

    `certaPara` traduz a forma da coleta na marca que a pessoa escolhe, e a
    meta **e** a solução de referência passam as duas por ela — então uma
    tradução errada é auto-consistente: as duas concordam, e a trava fica
    verde sobre a resposta errada. É a divergência que não aparece porque não
    há duas fontes, e sim uma fonte errada lida duas vezes.
  */
  it('a solução de referência marca a coleta honesta como honesta', () => {
    const feito = SOLUCOES_DA_CC_ES010.amostra(abrir());
    const honesta = COLETAS.find(co => co.forma === null)!;
    expect(feito.classificacoes[honesta.id]).toBe('honesta');
    for (const co of COLETAS) {
      if (co.forma === null) continue;
      expect(feito.classificacoes[co.id], `"${co.id}" marcada fora da forma dela`).toBe(co.forma);
    }
  });

  it('chamar a própria amostra de população não fecha', () => {
    /* O erro que faz alguém dizer "no clube a média é de dois acampamentos"
       quando o que se mediu foi quem respondeu ao formulário. */
    const c: ContextoDaEstatistica = { ...abrir(), populacao: 'inscritos' };
    expect(meta('a-populacao').feita(c)).toBe(false);
    expect(meta('a-populacao').feita({ ...abrir(), populacao: populacaoCerta() })).toBe(true);
  });

  it('esticar a base para o Brasil inteiro também não fecha', () => {
    const c: ContextoDaEstatistica = { ...abrir(), populacao: 'brasil' };
    expect(meta('a-populacao').feita(c)).toBe(false);
  });
});

/*
  ── A base chega fechada, e não é trabalho ──────────────────────────────

  O requisito 7 manda refazer a análise **excluindo** os valores atípicos e
  comparar os dois resultados. Isso é uma segunda leitura, e não uma edição —
  uma base editável faria a comparação ser entre a análise de agora e uma base
  que já não existe.
*/
describe('a base de partida', () => {
  it('chega fechada em toda lição', () => {
    for (const qual of licoes) {
      expect(LICOES_DA_CC_ES010[qual].inicial().base.aceitandoRespostas).toBe(false);
    }
  });

  it('a pasta de quando abriu é a mesma pasta, e não uma cópia à parte', () => {
    /* Duas cópias divergiriam no primeiro ajuste, e a divergência apareceria
       como "o que mudou?" respondendo sobre uma pasta que ninguém abriu. */
    for (const qual of licoes) {
      const c = LICOES_DA_CC_ES010[qual].inicial();
      expect(c.cadernoAntes).toEqual(c.caderno);
    }
  });
});
