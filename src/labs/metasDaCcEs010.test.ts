import { describe, expect, it } from 'vitest';
import {
  type ContextoDaEstatistica, type LicaoDaCcEs010,
  LICOES_DA_CC_ES010, SOLUCOES_DA_CC_ES010,
} from './metasDaCcEs010';
import {
  CANDIDATAS_A_ESCONDIDA, LEITURAS_DE_R, PARES, PAR_DO_MODULO_2,
  IDADE_DENTRO, IDADE_FORA, ROTULO_INCLINACAO,
  formulaDaPrevisao, formulaDaReta, formulaDoR, parEspurio, piorAjusteDa,
  rDoPar, rotuloDaPrevisao,
  CHAVE_DADO, CHAVE_OUTRA, CHAVE_SUGERE, ROTULO_ESCOLHIDO,
  CHAVE_EFEITO, COLUNA_AUXILIAR, DESCOBERTA_FILTRO,
  ROTULO_INCL_SEM, ROTULO_INCL_TODOS, ROTULO_R2_SEM, ROTULO_R2_TODOS,
  comColunaAuxiliar, formulaSemAtipico, linhasAtipicasDoPar, semAtipicos,
} from './metasDaCcEs010';
import { COLETAS, populacaoCerta } from './amostraDoClube';
import { CAMPO_ALTURA, CAMPO_IDADE, camposDaBase } from './baseDoAcampamento';
import { CAMPO_DIARIAS } from './formulario';
import {
  ABA_CALCULOS, ABA_RESPOSTAS, assinaturaDaBase, colunaDoCampo,
  faixaDoCampo, linhaDoRotulo,
} from './metasDaCcEs009';
import { abaDe, comAba } from './cadernoDoClube';
import { escrever, valorCalculado } from './planilha';
import { nomeDaColuna } from './formulas';
import {
  colunaDe, correlacaoDe, inclinacaoDe, maximo, minimo, previsaoDe, rquadDe,
} from './analiseDeDados';

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
  ── O módulo 2 recusa o gráfico que parece certo ─────────────────────────

  Um gráfico errado continua sendo um gráfico, e é a família inteira de
  defeitos que esta plataforma existe para nomear. Aqui o requisito 5.1 pede
  dispersão **entre duas variáveis**, e cada um dos casos abaixo desenha uma
  figura perfeitamente plausível que não responde a isso.
*/
describe('o módulo 2 recusa o gráfico que parece certo', () => {
  const abrir = () => LICOES_DA_CC_ES010.correlacao.inicial();
  const meta = (id: string) => LICOES_DA_CC_ES010.correlacao.metas.find(m => m.id === id)!;
  const pronto = () => SOLUCOES_DA_CC_ES010.correlacao(abrir());

  const comGrafico = (c: ContextoDaEstatistica, troca: Record<string, unknown>) => {
    const r = c.caderno.planilhas.find(x => x.nome === ABA_RESPOSTAS)!;
    const g = { ...r.grafico!, ...troca };
    return { ...c, caderno: comAba(c.caderno, { ...r, grafico: g }) };
  };

  it('a solução de referência fecha as três', () => {
    const c = pronto();
    for (const m of LICOES_DA_CC_ES010.correlacao.metas) {
      expect(m.feita(c), `"${m.titulo}" não fecha`).toBe(true);
    }
  });

  it('pizza sobre as mesmas duas colunas não é dispersão', () => {
    /* Ela desenha fatias de uma composição que não existe, e é redonda e
       bonita. O tipo responde à pergunta; a existência do gráfico não. */
    expect(meta('a-dispersao').feita(comGrafico(pronto(), { tipo: 'pizza' }))).toBe(false);
  });

  it('dispersão sem eixo escrito não fecha', () => {
    /* Gráfico sem eixo identificado não afirma nada: a nuvem está lá e
       ninguém sabe do que ela fala. */
    expect(meta('a-dispersao').feita(comGrafico(pronto(), { eixoX: '' }))).toBe(false);
    expect(meta('a-dispersao').feita(comGrafico(pronto(), { eixoY: '  ' }))).toBe(false);
  });

  it('dispersão sobre outras colunas desenha outra pergunta', () => {
    /* Duas colunas quaisquer da base dão uma nuvem igualmente plausível — e o
       que o requisito pede é a relação entre **estas** duas. */
    const c = pronto();
    expect(meta('a-dispersao').feita(comGrafico(c, { faixa: { l1: 1, c1: 1, l2: 48, c2: 2 } })))
      .toBe(false);
  });

  it('faixa com uma linha de menos não fecha', () => {
    /*
      É o erro de planilha mais comum que existe, e aqui ele é invisível: a
      nuvem sai quase idêntica, sem um ponto que ninguém vai procurar. É o
      `=MÉDIA(F3:F49)` da CC-ES003, aplicado a um desenho.
    */
    const c = pronto();
    const g = c.caderno.planilhas.find(x => x.nome === ABA_RESPOSTAS)!.grafico!;
    expect(meta('a-dispersao').feita(comGrafico(c, { faixa: { ...g.faixa, l2: g.faixa.l2 - 1 } })))
      .toBe(false);
  });

  it('número digitado na célula do r não fecha, mesmo sendo o número certo', () => {
    /*
      `=0,909...` começa por igual, devolve o valor certo, e não acompanha
      nada. É o terceiro defeito do requisito 7 da CC-ES003 — o que não tem
      pista nenhuma, porque está certo hoje e continua mostrando o de hoje
      amanhã.
    */
    const c = abrir();
    const certo = rDoPar(c.base, PAR_DO_MODULO_2)!;
    const calc = escrever(
      abaDe(c.caderno, ABA_CALCULOS),
      linhaDoRotulo(c.blocos, PAR_DO_MODULO_2.rotulo),
      1,
      `=${String(certo).replace('.', ',')}`,
    );
    const digitado = { ...c, caderno: comAba(c.caderno, calc) };
    expect(meta('o-coeficiente').feita(digitado)).toBe(false);
  });

  it('as três leituras erradas de r não fecham', () => {
    const c = pronto();
    for (const l of LEITURAS_DE_R) {
      if (l.certa) continue;
      expect(
        meta('interpretou-o-valor').feita({ ...c, leituraDeR: l.id }),
        `a leitura "${l.id}" fechou a meta`,
      ).toBe(false);
    }
    /* E exatamente uma está certa, senão a conta acima não diz nada. */
    expect(LEITURAS_DE_R.filter(l => l.certa)).toHaveLength(1);
  });
});

