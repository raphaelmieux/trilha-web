import type { Question } from '../types';

/*
 * As questões das lições de teoria da CC-FE005 TypeScript.
 *
 * ── O que elas medem ──────────────────────────────────────────────────────
 * A definição vale uma vez; depois vêm consequência, discriminação e
 * diagnóstico. Nesta vereda o diagnóstico é ler o que o compilador disse e
 * decidir o que fazer — e o que mais se confunde é "fazer o erro sumir" com
 * "resolver o erro": any, as, ! e @ts-ignore aparecem nas alternativas
 * erradas de propósito, porque são o atalho que todo mundo tenta.
 *
 * Toda alternativa errada diz por que está errada, no campo `porque`, e a
 * certa não carrega motivo nenhum. Nada de crase nem de asterisco: a questão
 * vai para o `QuestionRenderer`, que imprime texto puro.
 */

export const QUESTOES_DE_TYPESCRIPT: Record<string, Question[]> = {
  /* ── Módulo 1 — Por que tipos ── */
  'm1-teoria': [
    {
      id: 'TS-M1-Q1', type: 'multiple_choice',
      prompt: 'O que é tipagem estática?',
      data: { options: [
        { id: 'a', text: 'O tipo escrito no código e conferido antes de rodar.', correct: true },
        { id: 'b', text: 'O tipo que muda sozinho conforme o valor guardado.', porque: 'Isso é a tipagem dinâmica do JavaScript: o tipo mora no valor e só existe quando o programa roda.' },
        { id: 'c', text: 'Variáveis que não podem mudar de valor depois de criadas.', porque: 'Isso é o const. Uma variável estática no tipo pode mudar de valor, desde que continue do mesmo tipo.' },
        { id: 'd', text: 'Um programa que roda sem precisar de computador.', porque: 'Todo programa precisa de computador para rodar. O estático fala de quando o tipo é conferido: antes.' },
      ]},
      explanation: 'No TypeScript, let idade: number diz o tipo, e o compilador confere tudo antes de o programa rodar uma linha.',
    },
    {
      id: 'TS-M1-Q2', type: 'multiple_choice',
      prompt: 'O que o tsc faz com um arquivo programa.ts?',
      data: { options: [
        { id: 'a', text: 'Confere os tipos e escreve um programa.js sem eles.', correct: true },
        { id: 'b', text: 'Roda o programa.ts direto, sem gerar nada.', porque: 'Quem roda é o node, e ele só entende JavaScript. O tsc gera o .js que o node vai rodar.' },
        { id: 'c', text: 'Transforma o programa.ts num aplicativo para o celular.', porque: 'O tsc traduz para JavaScript, que é outra linguagem do mesmo nível, e não para um aplicativo.' },
        { id: 'd', text: 'Apaga os erros de tipo do arquivo, corrigindo-os sozinho.', porque: 'O tsc aponta os erros, com arquivo e linha. Quem corrige é você.' },
      ]},
      explanation: 'É a transpilação: de TypeScript para JavaScript. O .js gerado aparece ao lado do .ts, sem nenhum tipo.',
    },
    {
      id: 'TS-M1-Q3', type: 'scenario',
      prompt: 'Alguém roda node programa.ts e recebe "SyntaxError: Unexpected token" apontando um dois-pontos. O que aconteceu?',
      data: { scenarios: [
        { id: 'a', text: 'O node leu os tipos como se fosse JavaScript.', correct: true },
        { id: 'b', text: 'Faltou um ponto e vírgula no fim de alguma linha.', porque: 'O dois-pontos que o node não entendeu é o da anotação de tipo. Ponto e vírgula não tem nada com isso.' },
        { id: 'c', text: 'O node está numa versão antiga e precisa ser atualizado.', porque: 'O caminho é compilar antes: tsc gera o .js, e node programa.js roda o que foi gerado.' },
        { id: 'd', text: 'O arquivo tem um erro de tipo que o compilador apontaria.', porque: 'O node nem chegou a olhar tipo nenhum: ele tropeçou no dois-pontos, que não existe em JavaScript.' },
      ]},
      explanation: 'Primeiro tsc, depois node programa.js. O node roda o arquivo gerado, e nunca o .ts.',
    },
    {
      id: 'TS-M1-Q4', type: 'scenario',
      prompt: 'Num programa em JavaScript, p.unidad foi escrito no lugar de p.unidade. Quando o erro aparece?',
      data: { scenarios: [
        { id: 'a', text: 'Só ao rodar, quando o undefined for usado.', correct: true },
        { id: 'b', text: 'Assim que o arquivo é salvo no editor.', porque: 'O JavaScript não confere nomes de propriedade antes de rodar. Para ele, p.unidad só devolve undefined.' },
        { id: 'c', text: 'Nunca: o JavaScript corrige o nome sozinho.', porque: 'Não corrige. Ele devolve undefined, e o programa estoura quando tenta usar o que não veio.' },
        { id: 'd', text: 'Quando o navegador baixa o arquivo da internet.', porque: 'Baixar não confere nada. O erro só aparece quando aquela linha roda.' },
      ]},
      explanation: 'Com TypeScript, o mesmo nome errado é apontado antes de rodar — e o compilador ainda sugere o certo.',
    },
    {
      id: 'TS-M1-Q5', type: 'scenario',
      prompt: 'A idade chega do formulário como "13", e a soma das idades sai 2313 em vez de 36. Em JavaScript, nada avisou. O que o TypeScript faria?',
      data: { scenarios: [
        { id: 'a', text: 'Apontaria o texto onde se esperava número.', correct: true },
        { id: 'b', text: 'Converteria o "13" em número sozinho, sem avisar.', porque: 'O compilador não muda valores. Ele aponta que um texto foi passado onde o parâmetro pede number.' },
        { id: 'c', text: 'Nada, porque a soma está escrita certa.', porque: 'A soma está certa; o valor que entrou nela é que é do tipo errado, e é isso que o compilador confere.' },
        { id: 'd', text: 'Pararia o programa no meio da soma, com erro.', porque: 'O TypeScript não roda o programa: ele aponta o erro antes, na linha da chamada.' },
      ]},
      explanation: 'É o segundo erro do requisito 3: o valor do tipo errado, que em JavaScript nem estoura — só escreve um número plausível e errado.',
    },
    {
      id: 'TS-M1-Q6', type: 'true_false',
      prompt: 'Com um erro de tipo no programa, o tsc aponta o erro e mesmo assim gera o .js.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'É o comportamento de fábrica: ele avisa e gera. Só com noEmitOnError ligado o erro segura a saída.' },
      ]},
      explanation: 'Por isso se escreve tsc && node programa.js: o && não roda o node quando o tsc termina com erro.',
    },
    {
      id: 'TS-M1-Q7', type: 'true_false',
      prompt: 'Um programa em JavaScript precisa ser reescrito do zero para virar TypeScript.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O TypeScript é o JavaScript com tipos por cima. O programa continua o mesmo; o que se acrescenta são os tipos.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Converter começa por trocar a extensão e dizer os tipos que faltam. O último módulo faz exatamente isso.',
    },
  ],

  /* ── Módulo 2 — Anotar tipos ── */
  'm2-teoria': [
    {
      id: 'TS-M2-Q1', type: 'multiple_choice',
      prompt: 'Como se diz que a lista de inscritos é uma lista de textos?',
      data: { options: [
        { id: 'a', text: 'const inscritos: string[] = [];', correct: true },
        { id: 'b', text: 'const inscritos: string = [];', porque: 'string é um texto só. Uma lista de textos leva os colchetes depois: string[].' },
        { id: 'c', text: 'const inscritos = string[];', porque: 'O tipo vai depois do nome, com dois-pontos, e o valor depois do igual.' },
        { id: 'd', text: 'const string inscritos = [];', porque: 'Essa é a ordem de outras linguagens. No TypeScript é nome, dois-pontos, tipo.' },
      ]},
      explanation: 'O tipo do que vai dentro, com colchetes depois: string[] é lista de textos, number[] é lista de números.',
    },
    {
      id: 'TS-M2-Q2', type: 'multiple_choice',
      prompt: 'Em function taxa(dias: number): number, o que diz o segundo number?',
      data: { options: [
        { id: 'a', text: 'O tipo do que a função devolve.', correct: true },
        { id: 'b', text: 'O tipo de um segundo parâmetro, que ficou sem nome.', porque: 'Os parâmetros ficam dentro dos parênteses. O que vem depois deles é o retorno.' },
        { id: 'c', text: 'Quantas vezes a função pode ser chamada.', porque: 'Não há limite de chamadas no tipo. Ele diz só o que sai da função.' },
        { id: 'd', text: 'Que dias não pode ser negativo.', porque: 'number aceita negativos também. O segundo number é o tipo do retorno.' },
      ]},
      explanation: 'Depois dos parênteses vem o retorno. Função que não devolve nada devolve void.',
    },
    {
      id: 'TS-M2-Q3', type: 'scenario',
      prompt: 'Com o modo estrito ligado, o compilador diz: "O parâmetro dias implicitamente tem um tipo any". O que resolve?',
      data: { scenarios: [
        { id: 'a', text: 'Escrever o tipo do parâmetro: dias: number.', correct: true },
        { id: 'b', text: 'Escrever dias: any, para o erro sumir.', porque: 'O erro some, e a conferência também: com any, o compilador aceita qualquer coisa ali. O certo é o tipo que dias tem.' },
        { id: 'c', text: 'Desligar o modo estrito no tsconfig.', porque: 'Isso cala o aviso em todo o projeto, e o any continua lá, sem conferência nenhuma.' },
        { id: 'd', text: 'Pôr // @ts-ignore na linha de cima.', porque: 'É calar o compilador naquela linha. O parâmetro continua sem tipo.' },
      ]},
      explanation: 'O modo estrito recusa o any implícito porque any é a ausência de conferência. Dar o tipo é o que ele pede.',
    },
    {
      id: 'TS-M2-Q4', type: 'scenario',
      prompt: 'O programa tem function taxa(dias: number) e alguém chama taxa("3"). Onde o compilador aponta o erro?',
      data: { scenarios: [
        { id: 'a', text: 'Na linha da chamada, no "3".', correct: true },
        { id: 'b', text: 'Dentro da função, onde dias é multiplicado.', porque: 'Com o parâmetro anotado, a função está certa. O erro é de quem a chamou errado, e é ali que ele aparece.' },
        { id: 'c', text: 'Em lugar nenhum, porque "3" vira 3 sozinho.', porque: 'O compilador não converte valores. Ele aponta o texto passado onde o parâmetro pede número.' },
        { id: 'd', text: 'Na primeira linha do arquivo.', porque: 'O compilador diz a linha e a coluna do erro: a do argumento errado.' },
      ]},
      explanation: 'É a vantagem de anotar o parâmetro: o erro aparece onde ele foi cometido, e não lá dentro, onde faria estrago.',
    },
    {
      id: 'TS-M2-Q5', type: 'multiple_choice',
      prompt: 'Por que const inscritos = [] precisa de tipo escrito no modo estrito?',
      data: { options: [
        { id: 'a', text: 'A lista vazia não diz o que vai entrar nela.', correct: true },
        { id: 'b', text: 'Porque toda variável precisa de tipo escrito.', porque: 'Não precisa: com valor inicial, o compilador quase sempre infere o tipo sozinho. A lista vazia é a exceção.' },
        { id: 'c', text: 'Porque const não aceita lista.', porque: 'const aceita lista, e a lista pode até crescer. O que falta é dizer de que ela é feita.' },
        { id: 'd', text: 'Porque listas só existem em TypeScript com tipo.', porque: 'Listas existem do mesmo jeito. O compilador só não tem de onde tirar o tipo do que ainda não entrou.' },
      ]},
      explanation: 'const inscritos: string[] = [] diz ao compilador o que vai entrar, e a partir dali cada push é conferido.',
    },
    {
      id: 'TS-M2-Q6', type: 'true_false',
      prompt: 'Um parâmetro escrito sem tipo é conferido como se fosse number.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Sem tipo e sem de onde tirá-lo, o parâmetro vira any — e any não é conferido como coisa nenhuma.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'É o any implícito. O modo estrito o transforma em erro justamente para ele não passar calado.',
    },
    {
      id: 'TS-M2-Q7', type: 'true_false',
      prompt: 'Uma função que só escreve no console, sem return, devolve void.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'void é exatamente o tipo de "não devolve nada": a função faz alguma coisa e não entrega valor.' },
      ]},
      explanation: 'function mostrar(texto: string): void diz que a função não devolve nada para quem chamou.',
    },
  ],

  /* ── Módulo 3 — Inferência ── */
  'm3-teoria': [
    {
      id: 'TS-M3-Q1', type: 'multiple_choice',
      prompt: 'O que é inferência de tipo?',
      data: { options: [
        { id: 'a', text: 'O compilador descobrir o tipo sozinho, pelo valor.', correct: true },
        { id: 'b', text: 'O programa adivinhar o tipo enquanto roda.', porque: 'A inferência acontece antes de rodar, na compilação, e o tipo inferido é conferido como um escrito.' },
        { id: 'c', text: 'Escrever o tipo de toda variável.', porque: 'É o contrário: inferir é o compilador saber sem ninguém escrever.' },
        { id: 'd', text: 'Converter o valor para o tipo que se quer.', porque: 'A inferência não converte nada. Ela descobre o tipo que o valor já tem.' },
      ]},
      explanation: 'const diaria = 45 já é number: o 45 diz. E daí em diante ela é conferida como qualquer variável anotada.',
    },
    {
      id: 'TS-M3-Q2', type: 'scenario',
      prompt: 'O programa tem let diaria = 45 e, mais adiante, diaria = "quarenta". O que acontece?',
      data: { scenarios: [
        { id: 'a', text: 'O compilador aponta: texto onde era número.', correct: true },
        { id: 'b', text: 'Nada, porque diaria não tem tipo escrito.', porque: 'O tipo foi inferido do 45: number. Sem estar escrito, ele vale do mesmo jeito.' },
        { id: 'c', text: 'diaria passa a ser texto dali em diante.', porque: 'Isso aconteceria em JavaScript. No TypeScript, o tipo inferido não muda: é erro.' },
        { id: 'd', text: 'O programa estoura ao rodar essa linha.', porque: 'O erro é apontado antes de rodar, na compilação.' },
      ]},
      explanation: 'Tipo inferido é tipo de verdade. A diferença para o anotado é só quem o escreveu.',
    },
    {
      id: 'TS-M3-Q3', type: 'multiple_choice',
      prompt: 'Onde o compilador NÃO tem de onde inferir o tipo, e ele precisa ser escrito?',
      data: { options: [
        { id: 'a', text: 'Nos parâmetros de uma função declarada.', correct: true },
        { id: 'b', text: 'Numa variável que recebe um número.', porque: 'O número diz o tipo: const total = 0 já é number.' },
        { id: 'c', text: 'No resultado de uma conta entre números.', porque: 'A conta entre números dá número, e o compilador sabe disso.' },
        { id: 'd', text: 'Num texto entre aspas guardado numa constante.', porque: 'As aspas dizem: é string. O compilador infere sozinho.' },
      ]},
      explanation: 'Quando o compilador lê a função, ninguém a chamou ainda: o parâmetro não tem valor de onde tirar o tipo.',
    },
    {
      id: 'TS-M3-Q4', type: 'scenario',
      prompt: 'Alguém escreveu const resumo: number = 3 e, meses depois, mudou para const resumo: number = nomes.length + " membros". O compilador reclama. Qual é o conserto mais limpo?',
      data: { scenarios: [
        { id: 'a', text: 'Tirar o tipo e deixar inferir.', correct: true },
        { id: 'b', text: 'Trocar o tipo para any, que aceita os dois.', porque: 'any desliga a conferência do resumo inteiro. O valor já diz o tipo; não há o que escrever.' },
        { id: 'c', text: 'Voltar o valor para 3, para o tipo continuar certo.', porque: 'O valor novo é o que o programa precisa. Quem envelheceu foi o tipo escrito ao lado.' },
        { id: 'd', text: 'Pôr as number depois do texto.', porque: 'É forçar o compilador a acreditar numa mentira: o valor é texto, e continua texto ao rodar.' },
      ]},
      explanation: 'A anotação repetida é a cópia que envelhece. Onde o valor já diz o tipo, deixar inferir evita o erro.',
    },
    {
      id: 'TS-M3-Q5', type: 'scenario',
      prompt: 'Em pontos.map(p => p * 2), sendo pontos um number[], por que o p não precisa de tipo escrito?',
      data: { scenarios: [
        { id: 'a', text: 'O tipo vem da lista: cada p é number.', correct: true },
        { id: 'b', text: 'Porque p é um nome curto demais para ter tipo.', porque: 'O tamanho do nome não importa. O tipo vem do contexto: a lista de quem chama.' },
        { id: 'c', text: 'Porque dentro do map tudo é any.', porque: 'Não é any: o p é conferido como number. Tente p.toUpperCase() e o compilador aponta.' },
        { id: 'd', text: 'Porque funções de seta nunca têm tipo.', porque: 'Funções de seta aceitam tipo escrito. Aqui ele não é necessário porque vem do contexto.' },
      ]},
      explanation: 'É a inferência pelo contexto: quem chama diz o tipo. Por isso callbacks quase nunca levam tipo, e funções com nome sempre levam.',
    },
    {
      id: 'TS-M3-Q6', type: 'true_false',
      prompt: 'Variável com tipo inferido é conferida com menos rigor do que variável com tipo escrito.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O rigor é o mesmo. A diferença é só quem escreveu o tipo: você, ou o compilador.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Inferir não é afrouxar: é o compilador escrever o tipo por você.',
    },
    {
      id: 'TS-M3-Q7', type: 'true_false',
      prompt: 'No editor do clube, passar o mouse sobre uma variável mostra o tipo que o compilador inferiu.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Os editores mostram, sim: é o jeito mais rápido de ver o que o compilador sabe sozinho.' },
      ]},
      explanation: 'É a melhor forma de aprender quando é preciso escrever o tipo e quando não.',
    },
  ],

  /* ── Módulo 4 — Interfaces ── */
  'm4-teoria': [
    {
      id: 'TS-M4-Q1', type: 'multiple_choice',
      prompt: 'O que é uma interface?',
      data: { options: [
        { id: 'a', text: 'A descrição do formato de um objeto.', correct: true },
        { id: 'b', text: 'A tela que o usuário vê ao abrir o programa.', porque: 'Interface aqui não é a tela. É a descrição das propriedades de um objeto e do tipo de cada uma.' },
        { id: 'c', text: 'Um objeto pronto, com valores dentro.', porque: 'A interface não tem valor nenhum: ela descreve como os objetos são, e quem tem valores são os objetos.' },
        { id: 'd', text: 'Uma função que cria objetos.', porque: 'A interface não cria nada e nem existe no .js gerado: é só uma descrição para o compilador conferir.' },
      ]},
      explanation: 'interface Membro { nome: string; idade: number; } diz como todo membro é.',
    },
    {
      id: 'TS-M4-Q2', type: 'scenario',
      prompt: 'Com interface Membro { nome: string; unidade: string; }, alguém escreve m.unidde. O que o compilador faz?',
      data: { scenarios: [
        { id: 'a', text: 'Aponta o nome e sugere unidade.', correct: true },
        { id: 'b', text: 'Devolve undefined, como o JavaScript.', porque: 'Isso aconteceria só ao rodar, em JavaScript. Com a interface, o nome errado é erro de compilação.' },
        { id: 'c', text: 'Cria a propriedade unidde no objeto.', porque: 'Ler uma propriedade não cria nada. E a interface não tem unidde, então é erro.' },
        { id: 'd', text: 'Nada, porque o objeto tem a propriedade unidade.', porque: 'Ter unidade não salva quem leu unidde: o nome lido não existe na interface.' },
      ]},
      explanation: 'O compilador diz: a propriedade unidde não existe no tipo Membro. Você quis dizer unidade?',
    },
    {
      id: 'TS-M4-Q3', type: 'scenario',
      prompt: 'const bruno: Membro = { nome: "Bruno" }, e a interface Membro também pede unidade. O que acontece?',
      data: { scenarios: [
        { id: 'a', text: 'Erro: a propriedade unidade está faltando.', correct: true },
        { id: 'b', text: 'Nada: unidade fica undefined.', porque: 'Propriedade sem ponto de interrogação é obrigatória. O compilador aponta a falta.' },
        { id: 'c', text: 'O compilador preenche unidade com texto vazio.', porque: 'O compilador não inventa valores. Ele aponta que falta.' },
        { id: 'd', text: 'Erro só quando bruno.unidade for lido.', porque: 'O erro aparece na criação do objeto, onde a propriedade faltou.' },
      ]},
      explanation: 'A interface confere três coisas: o que falta, o que sobra, e o que foi lido com nome errado.',
    },
    {
      id: 'TS-M4-Q4', type: 'multiple_choice',
      prompt: 'O que sobra de uma interface no arquivo .js que o tsc gera?',
      data: { options: [
        { id: 'a', text: 'Nada.', correct: true },
        { id: 'b', text: 'Um objeto com as propriedades vazias.', porque: 'A interface não vira objeto nenhum. Ela some inteira na transpilação.' },
        { id: 'c', text: 'Um comentário com a descrição dela.', porque: 'O tsc não deixa comentário: tipos e interfaces simplesmente saem.' },
        { id: 'd', text: 'Uma função que confere os objetos ao rodar.', porque: 'A conferência acontece só na compilação. Ao rodar, o JavaScript não sabe que a interface existiu.' },
      ]},
      explanation: 'Interface é para o compilador. O que roda é JavaScript, sem tipo nenhum.',
    },
    {
      id: 'TS-M4-Q5', type: 'scenario',
      prompt: 'O membro ganhou um telefone. O programa usa Membro em seis lugares. O que muda primeiro?',
      data: { scenarios: [
        { id: 'a', text: 'A interface, e o compilador aponta o resto.', correct: true },
        { id: 'b', text: 'Os seis lugares, um por um, de memória.', porque: 'Com a interface, não precisa de memória: mude a definição e o compilador lista quem precisa acompanhar.' },
        { id: 'c', text: 'Nada: telefone pode ser escrito em qualquer objeto.', porque: 'Com a interface, propriedade que ela não tem é erro. Ela precisa ganhar o telefone primeiro.' },
        { id: 'd', text: 'Criar uma segunda interface, MembroComTelefone.', porque: 'Duas descrições do mesmo membro divergem no primeiro ajuste. A definição é uma só.' },
      ]},
      explanation: 'É a vantagem de ter uma definição só: muda num lugar, e o compilador acha cada canto que precisa mudar junto.',
    },
    {
      id: 'TS-M4-Q6', type: 'true_false',
      prompt: 'Uma interface pode ser usada como tipo de lista, de parâmetro e de retorno.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Escrita uma vez, ela vira um tipo como string: Membro[], (m: Membro) e (): Membro valem todos.' },
      ]},
      explanation: 'Membro[] é uma lista de membros; function apresentar(m: Membro) recebe um; function maisVelho(): Membro devolve um.',
    },
    {
      id: 'TS-M4-Q7', type: 'true_false',
      prompt: 'Com interface, o objeto pode ter propriedades que ela não descreve, sem erro.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Ao criar o objeto já anotado, propriedade a mais é erro: o compilador aponta o que sobra.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Sobrar também é erro — muitas vezes é um nome digitado errado que, sem a interface, viraria uma propriedade nova.',
    },
  ],

  /* ── Módulo 5 — União e opcional ── */
  'm5-teoria': [
    {
      id: 'TS-M5-Q1', type: 'multiple_choice',
      prompt: 'O que o tipo string | number aceita?',
      data: { options: [
        { id: 'a', text: 'Um texto ou um número.', correct: true },
        { id: 'b', text: 'Um texto e um número, os dois juntos.', porque: 'A barra quer dizer "ou": o valor é de um tipo ou do outro, e não dos dois ao mesmo tempo.' },
        { id: 'c', text: 'Só textos que parecem números.', porque: 'Aceita qualquer texto e qualquer número. "12" e 12 passam, e "Ana" também.' },
        { id: 'd', text: 'Qualquer coisa, como any.', porque: 'Aceita só os dois tipos listados. Um booleano, por exemplo, é erro.' },
      ]},
      explanation: 'É o tipo de união: a barra vertical junta tipos, e o valor pode ser de qualquer um deles.',
    },
    {
      id: 'TS-M5-Q2', type: 'scenario',
      prompt: "Com type Cargo = 'diretor' | 'conselheira' | 'desbravador', alguém escreve cargo: 'Diretor'. O que acontece?",
      data: { scenarios: [
        { id: 'a', text: 'Erro, com a sugestão diretor.', correct: true },
        { id: 'b', text: 'Passa, porque Diretor e diretor são a mesma palavra.', porque: 'Para o compilador, maiúscula e minúscula são diferentes. Só as três palavras exatas passam.' },
        { id: 'c', text: 'O compilador troca para minúscula sozinho.', porque: 'Ele não muda o código: aponta o erro e sugere o valor certo.' },
        { id: 'd', text: 'Passa, porque Cargo é texto.', porque: 'Cargo não é qualquer texto: é uma união de três palavras fixas.' },
      ]},
      explanation: 'É o uso mais útil da união: um campo que só tem três respostas certas, conferido antes de rodar.',
    },
    {
      id: 'TS-M5-Q3', type: 'multiple_choice',
      prompt: 'O que telefone?: string diz numa interface?',
      data: { options: [
        { id: 'a', text: 'Que o objeto pode vir sem telefone.', correct: true },
        { id: 'b', text: 'Que o telefone ainda não foi decidido.', porque: 'O ponto de interrogação não é dúvida de quem escreveu: diz que a propriedade pode faltar.' },
        { id: 'c', text: 'Que o telefone pode ser qualquer tipo.', porque: 'O tipo continua string. O que muda é que ele pode não estar lá.' },
        { id: 'd', text: 'Que o telefone é obrigatório e começa vazio.', porque: 'É o contrário: sem o ponto de interrogação ele seria obrigatório.' },
      ]},
      explanation: 'Propriedade opcional: o tipo dela passa a ser string | undefined.',
    },
    {
      id: 'TS-M5-Q4', type: 'scenario',
      prompt: 'Com telefone opcional, p.telefone.replace(...) dá erro: "possivelmente undefined". Qual é o conserto certo?',
      data: { scenarios: [
        { id: 'a', text: 'Perguntar antes se o telefone existe.', correct: true },
        { id: 'b', text: 'Escrever p.telefone!.replace(...).', porque: 'O ! diz ao compilador que o telefone existe, sem conferir. Quem não tem telefone continua estourando ao rodar.' },
        { id: 'c', text: 'Escrever (p.telefone as string).replace(...).', porque: 'O as força o compilador a acreditar. O valor continua podendo ser undefined ao rodar.' },
        { id: 'd', text: 'Tirar o ponto de interrogação do telefone.', porque: 'Aí o compilador volta a exigir telefone de todo mundo — e o Davi, que não tem, vira erro de novo.' },
      ]},
      explanation: 'if (p.telefone === undefined) return ... — depois desse if, o compilador sabe que ali o telefone existe.',
    },
    {
      id: 'TS-M5-Q5', type: 'multiple_choice',
      prompt: "O que faz p.telefone ?? 'sem telefone'?",
      data: { options: [
        { id: 'a', text: 'Usa o texto quando o telefone falta.', correct: true },
        { id: 'b', text: 'Pergunta ao usuário qual é o telefone.', porque: 'Não pergunta nada a ninguém. O ?? escolhe o valor da direita quando o da esquerda é undefined ou null.' },
        { id: 'c', text: 'Apaga o telefone de quem tem.', porque: 'Quem tem telefone continua com ele: o ?? só age quando o valor falta.' },
        { id: 'd', text: 'Dá erro, porque telefone é opcional.', porque: 'É justamente o jeito certo de usar uma opcional: com um valor para quando ela falta.' },
      ]},
      explanation: 'O ?? e o ?. tratam a falta numa linha só, e o compilador entende os dois.',
    },
    {
      id: 'TS-M5-Q6', type: 'true_false',
      prompt: 'O ! depois de um valor opcional resolve o caso de ele faltar.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O ! só cala o compilador. Se o valor faltar, o programa estoura ao rodar do mesmo jeito.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Calar não é resolver. Resolver é tratar a falta: um if, um ?., um ??.',
    },
    {
      id: 'TS-M5-Q7', type: 'true_false',
      prompt: 'Depois de if (p.telefone === undefined) return, o compilador sabe que p.telefone existe nas linhas seguintes.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'É o estreitamento: depois da pergunta, o tipo de p.telefone deixa de incluir undefined.' },
      ]},
      explanation: 'O compilador acompanha os ifs e estreita o tipo: o que foi descartado não volta.',
    },
  ],

  /* ── Módulo 6 — Genéricos ── */
  'm6-teoria': [
    {
      id: 'TS-M6-Q1', type: 'multiple_choice',
      prompt: 'O que é um tipo genérico?',
      data: { options: [
        { id: 'a', text: 'Um tipo que vira parâmetro, como o T.', correct: true },
        { id: 'b', text: 'Um tipo que aceita qualquer coisa, como any.', porque: 'O genérico não desliga a conferência: o T é um tipo de verdade, decidido por quem chama.' },
        { id: 'c', text: 'Um tipo sem nome, escrito na hora.', porque: 'O genérico tem nome, normalmente T, e aparece entre os sinais de menor e maior.' },
        { id: 'd', text: 'Um tipo que só serve para listas.', porque: 'Listas são o exemplo mais comum, mas Record e Promise também são genéricos, e funções de todo tipo podem ser.' },
      ]},
      explanation: 'function primeiro<T>(lista: T[]): T diz: seja qual for o tipo da lista, o que sai é desse mesmo tipo.',
    },
    {
      id: 'TS-M6-Q2', type: 'scenario',
      prompt: 'Com function primeiro<T>(lista: T[]): T | undefined, qual é o tipo de primeiro([72, 55])?',
      data: { scenarios: [
        { id: 'a', text: 'number | undefined.', correct: true },
        { id: 'b', text: 'any, porque T pode ser qualquer coisa.', porque: 'T é decidido pela lista passada. Com uma lista de números, T vira number.' },
        { id: 'c', text: 'T, sem mais nada.', porque: 'O T não sobra: ele é trocado pelo tipo da lista, e o undefined da assinatura vem junto.' },
        { id: 'd', text: 'number[], a lista inteira.', porque: 'A lista é T[]; o retorno é T — um elemento só, ou undefined.' },
      ]},
      explanation: 'O compilador descobre o T pela lista passada e confere o resultado como se a função tivesse sido escrita só para números.',
    },
    {
      id: 'TS-M6-Q3', type: 'scenario',
      prompt: 'Uma função recebe any[] e devolve any. Alguém escreve primeiroDeQualquer(pontos).toUpperCase(), sendo pontos uma lista de números. O que acontece?',
      data: { scenarios: [
        { id: 'a', text: 'Compila sem aviso e estoura ao rodar.', correct: true },
        { id: 'b', text: 'O compilador aponta: number não tem toUpperCase.', porque: 'Isso aconteceria com o genérico. Com any, o compilador não sabe que é número, e não aponta nada.' },
        { id: 'c', text: 'Funciona, porque toUpperCase converte o número.', porque: 'Números não têm toUpperCase. Ao rodar, a linha estoura.' },
        { id: 'd', text: 'O compilador troca any por number sozinho.', porque: 'any é any: o compilador não tenta adivinhar o que está por trás.' },
      ]},
      explanation: 'É o defeito do any: ele se espalha, e tudo que usa o resultado fica sem conferência.',
    },
    {
      id: 'TS-M6-Q4', type: 'multiple_choice',
      prompt: 'Por que uma função genérica é melhor do que três funções iguais, uma para cada tipo?',
      data: { options: [
        { id: 'a', text: 'Uma só, e o tipo continua conferido.', correct: true },
        { id: 'b', text: 'Porque roda mais depressa.', porque: 'A velocidade é a mesma: os tipos somem no .js. A vantagem é escrever uma vez sem perder a conferência.' },
        { id: 'c', text: 'Porque dispensa os testes.', porque: 'Nada dispensa testar. O genérico evita a repetição, e a repetição é onde as cópias divergem.' },
        { id: 'd', text: 'Porque aceita valores sem tipo nenhum.', porque: 'Aceita listas de qualquer tipo, mas cada chamada é conferida com o tipo dela.' },
      ]},
      explanation: 'Três cópias divergem no primeiro ajuste; uma genérica é uma definição só, conferida para cada tipo que chegar.',
    },
    {
      id: 'TS-M6-Q5', type: 'multiple_choice',
      prompt: 'O que é Record<string, number>?',
      data: { options: [
        { id: 'a', text: 'Um objeto de chaves texto e valores número.', correct: true },
        { id: 'b', text: 'Uma lista que alterna textos e números.', porque: 'Record é objeto, e não lista. As chaves são texto e os valores, número.' },
        { id: 'c', text: 'Um registro de banco de dados.', porque: 'O nome lembra banco, mas aqui é um tipo pronto da linguagem para objetos usados como dicionário.' },
        { id: 'd', text: 'Um número guardado como texto.', porque: 'São dois tipos: o das chaves e o dos valores. string para as chaves, number para os valores.' },
      ]},
      explanation: 'Record é um genérico pronto da linguagem, como Array<T>. É o tipo dos totais por unidade.',
    },
    {
      id: 'TS-M6-Q6', type: 'true_false',
      prompt: 'string[] e Array<string> são o mesmo tipo.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'São duas escritas do mesmo tipo genérico: a lista de textos.' },
      ]},
      explanation: 'Os colchetes são o atalho. Array<T> é o genérico por trás deles.',
    },
    {
      id: 'TS-M6-Q7', type: 'true_false',
      prompt: 'Para chamar uma função genérica, é sempre preciso escrever o tipo entre os sinais de menor e maior.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Quase nunca: o compilador infere o T pelo argumento. primeiro([72, 55]) já sabe que T é number.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'A inferência vale para o T também. Escrever primeiro<number>(...) só é preciso quando o argumento não diz.',
    },
  ],

  /* ── Módulo 7 — O projeto e o compilador ── */
  'm7-teoria': [
    {
      id: 'TS-M7-Q1', type: 'multiple_choice',
      prompt: 'Para que serve o tsconfig.json?',
      data: { options: [
        { id: 'a', text: 'Dizer ao tsc o que compilar e com que regras.', correct: true },
        { id: 'b', text: 'Guardar a senha do projeto.', porque: 'Não há senha nenhuma ali: são as opções do compilador, como strict e outDir.' },
        { id: 'c', text: 'Listar os erros da última compilação.', porque: 'Os erros saem no terminal. O tsconfig tem as regras, e não o resultado.' },
        { id: 'd', text: 'Rodar o programa depois de compilar.', porque: 'Quem roda é o node. O tsconfig só configura o compilador.' },
      ]},
      explanation: 'Com ele, a pasta vira projeto: tsc sozinho compila todos os .ts com aquelas regras.',
    },
    {
      id: 'TS-M7-Q2', type: 'scenario',
      prompt: 'Numa pasta sem tsconfig.json, alguém roda tsc. O que aparece?',
      data: { scenarios: [
        { id: 'a', text: 'A ajuda do compilador, sem compilar nada.', correct: true },
        { id: 'b', text: 'Todos os .ts compilados com as regras de fábrica.', porque: 'Sem projeto e sem arquivo na linha, o tsc não sabe o que compilar, e mostra a ajuda.' },
        { id: 'c', text: 'Um tsconfig.json criado sozinho.', porque: 'Quem cria é tsc --init. O tsc sozinho só mostra como usá-lo.' },
        { id: 'd', text: 'Um erro dizendo que o TypeScript não está instalado.', porque: 'Ele está instalado, tanto que responde. Falta o projeto.' },
      ]},
      explanation: 'tsc --init cria o tsconfig, e daí em diante tsc compila o projeto.',
    },
    {
      id: 'TS-M7-Q3', type: 'scenario',
      prompt: 'O projeto tem "noEmitOnError": true, e o programa tem um erro de tipo. O que tsc && node dist/programa.js faz?',
      data: { scenarios: [
        { id: 'a', text: 'Aponta o erro e não gera nem roda nada.', correct: true },
        { id: 'b', text: 'Aponta o erro, gera o .js e roda assim mesmo.', porque: 'Isso é o comportamento de fábrica. Com noEmitOnError, o erro segura a saída: não há .js para rodar.' },
        { id: 'c', text: 'Ignora o erro e roda o programa.', porque: 'O erro é sempre apontado. A opção só decide se o .js é gerado.' },
        { id: 'd', text: 'Corrige o erro sozinho e roda.', porque: 'O compilador não corrige: aponta. Com essa opção, também não gera.' },
      ]},
      explanation: 'É o erro apontado antes da execução, levado até o fim: sem .js, não há o que rodar.',
    },
    {
      id: 'TS-M7-Q4', type: 'multiple_choice',
      prompt: 'O que faz "outDir": "./dist"?',
      data: { options: [
        { id: 'a', text: 'Manda o .js gerado para a pasta dist.', correct: true },
        { id: 'b', text: 'Apaga a pasta dist a cada compilação.', porque: 'Não apaga nada. Ela é o destino do que o tsc gera.' },
        { id: 'c', text: 'Faz o tsc compilar só o que está em dist.', porque: 'É o contrário: dist é para onde vai a saída, e não de onde vêm os .ts.' },
        { id: 'd', text: 'Publica o programa na internet.', porque: 'dist é só uma pasta local. Publicar é outro passo, com outras ferramentas.' },
      ]},
      explanation: 'O que se escreve fica de um lado, o que se gera do outro. E o node passa a rodar dist/programa.js.',
    },
    {
      id: 'TS-M7-Q5', type: 'scenario',
      prompt: 'O programa reprova com tsc, e passa limpo com tsc programa.ts. Por quê?',
      data: { scenarios: [
        { id: 'a', text: 'Com o nome na linha, o tsconfig é ignorado.', correct: true },
        { id: 'b', text: 'Porque tsc programa.ts compila mais devagar e acha menos.', porque: 'A velocidade não muda o que se acha. São as regras: sem o tsconfig, não há modo estrito.' },
        { id: 'c', text: 'Porque o erro estava em outro arquivo.', porque: 'É o mesmo arquivo. A diferença é que, com o nome na linha, valem as opções de fábrica.' },
        { id: 'd', text: 'Porque o tsc corrigiu o erro na segunda vez.', porque: 'O tsc nunca corrige. Na segunda vez ele só não tinha o modo estrito para apontar.' },
      ]},
      explanation: 'Num projeto configurado, rode tsc sozinho. Com o nome do arquivo, ele usa as regras de fábrica — sem modo estrito.',
    },
    {
      id: 'TS-M7-Q6', type: 'true_false',
      prompt: 'Tirar as duas barras do começo de uma linha do tsconfig liga aquela opção.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'As barras comentam a linha. Sem elas, a opção passa a valer.' },
      ]},
      explanation: 'O tsc --init escreve as opções desligadas, comentadas, para você conhecer e ligar.',
    },
    {
      id: 'TS-M7-Q7', type: 'true_false',
      prompt: 'O "strict": true deixa o compilador mais permissivo, para o iniciante errar menos.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'É o contrário: o modo estrito recusa o any implícito e confere o undefined. Ele aponta mais, e não menos.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'É a opção que faz o TypeScript valer a pena, e o tsc --init já a deixa ligada.',
    },
  ],

  /* ── Módulo 8 — Converter um programa ── */
  'm8-teoria': [
    {
      id: 'TS-M8-Q1', type: 'multiple_choice',
      prompt: 'Qual é o primeiro passo para converter um programa de JavaScript para TypeScript?',
      data: { options: [
        { id: 'a', text: 'Trocar a extensão para .ts e compilar.', correct: true },
        { id: 'b', text: 'Apagar o programa e escrever de novo.', porque: 'O programa é o mesmo. O que se acrescenta são os tipos, e o compilador diz onde.' },
        { id: 'c', text: 'Desligar o modo estrito até tudo funcionar.', porque: 'Sem o modo estrito, o compilador deixa passar justamente o que a conversão existe para achar.' },
        { id: 'd', text: 'Pôr any em todas as variáveis.', porque: 'Isso deixa o programa com cara de TypeScript e sem conferência nenhuma.' },
      ]},
      explanation: 'Com o modo estrito ligado, o compilador lista tudo o que o JavaScript deixava sem dizer.',
    },
    {
      id: 'TS-M8-Q2', type: 'multiple_choice',
      prompt: 'Que tipo JSON.parse devolve?',
      data: { options: [
        { id: 'a', text: 'any.', correct: true },
        { id: 'b', text: 'O tipo certo do que está no arquivo.', porque: 'JSON.parse não sabe o que tem no arquivo: o texto só é lido quando o programa roda.' },
        { id: 'c', text: 'string, porque o arquivo é texto.', porque: 'Ele lê o texto e devolve o objeto que o texto descreve — de tipo desconhecido para o compilador.' },
        { id: 'd', text: 'object, sempre.', porque: 'Pode devolver lista, número ou texto também. Por isso o tipo dele é any.' },
      ]},
      explanation: 'É por isso que se descreve o formato com uma interface e se diz o tipo de quem carrega o arquivo.',
    },
    {
      id: 'TS-M8-Q3', type: 'scenario',
      prompt: 'O programa convertido tem const totais = {} e depois totais[r.unidade] = 18. O modo estrito reclama. O que resolve?',
      data: { scenarios: [
        { id: 'a', text: 'Anotar: const totais: Record<string, number> = {}.', correct: true },
        { id: 'b', text: 'Trocar {} por [], uma lista.', porque: 'Os totais são por unidade, com o nome como chave: é um objeto. Uma lista mudaria o programa.' },
        { id: 'c', text: 'Escrever (totais as any)[r.unidade] = 18.', porque: 'É calar o compilador. O erro some, e a conferência dos totais também.' },
        { id: 'd', text: 'Declarar as quatro unidades no objeto vazio.', porque: 'Funcionaria até surgir a quinta unidade. Record aceita qualquer chave de texto, e confere os valores.' },
      ]},
      explanation: 'Para o compilador, {} não tem chave nenhuma. Record<string, number> diz que as chaves são texto e os valores, número.',
    },
    {
      id: 'TS-M8-Q4', type: 'scenario',
      prompt: 'Alguém terminou a conversão pondo // @ts-ignore em cima de cada linha com erro. O compilador não aponta mais nada. A conversão está feita?',
      data: { scenarios: [
        { id: 'a', text: 'Não: os erros continuam, só calados.', correct: true },
        { id: 'b', text: 'Sim: sem erro apontado, está convertido.', porque: 'O @ts-ignore manda o compilador não olhar a linha. O erro continua lá, só não é mais dito.' },
        { id: 'c', text: 'Sim, desde que o programa rode.', porque: 'O JavaScript original também rodava. A conversão existe para conferir os tipos, e eles não foram conferidos.' },
        { id: 'd', text: 'Não, porque @ts-ignore só funciona em JavaScript.', porque: 'Ele funciona, e é esse o problema: cala o compilador no TypeScript.' },
      ]},
      explanation: 'Eliminar o erro é dar o tipo certo. any, as e @ts-ignore só o escondem.',
    },
    {
      id: 'TS-M8-Q5', type: 'multiple_choice',
      prompt: 'Depois de converter, como se confere que o programa continua fazendo a mesma coisa?',
      data: { options: [
        { id: 'a', text: 'Rodando e comparando a saída com a de antes.', correct: true },
        { id: 'b', text: 'Olhando se o compilador não aponta erros.', porque: 'Compilar sem erro diz que os tipos fecham, e não que o programa faz o mesmo. A saída é que diz.' },
        { id: 'c', text: 'Contando se o número de linhas é o mesmo.', porque: 'Os tipos acrescentam linhas, e o programa continua o mesmo. Quem diz é a saída.' },
        { id: 'd', text: 'Abrindo o .js gerado e comparando com o original letra por letra.', porque: 'O .js gerado pode mudar de forma sem mudar de comportamento. A saída é que se compara.' },
      ]},
      explanation: 'Converter não pode mudar o que o programa faz: as duas metades são compilar sem erro e rodar com a mesma saída.',
    },
    {
      id: 'TS-M8-Q6', type: 'true_false',
      prompt: 'Escrever "as Registro[]" depois do JSON.parse é o mesmo que anotar o retorno da função com Registro[].',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O as força o tipo naquele ponto, sem conferir nada. O retorno anotado é uma promessa da função, conferida em cada return dela.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O as diz "confie em mim". A anotação do retorno diz "eu prometo isto", e o compilador cobra a promessa.',
    },
    {
      id: 'TS-M8-Q7', type: 'true_false',
      prompt: 'Na conversão, a maior parte dos primeiros erros costuma ser de parâmetro sem tipo.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Em JavaScript nenhum parâmetro tem tipo, então com o modo estrito todos aparecem de uma vez: é o grosso da lista.' },
      ]},
      explanation: 'A lista assusta no começo, e quase tudo é o mesmo erro. Vá de cima para baixo, um por vez.',
    },
  ],
};
