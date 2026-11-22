/*
 * A vereda CC-FE005 TypeScript.
 *
 * ── De onde ela vem ──────────────────────────────────────────────────────
 * Da CC-FE003, e só dela, como o requisito 1 diz: TypeScript é JavaScript
 * com tipos escritos, e quem não sabe JavaScript não tem o que tipar. A
 * vereda continua fora do navegador, no terminal, porque o requisito 5 pede
 * o compilador configurado e rodando — e é no terminal que ele roda.
 *
 * ── O compilador é o de verdade ──────────────────────────────────────────
 * Os exemplos da teoria e os laboratórios passam pelo `tsc` do pacote
 * `typescript`, com as mensagens em português que ele traz. Cada exemplo
 * declara o que o terminal mostra depois de `tsc && node programa.js`, e
 * `exemplosDeTypescript.test.ts` compila e roda cada um para conferir.
 *
 * ── A ordem ──────────────────────────────────────────────────────────────
 * Primeiro o porquê — tipagem estática, transpilação e os dois erros do
 * requisito 3 —, porque sem ele o resto é burocracia. Depois anotar e deixar
 * inferir, que são as duas metades da mesma decisão. Depois os três recursos
 * do requisito 4, e por fim o projeto e a conversão.
 */

import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DE_TYPESCRIPT } from './questoesDeTypescript';

