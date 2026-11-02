/*
 * A vereda CC-FE003 JavaScript.
 *
 * ── De onde ela vem ──────────────────────────────────────────────────────
 * Da CC004. Quem chega aqui já escreveu função, laço, dicionário, arquivo e
 * erro tratado em Python, e a vereda não ensina nada disso de novo: ensina o
 * mesmo em outra língua, e o que nessa língua é diferente. É por isso que o
 * requisito 3 pede três diferenças de sintaxe — a comparação com o que já se
 * sabe é o caminho mais curto, e é também onde moram os enganos.
 *
 * ── Fora do navegador, de propósito ──────────────────────────────────────
 * JavaScript nasceu no navegador, e é para lá que as veredas seguintes vão —
 * a de DOM mexe na página, a de React monta telas. Esta não. O requisito 7
 * pede um programa executado **fora** do navegador, e o laboratório é o
 * terminal com `node programa.js`. A razão é a mesma da CC004: aprender a
 * linguagem sem a página na frente separa o que é da linguagem do que é do
 * navegador, e a vereda de DOM vai poder dizer "isto é do navegador" a quem
 * já sabe o que é da linguagem.
 *
 * ── `import`, e não `require` ────────────────────────────────────────────
 * O Node de hoje roda um `.js` como módulo ES quando ele tem `import`, sem
 * configuração nenhuma. A lição ensina `import` porque é a sintaxe que o
 * navegador também usa, e a que as veredas seguintes vão encontrar; o
 * `require` aparece no último módulo, porque metade dos exemplos da internet
 * ainda o escreve e quem o encontrar precisa reconhecê-lo.
 *
 * ── A ordem ──────────────────────────────────────────────────────────────
 * A do documento, com uma troca: os tipos e as diferenças (requisitos 2.1 e
 * 3) abrem, porque são a ponte com o Python; depois variáveis e escopo, os
 * dois juntos (4.1 e 2.2); decisão e repetição; funções (4.3 e 2.5);
 * arranjos com map, filter e reduce (2.3 e 4.4); objetos (2.4 e 4.5); o
 * assíncrono (5); o JSON (2.6 e 6); e o programa inteiro (7).
 */

import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DE_JAVASCRIPT } from './questoesDeJavascript';

/* ────────────────────────────────────────────────────────────────────────
   Os capítulos de teoria
   ──────────────────────────────────────────────────────────────────────── */

const CAPITULOS: { id: string; topicos: TopicoDeVereda[] }[] = [
  {
    id: 'do-python',
    topicos: [
      {
        id: 'onde-roda',
        titulo: 'Onde o JavaScript roda',
        resumo: 'No navegador, que é onde ele nasceu, e no terminal, pelo Node.',
        explicacao: [
          'JavaScript é a linguagem que todo navegador entende. Cada site que reage a um clique tem JavaScript por trás, e é por isso que ela é a linguagem mais usada do mundo.',
          'Ela também roda fora do navegador, por um programa chamado **Node**. Com o Node instalado, `node programa.js` no terminal executa o arquivo de cima para baixo — do mesmo jeito que `python programa.py` executava na CC004. Esta vereda inteira acontece assim, no terminal.',
          '`console.log` é o `print` daqui: escreve no terminal o que recebe, separando os valores por espaço.',
        ],
        exemplo: `console.log('Boa noite, desbravador!');
console.log('Unidades:', 6);
console.log(2 + 3);`,
        exemploComo: 'javascript',
        exemploSaida: `Boa noite, desbravador!
Unidades: 6
5`,
        marcas: ['node', 'console.log', 'terminal'],
      },
      {
        id: 'tipagem-dinamica',
        titulo: 'Tipagem dinâmica',
        resumo: 'A variável não tem tipo; o valor dentro dela é que tem.',
        explicacao: [
          '**Tipagem dinâmica** quer dizer que o tipo mora no valor, e não na variável. A mesma variável pode guardar um número agora e um texto depois, e ninguém reclama — o Python é assim também.',
          '`typeof` diz o tipo do valor de agora: `"number"`, `"string"`, `"boolean"`, `"undefined"`, `"object"`. Número inteiro e número com vírgula são o mesmo tipo, `number`: não existe `int` e `float` separados.',
          'O preço da liberdade é a conversão automática. Com `+`, se um dos lados é texto, o JavaScript junta como texto: `"5" + 3` dá `"53"`. Com `-`, que não existe para texto, ele converte para número: `"5" - 3` dá `2`. O Python recusaria os dois com erro; o JavaScript devolve um resultado — e um resultado errado é pior do que um erro.',
        ],
        exemplo: `let idade = 12;
console.log(typeof idade);
idade = 'doze';
console.log(typeof idade);
console.log('5' + 3);
console.log('5' - 3);`,
        exemploComo: 'javascript',
        exemploSaida: `number
string
53
2`,
        atencao: 'Número que chega de um formulário ou de um arquivo de texto chega como texto. Somar dois deles dá "1015" em vez de 25, sem erro nenhum — converta com `Number()` antes da conta.',
        marcas: ['tipagem dinâmica', 'typeof', 'conversão'],
      },
      {
        id: 'tres-diferencas',
        titulo: 'Três diferenças para o Python',
        resumo: 'Chaves no lugar do recuo, a variável declarada, e a igualdade de três sinais.',
        explicacao: [
          '**Primeira: o bloco é marcado por chaves, e não pelo recuo.** No Python, o que está dentro do `if` é o que está recuado. Aqui é o que está entre `{` e `}`, e o recuo é só cortesia para quem lê. A condição vai entre parênteses, e não há dois-pontos.',
          '**Segunda: toda variável é declarada antes, com `let` ou `const`.** No Python, `total = 0` cria a variável. Aqui ela nasce com `let total = 0;`, e escrever um nome nunca declarado num módulo dá `ReferenceError`.',
          '**Terceira: a igualdade tem três sinais.** `===` compara sem converter; `==` converte antes e acha que `"5" == 5`. O Python só tem uma igualdade, e ela é a de três sinais daqui.',
          'Há diferenças menores no caminho: `true`, `false` e `null` são minúsculos, o comentário começa com `//`, e a linha costuma terminar em `;`. O texto entre crases aceita `${...}` no meio, como a f-string do Python.',
        ],
        exemplo: `const pontos = 42;
if (pontos >= 40) {
  console.log('Medalha de ouro');
} else {
  console.log('Continue treinando');
}
console.log(\`Pontos: \${pontos}\`);`,
        exemploComo: 'javascript',
        exemploSaida: `Medalha de ouro
Pontos: 42`,
        marcas: ['chaves', 'let', 'const', '===', 'crase'],
      },
      {
        id: 'igualdade',
        titulo: 'Os dois iguais',
        resumo: 'O === compara o que está ali; o == converte antes, e erra calado.',
        explicacao: [
          '`===` só dá `true` quando os dois lados são do mesmo tipo **e** têm o mesmo valor. `"5" === 5` é `false`, porque um é texto e o outro é número.',
          '`==` tenta converter um lado para o tipo do outro antes de comparar, e as regras da conversão surpreendem até quem programa há anos: `"" == 0` é `true`, `"0" == 0` também, e `"" == "0"` é `false`.',
          'A regra que poupa a dor de cabeça é simples: use sempre `===` e `!==`. Quando os tipos forem diferentes de propósito, converta antes, com `Number()` ou `String()`, e deixe escrito o que se quis.',
        ],
        exemplo: `console.log('5' == 5);
console.log('5' === 5);
console.log(Number('5') === 5);
console.log('' == 0);`,
        exemploComo: 'javascript',
        exemploSaida: `true
false
true
true`,
        atencao: 'O `==` não dá erro em nenhuma das comparações estranhas: devolve `true` ou `false` e o programa segue pelo caminho errado.',
        marcas: ['===', '==', 'igualdade'],
      },
    ],
  },
  {
    id: 'variaveis',
    topicos: [
      {
        id: 'let-e-const',
        titulo: 'let e const',
        resumo: 'const para o que não muda, let para o que muda.',
        explicacao: [
          '`const` declara um nome que não pode receber outro valor. `let` declara um nome que pode. É toda a diferença — e ela vale porque, lendo o programa, `const` avisa que aquele valor é o mesmo do começo ao fim.',
          'A regra prática é começar com `const` e trocar para `let` só quando a variável precisar mudar: um contador, um total, a resposta que muda dentro do laço.',
          'Tentar dar outro valor a uma `const` não passa calado: o programa para com `TypeError: Assignment to constant variable.`, na linha da tentativa.',
        ],
        exemplo: `const diaria = 45;
let total = 0;
total = total + diaria;
total = total + diaria;
console.log(total);`,
        exemploComo: 'javascript',
        exemploSaida: '90',
        marcas: ['let', 'const', 'TypeError'],
      },
      {
        id: 'const-nao-congela',
        titulo: 'const não congela o que está dentro',
        resumo: 'O nome fica preso ao mesmo arranjo; o arranjo pode crescer.',
        explicacao: [
          '`const` prende o **nome** ao valor, e não congela o valor. Uma `const` que guarda um arranjo continua guardando o mesmo arranjo, e nele dá para acrescentar, tirar e trocar itens.',
          'O que não dá é apontar o nome para outro arranjo: `inscritos = []` dá `TypeError`. `inscritos.push("Ana")` funciona, porque é o mesmo arranjo, maior.',
          'É por isso que quase toda lista e todo objeto de um programa nascem com `const`: eles mudam por dentro o tempo todo, e o nome nunca precisa apontar para outro lugar.',
        ],
        exemplo: `const inscritos = ['Ana'];
inscritos.push('Bruno');
inscritos.push('Carla');
console.log(inscritos);
console.log(inscritos.length);`,
        exemploComo: 'javascript',
        exemploSaida: `[ 'Ana', 'Bruno', 'Carla' ]
3`,
        marcas: ['const', 'push', 'arranjo'],
      },
      {
        id: 'escopo-de-bloco',
        titulo: 'Escopo',
        resumo: 'O trecho do programa onde um nome existe.',
        explicacao: [
          '**Escopo** é o trecho do programa em que um nome existe. Com `let` e `const`, esse trecho é o bloco: o par de chaves onde o nome foi declarado, e tudo o que está dentro dele.',
          'Uma variável declarada dentro do `if` some quando o `if` termina. Tentar lê-la depois dá `ReferenceError: ... is not defined`, que é o JavaScript dizendo que, ali, aquele nome não existe.',
          'O de dentro enxerga o de fora; o de fora não enxerga o de dentro. E um nome de dentro pode repetir o de fora sem estragá-lo: dentro do bloco vale o novo, e quando o bloco fecha o antigo volta, intacto.',
        ],
        exemplo: `const titulo = 'Placar';
if (true) {
  const titulo = 'Recorde!';
  const bonus = 10;
  console.log(titulo, bonus);
}
console.log(titulo);`,
        exemploComo: 'javascript',
        exemploSaida: `Recorde! 10
Placar`,
        atencao: 'No Python, a variável criada dentro de um `if` continua existindo depois dele. Aqui não — e quem vem do Python costuma descobrir isso pelo `ReferenceError`.',
        marcas: ['escopo', 'bloco', 'ReferenceError'],
      },
      {
        id: 'var',
        titulo: 'O var, e por que ele saiu',
        resumo: 'O jeito antigo de declarar, que ignora as chaves.',
        explicacao: [
          'Antes de `let` e `const` existirem, havia só `var`. Ele ainda funciona, e você vai encontrá-lo em todo exemplo antigo da internet.',
          'O defeito do `var` é que ele ignora o bloco: declarado dentro de um `if` ou de um `for`, ele vale para a função inteira. Um `var` com o mesmo nome dentro do `if` não cria outro — **reescreve** o de fora, em silêncio.',
          'O caso mais famoso é o laço que agenda alguma coisa para depois. Com `var i`, há um `i` só para o laço inteiro, e quando as funções agendadas rodam ele já chegou ao fim. Com `let i`, cada volta tem o seu.',
        ],
        exemplo: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log('var:', i), 10);
}
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log('let:', j), 20);
}`,
        exemploComo: 'javascript',
        exemploSaida: `var: 3
