import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DO_DESENHO_VETORIAL as Q } from './questoesDoDesenhoVetorial';
import { telasDoTopico } from './telas';

/*
 * A vereda CC-DG002 Desenho Vetorial.
 *
 * ── O que ela é ─────────────────────────────────────────────────────────
 * A segunda da família de Design, e a primeira em que o editor desenha forma
 * nova em vez de arrumar a que chegou. Os cinco termos do requisito 2, a
 * diferença do 3, as seis demonstrações do 4, o logotipo do 5, o ícone do 6 e
 * o SVG do 7 viram nove lições — cada uma com uma prancha do mesmo arquivo do
 * clube, `arteVetorial.ts`.
 *
 * ── O editor é o da CC-DG001 ────────────────────────────────────────────
 * Com as ferramentas de vetor que esta vereda trouxe para ele: a caneta, a
 * edição de nós, as três booleanas, o grupo, o traço com extremidade e o
 * texto em curvas. Ele é da família inteira, e não desta vereda: a de
 * identidade visual vai abri-lo de novo.
 *
 * ── E o que ela não confere ─────────────────────────────────────────────
 * O requisito 8 — apresentar os desenhos ao examinador — acontece fora do
 * aplicativo. O logotipo do 5 é "fornecido pelo examinador", e aqui chega
 * pronto como guia bloqueada: na vida ele vem num papel, e o que a lição mede
 * é o mesmo — reproduzir mantendo a proporção.
 *
 * ── O exemplo é o editor ────────────────────────────────────────────────
 * Cada ferramenta se mostra no editor, tela por tela, em peças que não são as
 * do laboratório: a casa, a bandeirola e a fatia de melancia no lugar da
 * barraca, da lua e da nuvem; a gota no lugar da folha; o escudo no lugar do
 * logotipo do examinador. As receitas estão em `src/exemplos/`. Os poucos
 * números que a teoria cita saem do mesmo motor que desenha, e
 * `exemplosDoDesenhoVetorial.test.ts` os confere.
 */

const V = 'CC-DG002';
const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], atencao: string, marcas: string[],
  telas?: [legenda: string, descricao: string][],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, atencao, marcas, ...(telas ? { telas: telasDoTopico(V, id, telas) } : {}),
});

/* ── Módulo 1: vetor e pontos ─────────────────────────────────────────────── */

const VETOR_E_PONTOS: TopicoDeVereda[] = [
  t(
    'receita-ou-mosaico',
    'Receita ou mosaico',
    'A imagem de pontos guarda a cor de cada quadradinho; o vetor guarda a receita da forma.',
    [
      'Uma foto do celular é uma **imagem de pontos**: uma grade de milhões de quadradinhos, cada um com uma cor. O arquivo guarda a cor de cada um, e mais nada. É por isso que ela registra tudo o que a câmera viu — a fumaça da fogueira, o rosto de cada desbravador — sem ninguém precisar desenhar nada.',
      'Um **vetor** guarda outra coisa: a receita do desenho. "Um círculo com centro aqui e este raio, pintado de verde." Quem abre o arquivo refaz a conta e desenha o círculo do tamanho que for pedido. Um círculo que, em pontos, seriam quarenta mil quadradinhos, em vetor são quatro números e uma cor.',
      'A diferença aparece quando se amplia. Na foto, ampliar só deixa cada quadradinho maior, até a imagem virar um mosaico de degraus. No vetor, ampliar é refazer a receita num tamanho maior: a borda continua lisa em qualquer tamanho.',
      'O editor tem como mostrar isso: no menu **Exibir**, o zoom vai até **800%**. É o que se faz para conferir uma peça antes de mandá-la para uma faixa grande.',
    ],
    'Ampliar uma foto nunca devolve detalhe que a câmera não gravou. O programa só pode inventar o meio-termo entre dois quadradinhos.',
    ['vetor', 'imagem de pontos'],
    [
      ['Uma estrela desenhada em vetor, no tamanho normal: 100% de zoom.', 'O editor de design com a prancha Estrela aberta e uma estrela amarela pequena no canto, circulada.'],
      ['Em **Exibir › 800%** a estrela fica oito vezes maior, e as bordas continuam retas e lisas. A régua de baixo diz o zoom.', 'A mesma estrela ocupando a mesa inteira, ampliada, com bordas perfeitamente retas. A barra de status, embaixo, mostra Zoom 800%.'],
      ['Na prancha **Foto**, com o mesmo zoom, a foto do acampamento vira degraus: cada quadradinho da imagem ficou do tamanho de um botão.', 'A foto do acampamento ampliada a 800%, feita de quadrados grandes de cor chapada: céu cinza em faixas, uma nuvem em cruz e a serra em degraus verde-escuros. A prancha Foto está circulada na lista.'],
    ],
  ),
  t(
    'cada-uso-o-seu',
    'Cada uso pede o seu',
    'Vetor para o que precisa mudar de tamanho; pontos para o que veio de uma câmera.',
    [
      'O logotipo do clube vai no canto do papel timbrado e na faixa de três metros da entrada do campori. Desenhado em vetor, é o mesmo arquivo nos dois. Em pontos, a faixa sai serrilhada — ou alguém precisa redesenhar.',
      'A foto da fogueira não tem receita nenhuma: ninguém escreve a fórmula da fumaça. Foto, ficha passada no digitalizador e retrato são pontos por natureza, e tentar convertê-los em vetor dá um desenho de borrões chapados.',
      'A pergunta que decide é: **de onde veio** a imagem, e **para que tamanho** ela vai? Desenho que alguém fez e que vai mudar de tamanho pede vetor: o logotipo do clube, o ícone de um aplicativo, o desenho da camiseta. Imagem que veio de uma câmera ou de um digitalizador é de pontos: a foto do acampamento, a ficha escaneada, a foto de perfil.',
    ],
    'Vetor não é "melhor" que pontos. Uma foto em vetor perde justamente o que fazia dela uma foto.',
    ['casos de uso', 'ampliar sem perder'],
  ),
];

