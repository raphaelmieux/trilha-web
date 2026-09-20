import { describe, it, expect } from 'vitest';
import {
  type Caderno, type Celula, escrever, mesclar, ordenar,
  preencherAbaixo, preencherADireita, planilhaAtiva,
} from './planilha';
import {
  ABAS, CONSELHEIROS, INSCRITOS, TOTAL_ARRECADADO, TOTAL_DE_DIARIAS,
  VALOR_DA_DIARIA, abaDe, comAba, comCelulas, escritoEm,
  mostradoEm, usaFuncao, type MetaDaPlanilha,
  LINHA_DO_TITULO, LINHA_DO_CABECALHO,
  PRIMEIRA_LINHA_DE_DADO, ULTIMA_LINHA_DE_DADO,
} from './cadernoDoClube';
import {
  METAS_DE_ARRUMAR, cadernoDeArrumar, LARGURA_QUE_CABE, COLUNA_DO_RECADO,
} from './arrumarAsInscricoes';
import {
  METAS_DAS_CONTAS, cadernoDasContas, COLUNA_DO_RESULTADO,
  MEDIA_DE_DIARIAS, MAIOR_DE_DIARIAS, MENOR_DE_DIARIAS,
} from './contasDoAcampamento';
import {
  METAS_DOS_CUSTOS, cadernoDosCustos, PRIMEIRA_LINHA as PRIMEIRA_DE_CUSTO,
  ULTIMA_LINHA as ULTIMA_DE_CUSTO, COLUNA_A_PAGAR,
} from './custosPorInscrito';
import {
  METAS_DAS_UNIDADES, cadernoDasUnidades, FAIXA_DE_PROCURA, DIARIAS_ATE_DOMINGO,
  PRIMEIRA_LINHA as PRIMEIRA_DE_UNIDADE, ULTIMA_LINHA as ULTIMA_DE_UNIDADE,
  COLUNA_DO_CONSELHEIRO, COLUNA_DO_ALMOCO,
} from './unidadesEConselheiros';
import {
  METAS_DO_DESTAQUE, cadernoDoDestaque, DIARIAS_COMPLETAS,
  COLUNA_DA_UNIDADE, COLUNA_DAS_DIARIAS,
} from './destaqueDasInscricoes';
import {
  METAS_DO_ORCAMENTO, cadernoDoOrcamento, TIPO_QUE_RESPONDE,
  PRIMEIRA_LINHA as PRIMEIRA_DE_ORCAMENTO, ULTIMA_LINHA as ULTIMA_DE_ORCAMENTO,
  LINHA_DO_TOTAL, PRIMEIRA_COLUNA_DE_MES, COLUNA_DO_TOTAL,
  TOTAL_POR_CATEGORIA, TOTAL_GERAL,
} from './orcamentoDoClube';
import {
  METAS_DA_CONFERENCIA, cadernoDaConferencia, COLUNA_DO_VALOR,
  COLUNA_DAS_DIARIAS as COLUNA_DAS_DIARIAS_CONF, LINHA_DO_TOTAL_DE_DIARIAS,
} from './conferenciaDaTesouraria';
import {
  LINHA_DO_TEXTO_DISFARCADO, LINHA_DO_TOTAL_CONFERIR, GASTOS, valorEm,
} from './cadernoDoClube';
import { roteiroDaPlanilha } from './roteiroDaPlanilha';

const GASTOS_DA_PRIMEIRA = GASTOS[0];
import { mostrarNumero } from './formulas';

/*
  As quatro primeiras lições da CC-ES003.

  Duas travas valem para todas, e as duas nasceram de erros que já custaram
  caro aqui: nenhuma tarefa pode abrir verde — "laboratório que abre resolvido
  não ensina nada", e o erro é invisível de dentro porque o painel mostra
  exatamente o que se espera de um laboratório funcionando —, e nenhuma pode
  ser impossível, que é pior ainda: quem fez tudo certo fica olhando uma lista
  vermelha sem nada na tela que explique.
*/

const LICOES: { nome: string; metas: MetaDaPlanilha[]; inicial: () => Caderno; resolver: (c: Caderno) => Caderno }[] = [];

/* ── Módulo 1: arrumar as inscrições ──────────────────────────────────────── */

const ABA_1 = 'Inscrições';

function resolverArrumar(cad: Caderno): Caderno {
  let p = abaDe(cad, ABA_1);
  p = { ...p, larguras: p.larguras.map((w, c) => (c === 0 ? LARGURA_QUE_CABE : w)) };
  p = { ...p, alturas: p.alturas.map((h, l) => (l === LINHA_DO_TITULO ? h + 16 : h)) };
  /* Mesclar de A1 até D1 apaga o recado junto, como no Excel: a mesclagem só
     guarda o valor da célula de cima à esquerda. */
  p = mesclar(p, { l1: LINHA_DO_TITULO, c1: 0, l2: LINHA_DO_TITULO, c2: 3 }) ?? p;
  p = comCelulas(p, (cel, l, c) => {
    if (l === LINHA_DO_TITULO && c === 0) return { ...cel, v: 'meio' };
    if (l === LINHA_DO_CABECALHO && c <= 3) return { ...cel, negrito: true, h: 'centro' };
    if (l === ULTIMA_LINHA_DE_DADO + 1 && c <= 3) return { ...cel, texto: '' };
    return cel;
  });
  return comAba(cad, p);
}

