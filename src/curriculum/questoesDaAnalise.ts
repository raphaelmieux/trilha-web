import type { Question } from '../types';

/*
 * As questões das lições de teoria da CC-ES009 Análise de Dados.
 *
 * ── O que elas medem ──────────────────────────────────────────────────────
 * A definição vale uma vez. Depois dela vêm consequência, discriminação e
 * diagnóstico — e nesta vereda o diagnóstico carrega quase tudo, porque a
 * matéria inteira é feita de números plausíveis: a média de 2,85 acampamentos
 * num clube em que vinte e nove dos quarenta e oito fizeram dois ou menos; a
 * moda de 1,58 m que descreve duas pessoas; a unidade que mais deixou gente
 * de fora sendo a que mobilizou melhor; a pizza das médias por unidade, que
 * soma 17,1 e mostra fatias de um todo que não existe.
 *
 * Nenhuma dessas telas dá erro, e é essa a matéria.
 *
 * ── E há um segundo eixo: o que parece a mesma coisa e não é ──────────────
 * Média e mediana. Discreta e contínua. Taxa e número absoluto. Ponta e
 * atípico. Atípico que fica e atípico que sai. Defender e insistir. Cada par
 * tem uma questão que obriga a separá-los, porque confundi-los é o que custa
 * caro depois — e nenhum deles dá erro no dia em que se confunde.
 *
 * Toda alternativa errada diz por que está errada, no campo porque, e a certa
 * não carrega motivo nenhum: o porquê tem lugar próprio, o explanation. E nada
 * de crase nem de asterisco — a questão vai para o QuestionRenderer, que
 * imprime texto puro.
 *
 * A alternativa certa é uma afirmação curta, de propósito. O hábito de pôr o
 * porquê dentro dela entrega a resposta pelo tamanho, e quem nunca estudou
 * passa escolhendo a mais comprida. A conta se faz sobre este arquivo sozinho,
 * antes de abrir: diluída nas mil e quinhentas questões do corpus, ela não diz
 * nada sobre o arquivo novo.
 *
 * ── Os números daqui saem da base, e são conferidos ──────────────────────
 * Média 12,40 de idade, mediana 2 de acampamentos, taxa 81,25% do Falcão,
 * moda repetida duas vezes: todos vêm de `baseDoAcampamento()` e nenhum foi
 * escrito de cabeça. `exemplosDaAnalise.test.ts` recalcula cada um pelo motor
 * e cobra que a lição o cite — escrever de memória erra por pouco e com
 * frequência, e quem confere a própria planilha contra uma lição errada
 * conclui que a planilha dele é que está errada.
 */

