import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DA_IMAGEM_DIGITAL as Q } from './questoesDaImagemDigital';
import { telasDoTopico } from './telas';

/*
 * A vereda CC-DG003 Imagem Digital.
 *
 * ── O que ela é ─────────────────────────────────────────────────────────
 * A terceira da família de Design, e a primeira que abre a foto em vez do
 * desenho. Os cinco termos do requisito 2, a ampliação do 3, as seis
 * demonstrações do 4, a otimização do 5, os direitos do 6 e a edição
 * completa do 7 viram dez lições — nove no editor de foto e uma no caderno,
 * porque o requisito 6 é a decisão antes de baixar e nenhum programa a
 * guarda.
 *
 * ── As fotos são do clube ───────────────────────────────────────────────
 * A do acampamento chega como o celular a tirou: torta, escura, acinzentada,
 * azulada e com uma garrafa no chão. Cada lição conserta uma coisa e a
 * seguinte parte do conserto, que é como uma edição de verdade acontece. A
 * do lenço é a outra: o escudo do clube em cima de uma mesa, para recortar.
 *
 * ── O exemplo é o editor ────────────────────────────────────────────────
 * Os tópicos que ensinam um gesto mostram o gesto: telas do próprio editor
 * de foto, passo a passo, com o controle circulado. A foto das telas é
 * outra — o lago e o emblema de `src/exemplos/fotosDeExemplo.ts` —, porque
 * mostrar a inclinação, o recorte e a cor da placa da foto do acampamento
 * seria escrever na teoria a resposta do laboratório.
 *
 * ── Os números ──────────────────────────────────────────────────────────
 * Os que a teoria cita — pixels, centímetros, quilobytes, a cor que o
 * conta-gotas lê — saem do mesmo motor que o editor usa, e
 * `exemplosDaImagemDigital.test.ts` os confere.
 */

const V = 'CC-DG003';
const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], atencao: string, marcas: string[],
  telas?: [legenda: string, descricao: string][],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, atencao, marcas, ...(telas ? { telas: telasDoTopico(V, id, telas) } : {}),
});

/* ── Módulo 1: o pixel ────────────────────────────────────────────────────── */

const PIXELS: TopicoDeVereda[] = [
  t(
    'o-quadradinho',
    'O quadradinho de cor',
    'Uma foto é uma grade de pixels, e cada pixel é uma cor só.',
    [
      'Uma foto do celular é uma grade de quadradinhos, e cada quadradinho é pintado de uma cor só. Esse quadradinho se chama **pixel**, de *picture element*, elemento da imagem. A foto do lago das telas tem **1800 pixels de largura e 1200 de altura**: são 2.160.000 pixels, e o editor escreve o tamanho no rodapé da janela.',
      'A cor de cada pixel é guardada em três números, de 0 a 255: quanto de **vermelho**, de **verde** e de **azul** a tela acende ali. 255, 255, 255 é branco; 0, 0, 0 é preto. Quem lê esses números é o **conta-gotas**: escolha a ferramenta, clique num ponto da foto, e o painel Info escreve onde se clicou e a cor que está lá.',
      'No céu do lago, o conta-gotas lê **R 118   G 136   B 155**: um pouco mais de azul que de vermelho, um azul acinzentado. Repare que é um céu de dia claro lido como cinza-azulado — é o primeiro sinal de que a foto chegou escura, e a lição de luz e cor volta a ele.',
      'A **resolução** é quantos pixels a imagem tem. Ela diz quanto detalhe a câmera conseguiu guardar, e mais nada: uma foto de 1800 pixels de largura tem 1800 colunas de cor, nem uma a mais.',
    ],
    'Ampliar a foto na tela não muda a resolução. O zoom só mostra os mesmos pixels maiores.',
    ['pixel', 'resolução'],
    [
      ['A foto do lago aberta, e o tamanho dela no rodapé: 1800 × 1200 px.', 'Editor de foto com a paisagem de um lago — céu, morros, água com uma canoa vermelha, uma placa branca, uma árvore e um cone na grama. O rodapé, em destaque, diz 1800 × 1200 px, 72 ppi.'],
      ['Conta-gotas no céu: o painel Info escreve a posição e os três números da cor.', 'A ferramenta Conta-gotas em destaque na barra da esquerda e, no painel Info, também em destaque, o texto: x 900, y 150 — R 118 G 136 B 155.'],
    ],
  ),
  t(
    'ampliar-a-foto',
    'Por que a foto ampliada borra',
    'Para aumentar, o programa precisa inventar os pixels que faltam.',
    [
      'O emblema da unidade foi fotografado com 1000 pixels de largura, mas chegou por mensagem como uma miniatura de **200 pixels**. Ampliada a **800%** no menu Exibir, ela mostra o que é: uma escada de quadrados. Cada degrau da borda é um pixel, e não há nada entre um e outro.',
      'Em **Imagem › Tamanho da imagem**, com **Reamostrar** marcado, dá para pedir 1000 pixels de largura. É pedir cinco vezes mais em cada direção: cada pixel de antes vira **25** depois. Um foi fotografado; os outros 24 o programa inventa, fazendo a média entre os vizinhos.',
      'Média entre o amarelo da borda e o cinza do piso é um amarelo sujo que não existia na foto. Por isso a borda, que era um degrau nítido, vira uma faixa borrada. Em **Exibir › Antes e depois**, o emblema original e o ampliado ficam lado a lado, com os mesmos 1000 pixels: o da esquerda é nítido; o da direita é borrado, e nenhum controle o devolve.',
      'O vetor da CC-DG002 não sofre isso porque não guarda pixels: guarda a receita da forma. Ampliado, ele refaz a conta no tamanho novo e a borda continua lisa. A foto não tem receita para refazer.',
    ],
    'Nenhum programa devolve detalhe que a câmera não gravou. Ampliar sempre inventa, e inventar sempre borra.',
    ['ampliar', 'pixel e vetor'],
    [
      ['A miniatura de 200 pixels a 800%: cada degrau da borda é um pixel.', 'O emblema — um círculo verde com borda amarela e um pinheiro branco — tão ampliado que a borda vira uma escada de quadrados. O rodapé, em destaque, diz 200 × 160 px e Zoom 800%.'],
      ['Imagem › Tamanho da imagem: 1000 pixels de largura, com Reamostrar marcado.', 'A caixa Tamanho da imagem aberta, com Largura 1000, Altura 800 e Resolução 72. O campo de largura e a caixa Reamostrar, marcada, estão em destaque.'],
      ['Exibir › Antes e depois: o original à esquerda, o ampliado à direita, borrado.', 'Dois emblemas lado a lado, do mesmo tamanho. O da esquerda, marcado Antes, tem a borda e o pinheiro nítidos; o da direita, marcado Depois, tem as bordas borradas.'],
    ],
  ),
];

