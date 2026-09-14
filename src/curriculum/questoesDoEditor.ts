import type { Question } from '../types';

/*
 * As questões das lições de teoria da CC-ES002 Editor de Texto.
 *
 * ── O que elas medem ──────────────────────────────────────────────────────
 * A definição vale uma vez. Depois dela vêm consequência, discriminação e
 * diagnóstico — e nesta vereda a consequência carrega quase tudo, porque a
 * matéria inteira é sobre o que acontece **depois**: o documento que precisa
 * mudar, o sumário que envelhece, o PDF exportado cedo demais, a substituição
 * que alcançou mais do que devia.
 *
 * ── O diagnóstico aqui tem um formato só ──────────────────────────────────
 * Nada disto estoura. O sumário vazio é uma caixa sem nada dentro; o sumário
 * velho mostra títulos que já mudaram; a imagem some porque alguém apagou o
 * parágrafo em que ela estava ancorada; o PDF entregue está sem as duas
 * últimas páginas. Toda pergunta de diagnóstico daqui descreve um documento
 * que **parece** pronto, porque é assim que o erro de formatação chega.
 *
 * Toda alternativa errada diz por que está errada, no campo porque, e a certa
 * não carrega motivo nenhum. E nada de crase nem de asterisco: a questão vai
 * para o QuestionRenderer, que imprime texto puro, e a marcação sairia na tela
 * como marcação.
 */

