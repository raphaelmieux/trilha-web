import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DA_ANALISE } from './questoesDaAnalise';

/*
 * A vereda CC-ES009 Análise de Dados.
 *
 * ── O que ela é ─────────────────────────────────────────────────────────
 * A CC-ES008 ensinou a coletar e a guardar. Esta ensina a **perguntar** — e,
 * principalmente, a desconfiar da resposta. O clube fechou o formulário do
 * acampamento com quarenta e oito inscritos, e agora alguém vai olhar aquela
 * planilha e dizer à liderança o que ela diz.
 *
 * ── O que carrega esta vereda é o número plausível ──────────────────────
 * Nenhuma tela desta vereda dá erro. A média dos acampamentos é 2,85 e
 * descreve um clube que não existe — vinte e nove dos quarenta e oito fizeram
 * dois ou menos. A moda da altura é 1,58 m, um número perfeitamente
 * verossímil que descreve **duas** pessoas em quarenta e oito. O Falcão é a
 * unidade que mais deixou gente de fora **e** a que mobilizou melhor, e as
 * duas contas estão certas. Um gráfico com o eixo começando em 70 desenha
 * corretamente um dado correto e mente sobre ele.
 *
 * É a mesma matéria da ofensiva que ficou meses parada em "2 dias": o
 * contador mostra um número plausível, que é o que se espera de um contador
 * funcionando.
 *
 * ── Por que ela exige a CC-ES008 ────────────────────────────────────────
 * Está no requisito 1, e o requisito 8 diz por quê: a base a analisar é **a
 * base coletada na CC-ES008**. Quem não a coletou não sabe de onde vem cada
 * coluna, nem por que o telefone é texto, nem que a unidade saiu de uma lista
 * justamente para não chegar escrita de quatro jeitos.
 */

const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], exemplo: string, atencao: string, marcas: string[],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, exemplo, exemploComo: 'texto' as const, atencao, marcas,
});

/* ── Módulo 1 — O tipo de cada variável (requisitos 2.1, 2.2 e 5.1) ───────── */

const TIPO_DE_VARIAVEL: TopicoDeVereda[] = [
  t(
    'qualitativa-e-quantitativa',
    'O teste é: somar duas respostas quer dizer alguma coisa?',
    'É a primeira pergunta a fazer de qualquer coluna, e ela decide todo o resto.',
    [
      'Variável é uma coluna da sua base: uma pergunta que foi feita a todo mundo. Qualitativa é a que **nomeia** — a unidade, o tamanho da camiseta, o tipo de alimentação. Quantitativa é a que **conta ou mede** — a idade, a altura, quantos acampamentos.',
      'O teste não é a cara do valor, é o que se faz com ele. Somar a idade de dois desbravadores dá um número que quer dizer alguma coisa; somar a unidade de dois desbravadores não dá nada. Telefone parece número e é qualitativo: somar dois telefones não existe.',
      'Isso importa porque decide o que você vai poder calcular. De coluna qualitativa se conta quantos há de cada; de coluna quantitativa se tira média, mediana e desvio. Tirar a média da unidade não dá erro na planilha — dá `#DIV/0!` ou zero, e nenhum dos dois é resposta.',
    ],
    `A mesma base, duas naturezas de coluna

  QUALITATIVA — nomeia            QUANTITATIVA — conta ou mede
  Unidade      Falcão             Idade           12
  Camiseta     M                  Altura          1,52
  Alimentação  Sem restrição      Acampamentos    3

  Teste: somar duas respostas quer dizer algo?
    12 + 13 = 25 anos de idade somada     → faz sentido, é quantitativa
    Falcão + Águia = ?                    → não existe, é qualitativa`,
    'A coluna de diárias tem os valores 2, 3 e 4, e é quantitativa. A de camiseta tem PP, P, M, G e GG, e é qualitativa — mesmo que alguém as numerasse de 1 a 5, somar dois tamanhos continuaria não querendo dizer nada.',
    ['variável', 'qualitativa', 'quantitativa'],
  ),
  t(
    'discreta-e-continua',
    'Contar dá inteiro; medir cabe qualquer coisa no meio',
    'A segunda pergunta, e ela só vale para as quantitativas.',
    [
      'Discreta é a que vem de **contar**: quantos acampamentos, quantas diárias, quantos irmãos. Entre 2 e 3 acampamentos não existe nada — ninguém foi a dois acampamentos e meio.',
      'Contínua é a que vem de **medir**: altura, peso, tempo. Entre 1,52 m e 1,53 m existe 1,524 m, e entre 1,524 e 1,525 existe mais um. O que limita não é a altura: é a régua.',
      'A idade é o caso que confunde, e ela é **discreta** aqui: o formulário pergunta quantos anos você tem, e a resposta é um inteiro. Se ele perguntasse a data de nascimento e a plataforma calculasse a idade em dias, aí seria outra conversa — mas a coluna guarda o que foi perguntado.',
    ],
    `Entre dois valores, o que existe?

  DISCRETA (contar)
  acampamentos:  0  1  2  3  4 ...
                     ↑ entre 2 e 3 não há nada

  CONTÍNUA (medir)
  altura:  1,52 ────────────── 1,53
             1,521  1,5234  1,52999  ...
             ↑ cabe sempre mais um, e o limite é a régua`,
    'Discreta não quer dizer "poucos valores diferentes". A altura tem quarenta e sete valores distintos em quarenta e oito respostas, e os acampamentos têm onze — mas o que separa as duas é medir e contar, e não quantos valores apareceram.',
    ['discreta', 'contínua'],
  ),
  t(
    'coluna-que-nao-agrupa',
    'Três colunas não servem para agrupar nem contar',
    'Nome, e-mail e observação são qualitativas como a unidade — e cada valor delas aparece uma vez só.',
    [
      'Agrupar é pôr junto quem respondeu a mesma coisa. Na unidade cabem oito pessoas dentro de "Águia"; no nome cabe uma. Uma tabela de frequências por nome tem quarenta e oito linhas de "1", e uma pizza de nomes tem quarenta e oito fatias iguais.',
      'Isso não torna essas colunas inúteis: o nome é o que faz cada linha ser uma pessoa, e o e-mail é como o clube fala com a família. O que elas não servem é para **comparar grupos** — que é a metade do trabalho que você vai fazer nos módulos seguintes.',
      'Saber disso antes de começar é o que evita a pergunta que não se responde. "Quem se inscreve mais cedo?" não se responde com uma coluna de quarenta e oito nomes diferentes; "qual unidade se inscreve mais cedo?" se responde.',
    ],
    `Quantas pessoas cabem dentro de um mesmo valor?

  Unidade      6 valores distintos, 48 respostas   → cabem 8 em média
  Camiseta     5 valores distintos                 → cabem 9 ou 10
  Alimentação  3 valores distintos                 → cabem 16

  Nome         48 valores distintos, 48 respostas  → cabe 1
  E-mail       48 valores distintos                → cabe 1
  Observação   cada uma escrita à mão              → cabe 1`,
    'A observação é o caso que engana: a maioria das pessoas deixou em branco, então há poucos valores distintos preenchidos. O que se conta são os **preenchidos** — e cada um deles é uma frase que só uma pessoa escreveu.',
    ['agrupar', 'identificador'],
  ),
];

