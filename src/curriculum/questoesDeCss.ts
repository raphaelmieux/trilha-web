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
    {
      id: 'CSS-M1-Q5', type: 'scenario',
      prompt: 'A página abriu com o texto todo preto, sem nenhum estilo. O <link> diz href="css/estilo.css" e o arquivo está na mesma pasta da página. O que houve?',
      data: { scenarios: [
        { id: 'a', text: 'O caminho procura uma pasta css que não existe, e nada avisa.', correct: true },
        { id: 'b', text: 'A folha tem algum erro que fez o navegador descartá-la inteira.', porque: 'Uma linha errada é descartada sozinha, e o resto continua valendo. Aqui nenhuma regra chegou.' },
        { id: 'c', text: 'Faltou repetir o <link> no fim da página, depois do conteúdo.', porque: 'Um <link> no cabeçalho basta. O problema é ele apontar para onde o arquivo não está.' },
        { id: 'd', text: 'O navegador só aceita folha de estilo escrita dentro de <style>.', porque: 'O arquivo à parte é justamente o jeito recomendado, e funciona em todos os navegadores.' },
      ]},
      explanation: 'Arquivo não encontrado é o sintoma mais silencioso do CSS: a página abre inteira, só que crua. Antes de duvidar das regras, confira o caminho do <link>.',
    },
    {
      id: 'CSS-M1-Q6', type: 'multiple_choice',
      prompt: 'O site do clube tem quatro páginas com o mesmo visual. Por que vale a pena pôr o estilo num arquivo à parte?',
      data: { options: [
        { id: 'a', text: 'Trocar a cor do título uma vez muda as quatro páginas juntas.', correct: true },
        { id: 'b', text: 'Porque estilo escrito dentro do elemento não funciona em celular.', porque: 'Funciona nos dois. O que ele custa é achar todos os lugares onde a cor foi escrita quando ela precisar mudar.' },
        { id: 'c', text: 'Porque o navegador desenha mais rápido quando não há <link>.', porque: 'A conta aqui não é de velocidade: é de quantos lugares precisam ser tocados para mudar uma decisão.' },
        { id: 'd', text: 'Porque só o arquivo à parte aceita mais de uma regra.', porque: 'Qualquer um dos três lugares aceita quantas regras você quiser. A diferença é o alcance de cada mudança.' },
      ]},
      explanation: 'Uma decisão escrita num lugar só é uma decisão que dá para mudar. Repetida em quatro arquivos, ela vira quatro decisões que se perdem uma da outra.',
    },
    {
      id: 'CSS-M1-Q7', type: 'true_false',
      prompt: 'Para dar cor e tamanho ao mesmo <h1>, é preciso escrever o seletor h1 duas vezes, uma para cada propriedade.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Dentro das chaves cabem quantos pares você quiser, um por linha, cada um terminado em ponto e vírgula.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O seletor diz a quem a regra fala; as chaves guardam tudo o que se tem a dizer àquele alguém.',
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
    {
      id: 'CSS-M2-Q5', type: 'multiple_choice',
      prompt: 'Duas regras de mesmo peso pedem cores diferentes para o mesmo parágrafo. O que o navegador desenha?',
      data: { options: [
        { id: 'a', text: 'A cor da regra escrita por último no arquivo.', correct: true },
        { id: 'b', text: 'A cor da primeira, porque foi ela quem chegou antes.', porque: 'É o contrário: em caso de empate, a de baixo cobre a de cima. Daí o nome cascata.' },
        { id: 'c', text: 'Nenhuma das duas: a disputa cancela as regras.', porque: 'O navegador sempre escolhe uma. Ele não deixa o elemento sem valor por causa de um conflito.' },
        { id: 'd', text: 'A mistura das duas cores, na média entre elas.', porque: 'Cores não se misturam por conflito. Uma regra vence e a outra é descartada.' },
      ]},
      explanation: 'A ordem só resolve o empate, e só ele: peso vem antes de posição, e uma regra de classe no começo do arquivo ainda vence uma de elemento no fim.',
    },
    {
      id: 'CSS-M2-Q6', type: 'scenario',
      prompt: 'Você pôs uma borda no body esperando que cada parágrafo ganhasse a sua moldura. Só apareceu uma borda, em volta de tudo. Por quê?',
      data: { scenarios: [
        { id: 'a', text: 'Borda não é herdada: descem as coisas do texto, não as da caixa.', correct: true },
        { id: 'b', text: 'A borda só desce para os filhos quando é declarada em px.', porque: 'A unidade não muda quem herda o quê. Nenhuma medida faz a borda descer.' },
        { id: 'c', text: 'Os parágrafos ganharam a borda, mas ela ficou escondida atrás do fundo.', porque: 'A borda é desenhada por fora do conteúdo, e apareceria. Ela simplesmente não foi aplicada a eles.' },
        { id: 'd', text: 'Faltou declarar a borda antes das outras propriedades do body.', porque: 'A ordem dentro da regra não decide herança nenhuma.' },
      ]},
      explanation: 'Fonte, cor e altura de linha descem; margem, borda, espaçamento e fundo não. Se descessem, uma borda no body desenharia molduras dentro de molduras até o último elemento.',
    },
    {
      id: 'CSS-M2-Q7', type: 'true_false',
      prompt: 'O mesmo identificador pode ser usado em vários elementos da página, desde que a regra seja a mesma para todos.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O identificador é de um elemento só. O que se repete usa classe — foi para isso que a classe existe.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Um id aparece uma vez na página. Repetido, ele deixa de identificar coisa alguma — e é a classe que o substitui, sem limite de quantos elementos a carregam.',
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
    {
      id: 'CSS-M3-Q5', type: 'multiple_choice',
      prompt: 'Você quer um fundo escuro que deixe ver a foto por trás. Qual forma de escrever a cor serve?',
      data: { options: [
        { id: 'a', text: 'rgba(), que recebe um quarto número: a opacidade.', correct: true },
        { id: 'b', text: 'O nome da cor, escolhendo um dos mais escuros da lista.', porque: 'Os nomes dão cores sólidas. Nenhum deles carrega opacidade.' },
        { id: 'c', text: 'O código de seis dígitos, baixando os valores até quase zero.', porque: 'Baixar os valores escurece a cor, e ela continua sólida: o que está atrás segue coberto.' },
        { id: 'd', text: 'rgb(), que já deixa passar o que está atrás por padrão.', porque: 'O rgb() é sólido como os outros. Quem deixa passar é o quarto número, e ele só existe no rgba().' },
      ]},
      explanation: 'Nome, código de seis dígitos e rgb() escrevem a mesma cor sólida. O rgba() acrescenta a única coisa que os outros não têm: quanto do que está atrás continua aparecendo.',
    },
    {
      id: 'CSS-M3-Q6', type: 'scenario',
      prompt: 'O texto do site ficou grudado, difícil de acompanhar até o fim do parágrafo. Qual ajuste resolve?',
      data: { scenarios: [
        { id: 'a', text: 'line-height entre 1.4 e 1.7, escrito sem unidade.', correct: true },
        { id: 'b', text: 'Aumentar font-size até as linhas se afastarem.', porque: 'A letra maior afasta um pouco, e o texto todo cresce junto. O ar entre as linhas se pede direto.' },
        { id: 'c', text: 'Pôr uma margem embaixo de cada parágrafo.', porque: 'Isso afasta um parágrafo do outro. As linhas dentro dele continuam grudadas.' },
        { id: 'd', text: 'Trocar a fonte por uma sem serifa.', porque: 'A escolha da fonte muda o desenho da letra, e não o espaço vertical entre as linhas.' },
      ]},
      explanation: 'Sem unidade, o valor é um multiplicador do tamanho da letra: se alguém aumentar a fonte, o ar entre as linhas cresce junto e a proporção se mantém.',
    },
    {
      id: 'CSS-M3-Q7', type: 'true_false',
      prompt: 'Escrever font-family: Times New Roman, serif sem aspas dá o mesmo resultado que com aspas.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Sem aspas o navegador lê um nome de fonte com mais de uma palavra como se fossem fontes diferentes, e nenhuma delas existe.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Nome de fonte com espaço vai entre aspas. Sem elas o navegador cai na próxima da lista, e a página abre com a fonte de reserva sem avisar nada.',
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
    {
      id: 'CSS-M4-Q5', type: 'scenario',
      prompt: 'O texto do cartão está encostado na linha da borda. Você aumentou a margem e o texto continuou grudado. O que resolve?',
      data: { scenarios: [
        { id: 'a', text: 'padding, que é o espaço entre o conteúdo e a borda.', correct: true },
        { id: 'b', text: 'Mais margem ainda, até o texto se afastar da linha.', porque: 'A margem afasta a caixa inteira das vizinhas, e leva a borda junto com o texto. A distância entre os dois não muda.' },
        { id: 'c', text: 'Uma borda mais grossa, que empurra o texto para dentro.', porque: 'A borda cresce para fora do conteúdo. O texto continua encostado nela, agora numa linha mais larga.' },
        { id: 'd', text: 'Diminuir a largura da caixa, para sobrar espaço interno.', porque: 'Menos largura aperta o conteúdo. O ar entre o texto e a borda continua sendo zero.' },
      ]},
      explanation: 'A pergunta é sempre de dentro ou de fora: de dentro é padding, de fora é margem. Margem move a caixa, e a borda vai junto.',
    },
    {
      id: 'CSS-M4-Q6', type: 'multiple_choice',
      prompt: 'Três cartões de width: 25% com padding ficaram largos demais e a quarta coluna desceu. Qual declaração conserta a conta?',
      data: { options: [
        { id: 'a', text: 'box-sizing: border-box, para a largura incluir padding e borda.', correct: true },
        { id: 'b', text: 'Reduzir a largura para 24%, deixando folga para o padding.', porque: 'Um chute que muda a cada padding e a cada borda. A régua da largura é que precisa mudar.' },
        { id: 'c', text: 'Trocar o padding por margem, que não entra na largura.', porque: 'A margem também ocupa espaço na linha, e as colunas continuariam estourando.' },
        { id: 'd', text: 'Declarar box-sizing: content-box em todos os cartões.', porque: 'Essa é a régua antiga, a que já está valendo — e é justamente ela que soma o padding por fora.' },
      ]},
      explanation: 'Por padrão a largura vale só para o conteúdo e o resto soma por fora. Com border-box, 25% são 25% na tela, com padding e borda cabendo dentro.',
    },
    {
      id: 'CSS-M4-Q7', type: 'true_false',
      prompt: 'Declarar border: 2px #1B4D3E, sem o estilo do traço, desenha uma borda sólida por padrão.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O padrão do estilo é none: sem ele, a borda tem espessura e cor e não é desenhada — e nada avisa.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O estilo é a parte obrigatória da forma curta. Sem ele a regra é válida, o navegador aceita, e a borda não aparece.',
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
    {
      id: 'CSS-M5-Q5', type: 'scenario',
      prompt: 'Você declarou display: flex em cada um dos três cartões e nada se moveu: eles continuam um embaixo do outro. O que houve?',
      data: { scenarios: [
        { id: 'a', text: 'A declaração precisa ir na caixa que envolve os cartões.', correct: true },
        { id: 'b', text: 'Falta declarar flex-direction: row junto, para valer.', porque: 'Linha já é o padrão. O modo não ligou porque foi pedido nas peças, e não em quem as envolve.' },
        { id: 'c', text: 'Os cartões precisam ter largura declarada para entrar em linha.', porque: 'Sem largura eles se ajustam ao conteúdo e entram em linha do mesmo jeito.' },
        { id: 'd', text: 'Só três peças é pouco: o modo começa a valer a partir de quatro.', porque: 'Não há mínimo de peças. Duas já se dispõem lado a lado.' },
      ]},
      explanation: 'Quem recebe o modo é o contêiner, porque é ele que decide como dispor o que tem dentro. Nas peças, a declaração vale para os filhos delas — que aqui não existem.',
    },
    {
      id: 'CSS-M5-Q6', type: 'multiple_choice',
      prompt: 'No cabeçalho em linha, o nome do clube e o lema estão desencontrados na altura: um no topo, outro mais abaixo. O que acerta os dois na mesma altura?',
      data: { options: [
        { id: 'a', text: 'align-items: center, que trata do sentido vertical.', correct: true },
        { id: 'b', text: 'justify-content: center, que centraliza o conteúdo.', porque: 'Essa distribui ao longo da linha, na horizontal. Ela junta os dois no meio, e a altura continua desencontrada.' },
        { id: 'c', text: 'text-align: center dentro de cada peça.', porque: 'Isso centraliza o texto dentro da caixa dele, sem mover a caixa na altura.' },
        { id: 'd', text: 'gap, que reparte o espaço igualmente entre as peças.', porque: 'O gap afasta as peças uma da outra. Ele não mexe no alinhamento vertical.' },
      ]},
      explanation: 'Numa linha, justify-content é o eixo da esquerda para a direita e align-items é o outro. Os nomes não dizem horizontal e vertical porque qual é qual depende de flex-direction.',
    },
    {
      id: 'CSS-M5-Q7', type: 'true_false',
      prompt: 'Sem flex-wrap, as peças que não cabem na linha descem sozinhas para a linha de baixo.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Sem a permissão, o flex espreme as peças até caberem — no celular, cinco cartões viram cinco tirinhas.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O padrão é não quebrar. Quando as peças aparecem espremidas em vez de descerem, o que falta é o wrap — e não uma consulta de mídia.',
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
    {
      id: 'CSS-M6-Q5', type: 'multiple_choice',
      prompt: 'Você quer três colunas iguais na galeria de fotos. O que escrever em grid-template-columns?',
      data: { options: [
        { id: 'a', text: '1fr 1fr 1fr — um valor para cada coluna.', correct: true },
        { id: 'b', text: '3fr — o número diz quantas colunas serão criadas.', porque: 'Isso cria uma coluna só, que vale três frações. Quem conta as colunas é a quantidade de valores.' },
        { id: 'c', text: '3 — o total de colunas, escrito direto.', porque: 'A propriedade espera tamanhos, e não uma contagem. Um número solto não é tamanho válido.' },
        { id: 'd', text: '100% 100% 100% — cada coluna ocupando a largura toda.', porque: 'A soma daria três telas de largura. Porcentagem aqui é justamente o que fr veio evitar.' },
      ]},
      explanation: 'Cada valor é uma coluna, e o valor diz o tamanho dela. Três colunas iguais são três frações iguais — e acrescentar uma quarta é escrever mais um 1fr.',
    },
    {
      id: 'CSS-M6-Q6', type: 'scenario',
      prompt: 'Duas colunas de 50% com gap de 1rem estouraram a largura e a segunda desceu. Como escrever isso sem a sobra?',
      data: { scenarios: [
        { id: 'a', text: '1fr 1fr, porque a fração divide o que sobra depois do gap.', correct: true },
        { id: 'b', text: '49% e 49%, deixando folga para o espaço do meio.', porque: 'Funciona por acaso e só com esse gap. Mudar o espaço entre as colunas obriga a refazer a conta.' },
        { id: 'c', text: '50% e 50%, tirando o gap e usando margem nas colunas.', porque: 'A margem também soma na largura, e ainda sobra espaço na ponta. O estouro se repete.' },
        { id: 'd', text: '600px e 600px, medida fixa que não depende de conta.', porque: 'Largura fixa não cabe em tela estreita, e é a causa mais comum de página saindo pela lateral.' },
      ]},
      explanation: 'A porcentagem se calcula sobre a largura inteira e ignora o gap; a fração recebe o que sobrou depois dele. É por isso que a grade fecha a conta sozinha.',
    },
    {
      id: 'CSS-M6-Q7', type: 'true_false',
      prompt: 'Como o Grid faz mais coisas, ele veio para substituir o Flexbox nas telas novas.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'São ferramentas para perguntas diferentes: uma direção é flex, duas direções são grid. O comum é usar os dois na mesma página.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Grid arruma o layout geral, e dentro de cada peça o flex arruma a fila. Escolher grid para três botões em linha dá mais trabalho e não devolve nada.',
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
    {
      id: 'CSS-M7-Q5', type: 'multiple_choice',
      prompt: 'O que (min-width: 900px) faz num bloco @media?',
      data: { options: [
        { id: 'a', text: 'Põe um piso: as regras valem de 900 pixels de largura para cima.', correct: true },
        { id: 'b', text: 'Põe um teto: as regras valem de 900 pixels para baixo.', porque: 'Esse é o max-width. O min é o mínimo que a tela precisa ter para o bloco valer.' },
        { id: 'c', text: 'Fixa a página em 900 pixels, sem deixá-la passar disso.', porque: 'A consulta não muda tamanho de nada. Ela só decide quando um conjunto de regras entra em vigor.' },
        { id: 'd', text: 'Vale só na tela de exatamente 900 pixels de largura.', porque: 'Não é um valor exato, é uma faixa: de 900 em diante.' },
      ]},
      explanation: 'min é piso e max é teto. Escrever primeiro o que vale para todos e acrescentar com min-width é o caminho de começar pelo pequeno.',
    },
    {
      id: 'CSS-M7-Q6', type: 'scenario',
      prompt: 'Você escreveu uma consulta de mídia e nada mudou em tela nenhuma — nem na larga, nem na estreita. Antes de duvidar da condição, o que conferir?',
      data: { scenarios: [
        { id: 'a', text: 'Se as duas chaves foram fechadas: a da regra e a da consulta.', correct: true },
        { id: 'b', text: 'Se o arquivo foi salvo em UTF-8, que o @media exige.', porque: 'A codificação do arquivo não tem relação com a consulta funcionar.' },
        { id: 'c', text: 'Se o @media está no fim do arquivo, único lugar onde vale.', porque: 'Ele vale em qualquer ponto do arquivo. A posição só importa para desempatar regras de mesmo peso.' },
        { id: 'd', text: 'Se o navegador é recente o bastante para entender consultas.', porque: 'Consulta de mídia é antiga e funciona em qualquer navegador em uso hoje.' },
      ]},
      explanation: 'Faltando uma chave, o navegador descarta o bloco inteiro em silêncio — e o sintoma é justamente nenhum estilo novo aparecer, em largura nenhuma.',
    },
    {
      id: 'CSS-M7-Q7', type: 'true_false',
      prompt: 'Trocar três colunas por uma no celular é problema de tamanho, e medida relativa resolve sem consulta de mídia.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Medida relativa encolhe as colunas, e três colunas espremidas continuam sendo três. Mudar quantas existem é decisão de arranjo.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Medida relativa resolve tamanho; consulta de mídia resolve arranjo. São perguntas diferentes, e é por isso que as duas coisas existem.',
    },
  ],
};
