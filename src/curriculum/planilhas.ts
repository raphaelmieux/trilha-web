import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DE_PLANILHA } from './questoesDePlanilha';

/*
 * A vereda CC-ES003 Planilhas.
 *
 * ── O que ela é, e o que ela não repete ──────────────────────────────────
 * A AP043 monta a planilha — escrever, alargar coluna, mesclar, somar — e a
 * AP044 ensina filtro, congelamento e gráfico. Aqui a pergunta é outra: **por
 * que** a planilha está montada do jeito que está, e o que acontece com ela
 * quando os dados mudam.
 *
 * A planilha do clube não é preenchida uma vez. Ela ganha inscrito, perde
 * inscrito, tem uma diária corrigida no sábado e um valor colado de um site na
 * terça. Quem digitou o total refaz a conta toda vez e erra numa delas; quem
 * escreveu fórmula não refaz nenhuma.
 *
 * ── Por que ela exige a CC-ES001 ─────────────────────────────────────────
 * Está escrito no requisito 1. A razão é a de sempre: a planilha do
 * acampamento é um arquivo que vai ser aberto de novo no ano que vem, e quem
 * não sabe onde ele está monta outro.
 *
 * ── O requisito 8 acontece fora daqui ────────────────────────────────────
 * Apresentar ao examinador é conversa com uma pessoa, e a plataforma não
 * confere nada dela — como já vale para o requisito 9 da CC-ES001, o 7 da
 * CC002 e o 8 da CC004. O que ela faz é preparar: o laboratório do módulo 7
 * lê a planilha e escreve, em português, o que cada fórmula faz.
 *
 * ── E o que carrega esta vereda é o número que parece certo ──────────────
 * Quase todo defeito de planilha é assim: o total fecha, a coluna está cheia,
 * o gráfico desenha, e nada está certo. É por isso que o requisito 7 existe, e
 * é por isso que as questões daqui quase todas descrevem uma planilha que
 * parece conferida.
 */

const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], exemplo: string, atencao: string, marcas: string[],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, exemplo, exemploComo: 'texto' as const, atencao, marcas,
});

/* ────────────────────────────────────────────────────────────────────────
   Módulo 1 — A célula, o intervalo e as três zonas (requisitos 2.1, 3, 4.1)
   ──────────────────────────────────────────────────────────────────────── */

