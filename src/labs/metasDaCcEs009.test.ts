import { describe, expect, it } from 'vitest';
import {
  type ContextoDaAnalise, type LicaoDaCcEs009, type Meta,
  ABA_CALCULOS, ABA_RESPOSTAS, COLUNAS_MEDIDAS, LICOES_DA_CC_ES009, MEDIDAS,
  PRIMEIRA_LINHA, VIU_A_CONTA_SE_REFAZER, VIU_QUE_A_MODA_NAO_SERVE,
  BLOCO_DAS_MEDIDAS, REPETICOES_QUE_FAZEM_MODA,
  ROTULO_CHEGAM, ROTULO_RAZAO, ROTULO_TOTAL, VIU_A_COLUNA_QUE_ENGANA,
  cadernoDaAnalise, colunaDaMedida, colunaDoCampo, contextoInicial,
  esperadoDe, faixaDoCampo, formulaDaMedida, linhaDoRotulo,
} from './metasDaCcEs009';
import {
  CAMPO_ACAMPAMENTOS, CAMPO_ALTURA, CAMPO_IDADE,
  CLASSIFICACAO, baseDoAcampamento, camposDaBase,
} from './baseDoAcampamento';
import { escrever, valorCalculado } from './planilha';
import { abaDe, comAba, escritoEm, mostradoEm, valorEm } from './cadernoDoClube';
import { colunaDe, repeticoesDaModa } from './analiseDeDados';
import { respostasReais } from './formulario';
import { nomeDaColuna } from './formulas';

/* ── A solução de referência ──────────────────────────────────────────────── */

/**
 * O que uma pessoa que fez a lição direito deixa para trás.
 *
 * Ela **não pula o meio do caminho**: escreve as fórmulas de verdade, na aba
 * de verdade, com a faixa de verdade, e deixa a planilha calcular. Carimbar os
 * valores à mão provaria o fim e não provaria o caminho — foi assim que a
 * lição de assinar da CC-ES004 chegou impossível de vencer, com a trava de
 * motor passando.
 */
const comTodasAsMedidas = (c: ContextoDaAnalise): ContextoDaAnalise => {
  let p = abaDe(c.caderno, ABA_CALCULOS);
  for (const medida of MEDIDAS) {
    for (const campo of COLUNAS_MEDIDAS) {
      p = escrever(p, linhaDoRotulo(c.blocos, medida.rotulo), colunaDaMedida(campo),
        formulaDaMedida(medida, c.base, campo));
    }
  }
  return { ...c, caderno: comAba(c.caderno, p) };
};

/** O endereço de uma célula da aba de cálculos, como quem escreve a fórmula. */
const enderecoDe = (c: ContextoDaAnalise, rotulo: string, campoId: string) =>
  `${nomeDaColuna(colunaDaMedida(campoId))}${linhaDoRotulo(c.blocos, rotulo) + 1}`;

/**
 * O módulo 3, escrito como a pessoa escreve.
 *
 * A razão aponta para as duas células de cima, que é a boa prática — repetir
 * as funções também responde, e por isso a conta não cobra nenhuma das duas.
 * O que ela cobra é que a célula **aponte** para alguma coisa: `=1,43` devolve
 * o número certo e não acompanha nada.
 */
const comOEngano = (c0: ContextoDaAnalise): ContextoDaAnalise => {
  const c = comTodasAsMedidas(c0);
  let p = abaDe(c.caderno, ABA_CALCULOS);
  for (const campo of COLUNAS_MEDIDAS) {
    const col = colunaDaMedida(campo);
    const faixa = `${ABA_RESPOSTAS}!${faixaDoCampo(c.base, campo)}`;
    p = escrever(p, linhaDoRotulo(c.blocos, ROTULO_RAZAO), col,
      `=${enderecoDe(c, 'Média', campo)}/${enderecoDe(c, 'Mediana', campo)}`);
    p = escrever(p, linhaDoRotulo(c.blocos, ROTULO_CHEGAM), col,
      `=CONT.SE(${faixa};">="&${enderecoDe(c, 'Média', campo)})`);
    p = escrever(p, linhaDoRotulo(c.blocos, ROTULO_TOTAL), col, `=CONT.NÚM(${faixa})`);
  }
  return {
    ...c,
    caderno: comAba(c.caderno, p),
    descobertas: [...c.descobertas, VIU_A_COLUNA_QUE_ENGANA],
  };
};