/* ── Módulo 2 — Centro e dispersão (requisitos 2.3, 2.4 e 5.2) ────────────── */

const CENTRO_E_DISPERSAO: TopicoDeVereda[] = [
  t(
    'media-mediana-moda',
    'Três respostas para "qual é o valor típico"',
    'E elas discordam — que é justamente o que as torna úteis juntas.',
    [
      'A **média** soma tudo e divide pela quantidade. É a mais conhecida e a mais fácil de puxar: um valor muito alto no meio da lista arrasta a média inteira.',
      'A **mediana** é o valor do meio, com a lista em ordem. Metade está abaixo dela, metade acima. Ela não se mexe quando um valor da ponta muda: trocar dezoito acampamentos por cento e oitenta não muda a mediana em nada.',
      'A **moda** é o valor que mais se repete. Ela é a única que serve para coluna qualitativa — a unidade mais comum do acampamento é o Falcão, e isso é uma moda —, e é a que a planilha responde com mais confiança e menos aviso.',
    ],
    `A idade dos 48 inscritos

  média    12,40     soma tudo e divide por 48
  mediana  12        o valor do meio, com a lista em ordem
  moda     12        o valor que mais aparece — 11 vezes

  Aqui as três concordam, e isso também é informação:
  a idade do clube é bem descrita por qualquer uma delas.`,
    'Média e mediana não são "a mesma coisa calculada de dois jeitos". Elas respondem perguntas diferentes: a média responde "quanto daria a cada um se fosse dividido igualmente", e a mediana responde "quanto tem a pessoa do meio".',
    ['média', 'mediana', 'moda', 'tendência central'],
  ),
  t(
    'amplitude-e-desvio',
    'O centro diz em volta de quê; a dispersão diz o quanto se afasta',
    'Dois grupos com a mesma média podem não ter nada a ver um com o outro.',
    [
      'A **amplitude** é a distância entre as pontas: o maior valor menos o menor. É a conta mais simples que existe e a mais frágil — ela olha só dois valores da base inteira, e um deles pode ser um erro de digitação.',
      'O **desvio padrão** mede o quanto os valores se afastam da média, em média. Perto de zero quer dizer que quase todo mundo está junto; grande quer dizer que estão espalhados. Ele olha a base toda, e por isso é o que se relata ao lado da média.',
      'O par centro-e-dispersão é o que descreve um conjunto em dois números. "Idade média 12,40 anos, desvio 1,58" diz que o clube é de gente entre onze e catorze. "Acampamentos: média 2,85, desvio 3,41" diz que o desvio é **maior que a média** — e isso é um aviso de que a média ali não está descrevendo bem.',
    ],
    `As três colunas medidas, centro e dispersão

              média   mediana   amplitude   desvio padrão
  idade       12,40     12           5           1,58
  altura       1,52      1,54        0,74        0,15
  acampam.     2,85      2          18           3,41
                                     ↑            ↑
                     dezoito de amplitude e desvio maior
                     que a própria média: alguma coisa ali
                     está muito longe do resto`,
    'Na plataforma o desvio padrão é `DESVPADP`, com P no fim — o de população. A base é o clube inteiro que se inscreveu, e não uma amostra dele; `DESVPAD` sem o P calcula para amostra e devolve um número um pouco maior, sem avisar que respondeu outra pergunta.',
    ['amplitude', 'desvio padrão', 'dispersão'],
  ),
  t(
    'a-moda-nao-avisa',
    'A planilha devolve um número mesmo quando ele não descreve ninguém',
    'A moda da altura é 1,58 m — e duas pessoas em quarenta e oito têm essa altura.',
    [
      'Moda só quer dizer alguma coisa quando o valor se repete bastante. A moda da idade é 12 e ela aparece onze vezes: quase um quarto do clube. A moda da altura é 1,58 e ela aparece **duas** vezes.',
      'A planilha não faz essa diferença. `MODO` devolve 12 numa coluna e 1,58 na outra, com a mesma cara e sem nenhum aviso. Não é defeito dela: é que a pergunta "este valor descreve o conjunto?" não é uma pergunta que uma fórmula faça.',
      'É por isso que a moda quase não serve para coluna contínua. Medida tem quase um valor distinto por pessoa, então o que mais se repete se repete por acaso — e a resposta é um número perfeitamente plausível sobre nada.',
    ],
    `A mesma função, duas respostas de valor muito diferente

  =MODO(idade)    →  12      aparece 11 vezes em 48   ← descreve
  =MODO(altura)   →  1,58    aparece  2 vezes em 48   ← não descreve

  Como conferir, na própria planilha:
    ligue o Filtro na coluna, escolha o valor da moda,
    e leia na régua de baixo quantos registros sobraram.`,
    'Numa coluna sem nenhum valor repetido o Excel responderia `#N/D`, e aí ele avisaria. Aqui ele não avisa, porque **há** repetição — duas. O caso que engana não é o que dá erro: é o que responde.',
    ['moda', 'variável contínua'],
  ),
];

/* ── Módulo 3 — Quando a média engana (requisito 3) ───────────────────────── */

