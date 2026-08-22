import { describe, it, expect } from 'vitest';
import { sequenciaCorreta, embaralharQuestao, embaralharQuestoes } from './questoes';
import { checkAnswer } from './checkAnswer';
import type { Question } from '../types';

/*
  A questão de ordenar chegava resolvida.

  Nada embaralhava `items`, e o currículo escreve os itens na ordem certa — logo
  a tela abria com a resposta montada, e bastava confirmar. O conserto tem duas
  metades que só funcionam juntas: embaralhar os itens, e passar a corrigir pelo
  campo `order` em vez da posição no array. Fazer só a primeira reprovaria todo
  mundo; só a segunda não mudaria nada. Os testes abaixo vigiam as duas.
*/

function ordenar(items: { id: string; text: string; order: number }[]): Question {
  return { id: 'Q', type: 'ordering', prompt: '', data: { items } };
}

/** Escrita fora de ordem de propósito: `order` é quem manda, não a posição. */
const itensBaralhados = [
  { id: 'c', text: 'terceiro', order: 3 },
  { id: 'a', text: 'primeiro', order: 1 },
  { id: 'd', text: 'quarto', order: 4 },
  { id: 'b', text: 'segundo', order: 2 },
];

const itensNaOrdem = [
  { id: 'a', text: 'primeiro', order: 1 },
  { id: 'b', text: 'segundo', order: 2 },
  { id: 'c', text: 'terceiro', order: 3 },
  { id: 'd', text: 'quarto', order: 4 },
  { id: 'e', text: 'quinto', order: 5 },
];

describe('a ordem certa vem do campo order', () => {
  it('lê o campo, e não a posição no array', () => {
    expect(sequenciaCorreta(itensBaralhados)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('dá o mesmo resultado com o array já ordenado', () => {
    expect(sequenciaCorreta(itensNaOrdem)).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('não altera o array recebido', () => {
    const copia = [...itensBaralhados];
    sequenciaCorreta(itensBaralhados);
    expect(itensBaralhados).toEqual(copia);
  });
});

describe('embaralhar os itens', () => {
  it('muda a ordem em que eles aparecem', () => {
    /* Um sorteio pode sair parecido; cem não saem todos iguais. */
    const vistas = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const q = embaralharQuestao(ordenar(itensNaOrdem));
      vistas.add(q.data.items!.map(x => x.id).join(''));
    }
    expect(vistas.size).toBeGreaterThan(1);
  });

  /*
    O que o desbravador não pode encontrar: a questão pronta.

    Com cinco itens, um sorteio em cada 120 cai na ordem certa por acaso. Em cem
    tentativas isso apareceria quase sempre pelo menos uma vez — e não aparece,
    porque embaralharItens sorteia de novo quando cai na resposta.
  */
  it('nunca entrega a questão já resolvida', () => {
    const certa = sequenciaCorreta(itensNaOrdem).join('');
    for (let i = 0; i < 300; i++) {
      const q = embaralharQuestao(ordenar(itensNaOrdem));
      expect(q.data.items!.map(x => x.id).join('')).not.toBe(certa);
    }
  });

  it('preserva todos os itens, sem perder nem duplicar', () => {
    const q = embaralharQuestao(ordenar(itensNaOrdem));
    expect(q.data.items!.map(x => x.id).sort()).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('não estraga uma questão de um item só', () => {
    const um = [{ id: 'a', text: 'único', order: 1 }];
    expect(embaralharQuestao(ordenar(um)).data.items).toHaveLength(1);
  });

  it('não altera a questão original', () => {
    const q = ordenar(itensNaOrdem);
    embaralharQuestao(q);
    expect(q.data.items!.map(x => x.id)).toEqual(['a', 'b', 'c', 'd', 'e']);
  });
});

describe('a correção sobrevive ao embaralhamento', () => {
  /*
    A regressão que o conserto pela metade teria causado: itens embaralhados,
    correção pela posição no array, e a resposta certa marcada como errada.
  */
  it('aceita a sequência certa mesmo com os itens embaralhados', () => {
    for (let i = 0; i < 50; i++) {
      const q = embaralharQuestao(ordenar(itensNaOrdem));
      expect(checkAnswer(q, sequenciaCorreta(q.data.items!))).toBe(true);
    }
  });

  it('aceita a sequência certa com o array escrito fora de ordem', () => {
    expect(checkAnswer(ordenar(itensBaralhados), ['a', 'b', 'c', 'd'])).toBe(true);
  });

  it('recusa a ordem em que os itens aparecem, quando não é a certa', () => {
    const q = embaralharQuestao(ordenar(itensNaOrdem));
    const comoAparece = q.data.items!.map(x => x.id);
    expect(checkAnswer(q, comoAparece)).toBe(false);
  });

  it('recusa resposta de tamanho diferente', () => {
    expect(checkAnswer(ordenar(itensNaOrdem), ['a', 'b'])).toBe(false);
  });
});

describe('as outras formas continuam embaralhadas', () => {
  const comOpcoes: Question = {
    id: 'Q', type: 'multiple_choice', prompt: '',
    data: { options: Array.from({ length: 6 }, (_, i) => ({ id: `o${i}`, text: `t${i}`, correct: i === 0 })) },
  };

  it('embaralha as alternativas', () => {
    const vistas = new Set<string>();
    for (let i = 0; i < 60; i++) vistas.add(embaralharQuestao(comOpcoes).data.options!.map(o => o.id).join(''));
    expect(vistas.size).toBeGreaterThan(1);
  });

  it('mantém exatamente uma alternativa correta', () => {
    const q = embaralharQuestao(comOpcoes);
    expect(q.data.options!.filter(o => o.correct)).toHaveLength(1);
  });

  it('embaralha os cenários', () => {
    const comCenarios: Question = {
      id: 'Q', type: 'scenario', prompt: '',
      data: { scenarios: Array.from({ length: 6 }, (_, i) => ({ id: `s${i}`, text: `t${i}`, correct: i === 0 })) },
    };
    const vistas = new Set<string>();
    for (let i = 0; i < 60; i++) vistas.add(embaralharQuestao(comCenarios).data.scenarios!.map(o => o.id).join(''));
    expect(vistas.size).toBeGreaterThan(1);
  });

  /* `pairs` não é embaralhado aqui: a coluna da esquerda é o enunciado, e é a
     lista da direita que o QuestionRenderer sorteia na hora de desenhar. */
  it('deixa os pares como estão', () => {
    const comPares: Question = {
      id: 'Q', type: 'matching', prompt: '',
      data: { pairs: [{ left: 'a', right: '1' }, { left: 'b', right: '2' }] },
    };
    expect(embaralharQuestao(comPares).data.pairs).toEqual(comPares.data.pairs);
  });

  it('embaralharQuestoes trata a lista inteira', () => {
    const saida = embaralharQuestoes([comOpcoes, ordenar(itensNaOrdem)]);
    expect(saida).toHaveLength(2);
    expect(saida[1].data.items!.map(x => x.id).join('')).not.toBe('abcde');
  });
});
