import { describe, it, expect } from 'vitest';
import { porqueDaEscolha } from './porque';
import type { Question } from '../types';

const q = (options: any[]): Question => ({
  id: 'x', type: 'multiple_choice', prompt: 'p', data: { options },
});

describe('porqueDaEscolha', () => {
  const questao = q([
    { id: 'a', text: 'certa', correct: true },
    { id: 'b', text: 'errada com motivo', porque: 'Isso é o navegador.' },
    { id: 'c', text: 'errada sem motivo' },
  ]);

  it('devolve o motivo da alternativa errada escolhida', () => {
    expect(porqueDaEscolha(questao, 'b')).toBe('Isso é o navegador.');
  });

  it('não diz nada quando a resposta está certa', () => {
    expect(porqueDaEscolha(questao, 'a')).toBe('');
  });

  /* A escrita dos motivos é gradual: enquanto uma alternativa não tem o seu, a
     tela mostra a explicação geral da questão, como sempre mostrou. */
  it('fica em silêncio quando aquela alternativa ainda não tem motivo', () => {
    expect(porqueDaEscolha(questao, 'c')).toBe('');
  });

  it('aguenta resposta ausente ou de outro formato', () => {
    expect(porqueDaEscolha(questao, undefined)).toBe('');
    expect(porqueDaEscolha(questao, ['a', 'b'])).toBe('');
    expect(porqueDaEscolha(questao, 'inexistente')).toBe('');
  });

  it('funciona também nas questões de cenário', () => {
    const cenario: Question = {
      id: 'y', type: 'scenario', prompt: 'p',
      data: { scenarios: [
        { id: 'a', text: 'certa', correct: true },
        { id: 'b', text: 'errada', porque: 'Chutar endereços não leva a lugar algum.' },
      ]},
    };
    expect(porqueDaEscolha(cenario, 'b')).toBe('Chutar endereços não leva a lugar algum.');
  });

  it('não devolve motivo de questão sem alternativas', () => {
    const lacuna: Question = {
      id: 'z', type: 'fill_blank', prompt: 'p',
      data: { blanks: [{ id: 'b1', answer: 'roteador' }] },
    };
    expect(porqueDaEscolha(lacuna, 'roteador')).toBe('');
  });
});