/* ── Módulo 2: nivelar e recortar ─────────────────────────────────────────── */

const RECORTAR: TopicoDeVereda[] = [
  t(
    'o-horizonte',
    'O horizonte torto',
    'Girar a foto até a linha do chão ficar reta.',
    [
      'Quem tira foto segurando o celular com uma mão quase sempre inclina um pouco. Numa paisagem isso se vê na hora: a linha da margem do lago desce de um lado e sobe do outro, e a árvore, que cresceu reta, parece cair.',
      'A ferramenta **Recortar** abre o painel *Recortar e endireitar*. O campo **Endireitar (graus)** gira a foto pelo número que se escreve, e a grade de terços que aparece por cima ajuda a ver quando a linha da margem ficou paralela a uma das linhas da grade. A foto do lago saiu inclinada 2,5 graus para um lado, e endireita escrevendo **2,5**: o mesmo tanto, para o outro lado.',
      'Girar uma foto retangular abre **quatro triângulos vazios** nos cantos, onde não havia foto nenhuma. O editor os desenha como um xadrez cinza e branco, que é como todo programa mostra o vazio — e é por isso que girar e recortar andam juntos.',
    ],
    'Endireitar pelo morro ou pela placa engana. O que precisa ficar reto é o horizonte — no lago, a margem.',
    ['endireitar', 'cantos vazios'],
    [
      ['A ferramenta Recortar na foto torta: a margem do lago desce para a direita.', 'A foto do lago com a grade de terços por cima. A margem entre a água e a grama está inclinada, e a árvore da direita pende.'],
      ['Endireitar 2,5 graus: a margem fica reta, e os cantos viram xadrez.', 'A mesma foto girada: a margem agora é paralela às linhas da grade, e quatro triângulos de xadrez aparecem nas beiradas. O campo Endireitar (graus), com 2.5, está em destaque.'],
    ],
  ),
  t(
    'o-recorte',
    'Recortar sem cortar o assunto',
    'O recorte tira os cantos vazios e o que sobra nas beiradas.',
    [
      'Recortar é escolher um retângulo dentro da foto e jogar fora o resto. No mesmo painel, os campos **X**, **Y**, **Largura** e **Altura do recorte** dizem onde o retângulo começa e que tamanho ele tem, em pixels, e o editor escurece tudo o que vai sair. Depois de endireitar, o retângulo precisa ficar **inteiro dentro da parte com foto**, senão algum dos triângulos de xadrez continua no canto.',
      'No lago endireitado, o recorte começa em **x 60, y 50** e tem **1680 de largura e 1100 de altura**: fica longe dos quatro triângulos e não corta nem a placa nem a árvore. **Aplicar recorte** joga o resto fora, e o rodapé passa a dizer 1680 × 1100 px.',
      'O recorte também é escolha de enquadramento. A **regra dos terços** divide o quadro em três por três, e pôr o assunto perto de uma das linhas costuma deixar a foto mais viva do que pô-lo no meio exato. O que não se pode é cortar o assunto: uma canoa com a ponta de fora parece erro de quem tirou a foto, e não escolha.',
    ],
    'Recortar joga pixels fora para sempre no arquivo exportado. Guarde a foto original antes.',
    ['recortar', 'regra dos terços'],
    [
      ['Os quatro campos do recorte: o retângulo claro fica longe dos cantos vazios.', 'A foto endireitada com um retângulo claro por dentro e o resto escurecido; o xadrez dos cantos fica todo na parte escura. Os campos X do recorte 60, Y 50, Largura 1680 e Altura 1100 estão em destaque.'],
      ['Aplicar recorte: a foto reta, sem canto vazio, com 1680 × 1100 px.', 'A foto do lago reta, ocupando a área inteira, sem nenhum xadrez nas beiradas. O rodapé, em destaque, diz 1680 × 1100 px.'],
    ],
  ),
];

/* ── Módulo 3: luz e cor ──────────────────────────────────────────────────── */

