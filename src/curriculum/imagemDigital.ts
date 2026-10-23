import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DA_IMAGEM_DIGITAL as Q } from './questoesDaImagemDigital';

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
 * ── Os números ──────────────────────────────────────────────────────────
 * Os que a teoria cita — pixels, centímetros, quilobytes — saem do mesmo
 * motor que o editor usa, e `exemplosDaImagemDigital.test.ts` os confere.
 */

const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], exemplo: string, atencao: string, marcas: string[],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, exemplo, exemploComo: 'texto' as const, atencao, marcas,
});

/* ── Módulo 1: o pixel ────────────────────────────────────────────────────── */

const PIXELS: TopicoDeVereda[] = [
  t(
    'o-quadradinho',
    'O quadradinho de cor',
    'Uma foto é uma grade de pixels, e cada pixel é uma cor só.',
    [
      'A foto do acampamento que saiu do celular tem **1800 pixels de largura e 1200 de altura**: são 2.160.000 quadradinhos, cada um pintado de uma cor só. A palavra pixel vem de *picture element*, elemento da imagem.',
      'A cor de cada pixel é guardada em três números, de 0 a 255: quanto de **vermelho**, de **verde** e de **azul** a tela acende ali. 255, 255, 255 é branco; 0, 0, 0 é preto. É isso que o conta-gotas lê.',
      'A **resolução** é quantos pixels a imagem tem. Ela diz quanto detalhe a câmera conseguiu guardar, e mais nada: uma foto de 1800 pixels de largura tem 1800 colunas de cor, nem uma a mais.',
    ],
    `A foto IMG_0412.jpg

  Largura:     1800 pixels
  Altura:      1200 pixels
  Total:       2.160.000 pixels

  O pixel do céu em x 300, y 100, lido pelo conta-gotas:
  R 120   G 142   B 167   (um azul acinzentado)`,
    'Ampliar a foto na tela não muda a resolução. O zoom só mostra os mesmos pixels maiores.',
    ['pixel', 'resolução'],
  ),
  t(
    'ampliar-a-foto',
    'Por que a foto ampliada borra',
    'Para aumentar, o programa precisa inventar os pixels que faltam.',
    [
      'A miniatura do lenço tem 200 pixels de largura. Pedir 600 é pedir três vezes mais em cada direção: cada pixel de antes vira **nove** depois. Os oito novos não foram fotografados por ninguém — o programa os inventa, fazendo a média entre os vizinhos.',
      'Média entre o amarelo da borda e o vermelho do escudo é um laranja que não existia na foto. A borda, que era um degrau nítido, vira uma faixa borrada. Quanto mais se amplia, mais borrado fica.',
      'O vetor da CC-DG002 não sofre isso porque não guarda pixels: guarda a receita da forma. Ampliado, ele refaz a conta no tamanho novo e a borda continua lisa. A foto não tem receita para refazer.',
    ],
    `A miniatura do lenço, ampliada

  Antes:   200 pixels de largura
  Depois:  600 pixels de largura
  Cada pixel de antes vira 3 × 3 = 9 pixels
  1 fotografado, 8 inventados pela média`,
    'Nenhum programa devolve detalhe que a câmera não gravou. Ampliar sempre inventa, e inventar sempre borra.',
    ['ampliar', 'pixel e vetor'],
  ),
];

/* ── Módulo 2: nivelar e recortar ─────────────────────────────────────────── */