const QUANDO_A_MEDIA_ENGANA: TopicoDeVereda[] = [
  t(
    'a-media-e-a-ponta',
    'Um valor muito alto puxa a média e não mexe na mediana',
    'É a assimetria, e é o motivo de as duas medidas existirem.',
    [
      'A média soma tudo, então cada valor entra nela pelo tamanho que tem. Um desbravador com dezoito acampamentos entra com dezoito. A mediana só conta **posições**: ela quer saber quem está no meio da fila, e não o quanto a última pessoa tem.',
      'Na coluna de acampamentos há três veteranos — doze, catorze e dezoito. Eles são três pessoas em quarenta e oito, e levam a média de acampamentos para 2,85. A mediana fica em 2, onde estaria com ou sem eles.',
      'Quando isso acontece, relatar só a média descreve um clube que não existe. "Cada desbravador já foi a quase três acampamentos" é o que a média diz; "vinte e nove dos quarenta e oito foram a dois ou menos" é o que a base diz.',
    ],
    `Acampamentos dos 48 inscritos, em ordem

  0 0 0 1 1 1 1 1 1 1 1 2 2 2 2 2 2 2 2 2 2 2 2 3 3 3 3 3 3 3
  3 4 4 4 4 4 5 5 5 6 6 7 8 12 14 18
                            └──┬───┘
                         três pessoas

  mediana  2      a pessoa do meio da fila
  média    2,85   puxada pelos três do fim
  29 dos 48 fizeram dois acampamentos ou menos`,
    'Os três veteranos não são erro de digitação. Eles entraram no clube cedo e não faltaram, e apagá-los para a média "melhorar" seria apagar a parte mais interessante do clube. O que se faz é relatar a mediana ao lado da média.',
    ['assimetria', 'média', 'mediana'],
  ),
  t(
    'a-razao-entre-as-duas',
    'Dividir a média pela mediana diz se elas concordam',
    'Perto de 1 as duas descrevem o mesmo conjunto; longe de 1, uma delas descreve mal.',
    [
      'Não há como olhar uma média e saber se ela engana. O que dá para fazer é compará-la com a mediana: se as duas estão perto, qualquer uma serve; se estão longe, escolher qual relatar passa a ser escolher o que a liderança vai entender.',
      'A conta é uma divisão. Na idade, 12,40 dividido por 12 dá 1,03 — três por cento de diferença. Na altura dá 0,99. Nos acampamentos dá 1,43: a média está **quarenta e três por cento acima** da mediana.',
      'O caminho óbvio seria contar quantos chegam à média, e ele não separa nada: são 19 dos 48 nos acampamentos e 22 na idade. As duas ficam abaixo da metade, e as duas ficam perto uma da outra — a conta não distingue a coluna que engana.',
    ],
    `Média ÷ mediana, nas três colunas medidas

  idade         12,40 ÷ 12      = 1,03    ← concordam
  altura         1,52 ÷ 1,54    = 0,99    ← concordam
  acampamentos   2,85 ÷ 2       = 1,43    ← discordam

  E quantos chegam à média, de 48:
  idade        22      acampamentos   19
  ↑ as duas abaixo da metade: contar não separa nada`,
    'A razão se escreve apontando para as duas células de cima, e nunca digitando o número. `=1,43` devolve o resultado certo hoje e continua mostrando o de hoje amanhã — é o total digitado à mão que a CC-ES003 já ensinou a desconfiar.',
    ['razão', 'assimetria'],
  ),
  t(
    'e-a-media-nem-sempre-engana',
    'Nas outras duas colunas a média está ótima',
    'Quem sai daqui achando que média sempre mente deixa de usar uma medida boa.',
    [
      'É uma coluna das três. Na idade e na altura a média descreve bem, e relatar a mediana ao lado não acrescenta nada. Se as três fossem assimétricas, a lição seria "a média mente" — e aí ninguém usaria mais a média, o que é pior do que usá-la sem pensar.',
      'A pergunta certa não é "usar média ou mediana?". É "estas duas concordam?". Quando concordam, use a que for mais fácil de explicar. Quando discordam, relate as duas e diga por que elas discordam.',
      'E isso vale para além do clube. Renda média e renda mediana de um país discordam pelo mesmo motivo que os acampamentos: poucas pessoas muito acima puxam a média, e a mediana continua onde está a pessoa do meio.',
    ],
    `As duas maneiras de relatar a mesma coluna

  Só a média:
    "Cada desbravador do clube já foi a quase três acampamentos."
    → verdadeiro sobre o número, falso sobre o clube

  As duas, com a razão:
    "A média é 2,85 e a mediana é 2. Vinte e nove dos quarenta
     e oito foram a dois ou menos; três veteranos, com doze,
     catorze e dezoito, puxam a média para cima."
    → é a mesma base, e agora ela está descrita`,
    'Relatar as duas não é indecisão. É o que se faz quando a base é assimétrica, e é exatamente o que o requisito 3 pede: apresentar um exemplo real em que a mediana descreve melhor.',
    ['média', 'mediana', 'relatório'],
  ),
];

/* ── Módulo 4 — Distribuição de frequências (requisito 5.3) ───────────────── */

const DISTRIBUICAO_DE_FREQUENCIAS: TopicoDeVereda[] = [
  t(
    'frequencia-absoluta-relativa-acumulada',
    'Quantos, que parte do todo, e quantos até aqui',
    'Três colunas sobre a mesma contagem, e cada uma responde outra pergunta.',
    [
      'A **frequência absoluta** é quantos há de cada valor: treze do Falcão, oito da Águia. É a contagem crua, e é ela que se usa quando o número em si importa — treze camisetas a comprar.',
      'A **frequência relativa** é que parte do todo aquilo é: treze de quarenta e oito é 27%. É ela que permite comparar com outro ano, ou com outro clube, em que o total é diferente.',
      'A **frequência acumulada** é quantos já foram contados até ali. Ela serve para responder "quantos estão até este ponto" — e serve de conferência: a última acumulada tem de dar o total, e quando não dá é porque alguma linha ficou de fora ou entrou duas vezes.',
    ],
    `Distribuição por unidade, dos 48 inscritos

  Unidade   Frequência   Relativa   Acumulada
  Falcão        13         27,08%       13
  Águia          8         16,67%       21
  Tucano         8         16,67%       29
  Arara          7         14,58%       36
  Jaguar         6         12,50%       42
  Onça           6         12,50%       48
                                        ↑ tem de bater com o total`,
    'A relativa aponta para a célula do total, e nunca para o 48 digitado. No ano que vem o total é outro, e uma tabela com o 48 escrito à mão continuaria dando porcentagens que somam cem sobre a quantidade errada.',
    ['frequência', 'frequência relativa', 'frequência acumulada'],
  ),
  t(
    'classe',
    'Medida não se conta valor a valor: agrupa-se em classes',
    'Quarenta e oito alturas dariam quarenta e oito linhas de "1", que é a lista com outro nome.',
    [
      'Uma tabela de frequências serve para mostrar **forma**: onde está a maior parte, para que lado ela se estende. Contar a altura valor a valor não mostra forma nenhuma, porque quase toda pessoa tem uma altura diferente da das outras.',
      'A saída é a **classe**: um intervalo. De dez em dez centímetros, as quarenta e oito alturas caem em oito linhas, e aí a forma aparece — a maior parte do clube está entre 1,40 m e 1,70 m, e a barriga da distribuição está em 1,50 a 1,60.',
      'Cada classe é fechada embaixo e **aberta em cima**: de 1,50 inclusive até 1,60 exclusive. Com os dois lados fechados, quem mede exatamente 1,60 entraria em duas classes, e a soma passaria do total sem nada estourar.',
    ],
    `A altura em classes de 10 cm

  Classe        Frequência   Acumulada
  1,00 a 1,10        1            1     ← o 1,05, que é assunto do módulo 7
  1,10 a 1,20        0            1     ← classe vazia, e ela fica na tabela
  1,20 a 1,30        1            2
  1,30 a 1,40        7            9
  1,40 a 1,50       10           19
  1,50 a 1,60       14           33     ← a barriga
  1,60 a 1,70        9           42
  1,70 a 1,80        6           48

  Sem classes: 47 valores distintos, 47 linhas de "1".`,
    'A classe vazia não se apaga. Ela diz que naquele intervalo não há ninguém, e tirá-la da tabela faria a distribuição parecer contínua onde ela tem um buraco — que é justamente a pista de que há um valor solto lá embaixo.',
    ['classe', 'intervalo', 'distribuição'],
  ),
];