const SOLUCOES: Record<LicaoDaCcEs009, (c: ContextoDaAnalise) => ContextoDaAnalise> = {
  tipos: c => ({
    ...c,
    marcacoes: Object.fromEntries(camposDaBase().map(campo => [campo.id, {
      natureza: CLASSIFICACAO[campo.id].natureza,
      escala: CLASSIFICACAO[campo.id].escala,
      naoAgrupa: Boolean(CLASSIFICACAO[campo.id].naoAgrupa),
    }])),
  }),
  centro: c => ({
    ...comTodasAsMedidas(c),
    descobertas: [VIU_QUE_A_MODA_NAO_SERVE, VIU_A_CONTA_SE_REFAZER],
  }),
  engano: comOEngano,
};

const licoes = Object.entries(LICOES_DA_CC_ES009) as [LicaoDaCcEs009, typeof LICOES_DA_CC_ES009[LicaoDaCcEs009]][];

/* ── As duas travas que carregam todas as outras ──────────────────────────── */

describe('nenhuma meta abre verde', () => {
  /*
    Lista com item já marcado no segundo zero ensina a não ler a lista, e a
    plataforma inteira depende de o desbravador ler a lista. É a trava que
    pegou o dossiê da CC-ES004 abrindo com os cinco documentos que a meta
    mandava reunir, e as duas metas de preservação da CC-ES005.
  */
  it.each(licoes)('%s', (nome, licao) => {
    const c = licao.inicial();
    for (const meta of licao.metas) {
      expect(meta.feita(c), `${nome}/${meta.id} já está verde ao abrir`).toBe(false);
    }
  });
});

describe('a solução de referência fecha a lista inteira', () => {
  /*
    O outro lado, e ele não é simetria: laboratório impossível de vencer é pior
    do que um que abre resolvido. Um deixa uma tarefa verde de graça; o outro
    deixa quem fez tudo certo olhando uma lista vermelha sem nada na tela que
    explique.
  */
  it.each(licoes)('%s', (nome, licao) => {
    const pronto = SOLUCOES[nome](licao.inicial());
    for (const meta of licao.metas) {
      expect(meta.feita(pronto), `${nome}/${meta.id} não fecha`).toBe(true);
    }
  });
});

/* ── A forma de cada meta ─────────────────────────────────────────────────── */

describe('cada meta se explica', () => {
  const todas: [string, Meta][] = licoes.flatMap(([nome, l]) =>
    l.metas.map(m => [`${nome}/${m.id}`, m] as [string, Meta]));

  it('a lista não está vazia', () => {
    /* A guarda de sempre: uma lista que esvaziasse deixaria todas as travas
       deste arquivo verdes por não terem conferido nada. */
    expect(todas.length).toBeGreaterThan(5);
  });

  it.each(todas)('%s tem título, detalhe, lugar e passo a passo', (_, meta) => {
    expect(meta.titulo.length).toBeGreaterThan(10);
    expect(meta.detalhe.length).toBeGreaterThan(20);
    expect(meta.onde.length).toBeGreaterThan(10);
    /* Modelo vazio pede `passos` completos, e o teste cobra os dois juntos —
       é a decisão do desafio de HTML, escrita lá. */
    expect(meta.passos.length).toBeGreaterThan(1);
    for (const passo of meta.passos) expect(passo.length).toBeGreaterThan(15);
  });

  it('nenhum id se repete dentro de uma lição', () => {
    for (const [nome, licao] of licoes) {
      const ids = licao.metas.map(m => m.id);
      expect(new Set(ids).size, `${nome} repete id`).toBe(ids.length);
    }
  });
});

/* ── A pasta de trabalho ──────────────────────────────────────────────────── */

