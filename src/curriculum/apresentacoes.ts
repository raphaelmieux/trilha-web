import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DAS_APRESENTACOES } from './questoesDasApresentacoes';

/*
 * A vereda CC-ES011 Apresentações.
 *
 * ── O que ela é ─────────────────────────────────────────────────────────
 * Não é a vereda de aprender o PowerPoint: é a de aprender que quase tudo o
 * que dá errado numa apresentação dá errado **em quem assiste**, e não na
 * tela de quem monta. O slide com a fala escrita funciona perfeitamente; o
 * ouro do clube a 2,42:1 fica bonito no computador; a foto de 320 pixels
 * esticada tem a nitidez do monitor e não a do telão; o slide que repete a
 * ordem dos pensamentos de quem escreveu não tem hierarquia nenhuma. Nada
 * disso estoura.
 *
 * ── Por que ela exige a CC-ES002 ────────────────────────────────────────
 * Está no requisito 1, e o motivo é o requisito 4.1: o **slide mestre** é o
 * estilo visto de outro ângulo, e a formatação direta vence os dois do mesmo
 * jeito. Quem já trocou formatação direta por estilo num documento reconhece
 * o problema na primeira tentativa de mexer no mestre e nada mudar.
 *
 * ── E o que ela não confere ─────────────────────────────────────────────
 * O requisito 6 pede apresentar oralmente em cinco minutos. Isso acontece
 * fora do aplicativo, e a plataforma não confere nada da fala: o que ela faz
 * é **preparar** — conta as palavras que projetam, estima o tempo pelas notas
 * e escreve um roteiro em primeira pessoa, para a pessoa ensaiar com a
 * própria apresentação na frente. É o que a CC001, a CC002 e a CC-ES002 já
 * fazem com os requisitos de apresentar.
 *
 * ── O quadro de resultado fica desligado ────────────────────────────────
 * Os exemplos daqui são slides desenhados em texto e medidas de contraste, e
 * não há o que executar.
 */

const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], exemplo: string, atencao: string, marcas: string[],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, exemplo, exemploComo: 'texto' as const, atencao, marcas,
});

/* ── Módulo 1: o slide mestre ─────────────────────────────────────────────── */

const O_SLIDE_MESTRE: TopicoDeVereda[] = [
  t(
    'o-que-e-slide-mestre',
    'O slide mestre é a aparência de todos os slides, num lugar só',
    'Mexer nele muda os vinte de uma vez — e é por isso que ele existe.',
    [
      'Toda apresentação tem um **slide mestre**: uma folha que ninguém apresenta e que diz como o título, o corpo, o fundo e o que se repete em toda página vão aparecer. Os slides não guardam aparência própria; eles herdam a dele.',
      'É a mesma ideia do **estilo** de um documento, que a CC-ES002 ensinou. Lá, trocar o Título 1 muda os cinco títulos de uma vez; aqui, trocar a fonte do título no mestre muda os vinte slides. A diferença entre as duas é só o programa.',
      'Quem não usa o mestre formata slide por slide. Funciona, e o preço aparece depois: no dia em que o clube muda a cor, são vinte slides para corrigir — e o vigésimo vai ficar diferente dos outros dezenove, porque ninguém acerta vinte vezes seguidas.',
    ],
    `Onde a aparência mora

  SEM O MESTRE                       COM O MESTRE
    slide 1: título 34pt, negrito      mestre: título 40pt, Georgia, ouro
    slide 2: título 36pt, negrito      slide 1: herda
    slide 3: título 34pt, negrito      slide 2: herda
    slide 4: título 37pt, negrito      slide 3: herda
    ...                                ...

  Trocar a cor do clube:
    sem o mestre → vinte correções     com o mestre → uma`,
    'O mestre não se apresenta e não entra na contagem de slides. Ele abre em Exibir → Slide Mestre, e o aviso no alto da tela é o que diz que você não está num slide.',
    ['slide mestre', 'Exibir → Slide Mestre'],
  ),
  t(
    'a-direta-vence-o-mestre',
    'A formatação aplicada à mão vence o mestre',
    'E é por isso que mexer no mestre, às vezes, não muda nada na tela.',
    [
      'Quando alguém seleciona um título e aperta os botões da barra — negrito, tamanho, cor —, aquilo fica gravado **naquele slide**. É a *formatação direta*, e ela ganha do mestre ao desenhar.',
      'O efeito é desconcertante: você abre o mestre, troca a fonte do título, fecha, e a tela continua igual. Não há erro nenhum. O mestre mudou, e a formatação direta de cada slide continua lá por cima dele.',
      'O conserto é **Limpar Formatação**, que tira a direta e deixa o mestre passar. Ele não encosta no texto: as palavras ficam exatamente as mesmas. Apagar o slide e redigitá-lo também "resolve", e é como se perde um slide inteiro sem perceber.',
    ],
    `Mexi no mestre e nada mudou

  mestre:  título = Georgia 40pt, ouro escuro
  slide 2: título = Arial 36pt, negrito   ← formatação direta

  na tela:  Arial 36pt, negrito            ← a direta ganhou

  Página Inicial → Limpar Formatação

  na tela:  Georgia 40pt, ouro escuro      ← agora o mestre vale`,
    'Limpar Formatação limpa **a formatação**, e não o texto. Se o seu texto desapareceu, você apagou o conteúdo em vez de limpar o estilo dele.',
    ['formatação direta', 'Limpar Formatação'],
  ),
  t(
    'o-que-se-repete-vai-no-mestre',
    'O logo e o número do slide vão no mestre',
    'Um clique para os vinte, e o número é campo: ele conta a folha.',
    [
      'O que aparece em toda página — o logo do clube no canto, o número do slide no pé, a data — mora no mestre. Posto nele, aparece nos vinte; posto num slide, aparece naquele.',
      'O número do slide é um **campo**, e não um número digitado. Campo mostra em que folha ele está sendo desenhado; número digitado mostra o que alguém escreveu. É a mesma distinção do requisito 4.4 da CC-ES002, e ela erra do mesmo jeito: quem digita "3" fica com três em todas as folhas.',
      'E o logo no mestre não atrapalha ninguém no slide: ele não é um objeto que se arrasta sem querer, porque ele não está no slide — está na folha de baixo.',
    ],
    `Campo e número digitado

  CAMPO (mestre → Inserir → Número do Slide)
    folha 1 → 1     folha 2 → 2     folha 3 → 3

  DIGITADO (alguém escreveu "3" no rodapé do mestre)
    folha 1 → 3     folha 2 → 3     folha 3 → 3

  Na tela do slide 3 os dois são idênticos.`,
    'O slide de abertura normalmente **não** leva número: a convenção de todo impresso é não numerar a capa. No PowerPoint isso é uma caixa chamada "Não mostrar no slide de título".',
    ['campo', 'número do slide'],
  ),
];

