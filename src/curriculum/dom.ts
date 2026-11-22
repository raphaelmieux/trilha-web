/*
 * A vereda CC-FE004 DOM.
 *
 * ── De onde ela vem ──────────────────────────────────────────────────────
 * Das duas anteriores ao mesmo tempo, e o requisito 1 diz isso: a CC-FE002,
 * que ensinou a dizer como a página se parece, e a CC-FE003, que ensinou a
 * linguagem — fora do navegador, de propósito. Esta é a vereda em que as
 * duas se encontram: o JavaScript volta para a página, e a página passa a
 * mudar depois de aberta.
 *
 * ── A página roda de verdade ─────────────────────────────────────────────
 * Todo exemplo que mexe na página é uma página: a marcação do tópico com o
 * script dele, na mesma página viva do laboratório. Clicar no botão do
 * exemplo faz o que o script diz, e o console embaixo mostra o que ele
 * escreveu. `exemplosDeDom.test.ts` roda cada um no jsdom e confere que não
 * há erro e que o console diz o que o tópico declara.
 *
 * ── A ordem ──────────────────────────────────────────────────────────────
 * A do documento: as três linguagens juntas (2 e 3), achar (4.1), mudar
 * (4.2), criar e remover (4.3), os eventos (4.4), o formulário (4.4 e 4.5),
 * a API (5), as ferramentas (6) e a página inteira (7). O requisito 4.1 e o
 * 4.2 viraram dois módulos, e não um: achar sem mudar nada é o que se faz
 * antes de mexer em qualquer página, e é onde mora o primeiro erro de todo
 * mundo — o seletor que não acha e devolve null.
 */

import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DE_DOM } from './questoesDeDom';

