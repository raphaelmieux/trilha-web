import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DOS_FUNDAMENTOS as Q } from './questoesDosFundamentos';
import { telasDoTopico } from './telas';

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
 * ── O exemplo é o editor ────────────────────────────────────────────────
 * Cada princípio se mostra no editor que o laboratório abre, tela por tela:
 * a peça antes, o campo ou o botão que se usa, a peça depois. As peças das
 * telas são outras que as dos laboratórios — a noite de talentos, o convite
 * do Dia das Mães, o aviso da saída para o campori —, porque fotografar o
 * gesto na peça do exercício seria pôr o gabarito na teoria. Os números que
 * a teoria cita saem do mesmo motor que mede a peça, e
 * `exemplosDosFundamentos.test.ts` os confere.
 */

const V = 'CC-DG001';
const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], atencao: string, marcas: string[],
  telas?: [legenda: string, descricao: string][],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, atencao, marcas, ...(telas ? { telas: telasDoTopico(V, id, telas) } : {}),
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
      'A pergunta que organiza a hierarquia é: se a pessoa só ler uma coisa, o que precisa ser? Se ler duas, qual é a segunda? O que responde a primeira pergunta é o título; o que responde a segunda é o segundo degrau. Depois vem o texto comum — local, o que vai acontecer —, e por último a assinatura, o nome do clube, que pode ficar **menor** que o texto comum.',
      'Um cartaz bem resolvido costuma ter três ou quatro degraus: título, data, texto e assinatura. Conte os degraus da sua peça: se forem um só, não há ordem; se forem seis, também não.',
    ],
    'Hierarquia não é deixar tudo grande. Se tudo grita, nada se destaca.',
    ['hierarquia visual', 'ordem de leitura'],
    [
      ['O cartaz **sem degraus**: título, data, local e texto saem todos em 18, normal. A informação está toda ali, e nada diz por onde começar.', 'O editor de design com o cartaz da Noite de Talentos. As quatro primeiras linhas estão circuladas e têm o mesmo tamanho e o mesmo peso; o nome do clube, no pé, também.'],
      ['O mesmo cartaz **com degraus**: o título em 40 e negrito, a data em 24, negrito e na cor de destaque, o texto em 18 e o clube em 14. O olho vai ao título, depois à data.', 'A prancha Com degraus do mesmo arquivo. O título grande e a data vermelha estão circulados; o local e o texto seguem em tamanho comum, e o nome do clube, pequeno e cinza, ficou no pé.'],
    ],
  ),
  t(
    'tamanho-peso-e-posicao',
    'Tamanho, peso e lugar',
    'Três ferramentas para criar degraus, e um teto para não fazer barulho.',
    [
      'O jeito mais forte de criar um degrau é o **tamanho**. Um título de 40 pixels sobre um texto de 18 é mais que o dobro, e o olho vai nele sem pensar. O **peso** — o negrito — sobe um degrau sem mudar o tamanho. E o **lugar** conta: o que está em cima, à esquerda, é lido antes no nosso jeito de ler.',
      'No editor, os três moram no painel **Propriedades**, à direita, que aparece quando se clica num texto da prancha: **Corpo** é o tamanho, **Peso** é Normal ou Negrito, e **X** e **Y** dizem onde o texto está. Escreve-se o número e aperta-se Enter.',
      'O título precisa ser o maior **sozinho**. Um cartaz com título e data no mesmo tamanho tem dois títulos, e dois títulos é o mesmo que nenhum: o olho fica dividido. Uma escada que funciona: título 40 negrito, data 24 negrito, texto 18, clube 14.',
      'E há um teto. Três ou quatro tamanhos o olho ordena; seis tamanhos parecidos — 22, 22, 20, 19, 18 — não fazem seis degraus, fazem barulho. Quando o título cresce, ele fica mais alto: confira se ele não encostou na linha de baixo, e desça o resto se precisar.',
    ],
    'Diferença de um ou dois pixels não é degrau: o olho não separa 18 de 19.',
    ['tamanho', 'peso', 'título sozinho'],
    [
      ['Clique no título da prancha. O painel **Propriedades** mostra o **Peso** e o **Corpo** dele: Normal e 18, iguais aos do resto do cartaz.', 'O editor com o título Noite de Talentos selecionado. No painel da direita, os campos Peso, com Normal, e Corpo, com 18, estão circulados.'],
      ['Escreva **40** no Corpo, aperte Enter, e troque o Peso para **Negrito**. O título passa a ser o maior da peça, sozinho.', 'O título agora grande e em negrito, circulado na prancha. No painel, Peso mostra Negrito e Corpo mostra 40.'],
      ['Faça o mesmo com a data, em **24** e negrito. São dois degraus diferentes, e o texto comum ficou em 18.', 'A data selecionada, em negrito e maior que o texto e menor que o título. O painel mostra Peso Negrito e Corpo 24, circulados.'],
    ],
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
      'O erro de alinhamento quase nunca é grande. É uma linha que começa sete pixels mais para dentro que as outras, porque foi arrastada com o mouse. Ninguém mede, mas todo mundo percebe que tem alguma coisa torta, mesmo sem saber dizer o quê. No editor, o campo **X** de cada texto conta a verdade: linhas alinhadas à esquerda têm o mesmo X.',
      'Para consertar, não se arrasta de novo: selecione os textos — **Ctrl+A** pega todos, e **Shift + clique** soma um a um — e aperte **Alinhar à esquerda**, o primeiro botão da barra de alinhar. Ele põe todos na borda do que estava mais à esquerda.',
      'Centralizar também é alinhar — desde que seja no **mesmo** centro. Seis linhas centradas cada uma num ponto diferente, nenhum deles o meio da folha, é o defeito mais comum dos convites feitos às pressas. **Centralizar na horizontal**, ao lado, resolve do mesmo jeito.',
    ],
    'Arrastar com o mouse quase nunca acerta o pixel. Alinhe pelo botão, e confira pelo X.',
    ['alinhamento', 'borda comum'],
    [
      ['Cada linha do convite começa num lugar. Clicando em "No salão da igreja", o campo **X** mostra 58, enquanto o título começa em 32.', 'O editor com o convite do Dia das Mães, em que as três linhas de baixo começam em posições diferentes. A última está selecionada, e o campo X, com 58, está circulado.'],
      ['Com **Ctrl+A** os quatro textos ficam selecionados. O botão **Alinhar à esquerda** é o primeiro da barra de alinhar.', 'Os quatro textos do convite selecionados, com o contorno azul em cada um. O primeiro botão de alinhamento da barra de ferramentas está circulado.'],
      ['Depois do clique, as quatro linhas começam no **mesmo X**, 32 — a borda do título. Agora há uma coluna.', 'O convite com as quatro linhas começando na mesma borda esquerda, circuladas juntas. O painel mostra X 32 para os quatro objetos.'],
    ],
  ),
  t(
    'perto-quer-dizer-junto',
    'Perto quer dizer junto',
    'Proximidade é agrupar pelo espaço: o que vai junto fica perto.',
    [
      'O olho lê como grupo o que está perto. Num aviso, dia, hora e lugar formam uma coisa só — o **quando** —, e o que levar forma outra. Se o espaço entre todas as linhas for igual, o aviso vira uma lista de oito coisas soltas, e o pai que lê correndo não separa uma da outra.',
      'A regra prática: o vão **entre** dois grupos precisa ser bem maior que o vão **dentro** de cada um — pelo menos o dobro. Um vão de 14 contra um de 12 a régua mede e o olho não vê.',
      'No editor, quem decide o vão é o campo **Y** de cada linha. Para juntar um grupo, suba as linhas de baixo até ficarem logo abaixo da de cima; para separar dois grupos, desça o segundo inteiro. Com três ou mais linhas selecionadas, **Distribuir verticalmente** iguala os vãos dentro do grupo de uma vez.',
      'Proximidade é a forma mais barata de organizar: não precisa de caixa, de linha nem de cor. Só de espaço.',
    ],
    'Antes de desenhar uma caixa em volta de um grupo, tente só aproximar o que é dele. Quase sempre basta.',
    ['proximidade', 'grupo'],
    [
      ['O aviso com o **vão igual** entre todas as linhas: dia, hora, lugar, "Traga:" e os três itens parecem oito avisos diferentes.', 'O editor com o aviso Saída para o campori. As oito linhas abaixo do título estão circuladas juntas, todas com o mesmo espaço entre si.'],
      ['O mesmo aviso com o **vão que agrupa**: dia, hora e lugar colados, um vão grande, e o que levar colado embaixo. São dois grupos, e se leem como dois.', 'A prancha Vão que agrupa. Um círculo envolve as três linhas do quando, outro envolve Traga e os três itens, com um espaço bem maior entre os dois grupos.'],
    ],
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
      'No editor, quem faz isso é **Copiar estilo** e **Colar estilo**, os dois botões depois dos de agrupar na barra. Selecione o texto que está certo e aperte Copiar estilo; selecione os outros — **Shift + clique** soma à seleção — e aperte Colar estilo. Família, peso, corpo, entrelinha e cor viajam juntos; o texto de cada um fica.',
      'Fazer um por um à mão é como se acaba com um 16 e um 17 que ninguém percebe, e com um verde que não é exatamente o mesmo verde.',
    ],
    'Repetir não é deixar tudo igual. É deixar igual o que tem o mesmo papel.',
    ['repetição', 'copiar estilo'],
    [
      ['Três cartões da mesma programação, cada nome de classe num estilo: Arial verde, Georgia marrom, Verdana azul. Parecem três avisos.', 'O editor com três cartões cinza-claros, um embaixo do outro. Os nomes Classe de Amigo, Classe de Companheiro e Classe de Pesquisador estão circulados e têm fontes, tamanhos e cores diferentes.'],
      ['Clique no nome que está certo e aperte **Copiar estilo**. O editor guarda família, peso, corpo e cor dele.', 'O nome Classe de Amigo selecionado e circulado, e o botão Copiar estilo da barra de ferramentas circulado também.'],
      ['Selecione os outros dois com **Shift + clique** e aperte **Colar estilo**. Os três nomes passam a ser da mesma série.', 'Os três nomes de classe circulados, agora todos em Arial negrito, verde e do mesmo tamanho. O painel mostra dois objetos selecionados com os mesmos valores.'],
    ],
  ),
  t(
    'o-vazio-trabalha',
    'O vazio também trabalha',
    'Espaço negativo é o espaço sem nada, e é ele que deixa o resto respirar.',
    [
      'Espaço negativo é o vazio entre as coisas: a margem em volta da folha, o vão entre os cartões, o respiro entre o texto e a borda do cartão. Ele não está ali por falta de conteúdo — está trabalhando, separando uma coisa da outra e dando descanso ao olho.',
      'O primeiro lugar em que ele falta é a borda. Título encostado na beirada da folha parece cortado, e na impressão às vezes **é** cortado: a guilhotina da gráfica não acerta o milímetro. Uma margem de pelo menos 5% da largura resolve — numa folha de 480 pixels, 24 pixels; numa folha A4, pouco mais de um centímetro.',
      'No editor, a margem se lê nos campos **X** e **Y** do texto, que dizem a distância até a borda esquerda e até o topo. A borda da direita é o X mais a largura **L**: um título com X 4 e L 460, numa folha de 480, encosta dos dois lados.',
      'O segundo lugar é entre vizinhos. Cartões encostados viram um bloco só — deixe pelo menos 16 pixels entre eles —, e texto colado na borda do próprio cartão parece que vai cair para fora — deixe pelo menos 8.',
    ],
    'Se não cabe com margem, não é a margem que sobra: é conteúdo demais para a peça.',
    ['espaço negativo', 'margem'],
    [
      ['O título da feira encostado no canto: **X 4**, **Y 4** e **L 460** numa folha de 480. Ele toca a borda de cima e quase toca as dos lados.', 'O editor com o cartaz da Feira de Especialidades, o título colado no canto superior esquerdo da folha e circulado. No painel, os campos X, com 4, e L, com 460, estão circulados.'],
      ['Com **X 32**, **Y 32** e **L 416** o título ganha a mesma margem do texto de baixo, dos dois lados. A peça respira.', 'O mesmo cartaz com o título afastado das bordas, alinhado ao texto de baixo e circulado. O painel mostra X 32 e L 416.'],
    ],
  ),
];

