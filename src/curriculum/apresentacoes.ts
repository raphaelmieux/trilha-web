import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DAS_APRESENTACOES } from './questoesDasApresentacoes';
import { telasDoTopico } from './telas';

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
 * ── O exemplo é a tela ───────────────────────────────────────────────────
 * Os tópicos que ensinam um gesto trazem as janelas do próprio laboratório,
 * passo a passo, abertas na apresentação da Feira de Especialidades
 * (`src/exemplos/feiraDeEspecialidades.ts`), e não na do acampamento, que é
 * a das lições. Eram slides desenhados com traços, e citavam os tópicos
 * enxutos, as cores escurecidas e os custos que o laboratório manda achar. A
 * justificativa dos cortes fica em prosa: ela mora no caderno, e não no
 * PowerPoint.
 */

const V = 'CC-ES011';
const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], atencao: string, marcas: string[],
  telas?: [string, string][],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, atencao, marcas,
  ...(telas ? { telas: telasDoTopico(V, id, telas) } : {}),
});

/* ── Módulo 1: o slide mestre ─────────────────────────────────────────────── */

const O_SLIDE_MESTRE: TopicoDeVereda[] = [
  t(
    'o-que-e-slide-mestre',
    'O slide mestre é a aparência de todos os slides, num lugar só',
    'Mexer nele muda todos os slides de uma vez — e é por isso que ele existe.',
    [
      'Toda apresentação tem um **slide mestre**: uma folha que ninguém apresenta e que diz como o título, o corpo, o fundo e o que se repete em toda página vão aparecer. Os slides não guardam aparência própria; eles herdam a dele.',
      'É a mesma ideia do **estilo** de um documento, que a CC-ES002 ensinou. Lá, trocar o Título 1 muda os cinco títulos de uma vez; aqui, trocar o tamanho do título no mestre muda todos os slides. A diferença entre as duas é só o programa.',
      'Quem não usa o mestre formata slide por slide. Funciona, e o preço aparece depois: no dia em que o clube muda a cor, são vinte slides para corrigir — e o vigésimo vai ficar diferente dos outros dezenove, porque ninguém acerta vinte vezes seguidas.',
    ],
    'O mestre não se apresenta e não entra na contagem de slides. Ele abre em Exibir › Slide Mestre, e o aviso amarelo no alto da tela é o que diz que você não está num slide.',
    ['slide mestre', 'Exibir → Slide Mestre'],
    [
      [
        'Em Exibir › Slide Mestre, o aviso amarelo diz onde você está, e a faixa mostra fonte, tamanho e cor do título e do corpo.',
        'O PowerPoint no modo de slide mestre, com a Feira de Especialidades aberta. Circulados: o aviso amarelo, que diz "Você está no slide mestre. O que mudar aqui vale para todos os slides de uma vez", e a faixa com os campos Fonte, Tamanho e Cor do Título e do Corpo, e os botões Logo e Número.',
      ],
      [
        'Trocado o tamanho do título para 44 e fechado o mestre, o título de todos os slides cresce junto.',
        'De volta à exibição normal, com o slide 2 aberto. Circulados: a tira de slides à esquerda, em que todos os títulos laranja ficaram maiores, e o slide O que é a feira, com o título grande em Georgia.',
      ],
    ],
  ),
  t(
    'a-direta-vence-o-mestre',
    'A formatação aplicada à mão vence o mestre',
    'E é por isso que mexer no mestre, às vezes, não muda nada na tela.',
    [
      'Quando alguém seleciona um título e aperta os botões da barra — negrito, tamanho, cor —, aquilo fica gravado **naquele slide**. É a *formatação direta*, e ela ganha do mestre ao desenhar.',
      'O efeito é desconcertante: você abre o mestre, troca o tamanho do título, fecha, e o título continua igual. Não há erro nenhum. O mestre mudou, e a formatação direta de cada slide continua lá por cima dele.',
      'O conserto é **Limpar Formatação**, em Página Inicial. Ele tira a direta e deixa o mestre passar, e não encosta no texto: as palavras ficam exatamente as mesmas. Apagar o slide e redigitá-lo também "resolve", e é como se perde um slide inteiro sem perceber.',
    ],
    'Limpar Formatação limpa **a formatação**, e não o texto. Se o seu texto desapareceu, você apagou o conteúdo em vez de limpar o estilo dele.',
    ['formatação direta', 'Limpar Formatação'],
    [
      [
        'O mestre diz título 44 e laranja. A cor veio, e o tamanho não: as duas partes das barracas continuam com o 34 e o 37 escritos à mão.',
        'A exibição normal com o slide 5 aberto. Circulados: o título Barracas — parte 1, laranja e pequeno, e na tira os slides 5 e 6, cujos títulos têm tamanhos diferentes entre si.',
      ],
      [
        'Em Página Inicial › Limpar Formatação, a direta sai, e o título passa a ter o tamanho do mestre.',
        'A guia Página Inicial com o botão Limpar circulado. O título Barracas — parte 1 está agora maior, com o tamanho do mestre, e na tira os títulos dos slides 5 e 6 ficaram iguais.',
      ],
    ],
  ),
  t(
    'o-que-se-repete-vai-no-mestre',
    'O logo e o número do slide vão no mestre',
    'Um clique para todos os slides, e o número é campo: ele conta a folha.',
    [
      'O que aparece em toda página — o logo do clube no canto, o número do slide no pé, a data — mora no mestre. Posto nele, aparece em todos; posto num slide, aparece naquele.',
      'O número do slide é um **campo**, e não um número digitado. Campo mostra em que folha ele está sendo desenhado; número digitado mostra o que alguém escreveu. É a mesma distinção do requisito 4.4 da CC-ES002, e ela erra do mesmo jeito: quem digita "3" fica com três em todas as folhas.',
      'E o logo no mestre não atrapalha ninguém no slide: ele não é um objeto que se arrasta sem querer, porque ele não está no slide — está na folha de baixo.',
    ],
    'O slide de abertura normalmente **não** leva número: a convenção de todo impresso é não numerar a capa. No PowerPoint isso é uma caixa chamada "Não mostrar no slide de título".',
    ['campo', 'número do slide'],
    [
      [
        'No mestre, os botões Logo e Número ficam ligados, e o logo aparece no canto da folha de baixo.',
        'O modo de slide mestre com os botões Logo e Número circulados e destacados, e o selo PIONEIROS circulado no canto de baixo da folha mestre.',
      ],
      [
        'Fechado o mestre, todo slide traz o logo e o próprio número — aqui, o 3.',
        'A exibição normal com o slide 3, Data e local, aberto. Circulados: o selo PIONEIROS no canto do slide, com o número 3 embaixo, e na tira os slides 2, 3 e 4, cada um com o selo.',
      ],
    ],
  ),
];

