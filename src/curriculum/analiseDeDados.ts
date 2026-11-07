import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { telasDoTopico } from './telas';
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

/*
  O exemplo é a tela da planilha do laboratório, e não um quadro de texto — e a
  base fotografada é outra.

  A teoria nasceu com um quadro em cada tópico, e o quadro era a própria
  inscrição do acampamento que o laboratório analisa: os 12,40 anos, os 2,85
  acampamentos, os 4,71 da Arara, os 81,25% do Falcão, o 1,05 do Davi. Quem lia
  a teoria chegava ao laboratório com as respostas. Hoje os tópicos que ensinam
  um gesto o mostram na planilha, sobre as inscrições do Campori de Primavera
  (`src/exemplos/camporiDePrimavera.ts`), e os que só explicam uma ideia ficam
  em prosa, com os números dessa mesma base.
*/
const V = 'CC-ES009';
const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], atencao: string, marcas: string[],
  telas?: [legenda: string, descricao: string][],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, atencao, marcas,
  ...(telas ? { telas: telasDoTopico(V, id, telas) } : {}),
})

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
    'A coluna de diárias tem os valores 2 e 3, e é quantitativa. A de camiseta tem PP, P, M, G e GG, e é qualitativa — mesmo que alguém as numerasse de 1 a 5, somar dois tamanhos continuaria não querendo dizer nada.',
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
    'Discreta não quer dizer "poucos valores diferentes". Na inscrição do campori a altura tem vinte e seis valores distintos em quarenta e duas respostas, e os acampamentos têm onze — mas o que separa as duas é medir e contar, e não quantos valores apareceram.',
    ['discreta', 'contínua'],
  ),
  t(
    'coluna-que-nao-agrupa',
    'Três colunas não servem para agrupar nem contar',
    'Nome, e-mail e observação são qualitativas como a unidade — e cada valor delas aparece uma vez só.',
    [
      'Agrupar é pôr junto quem respondeu a mesma coisa. Na unidade cabem doze pessoas dentro de "Falcão"; no nome cabe uma. Uma tabela de frequências por nome tem uma linha de "1" para cada pessoa, e uma pizza de nomes tem tantas fatias iguais quanto inscritos.',
      'Isso não torna essas colunas inúteis: o nome é o que faz cada linha ser uma pessoa, e o e-mail é como o clube fala com a família. O que elas não servem é para **comparar grupos** — que é a metade do trabalho que você vai fazer nos módulos seguintes.',
      'Saber disso antes de começar é o que evita a pergunta que não se responde. "Quem se inscreve mais cedo?" não se responde com uma coluna de nomes todos diferentes; "qual unidade se inscreve mais cedo?" se responde.',
    ],
    'A observação é o caso que engana: a maioria das pessoas deixa em branco, então há poucos valores distintos preenchidos. O que se conta são os **preenchidos** — e cada um deles é uma frase que só uma pessoa escreveu.',
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
      'A **mediana** é o valor do meio, com a lista em ordem. Metade está abaixo dela, metade acima. Ela não se mexe quando um valor da ponta muda: trocar dezesseis acampamentos por cento e sessenta não muda a mediana em nada.',
      'A **moda** é o valor que mais se repete. Ela é a única que serve para coluna qualitativa — a unidade mais comum do campori é o Falcão, e isso é uma moda —, e é a que a planilha responde com mais confiança e menos aviso.',
    ],
    'Média e mediana não são "a mesma coisa calculada de dois jeitos". Elas respondem perguntas diferentes: a média responde "quanto daria a cada um se fosse dividido igualmente", e a mediana responde "quanto tem a pessoa do meio".',
    ['média', 'mediana', 'moda', 'tendência central'],
    [
      [
        'Na aba Cálculos, a idade dos 42 inscritos do campori: MÉDIA dá 12,38, MED dá 12,50 e MODO dá 13. Aqui as três ficam perto, e isso também é informação.',
        'Células A3 a B5 da aba Cálculos destacadas com Média 12,38, Mediana 12,50 e Moda 13, e a barra de fórmulas destacada com =MODO(Respostas!F2:F43).',
      ],
    ],
  ),
  t(
    'amplitude-e-desvio',
    'O centro diz em volta de quê; a dispersão diz o quanto se afasta',
    'Dois grupos com a mesma média podem não ter nada a ver um com o outro.',
    [
      'A **amplitude** é a distância entre as pontas: o maior valor menos o menor. É a conta mais simples que existe e a mais frágil — ela olha só dois valores da base inteira, e um deles pode ser um erro de digitação.',
      'O **desvio padrão** mede o quanto os valores se afastam da média, em média. Perto de zero quer dizer que quase todo mundo está junto; grande quer dizer que estão espalhados. Ele olha a base toda, e por isso é o que se relata ao lado da média.',
      'O par centro-e-dispersão é o que descreve um conjunto em dois números. "Idade média 12,38 anos, desvio 1,41" diz que o campori é de gente entre onze e catorze. "Acampamentos: média 3,29, desvio 3,02" diz que o desvio é **quase do tamanho da média** — e isso é um aviso de que a média ali não está descrevendo bem.',
    ],
    'Na plataforma o desvio padrão é `DESVPADP`, com P no fim — o de população. A base é o clube inteiro que se inscreveu, e não uma amostra dele; `DESVPAD` sem o P calcula para amostra e devolve um número um pouco maior, sem avisar que respondeu outra pergunta.',
    ['amplitude', 'desvio padrão', 'dispersão'],
    [
      [
        'As cinco medidas lado a lado para a idade, a altura e os acampamentos. A amplitude dos acampamentos é 16 e o desvio é 3,02, quase do tamanho da média de 3,29.',
        'Bloco A2 a D7 da aba Cálculos destacado com média, mediana, moda, amplitude e desvio das três colunas, e a barra de fórmulas destacada com =DESVPADP(Respostas!J2:J43).',
      ],
    ],
  ),
  t(
    'a-moda-nao-avisa',
    'A planilha devolve um número mesmo quando ele não descreve ninguém',
    'A moda da altura é 1,45 m — e quatro pessoas em quarenta e duas têm essa altura.',
    [
      'Moda só quer dizer alguma coisa quando o valor se repete bastante. A moda da idade do campori é 13 e ela aparece doze vezes: quase um terço dos inscritos. A moda da altura é 1,45 e ela aparece **quatro** vezes.',
      'A planilha não faz essa diferença. `MODO` devolve 13 numa coluna e 1,45 na outra, com a mesma cara e sem nenhum aviso. Não é defeito dela: é que a pergunta "este valor descreve o conjunto?" não é uma pergunta que uma fórmula faça.',
      'É por isso que a moda quase não serve para coluna contínua. Medida tem quase um valor distinto por pessoa, então o que mais se repete se repete por acaso — e a resposta é um número perfeitamente plausível sobre quase ninguém.',
    ],
    'Numa coluna sem nenhum valor repetido o Excel responderia `#N/D`, e aí ele avisaria. Aqui ele não avisa, porque **há** repetição — quatro. O caso que engana não é o que dá erro: é o que responde.',
    ['moda', 'variável contínua'],
    [
      [
        'A moda da idade é 13 e a da altura é 1,45: as duas saem com a mesma cara, sem aviso nenhum.',
        'Células B5 e C5 da aba Cálculos destacadas com 13 e 1,45, e a barra de fórmulas destacada com =MODO(Respostas!G2:G43).',
      ],
      [
        'Filtrando a altura em 1,45, a régua diz quantos registros sobraram: 4 de 42. A moda da altura descreve quatro pessoas.',
        'Cabeçalho Altura em metros destacado com a setinha do filtro, e a barra de status destacada com 4 de 42 registros encontrados.',
      ],
    ],
  ),
];

