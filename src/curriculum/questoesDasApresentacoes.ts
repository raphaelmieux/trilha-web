import type { Question } from '../types';

/*
 * As questões das lições de teoria da CC-ES011 Apresentações.
 *
 * ── O que elas medem ──────────────────────────────────────────────────────
 * A definição vale uma vez. Depois dela vêm consequência, discriminação e
 * diagnóstico — e nesta vereda o diagnóstico carrega quase tudo, porque toda
 * a matéria é feita de defeitos que **desenham bonito**: o mestre em que se
 * mexe e nada muda na tela; o ouro do clube a 2,42:1; a foto de 320 pixels
 * esticada; o slide de nove tópicos; o gráfico colado como imagem.
 *
 * ── E há um segundo eixo: o que parece a mesma coisa e não é ──────────────
 * Mestre e layout. Layout e caixa à mão. Cor diferente e contraste. Escurecer
 * a cor do clube e desistir dela. Nota do apresentador e roteiro na mão.
 * Vinculado e incorporado. Consolidar e empilhar. Cortar slide e cortar
 * palavra. Cada par tem uma questão que obriga a separá-los, porque confundi-
 * los é o que custa caro depois — e nenhum dá erro no dia em que se confunde.
 *
 * Toda alternativa errada diz por que está errada, no campo porque, e a certa
 * não carrega motivo nenhum: o porquê tem lugar próprio, o explanation. E nada
 * de crase nem de asterisco — a questão vai para o QuestionRenderer, que
 * imprime texto puro.
 *
 * A certa é uma afirmação curta, de propósito. O hábito de pôr o porquê dentro
 * dela entrega a resposta pelo tamanho, e quem nunca estudou passa escolhendo
 * a mais comprida. A conta se faz sobre esta vereda sozinha, porque diluída no
 * corpus ela não diz nada sobre o arquivo novo.
 *
 * ── Os números daqui são medidos ─────────────────────────────────────────
 * 2,42:1 do ouro, 3,48:1 do verde, 4,91:1 e 8,12:1 dos dois escurecidos, 768
 * pixels que a projeção pede de uma imagem a 40% de largura, 130 palavras por
 * minuto: nenhum foi escrito de cabeça.
 */

