import type { Question } from '../types';

/*
 * As questões das lições de teoria da CC-FE003 JavaScript.
 *
 * ── O que elas medem ──────────────────────────────────────────────────────
 * A definição vale uma vez; depois vêm consequência, discriminação e
 * diagnóstico. Nesta vereda o diagnóstico pesa mais do que em qualquer
 * outra, e é pela natureza da linguagem: o JavaScript quase nunca recusa.
 * `"5" + 3` dá `"53"`, a posição que não existe dá `undefined`, o `var`
 * reescreve o de fora calado, a promessa sem `await` é impressa como
 * promessa. O programa segue, e a pergunta que vale é "de onde veio isto?".
 *
 * Toda alternativa errada diz por que está errada, no campo `porque`, e a
 * certa não carrega motivo nenhum. Nada de crase nem de asterisco: a questão
 * vai para o `QuestionRenderer`, que imprime texto puro.
 */

export const QUESTOES_DE_JAVASCRIPT: Record<string, Question[]> = {
  /* ── Módulo 1 — Do Python para o JavaScript ── */
  'm1-teoria': [
    {
      id: 'JS-M1-Q1', type: 'multiple_choice',
      prompt: 'O que quer dizer que o JavaScript tem tipagem dinâmica?',
      data: { options: [
        { id: 'a', text: 'O tipo mora no valor, e a variável aceita qualquer um.', correct: true },
        { id: 'b', text: 'Cada variável recebe um tipo fixo na hora em que é declarada.', porque: 'Isso é tipagem estática, a de linguagens como Java. Aqui a mesma variável pode guardar um número e, depois, um texto.' },
        { id: 'c', text: 'O programa troca de tipo sozinho conforme a velocidade do computador.', porque: 'Velocidade não tem nada a ver com tipo. O que muda o tipo de uma variável é o valor que se põe nela.' },
        { id: 'd', text: 'Os tipos só existem enquanto o programa está sendo escrito no editor.', porque: 'O tipo existe durante a execução, tanto que typeof o pergunta com o programa rodando.' },
      ]},
      explanation: 'O Python é assim também. O preço da liberdade é a conversão automática, que é onde os enganos desta vereda começam.',
    },
    {
      id: 'JS-M1-Q2', type: 'scenario',
      prompt: 'Um programa lê duas idades de um formulário, 10 e 15, e soma com +. O terminal mostra 1015. O que aconteceu?',
      data: { scenarios: [
        { id: 'a', text: 'As idades chegaram como texto, e o + juntou os dois.', correct: true },
        { id: 'b', text: 'O + do JavaScript sempre junta, e para somar existe outro sinal.', porque: 'Com dois números, o + soma: 10 + 15 dá 25. Ele só junta quando um dos lados é texto.' },
        { id: 'c', text: 'O console.log escreveu os dois números lado a lado sem espaço.', porque: 'O console.log separa os argumentos por espaço. 1015 é um valor só: o texto que o + produziu.' },
        { id: 'd', text: 'A variável foi declarada com const, e const não aceita soma.', porque: 'const impede dar outro valor ao nome, e não impede contas. A soma em si foi feita — de texto.' },
      ]},
      explanation: 'Valor que vem de formulário ou de arquivo de texto chega como texto. Number() converte antes da conta, e a soma volta a ser soma.',
    },
    {
      id: 'JS-M1-Q3', type: 'multiple_choice',
      prompt: 'No JavaScript, o que marca as linhas que ficam dentro de um if?',
      data: { options: [
        { id: 'a', text: 'O par de chaves.', correct: true },
        { id: 'b', text: 'O recuo, como no Python.', porque: 'O recuo aqui é só cortesia para quem lê. Uma linha recuada fora das chaves roda de qualquer jeito.' },
        { id: 'c', text: 'Os dois-pontos depois da condição.', porque: 'Não há dois-pontos depois do if em JavaScript. A condição vai entre parênteses, e o bloco entre chaves.' },
        { id: 'd', text: 'O ponto e vírgula no fim de cada linha de dentro.', porque: 'O ponto e vírgula encerra uma instrução, e toda linha do programa o pode ter, dentro ou fora do if.' },
      ]},
      explanation: 'É a primeira das três diferenças: no Python o bloco é o recuo; aqui são as chaves.',
    },
    {
      id: 'JS-M1-Q4', type: 'scenario',
      prompt: 'Uma condição compara a idade digitada, "12", com o número 12. Com == ela entra; com === não entra. Qual é a forma certa de escrever?',
      data: { scenarios: [
        { id: 'a', text: 'Converter com Number e comparar com ===.', correct: true },
        { id: 'b', text: 'Manter o ==, já que com ele a condição funcionou.', porque: 'Funcionou por conversão automática, a mesma que faz "" == 0 dar true. O próximo valor estranho entra pelo mesmo buraco.' },
        { id: 'c', text: 'Trocar o número 12 pelo texto "12" do outro lado.', porque: 'Compara os dois como texto, e "12" deixa de ser maior que "9", porque texto se compara letra a letra.' },
        { id: 'd', text: 'Usar = no lugar dos dois, que é a igualdade mais simples.', porque: 'Um sinal só é atribuição, e não comparação: a condição passaria a guardar 12 na variável.' },
      ]},
      explanation: 'O === compara sem converter. Quando os tipos são diferentes de propósito, converta antes e deixe escrito o que se quis.',
    },
    {
      id: 'JS-M1-Q5', type: 'true_false',
      prompt: 'No JavaScript, número inteiro e número com vírgula são tipos diferentes, como int e float no Python.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Os dois são do mesmo tipo, number. typeof 12 e typeof 12.5 respondem a mesma palavra.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Há um tipo só para números, e é por isso que 10 / 4 dá 2.5 sem precisar de conversão nenhuma.',
    },
    {
      id: 'JS-M1-Q6', type: 'true_false',
      prompt: 'Com o Node instalado, node programa.js no terminal executa o arquivo fora do navegador.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'O Node existe justamente para isso: rodar JavaScript fora de qualquer página, como o python roda um .py.' },
      ]},
      explanation: 'É o caminho de toda esta vereda, e o requisito 7 pede exatamente isso: um programa executado fora do navegador.',
    },
    {
      id: 'JS-M1-Q7', type: 'matching',
      prompt: 'Ligue cada coisa do Python ao que faz o mesmo papel no JavaScript.',
      data: { pairs: [
        { left: 'print("oi")', right: 'console.log("oi")' },
        { left: 'True', right: 'true' },
        { left: 'None', right: 'null' },
        { left: 'and', right: '&&' },
        { left: '# comentário', right: '// comentário' },
      ]},
      explanation: 'São as diferenças miúdas do caminho. As grandes — chaves, declaração e igualdade — mudam o jeito de ler o programa; estas só mudam a grafia.',
    },
  ],

  /* ── Módulo 2 — let, const e o escopo ── */
  'm2-teoria': [
    {
      id: 'JS-M2-Q1', type: 'multiple_choice',
      prompt: 'O que é o escopo de uma variável?',
      data: { options: [
        { id: 'a', text: 'O trecho do programa onde o nome existe.', correct: true },
        { id: 'b', text: 'O tipo de valor que a variável está autorizada a guardar.', porque: 'Isso é tipo, e o JavaScript nem fixa tipo na variável. Escopo diz onde, e não o quê.' },
        { id: 'c', text: 'O tempo que o valor leva para ser gravado na memória.', porque: 'Escopo não é medida de tempo. É o pedaço do texto do programa em que o nome pode ser usado.' },
        { id: 'd', text: 'A lista de todas as variáveis declaradas no arquivo.', porque: 'Uma lista não diz onde cada uma vale. Duas variáveis com o mesmo nome podem existir em escopos diferentes.' },
      ]},
      explanation: 'Com let e const, o escopo é o bloco: as chaves onde o nome foi declarado, e tudo o que está dentro delas.',
    },
    {
      id: 'JS-M2-Q2', type: 'scenario',
      prompt: 'O programa para com TypeError: Assignment to constant variable, na linha total = total + 10. O que deve mudar?',
      data: { scenarios: [
        { id: 'a', text: 'Declarar total com let.', correct: true },
        { id: 'b', text: 'Apagar a declaração e deixar só a soma.', porque: 'Sem declaração, o nome total não existe, e o erro passa a ser ReferenceError na mesma linha.' },
        { id: 'c', text: 'Trocar o + por += na mesma linha.', porque: 'total += 10 também dá outro valor ao nome. Continua sendo atribuição, e a const continua recusando.' },
        { id: 'd', text: 'Declarar total de novo com const logo antes.', porque: 'Declarar o mesmo nome duas vezes no mesmo bloco é SyntaxError, e o arquivo nem roda.' },
      ]},
      explanation: 'const é para o nome que nunca muda. Um total que cresce é o exemplo de manual do let.',
    },
    {
      id: 'JS-M2-Q3', type: 'multiple_choice',
      prompt: 'const inscritos = ["Ana"]; e depois inscritos.push("Bruno"). O que acontece?',
      data: { options: [
        { id: 'a', text: 'Funciona: o arranjo é o mesmo, maior.', correct: true },
        { id: 'b', text: 'Dá TypeError, porque const não deixa mudar nada no arranjo.', porque: 'const prende o nome ao arranjo, e não congela o arranjo. Dá erro apontar o nome para outro arranjo.' },
        { id: 'c', text: 'Cria uma segunda variável inscritos, com os dois nomes.', porque: 'push não cria variável nenhuma: ele aumenta o arranjo que já existe.' },
        { id: 'd', text: 'Ignora o push em silêncio e mantém só a Ana.', porque: 'Nada é ignorado. O arranjo passa a ter dois itens, e length passa a dizer 2.' },
      ]},
      explanation: 'É por isso que quase toda lista e todo objeto nascem com const: mudam por dentro o tempo todo, e o nome nunca precisa apontar para outro lugar.',
    },
    {
      id: 'JS-M2-Q4', type: 'scenario',
      prompt: 'Um laço com var i agenda três setTimeout que escrevem i. O terminal mostra 3, 3 e 3. Por quê?',
      data: { scenarios: [
        { id: 'a', text: 'Há um i só, e ele já chegou ao fim.', correct: true },
        { id: 'b', text: 'O setTimeout arredonda os números para o maior valor do laço.', porque: 'setTimeout não mexe em número nenhum. Ele só adia a função, e a função lê o i de quando roda.' },
        { id: 'c', text: 'O laço rodou três vezes a mesma volta, por causa do i++.', porque: 'As três voltas aconteceram, com 0, 1 e 2. O que se escreveu depois foi o valor final do único i.' },
        { id: 'd', text: 'O console.log sempre mostra o último valor de uma variável.', porque: 'Ele mostra o valor de quando é chamado. Com let, cada volta tem o próprio i, e sai 0, 1 e 2.' },
      ]},
      explanation: 'O var ignora o bloco: o laço inteiro divide um i. Com let, cada volta ganha o seu, e é essa a diferença que o var esconde.',
    },
    {
      id: 'JS-M2-Q5', type: 'true_false',
      prompt: 'Uma variável declarada com let dentro de um if continua existindo depois que o if termina.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Ela some ao fechar as chaves. Lida depois, dá ReferenceError — que é o contrário do que acontece no Python.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O escopo do let é o bloco. Quem vem do Python costuma descobrir isso pelo ReferenceError.',
    },
    {
      id: 'JS-M2-Q6', type: 'true_false',
      prompt: 'Um var declarado dentro de um if, com o mesmo nome de outro de fora, reescreve o de fora.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'O var não respeita o bloco: o de dentro é o mesmo de fora, e a troca de valor vale depois do if.' },
      ]},
      explanation: 'Com const ou let no lugar, o de dentro seria outro nome, e o de fora voltaria intacto quando o bloco fechasse.',
    },
    {
      id: 'JS-M2-Q7', type: 'ordering',
      prompt: 'Ordene o que acontece com const titulo = "A" fora e const titulo = "B" dentro de um if que entra.',
      data: { items: [
        { id: 'a', text: 'O titulo de fora passa a valer A', order: 1 },
        { id: 'b', text: 'Dentro das chaves nasce outro titulo, valendo B', order: 2 },
        { id: 'c', text: 'As chaves fecham e o titulo de dentro some', order: 3 },
        { id: 'd', text: 'Depois do if, titulo volta a valer A', order: 4 },
      ]},
      explanation: 'O de dentro não estraga o de fora. É o comportamento que o var não tem.',
    },
  ],

  /* ── Módulo 3 — Decidir e repetir ── */
  'm3-teoria': [
    {
      id: 'JS-M3-Q1', type: 'multiple_choice',
      prompt: 'Qual destes valores conta como verdadeiro numa condição?',
      data: { options: [
        { id: 'a', text: 'Um arranjo vazio, [].', correct: true },
        { id: 'b', text: 'O número 0.', porque: 'O zero está entre os seis valores que contam como falso, junto de "", null, undefined, NaN e false.' },
        { id: 'c', text: 'O texto vazio, "".', porque: 'Texto vazio conta como falso. Qualquer texto com pelo menos um caractere conta como verdadeiro.' },
        { id: 'd', text: 'O valor undefined.', porque: 'undefined conta como falso, e é por isso que if (pessoa.telefone) pula quem não tem telefone.' },
      ]},
      explanation: 'No Python a lista vazia é falsa; aqui o arranjo vazio é verdadeiro. Para saber se há alguém, pergunte pelo length.',
    },
    {
      id: 'JS-M3-Q2', type: 'scenario',
      prompt: 'O programa deveria avisar quando não há inscritos, com if (inscritos) do lado do "tem gente". Mesmo com o arranjo vazio, ele diz que tem gente. O que corrigir?',
      data: { scenarios: [
        { id: 'a', text: 'Perguntar se inscritos.length é maior que 0.', correct: true },
        { id: 'b', text: 'Trocar o if por um while, que repete até achar alguém.', porque: 'O while repetiria a pergunta errada para sempre. O problema é o que a condição pergunta, e não quantas vezes.' },
        { id: 'c', text: 'Declarar inscritos com let em vez de const.', porque: 'A palavra da declaração não muda o que o arranjo vale numa condição. Vazio continua contando como verdadeiro.' },
        { id: 'd', text: 'Escrever if (inscritos == true) para forçar a comparação.', porque: 'O == converte de um jeito que ninguém adivinha. A pergunta certa é sobre o tamanho do arranjo.' },
      ]},
      explanation: 'Arranjo vazio conta como verdadeiro. A pergunta "tem alguém?" se faz pelo tamanho.',
    },
    {
      id: 'JS-M3-Q3', type: 'multiple_choice',
      prompt: 'O que for (const u in ["Águia", "Falcão"]) entrega em u?',
      data: { options: [
        { id: 'a', text: 'As posições, "0" e "1", como texto.', correct: true },
        { id: 'b', text: 'Os nomes das unidades, um de cada vez.', porque: 'Quem entrega os itens é o for...of. O for...in entrega as posições — e é o in que o Python usa para os itens.' },
        { id: 'c', text: 'O arranjo inteiro, duas vezes seguidas.', porque: 'O laço dá uma volta por posição, e em cada uma entrega só a posição da vez.' },
        { id: 'd', text: 'Um erro, porque for...in não aceita arranjo.', porque: 'Ele aceita, e é isso que o torna perigoso: não reclama de nada e entrega o que não se esperava.' },
      ]},
      explanation: 'for...in é para as chaves de um objeto. Para os itens de um arranjo, é for...of.',
    },
    {
      id: 'JS-M3-Q4', type: 'scenario',
      prompt: 'Um laço while (tentativas < 3) não termina nunca, e o laboratório o encerra depois de cinco segundos. O que procurar?',
      data: { scenarios: [
        { id: 'a', text: 'A linha que deveria aumentar tentativas.', correct: true },
        { id: 'b', text: 'Um ponto e vírgula a menos no fim do while.', porque: 'Faltar ponto e vírgula não faz o laço girar sem fim. O que o mantém girando é a condição que nunca fica falsa.' },
        { id: 'c', text: 'O número 3, que precisa ser trocado por um maior.', porque: 'Com um número maior o laço continuaria sem fim. Se tentativas nunca muda, nenhum limite é alcançado.' },
        { id: 'd', text: 'Um else que falta depois das chaves do while.', porque: 'while não tem else. O laço termina quando a condição fica falsa, e para isso algo lá dentro precisa mudar.' },
      ]},
      explanation: 'Algo dentro do laço precisa mudar o que a condição testa. Sem isso ela vale para sempre.',
    },
    {
      id: 'JS-M3-Q5', type: 'true_false',
      prompt: 'Numa cadeia de if e else if, quando duas condições valem, as duas têm o bloco executado.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'A primeira que vale ganha, e as de baixo nem são olhadas. É por isso que a ordem importa.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Se as condições se sobrepõem, a mais específica vem primeiro.',
    },
    {
      id: 'JS-M3-Q6', type: 'true_false',
      prompt: 'Em for (let i = 0; i < 3; i++), a condição é conferida antes de cada volta, inclusive a primeira.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'É conferida antes, sempre. Se começasse falsa, o laço terminaria sem dar volta nenhuma.' },
      ]},
      explanation: 'Começo, condição e passo: a condição vem antes de cada volta, e o passo depois.',
    },
    {
      id: 'JS-M3-Q7', type: 'matching',
      prompt: 'Ligue cada situação ao laço que a resolve.',
      data: { pairs: [
        { left: 'Passar por cada inscrito da lista', right: 'for...of' },
        { left: 'Contar de 1 a 10', right: 'for com i++' },
        { left: 'Repetir até a pessoa acertar a senha', right: 'while' },
        { left: 'Ver as chaves de um objeto', right: 'for...in' },
      ]},
      explanation: 'O for clássico conta, o for...of percorre, o while repete sem saber quantas vezes, e o for...in é das chaves.',
    },
  ],

  /* ── Módulo 4 — Funções ── */
  'm4-teoria': [
    {
      id: 'JS-M4-Q1', type: 'multiple_choice',
      prompt: 'O que é uma função anônima?',
      data: { options: [
        { id: 'a', text: 'Uma função sem nome, escrita onde vai ser usada.', correct: true },
        { id: 'b', text: 'Uma função que ninguém consegue chamar de jeito nenhum.', porque: 'Ela é chamada, sim — por quem a recebeu, como o setTimeout chama a função que recebeu.' },
        { id: 'c', text: 'Uma função escondida em outro arquivo do projeto.', porque: 'Estar noutro arquivo não tira o nome de ninguém. Anônima é a que nunca ganhou nome.' },
        { id: 'd', text: 'Uma função que não recebe parâmetro nenhum.', porque: 'Ter ou não parâmetro é outra coisa. Uma função anônima pode receber quantos quiser.' },
      ]},
      explanation: 'Quase sempre ela vai como argumento de outra função, que a chama na hora certa.',
    },
    {
      id: 'JS-M4-Q2', type: 'scenario',
      prompt: 'precoDoPedido(2) devolve NaN, e precoDoPedido(2, 1) devolve 16. Nenhum erro aparece. O que explica?',
      data: { scenarios: [
        { id: 'a', text: 'O parâmetro que faltou vale undefined.', correct: true },
        { id: 'b', text: 'A função tem um erro de conta que só aparece com um argumento.', porque: 'A conta é a mesma nas duas chamadas. O que muda é que, numa delas, um dos valores não chegou.' },
        { id: 'c', text: 'O JavaScript recusa a chamada e devolve NaN como aviso.', porque: 'Ele não recusa: chama a função com o que veio. NaN é o resultado da conta com undefined.' },
        { id: 'd', text: 'A função precisa de return dentro de um if para cada caso.', porque: 'O return está lá, e devolve a conta. A conta é que recebeu um valor vazio.' },
      ]},
      explanation: 'O Python recusaria a chamada. O JavaScript preenche o que faltou com undefined, e a conta com ele dá NaN.',
    },
    {
      id: 'JS-M4-Q3', type: 'multiple_choice',
      prompt: 'O que const dobro = n => { n * 2 } devolve quando chamada com 5?',
      data: { options: [
        { id: 'a', text: 'undefined', correct: true },
        { id: 'b', text: '10', porque: 'Com chaves, o corpo vira bloco e precisa de return. A conta é feita e jogada fora.' },
        { id: 'c', text: 'NaN', porque: 'A conta dá 10, sem problema nenhum. O que falta é devolvê-la.' },
        { id: 'd', text: 'Um SyntaxError, e o arquivo não roda', porque: 'A sintaxe é válida: é uma seta com bloco. Ela só não devolve nada.' },
      ]},
      explanation: 'Sem chaves, n => n * 2 devolve a conta. Com chaves, o return volta a ser obrigatório.',
    },
    {
      id: 'JS-M4-Q4', type: 'scenario',
      prompt: 'Alguém escreveu setTimeout(avisar(), 1000), e o aviso aparece na hora, sem esperar. O que mudar?',
      data: { scenarios: [
        { id: 'a', text: 'Passar avisar, sem os parênteses.', correct: true },
        { id: 'b', text: 'Aumentar o tempo de 1000 para 10000.', porque: 'O aviso continuaria saindo na hora. Com parênteses, avisar roda antes mesmo de o setTimeout ser chamado.' },
        { id: 'c', text: 'Declarar avisar com function em vez de seta.', porque: 'O jeito de escrever a função não importa aqui. O que importa é mandar a função, e não o resultado dela.' },
        { id: 'd', text: 'Pôr a chamada dentro de um if que confere o tempo.', porque: 'Não há tempo a conferir. O setTimeout só espera a função que recebe, e recebeu outra coisa.' },
      ]},
      explanation: 'avisar é a função; avisar() é o que ela devolve. O setTimeout precisa da primeira.',
    },
    {
      id: 'JS-M4-Q5', type: 'true_false',
      prompt: 'Escrever function saudar() { ... } já executa o que está dentro das chaves.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Declarar só ensina o que o nome significa. Quem executa é a chamada, saudar(), em algum lugar.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Como no Python: definir e chamar são dois momentos.',
    },
    {
      id: 'JS-M4-Q6', type: 'true_false',
      prompt: 'Uma função pode ser guardada numa variável e passada como argumento para outra função.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Em JavaScript a função é um valor como um número: cabe numa variável e vai como argumento.' },
      ]},
      explanation: 'É o que map, filter, reduce e setTimeout esperam receber.',
    },
    {
      id: 'JS-M4-Q7', type: 'matching',
      prompt: 'Ligue cada forma de escrever ao que ela é.',
      data: { pairs: [
        { left: 'function somar(a, b) { return a + b; }', right: 'Função declarada com nome' },
        { left: 'const somar = (a, b) => a + b;', right: 'Seta guardada numa const' },
        { left: 'setTimeout(() => avisar(), 500)', right: 'Seta anônima como argumento' },
        { left: 'somar(2, 3)', right: 'Chamada da função' },
      ]},
      explanation: 'Os três primeiros criam funções; só o último executa alguma coisa.',
    },
  ],

  /* ── Módulo 5 — Arranjos ── */
  'm5-teoria': [
    {
      id: 'JS-M5-Q1', type: 'multiple_choice',
      prompt: 'O que é um arranjo em JavaScript?',
      data: { options: [
        { id: 'a', text: 'Uma lista de valores em ordem, contada do zero.', correct: true },
        { id: 'b', text: 'Um conjunto de valores com nome, entre chaves.', porque: 'Isso é objeto. O arranjo vai entre colchetes, e cada item é achado pela posição.' },
        { id: 'c', text: 'Um texto que guarda vários nomes separados por vírgula.', porque: 'Texto é um valor só. O arranjo guarda itens separados, que se leem e se trocam um a um.' },
        { id: 'd', text: 'Uma função que organiza valores em ordem alfabética.', porque: 'Arranjo é dado, e não função. Ordenar é o que o método sort faz com ele.' },
      ]},
      explanation: 'É a lista do Python. Em inglês, array.',
    },
    {
      id: 'JS-M5-Q2', type: 'scenario',
      prompt: 'Um programa soma as inscrições pagas com reduce sem valor inicial. Num dia em que ninguém pagou, ele para com TypeError. Por quê?',
      data: { scenarios: [
        { id: 'a', text: 'Arranjo vazio sem valor inicial não tem de onde começar.', correct: true },
        { id: 'b', text: 'O filter devolveu undefined quando ninguém passou.', porque: 'filter nunca devolve undefined: quando ninguém passa, ele devolve um arranjo vazio.' },
        { id: 'c', text: 'O reduce só funciona com arranjos de pelo menos dois itens.', porque: 'Com um item, ou com nenhum e um valor inicial, ele funciona. O problema é a combinação de vazio e sem inicial.' },
        { id: 'd', text: 'A soma de zero itens é NaN, e NaN vira TypeError.', porque: 'NaN não vira erro nenhum. Quem para o programa é o reduce, por não ter o primeiro acumulado.' },
      ]},
      explanation: 'Com o valor inicial, o reduce de um arranjo vazio devolve o próprio inicial: 0, que é a resposta certa.',
    },
    {
      id: 'JS-M5-Q3', type: 'multiple_choice',
      prompt: 'Qual chamada devolve um arranjo do mesmo tamanho, com cada preço dobrado?',
      data: { options: [
        { id: 'a', text: 'precos.map(p => p * 2)', correct: true },
        { id: 'b', text: 'precos.filter(p => p * 2)', porque: 'filter usa o resultado como verdadeiro ou falso. Todo preço diferente de zero passaria, sem dobrar.' },
        { id: 'c', text: 'precos.reduce((s, p) => s + p * 2, 0)', porque: 'reduce junta tudo num valor só: daria o dobro do total, e não um arranjo.' },
        { id: 'd', text: 'precos.push(p * 2)', porque: 'push acrescenta um item no fim do mesmo arranjo, e p nem existe fora de uma função.' },
      ]},
      explanation: 'map transforma cada um; filter escolhe alguns; reduce junta todos.',
    },
    {
      id: 'JS-M5-Q4', type: 'scenario',
      prompt: 'O programa lê nomes[5] num arranjo de três nomes. Não aparece erro, e o relatório sai com a palavra undefined. O que aconteceu?',
      data: { scenarios: [
        { id: 'a', text: 'A posição não existe, e ler ela dá undefined.', correct: true },
        { id: 'b', text: 'O arranjo cresceu sozinho até a posição 5, com itens vazios.', porque: 'Ler não cria nada. O arranjo continua com três itens; só a leitura veio vazia.' },
        { id: 'c', text: 'O terceiro nome foi apagado e trocado por undefined.', porque: 'Nenhum nome foi mexido. A leitura foi feita numa posição que nunca teve nome nenhum.' },
        { id: 'd', text: 'O console.log não consegue mostrar nomes com acento.', porque: 'Acento não é o problema: o valor lido é que não existia.' },
      ]},
      explanation: 'O Python responderia IndexError. O JavaScript responde undefined, e o programa segue com ele.',
    },
    {
      id: 'JS-M5-Q5', type: 'true_false',
      prompt: 'Chamar map num arranjo muda os itens do próprio arranjo original.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'map devolve um arranjo novo. O original continua como estava, e é por isso que o resultado precisa ser guardado.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'map, filter e reduce não mexem no arranjo de onde partem.',
    },
    {
      id: 'JS-M5-Q6', type: 'true_false',
      prompt: 'Quando nenhum item passa no teste, filter devolve um arranjo vazio, e não um erro.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Ninguém passar é uma resposta possível, e ela vem como arranjo vazio, sem erro nenhum.' },
      ]},
      explanation: 'É o arranjo vazio que, depois, pede o valor inicial do reduce.',
    },
    {
      id: 'JS-M5-Q7', type: 'ordering',
      prompt: 'Ordene os passos de inscricoes.filter(i => i.pagou).map(i => i.nome).join(", ").',
      data: { items: [
        { id: 'a', text: 'Escolher só as inscrições pagas', order: 1 },
        { id: 'b', text: 'Transformar cada inscrição paga no nome dela', order: 2 },
        { id: 'c', text: 'Juntar os nomes num texto, com vírgula', order: 3 },
        { id: 'd', text: 'Entregar o texto pronto a quem pediu', order: 4 },
      ]},
      explanation: 'Cada passo recebe o que o anterior entregou. Lido em voz alta, o encadeamento diz o que o programa faz.',
    },
  ],

  /* ── Módulo 6 — Objetos ── */
  'm6-teoria': [
    {
      id: 'JS-M6-Q1', type: 'multiple_choice',
      prompt: 'O que é um objeto em JavaScript?',
      data: { options: [
        { id: 'a', text: 'Um conjunto de valores com nome, entre chaves.', correct: true },
        { id: 'b', text: 'Uma lista de valores em ordem, achados pela posição.', porque: 'Isso é arranjo. No objeto, cada valor é achado pelo nome da propriedade.' },
        { id: 'c', text: 'Qualquer valor do programa que não seja número.', porque: 'Texto e true também não são número e não são objeto. Objeto é o conjunto de propriedades.' },
        { id: 'd', text: 'Um arquivo JSON que o programa abriu do disco.', porque: 'JSON é texto. Ele vira objeto só depois de passar pelo JSON.parse.' },
      ]},
      explanation: 'É o dicionário do Python, com o nome da propriedade sem aspas e a leitura com ponto.',
    },
    {
      id: 'JS-M6-Q2', type: 'scenario',
      prompt: 'const copia = ana; e depois copia.pagou = true. Ao imprimir ana.pagou, sai true. Por quê?',
      data: { scenarios: [
        { id: 'a', text: 'Os dois nomes apontam para o mesmo objeto.', correct: true },
        { id: 'b', text: 'O const copia a mudança para as outras variáveis.', porque: 'const não copia nada. O igual não cria objeto novo: faz copia apontar para o objeto que ana já apontava.' },
        { id: 'c', text: 'A propriedade pagou é global e vale para todo objeto.', porque: 'Propriedade é de um objeto. Outro objeto com pagou continuaria com o dele.' },
        { id: 'd', text: 'O console.log mostra a última atribuição do programa.', porque: 'Ele mostra o valor do objeto, e o objeto é um só — mudou pelos dois nomes.' },
      ]},
      explanation: 'Para ter uma cópia de verdade: const copia = { ...ana }.',
    },
    {
      id: 'JS-M6-Q3', type: 'multiple_choice',
      prompt: 'Dentro do método resumo() de um objeto, o que é this?',
      data: { options: [
        { id: 'a', text: 'O objeto que chamou o método.', correct: true },
        { id: 'b', text: 'O próprio método, para ele chamar a si mesmo.', porque: 'this é o objeto, e não a função. É por ele que se lê this.nome.' },
        { id: 'c', text: 'O arquivo onde o objeto foi escrito.', porque: 'Arquivo não é valor dentro do programa. this aponta para quem está na frente do ponto na chamada.' },
        { id: 'd', text: 'A primeira propriedade declarada no objeto.', porque: 'this é o objeto inteiro. A primeira propriedade se lê como this.algumaCoisa.' },
      ]},
      explanation: 'Em unidade.resumo(), o this é unidade. É o self do Python, sem aparecer nos parâmetros.',
    },
    {
      id: 'JS-M6-Q4', type: 'scenario',
      prompt: 'Um método escrito como resumo: () => this.nome devolve undefined, ou para o programa com TypeError. O que mudar?',
      data: { scenarios: [
        { id: 'a', text: 'Escrever o método como resumo() { ... }.', correct: true },
        { id: 'b', text: 'Trocar this.nome por nome, sem o this.', porque: 'nome sozinho procura uma variável, e não a propriedade. A variável não existe, e o erro passa a ser ReferenceError.' },
        { id: 'c', text: 'Declarar o objeto com let em vez de const.', porque: 'A declaração do objeto não muda o this da seta. A seta continua lendo o this de fora.' },
        { id: 'd', text: 'Pôr a propriedade nome depois do método no objeto.', porque: 'A ordem das propriedades não importa. A seta não tem this próprio em lugar nenhum do objeto.' },
      ]},
      explanation: 'A seta usa o this do lugar onde foi escrita. Método se escreve com a forma longa.',
    },
    {
      id: 'JS-M6-Q5', type: 'true_false',
      prompt: 'Ler uma propriedade que não existe num objeto para o programa com erro, como o KeyError do Python.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Ler propriedade que não existe devolve undefined, sem erro. O erro vem ao ler uma propriedade de undefined.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Cannot read properties of undefined é o erro do passo seguinte: quando se tenta ir mais fundo no que não existia.',
    },
    {
      id: 'JS-M6-Q6', type: 'true_false',
      prompt: 'Atribuir valor a uma propriedade que ainda não existe cria essa propriedade no objeto.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'pessoa.pagou = true cria a propriedade quando ela falta, e troca o valor quando ela já existe.' },
      ]},
      explanation: 'É assim que um objeto ganha propriedades depois de criado.',
    },
    {
      id: 'JS-M6-Q7', type: 'matching',
      prompt: 'Ligue cada trecho ao que ele faz.',
      data: { pairs: [
        { left: 'pessoa.nome', right: 'Lê a propriedade nome' },
        { left: 'pessoa["nome"]', right: 'Lê a mesma propriedade, pelo texto' },
        { left: '{ ...pessoa }', right: 'Faz um objeto novo com as mesmas propriedades' },
        { left: 'unidade.resumo()', right: 'Chama um método do objeto' },
      ]},
      explanation: 'O ponto e os colchetes leem o mesmo; os colchetes servem quando o nome está numa variável.',
    },
  ],

  /* ── Módulo 7 — Assíncrono ── */
  'm7-teoria': [
    {
      id: 'JS-M7-Q1', type: 'multiple_choice',
      prompt: 'O que é execução assíncrona?',
      data: { options: [
        { id: 'a', text: 'O demorado acontece depois, e o resto segue.', correct: true },
        { id: 'b', text: 'O programa executa várias linhas exatamente ao mesmo tempo.', porque: 'O JavaScript executa uma coisa de cada vez. O assíncrono não é fazer junto, é não ficar parado esperando.' },
        { id: 'c', text: 'O programa espera cada tarefa demorada terminar antes de seguir.', porque: 'Isso é o síncrono, justamente o contrário. Esperar parado é o que o assíncrono evita.' },
        { id: 'd', text: 'O programa roda as linhas de baixo para cima.', porque: 'A ordem do arquivo continua valendo. O que muda é que o que depende do demorado roda quando ele termina.' },
      ]},
      explanation: 'A consequência é que a ordem das linhas no arquivo deixa de ser a ordem em que elas acontecem.',
    },
    {
      id: 'JS-M7-Q2', type: 'scenario',
      prompt: 'O terminal mostra Promise { <pending> } onde deveria aparecer o número de inscritos. O que falta?',
      data: { scenarios: [
        { id: 'a', text: 'O await antes da chamada.', correct: true },
        { id: 'b', text: 'Um return dentro da função que busca no servidor.', porque: 'A função devolveu, sim — uma promessa. O que faltou foi esperar ela se cumprir.' },
        { id: 'c', text: 'Converter o resultado com Number antes de mostrar.', porque: 'Number de uma promessa dá NaN. Primeiro é preciso o valor, e o valor sai pelo await.' },
        { id: 'd', text: 'Trocar o console.log por um setTimeout de alguns segundos.', porque: 'Esperar no relógio não muda o que está na variável: ela guarda a promessa, e não o valor.' },
      ]},
      explanation: 'Sem await, a chamada devolve a promessa, ainda pendente. Nada estoura onde o await faltou.',
    },
    {
      id: 'JS-M7-Q3', type: 'multiple_choice',
      prompt: 'Em que estados uma promessa pode estar?',
      data: { options: [
        { id: 'a', text: 'Pendente, cumprida ou rejeitada.', correct: true },
        { id: 'b', text: 'Aberta ou fechada, conforme o arquivo.', porque: 'Promessa não tem a ver com arquivo. Ela representa um resultado que ainda vai chegar, ou falhar.' },
        { id: 'c', text: 'Rápida, lenta ou travada.', porque: 'A demora não é um estado. Uma promessa lenta está pendente até se decidir.' },
        { id: 'd', text: 'Verdadeira ou falsa, como uma condição.', porque: 'Ela pode se cumprir com qualquer valor, ou ser rejeitada com um erro. Não é um booleano.' },
      ]},
      explanation: 'Ela nasce pendente e depois vira cumprida ou rejeitada. Decidida, não muda mais.',
    },
    {
      id: 'JS-M7-Q4', type: 'scenario',
      prompt: 'A busca na internet às vezes falha, e quando falha o programa inteiro para. Qual é o conserto?',
      data: { scenarios: [
        { id: 'a', text: 'try/catch em volta do await.', correct: true },
        { id: 'b', text: 'Tirar o await, para a falha não interromper a linha.', porque: 'Sem await, a rejeição continua sem tratamento e derruba o programa do mesmo jeito, só que depois.' },
        { id: 'c', text: 'Chamar a busca duas vezes seguidas, para uma delas dar certo.', porque: 'Sem tratar a falha, a primeira rejeição já para o programa. Tentar de novo é o que se faz dentro do catch.' },
        { id: 'd', text: 'Declarar a função com function em vez de async.', porque: 'Sem async, o await nem pode ser usado. A falha continuaria sem quem a trate.' },
      ]},
      explanation: 'A rejeição esperada com await vira um erro lançado na linha do await, e o catch o recebe.',
    },
    {
      id: 'JS-M7-Q5', type: 'true_false',
      prompt: 'O await pode ser usado dentro de qualquer função, mesmo sem async.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Fora de função async, o await é SyntaxError e o arquivo nem roda — salvo no topo de um arquivo com import.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O async é o que diz ao JavaScript que aquela função pode esperar.',
    },
    {
      id: 'JS-M7-Q6', type: 'true_false',
      prompt: 'Toda função marcada com async devolve uma promessa, mesmo quando o return devolve um número.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'O número sai embrulhado numa promessa. Quem chama precisa de await para tirá-lo de lá.' },
      ]},
      explanation: 'É por isso que o await se espalha: quem chama uma função async quase sempre também é async.',
    },
    {
      id: 'JS-M7-Q7', type: 'ordering',
      prompt: 'Um programa escreve "A", agenda "B" com setTimeout de 0, e escreve "C". Ordene o que aparece no terminal.',
      data: { items: [
        { id: 'a', text: 'A', order: 1 },
        { id: 'b', text: 'C', order: 2 },
        { id: 'c', text: 'B', order: 3 },
      ]},
      explanation: 'Mesmo com espera zero, o agendado vai para o fim da fila: só roda quando o resto do arquivo terminar.',
    },
  ],

  /* ── Módulo 8 — JSON ── */
  'm8-teoria': [
    {
      id: 'JS-M8-Q1', type: 'multiple_choice',
      prompt: 'O que é JSON?',
      data: { options: [
        { id: 'a', text: 'Um formato de texto para guardar e trocar dados.', correct: true },
        { id: 'b', text: 'Um tipo de banco de dados que só o JavaScript consegue abrir.', porque: 'É texto puro, e qualquer linguagem lê: o mesmo arquivo serve ao Python, à planilha e ao JavaScript.' },
        { id: 'c', text: 'Uma função do JavaScript que organiza objetos na tela.', porque: 'JSON é o formato. As funções são JSON.parse e JSON.stringify, que leem e escrevem nele.' },
        { id: 'd', text: 'Uma versão antiga do JavaScript, que ainda roda no Node.', porque: 'É um formato de dados, e não uma linguagem de programação. Não tem laço nem função.' },
      ]},
      explanation: 'JavaScript Object Notation: parece objeto, e é texto que qualquer programa entende.',
    },
    {
      id: 'JS-M8-Q2', type: 'scenario',
      prompt: 'O programa lê o inscritos.json sem o "utf8" e, ao imprimir, aparece <Buffer 5b 7b 22 ...>. O que aconteceu?',
      data: { scenarios: [
        { id: 'a', text: 'Vieram os bytes crus, sem virar letras.', correct: true },
        { id: 'b', text: 'O arquivo está corrompido e precisa ser exportado de novo.', porque: 'O arquivo está bom. Os números são os bytes dele: 5b é o colchete, 7b é a chave.' },
        { id: 'c', text: 'O JSON.parse transformou o arquivo em números.', porque: 'O parse nem chegou a rodar sobre o texto. O que se imprimiu foi o que o readFileSync devolveu.' },
        { id: 'd', text: 'O Node não consegue ler arquivo com acento.', porque: 'Consegue, com o "utf8" — é ele que diz como transformar os bytes em letras.' },
      ]},
      explanation: 'readFileSync("inscritos.json", "utf8") devolve texto, e é o texto que o JSON.parse espera.',
    },
    {
      id: 'JS-M8-Q3', type: 'multiple_choice',
      prompt: 'Qual destes textos é JSON válido?',
      data: { options: [
        { id: 'a', text: '{"nome": "Ana", "idade": 12}', correct: true },
        { id: 'b', text: "{nome: 'Ana', idade: 12}", porque: 'É um objeto de JavaScript válido, e não é JSON: lá o nome da propriedade e o texto vão entre aspas duplas.' },
        { id: 'c', text: '{"nome": "Ana", "idade": 12,}', porque: 'A vírgula depois do último item é recusada pelo JSON.parse, com SyntaxError.' },
        { id: 'd', text: '{"nome": "Ana", "falar": function () {}}', porque: 'JSON não guarda função. Só texto, número, true, false, null, arranjo e objeto.' },
      ]},
      explanation: 'As regras do JSON são mais duras que as do JavaScript, e é por isso que ele funciona igual em toda linguagem.',
    },
    {
      id: 'JS-M8-Q4', type: 'scenario',
      prompt: 'O programa acrescenta a Helena na lista lida do arquivo e mostra "Inscritos: 6". Ao abrir o inscritos.json, continuam cinco. O que faltou?',
      data: { scenarios: [
        { id: 'a', text: 'Gravar a lista de volta no arquivo.', correct: true },
        { id: 'b', text: 'Fechar o arquivo depois de ler, para liberar a escrita.', porque: 'O readFileSync já lê tudo e solta o arquivo. Não há nada a fechar, e nada foi escrito.' },
        { id: 'c', text: 'Usar push em vez de outro jeito de acrescentar.', porque: 'O acréscimo funcionou, tanto que o terminal mostra 6. Ele só aconteceu na memória.' },
        { id: 'd', text: 'Executar o programa duas vezes, para a mudança aparecer.', porque: 'Cada execução lê o arquivo de novo e muda só a memória. Sem gravar, o arquivo nunca muda.' },
      ]},
      explanation: 'Ler, mudar e gravar: mudar o dado sem gravar é mudar nada.',
    },
    {
      id: 'JS-M8-Q5', type: 'true_false',
      prompt: 'writeFileSync aceita o objeto direto e o transforma em JSON sozinho.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Ele recusa o objeto com TypeError: arquivo só guarda texto, e quem transforma é o JSON.stringify.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'É o melhor dos erros: aparece na linha certa, em vez de gravar alguma coisa estranha.',
    },
    {
      id: 'JS-M8-Q6', type: 'true_false',
      prompt: 'JSON.stringify(dado, null, 2) grava o mesmo dado, com quebras de linha e recuo de dois espaços.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'O terceiro argumento é o recuo. O dado é o mesmo; muda só a forma, que passa a ser legível.' },
      ]},
      explanation: 'Sem ele, sai tudo numa linha: funciona para o programa, e ninguém consegue conferir à mão.',
    },
    {
      id: 'JS-M8-Q7', type: 'ordering',
      prompt: 'Ordene o ciclo de atualizar um arquivo JSON.',
      data: { items: [
        { id: 'a', text: 'Ler o arquivo como texto, com readFileSync', order: 1 },
        { id: 'b', text: 'Transformar o texto em dado, com JSON.parse', order: 2 },
        { id: 'c', text: 'Mudar o dado na memória', order: 3 },
        { id: 'd', text: 'Transformar o dado em texto, com JSON.stringify', order: 4 },
        { id: 'e', text: 'Gravar o texto, com writeFileSync', order: 5 },
      ]},
      explanation: 'Os dois do meio são o trabalho; os das pontas são o que faz ele sobreviver ao fim do programa.',
    },
  ],

  /* ── Módulo 9 — O programa ── */
  'm9-teoria': [
    {
      id: 'JS-M9-Q1', type: 'multiple_choice',
      prompt: 'Qual comando executa programa.js fora do navegador?',
      data: { options: [
        { id: 'a', text: 'node programa.js', correct: true },
        { id: 'b', text: 'python programa.js', porque: 'O Python não lê JavaScript. Quem executa um .js fora do navegador é o Node.' },
        { id: 'c', text: 'open programa.js', porque: 'Abrir o arquivo mostra o texto dele num editor. Executar é com o node.' },
        { id: 'd', text: 'run programa.js', porque: 'Não existe comando run no terminal para isso. O programa que executa é o node.' },
      ]},
      explanation: 'O terminal precisa estar na pasta do programa, ou o caminho do arquivo precisa dizer onde ele está.',
    },
    {
      id: 'JS-M9-Q2', type: 'scenario',
      prompt: 'O programa funciona no laboratório, mas no computador do clube dá ENOENT ao abrir o pontuacao.json, que está ao lado dele. O que verificar?',
      data: { scenarios: [
        { id: 'a', text: 'Se o terminal está na pasta do programa.', correct: true },
        { id: 'b', text: 'Se o computador do clube tem internet para baixar o arquivo.', porque: 'O arquivo está no disco, e não na internet. O caminho dele é contado da pasta onde o terminal está.' },
        { id: 'c', text: 'Se o Node do clube é mais novo do que o do laboratório.', porque: 'Qualquer versão acha um arquivo que está no caminho certo. ENOENT é caminho, e não versão.' },
        { id: 'd', text: 'Se o arquivo JSON tem vírgula sobrando no fim.', porque: 'JSON quebrado dá SyntaxError no parse. ENOENT é antes: o arquivo nem foi achado.' },
      ]},
      explanation: 'readFileSync("pontuacao.json") procura a partir da pasta do terminal. cd até a pasta do programa resolve.',
    },
    {
      id: 'JS-M9-Q3', type: 'multiple_choice',
      prompt: 'Num arquivo com import, qual linha traz a função carregar de dados.js, na mesma pasta?',
      data: { options: [
        { id: 'a', text: 'import { carregar } from "./dados.js";', correct: true },
        { id: 'b', text: 'import { carregar } from "dados";', porque: 'Sem o ./, o Node procura um pacote instalado chamado dados, e não o arquivo da pasta.' },
        { id: 'c', text: 'import { carregar } from "./dados";', porque: 'No import a extensão é obrigatória. Sem ela, o Node responde Cannot find module.' },
        { id: 'd', text: 'const carregar = require("./dados.js");', porque: 'Num arquivo com import, o require não existe e dá ReferenceError.' },
      ]},
      explanation: 'O ./ diz que o arquivo está na mesma pasta, e o .js diz qual arquivo é.',
    },
    {
      id: 'JS-M9-Q4', type: 'scenario',
      prompt: 'Um programa de relatório tem uma função só, de sessenta linhas, que lê o arquivo, soma e escreve na tela. A diretoria quer o mesmo total num segundo relatório. O que resolve?',
      data: { scenarios: [
        { id: 'a', text: 'Separar a soma numa função que só calcula.', correct: true },
        { id: 'b', text: 'Copiar as sessenta linhas para o segundo relatório.', porque: 'Aí a conta passa a existir em dois lugares, e a primeira correção vai ser feita num só.' },
        { id: 'c', text: 'Chamar a função inteira duas vezes seguidas.', porque: 'Ela escreveria o primeiro relatório duas vezes. O que se quer reaproveitar é só a conta.' },
        { id: 'd', text: 'Guardar o total numa variável global no fim da função.', porque: 'A conta continua presa a quem lê e escreve. E variável global que qualquer função muda é difícil de rastrear.' },
      ]},
      explanation: 'Cada função faz uma coisa. A que só calcula serve a qualquer relatório.',
    },
    {
      id: 'JS-M9-Q5', type: 'true_false',
      prompt: 'Num programa rodado pelo Node, document e alert funcionam como no navegador.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Fora do navegador não há página. document, window, alert e prompt não existem, e usá-los dá ReferenceError.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O que é da linguagem funciona nos dois lugares; o que é da página só existe no navegador.',
    },
    {
      id: 'JS-M9-Q6', type: 'true_false',
      prompt: 'require e module.exports são o jeito antigo de trazer e oferecer módulos, e ainda funcionam no Node.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Funcionam, e metade dos exemplos da internet ainda os usa. Só não se misturam com import no mesmo arquivo.' },
      ]},
      explanation: 'O jeito se chama CommonJS. Nesta vereda, o import.',
    },
    {
      id: 'JS-M9-Q7', type: 'matching',
      prompt: 'Ligue cada mensagem do terminal ao que ela costuma querer dizer.',
      data: { pairs: [
        { left: 'ENOENT: no such file or directory', right: 'O arquivo não está onde o programa procurou' },
        { left: 'Cannot find module', right: 'O import aponta para um arquivo que não existe' },
        { left: 'ReferenceError: x is not defined', right: 'Um nome usado sem ter sido declarado' },
        { left: 'SyntaxError', right: 'O arquivo não pôde nem ser lido' },
      ]},
      explanation: 'A última linha diz o tipo do problema; a primeira diz o arquivo e a linha onde ele aconteceu.',
    },
  ],
};
