/**
 * O roteiro da apresentação: o que cada fórmula da planilha faz, em português.
 *
 * ── O requisito 8, e o que a plataforma pode fazer por ele ───────────────
 * "Apresentar a planilha ao examinador, explicando a função de cada fórmula
 * utilizada." A apresentação acontece fora do aplicativo e a plataforma não
 * confere nada dela — é a mesma decisão do `roteiroDePython.ts`, e está
 * escrita lá: o que ela faz é **preparar**, lendo a planilha e escrevendo o
 * que cada fórmula faz, para a pessoa treinar com a própria planilha na
 * frente.
 *
 * ── Primeira pessoa, porque é para falar ─────────────────────────────────
 * "Esta fórmula soma a coluna" se lê; "aqui eu somo a coluna" se fala.
 *
 * ── Ele descreve, e não julga ────────────────────────────────────────────
 * Nenhuma frase diz que a fórmula está boa, ruim, certa ou errada, nem sugere
 * outra. Julgar a planilha de quem vai apresentá-la é a forma mais rápida de
 * a pessoa decorar a nossa opinião em vez de explicar o trabalho dela.
 *
 * ── A coluna arrastada vira uma frase, e não doze ────────────────────────
 * Uma coluna preenchida com a alça tem a mesma fórmula em todas as linhas,
 * mudando só a referência que anda. Doze frases idênticas não são um roteiro:
 * são o que faz alguém parar de ler.
 *
 * ── Por que ele lê a forma da fórmula, e não uma árvore ──────────────────
 * O `roteiroDePython.ts` percorre a árvore do `ast` porque um programa tem
 * forma livre. Uma fórmula de planilha, nesta vereda, tem um punhado de
 * formas, e são as que as lições ensinam. Descrever genericamente daria
 * frases que ninguém diz em voz alta — "aplico a função SOMA ao argumento
 * D3:D14". O preço dessa escolha é que função nova precisa de frase nova, e
 * `roteiroDaPlanilha.test.ts` cobra: toda fórmula que as sete lições produzem
 * tem de sair com frase própria, e nunca com a de último recurso.
 */

import { type Planilha, nomeDaCelula } from './planilha';
import { ehFormula, referenciasDe, nomeDaRef, transporFormula } from './formulas';

export interface PassoDoRoteiro {
  /** A1, ou C4:C15 quando a mesma fórmula preenche uma faixa. */
  onde: string;
  formula: string;
  fala: string;
}

const semAcento = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();

/** A fórmula sem espaços e sem acento, para as formas serem reconhecíveis. */
const forma = (f: string) => semAcento(f.trim()).replace(/\s+/g, '');

const FUNCOES_DE_FAIXA: [RegExp, (faixa: string) => string][] = [
  [/^=SOMA\(([^()]+)\)$/, f => `somo tudo o que está de ${f}`],
  [/^=MEDIA\(([^()]+)\)$/, f => `tiro a média dos números de ${f}`],
  [/^=MAXIMO\(([^()]+)\)$/, f => `pego o maior número de ${f}`],
  [/^=MINIMO\(([^()]+)\)$/, f => `pego o menor número de ${f}`],
  [/^=CONT\.NUM\(([^()]+)\)$/, f => `conto quantos números há de ${f}`],
  [/^=CONT\.VALORES\(([^()]+)\)$/, f => `conto quantas células preenchidas há de ${f}`],
];

const comFaixa = (texto: string) => texto.replace(':', ' até ');