/* ── Módulo 2: formas e booleanas ────────────────────────────────────────── */

const BOOLEANAS: TopicoDeVereda[] = [
  t(
    'comecar-pelo-simples',
    'Começar pelo simples',
    'Quase todo ícone é feito de retângulos, círculos e triângulos.',
    [
      'Olhe o desenho de uma casa: é um quadrado com um triângulo em cima. Uma bandeirola de unidade é um retângulo com um triângulo recortado na ponta. Uma fatia de melancia é metade de um círculo. Antes de desenhar curva por curva, quem desenha em vetor pergunta: **de que formas simples isto é feito?**',
      'Essas formas simples se chamam **formas primitivas**: o **Retângulo**, a **Elipse** e o **Triângulo**, os três botões depois do T na barra de ferramentas. Elas já nascem certas — o círculo é redondo de verdade e o triângulo tem os lados retos —, o que nenhuma mão consegue com a caneta.',
      'Depois elas são **combinadas** numa forma só. Juntas na prancha, elas ainda são peças soltas: a lista de camadas mostra uma linha para cada, mudar a cor do telhado não muda a da parede, e um contorno passaria pelo meio do desenho.',
    ],
    'Desenhar uma fatia redonda com a caneta é possível, mas a curva sai torta. Um círculo e um retângulo dão a fatia certa em dez segundos.',
    ['forma primitiva', 'combinar'],
    [
      ['As ferramentas **Retângulo**, **Elipse** e **Triângulo** ficam juntas na barra. A casa da prancha é um retângulo e um triângulo, ainda soltos.', 'O editor com três desenhos de peças soltas: uma casa marrom, uma bandeirola azul com um triângulo cinza na ponta e um círculo vermelho com um retângulo cinza por cima. Os três botões de forma da barra e as duas peças da casa estão circulados.'],
    ],
  ),
  t(
    'unir-subtrair-intersectar',
    'Unir, subtrair, intersectar',
    'Três operações que transformam duas formas numa só.',
    [
      '**Unir** junta as formas e apaga as divisas: a parede e o telhado viram o contorno de uma casa, sem a linha que os separava.',
      '**Subtrair** usa a forma de cima como faca: o que ela cobre sai da forma de baixo. Por isso a ordem importa — quem perde o pedaço é sempre a forma **de baixo** na lista de camadas, e a de cima desaparece depois de cortar. Ela não depende de qual você clicou primeiro. Na bandeirola, o triângulo cinza está acima do retângulo azul na lista: subtrair tira dele o rabo de andorinha.',
      '**Intersectar** guarda só a parte em que as formas se cobrem. Um círculo e um retângulo que cobre a metade de baixo dele deixam a meia-lua de baixo: a fatia de melancia.',
      'O resultado fica com a cor e o nome da forma de baixo. Selecione as duas — na prancha ou na lista de camadas, com **Shift + clique** para somar — e use os botões **Unir**, **Subtrair** e **Intersectar** da barra, ou o menu **Objeto**.',
    ],
    'Se a forma errada sumiu, Ctrl+Z desfaz e Trazer para frente troca qual fica em cima.',
    ['união', 'subtração', 'interseção'],
    [
      ['A parede e o telhado selecionados juntos, com **Shift + clique**, e o botão **Unir** na barra.', 'O editor com a parede e o telhado da casa selecionados, contornados de azul e circulados juntos. O botão Unir, na barra de ferramentas, está circulado.'],
      ['Na lista de camadas, o triângulo "o que sai" está **acima** do retângulo da bandeirola. É ele que corta. O botão é **Subtrair**.', 'A lista de camadas com Bandeirola — o que sai e Bandeirola selecionadas e circuladas, a primeira acima da segunda. O botão Subtrair está circulado; a casa já virou uma forma só.'],
      ['O resultado das três: a casa numa forma só, a bandeirola com o rabo de andorinha e, com **Intersectar**, a fatia de melancia.', 'A prancha com a casa marrom inteiriça, a bandeirola azul com um corte em V na ponta e uma meia-lua vermelha, os três circulados. A lista de camadas mostra só três linhas.'],
    ],
  ),
];

/* ── Módulo 3: curvas ────────────────────────────────────────────────────── */

