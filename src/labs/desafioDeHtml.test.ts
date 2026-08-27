// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { validateHtml } from '../lib/htmlValidator';
import { STARTERS, CHECK_IDS, PASSOS } from './desafioDeHtml';

/*
  O laboratório abre com tudo por fazer, e é isso que estes testes cobram.

  O desafio da tabela abria com oito das doze verificações já verdes: o modelo
  trazia título, parágrafo, régua, link e uma tabela montada, e sobrava trocar
  o texto de seis células. O erro é invisível de dentro — o painel mostra oito
  concluídas, que é o que se espera de quem já trabalhou —, então quem percebe
  é o teste.
*/
describe('o modelo com que o desafio da tabela abre', () => {
  const resultados = validateHtml(STARTERS.tabela, CHECK_IDS.tabela);

  it('não entrega nenhuma verificação pronta', () => {
    const verdes = resultados.filter(r => r.passed).map(r => r.id);
    expect(verdes).toEqual([]);
  });

  it('mede as doze que o requisito nomeia', () => {
    expect(resultados).toHaveLength(CHECK_IDS.tabela.length);
    expect(resultados).toHaveLength(12);
  });

  /* O esqueleto está lá, e é por isso que a lição é sobre o conteúdo. O que
     falta nele é o nome da página, que a primeira verificação cobra. */
  it('parte de um documento com html, head e body escritos', () => {
    for (const tag of ['<html>', '<head>', '<body>']) {
      expect(STARTERS.tabela).toContain(tag);
    }
    expect(STARTERS.tabela, 'e com o nome da página em branco').toContain('<title></title>');
  });
});

/*
  Tirar o andaime só é honesto se o caminho ficar.

  Nenhuma das doze verificações da tabela tinha passo a passo: o desafio que
  mais dava trabalho era o único em que a moldura não tinha o que oferecer a
  quem travasse.
*/
describe('o passo a passo', () => {
  for (const variante of ['elementos', 'tabela'] as const) {
    it(`existe para toda verificação de ${variante}`, () => {
      const sem = CHECK_IDS[variante].filter(id => !PASSOS[id]?.length);
      expect(sem).toEqual([]);
    });
  }

  it('não entrega a resposta de "os dados são seus"', () => {
    /* O passo pode dizer que Coluna 1 não vale; não pode oferecer um conjunto
       de células pronto para copiar, ou a verificação vira digitação. */
    const texto = PASSOS.tableOwnContent.join(' ').toLowerCase();
    expect(texto).toContain('coluna 1');
    expect(texto).not.toContain('<td>');
  });
});

/*
  A primeira lição de HTML é outra história: o esqueleto vem pronto porque é a
  primeira vez que o desbravador vê um, e as dezesseis verificações são sobre o
  que vai dentro dele. O que este teste segura é que o modelo não cresça — que
  ninguém acrescente um <p> ou uma <table> de exemplo e entregue mais tarefas
  feitas de graça.
*/
describe('o modelo da primeira lição de HTML', () => {
  it('entrega o esqueleto, e nada além dele', () => {
    const verdes = validateHtml(STARTERS.elementos, CHECK_IDS.elementos)
      .filter(r => r.passed)
      .map(r => r.id);
    expect(verdes).toEqual(['html', 'head', 'body', 'title']);
  });
});
