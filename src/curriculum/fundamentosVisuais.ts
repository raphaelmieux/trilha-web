import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DOS_FUNDAMENTOS as Q } from './questoesDosFundamentos';

/*
 * A vereda CC-DG001 Fundamentos Visuais.
 *
 * ── O que ela é ─────────────────────────────────────────────────────────
 * A porta da família de Design, e a que não pede programa nenhum antes dela.
 * Os seis princípios do requisito 1, a cor do 2 e a tipografia do 3 viram
 * oito lições, cada uma com uma peça do clube que chega com o defeito que a
 * lição ensina a ver — o cartaz em que tudo tem o mesmo tamanho, o aviso em
 * que cada linha começa num lugar, a escala da cantina em que só a cor diz
 * quem vem.
 *
 * ── O editor é o mesmo da família inteira ───────────────────────────────
 * As peças abrem no editor de design de `editorDeDesign.tsx`, que as veredas
 * de vetor, de identidade e de diagramação vão abrir também. E as medidas de
 * cada princípio são as de `design.ts`: a lição que manda criar hierarquia e
 * a que manda julgar a hierarquia de uma peça pronta usam a mesma régua.
 *
 * ── E o que ela não confere ─────────────────────────────────────────────
 * O requisito 4 pede três peças reais, e na vida elas saem do mural da
 * igreja; aqui são do próprio clube, pelo motivo escrito em `arteDoClube.ts`.
 * O requisito 7 — apresentar ao examinador — acontece fora do aplicativo.
 *
 * ── O quadro de resultado fica desligado ────────────────────────────────
 * Os exemplos daqui são peças descritas e medidas de contraste, e não há o que
 * executar. Os números que a teoria cita saem do mesmo motor que mede a peça,
 * e `exemplosDosFundamentos.test.ts` os confere.
 */

const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], exemplo: string, atencao: string, marcas: string[],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, exemplo, exemploComo: 'texto' as const, atencao, marcas,
});

/* ── Módulo 1: hierarquia ─────────────────────────────────────────────────── */

const HIERARQUIA: TopicoDeVereda[] = [
  t(
    'por-onde-o-olho-comeca',
    'Por onde o olho começa',
    'Hierarquia visual é a ordem em que a peça é lida.',
    [
      'Quem passa pelo mural da igreja olha o cartaz por um segundo. Nesse segundo o olho escolhe por onde começar, e escolhe pelo que é **maior**, mais **escuro** ou mais **destacado**. Hierarquia visual é decidir de propósito essa ordem: primeiro o título, depois a data, depois o resto.',
      'Um cartaz digitado como se digita uma mensagem — tudo no mesmo tamanho, no mesmo peso — tem toda a informação certa e nenhuma ordem. O olho não sabe por onde começar e vai embora antes de achar a data.',
      'A pergunta que organiza a hierarquia é: se a pessoa só ler uma coisa, o que precisa ser? Se ler duas, qual é a segunda? O que responde a primeira pergunta é o título; o que responde a segunda é o segundo degrau.',
    ],
    `O cartaz do acampamento, em três degraus

  1º  Acampamento de Inverno         grande, negrito
  2º  12 a 14 de julho               médio, negrito
  3º  Chácara Recanto Verde...       texto comum
      Três dias de trilha...         texto comum
  ↓   Clube Pioneiros de Sobradinho  menor que o comum`,
    'Hierarquia não é deixar tudo grande. Se tudo grita, nada se destaca.',
    ['hierarquia visual', 'ordem de leitura'],
  ),
  t(
    'tamanho-peso-e-posicao',
    'Tamanho, peso e lugar',
    'Três ferramentas para criar degraus, e um teto para não fazer barulho.',
    [
      'O jeito mais forte de criar um degrau é o **tamanho**. Um título de 40 pixels sobre um texto de 18 é mais que o dobro, e o olho vai nele sem pensar. O **peso** — o negrito — sobe um degrau sem mudar o tamanho. E o **lugar** conta: o que está em cima, à esquerda, é lido antes no nosso jeito de ler.',
      'O título precisa ser o maior **sozinho**. Um cartaz com título e data no mesmo tamanho tem dois títulos, e dois títulos é o mesmo que nenhum: o olho fica dividido.',
      'E há um teto. Três ou quatro tamanhos o olho ordena; seis tamanhos parecidos não fazem seis degraus, fazem barulho. O nome do clube, que é assinatura, pode ficar **abaixo** do texto comum — ele é o último degrau.',
    ],
    `Degraus que funcionam      Degraus que não funcionam

  Título     40 negrito       Título     22
  Data       24 negrito       Data       22
  Texto      18               Local      20
  Clube      14               Texto      19
                              Clube      18`,
    'Diferença de um ou dois pixels não é degrau: o olho não separa 18 de 19.',
    ['tamanho', 'peso', 'título sozinho'],
  ),
];

