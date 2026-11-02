import { describe, it, expect } from 'vitest';
import { MODULOS_DE_PLANILHA } from './planilhas';
import type { TopicoDeVereda } from './veredas';
import { transporFormula, mostrar, valorDaFormula, type Bruto } from '../labs/formulas';
import { vazia, alinhamentoDe, valorCalculado, planilhaPorNome, type Caderno } from '../labs/planilha';
import {
  CATEGORIAS as CATEGORIAS_DO_LAB, CONSELHEIROS, GASTOS as GASTOS_DO_LAB, INSCRITOS, VALOR_DA_DIARIA, cadernoDoClube,
} from '../labs/cadernoDoClube';
import {
  CHAMADA, GASTOS, ONIBUS, PAGO_COMO_TEXTO, PARTICIPANTES, VALOR_DA_REFEICAO, pastaDaExcursao, totalDeRefeicoes,
} from '../exemplos/excursaoDeOutubro';

/*
  O que as telas da CC-ES003 afirmam, conferido pelo motor que o laboratório
  usa.

  É a trava de `exemplosDePython.test.ts`, pelo motivo escrito lá: escrever o
  resultado de cabeça erra por pouco e com frequência, nada estoura, e quem
  confere a **própria** planilha contra um exemplo errado conclui que a dele é
  que está errada. Aqui o resultado sai de `formulas.ts`, que é o mesmo motor
  que responde ao desbravador — lição e laboratório não podem discordar.

  As telas fotografam a pasta da excursão de outubro, e é contra ela que as
  legendas se conferem: a **conta** se faz aqui, sobre a pasta, e a
  **afirmação** se lê da lição. O número que a tela mostra nunca é o número
  que o teste escreveu, e mudar a pasta sem refazer as telas reprova — que é
  a falha certa, porque a imagem continuaria mostrando a pasta antiga.

  A última parte reprova se a pasta da excursão passar a se parecer com a do
  acampamento, que é a do laboratório: lá tudo é resposta.
*/

const topicos = (): TopicoDeVereda[] =>
  MODULOS_DE_PLANILHA.flatMap(m =>
    m.licoes.flatMap(l => (l.tipo === 'teoria' ? l.topicos : [])));

/** O que a lição diz: a prosa e o que as telas dizem em legenda e descrição. */
function textoDoTopico(id: string): string {
  const t = topicos().find(x => x.id === id);
  if (!t) throw new Error(`O tópico ${id} sumiu da vereda.`);
  return [t.resumo, ...t.explicacao, t.exemplo ?? '', t.atencao ?? '', ...(t.telas ?? []).flatMap(x => [x.legenda, x.descricao])].join('\n');
}

/** O que uma célula da pasta mostra, pelo nome da aba e da célula. */
function mostrado(cad: Caderno, aba: string, nome: string): string {
  const p = planilhaPorNome(cad, aba);
  if (!p) throw new Error(`A aba ${aba} sumiu da pasta da excursão.`);
  const m = /^([A-Z])(\d+)$/.exec(nome)!;
  const l = Number(m[2]) - 1;
  const c = m[1].charCodeAt(0) - 65;
  return mostrar(valorCalculado(p, l, c, cad), p.celulas[l][c].formato);
}

/** A pasta com uma célula escrita de outro jeito: o que a tela faz depois de digitar. */
function comEscrito(cad: Caderno, aba: string, escritos: Record<string, string>): Caderno {
  return {
    ...cad,
    planilhas: cad.planilhas.map(p => (p.nome !== aba ? p : {
      ...p,
      celulas: p.celulas.map((linha, l) => linha.map((cel, c) => {
        const nome = `${String.fromCharCode(65 + c)}${l + 1}`;
        return nome in escritos ? { ...cel, texto: escritos[nome] } : cel;
      })),
    })),
  };
}