/* ── Módulo 5 — Comparar grupos, e o resumo (requisitos 5.4 e 5.5) ────────── */

const COMPARAR_GRUPOS: TopicoDeVereda[] = [
  t(
    'comparar-grupos',
    'A base inteira responde pouco; os grupos dentro dela respondem muito',
    'Comparar unidades é o que transforma quarenta e oito linhas em algo que a liderança lê.',
    [
      'A média do clube é uma frase. As médias por unidade são seis frases, e a diferença entre elas é onde estão as decisões: quem precisa de ajuda, quem tem experiência para emprestar, onde pôr o desbravador novo.',
      'Na planilha isso sai de duas funções. `CONT.SE` conta quantos de um grupo há; `SOMASE` soma a coluna que interessa só para aquele grupo. A média do grupo é a soma dividida pela contagem — esta planilha não tem `MÉDIASE`, e é assim que se faz sem ela.',
      'E a divisão aponta para a célula da contagem que você acabou de calcular ao lado, em vez de repetir o `CONT.SE`. Duas contas iguais na mesma linha divergem no primeiro ajuste, e aí a média de uma unidade passa a ser calculada sobre outro número de pessoas.',
    ],
    `As seis unidades lado a lado

  Unidade   Inscritos   Média de acampamentos   Média de idade
  Falcão       13              2,31                 12,23
  Águia         8              2,13                 12,38
  Tucano        8              3,88                 12,25
  Arara         7              4,71                 12,86
  Jaguar        6              2,17                 12,67
  Onça          6              2,17                 12,17

  A maior unidade não é a mais experiente: o Falcão tem
  quase o dobro de gente da Arara e um terço da experiência
  média dela.`,
    'Contar quantos são e tirar a média são perguntas diferentes, e é fácil responder uma achando que respondeu a outra. "Qual unidade tem mais experiência?" não se responde com a coluna de inscritos.',
    ['comparar grupos', 'SOMASE', 'CONT.SE'],
  ),
  t(
    'o-resumo-e-uma-segunda-leitura',
    'A tabela dinâmica lê o mesmo dado, e as duas têm de concordar',
    'Ela não é um jeito mais bonito de mostrar o que você já sabe.',
    [
      'A tabela dinâmica agrupa e resume sozinha: você diz qual coluna vira linha, qual vira valor, e como resumir. Em três cliques ela faz o que as suas seis fórmulas fizeram.',
      'É por isso que ela vale a pena como **conferência**. Se o resumo e a sua conta discordarem, uma das duas está lendo coisa diferente — e achar qual é o trabalho mais útil do módulo. Concordando, você tem duas leituras independentes do mesmo dado.',
      'E ela **guarda o que leu**. Consertar a base depois não refaz o resumo: ele continua relatando o que a aba era na hora em que foi criado, com números perfeitamente plausíveis. Quem o atualiza é o botão Atualizar Tudo.',
    ],
    `A sua conta e o resumo, sobre a mesma coluna

  A sua fórmula, na aba Cálculos:
    =SOMASE(unidades;"Arara";acampamentos)/inscritos_da_Arara
    → 4,71

  O resumo, na aba de respostas:
    Rótulos de Linha    Média
    Arara                4,71     ← bate
    Tucano               3,88
    ...

  Discordando, uma das duas lê outra coisa —
  e vale mais achar qual do que escolher uma.`,
    'Resumo que chega pronto na reunião é um resumo que alguém criou num dia e ninguém atualizou depois. A pergunta a fazer é sempre a mesma: quando é que isto foi lido?',
    ['tabela dinâmica', 'resumo', 'atualizar'],
  ),
];

/* ── Módulo 6 — Taxa e número absoluto (requisitos 2.6 e 4) ───────────────── */