const RECORTAR: TopicoDeVereda[] = [
  t(
    'o-horizonte',
    'O horizonte torto',
    'Girar a foto até a linha do chão ficar reta.',
    [
      'Quem tira foto segurando o celular com uma mão quase sempre inclina um pouco. Numa foto de paisagem isso se vê na hora: a linha onde a grama encontra a serra sobe de um lado.',
      'A ferramenta **Endireitar** gira a foto pelo número de graus que se escolhe. A do acampamento saiu inclinada 3,5 graus para um lado, e endireita girando 3,5 para o outro. A grade de terços do recorte ajuda a ver quando a linha ficou paralela.',
      'Girar uma foto retangular abre **quatro triângulos vazios** nos cantos, onde não havia foto nenhuma. Eles aparecem como transparência, e é por isso que girar e recortar andam juntos.',
    ],
    `Endireitar 3,5 graus

  Antes:   a linha do chão sobe da esquerda para a direita
  Depois:  a linha do chão fica reta
           e quatro cantos ficam vazios`,
    'Endireitar pelo céu ou pela barraca engana. O que precisa ficar reto é o horizonte.',
    ['endireitar', 'cantos vazios'],
  ),
  t(
    'o-recorte',
    'Recortar sem cortar o assunto',
    'O recorte tira os cantos vazios e o que sobra nas beiradas.',
    [
      'Recortar é escolher um retângulo dentro da foto e jogar fora o resto. Depois de endireitar, ele precisa ficar **inteiro dentro da parte com foto**, senão algum dos triângulos vazios continua no canto.',
      'O recorte também é escolha de enquadramento. A **regra dos terços** divide o quadro em três por três, e pôr o assunto perto de uma das linhas costuma deixar a foto mais viva do que pô-lo no meio exato.',
      'O que não se pode é cortar o assunto. Uma barraca com a ponta de fora parece erro de quem tirou a foto, e não escolha.',
    ],
    `Depois de endireitar 3,5 graus

  Foto:      1800 × 1200 pixels
  Recorte:   x 80, y 60, largura 1640, altura 1080
  Sobra:     1640 × 1080, sem canto vazio
             e com a barraca inteira`,
    'Recortar joga pixels fora para sempre no arquivo exportado. Guarde a foto original antes.',
    ['recortar', 'regra dos terços'],
  ),
];

/* ── Módulo 3: luz e cor ──────────────────────────────────────────────────── */

const AJUSTES: TopicoDeVereda[] = [
  t(
    'o-histograma',
    'O histograma',
    'O desenho que conta quantos pixels há em cada tom, do preto ao branco.',
    [
      'O **histograma** é um gráfico de barras: à esquerda, o preto; à direita, o branco; a altura de cada barra é quantos pixels da foto têm aquele tom. Ele mostra o que o olho às vezes não percebe na tela.',
      'Foto **escura** tem o morro encostado na esquerda. Foto **estourada** tem uma parede na direita: pixels que viraram branco puro e perderam todo o detalhe. Foto **sem contraste** tem um morro estreito no meio, sem pretos nem brancos.',
      'A foto do acampamento chegou com os três defeitos de uma vez: escura, acinzentada e azulada. Cada ajuste conserta um, e o histograma mostra se o conserto passou do ponto.',
    ],
    `Como ler o histograma

  Morro na esquerda      →  foto escura
  Parede na direita      →  branco estourado, detalhe perdido
  Morro estreito no meio →  foto sem contraste`,
    'Branco estourado não volta. Escurecer depois só deixa o branco cinza, sem o detalhe que se perdeu.',
    ['histograma', 'estourado'],
  ),
  t(
    'os-tres-ajustes',
    'Exposição, contraste e temperatura',
    'Três controles diferentes, e cada um conserta uma coisa.',
    [
      '**Exposição** clareia ou escurece a foto inteira, como se a câmera tivesse deixado entrar mais ou menos luz. É a primeira a mexer numa foto escura.',
      '**Contraste** afasta os tons do meio: os escuros ficam mais escuros, os claros mais claros. Devolve a força de uma foto acinzentada. Demais, empurra os claros contra a parede da direita e eles estouram.',
      '**Temperatura** puxa as cores para o azul (fria) ou para o laranja (quente). Para saber se acertou, procure algo que é branco de verdade — a placa da trilha — e confira no conta-gotas: vermelho, verde e azul precisam ficar parecidos.',
    ],
    `A placa da trilha, pelo conta-gotas

  Antes:   R 156   G 164   B 169   (o azul na frente)
  Depois:  R 226   G 227   B 223   (os três parecidos)`,
    'Ajuste é melhor aos poucos, olhando o histograma. Puxar o controle até o fim quase sempre estoura alguma coisa.',
    ['exposição', 'contraste', 'temperatura'],
  ),
];

