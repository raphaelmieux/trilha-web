// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import {
  TAMANHO_MAXIMO_DA_PALAVRA, acrescentarAoDicionario, conectarDicionario, esquecerDicionarioDoAparelho,
  ouvirDicionario, palavraValida, palavrasDoDicionario, recarregarDicionario, tirarDoDicionario,
  type FonteDaConta,
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

/* ── A conta ───────────────────────────────────────────────────────────────── */

/** Uma conta de mentira: um conjunto, e uma chave que derruba a rede. */
function contaDeMentira(inicial: string[] = []) {
  const banco = new Set(inicial);
  const estado = { semRede: false };
  const falhar = () => { if (estado.semRede) throw new Error('sem rede'); };
  const fonte: FonteDaConta = {
    ler: async () => { falhar(); return [...banco]; },
    gravar: async p => { falhar(); banco.add(p); },
    apagar: async p => { falhar(); banco.delete(p); },
  };
  return { banco, estado, fonte };
}
/* As gravações são promessas soltas; espera-se a fila andar. */
const andar = () => new Promise(r => setTimeout(r, 0));

describe('o dicionário na conta', () => {
  it('o que está na conta vale no aparelho novo, e o que se acrescenta sobe', async () => {
    const c = contaDeMentira(['Pinheiral']);
    await conectarDicionario('ana', c.fonte);
    expect(palavrasDoDicionario().has('Pinheiral')).toBe(true);
    acrescentarAoDicionario('Brasilândia');
    await andar();
    expect(c.banco.has('Brasilândia')).toBe(true);
    tirarDoDicionario('Pinheiral');
    await andar();
    expect(c.banco.has('Pinheiral')).toBe(false);
  });

  it('acrescentado sem rede fica pendente, e sobe na próxima conexão', async () => {
    const c = contaDeMentira();
    await conectarDicionario('ana', c.fonte);
    c.estado.semRede = true;
    acrescentarAoDicionario('Brasilândia');
    await andar();
    expect(c.banco.has('Brasilândia')).toBe(false);
    expect(palavrasDoDicionario().has('Brasilândia'), 'sem rede a palavra deixou de valer').toBe(true);
    c.estado.semRede = false;
    await conectarDicionario('ana', c.fonte);
    await andar();
    expect(c.banco.has('Brasilândia')).toBe(true);
  });

  /* A cópia do aparelho não é pendência: tirada no outro aparelho, a palavra
     não pode voltar só porque este ainda a guardava. */
  it('o que foi tirado no outro aparelho não ressuscita', async () => {
    const c = contaDeMentira(['Pinheiral']);
    await conectarDicionario('ana', c.fonte);
    await conectarDicionario(null, null);
    c.banco.delete('Pinheiral');
    await conectarDicionario('ana', c.fonte);
    await andar();
    expect(palavrasDoDicionario().has('Pinheiral')).toBe(false);
    expect(c.banco.has('Pinheiral')).toBe(false);
  });

  it('sem rede, vale a cópia do aparelho', async () => {
    const c = contaDeMentira(['Pinheiral']);
    await conectarDicionario('ana', c.fonte);
    await conectarDicionario(null, null);
    c.estado.semRede = true;
    await conectarDicionario('ana', c.fonte);
    expect(palavrasDoDicionario().has('Pinheiral')).toBe(true);
  });

  /* O computador do clube é de todo mundo. */
  it('a palavra de uma conta não aparece para a próxima, nem para quem não entrou', async () => {
    const ana = contaDeMentira(['Pinheiral']);
    await conectarDicionario('ana', ana.fonte);
    acrescentarAoDicionario('Brasilândia');
    await andar();
    esquecerDicionarioDoAparelho();
    expect(palavrasDoDicionario().size).toBe(0);
    expect(Object.keys(localStorage).some(k => k.includes('ana'))).toBe(false);
    await conectarDicionario('bia', contaDeMentira().fonte);
    expect(palavrasDoDicionario().size).toBe(0);
  });

  it('a palavra acrescentada sem conta não entra na conta de quem entrar depois', async () => {
    acrescentarAoDicionario('Brasilândia');
    const c = contaDeMentira();
    await conectarDicionario('ana', c.fonte);
    await andar();
    expect(c.banco.size).toBe(0);
    expect(palavrasDoDicionario().has('Brasilândia')).toBe(false);
  });

  /* A resposta de uma conta que já saiu não pode escrever na de quem entrou. */
  it('a leitura atrasada de uma conta que saiu é descartada', async () => {
    let soltar: (v: string[]) => void = () => {};
    const lenta: FonteDaConta = { ler: () => new Promise(r => { soltar = r; }), gravar: async () => {}, apagar: async () => {} };
    const chegando = conectarDicionario('ana', lenta);
    await conectarDicionario('bia', contaDeMentira(['Taguatinga']).fonte);
    soltar(['Pinheiral']);
    await chegando;
    expect([...palavrasDoDicionario()]).toEqual(['Taguatinga']);
  });
});