const TAXA_E_ABSOLUTO: TopicoDeVereda[] = [
  t(
    'taxa-e-uma-divisao',
    'Taxa é uma divisão, e ela precisa do denominador',
    'O formulário só sabe de quem se inscreveu. Quantos são ao todo vem da secretaria.',
    [
      'Número **absoluto** é a contagem crua: treze inscritos do Falcão, três que ficaram de fora. Taxa é aquilo dividido pelo total daquele grupo: treze de dezesseis é 81,25%.',
      'Repare no que a taxa exige: o total. E ele não está na sua base — o formulário registra quem respondeu, e não quem existe. Sem a lista de quantos desbravadores cada unidade tem, a taxa não é calculável, por mais que se olhe a planilha.',
      'É por isso que a aba Unidades existe, e é por isso que a fórmula aponta para ela em vez de trazer o número digitado. O clube cresce: alguém entra na Onça e o denominador muda, e uma taxa com o número escrito à mão continuaria dando um resultado plausível sobre o clube do ano passado.',
    ],
    `Os dois números, lado a lado

  Unidade   Membros   Inscritos   Ficaram de fora   Taxa
  Falcão      16         13              3         81,25%
  Águia       10          8              2         80,00%
  Tucano      10          8              2         80,00%
  Arara        9          7              2         77,78%
  Jaguar       8          6              2         75,00%
  Onça         8          6              2         75,00%
  Total       61         48             13         78,69%

  Membros vem da secretaria do clube.
  Inscritos vem do formulário. Taxa é a divisão dos dois.`,
    'A taxa se deixa como número entre zero e um, e quem a transforma em porcentagem é o formato da célula. Multiplicar por 100 dentro da fórmula dá um número que parece porcentagem e que não é: somá-lo com outro, ou compará-lo com uma taxa de verdade, erra por um fator de cem.',
    ['taxa', 'número absoluto', 'denominador'],
  ),
  t(
    'as-duas-ordenam-ao-contrario',
    'A unidade que mais deixou gente de fora é a que mobilizou melhor',
    'As duas contas estão certas, e levam a conclusões opostas.',
    [
      'O Falcão deixou três desbravadores de fora — mais do que qualquer outra unidade, que deixou dois. Quem ordena por essa coluna conclui que é a unidade que mais deixa gente para trás.',
      'O Falcão também tem a melhor taxa das seis: 81,25%. Quem divide conclui o contrário, e é o contrário que responde à pergunta — porque o Falcão é a maior unidade do clube, e três de dezesseis é menos que dois de oito.',
      'Nenhuma das duas colunas está errada. Elas respondem perguntas diferentes: a absoluta responde **quantas vagas o acampamento perdeu**, e a taxa responde **que parte da unidade veio**. Quem compra comida quer a primeira; quem elogia o conselheiro quer a segunda.',
    ],
    `A mesma tabela, ordenada de dois jeitos

  Por "ficaram de fora", do maior:     Por taxa, do maior:
    Falcão    3                          Falcão    81,25%
    Águia     2                          Águia     80,00%
    Tucano    2                          Tucano    80,00%
    Arara     2                          Arara     77,78%
    Jaguar    2                          Jaguar    75,00%
    Onça      2                          Onça      75,00%

  O primeiro lugar de uma lista é o primeiro da outra —
  e numa ele é o pior resultado, na outra o melhor.`,
    'Comparar números absolutos entre grupos de tamanhos diferentes é o erro mais comum que existe com dados, e é o que o requisito 4 manda demonstrar. Ele não dá erro: dá um ranking plausível que responde a pergunta que ninguém fez.',
    ['taxa', 'número absoluto', 'comparação'],
  ),
];

/* ── Módulo 7 — Valores atípicos (requisitos 2.5 e 5.6) ───────────────────── */

const VALORES_ATIPICOS: TopicoDeVereda[] = [
  t(
    'o-que-e-um-valor-atipico',
    'Atípico é o que está longe do resto — e "longe" tem conta',
    'Não é o maior nem o menor: é o que se separou do conjunto.',
    [
      'Alguém tem de ser o mais novo do clube, e isso não o torna estranho. O menor valor de uma coluna é apenas o menor valor: ele está na ponta porque alguém tem de estar.',
      'Atípico é outra coisa: é o valor que se afastou do conjunto. A conta mais usada parte dos **quartis** — o valor que corta o primeiro quarto da fila (Q1) e o que corta o último (Q3). A distância entre os dois é o miolo da base, onde está metade das pessoas.',
      'A cerca fica a uma vez e meia essa distância de cada lado. O que cai fora dela é candidato a atípico. Na idade, a cerca vai de 6,5 a 18,5 anos: ninguém sai dela, e as seis pontas da coluna são gente comum.',
    ],
    `A cerca das três colunas medidas

              Q1      Q3     miolo   cerca de baixo   cerca de cima
  idade       11      14       3          6,5              18,5
  altura     1,43    1,62    0,195       1,135            1,915
  acampam.     1       3       2          −2                 6

  Fora da cerca:
    idade         nada
    altura        1,05
    acampamentos  12, 14 e 18`,
    'A cerca **aponta**, e não decide. Ela diz que doze acampamentos está longe do resto, e não diz o que fazer com isso — quem decide é você, por escrito, que é o que o requisito 5.6 pede.',
    ['valor atípico', 'quartil', 'cerca'],
  ),
  t(
    'duas-naturezas-de-atipico',
    'Um é gente de verdade; o outro é um dedo que escorregou',
    'E a decisão é oposta nos dois casos.',
    [
      'Dezoito acampamentos é muito e é **possível**: ela entrou no clube cedo e não faltou a nenhum. Apagar esse valor para a média melhorar é apagar a parte mais interessante do clube, e é a coisa mais comum que se faz com um valor atípico.',
      'Uma altura de 1,05 m num desbravador de onze anos não é possível. É o 1,50 com os algarismos trocados — o erro de digitação mais comum que existe. Esse valor sai da análise da altura, porque ele não é a altura de ninguém.',
      'A pergunta que separa os dois não é "está longe?". É "isto é uma pessoa possível?". E ela não se responde com uma fórmula: responde-se conhecendo o clube, que é por que a decisão é sua e vai por escrito.',
    ],
    `Os quatro valores que a cerca acusa

  acampamentos  12    Felipe, entrou com oito anos       → fica
  acampamentos  14    Matheus, mesma história            → fica
  acampamentos  18    Marina, desde os sete              → fica
  altura      1,05    Davi, 11 anos                      → sai

  Os três que ficam mudam o que se relata:
  a mediana vai ao lado da média.
  O que sai é a célula, e não a pessoa.`,
    'Sair não é apagar a linha. O Davi continua inscrito, com camiseta P e três diárias — excluir a pessoa inteira por causa de uma célula é o conserto que perde nove valores bons para arrumar um.',
    ['valor atípico', 'erro de digitação', 'justificativa'],
  ),
];

/* ── Módulo 8 — O gráfico que responde à pergunta (requisito 6) ───────────── */

