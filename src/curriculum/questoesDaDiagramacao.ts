import type { Question } from '../types';

/*
 * As questões das lições de teoria da CC-DG005 Diagramação e Impressão.
 *
 * A definição vale uma vez por lição; o resto é consequência e diagnóstico —
 * a capa com fio branco, o terceiro título diferente, a foto serrilhada, o
 * número que erra quando a página entra no meio, o azul que sai apagado.
 * Toda errada diz por que está errada no campo porque, a certa é uma
 * afirmação curta e o porquê dela mora no explanation, pela razão escrita na
 * CC-ES012. Sem crase nem asterisco: a questão vai para o QuestionRenderer,
 * que imprime texto puro.
 */

export const QUESTOES_DA_DIAGRAMACAO: Record<string, Question[]> = {
  /* ── Módulo 1 — malha, margem e sangria (requisitos 2.1, 2.2 e 4.1) ──── */
  'm1-teoria': [
    {
      id: 'DG5-M1-Q1', type: 'multiple_choice',
      prompt: 'O que é a malha de diagramação?',
      data: { options: [
        { id: 'a', text: 'As margens e colunas da página.', correct: true },
        { id: 'b', text: 'A textura de fundo do papel.', porque: 'Fundo é decoração; a malha nem sai impressa.' },
        { id: 'c', text: 'A lista de fotos da publicação.', porque: 'A lista de fotos não diz onde cada uma fica.' },
        { id: 'd', text: 'O quadriculado da foto da capa.', porque: 'Quadriculado de foto são os pixels dela.' },
      ]},
      explanation: 'É o esqueleto invisível em que o texto corre e as fotos se apoiam.',
    },
    {
      id: 'DG5-M1-Q2', type: 'multiple_choice',
      prompt: 'Como se chama o vão entre duas colunas?',
      data: { options: [
        { id: 'a', text: 'Medianiz.', correct: true },
        { id: 'b', text: 'Sangria.', porque: 'A sangria fica fora do papel, e não entre as colunas.' },
        { id: 'c', text: 'Margem externa.', porque: 'A margem externa fica na borda de fora da página.' },
        { id: 'd', text: 'Entrelinha.', porque: 'Entrelinha é a distância entre uma linha e a seguinte.' },
      ]},
      explanation: 'No boletim, a medianiz tem 5 mm.',
    },
    {
      id: 'DG5-M1-Q3', type: 'multiple_choice',
      prompt: 'A foto da capa vai de X 0 até 148 mm, parando na borda do papel. O que pode acontecer no corte?',
      data: { options: [
        { id: 'a', text: 'Sobrar um fio branco num lado.', correct: true },
        { id: 'b', text: 'A foto sair sem cor.', porque: 'O corte mexe na borda, e não na cor da foto.' },
        { id: 'c', text: 'O texto ficar torto.', porque: 'O texto não depende de onde a foto termina.' },
        { id: 'd', text: 'Nada; é o jeito certo.', porque: 'A guilhotina erra um pouco, e o lado errado fica branco.' },
      ]},
      explanation: 'O que encosta na borda precisa passar dela: 3 mm de sangria, X -3 e 154 mm de largura.',
    },
    {
      id: 'DG5-M1-Q4', type: 'multiple_choice',
      prompt: 'Num boletim grampeado, por que a margem interna costuma ser maior?',
      data: { options: [
        { id: 'a', text: 'Parte dela some na dobra.', correct: true },
        { id: 'b', text: 'Para caber o número da página.', porque: 'O número costuma ficar no pé, e não junto da dobra.' },
        { id: 'c', text: 'Para gastar menos papel.', porque: 'Margem maior gasta mais papel, e não menos.' },
        { id: 'd', text: 'Porque a gráfica exige igual.', porque: 'Se fosse igual, ela não seria maior.' },
      ]},
      explanation: 'No boletim são 16 mm por dentro e 13 por fora.',
    },
    {
      id: 'DG5-M1-Q5', type: 'multiple_choice',
      prompt: 'O que pode ir para a sangria?',
      data: { options: [
        { id: 'a', text: 'Uma foto ou um fundo de cor.', correct: true },
        { id: 'b', text: 'O título da matéria.', porque: 'Texto na sangria é cortado pela guilhotina.' },
        { id: 'c', text: 'O número da página.', porque: 'O número é texto, e texto fica dentro da margem.' },
        { id: 'd', text: 'Nada; ela fica vazia.', porque: 'Vazia, ela não teria por que existir.' },
      ]},
      explanation: 'A sangria existe para o que precisa chegar até a borda depois do corte.',
    },
    {
      id: 'DG5-M1-Q6', type: 'true_false',
      prompt: 'Uma foto pode ocupar duas colunas e continuar respeitando a malha.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Basta ela começar e terminar nas guias.' },
      ]},
      explanation: 'A fogueira do boletim ocupa as duas colunas da página 2, de guia a guia.',
    },
    {
      id: 'DG5-M1-Q7', type: 'true_false',
      prompt: 'Na página da direita, a margem interna fica do lado direito.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Na página da direita a dobra fica à esquerda, e a interna fica junto da dobra.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'A interna acompanha a dobra, e por isso troca de lado entre as páginas.',
    },
  ],

  /* ── Módulo 2 — estilos de parágrafo (requisito 4.2) ─────────────────────── */
  'm2-teoria': [
    {
      id: 'DG5-M2-Q1', type: 'multiple_choice',
      prompt: 'O que é um estilo de parágrafo?',
      data: { options: [
        { id: 'a', text: 'Um nome que guarda letra e espaçamento.', correct: true },
        { id: 'b', text: 'A cor de fundo do parágrafo.', porque: 'Estilo guarda bem mais que a cor, e quase nunca o fundo.' },
        { id: 'c', text: 'O parágrafo mais bonito da página.', porque: 'Estilo é um molde, e não um parágrafo escolhido.' },
        { id: 'd', text: 'A primeira linha recuada.', porque: 'O recuo pode estar num estilo, mas não é o estilo.' },
      ]},
      explanation: 'Título, Corpo e Legenda: cada tipo de texto tem o seu, e todos os parágrafos daquele tipo o usam.',
    },
    {
      id: 'DG5-M2-Q2', type: 'multiple_choice',
      prompt: 'O que quer dizer 9,5/13 no estilo Corpo?',
      data: { options: [
        { id: 'a', text: 'Letra de 9,5 pt, linhas a 13 pt.', correct: true },
        { id: 'b', text: 'Nove parágrafos e meio por página.', porque: 'Os números falam da letra, e não de quantos parágrafos.' },
        { id: 'c', text: 'Margem de 9,5 mm e coluna de 13.', porque: 'Margem e coluna se dizem em milímetros, e o estilo em pontos.' },
        { id: 'd', text: 'Treze letras em cada 9,5 mm.', porque: 'É corpo e entrelinha, e não letras por milímetro.' },
      ]},
      explanation: 'O primeiro número é o corpo; o segundo, a distância de uma linha à seguinte.',
    },
    {
      id: 'DG5-M2-Q3', type: 'multiple_choice',
      prompt: 'O programa mostra Corpo+ num parágrafo. O que isso diz?',
      data: { options: [
        { id: 'a', text: 'Alguém mudou ele à mão.', correct: true },
        { id: 'b', text: 'Ele é maior que os outros.', porque: 'O sinal diz que há mudança, mas não qual.' },
        { id: 'c', text: 'Ele está em dois estilos.', porque: 'Todo parágrafo está em um estilo só.' },
        { id: 'd', text: 'Ele foi aprovado.', porque: 'O sinal aponta formatação por cima do estilo, não aprovação.' },
      ]},
      explanation: 'É a formatação direta, e ela vence o estilo.',
    },
    {
      id: 'DG5-M2-Q4', type: 'multiple_choice',
      prompt: 'Mudaram o estilo Título para Verdana, e o terceiro título continuou em Trebuchet. Por quê?',
      data: { options: [
        { id: 'a', text: 'Ele é Corpo engordado à mão.', correct: true },
        { id: 'b', text: 'O programa travou.', porque: 'Os outros títulos mudaram; o programa funcionou.' },
        { id: 'c', text: 'Verdana não tem negrito.', porque: 'Os outros títulos mudaram com negrito e tudo.' },
        { id: 'd', text: 'Títulos só mudam um por vez.', porque: 'Estilo existe justamente para mudar todos de uma vez.' },
      ]},
      explanation: 'Parecia título na tela, mas para o programa era Corpo com formatação por cima.',
    },
    {
      id: 'DG5-M2-Q5', type: 'multiple_choice',
      prompt: 'Depois de limpar a formatação do título que era Corpo engordado, o que falta?',
      data: { options: [
        { id: 'a', text: 'Pôr ele no estilo Título.', correct: true },
        { id: 'b', text: 'Nada; limpar já resolve.', porque: 'Limpar devolve ao estilo dele, que ainda é Corpo.' },
        { id: 'c', text: 'Aumentar a letra à mão.', porque: 'É exatamente o que criou o problema.' },
        { id: 'd', text: 'Apagar e digitar de novo.', porque: 'O texto novo nasce no mesmo estilo errado.' },
      ]},
      explanation: 'Limpar tira o "+"; trocar o estilo é outro gesto.',
    },
    {
      id: 'DG5-M2-Q6', type: 'true_false',
      prompt: 'Mudar o estilo Corpo muda todos os parágrafos de Corpo do boletim de uma vez.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'É para isso que o estilo existe.' },
      ]},
      explanation: 'Menos os que têm formatação direta por cima: neles, a mão continua vencendo.',
    },
    {
      id: 'DG5-M2-Q7', type: 'true_false',
      prompt: 'Um parágrafo colado de um e-mail chega sempre no estilo do boletim.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Ele costuma trazer a letra de onde veio, como formatação direta.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'É por isso que o "+" aparece em todo canto de um texto escrito por várias pessoas.',
    },
  ],

  /* ── Módulo 3 — imagens e resolução (requisitos 2.4 e 4.3) ────────────── */
  'm3-teoria': [
    {
      id: 'DG5-M3-Q1', type: 'multiple_choice',
      prompt: 'O que é a resolução de impressão de uma foto?',
      data: { options: [
        { id: 'a', text: 'Os pixels por polegada no tamanho posto.', correct: true },
        { id: 'b', text: 'O número total de pixels dela.', porque: 'O total não muda; o ppi muda com o tamanho em que ela é posta.' },
        { id: 'c', text: 'O peso do arquivo em megabytes.', porque: 'Peso depende da compressão, e não da nitidez no papel.' },
        { id: 'd', text: 'A qualidade da câmera.', porque: 'A mesma foto tem ppi diferente pequena e grande.' },
      ]},
      explanation: 'É a conta da CC-DG003 aplicada à página: pixels divididos pelas polegadas que ela ocupa.',
    },
    {
      id: 'DG5-M3-Q2', type: 'multiple_choice',
      prompt: 'A foto da unidade tem 137 ppi na largura da página. O que fazer?',
      data: { options: [
        { id: 'a', text: 'Diminuir a foto.', correct: true },
        { id: 'b', text: 'Subir o ppi no programa.', porque: 'Subir o ppi sem pixels novos só inventa pixels.' },
        { id: 'c', text: 'Imprimir assim mesmo.', porque: 'Abaixo de 240 ppi os pixels aparecem no papel.' },
        { id: 'd', text: 'Aumentar a foto.', porque: 'Maior, ela fica com ainda menos ppi.' },
      ]},
      explanation: 'Numa coluna, os mesmos 640 pixels dão 285 ppi.',
    },
    {
      id: 'DG5-M3-Q3', type: 'multiple_choice',
      prompt: 'Pôr uma foto no meio da matéria empurrou o texto. Onde aparece o problema?',
      data: { options: [
        { id: 'a', text: 'No fim, no texto excedente.', correct: true },
        { id: 'b', text: 'Na foto, que encolhe.', porque: 'A foto fica do tamanho que foi posta.' },
        { id: 'c', text: 'No título, que some.', porque: 'O título vem antes; quem perde lugar é o fim.' },
        { id: 'd', text: 'Em lugar nenhum.', porque: 'O texto contorna a foto e o fim fica sem lugar.' },
      ]},
      explanation: 'O programa avisa com um "+" vermelho no último quadro.',
    },
    {
      id: 'DG5-M3-Q4', type: 'multiple_choice',
      prompt: 'Qual destas resolve o texto excedente sem mudar o boletim inteiro?',
      data: { options: [
        { id: 'a', text: 'Criar um quadro para o texto correr.', correct: true },
        { id: 'b', text: 'Diminuir a letra do Corpo.', porque: 'Muda o estilo de todas as páginas.' },
        { id: 'c', text: 'Apagar o quadro do fim.', porque: 'Aí sobra ainda mais texto sem lugar.' },
        { id: 'd', text: 'Ignorar o sinal vermelho.', porque: 'O fim da matéria some da página impressa.' },
      ]},
      explanation: 'Cortar texto também resolve; diminuir a letra resolve mudando o que não devia.',
    },
    {
      id: 'DG5-M3-Q5', type: 'multiple_choice',
      prompt: 'A foto veio de um grupo de mensagens e ficou serrilhada no papel. O que pedir?',
      data: { options: [
        { id: 'a', text: 'O arquivo original.', correct: true },
        { id: 'b', text: 'Um print da conversa.', porque: 'O print tem ainda menos pixels da foto.' },
        { id: 'c', text: 'A mesma foto em PNG.', porque: 'Trocar o formato não devolve os pixels perdidos.' },
        { id: 'd', text: 'Que mandem de novo no grupo.', porque: 'O grupo comprime de novo, do mesmo jeito.' },
      ]},
      explanation: 'O aplicativo de mensagens comprime e encolhe a foto; o original tem os pixels de verdade.',
    },
    {
      id: 'DG5-M3-Q6', type: 'true_false',
      prompt: 'A mesma foto tem mais ppi quando é posta menor na página.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Os mesmos pixels em menos polegadas dão mais pixels por polegada.' },
      ]},
      explanation: 'A da unidade vai de 137 ppi a 285 ppi só mudando a largura.',
    },
    {
      id: 'DG5-M3-Q7', type: 'true_false',
      prompt: 'O texto excedente é apagado do arquivo.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Ele continua no arquivo; só não aparece na página.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Por isso ninguém percebe que faltou o fim: o texto está lá, sem lugar.',
    },
  ],

  /* ── Módulo 4 — página-mestre (requisito 4.4) ────────────────────────── */
  'm4-teoria': [
    {
      id: 'DG5-M4-Q1', type: 'multiple_choice',
      prompt: 'O que é a página-mestre?',
      data: { options: [
        { id: 'a', text: 'Um modelo que as páginas herdam.', correct: true },
        { id: 'b', text: 'A primeira página do boletim.', porque: 'A primeira é a capa, e ela nem usa a mestre.' },
        { id: 'c', text: 'A página com mais texto.', porque: 'Tamanho do texto não faz de ninguém um modelo.' },
        { id: 'd', text: 'A cópia de segurança do arquivo.', porque: 'Cópia guarda o arquivo; a mestre guarda o que se repete.' },
      ]},
      explanation: 'O que está nela aparece em todas as páginas que a usam.',
    },
    {
      id: 'DG5-M4-Q2', type: 'multiple_choice',
      prompt: 'Entrou uma página nova no meio do boletim. O que acontece com os números digitados à mão?',
      data: { options: [
        { id: 'a', text: 'Ficam errados dali para a frente.', correct: true },
        { id: 'b', text: 'Se ajustam sozinhos.', porque: 'Só o campo se ajusta; o digitado é texto parado.' },
        { id: 'c', text: 'Somem das páginas.', porque: 'Eles continuam lá, mostrando o número velho.' },
        { id: 'd', text: 'Viram campo.', porque: 'Nada transforma texto digitado em campo sozinho.' },
      ]},
      explanation: 'O número digitado acerta no dia em que foi digitado e erra no dia em que o boletim muda.',
    },
    {
      id: 'DG5-M4-Q3', type: 'multiple_choice',
      prompt: 'Por que a capa leva a mestre Nenhuma?',
      data: { options: [
        { id: 'a', text: 'Capa não tem número nem cabeçalho.', correct: true },
        { id: 'b', text: 'Para o arquivo ficar menor.', porque: 'A mestre não pesa no arquivo; o motivo é o que aparece.' },
        { id: 'c', text: 'Porque a gráfica exige.', porque: 'É convenção de toda publicação, e não da gráfica.' },
        { id: 'd', text: 'Para a foto ficar maior.', porque: 'O tamanho da foto não depende da mestre.' },
      ]},
      explanation: 'Com a mestre A, a capa sairia com o número 1 e o cabeçalho por cima da foto.',
    },
    {
      id: 'DG5-M4-Q4', type: 'multiple_choice',
      prompt: 'Ligaram o número automático e as páginas mostram dois números, um em cima do outro. O que faltou?',
      data: { options: [
        { id: 'a', text: 'Apagar os números digitados.', correct: true },
        { id: 'b', text: 'Desligar o automático.', porque: 'Aí volta o número que erra quando o boletim muda.' },
        { id: 'c', text: 'Mudar a letra de um deles.', porque: 'Os dois continuariam lá, só em letras diferentes.' },
        { id: 'd', text: 'Trocar a mestre das páginas.', porque: 'A mestre é onde mora o automático, que está certo.' },
      ]},
      explanation: 'O automático vem da mestre; o digitado estava em cada página e precisa sair.',
    },
    {
      id: 'DG5-M4-Q5', type: 'multiple_choice',
      prompt: 'Para que serve o cabeçalho corrente?',
      data: { options: [
        { id: 'a', text: 'Dizer de que publicação é a folha.', correct: true },
        { id: 'b', text: 'Mostrar o título da matéria.', porque: 'O título fica no texto; o cabeçalho repete o nome do boletim.' },
        { id: 'c', text: 'Separar as colunas.', porque: 'Quem separa as colunas é a medianiz.' },
        { id: 'd', text: 'Guardar o endereço do clube.', porque: 'Endereço não precisa se repetir em toda página.' },
      ]},
      explanation: 'Mesmo uma folha solta diz de onde veio.',
    },
    {
      id: 'DG5-M4-Q6', type: 'true_false',
      prompt: 'O número de página posto na mestre muda sozinho em cada página.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Na mestre ele é campo, e campo mostra o número da página em que está.' },
      ]},
      explanation: 'É a mesma diferença entre campo e número digitado da CC-ES002.',
    },
    {
      id: 'DG5-M4-Q7', type: 'true_false',
      prompt: 'Escrever o cabeçalho à mão em cada página dá o mesmo resultado que pô-lo na mestre.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'À mão, um dia uma das páginas fica diferente das outras.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Na mestre ele mora num lugar só, e muda em todas de uma vez.',
    },
  ],

  /* ── Módulo 5 — RGB, CMYK e o PDF (requisitos 2.3, 3 e 4.5) ───────────── */
  'm5-teoria': [
    {
      id: 'DG5-M5-Q1', type: 'multiple_choice',
      prompt: 'O que são as marcas de corte?',
      data: { options: [
        { id: 'a', text: 'Riscos que mostram onde cortar.', correct: true },
        { id: 'b', text: 'As bordas brancas da página.', porque: 'Borda branca é o que a sangria existe para evitar.' },
        { id: 'c', text: 'As linhas entre as colunas.', porque: 'Entre as colunas fica a medianiz.' },
        { id: 'd', text: 'O traço embaixo do título.', porque: 'Isso é enfeite do texto, e não sinal para a gráfica.' },
      ]},
      explanation: 'Ficam nos quatro cantos, fora do papel e da sangria.',
    },
    {
      id: 'DG5-M5-Q2', type: 'multiple_choice',
      prompt: 'Como a tela faz cor?',
      data: { options: [
        { id: 'a', text: 'Somando três luzes.', correct: true },
        { id: 'b', text: 'Misturando quatro tintas.', porque: 'Tinta é o papel; a tela tem luz própria.' },
        { id: 'c', text: 'Refletindo a luz da sala.', porque: 'Quem só reflete é o papel.' },
        { id: 'd', text: 'Com pigmentos coloridos.', porque: 'Pigmento é tinta; a tela acende pontos de luz.' },
      ]},
      explanation: 'Vermelho, verde e azul: RGB.',
    },
    {
      id: 'DG5-M5-Q3', type: 'multiple_choice',
      prompt: 'O boletim foi mandado em RGB e o azul do título saiu apagado. Por quê?',
      data: { options: [
        { id: 'a', text: 'A gráfica converteu, e a tinta não alcança.', correct: true },
        { id: 'b', text: 'A gráfica errou a tinta.', porque: 'A tinta estava certa; aquele azul não existe em tinta.' },
        { id: 'c', text: 'O papel era fino.', porque: 'A gramatura não muda a cor que a tinta alcança.' },
        { id: 'd', text: 'O PDF estava sem sangria.', porque: 'Sangria mexe na borda, e não na cor.' },
      ]},
      explanation: 'Convertendo em casa, a mudança aparece na tela a tempo de ajustar.',
    },
    {
      id: 'DG5-M5-Q4', type: 'multiple_choice',
      prompt: 'O documento não tem sangria, e o PDF foi exportado com 3 mm de sangria. Como sai a capa?',
      data: { options: [
        { id: 'a', text: 'Com 3 mm de branco em volta.', correct: true },
        { id: 'b', text: 'Com a foto esticada até a borda.', porque: 'O PDF não estica nada; mostra o que existe.' },
        { id: 'c', text: 'Perfeita.', porque: 'A foto para na borda, e a sangria do PDF fica vazia.' },
        { id: 'd', text: 'Sem a foto.', porque: 'A foto continua lá, só não passa da borda.' },
      ]},
      explanation: 'A sangria se reserva no documento, antes de diagramar.',
    },
    {
      id: 'DG5-M5-Q5', type: 'multiple_choice',
      prompt: 'Exportaram o PDF e depois corrigiram um nome no boletim. O que mandar à gráfica?',
      data: { options: [
        { id: 'a', text: 'Um PDF exportado de novo.', correct: true },
        { id: 'b', text: 'O PDF de antes.', porque: 'Ele congelou o boletim antes da correção.' },
        { id: 'c', text: 'O arquivo do programa.', porque: 'A gráfica pede PDF, e não o arquivo de edição.' },
        { id: 'd', text: 'O PDF com um bilhete.', porque: 'A gráfica imprime o PDF, e não o bilhete.' },
      ]},
      explanation: 'O PDF é um retrato do documento de quando foi exportado.',
    },
    {
      id: 'DG5-M5-Q6', type: 'true_false',
      prompt: 'Uma foto de site com 72 ppi pode sair serrilhada impressa grande.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'O papel pede uns 300 ppi; 72 dá quadradinhos.' },
      ]},
      explanation: 'Na tela ela fica bonita; no papel faltam pixels.',
    },
    {
      id: 'DG5-M5-Q7', type: 'true_false',
      prompt: 'Converter para CMYK estraga a foto.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Ela só mostra antes o que a gráfica faria depois.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'A cor muda de qualquer jeito; em casa, dá para ver e ajustar.',
    },
  ],

  /* ── Módulo 6 — a gráfica e o papel (requisitos 2.6 e 5) ──────────────── */
  'm6-teoria': [
    {
      id: 'DG5-M6-Q1', type: 'multiple_choice',
      prompt: 'O que é gramatura?',
      data: { options: [
        { id: 'a', text: 'O peso de um metro quadrado do papel.', correct: true },
        { id: 'b', text: 'O tamanho da folha.', porque: 'Tamanho é o formato, como A5.' },
        { id: 'c', text: 'A quantidade de tinta.', porque: 'Tinta não entra na conta da gramatura.' },
        { id: 'd', text: 'O brilho do papel.', porque: 'Brilho é o acabamento, como o couché.' },
      ]},
      explanation: 'Em gramas por metro quadrado: quanto maior, mais grosso.',
    },
    {
      id: 'DG5-M6-Q2', type: 'multiple_choice',
      prompt: 'Qual gramatura serve para a capa do boletim?',
      data: { options: [
        { id: 'a', text: '250 g/m².', correct: true },
        { id: 'b', text: '75 g/m².', porque: 'É papel de impressora de casa; não aguenta a mochila.' },
        { id: 'c', text: '90 g/m².', porque: 'Serve ao miolo, que precisa dobrar; a capa precisa durar.' },
        { id: 'd', text: '120 g/m².', porque: 'Ainda é papel de miolo, fino para uma capa.' },
      ]},
      explanation: 'A tabela da gráfica oferece 250 ou 300 g/m² para capa.',
    },
    {
      id: 'DG5-M6-Q3', type: 'multiple_choice',
      prompt: 'Puseram o miolo em papel de 250 g/m². O que acontece?',
      data: { options: [
        { id: 'a', text: 'Não dobra direito no grampo.', correct: true },
        { id: 'b', text: 'As cores mudam.', porque: 'A gramatura mexe na espessura, e não na tinta.' },
        { id: 'c', text: 'O texto sai menor.', porque: 'O papel não muda o tamanho da letra.' },
        { id: 'd', text: 'Nada; fica melhor.', porque: 'Papel de capa no miolo deixa o boletim sem fechar.' },
      ]},
      explanation: 'O miolo precisa dobrar e não pesar: 75, 90 ou couché de 120 g/m².',
    },
    {
      id: 'DG5-M6-Q4', type: 'multiple_choice',
      prompt: 'Onde se descobre como a gráfica quer receber o arquivo?',
      data: { options: [
        { id: 'a', text: 'Na tabela de serviços dela.', correct: true },
        { id: 'b', text: 'No programa de diagramação.', porque: 'O programa não sabe o que cada gráfica pede.' },
        { id: 'c', text: 'Adivinhando pelo preço.', porque: 'O preço não diz o formato do arquivo.' },
        { id: 'd', text: 'Na primeira prova impressa.', porque: 'Aí o arquivo já foi, e o erro já custou.' },
      ]},
      explanation: 'Ou num orçamento pedido a ela: as exigências vêm escritas.',
    },
    {
      id: 'DG5-M6-Q5', type: 'multiple_choice',
      prompt: 'Por que escrever as exigências da gráfica?',
      data: { options: [
        { id: 'a', text: 'Para o próximo boletim sair certo.', correct: true },
        { id: 'b', text: 'Para a gráfica cobrar menos.', porque: 'O preço não muda por estar escrito.' },
        { id: 'c', text: 'Para pôr no boletim.', porque: 'É para quem prepara o arquivo, e não para quem lê.' },
        { id: 'd', text: 'Porque a lei manda.', porque: 'Nenhuma lei pede isso; é organização do clube.' },
      ]},
      explanation: 'Mesmo que outra pessoa prepare o arquivo, ela sabe o que mandar.',
    },
    {
      id: 'DG5-M6-Q6', type: 'true_false',
      prompt: 'As gráficas costumam pedir as fontes incorporadas ao PDF ou convertidas em curvas.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Sem a fonte, a gráfica troca a letra por outra.' },
      ]},
      explanation: 'É a lição de texto em curvas da CC-DG002, do lado da gráfica.',
    },
    {
      id: 'DG5-M6-Q7', type: 'true_false',
      prompt: 'Toda gráfica abre arquivo de editor de texto.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'A tabela da Gráfica Cerrado diz que não abre.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O que se manda é PDF; o editor de texto muda a página conforme o computador.',
    },
  ],

  /* ── Módulo 7 — a prova (requisitos 2.5 e 6) ──────────────────────────── */
  'm7-teoria': [
    {
      id: 'DG5-M7-Q1', type: 'multiple_choice',
      prompt: 'O que é a prova de impressão?',
      data: { options: [
        { id: 'a', text: 'Ver a peça antes de imprimir tudo.', correct: true },
        { id: 'b', text: 'O último exemplar da tiragem.', porque: 'Aí já se imprimiu tudo.' },
        { id: 'c', text: 'O recibo da gráfica.', porque: 'Recibo prova o pagamento, e não a cor.' },
        { id: 'd', text: 'Um teste de velocidade.', porque: 'Ela confere cor e montagem, e não velocidade.' },
      ]},
      explanation: 'Na tela, com as tintas simuladas, ou numa cópia de teste da gráfica.',
    },
    {
      id: 'DG5-M7-Q2', type: 'multiple_choice',
      prompt: 'Na prova da tela, quais cores do boletim mudam?',
      data: { options: [
        { id: 'a', text: 'O azul vivo e o laranja.', correct: true },
        { id: 'b', text: 'O roxo e o verde.', porque: 'Esses a tinta alcança, e ficam iguais.' },
        { id: 'c', text: 'Todas as cinco.', porque: 'Só mudam as que a tinta não alcança.' },
        { id: 'd', text: 'Só o escuro.', porque: 'Cor escura e pouco viva a tinta alcança.' },
      ]},
      explanation: '#00B3FF e #FF6A00 perdem o brilho; as outras três ficam como estão.',
    },
    {
      id: 'DG5-M7-Q3', type: 'multiple_choice',
      prompt: 'Por que o papel costuma sair menos vivo que a tela?',
      data: { options: [
        { id: 'a', text: 'Ele só reflete a luz da sala.', correct: true },
        { id: 'b', text: 'A gráfica economiza tinta.', porque: 'Com toda a tinta, a cor viva da tela continua fora de alcance.' },
        { id: 'c', text: 'A impressora é velha.', porque: 'Impressora nova também usa tinta e papel.' },
        { id: 'd', text: 'O arquivo estava em PDF.', porque: 'O PDF guarda a cor; quem muda é o meio.' },
      ]},
      explanation: 'A tela tem luz própria; o papel depende da luz que bate nele.',
    },
    {
      id: 'DG5-M7-Q4', type: 'multiple_choice',
      prompt: 'Como comparar a peça impressa com a tela?',
      data: { options: [
        { id: 'a', text: 'Lado a lado, na mesma luz.', correct: true },
        { id: 'b', text: 'De memória, no dia seguinte.', porque: 'A memória da cor engana muito.' },
        { id: 'c', text: 'Com a tela no brilho máximo.', porque: 'Brilho no máximo deixa a tela mais viva que qualquer papel.' },
        { id: 'd', text: 'Por uma foto do papel.', porque: 'A foto volta a ser tela, com outra cor.' },
      ]},
      explanation: 'E anotando cor por cor o que mudou, e por quê.',
    },
    {
      id: 'DG5-M7-Q5', type: 'multiple_choice',
      prompt: 'O laranja da agenda perdeu o brilho na prova. O que isso diz?',
      data: { options: [
        { id: 'a', text: 'A tinta não alcança aquela cor.', correct: true },
        { id: 'b', text: 'O programa está com defeito.', porque: 'O programa está avisando, e não errando.' },
        { id: 'c', text: 'O arquivo está corrompido.', porque: 'As outras cores ficaram iguais.' },
        { id: 'd', text: 'A foto tem pouco ppi.', porque: 'Resolução mexe na nitidez, e não na cor.' },
      ]},
      explanation: 'Dá para trocar por um laranja que a tinta alcança, ou aceitar sabendo.',
    },
    {
      id: 'DG5-M7-Q6', type: 'true_false',
      prompt: 'A prova impressa vale mais que a prova da tela.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Só a impressa tem o papel, a tinta e a luz de verdade.' },
      ]},
      explanation: 'A da tela avisa antes e economiza papel.',
    },
    {
      id: 'DG5-M7-Q7', type: 'true_false',
      prompt: 'Se uma cor muda na prova da tela, o boletim não pode ser impresso.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Pode; a prova só avisa o que vai mudar.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'A decisão de ajustar ou aceitar fica com quem diagrama, sabendo antes.',
    },
  ],
};