const AJUSTES: TopicoDeVereda[] = [
  t(
    'o-histograma',
    'O histograma',
    'O desenho que conta quantos pixels há em cada tom, do preto ao branco.',
    [
      'O **histograma** é um gráfico de barras: à esquerda, o preto; à direita, o branco; a altura de cada barra é quantos pixels da foto têm aquele tom. Ele fica num painel da direita do editor e mostra o que o olho às vezes não percebe na tela.',
      'Foto **escura** tem as barras amontoadas no meio para a esquerda, sem nada encostando no branco. Foto **sem contraste** tem um morro estreito, sem pretos nem brancos. Foto **estourada** tem uma parede na direita: pixels que viraram branco puro e perderam todo o detalhe.',
      'O histograma acompanha o controle antes de aplicar. Subir a **Exposição** para 0,8 empurra as barras para a direita, abrindo espaço entre elas. Subir até 2,5 empurra demais: aparece a parede no branco, e na foto o céu e a placa viram uma mancha branca sem nada dentro.',
    ],
    'Branco estourado não volta. Escurecer depois só deixa o branco cinza, sem o detalhe que se perdeu.',
    ['histograma', 'estourado'],
    [
      ['A foto escura e o histograma dela: tudo no meio, nada encostando no branco.', 'A foto do lago reta e escura, com o painel Histograma em destaque: as barras se amontoam no meio do gráfico, e a ponta direita está vazia.'],
      ['Exposição 0,8: as barras andam para a direita, e a foto clareia.', 'A foto mais clara. O campo Exposição, com 0.8, e o Histograma estão em destaque: as barras se espalharam mais para a direita.'],
      ['Exposição 2,5: uma parede no branco, e o céu e a placa viram mancha.', 'A foto quase branca, com céu e placa sem detalhe nenhum. O campo Exposição, com 2.5, e o Histograma estão em destaque: há uma barra alta encostada na ponta direita.'],
    ],
  ),
  t(
    'os-tres-ajustes',
    'Exposição, contraste e temperatura',
    'Três controles diferentes, e cada um conserta uma coisa.',
    [
      '**Exposição** clareia ou escurece a foto inteira, como se a câmera tivesse deixado entrar mais ou menos luz. É a primeira a mexer numa foto escura. **Contraste** afasta os tons do meio: os escuros ficam mais escuros, os claros mais claros, e uma foto acinzentada volta a ter força. **Temperatura** puxa as cores para o azul, com número negativo, ou para o laranja, com positivo.',
      'Para saber se a cor ficou certa, procure algo que é **branco de verdade** e leia com o conta-gotas. Na placa do lago ele lê **R 177   G 169   B 160**: escuro, e com mais vermelho que azul — a foto saiu quente, amarelada. Num branco, os três números precisam ficar altos e parecidos.',
      'Os três controles moram no painel **Ajustes**, e a foto já mostra o efeito enquanto se escreve, antes de aplicar. Para a foto do lago: Exposição **0,8**, Contraste **28**, Temperatura **−50**. Depois de **Aplicar ajustes**, o conta-gotas na mesma placa lê **R 240   G 242   B 242**: alto e quase igual nos três, que é o que um branco é.',
    ],
    'Ajuste é melhor aos poucos, olhando o histograma. Puxar o controle até o fim quase sempre estoura alguma coisa.',
    ['exposição', 'contraste', 'temperatura'],
    [
      ['Conta-gotas na placa branca: escura, e com o vermelho na frente.', 'A foto escura e amarelada com o Conta-gotas escolhido. O painel Info, em destaque, diz x 320, y 595 — R 177 G 169 B 160.'],
      ['Exposição 0,8, Contraste 28, Temperatura −50: a foto já mostra o efeito.', 'A foto clara, com o céu azul de dia. Os três campos do painel Ajustes, com 0.8, 28 e -50, estão em destaque, e o botão Aplicar ajustes está ligado.'],
      ['Depois de aplicar, a mesma placa: os três números altos e parecidos.', 'A foto com a luz certa. O painel Info, em destaque, diz x 320, y 595 — R 240 G 242 B 242.'],
    ],
  ),
];

/* ── Módulo 4: tirar o que sobra ──────────────────────────────────────────── */

const REMOVER: TopicoDeVereda[] = [
  t(
    'o-carimbo',
    'O carimbo',
    'Copiar um pedaço bom da foto por cima do pedaço ruim.',
    [
      'Um cone esquecido na grama estraga a foto do lago. Para tirá-lo não adianta apagar: apagar deixa um buraco. É preciso pôr **grama** no lugar dele.',
      'O **Carimbo** faz isso. Escolha a ferramenta e um **Raio do pincel** um pouco maior que metade do cone — 45 pixels, nas telas. O primeiro clique define a **origem**, um pedaço de grama limpa ao lado, e o painel escreve onde ela ficou. Depois, cada pincelada sobre o cone copia a grama da origem para ali, e a origem anda junto com o pincel, sempre à mesma distância.',
      'Escolher a origem perto e na mesma altura importa: grama de longe tem outro tamanho e outra luz, e o remendo aparece. Se a origem cair num lugar ruim, **Definir origem** deixa escolher outra.',
    ],
    'Clicar várias vezes no mesmo ponto repete o mesmo pedaço de grama, e o olho acha o desenho repetido.',
    ['carimbo', 'origem'],
    [
      ['Carimbo com raio 45: o primeiro clique, na grama ao lado do cone, é a origem.', 'A foto do lago com a ferramenta Carimbo escolhida e o cone laranja na grama, à direita. O painel Carimbo, em destaque, diz Raio do pincel 45 e Origem em 1290, 955.'],
      ['Uma pincelada de cima a baixo: o cone some, e a grama continua grama.', 'A mesma foto sem o cone; no lugar dele há grama com a mesma textura do resto.'],
    ],
  ),
  t(
    'remendo-liso',
    'O remendo liso',
    'Pintar por cima tampa, mas deixa uma mancha sem textura.',
    [
      'O jeito mais rápido de esconder o cone é pegar o **Pincel**, escolher em **Cor do pincel** um verde parecido com a grama e pintar por cima. O cone some — e no lugar dele fica uma **mancha lisa**, de um verde só, que se vê de longe.',
      'Grama de verdade não tem um verde só: cada folha tem um tom. É essa variação, a **textura**, que o olho usa para reconhecer grama. Uma mancha sem ela aparece, mesmo com a cor certa.',
      'O carimbo copia a textura junto com a cor, e é por isso que o remendo dele some. O pincel serve para outras coisas — e para pintar a máscara, na lição de camadas.',
    ],
    'Tirar coisa de uma foto que vai ser usada como prova ou documento é mentir com ela. Aqui o cone é lixo esquecido, e não parte do que aconteceu.',
    ['textura', 'pincel'],
    [
      ['O Pincel verde no lugar do cone: some o cone, fica uma mancha lisa.', 'A foto do lago com uma mancha oval de verde liso onde estava o cone, sem a textura da grama em volta. O Pincel e o campo Cor do pincel, verde, estão em destaque.'],
    ],
  ),
];

