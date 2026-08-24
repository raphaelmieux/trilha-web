import { describe, it, expect } from 'vitest';
import { rotaDaTrilhaAtual } from './navegacao';

/*
  O botão levava sempre à mesma trilha, escrita à mão no menu.

  Quem estava numa lição da AP041 e clicava nele saía da própria trilha e caía
  em outra. O sintoma que o Raphael descreveu é exato: "nunca vai na trilha do
  módulo que está na tela" — porque o botão não olhava para a tela.

  É o mesmo erro que este projeto já corrigiu em nove lugares: uma tela que sabe
  o código de uma trilha.
*/

describe('a trilha aberta agora', () => {
  it('sai do endereço da trilha', () => {
    expect(rotaDaTrilhaAtual('/especialidade/AP041')).toBe('/especialidade/AP041');
  });

  it('sai também do endereço de uma lição', () => {
    expect(rotaDaTrilhaAtual('/licao/AP041/AP041.4/AP041.4-L1')).toBe('/especialidade/AP041');
  });

  /* Trilha nova entra sozinha: nada aqui conhece códigos. */
  it('serve para uma trilha que o menu nunca viu', () => {
    expect(rotaDaTrilhaAtual('/licao/AP099/AP099.1/AP099.1-L1')).toBe('/especialidade/AP099');
  });

  /*
    Fora de uma trilha o item some. "Trilha Atual" sem trilha atual não é
    atalho: é promessa que a tela não cumpre — e antes ela era "cumprida"
    levando a pessoa para uma trilha qualquer.
  */
  it('não existe fora de uma trilha', () => {
    for (const rota of ['/', '/relatorio', '/perfil', '/ranking', '/verificar', '/admin', '/certificado/TW-XXXX']) {
      expect(rotaDaTrilhaAtual(rota), rota).toBeNull();
    }
  });

  /* A regressão a evitar: nenhum código de trilha escrito no menu. */
  it('nunca inventa uma trilha que não está no endereço', () => {
    for (const rota of ['/', '/relatorio', '/ranking']) {
      expect(String(rotaDaTrilhaAtual(rota)), rota).not.toMatch(/AP\d{3}/);
    }
  });
});