/* ── Módulo 2: layout ─────────────────────────────────────────────────────── */

const O_LAYOUT: TopicoDeVereda[] = [
  t(
    'o-que-e-layout',
    'Layout é onde as caixas de um slide ficam',
    'E é uma escolha de lista, não um desenho à mão.',
    [
      '**Layout** é o arranjo dos espaços reservados de um slide: onde entra o título, onde entra o corpo, onde entra a imagem. O PowerPoint oferece uma lista — Slide de Título, Título e Conteúdo, Duas Partes de Conteúdo, Somente Título, Em Branco —, e cada um deles tem posições **fixas**.',
      'Fixas é a palavra. O espaço reservado do título do "Título e Conteúdo" cai no mesmo lugar em todos os slides que usam esse layout. Uma caixa de texto desenhada à mão cai onde a mão soltou.',
      'Layout é do slide; mestre é da apresentação. O mestre diz **como** o título aparece (fonte, cor, tamanho); o layout diz **onde** ele aparece. Trocar o layout não troca a aparência, e trocar o mestre não troca a posição.',
    ],
    'Quem desenha caixa de texto parte do slide Em Branco, porque nele não há espaço reservado nenhum para o texto cair. É o layout mais honesto e o mais perigoso.',
    ['layout', 'espaço reservado'],
    [
      [
        'Em Página Inicial › Layout, a lista dos cinco; o slide Como funciona está em Em Branco, com caixas à mão.',
        'O menu Layout aberto e circulado, com Slide de Título, Título e Conteúdo, Duas Partes de Conteúdo, Somente Título e Em Branco, este último marcado. Atrás, o slide 4 com o título e o texto em caixas soltas.',
      ],
      [
        'Escolhido Título e Conteúdo, o texto vai para os espaços reservados, no lugar fixo do layout.',
        'O slide 4, Como funciona, circulado: o título no alto à esquerda, em laranja, e os dois tópicos em lista, em azul, cada um no seu espaço reservado.',
      ],
    ],
  ),
  t(
    'o-defeito-so-existe-na-sequencia',
    'O título desalinhado não se vê num slide: se vê passando',
    'Cada slide está perfeito. A apresentação pisca.',
    [
      'Quem posiciona caixas à mão acerta a posição de um slide e erra a do seguinte por alguns milímetros. Abra qualquer um deles: está bonito. Passe de um para o outro: o título **pula**.',
      'O olho de quem assiste acompanha o título pulando em vez de ler o slide novo. Ninguém na plateia sabe dizer o que está errado — a sensação é de uma apresentação "amadora", e a causa são milímetros que ninguém mede.',
      'É por isso que este defeito sobrevive a toda revisão: quem revisa olha slide por slide, e slide por slide não há nada de errado. Só passando a apresentação — Apresentação de Slides › Do Começo — ele aparece.',
    ],
    'Aplicar o layout **move** o texto para o espaço reservado e a caixa à mão deixa de existir. Se ela ficasse, o texto apareceria duas vezes — uma no espaço reservado e outra solta por cima.',
    ['espaço reservado'],
    [
      [
        'Passando a apresentação, o título Data e local está a 12% do alto do slide.',
        'O telão em tela cheia, no slide 3 de 9. Circulado, o título Data e local, mais abaixo do alto do slide.',
      ],
      [
        'No slide seguinte, Como funciona está a 7%: o título pula para cima ao passar.',
        'O telão no slide 4 de 9. Circulado, o título Como funciona, visivelmente mais alto do que o título do slide anterior.',
      ],
    ],
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
      'Com título e corpo quase do mesmo tamanho, não há ordem nenhuma — o olho começa onde cair, e cada pessoa da sala começa num lugar diferente. O slide não está feio; ele está *sem instrução de leitura*.',
      'O título precisa ser visivelmente maior que o corpo, e não um pouco maior. Metade a mais já se lê de longe; oito pontos de diferença somem a cinco metros do telão. É no mestre que isso se acerta: título 40, corpo 24.',
    ],
    'Aumentar o corpo "para preencher o slide" é o jeito mais rápido de destruir a hierarquia — e é o que mais se faz quando sobra espaço. Espaço vazio num slide não é defeito.',
    ['hierarquia visual'],
    [
      [
        'Título a 40 e corpo a 32: um bloco de texto em que o título mal se destaca.',
        'O slide 2, O que é a feira, circulado. O título laranja e os dois tópicos azuis têm quase o mesmo tamanho, e os tópicos ocupam três linhas cada um.',
      ],
      [
        'No mestre, o corpo desce para 24 e o título fica em 40: agora há um título e uma lista.',
        'O mesmo slide circulado, depois da troca no mestre. O título está bem maior que os tópicos, que ficaram menores e ocupam menos linhas.',
      ],
    ],
  ),
  t(
    'topico-nao-e-frase',
    'Tópico não é frase: é a etiqueta do que você vai falar',
    'Vinte palavras com um ponto na frente são um parágrafo disfarçado.',
    [
      'O slide é apoio, e não roteiro. Um tópico de vinte palavras é a sua fala escrita — e quando ela está escrita, a plateia lê. Ler é mais rápido que ouvir: em três segundos todos terminaram, e você está no meio da primeira frase falando de algo que eles já sabem.',
      'A medida prática é caber numa linha: até oito palavras. O que sobrar da frase não se joga fora — vai para a **nota do apresentador**, que é onde a fala mora. A régua de status, embaixo da janela, conta as palavras do slide.',
      'E seis tópicos é o teto. Nove itens iguais não têm hierarquia: são uma lista, e lista projetada ninguém lê — procura-se o próprio nome nela e desiste-se do resto.',
    ],
    'Encurtar não é apagar. A data, o valor e o nome do lugar não podem sair do slide: são o que a família vai anotar, e o que ninguém guarda de ouvido.',
    ['nota do apresentador'],
    [
      [
        'Como funciona chega com duas frases inteiras, e a régua conta 40 palavras.',
        'O slide 4, Como funciona, circulado, com dois tópicos longos de duas e três linhas. Também circulada, a régua de status embaixo, que diz Slide 4 de 9 e 40 palavras.',
      ],
      [
        'Reescrito em três etiquetas curtas, com o resto da fala na nota, a régua cai para 14 palavras.',
        'O mesmo slide circulado com três tópicos curtos: Barracas: das 9h ao meio-dia, Passaporte na entrada, Um carimbo por barraca. Embaixo, circulado, o painel de notas aberto com a frase Contar que o passaporte completo concorre a um prêmio, e a régua com 14 palavras.',
      ],
    ],
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
      'A medida é a mesma que todo verificador de acessibilidade usa, e o PowerPoint tem o dele: Revisão › Verificar Acessibilidade. Ele escreve "Texto com contraste insuficiente" e diz onde.',
      'O corte usual é **4,5:1** para texto corrido e 3:1 para texto grande. Num telão, numa sala com luz, vale mirar o maior dos dois para tudo: a luz da sala lava a cor, e o que sobra de contraste é menos do que o monitor mostrou.',
    ],
    'Cor que passa como título grande e reprova como corpo é o caso cruel. Uma cor que funciona num lugar e não no outro é a que ninguém desconfia.',
    ['contraste', 'Verificar Acessibilidade'],
    [
      [
        'Em Revisão › Verificar Acessibilidade, o painel mede o laranja e o azul da feira sobre o branco: 2,45:1 e 2,92:1.',
        'O slide 2 com o título laranja e os tópicos azul-claro. À direita, circulado, o painel Acessibilidade com dois avisos amarelos: Texto com contraste insuficiente: título do slide mestre, 2,45:1; e corpo do slide mestre, 2,92:1.',
      ],
    ],
  ),
  t(
    'escurecer-nao-e-desistir',
    'Escurecer a cor do clube não é desistir dela',
    'E a coluna de tons do seletor existe exatamente para isso.',
    [
      'Quando a cor da identidade não se lê, há dois caminhos. Um é pintar tudo de preto: resolve a conta e joga fora a identidade. O outro é **escurecer a mesma cor** até ela passar — e ela continua sendo o laranja da feira, mais escuro.',
      'O seletor de cor do PowerPoint oferece, ao lado de cada cor do tema, tons mais claros e mais escuros. É de lá que sai o conserto: 25% mais escuro, 50% mais escuro.',
      'E a cor nunca é a única pista. Quem não distingue duas cores precisa de outra coisa que diga o mesmo — tamanho, peso, posição. É a mesma razão de a insígnia desta plataforma ter forma **e** cor.',
    ],
    'Clarear a cor do **fundo** também resolve, e às vezes é o conserto certo: contraste é a relação entre as duas, e não uma propriedade do texto.',
    [],
    [
      [
        'No mestre, cada cor tem a sua fileira de tons: o laranja da feira, 25% e 50% mais escuro, e o preto.',
        'O modo de slide mestre com as duas fileiras de cor circuladas: a do título, com quatro tons de laranja até o preto, e a do corpo, com cinco tons de azul até o cinza-escuro.',
      ],
      [
        'Com os dois tons 50% mais escuros, o painel mede 5,68:1 no título e 7,05:1 no corpo, e as duas cores continuam sendo da feira.',
        'O slide 2 circulado, com o título em laranja escuro e os tópicos em azul escuro. À direita, circulado, o painel Acessibilidade com dois itens verdes: título do slide mestre, 5,68:1; corpo do slide mestre, 7,05:1.',
      ],
    ],
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
      'O texto demais faz a plateia ler e parar de ouvir quem fala. A cor sem contraste some para quem está no fundo. A hierarquia ausente faz cada pessoa começar o slide num ponto diferente. O efeito é o que faz o conselho grudar: "não ponha texto demais" se esquece; "a plateia lê e para de ouvir você" não.',
      'E separa os erros de verdade dos de gosto: a fonte não ser a da identidade não muda nada para quem assiste. A cor não se ler muda tudo para quem está no fundo.',
    ],
    'O que **não** é efeito sobre quem assiste: o arquivo demorar para abrir, o PowerPoint travar, a fonte não combinar. São problemas reais, de outra natureza.',
    [],
    [
      [
        'No telão, os três de uma vez: duas frases inteiras, corpo quase do tamanho do título, e azul-claro sobre branco.',
        'O telão em tela cheia no slide 2, O que é a feira, circulado: o título laranja-claro e dois tópicos longos em azul-claro, de duas linhas cada, quase do tamanho do título.',
      ],
    ],
  ),
  t(
    'ver-como-a-sala-ve',
    'O jeito de achar os três é olhar como a sala olha',
    'De longe, projetado, com a luz acesa — e não a 40 cm do monitor.',
    [
      'Todo defeito desta vereda é invisível de onde se monta a apresentação. O monitor tem contraste alto, está a quarenta centímetros do olho, e mostra o slide inteiro com nitidez de sobra.',
      'O telão não. Ele está a cinco metros de quem senta atrás, a sala tem luz, e a imagem é esticada muitas vezes. O azul-claro desaparece, o texto miúdo não se lê, e a foto pequena fica serrilhada.',
      'Então o gesto que acha tudo é um só: **passar a apresentação** antes de apresentar, de longe, com a luz como ela vai estar. No laboratório, o botão "Ver no telão, com luz na sala" do painel de tarefas faz isso; fora dele, é a sala de verdade.',
    ],
    'Se não houver telão para ensaiar, afaste-se três metros do monitor e olhe. O que você não conseguir ler dali, ninguém lê no fundo da sala.',
    [],
    [
      [
        'Passando a apresentação: os tópicos de Como funciona, em azul-claro e letra pequena, já custam a ler no próprio monitor.',
        'O telão em tela cheia no slide 4 de 9, com os dois tópicos longos circulados, em azul-claro e letra pequena sobre o branco.',
      ],
      [
        'E a foto do ano passado, de 640 pixels, ocupa quase o slide inteiro: no telão ela é esticada.',
        'O telão no slide 9 de 9, Como foi a feira de 2025, com a foto ocupando a maior parte do slide.',
      ],
    ],
  ),
];