/*
  ── Os três pares são o requisito 3 desenhado em números ─────────────────
*/
describe('os pares da base', () => {
  it('exatamente um é espúrio, e a coluna escondida dele existe', () => {
    const espurios = PARES.filter(p => p.espuria);
    expect(espurios).toHaveLength(1);
    expect(espurios[0].escondida).toBeTruthy();
  });

  /*
    A premissa que faz o requisito 3 existir, e ela é sobre a base e não sobre
    o código: o par espúrio tem de ter correlação **boa o bastante para
    convencer** — um r de 0,1 não engana ninguém e não haveria o que desfazer —
    e a coluna escondida tem de explicar os dois lados melhor do que eles se
    explicam. Mexer num inscrito pode desfazer isso, e nada reclamaria.
  */
  it('o par espúrio convence, e a coluna escondida explica os dois melhor', () => {
    const base = LICOES_DA_CC_ES010.correlacao.inicial().base;
    const espurio = PARES.find(p => p.espuria)!;
    const r = rDoPar(base, espurio)!;
    expect(Math.abs(r), `o par espúrio tem r = ${r}, fraco demais para enganar`)
      .toBeGreaterThan(0.4);

    const comEscondida = (campo: string) =>
      Math.abs(correlacaoDe(colunaDe(base, espurio.escondida!), colunaDe(base, campo))!);
    expect(comEscondida(espurio.x)).toBeGreaterThan(Math.abs(r));
    expect(comEscondida(espurio.y)).toBeGreaterThan(Math.abs(r));
  });
});

/*
  ── O módulo 3 é o requisito 3, e ele tem de poder errar ─────────────────
*/
describe('o módulo 3 recusa o chute', () => {
  const abrir = () => LICOES_DA_CC_ES010.espuria.inicial();
  const meta = (id: string) => LICOES_DA_CC_ES010.espuria.metas.find(m => m.id === id)!;
  const pronto = () => SOLUCOES_DA_CC_ES010.espuria(abrir());

  it('a solução de referência fecha as três', () => {
    const c = pronto();
    for (const m of LICOES_DA_CC_ES010.espuria.metas) {
      expect(m.feita(c), `"${m.titulo}" não fecha`).toBe(true);
    }
  });

  /*
    Apontar qualquer um dos dois pares com leitura causal defensável não fecha.
    Sem esta, a meta aprovaria quem chutou — e a lição inteira é a diferença
    entre os três.
  */
  it('apontar um par com causa defensável não fecha', () => {
    const c = pronto();
    for (const par of PARES) {
      if (par.espuria) continue;
      expect(
        meta('achou-a-espuria').feita({ ...c, parApontado: par.id }),
        `apontar "${par.id}" fechou a meta`,
      ).toBe(false);
    }
  });

  it('nomear outra coluna como escondida não fecha', () => {
    const c = pronto();
    for (const campo of CANDIDATAS_A_ESCONDIDA) {
      if (campo === parEspurio().escondida) continue;
      expect(
        meta('nomeou-a-escondida').feita({ ...c, colunaEscondida: campo }),
        `nomear "${campo}" fechou a meta`,
      ).toBe(false);
    }
  });

  /*
    E a escolha não é uma moeda: as candidatas incluem as duas colunas do
    próprio par e uma quantitativa que não explica nada. Com só as que sobram
    do par, acertar por sorte seria meio a meio.
  */
  it('há mais de duas candidatas a coluna escondida', () => {
    expect(CANDIDATAS_A_ESCONDIDA.length).toBeGreaterThan(2);
    expect(CANDIDATAS_A_ESCONDIDA).toContain(parEspurio().escondida);
  });

  it('exige os três r calculados, e não só o do par espúrio', () => {
    /*
      É comparando que se vê qual sobra sem explicação própria. Com um r só, a
      lição mandaria apontar o espúrio sem nada na tela para sustentar a
      escolha — e aí ela mediria ter lido o enunciado.
    */
    const c = abrir();
    const so = escrever(
      abaDe(c.caderno, ABA_CALCULOS),
      linhaDoRotulo(c.blocos, parEspurio().rotulo),
      1,
      formulaDoR(c.base, parEspurio()),
    );
    expect(meta('as-tres-correlacoes').feita({ ...c, caderno: comAba(c.caderno, so) }))
      .toBe(false);
  });

  it('a aba de cálculos abre com os três pares à mesa', () => {
    /* Um bloco de um par só deixaria a primeira meta impossível de fechar, com
       o motor inteiramente correto — a lição de assinar da CC-ES004. */
    const c = abrir();
    for (const par of PARES) {
      expect(linhaDoRotulo(c.blocos, par.rotulo), `"${par.rotulo}" não está na aba`)
        .toBeGreaterThanOrEqual(0);
    }
  });
});

