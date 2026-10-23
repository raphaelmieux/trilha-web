import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DA_IDENTIDADE_VISUAL as Q } from './questoesDaIdentidadeVisual';

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
 * ── Os números ──────────────────────────────────────────────────────────
 * Os que a teoria cita — contrastes, larguras mínimas, a área de proteção —
 * saem do mesmo motor que confere as lições, e
 * `exemplosDaIdentidadeVisual.test.ts` os confere.
 */

const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], exemplo: string, atencao: string, marcas: string[],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, exemplo, exemploComo: 'texto' as const, atencao, marcas,
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
      'Toda identidade começa num **conceito**: o que a marca deve comunicar, e a quem. Sem ele, cada escolha vira gosto pessoal, e gosto não se defende diante do examinador.',
    ],
    `O conceito da unidade Ipê

  O que comunica:  a unidade que floresce no inverno,
                   firme no seco e unida como a copa
  A quem:          desbravadores de 10 a 12 anos e as famílias
  Três palavras:   firme, alegre, unida`,
    'Público "todo mundo" não é público. Marca feita para todos não fala com ninguém.',
    ['identidade visual', 'conceito'],
  ),
  t(
    'tres-palavras',
    'As três palavras',
    'Três palavras que decidem cada escolha da marca: a forma, a cor e a letra.',
    [
      'O conceito vira ferramenta quando cabe em **três palavras**. Diante de duas opções, a pergunta deixa de ser "de qual eu gosto?" e passa a ser "qual diz melhor firme, alegre e unida?".',
      'Prefira palavras que se desenham. "Firme" pede base larga e linhas retas; "alegre" pede cor viva e curva; "unida" pede formas que se encostam. "Legal" e "bonita" não dizem nada sobre o desenho.',
      'As palavras também servem depois: na defesa, cada uma precisa aparecer em algum lugar da marca, e quem defende aponta onde.',
    ],
    `Palavra       O que ela pede no desenho

  firme         base larga, tronco reto
  alegre        cor viva, forma redonda
  unida         copa inteira, sem partes soltas`,
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
      'As primeiras ideias costumam ser as óbvias — a árvore inteira, a letra do nome. As boas aparecem lá pelo sexto ou sétimo rascunho, quando as óbvias acabaram.',
      'Rascunho é pequeno e rápido: do tamanho de uma moeda, sem apagar. Desenhar pequeno já mostra o que vai sumir quando a marca for para o crachá.',
    ],
    `Dez rascunhos, uma folha só

  1 copa sobre tronco       6 flores caindo
  2 folha com nervuras      7 sol atrás da copa
  3 flor vista de cima      8 árvore num escudo
  4 árvore com raízes       9 mão com uma flor
  5 letra I virando tronco 10 galho torto`,
    'Não apague o que não gostou. O rascunho descartado é o que você vai explicar na defesa.',
    ['rascunho', 'papel'],
  ),
  t(
    'escolher-e-descartar',
    'Escolher um, e dizer por que os outros não',
    'Cada descarte tem um motivo, e o motivo sai do conceito.',
    [
      'Um só segue para o computador. Para escolher, releia as três palavras e pergunte qual rascunho diz as três com menos traços.',
      'Cada um que fica para trás precisa de um **motivo próprio**: "as raízes viram rabisco quando a marca fica pequena" é motivo; "não ficou bom" não é, e copiar a mesma frase nove vezes não justifica nenhum.',
      'Os motivos costumam cair em poucas famílias: some quando fica pequeno, parece com a marca de outro, não diz uma das palavras, ou é difícil de repetir igual. Reconhecer a família ajuda a não cair nela de novo.',
    ],
    `Rascunho 4 — árvore com raízes
  Por que não: as raízes viram rabisco
               quando a marca fica pequena.

  Rascunho 7 — sol atrás da copa
  Por que não: é a marca de três outros clubes.`,
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
      'O **símbolo** é o desenho: a copa e o tronco do ipê. Ele funciona sozinho, sem palavra nenhuma, e é o que vai no ícone do grupo da unidade.',
      'O **logotipo** é o nome escrito de um jeito próprio: "Ipê", numa letra e numa cor escolhidas. Ele é texto, mas não é qualquer texto — é sempre a mesma letra, o mesmo peso, a mesma cor.',
      'A **assinatura** é o símbolo e o logotipo juntos, numa posição fixa um do outro. No programa ela vira um **grupo**, para que os dois andem juntos: mover, copiar e mudar de tamanho a assinatura leva os dois de uma vez.',
    ],
    `A assinatura da unidade Ipê

  [ copa e tronco ]  Ipê
     símbolo         logotipo
  └──────── assinatura ────────┘`,
    'Muita gente chama tudo de "logo". No manual, use os três nomes: cada um tem regra própria.',
    ['símbolo', 'logotipo', 'assinatura'],
  ),
  t(
    'do-papel-ao-vetor',
    'Do papel ao vetor',
    'O rascunho escolhido é redesenhado com formas simples, e não copiado traço a traço.',
    [
      'Finalizar o símbolo é redesenhá-lo **em vetor**, com as ferramentas da CC-DG002: elipse, retângulo, caneta. Vetor porque a marca vai do carimbo de dois centímetros à faixa de três metros.',
      'Redesenhar não é copiar o traço da mão: é achar as **formas simples** que estão por trás dele. A copa do rascunho, toda irregular, vira uma elipse; o tronco vira um retângulo.',
      'Depois de desenhar, veja o símbolo em **16, 32 e 64 pixels**. O que some em 16 é detalhe demais.',
    ],
    `O símbolo da Ipê em vetor

  Copa:    elipse, 120 × 100, roxa
  Tronco:  retângulo, 16 × 50, marrom
  Duas formas, que sobrevivem ao carimbo`,
    'O cinza que o editor dá a toda forma nova não é cor da marca. Pinte cada forma de propósito.',
    ['vetor', 'formas simples'],
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
      'A **versão monocromática** é a marca inteira numa cor só — preta, ou qualquer cor que se leia. É a do carimbo, da gravação, da cópia em preto e branco e do bordado de uma linha.',
      'A **versão negativa** também tem uma cor só, mas **clara sobre fundo escuro**: a marca branca na camiseta verde, ou sobre uma foto à noite. É uma versão própria porque a colorida, sobre fundo escuro, some.',
    ],
    `O contraste da marca sobre a camiseta verde-escura

  Copa roxa:        1,8:1  — não se lê
  Marca em branco:  12,6:1 — se lê de longe`,
    'Cada versão vai numa prancha própria. Pintar a original de preto apaga a colorida.',
    ['versão monocromática', 'versão negativa'],
  ),
  t(
    'uma-cor-e-pequena',
    'Por que funcionar numa cor só e pequena',
    'Onde a marca mais aparece é justamente onde ela tem menos recurso.',
    [
      'A marca de uma unidade vai parar no carimbo, no bordado da faixa, na cópia em preto e branco do aviso e no ícone pequeno do grupo. Em nenhum desses lugares há muitas cores ou muito espaço.',
      'Uma marca que só funciona colorida e grande some exatamente onde mais aparece. Por isso o teste é feito ao contrário: se ela se reconhece numa cor só e pequena, vai funcionar em todo o resto.',
      'É também por isso que a cor escolhida precisa de contraste. O ipê-amarelo seria o mais famoso, mas amarelo sobre papel branco dá **1,8:1**: a copa quase desaparece. O roxo dá **7,0:1**.',
    ],
    `Contraste sobre papel branco

  Amarelo do ipê-amarelo:  1,8:1
  Roxo do ipê-roxo:        7,0:1`,
    'Cor que só funciona na tela do computador de quem desenhou não é cor de marca.',
    ['uma cor', 'tamanho reduzido'],
  ),
];

