import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DO_DESENHO_VETORIAL as Q } from './questoesDoDesenhoVetorial';

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
 * ── Os números ──────────────────────────────────────────────────────────
 * Os poucos que a teoria cita saem do mesmo motor que desenha, e
 * `exemplosDoDesenhoVetorial.test.ts` os confere.
 */

const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], exemplo: string, atencao: string, marcas: string[],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, exemplo, exemploComo: 'texto' as const, atencao, marcas,
});

/* ── Módulo 1: vetor e pontos ─────────────────────────────────────────────── */

const VETOR_E_PONTOS: TopicoDeVereda[] = [
  t(
    'receita-ou-mosaico',
    'Receita ou mosaico',
    'A imagem de pontos guarda a cor de cada quadradinho; o vetor guarda a receita da forma.',
    [
      'Uma foto do celular é uma **imagem de pontos**: uma grade de milhões de quadradinhos, cada um com uma cor. O arquivo guarda a cor de cada um, e mais nada. É por isso que ela registra tudo o que a câmera viu — a fumaça da fogueira, o rosto de cada desbravador — sem ninguém precisar desenhar nada.',
      'Um **vetor** guarda outra coisa: a receita do desenho. "Um círculo com centro aqui e este raio, pintado de verde." Quem abre o arquivo refaz a conta e desenha o círculo do tamanho que for pedido.',
      'A diferença aparece quando se amplia. Na foto, ampliar só deixa cada quadradinho maior, até a imagem virar um mosaico. No vetor, ampliar é refazer a receita num tamanho maior: a borda continua lisa em qualquer tamanho.',
    ],
    `O mesmo círculo, guardado de dois jeitos

  Imagem de pontos          Vetor
  ─────────────────         ─────────────────────────
  quadradinho 1: branco     círculo
  quadradinho 2: branco       centro: 100, 100
  quadradinho 3: verde        raio: 80
  ... e mais 39.997           cor: verde
  ampliado: degraus         ampliado: borda lisa`,
    'Ampliar uma foto nunca devolve detalhe que a câmera não gravou. O programa só pode inventar o meio-termo entre dois quadradinhos.',
    ['vetor', 'imagem de pontos'],
  ),
  t(
    'cada-uso-o-seu',
    'Cada uso pede o seu',
    'Vetor para o que precisa mudar de tamanho; pontos para o que veio de uma câmera.',
    [
      'O logotipo do clube vai no canto do papel timbrado e na faixa de três metros da entrada do campori. Desenhado em vetor, é o mesmo arquivo nos dois. Em pontos, a faixa sai serrilhada — ou alguém precisa redesenhar.',
      'A foto da fogueira não tem receita nenhuma: ninguém escreve a fórmula da fumaça. Foto, ficha passada no digitalizador e retrato são pontos por natureza, e tentar convertê-los em vetor dá um desenho de borrões chapados.',
      'A pergunta que decide é: **de onde veio** a imagem, e **para que tamanho** ela vai? Desenho que alguém fez e que vai mudar de tamanho pede vetor. Imagem que veio de uma câmera ou de um digitalizador é de pontos.',
    ],
    `Vetor                              Pontos

  Logotipo do clube                  Foto do acampamento
  Ícone do aplicativo                Ficha escaneada
  Desenho da camiseta                Foto de perfil
  (desenhados, mudam de tamanho)     (vieram de uma câmera)`,
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
      'Olhe o ícone de uma barraca: é um triângulo com outro triângulo menor recortado embaixo, que é a porta. Uma lua é um círculo menos outro círculo. Uma nuvem são três círculos colados. Antes de desenhar curva por curva, quem desenha em vetor pergunta: **de que formas simples isto é feito?**',
      'Essas formas simples se chamam **formas primitivas**: o retângulo, a elipse e o triângulo, que o editor desenha com um clique. Elas já nascem certas — o círculo é redondo de verdade e o triângulo tem os lados retos —, o que nenhuma mão consegue com a caneta.',
      'Depois elas são **combinadas** numa forma só. Juntas na prancha, elas ainda são peças soltas: mudar a cor da lona não muda a da porta, e um contorno passaria pelo meio do desenho.',
    ],
    `Ícone            Formas que formam

  Barraca        triângulo − triângulo menor
  Lua            círculo − círculo deslocado
  Nuvem          círculo + círculo + círculo
  Folha          círculo ∩ círculo deslocado`,
    'Desenhar a lua com a caneta é possível, mas a curva sai torta. Dois círculos dão a lua certa em dez segundos.',
    ['forma primitiva', 'combinar'],
  ),
  t(
    'unir-subtrair-intersectar',
    'Unir, subtrair, intersectar',
    'Três operações que transformam duas formas numa só.',
    [
      '**Unir** junta as formas e apaga as divisas: três círculos encostados viram o contorno de uma nuvem, sem as curvas de dentro.',
      '**Subtrair** usa a forma de cima como faca: o que ela cobre sai da forma de baixo. Por isso a ordem importa — quem perde o pedaço é sempre a forma **de baixo** na lista de camadas, e a de cima desaparece depois de cortar. Ela não depende de qual você clicou primeiro.',
      '**Intersectar** guarda só a parte em que as formas se cobrem. Dois círculos que se cruzam deixam o miolo entre eles, com duas pontas: é a forma de uma folha.',
      'O resultado fica com a cor e o nome da forma de baixo. Selecione as duas na lista de camadas (Shift + clique soma) e use os botões da barra ou o menu Objeto.',
    ],
    `Lua: a de cima corta a de baixo

  Antes                   Depois de Subtrair
  ( Lua )  ← embaixo      ( Lua ) com a mordida
   ( O que sai ) ← em cima    "O que sai" sumiu`,
    'Se a forma errada sumiu, Ctrl+Z desfaz e Trazer para frente troca qual fica em cima.',
    ['união', 'subtração', 'interseção'],
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
    ],
    `Uma curva entre dois nós

   alça ●
         \\
          ● nó 1 ─ ─ ─ ─ ─ ─ ● nó 2
                              \\
                               ● alça

  A curva sai do nó 1 para cima e chega no nó 2 por baixo.`,
    'Mais nós não deixam a curva mais bonita: deixam ondulada. Uma onda boa tem poucos nós e alças bem postas.',
    ['nó', 'alça', 'nó suave', 'nó de canto'],
  ),
  t(
    'a-curva-de-bezier',
    'A curva de Bézier',
    'Quatro pontos guardam uma curva inteira: dois nós e duas alças.',
    [
      'A curva entre dois nós se chama **curva de Bézier**, pelo nome do engenheiro francês que a usou para desenhar carrocerias de carro. Ela é guardada com só quatro pontos: o nó de onde sai, a alça dele, a alça do nó de chegada e o nó de chegada. O programa calcula todo o resto.',
      'Um círculo inteiro sai de quatro nós suaves, um em cada ponto cardeal, com alças de comprimento um pouco maior que a metade do raio (0,55 do raio). Mais curta, ele sai achatado nos lados; mais comprida, sai quadradão.',
      'No editor, a **caneta** desenha os nós: clicar põe um nó de canto, e clicar e **arrastar** põe um nó suave, puxando a alça. Clicar de novo no primeiro nó fecha o caminho; Enter termina com ele aberto. A ferramenta **Editar nós** mexe no que já existe: arrastar um nó, puxar uma alça, trocar canto por suave.',
    ],
    `Desenhar uma folha com a caneta

  1. clique na ponta de baixo        → nó de canto
  2. clique e arraste no lado direito → nó suave
  3. clique na ponta de cima         → nó de canto
  4. clique e arraste no lado esquerdo → nó suave
  5. clique no primeiro nó           → fecha`,
    'Arraste na direção em que a linha deve seguir, e não na direção do nó seguinte.',
    ['curva de Bézier', 'caneta', 'editar nós'],
  ),
];