/* ── Módulo 2: layout ─────────────────────────────────────────────────────── */

const O_LAYOUT: TopicoDeVereda[] = [
  t(
    'o-que-e-layout',
    'Layout é onde as caixas de um slide ficam',
    'E é uma escolha de lista, não um desenho à mão.',
    [
      '**Layout** é o arranjo dos espaços reservados de um slide: onde entra o título, onde entra o corpo, onde entra a imagem. O PowerPoint oferece uma lista — Slide de Título, Título e Conteúdo, Duas Partes, Somente Título, Em Branco —, e cada um deles tem posições **fixas**.',
      'Fixas é a palavra. O espaço reservado do título do "Título e Conteúdo" cai no mesmo lugar em todos os slides que usam esse layout. Uma caixa de texto desenhada à mão cai onde a mão soltou.',
      'Layout é do slide; mestre é da apresentação. O mestre diz **como** o título aparece (fonte, cor, tamanho); o layout diz **onde** ele aparece. Trocar o layout não troca a aparência, e trocar o mestre não troca a posição.',
    ],
    `Os cinco layouts

  Slide de Título        ┌──────────────┐   título centrado,
                         │   TÍTULO     │   subtítulo embaixo
                         │  subtítulo   │
                         └──────────────┘

  Título e Conteúdo      ┌──────────────┐   título em cima,
                         │ TÍTULO       │   lista embaixo
                         │ · item       │
                         └──────────────┘

  Em Branco              ┌──────────────┐   nada reservado —
                         │              │   é daqui que saem
                         └──────────────┘   as caixas à mão`,
    'Quem desenha caixa de texto parte do slide Em Branco, porque nele não há espaço reservado nenhum para o texto cair. É o layout mais honesto e o mais perigoso.',
    ['layout', 'espaço reservado'],
  ),
  t(
    'o-defeito-so-existe-na-sequencia',
    'O título desalinhado não se vê num slide: se vê passando',
    'Cada slide está perfeito. A apresentação pisca.',
    [
      'Quem posiciona caixas à mão acerta a posição de um slide e erra a do seguinte por alguns milímetros. Abra qualquer um deles: está bonito. Passe de um para o outro: o título **pula**.',
      'O olho de quem assiste acompanha o título pulando em vez de ler o slide novo. Ninguém na plateia sabe dizer o que está errado — a sensação é de uma apresentação "amadora", e a causa são três milímetros que ninguém mede.',
      'É por isso que este defeito sobrevive a toda revisão: quem revisa olha slide por slide, e slide por slide não há nada de errado. Só passando a apresentação ele aparece.',
    ],
    `Seis slides, seis alturas

  slide  altura do título
    1       9,0%
    4      11,5%     ← pulou 2,5
    5       7,5%     ← pulou 4,0
    9      10,0%
   10       8,0%
   11      12,0%     ← pulou 4,0

  Aplicado o layout: todos no espaço reservado, todos iguais.`,
    'Aplicar o layout **move** o texto para o espaço reservado e a caixa à mão deixa de existir. Se ela ficasse, o texto apareceria duas vezes — uma no espaço reservado e outra solta por cima.',
    ['espaço reservado'],
  ),
];

/* ── Módulo 3: hierarquia visual ──────────────────────────────────────────── */

