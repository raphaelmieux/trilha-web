import type { Question } from '../types';

/*
 * As questões das lições de teoria da CC-ES008 Dados e Formulários.
 *
 * ── O que elas medem ──────────────────────────────────────────────────────
 * A definição vale uma vez. Depois dela vêm consequência, discriminação e
 * diagnóstico — e nesta vereda o diagnóstico carrega quase tudo, porque a
 * matéria inteira é feita de telas que parecem certas: o telefone guardado
 * como número, que continua sendo um número válido; a soma que pula duas
 * células e devolve um total plausível e menor; o resumo que relata dez
 * unidades com o total de respostas certo; o CSV que fica na pasta de
 * downloads para sempre.
 *
 * ── E há um segundo eixo: o que parece a mesma coisa e não é ──────────────
 * Tipo e validação. Base e relatório. Contagem e soma. Consertar e apagar.
 * Ordenar a agenda e gerar um relatório ordenado. Vírgula e ponto e vírgula.
 * Cada par tem uma questão que obriga a separá-los, porque confundi-los é o
 * que custa caro depois — e nenhum deles dá erro no dia em que se confunde.
 *
 * Toda alternativa errada diz por que está errada, no campo porque, e a certa
 * não carrega motivo nenhum: o porquê tem lugar próprio, o explanation. E nada
 * de crase nem de asterisco — a questão vai para o QuestionRenderer, que
 * imprime texto puro.
 *
 * A alternativa certa é uma afirmação curta, de propósito. O hábito de pôr o
 * porquê dentro dela entrega a resposta pelo tamanho, e quem nunca estudou
 * passa escolhendo a mais comprida — a CC-ES006 abriu com 18% das questões
 * assim e a CC-ES007 com mais da metade. A conta se faz sobre este arquivo
 * sozinho, antes de abrir: diluída em mil e quinhentas questões do corpus,
 * ela não diz nada sobre o arquivo novo.
 */

