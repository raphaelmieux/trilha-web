import type { Question } from '../types';

/*
 * As questões das lições de teoria da CC-DG002 Desenho Vetorial.
 *
 * A definição vale uma vez por lição; o resto é consequência e diagnóstico —
 * a lua que perdeu o pedaço errado, a seta que virou triângulo, o nome do
 * clube que chegou à gráfica em outra letra. Toda errada diz por que está
 * errada no campo porque, a certa é uma afirmação curta e o porquê dela mora no
 * explanation, pela razão escrita na CC-ES012. Sem crase nem asterisco: a
 * questão vai para o QuestionRenderer, que imprime texto puro.
 */

export const QUESTOES_DO_DESENHO_VETORIAL: Record<string, Question[]> = {
  /* ── Módulo 1 — vetor e pontos (requisitos 2.1 e 3) ──────────────────── */
  'm1-teoria': [
    {
      id: 'DG2-M1-Q1', type: 'multiple_choice',
      prompt: 'O que um arquivo vetorial guarda?',
      data: { options: [
        { id: 'a', text: 'A receita das formas do desenho.', correct: true },
        { id: 'b', text: 'A cor de cada quadradinho da tela.', porque: 'Isso é o que guarda a imagem de pontos.' },
        { id: 'c', text: 'Uma foto tirada em alta resolução.', porque: 'Foto é imagem de pontos, por mais pontos que tenha.' },
        { id: 'd', text: 'O nome do programa que o criou.', porque: 'O programa não define o tipo de imagem que o arquivo guarda.' },
      ]},
      explanation: 'O vetor guarda formas descritas por números — centro, raio, nós, cor —, e quem abre refaz o desenho no tamanho pedido.',
    },
    {
      id: 'DG2-M1-Q2', type: 'multiple_choice',
      prompt: 'Ampliando muito uma foto do acampamento, o que aparece?',
      data: { options: [
        { id: 'a', text: 'Quadradinhos de cor, como um mosaico.', correct: true },
        { id: 'b', text: 'Mais detalhes que a câmera escondia.', porque: 'Ampliar não cria detalhe que não foi gravado.' },
        { id: 'c', text: 'Bordas lisas em qualquer tamanho.', porque: 'Borda lisa em qualquer tamanho é do vetor, não da foto.' },
        { id: 'd', text: 'Os nós e as alças de cada forma.', porque: 'Foto não tem nós: ela é uma grade de pontos.' },
      ]},
      explanation: 'Na imagem de pontos, ampliar só deixa cada ponto maior, até a imagem virar um mosaico de degraus.',
    },
    {
      id: 'DG2-M1-Q3', type: 'multiple_choice',
      prompt: 'O logotipo do clube vai no papel timbrado e numa faixa de três metros. Qual tipo de imagem serve?',
      data: { options: [
        { id: 'a', text: 'Vetor.', correct: true },
        { id: 'b', text: 'Imagem de pontos.', porque: 'Na faixa ela sairia serrilhada, ou precisaria ser redesenhada.' },
        { id: 'c', text: 'Uma foto do papel timbrado.', porque: 'Foto é de pontos, e perde nitidez ao ser ampliada.' },
        { id: 'd', text: 'Tanto faz, se for colorido.', porque: 'Cor não decide nada: quem decide é o tamanho em que ela vai ser usada.' },
      ]},
      explanation: 'Desenho que muda de tamanho pede vetor: é o mesmo arquivo no canto do papel e na faixa.',
    },
    {
      id: 'DG2-M1-Q4', type: 'multiple_choice',
      prompt: 'Qual destes usos pede imagem de pontos?',
      data: { options: [
        { id: 'a', text: 'A ficha passada no digitalizador.', correct: true },
        { id: 'b', text: 'O ícone do aplicativo do clube.', porque: 'O ícone vai do celular ao telão: pede vetor.' },
        { id: 'c', text: 'O desenho da camiseta do campori.', porque: 'A estamparia amplia o desenho, que é feito à mão: pede vetor.' },
        { id: 'd', text: 'O emblema da unidade num cartaz.', porque: 'Emblema é desenho que muda de tamanho: pede vetor.' },
      ]},
      explanation: 'O que veio de uma câmera ou de um digitalizador é de pontos por natureza: não há receita para escrever.',
    },
    {
      id: 'DG2-M1-Q5', type: 'multiple_choice',
      prompt: 'Converter a foto da fogueira em vetor tende a dar o quê?',
      data: { options: [
        { id: 'a', text: 'Um desenho de manchas chapadas.', correct: true },
        { id: 'b', text: 'A mesma foto, só que mais leve.', porque: 'A fumaça e os rostos não têm receita: o que sai é outra imagem.' },
        { id: 'c', text: 'Uma foto que amplia sem perder nada.', porque: 'O detalhe da foto se perde na conversão, e não volta.' },
        { id: 'd', text: 'Um arquivo que só abre no celular.', porque: 'Vetor abre em qualquer lugar; o problema é o que ele mostra.' },
      ]},
      explanation: 'Uma foto não tem formas desenhadas. Convertê-la troca o que a câmera viu por borrões de cor lisa.',
    },
    {
      id: 'DG2-M1-Q6', type: 'true_false',
      prompt: 'Um vetor ampliado continua com a borda lisa.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Ampliar um vetor é refazer a conta das formas num tamanho maior.' },
      ]},
      explanation: 'O vetor é redesenhado a cada tamanho, então a borda nunca vira degrau.',
    },
    {
      id: 'DG2-M1-Q7', type: 'true_false',
      prompt: 'Vetor é sempre melhor que imagem de pontos.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Para uma foto, o vetor perde justamente o que fazia dela uma foto.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Cada um serve a um uso: vetor para o que é desenhado e muda de tamanho, pontos para o que veio da câmera.',
    },
  ],

  /* ── Módulo 2 — formas e booleanas (requisito 4.1) ───────────────────── */
  'm2-teoria': [
    {
      id: 'DG2-M2-Q1', type: 'multiple_choice',
      prompt: 'O que são formas primitivas?',
      data: { options: [
        { id: 'a', text: 'Retângulo, elipse e triângulo.', correct: true },
        { id: 'b', text: 'Os primeiros desenhos do arquivo.', porque: 'Primitiva fala da forma simples, e não de quando ela foi feita.' },
        { id: 'c', text: 'Formas desenhadas com a caneta.', porque: 'Com a caneta se desenha forma livre, nó por nó.' },
        { id: 'd', text: 'As formas que vêm de uma foto.', porque: 'Foto não tem forma nenhuma: tem pontos.' },
      ]},
      explanation: 'São as formas simples que o editor desenha com um clique, já certas: o círculo redondo e o triângulo de lados retos.',
    },
    {
      id: 'DG2-M2-Q2', type: 'multiple_choice',
      prompt: 'Três círculos encostados devem virar a silhueta de uma nuvem, sem as curvas de dentro. Qual operação?',
      data: { options: [
        { id: 'a', text: 'Unir.', correct: true },
        { id: 'b', text: 'Subtrair.', porque: 'Subtrair tira pedaço; a nuvem precisa somar os três.' },
        { id: 'c', text: 'Intersectar.', porque: 'Intersectar guarda só onde os três se cobrem, que é quase nada.' },
        { id: 'd', text: 'Agrupar.', porque: 'Agrupar junta sem apagar as divisas: os círculos continuam três.' },
      ]},
      explanation: 'A união junta as formas e apaga as linhas de dentro, deixando um contorno só.',
    },
    {
      id: 'DG2-M2-Q3', type: 'multiple_choice',
      prompt: 'Dois círculos que se cruzam viram uma folha com duas pontas. Qual operação?',
      data: { options: [
        { id: 'a', text: 'Intersectar.', correct: true },
        { id: 'b', text: 'Unir.', porque: 'A união daria uma forma maior que os dois, sem pontas.' },
        { id: 'c', text: 'Subtrair.', porque: 'Subtrair daria uma lua, e não o miolo entre os dois.' },
        { id: 'd', text: 'Desagrupar.', porque: 'Desagrupar separa peças de um grupo, e não cria forma nova.' },
      ]},
      explanation: 'A interseção guarda só a parte comum aos dois círculos, que tem a forma de uma folha.',
    },
    {
      id: 'DG2-M2-Q4', type: 'multiple_choice',
      prompt: 'Na subtração, qual forma perde o pedaço?',
      data: { options: [
        { id: 'a', text: 'A de baixo na lista de camadas.', correct: true },
        { id: 'b', text: 'A que foi clicada primeiro.', porque: 'A ordem do clique não conta: conta a ordem das camadas.' },
        { id: 'c', text: 'A maior das duas.', porque: 'O tamanho não decide: a de cima corta a de baixo.' },
        { id: 'd', text: 'A de cor mais escura.', porque: 'A cor não entra na operação.' },
      ]},
      explanation: 'A forma de cima funciona como faca: corta a de baixo e some depois do corte.',
    },
    {
      id: 'DG2-M2-Q5', type: 'multiple_choice',
      prompt: 'Alguém subtraiu e a lua sumiu, sobrando só o círculo que devia cortar. O que aconteceu?',
      data: { options: [
        { id: 'a', text: 'A ordem das camadas estava invertida.', correct: true },
        { id: 'b', text: 'Faltou agrupar antes de subtrair.', porque: 'Grupo não entra na booleana; o problema é quem está em cima.' },
        { id: 'c', text: 'Os círculos não se encostavam.', porque: 'Sem se encostar, a lua ficaria inteira, e não sumiria.' },
        { id: 'd', text: 'A lua tinha preenchimento demais.', porque: 'Preenchimento não decide quem é cortado.' },
      ]},
      explanation: 'Quem estava em cima era a lua: ela cortou o outro círculo e sumiu. Ctrl+Z, trocar a ordem e subtrair de novo.',
    },
    {
      id: 'DG2-M2-Q6', type: 'true_false',
      prompt: 'Depois de unir, mudar a cor muda a forma inteira de uma vez.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'A união deixa uma forma só, com uma cor só.' },
      ]},
      explanation: 'Antes, eram peças soltas, cada uma com a sua cor. Unidas, viram um objeto só.',
    },
    {
      id: 'DG2-M2-Q7', type: 'true_false',
      prompt: 'Agrupar e unir dão o mesmo resultado.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O grupo guarda as peças separadas por dentro; a união vira uma forma nova.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O grupo só faz as peças andarem juntas. A união apaga as divisas e cria um contorno só.',
    },
  ],

  /* ── Módulo 3 — curvas (requisitos 2.2, 2.4 e 4.2) ───────────────────── */
  'm3-teoria': [
    {
      id: 'DG2-M3-Q1', type: 'multiple_choice',
      prompt: 'O que é um nó num caminho vetorial?',
      data: { options: [
        { id: 'a', text: 'Um ponto por onde o caminho passa.', correct: true },
        { id: 'b', text: 'O lugar onde duas formas se cruzam.', porque: 'Cruzar formas é assunto das booleanas.' },
        { id: 'c', text: 'Um grupo de camadas com nome.', porque: 'Isso é um grupo, e não um nó.' },
        { id: 'd', text: 'A cor da borda do caminho.', porque: 'A cor da borda é o traço.' },
      ]},
      explanation: 'O caminho é feito de nós ligados por retas ou curvas.',
    },
    {
      id: 'DG2-M3-Q2', type: 'multiple_choice',
      prompt: 'Para que serve a alça de um nó?',
      data: { options: [
        { id: 'a', text: 'Para dizer para onde a curva sai.', correct: true },
        { id: 'b', text: 'Para mover o desenho inteiro.', porque: 'A alça mexe só na curva junto do nó dela.' },
        { id: 'c', text: 'Para escolher a cor do traço.', porque: 'A cor fica no painel de propriedades.' },
        { id: 'd', text: 'Para apagar um nó de canto.', porque: 'A alça dobra a curva; não apaga nada.' },
      ]},
      explanation: 'A curva sai do nó na direção da alça, e segue mais longe nessa direção quanto mais comprida ela for.',
    },
    {
      id: 'DG2-M3-Q3', type: 'multiple_choice',
      prompt: 'O que diferencia o nó suave do nó de canto?',
      data: { options: [
        { id: 'a', text: 'No suave, as alças ficam alinhadas.', correct: true },
        { id: 'b', text: 'O suave não tem alça nenhuma.', porque: 'Sem alça, o caminho faria quina, que é o contrário.' },
        { id: 'c', text: 'O de canto só existe em retângulos.', porque: 'Qualquer caminho pode ter quina: a ponta de uma folha, de uma estrela.' },
        { id: 'd', text: 'O suave sempre fecha o caminho.', porque: 'Fechar o caminho não depende do tipo do nó.' },
      ]},
      explanation: 'Com as alças na mesma reta, a curva passa pelo nó sem quina. No de canto, elas são livres e a linha pode dobrar.',
    },
    {
      id: 'DG2-M3-Q4', type: 'multiple_choice',
      prompt: 'Quantos pontos guardam uma curva de Bézier entre dois nós?',
      data: { options: [
        { id: 'a', text: 'Quatro: dois nós e duas alças.', correct: true },
        { id: 'b', text: 'Dois: o começo e o fim.', porque: 'Com só dois pontos sai uma reta, sem curva.' },
        { id: 'c', text: 'Um para cada pixel da linha.', porque: 'Isso seria guardar pontos, que é o contrário do vetor.' },
        { id: 'd', text: 'Três: o começo, o meio e o fim.', porque: 'O meio não é guardado: ele sai da conta com as alças.' },
      ]},
      explanation: 'O nó de saída, a alça dele, a alça do nó de chegada e o nó de chegada. O programa calcula todo o resto.',
    },
    {
      id: 'DG2-M3-Q5', type: 'multiple_choice',
      prompt: 'Com a caneta, como se põe um nó suave?',
      data: { options: [
        { id: 'a', text: 'Clicando e arrastando.', correct: true },
        { id: 'b', text: 'Clicando duas vezes no lugar.', porque: 'O clique simples põe nó de canto; o arrasto é que puxa a alça.' },
        { id: 'c', text: 'Apertando Enter no meio.', porque: 'Enter termina o caminho aberto.' },
        { id: 'd', text: 'Clicando no primeiro nó.', porque: 'Clicar no primeiro nó fecha o caminho.' },
      ]},
      explanation: 'O arrasto puxa a alça para fora do nó, e o nó nasce suave com as duas alças alinhadas.',
    },
    {
      id: 'DG2-M3-Q6', type: 'true_false',
      prompt: 'Uma onda fica mais bonita com muitos nós bem juntos.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Nó demais deixa a curva ondulada e difícil de acertar.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Curva boa tem poucos nós e alças bem postas. Quem faz a onda é a alça, e não a quantidade de nós.',
    },
    {
      id: 'DG2-M3-Q7', type: 'true_false',
      prompt: 'Num nó suave, mexer numa alça gira a outra junto.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'É isso que mantém as duas na mesma reta, e a curva sem quina.' },
      ]},
      explanation: 'As duas alças do nó suave ficam alinhadas: girar uma gira a outra para o lado oposto.',
    },
  ],

  /* ── Módulo 4 — traço e preenchimento (requisitos 2.3 e 4.3) ─────────── */
  'm4-teoria': [
    {
      id: 'DG2-M4-Q1', type: 'multiple_choice',
      prompt: 'O que é o traço de uma forma?',
      data: { options: [
        { id: 'a', text: 'A tinta da linha do caminho.', correct: true },
        { id: 'b', text: 'A tinta da área de dentro.', porque: 'A área de dentro é o preenchimento.' },
        { id: 'c', text: 'A sombra embaixo da forma.', porque: 'Sombra é efeito à parte, e não o traço.' },
        { id: 'd', text: 'O nome da forma na lista.', porque: 'O nome é da camada.' },
      ]},
      explanation: 'O traço pinta a própria linha do caminho, com uma cor e uma espessura.',
    },
    {
      id: 'DG2-M4-Q2', type: 'multiple_choice',
      prompt: 'Uma seta desenhada como linha aberta virou um triângulo pintado. Por quê?',
      data: { options: [
        { id: 'a', text: 'Ela tem preenchimento.', correct: true },
        { id: 'b', text: 'O traço está grosso demais.', porque: 'O traço engrossa a linha, mas não fecha a forma.' },
        { id: 'c', text: 'A extremidade é redonda.', porque: 'A extremidade só muda o jeito da ponta.' },
        { id: 'd', text: 'Ela tem nós de canto.', porque: 'Quina não pinta nada por dentro.' },
      ]},
      explanation: 'Preencher uma linha aberta faz o programa fechá-la por uma reta que ninguém desenhou, e pintar o meio.',
    },
    {
      id: 'DG2-M4-Q3', type: 'multiple_choice',
      prompt: 'Qual extremidade termina a linha num meio círculo depois do nó?',
      data: { options: [
        { id: 'a', text: 'Redonda.', correct: true },
        { id: 'b', text: 'Reta.', porque: 'A reta corta a linha exatamente no nó.' },
        { id: 'c', text: 'Quadrada.', porque: 'A quadrada passa do nó com a ponta reta.' },
        { id: 'd', text: 'Suave.', porque: 'Suave é tipo de nó, e não de extremidade.' },
      ]},
      explanation: 'A extremidade redonda acaba como a ponta de um pincel.',
    },
    {
      id: 'DG2-M4-Q4', type: 'multiple_choice',
      prompt: 'A placa da trilha tem fundo amarelo e borda marrom. Como isso fica guardado?',
      data: { options: [
        { id: 'a', text: 'Preenchimento amarelo, traço marrom.', correct: true },
        { id: 'b', text: 'Duas formas, uma de cada cor.', porque: 'Uma forma só tem as duas tintas, e cada uma é independente.' },
        { id: 'c', text: 'Traço amarelo, preenchimento marrom.', porque: 'Seria o contrário: fundo marrom e borda amarela.' },
        { id: 'd', text: 'Uma cor só, com sombra marrom.', porque: 'A borda é o traço, que tem cor própria.' },
      ]},
      explanation: 'O preenchimento pinta a área; o traço pinta a borda. Cada um tem a sua cor.',
    },
    {
      id: 'DG2-M4-Q5', type: 'multiple_choice',
      prompt: 'Numa linha bem fina, trocar a extremidade de reta para redonda muda o quê?',
      data: { options: [
        { id: 'a', text: 'Quase nada que se veja.', correct: true },
        { id: 'b', text: 'A linha passa a ser fechada.', porque: 'Extremidade não fecha caminho nenhum.' },
        { id: 'c', text: 'A cor da linha fica mais clara.', porque: 'Extremidade não mexe na cor.' },
        { id: 'd', text: 'A linha dobra de espessura.', porque: 'A espessura é outro campo.' },
      ]},
      explanation: 'A ponta redonda avança metade da espessura além do nó. Numa linha fina, isso é menos de um pixel.',
    },
    {
      id: 'DG2-M4-Q6', type: 'true_false',
      prompt: 'Extremidade de traço só faz diferença em caminho aberto.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Num caminho fechado a linha volta ao começo: não há ponta para terminar.' },
      ]},
      explanation: 'A extremidade é o jeito como a ponta da linha termina, e só a linha aberta tem ponta.',
    },
    {
      id: 'DG2-M4-Q7', type: 'true_false',
      prompt: 'Uma forma não pode ter traço sem ter preenchimento.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'As duas tintas são independentes: a seta é só traço.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Cada tinta liga e desliga sozinha. Uma linha de trilha no mapa é traço sem preenchimento.',
    },
  ],

  /* ── Módulo 5 — camadas, grupos, alinhar e distribuir (4.4 e 4.5) ────── */
  'm5-teoria': [
    {
      id: 'DG2-M5-Q1', type: 'multiple_choice',
      prompt: 'Na lista de camadas, o que fica na frente no desenho?',
      data: { options: [
        { id: 'a', text: 'O que está mais acima na lista.', correct: true },
        { id: 'b', text: 'O que foi desenhado primeiro.', porque: 'O primeiro desenhado começa embaixo de todo o resto.' },
        { id: 'c', text: 'O que tem a cor mais escura.', porque: 'A cor não decide a ordem de empilhar.' },
        { id: 'd', text: 'O que tem o nome mais curto.', porque: 'O nome não entra na ordem.' },
      ]},
      explanation: 'A lista é a pilha: o de cima cobre os que estão embaixo dele.',
    },
    {
      id: 'DG2-M5-Q2', type: 'multiple_choice',
      prompt: 'Para que serve agrupar as peças de um ícone?',
      data: { options: [
        { id: 'a', text: 'Para que elas se movam juntas.', correct: true },
        { id: 'b', text: 'Para apagar as divisas entre elas.', porque: 'Isso é a união; o grupo mantém as peças separadas.' },
        { id: 'c', text: 'Para pintar tudo de uma cor só.', porque: 'Cada peça do grupo continua com a sua cor.' },
        { id: 'd', text: 'Para deixar o arquivo mais leve.', porque: 'Agrupar não muda o tamanho do arquivo.' },
      ]},
      explanation: 'O grupo faz as peças andarem, se alinharem e se copiarem como um objeto só.',
    },
    {
      id: 'DG2-M5-Q3', type: 'multiple_choice',
      prompt: 'Qual destes é o melhor nome para o grupo da fogueira?',
      data: { options: [
        { id: 'a', text: 'Fogueira', correct: true },
        { id: 'b', text: 'Grupo 3', porque: 'Não diz o que tem dentro a quem abrir o arquivo amanhã.' },
        { id: 'c', text: 'Desenho', porque: 'Todas as camadas são desenho: o nome não separa nenhuma.' },
        { id: 'd', text: 'Camada nova', porque: 'Diz como nasceu, e não o que é.' },
      ]},
      explanation: 'O nome é o que faz alguém achar a peça num arquivo de trinta camadas.',
    },
    {
      id: 'DG2-M5-Q4', type: 'multiple_choice',
      prompt: 'Três ícones lado a lado parecem flutuar em alturas diferentes. Qual botão resolve?',
      data: { options: [
        { id: 'a', text: 'Alinhar à base.', correct: true },
        { id: 'b', text: 'Distribuir horizontalmente.', porque: 'Distribuir iguala os vãos, e não a altura do pé.' },
        { id: 'c', text: 'Alinhar ao topo.', porque: 'Ícones de alturas diferentes ficariam com o pé em lugares diferentes.' },
        { id: 'd', text: 'Trazer para frente.', porque: 'Isso muda a ordem das camadas, e não a posição.' },
      ]},
      explanation: 'Alinhar à base põe o pé de todos na mesma linha, como coisas apoiadas no mesmo chão.',
    },
    {
      id: 'DG2-M5-Q5', type: 'multiple_choice',
      prompt: 'O que acontece ao alinhar à base as peças soltas da fogueira, sem agrupar?',
      data: { options: [
        { id: 'a', text: 'A chama desce até o pé da lenha.', correct: true },
        { id: 'b', text: 'Nada: as peças já estão juntas.', porque: 'Soltas, cada peça é alinhada sozinha.' },
        { id: 'c', text: 'A fogueira inteira sobe.', porque: 'Alinhar à base move cada peça até a base mais baixa.' },
        { id: 'd', text: 'As peças viram uma forma só.', porque: 'Alinhar não une nada.' },
      ]},
      explanation: 'Cada peça solta é tratada como um objeto: a chama vai parar na mesma base da lenha. Agrupe antes.',
    },
    {
      id: 'DG2-M5-Q6', type: 'true_false',
      prompt: 'Distribuir funciona com dois objetos.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Com dois não há espaço entre eles para igualar com outro.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Distribuir iguala os vãos entre os objetos, e isso começa a valer com três ou mais.',
    },
    {
      id: 'DG2-M5-Q7', type: 'true_false',
      prompt: 'Desagrupar devolve as peças soltas sem mudar o desenho.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'O grupo nunca mexeu nas peças: só as fazia andar juntas.' },
      ]},
      explanation: 'As peças continuam onde estavam, com as mesmas cores; só deixam de se mover juntas.',
    },
  ],

  /* ── Módulo 6 — texto em curvas (requisito 4.6) ──────────────────────── */
  'm6-teoria': [
    {
      id: 'DG2-M6-Q1', type: 'multiple_choice',
      prompt: 'O que significa converter texto em curvas?',
      data: { options: [
        { id: 'a', text: 'Trocar as letras pelo desenho delas.', correct: true },
        { id: 'b', text: 'Escrever o texto em volta de um círculo.', porque: 'Isso é texto em caminho, e continua sendo texto.' },
        { id: 'c', text: 'Deixar as letras em itálico.', porque: 'Itálico é estilo da fonte, e o texto continua texto.' },
        { id: 'd', text: 'Trocar a fonte por uma mais redonda.', porque: 'A fonte não muda: o que muda é o que o arquivo guarda.' },
      ]},
      explanation: 'Cada letra vira um caminho com nós e alças, e o arquivo passa a carregar o próprio desenho.',
    },
    {
      id: 'DG2-M6-Q2', type: 'multiple_choice',
      prompt: 'O que o arquivo guarda de um texto que não foi convertido?',
      data: { options: [
        { id: 'a', text: 'As letras e o nome da fonte.', correct: true },
        { id: 'b', text: 'O desenho de cada letra.', porque: 'O desenho mora no arquivo de fonte do computador.' },
        { id: 'c', text: 'Uma foto do texto.', porque: 'Texto não é guardado como imagem de pontos.' },
        { id: 'd', text: 'Só o tamanho e a cor.', porque: 'Sem as letras, não haveria texto nenhum.' },
      ]},
      explanation: 'O desenho das letras é tirado da fonte instalada no computador que abre o arquivo.',
    },
    {
      id: 'DG2-M6-Q3', type: 'multiple_choice',
      prompt: 'A gráfica abriu o arquivo e o nome do clube saiu em outra letra. Por quê?',
      data: { options: [
        { id: 'a', text: 'Ela não tinha a fonte instalada.', correct: true },
        { id: 'b', text: 'O nome estava convertido em curvas.', porque: 'Convertido, ele sairia igual em qualquer computador.' },
        { id: 'c', text: 'O arquivo era vetorial.', porque: 'Ser vetor não troca letra; faltou a fonte.' },
        { id: 'd', text: 'A impressora era colorida.', porque: 'A impressora não escolhe a fonte.' },
      ]},
      explanation: 'Sem a fonte, o computador da gráfica troca por outra. Converter antes de mandar evita isso.',
    },
    {
      id: 'DG2-M6-Q4', type: 'multiple_choice',
      prompt: 'Por que duplicar a prancha antes de converter o nome?',
      data: { options: [
        { id: 'a', text: 'Para ter uma versão que se edita.', correct: true },
        { id: 'b', text: 'Porque converter apaga a prancha.', porque: 'A prancha continua; o que muda é o texto, que vira desenho.' },
        { id: 'c', text: 'Para a gráfica receber duas cópias.', porque: 'A gráfica recebe só a convertida.' },
        { id: 'd', text: 'Porque só se converte em cópia.', porque: 'Converte-se na original; a cópia é a que fica editável.' },
      ]},
      explanation: 'Convertido, corrigir uma letra é redesenhá-la. A cópia guarda o texto vivo para a próxima mudança.',
    },
    {
      id: 'DG2-M6-Q5', type: 'multiple_choice',
      prompt: 'Em qual situação converter o texto em curvas é necessário?',
      data: { options: [
        { id: 'a', text: 'Arquivo que vai para a estamparia.', correct: true },
        { id: 'b', text: 'Texto de um site que precisa de busca.', porque: 'Convertido, ele deixa de ser achado pela busca e pelo leitor de tela.' },
        { id: 'c', text: 'Rascunho que ainda vai mudar.', porque: 'Enquanto vai mudar, o texto precisa continuar editável.' },
        { id: 'd', text: 'Documento digitado no editor de texto.', porque: 'Documento é para ler e editar: as letras precisam ser letras.' },
      ]},
      explanation: 'Converte-se o que sai do seu computador para alguém que pode não ter a fonte.',
    },
    {
      id: 'DG2-M6-Q6', type: 'true_false',
      prompt: 'Depois de convertido, dá para corrigir um erro de digitação clicando no texto.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Convertido, ele não é mais texto: é desenho de letras.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Corrigir exige redesenhar a letra, nó por nó — ou converter de novo a partir da versão editável.',
    },
    {
      id: 'DG2-M6-Q7', type: 'true_false',
      prompt: 'Para converter um texto, a fonte dele precisa estar no seu computador.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'O desenho de cada letra sai do arquivo da fonte.' },
      ]},
      explanation: 'Converter copia o desenho das letras para dentro do arquivo, e esse desenho vem da fonte instalada.',
    },
  ],

  /* ── Módulo 7 — reproduzir um logotipo (requisito 5) ─────────────────── */
  'm7-teoria': [
    {
      id: 'DG2-M7-Q1', type: 'multiple_choice',
      prompt: 'Qual é o primeiro passo para reproduzir um logotipo?',
      data: { options: [
        { id: 'a', text: 'Desmontá-lo em formas simples.', correct: true },
        { id: 'b', text: 'Contorná-lo inteiro com a caneta.', porque: 'A caneta deixa torto o que uma forma primitiva faria certo.' },
        { id: 'c', text: 'Escolher as cores primeiro.', porque: 'A cor vem depois da forma estar certa.' },
        { id: 'd', text: 'Ampliá-lo até ver os pontos.', porque: 'Ver pontos não ajuda a entender a forma.' },
      ]},
      explanation: 'Olhar antes de desenhar: anel é círculo menos círculo, barraca é triângulo, base é retângulo.',
    },
    {
      id: 'DG2-M7-Q2', type: 'multiple_choice',
      prompt: 'O anel de um logotipo é feito de quais formas?',
      data: { options: [
        { id: 'a', text: 'Um círculo menos outro menor.', correct: true },
        { id: 'b', text: 'Dois círculos unidos.', porque: 'Unidos, dariam um círculo cheio, sem o furo.' },
        { id: 'c', text: 'Um círculo com traço grosso.', porque: 'Funciona na tela, mas o anel do logotipo é uma forma, não uma borda.' },
        { id: 'd', text: 'Quatro retângulos curvados.', porque: 'Retângulo não curva: daria quinas.' },
      ]},
      explanation: 'Subtrair um círculo menor do centro de um maior deixa o anel com a espessura certa.',
    },
    {
      id: 'DG2-M7-Q3', type: 'multiple_choice',
      prompt: 'O que é proporção num logotipo?',
      data: { options: [
        { id: 'a', text: 'A relação entre largura e altura.', correct: true },
        { id: 'b', text: 'O tamanho em centímetros.', porque: 'O tamanho pode mudar; a proporção não.' },
        { id: 'c', text: 'A quantidade de cores.', porque: 'Cor não muda a forma.' },
        { id: 'd', text: 'A espessura do traço.', porque: 'O traço é uma tinta, e não a relação entre as medidas.' },
      ]},
      explanation: 'Um logotipo quadrado continua quadrado em qualquer tamanho.',
    },
    {
      id: 'DG2-M7-Q4', type: 'multiple_choice',
      prompt: 'Um logotipo de 100 por 100 vai ser ampliado para 200 de largura. Que altura ele deve ter?',
      data: { options: [
        { id: 'a', text: '200.', correct: true },
        { id: 'b', text: '100.', porque: 'Ficaria esticado para os lados: outra forma.' },
        { id: 'c', text: '150.', porque: 'A altura cresceria menos que a largura, e ele ficaria achatado.' },
        { id: 'd', text: 'Tanto faz.', porque: 'A altura precisa crescer na mesma razão da largura.' },
      ]},
      explanation: 'Se a largura dobra, a altura dobra. Mesma razão nos dois lados mantém a proporção.',
    },
    {
      id: 'DG2-M7-Q5', type: 'multiple_choice',
      prompt: 'O logotipo precisa caber numa faixa baixa e comprida. O que fazer?',
      data: { options: [
        { id: 'a', text: 'Diminuir por igual e sobrar espaço.', correct: true },
        { id: 'b', text: 'Esticar até ocupar a faixa toda.', porque: 'Esticado, ele vira outro logotipo.' },
        { id: 'c', text: 'Achatar só a altura.', porque: 'Achatar muda a proporção do mesmo jeito que esticar.' },
        { id: 'd', text: 'Cortar as partes que sobrarem.', porque: 'Cortar tira pedaço do que o logotipo é.' },
      ]},
      explanation: 'Sobrar espaço vazio é normal. Mudar a forma do logotipo para preencher o espaço não é.',
    },
    {
      id: 'DG2-M7-Q6', type: 'true_false',
      prompt: 'Reproduzir o logotipo num tamanho diferente do original é permitido.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'O tamanho pode mudar; o que não pode é a proporção.' },
      ]},
      explanation: 'Quem copia as relações entre as partes acerta o logotipo em qualquer tamanho.',
    },
    {
      id: 'DG2-M7-Q7', type: 'true_false',
      prompt: 'Arrastar as formas a olho é mais exato que digitar X, Y, largura e altura.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'A mão erra alguns pixels; o número digitado é exato.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O painel de propriedades aceita o número certo, e o número não treme.',
    },
  ],

  /* ── Módulo 8 — ícone em três tamanhos (requisito 6) ─────────────────── */
  'm8-teoria': [
    {
      id: 'DG2-M8-Q1', type: 'multiple_choice',
      prompt: 'Em qual tamanho um ícone precisa ser conferido primeiro?',
      data: { options: [
        { id: 'a', text: 'No menor deles.', correct: true },
        { id: 'b', text: 'No maior deles.', porque: 'Grande, todo ícone parece bom.' },
        { id: 'c', text: 'No da prancha.', porque: 'A prancha é ampliada: não mostra o que se perde.' },
        { id: 'd', text: 'Em nenhum: vetor não perde nada.', porque: 'O vetor não serrilha, mas a tela tem poucos pixels.' },
      ]},
      explanation: 'Se ainda diz o que é em 16 pixels, o ícone funciona em todos os outros.',
    },
    {
      id: 'DG2-M8-Q2', type: 'multiple_choice',
      prompt: 'Um ícone desenhado em 256 é visto em 16. Quanto da prancha vale um pixel da tela?',
      data: { options: [
        { id: 'a', text: '16 unidades.', correct: true },
        { id: 'b', text: '1 unidade.', porque: 'Isso seria ver o ícone no tamanho da prancha.' },
        { id: 'c', text: '256 unidades.', porque: 'Seria o ícone inteiro num pixel só.' },
        { id: 'd', text: '4 unidades.', porque: 'Isso seria ver em 64 pixels.' },
      ]},
      explanation: '256 dividido por 16 dá 16: cada pixel da tela junta 16 unidades da prancha.',
    },
    {
      id: 'DG2-M8-Q3', type: 'multiple_choice',
      prompt: 'Uma linha de 8 unidades num ícone de 256, vista em 16 pixels, fica como?',
      data: { options: [
        { id: 'a', text: 'Some, ou vira um borrão.', correct: true },
        { id: 'b', text: 'Fica nítida, por ser vetor.', porque: 'Meio pixel não se desenha nítido em tela nenhuma.' },
        { id: 'c', text: 'Fica mais grossa que o resto.', porque: 'Ela fica com meio pixel, e não mais.' },
        { id: 'd', text: 'Vira uma linha de 8 pixels.', porque: 'A linha encolhe junto com o ícone.' },
      ]},
      explanation: 'Oito unidades é meio pixel em 16: menos do que a tela consegue mostrar.',
    },
    {
      id: 'DG2-M8-Q4', type: 'multiple_choice',
      prompt: 'O ícone virou uma mancha em 16 pixels. Qual é o conserto?',
      data: { options: [
        { id: 'a', text: 'Tirar peças e engrossar as que ficam.', correct: true },
        { id: 'b', text: 'Pôr mais detalhes para explicar.', porque: 'Mais detalhe vira mais mancha no tamanho pequeno.' },
        { id: 'c', text: 'Exportar em PNG em vez de SVG.', porque: 'O formato não muda quantos pixels a tela tem.' },
        { id: 'd', text: 'Trocar todas as cores por cinza.', porque: 'Cinza tira contraste, e piora a leitura.' },
      ]},
      explanation: 'Ícone pequeno pede poucas formas grandes, com contraste forte entre elas.',
    },
    {
      id: 'DG2-M8-Q5', type: 'multiple_choice',
      prompt: 'Qual destes ícones de acampamento tem mais chance de funcionar em 16 pixels?',
      data: { options: [
        { id: 'a', text: 'Barraca, chão e fundo.', correct: true },
        { id: 'b', text: 'Barraca com estacas, corda e janela.', porque: 'Estaca, corda e janela somem em 16 pixels.' },
        { id: 'c', text: 'Uma foto da barraca reduzida.', porque: 'A foto vira borrão no tamanho pequeno.' },
        { id: 'd', text: 'Barraca com o nome do clube embaixo.', porque: 'Letra em 16 pixels não se lê.' },
      ]},
      explanation: 'Três formas grandes dizem "acampamento" mesmo do tamanho de uma unha.',
    },
    {
      id: 'DG2-M8-Q6', type: 'true_false',
      prompt: 'Se o ícone ficou bom na prancha, ele está pronto.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Na prancha tudo é grande; o teste é o tamanho de verdade.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Ícone se julga no tamanho em que vai ser usado, e o de 16 é o mais difícil.',
    },
    {
      id: 'DG2-M8-Q7', type: 'true_false',
      prompt: 'Desenhar pensando no tamanho de 16 desde o começo dá menos trabalho.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Tirar detalhe de um ícone pronto obriga a refazê-lo.' },
      ]},
      explanation: 'Não pôr o detalhe é mais fácil do que tirá-lo depois de tudo arrumado em volta dele.',
    },
  ],

  /* ── Módulo 9 — o SVG por dentro (requisitos 2.5 e 7) ────────────────── */
  'm9-teoria': [
    {
      id: 'DG2-M9-Q1', type: 'multiple_choice',
      prompt: 'O que é um arquivo SVG?',
      data: { options: [
        { id: 'a', text: 'Um desenho vetorial escrito em texto.', correct: true },
        { id: 'b', text: 'Uma foto comprimida para a web.', porque: 'Foto comprimida é JPG, um arquivo de pontos.' },
        { id: 'c', text: 'Um vídeo curto sem som.', porque: 'SVG é imagem parada.' },
        { id: 'd', text: 'Um tipo de fonte instalável.', porque: 'Fonte tem formatos próprios, como TTF.' },
      ]},
      explanation: 'Gráfico Vetorial Escalável: a receita das formas, em texto que um editor simples abre.',
    },
    {
      id: 'DG2-M9-Q2', type: 'multiple_choice',
      prompt: 'Abrindo um PNG no editor de texto, o que se vê?',
      data: { options: [
        { id: 'a', text: 'Símbolos sem sentido.', correct: true },
        { id: 'b', text: 'As coordenadas de cada forma.', porque: 'Isso aparece no SVG; o PNG guarda pontos.' },
        { id: 'c', text: 'O nome de cada camada.', porque: 'O PNG não guarda camada nenhuma.' },
        { id: 'd', text: 'Os nós e as alças.', porque: 'O PNG não tem nós: só a cor de cada ponto.' },
      ]},
      explanation: 'O PNG é um arquivo de pontos, gravado em código de máquina e não em texto.',
    },
    {
      id: 'DG2-M9-Q3', type: 'multiple_choice',
      prompt: 'Num rect do SVG, o que dizem x e y?',
      data: { options: [
        { id: 'a', text: 'Onde fica o canto do retângulo.', correct: true },
        { id: 'b', text: 'A largura e a altura dele.', porque: 'Essas são width e height.' },
        { id: 'c', text: 'O centro do retângulo.', porque: 'Centro é como a ellipse se posiciona, com cx e cy.' },
        { id: 'd', text: 'A cor do preenchimento.', porque: 'A cor está em fill.' },
      ]},
      explanation: 'x e y são o canto de cima à esquerda; width e height, o tamanho.',
    },
    {
      id: 'DG2-M9-Q4', type: 'multiple_choice',
      prompt: 'No SVG, o y do chão muda de 180 para 200. O que acontece com o chão?',
      data: { options: [
        { id: 'a', text: 'Ele desce 20 unidades.', correct: true },
        { id: 'b', text: 'Ele sobe 20 unidades.', porque: 'No SVG o y cresce para baixo.' },
        { id: 'c', text: 'Ele fica 20 unidades mais alto.', porque: 'A altura é o height, e não o y.' },
        { id: 'd', text: 'Ele anda 20 para a direita.', porque: 'Para os lados quem mexe é o x.' },
      ]},
      explanation: 'O y = 0 é o alto da prancha. Um y maior põe a forma mais embaixo.',
    },
    {
      id: 'DG2-M9-Q5', type: 'multiple_choice',
      prompt: 'Depois de mudar um número à mão, alguém exportou o SVG de novo pelo editor de desenho. O que aconteceu com a mudança?',
      data: { options: [
        { id: 'a', text: 'Sumiu: o arquivo foi reescrito.', correct: true },
        { id: 'b', text: 'Ficou, somada ao desenho.', porque: 'Exportar escreve o arquivo inteiro a partir do desenho.' },
        { id: 'c', text: 'Virou uma camada nova.', porque: 'O desenho não sabe da mudança feita no texto.' },
        { id: 'd', text: 'Foi para o PNG também.', porque: 'O PNG sai do desenho, que não tinha a mudança.' },
      ]},
      explanation: 'Exportar sobrescreve o arquivo com o que está no desenho. A mudança à mão só vale se for reaberta antes.',
    },
    {
      id: 'DG2-M9-Q6', type: 'true_false',
      prompt: 'Apagar uma aspa no meio do SVG pode quebrar o arquivo inteiro.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Sem a aspa, o programa não sabe onde termina o número, e recusa o arquivo.' },
      ]},
      explanation: 'O SVG é texto com regras. Mude só números, um de cada vez.',
    },
    {
      id: 'DG2-M9-Q7', type: 'true_false',
      prompt: 'O PNG pode ser editado forma por forma, como o SVG.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O PNG guarda pontos, e não formas.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Para mudar forma por forma, é preciso o SVG ou o arquivo do editor. O PNG é a foto do desenho pronto.',
    },
  ],
};