const A_HIERARQUIA: TopicoDeVereda[] = [
  t(
    'o-que-e-hierarquia-visual',
    'Hierarquia visual é a ordem em que o olho lê',
    'Ela não é opcional: existe sempre. A escolha é se ela é a que você quis.',
    [
      '**Hierarquia visual** é a ordem em que as coisas de um slide são lidas. Quem a cria é o tamanho, o peso, a cor e a posição: o maior vem primeiro, o mais escuro vem antes do mais claro, o de cima antes do de baixo.',
      'Com título e corpo do mesmo tamanho, não há ordem nenhuma — o olho começa onde cair, e cada pessoa da sala começa num lugar diferente. O slide não está feio; ele está *sem instrução de leitura*.',
      'O título precisa ser visivelmente maior que o corpo, e não um pouco maior. Metade a mais já se lê de longe; dois pontos de diferença são invisíveis a cinco metros do telão.',
    ],
    `A mesma informação, duas hierarquias

  SEM                              COM
    O que levar          34pt        O QUE LEVAR          40pt
    Saco de dormir       32pt          Saco de dormir      24pt
    Lanterna             32pt          Lanterna            24pt

  No telão, a da esquerda é um bloco de texto; a da direita
  tem um título e uma lista.`,
    'Aumentar o corpo "para preencher o slide" é o jeito mais rápido de destruir a hierarquia — e é o que mais se faz quando sobra espaço. Espaço vazio num slide não é defeito.',
    ['hierarquia visual'],
  ),
  t(
    'topico-nao-e-frase',
    'Tópico não é frase: é a etiqueta do que você vai falar',
    'Vinte palavras com um ponto na frente são um parágrafo disfarçado.',
    [
      'O slide é apoio, e não roteiro. Um tópico de vinte palavras é a sua fala escrita — e quando ela está escrita, a plateia lê. Ler é mais rápido que ouvir: em três segundos todos terminaram, e você está no meio da primeira frase falando de algo que eles já sabem.',
      'A medida prática é caber numa linha: até oito palavras. O que sobrar da frase não se joga fora — vai para a **nota do apresentador**, que é onde a fala mora.',
      'E seis tópicos é o teto. Nove itens iguais não têm hierarquia: são uma lista, e lista projetada ninguém lê — procura-se o próprio nome nela e desiste-se do resto.',
    ],
    `A mesma informação, dois slides

  COMO CHEGA
    · O ônibus do clube sai do salão às dezenove horas de
      sexta-feira, e quem for de carro próprio precisa
      avisar a secretaria antes

  COMO FICA
    · Ônibus: sexta, dezenove horas       (4 palavras)
    · Carro próprio: avise a secretaria   (5 palavras)

  E na nota: "Lembrar que o portão fica depois da ponte, e
  que quem for de carro precisa avisar para ele ficar aberto."`,
    'Encurtar não é apagar. A data, o valor e o nome do lugar não podem sair do slide: são o que a família vai anotar, e o que ninguém guarda de ouvido.',
    ['nota do apresentador'],
  ),
];

/* ── Módulo 4: contraste ──────────────────────────────────────────────────── */

const O_CONTRASTE: TopicoDeVereda[] = [
  t(
    'o-que-e-contraste',
    'Contraste é a diferença de luz entre o texto e o fundo',
    'E ele se mede: é uma razão, de 1:1 a 21:1.',
    [
      '**Contraste** não é "cores diferentes": é a diferença de **luminosidade** entre a cor do texto e a do fundo. Ele se escreve como uma razão. Texto preto sobre branco dá 21:1, o máximo; texto cinza-claro sobre branco pode dar 1,5:1, que é texto invisível.',
      'A medida é a mesma que todo verificador de acessibilidade usa, e o PowerPoint tem o dele: Revisão → Verificar Acessibilidade. Ele escreve "Texto com contraste insuficiente" e diz onde.',
      'O corte usual é **4,5:1** para texto corrido e 3:1 para texto grande. Num telão, numa sala com luz, vale mirar o maior dos dois para tudo: a luz da sala lava a cor, e o que sobra de contraste é menos do que o monitor mostrou.',
    ],
    `As cores do clube, medidas sobre branco

  ouro do emblema   #C9A227    2,42:1    não se lê
  verde da camisa   #1B9E4B    3,48:1    passa como título grande,
                                         não passa como corpo
  ouro escurecido   #8A6D0B    4,91:1    passa
  verde escurecido  #0E5C2C    8,12:1    passa

  Preto sobre branco            21:1     passa — e joga a
                                         identidade do clube fora`,
    'O verde da camisa a 3,48:1 é o caso cruel: ele **passa** como título grande e reprova como corpo. Uma cor que funciona num lugar e não no outro é a que ninguém desconfia.',
    ['contraste', 'Verificar Acessibilidade'],
  ),
  t(
    'escurecer-nao-e-desistir',
    'Escurecer a cor do clube não é desistir dela',
    'E a coluna de tons do seletor existe exatamente para isso.',
    [
      'Quando a cor da identidade não se lê, há dois caminhos. Um é pintar tudo de preto: resolve a conta e joga fora a identidade. O outro é **escurecer a mesma cor** até ela passar — e ela continua sendo o ouro do clube, mais escuro.',
      'O seletor de cor do PowerPoint oferece, debaixo de cada cor do tema, uma coluna de tons mais claros e mais escuros. É de lá que sai o conserto: 25% mais escuro, 50% mais escuro.',
      'E a cor nunca é a única pista. Quem não distingue duas cores precisa de outra coisa que diga o mesmo — tamanho, peso, posição. É a mesma razão de a insígnia desta plataforma ter forma **e** cor.',
    ],
    `A coluna de tons

  Ouro do clube          #C9A227   2,42:1   ✗
    25% mais escuro      #A8871F   3,3:1    ✗
    50% mais escuro      #8A6D0B   4,91:1   ✓
  Preto, texto 1         #000000    21:1    ✓ e sem identidade

  O verde segue a mesma coluna.`,
    'Clarear a cor do **fundo** também resolve, e às vezes é o conserto certo: contraste é a relação entre as duas, e não uma propriedade do texto.',
    [],
  ),
];

/* ── Módulo 5: os três erros ──────────────────────────────────────────────── */

