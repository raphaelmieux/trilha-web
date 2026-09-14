import type { Question } from '../types';

/*
 * As questões das lições de teoria da CC004 Python, Avançado.
 *
 * ── O que elas medem ──────────────────────────────────────────────────────
 * A definição vale uma vez. Depois dela vêm as três que rendem: a
 * consequência ("e daí, o que acontece?"), a discriminação entre o que se
 * confunde — que aqui é quase toda a matéria, porque `return` e `print`,
 * lista e tupla, `dump` e `dumps`, `"w"` e `"a"` são pares que se parecem e
 * fazem coisas diferentes —, e o diagnóstico.
 *
 * ── E por que o diagnóstico pesa mais nesta vereda do que na CC002 ────────
 * Na CC002 o erro para o programa e a lição é ler a mensagem. Aqui a matéria
 * inteira é feita de coisas que **não** param o programa: a função que devolve
 * `None` e vira `TypeError` três linhas depois; o `"w"` que apaga o arquivo
 * antes de escrever; a idade que sai do CSV como texto e é somada como texto;
 * o `except:` pelado que engole o `NameError` de quem digitou um nome errado.
 * Nenhum desses estoura onde nasceu, e é por isso que saber de qual natureza
 * se trata é metade do trabalho de consertar.
 *
 * Toda alternativa errada diz **por que** está errada, no campo `porque`, e a
 * certa não carrega motivo nenhum — é o que `qualidade.test.ts` cobra. E nada
 * de crase nem de asterisco duplo: a questão vai para o `QuestionRenderer`,
 * que imprime texto puro, e a marcação sairia na tela como marcação.
 */