/* ── Módulo 4: tirar o que sobra ──────────────────────────────────────────── */

const REMOVER: TopicoDeVereda[] = [
  t(
    'o-carimbo',
    'O carimbo',
    'Copiar um pedaço bom da foto por cima do pedaço ruim.',
    [
      'Uma garrafa esquecida no chão estraga a foto do acampamento. Para tirá-la não adianta apagar: apagar deixa um buraco. É preciso pôr **grama** no lugar dela.',
      'O **carimbo** faz isso. Primeiro se escolhe a **origem**, um pedaço de grama limpa ao lado; depois, cada pincelada sobre a garrafa copia a grama da origem para ali. A origem anda junto com o pincel, sempre à mesma distância.',
      'Escolher a origem perto e na mesma altura importa: grama de longe tem outro tamanho e outra luz, e o remendo aparece.',
    ],
    `Tirando a garrafa

  1. Escolher o Carimbo e um raio pouco maior que a garrafa
  2. Definir origem: clicar na grama, ao lado
  3. Pincelar sobre a garrafa, de cima para baixo`,
    'Clicar várias vezes no mesmo ponto repete o mesmo pedaço de grama, e o olho acha o desenho repetido.',
    ['carimbo', 'origem'],
  ),
  t(
    'remendo-liso',
    'O remendo liso',
    'Pintar por cima tampa, mas deixa uma mancha sem textura.',
    [
      'O jeito mais rápido de esconder a garrafa é pegar o pincel, escolher um verde parecido com a grama e pintar por cima. A garrafa some — e no lugar dela fica uma **mancha lisa**, de um verde só.',
      'Grama de verdade não tem um verde só: cada folha tem um tom. É essa variação, a **textura**, que o olho usa para reconhecer grama. Uma mancha sem ela aparece de longe, mesmo com a cor certa.',
      'O carimbo copia a textura junto com a cor, e é por isso que o remendo dele some. O pincel serve para outras coisas — e para pintar a máscara, na lição de camadas.',
    ],
    `Dois jeitos de tirar a garrafa

  Pincel verde:   a garrafa some
                  fica uma mancha lisa
  Carimbo:        a garrafa some
                  fica grama com textura de grama`,
    'Tirar coisa de uma foto que vai ser usada como prova ou documento é mentir com ela. Aqui a garrafa é lixo esquecido, e não parte do que aconteceu.',
    ['textura', 'pincel'],
  ),
];

/* ── Módulo 5: camadas e máscara ──────────────────────────────────────────── */

const CAMADAS: TopicoDeVereda[] = [
  t(
    'as-camadas',
    'Camadas',
    'Folhas transparentes empilhadas, e cada uma pode ser mexida sozinha.',
    [
      'Uma **camada** é uma folha da imagem. O que está na de cima aparece por cima do que está na de baixo, como desenhos em papel vegetal empilhados.',
      'O primeiro gesto de quem edita com cuidado é **duplicar** a camada da foto e trabalhar na cópia. A de baixo fica como chegou; se a de cima der errado, basta escondê-la ou apagá-la, e a foto original está lá.',
      'Quem ajusta direto na camada única não tem volta, a não ser desfazer passo por passo.',
    ],
    `Camadas
  Fundo (cópia)    ← ajusta-se aqui
  Fundo            ← fica como chegou`,
    'Achatar a imagem junta todas as camadas numa só. Depois disso, a de baixo deixa de existir.',
    ['camada', 'duplicar'],
  ),
  t(
    'a-mascara',
    'A máscara',
    'Preto esconde, branco mostra: a máscara diz onde a camada aparece.',
    [
      'A barraca está na sombra, e clarear a foto inteira estoura o céu. O que se quer é clarear **só a barraca**. Para isso, a cópia clareada ganha uma **máscara**.',
      'A máscara é uma imagem em tons de cinza presa à camada. Onde ela é **branca**, a camada aparece; onde é **preta**, a camada some e deixa ver a de baixo. Pintar a máscara de preto esconde; de branco, mostra de novo.',
      'Um jeito rápido de fazer a máscara é selecionar primeiro: a **varinha** escolhe os pixels de cor parecida com o que se clicou, e a máscara nasce da seleção — branca dentro, preta fora.',
    ],
    `Clarear só a barraca

  1. Duplicar a camada
  2. Clarear a cópia inteira
  3. Varinha na barraca
  4. Adicionar máscara: branca na barraca, preta no resto`,
    'Apagar com a borracha também esconde, mas não tem volta. Pintar a máscara de preto esconde e deixa o pixel lá.',
    ['máscara', 'varinha'],
  ),
];