const OS_TRES_ERROS: TopicoDeVereda[] = [
  t(
    'o-efeito-sobre-quem-assiste',
    'Todo erro de apresentação se mede em quem assiste',
    'Não no arquivo, não no computador, não no gosto de quem monta.',
    [
      'O requisito pede três erros frequentes **e o efeito de cada um sobre quem assiste** — e a segunda metade é a que ninguém escreve. Quase todo conselho sobre apresentação diz o que não fazer e não diz o que acontece na sala.',
      'Isso importa porque o efeito é o que faz o conselho grudar. "Não ponha texto demais" se esquece; "a plateia lê e para de ouvir você" não.',
      'E separa os erros de verdade dos de gosto: a fonte não ser a da identidade não muda nada para quem assiste. A cor não se ler muda tudo para quem está no fundo.',
    ],
    `Os três, e o que cada um faz

  1. O slide traz a fala escrita
       → a plateia lê o slide e para de ouvir quem fala

  2. A cor foi escolhida pela identidade, não pela leitura
       → quem está no fundo da sala desiste e olha o celular

  3. Tudo tem o mesmo peso, inclusive o que decide
       → a plateia não sabe o que precisa anotar

  Nenhum dos três dá erro em lugar nenhum.`,
    'O que **não** é efeito sobre quem assiste: o arquivo demorar para abrir, o PowerPoint travar, a fonte não combinar. São problemas reais, de outra natureza.',
    [],
  ),
  t(
    'ver-como-a-sala-ve',
    'O jeito de achar os três é olhar como a sala olha',
    'De longe, projetado, com a luz acesa — e não a 40 cm do monitor.',
    [
      'Todo defeito desta vereda é invisível de onde se monta a apresentação. O monitor tem contraste alto, está a quarenta centímetros do olho, e mostra o slide inteiro com nitidez de sobra.',
      'O telão não. Ele está a cinco metros de quem senta atrás, a sala tem luz, e a imagem é esticada muitas vezes. O cinza-claro desaparece, o texto de corpo 18 não se lê, e a foto de 320 pixels fica serrilhada.',
      'Então o gesto que acha tudo é um só: **passar a apresentação** antes de apresentar, de longe, com a luz como ela vai estar. Quem faz isso acha os três erros sem precisar de lista nenhuma.',
    ],
    `A mesma tela, dois lugares

  NO MONITOR                   NO TELÃO, COM LUZ
    título ouro: legível         título ouro: quase não está lá
    corpo 18pt: confortável      corpo 18pt: ilegível do fundo
    foto esticada: boa           foto esticada: serrilhada

  Nada mudou no arquivo.`,
    'Se não houver telão para ensaiar, afaste-se três metros do monitor e olhe. O que você não conseguir ler dali, ninguém lê no fundo da sala.',
    [],
  ),
];

/* ── Módulo 6: a imagem ───────────────────────────────────────────────────── */

const A_IMAGEM: TopicoDeVereda[] = [
  t(
    'resolucao-e-para-a-projecao',
    'Resolução adequada é adequada **ao tamanho em que a imagem entra**',
    'A mesma foto serve num quarto do slide e não serve na tela inteira.',
    [
      'Uma imagem tem um número de pixels — 320 de largura, 4032 de largura. A projeção também: um telão de hoje mostra 1920 pixels de largura. Se a imagem ocupa 40% do slide, ela é desenhada com 768 desses pixels.',
      'Se o arquivo tem menos de 768 pixels de largura, ele é **esticado**: cada pixel dele cobre mais de um pixel do telão, e o resultado é serrilhado. Se tem muito mais, o excesso é jogado fora na hora de projetar — e continua pesando no arquivo.',
      'Então "resolução adequada" não é uma propriedade do arquivo: é a relação entre o que ele tem e o tamanho em que ele entra. Reduzir o espaço que a imagem ocupa resolve tanto quanto trocar por um arquivo maior.',
    ],
    `A conta, para um telão de 1920

  a imagem ocupa      a projeção pede
    100% do slide        1920 px
     40% do slide         768 px
     25% do slide         480 px

  logo-clube.png tem 320 px de largura
    a 46% do slide → a projeção pede 883 → esticado 2,8 vezes
    a  16% do slide → a projeção pede 307 → serve`,
    'No seu monitor a foto esticada fica boa, porque ele é menor que o telão e está mais perto do seu olho. É por isso que este defeito chega a tanta apresentação.',
    ['resolução'],
  ),
  t(
    'compactar-e-destrutivo',
    'Compactar imagens reduz de verdade, e não volta',
    'E os três valores que a caixa oferece custam coisas diferentes.',
    [
      'Três fotos de celular — doze megapixels cada — fazem uma apresentação de dez megabytes, que não passa por anexo de e-mail e demora para abrir no computador do clube. O comando que resolve é **Compactar Imagens**, e ele é destrutivo: os pixels que saem não voltam.',
      'A caixa oferece valores em **ppi**, pontos por polegada do slide. 96 ppi é o que ela chama de "e-mail": ele encolhe muito e deixa a foto abaixo do que o telão mostra. 150 ppi serve à projeção. 220 ppi é mais pixel do que o telão usa, e pesa mais.',
      'A ordem importa: compactar e depois trocar a foto por outra desfaz o trabalho, e trocar e depois compactar é uma passagem só. É a mesma aritmética da CC-ES004, onde comprimir antes de reconhecer custa o texto.',
    ],
    `Uma foto de 4032 px num slide, a 40% de largura

  ppi    largura resultante   serve à projeção (768 px)?
   96          512 px           não — serrilha
  150          800 px           sim
  220         1173 px           sim, com pixel de sobra

  O arquivo cai de 10,9 MB para 0,5 MB a 150 ppi.`,
    'Guarde os arquivos originais em outro lugar antes de compactar. O PowerPoint não tem como devolver o que foi jogado fora, e o Ctrl+Z só alcança enquanto o arquivo não foi fechado.',
    ['Compactar Imagens', 'ppi'],
  ),
];

