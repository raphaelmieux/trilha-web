import { describe, it, expect } from 'vitest';
import {
  METAS_DO_ACAMPAMENTO, INSCRITOS, UNIDADES,
  INSCRICOES_POR_MES, FORMULA_INICIAL, FORMULA_QUE_RESPEITA,
  CELULA_DO_TOTAL, ABA_DOS_INSCRITOS, ABA_DOS_MESES, COLUNA_DA_UNIDADE,
  acampamentoInicial, inscritosVisiveis, totalDaCelula, totalNaTela,
} from './planilhaDoAcampamento';
import { type Caderno, type Grafico, type Planilha, contaDaSelecao } from './planilha';

/** A pasta com uma aba mexida. */
const comAba = (cad: Caderno, i: number, f: (p: Planilha) => Planilha): Caderno =>
  ({ ...cad, planilhas: cad.planilhas.map((q, j) => (j === i ? f(q) : q)) });
const comInscritos = (cad: Caderno, f: (p: Planilha) => Planilha) => comAba(cad, ABA_DOS_INSCRITOS, f);
const comTotal = (cad: Caderno, formula: string) => comInscritos(cad, p => ({
  ...p,
  celulas: p.celulas.map((l, i) => (i === CELULA_DO_TOTAL.l
    ? l.map((c, j) => (j === CELULA_DO_TOTAL.c ? { ...c, texto: formula } : c)) : l)),
}));
const filtrada = (cad: Caderno, unidade = 'Falcão') =>
  comInscritos(cad, p => ({ ...p, filtro: { coluna: COLUNA_DA_UNIDADE, valor: unidade } }));
const comGrafico = (cad: Caderno, g: Partial<Grafico> | null) => comAba(cad, ABA_DOS_MESES, p => ({
  ...p,
  grafico: g ? {
    tipo: 'linha', titulo: 'Inscrições de janeiro a junho', eixoX: 'Mês', eixoY: 'Inscritos',
    faixa: { l1: 0, c1: 0, l2: 6, c2: 1 }, ...g,
  } : null,
}));

/*
  O laboratório de planilha avançada abre com tudo por fazer.

  Aqui a planilha **já existe e já está certa** — cento e vinte inscrições
  digitadas, total somando —, o que é a forma mais fácil de escrever uma tarefa
  que nasce verde: nada parece faltar. O que falta é o que só se descobre
  usando: o filtro que ninguém ligou, o cabeçalho que some ao rolar, e o total
  que continua contando as linhas escondidas.
*/

describe('nenhuma tarefa do laboratório de planilha nasce verde', () => {
  it('a planilha abre com as cinco por fazer', () => {
    const verdes = METAS_DO_ACAMPAMENTO.filter(m => m.feita(acampamentoInicial())).map(m => m.id);
    expect(verdes, `${verdes.join(', ')} já estão cumpridas na planilha inicial`).toEqual([]);
  });

  it('toda meta tem passo a passo', () => {
    const sem = METAS_DO_ACAMPAMENTO.filter(m => m.passos.length < 2).map(m => m.id);
    expect(sem).toEqual([]);
  });

  it('e a planilha abre com a fórmula que não sabe do filtro, em D123', () => {
    const cad = acampamentoInicial();
    const p = cad.planilhas[ABA_DOS_INSCRITOS];
    expect(p.celulas[CELULA_DO_TOTAL.l][CELULA_DO_TOTAL.c].texto).toBe(FORMULA_INICIAL);
    expect(p.filtro).toBeNull();
    expect(p.congeladas).toBe(0);
    expect(cad.planilhas[ABA_DOS_MESES].grafico).toBeNull();
  });

  /* O filtro esconde a linha inteira: os meses ao lado da lista sumiriam
     junto, e o gráfico perderia pontos sem explicação. */
  it('os meses moram em outra aba, longe do que o filtro esconde', () => {
    const cad = acampamentoInicial();
    expect(cad.planilhas[ABA_DOS_MESES].nome).toBe('Por mês');
    const lista = cad.planilhas[ABA_DOS_INSCRITOS];
    expect(lista.celulas.some(l => l.some(c => c.texto === 'Janeiro'))).toBe(false);
  });
});

/*
  Cento e vinte linhas, e não doze.

  A lição de teoria fala em cento e vinte, e uma planilha de doze linhas não faz
  ninguém sentir falta do filtro — rolar com o olho ainda daria. É também o que
  faz o cabeçalho sair da tela, que é a razão de congelar existir.
*/
describe('a planilha é grande o bastante para o filtro fazer falta', () => {
  it('tem cento e vinte inscritos', () => {
    expect(INSCRITOS).toHaveLength(120);
  });

  it('e mais de uma unidade, senão filtrar não mostraria nada de diferente', () => {
    expect(new Set(INSCRITOS.map(i => i.unidade)).size).toBe(UNIDADES.length);
    expect(UNIDADES.length).toBeGreaterThanOrEqual(2);
  });

  it('os meses crescem, que é o que o gráfico de linha tem para mostrar', () => {
    const totais = INSCRICOES_POR_MES.map(m => m.total);
    expect(totais).toEqual([...totais].sort((a, b) => a - b));
    expect(new Set(totais).size, 'meses todos iguais não mostram evolução nenhuma').toBe(totais.length);
  });
});

/* ── A planilha pronta ─────────────────────────────────────────────────────── */

const pronta = (): Caderno => comGrafico(
  comInscritos(comTotal(filtrada(acampamentoInicial()), FORMULA_QUE_RESPEITA), p => ({ ...p, congeladas: 1 })),
  {},
);