/* ── Módulo 6: transparência ──────────────────────────────────────────────── */

const TRANSPARENCIA: TopicoDeVereda[] = [
  t(
    'o-canal',
    'O canal de transparência',
    'Um quarto número em cada pixel, dizendo o quanto ele cobre.',
    [
      'Além de vermelho, verde e azul, um pixel pode guardar um quarto número: o **canal de transparência**, também chamado de alfa. Zero é transparente — o pixel não cobre nada —, e 255 é opaco.',
      'O programa mostra o transparente como um **xadrez cinza e branco**. O xadrez não está na imagem: é o jeito de desenhar o nada, para que se veja onde ele está.',
      'É o alfa que deixa o escudo do clube ser posto em cima de qualquer fundo — um cartaz verde, uma camiseta azul — sem levar junto o retângulo da mesa em que foi fotografado.',
    ],
    `Um pixel com transparência

  R 200   G 40   B 30   A 255   vermelho, opaco
  R 200   G 40   B 30   A 0     não aparece`,
    'Nem todo formato guarda o quarto número. Exportar no formato errado devolve o fundo, e a mesa volta.',
    ['canal de transparência', 'alfa'],
  ),
  t(
    'tirar-o-fundo',
    'Tirar o fundo',
    'Selecionar a mesa, excluir, e exportar num formato com transparência.',
    [
      'A varinha escolhe pixels parecidos com o que se clicou, e a **tolerância** diz quão parecidos. A mesa tem vários tons; com Shift, cada clique **soma** um pedaço à seleção, até a mesa inteira estar escolhida.',
      'Tolerância alta demais escolhe também o que não é mesa: o amarelo da borda do escudo é claro como a mesa, e some junto. Tolerância baixa demais deixa ilhas de mesa sem escolher. O certo está no meio, e se confere olhando a borda.',
      'Com a mesa escolhida, **Excluir** a transforma em transparência. Falta exportar: em **PNG** o escudo sai sem fundo; em **JPG**, que não tem canal de transparência, o fundo volta branco.',
    ],
    `O lenço, exportado

  PNG:   escudo sem fundo     658 KB
  JPG:   fundo branco         65 KB`,
    'O JPG fica dez vezes menor, e é justamente o que não serve aqui. Arquivo pequeno não adianta se o fundo volta.',
    ['tolerância', 'PNG'],
  ),
];

/* ── Módulo 7: tela e papel ───────────────────────────────────────────────── */