/* ── Módulo 7: o gráfico ──────────────────────────────────────────────────── */

const O_GRAFICO: TopicoDeVereda[] = [
  t(
    'o-grafico-vem-da-planilha',
    'O gráfico vem da planilha, e nunca dos números digitados',
    'Número digitado está certo hoje e continua mostrando o de hoje amanhã.',
    [
      'Quando um slide precisa mostrar números que existem numa planilha, há dois caminhos. Um é digitá-los no slide; o outro é trazer o gráfico da planilha. Os dois ficam idênticos no dia em que se faz.',
      'A diferença aparece no dia em que a planilha muda. O número digitado continua o de antes, e **nada avisa** — o slide está certo, bem formatado, com um total plausível. É a mesma família do número guardado que não responde por hoje.',
      'A nossa apresentação chega assim: os custos foram digitados quando a alimentação custava 80 e a estrutura 40. A planilha mudou em julho; o slide, não.',
    ],
    `O slide e a planilha, hoje

  SLIDE (digitado em junho)      PLANILHA (hoje)
    Alimentação  R$ 80,00          Alimentação  R$ 90,00
    Transporte   R$ 60,00          Transporte   R$ 60,00
    Estrutura    R$ 40,00          Estrutura    R$ 45,00
    Material     R$ 25,00          Material     R$ 25,00
    Total       R$ 205,00          Total       R$ 220,00

  Quinze reais por desbravador, e o slide não dá erro nenhum.`,
    'Conferir um slide de números contra a planilha é trabalho que ninguém faz duas vezes. Por isso a saída não é conferir melhor: é não digitar.',
    [],
  ),
  t(
    'as-tres-colagens',
    'Colar um gráfico tem três caminhos, e eles se parecem',
    'Imagem congela; vinculado precisa da planilha; incorporado leva uma cópia.',
    [
      'Ao colar um gráfico da planilha, o PowerPoint oferece três opções de colagem. **Como imagem**: ele vira um desenho, com os números de agora, para sempre. **Vinculado aos dados**: ele lê a planilha de verdade, e precisa que ela viaje junto — sem ela, o quadro fica vazio no computador do clube.',
      '**Incorporado**: ele leva uma cópia da planilha dentro do arquivo da apresentação. É o único que acompanha a mudança **e** viaja sozinho, e é por isso que é o padrão.',
      'É a família do vídeo da AP044: incorporar põe o arquivo dentro, vincular guarda o endereço, e os dois se chamam "inserir". A diferença aparece longe de casa.',
    ],
    `Os três, depois de a planilha mudar e o arquivo viajar

                   acompanha?   viaja sozinho?
  imagem               não           sim
  vinculado            sim           não
  incorporado          sim           sim

  O vinculado quebrado não mostra erro: mostra um quadro vazio.`,
    'Como imagem tem um uso legítimo: quando você **quer** congelar o retrato de um momento — o orçamento aprovado em março, por exemplo. O erro é congelar sem saber.',
    [],
  ),
];

/* ── Módulo 8: as notas ───────────────────────────────────────────────────── */

const AS_NOTAS: TopicoDeVereda[] = [
  t(
    'o-que-sao-notas-do-apresentador',
    'As notas do apresentador são o que você fala, e o telão não mostra',
    'Elas são o que faz o slide poder ficar enxuto.',
    [
      '**Notas do apresentador** são um texto que acompanha cada slide e que não aparece na projeção. Elas existem para receber o que se fala — a explicação, o caso do ano passado, o número que você vai citar e não precisa projetar.',
      'No **Modo de Exibição do Apresentador**, a sua tela mostra o slide, a nota, o relógio e o próximo slide; o telão mostra só o slide. É esse modo que faz as notas valerem a pena.',
      'A conta é simples: tudo o que você não precisa que a plateia **leia** vai para a nota. O slide fica com o que ela vai anotar; a nota fica com o que ela vai ouvir.',
    ],
    `O mesmo slide, duas telas

  NO TELÃO                        NA SUA TELA
    O que levar                     O que levar
    · Saco de dormir                · Saco de dormir
    · Lanterna                      · Lanterna
                                    ─────────────────
                                    Nota: dizer que a
                                    temperatura chega
                                    perto dos 7 graus
                                    de madrugada.`,
    'Abrir o painel de notas é um clique, e painel vazio não serve a ninguém. O que conta é a nota escrita.',
    ['notas do apresentador', 'Modo de Exibição do Apresentador'],
  ),
  t(
    'nota-nao-repete-o-slide',
    'A nota não repete o slide: ela diz o que você vai falar **a mais**',
    'Nota que copia o tópico faz você ler em voz alta o que a plateia já leu.',
    [
      'A tentação é copiar o tópico para a nota, para "não esquecer". O resultado é que você olha a nota, lê o que está projetado, e a plateia ouve pela segunda vez a frase que ela leu em três segundos.',
      'A nota útil é a que **não está** no slide: o porquê, o caso concreto, o número que explica o número do slide, o aviso que você sempre esquece de dar.',
      'E ela é escrita para ser **falada**, não lida: frase curta, do jeito que você diria. Parágrafo de dez linhas na nota é roteiro, e roteiro na mão faz quem apresenta parar de olhar para a sala.',
    ],
    `A mesma nota, duas versões

  COPIANDO O SLIDE
    slide: · Saco de dormir e isolante
    nota:  Falar do saco de dormir e do isolante.

  DIZENDO O QUE FALTA
    slide: · Saco de dormir e isolante
    nota:  Todo ano alguém traz só o saco. O chão da chácara
           tira o calor por baixo — sem isolante, ninguém dorme.`,
    'Se a sua nota e o seu tópico dizem a mesma coisa, um dos dois é desnecessário. Quase sempre é o tópico que está longo demais.',
    [],
  ),
];

