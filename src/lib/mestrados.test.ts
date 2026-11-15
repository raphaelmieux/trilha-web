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

/*
  Quem já tinha fechado as trilhas antes de os Mestrados existirem recebe pela
  migration, e a lista de cada Mestrado está escrita lá em SQL. É a terceira
  cópia da mesma conta — a do aplicativo, a da Edge Function e esta —, e uma
  trilha a mais numa família faria a migration conceder com menos do que o
  aplicativo pede, ou o contrário.
*/
describe('a concessão retroativa usa as listas do aplicativo', () => {
  const sql = readFileSync('supabase/migrations/20261115130000_mestrados_de_quem_ja_tinha.sql', 'utf8');
  const linhas = [...sql.matchAll(/\('(mestrado_[a-z0-9_]+)', ARRAY\[([^\]]*)\], (\d+)\)/g)];

  it('acha as linhas', () => {
    expect(linhas.length, 'a trava não achou nenhuma linha na migration').toBeGreaterThanOrEqual(3);
  });

  it.each(linhas.map(l => [l[1], l[2], Number(l[3])] as const))('%s', (code, lista, minimo) => {
    const m = mestrados().find(x => x.code === code);
    expect(m, `${code} não existe em mestrados.ts`).toBeDefined();
    const trilhas = [...lista.matchAll(/'([A-Z]{2}\d{3})'/g)].map(x => x[1]);
    expect([...trilhas].sort()).toEqual([...m!.trilhas].sort());
    expect(minimo).toBe(m!.minimo);
  });
});