const CURVAS: TopicoDeVereda[] = [
  t(
    'no-e-alca',
    'Nó e alça',
    'O caminho passa pelos nós; as alças dizem para onde ele sai de cada um.',
    [
      'Um desenho vetorial é feito de **caminhos**. Cada caminho passa por pontos marcados, chamados **nós**. Entre dois nós, a linha pode ser reta ou curva.',
      'Quem decide a curva são as **alças**: duas hastes presas em cada nó, uma de cada lado. A curva sai do nó na direção da alça, e quanto mais comprida a alça, mais longe a curva segue nessa direção antes de virar.',
      'Há dois tipos de nó. No **nó de canto**, as alças são independentes e o caminho pode fazer uma quina — a ponta de uma estrela. No **nó suave**, as duas alças ficam na mesma reta: mexer numa gira a outra junto, e a curva passa pelo nó sem quina, como uma estrada.',
      'No editor, a ferramenta **Editar nós** — a segunda da barra — mostra os nós do caminho selecionado como losangos e as alças como bolinhas. Clicando num nó, o painel **Nó escolhido** diz onde ele está e de que tipo é, e os botões **Canto** e **Suave** trocam o tipo.',
    ],
    'Mais nós não deixam a curva mais bonita: deixam ondulada. Uma onda boa tem poucos nós e alças bem postas.',
    ['nó', 'alça', 'nó suave', 'nó de canto'],
    [
      ['A pedra com **Editar nós**: quatro nós em losango, e as alças do nó da direita em bolinhas, uma acima e outra abaixo. O painel diz que ele é **Suave**.', 'O editor com uma elipse cinza e seus quatro nós marcados. O nó da direita está circulado, com duas alças saindo dele na vertical, e o painel Nó escolhido, circulado, mostra X 320, Y 190 e o botão Suave ativo.'],
      ['Com **Canto**, as alças do nó deixam de andar juntas e o caminho faz uma quina ali. O resto da pedra continua redondo.', 'A mesma pedra, agora com uma ponta no lado direito, onde está o nó circulado. No painel, o botão Canto está ativo e circulado.'],
    ],
  ),
  t(
    'a-curva-de-bezier',
    'A curva de Bézier',
    'Quatro pontos guardam uma curva inteira: dois nós e duas alças.',
    [
      'A curva entre dois nós se chama **curva de Bézier**, pelo nome do engenheiro francês que a usou para desenhar carrocerias de carro. Ela é guardada com só quatro pontos: o nó de onde sai, a alça dele, a alça do nó de chegada e o nó de chegada. O programa calcula todo o resto.',
      'Um círculo inteiro sai de quatro nós suaves, um em cada ponto cardeal, com alças de comprimento um pouco maior que a metade do raio (0,55 do raio). Mais curta, ele sai achatado nos lados; mais comprida, sai quadradão.',
      'No editor, a **Caneta** desenha os nós: clicar põe um nó de canto, e clicar e **arrastar** põe um nó suave, puxando a alça na direção em que a linha deve seguir. Clicar de novo no primeiro nó fecha o caminho — com pelo menos três nós —, e Enter termina com ele aberto. A régua de baixo lembra isso enquanto a caneta está na mão.',
      'Uma gota sai de três nós: um clique no alto, para a ponta; um arrasto para baixo no lado direito; um arrasto para cima no lado esquerdo; e um clique de volta no primeiro. Depois, a ferramenta **Editar nós** mexe no que já existe: arrastar um nó, puxar uma alça, trocar canto por suave.',
    ],
    'Arraste na direção em que a linha deve seguir, e não na direção do nó seguinte.',
    ['curva de Bézier', 'caneta', 'editar nós'],
    [
      ['Com a **Caneta**, um clique no alto pôs o nó da ponta, e um arrasto para baixo no lado direito pôs um nó suave: a linha já chega a ele curvando.', 'O editor com a ferramenta Caneta ativa e circulada. Na prancha, uma linha azul desce em curva de um nó no alto até um nó à direita, mais embaixo. A régua de status explica clique, arraste, Enter e clique no primeiro.'],
      ['Mais um arrasto no lado esquerdo e um clique de volta no nó do alto fecham a gota. Ela entra na lista de camadas como um **Caminho**.', 'Uma gota cinza com contorno escuro, pontuda em cima e redonda embaixo, selecionada na prancha. A lista de camadas, circulada, mostra a linha Caminho.'],
    ],
  ),
];

/* ── Módulo 4: traço e preenchimento ─────────────────────────────────────── */

const TRACO: TopicoDeVereda[] = [
  t(
    'dentro-e-borda',
    'O de dentro e a borda',
    'Preenchimento pinta a área; traço pinta a linha do caminho.',
    [
      'Toda forma vetorial tem duas tintas. O **preenchimento** pinta a área de dentro. O **traço** pinta a própria linha do caminho, com uma espessura — é o contorno de uma etiqueta, a linha de uma trilha no mapa.',
      'As duas são independentes: uma etiqueta pode ter fundo creme e borda marrom; a linha do mapa pode ser só linha, sem fundo nenhum. No editor, elas moram na seção **Preenchimento e traço** das Propriedades: a cor do preenchimento, a caixa **Sem preenchimento**, a caixa **Traço**, e a cor, a espessura e a extremidade do traço.',
      'Caminho **aberto** — uma linha que não volta ao começo — deveria quase sempre ficar sem preenchimento. Preencher uma linha aberta faz o programa fechá-la por uma reta que ninguém desenhou, e a trilha do mapa vira um triângulo pintado.',
    ],
    'O traço fica metade para dentro e metade para fora da linha do caminho. Uma borda de 8 aumenta a forma 4 de cada lado.',
    ['traço', 'preenchimento'],
    [
      ['A etiqueta da mochila: **Preenchimento** creme, #F2E3B3, e **Traço** marrom de espessura 6.', 'O editor com um retângulo creme de borda marrom selecionado e circulado. No painel, a seção Preenchimento e traço, do campo Preenchimento até a Espessura do traço, está circulada.'],
      ['A trilha do mapa é um caminho aberto: **Sem preenchimento** marcado, e só o traço verde de espessura 8.', 'Uma linha verde em zigue-zague selecionada e circulada. No painel, a caixa Sem preenchimento marcada e os campos do traço, com espessura 8 e extremidade Redonda, estão circulados.'],
    ],
  ),
  t(
    'espessura-e-extremidade',
    'Espessura e extremidade',
    'A grossura da linha, e o jeito como ela termina.',
    [
      'A **espessura** é a grossura do traço. Num mapa, a trilha principal costuma ser grossa e a secundária fina — é uma hierarquia, como a dos tamanhos de letra da vereda anterior.',
      'A **extremidade** é o jeito como uma linha aberta termina. **Reta** corta a linha exatamente no último nó. **Redonda** acaba num meio círculo além do nó, como a ponta de um pincel. **Quadrada** passa do nó meia espessura, com a ponta reta.',
      'Em linha fina a diferença quase não aparece. Em linha grossa ela muda o desenho: uma trilha de 12 com ponta reta parece cortada a tesoura; com ponta redonda, parece desenhada. E muda o tamanho: com redonda ou quadrada, a linha passa do nó, e quem encostou a ponta na borda de outra peça vê as duas se cobrindo.',
      'No editor, a extremidade é a lista **Extremidade**, ao lado da espessura, nas Propriedades.',
    ],
    'Extremidade só existe em caminho aberto. Num caminho fechado não há ponta para terminar.',
    ['espessura', 'extremidade'],
    [
      ['Três linhas de 36 com os mesmos nós, marcados pelas duas réguas vermelhas: a **reta** para nos nós, a **redonda** e a **quadrada** passam deles.', 'O editor com três barras escuras horizontais entre duas linhas verticais vermelhas. A de cima termina exatamente nas linhas vermelhas; a do meio termina em meio círculo além delas; a de baixo passa delas com ponta reta. As três estão circuladas.'],
      ['Na lista **Extremidade**, a de cima passou de Reta a **Redonda**: ela cresce além dos nós e fica igual à do meio.', 'A barra de cima selecionada e circulada, agora com pontas redondas que passam das linhas vermelhas. No painel, a lista Extremidade mostra Redonda, circulada.'],
    ],
  ),
];

