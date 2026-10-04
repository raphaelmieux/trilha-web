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
} from './metasDaCcEs010';
import { COLETAS, populacaoCerta } from './amostraDoClube';
import { ABA_CALCULOS, ABA_RESPOSTAS, faixaDoCampo, linhaDoRotulo } from './metasDaCcEs009';
import { abaDe, comAba } from './cadernoDoClube';
import { escrever } from './planilha';
import { nomeDaColuna } from './formulas';
import {
  colunaDe, correlacaoDe, maximo, minimo, previsaoDe, rquadDe,
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