const TAMANHOS: TopicoDeVereda[] = [
  t(
    'pontos-por-polegada',
    'Pontos por polegada',
    'O ppi não muda a imagem: diz em que tamanho ela sai no papel.',
    [
      '**Pontos por polegada** (ppi) é quantos pixels a impressora põe em cada polegada de papel — uma polegada são 2,54 centímetros. Ele é só um número escrito no arquivo: mudá-lo **sem reamostrar** não mexe em pixel nenhum.',
      'A mesma foto de 1800 pixels de largura sai com **63,5 cm** a 72 ppi e com **15,2 cm** a 300 ppi. Os pixels são os mesmos; a 300 eles ficam mais apertados, e a impressão sai nítida.',
      'Uma gráfica pede de 240 a 300 ppi para foto. Abaixo disso, os pixels ficam grandes o bastante para se ver no papel.',
    ],
    `1800 pixels de largura

  a 72 ppi:    63,5 cm no papel
  a 300 ppi:   15,2 cm no papel
  (os mesmos 1800 pixels)`,
    'Subir o ppi reamostrando inventa pixels, como ampliar. A foto não ganha detalhe nenhum.',
    ['ppi', 'reamostrar'],
  ),
  t(
    'tela-e-papel',
    'O arquivo da tela e o do papel',
    'A tela só conta pixels; o papel conta pixels por polegada.',
    [
      'A tela **ignora o ppi**. Um celular mostra a foto pelo número de pixels dela, e uma foto de 1080 pixels de largura já enche a tela inteira. Mandar 4000 pixels para o site só deixa a página lenta.',
      'O papel é o contrário: ele precisa de pixels suficientes para o tamanho que vai sair. A editada do acampamento, com **1640 × 1080** pixels a 240 ppi, sai com **17,4 × 11,4 cm** — uma foto de álbum, nítida.',
      'Por isso a mesma imagem vira dois arquivos: um **pequeno**, para a tela, e um **com o ppi certo**, para a gráfica. Os dois partem da mesma edição, e nenhum serve para o outro uso.',
    ],
    `A mesma edição, dois arquivos

  Para a tela:     1080 pixels de largura
  Para imprimir:   1640 × 1080 pixels a 240 ppi
                   17,4 × 11,4 cm no papel`,
    'Reduza a cópia, nunca a única que você tem. Do arquivo pequeno não dá para voltar ao grande.',
    ['tela', 'impressão'],
  ),
];

/* ── Módulo 8: formatos e compressão ──────────────────────────────────────── */