describe('as telas da CC-ES003 contam a pasta que fotografam', () => {
  const pasta = pastaDaExcursao({ aba: 'Excursão' });

  it('dezoito tópicos ensinam um gesto, e os dezoito têm tela', () => {
    /* A guarda contra o vazio: sem telas, toda trava abaixo leria texto vazio
       e passaria por não ter o que conferir. */
    expect(topicos().filter(t => t.telas?.length)).toHaveLength(18);
    expect(topicos().some(t => t.exemplo)).toBe(false);
  });

  it('a seleção de D3 a D12 soma o que a régua diz', () => {
    const soma = PARTICIPANTES.reduce((s, p) => s + p.refeicoes * VALOR_DA_REFEICAO, 0);
    expect(textoDoTopico('celula-e-intervalo')).toContain(`soma ${soma}`);
    expect(textoDoTopico('celula-e-intervalo')).toMatch(/dez células/);
    expect(PARTICIPANTES).toHaveLength(10);
  });

  it('a refeição de 18 para 20 leva a Alice de 72 para 80', () => {
    expect(mostrado(pasta, 'Lanche', 'C4')).toBe('72');
    expect(mostrado(comEscrito(pasta, 'Lanche', { B1: '20' }), 'Lanche', 'C4')).toBe('80');
    expect(PARTICIPANTES[0].nome).toMatch(/^Alice/);
    expect(textoDoTopico('formula')).toMatch(/de 18 para 20.*de 72 para 80/s);
  });

  it('média, máximo e mínimo das refeições dão o que a tela mostra', () => {
    const cad = comEscrito(pasta, 'Excursão', {
      G3: '=MÉDIA(C3:C12)', G4: '=MÁXIMO(C3:C12)', G5: '=MÍNIMO(C3:C12)',
    });
    const tres = ['G3', 'G4', 'G5'].map(n => mostrado(cad, 'Excursão', n));
    expect(textoDoTopico('funcao')).toContain(`${tres[0]}, ${tres[1]} e ${tres[2]}`);
  });

  it('as duas contagens discordam por exatamente um, e o um é o pagamento do Benício', () => {
    const cad = pastaDaExcursao({ aba: 'Conferir' });
    expect(mostrado(cad, 'Conferir', 'G1')).toBe('9');
    expect(mostrado(cad, 'Conferir', 'G2')).toBe('10');
    expect(PARTICIPANTES[PAGO_COMO_TEXTO - 3].nome).toMatch(/^Benício/);
    expect(textoDoTopico('as-duas-contagens')).toMatch(/Dez células.*só nove números.*Benício/s);
  });

  it('a alça leva =B4*B$1 de C4 a =B9*B$1 em C9', () => {
    expect(transporFormula('=B4*B$1', 5, 0)).toBe('=B9*B$1');
    expect(textoDoTopico('referencia-relativa')).toContain('=B9*B$1');
  });

  it('sem cifrão, C6 lê o rótulo e as três seguintes multiplicam gente por gente', () => {
    const escritos: Record<string, string> = {};
    for (let l = 4; l <= 13; l++) escritos[`C${l}`] = transporFormula('=B4*B1', l - 4, 0);
    const cad = comEscrito(pastaDaExcursao({ aba: 'Lanche', lanchePreenchido: false }), 'Lanche', escritos);
    expect(escritos.C6).toBe('=B6*B3');
    expect(mostrado(cad, 'Lanche', 'C6')).toBe('#VALOR!');
    const tres = ['C7', 'C8', 'C9'].map(n => mostrado(cad, 'Lanche', n));
    expect(textoDoTopico('referencia-absoluta')).toContain(`${tres.join(', ')}.`);
  });

  it('a procura exata põe a Tucano no ônibus da tabela, e a aproximada no errado', () => {
    const exata = pastaDaExcursao({ aba: 'Ônibus' });
    const aproximada = pastaDaExcursao({ aba: 'Ônibus', procuraExata: false });
    const daTucano = ONIBUS.find(([u]) => u === 'Tucano')![1];
    expect(PARTICIPANTES[0].unidade).toBe('Tucano');

    expect(mostrado(exata, 'Ônibus', 'D2')).toBe(daTucano);
    expect(textoDoTopico('funcao-de-procura')).toContain(`a Tucano vai no ${daTucano}`);

    /* O caso caro: um ônibus de verdade, que não é o dela. */
    const errado = mostrado(aproximada, 'Ônibus', 'D2');
    expect(errado).not.toBe(daTucano);
    expect(errado).toMatch(/^Ônibus \d$/);
    expect(mostrado(aproximada, 'Ônibus', 'D3')).toBe('#N/D');
    expect(PARTICIPANTES[1].unidade).toBe('Falcão');
    const texto = textoDoTopico('quarto-argumento');
    expect(texto).toContain(`aparece no ${errado}`);
    expect(texto).toContain(`a tabela, ao lado, diz ${daTucano}`);
    expect(texto).toMatch(/o Falcão dá #N\/D/);
  });

  it('a regra de menor que 3 acende exatamente duas pessoas', () => {
    expect(PARTICIPANTES.filter(p => p.refeicoes < 3)).toHaveLength(2);
    expect(PARTICIPANTES.filter(p => p.refeicoes < 3).every(p => p.refeicoes === 2)).toBe(true);
    expect(textoDoTopico('formatacao-condicional')).toMatch(/as duas pessoas com duas refeições/);
  });

  it('o filtro da Tucano deixa à vista as linhas 3 e 7', () => {
    const linhas = PARTICIPANTES.map((p, i) => [p.unidade, i + 3] as const)
      .filter(([u]) => u === 'Tucano').map(([, l]) => l);
    expect(linhas).toEqual([3, 7]);
    expect(textoDoTopico('filtro-e-ordenacao')).toMatch(/Só as duas da Tucano.*de 3 para 7 e para 13/s);
  });

  it('a chamada é longa o bastante para o cabeçalho sumir ao rolar', () => {
    /* Uma tela de notebook mostra umas vinte linhas da grade. */
    expect(CHAMADA.length).toBeGreaterThan(40);
    expect(new Set(CHAMADA.map(c => c.presencas)).size).toBeGreaterThan(3);
  });

  it('o total geral fecha pelos dois caminhos, e o ônibus é a maior parte', () => {
    const cad = pastaDaExcursao({ aba: 'Orçamento' });
    const total = mostrado(cad, 'Orçamento', 'E7');
    expect(GASTOS.flat().reduce((a, b) => a + b, 0)).toBe(Number(total));
    expect(['B7', 'C7', 'D7'].map(n => Number(mostrado(cad, 'Orçamento', n))).reduce((a, b) => a + b, 0))
      .toBe(Number(total));
    expect(textoDoTopico('orcamento')).toContain(`E7, é a soma da coluna de totais: ${total}`);

    const porCategoria = GASTOS.map(g => g.reduce((a, b) => a + b, 0));
    expect(porCategoria.indexOf(Math.max(...porCategoria))).toBe(0);
    expect(textoDoTopico('titulo-e-eixos')).toMatch(/o ônibus foi a maior parte/);
  });

  it('os três defeitos da conferência são os que as telas mostram', () => {
    const cad = pastaDaExcursao({ aba: 'Conferir' });
    const p = planilhaPorNome(cad, 'Conferir')!;
    expect(p.celulas[3][3].texto).toBe(`'72`);
    expect(mostrado(cad, 'Conferir', 'D14')).toBe('#REF!');
    expect(p.celulas[14][2].texto).toBe(String(totalDeRefeicoes()));
    expect(textoDoTopico('tres-defeitos')).toContain(`mostra ${totalDeRefeicoes()}, e a barra também`);
  });
});

describe('o que o motor promete à teoria', () => {
  const grade = (celulas: Record<string, string>): Bruto => (l, c) =>
    celulas[`${String.fromCharCode(65 + c)}${l + 1}`] ?? '';

  /*
    O alinhamento é a outra pista do número guardado como texto, e a primeira
    que se vê: a legenda das contagens diz que o 72 do Benício encosta à
    esquerda. É o **valor** que decide o lado, nunca o que a célula imprime —
    as duas imprimem `72`. Era assim que a pista não existia na tela: o motor
    entendia texto, e o alinhamento reperguntava ao texto impresso, que já
    tinha perdido a resposta.
  */
  it('o número guardado como texto encosta à esquerda, e o número à direita', () => {
    const comoNumero = valorDaFormula(grade({ D3: '72' }), '=D3');
    const comoTexto = valorDaFormula(grade({ D3: `'72` }), '=D3');
    expect(mostrar(comoNumero)).toBe(mostrar(comoTexto));
    expect(alinhamentoDe(vazia(), comoNumero)).toBe('direita');
    expect(alinhamentoDe(vazia(), comoTexto)).toBe('esquerda');
  });

  it('a soma pula o número guardado como texto', () => {
    const coluna = grade(Object.fromEntries(
      Array.from({ length: 10 }, (_, i) => [`D${i + 3}`, i === 1 ? `'72` : '72'])));
    expect(valorDaFormula(coluna, '=SOMA(D3:D12)')).toEqual({ tipo: 'numero', n: 9 * 72 });
  });
});

describe('a pasta da excursão não é a do laboratório', () => {
  const teoria = () => topicos().map(t => textoDoTopico(t.id)).join('\n');

  it('nenhum participante, unidade-par ou valor de referência coincide', () => {
    const nomesDoLab = new Set(INSCRITOS.map(i => i.nome));
    expect(PARTICIPANTES.filter(p => nomesDoLab.has(p.nome))).toEqual([]);
    expect(CHAMADA.filter(c => nomesDoLab.has(c.nome))).toEqual([]);
    expect(VALOR_DA_REFEICAO).not.toBe(VALOR_DA_DIARIA);
    /* A procura ensina a mesma armadilha com outra tabela: o par
       unidade-conselheiro é resposta do módulo 4, e aqui o que se traz é o
       ônibus. */
    expect(ONIBUS.map(([, o]) => o).some(o => CONSELHEIROS.some(([, c]) => c === o))).toBe(false);
    expect(GASTOS.flat().join()).not.toBe(GASTOS_DO_LAB.flat().join());
    expect(cadernoDoClube().planilhas.map(p => p.nome)).not.toContain('Excursão');
    expect(CATEGORIAS_DO_LAB).not.toContain('Entrada do parque');
  });

  it('a teoria não cita a pasta do acampamento', () => {
    const texto = teoria();
    const doLab = [
      ...INSCRITOS.map(i => i.nome),
      ...CONSELHEIROS.map(([, c]) => c),
      GASTOS_DO_LAB[0].join('+'),
      `*${VALOR_DA_DIARIA}`,
      `${VALOR_DA_DIARIA} dentro`,
    ];
    expect(doLab.filter(d => texto.includes(d))).toEqual([]);
  });
});
