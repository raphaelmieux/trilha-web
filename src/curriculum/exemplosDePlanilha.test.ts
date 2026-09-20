import { describe, it, expect } from 'vitest';
import { MODULOS_DE_PLANILHA } from './planilhas';
import type { TopicoDeVereda } from './veredas';
import {
  valorDaFormula, transporFormula, mostrar, colunaDoNome,
  type Bruto,
} from '../labs/formulas';
import { vazia, alinhamentoDe } from '../labs/planilha';

/*
  Os exemplos da teoria da CC-ES003, conferidos pelo motor que o laboratório
  usa.

  É a mesma trava de `exemplosDePython.test.ts`, pelo mesmo motivo escrito lá:
  escrever o resultado de cabeça erra por pouco e com frequência, nada estoura,
  e quem confere a **própria** planilha contra um exemplo errado conclui que a
  planilha dele é que está errada. Lá o resultado sai do CPython do navegador;
  aqui sai de `formulas.ts`, que é o mesmo motor que responde ao desbravador
  quando ele digita a fórmula — então lição e laboratório não podem discordar.

  A diferença para a de Python é o contexto. Um programa traz tudo consigo; uma
  fórmula só significa alguma coisa sobre uma planilha, e a planilha do exemplo
  está **desenhada** no texto. Ler o desenho seria máquina frágil que um dia
  para de achar o que procura e aprova tudo calada, então a divisão é esta: a
  **grade** se declara aqui, e a **afirmação** se lê da lição. Assim o número
  que a tela mostra nunca é o número que o teste escreveu, e mudar o desenho
  sem mudar a conta reprova — que é a falha certa.
*/

const topicos = (): TopicoDeVereda[] =>
  MODULOS_DE_PLANILHA.flatMap(m =>
    m.licoes.flatMap(l => (l.tipo === 'teoria' ? l.topicos : [])));

const topico = (id: string): TopicoDeVereda => {
  const t = topicos().find(x => x.id === id);
  if (!t) throw new Error(`O tópico ${id} sumiu da vereda.`);
  return t;
};

/** As linhas de um exemplo, sem o recuo do desenho. */
const linhas = (id: string) => topico(id).exemplo.split('\n').map(l => l.trim());

/*
  Uma grade a partir de células escritas em nome de planilha ("D3"), que é como
  a lição as chama. O motor conta de zero; a lição conta de um, como a tela.
*/
const grade = (celulas: Record<string, string>): Bruto => {
  const porPosicao = new Map<string, string>();
  for (const [nome, texto] of Object.entries(celulas)) {
    const m = /^([A-Z]+)(\d+)$/.exec(nome);
    if (!m) throw new Error(`Nome de célula inválido no teste: ${nome}`);
    porPosicao.set(`${Number(m[2]) - 1},${colunaDoNome(m[1])}`, texto);
  }
  return (linha, coluna) => porPosicao.get(`${linha},${coluna}`) ?? '';
};