/* ── Módulo 2: alinhamento e proximidade ─────────────────────────────────── */

const ALINHAMENTO: TopicoDeVereda[] = [
  t(
    'nada-por-acaso',
    'Nada posto por acaso',
    'Alinhamento é cada elemento apoiado numa linha que outro também usa.',
    [
      'Alinhar é fazer cada coisa da página se apoiar numa linha invisível: a borda esquerda de uma coluna, o centro da folha, a borda de uma foto. Quando oito linhas de texto começam no mesmo ponto, o olho enxerga uma coluna e lê de cima a baixo sem tropeçar.',
      'O erro de alinhamento quase nunca é grande. É uma linha que começa sete pixels mais para dentro que as outras. Ninguém mede, mas todo mundo percebe que tem alguma coisa torta, mesmo sem saber dizer o quê.',
      'Centralizar também é alinhar — desde que seja no **mesmo** centro. Seis linhas centradas cada uma num ponto diferente, nenhum deles o meio da folha, é o defeito mais comum dos convites feitos às pressas.',
    ],
    `Torto                          Alinhado

   Sábado, 9 de agosto          Sábado, 9 de agosto
 Às 16h, depois da reunião      Às 16h, depois da reunião
      No salão da igreja        No salão da igreja`,
    'No editor, selecione tudo e use Alinhar à esquerda: ele põe todos na borda do que estava mais à esquerda.',
    ['alinhamento', 'borda comum'],
  ),
  t(
    'perto-quer-dizer-junto',
    'Perto quer dizer junto',
    'Proximidade é agrupar pelo espaço: o que vai junto fica perto.',
    [
      'O olho lê como grupo o que está perto. Num aviso, dia, hora e lugar formam uma coisa só — o **quando** —, e o que levar forma outra. Se o espaço entre todas as linhas for igual, o aviso vira uma lista de oito coisas soltas, e o pai que lê correndo não separa uma da outra.',
      'A regra prática: o vão **entre** dois grupos precisa ser bem maior que o vão **dentro** de cada um — pelo menos o dobro. Um vão de 14 contra um de 12 a régua mede e o olho não vê.',
      'Proximidade é a forma mais barata de organizar: não precisa de caixa, de linha nem de cor. Só de espaço.',
    ],
    `Vão igual em tudo             Vão que agrupa

  Sábado, 9 de agosto           Sábado, 9 de agosto
                                Às 16h
  Às 16h                        No salão da igreja

  No salão da igreja
                                Traga:
  Traga:                        A ficha de saúde
                                A autorização assinada
  A ficha de saúde`,
    'Antes de desenhar uma caixa em volta de um grupo, tente só aproximar o que é dele. Quase sempre basta.',
    ['proximidade', 'grupo'],
  ),
];

/* ── Módulo 3: repetição e espaço negativo ───────────────────────────────── */

