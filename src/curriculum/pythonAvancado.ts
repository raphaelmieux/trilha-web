/*
 * A vereda CC004 Python, Avançado.
 *
 * ── De onde ela vem ──────────────────────────────────────────────────────
 * Da CC002. Lá o programa é um arquivo que se lê de cima para baixo: variável,
 * condição, laço, e o resultado no painel de saída. Isso resolve exercício, e
 * para de resolver na hora em que o programa cresce.
 *
 * ── O que muda de verdade ────────────────────────────────────────────────
 * Três coisas, e as três aparecem juntas no primeiro programa que alguém usa
 * mais de uma vez.
 *
 * A primeira é a **função**: dar nome a um pedaço e chamá-lo de dois lugares,
 * em vez de copiar as mesmas seis linhas. É o que separa um programa que se
 * conserta de um que se reescreve.
 *
 * A segunda é que o programa passa a **guardar** coisas. Enquanto tudo mora em
 * variável, fechar o programa apaga tudo o que ele fez; um arquivo em disco
 * sobrevive ao fechar, e é por isso que existe.
 *
 * A terceira é que o erro deixa de ser acidente e vira **caso previsto**. Na
 * CC002 o erro para o programa e a lição é ler a mensagem; aqui a lição é que o
 * programa não deve parar — quem digita "doze" onde se esperava 12 merece uma
 * segunda chance, e não um traceback.
 *
 * ── A ordem ──────────────────────────────────────────────────────────────
 * A do documento: a função primeiro, porque tudo o que vem depois se escreve
 * dentro de uma; as coleções, que são o que as funções recebem e devolvem; os
 * arquivos, em texto e nos dois formatos que o clube de fato encontra; o erro
 * tratado; a biblioteca de terceiros; e por fim o programa em dois arquivos,
 * versionado, que cobra a vereda inteira.
 *
 * ── O Git, e por que ele não tranca a vereda ─────────────────────────────
 * O requisito 8 pede o programa versionado com Git desde o primeiro dia, e Git
 * é a CC003. Mesmo assim o pré-requisito desta vereda é só a CC002, porque é
 * só isso que o documento oficial exige — e acrescentar tranca que ele não
 * pediu é decidir por ele. A lição do módulo 7 diz onde o Git mora, e quem já
 * percorreu a CC003 segue direto.
 */

import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DE_PYTHON_AVANCADO } from './questoesDePythonAvancado';

/* ────────────────────────────────────────────────────────────────────────
   Os capítulos de teoria
   ──────────────────────────────────────────────────────────────────────── */