/* ── Módulo 5: camadas, grupos, alinhar e distribuir ─────────────────────── */

const CAMADAS: TopicoDeVereda[] = [
  t(
    'camada-e-grupo',
    'Camada e grupo',
    'A lista de camadas diz quem fica na frente; o grupo diz quem anda junto.',
    [
      'Cada objeto da prancha é uma **camada**, e a lista de camadas mostra a ordem: o que está mais acima na lista fica na frente no desenho. O pano da bandeira só aparece se estiver acima do mastro.',
      'Um desenho feito de três peças vira três linhas soltas na lista, e mover o desenho exige pegar as três sem esquecer nenhuma. **Agrupar** (Ctrl+G) junta as peças num objeto só: elas se movem, se alinham e se copiam juntas, e continuam sendo peças separadas por dentro — a lista as mostra recuadas embaixo do grupo.',
      'Dê nome ao grupo, no campo **Nome da camada**. "Grupo 3" não diz nada a quem abrir o arquivo amanhã; "Bandeira da unidade" diz. Num arquivo com trinta camadas, o nome é o que faz alguém achar a peça.',
    ],
    'Desagrupar (Ctrl+Shift+G) devolve as peças soltas sem mudar nada no desenho.',
    ['camada', 'grupo', 'nome da camada'],
    [
      ['O mastro, o pano e a base selecionados na lista de camadas, com **Shift + clique**. São três linhas soltas.', 'O editor com o desenho de uma bandeira vermelha num mastro marrom. Na lista de camadas, circulada, as três linhas Base, Pano e Mastro estão selecionadas.'],
      ['Com **Ctrl+G**, as três viram um **Grupo**, e as peças aparecem recuadas embaixo dele. O campo **Nome da camada** está pronto para o nome.', 'A lista de camadas com uma linha de grupo no alto e as três peças recuadas embaixo, circulada. No painel, o campo Nome da camada está circulado.'],
      ['Com o nome **Bandeira da unidade**, quem abrir o arquivo amanhã acha o desenho pela lista.', 'A lista de camadas circulada, agora com a linha Bandeira da unidade no alto e Base, Pano e Mastro recuadas embaixo.'],
    ],
  ),
  t(
    'alinhar-e-distribuir',
    'Alinhar e distribuir',
    'Alinhar põe na mesma linha; distribuir põe o mesmo espaço entre eles.',
    [
      '**Alinhar** encosta os objetos selecionados numa mesma linha. **Alinhar à base** — o último dos seis botões de alinhar — põe o pé de todos na mesma altura, que é o que três ícones lado a lado precisam, para não parecer que um está flutuando.',
      '**Distribuir horizontalmente** iguala o espaço entre eles. Com três ícones, ele deixa o primeiro e o último onde estão e move o do meio até os dois vãos ficarem iguais.',
      'Alinhar e distribuir a olho erra por poucos pixels, e é o erro da vereda anterior: ninguém mede, todo mundo percebe. Os botões fazem a conta exata. Agrupe antes: alinhando as peças soltas, a luz da lanterna iria parar no pé do corpo dela.',
    ],
    'Distribuir precisa de três objetos ou mais: com dois, não há "espaço entre eles" para igualar.',
    ['alinhar', 'distribuir'],
    [
      ['Três ícones já agrupados — lanterna, cantil e bússola —, cada um numa altura, selecionados com **Ctrl+A**. O botão é **Alinhar à base**.', 'O editor com três ícones simples em alturas diferentes, os três circulados juntos. Na barra, o botão Alinhar à base está circulado; a lista de camadas mostra os três grupos selecionados.'],
      ['Agora os três pisam na mesma linha. Os vãos entre eles ainda são diferentes; o botão seguinte é **Distribuir horizontalmente**.', 'Os três ícones com a base na mesma altura, circulados. O cantil está mais perto da lanterna que da bússola. O botão Distribuir horizontalmente está circulado.'],
      ['Com os vãos iguais, a fileira parece arrumada de propósito.', 'Os três ícones na mesma base e com espaços iguais entre si, circulados juntos.'],
    ],
  ),
];

/* ── Módulo 6: texto em curvas ───────────────────────────────────────────── */