const REPETICAO: TopicoDeVereda[] = [
  t(
    'repetir-e-dizer-que-e-igual',
    'Repetir é dizer que é igual',
    'Repetição é usar o mesmo estilo para as coisas que são do mesmo tipo.',
    [
      'Quando três cartões de uma programação têm a mesma largura, a mesma cor e o mesmo estilo no nome da atividade, o olho entende sem ninguém explicar: são três itens da mesma série. Se cada um foi feito de um jeito, parecem três avisos diferentes.',
      'Repetição vale para tudo o que tem papel igual: todos os títulos de seção com o mesmo estilo, todos os horários com outro, todas as fotos com o mesmo tamanho. É ela que dá cara de coisa pensada a uma peça.',
      'No editor, quem faz isso é **Copiar estilo** e **Colar estilo**: você acerta um, copia, e cola nos outros. Fazer um por um à mão é como se acaba com um 16 e um 17 que ninguém percebe.',
    ],
    `Três cartões, sem repetição

  Especialidade de Nós   Arial 16, negrito, verde-escuro
  Ordem unida            Georgia 18, marrom
  Almoço e descanso      Verdana 15, negrito, azul

Os mesmos três, repetindo

  Especialidade de Nós   Arial 16, negrito
  Ordem unida            Arial 16, negrito
  Almoço e descanso      Arial 16, negrito`,
    'Repetir não é deixar tudo igual. É deixar igual o que tem o mesmo papel.',
    ['repetição', 'copiar estilo'],
  ),
  t(
    'o-vazio-trabalha',
    'O vazio também trabalha',
    'Espaço negativo é o espaço sem nada, e é ele que deixa o resto respirar.',
    [
      'Espaço negativo é o vazio entre as coisas: a margem em volta da folha, o vão entre os cartões, o respiro entre o texto e a borda do cartão. Ele não está ali por falta de conteúdo — está trabalhando, separando uma coisa da outra e dando descanso ao olho.',
      'O primeiro lugar em que ele falta é a borda. Título encostado na beirada da folha parece cortado, e na impressão às vezes **é** cortado: a guilhotina da gráfica não acerta o milímetro. Uma margem de pelo menos 5% da largura resolve.',
      'O segundo é entre vizinhos. Cartões encostados viram um bloco só; texto colado na borda do próprio cartão parece que vai cair para fora.',
    ],
    `Margem pedida pela CC-DG001: 5% da largura

  Folha de 480 pixels   →  margem de 24 pixels
  Folha A4 (21 cm)      →  pouco mais de 1 cm

  Entre cartões        ≥ 16 pixels
  Texto até a borda    ≥ 8 pixels`,
    'Se não cabe com margem, não é a margem que sobra: é conteúdo demais para a peça.',
    ['espaço negativo', 'margem'],
  ),
];

/* ── Módulo 4: cor ────────────────────────────────────────────────────────── */

const COR: TopicoDeVereda[] = [
  t(
    'matiz-saturacao-luminosidade',
    'Matiz, saturação e luminosidade',
    'Três números que descrevem uma cor do jeito que a gente fala dela.',
    [
      '**Matiz** é o que a gente chama de "a cor": vermelho, laranja, verde, azul. No editor ele é um número de 0 a 360, porque as cores formam um círculo — 0 é vermelho, 120 é verde, 240 é azul, e 360 volta ao vermelho.',
      '**Saturação** é o quanto a cor é viva. Com saturação alta o vermelho grita; com saturação baixa ele vai ficando acinzentado, até virar cinza puro no zero. **Luminosidade** é o quanto ela é clara: no zero tudo é preto, no cem tudo é branco.',
      'Pensar assim ajuda a montar uma paleta: o mesmo matiz com saturação menor é o "mesmo vermelho, só que sem gritar" — que é exatamente a cor de apoio de uma cor de destaque.',
    ],
    `O vermelho do clube, e o apoio dele

               Matiz   Saturação   Luminosidade
  Destaque      11°       80%          42%
  Apoio         11°       49%          62%
  Neutro       144°        2%          56%`,
    'Cinza é cor sem saturação. Um "neutro" com saturação alta não é neutro: ele disputa com o destaque.',
    ['matiz', 'saturação', 'luminosidade'],
  ),
  t(
    'luz-e-tinta',
    'Luz na tela, tinta no papel',
    'RGB acende luz, CMYK mistura tinta, e por isso a cor muda ao imprimir.',
    [
      'A tela **acende** luz em três cores — vermelho, verde e azul, o **RGB**. Somando as três no máximo, sai branco. O papel não acende nada: ele **reflete** a luz do ambiente, e a tinta tira dessa luz o que não quer. As tintas da gráfica são quatro — ciano, magenta, amarelo e preto, o **CMYK**.',
      'Por isso a cor da tela é diferente da cor impressa. Há cores que só a luz consegue fazer: o verde-limão, o azul elétrico, o laranja que brilha. Nenhuma mistura de tinta chega lá, e no papel elas saem mais apagadas. Os programas chamam isso de cor **fora da gama** de impressão.',
      'A **prova de impressão** do editor mostra na tela como a cor deve sair no papel. Não é exata — cada papel e cada máquina mudam um pouco —, mas mostra qual cor vai mudar. Peça que vai para o papel se confere na prova antes.',
    ],
    `A mesma cor, contada de dois jeitos

  Vermelho puro     RGB 255, 0, 0      CMYK 0, 100, 100, 0
  Verde-limão       RGB 57, 255, 20    fora da gama: no papel, mais apagado
  Vermelho do clube RGB 193, 53, 22    CMYK 0, 73, 89, 24`,
    'A cor que mais brilha na tela é a que mais muda no papel.',
    ['RGB', 'CMYK', 'prova de impressão'],
  ),
  t(
    'uma-paleta-de-cinco',
    'Uma paleta de cinco cores',
    'Cada cor da paleta tem um papel, e a justificativa diz qual.',
    [
      'Uma paleta não é uma lista de cores bonitas: é uma lista de **papéis**. Fundo, texto, destaque, apoio e neutro. Cada cor existe porque faz alguma coisa na peça, e quem escolhe precisa saber dizer o quê.',
      'Algumas regras saem dos papéis. O texto precisa se ler sobre o fundo. O destaque precisa ser diferente do resto — senão não destaca. O apoio é parente do destaque, mais calmo. E o neutro é quase cinza, para tudo o que é secundário.',
      'A justificativa de cada cor é uma frase com o papel dela. "Porque é bonita" não justifica; "o vermelho do clube, para a data e o que precisa ser visto primeiro" justifica.',
    ],
    `A paleta do cartaz

  Fundo      #FFFFFF   o papel do mural já é branco
  Texto      #1F2A24   verde quase preto, 14,84:1 sobre o branco
  Destaque   #C13516   o vermelho do clube, para a data
  Apoio      #CE806E   o mesmo vermelho, apagado, para faixas
  Neutro     #8C918E   cinza para linhas e rodapé`,
    'Antes de escolher a cor, escreva o papel. A cor certa aparece mais rápido.',
    ['paleta', 'papel da cor'],
  ),
];

