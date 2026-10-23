import type { Question } from '../types';

/*
 * As questões das lições de teoria da CC-DG004 Identidade Visual.
 *
 * A definição vale uma vez por lição; o resto é consequência e diagnóstico —
 * a marca que some na camiseta, o cartaz com o roxo errado, o crachá sem
 * respiro, o descarte sem motivo. Toda errada diz por que está errada no
 * campo porque, a certa é uma afirmação curta e o porquê dela mora no
 * explanation, pela razão escrita na CC-ES012. Sem crase nem asterisco: a
 * questão vai para o QuestionRenderer, que imprime texto puro.
 */

export const QUESTOES_DA_IDENTIDADE_VISUAL: Record<string, Question[]> = {
  /* ── Módulo 1 — identidade visual e conceito (requisitos 2.1 e 4.1) ──── */
  'm1-teoria': [
    {
      id: 'DG4-M1-Q1', type: 'multiple_choice',
      prompt: 'O que é identidade visual?',
      data: { options: [
        { id: 'a', text: 'Marca, cores, letras e as regras de uso.', correct: true },
        { id: 'b', text: 'Só o desenho da marca.', porque: 'A marca é uma parte; sem as regras, ela muda a cada peça.' },
        { id: 'c', text: 'O nome da unidade escrito.', porque: 'O nome escrito é o logotipo, uma peça só.' },
        { id: 'd', text: 'A foto oficial da unidade.', porque: 'Foto é conteúdo de uma peça, e não identidade.' },
      ]},
      explanation: 'É o conjunto que faz alguém reconhecer quem é você sem ler nada.',
    },
    {
      id: 'DG4-M1-Q2', type: 'multiple_choice',
      prompt: 'Qual destes é um público bem definido para a marca da unidade?',
      data: { options: [
        { id: 'a', text: 'Desbravadores de 10 a 12 anos e famílias.', correct: true },
        { id: 'b', text: 'Todo mundo.', porque: 'Marca feita para todos não fala com ninguém.' },
        { id: 'c', text: 'Quem gostar da marca.', porque: 'Isso descreve o resultado, e não a quem a marca se dirige.' },
        { id: 'd', text: 'Qualquer pessoa da internet.', porque: 'É todo mundo com outro nome.' },
      ]},
      explanation: 'Público definido diz quem e com que idade: é o que permite escolher forma, cor e letra.',
    },
    {
      id: 'DG4-M1-Q3', type: 'multiple_choice',
      prompt: 'Para que servem as três palavras do conceito?',
      data: { options: [
        { id: 'a', text: 'Para decidir entre duas opções de desenho.', correct: true },
        { id: 'b', text: 'Para escrever embaixo da marca.', porque: 'Elas guiam o desenho, não aparecem nele.' },
        { id: 'c', text: 'Para dar nome à unidade.', porque: 'A unidade já tem nome.' },
        { id: 'd', text: 'Para enfeitar o manual.', porque: 'Elas são ferramenta de escolha, não enfeite.' },
      ]},
      explanation: 'Diante de duas opções, a pergunta passa a ser qual diz melhor as três palavras.',
    },
    {
      id: 'DG4-M1-Q4', type: 'multiple_choice',
      prompt: 'Qual palavra ajuda mais a decidir o desenho de uma marca?',
      data: { options: [
        { id: 'a', text: 'Firme.', correct: true },
        { id: 'b', text: 'Legal.', porque: 'Legal não diz nada sobre forma, cor ou letra.' },
        { id: 'c', text: 'Bonita.', porque: 'Toda marca quer ser bonita; a palavra não escolhe nada.' },
        { id: 'd', text: 'Boa.', porque: 'Boa é um juízo, e não uma ideia que se desenha.' },
      ]},
      explanation: 'Firme pede base larga e linhas retas: é uma palavra que se desenha.',
    },
    {
      id: 'DG4-M1-Q5', type: 'multiple_choice',
      prompt: 'Cada cartaz da unidade usa a marca de um jeito: esticada, em outra cor, encostada no título. O que falta?',
      data: { options: [
        { id: 'a', text: 'Regras de uso escritas.', correct: true },
        { id: 'b', text: 'Uma marca mais bonita.', porque: 'A marca pode ser ótima e continuar sendo usada de qualquer jeito.' },
        { id: 'c', text: 'Mais cores na marca.', porque: 'Mais cores dão mais jeitos de errar.' },
        { id: 'd', text: 'Cartazes maiores.', porque: 'O tamanho do cartaz não decide como a marca é usada.' },
      ]},
      explanation: 'O que segura a identidade são as regras, e é por isso que a vereda termina num manual.',
    },
    {
      id: 'DG4-M1-Q6', type: 'true_false',
      prompt: 'O conceito vem antes do desenho.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Sem conceito, cada escolha do desenho vira gosto pessoal.' },
      ]},
      explanation: 'O conceito é o que permite defender o desenho diante do examinador.',
    },
    {
      id: 'DG4-M1-Q7', type: 'true_false',
      prompt: 'Três palavras que querem dizer a mesma coisa dão mais força ao conceito.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Três sinônimos são uma ideia só; o conceito fica com uma palavra.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'As três palavras precisam ser três ideias diferentes.',
    },
  ],

  /* ── Módulo 2 — rascunhos (requisitos 4.2 e 7) ───────────────────────── */
  'm2-teoria': [
    {
      id: 'DG4-M2-Q1', type: 'multiple_choice',
      prompt: 'Por que rascunhar no papel antes do computador?',
      data: { options: [
        { id: 'a', text: 'É rápido e não prende a uma ideia só.', correct: true },
        { id: 'b', text: 'Porque o computador não desenha bem.', porque: 'O computador desenha bem; o problema é o tempo que cada ideia custa nele.' },
        { id: 'c', text: 'Para não gastar a bateria.', porque: 'O motivo é o tempo e o apego, não a bateria.' },
        { id: 'd', text: 'Porque o examinador só aceita papel.', porque: 'A marca final é em vetor; o papel é para as ideias.' },
      ]},
      explanation: 'No papel uma ideia leva um minuto; quem gastou meia hora numa ideia não quer jogá-la fora.',
    },
    {
      id: 'DG4-M2-Q2', type: 'multiple_choice',
      prompt: 'Em geral, onde aparecem as melhores ideias de uma série de dez?',
      data: { options: [
        { id: 'a', text: 'Depois das primeiras, as óbvias.', correct: true },
        { id: 'b', text: 'Sempre na primeira.', porque: 'A primeira costuma ser a óbvia, a que todo mundo teria.' },
        { id: 'c', text: 'Só na décima.', porque: 'Não há posição certa; o ponto é passar das óbvias.' },
        { id: 'd', text: 'Em nenhuma; a ideia vem no computador.', porque: 'O computador finaliza; a ideia nasce no rascunho.' },
      ]},
      explanation: 'Quando as ideias óbvias acabam, sobra espaço para as que ninguém teria de primeira.',
    },
    {
      id: 'DG4-M2-Q3', type: 'multiple_choice',
      prompt: 'Qual destes é um motivo de descarte bem escrito?',
      data: { options: [
        { id: 'a', text: 'As raízes viram rabisco quando a marca fica pequena.', correct: true },
        { id: 'b', text: 'Não ficou bom.', porque: 'Não diz o que faltou, e não ajuda a não errar de novo.' },
        { id: 'c', text: 'Não gostei.', porque: 'Gosto não se defende; motivo, sim.' },
        { id: 'd', text: 'Era o rascunho 4.', porque: 'O número identifica o rascunho, não explica o descarte.' },
      ]},
      explanation: 'Motivo bom diz o que acontece com o desenho — aqui, o que some no tamanho pequeno.',
    },
    {
      id: 'DG4-M2-Q4', type: 'multiple_choice',
      prompt: 'Um rascunho parece muito com a marca de outro clube. O que fazer?',
      data: { options: [
        { id: 'a', text: 'Descartar e registrar o motivo.', correct: true },
        { id: 'b', text: 'Seguir com ele, já que deu certo para o outro.', porque: 'A marca deixaria de ser reconhecida como sua.' },
        { id: 'c', text: 'Trocar só a cor e seguir.', porque: 'A forma continua sendo a do outro clube.' },
        { id: 'd', text: 'Apagar e não contar a ninguém.', porque: 'Esse é justamente um descarte que vale explicar.' },
      ]},
      explanation: 'Parecer com a marca de outro é um dos motivos de descarte mais importantes.',
    },
    {
      id: 'DG4-M2-Q5', type: 'multiple_choice',
      prompt: 'Como escolher o rascunho que segue para o computador?',
      data: { options: [
        { id: 'a', text: 'O que diz as três palavras com menos traços.', correct: true },
        { id: 'b', text: 'O que deu mais trabalho.', porque: 'Trabalho gasto não diz se a marca comunica.' },
        { id: 'c', text: 'O mais detalhado.', porque: 'Detalhe some quando a marca fica pequena.' },
        { id: 'd', text: 'O primeiro que saiu.', porque: 'O primeiro costuma ser o óbvio.' },
      ]},
      explanation: 'O conceito decide, e o tamanho pequeno desempata.',
    },
    {
      id: 'DG4-M2-Q6', type: 'true_false',
      prompt: 'Desenhar o rascunho pequeno já mostra o que vai sumir no crachá.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'No tamanho de uma moeda o detalhe excessivo já aparece.' },
      ]},
      explanation: 'Rascunho pequeno é teste de tamanho reduzido desde o começo.',
    },
    {
      id: 'DG4-M2-Q7', type: 'true_false',
      prompt: 'Copiar a mesma frase como motivo de todos os descartes basta para justificá-los.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'A mesma frase para nove desenhos diferentes não explica nenhum.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Cada descarte tem o seu motivo, porque cada rascunho tinha o seu problema.',
    },
  ],

  /* ── Módulo 3 — símbolo, logotipo e assinatura (requisitos 2.2 e 4.3) ── */
  'm3-teoria': [
    {
      id: 'DG4-M3-Q1', type: 'multiple_choice',
      prompt: 'O que é o símbolo de uma marca?',
      data: { options: [
        { id: 'a', text: 'O desenho, que funciona sem palavra.', correct: true },
        { id: 'b', text: 'O nome escrito numa letra própria.', porque: 'Esse é o logotipo.' },
        { id: 'c', text: 'O desenho e o nome juntos.', porque: 'Esses dois juntos são a assinatura.' },
        { id: 'd', text: 'A paleta de cores.', porque: 'A paleta é parte da identidade, não da marca desenhada.' },
      ]},
      explanation: 'O símbolo é a copa e o tronco: vai sozinho no ícone do grupo.',
    },
    {
      id: 'DG4-M3-Q2', type: 'multiple_choice',
      prompt: 'O que é a assinatura?',
      data: { options: [
        { id: 'a', text: 'Símbolo e logotipo juntos, em posição fixa.', correct: true },
        { id: 'b', text: 'O nome de quem desenhou a marca.', porque: 'Assinatura, aqui, é termo de identidade visual.' },
        { id: 'c', text: 'Só o símbolo.', porque: 'O símbolo é uma das duas partes da assinatura.' },
        { id: 'd', text: 'O manual de marca.', porque: 'O manual traz as regras da assinatura.' },
      ]},
      explanation: 'No programa ela vira um grupo, para os dois andarem juntos.',
    },
    {
      id: 'DG4-M3-Q3', type: 'multiple_choice',
      prompt: 'Por que finalizar o símbolo em vetor?',
      data: { options: [
        { id: 'a', text: 'Ele vai do carimbo à faixa sem perder nitidez.', correct: true },
        { id: 'b', text: 'Vetor tem mais cores.', porque: 'A quantidade de cores não depende de ser vetor.' },
        { id: 'c', text: 'Vetor é mais rápido de desenhar.', porque: 'O motivo é o tamanho, não a velocidade.' },
        { id: 'd', text: 'Porque foto não pode ser marca.', porque: 'O problema da foto é borrar ao ampliar.' },
      ]},
      explanation: 'O vetor refaz o desenho em qualquer tamanho, como a CC-DG002 mostrou.',
    },
    {
      id: 'DG4-M3-Q4', type: 'multiple_choice',
      prompt: 'Como passar o rascunho de copa irregular para vetor?',
      data: { options: [
        { id: 'a', text: 'Achar a forma simples por trás dele.', correct: true },
        { id: 'b', text: 'Copiar cada tremido do traço.', porque: 'O tremido é da mão, e não da ideia.' },
        { id: 'c', text: 'Fotografar o papel e usar a foto.', porque: 'A foto borra ao ampliar e não muda de cor.' },
        { id: 'd', text: 'Desenhar com o maior número de nós.', porque: 'Nó demais deixa a forma ondulada e difícil de acertar.' },
      ]},
      explanation: 'A copa irregular vira uma elipse; o tronco, um retângulo.',
    },
    {
      id: 'DG4-M3-Q5', type: 'multiple_choice',
      prompt: 'O símbolo some quando visto em 16 pixels. O que isso indica?',
      data: { options: [
        { id: 'a', text: 'Detalhe demais.', correct: true },
        { id: 'b', text: 'Cor demais.', porque: 'Cor não faz a forma sumir; detalhe pequeno faz.' },
        { id: 'c', text: 'Que ele está perfeito.', porque: 'Símbolo que some pequeno falha no ícone e no carimbo.' },
        { id: 'd', text: 'Que precisa de mais texto.', porque: 'Texto some antes ainda que a forma.' },
      ]},
      explanation: 'Partes finas e pequenas viram mancha: é hora de simplificar.',
    },
    {
      id: 'DG4-M3-Q6', type: 'true_false',
      prompt: 'O logotipo usa sempre a mesma letra, o mesmo peso e a mesma cor.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Trocar a letra do nome é trocar a marca.' },
      ]},
      explanation: 'O logotipo não é qualquer texto: é o nome escrito sempre do mesmo jeito.',
    },
    {
      id: 'DG4-M3-Q7', type: 'true_false',
      prompt: 'O cinza que o editor dá a uma forma nova já serve como cor da marca.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'É a cor que o programa põe em tudo, e não uma escolha.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Cada forma do símbolo é pintada de propósito, com uma cor da marca.',
    },
  ],

  /* ── Módulo 4 — versões (requisitos 2.3, 3 e 4.4) ────────────────────── */
  'm4-teoria': [
    {
      id: 'DG4-M4-Q1', type: 'multiple_choice',
      prompt: 'O que é a versão negativa?',
      data: { options: [
        { id: 'a', text: 'Uma cor só, clara, sobre fundo escuro.', correct: true },
        { id: 'b', text: 'A marca de cabeça para baixo.', porque: 'Negativa é de cor, não de posição.' },
        { id: 'c', text: 'A marca em preto sobre branco.', porque: 'Essa é a monocromática.' },
        { id: 'd', text: 'A marca com as cores trocadas entre si.', porque: 'A negativa tem uma cor só.' },
      ]},
      explanation: 'É a marca branca na camiseta verde, ou sobre uma foto à noite.',
    },
    {
      id: 'DG4-M4-Q2', type: 'multiple_choice',
      prompt: 'Qual versão vai no carimbo da unidade?',
      data: { options: [
        { id: 'a', text: 'A monocromática.', correct: true },
        { id: 'b', text: 'A colorida.', porque: 'O carimbo tem uma tinta só.' },
        { id: 'c', text: 'A negativa.', porque: 'A negativa é para fundo escuro, e o carimbo marca papel claro.' },
        { id: 'd', text: 'Nenhuma; carimbo não leva marca.', porque: 'O carimbo é um dos lugares onde a marca mais aparece.' },
      ]},
      explanation: 'Uma tinta só: a versão de uma cor.',
    },
    {
      id: 'DG4-M4-Q3', type: 'multiple_choice',
      prompt: 'A marca colorida foi posta na camiseta verde-escura e a copa roxa sumiu. O que fazer?',
      data: { options: [
        { id: 'a', text: 'Usar a versão negativa.', correct: true },
        { id: 'b', text: 'Aumentar a marca.', porque: 'Maior, o roxo continua sem contraste com o verde.' },
        { id: 'c', text: 'Trocar o roxo por outra cor qualquer.', porque: 'Cor fora da paleta muda a marca.' },
        { id: 'd', text: 'Pôr a marca mais para o lado.', porque: 'O fundo continua o mesmo verde.' },
      ]},
      explanation: 'O roxo sobre a camiseta dá 1,8:1; a marca em branco dá 12,6:1.',
    },
    {
      id: 'DG4-M4-Q4', type: 'multiple_choice',
      prompt: 'Por que a marca precisa funcionar numa cor só e pequena?',
      data: { options: [
        { id: 'a', text: 'É assim que ela aparece mais vezes.', correct: true },
        { id: 'b', text: 'Para economizar tinta colorida.', porque: 'O motivo é onde ela aparece, não o custo.' },
        { id: 'c', text: 'Porque marca colorida é proibida.', porque: 'A colorida é a versão principal.' },
        { id: 'd', text: 'Porque o examinador não enxerga cor.', porque: 'O teste é sobre o uso real, não sobre o examinador.' },
      ]},
      explanation: 'Carimbo, bordado, cópia em preto e branco e ícone pequeno: poucas cores e pouco espaço.',
    },
    {
      id: 'DG4-M4-Q5', type: 'multiple_choice',
      prompt: 'Para fazer a monocromática, pintaram de preto a marca da prancha original. O que se perdeu?',
      data: { options: [
        { id: 'a', text: 'A versão colorida.', correct: true },
        { id: 'b', text: 'A versão negativa.', porque: 'A negativa ainda nem existia.' },
        { id: 'c', text: 'Nada; dá para pintar de novo.', porque: 'Repintar de cabeça erra as cores exatas.' },
        { id: 'd', text: 'O logotipo.', porque: 'O logotipo continua lá, só que preto.' },
      ]},
      explanation: 'Cada versão vai numa prancha própria: duplica-se antes de recolorir.',
    },
    {
      id: 'DG4-M4-Q6', type: 'true_false',
      prompt: 'A versão monocromática pode ser de outra cor que não o preto.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Uma cor só, qualquer uma que se leia sobre o fundo.' },
      ]},
      explanation: 'O que define a versão é ter uma cor só, e não qual cor.',
    },
    {
      id: 'DG4-M4-Q7', type: 'true_false',
      prompt: 'Amarelo sobre papel branco é uma boa escolha de cor para a marca.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Amarelo sobre branco dá 1,8:1, e a forma quase some.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'A cor da marca precisa de contraste com o fundo em que ela mais aparece.',
    },
  ],

  /* ── Módulo 5 — paleta e tipografia (requisito 4.5) ──────────────────── */
  'm5-teoria': [
    {
      id: 'DG4-M5-Q1', type: 'multiple_choice',
      prompt: 'Por que a paleta guarda o código de cada cor?',
      data: { options: [
        { id: 'a', text: 'Para o roxo ser o mesmo em toda peça.', correct: true },
        { id: 'b', text: 'Porque o programa não aceita nome de cor.', porque: 'O motivo é a consistência, não o programa.' },
        { id: 'c', text: 'Para a cor ficar mais viva.', porque: 'O código não muda a cor; só a fixa.' },
        { id: 'd', text: 'Para esconder a cor de quem não sabe.', porque: 'O código existe para ser compartilhado.' },
      ]},
      explanation: 'Um roxo parecido já é uma marca diferente; o código evita isso.',
    },
    {
      id: 'DG4-M5-Q2', type: 'multiple_choice',
      prompt: 'Qual contraste a cor de texto precisa ter sobre a cor de fundo da paleta?',
      data: { options: [
        { id: 'a', text: '4,5:1 ou mais.', correct: true },
        { id: 'b', text: 'Qualquer um.', porque: 'Abaixo de 4,5:1 o texto corrido fica difícil de ler.' },
        { id: 'c', text: '1,5:1 ou mais.', porque: 'É pouco: o texto some no fundo.' },
        { id: 'd', text: 'Exatamente 1:1.', porque: '1:1 é a mesma cor, e o texto desaparece.' },
      ]},
      explanation: 'É a régua do texto corrido, a mesma da CC-DG001.',
    },
    {
      id: 'DG4-M5-Q3', type: 'multiple_choice',
      prompt: 'Quantas famílias de letra uma identidade costuma usar?',
      data: { options: [
        { id: 'a', text: 'Duas, no máximo.', correct: true },
        { id: 'b', text: 'Uma por peça.', porque: 'Cada peça pareceria de um lugar diferente.' },
        { id: 'c', text: 'Quantas couberem.', porque: 'Muitas famílias desfazem a identidade.' },
        { id: 'd', text: 'Nenhuma; só desenho.', porque: 'Cartaz, aviso e manual precisam de texto.' },
      ]},
      explanation: 'Uma para títulos, muitas vezes a do logotipo, e uma boa de ler para o texto corrido.',
    },
    {
      id: 'DG4-M5-Q4', type: 'multiple_choice',
      prompt: 'O cartaz usou um roxo parecido, mas não o da paleta. O que aconteceu com a marca?',
      data: { options: [
        { id: 'a', text: 'Virou outra marca.', correct: true },
        { id: 'b', text: 'Nada, roxo é roxo.', porque: 'A identidade depende da cor exata.' },
        { id: 'c', text: 'Ficou melhor.', porque: 'Ninguém consegue repetir uma cor que não está escrita.' },
        { id: 'd', text: 'Passou a ser a versão negativa.', porque: 'A negativa é clara sobre escuro, não outro roxo.' },
      ]},
      explanation: 'Uma cor parecida não é a mesma cor; cada peça diferente afasta a marca de si mesma.',
    },
    {
      id: 'DG4-M5-Q5', type: 'multiple_choice',
      prompt: 'Qual família serve melhor ao texto corrido do manual?',
      data: { options: [
        { id: 'a', text: 'Uma serifada ou sem serifa de leitura.', correct: true },
        { id: 'b', text: 'Uma decorativa, para chamar atenção.', porque: 'Decorativa cansa o olho em três linhas.' },
        { id: 'c', text: 'Uma monoespaçada.', porque: 'Monoespaçada se lê aos solavancos num parágrafo.' },
        { id: 'd', text: 'Uma diferente em cada parágrafo.', porque: 'Isso desfaz a tipografia da identidade.' },
      ]},
      explanation: 'Texto corrido pede letra feita para leitura, como Georgia ou Verdana.',
    },
    {
      id: 'DG4-M5-Q6', type: 'true_false',
      prompt: 'Preto e branco podem ser usados mesmo sem estar escritos na paleta.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Eles são as tintas das versões de uma cor.' },
      ]},
      explanation: 'A monocromática em preto e a negativa em branco não pedem cor nova.',
    },
    {
      id: 'DG4-M5-Q7', type: 'true_false',
      prompt: 'Trocar a fonte do logotipo por uma parecida mantém a mesma marca.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O logotipo é o nome escrito numa letra própria; outra letra é outra marca.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'A letra do logotipo é fixa, e trocá-la é um dos usos incorretos do manual.',
    },
  ],

  /* ── Módulo 6 — proteção e mínimo (requisitos 2.4 e 2.5) ─────────────── */
  'm6-teoria': [
    {
      id: 'DG4-M6-Q1', type: 'multiple_choice',
      prompt: 'O que é a área de proteção?',
      data: { options: [
        { id: 'a', text: 'O espaço vazio em volta da assinatura.', correct: true },
        { id: 'b', text: 'Uma moldura desenhada em volta da marca.', porque: 'A área é vazia, e não um desenho a mais.' },
        { id: 'c', text: 'A senha do arquivo da marca.', porque: 'É termo de identidade visual, não de segurança.' },
        { id: 'd', text: 'O tamanho mínimo da marca.', porque: 'O mínimo é a menor largura; a proteção é o espaço em volta.' },
      ]},
      explanation: 'Nada entra nela: nem texto, nem foto, nem a borda da peça.',
    },
    {
      id: 'DG4-M6-Q2', type: 'multiple_choice',
      prompt: 'Por que a área de proteção se mede em fração da altura do símbolo?',
      data: { options: [
        { id: 'a', text: 'Para acompanhar a marca em qualquer tamanho.', correct: true },
        { id: 'b', text: 'Porque o programa não mede centímetros.', porque: 'O motivo é a marca mudar de tamanho.' },
        { id: 'c', text: 'Para ficar sempre do mesmo tamanho.', porque: 'É justamente o contrário: ela cresce com a marca.' },
        { id: 'd', text: 'Porque o símbolo nunca muda de tamanho.', porque: 'Ele muda a cada peça.' },
      ]},
      explanation: 'Meia altura de símbolo é meia altura no crachá e na faixa.',
    },
    {
      id: 'DG4-M6-Q3', type: 'multiple_choice',
      prompt: 'No crachá, o nome da pessoa encostou na marca. O que foi violado?',
      data: { options: [
        { id: 'a', text: 'A área de proteção.', correct: true },
        { id: 'b', text: 'A paleta.', porque: 'As cores continuam as da marca.' },
        { id: 'c', text: 'A tipografia.', porque: 'A letra do logotipo não mudou.' },
        { id: 'd', text: 'Nada; encostar é permitido.', porque: 'Vizinho dentro da área é uso incorreto.' },
      ]},
      explanation: 'A marca se mistura com o vizinho e deixa de ser lida como marca.',
    },
    {
      id: 'DG4-M6-Q4', type: 'multiple_choice',
      prompt: 'O que costuma decidir o tamanho mínimo de uma assinatura?',
      data: { options: [
        { id: 'a', text: 'A letra do logotipo.', correct: true },
        { id: 'b', text: 'A cor do símbolo.', porque: 'A cor não some com o tamanho; a letra sim.' },
        { id: 'c', text: 'O tamanho da prancha.', porque: 'O mínimo é da marca, não de onde ela foi desenhada.' },
        { id: 'd', text: 'O número de cores da paleta.', porque: 'A paleta não muda a legibilidade da letra.' },
      ]},
      explanation: 'A letra some antes da forma: abaixo de 7 pixels, ela vira mancha.',
    },
    {
      id: 'DG4-M6-Q5', type: 'multiple_choice',
      prompt: 'O mínimo medido é 38 pixels. Qual mínimo declarado é honesto?',
      data: { options: [
        { id: 'a', text: '40 pixels.', correct: true },
        { id: 'b', text: '20 pixels.', porque: 'Abaixo do medido, a marca fica ilegível.' },
        { id: 'c', text: '200 pixels.', porque: 'Folgado demais, proíbe a marca no crachá, onde ela cabia.' },
        { id: 'd', text: 'Zero, para usar em qualquer lugar.', porque: 'Toda marca tem um tamanho em que vira mancha.' },
      ]},
      explanation: 'O declarado fica no medido ou pouco acima dele.',
    },
    {
      id: 'DG4-M6-Q6', type: 'true_false',
      prompt: 'A marca pode pousar sobre a cor da camiseta sem invadir a área de proteção.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'O fundo que cobre a área inteira não invade; só o que entra pela metade.' },
      ]},
      explanation: 'Fundo não é vizinho: a marca pousa nele.',
    },
    {
      id: 'DG4-M6-Q7', type: 'true_false',
      prompt: 'Encostar a marca na borda da peça respeita a área de proteção.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'A borda da peça também conta: a marca fica sem respiro.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'A área de proteção precisa caber inteira dentro da peça.',
    },
  ],

  /* ── Módulo 7 — aplicações (requisito 5) ─────────────────────────────── */
  'm7-teoria': [
    {
      id: 'DG4-M7-Q1', type: 'multiple_choice',
      prompt: 'Por que aplicar a marca em peças de naturezas diferentes?',
      data: { options: [
        { id: 'a', text: 'Para ver se ela aguenta o uso real.', correct: true },
        { id: 'b', text: 'Para gastar todas as versões.', porque: 'O objetivo é testar a marca, não usar tudo.' },
        { id: 'c', text: 'Porque três é o número da sorte.', porque: 'O número vem do requisito, e o motivo é testar.' },
        { id: 'd', text: 'Para decorar o manual.', porque: 'As peças mostram a marca funcionando.' },
      ]},
      explanation: 'Tecido escuro, papel pequeno e tela pedem decisões diferentes.',
    },
    {
      id: 'DG4-M7-Q2', type: 'multiple_choice',
      prompt: 'Como a assinatura deve chegar a cada peça?',
      data: { options: [
        { id: 'a', text: 'Copiada e colada.', correct: true },
        { id: 'b', text: 'Redesenhada em cada peça.', porque: 'Redesenhar é como a marca começa a mudar sem ninguém perceber.' },
        { id: 'c', text: 'Descrita em palavras.', porque: 'A peça precisa da marca desenhada.' },
        { id: 'd', text: 'Fotografada da tela.', porque: 'A foto borra e perde as cores exatas.' },
      ]},
      explanation: 'Copiar garante que é a mesma marca, com as mesmas formas e cores.',
    },
    {
      id: 'DG4-M7-Q3', type: 'multiple_choice',
      prompt: 'Como diminuir a marca no crachá sem estragá-la?',
      data: { options: [
        { id: 'a', text: 'Mudar a largura do grupo inteiro.', correct: true },
        { id: 'b', text: 'Puxar só a copa para dentro.', porque: 'Mudar uma forma só estica o símbolo.' },
        { id: 'c', text: 'Diminuir só a letra.', porque: 'Muda a relação entre símbolo e logotipo.' },
        { id: 'd', text: 'Cortar o tronco.', porque: 'A marca fica incompleta.' },
      ]},
      explanation: 'O grupo cresce por igual: a altura, a letra e o traço vão junto.',
    },
    {
      id: 'DG4-M7-Q4', type: 'multiple_choice',
      prompt: 'No post, a marca vai sobre a foto escura do acampamento. Qual versão?',
      data: { options: [
        { id: 'a', text: 'A negativa.', correct: true },
        { id: 'b', text: 'A colorida.', porque: 'O verde e o roxo somem sobre a foto escura.' },
        { id: 'c', text: 'A monocromática em preto.', porque: 'Preto sobre foto escura também não se lê.' },
        { id: 'd', text: 'Nenhuma; post não leva marca.', porque: 'O post é uma das peças mais vistas.' },
      ]},
      explanation: 'Clara sobre escuro: é para isso que a negativa existe.',
    },
    {
      id: 'DG4-M7-Q5', type: 'multiple_choice',
      prompt: 'Qual destas é uma das quatro perguntas antes de entregar uma peça?',
      data: { options: [
        { id: 'a', text: 'A marca está acima do mínimo?', correct: true },
        { id: 'b', text: 'A peça está bonita?', porque: 'Bonita pode falhar em todas as quatro.' },
        { id: 'c', text: 'Gastei pouco tempo?', porque: 'Tempo não diz se a marca foi bem usada.' },
        { id: 'd', text: 'Usei todas as cores?', porque: 'Usar todas as cores não é regra.' },
      ]},
      explanation: 'Se lê, está inteira, tem a área vazia e está acima do mínimo.',
    },
    {
      id: 'DG4-M7-Q6', type: 'true_false',
      prompt: 'A resposta para uma peça que falha costuma estar no manual.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Outra versão, outro lugar ou outro tamanho: o manual diz.' },
      ]},
      explanation: 'É para isso que o manual existe: resolver sem precisar de quem desenhou.',
    },
    {
      id: 'DG4-M7-Q7', type: 'true_false',
      prompt: 'Na camiseta verde-escura, a versão colorida é a melhor escolha.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O roxo e o verde da marca somem no tecido escuro.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Sobre tecido escuro vai a negativa.',
    },
  ],

  /* ── Módulo 8 — manual (requisito 6) ─────────────────────────────────── */
  'm8-teoria': [
    {
      id: 'DG4-M8-Q1', type: 'multiple_choice',
      prompt: 'Para que serve o manual de marca?',
      data: { options: [
        { id: 'a', text: 'Guardar as regras para quem não estava lá.', correct: true },
        { id: 'b', text: 'Mostrar quantas horas a marca levou.', porque: 'O manual diz como usar, não quanto custou.' },
        { id: 'c', text: 'Substituir o arquivo da marca.', porque: 'O arquivo continua sendo necessário.' },
        { id: 'd', text: 'Proibir o uso da marca.', porque: 'Ele mostra como usar direito.' },
      ]},
      explanation: 'É ele que deixa a marca igual quando a diretoria da unidade mudar.',
    },
    {
      id: 'DG4-M8-Q2', type: 'multiple_choice',
      prompt: 'Qual destas páginas faz parte de um manual curto?',
      data: { options: [
        { id: 'a', text: 'Os usos incorretos.', correct: true },
        { id: 'b', text: 'A lista de membros da unidade.', porque: 'O manual é sobre a marca, não sobre as pessoas.' },
        { id: 'c', text: 'O calendário de reuniões.', porque: 'Calendário não é regra de marca.' },
        { id: 'd', text: 'O regulamento do clube.', porque: 'O manual trata só da identidade visual.' },
      ]},
      explanation: 'Versões, cores e letras, proteção e mínimo, e usos incorretos.',
    },
    {
      id: 'DG4-M8-Q3', type: 'multiple_choice',
      prompt: 'O manual mostra três usos incorretos, todos com a marca em vermelho. O que está faltando?',
      data: { options: [
        { id: 'a', text: 'Erros diferentes entre si.', correct: true },
        { id: 'b', text: 'Mais exemplos em vermelho.', porque: 'Mais exemplos do mesmo erro continuam ensinando um só.' },
        { id: 'c', text: 'Nada; são três exemplos.', porque: 'Três vezes o mesmo erro é um erro só.' },
        { id: 'd', text: 'Usos corretos na mesma página.', porque: 'Os corretos têm página própria.' },
      ]},
      explanation: 'Cada exemplo ensina um erro: cor, fundo, letra, esticar, encostar.',
    },
    {
      id: 'DG4-M8-Q4', type: 'multiple_choice',
      prompt: 'Qual destes é um uso incorreto da marca?',
      data: { options: [
        { id: 'a', text: 'Esticar o símbolo para caber no espaço.', correct: true },
        { id: 'b', text: 'Usar a negativa sobre fundo escuro.', porque: 'É o uso certo da negativa.' },
        { id: 'c', text: 'Diminuir pelo grupo, acima do mínimo.', porque: 'É o jeito certo de diminuir.' },
        { id: 'd', text: 'Deixar espaço vazio em volta.', porque: 'É a área de proteção sendo respeitada.' },
      ]},
      explanation: 'Esticar muda a proporção, e a marca deixa de ser a mesma.',
    },
    {
      id: 'DG4-M8-Q5', type: 'multiple_choice',
      prompt: 'Como mostrar melhor a regra "use a negativa sobre fundo escuro"?',
      data: { options: [
        { id: 'a', text: 'Com a negativa desenhada sobre um retângulo escuro.', correct: true },
        { id: 'b', text: 'Só com a frase escrita.', porque: 'Manual se mostra, e não só se escreve.' },
        { id: 'c', text: 'Com uma foto da tela do computador.', porque: 'A foto borra e perde as cores exatas.' },
        { id: 'd', text: 'Com a colorida sobre o escuro.', porque: 'Isso mostra o erro, não a regra.' },
      ]},
      explanation: 'Ver a regra aplicada ao lado da frase é o que faz ela ser entendida.',
    },
    {
      id: 'DG4-M8-Q6', type: 'true_false',
      prompt: 'Num manual, a marca estragada aparece de propósito.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'É a página dos usos incorretos, que ensina o que não fazer.' },
      ]},
      explanation: 'Mostrar o erro desenhado é o jeito mais rápido de ninguém cometê-lo.',
    },
    {
      id: 'DG4-M8-Q7', type: 'true_false',
      prompt: 'Um manual só com texto, sem nenhuma marca desenhada, cumpre o requisito.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O requisito pede os usos ilustrados.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Os usos corretos e os três incorretos precisam estar desenhados.',
    },
  ],

  /* ── Módulo 9 — defesa (requisito 7) ─────────────────────────────────── */
  'm9-teoria': [
    {
      id: 'DG4-M9-Q1', type: 'multiple_choice',
      prompt: 'O que uma boa defesa da marca faz?',
      data: { options: [
        { id: 'a', text: 'Aponta onde cada palavra aparece no desenho.', correct: true },
        { id: 'b', text: 'Diz que a marca ficou bonita.', porque: 'Gosto não se defende; escolha se explica.' },
        { id: 'c', text: 'Conta quanto tempo levou.', porque: 'O tempo não explica as escolhas.' },
        { id: 'd', text: 'Lê o caderno em voz alta.', porque: 'O caderno é para lembrar, e não para ler.' },
      ]},
      explanation: 'A copa redonda é a unidade junta: a defesa aponta para o desenho.',
    },
    {
      id: 'DG4-M9-Q2', type: 'multiple_choice',
      prompt: 'Uma das três palavras não aparece em lugar nenhum da marca. O que isso indica?',
      data: { options: [
        { id: 'a', text: 'A palavra ou o desenho precisa mudar.', correct: true },
        { id: 'b', text: 'Que a marca está pronta.', porque: 'A marca não comunica uma parte do conceito.' },
        { id: 'c', text: 'Que basta não citar essa palavra.', porque: 'Esconder não resolve a falta.' },
        { id: 'd', text: 'Que é preciso escrever a palavra na marca.', porque: 'A palavra guia o desenho, não aparece escrita nele.' },
      ]},
      explanation: 'Conceito e desenho precisam dizer a mesma coisa.',
    },
    {
      id: 'DG4-M9-Q3', type: 'multiple_choice',
      prompt: 'Por que justificar os rascunhos descartados na apresentação?',
      data: { options: [
        { id: 'a', text: 'Mostra que a marca foi escolhida entre várias.', correct: true },
        { id: 'b', text: 'Para pedir desculpas por eles.', porque: 'Descarte não é erro: é parte do caminho.' },
        { id: 'c', text: 'Para mostrar mais desenhos ao examinador.', porque: 'O ponto é o motivo, e não a quantidade.' },
        { id: 'd', text: 'Porque eram melhores que a final.', porque: 'Se fossem, teriam seguido.' },
      ]},
      explanation: 'Cada descarte conta uma decisão, e as decisões são a defesa.',
    },
    {
      id: 'DG4-M9-Q4', type: 'multiple_choice',
      prompt: 'Qual descarte costuma ensinar mais?',
      data: { options: [
        { id: 'a', text: 'O bonito no papel que falhou pequeno.', correct: true },
        { id: 'b', text: 'O pior de todos.', porque: 'O pior costuma falhar por motivo óbvio.' },
        { id: 'c', text: 'O que ficou igual ao escolhido.', porque: 'Igual não teria sido descartado.' },
        { id: 'd', text: 'O que ninguém viu.', porque: 'Ensina se for contado.' },
      ]},
      explanation: 'O bonito que não sobreviveu ao tamanho pequeno mostra o que se aprendeu no caminho.',
    },
    {
      id: 'DG4-M9-Q5', type: 'multiple_choice',
      prompt: 'Como preparar a fala da apresentação?',
      data: { options: [
        { id: 'a', text: 'Ensaiar em voz alta antes.', correct: true },
        { id: 'b', text: 'Decorar o caderno palavra por palavra.', porque: 'Fala decorada trava na primeira pergunta.' },
        { id: 'c', text: 'Improvisar na hora.', porque: 'Sem ensaio, as três palavras costumam ficar de fora.' },
        { id: 'd', text: 'Mandar o texto ao examinador e não falar.', porque: 'O requisito pede apresentar e defender.' },
      ]},
      explanation: 'O caderno lembra o que dizer; o ensaio deixa a fala natural.',
    },
    {
      id: 'DG4-M9-Q6', type: 'true_false',
      prompt: 'Na defesa, dizer o que o descarte tinha de bom também vale.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'O que ele tinha de bom e o que se levou dele contam o caminho.' },
      ]},
      explanation: 'Um descarte pode deixar algo para a marca final.',
    },
    {
      id: 'DG4-M9-Q7', type: 'true_false',
      prompt: 'Repetir na defesa o motivo escrito no caderno conta o que o descarte ensinou.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Repetir o motivo é ler a ficha, e não contar o que se aprendeu.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O motivo diz por que não seguiu; o ensino diz o que ficou.',
    },
  ],
};
