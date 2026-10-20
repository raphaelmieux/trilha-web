import type { Question } from '../types';

/*
 * As questões das lições de teoria da CC-ES012 Projeto Documental.
 *
 * ── O que elas medem ──────────────────────────────────────────────────────
 * Esta vereda não ensina programa nenhum — os cinco já foram ensinados —,
 * então a definição quase não aparece. O que carrega é a **discriminação**:
 * vinculado e incorporado, acesso e propriedade, arquivar e excluir, dar
 * acesso de editar e dar a conta, o número que está certo hoje e o número que
 * se refaz. Cada par tem questão própria, porque confundi-los é o que custa
 * caro depois e nenhum deles dá erro no dia em que se confunde.
 *
 * E o diagnóstico carrega o resto, pelo mesmo motivo da CC-ES011: a matéria
 * toda é feita de conjuntos que **funcionam**. Cinco arquivos soltos na mesma
 * pasta abrem bonitos; o total digitado está certo no dia em que foi escrito;
 * o dossiê gerado antes da mudança imprime perfeitamente; a pasta com acesso
 * a mais não acusa nada.
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
 */

export const QUESTOES_DO_PROJETO: Record<string, Question[]> = {
  /* ──────────────────────────────────────────────────────────────────────
     Módulo 1 — A proposta (requisito 2)
     ────────────────────────────────────────────────────────────────────── */
  'm1-teoria': [
    {
      id: 'ES12-M1-Q1', type: 'multiple_choice',
      prompt: 'Por que o examinador aprova a proposta antes de o conjunto ser montado?',
      data: { options: [
        { id: 'a', text: 'Porque depois de pronto não há mais o que mudar.', correct: true },
        { id: 'b', text: 'Porque a aprovação é o que dá acesso aos programas.', porque: 'Os programas já estão abertos: a aprovação é sobre o que o conjunto vai ser, e não sobre ferramenta.' },
        { id: 'c', text: 'Porque sem ela o trabalho não conta como feito.', porque: 'Conta — o problema é outro: ele conta para um conjunto que ninguém pôde discutir antes.' },
        { id: 'd', text: 'Porque a proposta é o primeiro documento do conjunto.', porque: 'Ela não é peça do conjunto: é o combinado sobre o que o conjunto vai atender.' },
      ]},
      explanation: 'Proposta aprovada depois é proposta que ninguém podia mudar: o examinador recebe o conjunto pronto e a única resposta possível é sim.',
    },
    {
      id: 'ES12-M1-Q2', type: 'multiple_choice',
      prompt: 'Qual destas é a pergunta que quase ninguém escreve na proposta?',
      data: { options: [
        { id: 'a', text: 'O que vai contar como pronto.', correct: true },
        { id: 'b', text: 'Qual necessidade do clube o conjunto atende.', porque: 'Essa é a primeira que todo mundo escreve: é o motivo de o projeto existir.' },
        { id: 'c', text: 'Quais peças o conjunto vai ter.', porque: 'Essa sai da lista do requisito 3, e é a mais fácil de responder.' },
        { id: 'd', text: 'Para quem o conjunto é.', porque: 'Essa costuma vir junto da necessidade, na mesma frase.' },
      ]},
      explanation: 'É a única que dá ao examinador como dizer que o conjunto acabou. Sem ela, a aprovação é de uma intenção.',
    },
    {
      id: 'ES12-M1-Q3', type: 'multiple_choice',
      prompt: 'Uma proposta diz: "vou organizar os documentos do clube". O que falta nela?',
      data: { options: [
        { id: 'a', text: 'Uma necessidade concreta e um fim reconhecível.', correct: true },
        { id: 'b', text: 'A lista de programas que serão usados.', porque: 'O programa é escolha de quem faz; a proposta trata do que o conjunto atende.' },
        { id: 'c', text: 'O nome de quem vai ajudar no trabalho.', porque: 'Isso aparece no histórico de versões, e não na proposta.' },
        { id: 'd', text: 'A data de entrega ao examinador.', porque: 'Útil, mas o que falta antes é saber o que seria entregar.' },
      ]},
      explanation: 'Organizar documentos é um desejo permanente: nunca está pronto, e por isso não se aprova nem se avalia.',
    },
    {
      id: 'ES12-M1-Q4', type: 'true_false',
      prompt: 'Se o conjunto ficou melhor do que a proposta prometia, a proposta estava errada.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'A proposta é o combinado mínimo: entregar mais é bom, e por isso ela não fica errada por o conjunto ter melhorado.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'A proposta é o combinado mínimo. Entregar mais é bom; prometer cinco peças e entregar quatro é o que a aprovação prévia existe para pegar antes.',
    },
    {
      id: 'ES12-M1-Q5', type: 'multiple_choice',
      prompt: 'Por que a proposta nomeia as peças em vez de dizer só "documentos da feira"?',
      data: { options: [
        { id: 'a', text: 'Porque cada peça é um trabalho diferente.', correct: true },
        { id: 'b', text: 'Porque o examinador precisa saber quantos arquivos abrir.', porque: 'O número de arquivos não diz nada sobre o que foi feito.' },
        { id: 'c', text: 'Porque a lista de peças é o que gera a nota.', porque: 'Esta vereda não tem nota: ela rende insígnia e Token.Web().' },
        { id: 'd', text: 'Porque os programas precisam ser declarados antes.', porque: 'A peça não é o programa: um documento pode sair de qualquer editor de texto.' },
      ]},
      explanation: 'Planilha de controle e formulário de coleta são tarefas distintas, com defeitos distintos. "Documentos da feira" cobre as duas e não compromete com nenhuma.',
    },
    {
      id: 'ES12-M1-Q6', type: 'multiple_choice',
      prompt: 'O que distingue uma necessidade documental real de uma inventada para o exercício?',
      data: { options: [
        { id: 'a', text: 'Alguém do clube já sofre com ela hoje.', correct: true },
        { id: 'b', text: 'Ela envolve mais de um programa.', porque: 'Uma necessidade inventada também pode envolver cinco programas.' },
        { id: 'c', text: 'Ela cabe nas cinco peças do requisito 3.', porque: 'Qualquer tema cabe nas cinco se for escrito para caber.' },
        { id: 'd', text: 'Ela foi aprovada pelo examinador.', porque: 'A aprovação confere a proposta; ela não torna real o que não era.' },
      ]},
      explanation: 'O conjunto que ninguém precisava é o que ninguém abre no ano seguinte — e o requisito 7 pede justamente que a próxima diretoria o reaproveite.',
    },
    {
      id: 'ES12-M1-Q7', type: 'multiple_choice',
      prompt: 'Quem monta o conjunto todo e só então pede aprovação cumpre o requisito 2?',
      data: { options: [
        { id: 'a', text: 'Não: a aprovação precisa vir antes da execução.', correct: true },
        { id: 'b', text: 'Sim, desde que a proposta escrita exista.', porque: 'Ela existe, e chegou tarde: o requisito diz que a execução não pode ser iniciada antes da aprovação.' },
        { id: 'c', text: 'Sim, porque o resultado é o que se avalia.', porque: 'O requisito 2 avalia o combinado, e não só o resultado.' },
        { id: 'd', text: 'Depende de o conjunto ter ficado bom.', porque: 'Se ficou bom é sorte: ninguém pôde corrigir o rumo enquanto havia tempo.' },
      ]},
      explanation: 'O que se perde é a chance de mudar: proposta aprovada em cima do pronto não muda nada, e é por isso que a ordem é parte do requisito.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 2 — O documento do conjunto (requisitos 3.1 e 3.6)
     ────────────────────────────────────────────────────────────────────── */
  'm2-teoria': [
    {
      id: 'ES12-M2-Q1', type: 'multiple_choice',
      prompt: 'O que faz cinco arquivos parecerem cinco projetos em vez de um conjunto?',
      data: { options: [
        { id: 'a', text: 'Cada um com fonte e cor próprias.', correct: true },
        { id: 'b', text: 'Estarem em pastas diferentes.', porque: 'A pasta organiza; quem lê o documento impresso não vê pasta nenhuma.' },
        { id: 'c', text: 'Terem sido feitos por pessoas diferentes.', porque: 'Cinco pessoas podem entregar um conjunto coerente se a identidade estiver combinada.' },
        { id: 'd', text: 'Saírem de programas diferentes.', porque: 'Sair de programas diferentes é inevitável: são cinco peças de cinco naturezas.' },
      ]},
      explanation: 'Coerência é uma fonte de título, uma de corpo e uma cor, repetidas nas cinco. É o que diz ao leitor que as peças são do mesmo trabalho.',
    },
    {
      id: 'ES12-M2-Q2', type: 'multiple_choice',
      prompt: 'Onde cada programa guarda a identidade que o conjunto combinou?',
      data: { options: [
        { id: 'a', text: 'No estilo, no mestre, no tema e na formatação da célula.', correct: true },
        { id: 'b', text: 'Num arquivo de configuração comum aos cinco.', porque: 'Não existe: cada programa guarda aparência do jeito dele.' },
        { id: 'c', text: 'Na pasta do projeto, que a passa para dentro.', porque: 'A pasta passa permissão para dentro, e não aparência.' },
        { id: 'd', text: 'Em cada parágrafo e em cada slide, à mão.', porque: 'Esse é o jeito que não sobrevive à primeira troca de cor.' },
      ]},
      explanation: 'O documento tem estilos, a apresentação tem o mestre, o formulário tem o tema e a planilha tem a cor da fonte. São quatro lugares para a mesma decisão.',
    },
    {
      id: 'ES12-M2-Q3', type: 'multiple_choice',
      prompt: 'Por que o documento do conjunto é quem nomeia as outras peças?',
      data: { options: [
        { id: 'a', text: 'Porque é a peça que o leitor encontra primeiro.', correct: true },
        { id: 'b', text: 'Porque ele é o único que tem sumário.', porque: 'O sumário é das seções dele, e não das peças do conjunto.' },
        { id: 'c', text: 'Porque os outros programas não têm onde escrever isso.', porque: 'Todos têm; o que muda é quem é lido primeiro.' },
        { id: 'd', text: 'Porque ele é o maior arquivo do conjunto.', porque: 'Tamanho não decide ordem de leitura.' },
      ]},
      explanation: 'Sem essa seção, o conjunto é cinco arquivos que por acaso estão na mesma pasta: quem lê o regulamento não fica sabendo que existe formulário.',
    },
    {
      id: 'ES12-M2-Q4', type: 'true_false',
      prompt: 'Acrescentar uma seção ao documento atualiza o sumário automático sozinho.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O sumário guarda o que leu quando foi gerado, e só Atualizar Sumário o alcança.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O sumário guarda o que leu quando foi gerado. Seção nova pede Atualizar Sumário, e sem isso ele aponta para as folhas de antes.',
    },
    {
      id: 'ES12-M2-Q5', type: 'multiple_choice',
      prompt: 'O que significa escolher uma cor "que se lê" para a identidade de um conjunto impresso?',
      data: { options: [
        { id: 'a', text: 'Que ela contrasta com o papel branco.', correct: true },
        { id: 'b', text: 'Que ela é escura.', porque: 'Escura ajuda, e não basta: o que decide é a razão de contraste medida, e não a impressão de escuridão.' },
        { id: 'c', text: 'Que ela é a cor oficial do clube.', porque: 'A cor oficial pode ser justamente a que não se lê: a CC-ES011 mediu o ouro do clube em 2,42:1.' },
        { id: 'd', text: 'Que ela aparece bem no monitor.', porque: 'O monitor é retroiluminado: o papel não é, e a impressora não acerta a mesma cor.' },
      ]},
      explanation: 'A cor do conjunto vai para papel e para tela. Quem escolhe pelo monitor descobre no primeiro documento impresso.',
    },
    {
      id: 'ES12-M2-Q6', type: 'multiple_choice',
      prompt: 'O regulamento chega com os cinco títulos em negrito à mão, sem estilo. Qual é o custo?',
      data: { options: [
        { id: 'a', text: 'O sumário automático não acha título nenhum.', correct: true },
        { id: 'b', text: 'O documento fica mais pesado para abrir.', porque: 'Negrito à mão não pesa nada mensurável.' },
        { id: 'c', text: 'Os títulos saem menores na impressão.', porque: 'Eles saem exatamente como foram formatados — e é por isso que o defeito não se vê.' },
        { id: 'd', text: 'O texto perde a quebra de página.', porque: 'Quebra de página é outra coisa, e não depende de estilo.' },
      ]},
      explanation: 'O sumário procura estilo de título, e não negrito. É a lição da CC-ES002, e aqui ela decide se o documento do conjunto tem sumário ou uma lista vazia.',
    },
    {
      id: 'ES12-M2-Q7', type: 'multiple_choice',
      prompt: 'Duas fontes na identidade, e não uma. Por quê?',
      data: { options: [
        { id: 'a', text: 'Porque título e corpo têm trabalhos diferentes.', correct: true },
        { id: 'b', text: 'Porque uma fonte só cansa quem lê.', porque: 'Livro inteiro em uma fonte só se lê bem: o que a segunda resolve é a hierarquia.' },
        { id: 'c', text: 'Porque os programas não aceitam a mesma fonte nos dois.', porque: 'Aceitam: a escolha de duas é de quem desenha, e não limitação de programa.' },
        { id: 'd', text: 'Porque duas fontes deixam o conjunto mais bonito.', porque: 'Pode deixar, e não é o motivo: duas fontes escolhidas ao acaso deixam pior.' },
      ]},
      explanation: 'O título chama e o corpo se lê de perto. Duas famílias deixam a diferença visível sem precisar de tamanho exagerado.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 3 — A planilha que se refaz (requisito 3.2)
     ────────────────────────────────────────────────────────────────────── */
  'm3-teoria': [
    {
      id: 'ES12-M3-Q1', type: 'multiple_choice',
      prompt: 'O total de material está escrito 240 e o cálculo de hoje dá 240. Qual é o problema?',
      data: { options: [
        { id: 'a', text: 'Ele vai dizer 240 depois de a conta mudar.', correct: true },
        { id: 'b', text: 'Ele está sem formato de moeda.', porque: 'O formato é apresentação; o defeito é o número não acompanhar.' },
        { id: 'c', text: 'Ele deveria estar em outra aba.', porque: 'A aba organiza, e não muda se o número se refaz ou não.' },
        { id: 'd', text: 'Não há problema: o número está certo.', porque: 'Está certo hoje, e é por isso que ninguém desconfia dele amanhã.' },
      ]},
      explanation: 'Número guardado não responde por hoje. É a família da ofensiva parada em dois dias: o contador mostra um número plausível, que é o que se espera de um contador funcionando.',
    },
    {
      id: 'ES12-M3-Q2', type: 'multiple_choice',
      prompt: 'Como se prova que uma célula calcula em vez de guardar um número?',
      data: { options: [
        { id: 'a', text: 'Mudando um dado e olhando se ela acompanhou.', correct: true },
        { id: 'b', text: 'Olhando se o conteúdo começa por igual.', porque: 'Igual a 240 também começa por igual, e não acompanha nada.' },
        { id: 'c', text: 'Conferindo se o resultado está correto.', porque: 'O número digitado também está correto no dia em que foi escrito.' },
        { id: 'd', text: 'Vendo se a célula está formatada como número.', porque: 'Formato não diz de onde o valor vem.' },
      ]},
      explanation: 'Fórmula só se distingue de número parado simulando a mudança. Nenhuma conta sobre o estado de agora separa os dois.',
    },
    {
      id: 'ES12-M3-Q3', type: 'multiple_choice',
      prompt: 'Qual destas fórmulas de total é um número parado disfarçado?',
      data: { options: [
        { id: 'a', text: 'Igual a 820 mais 910 mais 1180.', correct: true },
        { id: 'b', text: 'Igual a SOMA de B3 até B14.', porque: 'Essa lê a faixa: linha nova dentro dela entra na conta.' },
        { id: 'c', text: 'Igual a B3 vezes B5.', porque: 'Essa lê duas células: mudar qualquer uma refaz o total.' },
        { id: 'd', text: 'Igual a CONT.VALORES da coluna de unidades.', porque: 'Essa conta o que está preenchido, e cresce com a tabela.' },
      ]},
      explanation: 'Ela soma três números escritos dentro dela. Trocar um gasto na planilha não muda o total, porque o total não lê a planilha.',
    },
    {
      id: 'ES12-M3-Q4', type: 'true_false',
      prompt: 'A planilha de controle pode calcular sobre a aba de respostas antes de as respostas chegarem.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'A fórmula aponta para a faixa, e faixa vazia dá zero: escrever a conta antes é legítimo.' },
      ]},
      explanation: 'A fórmula aponta para a faixa, e faixa vazia dá zero. É o que permite escrever a conta antes e deixar a aba crescer depois.',
    },
    {
      id: 'ES12-M3-Q5', type: 'multiple_choice',
      prompt: 'Por que a faixa da fórmula vai além da última linha preenchida de hoje?',
      data: { options: [
        { id: 'a', text: 'Para a inscrição nova cair dentro dela.', correct: true },
        { id: 'b', text: 'Para a planilha ficar mais rápida.', porque: 'Faixa maior não acelera nada; se muda algo, é para o outro lado.' },
        { id: 'c', text: 'Porque o Excel exige faixa de tamanho fixo.', porque: 'Não exige: a faixa é escolhida por quem escreve a fórmula.' },
        { id: 'd', text: 'Para a conta ignorar as linhas vazias.', porque: 'A conta já ignora vazio: SOMA de célula vazia soma zero.' },
      ]},
      explanation: 'Faixa que termina na sexta resposta dá o número certo hoje e para de crescer — o mesmo defeito do número digitado, com cara de fórmula.',
    },
    {
      id: 'ES12-M3-Q6', type: 'multiple_choice',
      prompt: 'Alguém escreve o valor da diária dentro da fórmula, em cada linha: igual a B4 vezes 45. O que acontece no ano seguinte?',
      data: { options: [
        { id: 'a', text: 'A planilha inteira fica errada em silêncio.', correct: true },
        { id: 'b', text: 'As fórmulas dão erro de referência.', porque: 'Não há referência quebrada: 45 é um número, e número não quebra.' },
        { id: 'c', text: 'O Excel avisa que o valor está repetido.', porque: 'Ele não avisa: repetir um número em doze fórmulas é legítimo, e aqui é o defeito.' },
        { id: 'd', text: 'Nada: basta trocar o valor na célula da diária.', porque: 'A célula da diária existe e ninguém a lê — é justamente o problema.' },
      ]},
      explanation: 'Trocar a diária na célula não muda nada, porque as doze fórmulas não a leem. Os valores saem certos hoje e errados para sempre depois.',
    },
    {
      id: 'ES12-M3-Q7', type: 'multiple_choice',
      prompt: 'Qual é a diferença entre dado bruto e apresentação numa planilha?',
      data: { options: [
        { id: 'a', text: 'O bruto é o que a conta usa; o resto é como ele se mostra.', correct: true },
        { id: 'b', text: 'O bruto fica numa aba, e a apresentação em outra.', porque: 'Separar em abas é organização; a distinção vale dentro de uma célula só.' },
        { id: 'c', text: 'A apresentação é o gráfico, e o bruto é a tabela.', porque: 'O gráfico é uma apresentação possível; o formato da célula já é outra.' },
        { id: 'd', text: 'O bruto é digitado, e a apresentação é calculada.', porque: 'As duas coisas são independentes: uma célula calculada também tem formato.' },
      ]},
      explanation: 'Mil seiscentos e vinte é o dado; R$ 1.620,00 é o formato. Digitar o cifrão transforma o número em texto, e a SOMA para de vê-lo.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 4 — O formulário desenhado para a planilha (requisito 3.3)
     ────────────────────────────────────────────────────────────────────── */
  'm4-teoria': [
    {
      id: 'ES12-M4-Q1', type: 'multiple_choice',
      prompt: 'Por que o formulário se desenha olhando a planilha que vai recebê-lo?',
      data: { options: [
        { id: 'a', text: 'Porque cada pergunta vira uma coluna.', correct: true },
        { id: 'b', text: 'Porque a planilha limita quantas perguntas cabem.', porque: 'Não limita: cabem quantas colunas se quiser.' },
        { id: 'c', text: 'Porque as perguntas precisam estar na ordem das colunas.', porque: 'A ordem se resolve na importação; o que não se resolve é a pergunta mal partida.' },
        { id: 'd', text: 'Porque o formulário herda o formato das células.', porque: 'Ele não herda nada: o formulário é anterior à planilha receber qualquer coisa.' },
      ]},
      explanation: 'Pergunta que junta duas coisas vira uma coluna com duas coisas dentro, e aí alguém abre cada linha para partir o texto à mão.',
    },
    {
      id: 'ES12-M4-Q2', type: 'multiple_choice',
      prompt: 'Uma pergunta pede "unidade e especialidade". O que a planilha recebe?',
      data: { options: [
        { id: 'a', text: 'Uma coluna com as duas coisas na mesma célula.', correct: true },
        { id: 'b', text: 'Duas colunas, partidas pelo separador.', porque: 'Nada parte nada: o que foi digitado chega como foi digitado.' },
        { id: 'c', text: 'Uma coluna com a primeira e outra vazia.', porque: 'Não há segunda coluna: havia uma pergunta, então há uma coluna.' },
        { id: 'd', text: 'Um erro na importação.', porque: 'Erro nenhum: o texto é válido, e é por isso que o defeito passa.' },
      ]},
      explanation: 'Contar por unidade exige a unidade sozinha numa coluna. Com as duas juntas, a contagem não existe sem alguém redigitar.',
    },
    {
      id: 'ES12-M4-Q3', type: 'multiple_choice',
      prompt: 'O que o tipo "número" impede que um campo de texto curto deixa passar?',
      data: { options: [
        { id: 'a', text: 'Respostas como "seis" e "5 ou 6".', correct: true },
        { id: 'b', text: 'Respostas em branco.', porque: 'Quem cuida do branco é o campo obrigatório, e não o tipo.' },
        { id: 'c', text: 'Respostas repetidas.', porque: 'Repetição é outro assunto: duas unidades podem mandar o mesmo número.' },
        { id: 'd', text: 'Respostas longas demais.', porque: 'Tamanho máximo é regra de validação, e não tipo de campo.' },
      ]},
      explanation: 'A SOMA pula texto. Seis escrito com letras e cinco ou seis chegam como texto, e o total fecha menor sem reclamar.',
    },
    {
      id: 'ES12-M4-Q4', type: 'true_false',
      prompt: 'Trocar o tipo do campo depois de as respostas chegarem conserta as respostas que já entraram.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O tipo vale para o que vem depois: o que já entrou continua como entrou.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O tipo vale para o que vem depois. O que já entrou continua como entrou — e é por isso que o formulário se desenha antes de abrir.',
    },
    {
      id: 'ES12-M4-Q5', type: 'multiple_choice',
      prompt: 'Por que a unidade é um campo de lista e não de texto curto?',
      data: { options: [
        { id: 'a', text: 'Porque assim não existem duas grafias da mesma unidade.', correct: true },
        { id: 'b', text: 'Porque lista é mais rápida de responder.', porque: 'Costuma ser, e não é o motivo: o motivo é o que acontece na planilha depois.' },
        { id: 'c', text: 'Porque texto curto não cabe num nome de unidade.', porque: 'Cabe: texto curto aceita qualquer nome.' },
        { id: 'd', text: 'Porque a lista garante que todas as unidades respondam.', porque: 'Ela não garante resposta: garante que a resposta dada seja uma das opções.' },
      ]},
      explanation: 'Falcão, falcao e Falcão com espaço atrás são três grupos na tabela dinâmica, com o nome escrito igual. A lista fecha essa porta na entrada.',
    },
    {
      id: 'ES12-M4-Q6', type: 'multiple_choice',
      prompt: 'O conselheiro responsável é dado pessoal. O que isso muda no conjunto?',
      data: { options: [
        { id: 'a', text: 'Ele não pode ir no dossiê que sai do clube.', correct: true },
        { id: 'b', text: 'Ele não pode ser coletado.', porque: 'Pode: o clube precisa saber a quem recorrer se o estande não aparecer.' },
        { id: 'c', text: 'Ele precisa ser apagado depois da feira.', porque: 'Pode haver prazo, e o que o requisito trata aqui é de para onde ele vai.' },
        { id: 'd', text: 'Ele precisa de um campo separado na planilha.', porque: 'Já tem campo próprio; o que muda é quem o enxerga.' },
      ]},
      explanation: 'O que vai para fora é decisão. A planilha de controle leva o que o clube gasta e o nome de cada responsável, e nunca foi para as famílias.',
    },
    {
      id: 'ES12-M4-Q7', type: 'multiple_choice',
      prompt: 'Qual é a diferença entre o tipo do campo e a regra de validação?',
      data: { options: [
        { id: 'a', text: 'O tipo diz o que cabe; a regra diz o que vale.', correct: true },
        { id: 'b', text: 'O tipo vale no formulário; a regra vale na planilha.', porque: 'As duas valem no formulário: a planilha recebe o que passou pelas duas.' },
        { id: 'c', text: 'A regra é opcional e o tipo é obrigatório.', porque: 'Verdade sobre a forma, e não sobre o que cada uma faz.' },
        { id: 'd', text: 'São dois nomes para a mesma coisa.', porque: 'Não são: um campo de texto curto aceita qualquer texto, e a regra pode exigir que seja um e-mail.' },
      ]},
      explanation: 'Número é tipo; entre 1 e 20 é regra. São tarefas separadas porque são coisas separadas.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 5 — Sem redigitar (requisito 4)
     ────────────────────────────────────────────────────────────────────── */
  'm5-teoria': [
    {
      id: 'ES12-M5-Q1', type: 'multiple_choice',
      prompt: 'O que se perde redigitando à mão as respostas do formulário na planilha?',
      data: { options: [
        { id: 'a', text: 'Meia hora por ano e um erro que ninguém acha.', correct: true },
        { id: 'b', text: 'As respostas originais, que são apagadas.', porque: 'O formulário continua com elas: redigitar não apaga nada.' },
        { id: 'c', text: 'A ordem em que as respostas chegaram.', porque: 'Dá para redigitar na ordem; o problema não é ordem.' },
        { id: 'd', text: 'Nada, se a digitação for conferida.', porque: 'Conferir doze linhas à mão é o trabalho que a importação faz sem errar.' },
      ]},
      explanation: 'A planilha fica igual, e é esse o ponto: doze linhas certas e um dígito trocado em algum lugar que ninguém vai procurar.',
    },
    {
      id: 'ES12-M5-Q2', type: 'multiple_choice',
      prompt: 'Depois de importar, por que ainda é preciso trocar o total digitado por fórmula?',
      data: { options: [
        { id: 'a', text: 'Porque importar enche a aba e não mexe nas contas.', correct: true },
        { id: 'b', text: 'Porque a importação apaga as fórmulas antigas.', porque: 'Ela escreve na aba de respostas, e não na de controle.' },
        { id: 'c', text: 'Porque a fórmula precisa ser escrita depois dos dados.', porque: 'Pode ser escrita antes: faixa vazia dá zero.' },
        { id: 'd', text: 'Porque a importação não aceita célula calculada.', porque: 'Ela não lê a aba de controle, então não aceita nem recusa nada ali.' },
      ]},
      explanation: 'Com o número de unidades digitado, importar resposta nova não muda nada no resto do conjunto: a aba cresce e todas as contas continuam as de antes.',
    },
    {
      id: 'ES12-M5-Q3', type: 'multiple_choice',
      prompt: 'Por que a importação refaz a aba de respostas em vez de acrescentar linhas?',
      data: { options: [
        { id: 'a', text: 'Para não duplicar quem já estava lá.', correct: true },
        { id: 'b', text: 'Para apagar as respostas antigas do formulário.', porque: 'O formulário não é tocado: a importação só escreve na planilha.' },
        { id: 'c', text: 'Porque acrescentar linha é mais lento.', porque: 'Velocidade não é o assunto com doze respostas.' },
        { id: 'd', text: 'Porque a aba precisa ficar na ordem do envio.', porque: 'Acrescentar também mantém a ordem; o que ela não evita é a repetição.' },
      ]},
      explanation: 'Importar duas vezes acrescentando deixa o mesmo inscrito em duas linhas. A planilha soma duas diárias e fecha a conta com um número plausível.',
    },
    {
      id: 'ES12-M5-Q4', type: 'true_false',
      prompt: 'Uma aba com doze nomes digitados à mão e uma aba com doze respostas importadas são indistinguíveis.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'A importação traz a chave do envio, que é o instante, e ninguém digita instante.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'A importação traz a chave do envio — o instante — que ninguém digita. É por ela que se sabe que cada linha veio de uma resposta de verdade.',
    },
    {
      id: 'ES12-M5-Q5', type: 'multiple_choice',
      prompt: 'Por que a coluna do instante do envio é a chave da base?',
      data: { options: [
        { id: 'a', text: 'Porque dois envios não têm o mesmo instante.', correct: true },
        { id: 'b', text: 'Porque ela é a primeira coluna.', porque: 'A posição é consequência: ela vem primeiro porque é a chave, e não o contrário.' },
        { id: 'c', text: 'Porque ela é a única que nunca vem vazia.', porque: 'Campo obrigatório também nunca vem vazio, e ainda assim repete.' },
        { id: 'd', text: 'Porque ela está em ordem crescente.', porque: 'Ordem ajuda a ler, e não impede dois iguais.' },
      ]},
      explanation: 'Duas pessoas podem ter o mesmo nome; dois envios não têm o mesmo instante. Base cuja chave é o nome é a base que perde uma das duas Joanas.',
    },
    {
      id: 'ES12-M5-Q6', type: 'multiple_choice',
      prompt: 'O que a CONT.VALORES conta que a CONT.NÚM não conta?',
      data: { options: [
        { id: 'a', text: 'As células preenchidas com texto.', correct: true },
        { id: 'b', text: 'As células vazias da faixa.', porque: 'Nenhuma das duas conta vazio.' },
        { id: 'c', text: 'As células de outra aba.', porque: 'As duas leem a faixa que receberem, de qualquer aba.' },
        { id: 'd', text: 'As células com fórmula.', porque: 'As duas contam pelo valor, e não pela origem dele.' },
      ]},
      explanation: 'A diferença entre as duas é uma das pistas do número guardado como texto: uma conta onze onde a outra conta doze.',
    },
    {
      id: 'ES12-M5-Q7', type: 'multiple_choice',
      prompt: 'A fórmula que atravessa a aba se escreve como?',
      data: { options: [
        { id: 'a', text: 'Nome da aba, exclamação, e a faixa.', correct: true },
        { id: 'b', text: 'Nome da aba, ponto, e a faixa.', porque: 'Ponto não separa aba de faixa em planilha nenhuma.' },
        { id: 'c', text: 'Faixa, e a aba escolhida no menu.', porque: 'A aba vai escrita na fórmula: menu nenhum a guarda.' },
        { id: 'd', text: 'Nome da aba entre parênteses, antes da faixa.', porque: 'Parênteses são dos argumentos de função.' },
      ]},
      explanation: 'A exclamação é o que separa a aba da faixa. Sem ela, o que está antes do nome parece função, e a fórmula devolve erro de nome.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 6 — A apresentação que acompanha (requisito 3.4)
     ────────────────────────────────────────────────────────────────────── */
  'm6-teoria': [
    {
      id: 'ES12-M6-Q1', type: 'multiple_choice',
      prompt: 'Das quatro maneiras de um número chegar a uma peça, qual acompanha a planilha de controle?',
      data: { options: [
        { id: 'a', text: 'Vinculado.', correct: true },
        { id: 'b', text: 'Incorporado.', porque: 'Ele acompanha a cópia que viaja dentro dele, que é uma segunda fonte.' },
        { id: 'c', text: 'Colado como figura.', porque: 'Figura é o retrato de quando foi colada, para sempre.' },
        { id: 'd', text: 'Digitado.', porque: 'Digitado não se refaz nunca, e nada na tela diz que ele é de ontem.' },
      ]},
      explanation: 'Só o vínculo lê a fonte agora. As outras três chegam ao mesmo lugar na tela, com o mesmo número, e param ali.',
    },
    {
      id: 'ES12-M6-Q2', type: 'multiple_choice',
      prompt: 'Qual é a diferença entre vinculado e incorporado?',
      data: { options: [
        { id: 'a', text: 'Um lê a planilha de fora; o outro leva uma cópia dentro.', correct: true },
        { id: 'b', text: 'Um é imagem e o outro é tabela.', porque: 'Nenhum dos dois é imagem: os dois desenham o gráfico de dados.' },
        { id: 'c', text: 'Um atualiza e o outro não.', porque: 'Os dois atualizam — a pergunta é em relação a quê.' },
        { id: 'd', text: 'Um funciona no PowerPoint e o outro no Word.', porque: 'Os dois existem nos dois programas.' },
      ]},
      explanation: 'Incorporado viaja sozinho e não alcança a planilha de controle. Vinculado alcança, e precisa que ela viaje junto.',
    },
    {
      id: 'ES12-M6-Q3', type: 'multiple_choice',
      prompt: 'O que acontece num conjunto com duas fontes para o mesmo número?',
      data: { options: [
        { id: 'a', text: 'Ele conta dois números, nenhum com cara de errado.', correct: true },
        { id: 'b', text: 'A segunda fonte sobrescreve a primeira.', porque: 'Nenhuma sobrescreve nada: as duas são lidas por quem as abre.' },
        { id: 'c', text: 'O programa avisa que há divergência.', porque: 'Nenhum avisa: cada arquivo está certo em relação à fonte dele.' },
        { id: 'd', text: 'As duas convergem na próxima abertura.', porque: 'Elas não se falam: convergir exigiria uma delas ler a outra.' },
      ]},
      explanation: 'Quem lê a apresentação diz quatro unidades e quem lê a planilha diz seis, na mesma tarde, e os dois estão lendo o conjunto oficial.',
    },
    {
      id: 'ES12-M6-Q4', type: 'true_false',
      prompt: 'Um gráfico colado como figura mostra que é um retrato, e um número digitado não mostra nada.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'A figura se vê que é figura: não dá para corrigir um número dentro dela.' },
      ]},
      explanation: 'A figura pelo menos se vê que é figura: não dá para corrigir um número dentro dela. O digitado parece texto do documento, e é o pior dos quatro.',
    },
    {
      id: 'ES12-M6-Q5', type: 'multiple_choice',
      prompt: 'Por que a aparência da apresentação se põe no mestre e não slide por slide?',
      data: { options: [
        { id: 'a', text: 'Porque aplicar à mão em quatro faz o quinto sair diferente.', correct: true },
        { id: 'b', text: 'Porque o mestre é mais rápido de abrir.', porque: 'Velocidade não tem nada a ver: o mestre resolve repetição.' },
        { id: 'c', text: 'Porque formatar o slide não funciona.', porque: 'Funciona, e vence o mestre — é justamente o que torna o defeito invisível.' },
        { id: 'd', text: 'Porque o mestre é o único que aceita a cor do clube.', porque: 'Qualquer slide aceita qualquer cor.' },
      ]},
      explanation: 'A identidade do conjunto é uma. Vinte slides formatados à mão são vinte chances de errar, e ninguém acerta vinte vezes seguidas.',
    },
    {
      id: 'ES12-M6-Q6', type: 'multiple_choice',
      prompt: 'O gráfico vinculado precisa de quê para funcionar no computador do clube?',
      data: { options: [
        { id: 'a', text: 'Que a planilha viaje junto.', correct: true },
        { id: 'b', text: 'Que o computador tenha a mesma versão do programa.', porque: 'Versão diferente abre o arquivo; o que falta é o que ele lê.' },
        { id: 'c', text: 'Que a apresentação esteja na nuvem.', porque: 'A nuvem ajuda a manter as duas juntas, e não é exigência do vínculo.' },
        { id: 'd', text: 'De nada: o vínculo guarda os dados dentro.', porque: 'Quem guarda dados dentro é o incorporado. O vínculo guarda o caminho.' },
      ]},
      explanation: 'Sem a planilha, o quadro fica vazio. É o preço do vínculo, e é por isso que as peças ficam juntas no repositório.',
    },
    {
      id: 'ES12-M6-Q7', type: 'multiple_choice',
      prompt: 'Qual é o jeito de um número chegar a uma peça que o requisito 8 recusa de todos?',
      data: { options: [
        { id: 'a', text: 'Digitar o número na peça.', correct: true },
        { id: 'b', text: 'Colar o gráfico como figura.', porque: 'Também não se propaga, e pelo menos se vê que é um retrato.' },
        { id: 'c', text: 'Incorporar uma cópia da planilha.', porque: 'Também não alcança a fonte, e ao menos acompanha a cópia dele.' },
        { id: 'd', text: 'Vincular à planilha de controle.', porque: 'Esse é o único que o requisito aceita.' },
      ]},
      explanation: 'Digitado não acompanha nada e não deixa pista nenhuma. Os outros dois também não se propagam, mas se denunciam.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 7 — O dossiê (requisito 3.5)
     ────────────────────────────────────────────────────────────────────── */
  'm7-teoria': [
    {
      id: 'ES12-M7-Q1', type: 'multiple_choice',
      prompt: 'O que decide quais peças entram no dossiê?',
      data: { options: [
        { id: 'a', text: 'Para quem o dossiê vai.', correct: true },
        { id: 'b', text: 'Quantas peças o conjunto tem.', porque: 'Reunir tudo é justamente o caminho que o requisito pede para não tomar.' },
        { id: 'c', text: 'Quais peças já estão em PDF.', porque: 'Qualquer peça exporta para PDF: isso não é critério.' },
        { id: 'd', text: 'Quais peças couberam no tamanho do arquivo.', porque: 'Tamanho se resolve comprimindo, e não escolhendo o que mostrar.' },
      ]},
      explanation: 'O dossiê é o que sai do clube. A planilha de controle tem os gastos e o nome de cada responsável, e nunca foi para as famílias.',
    },
    {
      id: 'ES12-M7-Q2', type: 'multiple_choice',
      prompt: 'Como um PDF nasce pesquisável?',
      data: { options: [
        { id: 'a', text: 'Exportado do programa que escreveu o texto.', correct: true },
        { id: 'b', text: 'Digitalizado com boa qualidade.', porque: 'Foto boa continua sendo foto: ela precisa de reconhecimento de texto depois.' },
        { id: 'c', text: 'Salvo com a opção de pesquisa marcada.', porque: 'Não há essa opção: a camada de texto vem de o programa saber quais letras escreveu.' },
        { id: 'd', text: 'Comprimido depois de gerado.', porque: 'Comprimir mexe nas imagens; a camada de texto já estava lá ou não estava.' },
      ]},
      explanation: 'O programa sabe quais letras escreveu, e grava essa camada junto. Quem digitaliza a via impressa recebe uma foto: abre igual, imprime igual, e a busca não acha uma palavra.',
    },
    {
      id: 'ES12-M7-Q3', type: 'multiple_choice',
      prompt: 'Combinar o mesmo documento três vezes dá um arquivo de três páginas. Isso reúne três peças?',
      data: { options: [
        { id: 'a', text: 'Não: há uma peça repetida três vezes.', correct: true },
        { id: 'b', text: 'Sim, se as páginas forem diferentes entre si.', porque: 'Elas são iguais: a origem é a mesma, e é a origem que o dossiê reúne.' },
        { id: 'c', text: 'Sim: o requisito pede páginas, e não peças.', porque: 'Ele pede reunir as peças destinadas a distribuição.' },
        { id: 'd', text: 'Depende de o arquivo final ser pesquisável.', porque: 'Pesquisável é outra conta, e vale para o conteúdo que estiver lá.' },
      ]},
      explanation: 'O número está certo e não é o número que a tarefa queria. Reunir se conta por origem, e não por página.',
    },
    {
      id: 'ES12-M7-Q4', type: 'true_false',
      prompt: 'Reconhecer texto num dossiê inteiro melhora todas as páginas dele.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'As páginas que já tinham texto exato são relidas, e texto exato vira texto adivinhado.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'As páginas que já tinham texto exato são relidas e trocadas por texto adivinhado — num arquivo que continua dizendo pesquisável.',
    },
    {
      id: 'ES12-M7-Q5', type: 'multiple_choice',
      prompt: 'Por que o dossiê é a peça que o requisito 8 não propaga?',
      data: { options: [
        { id: 'a', text: 'Porque um PDF guarda o retrato de quando saiu.', correct: true },
        { id: 'b', text: 'Porque ele não tem fórmula nenhuma.', porque: 'O documento também não tem, e ainda assim pode ler a planilha por vínculo.' },
        { id: 'c', text: 'Porque ele é feito depois das outras peças.', porque: 'A ordem não decide: o que decide é o PDF ser um retrato.' },
        { id: 'd', text: 'Porque ele é só para distribuição.', porque: 'Verdade, e não é a razão de ele não acompanhar.' },
      ]},
      explanation: 'É o que faz o PDF servir para distribuir: ele chega a todo mundo igual. O preço é que mudança depois dele pede exportar de novo.',
    },
    {
      id: 'ES12-M7-Q6', type: 'multiple_choice',
      prompt: 'Qual é a ordem certa entre reduzir o tamanho e reconhecer o texto de uma página digitalizada?',
      data: { options: [
        { id: 'a', text: 'Reconhecer primeiro, reduzir depois.', correct: true },
        { id: 'b', text: 'Reduzir primeiro, para o reconhecimento ser mais rápido.', porque: 'Ele fica mais rápido e lê menos: a nitidez que se joga fora não volta.' },
        { id: 'c', text: 'A ordem não muda o resultado.', porque: 'Muda, e não aparece: o arquivo encolhe o mesmo tanto nos dois casos.' },
        { id: 'd', text: 'Nunca se faz as duas no mesmo arquivo.', porque: 'Faz-se as duas sempre: foto de papel pesa muito e precisa de texto dentro.' },
      ]},
      explanation: 'A nitidez só desce. Reduzir antes deixa o reconhecimento com menos para ler, e o texto sai furado — com o arquivo dizendo pesquisável.',
    },
    {
      id: 'ES12-M7-Q7', type: 'multiple_choice',
      prompt: 'Não permitir copiar num PDF é o quê?',
      data: { options: [
        { id: 'a', text: 'Um pedido ao programa que abre o arquivo.', correct: true },
        { id: 'b', text: 'Uma trava que impede a cópia.', porque: 'Nada impede: quem abre com outro programa copia o texto inteiro.' },
        { id: 'c', text: 'Uma senha que protege o conteúdo.', porque: 'Senha é outra coisa, e quem a sabe salva o arquivo sem ela.' },
        { id: 'd', text: 'Uma marca que registra quem copiou.', porque: 'Nada é registrado: o arquivo não sabe quem o abriu.' },
      ]},
      explanation: 'Quem confia nela e manda o documento adiante é quem paga. O que a restrição faz é pedir — e programa nenhum é obrigado a obedecer.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 8 — O repositório (requisitos 5 e 6)
     ────────────────────────────────────────────────────────────────────── */
  'm8-teoria': [
    {
      id: 'ES12-M8-Q1', type: 'multiple_choice',
      prompt: 'Por que as pastas do projeto seguem um molde só de nome?',
      data: { options: [
        { id: 'a', text: 'Para as pastas de cada ano ficarem em ordem.', correct: true },
        { id: 'b', text: 'Porque a nuvem exige nomes parecidos.', porque: 'Ela aceita qualquer nome: o padrão é disciplina de quem organiza.' },
        { id: 'c', text: 'Para o acesso por função funcionar.', porque: 'Permissão não depende de nome nenhum.' },
        { id: 'd', text: 'Para a busca achar as pastas.', porque: 'A busca acha qualquer nome; o que ela não faz é ordenar o que não tem padrão.' },
      ]},
      explanation: 'Feira, documentos_feira e CONTAS DA FEIRA 2026 são três moldes. No ano que vem aparecem quatro pastas novas ao lado destas, e nada diz qual é de qual ano.',
    },
    {
      id: 'ES12-M8-Q2', type: 'multiple_choice',
      prompt: 'O que a data e a versão no nome resolvem que o molde sozinho não resolve?',
      data: { options: [
        { id: 'a', text: 'Dizem qual é a mais nova.', correct: true },
        { id: 'b', text: 'Garantem que os nomes não se repitam.', porque: 'O molde já evita confusão de forma; repetição exata é outro problema.' },
        { id: 'c', text: 'Deixam a ordem alfabética igual à de criação.', porque: 'Isso é consequência da data, e não o que ela resolve.' },
        { id: 'd', text: 'Mostram quem criou a pasta.', porque: 'Quem criou está na propriedade do arquivo, e não no nome.' },
      ]},
      explanation: 'Dez nomes no mesmo molde e sem data nenhuma não ordenam. São duas contas, e nenhuma substitui a outra.',
    },
    {
      id: 'ES12-M8-Q3', type: 'multiple_choice',
      prompt: 'O que significa dar permissão por função em vez de por pessoa?',
      data: { options: [
        { id: 'a', text: 'Quem tem acesso é quem exerce aquele papel no clube.', correct: true },
        { id: 'b', text: 'Cada pessoa recebe só um papel na nuvem.', porque: 'A mesma pessoa pode ser editora de uma pasta e leitora de outra.' },
        { id: 'c', text: 'A nuvem calcula o acesso sozinha.', porque: 'Ela não sabe quem é tesoureiro: a disciplina é de quem compartilha.' },
        { id: 'd', text: 'O acesso vale para todos os arquivos do clube.', porque: 'Ele vale para a pasta e para o que está dentro dela.' },
      ]},
      explanation: 'Permissão dada a uma pessoa morre com a saída dela. Dada à função, a transferência é tirar quem saiu e pôr quem entrou.',
    },
    {
      id: 'ES12-M8-Q4', type: 'true_false',
      prompt: 'Quem abriu um arquivo muitas vezes aparece no histórico de versões dele.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O histórico nomeia quem escreveu, e ler não é participar.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O histórico nomeia quem escreveu. Ler não é participar, e um histórico que contasse leitura deixaria "produzimos juntos" verdadeiro para quem só olhou.',
    },
    {
      id: 'ES12-M8-Q5', type: 'multiple_choice',
      prompt: 'Alguém do conselho ficou editor da pasta da tesouraria em março e ninguém tirou. Qual é o custo?',
      data: { options: [
        { id: 'a', text: 'A pasta de contas fica aberta para quem não é dela.', correct: true },
        { id: 'b', text: 'A pasta passa a aparecer na busca dele.', porque: 'Aparece, e isso é o sintoma: o problema é o que ele pode fazer lá.' },
        { id: 'c', text: 'O acesso dele expira sozinho depois de um tempo.', porque: 'Não expira: acesso dado fica até alguém tirar.' },
        { id: 'd', text: 'Nenhum: ele não vai mexer em nada.', porque: 'Ninguém apaga de propósito — apaga arrastando.' },
      ]},
      explanation: 'Acesso a mais não acusa nada. Ele fica, e o que o revela é comparar quem tem acesso com quem exerce a função.',
    },
    {
      id: 'ES12-M8-Q6', type: 'multiple_choice',
      prompt: 'A tesoureira não tem acesso à pasta das contas. O que acontece?',
      data: { options: [
        { id: 'a', text: 'Ela vai pedir os arquivos por mensagem.', correct: true },
        { id: 'b', text: 'A nuvem avisa quem é dono da pasta.', porque: 'Pode haver pedido de acesso, e o que resolve é alguém atender.' },
        { id: 'c', text: 'Ela perde o cargo de tesoureira.', porque: 'O cargo é do clube; o acesso é da pasta.' },
        { id: 'd', text: 'Nada: ela alcança pela pasta de cima.', porque: 'Só se a pasta de cima lhe der acesso — e dar editor na raiz é o contrário de por função.' },
      ]},
      explanation: 'E aí o arquivo circula por anexo, que é como nasce a cópia que divergiu. Acesso a menos custa tanto quanto acesso a mais, e são erros diferentes.',
    },
    {
      id: 'ES12-M8-Q7', type: 'multiple_choice',
      prompt: 'Por que a permissão da pasta alcança o que está dentro dela?',
      data: { options: [
        { id: 'a', text: 'Porque é assim que a nuvem resolve herança.', correct: true },
        { id: 'b', text: 'Porque os arquivos não têm permissão própria.', porque: 'Têm: e o mais permissivo entre as duas é o que vale.' },
        { id: 'c', text: 'Porque quem move um arquivo leva o acesso dele.', porque: 'Mover troca de pasta, e aí vale a herança da pasta nova.' },
        { id: 'd', text: 'Porque a pasta é um arquivo como os outros.', porque: 'Ela é um arquivo de tipo pasta, e o que decide aqui é a herança.' },
      ]},
      explanation: 'O efeito que ninguém espera é o contrário: pôr um arquivo restrito numa pasta aberta não o restringe — ele continua com o restrito escrito na caixa dele, e todo mundo o abre.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 9 — As instruções (requisito 7)
     ────────────────────────────────────────────────────────────────────── */
  'm9-teoria': [
    {
      id: 'ES12-M9-Q1', type: 'multiple_choice',
      prompt: 'Qual destas é a instrução que quase ninguém escreve?',
      data: { options: [
        { id: 'a', text: 'O que não se mexe, e por quê.', correct: true },
        { id: 'b', text: 'Por onde começar.', porque: 'Essa é a primeira que todo mundo escreve, porque é a que se pergunta primeiro.' },
        { id: 'c', text: 'O que se troca a cada ano.', porque: 'Essa sai fácil: são as datas e os valores.' },
        { id: 'd', text: 'Como transferir o acesso.', porque: 'O requisito a exige com todas as letras, então ela raramente falta.' },
      ]},
      explanation: 'É a que evita alguém apagar o vínculo sem saber que era ele que fazia o conjunto funcionar — e o conjunto volta a ser cinco arquivos soltos.',
    },
    {
      id: 'ES12-M9-Q2', type: 'multiple_choice',
      prompt: 'Dar acesso de editar a alguém é o mesmo que passar o arquivo para a conta dele?',
      data: { options: [
        { id: 'a', text: 'Não: o arquivo continua morando na conta do dono.', correct: true },
        { id: 'b', text: 'Sim, se o acesso for de editor.', porque: 'Editor escreve no arquivo; dono é quem o guarda.' },
        { id: 'c', text: 'Sim, depois que ele editar pela primeira vez.', porque: 'Editar não transfere nada: a propriedade só muda por gesto próprio.' },
        { id: 'd', text: 'Depende de quem criou o arquivo.', porque: 'Quem criou é o dono inicial, e a distinção vale igual para qualquer dono.' },
      ]},
      explanation: 'Quando o dono sai do clube é a conta dele que some — e os arquivos somem junto, por mais gente que tivesse acesso.',
    },
    {
      id: 'ES12-M9-Q3', type: 'multiple_choice',
      prompt: 'Quem entrega a propriedade de um arquivo perde o acesso a ele?',
      data: { options: [
        { id: 'a', text: 'Não: continua como editor.', correct: true },
        { id: 'b', text: 'Sim: a transferência troca o dono e limpa a lista.', porque: 'A lista fica: quem entrega vira editor.' },
        { id: 'c', text: 'Sim, a menos que peça acesso de volta.', porque: 'Não precisa pedir nada: ele continua na lista.' },
        { id: 'd', text: 'Depende do papel que ele tinha antes.', porque: 'Ele era dono, que é mais que editor, e fica editor.' },
      ]},
      explanation: 'Se perdesse, ninguém transferiria nunca — e o clube ficaria com tudo na conta de uma pessoa, que é o que a transferência existe para desfazer.',
    },
    {
      id: 'ES12-M9-Q4', type: 'true_false',
      prompt: 'Só se transfere a propriedade de um arquivo para quem já tem acesso a ele.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'A ordem é dar o acesso e transferir depois, e é por isso que a transferência mora no seletor de papel de quem recebe.' },
      ]},
      explanation: 'A ordem é dar o acesso e transferir depois. É por isso que a transferência mora dentro do seletor de papel de quem recebe, e não num botão à parte.',
    },
    {
      id: 'ES12-M9-Q5', type: 'multiple_choice',
      prompt: 'Para quem as instruções de uso são escritas?',
      data: { options: [
        { id: 'a', text: 'Para quem não estava aqui quando o conjunto foi montado.', correct: true },
        { id: 'b', text: 'Para o examinador que avalia o projeto.', porque: 'Ele avalia o conjunto inteiro; as instruções são para quem vai reaproveitá-lo.' },
        { id: 'c', text: 'Para quem fez o conjunto, lembrar depois.', porque: 'Serve de lembrete, e quem precisa de verdade é quem nunca viu.' },
        { id: 'd', text: 'Para os desbravadores que preenchem o formulário.', porque: 'Eles só respondem: as instruções são de quem opera o conjunto.' },
      ]},
      explanation: 'A diretoria do ano que vem não sabe por que a célula do total é fórmula. Quem escreve supondo que o leitor sabe escreve para ninguém.',
    },
    {
      id: 'ES12-M9-Q6', type: 'multiple_choice',
      prompt: 'Onde as instruções do conjunto ficam melhor guardadas?',
      data: { options: [
        { id: 'a', text: 'Na descrição da pasta do projeto.', correct: true },
        { id: 'b', text: 'Num documento à parte, com as outras peças.', porque: 'Vira uma sexta peça que ninguém abre, porque nada aponta para ela.' },
        { id: 'c', text: 'No começo do regulamento.', porque: 'O regulamento vai para as famílias: as instruções são de quem opera o conjunto.' },
        { id: 'd', text: 'Numa mensagem para a diretoria nova.', porque: 'Mensagem se perde na caixa de quem a recebeu, e o conjunto fica sem elas.' },
      ]},
      explanation: 'É onde a próxima diretoria vai de fato olhar: ela abre a pasta antes de abrir qualquer peça.',
    },
    {
      id: 'ES12-M9-Q7', type: 'multiple_choice',
      prompt: 'O conjunto está todo na conta de uma pessoa e ela sai do clube. O que o clube perde?',
      data: { options: [
        { id: 'a', text: 'As cinco peças, por mais gente que tivesse acesso.', correct: true },
        { id: 'b', text: 'Só o direito de editar as peças.', porque: 'Perde-se o arquivo, e não só a permissão: ele mora na conta que foi fechada.' },
        { id: 'c', text: 'Nada, se alguém tiver feito uma cópia.', porque: 'A cópia salva o conteúdo e não o conjunto: ela não tem os vínculos nem o histórico.' },
        { id: 'd', text: 'Apenas o histórico de versões.', porque: 'O histórico vai junto do arquivo, e o arquivo vai junto da conta.' },
      ]},
      explanation: 'É por isso que o requisito 7 pede a forma de transferir acesso: conjunto do clube mora em conta do clube.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 10 — Os quinze minutos (requisito 8)
     ────────────────────────────────────────────────────────────────────── */
  'm10-teoria': [
    {
      id: 'ES12-M10-Q1', type: 'multiple_choice',
      prompt: 'O que a demonstração de quinze minutos mostra?',
      data: { options: [
        { id: 'a', text: 'Um dado mudando e chegando nas outras peças.', correct: true },
        { id: 'b', text: 'Cada uma das cinco peças, uma a uma.', porque: 'Quem abre as cinco gasta os quinze sem chegar ao que o requisito pede para ver.' },
        { id: 'c', text: 'O trabalho que cada pessoa fez no conjunto.', porque: 'Isso está no histórico de versões, e é o requisito 6.' },
        { id: 'd', text: 'As decisões tomadas na proposta.', porque: 'A proposta foi aprovada antes: a demonstração é do conjunto funcionando.' },
      ]},
      explanation: 'Abra pelo dado que muda, e não pela primeira peça. O que se mostra é o conjunto reagindo.',
    },
    {
      id: 'ES12-M10-Q2', type: 'multiple_choice',
      prompt: 'Depois de uma inscrição nova entrar, o que precisa ser feito de novo à mão?',
      data: { options: [
        { id: 'a', text: 'Exportar o dossiê.', correct: true },
        { id: 'b', text: 'Atualizar o total da planilha.', porque: 'Ele é fórmula: refaz-se sozinho.' },
        { id: 'c', text: 'Corrigir o número no regulamento.', porque: 'Ele está vinculado: passa a dizer o que a planilha disser.' },
        { id: 'd', text: 'Refazer o gráfico da apresentação.', porque: 'Ele lê a planilha: muda junto.' },
      ]},
      explanation: 'O PDF congela. Entregar às famílias um dossiê gerado antes da mudança é entregar o número de antes, com todo o resto do conjunto certo.',
    },
    {
      id: 'ES12-M10-Q3', type: 'multiple_choice',
      prompt: 'Qual é o sinal de que o conjunto ainda não tem uma fonte da verdade?',
      data: { options: [
        { id: 'a', text: 'Mudar um dado e só uma peça mudar.', correct: true },
        { id: 'b', text: 'Duas peças mostrarem números diferentes.', porque: 'Esse é o resultado; o sinal aparece antes, quando a mudança não viaja.' },
        { id: 'c', text: 'As peças estarem em programas diferentes.', porque: 'Cinco programas é a premissa do requisito 3, e não defeito.' },
        { id: 'd', text: 'O dossiê ficar desatualizado.', porque: 'Ele fica sempre: PDF é retrato, e exportar de novo é o conserto previsto.' },
      ]},
      explanation: 'Enquanto alguma peça não acompanha, o conjunto conta dois números para a mesma feira — e nenhum com cara de errado.',
    },
    {
      id: 'ES12-M10-Q4', type: 'true_false',
      prompt: 'Um número digitado que por acaso está igual ao da planilha hoje não é problema hoje.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Hoje ele não está divergindo: está esperando — e quando divergir, nada na tela vai dizer.' },
      ]},
      explanation: 'Hoje, não. Ele não está divergindo — está esperando. E quando divergir, nada na tela vai dizer.',
    },
    {
      id: 'ES12-M10-Q5', type: 'multiple_choice',
      prompt: 'Por que quinze minutos são pouco para cinco peças?',
      data: { options: [
        { id: 'a', text: 'Porque o tempo obriga a mostrar o conjunto e não as telas.', correct: true },
        { id: 'b', text: 'Porque cinco peças não cabem em quinze minutos.', porque: 'Cabem, abrindo cada uma por três minutos — e aí não sobra tempo para o que importa.' },
        { id: 'c', text: 'Porque o examinador tem pressa.', porque: 'O limite é do requisito, e serve ao que se demonstra.' },
        { id: 'd', text: 'Porque a demonstração é só do dado que muda.', porque: 'As peças aparecem; o que o tempo decide é quanto de cada uma.' },
      ]},
      explanation: 'O limite é a pergunta disfarçada: o que você mostraria se só pudesse mostrar uma coisa? A resposta é o dado se propagando.',
    },
    {
      id: 'ES12-M10-Q6', type: 'multiple_choice',
      prompt: 'Vincular um número no documento e deixar o retrato antigo guardado dá o quê?',
      data: { options: [
        { id: 'a', text: 'Um número velho num lugar que diz ler a planilha.', correct: true },
        { id: 'b', text: 'Um erro de vínculo quebrado.', porque: 'O vínculo está de pé: o que está velho é o valor mostrado.' },
        { id: 'c', text: 'Um aviso do programa ao abrir o arquivo.', porque: 'Nenhum programa avisa: o número é plausível.' },
        { id: 'd', text: 'O mesmo que não ter vinculado.', porque: 'É pior: agora nada mais indica que aquele número pode estar velho.' },
      ]},
      explanation: 'Vincular, no Word e no PowerPoint, atualiza na hora. Vínculo com retrato velho é o pior dos dois mundos, porque agora nada avisa.',
    },
    {
      id: 'ES12-M10-Q7', type: 'multiple_choice',
      prompt: 'Qual destas é a prova de que o conjunto tem uma fonte da verdade?',
      data: { options: [
        { id: 'a', text: 'Mexer num lugar e as outras peças mudarem.', correct: true },
        { id: 'b', text: 'Todas as peças mostrarem o mesmo número.', porque: 'Elas mostram, no dia em que foram feitas: é assim que um conjunto com cinco fontes começa.' },
        { id: 'c', text: 'Todas as peças estarem na mesma pasta.', porque: 'Pasta é organização: ela não liga número nenhum.' },
        { id: 'd', text: 'A planilha ter todas as contas em fórmula.', porque: 'Isso resolve a planilha; as outras quatro peças continuam por conta delas.' },
      ]},
      explanation: 'Concordar hoje é fácil. O que distingue uma fonte de cinco é o que acontece quando o dado muda.',
    },
  ],
};