/*
  ── O módulo 4: a reta, e as duas caixas que não se colapsam ─────────────
*/
describe('o módulo 4 separa a reta da equação dela', () => {
  const abrir = () => LICOES_DA_CC_ES010.reta.inicial();
  const meta = (id: string) => LICOES_DA_CC_ES010.reta.metas.find(m => m.id === id)!;
  const pronto = () => SOLUCOES_DA_CC_ES010.reta(abrir());

  const comGrafico = (c: ContextoDaEstatistica, troca: Record<string, unknown>) => {
    const r = c.caderno.planilhas.find(x => x.nome === ABA_RESPOSTAS)!;
    return { ...c, caderno: comAba(c.caderno, { ...r, grafico: { ...r.grafico!, ...troca } }) };
  };

  it('a solução de referência fecha as três', () => {
    const c = pronto();
    for (const m of LICOES_DA_CC_ES010.reta.metas) {
      expect(m.feita(c), `"${m.titulo}" não fecha`).toBe(true);
    }
  });

  it('abre com a dispersão pronta e sem a linha de tendência', () => {
    /*
      A dispersão vem do módulo 2: começar mandando refazê-la ensinaria que o
      trabalho anterior não conta. E ela vem **sem** a reta, que é o que esta
      lição pede — com a reta já traçada, a meta abriria verde.
    */
    const c = abrir();
    const g = c.caderno.planilhas.find(x => x.nome === ABA_RESPOSTAS)?.grafico;
    expect(g?.tipo).toBe('dispersao');
    expect(g?.tendencia).toBeFalsy();
    expect(meta('a-linha-de-tendencia').feita(c)).toBe(false);
  });

  /*
    ── As duas caixas, e por que elas não se colapsam ─────────────────────

    No Excel são duas: Linha de Tendência e Exibir Equação. Dá para ver a reta
    e nunca ler a equação dela, que é o que quase todo mundo faz — e o
    requisito 5.3 pede as duas metades. Uma meta só apagaria uma delas.
  */
  it('a reta traçada fecha a primeira e não a segunda', () => {
    const soReta = comGrafico(pronto(), { equacao: false });
    expect(meta('a-linha-de-tendencia').feita(soReta)).toBe(true);
    expect(meta('a-equacao').feita(soReta)).toBe(false);
  });

  it('a equação marcada sem as duas células não fecha', () => {
    /* Marcar a caixa no gráfico mostra a conta; obtê-la é escrevê-la onde ela
       serve para prever. As duas coisas, e não uma. */
    const c = comGrafico(abrir(), { tendencia: true, equacao: true });
    expect(meta('a-equacao').feita(c)).toBe(false);
  });

  /*
    ── A armadilha da ordem, que é a do Excel ─────────────────────────────

    `INCLINAÇÃO` e `INTERCEPÇÃO` recebem o y primeiro. Ao contrário, as duas
    devolvem a reta de x sobre y — outro número, com a mesma cara de certo, e
    sem erro nenhum na célula.
  */
  it('a fórmula com as faixas trocadas não fecha', () => {
    const c = pronto();
    const par = PAR_DO_MODULO_2;
    let calc = abaDe(c.caderno, ABA_CALCULOS);
    /* O x na frente: a reta ao contrário. */
    calc = escrever(calc, linhaDoRotulo(c.blocos, ROTULO_INCLINACAO), 1,
      `=INCLINAÇÃO(${ABA_RESPOSTAS}!${faixaDoCampo(c.base, par.x)};`
      + `${ABA_RESPOSTAS}!${faixaDoCampo(c.base, par.y)})`);
    const trocada = { ...c, caderno: comAba(c.caderno, calc) };
    expect(meta('a-equacao').feita(trocada)).toBe(false);
  });

  /*
    ── A que a mutação achou ──────────────────────────────────────────────

    Um bloco que não cobrasse função nenhuma aceitaria a célula que **chega ao
    número por outro caminho** — e o que esta lição ensina é justamente a
    função e a ordem dos argumentos dela. Uma referência a outra célula que já
    tenha o valor tem referência e tem o número certo, e não ensinou nada.

    (A inclinação até se escreve por caminho longo, com CORREL e os dois
    desvios. Cobrar o nome é a decisão: é ele que o requisito 5.3 nomeia, e é
    nele que mora a armadilha da ordem.)
  */
  it('o número certo por outro caminho não fecha a equação', () => {
    const c = pronto();
    const linha = linhaDoRotulo(c.blocos, ROTULO_INCLINACAO);
    let calc = abaDe(c.caderno, ABA_CALCULOS);
    /* Guarda o valor numa célula à parte e aponta para ela. */
    calc = escrever(calc, linha, 4, formulaDaReta(c.base, PAR_DO_MODULO_2, 'INCLINAÇÃO'));
    calc = escrever(calc, linha, 1, `=${nomeDaColuna(4)}${linha + 1}`);
    expect(meta('a-equacao').feita({ ...c, caderno: comAba(c.caderno, calc) })).toBe(false);
  });

  it('dizer que a explicada explica não fecha', () => {
    /* Ninguém fica mais velho por ter crescido: a direção tem resposta, e é
       ela que decide qual eixo é qual. */
    const c = { ...pronto(), independente: PAR_DO_MODULO_2.y };
    expect(meta('qual-eixo-e-qual').feita(c)).toBe(false);
  });
});