const O_GRAFICO_QUE_RESPONDE: TopicoDeVereda[] = [
  t(
    'tres-perguntas-tres-desenhos',
    'A pergunta escolhe o gráfico, e não o contrário',
    'Os três tipos desenham sem erro sobre qualquer dado — o que muda é se respondem.',
    [
      '**De que o todo é feito?** É pizza. Ela mostra quanto cada parte pesa no todo, e só faz sentido quando as partes **somam** o todo: as seis unidades somam os quarenta e oito inscritos.',
      '**Quem é maior?** São colunas. Elas comparam categorias que não precisam somar nada — as médias de acampamento por unidade somam 17,1, que não é o total de nada.',
      '**O que mudou ao longo do tempo?** É linha. O traço entre dois pontos afirma que um virou o outro, e é isso que ele serve para dizer: as inscrições da semana 1 viraram as da semana 2. Ligar duas unidades com um traço afirmaria que o Falcão virou a Águia.',
    ],
    `As três perguntas da mesma base

  "De que unidades o acampamento é feito?"
    → pizza: as seis somam 48, e cada fatia é a parte dela

  "Qual unidade já foi a mais acampamentos?"
    → colunas: 4,71 e 2,13 se comparam e não somam nada

  "Como as inscrições chegaram ao longo do prazo?"
    → linha: 19, 6, 7 e 16 por semana, e o traço diz que
      uma semana virou a seguinte

  Desenhados errado, os três não dão erro nenhum: a pizza
  das médias por unidade soma 17,1 e mostra fatias
  perfeitamente plausíveis de um todo que não existe.`,
    'Pizza com muitas fatias pequenas não se lê, e pizza cujas partes não somam o todo não quer dizer nada. As duas passam sem erro — a segunda é a que engana, porque ela parece responder.',
    ['pizza', 'colunas', 'linha', 'gráfico'],
  ),
  t(
    'o-eixo-tem-nome',
    'Gráfico sem eixo identificado não afirma nada',
    'Quem olha vê barras de altura diferente e não sabe do quê.',
    [
      'O eixo de baixo diz **o que cada coluna ou fatia é**: unidade, semana, faixa de altura. O de lado diz **em que unidade o número está**: pessoas, acampamentos, inscrições.',
      'Sem eles, o gráfico é um desenho. Com eles, é uma afirmação — e afirmação é o que se leva para uma reunião. A diferença aparece quando alguém pergunta "isto é quantas pessoas ou quantos acampamentos?", e a resposta está na sua cabeça e não na tela.',
      'Numa pizza não há eixo desenhado, e mesmo assim os dois nomes dizem o que ela mostra: as fatias são unidades, e o que elas repartem são inscritos.',
    ],
    `O mesmo desenho, duas leituras

  Sem nome nos eixos:
    ▁▃▅▂▂▂        seis barras, a terceira maior
                  → não se sabe do quê

  Com nome:
    Média de acampamentos (por desbravador)
    ▁▃▅▂▂▂
    Falcão Águia Tucano Arara Jaguar Onça
                  → agora é uma afirmação`,
    'O título do gráfico não substitui o eixo. "Acampamentos por unidade" não diz se a coluna é a soma, a média ou o máximo — e as três desenham barras de alturas diferentes sobre o mesmo dado.',
    ['eixo', 'rótulo', 'gráfico'],
  ),
];

/* ── Módulo 10 — A conclusão (requisito 8) ────────────────────────────────── */

const A_CONCLUSAO: TopicoDeVereda[] = [
  t(
    'uma-pergunta-que-a-base-responde',
    'A pergunta é sua, e ela tem de se responder com esta base',
    'Metade das perguntas boas que alguém faz sobre um clube não se responde com o formulário dele.',
    [
      'Uma pergunta se responde com a sua base quando as colunas de que ela trata estão lá **e** dá para agrupar ou contar por elas. "Qual unidade tem mais experiência?" trata de unidade e de acampamentos, e as duas estão na base.',
      '"Por que a Arara tem mais experiência?" trata de uma coisa que não está em coluna nenhuma. "Os desbravadores gostaram do último acampamento?" também não — ninguém perguntou isso no formulário.',
      'Não é uma pergunta pior: é uma pergunta para outra base. Saber a diferença antes de começar é o que evita uma análise inteira construída sobre uma coluna que não existe.',
    ],
    `Três perguntas sobre o mesmo clube

  "Qual unidade já foi a mais acampamentos por desbravador,
   e isso tem a ver com o tamanho dela?"
    → unidade + acampamentos + inscritos: a base responde

  "Por que a Arara tem mais experiência?"
    → não há coluna sobre o trabalho do conselheiro,
      nem sobre há quanto tempo cada um está no clube

  "Quem se inscreve mais cedo?"
    → a coluna de nomes tem 48 valores distintos:
      não se agrupa nada por ela`,
    'Marcar as colunas de que a pergunta trata é o que torna "a base responde isto" uma coisa conferível. Não é burocracia: é o passo em que se descobre que a pergunta era sobre outra base.',
    ['pergunta', 'base', 'escopo'],
  ),
  t(
    'o-que-os-dados-nao-dizem',
    'A metade da conclusão que não se escreve sozinha',
    'Quem acabou de achar um número quer contar o que ele mostra, não o que ele não mostra.',
    [
      'Toda base tem limite, e o limite não é falta de coluna: é a pergunta que ela não foi feita para responder. A sua registra **quem se inscreveu**. Ela não diz por quê, e não diz o que teria acontecido se o prazo fosse outro.',
      'Ela também não compara este clube com nenhum outro, porque não há outro clube dentro dela. "O nosso clube é mais experiente que a média" é uma frase que a base não sustenta, por mais média que você calcule.',
      'Escrever isso junto da conclusão parece enfraquecê-la, e faz o contrário: uma conclusão que diz até onde vai é uma conclusão em que se pode confiar dentro daquele limite. Quem não declara o limite deixa que outra pessoa o descubra na reunião.',
    ],
    `A conclusão, e o que ela não afirma

  Afirma:
    "A Arara é a unidade cuja gente já foi a mais
     acampamentos: 4,71 por desbravador, contra 3,88 do
     Tucano e 2,31 do Falcão. Ela não é a maior."

  Não afirma:
    por que isso acontece — não há coluna sobre o
      conselheiro nem sobre tempo de clube
    que a Arara seja melhor em qualquer outra coisa
    que este clube seja mais ou menos experiente
      que outro — não há outro clube na base`,
    'O limite vai em campo próprio, separado da conclusão de propósito. Junto dela ele sai como uma frase de rodapé; separado, ele é uma pergunta que precisa de resposta.',
    ['limite', 'conclusão', 'escopo'],
  ),
];

/* ── Módulo 11 — A defesa diante do examinador (requisito 9) ──────────────── */