var: 3
var: 3
let: 0
let: 1
let: 2`,
        atencao: 'Nenhum dos dois laços dá erro. O do `var` escreve três vezes o mesmo número, e o programa segue.',
        marcas: ['var', 'escopo', 'setTimeout'],
      },
    ],
  },
  {
    id: 'decidir-e-repetir',
    topicos: [
      {
        id: 'if-else',
        titulo: 'if, else if e else',
        resumo: 'Decidir entre caminhos, um de cada vez.',
        explicacao: [
          'O `if` executa o bloco quando a condição entre parênteses vale. O `else` é o caminho de quando ela não vale. Para mais de duas saídas, `else if` encadeia outra pergunta — é o `elif` do Python, escrito por extenso.',
          'As perguntas são feitas na ordem, e a primeira que valer ganha: as de baixo nem são olhadas. Por isso a ordem importa quando as condições se sobrepõem.',
          'Para juntar condições: `&&` é o "e", `||` é o "ou", e `!` é o "não" — os `and`, `or` e `not` do Python.',
        ],
        exemplo: `const idade = 12;
if (idade < 10) {
  console.log('Ainda não é desbravador');
} else if (idade <= 15) {
  console.log('Desbravador');
} else {
  console.log('Pode ser conselheiro');
}`,
        exemploComo: 'javascript',
        exemploSaida: 'Desbravador',
        marcas: ['if', 'else if', 'else', '&&', '||'],
      },
      {
        id: 'verdadeiro-e-falso',
        titulo: 'O que conta como falso',
        resumo: 'Seis valores, e um deles surpreende quem vem do Python.',
        explicacao: [
          'Uma condição não precisa ser `true` ou `false`: qualquer valor serve, e o JavaScript decide se ele "conta como falso". Contam como falso: `false`, `0`, o texto vazio `""`, `null`, `undefined` e `NaN`. Todo o resto conta como verdadeiro.',
          'A surpresa para quem vem do Python é o arranjo vazio. Lá, uma lista vazia é falsa; aqui, `[]` conta como **verdadeiro**, e um `if (inscritos)` entra mesmo sem ninguém inscrito.',
          'Para perguntar se o arranjo tem alguém, pergunte pelo tamanho: `if (inscritos.length > 0)`.',
        ],
        exemplo: `const inscritos = [];
if (inscritos) {
  console.log('Entrou com o arranjo vazio');
}
if (inscritos.length > 0) {
  console.log('Tem gente inscrita');
} else {
  console.log('Ninguém inscrito ainda');
}`,
        exemploComo: 'javascript',
        exemploSaida: `Entrou com o arranjo vazio
Ninguém inscrito ainda`,
        marcas: ['falso', 'verdadeiro', 'length'],
      },
      {
        id: 'for',
        titulo: 'O for de contar',
        resumo: 'Começo, condição e passo, entre parênteses.',
        explicacao: [
          'O `for` clássico tem três partes entre parênteses, separadas por ponto e vírgula: onde a contagem começa, até quando ela continua, e o que muda a cada volta. `for (let i = 0; i < 3; i++)` dá três voltas, com `i` valendo 0, 1 e 2.',
          '`i++` é atalho para `i = i + 1`. E a condição é conferida **antes** de cada volta: quando ela deixa de valer, o laço termina sem entrar.',
          'É o `for i in range(3)` do Python, com as três partes à mostra.',
        ],
        exemplo: `for (let i = 1; i <= 3; i++) {
  console.log('Volta', i);
}`,
        exemploComo: 'javascript',
        exemploSaida: `Volta 1
Volta 2
Volta 3`,
        marcas: ['for', 'i++', 'contador'],
      },
      {
        id: 'for-of',
        titulo: 'for...of, e o for...in que engana',
        resumo: 'Um item de cada vez — e a palavra que muda tudo.',
        explicacao: [
          '`for (const nome of inscritos)` passa por cada item do arranjo, um de cada vez. É o `for nome in inscritos` do Python, e é o jeito mais limpo de percorrer uma lista.',
          'Existe também o `for...in`, e ele não faz a mesma coisa: num arranjo, ele passa pelas **posições**, e não pelos itens — e entrega as posições como texto, `"0"`, `"1"`, `"2"`.',
          'Quem vem do Python escreve `in` por hábito e recebe números onde esperava nomes. Nenhum erro aparece.',
        ],
        exemplo: `const unidades = ['Águia', 'Falcão'];
for (const u of unidades) {
  console.log('of:', u);
}
for (const u in unidades) {
  console.log('in:', u);
}`,
        exemploComo: 'javascript',
        exemploSaida: `of: Águia
of: Falcão
in: 0
in: 1`,
        atencao: 'O `for...in` foi feito para as chaves de um objeto. Para os itens de um arranjo, é `of`.',
        marcas: ['for...of', 'for...in', 'percorrer'],
      },
      {
        id: 'while',
        titulo: 'while',
        resumo: 'Repetir enquanto a condição valer, sem saber quantas voltas.',
        explicacao: [
          '`while (condição) { ... }` repete o bloco enquanto a condição valer. É para quando não se sabe de antemão quantas voltas serão — repetir até acertar, até acabar, até alguém desistir.',
          'Alguma coisa dentro do bloco precisa mudar o que a condição testa. Senão ela vale para sempre, e o programa não termina: o laboratório o encerra depois de cinco segundos.',
          '`break` sai do laço na hora, de qualquer volta. `continue` pula o resto desta volta e vai para a próxima.',
        ],
        exemplo: `let fichas = 10;
let rodadas = 0;
while (fichas > 0) {
  fichas = fichas - 3;
  rodadas++;
}
console.log(rodadas, fichas);`,
        exemploComo: 'javascript',
        exemploSaida: '4 -2',
        marcas: ['while', 'break', 'continue'],
      },
    ],
  },
  {
    id: 'funcoes',
    topicos: [
      {
        id: 'function',
        titulo: 'A função com function',
        resumo: 'Nome, parâmetros, corpo e return — o def do Python.',
        explicacao: [
          '`function precoDoPedido(lanches, sucos) { ... }` declara uma função chamada `precoDoPedido`, que espera dois valores. O corpo vai entre chaves, e `return` devolve o resultado para quem chamou.',
          'Como no Python, declarar não executa: quem executa é a chamada, `precoDoPedido(2, 1)`, com os valores entre parênteses.',
          'Uma diferença: chamar com argumentos a menos não dá erro. O parâmetro que faltou vale `undefined`, e a conta com ele dá `NaN` — "não é um número" —, que segue pelo programa como se fosse.',
        ],
        exemplo: `function precoDoPedido(lanches, sucos) {
  return lanches * 6 + sucos * 4;
}
console.log(precoDoPedido(2, 1));
console.log(precoDoPedido(2));`,
        exemploComo: 'javascript',
        exemploSaida: `16