LICOES.push({ nome: 'módulo 1 — arrumar as inscrições', metas: METAS_DE_ARRUMAR, inicial: cadernoDeArrumar, resolver: resolverArrumar });

/* ── Módulo 2: as contas ──────────────────────────────────────────────────── */

const faixa = (col: string) => `${col}${PRIMEIRA_LINHA_DE_DADO + 1}:${col}${ULTIMA_LINHA_DE_DADO + 1}`;

function resolverContas(cad: Caderno): Caderno {
  let p = abaDe(cad, ABA_1);
  const formulas = [
    `=SOMA(${faixa('D')})`,
    `=MÉDIA(${faixa('C')})`,
    `=MÁXIMO(${faixa('C')})`,
    `=MÍNIMO(${faixa('C')})`,
    `=CONT.NÚM(${faixa('C')})`,
  ];
  formulas.forEach((f, i) => { p = escrever(p, 1 + i, COLUNA_DO_RESULTADO, f); });
  return comAba(cad, p);
}

LICOES.push({ nome: 'módulo 2 — fórmula e função', metas: METAS_DAS_CONTAS, inicial: cadernoDasContas, resolver: resolverContas });

/* ── Módulo 3: os custos ──────────────────────────────────────────────────── */

function resolverCustos(cad: Caderno): Caderno {
  let p = abaDe(cad, 'Custos');
  p = escrever(p, PRIMEIRA_DE_CUSTO, COLUNA_A_PAGAR, `=B${PRIMEIRA_DE_CUSTO + 1}*B$1`);
  p = preencherAbaixo(p, { l: PRIMEIRA_DE_CUSTO, c: COLUNA_A_PAGAR }, ULTIMA_DE_CUSTO);
  return comAba(cad, p);
}

LICOES.push({ nome: 'módulo 3 — relativa e absoluta', metas: METAS_DOS_CUSTOS, inicial: cadernoDosCustos, resolver: resolverCustos });

/* ── Módulo 4: unidades e conselheiros ────────────────────────────────────── */

function resolverUnidades(cad: Caderno): Caderno {
  let p = abaDe(cad, 'Unidades');
  const n = PRIMEIRA_DE_UNIDADE + 1;
  p = escrever(p, PRIMEIRA_DE_UNIDADE, COLUNA_DO_CONSELHEIRO, `=PROCV(B${n};${FAIXA_DE_PROCURA};2;FALSO)`);
  p = escrever(p, PRIMEIRA_DE_UNIDADE, COLUNA_DO_ALMOCO, `=SE(C${n}>=${DIARIAS_ATE_DOMINGO};"Sim";"Não")`);
  p = preencherAbaixo(p, { l: PRIMEIRA_DE_UNIDADE, c: COLUNA_DO_CONSELHEIRO }, ULTIMA_DE_UNIDADE);
  p = preencherAbaixo(p, { l: PRIMEIRA_DE_UNIDADE, c: COLUNA_DO_ALMOCO }, ULTIMA_DE_UNIDADE);
  return comAba(cad, p);
}

LICOES.push({ nome: 'módulo 4 — decidir e procurar', metas: METAS_DAS_UNIDADES, inicial: cadernoDasUnidades, resolver: resolverUnidades });

/* ── Módulo 5: destacar, congelar, ordenar e filtrar ──────────────────────── */

function resolverDestaque(cad: Caderno): Caderno {
  let p = abaDe(cad, ABA_1);
  p = { ...p, congeladas: 2 };
  p = ordenar(p, COLUNA_DA_UNIDADE, true);
  p = { ...p, filtro: { coluna: COLUNA_DA_UNIDADE, valor: INSCRITOS[0].unidade } };
  p = {
    ...p,
    regras: [{
      id: 'r1',
      /* A faixa para na última linha com dado — é a lição inteira desta
         tarefa: a célula vazia vale zero, e zero é menor que três. */
      faixa: { l1: PRIMEIRA_LINHA_DE_DADO, c1: COLUNA_DAS_DIARIAS, l2: ULTIMA_LINHA_DE_DADO, c2: COLUNA_DAS_DIARIAS },
      quando: 'menorQue',
      valor: String(DIARIAS_COMPLETAS),
      estilo: 'amarelo',
    }],
  };
  return comAba(cad, p);
}

LICOES.push({ nome: 'módulo 5 — ver o que importa', metas: METAS_DO_DESTAQUE, inicial: cadernoDoDestaque, resolver: resolverDestaque });

/* ── Módulo 6: o orçamento e o gráfico ────────────────────────────────────── */

