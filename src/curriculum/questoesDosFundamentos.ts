import type { Question } from '../types';

/*
 * As questões das lições de teoria da CC-DG001 Fundamentos Visuais.
 *
 * ── O que elas medem ──────────────────────────────────────────────────────
 * A definição vale uma vez por lição; o resto é consequência e diagnóstico,
 * porque a matéria inteira é feita de peças que **funcionam** — o cartaz com
 * toda a informação certa e nenhuma ordem, a linha a sete pixels das outras, o
 * cinza que parece quase igual e não passa no medidor.
 *
 * Toda alternativa errada diz por que está errada, no campo porque, e a certa
 * não carrega motivo nenhum: o porquê tem lugar próprio, o explanation. A
 * certa é uma afirmação curta, pela razão escrita na CC-ES012 — o hábito de
 * pôr o porquê dentro dela entrega a resposta pelo tamanho. E nada de crase
 * nem de asterisco: a questão vai para o QuestionRenderer, que imprime texto
 * puro.
 *
 * Os números de contraste citados são os do mesmo motor que mede a peça, e
 * `exemplosDosFundamentos.test.ts` os confere.
 */

export const QUESTOES_DOS_FUNDAMENTOS: Record<string, Question[]> = {
  /* ── Módulo 1 — hierarquia (requisito 1.1) ───────────────────────────── */
  'm1-teoria': [
    {
      id: 'DG1-M1-Q1', type: 'multiple_choice',
      prompt: 'O que é hierarquia visual?',
      data: { options: [
        { id: 'a', text: 'A ordem em que a peça é lida.', correct: true },
        { id: 'b', text: 'A quantidade de cores usadas.', porque: 'Cor pode ajudar a criar ordem, mas contar cores não diz nada sobre ela.' },
        { id: 'c', text: 'O tamanho da folha impressa.', porque: 'A folha é o suporte; a hierarquia é o que acontece dentro dela.' },
        { id: 'd', text: 'A posição do logotipo do clube.', porque: 'O logotipo é um elemento entre outros, e não a ordem entre eles.' },
      ]},
      explanation: 'Hierarquia é decidir de propósito o que se lê primeiro, o que vem depois, e o que fica por último.',
    },
    {
      id: 'DG1-M1-Q2', type: 'multiple_choice',
      prompt: 'Um cartaz tem o título e a data no mesmo tamanho grande. Qual é o problema?',
      data: { options: [
        { id: 'a', text: 'O olho não sabe por qual começar.', correct: true },
        { id: 'b', text: 'A data fica pequena demais para ler.', porque: 'A data está grande; o problema é ela disputar com o título.' },
        { id: 'c', text: 'O cartaz passa a ter cores demais.', porque: 'Tamanho não muda a quantidade de cores da peça.' },
        { id: 'd', text: 'O texto comum fica maior que a data.', porque: 'Os dois grandes continuam maiores que o texto comum.' },
      ]},
      explanation: 'Dois títulos é o mesmo que nenhum: o título precisa ser o maior sozinho para o olho ir nele primeiro.',
    },
    {
      id: 'DG1-M1-Q3', type: 'multiple_choice',
      prompt: 'Qual destas mudanças sobe um degrau sem mudar o tamanho da letra?',
      data: { options: [
        { id: 'a', text: 'Pôr o texto em negrito.', correct: true },
        { id: 'b', text: 'Aumentar a entrelinha.', porque: 'A entrelinha muda o espaço entre linhas, e não o peso da letra.' },
        { id: 'c', text: 'Mudar a margem da folha.', porque: 'A margem é do papel, e não do degrau de um bloco.' },
        { id: 'd', text: 'Trocar a cor do fundo.', porque: 'O fundo é de todos os blocos: não sobe nenhum em relação aos outros.' },
      ]},
      explanation: 'O negrito engrossa o traço da mesma letra, e o olho o lê como mais importante sem que ele cresça.',
    },
    {
      id: 'DG1-M1-Q4', type: 'multiple_choice',
      prompt: 'Uma peça tem seis tamanhos de letra, todos parecidos: 22, 21, 20, 19, 18 e 17. O que acontece?',
      data: { options: [
        { id: 'a', text: 'Vira barulho, e não seis degraus.', correct: true },
        { id: 'b', text: 'A leitura fica mais rápida e clara.', porque: 'Tamanhos quase iguais não se separam, e o olho perde a ordem.' },
        { id: 'c', text: 'O olho lê exatamente nessa ordem.', porque: 'Um pixel de diferença o olho não percebe como degrau.' },
        { id: 'd', text: 'Nada muda: tamanho não organiza.', porque: 'Tamanho é a ferramenta mais forte de hierarquia; aqui ela foi mal usada.' },
      ]},
      explanation: 'Três ou quatro degraus o olho ordena. Seis tamanhos parecidos parecem engano, e não ordem.',
    },
    {
      id: 'DG1-M1-Q5', type: 'multiple_choice',
      prompt: 'No cartaz do acampamento, em que degrau fica o nome do clube?',
      data: { options: [
        { id: 'a', text: 'Abaixo do texto comum.', correct: true },
        { id: 'b', text: 'Acima do título.', porque: 'O título é o que faz alguém parar; a assinatura vem por último.' },
        { id: 'c', text: 'No mesmo degrau da data.', porque: 'A data é a segunda coisa que quem passa precisa saber; o nome do clube não.' },
        { id: 'd', text: 'Ao lado do título, igual.', porque: 'Seriam dois títulos disputando o primeiro olhar.' },
      ]},
      explanation: 'O nome do clube é assinatura: confirma de quem é a peça, e é lido por quem já leu o resto.',
    },
    {
      id: 'DG1-M1-Q6', type: 'true_false',
      prompt: 'Deixar tudo grande é um bom jeito de garantir que tudo seja lido.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Se tudo é grande, nada se destaca, e o olho não sabe por onde começar.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Hierarquia é diferença. Tudo no mesmo tamanho — grande ou pequeno — é a peça sem ordem.',
    },
    {
      id: 'DG1-M1-Q7', type: 'true_false',
      prompt: 'Diferença de um pixel no tamanho da letra não cria um degrau novo.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'O olho não separa 18 de 19: a régua mede, a leitura não vê.' },
      ]},
      explanation: 'Degrau é diferença que se vê de longe. Um pixel só a régua percebe.',
    },
  ],

  /* ── Módulo 2 — alinhamento e proximidade (1.3 e 1.4) ────────────────── */
  'm2-teoria': [
    {
      id: 'DG1-M2-Q1', type: 'multiple_choice',
      prompt: 'O que é alinhamento?',
      data: { options: [
        { id: 'a', text: 'Apoiar cada elemento numa linha comum.', correct: true },
        { id: 'b', text: 'Deixar todos os textos centrados.', porque: 'Centrar é um jeito de alinhar, e só se for no mesmo centro.' },
        { id: 'c', text: 'Pôr tudo do mesmo tamanho.', porque: 'Isso é sobre tamanho; alinhamento é sobre posição.' },
        { id: 'd', text: 'Usar uma só família de letras.', porque: 'Isso é escolha tipográfica, e não posição na página.' },
      ]},
      explanation: 'Alinhar é fazer cada coisa se apoiar numa linha invisível que outra coisa também usa — a borda de uma coluna, o centro da folha.',
    },
    {
      id: 'DG1-M2-Q2', type: 'multiple_choice',
      prompt: 'Sete linhas começam a 40 pixels da borda e uma começa a 47. O que acontece?',
      data: { options: [
        { id: 'a', text: 'A peça parece torta.', correct: true },
        { id: 'b', text: 'Ninguém percebe sete pixels.', porque: 'Ninguém mede, mas todo mundo percebe o degrau na coluna.' },
        { id: 'c', text: 'A linha ganha destaque.', porque: 'Recuo pequeno não destaca: parece engano.' },
        { id: 'd', text: 'A margem fica maior.', porque: 'A margem é a das outras sete; a oitava só fica fora da coluna.' },
      ]},
      explanation: 'O erro de alinhamento quase nunca é grande. É uma linha um pouco fora, que o olho vê antes de saber o que viu.',
    },
    {
      id: 'DG1-M2-Q3', type: 'multiple_choice',
      prompt: 'Seis linhas de um convite estão centradas, cada uma num centro diferente. Qual é o defeito?',
      data: { options: [
        { id: 'a', text: 'Nenhuma se apoia em nada.', correct: true },
        { id: 'b', text: 'Centralizar é sempre errado.', porque: 'Centralizar funciona, desde que todas usem o mesmo centro.' },
        { id: 'c', text: 'Faltam cores no convite.', porque: 'Cor não conserta linhas fora do eixo.' },
        { id: 'd', text: 'As letras ficam pequenas.', porque: 'O tamanho está certo ou errado à parte; o defeito aqui é de posição.' },
      ]},
      explanation: 'Seis centros diferentes é o defeito mais comum de convite feito às pressas: cada linha centrada à mão, no olho.',
    },
    {
      id: 'DG1-M2-Q4', type: 'multiple_choice',
      prompt: 'O que é proximidade?',
      data: { options: [
        { id: 'a', text: 'Agrupar pelo espaço o que vai junto.', correct: true },
        { id: 'b', text: 'Encostar tudo para caber na folha.', porque: 'Encostar tudo apaga os grupos: vira um bloco só.' },
        { id: 'c', text: 'Pôr o título perto da borda.', porque: 'Isso é sobre margem, e não sobre o que vai junto.' },
        { id: 'd', text: 'Usar cores parecidas em tudo.', porque: 'Cor parecida é repetição; proximidade é espaço.' },
      ]},
      explanation: 'O olho lê como grupo o que está perto. Dia, hora e lugar juntos viram o "quando".',
    },
    {
      id: 'DG1-M2-Q5', type: 'multiple_choice',
      prompt: 'Num aviso, o vão entre as linhas de um grupo é 6 e entre dois grupos é 8. O que falta?',
      data: { options: [
        { id: 'a', text: 'Um vão bem maior entre os grupos.', correct: true },
        { id: 'b', text: 'Diminuir o vão de dentro para zero.', porque: 'Linhas coladas se tocam; o problema é o vão entre os grupos ser pequeno.' },
        { id: 'c', text: 'Uma caixa em volta de cada grupo.', porque: 'Caixa é recurso a mais; quase sempre basta afastar os grupos.' },
        { id: 'd', text: 'Pôr cada grupo numa cor.', porque: 'A cor não separa o que o espaço juntou.' },
      ]},
      explanation: 'O vão entre grupos precisa ser pelo menos o dobro do vão de dentro. Oito contra seis o olho não separa.',
    },
    {
      id: 'DG1-M2-Q6', type: 'true_false',
      prompt: 'Espaço igual entre todas as linhas de um aviso faz o leitor ver os grupos.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Espaço igual diz que todas as linhas são uma lista só, sem grupos.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Os grupos aparecem quando o espaço entre eles é maior do que o espaço dentro deles.',
    },
    {
      id: 'DG1-M2-Q7', type: 'true_false',
      prompt: 'Centralizar todas as linhas no centro da folha também é alinhar.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'O centro da folha é uma linha comum, e é isso que alinhar pede.' },
      ]},
      explanation: 'Alinhar é usar uma linha comum. O centro da folha é uma; a borda esquerda é outra.',
    },
  ],

  /* ── Módulo 3 — repetição e espaço negativo (1.5 e 1.6) ──────────────── */
  'm3-teoria': [
    {
      id: 'DG1-M3-Q1', type: 'multiple_choice',
      prompt: 'O que é repetição, em design?',
      data: { options: [
        { id: 'a', text: 'O mesmo estilo para o mesmo papel.', correct: true },
        { id: 'b', text: 'Escrever a mesma frase duas vezes.', porque: 'Repetir o texto só ocupa espaço; o que se repete é o estilo.' },
        { id: 'c', text: 'Usar só uma cor na peça inteira.', porque: 'Uma cor só não é repetição: é falta de destaque.' },
        { id: 'd', text: 'Copiar a peça de outro clube.', porque: 'Isso é cópia de trabalho alheio, e não um princípio de composição.' },
      ]},
      explanation: 'Três cartões com o mesmo estilo dizem, sem ninguém explicar, que são três itens da mesma série.',
    },
    {
      id: 'DG1-M3-Q2', type: 'multiple_choice',
      prompt: 'Três cartões da programação têm larguras, cores e fontes diferentes. Como o olho os lê?',
      data: { options: [
        { id: 'a', text: 'Como três avisos sem relação.', correct: true },
        { id: 'b', text: 'Como uma série bem organizada.', porque: 'Série se reconhece pelo que se repete, e aqui nada se repete.' },
        { id: 'c', text: 'Como um cartão só, maior.', porque: 'Diferentes, eles se separam ainda mais.' },
        { id: 'd', text: 'Na ordem do mais colorido.', porque: 'A cor não ordena itens que deviam ser iguais.' },
      ]},
      explanation: 'Sem repetição, o olho não reconhece os cartões como uma programação: cada um parece outra coisa.',
    },
    {
      id: 'DG1-M3-Q3', type: 'multiple_choice',
      prompt: 'Qual comando do editor faz o estilo de um título valer para os outros dois?',
      data: { options: [
        { id: 'a', text: 'Copiar estilo e Colar estilo.', correct: true },
        { id: 'b', text: 'Duplicar prancha.', porque: 'Duplicar faz uma cópia da peça inteira, e não iguala os títulos.' },
        { id: 'c', text: 'Alinhar à esquerda.', porque: 'Alinhar muda a posição, e não o estilo.' },
        { id: 'd', text: 'Prova de impressão.', porque: 'A prova mostra a cor no papel; não muda nenhum estilo.' },
      ]},
      explanation: 'Acertar um e colar nos outros garante que sejam iguais de verdade — e não um 16 e um 17 que ninguém percebe.',
    },
    {
      id: 'DG1-M3-Q4', type: 'multiple_choice',
      prompt: 'O que é espaço negativo?',
      data: { options: [
        { id: 'a', text: 'O espaço vazio entre as coisas.', correct: true },
        { id: 'b', text: 'Uma área pintada de preto.', porque: 'Negativo aqui quer dizer vazio, e não escuro.' },
        { id: 'c', text: 'O que sobra fora da folha.', porque: 'Fora da folha não aparece; o espaço negativo está dentro dela.' },
        { id: 'd', text: 'O erro de deixar algo vazio.', porque: 'O vazio está trabalhando: separa e dá descanso ao olho.' },
      ]},
      explanation: 'Margem, vão entre cartões, respiro entre texto e borda: é o vazio que deixa o resto ser lido.',
    },
    {
      id: 'DG1-M3-Q5', type: 'multiple_choice',
      prompt: 'Por que não encostar o título na borda da folha que vai ser impressa?',
      data: { options: [
        { id: 'a', text: 'O corte da gráfica pode cortá-lo.', correct: true },
        { id: 'b', text: 'A tinta não chega perto da borda.', porque: 'A tinta chega; quem não acerta o milímetro é a guilhotina.' },
        { id: 'c', text: 'O título encolhe ao imprimir.', porque: 'O tamanho não muda; a posição na borda é que é arriscada.' },
        { id: 'd', text: 'A impressora vira a folha.', porque: 'A folha sai do jeito que foi montada.' },
      ]},
      explanation: 'Mesmo sem corte, o título colado na borda parece cortado. Uma margem de 5% da largura resolve.',
    },
    {
      id: 'DG1-M3-Q6', type: 'true_false',
      prompt: 'Se a peça não cabe com margem, o certo é tirar a margem.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O que sobra é conteúdo: a margem é parte do que faz a peça se ler.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Quando não cabe, a peça tem conteúdo demais para o tamanho dela. Corta-se o conteúdo, ou aumenta-se a peça.',
    },
    {
      id: 'DG1-M3-Q7', type: 'true_false',
      prompt: 'Repetir é deixar igual o que tem o mesmo papel, e não deixar tudo igual.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Deixar tudo igual apaga a hierarquia: título e horário passariam a ter o mesmo peso.' },
      ]},
      explanation: 'Os nomes das atividades se repetem entre si, e os horários entre si — mas nome e horário continuam diferentes.',
    },
  ],

  /* ── Módulo 4 — cor (2.1, 2.2, 2.3 e 5.1) ────────────────────────────── */
  'm4-teoria': [
    {
      id: 'DG1-M4-Q1', type: 'multiple_choice',
      prompt: 'O que a saturação diz de uma cor?',
      data: { options: [
        { id: 'a', text: 'O quanto ela é viva.', correct: true },
        { id: 'b', text: 'O quanto ela é clara.', porque: 'Claro e escuro é a luminosidade.' },
        { id: 'c', text: 'Qual cor ela é.', porque: 'Qual cor — vermelho, verde, azul — é o matiz.' },
        { id: 'd', text: 'Quanto de tinta ela gasta.', porque: 'Gasto de tinta é assunto da gráfica, e não da cor em si.' },
      ]},
      explanation: 'Saturação alta grita; saturação baixa vai acinzentando a cor até virar cinza no zero.',
    },
    {
      id: 'DG1-M4-Q2', type: 'multiple_choice',
      prompt: 'Por que a tela usa RGB e a gráfica usa CMYK?',
      data: { options: [
        { id: 'a', text: 'A tela acende luz e o papel reflete.', correct: true },
        { id: 'b', text: 'O CMYK é mais moderno que o RGB.', porque: 'Os dois existem há muito tempo; servem a coisas diferentes.' },
        { id: 'c', text: 'O RGB tem menos cores que o CMYK.', porque: 'É o contrário: a luz alcança cores que a tinta não alcança.' },
        { id: 'd', text: 'É só um costume das gráficas.', porque: 'A gráfica imprime com quatro tintas porque o papel não acende luz.' },
      ]},
      explanation: 'A tela soma luz vermelha, verde e azul. O papel só reflete a luz do ambiente, e a tinta tira dela o que não quer.',
    },
    {
      id: 'DG1-M4-Q3', type: 'multiple_choice',
      prompt: 'Um cartaz tem um verde-limão que brilha na tela. O que esperar no papel?',
      data: { options: [
        { id: 'a', text: 'Um verde mais apagado.', correct: true },
        { id: 'b', text: 'O mesmo verde, igualzinho.', porque: 'Essa cor está fora da gama: nenhuma mistura de tinta chega nela.' },
        { id: 'c', text: 'Um verde ainda mais forte.', porque: 'A tinta não acende luz: só pode refletir menos do que a tela emite.' },
        { id: 'd', text: 'Uma mancha cinza no lugar.', porque: 'A cor muda, mas continua verde: perde o brilho, e não o matiz.' },
      ]},
      explanation: 'A cor que mais brilha na tela é a que mais muda no papel. A prova de impressão mostra isso antes.',
    },
    {
      id: 'DG1-M4-Q4', type: 'multiple_choice',
      prompt: 'Numa paleta, o que é uma boa cor de apoio para um destaque vermelho?',
      data: { options: [
        { id: 'a', text: 'O mesmo vermelho, menos saturado.', correct: true },
        { id: 'b', text: 'Um verde bem saturado.', porque: 'Um verde vivo disputa com o vermelho, em vez de apoiá-lo.' },
        { id: 'c', text: 'O mesmo vermelho, idêntico.', porque: 'Idêntica, ela não é outra cor: é o destaque de novo.' },
        { id: 'd', text: 'Um ouro bem saturado.', porque: 'Ouro vivo é outro destaque; o apoio é mais calmo.' },
      ]},
      explanation: 'Mesmo matiz, saturação menor: é "o mesmo vermelho, só que sem gritar".',
    },
    {
      id: 'DG1-M4-Q5', type: 'multiple_choice',
      prompt: 'Qual destas é uma justificativa de cor, e não uma opinião?',
      data: { options: [
        { id: 'a', text: 'O vermelho do clube marca a data.', correct: true },
        { id: 'b', text: 'Escolhi porque achei bonito.', porque: 'Gosto é opinião: não diz o que a cor faz na peça.' },
        { id: 'c', text: 'É a minha cor preferida.', porque: 'Preferência não é papel na peça.' },
        { id: 'd', text: 'Todo mundo usa essa cor.', porque: 'Moda não diz o que a cor faz nesta peça.' },
      ]},
      explanation: 'Justificar uma cor é dizer o papel dela — fundo, texto, destaque, apoio, neutro — e por que ela cumpre esse papel.',
    },
    {
      id: 'DG1-M4-Q6', type: 'true_false',
      prompt: 'Um "neutro" com saturação alta disputa com o destaque.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Saturação alta chama atenção, que é o papel do destaque, e não do neutro.' },
      ]},
      explanation: 'Neutro é quase cinza, para o que é secundário. Um ouro vivo no papel de neutro vira um segundo destaque.',
    },
    {
      id: 'DG1-M4-Q7', type: 'true_false',
      prompt: 'A prova de impressão do editor mostra exatamente a cor que vai sair do papel.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Cada papel e cada máquina mudam um pouco; a prova mostra qual cor vai mudar.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'A prova é uma aproximação. O que ela garante é avisar qual cor vai perder o brilho no papel.',
    },
  ],

  /* ── Módulo 5 — tipografia (3.1, 3.2, 3.3 e 5.2) ─────────────────────── */
  'm5-teoria': [
    {
      id: 'DG1-M5-Q1', type: 'multiple_choice',
      prompt: 'Qual é a diferença entre família e peso?',
      data: { options: [
        { id: 'a', text: 'Desenho das letras e espessura do traço.', correct: true },
        { id: 'b', text: 'Tamanho da letra e cor da letra.', porque: 'Tamanho é o corpo; cor é outra propriedade.' },
        { id: 'c', text: 'Letra do título e letra do texto.', porque: 'Os dois podem usar a mesma família em pesos diferentes.' },
        { id: 'd', text: 'Letra impressa e letra na tela.', porque: 'Família e peso valem do mesmo jeito nos dois.' },
      ]},
      explanation: 'Família é o desenho — Arial, Georgia. Peso é a espessura dentro do mesmo desenho — normal, negrito.',
    },
    {
      id: 'DG1-M5-Q2', type: 'multiple_choice',
      prompt: 'O que é entrelinha?',
      data: { options: [
        { id: 'a', text: 'A distância de uma linha à próxima.', correct: true },
        { id: 'b', text: 'O espaço entre duas letras.', porque: 'Isso é espacejamento, e não entrelinha.' },
        { id: 'c', text: 'A altura da letra maiúscula.', porque: 'A altura da letra vem do corpo.' },
        { id: 'd', text: 'A margem do parágrafo.', porque: 'A margem é em volta; a entrelinha é entre as linhas.' },
      ]},
      explanation: 'Ela costuma vir em relação ao corpo: 1,5 é uma entrelinha de 150% do tamanho da letra.',
    },
    {
      id: 'DG1-M5-Q3', type: 'multiple_choice',
      prompt: 'Um parágrafo tem corpo 11 e entrelinha de 100%. O que acontece com quem lê?',
      data: { options: [
        { id: 'a', text: 'Se perde ao voltar de linha.', correct: true },
        { id: 'b', text: 'Lê mais rápido, sem esforço.', porque: 'Linhas quase se tocando cansam e confundem a volta de linha.' },
        { id: 'c', text: 'Não percebe diferença nenhuma.', porque: 'Linhas apertadas assim se percebem na primeira volta de linha.' },
        { id: 'd', text: 'Lê só a primeira palavra.', porque: 'O problema aparece ao passar de uma linha para a outra.' },
      ]},
      explanation: 'Com 100%, as linhas quase se tocam. Para texto corrido, entre 130% e 170% funciona.',
    },
    {
      id: 'DG1-M5-Q4', type: 'multiple_choice',
      prompt: 'Qual destas é uma família monoespaçada?',
      data: { options: [
        { id: 'a', text: 'Courier New', correct: true },
        { id: 'b', text: 'Georgia', porque: 'Georgia é serifada, com letras de larguras diferentes.' },
        { id: 'c', text: 'Arial', porque: 'Arial é sem serifa, com letras de larguras diferentes.' },
        { id: 'd', text: 'Verdana', porque: 'Verdana é sem serifa: o i é bem mais estreito que o m.' },
      ]},
      explanation: 'Na monoespaçada toda letra ocupa a mesma largura — o i tanto quanto o m. É a letra do código e das tabelas.',
    },
    {
      id: 'DG1-M5-Q5', type: 'multiple_choice',
      prompt: 'Um folheto usa Arial no título e Verdana no texto. Por que o par não funciona bem?',
      data: { options: [
        { id: 'a', text: 'São parecidas: parece engano.', correct: true },
        { id: 'b', text: 'São diferentes demais.', porque: 'As duas são sem serifa, quase iguais; o problema é a falta de diferença.' },
        { id: 'c', text: 'Nenhuma das duas se lê.', porque: 'As duas se leem bem; juntas é que confundem.' },
        { id: 'd', text: 'Uma é monoespaçada.', porque: 'Nenhuma das duas é monoespaçada: são sem serifa.' },
      ]},
      explanation: 'Duas famílias funcionam juntas quando a diferença parece de propósito, como uma serifada e uma sem serifa.',
    },
    {
      id: 'DG1-M5-Q6', type: 'true_false',
      prompt: 'Para separar o subtítulo do texto, muitas vezes basta o peso, sem trocar de família.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'O negrito da mesma família já cria o degrau, sem pôr um terceiro desenho na peça.' },
      ]},
      explanation: 'Uma peça bem resolvida quase nunca passa de duas famílias. Os degraus que faltam saem do tamanho e do peso.',
    },
    {
      id: 'DG1-M5-Q7', type: 'true_false',
      prompt: 'Uma letra cursiva decorativa é uma boa escolha para um parágrafo inteiro.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Decorativa serve a uma palavra ou duas; num parágrafo ela cansa e confunde.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O texto corrido pede família de leitura: serifada ou sem serifa.',
    },
  ],

  /* ── Módulo 6 — contraste e análise (1.2 e 4) ────────────────────────── */
  'm6-teoria': [
    {
      id: 'DG1-M6-Q1', type: 'multiple_choice',
      prompt: 'O que é contraste, como princípio de composição?',
      data: { options: [
        { id: 'a', text: 'Diferença grande o bastante para se ver.', correct: true },
        { id: 'b', text: 'Usar sempre preto sobre branco.', porque: 'Preto sobre branco é um caso de contraste, e não a definição.' },
        { id: 'c', text: 'Pôr muitas cores juntas.', porque: 'Muitas cores podem até apagar o contraste entre elas.' },
        { id: 'd', text: 'Deixar o título em negrito.', porque: 'Negrito é um jeito de criar contraste de peso, e não a ideia toda.' },
      ]},
      explanation: 'Contraste é diferença: de tamanho, de peso, de claro e escuro. Diferença pequena não é contraste, é engano.',
    },
    {
      id: 'DG1-M6-Q2', type: 'multiple_choice',
      prompt: 'Um título enorme em amarelo-claro sobre branco. O que falha?',
      data: { options: [
        { id: 'a', text: 'A letra não se separa do fundo.', correct: true },
        { id: 'b', text: 'O tamanho do título.', porque: 'O tamanho está bom; enorme e invisível continua invisível.' },
        { id: 'c', text: 'O alinhamento do título.', porque: 'Um título bem alinhado e sem contraste continua sem se ler.' },
        { id: 'd', text: 'A família da letra.', porque: 'Qualquer família some se a cor dela é quase a do fundo.' },
      ]},
      explanation: 'O amarelo-claro do convite mede 1,68:1 sobre o branco. Sem contraste com o fundo, nenhum outro princípio salva.',
    },
    {
      id: 'DG1-M6-Q3', type: 'multiple_choice',
      prompt: 'Ao analisar uma peça, por que apontar onde o princípio falha?',
      data: { options: [
        { id: 'a', text: 'Para a análise não ser só opinião.', correct: true },
        { id: 'b', text: 'Para a análise ficar mais longa.', porque: 'Tamanho não é o objetivo; o dedo no lugar é que convence.' },
        { id: 'c', text: 'Porque o examinador não sabe ler.', porque: 'O examinador sabe; apontar mostra que você viu.' },
        { id: 'd', text: 'Para não precisar escrever nada.', porque: 'Apontar e escrever andam juntos: onde, e por quê.' },
      ]},
      explanation: '"O título some na foto" se mostra com o dedo. Apontar é o que separa análise de opinião.',
    },
    {
      id: 'DG1-M6-Q4', type: 'multiple_choice',
      prompt: 'O que costuma ter uma peça de qualidade discutível?',
      data: { options: [
        { id: 'a', text: 'Acerto em quase tudo e erro num lugar.', correct: true },
        { id: 'b', text: 'Erro em todos os princípios.', porque: 'Essa é a mal resolvida.' },
        { id: 'c', text: 'Acerto em todos os princípios.', porque: 'Essa é a bem resolvida.' },
        { id: 'd', text: 'Nenhum texto, só imagem.', porque: 'Discutível fala da qualidade, e não do tipo de conteúdo.' },
      ]},
      explanation: 'A discutível é a que engana: aprovada de relance, ela tem um lugar só que não se lê.',
    },
    {
      id: 'DG1-M6-Q5', type: 'multiple_choice',
      prompt: 'No campori, o título branco não se lê sobre a parte clara da foto. Onde se aponta a falha de contraste?',
      data: { options: [
        { id: 'a', text: 'No título.', correct: true },
        { id: 'b', text: 'No rodapé.', porque: 'O rodapé se lê bem; apontá-lo acerta a conclusão e erra o lugar.' },
        { id: 'c', text: 'Na data.', porque: 'A data está sobre o branco, em tinta escura, e se lê.' },
        { id: 'd', text: 'Na margem.', porque: 'A margem é espaço vazio: não tem contraste para falhar.' },
      ]},
      explanation: 'Quando o princípio falha, aponta-se o elemento que falha — e é o título que some na fogueira.',
    },
    {
      id: 'DG1-M6-Q6', type: 'true_false',
      prompt: 'Uma peça mal resolvida costuma errar em mais de um princípio ao mesmo tempo.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Quem não pensou na hierarquia costuma não ter pensado no alinhamento nem no contraste.' },
      ]},
      explanation: 'Os erros andam juntos porque vêm da mesma falta: montar a peça sem decidir nada de propósito.',
    },
    {
      id: 'DG1-M6-Q7', type: 'true_false',
      prompt: 'Dizer que o contraste falha apontando o rodapé, quando quem some é o título, é uma análise certa.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'A conclusão está certa, mas o lugar está errado — e o lugar é o que se mostra ao examinador.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Análise é conclusão mais lugar. Acertar um e errar o outro não fecha.',
    },
  ],

  /* ── Módulo 7 — refazer (5.3) ─────────────────────────────────────────── */
  'm7-teoria': [
    {
      id: 'DG1-M7-Q1', type: 'multiple_choice',
      prompt: 'Antes de refazer o convite no editor, qual é o primeiro passo?',
      data: { options: [
        { id: 'a', text: 'Duplicar a prancha.', correct: true },
        { id: 'b', text: 'Apagar as linhas feias.', porque: 'Apagar tira informação que o convite precisa dar.' },
        { id: 'c', text: 'Trocar todas as cores.', porque: 'Mexer antes de duplicar perde a versão de antes, que é parte da entrega.' },
        { id: 'd', text: 'Exportar a peça nova.', porque: 'Ainda não existe peça nova: e a de antes precisa ser guardada primeiro.' },
      ]},
      explanation: 'O requisito pede a versão anterior e a nova. Duplicar antes do primeiro clique garante as duas.',
    },
    {
      id: 'DG1-M7-Q2', type: 'multiple_choice',
      prompt: 'Refazendo o convite, alguém apaga a linha da hora "porque atrapalhava". O que deu errado?',
      data: { options: [
        { id: 'a', text: 'O convite perdeu informação.', correct: true },
        { id: 'b', text: 'A peça ficou leve demais.', porque: 'Leveza não é o problema; a falta da hora é.' },
        { id: 'c', text: 'O alinhamento ficou torto.', porque: 'Apagar uma linha não entorta as outras.' },
        { id: 'd', text: 'Nada: menos é sempre melhor.', porque: 'Menos é melhor no enfeite, e não na informação que a peça existe para dar.' },
      ]},
      explanation: 'Refazer não é reescrever: o convite precisa continuar dizendo data, hora, lugar e quem convida.',
    },
    {
      id: 'DG1-M7-Q3', type: 'multiple_choice',
      prompt: 'Qual ordem ajuda a refazer uma peça mal resolvida?',
      data: { options: [
        { id: 'a', text: 'Hierarquia, alinhamento, contraste, espaço.', correct: true },
        { id: 'b', text: 'Espaço, contraste, cores, título.', porque: 'Sem decidir antes o que é título, as margens e cores mudam de novo depois.' },
        { id: 'c', text: 'Cores primeiro, e o resto depois.', porque: 'Cor é um dos passos; decidir os degraus antes facilita escolhê-la.' },
        { id: 'd', text: 'Qualquer ordem dá no mesmo.', porque: 'Cada passo facilita o seguinte: decidir o título antes evita refazer o resto.' },
      ]},
      explanation: 'Decidido o que é título, fica claro o que alinhar, o que precisa de contraste e quanto espaço cada coisa pede.',
    },
    {
      id: 'DG1-M7-Q4', type: 'multiple_choice',
      prompt: 'O convite antigo usa letra cursiva amarela no título. Qual mudança resolve dois princípios de uma vez?',
      data: { options: [
        { id: 'a', text: 'Título maior, escuro e de leitura.', correct: true },
        { id: 'b', text: 'Título menor e mais amarelo.', porque: 'Menor piora a hierarquia; mais amarelo piora o contraste.' },
        { id: 'c', text: 'O mesmo título, centralizado.', porque: 'Centrar mexe no alinhamento, e o título continua sumindo no branco.' },
        { id: 'd', text: 'Título igual, com sombra.', porque: 'Sombra remenda o contraste e não muda a hierarquia.' },
      ]},
      explanation: 'Maior resolve a hierarquia; escuro resolve o contraste; uma família de leitura garante que ele se leia.',
    },
    {
      id: 'DG1-M7-Q5', type: 'multiple_choice',
      prompt: 'Quem duplicou a prancha e refez a original, deixando a cópia como estava, entregou o quê?',
      data: { options: [
        { id: 'a', text: 'As duas versões, do mesmo jeito.', correct: true },
        { id: 'b', text: 'Só a versão nova.', porque: 'A cópia intacta é a versão de antes.' },
        { id: 'c', text: 'Só a versão antiga.', porque: 'A original refeita é a versão nova.' },
        { id: 'd', text: 'Nenhuma das duas.', porque: 'As duas existem, só que trocadas de lugar.' },
      ]},
      explanation: 'O que importa é existir uma intacta e uma refeita, com o mesmo texto. Qual delas é a cópia não muda nada.',
    },
    {
      id: 'DG1-M7-Q6', type: 'true_false',
      prompt: 'Dá para refazer a peça e depois lembrar como ela era, sem guardar a de antes.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Depois de mexer, a de antes não volta — e ela é parte da entrega.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Duplicar antes de mexer é o único jeito garantido de entregar as duas.',
    },
    {
      id: 'DG1-M7-Q7', type: 'true_false',
      prompt: 'Cada mudança do convite refeito responde a um princípio que se sabe dizer.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'A apresentação pede justificar as mudanças: título maior pela hierarquia, cor escura pelo contraste.' },
      ]},
      explanation: 'Mudança sem princípio é gosto. A peça refeita se defende mostrando o porquê de cada mudança.',
    },
  ],

  /* ── Módulo 8 — medir, e a cor que não carrega sozinha (6 e 7) ───────── */
  'm8-teoria': [
    {
      id: 'DG1-M8-Q1', type: 'multiple_choice',
      prompt: 'Qual é o contraste mínimo para texto comum, nas diretrizes de acessibilidade da web?',
      data: { options: [
        { id: 'a', text: '4,5:1', correct: true },
        { id: 'b', text: '3:1', porque: 'Três para um vale para texto grande, de 24 pixels ou mais.' },
        { id: 'c', text: '21:1', porque: 'Vinte e um para um é o máximo possível, o preto sobre o branco.' },
        { id: 'd', text: '1:1', porque: 'Um para um é letra da cor do fundo: invisível.' },
      ]},
      explanation: 'Texto comum pede 4,5:1; texto grande, 3:1, porque letra grande se lê com menos.',
    },
    {
      id: 'DG1-M8-Q2', type: 'multiple_choice',
      prompt: 'O cinza #808080 parece quase igual ao #767676. O que o medidor diz sobre o branco?',
      data: { options: [
        { id: 'a', text: 'Um passa e o outro não.', correct: true },
        { id: 'b', text: 'Os dois passam igual.', porque: 'O #808080 mede 3,95:1 e não chega aos 4,5:1 do texto comum.' },
        { id: 'c', text: 'Nenhum dos dois passa.', porque: 'O #767676 mede 4,54:1 e passa, raspando.' },
        { id: 'd', text: 'O medidor não mede cinza.', porque: 'O medidor mede qualquer par de cores.' },
      ]},
      explanation: 'O #767676 mede 4,54:1 e o #808080 mede 3,95:1. É por isso que se mede, e não se acha.',
    },
    {
      id: 'DG1-M8-Q3', type: 'multiple_choice',
      prompt: 'Um título branco passa por cima de uma foto com partes escuras e claras. Que contraste vale?',
      data: { options: [
        { id: 'a', text: 'O do pior trecho da foto.', correct: true },
        { id: 'b', text: 'O do melhor trecho da foto.', porque: 'A letra passa pelos dois trechos, e é no pior que ela some.' },
        { id: 'c', text: 'A média dos trechos.', porque: 'A média esconde o trecho em que a letra some.' },
        { id: 'd', text: 'O da cor da folha.', porque: 'A folha está debaixo da foto: a letra não pousa nela.' },
      ]},
      explanation: 'No campori, o branco mede 16,69:1 contra a parte escura e 1,63:1 contra a clara. É na clara que o título some.',
    },
    {
      id: 'DG1-M8-Q4', type: 'multiple_choice',
      prompt: 'Uma escala diz quem confirmou só pela cor do ponto, verde ou vermelho. Quem fica sem a informação?',
      data: { options: [
        { id: 'a', text: 'Quem não distingue verde de vermelho.', correct: true },
        { id: 'b', text: 'Só quem usa óculos.', porque: 'Óculos corrigem foco, e não a percepção de cor.' },
        { id: 'c', text: 'Ninguém: a cor é clara.', porque: 'Cerca de uma em cada doze pessoas com cromossomo XY confunde essas duas cores.' },
        { id: 'd', text: 'Só quem lê no computador.', porque: 'A cor some para quem não a distingue, em qualquer aparelho.' },
      ]},
      explanation: 'E também quem recebe a cópia em preto e branco: a cor some, e a informação vai junto.',
    },
    {
      id: 'DG1-M8-Q5', type: 'multiple_choice',
      prompt: 'Qual é a melhor forma de consertar a escala que só usa cor?',
      data: { options: [
        { id: 'a', text: 'Escrever a situação ao lado do ponto.', correct: true },
        { id: 'b', text: 'Tirar as cores da escala.', porque: 'A cor continua ajudando quem a vê; o que falta é um segundo sinal.' },
        { id: 'c', text: 'Usar cores mais fortes.', porque: 'Verde e vermelho mais fortes continuam iguais para quem não os separa.' },
        { id: 'd', text: 'Aumentar o tamanho dos pontos.', porque: 'Ponto maior continua dizendo a situação só pela cor.' },
      ]},
      explanation: 'Uma palavra, um símbolo, um padrão: o segundo sinal faz a informação chegar a todo mundo.',
    },
    {
      id: 'DG1-M8-Q6', type: 'true_false',
      prompt: 'O verde e o vermelho da escala, que parecem tão diferentes, têm contraste de 1,17:1 entre si.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Medidos um contra o outro, dão 1,17:1: a diferença entre eles é só de matiz.' },
      ]},
      explanation: 'Os dois têm quase a mesma luminosidade. Sem a percepção do matiz, viram a mesma cor.',
    },
    {
      id: 'DG1-M8-Q7', type: 'true_false',
      prompt: 'Se o texto parece legível na minha tela, não preciso medir o contraste.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Cada tela mostra a cor de um jeito, e "parece" não diz se passa do mínimo.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Medir é o que transforma "acho que está bom" num número que vale para qualquer tela.',
    },
  ],
};