/* ── Módulo 5: camadas e máscara ──────────────────────────────────────────── */

const CAMADAS: TopicoDeVereda[] = [
  t(
    'as-camadas',
    'Camadas',
    'Folhas transparentes empilhadas, e cada uma pode ser mexida sozinha.',
    [
      'Uma **camada** é uma folha da imagem. O que está na de cima aparece por cima do que está na de baixo, como desenhos em papel vegetal empilhados. Uma foto recém-aberta tem uma camada só, chamada **Fundo**.',
      'O primeiro gesto de quem edita com cuidado é **Camada › Duplicar camada** e trabalhar na cópia. O painel Camadas passa a mostrar duas: **Fundo (cópia)** em cima, escolhida, e **Fundo** embaixo. O que se fizer agora vai para a cópia; o Fundo fica como chegou.',
      'O olho ao lado de cada camada a esconde e a mostra. Se a cópia der errado, basta escondê-la — a foto original está lá embaixo, intocada. Quem ajusta direto na camada única não tem essa volta, a não ser desfazer passo por passo.',
    ],
    'Achatar a imagem junta todas as camadas numa só. Depois disso, a de baixo deixa de existir.',
    ['camada', 'duplicar'],
    [
      ['O menu Camada, com Duplicar camada.', 'O menu Camada aberto sobre a foto do lago, com Duplicar camada em destaque, acima de Adicionar máscara e Achatar imagem.'],
      ['Duas camadas: a cópia em cima, escolhida, e o Fundo intocado embaixo.', 'O painel Camadas, em destaque, com Fundo (cópia) escolhido em cima e Fundo embaixo, cada um com um olho ao lado.'],
    ],
  ),
  t(
    'a-mascara',
    'A máscara',
    'Preto esconde, branco mostra: a máscara diz onde a camada aparece.',
    [
      'A canoa ficou escura contra a água, e clarear a foto inteira estoura o céu. O que se quer é clarear **só a canoa**. Para isso, a cópia clareada ganha uma **máscara**.',
      'São três passos. Duplicar a camada e clarear a cópia inteira — Exposição 1, Aplicar ajustes: o céu estoura, e tudo bem, porque é só a cópia. Escolher a canoa com a **Varinha**, que pega os pixels de cor parecida com o que se clicou. E **Camada › Adicionar máscara**: a máscara nasce da seleção, **branca** onde estava a canoa e **preta** no resto.',
      'Onde a máscara é branca a cópia aparece; onde é preta, ela some e deixa ver o Fundo de baixo. O resultado é a foto como estava, com a canoa mais clara. A máscara continua editável: com **Editar a máscara** escolhido, o pincel pinta nela — preto esconde, branco mostra de novo.',
    ],
    'Apagar com a borracha também esconde, mas não tem volta. Pintar a máscara de preto esconde e deixa o pixel lá.',
    ['máscara', 'varinha'],
    [
      ['A cópia clareada inteira: a canoa ficou boa, e o céu estourou.', 'A foto do lago muito clara, com o céu quase branco. O painel Camadas, em destaque, mostra Fundo (cópia) e Fundo.'],
      ['A Varinha na canoa: só ela fica selecionada.', 'A mesma foto clara com a canoa pintada da cor da seleção. A Varinha e o rodapé, que diz Seleção ativa, estão em destaque.'],
      ['Adicionar máscara: a foto volta, e só a canoa fica mais clara.', 'A foto com a luz normal e a canoa mais clara que antes. O painel Camadas, em destaque, mostra Fundo (cópia) com máscara e os botões Editar a camada e Editar a máscara.'],
    ],
  ),
];

/* ── Módulo 6: transparência ──────────────────────────────────────────────── */