const A_DEFESA: TopicoDeVereda[] = [
  t(
    'defender-com-os-dados',
    'Defender quer dizer com número, e não com impressão',
    'Uma defesa sem número é a mesma opinião do examinador, do outro lado da mesa.',
    [
      'O examinador vai contestar a sua conclusão, e isso não é hostilidade: é o trabalho dele. A contestação que os dados desfazem se desfaz com **o número** — e ele já está na sua planilha, calculado por você nos módulos anteriores.',
      '"O Falcão é a unidade que menos leva gente" se desfaz com a taxa: 81,25%, a melhor das seis. "Este é um clube de gente experiente" se desfaz com a mediana ao lado da média: 2 contra 2,85, e vinte e nove dos quarenta e oito com dois ou menos.',
      'Repare que em nenhum dos dois você discutiu opinião. Você mostrou a conta, e a conta estava pronta antes de a pergunta ser feita — que é para isso que se calcula tudo o que se calculou.',
    ],
    `Duas contestações, e o número que responde cada uma

  "O Falcão ficou com três de fora, mais que qualquer outra."
    → a taxa: 13 de 16 é 81,25%, a melhor das seis.
      As outras deixaram dois de fora, de unidades menores:
      a Onça deixou dois de oito, que é 75%.

  "A média é quase três acampamentos: é um clube experiente."
    → a mediana é 2, e a média 2,85. Três veteranos com
      doze, catorze e dezoito puxam a média; 29 dos 48
      fizeram dois acampamentos ou menos.`,
    'Defender não é insistir. Se o número não estiver lá, defender com ele é impossível — e aí a resposta certa é a outra.',
    ['defesa', 'dados', 'taxa'],
  ),
  t(
    'reconhecer-o-limite',
    'Reconhecer o limite não é perder a discussão',
    'É dizer até onde a sua análise vai — e quem reconhece um limite confia mais no resto.',
    [
      'Há contestações que os dados não alcançam, e elas não são sobre falta de coluna: são sobre outra pergunta. "As unidades com mais experiência têm conselheiros melhores" pede uma coluna sobre o trabalho do conselheiro, que nenhuma base de inscrição tem — e nem teria como ter.',
      '"Se a inscrição tivesse aberto um mês mais cedo, teriam vindo mais" pede uma coisa que **nenhuma** base responde: ela registra o que aconteceu, e não o que teria acontecido. Para saber, seria preciso abrir mais cedo uma vez e comparar.',
      'A resposta certa aí é dizer isso, e dizer o que faltaria. Quem defende tudo não entendeu a própria análise; quem reconhece tudo não confia nela. O requisito 9 pede as duas respostas porque as duas são o trabalho.',
    ],
    `Duas contestações que os dados não alcançam

  "As unidades mais experientes têm conselheiros melhores."
    → a base não tem coluna sobre o trabalho do conselheiro,
      e experiência acumulada também depende de há quanto
      tempo cada um está no clube, que ela não registra.
      Reconheço o limite.

  "Com o prazo um mês mais cedo, teriam vindo mais."
    → nenhuma base responde isso: ela registra o que houve.
      Para saber, seria preciso abrir mais cedo uma vez
      e comparar. Reconheço o limite.`,
    'Reconhecer o limite é diferente de não ter resposta. A resposta é: isto a base não responde, e é isto que faltaria para responder.',
    ['limite', 'defesa', 'honestidade'],
  ),
];

/* ── Os módulos ───────────────────────────────────────────────────────────── */

/*
 * Dez módulos, e o nono ainda não está aqui.
 *
 * O requisito 7 pede **três gráficos enganosos reais** — publicados, com
 * fonte. Ele não se escreve de cabeça: analisar um gráfico que alguém
 * desenhou exige ter visto o gráfico, e inventar três casos daria uma lição
 * sobre exemplos que não existem, numa vereda cuja matéria é desconfiar do
 * que lhe mostram. O `m9` fica de fora até os três estarem conferidos contra
 * as fontes primárias, e por isso o id pula de `m8` para `m10`: a numeração
 * segue o requisito, e um `m9` com outro assunto dentro esconderia a falta.
 *
 * Enquanto isso a vereda continua `emConstrucao` — e é por isso que ela pode
 * ter conteúdo: laboratório que abre resolvido e questão repetida reprovam
 * desde já, e não no dia da abertura.
 */
