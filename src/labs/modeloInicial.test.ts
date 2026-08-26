import { describe, it, expect } from 'vitest';
import { contrastRatio, isWebSafe } from '../lib/imageTools';
import {
  LOGO_INICIAL, BOTOES_INICIAIS, HEADER_INICIAL,
  ALVO_DE_TOQUE, MINIMO_DE_BOTOES, CONTRASTE_MINIMO, PROPORCAO_MINIMA,
  MAXIMO_DE_LETRAS, MAIOR_LADO_DO_LOGO,
} from './modeloInicial';

/*
 * O laboratório abre reprovando em tudo, e é isso que estes testes cobram.
 *
 * Fica de fora o que precisa de canvas: quantos bytes o PNG do logo tem e se
 * ele guarda canal alfa. Os dois dependem de `toBlob` e de `getImageData`, que
 * o jsdom não implementa. O que dá para afirmar aqui é o que os produz — o
 * modelo abre no maior tamanho do controle e com o fundo chapado — e é o que
 * está escrito abaixo.
 */
describe('o modelo com que o laboratório de imagens abre', () => {
  describe('o logo', () => {
    it('traz o nome inteiro, e não uma sigla que caiba', () => {
      expect(LOGO_INICIAL.texto.trim().length).toBeGreaterThan(MAXIMO_DE_LETRAS);
    });

    it('abre com o fundo chapado, que é o que tira a transparência do arquivo', () => {
      expect(LOGO_INICIAL.fundoBranco).toBe(true);
    });

    it('abre no maior tamanho do controle, que é o que estoura o orçamento', () => {
      expect(LOGO_INICIAL.tamanho).toBe(MAIOR_LADO_DO_LOGO);
    });

    it('põe texto claro sobre forma clara', () => {
      expect(contrastRatio(LOGO_INICIAL.fundo, LOGO_INICIAL.frente))
        .toBeLessThan(CONTRASTE_MINIMO);
    });
  });

  describe('os botões', () => {
    it('vêm em número menor que o pedido', () => {
      const preenchidos = BOTOES_INICIAIS.rotulos.filter(r => r.trim().length >= 2).length;
      expect(preenchidos).toBeLessThan(MINIMO_DE_BOTOES);
    });

    it('vêm baixos demais para o dedo', () => {
      expect(BOTOES_INICIAIS.altura).toBeLessThan(ALVO_DE_TOQUE);
    });

    it('vêm de canto reto, sem recorte nenhum para o PNG guardar', () => {
      expect(BOTOES_INICIAIS.raio).toBe(0);
    });

    it('vêm em cores fora da paleta segura da web', () => {
      expect(isWebSafe(BOTOES_INICIAIS.fundo) && isWebSafe(BOTOES_INICIAIS.frente)).toBe(false);
    });

    it('vêm com o rótulo apagado contra o fundo', () => {
      expect(contrastRatio(BOTOES_INICIAIS.fundo, BOTOES_INICIAIS.frente))
        .toBeLessThan(CONTRASTE_MINIMO);
    });
  });

  describe('o header', () => {
    it('vem sem título', () => {
      expect(HEADER_INICIAL.titulo.trim()).toBe('');
    });

    it('vem quase quadrado, e não em proporção de banner', () => {
      expect(HEADER_INICIAL.largura / HEADER_INICIAL.altura).toBeLessThan(PROPORCAO_MINIMA);
    });

    it('vem com o texto sumido nas duas pontas do degradê', () => {
      expect(contrastRatio(HEADER_INICIAL.de, HEADER_INICIAL.frente)).toBeLessThan(CONTRASTE_MINIMO);
      expect(contrastRatio(HEADER_INICIAL.ate, HEADER_INICIAL.frente)).toBeLessThan(CONTRASTE_MINIMO);
    });
  });
});