/* ── Módulo 3 — Quando a média engana (requisito 3) ───────────────────────── */

const QUANDO_A_MEDIA_ENGANA: TopicoDeVereda[] = [
  t(
    'a-media-e-a-ponta',
    'Um valor muito alto puxa a média e não mexe na mediana',
    'É a assimetria, e é o motivo de as duas medidas existirem.',
    [
      'A média soma tudo, então cada valor entra nela pelo tamanho que tem. Um desbravador com dezesseis acampamentos entra com dezesseis. A mediana só conta **posições**: ela quer saber quem está no meio da fila, e não o quanto a última pessoa tem.',
      'Na inscrição do campori há dois veteranos — onze e dezesseis acampamentos. Eles são duas pessoas em quarenta e duas, e levam a média de acampamentos para 3,29. A mediana fica em 2,5, onde estaria com ou sem eles.',
      'Quando isso acontece, relatar só a média descreve um clube que não existe. "Cada desbravador já foi a mais de três acampamentos" é o que a média diz; "21 dos 42 foram a dois ou menos" é o que a base diz.',
    ],
    'Os dois veteranos não são erro de digitação. Eles entraram no clube cedo e não faltaram, e apagá-los para a média "melhorar" seria apagar a parte mais interessante do clube. O que se faz é relatar a mediana ao lado da média.',
    ['assimetria', 'média', 'mediana'],
    [
      [
        'Com o cursor na coluna dos acampamentos, Classificar de Z a A leva as pontas para cima: o Bento Fagundes, com 16, e o Kevin Valadares, com 11.',
        'Nomes e acampamentos das linhas 2 e 3 destacados depois de classificar em ordem decrescente: Bento Fagundes 16 e Kevin Valadares 11.',
      ],
    ],
  ),
  t(
    'a-razao-entre-as-duas',
    'Dividir a média pela mediana diz se elas concordam',
    'Perto de 1 as duas descrevem o mesmo conjunto; longe de 1, uma delas descreve mal.',
    [
      'Não há como olhar uma média e saber se ela engana. O que dá para fazer é compará-la com a mediana: se as duas estão perto, qualquer uma serve; se estão longe, escolher qual relatar passa a ser escolher o que a liderança vai entender.',
      'A conta é uma divisão. Na idade, 12,38 dividido por 12,50 dá 0,99. Na altura dá 1,00. Nos acampamentos dá 1,31: a média está **trinta e um por cento acima** da mediana.',
      'O caminho óbvio seria contar quantos chegam à média, e ele não separa nada: são 16 dos 42 nos acampamentos e 21 na idade. As duas ficam perto da metade, e a conta não distingue a coluna que engana.',
    ],
    'A razão se escreve apontando para as duas células de cima, e nunca digitando o número. `=1,31` devolve o resultado certo hoje e continua mostrando o de hoje amanhã — é o total digitado à mão que a CC-ES003 já ensinou a desconfiar.',
    ['razão', 'assimetria'],
    [
      [
        'A razão aponta para a média e a mediana de cima: =D3/D4. Idade 0,99, altura 1,00 e acampamentos 1,31 — só a última coluna discorda.',
        'Médias e medianas das linhas 3 e 4 destacadas, e a linha Média ÷ mediana destacada com 0,99, 1,00 e 1,31; a barra de fórmulas mostra =D3/D4.',
      ],
    ],
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
      'A **frequência absoluta** é quantos há de cada valor: doze do Falcão, sete da Águia. É a contagem crua, e é ela que se usa quando o número em si importa — doze camisetas a comprar.',
      'A **frequência relativa** é que parte do todo aquilo é: doze de quarenta e dois é 28,57%. É ela que permite comparar com outro ano, ou com outro clube, em que o total é diferente.',
      'A **frequência acumulada** é quantos já foram contados até ali. Ela serve para responder "quantos estão até este ponto" — e serve de conferência: a última acumulada tem de dar o total, e quando não dá é porque alguma linha ficou de fora ou entrou duas vezes.',
    ],
    'A relativa aponta para a célula do total, e não para o número digitado. No ano que vem o total é outro, e uma tabela com o total escrito à mão continuaria dando porcentagens que somam cem sobre a quantidade errada.',
    ['frequência', 'frequência relativa', 'frequência acumulada'],
    [
      [
        'CONT.SE conta cada unidade, a relativa divide pelo total e a acumulada soma a de cima: a última linha fecha em 42, que é o total de inscritos.',
        'Bloco da distribuição por unidade destacado, com Falcão 12, Águia 7, Tucano 7, Arara 6, Jaguar 5 e Onça 5, a relativa e a acumulada terminando em 42; a barra mostra =D7+B8.',
      ],
    ],
  ),
  t(
    'classe',
    'Medida não se conta valor a valor: agrupa-se em classes',
    'Quarenta e duas alturas dariam quase uma linha de "1" para cada pessoa, que é a lista com outro nome.',
    [
      'Uma tabela de frequências serve para mostrar **forma**: onde está a maior parte, para que lado ela se estende. Contar a altura valor a valor não mostra forma nenhuma, porque quase toda pessoa tem uma altura diferente da das outras.',
      'A saída é a **classe**: um intervalo. De dez em dez centímetros, as quarenta e duas alturas do campori caem em sete linhas, e aí a forma aparece — a maior parte está entre 1,30 m e 1,70 m, e a barriga da distribuição está em 1,40 a 1,50, com 13 pessoas.',
      'Cada classe é fechada embaixo e **aberta em cima**: de 1,50 inclusive até 1,60 exclusive. Com os dois lados fechados, quem mede exatamente 1,60 entraria em duas classes, e a soma passaria do total sem nada estourar.',
    ],
    'A classe vazia não se apaga. De 1,20 a 1,30 não há ninguém, e tirá-la da tabela faria a distribuição parecer contínua onde ela tem um buraco — que é justamente a pista de que há um valor solto lá embaixo, o 1,16.',
    ['classe', 'intervalo', 'distribuição'],
  ),
];