const TEXTO_EM_CURVAS: TopicoDeVereda[] = [
  t(
    'a-fonte-mora-no-computador',
    'A fonte mora no computador',
    'Um texto guarda as letras e o nome da fonte; o desenho delas está em outro arquivo.',
    [
      'Quando você escreve "CAMPORI" no editor, o arquivo guarda as letras e o **nome** da fonte. O desenho de cada letra mora num arquivo de fonte instalado no seu computador, e é de lá que o programa o tira para mostrar na tela.',
      'Mande o arquivo para a gráfica, e o computador de lá procura a mesma fonte. Se não tiver, troca por outra — e o nome sai numa letra que ninguém escolheu, às vezes com outro tamanho, saindo da faixa.',
      '**Converter em curvas**, no menu **Objeto**, troca o texto pelo desenho das letras: cada letra vira um caminho, com nós e alças, e o arquivo passa a carregar o próprio desenho. Abre igual em qualquer computador, com fonte ou sem. Na lista de camadas o ícone muda do T para o de caminho, e as Propriedades trocam Família e Corpo por Preenchimento.',
      'Para converter, a fonte precisa estar no seu computador, porque é de lá que sai o desenho de cada letra. Neste editor, a fonte instalada é a Space Mono; pedir a conversão de um texto em Arial faz o programa recusar e dizer por quê — que é exatamente o que um programa de verdade diz quando falta o arquivo da fonte.',
    ],
    'Para converter, a fonte precisa estar no seu computador: é de lá que sai o desenho de cada letra.',
    ['texto em curvas', 'fonte'],
    [
      ['O nome "CAMPORI" é texto: o campo **Família** diz Space Mono, e as letras se corrigem no campo Conteúdo.', 'O editor com a palavra CAMPORI em verde-escuro, selecionada e circulada, e o subtítulo Regional Centro-Oeste embaixo. No painel, o campo Família, com Space Mono, está circulado.'],
      ['No menu **Objeto**, o último item é **Converter em curvas**.', 'O menu Objeto aberto, com Unir, Subtrair, Intersectar, Agrupar, Desagrupar e, por último, Converter em curvas, circulado.'],
      ['Depois de converter, "CAMPORI" é um caminho: o ícone da camada mudou, e o painel só oferece preenchimento e traço.', 'A palavra CAMPORI igual na prancha, circulada. A lista de camadas, circulada, mostra Nome do evento com o ícone de caminho, e o painel tem só X, Y, L, A e a seção Preenchimento e traço.'],
      ['Pedindo o mesmo para o subtítulo em Arial, o programa recusa: o arquivo dessa fonte não está neste computador.', 'O subtítulo selecionado, e no alto do painel um aviso amarelo, circulado, dizendo que o arquivo da fonte Arial não está neste computador e que converter precisa do desenho das letras.'],
    ],
  ),
  t(
    'converter-nao-tem-volta',
    'Converter não tem volta',
    'Depois de convertido, corrigir uma letra é redesenhá-la. Guarde antes uma cópia.',
    [
      'Depois de converter, o texto deixa de ser texto: não dá para clicar e corrigir um erro de digitação, nem trocar a fonte. Quem descobre que o nome do clube foi convertido com uma letra errada precisa desenhar a letra de novo, nó por nó.',
      'Por isso o costume é guardar **duas versões**: a editável, com o texto vivo, e a convertida, que vai para fora. No editor, **Duplicar prancha** antes de converter faz isso: a original fica com o texto, e é na cópia — que aparece com "(cópia)" no nome — que se converte. Se o nome mudar, converte-se de novo a partir da editável.',
      'Converta só o que sai do seu computador: o arquivo que vai para a gráfica, para a estamparia, para outra pessoa abrir. Enquanto o desenho é seu e ainda vai mudar, o texto fica texto.',
    ],
    'Converter também tira o texto da busca e do leitor de tela: num site, texto precisa continuar sendo texto.',
    ['versão editável', 'duplicar antes'],
    [
      ['Primeiro **Duplicar prancha**; depois, na cópia, **Converter em curvas**. A lista guarda as duas: a original, com o texto vivo, e a cópia convertida, que vai para a gráfica.', 'O editor com a lista de pranchas circulada, mostrando Nome do evento e Nome do evento (cópia), a segunda aberta. No painel, também circulado, o nome convertido aparece só com preenchimento e traço, sem campo de família nem de conteúdo.'],
    ],
  ),
];

/* ── Módulo 7: reproduzir um logotipo ────────────────────────────────────── */

const LOGOTIPO: TopicoDeVereda[] = [
  t(
    'olhar-antes-de-desenhar',
    'Olhar antes de desenhar',
    'Desmontar o logotipo em formas simples, e medir as relações entre elas.',
    [
      'Reproduzir um logotipo começa sem desenhar nada. Olhe e desmonte: este escudo é um retângulo com um triângulo embaixo; este sol é um círculo; um anel seria um círculo menos outro círculo. Cada peça vira uma forma primitiva, e as que se combinam viram uma booleana.',
      'Depois, meça as **relações**, e não os tamanhos. Quanto o sol ocupa da largura do escudo? A ponta tem que altura, em relação ao topo? O sol fica centrado ou mais para cima? Quem copia relações acerta o logotipo em qualquer tamanho. No escudo das telas, o topo é um retângulo de 160 por 120, a ponta desce mais 100, e o sol, de 80, tem metade da largura do topo e fica centrado nele.',
      'No editor, cada forma tem **X**, **Y**, **L** (largura) e **A** (altura) no painel de propriedades. Digitar o número exato é mais certo que arrastar.',
    ],
    'Comece pela peça maior. As outras se posicionam em relação a ela.',
    ['decompor', 'relação entre partes'],
    [
      ['O escudo desmontado: **topo** retangular, **ponta** triangular e **sol** redondo. A lista de camadas mostra as três peças.', 'O editor com um escudo verde-escuro e um círculo amarelo no meio do topo. A lista de camadas e as três peças, topo, ponta e sol, estão circuladas.'],
      ['Clicando no sol, o painel dá as medidas dele: **X 160**, **Y 90**, **L 80**, **A 80**. É com esses números que se confere a relação com o topo.', 'O sol amarelo selecionado e circulado. No painel, os campos X, Y, L e A, com 160, 90, 80 e 80, estão circulados.'],
    ],
  ),
  t(
    'manter-a-proporcao',
    'Manter a proporção',
    'Pode mudar o tamanho; não pode mudar a forma.',
    [
      '**Proporção** é a relação entre a largura e a altura. Um logotipo quadrado precisa continuar quadrado em qualquer tamanho. Esticado só para um lado, ele vira outro logotipo — mais gordo ou mais magro — e quem o conhece estranha na hora, mesmo sem saber dizer o quê.',
      'Para aumentar ou diminuir, mude largura e altura na mesma razão: se a largura dobra, a altura dobra. No editor, o **grupo** faz isso sozinho — mudar o L de um grupo leva a altura junto, e o painel escreve isso. Numa forma solta, L e A são independentes, e mudar só um estica a figura.',
      'Reproduzir num tamanho diferente do original é permitido; reproduzir com outra proporção não é. O jeito de conferir é comparar o seu com o original de perto, um por cima do outro. O que sobra para fora de um e falta no outro é onde a proporção escorregou.',
    ],
    'Esticar a figura inteira para "caber" num espaço é o erro mais comum com logotipo. Diminua por igual e deixe sobrar espaço.',
    ['proporção', 'escala'],
    [
      ['O escudo agrupado: **L 96** e **A 132**. O painel avisa que o grupo cresce por igual.', 'O editor com um escudo pequeno, agrupado e selecionado, circulado, e uma estrela amarela ao lado. No painel, os campos L e A, com 96 e 132, estão circulados.'],
      ['Com **L 192**, a altura foi junto para **264**: o dobro nos dois. É o mesmo escudo, maior.', 'O escudo com o dobro do tamanho, circulado, com a mesma forma de antes. O painel mostra L 192 e A 264, circulados.'],
      ['A estrela é uma forma solta: mudando só o **L** de 96 para 140, a altura ficou em 90, e a estrela saiu achatada.', 'A estrela selecionada e circulada, agora mais larga que alta, deformada. O painel mostra L 140 e A 90, circulados.'],
    ],
  ),
];