const CAPITULOS: { id: string; titulo: string; resumo: string; topicos: TopicoDeVereda[] }[] = [
  {
    id: 'funcao',
    titulo: 'A função',
    resumo: 'Dar nome a um pedaço do programa, mandar valores para dentro e receber um de volta.',
    topicos: [
      {
        id: 'o-que-e-funcao',
        titulo: 'O que é uma função',
        resumo: 'Um pedaço do programa com nome, que se chama quantas vezes quiser.',
        explicacao: [
          'Função é um pedaço do programa que ganhou nome. Você escreve uma vez, com `def`, e depois manda executar escrevendo o nome com parênteses — quantas vezes precisar.',
          'Escrever `def saudar():` não executa nada: só ensina ao Python o que `saudar` significa. Quem executa é a chamada, `saudar()`, lá embaixo. Definir e chamar são dois momentos, e é comum escrever a função inteira e esquecer de chamá-la — o programa roda, não faz nada, e não reclama.',
          'A razão de existir é sempre a mesma: as mesmas linhas aparecendo em dois lugares. Quando o clube muda a regra, quem tem uma função muda uma linha; quem copiou, muda duas e esquece a terceira.',
        ],
        exemplo: `def saudar():
    print("Boa noite, desbravador!")

saudar()
saudar()`,
        exemploComo: 'python',
        exemploSaida: `Boa noite, desbravador!
Boa noite, desbravador!`,
        atencao: 'Função definida e nunca chamada não roda, e o Python não avisa. Se o programa executa sem erro e sem fazer nada, procure a chamada que falta.',
        marcas: ['def', 'função', 'chamada'],
      },
      {
        id: 'parametro-e-argumento',
        titulo: 'Parâmetro e argumento',
        resumo: 'O nome que a função espera, e o valor que ela recebe.',
        explicacao: [
          'Uma função fica muito mais útil quando recebe valores. O que vai entre os parênteses da definição é o **parâmetro**: um nome que só existe dentro da função, esperando ser preenchido.',
          'O que vai entre os parênteses da chamada é o **argumento**: o valor de verdade que você está mandando. `def saudar(nome)` declara o parâmetro `nome`; `saudar("Ana")` passa o argumento `"Ana"`.',
          'São duas palavras para dois lados da mesma porta, e vale saber a diferença porque toda mensagem de erro usa uma delas. Quando o Python diz que faltou um argumento, ele está dizendo que a chamada veio vazia — e não que a definição está errada.',
        ],
        exemplo: `def saudar(nome, unidade):
    print("Boa noite,", nome, "-", unidade)

saudar("Ana", "Falcão")
saudar("Tiago", "Pantera")`,
        exemploComo: 'python',
        exemploSaida: `Boa noite, Ana - Falcão
Boa noite, Tiago - Pantera`,
        atencao: 'A ordem manda. `saudar("Falcão", "Ana")` não dá erro nenhum: imprime a unidade no lugar do nome, e o programa continua. É o defeito silencioso desta lição.',
        marcas: ['parâmetro', 'argumento', 'def'],
      },
      {
        id: 'retorno',
        titulo: 'Retorno',
        resumo: 'Devolver um valor, em vez de escrever na tela.',
        explicacao: [
          '`return` devolve um valor para quem chamou. A função para ali e entrega o resultado, que pode ser guardado numa variável, entrar numa conta ou ser passado a outra função.',
          'Não confunda com `print()`. `print` mostra e não devolve nada; `return` devolve e não mostra nada. Uma função que só imprime serve para uma coisa; uma que devolve serve para qualquer coisa, inclusive para ser impressa.',
          'Função sem `return` devolve `None`, que é o jeito do Python de dizer "nada". Guardar esse nada numa variável não dá erro na hora — dá mais adiante, quando alguém tenta fazer conta com ele.',
        ],
        exemplo: `def media(a, b):
    return (a + b) / 2

nota = media(8, 10)
print(nota)
print(media(7, 7) + 1)`,
        exemploComo: 'python',
        exemploSaida: `9.0
8.0`,
        atencao: 'Trocar `return` por `print` numa função de cálculo é o engano mais comum daqui. O programa mostra o número certo na tela e devolve `None` — e a conta seguinte estoura com `TypeError`.',
        marcas: ['return', 'None', 'print'],
      },
      {
        id: 'valor-padrao',
        titulo: 'Parâmetro com valor padrão',
        resumo: 'Um valor de reserva, para quando a chamada não disser nada.',
        explicacao: [
          'Um parâmetro pode nascer com valor. `def saudar(nome, saudacao="Boa noite")` diz que, se ninguém passar a saudação, ela vale "Boa noite".',
          'Serve para o caso comum. Quase toda reunião do clube é à noite, então a saudação padrão cobre quase todas as chamadas — e quem precisar de outra escreve `saudar("Ana", "Bom dia")` e pronto.',
          'Os parâmetros com padrão vêm **depois** dos sem padrão, sempre. O contrário é erro de sintaxe, e é justo: o Python não teria como saber qual valor você quis pular.',
        ],
        exemplo: `def saudar(nome, saudacao="Boa noite"):
    print(saudacao + ",", nome)

saudar("Ana")
saudar("Tiago", "Bom dia")`,
        exemploComo: 'python',
        exemploSaida: `Boa noite, Ana
Bom dia, Tiago`,
        atencao: 'Valor padrão não é obrigação de usar: ele é o que vale quando a chamada cala. Se todas as chamadas passam o valor, o padrão não está errado — está sobrando.',
        marcas: ['valor padrão', 'def', 'parâmetro'],
      },
      {
        id: 'escopo',
        titulo: 'Escopo',
        resumo: 'Onde cada variável existe, e onde ela deixa de existir.',
        explicacao: [
          'Escopo é o pedaço do programa em que um nome existe. Uma variável criada dentro de uma função existe ali dentro e acaba quando a função termina — quem tentar lê-la de fora recebe `NameError`.',
          'Isso é a favor, e não contra. Duas funções podem usar `total` para coisas diferentes sem uma atrapalhar a outra, porque os dois `total` são variáveis distintas que só dividem o nome.',
          'O caminho de dentro para fora é o `return`: a função devolve o valor, e quem chamou guarda no escopo dele. Escrever dentro e esperar ler fora é querer que a porta se abra sozinha.',
        ],
        exemplo: `def contar(lista):
    total = len(lista)
    return total

total = "o total do lado de fora"
unidades = ["Falcão", "Pantera", "Águia"]

print(contar(unidades))
print(total)`,
        exemploComo: 'python',
        exemploSaida: `3
o total do lado de fora`,
        atencao: 'Existe `global`, e ele quase nunca é a resposta. Uma variável que qualquer função pode mudar é uma variável cujo valor errado ninguém consegue rastrear — `return` diz de onde o valor veio.',
        marcas: ['escopo', 'local', 'NameError'],
      },
    ],
  },

  {
    id: 'colecoes',
    titulo: 'As quatro coleções',
    resumo: 'Lista, tupla, dicionário e conjunto: o que cada uma garante, e quando cada uma é a certa.',
    topicos: [
      {
        id: 'lista',
        titulo: 'Lista',
        resumo: 'Vários valores em ordem, e a ordem pode mudar.',
        explicacao: [
          'Lista guarda vários valores numa coisa só, entre colchetes. Ela tem ordem — o primeiro é o primeiro —, aceita repetição, e muda: dá para acrescentar, trocar e tirar depois de criada.',
          'A posição começa em zero. `unidades[0]` é a primeira; `unidades[-1]` é a última, o que é bem mais seguro do que contar quantas são.',
          'Use lista quando a ordem importa ou quando a quantidade vai variar: a chamada de presença de um sábado, os nomes numa fila, as notas de uma prova.',
        ],
        exemplo: `unidades = ["Falcão", "Pantera"]
unidades.append("Águia")
unidades[0] = "Falcão Dourado"

print(unidades)
print(unidades[0], "/", unidades[-1], "/", len(unidades))`,
        exemploComo: 'python',
        exemploSaida: `['Falcão Dourado', 'Pantera', 'Águia']
Falcão Dourado / Águia / 3`,
        atencao: '`unidades[3]` numa lista de três dá `IndexError`. As posições vão de 0 a 2 — o último índice é sempre o tamanho menos um.',
        marcas: ['lista', 'append', 'índice'],
      },
      {
        id: 'tupla',
        titulo: 'Tupla',
        resumo: 'Como a lista, e não muda mais.',
        explicacao: [
          'Tupla é uma sequência que não muda depois de criada. Escreve-se entre parênteses: `coordenada = (-15.79, -47.88)`.',
          'Não poder mudar parece limitação e é garantia. Quem recebe uma tupla sabe que ninguém vai acrescentar um item no meio do caminho — e o Python pode usá-la como chave de dicionário, o que uma lista não pode.',
          'Use tupla para o que é um conjunto fechado de partes: a data em três números, uma coordenada, o par largura-e-altura. O sinal de que é tupla e não lista é este: acrescentar um item ali não faria sentido nenhum.',
        ],
        exemplo: `acampamento = ("Serra Azul", 2026, 4)
local, ano, dias = acampamento

print(local, ano, dias)
try:
    acampamento[1] = 2027
except TypeError as erro:
    print("Não dá:", erro)`,
        exemploComo: 'python',
        exemploSaida: `Serra Azul 2026 4
Não dá: 'tuple' object does not support item assignment`,
        atencao: 'Uma tupla de um item só precisa da vírgula: `(4,)` é tupla, e `(4)` é só o número quatro entre parênteses. É a pegadinha clássica do tipo.',
        marcas: ['tupla', 'imutável', 'desempacotar'],
      },
      {
        id: 'dicionario',
        titulo: 'Dicionário',
        resumo: 'Achar pelo nome, e não pela posição.',
        explicacao: [
          'Dicionário guarda pares de chave e valor, entre chaves. `ficha = {"nome": "Ana", "unidade": "Falcão"}` — e daí em diante `ficha["nome"]` devolve `"Ana"`.',
          'A diferença para a lista é o que você precisa saber para achar um item. Na lista, a posição; no dicionário, o nome. Ninguém lembra que a unidade é o item 3; todo mundo lembra que a unidade se chama "unidade".',
          'Use dicionário quando cada valor tem um rótulo: uma ficha, uma configuração, a contagem de quantas vezes cada nome apareceu. É também a forma que o JSON tem, e é por isso que os dois se encaixam sem esforço.',
        ],
        exemplo: `ficha = {"nome": "Ana", "unidade": "Falcão"}
ficha["idade"] = 12

print(ficha["nome"], "-", ficha["unidade"])
print(ficha.get("cidade", "não informada"))
for chave, valor in ficha.items():
    print(chave, "=", valor)`,
        exemploComo: 'python',
        exemploSaida: `Ana - Falcão
não informada
nome = Ana
unidade = Falcão
idade = 12`,
        atencao: 'Chave que não existe dá `KeyError` com colchetes e devolve o padrão com `.get()`. Use `.get()` quando o dado pode faltar — que é quase sempre, quando ele vem de fora.',
        marcas: ['dicionário', 'chave', 'get'],
      },
      {
        id: 'conjunto',
        titulo: 'Conjunto',
        resumo: 'Sem repetição, e sem ordem nenhuma.',
        explicacao: [
          'Conjunto guarda valores sem repetir. Escreve-se com chaves, como o dicionário, mas sem os dois-pontos: `presentes = {"Ana", "Tiago"}`. Acrescentar um nome que já está lá não faz nada — e é exatamente para isso que ele serve.',
          'Ele não tem ordem. Não existe "o primeiro" num conjunto, e a ordem em que os itens aparecem ao imprimir não é promessa nenhuma.',
          'Use conjunto quando a pergunta é "quem apareceu?" e não "em que ordem?". Tirar repetidos de uma lista é `set(lista)`, e comparar duas listas — quem está nas duas, quem só está numa — é uma conta de uma linha.',
        ],
        exemplo: `sabado = {"Ana", "Tiago", "Ana"}
domingo = {"Tiago", "Bia"}

print(len(sabado))
print(sorted(sabado & domingo))
print(sorted(sabado | domingo))
print(sorted(sabado - domingo))`,
        exemploComo: 'python',
        exemploSaida: `2
['Tiago']
['Ana', 'Bia', 'Tiago']
['Ana']`,
        atencao: '`{}` sozinho é dicionário vazio, e não conjunto vazio. Conjunto vazio se escreve `set()` — é a única das quatro coleções sem literal próprio para o vazio.',
        marcas: ['conjunto', 'set', 'sem repetição'],
      },
      {
        id: 'qual-usar',
        titulo: 'Qual das quatro usar',
        resumo: 'Duas perguntas decidem: tem ordem? tem rótulo?',
        explicacao: [
          'As quatro guardam vários valores, e cada uma garante uma coisa diferente. Escolher é responder a duas perguntas.',
          'A primeira: cada valor tem um **rótulo**? Se tem, é dicionário — a ficha de um desbravador, a configuração do programa. Se não tem, é uma das outras três.',
          'A segunda: a **ordem** importa, e a coisa vai mudar? Ordem que muda é lista, a mais comum de todas. Ordem que não muda é tupla, e ela avisa a quem lê que aquilo é um conjunto fechado de partes. Sem ordem e sem repetição é conjunto, que responde "quem apareceu" melhor do que qualquer laço.',
        ],
        exemplo: `chamada = ["Ana", "Tiago", "Ana"]
coordenada = ("Serra Azul", 2026)
ficha = {"nome": "Ana", "unidade": "Falcão"}
presentes = set(chamada)

print(type(chamada).__name__, type(coordenada).__name__)
print(type(ficha).__name__, type(presentes).__name__)
print(len(chamada), len(presentes))`,
        exemploComo: 'python',
        exemploSaida: `list tuple
dict set
3 2`,
        atencao: 'Lista serve para tudo, e é por isso que ela é usada onde não deveria. Uma lista de dois itens fixos quer ser tupla; uma lista onde ninguém pode repetir quer ser conjunto — e o código fica dizendo isso sozinho.',
        marcas: ['lista', 'tupla', 'dicionário', 'conjunto'],
      },
    ],
  },

  {
    id: 'arquivos',
    titulo: 'Guardar em arquivo',
    resumo: 'O que sobrevive a fechar o programa: ler, gravar, e não esquecer de fechar.',
    topicos: [
      {
        id: 'gravar',
        titulo: 'Gravar num arquivo',
        resumo: 'Escrever em disco o que a variável não guarda.',
        explicacao: [
          'Toda variável morre quando o programa termina. Arquivo não: ele fica no disco, e está lá no sábado seguinte. É a diferença entre um programa que faz a chamada e um programa que **tem** a chamada do mês passado.',
          '`open("presenca.txt", "w")` abre para escrever. O `"w"` é de *write*, e ele **apaga** o que houver no arquivo antes de começar. O `"a"`, de *append*, acrescenta no fim sem apagar nada.',
          'O `with` fecha o arquivo sozinho ao sair do bloco, inclusive se der erro no meio. Sem ele, é preciso lembrar do `.close()` — e o arquivo que ninguém fechou pode acabar sem a última linha, que é um defeito difícil de achar.',
        ],
        exemplo: `with open("presenca.txt", "w", encoding="utf-8") as arquivo:
    arquivo.write("Ana\\n")
    arquivo.write("Tiago\\n")

with open("presenca.txt", "a", encoding="utf-8") as arquivo:
    arquivo.write("Bia\\n")

print(open("presenca.txt", encoding="utf-8").read())`,
        exemploComo: 'python',
        exemploSaida: `Ana
Tiago
Bia
`,
        atencao: '`"w"` apaga o arquivo inteiro no instante em que abre, antes mesmo de você escrever qualquer coisa. Abrir com `"w"` o arquivo que você queria continuar é a forma mais rápida de perder o trabalho de um mês.',
        marcas: ['open', 'write', 'with'],
      },
      {
        id: 'ler',
        titulo: 'Ler um arquivo de texto',
        resumo: 'Trazer de volta o que foi gravado, linha por linha.',
        explicacao: [
          '`open("presenca.txt", encoding="utf-8")` abre para ler — é o modo padrão, e por isso não precisa de letra nenhuma. `.read()` traz o arquivo inteiro numa string; percorrer o arquivo num `for` traz uma linha por vez.',
          'Cada linha vem com o `\\n` do fim grudado nela. `.strip()` tira esse enter e os espaços das pontas, e quase sempre é o que se quer — senão o nome "Ana" nunca é igual a "Ana\\n".',
          'O `encoding="utf-8"` diz como as letras estão gravadas. Sem ele, o Python usa o padrão do computador, que no Windows não é UTF-8 — e aí "Falcão" volta do arquivo escrito errado, num computador e não no outro.',
        ],
        exemplo: `with open("chamada.txt", "w", encoding="utf-8") as arquivo:
    arquivo.write("Ana\\nTiago\\nBia\\n")

with open("chamada.txt", encoding="utf-8") as arquivo:
    for linha in arquivo:
        nome = linha.strip()
        print("Presente:", nome)`,
        exemploComo: 'python',
        exemploSaida: `Presente: Ana
Presente: Tiago
Presente: Bia`,
        atencao: 'Abrir para ler um arquivo que não existe dá `FileNotFoundError`. Não é acidente: é o caso a prever quando o arquivo vem de fora, e o módulo 5 mostra como.',
        marcas: ['open', 'read', 'strip', 'encoding'],
      },
      {
        id: 'caminho',
        titulo: 'Onde o arquivo vai parar',
        resumo: 'O nome sozinho é um caminho relativo — e ele depende de onde o programa roda.',
        explicacao: [
          'Escrever `open("presenca.txt")` não diz em que pasta o arquivo está: diz "na pasta em que o programa está rodando". É um caminho relativo, e é a mesma ideia que a CC003 ensina no terminal.',
          'Isso explica o mistério mais comum: o programa grava, o arquivo não aparece onde se procurou, e tudo funcionava ontem. Não sumiu — foi parar na pasta de onde o programa foi executado, que mudou.',
          'Para saber onde é, o próprio Python responde: `os.getcwd()` devolve a pasta de trabalho atual. É uma linha, e ela encerra a discussão.',
        ],
        exemplo: `import os

with open("onde.txt", "w", encoding="utf-8") as arquivo:
    arquivo.write("aqui")

print(os.path.exists("onde.txt"))
print(os.path.basename(os.path.abspath("onde.txt")))`,
        exemploComo: 'python',
        exemploSaida: `True
onde.txt`,
        atencao: 'Caminho com barra invertida no Windows precisa de cuidado: `"C:\\novo"` tem um `\\n` dentro, que é um enter. Use barra normal, que o Python entende nos dois sistemas.',
        marcas: ['caminho relativo', 'os', 'getcwd'],
      },
    ],
  },

  {
    id: 'csv-e-json',
    titulo: 'CSV e JSON',
    resumo: 'Os dois formatos que o clube de fato encontra, e o que cada um guarda bem.',
    topicos: [
      {
        id: 'csv',
        titulo: 'CSV: a planilha em texto',
        resumo: 'Uma linha por registro, vírgula entre as colunas.',
        explicacao: [
          'CSV é uma tabela escrita em texto: a primeira linha traz os nomes das colunas, e cada linha seguinte é um registro, com vírgula separando os campos. É o que o Excel e o Google Planilhas exportam, e é por isso que ele aparece tanto.',
          'Dá para ler com `.split(",")`, e é má ideia. Basta um campo com vírgula dentro — "Silva, Ana" — para a conta de colunas mudar no meio do arquivo, e nada avisa. O módulo `csv` da biblioteca padrão já sabe disso.',
          '`csv.DictReader` devolve cada linha como um dicionário, com as chaves saindo do cabeçalho. Aí o programa lê `linha["nome"]`, e não `partes[0]` — que é a diferença entre código que se entende e código que se conta nos dedos.',
        ],
        exemplo: `import csv

with open("unidades.csv", "w", encoding="utf-8", newline="") as arquivo:
    arquivo.write("nome,unidade,idade\\n")
    arquivo.write("Ana,Falcão,12\\n")
    arquivo.write("Tiago,Pantera,13\\n")

with open("unidades.csv", encoding="utf-8", newline="") as arquivo:
    for linha in csv.DictReader(arquivo):
        print(linha["nome"], "tem", linha["idade"], "anos")`,
        exemploComo: 'python',
        exemploSaida: `Ana tem 12 anos
Tiago tem 13 anos`,
        atencao: 'Tudo o que sai do CSV é **texto**, inclusive a idade. Somar sem converter junta em vez de somar — é a mesma armadilha do `input()` da CC002, agora vinda de um arquivo.',
        marcas: ['csv', 'DictReader', 'cabeçalho'],
      },
      {
        id: 'json',
        titulo: 'JSON: o dicionário em texto',
        resumo: 'Guardar estrutura, e não só tabela.',
        explicacao: [
          'JSON é um texto que guarda a mesma forma que o Python já usa: dicionário, lista, texto, número, verdadeiro e falso. É o formato em que quase todo programa troca dados com outro pela internet.',
          '`json.dump(dados, arquivo)` grava, e `json.load(arquivo)` traz de volta — e o que volta é dicionário e lista de verdade, com os números já como números. Não há conversão a fazer depois.',
          '`ensure_ascii=False` faz o acento sair como acento no arquivo, em vez de `\\u00e3`. `indent=2` grava com recuo, para uma pessoa conseguir ler. Os dois são escolha sua: o JSON continua válido dos dois jeitos.',
        ],
        exemplo: `import json

clube = {"nome": "Falcão Dourado", "unidades": ["Falcão", "Pantera"], "ativo": True}

with open("clube.json", "w", encoding="utf-8") as arquivo:
    json.dump(clube, arquivo, ensure_ascii=False, indent=2)

with open("clube.json", encoding="utf-8") as arquivo:
    lido = json.load(arquivo)

print(lido["nome"], "-", len(lido["unidades"]), "unidades")
print(type(lido["ativo"]).__name__)`,
        exemploComo: 'python',
        exemploSaida: `Falcão Dourado - 2 unidades
bool`,
        atencao: '`json.dumps` devolve um texto e `json.dump` escreve num arquivo. Uma letra separa os dois, e trocar dá um erro que não parece ter nada a ver com o que você fez.',
        marcas: ['json', 'dump', 'load'],
      },
      {
        id: 'qual-formato',
        titulo: 'Qual dos dois usar',
        resumo: 'Tabela é CSV; estrutura é JSON.',
        explicacao: [
          'CSV é bom no que é tabela: muitos registros iguais, com as mesmas colunas. A lista de inscritos no acampamento é CSV — e abre no Excel, que é onde a secretaria do clube vai querer abrir.',
          'JSON é bom no que tem forma: um registro que contém uma lista dentro, um dado que às vezes existe e às vezes não, número que precisa continuar número. A configuração de um programa é JSON.',
          'A pergunta que decide: isso caberia numa planilha sem ficar estranho? Se sim, CSV. Se for preciso inventar colunas como `unidade1`, `unidade2`, `unidade3`, a resposta é JSON — e o CSV estava sendo forçado.',
        ],
        exemplo: `import csv, json

inscritos = [{"nome": "Ana", "unidade": "Falcão"}, {"nome": "Tiago", "unidade": "Pantera"}]

with open("inscritos.csv", "w", encoding="utf-8", newline="") as arquivo:
    escritor = csv.DictWriter(arquivo, fieldnames=["nome", "unidade"])
    escritor.writeheader()
    escritor.writerows(inscritos)

print(open("inscritos.csv", encoding="utf-8").read().strip())
print(json.dumps(inscritos[0], ensure_ascii=False))`,
        exemploComo: 'python',
        exemploSaida: `nome,unidade
Ana,Falcão
Tiago,Pantera
{"nome": "Ana", "unidade": "Falcão"}`,
        atencao: 'No Windows, gravar CSV sem `newline=""` produz uma linha em branco entre as linhas. O arquivo abre, parece certo na tela, e o programa que o lê depois recebe registros vazios no meio.',
        marcas: ['csv', 'json', 'formato'],
      },
    ],
  },

  {
    id: 'erros-tratados',
    titulo: 'Quando o usuário erra',
    resumo: 'O programa que não morre porque alguém digitou "doze" em vez de 12.',
    topicos: [
      {
        id: 'try-except',
        titulo: 'try e except',
        resumo: 'Prever o erro em vez de deixá-lo parar tudo.',
        explicacao: [
          'O que vai dentro do `try` é o que pode dar errado. O que vai dentro do `except` é o que fazer se der. Se nada der errado, o `except` é pulado — ele não custa nada quando não é preciso.',
          'A diferença é enorme para quem usa o programa. Sem `try`, digitar "doze" onde se esperava um número derruba tudo com um traceback de cinco linhas; com `try`, o programa diz "isso não é um número" e segue.',
          'Não é para esconder erro de programação. `try` é para o erro que **vem de fora**: o que a pessoa digitou, o arquivo que não estava lá, a rede que caiu. Erro seu, você conserta; erro de fora, você prevê.',
        ],
        exemplo: `def para_numero(texto):
    try:
        return int(texto)
    except ValueError:
        print("Isso não é um número:", texto)
        return None

print(para_numero("12"))
print(para_numero("doze"))`,
        exemploComo: 'python',
        exemploSaida: `12
Isso não é um número: doze
None`,
        atencao: '`try` em volta do programa inteiro esconde tudo, inclusive o seu erro de digitação. Envolva a linha que pode falhar, e só ela.',
        marcas: ['try', 'except', 'ValueError'],
      },
      {
        id: 'o-erro-certo',
        titulo: 'Pegar o erro certo',
        resumo: '`except` sem nome nenhum apanha até o que você precisava ver.',
        explicacao: [
          'Cada erro tem um nome. `ValueError` é o texto que não vira número; `FileNotFoundError` é o arquivo que não existe; `KeyError` é a chave que não está no dicionário; `ZeroDivisionError` não precisa de explicação.',
          'Escrever `except ValueError:` apanha só esse. Escrever `except:` sozinho apanha **todos** — inclusive o `NameError` de um nome que você digitou errado, que você precisava ver para consertar.',
          'Dá para dizer mais de um: `except (ValueError, TypeError):`. E dá para guardar a mensagem, com `except ValueError as erro:` — aí o programa pode escrever o que aconteceu em vez de um recado genérico.',
        ],
        exemplo: `def dividir(a, b):
    try:
        return a / b
    except ZeroDivisionError as erro:
        return "não deu: " + str(erro)

print(dividir(10, 2))
print(dividir(10, 0))`,
        exemploComo: 'python',
        exemploSaida: `5.0
não deu: division by zero`,
        atencao: '`except:` pelado é a linha que mais esconde defeito em Python. Ele apanha o erro que você previu e também o que você não fazia ideia de ter — e os dois viram a mesma mensagem tranquilizadora.',
        marcas: ['except', 'ValueError', 'FileNotFoundError'],
      },
      {
        id: 'insistir',
        titulo: 'Insistir até a entrada valer',
        resumo: 'O laço que pergunta de novo, em vez de desistir.',
        explicacao: [
          'Tratar o erro e seguir em frente com um valor inválido só adia o problema. O que o requisito pede é que a entrada inválida **não encerre** o programa — e o jeito honesto de fazer isso é perguntar de novo.',
          'O molde é sempre o mesmo: um `while True`, o `try` dentro dele, e um `return` (ou `break`) na hora em que o valor finalmente vale. Enquanto não valer, o `except` avisa e o laço dá outra volta.',
          'Vale conferir mais do que o tipo. Uma idade que vira número mas vale -3 passou pelo `int()` e continua não sendo idade; o `if` depois do `try` é que cuida disso.',
        ],
        exemplo: `def pedir_idade():
    while True:
        try:
            idade = int(input("Idade: "))
        except ValueError:
            print("Digite só números.")
            continue
        if idade < 0:
            print("Idade não é negativa.")
            continue
        return idade

print("Anotado:", pedir_idade())`,
        exemploComo: 'python',
        exemploEntrada: ['doze', '-3', '12'],
        exemploSaida: `Idade: Digite só números.
Idade: Idade não é negativa.
Idade: Anotado: 12`,
        atencao: 'Repare no painel: as perguntas aparecem grudadas e o que foi digitado não aparece. A entrada é decidida antes, no campo ao lado — é assim que todo juiz de código funciona, e é como a CC002 já explicou.',
        marcas: ['while True', 'try', 'continue'],
      },
    ],
  },

  {
    id: 'bibliotecas',
    titulo: 'Bibliotecas',
    resumo: 'Código que outra pessoa escreveu, e como trazê-lo para o seu programa.',
    topicos: [
      {
        id: 'o-que-e-biblioteca',
        titulo: 'O que é uma biblioteca',
        resumo: 'Código pronto, escrito por outra pessoa, para você não reescrever.',
        explicacao: [
          'Biblioteca é um conjunto de código pronto que alguém escreveu e publicou, para ser usado em outros programas. Você não copia o código dela: você a instala e escreve `import`.',
          'Umas já vêm com o Python, e são a **biblioteca padrão** — `csv`, `json`, `os`, `random`, `datetime`. Não se instala nada: basta importar, e elas estão em qualquer computador com Python.',
          'As de **terceiros** não vêm juntas: são publicadas por outras pessoas e precisam ser instaladas. `requests` para falar com a internet, `pandas` para tabelas grandes, `pillow` para imagens. Instalar é o assunto do próximo tópico.',
        ],
        exemplo: `import random
import datetime

random.seed(7)
unidades = ["Falcão", "Pantera", "Águia"]
print(random.choice(unidades))
print(datetime.date(2026, 7, 15).strftime("%d/%m/%Y"))`,
        exemploComo: 'python',
        exemploSaida: `Pantera
15/07/2026`,
        atencao: 'Nunca dê a um arquivo seu o nome de uma biblioteca. Um `random.py` na sua pasta faz o `import random` carregar o seu arquivo, e o erro que aparece não fala de nome nenhum.',
        marcas: ['import', 'biblioteca padrão', 'terceiros'],
      },
      {
        id: 'gerenciador-de-pacotes',
        titulo: 'O gerenciador de pacotes',
        resumo: 'O pip, o PyPI, e uma linha no terminal.',
        explicacao: [
          'As bibliotecas de terceiros ficam publicadas num repositório chamado **PyPI**, e quem as baixa e instala é o **pip** — o gerenciador de pacotes que vem junto com o Python.',
          'O comando é `pip install requests`, digitado no terminal e não dentro do programa. Ele procura no PyPI, baixa, instala, e a partir dali o `import requests` funciona naquele computador.',
          '`pip list` mostra o que está instalado, e `pip freeze > requirements.txt` grava essa lista num arquivo. É esse arquivo que viaja junto com o programa: quem receber roda `pip install -r requirements.txt` e fica com tudo o que você tinha.',
        ],
        exemplo: `# No terminal, e não dentro do programa:
#
#   pip install requests
#   pip list
#   pip freeze > requirements.txt
#
# Depois, dentro do programa:
import json
print(json.dumps({"instalado": "requests"}, ensure_ascii=False))`,
        exemploComo: 'python',
        exemploSaida: '{"instalado": "requests"}',
        atencao: 'Programa que usa biblioteca de terceiros e não diz quais não roda no computador de mais ninguém. O `requirements.txt` não é burocracia: é a lista do que precisa existir antes.',
        marcas: ['pip', 'PyPI', 'requirements.txt'],
      },
      {
        id: 'escolher-biblioteca',
        titulo: 'Escolher uma biblioteca',
        resumo: 'Instalar código de estranho é decisão, e tem critério.',
        explicacao: [
          'Instalar uma biblioteca é rodar código que outra pessoa escreveu, com as mesmas permissões que o seu programa tem. Isso não é motivo para não usar — é motivo para olhar o que se está usando.',
          'O que se olha: o nome está escrito **exatamente** certo? Quando foi a última atualização? Quantas pessoas usam? Tem página com documentação? Uma biblioteca conhecida e mantida é mais segura do que uma que apareceu mês passado.',
          'A armadilha do nome é real e tem nome: quem publica pacote falso usa erros de digitação comuns, esperando um `pip install` apressado. Copie o nome da página oficial em vez de digitar de memória.',
        ],
        exemplo: `# O que a biblioteca padrão já resolve, e não precisa instalar:
import json, csv, os, random, datetime, math

print(math.floor(7 / 2), math.ceil(7 / 2))
print(os.path.splitext("chamada.csv")[1])`,
        exemploComo: 'python',
        exemploSaida: `3 4
.csv`,
        atencao: 'Antes de instalar, pergunte se a biblioteca padrão já faz. Ela é enorme, já está no computador, e não tem nada a conferir sobre quem a publicou.',
        marcas: ['pip install', 'segurança', 'biblioteca padrão'],
      },
    ],
  },

  {
    id: 'programa-em-partes',
    titulo: 'Um programa em partes',
    resumo: 'Dois arquivos, três funções, e o histórico desde o primeiro dia.',
    topicos: [
      {
        id: 'dois-arquivos',
        titulo: 'Dividir em dois arquivos',
        resumo: 'Um arquivo com as funções, outro com o programa.',
        explicacao: [
          'Quando o programa cresce, o arquivo único vira uma parede de texto. Dividir é o mesmo movimento da função, um andar acima: o que pertence junto fica junto, com nome próprio.',
          'A divisão mais útil é esta: um arquivo com as funções que fazem o trabalho, outro com o programa que as chama na ordem. `chamada.py` define `ler_presentes` e `contar`; `programa.py` escreve `from chamada import ler_presentes` e usa.',
          'O nome do arquivo é o nome do módulo, sem o `.py`. É por isso que o nome importa: `from chamada import contar` só funciona se o arquivo se chamar `chamada.py`, e no lugar em que o Python procura.',
        ],
        exemplo: `# chamada.py
def contar(nomes):
    return len(nomes)

# programa.py
# from chamada import contar

def contar_aqui(nomes):
    return len(nomes)

print(contar_aqui(["Ana", "Tiago", "Bia"]))`,
        exemploComo: 'python',
        exemploSaida: '3',
        atencao: '`import` procura primeiro na pasta do programa. Dois arquivos na mesma pasta se enxergam; um arquivo numa pasta acima, não — e essa é a primeira dúvida de todo mundo ao dividir.',
        marcas: ['import', 'módulo', 'from'],
      },
      {
        id: 'tres-funcoes',
        titulo: 'Três funções, e o que cada uma faz',
        resumo: 'Uma que lê, uma que decide, uma que mostra.',
        explicacao: [
          'Dividir em funções não é cortar o programa em três pedaços iguais: é separar as três coisas que ele faz. A mais útil das divisões é entrada, cálculo e saída.',
          'A que **lê** pega o dado, de onde quer que ele venha — do teclado, do arquivo, do CSV — e devolve em forma de lista ou dicionário. A que **decide** recebe esses dados e devolve o resultado, sem imprimir nada. A que **mostra** recebe o resultado e escreve na tela.',
          'A prova de que a divisão ficou boa é esta: a função do meio, a que decide, não tem `print` nem `input` nenhum. Ela pode ser chamada de qualquer lugar, testada com valores inventados, e reaproveitada no próximo programa.',
        ],
        exemplo: `def ler(linhas):
    return [linha.strip() for linha in linhas if linha.strip()]

def contar_por_unidade(nomes):
    contagem = {}
    for nome in nomes:
        contagem[nome] = contagem.get(nome, 0) + 1
    return contagem

def mostrar(contagem):
    for unidade, quantos in sorted(contagem.items()):
        print(unidade, "-", quantos)

mostrar(contar_por_unidade(ler(["Falcão", "Pantera", "", "Falcão"])))`,
        exemploComo: 'python',
        exemploSaida: `Falcão - 2
Pantera - 1`,
        atencao: 'Função que lê, decide e imprime ao mesmo tempo não se reaproveita: para usá-la em outro lugar você teria de aceitar o `print` junto. É o sinal de que ela é três funções ainda não separadas.',
        marcas: ['função', 'separar', 'reaproveitar'],
      },
      {
        id: 'versionar',
        titulo: 'Versionar desde o primeiro dia',
        resumo: 'O histórico que a pasta `projeto_v2_final` tenta imitar.',
        explicacao: [
          'Guardar cópias com nomes diferentes — `programa_v2.py`, `programa_final.py`, `programa_final_agora.py` — é controle de versão caseiro. Ele funciona mal: ninguém lembra o que mudou entre uma e outra, e duas pessoas nunca conseguem trabalhar juntas.',
          'Git faz isso direito. Cada `commit` é um retrato do projeto inteiro com uma mensagem dizendo o que mudou e por quê, e dá para voltar a qualquer um deles. É a vereda **CC003**, e é lá que o comando mora.',
          '"Desde o primeiro dia" é a parte que o requisito faz questão de dizer. Um `git init` no fim, com tudo pronto, dá um histórico de um commit só — que não é histórico nenhum. Iniciar na primeira linha custa dez segundos e é o que produz o registro do trabalho.',
        ],
        exemplo: `# No terminal, no primeiro dia, antes de escrever o programa:
#
#   git init
#   git add .
#   git commit -m "começa o contador de presença"
#
# E a cada pedaço que passa a funcionar, outro commit.

def contar(nomes):
    return len(nomes)

print("commit 1:", contar(["Ana"]))
print("commit 2:", contar(["Ana", "Tiago"]))`,
        exemploComo: 'python',
        exemploSaida: `commit 1: 1
commit 2: 2`,
        atencao: 'Commit não é backup do dia inteiro: é um passo que funciona. "Ajustes" numa mensagem não diz nada a quem for procurar quando é que aquilo quebrou — e quem procura, quase sempre, é você mesmo.',
        marcas: ['git', 'commit', 'versionar'],
      },
    ],
  },
];