describe('a pasta como ela chega', () => {
  const base = baseDoAcampamento();
  const BLOCOS = [BLOCO_DAS_MEDIDAS];
  const caderno = cadernoDaAnalise(base, BLOCOS);
  const respostas = abaDe(caderno, ABA_RESPOSTAS);
  const calculos = abaDe(caderno, ABA_CALCULOS);

  it('cabe a base inteira, e a última pessoa está lá', () => {
    /*
      Vinte e três das quarenta e oito respostas não caberiam numa grade de
      vinte e seis linhas, e nada estouraria: a aba abriria bonita e toda
      conta da vereda sairia sobre metade do clube.
    */
    const linhas = respostasReais(base);
    expect(calculos).toBeDefined();
    for (let i = 0; i < linhas.length; i++) {
      const nome = linhas[i].valores.nome;
      expect(escritoEm(respostas, PRIMEIRA_LINHA + i, colunaDoCampo('nome')),
        `a resposta ${linhas[i].id} não está na aba`).toBe(nome);
    }
  });

  it('a tabela declarada vai do cabeçalho ao último registro', () => {
    /* É o conserto que o módulo 3 da CC-ES008 fez. Chegando errada de novo, a
       vereda abriria mandando refazer a lição anterior. */
    const linhas = respostasReais(base).length;
    expect(respostas.tabela).toEqual({
      l1: 0, c1: 0, l2: linhas, c2: camposDaBase().length,
    });
  });

  it('a primeira linha fica congelada', () => {
    /* Rolando quarenta e oito registros, uma coluna sem cabeçalho à vista é
       uma coluna que ninguém sabe qual é. */
    expect(respostas.congeladas).toBe(1);
  });

  it('a zona de cálculo chega rotulada e vazia', () => {
    /*
      "A estrutura vem rotulada; a arrumação, não" — a decisão do módulo 3 da
      CC-ES003. Chegando preenchida ela não mediria nada; chegando sem rótulo
      nenhum, mediria gosto.
    */
    for (const medida of MEDIDAS) {
      expect(escritoEm(calculos, linhaDoRotulo(BLOCOS, medida.rotulo), 0)).toBe(medida.rotulo);
      for (const campo of COLUNAS_MEDIDAS) {
        expect(escritoEm(calculos, linhaDoRotulo(BLOCOS, medida.rotulo), colunaDaMedida(campo)),
          `${medida.rotulo} de ${campo} já vem escrita`).toBe('');
      }
    }
  });

  it('a coluna de um campo sai da ordem dos campos, e não de uma letra escrita à mão', () => {
    /*
      Campo novo no formulário empurra os seguintes. Uma letra fixa passaria a
      apontar para a coluna do lado — com a fórmula continuando a devolver um
      número, plausível e sobre outra pergunta.
    */
    const campos = camposDaBase();
    for (let i = 0; i < campos.length; i++) {
      expect(colunaDoCampo(campos[i].id)).toBe(i + 1);
      expect(escritoEm(respostas, 0, i + 1)).toBe(campos[i].rotulo);
    }
    expect(colunaDoCampo('campo-que-nao-existe')).toBe(-1);
  });

  it('a faixa de uma coluna cobre todos os registros e mais nenhuma linha', () => {
    const n = respostasReais(base).length;
    const letra = nomeDaColuna(colunaDoCampo(CAMPO_IDADE));
    expect(faixaDoCampo(base, CAMPO_IDADE)).toBe(`${letra}2:${letra}${n + 1}`);
  });
});

/* ── A conferência de uma conta ───────────────────────────────────────────── */

