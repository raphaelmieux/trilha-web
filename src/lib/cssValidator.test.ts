// @vitest-environment jsdom
// Precisa de DOM: o validador usa o analisador de CSS do navegador, e não uma
// expressão regular. É o ponto do arquivo inteiro.
import { describe, it, expect } from 'vitest';
import { validateCss, lerFolha, IDS_DE_CSS } from './cssValidator';

/* A marcação contra a qual quase todo teste roda: tem tag, classe e id. */
const PAGINA = `
  <body>
    <header id="topo"><h1>Clube</h1></header>
    <main><p class="destaque">Aviso</p><p>Outro</p></main>
  </body>`;

const um = (css: string, id: string, markup = PAGINA) => validateCss(css, markup, [id])[0];

describe('lerFolha', () => {
  it('devolve só o que o navegador aceitou', () => {
    const regras = lerFolha('p { color: red; colr: blue }');
    expect(regras).toHaveLength(1);
    expect(regras[0].declaracoes).toHaveProperty('color');
    /* A propriedade escrita errada some sem erro. É por isso que a busca de
       texto mentiria aqui, e o analisador não. */
    expect(regras[0].declaracoes).not.toHaveProperty('colr');
  });

  it('carrega a consulta de mídia para as regras de dentro', () => {
    const regras = lerFolha('@media (max-width: 600px) { p { color: red } }');
    expect(regras[0].midia).toContain('max-width');
  });
});

describe('os seletores só valem se acertarem alguém', () => {
  it('aceita o seletor de elemento que existe na página', () => {
    expect(um('p { color: red }', 'seletorElemento').passed).toBe(true);
  });

  /*
    A armadilha central do CSS: nada acusa erro. Uma regra para uma classe que
    não existe é uma regra que não pinta nada, e aprovar isso ensinaria que
    escrever CSS basta — quando o que importa é ele chegar no elemento.
  */
  it('recusa a classe que a página não tem', () => {
    expect(um('.naoexiste { color: red }', 'seletorClasse').passed).toBe(false);
  });

  it('aceita a classe que a página tem', () => {
    expect(um('.destaque { color: red }', 'seletorClasse').passed).toBe(true);
  });

  it('aceita o identificador que a página tem, e recusa o que não tem', () => {
    expect(um('#topo { color: red }', 'seletorId').passed).toBe(true);
    expect(um('#rodape { color: red }', 'seletorId').passed).toBe(false);
  });

  it('não conta regra vazia como seletor demonstrado', () => {
    expect(um('p { }', 'seletorElemento').passed).toBe(false);
  });

  /* `.destaque p` continua sendo um seletor de elemento na ponta. */
  it('lê a última parte do seletor composto', () => {
    expect(um('main p { color: red }', 'seletorElemento').passed).toBe(true);
    expect(um('main .destaque { color: red }', 'seletorClasse').passed).toBe(true);
  });
});

describe('as propriedades', () => {
  it('reconhece cor, fundo, fonte e tamanho', () => {
    expect(um('p { color: #333 }', 'cor').passed).toBe(true);
    expect(um('p { background-color: #eee }', 'corDeFundo').passed).toBe(true);
    expect(um('p { font-family: Georgia, serif }', 'tipografia').passed).toBe(true);
    expect(um('p { font-size: 18px }', 'tamanhoDeTexto').passed).toBe(true);
  });

  it('reconhece as três partes do modelo de caixa, inteiras ou por lado', () => {
    expect(um('p { margin: 8px }', 'margem').passed).toBe(true);
    expect(um('p { margin-top: 8px }', 'margem').passed).toBe(true);
    expect(um('p { padding: 8px }', 'espacamento').passed).toBe(true);
    expect(um('p { border: 1px solid #333 }', 'borda').passed).toBe(true);
  });

  it('a propriedade escrita errada não conta', () => {
    expect(um('p { colr: red }', 'cor').passed).toBe(false);
  });
});

describe('a medida que acompanha a tela', () => {
  it('recusa a folha inteira em px', () => {
    expect(um('p { font-size: 18px; margin: 10px }', 'unidadeRelativa').passed).toBe(false);
  });

  it('aceita rem, em ou porcentagem', () => {
    expect(um('p { font-size: 1.2rem }', 'unidadeRelativa').passed).toBe(true);
    expect(um('p { padding: 0.5em }', 'unidadeRelativa').passed).toBe(true);
    expect(um('p { width: 80% }', 'unidadeRelativa').passed).toBe(true);
  });
});

describe('alinhar é mais do que declarar', () => {
  /*
    `display: flex` liga o modo e não alinha nada. O requisito pede
    "alinhamento com Flexbox", e uma verificação que passasse só com o display
    aprovaria quem não dispôs peça nenhuma.
  */
  it('recusa display: flex sozinho', () => {
    const r = um('main { display: flex }', 'flex');
    expect(r.passed).toBe(false);
    expect(r.detail).toContain('só liga o modo');
  });

  it('aceita flex com uma propriedade que dispõe', () => {
    expect(um('main { display: flex; justify-content: space-between }', 'flex').passed).toBe(true);
    expect(um('main { display: flex; gap: 1rem }', 'flex').passed).toBe(true);
  });

  it('recusa display: grid sem colunas, e aceita com', () => {
    expect(um('main { display: grid }', 'grid').passed).toBe(false);
    expect(um('main { display: grid; grid-template-columns: 1fr 1fr }', 'grid').passed).toBe(true);
  });

  it('não conta flex numa caixa que a página não tem', () => {
    expect(um('.grade { display: flex; gap: 1rem }', 'flex').passed).toBe(false);
  });
});

describe('a consulta de mídia', () => {
  /* Vazia é o mesmo vazio do "zero link não é zero link quebrado". */
  it('recusa @media sem nada dentro', () => {
    expect(um('@media (max-width: 600px) { }', 'consultaDeMidia').passed).toBe(false);
  });

  it('recusa @media que não fala de largura', () => {
    expect(um('@media print { p { color: black } }', 'consultaDeMidia').passed).toBe(false);
  });

  it('aceita @media de largura com regra dentro', () => {
    expect(um('@media (max-width: 600px) { p { font-size: 1rem } }', 'consultaDeMidia').passed).toBe(true);
  });
});

describe('a lista de verificações', () => {
  it('id desconhecido reprova com o motivo escrito, em vez de sumir', () => {
    const r = validateCss('p { color: red }', PAGINA, ['naoExiste'])[0];
    expect(r.passed).toBe(false);
    expect(r.detail).toContain('desconhecida');
  });

  it('toda verificação falha na folha vazia', () => {
    const r = validateCss('', PAGINA, IDS_DE_CSS);
    expect(r.every(x => !x.passed)).toBe(true);
    expect(r).toHaveLength(IDS_DE_CSS.length);
  });

  it('toda verificação tem rótulo e dica', () => {
    for (const r of validateCss('', PAGINA, IDS_DE_CSS)) {
      expect(r.label.length, r.id).toBeGreaterThan(0);
      expect(r.hint.length, r.id).toBeGreaterThan(0);
    }
  });
});