const TRANSPARENCIA: TopicoDeVereda[] = [
  t(
    'o-canal',
    'O canal de transparência',
    'Um quarto número em cada pixel, dizendo o quanto ele cobre.',
    [
      'Além de vermelho, verde e azul, um pixel pode guardar um quarto número: o **canal de transparência**, também chamado de alfa. Zero é transparente — o pixel não cobre nada —, e 255 é opaco. Um pixel com R 200, G 40, B 30 e alfa 255 é vermelho; o mesmo pixel com alfa zero não aparece.',
      'O programa mostra o transparente como um **xadrez cinza e branco**. O xadrez não está na imagem: é o jeito de desenhar o nada, para que se veja onde ele está. Na foto do emblema sem o piso, o xadrez ocupa tudo em volta do círculo.',
      'É o alfa que deixa o emblema ser posto em cima de qualquer fundo — um cartaz verde, uma camiseta azul — sem levar junto o retângulo do piso em que foi fotografado.',
    ],
    'Nem todo formato guarda o quarto número. Exportar no formato errado devolve o fundo, e o piso volta — branco.',
    ['canal de transparência', 'alfa'],
    [
      ['O emblema sem o piso: onde não há nada, o editor desenha xadrez.', 'O emblema circular, verde com borda amarela e pinheiro branco, sobre um xadrez cinza e branco que ocupa toda a área em volta dele.'],
    ],
  ),
  t(
    'tirar-o-fundo',
    'Tirar o fundo',
    'Selecionar o piso, excluir, e exportar num formato com transparência.',
    [
      'A **Varinha** escolhe pixels parecidos com o que se clicou, e a **Tolerância** diz quão parecidos. O piso do emblema não tem um tom só: a luz da janela o deixa claro à esquerda e escuro à direita. Com tolerância **28**, o primeiro clique, no canto da esquerda, pega quase todo o piso e para onde a sombra começa.',
      'Com **Shift**, cada clique **soma** um pedaço à seleção. Um segundo clique, no alto do meio, pega o resto. Sem o Shift, o segundo clique trocaria a seleção em vez de somar, e o primeiro pedaço voltaria a ficar de fora.',
      'Tolerância alta demais escolhe também o que não é piso: com um número grande, o amarelo claro da borda some junto. Baixa demais deixa ilhas de piso sem escolher. O certo está no meio, e se confere olhando a borda.',
      'Com o piso escolhido, **Editar › Excluir** o transforma em transparência. Falta exportar, em **Arquivo › Exportar como**: em **PNG** o emblema sai sem fundo; em **JPG**, que não tem canal de transparência, o fundo volta **branco** — e a prévia da caixa mostra isso, com o antes à esquerda da divisória e o arquivo à direita.',
    ],
    'O JPG fica muito menor, e é justamente o que não serve aqui. Arquivo pequeno não adianta se o fundo volta.',
    ['tolerância', 'PNG'],
    [
      ['Varinha com tolerância 28: um clique pega o piso claro e para na sombra.', 'O emblema sobre o piso, com quase todo o piso pintado da cor da seleção; uma faixa à direita, mais escura, ficou de fora. A Varinha e o campo Tolerância, com 28, estão em destaque.'],
      ['Shift + clique soma o resto: o piso inteiro escolhido.', 'O piso inteiro pintado da cor da seleção, e o emblema de fora. Em destaque, a ajuda do painel: Shift + clique soma à seleção.'],
      ['Exportar como PNG: o emblema sai sem fundo.', 'A caixa Exportar como, com o formato PNG e o tamanho do arquivo em destaque. Na prévia, o emblema aparece sem nada em volta.'],
      ['O mesmo emblema em JPG: o fundo volta branco.', 'A caixa Exportar como com o formato JPG. A prévia, em destaque, mostra à direita da divisória o emblema sobre fundo branco; o tamanho do arquivo também está em destaque.'],
    ],
  ),
];

/* ── Módulo 7: tela e papel ───────────────────────────────────────────────── */

const TAMANHOS: TopicoDeVereda[] = [
  t(
    'pontos-por-polegada',
    'Pontos por polegada',
    'O ppi não muda a imagem: diz em que tamanho ela sai no papel.',
    [
      '**Pontos por polegada** (ppi) é quantos pixels a impressora põe em cada polegada de papel — uma polegada são 2,54 centímetros. Ele é só um número escrito no arquivo, e o rodapé do editor o mostra ao lado do tamanho no papel.',
      'A foto do lago, com 1800 pixels de largura, chega do celular com 72 ppi: o rodapé diz **63,5 cm** de largura no papel. Em **Imagem › Tamanho da imagem**, desmarque **Reamostrar** e escreva **300** em Resolução: a caixa diz **15,2 cm**. Os pixels são os mesmos 1800 — o campo de largura fica travado —; a 300 eles ficam mais apertados, e a impressão sai nítida.',
      'Uma gráfica pede de 240 a 300 ppi para foto. Abaixo disso, os pixels ficam grandes o bastante para se ver no papel.',
    ],
    'Subir o ppi com Reamostrar marcado inventa pixels, como ampliar. A foto não ganha detalhe nenhum.',
    ['ppi', 'reamostrar'],
    [
      ['O rodapé: 1800 × 1200 px a 72 ppi dão 63,5 × 42,3 cm no papel.', 'A foto do lago aberta. O rodapé, em destaque, diz 1800 × 1200 px, 72 ppi, 63,5 × 42,3 cm no papel.'],
      ['Sem reamostrar, 300 ppi: os mesmos pixels saem com 15,2 cm.', 'A caixa Tamanho da imagem com Reamostrar desmarcado e Resolução 300. Em destaque, a caixa desmarcada e a linha No papel: 15,2 × 10,2 cm.'],
    ],
  ),
  t(
    'tela-e-papel',
    'O arquivo da tela e o do papel',
    'A tela só conta pixels; o papel conta pixels por polegada.',
    [
      'A tela **ignora o ppi**. Um celular mostra a foto pelo número de pixels dela, e uma foto de 1080 pixels de largura já enche a tela inteira. Mandar 1680 pixels para o site só deixa a página lenta.',
      'O arquivo para a tela se faz com **Reamostrar marcado**: escreve-se **1080** em Largura, e a altura acompanha sozinha, 707, para a foto não esticar. A caixa diz quanto ela ocupa na memória, que cai junto.',
      'O papel é o contrário: ele precisa de pixels suficientes para o tamanho que vai sair. A foto do lago editada, com **1680 × 1100** pixels, sem reamostrar e a 240 ppi, sai com **17,8 × 11,6 cm** — uma foto de álbum, nítida.',
      'Por isso a mesma imagem vira dois arquivos: um **pequeno**, para a tela, e um **com o ppi certo**, para a gráfica. Os dois partem da mesma edição, e nenhum serve para o outro uso.',
    ],
    'Reduza a cópia, nunca a única que você tem. Do arquivo pequeno não dá para voltar ao grande.',
    ['tela', 'impressão'],
    [
      ['Para a tela: Reamostrar marcado e 1080 pixels de largura.', 'A caixa Tamanho da imagem com Largura 1080, Altura 707 e Reamostrar marcado. A largura e a linha No papel, que diz também a memória, estão em destaque.'],
      ['Para o papel: sem reamostrar, 240 ppi dão 17,8 × 11,6 cm.', 'A caixa Tamanho da imagem com Largura 1680, Altura 1100, Reamostrar desmarcado e Resolução 240. Em destaque, a resolução e a linha No papel: 17,8 × 11,6 cm.'],
    ],
  ),
];

