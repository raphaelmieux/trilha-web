import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DA_IDENTIDADE_VISUAL as Q } from './questoesDaIdentidadeVisual';
import { telasDoTopico } from './telas';

/*
 * A vereda CC-DG004 Identidade Visual.
 *
 * ── O que ela é ─────────────────────────────────────────────────────────
 * A quarta da família de Design, e a que junta as duas anteriores: o símbolo
 * é vetor, da CC-DG002, e as peças em que ele é aplicado misturam foto, da
 * CC-DG003. Os cinco termos do requisito 2, a explicação do 3, as cinco
 * etapas do 4, as aplicações do 5, o manual do 6 e a defesa do 7 viram nove
 * lições — e uma marca só, a da unidade Ipê, construída do conceito ao
 * manual. O arranjo está escrito em `identidadeDoClube.ts`.
 *
 * ── O que fica fora do aplicativo ────────────────────────────────────────
 * Os dez rascunhos são à mão, e a apresentação ao examinador é falada. A
 * plataforma registra os rascunhos e prepara a defesa por escrito; desenhar
 * no papel e falar em voz alta continuam sendo com quem estuda.
 *
 * ── As telas são da Buriti ───────────────────────────────────────────────
 * Os tópicos que ensinam um gesto do editor mostram o gesto, tela por tela,
 * com a marca da unidade Buriti, de `src/exemplos/marcaDoBuriti.ts`. A da
 * Ipê é a que o laboratório constrói, e mostrá-la pronta — a paleta, o
 * mínimo, as versões — seria escrever na teoria a resposta de cada lição.
 *
 * ── Os números ──────────────────────────────────────────────────────────
 * Os que a teoria cita — contrastes, larguras mínimas, a área de proteção —
 * saem do mesmo motor que confere as lições, e
 * `exemplosDaIdentidadeVisual.test.ts` os confere.
 */

const V = 'CC-DG004';
const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], atencao: string, marcas: string[],
  telas?: [legenda: string, descricao: string][],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, atencao, marcas, ...(telas ? { telas: telasDoTopico(V, id, telas) } : {}),
});

/* ── Módulo 1: o conceito ─────────────────────────────────────────────────── */

const CONCEITO: TopicoDeVereda[] = [
  t(
    'identidade-visual',
    'O que é identidade visual',
    'O conjunto de marca, cores e letras que faz alguém reconhecer quem é você sem ler nada.',
    [
      'A **identidade visual** é tudo o que faz uma coisa ser reconhecida de longe: a marca, as cores, o tipo de letra e o jeito de usar os três. O lenço do clube, a bandeira da unidade e o uniforme fazem isso todo sábado, antes de alguém ler um nome.',
      'Ela não é só a marca. Uma marca bonita usada cada vez de um jeito — esticada num cartaz, verde-limão no outro, sem espaço no terceiro — deixa de ser reconhecida. O que segura tudo junto são as **regras**, e é por isso que esta vereda termina num manual.',
      'Toda identidade começa num **conceito**: o que a marca deve comunicar, e a quem. A unidade Buriti, que aparece nas telas desta vereda, escreveu assim o dela: comunica a unidade que dá sombra e alimento, alta e de raiz funda, e fala com desbravadores de 10 a 12 anos e com as famílias. Sem um conceito escrito, cada escolha vira gosto pessoal, e gosto não se defende diante do examinador.',
    ],
    'Público "todo mundo" não é público. Marca feita para todos não fala com ninguém.',
    ['identidade visual', 'conceito'],
  ),
  t(
    'tres-palavras',
    'As três palavras',
    'Três palavras que decidem cada escolha da marca: a forma, a cor e a letra.',
    [
      'O conceito vira ferramenta quando cabe em **três palavras**. Diante de duas opções, a pergunta deixa de ser "de qual eu gosto?" e passa a ser "qual diz melhor as nossas três?".',
      'Prefira palavras que se desenham. As da Buriti são **alta**, **acolhedora** e **resistente**: "alta" pede um tronco comprido; "acolhedora" pede uma copa aberta, que faz sombra; "resistente" pede cor de terra e letra firme, sem enfeite. "Legal" e "bonita" não dizem nada sobre o desenho.',
      'As palavras também servem depois: na defesa, cada uma precisa aparecer em algum lugar da marca, e quem defende aponta onde.',
    ],
    'Três palavras que dizem a mesma coisa são uma palavra só. Escolha três ideias diferentes.',
    ['palavras-chave'],
  ),
];