/* ── Módulo 4: traço e preenchimento ─────────────────────────────────────── */

const TRACO: TopicoDeVereda[] = [
  t(
    'dentro-e-borda',
    'O de dentro e a borda',
    'Preenchimento pinta a área; traço pinta a linha do caminho.',
    [
      'Toda forma vetorial tem duas tintas. O **preenchimento** pinta a área de dentro. O **traço** pinta a própria linha do caminho, com uma espessura — é o contorno de uma placa, a linha de uma trilha no mapa.',
      'As duas são independentes: uma placa pode ter fundo amarelo e borda marrom; uma seta pode ser só linha, sem fundo nenhum. Cada uma pode ser desligada.',
      'Caminho **aberto** — uma linha que não volta ao começo — deveria quase sempre ficar sem preenchimento. Preencher uma linha aberta faz o programa fechá-la por uma reta que ninguém desenhou, e a seta vira um triângulo pintado.',
    ],
    `Placa da trilha

  Preenchimento: amarelo     a área de dentro
  Traço: marrom, 8           a borda em volta

  Seta da trilha
  Preenchimento: nenhum      linha aberta
  Traço: escuro, 12          só a linha`,
    'O traço fica metade para dentro e metade para fora da linha do caminho. Uma borda de 8 aumenta a forma 4 de cada lado.',
    ['traço', 'preenchimento'],
  ),
  t(
    'espessura-e-extremidade',
    'Espessura e extremidade',
    'A grossura da linha, e o jeito como ela termina.',
    [
      'A **espessura** é a grossura do traço. Num mapa, a trilha principal costuma ser grossa e a secundária fina — é uma hierarquia, como a dos tamanhos de letra da vereda anterior.',
      'A **extremidade** é o jeito como uma linha aberta termina. **Reta** corta a linha exatamente no último nó. **Redonda** acaba num meio círculo, como a ponta de um pincel. **Quadrada** passa um pouco do nó, com a ponta reta.',
      'Em linha fina a diferença quase não aparece. Em linha grossa ela muda o desenho: uma trilha de 12 com ponta reta parece cortada a tesoura; com ponta redonda, parece desenhada.',
    ],
    `Três linhas de espessura 12, do mesmo tamanho

  Reta        ████████████        termina no nó
  Redonda    (████████████)       meio círculo além do nó
  Quadrada   [████████████]       meio quadrado além do nó`,
    'Extremidade só existe em caminho aberto. Num caminho fechado não há ponta para terminar.',
    ['espessura', 'extremidade'],
  ),
];