/* ── Módulo 8: formatos e compressão ──────────────────────────────────────── */

const FORMATOS: TopicoDeVereda[] = [
  t(
    'com-e-sem-perda',
    'Compressão com perda e sem perda',
    'Uma guarda tudo de um jeito mais curto; a outra joga fora o que o olho não vê.',
    [
      'Guardar a cor de cada pixel, um por um, ocupa muito: a foto do lago editada em **TIFF**, que guarda assim, tem **5,3 MB**. Comprimir é escrever a mesma coisa com menos bytes. A caixa **Exportar como** diz o tamanho do arquivo antes de exportar, para cada formato escolhido.',
      'A compressão **sem perda** acha repetições e as escreve mais curto, e devolve cada pixel exatamente como era: é a do **PNG**, que deixa a mesma foto com **1,4 MB**. A compressão **com perda** joga fora detalhe miúdo que o olho quase não vê, e o pixel volta parecido, não igual: é a do **JPG**, que na qualidade 85 a deixa com **104 KB**.',
      'A **Qualidade** do JPG diz quanto jogar fora. Na qualidade 5 o arquivo cai para **39 KB** e a prévia mostra o preço: o céu vira faixas e a grama vira **quadradinhos**. Arrastando a divisória da prévia, compara-se o antes e o arquivo no mesmo lugar da foto.',
    ],
    'Cada vez que se abre e salva um JPG de novo, ele perde mais um pouco. Edite sempre a partir do original.',
    ['com perda', 'sem perda'],
    [
      ['TIFF: sem compressão, a foto pesa 5,3 MB.', 'A caixa Exportar como sobre a foto do lago, com o formato TIFF e a linha do tamanho do arquivo em destaque.'],
      ['PNG: sem perda, 1,4 MB.', 'A mesma caixa com o formato PNG e o tamanho do arquivo em destaque.'],
      ['JPG na qualidade 85: com perda, 104 KB, e não se vê diferença.', 'A caixa com o formato JPG e a qualidade 85; o campo de qualidade e o tamanho do arquivo estão em destaque.'],
      ['JPG na qualidade 5: 39 KB, e a prévia mostra os quadradinhos.', 'A prévia da caixa em destaque: à esquerda da divisória a foto lisa, à direita a mesma foto com o céu em faixas e a grama em blocos. O tamanho do arquivo também está em destaque.'],
    ],
  ),
  t(
    'cada-formato-o-seu',
    'Um formato para cada uso',
    'JPG, PNG, WEBP e TIFF: o que cada um guarda, e para que serve.',
    [
      '**JPG** é para foto na tela: com perda, pequeno, sem transparência. **WEBP** é o mais novo: faz o mesmo que o JPG, um pouco menor — a foto do lago fica com **73 KB** —, e também guarda transparência. Navegador antigo e alguns programas não o abrem.',
      '**PNG** é sem perda e guarda transparência: serve para emblema, logotipo e captura de tela, onde a borda precisa ficar nítida e o texto legível. Para foto, ele fica grande demais. **TIFF** é o da gráfica: sem perda e com o ppi escrito. Pesado demais para mandar por mensagem, é o que se entrega para imprimir.',
      'Para a página do clube, a foto do lago passa por dois cortes. Primeiro o de pixels: em Tamanho da imagem, **1200** de largura, que é mais do que a página mostra. Depois o de qualidade: JPG na **75**. O arquivo sai com **47 KB**, contra os 104 KB do JPG de antes — e, na prévia, a diferença não se vê.',
    ],
    'Otimizar é exportar outro arquivo. Salvar por cima do original apaga o "antes" — e o examinador pede os dois.',
    ['JPG', 'PNG', 'WEBP', 'TIFF'],
    [
      ['WEBP: com perda, e menor que o JPG.', 'A caixa Exportar como com o formato WEBP e o tamanho do arquivo em destaque.'],
      ['Reduzida a 1200 pixels e exportada em JPG 75: leve para o site.', 'A caixa Exportar como de uma foto de 1200 pixels de largura, com qualidade 75. O campo de qualidade e o tamanho do arquivo estão em destaque.'],
    ],
  ),
];

/* ── Módulo 9: de quem é a imagem ─────────────────────────────────────────── */

const DIREITOS: TopicoDeVereda[] = [
  t(
    'tres-tipos',
    'Sua, livre ou protegida',
    'Achar uma imagem na internet não quer dizer poder usá-la.',
    [
      'A foto que **você** tirou é sua, e você decide o que fazer com ela. O desenho que um colega fez e mandou para você ver continua sendo **dele**: ele mostrou, não deu.',
      'Toda imagem que alguém criou nasce **protegida** por direito autoral, mesmo sem aviso nenhum escrito. Um mapa achado na busca de imagens, sem licença, é protegido: não dizer nada não é permitir. O logotipo de outro clube também é: ele é a marca de alguém.',
      'Uma imagem de **licença livre** é aquela em que o autor escreveu o que deixa fazer. As licenças **Creative Commons** são as mais comuns: CC0 é domínio público, sem pedir nada; CC BY deixa usar desde que se dê o **crédito** — o nome de quem fez. Uma foto CC BY do Wikimedia Commons é livre, com crédito.',
    ],
    'Pôr "créditos ao autor" numa imagem protegida não a torna livre. Crédito é o que a licença livre pede, não o que a substitui.',
    ['direito autoral', 'Creative Commons'],
  ),
  t(
    'onde-procurar',
    'Onde procurar',
    'Fontes confiáveis dizem a licença de cada imagem.',
    [
      'Uma fonte confiável de imagens é a que diz, **em cada uma**, quem fez e com que licença. O **Wikimedia Commons** e o **Openverse** são assim: cada arquivo tem a página dele, com autor e licença escritos.',
      'A busca de imagens de um buscador acha imagens de qualquer lugar e não garante licença nenhuma. Painéis de imagens salvas por outras pessoas e sites de papel de parede "grátis" repassam imagens que nem sempre eram de quem as postou.',
      'O crédito vai embaixo da imagem e tem três partes: **quem fez**, a **licença** e **onde estava**. É curto: "Foto: Ana Lima, CC BY 4.0, via Wikimedia Commons".',
    ],
    'Na dúvida sobre a licença, não use: procure outra imagem, ou peça autorização a quem fez.',
    ['fontes', 'crédito'],
  ),
];