/* ── Módulo 5 — Comparar grupos, e o resumo (requisitos 5.4 e 5.5) ────────── */

const COMPARAR_GRUPOS: TopicoDeVereda[] = [
  t(
    'comparar-grupos',
    'A base inteira responde pouco; os grupos dentro dela respondem muito',
    'Comparar unidades é o que transforma uma lista de inscrições em algo que a liderança lê.',
    [
      'A média do clube é uma frase. As médias por unidade são seis frases, e a diferença entre elas é onde estão as decisões: quem precisa de ajuda, quem tem experiência para emprestar, onde pôr o desbravador novo.',
      'Na planilha isso sai de duas funções. `CONT.SE` conta quantos de um grupo há; `SOMASE` soma a coluna que interessa só para aquele grupo. A média do grupo é a soma dividida pela contagem — esta planilha não tem `MÉDIASE`, e é assim que se faz sem ela.',
      'E a divisão aponta para a célula da contagem que você acabou de calcular ao lado, em vez de repetir o `CONT.SE`. Duas contas iguais na mesma linha divergem no primeiro ajuste, e aí a média de uma unidade passa a ser calculada sobre outro número de pessoas.',
    ],
    'Contar quantos são e tirar a média são perguntas diferentes, e é fácil responder uma achando que respondeu a outra. "Qual unidade tem mais experiência?" não se responde com a coluna de inscritos.',
    ['comparar grupos', 'SOMASE', 'CONT.SE'],
    [
      [
        'No campori, o Falcão tem mais inscritos — 12 — e a menor média de acampamentos, 2. O Jaguar, com 5, tem a maior: 5,60.',
        'Bloco da comparação destacado com inscritos e média de acampamentos das seis unidades, e a barra de fórmulas destacada com =SOMASE(Respostas!$C$2:$C$43;A7;Respostas!$J$2:$J$43)/B7.',
      ],
    ],
  ),
  t(
    'o-resumo-e-uma-segunda-leitura',
    'A tabela dinâmica lê o mesmo dado, e as duas têm de concordar',
    'Ela não é um jeito mais bonito de mostrar o que você já sabe.',
    [
      'A tabela dinâmica agrupa e resume sozinha: você diz qual coluna vira linha, qual vira valor, e como resumir. Em três cliques ela faz o que as suas seis fórmulas fizeram.',
      'É por isso que ela vale a pena como **conferência**. Se o resumo e a sua conta discordarem, uma das duas está lendo coisa diferente — e achar qual é o trabalho mais útil do módulo. Concordando, você tem duas leituras independentes do mesmo dado — no campori, as duas têm de dizer 5,60 para o Jaguar.',
      'E ela **guarda o que leu**. Consertar a base depois não refaz o resumo: ele continua relatando o que a aba era na hora em que foi criado, com números perfeitamente plausíveis. Quem o atualiza é o botão Atualizar Tudo.',
    ],
    'Resumo que chega pronto na reunião é um resumo que alguém criou num dia e ninguém atualizou depois. A pergunta a fazer é sempre a mesma: quando é que isto foi lido?',
    ['tabela dinâmica', 'resumo', 'atualizar'],
    [
      [
        'Inserir › Tabela dinâmica: a Unidade vira linha, os acampamentos viram valor e o resumo é a Média. A caixa já avisa que o resumo guarda o que leu.',
        'Caixa Criar tabela dinâmica destacada sobre a aba Respostas, com Linhas Unidade, Valores Quantos acampamentos do clube já fez e Resumir por Média.',
      ],
    ],
  ),
];