NaN`,
        atencao: 'Função sem `return` devolve `undefined`. Como no Python com o `None`, o problema aparece mais adiante, na conta que tenta usar o resultado.',
        marcas: ['function', 'return', 'NaN', 'undefined'],
      },
      {
        id: 'seta',
        titulo: 'A função de seta',
        resumo: 'O jeito curto: parâmetros, => e o que ela devolve.',
        explicacao: [
          'A função de seta é escrita assim: `const troco = (pago, total) => pago - total;`. Os parâmetros entre parênteses, a seta `=>`, e depois dela o que a função devolve.',
          'Com uma expressão só depois da seta, ela é devolvida sem precisar de `return`. Com um parâmetro só, os parênteses podem sair: `n => n * 2`. Com chaves depois da seta, o corpo vira um bloco comum, e aí o `return` volta a ser obrigatório.',
          'É o `lambda` do Python, sem o limite de uma linha — e ela aparece em todo lugar, porque é como se escreve a função que se passa para outra.',
        ],
        exemplo: `const dobro = n => n * 2;
const troco = (pago, total) => pago - total;
const media = (a, b) => {
  const soma = a + b;
  return soma / 2;
};
console.log(dobro(21), troco(50, 22), media(7, 10));`,
        exemploComo: 'javascript',
        exemploSaida: '42 28 8.5',
        atencao: 'Com chaves e sem `return`, a seta devolve `undefined`. `n => { n * 2 }` faz a conta e joga fora.',
        marcas: ['=>', 'seta', 'arrow function'],
      },
      {
        id: 'anonima',
        titulo: 'Função anônima',
        resumo: 'A função sem nome, escrita no lugar onde vai ser usada.',
        explicacao: [
          '**Função anônima** é a que não tem nome. Ela é escrita direto onde vai ser usada — quase sempre como argumento de outra função, que vai chamá-la na hora certa.',
          'Pode ser uma seta, `() => ...`, ou a forma longa, `function () { ... }`. O que a torna anônima é não ganhar nome: ninguém mais vai chamá-la, só quem a recebeu.',
          'O `setTimeout` é o exemplo mais simples: ele recebe uma função e a chama depois de um tempo. A função vai como valor, sem parênteses — com parênteses ela seria executada na hora, e o que iria para o `setTimeout` seria o resultado dela.',
        ],
        exemplo: `setTimeout(() => {
  console.log('Fim do intervalo!');
}, 1000);
console.log('Intervalo começou');`,
        exemploComo: 'javascript',
        exemploSaida: `Intervalo começou
Fim do intervalo!`,
        marcas: ['função anônima', 'setTimeout', 'callback'],
      },
      {
        id: 'funcao-e-valor',
        titulo: 'Função é um valor',
        resumo: 'Ela se guarda, se passa e se devolve, como um número.',
        explicacao: [
          'Em JavaScript a função é um valor como qualquer outro: cabe numa variável, num arranjo, e vai como argumento para outra função. A seta guardada numa `const` é exatamente isso — uma função anônima que ganhou um nome de variável.',
          'Uma função que recebe outra função é o que vai aparecer no próximo módulo, com `map`, `filter` e `reduce`: você diz **o que** fazer com cada item, e elas fazem o resto.',
          'A diferença entre `saudar` e `saudar()` é a diferença entre a função e o resultado dela. Sem parênteses, é a função; com, é o que ela devolve.',
        ],
        exemplo: `const gritar = texto => texto.toUpperCase() + '!';
function aplicar(f, valor) {
  return f(valor);
}
console.log(aplicar(gritar, 'sempre alerta'));
console.log(typeof gritar);`,
        exemploComo: 'javascript',
        exemploSaida: `SEMPRE ALERTA!
function`,
        marcas: ['função', 'valor', 'typeof'],
      },
    ],
  },
  {
    id: 'arranjos',
    topicos: [
      {
        id: 'arranjo',
        titulo: 'O arranjo',
        resumo: 'Uma lista de valores em ordem, contada a partir do zero.',
        explicacao: [
          '**Arranjo** é uma lista de valores em ordem, entre colchetes: `["Ana", "Bruno", "Carla"]`. É a lista do Python, com o mesmo jeito de escrever. Em inglês ele se chama *array*, e é o nome que aparece em toda documentação.',
          'A posição começa no zero: `nomes[0]` é o primeiro. `nomes.length` diz quantos itens há — é uma propriedade, sem parênteses, e não uma função como o `len` do Python.',
          '`push` acrescenta no fim, `pop` tira do fim, e `includes` pergunta se um valor está lá. Ler uma posição que não existe não dá erro: devolve `undefined`.',
        ],
        exemplo: `const nomes = ['Ana', 'Bruno'];
nomes.push('Carla');
console.log(nomes[0], nomes.length);
console.log(nomes.includes('Bruno'));
console.log(nomes[5]);`,
        exemploComo: 'javascript',
        exemploSaida: `Ana 3
true
undefined`,
        atencao: 'O Python responderia `IndexError` à posição 5. O JavaScript responde `undefined`, e o programa segue com ele.',
        marcas: ['arranjo', 'array', 'length', 'push'],
      },
      {
        id: 'map',
        titulo: 'map: transformar cada um',
        resumo: 'Um arranjo novo, do mesmo tamanho, com cada item transformado.',
        explicacao: [
          '`map` passa cada item do arranjo por uma função e junta o que ela devolve num arranjo **novo**, do mesmo tamanho. O original continua como estava.',
          'A função recebe o item e devolve o que ele vira: `precos.map(p => p * 2)` dobra cada preço. É a lista por compreensão do Python, `[p * 2 for p in precos]`, escrita como chamada.',
          'Se a função esquecer de devolver alguma coisa, o arranjo novo sai cheio de `undefined` — do tamanho certo, e vazio de sentido.',
        ],
        exemplo: `const nomes = ['ana', 'bruno', 'carla'];
const maiusculos = nomes.map(n => n.toUpperCase());
console.log(maiusculos);
console.log(nomes);`,
        exemploComo: 'javascript',
        exemploSaida: `[ 'ANA', 'BRUNO', 'CARLA' ]
[ 'ana', 'bruno', 'carla' ]`,
        marcas: ['map', 'transformar'],
      },
      {
        id: 'filter',
        titulo: 'filter: escolher alguns',
        resumo: 'Um arranjo novo, só com os itens que passaram no teste.',
        explicacao: [
          '`filter` passa cada item por uma função que responde verdadeiro ou falso. No arranjo novo ficam só os itens em que ela respondeu verdadeiro.',
          '`idades.filter(i => i >= 12)` devolve só as idades de 12 para cima. O arranjo novo pode sair menor, do mesmo tamanho, ou vazio — e vazio não é erro: é a resposta "ninguém passou".',
        ],
        exemplo: `const idades = [10, 13, 12, 9, 15];
const maiores = idades.filter(i => i >= 12);
console.log(maiores);
console.log(idades.filter(i => i > 20));`,
        exemploComo: 'javascript',
        exemploSaida: `[ 13, 12, 15 ]
[]`,
        marcas: ['filter', 'escolher'],
      },
      {
        id: 'reduce',
        titulo: 'reduce: juntar tudo num só',
        resumo: 'Um total, uma contagem, um maior — a partir de um valor inicial.',
        explicacao: [
          '`reduce` junta o arranjo inteiro num valor só. A função recebe o **acumulado** até agora e o item da vez, e devolve o acumulado novo; depois da função vem o valor de onde a conta começa.',
          '`pontos.reduce((soma, p) => soma + p, 0)` começa em 0, soma o primeiro, soma o segundo, e devolve o total. É o `sum` do Python, com a conta à mostra — e serve para qualquer junção, não só soma.',
          'O valor inicial é opcional, e é melhor nunca deixá-lo de fora: sem ele, o `reduce` de um arranjo vazio para o programa com `TypeError`. E o arranjo filtrado fica vazio no dia em que ninguém pagou.',
        ],
        exemplo: `const pontos = [18, 25, 14];
const total = pontos.reduce((soma, p) => soma + p, 0);
console.log(total);
const vazio = [];
console.log(vazio.reduce((soma, p) => soma + p, 0));`,
        exemploComo: 'javascript',
        exemploSaida: `57