export const QUESTOES_DAS_APRESENTACOES: Record<string, Question[]> = {
  /* ──────────────────────────────────────────────────────────────────────
     Módulo 1 — O slide mestre (requisitos 2.1 e 4.1)
     ────────────────────────────────────────────────────────────────────── */
  'm1-teoria': [
    {
      id: 'ES11-M1-Q1', type: 'multiple_choice',
      prompt: 'O que é o slide mestre?',
      data: { options: [
        { id: 'a', text: 'A folha que diz a aparência de todos os slides.', correct: true },
        { id: 'b', text: 'O primeiro slide da apresentação.', porque: 'Esse é o slide de abertura. O mestre não se apresenta e não entra na contagem.' },
        { id: 'c', text: 'O arranjo das caixas de um slide.', porque: 'Isso é o layout: ele diz onde as caixas ficam, e o mestre diz como elas aparecem.' },
        { id: 'd', text: 'O slide que está selecionado na tira lateral.', porque: 'Esse é o slide atual, e mexer nele muda só ele.' },
      ]},
      explanation: 'O mestre guarda a aparência; os slides herdam dele. É o estilo de um documento, visto no PowerPoint.',
    },
    {
      id: 'ES11-M1-Q2', type: 'multiple_choice',
      prompt: 'Você troca a fonte do título no slide mestre, fecha o mestre, e nenhum slide muda. Por quê?',
      data: { options: [
        { id: 'a', text: 'Os títulos têm formatação aplicada à mão.', correct: true },
        { id: 'b', text: 'O mestre só vale para slides criados depois dele.', porque: 'O mestre vale para todos sempre: ele é lido na hora de desenhar cada slide.' },
        { id: 'c', text: 'A troca precisa ser salva antes de aparecer.', porque: 'A aparência muda na tela na hora; salvar grava o arquivo, e não aplica nada.' },
        { id: 'd', text: 'A fonte escolhida não existe no computador.', porque: 'Nesse caso o texto apareceria com outra fonte, e não com a de antes.' },
      ]},
      explanation: 'A formatação direta vence o mestre ao desenhar. Limpar Formatação tira a direta e deixa o mestre passar.',
    },
    {
      id: 'ES11-M1-Q3', type: 'multiple_choice',
      prompt: 'Qual é a consequência de formatar vinte slides um por um, em vez de usar o mestre?',
      data: { options: [
        { id: 'a', text: 'No dia da mudança, são vinte correções.', correct: true },
        { id: 'b', text: 'O arquivo fica maior e abre mais devagar.', porque: 'Formatação direta não pesa: o que pesa num arquivo de apresentação são as imagens.' },
        { id: 'c', text: 'O PowerPoint recusa a formatação direta.', porque: 'Ele a aceita e a aplica por cima do mestre, sem avisar nada.' },
        { id: 'd', text: 'A apresentação não abre em outra versão do programa.', porque: 'Ela abre. Formatação direta é parte do formato, e não uma extensão dele.' },
      ]},
      explanation: 'E a vigésima correção vai ficar diferente das dezenove, porque ninguém acerta vinte vezes seguidas.',
    },
    {
      id: 'ES11-M1-Q4', type: 'multiple_choice',
      prompt: 'O número do slide posto como campo e o número digitado no rodapé: qual é a diferença?',
      data: { options: [
        { id: 'a', text: 'O campo conta a folha; o digitado mostra sempre o mesmo.', correct: true },
        { id: 'b', text: 'O campo não aparece na impressão.', porque: 'Ele aparece: campo é conteúdo do documento, e não anotação de tela.' },
        { id: 'c', text: 'O digitado é mais confiável porque não depende do programa.', porque: 'Ele é confiável no dia em que se escreve, e erra em todas as folhas a partir da segunda.' },
        { id: 'd', text: 'Não há diferença enquanto a ordem dos slides não mudar.', porque: 'O digitado no mestre já sai errado sem mexer na ordem: ele mostra o mesmo número em toda folha.' },
      ]},
      explanation: 'É a mesma distinção do número de página da CC-ES002, e ela erra do mesmo jeito.',
    },
    {
      id: 'ES11-M1-Q5', type: 'multiple_choice',
      prompt: 'Onde se põe o logo do clube para que ele apareça em todos os slides?',
      data: { options: [
        { id: 'a', text: 'No slide mestre.', correct: true },
        { id: 'b', text: 'No primeiro slide, e os outros herdam dele.', porque: 'Slide não herda de slide: quem distribui aparência é o mestre.' },
        { id: 'c', text: 'Em cada slide, copiando e colando.', porque: 'Funciona, e cria vinte objetos que se arrastam sem querer e saem de posição.' },
        { id: 'd', text: 'No layout de Título e Conteúdo.', porque: 'Isso o põe só nos slides que usam aquele layout, e não nos cinco.' },
      ]},
      explanation: 'O que se repete em toda folha mora no mestre: logo, número, data.',
    },
    {
      id: 'ES11-M1-Q6', type: 'multiple_choice',
      prompt: 'Limpar Formatação num slide cujo título foi deixado em negrito 36pt faz o quê com o texto?',
      data: { options: [
        { id: 'a', text: 'Nada: as palavras ficam as mesmas.', correct: true },
        { id: 'b', text: 'Apaga o texto junto com a formatação.', porque: 'Isso é apagar o conteúdo. Limpar Formatação não encosta nas palavras.' },
        { id: 'c', text: 'Devolve o texto à caixa do layout.', porque: 'Posição é layout, e Limpar Formatação não mexe em posição nenhuma.' },
        { id: 'd', text: 'Converte o negrito em estilo do mestre.', porque: 'Ele remove a direta; o que vale depois é o que o mestre já dizia.' },
      ]},
      explanation: 'Por isso redigitar o slide "também resolve" — e é como se perde um slide inteiro sem perceber.',
    },
    {
      id: 'ES11-M1-Q7', type: 'true_false',
      prompt: 'Trocar o tema de design reescreve o slide mestre.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'O tema é um mestre pronto: ele troca cores, fontes e fundo de uma vez, que é exatamente o que mexer no mestre faz.' },
      ]},
      explanation: 'O tema é um mestre pronto: escolhê-lo troca cores, fontes e fundo de todos os slides de uma vez.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 2 — Layout (requisitos 2.2 e 4.2)
     ────────────────────────────────────────────────────────────────────── */
  'm2-teoria': [
    {
      id: 'ES11-M2-Q1', type: 'multiple_choice',
      prompt: 'O que é o layout de um slide?',
      data: { options: [
        { id: 'a', text: 'O arranjo dos espaços reservados dele.', correct: true },
        { id: 'b', text: 'O conjunto de cores e fontes da apresentação.', porque: 'Isso é o tema, que escreve o mestre. Layout é posição.' },
        { id: 'c', text: 'A ordem em que os slides aparecem.', porque: 'Essa é a sequência, que se muda na tira lateral.' },
        { id: 'd', text: 'O tamanho da folha, 16:9 ou 4:3.', porque: 'Esse é o tamanho do slide, em Design, e vale para a apresentação inteira.' },
      ]},
      explanation: 'O layout diz onde as caixas ficam; o mestre diz como elas aparecem. São duas perguntas diferentes.',
    },
    {
      id: 'ES11-M2-Q2', type: 'multiple_choice',
      prompt: 'Por que o título desalinhado não aparece quando se revisa a apresentação slide por slide?',
      data: { options: [
        { id: 'a', text: 'Porque o defeito é a diferença entre dois slides.', correct: true },
        { id: 'b', text: 'Porque a diferença é pequena demais para ser vista.', porque: 'Ela é bem visível na troca: o olho acompanha o título pulando.' },
        { id: 'c', text: 'Porque o modo de edição mostra o slide esticado.', porque: 'Ele mostra o slide na proporção certa; o que falta é a comparação com o seguinte.' },
        { id: 'd', text: 'Porque o PowerPoint alinha as caixas ao salvar.', porque: 'Ele não alinha nada: a caixa fica onde a mão soltou.' },
      ]},
      explanation: 'Cada slide está perfeito. Só passando a apresentação o pulo aparece.',
    },
    {
      id: 'ES11-M2-Q3', type: 'multiple_choice',
      prompt: 'Você aplica o layout Título e Conteúdo num slide que tinha uma caixa de texto desenhada à mão. O que acontece com o texto dela?',
      data: { options: [
        { id: 'a', text: 'Ele vai para o espaço reservado, e a caixa deixa de existir.', correct: true },
        { id: 'b', text: 'Ele fica na caixa, por cima do espaço reservado.', porque: 'Aí o texto apareceria duas vezes, e o slide ficaria pior do que estava.' },
        { id: 'c', text: 'Ele é apagado, porque o layout não o previa.', porque: 'Nada de texto se perde ao trocar de layout: o que muda é onde ele cai.' },
        { id: 'd', text: 'A caixa é redesenhada na posição do layout.', porque: 'Caixa à mão não vira espaço reservado; ela sai, e o texto entra no espaço.' },
      ]},
      explanation: 'Aplicar o layout move o texto. É por isso que a tarefa confere que não sobrou caixa nenhuma.',
    },
    {
      id: 'ES11-M2-Q4', type: 'multiple_choice',
      prompt: 'Qual layout serve ao slide de abertura de uma apresentação?',
      data: { options: [
        { id: 'a', text: 'Slide de Título.', correct: true },
        { id: 'b', text: 'Título e Conteúdo.', porque: 'Funciona, e deixa a abertura com cara de slide do meio: título em cima, lista embaixo.' },
        { id: 'c', text: 'Em Branco, para desenhar o título onde ficar melhor.', porque: 'É daqui que saem as caixas à mão, e com elas o título que pula.' },
        { id: 'd', text: 'Somente Título, porque a abertura não tem corpo.', porque: 'A abertura costuma ter subtítulo — o nome do clube, a data —, e o Slide de Título reserva lugar para ele.' },
      ]},
      explanation: 'Ele é centrado, com o subtítulo embaixo: é o arranjo que diz "isto está começando".',
    },
    {
      id: 'ES11-M2-Q5', type: 'multiple_choice',
      prompt: 'Trocar o layout de um slide muda a cor do título dele?',
      data: { options: [
        { id: 'a', text: 'Não: cor é do mestre, e layout é posição.', correct: true },
        { id: 'b', text: 'Sim, cada layout tem a paleta dele.', porque: 'Paleta é do tema, que vale para todos os layouts da apresentação.' },
        { id: 'c', text: 'Só se o slide não tiver formatação direta.', porque: 'A direta muda a conta de quem ganha, e não muda o fato de layout ser posição.' },
        { id: 'd', text: 'Sim, porque o layout substitui o mestre naquele slide.', porque: 'Os dois valem juntos: um responde pela posição, o outro pela aparência.' },
      ]},
      explanation: 'Mestre e layout respondem a perguntas diferentes, e é por isso que se mexe nos dois.',
    },
    {
      id: 'ES11-M2-Q6', type: 'multiple_choice',
      prompt: 'De qual layout parte quem desenha caixas de texto à mão?',
      data: { options: [
        { id: 'a', text: 'Em Branco.', correct: true },
        { id: 'b', text: 'Slide de Título.', porque: 'Nele há espaço reservado para título e subtítulo, e o texto cai neles.' },
        { id: 'c', text: 'Duas Partes de Conteúdo.', porque: 'Ele reserva três espaços, e quem usa espaço reservado não está desenhando à mão.' },
        { id: 'd', text: 'De qualquer um: a caixa se desenha em todos.', porque: 'Desenha, sim — mas quem parte de um layout com espaço reservado normalmente escreve nele.' },
      ]},
      explanation: 'Em Branco não reserva nada, então o texto não tem onde cair. É o layout mais honesto e o mais perigoso.',
    },
    {
      id: 'ES11-M2-Q7', type: 'true_false',
      prompt: 'O espaço reservado do título cai na mesma posição em todos os slides que usam o mesmo layout.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'A posição é do layout, e é fixa. O que varia de slide para slide é a caixa desenhada à mão.' },
      ]},
      explanation: 'É isso que o layout é, e é o que a caixa à mão não dá.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 3 — Hierarquia visual (requisito 2.3)
     ────────────────────────────────────────────────────────────────────── */
  'm3-teoria': [
    {
      id: 'ES11-M3-Q1', type: 'multiple_choice',
      prompt: 'O que é hierarquia visual num slide?',
      data: { options: [
        { id: 'a', text: 'A ordem em que o olho lê o que está ali.', correct: true },
        { id: 'b', text: 'A ordem em que os slides se sucedem.', porque: 'Essa é a sequência da apresentação, e se muda na tira lateral.' },
        { id: 'c', text: 'O recuo dos tópicos de segundo nível.', porque: 'Esse é um dos recursos que a criam, e não a hierarquia em si.' },
        { id: 'd', text: 'O número de slides que cada assunto recebe.', porque: 'Essa é a estrutura da apresentação, e vale para o conjunto.' },
      ]},
      explanation: 'Ela existe sempre. A escolha é se ela é a que você quis, ou a que saiu por acaso.',
    },
    {
      id: 'ES11-M3-Q2', type: 'multiple_choice',
      prompt: 'O que acontece num slide cujo título e cujos tópicos têm o mesmo tamanho?',
      data: { options: [
        { id: 'a', text: 'Cada pessoa da sala começa a ler num lugar diferente.', correct: true },
        { id: 'b', text: 'O slide fica mais limpo, porque não há contraste de tamanho.', porque: 'Limpo é o slide com pouca coisa. Esse tem a mesma coisa sem ordem de leitura.' },
        { id: 'c', text: 'O PowerPoint avisa que falta hierarquia.', porque: 'Ele não avisa: o slide está formatado, e nada ali está inválido.' },
        { id: 'd', text: 'A plateia lê o título por último.', porque: 'Não há "por último" quando nada se destaca: o olho começa onde cair.' },
      ]},
      explanation: 'Sem ordem de leitura, o slide não está feio: está sem instrução de leitura.',
    },
    {
      id: 'ES11-M3-Q3', type: 'multiple_choice',
      prompt: 'Qual é o efeito, sobre quem assiste, de um tópico de vinte palavras?',
      data: { options: [
        { id: 'a', text: 'A plateia lê e para de ouvir quem fala.', correct: true },
        { id: 'b', text: 'A plateia perde o fio e pede para repetir.', porque: 'Ela não perde o fio: ela lê o slide inteiro mais rápido do que você o explica.' },
        { id: 'c', text: 'A fonte diminui e o texto fica ilegível de longe.', porque: 'Isso é o ajuste automático de texto, e é um sintoma. O efeito na sala é outro.' },
        { id: 'd', text: 'A apresentação passa do tempo combinado.', porque: 'Quem lê o slide em voz alta até ganha tempo. O que se perde é a atenção.' },
      ]},
      explanation: 'Ler é mais rápido que ouvir: em três segundos todos terminaram, e você está na primeira frase.',
    },
    {
      id: 'ES11-M3-Q4', type: 'multiple_choice',
      prompt: 'Sobrou espaço no slide depois de encurtar os tópicos. O que fazer?',
      data: { options: [
        { id: 'a', text: 'Deixar o espaço vazio.', correct: true },
        { id: 'b', text: 'Aumentar o corpo até o texto preencher a folha.', porque: 'É o jeito mais rápido de destruir a hierarquia, porque o corpo encosta no tamanho do título.' },
        { id: 'c', text: 'Trazer de volta um tópico que havia sido cortado.', porque: 'Encher o espaço com o que se decidiu cortar desfaz a decisão por causa do espaço.' },
        { id: 'd', text: 'Esticar a imagem até ela ocupar o resto.', porque: 'Esticar imagem além do que ela tem é o defeito do requisito 4.3, e aqui seria por decoração.' },
      ]},
      explanation: 'Espaço vazio num slide não é defeito: é o que faz o que está ali ser lido.',
    },
    {
      id: 'ES11-M3-Q5', type: 'multiple_choice',
      prompt: 'Um slide tem nove tópicos, todos curtos. Qual é o problema?',
      data: { options: [
        { id: 'a', text: 'Nove itens iguais não têm hierarquia: são uma lista.', correct: true },
        { id: 'b', text: 'Nenhum: tópicos curtos são o que se recomenda.', porque: 'Curtos, sim — e nove deles projetados ninguém lê: procura-se o próprio nome e desiste-se.' },
        { id: 'c', text: 'Os tópicos vão ficar pequenos demais para o telão.', porque: 'Podem ficar, e o problema existe mesmo com todos legíveis.' },
        { id: 'd', text: 'O slide vai passar do orçamento de vinte palavras.', porque: 'Nove tópicos de duas palavras cabem no orçamento, e continuam não se lendo.' },
      ]},
      explanation: 'Seis é o teto prático. Acima dele, divida em dois slides ou corte o que a plateia não vai anotar.',
    },
    {
      id: 'ES11-M3-Q6', type: 'multiple_choice',
      prompt: 'Onde vai o que sobrou de um tópico que foi encurtado?',
      data: { options: [
        { id: 'a', text: 'Para a nota do apresentador.', correct: true },
        { id: 'b', text: 'Para um slide novo, sobre o mesmo assunto.', porque: 'Isso dobra o número de slides com a mesma informação, e o requisito 6 limita a dez.' },
        { id: 'c', text: 'Fora: se não cabe no slide, não é importante.', porque: 'Quase tudo o que se fala não cabe no slide, e nada disso é dispensável.' },
        { id: 'd', text: 'Para o segundo nível de tópicos, com recuo.', porque: 'O recuo põe a mesma frase no telão, um pouco mais à direita.' },
      ]},
      explanation: 'O slide fica com o que a plateia vai anotar; a nota, com o que ela vai ouvir.',
    },
    {
      id: 'ES11-M3-Q7', type: 'true_false',
      prompt: 'Dois pontos de diferença entre o título e o corpo já criam hierarquia a cinco metros do telão.',
      data: { options: [
        { id: 'f', text: 'Falso', correct: true },
        { id: 'v', text: 'Verdadeiro', porque: 'Dois pontos são invisíveis a essa distância. A diferença precisa ser grande o bastante para se ler de longe — metade a mais já funciona.' },
      ]},
      explanation: 'Hierarquia que só se vê no monitor não é hierarquia na sala.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 4 — Contraste (requisito 2.5)
     ────────────────────────────────────────────────────────────────────── */
  'm4-teoria': [
    {
      id: 'ES11-M4-Q1', type: 'multiple_choice',
      prompt: 'O que é contraste, entre um texto e o fundo dele?',
      data: { options: [
        { id: 'a', text: 'A diferença de luminosidade entre as duas cores.', correct: true },
        { id: 'b', text: 'A diferença de matiz entre as duas cores.', porque: 'Duas cores de matizes bem diferentes podem ter a mesma luminosidade, e aí o texto desaparece.' },
        { id: 'c', text: 'A saturação da cor do texto.', porque: 'Saturação é quanto a cor é viva. Um vermelho vivo sobre preto continua ilegível.' },
        { id: 'd', text: 'O brilho que o projetor consegue dar.', porque: 'Esse é o equipamento, e ele piora o contraste da cor — não o define.' },
      ]},
      explanation: 'Ele se escreve como razão, de 1:1 a 21:1, e se mede com a mesma conta de todo verificador de acessibilidade.',
    },
    {
      id: 'ES11-M4-Q2', type: 'multiple_choice',
      prompt: 'O verde da camisa do clube mede 3,48:1 sobre o branco. O que isso quer dizer?',
      data: { options: [
        { id: 'a', text: 'Serve a título grande e não serve a texto corrido.', correct: true },
        { id: 'b', text: 'Não serve a nada: está abaixo de 4,5:1.', porque: 'O corte de 4,5:1 é para texto corrido; texto grande passa com 3:1.' },
        { id: 'c', text: 'Serve a tudo: está acima de 3:1.', porque: 'Acima de 3:1 serve ao título. O corpo pede 4,5:1, e ele fica abaixo.' },
        { id: 'd', text: 'Serve no monitor e não no telão, em qualquer tamanho.', porque: 'A medida não depende da tela: ela é das duas cores. O telão piora o que já está medido.' },
      ]},
      explanation: 'É o caso cruel: uma cor que funciona num lugar e reprova no outro é a que ninguém desconfia.',
    },
    {
      id: 'ES11-M4-Q3', type: 'multiple_choice',
      prompt: 'Onde o PowerPoint relata que um texto está com contraste insuficiente?',
      data: { options: [
        { id: 'a', text: 'Em Revisão, no Verificar Acessibilidade.', correct: true },
        { id: 'b', text: 'No seletor de cor, ao lado de cada tom.', porque: 'O seletor oferece os tons e não mede nenhum deles.' },
        { id: 'c', text: 'Na régua de status, junto do número do slide.', porque: 'A régua conta slides e palavras; ela não julga cor nenhuma.' },
        { id: 'd', text: 'Em Design, ao escolher o tema.', porque: 'Escolher o tema troca a paleta inteira, sem relatar medida nenhuma.' },
      ]},
      explanation: 'Ele escreve "Texto com contraste insuficiente" e diz onde — e não diz se a sua apresentação está pronta.',
    },
    {
      id: 'ES11-M4-Q4', type: 'multiple_choice',
      prompt: 'O ouro do clube não se lê. Qual conserto mantém a identidade?',
      data: { options: [
        { id: 'a', text: 'Escurecer o mesmo ouro até ele passar.', correct: true },
        { id: 'b', text: 'Pintar o título de preto.', porque: 'Resolve a conta e joga a identidade fora: preto não é cor de clube nenhum.' },
        { id: 'c', text: 'Deixar o ouro e aumentar o tamanho do título.', porque: 'Tamanho ajuda e não resolve: a 2,42:1 o texto não está lá, de nenhum tamanho.' },
        { id: 'd', text: 'Pôr uma sombra atrás do texto ouro.', porque: 'Sombra é remendo: ela suja a letra e o contraste continua decidido pelas duas cores.' },
      ]},
      explanation: 'A coluna de tons do seletor existe para isso: 50% mais escuro leva o ouro de 2,42:1 a 4,91:1.',
    },
    {
      id: 'ES11-M4-Q5', type: 'multiple_choice',
      prompt: 'Por que um slide que se lê no monitor pode não se ler no telão?',
      data: { options: [
        { id: 'a', text: 'A luz da sala lava a cor projetada.', correct: true },
        { id: 'b', text: 'O projetor mostra menos cores que o monitor.', porque: 'Mostra, e o que derruba a leitura numa sala com luz é o contraste, e não a quantidade de cores.' },
        { id: 'c', text: 'O PowerPoint reduz a qualidade na projeção.', porque: 'Ele não reduz nada: o slide é desenhado do mesmo jeito.' },
        { id: 'd', text: 'A proporção do telão corta as bordas do slide.', porque: 'Isso acontece com proporção errada, e é outro problema — ele corta, não apaga o texto.' },
      ]},
      explanation: 'Por isso vale mirar 4,5:1 para tudo num slide: o que sobra de contraste na sala é menos do que o monitor mostrou.',
    },
    {
      id: 'ES11-M4-Q6', type: 'multiple_choice',
      prompt: 'Além de contraste, o que um destaque feito só com cor deixa de fora?',
      data: { options: [
        { id: 'a', text: 'Quem não distingue aquelas duas cores.', correct: true },
        { id: 'b', text: 'Quem está vendo a apresentação impressa em cores.', porque: 'Em cores a distinção continua lá. O problema é com quem não a percebe, e com o preto e branco.' },
        { id: 'c', text: 'Quem usa o modo escuro do PowerPoint.', porque: 'O modo escuro muda a interface do programa, e não o slide.' },
        { id: 'd', text: 'Ninguém: cor é o destaque mais forte que existe.', porque: 'Cor é forte para quem a vê. Um em doze homens não distingue vermelho de verde.' },
      ]},
      explanation: 'É a mesma razão de a insígnia desta plataforma ter forma e cor: cor sozinha não se lê.',
    },
    {
      id: 'ES11-M4-Q7', type: 'true_false',
      prompt: 'Clarear o fundo também é um jeito de resolver contraste insuficiente.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Contraste é a relação entre as duas cores, e não uma propriedade do texto: mexer em qualquer uma das duas muda a medida.' },
      ]},
      explanation: 'Às vezes é o conserto certo, e às vezes o fundo é a identidade e quem cede é o texto.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 5 — Os três erros (requisito 3)
     ────────────────────────────────────────────────────────────────────── */
  'm5-teoria': [
    {
      id: 'ES11-M5-Q1', type: 'multiple_choice',
      prompt: 'O requisito pede três erros frequentes e o efeito de cada um. Sobre quem é o efeito?',
      data: { options: [
        { id: 'a', text: 'Sobre quem assiste.', correct: true },
        { id: 'b', text: 'Sobre o arquivo da apresentação.', porque: 'Peso e tempo de abrir são problemas de outra natureza, do requisito 4.3.' },
        { id: 'c', text: 'Sobre quem apresenta.', porque: 'Ele também sofre, e o requisito pergunta pela sala: é ela que o erro alcança.' },
        { id: 'd', text: 'Sobre o computador do clube.', porque: 'Esse é o problema de compatibilidade, e não o de uma apresentação mal montada.' },
      ]},
      explanation: 'É a metade do conselho que ninguém escreve, e a que faz ele grudar.',
    },
    {
      id: 'ES11-M5-Q2', type: 'multiple_choice',
      prompt: 'Qual destes não é efeito de um erro de apresentação sobre quem assiste?',
      data: { options: [
        { id: 'a', text: 'O arquivo demorar para abrir.', correct: true },
        { id: 'b', text: 'A plateia ler o slide e parar de ouvir.', porque: 'Esse é o efeito do slide que traz a fala escrita, e é sobre quem assiste.' },
        { id: 'c', text: 'Quem senta atrás desistir e olhar o celular.', porque: 'Esse é o efeito do contraste insuficiente, e é sobre quem assiste.' },
        { id: 'd', text: 'A plateia não saber o que precisa anotar.', porque: 'Esse é o efeito da falta de hierarquia, e é sobre quem assiste.' },
      ]},
      explanation: 'O peso do arquivo é um problema real, e de outra natureza: ele acontece antes de a sala existir.',
    },
    {
      id: 'ES11-M5-Q3', type: 'multiple_choice',
      prompt: 'Qual é o gesto que acha os três erros de uma vez?',
      data: { options: [
        { id: 'a', text: 'Passar a apresentação de longe, com a luz como ela vai estar.', correct: true },
        { id: 'b', text: 'Revisar slide por slide no modo de edição.', porque: 'É de onde nenhum dos três se vê: o monitor tem contraste de sobra e está perto do olho.' },
        { id: 'c', text: 'Rodar o Verificar Acessibilidade.', porque: 'Ele acha o contraste e não fala de texto demais nem de hierarquia.' },
        { id: 'd', text: 'Pedir para alguém ler os slides no celular.', porque: 'No celular o texto fica perto do olho, que é o contrário da condição da sala.' },
      ]},
      explanation: 'Todo defeito desta vereda é invisível de onde se monta a apresentação.',
    },
    {
      id: 'ES11-M5-Q4', type: 'multiple_choice',
      prompt: 'A fonte do slide não é a da identidade do clube. Por que isso não está entre os três erros?',
      data: { options: [
        { id: 'a', text: 'Porque não muda nada para quem assiste.', correct: true },
        { id: 'b', text: 'Porque fonte é escolha do tema, e não erro.', porque: 'Pode ser erro de identidade visual. O que ele não é, é efeito sobre a sala.' },
        { id: 'c', text: 'Porque ninguém repara em fonte numa apresentação.', porque: 'Repara-se, e continua não atrapalhando a leitura nem a atenção.' },
        { id: 'd', text: 'Porque o mestre conserta isso de uma vez.', porque: 'Conserta, e o requisito pergunta pelo efeito, e não pela facilidade do conserto.' },
      ]},
      explanation: 'O efeito sobre quem assiste é o que separa erro de verdade de erro de gosto.',
    },
    {
      id: 'ES11-M5-Q5', type: 'multiple_choice',
      prompt: 'Por que dizer o efeito faz o conselho grudar?',
      data: { options: [
        { id: 'a', text: 'Porque "não faça" se esquece, e a consequência não.', correct: true },
        { id: 'b', text: 'Porque o efeito é mais fácil de decorar.', porque: 'Não é questão de decorar: é de saber por que a regra existe.' },
        { id: 'c', text: 'Porque o efeito permite medir a apresentação.', porque: 'Nada disso se mede num número. O que ele dá é razão, e não medida.' },
        { id: 'd', text: 'Porque quem sabe o efeito pode ignorar a regra.', porque: 'Quem sabe o efeito sabe quando a regra vale, que é o contrário de ignorá-la.' },
      ]},
      explanation: '"Não ponha texto demais" se esquece; "a plateia lê e para de ouvir você" não.',
    },
    {
      id: 'ES11-M5-Q6', type: 'multiple_choice',
      prompt: 'Qual erro corresponde ao efeito "a plateia não sabe o que precisa anotar"?',
      data: { options: [
        { id: 'a', text: 'Tudo no slide tem o mesmo peso.', correct: true },
        { id: 'b', text: 'O slide traz a fala escrita.', porque: 'Esse faz a plateia ler em vez de ouvir: ela sabe o que anotar, e não está prestando atenção em você.' },
        { id: 'c', text: 'A cor não se lê de longe.', porque: 'Esse faz quem está no fundo desistir: ele não lê nada, e não é questão de escolher o que anotar.' },
        { id: 'd', text: 'A apresentação tem slides demais.', porque: 'Esse faz passar do tempo. Dentro de cada slide a hierarquia pode estar perfeita.' },
      ]},
      explanation: 'Sem hierarquia, o valor que decide a inscrição sai igualzinho às quatro linhas acima dele.',
    },
    {
      id: 'ES11-M5-Q7', type: 'true_false',
      prompt: 'Se não houver telão para ensaiar, afastar-se três metros do monitor dá uma ideia do que a sala vê.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'É uma aproximação grosseira e funciona para o essencial: o que você não consegue ler de três metros, ninguém lê no fundo da sala.' },
      ]},
      explanation: 'A distância do olho é metade do problema; a luz da sala é a outra.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 6 — A imagem (requisito 4.3)
     ────────────────────────────────────────────────────────────────────── */
  'm6-teoria': [
    {
      id: 'ES11-M6-Q1', type: 'multiple_choice',
      prompt: 'Uma imagem ocupa 40% da largura de um slide. Quantos pixels de largura a projeção de 1920 usa dela?',
      data: { options: [
        { id: 'a', text: '768.', correct: true },
        { id: 'b', text: '1920, porque é a largura do telão.', porque: 'Essa é a largura do slide inteiro; a imagem recebe a fração dela que ela ocupa.' },
        { id: 'c', text: 'Depende do tamanho do arquivo da imagem.', porque: 'O arquivo diz o que ela tem; a projeção diz o que ela precisa, e esta conta é a segunda.' },
        { id: 'd', text: '480, que é 25% de 1920.', porque: 'Essa é a conta para uma imagem a 25% de largura, e esta está a 40%.' },
      ]},
      explanation: '40% de 1920 é 768. É esse número que diz se o arquivo serve.',
    },
    {
      id: 'ES11-M6-Q2', type: 'multiple_choice',
      prompt: 'Um logo tem 320 pixels de largura e está ocupando quase metade do slide. O que acontece na projeção?',
      data: { options: [
        { id: 'a', text: 'Ele é esticado e sai serrilhado.', correct: true },
        { id: 'b', text: 'Ele aparece pequeno, no tamanho que tem.', porque: 'Imagem não aparece em pixels do arquivo: ela é desenhada no espaço que você deu a ela.' },
        { id: 'c', text: 'O PowerPoint avisa que a resolução é baixa.', porque: 'Ele não avisa nada: o slide está correto e a imagem está inserida.' },
        { id: 'd', text: 'Nada: ele fica igual ao que você vê no monitor.', porque: 'No monitor ele fica bom, porque a tela é menor e está mais perto do seu olho.' },
      ]},
      explanation: 'A projeção pede 883 pixels e o arquivo tem 320: cada pixel dele cobre quase três do telão.',
    },
    {
      id: 'ES11-M6-Q3', type: 'multiple_choice',
      prompt: 'A mesma foto de 800 pixels serve a 25% da largura do slide e não serve a 100%. Por quê?',
      data: { options: [
        { id: 'a', text: 'Porque resolução adequada depende do tamanho em que ela entra.', correct: true },
        { id: 'b', text: 'Porque a 100% o PowerPoint recorta a imagem.', porque: 'Ele não recorta: ele estica, e é o esticamento que serrilha.' },
        { id: 'c', text: 'Porque a 25% ela é comprimida e fica mais nítida.', porque: 'Comprimir nunca aumenta nitidez. O que muda é quantos pixels a projeção pede dela.' },
        { id: 'd', text: 'Porque o arquivo muda de tamanho quando se redimensiona.', porque: 'Redimensionar no slide não mexe no arquivo: os 800 pixels continuam 800.' },
      ]},
      explanation: 'A 25% a projeção pede 480 e ela tem 800; a 100% pede 1920 e ela continua com 800.',
    },
    {
      id: 'ES11-M6-Q4', type: 'multiple_choice',
      prompt: 'Qual é o problema de uma foto de doze megapixels num slide?',
      data: { options: [
        { id: 'a', text: 'O arquivo pesa e não passa por anexo de e-mail.', correct: true },
        { id: 'b', text: 'Ela fica serrilhada, porque tem pixel demais.', porque: 'Pixel demais nunca serrilha: o excesso é jogado fora na hora de desenhar.' },
        { id: 'c', text: 'O PowerPoint reduz a qualidade dela sozinho.', porque: 'Ele guarda o arquivo inteiro. Reduzir é um comando que alguém precisa dar.' },
        { id: 'd', text: 'Ela aparece maior do que o espaço reservado.', porque: 'Ela entra no espaço que você der. Pixels do arquivo não definem tamanho na tela.' },
      ]},
      explanation: 'Três fotos de celular fazem dez megabytes, e o computador do clube demora a abrir.',
    },
    {
      id: 'ES11-M6-Q5', type: 'multiple_choice',
      prompt: 'Na caixa Compactar Imagens, o que a opção de 96 ppi custa?',
      data: { options: [
        { id: 'a', text: 'A imagem fica abaixo do que o telão mostra.', correct: true },
        { id: 'b', text: 'Nada: ela é a opção recomendada para apresentar.', porque: 'Ela é a de e-mail, e encolhe mais do que a projeção aceita.' },
        { id: 'c', text: 'Ela aumenta o arquivo em vez de reduzir.', porque: 'Ela reduz, e muito: o problema é reduzir além do que a projeção precisa.' },
        { id: 'd', text: 'Ela converte a foto em preto e branco.', porque: 'Compactar mexe em quantidade de pixel, e não em cor.' },
      ]},
      explanation: 'A 40% de largura, 96 ppi deixa 512 pixels onde a projeção pede 768.',
    },
    {
      id: 'ES11-M6-Q6', type: 'multiple_choice',
      prompt: 'Qual ordem de gestos não desperdiça trabalho?',
      data: { options: [
        { id: 'a', text: 'Escolher as fotos e então compactar.', correct: true },
        { id: 'b', text: 'Compactar e então trocar uma foto por outra.', porque: 'A foto nova entra com o tamanho original, e o arquivo volta a pesar: é compactar duas vezes.' },
        { id: 'c', text: 'Compactar a cada foto inserida.', porque: 'Funciona e é trabalho repetido; e cada passagem destrói pixel de novo.' },
        { id: 'd', text: 'Compactar antes de inserir qualquer foto.', porque: 'Não há o que compactar: o comando age sobre as imagens que já estão no arquivo.' },
      ]},
      explanation: 'É a mesma aritmética da CC-ES004, onde comprimir antes de reconhecer custa o texto.',
    },
    {
      id: 'ES11-M6-Q7', type: 'true_false',
      prompt: 'Compactar Imagens pode ser desfeito depois de fechar e reabrir o arquivo.',
      data: { options: [
        { id: 'f', text: 'Falso', correct: true },
        { id: 'v', text: 'Verdadeiro', porque: 'Os pixels retirados não estão mais no arquivo. O Ctrl+Z alcança enquanto ele não foi fechado, e depois disso não há de onde voltar.' },
      ]},
      explanation: 'Guarde os originais em outro lugar antes de compactar.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 7 — O gráfico (requisito 4.4)
     ────────────────────────────────────────────────────────────────────── */
  'm7-teoria': [
    {
      id: 'ES11-M7-Q1', type: 'multiple_choice',
      prompt: 'Os custos de um slide foram digitados em junho, e a planilha mudou em julho. O que a tela mostra?',
      data: { options: [
        { id: 'a', text: 'Os valores de junho, sem aviso nenhum.', correct: true },
        { id: 'b', text: 'Os valores de julho, porque o slide lê a planilha.', porque: 'Número digitado não lê nada: ele é texto no slide.' },
        { id: 'c', text: 'Um aviso de que os dados estão desatualizados.', porque: 'Não há como o PowerPoint saber: para ele são palavras num tópico.' },
        { id: 'd', text: 'Um erro no lugar do total.', porque: 'Não há conta nenhuma para dar erro. O total também foi digitado.' },
      ]},
      explanation: 'É a família do número guardado que não responde por hoje. O slide está certo, bem formatado, e errado.',
    },
    {
      id: 'ES11-M7-Q2', type: 'multiple_choice',
      prompt: 'Colado como imagem, um gráfico da planilha faz o quê quando a planilha muda?',
      data: { options: [
        { id: 'a', text: 'Nada: ele mostra o retrato de quando foi colado.', correct: true },
        { id: 'b', text: 'Fica em branco, porque perdeu a origem.', porque: 'Esse é o vinculado sem a planilha ao lado. A imagem não precisa de origem nenhuma.' },
        { id: 'c', text: 'Atualiza ao abrir o arquivo.', porque: 'Imagem é desenho: não há o que atualizar nela.' },
        { id: 'd', text: 'Mostra um aviso de que está desatualizado.', porque: 'Ele não tem como saber que a planilha mudou: não há ligação nenhuma.' },
      ]},
      explanation: 'A apresentação do ano que vem mostra os números do ano passado, com cara de gráfico certo.',
    },
    {
      id: 'ES11-M7-Q3', type: 'multiple_choice',
      prompt: 'Qual colagem acompanha a planilha e viaja sozinha no arquivo?',
      data: { options: [
        { id: 'a', text: 'Incorporada.', correct: true },
        { id: 'b', text: 'Vinculada aos dados.', porque: 'Ela acompanha e precisa que a planilha viaje junto: sem ela, o quadro fica vazio.' },
        { id: 'c', text: 'Como imagem.', porque: 'Ela viaja sozinha e não acompanha nada: os números são os de quando se colou.' },
        { id: 'd', text: 'Qualquer uma: as três guardam uma cópia dos dados.', porque: 'Só a incorporada guarda a planilha dentro do arquivo.' },
      ]},
      explanation: 'Ela leva uma cópia da planilha dentro do arquivo da apresentação, e é por isso que é o padrão.',
    },
    {
      id: 'ES11-M7-Q4', type: 'multiple_choice',
      prompt: 'Um gráfico vinculado some do slide no computador do clube. O que aconteceu?',
      data: { options: [
        { id: 'a', text: 'A planilha não foi junto com a apresentação.', correct: true },
        { id: 'b', text: 'A versão do PowerPoint lá é mais antiga.', porque: 'Gráfico vinculado é parte do formato há muitas versões: o que falta é o arquivo de origem.' },
        { id: 'c', text: 'O gráfico foi colado como imagem.', porque: 'Como imagem ele apareceria: imagem não depende de arquivo nenhum.' },
        { id: 'd', text: 'A planilha mudou e o vínculo foi desfeito.', porque: 'Mudança de conteúdo o atualiza. O que o quebra é a planilha não estar lá.' },
      ]},
      explanation: 'É a família do vídeo vinculado da AP044: a diferença aparece longe de casa.',
    },
    {
      id: 'ES11-M7-Q5', type: 'multiple_choice',
      prompt: 'Quando colar como imagem é a escolha certa?',
      data: { options: [
        { id: 'a', text: 'Quando você quer congelar o retrato de um momento.', correct: true },
        { id: 'b', text: 'Quando o arquivo precisa ficar leve.', porque: 'Imagem de gráfico não é mais leve que a planilha incorporada, que são só números.' },
        { id: 'c', text: 'Quando a apresentação vai ser enviada por e-mail.', porque: 'A incorporada também viaja sozinha, e continua acompanhando a mudança.' },
        { id: 'd', text: 'Nunca: imagem é sempre o caminho errado.', porque: 'O orçamento aprovado em março é um retrato, e congelar é exatamente o que se quer dele.' },
      ]},
      explanation: 'O erro não é congelar: é congelar sem saber que congelou.',
    },
    {
      id: 'ES11-M7-Q6', type: 'multiple_choice',
      prompt: 'Qual é a vantagem de trazer o gráfico em vez de digitar os números?',
      data: { options: [
        { id: 'a', text: 'Não há o que conferir contra a planilha depois.', correct: true },
        { id: 'b', text: 'O gráfico é mais bonito que uma lista de valores.', porque: 'Às vezes é, e a lista pode ser a escolha certa: a vantagem aqui não é estética.' },
        { id: 'c', text: 'O gráfico ocupa menos espaço no slide.', porque: 'Costuma ocupar mais. O que ele economiza é conferência.' },
        { id: 'd', text: 'A planilha deixa de ser necessária.', porque: 'Ela continua sendo a origem — e no caso vinculado precisa viajar junto.' },
      ]},
      explanation: 'Conferir números de slide contra planilha é trabalho que ninguém faz duas vezes. A saída é não digitar.',
    },
    {
      id: 'ES11-M7-Q7', type: 'true_false',
      prompt: 'Um gráfico de pizza responde bem à pergunta "para onde vai o dinheiro do acampamento".',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'A pergunta é de composição — que parte do total cada item é —, e composição é exatamente o que a pizza mostra.' },
      ]},
      explanation: 'Evolução pede linha; composição pede pizza. A pergunta escolhe o desenho.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 8 — As notas (requisitos 2.4 e 4.5)
     ────────────────────────────────────────────────────────────────────── */
  'm8-teoria': [
    {
      id: 'ES11-M8-Q1', type: 'multiple_choice',
      prompt: 'O que são as notas do apresentador?',
      data: { options: [
        { id: 'a', text: 'Um texto por slide que a projeção não mostra.', correct: true },
        { id: 'b', text: 'Os comentários que outra pessoa deixa no slide.', porque: 'Esses são comentários, e servem para revisar a apresentação com alguém.' },
        { id: 'c', text: 'O texto do segundo nível de tópicos.', porque: 'Esse projeta como qualquer outro tópico, só com recuo.' },
        { id: 'd', text: 'O resumo que aparece na tira lateral.', porque: 'A tira mostra a miniatura do slide, e não texto nenhum à parte.' },
      ]},
      explanation: 'Elas existem para receber o que se fala, e é isso que deixa o slide poder ficar enxuto.',
    },
    {
      id: 'ES11-M8-Q2', type: 'multiple_choice',
      prompt: 'No Modo de Exibição do Apresentador, o que o telão mostra?',
      data: { options: [
        { id: 'a', text: 'Só o slide.', correct: true },
        { id: 'b', text: 'O slide e as notas.', porque: 'As notas ficam na sua tela. Se elas fossem para o telão, não serviriam para nada.' },
        { id: 'c', text: 'O slide, as notas e o relógio.', porque: 'Relógio e notas são da sua tela: é o que o modo existe para separar.' },
        { id: 'd', text: 'O próximo slide, para a plateia se preparar.', porque: 'O próximo slide aparece na sua tela, para você se preparar.' },
      ]},
      explanation: 'Duas telas, dois conteúdos — e é esse modo que faz as notas valerem a pena.',
    },
    {
      id: 'ES11-M8-Q3', type: 'multiple_choice',
      prompt: 'Qual destas é uma nota útil para o slide "O que levar: saco de dormir e isolante"?',
      data: { options: [
        { id: 'a', text: 'Sem isolante o chão tira o calor por baixo.', correct: true },
        { id: 'b', text: 'Falar do saco de dormir e do isolante.', porque: 'Isso é o tópico outra vez: você leria em voz alta o que a plateia acabou de ler.' },
        { id: 'c', text: 'Saco de dormir e isolante térmico.', porque: 'É a cópia exata do tópico, e não acrescenta nada à fala.' },
        { id: 'd', text: 'Lembrar de passar para o próximo slide.', porque: 'Isso é instrução de operação, e não o que você tem a dizer sobre o assunto.' },
      ]},
      explanation: 'A nota útil é a que não está no slide: o porquê, o caso concreto, o aviso que você esquece.',
    },
    {
      id: 'ES11-M8-Q4', type: 'multiple_choice',
      prompt: 'Por que um parágrafo de dez linhas na nota é um problema?',
      data: { options: [
        { id: 'a', text: 'Ele vira roteiro, e quem lê roteiro para de olhar para a sala.', correct: true },
        { id: 'b', text: 'Ele não cabe no painel de notas.', porque: 'Cabe: o painel rola. O problema é o que ele faz com quem apresenta.' },
        { id: 'c', text: 'Ele aumenta o peso do arquivo.', porque: 'Texto não pesa num arquivo de apresentação; imagens pesam.' },
        { id: 'd', text: 'Ele projeta junto com o slide na impressão.', porque: 'Imprimir com notas é uma opção, e escolhida de propósito. Na projeção elas nunca aparecem.' },
      ]},
      explanation: 'A nota é escrita para ser falada: frase curta, do jeito que você diria.',
    },
    {
      id: 'ES11-M8-Q5', type: 'multiple_choice',
      prompt: 'Abrir o painel de notas e deixá-lo vazio cumpre o requisito de usar notas do apresentador?',
      data: { options: [
        { id: 'a', text: 'Não: painel vazio não diz nada a ninguém.', correct: true },
        { id: 'b', text: 'Sim, porque o recurso foi demonstrado.', porque: 'Abrir um painel é um clique. O que o requisito pede é o que vai dentro dele.' },
        { id: 'c', text: 'Sim, se o modo do apresentador for usado.', porque: 'O modo mostraria uma área de notas em branco ao lado de cada slide.' },
        { id: 'd', text: 'Depende: em apresentações curtas o painel vazio basta.', porque: 'Quanto mais curta a apresentação, mais cada slide depende do que se fala sobre ele.' },
      ]},
      explanation: 'É "zero link não é zero link quebrado" aplicado ao painel de notas.',
    },
    {
      id: 'ES11-M8-Q6', type: 'multiple_choice',
      prompt: 'O que decide se uma informação vai para o slide ou para a nota?',
      data: { options: [
        { id: 'a', text: 'Se a plateia precisa anotá-la.', correct: true },
        { id: 'b', text: 'Se ela é longa ou curta.', porque: 'Tamanho é consequência: a data é curta e vai para o slide; um lembrete curto vai para a nota.' },
        { id: 'c', text: 'Se você tem medo de esquecê-la.', porque: 'Isso é razão para escrever a nota, e não para projetar o que você tem a dizer.' },
        { id: 'd', text: 'Se ela é um número.', porque: 'Há número que a plateia precisa anotar e número que só explica o seu raciocínio.' },
      ]},
      explanation: 'O slide fica com o que ela vai anotar; a nota, com o que ela vai ouvir.',
    },
    {
      id: 'ES11-M8-Q7', type: 'true_false',
      prompt: 'As notas do apresentador entram na contagem de palavras do slide.',
      data: { options: [
        { id: 'f', text: 'Falso', correct: true },
        { id: 'v', text: 'Verdadeiro', porque: 'Elas não projetam. Contá-las faria o orçamento de vinte palavras medir a sua fala, e aí o jeito de caber seria falar menos.' },
      ]},
      explanation: 'O orçamento de palavras é do slide. O orçamento de tempo é da fala, e a nota conta nele.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 9 — Cortar (requisito 5)
     ────────────────────────────────────────────────────────────────────── */
  'm9-teoria': [
    {
      id: 'ES11-M9-Q1', type: 'multiple_choice',
      prompt: 'Reduzir dezesseis slides a oito, sem perder conteúdo essencial, pede o quê?',
      data: { options: [
        { id: 'a', text: 'Consolidar o que se repete entre slides do mesmo assunto.', correct: true },
        { id: 'b', text: 'Apagar os oito menos importantes.', porque: 'Chega-se a oito e sai-se com metade da informação, que é o que o requisito proíbe.' },
        { id: 'c', text: 'Juntar os tópicos de dois slides em um.', porque: 'Isso dá um slide de nove itens, que é três slides disfarçados de um.' },
        { id: 'd', text: 'Reduzir a fonte para caber mais em cada slide.', porque: 'Caber mais não é o objetivo: fonte menor piora a leitura e mantém o excesso.' },
      ]},
      explanation: 'Dois slides sobre o mesmo assunto repetem mais do que parece, e é daí que vem o espaço.',
    },
    {
      id: 'ES11-M9-Q2', type: 'multiple_choice',
      prompt: 'Depois de juntar "parte 1" e "parte 2", o que denuncia que houve empilhamento?',
      data: { options: [
        { id: 'a', text: 'O título que continua dizendo "parte 1".', correct: true },
        { id: 'b', text: 'O slide ter menos tópicos que antes.', porque: 'Menos tópicos é o sinal de consolidação, e não de empilhamento.' },
        { id: 'c', text: 'A apresentação ter ficado com oito slides.', porque: 'Oito é o alvo: o número não diz nada sobre como se chegou a ele.' },
        { id: 'd', text: 'O slide ter ficado com uma imagem só.', porque: 'Imagem não tem relação com o modo de juntar os textos.' },
      ]},
      explanation: 'Título que sobrou do corte é o que mostra que ninguém releu o slide depois de juntar.',
    },
    {
      id: 'ES11-M9-Q3', type: 'multiple_choice',
      prompt: 'Para que serve escrever a justificativa de cada corte?',
      data: { options: [
        { id: 'a', text: 'Para conferir se o conteúdo dele de fato ficou em outro lugar.', correct: true },
        { id: 'b', text: 'Para o examinador saber que você entendeu o pedido.', porque: 'Ele vai saber pela apresentação. A justificativa serve a você, antes dele.' },
        { id: 'c', text: 'Para poder desfazer o corte depois.', porque: 'Desfazer é o Ctrl+Z e o arquivo guardado. A justificativa não devolve slide nenhum.' },
        { id: 'd', text: 'Para contar quantos slides saíram.', porque: 'A contagem está na tira lateral, e não precisa de texto nenhum.' },
      ]},
      explanation: 'Quem escreve o porquê descobre, escrevendo, o que estava prestes a perder.',
    },
    {
      id: 'ES11-M9-Q4', type: 'multiple_choice',
      prompt: 'Qual é o jeito prático de não perder informação essencial num corte?',
      data: { options: [
        { id: 'a', text: 'Listar antes o que não pode sair, e conferir cada corte.', correct: true },
        { id: 'b', text: 'Cortar só os slides sem número nem data.', porque: 'A regra de não sair sozinho não tem número nem data, e é essencial.' },
        { id: 'c', text: 'Cortar do fim para o começo.', porque: 'A ordem do corte não tem relação com a importância do que está em cada slide.' },
        { id: 'd', text: 'Guardar uma cópia da apresentação antes.', porque: 'É prudente, e não evita entregar a versão cortada sem o endereço da chácara.' },
      ]},
      explanation: 'A lista é de quem recebe: "o que a família precisa saber ao sair daqui?".',
    },
    {
      id: 'ES11-M9-Q5', type: 'multiple_choice',
      prompt: 'Depois de consolidar dois slides num, o novo slide tem trinta e cinco palavras. Isso está resolvido?',
      data: { options: [
        { id: 'a', text: 'Não: cortar slide e cortar palavra são dois passos.', correct: true },
        { id: 'b', text: 'Sim: o requisito do corte fala de slides, e eles são oito.', porque: 'Esse requisito, sim. O das vinte palavras por slide continua aberto.' },
        { id: 'c', text: 'Não: é preciso voltar e cortar mais um slide.', porque: 'O número de slides está certo. O que falta é encurtar as linhas.' },
        { id: 'd', text: 'Sim, se as trinta e cinco palavras couberem em seis tópicos.', porque: 'Caber em seis tópicos é outra conta. Trinta e cinco palavras projetadas continuam demais.' },
      ]},
      explanation: 'O corte resolve o número de slides; encurtar as linhas é o passo seguinte.',
    },
    {
      id: 'ES11-M9-Q6', type: 'multiple_choice',
      prompt: 'Por que "saiu porque não ia dar tempo" é uma justificativa ruim para o slide do local?',
      data: { options: [
        { id: 'a', text: 'Porque o endereço não está em nenhum outro slide.', correct: true },
        { id: 'b', text: 'Porque toda justificativa precisa citar outro slide.', porque: 'Para um slide de contexto que simplesmente sai, ela é honesta e suficiente.' },
        { id: 'c', text: 'Porque tempo não é motivo válido para cortar.', porque: 'É o motivo principal de todo corte: a apresentação tem cinco minutos.' },
        { id: 'd', text: 'Porque ela é curta demais.', porque: 'Tamanho não é o problema: o problema é o que ela está deixando de fora.' },
      ]},
      explanation: 'A mesma frase é honesta para um slide e é uma confissão para outro.',
    },
    {
      id: 'ES11-M9-Q7', type: 'true_false',
      prompt: 'Um slide com nove tópicos curtos respeita o teto de seis tópicos se as palavras couberem em vinte.',
      data: { options: [
        { id: 'f', text: 'Falso', correct: true },
        { id: 'v', text: 'Verdadeiro', porque: 'São duas contas diferentes: o teto de tópicos é sobre hierarquia e o de palavras é sobre o tempo de leitura. Nove itens continuam sem hierarquia.' },
      ]},
      explanation: 'Nove de duas palavras cabem no orçamento, e continuam sendo uma lista que ninguém lê.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 10 — Cinco minutos (requisitos 6 e 4.6)
     ────────────────────────────────────────────────────────────────────── */
  'm10-teoria': [
    {
      id: 'ES11-M10-Q1', type: 'multiple_choice',
      prompt: 'Em cinco minutos, quantas palavras faladas cabem mais ou menos?',
      data: { options: [
        { id: 'a', text: 'Cerca de 650.', correct: true },
        { id: 'b', text: 'Cerca de 150, que são vinte por slide.', porque: 'Essas são as palavras projetadas. O que gasta tempo é a fala sobre elas.' },
        { id: 'c', text: 'Cerca de 2000, no ritmo de uma conversa.', porque: 'Conversa é mais rápida que explicação: quem explica para uma sala pausa.' },
        { id: 'd', text: 'Não há como estimar: depende da pessoa.', porque: 'Depende, e a média de quem explica para uma sala fica em torno de 130 por minuto.' },
      ]},
      explanation: '130 palavras por minuto é o ritmo de quem explica, e não o de quem conversa.',
    },
    {
      id: 'ES11-M10-Q2', type: 'multiple_choice',
      prompt: 'Para estimar o tempo de uma apresentação, o que se conta?',
      data: { options: [
        { id: 'a', text: 'O que projeta mais o que está nas notas.', correct: true },
        { id: 'b', text: 'Só o que projeta.', porque: 'Oito slides enxutos se leem em voz alta em vinte segundos, e a apresentação leva cinco minutos.' },
        { id: 'c', text: 'Só as notas.', porque: 'O que está no slide também é dito, pelo menos em parte: ele é o roteiro visível.' },
        { id: 'd', text: 'O número de slides, a um minuto cada.', porque: 'Slide de foto leva dez segundos e slide de custos leva um minuto e meio.' },
      ]},
      explanation: 'O que gasta o tempo é a fala, e a nota é onde ela está escrita.',
    },
    {
      id: 'ES11-M10-Q3', type: 'multiple_choice',
      prompt: 'Vinte palavras por slide dão o quê, na prática?',
      data: { options: [
        { id: 'a', text: 'Um título e quatro linhas curtas.', correct: true },
        { id: 'b', text: 'Um título e um parágrafo.', porque: 'Um parágrafo sozinho já passa de vinte palavras com folga.' },
        { id: 'c', text: 'Seis tópicos de seis palavras.', porque: 'Isso dá trinta e seis palavras, mais o título.' },
        { id: 'd', text: 'Só o título, em fonte grande.', porque: 'Um título leva três ou quatro palavras, e sobram dezesseis para o corpo.' },
      ]},
      explanation: 'É pouco de propósito: é o que mantém a apresentação apresentável em cinco minutos.',
    },
    {
      id: 'ES11-M10-Q4', type: 'multiple_choice',
      prompt: 'Para que serve o roteiro que a plataforma escreve a partir da apresentação?',
      data: { options: [
        { id: 'a', text: 'Para ensaiar com a própria apresentação na frente.', correct: true },
        { id: 'b', text: 'Para ser lido em voz alta na apresentação.', porque: 'Ler roteiro é o que o requisito evita: ele faz quem apresenta parar de olhar para a sala.' },
        { id: 'c', text: 'Para o examinador conferir o que você vai dizer.', porque: 'A plataforma não confere nada da fala: ela prepara quem vai falar.' },
        { id: 'd', text: 'Para substituir as notas do apresentador.', porque: 'Ele é escrito a partir delas: as notas são a fonte, e não o que ele substitui.' },
      ]},
      explanation: 'Escrever copiando é possível; explicar copiando não é. O roteiro prepara a explicação.',
    },
    {
      id: 'ES11-M10-Q5', type: 'multiple_choice',
      prompt: 'Qual frase vale decorar antes de apresentar?',
      data: { options: [
        { id: 'a', text: 'A primeira.', correct: true },
        { id: 'b', text: 'A última, para fechar bem.', porque: 'O fecho se improvisa com a sala já a favor. É o começo que trava.' },
        { id: 'c', text: 'Nenhuma: decorar atrapalha.', porque: 'Decorar a apresentação atrapalha. A primeira frase é a exceção, e é a que trava.' },
        { id: 'd', text: 'Todas as frases de transição entre slides.', porque: 'São muitas, e decorá-las deixa a fala com cara de texto recitado.' },
      ]},
      explanation: 'Ela é a única que vale decorar, porque é a que não sai quando se está nervoso.',
    },
    {
      id: 'ES11-M10-Q6', type: 'multiple_choice',
      prompt: 'Você exporta o PDF e depois encurta o texto de três slides. O que o PDF tem?',
      data: { options: [
        { id: 'a', text: 'Os textos longos, de antes do conserto.', correct: true },
        { id: 'b', text: 'Os textos curtos, porque ele lê a apresentação.', porque: 'Ele não lê nada: é um retrato do que existia na hora em que foi criado.' },
        { id: 'c', text: 'Um aviso de que está desatualizado.', porque: 'O PDF é um arquivo separado: ele não sabe que a apresentação mudou.' },
        { id: 'd', text: 'Os três slides em branco.', porque: 'O conteúdo deles está lá, na versão de quando se exportou.' },
      ]},
      explanation: 'O conserto é exportar de novo. É a mesma coisa do sumário da CC-ES002 e do PDF da CC-ES004.',
    },
    {
      id: 'ES11-M10-Q7', type: 'true_false',
      prompt: 'Levar o PDF além do arquivo editável protege contra fonte que não existe no computador do clube.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'O PDF carrega a fonte dentro dele e abre igual em qualquer máquina, que é justamente o que o arquivo editável não garante.' },
      ]},
      explanation: 'E o editável é o que vai ser usado no ano que vem: levar os dois é o que a liderança precisa.',
    },
  ],
};
