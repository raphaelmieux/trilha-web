import { describe, it, expect } from 'vitest';
import { coresDoProgresso, corDoPercentual } from './coresDoProgresso';

/*
  Barras iguais dizendo a mesma coisa em cores diferentes.

  O painel chegou a mostrar três lado a lado — uma verde, uma azul, uma vermelha
  — todas medindo andamento de trilha. Quem olha conclui que a cor significa
  alguma coisa, e ela não significava: era só qual especialidade estava embaixo.
  Antes disso, a mesma trilha tinha aparecido vermelha no painel e azul na
  própria página.

  A regra que restou: a cor responde ao ponto em que o progresso está, e nada
  mais. Mesma resposta, mesma cor, em qualquer trilha e em qualquer tela.
*/

describe('a cor vem do andamento', () => {
  it('não muda enquanto o progresso não muda', () => {
    /* A função recebe um número. Se um dia alguém quiser voltar a colorir por
       especialidade, vai precisar mudar a assinatura — e aí alguém vê. */
    expect(coresDoProgresso(40)).toEqual(coresDoProgresso(40));
  });

  it('é a mesma para qualquer trilha no mesmo ponto', () => {
    const ap034 = coresDoProgresso(3);
    const ap035 = coresDoProgresso(3);
    const ap041 = coresDoProgresso(3);
    expect(ap034).toEqual(ap035);
    expect(ap035).toEqual(ap041);
  });

  it('usa a cor da marca enquanto está em andamento', () => {
    for (const p of [0, 1, 4, 50, 99]) {
      expect(corDoPercentual(p), `${p}%`).toBe('var(--color-primary)');
    }
  });

  it('vira verde ao completar', () => {
    expect(corDoPercentual(100)).toBe('var(--color-success)');
  });

  /*
    O preenchimento é sempre o mesmo gradiente porque quem troca para o verde ao
    chegar a 100% é a ProgressBar, num lugar só. Dois lugares decidindo a mesma
    coisa é como a incoerência começou.
  */
  it('deixa o preenchimento igual, e a troca do verde para a barra', () => {
    expect(coresDoProgresso(0).gradiente).toBe(coresDoProgresso(100).gradiente);
  });

  it('não devolve cor vazia em nenhum estado', () => {
    for (const p of [0, 50, 100]) {
      for (const [chave, valor] of Object.entries(coresDoProgresso(p))) {
        expect(valor, `${p}% · ${chave}`).toMatch(/^(var\(--|linear-gradient)/);
      }
    }
  });
});