function resolverOrcamento(cad: Caderno): Caderno {
  let p = abaDe(cad, 'Orçamento');
  const col = (c: number) => 'ABCDEFGH'[c];
  p = escrever(p, PRIMEIRA_DE_ORCAMENTO, COLUNA_DO_TOTAL,
    `=SOMA(${col(PRIMEIRA_COLUNA_DE_MES)}${PRIMEIRA_DE_ORCAMENTO + 1}:${col(COLUNA_DO_TOTAL - 1)}${PRIMEIRA_DE_ORCAMENTO + 1})`);
  p = preencherAbaixo(p, { l: PRIMEIRA_DE_ORCAMENTO, c: COLUNA_DO_TOTAL }, ULTIMA_DE_ORCAMENTO);

  p = escrever(p, LINHA_DO_TOTAL, PRIMEIRA_COLUNA_DE_MES,
    `=SOMA(${col(PRIMEIRA_COLUNA_DE_MES)}${PRIMEIRA_DE_ORCAMENTO + 1}:${col(PRIMEIRA_COLUNA_DE_MES)}${ULTIMA_DE_ORCAMENTO + 1})`);
  p = preencherADireita(p, { l: LINHA_DO_TOTAL, c: PRIMEIRA_COLUNA_DE_MES }, COLUNA_DO_TOTAL - 1);

  p = escrever(p, LINHA_DO_TOTAL, COLUNA_DO_TOTAL,
    `=SOMA(${col(COLUNA_DO_TOTAL)}${PRIMEIRA_DE_ORCAMENTO + 1}:${col(COLUNA_DO_TOTAL)}${ULTIMA_DE_ORCAMENTO + 1})`);

  p = {
    ...p,
    grafico: {
      tipo: TIPO_QUE_RESPONDE,
      titulo: 'Para onde foi o dinheiro do acampamento',
      eixoX: 'Categoria',
      eixoY: 'Reais gastos',
      faixa: { l1: PRIMEIRA_DE_ORCAMENTO, c1: 0, l2: ULTIMA_DE_ORCAMENTO, c2: COLUNA_DO_TOTAL },
    },
  };
  return comAba(cad, p);
}

LICOES.push({ nome: 'módulo 6 — orçamento e gráfico', metas: METAS_DO_ORCAMENTO, inicial: cadernoDoOrcamento, resolver: resolverOrcamento });

/* ── Módulo 7: a planilha defeituosa ──────────────────────────────────────── */

const faixaDe = (col: string, a: number, b: number) => `${col}${a + 1}:${col}${b + 1}`;

function resolverConferencia(cad: Caderno): Caderno {
  let p = abaDe(cad, 'Conferir');
  p = escrever(p, LINHA_DO_TOTAL_CONFERIR, COLUNA_DO_VALOR,
    `=SOMA(${faixaDe('D', PRIMEIRA_LINHA_DE_DADO, ULTIMA_LINHA_DE_DADO)})`);
  p = escrever(p, LINHA_DO_TEXTO_DISFARCADO, COLUNA_DO_VALOR,
    String(INSCRITOS[LINHA_DO_TEXTO_DISFARCADO - PRIMEIRA_LINHA_DE_DADO].diarias * VALOR_DA_DIARIA));
  p = escrever(p, LINHA_DO_TOTAL_DE_DIARIAS, COLUNA_DAS_DIARIAS_CONF,
    `=SOMA(${faixaDe('C', PRIMEIRA_LINHA_DE_DADO, ULTIMA_LINHA_DE_DADO)})`);
  return comAba(cad, p);
}

LICOES.push({ nome: 'módulo 7 — a planilha defeituosa', metas: METAS_DA_CONFERENCIA, inicial: cadernoDaConferencia, resolver: resolverConferencia });

/* ── As duas travas de sempre ─────────────────────────────────────────────── */