/* ── Módulo 8: ícone em três tamanhos ────────────────────────────────────── */

const ICONE: TopicoDeVereda[] = [
  t(
    'o-icone-pequeno',
    'O ícone pequeno manda',
    'Um ícone se desenha grande e se usa pequeno — e é no pequeno que ele precisa funcionar.',
    [
      'Um ícone é desenhado numa prancha grande, de 256 por 256, onde cabe tudo. Mas ele vai ser visto do tamanho de uma unha: 64 pixels na tela inicial, 32 numa lista, 16 na aba do navegador.',
      'Em 16 pixels, um pixel da tela equivale a 16 unidades da prancha de 256. Qualquer detalhe mais fino que isso — uma linha de 4, um vão de 10 — some, ou vira um borrão cinza no meio do desenho. Uma forma de 120 unidades, por outro lado, ainda ocupa mais de sete pixels.',
      'Por isso ícone bom tem **poucas formas grandes** e contraste forte entre elas. Na lanterna das telas, os raios finos, a alça e a janelinha somem em 16; a versão simples, com o corpo grande e uma luz larga, continua dizendo "lanterna".',
    ],
    'Um ícone que precisa de explicação em 16 pixels precisa de menos peças, e não de mais.',
    ['ícone', 'tamanho mínimo'],
    [
      ['A lanterna com detalhes, vista em **64, 32 e 16 px** na aba Tamanhos. Em 16, os raios e a janelinha já não se distinguem.', 'O editor com o ícone de uma lanterna amarela num círculo verde, com três raios brancos finos em cima e uma janelinha. Na aba Tamanhos, circulada, o mesmo ícone aparece em 64, 32 e 16 pixels, e nos dois menores os detalhes viram pontinhos.'],
      ['A **lanterna simples**, com poucas formas grandes: nos três tamanhos ela continua uma lanterna.', 'A prancha Lanterna simples, com um corpo amarelo largo e uma luz branca oval sobre o círculo verde. Na aba Tamanhos, circulada, as três reduções mostram claramente a mesma lanterna.'],
    ],
  ),
  t(
    'ver-em-tres-tamanhos',
    'Ver em três tamanhos',
    'Ninguém julga um ícone na prancha: julga-se no tamanho em que ele vai ser usado.',
    [
      'Na prancha, ampliado, todo ícone parece bom. O teste é vê-lo no tamanho de verdade. O editor mostra o mesmo desenho em 64, 32 e 16 pixels lado a lado: menu **Exibir**, **Ver em 64, 32 e 16 px**. A aba **Tamanhos** que se abre acompanha a prancha: mexeu no desenho, as reduções mudam junto.',
      'Olhe primeiro o de 16. Se ele ainda diz o que é, o ícone está pronto. Se virou uma mancha, volte à prancha e tire peças, engrosse linhas, aumente vãos — e veja de novo.',
      'Vetor ajuda, mas não faz milagre: ele redesenha a forma sem serrilhar em qualquer tamanho, e mesmo assim a tela tem só dezesseis pixels de largura para mostrar o que você desenhou.',
    ],
    'Desenhe pensando no 16 desde o começo. Tirar detalhe de um ícone pronto dói mais do que não pôr.',
    ['legibilidade', 'três tamanhos'],
    [
      ['No menu **Exibir**, o item **Ver em 64, 32 e 16 px** fica logo abaixo do zoom.', 'O menu Exibir aberto, com os zooms de 100% a 800% e, embaixo, o item Ver em 64, 32 e 16 px, circulado.'],
      ['A aba **Tamanhos** aparece ao lado de Cores, com as três reduções da prancha aberta.', 'O painel da direita com a aba Tamanhos circulada e, embaixo, as reduções do ícone em 64, 32 e 16 pixels, também circuladas, com a nota de que cada pixel do de 16 é um quadrado de 16 unidades da prancha.'],
    ],
  ),
];

/* ── Módulo 9: o SVG por dentro ──────────────────────────────────────────── */