export const QUESTOES_DE_DADOS: Record<string, Question[]> = {
  /* ──────────────────────────────────────────────────────────────────────
     Módulo 1 — Registro, campo e tipo (requisitos 2.1, 2.2 e 4)
     ────────────────────────────────────────────────────────────────────── */
  'm1-teoria': [
    {
      id: 'ES8-M1-Q1', type: 'multiple_choice',
      prompt: 'Numa tabela de inscrições, o que é um registro?',
      data: { options: [
        { id: 'a', text: 'Uma linha inteira, com tudo sobre um desbravador.', correct: true },
        { id: 'b', text: 'Uma coluna inteira, com uma pergunta.', porque: 'A coluna é o campo: ela guarda a mesma pergunta para todo mundo.' },
        { id: 'c', text: 'A primeira linha, com os nomes das colunas.', porque: 'Essa é o cabeçalho. Ela diz o nome dos campos e não é resposta de ninguém.' },
        { id: 'd', text: 'A planilha toda.', porque: 'A planilha guarda muitos registros. Um registro é um deles.' },
      ]},
      explanation: 'Registro é tudo o que se sabe sobre uma coisa; campo é uma das coisas que se pergunta. Linha e coluna.',
    },
    {
      id: 'ES8-M1-Q2', type: 'multiple_choice',
      prompt: 'Por que telefone se guarda como texto, e não como número?',
      data: { options: [
        { id: 'a', text: 'Porque o zero da frente, os parênteses e o traço se perdem.', correct: true },
        { id: 'b', text: 'Porque telefone tem letras.', porque: 'Não tem. O problema não são os caracteres proibidos: são os que o tipo Número joga fora.' },
        { id: 'c', text: 'Porque telefone é comprido demais para um número.', porque: 'O comprimento cabe. O que não cabe é a forma de escrever.' },
        { id: 'd', text: 'Porque o formulário não deixa escolher Número ali.', porque: 'Deixa, e aceita sem reclamar. É justamente por isso que o erro passa.' },
      ]},
      explanation: 'O teste é sempre o mesmo: essa coisa entra em conta? Somar dois telefones não quer dizer nada, então o campo é texto.',
    },
    {
      id: 'ES8-M1-Q3', type: 'multiple_choice',
      prompt: 'O formulário tem cinco perguntas de resposta curta. Quantos tipos de resposta ele usa?',
      data: { options: [
        { id: 'a', text: 'Um.', correct: true },
        { id: 'b', text: 'Cinco.', porque: 'Cinco é o número de campos. O requisito conta tipos, que é outra coisa.' },
        { id: 'c', text: 'Depende de quantas pessoas responderam.', porque: 'O tipo é da pergunta, e não da resposta: ele vale antes de alguém responder.' },
        { id: 'd', text: 'Dois, porque o cabeçalho também conta.', porque: 'O cabeçalho é o nome dos campos, e não um tipo de resposta.' },
      ]},
      explanation: 'Campo é cada pergunta; tipo é o que aquela pergunta aceita. Cinco campos podem ter um tipo só.',
    },
    {
      id: 'ES8-M1-Q4', type: 'true_false',
      prompt: 'Perguntar a unidade em texto livre dá o mesmo resultado que perguntar em lista.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Em texto livre cada família escreve de um jeito, e a mesma unidade vira quatro valores diferentes para a planilha.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'A lista fecha o conjunto de respostas possíveis na origem. O texto livre deixa a correção para depois, quando ela custa caro.',
    },
    {
      id: 'ES8-M1-Q5', type: 'multiple_choice',
      prompt: 'Uma coluna de datas foi guardada como texto. O que acontece ao ordená-la?',
      data: { options: [
        { id: 'a', text: 'Ela sai em ordem de letra, e não de calendário.', correct: true },
        { id: 'b', text: 'A planilha avisa que aquilo não é data.', porque: 'Ela não avisa nada: ordenar texto é uma operação perfeitamente válida.' },
        { id: 'c', text: 'As datas somem da coluna.', porque: 'Nada some. O que muda é a ordem em que elas aparecem.' },
        { id: 'd', text: 'Sai igual a se fossem datas de verdade.', porque: 'Só por acaso, num conjunto pequeno. 10 de janeiro vem antes de 2 de fevereiro em ordem de letra.' },
      ]},
      explanation: 'O tipo decide o que dá para fazer com a coluna depois. Data como texto ordena como palavra.',
    },
    {
      id: 'ES8-M1-Q6', type: 'multiple_choice',
      prompt: 'Qual destes campos faz sentido guardar como número?',
      data: { options: [
        { id: 'a', text: 'Quantas diárias.', correct: true },
        { id: 'b', text: 'CEP.', porque: 'CEP não entra em conta, e começa com zero em boa parte do país — o tipo Número o apagaria.' },
        { id: 'c', text: 'Número da casa.', porque: 'Existe casa 12A e casa 5 fundos. E somar dois números de casa não quer dizer nada.' },
        { id: 'd', text: 'Código de inscrição.', porque: 'Ele identifica, e não mede. Somar dois códigos não quer dizer nada.' },
      ]},
      explanation: 'Número serve para quantidade, valor e medida. O resto, ainda que só tenha algarismos, é texto.',
    },
    {
      id: 'ES8-M1-Q7', type: 'matching',
      prompt: 'Ligue cada pergunta ao tipo de resposta que combina com ela.',
      data: { pairs: [
        { left: 'Quantas diárias', right: 'Número' },
        { left: 'Unidade', right: 'Lista suspensa' },
        { left: 'Telefone do responsável', right: 'Texto curto' },
        { left: 'Alguma observação', right: 'Parágrafo' },
      ]},
      explanation: 'O tipo se escolhe pela pergunta, e não pelo que parece: a unidade tem seis respostas possíveis, e o telefone tem forma de escrever.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 2 — Obrigatório e validação (requisitos 2.4 e 4)
     ────────────────────────────────────────────────────────────────────── */
  'm2-teoria': [
    {
      id: 'ES8-M2-Q1', type: 'multiple_choice',
      prompt: 'O que a validação faz que o tipo de dado não faz?',
      data: { options: [
        { id: 'a', text: 'Diz o que vale dentro do que o tipo deixa caber.', correct: true },
        { id: 'b', text: 'Impede que a pessoa envie o formulário.', porque: 'Isso é o campo obrigatório, e ele age sobre o vazio. A validação age sobre o que foi escrito.' },
        { id: 'c', text: 'Confere se a resposta é verdadeira.', porque: 'Ela confere a forma, e não a verdade: um endereço bem escrito pode não existir.' },
        { id: 'd', text: 'Corrige a resposta automaticamente.', porque: 'Ela recusa e devolve para a pessoa corrigir. Nenhuma validação reescreve o que foi digitado.' },
      ]},
      explanation: '"Isto é um número?" é tipo. "Este número faz sentido para a pergunta que eu fiz?" é validação.',
    },
    {
      id: 'ES8-M2-Q2', type: 'multiple_choice',
      prompt: 'Você liga hoje o campo de e-mail como obrigatório. O que acontece com as duas respostas antigas que vieram sem e-mail?',
      data: { options: [
        { id: 'a', text: 'Continuam lá, vazias.', correct: true },
        { id: 'b', text: 'São apagadas da lista.', porque: 'Nada é apagado. As respostas já coletadas não são reavaliadas.' },
        { id: 'c', text: 'O formulário avisa as duas famílias.', porque: 'Ele não manda nada a ninguém. Quem avisa é você.' },
        { id: 'd', text: 'Ficam marcadas como incompletas na planilha.', porque: 'Não há marca nenhuma. Elas parecem iguais às outras, só sem aquele campo.' },
      ]},
      explanation: 'O interruptor fecha a porta daqui para a frente. Ele não volta no tempo e não avisa ninguém.',
    },
    {
      id: 'ES8-M2-Q3', type: 'multiple_choice',
      prompt: 'Uma regra "número entre" foi escolhida com as duas caixas em branco. O que ela faz?',
      data: { options: [
        { id: 'a', text: 'Vira "entre zero e zero" e recusa quase tudo.', correct: true },
        { id: 'b', text: 'Fica desligada até alguém preencher.', porque: 'Ela fica escrita no campo e age. É por isso que a caixa em branco é perigosa.' },
        { id: 'c', text: 'Aceita qualquer número, porque não há limite escrito.', porque: 'Campo em branco costuma valer zero, e não "sem limite". O resultado é uma faixa fechada em zero.' },
        { id: 'd', text: 'O formulário se recusa a salvar a regra.', porque: 'Ele salva. A caixa vazia é um valor como outro qualquer para quem grava.' },
      ]},
      explanation: 'O jeito de saber é visualizar e responder errado de propósito. Regra que não recusa nada não está de pé.',
    },
    {
      id: 'ES8-M2-Q4', type: 'true_false',
      prompt: 'Um e-mail aceito pela validação existe de verdade.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'A regra confere a forma: um arroba, alguma coisa dos dois lados e um ponto depois. Nada disso prova que a caixa existe.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Validação é sobre forma. Para saber se o endereço existe, só mandando alguma coisa para ele.',
    },
    {
      id: 'ES8-M2-Q5', type: 'multiple_choice',
      prompt: 'Qual campo do formulário de inscrição faz mais sentido marcar como obrigatório?',
      data: { options: [
        { id: 'a', text: 'O e-mail do responsável.', correct: true },
        { id: 'b', text: 'A observação sobre comida.', porque: 'Quem não tem restrição nenhuma não tem o que escrever, e ficaria travado na tela.' },
        { id: 'c', text: 'Todos eles.', porque: 'Marcar tudo é o jeito mais rápido de alguém desistir no meio do preenchimento.' },
        { id: 'd', text: 'Nenhum, para não atrapalhar quem responde.', porque: 'Sem nenhum obrigatório, chega inscrição sem como avisar a família de uma mudança de horário.' },
      ]},
      explanation: 'Obrigatório é para o que o clube não pode ficar sem, e não para tudo o que seria bom ter.',
    },
    {
      id: 'ES8-M2-Q6', type: 'multiple_choice',
      prompt: 'Você ligou uma validação e quer saber se ela funciona. O que fazer?',
      data: { options: [
        { id: 'a', text: 'Visualizar e tentar responder errado.', correct: true },
        { id: 'b', text: 'Conferir se a regra está escrita no cartão da pergunta.', porque: 'Estar escrita é o que toda regra em branco também está. O que se confere é se ela recusa.' },
        { id: 'c', text: 'Olhar as respostas que já chegaram.', porque: 'Elas vieram antes da regra, e por isso não dizem nada sobre ela.' },
        { id: 'd', text: 'Enviar o formulário para alguém e esperar.', porque: 'Você descobriria depois, e só se a pessoa errasse. Visualizar custa um clique.' },
      ]},
      explanation: 'Interruptor que você liga e nunca vê agir é interruptor que pode não estar fazendo nada.',
    },
    {
      id: 'ES8-M2-Q7', type: 'multiple_choice',
      prompt: 'Qual destas duas coisas o campo obrigatório resolve?',
      data: { options: [
        { id: 'a', text: 'A resposta em branco.', correct: true },
        { id: 'b', text: 'A resposta errada.', porque: 'Uma resposta errada está preenchida, e o obrigatório só olha se há alguma coisa ali.' },
        { id: 'c', text: 'A resposta repetida.', porque: 'A mesma pessoa pode responder duas vezes com tudo preenchido. Quem pega isso é a chave.' },
        { id: 'd', text: 'A resposta fora da faixa.', porque: 'Isso é validação. O obrigatório não olha o conteúdo, só a presença.' },
      ]},
      explanation: 'Obrigatório age sobre o vazio; validação age sobre o que foi escrito. São duas portas diferentes.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 3 — Base de dados e relatório (requisitos 3, 2.3 e 5.1)
     ────────────────────────────────────────────────────────────────────── */
  'm3-teoria': [
    {
      id: 'ES8-M3-Q1', type: 'multiple_choice',
      prompt: 'Qual é a diferença entre uma planilha usada como base e uma usada como relatório?',
      data: { options: [
        { id: 'a', text: 'A base guarda; o relatório mostra.', correct: true },
        { id: 'b', text: 'A base é maior que o relatório.', porque: 'O tamanho é consequência, e nem sempre: um relatório de doze unidades pode ser maior que uma base de cinco registros.' },
        { id: 'c', text: 'A base tem fórmulas e o relatório não.', porque: 'É quase o contrário: as contas costumam morar no relatório, e a base guarda o que chegou.' },
        { id: 'd', text: 'São nomes diferentes para a mesma coisa.', porque: 'Se fossem, misturar as duas não causaria problema nenhum — e causa.' },
      ]},
      explanation: 'São dois trabalhos diferentes na mesma pasta, e é por isso que ficam em abas separadas.',
    },
    {
      id: 'ES8-M3-Q2', type: 'multiple_choice',
      prompt: 'Uma linha "TOTAL" foi escrita logo abaixo do último inscrito. O que ela causa?',
      data: { options: [
        { id: 'a', text: 'Ela entra na contagem como mais um inscrito.', correct: true },
        { id: 'b', text: 'Ela faz a soma dar erro.', porque: 'A soma funciona. O problema é que a linha passa a ser lida como registro por tudo o que lê a tabela.' },
        { id: 'c', text: 'Ela impede de ordenar a tabela.', porque: 'A ordenação acontece, e leva o TOTAL junto — para o meio da lista, se for o caso.' },
        { id: 'd', text: 'Nada, porque a planilha sabe que é um total.', porque: 'A planilha não sabe. Para ela, é uma linha com texto na primeira coluna e um número na quinta.' },
      ]},
      explanation: 'O erro não estoura: a planilha abre, soma e imprime. O que ela faz é contar o TOTAL como um inscrito.',
    },
    {
      id: 'ES8-M3-Q3', type: 'multiple_choice',
      prompt: 'O que é a chave de um registro?',
      data: { options: [
        { id: 'a', text: 'O que não se repete.', correct: true },
        { id: 'b', text: 'A primeira coluna da tabela.', porque: 'A posição não faz chave. A primeira coluna pode ser o nome, que se repete.' },
        { id: 'c', text: 'O campo mais importante do formulário.', porque: 'Importância é outra coisa. O e-mail pode ser o campo mais útil e ainda assim se repetir na mesma família.' },
        { id: 'd', text: 'A senha que protege a planilha.', porque: 'Chave aqui não tem nada a ver com segurança: é identificação de registro.' },
      ]},
      explanation: 'Dois desbravadores podem ter o mesmo nome. Chave é o que nasce único: um código, um instante de envio, uma matrícula.',
    },
    {
      id: 'ES8-M3-Q4', type: 'true_false',
      prompt: 'Pôr um título em cima do cabeçalho deixa a base mais organizada.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Ele empurra o cabeçalho para a segunda linha, e quem procurar a primeira coluna da tabela acha o título.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Título é de relatório. Na base, ele é uma linha a mais que tudo o que lê a tabela vai tentar entender.',
    },
    {
      id: 'ES8-M3-Q5', type: 'multiple_choice',
      prompt: 'O que a importação faz com as respostas escritas de jeitos diferentes?',
      data: { options: [
        { id: 'a', text: 'Traz cada uma como foi digitada.', correct: true },
        { id: 'b', text: 'Junta as que são parecidas.', porque: 'Juntar por baixo esconderia o problema em vez de mostrá-lo, e você nunca saberia o que foi alterado.' },
        { id: 'c', text: 'Recusa as que não estão na lista.', porque: 'A importação não recusa nada: ela copia o que o formulário guardou.' },
        { id: 'd', text: 'Corrige o acento e a caixa.', porque: 'Ela não reescreve nada. O espaço atrás também chega junto.' },
      ]},
      explanation: 'A planilha importada é matéria-prima: ela precisa virar base antes de virar relatório.',
    },
    {
      id: 'ES8-M3-Q6', type: 'multiple_choice',
      prompt: 'Duas linhas têm o mesmo nome e o mesmo instante de envio. O que isso quer dizer?',
      data: { options: [
        { id: 'a', text: 'É a mesma resposta, gravada duas vezes.', correct: true },
        { id: 'b', text: 'São dois desbravadores com o mesmo nome.', porque: 'Dois envios diferentes não caem no mesmo instante. A coincidência de nome não explica a de horário.' },
        { id: 'c', text: 'Alguém alterou a planilha.', porque: 'Pode ser, mas o sinal não diz isso: o que ele diz é que aquele registro está repetido.' },
        { id: 'd', text: 'A importação falhou.', porque: 'A importação copia o que existe. Se há duas linhas iguais, elas estão nas respostas.' },
      ]},
      explanation: 'É a chave trabalhando: o instante do envio é o que distingue duas pessoas com o mesmo nome — e o que denuncia a duplicata.',
    },
    {
      id: 'ES8-M3-Q7', type: 'matching',
      prompt: 'Ligue cada coisa à aba em que ela deve ficar.',
      data: { pairs: [
        { left: 'Uma linha por inscrito', right: 'Base' },
        { left: 'O total de diárias', right: 'Relatório' },
        { left: 'O cabeçalho na primeira linha', right: 'Base' },
        { left: 'O título do acampamento', right: 'Relatório' },
      ]},
      explanation: 'Na base entra dado e cabeçalho. Título, total e espaço em branco são de relatório.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 4 — Tabela dinâmica (requisito 5.3)
     ────────────────────────────────────────────────────────────────────── */
  'm4-teoria': [
    {
      id: 'ES8-M4-Q1', type: 'multiple_choice',
      prompt: 'Para que serve uma tabela dinâmica?',
      data: { options: [
        { id: 'a', text: 'Para contar por grupo.', correct: true },
        { id: 'b', text: 'Para deixar a tabela mais bonita.', porque: 'Aparência é estilo de tabela, e é outro botão. A dinâmica responde uma pergunta.' },
        { id: 'c', text: 'Para ordenar a tabela de origem.', porque: 'Ela não mexe na origem: é um resumo desenhado em outro lugar.' },
        { id: 'd', text: 'Para apagar as linhas repetidas.', porque: 'Ela agrupa para contar, e não remove nada da tabela original.' },
      ]},
      explanation: 'Você diz o que vira linha e o que vira conta, e ela monta o resumo — sem mexer na base.',
    },
    {
      id: 'ES8-M4-Q2', type: 'multiple_choice',
      prompt: 'O clube tem seis unidades e o resumo mostra dez linhas. O que aconteceu?',
      data: { options: [
        { id: 'a', text: 'Unidade escrita de dois jeitos.', correct: true },
        { id: 'b', text: 'O clube ganhou quatro unidades.', porque: 'O resumo lê o que está na planilha. Ele não inventa unidade, e o clube não muda por causa de uma tabela.' },
        { id: 'c', text: 'A tabela dinâmica está com defeito.', porque: 'Ela fez exatamente o que faz: agrupou pelo valor escrito. As quatro linhas a mais são valores diferentes.' },
        { id: 'd', text: 'A faixa de origem pegou linhas demais.', porque: 'Pode acontecer, mas aí apareceriam grupos com o cabeçalho ou o TOTAL — e não quatro nomes parecidos com os do clube.' },
      ]},
      explanation: 'O resumo agrupa pelo valor escrito, e não pelo pretendido. Falcão e falcao são dois grupos.',
    },
    {
      id: 'ES8-M4-Q3', type: 'multiple_choice',
      prompt: 'Você consertou a grafia das unidades na base. O que o resumo mostra agora?',
      data: { options: [
        { id: 'a', text: 'As dez unidades de antes.', correct: true },
        { id: 'b', text: 'As seis unidades certas, na hora.', porque: 'Ela não relê a origem sozinha: guarda o que leu quando foi criada.' },
        { id: 'c', text: 'Um aviso de que está desatualizada.', porque: 'Nada na tela avisa. Os números continuam plausíveis, que é o que se espera de um resumo funcionando.' },
        { id: 'd', text: 'Nada, porque ela se apaga quando a origem muda.', porque: 'Ela continua desenhada, com os números do dia em que foi criada.' },
      ]},
      explanation: 'A tabela dinâmica é um retrato. Consertar sem atualizar entrega um relatório que discorda da própria base.',
    },
    {
      id: 'ES8-M4-Q4', type: 'multiple_choice',
      prompt: 'O que é a linha escrita "(vazio)" no resumo?',
      data: { options: [
        { id: 'a', text: 'Quem não respondeu aquela pergunta.', correct: true },
        { id: 'b', text: 'Uma linha sobrando da faixa de origem.', porque: 'Isso daria um grupo com o cabeçalho ou com o TOTAL, e não um grupo sem nome.' },
        { id: 'c', text: 'Um defeito da tabela dinâmica.', porque: 'É o comportamento dela: célula em branco também é um valor, e vira um grupo.' },
        { id: 'd', text: 'As respostas que foram apagadas.', porque: 'O que foi apagado não está na tabela, e por isso não entra em resumo nenhum.' },
      ]},
      explanation: 'Ela conta no total e não pertence a unidade nenhuma. É uma pessoa real que deixou o campo em branco.',
    },
    {
      id: 'ES8-M4-Q5', type: 'multiple_choice',
      prompt: 'Você quer saber quantas diárias cada unidade pediu no total. Que conta o resumo precisa usar?',
      data: { options: [
        { id: 'a', text: 'Soma.', correct: true },
        { id: 'b', text: 'Contagem.', porque: 'A contagem diz quantas famílias, e não quantas diárias. Sete famílias podem ter pedido vinte diárias.' },
        { id: 'c', text: 'Média.', porque: 'A média diz quanto cada família pediu em média, e não o total que a unidade pediu.' },
        { id: 'd', text: 'Qualquer uma: o número é o mesmo.', porque: 'Só seria o mesmo se cada família pedisse exatamente uma diária.' },
      ]},
      explanation: 'Contagem conta linhas; soma soma valores. São perguntas diferentes, e o número que sai é diferente.',
    },
    {
      id: 'ES8-M4-Q6', type: 'true_false',
      prompt: 'Com os grupos errados, o total de respostas do resumo também sai errado.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'As dezesseis respostas estão todas lá, só repartidas em dez grupos em vez de seis. O total continua dezesseis.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'É por isso que ninguém percebe olhando só o total. O que denuncia é o número de linhas do resumo.',
    },
    {
      id: 'ES8-M4-Q7', type: 'ordering',
      prompt: 'Ponha em ordem o que fazer quando o resumo mostra dez unidades.',
      data: { items: [
        { id: 'a', text: 'Olhar o resumo e contar as linhas', order: 1 },
        { id: 'b', text: 'Achar na base as unidades escritas de outro jeito', order: 2 },
        { id: 'c', text: 'Escrever todas do mesmo jeito', order: 3 },
        { id: 'd', text: 'Mandar o resumo atualizar', order: 4 },
      ]},
      explanation: 'Atualizar antes de consertar não muda nada, e consertar sem atualizar deixa o relatório com os números de antes.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 5 — Consertar inconsistências (requisito 5.2)
     ────────────────────────────────────────────────────────────────────── */
  'm5-teoria': [
    {
      id: 'ES8-M5-Q1', type: 'multiple_choice',
      prompt: 'Qual destas diferenças entre duas células não aparece na tela?',
      data: { options: [
        { id: 'a', text: 'Um espaço no fim.', correct: true },
        { id: 'b', text: 'O acento.', porque: 'Falcão e falcao se distinguem olhando. O trabalho é lembrar de olhar.' },
        { id: 'c', text: 'As maiúsculas.', porque: 'FALCÃO e Falcão se distinguem olhando, e chamam bastante atenção.' },
        { id: 'd', text: 'Uma letra trocada.', porque: 'Falcao e Falcso se distinguem olhando, ainda que passe rápido.' },
      ]},
      explanation: 'O espaço atrás é o único invisível dos quatro, e é por isso que duas células podem parecer idênticas e não casar em conta nenhuma.',
    },
    {
      id: 'ES8-M5-Q2', type: 'multiple_choice',
      prompt: 'Quatro linhas têm a unidade escrita de jeitos esquisitos. Qual é o conserto?',
      data: { options: [
        { id: 'a', text: 'Escrever as quatro do jeito da lista.', correct: true },
        { id: 'b', text: 'Apagar as quatro linhas.', porque: 'A coluna fica impecável e o clube fica com quatro inscritos a menos, sem nada avisando.' },
        { id: 'c', text: 'Deixar como está e avisar no relatório.', porque: 'Toda conta por unidade continuaria errada, e o relatório seria um aviso permanente de um erro que dá para consertar.' },
        { id: 'd', text: 'Criar quatro unidades novas no clube.', porque: 'Os dados descrevem o clube, e não o contrário. O clube tem seis unidades.' },
      ]},
      explanation: 'Arrumar não é apagar. O caminho rápido resolve a coluna e perde o desbravador.',
    },
    {
      id: 'ES8-M5-Q3', type: 'multiple_choice',
      prompt: 'Uma família não escolheu unidade. O que fazer com a linha dela?',
      data: { options: [
        { id: 'a', text: 'Descobrir de que unidade é e escrever.', correct: true },
        { id: 'b', text: 'Apagar a linha.', porque: 'O que ela não escolheu foi a unidade. Ela não deixou de se inscrever.' },
        { id: 'c', text: 'Escrever a unidade que tiver mais gente.', porque: 'Isso inventa um dado. A pessoa passa a constar de uma unidade que não é a dela.' },
        { id: 'd', text: 'Escrever "(vazio)" na célula.', porque: 'Isso troca um branco por um texto, e a linha continua sem pertencer a unidade nenhuma.' },
      ]},
      explanation: 'O dado que falta vem de fora da planilha, sempre. A planilha não sabe de que unidade a pessoa é.',
    },
    {
      id: 'ES8-M5-Q4', type: 'multiple_choice',
      prompt: 'Numa planilha brasileira, alguém escreveu 1.5 numa coluna de quantidade. O que acontece?',
      data: { options: [
        { id: 'a', text: 'Aquilo vira texto, e a soma pula a célula.', correct: true },
        { id: 'b', text: 'A planilha entende como um e meio.', porque: 'Aqui o separador decimal é a vírgula. O ponto não é lido como decimal.' },
        { id: 'c', text: 'A célula fica com erro escrito.', porque: 'Não há erro: é um texto perfeitamente válido, e a célula o mostra inteiro.' },
        { id: 'd', text: 'A planilha entende como mil e quinhentos.', porque: 'O ponto de milhar precisa de três casas depois dele. Com uma casa, aquilo não é número de jeito nenhum.' },
      ]},
      explanation: 'O total sai menor e continua plausível. É a pior forma de errar: o número cabe na realidade.',
    },
    {
      id: 'ES8-M5-Q5', type: 'multiple_choice',
      prompt: 'Como se percebe que uma célula de número virou texto?',
      data: { options: [
        { id: 'a', text: 'Ela encosta à esquerda.', correct: true },
        { id: 'b', text: 'Ela fica com a cor diferente.', porque: 'A cor não muda. O texto sai igual a qualquer outro texto da coluna.' },
        { id: 'c', text: 'A planilha marca a célula com um aviso.', porque: 'Não há aviso: guardar número como texto é uma coisa legítima de se fazer, e às vezes é o que se quer.' },
        { id: 'd', text: 'Só abrindo a fórmula da célula.', porque: 'Não há fórmula nenhuma ali. O que muda é o tipo do valor, e isso aparece no alinhamento.' },
      ]},
      explanation: 'São duas pistas independentes, e uma sozinha escapa de quem não repara: o alinhamento e a diferença entre contar valores e contar números.',
    },
    {
      id: 'ES8-M5-Q6', type: 'true_false',
      prompt: 'Apagar a célula com 1.5 resolve o problema da coluna.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Apagar tira o ponto e tira o número junto: a coluna fica com um buraco no lugar do defeito.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O conserto pede as duas coisas: sem o ponto, e com o número ainda lá.',
    },
    {
      id: 'ES8-M5-Q7', type: 'multiple_choice',
      prompt: 'Como achar duas células que parecem iguais e não casam em conta nenhuma?',
      data: { options: [
        { id: 'a', text: 'Agrupando num resumo.', correct: true },
        { id: 'b', text: 'Olhando as duas com atenção.', porque: 'O espaço atrás não aparece na tela de jeito nenhum, por mais atenção que se ponha.' },
        { id: 'c', text: 'Aumentando a largura da coluna.', porque: 'A largura mostra o que está escrito, e o espaço continua não sendo desenhado.' },
        { id: 'd', text: 'Ordenando a coluna.', porque: 'Ordenar põe os dois valores lado a lado, e lado a lado eles continuam parecendo iguais.' },
      ]},
      explanation: 'A tabela dinâmica é a lupa: dois grupos com o mesmo nome escrito só podem diferir no que não se vê.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 6 — CSV (requisitos 2.5 e 5.4)
     ────────────────────────────────────────────────────────────────────── */
  'm6-teoria': [
    {
      id: 'ES8-M6-Q1', type: 'multiple_choice',
      prompt: 'O que é um arquivo CSV?',
      data: { options: [
        { id: 'a', text: 'Um arquivo de texto puro.', correct: true },
        { id: 'b', text: 'Uma planilha compactada.', porque: 'Não há compactação nenhuma: é texto puro, e costuma ser maior do que a planilha equivalente.' },
        { id: 'c', text: 'Uma planilha protegida por senha.', porque: 'CSV não tem senha nem sabe o que é isso. Qualquer programa o abre.' },
        { id: 'd', text: 'Um formato que só o Excel lê.', porque: 'É quase o contrário: ele existe justamente para ser lido por qualquer programa.' },
      ]},
      explanation: 'A primeira linha é o cabeçalho, cada linha seguinte é um registro, e um caractere separa as colunas.',
    },
    {
      id: 'ES8-M6-Q2', type: 'multiple_choice',
      prompt: 'O que se perde ao salvar uma pasta de trabalho como CSV?',
      data: { options: [
        { id: 'a', text: 'Cor, fórmula e as outras abas.', correct: true },
        { id: 'b', text: 'Os acentos.', porque: 'Os acentos vão junto. O que atrapalha às vezes é a codificação do arquivo, e não o formato.' },
        { id: 'c', text: 'As linhas depois da primeira mil.', porque: 'Não há limite de linhas: é texto, e ele vai até onde a tabela for.' },
        { id: 'd', text: 'Nada: é a planilha inteira em outro nome.', porque: 'Se fosse, não haveria razão para existirem dois formatos.' },
      ]},
      explanation: 'Ele guarda o resultado, e não a conta que o produziu. E guarda uma aba só.',
    },
    {
      id: 'ES8-M6-Q3', type: 'multiple_choice',
      prompt: 'Por que no Brasil o separador do CSV costuma ser ponto e vírgula?',
      data: { options: [
        { id: 'a', text: 'Porque a vírgula já é o separador decimal.', correct: true },
        { id: 'b', text: 'Porque o ponto e vírgula é mais fácil de digitar.', porque: 'Ninguém digita o separador: quem o escreve é o programa que exporta.' },
        { id: 'c', text: 'Porque a vírgula não existe no teclado brasileiro.', porque: 'Existe, e é usada o tempo todo — inclusive como decimal, que é o problema.' },
        { id: 'd', text: 'Porque o ponto e vírgula é o padrão no mundo inteiro.', porque: 'Em inglês o separador é a vírgula mesmo. É o decimal que muda de país.' },
      ]},
      explanation: 'Com vírgula, 1,5 viraria duas colunas: uma com 1 e outra com 5.',
    },
    {
      id: 'ES8-M6-Q4', type: 'multiple_choice',
      prompt: 'Um CSV abriu com tudo numa coluna só. Qual é a causa mais provável?',
      data: { options: [
        { id: 'a', text: 'O separador não bateu.', correct: true },
        { id: 'b', text: 'O arquivo está corrompido.', porque: 'Arquivo corrompido não abre ou abre com lixo. Este abriu, e o conteúdo está inteiro numa coluna.' },
        { id: 'c', text: 'A planilha original tinha fórmulas.', porque: 'Fórmula não sobrevive ao CSV, mas a ausência dela não junta colunas.' },
        { id: 'd', text: 'O arquivo tem linhas demais.', porque: 'A quantidade de linhas não muda como cada linha é repartida.' },
      ]},
      explanation: 'Um arquivo gerado aqui e aberto lá — ou o contrário — mostra tudo junto, porque o separador não bateu.',
    },
    {
      id: 'ES8-M6-Q5', type: 'multiple_choice',
      prompt: 'Uma resposta tem um ponto e vírgula dentro dela. O que o arquivo faz?',
      data: { options: [
        { id: 'a', text: 'Põe aspas em volta daquele valor.', correct: true },
        { id: 'b', text: 'Troca o ponto e vírgula por outro caractere.', porque: 'Isso alteraria a resposta da pessoa, e o arquivo precisa entregar o que foi escrito.' },
        { id: 'c', text: 'Deixa como está, e a linha ganha uma coluna a mais.', porque: 'É o que aconteceria sem as aspas, e é justamente o que elas existem para evitar.' },
        { id: 'd', text: 'Recusa exportar aquela linha.', porque: 'Nada é recusado: o formato tem uma saída padrão para esse caso.' },
      ]},
      explanation: 'Quem lê o arquivo sabe que o que está entre aspas é um valor só, com separador e tudo dentro.',
    },
    {
      id: 'ES8-M6-Q6', type: 'true_false',
      prompt: 'As aspas que aparecem no arquivo fazem parte da resposta da pessoa.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Elas são do formato, e não do texto. Quem as apaga no bloco de notas quebra a linha.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Ao abrir o arquivo numa planilha, as aspas somem e o valor volta inteiro, com o ponto e vírgula dentro.',
    },
    {
      id: 'ES8-M6-Q7', type: 'multiple_choice',
      prompt: 'Por que abrir o CSV num editor de texto simples, e não na planilha?',
      data: { options: [
        { id: 'a', text: 'Para ver o que o arquivo de fato é.', correct: true },
        { id: 'b', text: 'Porque a planilha não abre CSV.', porque: 'Abre, e é o uso mais comum. O que ela faz é mostrar o resultado, e não o arquivo.' },
        { id: 'c', text: 'Porque o editor de texto conserta o separador.', porque: 'Ele não conserta nada: mostra o texto exatamente como está gravado.' },
        { id: 'd', text: 'Porque o editor de texto é mais rápido.', porque: 'A velocidade não é o ponto. O ponto é o que cada um dos dois mostra.' },
      ]},
      explanation: 'A planilha esconde o separador e as aspas de propósito. O editor mostra a linha como ela está no arquivo.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 7 — Agenda e relatório ordenado (requisito 6)
     ────────────────────────────────────────────────────────────────────── */
  'm7-teoria': [
    {
      id: 'ES8-M7-Q1', type: 'multiple_choice',
      prompt: 'Por que o pedido é gerar um relatório ordenado, e não ordenar a agenda?',
      data: { options: [
        { id: 'a', text: 'Porque a ordem de entrada é um dado, e some ao reordenar.', correct: true },
        { id: 'b', text: 'Porque ordenar a agenda dá erro.', porque: 'Não dá erro nenhum: a lista fica em ordem alfabética, certinha, e a ordem de antes deixa de existir.' },
        { id: 'c', text: 'Porque a agenda é grande demais para ordenar.', porque: 'Vinte e cinco linhas ordenam num instante. O problema não é tamanho.' },
        { id: 'd', text: 'Porque o relatório precisa de outro formato de arquivo.', porque: 'Os dois podem ser abas da mesma pasta. O que muda é o que cada um guarda.' },
      ]},
      explanation: 'Essa ordem não tem cópia em lugar nenhum: ela existe só como a posição de cada linha.',
    },
    {
      id: 'ES8-M7-Q2', type: 'multiple_choice',
      prompt: 'Alguém selecionou só a coluna do nome e mandou ordenar. O que acontece?',
      data: { options: [
        { id: 'a', text: 'Cada nome fica ao lado do telefone de outra pessoa.', correct: true },
        { id: 'b', text: 'A planilha avisa que falta selecionar o resto.', porque: 'Ela pode avisar, e pode não avisar — e aceitar é uma resposta legítima: ordenar uma coluna sozinha às vezes é o que se quer.' },
        { id: 'c', text: 'Nada, porque as outras colunas acompanham.', porque: 'Elas não acompanham: o que foi mandado ordenar foi aquela coluna, e foi isso que aconteceu.' },
        { id: 'd', text: 'A tabela perde linhas.', porque: 'A tabela continua com vinte e cinco linhas e vinte e cinco nomes. O que se perdeu foi o par entre eles.' },
      ]},
      explanation: 'E não dá erro: os dados continuam todos plausíveis. É por isso que ninguém confere telefone por telefone.',
    },
    {
      id: 'ES8-M7-Q3', type: 'multiple_choice',
      prompt: 'O que garante que a linha inteira viaje junto ao ordenar?',
      data: { options: [
        { id: 'a', text: 'A tabela estar declarada antes.', correct: true },
        { id: 'b', text: 'Ordenar sempre pela primeira coluna.', porque: 'A coluna escolhida não muda o que viaja. Dá para embaralhar ordenando a primeira coluna sozinha.' },
        { id: 'c', text: 'A planilha adivinhar onde a tabela acaba.', porque: 'Adivinhar é justamente o que dá errado: uma planilha de verdade tem título solto e bloco de cálculos ao lado.' },
        { id: 'd', text: 'Salvar antes de ordenar.', porque: 'Salvar protege contra perder o arquivo, e não contra embaralhar o cadastro dentro dele.' },
      ]},
      explanation: 'Declarar a tabela diz onde ela começa e onde acaba, e é essa faixa que a ordenação move.',
    },
    {
      id: 'ES8-M7-Q4', type: 'true_false',
      prompt: 'Um cadastro com telefone e e-mail dispensa o endereço.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O endereço serve para o que é de papel e para saber quem mora perto de quem, que é o que resolve carona.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Cada campo alcança de um jeito e falha de um jeito. Com quatro, sempre sobra por onde tentar.',
    },
    {
      id: 'ES8-M7-Q5', type: 'multiple_choice',
      prompt: 'Qual destes campos envelhece sem ninguém perceber?',
      data: { options: [
        { id: 'a', text: 'O telefone.', correct: true },
        { id: 'b', text: 'O nome.', porque: 'Nome muda pouco, e quando muda a pessoa costuma avisar.' },
        { id: 'c', text: 'A unidade.', porque: 'A mudança de unidade acontece na frente do clube inteiro, uma vez por ano.' },
        { id: 'd', text: 'A data de entrada.', porque: 'Ela não muda nunca: é um fato do passado.' },
      ]},
      explanation: 'O número continua lá, certinho, e passa a pertencer a outra pessoa. Nada na planilha muda.',
    },
    {
      id: 'ES8-M7-Q6', type: 'multiple_choice',
      prompt: 'O relatório ordenado ficou com vinte e três linhas, e a agenda tem vinte e cinco. O que houve?',
      data: { options: [
        { id: 'a', text: 'Duas linhas ficaram de fora da cópia.', correct: true },
        { id: 'b', text: 'Duas pessoas saíram do clube.', porque: 'Quem gera um relatório não tira ninguém do cadastro. A agenda continua com as vinte e cinco.' },
        { id: 'c', text: 'A ordenação juntou as repetidas.', porque: 'Ordenar não junta nem apaga nada: ele só troca as linhas de lugar.' },
        { id: 'd', text: 'O relatório não precisa ter todas.', porque: 'Um relatório da agenda que não tem todo mundo é um relatório que manda procurar no lugar errado.' },
      ]},
      explanation: 'Conferir a contagem é o jeito mais rápido de saber se a cópia pegou a tabela inteira.',
    },
    {
      id: 'ES8-M7-Q7', type: 'matching',
      prompt: 'Ligue cada campo do cadastro ao que ele resolve.',
      data: { pairs: [
        { left: 'Telefone', right: 'Avisar na hora, de uma mudança de última hora' },
        { left: 'E-mail', right: 'Mandar a ficha e o que precisa ficar guardado' },
        { left: 'Endereço', right: 'Organizar carona e mandar o que é de papel' },
        { left: 'Nome', right: 'Saber de quem é a linha' },
      ]},
      explanation: 'Quatro campos, quatro jeitos de alcançar alguém — e nenhum deles serve a todas as situações.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 8 — Dado pessoal e entrega (requisitos 7 e 8)
     ────────────────────────────────────────────────────────────────────── */
  'm8-teoria': [
    {
      id: 'ES8-M8-Q1', type: 'multiple_choice',
      prompt: 'Qual destes campos, sozinho, não aponta para uma pessoa?',
      data: { options: [
        { id: 'a', text: 'A unidade.', correct: true },
        { id: 'b', text: 'O nome.', porque: 'É o que aponta de forma mais direta: ele nomeia a pessoa.' },
        { id: 'c', text: 'O e-mail do responsável.', porque: 'Ele aponta e ainda alcança: dá para falar com a família a partir dele.' },
        { id: 'd', text: 'A observação sobre comida.', porque: 'Ela diz o que a pessoa come, e às vezes por quê. Aponta, e diz mais do que parece.' },
      ]},
      explanation: 'Metade do clube é do Falcão. Mas a unidade está na mesma linha que o nome, e é a linha que forma o dado pessoal.',
    },
    {
      id: 'ES8-M8-Q2', type: 'multiple_choice',
      prompt: 'A ficha dos inscritos está com acesso "só você" e mora numa pasta compartilhada com o clube. Quem a abre?',
      data: { options: [
        { id: 'a', text: 'O clube inteiro.', correct: true },
        { id: 'b', text: 'Só você.', porque: 'É o que está escrito na caixa do arquivo, e não o que acontece: a permissão da pasta alcança o que está dentro.' },
        { id: 'c', text: 'Ninguém, porque as duas regras se cancelam.', porque: 'Elas não se cancelam. Vale a mais permissiva das duas.' },
        { id: 'd', text: 'Só quem tem o link do arquivo.', porque: 'Quem abre a pasta vê o arquivo listado, sem precisar de link nenhum.' },
      ]},
      explanation: 'O conserto é mover o arquivo para fora da pasta, e não mexer na caixa de acesso dele.',
    },
    {
      id: 'ES8-M8-Q3', type: 'multiple_choice',
      prompt: 'Pôr senha no arquivo da planilha é um bom cuidado com o dado?',
      data: { options: [
        { id: 'a', text: 'Não: quem sabe a senha salva sem ela.', correct: true },
        { id: 'b', text: 'Sim, é o cuidado mais forte que existe.', porque: 'Ele é pedido, e não trava: o programa oferece salvar uma cópia sem senha a quem já abriu o arquivo.' },
        { id: 'c', text: 'Sim, porque ninguém consegue abrir sem ela.', porque: 'Quem precisa trabalhar com a planilha tem a senha — e é dele que sai a cópia aberta.' },
        { id: 'd', text: 'Não, porque senha nenhuma funciona em planilha.', porque: 'Ela funciona para abrir. O que ela não faz é impedir que o conteúdo circule depois.' },
      ]},
      explanation: 'A partir da primeira cópia salva sem senha, o arquivo circula aberto e ninguém sabe.',
    },
    {
      id: 'ES8-M8-Q4', type: 'multiple_choice',
      prompt: 'Qual destes é um cuidado com a guarda deste dado?',
      data: { options: [
        { id: 'a', text: 'Só quem precisa dos dados tem acesso ao arquivo.', correct: true },
        { id: 'b', text: 'Trocar a senha da conta do clube todo mês.', porque: 'É higiene da conta, e não cuidado com este dado: ele continua onde está, com quem já tem acesso.' },
        { id: 'c', text: 'Guardar uma cópia de tudo para sempre.', porque: 'Cada cópia é mais um lugar de onde o dado pode sair, e o requisito pede cuidado no descarte.' },
        { id: 'd', text: 'Imprimir a lista e deixar na sala do clube.', porque: 'Papel também é dado pessoal, e numa sala ele alcança todo mundo que entra.' },
      ]},
      explanation: 'Cada pessoa a mais com acesso é um computador a mais de onde a lista pode sair.',
    },
    {
      id: 'ES8-M8-Q5', type: 'multiple_choice',
      prompt: 'Terminado o trabalho, o que falta fazer com o CSV exportado?',
      data: { options: [
        { id: 'a', text: 'Apagar da pasta e da lixeira.', correct: true },
        { id: 'b', text: 'Guardar como cópia de segurança.', porque: 'A cópia de segurança é da planilha, que fica. O CSV é texto puro e não tem dono.' },
        { id: 'c', text: 'Renomear para um nome que ninguém entenda.', porque: 'O nome não protege nada: quem abrir o arquivo lê a base inteira.' },
        { id: 'd', text: 'Nada: ele fica na pasta de downloads.', porque: 'É exatamente aí que ele não pode ficar, e é o esquecimento mais comum de todos.' },
      ]},
      explanation: 'Qualquer pessoa que abrir o computador do clube lê a base inteira, sem precisar de programa nenhum.',
    },
    {
      id: 'ES8-M8-Q6', type: 'true_false',
      prompt: 'Marcar todos os campos como dado pessoal é o jeito seguro de classificar.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Quem marca tudo não classificou: só marcou. O requisito pede identificar quais são, e isso exige olhar campo a campo.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Classificar é decidir de cada um. Marcar tudo dá o mesmo resultado que não ter olhado nada.',
    },
    {
      id: 'ES8-M8-Q7', type: 'multiple_choice',
      prompt: 'O que o requisito 8 pede que se apresente ao examinador?',
      data: { options: [
        { id: 'a', text: 'O formulário, a base e o relatório gerado.', correct: true },
        { id: 'b', text: 'Só o relatório, que é o resultado.', porque: 'O relatório sozinho não mostra de onde os números vieram nem como foram coletados.' },
        { id: 'c', text: 'Só a base, que é onde está tudo.', porque: 'A base não mostra as regras que você escreveu no formulário nem o resumo que produziu.' },
        { id: 'd', text: 'O CSV exportado.', porque: 'O CSV é uma cópia de saída, e deveria ter sido descartado no fim do trabalho.' },
      ]},
      explanation: 'São as três peças do trabalho: como se coletou, onde se guardou, e o que se concluiu.',
    },
  ],
};