/* ── Módulo 2: os rascunhos ───────────────────────────────────────────────── */

const RASCUNHOS: TopicoDeVereda[] = [
  t(
    'dez-no-papel',
    'Dez no papel antes do computador',
    'O papel é rápido e não deixa ninguém se apaixonar pela primeira ideia.',
    [
      'O requisito pede **dez rascunhos à mão** antes de abrir o programa. Não é tradição: no papel, uma ideia leva um minuto; no computador, leva meia hora, e quem gastou meia hora numa ideia não quer jogá-la fora.',
      'As primeiras ideias costumam ser as óbvias — a árvore inteira, a letra do nome. As boas aparecem lá pelo sexto ou sétimo rascunho, quando as óbvias acabaram. Na folha da Buriti, as primeiras foram a palmeira inteira e a letra B; a escolhida, o leque sobre o tronco, foi a oitava.',
      'Rascunho é pequeno e rápido: do tamanho de uma moeda, sem apagar. Desenhar pequeno já mostra o que vai sumir quando a marca for para o crachá.',
    ],
    'Não apague o que não gostou. O rascunho descartado é o que você vai explicar na defesa.',
    ['rascunho', 'papel'],
  ),
  t(
    'escolher-e-descartar',
    'Escolher um, e dizer por que os outros não',
    'Cada descarte tem um motivo, e o motivo sai do conceito.',
    [
      'Um só segue para o computador. Para escolher, releia as três palavras e pergunte qual rascunho diz as três com menos traços.',
      'Cada um que fica para trás precisa de um **motivo próprio**. "Os cachos de frutos viram pontinhos quando a marca fica pequena" é motivo; "não ficou bom" não é, e copiar a mesma frase nove vezes não justifica nenhum.',
      'Os motivos costumam cair em poucas famílias: some quando fica pequeno, parece com a marca de outro, não diz uma das palavras, ou é difícil de repetir igual. Reconhecer a família ajuda a não cair nela de novo.',
    ],
    'Copiar a marca de outro clube, mesmo sem querer, é o descarte mais importante de todos.',
    ['descarte', 'justificativa'],
  ),
];

/* ── Módulo 3: símbolo, logotipo e assinatura ─────────────────────────────── */

const SIMBOLO: TopicoDeVereda[] = [
  t(
    'tres-pecas',
    'Símbolo, logotipo e assinatura',
    'O desenho, o nome escrito, e os dois juntos.',
    [
      'O **símbolo** é o desenho: no Buriti, o leque e o tronco. Ele funciona sozinho, sem palavra nenhuma, e é o que vai no ícone do grupo da unidade.',
      'O **logotipo** é o nome escrito de um jeito próprio: "Buriti", numa letra e numa cor escolhidas. Ele é texto, mas não é qualquer texto — é sempre a mesma letra, o mesmo peso, a mesma cor.',
      'A **assinatura** é o símbolo e o logotipo juntos, numa posição fixa um do outro. No editor ela vira um **grupo**: escolha as três camadas na lista com Shift + clique, aperte **Ctrl+G** e dê ao grupo o nome Assinatura. A partir daí, mover, copiar e mudar de tamanho leva os três de uma vez, sem um sair do lugar do outro.',
    ],
    'Muita gente chama tudo de "logo". No manual, use os três nomes: cada um tem regra própria.',
    ['símbolo', 'logotipo', 'assinatura'],
    [
      ['Shift + clique na lista de camadas: o leque e o tronco escolhidos juntos.', 'O editor de design com a palmeira verde de tronco marrom e a palavra Buriti ao lado. Na lista de camadas, em destaque, Tronco e Leque estão escolhidos; na prancha, os dois têm a caixa azul de seleção.'],
      ['Com o logotipo também escolhido, Ctrl+G faz o grupo, que se chama Assinatura.', 'A lista de camadas, em destaque, mostra Assinatura no alto e, recuados embaixo dela, Logotipo, Tronco e Leque. O campo Nome da camada, também em destaque, diz Assinatura.'],
    ],
  ),
  t(
    'do-papel-ao-vetor',
    'Do papel ao vetor',
    'O rascunho escolhido é redesenhado com formas simples, e não copiado traço a traço.',
    [
      'Finalizar o símbolo é redesenhá-lo **em vetor**, com as ferramentas da CC-DG002: elipse, retângulo, caneta. Vetor porque a marca vai do carimbo de dois centímetros à faixa de três metros.',
      'Redesenhar não é copiar o traço da mão: é achar as **formas simples** que estão por trás dele. O leque do rascunho, cheio de folhas tortas, virou um polígono de pontas, de **130 × 64**; o tronco virou um **retângulo, 14 × 76**. Duas formas, que se conferem nos campos L e A do painel.',
      'Depois de desenhar, veja o símbolo em **Exibir › Ver em 64, 32 e 16 px**. O que some em 16 é detalhe demais — e o tronco fino é o primeiro a pedir atenção.',
    ],
    'O cinza que o editor dá a toda forma nova não é cor da marca. Pinte cada forma de propósito.',
    ['vetor', 'formas simples'],
    [
      ['O leque escolhido: um polígono de 130 de largura por 64 de altura.', 'O leque verde da palmeira escolhido na prancha. Os campos L, com 130, e A, com 64, estão em destaque no painel de propriedades.'],
      ['O tronco: um retângulo de 14 por 76.', 'O tronco marrom escolhido. Os campos L, com 14, e A, com 76, estão em destaque.'],
      ['Exibir › Ver em 64, 32 e 16 px: a marca nos três tamanhos pequenos.', 'A aba Tamanhos, em destaque, mostra a assinatura em três miniaturas, de 64, 32 e 16 pixels; na de 16 sobra pouco mais que uma mancha verde.'],
    ],
  ),
];