describe('a conta confere a fórmula e o resultado', () => {
  const licao = LICOES_DA_CC_ES009.centro;
  const meta = (id: string) => licao.metas.find(m => m.id === id)!;

  const comFormula = (c: ContextoDaAnalise, rotulo: string, campo: string, texto: string) => {
    const p = escrever(abaDe(c.caderno, ABA_CALCULOS),
      linhaDoRotulo(c.blocos, rotulo), colunaDaMedida(campo), texto);
    return { ...c, caderno: comAba(c.caderno, p) };
  };

  it('o número digitado não passa, mesmo estando certo hoje', () => {
    /*
      `=12,4` começa por igual, devolve o número certo, e não acompanha nada.
      É o terceiro defeito do requisito 7 da CC-ES003 — o que não tem pista
      nenhuma: está certo hoje e continua mostrando o número de hoje amanhã.
    */
    let c = SOLUCOES.centro(licao.inicial());
    const certo = esperadoDe(c.base, CAMPO_IDADE, 'Média')!;
    c = comFormula(c, 'Média', CAMPO_IDADE, `=${String(certo).replace('.', ',')}`);
    expect(valorEm(abaDe(c.caderno, ABA_CALCULOS), linhaDoRotulo(c.blocos, 'Média'), colunaDaMedida(CAMPO_IDADE)))
      .toMatchObject({ tipo: 'numero' });
    expect(meta('media-e-mediana').feita(c)).toBe(false);
  });

  it('a função certa sobre o intervalo errado não passa', () => {
    /*
      `=MÉDIA(F3:F49)` deixa o primeiro inscrito de fora e devolve um número
      plausível. É o erro de planilha mais comum que existe, e conferir só o
      texto da fórmula o deixaria passar.
    */
    let c = SOLUCOES.centro(licao.inicial());
    const letra = nomeDaColuna(colunaDoCampo(CAMPO_IDADE));
    const n = respostasReais(c.base).length;
    c = comFormula(c, 'Média', CAMPO_IDADE, `=MÉDIA(${ABA_RESPOSTAS}!${letra}3:${letra}${n + 1})`);
    expect(meta('media-e-mediana').feita(c)).toBe(false);
  });

  it('a mediana escrita no lugar da média não passa', () => {
    /* As duas devolvem número, e na coluna da idade elas quase coincidem: a
       troca sairia plausível. */
    let c = SOLUCOES.centro(licao.inicial());
    c = comFormula(c, 'Média', CAMPO_IDADE, formulaTrocada(c));
    expect(meta('media-e-mediana').feita(c)).toBe(false);
  });

  const formulaTrocada = (c: ContextoDaAnalise) =>
    `=MED(${ABA_RESPOSTAS}!${faixaDoCampo(c.base, CAMPO_IDADE)})`;

  it('a moda da altura é um número, e é isso que a torna a lição', () => {
    /*
      Eu havia desenhado esta lição supondo que a moda de uma coluna de
      medidas não existiria, e a planilha responderia `#N/D`. Ela existe: 1,58
      aparece duas vezes em quarenta e oito. A trava pegou a suposição, e o
      que ela achou é melhor do que o que eu tinha escrito — `#N/D` seria a
      planilha avisando, e a matéria desta vereda é que ela **não avisa**.

      O número sai plausível, e quem descobre que ele não descreve ninguém é
      quem pergunta quantas vezes ele se repete.
    */
    const base = baseDoAcampamento();
    expect(esperadoDe(base, CAMPO_ALTURA, 'Moda')).not.toBeNull();

    const poucas = repeticoesDaModa(colunaDe(base, CAMPO_ALTURA));
    const muitas = repeticoesDaModa(colunaDe(base, CAMPO_IDADE));
    expect(poucas, 'a moda da altura se repete demais para a lição existir')
      .toBeLessThan(REPETICOES_QUE_FAZEM_MODA);
    expect(muitas, 'a moda da idade se repete de menos para servir de contraste')
      .toBeGreaterThan(REPETICOES_QUE_FAZEM_MODA * 2);
  });

  it('a conta atravessa a aba, e o avaliador de uma aba só reprovaria a fórmula certa', () => {
    /*
      `=MÉDIA(Respostas!F2:F49)` escrito na aba Cálculos resolve contra a
      **própria** aba Cálculos quando quem avalia conhece uma aba só: a faixa
      sai vazia e a resposta é `#DIV/0!`. A conta certa, escrita certa,
      reprovada — e toda lição desta vereda atravessa a aba, porque a base
      mora numa e o cálculo mora na outra.
    */
    const c = SOLUCOES.centro(licao.inicial());
    const calculos = abaDe(c.caderno, ABA_CALCULOS);
    const l = linhaDoRotulo(c.blocos, 'Média');
    const col = colunaDaMedida(CAMPO_IDADE);

    expect(valorCalculado(calculos, l, col, c.caderno)).toMatchObject({ tipo: 'numero' });
    /* E o de uma aba só, que é o que estava sendo usado, devolve o erro. */
    expect(valorEm(calculos, l, col).tipo).toBe('erro');
    expect(mostradoEm(calculos, l, col)).toBe('#DIV/0!');
  });

  it('a amplitude pede as duas funções, porque ela é a distância entre as pontas', () => {
    /* Só o máximo não é a amplitude, e devolve um número. */
    let c = SOLUCOES.centro(licao.inicial());
    const faixa = `${ABA_RESPOSTAS}!${faixaDoCampo(c.base, CAMPO_IDADE)}`;
    c = comFormula(c, 'Amplitude', CAMPO_IDADE, `=MÁXIMO(${faixa})`);
    expect(meta('amplitude-e-desvio').feita(c)).toBe(false);
  });

  it('o desvio amostral não passa no lugar do populacional', () => {
    /*
      `DESVPAD` divide por n−1 e responde sobre uma amostra; a base é o clube
      inteiro. Sobre quarenta e oito valores os dois ficam a cerca de 1% um do
      outro — plausível, e sobre outra pergunta.
    */
    let c = SOLUCOES.centro(licao.inicial());
    const faixa = `${ABA_RESPOSTAS}!${faixaDoCampo(c.base, CAMPO_IDADE)}`;
    c = comFormula(c, 'Desvio padrão', CAMPO_IDADE, `=DESVPAD(${faixa})`);
    expect(meta('amplitude-e-desvio').feita(c)).toBe(false);
  });
});