const CELULA_E_ZONAS: TopicoDeVereda[] = [
  t(
    'celula-e-intervalo',
    'Célula e intervalo',
    'O endereço de uma caixa, e o endereço de um retângulo delas.',
    [
      'Célula é o cruzamento de uma coluna com uma linha, e o nome dela é a letra da coluna com o número da linha: A1, B3, D14. Esse nome é um endereço — é por ele que uma fórmula diz de onde tirar um valor.',
      'Intervalo é um retângulo de células, escrito da primeira à última com dois-pontos no meio: D3:D14 é a coluna D, da linha 3 à 14. É quase sempre o intervalo que a fórmula quer, porque quase sempre o que se soma é uma coluna inteira de dados.',
      'A caixa de nome, à esquerda da barra de fórmulas, mostra o endereço do que está selecionado. Arrastar por várias células faz ela mostrar o intervalo, e é assim que se confere se a seleção pegou o que devia.',
    ],
    `Célula                  Intervalo
──────────────          ──────────────────────
A1     canto de cima    A1:D1   a primeira linha, quatro colunas
D14    coluna D, 14     D3:D14  a coluna D, doze linhas
                        A2:D14  o bloco de dados inteiro`,
    'O erro de intervalo mais comum não é escrever o endereço errado: é parar uma linha antes do fim. O total sai um pouco menor, e um pouco menor parece certo.',
    ['célula', 'intervalo', 'caixa de nome'],
  ),
  t(
    'tres-zonas',
    'Dado, cálculo e apresentação',
    'As três coisas que uma planilha tem, e por que elas ficam separadas.',
    [
      'O dado bruto é o que foi digitado ou importado: os nomes, as unidades, as diárias. Ele cresce — chega inscrito novo toda semana — e é ordenado, filtrado e conferido.',
      'O cálculo é o que a planilha faz com o dado: o total, a média, a contagem. Ele não cresce: três cálculos continuam três depois de o décimo terceiro desbravador se inscrever.',
      'A apresentação é o que faz alguém entender o que está vendo: o título, o cabeçalho, as cores. Ela não é dado nem conta, e é a única das três em que mesclar célula é a resposta certa.',
      'Misturados, os três atrapalham um ao outro. Um total encostado no fim dos dados vira obstáculo na hora de acrescentar linha; um título dentro do bloco de dados viaja junto quando alguém ordena.',
    ],
    `        A          B         C        D    E        F
1   Inscrições do acampamento               │  Cálculos
2   Nome       Unidade   Diárias  Valor     │  Total arrecadado
3   Ana        Águia     3        135       │  Média de diárias
…                                           │  Quantos inscritos
14  Miguel     Onça      3        135       │
    └──────── dado bruto ────────┘  calha   └── cálculo ──`,
    'A coluna vazia entre os dois blocos não é desperdício: é o que impede a planilha de tratar dado e cálculo como uma tabela só. Sem ela, ordenar os dados leva os cálculos junto.',
    ['zonas', 'dado bruto', 'organização'],
  ),
  t(
    'tamanho-e-alinhamento',
    'Tamanho e alinhamento',
    'O que a largura esconde, e o que o alinhamento conta.',
    [
      'Coluna estreita demais esconde texto e transforma número numa fileira de cerquilhas. A largura se arrasta pela borda do cabeçalho, e dois cliques nela ajustam ao conteúdo — escrever espaços dentro da célula não empurra borda nenhuma, e ainda estraga toda comparação depois.',
      'Alinhamento tem dois eixos. O horizontal quase todo mundo conhece; o vertical só aparece em linha alta, e é por isso que a linha do título se aumenta antes de centralizar nela.',
      'E o alinhamento padrão não é decoração: número vai para a direita, texto para a esquerda. É a planilha dizendo o que ela entendeu de cada célula — e é por essa diferença que se descobre um número que ela não entendeu.',
    ],
    `Como a planilha alinha sozinha:

  Falcão      │ texto   → encosta à esquerda
         1620 │ número  → encosta à direita
  1620        │ ISTO É TEXTO, e a soma vai pular`,
    'Alinhar uma coluna de números à esquerda é legítimo e é raro. O problema é o contrário: ver um número à esquerda e alinhá-lo à direita esconde a pista sem consertar o defeito.',
    ['largura', 'alinhamento', 'mesclar'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 2 — Fórmula e função (requisitos 2.2 e 4.2)
   ──────────────────────────────────────────────────────────────────────── */

const FORMULA_E_FUNCAO: TopicoDeVereda[] = [
  t(
    'formula',
    'Fórmula',
    'A conta que a planilha refaz sozinha.',
    [
      'Fórmula é tudo o que começa com o sinal de igual. Sem ele, o que você escreveu é texto — e SOMA sem igual fica escrito SOMA na célula, encostado à esquerda.',
      'O que a fórmula guarda é a conta, e não o resultado. Mudar um valor que ela cita refaz o resultado na hora, sem ninguém pedir. É essa a diferença inteira entre planilha e papel.',
      'Uma fórmula cita células pelo endereço. Escrever o número dentro dela funciona hoje e erra no dia em que o número mudar — e ninguém avisa, porque a planilha não sabe que aquele 45 devia ser o valor da diária.',
    ],
    `=B4*45          conta com o número escrito dentro
=B4*B1          conta que lê o valor de B1
1620            número digitado: não é conta nenhuma

Mude B1 de 45 para 50:
  a primeira continua dando o de antes
  a segunda acompanha
  a terceira continua mostrando 1620 para sempre`,
    'Um número digitado está certo hoje. É amanhã que ele erra, e amanhã ninguém está olhando.',
    ['fórmula', 'sinal de igual', 'recálculo'],
  ),
  t(
    'funcao',
    'Função',
    'Uma conta pronta, com nome, que a fórmula chama.',
    [
      'Função é uma conta que a planilha já sabe fazer: você diz o nome e entrega o que ela precisa, entre parênteses. SOMA de um intervalo soma tudo o que houver ali.',
      'Nem toda fórmula tem função: B4 vezes B1 é fórmula e não chama nenhuma. E nem toda função é de número — existem as de texto, as de data, as de procura.',
      'O que vai dentro dos parênteses são os argumentos, separados por ponto e vírgula. Quase sempre o primeiro é um intervalo, e é aí que mora o erro: a função certa sobre o intervalo errado devolve um número plausível.',
    ],
    `=SOMA(D3:D14)         soma os doze valores
=MÉDIA(C3:C14)        soma e divide pela quantidade de números
=MÁXIMO(C3:C14)       o maior
=MÍNIMO(C3:C14)       o menor
=CONT.NÚM(C3:C14)     quantos são números
=CONT.VALORES(C3:C14) quantas células têm alguma coisa`,
    'MÉDIA divide pela quantidade de números, e não pela de células. Célula vazia não entra nem como zero — se entrasse, puxaria a média para baixo sem ninguém entender por quê.',
    ['função', 'argumento', 'SOMA', 'MÉDIA'],
  ),
  t(
    'as-duas-contagens',
    'As duas contagens',
    'Quantos são números, e quantas células estão preenchidas.',
    [
      'Existem duas funções de contagem, e a diferença entre elas parece pequena. Uma conta o que a planilha entende como número; a outra conta toda célula que tem alguma coisa escrita.',
      'Numa coluna sem defeito as duas dão o mesmo. Quando elas discordam, a diferença é exatamente a quantidade de células que parecem número e não são.',
      'É a maneira mais rápida de achar um número guardado como texto numa coluna de cento e vinte linhas: em vez de procurar com o olho, pergunta-se à planilha.',
    ],
    `Uma coluna com doze valores preenchidos:

  =CONT.NÚM(D3:D14)       →  11
  =CONT.VALORES(D3:D14)   →  12

  Um dos doze está preenchido com algo que não é número.`,
    'Esta é a pista que funciona quando o alinhamento não funciona — e o alinhamento não funciona quando alguém já mexeu nele.',
    ['CONT.NÚM', 'CONT.VALORES', 'diagnóstico'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 3 — A referência que anda e a que fica (requisitos 2.3 e 4.3)
   ──────────────────────────────────────────────────────────────────────── */

const RELATIVA_E_ABSOLUTA: TopicoDeVereda[] = [
  t(
    'referencia-relativa',
    'Referência relativa',
    'O endereço que anda junto quando a fórmula é copiada.',
    [
      'Quando você copia uma fórmula para a linha de baixo, os endereços dentro dela descem junto. B4 vira B5, B5 vira B6. Isso se chama referência relativa, e é o comportamento padrão.',
      'É o que faz a alça de preenchimento ser útil: uma fórmula escrita e arrastada doze linhas dá doze contas, cada uma lendo a linha dela. Sem isso, arrastar seria copiar o mesmo resultado doze vezes.',
      'Indo para o lado vale a mesma regra, com a coluna no lugar da linha: B3 vira C3, C3 vira D3.',
    ],
    `Escrito em C4:   =B4*45
Arrastado:
  C5  →  =B5*45
  C6  →  =B6*45
  C7  →  =B7*45

Cada linha lê a linha dela. É isso que se quer.`,
    'Relativa é o padrão, e na maioria das vezes é o que se quer. Ela só atrapalha quando uma das células citadas é a mesma para todas as linhas.',
    ['referência relativa', 'alça de preenchimento'],
  ),
  t(
    'referencia-absoluta',
    'Referência absoluta',
    'O endereço travado com cifrão, que não anda.',
    [
      'O cifrão trava um pedaço do endereço. Antes da letra, trava a coluna; antes do número, trava a linha. Com os dois, o endereço não anda em direção nenhuma.',
      'A tecla F4 põe e tira os cifrões, e é por isso que ninguém precisa digitá-los: seleciona-se a referência na barra de fórmulas e aperta-se F4 até chegar na forma que se quer.',
      'Arrastando para baixo, quem precisa ficar parada é a linha — e B$1 basta. Os dois cifrões existem para quando a mesma fórmula vai para baixo e para o lado.',
    ],
    `Escrito em C4:   =B4*B$1
Arrastado para baixo:
  C5  →  =B5*B$1
  C6  →  =B6*B$1

  A primeira referência anda. A segunda fica em B1.`,
    'Sem o cifrão, arrastar para baixo faz a segunda linha ler B2, que está vazia, e a terceira ler B3, que é um rótulo. A coluna sai certa no topo e zerada embaixo.',
    ['referência absoluta', 'cifrão', 'F4'],
  ),
  t(
    'quando-travar',
    'Quando travar',
    'A pergunta que decide, e ela não é sobre o cifrão.',
    [
      'A pergunta é sempre a mesma: esta célula é a mesma para todas as linhas, ou cada linha tem a sua? Diárias é de cada linha. O valor da diária é de todas.',
      'Travar tudo por precaução não é inofensivo: a fórmula para de andar, e as doze linhas passam a mostrar o resultado da primeira. Doze números iguais e plausíveis, sem erro nenhum na tela.',
      'E o valor que se trava mora numa célula porque ele muda. Escrever 45 dentro das doze fórmulas dá o mesmo resultado hoje, e no ano que vem obriga a achar as doze.',
    ],
    `Diária do acampamento:  B1 = 45

  Cada linha tem a sua?   →  sem cifrão
  É a mesma para todas?   →  com cifrão

  =B4*B$1     as diárias andam; o valor fica
  =B$4*B$1    nada anda: doze vezes o mesmo número
  =B4*45      nada lê B1: o ano que vem sai errado`,
    'Todo valor que aparece escrito em mais de um lugar vai ser trocado em menos lugares do que aparece. É por isso que ele mora numa célula.',
    ['quando travar', 'manutenção'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 4 — A planilha que decide e a que procura (requisitos 4.4 e 4.5)
   ──────────────────────────────────────────────────────────────────────── */

const DECIDIR_E_PROCURAR: TopicoDeVereda[] = [
  t(
    'funcao-condicional',
    'A função condicional',
    'Uma pergunta, uma resposta para sim e uma para não.',
    [
      'A função condicional faz uma pergunta sobre uma célula e escreve uma coisa se a resposta for sim, outra se for não. São três argumentos, nessa ordem: o teste, o então, o senão.',
      'O teste é uma comparação: maior que, menor que, igual a, diferente de. O que sai dela é sempre verdadeiro ou falso, e é isso que a função usa para escolher.',
      'Palavra dentro de fórmula vai entre aspas. Sem elas, a planilha tenta achar alguma coisa chamada Sim e devolve erro ou vazio.',
    ],
    `=SE(C3>=3;"Sim";"Não")

  teste:   C3 >= 3
  então:   escreve Sim
  senão:   escreve Não

A coluna inteira responde sozinha, linha por linha.`,
    'Escrever a comparação como o número significa, e não como ele é hoje: três diárias é o acampamento inteiro, e maior ou igual a três continua certo se o acampamento crescer.',
    ['SE', 'condição', 'comparação'],
  ),
  t(
    'funcao-de-procura',
    'A função de procura',
    'Trazer, de outra tabela, o que corresponde a este valor.',
    [
      'A função de procura recebe um valor, uma tabela e o número de uma coluna. Ela acha o valor na primeira coluna da tabela e devolve o que estiver na coluna pedida, naquela linha.',
      'A contagem da coluna começa na primeira coluna da tabela de procura, e não na coluna A da planilha. É por isso que a coluna do valor procurado precisa ser a primeira dela.',
      'A tabela de procura se trava com cifrões, senão ela anda quando a fórmula é arrastada — e a partir da terceira linha a procura passa a olhar um pedaço que não existe.',
    ],
    `=PROCV(B3;$G$2:$H$7;2;FALSO)

  procurado:  o que está em B3
  tabela:     G2 até H7, travada
  coluna:     2, contando de G
  exato:      FALSO`,
    'Sem travar a tabela, a fórmula funciona na primeira linha e vai dando #N/D nas seguintes. Com um valor por linha, isso parece problema de dado.',
    ['PROCV', 'procura', 'tabela de procura'],
  ),
  t(
    'quarto-argumento',
    'O quarto argumento',
    'O que acontece quando ele não é escrito.',
    [
      'O quarto argumento diz se a procura é exata ou aproximada. Não escrever nada é escolher aproximada — o padrão do programa, e não do bom senso.',
      'A procura aproximada lê a primeira coluna da tabela como se ela estivesse em ordem, e para no maior valor que não passa do procurado. Numa tabela ordenada isso é rápido e certo. Numa tabela digitada à mão, ela para na linha errada.',
      'E o que ela devolve não é erro: é o valor de outra linha. Numa coluna de conselheiros, isso é o nome de uma pessoa de verdade, ao lado do nome de um desbravador que não é da unidade dela.',
    ],
    `Tabela na ordem em que o clube escreve as unidades:

  Falcão   Tio Samuel
  Águia    Tia Rute
  Tucano   Tia Joana
  Arara    Tio Márcio

  Procurando Águia, sem o quarto argumento  →  #N/D
  Procurando Onça,  sem o quarto argumento  →  Tia Rute

  O primeiro se vê. O segundo, não.`,
    'Ele acerta em algumas linhas e erra em outras, o que é pior do que errar sempre: quem confere duas linhas ao acaso conclui que está tudo certo.',
    ['exato', 'aproximado', '#N/D'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 5 — Ver o que importa (requisitos 2.4, 2.5, 4.6 e 4.7)
   ──────────────────────────────────────────────────────────────────────── */

const VER_O_QUE_IMPORTA: TopicoDeVereda[] = [
  t(
    'formatacao-condicional',
    'Formatação condicional',
    'Uma regra que olha o valor e decide a cor.',
    [
      'Formatação condicional é uma regra guardada na planilha: nestas células, se o valor for assim, pinte de tal cor. Ela não escreve nada e não muda valor nenhum — só a aparência.',
      'E ela se refaz sozinha. Mudar o valor de uma célula repinta na hora, sem ninguém tocar na regra. Pintar à mão faz o mesmo hoje e mente amanhã.',
      'A faixa da regra vai até a última linha com dado. Esticada até o fim da coluna, a parte em branco acende junto: para a planilha, célula vazia vale zero, e zero é menor que quase tudo.',
    ],
    `Regra:  em C3:C14, se o valor for menor que 3, pinte

  C3   3     │
  C5   2     │ ← acende
  C8   2     │ ← acende
  C14  3     │

Esticada até C200, as 186 vazias acendem também.`,
    'Planilha toda colorida não destaca coisa nenhuma. Se metade da coluna acendeu, a faixa passou do fim dos dados.',
    ['formatação condicional', 'regra', 'faixa'],
  ),
  t(
    'filtro-e-ordenacao',
    'Filtro e ordenação',
    'Uma esconde e a outra mexe — e só uma delas tem volta.',
    [
      'Filtrar esconde as linhas que não casam com o que foi escolhido. As linhas continuam na planilha: os números das linhas à esquerda pulam, e tirar o filtro traz tudo de volta.',
      'Ordenar troca as linhas de lugar de verdade. É a única das duas que muda o arquivo, e é por isso que ela precisa levar a linha inteira: ordenar só a coluna escolhida deixa cada nome ao lado do dado de outro.',
      'E com filtro aplicado, a soma continua somando o que está escondido. Quem não sabe disso lê o número da célula e o manda para a liderança.',
    ],
    `Sem filtro          Com filtro em Falcão
──────────          ─────────────────────
 3  Ana                3  (escondida)
 4  Bruno              4  Bruno
 5  Carla              5  (escondida)
 6  Daniel             6  Daniel

Os números das linhas pulam: é assim que se vê
que há linha escondida.`,
    'Ordenar metade de uma tabela não estoura nada: ela continua com doze linhas plausíveis, e o cadastro inteiro está trocado.',
    ['filtro', 'ordenação', 'linha escondida'],
  ),
  t(
    'congelar',
    'Congelar',
    'O cabeçalho que fica parado enquanto o resto rola.',
    [
      'Numa lista que não cabe na tela, rolar até o fim faz o cabeçalho sumir — e as colunas viram aquela dos números e aquela das palavras. Congelar prende as primeiras linhas no alto.',
      'É de tela, e só. Não muda dado nenhum, não tranca célula contra edição e não vai para o papel. O nome engana, e é a única coisa que precisa ser dita sobre ele.',
      'Congela-se tudo o que está acima da célula escolhida: clicar na terceira linha e mandar congelar prende as duas primeiras.',
    ],
    `Rolando sem congelar        Rolando com congelar
────────────────────        ────────────────────
 97  Ana      3               1  Inscrições 2026
 98  Bruno    2               2  Nome  Unidade  Diárias
 99  Carla    3              97  Ana   Águia    3
                             98  Bruno Falcão   2

Sem o cabeçalho, o 3 da direita não quer dizer nada.`,
    'Congelar não protege: quem tranca célula contra edição é a proteção de planilha, que é outro comando e está noutro menu.',
    ['congelar', 'painéis', 'cabeçalho'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 6 — O orçamento e o gráfico (requisitos 5 e 6)
   ──────────────────────────────────────────────────────────────────────── */

const ORCAMENTO_E_GRAFICO: TopicoDeVereda[] = [
  t(
    'orcamento',
    'O orçamento',
    'Uma tabela de duas entradas, e nenhum total digitado.',
    [
      'Um orçamento tem categorias nas linhas e meses nas colunas. Os gastos são o dado bruto; os totais, de cada linha e de cada coluna, são cálculo.',
      'A linha de totais responde quanto se gastou em cada mês; a coluna de totais responde quanto se gastou em cada coisa. São duas perguntas diferentes, e é por isso que a tabela tem os dois.',
      'O total geral pode ser somado pela linha ou pela coluna. Os dois caminhos têm de dar o mesmo número, e quando não dão, um deles pegou uma célula a mais ou a menos.',
    ],
    `              Março   Abril   Maio    Total
Alimentação     820     910    1180    =SOMA(B3:D3)
Transporte      430     430     610    =SOMA(B4:D4)
Material        260     140      95    =SOMA(B5:D5)
Premiação         0       0     340    =SOMA(B6:D6)
Total     =SOMA(B3:B6)  …       …      =SOMA(E3:E6)`,
    'Uma soma escrita como 820+910+1180 começa por igual, devolve o número certo, e é um número parado com um sinal na frente. Corrigir um gasto não muda nada nela.',
    ['orçamento', 'total', 'tabela de duas entradas'],
  ),
  t(
    'tipo-de-grafico',
    'O tipo sai da pergunta',
    'Cada desenho responde a uma coisa, e os quatro desenham sem erro.',
    [
      'Pizza responde repartição: quanto cada parte pesa no todo. Colunas respondem comparação: qual é maior que qual. Linha responde evolução: como uma coisa mudou ao longo do tempo. Dispersão responde relação: se duas medidas andam juntas.',
      'Escolher o errado não dá erro nenhum. O gráfico desenha, fica bonito, e afirma uma coisa que os dados não dizem — uma linha ligando Alimentação a Transporte afirma que uma virou a outra.',
      'Por isso a pergunta vem antes do gráfico. Para onde vai o dinheiro é repartição. Como a inscrição cresceu mês a mês é evolução. São perguntas diferentes sobre a mesma planilha.',
    ],
    `Pergunta                          Gráfico
────────────────────────────      ──────────
Para onde vai o dinheiro?         pizza
Qual unidade trouxe mais gente?   colunas
Como a inscrição cresceu?         linha
Quem fica mais tempo gasta mais?  dispersão`,
    'Se a tarefa aceitasse qualquer tipo, ela mediria ter clicado em Inserir. O que se mede é a escolha.',
    ['gráfico', 'pizza', 'colunas', 'linha'],
  ),
  t(
    'titulo-e-eixos',
    'Título e eixos',
    'O que separa um desenho de uma afirmação.',
    [
      'Um gráfico sem título não diz do que ele é. Um gráfico sem eixos identificados não diz o que os números são: podem ser reais, pessoas, diárias ou qualquer coisa.',
      'O título diz o que o gráfico mostra, e não o que ele é. Gráfico 1 não é título; Para onde foi o dinheiro do acampamento é.',
      'A planilha desenha sem título e sem eixos, sem reclamar. É por isso que quase todo gráfico entregue vem assim.',
    ],
    `Sem identificação          Com identificação
─────────────────          ───────────────────────────
   ▓▓▓▓ 2910                Para onde foi o dinheiro
   ▓▓ 1470                  (eixo X: categoria)
   ▓ 495                    (eixo Y: reais gastos)

O de cima pode ser qualquer coisa.`,
    'Quem lê o gráfico não é quem o fez. Tudo o que não estiver escrito nele vai ser adivinhado.',
    ['título', 'eixos', 'leitura'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 7 — A planilha defeituosa (requisitos 7 e 8)
   ──────────────────────────────────────────────────────────────────────── */

const CONFERIR_E_APRESENTAR: TopicoDeVereda[] = [
  t(
    'tres-defeitos',
    'Os três defeitos',
    'Um grita, um tem pista, e um não tem nenhuma.',
    [
      'A fórmula quebrada grita: a célula mostra um erro com nome, em letras que não são número. Costuma vir de uma coluna excluída — a planilha escreve o erro dentro da própria fórmula, no lugar onde havia um endereço.',
      'O número guardado como texto não grita. Na célula ele é igual aos outros; o que o denuncia é encostar à esquerda, e a diferença entre as duas contagens. A soma simplesmente o pula, e o total fecha menos.',
      'O total digitado à mão não tem pista nenhuma. Ele está certo hoje, e continua mostrando o número de hoje depois de alguém corrigir um dado. A única maneira de achá-lo é clicar na célula e olhar a barra de fórmulas.',
    ],
    `O que se vê na tela          O que está na barra de fórmulas
───────────────────          ───────────────────────────────
#REF!                        =SOMA(#REF!)
135                          '135          ← texto disfarçado
33                           33            ← digitado, e certo hoje`,
    'Conferir uma planilha é olhar a barra de fórmulas, e não a célula. Na célula, dois dos três defeitos parecem normais.',
    ['#REF!', 'número como texto', 'total digitado'],
  ),
  t(
    'como-achar',
    'Como achar cada um',
    'Três defeitos, três caminhos diferentes.',
    [
      'A fórmula quebrada se acha olhando: ela é a única que escreve alguma coisa diferente na célula. Consertá-la é refazer o intervalo que foi perdido.',
      'O número guardado como texto se acha perguntando à planilha: contar os números da coluna e comparar com quantas células estão preenchidas. A diferença é a quantidade de células doentes. Consertá-lo é escrever o número de novo — apagar a célula tira o defeito e deixa um buraco.',
      'O total digitado se acha clicando célula por célula nas que deveriam ser cálculo, e olhando se há fórmula. Consertá-lo é escrever a soma: o número na tela continua o mesmo, e o que muda é que agora ele se refaz.',
    ],
    `Defeito                    Como achar
────────────────────       ──────────────────────────────
fórmula quebrada           olhando a tela
número como texto          CONT.NÚM contra CONT.VALORES
total digitado             clicando e lendo a barra`,
    'O mesmo defeito volta com outra roupa: consertar três totais digitados e deixar mais três ao lado não é ter entendido o erro.',
    ['diagnóstico', 'conferência'],
  ),
  t(
    'apresentar',
    'Apresentar explicando',
    'A metade do requisito que não se faz sozinho.',
    [
      'Montar a planilha é metade; a outra metade é conseguir dizer o que cada fórmula faz. Copiar uma fórmula é possível — explicar copiando, não.',
      'A explicação é simples e é em voz alta: aqui eu somo tudo o que está de D3 até D14; aqui eu multiplico as diárias pelo valor da diária, e este cifrão é o que prende a referência quando eu arrasto.',
      'O que se treina é falar sobre o próprio trabalho. Não há resposta certa escrita em lugar nenhum — o que há é a sua planilha, e o que você decidiu em cada célula dela.',
    ],
    `O que dizer sobre cada fórmula:

  G2   =SOMA(D3:D14)
       "Aqui eu somo tudo o que está de D3 até D14."

  C4   =B4*B$1
       "Aqui eu multiplico B4 por B$1. O cifrão é o que
        prende essa referência quando eu arrasto."`,
    'Esta parte acontece na conversa com o examinador, e a plataforma não confere nada dela. O que ela faz é preparar — e ela prepara com a sua planilha, e não com uma de exemplo.',
    ['apresentação', 'explicar'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Os módulos
   ──────────────────────────────────────────────────────────────────────── */

export const MODULOS_DE_PLANILHA: ModuloDeVereda[] = [
  {
    id: 'm1',
    titulo: 'A célula, o intervalo e as três zonas',
    resumo: 'Onde cada coisa fica numa planilha, e por que dado, cálculo e apresentação ficam separados.',
    licoes: [
      {
        id: 'm1-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_PLANILHA['m1-teoria'],
        perguntas: 4,
        titulo: 'Endereço, zona e tamanho',
        resumo: 'Célula e intervalo, as três zonas, e o que o alinhamento conta sem ninguém pedir.',
        topicos: CELULA_E_ZONAS,
      },
      {
        /*
          Os requisitos 2.1, 3 e 4.1 numa planilha que chega como a secretaria
          do clube deixou. O defeito que importa é o total digitado logo abaixo
          da última linha de dados: ele não está errado hoje, e some no dia em
          que chegar o décimo terceiro inscrito.
        */
        id: 'm1-lab', tipo: 'planilha', caderno: 'arrumar',
        titulo: 'Arrumando a planilha de inscrições',
        resumo: 'Tamanho, título, cabeçalho — e tirar do bloco de dados tudo o que não é dado.',
        verificacoes: ['tamanho', 'titulo', 'cabecalho', 'separar'],
      },
    ],
  },
  {
    id: 'm2',
    titulo: 'Fórmula e função',
    resumo: 'A conta que se refaz sozinha, e as cinco contas prontas que a planilha já sabe fazer.',
    licoes: [
      {
        id: 'm2-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_PLANILHA['m2-teoria'],
        perguntas: 4,
        titulo: 'O que o sinal de igual muda',
        resumo: 'Fórmula, função, e a diferença entre as duas contagens.',
        topicos: FORMULA_E_FUNCAO,
      },
      {
        /*
          O requisito 4.2 inteiro, na zona de cálculos que o módulo 1 deixou
          limpa. Toda tarefa confere a função **e** o resultado: só o texto
          deixaria passar o intervalo que esquece o último inscrito, e só o
          número deixaria passar o número digitado.
        */
        id: 'm2-lab', tipo: 'planilha', caderno: 'contas',
        titulo: 'As cinco contas do acampamento',
        resumo: 'Soma, média, máximo, mínimo e contagem — e a prova de que elas se refazem.',
        verificacoes: ['soma', 'media', 'extremos', 'contagem', 'viva'],
      },
    ],
  },
  {
    id: 'm3',
    titulo: 'A referência que anda e a que fica',
    resumo: 'O que o cifrão faz, e a pergunta que decide se ele é necessário.',
    licoes: [
      {
        id: 'm3-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_PLANILHA['m3-teoria'],
        perguntas: 4,
        titulo: 'Relativa, absoluta, e quando travar',
        resumo: 'A referência que desce junto, a que fica parada, e o valor que mora numa célula.',
        topicos: RELATIVA_E_ABSOLUTA,
      },
      {
        /*
          O requisito 4.3, e a metade difícil dele é o "quando". O erro aqui se
          vê — arrastar sem o cifrão dá zeros da segunda linha para baixo —, o
          que é raro num defeito de planilha e é por isso que ele é o exemplo.
        */
        id: 'm3-lab', tipo: 'planilha', caderno: 'custos',
        titulo: 'O que cada um paga',
        resumo: 'Uma fórmula, doze linhas, e uma célula que todas precisam ler.',
        verificacoes: ['arrastada', 'travada', 'segue'],
      },
    ],
  },
  {
    id: 'm4',
    titulo: 'A planilha que decide e a que procura',
    resumo: 'Uma coluna que responde sozinha, e outra que traz o dado de outra tabela.',
    licoes: [
      {
        id: 'm4-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_PLANILHA['m4-teoria'],
        perguntas: 4,
        titulo: 'A condição e a procura',
        resumo: 'O teste com dois caminhos, a tabela de procura, e o argumento que quase ninguém escreve.',
        topicos: DECIDIR_E_PROCURAR,
      },
      {
        /*
          Os requisitos 4.4 e 4.5. A tabela de conselheiros não está em ordem
          alfabética — está na ordem em que o clube escreve as unidades —, e é
          isso que faz o quarto argumento do PROCV significar alguma coisa.
        */
        id: 'm4-lab', tipo: 'planilha', caderno: 'unidades',
        titulo: 'Conselheiros e almoço de domingo',
        resumo: 'Trazer o conselheiro de cada unidade, e deixar a planilha responder quem fica até domingo.',
        verificacoes: ['procura', 'exata', 'condicao'],
      },
    ],
  },
  {
    id: 'm5',
    titulo: 'Ver o que importa',
    resumo: 'Destacar, esconder, reordenar e prender — e qual das quatro mexe no arquivo.',
    licoes: [
      {
        id: 'm5-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_PLANILHA['m5-teoria'],
        perguntas: 4,
        titulo: 'Cor, filtro e cabeçalho parado',
        resumo: 'A regra que pinta sozinha, a diferença entre esconder e reordenar, e o que congelar não faz.',
        topicos: VER_O_QUE_IMPORTA,
      },
      {
        /*
          Os requisitos 4.6 e 4.7, na aba que o módulo 1 arrumou. A tarefa da
          regra confere **o que ficou pintado**, e não a regra escrita: há mais
          de uma regra certa, e cobrar uma delas mediria ter adivinhado a nossa.
        */
        id: 'm5-lab', tipo: 'planilha', caderno: 'destaque',
        titulo: 'Achando o que interessa na lista',
        resumo: 'Acender quem sai no sábado, prender o cabeçalho, ordenar e filtrar.',
        verificacoes: ['congelar', 'ordenar', 'filtrar', 'condicional'],
      },
    ],
  },
  {
    id: 'm6',
    titulo: 'O orçamento e o gráfico',
    resumo: 'Três meses sem nenhum total digitado, e o desenho que responde à pergunta da liderança.',
    licoes: [
      {
        id: 'm6-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_PLANILHA['m6-teoria'],
        perguntas: 4,
        titulo: 'Orçamento, tipo e eixos',
        resumo: 'A tabela de duas entradas, o gráfico que a pergunta pede, e o que falta num gráfico sem nome.',
        topicos: ORCAMENTO_E_GRAFICO,
      },
      {
        /*
          Os requisitos 5 e 6. A tarefa que mede o 6 não é nenhuma das três de
          escrever total: é a que mexe num gasto e olha se os totais andaram —
          `=820+910+1180` passa pelas outras três.
        */
        id: 'm6-lab', tipo: 'planilha', caderno: 'orcamento',
        titulo: 'O orçamento do acampamento',
        resumo: 'Totais dos dois lados, o total geral, e o gráfico que responde para onde foi o dinheiro.',
        verificacoes: ['porCategoria', 'porMes', 'geral', 'seguem', 'grafico'],
      },
    ],
  },
  {
    id: 'm7',
    titulo: 'A planilha defeituosa',
    resumo: 'Três defeitos de três naturezas, e a metade do requisito que se faz falando.',
    licoes: [
      {
        id: 'm7-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_PLANILHA['m7-teoria'],
        perguntas: 4,
        titulo: 'Achar o que não aparece',
        resumo: 'O que grita, o que tem pista, o que não tem nenhuma — e o que dizer sobre cada fórmula.',
        topicos: CONFERIR_E_APRESENTAR,
      },
      {
        /*
          O requisito 7, e o 8 como preparação. Os três defeitos são de três
          naturezas diferentes de propósito: um se vê, um tem duas pistas
          independentes, e um está certo hoje.
        */
        id: 'm7-lab', tipo: 'planilha', caderno: 'conferencia',
        titulo: 'Conferindo a planilha da tesouraria',
        resumo: 'Uma fórmula quebrada, um número disfarçado de texto, e um total que ninguém calculou.',
        verificacoes: ['quebrada', 'texto', 'digitado'],
      },
    ],
  },
];
