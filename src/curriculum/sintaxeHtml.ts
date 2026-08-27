/*
 * A mini-trilha de sintaxe do HTML.
 *
 * ── Por que existe ───────────────────────────────────────────────────────
 * Os laboratórios de código pedem que o desbravador escreva HTML, e a única
 * ajuda que havia era o passo a passo de quem já travou — que chega tarde e
 * fala de uma tarefa só. Faltava o lugar onde se aprende a coisa antes, e onde
 * se volta para conferir no meio: o que é uma tag, o que é um atributo, como
 * se escreve uma tabela.
 *
 * ── O que ela não é ──────────────────────────────────────────────────────
 * Não é tradução de referência nenhuma. O texto daqui é escrito para este
 * público — desbravador a partir de dez anos, exemplo do dia a dia do clube —
 * e cada exemplo roda de verdade, num quadro ao lado, porque ler marcação sem
 * ver o resultado é decorar sem entender.
 *
 * ── A forma ──────────────────────────────────────────────────────────────
 * Capítulo, tópico, exemplo, resultado, e a armadilha. Dá para ler em ordem,
 * do começo ao fim, e dá para cair direto no tópico da tabela quando é ela que
 * está faltando. A ordem dos capítulos é a ordem em que os laboratórios
 * cobram: esqueleto, texto, listas, links, imagens, tabelas, formulários,
 * cores, e o site de várias páginas.
 *
 * O conteúdo é código, como o resto do currículo: nada disto mora no banco.
 * A forma dos capítulos e dos tópicos mora em `miniTrilhas.ts`, que é o
 * registro: este arquivo é uma das trilhas, e não o molde delas.
 */

import type { CapituloDeMiniTrilha } from './miniTrilhas';

