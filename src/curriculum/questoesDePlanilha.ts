import type { Question } from '../types';

/*
 * As questões das lições de teoria da CC-ES003 Planilhas.
 *
 * ── O que elas medem ──────────────────────────────────────────────────────
 * A definição vale uma vez. Depois dela vêm consequência, discriminação e
 * diagnóstico — e nesta vereda o diagnóstico carrega quase tudo, porque a
 * matéria inteira é sobre número que **parece** certo: o total que fecha e
 * está errado, a célula que mostra 135 e é texto, a fórmula que devolve o nome
 * da unidade errada sem erro nenhum na tela.
 *
 * ── O diagnóstico aqui tem um formato só ──────────────────────────────────
 * Nada disto estoura. A planilha continua aberta, os números continuam
 * plausíveis, e ninguém é avisado. Toda pergunta de diagnóstico daqui descreve
 * uma planilha que **parece conferida**, porque é assim que o erro de planilha
 * chega — e é por isso que o requisito 7 existe.
 *
 * Toda alternativa errada diz por que está errada, no campo porque, e a certa
 * não carrega motivo nenhum. E nada de crase nem de asterisco: a questão vai
 * para o QuestionRenderer, que imprime texto puro, e a marcação sairia na tela
 * como marcação.
 */

export const QUESTOES_DE_PLANILHA: Record<string, Question[]> = {
  /* ──────────────────────────────────────────────────────────────────────
     Módulo 1 — A célula, o intervalo e as três zonas
     ────────────────────────────────────────────────────────────────────── */
  'm1-teoria': [
    {
      id: 'ES3-M1-Q1', type: 'multiple_choice',
      prompt: 'O que é um intervalo numa planilha?',
      data: { options: [
        { id: 'a', text: 'Um retângulo de células, escrito da primeira à última com dois-pontos.', correct: true },
        { id: 'b', text: 'O espaço em branco que separa duas tabelas.', porque: 'Esse espaço existe e é útil, mas não tem nome de intervalo: intervalo é um pedaço de células com endereço.' },
        { id: 'c', text: 'A diferença entre o maior e o menor valor de uma coluna.', porque: 'Isso é a amplitude dos dados, e se calcula com MÁXIMO menos MÍNIMO. Intervalo é endereço, e não conta.' },
        { id: 'd', text: 'O tempo que a planilha espera, depois de uma mudança, antes de refazer as contas.', porque: 'Não há espera nenhuma: a planilha refaz as contas assim que um valor muda.' },
      ]},
      explanation: 'D3:D14 é um intervalo. A1 é uma célula. A fórmula quase sempre quer o primeiro.',
    },
    {
      id: 'ES3-M1-Q2', type: 'scenario',
      prompt: 'Alguém escreveu o total logo abaixo da última linha de inscritos. No sábado seguinte chega o décimo terceiro desbravador. O que acontece?',
      data: { scenarios: [
        { id: 'a', text: 'Ou a linha nova cai em cima do total, ou o total fica somando uma tabela que cresceu sem ele.', correct: true },
        { id: 'b', text: 'A planilha percebe que a tabela cresceu, abre espaço sozinha e empurra o total para baixo.', porque: 'Ela empurra se alguém inserir uma linha; se a pessoa escrever na primeira linha livre, quem está lá é o total.' },
        { id: 'c', text: 'Nada: o total é recalculado na abertura do arquivo.', porque: 'O total recalcula quando um valor do intervalo muda, e não quando alguém escreve fora dele.' },
        { id: 'd', text: 'A planilha avisa que a tabela mudou de tamanho.', porque: 'Ela não sabe onde a tabela começa nem onde acaba — quem sabe é quem montou.' },
      ]},
      explanation: 'É por isso que o cálculo mora numa zona própria, e não encostado no fim dos dados.',
    },
    {
      id: 'ES3-M1-Q3', type: 'multiple_choice',
      prompt: 'Por que uma planilha bem construída separa o dado bruto do cálculo?',
      data: { options: [
        { id: 'a', text: 'Porque os dados crescem e os cálculos não, e encostados eles atrapalham um ao outro.', correct: true },
        { id: 'b', text: 'Porque o programa calcula mais rápido assim.', porque: 'A velocidade é a mesma. A razão é de organização, e ela aparece no dia em que a tabela cresce.' },
        { id: 'c', text: 'Porque fórmula e dado bruto não podem ficar na mesma aba de uma planilha bem montada.', porque: 'Podem, e quase sempre ficam. O que não podem é ficar embaralhados dentro do mesmo bloco.' },
        { id: 'd', text: 'Porque o dado bruto não pode ser alterado depois.', porque: 'Ele pode e vai ser: é justamente para isso que o cálculo é fórmula.' },
      ]},
      explanation: 'Ordenar, filtrar e acrescentar linha são gestos que acontecem no bloco de dados — e nenhum deles deve levar um total junto.',
    },
    {
      id: 'ES3-M1-Q4', type: 'multiple_choice',
      prompt: 'Uma coluna mostra ##### no lugar dos números. O que houve?',
      data: { options: [
        { id: 'a', text: 'A coluna está estreita demais para o número caber.', correct: true },
        { id: 'b', text: 'Os números foram apagados.', porque: 'Se estivessem apagados a célula ficaria vazia. O conteúdo está lá; o que falta é largura.' },
        { id: 'c', text: 'A fórmula daquela coluna está errada e a planilha resolveu esconder o resultado.', porque: 'Erro de fórmula aparece com nome — #NOME?, #REF!, #DIV/0! —, e não como uma fileira de cerquilhas.' },
        { id: 'd', text: 'A planilha está protegida contra edição.', porque: 'Proteção impede escrever, e não mostra o que já está escrito de outro jeito.' },
      ]},
      explanation: 'Texto que não cabe vaza para o lado; número que não cabe vira cerquilha, porque um número cortado pela metade seria mentira.',
    },
    {
      id: 'ES3-M1-Q5', type: 'true_false',
      prompt: 'Para alargar uma coluna, dá para escrever espaços dentro da célula até ela empurrar a borda.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'A borda da coluna não se move com o conteúdo: ela fica onde está, e o texto é que some ou vaza.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'A borda não se move com espaço nenhum: ela se arrasta pelo cabeçalho, e dois cliques nela ajustam ao conteúdo. E o espaço escrito vira parte do texto, o que estraga toda comparação depois.',
    },
    {
      id: 'ES3-M1-Q6', type: 'multiple_choice',
      prompt: 'Um número aparece encostado à esquerda da célula. O que isso costuma querer dizer?',
      data: { options: [
        { id: 'a', text: 'Que a planilha não o entendeu como número.', correct: true },
        { id: 'b', text: 'Que ele é menor que os outros da coluna.', porque: 'O tamanho não muda o alinhamento. Números vão todos para a direita, grandes ou pequenos.' },
        { id: 'c', text: 'Que alguém apertou o botão de alinhar à esquerda.', porque: 'Isso também alinha à esquerda, e é por isso que a pista não é prova: mas num bloco de dados em que ninguém mexeu no alinhamento, ela é o primeiro sinal.' },
        { id: 'd', text: 'Que ele veio de outra aba.', porque: 'De onde o valor veio não muda o lado em que ele encosta.' },
      ]},
      explanation: 'Número vai para a direita, texto para a esquerda — e é por essa diferença que se descobre um número guardado como texto.',
    },
    {
      id: 'ES3-M1-Q7', type: 'scenario',
      prompt: 'O título do relatório está escrito na célula A1 e some atrás da coluna B, que tem dados. Qual é a arrumação certa?',
      data: { scenarios: [
        { id: 'a', text: 'Mesclar de A1 até a última coluna da tabela e centralizar o título ali.', correct: true },
        { id: 'b', text: 'Alargar a coluna A até o título caber inteiro.', porque: 'A coluna A carrega os nomes; alargá-la até caber um título deixaria a tabela deformada por causa de uma linha só.' },
        { id: 'c', text: 'Escrever o título repartido em várias células.', porque: 'Um título em pedaços não é um título: ordenar ou filtrar embaralharia os pedaços.' },
        { id: 'd', text: 'Apagar o título da planilha e deixar o nome do relatório só no nome do arquivo.', porque: 'O nome do arquivo não aparece impresso nem na tela de quem abre a aba, e a apresentação é uma das três zonas.' },
      ]},
      explanation: 'Mesclar é da zona de apresentação, e é o único lugar onde ela é a resposta certa: dentro do bloco de dados, mesclagem atrapalha tudo o que vem depois.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 2 — Fórmula e função
     ────────────────────────────────────────────────────────────────────── */
  'm2-teoria': [
    {
      id: 'ES3-M2-Q1', type: 'multiple_choice',
      prompt: 'Qual é a diferença entre uma fórmula e uma função?',
      data: { options: [
        { id: 'a', text: 'Fórmula é a conta inteira; função é uma conta pronta, com nome, que a fórmula usa.', correct: true },
        { id: 'b', text: 'Fórmula é o que se escreve à mão na célula; função é o que se escolhe pronto no menu.', porque: 'As duas podem ser escritas à mão ou escolhidas no menu. A diferença é o que cada uma é, e não como se chega nela.' },
        { id: 'c', text: 'Função serve para números e fórmula serve para texto.', porque: 'Existem funções de texto e fórmulas de número. A separação não é por tipo de dado.' },
        { id: 'd', text: 'São a mesma coisa com dois nomes.', porque: 'Uma fórmula pode não ter função nenhuma: igual a B4 vezes 45 é fórmula e não usa função.' },
      ]},
      explanation: 'Igual a B4 vezes 45 é fórmula sem função. Igual a SOMA de D3 até D14 é fórmula com função.',
    },
    {
      id: 'ES3-M2-Q2', type: 'scenario',
      prompt: 'Uma célula mostra 1485, e a planilha tem doze inscritos. Alguém muda uma diária e o 1485 continua lá. O que aconteceu?',
      data: { scenarios: [
        { id: 'a', text: 'O 1485 foi digitado, e não calculado.', correct: true },
        { id: 'b', text: 'A fórmula está certa, mas precisa ser atualizada com F9.', porque: 'A planilha refaz a conta sozinha assim que o valor muda. Se não refez, não há conta.' },
        { id: 'c', text: 'A célula está formatada como texto.', porque: 'Isso deixaria a fórmula aparecer escrita na célula em vez do resultado — e o que se vê é um número.' },
        { id: 'd', text: 'A diária mudada está fora do intervalo da soma.', porque: 'É possível, e é o outro erro — mas aí o total mudaria nas outras onze linhas, e não ficaria parado em todas.' },
      ]},
      explanation: 'Número digitado está certo hoje e continua mostrando o de hoje amanhã. É por isso que o requisito 7 manda procurar um.',
    },
    {
      id: 'ES3-M2-Q3', type: 'multiple_choice',
      prompt: 'Numa coluna com cinco números, uma célula vazia e uma escrita "faltou", o que a MÉDIA faz?',
      data: { options: [
        { id: 'a', text: 'Soma os cinco números e divide por cinco.', correct: true },
        { id: 'b', text: 'Soma os cinco e divide por sete.', porque: 'Ela divide pela quantidade de números, e não pela de células do intervalo.' },
        { id: 'c', text: 'Devolve erro por causa da palavra.', porque: 'Texto dentro de um intervalo é ignorado, e não derruba a conta.' },
        { id: 'd', text: 'Conta a célula vazia como zero e divide por seis.', porque: 'Célula vazia não entra na conta nem como zero — se entrasse, puxaria a média para baixo sem ninguém entender por quê.' },
      ]},
      explanation: 'Ignorar não é o mesmo que virar zero, e a diferença entre as duas coisas muda a média inteira.',
    },
    {
      id: 'ES3-M2-Q4', type: 'multiple_choice',
      prompt: 'Uma coluna tem doze valores preenchidos. CONT.NÚM devolve 11 e CONT.VALORES devolve 12. O que isso diz?',
      data: { options: [
        { id: 'a', text: 'Um dos doze está preenchido com algo que a planilha não entende como número.', correct: true },
        { id: 'b', text: 'Uma das doze células tem uma fórmula escrita nela em vez de um número digitado.', porque: 'Fórmula que devolve número é contada pela CONT.NÚM normalmente — o que ela conta é o resultado.' },
        { id: 'c', text: 'Um valor é negativo.', porque: 'Negativo é número como qualquer outro, e as duas contagens o incluem.' },
        { id: 'd', text: 'Uma célula está formatada com outra cor.', porque: 'Cor é aparência: nenhuma das duas funções olha para ela.' },
      ]},
      explanation: 'A diferença entre as duas contagens é a maneira mais rápida de achar um número guardado como texto.',
    },
    {
      id: 'ES3-M2-Q5', type: 'true_false',
      prompt: 'Escrever SOMA sem o sinal de igual na frente faz a planilha somar assim mesmo.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Sem o igual não há conta nenhuma: a célula guarda a palavra, e é por isso que ela fica encostada à esquerda.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Sem o igual, a célula fica com a palavra SOMA escrita. O sinal de igual é o que separa conta de texto.',
    },
    {
      id: 'ES3-M2-Q6', type: 'scenario',
      prompt: 'O total de uma coluna de doze inscritos sai um pouco menor do que a conta feita na calculadora. Onde olhar primeiro?',
      data: { scenarios: [
        { id: 'a', text: 'No intervalo da fórmula: ele pode ter parado na penúltima linha.', correct: true },
        { id: 'b', text: 'Na quantidade de casas decimais mostrada.', porque: 'Casas decimais mudam o que se lê, e não o que se soma. E a diferença aqui é de um inscrito inteiro.' },
        { id: 'c', text: 'Na função que foi escolhida, que pode ser a média da coluna em vez da soma dela.', porque: 'A média de doze valores daria um número muito menor, e não um pouco menor.' },
        { id: 'd', text: 'Na largura da coluna.', porque: 'Largura não muda valor nenhum: ela só decide se o número cabe na tela.' },
      ]},
      explanation: 'O intervalo que deixa a última linha de fora é o erro de planilha mais comum que existe, e o resultado dele é sempre plausível.',
    },
    {
      id: 'ES3-M2-Q7', type: 'multiple_choice',
      prompt: 'Para saber quantos desbravadores se inscreveram, qual função responde?',
      data: { options: [
        { id: 'a', text: 'Uma contagem sobre a coluna de diárias.', correct: true },
        { id: 'b', text: 'A soma da coluna de diárias, somando tudo o que foi vendido de diária.', porque: 'A soma diz quantas diárias foram vendidas no total, e não quantas pessoas se inscreveram.' },
        { id: 'c', text: 'O máximo da coluna de diárias.', porque: 'O máximo diz quem ficou mais tempo, e não quantos vieram.' },
        { id: 'd', text: 'A média da coluna de diárias.', porque: 'A média diz quanto tempo o inscrito típico fica, e não quantos são.' },
      ]},
      explanation: 'Cada uma das cinco funções responde a uma pergunta diferente, e escolher a errada dá um número que parece razoável.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 3 — A referência que anda e a que fica
     ────────────────────────────────────────────────────────────────────── */
  'm3-teoria': [
    {
      id: 'ES3-M3-Q1', type: 'multiple_choice',
      prompt: 'O que o cifrão faz numa referência?',
      data: { options: [
        { id: 'a', text: 'Trava aquele pedaço do endereço quando a fórmula é copiada.', correct: true },
        { id: 'b', text: 'Diz à planilha que aquele valor é dinheiro e precisa sair com duas casas.', porque: 'Dinheiro é formato de célula, e se escolhe nos botões de número. O cifrão dentro da fórmula é outra coisa.' },
        { id: 'c', text: 'Protege a célula contra edição.', porque: 'Proteção é um recurso à parte, e vale para a célula, e não para quem a cita.' },
        { id: 'd', text: 'Marca a fórmula como importante.', porque: 'A planilha não tem marca de importância. Tudo o que o cifrão faz é impedir que o endereço ande.' },
      ]},
      explanation: 'Cifrão antes da letra trava a coluna; antes do número, a linha. Dois cifrões travam as duas.',
    },
    {
      id: 'ES3-M3-Q2', type: 'scenario',
      prompt: 'Alguém escreveu igual a B4 vezes B1 na primeira linha e arrastou para baixo. A primeira linha está certa e as onze de baixo estão zeradas. Por quê?',
      data: { scenarios: [
        { id: 'a', text: 'A referência a B1 andou junto, e foi parar em células vazias.', correct: true },
        { id: 'b', text: 'A alça de preenchimento copiou o resultado da primeira linha, e não a fórmula dela.', porque: 'Ela copia a fórmula. Se copiasse o resultado, as onze mostrariam o mesmo número da primeira, e não zero.' },
        { id: 'c', text: 'As onze linhas de baixo estão sem diárias.', porque: 'Se estivessem, a coluna de diárias estaria vazia — e ela não está.' },
        { id: 'd', text: 'B1 está formatada como texto.', porque: 'Aí a primeira linha também daria zero, e não só as de baixo.' },
      ]},
      explanation: 'É um dos poucos erros de planilha que se denuncia sozinho: a coluna sai certa no topo e zerada embaixo.',
    },
    {
      id: 'ES3-M3-Q3', type: 'multiple_choice',
      prompt: 'Arrastando uma fórmula para baixo, qual pedaço da referência precisa ficar parado?',
      data: { options: [
        { id: 'a', text: 'A linha.', correct: true },
        { id: 'b', text: 'A coluna.', porque: 'Descendo, a coluna não muda sozinha — não há o que travar nela. Quem anda é a linha.' },
        { id: 'c', text: 'As duas, sempre.', porque: 'Travar as duas funciona, mas travar a que não ia andar não muda nada: o que importa é entender qual anda.' },
        { id: 'd', text: 'Nenhuma: arrastar não muda referência.', porque: 'Muda, e é justamente isso que faz a alça ser útil — cada linha lê a linha dela.' },
      ]},
      explanation: 'Indo para o lado é o contrário: quem anda é a coluna, e é ela que precisa do cifrão.',
    },
    {
      id: 'ES3-M3-Q4', type: 'multiple_choice',
      prompt: 'Em vez de citar a célula do valor da diária, alguém escreveu o número 45 dentro das doze fórmulas. O que isso custa?',
      data: { options: [
        { id: 'a', text: 'No ano que vem, com a diária a 50, as doze saem erradas e nada avisa.', correct: true },
        { id: 'b', text: 'Nada: o resultado é o mesmo.', porque: 'Hoje é o mesmo. A conta que a planilha existe para fazer é a do dia em que o valor muda.' },
        { id: 'c', text: 'A planilha fica mais lenta.', porque: 'Número escrito é até mais rápido de calcular. O custo é de manutenção, e não de velocidade.' },
        { id: 'd', text: 'A fórmula deixa de poder ser arrastada.', porque: 'Ela é arrastada normalmente — e é isso que espalha o 45 pelas doze linhas.' },
      ]},
      explanation: 'Valor que se repete em doze lugares é valor que vai ser trocado em onze.',
    },
    {
      id: 'ES3-M3-Q5', type: 'true_false',
      prompt: 'Copiar uma fórmula e colar noutra célula faz as referências relativas andarem, igual a arrastar a alça.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'A alça é só um jeito rápido de copiar e colar em sequência: quem move as referências é a cópia, e não o arrasto.' },
      ]},
      explanation: 'É a mesma regra nos dois gestos, e por isso colar uma fórmula longe do lugar dela costuma dar erro de referência.',
    },
    {
      id: 'ES3-M3-Q6', type: 'scenario',
      prompt: 'Uma fórmula precisa ser copiada para baixo e para o lado, sempre lendo a mesma célula de referência. O que escrever?',
      data: { scenarios: [
        { id: 'a', text: 'Cifrão antes da letra e antes do número.', correct: true },
        { id: 'b', text: 'Cifrão só antes do número.', porque: 'Isso segura a linha, mas a coluna anda quando a fórmula vai para o lado.' },
        { id: 'c', text: 'Cifrão só antes da letra.', porque: 'Isso segura a coluna, mas a linha anda quando a fórmula desce.' },
        { id: 'd', text: 'Nenhum cifrão, e copiar com colar especial.', porque: 'Colar especial escolhe o que colar — valor, formato, fórmula —, e não impede a referência de andar.' },
      ]},
      explanation: 'Dois cifrões é o endereço que não anda em direção nenhuma, e é para isso que ele existe.',
    },
    {
      id: 'ES3-M3-Q7', type: 'multiple_choice',
      prompt: 'Uma célula mostra #REF!. O que aconteceu com ela?',
      data: { options: [
        { id: 'a', text: 'A fórmula aponta para uma célula que não existe mais.', correct: true },
        { id: 'b', text: 'A fórmula tem o nome de uma função que a planilha não conhece.', porque: 'Nome errado dá #NOME?, que é outro erro e manda procurar outra coisa.' },
        { id: 'c', text: 'A conta deu um número grande demais.', porque: 'Número grande demais tem erro próprio, e não é este.' },
        { id: 'd', text: 'A célula foi protegida.', porque: 'Célula protegida recusa a edição e continua mostrando o que tem — ela não vira erro.' },
      ]},
      explanation: 'Costuma vir de uma coluna excluída: a planilha escreve o erro dentro da própria fórmula, no lugar onde havia um endereço.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 4 — A planilha que decide e a que procura
     ────────────────────────────────────────────────────────────────────── */
  'm4-teoria': [
    {
      id: 'ES3-M4-Q1', type: 'multiple_choice',
      prompt: 'O que uma função condicional faz?',
      data: { options: [
        { id: 'a', text: 'Faz uma pergunta e escreve uma coisa se a resposta for sim e outra se for não.', correct: true },
        { id: 'b', text: 'Pinta a célula de uma cor ou de outra, conforme o valor que estiver nela.', porque: 'Isso é formatação condicional, que é outra coisa: ela muda a aparência, e não o conteúdo.' },
        { id: 'c', text: 'Esconde as linhas que não interessam.', porque: 'Isso é o filtro. A função condicional não esconde nada — ela escreve.' },
        { id: 'd', text: 'Impede que se escreva um valor fora da regra.', porque: 'Isso é validação de dados, e vive no menu de Dados.' },
      ]},
      explanation: 'A pergunta, a resposta para sim e a resposta para não: três coisas, nessa ordem.',
    },
    {
      id: 'ES3-M4-Q2', type: 'scenario',
      prompt: 'Uma coluna de PROCV devolve o nome do conselheiro de outra unidade em algumas linhas, e #N/D em outras. O que foi esquecido?',
      data: { scenarios: [
        { id: 'a', text: 'O último argumento, que manda procurar exato.', correct: true },
        { id: 'b', text: 'Travar a tabela de procura com cifrões.', porque: 'Sem os cifrões a tabela anda e a maioria das linhas dá #N/D — e não um nome plausível de outra unidade.' },
        { id: 'c', text: 'O número da coluna a trazer.', porque: 'Sem ele a fórmula nem é aceita: a planilha recusa a função com argumentos de menos.' },
        { id: 'd', text: 'Ordenar a tabela de origem.', porque: 'Com o argumento exato escrito, a ordem da tabela de procura deixa de importar.' },
      ]},
      explanation: 'Sem ele a procura é aproximada: ela lê a coluna como se estivesse ordenada, e para na linha errada.',
    },
    {
      id: 'ES3-M4-Q3', type: 'multiple_choice',
      prompt: 'Por que a procura aproximada é mais perigosa do que um erro que aparece?',
      data: { options: [
        { id: 'a', text: 'Porque ela devolve um valor plausível, e não um aviso.', correct: true },
        { id: 'b', text: 'Porque ela é mais lenta.', porque: 'Ela é até mais rápida — é por isso que ela existe, e por isso que é o padrão.' },
        { id: 'c', text: 'Porque ela só funciona com números.', porque: 'Ela funciona com texto também, e é aí que o estrago aparece: nome de unidade, nome de pessoa.' },
        { id: 'd', text: 'Porque ela apaga a tabela de origem.', porque: 'Nenhuma função de procura mexe na tabela que ela lê.' },
      ]},
      explanation: 'Um #N/D manda conferir. Um nome errado ao lado de um desbravador não manda nada, e vai para o relatório.',
    },
    {
      id: 'ES3-M4-Q4', type: 'multiple_choice',
      prompt: 'Numa função de procura, o que o número do meio quer dizer?',
      data: { options: [
        { id: 'a', text: 'Qual coluna da tabela de procura tem o valor a trazer, contando da primeira dela.', correct: true },
        { id: 'b', text: 'Quantas linhas da tabela procurar antes de desistir e devolver erro.', porque: 'Ela procura a tabela inteira; não há limite de tentativas.' },
        { id: 'c', text: 'A coluna da planilha, contada de A.', porque: 'A contagem começa na primeira coluna da tabela de procura, e não na coluna A da aba.' },
        { id: 'd', text: 'Quantas casas decimais mostrar no resultado.', porque: 'Casas decimais são formato de célula, e não argumento de função.' },
      ]},
      explanation: 'É por isso que a coluna do valor procurado precisa ser a primeira da tabela: a contagem começa nela.',
    },
    {
      id: 'ES3-M4-Q5', type: 'true_false',
      prompt: 'As aspas em volta de uma palavra dentro de uma fórmula servem para deixá-la em destaque.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Destaque é formatação, e se faz na célula. As aspas dizem à planilha que aquilo é uma palavra, e não o endereço de uma célula.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Sem aspas, Sim seria lido como o nome de alguma coisa — e a fórmula devolveria erro ou vazio.',
    },
    {
      id: 'ES3-M4-Q6', type: 'scenario',
      prompt: 'A coluna condicional responde Sim em todas as doze linhas, e nem todos os inscritos ficam até domingo. Onde está o erro?',
      data: { scenarios: [
        { id: 'a', text: 'Na comparação: ela está aceitando mais do que devia.', correct: true },
        { id: 'b', text: 'Na palavra Sim, que precisa estar em maiúscula.', porque: 'A planilha escreve exatamente o que está entre aspas, e maiúscula ou minúscula não muda quando ela escreve.' },
        { id: 'c', text: 'Na ordem dos argumentos, que está invertida.', porque: 'Invertida, a coluna responderia Não em todas — e não Sim.' },
        { id: 'd', text: 'Na falta de cifrão na referência.', porque: 'Sem cifrão a fórmula lê a linha dela, que é exatamente o certo aqui.' },
      ]},
      explanation: 'Maior que dois e maior ou igual a três dão o mesmo resultado nesta lista; maior ou igual a dois dá Sim para todo mundo.',
    },
    {
      id: 'ES3-M4-Q7', type: 'multiple_choice',
      prompt: 'Por que trazer o nome do conselheiro com uma função, em vez de digitar os doze?',
      data: { options: [
        { id: 'a', text: 'Porque trocar um conselheiro passa a ser mudar uma célula, e não doze.', correct: true },
        { id: 'b', text: 'Porque digitar doze nomes à mão acaba produzindo erro de ortografia em algum deles.', porque: 'Dá, e isso é um problema de verdade — mas o que a função resolve é a mudança, que acontece toda temporada.' },
        { id: 'c', text: 'Porque a planilha não aceita texto digitado em coluna calculada.', porque: 'Aceita. Nada impede digitar por cima de uma fórmula, e é assim que uma coluna calculada se perde.' },
        { id: 'd', text: 'Porque a função ocupa menos espaço no arquivo.', porque: 'Fórmula ocupa mais espaço que texto. A razão é o que acontece quando o dado muda.' },
      ]},
      explanation: 'Toda vez que um valor aparece escrito em mais de um lugar, ele vai ser mudado em menos lugares do que aparece.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 5 — Ver o que importa
     ────────────────────────────────────────────────────────────────────── */
  'm5-teoria': [
    {
      id: 'ES3-M5-Q1', type: 'multiple_choice',
      prompt: 'Qual das três mexe nos dados de verdade?',
      data: { options: [
        { id: 'a', text: 'Ordenar.', correct: true },
        { id: 'b', text: 'Filtrar.', porque: 'Filtrar esconde linha e não apaga nenhuma: tirando o filtro, a tabela volta inteira.' },
        { id: 'c', text: 'Congelar.', porque: 'Congelar é de tela: prende o cabeçalho enquanto o resto rola, e não vai nem para o papel.' },
        { id: 'd', text: 'Nenhuma das três.', porque: 'Ordenar troca as linhas de lugar no arquivo, e é por isso que ela é a única sem volta fácil.' },
      ]},
      explanation: 'E é por isso que ordenar precisa levar a linha inteira: metade ordenada é um cadastro trocado.',
    },
    {
      id: 'ES3-M5-Q2', type: 'scenario',
      prompt: 'Com um filtro aplicado, a célula do total mostra um número maior do que a soma do que está na tela. Por quê?',
      data: { scenarios: [
        { id: 'a', text: 'A SOMA continua somando as linhas escondidas.', correct: true },
        { id: 'b', text: 'O filtro apagou linhas e a fórmula ficou desatualizada.', porque: 'Filtro não apaga nada. Se apagasse, o total teria diminuído.' },
        { id: 'c', text: 'A fórmula da célula está somando uma coluna que não é a dos valores.', porque: 'Aí o número estaria errado com e sem filtro, e não só com ele.' },
        { id: 'd', text: 'O total foi digitado.', porque: 'Total digitado fica parado em qualquer situação, e não muda quando o filtro muda.' },
      ]},
      explanation: 'É o mal-entendido que custa caro: quem não sabe disso lê o número da célula e o manda para a liderança.',
    },
    {
      id: 'ES3-M5-Q3', type: 'multiple_choice',
      prompt: 'Alguém selecionou só a coluna Unidade e mandou ordenar. O que acontece com a tabela?',
      data: { options: [
        { id: 'a', text: 'Cada nome passa a ficar ao lado da unidade de outro.', correct: true },
        { id: 'b', text: 'Nada: a planilha ordena a tabela inteira mesmo assim.', porque: 'Alguns programas avisam e perguntam; outros obedecem ao que foi selecionado. Contar com o aviso é contar com sorte.' },
        { id: 'c', text: 'A coluna some da tela.', porque: 'Ordenar não esconde nada — o que esconde é o filtro.' },
        { id: 'd', text: 'A ordenação é recusada por falta de cabeçalho.', porque: 'O cabeçalho ajuda a planilha a não ordená-lo junto, mas a falta dele não impede a ordenação.' },
      ]},
      explanation: 'A tabela continua com doze linhas plausíveis, e todas erradas. É o estrago mais caro que uma planilha sofre.',
    },
    {
      id: 'ES3-M5-Q4', type: 'multiple_choice',
      prompt: 'Uma regra de formatação condicional de "menor que 3" foi aplicada à coluna inteira, e metade da coluna acendeu. Por quê?',
      data: { options: [
        { id: 'a', text: 'Célula vazia conta como zero, e zero é menor que três.', correct: true },
        { id: 'b', text: 'A regra foi aplicada duas vezes.', porque: 'Duas regras iguais pintam as mesmas células, e não mais células.' },
        { id: 'c', text: 'A cor escolhida é clara demais e vazou para as vizinhas.', porque: 'Cor não vaza: cada célula é pintada por conta própria.' },
        { id: 'd', text: 'A coluna tem números invisíveis.', porque: 'Não existe número invisível. O que existe é célula vazia, e ela vale zero na comparação.' },
      ]},
      explanation: 'Por isso a faixa da regra vai até a última linha com dado, e não até o fim da coluna. Planilha toda colorida não destaca nada.',
    },
    {
      id: 'ES3-M5-Q5', type: 'true_false',
      prompt: 'Congelar o cabeçalho impede que alguém edite aquelas células.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Congelar é só de tela: as células continuam abertas à edição, e é a proteção de planilha que tranca.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O nome engana: congelar prende o cabeçalho enquanto o resto rola, e não tranca nada.',
    },
    {
      id: 'ES3-M5-Q6', type: 'scenario',
      prompt: 'A lista tem cento e vinte linhas e é preciso conferir só uma unidade. Qual ferramenta responde?',
      data: { scenarios: [
        { id: 'a', text: 'O filtro, escolhendo aquela unidade na setinha do cabeçalho.', correct: true },
        { id: 'b', text: 'Ordenar por unidade e rolar até achar.', porque: 'Funciona, e mexe nos dados para resolver um problema de tela — e depois as linhas ficam noutra ordem para sempre.' },
        { id: 'c', text: 'Apagar as outras unidades e desfazer depois.', porque: 'Desfazer resolve enquanto a janela está aberta; se alguém salvar no meio, o trabalho de todo mundo se perde.' },
        { id: 'd', text: 'Formatação condicional pintando aquela unidade.', porque: 'Pintar ajuda a achar, mas as cento e vinte linhas continuam na tela — e a conta continua somando todas.' },
      ]},
      explanation: 'Filtro é a ferramenta que responde "mostre só isto" sem mexer em nada.',
    },
    {
      id: 'ES3-M5-Q7', type: 'multiple_choice',
      prompt: 'O que a formatação condicional muda numa célula?',
      data: { options: [
        { id: 'a', text: 'A aparência dela, conforme o valor que ela tem.', correct: true },
        { id: 'b', text: 'O valor dela, conforme a regra.', porque: 'Ela nunca escreve nada: o valor continua o mesmo, e só a cor muda.' },
        { id: 'c', text: 'A posição dela na ordenação.', porque: 'A cor não entra na ordenação — a não ser que alguém mande ordenar por cor, que é outro comando.' },
        { id: 'd', text: 'Se ela entra ou não nas contas.', porque: 'Toda célula entra nas contas do mesmo jeito, pintada ou não.' },
      ]},
      explanation: 'É uma regra que olha o valor e decide a cor — e ela se refaz sozinha quando o valor muda.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 6 — O orçamento e o gráfico
     ────────────────────────────────────────────────────────────────────── */
  'm6-teoria': [
    {
      id: 'ES3-M6-Q1', type: 'scenario',
      prompt: 'A liderança pergunta para onde vai o dinheiro do acampamento. Que gráfico responde?',
      data: { scenarios: [
        { id: 'a', text: 'Pizza, com uma fatia por categoria.', correct: true },
        { id: 'b', text: 'Linhas, ligando as categorias.', porque: 'A linha afirma que uma coisa virou a outra ao longo do tempo. Alimentação não virou Transporte.' },
        { id: 'c', text: 'Dispersão, com as categorias nos dois eixos.', porque: 'Dispersão mostra se duas medidas andam juntas, e aqui há uma medida só.' },
        { id: 'd', text: 'Nenhum: a tabela já responde.', porque: 'A tabela tem a resposta, e o gráfico é o que faz alguém ver a proporção sem fazer conta de cabeça.' },
      ]},
      explanation: 'O tipo sai da pergunta. Repartição é pizza; comparação é colunas; evolução é linha.',
    },
    {
      id: 'ES3-M6-Q2', type: 'multiple_choice',
      prompt: 'Por que um gráfico sem os eixos identificados não afirma nada?',
      data: { options: [
        { id: 'a', text: 'Porque os números podem ser reais, pessoas ou qualquer coisa.', correct: true },
        { id: 'b', text: 'Porque ele não pode ser impresso.', porque: 'Ele imprime igual. O problema é o que quem lê consegue concluir dele.' },
        { id: 'c', text: 'Porque a planilha se recusa a desenhá-lo.', porque: 'Ela desenha sem reclamar, e é por isso que o gráfico sem eixo é tão comum.' },
        { id: 'd', text: 'Porque as cores ficam erradas.', porque: 'As cores continuam as mesmas: o que falta é a informação, e não a aparência.' },
      ]},
      explanation: 'Título e eixos são o que separa um desenho de uma afirmação.',
    },
    {
      id: 'ES3-M6-Q3', type: 'multiple_choice',
      prompt: 'Num orçamento de três meses, por que o total do mês não deve ser digitado?',
      data: { options: [
        { id: 'a', text: 'Porque ele deixa de acompanhar no dia em que um gasto for corrigido.', correct: true },
        { id: 'b', text: 'Porque digitar dá mais trabalho.', porque: 'Digitar dá menos trabalho hoje. O custo chega depois.' },
        { id: 'c', text: 'Porque o orçamento não pode ter números escritos.', porque: 'Os gastos são escritos, e é isso que eles são: dado bruto. O que não se escreve é o que se calcula.' },
        { id: 'd', text: 'Porque o programa recusa número numa linha de total.', porque: 'Ele aceita qualquer coisa em qualquer célula, e é justamente por isso que o cuidado é de quem monta.' },
      ]},
      explanation: 'Gasto corrigido é a coisa mais comum que acontece num orçamento, e é exatamente quando o total digitado erra.',
    },
    {
      id: 'ES3-M6-Q4', type: 'scenario',
      prompt: 'Uma célula de total mostra o número certo e não muda quando um gasto é corrigido. Na barra de fórmulas está escrito uma soma de três números.',
      data: { scenarios: [
        { id: 'a', text: 'É um número parado com sinal de igual na frente: os valores foram escritos dentro da fórmula.', correct: true },
        { id: 'b', text: 'A fórmula está certa, e o que está desligado é o recálculo automático da planilha.', porque: 'Com o recálculo desligado nenhuma fórmula da planilha acompanharia, e não só esta.' },
        { id: 'c', text: 'A célula está formatada como texto.', porque: 'Aí ela mostraria a fórmula escrita, e não o resultado.' },
        { id: 'd', text: 'O gasto corrigido está noutra aba.', porque: 'Fórmula que lê outra aba acompanha do mesmo jeito. O que não acompanha é número escrito.' },
      ]},
      explanation: 'Começar por igual não faz de um número uma conta: o que faz é citar as células.',
    },
    {
      id: 'ES3-M6-Q5', type: 'multiple_choice',
      prompt: 'O total geral pode ser somado pela linha de totais ou pela coluna de totais. Por que conferir os dois?',
      data: { options: [
        { id: 'a', text: 'Porque se um dos dois pegou uma célula a mais ou a menos, os números discordam.', correct: true },
        { id: 'b', text: 'Porque a planilha faz a conta de um jeito na linha e de outro jeito na coluna.', porque: 'A conta é a mesma nos dois sentidos: o que pode diferir é o intervalo que alguém escreveu.' },
        { id: 'c', text: 'Porque um dos dois inclui os cabeçalhos.', porque: 'Cabeçalho é texto e é ignorado pela soma. O que muda o resultado é linha ou coluna a mais de número.' },
        { id: 'd', text: 'Porque assim o arquivo fica mais confiável para imprimir.', porque: 'Impressão não confere nada. A conferência é de quem monta.' },
      ]},
      explanation: 'Dois caminhos até o mesmo número é a conferência mais barata que uma planilha oferece.',
    },
    {
      id: 'ES3-M6-Q6', type: 'true_false',
      prompt: 'Um gráfico de colunas serve igualmente bem para mostrar repartição de um total.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Colunas comparam grandezas lado a lado e não mostram quanto cada uma pesa no todo: quem responde isso é a pizza.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Os dois desenham sem erro nenhum, e é aí que está a armadilha: escolher o tipo é a lição, e não clicar em Inserir.',
    },
    {
      id: 'ES3-M6-Q7', type: 'multiple_choice',
      prompt: 'Para que serve a linha de totais por mês, se já existe a coluna de totais por categoria?',
      data: { options: [
        { id: 'a', text: 'Elas respondem perguntas diferentes: quanto se gastou em cada mês, e quanto em cada coisa.', correct: true },
        { id: 'b', text: 'Uma existe só para conferir a outra, e nenhuma das duas diz nada de novo.', porque: 'Elas servem de conferência mútua, mas cada uma responde a uma pergunta que a outra não responde.' },
        { id: 'c', text: 'A linha é só enfeite: o que importa é a coluna.', porque: 'Saber em que mês o dinheiro foi embora é o que permite planejar o do ano que vem.' },
        { id: 'd', text: 'Para o gráfico poder ser desenhado.', porque: 'O gráfico é desenhado de qualquer um dos dois — e escolher qual é parte de escolher a pergunta.' },
      ]},
      explanation: 'Uma tabela de duas entradas responde duas perguntas, e é para isso que ela tem dois totais.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 7 — A planilha defeituosa
     ────────────────────────────────────────────────────────────────────── */
  'm7-teoria': [
    {
      id: 'ES3-M7-Q1', type: 'multiple_choice',
      prompt: 'Dos três defeitos que o requisito manda achar, qual é o único que aparece na tela?',
      data: { options: [
        { id: 'a', text: 'A fórmula quebrada.', correct: true },
        { id: 'b', text: 'O número guardado como texto.', porque: 'Na célula ele é igual aos outros: o que denuncia é o alinhamento e a diferença entre as duas contagens.' },
        { id: 'c', text: 'O total digitado à mão.', porque: 'Esse é o pior dos três justamente por não ter pista nenhuma: ele está certo hoje.' },
        { id: 'd', text: 'Os três aparecem.', porque: 'Só um deles escreve alguma coisa diferente na célula. Os outros dois parecem normais.' },
      ]},
      explanation: 'É por isso que os três são de naturezas diferentes: um grita, um tem pista, e um não tem nenhuma.',
    },
    {
      id: 'ES3-M7-Q2', type: 'scenario',
      prompt: 'Numa coluna de valores, a soma fecha menos do que devia e nenhuma célula mostra erro. Qual é o primeiro teste?',
      data: { scenarios: [
        { id: 'a', text: 'Contar os números da coluna e comparar com quantas células estão preenchidas.', correct: true },
        { id: 'b', text: 'Refazer a soma da coluna inteira na calculadora e comparar com o que está na tela.', porque: 'Isso confirma que há diferença, e é o que já se sabe. O que falta é achar onde ela está.' },
        { id: 'c', text: 'Apagar e reescrever a fórmula.', porque: 'A fórmula pode estar certa: se o problema for uma célula que não é número, reescrever não muda nada.' },
        { id: 'd', text: 'Aumentar as casas decimais.', porque: 'Casas decimais mudam o que se lê. A diferença aqui é de um valor inteiro.' },
      ]},
      explanation: 'Doze preenchidas e onze números: a que sobra é a que a soma está pulando.',
    },
    {
      id: 'ES3-M7-Q3', type: 'multiple_choice',
      prompt: 'Qual é o jeito certo de consertar um número guardado como texto?',
      data: { options: [
        { id: 'a', text: 'Escrever o número de novo, sem o que estava na frente dele.', correct: true },
        { id: 'b', text: 'Apagar a célula, para tirar da coluna aquilo que a soma não estava entendendo.', porque: 'Isso tira o defeito e deixa um buraco: a coluna passa a ter onze valores, e o total continua errado.' },
        { id: 'c', text: 'Alinhar a célula à direita.', porque: 'Alinhar muda o lado em que o texto encosta, e não o que a planilha entende que ele é.' },
        { id: 'd', text: 'Trocar a cor da fonte.', porque: 'Cor é aparência e não muda nada do que a célula guarda.' },
      ]},
      explanation: 'O alinhamento é a pista, e não a doença: mudá-lo esconde o sintoma e deixa a soma errada.',
    },
    {
      id: 'ES3-M7-Q4', type: 'multiple_choice',
      prompt: 'Por que apresentar a planilha explicando cada fórmula é parte do requisito?',
      data: { options: [
        { id: 'a', text: 'Porque copiar uma fórmula é possível, e explicar copiando não é.', correct: true },
        { id: 'b', text: 'Porque a planilha pode estar errada e o examinador conferir.', porque: 'Ele confere de qualquer jeito. O que a explicação mede é outra coisa: se quem montou entendeu.' },
        { id: 'c', text: 'Porque a apresentação ao examinador é o que vale a nota final da vereda.', porque: 'A vereda não tem nota. O que ela pede é demonstração.' },
        { id: 'd', text: 'Porque o examinador precisa aprender a usar a planilha.', porque: 'Quem está demonstrando é quem estuda, e não o contrário.' },
      ]},
      explanation: 'É o mesmo requisito difícil do programa livre de Python, e ele existe pela mesma razão.',
    },
    {
      id: 'ES3-M7-Q5', type: 'true_false',
      prompt: 'Uma planilha em que todas as células mostram número, e nenhuma mostra erro, está conferida.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Dois dos três defeitos do requisito 7 mostram número normal: o guardado como texto e o total digitado.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Conferir uma planilha é olhar o que está na barra de fórmulas, e não o que está na célula.',
    },
    {
      id: 'ES3-M7-Q6', type: 'scenario',
      prompt: 'O total de diárias mostra 33, que é o número certo. Como descobrir se ele foi calculado ou digitado?',
      data: { scenarios: [
        { id: 'a', text: 'Clicar na célula e olhar a barra de fórmulas.', correct: true },
        { id: 'b', text: 'Ver se ele está alinhado à direita.', porque: 'Número digitado também vai para a direita. O alinhamento não separa cálculo de digitação.' },
        { id: 'c', text: 'Conferir se o número bate com a soma feita à mão.', porque: 'Ele bate: foi digitado certo. É amanhã que ele erra.' },
        { id: 'd', text: 'Mudar a cor da célula e ver se o número muda.', porque: 'Cor não muda valor nenhum, calculado ou digitado.' },
      ]},
      explanation: 'A barra de fórmulas é onde a planilha conta a verdade: na célula ela mostra só o resultado.',
    },
    {
      id: 'ES3-M7-Q7', type: 'multiple_choice',
      prompt: 'Uma planilha defeituosa foi entregue com os três erros corrigidos, mas os totais continuam digitados noutras três células. O que isso significa?',
      data: { options: [
        { id: 'a', text: 'O mesmo defeito continua na planilha, só que em outro lugar.', correct: true },
        { id: 'b', text: 'Está certo: o requisito pedia três erros, e três foram corrigidos.', porque: 'O requisito pede identificar três; consertar um tipo de erro e deixar o mesmo tipo ao lado não é ter entendido o erro.' },
        { id: 'c', text: 'Os outros três não contam por estarem fora da tabela.', porque: 'Total digitado erra onde estiver: dentro ou fora do bloco de dados.' },
        { id: 'd', text: 'A planilha vai avisar quando eles ficarem desatualizados.', porque: 'Ela não sabe que aqueles números deveriam ser contas, e por isso nunca avisa.' },
      ]},
      explanation: 'Achar o erro é meia lição; a outra metade é reconhecê-lo quando ele aparece com outra roupa.',
    },
  ],
};
