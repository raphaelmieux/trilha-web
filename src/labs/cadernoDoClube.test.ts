import { describe, it, expect } from 'vitest';
import {
  type Caderno, type Celula, escrever, mesclar, preencherAbaixo, planilhaAtiva,
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
