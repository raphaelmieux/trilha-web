import type { Question } from '../types';

/*
 * As questões das lições de teoria da CC-ES010 Análise Estatística.
 *
 * ── O que elas medem ──────────────────────────────────────────────────────
 * A definição vale uma vez. Depois dela vêm consequência, discriminação e
 * diagnóstico — e nesta vereda o diagnóstico carrega quase tudo, porque a
 * matéria inteira é feita de números **confiantes**: a PREVISÃO que responde
 * 2,58 m para alguém de 25 anos sem hesitar; o r² que sobe de 0,83 para 0,94
 * quando se exclui um desbravador; a diferença de 2,59 acampamentos entre duas
 * unidades que o acaso alcança uma vez em sete.
 *
 * ── E há um segundo eixo: o que parece a mesma coisa e não é ──────────────
 * População e amostra. Representativa e grande. Correlação e causa. Ver a reta
 * e ter a equação dela. Prever dentro e prever fora. Ajuste melhor e
 * conclusão mais certa. "Pode ser do acaso" e "foi o acaso". Cada par tem uma
 * questão que obriga a separá-los, porque confundi-los é o que custa caro
 * depois — e nenhum deles dá erro no dia em que se confunde.
 *
 * Toda alternativa errada diz por que está errada, no campo porque, e a certa
 * não carrega motivo nenhum: o porquê tem lugar próprio, o explanation. E nada
 * de crase nem de asterisco — a questão vai para o QuestionRenderer, que
 * imprime texto puro.
 *
 * A alternativa certa é uma afirmação curta, de propósito. O hábito de pôr o
 * porquê dentro dela entrega a resposta pelo tamanho, e quem nunca estudou
 * passa escolhendo a mais comprida. A conta se faz sobre esta vereda sozinha:
 * diluída nas mil e quinhentas questões do corpus ela não diz nada sobre o
 * arquivo novo, e foi assim que a CC-ES006 abriu com 18% e passou.
 *
 * ── Os números daqui saem da base, e são conferidos ──────────────────────
 * r de 0,91 entre idade e altura, r² de 0,83, previsão de 1,57 m aos treze e
 * de 2,58 m aos vinte e cinco, inclinação de 8,4 centímetros por ano, 4,71
 * contra 2,13 acampamentos: todos vêm de `baseDoAcampamento()` pelo mesmo
 * motor que responde ao desbravador, e nenhum foi escrito de cabeça.
 */

