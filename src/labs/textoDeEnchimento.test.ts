import { describe, it, expect } from 'vitest';
import { pedidoDeEnchimento, textoDeEnchimento } from './textoDeEnchimento';

describe('o =rand() do Word', () => {
  it('sem números são cinco parágrafos de três frases, como no Word', () => {
    expect(pedidoDeEnchimento('=rand()')).toEqual({ paragrafos: 5, frases: 3 });
    expect(pedidoDeEnchimento('=RAND()')).toEqual({ paragrafos: 5, frases: 3 });
  });

  it('aceita o separador do Office em português e o do inglês', () => {
    expect(pedidoDeEnchimento('=rand(2;4)')).toEqual({ paragrafos: 2, frases: 4 });
    expect(pedidoDeEnchimento('=rand(2,4)')).toEqual({ paragrafos: 2, frases: 4 });
    expect(pedidoDeEnchimento('=rand(3)')).toEqual({ paragrafos: 3, frases: 3 });
  });

  it('tem teto, e não aceita o pedido no meio de uma frase', () => {
    expect(pedidoDeEnchimento('=rand(999;999)')).toEqual({ paragrafos: 20, frases: 10 });
    expect(pedidoDeEnchimento('veja o =rand()')).toBeNull();
    expect(pedidoDeEnchimento('=rand')).toBeNull();
  });

  it('escreve os parágrafos pedidos, cada um com as frases pedidas', () => {
    const t = textoDeEnchimento(3, 2).split('\n');
    expect(t).toHaveLength(3);
    for (const p of t) expect(p.match(/\.(\s|$)/g)).toHaveLength(2);
  });
});