/* ── Módulo 4: as versões ─────────────────────────────────────────────────── */

const VERSOES: TopicoDeVereda[] = [
  t(
    'colorida-mono-negativa',
    'Colorida, monocromática e negativa',
    'A mesma marca em três roupas, para três tipos de fundo.',
    [
      'A **versão colorida** é a principal, com todas as cores da marca, sobre fundo claro.',
      'A **versão monocromática** é a marca inteira numa cor só — preta, ou qualquer cor que se leia. É a do carimbo, da gravação, da cópia em preto e branco e do bordado de uma linha. No editor: **Duplicar prancha**, dar o nome Monocromática à cópia, escolher a assinatura e escrever a cor em **Recolorir tudo**, que pinta o leque, o tronco e a letra de uma vez.',
      'A **versão negativa** também tem uma cor só, mas **clara sobre fundo escuro**: a marca branca na camiseta azul-marinho da Buriti. Ela é uma versão própria porque a colorida, sobre fundo escuro, some — o verde do leque sobre o marinho dá **2,3:1**, e a marca em branco dá **14,1:1**. Na terceira prancha, o **Fundo da prancha** vira o marinho e o Recolorir tudo vira branco.',
    ],
    'Cada versão vai numa prancha própria. Pintar a original de preto apaga a colorida.',
    ['versão monocromática', 'versão negativa'],
    [
      ['A colorida, na primeira prancha.', 'A assinatura da Buriti, com o leque verde, o tronco marrom e o nome em marrom, sobre a prancha branca em destaque.'],
      ['Duplicar prancha e Recolorir tudo: a monocromática, inteira numa cor quase preta.', 'A cópia da prancha com a assinatura inteira em quase preto. A prancha e o campo Recolorir tudo, com #1E2622, estão em destaque.'],
      ['Outra cópia, o fundo em azul-marinho e a marca em branco: a negativa.', 'A prancha azul-marinho com a assinatura toda branca. A lista de pranchas, em destaque, mostra Colorida, Monocromática e Negativa.'],
    ],
  ),
  t(
    'uma-cor-e-pequena',
    'Por que funcionar numa cor só e pequena',
    'Onde a marca mais aparece é justamente onde ela tem menos recurso.',
    [
      'A marca de uma unidade vai parar no carimbo, no bordado da faixa, na cópia em preto e branco do aviso e no ícone pequeno do grupo. Em nenhum desses lugares há muitas cores ou muito espaço.',
      'Uma marca que só funciona colorida e grande some exatamente onde mais aparece. Por isso o teste é feito ao contrário, e o editor tem os dois: **Exibir › Tons de cinza** mostra a marca como sai na copiadora, e **Ver em 64, 32 e 16 px** mostra como ela fica no ícone. Se ela se reconhece nos dois, vai funcionar em todo o resto.',
      'É também por isso que a cor escolhida precisa de contraste. O laranja do fruto seria a cor mais lembrada do buriti, mas laranja sobre papel branco dá **2,6:1**: o leque quase desaparece. O verde dá **6,1:1**.',
    ],
    'Cor que só funciona na tela do computador de quem desenhou não é cor de marca.',
    ['uma cor', 'tamanho reduzido'],
    [
      ['Exibir › Tons de cinza: a marca como sai na copiadora.', 'A assinatura em tons de cinza sobre a prancha branca em destaque; o leque, o tronco e o nome continuam se separando do fundo. O rodapé diz Simulando: tons de cinza.'],
      ['E em 64, 32 e 16 pixels, ainda em cinza.', 'A aba Tamanhos, em destaque, com as três miniaturas da assinatura; na de 16 pixels só o desenho da palmeira ainda se distingue.'],
    ],
  ),
];