describe.each(LICOES)('$nome', ({ metas, inicial, resolver }) => {
  it('nenhuma tarefa abre verde', () => {
    const cad = inicial();
    const verdes = metas.filter(m => m.feita(cad)).map(m => m.id);
    expect(verdes, `${verdes.join(', ')} já abrem cumpridas`).toEqual([]);
  });

  it('e nenhuma é impossível: a solução de referência fecha todas', () => {
    const cad = resolver(inicial());
    const abertas = metas.filter(m => !m.feita(cad)).map(m => m.id);
    expect(abertas, `${abertas.join(', ')} continuam abertas numa planilha pronta`).toEqual([]);
  });

  it('toda tarefa tem passo a passo e diz onde começar', () => {
    metas.forEach(m => {
      expect(m.passos.length, `${m.id} sem passo a passo`).toBeGreaterThanOrEqual(3);
      expect(m.onde.trim(), `${m.id} sem onde`).not.toBe('');
      expect(m.detalhe.trim(), `${m.id} sem detalhe`).not.toBe('');
    });
  });

  it('e nenhum id se repete', () => {
    const ids = metas.map(m => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeGreaterThan(0);
  });
});

/* ── A pasta ──────────────────────────────────────────────────────────────── */

describe('a pasta de trabalho é uma só', () => {
  it('toda lição enxerga as mesmas abas', () => {
    LICOES.forEach(({ inicial }) => {
      expect(inicial().planilhas.map(p => p.nome)).toEqual([...ABAS]);
    });
  });

  it('e cada lição abre na aba dela', () => {
    expect(planilhaAtiva(cadernoDeArrumar()).nome).toBe('Inscrições');
    expect(planilhaAtiva(cadernoDosCustos()).nome).toBe('Custos');
    expect(planilhaAtiva(cadernoDasUnidades()).nome).toBe('Unidades');
  });

  /*
    O módulo 2 parte da aba **arrumada**, e não da bagunçada. Começar a segunda
    lição mandando refazer a primeira ensinaria que o trabalho anterior não
    conta — e as quatro tarefas do módulo 1 apareceriam cumpridas ou não ao
    acaso, dependendo de quanto o desbravador tivesse adiantado.
  */
  it('o módulo 2 parte de onde o módulo 1 parou', () => {
    const p = abaDe(cadernoDasContas(), 'Inscrições');
    expect(p.celulas[LINHA_DO_TITULO][0].span).toBe(4);
    expect(p.celulas[LINHA_DO_CABECALHO][0].negrito).toBe(true);
    expect(escritoEm(p, ULTIMA_LINHA_DE_DADO + 1, 0)).toBe('');
    expect(escritoEm(p, LINHA_DO_TITULO, COLUNA_DO_RECADO)).toBe('');
  });
});

/* ── Módulo 1: o que a limpeza não pode aceitar ───────────────────────────── */

describe('arrumar não é apagar', () => {
  /*
    Apagar a tabela inteira deixaria o bloco "só com dado" por não ter dado
    nenhum — a armadilha do "zero link não é zero link quebrado" aplicada a uma
    limpeza. Numa lista de tarefas isso é uma tarefa verde de graça, e a lição
    passa a premiar quem destruiu a planilha.
  */
  it('a tarefa de separar reprova quem apagou os inscritos junto', () => {
    const cad = resolverArrumar(cadernoDeArrumar());
    const separar = METAS_DE_ARRUMAR.find(m => m.id === 'separar')!;
    expect(separar.feita(cad)).toBe(true);

    const vazia = comAba(cad, comCelulas(abaDe(cad, ABA_1), (cel, l, c): Celula => (
      l >= PRIMEIRA_LINHA_DE_DADO && l <= ULTIMA_LINHA_DE_DADO && c <= 3 ? { ...cel, texto: '' } : cel)));
    expect(separar.feita(vazia)).toBe(false);
  });

  it('e o recado e o total sozinhos já reprovam', () => {
    const cad = resolverArrumar(cadernoDeArrumar());
    const separar = METAS_DE_ARRUMAR.find(m => m.id === 'separar')!;
    const comTotal = comAba(cad, escrever(abaDe(cad, ABA_1), ULTIMA_LINHA_DE_DADO + 1, 3, String(TOTAL_ARRECADADO)));
    expect(separar.feita(comTotal)).toBe(false);
    const comRecado = comAba(cad, escrever(abaDe(cad, ABA_1), LINHA_DO_TITULO, COLUNA_DO_RECADO, 'confere aí'));
    expect(separar.feita(comRecado)).toBe(false);
  });
});

/* ── Módulo 2: a fórmula guarda a conta ───────────────────────────────────── */

describe('as contas do acampamento', () => {
  const pronta = () => resolverContas(cadernoDasContas());

  it('os cinco resultados são os dos dados, e não números escritos', () => {
    const p = abaDe(pronta(), ABA_1);
    expect(mostradoEm(p, 1, COLUNA_DO_RESULTADO)).toBe(String(TOTAL_ARRECADADO));
    expect(mostradoEm(p, 2, COLUNA_DO_RESULTADO)).toBe(mostrarNumero(MEDIA_DE_DIARIAS));
    expect(mostradoEm(p, 3, COLUNA_DO_RESULTADO)).toBe(String(MAIOR_DE_DIARIAS));
    expect(mostradoEm(p, 4, COLUNA_DO_RESULTADO)).toBe(String(MENOR_DE_DIARIAS));
    expect(mostradoEm(p, 5, COLUNA_DO_RESULTADO)).toBe(String(INSCRITOS.length));
  });

  /*
    Um total digitado passa pelo número e reprova na tarefa que simula a
    mudança. É a diferença que o requisito 2.2 nomeia, e a única maneira de
    medi-la sem olhar o texto da fórmula.
  */
  it('o total digitado à mão reprova, mesmo sendo o número certo', () => {
    const cad = comAba(pronta(), escrever(abaDe(pronta(), ABA_1), 1, COLUNA_DO_RESULTADO, String(TOTAL_ARRECADADO)));
    expect(METAS_DAS_CONTAS.find(m => m.id === 'viva')!.feita(cad)).toBe(false);
    expect(METAS_DAS_CONTAS.find(m => m.id === 'soma')!.feita(cad)).toBe(false);
  });

  /*
    O intervalo que esquece o último inscrito é o erro de planilha mais comum
    que existe, e o resultado dele é plausível: um total um pouco menor.
  */
  it('e o intervalo que deixa um inscrito de fora também reprova', () => {
    const curta = `=SOMA(D${PRIMEIRA_LINHA_DE_DADO + 1}:D${ULTIMA_LINHA_DE_DADO})`;
    const cad = comAba(pronta(), escrever(abaDe(pronta(), ABA_1), 1, COLUNA_DO_RESULTADO, curta));
    expect(METAS_DAS_CONTAS.find(m => m.id === 'soma')!.feita(cad)).toBe(false);
  });

  it('a máxima e a mínima não podem ser a mesma função', () => {
    const cad = comAba(pronta(), escrever(abaDe(pronta(), ABA_1), 4, COLUNA_DO_RESULTADO, `=MÁXIMO(${faixa('C')})`));
    expect(METAS_DAS_CONTAS.find(m => m.id === 'extremos')!.feita(cad)).toBe(false);
  });
});

/* ── Módulo 3: o cifrão ───────────────────────────────────────────────────── */

describe('a referência que anda e a que fica', () => {
  it('sem o cifrão, arrastar dá zero da segunda linha para baixo', () => {
    let p = abaDe(cadernoDosCustos(), 'Custos');
    p = escrever(p, PRIMEIRA_DE_CUSTO, COLUNA_A_PAGAR, `=B${PRIMEIRA_DE_CUSTO + 1}*B1`);
    p = preencherAbaixo(p, { l: PRIMEIRA_DE_CUSTO, c: COLUNA_A_PAGAR }, ULTIMA_DE_CUSTO);
    expect(mostradoEm(p, PRIMEIRA_DE_CUSTO, COLUNA_A_PAGAR)).toBe(String(INSCRITOS[0].diarias * VALOR_DA_DIARIA));
    expect(mostradoEm(p, PRIMEIRA_DE_CUSTO + 1, COLUNA_A_PAGAR)).toBe('0');
    const cad = comAba(cadernoDosCustos(), p);
    expect(METAS_DOS_CUSTOS.find(m => m.id === 'arrastada')!.feita(cad)).toBe(false);
    expect(METAS_DOS_CUSTOS.find(m => m.id === 'travada')!.feita(cad)).toBe(false);
  });

  /*
    O 45 digitado dentro da fórmula sai com os doze valores certos e passa
    pelas duas primeiras tarefas. Quem pega é a terceira — e a planilha do ano
    que vem, com a diária a 50, sairia inteira errada sem nada acusar.
  */
  it('o 45 digitado dentro da fórmula passa pelo valor e reprova na diária', () => {
    let p = abaDe(cadernoDosCustos(), 'Custos');
    p = escrever(p, PRIMEIRA_DE_CUSTO, COLUNA_A_PAGAR, `=B${PRIMEIRA_DE_CUSTO + 1}*${VALOR_DA_DIARIA}`);
    p = preencherAbaixo(p, { l: PRIMEIRA_DE_CUSTO, c: COLUNA_A_PAGAR }, ULTIMA_DE_CUSTO);
    const cad = comAba(cadernoDosCustos(), p);
    expect(METAS_DOS_CUSTOS.find(m => m.id === 'arrastada')!.feita(cad)).toBe(true);
    expect(METAS_DOS_CUSTOS.find(m => m.id === 'travada')!.feita(cad)).toBe(false);
    expect(METAS_DOS_CUSTOS.find(m => m.id === 'segue')!.feita(cad)).toBe(false);
  });

  it('e B$1 basta, porque a lição arrasta para baixo', () => {
    const cad = resolverCustos(cadernoDosCustos());
    expect(METAS_DOS_CUSTOS.every(m => m.feita(cad))).toBe(true);
  });
});

/* ── Módulo 4: a procura aproximada ───────────────────────────────────────── */

describe('a procura que erra calada', () => {
  const semFalso = () => {
    let p = abaDe(cadernoDasUnidades(), 'Unidades');
    const n = PRIMEIRA_DE_UNIDADE + 1;
    p = escrever(p, PRIMEIRA_DE_UNIDADE, COLUNA_DO_CONSELHEIRO, `=PROCV(B${n};${FAIXA_DE_PROCURA};2)`);
    return preencherAbaixo(p, { l: PRIMEIRA_DE_UNIDADE, c: COLUNA_DO_CONSELHEIRO }, ULTIMA_DE_UNIDADE);
  };

  /*
    A tabela de conselheiros está na ordem em que o clube escreve as unidades,
    e não em ordem alfabética. Com ela ordenada, o FALSO pareceria não fazer
    diferença, e a lição seria sobre um argumento que ninguém precisa escrever.
  */
  it('a tabela de procura não está em ordem alfabética, e é de propósito', () => {
    const nomes = CONSELHEIROS.map(([u]) => u);
    const ordenados = [...nomes].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    expect(nomes).not.toEqual(ordenados);
  });

  it('sem o FALSO, alguns saem #N/D e outros saem com o conselheiro errado', () => {
    const p = semFalso();
    const saida = INSCRITOS.map((_, n) => mostradoEm(p, PRIMEIRA_DE_UNIDADE + n, COLUNA_DO_CONSELHEIRO));
    expect(saida).toContain('#N/D');

    const errados = INSCRITOS.filter((i, n) => {
      const visto = saida[n];
      const certo = CONSELHEIROS.find(([u]) => u === i.unidade)?.[1];
      return visto !== '#N/D' && visto !== certo;
    });
    expect(errados.length, 'nenhum nome plausível e errado: a armadilha sumiu').toBeGreaterThan(0);
  });

  it('e as duas tarefas reprovam', () => {
    const cad = comAba(cadernoDasUnidades(), semFalso());
    expect(METAS_DAS_UNIDADES.find(m => m.id === 'procura')!.feita(cad)).toBe(false);
    expect(METAS_DAS_UNIDADES.find(m => m.id === 'exata')!.feita(cad)).toBe(false);
  });

  it('a condição responde Sim e Não, e os dois aparecem', () => {
    const p = abaDe(resolverUnidades(cadernoDasUnidades()), 'Unidades');
    const saida = INSCRITOS.map((_, n) => mostradoEm(p, PRIMEIRA_DE_UNIDADE + n, COLUNA_DO_ALMOCO));
    expect(new Set(saida)).toEqual(new Set(['Sim', 'Não']));
  });
});

/* ── O nome da função não se acha por pedaço ──────────────────────────────── */

describe('usaFuncao procura o nome seguido de parêntese', () => {
  it('não confunde SOMA com SOMASE', () => {
    expect(usaFuncao('=SOMA(A1:A9)', 'SOMA')).toBe(true);
    expect(usaFuncao('=SOMASE(A1:A9;">1";B1:B9)', 'SOMA')).toBe(false);
    expect(usaFuncao('=SOMASE(A1:A9;">1";B1:B9)', 'SOMASE')).toBe(true);
  });

  it('aceita o nome sem acento e sem ponto, que é o que sai do teclado do celular', () => {
    expect(usaFuncao('=MEDIA(A1:A9)', 'MÉDIA')).toBe(true);
    expect(usaFuncao('=CONT.NUM(A1:A9)', 'CONT.NÚM')).toBe(true);
    expect(usaFuncao('=CONT.VALORES(A1:A9)', 'CONT.NÚM')).toBe(false);
  });

  it('e o número digitado não é função nenhuma', () => {
    expect(usaFuncao(String(TOTAL_DE_DIARIAS), 'SOMA')).toBe(false);
  });
});

/* ── Módulo 5: a faixa da regra, e a ordenação que leva a linha ───────────── */

describe('destacar sem pintar a planilha inteira', () => {
  const ABA_5 = 'Inscrições';

  /*
    A célula vazia vale **zero** na comparação, e zero é menor que três. Uma
    regra pintada sobre a coluna inteira acende a metade em branco dela — e
    uma planilha toda colorida não destaca coisa nenhuma, que é o contrário do
    que a formatação condicional faz.
  */
  it('a regra que passa do fim dos dados acende a coluna em branco, e reprova', () => {
    const cad = resolverDestaque(cadernoDoDestaque());
    expect(METAS_DO_DESTAQUE.find(m => m.id === 'condicional')!.feita(cad)).toBe(true);

    const p = abaDe(cad, ABA_5);
    const esticada = comAba(cad, {
      ...p,
      regras: p.regras.map(r => ({ ...r, faixa: { ...r.faixa, l2: p.celulas.length - 1 } })),
    });
    expect(METAS_DO_DESTAQUE.find(m => m.id === 'condicional')!.feita(esticada)).toBe(false);
  });

  /*
    Uma planilha com as unidades ordenadas e os nomes parados continua com doze
    linhas, doze nomes e doze unidades, todos plausíveis — e o cadastro inteiro
    está trocado. É o estrago mais caro que uma tabela sofre, e não estoura.
  */
  it('ordenar só a coluna da chave reprova, mesmo com a coluna em ordem', () => {
    /*
      A mutação gira a coluna dos nomes uma linha, e deixa tudo o mais como a
      ordenação certa deixou: a coluna Unidade continua em ordem, a marca de
      ordenação continua lá, e a tabela continua com doze linhas plausíveis.
      Só que cada nome está ao lado da unidade de outro — que é exatamente o
      que acontece quando alguém seleciona uma coluna só antes de ordenar.
    */
    const pronta = resolverDestaque(cadernoDoDestaque());
    const p = abaDe(pronta, ABA_5);
    const nomes = INSCRITOS.map((_, n) => escritoEm(p, PRIMEIRA_LINHA_DE_DADO + n, 0));
    const girada = comAba(pronta, comCelulas(p, (cel, l, c): Celula => (
      l >= PRIMEIRA_LINHA_DE_DADO && l <= ULTIMA_LINHA_DE_DADO && c === 0
        ? { ...cel, texto: nomes[(l - PRIMEIRA_LINHA_DE_DADO + 1) % nomes.length] }
        : cel)));

    const meta = METAS_DO_DESTAQUE.find(m => m.id === 'ordenar')!;
    expect(meta.feita(pronta)).toBe(true);
    /* A marca de ordenação e a coluna em ordem continuam lá: quem reprova é a
       linha desfeita, e não a falta de ordenação. */
    expect(abaDe(girada, ABA_5).ordenacao).toEqual(abaDe(pronta, ABA_5).ordenacao);
    expect(meta.feita(girada)).toBe(false);
  });

  it('e um filtro que não esconde ninguém não mostra o que um filtro faz', () => {
    const cad = resolverDestaque(cadernoDoDestaque());
    const p = abaDe(cad, ABA_5);
    const semEfeito = comAba(cad, { ...p, filtro: { coluna: COLUNA_DA_UNIDADE, valor: '' } });
    expect(METAS_DO_DESTAQUE.find(m => m.id === 'filtrar')!.feita(semEfeito)).toBe(false);
  });

  it('congelar prende o título e o cabeçalho, e não uma linha só', () => {
    const cad = resolverDestaque(cadernoDoDestaque());
    const p = abaDe(cad, ABA_5);
    expect(METAS_DO_DESTAQUE.find(m => m.id === 'congelar')!.feita(comAba(cad, { ...p, congeladas: 1 }))).toBe(false);
  });
});

/* ── Módulo 6: o total que começa por igual e mesmo assim é um número parado ─ */

describe('o orçamento sem nenhum total digitado', () => {
  const ABA_6 = 'Orçamento';

  /*
    `=820+910+1180` começa por `=`, devolve o número certo, e é um número
    parado com um sinal na frente. Só a conferência que mexe num gasto pega.
  */
  it('a soma com os números escritos dentro passa pelo valor e reprova na mudança', () => {
    const cad = resolverOrcamento(cadernoDoOrcamento());
    const p = abaDe(cad, ABA_6);
    const chapada = comAba(cad, escrever(p, PRIMEIRA_DE_ORCAMENTO, COLUNA_DO_TOTAL,
      `=${GASTOS_DA_PRIMEIRA.join('+')}`));
    expect(METAS_DO_ORCAMENTO.find(m => m.id === 'porCategoria')!.feita(chapada)).toBe(true);
    expect(METAS_DO_ORCAMENTO.find(m => m.id === 'seguem')!.feita(chapada)).toBe(false);
  });

  it('e o número digitado sem o igual reprova nas duas', () => {
    const cad = resolverOrcamento(cadernoDoOrcamento());
    const p = abaDe(cad, ABA_6);
    const digitado = comAba(cad, escrever(p, PRIMEIRA_DE_ORCAMENTO, COLUNA_DO_TOTAL, String(TOTAL_POR_CATEGORIA[0])));
    expect(METAS_DO_ORCAMENTO.find(m => m.id === 'porCategoria')!.feita(digitado)).toBe(false);
    expect(METAS_DO_ORCAMENTO.find(m => m.id === 'seguem')!.feita(digitado)).toBe(false);
  });

  it('os dois caminhos até o total geral dão o mesmo número', () => {
    const p = abaDe(resolverOrcamento(cadernoDoOrcamento()), ABA_6);
    expect(mostradoEm(p, LINHA_DO_TOTAL, COLUNA_DO_TOTAL)).toBe(String(TOTAL_GERAL));
    expect(TOTAL_POR_CATEGORIA.reduce((s, n) => s + n, 0)).toBe(TOTAL_GERAL);
  });

  /*
    O tipo sai da pergunta, e a pergunta aqui é de composição — para onde vai o
    dinheiro. Pizza responde isso; linha afirmaria que Alimentação virou
    Transporte. Se a tarefa aceitasse qualquer tipo, ela mediria ter clicado em
    Inserir.
  */
  it('o gráfico de linhas desenha sem erro e mesmo assim reprova', () => {
    const cad = resolverOrcamento(cadernoDoOrcamento());
    const p = abaDe(cad, ABA_6);
    const linha = comAba(cad, { ...p, grafico: { ...p.grafico!, tipo: 'linha' } });
    expect(METAS_DO_ORCAMENTO.find(m => m.id === 'grafico')!.feita(linha)).toBe(false);
  });

  it('e gráfico sem título ou sem eixo identificado não afirma nada', () => {
    const cad = resolverOrcamento(cadernoDoOrcamento());
    const p = abaDe(cad, ABA_6);
    const grafico = METAS_DO_ORCAMENTO.find(m => m.id === 'grafico')!;
    expect(grafico.feita(comAba(cad, { ...p, grafico: { ...p.grafico!, titulo: '  ' } }))).toBe(false);
    expect(grafico.feita(comAba(cad, { ...p, grafico: { ...p.grafico!, eixoY: '' } }))).toBe(false);
  });
});

/* ── Módulo 7: os três defeitos, e as três naturezas ──────────────────────── */

describe('a planilha defeituosa tem três defeitos, e três pistas diferentes', () => {
  const ABA_7 = 'Conferir';

  it('a fórmula quebrada é a única que aparece na tela', () => {
    const p = abaDe(cadernoDaConferencia(), ABA_7);
    expect(mostradoEm(p, LINHA_DO_TOTAL_CONFERIR, COLUNA_DO_VALOR)).toBe('#REF!');
  });

  /*
    O número guardado como texto não aparece: na célula ele é igual aos outros
    onze. O que o denuncia são duas coisas independentes — o alinhamento e a
    diferença entre CONT.NÚM e CONT.VALORES. Uma pista sozinha escaparia de
    quem não repara em alinhamento.
  */
  it('o número guardado como texto some na tela, e aparece nas duas contagens', () => {
    const p = abaDe(cadernoDaConferencia(), ABA_7);
    const esperado = String(INSCRITOS[LINHA_DO_TEXTO_DISFARCADO - PRIMEIRA_LINHA_DE_DADO].diarias * VALOR_DA_DIARIA);
    expect(mostradoEm(p, LINHA_DO_TEXTO_DISFARCADO, COLUNA_DO_VALOR)).toBe(esperado);
    expect(valorEm(p, LINHA_DO_TEXTO_DISFARCADO, COLUNA_DO_VALOR).tipo).toBe('texto');

    const faixa = `D${PRIMEIRA_LINHA_DE_DADO + 1}:D${ULTIMA_LINHA_DE_DADO + 1}`;
    const comContagens = escrever(escrever(p, 20, 0, `=CONT.NÚM(${faixa})`), 20, 1, `=CONT.VALORES(${faixa})`);
    expect(mostradoEm(comContagens, 20, 0)).toBe(String(INSCRITOS.length - 1));
    expect(mostradoEm(comContagens, 20, 1)).toBe(String(INSCRITOS.length));
  });

  /*
    Apagar a célula tira o apóstrofo junto, e a coluna fica com onze valores e
    um buraco — o defeito "consertado" virando outro defeito. Por isso a
    conferência pede as duas coisas: sem apóstrofo, **e** com o número lá.
  */
  it('apagar a célula não conserta o número guardado como texto', () => {
    const cad = cadernoDaConferencia();
    const apagada = comAba(cad, escrever(abaDe(cad, ABA_7), LINHA_DO_TEXTO_DISFARCADO, COLUNA_DO_VALOR, ''));
    expect(METAS_DA_CONFERENCIA.find(m => m.id === 'texto')!.feita(apagada)).toBe(false);
  });

  /*
    O total digitado não tem pista nenhuma: está certo hoje. Escrever o número
    certo de novo não é conserto — é o mesmo defeito redigitado.
  */
  it('o total digitado está certo, e redigitá-lo não conserta nada', () => {
    const cad = cadernoDaConferencia();
    const p = abaDe(cad, ABA_7);
    expect(mostradoEm(p, LINHA_DO_TOTAL_DE_DIARIAS, COLUNA_DAS_DIARIAS_CONF)).toBe(String(TOTAL_DE_DIARIAS));
    const redigitado = comAba(cad, escrever(p, LINHA_DO_TOTAL_DE_DIARIAS, COLUNA_DAS_DIARIAS_CONF, String(TOTAL_DE_DIARIAS)));
    expect(METAS_DA_CONFERENCIA.find(m => m.id === 'digitado')!.feita(redigitado)).toBe(false);
  });

  /*
    `=33` começa por igual, devolve o número certo, e é o mesmo número parado
    com um sinal na frente — a irmã do `=820+910+1180` do orçamento. É o único
    caso que a simulação pega sozinha: conferir que a célula começa por `=`
    aprova, e conferir que o valor está certo também.
  */
  it('e o número com um igual na frente também não conserta nada', () => {
    const cad = cadernoDaConferencia();
    const p = abaDe(cad, ABA_7);
    const comIgual = comAba(cad, escrever(p, LINHA_DO_TOTAL_DE_DIARIAS, COLUNA_DAS_DIARIAS_CONF, `=${TOTAL_DE_DIARIAS}`));
    expect(mostradoEm(abaDe(comIgual, ABA_7), LINHA_DO_TOTAL_DE_DIARIAS, COLUNA_DAS_DIARIAS_CONF)).toBe(String(TOTAL_DE_DIARIAS));
    expect(METAS_DA_CONFERENCIA.find(m => m.id === 'digitado')!.feita(comIgual)).toBe(false);
  });

  it('e são exatamente três: nenhum defeito a mais escondido na aba', () => {
    const p = abaDe(cadernoDaConferencia(), ABA_7);
    const comErro: string[] = [];
    const comoTexto: string[] = [];
    p.celulas.forEach((linha, l) => linha.forEach((cel, c) => {
      if (cel.texto.trim() === '') return;
      if (valorEm(p, l, c).tipo === 'erro') comErro.push(`${l}:${c}`);
      if (cel.texto.startsWith("'")) comoTexto.push(`${l}:${c}`);
    }));
    expect(comErro).toHaveLength(1);
    expect(comoTexto).toHaveLength(1);
  });
});

/* ── O roteiro da apresentação ────────────────────────────────────────────── */

describe('o roteiro da apresentação', () => {
  const PRONTAS = [
    abaDe(resolverContas(cadernoDasContas()), 'Inscrições'),
    abaDe(resolverCustos(cadernoDosCustos()), 'Custos'),
    abaDe(resolverUnidades(cadernoDasUnidades()), 'Unidades'),
    abaDe(resolverOrcamento(cadernoDoOrcamento()), 'Orçamento'),
    abaDe(resolverConferencia(cadernoDaConferencia()), 'Conferir'),
  ];

  /*
    A frase de último recurso existe porque a planilha aceita qualquer fórmula
    que o desbravador escreva. Mas nenhuma fórmula **das lições** pode cair
    nela: função nova ensinada sem frase nova sairia no roteiro como "aqui eu
    uso a fórmula =PROCH(...)", que não explica nada — e é o roteiro que o
    requisito 8 existe para preparar.
  */
  it('toda fórmula que as lições produzem tem frase própria', () => {
    const semFrase: string[] = [];
    PRONTAS.forEach(p => roteiroDaPlanilha(p).forEach(passo => {
      if (passo.fala.includes('uso a fórmula')) semFrase.push(passo.formula);
    }));
    expect(semFrase, `sem frase própria: ${semFrase.join(', ')}`).toEqual([]);
  });

  /*
    Doze frases idênticas não são um roteiro: são o que faz alguém parar de
    ler. A coluna preenchida com a alça se apresenta de uma vez.
  */
  it('a coluna arrastada vira uma entrada, e não doze', () => {
    const passos = roteiroDaPlanilha(PRONTAS[1]);
    const daColuna = passos.filter(x => x.onde.startsWith('C'));
    expect(daColuna).toHaveLength(1);
    expect(daColuna[0].onde).toContain(':');
    expect(daColuna[0].fala).toContain('desce até');
  });

  /*
    Ele descreve, e não julga. Julgar a planilha de quem vai apresentá-la é a
    forma mais rápida de a pessoa decorar a nossa opinião em vez de explicar o
    trabalho dela. É a mesma trava do `roteiroDePython`.
  */
  it('e nenhuma frase julga a planilha', () => {
    const julgamento = /\b(melhor|pior|errad|certo|deveria|poderia|ruim|bom|ideal|correto)/i;
    PRONTAS.forEach(p => roteiroDaPlanilha(p).forEach(passo => {
      expect(passo.fala, `${passo.formula} julga`).not.toMatch(julgamento);
    }));
  });

  it('fala em primeira pessoa, porque é para falar em voz alta', () => {
    PRONTAS.forEach(p => roteiroDaPlanilha(p).forEach(passo => {
      expect(passo.fala, passo.formula).toMatch(/\beu\b/);
    }));
  });

  it('e explica o cifrão só onde ele existe', () => {
    const custos = roteiroDaPlanilha(PRONTAS[1])[0];
    expect(custos.fala).toContain('cifrão');
    const soma = roteiroDaPlanilha(PRONTAS[0]).find(x => x.formula.toUpperCase().startsWith('=SOMA'))!;
    expect(soma.fala).not.toContain('cifrão');
  });

  it('a planilha sem fórmula nenhuma dá roteiro vazio, e não uma frase inventada', () => {
    expect(roteiroDaPlanilha(abaDe(cadernoDoOrcamento(), 'Orçamento'))).toEqual([]);
  });
});
