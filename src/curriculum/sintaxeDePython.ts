/*
 * A vereda CC002 Python.
 *
 * ── De onde ela vem ──────────────────────────────────────────────────────
 * Da CC001. Quem sai de lá sabe o que são sequência, repetição, condição,
 * variável e evento — sabe montando, arrastando peças que só encaixam onde
 * fazem sentido. Aqui as mesmas cinco ideias voltam, e a diferença é que agora
 * elas se escrevem: não há peça que se recuse a encaixar, e o computador
 * obedece exatamente ao que está no arquivo.
 *
 * ── O que muda de verdade ────────────────────────────────────────────────
 * Três coisas, e é bom dizê-las cedo porque são as três que assustam.
 *
 * A primeira é que o erro passa a existir. No Scratch não há erro de sintaxe;
 * aqui, uma letra fora do lugar impede o programa inteiro de rodar. A vereda
 * trata isso como assunto, e não como acidente: o módulo 7 é sobre ler a
 * mensagem de erro, que é uma habilidade e não um castigo.
 *
 * A segunda é que o programa não tem palco. O que ele faz aparece como texto,
 * escrito por `print()` — e é por isso que quase todo exemplo aqui traz, ao
 * lado, a saída que ele produz.
 *
 * A terceira é o recuo. Em Python o espaço à esquerda **é** a sintaxe: é ele
 * que diz o que está dentro do `if` e o que está fora. Vindo dos blocos isso é
 * mais fácil do que parece, porque a boca do bloco era exatamente isso — o
 * recuo é a boca, desenhada com espaços.
 *
 * ── A ordem ──────────────────────────────────────────────────────────────
 * A do documento: o ambiente primeiro, porque sem Python instalado não há o que
 * fazer; depois as estruturas, uma por módulo, cada uma cobrada no laboratório
 * dela; depois o erro; e por fim o programa livre, que cobra a vereda inteira.
 */

import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DE_PYTHON } from './questoesDePython';
import type { FalhaPlantada } from '../labs/falhasDePython';

/*
  O laboratório desta vereda: um arquivo .py, e o enunciado dentro dele.

  O enunciado mora no próprio modelo, em comentário, e não num cartão fora do
  editor — é onde ele fica à vista enquanto se escreve, e é assim que um exercício
  de programação chega a quem programa.

  ── Por que `roda` quase não aparece ─────────────────────────────────────
  "O programa roda até o fim" é verdade num arquivo só de comentários: o
  laboratório abriria com uma tarefa verde de graça, que é o defeito que esta
  casa mais persegue. Quem carrega o peso é `saidaEsperada`, que exige rodar
  **e** acertar. `roda` fica onde ele significa alguma coisa: no laboratório de
  consertar, cujo modelo não roda mesmo, e no programa livre, que não tem saída
  fixa para comparar.
*/
const laboratorio = (
  id: string,
  titulo: string,
  resumo: string,
  enunciado: string,
  verificacoes: string[],
  extra: {
    saidaEsperada?: string;
    entradaPadrao?: string[];
    falhas?: FalhaPlantada[];
  } = {},
) => ({
  id, tipo: 'laboratorio' as const, titulo, resumo,
  linguagem: 'python' as const,
  arquivo: 'programa.py',
  projeto: 'python-do-clube',
  modelo: enunciado,
  verificacoes,
  ...extra,
});

/* ────────────────────────────────────────────────────────────────────────
   Os capítulos de teoria
   ──────────────────────────────────────────────────────────────────────── */

