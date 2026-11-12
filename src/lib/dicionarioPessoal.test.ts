// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import {
  TAMANHO_MAXIMO_DA_PALAVRA, acrescentarAoDicionario, ouvirDicionario, palavraValida,
  palavrasDoDicionario, recarregarDicionario, tirarDoDicionario,
} from './dicionarioPessoal';

/*
  O dicionário pessoal é um só para a plataforma inteira. O que se confere aqui
  é o que faz dele um só: a palavra sobrevive à página, todo ouvinte fica
  sabendo, e o que o banco recusaria não entra nem no aparelho.
*/

const CHAVE = 'trilha-web:dicionario-do-usuario';

afterEach(() => {
  localStorage.clear();
  recarregarDicionario();
});

describe('o dicionário pessoal', () => {
  it('a palavra acrescentada sobrevive a recarregar a página', () => {
    acrescentarAoDicionario('Brasilândia');
    recarregarDicionario();
    expect(palavrasDoDicionario().has('Brasilândia')).toBe(true);
  });

  it('todo ouvinte fica sabendo, nas duas direções, e parar de ouvir para de ouvir', () => {
    const vistos: boolean[] = [];
    const parar = ouvirDicionario(p => vistos.push(p.has('Pinheiral')));
    acrescentarAoDicionario('Pinheiral');
    tirarDoDicionario('Pinheiral');
    parar();
    acrescentarAoDicionario('Pinheiral');
    expect(vistos).toEqual([true, false]);
  });

  it('acrescentar o que já está lá não avisa ninguém de novo', () => {
    acrescentarAoDicionario('Pinheiral');
    let avisos = 0;
    const parar = ouvirDicionario(() => { avisos++; });
    acrescentarAoDicionario('Pinheiral');
    parar();
    expect(avisos).toBe(0);
  });

  /* A guarda é a mesma da tabela do banco: o que ela recusaria em silêncio não
     pode ficar valendo só num aparelho. */
  it('frase, palavra vazia e palavra longa demais não entram', () => {
    expect(palavraValida('duas palavras')).toBe(false);
    expect(palavraValida('')).toBe(false);
    expect(palavraValida('a'.repeat(TAMANHO_MAXIMO_DA_PALAVRA + 1))).toBe(false);
    acrescentarAoDicionario('duas palavras');
    expect(palavrasDoDicionario().size).toBe(0);
  });

  it('o que estiver estragado no aparelho é descartado, e não derruba a página', () => {
    localStorage.setItem(CHAVE, '{não é json');
    recarregarDicionario();
    expect(palavrasDoDicionario().size).toBe(0);
    localStorage.setItem(CHAVE, JSON.stringify(['Pinheiral', 7, 'duas palavras']));
    recarregarDicionario();
    expect([...palavrasDoDicionario()]).toEqual(['Pinheiral']);
  });
});
