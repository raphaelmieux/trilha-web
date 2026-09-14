/**
 * O passo a passo de cada verificação de Python.
 *
 * A moldura oferece isto depois de um tempo sem ninguém concluir nada. É
 * convite, não despejo: quem está achando sozinho tem o direito de achar
 * sozinho.
 *
 * O que se escreve aqui é o caminho, e nunca a resposta. Dizer "escreva
 * `while n > 0:`" resolve o laboratório pela pessoa; dizer onde o `while` mora
 * e o que ele precisa ter para terminar ensina o que a lição queria ensinar.
 */
export const PASSOS_DE_PYTHON: Record<string, string[]> = {
  roda: [
    'Clique em Executar e leia o painel de saída.',
    'Se houver erro, comece pela última linha da mensagem: é ela que diz o tipo do problema.',
    'A linha acima dela diz em que linha do seu programa aconteceu — o número está ali.',
    'Erro de sintaxe aparece antes de o programa rodar; erro de execução aparece no meio dele.',
  ],
  saidaEsperada: [
    'Compare o painel de saída com o que o enunciado pede, linha por linha.',
    'Confira a ordem: um print fora de lugar muda tudo, e o programa não acusa nada.',
    'Confira o texto exato, inclusive maiúsculas e acentos.',
    'Se a diferença for num número, o problema costuma estar na conta, e não no print.',
  ],
  classificouAsFalhas: [
    'A pergunta não é onde o erro está: é quando ele apareceu.',
    'Erro de sintaxe aparece antes de qualquer coisa rodar — o Python recusa o arquivo e nenhuma linha sai.',
    'Erro de execução aparece no meio: o programa escreve o que já tinha para escrever e para com uma mensagem.',
    'Erro de lógica não aparece nunca. O programa vai até o fim, sem reclamar, e a resposta é que está errada.',
    'Se ficou em dúvida entre dois, releia o sintoma e pergunte: o Python chegou a reclamar?',
  ],
  leEExibe: [
    'Use input() para pedir um dado. O que estiver entre parênteses aparece antes do cursor.',
    'input() sempre devolve texto. Para fazer conta, converta: int(input(...)) ou float(input(...)).',
    'Use print() para mostrar o resultado.',
    'O campo de entrada, ao lado, é de onde o input() vai ler — uma linha por chamada.',
  ],
  tipoInteiro: [
    'Um número inteiro é escrito sem casas decimais: idade = 12.',
    'Vindo do teclado, ele precisa ser convertido: idade = int(input("Idade: ")).',
  ],
  tipoDecimal: [
    'Em Python a casa decimal é ponto, e não vírgula: altura = 1.75.',
    'Vindo do teclado: altura = float(input("Altura: ")).',
  ],
  tipoTexto: [
    'Texto vai entre aspas: nome = "Raphael". Aspas simples ou duplas, desde que a que abre feche.',
    'O que input() devolve já é texto — atribuí-lo a uma variável também conta.',
  ],
  tipoBooleano: [
    'São dois valores só: True e False.',
    'A primeira letra é maiúscula. Escrito true, o Python entende um nome de variável que não existe.',
  ],
  operadorAritmetico: [
    'São +, -, *, / e também % para o resto e ** para a potência.',
    'A divisão / devolve decimal mesmo quando dá exato: 10 / 2 é 5.0.',
    'Para divisão inteira, use //.',
  ],
  operadorComparacao: [
    'São ==, !=, <, >, <= e >=.',
    'Um sinal de igual atribui; dois comparam. É o engano mais comum, e o Python acusa: um erro de sintaxe dentro do if.',
  ],
  condicionalCompleto: [
    'O conjunto é if, depois elif, depois else — nessa ordem.',
    'O elif só é testado quando o if deu falso; o else vale quando nenhum dos dois deu certo.',
    'Cada um precisa ter algo dentro. Um ramo com só "pass" não faz nada.',
    'Repare nos dois-pontos no fim da linha e no recuo do que vem embaixo: em Python o recuo é a estrutura.',
  ],
  lacoFor: [
    'O for percorre uma sequência: for i in range(5): repete cinco vezes, com i valendo 0, 1, 2, 3 e 4.',
    'Também percorre texto e lista: for letra in nome:',
    'O que se repete é o que está recuado embaixo dele.',
  ],
  lacoWhile: [
    'O while repete enquanto a condição for verdadeira: while n > 0:',
    'Alguma coisa dentro dele precisa mudar a variável que a condição testa — senão ele nunca para.',
    'Um while que não termina é encerrado depois de alguns segundos, e o painel avisa.',
  ],
  quarentaLinhas: [
    'Linha em branco e linha só de comentário não contam: o requisito é de programa.',
    'Se está curto, o caminho não é encher — é o programa fazer mais: pedir mais dados, tratar mais casos, mostrar um resumo no fim.',
  ],

  abreParaEscrever: [
    'Escreva with open("nome.txt", "w", encoding="utf-8") as arquivo:',
    'O "w" começa do zero: ele apaga o que houver no arquivo no instante em que abre.',
    'Para acrescentar no fim sem apagar nada, troque o "w" por "a".',
    'Dentro do bloco, use arquivo.write("texto\\n") — o write não põe a quebra de linha sozinho.',
  ],
  abreParaLer: [
    'Escreva with open("nome.txt", encoding="utf-8") as arquivo:',
    'Ler é o modo padrão: não precisa de letra nenhuma depois do nome.',
    'arquivo.read() traz tudo de uma vez; percorrer o arquivo num for traz uma linha por vez.',
    'Cada linha vem com a quebra grudada nela — .strip() tira ela e os espaços das pontas.',
  ],
  abreComWith: [
    'Ponha o open dentro de um with: with open(...) as arquivo:',
    'O que for usar o arquivo fica recuado dentro do bloco.',
    'Ao sair do bloco, o arquivo é fechado sozinho — inclusive se der erro no meio.',
    'Sem o with seria preciso lembrar do arquivo.close(), e o arquivo esquecido aberto pode acabar sem a última linha.',
  ],

  funcaoComParametroERetorno: [
    'Escreva def nome_da_funcao(parametro): e recue o corpo dela.',
    'O parâmetro é um nome que só existe ali dentro, esperando ser preenchido pela chamada.',
    'Termine com return seguido do valor — devolver não é imprimir.',
    'Se você trocar o return por print, o número aparece na tela e a função devolve None.',
  ],
  funcaoComPadrao: [
    'Escolha o parâmetro que quase sempre vale a mesma coisa.',
    'Dê valor a ele na definição: def saudar(nome, saudacao="Boa noite").',
    'Os parâmetros com padrão vêm depois dos sem padrão, sempre — o contrário é erro de sintaxe.',
    'Chame sem passar esse valor para ver o padrão valer, e passando outro para ver ele ceder.',
  ],
  funcaoReaproveitada: [
    'Procure no seu programa as linhas que se repetem quase iguais.',
    'O que muda entre elas vira parâmetro; o que se repete vira o corpo da função.',
    'Troque as duas cópias por duas chamadas da mesma função.',
    'Chamar dentro de um laço conta como um ponto só: são duas chamadas escritas que contam.',
  ],
  usaLista: [
    'Escreva os valores entre colchetes: unidades = ["Falcão", "Pantera"].',
    'Use lista quando a ordem importa ou quando a quantidade vai variar.',
    'unidades.append("Águia") acrescenta no fim; unidades[0] é a primeira e unidades[-1] a última.',
  ],
  usaTupla: [
    'Escreva os valores entre parênteses: acampamento = ("Serra Azul", 2026).',
    'Use tupla para o que é um conjunto fechado de partes, em que acrescentar um item não faria sentido.',
    'Tupla de um item só precisa da vírgula: (4,) é tupla, e (4) é o número quatro.',
  ],
  usaDicionario: [
    'Escreva os pares entre chaves: ficha = {"nome": "Ana", "unidade": "Falcão"}.',
    'Use dicionário quando cada valor tem um rótulo — e ache pelo rótulo, com ficha["nome"].',
    'Quando a chave pode faltar, prefira ficha.get("cidade", "não informada") aos colchetes.',
  ],
  usaConjunto: [
    'set(uma_lista) devolve a mesma coisa sem repetidos.',
    'Use conjunto quando a pergunta é "quem apareceu?" e não "em que ordem?".',
    'Chaves vazias fazem um dicionário: conjunto vazio se escreve set().',
    'Ao imprimir, ordene com sorted() — conjunto não tem ordem, e a que aparece não é promessa.',
  ],

  leCsv: [
    'Escreva import csv no alto do programa.',
    'Abra o arquivo com with open(nome, encoding="utf-8", newline="") as arquivo:',
    'Percorra com for linha in csv.DictReader(arquivo): — cada linha vem como dicionário.',
    'Aí o programa lê linha["nome"], e não partes[0]: as chaves saem do cabeçalho do arquivo.',
    'Lembre que tudo o que sai do CSV é texto, inclusive a idade — converta com int() antes de somar.',
  ],
  gravaJson: [
    'Escreva import json no alto do programa.',
    'Monte um dicionário com o que você quer guardar.',
    'Abra o arquivo para escrita e chame json.dump(dados, arquivo, ensure_ascii=False, indent=2).',
    'O ensure_ascii=False faz o acento sair como acento; o indent=2 deixa o arquivo legível.',
  ],
  leJson: [
    'Abra o arquivo para leitura e chame json.load(arquivo).',
    'O que volta já é dicionário e lista de verdade, com os números como números.',
    'Não confunda: load lê de um arquivo e loads lê de um texto que você já tem na mão.',
  ],
  tratouOErroCerto: [
    'Ponha dentro do try só a linha que pode falhar.',
    'Escreva o nome do erro no except: except ValueError: para a conversão que não deu.',
    'Para mais de um, ponha-os entre parênteses: except (ValueError, TypeError):',
    'Nunca deixe um except sem nome: ele apanha também o erro de digitação do seu próprio código.',
  ],

  tresFuncoes: [
    'Separe pelo que o programa faz, e não em três pedaços do mesmo tamanho.',
    'Uma que LÊ: pega o dado, de onde quer que ele venha, e devolve lista ou dicionário.',
    'Uma que DECIDE: recebe esses dados e devolve o resultado, sem imprimir nada.',
    'Uma que MOSTRA: recebe o resultado e escreve na tela.',
    'A prova de que ficou boa é a do meio não ter print nem input nenhum.',
  ],
  importaDoProjeto: [
    'O nome do módulo é o nome do arquivo, sem o .py.',
    'No arquivo principal, escreva: from chamada import contar',
    'Dá para trazer mais de uma de uma vez: from chamada import ler, contar',
    'Os dois arquivos precisam estar na mesma pasta — um numa pasta acima não é encontrado.',
  ],
};