/* ── Módulo 6 — Taxa e número absoluto (requisitos 2.6 e 4) ───────────────── */

const TAXA_E_ABSOLUTO: TopicoDeVereda[] = [
  t(
    'taxa-e-uma-divisao',
    'Taxa é uma divisão, e ela precisa do denominador',
    'O formulário só sabe de quem se inscreveu. Quantos são ao todo vem da secretaria.',
    [
      'Número **absoluto** é a contagem crua: doze inscritos do Falcão, quatro que ficaram de fora. Taxa é aquilo dividido pelo total daquele grupo: doze de dezesseis é 75%.',
      'Repare no que a taxa exige: o total. E ele não está na sua base — o formulário registra quem respondeu, e não quem existe. Sem a lista de quantos desbravadores cada unidade tem, a taxa não é calculável, por mais que se olhe a planilha.',
      'É por isso que a aba Unidades existe, e é por isso que a fórmula aponta para ela em vez de trazer o número digitado. O clube cresce: alguém entra na Onça e o denominador muda, e uma taxa com o número escrito à mão continuaria dando um resultado plausível sobre o clube do ano passado.',
    ],
    'A taxa se deixa como número entre zero e um, e quem a transforma em porcentagem é o formato da célula. Multiplicar por 100 dentro da fórmula dá um número que parece porcentagem e que não é: somá-lo com outro, ou compará-lo com uma taxa de verdade, erra por um fator de cem.',
    ['taxa', 'número absoluto', 'denominador'],
    [
      [
        'Os membros vêm da aba Unidades por PROCV, os inscritos por CONT.SE, os de fora pela diferença, e a taxa pela divisão: o Falcão leva 12 de 16, ou 0,75.',
        'Bloco da adesão por unidade destacado, com membros, inscritos, ficaram de fora e taxa das seis unidades, e a barra de fórmulas destacada com =C3/B3.',
      ],
    ],
  ),
  t(
    'as-duas-ordenam-ao-contrario',
    'A unidade que mais deixou gente de fora é a que mobilizou melhor',
    'As duas contas estão certas, e levam a conclusões opostas.',
    [
      'No campori, o Falcão deixou quatro desbravadores de fora — mais do que qualquer outra unidade, que deixou três. Quem ordena por essa coluna conclui que é a unidade que mais deixa gente para trás.',
      'O Falcão também tem a melhor taxa das seis: 75%. Quem divide conclui o contrário, e é o contrário que responde à pergunta — porque o Falcão é a maior unidade do clube, e quatro de dezesseis é menos que três de oito.',
      'Nenhuma das duas colunas está errada. Elas respondem perguntas diferentes: a absoluta responde **quantas vagas o campori perdeu**, e a taxa responde **que parte da unidade veio**. Quem compra comida quer a primeira; quem elogia o conselheiro quer a segunda.',
    ],
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
      'A cerca fica a uma vez e meia essa distância de cada lado. O que cai fora dela é candidato a atípico. Na idade do campori, Q1 é 11 e Q3 é 13, e a cerca vai de 8 a 16 anos: ninguém sai dela. Nos acampamentos, Q1 é 1 e Q3 é 4, a cerca de cima fica em 8,5, e o 11 e o 16 caem fora.',
    ],
    'A cerca **aponta**, e não decide. Ela diz que dezesseis acampamentos está longe do resto, e não diz o que fazer com isso — quem decide é você, por escrito, que é o que o requisito 5.6 pede.',
    ['valor atípico', 'quartil', 'cerca'],
  ),
  t(
    'duas-naturezas-de-atipico',
    'Um é gente de verdade; o outro é um dedo que escorregou',
    'E a decisão é oposta nos dois casos.',
    [
      'Dezesseis acampamentos é muito e é **possível**: o Bento entrou no clube cedo e não faltou a nenhum. Apagar esse valor para a média melhorar é apagar a parte mais interessante do clube, e é a coisa mais comum que se faz com um valor atípico.',
      'Uma altura de 1,16 m num desbravador de treze anos que pediu camiseta G não é possível. É o 1,61 com os algarismos trocados — o erro de digitação mais comum que existe. Esse valor sai da análise da altura, porque ele não é a altura de ninguém.',
      'A pergunta que separa os dois não é "está longe?". É "isto é uma pessoa possível?". E ela não se responde com uma fórmula: responde-se conhecendo o clube, que é por que a decisão é sua e vai por escrito.',
    ],
    'Sair não é apagar a linha. O Samuel continua inscrito, com camiseta G e três diárias — excluir a pessoa inteira por causa de uma célula é o conserto que perde nove valores bons para arrumar um.',
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
      '**De que o todo é feito?** É pizza. Ela mostra quanto cada parte pesa no todo, e só faz sentido quando as partes **somam** o todo: as seis unidades somam os quarenta e dois inscritos do campori.',
      '**Quem é maior?** São colunas. Elas comparam categorias que não precisam somar nada — as médias de acampamento por unidade somam 21,61, que não é o total de nada.',
      '**O que mudou ao longo do tempo?** É linha. O traço entre dois pontos afirma que um virou o outro, e é isso que ele serve para dizer: as 4 inscrições da primeira semana do campori viraram as 16 da última. Ligar duas unidades com um traço afirmaria que o Falcão virou a Águia.',
    ],
    'Pizza com muitas fatias pequenas não se lê, e pizza cujas partes não somam o todo não quer dizer nada. As duas passam sem erro — a segunda é a que engana, porque ela parece responder.',
    ['pizza', 'colunas', 'linha', 'gráfico'],
    [
      [
        'Na aba Composição, com Unidade e Inscritos selecionados, Inserir › Gráfico: Pizza, porque a pergunta é de que o todo é feito, e o título é a própria pergunta.',
        'Caixa Inserir Gráfico destacada com os dados de A1:B7, Tipo Pizza, a nota Repartição, o título De que unidades o campori é feito?, Unidade e Inscritos nos eixos.',
      ],
      [
        'A pizza reparte os 42 inscritos entre as seis unidades: as fatias somam o todo, e é por isso que ela responde.',
        'Gráfico de pizza destacado sobre a aba Composição, com o título da pergunta, as seis fatias e a legenda das unidades.',
      ],
    ],
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
    'O título do gráfico não substitui o eixo. "Acampamentos por unidade" não diz se a coluna é a soma, a média ou o máximo — e as três desenham barras de alturas diferentes sobre o mesmo dado.',
    ['eixo', 'rótulo', 'gráfico'],
    [
      [
        'Nas colunas da aba Comparação, os dois eixos dizem o que se lê: cada coluna é uma unidade, e a altura é a média de acampamentos por desbravador.',
        'Gráfico de colunas destacado com o título Qual unidade já foi a mais acampamentos? e a linha de eixos Unidade × Média de acampamentos por desbravador.',
      ],
    ],
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
      '"Por que o Jaguar tem mais experiência?" trata de uma coisa que não está em coluna nenhuma. "Os desbravadores gostaram do último campori?" também não — ninguém perguntou isso no formulário.',
      'Não é uma pergunta pior: é uma pergunta para outra base. Saber a diferença antes de começar é o que evita uma análise inteira construída sobre uma coluna que não existe.',
    ],
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
      'No campori, "o Falcão é a unidade que menos leva gente" se desfaz com a taxa: 75%, a melhor das seis. "Este é um clube de gente experiente" se desfaz com a mediana ao lado da média: 2,5 contra 3,29, e 21 dos 42 com dois ou menos.',
      'Repare que em nenhum dos dois você discutiu opinião. Você mostrou a conta, e a conta estava pronta antes de a pergunta ser feita — que é para isso que se calcula tudo o que se calculou.',
    ],
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
/* ── Módulo 9 — Os quatro recursos que distorcem (requisito 7) ────────────── */