const CAPITULOS: { id: string; titulo: string; resumo: string; topicos: TopicoDeVereda[] }[] = [
  {
    id: 'a-linguagem',
    titulo: 'A linguagem escrita',
    resumo: 'O que é Python, o que muda ao sair dos blocos, e como o programa chega ao computador.',
    topicos: [
      {
        id: 'o-que-e-python',
        titulo: 'O que é Python',
        resumo: 'Uma linguagem de propósito geral, e por que ela é a primeira escrita.',
        explicacao: [
          'Python é uma linguagem de programação criada por Guido van Rossum e publicada em 1991. O nome não vem da cobra: vem do grupo de humor britânico Monty Python, de que ele gostava.',
          'Ela serve para quase tudo — sites, análise de dados, automação, inteligência artificial, o telescópio espacial. É uma das linguagens mais usadas do mundo, e é a que mais escolas usam para começar.',
          'O motivo é a leitura. Um programa em Python se parece com uma lista de instruções em inglês, sem pontuação decorativa. Isso não o torna menos poderoso: torna o que ele faz mais fácil de enxergar.',
        ],
        exemplo: `nome = "Ana"
idade = 12
print("Olá,", nome)
print("Ano que vem você faz", idade + 1)`,
        exemploComo: 'python',
        exemploSaida: `Olá, Ana
Ano que vem você faz 13`,
        atencao: 'Python é sensível a maiúsculas. `Nome` e `nome` são duas variáveis diferentes, e `Print` não existe — o certo é `print`. É o primeiro erro de quase todo mundo, e a mensagem que ele produz diz exatamente isso.',
        marcas: ['Python', 'van Rossum', '1991'],
      },
      {
        id: 'blocos-e-texto',
        titulo: 'Do bloco para a linha',
        resumo: 'As mesmas ideias, escritas.',
        explicacao: [
          'Tudo o que você montou no Scratch existe aqui, com outro nome. O "sempre" é o `while`; o "repita 10 vezes" é o `for`; o "se ... então" é o `if`; a variável continua sendo uma variável.',
          'O que se perde é a garantia: no Scratch, um bloco só encaixa onde faz sentido, e por isso não existe erro de sintaxe. Escrevendo, dá para escrever qualquer coisa — e o Python vai recusar o que não entender.',
          'O que se ganha é tudo o mais. Um programa escrito cabe num arquivo de texto, roda em qualquer computador, entra num sistema de versões, e não tem teto de tamanho.',
        ],
        exemplo: `# no Scratch: repita 4 vezes / mova 10 passos
for volta in range(4):
    print("passo", volta + 1)`,
        exemploComo: 'python',
        exemploSaida: `passo 1
passo 2
passo 3
passo 4`,
        atencao: 'O que está depois de `#` é comentário: o Python ignora a linha inteira. Comentário serve para explicar **por que** algo está ali — repetir o que o código já diz só faz o arquivo crescer.',
        marcas: ['for', 'while', 'if', 'comentário'],
      },
      {
        id: 'como-o-programa-roda',
        titulo: 'Como um programa chega a rodar',
        resumo: 'Arquivo, interpretador, e a diferença entre escrever e executar.',
        explicacao: [
          'Um programa em Python é um arquivo de texto que termina em `.py`. Nada mais: dá para escrevê-lo no Bloco de Notas.',
          'Quem o executa é o interpretador — o programa chamado `python`, que você vai instalar no laboratório deste módulo. Ele lê o arquivo de cima para baixo e faz o que está escrito, uma linha por vez.',
          'Escrever e executar são dois momentos separados, e é comum esquecer o segundo: salvar o arquivo não faz nada acontecer. É preciso pedir ao interpretador que o leia.',
        ],
        exemplo: `C:\\Users\\voce\\Documents> python programa.py
Olá, Ana
Ano que vem você faz 13`,
        exemploComo: 'texto',
        atencao: 'Editar o arquivo e não salvar é a causa mais comum de "consertei e continua igual": o interpretador lê o que está no disco, e não o que está na tela do editor.',
        marcas: ['.py', 'interpretador', 'executar'],
      },
    ],
  },

  {
    id: 'variaveis',
    titulo: 'Guardar valores',
    resumo: 'A variável, os quatro tipos que a vereda cobra, e por que o tipo importa.',
    topicos: [
      {
        id: 'a-variavel',
        titulo: 'Um nome para um valor',
        resumo: 'Atribuir, e ler de novo depois.',
        explicacao: [
          'Uma variável é um nome que guarda um valor. Você escreve `placar = 0` e, a partir dali, `placar` vale zero em qualquer lugar do programa.',
          'O sinal de igual não é uma pergunta: é uma ordem. Ele significa "guarde à esquerda o que está à direita", e é por isso que `placar = placar + 1` faz sentido — o Python calcula a direita primeiro e depois guarda.',
          'O nome é escolha sua, e vale escolher bem: quem lê `total_de_pontos` entende; quem lê `x2` precisa adivinhar. Nomes em Python começam com letra, não têm espaço e, por convenção, usam sublinhado entre as palavras.',
        ],
        exemplo: `placar = 0
placar = placar + 10
placar = placar + 5
print("Pontos:", placar)`,
        exemploComo: 'python',
        exemploSaida: 'Pontos: 15',
        atencao: 'Ler uma variável antes de guardar alguma coisa nela é erro de execução, e a mensagem é `NameError`. O Python não supõe zero: ele diz que aquele nome não existe.',
        marcas: ['variável', 'atribuição', '='],
      },
      {
        id: 'os-quatro-tipos',
        titulo: 'Os quatro tipos',
        resumo: 'Inteiro, decimal, texto e verdadeiro-ou-falso.',
        explicacao: [
          'Todo valor tem um tipo, e o tipo decide o que dá para fazer com ele. Quatro bastam para esta vereda inteira.',
          '`int` é número inteiro: 0, 12, -3. `float` é número com casas decimais: 1.75, 0.5 — e a casa decimal é **ponto**, e não vírgula. `str` é texto, sempre entre aspas: "Ana". `bool` é verdadeiro ou falso, escrito `True` e `False`, com maiúscula.',
          'O Python descobre o tipo sozinho, pelo que você escreveu. Não é preciso declarar nada — mas é preciso saber, porque a conta muda conforme o tipo.',
        ],
        exemplo: `idade = 12
altura = 1.58
nome = "Ana"
inscrito = True

print(idade, altura, nome, inscrito)
print(type(idade), type(altura))`,
        exemploComo: 'python',
        exemploSaida: `12 1.58 Ana True
<class 'int'> <class 'float'>`,
        atencao: '`1,58` não é um número com vírgula: para o Python são dois valores separados por vírgula. Escrever altura com vírgula não dá erro na hora — dá uma conta errada mais adiante, que é bem pior.',
        marcas: ['int', 'float', 'str', 'bool'],
      },
      {
        id: 'texto-que-parece-numero',
        titulo: 'Texto que parece número',
        resumo: 'A armadilha que mais custa tempo.',
        explicacao: [
          '`"12"` entre aspas é texto, e não o número doze. Os dois aparecem iguais na tela e se comportam de formas completamente diferentes.',
          'Somar dois textos não soma: junta. `"12" + "3"` dá `"123"`, e o Python não reclama de nada — o resultado está errado e o programa continua rodando.',
          'Converter é explícito: `int("12")` devolve o número doze, e `str(12)` devolve o texto "12". É uma linha a mais, e ela evita o erro mais comum de quem começa.',
        ],
        exemplo: `a = "12"
b = "3"
print(a + b)
print(int(a) + int(b))`,
        exemploComo: 'python',
        exemploSaida: `123
15`,
        atencao: 'Este é o defeito silencioso desta vereda: nenhuma mensagem, nenhuma linha vermelha, e uma soma que virou emenda. Quando um número sair estranho, a primeira pergunta é sempre "isso aqui é número mesmo?".',
        marcas: ['int()', 'str()', 'concatenação'],
      },
    ],
  },

  {
    id: 'entrada-e-saida',
    titulo: 'Conversar com quem usa',
    resumo: 'Mostrar com print, perguntar com input, e converter o que chega.',
    topicos: [
      {
        id: 'o-print',
        titulo: 'Mostrar na tela',
        resumo: 'print, e o que ele faz com as vírgulas.',
        explicacao: [
          '`print()` escreve na tela o que estiver entre os parênteses. É a única janela do programa para fora: sem ele, o programa faz tudo em silêncio e ninguém vê nada.',
          'Passando vários valores separados por vírgula, ele os escreve na mesma linha, com um espaço entre cada um — e não é preciso converter nada: `print` aceita número e texto misturados.',
          'Cada `print` termina a linha. Dois `print` produzem duas linhas.',
        ],
        exemplo: `nome = "Ana"
pontos = 15
print("Desbravador:", nome)
print("Pontos:", pontos, "de 20")`,
        exemploComo: 'python',
        exemploSaida: `Desbravador: Ana
Pontos: 15 de 20`,
        atencao: 'Vírgula dentro do `print` põe um espaço; o sinal de mais, não. E `+` entre texto e número dá erro de execução — `print("Pontos: " + 15)` para o programa, enquanto a versão com vírgula funciona.',
        marcas: ['print()', 'vírgula'],
      },
      {
        id: 'o-input',
        titulo: 'Perguntar a quem usa',
        resumo: 'input, e o que ele sempre devolve.',
        explicacao: [
          '`input()` para o programa, espera alguém digitar, e devolve o que foi digitado. O texto entre parênteses é a pergunta que aparece antes do cursor.',
          '`input()` **sempre devolve texto**. Mesmo que a pessoa digite 12, o que chega é `"12"` — e aí a soma vira emenda, que é a armadilha do módulo anterior aparecendo de novo, agora no lugar onde ela mais acontece.',
          'Por isso, quando o que se pede é número, a conversão vem junto: `int(input("Idade: "))`. Lê-se de dentro para fora — primeiro pergunta, depois converte.',
          'No painel ao lado, repare que as duas perguntas aparecem grudadas e o que foi digitado não aparece. É assim mesmo aqui e no laboratório: a entrada é decidida antes, num campo próprio, e por isso ela não é ecoada. No computador do clube, onde você digita na hora, cada resposta aparece logo depois da pergunta.',
        ],
        exemplo: `nome = input("Seu nome: ")
idade = int(input("Sua idade: "))
print("Olá,", nome)
print("Ano que vem você faz", idade + 1)`,
        exemploComo: 'python',
        exemploEntrada: ['Ana', '12'],
        exemploSaida: `Seu nome: Sua idade: Olá, Ana
Ano que vem você faz 13`,
        atencao: 'Se a pessoa digitar "doze" onde se esperava 12, `int()` para o programa com `ValueError`. Isso não é um defeito do seu programa: é o programa recusando um dado que não serve, e recusar é melhor do que calcular errado.',
        marcas: ['input()', 'int(input())'],
      },
      {
        id: 'o-recuo',
        titulo: 'O recuo é a sintaxe',
        resumo: 'O que em blocos era a boca, aqui são espaços.',
        explicacao: [
          'Em quase toda linguagem o recuo é enfeite. Em Python, não: é ele que diz o que está dentro de quê.',
          'A linha que abre um bloco termina em dois-pontos, e o que vem dentro fica recuado. O padrão são quatro espaços — e o que decide não é o número, é a constância: todas as linhas do mesmo bloco têm de ter o mesmo recuo.',
          'Vindo do Scratch isso já é conhecido. A boca do bloco "repita" era exatamente isto, desenhada; aqui ela é o espaço à esquerda.',
        ],
        exemplo: `for volta in range(3):
    print("dentro do laço:", volta)
print("fora do laço")`,
        exemploComo: 'python',
        exemploSaida: `dentro do laço: 0
dentro do laço: 1
dentro do laço: 2
fora do laço`,
        atencao: 'Recuo errado é erro de sintaxe, e a mensagem é `IndentationError`. É chato no começo e vira aliado depois: em Python, um programa que roda é um programa cujo desenho na tela é a estrutura de verdade.',
        marcas: ['recuo', 'dois-pontos', 'IndentationError'],
      },
    ],
  },

  {
    id: 'operadores',
    titulo: 'Contas e comparações',
    resumo: 'Os operadores de conta, os de comparação, e a confusão entre = e ==.',
    topicos: [
      {
        id: 'as-contas',
        titulo: 'As contas',
        resumo: 'Soma, subtração, multiplicação, divisão — e as três divisões.',
        explicacao: [
          '`+`, `-` e `*` fazem o que se espera. A divisão é que tem três formas, e vale conhecer as três.',
          '`/` divide e devolve decimal, sempre: `10 / 2` dá `5.0`, e não `5`. `//` divide e joga fora a parte decimal: `10 // 3` dá `3`. `%` devolve o resto: `10 % 3` dá `1`.',
          'O resto é mais útil do que parece. `numero % 2 == 0` é como se pergunta se um número é par, e é assim que quase todo programa faz.',
        ],
        exemplo: `print(10 + 3)
print(10 / 3)
print(10 // 3)
print(10 % 3)
print(2 ** 8)`,
        exemploComo: 'python',
        exemploSaida: `13
3.3333333333333335
3
1
256`,
        atencao: 'A divisão com `/` devolve decimal mesmo quando a conta é exata. Se o resultado for aparecer na tela como quantidade de pessoas ou de itens, é `//` que se quer — ninguém tem 5.0 irmãos.',
        marcas: ['+', '/', '//', '%', '**'],
      },
      {
        id: 'as-comparacoes',
        titulo: 'As comparações',
        resumo: 'Perguntas cuja resposta é verdadeiro ou falso.',
        explicacao: [
          'Uma comparação é uma pergunta, e a resposta é sempre `True` ou `False`. São seis: `==` igual, `!=` diferente, `<` menor, `>` maior, `<=` menor ou igual, `>=` maior ou igual.',
          'O resultado é um valor como qualquer outro: dá para guardá-lo numa variável, imprimi-lo, ou — o que se faz o tempo todo — usá-lo para decidir alguma coisa.',
          'Comparação de texto também funciona, e compara caractere por caractere: `"ana" == "Ana"` é `False`, porque maiúscula e minúscula são letras diferentes.',
        ],
        exemplo: `nota = 7
print(nota >= 6)
print(nota == 10)
print(nota != 10)
print("ana" == "Ana")`,
        exemploComo: 'python',
        exemploSaida: `True
False
True
False`,
        atencao: 'Comparar decimais com `==` engana: `0.1 + 0.2 == 0.3` é `False`, porque o computador guarda decimais por aproximação. Para decimal, prefira `>=` e `<=`.',
        marcas: ['==', '!=', '>=', 'True', 'False'],
      },
      {
        id: 'igual-e-igual-igual',
        titulo: 'Um igual, ou dois',
        resumo: 'O erro que o Python felizmente recusa.',
        explicacao: [
          'Um sinal de igual **guarda**: `nota = 7` põe sete dentro de `nota`. Dois sinais **perguntam**: `nota == 7` responde se o que está lá dentro é sete.',
          'Trocar um pelo outro dentro de um `if` é o erro clássico. Em Python ele é erro de sintaxe — o programa não roda, e a mensagem diz o que fazer.',
          'Isso é sorte. Em várias outras linguagens `if (nota = 7)` é aceito, guarda sete na variável e segue como se a resposta fosse sim. O programa roda e a lógica está destruída.',
        ],
        exemplo: `nota = 7
# if nota = 7:      <- isto é erro de sintaxe
if nota == 7:
    print("tirou exatamente sete")`,
        exemploComo: 'python',
        exemploSaida: 'tirou exatamente sete',
        atencao: 'A mensagem do Python para esse caso é longa, e a parte que importa está no fim: `SyntaxError: invalid syntax. Maybe you meant \'==\' or \':=\' instead of \'=\'?`. Ler a última linha primeiro é o hábito que o módulo 7 vai cobrar.',
        marcas: ['=', '==', 'SyntaxError'],
      },
    ],
  },

  {
    id: 'condicao',
    titulo: 'Decidir',
    resumo: 'if, elif e else — e por que a ordem das perguntas importa.',
    topicos: [
      {
        id: 'o-if',
        titulo: 'O if',
        resumo: 'Fazer alguma coisa só quando a resposta é sim.',
        explicacao: [
          '`if` recebe uma pergunta e um bloco. Se a resposta for `True`, o bloco roda; se for `False`, o programa pula o bloco inteiro e segue na primeira linha sem recuo.',
          'A linha do `if` termina em dois-pontos, e o que ele controla vem recuado embaixo. É o mesmo desenho da boca do bloco no Scratch.',
          '`else` é o outro caminho: o que fazer quando a resposta foi não. Ele não recebe pergunta nenhuma, porque a pergunta já foi feita.',
        ],
        exemplo: `nota = 5

if nota >= 6:
    print("aprovado")
else:
    print("precisa de recuperação")`,
        exemploComo: 'python',
        exemploSaida: 'precisa de recuperação',
        atencao: 'Um `if` cujo bloco é só `pass` não decide nada — é o laço vazio da CC001, com outra palavra. As verificações desta vereda exigem corpo de verdade, e não a palavra-chave na tela.',
        marcas: ['if', 'else', ':'],
      },
      {
        id: 'o-elif',
        titulo: 'Mais de dois caminhos',
        resumo: 'elif, e por que ele não é um if novo.',
        explicacao: [
          'Quando há três ou mais caminhos, vem o `elif` — "senão, se". Ele só é perguntado quando o anterior deu não, e o primeiro que der sim encerra a série: os de baixo nem são olhados.',
          'É isso que o separa de escrever vários `if` seguidos. Com `if` independentes, todos são perguntados, e mais de um pode rodar.',
          'A ordem, portanto, faz parte da lógica. A pergunta mais restritiva vem primeiro; a mais larga, depois.',
        ],
        exemplo: `nota = 9

if nota >= 9:
    print("excelente")
elif nota >= 6:
    print("bom")
else:
    print("a recuperar")`,
        exemploComo: 'python',
        exemploSaida: 'excelente',
        atencao: 'Inverter a ordem quebra em silêncio. Com `if nota >= 6` antes de `elif nota >= 9`, quem tirou 9 é "bom" e "excelente" nunca acontece — o programa roda, sem erro nenhum, e a nota mais alta some.',
        marcas: ['elif', 'ordem'],
      },
      {
        id: 'combinar-perguntas',
        titulo: 'Duas perguntas de uma vez',
        resumo: 'and, or e not.',
        explicacao: [
          '`and` só é verdadeiro quando os dois lados são verdadeiros. `or` é verdadeiro quando pelo menos um é. `not` inverte a resposta.',
          'Escrevem-se com essas palavras, e não com símbolos: em Python é `if idade >= 10 and idade <= 15`, e não `&&`.',
          'Comparação em cadeia também funciona, e lê melhor: `if 10 <= idade <= 15` diz a mesma coisa, do jeito que se escreveria à mão.',
        ],
        exemplo: `idade = 12
tem_ficha = True

if 10 <= idade <= 15 and tem_ficha:
    print("pode se inscrever")
if not tem_ficha:
    print("falta a ficha")`,
        exemploComo: 'python',
        exemploSaida: 'pode se inscrever',
        atencao: '`if idade >= 10 or 15` parece dizer "entre 10 e 15" e não diz: o Python lê `15` sozinho, que é verdadeiro, e a condição inteira passa a ser sempre verdadeira. Cada lado precisa ser uma comparação inteira.',
        marcas: ['and', 'or', 'not'],
      },
    ],
  },

  {
    id: 'repeticao',
    titulo: 'Repetir',
    resumo: 'O for quando se sabe quantas vezes, o while quando não se sabe.',
    topicos: [
      {
        id: 'o-for',
        titulo: 'O for',
        resumo: 'Repetir uma vez para cada item.',
        explicacao: [
          '`for` percorre uma coleção e roda o bloco uma vez para cada item dela. A variável entre `for` e `in` recebe o item da vez.',
          '`range(4)` produz 0, 1, 2, 3 — quatro números, começando em zero e parando **antes** do quatro. `range(1, 5)` produz 1, 2, 3, 4.',
          'É o laço de quando se sabe o número de voltas. Vindo do Scratch, é o "repita 10 vezes".',
        ],
        exemplo: `for volta in range(3):
    print("volta", volta)

for letra in "sol":
    print(letra)`,
        exemploComo: 'python',
        exemploSaida: `volta 0
volta 1
volta 2
s
o
l`,
        atencao: '`range(4)` dá quatro voltas, e a última vale 3. Contar a partir de zero é a convenção de quase toda a programação, e esquecê-la é o erro de contagem mais comum que existe.',
        marcas: ['for', 'in', 'range()'],
      },
      {
        id: 'o-while',
        titulo: 'O while',
        resumo: 'Repetir enquanto alguma coisa for verdade.',
        explicacao: [
          '`while` recebe uma pergunta e repete o bloco enquanto a resposta for `True`. Ele confere antes de cada volta — se já começar falsa, o bloco não roda nenhuma vez.',
          'É o laço de quando não se sabe quantas voltas serão precisas: repetir até a pessoa acertar, até o dinheiro acabar, até chegar ao fim.',
          'E ele traz a única responsabilidade que o `for` não tem: alguma coisa dentro do bloco precisa fazer a condição virar falsa. Sem isso, o laço não termina.',
        ],
        exemplo: `senha = 0
tentativas = 0

while senha != 7:
    senha = senha + 3
    tentativas = tentativas + 1
    if tentativas > 5:
        break

print("tentativas:", tentativas)`,
        exemploComo: 'python',
        exemploSaida: 'tentativas: 6',
        atencao: '`while True:` sem `break` é um laço que nunca acaba. No laboratório o programa é encerrado depois de alguns segundos e a plataforma diz o que houve; no computador do clube, a janela trava e a saída é fechar o programa.',
        marcas: ['while', 'break'],
      },
      {
        id: 'qual-dos-dois',
        titulo: 'Qual dos dois usar',
        resumo: 'Quantidade conhecida, ou condição.',
        explicacao: [
          'Se dá para responder "quantas vezes?" antes de começar, é `for`. Cinco desbravadores, doze meses, cada letra de uma palavra.',
          'Se a resposta é "até que...", é `while`. Até acertar, até acabar, até somar o suficiente.',
          'Os dois aceitam `break`, que sai do laço na hora, e `continue`, que pula para a próxima volta. Usados com parcimônia eles ajudam; usados demais, transformam o laço num labirinto.',
        ],
        exemplo: `# quantas vezes: sabe-se
for i in range(3):
    print("chamada", i + 1)

# até que: não se sabe
total = 0
numero = 1
while total < 10:
    total = total + numero
    numero = numero + 1
print("total:", total)`,
        exemploComo: 'python',
        exemploSaida: `chamada 1
chamada 2
chamada 3
total: 10`,
        atencao: 'Um `while` com contador é quase sempre um `for` escrito de forma mais longa e mais fácil de errar: dá para esquecer de somar o contador, e aí o laço não termina. Quando a quantidade é conhecida, `for`.',
        marcas: ['for', 'while', 'break', 'continue'],
      },
    ],
  },

  {
    id: 'erros',
    titulo: 'Quando o programa erra',
    resumo: 'As três famílias de erro, como se distinguem, e como se lê a mensagem.',
    topicos: [
      {
        id: 'tres-familias',
        titulo: 'Três famílias, e quando cada uma aparece',
        resumo: 'Antes de rodar, no meio, ou nunca.',
        explicacao: [
          'O erro de sintaxe é o Python recusando o arquivo. Ele acontece antes de qualquer coisa rodar: nenhuma linha sai, nem a primeira. Falta de dois-pontos, aspas não fechadas, recuo torto.',
          'O erro de execução acontece no meio. O programa começa, escreve o que já tinha para escrever, e para com uma mensagem — dividir por zero, converter "doze" com `int()`, usar um nome que não existe.',
          'O erro de lógica não aparece nunca. O programa roda até o fim, sem reclamar de nada, e a resposta está errada. É o pior dos três, e o único que nenhuma ferramenta aponta.',
        ],
        exemplo: `# lógica: roda até o fim, e a média está errada
notas = [8, 6, 10]
soma = 0
for n in notas:
    soma = soma + n
media = soma / 2
print("média:", media)`,
        exemploComo: 'python',
        exemploSaida: 'média: 12.0',
        atencao: 'A média de 8, 6 e 10 é 8 — e o programa disse 12. Nenhuma mensagem, nenhuma linha vermelha: só um número que quem não conferir vai acreditar.',
        marcas: ['sintaxe', 'execução', 'lógica'],
      },
      {
        id: 'ler-a-mensagem',
        titulo: 'Ler a mensagem de erro',
        resumo: 'A última linha diz o quê; a de cima diz onde.',
        explicacao: [
          'A mensagem do Python se lê de baixo para cima. A última linha nomeia o erro — `ZeroDivisionError`, `ValueError`, `NameError` — e é ela que diz o que aconteceu.',
          'Logo acima vem o caminho até ali: o arquivo e o número da linha. Esse número é do **seu** arquivo, e é onde começar a procurar.',
          'Mensagem de erro não é bronca. É o computador dizendo, com precisão, onde ele parou e por quê — e quem aprende a lê-la resolve sozinho a maior parte dos problemas.',
        ],
        exemplo: `Traceback (most recent call last):
  File "programa.py", line 3, in <module>
    media = soma / quantos
            ~~~~~^~~~~~~~~
ZeroDivisionError: division by zero`,
        exemploComo: 'texto',
        atencao: 'O nome do erro é em inglês e não vai mudar. São poucos, e vale reconhecê-los: `NameError` é nome que não existe, `TypeError` é tipo trocado, `ValueError` é valor que não serve, `IndexError` é posição fora da lista.',
        marcas: ['Traceback', 'ZeroDivisionError', 'linha'],
      },
      {
        id: 'como-se-procura',
        titulo: 'Como se procura um erro de lógica',
        resumo: 'Sem mensagem, a ferramenta é o print.',
        explicacao: [
          'Erro de lógica não deixa pista, então a pista se fabrica: põe-se um `print` no meio do programa mostrando o que cada variável vale naquele ponto.',
          'Compara-se o que o programa mostrou com o que deveria valer. O primeiro ponto em que os dois divergem é onde o erro está — e não onde o resultado apareceu errado.',
          'Depois de achado, tiram-se os `print` de investigação. Eles serviram para descobrir, e não fazem parte do programa.',
        ],
        exemplo: `notas = [8, 6, 10]
soma = 0
for n in notas:
    soma = soma + n
print("conferindo — soma:", soma, "quantidade:", len(notas))
media = soma / len(notas)
print("média:", media)`,
        exemploComo: 'python',
        exemploSaida: `conferindo — soma: 24 quantidade: 3
média: 8.0`,
        atencao: 'Antes de mexer no código, vale ler o programa em voz alta como se você fosse o computador. Metade dos erros de lógica aparece nessa leitura, sem nenhuma ferramenta.',
        marcas: ['print de depuração', 'len()'],
      },
    ],
  },

  {
    id: 'programa',
    titulo: 'Um programa seu',
    resumo: 'Como se planeja um programa de quarenta linhas, e como se apresenta o que se fez.',
    topicos: [
      {
        id: 'planejar',
        titulo: 'Antes de escrever',
        resumo: 'Entrada, processamento e saída.',
        explicacao: [
          'Quase todo programa pequeno tem três partes na mesma ordem: recebe alguma coisa, faz alguma coisa com ela, e mostra o resultado. Decidir as três antes de escrever poupa a maior parte do retrabalho.',
          'Escreva em português, em três linhas, o que entra, o que se faz e o que sai. Se não couber em três linhas, o programa está fazendo mais de uma coisa — e vale separá-lo.',
          'Escolha um assunto que você conheça: a chamada da unidade, o placar de um jogo do clube, quanto falta para o acampamento. Programa sobre coisa que se conhece é mais fácil de conferir, porque você sabe qual deveria ser a resposta.',
        ],
        exemplo: `# entra:  as notas de três desbravadores
# faz:    soma, tira a média, decide o conceito
# sai:    o conceito de cada um e a média da turma`,
        exemploComo: 'python',
        atencao: 'Quarenta linhas é menos do que parece: um programa com entrada, uma decisão de três caminhos e um laço já passa disso. Linha em branco e linha só de comentário não contam — o requisito é de programa.',
        marcas: ['entrada', 'processamento', 'saída'],
      },
      {
        id: 'organizar',
        titulo: 'Deixar legível',
        resumo: 'Nomes, comentários, e a ordem das partes.',
        explicacao: [
          'O programa vai ser lido — pelo examinador, e por você daqui a um mês. Nome de variável que diz o que guarda vale mais do que qualquer comentário.',
          'Agrupe: primeiro o que prepara, depois o que pergunta, depois o que decide, depois o que mostra. Um programa que salta de assunto a assunto é difícil de explicar em voz alta, e explicar é parte do requisito.',
          'Comentário explica o **porquê**, e não o quê. `# soma 1 a placar` não acrescenta nada; `# a maçã afasta depois do ponto, senão marca vários de uma vez` acrescenta.',
        ],
        exemplo: `# prepara
notas = []
aprovados = 0

# pergunta
for i in range(3):
    notas.append(int(input("Nota: ")))

# decide e mostra
for nota in notas:
    if nota >= 6:
        aprovados = aprovados + 1
print("aprovados:", aprovados, "de", len(notas))`,
        exemploComo: 'python',
        exemploEntrada: ['8', '5', '10'],
        exemploSaida: `Nota: Nota: Nota: aprovados: 2 de 3`,
        atencao: 'Um programa que roda e ninguém entende cumpre metade do requisito. A outra metade é explicá-lo — e o que não se consegue explicar em voz alta costuma ser o que não se entendeu ao escrever.',
        marcas: ['nomes', 'comentários', 'organização'],
      },
      {
        id: 'apresentar',
        titulo: 'Explicar o que se fez',
        resumo: 'O requisito mais difícil, e o mais honesto.',
        explicacao: [
          'O último requisito pede que você apresente o programa ao examinador, explicando o que cada parte faz.',
          'Não é ler o código em voz alta: ele está vendo a tela. O que ele não vê é a intenção — por que aquele `if` está dentro daquele `for`, e o que aconteceria se não estivesse.',
          'É o mais difícil e o mais honesto: escrever copiando é possível, explicar copiando não é. Quando você entregar o programa, a plataforma escreve um roteiro do **seu** programa, parte por parte, para você treinar.',
        ],
        exemplo: `"Esta parte roda assim que eu mando executar.
 Ela cria uma lista vazia e um contador em zero,
 depois pergunta três notas e guarda cada uma na lista.
 Aí ela percorre a lista, e a cada nota maior ou igual a seis
 soma um no contador. No fim, mostra quantos passaram."`,
        exemploComo: 'texto',
        atencao: 'Treine em voz alta, e não só na cabeça. Explicar por dentro parece fácil até a primeira vez que se tenta na frente de alguém.',
        marcas: ['apresentação', 'roteiro'],
      },
    ],
  },
];