/* ── Módulo 10: a edição completa ─────────────────────────────────────────── */

const COMPLETA: TopicoDeVereda[] = [
  t(
    'a-ordem',
    'A ordem da edição',
    'Do maior para o menor: primeiro o quadro, depois a luz, por fim os detalhes.',
    [
      'Uma edição tem ordem, e ela não é capricho. Primeiro **endireitar e recortar**: não adianta acertar a luz de um pedaço que vai ser jogado fora. Depois **exposição, contraste e temperatura**, que mexem na foto inteira. Depois os **detalhes**, como o cone esquecido. Por fim, **exportar com outro nome**.',
      'Os detalhes ficam para o fim porque são os menores: não adianta carimbar o que o recorte ainda vai jogar fora, nem escolher a origem do carimbo olhando uma grama que ainda vai mudar de cor.',
      'Cada passo parte do anterior. É por isso que vale guardar o original intocado: ele é o único ponto de onde se pode recomeçar.',
    ],
    'Exportar com o mesmo nome do original apaga o original. Sem ele, não há "antes" para mostrar.',
    ['ordem', 'edição'],
  ),
  t(
    'antes-e-depois',
    'Antes e depois',
    'A edição se mostra lado a lado com a foto como chegou.',
    [
      'O requisito pede para mostrar o estado anterior e o posterior. O jeito honesto é **lado a lado**, no mesmo tamanho: a foto como o celular a tirou, e a editada. No editor, é **Exibir › Antes e depois**.',
      'Lado a lado aparece o que cada passo fez: na foto do lago, o horizonte reto, a luz de dia, a placa branca e os cantos sem nada sobrando. Aparece também o que passou do ponto — um céu estourado ou uma grama verde demais —, e é para isso que se compara.',
      'Na hora de mostrar ao examinador, diga o que mudou em cada passo e por quê. É a mesma pergunta que a lição de teoria faz desde o começo: o que este controle conserta?',
    ],
    'Uma edição boa às vezes nem parece edição. O lado a lado é o que mostra o trabalho que foi feito.',
    ['antes e depois', 'apresentação'],
    [
      ['O menu Exibir, com Antes e depois no fim.', 'O menu Exibir aberto sobre a foto do lago editada, com os níveis de zoom e, no fim, Antes e depois em destaque.'],
      ['As duas lado a lado: torta, escura e quente; reta, clara e com a placa branca.', 'Duas fotos do lago lado a lado. A da esquerda, marcada Antes, está inclinada, escura e amarelada; a da direita, marcada Depois, está reta, clara, com o céu azul e a placa branca.'],
    ],
  ),
];

/* ── Os módulos ───────────────────────────────────────────────────────────── */