const RECURSOS_QUE_DISTORCEM: TopicoDeVereda[] = [
  t(
    'o-numero-certo-no-desenho-errado',
    'Quase todo gráfico enganoso usa números verdadeiros',
    'É isso que o torna difícil: não há o que conferir na conta, porque a conta está certa.',
    [
      'Um gráfico mente de um jeito diferente de uma frase. A frase afirma algo falso e dá para checar. O gráfico escreve os números certos e **desenha** outra coisa — e o que a pessoa leva embora é o desenho, não a tabela.',
      'Por isso procurar o erro na conta não funciona. Nos três casos que você vai analisar, nenhum número está errado: o IPCA era aquele, as mortes do dia eram aquelas, as mortes por estado eram aquelas. O que está errado é a altura, o pedaço escolhido ou o que foi posto lado a lado.',
      'São quatro recursos, e eles cobrem quase tudo o que se vê: **eixo truncado**, **escala inadequada**, **base incomparável** e **recorte conveniente do período**. Saber o nome deles é o que faz alguém reconhecer o próximo.',
    ],
    'Nenhum dos quatro dá erro em lugar nenhum. Um gráfico errado continua sendo um gráfico, e é por isso que ele atravessa a redação, a reunião e o grupo da família sem ninguém reclamar.',
    ['gráfico enganoso', 'recurso de distorção'],
  ),
  t(
    'eixo-e-escala',
    'O eixo truncado exagera a diferença; a escala inadequada inverte',
    'Os dois mexem na altura, e não são o mesmo defeito.',
    [
      '**Eixo truncado** é o eixo que não começa em zero. As alturas continuam em ordem — a barra maior é a do número maior —, só que a diferença entre elas fica muito maior do que é. Uma variação de 1,4% desenhada num eixo que vai de 4,18 a 4,30 vira uma barra quatro vezes a outra.',
      '**Escala inadequada** é pior e mais raro: a altura deixa de ler o número. A barra do número menor sai mais alta que a do maior, ou duas barras de valor idêntico saem de alturas diferentes. Aqui não há exagero — há contradição.',
      'O jeito de distinguir é olhar a **ordem**. Se as barras estão na ordem certa e as diferenças parecem grandes demais, procure onde o eixo começa. Se uma barra menor está mais alta que uma maior, não é o eixo: é o desenho que não leu a tabela.',
    ],
    'Eixo truncado não é sempre desonesto: num gráfico de temperatura corporal, começar em zero esconderia tudo o que importa. O que ele exige é estar **escrito**, para quem lê saber que a altura não é proporção.',
    ['eixo truncado', 'escala inadequada'],
  ),
  t(
    'base-e-recorte',
    'A base incomparável põe lado a lado o que não se compara; o recorte escolhe o pedaço',
    'Os dois têm o desenho impecável, e é o que entrou nele que engana.',
    [
      '**Base incomparável** é comparar coisas de tamanhos muito diferentes como se fossem iguais. Um estado com 46 milhões de habitantes encabeça todo gráfico absoluto deste país — de mortes, de nascimentos, de carros, de escolas — porque é onde vive mais gente. A comparação que diz alguma coisa é por habitante.',
      'Ela também aparece em medidas de naturezas diferentes na mesma escala: variação de um trimestre contra o anterior ao lado de variação de um ano contra o outro, ou número absoluto ao lado de porcentagem. Os dois são números; eles não são a mesma coisa.',
      '**Recorte conveniente do período** é mostrar o pedaço do tempo que convém. Cada número do recorte é verdadeiro, e o que ficou de fora é o que mudava a leitura: as mortes de um dia são verdadeiras, e o acumulado é quarenta vezes aquilo.',
    ],
    'O teste do recorte é perguntar o que vem **antes** e **depois** do pedaço mostrado. Se o gráfico começa num ano específico sem motivo declarado, procure a série inteira: o motivo costuma estar no que ficou de fora.',
    ['base incomparável', 'recorte do período', 'taxa por habitante'],
  ),
];

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
    id: 'm9',
    titulo: 'Três gráficos enganosos reais',
    resumo: 'Números verdadeiros, desenhos que mentem — e os quatro recursos que fazem isso.',
    licoes: [
      {
        id: 'm9-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_ANALISE['m9-teoria'],
        perguntas: 4,
        titulo: 'Como um gráfico mente com números certos',
        resumo: 'Eixo truncado, escala inadequada, base incomparável e recorte do período.',
        topicos: RECURSOS_QUE_DISTORCEM,
      },
      {
        id: 'm9-lab', tipo: 'analise', licao: 'enganosos',
        titulo: 'Analisando três gráficos que foram publicados',
        resumo: 'Da GloboNews, do Ministério da Saúde e do ranking de mortes por estado.',
        verificacoes: ['todo-grafico-classificado', 'os-recursos-certos', 'viu-os-tres-honestos'],
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
