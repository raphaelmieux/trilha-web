import { describe, it, expect } from 'vitest';
import {
  FUNCOES_DO_EXCEL, sugestoesDeFuncao, completarFuncao, funcaoAberta, argumentoEmDestaque,
} from './ajudaDeFormulas';
import { valorDaFormula, TEXTO_DO_ERRO } from './formulas';

/*
  A lista de funções e a dica de sintaxe do Excel.

  A lista só pode oferecer o que o motor calcula: uma função sugerida e
  respondida com #NOME? é a plataforma ensinando a fórmula errada.
*/

describe('o catálogo é o que o motor entende', () => {
  it('nenhuma função da lista responde #NOME?', () => {
    const bruto = (l: number, c: number) => (c === 0 ? String(l + 1) : String(2 * (l + 1)));
    const desconhecidas = FUNCOES_DO_EXCEL.filter(f => {
      const args = f.argumentos.filter(a => a !== '...').map(() => 'A1:A3');
      const v = valorDaFormula(bruto, `=${f.nome}(${args.join(';')})`);
      return v.tipo === 'erro' && TEXTO_DO_ERRO[v.e] === TEXTO_DO_ERRO.nome;
    }).map(f => f.nome);
    expect(desconhecidas).toEqual([]);
    expect(FUNCOES_DO_EXCEL.length).toBeGreaterThanOrEqual(20);
  });
});

describe('a lista abre onde começa um nome de função', () => {
  it('=SO oferece SOMA e SOMASE, e não SUBTOTAL', () => {
    const s = sugestoesDeFuncao('=SO');
    expect(s?.nomes.map(f => f.nome)).toEqual(['SOMA', 'SOMASE']);
  });

  it('acento e caixa não importam: =med oferece MED e MÉDIA', () => {
    expect(sugestoesDeFuncao('=med')?.nomes.map(f => f.nome)).toEqual(['MED', 'MÉDIA']);
  });

  it('depois de operador e de ponto e vírgula também abre', () => {
    expect(sugestoesDeFuncao('=A1+MÁ')?.nomes[0].nome).toBe('MÁXIMO');
    expect(sugestoesDeFuncao('=SE(A1>2;CO')?.nomes.map(f => f.nome)).toContain('CONT.SE');
  });

  it('referência não abre lista: =A1 e =AB12 são células', () => {
    expect(sugestoesDeFuncao('=A1')).toBeNull();
    expect(sugestoesDeFuncao('=AB12')).toBeNull();
  });

  it('texto que não é fórmula não abre lista', () => {
    expect(sugestoesDeFuncao('Soma')).toBeNull();
  });

  it('o Tab escreve o nome inteiro com o parêntese aberto', () => {
    const s = sugestoesDeFuncao('=B2+so')!;
    expect(completarFuncao('=B2+so', s.prefixo, s.nomes[0])).toBe('=B2+SOMA(');
  });
});

describe('a dica mostra o argumento da vez', () => {
  it('no primeiro e no segundo argumento do SE', () => {
    expect(funcaoAberta('=SE(')).toMatchObject({ funcao: { nome: 'SE' }, argumento: 0 });
    expect(funcaoAberta('=SE(A1>2;')).toMatchObject({ funcao: { nome: 'SE' }, argumento: 1 });
  });

  it('a função de dentro manda, e fechar o parêntese volta para a de fora', () => {
    expect(funcaoAberta('=SE(SOMA(A1;')?.funcao.nome).toBe('SOMA');
    expect(funcaoAberta('=SE(SOMA(A1;A2);')).toMatchObject({ funcao: { nome: 'SE' }, argumento: 1 });
  });

  it('ponto e vírgula entre aspas não conta', () => {
    expect(funcaoAberta('=CONT.SE(A1:A9;"a;b"')).toMatchObject({ argumento: 1 });
  });

  it('parêntese fechado não deixa dica', () => {
    expect(funcaoAberta('=SOMA(A1:A3)')).toBeNull();
  });

  it('na SOMA, passado do segundo número, o destaque vai para o "..."', () => {
    const f = FUNCOES_DO_EXCEL.find(x => x.nome === 'SOMA')!;
    expect(argumentoEmDestaque(f, 0)).toBe(0);
    expect(argumentoEmDestaque(f, 5)).toBe(2);
    const se = FUNCOES_DO_EXCEL.find(x => x.nome === 'SE')!;
    expect(argumentoEmDestaque(se, 3), 'o SE não tem quarto argumento').toBe(-1);
  });
});
