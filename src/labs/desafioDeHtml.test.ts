// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { validateHtml, validateSiteLinks } from '../lib/htmlValidator';
import {
  STARTERS, CHECK_IDS, PASSOS,
  PAGINAS_DO_SITE, STARTERS_DO_SITE, PASSOS_DO_SITE,
} from './desafioDeHtml';

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

/*
  O site de quatro páginas abria pior que a tabela: as quatro chegavam com
  esqueleto, título e o menu de navegação inteiro montado — vinte e duas das
  vinte e seis tarefas feitas antes de alguém digitar coisa alguma, e o menu
  pronto resolvia de fábrica justamente o que o requisito pede, que é
  interligar as páginas.

  O que sobra de propósito é o esqueleto de index.html: é de onde as outras
  três são copiadas, e a cópia é a lição.
*/
describe('o modelo com que o site de quatro páginas abre', () => {
  const doSite = () => {
    const daPagina = PAGINAS_DO_SITE.flatMap(p =>
      validateHtml(STARTERS_DO_SITE[p.file], ['html', 'head', 'body', 'title', 'heading'])
        .map(r => ({ ...r, id: `${p.file}:${r.id}` })));
    const ligacoes = validateSiteLinks(
      PAGINAS_DO_SITE.map(p => ({ filename: p.file, content: STARTERS_DO_SITE[p.file] })));
    const inicial = validateHtml(STARTERS_DO_SITE['index.html'], ['welcomeReason', 'welcomeImage']);
    const galeria = validateHtml(STARTERS_DO_SITE['galeria.html'], ['image']);
    const contato = validateHtml(STARTERS_DO_SITE['contato.html'], ['form']);
    return [...daPagina, ...ligacoes, ...inicial, ...galeria, ...contato];
  };

  it('entrega o esqueleto da página inicial, e nada além dele', () => {
    const verdes = doSite().filter(r => r.passed).map(r => r.id);
    expect(verdes).toEqual(['index.html:html', 'index.html:head', 'index.html:body']);
  });

  it('não monta o menu que interligar as páginas é o requisito', () => {
    for (const p of PAGINAS_DO_SITE) {
      expect(STARTERS_DO_SITE[p.file]).not.toContain('<a href=');
    }
  });

  it('deixa as outras três páginas em branco, para serem copiadas da primeira', () => {
    for (const p of PAGINAS_DO_SITE.slice(1)) {
      expect(STARTERS_DO_SITE[p.file].replace(/<!--[\s\S]*?-->/g, '').trim()).toBe('');
    }
  });

  it('tem o caminho de cada verificação que ele cobra', () => {
    const ids = ['html', 'head', 'body', 'title', 'heading', 'interlinked', 'noBrokenLinks',
      'welcomeReason', 'welcomeImage', 'image', 'form'];
    expect(ids.filter(id => !PASSOS_DO_SITE[id]?.length)).toEqual([]);
  });
});
