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
};