/* ── Módulo 5: camadas, grupos, alinhar e distribuir ─────────────────────── */

const CAMADAS: TopicoDeVereda[] = [
  t(
    'camada-e-grupo',
    'Camada e grupo',
    'A lista de camadas diz quem fica na frente; o grupo diz quem anda junto.',
    [
      'Cada objeto da prancha é uma **camada**, e a lista de camadas mostra a ordem: o que está mais acima na lista fica na frente no desenho. A porta da barraca só aparece se estiver acima da lona.',
      'Um ícone feito de cinco peças vira cinco linhas soltas na lista, e mover o ícone exige pegar as cinco sem esquecer nenhuma. **Agrupar** (Ctrl+G) junta as peças num objeto só: elas se movem, se alinham e se copiam juntas, e continuam sendo peças separadas por dentro.',
      'Dê nome ao grupo. "Grupo 3" não diz nada a quem abrir o arquivo amanhã; "Fogueira" diz. Num arquivo com trinta camadas, o nome é o que faz alguém achar a peça.',
    ],
    `Camadas soltas          Agrupadas e nomeadas

  Chama                   ▸ Fogueira
  Lenha 2                 ▸ Barraca
  Lenha 1                 ▸ Árvore
  Porta
  Lona
  Copa
  Tronco`,
    'Desagrupar (Ctrl+Shift+G) devolve as peças soltas sem mudar nada no desenho.',
    ['camada', 'grupo', 'nome da camada'],
  ),
  t(
    'alinhar-e-distribuir',
    'Alinhar e distribuir',
    'Alinhar põe na mesma linha; distribuir põe o mesmo espaço entre eles.',
    [
      '**Alinhar** encosta os objetos selecionados numa mesma linha. Alinhar à base põe o pé de todos na mesma altura — é o que três ícones lado a lado precisam, para não parecer que um está flutuando.',
      '**Distribuir** iguala o espaço entre eles. Com três ícones, ele deixa o primeiro e o último onde estão e move o do meio até os dois vãos ficarem iguais.',
      'Alinhar e distribuir a olho erra por poucos pixels, e é o erro da vereda anterior: ninguém mede, todo mundo percebe. Os botões fazem a conta exata. Agrupe antes: alinhando as peças soltas, a chama vai parar no pé da lenha.',
    ],
    `Antes                         Depois

  ▲                                 ▲      ♣      🔥
       ♣                          ─────────────────
           🔥                     base igual, vãos iguais`,
    'Distribuir precisa de três objetos ou mais: com dois, não há "espaço entre eles" para igualar.',
    ['alinhar', 'distribuir'],
  ),
];

/* ── Módulo 6: texto em curvas ───────────────────────────────────────────── */

