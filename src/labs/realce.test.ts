import { describe, it, expect } from 'vitest';
import { realcarHtml, escapar, contarLinhas } from './realce';

/*
  O realce escreve HTML que vai para a página por cima do que o desbravador
  digitou. O teste que mais importa aqui não é de cor: é o de que nada do que
  ele escreveu vira marcação da plataforma.
*/

describe('nada do que a pessoa escreve vira marcação', () => {
  it('escapa os cinco caracteres que quebrariam a página', () => {
    expect(escapar(`& < > " '`)).toBe('&amp; &lt; &gt; &quot; &#39;');
  });

  /* O caso que dá o estrago: uma tag de script escrita dentro do editor. */
  it('não deixa passar um script escrito no editor', () => {
    const saida = realcarHtml('<script>alert(1)</script>');
    expect(saida).not.toContain('<script');
    expect(saida).toContain('&lt;');
    expect(saida).toContain('script');
  });

  it('não deixa passar um span forjado no meio do texto', () => {
    const saida = realcarHtml('<p>fim</span><span class="ide-tag">');
    /* Os únicos spans da saída são os que este arquivo escreve. */
    const spans = saida.match(/<span class="ide-\w+">/g) ?? [];
    const todos = saida.match(/<span/g) ?? [];
    expect(todos.length).toBe(spans.length);
  });

  it('escapa aspas dentro de valor de atributo', () => {
    expect(realcarHtml('<img alt="a&b">')).toContain('&amp;');
  });
});

describe('o que fica de cada cor', () => {
  it('pinta a tag, o atributo e o valor', () => {
    const saida = realcarHtml('<a href="x.html">');
    expect(saida).toContain('<span class="ide-tag">a</span>');
    expect(saida).toContain('<span class="ide-attr">href</span>');
    expect(saida).toContain('<span class="ide-val">&quot;x.html&quot;</span>');
  });

  it('pinta comentário inteiro de uma cor só', () => {
    expect(realcarHtml('<!-- escreva aqui -->'))
      .toContain('<span class="ide-com">&lt;!-- escreva aqui --&gt;</span>');
  });

  /* Comentário aberto e não fechado é o estado normal de quem está digitando:
     não pode fazer o realce parar de funcionar do cursor em diante. */
  it('aguenta comentário sem fechamento', () => {
    const saida = realcarHtml('<p>oi</p>\n<!-- come');
    expect(saida).toContain('ide-com');
    expect(saida).toContain('ide-tag');
  });

  it('aguenta tag pela metade, que é o que existe enquanto se digita', () => {
    expect(realcarHtml('<ul><li class="')).toContain('<span class="ide-tag">li</span>');
  });

  it('aceita atributo sem valor', () => {
    const saida = realcarHtml('<input required>');
    expect(saida).toContain('<span class="ide-attr">required</span>');
  });

  it('trata o texto fora das tags como texto', () => {
    expect(realcarHtml('<p>Bem-vindo</p>')).toContain('<span class="ide-txt">Bem-vindo</span>');
  });
});

describe('a régua da esquerda', () => {
  it('conta as linhas, inclusive a vazia do fim', () => {
    expect(contarLinhas('a\nb\nc')).toBe(3);
    expect(contarLinhas('a\n')).toBe(2);
    expect(contarLinhas('')).toBe(1);
  });
});