export const MODULOS_DA_ANALISE: ModuloDeVereda[] = [
  {
    id: 'm1',
    titulo: 'O tipo de cada variável',
    resumo: 'Qualitativa ou quantitativa, discreta ou contínua — e as três colunas que não agrupam nada.',
    licoes: [
      {
        id: 'm1-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_ANALISE['m1-teoria'],
        perguntas: 4,
        titulo: 'Que espécie de coluna é esta',
        resumo: 'O teste é sempre o mesmo: somar duas respostas quer dizer alguma coisa?',
        topicos: TIPO_DE_VARIAVEL,
      },
      {
        id: 'm1-lab', tipo: 'analise', licao: 'tipos',
        titulo: 'Classificando as dez colunas da base',
        resumo: 'Inclusive as que você vai deixar de lado — elas também são variáveis.',
        verificacoes: ['toda-coluna-classificada', 'classificacao-certa', 'as-tres-que-nao-agrupam'],
      },
    ],
  },
  {
    id: 'm2',
    titulo: 'Centro e dispersão',
    resumo: 'Média, mediana e moda; amplitude e desvio — e a moda que devolve um número sobre nada.',
    licoes: [
      {
        id: 'm2-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_ANALISE['m2-teoria'],
        perguntas: 4,
        titulo: 'Qual é o valor típico',
        resumo: 'Três respostas diferentes para a mesma pergunta, e por que as três existem.',
        topicos: CENTRO_E_DISPERSAO,
      },
      {
        id: 'm2-lab', tipo: 'analise', licao: 'centro',
        titulo: 'Calculando as cinco medidas',
        resumo: 'E vendo a conta se refazer quando um dado muda.',
        verificacoes: ['media-e-mediana', 'a-moda-das-tres', 'amplitude-e-desvio', 'a-conta-se-refaz'],
      },
    ],
  },
  {
    id: 'm3',
    titulo: 'Quando a média engana',
    resumo: 'Uma coluna das três, e a razão que a denuncia sem precisar olhar a base inteira.',
    licoes: [
      {
        id: 'm3-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_ANALISE['m3-teoria'],
        perguntas: 4,
        titulo: 'A média e a ponta da fila',
        resumo: 'Três pessoas em quarenta e oito, e uma média que descreve um clube que não existe.',
        topicos: QUANDO_A_MEDIA_ENGANA,
      },
      {
        id: 'm3-lab', tipo: 'analise', licao: 'engano',
        titulo: 'Achando a coluna em que a média descreve mal',
        resumo: 'A razão entre média e mediana, e quantos de fato chegam lá.',
        verificacoes: ['a-razao-entre-as-duas', 'quantos-chegam-a-media', 'viu-a-coluna-que-engana'],
      },
    ],
  },
  {
    id: 'm4',
    titulo: 'Distribuição de frequências',
    resumo: 'Quantos, que parte do todo, quantos até aqui — e por que a altura precisa de classes.',
    licoes: [
      {
        id: 'm4-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_ANALISE['m4-teoria'],
        perguntas: 4,
        titulo: 'A tabela que mostra a forma',
        resumo: 'Frequência absoluta, relativa e acumulada, e o intervalo aberto em cima.',
        topicos: DISTRIBUICAO_DE_FREQUENCIAS,
      },
      {
        id: 'm4-lab', tipo: 'analise', licao: 'frequencias',
        titulo: 'Montando as duas distribuições',
        resumo: 'A unidade valor a valor, e a altura em classes de dez centímetros.',
        verificacoes: ['frequencia-por-unidade', 'frequencia-da-altura-por-classe', 'viu-por-que-a-altura-precisa-de-classe'],
      },
    ],
  },
  {
    id: 'm5',
    titulo: 'Comparar grupos, e o resumo que confere',
    resumo: 'As seis unidades lado a lado, e uma tabela dinâmica que tem de concordar com a sua conta.',
    licoes: [
      {
        id: 'm5-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_ANALISE['m5-teoria'],
        perguntas: 4,
        titulo: 'Os grupos dentro da base',
        resumo: 'SOMASE dividido por CONT.SE, e o resumo que guarda o que leu.',
        topicos: COMPARAR_GRUPOS,
      },
      {
        id: 'm5-lab', tipo: 'analise', licao: 'comparacao',
        titulo: 'Comparando as seis unidades',
        resumo: 'E conferindo a sua conta contra uma tabela dinâmica do mesmo dado.',
        verificacoes: ['comparacao-entre-unidades', 'resumo-que-confere', 'a-unidade-mais-experiente'],
      },
    ],
  },
  {
    id: 'm6',
    titulo: 'Taxa e número absoluto',
    resumo: 'A unidade que mais deixou gente de fora é a que mobilizou melhor, e as duas contas estão certas.',
    licoes: [
      {
        id: 'm6-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_ANALISE['m6-teoria'],
        perguntas: 4,
        titulo: 'Três de dezesseis e dois de oito',
        resumo: 'Taxa é uma divisão, e o denominador não vem do formulário.',
        topicos: TAXA_E_ABSOLUTO,
      },
      {
        id: 'm6-lab', tipo: 'analise', licao: 'adesao',
        titulo: 'Calculando a adesão de cada unidade',
        resumo: 'E reparando que as duas colunas ordenam ao contrário.',
        verificacoes: ['adesao-por-unidade', 'viu-as-duas-leituras', 'qual-mobilizou-melhor'],
      },
    ],
  },
  {
    id: 'm7',
    titulo: 'Valores atípicos',
    resumo: 'Estar na ponta não é ser atípico, e ser atípico não quer dizer sair.',
    licoes: [
      {
        id: 'm7-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_ANALISE['m7-teoria'],
        perguntas: 4,
        titulo: 'O que está longe do resto',
        resumo: 'A cerca aponta; quem decide é você, por escrito.',
        topicos: VALORES_ATIPICOS,
      },
      {
        id: 'm7-lab', tipo: 'analise', licao: 'atipicos',
        titulo: 'Julgando os dezoito valores das pontas',
        resumo: 'E escrevendo por que um fica e por que o outro sai.',
        verificacoes: ['toda-ponta-julgada', 'os-vereditos-certos', 'as-duas-justificativas'],
      },
    ],
  },
  {
    id: 'm8',
    titulo: 'O gráfico que responde à pergunta',
    resumo: 'Composição, comparação e evolução — e os três tipos desenham sem erro sobre qualquer dado.',
    licoes: [
      {
        id: 'm8-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_ANALISE['m8-teoria'],
        perguntas: 4,
        titulo: 'A pergunta escolhe o desenho',
        resumo: 'Pizza para o todo, colunas para comparar, linha para o tempo — e o eixo com nome.',
        topicos: O_GRAFICO_QUE_RESPONDE,
      },
      {
        id: 'm8-lab', tipo: 'analise', licao: 'graficos',
        titulo: 'Três perguntas, três gráficos',
        resumo: 'Um por aba, com os eixos escritos e a escolha justificada.',
        verificacoes: ['os-tres-graficos', 'os-eixos-escritos', 'as-tres-justificativas'],
      },
    ],
  },
  {
    id: 'm10',
    titulo: 'A conclusão, em uma página',
    resumo: 'Uma pergunta sua, respondida com número — e o que esta base não permite afirmar.',
    licoes: [
      {
        id: 'm10-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_ANALISE['m10-teoria'],
        perguntas: 4,
        titulo: 'Escrever o que se achou',
        resumo: 'A pergunta que a base responde, e o limite que não se escreve sozinho.',
        topicos: A_CONCLUSAO,
      },
      {
        id: 'm10-lab', tipo: 'analise', licao: 'conclusao',
        titulo: 'A sua pergunta e a sua conclusão',
        resumo: 'Com o número que a sustenta, e o que os dados não dizem em campo próprio.',
        verificacoes: ['uma-pergunta-que-a-base-responde', 'respondida-com-os-dados', 'a-conclusao-em-uma-pagina', 'o-que-os-dados-nao-dizem'],
      },
    ],
  },
  {
    id: 'm11',
    titulo: 'A defesa diante do examinador',
    resumo: 'Defender com os dados quando eles bastam, e reconhecer o limite quando não.',
    licoes: [
      {
        id: 'm11-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_ANALISE['m11-teoria'],
        perguntas: 4,
        titulo: 'As duas respostas certas',
        resumo: 'Quem defende tudo não entendeu a análise; quem reconhece tudo não confia nela.',
        topicos: A_DEFESA,
      },
      {
        id: 'm11-lab', tipo: 'analise', licao: 'defesa',
        titulo: 'Respondendo às quatro contestações',
        resumo: 'Duas se desfazem com os seus números; duas não, e dizer isso é a resposta.',
        verificacoes: ['toda-contestacao-respondida', 'os-vereditos-certos', 'defendida-com-numero'],
      },
    ],
  },
];