/* ── Módulo 5: paleta e tipografia ────────────────────────────────────────── */

const PALETA: TopicoDeVereda[] = [
  t(
    'a-paleta',
    'A paleta da identidade',
    'As cores da marca, escritas em código, cada uma com um papel.',
    [
      'A **paleta** é a lista das cores da identidade, cada uma com o código dela — o hexadecimal, como #3B6E2A. Escrever o código é o que faz o verde do crachá ser o mesmo verde da camiseta. No editor ela mora na aba **Cores**, como cores do documento.',
      'Cada cor tem um **papel**. Na Buriti: fundo **#FBF6EC**, um creme; texto **#1E2622**, quase preto; destaque **#3B6E2A**, o verde do leque; apoio **#8C4A1E**, a terra do tronco e do nome; neutro **#C9B48A**, a areia. A cor de texto precisa se ler sobre a de fundo a **4,5:1** ou mais — a aba Cores escreve essa conta embaixo do texto —, senão os avisos da unidade saem ilegíveis.',
      'Toda cor que a marca usa precisa estar na paleta. Preto e branco valem sempre, porque são as cores das versões de uma cor.',
    ],
    'Uma cor parecida não é a mesma cor. "Um verde qualquer" no cartaz já é uma marca diferente.',
    ['paleta', 'código de cor'],
    [
      ['A aba Cores: as cinco cores do documento, com o código e o papel de cada uma.', 'O painel Cores, em destaque, com Fundo #FBF6EC, Texto #1E2622, Destaque #3B6E2A, Apoio #8C4A1E e Neutro #C9B48A. Embaixo do texto aparece Sobre o fundo: 14,38:1.'],
      ['O logotipo escolhido: a cor dele é a de apoio, escrita pelo código.', 'A palavra Buriti escolhida na prancha, e o campo Cor do texto, com #8C4A1E, em destaque.'],
    ],
  ),
  t(
    'a-tipografia',
    'A tipografia da identidade',
    'No máximo duas famílias de letra: uma para títulos, uma para texto corrido.',
    [
      'A **tipografia** da identidade diz quais letras se usam e onde. A regra mais segura é **duas famílias no máximo**: uma para títulos — muitas vezes a do logotipo — e uma boa de ler para o texto corrido.',
      'Na Buriti, os títulos são em **Verdana, negrito**, a letra do logotipo; o texto corrido é em **Arial**, de 12 a 16. Uma prancha de tipografia com um exemplo de cada mostra as duas lado a lado, e os campos **Família**, **Peso** e **Corpo** dizem o que cada uma é.',
      'Três famílias ou mais fazem cada peça parecer de um lugar diferente. E família decorativa no texto corrido cansa o olho em três linhas. O logotipo usa sempre a mesma letra: trocar a fonte do nome, mesmo por uma parecida, é trocar a marca.',
    ],
    'Fonte que só existe no seu computador não serve para a identidade: quem abrir o arquivo em outro lugar vai ver outra letra.',
    ['tipografia', 'família de letra'],
    [
      ['O exemplo de título: Verdana, negrito.', 'A prancha Tipografia com o título "Acampamento de verão" escolhido. Os campos Família, com Verdana, e Peso, com Negrito, estão em destaque.'],
      ['O exemplo de texto corrido: Arial, corpo 16.', 'O parágrafo sobre a saída do acampamento escolhido. Os campos Família, com Arial, Peso Normal e Corpo 16, estão em destaque.'],
    ],
  ),
];

/* ── Módulo 6: área de proteção e tamanho mínimo ──────────────────────────── */