const CAPITULOS: { id: string; topicos: TopicoDeVereda[] }[] = [
  {
    id: 'juntos',
    topicos: [
      {
        id: 'tres-linguas',
        titulo: 'Três linguagens, três trabalhos',
        resumo: 'O HTML diz o que há, o CSS diz como se parece, o JavaScript diz o que acontece.',
        explicacao: [
          'Uma página da internet é feita de três linguagens, e cada uma tem um trabalho. O **HTML** diz o que existe: um título, um parágrafo, um botão. O **CSS** diz como cada coisa se parece: a cor, o tamanho, onde fica. E o **JavaScript** diz o que acontece: o que muda quando alguém clica, digita ou espera.',
          'As três moram em arquivos separados e se encontram no navegador. O `index.html` chama a folha de estilo com `<link rel="stylesheet" href="estilo.css">` e chama o script com `<script src="script.js">`. Sem essas duas linhas, os outros dois arquivos ficam na pasta e a página nem sabe que eles existem.',
          'Separar não é capricho. Quem vai mudar a cor do clube abre só o CSS; quem vai consertar o botão abre só o JavaScript. Tudo misturado num arquivo só, cada conserto mexe em todo o resto.',
        ],
        exemplo: `document.querySelector('#aviso').textContent = 'Reunião às 9h — não esqueça o lenço!';`,
        exemploComo: 'dom',
        exemploMarcacao: `<h2>Mural</h2>
<p id="aviso">Reunião às 9h</p>`,
        marcas: ['HTML', 'CSS', 'JavaScript', 'link', 'script'],
      },
      {
        id: 'o-dom',
        titulo: 'O DOM: a árvore que o navegador monta',
        resumo: 'O navegador lê o HTML e monta uma árvore. É nela que o script mexe.',
        explicacao: [
          'Quando a página abre, o navegador lê o HTML de cima para baixo e monta na memória uma **árvore**: o `<html>` no topo, o `<body>` dentro dele, e dentro do `<body>` cada título, lista e botão. Essa árvore se chama **DOM** — sigla em inglês para Modelo de Objetos do Documento.',
          'O script não mexe no arquivo `index.html`. Ele mexe na árvore. Trocar um texto pelo JavaScript muda o que está na tela, e o arquivo continua igual na pasta — recarregar a página traz o texto antigo de volta.',
          '`document` é o nome da árvore inteira dentro do script. Tudo o que esta vereda faz começa por ele.',
        ],
        exemplo: `const filhos = document.body.children;
console.log(filhos.length);
console.log(filhos[0].tagName);`,
        exemploComo: 'dom',
        exemploMarcacao: `<h2>Unidade Jatobá</h2>
<p>Seis membros.</p>
<button>Ver todos</button>`,
        exemploSaida: `4
H2`,
        atencao: 'O console diz 4, e a marcação tem três elementos: o quarto é o próprio `<script>`, que também mora no `<body>`. A árvore tem tudo o que o navegador leu.',
        marcas: ['DOM', 'document', 'árvore'],
      },
      {
        id: 'no',
        titulo: 'Nó: cada pedaço da árvore',
        resumo: 'Elemento é nó, e o texto entre eles também é.',
        explicacao: [
          'Cada pedaço da árvore é um **nó**. O `<li>` é um nó de elemento; o texto "Ana" dentro dele é outro nó, de texto, pendurado no primeiro. Até o espaço e a quebra de linha entre duas tags viram nós de texto.',
          '`children` lista só os filhos que são elementos. `childNodes` lista todos os nós, os de texto inclusive — e por isso dá um número maior numa lista escrita em várias linhas.',
          'Quase sempre se quer os elementos, e é por eles que esta vereda anda. Mas quando um número de filhos sair maior do que se esperava, é aqui que está a resposta.',
        ],
        exemplo: `const lista = document.querySelector('ul');
console.log(lista.childNodes.length, lista.children.length);`,
        exemploComo: 'dom',
        exemploMarcacao: `<ul>
  <li>Ana</li>
  <li>Bia</li>
</ul>`,
        exemploSaida: '5 2',
        marcas: ['nó', 'children', 'childNodes', 'elemento', 'texto'],
      },
      {
        id: 'renderizacao',
        titulo: 'Renderização: a árvore vira tela',
        resumo: 'O navegador desenha a árvore com o CSS, e desenha de novo quando ela muda.',
        explicacao: [
          '**Renderização** é o navegador desenhar a árvore na tela: ele junta cada nó com as regras do CSS, calcula onde cada coisa fica e pinta. É por isso que a mesma página sai diferente num celular e num computador — a árvore é a mesma, o desenho é outro.',
          'Quando o script muda a árvore — troca um texto, acrescenta um item, pinta um fundo —, o navegador desenha de novo a parte que mudou, sozinho. Ninguém manda redesenhar.',
        ],
        exemplo: `const faixa = document.querySelector('#faixa');
faixa.style.backgroundColor = '#2E7D32';
faixa.style.color = 'white';`,
        exemploComo: 'dom',
        exemploMarcacao: `<div id="faixa" style="padding: 10px">Unidade Jatobá</div>`,
        marcas: ['renderização', 'desenhar', 'CSS'],
      },
      {
        id: 'onde-o-script-mora',
        titulo: 'Onde o script mora',
        resumo: 'No fim do body, ou no head com defer — senão ele roda antes de a página existir.',
        explicacao: [
          'O navegador lê o HTML de cima para baixo, e o script roda **no ponto em que é lido**. Um `<script src="script.js">` no `<head>` roda antes de o `<body>` ser lido — e aí o `querySelector` procura um elemento que ainda não existe.',
          'Há dois lugares certos. Logo antes do `</body>`, quando tudo já foi lido. Ou no `<head>` com `defer`: `<script src="script.js" defer></script>` diz ao navegador para baixar o arquivo e esperar a página inteira antes de rodá-lo.',
        ],
        exemplo: `const fim = document.querySelector('#fim');
console.log(fim);`,
        exemploComo: 'dom',
        exemploMarcacao: `<p id="fim">Último parágrafo da página.</p>`,
        exemploSaida: '<p#fim>',
        atencao: 'O script no `<head>` sem `defer` não dá erro na linha dele: o erro aparece na linha seguinte, quando se tenta usar o `null` que o `querySelector` devolveu — "Cannot read properties of null".',
        marcas: ['defer', 'head', 'body', 'ordem'],
      },
    ],
  },
  {
    id: 'achar',
    topicos: [
      {
        id: 'query-selector',
        titulo: 'querySelector: achar um',
        resumo: 'O seletor do CSS, dentro do script, devolve o primeiro que casar.',
        explicacao: [
          '`document.querySelector` recebe um **seletor** — o mesmo que se escreve no CSS — e devolve o primeiro elemento da página que casa com ele. `#titulo` acha pelo id, `.membro` acha pela classe, `h2` acha pela tag.',
          'Ele devolve o **primeiro**, mesmo que haja dez. Quem precisa de todos usa o irmão dele, logo abaixo.',
        ],
        exemplo: `const titulo = document.querySelector('#titulo');
const primeiro = document.querySelector('.membro');
console.log(titulo.textContent);
console.log(primeiro.textContent);`,
        exemploComo: 'dom',
        exemploMarcacao: `<h2 id="titulo">Unidade Ipê</h2>
<ul>
  <li class="membro">Ana Clara</li>
  <li class="membro">Bruno</li>
</ul>`,
        exemploSaida: `Unidade Ipê
Ana Clara`,
        marcas: ['querySelector', 'seletor', 'id', 'classe'],
      },
      {
        id: 'query-selector-all',
        titulo: 'querySelectorAll: achar todos',
        resumo: 'Devolve uma lista com todos os que casam, e a lista tem tamanho.',
        explicacao: [
          '`document.querySelectorAll` devolve **todos** os elementos que casam com o seletor, numa lista chamada `NodeList`. Ela tem `length`, que diz quantos são, e se percorre com `for...of`, como um arranjo.',
          'Se nenhum casar, a lista vem vazia, com `length` zero — e não `null`. Um laço sobre ela simplesmente não roda nenhuma vez.',
        ],
        exemplo: `const membros = document.querySelectorAll('.membro');
console.log(membros.length);
for (const m of membros) {
  console.log(m.textContent);
}`,
        exemploComo: 'dom',
        exemploMarcacao: `<ul>
  <li class="membro">Ana Clara</li>
  <li class="membro">Bruno</li>
  <li class="membro">Davi</li>
</ul>`,
        exemploSaida: `3
Ana Clara
Bruno
Davi`,
        marcas: ['querySelectorAll', 'NodeList', 'length', 'for...of'],
      },
      {
        id: 'seletores-compostos',
        titulo: 'Seletores que dizem mais',
        resumo: 'Dentro de, com atributo, com duas classes.',
        explicacao: [
          'Um **espaço** entre dois seletores quer dizer "dentro de": `#membros li` acha os itens que moram dentro da seção `#membros`, e só eles.',
          'Atributo vai entre **colchetes**: `[data-cargo="conselheira"]` acha quem tem aquele atributo com aquele valor. E duas classes **coladas**, sem espaço, querem dizer "as duas ao mesmo tempo": `.pessoa.novato`.',
        ],
        exemplo: `console.log(document.querySelectorAll('#membros li').length);
console.log(document.querySelector('[data-cargo="conselheira"]').textContent);
console.log(document.querySelectorAll('.pessoa.novato').length);`,
        exemploComo: 'dom',
        exemploMarcacao: `<ul id="diretoria">
  <li class="pessoa" data-cargo="conselheira">Tia Lúcia</li>
</ul>
<ul id="membros">
  <li class="pessoa">Caio</li>
  <li class="pessoa novato">Lívia</li>
</ul>`,
        exemploSaida: `2
Tia Lúcia
1`,
        marcas: ['descendente', 'atributo', 'colchetes', 'duas classes'],
      },
      {
        id: 'null',
        titulo: 'Quando o seletor não acha: null',
        resumo: 'querySelector devolve null, e usar o null é o erro mais comum do DOM.',
        explicacao: [
          'Quando nenhum elemento casa, `querySelector` devolve `null` — "nada". Ele não avisa: devolve o nada e segue. O erro só aparece na linha seguinte, quando se tenta usar o que veio.',
          'A mensagem é sempre parecida: "Cannot read properties of null" ou "Cannot set properties of null". Quando ela aparecer, a pergunta é: o seletor está escrito certo? O elemento existe na página? O script rodou depois de a página existir?',
        ],
        exemplo: `const sumiu = document.querySelector('#nao-existe');
console.log(sumiu);`,
        exemploComo: 'dom',
        exemploMarcacao: `<p id="existe">Este existe.</p>`,
        exemploSaida: 'null',
        atencao: 'Esquecer o `#` é o engano mais frequente: `querySelector(\'titulo\')` procura uma tag chamada titulo, que não existe, e devolve `null`.',
        marcas: ['null', 'Cannot read properties of null'],
      },
      {
        id: 'get-element-by-id',
        titulo: 'getElementById, o jeito antigo',
        resumo: 'Acha pelo id, sem o #. Aparece muito nos exemplos da internet.',
        explicacao: [
          '`document.getElementById(\'titulo\')` faz o mesmo que `querySelector(\'#titulo\')`: acha o elemento com aquele id. A diferença é que ele recebe o id **sem** o `#`, porque já sabe que é id.',
          'Ele é mais antigo, e metade dos exemplos da internet ainda o usa. Os dois funcionam; esta vereda escreve `querySelector`, porque ele serve para qualquer seletor.',
        ],
        exemplo: `const a = document.getElementById('placar');
const b = document.querySelector('#placar');
console.log(a === b);`,
        exemploComo: 'dom',
        exemploMarcacao: `<p>Placar: <strong id="placar">0</strong></p>`,
        exemploSaida: 'true',
        marcas: ['getElementById'],
      },
    ],
  },
  {
    id: 'mudar',
    topicos: [
      {
        id: 'text-content',
        titulo: 'Trocar o texto: textContent',
        resumo: 'Lê e escreve o texto de um elemento.',
        explicacao: [
          '`elemento.textContent` é o texto que está dentro do elemento. Lido, ele devolve o texto; recebendo um valor, troca o texto inteiro por ele.',
          'O valor vira **texto**, sempre. Se o que se escreve tem cara de tag, como `<b>`, ele aparece na tela com os sinais de menor e maior — e é isso que torna o `textContent` seguro.',
        ],
        exemplo: `const placar = document.querySelector('#placar');
placar.textContent = 'Jatobá 3 × 2 Ipê';`,
        exemploComo: 'dom',
        exemploMarcacao: `<p id="placar">Placar ainda não saiu.</p>`,
        marcas: ['textContent'],
      },
      {
        id: 'style',
        titulo: 'Mudar o estilo: style',
        resumo: 'Cada propriedade do CSS, com o nome sem hífen.',
        explicacao: [
          '`elemento.style` dá acesso ao estilo do elemento. Cada propriedade do CSS está lá, com o nome escrito sem hífen e com a letra seguinte maiúscula: `background-color` vira `backgroundColor`, `font-size` vira `fontSize`.',
          'O valor é texto, com a unidade junto: `elemento.style.fontSize = \'20px\'`. Sem o `px`, o navegador ignora a linha, calado.',
        ],
        exemplo: `const faixa = document.querySelector('#faixa');
faixa.style.backgroundColor = '#1565C0';
faixa.style.color = 'white';
faixa.style.fontSize = '20px';`,
        exemploComo: 'dom',
        exemploMarcacao: `<div id="faixa" style="padding: 8px">Unidade Ipê</div>`,
        atencao: 'Número sem unidade não vale no estilo: `style.fontSize = 20` não muda nada, e nada avisa.',
        marcas: ['style', 'backgroundColor', 'camelCase'],
      },
      {
        id: 'class-list',
        titulo: 'Pôr e tirar classe: classList',
        resumo: 'add, remove e toggle, e o visual fica no CSS.',
        explicacao: [
          'Mudar o estilo linha a linha pelo script espalha o visual pelo JavaScript. O jeito mais limpo é deixar o visual no CSS, numa classe, e o script só **pôr e tirar** a classe.',
          '`classList.add(\'destaque\')` põe, `classList.remove(\'destaque\')` tira, e `classList.toggle(\'destaque\')` inverte: põe se não tem, tira se tem. `classList.contains(\'destaque\')` pergunta.',
        ],
        exemplo: `const itens = document.querySelectorAll('li');
itens[1].classList.add('destaque');
console.log(itens[1].classList.contains('destaque'));`,
        exemploComo: 'dom',
        exemploMarcacao: `<ul>
  <li>Ana Clara — 72 pontos</li>
  <li>Bruno — 38 pontos</li>
</ul>`,
        exemploSaida: 'true',
        marcas: ['classList', 'add', 'remove', 'toggle'],
      },
      {
        id: 'dataset',
        titulo: 'Atributos e o dataset',
        resumo: 'O que o HTML guarda num data-, o script lê como texto.',
        explicacao: [
          'Um atributo que começa com `data-` é um lugar para o HTML guardar um dado para o script: `<li data-pontos="72">`. O script o lê em `elemento.dataset.pontos`.',
          'O valor chega como **texto**, sempre, mesmo que pareça número. Somar dois deles com `+` junta os textos: "72" + "38" dá "7238". `Number()` converte antes da conta.',
        ],
        exemplo: `let soma = 0;
for (const m of document.querySelectorAll('li')) {
  soma = soma + Number(m.dataset.pontos);
}
console.log(soma);`,
        exemploComo: 'dom',
        exemploMarcacao: `<ul>
  <li data-pontos="72">Ana Clara</li>
  <li data-pontos="38">Bruno</li>
</ul>`,
        exemploSaida: '110',
        marcas: ['dataset', 'data-', 'getAttribute', 'Number'],
      },
      {
        id: 'hidden',
        titulo: 'Esconder e mostrar: hidden',
        resumo: 'O elemento continua na árvore, e sai da tela.',
        explicacao: [
          '`elemento.hidden = true` esconde o elemento; `false` mostra de novo. Ele continua na árvore, com tudo o que tinha — só não é desenhado.',
          'É diferente de tirar o elemento da página. Escondido, ele volta inteiro; removido, precisa ser criado de novo. Para um aviso que aparece e some, esconder é o certo.',
        ],
        exemplo: `const ajuda = document.querySelector('#ajuda');
ajuda.hidden = false;`,
        exemploComo: 'dom',
        exemploMarcacao: `<p>Clique em "Como funciona?" para ver a ajuda.</p>
<p id="ajuda" hidden>Cada clique conta uma presença.</p>`,
        marcas: ['hidden', 'esconder'],
      },
    ],
  },
  {
    id: 'criar',
    topicos: [
      {
        id: 'create-element',
        titulo: 'Criar um elemento',
        resumo: 'createElement cria; ele só aparece quando é pendurado na árvore.',
        explicacao: [
          '`document.createElement(\'li\')` cria um elemento novo, vazio, que ainda **não está na página**: ele existe só na memória. Depois de pôr o texto, é preciso pendurá-lo em alguém que já está na árvore.',
          'O jeito de sempre é um laço sobre os dados: um elemento novo para cada item, com o texto do item, pendurado na lista.',
        ],
        exemplo: `const tarefas = ['Montar a barraca', 'Recolher lenha', 'Encher os galões'];
const lista = document.querySelector('#tarefas');
for (const t of tarefas) {
  const item = document.createElement('li');
  item.textContent = t;
  lista.append(item);
}
console.log(lista.children.length);`,
        exemploComo: 'dom',
        exemploMarcacao: `<h3>Tarefas</h3>
<ul id="tarefas"></ul>`,
        exemploSaida: '3',
        marcas: ['createElement', 'append'],
      },
      {
        id: 'onde-pendurar',
        titulo: 'Onde pendurar',
        resumo: 'append põe no fim, prepend no começo, before e after ao lado.',
        explicacao: [
          '`lista.append(item)` põe o item como **último** filho da lista. `lista.prepend(item)` põe como primeiro.',
          '`elemento.before(novo)` e `elemento.after(novo)` põem o novo como irmão, logo antes ou logo depois do elemento — fora dele, e não dentro.',
        ],
        exemplo: `const lista = document.querySelector('ul');
const primeiro = document.createElement('li');
primeiro.textContent = 'Abertura';
lista.prepend(primeiro);
const ultimo = document.createElement('li');
ultimo.textContent = 'Encerramento';
lista.append(ultimo);`,
        exemploComo: 'dom',
        exemploMarcacao: `<ul>
  <li>Inspeção</li>
  <li>Especialidades</li>
</ul>`,
        marcas: ['append', 'prepend', 'before', 'after'],
      },
      {
        id: 'remove',
        titulo: 'Tirar da página',
        resumo: 'remove() tira o elemento da árvore, com tudo o que há dentro.',
        explicacao: [
          '`elemento.remove()` tira o elemento da árvore. Ele some da tela e deixa de ser achado pelo `querySelector`. Tudo o que estava dentro dele sai junto.',
          'Esconder com `hidden` não é tirar: o elemento escondido continua na árvore, e uma contagem de itens continua contando com ele.',
        ],
        exemplo: `document.querySelector('#carregando').remove();
console.log(document.querySelectorAll('li').length);`,
        exemploComo: 'dom',
        exemploMarcacao: `<ul>
  <li id="carregando">Carregando…</li>
  <li>Montar a barraca</li>
</ul>`,
        exemploSaida: '1',
        marcas: ['remove'],
      },
      {
        id: 'esvaziar',
        titulo: 'Esvaziar antes de desenhar de novo',
        resumo: 'textContent vazio tira todos os filhos de uma vez.',
        explicacao: [
          'Quem desenha uma lista a partir de dados vai desenhá-la de novo quando os dados mudarem. Se não esvaziar antes, a lista nova entra **embaixo** da velha, e a página mostra os dois.',
          '`lista.textContent = \'\'` tira todos os filhos de uma vez. É a primeira linha de toda função que desenha uma lista.',
        ],
        exemplo: `const lista = document.querySelector('ul');
function desenhar(nomes) {
  lista.textContent = '';
  for (const n of nomes) {
    const item = document.createElement('li');
    item.textContent = n;
    lista.append(item);
  }
}
desenhar(['Ana', 'Bia']);
desenhar(['Caio', 'Davi', 'Eva']);
console.log(lista.children.length);`,
        exemploComo: 'dom',
        exemploMarcacao: `<ul></ul>`,
        exemploSaida: '3',
        marcas: ['esvaziar', 'textContent', 'desenhar'],
      },
      {
        id: 'inner-html',
        titulo: 'innerHTML, e por que tomar cuidado',
        resumo: 'Ele lê as tags do texto. Com dado de fora, é uma porta aberta.',
        explicacao: [
          '`elemento.innerHTML` é parecido com o `textContent`, com uma diferença grande: ele **lê as tags** do que recebe. `innerHTML = \'<b>Oi</b>\'` põe um negrito na página.',
          'Isso é útil com texto que você mesmo escreveu, e perigoso com texto que veio de fora — o que alguém digitou num formulário, o que uma API devolveu. Se esse texto tiver uma tag, ela entra na página e faz o que quiser. Com dado de fora, use `textContent` e `createElement`.',
        ],
        exemplo: `const recado = 'Oi, <b>pessoal</b>!';
document.querySelector('#seguro').textContent = recado;
document.querySelector('#lido').innerHTML = recado;`,
        exemploComo: 'dom',
        exemploMarcacao: `<p id="seguro"></p>
<p id="lido"></p>`,
        atencao: 'O que alguém digitou nunca vai para o `innerHTML`. Uma tag escondida no nome de uma pessoa entraria na página de todo mundo que a visse.',
        marcas: ['innerHTML', 'segurança', 'textContent'],
      },
    ],
  },
  {
    id: 'eventos',
    topicos: [
      {
        id: 'evento',
        titulo: 'Evento: algo que acontece',
        resumo: 'Clicar, digitar, enviar: o navegador anuncia cada um.',
        explicacao: [
          'Um **evento** é algo que acontece na página: alguém clicou num botão, digitou numa caixa, enviou um formulário, apertou uma tecla. O navegador anuncia cada um, com um nome: `click`, `input`, `submit`, `keydown`.',
          'O script que só roda de cima para baixo e termina não reage a nada — ele já acabou quando a pessoa clica. Para reagir, ele deixa combinado de antemão o que fazer quando o evento acontecer.',
        ],
        marcas: ['evento', 'click', 'input', 'submit'],
      },
      {
        id: 'ouvinte',
        titulo: 'Ouvinte de evento',
        resumo: 'addEventListener combina: quando isto acontecer, rode esta função.',
        explicacao: [
          'Um **ouvinte de evento** é uma função que o navegador chama toda vez que um evento acontece num elemento. Quem a pendura é `addEventListener`: o nome do evento primeiro, a função depois.',
          'A função não roda na hora em que se escreve o `addEventListener`: ela fica guardada, e roda a cada clique. Três cliques, três vezes.',
        ],
        exemplo: `let presentes = 0;
const contador = document.querySelector('#presentes');
document.querySelector('#marcar').addEventListener('click', function () {
  presentes = presentes + 1;
  contador.textContent = presentes;
});`,
        exemploComo: 'dom',
        exemploMarcacao: `<p>Presentes: <strong id="presentes">0</strong></p>
<button id="marcar">Marcar presença</button>`,
        marcas: ['ouvinte', 'addEventListener', 'função'],
      },
      {
        id: 'chamar-ou-passar',
        titulo: 'Passar a função, e não chamar',
        resumo: 'contar é a função; contar() é o que ela devolve agora.',
        explicacao: [
          'O segundo argumento do `addEventListener` é a **função**. Escrever `addEventListener(\'click\', contar)` entrega a função para o navegador chamar depois.',
          'Escrever `addEventListener(\'click\', contar())`, com parênteses, **chama** a função ali mesmo, uma vez, quando a página abre — e entrega o que ela devolveu, que normalmente é `undefined`. O botão fica sem ouvinte nenhum.',
        ],
        exemplo: `const placar = document.querySelector('#placar');
function contar() {
  placar.textContent = Number(placar.textContent) + 1;
}
document.querySelector('#mais').addEventListener('click', contar);`,
        exemploComo: 'dom',
        exemploMarcacao: `<p>Pontos: <strong id="placar">0</strong></p>
<button id="mais">+1</button>`,
        atencao: 'Com `contar()` o placar já abre em 1, e o botão não faz mais nada. Parece que funcionou uma vez — e é o parêntese.',
        marcas: ['função', 'parênteses', 'callback'],
      },
      {
        id: 'input',
        titulo: 'Reagir à digitação: input',
        resumo: 'O evento input vem a cada letra; o valor está em value.',
        explicacao: [
          'O evento `input` acontece a **cada letra** digitada numa caixa de texto, e também quando se apaga. Dentro do ouvinte, o que está escrito agora mora em `caixa.value`.',
          'É o evento de toda busca que filtra enquanto se digita. O `change`, irmão dele, só acontece quando a pessoa sai da caixa — tarde demais para filtrar letra a letra.',
        ],
        exemplo: `const busca = document.querySelector('#busca');
busca.addEventListener('input', function () {
  const procurado = busca.value.toLowerCase();
  for (const item of document.querySelectorAll('li')) {
    const tem = item.textContent.toLowerCase().includes(procurado);
    item.classList.toggle('escondido', !tem);
  }
});`,
        exemploComo: 'dom',
        exemploMarcacao: `<input id="busca" placeholder="Procurar">
<ul>
  <li>Ana Clara</li>
  <li>Bruno</li>
  <li>Mariana</li>
</ul>`,
        marcas: ['input', 'value', 'filtrar', 'toLowerCase'],
      },
      {
        id: 'objeto-do-evento',
        titulo: 'O que o evento conta',
        resumo: 'O ouvinte recebe um objeto com os detalhes: quem, qual tecla.',
        explicacao: [
          'O navegador entrega ao ouvinte um objeto com os detalhes do que aconteceu — costuma se chamar `evento`, ou só `e`. `evento.target` é o elemento em que aconteceu; num `keydown`, `evento.key` é a tecla apertada.',
          'Com ele, um ouvinte só serve para vários botões: pendurado na lista, ele descobre em `target` qual item foi clicado.',
        ],
        exemplo: `const escolha = document.querySelector('#escolha');
document.querySelector('ul').addEventListener('click', function (evento) {
  escolha.textContent = evento.target.textContent;
});`,
        exemploComo: 'dom',
        exemploMarcacao: `<ul>
  <li>Jatobá</li>
  <li>Ipê</li>
  <li>Buriti</li>
</ul>
<p>Você escolheu: <strong id="escolha">ninguém ainda</strong></p>`,
        marcas: ['target', 'key', 'evento'],
      },
    ],
  },
  {
    id: 'formulario',
    topicos: [
      {
        id: 'submit-recarrega',
        titulo: 'Enviar recarrega a página',
        resumo: 'O formulário, sozinho, manda os dados e recarrega. preventDefault impede.',
        explicacao: [
          'Um formulário tem um comportamento de fábrica: ao enviar, o navegador manda os dados para algum lugar e **recarrega a página**. Tudo o que estava digitado some, e o que o script tinha feito também.',
          'Para cuidar do envio pelo script, ouve-se o evento `submit` do formulário, e a primeira linha do ouvinte é `evento.preventDefault()` — "não faça o que faria de fábrica".',
        ],
        exemplo: `const formulario = document.querySelector('form');
formulario.addEventListener('submit', function (evento) {
  evento.preventDefault();
  document.querySelector('#recado').textContent = 'Recebido, sem recarregar.';
});`,
        exemploComo: 'dom',
        exemploMarcacao: `<form>
  <input placeholder="Seu nome">
  <button>Enviar</button>
</form>
<p id="recado"></p>`,
        atencao: 'Ouvir o `click` do botão em vez do `submit` do formulário deixa de fora quem aperta Enter dentro da caixa — e esse envio recarrega a página.',
        marcas: ['submit', 'preventDefault', 'recarregar'],
      },
      {
        id: 'ler-campos',
        titulo: 'Ler os campos',
        resumo: 'value é sempre texto, mesmo no campo de número.',
        explicacao: [
          'O que alguém digitou mora em `campo.value`, e é **texto**, sempre — inclusive num `<input type="number">`. Para comparar com um número, `Number(campo.value)` converte antes.',
          'Espaço sobrando também conta como texto: "  " não é vazio. `campo.value.trim()` tira os espaços das pontas antes de perguntar se o nome foi escrito.',
        ],
        exemplo: `const idade = document.querySelector('#idade');
idade.value = '12';
console.log(typeof idade.value, idade.value + 1, Number(idade.value) + 1);`,
        exemploComo: 'dom',
        exemploMarcacao: `<label>Idade <input id="idade" type="number"></label>`,
        exemploSaida: 'string 121 13',
        marcas: ['value', 'Number', 'trim'],
      },
      {
        id: 'validar',
        titulo: 'Conferir antes de aceitar',
        resumo: 'Um problema por campo, dito ao lado do campo.',
        explicacao: [
          'Validar é conferir cada campo antes de aceitar o envio: nome vazio, idade fora da faixa, unidade não escolhida. Para cada problema, uma mensagem **perto do campo** em que ele está — escrever "formulário inválido" no topo obriga a pessoa a adivinhar qual.',
          'Se algum campo deu problema, o envio para ali: nada entra na lista. Só quando tudo passou o dado é aceito.',
        ],
        exemplo: `document.querySelector('form').addEventListener('submit', function (evento) {
  evento.preventDefault();
  const idade = Number(document.querySelector('#idade').value);
  const erro = document.querySelector('#erro-idade');
  if (idade < 10 || idade > 15) {
    erro.textContent = 'A idade de desbravador vai de 10 a 15 anos.';
  } else {
    erro.textContent = '';
  }
});`,
        exemploComo: 'dom',
        exemploMarcacao: `<form novalidate>
  <label>Idade <input id="idade" type="number"></label>
  <p id="erro-idade" style="color: #9A3B2F"></p>
  <button>Inscrever</button>
</form>`,
        marcas: ['validar', 'mensagem de erro'],
      },
      {
        id: 'limpar',
        titulo: 'Depois de aceitar, limpar',
        resumo: 'reset esvazia os campos; os avisos se limpam à mão.',
        explicacao: [
          'Aceito o envio, o formulário volta ao começo para a próxima pessoa: `formulario.reset()` esvazia todos os campos de uma vez.',
          'Os avisos de erro não são campos, e o `reset` não os toca. Quem consertou o nome e enviou de novo precisa ver o aviso do nome sumir — senão a tela continua dizendo que há um problema que já não existe.',
        ],
        exemplo: `const formulario = document.querySelector('form');
formulario.addEventListener('submit', function (evento) {
  evento.preventDefault();
  const item = document.createElement('li');
  item.textContent = document.querySelector('#nome').value;
  document.querySelector('#inscritos').append(item);
  formulario.reset();
});`,
        exemploComo: 'dom',
        exemploMarcacao: `<form>
  <input id="nome" placeholder="Nome">
  <button>Inscrever</button>
</form>
<ul id="inscritos"></ul>`,
        marcas: ['reset', 'limpar'],
      },
      {
        id: 'html-tambem-valida',
        titulo: 'O HTML também confere, e não basta',
        resumo: 'required e min conferem no navegador; o servidor confere de novo.',
        explicacao: [
          'O próprio HTML sabe conferir algumas coisas: `required` recusa campo vazio, `min` e `max` recusam número fora da faixa, `type="email"` recusa o que não tem cara de e-mail. O navegador mostra um balão e não envia.',
          'Com `novalidate` no formulário, o navegador deixa a conferência toda para o script — é o que as lições daqui fazem, para a mensagem ser a nossa. E nenhuma das duas basta sozinha: o que sai do navegador pode ser mexido por quem quiser, e quem recebe os dados confere de novo.',
        ],
        marcas: ['required', 'novalidate', 'min', 'max'],
      },
    ],
  },
  {
    id: 'api',
    topicos: [
      {
        id: 'o-que-e-api',
        titulo: 'API: um jeito combinado de pedir',
        resumo: 'Um endereço que responde com dados, em vez de uma página.',
        explicacao: [
          'Uma **API** é um jeito combinado de um programa pedir coisas a outro. Na internet, ela costuma ser um endereço que, em vez de devolver uma página para pessoas lerem, devolve **dados** para programas usarem — quase sempre em JSON.',
          'A BrasilAPI é uma API pública, gratuita, feita por voluntários. O endereço `https://brasilapi.com.br/api/ibge/uf/v1` devolve os 27 estados do Brasil; `https://brasilapi.com.br/api/feriados/v1/2026` devolve os feriados nacionais de 2026. No laboratório, as respostas vêm de uma cópia guardada em novembro de 2026, para darem o mesmo resultado todo dia.',
        ],
        exemplo: `fetch('https://brasilapi.com.br/api/ibge/uf/v1')
  .then(resposta => resposta.json())
  .then(estados => console.log(estados.length, estados[0].nome));`,
        exemploComo: 'dom',
        exemploMarcacao: `<p>Abra o console embaixo: a resposta chega depois.</p>`,
        exemploSaida: '27 Rondônia',
        marcas: ['API', 'BrasilAPI', 'JSON', 'endereço'],
      },
      {
        id: 'fetch-await',
        titulo: 'fetch com async e await',
        resumo: 'Pedir, esperar a resposta, ler o JSON.',
        explicacao: [
          '`fetch(endereco)` faz o pedido e devolve uma promessa, a mesma da CC-FE003: a resposta chega depois. Dentro de uma função `async`, `await` espera por ela sem travar a página.',
          'A resposta não é o dado ainda: é o envelope. `await resposta.json()` abre o envelope e devolve o dado, já como objeto ou arranjo do JavaScript.',
        ],
        exemplo: `async function primeiroFeriado() {
  const resposta = await fetch('https://brasilapi.com.br/api/feriados/v1/2026');
  const feriados = await resposta.json();
  document.querySelector('#primeiro').textContent = feriados[0].name;
  console.log(feriados[0].date);
}
primeiroFeriado();`,
        exemploComo: 'dom',
        exemploMarcacao: `<p>O primeiro feriado do ano: <strong id="primeiro">…</strong></p>`,
        exemploSaida: '2026-01-01',
        marcas: ['fetch', 'async', 'await', 'json'],
      },
      {
        id: 'resposta-ok',
        titulo: 'Resposta com erro não é falha de rede',
        resumo: 'Um 404 chega como resposta. Quem diz se deu certo é ok.',
        explicacao: [
          'A API pode responder "não achei" — o código **404** — e isso, para o `fetch`, é uma resposta como outra qualquer: a promessa se cumpre normalmente, com o erro dentro. `resposta.ok` diz se o código foi de sucesso, e `resposta.status` diz qual foi.',
          'Por isso o `fetch` que deu certo ainda precisa de uma pergunta: `if (!resposta.ok)` — e aí a página diz o que aconteceu, em vez de tentar mostrar um dado que não veio.',
        ],
        exemplo: `async function feriadosDe(ano) {
  const resposta = await fetch('https://brasilapi.com.br/api/feriados/v1/' + ano);
  console.log(resposta.status, resposta.ok);
}
feriadosDe(1800);`,
        exemploComo: 'dom',
        exemploMarcacao: `<p>O ano de 1800 está fora do que a API sabe responder.</p>`,
        exemploSaida: '404 false',
        marcas: ['ok', 'status', '404'],
      },
      {
        id: 'falha-de-rede',
        titulo: 'Quando a rede cai',
        resumo: 'Sem conexão o fetch rejeita, e quem trata é o catch.',
        explicacao: [
          'Sem internet, não há resposta nenhuma: a promessa do `fetch` é **rejeitada**, com "Failed to fetch". Se ninguém tratar, o erro escapa para o console — "Uncaught (in promise)" — e a página fica parada, sem dizer nada a quem está olhando.',
          'Com `try` e `catch` em volta do pedido, a falha cai no `catch`, e é ali que a página avisa: "Não foi possível buscar os dados. Confira a conexão." O `finally`, que vem depois, roda dando certo ou errado — é o lugar de esconder o "Carregando…".',
        ],
        exemplo: `async function carregar() {
  const aviso = document.querySelector('#aviso');
  try {
    const resposta = await fetch('https://brasilapi.com.br/api/ibge/uf/v1');
    const estados = await resposta.json();
    aviso.textContent = estados.length + ' estados carregados.';
  } catch (erro) {
    aviso.textContent = 'Não foi possível buscar os estados. Confira a conexão.';
  } finally {
    document.querySelector('#carregando').hidden = true;
  }
}
carregar();`,
        exemploComo: 'dom',
        exemploMarcacao: `<p id="carregando">Carregando…</p>
<p id="aviso"></p>`,
        atencao: 'No laboratório, o painel Rede tem "Sem conexão": com ele, a prévia passa a pedir sem internet, e dá para ver o `catch` funcionar.',
        marcas: ['try', 'catch', 'finally', 'Failed to fetch'],
      },
      {
        id: 'mostrar-espera',
        titulo: 'Mostrar que está esperando',
        resumo: 'Entre pedir e receber, a página diz que está buscando.',
        explicacao: [
          'Uma resposta pela rede leva de um instante a vários segundos. Nesse meio tempo, a página vazia parece quebrada: quem olha não sabe se é para esperar ou recarregar.',
          'O costume é mostrar um "Carregando…" ao pedir e escondê-lo quando a resposta chega — ou quando a falha chega, que é por que ele mora no `finally`.',
        ],
        marcas: ['carregando', 'espera'],
      },
    ],
  },
  {
    id: 'ferramentas',
    topicos: [
      {
        id: 'abrir',
        titulo: 'As ferramentas do navegador',
        resumo: 'F12 abre. Elementos, Console, Rede e Fontes são as quatro que importam.',
        explicacao: [
          'Todo navegador de computador traz **ferramentas de desenvolvedor**: F12, ou Ctrl+Shift+I, ou o botão direito em cima de qualquer coisa e "Inspecionar". Elas abrem num painel ao lado ou embaixo da página.',
          'São muitas guias, e quatro fazem quase todo o trabalho: **Elementos** mostra a árvore; **Console** mostra o que o script escreveu e os erros; **Rede** mostra os pedidos; **Fontes** mostra os arquivos e deixa pôr paradas. No laboratório elas ficam embaixo da prévia, com esses nomes.',
        ],
        marcas: ['F12', 'Inspecionar', 'ferramentas de desenvolvedor'],
      },
      {
        id: 'elementos',
        titulo: 'Elementos: a árvore viva',
        resumo: 'Mostra o DOM de agora, e não o arquivo. E os estilos calculados.',
        explicacao: [
          'A guia **Elementos** mostra a árvore como ela está **agora** — com o que o script acrescentou, tirou ou mudou. Não é o `index.html` da pasta: um item criado pelo `createElement` aparece ali e não aparece no arquivo.',
          'Escolhido um elemento, o painel mostra os **estilos calculados**: a cor, o tamanho e o `display` que valem de fato, depois de todo o CSS. A setinha do canto escolhe pela página: clique nela e depois no elemento, e a árvore abre no lugar dele.',
          'É por aqui que se descobre por que algo não aparece: o `display: none` está lá, escrito nos calculados.',
        ],
        marcas: ['Elementos', 'inspecionar', 'estilos calculados'],
      },
      {
        id: 'console',
        titulo: 'Console: o que o script diz',
        resumo: 'Os console.log, os erros em vermelho com a linha, e um lugar para perguntar.',
        explicacao: [
          'O **Console** mostra o que o script escreveu com `console.log`, e os erros, em vermelho, com o arquivo e a linha ao lado: `script.js:12`. A primeira pergunta diante de uma página que não faz nada é: há vermelho no console?',
          'Embaixo dele há uma linha para digitar. O que se escreve ali roda na página, como se estivesse no script: dá para perguntar o valor de uma variável ou testar um seletor antes de escrevê-lo no arquivo.',
        ],
        exemplo: `const pontos = [72, 38, 55];
console.log('pontos:', pontos);
console.log('primeiro membro:', document.querySelector('li'));`,
        exemploComo: 'dom',
        exemploMarcacao: `<ul>
  <li>Ana Clara</li>
</ul>`,
        exemploSaida: `pontos: (3) [72, 38, 55]
primeiro membro: <li>`,
        marcas: ['Console', 'console.log', 'erro', 'linha'],
      },
      {
        id: 'rede',
        titulo: 'Rede: os pedidos',
        resumo: 'Cada fetch vira uma linha, com o código da resposta.',
        explicacao: [
          'A guia **Rede** lista cada pedido que a página fez, com o endereço, o código da resposta (200, 404) e o tamanho. Clicando numa linha, aparece a resposta inteira — que é o jeito de descobrir como o JSON da API é por dentro antes de escrever o código que o lê.',
          'Ela também finge condições: "Sem conexão" faz a página pedir como se a internet tivesse caído, que é como se testa o `catch` sem desligar o roteador do clube.',
        ],
        marcas: ['Rede', 'status', 'Sem conexão'],
      },
      {
        id: 'parada',
        titulo: 'Fontes e a parada',
        resumo: 'Uma parada numa linha mostra o valor das variáveis quando o programa passa por ela.',
        explicacao: [
          'Na guia **Fontes**, clicar no número de uma linha põe uma **parada** — em inglês, *breakpoint*. No navegador de verdade, quando o programa chega ali, ele para: a página congela, e o painel mostra o valor de cada variável naquele instante. Dá para seguir uma linha de cada vez e ver os valores mudando.',
          'É o que se usa quando o resultado está errado e não há erro nenhum no console — o placar que mostra "0105" em vez de 15. Parado na linha da soma, o painel mostra o valor com aspas: era texto.',
          'No laboratório, o programa não congela: a prévia não tem como segurar a página no meio. Ele anota, a cada passagem pela linha, como as variáveis estavam, e o painel mostra cada passagem — o que o navegador de verdade mostraria se tivesse parado.',
        ],
        marcas: ['Fontes', 'parada', 'breakpoint', 'depurar'],
      },
    ],
  },
  {
    id: 'pagina',
    topicos: [
      {
        id: 'guardar-e-desenhar',
        titulo: 'Guardar os dados, desenhar a partir deles',
        resumo: 'Pede uma vez, guarda num arranjo, e uma função desenha o que se vê.',
        explicacao: [
          'Uma página que filtra e ordena tem duas partes. Os **dados** — a lista completa que veio da API — ficam guardados num arranjo, pedidos uma vez só. E uma função **desenhar** monta a tela a partir deles, do zero, toda vez que alguma coisa muda.',
          'Assim, trocar o filtro não pede nada à API de novo: chama `desenhar()`, que esvazia a lista e a monta outra vez com o que agora passa no filtro.',
        ],
        exemplo: `const unidades = ['Jatobá', 'Ipê', 'Buriti'];
const lista = document.querySelector('ul');
function desenhar() {
  lista.textContent = '';
  for (const u of unidades) {
    const item = document.createElement('li');
    item.textContent = u;
    lista.append(item);
  }
}
desenhar();`,
        exemploComo: 'dom',
        exemploMarcacao: `<ul></ul>`,
        marcas: ['estado', 'desenhar', 'arranjo'],
      },
      {
        id: 'filtrar',
        titulo: 'Filtrar sem perder o resto',
        resumo: 'filter devolve um arranjo novo, e o guardado continua inteiro.',
        explicacao: [
          '`estados.filter(e => e.regiao.nome === \'Sul\')` devolve um arranjo **novo** com os que passam. O arranjo guardado continua com todos — e é ele que permite voltar para "Todas".',
          'Dois filtros juntos são dois `filter` seguidos, ou um só com as duas perguntas ligadas por `&&`. Quem passa nos dois, aparece.',
        ],
        exemplo: `const estados = [
  { sigla: 'RS', nome: 'Rio Grande do Sul', regiao: 'Sul' },
  { sigla: 'RJ', nome: 'Rio de Janeiro', regiao: 'Sudeste' },
  { sigla: 'PR', nome: 'Paraná', regiao: 'Sul' },
];
const doSul = estados.filter(e => e.regiao === 'Sul');
console.log(doSul.length, estados.length);`,
        exemploComo: 'dom',
        exemploMarcacao: `<p>Abra o console embaixo.</p>`,
        exemploSaida: '2 3',
        atencao: 'Guardar o resultado do filtro no próprio arranjo — `estados = estados.filter(...)` — joga fora os que não passaram. Voltar para "Todas" não traz ninguém de volta.',
        marcas: ['filter', 'cópia', '&&'],
      },
      {
        id: 'ordenar',
        titulo: 'Ordenar com localeCompare',
        resumo: 'sort muda o arranjo; localeCompare sabe que á é a.',
        explicacao: [
          '`sort` ordena o arranjo **no lugar**: o guardado muda de ordem. Para ordenar só o que se vai mostrar, ordene a cópia que o `filter` devolveu, ou faça uma com `[...lista]`.',
          'Para texto, compare com `a.nome.localeCompare(b.nome)`. Comparar com `<` olha o código de cada letra, e no código o `á` vem depois do `z`: Paraíba sai antes do Pará. O `localeCompare` ordena como o dicionário.',
        ],
        exemplo: `const nomes = ['Paraíba', 'Pará', 'Paraná'];
console.log([...nomes].sort((a, b) => (a < b ? -1 : 1)).join(', '));
console.log([...nomes].sort((a, b) => a.localeCompare(b)).join(', '));`,
        exemploComo: 'dom',
        exemploMarcacao: `<p>Abra o console embaixo.</p>`,
        exemploSaida: `Paraná, Paraíba, Pará
Pará, Paraíba, Paraná`,
        marcas: ['sort', 'localeCompare', 'ordem'],
      },
      {
        id: 'procurar',
        titulo: 'Procurar sem ligar para maiúscula',
        resumo: 'Os dois lados em minúsculas, e includes.',
        explicacao: [
          'Quem procura "rio" quer achar "Rio de Janeiro". `includes` diferencia maiúscula de minúscula, então os dois lados vão para minúsculas antes: `e.nome.toLowerCase().includes(busca.toLowerCase())`.',
          'Com a caixa vazia, `includes(\'\')` é verdadeiro para todo mundo — a busca apagada mostra todos de novo, sem nenhuma linha a mais.',
        ],
        exemplo: `const nomes = ['Rio de Janeiro', 'Piauí', 'Rio Grande do Sul'];
const busca = 'rio';
console.log(nomes.filter(n => n.includes(busca)).length);
console.log(nomes.filter(n => n.toLowerCase().includes(busca.toLowerCase())).length);`,
        exemploComo: 'dom',
        exemploMarcacao: `<p>Abra o console embaixo.</p>`,
        exemploSaida: `0
2`,
        marcas: ['includes', 'toLowerCase', 'busca'],
      },
      {
        id: 'contar',
        titulo: 'Dizer quantos estão à vista',
        resumo: 'A contagem sai da lista desenhada, e acompanha cada filtro.',
        explicacao: [
          'Uma página que filtra diz quantos sobraram: "9 estados". O número sai do tamanho da lista que acabou de ser desenhada, dentro da mesma função `desenhar` — assim ele acompanha todo filtro sem ninguém lembrar de atualizá-lo.',
          'Quando não sobra ninguém, a página diz isso com palavras: "Nenhum estado encontrado". Uma tabela vazia sem explicação parece um defeito.',
        ],
        marcas: ['contagem', 'length', 'vazio'],
      },
    ],
  },
];

