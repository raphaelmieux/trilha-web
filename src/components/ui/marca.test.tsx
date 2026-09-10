import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import postcss from 'postcss';
import tailwind from 'tailwindcss';
import BrandMark, { MarcaEmTexto } from './BrandMark';
import { comMarca } from './comMarca';
import { MARCAS, NOME, MIOLO, PARENTESES, VERMELHO_DA_MARCA, partirNaMarca } from '../../lib/marca';

/*
  São duas marcas — `Trilha.Web()` e `Token.Web()` — e a regra é a mesma:
  Space Mono Bold, parênteses vermelhos.

  Vale em toda parte: a animação da tela de entrada, a barra fixa, o nome citado
  no meio de um parágrafo e os rodapés das fichas em PDF. O que ela tem de
  frágil é ser uma regra sobre texto — nada estoura quando alguém escreve um dos
  nomes à mão num componente novo, e o resultado é uma tela onde ele aparece sem
  os parênteses vermelhos, ao lado de outra onde aparece com. Ninguém repara
  olhando uma tela de cada vez.

  E as duas se encontram na mesma tela: a de entrada traz a plataforma no alto
  e "Recebeu um Token.Web()?" logo abaixo. Vestir uma e não a outra é o caso em
  que a diferença fica à vista.
*/

const RAIZ = resolve(__dirname, '../../..');

describe('os pedaços da marca', () => {
  /* A regra inteira depende desta igualdade: o miolo herda a cor do texto, os
     parênteses recebem o vermelho, e juntos têm de dar o nome de volta. */
  it.each(Object.entries(MARCAS))('o miolo de %s mais os parênteses dão o nome', (_, m) => {
    expect(m.miolo + PARENTESES).toBe(m.nome);
  });

  it('as duas marcas são nomes diferentes', () => {
    expect(MARCAS.plataforma.nome).not.toBe(MARCAS.token.nome);
  });

  it('`NOME` e `MIOLO` continuam sendo os da plataforma', () => {
    expect(NOME).toBe(MARCAS.plataforma.nome);
    expect(MIOLO).toBe(MARCAS.plataforma.miolo);
  });

  it('parte uma frase deixando só os parênteses vermelhos', () => {
    expect(partirNaMarca(`Há uma versão nova do ${NOME}.`)).toEqual([
      { texto: 'Há uma versão nova do ', daMarca: false },
      { texto: MIOLO, daMarca: false },
      { texto: PARENTESES, daMarca: true },
      { texto: '.', daMarca: false },
    ]);
  });

  /* Passar qualquer texto tem de ser seguro: o relatório monta a frase por
     interpolação, e nem toda frase que passa por aqui cita o nome. */
  it('devolve intacta a frase que não cita a marca', () => {
    expect(partirNaMarca('Uma frase qualquer.')).toEqual([
      { texto: 'Uma frase qualquer.', daMarca: false },
    ]);
  });

  it('veste as duas ocorrências quando o nome aparece duas vezes', () => {
    const vermelhos = partirNaMarca(`${NOME} e ${NOME}`).filter(p => p.daMarca);
    expect(vermelhos).toHaveLength(2);
  });

  /* A tela de entrada tem as duas: a plataforma no alto, o certificado logo
     abaixo. Partir uma marca de cada vez devolveria os pedaços fora de ordem. */
  it('veste as duas marcas na mesma frase, na ordem em que aparecem', () => {
    const pedacos = partirNaMarca(
      `Quem termina a ${NOME} recebe um ${MARCAS.token.nome} para conferir.`);
    expect(pedacos.map(p => p.texto).join('')).toBe(
      `Quem termina a ${NOME} recebe um ${MARCAS.token.nome} para conferir.`);
    expect(pedacos.filter(p => p.daMarca)).toHaveLength(2);
    expect(pedacos.findIndex(p => p.texto === MIOLO))
      .toBeLessThan(pedacos.findIndex(p => p.texto === MARCAS.token.miolo));
  });

  it('veste o certificado citado sozinho', () => {
    expect(partirNaMarca(`Recebeu um ${MARCAS.token.nome}?`)).toEqual([
      { texto: 'Recebeu um ', daMarca: false },
      { texto: MARCAS.token.miolo, daMarca: false },
      { texto: PARENTESES, daMarca: true },
      { texto: '?', daMarca: false },
    ]);
  });
});

