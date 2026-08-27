/*
 * O conteúdo dos dois desafios do editor de código: de onde a página parte,
 * o que é cobrado dela e o caminho de cada cobrança.
 *
 * ── Por que fora do componente ───────────────────────────────────────────
 * O desafio da tabela abria com oito das doze verificações já verdes. O
 * modelo trazia título, parágrafo, régua, link, uma tabela montada com
 * cabeçalho e uma linha de exemplo — sobrava trocar o texto das células, pôr
 * uma imagem e escolher uma cor. Quatro decisões numa lição de doze.
 *
 * O erro não aparece em tela nenhuma: o painel mostra oito tarefas concluídas,
 * que é exatamente o que se espera de alguém que já trabalhou. Por isso o
 * modelo mora aqui, onde `desafioDeHtml.test.ts` confere que ele continua
 * abrindo com tudo por fazer.
 *
 * ── E por que um documento vazio não é abandono ──────────────────────────
 * Tirar o andaime só é honesto se o caminho ficar: cada verificação tem o
 * passo a passo dela em PASSOS, e a moldura o oferece depois de um tempo sem
 * ninguém concluir nada. Antes, nenhuma das doze verificações da tabela tinha
 * passos — o desafio que mais dava trabalho era o único sem socorro.
 */

/**
 * Dois desafios, um editor.
 *
 * `elementos` é a passagem guiada pelos requisitos AP035-3.1 … 3.13: dezesseis
 * verificações, uma por elemento. `tabela` é o AP035-4.1, "criar página
 * completa" — e existe como desafio separado porque o currículo já apontou
 * essa lição para as mesmas dezesseis verificações, e o desbravador encontrava
 * a tela idêntica duas vezes. Aqui o que se julga é a página pronta.
 */
export type CodeLabVariant = 'elementos' | 'tabela';

export const STARTERS: Record<CodeLabVariant, string> = {
  /*
    A primeira lição de HTML da trilha. O esqueleto vem escrito porque é a
    primeira vez que o desbravador vê um: as dezesseis verificações são sobre
    os elementos que vão dentro dele.
  */
  elementos: `<!DOCTYPE html>
<html>
<head>
  <title>Meu Clube de Desbravadores</title>
</head>
<body>

  <!-- Escreva seu HTML aqui. A prévia ao lado atualiza sozinha. -->

</body>
</html>`,

  /*
    Aqui não. Esta lição vem depois, e o que ela cobra é a página inteira —
    inclusive o nome dela, que abre em branco de propósito. Documento novo é
    documento novo: o que ele precisa ter está na lista de tarefas, e é de lá
    que a pessoa tira o que fazer, não de um exemplo pronto para sobrescrever.
  */
  tabela: `<!DOCTYPE html>
<html>
<head>
  <title></title>
</head>
<body>

  <!-- Documento novo, ainda vazio.
       O que ele precisa ter está na lista de tarefas, ao lado.
       Comece dando um nome à página, na linha do title ali em cima. -->

</body>
</html>`,
};

export const CHECK_IDS: Record<CodeLabVariant, string[]> = {
  // Espelha os requisitos AP035-3.1 … 3.13.
  elementos: [
    'html', 'head', 'body', 'title', 'heading', 'paragraph', 'bold', 'italic',
    'listItem', 'link', 'lineBreak', 'image', 'horizontalRule',
    'table', 'tableRow', 'tableCell',
  ],
  // Requisito AP035-4.1, que nomeia cada uma destas.
  tabela: [
    'pageComplete', 'tableHeadingSize', 'tableStructure', 'tableHeader', 'tableSize',
    'tableFilled', 'tableGraphic', 'tableRule', 'tableLink', 'tableHexColour',
    'tableCaption', 'tableOwnContent',
  ],
};

/** O nome da pasta do projeto, na lateral do editor. */
export const PROJETO: Record<CodeLabVariant, string> = {
  elementos: 'meu-clube',
  tabela: 'escala-da-unidade',
};