const cap = (id: string) => CAPITULOS.find(c => c.id === id)!.topicos;

/* ────────────────────────────────────────────────────────────────────────
   Os módulos
   ──────────────────────────────────────────────────────────────────────── */

export const MODULOS_DE_DOM: ModuloDeVereda[] = [
  {
    id: 'm1',
    titulo: 'HTML, CSS e JavaScript juntos',
    resumo: 'O que cada linguagem faz, a árvore que o navegador monta, e onde o script mora.',
    licoes: [
      {
        id: 'm1-teoria', tipo: 'teoria', questoes: QUESTOES_DE_DOM['m1-teoria'], perguntas: 4,
        titulo: 'A página que o navegador monta',
        resumo: 'As três linguagens, o DOM, os nós, a renderização e a posição do script.',
        topicos: cap('juntos'),
      },
      {
        id: 'm1-lab', tipo: 'dom', licao: 'juntos',
        titulo: 'Ligando os três arquivos do mural',
        resumo: 'Chamar a folha e o script no lugar certo, e contar os avisos da página.',
        verificacoes: ['estilo-ligado', 'script-ligado', 'conta-avisos'],
      },
    ],
  },
  {
    id: 'm2',
    titulo: 'Achar elementos',
    resumo: 'querySelector, querySelectorAll, os seletores que dizem mais, e o null.',
    licoes: [
      {
        id: 'm2-teoria', tipo: 'teoria', questoes: QUESTOES_DE_DOM['m2-teoria'], perguntas: 4,
        titulo: 'Achar na árvore',
        resumo: 'Um ou todos, por id, classe, atributo e lugar — e o que volta quando nada casa.',
        topicos: cap('achar'),
      },
      {
        id: 'm2-lab', tipo: 'dom', licao: 'achar',
        titulo: 'Quem é quem na Unidade Ipê',
        resumo: 'Achar o título, contar as pessoas, a conselheira e os membros — e responder no console.',
        verificacoes: ['pelo-id', 'pela-classe', 'pelo-atributo', 'dentro-da-secao'],
      },
    ],
  },
  {
    id: 'm3',
    titulo: 'Mudar o que já existe',
    resumo: 'Texto, estilo, classe, dataset e hidden.',
    licoes: [
      {
        id: 'm3-teoria', tipo: 'teoria', questoes: QUESTOES_DE_DOM['m3-teoria'], perguntas: 4,
        titulo: 'Mexer no que está na tela',
        resumo: 'textContent, style, classList, dataset e hidden.',
        topicos: cap('mudar'),
      },
      {
        id: 'm3-lab', tipo: 'dom', licao: 'mudar',
        titulo: 'A ficha da unidade',
        resumo: 'Pôr o nome, pintar a faixa, marcar quem está abaixo e somar os pontos.',
        verificacoes: ['titulo', 'faixa', 'abaixo', 'total'],
      },
    ],
  },
  {
    id: 'm4',
    titulo: 'Criar e remover',
    resumo: 'createElement, onde pendurar, remove, esvaziar e o cuidado com innerHTML.',
    licoes: [
      {
        id: 'm4-teoria', tipo: 'teoria', questoes: QUESTOES_DE_DOM['m4-teoria'], perguntas: 4,
        titulo: 'Elementos que nascem e saem',
        resumo: 'Criar, pendurar, tirar, esvaziar — e por que o texto de fora não vai para o innerHTML.',
        topicos: cap('criar'),
      },
      {
        id: 'm4-lab', tipo: 'dom', licao: 'criar-e-remover',
        titulo: 'As tarefas do acampamento',
        resumo: 'Um item para cada tarefa, o "Carregando" fora, e o aviso quando não há nenhuma.',
        verificacoes: ['um-item-por-tarefa', 'tira-o-carregando', 'aviso-de-vazio'],
      },
    ],
  },
  {
    id: 'm5',
    titulo: 'Eventos e ouvintes',
    resumo: 'O que é um evento, o ouvinte que reage a ele, o clique e a digitação.',
    licoes: [
      {
        id: 'm5-teoria', tipo: 'teoria', questoes: QUESTOES_DE_DOM['m5-teoria'], perguntas: 4,
        titulo: 'Reagir ao que a pessoa faz',
        resumo: 'Evento, ouvinte, a função passada e não chamada, o input e o objeto do evento.',
        topicos: cap('eventos'),
      },
      {
        id: 'm5-lab', tipo: 'dom', licao: 'eventos',
        titulo: 'A chamada da reunião',
        resumo: 'Marcar, desfazer, procurar enquanto se digita, e abrir a ajuda.',
        verificacoes: ['marcar', 'desfazer', 'procurar', 'ajuda'],
      },
    ],
  },
  {
    id: 'm6',
    titulo: 'Formulários sem recarregar',
    resumo: 'O envio que recarrega, os campos que chegam como texto e a validação.',
    licoes: [
      {
        id: 'm6-teoria', tipo: 'teoria', questoes: QUESTOES_DE_DOM['m6-teoria'], perguntas: 4,
        titulo: 'Conferir antes de aceitar',
        resumo: 'preventDefault, value, validar campo a campo, limpar, e o que o HTML confere.',
        topicos: cap('formulario'),
      },
      {
        id: 'm6-lab', tipo: 'dom', licao: 'formulario',
        titulo: 'A inscrição no campori',
        resumo: 'Enviar sem recarregar, recusar idade fora da faixa e inscrever quem está certo.',
        verificacoes: ['sem-recarregar', 'idade', 'inscreve'],
      },
    ],
  },
  {
    id: 'm7',
    titulo: 'Conversar com uma API',
    resumo: 'O que é uma API, o fetch, a resposta com erro e a rede que cai.',
    licoes: [
      {
        id: 'm7-teoria', tipo: 'teoria', questoes: QUESTOES_DE_DOM['m7-teoria'], perguntas: 4,
        titulo: 'Pedir dados a outro programa',
        resumo: 'API, fetch com await, resposta.ok, try e catch, e o "Carregando…".',
        topicos: cap('api'),
      },
      {
        id: 'm7-lab', tipo: 'dom', licao: 'api',
        titulo: 'Os feriados do ano',
        resumo: 'Pedir à BrasilAPI, trocar o ano, mostrar a espera e avisar quando a rede cair.',
        verificacoes: ['mostra-feriados', 'troca-de-ano', 'mostra-espera', 'avisa-falha'],
      },
    ],
  },
  {
    id: 'm8',
    titulo: 'As ferramentas do navegador',
    resumo: 'Elementos, Console, Rede e a parada na guia Fontes.',
    licoes: [
      {
        id: 'm8-teoria', tipo: 'teoria', questoes: QUESTOES_DE_DOM['m8-teoria'], perguntas: 4,
        titulo: 'Olhar por dentro da página',
        resumo: 'Inspecionar, ler o console, ver os pedidos e parar numa linha.',
        topicos: cap('ferramentas'),
      },
      {
        id: 'm8-lab', tipo: 'dom', licao: 'ferramentas',
        titulo: 'O placar que soma errado',
        resumo: 'Inspecionar o placar, parar na linha da soma e consertar o que a parada mostrou.',
        verificacoes: ['inspecionou', 'parou', 'conserto'],
      },
    ],
  },
  {
    id: 'm9',
    titulo: 'Uma página que conversa',
    resumo: 'A página inteira: dados da API, filtro, busca, ordem e contagem.',
    licoes: [
      {
        id: 'm9-teoria', tipo: 'teoria', questoes: QUESTOES_DE_DOM['m9-teoria'], perguntas: 4,
        titulo: 'Guardar, filtrar e ordenar',
        resumo: 'Os dados guardados e a função que desenha, filter, sort, includes e a contagem.',
        topicos: cap('pagina'),
      },
      {
        id: 'm9-lab', tipo: 'dom', licao: 'pagina',
        titulo: 'Os estados do Brasil',
        resumo: 'A tabela dos 27, filtrada por região, procurada pelo nome e ordenada.',
        verificacoes: ['tabela', 'regiao', 'busca', 'ordem', 'falha'],
      },
    ],
  },
];