0`,
        marcas: ['reduce', 'acumulado', 'valor inicial'],
      },
      {
        id: 'encadear',
        titulo: 'Encadear',
        resumo: 'filter, depois map, depois reduce — cada um entrega ao seguinte.',
        explicacao: [
          'Como `filter` e `map` devolvem arranjos, dá para chamar o próximo direto no resultado: `inscricoes.filter(...).map(...)`. Cada passo recebe o que o anterior entregou.',
          'Lido em voz alta, o encadeamento diz o que o programa faz: "das inscrições, as pagas; delas, os nomes". É por isso que ele costuma substituir o laço com `if` e `push` — o laço faz o mesmo, e esconde a intenção no meio das chaves.',
          '`join` fecha a conta quando o destino é texto: `nomes.join(", ")` junta os itens de um arranjo com o separador no meio.',
        ],
        exemplo: `const inscricoes = [
  { nome: 'Ana', pagou: true },
  { nome: 'Bruno', pagou: false },
  { nome: 'Carla', pagou: true },
];
const pagaram = inscricoes.filter(i => i.pagou).map(i => i.nome);
console.log(pagaram.join(', '));`,
        exemploComo: 'javascript',
        exemploSaida: 'Ana, Carla',
        marcas: ['encadear', 'join', 'filter', 'map'],
      },
    ],
  },
  {
    id: 'objetos',
    topicos: [
      {
        id: 'objeto',
        titulo: 'O objeto',
        resumo: 'Valores com nome, entre chaves — o dicionário do Python.',
        explicacao: [
          '**Objeto** é um conjunto de valores com nome, entre chaves: `{ nome: "Ana", idade: 12 }`. Cada par é uma **propriedade**: o nome, dois-pontos, o valor. É o dicionário do Python, com uma diferença de escrita: o nome da propriedade dispensa as aspas.',
          'Lê-se com ponto: `pessoa.nome`. Quando o nome está numa variável, ou tem espaço, usa-se colchetes: `pessoa["nome"]`.',
          'Ler uma propriedade que não existe não dá erro, como dava o `KeyError` do Python: devolve `undefined`. Ler uma propriedade **de** `undefined` dá — é o `TypeError: Cannot read properties of undefined` que todo programador de JavaScript já viu.',
        ],
        exemplo: `const pessoa = { nome: 'Ana', idade: 12, unidade: 'Águia' };
console.log(pessoa.nome);
console.log(pessoa['unidade']);
console.log(pessoa.telefone);
console.log(pessoa);`,
        exemploComo: 'javascript',
        exemploSaida: `Ana
Águia
undefined
{ nome: 'Ana', idade: 12, unidade: 'Águia' }`,
        marcas: ['objeto', 'propriedade', 'undefined'],
      },
      {
        id: 'mudar-objeto',
        titulo: 'Mudar um objeto, e quem mais vê a mudança',
        resumo: 'Acrescentar e trocar propriedades — e o objeto que é um só.',
        explicacao: [
          'Atribuir a uma propriedade que não existe a cria; atribuir a uma que existe troca o valor. `pessoa.pagou = true` faz uma das duas coisas, conforme o caso.',
          'Um objeto não é copiado ao ser guardado em outra variável. `const outra = pessoa` faz `outra` apontar para o **mesmo** objeto: mudar por um nome muda o que o outro vê.',
          'Para ter uma cópia de verdade, espalhe as propriedades num objeto novo: `const copia = { ...pessoa }`. Os três pontos trazem as propriedades de lá para cá.',
        ],
        exemplo: `const ana = { nome: 'Ana', pagou: false };
const mesma = ana;
const copia = { ...ana };
mesma.pagou = true;
console.log(ana.pagou, copia.pagou);`,
        exemploComo: 'javascript',
        exemploSaida: 'true false',
        atencao: 'A cópia com `...` é rasa: se uma propriedade guarda outro objeto ou um arranjo, os dois continuam dividindo esse de dentro.',
        marcas: ['objeto', 'referência', 'cópia', '...'],
      },
      {
        id: 'metodo',
        titulo: 'Método e this',
        resumo: 'Uma função que mora no objeto e lê as propriedades dele.',
        explicacao: [
          '**Método** é uma função guardada numa propriedade do objeto. Escreve-se dentro das chaves como `resumo() { ... }`, e chama-se pelo objeto: `unidade.resumo()`.',
          'Dentro do método, `this` é o objeto que o chamou. `this.nome` lê a propriedade `nome` dele, e `this.membros.push(...)` mexe no arranjo dele. É o `self` do Python — só que aqui ele não aparece na lista de parâmetros.',
          'Com métodos, o objeto deixa de ser só um pacote de dados: ele passa a saber fazer coisas com os próprios dados, e quem o usa não precisa saber como.',
        ],
        exemplo: `const unidade = {
  nome: 'Pantera',
  membros: ['Ana'],
  entrar(nome) {
    this.membros.push(nome);
  },
  resumo() {
    return this.nome + ': ' + this.membros.length + ' membros';
  },
};
unidade.entrar('Bruno');
console.log(unidade.resumo());`,
        exemploComo: 'javascript',
        exemploSaida: 'Pantera: 2 membros',
        marcas: ['método', 'this'],
      },
      {
        id: 'seta-sem-this',
        titulo: 'A seta não tem this',
        resumo: 'Por que método se escreve com a forma longa.',
        explicacao: [
          'A função de seta não tem `this` próprio: ela usa o `this` do lugar onde foi escrita. Escrita como método, ela não enxerga o objeto — lê o `this` de fora, que num módulo é `undefined`.',
          'O resultado depende de onde se está, e nenhum caso é bom: ou o programa para com `TypeError` ao ler a propriedade, ou segue com `undefined` escrito no meio do texto.',
          'A regra é curta: método se escreve como `nome() { ... }`. A seta fica para as funções que vão como argumento — dentro de um método, inclusive, onde ela é útil justamente porque **herda** o `this` do método.',
        ],
        exemplo: `const unidade = {
  nome: 'Pantera',
  membros: ['Ana', 'Bruno'],
  listar() {
    this.membros.forEach(m => console.log(m + ' é da ' + this.nome));
  },
};
unidade.listar();`,
        exemploComo: 'javascript',
        exemploSaida: `Ana é da Pantera
Bruno é da Pantera`,
        atencao: 'Repare que aqui a seta está **dentro** do método, e por isso o `this` dela é o do método. Se `listar` fosse uma seta, o `this` seria o de fora.',
        marcas: ['this', 'seta', 'método'],
      },
    ],
  },
  {
    id: 'assincrono',
    topicos: [
      {
        id: 'esperar-sem-parar',
        titulo: 'Esperar sem parar',
        resumo: 'O que demora acontece depois, e o resto do programa segue.',
        explicacao: [
          'Algumas coisas demoram: buscar dados na internet, ler um arquivo grande, esperar um tempo. Um programa **síncrono** pararia em cada uma, de braços cruzados. O JavaScript não para: ele anota "quando isto terminar, faça aquilo" e segue para a próxima linha.',
          'Isso é **execução assíncrona**: a parte demorada acontece fora do caminho, e o que depende dela roda depois, quando ela termina. Enquanto isso, o resto do programa continua.',
          'A consequência é que a ordem em que as linhas aparecem no arquivo deixa de ser a ordem em que acontecem. No exemplo, a linha do meio é a última a escrever — mesmo com espera zero, ela vai para o fim da fila.',
        ],
        exemplo: `console.log('Pedi a pizza');
setTimeout(() => console.log('A pizza chegou'), 0);
console.log('Arrumei a mesa');`,
        exemploComo: 'javascript',
        exemploSaida: `Pedi a pizza
Arrumei a mesa
A pizza chegou`,
        marcas: ['assíncrono', 'síncrono', 'setTimeout'],
      },
      {
        id: 'promessa',
        titulo: 'A promessa',
        resumo: 'Um valor que ainda vai chegar — ou falhar.',
        explicacao: [
          'Uma **promessa** (*Promise*) representa um resultado que ainda não existe. Ela nasce **pendente**, e depois vira **cumprida**, com o valor, ou **rejeitada**, com o erro. Uma vez decidida, não muda mais.',
          'Quem cria a promessa recebe duas funções: `resolve`, para cumprir, e `reject`, para rejeitar. Quem usa a promessa diz o que fazer com o resultado por `.then(...)`, e com o erro por `.catch(...)`.',
          'Toda função que busca coisa demorada — na internet, no disco — devolve uma promessa em vez do valor. É assim que ela consegue devolver na hora, sem travar ninguém.',
        ],
        exemplo: `const sorteio = new Promise(resolve => {
  setTimeout(() => resolve('Unidade Águia'), 500);
});
sorteio.then(vencedora => console.log('Venceu:', vencedora));
console.log('Sorteando...');`,
        exemploComo: 'javascript',
        exemploSaida: `Sorteando...
Venceu: Unidade Águia`,
        marcas: ['Promise', 'resolve', 'then', 'pendente'],
      },
      {
        id: 'async-await',
        titulo: 'async e await',
        resumo: 'Esperar uma promessa escrevendo como se fosse de cima para baixo.',
        explicacao: [
          '`await` antes de uma promessa espera ela ser cumprida e entrega o valor: `const n = await buscarInscricoes("Águia")`. A linha seguinte só roda depois — e, enquanto isso, o resto do programa continua livre.',
          '`await` só pode ser usado dentro de uma função marcada com `async`, ou no topo de um arquivo que usa `import`. Fora disso, o arquivo nem chega a rodar: `SyntaxError`.',
          'Toda função `async` devolve uma promessa. Quem a chama também precisa de `await` para receber o valor de dentro.',
        ],
        exemplo: `const esperar = ms => new Promise(resolve => setTimeout(resolve, ms));

