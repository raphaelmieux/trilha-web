/**
 * O passo a passo de cada verificação de JavaScript.
 *
 * Pela regra do de Python: o que se escreve aqui é o caminho, e nunca a
 * resposta. Dizer onde o `reduce` recebe o valor inicial ensina; escrever o
 * `reduce` inteiro resolve o laboratório pela pessoa.
 */
export const PASSOS_DE_JAVASCRIPT: Record<string, string[]> = {
  roda: [
    'Clique em Executar e leia o terminal, de baixo para cima.',
    'A última linha diz o tipo do erro: ReferenceError é nome que não existe, TypeError é usar um valor do jeito errado, SyntaxError é o arquivo que não se lê.',
    'A primeira linha diz o arquivo e a linha; embaixo vem o seu código, com uma seta no lugar.',
    'Erro de sintaxe aparece antes de qualquer linha rodar. Os outros aparecem no meio, depois do que já foi escrito.',
  ],
  saidaEsperada: [
    'Compare o terminal com o enunciado, linha por linha.',
    'Confira a ordem: com setTimeout e await, o que se escreve primeiro no arquivo nem sempre sai primeiro.',
    'Confira o texto exato: maiúsculas, acentos, dois-pontos e o espaço entre as palavras.',
    'Se um número saiu diferente, o problema costuma estar na conta, e não no console.log.',
  ],
  saidaContem: [
    'Leia no enunciado quais frases precisam aparecer.',
    'Procure cada uma no terminal, escrita igual.',
    'Se uma faltou, ache o console.log que devia escrevê-la e confira se o programa passa por ele.',
  ],
  jsonEsperado: [
    'Depois de executar, abra o arquivo JSON na lateral: ele mostra como a pasta ficou.',
    'Se ele não mudou, o programa não gravou — falta o writeFileSync.',
    'Se ele mudou e está errado, compare com o enunciado o que foi acrescentado e o que foi alterado.',
    'Lembre que o arquivo volta ao original a cada execução: o programa precisa fazer tudo de uma vez.',
  ],
  jsonLegivel: [
    'Abra o arquivo gravado na lateral.',
    'Se ele está numa linha só, o JSON.stringify recebeu só o objeto.',
    'O terceiro argumento do JSON.stringify diz quantos espaços usar no recuo; o segundo pode ser null.',
  ],
  semVar: [
    'Procure cada var no programa.',
    'Se o valor nunca muda depois de criado, troque por const.',
    'Se ele muda — um contador, um total —, troque por let.',
    'Execute de novo: o programa pode passar a acusar um erro que o var escondia, e é bom que acuse.',
  ],
  letEConst: [
    'Olhe cada variável e pergunte: ela recebe outro valor depois de criada?',
    'Se não recebe, é const. Se recebe — com =, +=, ++ —, é let.',
    'O laboratório pede as duas: um const que nunca muda e um let que muda.',
  ],
  igualdadeEstrita: [
    'Procure cada == e != no programa.',
    'Troque por === e !==: eles comparam sem converter o tipo antes.',
    'Se uma comparação deixar de funcionar, os dois lados eram de tipos diferentes — e é isso que o == escondia.',
  ],
  seSenao: [
    'O if decide pela condição entre parênteses; o bloco entre chaves é o que roda quando ela vale.',
    'Depois do bloco, o else abre o caminho de quando ela não vale.',
    'Para mais de duas saídas, else if encadeia outra pergunta — e o último else pega o que sobrou.',
  ],
  laco: [
    'Para passar por cada item de um arranjo, for (const item of arranjo) { ... } é o mais direto.',
    'Para contar, for (let i = 0; i < n; i++) { ... }.',
    'O que fica entre as chaves é o que se repete: confira se o console.log está dentro delas.',
  ],
  funcaoNomeada: [
    'Escreva function, o nome, os parâmetros entre parênteses e o corpo entre chaves.',
    'Dentro, return devolve o resultado para quem chamou.',
    'Depois, chame a função pelo nome, com os valores entre parênteses — escrever não é rodar.',
  ],
  funcaoDeSeta: [
    'Escreva const, o nome, =, os parâmetros entre parênteses, => e o que a função devolve.',
    'Com uma expressão só depois da seta, ela devolve essa expressão sem precisar de return.',
    'Com chaves depois da seta, o return volta a ser obrigatório.',
    'Depois, chame a função pelo nome, com os valores entre parênteses.',
  ],
  usaMap: [
    'map passa cada item por uma função e junta os resultados num arranjo novo.',
    'A função recebe o item e devolve o que ele vira.',
    'O arranjo original continua como estava.',
  ],
  usaFilter: [
    'filter passa cada item por uma função que responde true ou false.',
    'Ficam no arranjo novo só os itens em que ela respondeu true.',
  ],
  usaReduce: [
    'reduce junta o arranjo inteiro num valor só — um total, uma contagem.',
    'A função recebe o acumulado até agora e o item da vez, e devolve o acumulado novo.',
    'Depois da função, separado por vírgula, vem o valor de onde a conta começa: 0 para uma soma.',
  ],
  objetoComMetodo: [
    'O objeto é escrito entre chaves, com nome: valor separados por vírgula.',
    'O método é uma função dentro dele, escrita como nome() { ... }.',
    'Dentro do método, this é o próprio objeto: this.membros lê a propriedade membros.',
    'Uma função de seta não tem this próprio — escrita como método, ela lê o this de fora.',
    'Depois, chame o método: objeto.nome().',
  ],
  promessaPropria: [
    'new Promise recebe uma função, e essa função recebe resolve.',
    'Dentro dela, comece a coisa demorada — um setTimeout, por exemplo.',
    'Quando a coisa terminar, chame resolve com o resultado: é isso que acorda quem está esperando.',
  ],
  asyncAwait: [
    'Escreva async antes de function, ou antes dos parênteses de uma seta.',
    'Dentro dela, await antes de uma promessa espera o resultado sem travar o resto.',
    'Lembre de chamar a função async — escrever não é rodar.',
  ],
  trataErroDaPromessa: [
    'Ponha o await dentro de um try { ... }.',
    'Logo depois, catch (erro) { ... } recebe o que deu errado.',
    'Dentro do catch, faça alguma coisa: escrever erro.message no terminal já é tratar.',
  ],
  leArquivo: [
    'No topo, traga o fs: import { readFileSync } from "node:fs".',
    'readFileSync("nome.json", "utf8") devolve o texto do arquivo.',
    'Sem o "utf8", ele devolve bytes, e o terminal mostra <Buffer ...>.',
  ],
  gravaArquivo: [
    'writeFileSync("nome.json", texto) grava o texto no arquivo, substituindo o que havia.',
    'O que se grava precisa ser texto: um objeto direto dá TypeError.',
  ],
  jsonParse: [
    'O que o readFileSync devolve é texto, mesmo que pareça um objeto.',
    'JSON.parse(texto) transforma o texto em objetos e arranjos de verdade.',
  ],
  jsonStringify: [
    'Para gravar, o objeto precisa virar texto de novo.',
    'JSON.stringify(objeto) faz isso.',
  ],
  tresFuncoes: [
    'Divida o problema em partes: ler os dados, calcular, mostrar o resultado.',
    'Cada parte vira uma função com nome, que recebe o que precisa e devolve o que produz.',
    'Confira que cada uma é chamada em algum lugar: função escrita e nunca chamada não roda.',
  ],
};