const CAPITULOS: { id: string; topicos: TopicoDeVereda[] }[] = [
  {
    id: 'por-que',
    topicos: [
      {
        id: 'tipagem-estatica',
        titulo: 'Tipagem estática: o tipo dito antes de rodar',
        resumo: 'No JavaScript o tipo mora no valor; no TypeScript ele também fica escrito no código.',
        explicacao: [
          'No JavaScript, a variável aceita qualquer coisa, e o tipo só existe quando o programa roda: é a **tipagem dinâmica** da CC-FE003. Somar um número com um texto não dá erro — junta os dois e segue.',
          'Na **tipagem estática**, o tipo fica escrito no código, e um programa confere tudo **antes** de rodar. `let idade: number` diz que ali só entra número; tentar guardar um texto ali é apontado na hora, com a linha.',
          'O TypeScript é isto: o JavaScript que você já escreve, com os tipos escritos por cima. Todo programa em JavaScript é quase um programa em TypeScript — falta só dizer os tipos.',
        ],
        exemplo: `let idade: number = 12;
idade = 'doze';
console.log(idade);`,
        exemploComo: 'typescript',
        exemploSaida: `programa.ts:2:1 - error TS2322: O tipo 'string' não pode ser atribuído ao tipo 'number'.

Encontrado 1 erro.`,
        marcas: ['tipagem estática', 'tipagem dinâmica', 'number'],
      },
      {
        id: 'transpilacao',
        titulo: 'Transpilação: do TypeScript ao JavaScript',
        resumo: 'O tsc tira os tipos e devolve JavaScript, que é o que o node e o navegador rodam.',
        explicacao: [
          'Nem o Node nem o navegador entendem TypeScript. Quem roda é sempre JavaScript. O **tsc**, o compilador do TypeScript, lê o arquivo `.ts`, confere os tipos e escreve ao lado um `.js` sem nenhum tipo: é a **transpilação** — traduzir de uma linguagem para outra do mesmo nível.',
          'Por isso o caminho tem dois comandos: `tsc` gera o `programa.js`, e `node programa.js` roda o que foi gerado. Rodar o `.ts` direto no node dá erro no primeiro dois-pontos, porque para o node aquilo não é JavaScript.',
          'No laboratório, o `.js` gerado aparece na lateral, ao lado do `.ts`. Abra e compare: é o seu programa, sem os tipos.',
        ],
        exemplo: `function dobro(n: number): number {
  return n * 2;
}
console.log(dobro(21));`,
        exemploComo: 'typescript',
        exemploSaida: `42`,
        marcas: ['transpilação', 'tsc', '.js', 'compilar'],
      },
      {
        id: 'antes-de-rodar',
        titulo: 'Os erros que só apareciam rodando',
        resumo: 'Propriedade com nome errado e valor do tipo errado: o JavaScript descobre rodando, o TypeScript antes.',
        explicacao: [
          'Dois erros aparecem em todo programa em JavaScript, e os dois só se revelam quando o programa roda — às vezes semanas depois, no dia em que aquele caminho é usado.',
          'O primeiro é o **nome de propriedade errado**: `p.unidad` em vez de `p.unidade`. O JavaScript devolve `undefined`, e o programa estoura mais adiante, quando tenta usar o que não veio — "Cannot read properties of undefined".',
          'O segundo é o **valor do tipo errado**: a idade que chega do formulário como texto, "13", e a soma que vira "2313". Esse nem estoura: escreve um número plausível e errado.',
          'Com os tipos escritos, o compilador aponta os dois **antes de rodar**, com o arquivo e a linha. É o requisito 3, e o primeiro laboratório mostra os dois acontecendo.',
        ],
        exemplo: `interface Inscrito {
  nome: string;
  unidade: string;
}
const ana: Inscrito = { nome: 'Ana', unidade: 'Ipê' };
console.log(ana.unidad);`,
        exemploComo: 'typescript',
        exemploSaida: `programa.ts:6:17 - error TS2551: A propriedade 'unidad' não existe no tipo 'Inscrito'. Você quis dizer 'unidade'?

Encontrado 1 erro.`,
        marcas: ['erro em execução', 'erro de compilação', 'undefined'],
      },
      {
        id: 'avisa-nao-impede',
        titulo: 'O compilador avisa, e não impede',
        resumo: 'Com erro de tipo, o tsc gera o .js mesmo assim — a não ser que o projeto diga o contrário.',
        explicacao: [
          'Uma surpresa de quem começa: com erro de tipo, o `tsc` aponta o erro **e gera o `.js` mesmo assim**. Se alguém rodar esse `.js`, o erro acontece de verdade.',
          'É por isso que se escreve `tsc && node programa.js`: o `&&` só roda o segundo comando se o primeiro terminou sem erro, e o `tsc` termina com erro quando aponta algum.',
          'O projeto pode ir além e mandar o compilador não gerar nada quando houver erro — a opção `noEmitOnError`, que o módulo do projeto liga.',
        ],
        marcas: ['&&', 'noEmitOnError'],
      },
    ],
  },
  {
    id: 'anotar',
    topicos: [
      {
        id: 'anotacao',
        titulo: 'Anotar: dois-pontos e o tipo',
        resumo: 'nome: tipo, na variável e no parâmetro.',
        explicacao: [
          'A **anotação de tipo** vem depois do nome, com dois-pontos: `let total: number`, `const nome: string`, `let pagou: boolean`. Os três tipos mais comuns são esses: número, texto e verdadeiro-ou-falso.',
          'Lista é o tipo do que vai dentro com colchetes depois: `string[]` é uma lista de textos, `number[]` é uma lista de números.',
          'Uma vez anotada, a variável só aceita aquele tipo. Tentar pôr outro é erro de compilação, apontado antes de rodar.',
        ],
        exemplo: `const nomes: string[] = ['Ana', 'Bia'];
nomes.push(12);
console.log(nomes);`,
        exemploComo: 'typescript',
        exemploSaida: `programa.ts:2:12 - error TS2345: O argumento do tipo 'number' não é atribuível ao parâmetro do tipo 'string'.

Encontrado 1 erro.`,
        marcas: ['anotação', 'string', 'number', 'boolean', 'string[]'],
      },
      {
        id: 'parametros',
        titulo: 'Parâmetros e retorno',
        resumo: 'O tipo de cada parâmetro, e o que a função devolve depois dos parênteses.',
        explicacao: [
          'Cada parâmetro leva o seu tipo: `function taxa(dias: number)`. E o que a função devolve vem depois dos parênteses: `function taxa(dias: number): number`. Função que não devolve nada devolve `void`.',
          'Com o tipo do parâmetro escrito, quem chama a função errado é avisado na linha da chamada — e não lá dentro, onde o valor errado faria estrago.',
        ],
        exemplo: `function taxa(dias: number): number {
  return 45 * dias;
}
console.log(taxa('3'));`,
        exemploComo: 'typescript',
        exemploSaida: `programa.ts:4:18 - error TS2345: O argumento do tipo 'string' não é atribuível ao parâmetro do tipo 'number'.

Encontrado 1 erro.`,
        marcas: ['parâmetro', 'retorno', 'void'],
      },
      {
        id: 'any-implicito',
        titulo: 'O any, e por que o modo estrito o recusa',
        resumo: 'Sem tipo e sem de onde tirar, o parâmetro vira any — e any desliga a conferência.',
        explicacao: [
          '`any` quer dizer "qualquer coisa", e é a ausência de conferência: com ele, o compilador aceita tudo e não aponta nada. Um parâmetro sem tipo vira `any` sozinho — é o **any implícito**.',
          'O **modo estrito** (`"strict": true` no tsconfig) recusa o any implícito: cada parâmetro sem tipo vira um erro, "implicitamente tem um tipo any". Não é implicância — é o compilador dizendo que ali ele não está conferindo nada.',
          'Os projetos desta vereda já vêm com o modo estrito ligado, como deveriam vir todos.',
        ],
        exemplo: `function dobro(n) {
  return n * 2;
}
console.log(dobro(4));`,
        exemploComo: 'typescript',
        exemploSaida: `programa.ts:1:16 - error TS7006: O parâmetro 'n' implicitamente tem um tipo 'any'.

Encontrado 1 erro.`,
        marcas: ['any', 'modo estrito', 'strict'],
      },
      {
        id: 'lista-vazia',
        titulo: 'A lista que começa vazia',
        resumo: 'O compilador não sabe o que vai entrar numa lista vazia; diga você.',
        explicacao: [
          '`const inscritos = []` não diz ao compilador o que vai entrar ali. Ele não tem de onde tirar, e no modo estrito isso vira erro mais adiante, onde a lista é usada.',
          'A saída é anotar: `const inscritos: string[] = []`. É um dos poucos lugares em que uma variável com valor inicial precisa de tipo escrito.',
        ],
        marcas: ['lista vazia', '[]'],
      },
    ],
  },
  {
    id: 'inferencia',
    topicos: [
      {
        id: 'inferir',
        titulo: 'Inferência: o tipo que o compilador descobre',
        resumo: 'Do valor inicial, o compilador tira o tipo sozinho.',
        explicacao: [
          '**Inferência de tipo** é o compilador descobrir o tipo sozinho, olhando o valor. `const diaria = 45` já é `number`, sem ninguém escrever: o 45 diz. E daí em diante ela é conferida como qualquer variável anotada.',
          'No editor do clube, passar o mouse em cima do nome mostra o tipo que o compilador inferiu. É a melhor forma de aprender o que ele sabe sozinho.',
        ],
        exemplo: `let diaria = 45;
diaria = 'quarenta e cinco';
console.log(diaria);`,
        exemploComo: 'typescript',
        exemploSaida: `programa.ts:2:1 - error TS2322: O tipo 'string' não pode ser atribuído ao tipo 'number'.

Encontrado 1 erro.`,
        marcas: ['inferência', 'tipo inferido'],
      },
      {
        id: 'onde-anotar',
        titulo: 'Onde escrever o tipo, e onde deixar',
        resumo: 'Anote o que o compilador não tem de onde tirar; o resto, deixe inferir.',
        explicacao: [
          'A regra prática: **anote onde o compilador não tem de onde tirar** — os parâmetros das funções, a lista que começa vazia, e o que vem de fora, como um arquivo lido. **Deixe inferir** onde o valor já diz o tipo.',
          '`const nome: string = \'Ana\'` diz duas vezes a mesma coisa. E a cópia envelhece: alguém muda o valor, esquece o tipo ao lado, e o erro que aparece é de uma anotação que ninguém precisava ter escrito.',
        ],
        exemplo: `const unidade = 'Ipê';
const pontos = [72, 38, 61];
const total = pontos.reduce((soma, p) => soma + p, 0);
console.log(unidade, total);`,
        exemploComo: 'typescript',
        exemploSaida: `Ipê 171`,
        marcas: ['inferência', 'anotação redundante'],
      },
      {
        id: 'retorno-inferido',
        titulo: 'O retorno também se infere',
        resumo: 'O compilador sabe o que a função devolve — mas escrever ajuda quem lê.',
        explicacao: [
          'O tipo do retorno também é inferido do `return`. `function dobro(n: number) { return n * 2; }` devolve `number`, e o compilador sabe.',
          'Mesmo assim, muitos projetos escrevem o retorno das funções: ele é a promessa da função a quem a chama, e escrito ele é conferido — se alguém mudar o `return` por engano, o erro aparece na função, e não em quem a usa.',
        ],
        marcas: ['retorno', 'inferência'],
      },
      {
        id: 'contexto',
        titulo: 'O tipo que vem de quem chama',
        resumo: 'Na função passada para map ou filter, o parâmetro recebe o tipo da lista.',
        explicacao: [
          'Em `pontos.map(p => p * 2)`, o `p` não precisa de tipo: o compilador sabe que `pontos` é `number[]`, então cada `p` é `number`. É a **inferência pelo contexto**.',
          'É por isso que os parâmetros das funções passadas para `map`, `filter`, `forEach` e `sort` quase nunca levam tipo escrito, e os das funções declaradas com nome sempre levam.',
        ],
        exemplo: `const nomes = ['ana', 'bia'];
const grandes = nomes.map(n => n.toUpperCase());
console.log(grandes.join(', '));`,
        exemploComo: 'typescript',
        exemploSaida: `ANA, BIA`,
        marcas: ['contexto', 'map', 'callback'],
      },
    ],
  },
  {
    id: 'interface',
    topicos: [
      {
        id: 'interface',
        titulo: 'Interface: o formato de um objeto',
        resumo: 'Quais propriedades o objeto tem, e de que tipo cada uma é.',
        explicacao: [
          'Uma **interface** descreve o formato de um objeto: os nomes das propriedades e o tipo de cada uma. `interface Membro { nome: string; idade: number; unidade: string; }` diz como todo membro é.',
          'Ela não cria nada e não existe no `.js` gerado: é só a descrição que o compilador usa para conferir. Some na transpilação.',
        ],
        exemplo: `interface Membro {
  nome: string;
  idade: number;
}
const ana: Membro = { nome: 'Ana', idade: 12 };
console.log(\`\${ana.nome} tem \${ana.idade} anos\`);`,
        exemploComo: 'typescript',
        exemploSaida: `Ana tem 12 anos`,
        marcas: ['interface', 'objeto', 'propriedade'],
      },
      {
        id: 'conferir-objeto',
        titulo: 'O que a interface confere',
        resumo: 'Propriedade que falta, que sobra, ou que tem o nome errado.',
        explicacao: [
          'Com o objeto anotado pela interface, o compilador confere três coisas: se **falta** alguma propriedade obrigatória, se **sobra** alguma que a interface não tem, e se alguma foi **lida com o nome errado**.',
          'O terceiro caso é o que mais salva: em JavaScript, `m.unidde` devolve `undefined` em silêncio; em TypeScript, é erro, e o compilador ainda sugere o nome certo.',
        ],
        exemplo: `interface Membro {
  nome: string;
  unidade: string;
}
const bruno: Membro = { nome: 'Bruno' };
console.log(bruno.nome);`,
        exemploComo: 'typescript',
        exemploSaida: `programa.ts:5:7 - error TS2741: A propriedade 'unidade' está ausente no tipo '{ nome: string; }', mas é obrigatória no tipo 'Membro'.

Encontrado 1 erro.`,
        marcas: ['propriedade obrigatória', 'erro de digitação'],
      },
      {
        id: 'interface-em-uso',
        titulo: 'A interface em toda parte',
        resumo: 'Na lista, no parâmetro e no retorno: o mesmo nome, uma definição só.',
        explicacao: [
          'Escrita uma vez, a interface vira um tipo como `string`: `Membro[]` é uma lista de membros, `function apresentar(m: Membro)` recebe um membro, `function maisVelho(): Membro` devolve um.',
          'É uma definição só para o programa inteiro. Se um dia o membro ganhar um telefone, muda-se a interface — e o compilador aponta todo lugar que precisa acompanhar.',
        ],
        marcas: ['Membro[]', 'parâmetro', 'reuso'],
      },
    ],
  },
  {
    id: 'uniao',
    topicos: [
      {
        id: 'uniao',
        titulo: 'Tipo de união: um ou outro',
        resumo: 'A barra vertical junta tipos: string | number aceita os dois.',
        explicacao: [
          'O **tipo de união** diz que o valor pode ser de um tipo **ou** de outro, separados por uma barra vertical: `string | number` aceita texto ou número.',
          'O uso mais útil é com valores fixos: `type Cargo = \'diretor\' | \'conselheira\' | \'desbravador\'` aceita só essas três palavras. "Diretor" com maiúscula, ou "diretora", vira erro de compilação — que é o que se quer de um campo que só tem três respostas certas.',
        ],
        exemplo: `type Cargo = 'diretor' | 'conselheira' | 'desbravador';
const cargo: Cargo = 'Diretor';
console.log(cargo);`,
        exemploComo: 'typescript',
        exemploSaida: `programa.ts:2:7 - error TS2820: O tipo '"Diretor"' não pode ser atribuído ao tipo 'Cargo'. Você quis dizer '"diretor"'?

Encontrado 1 erro.`,
        marcas: ['união', '|', 'type', 'literal'],
      },
      {
        id: 'opcional',
        titulo: 'Propriedade opcional',
        resumo: 'Um ponto de interrogação diz que a propriedade pode faltar.',
        explicacao: [
          'Nem todo membro tem telefone. `telefone?: string` — com o ponto de interrogação — diz que a propriedade é **opcional**: o objeto pode vir sem ela.',
          'Por dentro, o tipo dela passa a ser `string | undefined`: uma união com o "nada". E é aí que o compilador ajuda de verdade.',
        ],
        exemplo: `interface Pessoa {
  nome: string;
  telefone?: string;
}
const davi: Pessoa = { nome: 'Davi' };
console.log(davi.telefone);`,
        exemploComo: 'typescript',
        exemploSaida: `undefined`,
        marcas: ['opcional', '?', 'undefined'],
      },
      {
        id: 'estreitar',
        titulo: 'Perguntar antes de usar',
        resumo: 'O que pode ser undefined precisa de um if antes; depois dele, o compilador sabe.',
        explicacao: [
          'Usar direto uma propriedade opcional — `p.telefone.replace(...)` — é erro: ela pode não estar lá, e o compilador diz "possivelmente undefined". É o erro que, em JavaScript, só apareceria no dia em que alguém sem telefone fosse listado.',
          'A saída é perguntar antes: `if (p.telefone === undefined) return \'sem telefone\'`. Depois desse `if`, o compilador sabe que ali o telefone existe — é o **estreitamento**. O `?.` e o `??` fazem o mesmo numa linha só.',
          'Há dois atalhos que fazem o erro sumir sem resolver nada: o `!` no fim (`p.telefone!`) e o `as string`. Os dois dizem ao compilador "confie em mim" — e quem não tem telefone continua estourando ao rodar.',
        ],
        exemplo: `interface Pessoa {
  nome: string;
  telefone?: string;
}
function contato(p: Pessoa): string {
  if (p.telefone === undefined) return \`\${p.nome}: sem telefone\`;
  return \`\${p.nome}: \${p.telefone}\`;
}
console.log(contato({ nome: 'Davi' }));`,
        exemploComo: 'typescript',
        exemploSaida: `Davi: sem telefone`,
        marcas: ['estreitamento', '?.', '??', '!'],
      },
    ],
  },
  {
    id: 'generico',
    topicos: [
      {
        id: 'o-problema',
        titulo: 'Uma função para todo tipo',
        resumo: 'Sem genérico, ou se repete a função, ou se usa any.',
        explicacao: [
          'Uma função que devolve o primeiro de uma lista serve para lista de números, de textos, de membros. Sem um jeito de dizer isso, sobram duas saídas ruins: escrever uma função para cada tipo, ou aceitar `any[]` e devolver `any`.',
          'A segunda é pior do que parece: o `any` que sai da função se espalha, e tudo que usa o resultado fica sem conferência.',
        ],
        marcas: ['repetição', 'any'],
      },
      {
        id: 'generico',
        titulo: 'Tipo genérico: o tipo como parâmetro',
        resumo: 'function primeiro<T>(lista: T[]): T — o T é o tipo da lista que chegar.',
        explicacao: [
          'Um **tipo genérico** é um tipo que vira parâmetro. `function primeiro<T>(lista: T[]): T | undefined` diz: "seja qual for o tipo da lista, chame-o de T; o que eu devolvo é desse mesmo tipo, ou nada".',
          'Chamada com `[72, 55]`, o T vira `number`; com `[\'Ana\']`, vira `string`. O compilador descobre sozinho, pela lista passada, e confere o resultado como se a função tivesse sido escrita só para aquele tipo.',
        ],
        exemplo: `function primeiro<T>(lista: T[]): T | undefined {
  return lista[0];
}
const nota = primeiro([72, 55]);
const nome = primeiro(['Ana', 'Bia']);
console.log(nota, nome);`,
        exemploComo: 'typescript',
        exemploSaida: `72 Ana`,
        marcas: ['genérico', '<T>', 'parâmetro de tipo'],
      },
      {
        id: 'generico-confere',
        titulo: 'O genérico continua conferindo',
        resumo: 'Com any, o erro passa; com T, ele é apontado.',
        explicacao: [
          'A diferença para o `any` aparece no uso. Se o primeiro de uma lista de números for usado como texto — `primeiro(pontos).toUpperCase()` —, o genérico aponta o erro, porque sabe que ali é `number`. Com `any`, compila sem um aviso e estoura ao rodar.',
          'Os genéricos já estavam em todo lugar: `string[]` é o mesmo que `Array<string>`, e `Record<string, number>` é um objeto de chaves texto e valores número — os dois são tipos genéricos prontos da linguagem.',
        ],
        exemplo: `function primeiro<T>(lista: T[]): T | undefined {
  return lista[0];
}
const pontos = [72, 55];
console.log(primeiro(pontos)?.toUpperCase());`,
        exemploComo: 'typescript',
        exemploSaida: `programa.ts:5:31 - error TS2339: A propriedade 'toUpperCase' não existe no tipo 'number'.

Encontrado 1 erro.`,
        marcas: ['Array<T>', 'Record', 'any'],
      },
    ],
  },
  {
    id: 'projeto',
    topicos: [
      {
        id: 'tsconfig',
        titulo: 'O tsconfig.json: o projeto',
        resumo: 'O arquivo que diz ao tsc o que compilar e com que regras.',
        explicacao: [
          'Uma pasta vira projeto de TypeScript quando tem um **tsconfig.json**. É nele que ficam as regras: a versão de JavaScript que sai (`target`), se o modo estrito vale (`strict`), para onde vai o que se gera (`outDir`).',
          'Sem ele, o `tsc` sozinho não compila nada: mostra a ajuda. Com ele, `tsc` compila todos os `.ts` da pasta com aquelas regras.',
          'O jeito de criar é `tsc --init`, que escreve um tsconfig com as opções recomendadas e as outras comentadas, para você ler e ligar.',
        ],
        marcas: ['tsconfig.json', 'tsc --init', 'compilerOptions'],
      },
      {
        id: 'opcoes',
        titulo: 'As opções que mais importam',
        resumo: 'strict, outDir e noEmitOnError.',
        explicacao: [
          '`"strict": true` liga o modo estrito: any implícito vira erro, e `undefined` passa a ser conferido. É a opção que faz o TypeScript valer a pena, e o `tsc --init` já a deixa ligada.',
          '`"outDir": "./dist"` manda o que se gera para a pasta `dist`, separado do que se escreve — e aí roda-se `node dist/programa.js`.',
          '`"noEmitOnError": true` faz o erro **segurar** a saída: se o compilador achar erro, não gera arquivo nenhum, e não há o que rodar. É o "erro apontado antes da execução" levado até o fim.',
        ],
        marcas: ['strict', 'outDir', 'noEmitOnError', 'dist'],
      },
      {
        id: 'comentario-no-json',
        titulo: 'Ligar uma opção comentada',
        resumo: 'O tsconfig aceita comentário; tirar as duas barras liga a linha.',
        explicacao: [
          'O tsconfig gerado pelo `tsc --init` tem dezenas de linhas começando com `//`: são opções desligadas, comentadas, para você conhecer. Tirar as duas barras liga a opção.',
          'Cuidado com a vírgula: entre uma opção e a seguinte vai vírgula, e a última da lista não leva. Um tsconfig com erro de vírgula faz o tsc reclamar do arquivo antes de olhar para o programa.',
        ],
        marcas: ['comentário', '//', 'vírgula'],
      },
      {
        id: 'arquivo-na-linha',
        titulo: 'tsc com o nome do arquivo ignora o projeto',
        resumo: 'tsc programa.ts compila só aquele arquivo, com as opções de fábrica.',
        explicacao: [
          'Uma armadilha: `tsc programa.ts`, com o nome do arquivo, **ignora o tsconfig** e compila com as opções de fábrica — sem modo estrito. O mesmo programa que reprova com `tsc` passa limpo com `tsc programa.ts`.',
          'Num projeto configurado, rode `tsc` sozinho.',
        ],
        marcas: ['tsc programa.ts', 'opções de fábrica'],
      },
    ],
  },
  {
    id: 'converter',
    topicos: [
      {
        id: 'renomear',
        titulo: 'Converter começa por renomear',
        resumo: 'Troque .js por .ts e leia o que o compilador aponta.',
        explicacao: [
          'Converter um programa de JavaScript para TypeScript começa por trocar a extensão, de `.js` para `.ts`, num projeto com o modo estrito ligado. O programa é o mesmo — e o compilador passa a apontar tudo o que ele deixava sem dizer.',
          'A lista costuma ser longa no começo, e quase tudo é o mesmo erro: parâmetro sem tipo. Vá de cima para baixo, um erro por vez, compilando de novo.',
        ],
        marcas: ['converter', '.js', '.ts'],
      },
      {
        id: 'dado-de-fora',
        titulo: 'O dado que vem de fora',
        resumo: 'JSON.parse devolve any: diga o formato com uma interface.',
        explicacao: [
          '`JSON.parse` não sabe o que tem no arquivo, e devolve `any`. Tudo o que sai dele fica sem conferência, e um nome de campo errado passa.',
          'A saída é descrever o formato com uma interface e dizer o tipo de quem carrega: `function carregar(arquivo: string): Registro[]`. A partir dali, cada campo é conferido.',
        ],
        exemplo: `interface Registro {
  unidade: string;
  pontos: number;
}
function ler(texto: string): Registro[] {
  return JSON.parse(texto);
}
const registros = ler('[{"unidade": "Ipê", "pontos": 18}]');
console.log(registros[0].unidade, registros[0].pontos);`,
        exemploComo: 'typescript',
        exemploSaida: `Ipê 18`,
        marcas: ['JSON.parse', 'any', 'interface'],
      },
      {
        id: 'objeto-dicionario',
        titulo: 'O objeto que guarda totais',
        resumo: 'const totais = {} não aceita chave nenhuma; Record<string, number> aceita.',
        explicacao: [
          'Um objeto que começa vazio e vai ganhando chaves — os totais por unidade — reprova no modo estrito: para o compilador, `{}` não tem chave nenhuma, e `totais[\'Ipê\']` não existe.',
          'O tipo certo é `Record<string, number>`: um objeto com chaves de texto e valores número. `const totais: Record<string, number> = {}` resolve.',
        ],
        exemplo: `const totais: Record<string, number> = {};
totais['Ipê'] = (totais['Ipê'] ?? 0) + 18;
totais['Ipê'] = (totais['Ipê'] ?? 0) + 25;
console.log(totais);`,
        exemploComo: 'typescript',
        exemploSaida: `{ 'Ipê': 43 }`,
        marcas: ['Record', 'objeto', 'chave'],
      },
      {
        id: 'nao-calar',
        titulo: 'Eliminar o erro, e não calar o compilador',
        resumo: 'any, as e @ts-ignore fazem o erro sumir sem resolver nada.',
        explicacao: [
          'O requisito 6 pede **eliminar** os erros de tipagem. Há três jeitos de fazer o erro sumir sem eliminar nada: escrever `any`, forçar com `as`, e pôr `// @ts-ignore` na linha de cima.',
          'Os três calam o compilador. O erro continua lá, só não é mais apontado — e o programa convertido fica tão sem conferência quanto o original, com cara de conferido. Eliminar é dar o tipo certo.',
        ],
        marcas: ['@ts-ignore', 'as', 'any'],
      },
    ],
  },
];