/* ── Módulo 5: tipografia ─────────────────────────────────────────────────── */

const TIPOGRAFIA: TopicoDeVereda[] = [
  t(
    'familia-e-peso',
    'Família e peso',
    'A família é o desenho das letras; o peso é a espessura do mesmo desenho.',
    [
      'Uma **família** tipográfica é um desenho de letras: Arial é uma, Georgia é outra, Courier é outra. O **peso** é a espessura do traço dentro da mesma família — normal, negrito, às vezes fino ou extra-negrito.',
      'A diferença importa na hora de criar degraus. Para separar o subtítulo do texto, muitas vezes basta o **peso**: o mesmo desenho, em negrito. Trocar de família para isso enche a peça de desenhos diferentes sem necessidade.',
      'Uma peça bem resolvida quase nunca passa de duas famílias. Os degraus que faltam saem do tamanho e do peso.',
    ],
    `Mesma família, pesos diferentes

  Arial normal     O primeiro passo do desbravador
  Arial negrito    O primeiro passo do desbravador

Famílias diferentes

  Georgia          O primeiro passo do desbravador
  Courier New      O primeiro passo do desbravador`,
    'Negrito não é outra família. Na lista do editor, ele fica no campo Peso, e não em Família.',
    ['família', 'peso'],
  ),
  t(
    'corpo-e-entrelinha',
    'Corpo e entrelinha',
    'O tamanho da letra e o espaço entre as linhas decidem se o texto se lê.',
    [
      '**Corpo** é o tamanho da letra. Para texto corrido numa peça que se lê de perto, algo entre 14 e 16 pixels é confortável; título pode ser duas ou três vezes maior.',
      '**Entrelinha** é a distância de uma linha à próxima. Ela costuma vir escrita em relação ao corpo: 1,4 quer dizer 140% do corpo. Com 100%, as linhas quase se tocam e o olho se perde ao voltar para o começo da linha seguinte. Com 200%, cada linha parece solta das outras.',
      'Para texto corrido, entre 130% e 170% funciona. Título curto, de uma ou duas linhas, pode ter entrelinha menor, porque não há volta de linha para errar.',
    ],
    `Texto corrido

  Corpo 11, entrelinha 100%   apertado, as linhas se tocam
  Corpo 15, entrelinha 150%   confortável
  Corpo 15, entrelinha 200%   cada linha solta das outras`,
    'Quando o corpo e a entrelinha crescem, o parágrafo fica mais alto. Confira se ele não encavalou no de baixo.',
    ['corpo', 'entrelinha'],
  ),
  t(
    'tres-familias-e-um-par',
    'Serifada, sem serifa, monoespaçada — e um par',
    'As três grandes classificações, e como duas famílias funcionam juntas.',
    [
      '**Serifada** tem os pezinhos na ponta dos traços, como Georgia e Times. **Sem serifa** não tem, como Arial e Verdana. **Monoespaçada** dá a mesma largura a toda letra — o "i" ocupa o espaço do "m" —, como Courier; é a letra do código e das tabelas, onde a coluna alinhada é o ponto, e cansa num parágrafo inteiro.',
      'Duas famílias funcionam juntas quando são **diferentes o bastante** para a diferença parecer de propósito: uma serifada no título e uma sem serifa no texto é o par mais usado. Duas sem serifa parecidas, como Arial e Verdana, são o contrário: parecem um engano, porque o olho percebe que há duas e não entende por quê.',
      'E a família do texto corrido precisa ser de leitura — serifada ou sem serifa. As decorativas, como a cursiva do convite, ficam para uma palavra ou duas, nunca para um parágrafo.',
    ],
    `Pares

  Georgia (título) + Arial (texto)      contraste: funciona
  Arial (título) + Verdana (texto)      conflito: parece engano
  Brush Script (texto corrido)          não se lê num parágrafo
  Courier New (texto corrido)           cansa: letras de largura fixa`,
    'Explicar o par é dizer o que cada uma faz e o que as torna diferentes. "Ficaram bonitas" não explica.',
    ['serifada', 'sem serifa', 'monoespaçada', 'par tipográfico'],
  ),
];