/* ── Módulo 9: cortar ─────────────────────────────────────────────────────── */

const CORTAR: TopicoDeVereda[] = [
  t(
    'cortar-nao-e-apagar',
    'Cortar pela metade é consolidar, e não empilhar nem apagar',
    'Dois slides juntados num só precisam continuar caindo em seis tópicos.',
    [
      'Reduzir uma apresentação à metade dos slides tem dois caminhos errados e um certo. O primeiro errado é **apagar**: chega-se a oito slides e sai-se com metade da informação. O segundo é **empilhar**: juntam-se os tópicos de dois slides num só, e sai um slide de nove itens, que é três slides disfarçados.',
      'O certo é **consolidar**: ler os dois slides, reconhecer o que se repete, e reescrever uma lista que cubra os dois em até seis tópicos. Quase sempre dá, porque dois slides sobre o mesmo assunto repetem mais do que parece.',
      'E o título precisa ser reescrito. "O que levar — parte 1" não é título de um slide que agora traz as duas partes: título que sobrou do corte é o que denuncia que foi empilhamento.',
    ],
    `Juntar "parte 1" e "parte 2"

  EMPILHANDO (9 tópicos, 51 palavras)
    O que levar — parte 1
    · Saco de dormir e isolante térmico
    · Lanterna com pilha de reserva
    ... e os seis do outro slide

  CONSOLIDANDO (6 tópicos, 35 palavras)
    O que levar
    · Saco de dormir e isolante térmico
    · Lanterna com pilha de reserva
    · Agasalho, touca e luva
    · Prato, caneca e talher com o nome
    · Remédio de uso contínuo: na enfermaria
    · Não leve eletrônico nem nada de valor`,
    'Cortar slide e cortar palavra são duas coisas. O slide consolidado ainda pode estar acima do orçamento de palavras — e encurtar as linhas é o passo seguinte.',
    [],
  ),
  t(
    'justificar-por-escrito',
    'Justificar cada corte por escrito é o que mostra o que não devia sair',
    'Quem escreve o porquê descobre, escrevendo, o que estava prestes a perder.',
    [
      'O requisito pede a justificativa **por escrito** de cada corte, e isso não é burocracia. Escrever "este slide saiu porque o conteúdo dele foi para o anterior" obriga a conferir se ele de fato foi.',
      'E obriga a nomear o que ficou de fora. "Saiu porque não ia dar tempo" é uma justificativa honesta para um slide de contexto, e é uma confissão para o slide que tinha o endereço da chácara.',
      'O jeito prático é listar antes do corte **o que não pode sair** — a data, o local, a hora da saída, o valor, o prazo, o que levar. Dez informações numa folha, e cada corte conferido contra ela.',
    ],
    `A lista de antes, e o corte depois

  NÃO PODE SAIR            onde ficou
    13 a 15 de junho         slide 3
    Chácara Recanto Verde    slide 3
    ônibus, dezenove horas   slide 3
    o valor por desbravador  slide 6 (gráfico)
    prazo de 30 de maio      slide 6
    ...

  Slide cortado sem linha nesta tabela é informação perdida.`,
    'A lista é de quem recebe a apresentação, e não de quem a monta: ela responde "o que a família precisa saber ao sair daqui?".',
    [],
  ),
];

/* ── Módulo 10: cinco minutos ─────────────────────────────────────────────── */

const CINCO_MINUTOS: TopicoDeVereda[] = [
  t(
    'o-orcamento-de-cinco-minutos',
    'Cinco minutos são cerca de 650 palavras faladas',
    'E o que gasta o tempo é a fala, não o slide.',
    [
      'Quem explica para uma sala fala em torno de 130 palavras por minuto — mais devagar que uma conversa, porque se pausa. Cinco minutos são cerca de 650 palavras **faladas**, somando tudo.',
      'Isso significa que o orçamento não é do slide: é da nota. Oito slides enxutos levam vinte segundos para ler em voz alta e cinco minutos para explicar. Contar só o que está projetado daria um minuto, e quem confiasse nessa conta descobriria o contrário na frente do examinador.',
      'O limite de **dez slides** e **vinte palavras por slide** é o que mantém a apresentação apresentável nesse tempo. Vinte palavras é um título e quatro linhas curtas.',
    ],
    `A conta, para a nossa apresentação

  8 slides
    palavras projetadas    147
    palavras de nota       523
    total                  670
    670 ÷ 130 = 5,2 minutos

  Tirando duas notas longas: 4,6 minutos.`,
    'A conta é uma estimativa, e ensaiar com relógio é o que de fato responde. Ela serve para saber que não cabe **antes** de descobrir isso apresentando.',
    [],
  ),
  t(
    'o-pdf-congela',
    'Exportar em PDF é o último passo, porque o PDF congela',
    'Exportar cedo e continuar mexendo entrega o arquivo de antes.',
    [
      'O PDF é um retrato: ele guarda o que existia na hora em que foi criado. Exportar e continuar mexendo é o que se faz sem pensar — e o arquivo entregue sai sem os slides que vieram depois, sem nada na tela dizendo isso.',
      'É a mesma coisa do sumário da CC-ES002, que guarda o que leu, e do PDF da CC-ES004. O conserto é um só: exportar de novo depois de terminar.',
      'E o PDF é o que sobrevive ao computador do clube. Ele abre em qualquer máquina, não perde fonte, não perde vídeo vinculado e não depende da versão do PowerPoint. Levar os dois — o editável e o PDF — é o que a liderança precisa.',
    ],
    `A ordem que custa

  1. exportar PDF (8 slides)
  2. encurtar o texto de três slides
  3. entregar o PDF

  O PDF entregue tem os textos longos. O editável, os curtos.
  E os dois têm o mesmo nome.`,
    'Se você mexeu em algo depois de exportar, exporte de novo. Consertar dentro do PDF deixa dois documentos diferentes — e o editável, que é o que vai ser usado no ano que vem, fica sendo o errado.',
    [],
  ),
];