const PROTECAO: TopicoDeVereda[] = [
  t(
    'area-de-protecao',
    'Área de proteção',
    'O espaço vazio em volta da assinatura, que nada pode invadir.',
    [
      'A **área de proteção** é a margem em volta da assinatura onde não entra mais nada: nem texto, nem foto, nem a borda da peça. Sem ela, a marca se mistura com o vizinho e deixa de ser lida como marca.',
      'Ela se mede em **fração da altura do símbolo**, e não em centímetros: assim ela acompanha a marca em qualquer tamanho. Meia altura de símbolo é uma escolha comum. No Buriti, o símbolo — do topo do leque ao pé do tronco — tem **136 de altura**; meia altura são **68 em volta**, nos quatro lados.',
      'No manual ela se desenha: um retângulo de contorno, sem nada dentro além da marca. Os campos X, Y, L e A do retângulo conferem a conta — ele começa 68 antes da assinatura e tem 136 a mais de cada medida. E o fundo não invade: a marca pode pousar sobre a cor da camiseta ou sobre uma foto — o que não pode é um objeto entrar pela metade na área.',
    ],
    'Encostar a marca na borda do crachá também invade: a borda da peça conta.',
    ['área de proteção'],
    [
      ['A página do manual: a assinatura e, em volta, o contorno da área de proteção.', 'Uma página com o título Área de proteção, a assinatura da Buriti no meio e um retângulo de contorno laranja em volta dela, em destaque.'],
      ['O leque escolhido: a medida da altura do símbolo começa aqui em cima.', 'O leque escolhido na página, com os campos Y e A em destaque no painel.'],
      ['O retângulo da área: começa 68 antes da marca e tem 136 a mais.', 'O retângulo de contorno escolhido, com os campos X 52, Y 82, L 452 e A 272 em destaque.'],
    ],
  ),
  t(
    'tamanho-minimo',
    'Tamanho mínimo de aplicação',
    'A menor largura em que a assinatura ainda se lê.',
    [
      'Todo desenho tem um tamanho abaixo do qual ele vira mancha. O **tamanho mínimo** é a menor largura em que a assinatura ainda se lê, e ele vai escrito no manual para ninguém usá-la menor.',
      'Quem costuma mandar é a **letra**: ela some antes da forma. Na assinatura do Buriti, o logotipo tem **corpo 44 numa largura de 316**. A letra chega a **7 pixels** — o menor que ainda se lê — quando a largura é 7 ÷ 44 × 316, que dá 50,3: arredondando para cima, o **tamanho mínimo medido é 51 pixels**.',
      'Para conferir, escolha a assinatura e escreva 51 no campo **L**: o grupo diminui por igual, com a letra junto, e é assim que ela vai sair no menor carimbo. O mínimo declarado no manual não pode ser menor do que o medido, senão permite uma marca ilegível; nem tão maior, senão proíbe a marca no crachá, onde ela cabia.',
    ],
    'Abaixo do mínimo, muitas marcas usam só o símbolo, sem o logotipo. É uma versão reduzida, e também vai no manual.',
    ['tamanho mínimo'],
    [
      ['A assinatura escolhida, com 316 de largura.', 'A assinatura da Buriti escolhida na prancha, e o campo L, com 316, em destaque.'],
      ['L = 51: a assinatura no tamanho mínimo medido.', 'A mesma prancha com a assinatura minúscula no canto, ainda com o nome legível. O campo L, com 51, está em destaque.'],
    ],
  ),
];

/* ── Módulo 7: aplicações ─────────────────────────────────────────────────── */

