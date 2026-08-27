import { describe, it, expect } from 'vitest';
import { realcarLinhas, escapar, contarLinhas } from './realce';

/* O realce inteiro, num texto só: é sobre ele que valem as garantias de escape
   — o corte em linhas é arranjo de tela, e não pode mudar o que sai. */
const realcarHtml = (codigo: string) => realcarLinhas(codigo).join('\n');

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

describe('o corte em linhas', () => {
  it('devolve uma entrada por linha do original', () => {
    expect(realcarLinhas('<p>a</p>\n<p>b</p>')).toHaveLength(2);
    expect(realcarLinhas('a\n\nb')).toHaveLength(3);
    expect(realcarLinhas('')).toHaveLength(1);
  });

  it('anda junto com a régua, sempre', () => {
    for (const codigo of [
      '', 'x', '<a>\n</a>', '<!-- um\ndois\ntrês -->\n<p>fim</p>',
      '<img\n  src="a.png"\n  alt="a">', '\n\n\n', '<p>sem fechar',
    ]) {
      expect(realcarLinhas(codigo)).toHaveLength(contarLinhas(codigo));
    }
  });

  it('não deixa um span atravessar a quebra de linha', () => {
    /* Se um <span> abrisse numa linha e fechasse na outra, cada metade viraria
       marcação quebrada ao ser posta na página separadamente. */
    for (const linha of realcarLinhas('<!-- um\ndois -->')) {
      const abre = (linha.match(/<span/g) ?? []).length;
      const fecha = (linha.match(/<\/span>/g) ?? []).length;
      expect(abre).toBe(fecha);
    }
  });
});