describe('toda tarefa do laboratório de planilha tem como ser vencida', () => {
  it('a planilha pronta fecha as cinco', () => {
    const abertas = METAS_DO_ACAMPAMENTO.filter(m => !m.feita(pronta())).map(m => m.id);
    expect(abertas, `${abertas.join(', ')} continuam abertas numa planilha pronta`).toEqual([]);
  });
});

/*
  Filtro esconde, e não apaga — e a soma não se importa com ele.

  É a consequência que ninguém conta, e o motivo de a tarefa da soma existir.
  Quem lê o total da célula com filtro aplicado lê um número que não
  corresponde ao que está vendo, e manda esse número para a liderança.
*/
describe('filtro esconde, e a SOMA continua somando o escondido', () => {
  const comFiltro = filtrada(acampamentoInicial());
  const meta = METAS_DO_ACAMPAMENTO.find(m => m.id === 'soma')!;

  it('as linhas escondidas continuam existindo', () => {
    expect(inscritosVisiveis(comFiltro)).toBeLessThan(INSCRITOS.length);
    expect(comFiltro.planilhas[ABA_DOS_INSCRITOS].celulas[120][0].texto).toBe('Inscrito 120');
  });

  it('a célula do total e a soma do que está à vista mostram números diferentes', () => {
    expect(totalDaCelula(comFiltro)!).toBeGreaterThan(totalNaTela(comFiltro));
  });

  /* A barra de status é o segundo número: ela soma a seleção pulando o que o
     filtro escondeu, que é o que o Excel faz. */
  it('a barra de status soma só o que está à vista', () => {
    const p = comFiltro.planilhas[ABA_DOS_INSCRITOS];
    const conta = contaDaSelecao(p, { l1: 1, c1: 3, l2: 120, c2: 3 });
    expect(conta?.soma).toBe(totalNaTela(comFiltro));
    expect(conta?.contagem).toBe(inscritosVisiveis(comFiltro));
  });

  it('e com SUBTOTAL eles passam a bater', () => {
    const corrigida = comTotal(comFiltro, FORMULA_QUE_RESPEITA);
    expect(totalDaCelula(corrigida)).toBe(totalNaTela(corrigida));
    expect(meta.feita(corrigida)).toBe(true);
  });

  /*
    Escrever SUBTOTAL sem nunca ter filtrado não fecha a tarefa.

    A lição inteira é a diferença entre os dois números, e ela só existe com
    filtro aplicado — trocar a fórmula numa planilha sem filtro é trocar uma
    coisa que não estava errada.
  */
  it('SUBTOTAL sem filtro nenhum não fecha a tarefa', () => {
    expect(meta.feita(comTotal(acampamentoInicial(), FORMULA_QUE_RESPEITA))).toBe(false);
  });

  it('e a SOMA com filtro também não', () => {
    expect(meta.feita(comFiltro)).toBe(false);
  });

  /* Uma faixa curta pode, por acaso, somar o mesmo que as linhas visíveis de
     uma unidade; tirar o filtro dentro da conferência é o que a denuncia. */
  it('SUBTOTAL sobre parte da coluna não fecha', () => {
    expect(meta.feita(comTotal(comFiltro, '=SUBTOTAL(109;D2:D60)'))).toBe(false);
  });

  it('e o número digitado igual ao da tela também não', () => {
    expect(meta.feita(comTotal(comFiltro, String(totalNaTela(comFiltro))))).toBe(false);
  });

  it('o 9 também vale: o filtro esconde para os dois códigos', () => {
    expect(meta.feita(comTotal(comFiltro, '=SUBTOTAL(9;D2:D121)'))).toBe(true);
  });
});

/*
  O tipo do gráfico sai da pergunta, e a pergunta aqui é de evolução.

  Pizza responde composição e colunas respondem comparação: nenhuma das duas
  mostra que março veio depois de fevereiro. Se a meta aceitasse qualquer tipo,
  a tarefa mediria ter clicado em Inserir.
*/
describe('só o gráfico que responde a pergunta conta', () => {
  const meta = METAS_DO_ACAMPAMENTO.find(m => m.id === 'grafico')!;

  for (const tipo of ['pizza', 'colunas', 'dispersao'] as const) {
    it(`${tipo} não fecha a tarefa`, () => {
      expect(meta.feita(comGrafico(pronta(), { tipo }))).toBe(false);
    });
  }

  it('linha fecha', () => {
    expect(meta.feita(pronta())).toBe(true);
  });

  it('linha sobre três meses não fecha: não é a subida de janeiro a junho', () => {
    expect(meta.feita(comGrafico(pronta(), { faixa: { l1: 0, c1: 0, l2: 3, c2: 1 } }))).toBe(false);
  });
});

/* Gráfico sem título e sem eixo é um desenho que não afirma nada. */
describe('o gráfico precisa dizer o que mede', () => {
  const meta = METAS_DO_ACAMPAMENTO.find(m => m.id === 'rotulos')!;

  it('sem título não fecha', () => {
    expect(meta.feita(comGrafico(pronta(), { titulo: '' }))).toBe(false);
  });

  it('com um eixo só não fecha', () => {
    expect(meta.feita(comGrafico(pronta(), { eixoY: '' }))).toBe(false);
  });

  it('e sem gráfico nenhum não fecha', () => {
    expect(meta.feita(comGrafico(pronta(), null))).toBe(false);
  });
});
