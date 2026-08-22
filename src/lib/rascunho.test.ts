// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  salvarRascunho, lerRascunho, descartarRascunho, limparRascunhos, rascunhoEhMaisNovo,
} from './rascunho';

/*
  Cem palavras se perderam numa atualização do aplicativo.

  O texto só subia ao servidor ao salvar, ao trocar de etapa ou ao sair do campo;
  entre uma dessas e a seguinte cabe um parágrafo, e uma recarga o levava. Estes
  testes vigiam a rede que ficou embaixo: o que é guardado, quando volta, e — o
  mais delicado — quando NÃO deve voltar.
*/

beforeEach(() => localStorage.clear());
afterEach(() => vi.useRealTimers());

describe('guardar e recuperar', () => {
  it('devolve o que foi guardado', () => {
    salvarRascunho('u1', 'L1', { texto: 'olá' });
    expect(lerRascunho<{ texto: string }>('u1', 'L1')?.conteudo).toEqual({ texto: 'olá' });
  });

  it('guarda quando foi digitado', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-21T12:00:00Z'));
    salvarRascunho('u1', 'L1', 'x');
    expect(lerRascunho('u1', 'L1')?.em).toBe(Date.parse('2026-08-21T12:00:00Z'));
  });

  it('não devolve nada quando não há rascunho', () => {
    expect(lerRascunho('u1', 'L1')).toBeUndefined();
  });

  /* O clube costuma ter um computador só. */
  it('separa por pessoa e por lição', () => {
    salvarRascunho('u1', 'L1', 'da Ana');
    salvarRascunho('u2', 'L1', 'do João');
    salvarRascunho('u1', 'L2', 'outra lição');
    expect(lerRascunho('u1', 'L1')?.conteudo).toBe('da Ana');
    expect(lerRascunho('u2', 'L1')?.conteudo).toBe('do João');
    expect(lerRascunho('u1', 'L2')?.conteudo).toBe('outra lição');
  });

  it('descarta só o rascunho pedido', () => {
    salvarRascunho('u1', 'L1', 'a');
    salvarRascunho('u1', 'L2', 'b');
    descartarRascunho('u1', 'L1');
    expect(lerRascunho('u1', 'L1')).toBeUndefined();
    expect(lerRascunho('u1', 'L2')?.conteudo).toBe('b');
  });

  it('ao sair, apaga o de todo mundo', () => {
    salvarRascunho('u1', 'L1', 'a');
    salvarRascunho('u2', 'L1', 'b');
    localStorage.setItem('outra-coisa', 'preservar');
    limparRascunhos();
    expect(lerRascunho('u1', 'L1')).toBeUndefined();
    expect(lerRascunho('u2', 'L1')).toBeUndefined();
    expect(localStorage.getItem('outra-coisa')).toBe('preservar');
  });

  it('não quebra com conteúdo corrompido', () => {
    localStorage.setItem('trilha-web:rascunho:u1:L1', 'isto não é json');
    expect(lerRascunho('u1', 'L1')).toBeUndefined();
  });

  /* Modo privado e cota estourada lançam; o laboratório não pode cair junto. */
  it('não quebra quando o navegador recusa gravar', () => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = () => { throw new Error('QuotaExceeded'); };
    expect(() => salvarRascunho('u1', 'L1', 'x')).not.toThrow();
    Storage.prototype.setItem = original;
  });
});

describe('quando o rascunho local vence o servidor', () => {
  const em = (iso: string) => ({ em: Date.parse(iso) });

  it('vence quando foi digitado depois do último salvamento', () => {
    expect(rascunhoEhMaisNovo(em('2026-08-21T12:05:00Z'), '2026-08-21T12:00:00Z')).toBe(true);
  });

  /* O caso que importa não errar: o salvamento funcionou, e restaurar por cima
     devolveria uma versão velha por cima da boa. */
  it('perde quando o servidor tem algo mais recente', () => {
    expect(rascunhoEhMaisNovo(em('2026-08-21T12:00:00Z'), '2026-08-21T12:05:00Z')).toBe(false);
  });

  /*
    Os dois relógios são diferentes — o do navegador e o do banco. Sem a
    tolerância, um salvamento bem-sucedido pareceria velho por poucos
    milissegundos e reviveria justamente o que ele acabara de substituir.
  */
  it('não vence por uma diferença pequena de relógio', () => {
    expect(rascunhoEhMaisNovo(em('2026-08-21T12:00:01Z'), '2026-08-21T12:00:00Z')).toBe(false);
  });

  it('vence quando o servidor não tem nada', () => {
    expect(rascunhoEhMaisNovo(em('2026-08-21T12:00:00Z'), null)).toBe(true);
    expect(rascunhoEhMaisNovo(em('2026-08-21T12:00:00Z'), undefined)).toBe(true);
  });

  it('não vence quando não há rascunho', () => {
    expect(rascunhoEhMaisNovo(undefined, '2026-08-21T12:00:00Z')).toBe(false);
  });

  it('vence quando a data do servidor é ilegível', () => {
    expect(rascunhoEhMaisNovo(em('2026-08-21T12:00:00Z'), 'data quebrada')).toBe(true);
  });
});