/* ── O módulo 3 ───────────────────────────────────────────────────────────── */

describe('onde a média engana', () => {
  const licao = LICOES_DA_CC_ES009.engano;
  const meta = (id: string) => licao.metas.find(m => m.id === id)!;

  it('a razão digitada não passa, mesmo com o número certo', () => {
    /*
      Esta é a conta em que mais de um caminho serve — dividir as duas células
      de cima, ou repetir as funções —, então não há função obrigatória para
      cobrar. Sem a guarda de referência, `=1,4270833333333333` passaria: um
      número certo hoje que continua mostrando o de hoje amanhã, com um sinal
      de igual na frente para parecer conta.
    */
    const pronto = SOLUCOES.engano(licao.inicial());
    expect(meta('a-razao-entre-as-duas').feita(pronto)).toBe(true);

    let p = abaDe(pronto.caderno, ABA_CALCULOS);
    const certo = esperadoDe(pronto.base, CAMPO_ACAMPAMENTOS, ROTULO_RAZAO)!;
    p = escrever(p, linhaDoRotulo(pronto.blocos, ROTULO_RAZAO), colunaDaMedida(CAMPO_ACAMPAMENTOS),
      `=${String(certo).replace('.', ',')}`);
    const digitada = { ...pronto, caderno: comAba(pronto.caderno, p) };

    /* O valor continua certo — é só isso que uma conferência de resultado veria. */
    expect(valorCalculado(abaDe(digitada.caderno, ABA_CALCULOS),
      linhaDoRotulo(digitada.blocos, ROTULO_RAZAO), colunaDaMedida(CAMPO_ACAMPAMENTOS),
      digitada.caderno)).toMatchObject({ tipo: 'numero' });
    expect(meta('a-razao-entre-as-duas').feita(digitada)).toBe(false);
  });

  it('apagar o veterano que puxa a média derruba as metas que mexem na conta', () => {
    /*
      É o caminho rápido e errado do módulo 3, e o requisito 5.6 existe para
      recusá-lo: decide-se por escrito o que fazer com um valor atípico, não se
      some com ele. A condição viaja conjugada com cada meta que pede um gesto,
      e não como item da lista — "a base continua inteira" é verdadeira no
      segundo zero, e item já marcado ensina a não ler a lista.
    */
    const pronto = SOLUCOES.engano(licao.inicial());
    const respostas = abaDe(pronto.caderno, ABA_RESPOSTAS);
    const coluna = colunaDoCampo('nome');
    const linha = respostas.celulas.findIndex(l => l[coluna]?.texto === 'Marina Sobral');
    expect(linha, 'a veterana de dezoito acampamentos não está na aba').toBeGreaterThan(0);

    const semEla = {
      ...pronto,
      caderno: comAba(pronto.caderno, escrever(respostas, linha, coluna, '')),
    };
    expect(meta('a-razao-entre-as-duas').feita(semEla)).toBe(false);
    expect(meta('quantos-chegam-a-media').feita(semEla)).toBe(false);
  });

  it('a razão separa a coluna que engana das outras duas', () => {
    /*
      Contar quantos ficam abaixo da média não separa nada: são 29 dos 48 nos
      acampamentos e 26 na idade, as duas acima da metade. O que separa é a
      distância entre média e mediana — 43% numa, menos de 4% nas outras.

      E as outras duas **precisam** ficar perto de 1. Se as três fossem
      assimétricas, o desbravador sairia daqui achando que a média sempre
      mente, e aí ele não usaria mais a média — que é pior.
    */
    const base = baseDoAcampamento();
    const razao = (campo: string) => esperadoDe(base, campo, ROTULO_RAZAO)!;
    expect(razao(CAMPO_ACAMPAMENTOS)).toBeGreaterThan(1.25);
    expect(Math.abs(razao(CAMPO_IDADE) - 1)).toBeLessThan(0.1);
    expect(Math.abs(razao(CAMPO_ALTURA) - 1)).toBeLessThan(0.1);
  });
});

