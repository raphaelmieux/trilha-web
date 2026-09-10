import { describe, it, expect } from 'vitest';
import {
  ACAMPAMENTO_INICIAL, METAS_DO_ACAMPAMENTO, INSCRITOS, UNIDADES,
  INSCRICOES_POR_MES, FORMULA_INICIAL, FORMULA_QUE_RESPEITA,
  inscritosNaTela, totalDaCelula, totalNaTela,
  type Acampamento,
} from './planilhaDoAcampamento';

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
    const verdes = METAS_DO_ACAMPAMENTO.filter(m => m.feita(ACAMPAMENTO_INICIAL)).map(m => m.id);
    expect(verdes, `${verdes.join(', ')} já estão cumpridas na planilha inicial`).toEqual([]);
  });

  it('toda meta tem passo a passo', () => {
    const sem = METAS_DO_ACAMPAMENTO.filter(m => m.passos.length < 2).map(m => m.id);
    expect(sem).toEqual([]);
  });

  it('e a planilha abre com a fórmula que não sabe do filtro', () => {
    expect(ACAMPAMENTO_INICIAL.formulaDoTotal).toBe(FORMULA_INICIAL);
    expect(ACAMPAMENTO_INICIAL.filtroLigado).toBe(false);
    expect(ACAMPAMENTO_INICIAL.linhasCongeladas).toBe(0);
    expect(ACAMPAMENTO_INICIAL.grafico).toBeNull();
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

const pronta = (): Acampamento => ({
  ...ACAMPAMENTO_INICIAL,
  filtroLigado: true,
  unidadeFiltrada: 'Falcão',
  formulaDoTotal: FORMULA_QUE_RESPEITA,
  linhasCongeladas: 1,
  grafico: { tipo: 'linha', titulo: 'Inscrições de janeiro a junho', eixos: true },
});

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
  const filtrada: Acampamento = { ...ACAMPAMENTO_INICIAL, filtroLigado: true, unidadeFiltrada: 'Falcão' };

  it('as linhas escondidas continuam existindo', () => {
    expect(inscritosNaTela(filtrada).length).toBeLessThan(filtrada.inscritos.length);
    expect(filtrada.inscritos).toHaveLength(120);
  });

  it('a célula do total e o rodapé mostram números diferentes', () => {
    expect(totalDaCelula(filtrada)).toBeGreaterThan(totalNaTela(filtrada));
  });

  it('e com SUBTOTAL eles passam a bater', () => {
    const corrigida: Acampamento = { ...filtrada, formulaDoTotal: FORMULA_QUE_RESPEITA };
    expect(totalDaCelula(corrigida)).toBe(totalNaTela(corrigida));
  });

  /*
    Escrever SUBTOTAL sem nunca ter filtrado não fecha a tarefa.

    A lição inteira é a diferença entre os dois números, e ela só existe com
    filtro aplicado — trocar a fórmula numa planilha sem filtro é trocar uma
    coisa que não estava errada.
  */
  it('SUBTOTAL sem filtro nenhum não fecha a tarefa', () => {
    const semFiltro: Acampamento = { ...ACAMPAMENTO_INICIAL, formulaDoTotal: FORMULA_QUE_RESPEITA };
    expect(METAS_DO_ACAMPAMENTO.find(m => m.id === 'soma')!.feita(semFiltro)).toBe(false);
  });

  it('e a SOMA com filtro também não', () => {
    expect(METAS_DO_ACAMPAMENTO.find(m => m.id === 'soma')!.feita(filtrada)).toBe(false);
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

  for (const tipo of ['pizza', 'barras', 'dispersao'] as const) {
    it(`${tipo} não fecha a tarefa`, () => {
      expect(meta.feita({ ...pronta(), grafico: { tipo, titulo: 'Inscrições', eixos: true } })).toBe(false);
    });
  }

  it('linha fecha', () => {
    expect(meta.feita(pronta())).toBe(true);
  });
});

/* Gráfico sem título e sem eixo é um desenho que não afirma nada. */
describe('o gráfico precisa dizer o que mede', () => {
  const meta = METAS_DO_ACAMPAMENTO.find(m => m.id === 'rotulos')!;

  it('sem título não fecha', () => {
    expect(meta.feita({ ...pronta(), grafico: { tipo: 'linha', titulo: '', eixos: true } })).toBe(false);
  });

  it('sem eixos identificados não fecha', () => {
    expect(meta.feita({ ...pronta(), grafico: { tipo: 'linha', titulo: 'Inscrições', eixos: false } })).toBe(false);
  });

  it('e sem gráfico nenhum não fecha', () => {
    expect(meta.feita({ ...pronta(), grafico: null })).toBe(false);
  });
});