/* ── Módulo 6: contraste e análise ───────────────────────────────────────── */

const ANALISE: TopicoDeVereda[] = [
  t(
    'diferente-de-verdade',
    'Contraste: diferente de verdade',
    'Contraste é a diferença entre duas coisas, grande o bastante para se ver.',
    [
      '**Contraste** é diferença. Entre o título e o texto (tamanho), entre o negrito e o normal (peso), entre a letra e o fundo (claro e escuro). Diferença pequena não é contraste: é engano. O olho percebe que tem algo diferente e não entende se foi de propósito.',
      'O contraste mais importante de todos é o da letra com o fundo, porque sem ele nada mais funciona: um título enorme, em amarelo-claro sobre branco, não se lê. Esse contraste se mede com uma razão — a do texto preto sobre o branco é 21:1, a maior que existe.',
      'Por isso "contraste" aparece duas vezes nesta vereda: como princípio de composição, aqui, e como medida da letra sobre o fundo, no módulo 8. São a mesma ideia: diferença que se vê.',
    ],
    `Contraste que se vê, e que não se vê

  Título amarelo-claro #E8C547 sobre branco    1,68:1  some
  Hora cinza #999999 sobre branco              2,85:1  fraco
  Texto #333333 sobre branco                  12,63:1  firme
  Preto sobre branco                          21:1     o máximo`,
    'Se você precisa apertar os olhos para ler na própria tela, quem vê de longe não vai ler.',
    ['contraste', 'diferença'],
  ),
  t(
    'analisar-uma-peca',
    'Analisar uma peça',
    'Olhar cada princípio, dizer se funciona ou falha, e apontar onde.',
    [
      'Analisar uma peça é olhar princípio por princípio e responder três coisas: funciona ou falha? **Onde** isso se vê? E por quê? Apontar o lugar é o que separa análise de opinião: "o título some na foto" se mostra com o dedo.',
      'Peças **bem resolvidas** acertam em tudo. Peças **mal resolvidas** erram em quase tudo, e costumam errar junto: quem não pensou na hierarquia também não pensou no alinhamento. A peça mais interessante é a **discutível**: acerta em quase tudo e erra num lugar só — e é aprovada por quem olha de relance.',
      'Quando falha, aponte o elemento que falha, e não qualquer um. Dizer que o contraste falha apontando o rodapé, quando o que não se lê é o título, acerta a conclusão e erra o lugar.',
    ],
    `Roteiro de análise

  Hierarquia    O título é o maior, sozinho? Quantos degraus?
  Contraste     Toda letra se lê sobre o que está atrás dela?
  Alinhamento   Cada linha se apoia numa borda que outra usa?

Para cada um: funciona ou falha, onde, e por quê.`,
    'Peça discutível engana justamente por estar quase certa. Procure o único lugar que não se lê.',
    ['análise', 'bem e mal resolvida'],
  ),
];