export const QUESTOES_DA_ANALISE: Record<string, Question[]> = {
  /* ──────────────────────────────────────────────────────────────────────
     Módulo 1 — O tipo de cada variável (requisitos 2.1, 2.2 e 5.1)
     ────────────────────────────────────────────────────────────────────── */
  'm1-teoria': [
    {
      id: 'ES9-M1-Q1', type: 'multiple_choice',
      prompt: 'Qual é o teste para saber se uma coluna é quantitativa?',
      data: { options: [
        { id: 'a', text: 'Somar duas respostas quer dizer alguma coisa.', correct: true },
        { id: 'b', text: 'As respostas são escritas com algarismos.', porque: 'Telefone é escrito com algarismos e é qualitativo: somar dois telefones não existe.' },
        { id: 'c', text: 'A coluna tem muitos valores diferentes.', porque: 'A observação tem quase um valor por pessoa e é qualitativa. Quantidade de valores não decide natureza.' },
        { id: 'd', text: 'A planilha aceita calcular a média dela.', porque: 'Ela aceita, e devolve zero ou erro. Aceitar a conta não é a mesma coisa que a conta significar algo.' },
      ]},
      explanation: 'Qualitativa nomeia; quantitativa conta ou mede. Doze mais treze dá vinte e cinco anos de idade somada, e Falcão mais Águia não dá nada.',
    },
    {
      id: 'ES9-M1-Q2', type: 'multiple_choice',
      prompt: 'A coluna de acampamentos é discreta. Por quê?',
      data: { options: [
        { id: 'a', text: 'Porque ela vem de contar, e entre 2 e 3 não existe nada.', correct: true },
        { id: 'b', text: 'Porque ela tem poucos valores diferentes.', porque: 'Ela tem onze valores distintos e a altura tem quarenta e sete, mas o que separa as duas é contar e medir.' },
        { id: 'c', text: 'Porque os valores são pequenos.', porque: 'Tamanho não decide nada: uma contagem de milhões continua sendo discreta.' },
        { id: 'd', text: 'Porque ninguém foi a mais de vinte acampamentos.', porque: 'O limite de cima não muda a natureza da coluna. Discreta é o que não tem nada entre dois valores vizinhos.' },
      ]},
      explanation: 'Discreta vem de contar e só dá inteiro; contínua vem de medir e cabe sempre mais um valor no meio.',
    },
    {
      id: 'ES9-M1-Q3', type: 'multiple_choice',
      prompt: 'Por que uma tabela de frequências por nome não responde nada?',
      data: { options: [
        { id: 'a', text: 'Porque cada nome aparece uma vez só.', correct: true },
        { id: 'b', text: 'Porque nome é qualitativo.', porque: 'A unidade também é qualitativa, e a tabela dela mostra a forma do clube em seis linhas.' },
        { id: 'c', text: 'Porque a planilha não conta texto.', porque: 'Conta: CONT.SE funciona em texto, e é ela que conta as unidades.' },
        { id: 'd', text: 'Porque nome não é uma variável.', porque: 'É uma variável — uma pergunta feita a todo mundo. O que ela não serve é para agrupar.' },
      ]},
      explanation: 'Agrupar é pôr junto quem respondeu a mesma coisa. Na unidade cabem oito pessoas; no nome cabe uma, e a tabela sai com quarenta e oito linhas de um.',
    },
    {
      id: 'ES9-M1-Q4', type: 'true_false',
      prompt: 'A coluna de camiseta é quantitativa, porque os tamanhos podem ser numerados de 1 a 5.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Numerar não muda a natureza: somar dois tamanhos continua não querendo dizer nada.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'A camiseta é qualitativa com ordem — ordinal. PP vem antes de P, e é por isso que ela se ordena; mas somar dois tamanhos não produz um terceiro.',
    },
    {
      id: 'ES9-M1-Q5', type: 'multiple_choice',
      prompt: 'A idade é discreta ou contínua nesta base?',
      data: { options: [
        { id: 'a', text: 'Discreta, porque o formulário pergunta quantos anos.', correct: true },
        { id: 'b', text: 'Contínua, porque o tempo é contínuo.', porque: 'O tempo é, mas a coluna guarda o que foi perguntado — e a pergunta foi quantos anos você tem.' },
        { id: 'c', text: 'Contínua, porque a idade cresce sem parar.', porque: 'Cresce, e a coluna registra inteiros. O que decide é o que está guardado, não o fenômeno.' },
        { id: 'd', text: 'Depende de quantas idades diferentes apareceram.', porque: 'Não depende. Contar e medir são naturezas da pergunta, e não do que as respostas trouxeram.' },
      ]},
      explanation: 'Se o formulário pedisse a data de nascimento e a idade fosse calculada em dias, a conversa seria outra. A coluna guarda o que foi perguntado.',
    },
    {
      id: 'ES9-M1-Q6', type: 'multiple_choice',
      prompt: 'Qual é o risco de não classificar as colunas antes de começar a analisar?',
      data: { options: [
        { id: 'a', text: 'Calcular coisa que não quer dizer nada.', correct: true },
        { id: 'b', text: 'A planilha recusar as fórmulas.', porque: 'Ela não recusa. A média da unidade devolve um erro ou zero, e a moda do nome devolve um nome.' },
        { id: 'c', text: 'Perder as respostas da base.', porque: 'Classificar não muda a base: é uma decisão sobre como ler cada coluna.' },
        { id: 'd', text: 'Não ter como ordenar as colunas depois.', porque: 'Ordenar funciona em qualquer coluna, classificada ou não.' },
      ]},
      explanation: 'A classificação é o que diz o que dá para calcular. Ela não é burocracia de começo de trabalho: é o que evita uma análise inteira sobre a coluna errada.',
    },
    {
      id: 'ES9-M1-Q7', type: 'matching',
      prompt: 'Ligue cada coluna da base ao que ela é.',
      data: { pairs: [
        { left: 'Unidade', right: 'Qualitativa nominal' },
        { left: 'Camiseta', right: 'Qualitativa ordinal' },
        { left: 'Acampamentos', right: 'Quantitativa discreta' },
        { left: 'Altura', right: 'Quantitativa contínua' },
      ]},
      explanation: 'Duas perguntas em sequência: primeiro somar quer dizer algo, depois se há ordem nos nomes ou se o número vem de contar ou de medir.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 2 — Centro e dispersão (requisitos 2.3, 2.4 e 5.2)
     ────────────────────────────────────────────────────────────────────── */
  'm2-teoria': [
    {
      id: 'ES9-M2-Q1', type: 'multiple_choice',
      prompt: 'O que é a mediana de uma coluna?',
      data: { options: [
        { id: 'a', text: 'O valor do meio, com a lista em ordem.', correct: true },
        { id: 'b', text: 'A média entre o maior e o menor valor.', porque: 'Essa é outra conta, e ela se move quando uma das pontas muda. A mediana não.' },
        { id: 'c', text: 'O valor que mais se repete.', porque: 'Esse é a moda. Ela pode estar em qualquer lugar da fila.' },
        { id: 'd', text: 'A soma dividida pela quantidade.', porque: 'Essa é a média. Ela soma os valores; a mediana conta posições.' },
      ]},
      explanation: 'Metade da base está abaixo da mediana e metade acima. Trocar dezoito acampamentos por cento e oitenta não a move um milímetro.',
    },
    {
      id: 'ES9-M2-Q2', type: 'multiple_choice',
      prompt: 'Na coluna de acampamentos, o desvio padrão é 3,41 e a média é 2,85. O que isso indica?',
      data: { options: [
        { id: 'a', text: 'Que os valores estão muito espalhados.', correct: true },
        { id: 'b', text: 'Que a média foi calculada errado.', porque: 'A conta está certa. O desvio maior que a média é um aviso sobre a coluna, e não sobre a fórmula.' },
        { id: 'c', text: 'Que faltam dados na coluna.', porque: 'Não faltam: são quarenta e oito respostas. O que há é gente muito longe do resto.' },
        { id: 'd', text: 'Que a média é maior do que deveria ser.', porque: 'Não há um valor que ela deveria ter. Ela é o que é, e o desvio diz que ela descreve pouco.' },
      ]},
      explanation: 'Desvio maior que a média é sinal de assimetria forte. Na idade o desvio é 1,58 contra média 12,40, e ali a média descreve bem.',
    },
    {
      id: 'ES9-M2-Q3', type: 'multiple_choice',
      prompt: 'A moda da altura é 1,58 m e aparece duas vezes em quarenta e oito. O que a planilha faz?',
      data: { options: [
        { id: 'a', text: 'Devolve 1,58 sem nenhum aviso.', correct: true },
        { id: 'b', text: 'Devolve erro, porque duas repetições são poucas.', porque: 'Ela só devolve erro quando não há repetição nenhuma. Duas já bastam para ela responder.' },
        { id: 'c', text: 'Devolve a média no lugar da moda.', porque: 'Ela não troca de conta. MODO responde moda, e nada mais.' },
        { id: 'd', text: 'Avisa que a coluna é contínua.', porque: 'Ela não sabe disso: a classificação da coluna é a sua decisão, e não um campo da planilha.' },
      ]},
      explanation: 'A pergunta "este valor descreve o conjunto?" não é uma pergunta que uma fórmula faça. Quem pergunta é você, filtrando a coluna e lendo quantos sobraram.',
    },
    {
      id: 'ES9-M2-Q4', type: 'true_false',
      prompt: 'A amplitude é uma medida frágil, porque olha só dois valores da base inteira.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Ela é o maior menos o menor: um erro de digitação numa das pontas muda a amplitude e não muda mais nada.' },
      ]},
      explanation: 'A amplitude da altura é 0,74 m, e ela só é tão grande por causa do 1,05 — que é um erro de digitação. O desvio padrão olha a base toda.',
    },
    {
      id: 'ES9-M2-Q5', type: 'multiple_choice',
      prompt: 'Por que se usa DESVPADP e não DESVPAD nesta base?',
      data: { options: [
        { id: 'a', text: 'Porque a base é o clube inteiro.', correct: true },
        { id: 'b', text: 'Porque DESVPAD não existe nesta planilha.', porque: 'Existe, e responde sem reclamar — com um número um pouco maior, que é o da outra pergunta.' },
        { id: 'c', text: 'Porque DESVPADP é mais preciso.', porque: 'Nenhuma é mais precisa: elas respondem perguntas diferentes.' },
        { id: 'd', text: 'Porque a coluna tem mais de trinta valores.', porque: 'A quantidade não decide. O que decide é se você tem o conjunto todo ou um pedaço dele.' },
      ]},
      explanation: 'Amostra é um pedaço de que se quer falar do todo. Aqui não há todo maior: quem se inscreveu é quem está na base.',
    },
    {
      id: 'ES9-M2-Q6', type: 'multiple_choice',
      prompt: 'Na coluna de idade, média, mediana e moda dão praticamente o mesmo valor. O que isso diz?',
      data: { options: [
        { id: 'a', text: 'Que as três descrevem bem a idade.', correct: true },
        { id: 'b', text: 'Que duas das três estão erradas.', porque: 'Nenhuma está errada. Concordarem é o caso fácil, e ele também é informação.' },
        { id: 'c', text: 'Que a coluna tem poucos valores diferentes.', porque: 'Tem seis, de dez a quinze — e três medidas podem concordar numa coluna com muitos valores também.' },
        { id: 'd', text: 'Que não vale a pena calcular as três.', porque: 'Vale: é calculando que se descobre que elas concordam. Sem as três não se sabia disso.' },
      ]},
      explanation: 'Quando as três concordam, use a mais fácil de explicar. Quando discordam, escolher qual relatar é escolher o que quem lê vai entender.',
    },
    {
      id: 'ES9-M2-Q7', type: 'multiple_choice',
      prompt: 'Qual pergunta a média responde, e a mediana não?',
      data: { options: [
        { id: 'a', text: 'Quanto daria a cada um se fosse repartido igualmente.', correct: true },
        { id: 'b', text: 'Quanto tem a pessoa do meio da fila.', porque: 'Essa é a mediana, e é justamente por isso que ela não se move com as pontas.' },
        { id: 'c', text: 'Qual valor mais aparece na coluna.', porque: 'Essa é a moda, e ela pode estar em qualquer ponto da fila.' },
        { id: 'd', text: 'Quantas pessoas estão acima do valor típico.', porque: 'Isso nenhuma das três responde sozinha: é uma contagem à parte, com CONT.SE.' },
      ]},
      explanation: 'Cada uma responde a uma coisa. Relatar as duas quando elas discordam não é indecisão: é descrever a base como ela é.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 3 — Quando a média engana (requisito 3)
     ────────────────────────────────────────────────────────────────────── */
  'm3-teoria': [
    {
      id: 'ES9-M3-Q1', type: 'multiple_choice',
      prompt: 'Por que três veteranos puxam a média de acampamentos e não movem a mediana?',
      data: { options: [
        { id: 'a', text: 'Porque a média soma valores e a mediana conta posições.', correct: true },
        { id: 'b', text: 'Porque a mediana descarta os valores extremos.', porque: 'Ela não descarta nada: os três continuam na fila, e continuam contando como três posições.' },
        { id: 'c', text: 'Porque a mediana é calculada sobre menos valores.', porque: 'Ela é calculada sobre os quarenta e oito. O que ela não usa é o tamanho de cada um.' },
        { id: 'd', text: 'Porque a média foi arredondada.', porque: 'O arredondamento muda a última casa. A diferença aqui é de quarenta e três por cento.' },
      ]},
      explanation: 'Um desbravador com dezoito acampamentos entra na média com dezoito e na mediana como uma posição, igual a quem foi a zero.',
    },
    {
      id: 'ES9-M3-Q2', type: 'multiple_choice',
      prompt: 'A razão entre média e mediana dá 1,43 nos acampamentos e 1,03 na idade. Como se lê isso?',
      data: { options: [
        { id: 'a', text: 'Nos acampamentos elas discordam; na idade, não.', correct: true },
        { id: 'b', text: 'Nos acampamentos há mais dados que na idade.', porque: 'São as mesmas quarenta e oito respostas nas duas colunas.' },
        { id: 'c', text: 'A coluna de idade foi preenchida com mais cuidado.', porque: 'A razão não mede cuidado: mede o quanto a distribuição é torta.' },
        { id: 'd', text: 'A mediana dos acampamentos está errada.', porque: 'Está certa. Ela é 2 porque a pessoa do meio da fila fez dois acampamentos.' },
      ]},
      explanation: 'Perto de 1 as duas descrevem o mesmo conjunto. Longe de 1, uma delas descreve mal — e aí escolher qual relatar passa a importar.',
    },
    {
      id: 'ES9-M3-Q3', type: 'multiple_choice',
      prompt: 'Por que contar quantos chegam à média não serve para achar a coluna que engana?',
      data: { options: [
        { id: 'a', text: 'Porque nas duas colunas a conta fica parecida.', correct: true },
        { id: 'b', text: 'Porque essa contagem não dá para fazer na planilha.', porque: 'Dá, com CONT.SE sobre o critério da média — e é uma das tarefas do módulo.' },
        { id: 'c', text: 'Porque quem fica abaixo da média não conta.', porque: 'Conta, e é justamente por isso que a contagem existe. O problema é que ela não separa as colunas.' },
        { id: 'd', text: 'Porque a média nunca fica no meio da lista.', porque: 'Às vezes fica quase no meio, e é isso que a razão mede.' },
      ]},
      explanation: 'São 19 dos 48 nos acampamentos e 22 na idade: as duas abaixo da metade e perto uma da outra. A distância entre média e mediana é o que separa — 1,43 contra 1,03.',
    },
    {
      id: 'ES9-M3-Q4', type: 'true_false',
      prompt: 'Depois desta lição, o melhor é relatar sempre a mediana e deixar a média de lado.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Em duas das três colunas a média descreve muito bem, e quem deixa de usá-la perde uma medida boa.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'A pergunta não é "média ou mediana?": é "estas duas concordam?". Quando concordam, use a mais fácil de explicar.',
    },
    {
      id: 'ES9-M3-Q5', type: 'multiple_choice',
      prompt: 'O que se escreve na célula da razão entre média e mediana?',
      data: { options: [
        { id: 'a', text: 'Uma divisão apontando para as duas células de cima.', correct: true },
        { id: 'b', text: 'O resultado da divisão, com o sinal de igual na frente.', porque: 'Com igual na frente ele parece conta e é número parado: continua mostrando o de hoje amanhã.' },
        { id: 'c', text: 'A diferença entre as duas, porque razão é subtração.', porque: 'Razão é divisão. A diferença dá um número em anos ou em acampamentos, e não uma proporção.' },
        { id: 'd', text: 'Nada: a planilha tem uma função própria para isso.', porque: 'Não tem. É uma divisão comum entre duas células que você já calculou.' },
      ]},
      explanation: 'Apontar para as células é o que faz a conta se refazer quando o dado muda. É a mesma regra do total digitado à mão da vereda de planilhas.',
    },
    {
      id: 'ES9-M3-Q6', type: 'multiple_choice',
      prompt: 'Como se relata a coluna de acampamentos sem enganar quem lê?',
      data: { options: [
        { id: 'a', text: 'Dizendo as duas medidas e por que elas discordam.', correct: true },
        { id: 'b', text: 'Dizendo só a mediana, que é a mais honesta.', porque: 'Ela sozinha esconde os três veteranos, que são a parte mais interessante do clube.' },
        { id: 'c', text: 'Tirando os três veteranos e recalculando a média.', porque: 'Isso é sumir com o dado. O requisito manda decidir por escrito o que fazer com um valor atípico, e não apagá-lo.' },
        { id: 'd', text: 'Dizendo a média, que é a medida que todos conhecem.', porque: 'Ela sozinha afirma que cada desbravador já foi a quase três acampamentos, o que não descreve este clube.' },
      ]},
      explanation: 'Média 2,85, mediana 2, e vinte e nove dos quarenta e oito com dois ou menos. Três frases, e agora a coluna está descrita.',
    },
    {
      id: 'ES9-M3-Q7', type: 'multiple_choice',
      prompt: 'Renda média e renda mediana de um país quase sempre discordam. Por que isso acontece?',
      data: { options: [
        { id: 'a', text: 'Poucas pessoas muito acima puxam a média.', correct: true },
        { id: 'b', text: 'Porque uma é calculada por ano e a outra por mês.', porque: 'As duas se calculam sobre o mesmo período. A diferença não é de unidade.' },
        { id: 'c', text: 'Porque a mediana ignora quem ganha muito.', porque: 'Ela não ignora ninguém: conta todo mundo como uma posição na fila.' },
        { id: 'd', text: 'Porque as duas contas usam amostras diferentes.', porque: 'Podem sair da mesma pesquisa e continuar discordando, pelo mesmo motivo dos acampamentos.' },
      ]},
      explanation: 'É a mesma assimetria da coluna de acampamentos, num conjunto muito maior. A média sobe com a ponta; a mediana fica onde está a pessoa do meio.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 4 — Distribuição de frequências (requisito 5.3)
     ────────────────────────────────────────────────────────────────────── */
  'm4-teoria': [
    {
      id: 'ES9-M4-Q1', type: 'multiple_choice',
      prompt: 'Para que serve a coluna de frequência acumulada?',
      data: { options: [
        { id: 'a', text: 'Para dizer quantos já foram contados até ali.', correct: true },
        { id: 'b', text: 'Para somar as frequências relativas.', porque: 'A soma das relativas dá cem por cento, e é outra conferência. A acumulada soma as absolutas.' },
        { id: 'c', text: 'Para ordenar a tabela do maior para o menor.', porque: 'A ordem da tabela é escolha de quem a monta, e não resultado de uma coluna.' },
        { id: 'd', text: 'Para mostrar quantos faltam para o total.', porque: 'Ela mostra o contrário: quantos já entraram. O que falta é o total menos ela.' },
      ]},
      explanation: 'E ela serve de conferência: a última acumulada tem de dar o total. Quando não dá, alguma linha ficou de fora ou entrou duas vezes.',
    },
    {
      id: 'ES9-M4-Q2', type: 'multiple_choice',
      prompt: 'Por que a altura precisa de classes e a unidade não?',
      data: { options: [
        { id: 'a', text: 'Porque quase toda pessoa tem uma altura diferente.', correct: true },
        { id: 'b', text: 'Porque a altura tem números e a unidade tem palavras.', porque: 'As diárias também são números, e se contam valor a valor: são três valores diferentes em quarenta e oito respostas.' },
        { id: 'c', text: 'Porque a coluna de altura tem um valor errado.', porque: 'Tem um, e ele é assunto do módulo dos atípicos. Mesmo sem ele haveria quarenta e seis alturas distintas.' },
        { id: 'd', text: 'Porque são muitas respostas.', porque: 'A unidade tem as mesmas quarenta e oito respostas e cabe em seis linhas. O que pesa é quantos valores distintos existem.' },
      ]},
      explanation: 'Uma distribuição serve para mostrar forma. Quarenta e sete linhas de um não mostram forma nenhuma: é a lista com outro nome.',
    },
    {
      id: 'ES9-M4-Q3', type: 'multiple_choice',
      prompt: 'Por que a classe é fechada embaixo e aberta em cima?',
      data: { options: [
        { id: 'a', text: 'Para que quem está na fronteira caia em uma classe só.', correct: true },
        { id: 'b', text: 'Para que a primeira classe comece em zero.', porque: 'Onde a primeira começa é escolha de quem monta a tabela, e não consequência do intervalo aberto.' },
        { id: 'c', text: 'Porque a planilha não aceita intervalo fechado dos dois lados.', porque: 'Aceita, e é assim que o erro entra: dois CONT.SE com menor ou igual contam a fronteira duas vezes.' },
        { id: 'd', text: 'Para deixar as classes com o mesmo tamanho.', porque: 'O tamanho igual vem da largura escolhida, e não de qual lado está aberto.' },
      ]},
      explanation: 'Com os dois lados fechados, quem mede exatamente 1,60 entra em duas classes e a soma passa do total — sem nada estourar na tela.',
    },
    {
      id: 'ES9-M4-Q4', type: 'true_false',
      prompt: 'Uma classe sem ninguém dentro deve ser apagada da tabela.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Tirá-la faz a distribuição parecer contínua onde ela tem um buraco, que é a pista de um valor solto.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'A classe de 1,10 a 1,20 está vazia, e é ela que mostra que o 1,05 está separado do resto da coluna. O vazio é informação.',
    },
    {
      id: 'ES9-M4-Q5', type: 'multiple_choice',
      prompt: 'Na coluna de frequência relativa, o que se põe no divisor?',
      data: { options: [
        { id: 'a', text: 'A célula do total.', correct: true },
        { id: 'b', text: 'O número 48, que é o total de respostas.', porque: 'No ano que vem o total é outro, e a tabela continuaria calculando sobre quarenta e oito.' },
        { id: 'c', text: 'A frequência da linha de cima.', porque: 'Isso daria a razão entre duas linhas vizinhas, que não é parte do todo.' },
        { id: 'd', text: 'A frequência acumulada da própria linha.', porque: 'Isso daria a parte daquela linha dentro do que foi contado até ali, e não dentro do todo.' },
      ]},
      explanation: 'É a mesma regra do valor da diária escrito dentro da fórmula: número digitado está certo hoje e erra calado quando a base muda.',
    },
    {
      id: 'ES9-M4-Q6', type: 'multiple_choice',
      prompt: 'Como se conta quantas alturas caem numa classe, sem CONT.SES?',
      data: { options: [
        { id: 'a', text: 'Quantas estão abaixo do teto, menos quantas estão abaixo do piso.', correct: true },
        { id: 'b', text: 'Quantas estão acima do piso, menos o total.', porque: 'Subtrair o total dá um número negativo. A conta é entre duas contagens do mesmo lado.' },
        { id: 'c', text: 'Somando as alturas da classe e dividindo pela largura.', porque: 'Isso dá uma média esquisita, e não uma contagem de pessoas.' },
        { id: 'd', text: 'Contando as linhas à mão e digitando o número.', porque: 'Número digitado não se refaz, e são oito classes: a chance de errar uma é alta e nada avisaria.' },
      ]},
      explanation: 'Dois CONT.SE resolvem: um com menor que o teto, outro com menor que o piso, e a diferença é a classe. O piso entra, o teto não.',
    },
    {
      id: 'ES9-M4-Q7', type: 'multiple_choice',
      prompt: 'Para que serve a frequência relativa, se a absoluta já diz quantos são?',
      data: { options: [
        { id: 'a', text: 'Para comparar com outro ano ou outro clube.', correct: true },
        { id: 'b', text: 'Para deixar a tabela mais fácil de ler.', porque: 'Ela acrescenta uma coluna a mais. O ganho não é de leitura, é de comparação.' },
        { id: 'c', text: 'Para conferir se a absoluta está certa.', porque: 'Quem confere a tabela é a acumulada, que tem de fechar no total.' },
        { id: 'd', text: 'Para saber quantas camisetas comprar de cada tamanho.', porque: 'Aí o que se usa é a absoluta: ninguém compra vinte e sete por cento de uma camiseta.' },
      ]},
      explanation: 'Treze do Falcão é um número; vinte e sete por cento do clube é uma proporção. A primeira serve para comprar comida, a segunda para comparar.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 5 — Comparar grupos, e o resumo (requisitos 5.4 e 5.5)
     ────────────────────────────────────────────────────────────────────── */
  'm5-teoria': [
    {
      id: 'ES9-M5-Q1', type: 'multiple_choice',
      prompt: 'Nesta planilha, como se calcula a média de uma coluna só para uma unidade?',
      data: { options: [
        { id: 'a', text: 'SOMASE dividido pela contagem daquela unidade.', correct: true },
        { id: 'b', text: 'MÉDIASE sobre a coluna de unidade.', porque: 'Esta planilha não tem MÉDIASE, e a fórmula responde com erro de nome.' },
        { id: 'c', text: 'MÉDIA sobre a coluna inteira, filtrando a unidade.', porque: 'A MÉDIA não respeita o filtro: ela soma as linhas escondidas junto.' },
        { id: 'd', text: 'SOMASE dividido pelo total de inscritos.', porque: 'Isso dilui a média daquela unidade no clube todo, e dá um número menor que o certo.' },
      ]},
      explanation: 'SOMASE soma a coluna que interessa só para aquele grupo; CONT.SE diz quantos são. A divisão dos dois é a média do grupo.',
    },
    {
      id: 'ES9-M5-Q2', type: 'multiple_choice',
      prompt: 'Por que a divisão aponta para a célula de inscritos em vez de repetir o CONT.SE?',
      data: { options: [
        { id: 'a', text: 'Porque duas contas iguais divergem no primeiro ajuste.', correct: true },
        { id: 'b', text: 'Porque CONT.SE não pode aparecer duas vezes numa linha.', porque: 'Pode, e funciona. O problema não é a planilha recusar: é manter as duas iguais para sempre.' },
        { id: 'c', text: 'Porque a fórmula fica mais curta.', porque: 'Fica, e isso é consequência. A razão é a divergência silenciosa entre duas cópias.' },
        { id: 'd', text: 'Porque apontar para uma célula é mais rápido de calcular.', porque: 'A diferença de velocidade não existe nesta escala. O que muda é o risco de as duas discordarem.' },
      ]},
      explanation: 'Mudando o critério de um lado e esquecendo o outro, a média de uma unidade passa a ser calculada sobre outro número de pessoas — e o resultado continua plausível.',
    },
    {
      id: 'ES9-M5-Q3', type: 'multiple_choice',
      prompt: 'Para que serve fazer uma tabela dinâmica de uma conta que você já calculou à mão?',
      data: { options: [
        { id: 'a', text: 'Para ter uma segunda leitura do mesmo dado.', correct: true },
        { id: 'b', text: 'Para deixar o resultado mais bonito na tela.', porque: 'A aparência é o menor dos ganhos. O que ela oferece é uma conta feita por outro caminho.' },
        { id: 'c', text: 'Para que a conta se atualize sozinha.', porque: 'É o contrário: a fórmula se refaz sozinha, e o resumo guarda o que leu até alguém mandar atualizar.' },
        { id: 'd', text: 'Porque o requisito pede, e não há outra razão.', porque: 'O requisito pede porque a conferência vale: duas leituras que discordam denunciam um erro que nenhuma das duas mostraria só.' },
      ]},
      explanation: 'Discordando, uma das duas está lendo coisa diferente — e achar qual é o trabalho mais útil do módulo.',
    },
    {
      id: 'ES9-M5-Q4', type: 'true_false',
      prompt: 'Consertar um valor na base faz a tabela dinâmica se refazer sozinha.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Ela guarda o que leu na hora em que foi criada, e continua relatando aquilo com números plausíveis.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Quem a refaz é o botão Atualizar Tudo. É por isso que a pergunta a fazer de qualquer resumo é sempre a mesma: quando é que isto foi lido?',
    },
    {
      id: 'ES9-M5-Q5', type: 'multiple_choice',
      prompt: 'A Arara tem sete inscritos e média de 4,71 acampamentos. O Falcão tem treze e média 2,31. O que isso responde?',
      data: { options: [
        { id: 'a', text: 'Que a maior unidade não é a mais experiente.', correct: true },
        { id: 'b', text: 'Que a Arara escolhe melhor quem entra.', porque: 'A base não tem coluna nenhuma sobre como cada unidade se forma. Isso é uma explicação, e não um dado.' },
        { id: 'c', text: 'Que o Falcão tem desbravadores mais novos.', porque: 'A média de idade do Falcão é 12,23 e a da Arara 12,86: quase a mesma coisa.' },
        { id: 'd', text: 'Que a média da Arara está errada, por ser calculada sobre poucos.', porque: 'Sete valores dão uma média perfeitamente válida. Poucos dados a tornam instável, e não errada.' },
      ]},
      explanation: 'Contar quantos são e tirar a média respondem perguntas diferentes, e é fácil responder uma achando que respondeu a outra.',
    },
    {
      id: 'ES9-M5-Q6', type: 'multiple_choice',
      prompt: 'O que se escolhe ao montar uma tabela dinâmica por unidade com média de acampamentos?',
      data: { options: [
        { id: 'a', text: 'Unidade nas linhas, acampamentos no valor, resumido por média.', correct: true },
        { id: 'b', text: 'Acampamentos nas linhas e unidade no valor.', porque: 'Isso dá uma linha por número de acampamentos, com as unidades contadas dentro — outra pergunta.' },
        { id: 'c', text: 'Unidade nas linhas e acampamentos somados.', porque: 'A soma dá um número plausível sobre outra pergunta: qual unidade acumulou mais acampamentos no total.' },
        { id: 'd', text: 'Unidade nas linhas e a contagem de respostas no valor.', porque: 'Isso dá quantos inscritos cada unidade tem, que você já calculou na coluna ao lado.' },
      ]},
      explanation: 'Somar em vez de tirar média devolve um número perfeitamente plausível sobre uma pergunta que ninguém fez — e resumir a idade no lugar dos acampamentos também.',
    },
    {
      id: 'ES9-M5-Q7', type: 'multiple_choice',
      prompt: 'Por que comparar grupos vale mais do que descrever a base inteira?',
      data: { options: [
        { id: 'a', text: 'Porque a diferença entre os grupos é onde estão as decisões.', correct: true },
        { id: 'b', text: 'Porque a média do clube inteiro está sempre errada.', porque: 'Ela não está errada: ela é uma frase, e seis frases dizem mais do que uma.' },
        { id: 'c', text: 'Porque grupos menores dão contas mais precisas.', porque: 'Dão o contrário: menos valores tornam a média mais instável.' },
        { id: 'd', text: 'Porque a liderança não entende média do clube todo.', porque: 'Entende. O que a média do clube não oferece é onde agir.' },
      ]},
      explanation: 'Quem precisa de ajuda, quem tem experiência para emprestar, onde pôr o desbravador novo: nada disso está na média do clube.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 6 — Taxa e número absoluto (requisitos 2.6 e 4)
     ────────────────────────────────────────────────────────────────────── */
  'm6-teoria': [
    {
      id: 'ES9-M6-Q1', type: 'multiple_choice',
      prompt: 'Por que a taxa de adesão não se calcula só com o formulário?',
      data: { options: [
        { id: 'a', text: 'Porque falta o total de membros de cada unidade.', correct: true },
        { id: 'b', text: 'Porque o formulário não guarda a unidade.', porque: 'Guarda, e foi de propósito: a unidade saiu de uma lista para não chegar escrita de quatro jeitos.' },
        { id: 'c', text: 'Porque taxa precisa de dois anos para comparar.', porque: 'Não precisa: taxa é uma divisão sobre um momento só.' },
        { id: 'd', text: 'Porque a planilha não divide texto.', porque: 'A conta é entre dois números. O que falta é um deles.' },
      ]},
      explanation: 'O formulário registra quem respondeu, e não quem existe. Quantos são ao todo vem da secretaria do clube, que é de onde vem na vida.',
    },
    {
      id: 'ES9-M6-Q2', type: 'multiple_choice',
      prompt: 'O Falcão deixou três de fora e tem 81,25% de adesão. A Onça deixou dois e tem 75%. Qual conselheiro mobilizou melhor?',
      data: { options: [
        { id: 'a', text: 'O do Falcão.', correct: true },
        { id: 'b', text: 'O da Onça, que deixou menos gente de fora.', porque: 'Dois de oito é uma parte maior da unidade do que três de dezesseis. O absoluto responde outra pergunta.' },
        { id: 'c', text: 'Os dois igualmente, porque as contas se compensam.', porque: 'Não se compensam: 81,25% e 75% são diferentes, e a pergunta tem uma resposta.' },
        { id: 'd', text: 'Não há como saber com estes números.', porque: 'Há: mobilizar bem é levar a maior parte da própria gente, e isso é exatamente a taxa.' },
      ]},
      explanation: 'O Falcão é a maior unidade do clube. Três de dezesseis é menos que dois de oito, e é a taxa que responde a esta pergunta.',
    },
    {
      id: 'ES9-M6-Q3', type: 'multiple_choice',
      prompt: 'Para que serve a coluna de números absolutos, se a taxa responde melhor?',
      data: { options: [
        { id: 'a', text: 'Para saber quantas vagas o acampamento perdeu.', correct: true },
        { id: 'b', text: 'Para nada: depois da taxa, ela pode sair da tabela.', porque: 'Ela responde uma pergunta que a taxa não responde, e é a pergunta de quem compra comida.' },
        { id: 'c', text: 'Para conferir se a taxa foi calculada certo.', porque: 'Ela é parte da conta da taxa, e não uma conferência independente dela.' },
        { id: 'd', text: 'Para ordenar a tabela, porque taxa não se ordena.', porque: 'Taxa se ordena como qualquer número. As duas ordenam, e é aí que a lição acontece.' },
      ]},
      explanation: 'Treze vagas vazias no clube e três delas no Falcão: isso é planejamento de comida e de barraca. Nenhuma das duas colunas está errada.',
    },
    {
      id: 'ES9-M6-Q4', type: 'true_false',
      prompt: 'Comparar números absolutos entre grupos de tamanhos diferentes leva a conclusões erradas.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'O ranking de ausentes desta base põe em primeiro lugar a unidade que mobilizou melhor, e nada na tela avisa.' },
      ]},
      explanation: 'É o erro mais comum que existe com dados, e é o que o requisito 4 manda demonstrar. Ele não dá erro: dá um ranking plausível sobre outra pergunta.',
    },
    {
      id: 'ES9-M6-Q5', type: 'multiple_choice',
      prompt: 'Onde se transforma a taxa em porcentagem?',
      data: { options: [
        { id: 'a', text: 'No formato da célula.', correct: true },
        { id: 'b', text: 'Multiplicando por cem dentro da fórmula.', porque: 'Aí o número deixa de ser uma taxa: comparado com outra taxa de verdade, ele erra por um fator de cem.' },
        { id: 'c', text: 'Escrevendo o sinal de porcentagem depois do número.', porque: 'Isso transforma a célula em texto, e texto não entra em conta nenhuma.' },
        { id: 'd', text: 'Não se transforma: taxa já é porcentagem.', porque: 'Taxa é um número entre zero e um. A porcentagem é uma forma de mostrá-lo.' },
      ]},
      explanation: 'A taxa fica como número entre zero e um, e quem a veste de porcentagem é o formato. É o mesmo motivo de a data não se guardar como texto.',
    },
    {
      id: 'ES9-M6-Q6', type: 'multiple_choice',
      prompt: 'Por que a fórmula de membros aponta para a aba Unidades em vez de trazer o número digitado?',
      data: { options: [
        { id: 'a', text: 'Porque o clube cresce, e o denominador muda.', correct: true },
        { id: 'b', text: 'Porque a planilha não aceita número digitado em fórmula.', porque: 'Aceita sem reclamar. É justamente por isso que o erro atravessa o ano.' },
        { id: 'c', text: 'Porque apontar é mais rápido do que digitar.', porque: 'Digitar é mais rápido, e é isso que torna o atalho tentador.' },
        { id: 'd', text: 'Porque a aba Unidades é a única que a taxa pode ler.', porque: 'Uma fórmula lê qualquer aba. O que importa é de onde o número vem e quem o mantém.' },
      ]},
      explanation: 'Alguém entra na Onça, o denominador vira nove, e uma taxa com o oito escrito à mão continua devolvendo um resultado plausível sobre o clube do ano passado.',
    },
    {
      id: 'ES9-M6-Q7', type: 'matching',
      prompt: 'Ligue cada pergunta ao número que a responde.',
      data: { pairs: [
        { left: 'Quantas barracas ficaram vazias', right: 'Número absoluto de ausentes' },
        { left: 'Qual conselheiro mobilizou melhor', right: 'Taxa de adesão' },
        { left: 'Quanta comida comprar', right: 'Número absoluto de inscritos' },
        { left: 'Se o clube aderiu mais que no ano passado', right: 'Taxa do clube inteiro' },
      ]},
      explanation: 'Absoluto responde quanto há; taxa responde que parte é. A pergunta escolhe o número, e as duas colunas continuam certas.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 7 — Valores atípicos (requisitos 2.5 e 5.6)
     ────────────────────────────────────────────────────────────────────── */
  'm7-teoria': [
    {
      id: 'ES9-M7-Q1', type: 'multiple_choice',
      prompt: 'O menor valor de uma coluna é sempre um valor atípico?',
      data: { options: [
        { id: 'a', text: 'Não: alguém tem de ser o menor.', correct: true },
        { id: 'b', text: 'Sim, porque ele está na ponta da distribuição.', porque: 'Estar na ponta é o normal de dois valores por coluna. Atípico é o que se separou do resto.' },
        { id: 'c', text: 'Só se ele for menor que a média.', porque: 'Metade da base é menor que a média na maioria das colunas. Isso não torna metade da base atípica.' },
        { id: 'd', text: 'Só quando ele aparece uma vez só.', porque: 'Aparecer uma vez é comum em coluna medida. O que conta é a distância até o miolo da base.' },
      ]},
      explanation: 'A coluna de idade dá seis pontas e nenhum atípico: alguém tem de ser o mais novo do clube, e isso não o torna estranho.',
    },
    {
      id: 'ES9-M7-Q2', type: 'multiple_choice',
      prompt: 'O que a cerca de Tukey faz?',
      data: { options: [
        { id: 'a', text: 'Aponta o que se afastou do miolo da base.', correct: true },
        { id: 'b', text: 'Decide quais valores saem da análise.', porque: 'Ela não decide nada. Quem decide é você, por escrito, e é isso que o requisito 5.6 pede.' },
        { id: 'c', text: 'Corrige os valores digitados errado.', porque: 'Ela não corrige: não tem como saber qual era o valor certo.' },
        { id: 'd', text: 'Calcula a média sem os valores extremos.', porque: 'Essa é outra conta, e ela não aponta nada — só devolve um número diferente.' },
      ]},
      explanation: 'Ela sai dos quartis: o miolo entre Q1 e Q3, e uma vez e meia essa distância de cada lado. Na idade vai de 6,5 a 18,5, e ninguém sai dela.',
    },
    {
      id: 'ES9-M7-Q3', type: 'multiple_choice',
      prompt: 'Dezoito acampamentos e uma altura de 1,05 m estão os dois fora da cerca. Por que a decisão é oposta?',
      data: { options: [
        { id: 'a', text: 'Porque um é possível e o outro não.', correct: true },
        { id: 'b', text: 'Porque um está acima da cerca e o outro abaixo.', porque: 'O lado não decide nada: há erro de digitação para cima e gente de verdade para baixo.' },
        { id: 'c', text: 'Porque dezoito é um número inteiro e 1,05 não.', porque: 'A forma do número não diz se ele é verdadeiro. Uma altura de 1,50 também tem casas decimais.' },
        { id: 'd', text: 'Porque o atípico da altura é mais longe da média.', porque: 'A distância não decide: os três veteranos estão muito mais longe, e ficam.' },
      ]},
      explanation: 'A pergunta não é "está longe?". É "isto é uma pessoa possível?" — e ela não se responde com fórmula, responde-se conhecendo o clube.',
    },
    {
      id: 'ES9-M7-Q4', type: 'true_false',
      prompt: 'Quando um valor sai da análise, a linha inteira daquela pessoa sai também.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Excluir a pessoa inteira por causa de uma célula perde nove valores bons para arrumar um.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O Davi continua inscrito, com camiseta P e três diárias. O que sai da análise da altura é a célula da altura dele.',
    },
    {
      id: 'ES9-M7-Q5', type: 'multiple_choice',
      prompt: 'Por que a lição põe dezoito valores das pontas à mesa, e não só os quatro atípicos?',
      data: { options: [
        { id: 'a', text: 'Porque identificar vem antes de decidir.', correct: true },
        { id: 'b', text: 'Porque a cerca não acha os quatro sozinha.', porque: 'Acha, e é conferido. O que ela não faz é pôr a pergunta na sua frente.' },
        { id: 'c', text: 'Para que a lista tenha mais itens a marcar.', porque: 'Quantidade não é o ponto. O ponto é que a maioria das pontas é gente comum.' },
        { id: 'd', text: 'Porque dezoito é o número de linhas que cabe na tela.', porque: 'São três maiores e três menores de cada coluna medida, e a conta vem daí.' },
      ]},
      explanation: 'Pôr só os quatro entregaria a resposta: a tarefa passaria a ser decidir sobre valores que alguém já apontou. O requisito manda identificar primeiro.',
    },
    {
      id: 'ES9-M7-Q6', type: 'multiple_choice',
      prompt: 'O que se faz com os três veteranos, depois de decidir que eles ficam?',
      data: { options: [
        { id: 'a', text: 'Relata-se a mediana ao lado da média.', correct: true },
        { id: 'b', text: 'Nada: se eles ficam, a análise segue igual.', porque: 'Não segue: eles são a razão de a média não descrever a coluna, e o relatório precisa dizer isso.' },
        { id: 'c', text: 'Calcula-se a média sem eles, para comparar.', porque: 'Isso é sumir com o dado com outro nome. A mediana já faz esse trabalho sem apagar ninguém.' },
        { id: 'd', text: 'Marca-se a linha deles com uma cor de aviso.', porque: 'Pintar não muda a conta nem o que se relata. A decisão é sobre o que se escreve.' },
      ]},
      explanation: 'Manter um atípico verdadeiro tem consequência no relatório: é o motivo pelo qual as duas medidas vão juntas na coluna de acampamentos.',
    },
    {
      id: 'ES9-M7-Q7', type: 'multiple_choice',
      prompt: 'Por que a decisão sobre um valor atípico vai por escrito?',
      data: { options: [
        { id: 'a', text: 'Para que quem ler a análise depois saiba o que foi feito.', correct: true },
        { id: 'b', text: 'Porque a planilha exige uma justificativa para excluir.', porque: 'Ela não exige nada: apagar uma célula é um clique, e é justamente esse o risco.' },
        { id: 'c', text: 'Porque o texto serve para recalcular as medidas.', porque: 'O texto não entra em conta nenhuma. Ele diz por que a conta é aquela.' },
        { id: 'd', text: 'Porque sem ele a cerca não aponta os valores.', porque: 'A cerca aponta antes de qualquer decisão. Ela é uma conta, e não um comentário.' },
      ]},
      explanation: 'Uma análise sem isso vira uma média que alguém melhorou. Com isso, ela é uma decisão que se pode discutir — que é o que o examinador vai fazer.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 8 — O gráfico que responde à pergunta (requisito 6)
     ────────────────────────────────────────────────────────────────────── */
  'm8-teoria': [
    {
      id: 'ES9-M8-Q1', type: 'multiple_choice',
      prompt: 'Quando uma pizza faz sentido?',
      data: { options: [
        { id: 'a', text: 'Quando as partes somam o todo.', correct: true },
        { id: 'b', text: 'Quando há poucas categorias para mostrar.', porque: 'Poucas categorias ajudam a ler, e não bastam: seis médias somam 17,1 e continuam desenhando uma pizza.' },
        { id: 'c', text: 'Quando os valores são porcentagens.', porque: 'Podem ser números crus e a pizza continua certa, se eles somarem o todo.' },
        { id: 'd', text: 'Quando se quer comparar categorias.', porque: 'Comparar é trabalho de colunas: na pizza é difícil ver qual de duas fatias parecidas é maior.' },
      ]},
      explanation: 'As seis unidades somam os quarenta e oito inscritos, e aí cada fatia é a parte dela. As médias por unidade não somam o total de nada.',
    },
    {
      id: 'ES9-M8-Q2', type: 'multiple_choice',
      prompt: 'Por que não se liga duas unidades com uma linha?',
      data: { options: [
        { id: 'a', text: 'Porque o traço afirma que uma virou a outra.', correct: true },
        { id: 'b', text: 'Porque unidade é qualitativa e linha só serve para número.', porque: 'A linha desenha o número de cada unidade sem erro. O que ela afirma a mais é a passagem de uma para a outra.' },
        { id: 'c', text: 'Porque as unidades não estão em ordem.', porque: 'Ordenar não conserta: mesmo em ordem, o Falcão não virou a Águia.' },
        { id: 'd', text: 'Porque a planilha recusa linha sobre texto.', porque: 'Ela desenha sem reclamar, e é por isso que o gráfico errado existe.' },
      ]},
      explanation: 'A linha serve para tempo: as inscrições da semana 1 viraram as da semana 2. Entre categorias, o traço é uma afirmação falsa que o desenho faz sozinho.',
    },
    {
      id: 'ES9-M8-Q3', type: 'multiple_choice',
      prompt: 'Um gráfico de colunas sem nome nos eixos mostra o quê?',
      data: { options: [
        { id: 'a', text: 'Barras de alturas diferentes, e nada mais.', correct: true },
        { id: 'b', text: 'O mesmo que com nome, porque os números aparecem.', porque: 'Os números aparecem sem unidade: não se sabe se são pessoas, acampamentos ou reais.' },
        { id: 'c', text: 'Nada: a planilha não desenha sem eixo.', porque: 'Desenha, e fica bonito. É por isso que o gráfico sem eixo chega à reunião.' },
        { id: 'd', text: 'Uma comparação válida, se o título estiver escrito.', porque: 'O título não diz se a coluna é soma, média ou máximo, e as três desenham alturas diferentes.' },
      ]},
      explanation: 'O eixo de baixo diz o que cada coluna é; o de lado diz em que unidade está o número. Sem eles o gráfico é um desenho, e não uma afirmação.',
    },
    {
      id: 'ES9-M8-Q4', type: 'true_false',
      prompt: 'Um gráfico do tipo errado normalmente dá erro ou sai vazio.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Os três tipos desenham sobre qualquer dado: a pizza das médias sai com fatias perfeitamente plausíveis.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'É a matéria desta vereda outra vez: o que engana não é a tela que quebra, é a que responde bonito uma pergunta que ninguém fez.',
    },
    {
      id: 'ES9-M8-Q5', type: 'multiple_choice',
      prompt: 'Qual gráfico responde a "como as inscrições chegaram ao longo do prazo"?',
      data: { options: [
        { id: 'a', text: 'Linha.', correct: true },
        { id: 'b', text: 'Pizza, porque as semanas somam o prazo inteiro.', porque: 'Somam, e a pizza esconde a ordem: ela não mostra que a primeira semana veio antes da última.' },
        { id: 'c', text: 'Colunas, porque se quer comparar as semanas.', porque: 'Colunas comparam e não mostram o caminho. Aqui o que importa é o que mudou de uma semana para a seguinte.' },
        { id: 'd', text: 'Dispersão, porque há duas medidas.', porque: 'Há uma medida ao longo do tempo. A dispersão serve para ver se duas medidas andam juntas.' },
      ]},
      explanation: 'Dezenove na primeira semana, seis, sete e dezesseis na última: a linha mostra a corrida do começo, a calma do meio e a correria do prazo.',
    },
    {
      id: 'ES9-M8-Q6', type: 'multiple_choice',
      prompt: 'O que o título do gráfico não substitui?',
      data: { options: [
        { id: 'a', text: 'O nome do eixo de lado.', correct: true },
        { id: 'b', text: 'A legenda das cores.', porque: 'A legenda também importa, e não é o que o título tenta substituir quando alguém o escreve bem.' },
        { id: 'c', text: 'A escolha do tipo de gráfico.', porque: 'O tipo se escolhe antes, e nenhum título conserta uma pizza de médias.' },
        { id: 'd', text: 'A fonte dos dados.', porque: 'A fonte importa num gráfico publicado, e aqui a base é a sua: o problema do título é outro.' },
      ]},
      explanation: '"Acampamentos por unidade" não diz se a coluna é a soma, a média ou o máximo. O eixo de lado diz, e é uma palavra.',
    },
    {
      id: 'ES9-M8-Q7', type: 'matching',
      prompt: 'Ligue cada pergunta ao tipo de gráfico que a responde.',
      data: { pairs: [
        { left: 'De que unidades o acampamento é feito', right: 'Pizza' },
        { left: 'Qual unidade já foi a mais acampamentos', right: 'Colunas' },
        { left: 'Como as inscrições chegaram ao longo do prazo', right: 'Linha' },
        { left: 'Se quem é mais alto já foi a mais acampamentos', right: 'Dispersão' },
      ]},
      explanation: 'Composição, comparação, evolução e relação. A pergunta escolhe o desenho, e o desenho errado não avisa nada.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 9 — Os quatro recursos que distorcem (requisito 7)
     ────────────────────────────────────────────────────────────────────── */
  'm9-teoria': [
    {
      id: 'ES9-M9-Q1', type: 'multiple_choice',
      prompt: 'O que a maioria dos gráficos enganosos tem em comum?',
      data: { options: [
        { id: 'a', text: 'Os números escritos neles estão certos.', correct: true },
        { id: 'b', text: 'Foram feitos para enganar de propósito.', porque: 'Muitos são descuido. O efeito sobre quem lê é o mesmo, e a intenção não se confere num gráfico.' },
        { id: 'c', text: 'Usam cores chamativas.', porque: 'Cor não distorce leitura de quantidade. Os quatro recursos mexem em altura, em escala ou no que entrou no gráfico.' },
        { id: 'd', text: 'Não citam a fonte dos dados.', porque: 'Vários citam, e a fonte estava certa. O caso da inflação de 2013 trazia os números do IBGE.' },
      ]},
      explanation: 'É isso que torna o gráfico enganoso difícil: procurar o erro na conta não funciona, porque a conta está certa. O que engana é o desenho.',
    },
    {
      id: 'ES9-M9-Q2', type: 'multiple_choice',
      prompt: 'Num gráfico de barras, a barra do número menor saiu mais alta que a do maior. Que recurso é esse?',
      data: { options: [
        { id: 'a', text: 'Escala inadequada.', correct: true },
        { id: 'b', text: 'Eixo truncado.', porque: 'No eixo truncado a ordem continua certa: a barra maior é a do número maior, e só a diferença entre elas fica exagerada.' },
        { id: 'c', text: 'Base incomparável.', porque: 'Nesse, o problema é o que entrou no gráfico, e não a altura: os desenhos estão em proporção.' },
        { id: 'd', text: 'Recorte conveniente do período.', porque: 'Nesse, o desenho também está em proporção. O que engana é o pedaço do tempo escolhido.' },
      ]},
      explanation: 'Olhe a ordem: se uma barra menor está mais alta que uma maior, não é o eixo — é o desenho que não leu a tabela.',
    },
    {
      id: 'ES9-M9-Q3', type: 'multiple_choice',
      prompt: 'Como se distingue eixo truncado de escala inadequada?',
      data: { options: [
        { id: 'a', text: 'Pela ordem das alturas.', correct: true },
        { id: 'b', text: 'Pelo tipo de gráfico usado.', porque: 'Os dois aparecem em barras, em linhas e em colunas. O tipo não decide.' },
        { id: 'c', text: 'Pelo tamanho da diferença entre os valores.', porque: 'Os dois podem aparecer com diferenças grandes ou pequenas. O tamanho da diferença é o que o primeiro exagera, e não o que o identifica.' },
        { id: 'd', text: 'Pela presença da fonte no rodapé.', porque: 'Fonte citada não impede nenhum dos dois: o gráfico da inflação de 2013 citava o IBGE.' },
      ]},
      explanation: 'No truncado a ordem está certa e as diferenças parecem grandes demais. Na escala inadequada a ordem está errada.',
    },
    {
      id: 'ES9-M9-Q4', type: 'multiple_choice',
      prompt: 'São Paulo encabeça praticamente todo gráfico absoluto do Brasil — de mortes, de nascimentos, de carros. Por quê?',
      data: { options: [
        { id: 'a', text: 'É onde vive mais gente.', correct: true },
        { id: 'b', text: 'Porque é o estado mais rico.', porque: 'Riqueza explicaria alguns desses gráficos e não todos. Nascimentos e mortes acompanham população.' },
        { id: 'c', text: 'Porque os dados de São Paulo são mais bem coletados.', porque: 'Coleta melhor afetaria a contagem, e não a ordem de grandeza: nenhum estado de 4 milhões alcançaria um de 46 só por contar melhor.' },
        { id: 'd', text: 'Porque os gráficos são feitos em São Paulo.', porque: 'Onde o gráfico foi feito não muda o número. O que o muda é quantas pessoas há para contar.' },
      ]},
      explanation: 'É a base incomparável: comparar grupos de tamanhos muito diferentes em número absoluto. A comparação que diz algo é por habitante.',
    },
    {
      id: 'ES9-M9-Q5', type: 'multiple_choice',
      prompt: 'Um painel passou a mostrar apenas as mortes das últimas 24 horas, e tirou da tela o total acumulado. Que recurso é esse?',
      data: { options: [
        { id: 'a', text: 'Recorte conveniente do período.', correct: true },
        { id: 'b', text: 'Base incomparável.', porque: 'A base é a mesma: o mesmo país, a mesma série. O que mudou foi o pedaço de tempo que apareceu.' },
        { id: 'c', text: 'Escala inadequada.', porque: 'Não há barra fora de proporção: o número do dia é verdadeiro e está desenhado certo.' },
        { id: 'd', text: 'Eixo truncado.', porque: 'O eixo pode até começar em zero. O que engana não está no eixo, está no que ficou de fora.' },
      ]},
      explanation: 'Cada número do recorte é verdadeiro, e o que ficou de fora é o que mudava a leitura: 904 mortes no dia, 35.930 acumuladas.',
    },
    {
      id: 'ES9-M9-Q6', type: 'true_false',
      prompt: 'Um eixo que não começa em zero é sempre desonesto.',
      data: { options: [
        { id: 'f', text: 'Falso', correct: true },
        { id: 'v', text: 'Verdadeiro', porque: 'Num gráfico de temperatura corporal, começar em zero esconderia tudo o que importa. O que o eixo truncado exige é estar escrito, para quem lê saber que a altura não é proporção.' },
      ]},
      explanation: 'O problema não é truncar: é truncar sem dizer, e deixar quem lê achar que a altura é proporcional.',
    },
    {
      id: 'ES9-M9-Q7', type: 'multiple_choice',
      prompt: 'Qual é o teste para desconfiar de um recorte de período?',
      data: { options: [
        { id: 'a', text: 'Perguntar o que vem antes e depois do pedaço mostrado.', correct: true },
        { id: 'b', text: 'Conferir se o eixo horizontal começa em zero.', porque: 'Eixo de tempo não começa em zero: ele começa numa data. Qual data é justamente o que se investiga.' },
        { id: 'c', text: 'Verificar se a fonte dos dados está citada.', porque: 'A fonte pode estar citada e completa, e o gráfico mostrar só um trecho dela.' },
        { id: 'd', text: 'Contar quantos pontos o gráfico tem.', porque: 'Um recorte pode ter muitos pontos. O que importa é onde ele começa e termina, e não quantos cabem no meio.' },
      ]},
      explanation: 'Se o gráfico começa num ano específico sem motivo declarado, procure a série inteira: o motivo costuma estar no que ficou de fora.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 10 — A conclusão (requisito 8)
     ────────────────────────────────────────────────────────────────────── */
  'm10-teoria': [
    {
      id: 'ES9-M10-Q1', type: 'multiple_choice',
      prompt: 'Quando uma pergunta se responde com a sua base?',
      data: { options: [
        { id: 'a', text: 'Quando as colunas dela agrupam alguém.', correct: true },
        { id: 'b', text: 'Quando ela é sobre o clube.', porque: 'Quase toda pergunta sobre o clube é sobre coisas que o formulário não perguntou.' },
        { id: 'c', text: 'Quando a base tem respostas suficientes.', porque: 'Quarenta e oito respostas não ajudam se a coluna de que a pergunta trata não existe.' },
        { id: 'd', text: 'Quando a resposta cabe num número.', porque: 'Há perguntas com resposta numérica que a base não responde: quantos desistiram, por exemplo.' },
      ]},
      explanation: '"Qual unidade tem mais experiência?" trata de unidade e de acampamentos, e as duas estão lá. "Por que ela tem?" trata de uma coluna que não existe.',
    },
    {
      id: 'ES9-M10-Q2', type: 'multiple_choice',
      prompt: 'Por que "quem se inscreve mais cedo?" não se responde com a coluna de nomes?',
      data: { options: [
        { id: 'a', text: 'Porque ela tem um valor por pessoa.', correct: true },
        { id: 'b', text: 'Porque a base não guarda a data de inscrição.', porque: 'Guarda: é a coluna que o gráfico de evolução usa. O problema é a coluna de nomes.' },
        { id: 'c', text: 'Porque nomes não se ordenam.', porque: 'Ordenam em ordem alfabética sem nenhum problema. Ordenar não é agrupar.' },
        { id: 'd', text: 'Porque a pergunta não tem número na resposta.', porque: 'A resposta seria uma data, que é um valor perfeitamente analisável.' },
      ]},
      explanation: 'Trocando o nome pela unidade, a pergunta passa a se responder: "qual unidade se inscreve mais cedo?" tem seis grupos e uma resposta.',
    },
    {
      id: 'ES9-M10-Q3', type: 'multiple_choice',
      prompt: 'O que quer dizer responder à pergunta com os dados?',
      data: { options: [
        { id: 'a', text: 'Trazer o número junto da resposta.', correct: true },
        { id: 'b', text: 'Citar a aba onde a conta foi feita.', porque: 'Dizer onde está não é dizer quanto é. Quem lê a conclusão não vai abrir a sua planilha.' },
        { id: 'c', text: 'Mostrar o gráfico em vez de escrever.', porque: 'O gráfico ajuda e não responde: ele mostra a forma, e a resposta é uma frase.' },
        { id: 'd', text: 'Escrever a fórmula que você usou.', porque: 'A fórmula é o caminho. A conclusão fala do resultado, para quem não vai refazer a conta.' },
      ]},
      explanation: 'Sem número, a resposta é uma opinião sobre uma base que você passou oito módulos montando. E se a pergunta compara grupos, um número sozinho não compara nada.',
    },
    {
      id: 'ES9-M10-Q4', type: 'true_false',
      prompt: 'Declarar o que os dados não permitem afirmar enfraquece a conclusão.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Uma conclusão que diz até onde vai é uma conclusão em que se pode confiar dentro daquele limite.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Quem não declara o limite deixa que outra pessoa o descubra na reunião — e aí o limite chega como objeção, e não como parte do trabalho.',
    },
    {
      id: 'ES9-M10-Q5', type: 'multiple_choice',
      prompt: 'Qual destas frases a base do acampamento não sustenta?',
      data: { options: [
        { id: 'a', text: 'O nosso clube é mais experiente que a média.', correct: true },
        { id: 'b', text: 'A Arara é a unidade com mais experiência por desbravador.', porque: 'A média de acampamentos por unidade está calculada, e a Arara tem a maior.' },
        { id: 'c', text: 'Vinte e nove dos quarenta e oito fizeram dois acampamentos ou menos.', porque: 'É uma contagem direta sobre a coluna, e ela está na aba de cálculos.' },
        { id: 'd', text: 'O Falcão levou a maior parte da própria gente.', porque: 'A taxa de adesão responde isso: 81,25%, a melhor das seis.' },
      ]},
      explanation: 'Não há outro clube dentro da base. Comparar com uma média de fora exige um dado de fora, e ele não está lá.',
    },
    {
      id: 'ES9-M10-Q6', type: 'multiple_choice',
      prompt: 'Por que o limite vai em campo separado da conclusão?',
      data: { options: [
        { id: 'a', text: 'Porque junto dela ele sai como uma frase de rodapé.', correct: true },
        { id: 'b', text: 'Porque a conclusão tem tamanho máximo de uma página.', porque: 'O limite cabe na página. O que muda não é o espaço, é a atenção que ele recebe.' },
        { id: 'c', text: 'Porque quem lê a conclusão não precisa do limite.', porque: 'Precisa mais do que de qualquer outra parte: é o limite que diz onde a conclusão para de valer.' },
        { id: 'd', text: 'Porque o limite não é parte da análise.', porque: 'É parte dela, e é a metade que o requisito 8 pede com todas as letras.' },
      ]},
      explanation: 'Em campo próprio ele é uma pergunta que precisa de resposta. Quem acabou de achar um número quer contar o que ele mostra, não o que ele não mostra.',
    },
    {
      id: 'ES9-M10-Q7', type: 'multiple_choice',
      prompt: 'Por que a conclusão tem tamanho máximo?',
      data: { options: [
        { id: 'a', text: 'Porque cortar obriga a escolher o que dizer.', correct: true },
        { id: 'b', text: 'Para que a liderança não precise ler muito.', porque: 'A liderança leria mais se valesse a pena. O limite serve a quem escreve, obrigando a escolher.' },
        { id: 'c', text: 'Porque o resto vai no anexo.', porque: 'Não há anexo: o que não entra na conclusão fica na planilha, onde já estava.' },
        { id: 'd', text: 'Porque uma página é o que cabe num relatório de clube.', porque: 'Relatórios de clube têm várias páginas. O limite é da conclusão, e é uma escolha de escrita.' },
      ]},
      explanation: 'Começar pela resposta e cortar o que não muda a decisão de quem lê: é isso que uma página força a fazer.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 11 — A defesa diante do examinador (requisito 9)
     ────────────────────────────────────────────────────────────────────── */
  'm11-teoria': [
    {
      id: 'ES9-M11-Q1', type: 'multiple_choice',
      prompt: 'O examinador diz que o Falcão é a unidade que menos leva gente. Como se responde?',
      data: { options: [
        { id: 'a', text: 'Com a taxa de adesão dele, que é a melhor das seis.', correct: true },
        { id: 'b', text: 'Reconhecendo o limite, porque ele deixou três de fora.', porque: 'Os dados respondem isto: três de dezesseis é a melhor parte levada das seis unidades.' },
        { id: 'c', text: 'Dizendo que o Falcão é a maior unidade e pronto.', porque: 'Ser a maior é o motivo, e não a resposta. A resposta é o número que a conta dá.' },
        { id: 'd', text: 'Mostrando a coluna de ausentes, que tem os três.', porque: 'É a coluna que sustenta a objeção. Responder com ela é concordar com quem contestou.' },
      ]},
      explanation: 'Treze de dezesseis é 81,25%. As outras deixaram dois de fora, de unidades bem menores: a Onça deixou dois de oito, que é 75%.',
    },
    {
      id: 'ES9-M11-Q2', type: 'multiple_choice',
      prompt: 'O examinador diz que a média de quase três acampamentos mostra um clube experiente. O que se responde?',
      data: { options: [
        { id: 'a', text: 'Que a mediana é 2, e a média está puxada.', correct: true },
        { id: 'b', text: 'Que a média está errada.', porque: 'Ela está certa: é 2,85. O que ela não faz é descrever a coluna.' },
        { id: 'c', text: 'Que dois e oitenta e cinco não é quase três.', porque: 'Discutir o arredondamento deixa a afirmação de pé. O problema dela é outro.' },
        { id: 'd', text: 'Que sem os veteranos a média seria menor.', porque: 'Seria, e recalcular sem eles é sumir com o dado. A mediana já faz o trabalho sem apagar ninguém.' },
      ]},
      explanation: 'Média 2,85, mediana 2, e 29 dos 48 com dois acampamentos ou menos. O número que desfaz a objeção já estava calculado.',
    },
    {
      id: 'ES9-M11-Q3', type: 'multiple_choice',
      prompt: 'O examinador diz que as unidades mais experientes têm conselheiros melhores. O que se faz?',
      data: { options: [
        { id: 'a', text: 'Reconhece-se que a base não responde isso.', correct: true },
        { id: 'b', text: 'Defende-se com a média de acampamentos de cada unidade.', porque: 'Essa média mostra a experiência, e não de onde ela veio. Defender com ela é responder outra pergunta.' },
        { id: 'c', text: 'Concorda-se, porque os números apontam nessa direção.', porque: 'Concordar é afirmar o que a base não sustenta. Reconhecer o limite é dizer que ela não sustenta.' },
        { id: 'd', text: 'Pede-se ao examinador que prove o contrário.', porque: 'Quem apresenta a análise responde por ela. Devolver a pergunta não é nenhuma das duas respostas certas.' },
      ]},
      explanation: 'Não há coluna sobre o trabalho do conselheiro, e experiência acumulada também depende de há quanto tempo cada um está no clube — que a base não registra.',
    },
    {
      id: 'ES9-M11-Q4', type: 'true_false',
      prompt: 'Reconhecer um limite é perder a discussão com o examinador.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'É dizer até onde a análise vai, e quem reconhece um limite dá mais razão para confiar no resto dela.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Quem defende tudo não entendeu a própria análise; quem reconhece tudo não confia nela. O requisito 9 pede as duas respostas porque as duas são o trabalho.',
    },
    {
      id: 'ES9-M11-Q5', type: 'multiple_choice',
      prompt: 'Por que nenhuma base responde "se a inscrição tivesse aberto mais cedo, teriam vindo mais"?',
      data: { options: [
        { id: 'a', text: 'Porque ela registra só o que aconteceu.', correct: true },
        { id: 'b', text: 'Porque falta a coluna de data de inscrição.', porque: 'A coluna existe, e o gráfico de evolução a usa. O que falta é o outro cenário.' },
        { id: 'c', text: 'Porque quarenta e oito respostas são poucas para isso.', porque: 'Nem quatro mil responderiam: a pergunta é sobre um mundo que não aconteceu.' },
        { id: 'd', text: 'Porque a pergunta é sobre o futuro.', porque: 'É sobre um passado alternativo, e é isso que a torna impossível: não há registro dele.' },
      ]},
      explanation: 'Para saber, seria preciso abrir a inscrição mais cedo uma vez e comparar. Dizer isso é a resposta — e ela nomeia o que faltaria.',
    },
    {
      id: 'ES9-M11-Q6', type: 'multiple_choice',
      prompt: 'O que separa defender com os dados de simplesmente insistir?',
      data: { options: [
        { id: 'a', text: 'O número, calculado antes da pergunta.', correct: true },
        { id: 'b', text: 'A firmeza com que se responde.', porque: 'Firmeza sem número é a mesma opinião do examinador, do outro lado da mesa.' },
        { id: 'c', text: 'Ter escrito a conclusão em uma página.', porque: 'O tamanho da conclusão não muda o que sustenta uma objeção.' },
        { id: 'd', text: 'Mostrar a planilha em vez de explicar.', porque: 'A planilha tem tudo e não responde nada sozinha: quem aponta o número é você.' },
      ]},
      explanation: 'É para isso que se calculou tudo o que se calculou nos oito módulos: a conta estava pronta antes de a pergunta ser feita.',
    },
    {
      id: 'ES9-M11-Q7', type: 'multiple_choice',
      prompt: 'Como se reconhece um limite sem deixar a resposta vazia?',
      data: { options: [
        { id: 'a', text: 'Dizendo o que faltaria para responder.', correct: true },
        { id: 'b', text: 'Dizendo que a base é pequena.', porque: 'Não é tamanho: é ausência de coluna, ou de cenário. Dizer "pequena" nomeia o problema errado.' },
        { id: 'c', text: 'Dizendo que a pergunta não faz sentido.', porque: 'Ela faz: é uma pergunta boa para outra base. O que não existe é o dado.' },
        { id: 'd', text: 'Prometendo levantar o dado depois.', porque: 'Pode-se levantar, e isso não é o reconhecimento: primeiro se diz o que falta e por quê.' },
      ]},
      explanation: 'Reconhecer o limite é diferente de não ter resposta. A resposta é: isto a base não responde, e é isto que faltaria para responder.',
    },
  ],
};