export const QUESTOES_DO_EDITOR: Record<string, Question[]> = {
  /* ──────────────────────────────────────────────────────────────────────
     Módulo 1 — Formatar é decidir uma vez
     ────────────────────────────────────────────────────────────────────── */
  'm1-teoria': [
    {
      id: 'ES2-M1-Q1', type: 'multiple_choice',
      prompt: 'O que o documento guarda quando você seleciona um texto e clica em negrito?',
      data: { options: [
        { id: 'a', text: 'Que aquele pedaço é negrito, e nada além disso.', correct: true },
        { id: 'b', text: 'Que aquele pedaço é um título.', porque: 'Isso o documento só sabe se alguém aplicar um estilo de título. Negrito é aparência, e não função.' },
        { id: 'c', text: 'Uma regra que vale para os outros textos parecidos.', porque: 'A ordem morre no pedaço selecionado. O que se espalha para outros é o estilo.' },
        { id: 'd', text: 'Um atalho para repetir a formatação depois.', porque: 'Existe o pincel de formatação para copiar aparência, mas ele também é aplicado um a um, e não fica guardado como regra.' },
      ]},
      explanation: 'É esta a diferença inteira: a formatação direta guarda a aparência, e o estilo guarda o que a coisa é.',
    },
    {
      id: 'ES2-M1-Q2', type: 'scenario',
      prompt: 'Um relatório de vinte páginas tem cinquenta títulos, todos formatados à mão em negrito 16. A liderança pede que os títulos fiquem em 14. Qual é o custo?',
      data: { scenarios: [
        { id: 'a', text: 'Achar e mudar cada um dos cinquenta, e conferir se não sobrou nenhum.', correct: true },
        { id: 'b', text: 'Nenhum: basta mudar o tamanho padrão do documento.', porque: 'O tamanho padrão só alcança o que não foi formatado à mão. Os cinquenta já têm ordem própria, e ela ganha.' },
        { id: 'c', text: 'Selecionar o documento inteiro e trocar o tamanho.', porque: 'Isso mudaria o corpo do texto junto, e os cinquenta títulos ficariam do mesmo tamanho do resto.' },
        { id: 'd', text: 'Reabrir o arquivo, porque a mudança de tamanho é aplicada na abertura.', porque: 'Nada é recalculado na abertura. O que está gravado no parágrafo é o que aparece.' },
      ]},
      explanation: 'E o que mais custa não é o trabalho: é o título que ficou de fora e ninguém viu até o documento estar impresso.',
    },
    {
      id: 'ES2-M1-Q3', type: 'multiple_choice',
      prompt: 'Por que o sumário de um documento formatado à mão sai vazio?',
      data: { options: [
        { id: 'a', text: 'Ele procura estilo de título, e não acha nenhum.', correct: true },
        { id: 'b', text: 'O documento é curto demais para gerar sumário.', porque: 'Não há tamanho mínimo. Um documento de duas páginas com dois títulos marcados gera sumário com duas entradas.' },
        { id: 'c', text: 'O sumário precisa ser escrito antes de ser gerado.', porque: 'Ele é gerado justamente para não ser escrito. Escrevê-lo à mão devolve a tarefa de mantê-lo em dia.' },
        { id: 'd', text: 'Faltou numerar as páginas antes.', porque: 'A numeração entra no sumário depois, e a falta dela não impediria as entradas de aparecer.' },
      ]},
      explanation: 'E o pior é que não há erro nenhum na tela: aparece uma caixa sem nada dentro, e quem não sabe do estilo conclui que o recurso não funciona.',
    },
    {
      id: 'ES2-M1-Q4', type: 'true_false',
      prompt: 'Modificar um estilo que já existe é melhor do que criar um estilo novo com o mesmo efeito.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'O sumário, a legenda e o navegador de documento procuram os nomes de fábrica. Um estilo novo chamado Meu Título não é encontrado por nenhum deles.' },
      ]},
      explanation: 'Criar estilo novo é legítimo quando o documento precisa de uma coisa que não existe. Para deixar Título 1 azul, não: modifica-se o Título 1.',
    },
    {
      id: 'ES2-M1-Q5', type: 'scenario',
      prompt: 'Você aplicou Título 1 a oito parágrafos. Agora mudou a cor de Título 1 na galeria. O que acontece?',
      data: { scenarios: [
        { id: 'a', text: 'Os oito mudam de cor de uma vez.', correct: true },
        { id: 'b', text: 'Só os parágrafos escritos depois da mudança ficam na cor nova.', porque: 'O estilo não é um carimbo dado no momento da aplicação: o parágrafo aponta para ele, e lê a definição atual.' },
        { id: 'c', text: 'Nada muda até o documento ser reaberto.', porque: 'A mudança aparece na hora. É justamente essa resposta imediata que faz a demonstração do requisito 8 durar três segundos.' },
        { id: 'd', text: 'Muda apenas o parágrafo em que o cursor está.', porque: 'Isso seria formatação direta. Modificar o estilo alcança todo parágrafo que o usa.' },
      ]},
      explanation: 'É esta a demonstração que o requisito 8 pede: uma mudança, e o documento inteiro acompanha.',
    },
    {
      id: 'ES2-M1-Q6', type: 'matching',
      prompt: 'Ligue cada situação ao que ela pede.',
      data: { pairs: [
        { left: 'Oito títulos de seção', right: 'Estilo de título' },
        { left: 'Uma palavra em destaque no meio da frase', right: 'Formatação direta ou estilo de caractere' },
        { left: 'O texto de todo o corpo do documento', right: 'Estilo Normal, modificado' },
        { left: 'O nome de uma foto, embaixo dela', right: 'Estilo Legenda' },
      ]},
      explanation: 'A pergunta que decide é sempre a mesma: isto vai se repetir? Se sim, é estilo. Se é uma vez só, direta resolve.',
    },
    {
      id: 'ES2-M1-Q7', type: 'multiple_choice',
      prompt: 'Um documento formatado inteiramente à mão abre devagar e trava ao rolar. Qual é a explicação mais provável?',
      data: { options: [
        { id: 'a', text: 'São milhares de instruções guardadas uma a uma.', correct: true },
        { id: 'b', text: 'O arquivo está corrompido e precisa ser recuperado.', porque: 'Arquivo corrompido não abre devagar: ele não abre, ou abre com o conteúdo embaralhado.' },
        { id: 'c', text: 'Faltam estilos, e o editor tem de inventar um para cada parágrafo.', porque: 'Sem estilo aplicado o parágrafo fica no Normal. O editor não inventa nada.' },
        { id: 'd', text: 'O documento tem imagens demais.', porque: 'Imagem pesa, mas o sintoma aqui é de formatação: um documento só de texto e sem estilo fica lento do mesmo jeito.' },
      ]},
      explanation: 'É o terceiro problema da formatação direta, e o que aparece sozinho. Os dois que o requisito 3 cobra são a manutenção e o sumário.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 2 — A linha, o parágrafo e a letra
     ────────────────────────────────────────────────────────────────────── */
  'm2-teoria': [
    {
      id: 'ES2-M2-Q1', type: 'multiple_choice',
      prompt: 'O que define onde um parágrafo termina?',
      data: { options: [
        { id: 'a', text: 'O Enter.', correct: true },
        { id: 'b', text: 'A margem direita da página.', porque: 'Ali a linha quebra sozinha e o parágrafo continua. Essa quebra muda quando a margem muda.' },
        { id: 'c', text: 'O ponto final.', porque: 'Um parágrafo pode ter vários pontos finais, e pode não ter nenhum.' },
        { id: 'd', text: 'O número de linhas que ele tem.', porque: 'Parágrafo de uma linha e de dez são os dois parágrafos. O tamanho não define nada.' },
      ]},
      explanation: 'E é por isso que aplicar um estilo com o cursor no meio da frase funciona: o editor sabe onde o Enter anterior e o próximo estão.',
    },
    {
      id: 'ES2-M2-Q2', type: 'scenario',
      prompt: 'Um endereço de três linhas foi escrito com três Enters, e as linhas ficaram afastadas umas das outras. Por quê?',
      data: { scenarios: [
        { id: 'a', text: 'São três parágrafos, e cada um traz o próprio vão.', correct: true },
        { id: 'b', text: 'O espaçamento entre linhas está alto demais.', porque: 'Esse espaçamento vale dentro do parágrafo, e ele afastaria as linhas de um texto corrido também. O vão aqui aparece só entre as três.' },
        { id: 'c', text: 'A fonte escolhida é alta.', porque: 'A altura da fonte afasta todas as linhas por igual, e não abre vãos só nos três lugares em que houve Enter.' },
        { id: 'd', text: 'Faltou justificar o parágrafo.', porque: 'Justificar mexe no alinhamento horizontal. O que está sobrando aqui é espaço vertical.' },
      ]},
      explanation: 'Escrito com duas quebras de linha, o endereço vira um parágrafo só, com as três linhas coladas como devem ficar.',
    },
    {
      id: 'ES2-M2-Q3', type: 'true_false',
      prompt: 'Shift+Enter e Enter fazem a mesma coisa, e a diferença é só de costume.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O Enter fecha o parágrafo; o Shift+Enter desce uma linha dentro dele. Espaçamento, recuo e estilo se comportam de modos diferentes nos dois casos.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'As duas são invisíveis com as marcas de formatação desligadas, e é por isso que o documento erra calado.',
    },
    {
      id: 'ES2-M2-Q4', type: 'multiple_choice',
      prompt: 'Qual é o jeito certo de empurrar um texto para a página seguinte?',
      data: { options: [
        { id: 'a', text: 'Inserir uma quebra de página.', correct: true },
        { id: 'b', text: 'Apertar Enter até o texto passar.', porque: 'Funciona hoje e desarruma amanhã: basta alguém acrescentar ou tirar uma frase acima para o empurrão ir parar no lugar errado.' },
        { id: 'c', text: 'Aumentar a margem inferior da página.', porque: 'Isso muda a página inteira, e todas as outras junto. O que se quer é uma quebra num ponto só.' },
        { id: 'd', text: 'Diminuir o tamanho da fonte do parágrafo anterior.', porque: 'Isso mexe na aparência do texto para resolver um problema de posição, e a posição volta a mudar na primeira edição.' },
      ]},
      explanation: 'A quebra de página é uma marca no texto, e ela acompanha o parágrafo para onde ele for.',
    },
    {
      id: 'ES2-M2-Q5', type: 'matching',
      prompt: 'Ligue cada fonte ao grupo dela.',
      data: { pairs: [
        { left: 'Times New Roman', right: 'Serifada' },
        { left: 'Arial', right: 'Sem serifa' },
        { left: 'Georgia', right: 'Serifada' },
        { left: 'Calibri', right: 'Sem serifa' },
      ]},
      explanation: 'A serifa é o tracinho nas pontas das letras. Uma vez que você a enxerga, não desenxerga mais.',
    },
    {
      id: 'ES2-M2-Q6', type: 'scenario',
      prompt: 'O clube vai projetar um aviso no telão do salão. Que tipo de fonte serve melhor, e por quê?',
      data: { scenarios: [
        { id: 'a', text: 'Sem serifa: os traços somem à distância.', correct: true },
        { id: 'b', text: 'Serifada, porque ela é mais fácil de ler.', porque: 'A vantagem da serifa é em texto longo impresso, guiando o olho pela linha. Num aviso projetado não há linha longa para guiar.' },
        { id: 'c', text: 'Tanto faz, porque o que decide é o tamanho.', porque: 'O tamanho ajuda, mas não resolve: a serifa pequena vira borrão quando o projetor não tem resolução para ela.' },
        { id: 'd', text: 'Uma fonte decorativa, para chamar atenção.', porque: 'Fonte decorativa chama atenção para ela mesma. Aviso projetado se lê em segundos, e precisa de letra que não peça esforço.' },
      ]},
      explanation: 'Quem decide a fonte não é o gosto de quem escreve: é onde o texto vai ser lido.',
    },
    {
      id: 'ES2-M2-Q7', type: 'true_false',
      prompt: 'Um documento fica mais bonito quando usa várias fontes diferentes.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Documento com cinco fontes não parece rico, parece remendado. Uma para título e uma para corpo bastam.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Duas é o teto prático. A variedade que um documento precisa vem do tamanho e do peso, e não de trocar de família.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 3 — O que entra no meio do texto
     ────────────────────────────────────────────────────────────────────── */
  'm3-teoria': [
    {
      id: 'ES2-M3-Q1', type: 'multiple_choice',
      prompt: 'Para que serve uma tabela num documento de texto?',
      data: { options: [
        { id: 'a', text: 'Para dado que tem linha e coluna de verdade.', correct: true },
        { id: 'b', text: 'Para alinhar duas coisas lado a lado na página.', porque: 'Tabela invisível usada como régua desalinha quando o texto muda de tamanho ou o documento abre em outro computador.' },
        { id: 'c', text: 'Para separar seções do documento.', porque: 'Quem separa seção é o título, e é ele que o sumário procura. Tabela ali não é lida como estrutura por nada.' },
        { id: 'd', text: 'Para deixar um trecho com moldura.', porque: 'Moldura é borda de parágrafo ou caixa de texto. Usar tabela para isso acrescenta uma estrutura que o documento vai ter de carregar.' },
      ]},
      explanation: 'A pergunta que decide: se você tirasse as bordas, os dados ainda seriam colunas? Se sim, é tabela.',
    },
    {
      id: 'ES2-M3-Q2', type: 'scenario',
      prompt: 'Você selecionou a última linha de uma tabela e apertou Delete. O conteúdo sumiu, mas a linha continua lá. Por quê?',
      data: { scenarios: [
        { id: 'a', text: 'Delete esvazia; remover a linha é outro comando.', correct: true },
        { id: 'b', text: 'A linha precisa estar vazia antes de ser removida.', porque: 'Não precisa. O comando Excluir Linhas tira a linha com o que houver dentro dela.' },
        { id: 'c', text: 'A última linha de uma tabela não pode ser removida.', porque: 'Pode. O que não dá é ficar com uma tabela de zero linhas, e aí o editor remove a tabela inteira.' },
        { id: 'd', text: 'A tabela está protegida contra alterações de estrutura.', porque: 'Não há proteção ligada por padrão. Se houvesse, o Delete também teria sido recusado.' },
      ]},
      explanation: 'É a confusão que mais aparece: o conteúdo saiu, a estrutura ficou, e a linha vazia continua ocupando espaço na página.',
    },
    {
      id: 'ES2-M3-Q3', type: 'multiple_choice',
      prompt: 'Uma tabela longa atravessa duas páginas, e a segunda página aparece sem os títulos de coluna. O que resolve?',
      data: { options: [
        { id: 'a', text: 'Marcar a primeira linha como linha de cabeçalho da tabela.', correct: true },
        { id: 'b', text: 'Copiar a primeira linha e colá-la no alto da segunda página.', porque: 'Funciona até a tabela crescer ou encolher, e aí a cópia fica no meio da página errada. É a mesma armadilha dos Enters para empurrar texto.' },
        { id: 'c', text: 'Diminuir a fonte para a tabela caber numa página.', porque: 'Resolve o sintoma escondendo o problema, e para de funcionar na primeira linha nova.' },
        { id: 'd', text: 'Inserir uma quebra de página antes da tabela.', porque: 'Isso empurra a tabela inteira para a página seguinte, e ela continua atravessando duas.' },
      ]},
      explanation: 'O cabeçalho marcado se repete sozinho em cada página nova, e continua se repetindo quando a tabela cresce.',
    },
    {
      id: 'ES2-M3-Q4', type: 'scenario',
      prompt: 'Uma foto sumiu do relatório depois que alguém apagou um parágrafo, e ninguém apagou foto nenhuma. O que aconteceu?',
      data: { scenarios: [
        { id: 'a', text: 'A imagem estava ancorada nele, e foi junto.', correct: true },
        { id: 'b', text: 'A imagem estava vinculada a um arquivo que foi movido.', porque: 'Vínculo quebrado deixa um quadro com aviso no lugar. Aqui a imagem sumiu inteira, junto com o parágrafo.' },
        { id: 'c', text: 'O documento atingiu o limite de imagens.', porque: 'Não há limite desse tipo, e um limite atingido recusaria a inserção em vez de apagar o que já estava lá.' },
        { id: 'd', text: 'A imagem foi enviada para o rascunho automático.', porque: 'Não existe rascunho que recolha imagens. O salvamento automático guarda o documento inteiro, e não pedaços dele.' },
      ]},
      explanation: 'Toda imagem com disposição de texto tem uma âncora, e ela é visível quando as marcas de formatação estão ligadas.',
    },
    {
      id: 'ES2-M3-Q5', type: 'multiple_choice',
      prompt: 'Qual é a vantagem de inserir a legenda pelo recurso de legenda, em vez de digitar a linha embaixo da foto?',
      data: { options: [
        { id: 'a', text: 'O número se renumera sozinho.', correct: true },
        { id: 'b', text: 'A legenda digitada não pode ser formatada.', porque: 'Pode, e é justamente o que se faz: alguém formata à mão e o resultado fica parecido. O que falta é a renumeração.' },
        { id: 'c', text: 'A legenda inserida fica presa à foto e se move com ela.', porque: 'A legenda também pode ser ancorada, mas isso vale para as duas. O que só a inserida tem é o campo de numeração.' },
        { id: 'd', text: 'A legenda digitada não aparece na impressão.', porque: 'Aparece: ela é texto comum do documento. O que ela não é é um campo que o editor saiba recalcular.' },
      ]},
      explanation: 'Acrescente uma figura entre a 1 e a 2, e as outras todas avançam sozinhas. Escrito à mão, a 3 vira 4 e ninguém corrige a 5, a 6 e a 7.',
    },
    {
      id: 'ES2-M3-Q6', type: 'true_false',
      prompt: 'Para redimensionar uma imagem sem achatá-la, arrasta-se pelo canto, e não pelo meio da borda.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'O meio da borda estica só numa direção, e é assim que as pessoas da foto ficam magras ou gordas. O canto mantém a proporção.' },
      ]},
      explanation: 'É o defeito que mais aparece em documento de clube, e o único que quem fez não enxerga, porque ele viu a foto crescer aos poucos.',
    },
    {
      id: 'ES2-M3-Q7', type: 'matching',
      prompt: 'Ligue cada disposição do texto ao que ela faz.',
      data: { pairs: [
        { left: 'Alinhada com o texto', right: 'A imagem se comporta como uma letra enorme' },
        { left: 'Quadrada', right: 'O texto contorna a caixa da imagem' },
        { left: 'Atrás do texto', right: 'O texto passa por cima da imagem' },
        { left: 'Acima e abaixo', right: 'A imagem fica sozinha na largura da página' },
      ]},
      explanation: 'A imagem nasce alinhada com o texto, que quase nunca é o que se quer. Escolher a disposição é o primeiro gesto depois de inserir.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 4 — O que se repete em toda página
     ────────────────────────────────────────────────────────────────────── */
  'm4-teoria': [
    {
      id: 'ES2-M4-Q1', type: 'multiple_choice',
      prompt: 'O que acontece com o texto escrito no cabeçalho?',
      data: { options: [
        { id: 'a', text: 'Ele aparece no alto de todas as páginas.', correct: true },
        { id: 'b', text: 'Ele aparece só na primeira página.', porque: 'Isso é o que a opção de primeira página diferente faz, e ela vem desligada. Sem marcá-la, o cabeçalho se repete em todas.' },
        { id: 'c', text: 'Ele entra no corpo do documento, no alto.', porque: 'Cabeçalho é uma área à parte, acima da margem. O cursor nem chega nele digitando.' },
        { id: 'd', text: 'Ele aparece na tela e não sai na impressão.', porque: 'Sai, e é justamente para isso que ele existe: o nome do clube em toda folha do documento impresso.' },
      ]},
      explanation: 'Escrever o nome do clube no alto da primeira página, dentro do corpo, parece a mesma coisa e não é: ele não se repete, e sai do lugar quando o texto acima cresce.',
    },
    {
      id: 'ES2-M4-Q2', type: 'scenario',
      prompt: 'Um relatório impresso tem o número 3 no pé de todas as páginas, da primeira à última. O que aconteceu?',
      data: { scenarios: [
        { id: 'a', text: 'O número foi digitado, e não inserido como campo.', correct: true },
        { id: 'b', text: 'A numeração foi configurada para começar no 3.', porque: 'Começar no 3 faria a página seguinte ser a 4. Um número que não muda não está sendo calculado.' },
        { id: 'c', text: 'O documento tem três seções, e cada uma numera do próprio jeito.', porque: 'Seções com numeração própria mostrariam números diferentes em cada bloco, e não o mesmo em todas.' },
        { id: 'd', text: 'O sumário sobrescreveu a numeração do rodapé.', porque: 'O sumário lê a numeração; ele não a escreve, e não alcança o rodapé.' },
      ]},
      explanation: 'Se o número não muda de página para página, ele foi digitado. O que o editor calcula, ele recalcula.',
    },
    {
      id: 'ES2-M4-Q3', type: 'ordering',
      prompt: 'Ordene os passos para montar as páginas de um relatório com capa.',
      data: { items: [
        { id: 'a', text: 'Marcar os títulos das seções com os estilos de título', order: 1 },
        { id: 'b', text: 'Inserir cabeçalho e rodapé', order: 2 },
        { id: 'c', text: 'Marcar a primeira página como diferente, para a capa ficar limpa', order: 3 },
        { id: 'd', text: 'Inserir o número de página no rodapé', order: 4 },
        { id: 'e', text: 'Gerar o sumário e atualizá-lo antes de entregar', order: 5 },
      ]},
      explanation: 'O sumário fica por último porque ele lê o que já existe: gerado antes dos títulos, ele sai vazio; gerado antes da numeração, ele aponta para páginas que ainda vão mudar.',
    },
    {
      id: 'ES2-M4-Q4', type: 'multiple_choice',
      prompt: 'De onde o sumário tira as entradas?',
      data: { options: [
        { id: 'a', text: 'Dos parágrafos marcados com os estilos de título.', correct: true },
        { id: 'b', text: 'Dos parágrafos em negrito e tamanho maior.', porque: 'A aparência não diz nada ao editor. Um texto grande e em negrito continua sendo, para ele, um parágrafo comum.' },
        { id: 'c', text: 'Das quebras de página do documento.', porque: 'Quebra de página separa folhas, e não seções. Um documento sem nenhuma pode ter dez seções.' },
        { id: 'd', text: 'Do que estiver escrito no cabeçalho de cada página.', porque: 'O cabeçalho se repete igual em todas, e não teria como render entradas diferentes.' },
      ]},
      explanation: 'Título 1 vira entrada de primeiro nível, Título 2 de segundo. É a mesma marcação que faz o requisito 8 funcionar.',
    },
    {
      id: 'ES2-M4-Q5', type: 'scenario',
      prompt: 'Um relatório foi entregue com o sumário mostrando um título que já tinha sido corrigido no corpo. O que faltou?',
      data: { scenarios: [
        { id: 'a', text: 'Atualizar o sumário depois da correção.', correct: true },
        { id: 'b', text: 'Aplicar o estilo de título ao parágrafo corrigido.', porque: 'Se o estilo tivesse saído, a entrada teria desaparecido do sumário. Ela ficou, com o texto velho.' },
        { id: 'c', text: 'Salvar o documento antes de exportar.', porque: 'Salvar guarda o que está na tela, inclusive o sumário velho. O que envelheceu não se resolve salvando.' },
        { id: 'd', text: 'Gerar o sumário de novo em outro lugar do documento.', porque: 'Isso daria dois sumários, e o velho continuaria lá. Existe um botão que atualiza o que já está montado.' },
      ]},
      explanation: 'O sumário guarda o que leu, como o PDF congela o que existir na hora. Um sumário desatualizado é pior do que nenhum, porque quem lê confia nele.',
    },
    {
      id: 'ES2-M4-Q6', type: 'true_false',
      prompt: 'A capa de um relatório costuma não levar cabeçalho nem número de página.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'É a convenção de todo impresso, e o editor tem uma caixa própria para isso — primeira página diferente. Sem ela, a saída seria pôr a capa num arquivo separado.' },
      ]},
      explanation: 'Ela continua contando no total, porque quem recebe um documento de nove folhas precisa saber que recebeu as nove.',
    },
    {
      id: 'ES2-M4-Q7', type: 'matching',
      prompt: 'Ligue cada elemento ao lugar em que ele mora.',
      data: { pairs: [
        { left: 'Nome do clube, repetido em toda folha', right: 'Cabeçalho' },
        { left: 'Número da página', right: 'Rodapé, como campo' },
        { left: 'Lista das seções com as páginas', right: 'Sumário, gerado dos estilos' },
        { left: 'Identificação da foto', right: 'Legenda, abaixo dela' },
      ]},
      explanation: 'Três dos quatro são calculados pelo editor, e é por isso que eles se mantêm em dia sozinhos — desde que alguém mande atualizar.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 5 — Revisar com outra pessoa
     ────────────────────────────────────────────────────────────────────── */
  'm5-teoria': [
    {
      id: 'ES2-M5-Q1', type: 'multiple_choice',
      prompt: 'O que muda no documento quando o controle de alterações está ligado?',
      data: { options: [
        { id: 'a', text: 'Toda edição fica marcada até alguém decidir sobre ela.', correct: true },
        { id: 'b', text: 'O documento fica somente leitura para quem não é o dono.', porque: 'Todo mundo continua editando. O que muda é que as edições ficam visíveis em vez de silenciosas.' },
        { id: 'c', text: 'O editor guarda uma cópia do documento a cada edição.', porque: 'Isso é histórico de versões, e é outro recurso. O controle de alterações marca dentro do mesmo arquivo.' },
        { id: 'd', text: 'As edições ficam guardadas e só valem depois que o documento for salvo.', porque: 'Salvar não aceita marca nenhuma. Quem decide o que entra é quem percorre as alterações uma a uma.' },
      ]},
      explanation: 'É o que permite mandar um documento para revisar sem perder o que estava escrito.',
    },
    {
      id: 'ES2-M5-Q2', type: 'scenario',
      prompt: 'A liderança devolveu o relatório e ele parece limpo, sem marca nenhuma. Ao abrir no computador do clube, ele aparece cheio de riscos coloridos. O que houve?',
      data: { scenarios: [
        { id: 'a', text: 'As alterações estavam apenas escondidas, e não aceitas.', correct: true },
        { id: 'b', text: 'O documento foi corrompido na transferência.', porque: 'Corrupção não produz marcas de revisão organizadas, com nome e cor por pessoa.' },
        { id: 'c', text: 'O computador do clube tem uma versão mais antiga do programa.', porque: 'Versão antiga pode desenhar as marcas de outro jeito, mas não as cria do nada.' },
        { id: 'd', text: 'Alguém ligou o controle de alterações ao abrir.', porque: 'Ligar o controle marca o que vier a partir dali. As marcas que já apareceram na abertura são de edições anteriores.' },
      ]},
      explanation: 'Sem Marcações apenas esconde. As alterações continuam no arquivo, e reaparecem para quem abrir depois — inclusive para o examinador.',
    },
    {
      id: 'ES2-M5-Q3', type: 'multiple_choice',
      prompt: 'Quando se usa comentário em vez de alterar o texto?',
      data: { options: [
        { id: 'a', text: 'Quando a observação é pergunta, e não correção.', correct: true },
        { id: 'b', text: 'Quando a correção é pequena demais para valer a pena.', porque: 'Correção pequena é justamente a que se faz direto, com o controle ligado. Comentário para isso obriga a outra pessoa a digitar de novo.' },
        { id: 'c', text: 'Quando o documento está protegido contra edição.', porque: 'Documento protegido de verdade recusa o comentário também, a menos que alguém o libere só para isso.' },
        { id: 'd', text: 'Quando a alteração precisa aparecer na impressão.', porque: 'É o contrário: o comentário fica na margem e não sai na impressão comum.' },
      ]},
      explanation: 'Um pergunta, o outro muda. Escrever a correção dentro do comentário é dar trabalho duas vezes.',
    },
    {
      id: 'ES2-M5-Q4', type: 'scenario',
      prompt: 'Você mandou substituir ana por Ana em todo o documento, sem marcar nenhuma opção. O texto ficou cheio de palavras estranhas. O que aconteceu?',
      data: { scenarios: [
        { id: 'a', text: 'A troca alcançou o miolo de outras palavras.', correct: true },
        { id: 'b', text: 'A troca foi aplicada duas vezes.', porque: 'Substituir Tudo percorre o documento uma vez. Aplicar de novo não mudaria mais nada, porque ana já teria virado Ana.' },
        { id: 'c', text: 'O editor trocou também as maiúsculas que já estavam certas.', porque: 'Ana já escrito assim casaria e seria trocado por Ana, sem diferença visível. O estrago está dentro de outras palavras.' },
        { id: 'd', text: 'A fonte do documento não tem os caracteres da substituição.', porque: 'Fonte sem o caractere mostra um quadrado no lugar, e não palavras remontadas.' },
      ]},
      explanation: 'Palavras inteiras e diferenciar maiúsculas de minúsculas são as duas caixas que quase ninguém marca, e são elas que separam a correção do estrago.',
    },
    {
      id: 'ES2-M5-Q5', type: 'ordering',
      prompt: 'Ordene o caminho de um relatório que vai ser revisado pela liderança.',
      data: { items: [
        { id: 'a', text: 'Ligar o controle de alterações antes de mandar', order: 1 },
        { id: 'b', text: 'A liderança edita, e as mudanças ficam marcadas', order: 2 },
        { id: 'c', text: 'A liderança escreve as dúvidas como comentário', order: 3 },
        { id: 'd', text: 'Quem escreveu percorre as marcas e aceita ou rejeita cada uma', order: 4 },
        { id: 'e', text: 'Os comentários resolvidos são marcados ou excluídos', order: 5 },
      ]},
      explanation: 'O documento só está pronto quando não há marca nem comentário aberto. Entregar com eles é entregar a conversa junto com o texto.',
    },
    {
      id: 'ES2-M5-Q6', type: 'true_false',
      prompt: 'Ctrl+Z desfaz um Substituir Tudo inteiro, e não uma troca de cada vez.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'O editor trata a substituição inteira como uma ação só. É por isso que ela é a primeira coisa a desfazer quando o documento fica estranho.' },
      ]},
      explanation: 'Mas ele só alcança enquanto o documento não foi fechado. Depois disso, o que vale é a cópia de segurança da CC-ES001.',
    },
    {
      id: 'ES2-M5-Q7', type: 'matching',
      prompt: 'Ligue cada recurso de revisão ao que ele resolve.',
      data: { pairs: [
        { left: 'Controle de alterações', right: 'Ver o que foi mudado, e decidir depois' },
        { left: 'Comentário', right: 'Perguntar sem mexer no texto' },
        { left: 'Localizar e substituir', right: 'Trocar a mesma coisa em todo o documento' },
        { left: 'Aceitar todas as alterações', right: 'Fechar a revisão e deixar o texto limpo' },
      ]},
      explanation: 'Os três primeiros são de quem revisa; o último é de quem entrega, e é o que separa um documento pronto de um documento em conversa.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 6 — Entregar
     ────────────────────────────────────────────────────────────────────── */
  'm6-teoria': [
    {
      id: 'ES2-M6-Q1', type: 'multiple_choice',
      prompt: 'Por que um PDF abre igual em qualquer computador?',
      data: { options: [
        { id: 'a', text: 'Porque as fontes e as medidas vão dentro dele.', correct: true },
        { id: 'b', text: 'Porque ele é uma imagem da página.', porque: 'Não é: o texto continua dentro dele, e por isso dá para copiar e procurar palavra num PDF.' },
        { id: 'c', text: 'Porque o leitor de PDF baixa as fontes que faltarem.', porque: 'Nada é baixado. O arquivo teria de estar online, e o PDF abre igual sem nenhuma conexão.' },
        { id: 'd', text: 'Porque ele usa apenas fontes que existem em todo computador.', porque: 'Ele aceita qualquer fonte, inclusive uma que só você tem, justamente porque ela vai dentro do arquivo.' },
      ]},
      explanation: 'Portátil é a palavra que importa no nome: ele carrega junto tudo o que precisa para se desenhar.',
    },
    {
      id: 'ES2-M6-Q2', type: 'scenario',
      prompt: 'Um documento aberto no computador do clube saiu com a quebra de página em outro lugar, e o título pulou sozinho para a folha seguinte. Por quê?',
      data: { scenarios: [
        { id: 'a', text: 'A fonte não existe ali, e a substituta mede outro tanto.', correct: true },
        { id: 'b', text: 'O arquivo foi salvo numa versão diferente do programa.', porque: 'Versão diferente pode mudar recursos, mas não é o que reposiciona o texto por conta própria. O que mede a página é a fonte.' },
        { id: 'c', text: 'O documento foi convertido para PDF e voltou.', porque: 'PDF não volta sozinho para editável. E se voltasse, a quebra teria ficado congelada onde estava.' },
        { id: 'd', text: 'As margens do documento mudaram ao abrir.', porque: 'Margem é gravada no documento, e não é recalculada na abertura.' },
      ]},
      explanation: 'O arquivo editável guarda instruções e monta a página na hora de abrir, com o que a máquina tiver. É por isso que a entrega leva um PDF junto.',
    },
    {
      id: 'ES2-M6-Q3', type: 'ordering',
      prompt: 'Ordene a entrega de um relatório do clube.',
      data: { items: [
        { id: 'a', text: 'Terminar o texto', order: 1 },
        { id: 'b', text: 'Aceitar ou rejeitar as alterações marcadas', order: 2 },
        { id: 'c', text: 'Atualizar o sumário', order: 3 },
        { id: 'd', text: 'Exportar em PDF', order: 4 },
        { id: 'e', text: 'Guardar o editável junto, com o mesmo nome e a mesma versão', order: 5 },
      ]},
      explanation: 'Cada passo fora de ordem produz um documento que parece pronto: PDF exportado antes do sumário sai com um sumário velho, e antes das alterações sai com riscos coloridos.',
    },
    {
      id: 'ES2-M6-Q4', type: 'scenario',
      prompt: 'O PDF entregue está sem as duas últimas páginas, e o documento editável está completo. O que aconteceu?',
      data: { scenarios: [
        { id: 'a', text: 'Ele foi exportado antes de elas existirem.', correct: true },
        { id: 'b', text: 'A exportação foi interrompida no meio.', porque: 'Exportação interrompida não gera arquivo, ou gera um que não abre. Este abre, com o conteúdo de um momento anterior.' },
        { id: 'c', text: 'O PDF tem limite de páginas.', porque: 'Não há limite prático. PDFs de centenas de páginas são comuns.' },
        { id: 'd', text: 'As duas páginas ficaram fora da área de impressão.', porque: 'Área de impressão corta margem, e não páginas inteiras. As duas simplesmente não existiam quando o arquivo foi gerado.' },
      ]},
      explanation: 'O PDF congela o que existir na hora, como o sumário guarda o que leu. Exportar cedo e continuar mexendo é o que se faz sem pensar.',
    },
    {
      id: 'ES2-M6-Q5', type: 'multiple_choice',
      prompt: 'Um erro foi encontrado no PDF já entregue. Qual é o caminho certo?',
      data: { options: [
        { id: 'a', text: 'Corrigir o editável e exportar de novo.', correct: true },
        { id: 'b', text: 'Corrigir direto no PDF, com um editor de PDF.', porque: 'Isso deixa dois documentos diferentes, e o editável — que é o que vai ser usado no ano que vem — fica sendo o errado.' },
        { id: 'c', text: 'Entregar uma errata junto do PDF.', porque: 'Errata é para o que já foi impresso e distribuído. Enquanto o arquivo pode ser regerado, regerar é mais barato e mais limpo.' },
        { id: 'd', text: 'Refazer o relatório do zero para garantir.', porque: 'Refazer perde o trabalho todo por causa de um erro, e o relatório novo terá erros novos.' },
      ]},
      explanation: 'O PDF é derivado: ele é sempre o retrato do editável. Consertar o retrato e deixar o original errado é como renomear um arquivo achando que converteu.',
    },
    {
      id: 'ES2-M6-Q6', type: 'true_false',
      prompt: 'Um PDF impede que o texto dentro dele seja copiado.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O texto continua dentro do arquivo: dá para copiar, procurar palavra e até editar com o programa certo. Ele congela a aparência, e não o conteúdo.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Existe proteção por senha, e ela é outra coisa — e continua sendo fraca contra quem quer mesmo. PDF não é cofre.',
    },
    {
      id: 'ES2-M6-Q7', type: 'multiple_choice',
      prompt: 'Por que a entrega do requisito 7 pede os dois formatos, e não só o PDF?',
      data: { options: [
        { id: 'a', text: 'Porque a próxima diretoria vai partir do editável.', correct: true },
        { id: 'b', text: 'Porque o PDF pode se corromper com o tempo.', porque: 'Ele não se deteriora sozinho. O problema não é durabilidade, é o que dá para fazer com ele depois.' },
        { id: 'c', text: 'Porque o examinador precisa conferir se o documento foi mesmo escrito por você.', porque: 'Nenhum dos dois formatos prova autoria, e não é isso que o requisito pede.' },
        { id: 'd', text: 'Porque o PDF não pode ser impresso em algumas impressoras.', porque: 'É quase o contrário: ele é o formato que imprime igual em qualquer impressora.' },
      ]},
      explanation: 'Sem o editável, o clube fica com um retrato bonito de um trabalho que vai ter de ser refeito do zero.',
    },
  ],
};