/** O que a fórmula faz, dito como quem vai falar em voz alta. */
export function falaDaFormula(formula: string): string {
  const f = forma(formula);

  for (const [padrao, frase] of FUNCOES_DE_FAIXA) {
    const m = padrao.exec(f);
    if (m) return `Aqui eu ${frase(comFaixa(m[1]))}.${sobreOCifrao(formula)}`;
  }

  const se = /^=SE\((.+?);(.+?);(.+?)\)$/.exec(f);
  if (se) {
    return `Aqui eu pergunto se ${se[1]}. Se for verdade, escrevo ${se[2].replace(/"/g, '')}; `
      + `se não for, escrevo ${se[3].replace(/"/g, '')}.${sobreOCifrao(formula)}`;
  }

  const procv = /^=PROCV\((.+?);(.+?);(\d+)(;(FALSO|0))?\)$/.exec(f);
  if (procv) {
    const exato = procv[5]
      ? ' O último argumento é o que manda procurar exato: sem ele, a procura seria aproximada e leria a tabela como se ela estivesse em ordem.'
      : ' Não escrevi o último argumento, então esta procura é aproximada.';
    return `Aqui eu procuro o que está em ${procv[1]} na primeira coluna de ${comFaixa(procv[2])}`
      + ` e trago o que estiver na coluna ${procv[3]} daquela linha.${exato}${sobreOCifrao(formula)}`;
  }

  /*
    Um dos dois lados pode ser número escrito — `=C3*45` é a fórmula do valor
    de cada inscrito, e ela é a primeira que o desbravador encontra. Um padrão
    que só aceitasse referência dos dois lados a mandaria para a frase de
    último recurso, que é onde nenhuma fórmula das lições pode cair.
  */
  const OPERANDO = '\\$?[A-Z]+\\$?\\d+|\\d+(?:,\\d+)?';
  const conta = new RegExp(`^=(${OPERANDO})([*/+-])(${OPERANDO})$`).exec(f);
  if (conta) {
    const verbo = { '*': 'multiplico', '/': 'divido', '+': 'somo', '-': 'subtraio' }[conta[2]];
    const ligacao = conta[2] === '*' ? 'por' : conta[2] === '/' ? 'por' : conta[2] === '+' ? 'com' : 'de';
    return `Aqui eu ${verbo} ${conta[1]} ${ligacao} ${conta[3]}.${sobreOCifrao(formula)}`;
  }

  /*
    A frase de último recurso. Ela existe porque a planilha aceita qualquer
    fórmula que o desbravador escreva, e um roteiro que pulasse a fórmula dele
    seria um roteiro incompleto sem dizer que está incompleto. Mas nenhuma
    fórmula **das lições** pode cair aqui, e a trava cobra isso.
  */
  return `Aqui eu uso a fórmula ${formula.trim()}.${sobreOCifrao(formula)}`;
}

/** O que o cifrão faz, dito só quando ele existe. */
function sobreOCifrao(formula: string): string {
  const travadas = referenciasDe(formula).filter(r => r.linhaFixa || r.colunaFixa);
  if (travadas.length === 0) return '';
  const nomes = [...new Set(travadas.map(nomeDaRef))];
  return ` O cifrão em ${nomes.join(' e em ')} é o que prende essa referência no lugar quando a fórmula é arrastada.`;
}

/**
 * O roteiro de uma planilha, coluna a coluna e de cima para baixo.
 *
 * Células vizinhas na mesma coluna cuja fórmula é a mesma transposta viram uma
 * entrada só — é a coluna preenchida com a alça, e ela se apresenta de uma vez.
 */
export function roteiroDaPlanilha(p: Planilha): PassoDoRoteiro[] {
  const passos: PassoDoRoteiro[] = [];
  const largura = p.celulas[0]?.length ?? 0;

  for (let c = 0; c < largura; c++) {
    let l = 0;
    while (l < p.celulas.length) {
      const texto = p.celulas[l][c]?.texto ?? '';
      if (!ehFormula(texto)) { l++; continue; }

      let fim = l;
      while (fim + 1 < p.celulas.length) {
        const seguinte = p.celulas[fim + 1][c]?.texto ?? '';
        if (!ehFormula(seguinte) || transporFormula(texto, fim + 1 - l, 0) !== seguinte.trim()) break;
        fim++;
      }

      passos.push({
        onde: fim === l ? nomeDaCelula(l, c) : `${nomeDaCelula(l, c)}:${nomeDaCelula(fim, c)}`,
        formula: texto.trim(),
        fala: fim === l
          ? falaDaFormula(texto)
          : `${falaDaFormula(texto)} Esta mesma conta desce até ${nomeDaCelula(fim, c)}, e em cada linha ela lê a linha dela.`,
      });
      l = fim + 1;
    }
  }

  return passos;
}