/* ── Módulo 7: refazer ────────────────────────────────────────────────────── */

const REFAZER: TopicoDeVereda[] = [
  t(
    'refazer-sem-perder',
    'Refazer sem perder a de antes',
    'Guardar a versão anterior, manter o texto, e aplicar os princípios em ordem.',
    [
      'O requisito pede a peça anterior **e** a nova. O jeito de garantir isso no editor é **duplicar a prancha** antes de mexer: uma fica como chegou, a outra é refeita. Mexer na única que existe e depois tentar lembrar como era não funciona.',
      'Refazer não é reescrever. O convite precisa continuar dizendo as mesmas coisas — data, hora, lugar, quem convida. Apagar uma linha "porque atrapalhava" deixa a peça bonita e sem a informação que ela existia para dar.',
      'Uma ordem que ajuda: primeiro a **hierarquia** (o que é título, o que é segundo degrau), depois o **alinhamento** (uma borda só), depois o **contraste** (toda cor que se lê) e por fim o **espaço** (margem e vãos). Cada passo facilita o seguinte.',
    ],
    `O convite do batismo, antes e depois

  Antes                              Depois
  título cursivo amarelo, 24         título Georgia negrito, 40
  data e título no mesmo tamanho     data 22 negrito, o resto 18
  seis centros diferentes            todos na borda esquerda
  hora em cinza 2,85:1               hora em #333333
  nome do clube colado no topo       nome do clube no pé, 14`,
    'Duplique antes do primeiro clique. A versão anterior é parte da entrega.',
    ['versão anterior', 'refazer'],
  ),
];

/* ── Módulo 8: medir, e a cor que não carrega sozinha ────────────────────── */

const MEDIR: TopicoDeVereda[] = [
  t(
    'medir-e-nao-achar',
    'Medir, e não achar',
    'O contraste entre letra e fundo é um número, e há um mínimo para ele.',
    [
      'O contraste da letra com o fundo se mede com uma **razão**, de 1:1 (letra da cor do fundo, invisível) a 21:1 (preto sobre branco). As diretrizes de acessibilidade da web pedem pelo menos **4,5:1** para texto comum e **3:1** para texto grande — 24 pixels, ou 18,66 em negrito —, porque letra grande se lê com menos.',
      'O **medidor de contraste** do editor faz a conta: você clica num texto e ele diz a razão entre a cor da letra e a cor que está atrás dela. "Acho que está bom" não é medir. O cinza #767676 sobre branco mede 4,54:1 — passa raspando —, e o #808080, que parece quase igual, mede 3,95:1 e não passa para texto comum.',
      'Sobre foto, o fundo não é uma cor só: é tudo o que a foto tem por baixo da letra. Vale o pior trecho. O título branco do campori mede 16,69:1 contra a parte escura da fogueira e 1,63:1 contra a parte clara — e é na parte clara que ele some.',
    ],
    `Medidas sobre o branco

  #1F2A24   14,84:1   passa folgado
  #555555    7,46:1   passa
  #767676    4,54:1   passa raspando
  #808080    3,95:1   só para texto grande
  #999999    2,85:1   não passa`,
    'Meça a peça inteira, texto por texto. É o texto que você esqueceu de medir que não se lê.',
    ['razão de contraste', '4,5:1', 'medidor'],
  ),
  t(
    'a-cor-nao-carrega-sozinha',
    'A cor não carrega sozinha',
    'Informação essencial precisa de um segundo sinal além da cor.',
    [
      'Cerca de uma em cada doze pessoas com cromossomo XY tem algum tipo de daltonismo, e o mais comum confunde **vermelho e verde**. Numa escala em que só a cor do ponto diz quem confirmou e quem cancelou, essas pessoas não conseguem ler a informação mais importante da peça.',
      'E não são só elas. A escala impressa em preto e branco, a cópia tirada na secretaria, o celular com o brilho no mínimo: em todos esses casos a cor some e a informação vai junto. O verde e o vermelho da escala, que parecem tão diferentes, medem só 1,17:1 entre si — a diferença é só de matiz.',
      'A solução não é tirar a cor: é dar um **segundo sinal**. Uma palavra ("confirmado"), um símbolo diferente, um padrão. A cor continua ajudando quem a vê, e a informação chega a todo mundo. O editor tem uma simulação de visão que mostra a peça como quem tem deuteranopia vê — use antes de entregar.',
    ],
    `Só a cor              Cor e palavra

  ● Ana Clara           ● Ana Clara — confirmado
  ● Davi                ● Davi — cancelado
  ● Lucas               ● Lucas — pendente`,
    'Se a informação some quando você imprime a peça em preto e branco, ela estava só na cor.',
    ['daltonismo', 'segundo sinal'],
  ),
  t(
    'apresentar-ao-examinador',
    'Apresentar ao examinador',
    'O que levar, e o que dizer de cada peça.',
    [
      'O requisito 7 pede apresentar as análises e as peças. Leve as três peças analisadas com o que você escreveu de cada uma, a paleta com a justificativa das cinco cores, o par de famílias com a explicação, o convite **antes e depois** lado a lado e a medida de contraste da sua peça.',
      'Na apresentação, aponte na peça. "O título some aqui, na parte clara da foto" convence mais do que qualquer adjetivo. E diga o que você mudou e por quê — cada mudança do convite responde a um princípio.',
      'Se o examinador perguntar de uma escolha que você não sabe justificar, diga isso. Saber que uma escolha foi no gosto é parte de aprender a fazer as próximas no princípio.',
    ],
    `O que levar

  As três peças, com a análise de cada uma
  A paleta de cinco cores, com o porquê de cada cor
  O par de famílias, com a explicação
  O convite antes e depois, lado a lado
  A medida de contraste da sua peça`,
    'Imprima as peças. Na tela as cores mudam de aparelho para aparelho; no papel o examinador vê o que você vê.',
    ['apresentação', 'antes e depois'],
  ),
];