/*
  ── Os módulos 5 e 6, e as premissas que fazem as lições existirem ───────

  Estas duas são sobre a **base**, e não sobre o código: mexer num inscrito
  pode desfazê-las, e nada reclamaria. A lição continuaria rodando e deixaria
  de ensinar.
*/
describe('o módulo 5: prever, e o risco de extrapolar', () => {
  const abrir = () => LICOES_DA_CC_ES010.prever.inicial();
  const meta = (id: string) => LICOES_DA_CC_ES010.prever.metas.find(m => m.id === id)!;
  const pronto = () => SOLUCOES_DA_CC_ES010.prever(abrir());

  it('a solução de referência fecha as três', () => {
    const c = pronto();
    for (const m of LICOES_DA_CC_ES010.prever.metas) {
      expect(m.feita(c), `"${m.titulo}" não fecha`).toBe(true);
    }
  });

  /*
    ── O absurdo tem de ser absurdo ───────────────────────────────────────

    A previsão de dentro tem de ser plausível e a de fora tem de ser
    impossível. A de dezesseis anos sairia em 1,83 m, que é alto e possível, e
    quem a visse concluiria que a reta funciona fora do intervalo — a lição
    rodaria e ensinaria o contrário.
  */
  it('a previsão de dentro é gente, e a de fora não é', () => {
    const base = abrir().base;
    const par = PAR_DO_MODULO_2;
    const alturas = colunaDe(base, par.y);
    const idades = colunaDe(base, par.x);

    const dentro = previsaoDe(IDADE_DENTRO, alturas, idades)!;
    const fora = previsaoDe(IDADE_FORA, alturas, idades)!;

    /* A de dentro cai no meio do que a base mede. */
    expect(dentro).toBeGreaterThan(1.2);
    expect(dentro).toBeLessThan(1.9);
    /* A de fora passa de qualquer pessoa que já viveu. */
    expect(fora, `a previsão de ${IDADE_FORA} anos saiu em ${fora} m, que é possível`)
      .toBeGreaterThan(2.3);

    /* E a idade de fora está mesmo fora do observado, senão não é extrapolação. */
    expect(IDADE_FORA).toBeGreaterThan(Number(maximo(idades)));
    expect(IDADE_DENTRO).toBeGreaterThanOrEqual(Number(minimo(idades)));
    expect(IDADE_DENTRO).toBeLessThanOrEqual(Number(maximo(idades)));
  });

  it('texto curto, ou sem número nenhum, não fecha o risco', () => {
    /* Uma explicação de risco sem nem o intervalo nem o número absurdo é uma
       explicação de nada em particular — e um campo livre fecharia com "não
       serve". */
    const c = pronto();
    expect(meta('escreveu-o-risco').feita({ ...c, textos: { 'risco-da-extrapolacao': 'não serve' } }))
      .toBe(false);
    const semNumero = 'A reta nunca foi testada fora do intervalo que a base cobre, '
      + 'então ela responde sem ter em que se apoiar e ninguém avisa nada.';
    expect(meta('escreveu-o-risco').feita({ ...c, textos: { 'risco-da-extrapolacao': semNumero } }))
      .toBe(false);
    /*
      E o caso que a mutação achou: curto **com** número. "2,58 m" cita o
      número e não explica nada, e o primeiro caso aqui falhava pela conta do
      dígito — então a conta do comprimento nunca era exercitada. É a trava
      passando por acaso, que é indistinguível de estar certa.
    */
    expect(meta('escreveu-o-risco').feita({ ...c, textos: { 'risco-da-extrapolacao': '2,58 m' } }))
      .toBe(false);
  });

  it('prever só dentro não fecha a lição', () => {
    const c = abrir();
    const calc = escrever(
      abaDe(c.caderno, ABA_CALCULOS),
      linhaDoRotulo(c.blocos, rotuloDaPrevisao(IDADE_DENTRO)),
      1,
      formulaDaPrevisao(c.base, PAR_DO_MODULO_2, IDADE_DENTRO),
    );
    const so = { ...c, caderno: comAba(c.caderno, calc) };
    expect(meta('previu-dentro').feita(so)).toBe(true);
    expect(meta('previu-muito-fora').feita(so)).toBe(false);
  });
});