/*
  O caminho de cada verificação que ainda falta, para quem empacar. A moldura
  só oferece isto depois de um tempo sem ninguém concluir nada.

  A chave é o `id` da verificação, o mesmo do validador — assim o passo a passo
  não tem como falar de um requisito e a lista falar de outro.
*/
export const PASSOS: Record<string, string[]> = {
  /* ── Os dezesseis elementos ── */
  doctype: ['Na primeira linha do arquivo, escreva <!DOCTYPE html>.'],
  html: ['Envolva a página inteira: <html> na segunda linha e </html> na última.'],
  head: ['Depois de <html>, abra <head> e feche </head>. É onde vão as informações da página.'],
  body: ['Depois do </head>, abra <body> e feche </body>. É o que aparece na tela.'],
  title: ['Dentro do <head>, escreva <title>Nome da página</title>.'],
  heading: ['Dentro do <body>, escreva <h1>Um título</h1>.'],
  paragraph: ['Dentro do <body>, escreva <p>Um parágrafo de texto.</p>.'],
  list: [
    'Abra uma lista com <ul> e feche com </ul>.',
    'Dentro dela, cada item é <li>texto do item</li>.',
    'Ponha pelo menos dois itens.',
  ],
  listItem: [
    'Abra uma lista com <ul> e feche com </ul>.',
    'Dentro dela, cada item é <li>texto do item</li>.',
  ],
  link: ['Escreva <a href="https://adventistas.org">Site oficial</a>.'],
  lineBreak: ['Escreva <br> onde a linha deve terminar. Ele não fecha: não existe </br>.'],
  image: [
    'Escreva <img src="foto.jpg" alt="Descrição da foto">.',
    'O alt não é enfeite: é o que a pessoa cega ouve no lugar da imagem.',
  ],
  horizontalRule: ['Escreva <hr> para separar duas partes da página. Ele também não fecha.'],
  table: [
    'Abra <table> e feche </table>.',
    'Cada linha é <tr>…</tr>, e cada célula, <td>…</td>.',
  ],
  tableRow: ['Dentro de <table>, abra uma linha com <tr> e feche com </tr>.'],
  tableCell: ['Dentro de <tr>, cada célula vai entre <td> e </td>.'],
  bold: ['Ponha <strong>alguma palavra</strong> no meio de um parágrafo.'],
  italic: ['Ponha <em>alguma palavra</em> no meio de um parágrafo.'],
  comment: ['Escreva um comentário: <!-- isto não aparece na página -->.'],
  form: [
    'Abra <form> e feche </form>.',
    'Dentro, ponha um <input> e um <button>Enviar</button>.',
  ],

  /* ── A página com tabela ── */
  pageComplete: [
    'Entre <title> e </title>, escreva o nome do documento — é ele que aparece na aba do navegador.',
    'Confira que <html>, <head> e <body> continuam abertos e fechados.',
  ],
  tableHeadingSize: [
    'Dentro do <body>, escreva <h1>Nome do documento</h1>.',
    'Embaixo dele, um <p> com uma ou duas frases dizendo do que trata o documento.',
    'O título sai maior que o parágrafo sem você pedir: quem faz isso é o <h1>, e é o que o requisito cobra.',
  ],
  tableStructure: [
    'Abra a tabela com <table> e feche com </table>.',
    'Dentro dela, cada linha vai entre <tr> e </tr>.',
  ],
  tableHeader: [
    'A primeira <tr> é a do cabeçalho.',
    'Nela, cada nome de coluna vai entre <th> e </th> — três, no mínimo.',
    'É o <th> que diz ao leitor de tela o que cada coluna significa; o <td> não diz nada.',
  ],
  tableSize: [
    'Depois da linha de cabeçalho, escreva mais três <tr>.',
    'Em cada uma, três células entre <td> e </td>.',
    'Fica uma tabela de quatro linhas por três colunas.',
  ],
  tableFilled: [
    'Procure a célula que ficou sem nada entre <td> e </td>.',
    'Escreva alguma coisa nela, ou apague a célula inteira.',
  ],
  tableGraphic: [
    'Escolha uma célula e ponha uma imagem dentro dela:',
    '<td><img src="foto.jpg" alt="Descrição da foto"></td>.',
    'O alt é o que a pessoa cega ouve no lugar da imagem — não deixe vazio.',
  ],
  tableRule: [
    'Entre o parágrafo e a tabela, escreva <hr>.',
    'Ele não fecha: é uma linha que separa as partes do documento.',
  ],
  tableLink: [
    'Depois da tabela, escreva <a href="https://adventistas.org">Site oficial</a>.',
    'Precisa das duas coisas: o endereço no href e o texto que aparece na página.',
  ],
  tableHexColour: [
    'Escolha um texto — o <h1>, por exemplo.',
    'Ponha style="color: #C13516" dentro da tag de abrir: <h1 style="color: #C13516">.',
    'Um # e seis algarismos de 0 a 9 ou letras de A a F: é assim que se escreve cor em hexadecimal.',
  ],
  tableCaption: [
    'Logo depois de <table>, escreva <caption>Do que trata esta tabela</caption>.',
    'É a legenda da tabela, e aparece acima dela.',
  ],
  tableOwnContent: [
    'Escreva nas células dados de verdade: a escala da unidade, os hinos do trimestre, o que você quiser tabelar.',
    'Coluna 1 e Dado 1 não valem — são nome de lugar guardado, e não informação.',
  ],
};