describe('a marca desenhada', () => {
  /* O que importa é o `()` estar dentro do elemento que recebe a cor, e o
     miolo estar fora dele. Comparar o HTML inteiro com um texto esperado
     quebraria a cada ajuste de classe sem dizer nada sobre a regra. */
  const parentesesPintados = (html: string) =>
    /<span class="marca-parenteses">\(\)<\/span>/.test(html);

  it('a animada põe os parênteses no elemento que recebe a cor', () => {
    const html = renderToStaticMarkup(<BrandMark tamanho="nav" />);
    expect(parentesesPintados(html)).toBe(true);
  });

  /* A cópia invisível segura a largura e não pinta nada; a visível é a que
     digita. Se a digitação perdesse os parênteses pintados, a barra fixa
     mostraria o nome inteiro branco e ninguém veria erro nenhum. */
  it('a animada digita o nome inteiro, e não só o miolo', () => {
    const html = renderToStaticMarkup(<BrandMark tamanho="entrada" />);
    const texto = html.match(/<span class="marca-texto"[^>]*>(.*?)<\/span><\/span>$/s);
    expect(texto?.[1]).toContain(MIOLO);
    expect(texto?.[1]).toContain(PARENTESES);
  });

  it('a de texto corrido segue a mesma regra', () => {
    const html = renderToStaticMarkup(<MarcaEmTexto />);
    expect(parentesesPintados(html)).toBe(true);
    expect(html).toContain('marca-inline');
  });

  it('o certificado usa a mesma regra, e escreve o nome dele', () => {
    const html = renderToStaticMarkup(<MarcaEmTexto marca="token" />);
    expect(parentesesPintados(html)).toBe(true);
    expect(html).toContain(MARCAS.token.miolo);
    expect(html).not.toContain(MIOLO);
  });

  it('quem lê em voz alta ouve o nome inteiro', () => {
    expect(renderToStaticMarkup(<BrandMark />)).toContain(`aria-label="${NOME}"`);
  });

  it('`comMarca` veste o nome no meio de uma frase montada', () => {
    const html = renderToStaticMarkup(<p>{comMarca(`Percurso na ${NOME}, no clube.`)}</p>);
    expect(parentesesPintados(html)).toBe(true);
    expect(html).toContain('Percurso na ');
    expect(html).toContain(', no clube.');
  });

  it('`comMarca` não mexe na frase que não cita o nome', () => {
    const html = renderToStaticMarkup(<p>{comMarca('Uma frase qualquer.')}</p>);
    expect(html).not.toContain('marca-inline');
    expect(html).toContain('Uma frase qualquer.');
  });
});

/*
  A folha publicada, e não o arquivo de origem — a mesma razão do
  `seletorDeCores.test.ts`: quem pinta no navegador é o que sai do Tailwind.
*/
const folha = async (): Promise<string> => {
  const css = readFileSync(resolve(RAIZ, 'src/index.css'), 'utf8');
  const { css: saida } = await postcss([
    tailwind({ config: resolve(RAIZ, 'tailwind.config.js') }),
  ]).process(css, { from: resolve(RAIZ, 'src/index.css') });
  return saida;
};

/** O corpo da primeira regra com este seletor, na folha publicada. */
function regra(css: string, seletor: string): string | undefined {
  const escapado = seletor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return css.match(new RegExp(`(^|\\})\\s*${escapado}\\s*\\{([^}]*)\\}`, 'm'))?.[2];
}

