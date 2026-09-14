import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import ts from 'typescript';

/*
  Trilha se chama trilha; vereda se chama vereda.

  ── O que a plataforma estava fazendo ─────────────────────────────────────
  "Percurso" virou o guarda-chuva das duas, porque no código elas de fato
  precisam de um nome que sirva às duas — o certificado é o mesmo documento, o
  emblema é o mesmo componente, o relatório lista as duas. E de dentro do
  código a palavra escorregou para a tela: "Percurso bloqueado" no selo do
  emblema, "Percurso" como cabeçalho na contabilidade do clube, "está em
  percurso" no relatório entregue à liderança do clube.

  Nada disso estoura. O que acontece é pior e mais lento: a plataforma passou
  meses estabelecendo que trilha e vereda são coisas diferentes — a vereda não
  tem requisito oficial, não tem nota e não entra em percentual nenhum —, e uma
  terceira palavra que cobre as duas desfaz isso em silêncio. Quem lê
  "percurso" não sabe qual das duas está vendo, e a distinção que o resto da
  tela ensina deixa de valer justamente onde alguém parou para ler.

  ── O que esta trava mede, e o que ela não mede ───────────────────────────
  Só o que aparece na tela: texto de JSX e literais de texto, lidos da árvore
  do TypeScript. Comentário não é nó e fica de fora sozinho; o miolo de
  `${...}` também, porque num template literal a árvore separa as partes de
  texto das expressões — e `${percurso.code}` põe na tela o código da trilha,
  não o nome da variável que o carrega. Procurar isso com expressão regular
  dava os dois erros ao mesmo tempo: acusava nome de variável e deixava passar
  texto de JSX que não coubesse no molde.

  Identificador continua podendo se chamar assim. `percursoDoCertificado`
  responde pelos dois currículos e precisa de um nome que sirva aos dois;
  rebatizá-lo não mudaria uma palavra do que o desbravador lê, e trocaria uma
  regra clara por cinquenta renomeações.
*/

function arquivosDeFonte(dir: string): string[] {
  return readdirSync(dir).flatMap(nome => {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) return arquivosDeFonte(caminho);
    return /\.tsx?$/.test(nome) && !/\.test\.tsx?$/.test(nome) ? [caminho] : [];
  });
}

const RAIZ = resolve(__dirname, '..');

/*
  Onde a palavra tem o outro sentido, e é o certo.

  A CC003 ensina caminho de arquivo, e "o caminho absoluto diz o percurso
  inteiro" é português comum falando de pasta — não de trilha nem de vereda.
  A exceção é por arquivo, e não por frase, de propósito: fixar a frase exata
  faria a trava reprovar no dia em que alguém melhorasse a redação da lição,
  que é o tipo de trava que se aprende a contornar.
*/
const COM_O_OUTRO_SENTIDO = ['curriculum/terminalEGit.ts'];

const PROIBIDA = /percurs/i;

interface Achado { onde: string; trecho: string }

/** Todo texto que chega à tela deste arquivo, com a linha de cada pedaço. */
function textoVisivel(arquivo: string): Achado[] {
  const fonte = readFileSync(arquivo, 'utf8');
  const sf = ts.createSourceFile(arquivo, fonte, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const achados: Achado[] = [];

  const registrar = (texto: string, pos: number) => {
    if (!PROIBIDA.test(texto)) return;
    const linha = sf.getLineAndCharacterOfPosition(pos).line + 1;
    achados.push({
      onde: `${relative(RAIZ, arquivo)}:${linha}`,
      trecho: texto.replace(/\s+/g, ' ').trim().slice(0, 90),
    });
  };

  const visitar = (no: ts.Node) => {
    if (ts.isJsxText(no) || ts.isStringLiteral(no) || ts.isNoSubstitutionTemplateLiteral(no)) {
      registrar(no.text, no.getStart(sf));
    } else if (ts.isTemplateExpression(no)) {
      /* Só as partes de texto: a árvore já separou delas as expressões. */
      registrar(no.head.text, no.head.getStart(sf));
      for (const pedaco of no.templateSpans) registrar(pedaco.literal.text, pedaco.literal.getStart(sf));
    }
    ts.forEachChild(no, visitar);
  };
  visitar(sf);

  return achados;
}

describe('o vocabulário da tela', () => {
  const arquivos = arquivosDeFonte(RAIZ);
  const achados = arquivos
    .filter(a => !COM_O_OUTRO_SENTIDO.some(permitido => a.endsWith(permitido)))
    .flatMap(textoVisivel);

  /* A guarda contra o vazio, que é a de sempre: uma leitura que parasse de
     achar arquivo deixaria a trava verde por não ter conferido nada. */
  it('lê a plataforma inteira', () => {
    expect(arquivos.length, 'a varredura não achou arquivo de fonte nenhum').toBeGreaterThan(100);
  });

  it('não chama trilha nem vereda de "percurso"', () => {
    expect(
      achados.map(a => `${a.onde} — "${a.trecho}"`),
      'trilha se chama trilha e vereda se chama vereda; ver o topo deste arquivo',
    ).toEqual([]);
  });

  /* E a exceção continua sendo exceção: um arquivo permitido que deixasse de
     usar a palavra viraria uma licença esquecida na lista, aberta para o dia
     em que alguém escrevesse ali o sentido errado. */
  it.each(COM_O_OUTRO_SENTIDO)('%s ainda usa a palavra no outro sentido', caminho => {
    const fonte = readFileSync(join(RAIZ, caminho), 'utf8');
    expect(PROIBIDA.test(fonte), `${caminho} não usa mais a palavra: tire-o da lista`).toBe(true);
  });
});