/* ── Módulo 6: a imagem ───────────────────────────────────────────────────── */

const A_IMAGEM: TopicoDeVereda[] = [
  t(
    'resolucao-e-para-a-projecao',
    'Resolução adequada é adequada **ao tamanho em que a imagem entra**',
    'A mesma foto serve num quarto do slide e não serve na tela inteira.',
    [
      'Uma imagem tem um número de pixels — 640 de largura, 4000 de largura. A projeção também: um telão de hoje mostra 1920 pixels de largura. Se a imagem ocupa 80% do slide, ela é desenhada com 1536 desses pixels.',
      'Se o arquivo tem menos de 1536 pixels de largura, ele é **esticado**: cada pixel dele cobre mais de um pixel do telão, e o resultado é serrilhado. Se tem muito mais, o excesso é jogado fora na hora de projetar — e continua pesando no arquivo.',
      'Então "resolução adequada" não é uma propriedade do arquivo: é a relação entre o que ele tem e o tamanho em que ele entra. O painel Formatar Imagem, em Design, diz as duas contas lado a lado.',
    ],
    'No seu monitor a foto esticada fica boa, porque ele é menor que o telão e está mais perto do seu olho. É por isso que este defeito chega a tanta apresentação.',
    ['resolução'],
    [
      [
        'Em Design › Imagem, o painel diz: 640 × 480 px, ocupando 80% do slide, e a projeção usa 1536.',
        'O slide 9 com a foto feira-2025.jpg. À direita, circulado, o painel Formatar Imagem com o aviso amarelo: 640 × 480 px, ocupando 80% do slide — a projeção usa 1536 px de largura; e o botão Alterar Imagem.',
      ],
      [
        'Alterar Imagem lista as fotos da pasta com o tamanho de cada uma.',
        'A caixa Alterar Imagem circulada, com quatro arquivos: cartaz-da-feira.png 300 × 225 px, cartaz-da-feira-grande.png 1800 × 1350 px, feira-2025.jpg 640 × 480 px e feira-2025-original.jpg 4000 × 3000 px.',
      ],
      [
        'Trocada pela original, de 4000 pixels, o aviso continua: agora é pixel demais, que pesa e o telão não usa.',
        'O painel Formatar Imagem circulado, com o aviso amarelo: feira-2025-original.jpg, 4000 × 3000 px, ocupando 80% do slide — a projeção usa 1536 px de largura.',
      ],
    ],
  ),
  t(
    'compactar-e-destrutivo',
    'Compactar imagens reduz de verdade, e não volta',
    'E os três valores que a caixa oferece custam coisas diferentes.',
    [
      'Fotos de celular — doze megapixels cada — fazem uma apresentação de vários megabytes, que não passa por anexo de e-mail e demora para abrir no computador do clube. O comando que resolve é **Compactar Imagens**, em Design, e ele é destrutivo: os pixels que saem não voltam.',
      'A caixa oferece valores em **ppi**, pontos por polegada do slide. 96 ppi é o que ela chama de "e-mail": ele encolhe muito e deixa a foto abaixo do que o telão mostra. 150 ppi serve à projeção. 220 ppi é mais pixel do que o telão usa, e pesa mais.',
      'A ordem importa: compactar e depois trocar a foto por outra desfaz o trabalho, e trocar e depois compactar é uma passagem só. É a mesma aritmética da CC-ES004, onde comprimir antes de reconhecer custa o texto.',
    ],
    'Guarde os arquivos originais em outro lugar antes de compactar. O PowerPoint não tem como devolver o que foi jogado fora, e o Ctrl+Z só alcança enquanto o arquivo não foi fechado.',
    ['Compactar Imagens', 'ppi'],
    [
      [
        'Com a foto original no slide, a régua de status diz 3,5 MB.',
        'A exibição normal no slide 9, com a régua de status circulada no pé da janela: Slide 9 de 9, 6 palavras, Português (Brasil), 3,5 MB.',
      ],
      [
        'Em Compactar Imagens, 150 ppi: a opção que serve à projeção.',
        'A caixa Compactar Imagens circulada, com o aviso Resolução de saída. Isto não volta, e três opções: 96 ppi para e-mail, 150 ppi para web, marcada, e 220 ppi para impressão. Embaixo, Agora o arquivo tem 3,5 MB.',
      ],
      [
        'Compactada, a foto fica com 1600 pixels — acima dos 1536 que o telão usa —, e o arquivo cai para 0,6 MB.',
        'O painel Formatar Imagem circulado, agora em verde: feira-2025-original.jpg, 1600 × 1200 px, ocupando 80% do slide — a projeção usa 1536 px de largura. A régua de status, também circulada, diz 0,6 MB.',
      ],
    ],
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
      'Conferir um slide de números contra a planilha é trabalho que ninguém faz duas vezes. Por isso a saída não é conferir melhor: é não digitar.',
    ],
    'O total no slide e o total na planilha só discordam no dia em que alguém olhar os dois. Até lá, os dois parecem certos.',
    [],
    [
      [
        'No slide, os custos digitados: material 120, lanche 90, prêmios 60, total 270.',
        'O slide 7, Custos da feira, circulado, com quatro tópicos: Material: R$ 120,00; Lanche: R$ 90,00; Prêmios: R$ 60,00; Total: R$ 270,00.',
      ],
      [
        'Na planilha, hoje: material 150 e prêmios 75. O total é 315, e o slide continua dizendo 270.',
        'A janela da planilha Custos da feira.xlsx, com Material 150, Lanche 90, Prêmios 75 e Total 315, e um gráfico de pizza ao lado.',
      ],
    ],
  ),
  t(
    'as-tres-colagens',
    'Colar um gráfico tem três caminhos, e eles se parecem',
    'Imagem congela; vinculado precisa da planilha; incorporado leva uma cópia.',
    [
      'Ao colar um gráfico da planilha, o PowerPoint oferece três opções de colagem. **Como imagem**: ele vira um desenho, com os números de agora, para sempre. **Vinculando aos dados**: ele lê a planilha de verdade, e precisa que ela viaje junto — sem ela, o quadro fica vazio no computador do clube.',
      '**Mantendo a formatação**, que incorpora: ele leva uma cópia da planilha dentro do arquivo da apresentação. É o único que acompanha a mudança **e** viaja sozinho, e é por isso que é o padrão.',
      'É a família do vídeo da AP044: incorporar põe o arquivo dentro, vincular guarda o endereço, e os dois se chamam "inserir". A diferença aparece longe de casa.',
    ],
    'Como imagem tem um uso legítimo: quando você **quer** congelar o retrato de um momento — o orçamento aprovado em março, por exemplo. O erro é congelar sem saber.',
    [],
    [
      [
        'Em Inserir › Gráfico, as três colagens: como imagem, mantendo a formatação, e vinculando aos dados.',
        'O menu Gráfico aberto e circulado, com três itens: Colar como Imagem; Colar Mantendo a Formatação (incorpora a planilha); Colar Vinculando aos Dados (a planilha viaja junto).',
      ],
      [
        'Colado mantendo a formatação, o slide passa a mostrar o gráfico com os números da planilha de hoje.',
        'O slide 7, Custos da feira, circulado, agora com um gráfico de pizza de três fatias, Material, Lanche e Prêmios, no lugar dos números digitados.',
      ],
    ],
  ),
];