const cap = (id: string) => CAPITULOS.find(c => c.id === id)!;

/* ────────────────────────────────────────────────────────────────────────
   Os módulos

   Só teoria por enquanto: a vereda está `emConstrucao`, e os laboratórios vêm
   na etapa seguinte. É o que "vereda em construção pode ter conteúdo" permite,
   e é o que mantém cada PR pequeno — o que já está escrito passa pelas travas
   de qualidade desde agora, em vez de tudo passar de uma vez no fim.
   ──────────────────────────────────────────────────────────────────────── */

export const MODULOS_DE_PYTHON_AVANCADO: ModuloDeVereda[] = [
  {
    id: 'm1',
    titulo: 'A função',
    resumo: 'Definir, chamar, receber valores e devolver um — e onde cada nome existe.',
    licoes: [
      {
        id: 'm1-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_PYTHON_AVANCADO['m1-teoria'],
        perguntas: 4,
        titulo: 'Definir e chamar',
        resumo: 'Parâmetro e argumento, retorno, valor padrão e escopo.',
        topicos: cap('funcao').topicos,
      },
    ],
  },
  {
    id: 'm2',
    titulo: 'As quatro coleções',
    resumo: 'Lista, tupla, dicionário e conjunto, e as duas perguntas que escolhem entre elas.',
    licoes: [
      {
        id: 'm2-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_PYTHON_AVANCADO['m2-teoria'],
        perguntas: 4,
        titulo: 'Guardar vários valores',
        resumo: 'O que cada uma das quatro garante, e o caso de uso de cada uma.',
        topicos: cap('colecoes').topicos,
      },
    ],
  },
  {
    id: 'm3',
    titulo: 'Guardar em arquivo',
    resumo: 'Gravar, ler, e saber em que pasta o arquivo foi parar.',
    licoes: [
      {
        id: 'm3-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_PYTHON_AVANCADO['m3-teoria'],
        perguntas: 4,
        titulo: 'O que sobrevive ao fechar',
        resumo: 'open, os modos, o with, e o caminho relativo.',
        topicos: cap('arquivos').topicos,
      },
      {
        id: 'm3-lab', tipo: 'laboratorio', linguagem: 'python',
        titulo: 'O caderno de presença',
        resumo: 'Ler o que a secretaria exportou, gravar o resultado, e reler para conferir.',
        arquivo: 'presenca.py',
        projeto: 'caderno-de-presenca',
        /*
          O dado chega pronto, e é só de leitura.

          Mandar a pessoa gravar primeiro para ler depois mediria gravar duas
          vezes. O que existe na vida é o arquivo que já estava lá — e ele chega
          como arquivo de verdade chega: com um espaço sobrando numa linha e uma
          linha em branco no meio. Sem isso, o `.strip()` da lição seria um
          detalhe sem consequência, e o programa passaria sem ele.
        */
        arquivosDoProjeto: [
          { nome: 'unidades.txt', modelo: 'Falcão\nPantera   \n\nÁguia\n' },
        ],
        verificacoes: ['abreParaLer', 'abreParaEscrever', 'abreComWith', 'roda', 'saidaEsperada'],
        saidaEsperada: `Unidade: Falcão
Unidade: Pantera
Unidade: Águia`,
        modelo: `# O caderno de presença do clube
#
# Na pasta, ao lado deste arquivo, está o unidades.txt — uma unidade por linha,
# como a secretaria exportou. Ele é só de leitura: é o dado que chegou, e dado
# que chega não se conserta na fonte.
#
# Escreva um programa que:
#
#   1. leia o unidades.txt;
#   2. grave um presenca.txt com uma linha "Unidade: <nome>" para cada unidade;
#   3. abra o presenca.txt e mostre na tela o que ficou gravado.
#
# O passo 3 não é enfeite. Programa que grava e nunca relê é programa que você
# acredita que funcionou — reler é como se confere.
#
# Duas coisas que o arquivo de verdade traz e o exercício limpo não traz: uma
# linha tem espaço sobrando no fim, e há uma linha em branco no meio. As duas
# aparecem na saída se ninguém cuidar delas.
#
# Use o with nas três aberturas, e encoding="utf-8" em todas — sem ele o
# "Falcão" volta certo num computador e errado no outro.
`,
      },
    ],
  },
  {
    id: 'm4',
    titulo: 'CSV e JSON',
    resumo: 'Os dois formatos que o clube encontra, e o que cada um guarda bem.',
    licoes: [
      {
        id: 'm4-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_PYTHON_AVANCADO['m4-teoria'],
        perguntas: 4,
        titulo: 'Tabela e estrutura',
        resumo: 'O módulo csv, o módulo json, e a pergunta que decide entre os dois.',
        topicos: cap('csv-e-json').topicos,
      },
    ],
  },
  {
    id: 'm5',
    titulo: 'Quando o usuário erra',
    resumo: 'try, except, o erro certo, e o laço que insiste até a entrada valer.',
    licoes: [
      {
        id: 'm5-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_PYTHON_AVANCADO['m5-teoria'],
        perguntas: 4,
        titulo: 'O programa que não morre',
        resumo: 'Prever o erro que vem de fora, e pegar só ele.',
        topicos: cap('erros-tratados').topicos,
      },
    ],
  },
  {
    id: 'm6',
    titulo: 'Bibliotecas',
    resumo: 'A biblioteca padrão, a de terceiros, e o gerenciador que instala.',
    licoes: [
      {
        id: 'm6-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_PYTHON_AVANCADO['m6-teoria'],
        perguntas: 4,
        titulo: 'Código que outra pessoa escreveu',
        resumo: 'import, pip, PyPI, requirements.txt e o critério de escolha.',
        topicos: cap('bibliotecas').topicos,
      },
    ],
  },
  {
    id: 'm7',
    titulo: 'Um programa em partes',
    resumo: 'Dois arquivos, três funções com papéis distintos, e o histórico desde o começo.',
    licoes: [
      {
        id: 'm7-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_PYTHON_AVANCADO['m7-teoria'],
        perguntas: 4,
        titulo: 'Dividir para conseguir mexer',
        resumo: 'O módulo, a divisão entre ler, decidir e mostrar, e o commit do primeiro dia.',
        topicos: cap('programa-em-partes').topicos,
      },
    ],
  },
];