async function contagem() {
  for (let i = 3; i >= 1; i--) {
    console.log(i);
    await esperar(1000);
  }
  console.log('Já!');
}
contagem();`,
        exemploComo: 'javascript',
        exemploSaida: `3
2
1
Já!`,
        marcas: ['async', 'await', 'promessa'],
      },
      {
        id: 'erro-na-promessa',
        titulo: 'Quando a promessa falha',
        resumo: 'try e catch em volta do await.',
        explicacao: [
          'Uma promessa rejeitada, esperada com `await`, vira um erro lançado ali mesmo, na linha do `await`. É o `try/except` do Python que segura: aqui ele se chama `try/catch`.',
          '`try { ... } catch (erro) { ... }`: o que está no `try` roda; se algo falhar, o programa pula para o `catch`, que recebe o erro. `erro.message` é o texto que explica o que houve.',
          'Sem o `catch`, a rejeição não tratada derruba o programa inteiro — e numa busca pela internet, falhar uma vez é o normal, não a exceção.',
        ],
        exemplo: `async function buscar() {
  throw new Error('Sem conexão');
}

async function principal() {
  try {
    await buscar();
    console.log('Isto não aparece');
  } catch (erro) {
    console.log('Falhou:', erro.message);
  }
  console.log('O programa continua');
}
principal();`,
        exemploComo: 'javascript',
        exemploSaida: `Falhou: Sem conexão
O programa continua`,
        marcas: ['try', 'catch', 'reject', 'erro'],
      },
      {
        id: 'esqueceu-o-await',
        titulo: 'O await que faltou',
        resumo: 'Promise { <pending> } no terminal quer dizer isto.',
        explicacao: [
          'Chamar uma função que devolve promessa sem `await` não dá erro: devolve a **promessa**, e não o valor. Imprimir esse resultado escreve `Promise { <pending> }` — a promessa, ainda pendente.',
          'Somar com ela dá texto estranho; comparar dá falso; guardar num arquivo grava `{}`. Nada estoura no lugar onde o `await` faltou.',
          'Quando aparecer `Promise { <pending> }` no terminal, procure a chamada sem `await` logo antes.',
        ],
        exemplo: `const esperar = ms => new Promise(resolve => setTimeout(resolve, ms));

async function contar() {
  await esperar(300);
  return 8;
}
const semEsperar = contar();
console.log(semEsperar);

async function principal() {
  const esperando = await contar();
  console.log(esperando);
}
principal();`,
        exemploComo: 'javascript',
        exemploSaida: `Promise { <pending> }
8`,
        marcas: ['await', 'Promise', 'pending'],
      },
    ],
  },
  {
    id: 'json',
    topicos: [
      {
        id: 'o-que-e-json',
        titulo: 'O que é JSON',
        resumo: 'Um jeito de escrever dados como texto, que qualquer linguagem lê.',
        explicacao: [
          '**JSON** é um formato de texto para guardar e trocar dados. Ele se parece com os objetos e arranjos do JavaScript — o nome é *JavaScript Object Notation* —, e mesmo assim é lido por Python, por planilha, por banco de dados, por qualquer coisa.',
          'As regras são mais duras que as do JavaScript: o nome da propriedade vai sempre entre **aspas duplas**, o texto também, e não pode sobrar vírgula depois do último item. Valores possíveis: texto, número, `true`, `false`, `null`, arranjo e objeto. Função não entra, e `undefined` também não.',
          'É o formato que a CC004 usou com o módulo `json` do Python. O arquivo é o mesmo: um JSON gravado pelo Python é lido pelo JavaScript, e o contrário.',
        ],
        exemplo: `const texto = '{"nome": "Ana", "idade": 12, "unidades": ["Águia"]}';
const dado = JSON.parse(texto);
console.log(dado.nome, dado.unidades[0]);`,
        exemploComo: 'javascript',
        exemploSaida: 'Ana Águia',
        marcas: ['JSON', 'aspas duplas', 'formato'],
      },
      {
        id: 'parse-e-stringify',
        titulo: 'JSON.parse e JSON.stringify',
        resumo: 'De texto para objeto, e de objeto para texto.',
        explicacao: [
          '`JSON.parse(texto)` transforma o texto JSON em objetos e arranjos de verdade. `JSON.stringify(valor)` faz o caminho de volta: transforma o objeto em texto.',
          'O `stringify` aceita mais dois argumentos. O segundo quase sempre fica `null`; o terceiro é o recuo: `JSON.stringify(dado, null, 2)` quebra as linhas e recua dois espaços, para uma pessoa conseguir ler.',
          'Na volta, o que não cabe no JSON some: propriedade com `undefined` e propriedade com função não aparecem no texto.',
        ],
        exemplo: `const ficha = { nome: 'Ana', pagou: true, falar() {} };
console.log(JSON.stringify(ficha));
console.log(JSON.stringify(ficha, null, 2));`,
        exemploComo: 'javascript',
        exemploSaida: `{"nome":"Ana","pagou":true}
{
  "nome": "Ana",
  "pagou": true
}`,
        marcas: ['JSON.parse', 'JSON.stringify', 'recuo'],
      },
      {
        id: 'ler-arquivo',
        titulo: 'Ler um arquivo',
        resumo: 'O módulo fs, e o utf8 que não pode faltar.',
        explicacao: [
          'No Node, quem mexe em arquivo é o módulo `fs` (de *file system*). Ele vem com o Node, e se traz para o programa com `import { readFileSync } from "node:fs";`, no topo do arquivo.',
          '`readFileSync("inscritos.json", "utf8")` devolve o conteúdo do arquivo como texto. Para virar dado, o texto ainda passa por `JSON.parse`.',
          'O `"utf8"` diz como ler os bytes como letras. Sem ele, o `readFileSync` devolve os bytes crus, e o terminal mostra `<Buffer 5b 7b 22 ...>`. Arquivo que não existe para o programa com `ENOENT: no such file or directory`.',
        ],
        exemplo: `import { readFileSync } from 'node:fs';

const texto = readFileSync('unidades.json', 'utf8');
const unidades = JSON.parse(texto);
console.log(unidades.length, 'unidades');`,
        exemploComo: 'javascript',
        marcas: ['fs', 'readFileSync', 'utf8', 'Buffer'],
      },
      {
        id: 'gravar-arquivo',
        titulo: 'Gravar um arquivo',
        resumo: 'writeFileSync, e por que o objeto precisa virar texto antes.',
        explicacao: [
          '`writeFileSync("inscritos.json", texto)` grava o texto no arquivo, **substituindo** o que havia. Se o arquivo não existe, ele é criado.',
          'Arquivo só guarda texto. Mandar o objeto direto não grava nada: o programa para com `TypeError: The "data" argument must be of type string...`. O objeto passa por `JSON.stringify` antes.',
          'Ler, mudar e gravar é o ciclo inteiro: lê o arquivo, transforma em dado com `parse`, muda o dado na memória, transforma de volta com `stringify`, e grava. Mudar o dado na memória sem gravar é mudar nada — o arquivo continua como estava.',
        ],
        exemplo: `import { readFileSync, writeFileSync } from 'node:fs';

const lista = JSON.parse(readFileSync('lista.json', 'utf8'));
lista.push('Helena');
writeFileSync('lista.json', JSON.stringify(lista, null, 2));`,
        exemploComo: 'javascript',
        atencao: 'Esquecer o `stringify` não grava `[object Object]` como em outras linguagens: o Node recusa e para o programa. É o melhor dos erros, porque aparece na linha certa.',
        marcas: ['writeFileSync', 'gravar', 'stringify'],
      },
      {
        id: 'json-invalido',
        titulo: 'JSON que não se lê',
        resumo: 'Uma vírgula a mais derruba o arquivo inteiro.',
        explicacao: [
          '`JSON.parse` é exigente: aspas simples, vírgula sobrando no fim, nome de propriedade sem aspas — qualquer um desses faz ele parar com `SyntaxError`, dizendo a posição em que se perdeu.',
          'Arquivo editado à mão é onde isso acontece. Quando o arquivo pode vir de fora, ponha o `parse` dentro de um `try/catch` e diga, em português, o que deu errado.',
        ],
        exemplo: `const texto = '{"nome": "Ana",}';
try {
  JSON.parse(texto);
} catch (erro) {
  console.log('O arquivo não é JSON válido:', erro.name);
}`,
        exemploComo: 'javascript',
        exemploSaida: 'O arquivo não é JSON válido: SyntaxError',
        marcas: ['SyntaxError', 'JSON.parse', 'try'],
      },
    ],
  },
  {
    id: 'programa',
    topicos: [
      {
        id: 'fora-do-navegador',
        titulo: 'Um programa fora do navegador',
        resumo: 'O arquivo, a pasta, e o comando que os junta.',
        explicacao: [
          'Um programa de linha de comando é um arquivo `.js` numa pasta, junto dos arquivos que ele lê e grava. Para executá-lo, abre-se o terminal **na pasta dele** e digita-se `node programa.js`.',
          'O caminho dos arquivos que o programa abre é contado a partir da pasta onde o terminal está. Se o terminal estiver em outra pasta, `readFileSync("pontuacao.json")` não acha o arquivo — mesmo ele estando ao lado do programa.',
          'No computador do clube, o Node se instala pelo site oficial, nodejs.org, na versão chamada LTS — a de suporte longo, a que se usa para trabalhar. Depois de instalado, `node --version` no terminal confirma.',
        ],
        exemplo: `// No terminal, dentro da pasta do programa:
//
//   cd gincana
//   node programa.js
//
console.log('Rodando no Node, e não no navegador');
console.log(typeof document);`,
        exemploComo: 'javascript',
        exemploSaida: `Rodando no Node, e não no navegador
undefined`,
        atencao: 'Fora do navegador não há página: `document` e `window` não existem, e `alert` e `prompt` também não. Usá-los dá `ReferenceError`.',
        marcas: ['node', 'terminal', 'cd', 'LTS'],
      },
      {
        id: 'dividir-em-funcoes',
        titulo: 'Dividir o problema em funções',
        resumo: 'Cada função faz uma coisa, e o nome diz qual.',
        explicacao: [
          'Um programa que resolve um problema de verdade se escreve em partes: uma lê os dados, outra calcula, outra mostra. Cada parte vira uma função com nome, que recebe o que precisa e devolve o que produz.',
          'O nome bom diz o que ela faz — `somarPorUnidade`, `carregar`, `mostrar` — e dispensa ler o corpo. A última linha do programa, que chama as outras, passa a ser o resumo dele.',
          'Função que lê do arquivo e escreve na tela ao mesmo tempo não se reaproveita: separada, a conta serve para o relatório de hoje e para o do ano que vem.',
        ],
        exemplo: `const somar = valores => valores.reduce((s, v) => s + v, 0);
function media(valores) {
  return somar(valores) / valores.length;
}
function mostrar(nome, valores) {
  console.log(nome + ': média ' + media(valores).toFixed(1));
}
mostrar('Águia', [18, 25, 14, 23]);
mostrar('Falcão', [22, 19, 24, 20]);`,
        exemploComo: 'javascript',
        exemploSaida: `Águia: média 20.0
Falcão: média 21.3`,
        marcas: ['função', 'dividir', 'toFixed'],
      },
      {
        id: 'modulos',
        titulo: 'Dois arquivos: import e export',
        resumo: 'O que um arquivo oferece, e o que o outro traz.',
        explicacao: [
          'Quando o programa cresce, as funções vão para outro arquivo. Lá, `export` diz o que o arquivo oferece: `export function carregar(...) { ... }`. Aqui, `import { carregar } from "./dados.js";` traz a função para usar.',
          'O `./` diz que o arquivo está na mesma pasta, e a extensão `.js` é obrigatória: sem ela, o Node responde `Cannot find module`, e ainda sugere o nome certo.',
          'Um arquivo também pode ter uma exportação principal, com `export default`, que se importa sem chaves: `import carregar from "./dados.js";`.',
        ],
        exemplo: `// No arquivo dados.js:
//   export function carregar(nome) { ... }
//
// No programa.js:
import { carregar } from './dados.js';

const pontuacao = carregar('pontuacao.json');`,
        exemploComo: 'javascript',
        marcas: ['import', 'export', 'módulo'],
      },
      {
        id: 'require',
        titulo: 'O require que você vai encontrar',
        resumo: 'O jeito antigo de trazer módulo, e como reconhecê-lo.',
        explicacao: [
          'Antes de o `import` existir, o Node trazia módulos com `require`: `const fs = require("fs");`. E o arquivo oferecia com `module.exports = { ... }`. Esse jeito se chama **CommonJS**, e metade dos exemplos da internet ainda o usa.',
          'Os dois funcionam, mas não no mesmo arquivo: num arquivo com `import`, o `require` não existe e dá `ReferenceError`. Escolha um jeito por programa — nesta vereda, o `import`.',
        ],
        exemplo: `const fs = require('fs');
const dobro = n => n * 2;
console.log(typeof fs.readFileSync, dobro(21));`,
        exemploComo: 'javascript',
        exemploSaida: 'function 42',
        marcas: ['require', 'CommonJS', 'module.exports'],
      },
    ],
  },
];

const cap = (id: string) => CAPITULOS.find(c => c.id === id)!.topicos;

/* ────────────────────────────────────────────────────────────────────────
   Os módulos
   ──────────────────────────────────────────────────────────────────────── */

/* O que o formulário de inscrição exporta: uma linha só, como todo sistema
   que grava para outro sistema ler. É por isso que gravar com recuo é tarefa:
   o arquivo que chega não ensina a forma. */
export const INSCRITOS_DO_FORMULARIO = '[{"nome":"Ana","unidade":"Águia","idade":10,"pagou":true},{"nome":"Bruno","unidade":"Falcão","idade":13,"pagou":false},{"nome":"Carla","unidade":"Pantera","idade":12,"pagou":true},{"nome":"Davi","unidade":"Águia","idade":15,"pagou":true},{"nome":"Elisa","unidade":"Tucano","idade":11,"pagou":false}]';

/* O servidor da secretaria. Ele demora, e a unidade Tucano falha na primeira
   tentativa — é o que faz o `catch` ter o que tratar. Só de leitura: quem
   escreve o servidor não é quem estuda, como na vida. */
const SERVIDOR = `// O servidor da secretaria, de mentira. Ele faz o papel da internet,
// que demora e às vezes falha — não precisa mexer nele.
const INSCRITOS = { 'Águia': 8, 'Falcão': 6, 'Tucano': 5 };
const DEMORA = { 'Águia': 800, 'Falcão': 300, 'Tucano': 500 };
let tentativasDoTucano = 0;

export function buscarInscricoes(unidade) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (unidade === 'Tucano' && tentativasDoTucano++ === 0) {
        reject(new Error('Sem conexão com a unidade Tucano'));
      } else {
        resolve(INSCRITOS[unidade]);
      }
    }, DEMORA[unidade]);
  });
}
`;

/* A pontuação da gincana, por prova. O ranking não se lê de cara: a unidade
   que vence mais provas não é a que soma mais. */
export const PONTUACAO_DA_GINCANA = `[
  { "unidade": "Águia", "prova": "Nós", "pontos": 18 },
  { "unidade": "Falcão", "prova": "Nós", "pontos": 22 },
  { "unidade": "Pantera", "prova": "Nós", "pontos": 15 },
  { "unidade": "Tucano", "prova": "Nós", "pontos": 20 },
  { "unidade": "Águia", "prova": "Primeiros socorros", "pontos": 25 },
  { "unidade": "Falcão", "prova": "Primeiros socorros", "pontos": 19 },
  { "unidade": "Pantera", "prova": "Primeiros socorros", "pontos": 23 },
  { "unidade": "Tucano", "prova": "Primeiros socorros", "pontos": 17 },
  { "unidade": "Águia", "prova": "Ordem unida", "pontos": 14 },
  { "unidade": "Falcão", "prova": "Ordem unida", "pontos": 24 },
  { "unidade": "Pantera", "prova": "Ordem unida", "pontos": 21 },
  { "unidade": "Tucano", "prova": "Ordem unida", "pontos": 16 },
  { "unidade": "Águia", "prova": "Fogueira", "pontos": 23 },
  { "unidade": "Falcão", "prova": "Fogueira", "pontos": 20 },
  { "unidade": "Pantera", "prova": "Fogueira", "pontos": 25 },
  { "unidade": "Tucano", "prova": "Fogueira", "pontos": 12 }
]
`;

export const MODULOS_DE_JAVASCRIPT: ModuloDeVereda[] = [
  {
    id: 'm1',
    titulo: 'Do Python para o JavaScript',
    resumo: 'Onde ele roda, o tipo que mora no valor, e as três diferenças que mais pegam.',
    licoes: [
      {
        id: 'm1-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_JAVASCRIPT['m1-teoria'],
        perguntas: 4,
        titulo: 'A mesma ideia, outra língua',
        resumo: 'Node e console.log, tipagem dinâmica, chaves, let e o igual de três sinais.',
        topicos: cap('do-python'),
      },
      {
        id: 'm1-lab', tipo: 'laboratorio', linguagem: 'javascript',
        titulo: 'A taxa do acampamento, em JavaScript',
        resumo: 'Reescrever em JavaScript um programa que já funciona em Python.',
        arquivo: 'programa.js',
        projeto: 'acampamento',
        /* As três diferenças do requisito 3 viram as três tarefas de
           estrutura: o laço com chaves, a variável declarada, a igualdade de
           três sinais. A saída é a mesma do Python, linha por linha — é o que
           prova que a tradução não mudou o programa. */
        verificacoes: ['semVar', 'igualdadeEstrita', 'laco', 'saidaEsperada'],
        saidaEsperada: `Ana: R$ 135
Bia: R$ 135
Caio: R$ 115
Davi: R$ 135
Total: R$ 520`,
        modelo: `// A taxa do acampamento