export const QUESTOES_DA_ESTATISTICA: Record<string, Question[]> = {
  /* ──────────────────────────────────────────────────────────────────────
     Módulo 1 — De quem a base fala (requisitos 2.1, 2.2 e 4)
     ────────────────────────────────────────────────────────────────────── */
  'm1-teoria': [
    {
      id: 'ES10-M1-Q1', type: 'multiple_choice',
      prompt: 'Na pesquisa do acampamento, o que é a amostra?',
      data: { options: [
        { id: 'a', text: 'Os quarenta e oito que responderam.', correct: true },
        { id: 'b', text: 'Os desbravadores do clube.', porque: 'Esses são a população: o grupo sobre o qual a conclusão vai ser usada.' },
        { id: 'c', text: 'As colunas do formulário.', porque: 'Coluna é variável. Amostra é gente, e são as pessoas que entraram na conta.' },
        { id: 'd', text: 'A média de acampamentos que saiu da conta.', porque: 'Esse é um resultado calculado sobre a amostra, e não a amostra.' },
      ]},
      explanation: 'Amostra é quem entrou na conta; população é o grupo sobre o qual se quer concluir. A conta sempre fala da amostra.',
    },
    {
      id: 'ES10-M1-Q2', type: 'multiple_choice',
      prompt: 'Qual destas frases é uma afirmação sobre a população, e não sobre a amostra?',
      data: { options: [
        { id: 'a', text: 'No clube, a média é de 2,85 acampamentos.', correct: true },
        { id: 'b', text: 'Entre quem respondeu, a média é de 2,85 acampamentos.', porque: 'Essa fala da amostra, e é verdadeira sem depender de nada: é a conta que foi feita.' },
        { id: 'c', text: 'A coluna de acampamentos tem quarenta e oito valores.', porque: 'Essa descreve a tabela, e não um grupo de gente.' },
        { id: 'd', text: 'A média dos acampamentos é maior que a mediana.', porque: 'Essa compara duas contas feitas sobre a amostra.' },
      ]},
      explanation: 'A diferença não está no número, está em de quem ele fala. Trocar "entre quem respondeu" por "no clube" não muda nenhuma célula, e muda tudo.',
    },
    {
      id: 'ES10-M1-Q3', type: 'multiple_choice',
      prompt: 'Uma coleta alcançou mil pessoas, todas do grupo de WhatsApp do clube. Outra alcançou dez, sorteadas da lista de membros. Qual delas representa melhor o clube?',
      data: { options: [
        { id: 'a', text: 'A de dez, sorteadas da lista.', correct: true },
        { id: 'b', text: 'A de mil, porque amostra grande erra menos.', porque: 'Tamanho reduz o acaso, e não o viés: mil respostas do mesmo grupo multiplicam as vozes que já estavam ali.' },
        { id: 'c', text: 'As duas igualmente, porque as duas são amostras.', porque: 'As duas são amostras, e uma delas torceu. Ser amostra não é o que decide se ela representa.' },
        { id: 'd', text: 'Nenhuma: só a lista inteira serviria.', porque: 'A lista inteira é a população, e falar com ela toda quase nunca é possível. É por isso que amostra existe.' },
      ]},
      explanation: 'Viés é do processo, não do número. Uma coleta que só alcança um pedaço do grupo fica igualmente torcida com mil respostas.',
    },
    {
      id: 'ES10-M1-Q4', type: 'multiple_choice',
      prompt: 'A diretoria perguntou no sábado de manhã, para quem estava no salão. Que mecanismo torceu a amostra?',
      data: { options: [
        { id: 'a', text: 'Respondeu quem se apresentou.', correct: true },
        { id: 'b', text: 'A pergunta puxou a resposta.', porque: 'A pergunta pode ter sido neutra. O que torceu foi quem estava lá para ouvi-la.' },
        { id: 'c', text: 'Não alcançou todo mundo.', porque: 'Está perto, e a distinção importa: a pergunta estava disponível a todos naquele salão. Quem faltou escolheu faltar, e quem não está num grupo de mensagens não escolheu nada.' },
        { id: 'd', text: 'Nenhum: perguntar presencialmente é o jeito mais honesto.', porque: 'Perguntar de viva voz não corrige nada: a amostra continua sendo quem estava, e não quem é.' },
      ]},
      explanation: 'Quem falta costuma faltar por um motivo, e o motivo às vezes é o mesmo que mudaria a resposta.',
    },
    {
      id: 'ES10-M1-Q5', type: 'multiple_choice',
      prompt: 'Em qual dos três mecanismos coletar mais respostas não ajuda em nada?',
      data: { options: [
        { id: 'a', text: 'Na pergunta que puxa a resposta.', correct: true },
        { id: 'b', text: 'Em nenhum: mais respostas sempre ajudam.', porque: 'Mais respostas à mesma pergunta torta dão mais respostas tortas.' },
        { id: 'c', text: 'Em quem se apresentou.', porque: 'Aqui mais respostas podem ajudar, se vierem de quem não estava — o que depende de ir buscar.' },
        { id: 'd', text: 'Em não alcançou todo mundo.', porque: 'Aqui elas ajudam se a nova leva alcançar quem ficou fora. Pelo mesmo canal, não.' },
      ]},
      explanation: 'Quando a pergunta puxa, a amostra está inteira e as respostas estão torcidas. Nenhuma quantidade de gente conserta o enunciado.',
    },
    {
      id: 'ES10-M1-Q6', type: 'true_false',
      prompt: 'Quem não está no grupo de WhatsApp do clube e por isso não respondeu ao formulário conta como alguém que respondeu "não".',
      data: { options: [
        { id: 'f', text: 'Falso', correct: true },
        { id: 'v', text: 'Verdadeiro', porque: 'Essa pessoa não respondeu nada: ela nunca foi perguntada. Tratar ausência como resposta inventa um dado que não existe.' },
      ]},
      explanation: 'É a diferença entre "disse que não" e "não foi perguntado", e ela não aparece em nenhuma célula da planilha.',
    },
    {
      id: 'ES10-M1-Q7', type: 'multiple_choice',
      prompt: 'A secretaria leu a lista de todos os membros, ligou para cada família e registrou todas as respostas. O que foi coletado?',
      data: { options: [
        { id: 'a', text: 'A população, e não uma amostra.', correct: true },
        { id: 'b', text: 'Uma amostra representativa muito grande.', porque: 'Não é amostra: não ficou ninguém de fora para ela representar.' },
        { id: 'c', text: 'Uma amostra enviesada, porque ligação exclui quem não atende.', porque: 'Nesta coleta todas as respostas foram registradas, de todas as famílias. A objeção valeria se alguém tivesse ficado de fora.' },
        { id: 'd', text: 'Uma população enviesada.', porque: 'Viés é de amostra: ele é o desvio entre quem entrou e o grupo todo. A população não se desvia de si mesma.' },
      ]},
      explanation: 'Falou-se com o clube inteiro, então isto não é amostra. É também o trabalho que quase nenhum clube tem tempo de fazer — e é por isso que amostra existe.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 2 — A correlação (requisitos 2.3, 5.1 e 5.2)
     ────────────────────────────────────────────────────────────────────── */
  'm2-teoria': [
    {
      id: 'ES10-M2-Q1', type: 'multiple_choice',
      prompt: 'O que distingue o gráfico de dispersão dos outros três?',
      data: { options: [
        { id: 'a', text: 'Os dois eixos são medidas.', correct: true },
        { id: 'b', text: 'Ele usa pontos em vez de barras.', porque: 'A forma do desenho é consequência, e não a distinção: há gráficos de pontos que põem categoria num eixo.' },
        { id: 'c', text: 'Ele mostra a evolução ao longo do tempo.', porque: 'Evolução é o gráfico de linhas, e ali um dos eixos é o tempo, que é categoria ordenada.' },
        { id: 'd', text: 'Ele não precisa de título nem de eixos nomeados.', porque: 'Precisa como qualquer outro: dispersão sem eixo identificado não afirma nada.' },
      ]},
      explanation: 'Nos outros três a primeira coluna nomeia a categoria. Na dispersão as duas colunas são medidas, e cada ponto é uma pessoa.',
    },
    {
      id: 'ES10-M2-Q2', type: 'multiple_choice',
      prompt: 'Você ordenou a tabela por nome e a nuvem da dispersão mudou de forma. O que isso quer dizer?',
      data: { options: [
        { id: 'a', text: 'O gráfico não é uma dispersão.', correct: true },
        { id: 'b', text: 'Que ordenar embaralhou os dados.', porque: 'Ordenar leva a linha inteira: nenhum registro muda, só a ordem deles.' },
        { id: 'c', text: 'Que a correlação depende da ordem das linhas.', porque: 'Ela não depende: o r é o mesmo em qualquer ordem, porque sai dos valores e não das posições.' },
        { id: 'd', text: 'Que faltou ordenar também pela segunda coluna.', porque: 'Nenhuma ordenação muda uma dispersão de verdade. Pedir uma segunda não conserta o desenho errado.' },
      ]},
      explanation: 'A posição de cada ponto sai do dado dele. Um desenho que muda com a ordem está lendo a linha, e não o valor.',
    },
    {
      id: 'ES10-M2-Q3', type: 'multiple_choice',
      prompt: 'Entre idade e altura o r desta base é 0,91. O que ele diz?',
      data: { options: [
        { id: 'a', text: 'Quem é mais velho é mais alto, e quase sempre.', correct: true },
        { id: 'b', text: 'Noventa e um por cento dos desbravadores são mais altos que a média.', porque: 'O r não é porcentagem de gente. Ele resume o quanto as duas medidas andam juntas.' },
        { id: 'c', text: 'A idade causa noventa e um por cento da altura.', porque: 'O r não fala de causa nem de quanto de uma vem da outra. É o assunto do módulo seguinte.' },
        { id: 'd', text: 'Os pontos estão todos sobre uma reta.', porque: 'Estão perto de uma, e vários ficam longe. Estar sobre a reta daria 1 exato, que dado de gente não dá.' },
      ]},
      explanation: 'Sinal diz a direção; tamanho diz o quanto a nuvem se aproxima de uma reta. Acima de 0,7 em módulo é forte.',
    },
    {
      id: 'ES10-M2-Q4', type: 'multiple_choice',
      prompt: 'Uma nuvem sobe até o meio e depois desce, formando um U de cabeça para baixo. O r dela dá quase zero. Qual é a leitura certa?',
      data: { options: [
        { id: 'a', text: 'Há relação, e ela não é reta.', correct: true },
        { id: 'b', text: 'Não há relação entre as duas colunas.', porque: 'Há uma relação forte e visível. O que o r mede é só a parte dela que cabe numa reta.' },
        { id: 'c', text: 'O r foi calculado sobre a faixa errada.', porque: 'Pode estar certo e dar quase zero: o r perto de zero é a resposta correta para esta nuvem.' },
        { id: 'd', text: 'A relação é fraca, porque o r é pequeno.', porque: 'Fraca descreve uma nuvem espalhada. Esta é organizada, e a organização dela não é linear.' },
      ]},
      explanation: 'O r mede relação linear, e é tudo o que ele mede. Desenhar a nuvem antes de calcular é o que impede de concluir "nada a ver".',
    },
    {
      id: 'ES10-M2-Q5', type: 'multiple_choice',
      prompt: 'Você escreveu =CORREL com as duas faixas na ordem contrária. O que acontece com o resultado?',
      data: { options: [
        { id: 'a', text: 'Nada: é o mesmo número.', correct: true },
        { id: 'b', text: 'Ele troca de sinal.', porque: 'Trocar o sinal exigiria uma das colunas ter invertido, e nenhuma inverteu: só a ordem dos argumentos mudou.' },
        { id: 'c', text: 'A planilha devolve erro de referência.', porque: 'As duas faixas são válidas nas duas ordens, e a função aceita as duas.' },
        { id: 'd', text: 'Ele responde a outra pergunta, com a mesma cara.', porque: 'Isso vale para as funções da reta, que recebem o y primeiro. A correlação não tem lado.' },
      ]},
      explanation: 'CORREL é simétrica. INCLINAÇÃO, INTERCEPÇÃO e RQUAD não são, e trocá-las devolve a reta ao contrário sem erro nenhum.',
    },
    {
      id: 'ES10-M2-Q6', type: 'multiple_choice',
      prompt: 'Nesta base, idade e acampamentos dão r = 0,72 e altura e acampamentos dão r = 0,62. O que se conclui?',
      data: { options: [
        { id: 'a', text: 'Os dois pares andam juntos, e o primeiro mais.', correct: true },
        { id: 'b', text: 'A idade causa mais acampamentos que a altura.', porque: 'O r não fala de causa. Comparar dois r é comparar duas forças de relação, e nada além.' },
        { id: 'c', text: 'A diferença de 0,10 é pequena e pode ser ignorada.', porque: 'Pode ser pequena, e decidir isso exige olhar as duas nuvens — não o tamanho da diferença sozinho.' },
        { id: 'd', text: 'Como os dois passam de 0,5, os dois são relações fortes.', porque: 'O corte usual de forte é 0,7. O segundo fica abaixo dele, e chamar os dois de fortes apaga a diferença.' },
      ]},
      explanation: 'Comparar r entre pares diz qual relação é mais apertada. Por que ela é apertada é outra pergunta, e é a do módulo 3.',
    },
    {
      id: 'ES10-M2-Q7', type: 'true_false',
      prompt: 'Calcular o r de duas colunas já cumpre o requisito de interpretar o valor dele.',
      data: { options: [
        { id: 'f', text: 'Falso', correct: true },
        { id: 'v', text: 'Verdadeiro', porque: 'O requisito pede calcular e interpretar, que são dois gestos. O número sozinho não é uma frase sobre as duas colunas.' },
      ]},
      explanation: '"r = 0,91" não é conclusão. A conclusão é "quem é mais velho é mais alto, e quase sempre".',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 3 — Correlação não é causa (requisito 3)
     ────────────────────────────────────────────────────────────────────── */
  'm3-teoria': [
    {
      id: 'ES10-M3-Q1', type: 'multiple_choice',
      prompt: 'Duas colunas sobem juntas. Qual destas NÃO é uma das explicações possíveis?',
      data: { options: [
        { id: 'a', text: 'O r foi calculado na ordem errada.', correct: true },
        { id: 'b', text: 'Uma causa a outra.', porque: 'É uma das explicações, e a primeira que vem à cabeça.' },
        { id: 'c', text: 'A direção é a contrária da que parece.', porque: 'É uma das explicações, e o número é o mesmo nas duas direções.' },
        { id: 'd', text: 'Uma terceira coisa puxa as duas.', porque: 'É uma das explicações, e é a que a correlação espúria descreve.' },
      ]},
      explanation: 'CORREL é simétrica: a ordem dos argumentos não produz padrão nenhum. As outras três produzem o mesmo r e significam coisas diferentes.',
    },
    {
      id: 'ES10-M3-Q2', type: 'multiple_choice',
      prompt: 'Nesta base, altura e acampamentos dão r = 0,62. Qual é a explicação mais provável?',
      data: { options: [
        { id: 'a', text: 'A idade faz as duas subirem.', correct: true },
        { id: 'b', text: 'Quem é mais alto é levado a mais acampamentos.', porque: 'Nenhum clube escolhe quem vai pela altura, e nada na base sugere isso.' },
        { id: 'c', text: 'Acampar faz o desbravador crescer.', porque: 'Dormir numa barraca não muda a altura de ninguém. A direção é implausível.' },
        { id: 'd', text: 'É coincidência, e o r de 0,62 não quer dizer nada.', porque: 'O número foi medido e é moderado. Chamá-lo de coincidência descarta o que há a explicar.' },
      ]},
      explanation: 'A idade tem r = 0,91 com a altura e 0,72 com acampamentos. É ela que faz as duas subirem juntas, e ela está na coluna ao lado.',
    },
    {
      id: 'ES10-M3-Q3', type: 'multiple_choice',
      prompt: 'O que "correlação espúria" quer dizer?',
      data: { options: [
        { id: 'a', text: 'O número está certo e a relação não existe.', correct: true },
        { id: 'b', text: 'A conta do r foi feita errado.', porque: 'Espúria descreve a conclusão, e não a conta: a conta está certa, e é por isso que o caso engana.' },
        { id: 'c', text: 'O r é baixo demais para valer.', porque: 'Uma espúria pode ter r alto. Força de relação e existência de relação são duas perguntas.' },
        { id: 'd', text: 'As duas colunas medem a mesma coisa.', porque: 'Esse é outro caso, e nele a correlação é real e esperada: altura em metros e altura em centímetros dão 1.' },
      ]},
      explanation: 'Espúria não quer dizer que a conta está errada. Quer dizer que a conclusão que ela sugere está.',
    },
    {
      id: 'ES10-M3-Q4', type: 'multiple_choice',
      prompt: 'Como se testa a suspeita de que a idade explica altura e acampamentos ao mesmo tempo?',
      data: { options: [
        { id: 'a', text: 'Olhando a relação dentro de quem tem a mesma idade.', correct: true },
        { id: 'b', text: 'Calculando o r entre altura e acampamentos com mais casas decimais.', porque: 'Precisão do número não responde de onde ele vem. O mesmo r com quatro casas continua aceitando as três histórias.' },
        { id: 'c', text: 'Comparando o r de altura e acampamentos com o de idade e altura.', porque: 'Isso levanta a suspeita, e não a testa: os dois podem ser altos sem que um explique o outro.' },
        { id: 'd', text: 'Tirando da conta quem está muito fora dela.', porque: 'Isso muda a aparência do ajuste e não diz nada sobre causa. É o assunto do módulo 8.' },
      ]},
      explanation: 'Se as duas sobem só porque sobem com a idade, então dentro de um grupo de mesma idade a relação deve desaparecer.',
    },
    {
      id: 'ES10-M3-Q5', type: 'multiple_choice',
      prompt: 'A coluna que explicaria as duas não foi coletada. Qual é a resposta honesta?',
      data: { options: [
        { id: 'a', text: 'Esta base não decide entre as explicações.', correct: true },
        { id: 'b', text: 'Então vale a explicação mais simples: uma causa a outra.', porque: 'Simplicidade não é evidência. Escolher a primeira história por falta de dado é afirmar o que não se conferiu.' },
        { id: 'c', text: 'Então a correlação encontrada não vale.', porque: 'Ela vale como medida: as duas colunas andam juntas. O que falta é saber por quê.' },
        { id: 'd', text: 'Basta coletar mais linhas da mesma base.', porque: 'Mais linhas da mesma base não trazem uma coluna que ela não tem.' },
      ]},
      explanation: 'Sem a coluna que explicaria as duas, nenhuma conta aqui a traz de volta. Dizer isso é parte do resultado, e não uma derrota.',
    },
    {
      id: 'ES10-M3-Q6', type: 'true_false',
      prompt: 'Com quarenta e oito pessoas e seis idades diferentes, testar a relação dentro de cada idade dá grupos pequenos — e correlação em grupo pequeno é quase toda sorteio.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Oito pessoas por idade, em média, é pouco: a correlação de um grupo desse tamanho varia muito de sorteio para sorteio, que é o assunto do módulo do acaso.' },
      ]},
      explanation: 'O teste aponta a direção, e não fecha a questão sozinho. Saber do que ele é capaz faz parte de usá-lo.',
    },
    {
      id: 'ES10-M3-Q7', type: 'multiple_choice',
      prompt: 'Qual é a primeira coisa a procurar diante de uma correlação suspeita?',
      data: { options: [
        { id: 'a', text: 'Uma terceira coluna na própria base.', correct: true },
        { id: 'b', text: 'Um estudo publicado que confirme a relação.', porque: 'Pode ajudar depois, e não é o primeiro passo: a terceira coluna costuma estar na tabela que você já tem aberta.' },
        { id: 'c', text: 'Uma amostra maior.', porque: 'Mais gente não distingue as três histórias: todas continuam produzindo o mesmo r.' },
        { id: 'd', text: 'Um gráfico de colunas comparando as duas.', porque: 'Colunas comparam categorias. A relação entre duas medidas se vê na dispersão, e ela já foi desenhada.' },
      ]},
      explanation: 'Se existe uma coluna com correlação forte com as duas, a suspeita de espúria é séria — e é mais rápido olhar a tabela do que discutir a história.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 4 — A reta (requisitos 2.4, 2.5 e 5.3)
     ────────────────────────────────────────────────────────────────────── */
  'm4-teoria': [
    {
      id: 'ES10-M4-Q1', type: 'multiple_choice',
      prompt: 'Na relação entre idade e altura desta base, qual é a variável independente?',
      data: { options: [
        { id: 'a', text: 'A idade.', correct: true },
        { id: 'b', text: 'A altura.', porque: 'A altura é a explicada: ninguém fica mais velho por ter crescido.' },
        { id: 'c', text: 'As duas, porque a correlação vale nos dois sentidos.', porque: 'O r vale nos dois sentidos; a explicação não. Independente é a que explica, e aqui só uma explica.' },
        { id: 'd', text: 'Nenhuma: é um par sem direção clara.', porque: 'Este é justamente o par em que a direção é clara nos dois sentidos da pergunta.' },
      ]},
      explanation: 'Independente é a que explica; dependente é a que é explicada. O teste é fazer a pergunta nos dois sentidos e ouvir qual soa absurda.',
    },
    {
      id: 'ES10-M4-Q2', type: 'multiple_choice',
      prompt: 'Você marcou a linha de tendência e ela não passa por cima de nenhum ponto. O que isso quer dizer?',
      data: { options: [
        { id: 'a', text: 'Que ela está certa.', correct: true },
        { id: 'b', text: 'Que a faixa selecionada está errada.', porque: 'A faixa certa produz exatamente este desenho: a reta resume os pontos, e não os toca.' },
        { id: 'c', text: 'Que o ajuste é ruim.', porque: 'Quem diz isso é o r², e não o fato de a reta não tocar os pontos. Todo ajuste bom tem a reta passando entre eles.' },
        { id: 'd', text: 'Que faltam dados no meio da nuvem.', porque: 'Passar por cima de todos exigiria pontos alinhados, o que dado de gente não é — por mais dados que haja.' },
      ]},
      explanation: 'A reta passa o mais perto possível de todos ao mesmo tempo. Passar por cima de todos exigiria que estivessem alinhados.',
    },
    {
      id: 'ES10-M4-Q3', type: 'multiple_choice',
      prompt: 'Qual é a ordem dos argumentos de INCLINAÇÃO?',
      data: { options: [
        { id: 'a', text: 'A coluna explicada primeiro.', correct: true },
        { id: 'b', text: 'A coluna que explica primeiro.', porque: 'Essa é a ordem intuitiva e é a invertida. Escrita assim, a função devolve a reta de x sobre y.' },
        { id: 'c', text: 'A ordem não importa, como em CORREL.', porque: 'Em CORREL não importa, porque a correlação não tem lado. A inclinação tem, e trocar devolve outro número.' },
        { id: 'd', text: 'A ordem em que as colunas aparecem na planilha.', porque: 'A posição na planilha não decide nada: a função lê o que você passa, na ordem em que passa.' },
      ]},
      explanation: 'INCLINAÇÃO, INTERCEPÇÃO e RQUAD recebem o y primeiro. Nesta base, trocar a ordem leva 0,08 a 9,85 sem nenhum erro na tela.',
    },
    {
      id: 'ES10-M4-Q4', type: 'multiple_choice',
      prompt: 'A intercepção da reta desta base é 0,48. O que esse número é?',
      data: { options: [
        { id: 'a', text: 'A peça que posiciona a reta.', correct: true },
        { id: 'b', text: 'A altura média do clube.', porque: 'A média das alturas é bem maior. A intercepção não é média de nada.' },
        { id: 'c', text: 'A altura prevista para alguém de zero ano.', porque: 'É o que a conta diria, e não há ninguém de zero ano na base: é extrapolação, e dela o módulo seguinte trata.' },
        { id: 'd', text: 'O erro médio da reta.', porque: 'Erro de ajuste é o que o r² mede. A intercepção é onde a reta cruza o eixo vertical.' },
      ]},
      explanation: 'Ela costuma não querer dizer nada sozinha. Quem carrega o sentido da reta é a inclinação: oito centímetros e meio por ano de idade.',
    },
    {
      id: 'ES10-M4-Q5', type: 'multiple_choice',
      prompt: 'A planilha desenhou a linha de tendência do par altura e acampamentos, que é a espúria desta base. O que isso significa?',
      data: { options: [
        { id: 'a', text: 'A reta resume a nuvem e não explica nada.', correct: true },
        { id: 'b', text: 'A planilha errou ao aceitar desenhá-la.', porque: 'Ela não errou: a reta existe para qualquer nuvem, e é a conta certa daquele conjunto de pontos.' },
        { id: 'c', text: 'Então a relação entre as duas colunas existe.', porque: 'Existir desenho não é existir relação. O desenho sai igual nos dois casos, e é por isso que ele não decide.' },
        { id: 'd', text: 'Que o par deixou de ser espúrio ao receber uma reta.', porque: 'Nada no desenho muda a razão de ele ser espúrio: a idade continua explicando as duas colunas.' },
      ]},
      explanation: 'Direção clara é condição para explicar, e não para calcular. A planilha desenha a reta do par espúrio sem reclamar.',
    },
    {
      id: 'ES10-M4-Q6', type: 'true_false',
      prompt: 'Marcar a linha de tendência no gráfico já mostra a equação dela.',
      data: { options: [
        { id: 'f', text: 'Falso', correct: true },
        { id: 'v', text: 'Verdadeiro', porque: 'São duas caixas separadas em Elementos do Gráfico: dá para ver a reta e nunca ler a conta dela, que é o que quase todo mundo faz.' },
      ]},
      explanation: 'O requisito pede as duas metades: ajustar a linha e obter a equação. Uma caixa só apagaria uma delas.',
    },
    {
      id: 'ES10-M4-Q7', type: 'multiple_choice',
      prompt: 'Como se decide qual das duas colunas explica a outra?',
      data: { options: [
        { id: 'a', text: 'Fazendo a pergunta nos dois sentidos.', correct: true },
        { id: 'b', text: 'Pela que tiver o r mais alto.', porque: 'O r é um só para o par: ele não tem valor diferente em cada direção.' },
        { id: 'c', text: 'Pela que vier primeiro na planilha.', porque: 'A ordem das colunas na tabela é arbitrária e não diz nada sobre causa.' },
        { id: 'd', text: 'Pela que tiver menos valores repetidos.', porque: 'Quantidade de valores distintos é outra conta, e ela não aponta direção nenhuma.' },
      ]},
      explanation: '"A idade muda a altura?" soa certo. "A altura muda a idade?" não soa. Quando as duas soam possíveis, provavelmente não há direção clara.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 5 — Prever, e o risco de extrapolar (requisito 5.4)
     ────────────────────────────────────────────────────────────────────── */
  'm5-teoria': [
    {
      id: 'ES10-M5-Q1', type: 'multiple_choice',
      prompt: 'A reta desta base prevê 2,58 m para alguém de 25 anos. Por que esse número saiu?',
      data: { options: [
        { id: 'a', text: 'Porque a reta responde para qualquer x.', correct: true },
        { id: 'b', text: 'Porque a equação está errada.', porque: 'A equação está certa e descreve bem as idades observadas. O problema é a idade perguntada, e não a conta.' },
        { id: 'c', text: 'Porque faltou marcar a linha de tendência.', porque: 'A previsão sai da equação, com ou sem a reta desenhada no gráfico.' },
        { id: 'd', text: 'Porque há um valor atípico na coluna da altura.', porque: 'Há, e tirá-lo muda a previsão em meio centímetro. O absurdo de 2,58 m vem de outro lugar.' },
      ]},
      explanation: 'A reta foi ajustada a seis idades de criança e aprendeu oito centímetros e meio por ano. Nada nela diz que as pessoas param de crescer.',
    },
    {
      id: 'ES10-M5-Q2', type: 'multiple_choice',
      prompt: 'A base vai de dez a quinze anos. Qual destas previsões é a mais perigosa?',
      data: { options: [
        { id: 'a', text: '1,83 m para dezesseis anos.', correct: true },
        { id: 'b', text: '2,58 m para vinte e cinco anos.', porque: 'Essa é absurda e se vê: ninguém a usaria sem desconfiar. Perigosa é a que passa.' },
        { id: 'c', text: '1,57 m para treze anos.', porque: 'Essa está dentro do intervalo observado, e é para isso que a reta serve.' },
        { id: 'd', text: '1,32 m para dez anos.', porque: 'Essa está na ponta do intervalo, e ainda dentro dele.' },
      ]},
      explanation: 'Dezesseis é fora do observado e devolve um número alto e possível. Quem o vê conclui que a reta funciona fora do intervalo — e ela só não foi longe o bastante para se delatar.',
    },
    {
      id: 'ES10-M5-Q3', type: 'multiple_choice',
      prompt: 'O que precisa viajar junto com uma previsão?',
      data: { options: [
        { id: 'a', text: 'O intervalo em que os dados estão.', correct: true },
        { id: 'b', text: 'O r da relação.', porque: 'Ajuda e não basta: um r alto não impede a reta de responder fora do intervalo onde ela foi vista funcionar.' },
        { id: 'c', text: 'A quantidade de casas decimais usadas.', porque: 'Precisão do número não é confiança na previsão. Mais casas não dizem onde ela vale.' },
        { id: 'd', text: 'A data em que a base foi coletada.', porque: 'É boa prática declarar a data, e não é ela que diz para quais idades a previsão vale.' },
      ]},
      explanation: 'Sem o intervalo, qualquer número vira resposta. A reta nunca se recusa a dar um.',
    },
    {
      id: 'ES10-M5-Q4', type: 'multiple_choice',
      prompt: 'Qual é a ordem dos argumentos de PREVISÃO?',
      data: { options: [
        { id: 'a', text: 'O x, depois a coluna explicada, depois a que explica.', correct: true },
        { id: 'b', text: 'A coluna explicada, depois a que explica, depois o x.', porque: 'Essa ordem não existe na função: o valor a prever vem primeiro.' },
        { id: 'c', text: 'A mesma de INCLINAÇÃO.', porque: 'Está perto: as duas faixas vêm na mesma ordem, e PREVISÃO tem o x na frente delas.' },
        { id: 'd', text: 'O x, depois a que explica, depois a explicada.', porque: 'As duas faixas estão invertidas. Nesta ordem a função devolve a previsão da reta ao contrário.' },
      ]},
      explanation: 'PREVISÃO recebe o x primeiro, e as duas faixas na ordem de INCLINAÇÃO. É diferente, e o programa não avisa.',
    },
    {
      id: 'ES10-M5-Q5', type: 'multiple_choice',
      prompt: 'A previsão para treze anos deu 1,57 m. O que esse número é?',
      data: { options: [
        { id: 'a', text: 'A altura típica esperada nessa idade.', correct: true },
        { id: 'b', text: 'A altura de um desbravador de treze anos da base.', porque: 'Não é a de ninguém em particular: é o centro da faixa onde a reta espera encontrá-los.' },
        { id: 'c', text: 'A média das alturas dos de treze anos.', porque: 'Está perto e não é a mesma conta: a previsão sai da reta ajustada a todas as idades, e não só desse grupo.' },
        { id: 'd', text: 'O valor máximo que alguém de treze anos teria.', porque: 'A reta não dá máximo nem mínimo. Ela dá o valor central que a relação prevê.' },
      ]},
      explanation: 'A previsão é uma estimativa, e não uma medida. Se a reta estiver errada, ela herda o erro inteiro.',
    },
    {
      id: 'ES10-M5-Q6', type: 'true_false',
      prompt: 'A planilha avisa quando a previsão pedida está fora do intervalo dos dados observados.',
      data: { options: [
        { id: 'f', text: 'Falso', correct: true },
        { id: 'v', text: 'Verdadeiro', porque: 'Ela não avisa nada: devolve o número com a mesma cara dos que estão dentro. Quem precisa saber do intervalo é quem pergunta.' },
      ]},
      explanation: 'A reta não hesita, não avisa, e dá um número com a mesma cara dos outros. É por isso que o intervalo se declara à mão.',
    },
    {
      id: 'ES10-M5-Q7', type: 'multiple_choice',
      prompt: 'Alguém quer prever quantos acampamentos um desbravador de trinta anos já fez, usando a reta de idade e acampamentos desta base. Qual é o problema maior?',
      data: { options: [
        { id: 'a', text: 'Trinta anos está muito fora do observado.', correct: true },
        { id: 'b', text: 'A relação entre idade e acampamentos é fraca.', porque: 'Ela é forte nesta base: r de 0,72. O problema não é a força da relação.' },
        { id: 'c', text: 'Acampamentos é uma variável discreta, e a reta dá decimal.', porque: 'É verdade e é o menor dos problemas: arredondar resolve, e sair do intervalo não.' },
        { id: 'd', text: 'A base não tem a coluna de idade.', porque: 'Tem, e é dela que a reta sai.' },
      ]},
      explanation: 'A base vai até quinze anos. Aos trinta, a reta continua somando acampamentos por ano como se ninguém saísse do clube.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 6 — A qualidade do ajuste (requisito 5.5)
     ────────────────────────────────────────────────────────────────────── */
  'm6-teoria': [
    {
      id: 'ES10-M6-Q1', type: 'multiple_choice',
      prompt: 'De toda a variação da altura nesta base, quanto a reta ajustada à idade dá conta?',
      data: { options: [
        { id: 'a', text: 'Pouco mais de quatro quintos dela.', correct: true },
        { id: 'b', text: 'De oitenta e três por cento dos pontos, que ficam sobre a reta.', porque: 'O r² não conta pontos. Nenhum ponto precisa estar sobre a reta para ele ser alto.' },
        { id: 'c', text: 'De oitenta e três por cento da altura de cada pessoa.', porque: 'Isso seria causa, e o r² não fala dela. Quanto a reta explica e por que ela explica são duas perguntas.' },
        { id: 'd', text: 'De tudo, menos os dezessete por cento em que a previsão erra.', porque: 'Erro de previsão é outra conta. O r² é proporção de variação explicada, e não erro percentual.' },
      ]},
      explanation: 'O r² é o quadrado do r e se lê como proporção: de toda a variação da coluna explicada, quanto a reta dá conta.',
    },
    {
      id: 'ES10-M6-Q2', type: 'multiple_choice',
      prompt: 'Por que o r² não tem sinal?',
      data: { options: [
        { id: 'a', text: 'Porque elevar ao quadrado apaga a direção.', correct: true },
        { id: 'b', text: 'Porque ele só é usado em relações positivas.', porque: 'Ele vale para qualquer relação linear: uma relação negativa forte também dá r² alto.' },
        { id: 'c', text: 'Porque a função RQUAD devolve o valor absoluto.', porque: 'Ela devolve o quadrado, e quadrado de negativo já é positivo: não há valor absoluto no caminho.' },
        { id: 'd', text: 'Porque proporção nunca é negativa.', porque: 'Isso explica o resultado e não a razão: é a elevação ao quadrado que o torna proporção.' },
      ]},
      explanation: 'Por isso ele não substitui o r: diz o quanto, e não para onde. Os dois se leem juntos.',
    },
    {
      id: 'ES10-M6-Q3', type: 'multiple_choice',
      prompt: 'Uma nuvem em forma de U dá r² perto de zero. Qual é a leitura certa?',
      data: { options: [
        { id: 'a', text: 'Uma reta não era o resumo certo.', correct: true },
        { id: 'b', text: 'Os dados são ruins e não servem.', porque: 'Os dados estão bem: eles mostram uma relação clara. O que não serve é a reta.' },
        { id: 'c', text: 'A relação entre as duas colunas é fraca.', porque: 'Fraca descreve nuvem espalhada. Esta é organizada, e a organização dela não cabe numa reta.' },
        { id: 'd', text: 'Falta aumentar a amostra.', porque: 'Mais pontos deixariam o U mais nítido, e o r² continuaria perto de zero.' },
      ]},
      explanation: 'O número diz o quanto os pontos se afastam da reta; só o desenho diz se uma reta era o resumo certo.',
    },
    {
      id: 'ES10-M6-Q4', type: 'multiple_choice',
      prompt: 'Qual dos três pares desta base tem o pior ajuste?',
      data: { options: [
        { id: 'a', text: 'Altura e acampamentos.', correct: true },
        { id: 'b', text: 'Idade e altura.', porque: 'É o melhor dos três: r² de 0,83.' },
        { id: 'c', text: 'Idade e acampamentos.', porque: 'Fica no meio: r² de 0,51.' },
        { id: 'd', text: 'Os três têm o mesmo ajuste, porque são da mesma base.', porque: 'Ser da mesma base não iguala nada: cada par tem a sua nuvem, e as três são diferentes.' },
      ]},
      explanation: 'Altura e acampamentos dá r² de 0,38: a reta dá conta de pouco mais de um terço da variação. E é também o par espúrio.',
    },
    {
      id: 'ES10-M6-Q5', type: 'multiple_choice',
      prompt: 'O par espúrio desta base tem r² de 0,38. O que se conclui?',
      data: { options: [
        { id: 'a', text: 'A reta resume parte da nuvem, e nada mexe em nada.', correct: true },
        { id: 'b', text: 'O ajuste baixo é o que denuncia a espúria.', porque: 'Não é: uma espúria pode ter ajuste alto. O que a denuncia é a terceira coluna, e não o r².' },
        { id: 'c', text: 'Como o ajuste é baixo, a conclusão sobre o par é segura.', porque: 'Ajuste baixo não torna nada seguro. Ele diz que a reta explica pouco, e não de onde o padrão vem.' },
        { id: 'd', text: 'Então o r de 0,62 estava errado.', porque: 'Estava certo: 0,62 ao quadrado é 0,38. Os dois números são a mesma medida de duas formas.' },
      ]},
      explanation: 'r² alto ou baixo não diz nada sobre causa. Ele diz o quanto a reta resume aquela nuvem, e só isso.',
    },
    {
      id: 'ES10-M6-Q6', type: 'true_false',
      prompt: 'Um r² mais alto significa sempre que a conclusão tirada da reta é mais confiável.',
      data: { options: [
        { id: 'f', text: 'Falso', correct: true },
        { id: 'v', text: 'Verdadeiro', porque: 'r² mede o quanto a reta resume aquela nuvem. Dá para subir o r² excluindo gente, sem que a conclusão fique mais certa — e é o assunto do módulo 8.' },
      ]},
      explanation: 'Há curvas em que o r² sai alto e a reta descreve mal os extremos. O número e o desenho se olham juntos.',
    },
    {
      id: 'ES10-M6-Q7', type: 'multiple_choice',
      prompt: 'Quais são os dois jeitos de a reta não representar os dados?',
      data: { options: [
        { id: 'a', text: 'Nuvem larga e forma errada.', correct: true },
        { id: 'b', text: 'Ordem das colunas e faixa errada.', porque: 'Essas são duas formas de escrever a fórmula errada. A reta até resumiria bem, se escrita certa.' },
        { id: 'c', text: 'Amostra pequena e valor atípico.', porque: 'As duas afetam o resultado e não são os dois jeitos: há nuvem larga com amostra grande e sem atípico nenhum.' },
        { id: 'd', text: 'r² baixo e r negativo.', porque: 'r negativo é uma relação que desce, e a reta a representa perfeitamente bem.' },
      ]},
      explanation: 'Na nuvem larga o número avisa. Na forma errada ele avisa pelo motivo errado, ou nem avisa — e aí só o desenho diz.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 7 — A regressão em dado próprio (requisito 6)
     ────────────────────────────────────────────────────────────────────── */
  'm7-teoria': [
    {
      id: 'ES10-M7-Q1', type: 'multiple_choice',
      prompt: 'Você escolheu um par e o r deu 0,33. Qual é a conclusão honesta?',
      data: { options: [
        { id: 'a', text: 'As duas quase não andam juntas.', correct: true },
        { id: 'b', text: 'O par foi mal escolhido e vale trocar.', porque: 'Relação fraca é material de análise como qualquer outra. Trocar até achar um número alto é procurar o resultado.' },
        { id: 'c', text: 'Há uma relação, e ela precisa de mais dados para aparecer.', porque: 'Mais dados tornariam o 0,33 mais preciso, e não maior. Relação fraca não vira forte por insistência.' },
        { id: 'd', text: 'Não há relação nenhuma entre as duas.', porque: 'Há uma, pequena. Zerar um 0,33 é descartar o que foi medido.' },
      ]},
      explanation: 'Dizer "o r deu 0,33, então as duas quase não andam juntas" é uma conclusão completa — e mais honesta que esticar um número pequeno.',
    },
    {
      id: 'ES10-M7-Q2', type: 'multiple_choice',
      prompt: 'Quais são as três coisas que o requisito pede por escrito sobre o par escolhido?',
      data: { options: [
        { id: 'a', text: 'O que sugere, que outra história cabe, e que dado decidiria.', correct: true },
        { id: 'b', text: 'O r, o r² e a equação da reta.', porque: 'Esses são números, e a planilha os dá. O requisito pede o que você escreve sobre eles.' },
        { id: 'c', text: 'A média, a mediana e o desvio das duas colunas.', porque: 'Essas são as medidas descritivas da CC-ES009, e não a análise da relação.' },
        { id: 'd', text: 'A população, a amostra e o viés da coleta.', porque: 'Esses são o módulo 1, e entram na avaliação final. O requisito 6 pede as três sobre a relação.' },
      ]},
      explanation: 'As três juntas são a diferença entre calcular e analisar. A primeira sozinha é a conclusão apressada que esta vereda existe para evitar.',
    },
    {
      id: 'ES10-M7-Q3', type: 'multiple_choice',
      prompt: 'Por que o requisito pede uma segunda explicação para o mesmo padrão?',
      data: { options: [
        { id: 'a', text: 'Porque quase sempre existe uma.', correct: true },
        { id: 'b', text: 'Para mostrar que a primeira estava errada.', porque: 'Ela pode estar certa. O exercício não é descartá-la, é parar de tratá-la como a única.' },
        { id: 'c', text: 'Porque duas explicações dão mais segurança que uma.', porque: 'Elas dão menos: saber que há duas é descobrir que o número não escolhe entre elas.' },
        { id: 'd', text: 'Para o examinador conferir se você leu o módulo 3.', porque: 'O módulo 3 ensina isso, e a razão de escrevê-la é o que ela impede: afirmar demais.' },
      ]},
      explanation: 'Escrever a segunda história é o que impede de afirmar demais. É o módulo 3 virando hábito.',
    },
    {
      id: 'ES10-M7-Q4', type: 'multiple_choice',
      prompt: 'A coluna que decidiria entre as suas duas explicações não existe na base. O que escrever?',
      data: { options: [
        { id: 'a', text: 'Que dado seria, e que esta base não decide.', correct: true },
        { id: 'b', text: 'Escolher a explicação mais provável e seguir.', porque: 'Mais provável segundo quem? Sem o dado, essa escolha é opinião apresentada como resultado.' },
        { id: 'c', text: 'Que as duas explicações são equivalentes.', porque: 'Elas não são: uma pode ser muito mais plausível. O que falta é como distingui-las, e não a igualdade entre elas.' },
        { id: 'd', text: 'Deixar o campo em branco, porque não há resposta.', porque: 'Há resposta, e é dizer qual dado faltou. Em branco, quem lê não sabe se você pensou nisso.' },
      ]},
      explanation: 'Nomear o dado que faltou é parte do resultado. Pode ser uma coluna que a base não tem, e aí a resposta honesta é que ela não decide.',
    },
    {
      id: 'ES10-M7-Q5', type: 'multiple_choice',
      prompt: 'Qual destas é uma segunda explicação legítima para uma correlação entre idade e número de diárias?',
      data: { options: [
        { id: 'a', text: 'A distância de casa explicaria as duas.', correct: true },
        { id: 'b', text: 'O r de 0,33 é baixo, então não há o que explicar.', porque: 'Isso não é uma explicação: é recusar a pergunta. Um padrão fraco continua tendo origem.' },
        { id: 'c', text: 'A amostra tem quarenta e oito pessoas, que é pouco.', porque: 'Isso é sobre a confiança no número, e não sobre o que produziria o padrão. É outro eixo da análise.' },
        { id: 'd', text: 'A planilha pode ter calculado errado.', porque: 'A conta sai do mesmo motor que você confere. Duvidar dela não é uma explicação para o padrão.' },
      ]},
      explanation: 'Uma segunda explicação propõe outro mecanismo para o mesmo padrão. Quem mora longe dorme todas as noites, e pode ser por acaso o mais velho.',
    },
    {
      id: 'ES10-M7-Q6', type: 'true_false',
      prompt: 'Para cumprir o requisito 6 basta calcular a regressão de um par que as lições já usaram.',
      data: { options: [
        { id: 'f', text: 'Falso', correct: true },
        { id: 'v', text: 'Verdadeiro', porque: 'A mecânica já foi medida nos módulos anteriores. O que este pede é dado próprio e o raciocínio escrito sobre ele, e raciocínio só existe sobre um par que alguém escolheu.' },
      ]},
      explanation: 'Repetir o par do módulo 2 prova o gesto, e não a escolha. "Próprio" aqui quer dizer escolhido por você.',
    },
    {
      id: 'ES10-M7-Q7', type: 'multiple_choice',
      prompt: 'O que a frase "o que a relação sugere" precisa ter para ser uma interpretação, e não uma opinião?',
      data: { options: [
        { id: 'a', text: 'O número que você calculou.', correct: true },
        { id: 'b', text: 'Uma recomendação ao clube.', porque: 'Recomendação vem depois, e pode vir. Interpretar é dizer o que o número diz sobre as duas colunas.' },
        { id: 'c', text: 'A equação completa da reta.', porque: 'A equação é útil para prever. Para interpretar a relação, quem responde é o r.' },
        { id: 'd', text: 'A citação de um par que as lições usaram, para comparar.', porque: 'Comparar ajuda e não é condição: a interpretação é sobre o par que você escolheu.' },
      ]},
      explanation: 'Sem o r, "as duas andam juntas" é uma impressão. Com ele, é uma leitura do que foi medido.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 8 — Refazer sem os atípicos (requisito 7)
     ────────────────────────────────────────────────────────────────────── */
  'm8-teoria': [
    {
      id: 'ES10-M8-Q1', type: 'multiple_choice',
      prompt: 'Você filtrou a coluna da altura para esconder o valor atípico. O que acontece com a inclinação da reta?',
      data: { options: [
        { id: 'a', text: 'Ela não se move.', correct: true },
        { id: 'b', text: 'Ela muda, porque a linha saiu da tabela.', porque: 'A linha saiu da tela, e não da tabela. Filtro é de tela, e a conta continua lendo tudo.' },
        { id: 'c', text: 'A fórmula passa a devolver erro de referência.', porque: 'A faixa continua válida com o filtro ligado: nenhuma célula deixou de existir.' },
        { id: 'd', text: 'Ela muda só depois de atualizar as fórmulas.', porque: 'Não há o que atualizar: as fórmulas sempre leram a faixa inteira, e continuam lendo.' },
      ]},
      explanation: 'É a mesma coisa que a SOMA faz na CC-ES003. A linha escondida continua na conta, e é por isso que excluir de verdade pede outro caminho.',
    },
    {
      id: 'ES10-M8-Q2', type: 'multiple_choice',
      prompt: 'Qual é o jeito de excluir uma linha da conta sem destruir o dado?',
      data: { options: [
        { id: 'a', text: 'Uma coluna auxiliar, sem a célula daquela linha.', correct: true },
        { id: 'b', text: 'Apagar a linha e guardar uma cópia da planilha antes.', porque: 'A comparação é entre duas leituras da mesma base. Com duas planilhas, as duas podem divergir sem ninguém notar.' },
        { id: 'c', text: 'Aplicar o filtro e marcar a opção de ignorar linhas ocultas.', porque: 'Essa opção não existe nas funções de regressão: elas leem a faixa, e o filtro não as alcança.' },
        { id: 'd', text: 'Escrever a média da coluna no lugar do valor atípico.', porque: 'Isso não exclui: substitui um dado real por um inventado, e a reta passa a descrever uma pessoa que não existe.' },
      ]},
      explanation: 'A coluna auxiliar é a coluna copiada menos as linhas a excluir. O dado original fica intacto, e as duas leituras continuam comparáveis.',
    },
    {
      id: 'ES10-M8-Q3', type: 'multiple_choice',
      prompt: 'Ao montar a coluna auxiliar, quantos lados do par precisam ser apagados na linha do atípico?',
      data: { options: [
        { id: 'a', text: 'Um só.', correct: true },
        { id: 'b', text: 'Os dois, senão a faixa fica desalinhada.', porque: 'O alinhamento não depende disso: as duas faixas continuam com o mesmo tamanho, e o par cai inteiro quando falta um número de um dos lados.' },
        { id: 'c', text: 'Nenhum: basta tirar a linha da faixa.', porque: 'A linha está no meio da faixa, e uma faixa não pula linha. Pular exigiria duas faixas, que as funções não aceitam.' },
        { id: 'd', text: 'Os dois, e também a linha correspondente na outra aba.', porque: 'Não há linha correspondente em outra aba: o par está nas duas colunas da mesma tabela.' },
      ]},
      explanation: 'O par cai inteiro quando falta um número de qualquer um dos dois lados. É a regra do Excel, e apagar um lado é apagar o par.',
    },
    {
      id: 'ES10-M8-Q4', type: 'multiple_choice',
      prompt: 'Tirando o valor atípico desta base, o r² sobe de 0,83 para 0,94. O que isso quer dizer?',
      data: { options: [
        { id: 'a', text: 'A reta ficou mais convincente, e não mais certa.', correct: true },
        { id: 'b', text: 'A análise melhorou, porque o ajuste melhorou.', porque: 'É a leitura natural e é a errada: a reta afirma quase a mesma coisa, e o que subiu foi a aparência de certeza.' },
        { id: 'c', text: 'O valor atípico estava errado e precisava sair.', porque: 'Estar longe dos outros não é estar errado. É um desbravador de onze anos com 1,05 m, e ele é do clube.' },
        { id: 'd', text: 'A relação entre idade e altura ficou mais forte.', porque: 'Na amostra sem ele, sim. Na população que a amostra deveria representar, nada mudou — foi uma pessoa que saiu da conta.' },
      ]},
      explanation: 'Um r² obtido excluindo gente é um motivo para desconfiar do r², e não para confiar na reta.',
    },
    {
      id: 'ES10-M8-Q5', type: 'multiple_choice',
      prompt: 'Tirando o mesmo valor atípico, a inclinação vai de 8,4 para 8,0 centímetros por ano. O que esse par de números mostra?',
      data: { options: [
        { id: 'a', text: 'Que a conclusão quase não dependia dele.', correct: true },
        { id: 'b', text: 'Que a exclusão foi inútil e não devia ser feita.', porque: 'Ela foi útil: é ela que mostra que a conclusão não dependia de uma pessoa, que é um sustento real.' },
        { id: 'c', text: 'Que a reta sem ele é a certa, e a outra estava errada.', porque: 'Nenhuma das duas está errada. As duas são leituras da mesma base, e o requisito pede comparar as duas.' },
        { id: 'd', text: 'Que o valor atípico não influenciava nada na análise.', porque: 'Influenciava o r², e muito: de 0,83 para 0,94. O que ele quase não movia era a inclinação.' },
      ]},
      explanation: 'Uma conclusão que não depende de uma única pessoa é mais firme do que uma que depende. É o lado bom do mesmo resultado.',
    },
    {
      id: 'ES10-M8-Q6', type: 'true_false',
      prompt: 'Excluir valores atípicos e apresentar só a análise sem eles é aceitável, desde que a conta esteja certa.',
      data: { options: [
        { id: 'f', text: 'Falso', correct: true },
        { id: 'v', text: 'Verdadeiro', porque: 'O requisito pede comparar os dois resultados e relatar o efeito da exclusão. Apresentar só o segundo entrega um ajuste comprado com a exclusão de uma pessoa, sem dizer isso.' },
      ]},
      explanation: 'A conta estar certa é o que torna o caso perigoso: nada dá erro, e o número apresentado é mais bonito do que o da base inteira.',
    },
    {
      id: 'ES10-M8-Q7', type: 'multiple_choice',
      prompt: 'Alguém apagou a linha do valor atípico e escreveu a fórmula sobre a faixa inteira. O resultado está certo?',
      data: { options: [
        { id: 'a', text: 'O número sai certo, e a análise não.', correct: true },
        { id: 'b', text: 'Sim, e é o caminho mais curto.', porque: 'O número coincide, e a primeira leitura deixou de existir: não há mais com que comparar, que é o que o requisito pede.' },
        { id: 'c', text: 'Não, porque a faixa inteira continua incluindo o atípico.', porque: 'Com a linha apagada ela não inclui mais nada ali: a célula ficou vazia e o par cai.' },
        { id: 'd', text: 'Não, porque a fórmula precisa citar a coluna auxiliar.', porque: 'A fórmula pode citar qualquer faixa. O que a torna errada é a base já não estar inteira.' },
      ]},
      explanation: 'O número "sem o atípico" sai igual, com a fórmula parecendo a de "com todos" — e a comparação do requisito deixou de existir.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 9 — O acaso entre dois grupos (requisito 8)
     ────────────────────────────────────────────────────────────────────── */
  'm9-teoria': [
    {
      id: 'ES10-M9-Q1', type: 'multiple_choice',
      prompt: 'O que é incerteza, numa análise em que todas as contas estão certas?',
      data: { options: [
        { id: 'a', text: 'O quanto o resultado mudaria com outra amostra.', correct: true },
        { id: 'b', text: 'O erro acumulado nos arredondamentos.', porque: 'Arredondamento é erro de conta, e some com mais casas decimais. Incerteza não some.' },
        { id: 'c', text: 'A parte da variação que a reta não explica.', porque: 'Essa é a conta do r², e é sobre o ajuste de uma reta. Incerteza vale até para uma média.' },
        { id: 'd', text: 'A chance de alguém ter respondido errado ao formulário.', porque: 'Isso é erro de medição, e é outro problema. Incerteza existe mesmo com todas as respostas corretas.' },
      ]},
      explanation: 'Erro é conta errada; incerteza é o quanto o resultado depende de quem caiu na amostra. Ela encolhe com o tamanho do grupo e nunca chega a zero.',
    },
    {
      id: 'ES10-M9-Q2', type: 'multiple_choice',
      prompt: 'No embaralho dos rótulos, o que muda de uma rodada para a outra?',
      data: { options: [
        { id: 'a', text: 'Quem é de qual unidade.', correct: true },
        { id: 'b', text: 'Os valores da coluna de acampamentos.', porque: 'Nenhum valor muda: é justamente isso que torna o embaralho uma demonstração, e não uma simulação de outros dados.' },
        { id: 'c', text: 'O tamanho dos dois grupos.', porque: 'Os tamanhos ficam: sete e oito em toda rodada. Variá-los faria a diferença variar por dois motivos ao mesmo tempo.' },
        { id: 'd', text: 'A fórmula que calcula as duas médias.', porque: 'A fórmula é a mesma sempre. O que ela recebe de rótulo é que muda.' },
      ]},
      explanation: 'Os rótulos se permutam e as medidas ficam onde estão. Arara continua com sete pessoas e Águia com oito — o único que mudou foi quem.',
    },
    {
      id: 'ES10-M9-Q3', type: 'multiple_choice',
      prompt: 'O embaralho mostrou que uma diferença como a real aparece em cerca de uma vez em sete. Qual é a leitura certa?',
      data: { options: [
        { id: 'a', text: 'O acaso alcança uma diferença assim com facilidade.', correct: true },
        { id: 'b', text: 'Foi o acaso que produziu a diferença entre as unidades.', porque: 'O embaralho mostra que o acaso consegue, e não que foi ele. Pode ter sido, pode não ter sido.' },
        { id: 'c', text: 'Há cerca de catorze por cento de chance de a Arara ser melhor.', porque: 'A frequência é do sorteio, e não de uma unidade ser melhor. É o erro mais comum que existe com este número.' },
        { id: 'd', text: 'A diferença de 2,59 acampamentos não existe.', porque: 'Ela existe: está na base e foi medida. O que ela não faz é distinguir as duas unidades.' },
      ]},
      explanation: 'O que se perdeu foi o direito de afirmar, e não a diferença. Negar o número medido é o oposto de desconfiar da conclusão tirada dele.',
    },
    {
      id: 'ES10-M9-Q4', type: 'multiple_choice',
      prompt: 'Por que uma leva de muitos embaralhos, e não um sorteio só?',
      data: { options: [
        { id: 'a', text: 'Porque o que se lê é uma frequência.', correct: true },
        { id: 'b', text: 'Porque um sorteio só pode cair errado.', porque: 'Nenhum sorteio cai errado: cada um é um resultado possível. O que falta num só é a proporção.' },
        { id: 'c', text: 'Porque a planilha precisa de muitas linhas para calcular.', porque: 'A conta de cada embaralho é independente das outras. O número de rodadas é escolha de quem analisa.' },
        { id: 'd', text: 'Porque a média de muitos sorteios se aproxima da diferença real.', porque: 'Ela se aproxima de zero, e não da real: embaralhado, não há razão para um lado ficar na frente.' },
      ]},
      explanation: 'Com uma leva só, a leitura é "aconteceu" ou "não aconteceu". O que há para ler é "uma vez em sete".',
    },
    {
      id: 'ES10-M9-Q5', type: 'multiple_choice',
      prompt: 'Qual destas providências NÃO aumenta a confiança na comparação entre duas unidades?',
      data: { options: [
        { id: 'a', text: 'Comparar mais pares até um ficar bem claro.', correct: true },
        { id: 'b', text: 'Coletar de mais gente em cada uma das duas.', porque: 'Essa aumenta: entre grupos de trinta, o embaralho quase nunca alcança a diferença real.' },
        { id: 'c', text: 'Repetir a coleta noutra ocasião.', porque: 'Essa aumenta: o acaso não repete o mesmo resultado de propósito.' },
        { id: 'd', text: 'Decidir qual comparação fazer antes de olhar os dados.', porque: 'Essa aumenta: é o que impede de escolher o par depois de ver qual deu a maior diferença.' },
      ]},
      explanation: 'Entre oito unidades há vinte e oito pares, e alguma dupla vai ter diferença grande por sorteio. Procurar até achar é achar acaso.',
    },
    {
      id: 'ES10-M9-Q6', type: 'multiple_choice',
      prompt: 'Refazer a conta na planilha para conferir se dá o mesmo número aumenta a confiança na conclusão?',
      data: { options: [
        { id: 'a', text: 'Não: confere a aritmética, que já estava certa.', correct: true },
        { id: 'b', text: 'Sim: conferir sempre aumenta a confiança.', porque: 'Conferir a conta aumenta a confiança na conta. A dúvida aqui não é sobre a conta.' },
        { id: 'c', text: 'Sim, se a segunda conta for feita por outra pessoa.', porque: 'Duas pessoas conferindo a mesma aritmética chegam ao mesmo 4,71, e a dúvida continua inteira.' },
        { id: 'd', text: 'Não, porque a planilha sempre devolve o mesmo resultado.', porque: 'Está certo quanto ao fato e errado quanto à razão: o problema não é ser repetitivo, é responder a outra pergunta.' },
      ]},
      explanation: 'O que está em dúvida não é se a média é 4,71 — é se 4,71 contra 2,13 diz algo sobre as duas unidades.',
    },
    {
      id: 'ES10-M9-Q7', type: 'true_false',
      prompt: 'Escrever o resultado com mais casas decimais torna a comparação entre os dois grupos mais confiável.',
      data: { options: [
        { id: 'f', text: 'Falso', correct: true },
        { id: 'v', text: 'Verdadeiro', porque: 'Precisão do número não é confiança na conclusão. Escrever 2,5893 em vez de 2,59 não acrescenta um único dado.' },
      ]},
      explanation: 'Mais casas só fazem a diferença parecer medida com mais cuidado do que foi.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 10 — O grau de confiança (requisito 9)
     ────────────────────────────────────────────────────────────────────── */
  'm10-teoria': [
    {
      id: 'ES10-M10-Q1', type: 'multiple_choice',
      prompt: 'O que significa apresentar a análise completa?',
      data: { options: [
        { id: 'a', text: 'Pôr na mesa o que sustenta e o que limita.', correct: true },
        { id: 'b', text: 'Mostrar todos os gráficos e todas as contas feitas.', porque: 'Quantidade não é completude: uma apresentação com dez gráficos favoráveis continua sem os limites.' },
        { id: 'c', text: 'Apresentar os resultados e esperar as perguntas.', porque: 'É o que quase todo mundo faz, e os limites ficam para uma pergunta que talvez não venha.' },
        { id: 'd', text: 'Entregar a planilha para quem quiser conferir.', porque: 'A planilha tem os números e não tem a leitura deles. Quem analisou é quem sabe o que limita.' },
      ]},
      explanation: 'A segunda metade é a que quase ninguém traz. Toda apresentação de dados do mundo abre com o que sustenta a conclusão.',
    },
    {
      id: 'ES10-M10-Q2', type: 'multiple_choice',
      prompt: 'O r² subiu de 0,83 para 0,94 ao excluir um desbravador. Esse achado sustenta ou limita a conclusão?',
      data: { options: [
        { id: 'a', text: 'Limita.', correct: true },
        { id: 'b', text: 'Sustenta, porque o ajuste ficou melhor.', porque: 'É a leitura natural e é a errada: o que subiu foi a confiança aparente, e a reta afirma quase a mesma coisa.' },
        { id: 'c', text: 'Nenhum dos dois: é só uma conta intermediária.', porque: 'É um achado, e dos mais importantes: ele diz o quanto o número bonito depende de quem ficou fora.' },
        { id: 'd', text: 'Sustenta, porque mostra que a análise foi cuidadosa.', porque: 'Excluir não é cuidado por si: é uma decisão que precisa ser relatada, e o relato é o que a torna honesta.' },
      ]},
      explanation: 'Um r² mais alto conseguido excluindo gente é um motivo para desconfiar do r², e não para confiar na reta.',
    },
    {
      id: 'ES10-M10-Q3', type: 'multiple_choice',
      prompt: 'Nesta análise, por que "alta" não é um grau sustentável?',
      data: { options: [
        { id: 'a', text: 'Porque há cinco achados que limitam a conclusão.', correct: true },
        { id: 'b', text: 'Porque nenhuma análise de clube pode ter confiança alta.', porque: 'Pode: com coleta que alcance todo mundo e grupos grandes, alta é sustentável. O que impede é o que esta base tem.' },
        { id: 'c', text: 'Porque o r de 0,91 não é alto o bastante.', porque: 'Ele é alto, e é um dos sustentos. O grau não sai de um número sozinho.' },
        { id: 'd', text: 'Porque o examinador vai contestar de qualquer jeito.', porque: 'A contestação é outra coisa, e é da CC-ES009. O grau se declara pelo que os achados sustentam.' },
      ]},
      explanation: 'Declarar alta compromete você a dizer que o clube pode decidir sem olhar mais nada — e para isso nenhum achado poderia estar limitando.',
    },
    {
      id: 'ES10-M10-Q4', type: 'multiple_choice',
      prompt: 'E por que "nenhuma" também não se sustenta aqui?',
      data: { options: [
        { id: 'a', text: 'Porque há achados que sustentam a conclusão.', correct: true },
        { id: 'b', text: 'Porque declarar nenhuma seria admitir que o trabalho foi perdido.', porque: 'Não seria: concluir que a base não mostra nada é um resultado. O que impede é haver sustentos.' },
        { id: 'c', text: 'Porque sempre há alguma confiança em qualquer análise.', porque: 'Não há: uma base que só limitasse justificaria nenhuma, e aí não haveria o que apresentar.' },
        { id: 'd', text: 'Porque o requisito pede um grau entre média e baixa.', porque: 'O requisito pede declarar o grau, qualquer um. Quem reduz as opções a duas são os achados desta base.' },
      ]},
      explanation: 'Nenhuma exige que nada esteja sustentando — e aí não haveria o que apresentar. Entre média e baixa a escolha é de quem analisou.',
    },
    {
      id: 'ES10-M10-Q5', type: 'multiple_choice',
      prompt: 'A que declarar "média" compromete quem a declara?',
      data: { options: [
        { id: 'a', text: 'A nomear os limites da conclusão.', correct: true },
        { id: 'b', text: 'A refazer a análise com mais dados antes de apresentar.', porque: 'Isso seria não apresentar. Média diz que a conclusão vale agora, com limites conhecidos.' },
        { id: 'c', text: 'A dizer que metade dos resultados pode estar errada.', porque: 'Média não é metade de nada: é a conclusão valendo com limites, e não meio resultado.' },
        { id: 'd', text: 'A não fazer nenhuma recomendação ao clube.', porque: 'Recomendar é possível e desejável. Com média, ela vem acompanhada do que a limita.' },
      ]},
      explanation: 'É o grau que obriga a apresentar os dois lados. Baixa diz que isto serve para levantar a pergunta, e não para decidir.',
    },
    {
      id: 'ES10-M10-Q6', type: 'true_false',
      prompt: 'O mesmo resultado de um módulo pode aparecer como sustento e como limite na mesma análise.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'A exclusão do valor atípico é as duas coisas: a reta não depender de uma pessoa sustenta, e o r² subir ao tirá-la limita.' },
      ]},
      explanation: 'Um resultado tem os dois lados, e as duas leituras saíram do mesmo módulo. Carregar só uma das metades é apresentar meia análise.',
    },
    {
      id: 'ES10-M10-Q7', type: 'multiple_choice',
      prompt: 'O que as razões do grau precisam ter?',
      data: { options: [
        { id: 'a', text: 'Os números dos seus próprios achados.', correct: true },
        { id: 'b', text: 'A citação de alguém que fez a mesma análise.', porque: 'Pode enriquecer e não é condição. As razões do seu grau saem dos seus achados.' },
        { id: 'c', text: 'Uma defesa contra as objeções que o examinador fará.', porque: 'Isso vem depois, e é o requisito da vereda anterior. Aqui ninguém contestou ainda.' },
        { id: 'd', text: 'A lista de tudo o que foi calculado, em ordem.', porque: 'A lista é o caminho, e não a razão. O que se pede é por que o grau é esse e não o de cima.' },
      ]},
      explanation: 'O grau sozinho é uma palavra. As razões são o que a liderança vai ouvir, e elas saem dos seus achados — com os números deles.',
    },
  ],
};