export const MODULOS_DA_IMAGEM_DIGITAL: ModuloDeVereda[] = [
  {
    id: 'm1', titulo: 'O pixel',
    resumo: 'Do que uma foto é feita, e por que ela borra quando se amplia.',
    licoes: [
      {
        id: 'm1-teoria', tipo: 'teoria', questoes: Q['m1-teoria'], perguntas: 4,
        titulo: 'Pixel e resolução', resumo: 'A grade de quadradinhos, os três números da cor, e o que ampliar inventa.',
        topicos: PIXELS,
      },
      {
        id: 'm1-lab', tipo: 'foto', licao: 'pixels',
        titulo: 'Olhando a foto de perto',
        resumo: 'Zoom até o pixel, conta-gotas, e a miniatura ampliada três vezes.',
        verificacoes: ['viu-os-pixels', 'leu-um-pixel', 'ampliou-a-foto', 'explicou-por-que-borra'],
      },
    ],
  },
  {
    id: 'm2', titulo: 'O quadro',
    resumo: 'Nivelar o horizonte e recortar sem deixar canto vazio.',
    licoes: [
      {
        id: 'm2-teoria', tipo: 'teoria', questoes: Q['m2-teoria'], perguntas: 4,
        titulo: 'Nivelar e recortar', resumo: 'Girar pelo horizonte, e o recorte que tira os cantos.',
        topicos: RECORTAR,
      },
      {
        id: 'm2-lab', tipo: 'foto', licao: 'recortar',
        titulo: 'Endireitando a foto do acampamento',
        resumo: 'Uma foto torta, quatro cantos vazios, e a barraca que não pode sair.',
        verificacoes: ['nivelou', 'recortou-os-cantos', 'barraca-inteira'],
      },
    ],
  },
  {
    id: 'm3', titulo: 'Luz e cor',
    resumo: 'Exposição, contraste e temperatura, lidos no histograma.',
    licoes: [
      {
        id: 'm3-teoria', tipo: 'teoria', questoes: Q['m3-teoria'], perguntas: 4,
        titulo: 'O histograma e os três ajustes', resumo: 'O que cada controle conserta, e quando passou do ponto.',
        topicos: AJUSTES,
      },
      {
        id: 'm3-lab', tipo: 'foto', licao: 'ajustes',
        titulo: 'Devolvendo a luz da tarde',
        resumo: 'Escura, acinzentada e azulada, e a placa que precisa voltar a ser branca.',
        verificacoes: ['exposicao', 'contraste', 'temperatura'],
      },
    ],
  },
  {
    id: 'm4', titulo: 'O que sobra na cena',
    resumo: 'Tirar um objeto da foto sem deixar remendo.',
    licoes: [
      {
        id: 'm4-teoria', tipo: 'teoria', questoes: Q['m4-teoria'], perguntas: 4,
        titulo: 'O carimbo', resumo: 'Copiar grama boa por cima, e por que pintar não basta.',
        topicos: REMOVER,
      },
      {
        id: 'm4-lab', tipo: 'foto', licao: 'remover',
        titulo: 'Tirando a garrafa do chão',
        resumo: 'Origem ao lado, pinceladas por cima, e o resto intocado.',
        verificacoes: ['garrafa-sumiu', 'sem-remendo', 'resto-intacto'],
      },
    ],
  },
  {
    id: 'm5', titulo: 'Camadas',
    resumo: 'Trabalhar numa cópia, e a máscara que escolhe onde ela aparece.',
    licoes: [
      {
        id: 'm5-teoria', tipo: 'teoria', questoes: Q['m5-teoria'], perguntas: 4,
        titulo: 'Camadas e máscara', resumo: 'Folhas empilhadas, e preto que esconde sem apagar.',
        topicos: CAMADAS,
      },
      {
        id: 'm5-lab', tipo: 'foto', licao: 'camadas',
        titulo: 'Clareando só a barraca',
        resumo: 'Uma cópia clareada, e a máscara feita pela varinha.',
        verificacoes: ['duas-camadas', 'barraca-mais-clara', 'mascara-no-ceu'],
      },
    ],
  },
  {
    id: 'm6', titulo: 'Sem fundo',
    resumo: 'O canal de transparência, e o formato que o guarda.',
    licoes: [
      {
        id: 'm6-teoria', tipo: 'teoria', questoes: Q['m6-teoria'], perguntas: 4,
        titulo: 'Transparência', resumo: 'O quarto número do pixel, a tolerância da varinha, e o PNG.',
        topicos: TRANSPARENCIA,
      },
      {
        id: 'm6-lab', tipo: 'foto', licao: 'transparencia',
        titulo: 'Recortando o escudo do lenço',
        resumo: 'A mesa vira transparência, e o escudo não pode perder a borda.',
        verificacoes: ['fundo-transparente', 'escudo-inteiro', 'exportou-com-transparencia'],
      },
    ],
  },
  {
    id: 'm7', titulo: 'Tela e papel',
    resumo: 'Pontos por polegada, e por que a mesma foto vira dois arquivos.',
    licoes: [
      {
        id: 'm7-teoria', tipo: 'teoria', questoes: Q['m7-teoria'], perguntas: 4,
        titulo: 'Pontos por polegada', resumo: 'O número que só o papel lê.',
        topicos: TAMANHOS,
      },
      {
        id: 'm7-lab', tipo: 'foto', licao: 'tamanhos',
        titulo: 'Um arquivo para o celular, outro para a gráfica',
        resumo: 'Reduzir para a tela, e o ppi certo para imprimir.',
        verificacoes: ['arquivo-de-tela', 'arquivo-de-impressao', 'explicou-tela-e-papel'],
      },
    ],
  },
  {
    id: 'm8', titulo: 'Formatos',
    resumo: 'Com perda e sem perda, e o arquivo leve para a página do clube.',
    licoes: [
      {
        id: 'm8-teoria', tipo: 'teoria', questoes: Q['m8-teoria'], perguntas: 4,
        titulo: 'JPG, PNG, WEBP e TIFF', resumo: 'O que cada formato guarda, e o que joga fora.',
        topicos: FORMATOS,
      },
      {
        id: 'm8-lab', tipo: 'foto', licao: 'formatos',
        titulo: 'Deixando a foto leve para o site',
        resumo: 'Sessenta por cento a menos, sem se ver a diferença, e o original guardado.',
        verificacoes: ['reduziu-sessenta', 'sem-perda-perceptivel', 'original-guardado', 'escolheu-os-formatos'],
      },
    ],
  },
  {
    id: 'm9', titulo: 'De quem é',
    resumo: 'Imagem sua, de licença livre ou protegida, e onde procurar.',
    licoes: [
      {
        id: 'm9-teoria', tipo: 'teoria', questoes: Q['m9-teoria'], perguntas: 4,
        titulo: 'Direito autoral e licenças', resumo: 'O que se pode usar, e o crédito que a licença pede.',
        topicos: DIREITOS,
      },
      {
        id: 'm9-lab', tipo: 'foto', licao: 'direitos',
        titulo: 'Antes de baixar',
        resumo: 'Seis imagens para classificar, as fontes, e um crédito.',
        verificacoes: ['classificou-as-imagens', 'indicou-duas-fontes', 'escreveu-o-credito'],
      },
    ],
  },
  {
    id: 'm10', titulo: 'A edição completa',
    resumo: 'Do celular à foto pronta, e o antes e o depois.',
    licoes: [
      {
        id: 'm10-teoria', tipo: 'teoria', questoes: Q['m10-teoria'], perguntas: 4,
        titulo: 'Uma edição do começo ao fim', resumo: 'A ordem dos passos, e como mostrar o que mudou.',
        topicos: COMPLETA,
      },
      {
        id: 'm10-lab', tipo: 'foto', licao: 'completa',
        titulo: 'Editando a foto do acampamento',
        resumo: 'Tudo o que as lições ensinaram, numa foto só.',
        verificacoes: ['editou-tudo', 'viu-antes-e-depois', 'exportou-sem-apagar'],
      },
    ],
  },
];