export const QUESTOES_DE_PYTHON_AVANCADO: Record<string, Question[]> = {
  /* ──────────────────────────────────────────────────────────────────────
     Módulo 1 — A função
     ────────────────────────────────────────────────────────────────────── */
  'm1-teoria': [
    {
      id: 'PYA-M1-Q1', type: 'multiple_choice',
      prompt: 'O que é uma função em Python?',
      data: { options: [
        { id: 'a', text: 'Um pedaço do programa com nome, que se executa quantas vezes quiser.', correct: true },
        { id: 'b', text: 'Uma variável que guarda mais de um valor ao mesmo tempo.', porque: 'Isso é uma coleção — lista, tupla, dicionário ou conjunto. Função guarda instruções, e não valores.' },
        { id: 'c', text: 'Uma linha que o Python executa antes de todas as outras.', porque: 'Nada é executado fora de ordem. E a definição de uma função não executa o corpo dela: só dá nome a ele.' },
        { id: 'd', text: 'Um arquivo separado que o programa principal importa.', porque: 'Isso é um módulo. Um módulo pode conter funções, mas uma função cabe inteira dentro do mesmo arquivo.' },
      ]},
      explanation: 'Escrever uma vez e chamar de vários lugares é a razão de ela existir: quando a regra do clube muda, muda-se uma linha em vez de três cópias.',
    },
    {
      id: 'PYA-M1-Q2', type: 'multiple_choice',
      prompt: 'Uma função foi escrita inteira e corretamente, mas o programa roda e não faz nada. Nenhum erro aparece. O que falta?',
      data: { options: [
        { id: 'a', text: 'A chamada.', correct: true },
        { id: 'b', text: 'O return no fim do corpo dela.', porque: 'Função sem return devolve None, e isso não impede nada de acontecer. Se houvesse um print dentro, ele teria aparecido.' },
        { id: 'c', text: 'Registrar a função antes de usá-la, com um comando próprio.', porque: 'Não existe registro nenhum a fazer. O def já é tudo o que o Python precisa para conhecer a função.' },
        { id: 'd', text: 'Um import, porque funções ficam num arquivo separado.', porque: 'Uma função definida no mesmo arquivo não se importa: ela já está ali.' },
      ]},
      explanation: 'Definir e chamar são dois momentos. O def ensina o que o nome significa; quem executa é a linha que escreve o nome com parênteses.',
    },
    {
      id: 'PYA-M1-Q3', type: 'multiple_choice',
      prompt: 'Em def saudar(nome), o que a palavra nome é?',
      data: { options: [
        { id: 'a', text: 'O parâmetro.', correct: true },
        { id: 'b', text: 'O argumento.', porque: 'Argumento é o valor que a chamada manda. Em saudar("Ana"), o argumento é "Ana"; nome é o nome que espera recebê-lo.' },
        { id: 'c', text: 'O retorno da função.', porque: 'O retorno é o que sai da função, pelo return. Este nome é o que entra nela.' },
        { id: 'd', text: 'Uma variável global do programa.', porque: 'Ele só existe dentro da função. Quem tentar lê-lo de fora recebe NameError.' },
      ]},
      explanation: 'Duas palavras para dois lados da mesma porta. Vale saber a diferença porque toda mensagem de erro usa uma delas: "faltou um argumento" acusa a chamada, não a definição.',
    },
    {
      id: 'PYA-M1-Q4', type: 'scenario',
      prompt: 'A função media mostra o número certo na tela quando chamada sozinha. Mas guardar o resultado numa variável e somar 1 a ele estoura com TypeError. O que está errado?',
      data: { scenarios: [
        { id: 'a', text: 'A função usa print em vez de return, e devolve None.', correct: true },
        { id: 'b', text: 'A conta dentro da função está errada e o resultado não é número.', porque: 'Se fosse isso, o número na tela também sairia errado — e ele sai certo.' },
        { id: 'c', text: 'Falta converter o resultado com int() antes de somar.', porque: 'Converter None não resolve: int(None) dá o mesmo TypeError. O que falta é ter algo para converter.' },
        { id: 'd', text: 'A variável precisa ser declarada antes de receber o retorno.', porque: 'Python não pede declaração. A variável recebe o que a função devolveu, e o problema é que ela não devolveu nada.' },
      ]},
      explanation: 'print mostra e não devolve; return devolve e não mostra. É o engano mais comum daqui, e ele só aparece na linha seguinte, que é o que o torna difícil de achar.',
    },
    {
      id: 'PYA-M1-Q5', type: 'true_false',
      prompt: 'Numa definição, os parâmetros com valor padrão podem vir antes dos que não têm padrão.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'É erro de sintaxe, e o Python recusa o arquivo. Ele não teria como saber qual valor você quis pular numa chamada mais curta.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Os sem padrão primeiro, sempre. A regra existe para a chamada ser legível: os valores que chegam preenchem os parâmetros na ordem, e um buraco no meio não teria como ser interpretado.',
    },
    {
      id: 'PYA-M1-Q6', type: 'scenario',
      prompt: 'Uma função guarda o total numa variável e não devolve nada. Depois dela, o programa tenta imprimir esse total e recebe NameError. Qual é o caminho para o valor sair de dentro?',
      data: { scenarios: [
        { id: 'a', text: 'Devolver o valor com return e guardá-lo em quem chamou.', correct: true },
        { id: 'b', text: 'Imprimir a variável de dentro da própria função.', porque: 'Isso mostra o número, mas não o entrega a ninguém. A linha de fora continua sem ter o que imprimir.' },
        { id: 'c', text: 'Repetir a mesma conta fora da função, para os dois valores baterem.', porque: 'Aí a conta existe em dois lugares — que é exatamente o que a função foi criada para desfazer.' },
        { id: 'd', text: 'Declarar a variável como global dentro da função.', porque: 'Funciona e é a resposta errada: uma variável que qualquer função muda é uma variável cujo valor errado ninguém consegue rastrear.' },
      ]},
      explanation: 'O escopo é a favor, e não contra: ele é o que permite duas funções usarem total para coisas diferentes. A porta de dentro para fora é o return, e ela diz de onde o valor veio.',
    },
    {
      id: 'PYA-M1-Q7', type: 'ordering',
      prompt: 'Ordene o que o Python faz ao encontrar a chamada saudar("Ana").',
      data: { items: [
        { id: 'a', text: 'Procura o nome saudar entre os que já conhece', order: 1 },
        { id: 'b', text: 'Preenche o parâmetro com o argumento "Ana"', order: 2 },
        { id: 'c', text: 'Executa as linhas do corpo da função', order: 3 },
        { id: 'd', text: 'Devolve um valor e apaga as variáveis locais', order: 4 },
      ]},
      explanation: 'O último passo é o que explica o escopo: as variáveis criadas lá dentro acabam quando a função termina, e é por isso que ler uma delas de fora dá NameError.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 2 — As quatro coleções
     ────────────────────────────────────────────────────────────────────── */
  'm2-teoria': [
    {
      id: 'PYA-M2-Q1', type: 'matching',
      prompt: 'Ligue cada coleção ao que ela garante.',
      data: { pairs: [
        { left: 'Lista', right: 'Tem ordem, aceita repetidos e pode mudar' },
        { left: 'Tupla', right: 'Tem ordem e não muda depois de criada' },
        { left: 'Dicionário', right: 'Acha o valor por um rótulo, e não por posição' },
        { left: 'Conjunto', right: 'Não tem ordem e não guarda repetidos' },
      ]},
      explanation: 'As quatro guardam vários valores; o que muda é a garantia de cada uma. Escolher é escolher a garantia de que você precisa.',
    },
    {
      id: 'PYA-M2-Q2', type: 'multiple_choice',
      prompt: 'Numa lista de três nomes, o que acontece ao pedir o item de índice 3?',
      data: { options: [
        { id: 'a', text: 'Dá IndexError.', correct: true },
        { id: 'b', text: 'Devolve o terceiro nome da lista.', porque: 'O terceiro está no índice 2. As posições começam em zero, então a última é sempre o tamanho menos um.' },
        { id: 'c', text: 'Devolve None, porque não há nada ali.', porque: 'Lista não inventa vazio para posição que não existe: ela acusa. Quem devolve padrão em vez de erro é o .get() do dicionário.' },
        { id: 'd', text: 'A lista cresce sozinha até caber o índice pedido.', porque: 'Ler nunca faz a lista crescer. Quem acrescenta é o append, e ele põe no fim.' },
      ]},
      explanation: 'Contar quantos são para achar o último é a origem do erro. O jeito seguro é o índice negativo: o último item é sempre o de posição -1.',
    },
    {
      id: 'PYA-M2-Q3', type: 'multiple_choice',
      prompt: 'Você precisa guardar a latitude e a longitude de um acampamento. Qual coleção diz melhor o que esse par é?',
      data: { options: [
        { id: 'a', text: 'Tupla.', correct: true },
        { id: 'b', text: 'Lista, porque são dois números em ordem.', porque: 'Funciona, mas diz a coisa errada: lista anuncia que aquilo pode crescer, e acrescentar um terceiro número a uma coordenada não faz sentido nenhum.' },
        { id: 'c', text: 'Conjunto, porque os dois números são diferentes.', porque: 'Conjunto não tem ordem, e numa coordenada a ordem é tudo: trocar latitude por longitude põe o acampamento em outro continente.' },
        { id: 'd', text: 'Dicionário, com os dois números como chaves.', porque: 'Chave é o rótulo, e não o valor. O dicionário certo seria com as chaves "lat" e "lon" — e aí ele concorre de verdade, mas gasta mais para dizer o mesmo.' },
      ]},
      explanation: 'O sinal de que é tupla e não lista é este: acrescentar um item ali não faria sentido. É um conjunto fechado de partes, e o tipo avisa isso a quem lê.',
    },
    {
      id: 'PYA-M2-Q4', type: 'multiple_choice',
      prompt: 'Qual a diferença entre buscar uma chave com colchetes e buscar com .get()?',
      data: { options: [
        { id: 'a', text: 'Colchetes dão KeyError se a chave não existir; .get() devolve um padrão.', correct: true },
        { id: 'b', text: 'Colchetes leem e .get() também grava, se a chave faltar.', porque: 'O .get() não grava nada. Ele devolve o padrão naquela chamada e o dicionário continua sem a chave.' },
        { id: 'c', text: 'Nenhuma: são duas formas de escrever a mesma coisa.', porque: 'A diferença aparece exatamente no caso que interessa — quando a chave não está lá — e é por isso que as duas existem.' },
        { id: 'd', text: 'Colchetes servem para dicionário e .get() serve para lista.', porque: 'Lista não tem .get(). Os dois são do dicionário, e escolhem o que fazer quando a chave falta.' },
      ]},
      explanation: 'Use .get() quando o dado pode faltar — que é quase sempre, quando ele vem de fora: de um arquivo, de um formulário, de outro programa.',
    },
    {
      id: 'PYA-M2-Q5', type: 'true_false',
      prompt: 'Escrever chaves vazias cria um conjunto vazio.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Cria um dicionário vazio. As chaves foram do dicionário primeiro, e o conjunto ficou sem literal próprio para o vazio.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Conjunto vazio se escreve set(). É a única das quatro coleções sem forma curta para o vazio, e o engano não estoura: você fica com um dicionário que aceita tudo o que um conjunto aceitaria, menos o add.',
    },
    {
      id: 'PYA-M2-Q6', type: 'scenario',
      prompt: 'A chamada de presença tem nomes repetidos porque alguns foram anotados duas vezes. Você quer saber quantas pessoas diferentes apareceram. Qual o caminho mais curto?',
      data: { scenarios: [
        { id: 'a', text: 'Transformar a lista num conjunto e medir o tamanho dele.', correct: true },
        { id: 'b', text: 'Percorrer a lista com um for e comparar cada nome com todos os outros.', porque: 'Funciona e é reescrever à mão o que o conjunto já faz. É também onde entram os erros de índice.' },
        { id: 'c', text: 'Ordenar a lista, porque assim os repetidos ficam juntos e somem.', porque: 'Ordenar junta os iguais e não apaga nenhum: a lista continua com o mesmo tamanho.' },
        { id: 'd', text: 'Contar o tamanho da lista e dividir por dois.', porque: 'Isso só acertaria se todo mundo estivesse anotado exatamente duas vezes, o que não é o caso.' },
      ]},
      explanation: 'Tirar repetidos é para isso que o conjunto existe. Comparar duas chamadas — quem veio nos dois sábados, quem só veio num — também é uma conta de uma linha com ele.',
    },
    {
      id: 'PYA-M2-Q7', type: 'ordering',
      prompt: 'Ordene as perguntas que levam da dúvida à escolha da coleção certa.',
      data: { items: [
        { id: 'a', text: 'Cada valor tem um rótulo próprio? Se tem, é dicionário', order: 1 },
        { id: 'b', text: 'Não tendo rótulo: a ordem importa?', order: 2 },
        { id: 'c', text: 'Importando a ordem: isso vai mudar depois de criado?', order: 3 },
        { id: 'd', text: 'Não importando a ordem, e sem repetidos: é conjunto', order: 4 },
      ]},
      explanation: 'Duas perguntas decidem entre as quatro. Lista serve para tudo, e é por isso que ela acaba usada onde não deveria — uma lista de dois itens fixos quer ser tupla.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 3 — Guardar em arquivo
     ────────────────────────────────────────────────────────────────────── */
  'm3-teoria': [
    {
      id: 'PYA-M3-Q1', type: 'multiple_choice',
      prompt: 'Por que um programa grava em arquivo, se ele já guarda tudo em variáveis?',
      data: { options: [
        { id: 'a', text: 'Porque as variáveis somem quando o programa termina.', correct: true },
        { id: 'b', text: 'Porque arquivo é mais rápido de ler do que a memória.', porque: 'É o contrário: o disco é muito mais lento. Grava-se apesar disso, e não por causa disso.' },
        { id: 'c', text: 'Porque uma variável não consegue guardar texto comprido.', porque: 'Guarda sim, do tamanho que couber na memória. O limite não é o tamanho, é a duração.' },
        { id: 'd', text: 'Porque só arquivos podem ser lidos por funções.', porque: 'Função recebe qualquer coisa: número, texto, lista, dicionário. Ela não tem preferência por arquivo.' },
      ]},
      explanation: 'É a diferença entre um programa que faz a chamada e um programa que tem a chamada do mês passado. O arquivo está lá no sábado seguinte.',
    },
    {
      id: 'PYA-M3-Q2', type: 'multiple_choice',
      prompt: 'Qual é a diferença entre abrir um arquivo no modo w e no modo a?',
      data: { options: [
        { id: 'a', text: 'O w apaga o conteúdo antes de escrever; o a escreve no fim.', correct: true },
        { id: 'b', text: 'O w serve para texto e o a serve para números.', porque: 'Os dois gravam texto. O que muda é o que acontece com o que já estava no arquivo.' },
        { id: 'c', text: 'O w cria o arquivo se ele não existir e o a só funciona em arquivo existente.', porque: 'Os dois criam. O a num arquivo inexistente começa um vazio e escreve nele.' },
        { id: 'd', text: 'O w grava na hora e o a só grava quando o programa termina.', porque: 'Quando a gravação chega ao disco é assunto do fechamento do arquivo, e vale igual para os dois.' },
      ]},
      explanation: 'O w apaga no instante em que abre, antes mesmo de você escrever qualquer coisa. Abrir com w o arquivo que você queria continuar é a forma mais rápida de perder o trabalho de um mês.',
    },
    {
      id: 'PYA-M3-Q3', type: 'multiple_choice',
      prompt: 'Para que serve o with ao abrir um arquivo?',
      data: { options: [
        { id: 'a', text: 'Ele fecha o arquivo ao sair do bloco, mesmo se der erro no meio.', correct: true },
        { id: 'b', text: 'Ele impede que outro programa abra o mesmo arquivo ao mesmo tempo.', porque: 'Trancar arquivo é outro assunto, e o with não faz isso. Ele cuida do fechamento, e só.' },
        { id: 'c', text: 'Ele lê o arquivo inteiro de uma vez para a memória.', porque: 'Quem lê é o .read() ou o for. O with não lê nada: ele cuida do que acontece na saída do bloco.' },
        { id: 'd', text: 'Ele converte o conteúdo do arquivo para o tipo certo automaticamente.', porque: 'Tudo o que sai de um arquivo de texto é texto. Converter continua sendo trabalho seu.' },
      ]},
      explanation: 'Arquivo que ninguém fechou pode acabar sem a última linha — o que foi escrito ficou esperando para ir ao disco. É um defeito difícil de achar, porque o arquivo existe e quase todo o conteúdo está lá.',
    },
    {
      id: 'PYA-M3-Q4', type: 'scenario',
      prompt: 'Um nome lido do arquivo nunca é considerado igual ao mesmo nome digitado, mesmo os dois parecendo idênticos na tela. O que está sobrando na comparação?',
      data: { scenarios: [
        { id: 'a', text: 'O enter do fim da linha, que vem grudado no que foi lido.', correct: true },
        { id: 'b', text: 'A diferença de maiúsculas, que o arquivo guardou de outro jeito.', porque: 'O arquivo guarda exatamente as letras que foram escritas nele. Se a caixa fosse o problema, a diferença apareceria na tela.' },
        { id: 'c', text: 'O tipo: o que vem do arquivo é número e o digitado é texto.', porque: 'Os dois são texto. Tudo o que sai de um arquivo de texto é texto, inclusive o que parece número.' },
        { id: 'd', text: 'O encoding, que trocou as letras por outras equivalentes.', porque: 'Encoding errado troca letra com acento por símbolo estranho, e isso se vê na tela. Aqui os dois aparecem idênticos.' },
      ]},
      explanation: 'Cada linha vem com o fim de linha colado nela. O .strip() tira esse enter e os espaços das pontas, e quase sempre é o que se quer logo depois de ler.',
    },
    {
      id: 'PYA-M3-Q5', type: 'true_false',
      prompt: 'Abrir um arquivo escrevendo só o nome dele guarda esse arquivo sempre na mesma pasta, não importa de onde o programa seja executado.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O nome sozinho é um caminho relativo: ele quer dizer "na pasta em que o programa está rodando", e essa pasta muda conforme de onde ele foi chamado.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'É o mistério mais comum de todos: o programa grava, o arquivo não aparece onde se procurou, e tudo funcionava ontem. Não sumiu — foi parar na pasta de trabalho atual, que mudou.',
    },
    {
      id: 'PYA-M3-Q6', type: 'multiple_choice',
      prompt: 'Por que se escreve encoding utf-8 ao abrir um arquivo, se o programa funciona sem isso?',
      data: { options: [
        { id: 'a', text: 'Porque sem ele o Python usa o padrão do computador, que varia.', correct: true },
        { id: 'b', text: 'Porque sem ele o arquivo é gravado sem os acentos, que são descartados.', porque: 'Nada é descartado. Os acentos são gravados de algum jeito — o problema é que pode ser um jeito que outro computador lê errado.' },
        { id: 'c', text: 'Porque é obrigatório em arquivos abertos para escrita.', porque: 'Não é obrigatório em modo nenhum: o programa abre e roda sem ele. É justamente por isso que o defeito passa despercebido.' },
        { id: 'd', text: 'Porque ele comprime o arquivo e o deixa menor no disco.', porque: 'Encoding não comprime nada: ele diz como cada letra vira bytes. Compactar é outro assunto e outro programa.' },
      ]},
      explanation: 'É o defeito que aparece no computador do colega e não no seu: o arquivo gravado numa máquina e lido em outra volta com "Falcão" escrito errado. Dizer o encoding nos dois lados encerra a discussão.',
    },
    {
      id: 'PYA-M3-Q7', type: 'ordering',
      prompt: 'Ordene o que o programa faz para acrescentar um nome ao fim de um arquivo que já existe.',
      data: { items: [
        { id: 'a', text: 'Abre o arquivo no modo que acrescenta, dizendo o encoding', order: 1 },
        { id: 'b', text: 'Escreve o nome, com o fim de linha no final', order: 2 },
        { id: 'c', text: 'Sai do bloco do with, e o arquivo é fechado', order: 3 },
        { id: 'd', text: 'O conteúdo antigo e o novo estão os dois no disco', order: 4 },
      ]},
      explanation: 'O passo três não é decoração: enquanto o arquivo não fecha, o que foi escrito pode ainda não ter chegado ao disco — e é por isso que o with existe.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 4 — CSV e JSON
     ────────────────────────────────────────────────────────────────────── */
  'm4-teoria': [
    {
      id: 'PYA-M4-Q1', type: 'multiple_choice',
      prompt: 'Como um arquivo CSV é organizado?',
      data: { options: [
        { id: 'a', text: 'Uma linha por registro, com vírgula separando as colunas.', correct: true },
        { id: 'b', text: 'Uma coluna por registro, com quebra de linha entre os campos.', porque: 'É o contrário: a linha é o registro e a vírgula separa os campos dele. Com uma coluna por registro, um arquivo de cem inscritos teria cem colunas.' },
        { id: 'c', text: 'Um arquivo binário que só a planilha consegue abrir.', porque: 'CSV é texto puro. Abre no Bloco de Notas, e dá para ler o conteúdo a olho — que é metade do motivo de ele ser tão usado.' },
        { id: 'd', text: 'Pares de chave e valor, como um dicionário.', porque: 'Isso é o JSON. No CSV o nome do campo aparece uma vez, no cabeçalho, e não se repete em cada linha.' },
      ]},
      explanation: 'É a tabela escrita em texto: a primeira linha traz os nomes das colunas, e é dela que o DictReader tira as chaves de cada registro.',
    },
    {
      id: 'PYA-M4-Q2', type: 'multiple_choice',
      prompt: 'Por que não se deve ler um CSV separando cada linha pela vírgula com split?',
      data: { options: [
        { id: 'a', text: 'Um campo com vírgula dentro muda a contagem de colunas, sem avisar.', correct: true },
        { id: 'b', text: 'Porque o split é lento demais para arquivos grandes.', porque: 'A velocidade não é o problema aqui, e o módulo csv não é mais rápido. O problema é o resultado ficar errado.' },
        { id: 'c', text: 'Porque o split devolve números, e os campos do CSV são texto.', porque: 'O split devolve texto sempre. A conversão para número continua sendo trabalho seu nos dois caminhos.' },
        { id: 'd', text: 'Porque o split não consegue ler a primeira linha do arquivo.', porque: 'Ele lê qualquer linha. O cabeçalho é uma linha como as outras, e cabe a você tratá-lo como cabeçalho.' },
      ]},
      explanation: 'Um nome escrito como "Silva, Ana" parte em dois e desloca todos os campos daquela linha. O módulo csv já sabe disso, e é essa a razão de ele existir.',
    },
    {
      id: 'PYA-M4-Q3', type: 'scenario',
      prompt: 'Um programa lê as idades de um CSV e soma tudo. Em vez do total, aparece uma sequência com todos os números emendados. Por quê?',
      data: { scenarios: [
        { id: 'a', text: 'As idades vieram como texto, e somar texto junta em vez de somar.', correct: true },
        { id: 'b', text: 'O arquivo tem uma linha em branco no fim, que virou zero.', porque: 'Linha em branco daria erro ou seria ignorada. Zero somado não emenda nada — ele não mudaria o total.' },
        { id: 'c', text: 'O cabeçalho foi somado junto com os dados.', porque: 'Isso daria erro ou juntaria também a palavra "idade" no meio. E o DictReader já consome o cabeçalho sozinho.' },
        { id: 'd', text: 'O separador do arquivo não é vírgula, e as colunas saíram trocadas.', porque: 'Colunas trocadas trariam outro dado no lugar da idade, e não todos os números na ordem certa emendados.' },
      ]},
      explanation: 'Tudo o que sai de um CSV é texto, inclusive o que parece número. É a mesma armadilha do input da CC002, agora vinda de um arquivo — e o sinal é sempre esse: a soma virou uma sequência comprida.',
    },
    {
      id: 'PYA-M4-Q4', type: 'multiple_choice',
      prompt: 'O que o JSON guarda que o CSV não guarda bem?',
      data: { options: [
        { id: 'a', text: 'Estrutura: lista dentro de registro, e o tipo de cada valor.', correct: true },
        { id: 'b', text: 'Acentos, que o CSV não aceita.', porque: 'CSV aceita acento sem problema nenhum. O que decide isso é o encoding, e ele vale igual para os dois formatos.' },
        { id: 'c', text: 'Muitos registros, porque o CSV tem limite de linhas.', porque: 'CSV não tem limite nenhum, e é justamente em muitos registros iguais que ele é melhor do que o JSON.' },
        { id: 'd', text: 'O nome das colunas, que no CSV se perde.', porque: 'O CSV guarda os nomes na primeira linha, e é de lá que o DictReader tira as chaves.' },
      ]},
      explanation: 'O que volta de um json.load já é dicionário e lista de verdade, com os números como números. Não há conversão a fazer depois — e é isso que o CSV não entrega.',
    },
    {
      id: 'PYA-M4-Q5', type: 'true_false',
      prompt: 'json.dump e json.dumps fazem a mesma coisa, e a letra no fim não muda nada.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O dump escreve num arquivo; o dumps devolve um texto. Trocar um pelo outro dá um erro que não parece ter relação nenhuma com o que você fez.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O s é de string. Vale para o par de leitura também: load lê de um arquivo, loads lê de um texto que você já tem na mão.',
    },
    {
      id: 'PYA-M4-Q6', type: 'scenario',
      prompt: 'A secretaria do clube precisa abrir no Excel a lista de inscritos que o seu programa gera, com nome, unidade e idade de cada um. Que formato gravar?',
      data: { scenarios: [
        { id: 'a', text: 'CSV, porque são muitos registros com as mesmas colunas.', correct: true },
        { id: 'b', text: 'JSON, porque guarda a idade como número e não como texto.', porque: 'Guarda mesmo, e não é o que decide aqui: quem vai abrir é uma planilha, e ela não lê JSON.' },
        { id: 'c', text: 'Texto comum, com um inscrito por linha e os campos separados por espaço.', porque: 'Espaço separa mal: um nome composto já quebra a conta de campos. E a planilha não reconhece o arquivo como tabela.' },
        { id: 'd', text: 'Tanto faz: os dois abrem na planilha do mesmo jeito.', porque: 'Só o CSV abre como tabela. JSON aberto numa planilha aparece como um monte de texto numa coluna só.' },
      ]},
      explanation: 'A pergunta que decide é esta: isso caberia numa planilha sem ficar estranho? Se for preciso inventar colunas como unidade1, unidade2 e unidade3, aí a resposta era JSON.',
    },
    {
      id: 'PYA-M4-Q7', type: 'matching',
      prompt: 'Ligue cada ferramenta ao trabalho dela.',
      data: { pairs: [
        { left: 'csv.DictReader', right: 'Lê cada linha do CSV como um dicionário' },
        { left: 'csv.DictWriter', right: 'Grava dicionários como linhas do CSV' },
        { left: 'json.dump', right: 'Escreve a estrutura dentro de um arquivo' },
        { left: 'json.load', right: 'Traz a estrutura de volta de um arquivo' },
      ]},
      explanation: 'Repare na simetria: cada formato tem quem leva e quem traz. O que muda entre os dois é o que sobrevive à viagem — o CSV entrega texto, o JSON entrega a forma inteira.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 5 — Quando o usuário erra
     ────────────────────────────────────────────────────────────────────── */
  'm5-teoria': [
    {
      id: 'PYA-M5-Q1', type: 'multiple_choice',
      prompt: 'Num bloco try e except, quando as linhas do except são executadas?',
      data: { options: [
        { id: 'a', text: 'Só quando algo dentro do try dá errado.', correct: true },
        { id: 'b', text: 'Sempre, depois que o try termina.', porque: 'Se nada der errado, o except é pulado inteiro. Ele não custa nada quando não é preciso.' },
        { id: 'c', text: 'Antes do try, para preparar o que pode falhar.', porque: 'Nada é executado fora de ordem. O except é a resposta ao que aconteceu, e por isso vem depois.' },
        { id: 'd', text: 'Quando o programa termina, como uma limpeza final.', porque: 'Isso é o finally, que é outro bloco e roda dando ou não dando erro.' },
      ]},
      explanation: 'O que vai no try é o que pode dar errado; o que vai no except é o que fazer se der. Quando não dá, o programa nem passa por ali.',
    },
    {
      id: 'PYA-M5-Q2', type: 'multiple_choice',
      prompt: 'Para que tipo de erro o try foi feito?',
      data: { options: [
        { id: 'a', text: 'O que vem de fora: a digitação, o arquivo, a rede.', correct: true },
        { id: 'b', text: 'O erro de digitação no seu próprio código.', porque: 'Esse você conserta, e esconder é o pior que dá para fazer com ele: o programa passa a seguir em frente com um defeito que ninguém vê.' },
        { id: 'c', text: 'O erro de lógica, que faz a conta sair errada.', porque: 'Erro de lógica não levanta exceção nenhuma — o programa roda até o fim e devolve o número errado. Não há o que apanhar.' },
        { id: 'd', text: 'Qualquer erro, para o programa nunca parar em hipótese nenhuma.', porque: 'Programa que nunca para é programa que segue quebrado em silêncio. Há erro que precisa parar tudo, e vê-lo é o que permite consertá-lo.' },
      ]},
      explanation: 'Erro seu, você conserta; erro de fora, você prevê. É por isso que o try envolve a linha que pode falhar, e só ela.',
    },
    {
      id: 'PYA-M5-Q3', type: 'matching',
      prompt: 'Ligue cada erro à situação que o produz.',
      data: { pairs: [
        { left: 'ValueError', right: 'Converter para número um texto que não é número' },
        { left: 'FileNotFoundError', right: 'Abrir para leitura um arquivo que não existe' },
        { left: 'KeyError', right: 'Pedir com colchetes uma chave fora do dicionário' },
        { left: 'ZeroDivisionError', right: 'Dividir alguma coisa por zero' },
      ]},
      explanation: 'Cada um tem nome próprio, e é por isso que dá para apanhar só o que você previu. Escrever o nome no except é o que separa prever de esconder.',
    },
    {
      id: 'PYA-M5-Q4', type: 'scenario',
      prompt: 'Um programa tem um except sem nome de erro nenhum em volta do trecho principal. Ele nunca para, e nunca faz o que deveria. O que o except provavelmente está apanhando?',
      data: { scenarios: [
        { id: 'a', text: 'Um erro de digitação no código, que precisaria aparecer.', correct: true },
        { id: 'b', text: 'Nada: except sem nome não apanha erro nenhum.', porque: 'É o contrário. Sem nome, ele apanha todos — e é exatamente por isso que ele é perigoso.' },
        { id: 'c', text: 'Só os erros de entrada do usuário, que são os previstos.', porque: 'Ele não sabe distinguir. Um except sem nome apanha o erro previsto e o imprevisto do mesmo jeito.' },
        { id: 'd', text: 'Apenas o erro da última linha do bloco.', porque: 'Ele vale para o bloco inteiro: a primeira linha que falhar salta direto para ele, e as seguintes nem são executadas.' },
      ]},
      explanation: 'Essa é a linha que mais esconde defeito em Python. Ela apanha o erro que você previu e o que você não fazia ideia de ter, e os dois viram a mesma mensagem tranquilizadora.',
    },
    {
      id: 'PYA-M5-Q5', type: 'true_false',
      prompt: 'Um except pode nomear mais de um tipo de erro ao mesmo tempo.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Escrevem-se os nomes entre parênteses, separados por vírgula, e o bloco vale para todos eles. Nomear dois não é o mesmo que não nomear nenhum.' },
      ]},
      explanation: 'É a forma honesta de tratar dois casos com a mesma resposta, sem cair no except pelado — que apanharia também o terceiro caso, o que você não previu.',
    },
    {
      id: 'PYA-M5-Q6', type: 'multiple_choice',
      prompt: 'O requisito pede que uma entrada inválida não encerre o programa. Tratar o erro e seguir em frente com o valor que veio resolve isso?',
      data: { options: [
        { id: 'a', text: 'Não: só adia o problema para a linha que usar esse valor.', correct: true },
        { id: 'b', text: 'Sim, porque o programa não parou, que era o que se pedia.', porque: 'Não parar não basta se o resto do programa passa a trabalhar com um dado que não vale. O erro reaparece adiante, e mais difícil de achar.' },
        { id: 'c', text: 'Sim, desde que o programa avise na tela o que aconteceu.', porque: 'Avisar é bom e não conserta nada: o valor inválido continua ali, e o aviso vira uma linha que ninguém lê.' },
        { id: 'd', text: 'Não, e a saída é encerrar o programa com uma mensagem clara.', porque: 'Encerrar é justamente o que o requisito pede para evitar. Quem digitou errado merece uma segunda chance, e não a porta.' },
      ]},
      explanation: 'O jeito honesto é perguntar de novo: um laço sem fim, o try dentro dele, e a saída só na hora em que o valor finalmente vale.',
    },
    {
      id: 'PYA-M5-Q7', type: 'ordering',
      prompt: 'Ordene o que acontece quando alguém digita a palavra doze onde se esperava um número, num programa que insiste.',
      data: { items: [
        { id: 'a', text: 'A conversão para número falha e levanta um erro', order: 1 },
        { id: 'b', text: 'O bloco que trata o erro avisa que ali só vão números', order: 2 },
        { id: 'c', text: 'O laço dá outra volta e pergunta de novo', order: 3 },
        { id: 'd', text: 'A resposta válida chega e o laço termina', order: 4 },
      ]},
      explanation: 'O laço é o que transforma o erro em segunda chance. Sem ele, tratar o erro só evita o traceback — e deixa o programa seguir sem o dado de que precisava.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 6 — Bibliotecas
     ────────────────────────────────────────────────────────────────────── */
  'm6-teoria': [
    {
      id: 'PYA-M6-Q1', type: 'multiple_choice',
      prompt: 'O que é uma biblioteca em programação?',
      data: { options: [
        { id: 'a', text: 'Código pronto que alguém publicou para ser usado em outros programas.', correct: true },
        { id: 'b', text: 'A pasta do computador onde os seus programas ficam guardados.', porque: 'Isso é só uma pasta. Biblioteca é código que faz alguma coisa, e vem de fora do seu projeto.' },
        { id: 'c', text: 'O manual de referência da linguagem, com todos os comandos.', porque: 'Isso é a documentação. A biblioteca não explica: ela executa.' },
        { id: 'd', text: 'Um site onde se copia e cola trechos de código.', porque: 'Biblioteca não se copia e cola: ela se instala e se importa, e continua sendo mantida por quem a escreveu.' },
      ]},
      explanation: 'A diferença para copiar e colar é essa: o código continua sendo de quem o escreveu, e você recebe as correções que vierem depois.',
    },
    {
      id: 'PYA-M6-Q2', type: 'multiple_choice',
      prompt: 'O que separa a biblioteca padrão das bibliotecas de terceiros?',
      data: { options: [
        { id: 'a', text: 'A padrão já vem com o Python; a de terceiros precisa ser instalada.', correct: true },
        { id: 'b', text: 'A padrão é gratuita e a de terceiros é paga.', porque: 'A esmagadora maioria das bibliotecas de terceiros é gratuita e de código aberto. O que muda é vir junto ou não.' },
        { id: 'c', text: 'A padrão é escrita em Python e a de terceiros, em outra linguagem.', porque: 'As duas podem ser escritas em qualquer coisa. O que decide não é a linguagem de dentro.' },
        { id: 'd', text: 'A padrão serve para qualquer programa e a de terceiros só para a internet.', porque: 'Há biblioteca de terceiros para tudo: imagem, tabela, som, jogo. A internet é só um dos usos.' },
      ]},
      explanation: 'csv, json, os, random e datetime são padrão: estão em qualquer computador com Python, e basta importar. Requests, pandas e pillow são de terceiros, e precisam chegar antes.',
    },
    {
      id: 'PYA-M6-Q3', type: 'multiple_choice',
      prompt: 'Onde se digita o comando que instala uma biblioteca?',
      data: { options: [
        { id: 'a', text: 'No terminal.', correct: true },
        { id: 'b', text: 'Na primeira linha do programa, antes dos imports.', porque: 'Ali só vai código Python. O comando de instalação não é Python, e escrito no arquivo ele daria erro de sintaxe.' },
        { id: 'c', text: 'No site da biblioteca, preenchendo um cadastro.', porque: 'Não há cadastro nenhum: o repositório é público e o download é automático.' },
        { id: 'd', text: 'Dentro de um bloco de comentário, para o Python encontrar depois.', porque: 'Comentário é ignorado pelo interpretador — é o único pedaço do arquivo que ele garante que não executa.' },
      ]},
      explanation: 'Instalar e programar são dois momentos, como salvar e executar. A instalação prepara o computador; o import, no programa, usa o que já está lá.',
    },
    {
      id: 'PYA-M6-Q4', type: 'multiple_choice',
      prompt: 'Para que serve o arquivo requirements.txt?',
      data: { options: [
        { id: 'a', text: 'Ele lista o que precisa ser instalado antes de o programa rodar.', correct: true },
        { id: 'b', text: 'Ele guarda o código das bibliotecas, para não precisar baixá-las.', porque: 'Ele guarda só os nomes e as versões. O código continua sendo baixado na instalação.' },
        { id: 'c', text: 'Ele descreve o que o programa faz, para quem for usá-lo.', porque: 'Isso é o README. O requirements é lista de dependência, e o gerenciador de pacotes o lê como lista.' },
        { id: 'd', text: 'Ele é gerado pelo Python toda vez que o programa é executado.', porque: 'Ninguém o gera sozinho: você o escreve, ou pede ao gerenciador que grave a lista do que está instalado.' },
      ]},
      explanation: 'Não é burocracia: um programa que usa biblioteca de terceiros e não diz quais simplesmente não roda no computador de mais ninguém.',
    },
    {
      id: 'PYA-M6-Q5', type: 'true_false',
      prompt: 'Instalar uma biblioteca é rodar, no seu computador, código escrito por outra pessoa.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'É exatamente isso, e com as mesmas permissões que o seu programa tem. Não é motivo para não usar: é motivo para olhar o que se está usando.' },
      ]},
      explanation: 'O que se olha antes: o nome está escrito exatamente certo, quando foi a última atualização, quantas pessoas usam, e se há documentação.',
    },
    {
      id: 'PYA-M6-Q6', type: 'scenario',
      prompt: 'Você viu um trecho citando uma biblioteca e vai instalá-la. Qual o cuidado que evita o problema mais comum aqui?',
      data: { scenarios: [
        { id: 'a', text: 'Copiar o nome da página oficial, em vez de digitar de memória.', correct: true },
        { id: 'b', text: 'Instalar a versão mais antiga, que já foi testada por mais gente.', porque: 'Versão antiga costuma ser a que ainda tem as falhas já corrigidas nas novas. Antiguidade não é segurança.' },
        { id: 'c', text: 'Instalar duas bibliotecas parecidas e ver qual funciona.', porque: 'Isso dobra o código de estranho rodando na sua máquina — e a que não funcionar continua instalada.' },
        { id: 'd', text: 'Rodar a instalação e conferir depois se o nome estava certo.', porque: 'Depois já é tarde: a instalação executa o código no momento em que roda, e o estrago, se houver, já aconteceu.' },
      ]},
      explanation: 'Quem publica pacote falso usa erros de digitação comuns, esperando uma instalação apressada. A armadilha é o nome, e ela tem nome.',
    },
    {
      id: 'PYA-M6-Q7', type: 'scenario',
      prompt: 'Um programa que sempre funcionou passa a dar erro estranho na linha do import de uma biblioteca conhecida. Nada no programa mudou, mas um arquivo novo foi criado na pasta. O que procurar?',
      data: { scenarios: [
        { id: 'a', text: 'Um arquivo seu com o mesmo nome da biblioteca.', correct: true },
        { id: 'b', text: 'A biblioteca desinstalada por engano do computador.', porque: 'Aí a mensagem diria que o módulo não foi encontrado, e não daria um erro estranho de dentro dele.' },
        { id: 'c', text: 'Uma versão do Python trocada desde a última execução.', porque: 'Possível, e não é o que o enunciado descreve: o que mudou na pasta foi um arquivo novo.' },
        { id: 'd', text: 'O programa aberto em outra pasta, sem a biblioteca instalada.', porque: 'A instalação vale para o computador, e não para a pasta. Mudar de pasta não desinstala nada.' },
      ]},
      explanation: 'O import procura primeiro na pasta do programa. Um arquivo seu chamado random.py faz o import random carregar o seu arquivo — e o erro que aparece não fala de nome nenhum.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 7 — Um programa em partes
     ────────────────────────────────────────────────────────────────────── */
  'm7-teoria': [
    {
      id: 'PYA-M7-Q1', type: 'multiple_choice',
      prompt: 'De onde vem o nome do módulo que se escreve depois da palavra from?',
      data: { options: [
        { id: 'a', text: 'Do nome do arquivo, sem a terminação.', correct: true },
        { id: 'b', text: 'Do nome da função que está sendo trazida.', porque: 'A função vem depois do import. Antes dele vai o arquivo em que ela mora.' },
        { id: 'c', text: 'Do nome da pasta em que o arquivo está.', porque: 'Pasta é outro assunto, e entra só quando o arquivo está numa subpasta. O módulo é o arquivo.' },
        { id: 'd', text: 'De um nome declarado dentro do próprio arquivo.', porque: 'Não há declaração de nome nenhuma a fazer. Renomear o arquivo já renomeia o módulo, e é por isso que o nome dele importa.' },
      ]},
      explanation: 'Por isso o nome do arquivo deixa de ser detalhe ao dividir o programa: ele passa a aparecer escrito em todo lugar que importa dele.',
    },
    {
      id: 'PYA-M7-Q2', type: 'multiple_choice',
      prompt: 'Qual é a divisão mais útil entre três funções de um programa?',
      data: { options: [
        { id: 'a', text: 'Uma que lê, uma que decide e uma que mostra.', correct: true },
        { id: 'b', text: 'Três pedaços do mesmo tamanho, com um terço das linhas cada.', porque: 'Tamanho igual não separa nada: a divisão certa segue o que o programa faz, e essas partes raramente têm o mesmo tamanho.' },
        { id: 'c', text: 'Uma para cada arquivo que o programa abre.', porque: 'Isso divide pela origem do dado, e não pelo trabalho. Dois arquivos lidos do mesmo jeito cabem na mesma função de leitura.' },
        { id: 'd', text: 'Uma para o começo, uma para o meio e uma para o fim do programa.', porque: 'É a divisão por ordem de execução, que é justamente a que a função existe para desfazer: o que se separa é o que faz coisas diferentes.' },
      ]},
      explanation: 'Entrada, cálculo e saída. A prova de que ficou boa é a do meio: a que decide não tem print nem input nenhum, e por isso pode ser chamada de qualquer lugar.',
    },
    {
      id: 'PYA-M7-Q3', type: 'multiple_choice',
      prompt: 'Uma função lê o arquivo, faz a conta e imprime o resultado, tudo junto. Por que ela é difícil de reaproveitar?',
      data: { options: [
        { id: 'a', text: 'Para usar a conta em outro lugar você levaria o print junto.', correct: true },
        { id: 'b', text: 'Porque funções longas o Python executa mais devagar.', porque: 'O tamanho não muda a velocidade de forma que importe. O problema é o que ela obriga quem a chama a aceitar.' },
        { id: 'c', text: 'Porque uma função só pode devolver um valor por vez.', porque: 'Um valor basta, e dá para devolver uma coleção quando for preciso mais. Não é isso que trava o reaproveitamento.' },
        { id: 'd', text: 'Porque quem lê arquivo não pode também fazer contas.', porque: 'Pode tecnicamente, e é o que essa função faz. A objeção não é de permissão: é de uso.' },
      ]},
      explanation: 'É o sinal de que ela é três funções ainda não separadas. Quem quiser a conta num relatório em PDF não tem como pedir só a conta.',
    },
    {
      id: 'PYA-M7-Q4', type: 'multiple_choice',
      prompt: 'Por que guardar cópias do programa com nomes como versao2 e versaofinal funciona mal?',
      data: { options: [
        { id: 'a', text: 'Ninguém lembra o que mudou de uma para a outra.', correct: true },
        { id: 'b', text: 'Porque as cópias ocupam espaço demais no disco.', porque: 'Arquivo de código é minúsculo, e um repositório guarda todas as versões ocupando ainda menos. O espaço não é o problema.' },
        { id: 'c', text: 'Porque o Python se confunde com dois arquivos parecidos na pasta.', porque: 'Ele executa o arquivo que você mandar, sem se importar com os vizinhos. A confusão é humana.' },
        { id: 'd', text: 'Porque o nome do arquivo não pode conter números.', porque: 'Pode conter. E se não pudesse, bastaria mudar o nome — o defeito continuaria igual.' },
      ]},
      explanation: 'É controle de versão caseiro: sem mensagem dizendo o que mudou e por quê, e sem jeito de duas pessoas trabalharem ao mesmo tempo.',
    },
    {
      id: 'PYA-M7-Q5', type: 'true_false',
      prompt: 'Iniciar o repositório no último dia, com o programa já pronto, atende a um requisito que pede versionamento desde o primeiro dia.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Isso produz um histórico de um registro só, que não é histórico nenhum: não há como voltar a nada nem ver o que mudou quando.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Iniciar na primeira linha custa dez segundos, e é o que produz o registro do trabalho. Iniciar no fim produz uma fotografia dele.',
    },
    {
      id: 'PYA-M7-Q6', type: 'scenario',
      prompt: 'Dois arquivos do mesmo programa estão na mesma pasta, e um importa uma função do outro. Ao mover o que tem as funções para uma pasta acima, o import para de funcionar. Por quê?',
      data: { scenarios: [
        { id: 'a', text: 'O import procura na pasta do programa, e não nas de cima.', correct: true },
        { id: 'b', text: 'Mover um arquivo apaga o histórico de versões dele.', porque: 'O histórico continua lá, e um repositório sabe registrar que o arquivo mudou de lugar. Isso não tem relação com o import.' },
        { id: 'c', text: 'Um arquivo fora da pasta principal não pode conter funções.', porque: 'Pode conter, e conteria. O que mudou não foi o que há dentro dele: foi onde ele está.' },
        { id: 'd', text: 'O nome do módulo passou a incluir o nome da pasta de cima.', porque: 'Isso vale para subpastas, que ficam abaixo. Uma pasta acima simplesmente não é procurada.' },
      ]},
      explanation: 'Dois arquivos na mesma pasta se enxergam; um arquivo numa pasta acima, não. É a primeira dúvida de todo mundo ao dividir um programa em partes.',
    },
    {
      id: 'PYA-M7-Q7', type: 'multiple_choice',
      prompt: 'Uma mensagem de registro que diz apenas ajustes atrapalha quem, mais tarde?',
      data: { options: [
        { id: 'a', text: 'Você mesmo, procurando quando aquilo quebrou.', correct: true },
        { id: 'b', text: 'Ninguém, porque a mensagem só serve para outras pessoas da equipe.', porque: 'Mesmo sozinho o histórico é lido — e quem o lê mais é quem o escreveu, meses depois, sem lembrar de nada.' },
        { id: 'c', text: 'O interpretador, que usa a mensagem para saber o que executar.', porque: 'O interpretador não lê o histórico. Ele executa o arquivo que está no disco, e a mensagem é para gente.' },
        { id: 'd', text: 'Quem for instalar o programa, porque a mensagem vai no requirements.', porque: 'São coisas separadas: o requirements lista dependências, e a mensagem descreve uma mudança.' },
      ]},
      explanation: 'Registro não é cópia de segurança do dia inteiro: é um passo que funciona, com uma frase dizendo o que mudou e por quê.',
    },
  ],
};
