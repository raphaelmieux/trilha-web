import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { mestrados, TRILHAS_DO_ME006 } from './mestrados';
import { codigoDaArte, coresDoCertificado, percursoDoCertificado } from './certificados';

/*
  O ME006 emite Token.Web(), e a conta de quem pode recebê-lo existe duas
  vezes: aqui, para a Faixa saber quando ele foi alcançado, e na Edge Function
  que emite o certificado, que não importa o aplicativo. Duas cópias divergem
  no primeiro ajuste — a Faixa acenderia o Mestrado e o servidor recusaria o
  documento, ou o contrário.
*/
describe('o ME006 nos dois lados', () => {
  const fonte = readFileSync('supabase/functions/issue-certification/index.ts', 'utf8');
  const bloco = fonte.slice(fonte.indexOf('ME006: {'), fonte.indexOf('};', fonte.indexOf('ME006: {')));

  it('a Edge Function lista as mesmas trilhas', () => {
    const naFuncao = [...bloco.matchAll(/"(AP\d{3}|HM\d{3})"/g)].map(m => m[1]);
    expect(naFuncao.length, 'a trava não achou a lista na função').toBeGreaterThan(5);
    expect([...naFuncao].sort()).toEqual([...TRILHAS_DO_ME006].sort());
  });

  it('e pede o mesmo mínimo', () => {
    const me006 = mestrados().find(m => m.code === 'mestrado_me006')!;
    expect(bloco).toContain(`minimo: ${me006.minimo}`);
  });

  it('o certificado dele tem nome, arte e texto branco', () => {
    expect(percursoDoCertificado('ME006')).toEqual({ nome: 'ME006 Mestrado em Ciência e Tecnologia', tipo: 'mestrado' });
    expect(codigoDaArte('ME006')).toBe('ME006');
    expect(coresDoCertificado('ME006').nome).toEqual([255, 255, 255]);
  });
});