const cap = (id: string) => CAPITULOS.find(c => c.id === id)!.topicos;

export const MODULOS_DE_TYPESCRIPT: ModuloDeVereda[] = [
  {
    id: 'm1', titulo: 'Por que tipos',
    resumo: 'Tipagem estática, transpilação, e os dois erros que o JavaScript só revela rodando.',
    licoes: [
      { id: 'm1-teoria', tipo: 'teoria', questoes: QUESTOES_DE_TYPESCRIPT['m1-teoria'], perguntas: 4,
        titulo: 'O tipo dito antes de rodar', resumo: 'O que muda do JavaScript, o tsc, e o que ele aponta antes.', topicos: cap('por-que') },
      { id: 'm1-lab', tipo: 'typescript', licao: 'dois-erros',
        titulo: 'A inscrição que estourava', resumo: 'Ver a versão em JavaScript estourar, e o compilador apontar os dois erros antes.',
        verificacoes: ['viu-estourar', 'viu-apontar', 'saida'] },
    ],
  },
  {
    id: 'm2', titulo: 'Anotar tipos',
    resumo: 'Variáveis, parâmetros e retorno — e o any que o modo estrito recusa.',
    licoes: [
      { id: 'm2-teoria', tipo: 'teoria', questoes: QUESTOES_DE_TYPESCRIPT['m2-teoria'], perguntas: 4,
        titulo: 'Dois-pontos e o tipo', resumo: 'A anotação, os parâmetros, o any implícito e a lista vazia.', topicos: cap('anotar') },
      { id: 'm2-lab', tipo: 'typescript', licao: 'anotar',
        titulo: 'A taxa do acampamento, com tipos', resumo: 'Dar tipo a cada parâmetro, a cada retorno e à lista que começa vazia.',
        verificacoes: ['parametros', 'retornos', 'lista-vazia', 'saida'] },
    ],
  },
  {
    id: 'm3', titulo: 'Inferência',
    resumo: 'O tipo que o compilador descobre sozinho, e onde ainda é preciso escrever.',
    licoes: [
      { id: 'm3-teoria', tipo: 'teoria', questoes: QUESTOES_DE_TYPESCRIPT['m3-teoria'], perguntas: 4,
        titulo: 'O que o compilador já sabe', resumo: 'Inferir do valor, do retorno e do contexto.', topicos: cap('inferencia') },
      { id: 'm3-lab', tipo: 'typescript', licao: 'inferencia',
        titulo: 'A média sem tipo repetido', resumo: 'Tirar o tipo onde o valor já diz, e deixar onde o compilador não tem de onde tirar.',
        verificacoes: ['sem-repeticao', 'saida'] },
    ],
  },
  {
    id: 'm4', titulo: 'Interfaces',
    resumo: 'O formato de um objeto, escrito uma vez e conferido em toda parte.',
    licoes: [
      { id: 'm4-teoria', tipo: 'teoria', questoes: QUESTOES_DE_TYPESCRIPT['m4-teoria'], perguntas: 4,
        titulo: 'O formato de um objeto', resumo: 'A interface, o que ela confere, e o seu uso no programa inteiro.', topicos: cap('interface') },
      { id: 'm4-lab', tipo: 'typescript', licao: 'interface',
        titulo: 'A apresentação dos membros', resumo: 'Escrever a interface Membro e deixar o compilador achar o nome errado.',
        verificacoes: ['interface', 'usa-interface', 'saida'] },
    ],
  },
  {
    id: 'm5', titulo: 'União e opcional',
    resumo: 'Um tipo ou outro, a propriedade que pode faltar, e perguntar antes de usar.',
    licoes: [
      { id: 'm5-teoria', tipo: 'teoria', questoes: QUESTOES_DE_TYPESCRIPT['m5-teoria'], perguntas: 4,
        titulo: 'Um ou outro, e o que pode faltar', resumo: 'O tipo de união, a propriedade opcional e o estreitamento.', topicos: cap('uniao') },
      { id: 'm5-lab', tipo: 'typescript', licao: 'uniao',
        titulo: 'Os contatos da equipe', resumo: 'Um cargo que só aceita três palavras, e o telefone que pode faltar.',
        verificacoes: ['cargo', 'opcional', 'trata-a-falta', 'saida'] },
    ],
  },
  {
    id: 'm6', titulo: 'Genéricos',
    resumo: 'Uma função para todo tipo, sem perder a conferência.',
    licoes: [
      { id: 'm6-teoria', tipo: 'teoria', questoes: QUESTOES_DE_TYPESCRIPT['m6-teoria'], perguntas: 4,
        titulo: 'O tipo como parâmetro', resumo: 'O problema da repetição, o <T>, e por que ele é melhor que any.', topicos: cap('generico') },
      { id: 'm6-lab', tipo: 'typescript', licao: 'generico',
        titulo: 'O primeiro da fila', resumo: 'Trocar três funções e um any por uma genérica só.',
        verificacoes: ['generica', 'uma-so', 'sem-any', 'saida'] },
    ],
  },
  {
    id: 'm7', titulo: 'O projeto e o compilador',
    resumo: 'O tsconfig, as opções que importam, e o erro segurando a saída.',
    licoes: [
      { id: 'm7-teoria', tipo: 'teoria', questoes: QUESTOES_DE_TYPESCRIPT['m7-teoria'], perguntas: 4,
        titulo: 'Configurar o projeto', resumo: 'tsc --init, strict, outDir, noEmitOnError, e a armadilha do nome na linha.', topicos: cap('projeto') },
      { id: 'm7-lab', tipo: 'typescript', licao: 'projeto',
        titulo: 'As vagas do campori', resumo: 'Criar o projeto, ligar as opções e ver o erro segurar a saída.',
        verificacoes: ['tsconfig', 'opcoes', 'segurou', 'saida'] },
    ],
  },
  {
    id: 'm8', titulo: 'Converter um programa',
    resumo: 'O programa da CC-FE003 em TypeScript, sem erro de tipo e sem calar o compilador.',
    licoes: [
      { id: 'm8-teoria', tipo: 'teoria', questoes: QUESTOES_DE_TYPESCRIPT['m8-teoria'], perguntas: 4,
        titulo: 'Do .js ao .ts', resumo: 'Renomear, tipar o que vem de fora e o objeto de totais, e não calar o compilador.', topicos: cap('converter') },
      { id: 'm8-lab', tipo: 'typescript', licao: 'converter',
        titulo: 'O ranking da gincana, em TypeScript', resumo: 'Converter o programa da CC-FE003 até não sobrar nenhum erro de tipo.',
        verificacoes: ['registro', 'sem-calar', 'saida'] },
    ],
  },
];