describe('o módulo 6: a qualidade do ajuste', () => {
  const abrir = () => LICOES_DA_CC_ES010.ajuste.inicial();
  const meta = (id: string) => LICOES_DA_CC_ES010.ajuste.metas.find(m => m.id === id)!;
  const pronto = () => SOLUCOES_DA_CC_ES010.ajuste(abrir());

  it('a solução de referência fecha as duas', () => {
    const c = pronto();
    for (const m of LICOES_DA_CC_ES010.ajuste.metas) {
      expect(m.feita(c), `"${m.titulo}" não fecha`).toBe(true);
    }
  });

  /*
    A pergunta é **comparativa**, e não um corte: não há limiar oficial de r², e
    inventar um e apresentá-lo como fato ensinaria uma precisão que a
    estatística não tem. Mas a comparação só ensina se o pior for pior de
    longe — com os três empatados, apontar seria chutar.
  */
  it('o pior ajuste é pior de longe, senão apontar é chutar', () => {
    const base = abrir().base;
    const r2 = PARES.map(par => ({
      par,
      valor: rquadDe(colunaDe(base, par.y), colunaDe(base, par.x))!,
    })).sort((a, b) => a.valor - b.valor);
    expect(r2[0].par.id).toBe(piorAjusteDa(base).id);
    /* Uma margem de verdade entre o pior e o seguinte. */
    expect(r2[1].valor - r2[0].valor,
      `o pior (${r2[0].valor.toFixed(2)}) e o seguinte (${r2[1].valor.toFixed(2)}) estão empatados`)
      .toBeGreaterThan(0.08);
    /* E o melhor descreve bem, senão a lição seria "a reta nunca serve". */
    expect(r2[r2.length - 1].valor).toBeGreaterThan(0.7);
  });

  /*
    E a ordem das faixas no `RQUAD` é uma mutação **equivalente**: r² é o
    quadrado de r, e r é simétrico, então trocar as duas devolve o mesmo
    número. Diferente do `INCLINAÇÃO`, onde trocar devolve a reta ao
    contrário — e é por isso que isto fica escrito: quem lê o passo a passo
    ("o y primeiro, como nas outras") pode achar que aqui a ordem também muda a
    resposta, e ela não muda.
  */
  it('o r² não muda quando as duas faixas trocam de lugar', () => {
    const base = abrir().base;
    for (const par of PARES) {
      const ys = colunaDe(base, par.y);
      const xs = colunaDe(base, par.x);
      expect(rquadDe(xs, ys)).toBeCloseTo(rquadDe(ys, xs)!, 12);
    }
  });

  it('apontar outro par não fecha', () => {
    const c = pronto();
    const pior = piorAjusteDa(c.base);
    for (const par of PARES) {
      if (par.id === pior.id) continue;
      expect(meta('achou-o-pior-ajuste').feita({ ...c, piorAjuste: par.id }),
        `apontar "${par.id}" fechou a meta`).toBe(false);
    }
  });
});