const APLICACOES: TopicoDeVereda[] = [
  t(
    'tres-naturezas',
    'Três peças de naturezas diferentes',
    'Tecido, papel pequeno e tela: cada um pede uma versão e um tamanho.',
    [
      'Aplicar a identidade em peças de **naturezas distintas** mostra se ela aguenta o mundo real. Três bem diferentes: a **camiseta** (tecido escuro), o **crachá** (papel pequeno, cheio de coisa) e o **post** (tela, por cima de uma foto).',
      'Cada peça pede uma decisão. Na camiseta azul-marinho da Buriti, a colorida não se lê: vai a negativa. No crachá, o espaço é pouco: a marca diminui, sem passar do mínimo e sem encostar na foto. No post, a foto costuma ser escura: negativa de novo, longe da chamada.',
      'A assinatura chega às peças **copiada e colada**, nunca redesenhada: **Editar › Copiar** na prancha da assinatura, e **Editar › Colar** na da peça. Ali, **Recolorir tudo** faz a versão, e o campo **L** muda o tamanho do grupo por igual. Redesenhar a cada peça é como a marca começa a mudar sem ninguém perceber.',
    ],
    'Mudar o tamanho pela largura do grupo mantém a proporção. Puxar só uma forma estica a marca.',
    ['aplicação', 'peças'],
    [
      ['Colada na camiseta: a colorida some no azul-marinho.', 'A prancha Camiseta, azul-marinho, com a assinatura colorida colada; o verde e o marrom quase não se separam do fundo. A lista de pranchas está em destaque.'],
      ['Recolorir tudo em branco e L = 420: a negativa, no tamanho da estampa.', 'A mesma camiseta com a assinatura branca e maior. Os campos L, com 420, e Recolorir tudo, com #FFFFFF, estão em destaque.'],
    ],
  ),
  t(
    'conferir-a-peca',
    'Conferir a peça antes de entregar',
    'Quatro perguntas, sempre as mesmas.',
    [
      'Antes de dar uma peça por pronta, quatro perguntas: a marca **se lê** sobre o que está atrás dela? Ela está **inteira**, sem esticar? A **área de proteção** está vazia? Ela está **acima do mínimo**?',
      'Na camiseta da Buriti: a negativa branca sobre o marinho se lê a 14,1:1; ela foi escalada pela largura do grupo, então está inteira; não há nada encostado nela; e tem 420 de largura, contra o mínimo de 51. As quatro passam.',
      'As quatro saem do manual, e é para isso que ele existe: qualquer pessoa do clube consegue conferir, sem precisar de quem desenhou a marca por perto. Quando uma pergunta falha, a resposta quase sempre já está no manual: outra versão, outro lugar na peça, ou um tamanho maior.',
    ],
    'Peça bonita que falha numa das quatro não está pronta.',
    ['conferência'],
  ),
];

/* ── Módulo 8: o manual ───────────────────────────────────────────────────── */

const MANUAL: TopicoDeVereda[] = [
  t(
    'o-manual',
    'O manual de marca',
    'As regras da identidade, escritas e desenhadas, para quem não estava lá.',
    [
      'O **manual de marca** é o documento que guarda as regras: as versões, a paleta, a tipografia, a área de proteção, o tamanho mínimo e como usar e não usar. É ele que deixa a marca igual quando a diretoria da unidade mudar.',
      'Um manual curto de **quatro páginas** já resolve: uma com as três versões, uma com as cores e as letras, uma com a área de proteção e o mínimo, e uma com os usos incorretos. No editor, cada página é uma prancha: **Nova prancha**, e um nome em **Nome da prancha** — Manual — 1, Manual — 2.',
      'Manual se mostra, e não só se escreve. "Use a negativa sobre fundo escuro" se entende melhor com a negativa desenhada sobre uma faixa escura, logo abaixo da colorida.',
    ],
    'Manual que ninguém consegue abrir não protege nada. Exporte em PDF, que abre em qualquer lugar.',
    ['manual de marca'],
    [
      ['A página 1: as três versões, cada uma com uma linha dizendo onde vai.', 'A lista de pranchas, em destaque, com Manual — 1 a Manual — 4. Na página escolhida, a assinatura colorida, a monocromática em quase preto e a negativa branca sobre uma faixa azul-marinho.'],
      ['A página 2: as cinco cores, e as duas letras com o uso de cada uma.', 'A página Manual — 2, em destaque, com cinco quadrados de cor lado a lado e duas linhas: Títulos: Verdana, negrito; Texto corrido: Arial, 12 a 16.'],
    ],
  ),
  t(
    'usos-incorretos',
    'Usos incorretos ilustrados',
    'Mostrar o erro desenhado é o jeito mais rápido de ninguém cometê-lo.',
    [
      'O manual mostra também o que **não** fazer, com a marca estragada de propósito. Cada exemplo mostra um erro diferente, porque três exemplos do mesmo erro ensinam um só.',
      'Os erros mais comuns: **esticar** a marca ou só o símbolo; usar uma **cor fora da paleta**; pôr a marca sobre um **fundo que não deixa ler**; trocar a **letra do logotipo**; e deixar um vizinho **dentro da área de proteção**.',
      'Cada exemplo ganha um ✕ ou a palavra "não" por perto, e uma frase curta dizendo o que está errado. Na página da Buriti são três: o símbolo esticado de lado, a marca inteira num rosa que não está na paleta, e o nome escrito em outra letra.',
    ],
    'Estragar a marca no manual é de propósito. Fora do manual, cada um desses é o que a vereda inteira existe para evitar.',
    ['uso incorreto'],
    [
      ['A página 4: três usos incorretos, cada um de um jeito.', 'Uma página com o título Usos incorretos e três assinaturas estragadas, cada uma com um aviso vermelho em cima: Não estique o símbolo, com a palmeira larga demais; Não troque a cor, com a marca em rosa; Não troque a letra, com o nome numa letra de serifa.'],
    ],
  ),
];