/* ── Módulo 8: as notas ───────────────────────────────────────────────────── */

const AS_NOTAS: TopicoDeVereda[] = [
  t(
    'o-que-sao-notas-do-apresentador',
    'As notas do apresentador são o que você fala, e o telão não mostra',
    'Elas são o que faz o slide poder ficar enxuto.',
    [
      '**Notas do apresentador** são um texto que acompanha cada slide e que não aparece na projeção. Elas existem para receber o que se fala — a explicação, o caso do ano passado, o número que você vai citar e não precisa projetar. O painel delas fica embaixo do slide.',
      'No **Modo de Exibição do Apresentador**, em Apresentação de Slides, a sua tela mostra o slide e a nota; o telão mostra só o slide. É esse modo que faz as notas valerem a pena.',
      'A conta é simples: tudo o que você não precisa que a plateia **leia** vai para a nota. O slide fica com o que ela vai anotar; a nota fica com o que ela vai ouvir.',
    ],
    'Abrir o painel de notas é um clique, e painel vazio não serve a ninguém. O que conta é a nota escrita.',
    ['notas do apresentador', 'Modo de Exibição do Apresentador'],
    [
      [
        'No painel embaixo do slide Data e local, a nota diz o que não cabe no slide: o portão é o da rua de trás.',
        'A exibição normal no slide 3, Data e local, com o painel Notas do apresentador aberto e circulado: Avisar que a entrada da frente fica fechada no domingo, e que o portão é o da rua de trás.',
      ],
      [
        'No Modo de Exibição do Apresentador, a nota aparece ao lado do slide, só na sua tela.',
        'O modo do apresentador em tela cheia: o slide Data e local à esquerda, e à direita, circulada, a coluna Suas notas com a mesma frase sobre o portão.',
      ],
    ],
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
    'Se a sua nota e o seu tópico dizem a mesma coisa, um dos dois é desnecessário. Quase sempre é o tópico que está longo demais.',
    [],
    [
      [
        'O slide diz "Passaporte na entrada"; a nota diz o que o slide não diz: o prêmio, e que criança pequena pode pedir ajuda.',
        'O slide 4, Como funciona, circulado, com três tópicos curtos. Embaixo, circulado, o painel de notas: Explicar que o passaporte completo concorre a um prêmio, e que criança pequena pode pedir ajuda.',
      ],
    ],
  ),
];