/*
  ── O módulo 7: o par que você escolheu ──────────────────────────────────

  Requisito 6. A mecânica o requisito 5 já mediu; o que este mede é o
  raciocínio escrito — e raciocínio só existe sobre um par que alguém escolheu.
*/
describe('o módulo 7 confere a escolha, e não só a fórmula', () => {
  const abrir = () => LICOES_DA_CC_ES010.escolhido.inicial();
  const meta = (id: string) => LICOES_DA_CC_ES010.escolhido.metas.find(m => m.id === id)!;
  const pronto = () => SOLUCOES_DA_CC_ES010.escolhido(abrir());

  it('a solução de referência fecha as quatro', () => {
    const c = pronto();
    for (const m of LICOES_DA_CC_ES010.escolhido.metas) {
      expect(m.feita(c), `"${m.titulo}" não fecha`).toBe(true);
    }
  });

  /*
    ── A conta que o caminho comum não faz ────────────────────────────────

    `linhaConfere` não serve aqui: `BlocoDeContas.esperado` recebe a base e o
    rótulo, e não tem como saber que par a pessoa escolheu. Então a meta lê a
    célula e confere contra a escolha — e o que ela pega é a fórmula de **um**
    par ao lado da escolha de **outro**, que sem isso fechariam juntas.
  */
  it('a fórmula de um par com a escolha de outro não fecha', () => {
    const c = pronto();
    /* A escolha muda; a fórmula escrita continua a de idade × diárias. */
    const trocada = { ...c, parEscolhido: { x: CAMPO_IDADE, y: CAMPO_ALTURA } };
    expect(meta('escolheu-e-calculou').feita(trocada)).toBe(false);
  });

  /*
    E a coluna consigo mesma precisa da **fórmula dela escrita**, senão a
    guarda não é exercitada: com a escolha trocada e a fórmula de outro par na
    célula, quem reprova é a conta do par, e a identidade passaria por cima.
    A mutação mostrou isso — apagar `par.x === par.y` não derrubava nada.

    Escrita de verdade, o r de uma coluna consigo mesma é **1**, a conta do par
    espera 1, e as duas concordam: sem a guarda, a meta fecha com uma "relação"
    que não existe.
  */
  it('escolher a mesma coluna duas vezes não fecha, com a fórmula dela escrita', () => {
    const c = pronto();
    const par = { x: CAMPO_IDADE, y: CAMPO_IDADE };
    const calc = escrever(
      abaDe(c.caderno, ABA_CALCULOS),
      linhaDoRotulo(c.blocos, ROTULO_ESCOLHIDO),
      1,
      formulaDoR(c.base, { ...PAR_DO_MODULO_2, ...par }),
    );
    expect(meta('escolheu-e-calculou').feita({
      ...c, parEscolhido: par, caderno: comAba(c.caderno, calc),
    })).toBe(false);
  });

  /*
    ── O valor certo por outro caminho ────────────────────────────────────

    É a conferência que a CC-ES003 nomeia: a tarefa confere **a função e o
    resultado**, nunca só um dos dois. Aqui a célula aponta para outra que tem
    o `CORREL`, então ela referencia alguém, acompanha a base e mostra o número
    certo — e não ensina o que a lição ensina, que é escrever a função.

    A trava do número digitado não pega isto: `=0,33` reprova pela referência
    antes de chegar à função.
  */
  it('o r trazido de outra célula não fecha, mesmo com o número certo', () => {
    const c = abrir();
    const par = { x: CAMPO_IDADE, y: CAMPO_DIARIAS };
    const linha = linhaDoRotulo(c.blocos, ROTULO_ESCOLHIDO);
    let calc = abaDe(c.caderno, ABA_CALCULOS);
    /* O CORREL vai para uma célula ao lado, fora do bloco. */
    calc = escrever(calc, linha, 3, formulaDoR(c.base, { ...PAR_DO_MODULO_2, ...par }));
    calc = escrever(calc, linha, 1, `=${nomeDaColuna(3)}${linha + 1}`);
    expect(meta('escolheu-e-calculou').feita({
      ...c, parEscolhido: par, caderno: comAba(c.caderno, calc),
    })).toBe(false);
  });

  it('o número digitado não fecha, mesmo com a escolha certa', () => {
    const c = abrir();
    const par = { x: CAMPO_IDADE, y: CAMPO_DIARIAS };
    const r = correlacaoDe(colunaDe(c.base, par.x), colunaDe(c.base, par.y))!;
    const calc = escrever(
      abaDe(c.caderno, ABA_CALCULOS),
      linhaDoRotulo(c.blocos, ROTULO_ESCOLHIDO),
      1,
      `=${String(r).replace('.', ',')}`,
    );
    expect(meta('escolheu-e-calculou').feita({
      ...c, parEscolhido: par, caderno: comAba(c.caderno, calc),
    })).toBe(false);
  });

  /*
    ── Os três campos escritos são três, e não um repetido ────────────────

    Repetir o mesmo texto é o sinal de que um dos dois não foi pensado — a
    decisão dos dois campos do requisito 5.6 da CC-ES009.
  */
  it('o mesmo texto nos campos não fecha os três', () => {
    const c = pronto();
    const mesmo = c.textos[CHAVE_SUGERE];
    const colado = { ...c, textos: { ...c.textos, [CHAVE_OUTRA]: mesmo, [CHAVE_DADO]: mesmo } };
    expect(meta('disse-o-que-sugere').feita(colado)).toBe(true);
    expect(meta('disse-outra-explicacao').feita(colado)).toBe(false);
    expect(meta('disse-que-dado-decidiria').feita(colado)).toBe(false);
  });

  /*
    E o terceiro campo se compara com **os dois** anteriores, e não só com o
    vizinho. Colar nele o texto do primeiro deixa ele diferente do segundo, e
    sem a segunda comparação a meta fecharia — a mutação que apaga
    `!== CHAVE_SUGERE` não derrubava nada, porque o caso de cima cola o mesmo
    texto nos três e reprova pela outra conta.

    O gesto é o que alguém de fato faz: escreve o que o r sugere, pensa numa
    explicação alternativa de verdade, e no terceiro campo repete a primeira
    frase porque já não sabe o que escrever.
  */
  it('o terceiro campo repetindo o primeiro não fecha', () => {
    const c = pronto();
    const repetido = {
      ...c, textos: { ...c.textos, [CHAVE_DADO]: c.textos[CHAVE_SUGERE] },
    };
    expect(meta('disse-outra-explicacao').feita(repetido)).toBe(true);
    expect(meta('disse-que-dado-decidiria').feita(repetido)).toBe(false);
  });

  /*
    ── E dois dos quatro campos **não** pedem número, de propósito ─────────

    "Que outra explicação cabe no mesmo padrão" e "que dado decidiria entre
    elas" são histórias de causa, e são qualitativas por natureza. Cobrar
    número ali reprovaria o certo — e foi o que a trava de "fecha com a
    solução de referência" pegou, porque a minha explicação de causa não tinha
    um único algarismo.
  */
  it('a explicação de causa fecha sem citar número, e a do r não', () => {
    const c = pronto();
    const semNumero = 'Pode ser que a distância de casa explique as duas coisas, '
      + 'e que a idade não cause nada disso por conta própria.';
    expect(meta('disse-outra-explicacao').feita({
      ...c, textos: { ...c.textos, [CHAVE_OUTRA]: semNumero },
    })).toBe(true);
    /* Mas o que a relação **sugere** fala de um número que está na tela. */
    expect(meta('disse-o-que-sugere').feita({
      ...c, textos: { ...c.textos, [CHAVE_SUGERE]: semNumero },
    })).toBe(false);
  });
});