const SVG: TopicoDeVereda[] = [
  t(
    'svg-e-texto',
    'O SVG é texto',
    'O arquivo vetorial mais comum da web se abre no Bloco de Notas.',
    [
      '**SVG** quer dizer Gráfico Vetorial Escalável, em inglês. É o formato vetorial que todo navegador abre, e ele tem uma coisa rara: é **texto**. Abrindo num editor de texto simples, o que aparece não são símbolos estranhos, e sim a receita do desenho, linha por linha.',
      'Cada forma é uma marca, parecida com as do HTML. O retângulo é `rect`, com `x` e `y` do canto e `width` e `height` do tamanho. A elipse é `ellipse`, com `cx` e `cy` do centro e `rx` e `ry` dos raios. O caminho é `path`, e o atributo `d` guarda os nós: `M` é mover para, `L` é linha até, `C` é curva com as duas alças, e `Z` fecha. E `data-nome` é o nome que a camada tinha no editor, que é como se acha a forma.',
      'No editor, o SVG sai pelo menu **Arquivo › Exportar como SVG**, com o nome da prancha. O PNG é o outro lado: um arquivo de pontos. Ele guarda a cor de cada quadradinho no tamanho em que foi exportado, abre em qualquer lugar, e não se edita como receita.',
    ],
    'No SVG, o y cresce para baixo: y="0" é o alto da prancha, e um y maior desce a forma.',
    ['SVG', 'PNG', 'coordenada'],
    [
      ['No menu **Arquivo**, **Exportar como SVG** grava a prancha aberta na pasta de desenhos.', 'O editor com a placa de saída, um quadrado verde com uma seta branca e uma faixa branca embaixo. O menu Arquivo está aberto, com Exportar como SVG circulado.'],
      ['Aberto no **editor de texto**, o arquivo é a receita: uma linha por forma, com o nome de cada camada em `data-nome` e os números de cada uma.', 'O Bloco de Notas com o arquivo placa-de-saida.svg aberto e circulado: uma linha svg, uma rect de fundo branco, a rect da Placa, o path da Seta com o atributo d cheio de números e a rect da Faixa, com x 40 e y 200.'],
    ],
  ),
  t(
    'mexer-com-a-mao',
    'Mexer com a mão',
    'Mudar um número no texto muda o desenho — e é a prova de que o arquivo é feito de coordenadas.',
    [
      'Ache no SVG a linha da forma pelo nome — `data-nome="Faixa"`. Troque um número — o `y` da faixa, de 200 para 30 — e salve com Ctrl+S. Abrindo o arquivo de novo no editor de desenho, em **Arquivo › Abrir SVG**, a faixa aparece lá em cima. Nenhuma ferramenta mexeu nela: foi o número.',
      'É assim que muito ícone de site é ajustado: alguém abre o arquivo, muda a cor do `fill` ou um número do `d`, e pronto. Também é assim que se descobre por que um ícone saiu com um pedaço cortado — uma coordenada fora do `viewBox`.',
      'Cuidado com o que se apaga. Uma aspa ou um sinal de maior que some quebra o arquivo inteiro, e o editor de desenho recusa abri-lo dizendo onde está o problema. Mude só números, um de cada vez.',
    ],
    'Exporte de novo pelo editor de desenho e o arquivo é reescrito: a mudança feita à mão some. Exportar é sempre a partir do desenho.',
    ['editar o SVG', 'efeito da coordenada'],
    [
      ['Na linha da Faixa, **y="200"** virou **y="30"**, e o Ctrl+S salvou: a régua de baixo diz **Salvo**.', 'O Bloco de Notas com o arquivo placa-de-saida.svg, circulado, em que a linha da Faixa agora diz y igual a 30. A régua de status embaixo, também circulada, diz Salvo.'],
      ['De volta ao editor de desenho, em **Arquivo**, o SVG aparece embaixo de **Abrir SVG**.', 'O editor de design com o menu Arquivo aberto, mostrando Exportar como SVG, Exportar como PNG e, embaixo de Abrir SVG, o arquivo placa-de-saida.svg, circulado.'],
      ['Reaberto, o desenho mostra a faixa no alto da placa: só o número mudou.', 'A placa de saída reaberta no editor, com a faixa branca agora no topo do quadrado verde, circulada, acima da seta.'],
    ],
  ),
];