const FORMATOS: TopicoDeVereda[] = [
  t(
    'com-e-sem-perda',
    'Compressão com perda e sem perda',
    'Uma guarda tudo de um jeito mais curto; a outra joga fora o que o olho não vê.',
    [
      'Guardar a cor de cada pixel, um por um, ocupa muito: a foto do acampamento em **TIFF**, que guarda assim, tem **6,2 MB**. Comprimir é escrever a mesma coisa com menos bytes.',
      'A compressão **sem perda** acha repetições e as escreve mais curto, e devolve cada pixel exatamente como era: é a do **PNG**, que deixa a mesma foto com **1,4 MB**. A compressão **com perda** joga fora detalhe miúdo que o olho quase não vê, e o pixel volta parecido, não igual: é a do **JPG**, que a deixa com **105 KB**.',
      'A qualidade do JPG diz quanto jogar fora. Muito baixa, aparecem **quadradinhos** no céu e uma sombra na borda da barraca: o detalhe que se perdeu começou a se ver.',
    ],
    `A mesma foto, 1800 × 1200 pixels

  TIFF   sem compressão     6,2 MB
  PNG    sem perda          1,4 MB
  JPG    com perda          105 KB
  WEBP   com perda          74 KB`,
    'Cada vez que se abre e salva um JPG de novo, ele perde mais um pouco. Edite sempre a partir do original.',
    ['com perda', 'sem perda'],
  ),
  t(
    'cada-formato-o-seu',
    'Um formato para cada uso',
    'JPG, PNG, WEBP e TIFF: o que cada um guarda, e para que serve.',
    [
      '**JPG** é para foto na tela: com perda, pequeno, sem transparência. **WEBP** é o mais novo: faz o mesmo que o JPG, um pouco menor, e também guarda transparência. Navegador antigo e alguns programas não o abrem.',
      '**PNG** é sem perda e guarda transparência: serve para emblema, logotipo e captura de tela, onde a borda precisa ficar nítida e o texto legível. Para foto, ele fica grande demais.',
      '**TIFF** é o da gráfica: sem perda e com o ppi escrito. Pesado demais para mandar por mensagem, é o que se entrega para imprimir.',
    ],
    `Para a página do clube

  acampamento.jpg          222 KB   o original
  acampamento-web.jpg       52 KB   1200 pixels, qualidade 75
  Redução:                  mais de 60%, sem perda que se veja`,
    'Otimizar é exportar outro arquivo. Salvar por cima do original apaga o "antes" — e o examinador pede os dois.',
    ['JPG', 'PNG', 'WEBP', 'TIFF'],
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
      'Toda imagem que alguém criou nasce **protegida** por direito autoral, mesmo sem aviso nenhum escrito. Um mapa achado na busca de imagens, sem licença, é protegido: não dizer nada não é permitir.',
      'Uma imagem de **licença livre** é aquela em que o autor escreveu o que deixa fazer. As licenças **Creative Commons** são as mais comuns: CC0 é domínio público, sem pedir nada; CC BY deixa usar desde que se dê o **crédito** — o nome de quem fez.',
    ],
    `De quem é cada imagem

  Foto que você tirou                 sua
  Foto CC BY no Wikimedia Commons      livre, com crédito
  Logotipo de outro clube              protegida
  Desenho de um colega                 protegida, é dele`,
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
      'O crédito vai embaixo da imagem, com o nome de quem fez, a licença e de onde veio. É curto: "Foto: Ana Lima, CC BY 4.0, via Wikimedia Commons".',
    ],
    `O crédito, embaixo da foto do tucano

  Foto: Ana Lima, CC BY 4.0, via Wikimedia Commons
        quem fez   licença     onde estava`,
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
      'Uma edição tem ordem, e ela não é capricho. Primeiro **endireitar e recortar**: não adianta acertar a luz de um pedaço que vai ser jogado fora. Depois **exposição, contraste e temperatura**, que mexem na foto inteira. Por último os **detalhes**, como a garrafa.',
      'Os detalhes ficam para o fim porque são os menores: não adianta carimbar o que o recorte ainda vai jogar fora, nem escolher a origem do carimbo olhando uma grama que ainda vai mudar de cor.',
      'Cada passo parte do anterior. É por isso que vale guardar o original intocado: ele é o único ponto de onde se pode recomeçar.',
    ],
    `A edição da foto do acampamento

  1. Endireitar 3,5 graus
  2. Recortar os cantos vazios
  3. Exposição, contraste, temperatura
  4. Carimbo na garrafa
  5. Exportar com outro nome`,
    'Exportar com o mesmo nome do original apaga o original. Sem ele, não há "antes" para mostrar.',
    ['ordem', 'edição'],
  ),
  t(
    'antes-e-depois',
    'Antes e depois',
    'A edição se mostra lado a lado com a foto como chegou.',
    [
      'O requisito pede para mostrar o estado anterior e o posterior. O jeito honesto é **lado a lado**, no mesmo tamanho: a foto como o celular a tirou, e a editada.',
      'Lado a lado aparece o que cada passo fez: o horizonte reto, a luz da tarde, a placa branca, o chão sem garrafa. Aparece também o que passou do ponto — um céu estourado ou uma grama verde demais —, e é para isso que se compara.',
      'Na hora de mostrar ao examinador, diga o que mudou em cada passo e por quê. É a mesma pergunta que a lição de teoria faz desde o começo: o que este controle conserta?',
    ],
    `Mostrar ao examinador

  IMG_0412.jpg                 a foto como chegou
  acampamento-editada.jpg      a edição completa
  Exibir → Antes e depois      as duas lado a lado`,
    'Uma edição boa às vezes nem parece edição. O lado a lado é o que mostra o trabalho que foi feito.',
    ['antes e depois', 'apresentação'],
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