/* ── Módulo 9: cortar ─────────────────────────────────────────────────────── */

const CORTAR: TopicoDeVereda[] = [
  t(
    'cortar-nao-e-apagar',
    'Cortar pela metade é consolidar, e não empilhar nem apagar',
    'Dois slides juntados num só precisam continuar cabendo em seis tópicos.',
    [
      'Reduzir uma apresentação à metade dos slides tem dois caminhos errados e um certo. O primeiro errado é **apagar**: chega-se à metade e sai-se com metade da informação. O segundo é **empilhar**: juntam-se os tópicos de dois slides num só, e sai um slide de nove itens, que é três slides disfarçados.',
      'O certo é **consolidar**: ler os dois slides, reconhecer o que se repete, e reescrever uma lista que cubra os dois em até seis tópicos. Quase sempre dá, porque dois slides sobre o mesmo assunto repetem mais do que parece.',
      'E o título precisa ser reescrito. "Barracas — parte 1" não é título de um slide que agora traz as duas partes: título que sobrou do corte é o que denuncia que foi empilhamento.',
    ],
    'Cortar slide e cortar palavra são duas coisas. O slide consolidado ainda pode estar acima do orçamento de palavras — e encurtar as linhas é o passo seguinte.',
    [],
    [
      [
        'Duas partes das barracas, três unidades em cada slide.',
        'A exibição normal com os slides 5 e 6 circulados na tira: Barracas — parte 1 e Barracas — parte 2, cada um com três tópicos.',
      ],
      [
        'Consolidado: um slide chamado As barracas, com as seis unidades em seis linhas curtas, e o slide 6 excluído.',
        'O slide 5 circulado, agora chamado As barracas, com seis tópicos: Águia: nós e ponte de cordas; Tucano: mudas em garrafa; Arara: mapa e bússola; Jaguar: primeiros socorros; Onça: culinária no fogareiro; Falcão: aves pelo canto. Na tira, circulado, o slide 5 seguido direto do slide dos custos.',
      ],
    ],
  ),
  t(
    'justificar-por-escrito',
    'Justificar cada corte por escrito é o que mostra o que não devia sair',
    'Quem escreve o porquê descobre, escrevendo, o que estava prestes a perder.',
    [
      'O requisito pede a justificativa **por escrito** de cada corte, e isso não é burocracia. Escrever "este slide saiu porque o conteúdo dele foi para o anterior" obriga a conferir se ele de fato foi.',
      'E obriga a nomear o que ficou de fora. "Saiu porque não ia dar tempo" é uma justificativa honesta para um slide de contexto, e é uma confissão para o slide que tinha o endereço do evento.',
      'O jeito prático é listar antes do corte **o que não pode sair** — a data, o local, a hora, o valor, o prazo, o que levar. As informações numa folha, e cada corte conferido contra ela. No laboratório, isso se escreve no caderno, que fica no painel de tarefas: o PowerPoint não tem onde guardar uma justificativa.',
    ],
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
      'O limite de **dez slides** e **vinte palavras por slide** é o que mantém a apresentação apresentável nesse tempo. Vinte palavras é um título e quatro linhas curtas — e a régua de status conta as do slide aberto.',
    ],
    'A conta é uma estimativa, e ensaiar com relógio é o que de fato responde. Ela serve para saber que não cabe **antes** de descobrir isso apresentando.',
    [],
    [
      [
        'A régua de status conta as palavras que projetam: o slide Data e local tem 15.',
        'A exibição normal no slide 3 de 8, com a régua de status circulada no pé da janela: Slide 3 de 8, 15 palavras, Português (Brasil), 1,2 MB.',
      ],
      [
        'O que gasta os cinco minutos é a nota, que só você vê no modo do apresentador.',
        'O modo do apresentador no slide 3 de 8, com a coluna Suas notas circulada, que traz a frase sobre o portão da rua de trás.',
      ],
    ],
  ),
  t(
    'o-pdf-congela',
    'Exportar em PDF é o último passo, porque o PDF congela',
    'Exportar cedo e continuar mexendo entrega o arquivo de antes.',
    [
      'O PDF é um retrato: ele guarda o que existia na hora em que foi criado. Exportar e continuar mexendo é o que se faz sem pensar — e o arquivo entregue sai com os slides de antes, sem nada na tela dizendo isso.',
      'É a mesma coisa do sumário da CC-ES002, que guarda o que leu, e do PDF da CC-ES004. O conserto é um só: exportar de novo depois de terminar, em Arquivo › Exportar.',
      'E o PDF é o que sobrevive ao computador do clube. Ele abre em qualquer máquina, não perde fonte, não perde vídeo vinculado e não depende da versão do PowerPoint. Levar os dois — o editável e o PDF — é o que a liderança precisa.',
    ],
    'Se você mexeu em algo depois de exportar, exporte de novo. Consertar dentro do PDF deixa dois documentos diferentes — e o editável, que é o que vai ser usado no ano que vem, fica sendo o errado.',
    [],
    [
      [
        'Exportado com oito slides e depois cortado um, Arquivo › Informações diz: 7 slides, e o PDF criado com 8.',
        'Os bastidores do PowerPoint em Arquivo › Informações, com a ficha circulada: Nome Feira de Especialidades 2026.pptx; Slides 7; Tamanho 0,7 MB; PDF criado com 8 slides.',
      ],
    ],
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