//
// Este programa já existe em Python, e funciona. Reescreva-o em JavaScript,
// aqui embaixo, para que ele produza exatamente a mesma saída:
//
//     inscritos = ["Ana", "Bia", "Caio", "Davi"]
//     diaria = 45
//     dias = 3
//     total = 0
//     for nome in inscritos:
//         valor = diaria * dias
//         if nome == "Caio":
//             valor = valor - 20   # desconto de irmão
//         print(f"{nome}: R$ {valor}")
//         total = total + valor
//     print(f"Total: R$ {total}")
//
// Três coisas mudam na tradução, e são as três da lição: o bloco vai entre
// chaves, toda variável é declarada com let ou const, e a igualdade tem três
// sinais. A f-string vira o texto entre crases, com \${...} no meio.
`,
      },
    ],
  },
  {
    id: 'm2',
    titulo: 'let, const e o escopo',
    resumo: 'O que muda e o que não muda, e onde cada nome existe.',
    licoes: [
      {
        id: 'm2-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_JAVASCRIPT['m2-teoria'],
        perguntas: 4,
        titulo: 'Onde cada nome existe',
        resumo: 'let e const, o const que não congela, o escopo de bloco e o var.',
        topicos: cap('variaveis'),
      },
      {
        id: 'm2-lab', tipo: 'laboratorio', linguagem: 'javascript',
        titulo: 'O placar que vazava',
        resumo: 'Trocar cada var por let ou const — e ver dois defeitos sumirem.',
        arquivo: 'programa.js',
        projeto: 'gincana',
        /* O modelo roda, e roda errado de dois jeitos que só o var produz: o
           título de dentro do if reescreve o de fora, e o laço que agenda o
           parabéns escreve "undefined" três vezes. Trocar a palavra conserta
           os dois, e é a demonstração do requisito 4.1 com a explicação
           dentro: a diferença aparece na saída. */
        verificacoes: ['semVar', 'letEConst', 'saidaEsperada'],
        saidaEsperada: `Recorde da gincana!
Placar da gincana: 50 pontos
Parabéns, unidade Águia
Parabéns, unidade Falcão
Parabéns, unidade Pantera`,
        modelo: `// O placar que vazava
//
// Execute primeiro, como está, e leia o terminal. O programa roda até o fim
// e erra duas vezes: o placar sai com o título errado, e o parabéns sai para
// a unidade "undefined".
//
// Os dois defeitos são do var. Troque cada var por const, quando o valor
// nunca muda, ou por let, quando muda. A saída certa é:
//
//     Recorde da gincana!
//     Placar da gincana: 50 pontos
//     Parabéns, unidade Águia
//     Parabéns, unidade Falcão
//     Parabéns, unidade Pantera

var pontos = [10, 25, 15];
var total = 0;
for (var i = 0; i < pontos.length; i++) {
  total = total + pontos[i];
}

var titulo = 'Placar da gincana';
if (total > 40) {
  var titulo = 'Recorde da gincana!';
  console.log(titulo);
}
console.log(titulo + ': ' + total + ' pontos');

var unidades = ['Águia', 'Falcão', 'Pantera'];
for (var j = 0; j < unidades.length; j++) {
  setTimeout(function () {
    console.log('Parabéns, unidade ' + unidades[j]);
  }, 100);
}
`,
      },
    ],
  },
  {
    id: 'm3',
    titulo: 'Decidir e repetir',
    resumo: 'if e else, o que conta como falso, e os três laços.',
    licoes: [
      {
        id: 'm3-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_JAVASCRIPT['m3-teoria'],
        perguntas: 4,
        titulo: 'Caminhos e voltas',
        resumo: 'if, else if e else, o que conta como falso, for, for...of e while.',
        topicos: cap('decidir-e-repetir'),
      },
      {
        id: 'm3-lab', tipo: 'laboratorio', linguagem: 'javascript',
        titulo: 'A classe de cada um',
        resumo: 'Percorrer os inscritos e dizer a classe de cada um pela idade.',
        arquivo: 'programa.js',
        projeto: 'secretaria',
        verificacoes: ['laco', 'seSenao', 'saidaEsperada'],
        saidaEsperada: `Ana (10): Amigo
Bruno (13): Pioneiro
Carla (12): Pesquisador
Davi (15): Guia
Elisa (11): Companheiro
Fábio (9): fora da faixa
Gabi (14): Excursionista
Fora da faixa: 1`,
        modelo: `// A classe de cada um
//
// A secretaria precisa saber em que classe cada inscrito entra, pela idade:
//
//     10 Amigo · 11 Companheiro · 12 Pesquisador · 13 Pioneiro
//     14 Excursionista · 15 Guia
//
// Qualquer outra idade é "fora da faixa", e no fim o programa diz quantos
// ficaram fora. Cada inscrito é um objeto — o dicionário do Python —, e
// pessoa.nome lê o nome dele; o módulo 6 conta o resto.
//
// A saída tem de ser exatamente esta:
//
//     Ana (10): Amigo
//     Bruno (13): Pioneiro
//     Carla (12): Pesquisador
//     Davi (15): Guia
//     Elisa (11): Companheiro
//     Fábio (9): fora da faixa
//     Gabi (14): Excursionista
//     Fora da faixa: 1

const inscritos = [
  { nome: 'Ana', idade: 10 },
  { nome: 'Bruno', idade: 13 },
  { nome: 'Carla', idade: 12 },
  { nome: 'Davi', idade: 15 },
  { nome: 'Elisa', idade: 11 },
  { nome: 'Fábio', idade: 9 },
  { nome: 'Gabi', idade: 14 },
];
`,
      },
    ],
  },
  {
    id: 'm4',
    titulo: 'Funções',
    resumo: 'A função com function, a de seta, a anônima — e a função como valor.',
    licoes: [
      {
        id: 'm4-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_JAVASCRIPT['m4-teoria'],
        perguntas: 4,
        titulo: 'Dois jeitos de escrever uma função',
        resumo: 'function, a seta, a função anônima e a função que vai como valor.',
        topicos: cap('funcoes'),
      },
      {
        id: 'm4-lab', tipo: 'laboratorio', linguagem: 'javascript',
        titulo: 'A conta da cantina',
        resumo: 'Uma função com function e outra de seta, as duas trabalhando juntas.',
        arquivo: 'programa.js',
        projeto: 'cantina',
        verificacoes: ['funcaoNomeada', 'funcaoDeSeta', 'saidaEsperada'],
        saidaEsperada: `Ana: R$ 14, troco de R$ 6
Bruno: R$ 22, troco de R$ 28
Carla: R$ 4, troco de R$ 1`,
        modelo: `// A conta da cantina
//
// Lanche custa R$ 6 e suco custa R$ 4. Escreva duas funções:
//
//   - precoDoPedido(lanches, sucos), com function, que devolve o total;
//   - troco(pago, total), de seta, guardada numa const, que devolve o troco.
//
// Depois, use as duas para os três pedidos abaixo — o nome, quantos lanches,
// quantos sucos, e quanto a pessoa pagou —, produzindo exatamente:
//
//     Ana: R$ 14, troco de R$ 6
//     Bruno: R$ 22, troco de R$ 28
//     Carla: R$ 4, troco de R$ 1

const pedidos = [
  ['Ana', 1, 2, 20],
  ['Bruno', 3, 1, 50],
  ['Carla', 0, 1, 5],
];
`,
      },
    ],
  },
  {
    id: 'm5',
    titulo: 'Arranjos: map, filter e reduce',
    resumo: 'A lista em ordem, e as três funções que trabalham nela inteira.',
    licoes: [
      {
        id: 'm5-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_JAVASCRIPT['m5-teoria'],
        perguntas: 4,
        titulo: 'Transformar, escolher, juntar',
        resumo: 'O arranjo, map, filter, reduce e o encadeamento dos três.',
        topicos: cap('arranjos'),
      },
      {
        id: 'm5-lab', tipo: 'laboratorio', linguagem: 'javascript',
        titulo: 'O caixa da gincana',
        resumo: 'Quem pagou, quanto entrou e quem falta — com map, filter e reduce.',
        arquivo: 'programa.js',
        projeto: 'tesouraria',
        verificacoes: ['usaMap', 'usaFilter', 'usaReduce', 'saidaEsperada'],
        saidaEsperada: `Pagaram: ANA, CARLA, DAVI
Arrecadado: R$ 385
Faltam pagar: Bruno, Elisa`,
        modelo: `// O caixa da gincana
//
// A tesouraria quer três linhas: os nomes de quem pagou, em maiúsculas; o
// total arrecadado; e os nomes de quem ainda falta pagar.
//
// Use filter para escolher, map para transformar e reduce para somar — com
// o valor inicial. join(', ') junta um arranjo de nomes num texto só.
//
// A saída tem de ser exatamente esta:
//
//     Pagaram: ANA, CARLA, DAVI
//     Arrecadado: R$ 385
//     Faltam pagar: Bruno, Elisa