describe('o vermelho da marca na folha publicada', () => {
  it('os parênteses saem do token da marca, e não de um hexadecimal solto', async () => {
    const corpo = regra(await folha(), '.marca-parenteses');
    expect(corpo,
      'a regra de `.marca-parenteses` sumiu da folha publicada — sem ela os '
      + 'parênteses saem da mesma cor do resto do nome, em toda tela de uma vez.',
    ).toBeTypeOf('string');
    expect(corpo).toMatch(/color:\s*var\(--color-primary\)/);
  });

  /* O cursor era `currentColor`, que na barra fixa é branco. Vermelho é o
     pedido, e é o que combina com os parênteses que ele acabou de digitar. */
  it('o cursor da digitação é do mesmo vermelho', async () => {
    const css = await folha();
    expect(regra(css, '.marca-texto')).toMatch(/border-right:[^;]*var\(--color-primary\)/);
    expect(css).toMatch(/@keyframes marca-cursor\s*\{[^}]*\{[^}]*var\(--color-primary\)/);
  });

  /*
    O PDF não tem custom property nenhuma, então o vermelho está escrito lá em
    números. Os dois precisam ser o mesmo vermelho: mudar o da plataforma e
    deixar o do papel para trás é a divergência que ninguém vê até comparar uma
    ficha impressa com a tela.
  */
  it('o vermelho do PDF é o mesmo `--color-primary` da tela', async () => {
    const raiz = regra(await folha(), ':root');
    const token = raiz?.match(/--color-primary:\s*(#[0-9a-fA-F]{6})/)?.[1];
    expect(token, '`--color-primary` sumiu de `:root`').toBeTypeOf('string');

    const [r, g, b] = VERMELHO_DA_MARCA;
    const emHex = `#${[r, g, b].map(n => n.toString(16).padStart(2, '0')).join('')}`;
    expect(emHex.toLowerCase()).toBe(token!.toLowerCase());
  });
});

/*
  ── A trava que impede a regra de se perder ──────────────────────────────

  Escrever `Trilha.Web()` ou `Token.Web()` direto no JSX de uma tela nova
  compila, passa por qualquer revisão, e produz uma tela onde a marca aparece
  sem os parênteses vermelhos. É invisível de dentro: a tela parece certa até
  alguém pôr as duas lado a lado.

  A trava olha para o **texto do JSX**, e não para toda ocorrência dos nomes:
  `pdf.ts`, `reportNarrative.ts`, `relatorioDeVeredas.ts` e o `ReportPage`
  guardam o nome em `string` de propósito, porque a frase montada ali é a que
  vai para o PDF — quem veste a marca é a tela, na hora de desenhar. Atributo
  também é literal, e é onde os dois nomes seguem crus com razão: o `title` do
  selo do `Emblema` e o `aria-label` da estante de insígnias são texto que o
  navegador lê, e não texto que ele pinta. Por isso literais e comentários saem
  antes da busca.
*/

/** O arquivo sem comentários e sem o conteúdo de nenhum literal de texto. */
function soOCodigo(fonte: string): string {
  return fonte
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ')
    .replace(/`(?:\\.|[^`\\])*`/g, '``')
    .replace(/'(?:\\.|[^'\\\n])*'/g, "''")
    .replace(/"(?:\\.|[^"\\\n])*"/g, '""');
}

function telas(dir: string, achados: string[] = []): string[] {
  for (const nome of readdirSync(dir)) {
    const caminho = resolve(dir, nome);
    if (statSync(caminho).isDirectory()) telas(caminho, achados);
    else if (nome.endsWith('.tsx') && !nome.includes('.test.')) achados.push(caminho);
  }
  return achados;
}

describe('nenhuma tela escreve a marca à mão', () => {
  const arquivos = telas(resolve(RAIZ, 'src'));

  /* Filtro que esvaziasse a lista deixaria a build verde por não ter conferido
     nada — a armadilha do "zero link não é zero link quebrado". */
  it('há tela para a trava conferir', () => {
    expect(arquivos.length).toBeGreaterThan(20);
  });

  /* E o contrário: um removedor de literais que engolisse o arquivo inteiro
     aprovaria qualquer coisa, calado. */
  it('a trava enxerga os dois nomes escritos no meio do JSX', () => {
    expect(soOCodigo('const a = 1;\nreturn <p>Trilha.Web() é livre.</p>;')).toContain(NOME);
    expect(soOCodigo('return <p>Recebeu um Token.Web()?</p>;')).toContain(MARCAS.token.nome);
    expect(soOCodigo("const a = 'Trilha.Web() — ficha';")).not.toContain(NOME);
    expect(soOCodigo('/* Token.Web() no comentário */')).not.toContain(MARCAS.token.nome);
  });

  it.each(Object.values(MARCAS).map(m => m.nome))('nenhuma tela escreve %s à mão', nome => {
    const culpados = arquivos
      .filter(caminho => soOCodigo(readFileSync(caminho, 'utf8')).includes(nome))
      .map(caminho => caminho.slice(RAIZ.length + 1));

    expect(culpados,
      `${culpados.join(', ')} — \`${nome}\` escrito à mão no JSX sai sem os parênteses `
      + 'vermelhos. Use `<MarcaEmTexto />` (ou `marca="token"`), ou `comMarca(frase)` '
      + 'quando o nome vier no meio de um texto já montado.',
    ).toEqual([]);
  });
});