export const MODULOS_DO_DESENHO_VETORIAL: ModuloDeVereda[] = [
  {
    id: 'm1', titulo: 'Receita ou mosaico',
    resumo: 'Vetor e imagem de pontos, e qual serve para cada uso.',
    licoes: [
      {
        id: 'm1-teoria', tipo: 'teoria', questoes: Q['m1-teoria'], perguntas: 4,
        titulo: 'Vetor e imagem de pontos', resumo: 'O que cada um guarda, e o que acontece ao ampliar.',
        topicos: VETOR_E_PONTOS,
      },
      {
        id: 'm1-lab', tipo: 'vetorial', licao: 'vetor-e-pontos',
        titulo: 'Ampliando o emblema e a foto',
        resumo: 'Os dois a 800%, e seis usos do clube para classificar.',
        verificacoes: ['ampliou-os-dois', 'classificou-os-usos', 'explicou-a-diferenca'],
      },
    ],
  },
  {
    id: 'm2', titulo: 'Duas formas, uma só',
    resumo: 'Formas primitivas e as operações de união, subtração e interseção.',
    licoes: [
      {
        id: 'm2-teoria', tipo: 'teoria', questoes: Q['m2-teoria'], perguntas: 4,
        titulo: 'Formas primitivas e booleanas', resumo: 'De que formas simples um ícone é feito, e como juntá-las.',
        topicos: BOOLEANAS,
      },
      {
        id: 'm2-lab', tipo: 'vetorial', licao: 'booleanas',
        titulo: 'Montando os ícones do acampamento',
        resumo: 'Barraca, lua, folha e nuvem, cada uma de formas soltas.',
        verificacoes: ['barraca-combinada', 'lua-combinada', 'folha-combinada', 'nuvem-combinada'],
      },
    ],
  },
  {
    id: 'm3', titulo: 'Onde a linha vira',
    resumo: 'Nó, alça, curva de Bézier e a caneta.',
    licoes: [
      {
        id: 'm3-teoria', tipo: 'teoria', questoes: Q['m3-teoria'], perguntas: 4,
        titulo: 'Nós, alças e curvas', resumo: 'O que guarda uma curva, e as duas ferramentas que mexem nela.',
        topicos: CURVAS,
      },
      {
        id: 'm3-lab', tipo: 'vetorial', licao: 'curvas',
        titulo: 'Ondulando a bandeira e desenhando a folha',
        resumo: 'Dois nós que viram suaves, e uma folha posta nó a nó.',
        verificacoes: ['bandeira-ondulada', 'folha-com-a-caneta'],
      },
    ],
  },
  {
    id: 'm4', titulo: 'A borda e o miolo',
    resumo: 'Traço e preenchimento, espessura e extremidade.',
    licoes: [
      {
        id: 'm4-teoria', tipo: 'teoria', questoes: Q['m4-teoria'], perguntas: 4,
        titulo: 'Traço e preenchimento', resumo: 'As duas tintas de uma forma, e como uma linha termina.',
        topicos: TRACO,
      },
      {
        id: 'm4-lab', tipo: 'vetorial', licao: 'traco',
        titulo: 'Pintando a placa da trilha',
        resumo: 'Uma trilha fina demais, uma seta preenchida e uma placa sem borda.',
        verificacoes: ['trilha-grossa-e-redonda', 'seta-sem-preenchimento', 'placa-com-contorno'],
      },
    ],
  },
  {
    id: 'm5', titulo: 'Peças que andam juntas',
    resumo: 'Camadas, grupos, alinhar e distribuir.',
    licoes: [
      {
        id: 'm5-teoria', tipo: 'teoria', questoes: Q['m5-teoria'], perguntas: 4,
        titulo: 'Camadas, grupos e alinhamento', resumo: 'Quem fica na frente, quem anda junto, e o mesmo espaço entre todos.',
        topicos: CAMADAS,
      },
      {
        id: 'm5-lab', tipo: 'vetorial', licao: 'camadas',
        titulo: 'Organizando os três ícones',
        resumo: 'Sete peças soltas que viram três grupos alinhados.',
        verificacoes: ['tres-grupos', 'mesma-base', 'mesmo-vao'],
      },
    ],
  },
  {
    id: 'm6', titulo: 'A letra que viaja',
    resumo: 'Converter texto em curvas, e quando isso é preciso.',
    licoes: [
      {
        id: 'm6-teoria', tipo: 'teoria', questoes: Q['m6-teoria'], perguntas: 4,
        titulo: 'Texto em curvas', resumo: 'Onde mora o desenho da letra, e por que guardar a versão editável.',
        topicos: TEXTO_EM_CURVAS,
      },
      {
        id: 'm6-lab', tipo: 'vetorial', licao: 'texto-em-curvas',
        titulo: 'Preparando a assinatura para a gráfica',
        resumo: 'Uma cópia editável, o nome em curvas, e o porquê escrito.',
        verificacoes: ['guardou-o-editavel', 'nome-em-curvas', 'porque-converter'],
      },
    ],
  },
  {
    id: 'm7', titulo: 'O logotipo do examinador',
    resumo: 'Reproduzir um logotipo simples mantendo as proporções.',
    licoes: [
      {
        id: 'm7-teoria', tipo: 'teoria', questoes: Q['m7-teoria'], perguntas: 4,
        titulo: 'Reproduzir um logotipo', resumo: 'Desmontar em formas simples, e copiar relações.',
        topicos: LOGOTIPO,
      },
      {
        id: 'm7-lab', tipo: 'vetorial', licao: 'logotipo',
        titulo: 'Redesenhando o logotipo pedido',
        resumo: 'Anel, barraca e base, por cima da guia.',
        verificacoes: ['reproduziu-o-logotipo', 'mesma-proporcao'],
      },
    ],
  },
  {
    id: 'm8', titulo: 'Do tamanho de uma unha',
    resumo: 'Criar um ícone próprio e conferi-lo em três tamanhos.',
    licoes: [
      {
        id: 'm8-teoria', tipo: 'teoria', questoes: Q['m8-teoria'], perguntas: 4,
        titulo: 'Ícones pequenos', resumo: 'Poucas formas grandes, e o teste no tamanho de verdade.',
        topicos: ICONE,
      },
      {
        id: 'm8-lab', tipo: 'vetorial', licao: 'icone',
        titulo: 'Desenhando o meu ícone',
        resumo: 'Uma prancha de 256 vazia, e a prova dos 16 pixels.',
        verificacoes: ['desenhou-o-icone', 'viu-em-tres-tamanhos', 'legivel-em-16'],
      },
    ],
  },
  {
    id: 'm9', titulo: 'A receita aberta',
    resumo: 'Exportar em SVG e PNG, e mudar uma coordenada à mão.',
    licoes: [
      {
        id: 'm9-teoria', tipo: 'teoria', questoes: Q['m9-teoria'], perguntas: 4,
        titulo: 'O SVG por dentro', resumo: 'As marcas de cada forma, e o número que move o desenho.',
        topicos: SVG,
      },
      {
        id: 'm9-lab', tipo: 'vetorial', licao: 'svg',
        titulo: 'Abrindo o ícone no editor de texto',
        resumo: 'Exportar, achar a forma, mudar um número e reabrir.',
        verificacoes: ['exportou-svg-e-png', 'mexeu-numa-coordenada', 'reabriu-e-viu'],
      },
    ],
  },
];
