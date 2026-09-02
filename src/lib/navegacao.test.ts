import { describe, it, expect } from 'vitest';
import { percursoAtual } from './navegacao';

/*
  O botão do menu levava a uma trilha escrita à mão. Quem estava numa lição da
  AP041 e clicava nele caía na AP034 — o botão nunca levava à trilha da tela,
  porque não olhava para a tela.

  Depois disso ele passou a olhar, e ficou cego para a vereda: quem estava numa
  vereda não tinha botão nenhum, e voltava pela home.
*/
describe('a trilha aberta', () => {
  it('sai do endereço da própria trilha', () => {
    expect(percursoAtual('/especialidade/AP041')?.rota).toBe('/especialidade/AP041');
  });

  it('sai também do endereço de uma lição, e leva à trilha dela', () => {
    expect(percursoAtual('/licao/AP041/AP041.4/AP041.4-L1')?.rota).toBe('/especialidade/AP041');
  });

  it('serve a uma trilha que ainda não existe: o código vem do endereço', () => {
    expect(percursoAtual('/licao/AP099/AP099.1/AP099.1-L1')?.rota).toBe('/especialidade/AP099');
  });

  it('chama-se Trilha Atual', () => {
    expect(percursoAtual('/especialidade/AP041')?.rotulo).toBe('Trilha Atual');
  });
});

describe('a vereda aberta', () => {
  it('leva de volta à página da vereda', () => {
    expect(percursoAtual('/vereda/CC001')?.rota).toBe('/vereda/CC001');
    expect(percursoAtual('/vereda/CC-FE002')?.rota).toBe('/vereda/CC-FE002');
  });

  /* Chamar a vereda de trilha desfaria de uma vez a distinção que o resto da
     plataforma sustenta com cuidado. */
  it('não se chama trilha', () => {
    expect(percursoAtual('/vereda/CC001')?.rotulo).toBe('Vereda Atual');
  });

  it('nunca manda para /especialidade', () => {
    expect(percursoAtual('/vereda/CC001')?.rota).not.toContain('especialidade');
  });
});

describe('fora de um percurso', () => {
  /* "Trilha Atual" sem trilha atual não é atalho: é promessa que a tela não
     pode cumprir, e antes ela era cumprida levando a pessoa a uma trilha
     qualquer. */
  it('não devolve nada, e aí o botão some', () => {
    for (const rota of ['/', '/relatorio', '/ranking', '/perfil', '/verificar', '/admin']) {
      expect(percursoAtual(rota), rota).toBeNull();
    }
  });

  it('não inventa código de trilha nenhum', () => {
    for (const rota of ['/', '/relatorio', '/perfil']) {
      expect(String(percursoAtual(rota)), rota).not.toMatch(/AP\d{3}/);
    }
  });
});