/*
  ── O módulo 8: refazer sem os atípicos ──────────────────────────────────

  Requisito 7. "Refazer a análise excluindo os valores atípicos e comparar os
  dois resultados, relatando o efeito da exclusão sobre a conclusão" — e as
  três metades estão aí: excluir, comparar, relatar.
*/
describe('o módulo 8 compara as duas análises', () => {
  const abrir = () => LICOES_DA_CC_ES010.exclusao.inicial();
  const meta = (id: string) => LICOES_DA_CC_ES010.exclusao.metas.find(m => m.id === id)!;
  const pronto = () => SOLUCOES_DA_CC_ES010.exclusao(abrir());
  const par = PAR_DO_MODULO_2;
  const valorDaLinha = (c: ContextoDaEstatistica, rotulo: string) => valorCalculado(
    abaDe(c.caderno, ABA_CALCULOS), linhaDoRotulo(c.blocos, rotulo), 1, c.caderno,
  );

  /*
    ── O que a lição afirma, conferido contra a base ──────────────────────

    É a trava de `exemplosDaAnalise.test.ts`, e aqui ela guarda a **premissa**
    da lição e não um número escrito na prosa: o relato de referência diz que
    a exclusão quase não mudou o que a reta afirma e mudou muito o quanto ela
    parece certa. Se a base deixasse de ser assim, a lição continuaria
    ensinando isso com os números dizendo outra coisa — e nada estouraria.
  */
  it('o par tem atípico, e tirá-lo mexe pouco na reta e muito no ajuste', () => {
    const fora = linhasAtipicasDoPar(abrir().base, par);
    expect(fora.length, 'sem atípico no par, o requisito 7 não tem o que excluir')
      .toBeGreaterThan(0);

    const b = abrir().base;
    const ys = colunaDe(b, par.y);
    const xs = colunaDe(b, par.x);
    const sem = semAtipicos(b, par);
    const inclTodos = inclinacaoDe(ys, xs)!;
    const inclSem = inclinacaoDe(sem.ys, sem.xs)!;
    const r2Todos = rquadDe(ys, xs)!;
    const r2Sem = rquadDe(sem.ys, sem.xs)!;

    /* A reta afirma quase a mesma coisa: menos de um décimo de diferença. */
    expect(Math.abs(inclSem - inclTodos) / inclTodos).toBeLessThan(0.1);
    /* E ela passa a parecer bem mais certa: o r² sobe de verdade. */
    expect(r2Sem - r2Todos).toBeGreaterThan(0.05);
  });

  /*
    ── Olhar as duas colunas, e não só a dependente ───────────────────────

    Hoje a base só tem atípico na altura, então uma versão que olhasse apenas
    a coluna do y daria a mesma resposta — e seria uma conta estruturalmente
    incapaz de achar um atípico de idade. O par invertido exercita o outro
    lado: a mesma linha tem de ser achada quando o atípico está no x.
  */
  it('acha o atípico nos dois lados do par', () => {
    const b = abrir().base;
    const invertido = { ...par, x: par.y, y: par.x };
    expect(linhasAtipicasDoPar(b, invertido)).toEqual(linhasAtipicasDoPar(b, par));
  });

  it('a solução de referência fecha as quatro', () => {
    const c = pronto();
    for (const m of LICOES_DA_CC_ES010.exclusao.metas) {
      expect(m.feita(c), `"${m.titulo}" não fecha`).toBe(true);
    }
  });

  /*
    ── A coluna auxiliar é trabalho, e não mexida na base ─────────────────

    `assinaturaDaBase` lê de zero até `camposDaBase().length`, e a auxiliar
    nasce logo depois. Posta uma coluna antes, montar a coluna de trabalho
    acusaria mexida na base e as duas metas de "sem o atípico" ficariam
    impossíveis de fechar — com a planilha certa na tela.
  */
  it('montar a coluna auxiliar não conta como mexer na base', () => {
    expect(COLUNA_AUXILIAR).toBeGreaterThan(camposDaBase().length);
    const c = comColunaAuxiliar(abrir(), par);
    expect(assinaturaDaBase(abaDe(c.caderno, ABA_RESPOSTAS)!))
      .toBe(assinaturaDaBase(abaDe(c.cadernoAntes, ABA_RESPOSTAS)!));
  });

  /*
    ── Apagar a linha é o atalho, e ele não fecha ─────────────────────────

    Sem a base inteira como condição, apagar a linha do atípico e escrever a
    fórmula da **faixa inteira** devolve exatamente o número "sem" — com a
    fórmula parecendo a de "com todos". A comparação do requisito 7 deixaria de
    existir e as duas linhas de cima passariam a falar de uma base que já não
    está lá.
  */
  it('apagar a linha do atípico não fecha as metas de "sem"', () => {
    const c = abrir();
    const fora = linhasAtipicasDoPar(c.base, par);
    let resp = abaDe(c.caderno, ABA_RESPOSTAS)!;
    for (const i of fora) {
      for (let col = 0; col <= camposDaBase().length; col++) resp = escrever(resp, i + 1, col, '');
    }
    let calc = abaDe(c.caderno, ABA_CALCULOS);
    calc = escrever(calc, linhaDoRotulo(c.blocos, ROTULO_INCL_SEM), 1,
      formulaDaReta(c.base, par, 'INCLINAÇÃO'));
    const apagado = {
      ...c, caderno: comAba(comAba(c.caderno, resp), calc),
    };
    expect(meta('refez-a-reta-sem-o-atipico').feita(apagado)).toBe(false);
  });

  /*
    ── O filtro não exclui, e é a premissa da primeira meta ───────────────

    A lição manda ver a inclinação **não se mover** com a coluna filtrada. Se
    um dia o filtro passasse a mexer na conta, a lição estaria ensinando o
    contrário do que a tela mostra — e a descoberta viraria uma afirmação
    falsa sobre o programa. É a mesma conta que a CC-ES003 cobra da SOMA.
  */
  it('filtrar a coluna não move a inclinação de "com todos"', () => {
    const c = abrir();
    const resp = abaDe(c.caderno, ABA_RESPOSTAS)!;
    const filtrada: typeof resp = {
      ...resp,
      filtro: { coluna: colunaDoCampo(par.y), valor: colunaDe(c.base, par.y)[0] },
    };
    const comFiltro = { ...c, caderno: comAba(c.caderno, filtrada) };
    /* A linha de cima chega escrita, e continua certa com o filtro aplicado:
       é o que a descoberta manda a pessoa olhar. */
    expect(valorDaLinha(comFiltro, ROTULO_INCL_TODOS)).toEqual(valorDaLinha(c, ROTULO_INCL_TODOS));
  });

  it('a descoberta do filtro não sai do estado da planilha', () => {
    /* Ela é do desbravador olhando, como as duas do módulo 6 da CC-ES004:
       aplicar o filtro é um clique, e contar o clique premiaria o clique e não
       a descoberta. */
    const c = pronto();
    expect(meta('viu-que-esconder-nao-exclui').feita({ ...c, descobertas: [] })).toBe(false);
    expect(c.descobertas).toContain(DESCOBERTA_FILTRO);

    /* E o contrário também: o filtro aplicado, sozinho, não fecha nada. */
    const zero = abrir();
    const resp = abaDe(zero.caderno, ABA_RESPOSTAS)!;
    const soFiltrado = {
      ...zero,
      caderno: comAba(zero.caderno, {
        ...resp, filtro: { coluna: colunaDoCampo(par.y), valor: colunaDe(zero.base, par.y)[0] },
      }),
    };
    expect(meta('viu-que-esconder-nao-exclui').feita(soFiltrado)).toBe(false);
  });

  /*
    ── Apagar os dois lados é desnecessário, e dizê-lo é a lição ──────────

    `formulaSemAtipico` troca **só** o y pela coluna auxiliar e deixa o x
    inteiro. O par cai inteiro quando falta um número de um dos lados, então os
    dois resultados têm de bater — o da fórmula, que o desbravador escreve, e o
    de `semAtipicos`, que a trava calcula. Dois números diferentes aqui seriam
    o motor e a meta discordando, que é a divergência que aparece como tarefa
    que não fecha com a planilha certa na tela.
  */
  it('apagar um lado só basta: a fórmula bate com a conta', () => {
    const c = comColunaAuxiliar(abrir(), par);
    const calc = escrever(
      abaDe(c.caderno, ABA_CALCULOS),
      linhaDoRotulo(c.blocos, ROTULO_INCL_SEM),
      1,
      formulaSemAtipico(c.base, par, 'INCLINAÇÃO'),
    );
    const sem = semAtipicos(c.base, par);
    const v = valorCalculado(calc, linhaDoRotulo(c.blocos, ROTULO_INCL_SEM), 1,
      comAba(c.caderno, calc));
    expect(v.tipo).toBe('numero');
    expect(v.tipo === 'numero' && Math.abs(v.n - inclinacaoDe(sem.ys, sem.xs)!))
      .toBeLessThan(1e-9);
  });

  /*
    ── A reta e o ajuste são duas metas, e de propósito ───────────────────

    A inclinação diz o que a reta **afirma**; o r² diz quanto se pode confiar
    nela — e o relato da lição fala das duas, porque é a distância entre elas
    que é o assunto. Colapsadas numa meta só, refazer metade fecharia a tarefa
    e o relato ficaria sem um dos dois números para citar.
  */
  it('refazer só a inclinação não fecha a meta do r²', () => {
    const c = comColunaAuxiliar(abrir(), par);
    const calc = escrever(
      abaDe(c.caderno, ABA_CALCULOS),
      linhaDoRotulo(c.blocos, ROTULO_INCL_SEM),
      1,
      formulaSemAtipico(c.base, par, 'INCLINAÇÃO'),
    );
    const meio = { ...c, caderno: comAba(c.caderno, calc) };
    expect(meta('refez-a-reta-sem-o-atipico').feita(meio)).toBe(true);
    expect(meta('refez-o-ajuste-sem-o-atipico').feita(meio)).toBe(false);
    expect(valorDaLinha(meio, ROTULO_R2_SEM).tipo).not.toBe('numero');
  });

  it('o relato precisa de número, e não de duas palavras', () => {
    const c = pronto();
    const vago = { ...c, textos: { ...c.textos, [CHAVE_EFEITO]: 'mudou pouco' } };
    expect(meta('relatou-o-efeito').feita(vago)).toBe(false);
    const semNumero = {
      ...c,
      textos: {
        ...c.textos,
        [CHAVE_EFEITO]: 'A reta ficou quase igual e o ajuste melhorou bastante, '
          + 'então ela passou a parecer mais certa do que de fato é.',
      },
    };
    expect(meta('relatou-o-efeito').feita(semNumero)).toBe(false);
  });

  /* As duas linhas de cima chegam escritas, e meta nenhuma as lê sozinhas. */
  it('as linhas de "com todos" chegam certas, e nenhuma meta abre por elas', () => {
    const c = abrir();
    for (const rotulo of [ROTULO_INCL_TODOS, ROTULO_R2_TODOS]) {
      const v = valorDaLinha(c, rotulo);
      expect(v.tipo, `"${rotulo}" não chega calculada`).toBe('numero');
    }
    for (const m of LICOES_DA_CC_ES010.exclusao.metas) {
      expect(m.feita(c), `"${m.titulo}" abre verde`).toBe(false);
    }
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