/* ── Módulo 5: paleta e tipografia ────────────────────────────────────────── */

const PALETA: TopicoDeVereda[] = [
  t(
    'a-paleta',
    'A paleta da identidade',
    'As cores da marca, escritas em código, cada uma com um papel.',
    [
      'A **paleta** é a lista das cores da identidade, cada uma com o código dela — o hexadecimal, como #7B3F98. Escrever o código é o que faz o roxo do crachá ser o mesmo roxo da camiseta.',
      'Cada cor tem um **papel**: fundo, texto, destaque, apoio. A cor de texto precisa se ler sobre a cor de fundo a **4,5:1** ou mais, senão o manual e os avisos da unidade saem ilegíveis.',
      'Toda cor que a marca usa precisa estar na paleta. Preto e branco valem sempre, porque são as cores das versões de uma cor.',
    ],
    `A paleta da unidade Ipê

  Fundo      #FFF8E7   creme
  Texto      #1F2A24   quase preto
  Destaque   #7B3F98   roxo da copa
  Apoio      #1B4D3E   verde do logotipo
  Neutro     #6B4226   marrom do tronco`,
    'Uma cor parecida não é a mesma cor. "Um roxo qualquer" no cartaz já é uma marca diferente.',
    ['paleta', 'código de cor'],
  ),
  t(
    'a-tipografia',
    'A tipografia da identidade',
    'No máximo duas famílias de letra: uma para títulos, uma para texto corrido.',
    [
      'A **tipografia** da identidade diz quais letras se usam e onde. A regra mais segura é **duas famílias no máximo**: uma para títulos — muitas vezes a do logotipo — e uma boa de ler para o texto corrido.',
      'Três famílias ou mais fazem cada peça parecer de um lugar diferente. E família decorativa no texto corrido cansa o olho em três linhas.',
      'O logotipo usa sempre a mesma letra. Trocar a fonte do nome, mesmo por uma parecida, é trocar a marca.',
    ],
    `A tipografia da Ipê

  Títulos:        Trebuchet MS, negrito — a do logotipo
  Texto corrido:  Georgia, 14 — boa de ler pequena`,
    'Fonte que só existe no seu computador não serve para a identidade: quem abrir o arquivo em outro lugar vai ver outra letra.',
    ['tipografia', 'família de letra'],
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
      'Ela se mede em **fração da altura do símbolo**, e não em centímetros: assim ela acompanha a marca em qualquer tamanho. Meia altura de símbolo é uma escolha comum.',
      'O fundo não invade. A marca pode pousar sobre a cor da camiseta ou sobre uma foto — o que não pode é um objeto entrar pela metade na área.',
    ],
    `A área de proteção da Ipê

  Símbolo: 140 de altura
  Proteção: meia altura = 70 em volta, nos quatro lados
  Em qualquer tamanho, a mesma fração`,
    'Encostar a marca na borda do crachá também invade: a borda da peça conta.',
    ['área de proteção'],
  ),
  t(
    'tamanho-minimo',
    'Tamanho mínimo de aplicação',
    'A menor largura em que a assinatura ainda se lê.',
    [
      'Todo desenho tem um tamanho abaixo do qual ele vira mancha. O **tamanho mínimo** é a menor largura em que a assinatura ainda se lê, e ele vai escrito no manual para ninguém usá-la menor.',
      'Quem costuma mandar é a **letra**: ela some antes da forma. Na assinatura da Ipê, o logotipo tem corpo 56 numa assinatura de 300 de largura; a letra chega a 7 pixels — o menor que ainda se lê — com **38** de largura.',
      'O mínimo declarado não pode ser menor do que o medido, senão permite uma marca ilegível; nem tão maior, senão proíbe a marca no crachá, onde ela cabia.',
    ],
    `O mínimo da assinatura da Ipê

  Logotipo: corpo 56 numa largura de 300
  Letra a 7 pixels: 7 ÷ 56 × 300 = 37,5
  Tamanho mínimo medido: 38 pixels de largura`,
    'Abaixo do mínimo, muitas marcas usam só o símbolo, sem o logotipo. É uma versão reduzida, e também vai no manual.',
    ['tamanho mínimo'],
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
      'Cada peça pede uma decisão. Na camiseta verde-escura, a colorida não se lê: vai a negativa. No crachá, o espaço é pouco: a marca diminui, sem passar do mínimo e sem encostar na foto. No post, a foto é escura: negativa de novo, longe da chamada.',
      'A assinatura chega às peças **copiada e colada**, nunca redesenhada: redesenhar a cada peça é como a marca começa a mudar sem ninguém perceber.',
    ],
    `Onde vai cada versão

  Camiseta verde-escura   negativa, branca
  Crachá branco           colorida, pequena
  Post sobre foto escura  negativa, longe da chamada`,
    'Mudar o tamanho pela largura do grupo mantém a proporção. Puxar só uma forma estica a marca.',
    ['aplicação', 'peças'],
  ),
  t(
    'conferir-a-peca',
    'Conferir a peça antes de entregar',
    'Quatro perguntas, sempre as mesmas.',
    [
      'Antes de dar uma peça por pronta, quatro perguntas: a marca **se lê** sobre o que está atrás dela? Ela está **inteira**, sem esticar? A **área de proteção** está vazia? Ela está **acima do mínimo**?',
      'As quatro saem do manual, e é para isso que ele existe: qualquer pessoa do clube consegue conferir, sem precisar de quem desenhou a marca por perto.',
      'Quando uma pergunta falha, a resposta quase sempre já está no manual: outra versão, outro lugar na peça, ou um tamanho maior.',
    ],
    `Conferindo o crachá

  Se lê?             colorida no branco: sim
  Inteira?           escalada pela largura: sim
  Área vazia?        acima da foto, longe da borda: sim
  Acima do mínimo?   105 de largura, mínimo 40: sim`,
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
      'Um manual curto de **quatro páginas** já resolve: uma com as três versões, uma com as cores e as letras, uma com a área de proteção e o mínimo, e uma com os usos incorretos.',
      'Manual se mostra, e não só se escreve. "Use a negativa sobre fundo escuro" se entende melhor com a negativa desenhada sobre um retângulo escuro, ao lado.',
    ],
    `Um manual de quatro páginas

  1  As três versões
  2  Cores e letras
  3  Área de proteção e tamanho mínimo
  4  Usos incorretos`,
    'Manual que ninguém consegue abrir não protege nada. Exporte em PDF, que abre em qualquer lugar.',
    ['manual de marca'],
  ),
  t(
    'usos-incorretos',
    'Usos incorretos ilustrados',
    'Mostrar o erro desenhado é o jeito mais rápido de ninguém cometê-lo.',
    [
      'O manual mostra também o que **não** fazer, com a marca estragada de propósito. Cada exemplo mostra um erro diferente, porque três exemplos do mesmo erro ensinam um só.',
      'Os erros mais comuns: **esticar** a marca ou só o símbolo; usar uma **cor fora da paleta**; pôr a marca sobre um **fundo que não deixa ler**; trocar a **letra do logotipo**; e deixar um vizinho **dentro da área de proteção**.',
      'Cada exemplo ganha um X ou a palavra "não" por perto, e uma frase curta dizendo o que está errado.',
    ],
    `Três usos incorretos, cada um de um jeito

  ✕ Marca em vermelho      cor fora da paleta
  ✕ Colorida no escuro     fundo que não deixa ler
  ✕ Logotipo em outra letra   fonte trocada`,
    'Estragar a marca no manual é de propósito. Fora do manual, cada um desses é o que a vereda inteira existe para evitar.',
    ['uso incorreto'],
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
      'Defesa boa aponta para o desenho: "a copa redonda é a unidade junta", e não "achei bonito". Gosto não se discute; escolha se explica.',
      'Ensaie em voz alta antes. O que se escreve no caderno é para lembrar, e não para ler.',
    ],
    `Apontando as três palavras

  firme    o tronco reto e a base larga
  alegre   o roxo do ipê que floresce no inverno
  unida    a copa inteira, sem partes soltas`,
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
      'Conte o que ele tinha de bom, o que faltou, e o que você levou dele para a marca final.',
    ],
    `O descarte que mais ensinou

  Rascunho 3 — flor de cinco pétalas
  Bonita no papel; no crachá, as pétalas
  viraram uma mancha só. Aprendi a desenhar
  pensando no tamanho menor.`,
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