export const SINTAXE_HTML: CapituloDeMiniTrilha[] = [
  {
    id: 'comeco',
    titulo: 'Como uma página é feita',
    resumo: 'O que é uma tag, e qual é o esqueleto que toda página tem.',
    topicos: [
      {
        id: 'tag',
        titulo: 'A tag',
        resumo: 'Abrir, escrever dentro, fechar.',
        explicacao: [
          'HTML é texto com marcas. A marca diz o que aquele pedaço é: um título, um parágrafo, um link.',
          'Quase toda marca vem em par. A de abrir é o nome entre sinais de menor e maior, <p>. A de fechar é igual, com uma barra antes do nome, </p>. O que está no meio é o conteúdo.',
          'Quem lê a marca é o navegador. Ele não mostra o <p> na tela: ele entende "isto aqui é um parágrafo" e desenha do jeito de parágrafo.',
        ],
        exemplo: '<p>Nosso clube se chama Falcão Peregrino.</p>',
        atencao: 'Esquecer de fechar não dá erro na tela — dá um resultado esquisito, e às vezes só três telas depois. Feche assim que abrir, e escreva o conteúdo entre as duas.',
        marcas: ['<p>', '</p>'],
      },
      {
        id: 'esqueleto',
        titulo: 'O esqueleto do documento',
        resumo: 'As quatro peças que toda página precisa ter.',
        explicacao: [
          'Uma página não é só o texto que aparece. Ela tem uma parte que ninguém vê, com informações sobre ela mesma.',
          '<!DOCTYPE html> na primeira linha avisa que é HTML moderno. <html> envolve tudo. Dentro dele vêm dois blocos: <head>, com o que é sobre a página, e <body>, com o que aparece na tela.',
          'É sempre a mesma coisa, em toda página, em todo site. Copiar esse esqueleto de um arquivo para outro é o que se faz na vida real.',
        ],
        exemplo: `<!DOCTYPE html>
<html>
<head>
  <title>Clube Falcão Peregrino</title>
</head>
<body>
  <p>O que está no body é o que aparece.</p>
</body>
</html>`,
        atencao: 'O que você escreve dentro do <head> não aparece na página. Se o texto sumiu, veja se ele não caiu no lugar errado.',
        marcas: ['<!DOCTYPE html>', '<html>', '<head>', '<body>'],
      },
      {
        id: 'title',
        titulo: 'O nome da página',
        resumo: 'O <title> é o que aparece na aba do navegador.',
        explicacao: [
          'Dentro do <head> vai o <title>. Ele não aparece na página: aparece na aba, lá em cima, e é o nome que fica salvo quando alguém guarda o site nos favoritos.',
          'Cada página do site tem o seu. "Início", "Galeria", "Contato" — quem tem quatro abas abertas descobre qual é qual por aí.',
        ],
        exemplo: `<head>
  <title>Galeria — Clube Falcão Peregrino</title>
</head>`,
        atencao: 'Página sem título aparece como "index.html" na aba, e ninguém sabe o que é.',
        marcas: ['<title>'],
      },
      {
        id: 'comentario',
        titulo: 'Comentário',
        resumo: 'Bilhete para você mesmo, que não vai para a tela.',
        explicacao: [
          'Entre <!-- e --> você escreve o que quiser. O navegador pula.',
          'Serve para lembrar por que uma coisa está ali, ou para desligar um pedaço sem apagar.',
        ],
        exemplo: `<p>Este aparece.</p>
<!-- <p>Este não. Está comentado.</p> -->`,
        marcas: ['<!-- -->'],
      },
    ],
  },

  {
    id: 'texto',
    titulo: 'Texto',
    resumo: 'Títulos, parágrafos, ênfase e as duas linhas que não fecham.',
    topicos: [
      {
        id: 'titulos',
        titulo: 'Títulos: de <h1> a <h6>',
        resumo: 'Seis tamanhos, e o número diz a importância.',
        explicacao: [
          '<h1> é o título principal da página — o nome dela, e um por página basta. <h2> são as seções, <h3> as partes de uma seção, e assim por diante até <h6>.',
          'O número não é o tamanho: é o nível. O navegador desenha maior porque é mais importante, e não o contrário.',
          'Quem usa leitor de tela navega pulando de título em título. Uma página bem titulada é uma página que dá para percorrer sem enxergar.',
        ],
        exemplo: `<h1>Clube Falcão Peregrino</h1>
<h2>Nossas unidades</h2>
<h3>Unidade Águia</h3>`,
        atencao: 'Não escolha o título pelo tamanho da letra. Se ficou grande demais, o lugar de mudar isso é a cor e o estilo, não o nível.',
        marcas: ['<h1>', '<h2>', '<h3>', '<h4>', '<h5>', '<h6>'],
      },
      {
        id: 'paragrafo',
        titulo: 'Parágrafo',
        resumo: 'Cada bloco de texto vai dentro do seu <p>.',
        explicacao: [
          'Texto solto no <body> até aparece, mas o navegador não sabe onde um assunto termina e o outro começa.',
          'Cada parágrafo é um <p> inteiro, aberto e fechado. Dois parágrafos são dois <p>, e não um com uma linha em branco no meio: espaço em branco no código o navegador ignora.',
        ],
        exemplo: `<p>O clube se reúne aos sábados à tarde.</p>
<p>Quem tem de dez a quinze anos pode entrar.</p>`,
        atencao: 'Apertar Enter duas vezes dentro de um <p> não cria parágrafo nenhum. O navegador junta tudo numa linha só.',
        marcas: ['<p>'],
      },
      {
        id: 'enfase',
        titulo: 'Negrito e itálico',
        resumo: '<strong> e <em> marcam pedaços dentro de uma frase.',
        explicacao: [
          '<strong> deixa em negrito e diz "isto é importante". <em> deixa em itálico e diz "isto tem ênfase".',
          'Existem também <b> e <i>, que só mudam a aparência. Os laboratórios aceitam os dois pares; na vida, prefira <strong> e <em>, porque eles dizem por que o pedaço está marcado.',
          'Marcam um trecho no meio do texto, e por isso vão dentro do parágrafo — nunca em volta dele.',
        ],
        exemplo: '<p>A reunião é <strong>sábado, às 14h</strong>, e é <em>obrigatório</em> levar o lenço.</p>',
        marcas: ['<strong>', '<em>', '<b>', '<i>'],
      },
      {
        id: 'sozinhas',
        titulo: 'As tags que não fecham: <br> e <hr>',
        resumo: 'Duas marcas que não têm conteúdo, e por isso não têm fechamento.',
        explicacao: [
          '<br> quebra a linha ali mesmo. Serve para endereço e para verso de poesia — coisas em que a quebra faz parte do texto.',
          '<hr> desenha uma linha horizontal, separando duas partes do documento.',
          'Nenhuma das duas envolve nada, então não existe </br> nem </hr>. Escrever o fechamento não quebra a página, mas mostra que a regra não ficou clara.',
        ],
        exemplo: `<p>Rua das Palmeiras, 120<br>
Centro — Anápolis</p>
<hr>
<p>Depois da linha vem outro assunto.</p>`,
        atencao: 'Não use <br> para dar espaço entre parágrafos. Para isso existem dois <p>.',
        marcas: ['<br>', '<hr>'],
      },
    ],
  },

  {
    id: 'listas',
    titulo: 'Listas',
    resumo: 'Quando a ordem importa e quando não importa.',
    topicos: [
      {
        id: 'ul',
        titulo: 'Lista sem ordem',
        resumo: '<ul> com um <li> por item.',
        explicacao: [
          'Quando os itens não têm ordem — o que levar no acampamento, as unidades do clube —, a lista é <ul>.',
          'Cada item é um <li>. O navegador põe a bolinha sozinho: você não escreve o marcador.',
        ],
        exemplo: `<ul>
  <li>Cantil cheio</li>
  <li>Lanterna</li>
  <li>Lenço e boina</li>
</ul>`,
        atencao: 'Texto solto dentro de <ul>, fora de um <li>, sai do lugar. Tudo que está na lista vai dentro de um item.',
        marcas: ['<ul>', '<li>'],
      },
      {
        id: 'ol',
        titulo: 'Lista com ordem',
        resumo: '<ol> quando trocar a ordem muda o sentido.',
        explicacao: [
          'Se os itens são passos — montar a barraca, acender a fogueira —, a lista é <ol>, e o navegador numera sozinho.',
          'Isso é melhor do que escrever "1." na mão: acrescentar um passo no meio renumera tudo sem você tocar em nada.',
        ],
        exemplo: `<ol>
  <li>Escolher o terreno plano</li>
  <li>Estender a lona</li>
  <li>Fixar as estacas</li>
</ol>`,
        marcas: ['<ol>', '<li>'],
      },
    ],
  },

  {
    id: 'links',
    titulo: 'Links',
    resumo: 'A tag que liga uma página à outra — é ela que faz a web ser web.',
    topicos: [
      {
        id: 'a',
        titulo: 'O link',
        resumo: '<a href="destino">texto que aparece</a>.',
        explicacao: [
          'O link precisa das duas coisas: para onde ele vai, no atributo href, e o que a pessoa lê e clica, entre a marca de abrir e a de fechar.',
          'Faltando o href, não é link — é texto. Faltando o texto, existe um link que ninguém vê para clicar.',
        ],
        exemplo: '<p>Veja o <a href="https://adventistas.org">site oficial</a> da igreja.</p>',
        atencao: 'Não escreva "clique aqui". Quem usa leitor de tela ouve a lista de links da página fora do contexto, e "clique aqui" não diz para onde vai.',
        marcas: ['<a>', 'href'],
      },
      {
        id: 'relativo',
        titulo: 'Link entre as páginas do seu site',
        resumo: 'Dentro do mesmo site, o href é o nome do arquivo.',
        explicacao: [
          'Para ir a outra página sua, o href é só o nome do arquivo: href="galeria.html". Isso se chama caminho relativo — vale a partir da pasta onde a página está.',
          'O nome precisa bater letra por letra, inclusive maiúscula e minúscula. Galeria.html e galeria.html são dois arquivos diferentes no servidor, mesmo que no seu computador pareçam o mesmo.',
        ],
        exemplo: `<nav>
  <a href="index.html">Início</a>
  <a href="sobre.html">Sobre</a>
  <a href="galeria.html">Galeria</a>
  <a href="contato.html">Contato</a>
</nav>`,
        atencao: 'Link para um arquivo que não existe não avisa nada enquanto você escreve. Só quebra quando alguém clica.',
        marcas: ['href', '<nav>'],
      },
    ],
  },

  {
    id: 'imagens',
    titulo: 'Imagens',
    resumo: 'Como uma foto entra na página, e por que o alt não é enfeite.',
    topicos: [
      {
        id: 'img',
        titulo: 'A imagem',
        resumo: '<img> com src e alt, e sem fechamento.',
        explicacao: [
          'A imagem não fica dentro da página: a página aponta para o arquivo dela. O src diz qual arquivo.',
          'O alt é o texto que descreve a foto. Ele aparece quando a imagem não carrega, e é o que a pessoa cega ouve no lugar dela.',
          'A <img> não envolve nada, então não fecha.',
        ],
        exemplo: '<img src="fogueira.jpg" alt="Desbravadores em volta da fogueira no acampamento">',
        atencao: 'alt vazio é a mesma coisa que não ter alt: para quem depende dele, a imagem simplesmente não existe. Descreva o que se vê, não escreva "foto".',
        marcas: ['<img>', 'src', 'alt'],
      },
    ],
  },

  {
    id: 'tabelas',
    titulo: 'Tabelas',
    resumo: 'Dados em linhas e colunas — e só isso.',
    topicos: [
      {
        id: 'table',
        titulo: 'A tabela por dentro',
        resumo: '<table> tem linhas <tr>, e cada linha tem células.',
        explicacao: [
          'A tabela se lê de fora para dentro: <table> envolve tudo, <tr> é uma linha, e dentro de <tr> vêm as células.',
          'Não existe tag de coluna. A coluna nasce de todas as linhas terem o mesmo número de células.',
          'Tabela é para dado que tem linha e coluna — a escala do mês, os hinos do trimestre. Não é para arrumar a página.',
        ],
        exemplo: `<table>
  <tr>
    <td>03/05</td>
    <td>Ana</td>
  </tr>
  <tr>
    <td>10/05</td>
    <td>Bruno</td>
  </tr>
</table>`,
        atencao: 'Uma linha com menos células que as outras desalinha a tabela inteira dali para baixo.',
        marcas: ['<table>', '<tr>', '<td>'],
      },
      {
        id: 'th',
        titulo: 'A linha de cabeçalho',
        resumo: '<th> nomeia a coluna; <td> guarda o dado.',
        explicacao: [
          'A primeira linha costuma dizer o que cada coluna significa. Essas células são <th>, e não <td>.',
          'A diferença não é o negrito. É que o <th> diz ao leitor de tela que aquilo é o nome da coluna — e aí, ao ler a célula "Ana", ele consegue dizer "Responsável: Ana".',
        ],
        exemplo: `<table>
  <tr>
    <th>Sábado</th>
    <th>Responsável</th>
  </tr>
  <tr>
    <td>03/05</td>
    <td>Ana</td>
  </tr>
</table>`,
        marcas: ['<th>'],
      },
      {
        id: 'caption',
        titulo: 'A legenda',
        resumo: '<caption> diz do que trata a tabela.',
        explicacao: [
          'O <caption> vem logo depois de <table>, antes da primeira linha, e aparece acima dela.',
          'É a frase que responde "tabela de quê?" para quem chegou agora.',
        ],
        exemplo: `<table>
  <caption>Quem abre o programa em cada sábado</caption>
  <tr>
    <th>Sábado</th>
    <th>Responsável</th>
  </tr>
</table>`,
        atencao: 'O <caption> tem que ser o primeiro filho de <table>. Depois da primeira linha ele não vale.',
        marcas: ['<caption>'],
      },
    ],
  },

  {
    id: 'formularios',
    titulo: 'Formulários',
    resumo: 'Campos para quem visita escrever alguma coisa.',
    topicos: [
      {
        id: 'form',
        titulo: 'O formulário',
        resumo: '<form> com campo e botão.',
        explicacao: [
          '<form> envolve os campos. Dentro dele vêm os <input>, onde se digita, e um <button>, que envia.',
          'O <input> não fecha. O <button> fecha, e o texto dele é o que aparece escrito no botão.',
        ],
        exemplo: `<form>
  <input type="text">
  <button>Enviar</button>
</form>`,
        marcas: ['<form>', '<input>', '<button>'],
      },
      {
        id: 'label',
        titulo: 'A etiqueta do campo',
        resumo: '<label> diz o que se escreve naquele campo.',
        explicacao: [
          'Um campo sozinho é uma caixa vazia: ninguém sabe o que vai ali.',
          'O <label> dá nome ao campo. Ligado a ele pelo for e pelo id, clicar no texto põe o cursor dentro da caixa — e o leitor de tela anuncia o nome ao chegar no campo.',
        ],
        exemplo: `<form>
  <label for="nome">Seu nome</label>
  <input type="text" id="nome">
  <button>Enviar</button>
</form>`,
        atencao: 'O for do label tem que ser igual ao id do input, letra por letra. Diferente, é como se não houvesse etiqueta nenhuma.',
        marcas: ['<label>', 'for', 'id'],
      },
    ],
  },

  {
    id: 'atributos',
    titulo: 'Atributos e cor',
    resumo: 'Como se ajusta uma marca por dentro.',
    topicos: [
      {
        id: 'atributo',
        titulo: 'O que é um atributo',
        resumo: 'Informação extra, escrita dentro da tag de abrir.',
        explicacao: [
          'href, src, alt, id — todos são atributos. Vão dentro da marca de abrir, depois do nome, no formato nome="valor".',
          'O valor vai entre aspas. Vários atributos na mesma tag vão separados por espaço.',
          'Nunca na tag de fechar: </a> não leva atributo nenhum.',
        ],
        exemplo: '<img src="banner.png" alt="Banner do clube" id="topo">',
        marcas: ['href', 'src', 'alt', 'id'],
      },
      {
        id: 'cor',
        titulo: 'Cor em hexadecimal',
        resumo: '#RRGGBB — quanto de vermelho, de verde e de azul.',
        explicacao: [
          'A cor da tela é feita de três luzes: vermelho, verde e azul. O código hexadecimal diz quanto de cada uma, em três pares.',
          'Cada par vai de 00, que é nada, até FF, que é o máximo. Depois de 9 vêm A, B, C, D, E e F — por isso #FF0000 é vermelho puro, #00FF00 verde puro e #000000 preto, que é a ausência das três.',
          'Para pintar um texto, o atributo é style, com color: e o código.',
        ],
        exemplo: `<h1 style="color: #C13516">Clube Falcão Peregrino</h1>
<p style="color: #003366">Aventura, serviço e amizade.</p>`,
        atencao: 'Faltando o #, não é cor: o navegador ignora e o texto sai preto, sem avisar.',
        marcas: ['style', 'color'],
      },
    ],
  },

  {
    id: 'site',
    titulo: 'Um site de várias páginas',
    resumo: 'Como quatro arquivos viram um site só.',
    topicos: [
      {
        id: 'arquivos',
        titulo: 'Cada página é um arquivo',
        resumo: 'E cada arquivo é um documento completo.',
        explicacao: [
          'Um site de quatro páginas são quatro arquivos .html na mesma pasta.',
          'Não existe "página que herda o começo da outra": cada arquivo tem o esqueleto inteiro, do <!DOCTYPE html> ao </html>. Copiar de um para o outro e trocar o que muda é como se faz.',
          'index.html é o nome da página inicial. É esse arquivo que o servidor abre quando alguém entra no endereço do site sem pedir página nenhuma.',
        ],
        exemplo: `<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Início — Clube Falcão Peregrino</title>
</head>
<body>
  <h1>Clube Falcão Peregrino</h1>
</body>
</html>`,
        marcas: ['index.html'],
      },
      {
        id: 'menu',
        titulo: 'O menu que liga tudo',
        resumo: 'Os mesmos links, em todas as páginas.',
        explicacao: [
          'O que transforma quatro arquivos num site é o menu: um bloco de links, repetido igual em todas as páginas.',
          'Se uma página fica de fora do menu, ela existe e ninguém chega até ela — a não ser digitando o endereço. Na prática, ela não existe.',
          'O menu costuma ir dentro de <nav>, logo no começo do <body>. É por essa marca que o leitor de tela oferece "pular para a navegação".',
        ],
        exemplo: `<body>
  <nav>
    <a href="index.html">Início</a>
    <a href="sobre.html">Sobre</a>
    <a href="galeria.html">Galeria</a>
    <a href="contato.html">Contato</a>
  </nav>
  <h1>Galeria</h1>
</body>`,
        atencao: 'O menu tem que estar nas quatro páginas. Deixar de fora justamente a página em que a pessoa está é o erro comum — e aí não dá para voltar.',
        marcas: ['<nav>', '<a>'],
      },
    ],
  },
];