describe('os exemplos da teoria da CC-ES003', () => {
  /*
    A coluna de doze do tópico das contagens: onze números e um número
    guardado como texto, que é o defeito que o requisito 7 manda achar. O
    apóstrofo é o gesto do Excel para dizer "isto é texto", e é ele que faz a
    `CONT.NÚM` contar um a menos sem nada aparecer na tela.
  */
  const DOZE_COM_UM_DE_TEXTO = grade(Object.fromEntries(
    Array.from({ length: 12 }, (_, i) => [`D${i + 3}`, i === 6 ? `'1620` : '135']),
  ));

  it('as duas contagens dão o que a lição diz que elas dão', () => {
    const afirmacoes = linhas('as-duas-contagens')
      .map(l => /^(=[^→]+?)\s*→\s*(.+)$/.exec(l))
      .filter((m): m is RegExpExecArray => m !== null);

    /*
      A guarda contra o vazio, que é a de sempre: um exemplo reescrito sem as
      setas deixaria este teste verde por não ter conferido nada — que é a
      armadilha do "zero link não é zero link quebrado" aplicada à trava.
    */
    expect(afirmacoes).toHaveLength(2);

    for (const [, formula, esperado] of afirmacoes) {
      expect(mostrar(valorDaFormula(DOZE_COM_UM_DE_TEXTO, formula)))
        .toBe(esperado.trim());
    }
  });

  it('a diferença entre as duas é o que a lição promete que ela é', () => {
    /*
      A lição diz que a diferença é **exatamente** a quantidade de células que
      parecem número e não são. Conferir só os dois números deixaria passar uma
      grade em que os dois batem por acaso — e é a diferença, não cada número,
      que ensina a achar o defeito.
    */
    const numeros = valorDaFormula(DOZE_COM_UM_DE_TEXTO, '=CONT.NÚM(D3:D14)');
    const valores = valorDaFormula(DOZE_COM_UM_DE_TEXTO, '=CONT.VALORES(D3:D14)');
    expect(numeros.tipo === 'numero' && valores.tipo === 'numero'
      && valores.n - numeros.n).toBe(1);
  });

  /*
    Os dois tópicos de referência afirmam para onde a fórmula vai quando
    alguém arrasta. Quem responde é `transporFormula`, que é a mesma função que
    a alça de preenchimento chama — um cifrão que deixasse de ser respeitado
    apagaria a diferença entre relativa e absoluta na tela **e** na lição, e as
    duas concordariam em estar erradas.
  */
  describe.each([
    ['referencia-relativa', 3],
    ['referencia-absoluta', 2],
  ])('o arrasto do tópico %s', (id, quantas) => {
    it('leva a fórmula para onde a lição diz', () => {
      const texto = linhas(id);

      const origem = texto
        .map(l => /^Escrito em ([A-Z]+)(\d+):\s*(=.+)$/.exec(l))
        .find((m): m is RegExpExecArray => m !== null);
      if (!origem) throw new Error(`O exemplo de ${id} não diz de onde se arrasta.`);
      const [, colOrigem, linOrigem, formula] = origem;

      const destinos = texto
        .map(l => /^([A-Z]+)(\d+)\s*→\s*(=.+)$/.exec(l))
        .filter((m): m is RegExpExecArray => m !== null);
      expect(destinos).toHaveLength(quantas);

      for (const [, col, lin, esperada] of destinos) {
        const transposta = transporFormula(
          formula.trim(),
          Number(lin) - Number(linOrigem),
          colunaDoNome(col) - colunaDoNome(colOrigem),
        );
        expect(transposta).toBe(esperada.trim());
      }
    });
  });

  /*
    O quarto argumento é o tópico em que a lição faz a afirmação mais cara de
    errar: ela diz **que nome** a procura aproximada devolve numa tabela fora
    de ordem. Um número errado aqui se lê como uma curiosidade; um nome errado
    aqui ensina que o PROCV aproximado funciona.
  */
  it('a procura aproximada devolve, na tabela da lição, o que a lição diz', () => {
    const texto = linhas('quarto-argumento');

    /*
      A tabela se lê do próprio desenho — aqui ela é uma lista de pares, e não
      uma planilha inteira, então lê-la não é a máquina frágil que o comentário
      do topo recusa. E é preciso lê-la: escrevê-la aqui deixaria a lição livre
      para trocar as unidades de ordem sem nada reprovar, que é justamente a
      ordem de que o exemplo trata.
    */
    const pares = texto
      .map(l => /^(\p{Lu}\p{L}+)\s{2,}(Ti[oa] \p{L}+)$/u.exec(l))
      .filter((m): m is RegExpExecArray => m !== null);
    expect(pares.length).toBeGreaterThanOrEqual(4);

    const tabela = grade(Object.fromEntries(pares.flatMap(([, unidade, nome], i) => [
      [`G${i + 1}`, unidade], [`H${i + 1}`, nome],
    ])));
    const faixa = `$G$1:$H$${pares.length}`;

    const procuras = texto
      .map(l => /^Procurando (\p{Lu}\p{L}+),.*→\s*(.+)$/u.exec(l))
      .filter((m): m is RegExpExecArray => m !== null);
    expect(procuras).toHaveLength(2);

    for (const [, procurado, esperado] of procuras) {
      expect(mostrar(valorDaFormula(tabela, `=PROCV("${procurado}";${faixa};2)`)))
        .toBe(esperado.trim());
    }
  });

  /*
    O alinhamento é a outra pista do requisito 7, e a lição a desenha em vez de
    afirmá-la com seta. Ela vale trava porque é a pista que se vê primeiro: se
    um número guardado como texto passasse a encostar à direita, a lição
    continuaria dizendo que ele encosta à esquerda e ninguém acharia o defeito
    olhando a coluna.
  */
  it('o número guardado como texto encosta para o lado que a lição desenha', () => {
    const texto = topico('tamanho-e-alinhamento').exemplo;
    expect(texto).toMatch(/texto\s+→ encosta à esquerda/);
    expect(texto).toMatch(/número\s+→ encosta à direita/);

    /*
      E é o **valor** que decide o lado, nunca o que a célula imprime: as duas
      imprimem `1620`. Era assim que a pista desenhada aqui não existia na
      tela — o motor entendia texto, e o alinhamento reperguntava ao texto
      impresso, que já tinha perdido a resposta.
    */
    const comoNumero = valorDaFormula(grade({ D3: '1620' }), '=D3');
    const comoTexto = valorDaFormula(grade({ D3: `'1620` }), '=D3');
    expect(mostrar(comoNumero)).toBe(mostrar(comoTexto));

    expect(alinhamentoDe(vazia(), comoNumero)).toBe('direita');
    expect(alinhamentoDe(vazia(), comoTexto)).toBe('esquerda');
  });

  /*
    E a conta que a lição promete sobre o texto: ele fica de fora da SOMA, que
    é o que faz o total sair plausível e errado.
  */
  it('a soma pula o número guardado como texto, como o requisito 7 exige', () => {
    const soma = valorDaFormula(DOZE_COM_UM_DE_TEXTO, '=SOMA(D3:D14)');
    expect(soma).toEqual({ tipo: 'numero', n: 11 * 135 });
  });
});