/* ── Módulo 9: a defesa ───────────────────────────────────────────────────── */

const DEFESA: TopicoDeVereda[] = [
  t(
    'defender-o-conceito',
    'Defender o conceito',
    'Mostrar onde cada palavra do conceito aparece na marca.',
    [
      'Na apresentação ao examinador, a marca não se defende sozinha. Quem desenhou explica o **conceito** — o que ela comunica e a quem — e mostra onde cada uma das três palavras aparece: na forma, na cor e na letra.',
      'Defesa boa aponta para o desenho. A da Buriti seria assim: **alta** é o tronco comprido; **acolhedora** é o leque aberto, que faz sombra; **resistente** é a cor de terra e a letra firme, sem enfeite. "Achei bonito" não é defesa: gosto não se discute, escolha se explica.',
      'Ensaie em voz alta antes. O que se escreve no caderno é para lembrar, e não para ler.',
    ],
    'Se uma das três palavras não aparece em lugar nenhum da marca, ou a palavra ou o desenho precisa mudar.',
    ['defesa', 'conceito'],
  ),
  t(
    'o-que-o-descarte-ensinou',
    'O que o descarte ensinou',
    'O rascunho que ficou para trás conta como você chegou na marca.',
    [
      'O requisito pede também para **justificar os rascunhos descartados**. Não é desculpa por eles: é mostrar que a marca foi escolhida entre várias, e por quê.',
      'Escolha o descarte que mais ensinou — muitas vezes é o mais bonito no papel, que não sobreviveu ao tamanho pequeno ou parecia com a marca de outro clube.',
      'Conte o que ele tinha de bom, o que faltou, e o que você levou dele para a marca final. Na Buriti: o rascunho com os cachos de frutos pendurados era o mais bonito no papel; no tamanho do crachá os frutos viraram pontinhos, e o que ficou dele foi a decisão de desenhar pensando no tamanho menor.',
    ],
    'Repetir na defesa o mesmo motivo do caderno não é contar o que o descarte ensinou: é ler a ficha.',
    ['rascunho descartado'],
  ),
];

/* ── Os módulos ───────────────────────────────────────────────────────────── */

