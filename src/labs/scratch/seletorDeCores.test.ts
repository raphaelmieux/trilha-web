import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import postcss from 'postcss';
import tailwind from 'tailwindcss';

/*
  O seletor de cores do Scratch precisa ficar por cima do aplicativo.

  A `#root` a folha dá `position: relative; z-index: 1`, para que a casca fique
  acima da textura do globo. O efeito colateral é que `#root` vira um contexto
  de empilhamento e passa a ser pintado depois de todo irmão sem z-index
  próprio — e o editor de pintura do Scratch pendura o seletor de cores num
  popover do `react-popover` direto no `<body>`, sem z-index nenhum.

  O sintoma foi o pior que há: o popover existia, na posição certa e do tamanho
  certo, e era desenhado **debaixo** da tela inteira. Clicar em "Preencher" não
  fazia nada visível, nada aparecia no console, e trocar a cor de um ator ficou
  impossível na vereda de lógica.

  O teste roda a folha pelo Tailwind de verdade, e não lê o arquivo de origem:
  o que decide o empilhamento no navegador é a folha publicada, e é nela que os
  dois números têm de ser comparados. Ler o `.css` de entrada deixaria passar
  qualquer coisa que o processamento fizesse com a regra pelo caminho.

  E a comparação é entre os dois, e não com o 2 escrito: quem um dia precisar
  levantar o `#root` — outra camada de fundo, outra textura — vai mexer só nele,
  e o seletor de cores voltaria a sumir sem que nada acusasse.
*/

const RAIZ = resolve(__dirname, '../../..');

const folha = async (): Promise<string> => {
  const css = readFileSync(resolve(RAIZ, 'src/index.css'), 'utf8');
  const { css: saida } = await postcss([
    tailwind({ config: resolve(RAIZ, 'tailwind.config.js') }),
  ]).process(css, { from: resolve(RAIZ, 'src/index.css') });
  return saida;
};

/** O z-index que a folha publicada dá a um seletor. */
function zDe(css: string, seletor: string): number | undefined {
  const regra = new RegExp(
    `(^|\\})\\s*${seletor.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\s*\\{([^}]*)\\}`, 'm');
  const achado = css.match(regra);
  const z = achado?.[2].match(/z-index:\s*(-?\d+)/);
  return z ? Number(z[1]) : undefined;
}

describe('o seletor de cores do Scratch fica acima da casca', () => {
  it('o popover do editor de pintura sobrepõe o #root', async () => {
    const css = await folha();
    const raiz = zDe(css, '#root');
    const popover = zDe(css, 'body > .Popover');

    expect(raiz, '#root perdeu o z-index — a textura do globo depende dele').toBeTypeOf('number');
    expect(popover,
      'a regra de `body > .Popover` sumiu da folha publicada — sem ela o seletor '
      + 'de cores do editor de pintura é desenhado debaixo do aplicativo inteiro, '
      + 'e não há como trocar a cor de nada na vereda de lógica.').toBeTypeOf('number');
    expect(popover!).toBeGreaterThan(raiz!);
  });
});