const TEXTO_EM_CURVAS: TopicoDeVereda[] = [
  t(
    'a-fonte-mora-no-computador',
    'A fonte mora no computador',
    'Um texto guarda as letras e o nome da fonte; o desenho delas está em outro arquivo.',
    [
      'Quando você escreve "PIONEIROS" no editor, o arquivo guarda as letras e o **nome** da fonte. O desenho de cada letra mora num arquivo de fonte instalado no seu computador, e é de lá que o programa o tira para mostrar na tela.',
      'Mande o arquivo para a gráfica, e o computador de lá procura a mesma fonte. Se não tiver, troca por outra — e o nome do clube sai numa letra que ninguém escolheu, às vezes com outro tamanho, saindo da faixa.',
      '**Converter em curvas** troca o texto pelo desenho das letras: cada letra vira um caminho, com nós e alças, e o arquivo passa a carregar o próprio desenho. Abre igual em qualquer computador, com fonte ou sem.',
    ],
    `Antes                         Depois de converter

  Texto: "PIONEIROS"            Caminho com 9 letras desenhadas
  Fonte: Space Mono             (nenhuma fonte é preciso)
  depende do computador         abre igual em todo lugar`,
    'Para converter, a fonte precisa estar no seu computador: é de lá que sai o desenho de cada letra.',
    ['texto em curvas', 'fonte'],
  ),
  t(
    'converter-nao-tem-volta',
    'Converter não tem volta',
    'Depois de convertido, corrigir uma letra é redesenhá-la. Guarde antes uma cópia.',
    [
      'Depois de converter, o texto deixa de ser texto: não dá para clicar e corrigir um erro de digitação, nem trocar a fonte. Quem descobre que o nome do clube foi convertido com uma letra errada precisa desenhar a letra de novo, nó por nó.',
      'Por isso o costume é guardar **duas versões**: a editável, com o texto vivo, e a convertida, que vai para fora. No editor, **Duplicar prancha** antes de converter faz isso. Se o nome mudar, converte-se de novo a partir da editável.',
      'Converta só o que sai do seu computador: o arquivo que vai para a gráfica, para a estamparia, para outra pessoa abrir. Enquanto o desenho é seu e ainda vai mudar, o texto fica texto.',
    ],
    `Prancha "Assinatura do clube"          → convertida, vai para a gráfica
Prancha "Assinatura do clube (cópia)"  → editável, fica com você`,
    'Converter também tira o texto da busca e do leitor de tela: num site, texto precisa continuar sendo texto.',
    ['versão editável', 'duplicar antes'],
  ),
];

/* ── Módulo 7: reproduzir um logotipo ────────────────────────────────────── */