const cap = (id: string) => CAPITULOS.find(c => c.id === id)!;

/* ────────────────────────────────────────────────────────────────────────
   Os módulos
   ──────────────────────────────────────────────────────────────────────── */

export const MODULOS_DE_PYTHON: ModuloDeVereda[] = [
  {
    id: 'm1',
    titulo: 'A linguagem escrita',
    resumo: 'O que é Python, o que muda ao sair dos blocos, e um ambiente que funciona.',
    licoes: [
      {
        id: 'm1-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_PYTHON['m1-teoria'],
        titulo: 'Do bloco para a linha',
        resumo: 'A linguagem, o que se ganha e o que se perde, e como um arquivo vira programa.',
        topicos: cap('a-linguagem').topicos,
      },
      {
        /*
          O computador simulado, e não um editor.

          O requisito 4 pede demonstrar um ambiente que funciona: baixar do site
          certo, instalar, salvar um .py e executá-lo pelo prompt. Nada disso
          acontece num editor onde o Python já está pronto — e é justamente o
          que trava o desbravador no computador do clube.
        */
        id: 'm1-lab', tipo: 'ambiente',
        titulo: 'Instalando o Python',
        resumo: 'Baixe do site oficial, instale, salve um programa e rode pelo Prompt de Comando.',
        verificacoes: ['baixouDoSiteOficial', 'instalouOPython', 'salvouOArquivoPy', 'rodouNoPrompt'],
      },
    ],
  },
  {
    id: 'm2',
    titulo: 'Guardar valores',
    resumo: 'A variável, os quatro tipos, e o texto que parece número.',
    licoes: [
      {
        id: 'm2-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_PYTHON['m2-teoria'],
        titulo: 'Variáveis e tipos',
        resumo: 'Um nome para um valor, os quatro tipos da vereda, e a soma que vira emenda.',
        topicos: cap('variaveis').topicos,
      },
      laboratorio(
        'm2-lab',
        'A ficha do desbravador',
        'Uma variável de cada tipo, e as quatro mostradas na tela.',
        `# A ficha do desbravador
#
# Crie quatro variáveis, uma de cada tipo:
#   - o nome, em texto
#   - a idade, em número inteiro
#   - a altura, em número com casas decimais
#   - se está inscrito no acampamento, em verdadeiro ou falso
#
# Depois mostre as quatro, uma por linha, exatamente assim:
#
#   Nome: Ana
#   Idade: 12
#   Altura: 1.58
#   Inscrito: True
`,
        ['tipoTexto', 'tipoInteiro', 'tipoDecimal', 'tipoBooleano', 'saidaEsperada'],
        { saidaEsperada: 'Nome: Ana\nIdade: 12\nAltura: 1.58\nInscrito: True' },
      ),
    ],
  },
  {
    id: 'm3',
    titulo: 'Conversar com quem usa',
    resumo: 'Mostrar com print, perguntar com input, e o recuo que é sintaxe.',
    licoes: [
      {
        id: 'm3-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_PYTHON['m3-teoria'],
        titulo: 'Entrada e saída',
        resumo: 'print, input, a conversão que vem junto, e o espaço à esquerda.',
        topicos: cap('entrada-e-saida').topicos,
      },
      laboratorio(
        'm3-lab',
        'Quantos anos você faz',
        'Perguntar duas coisas, converter o que precisa ser número, e responder.',
        `# Quantos anos você faz
#
# Pergunte o nome e a idade, e responda.
#
# As duas perguntas são exatamente estas, com o espaço depois dos dois-pontos:
#   "Seu nome: "
#   "Sua idade: "
#
# Depois mostre duas linhas:
#   Olá, Ana
#   Ano que vem você faz 13
#
# Repare no painel de saída: as perguntas aparecem grudadas, e o que foi
# digitado não aparece. É assim mesmo — a entrada é decidida antes, no campo
# ao lado, e por isso ela não é ecoada.
`,
        ['leEExibe', 'saidaEsperada'],
        {
          entradaPadrao: ['Ana', '12'],
          saidaEsperada: 'Seu nome: Sua idade: Olá, Ana\nAno que vem você faz 13',
        },
      ),
    ],
  },
  {
    id: 'm4',
    titulo: 'Contas e comparações',
    resumo: 'As três divisões, as seis comparações, e a diferença entre = e ==.',
    licoes: [
      {
        id: 'm4-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_PYTHON['m4-teoria'],
        titulo: 'Operadores',
        resumo: 'Contas, perguntas de verdadeiro ou falso, e o erro que o Python recusa.',
        topicos: cap('operadores').topicos,
      },
      laboratorio(
        'm4-lab',
        'O caixa do acampamento',
        'Uma conta, uma comparação, e três linhas de resultado.',
        `# O caixa do acampamento
#
# A unidade arrecadou 480 reais e gastou 375. São 12 desbravadores.
#
# Calcule e mostre, uma por linha:
#
#   Sobrou: 105                 (o que arrecadou menos o que gastou)
#   Por desbravador: 8.75       (o que sobrou dividido pelos 12)
#   Fechou no azul? True        (se o que sobrou é maior que zero)
#
# Escreva as contas, e não os resultados: quem calcula é o programa.
`,
        ['operadorAritmetico', 'operadorComparacao', 'saidaEsperada'],
        { saidaEsperada: 'Sobrou: 105\nPor desbravador: 8.75\nFechou no azul? True' },
      ),
    ],
  },
  {
    id: 'm5',
    titulo: 'Decidir',
    resumo: 'if, elif e else, a ordem das perguntas, e as três palavras que as combinam.',
    licoes: [
      {
        id: 'm5-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_PYTHON['m5-teoria'],
        titulo: 'A condição',
        resumo: 'Um caminho, dois, ou vários — e por que a ordem faz parte da lógica.',
        topicos: cap('condicao').topicos,
      },
      laboratorio(
        'm5-lab',
        'O conceito da prova',
        'Três caminhos, com if, elif e else.',
        `# O conceito da prova
#
# A nota já está guardada abaixo. Mostre o conceito dela, numa linha só,
# usando if, elif e else:
#
#   9 ou mais    -> excelente
#   de 6 a 8     -> bom
#   abaixo de 6  -> a recuperar
#
# Com a nota que está aí, a saída é uma linha:
#
#   bom
#
# Depois de acertar, troque o 7 por 10 e por 4 e execute de novo, para ver
# os outros dois caminhos. Deixe o 7 no fim.

nota = 7
`,
        ['condicionalCompleto', 'saidaEsperada'],
        { saidaEsperada: 'bom' },
      ),
    ],
  },
  {
    id: 'm6',
    titulo: 'Repetir',
    resumo: 'O for de quantidade conhecida, o while de condição, e quando usar cada um.',
    licoes: [
      {
        id: 'm6-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_PYTHON['m6-teoria'],
        titulo: 'Os dois laços',
        resumo: 'range e contagem a partir de zero, o laço que não termina, e a escolha entre os dois.',
        topicos: cap('repeticao').topicos,
      },
      laboratorio(
        'm6-lab',
        'A chamada e a vaquinha',
        'Um for de quantidade conhecida, e um while de condição.',
        `# A chamada e a vaquinha
#
# Duas partes, nesta ordem.
#
# 1. Com um for, escreva "Presente!" uma vez para cada um dos 4 desbravadores.
#
# 2. Com um while, some 25 reais de cada vez até juntar 100 ou mais, contando
#    quantas contribuições foram precisas. Depois mostre:
#
#      Foram 4 contribuicoes
#
# A saída inteira fica assim:
#
#   Presente!
#   Presente!
#   Presente!
#   Presente!
#   Foram 4 contribuicoes
#
# Cuidado com o while: alguma coisa dentro dele precisa fazer a condição
# virar falsa, senão o programa não para.
`,
        ['lacoFor', 'lacoWhile', 'saidaEsperada'],
        {
          saidaEsperada: 'Presente!\nPresente!\nPresente!\nPresente!\nForam 4 contribuicoes',
        },
      ),
    ],
  },
  {
    id: 'm7',
    titulo: 'Quando o programa erra',
    resumo: 'As três famílias de erro, a leitura da mensagem, e a caça ao erro de lógica.',
    licoes: [
      {
        id: 'm7-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_PYTHON['m7-teoria'],
        titulo: 'Os três tipos de erro',
        resumo: 'Antes de rodar, no meio, ou nunca — e o que fazer em cada caso.',
        topicos: cap('erros').topicos,
      },
      laboratorio(
        'm7-lab',
        'Três falhas para achar',
        'Consertar as três, e dizer de que família era cada uma.',
        `# A média da unidade
#
# Este programa deveria mostrar a soma das notas, a média e o conceito.
# Ele tem três falhas, uma de cada família.
#
# Conserte as três, e classifique cada uma no painel de Problemas, embaixo.
# Quando estiver certo, a saída é:
#
#   Soma: 24
#   Media: 8.0
#   Conceito: bom

notas = [8, 6, 10]
soma = 0

for n in notas
    soma = soma + n

print("Soma:", soma)

media = soma / 0
print("Media:", media)

if media >= 9:
    print("Conceito: excelente")
else:
    print("Conceito: a recuperar")
`,
        ['roda', 'saidaEsperada', 'classificouAsFalhas'],
        {
          saidaEsperada: 'Soma: 24\nMedia: 8.0\nConceito: bom',
          /*
            O sintoma é o que se vê acontecer, e nunca onde está nem como se
            conserta: "a média sai sempre zero" é sintoma, "falta um int() na
            linha 4" é gabarito — e gabarito faria o painel abrir resolvido.
          */
          falhas: [
            {
              id: 'f1',
              sintoma: 'Ao executar, o Python aponta uma linha e nada acontece: nem a soma chega a aparecer.',
              categoria: 'sintaxe',
            },
            {
              id: 'f2',
              sintoma: 'A soma aparece, e logo depois o programa para com uma mensagem sobre divisão.',
              categoria: 'execucao',
            },
            {
              id: 'f3',
              sintoma: 'O programa vai até o fim sem reclamar de nada, e uma média 8.0 sai como "a recuperar".',
              categoria: 'logica',
            },
          ],
        },
      ),
    ],
  },
  {
    id: 'm8',
    titulo: 'Um programa seu',
    resumo: 'Planejar, organizar e apresentar um programa do começo ao fim.',
    licoes: [
      {
        id: 'm8-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_PYTHON['m8-teoria'],
        titulo: 'Do plano à apresentação',
        resumo: 'Entrada, processamento e saída; nomes que se leem; e explicar em voz alta.',
        topicos: cap('programa').topicos,
      },
      laboratorio(
        'm8-lab',
        'O programa, escrito',
        'Quarenta linhas que resolvem alguma coisa do clube, do começo ao fim.',
        `# Um programa seu
#
# Escreva um programa de pelo menos 40 linhas de código que resolva alguma
# coisa do clube: a chamada da unidade, o caixa do acampamento, o placar de
# um jogo, a conta do lanche.
#
# Ele precisa perguntar alguma coisa a quem usa, com input(), e mostrar um
# resultado, com print(). O resto é escolha sua — e escolha um assunto que
# você conheça, porque assim você sabe qual deveria ser a resposta.
#
# Use o campo Entrada, ao lado, para decidir o que será digitado: uma linha
# para cada input() do seu programa.
#
# Linha em branco e linha só de comentário não contam para as 40: o requisito
# é de programa.
#
# Ao entregar, a plataforma escreve um roteiro do SEU programa, parte por
# parte, para você treinar a apresentação ao examinador.
`,
        ['roda', 'leEExibe', 'quarentaLinhas'],
      ),
    ],
  },
];