/* ── Os dez módulos ───────────────────────────────────────────────────────── */

export const MODULOS_DAS_APRESENTACOES: ModuloDeVereda[] = [
  {
    id: 'm1',
    titulo: 'O slide mestre',
    resumo: 'A aparência de todos os slides num lugar só — e a formatação à mão, que vence ele.',
    licoes: [
      {
        id: 'm1-teoria', tipo: 'teoria',
        questoes: QUESTOES_DAS_APRESENTACOES['m1-teoria'],
        perguntas: 4,
        titulo: 'Onde a aparência de uma apresentação mora',
        resumo: 'Mexer no mestre muda os vinte slides. Quando não muda, é porque alguém formatou à mão.',
        topicos: O_SLIDE_MESTRE,
      },
      {
        id: 'm1-lab', tipo: 'apresentacao', licao: 'mestre',
        titulo: 'Pondo a identidade do clube no mestre',
        resumo: 'E descobrindo por que mexer nele não muda nada na tela.',
        verificacoes: ['identidade-no-mestre', 'logo-e-numero', 'sem-direta'],
      },
    ],
  },
  {
    id: 'm2',
    titulo: 'Layout, e não caixa à mão',
    resumo: 'O espaço reservado tem posição fixa; a caixa desenhada tem a posição em que ficou.',
    licoes: [
      {
        id: 'm2-teoria', tipo: 'teoria',
        questoes: QUESTOES_DAS_APRESENTACOES['m2-teoria'],
        perguntas: 4,
        titulo: 'Onde as caixas de um slide ficam',
        resumo: 'E por que o título desalinhado não se vê num slide, só passando.',
        topicos: O_LAYOUT,
      },
      {
        id: 'm2-lab', tipo: 'apresentacao', licao: 'layout',
        titulo: 'Passando os slides, e vendo o título pular',
        resumo: 'Seis títulos em caixa solta, cada um numa altura. Cada slide está perfeito.',
        verificacoes: ['viu-o-pulo', 'sem-caixa-a-mao', 'abertura-com-layout-de-titulo'],
      },
    ],
  },
  {
    id: 'm3',
    titulo: 'Hierarquia visual',
    resumo: 'A ordem em que o olho lê — e tópico de vinte palavras é a fala escrita no slide.',
    licoes: [
      {
        id: 'm3-teoria', tipo: 'teoria',
        questoes: QUESTOES_DAS_APRESENTACOES['m3-teoria'],
        perguntas: 4,
        titulo: 'A ordem em que o olho lê um slide',
        resumo: 'Ela existe sempre. A escolha é se ela é a que você quis.',
        topicos: A_HIERARQUIA,
      },
      {
        id: 'm3-lab', tipo: 'apresentacao', licao: 'hierarquia',
        titulo: 'Encurtando tópicos até eles caberem numa linha',
        resumo: 'E deixando o título visivelmente maior que o corpo, no mestre.',
        verificacoes: ['titulo-maior', 'seis-topicos', 'topico-nao-e-frase'],
      },
    ],
  },
  {
    id: 'm4',
    titulo: 'Contraste',
    resumo: 'A diferença de luz entre o texto e o fundo, medida — e o que o telão faz com ela.',
    licoes: [
      {
        id: 'm4-teoria', tipo: 'teoria',
        questoes: QUESTOES_DAS_APRESENTACOES['m4-teoria'],
        perguntas: 4,
        titulo: 'A cor que se lê, e a que só se lê no monitor',
        resumo: 'Uma razão de 1:1 a 21:1, e o corte de 4,5:1.',
        topicos: O_CONTRASTE,
      },
      {
        id: 'm4-lab', tipo: 'apresentacao', licao: 'contraste',
        titulo: 'Escurecendo as cores do clube até elas se lerem',
        resumo: 'O ouro mede 2,42:1 e o verde 3,48:1. Nenhum dos dois estoura nada.',
        verificacoes: ['viu-na-sala-clara', 'titulo-se-le', 'corpo-se-le'],
      },
    ],
  },
  {
    id: 'm5',
    titulo: 'Os três erros, e o efeito de cada um',
    resumo: 'Não no arquivo nem no gosto de quem monta: em quem assiste.',
    licoes: [
      {
        id: 'm5-teoria', tipo: 'teoria',
        questoes: QUESTOES_DAS_APRESENTACOES['m5-teoria'],
        perguntas: 4,
        titulo: 'O que cada erro faz com a sala',
        resumo: 'A metade do conselho que ninguém escreve — e a que faz ele grudar.',
        topicos: OS_TRES_ERROS,
      },
      {
        id: 'm5-lab', tipo: 'apresentacao', licao: 'erros',
        titulo: 'Classificando os três slides que você acabou de consertar',
        resumo: 'Do jeito que as famílias os teriam visto, no telão com luz na sala.',
        verificacoes: ['nomeou-os-erros', 'nomeou-os-efeitos', 'o-que-fazer-em-vez'],
      },
    ],
  },
  {
    id: 'm6',
    titulo: 'A imagem que o projetor mostra',
    resumo: 'Resolução é a relação entre o que o arquivo tem e o tamanho em que ele entra.',
    licoes: [
      {
        id: 'm6-teoria', tipo: 'teoria',
        questoes: QUESTOES_DAS_APRESENTACOES['m6-teoria'],
        perguntas: 4,
        titulo: 'Pixels, polegadas e o que o telão usa',
        resumo: 'A foto pequena esticada fica boa no monitor e serrilhada no telão.',
        topicos: A_IMAGEM,
      },
      {
        id: 'm6-lab', tipo: 'apresentacao', licao: 'imagens',
        titulo: 'Um logo de 320 pixels em metade do slide',
        resumo: 'E três fotos de celular que fazem a apresentação não caber num e-mail.',
        verificacoes: ['viu-o-peso', 'nada-esticado', 'arquivo-leve'],
      },
    ],
  },
  {
    id: 'm7',
    titulo: 'O gráfico vem da planilha',
    resumo: 'Número digitado está certo hoje e continua mostrando o de hoje amanhã.',
    licoes: [
      {
        id: 'm7-teoria', tipo: 'teoria',
        questoes: QUESTOES_DAS_APRESENTACOES['m7-teoria'],
        perguntas: 4,
        titulo: 'Três colagens que se parecem, e o que muda entre elas',
        resumo: 'Imagem congela; vinculado precisa da planilha; incorporado leva uma cópia.',
        topicos: O_GRAFICO,
      },
      {
        id: 'm7-lab', tipo: 'apresentacao', licao: 'grafico',
        titulo: 'Trocando a tabela digitada por um gráfico que acompanha',
        resumo: 'Os custos do slide foram digitados antes de a planilha mudar.',
        verificacoes: ['grafico-da-planilha', 'grafico-acompanha', 'viu-qual-acompanhou'],
      },
    ],
  },
  {
    id: 'm8',
    titulo: 'As notas do apresentador',
    resumo: 'O que você fala, e o telão não mostra — e é o que deixa o slide enxuto.',
    licoes: [
      {
        id: 'm8-teoria', tipo: 'teoria',
        questoes: QUESTOES_DAS_APRESENTACOES['m8-teoria'],
        perguntas: 4,
        titulo: 'Duas telas: a sua e a da sala',
        resumo: 'E a nota que repete o slide faz você ler em voz alta o que a plateia já leu.',
        topicos: AS_NOTAS,
      },
      {
        id: 'm8-lab', tipo: 'apresentacao', licao: 'notas',
        titulo: 'Escrevendo o que se fala, fora do slide',
        resumo: 'No modo do apresentador, a nota está na sua tela e o telão mostra só o slide.',
        verificacoes: ['viu-o-modo-do-apresentador', 'notas-escritas', 'nota-nao-repete'],
      },
    ],
  },
  {
    id: 'm9',
    titulo: 'Cortar pela metade',
    resumo: 'Consolidar, e não empilhar nem apagar — com cada corte justificado por escrito.',
    licoes: [
      {
        id: 'm9-teoria', tipo: 'teoria',
        questoes: QUESTOES_DAS_APRESENTACOES['m9-teoria'],
        perguntas: 4,
        titulo: 'Dois caminhos errados e um certo',
        resumo: 'Apagar perde informação; empilhar faz três slides disfarçados de um.',
        topicos: CORTAR,
      },
      {
        id: 'm9-lab', tipo: 'apresentacao', licao: 'corte',
        titulo: 'De dezesseis para oito, sem perder as dez informações',
        resumo: 'E justificando por escrito cada slide que saiu.',
        verificacoes: ['metade-dos-slides', 'cortes-justificados', 'titulo-cobre-os-dois'],
      },
    ],
  },
  {
    id: 'm10',
    titulo: 'Cinco minutos, dez slides, vinte palavras',
    resumo: 'O orçamento da fala, o roteiro que a plataforma prepara, e o PDF por último.',
    licoes: [
      {
        id: 'm10-teoria', tipo: 'teoria',
        questoes: QUESTOES_DAS_APRESENTACOES['m10-teoria'],
        perguntas: 4,
        titulo: 'O que gasta cinco minutos é a fala',
        resumo: 'Cerca de 130 palavras por minuto — e o PDF congela o que existir na hora.',
        topicos: CINCO_MINUTOS,
      },
      {
        id: 'm10-lab', tipo: 'apresentacao', licao: 'cinco-minutos',
        titulo: 'Vinte palavras por slide, e o roteiro da fala',
        resumo: 'O corte entregou slides de trinta e cinco palavras. Agora é a vez das palavras.',
        verificacoes: ['vinte-palavras', 'abertura-escrita', 'pdf-por-ultimo'],
      },
    ],
  },
];