/* ── O que a lição de classificar cobra ───────────────────────────────────── */

describe('a classificação', () => {
  const licao = LICOES_DA_CC_ES009.tipos;
  const meta = (id: string) => licao.metas.find(m => m.id === id)!;

  it('marcar tudo não basta: tem de estar certo', () => {
    const c: ContextoDaAnalise = {
      ...licao.inicial(),
      marcacoes: Object.fromEntries(camposDaBase().map(campo => [campo.id, {
        natureza: 'qualitativa' as const, escala: 'nominal' as const,
      }])),
    };
    expect(meta('toda-coluna-classificada').feita(c)).toBe(true);
    expect(meta('classificacao-certa').feita(c)).toBe(false);
  });

  it('uma coluna esquecida deixa a primeira meta vermelha', () => {
    const pronto = SOLUCOES.tipos(licao.inicial());
    const semUma = { ...pronto, marcacoes: { ...pronto.marcacoes } };
    delete semUma.marcacoes[CAMPO_ALTURA];
    expect(meta('toda-coluna-classificada').feita(semUma)).toBe(false);
  });

  it('a marca de "não agrupa" é conferida nos dois sentidos', () => {
    /*
      Marcá-la em tudo passaria se a trava só cobrasse as três certas, e
      marcá-la em nada passaria se ela só cobrasse a ausência nas outras sete.
    */
    const pronto = SOLUCOES.tipos(licao.inicial());
    const emTudo = {
      ...pronto,
      marcacoes: Object.fromEntries(camposDaBase().map(c => [c.id, {
        ...pronto.marcacoes[c.id], naoAgrupa: true,
      }])),
    };
    const emNada = {
      ...pronto,
      marcacoes: Object.fromEntries(camposDaBase().map(c => [c.id, {
        ...pronto.marcacoes[c.id], naoAgrupa: false,
      }])),
    };
    expect(meta('as-tres-que-nao-agrupam').feita(emTudo)).toBe(false);
    expect(meta('as-tres-que-nao-agrupam').feita(emNada)).toBe(false);
  });
});

/* ── O registro ───────────────────────────────────────────────────────────── */

describe('o registro das lições', () => {
  it('toda lição diz de que programa ela parte', () => {
    for (const [nome, licao] of licoes) {
      expect(['planilha', 'plataforma'], `${nome}`).toContain(licao.programa);
    }
  });

  it('a lição de planilha abre com a pasta montada, e a da plataforma também', () => {
    /* O contexto é um só: a conclusão do requisito 8 é sobre a planilha que a
       pessoa acabou de montar, então toda lição carrega as duas coisas. */
    for (const [nome, licao] of licoes) {
      const c = licao.inicial();
      expect(c.caderno.planilhas.length, `${nome} abre sem pasta`).toBeGreaterThan(1);
      expect(c.base.aceitandoRespostas, `${nome} abre com a base aberta`).toBe(false);
    }
  });

  it('a base não muda entre o começo e a solução de referência', () => {
    /*
      É o assunto da vereda. A tentação de toda análise é mexer no dado até a
      conta ficar bonita, e o requisito 5.6 manda decidir por escrito o que
      fazer com cada valor estranho — não sumir com ele.
    */
    for (const [nome, licao] of licoes) {
      const antes = licao.inicial();
      const depois = SOLUCOES[nome](antes);
      expect(depois.base, `${nome} mexeu na base`).toEqual(antes.base);
    }
  });

  it('o contexto inicial não traz descoberta nenhuma', () => {
    expect(contextoInicial().descobertas).toEqual([]);
    expect(contextoInicial().marcacoes).toEqual({});
    expect(contextoInicial().textos).toEqual({});
  });
});