const inscricoes = [
  { nome: 'Ana', valor: 135, pagou: true },
  { nome: 'Bruno', valor: 135, pagou: false },
  { nome: 'Carla', valor: 115, pagou: true },
  { nome: 'Davi', valor: 135, pagou: true },
  { nome: 'Elisa', valor: 135, pagou: false },
];
`,
      },
    ],
  },
  {
    id: 'm6',
    titulo: 'Objetos',
    resumo: 'Propriedades com nome, o objeto que é um só, e o método que lê o próprio objeto.',
    licoes: [
      {
        id: 'm6-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_JAVASCRIPT['m6-teoria'],
        perguntas: 4,
        titulo: 'O objeto que sabe fazer',
        resumo: 'Objeto e propriedade, a cópia, método e this, e a seta sem this.',
        topicos: cap('objetos'),
      },
      {
        id: 'm6-lab', tipo: 'laboratorio', linguagem: 'javascript',
        titulo: 'A unidade que se apresenta',
        resumo: 'Um objeto com propriedades e dois métodos que usam this.',
        arquivo: 'programa.js',
        projeto: 'unidades',
        verificacoes: ['objetoComMetodo', 'saidaEsperada'],
        saidaEsperada: `Falcão, com Tia Rute: 0 membros
Falcão, com Tia Rute: 3 membros
Ana, Bruno, Carla`,
        modelo: `// A unidade que se apresenta
//
// Escreva um objeto unidade com três propriedades — nome ("Falcão"),
// conselheira ("Tia Rute") e membros (começando vazio) — e dois métodos:
//
//   - adicionar(nome), que põe o nome no arranjo de membros;
//   - resumo(), que devolve o texto "Falcão, com Tia Rute: 0 membros",
//     com o número de agora.
//
// Os dois leem as propriedades pelo this. Depois: mostre o resumo, adicione
// Ana, Bruno e Carla, mostre o resumo de novo e a lista de membros:
//
//     Falcão, com Tia Rute: 0 membros
//     Falcão, com Tia Rute: 3 membros
//     Ana, Bruno, Carla
`,
      },
    ],
  },
  {
    id: 'm7',
    titulo: 'Esperar sem travar',
    resumo: 'Execução assíncrona, a promessa, async e await, e o erro que vem de longe.',
    licoes: [
      {
        id: 'm7-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_JAVASCRIPT['m7-teoria'],
        perguntas: 4,
        titulo: 'O que demora acontece depois',
        resumo: 'Assíncrono, promessa, async e await, try/catch e o await esquecido.',
        topicos: cap('assincrono'),
      },
      {
        id: 'm7-lab', tipo: 'laboratorio', linguagem: 'javascript',
        titulo: 'As inscrições chegando',
        resumo: 'Buscar no servidor com await, tratar a falha, e tentar de novo depois de esperar.',
        arquivo: 'programa.js',
        projeto: 'secretaria',
        arquivosDoProjeto: [{ nome: 'servidor.js', modelo: SERVIDOR }],
        /* O modelo abre com o engano da lição: chama o servidor sem await e
           imprime a promessa. As três tarefas de estrutura são as três peças
           do requisito 5 — esperar, tratar a falha e criar uma promessa
           própria —, e a saída é o que prova que a ordem saiu certa. */
        verificacoes: ['asyncAwait', 'trataErroDaPromessa', 'promessaPropria', 'saidaEsperada'],
        saidaEsperada: `Águia: 8 inscritos
Falcão: 6 inscritos
Tucano: Sem conexão com a unidade Tucano. Tentando de novo em 2 segundos...
Tucano: 5 inscritos
Total: 19 inscritos`,
        modelo: `// As inscrições chegando
//
// O servidor.js, aqui do lado, faz o papel da internet: buscarInscricoes
// devolve uma promessa, demora, e a unidade Tucano falha na primeira vez.
//
// Execute como está: o terminal mostra a promessa, e não o número. Depois:
//
//   1. Escreva esperar(ms), que devolve uma promessa sua, cumprida depois de
//      ms milissegundos (new Promise com setTimeout dentro).
//   2. Numa função async, busque Águia, Falcão e Tucano, nessa ordem, com
//      await, mostrando quantos inscritos cada uma tem.
//   3. Quando a busca falhar, mostre a mensagem do erro, espere 2 segundos
//      com a sua esperar, e tente de novo.
//   4. No fim, mostre o total.
//
// A saída tem de ser exatamente esta:
//
//     Águia: 8 inscritos
//     Falcão: 6 inscritos
//     Tucano: Sem conexão com a unidade Tucano. Tentando de novo em 2 segundos...
//     Tucano: 5 inscritos
//     Total: 19 inscritos

import { buscarInscricoes } from './servidor.js';

const aguia = buscarInscricoes('Águia');
console.log('Águia:', aguia);
`,
      },
    ],
  },
  {
    id: 'm8',
    titulo: 'JSON: ler e gravar',
    resumo: 'O formato que todo programa entende, e o ciclo de ler, mudar e gravar.',
    licoes: [
      {
        id: 'm8-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_JAVASCRIPT['m8-teoria'],
        perguntas: 4,
        titulo: 'Dados que sobrevivem ao programa',
        resumo: 'O que é JSON, parse e stringify, ler e gravar arquivo, e o JSON quebrado.',
        topicos: cap('json'),
      },
      {
        id: 'm8-lab', tipo: 'laboratorio', linguagem: 'javascript',
        titulo: 'A lista de inscritos, no disco',
        resumo: 'Ler o JSON do formulário, acrescentar e corrigir, e gravar de volta.',
        arquivo: 'programa.js',
        projeto: 'secretaria',
        arquivosDoProjeto: [{ nome: 'inscritos.json', modelo: INSCRITOS_DO_FORMULARIO }],
        verificacoes: ['leArquivo', 'jsonParse', 'jsonStringify', 'gravaArquivo', 'jsonEsperado', 'jsonLegivel', 'saidaEsperada'],
        jsonEsperado: {
          arquivo: 'inscritos.json',
          valor: [
            { nome: 'Ana', unidade: 'Águia', idade: 10, pagou: true },
            { nome: 'Bruno', unidade: 'Falcão', idade: 13, pagou: true },
            { nome: 'Carla', unidade: 'Pantera', idade: 12, pagou: true },
            { nome: 'Davi', unidade: 'Águia', idade: 15, pagou: true },
            { nome: 'Elisa', unidade: 'Tucano', idade: 11, pagou: false },
            { nome: 'Helena', unidade: 'Onça', idade: 12, pagou: false },
          ],
        },
        saidaEsperada: `Inscritos: 6
Pagaram: 4`,
        modelo: `// A lista de inscritos, no disco
//
// O inscritos.json, aqui do lado, é o que o formulário exportou — tudo numa
// linha só. Escreva um programa que:
//
//   1. leia o arquivo e transforme o texto em dado;
//   2. acrescente a Helena, da unidade Onça, 12 anos, que ainda não pagou
//      (mesmas propriedades dos outros: nome, unidade, idade, pagou);
//   3. marque que o Bruno pagou;
//   4. grave a lista de volta no mesmo arquivo, com recuo de 2 espaços;
//   5. mostre quantos inscritos há e quantos pagaram:
//
//     Inscritos: 6
//     Pagaram: 4
//
// Depois de executar, abra o inscritos.json na lateral: ele mostra como o
// programa deixou o arquivo.
`,
      },
    ],
  },
  {
    id: 'm9',
    titulo: 'Um programa para o terminal',
    resumo: 'Fora do navegador, dividido em funções, em um ou mais arquivos.',
    licoes: [
      {
        id: 'm9-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_JAVASCRIPT['m9-teoria'],
        perguntas: 4,
        titulo: 'O programa inteiro',
        resumo: 'O terminal e a pasta, dividir em funções, import e export, e o require.',
        topicos: cap('programa'),
      },
      {
        id: 'm9-lab', tipo: 'laboratorio', linguagem: 'javascript',
        titulo: 'O ranking da gincana',
        resumo: 'Ler a pontuação, somar por unidade, ordenar e mostrar — em três funções ou mais.',
        arquivo: 'programa.js',
        projeto: 'gincana',
        arquivosDoProjeto: [{ nome: 'pontuacao.json', modelo: PONTUACAO_DA_GINCANA }],
        /* O requisito 7 inteiro: um problema de verdade, resolvido fora do
           navegador, com três funções próprias. A saída fixa é o que dá dente
           ao laboratório — "roda" seria verdade num arquivo só de
           comentários. */
        verificacoes: ['tresFuncoes', 'leArquivo', 'jsonParse', 'saidaEsperada'],
        saidaEsperada: `Ranking da gincana
1º Falcão: 85 pontos
2º Pantera: 84 pontos
3º Águia: 80 pontos
4º Tucano: 65 pontos`,
        modelo: `// O ranking da gincana
//
// O pontuacao.json, aqui do lado, tem os pontos de cada unidade em cada
// prova. A diretoria quer o ranking: o total de cada unidade, do maior para
// o menor.
//
// Divida o problema em funções — pelo menos três, e todas chamadas: uma
// que carrega o arquivo, uma que soma por unidade, uma que mostra. Ordenar
// pode ser uma quarta, ou ficar dentro de outra.
//
// A saída tem de ser exatamente esta:
//
//     Ranking da gincana
//     1º Falcão: 85 pontos
//     2º Pantera: 84 pontos
//     3º Águia: 80 pontos
//     4º Tucano: 65 pontos
//
// Para ordenar, os arranjos têm sort, que recebe uma função de comparar:
// (a, b) => b - a põe os números do maior para o menor.
`,
      },
    ],
  },
];