export const MODULOS_DA_IDENTIDADE_VISUAL: ModuloDeVereda[] = [
  {
    id: 'm1', titulo: 'O conceito',
    resumo: 'O que a marca deve comunicar, e a quem.',
    licoes: [
      { id: 'm1-teoria', tipo: 'teoria', questoes: Q['m1-teoria'], perguntas: 4, titulo: 'Identidade visual e conceito', resumo: 'Marca, cores, letras e as regras que seguram tudo junto.', topicos: CONCEITO },
      { id: 'm1-lab', tipo: 'identidade', licao: 'conceito', titulo: 'Escrevendo o conceito da unidade Ipê', resumo: 'O que comunica, a quem, e três palavras.', verificacoes: ['disse-o-que-comunica', 'disse-a-quem', 'tres-palavras'] },
    ],
  },
  {
    id: 'm2', titulo: 'Os rascunhos',
    resumo: 'Dez ideias no papel, uma escolhida, nove justificadas.',
    licoes: [
      { id: 'm2-teoria', tipo: 'teoria', questoes: Q['m2-teoria'], perguntas: 4, titulo: 'Rascunhar antes do computador', resumo: 'Por que dez, e por que no papel.', topicos: RASCUNHOS },
      { id: 'm2-lab', tipo: 'identidade', licao: 'rascunhos', titulo: 'Registrando os dez rascunhos', resumo: 'A ideia de cada um, o que seguiu, e por que os outros não.', verificacoes: ['dez-rascunhos', 'escolheu-um', 'justificou-os-descartes'] },
    ],
  },
  {
    id: 'm3', titulo: 'O símbolo',
    resumo: 'Símbolo, logotipo e assinatura, finalizados em vetor.',
    licoes: [
      { id: 'm3-teoria', tipo: 'teoria', questoes: Q['m3-teoria'], perguntas: 4, titulo: 'Símbolo, logotipo e assinatura', resumo: 'As três peças da marca, e o redesenho em formas simples.', topicos: SIMBOLO },
      { id: 'm3-lab', tipo: 'identidade', licao: 'simbolo', titulo: 'Finalizando o símbolo da Ipê', resumo: 'Copa, tronco, o nome ao lado, e a prova dos 16 pixels.', verificacoes: ['desenhou-o-simbolo', 'viu-pequeno', 'montou-a-assinatura'] },
    ],
  },
  {
    id: 'm4', titulo: 'As versões',
    resumo: 'Colorida, monocromática e negativa.',
    licoes: [
      { id: 'm4-teoria', tipo: 'teoria', questoes: Q['m4-teoria'], perguntas: 4, titulo: 'Uma marca, três versões', resumo: 'Por que a marca precisa funcionar numa cor só e pequena.', topicos: VERSOES },
      { id: 'm4-lab', tipo: 'identidade', licao: 'versoes', titulo: 'Fazendo as três versões', resumo: 'Duplicar, recolorir, e o fundo escuro da negativa.', verificacoes: ['versao-monocromatica', 'versao-negativa', 'porque-uma-cor'] },
    ],
  },
  {
    id: 'm5', titulo: 'Cores e letras',
    resumo: 'A paleta e a tipografia da identidade.',
    licoes: [
      { id: 'm5-teoria', tipo: 'teoria', questoes: Q['m5-teoria'], perguntas: 4, titulo: 'Paleta e tipografia', resumo: 'Cores com código e papel, e duas famílias de letra.', topicos: PALETA },
      { id: 'm5-lab', tipo: 'identidade', licao: 'paleta', titulo: 'Definindo as cores e as letras da Ipê', resumo: 'A paleta no documento, e a prancha de tipografia.', verificacoes: ['definiu-a-paleta', 'paleta-legivel', 'definiu-a-tipografia'] },
    ],
  },
  {
    id: 'm6', titulo: 'Espaço e tamanho',
    resumo: 'Área de proteção e tamanho mínimo.',
    licoes: [
      { id: 'm6-teoria', tipo: 'teoria', questoes: Q['m6-teoria'], perguntas: 4, titulo: 'Área de proteção e tamanho mínimo', resumo: 'O espaço que nada invade, e a menor largura que se lê.', topicos: PROTECAO },
      { id: 'm6-lab', tipo: 'identidade', licao: 'protecao', titulo: 'Medindo o espaço e o mínimo da Ipê', resumo: 'Declarar os dois, e mostrar a assinatura no mínimo.', verificacoes: ['declarou-a-protecao', 'declarou-o-minimo', 'provou-o-minimo'] },
    ],
  },
  {
    id: 'm7', titulo: 'As aplicações',
    resumo: 'A marca em três peças de naturezas diferentes.',
    licoes: [
      { id: 'm7-teoria', tipo: 'teoria', questoes: Q['m7-teoria'], perguntas: 4, titulo: 'Aplicar a identidade', resumo: 'Cada peça pede uma versão e um tamanho.', topicos: APLICACOES },
      { id: 'm7-lab', tipo: 'identidade', licao: 'aplicacoes', titulo: 'Camiseta, crachá e post', resumo: 'Copiar, colar, escolher a versão e conferir.', verificacoes: ['na-camiseta', 'no-cracha', 'no-post'] },
    ],
  },
  {
    id: 'm8', titulo: 'O manual',
    resumo: 'Quatro páginas, os usos corretos e três incorretos.',
    licoes: [
      { id: 'm8-teoria', tipo: 'teoria', questoes: Q['m8-teoria'], perguntas: 4, titulo: 'O manual de marca', resumo: 'As regras desenhadas, e os erros estragados de propósito.', topicos: MANUAL },
      { id: 'm8-lab', tipo: 'identidade', licao: 'manual', titulo: 'Montando o manual da Ipê', resumo: 'Versões, cores, proteção, e três usos incorretos.', verificacoes: ['quatro-paginas', 'usos-corretos', 'paleta-no-manual', 'tres-incorretos'] },
    ],
  },
  {
    id: 'm9', titulo: 'A defesa',
    resumo: 'O conceito defendido, e o descarte que mais ensinou.',
    licoes: [
      { id: 'm9-teoria', tipo: 'teoria', questoes: Q['m9-teoria'], perguntas: 4, titulo: 'Defender a marca', resumo: 'Apontar as palavras no desenho, e contar o caminho.', topicos: DEFESA },
      { id: 'm9-lab', tipo: 'identidade', licao: 'defesa', titulo: 'Preparando a apresentação', resumo: 'A defesa escrita, para ser falada.', verificacoes: ['defendeu-o-conceito', 'contou-um-descarte'] },
    ],
  },
];
