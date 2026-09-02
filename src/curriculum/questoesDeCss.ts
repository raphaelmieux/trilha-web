import type { Question } from '../types';

/*
 * As questões das lições de teoria da vereda de CSS.
 *
 * A definição vale uma vez, e as outras medem entendimento: consequência,
 * discriminação entre o que se confunde, e diagnóstico. Em CSS o diagnóstico é
 * o que mais rende, porque a linguagem não acusa erro — ela descarta em
 * silêncio o que não entende, e a pessoa fica olhando uma tela que não mudou
 * sem nenhuma pista do motivo.
 *
 * Toda alternativa errada diz **por que** está errada, no campo `porque`, e a
 * certa não carrega motivo nenhum — é o que `qualidade.test.ts` cobra.
 */

export const QUESTOES_DE_CSS: Record<string, Question[]> = {
  'm1-teoria': [
    {
      id: 'CSS-M1-Q1', type: 'multiple_choice',
      prompt: 'Na regra h1 { color: crimson; }, quem é a propriedade?',
      data: { options: [
        { id: 'a', text: 'color', correct: true },
        { id: 'b', text: 'h1', porque: 'h1 é o seletor: ele diz a quem a regra se aplica, e não o que muda.' },
        { id: 'c', text: 'crimson', porque: 'crimson é o valor — a resposta escolhida para a propriedade.' },
        { id: 'd', text: 'As chaves em volta', porque: 'As chaves só delimitam onde a regra começa e termina.' },
      ]},
      explanation: 'Seletor, propriedade e valor: a quem, o quê, e como.',
    },
    {
      id: 'CSS-M1-Q2', type: 'multiple_choice',
      prompt: 'Você escreveu colr: red e a cor não mudou. A página não deu erro nenhum. Por quê?',
      data: { options: [
        { id: 'a', text: 'O navegador descarta em silêncio a declaração que não reconhece.', correct: true },
        { id: 'b', text: 'A cor red não existe em CSS, e por isso a linha foi ignorada.', porque: 'red é um nome válido. O problema estava no nome da propriedade, à esquerda dos dois pontos.' },
        { id: 'c', text: 'Faltou ponto e vírgula no fim, e sem ele nada da regra vale.', porque: 'A última declaração até dispensa o ponto e vírgula. E se ele faltasse no meio, o sintoma seria outro: a declaração seguinte também sumiria.' },
        { id: 'd', text: 'Cor de texto precisa ser declarada no HTML, não no CSS.', porque: 'Cor é justamente o tipo de coisa que o CSS existe para dizer. O HTML diz o que a coisa é; o CSS, como ela se parece.' },
      ]},
      explanation: 'É a armadilha central: CSS não reclama. Erro de digitação vira linha que some, e a tela fica igual sem nenhuma pista.',
    },
    {
      id: 'CSS-M1-Q3', type: 'multiple_choice',
      prompt: 'Por que se diz que CSS não é uma linguagem de programação?',
      data: { options: [
        { id: 'a', text: 'Ela descreve como as coisas devem aparecer, e não uma sequência de decisões a executar.', correct: true },
        { id: 'b', text: 'Porque é mais fácil de aprender do que as outras linguagens.', porque: 'Facilidade não define categoria. Há linguagens de programação simples e CSS difícil — o que separa é o que a linguagem faz.' },
        { id: 'c', text: 'Porque roda no navegador, e linguagem de programação roda no servidor.', porque: 'JavaScript roda no navegador e é linguagem de programação. O lugar onde roda não decide nada.' },
        { id: 'd', text: 'Porque não tem variáveis nem cálculos de nenhum tipo.', porque: 'CSS moderno tem variáveis e faz contas com calc(). Ainda assim continua descrevendo aparência, e é isso que o classifica.' },
      ]},
      explanation: 'CSS é declarativo: você diz o resultado desejado, não o passo a passo para chegar nele.',
    },
    {
      id: 'CSS-M1-Q4', type: 'true_false',
      prompt: 'Uma regra escrita para .aviso não muda nada se nenhum elemento da página tiver class="aviso".',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'O seletor precisa encontrar alguém. Sem elemento correspondente a regra fica no arquivo, válida e inútil — e nada avisa.' },
      ]},
      explanation: 'Escrever CSS certo não basta: ele precisa chegar em algum elemento. Confira o nome no class= da página.',
    },
  ],

  'm2-teoria': [
    {
      id: 'CSS-M2-Q1', type: 'multiple_choice',
      prompt: 'Um parágrafo tem class="aviso" e id="principal". As duas regras pedem cores diferentes. Qual vence?',
      data: { options: [
        { id: 'a', text: 'A do identificador, porque identificador tem mais peso que classe.', correct: true },
        { id: 'b', text: 'A da classe, porque classe é mais específica que identificador.', porque: 'É o contrário: identificador é de um elemento só na página, e por isso pesa mais.' },
        { id: 'c', text: 'A que estiver escrita por último no arquivo, sempre.', porque: 'A ordem só decide quando o peso empata. Com pesos diferentes, o mais pesado vence mesmo estando antes.' },
        { id: 'd', text: 'Nenhuma: quando duas regras discordam, o navegador ignora as duas.', porque: 'O navegador sempre escolhe uma. É justamente para isso que existe a regra de especificidade.' },
      ]},
      explanation: 'Especificidade primeiro, ordem depois. Identificador pesa mais que classe, que pesa mais que elemento.',
    },
    {
      id: 'CSS-M2-Q2', type: 'multiple_choice',
      prompt: 'Você definiu font-family só em body, e os parágrafos mudaram de fonte sozinhos. Como?',
      data: { options: [
        { id: 'a', text: 'Por herança: certas propriedades descem do elemento para os que estão dentro dele.', correct: true },
        { id: 'b', text: 'Por cascata: a regra mais recente sobrescreveu a dos parágrafos.', porque: 'Cascata é a disputa entre regras que miram o mesmo elemento. Aqui nenhuma regra mirou os parágrafos — eles receberam de cima.' },
        { id: 'c', text: 'Porque body e p são a mesma coisa para o navegador.', porque: 'São elementos diferentes, com papéis diferentes. Um contém o outro, e é essa relação que explica o efeito.' },
        { id: 'd', text: 'Porque font-family é a única propriedade que vale para a página inteira.', porque: 'Muitas se herdam — cor e tamanho de letra também. Já margem e borda, não: cada caixa tem a sua.' },
      ]},
      explanation: 'Herança desce; cascata resolve empate. São coisas diferentes e é comum confundir as duas.',
    },
    {
      id: 'CSS-M2-Q3', type: 'multiple_choice',
      prompt: 'Você precisa pintar de vermelho sete avisos espalhados na página. Qual seletor serve?',
      data: { options: [
        { id: 'a', text: 'Uma classe, posta nos sete elementos.', correct: true },
        { id: 'b', text: 'Sete identificadores, um para cada aviso.', porque: 'Identificador é único por elemento, então seriam sete regras iguais para manter — e mudar a cor depois viraria sete edições.' },
        { id: 'c', text: 'O seletor de elemento p, já que todos são parágrafos.', porque: 'Isso pegaria todos os parágrafos da página, inclusive os que não são aviso.' },
        { id: 'd', text: 'Nenhum: para vários elementos é preciso repetir o estilo em cada um.', porque: 'É exatamente o que a classe evita. Repetir estilo à mão é o problema que o CSS existe para resolver.' },
      ]},
      explanation: 'Classe é para o que se repete; identificador, para o que é único.',
    },
    {
      id: 'CSS-M2-Q4', type: 'ordering',
      prompt: 'Ordene do seletor que menos pesa para o que mais pesa numa disputa.',
      data: { items: [
        { id: 'i1', text: 'Elemento — p', order: 1 },
        { id: 'i2', text: 'Classe — .aviso', order: 2 },
        { id: 'i3', text: 'Identificador — #principal', order: 3 },
        { id: 'i4', text: 'Estilo escrito no próprio elemento, no atributo style', order: 4 },
      ]},
      explanation: 'Quanto mais restrito o alcance do seletor, mais ele pesa. O estilo colado no elemento é o mais restrito de todos — e por isso o mais difícil de corrigir depois.',
    },
  ],

  'm3-teoria': [
    {
      id: 'CSS-M3-Q1', type: 'multiple_choice',
      prompt: 'Quem lê a página aumentou a letra do navegador para enxergar melhor. Que medida acompanha esse aumento?',
      data: { options: [
        { id: 'a', text: 'rem', correct: true },
        { id: 'b', text: 'px', porque: 'px é fixo em pixels: dezesseis continuam dezesseis, e o texto não cresce com a preferência de quem lê.' },
        { id: 'c', text: 'A medida não muda nada: o navegador amplia tudo do mesmo jeito.', porque: 'Ampliar a página inteira é outro recurso. A preferência de tamanho de letra só move o que foi escrito em medida relativa.' },
        { id: 'd', text: 'Nenhuma, porque só o HTML pode definir tamanho de texto.', porque: 'Tamanho de texto é tarefa do CSS. O HTML diz o que o texto é; o tamanho vem daqui.' },
      ]},
      explanation: 'rem parte do tamanho de letra do navegador. Quem escreve tudo em px decide pela pessoa que não enxerga bem.',
    },
    {
      id: 'CSS-M3-Q2', type: 'multiple_choice',
      prompt: 'Qual é a diferença entre em e rem?',
      data: { options: [
        { id: 'a', text: 'em parte do tamanho do elemento que envolve; rem parte do tamanho da raiz.', correct: true },
        { id: 'b', text: 'em vale para texto e rem vale para larguras e alturas.', porque: 'As duas servem para qualquer medida. O que muda é de onde cada uma parte.' },
        { id: 'c', text: 'em é medida antiga e rem é a versão moderna, com o mesmo comportamento.', porque: 'As duas são atuais e fazem coisas diferentes. em ainda é a escolha certa quando se quer espaçamento proporcional ao texto local.' },
        { id: 'd', text: 'em é sempre igual a dezesseis pixels e rem varia.', porque: 'Nenhuma das duas é fixa. Dezesseis pixels costuma ser o padrão da raiz, e é dali que rem parte enquanto ninguém mudar.' },
      ]},
      explanation: 'em se acumula quando há caixas dentro de caixas; rem não. É por isso que rem costuma ser mais previsível.',
    },
    {
      id: 'CSS-M3-Q3', type: 'multiple_choice',
      prompt: 'Você escreveu font-family: Bebas Neue; e a fonte não mudou em computador nenhum. O que faltou?',
      data: { options: [
        { id: 'a', text: 'Aspas no nome de duas palavras e uma fonte de reserva depois da vírgula.', correct: true },
        { id: 'b', text: 'Escrever o nome todo em minúsculas, como o CSS exige.', porque: 'CSS não distingue maiúsculas em nome de fonte. O problema é o nome de duas palavras solto e a falta de alternativa.' },
        { id: 'c', text: 'Declarar a fonte também no HTML, para o navegador saber baixá-la.', porque: 'Fonte não se declara no HTML. Fonte de fora se carrega por @font-face ou por um link no cabeçalho.' },
        { id: 'd', text: 'Nada: essa fonte simplesmente não existe.', porque: 'Ela existe. O ponto é outro: uma fonte que não está no computador de quem lê precisa de alternativa, senão o navegador escolhe sozinho.' },
      ]},
      explanation: 'A reserva não é enfeite: é o que a pessoa vai ver quando a primeira fonte não estiver lá.',
    },
    {
      id: 'CSS-M3-Q4', type: 'true_false',
      prompt: 'Texto cinza-claro sobre fundo branco é uma escolha de cor como qualquer outra, sem consequência para quem lê.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Contraste baixo apaga o texto para quem enxerga pouco, e no sol da rua apaga para todo mundo. Cor bonita que não se lê não cumpriu a tarefa dela.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Cor decide quem consegue ler. É a primeira pergunta a fazer, antes de qual tom fica mais bonito.',
    },
  ],

  'm4-teoria': [
    {
      id: 'CSS-M4-Q1', type: 'multiple_choice',
      prompt: 'Duas caixas vizinhas estão grudadas. Você quer afastá-las uma da outra. Qual propriedade resolve?',
      data: { options: [
        { id: 'a', text: 'margin', correct: true },
        { id: 'b', text: 'padding', porque: 'padding afasta o conteúdo da borda da própria caixa. As duas continuariam encostadas, só que maiores.' },
        { id: 'c', text: 'border', porque: 'Borda desenha a linha do contorno. Ela ocupa espessura, mas não cria espaço entre uma caixa e a outra.' },
        { id: 'd', text: 'gap', porque: 'gap separa peças dentro de um contêiner flex ou grid. Fora deles não tem efeito nenhum.' },
      ]},
      explanation: 'Margem é o espaço de fora; padding, o de dentro. Confundir os dois é o erro mais comum do modelo de caixa.',
    },
    {
      id: 'CSS-M4-Q2', type: 'multiple_choice',
      prompt: 'Você deu width: 200px e padding: 20px a uma caixa. Ela ficou ocupando 240px de largura. Por quê?',
      data: { options: [
        { id: 'a', text: 'Por padrão a largura vale só para o conteúdo; padding e borda somam por fora.', correct: true },
        { id: 'b', text: 'O navegador arredondou a medida para o múltiplo de dez mais próximo.', porque: 'Navegador não arredonda largura assim. Os quarenta pixels a mais são exatamente os vinte de cada lado.' },
        { id: 'c', text: 'width em px não é respeitado quando existe padding na mesma regra.', porque: 'A largura foi respeitada — ela valeu para o conteúdo, que é o comportamento padrão.' },
        { id: 'd', text: 'Porque a caixa herdou a largura do elemento que a envolve.', porque: 'Herança não passa largura. A conta que explica os 240 é 200 mais 20 de cada lado.' },
      ]},
      explanation: 'É o que box-sizing: border-box conserta: com ele, a largura declarada passa a incluir padding e borda.',
    },
    {
      id: 'CSS-M4-Q3', type: 'multiple_choice',
      prompt: 'Você escreveu border: 2px crimson e nenhuma borda apareceu. O que faltou?',
      data: { options: [
        { id: 'a', text: 'O estilo — solid, dashed ou dotted.', correct: true },
        { id: 'b', text: 'A unidade da espessura, que precisa ser rem e não px.', porque: 'px vale para espessura de borda, e costuma ser a melhor escolha ali: é o que precisa ser exato.' },
        { id: 'c', text: 'Declarar border-width antes, numa regra separada.', porque: 'A forma curta já traz a espessura. O que ela não adivinha é o estilo.' },
        { id: 'd', text: 'Nada: crimson não vale como cor de borda.', porque: 'crimson vale em qualquer propriedade de cor. A borda sumiu por outro motivo.' },
      ]},
      explanation: 'Sem estilo, a borda tem espessura e cor e não se desenha. O padrão do estilo é none.',
    },
    {
      id: 'CSS-M4-Q4', type: 'ordering',
      prompt: 'Ordene as camadas da caixa, do centro para fora.',
      data: { items: [
        { id: 'i1', text: 'Conteúdo — o texto ou a imagem', order: 1 },
        { id: 'i2', text: 'padding — o espaço interno', order: 2 },
        { id: 'i3', text: 'border — a linha do contorno', order: 3 },
        { id: 'i4', text: 'margin — o espaço externo', order: 4 },
      ]},
      explanation: 'Conteúdo, padding, borda, margem. Saber a ordem é saber onde mexer quando o espaço está no lugar errado.',
    },
  ],

  'm5-teoria': [
    {
      id: 'CSS-M5-Q1', type: 'multiple_choice',
      prompt: 'Você pôs display: flex numa caixa e as peças ficaram lado a lado, mas todas amontoadas à esquerda. O que distribui o espaço entre elas?',
      data: { options: [
        { id: 'a', text: 'justify-content', correct: true },
        { id: 'b', text: 'align-items', porque: 'align-items trata do outro eixo — em cima, no meio, embaixo. Não distribui ao longo da linha.' },
        { id: 'c', text: 'text-align', porque: 'text-align alinha o texto dentro de cada peça, e não as peças dentro do contêiner.' },
        { id: 'd', text: 'display: flex já distribui, então o problema é outro.', porque: 'display: flex só liga o modo e põe em linha. A distribuição é sempre a propriedade seguinte.' },
      ]},
      explanation: 'display: flex liga; justify-content e align-items dispõem. Um sem o outro não alinha nada.',
    },
    {
      id: 'CSS-M5-Q2', type: 'multiple_choice',
      prompt: 'Num contêiner flex em linha, o que align-items: center faz?',
      data: { options: [
        { id: 'a', text: 'Centraliza as peças verticalmente, no eixo cruzado.', correct: true },
        { id: 'b', text: 'Centraliza as peças horizontalmente, no meio da linha.', porque: 'Isso é justify-content: center. align-items sempre age no eixo cruzado, que numa linha é o vertical.' },
        { id: 'c', text: 'Centraliza o texto dentro de cada peça.', porque: 'Texto dentro da peça é text-align. align-items posiciona as peças, não o conteúdo delas.' },
        { id: 'd', text: 'Faz as peças terem a mesma altura.', porque: 'Isso é o comportamento padrão, stretch — e center justamente o desliga, deixando cada peça com a altura dela.' },
      ]},
      explanation: 'Em linha, justify-content é o horizontal e align-items o vertical. Trocar flex-direction troca os dois de papel.',
    },
    {
      id: 'CSS-M5-Q3', type: 'multiple_choice',
      prompt: 'Cinco cartões num contêiner flex saem da tela no celular. Qual propriedade os faz descer para a linha de baixo?',
      data: { options: [
        { id: 'a', text: 'flex-wrap: wrap', correct: true },
        { id: 'b', text: 'overflow: hidden', porque: 'Isso esconde o que passou, e esconder conteúdo é perder conteúdo. O cartão continuaria fora da tela, agora invisível.' },
        { id: 'c', text: 'flex-direction: column', porque: 'Isso empilha os cinco em coluna sempre, inclusive no computador, onde caberiam em linha.' },
        { id: 'd', text: 'width: 100%', porque: 'Largura cheia em cada cartão empilharia todos, mas por acidente: o contêiner continuaria proibido de quebrar linha.' },
      ]},
      explanation: 'Por padrão o flex não quebra linha: ele espreme. wrap é a permissão para descer.',
    },
    {
      id: 'CSS-M5-Q4', type: 'true_false',
      prompt: 'gap substitui a margem entre as peças de um contêiner flex, sem deixar sobra na primeira nem na última.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'gap só entra entre as peças. É por isso que ele resolve o que margem resolvia mal: com margem sempre sobrava espaço numa das pontas.' },
      ]},
      explanation: 'gap é espaço entre, e só entre. Foi feito exatamente para o problema da margem na ponta.',
    },
  ],

  'm6-teoria': [
    {
      id: 'CSS-M6-Q1', type: 'multiple_choice',
      prompt: 'O que grid-template-columns: 2fr 1fr faz?',
      data: { options: [
        { id: 'a', text: 'Duas colunas, a primeira com o dobro da largura da segunda.', correct: true },
        { id: 'b', text: 'Duas colunas, uma de 2 pixels e outra de 1 pixel.', porque: 'fr não é pixel: é fração do espaço que sobrou depois do que tem tamanho fixo.' },
        { id: 'c', text: 'Duas linhas, a de cima com o dobro da altura da de baixo.', porque: 'Linhas são grid-template-rows. columns trata das colunas.' },
        { id: 'd', text: 'Três colunas: duas de um tamanho e uma de outro.', porque: 'São dois valores, então são duas colunas. O número de valores é o número de colunas.' },
      ]},
      explanation: 'fr distribui o que sobrou. 2fr 1fr divide em três partes: duas para a primeira coluna, uma para a segunda.',
    },
    {
      id: 'CSS-M6-Q2', type: 'multiple_choice',
      prompt: 'Quando o Grid é a escolha melhor que o Flexbox?',
      data: { options: [
        { id: 'a', text: 'Quando o arranjo tem linhas e colunas que precisam se alinhar entre si.', correct: true },
        { id: 'b', text: 'Quando há mais de cinco peças a dispor.', porque: 'A quantidade não decide. Vinte peças numa fila só continuam sendo trabalho de flex.' },
        { id: 'c', text: 'Quando as peças precisam ficar centralizadas.', porque: 'Os dois centralizam. O que separa é haver ou não duas dimensões a coordenar.' },
        { id: 'd', text: 'Sempre, porque Grid é mais novo e substituiu o Flexbox.', porque: 'Não substituiu. Convivem, e uma fila de botões continua mais simples em flex.' },
      ]},
      explanation: 'Flex pensa numa direção; Grid pensa em duas. Uma barra de botões é flex; uma galeria de cartões é grid.',
    },
    {
      id: 'CSS-M6-Q3', type: 'multiple_choice',
      prompt: 'Você declarou display: grid e as peças continuaram uma embaixo da outra. Por quê?',
      data: { options: [
        { id: 'a', text: 'Sem colunas declaradas, a grade nasce com uma coluna só.', correct: true },
        { id: 'b', text: 'Grid só funciona em contêineres que tenham altura fixa.', porque: 'Grid não exige altura. A grade se monta com o que houver.' },
        { id: 'c', text: 'Faltou declarar display: grid também nas peças de dentro.', porque: 'O display do contêiner é que organiza. As peças não precisam declarar nada.' },
        { id: 'd', text: 'Porque as peças são blocos, e bloco sempre ocupa a linha inteira.', porque: 'Dentro de uma grade elas deixam de se comportar como blocos soltos — passam a ocupar as células que a grade definir.' },
      ]},
      explanation: 'display: grid liga a grade; grid-template-columns diz o formato dela. Sem o segundo, é uma coluna.',
    },
    {
      id: 'CSS-M6-Q4', type: 'ordering',
      prompt: 'Ordene os passos para pôr os cartões do mural em duas colunas iguais.',
      data: { items: [
        { id: 'i1', text: 'Escolher a caixa que contém os cartões', order: 1 },
        { id: 'i2', text: 'Declarar display: grid nela', order: 2 },
        { id: 'i3', text: 'Declarar grid-template-columns: 1fr 1fr', order: 3 },
        { id: 'i4', text: 'Acrescentar gap para separar as células', order: 4 },
      ]},
      explanation: 'Sempre o contêiner, nunca as peças. É a caixa de fora que sabe como dispor o que tem dentro.',
    },
  ],

  'm7-teoria': [
    {
      id: 'CSS-M7-Q1', type: 'multiple_choice',
      prompt: 'O que @media (max-width: 600px) significa?',
      data: { options: [
        { id: 'a', text: 'Aplique estas regras quando a tela tiver 600px de largura ou menos.', correct: true },
        { id: 'b', text: 'Limite a largura da página a 600px.', porque: 'Consulta de mídia não muda medida nenhuma. Ela só decide quando as regras de dentro valem.' },
        { id: 'c', text: 'Aplique estas regras quando a tela tiver mais de 600px.', porque: 'Isso seria min-width. max-width é o teto: vale dali para baixo.' },
        { id: 'd', text: 'Esconda a página em telas menores que 600px.', porque: 'Nada é escondido. O que muda é qual conjunto de regras entra em vigor.' },
      ]},
      explanation: 'max-width é um teto, min-width é um piso. Trocar os dois inverte a página inteira.',
    },
    {
      id: 'CSS-M7-Q2', type: 'multiple_choice',
      prompt: 'Sua página fica boa no computador e sai pela lateral no celular. Qual é a primeira coisa a conferir?',
      data: { options: [
        { id: 'a', text: 'Se há largura fixa em px em alguma caixa larga.', correct: true },
        { id: 'b', text: 'Se o tamanho da fonte está grande demais.', porque: 'Fonte grande quebra linha, não estoura a largura. O que empurra a página para o lado é caixa que não encolhe.' },
        { id: 'c', text: 'Se faltou @media no arquivo.', porque: 'A consulta de mídia ajusta o que já foi escrito. Se a base usa medida que encolhe, muitas vezes nem é preciso.' },
        { id: 'd', text: 'Se o celular tem tela pequena demais para o site.', porque: 'Não existe tela pequena demais: existe página que decidiu uma largura que não cabe nela.' },
      ]},
      explanation: 'Largura em px é a causa mais comum. Trocar por % ou max-width costuma resolver antes de qualquer @media.',
    },
    {
      id: 'CSS-M7-Q3', type: 'multiple_choice',
      prompt: 'Por que se recomenda escrever primeiro o estilo do celular e depois o do computador?',
      data: { options: [
        { id: 'a', text: 'Porque a tela pequena obriga a decidir o que é essencial, e o resto se acrescenta.', correct: true },
        { id: 'b', text: 'Porque celulares não entendem consultas de mídia.', porque: 'Entendem, e há anos. A razão é de método, não de suporte.' },
        { id: 'c', text: 'Porque o CSS carrega mais rápido nessa ordem.', porque: 'A ordem das regras não muda o tamanho do arquivo nem a velocidade de carregamento de forma perceptível.' },
        { id: 'd', text: 'Porque min-width só funciona depois de max-width no arquivo.', porque: 'As duas funcionam em qualquer ordem. O que a ordem decide é qual vence quando as duas valem ao mesmo tempo.' },
      ]},
      explanation: 'Começar pelo pequeno é começar pelo que não pode faltar. Começar pelo grande é ficar cortando depois.',
    },
    {
      id: 'CSS-M7-Q4', type: 'true_false',
      prompt: 'Uma página feita só com medidas relativas nunca precisa de consulta de mídia.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Medida relativa faz a caixa encolher, e às vezes basta. Mas há mudanças que ela não faz: três colunas viram uma, um menu horizontal vira lista, e isso é decisão de arranjo.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Medida relativa resolve tamanho; consulta de mídia resolve arranjo. São dois problemas, e o segundo continua existindo.',
    },
  ],
};