const LOGOTIPO: TopicoDeVereda[] = [
  t(
    'olhar-antes-de-desenhar',
    'Olhar antes de desenhar',
    'Desmontar o logotipo em formas simples, e medir as relações entre elas.',
    [
      'Reproduzir um logotipo começa sem desenhar nada. Olhe e desmonte: este anel é um círculo menos outro círculo; esta barraca é um triângulo; esta base é um retângulo fino. Cada peça vira uma forma primitiva, e as que se combinam viram uma booleana.',
      'Depois, meça as **relações**, e não os tamanhos. Quanto a barraca ocupa da largura do anel? A espessura do anel é que fração do diâmetro? A base fica onde, em relação ao fundo do anel? Quem copia relações acerta o logotipo em qualquer tamanho.',
      'No editor, cada forma tem X, Y, largura e altura no painel de propriedades. Digitar o número exato é mais certo que arrastar.',
    ],
    `O logotipo pedido, desmontado

  Anel     círculo de 160 − círculo de 110 no centro
  Barraca  triângulo de 90, pouco mais da metade do anel
  Base     retângulo de 180 × 18, mais largo que o anel`,
    'Comece pela peça maior. As outras se posicionam em relação a ela.',
    ['decompor', 'relação entre partes'],
  ),
  t(
    'manter-a-proporcao',
    'Manter a proporção',
    'Pode mudar o tamanho; não pode mudar a forma.',
    [
      '**Proporção** é a relação entre a largura e a altura. Um logotipo quadrado precisa continuar quadrado em qualquer tamanho. Esticado só para um lado, ele vira outro logotipo — mais gordo ou mais magro — e quem o conhece estranha na hora, mesmo sem saber dizer o quê.',
      'Para aumentar ou diminuir, mude largura e altura na mesma razão: se a largura dobra, a altura dobra. Reproduzir num tamanho diferente do original é permitido; reproduzir com outra proporção não é.',
      'O jeito de conferir é comparar o seu com o original de perto, um por cima do outro. O que sobra para fora de um e falta no outro é onde a proporção escorregou.',
    ],
    `Original    Mesma proporção    Esticado

   ┌──┐         ┌────┐           ┌────────┐
   └──┘         │    │           └────────┘
                └────┘
  100×100      200×200           200×100 ✗`,
    'Esticar a figura inteira para "caber" num espaço é o erro mais comum com logotipo. Diminua por igual e deixe sobrar espaço.',
    ['proporção', 'escala'],
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
      'Em 16 pixels, um pixel da tela equivale a 16 unidades da prancha de 256. Qualquer detalhe mais fino que isso — uma linha de 8, um vão de 10 — some, ou vira um borrão cinza no meio do desenho.',
      'Por isso ícone bom tem **poucas formas grandes** e contraste forte entre elas. Barraca, chão e fundo dizem "acampamento" em 16 pixels; a estaca, a corda e a janelinha não dizem nada nesse tamanho.',
    ],
    `Prancha de 256, vista em 16

  1 pixel da tela = 16 unidades da prancha
  linha de 8 unidades   → meio pixel: some
  vão de 10 unidades    → menos de um pixel: tampa
  forma de 120 unidades → mais de 7 pixels: aparece`,
    'Um ícone que precisa de explicação em 16 pixels precisa de menos peças, e não de mais.',
    ['ícone', 'tamanho mínimo'],
  ),
  t(
    'ver-em-tres-tamanhos',
    'Ver em três tamanhos',
    'Ninguém julga um ícone na prancha: julga-se no tamanho em que ele vai ser usado.',
    [
      'Na prancha, ampliado, todo ícone parece bom. O teste é vê-lo no tamanho de verdade. O editor mostra o mesmo desenho em 64, 32 e 16 pixels lado a lado: menu Exibir, **Ver em 64, 32 e 16 px**.',
      'Olhe primeiro o de 16. Se ele ainda diz o que é, o ícone está pronto. Se virou uma mancha, volte à prancha e tire peças, engrosse linhas, aumente vãos — e veja de novo.',
      'Vetor ajuda, mas não faz milagre: ele redesenha a forma sem serrilhar em qualquer tamanho, e mesmo assim a tela tem só dezesseis pixels de largura para mostrar o que você desenhou.',
    ],
    `Barraca com janelinha e corda:

  64 px  barraca, janela, corda — tudo aparece
  32 px  a corda some
  16 px  a janela vira um ponto cinza na lona`,
    'Desenhe pensando no 16 desde o começo. Tirar detalhe de um ícone pronto dói mais do que não pôr.',
    ['legibilidade', 'três tamanhos'],
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
      'Cada forma é uma marca, parecida com as do HTML. O retângulo é rect, com x e y do canto e width e height do tamanho. A elipse é ellipse, com cx e cy do centro e rx e ry dos raios. O caminho é path, e o atributo d guarda os nós: M é mover para, L é linha até, C é curva com as duas alças, e Z fecha.',
      'O PNG é o outro lado: um arquivo de pontos. Ele guarda a cor de cada quadradinho no tamanho em que foi exportado, abre em qualquer lugar, e não se edita como receita.',
    ],
    `<svg width="256" height="256" viewBox="0 0 256 256">
  <ellipse data-nome="Fundo" cx="128" cy="128" rx="104" ry="104" fill="#1B4D3E"/>
  <path data-nome="Barraca" d="M 128 64 L 196 180 L 60 180 Z" fill="#F2C14E"/>
  <rect data-nome="Chão" x="48" y="180" width="160" height="20" fill="#F2C14E"/>
</svg>`,
    'No SVG, o y cresce para baixo: y="0" é o alto da prancha, e um y maior desce a forma.',
    ['SVG', 'PNG', 'coordenada'],
  ),
  t(
    'mexer-com-a-mao',
    'Mexer com a mão',
    'Mudar um número no texto muda o desenho — e é a prova de que o arquivo é feito de coordenadas.',
    [
      'Ache no SVG a linha da forma pelo nome ou pelo id. Troque um número — o y do chão, de 180 para 200 — e salve. Abrindo o arquivo de novo no editor de desenho, o chão aparece 20 unidades mais embaixo. Nenhuma ferramenta mexeu nele: foi o número.',
      'É assim que muito ícone de site é ajustado: alguém abre o arquivo, muda a cor do fill ou um número do d, e pronto. Também é assim que se descobre por que um ícone saiu com um pedaço cortado — uma coordenada fora do viewBox.',
      'Cuidado com o que se apaga. Uma aspa ou um sinal de maior que some quebra o arquivo inteiro, e o editor de desenho recusa abri-lo dizendo onde está o problema. Mude só números, um de cada vez.',
    ],
    `Antes:   <rect data-nome="Chão" x="48" y="180" .../>
Depois:  <rect data-nome="Chão" x="48" y="200" .../>

         o chão desce 20 unidades na prancha`,
    'Exporte de novo pelo editor de desenho e o arquivo é reescrito: a mudança feita à mão some. Exportar é sempre a partir do desenho.',
    ['editar o SVG', 'efeito da coordenada'],
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