/* ── Os módulos ───────────────────────────────────────────────────────────── */

export const MODULOS_DOS_FUNDAMENTOS: ModuloDeVereda[] = [
  {
    id: 'm1', titulo: 'Por onde o olho começa',
    resumo: 'Hierarquia: o título sozinho no topo da ordem.',
    licoes: [
      {
        id: 'm1-teoria', tipo: 'teoria', questoes: Q['m1-teoria'], perguntas: 4,
        titulo: 'Hierarquia visual', resumo: 'Ordem de leitura, degraus e o teto de níveis.',
        topicos: HIERARQUIA,
      },
      {
        id: 'm1-lab', tipo: 'design', licao: 'hierarquia',
        titulo: 'Dando degraus ao cartaz do acampamento',
        resumo: 'Seis blocos no mesmo tamanho, e três degraus a criar.',
        verificacoes: ['titulo-se-destaca', 'data-no-segundo-degrau', 'clube-por-ultimo'],
      },
    ],
  },
  {
    id: 'm2', titulo: 'Uma borda e um grupo',
    resumo: 'Alinhamento e proximidade: nada por acaso, e o que vai junto perto.',
    licoes: [
      {
        id: 'm2-teoria', tipo: 'teoria', questoes: Q['m2-teoria'], perguntas: 4,
        titulo: 'Alinhamento e proximidade', resumo: 'A linha invisível e o espaço que agrupa.',
        topicos: ALINHAMENTO,
      },
      {
        id: 'm2-lab', tipo: 'design', licao: 'alinhamento',
        titulo: 'Arrumando o aviso da reunião de pais',
        resumo: 'Oito linhas em oito lugares, e o mesmo vão entre todas.',
        verificacoes: ['uma-borda-so', 'grupos-separados'],
      },
    ],
  },
  {
    id: 'm3', titulo: 'O que se repete e o que respira',
    resumo: 'Repetição e espaço negativo.',
    licoes: [
      {
        id: 'm3-teoria', tipo: 'teoria', questoes: Q['m3-teoria'], perguntas: 4,
        titulo: 'Repetição e espaço negativo', resumo: 'Estilo igual para papel igual, e o vazio que separa.',
        topicos: REPETICAO,
      },
      {
        id: 'm3-lab', tipo: 'design', licao: 'repeticao',
        titulo: 'Igualando os cartões da programação',
        resumo: 'Três cartões feitos em três dias, e nenhum respiro.',
        verificacoes: ['cartoes-iguais', 'textos-dos-cartoes-iguais', 'respiro-na-borda', 'respiro-entre-cartoes'],
      },
    ],
  },
  {
    id: 'm4', titulo: 'Luz, tinta e uma paleta',
    resumo: 'Cor: matiz, saturação, luminosidade, RGB e CMYK.',
    licoes: [
      {
        id: 'm4-teoria', tipo: 'teoria', questoes: Q['m4-teoria'], perguntas: 4,
        titulo: 'Cor na tela e no papel', resumo: 'Os três números da cor, as duas formas de fazê-la e os cinco papéis.',
        topicos: COR,
      },
      {
        id: 'm4-lab', tipo: 'design', licao: 'cor',
        titulo: 'Compondo a paleta do cartaz',
        resumo: 'Cinco cores, cada uma com um papel e um porquê.',
        verificacoes: ['texto-sobre-fundo', 'apoio-do-destaque', 'neutro-neutro', 'imprime-como-aparece', 'cada-cor-justificada'],
      },
    ],
  },
  {
    id: 'm5', titulo: 'Letras que se leem',
    resumo: 'Tipografia: família, peso, corpo, entrelinha e o par.',
    licoes: [
      {
        id: 'm5-teoria', tipo: 'teoria', questoes: Q['m5-teoria'], perguntas: 4,
        titulo: 'Tipografia', resumo: 'O desenho, a espessura, o tamanho e o espaço entre linhas.',
        topicos: TIPOGRAFIA,
      },
      {
        id: 'm5-lab', tipo: 'design', licao: 'tipografia',
        titulo: 'Escolhendo as letras do folheto de Amigo',
        resumo: 'Duas sem serifa que brigam, e um texto apertado.',
        verificacoes: ['duas-familias-que-contrastam', 'corpo-de-leitura', 'subtitulo-pelo-peso', 'par-explicado'],
      },
    ],
  },
  {
    id: 'm6', titulo: 'Três peças, três vereditos',
    resumo: 'Contraste como princípio, e a análise escrita.',
    licoes: [
      {
        id: 'm6-teoria', tipo: 'teoria', questoes: Q['m6-teoria'], perguntas: 4,
        titulo: 'Contraste e análise', resumo: 'Diferença que se vê, e como apontar onde a peça acerta e erra.',
        topicos: ANALISE,
      },
      {
        id: 'm6-lab', tipo: 'design', licao: 'analise',
        titulo: 'Analisando a gincana, o batismo e o campori',
        resumo: 'Uma bem resolvida, uma mal resolvida, e uma que engana.',
        verificacoes: ['classificou-as-tres', 'analise-de-hierarquia', 'analise-de-contraste', 'analise-de-alinhamento'],
      },
    ],
  },
  {
    id: 'm7', titulo: 'A mesma peça, refeita',
    resumo: 'Antes e depois, sem perder uma linha.',
    licoes: [
      {
        id: 'm7-teoria', tipo: 'teoria', questoes: Q['m7-teoria'], perguntas: 4,
        titulo: 'Refazer uma peça mal resolvida', resumo: 'Duplicar, manter o texto e seguir a ordem dos princípios.',
        topicos: REFAZER,
      },
      {
        id: 'm7-lab', tipo: 'design', licao: 'refazer',
        titulo: 'Refazendo o convite do batismo',
        resumo: 'A versão de antes guardada, e uma nova que se lê.',
        verificacoes: ['versao-anterior-guardada', 'hierarquia-refeita', 'contraste-refeito', 'alinhamento-refeito', 'respiro-refeito'],
      },
    ],
  },
  {
    id: 'm8', titulo: 'Medido, e não achado',
    resumo: 'A razão de contraste, e a cor que não pode carregar sozinha.',
    licoes: [
      {
        id: 'm8-teoria', tipo: 'teoria', questoes: Q['m8-teoria'], perguntas: 4,
        titulo: 'Medir o contraste e dar um segundo sinal', resumo: 'O mínimo de 4,5:1, o pior trecho da foto e o daltonismo.',
        topicos: MEDIR,
      },
      {
        id: 'm8-lab', tipo: 'design', licao: 'contraste',
        titulo: 'Medindo o convite e consertando a escala da cantina',
        resumo: 'O medidor texto por texto, e a situação escrita além da cor.',
        verificacoes: ['mediu-a-sua-peca', 'viu-a-escala-sem-cor', 'situacao-tambem-por-palavra', 'cor-sozinha-explicada'],
      },
    ],
  },
];