/* ── Módulo 4: cor ────────────────────────────────────────────────────────── */

const COR: TopicoDeVereda[] = [
  t(
    'matiz-saturacao-luminosidade',
    'Matiz, saturação e luminosidade',
    'Três números que descrevem uma cor do jeito que a gente fala dela.',
    [
      '**Matiz** é o que a gente chama de "a cor": vermelho, laranja, verde, azul. No editor ele é o campo **H**, um número de 0 a 360, porque as cores formam um círculo — 0 é vermelho, 120 é verde, 240 é azul, e 360 volta ao vermelho.',
      '**Saturação** é o campo **S**: o quanto a cor é viva. Com saturação alta o verde grita; com saturação baixa ele vai ficando acinzentado, até virar cinza puro no zero. **Luminosidade** é o campo **L**: o quanto ela é clara. No zero tudo é preto, no cem tudo é branco.',
      'Pensar assim ajuda a montar uma paleta. No cartaz da unidade Jatobá, o destaque, #2E7D4F, tem matiz 145°, saturação 46% e luminosidade 34%. O apoio, #76B290, tem matiz 146°, saturação 28% e luminosidade 58% — o **mesmo verde**, mais calmo e mais claro, que é exatamente a cor de uma faixa que não pode disputar com a data. E o neutro, #8A938E, tem matiz 147°, saturação 4% e luminosidade 56%: quase cinza, com um fio do mesmo verde.',
      'No painel **Cores** do editor, mudar só o S de uma cor mostra isso na hora: o matiz e a luminosidade ficam, e a cor perde a vida.',
    ],
    'Cinza é cor sem saturação. Um "neutro" com saturação alta não é neutro: ele disputa com o destaque.',
    ['matiz', 'saturação', 'luminosidade'],
    [
      ['Na aba **Cores**, cada cor do documento mostra o hexadecimal e os três números: **H**, **S** e **L**. O destaque e o apoio têm quase o mesmo H, e o apoio tem S menor e L maior.', 'O painel Cores do editor, ao lado do cartaz do Acampamento Jatobá. Os quadros Destaque, com H 145, S 46 e L 34, e Apoio, com H 146, S 28 e L 58, estão circulados.'],
      ['Escrevendo **5** no S do destaque, o matiz e a luminosidade ficam onde estavam, e o verde vira um cinza esverdeado.', 'O quadro Destaque circulado, agora com S 5 e uma amostra cinza-escura no lugar do verde. H continua 147 e L continua 34.'],
    ],
  ),
  t(
    'luz-e-tinta',
    'Luz na tela, tinta no papel',
    'RGB acende luz, CMYK mistura tinta, e por isso a cor muda ao imprimir.',
    [
      'A tela **acende** luz em três cores — vermelho, verde e azul, o **RGB**. Somando as três no máximo, sai branco. O papel não acende nada: ele **reflete** a luz do ambiente, e a tinta tira dessa luz o que não quer. As tintas da gráfica são quatro — ciano, magenta, amarelo e preto, o **CMYK**.',
      'A mesma cor se conta dos dois jeitos. O vermelho puro da tela é RGB 255, 0, 0, e na gráfica é CMYK 0, 100, 100, 0 — magenta e amarelo cheios. O vermelho do clube é RGB 193, 53, 22, e na gráfica é CMYK 0, 73, 89, 24. O painel **Cores** do editor escreve os dois números embaixo de cada cor.',
      'Só que há cores que só a luz consegue fazer: o verde-limão, o azul elétrico, o laranja que brilha. Nenhuma mistura de tinta chega lá, e no papel elas saem mais apagadas. Os programas chamam isso de cor **fora da gama** de impressão, e o editor avisa embaixo da cor.',
      'A **prova de impressão**, no menu **Exibir**, mostra na tela como a cor deve sair no papel. Não é exata — cada papel e cada máquina mudam um pouco —, mas mostra qual cor vai mudar. Peça que vai para o papel se confere na prova antes.',
    ],
    'A cor que mais brilha na tela é a que mais muda no papel.',
    ['RGB', 'CMYK', 'prova de impressão'],
    [
      ['O título da gincana em verde-limão, #39FF14. Na aba **Cores**, embaixo do destaque, o editor avisa: **fora da gama de impressão**.', 'O editor com o cartaz escuro da Gincana Noturna e o título em verde-limão, circulado. No painel Cores, o aviso amarelo embaixo da cor Destaque, que diz que no papel a cor sai mais apagada, está circulado.'],
      ['No menu **Exibir**, o último item é **Prova de impressão (CMYK)**.', 'O menu Exibir aberto, com as opções de zoom, de simular visão e, no fim, Prova de impressão (CMYK), circulada.'],
      ['Com a prova ligada, o título mostra o verde que a tinta alcança: mais escuro e sem o brilho. É esse que vai para o mural.', 'O mesmo cartaz com a prova de impressão ligada. O título circulado aparece num verde mais fechado e apagado, e a barra de status diz Prova de impressão.'],
    ],
  ),
  t(
    'uma-paleta-de-cinco',
    'Uma paleta de cinco cores',
    'Cada cor da paleta tem um papel, e a justificativa diz qual.',
    [
      'Uma paleta não é uma lista de cores bonitas: é uma lista de **papéis**. Fundo, texto, destaque, apoio e neutro. Cada cor existe porque faz alguma coisa na peça, e quem escolhe precisa saber dizer o quê.',
      'Algumas regras saem dos papéis. O texto precisa se ler sobre o fundo: o verde quase preto #1F2A24 sobre o branco mede 14,84:1, e o painel **Cores** escreve essa conta embaixo da cor do texto. O destaque precisa ser diferente do resto — senão não destaca. O apoio é parente do destaque, mais calmo, como o #76B290 da faixa do cartaz da Jatobá. E o neutro é quase cinza, para tudo o que é secundário, como a assinatura no pé.',
      'No editor, a paleta mora na aba **Cores**, com as cinco no mesmo lugar. A cor de cada texto se escolhe no campo **Cor do texto**, nas Propriedades, e é ali que se escreve o hexadecimal da paleta: a data do cartaz leva o do destaque.',
      'A justificativa de cada cor é uma frase com o papel dela. "Porque é bonita" não justifica; "o verde da unidade, para a data e o que precisa ser visto primeiro" justifica.',
    ],
    'Antes de escolher a cor, escreva o papel. A cor certa aparece mais rápido.',
    ['paleta', 'papel da cor'],
    [
      ['A aba **Cores** com as cinco cores do cartaz: fundo branco, texto verde quase preto, destaque verde, apoio verde-claro e neutro acinzentado.', 'O painel Cores inteiro circulado, com os cinco quadros Fundo, Texto, Destaque, Apoio e Neutro, cada um com a amostra, o hexadecimal, os números H, S e L e os valores RGB e CMYK.'],
      ['Clicando na data, o campo **Cor do texto** mostra #2E7D4F — o destaque da paleta, usado onde o olho precisa chegar primeiro.', 'A data 17 a 19 de outubro selecionada e circulada na prancha. No painel Propriedades, o campo Cor do texto, com #2E7D4F, está circulado.'],
    ],
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
      'No editor, os dois são campos separados das Propriedades: **Família** é uma lista com o nome de cada desenho e a classificação dele ao lado — Georgia é serifada, Arial é sem serifa —, e **Peso** oferece Normal e Negrito.',
      'A diferença importa na hora de criar degraus. Para separar o subtítulo do texto, muitas vezes basta o **peso**: o mesmo desenho, em negrito. Trocar de família para isso enche a peça de desenhos diferentes sem necessidade.',
      'Uma peça bem resolvida quase nunca passa de duas famílias. Os degraus que faltam saem do tamanho e do peso.',
    ],
    'Negrito não é outra família. No editor, ele fica no campo Peso, e não em Família.',
    ['família', 'peso'],
    [
      ['O título do folheto: **Família** Georgia, serifada, e **Peso** Negrito.', 'O editor com o folheto Bem-vindo ao clube e o título selecionado e circulado. No painel, os campos Família, com Georgia — serifada, e Peso, com Negrito, estão circulados.'],
      ['O parágrafo logo abaixo: **Família** Arial, sem serifa, e **Peso** Normal. Duas famílias, dois pesos, cada um num campo.', 'O parágrafo do folheto selecionado e circulado. No painel, Família mostra Arial — sem serifa e Peso mostra Normal, circulados.'],
    ],
  ),
  t(
    'corpo-e-entrelinha',
    'Corpo e entrelinha',
    'O tamanho da letra e o espaço entre as linhas decidem se o texto se lê.',
    [
      '**Corpo** é o tamanho da letra. Para texto corrido numa peça que se lê de perto, algo entre 14 e 16 pixels é confortável; título pode ser duas ou três vezes maior.',
      '**Entrelinha** é a distância de uma linha à próxima. No editor ela vem escrita em relação ao corpo: **1,4** quer dizer 140% do corpo. Com 1 — 100% —, as linhas quase se tocam e o olho se perde ao voltar para o começo da linha seguinte. Com 2 — 200% —, cada linha parece solta das outras.',
      'Para texto corrido, entre 1,3 e 1,7 funciona. Título curto, de uma ou duas linhas, pode ter entrelinha menor, porque não há volta de linha para errar.',
      'O campo **Entrelinha** fica nas Propriedades, ao lado do Alinhamento. Ao aumentá-la, o parágrafo fica mais alto — o campo **A** mostra a altura nova —, e é preciso olhar se ele não encostou no que vem embaixo.',
    ],
    'Quando o corpo e a entrelinha crescem, o parágrafo fica mais alto. Confira se ele não encavalou no de baixo.',
    ['corpo', 'entrelinha'],
    [
      ['O parágrafo do folheto com **Entrelinha 1**: as linhas quase se tocam, e é difícil achar o começo da seguinte.', 'O editor com o parágrafo do folheto selecionado e circulado, as linhas muito juntas. No painel, o campo Entrelinha, com 1, está circulado.'],
      ['Com **1.5** no mesmo campo, o parágrafo respira e se lê sem esforço. A altura dele cresceu junto.', 'O mesmo parágrafo circulado, agora com espaço confortável entre as linhas. O campo Entrelinha mostra 1.5.'],
    ],
  ),
  t(
    'tres-familias-e-um-par',
    'Serifada, sem serifa, monoespaçada — e um par',
    'As três grandes classificações, e como duas famílias funcionam juntas.',
    [
      '**Serifada** tem os pezinhos na ponta dos traços, como Georgia e Times. **Sem serifa** não tem, como Arial e Verdana. **Monoespaçada** dá a mesma largura a toda letra — o "i" ocupa o espaço do "m" —, como Courier; é a letra do código e das tabelas, onde a coluna alinhada é o ponto, e cansa num parágrafo inteiro.',
      'Duas famílias funcionam juntas quando são **diferentes o bastante** para a diferença parecer de propósito: uma serifada no título e uma sem serifa no texto é o par mais usado. Duas sem serifa parecidas, como Arial e Verdana, são o contrário: parecem um engano, porque o olho percebe que há duas e não entende por quê.',
      'E a família do texto corrido precisa ser de leitura — serifada ou sem serifa. As decorativas, como Brush Script, a cursiva dos convites, ficam para uma palavra ou duas, nunca para um parágrafo.',
      'Explicar um par é dizer o que cada família faz na peça e o que as torna diferentes: "Georgia, serifada, no título, para dar um ar de convite; Arial, sem serifa, no texto, porque se lê bem pequena".',
    ],
    'Explicar o par é dizer o que cada uma faz e o que as torna diferentes. "Ficaram bonitas" não explica.',
    ['serifada', 'sem serifa', 'monoespaçada', 'par tipográfico'],
    [
      ['**Georgia** no título e **Arial** no texto: uma serifada e uma sem serifa. A diferença salta à vista e parece de propósito.', 'A prancha Georgia + Arial do folheto, com o título serifado e o parágrafo sem serifa, os dois circulados.'],
      ['**Arial** no título e **Verdana** no texto: duas sem serifa quase iguais. O olho nota que são duas e não entende por quê.', 'A prancha Arial + Verdana do mesmo folheto, com o título e o parágrafo circulados. As duas letras são sem serifa e muito parecidas, com a Verdana um pouco mais larga.'],
    ],
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
      'O contraste mais importante de todos é o da letra com o fundo, porque sem ele nada mais funciona: um título enorme, em amarelo-claro sobre branco, não se lê. Esse contraste se mede com uma razão — a do texto preto sobre o branco é 21:1, a maior que existe. O amarelo #E8C547 sobre o branco mede 1,68:1 e some; o cinza #999999 mede 2,85:1, fraco; o #333333 mede 12,63:1, firme.',
      'No editor, quem mede é o **Medidor de contraste**, no menu **Plugins**. Ele abre a aba **Contraste** e mede o texto que estiver selecionado: a razão em letra grande, a cor do texto, a cor de trás e o mínimo para aquele tamanho de letra.',
      'Por isso "contraste" aparece duas vezes nesta vereda: como princípio de composição, aqui, e como medida da letra sobre o fundo, no módulo 8. São a mesma ideia: diferença que se vê.',
    ],
    'Se você precisa apertar os olhos para ler na própria tela, quem vê de longe não vai ler.',
    ['contraste', 'diferença'],
    [
      ['Com o medidor aberto em **Plugins**, clique no título amarelo: **1,68:1**, abaixo até do mínimo de texto grande.', 'O editor com o aviso da cantina e o título Cantina aberta em amarelo-claro, circulado. Na aba Contraste, a medida 1,68:1, circulada, e embaixo o aviso de que fica abaixo do mínimo.'],
      ['Clique na hora, em cinza claro: **2,85:1**. Ela parece legível na tela, e o número diz que não é.', 'A linha da hora selecionada e circulada, em cinza claro. A aba Contraste mostra a medida 2,85:1, circulada.'],
    ],
  ),
  t(
    'analisar-uma-peca',
    'Analisar uma peça',
    'Olhar cada princípio, dizer se funciona ou falha, e apontar onde.',
    [
      'Analisar uma peça é olhar princípio por princípio e responder três coisas: funciona ou falha? **Onde** isso se vê? E por quê? Apontar o lugar é o que separa análise de opinião: "o título some na foto" se mostra com o dedo.',
      'Um roteiro de três perguntas cobre o essencial. **Hierarquia**: o título é o maior, sozinho? Quantos degraus a peça tem? **Contraste**: toda letra se lê sobre o que está atrás dela — inclusive a que está em cima de foto? **Alinhamento**: cada linha se apoia numa borda que outra também usa? Para cada uma, escreva funciona ou falha, onde, e por quê.',
      'Peças **bem resolvidas** acertam em tudo. Peças **mal resolvidas** erram em quase tudo, e costumam errar junto: quem não pensou na hierarquia também não pensou no alinhamento. A peça mais interessante é a **discutível**: acerta em quase tudo e erra num lugar só — e é aprovada por quem olha de relance.',
      'Quando falha, aponte o elemento que falha, e não qualquer um. Dizer que o contraste falha apontando o rodapé, quando o que não se lê é o título, acerta a conclusão e erra o lugar. As mesmas ferramentas dos módulos anteriores servem aqui: o campo X conta o alinhamento, o Corpo conta os degraus, e o medidor conta o contraste.',
    ],
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
      'O requisito pede a peça anterior **e** a nova. O jeito de garantir isso no editor é **duplicar a prancha** antes de mexer: o botão **Duplicar prancha** fica embaixo da lista de pranchas, e a cópia aparece com "(cópia)" no nome. Uma fica como chegou, a outra é refeita. Mexer na única que existe e depois tentar lembrar como era não funciona.',
      'Refazer não é reescrever. O convite precisa continuar dizendo as mesmas coisas — data, hora, lugar, quem convida. Apagar uma linha "porque atrapalhava" deixa a peça bonita e sem a informação que ela existia para dar.',
      'Uma ordem que ajuda: primeiro a **hierarquia** (o que é título, o que é segundo degrau), depois o **alinhamento** (uma borda só), depois o **contraste** (toda cor que se lê) e por fim o **espaço** (margem e vãos). Cada passo facilita o seguinte.',
      'No convite do batismo, por exemplo, isso dá: o título cursivo amarelo vira título Georgia negrito, 40; a data, que estava do tamanho do título, fica com data 22 negrito, o resto 18; os seis centros diferentes vão todos para a borda esquerda; a hora, que mede 2,85:1, fica com hora em #333333; e o nome do clube, colado no topo, desce para o pé, em 14.',
    ],
    'Duplique antes do primeiro clique. A versão anterior é parte da entrega.',
    ['versão anterior', 'refazer'],
    [
      ['Antes de mexer no convite, aperte **Duplicar prancha**, embaixo da lista de pranchas.', 'O editor com o convite dos 15 anos do clube, ainda com o título amarelo e as linhas centradas. O botão Duplicar prancha, à esquerda, está circulado.'],
      ['A lista ganha **Convite do aniversário (cópia)**, já aberta. A original fica intocada, e é na cópia que se refaz.', 'A lista de pranchas circulada, com Convite do aniversário e, embaixo, Convite do aniversário (cópia), selecionada.'],
    ],
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
      'O **medidor de contraste** do editor faz a conta: abra-o em **Plugins**, clique num texto, e ele diz a razão entre a cor da letra e a cor que está atrás dela, e se fica acima ou abaixo do mínimo. "Acho que está bom" não é medir. Sobre o branco, o verde quase preto #1F2A24 mede 14,84:1 e o #555555 mede 7,46:1, os dois com folga; o #767676 mede 4,54:1 — passa raspando —; o #808080, que parece quase igual, mede 3,95:1 e não passa para texto comum; e o #999999 mede 2,85:1 e não passa nem para texto grande.',
      'Sobre foto, o fundo não é uma cor só: é tudo o que a foto tem por baixo da letra. O medidor mostra as cores de trás e vale o pior trecho. O título branco do campori mede 16,69:1 contra a parte escura da fogueira e 1,63:1 contra a parte clara — e é na parte clara que ele some.',
    ],
    'Meça a peça inteira, texto por texto. É o texto que você esqueceu de medir que não se lê.',
    ['razão de contraste', '4,5:1', 'medidor'],
    [
      ['Em **Plugins › Medidor de contraste**, a aba **Contraste** aparece ao lado de Cores e espera um texto: "clique num texto da prancha para medir".', 'O editor com o aviso da cantina e a aba Contraste aberta e circulada, ainda sem medida, com a instrução de clicar num texto.'],
      ['O texto em #767676: **4,54:1**. Passa no mínimo de 4,5, raspando.', 'A linha Pastel, suco, pipoca e água gelada selecionada e circulada. A medida 4,54:1 está circulada, com a nota de que o texto é normal e o mínimo é 4,5:1.'],
      ['O texto em #808080, que a olho parece igual: **3,95:1**. Abaixo do mínimo — e só o número mostrou.', 'A linha seguinte, O dinheiro vai para a viagem das unidades, selecionada e circulada. A medida 3,95:1 está circulada, com o aviso Abaixo do mínimo.'],
    ],
  ),
  t(
    'a-cor-nao-carrega-sozinha',
    'A cor não carrega sozinha',
    'Informação essencial precisa de um segundo sinal além da cor.',
    [
      'Cerca de uma em cada doze pessoas com cromossomo XY tem algum tipo de daltonismo, e o mais comum confunde **vermelho e verde**. Numa lista em que só a cor do ponto diz quem confirmou e quem não vai, essas pessoas não conseguem ler a informação mais importante da peça.',
      'E não são só elas. A lista impressa em preto e branco, a cópia tirada na secretaria, o celular com o brilho no mínimo: em todos esses casos a cor some e a informação vai junto. O verde e o vermelho da escala da cantina, que parecem tão diferentes, medem só 1,17:1 entre si — a diferença é só de matiz.',
      'O editor mostra isso: em **Exibir**, **Simular visão** tem **Deuteranopia (verde e vermelho)** e **Tons de cinza**, que pintam a prancha como quem tem esse daltonismo a veria, ou como sairia numa cópia sem cor. Use antes de entregar.',
      'A solução não é tirar a cor: é dar um **segundo sinal**. Uma palavra ("confirmou", "não vai"), um símbolo diferente, um padrão. A cor continua ajudando quem a vê, e a informação chega a todo mundo.',
    ],
    'Se a informação some quando você imprime a peça em preto e branco, ela estava só na cor.',
    ['daltonismo', 'segundo sinal'],
    [
      ['A lista da caminhada com **só a cor**: verde é quem confirmou, vermelho é quem não vai, amarelo é quem não respondeu.', 'O editor com a lista Caminhada de sábado: cinco nomes, cada um com um ponto colorido à esquerda, verde, vermelho ou amarelo. A coluna de pontos está circulada.'],
      ['Em **Exibir › Deuteranopia**, o verde e o vermelho viram o mesmo marrom-oliva. Ana Clara e Davi ficam iguais.', 'A mesma lista com a simulação de deuteranopia ligada. Os pontos circulados de quem confirmou e de quem não vai saem da mesma cor; só o amarelo continua diferente. A barra de status diz Simulando deuteranopia.'],
      ['Na prancha **Cor e palavra**, cada nome traz o que aconteceu escrito. Com a simulação ainda ligada, a lista se lê inteira.', 'A prancha Cor e palavra com a simulação ligada. Os nomes circulados dizem Ana Clara — confirmou, Davi — não vai, Lucas — sem resposta, Sara — confirmou e Tiago — não vai.'],
    ],
  ),
  t(
    'apresentar-ao-examinador',
    'Apresentar ao examinador',
    'O que levar, e o que dizer de cada peça.',
    [
      'O requisito 7 pede apresentar as análises e as peças. Leve cinco coisas: as **três peças analisadas**, com o que você escreveu de cada uma; a **paleta de cinco cores**, com o porquê de cada cor; o **par de famílias**, com a explicação; o **convite antes e depois**, lado a lado — as duas pranchas do mesmo arquivo —; e a **medida de contraste** da sua peça, com o número que o medidor deu.',
      'Na apresentação, aponte na peça. "O título some aqui, na parte clara da foto" convence mais do que qualquer adjetivo. E diga o que você mudou e por quê — cada mudança do convite responde a um princípio, e a ordem em que você mexeu é uma boa ordem para contar.',
      'Se o examinador perguntar de uma escolha que você não sabe justificar, diga isso. Saber que uma escolha foi no gosto é parte de aprender a fazer as próximas no princípio.',
    ],
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
