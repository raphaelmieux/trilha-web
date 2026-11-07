import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DA_ESTATISTICA } from './questoesDaEstatistica';
import { telasDoTopico } from './telas';

/*
 * A vereda CC-ES010 Análise Estatística.
 *
 * ── O que ela é ─────────────────────────────────────────────────────────
 * A CC-ES009 ensinou a descrever uma base: média, mediana, grupos, gráficos. O
 * que ela não ensinou foi a **afirmar** — e é disso que esta trata. Duas
 * colunas que sobem juntas, uma reta que resume a nuvem, uma previsão que a
 * reta devolve com a mesma cara de certeza dentro e fora do intervalo
 * observado, e uma diferença entre duas unidades que o acaso alcança sozinho.
 *
 * ── O que carrega esta vereda é o número confiante ──────────────────────
 * A da CC-ES009 era o número plausível. Esta é o número **confiante**: a
 * `PREVISÃO` responde para qualquer idade sem hesitar; o r² sobe quando se
 * exclui um desbravador, e o que subiu pode ser só a aparência de certeza; a
 * diferença entre duas unidades pequenas aparece por sorteio. Nenhuma dessas
 * telas dá erro, e nenhuma delas hesita.
 *
 * ── Por que ela exige a CC-ES009 ────────────────────────────────────────
 * Está no requisito 1. A base é a mesma — os inscritos do acampamento —, e
 * correlação sobre uma base que não se descreveu é conta sobre coluna que
 * ninguém olhou.
 *
 * ── A teoria fala de outra inscrição ────────────────────────────────────
 * As telas fotografam o laboratório sobre as inscrições do Campori de
 * Primavera (`src/exemplos/camporiDePrimavera.ts`), e a prosa cita os números
 * dessa mesma base. Os do acampamento — os r, a reta, as previsões para 13 e
 * 25 anos, o r² antes e depois da exclusão, a Arara contra a Águia — são as
 * respostas das lições, e a teoria que os citasse entregaria o gabarito.
 * `exemplosDaEstatistica.test.ts` confere cada número pelo motor, e reprova
 * se a teoria voltar a citar o acampamento.
 *
 * Os tópicos que ensinam um gesto na planilha o mostram em `telas`; os que
 * ensinam a pensar sobre o número ficam em prosa. Um quadro de texto com uma
 * nuvem desenhada em pontos não mostrava nem uma coisa nem outra.
 */

const V = 'CC-ES010';
const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], atencao: string, marcas: string[],
  telas?: [legenda: string, descricao: string][],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, atencao, marcas,
  ...(telas ? { telas: telasDoTopico(V, id, telas) } : {}),
});

/* ── Módulo 1 — De quem a base fala (requisitos 2.1, 2.2 e 4) ─────────────── */

const POPULACAO_E_AMOSTRA: TopicoDeVereda[] = [
  t(
    'populacao-e-amostra',
    'A conta fala de quem respondeu; a conclusão fala do clube',
    'São duas coisas, e a distância entre elas é onde quase toda conclusão errada nasce.',
    [
      '**População** é o grupo sobre o qual você quer concluir alguma coisa. **Amostra** é quem de fato entrou na conta. Na inscrição do Campori de Primavera, a população é o clube; a amostra são os quarenta e dois que se inscreveram.',
      'A conta sempre fala da amostra. "Entre os inscritos do campori, quem é mais velho é mais alto" é uma afirmação sobre os quarenta e dois, e a planilha a sustenta. "No clube, quem é mais velho é mais alto" é uma afirmação sobre a população — e para ela valer, a amostra precisa parecer com o clube.',
      'O erro mais comum não é calcular errado: é chamar a amostra de população. Ele não dá erro em lugar nenhum, porque a conta está certa. O que muda é de quem ela fala, e isso não aparece em nenhuma célula.',
      'E a base não tem como dizer quantas pessoas ficaram de fora. Ela só conhece quem se inscreveu: quem não foi ao campori não deixou linha nenhuma para contar.',
    ],
    'Quem quiser afirmar algo sobre o clube precisa de outro papel além da base: a lista de membros, para saber quem faltou e se quem faltou tem alguma coisa em comum.',
    ['população', 'amostra'],
  ),
  t(
    'representativa-e-enviesada',
    'Representativa é a que parece com o grupo; enviesada é a que torceu',
    'E "torceu" não quer dizer pequena: uma amostra de dez pode ser melhor que uma de mil.',
    [
      'Amostra **representativa** é a que parece com a população naquilo que importa para a pergunta. Se o clube tem seis unidades e a amostra tem gente das seis, em proporções parecidas, ela representa o clube quanto a unidade.',
      'Amostra **enviesada** é a que torceu: algum grupo entrou demais, ou de menos, por causa de **como** a coleta aconteceu. O viés não é falta de gente — é falta de gente **de um lado só**.',
      'É por isso que tamanho não resolve. Imagine um clube de sessenta membros e duas coletas. Uma sorteia dez nomes da lista de membros e liga para cada um. A outra pergunta no sábado, no salão, e junta quarenta respostas. A primeira é menor e parece com o clube; a segunda é maior e só tem quem estava lá — e quem faltou costuma faltar por um motivo.',
      'Uma coleta que só alcança quem está no grupo de mensagens fica igualmente torcida com mil respostas: ela multiplica as vozes que já estavam ali e continua sem nenhuma das que ficaram fora.',
    ],
    'Viés é do **processo**, e não do número. Olhar o tamanho da amostra para decidir se ela serve é o atalho que faz uma pesquisa grande e torta parecer melhor que uma pequena e honesta.',
    ['representativa', 'enviesada', 'viés'],
  ),
  t(
    'tres-jeitos-de-torcer',
    'Não alcançou, respondeu quem quis, ou a pergunta puxou',
    'Três mecanismos, e saber o nome deles é o que faz alguém reconhecer o viés na pesquisa seguinte.',
    [
      '**Não alcançou todo mundo.** A pergunta não chegou a parte do grupo. Quem não está no grupo de mensagens não respondeu "não" — nunca foi perguntado. Quem ficou de fora não aparece em lugar nenhum da base.',
      '**Respondeu quem se apresentou.** A pergunta chegou a todos e só parte respondeu, e quem respondeu tem algo em comum: estava no salão naquele sábado, ou se interessa pelo assunto. A amostra é quem estava, e não quem é.',
      '**A pergunta puxou a resposta.** Aqui a amostra está inteira e as respostas estão torcidas. "Você concorda que o campori foi o melhor dos últimos anos?" já disse qual é a resposta esperada, e quem tinha dúvida concorda. É o único dos três em que contar mais gente não ajuda nada.',
      'Os três erram calado. A planilha recebe as respostas, calcula tudo, e não há nada nela que diga de onde elas vieram.',
    ],
    'A coleta honesta existe e custa caro: ler a lista de todos os membros, ligar para cada família e registrar a resposta de todas. Quase nenhum clube tem tempo para isso — e é por isso que amostra existe, e por isso que se declara como ela foi feita.',
    ['não alcançou', 'quem se apresentou', 'pergunta que puxa'],
  ),
];

/* ── Módulo 2 — A correlação (requisitos 2.3, 5.1 e 5.2) ──────────────────── */

const A_CORRELACAO: TopicoDeVereda[] = [
  t(
    'a-dispersao',
    'O único gráfico em que os dois eixos são medidas',
    'Cada ponto é uma pessoa, e a nuvem mostra se as duas coisas andam juntas.',
    [
      'No gráfico de colunas, um eixo é categoria e o outro é medida. Na **dispersão**, os dois eixos são medidas: a idade no horizontal, a altura no vertical, e cada desbravador é um ponto. Quarenta e dois inscritos, quarenta e dois pontos.',
      'Para desenhá-la: selecione as duas colunas, a da idade primeiro, vá em Inserir › Gráfico e escolha **Dispersão**. O título e o nome dos eixos não vêm prontos — escreva-os, porque gráfico sem eixo identificado não afirma nada.',
      'A nuvem é a mesma em qualquer ordem da tabela. Classificar a base por idade, por nome ou por unidade não move um único ponto — a posição de cada um sai do dado dele, e não da linha em que ele está. Se o seu desenho muda de forma quando alguém ordena a planilha, ele não é uma dispersão.',
      'O que se lê nela é a **forma** da nuvem: subindo da esquerda para a direita, descendo, ou espalhada sem direção. É a primeira coisa a olhar, antes de calcular qualquer número — e é ela que mostra o ponto que não combina com os outros.',
    ],
    'A primeira coluna selecionada vai no eixo horizontal. Trocar as duas desenha a nuvem espelhada — que responde a outra pergunta com a mesma cara.',
    ['dispersão', 'nuvem de pontos'],
    [
      [
        'Selecione as colunas Idade e Altura, vá em Inserir › Gráfico e escolha Dispersão. A caixa diz o que esse tipo responde; o título e os eixos você escreve.',
        'A caixa Inserir Gráfico aberta sobre a aba Respostas, com as colunas F e G selecionadas, o tipo Dispersão escolhido, o título "Quem é mais velho é mais alto?" e os eixos Idade (anos) e Altura (m) preenchidos.',
      ],
      [
        'Quarenta e dois pontos, um por inscrito. A nuvem sobe da esquerda para a direita — e lá embaixo, sozinho, fica um ponto que não combina com os outros.',
        'O gráfico de dispersão desenhado ao lado da planilha, com os pontos subindo da idade 10 à 15 e um único ponto bem abaixo dos demais, na altura de 1,2 metro.',
      ],
    ],
  ),
  t(
    'o-coeficiente',
    'O r é um número de −1 a 1, e ele resume a nuvem',
    'Sinal diz a direção; tamanho diz o quanto os pontos se aproximam de uma reta.',
    [
      '**Correlação** é o quanto duas medidas andam juntas. O coeficiente de correlação, o **r**, põe isso num número entre −1 e 1. Positivo: quando uma sobe, a outra sobe. Negativo: quando uma sobe, a outra desce. Perto de zero: não andam juntas.',
      'O tamanho diz a força. Acima de 0,7 em módulo é uma relação forte; entre 0,3 e 0,7, moderada; abaixo de 0,3, fraca. No campori, idade e altura dão r = 0,79 — forte, e é o que a nuvem mostra.',
      'Na planilha o r sai de `CORREL`, e ela é **simétrica**: `=CORREL(idade; altura)` e `=CORREL(altura; idade)` devolvem o mesmo número, porque a correlação não tem lado. Isso vai importar no módulo 4, onde as funções da reta **não** são simétricas.',
    ],
    'Calcular é metade do requisito; a outra é interpretar. "r = 0,79" não é uma conclusão — a conclusão é "quem é mais velho tende a ser mais alto, e a tendência é forte".',
    ['correlação', 'coeficiente de correlação', 'r'],
    [
      [
        'Na aba Cálculos, =CORREL(Respostas!F2:F43;Respostas!G2:G43) devolve 0,79: positivo e forte.',
        'A aba Cálculos com a linha "Idade × Altura" e o valor 0,79 na coluna r; a barra de fórmulas mostra a função CORREL com a faixa da idade e a da altura.',
      ],
    ],
  ),
  t(
    'o-que-o-r-nao-diz',
    'r alto não é reta perfeita, e r perto de zero não é "sem relação"',
    'As duas leituras erradas que um número só convida a fazer.',
    [
      'r = 0,79 não quer dizer que os pontos estão **sobre** uma reta: quer dizer que eles se aproximam de uma. Numa nuvem de quarenta e duas pessoas há quem esteja bem longe dela — no campori, um ponto de 1,16 m aos treze anos — e o r não aponta quem.',
      'E r perto de zero não quer dizer "estas duas coisas não têm nada a ver". Quer dizer que elas não andam juntas **em linha reta**. Uma relação em forma de U — sobe e depois desce, como o calor ao longo de um dia inteiro de acampamento, da madrugada fria à noite fria — pode dar r igual a zero com uma relação forte dentro.',
      'Por isso o número nunca substitui a olhada. O r resume a nuvem num algarismo, e todo resumo joga coisa fora: o que ele joga fora é justamente a forma.',
    ],
    'O r mede relação **linear**. É o que ele faz bem, e é tudo o que ele faz: desenhar a dispersão antes de calcular é o que impede de concluir "nada a ver" sobre uma nuvem em forma de U.',
    ['relação linear', 'r perto de zero'],
  ),
];

/* ── Módulo 3 — Correlação não é causa (requisito 3) ──────────────────────── */

const NAO_E_CAUSA: TopicoDeVereda[] = [
  t(
    'tres-explicacoes',
    'O mesmo padrão aceita três histórias, e só uma é "uma causa a outra"',
    'Achar a correlação é fácil. Dizer o que ela significa é o trabalho.',
    [
      'Duas colunas sobem juntas. Isso tem pelo menos três explicações, e o número é o mesmo nas três. **Uma causa a outra**: a idade faz a altura crescer. **A direção é a contrária** da que parece: não é o treino que faz ganhar, é ganhar que animou a treinar. **Uma terceira coisa puxa as duas**, e elas não se tocam.',
      'Há uma quarta, e ela não é sobre as colunas: **o padrão veio de quem respondeu**. Se a coleta alcançou só uma parte do grupo, a relação pode ser daquele pedaço e não do clube — é o módulo 1 voltando.',
      'O r não distingue nenhuma dessas. Ele responde "o quanto andam juntas", e as quatro histórias produzem exatamente a mesma resposta. Escolher entre elas exige olhar para fora do número.',
    ],
    'A pergunta que separa as histórias é sempre a mesma: **o que mais mudaria junto**? Se existe uma terceira coluna que explicaria as duas, ela é a primeira suspeita — e não a última.',
    ['causalidade', 'correlação espúria'],
  ),
  t(
    'a-espuria-desta-base',
    'A altura não leva ninguém ao campori: a idade leva as duas',
    'E é um exemplo de verdade, de uma base do clube — não um caso inventado.',
    [
      'Calcule os três pares de medidas da inscrição lado a lado. Dois têm direção defensável: a idade explica a altura (r = 0,79), e quem tem mais idade tem mais anos de clube e foi a mais acampamentos (r = 0,73).',
      'O terceiro é altura × acampamentos, com r = 0,61, e nenhuma das duas mexe na outra. Quem é mais alto não é convidado mais vezes, e dormir numa barraca não faz crescer. As duas sobem juntas porque as duas sobem com a **idade** — que está na mesma tabela, na coluna ao lado.',
      'Esse par é o que se chama **correlação espúria**: o número existe, foi medido certo, e a relação entre as duas colunas não existe. "Espúria" não quer dizer que a conta está errada — quer dizer que a conclusão que ela sugere está.',
    ],
    'A terceira coluna quase sempre está na própria base. Procurá-la ali é o primeiro passo, e é mais rápido do que discutir a história: se existe uma coluna que tem correlação forte com as duas, a suspeita de espúria é séria.',
    ['espúria', 'terceira variável'],
    [
      [
        'Os três r da inscrição, um embaixo do outro: 0,79, 0,73 e 0,61. O de baixo é o par em que nenhuma coluna mexe na outra.',
        'A aba Cálculos com as linhas Idade × Altura, Idade × Acampamentos e Altura × Acampamentos e os valores 0,79, 0,73 e 0,61; a barra de fórmulas mostra a CORREL da altura com os acampamentos.',
      ],
    ],
  ),
  t(
    'como-se-testa',
    'A relação sobrevive dentro de quem tem a mesma idade?',
    'O teste que separa "uma causa a outra" de "as duas sobem com uma terceira".',
    [
      'Se altura e acampamentos sobem juntas só porque as duas sobem com a idade, então **dentro de um grupo de mesma idade** a relação deve desaparecer: entre os doze inscritos de treze anos do campori, ser mais alto não deveria dar mais acampamentos.',
      'Esse é o teste, e ele não exige estatística nova: é olhar a mesma correlação dentro de um pedaço da base em que a terceira coluna não varia. Se ela continua forte, a terceira coluna não era a explicação. Se ela desaparece, era.',
      'Não há como fazer isso sem **ter** a terceira coluna. É por aí que a resposta honesta muitas vezes é "esta base não decide": se a coisa que explicaria as duas não foi coletada, nenhuma conta aqui a traz de volta.',
    ],
    'Com quarenta e dois inscritos e seis idades, cada grupo fica com poucas pessoas — e correlação em grupo pequeno é quase toda sorteio, que é o assunto do módulo 9. O teste aponta a direção; ele não fecha a questão sozinho.',
    ['controlar a terceira variável', 'esta base não decide'],
  ),
];

/* ── Módulo 4 — A reta (requisitos 2.4, 2.5 e 5.3) ────────────────────────── */

const A_RETA: TopicoDeVereda[] = [
  t(
    'quem-explica-quem',
    'Uma das duas explica a outra, e a pergunta tem resposta nos dois sentidos',
    'A que explica é a independente; a que é explicada, a dependente.',
    [
      'Variável **independente** é a que você usa para explicar; **dependente** é a que você quer explicar. Na inscrição a idade explica a altura: criança mais velha é mais alta. O contrário é absurdo — ninguém fica mais velho por ter crescido.',
      'O jeito de decidir é fazer a pergunta nos dois sentidos e ouvir qual soa absurda. "A idade muda a altura?" soa certo. "A altura muda a idade?" não soa. Idade e acampamentos também têm direção clara: mais anos de clube, mais acampamentos. Altura e acampamentos não têm nenhuma — é a espúria do módulo 3.',
      'Isso não é formalidade: a reta recebe as duas colunas em ordem, e a ordem decide qual conta sai. Escrever ao contrário devolve a reta de x sobre y, que é outro número com a mesma cara de certo.',
    ],
    'Direção clara é condição para **explicar**, e não para calcular. A planilha desenha a reta do par espúrio sem reclamar, e ela resume a nuvem corretamente — o que ela não faz é dizer que uma coisa mexe na outra.',
    ['variável dependente', 'variável independente'],
  ),
  t(
    'a-linha-de-tendencia',
    'A reta passa o mais perto possível de todos ao mesmo tempo',
    'E não passa por cima de nenhum ponto. É isso que a torna útil.',
    [
      '**Regressão linear** é achar a reta que resume a nuvem: aquela que fica, no conjunto, o mais perto possível de todos os pontos. Na planilha ela aparece como **linha de tendência** no gráfico de dispersão.',
      'Ela não passa por cima dos pontos, e quem espera isso lê o desenho errado. Passar por todos exigiria que os pontos estivessem alinhados, o que dado de gente nunca está. A reta é um resumo, e todo resumo joga coisa fora.',
      'No programa ela é um **elemento do gráfico**: com o gráfico na tela, em Elementos do Gráfico, marque Linha de Tendência. A equação é outra caixa, logo abaixo — dá para ver a reta e nunca ler a conta dela, que é o que quase todo mundo faz.',
    ],
    'A equação escrita no gráfico vem arredondada a uma casa: no campori ela diz y = 0,1x + 0,7. Para fazer contas com ela, os números inteiros saem das funções, no módulo seguinte.',
    ['regressão linear', 'linha de tendência'],
    [
      [
        'No próprio gráfico, em Elementos do Gráfico, marque Linha de Tendência: a reta tracejada aparece passando pelo meio da nuvem.',
        'O gráfico de dispersão Idade × Altura com a caixa Linha de Tendência marcada e uma reta tracejada atravessando os pontos; a caixa Exibir Equação no gráfico continua desmarcada.',
      ],
      [
        'A segunda caixa, Exibir Equação no gráfico, escreve a conta da reta em cima dela, arredondada a uma casa: y = 0,1x + 0,7.',
        'O mesmo gráfico com as duas caixas marcadas, e a equação y = 0,1x + 0,7 escrita perto da ponta direita da reta.',
      ],
    ],
  ),
  t(
    'a-equacao-e-a-ordem',
    'Dois números descrevem a reta, e as funções recebem o y primeiro',
    'A inclinação diz quanto a altura sobe por ano; a intercepção, onde a reta corta o eixo.',
    [
      'A reta se escreve como altura = inclinação × idade + intercepção. No campori a inclinação é 0,07 metro por ano de idade — uns sete centímetros — e a intercepção é 0,70. É a equação, e é ela que deixa prever sem medir o gráfico com a régua.',
      'A intercepção costuma não querer dizer nada sozinha: 0,70 metro seria a altura de alguém de zero ano segundo esta reta, e não há ninguém de zero ano na base. Ela é a peça que posiciona a reta, e não uma previsão.',
      '`INCLINAÇÃO` e `INTERCEPÇÃO` recebem **o y primeiro**: a coluna explicada, e depois a que explica. Isso é do programa, e é a armadilha: quem escreve `=INCLINAÇÃO(idades; alturas)` pensando "a idade explica a altura" recebe a inclinação de idade sobre altura, que é outra reta, sem erro nenhum.',
    ],
    'CORREL é simétrica e estas não são. Trocar a ordem devolve um número plausível sobre a pergunta invertida — e a planilha não tem como saber qual você queria.',
    ['inclinação', 'intercepção', 'equação da reta'],
    [
      [
        '=INCLINAÇÃO(Respostas!G2:G43;Respostas!F2:F43) — a altura primeiro, a idade depois — devolve 0,07: uns sete centímetros por ano. A intercepção, com a mesma ordem, dá 0,70.',
        'A aba Cálculos com as linhas "Inclinação da reta" e "Onde ela corta o eixo" e os valores 0,07 e 0,70; a barra de fórmulas mostra a INCLINAÇÃO com a faixa da altura antes da faixa da idade.',
      ],
    ],
  ),
];

/* ── Módulo 5 — Prever, e o risco de extrapolar (requisito 5.4) ───────────── */

const PREVER: TopicoDeVereda[] = [
  t(
    'prever-com-a-equacao',
    'Com a equação, dá para estimar um valor que ninguém mediu',
    'E é para isso que ela serve: a reta responde para qualquer idade que você perguntar.',
    [
      'A equação aceita qualquer x. Para doze anos, a planilha responde 1,49 m. Há inscritos de doze anos no campori, e a conta diz: a altura **típica** nessa idade é essa.',
      'Na planilha isso é `PREVISÃO(x; conhecidos_y; conhecidos_x)` — e repare na ordem: o x primeiro, depois a coluna explicada, depois a que explica. É diferente da ordem de `INCLINAÇÃO`, e o programa não avisa.',
      'A previsão é uma estimativa, e não uma medida. 1,49 m não é a altura de ninguém em particular: é o centro da faixa onde a reta espera encontrar os de doze anos.',
    ],
    'A previsão sai do mesmo motor que a reta. Ela é a reta avaliada num ponto, e não uma segunda conta: se a reta estiver errada, a previsão herda o erro inteiro.',
    ['previsão', 'estimar'],
    [
      [
        '=PREVISÃO(12;Respostas!G2:G43;Respostas!F2:F43): o x primeiro, depois a altura, depois a idade. A reta responde 1,49 m.',
        'A aba Cálculos com a linha "Previsão para 12 anos" e o valor 1,49; a barra de fórmulas mostra a PREVISÃO com o 12 antes das duas faixas.',
      ],
    ],
  ),
  t(
    'extrapolar',
    'Fora do intervalo observado a reta continua respondendo, e deixa de valer',
    'Ela não hesita, não avisa, e dá um número com a mesma cara dos outros.',
    [
      'No campori ninguém tem menos de dez nem mais de quinze anos. Perguntar a altura de alguém de vinte e dois é **extrapolar**: sair da faixa onde há dado. A reta responde 2,15 m — mais alto que quase todo jogador de basquete.',
      'Esse é o caso fácil, porque o absurdo se vê. O caso difícil é dezesseis anos: a reta responde 1,75 m, que é alto e possível, e quem a visse concluiria que ela funciona fora do intervalo. Não funciona: ela só não foi longe o bastante para se delatar.',
      'O motivo é que a reta não sabe de biologia. Ela foi ajustada a seis idades de criança e aprendeu "uns sete centímetros por ano". Nada nela diz que as pessoas param de crescer, porque na base ninguém parou.',
    ],
    'Quem recebe uma previsão precisa receber junto o intervalo em que os dados estão. Sem isso, qualquer número vira resposta, e a reta nunca se recusa a dar um.',
    ['extrapolação', 'intervalo observado'],
    [
      [
        'Para 22 anos, a mesma fórmula responde 2,15 m, com a mesma cara do 1,49 logo acima. Ninguém no campori tem mais de quinze.',
        'A aba Cálculos com as previsões para 12 e para 22 anos, 1,49 e 2,15; a barra de fórmulas mostra a PREVISÃO com o 22.',
      ],
    ],
  ),
];

/* ── Módulo 6 — A qualidade do ajuste (requisito 5.5) ─────────────────────── */

const O_AJUSTE: TopicoDeVereda[] = [
  t(
    'o-r-quadrado',
    'O r² diz quanto da variação a reta explica',
    'É o r elevado ao quadrado, e ele se lê como proporção.',
    [
      'O **r²** é o quadrado do coeficiente de correlação, e ele responde: de toda a variação da coluna explicada, quanto a reta dá conta? Para idade e altura o r é 0,79 e o r² é 0,62 — a reta explica uns três quintos da variação da altura, e sobra bastante.',
      'Ele vai de 0 a 1 e não tem sinal: elevar ao quadrado apaga a direção. Por isso ele não substitui o r — diz o quanto, e não para onde.',
      'Na planilha é `RQUAD`, e ela recebe o y primeiro, como `INCLINAÇÃO`. Como é o quadrado do r, trocar a ordem aqui não muda o número. Continua sendo bom hábito escrever na ordem certa, que é a das outras funções da reta.',
      'Nos três pares do campori o ajuste cai de 0,62 para 0,53 e para 0,37. No último a nuvem é larga, e a reta passa pelo meio de muita coisa que ela não explica.',
    ],
    'r² alto não quer dizer que a conclusão está certa — quer dizer que a reta resume bem **aquela** nuvem. O par espúrio tem r² de 0,37 e ainda assim nenhuma das duas colunas mexe na outra.',
    ['r²', 'qualidade do ajuste'],
    [
      [
        '=RQUAD com a coluna explicada primeiro, um par por linha: 0,62, 0,53 e 0,37. O menor é o par em que a reta menos dá conta.',
        'A aba Cálculos com as linhas dos três pares e os valores 0,62, 0,53 e 0,37 na coluna r²; a barra de fórmulas mostra a RQUAD dos acampamentos com a altura.',
      ],
    ],
  ),
  t(
    'quando-a-reta-nao-serve',
    'Dois jeitos de a reta não representar: nuvem larga e forma errada',
    'E o número avisa do primeiro, não do segundo.',
    [
      'O primeiro jeito é a **nuvem larga**: os pontos se espalham longe da reta, o r² é baixo, e o resumo diz pouco. Aqui o número avisa — 0,37 é um aviso.',
      'O segundo é a **forma errada**: a nuvem tem padrão, e o padrão não é reto. Uma nuvem em U pode ter r² perto de zero com uma relação forte dentro, e nesse caso o número avisa pelo motivo errado: ele diz que os pontos estão longe da reta, e não que uma reta era o resumo errado. Pior: há curvas em que o r² sai alto e a reta ainda assim descreve mal os extremos.',
      'Por isso os dois se olham juntos: o r² e o desenho. O número diz o quanto os pontos se afastam da reta; só o desenho diz se uma reta era o resumo certo.',
    ],
    'Nenhuma destas duas telas dá erro. A reta se desenha sobre qualquer nuvem, a conta sai, e o que decide se ela representa os dados é a olhada — que é a metade que o número não faz.',
    ['nuvem larga', 'forma errada'],
  ),
];

/* ── Módulo 7 — A regressão em dado próprio (requisito 6) ─────────────────── */

const DADO_PROPRIO: TopicoDeVereda[] = [
  t(
    'escolher-o-que-olhar',
    'Agora é você que decide qual relação olhar',
    'A mecânica já foi medida. O que se mede aqui é o que você diz sobre o número.',
    [
      'Os módulos anteriores apontaram os pares. Este pede o contrário: escolher duas colunas da base, calcular o r delas, e escrever o que esse número sugere. Nenhuma das quatro colunas de medida — idade, altura, acampamentos e diárias — é errada, e nenhuma vem com resposta pronta.',
      'Escolher um par que as lições não usaram é a ideia. No campori, idade e diárias dão r = 0,02: as duas não andam juntas. É uma resposta tão boa quanto um r alto — o que ela não é, é prova de que as duas nunca terão nada a ver.',
      'E a escolha muda o trabalho: não há gabarito para "o que a relação sugere", então o que se cobra é que a frase fale do par que você escolheu, com o número que você calculou.',
    ],
    'Relação fraca não é relação ausente, e não é relação errada. Dizer "o r deu 0,02, então neste campori as duas não andam juntas" é uma conclusão completa — e mais honesta que esticar um número pequeno.',
    ['dado próprio', 'relação fraca'],
    [
      [
        'Um par que nenhuma lição usa: =CORREL da idade com as diárias dá 0,02. As duas colunas não andam juntas.',
        'A aba Cálculos com a linha "O par que eu escolhi" e o valor 0,02; a barra de fórmulas mostra a CORREL da faixa da idade com a das diárias.',
      ],
    ],
  ),
  t(
    'as-tres-perguntas',
    'O que sugere, que outra história cabe, e que dado decidiria',
    'As três juntas são a diferença entre calcular e analisar.',
    [
      '**O que a relação sugere.** Em palavras, com o número: as duas andam juntas ou em sentidos contrários, e o quanto. É a interpretação, e ela é sobre as duas colunas que você escolheu. No campori, acampamentos e diárias dão r = 0,09: quem já acampou muito não fica, por isso, mais noites.',
      '**Que outra explicação cabe no mesmo padrão.** É o módulo 3 virando hábito: pensar numa terceira coisa que puxaria as duas, ou numa direção invertida, ou em algo de quem respondeu. Talvez as diárias dependam de quem leva a família de carro, e isso esconda uma relação que existe entre os que vão de ônibus.',
      '**Que dado a mais decidiria entre as duas.** Duas explicações para o mesmo padrão não se resolvem discutindo: resolvem-se medindo mais uma coisa. Aqui, como cada família chegou ao campori. A inscrição não tem essa coluna — e aí a resposta honesta é que esta base não decide.',
    ],
    'As três são uma só análise. A primeira sem as outras duas é a conclusão apressada que esta vereda inteira existe para evitar.',
    ['o que sugere', 'outra explicação', 'dado que decidiria'],
  ),
];

/* ── Módulo 8 — Refazer sem os atípicos (requisito 7) ─────────────────────── */

const SEM_OS_ATIPICOS: TopicoDeVereda[] = [
  t(
    'excluir-sem-apagar',
    'O filtro esconde a linha e não a tira da conta',
    'Excluir de verdade numa planilha é uma coluna auxiliar, e não um apagar.',
    [
      'O primeiro jeito que todo mundo tenta é o filtro. Ele esconde a linha da tela e **não** a tira do cálculo: a inclinação não se move um décimo. É a mesma coisa que a `SOMA` faz na CC-ES003 — a linha escondida continua lá.',
      'O segundo jeito é apagar a linha, e ele é pior: destrói o dado. A comparação que o requisito pede é entre **duas leituras da mesma base**, e com a linha apagada já não há a primeira leitura para comparar.',
      'O jeito que funciona é a **coluna auxiliar**: numa coluna livre ao lado, copiar a coluna que interessa — `=G2`, `=G3` e assim por diante — e deixar vazia a célula da linha a excluir. Depois as funções leem a coluna nova, e o dado original continua intacto. Você só esvazia um dos dois lados: o par cai inteiro quando falta um número de qualquer um deles.',
    ],
    'A coluna auxiliar não mexe no dado, e isso não é detalhe: as duas contas de "sem o atípico" são conferidas contra a base como ela chegou. Apagar a linha e usar a faixa inteira devolve o número certo com a fórmula errada.',
    ['coluna auxiliar', 'filtro não exclui'],
    [
      [
        'Filtro na Idade, só os de 14 anos à vista — e na aba Cálculos a inclinação com todos continua 0,07. A linha escondida continua na conta.',
        'A aba Cálculos com a linha "Inclinação com todos" valendo 0,07 enquanto a aba Respostas está filtrada; a barra de fórmulas mostra a INCLINAÇÃO sobre as faixas inteiras.',
      ],
      [
        'A coluna auxiliar L copia a altura linha a linha e deixa vazia a linha 19, a do Samuel Teixeira: 1,16 m, que é o 1,61 com os algarismos trocados.',
        'A aba Respostas com a coluna L repetindo as alturas da coluna G, a célula L19 selecionada e vazia ao lado do 1,16 da linha 19, e as linhas 18 e 20 copiadas normalmente.',
      ],
    ],
  ),
  t(
    'o-que-a-exclusao-faz',
    'A conclusão quase não muda, e o ajuste salta',
    'É o resultado da inscrição do campori, e é o que torna a exclusão perigosa.',
    [
      'A inscrição tem um valor atípico na altura: 1,16 m, de um desbravador de treze anos. Tirando-o, a reta passa a dizer 6,9 centímetros por ano em vez de 6,6. A conclusão é praticamente a mesma.',
      'O que muda é o **r²**: de 0,62 para 0,86. Uma pessoa em quarenta e duas mudou a aparência de certeza da reta inteira. Quem apresentasse só o segundo número estaria escondendo que ele saiu de quarenta e uma.',
      'Aqui o motivo da exclusão é bom: 1,16 é o 1,61 digitado ao contrário, e a camiseta G que ele pediu diz isso. Mesmo assim ela se **relata**, e não se faz calada. Num atípico que é gente de verdade — alguém que de fato é muito mais baixo —, o mesmo salto seria certeza comprada com a exclusão de uma pessoa, e a pessoa que saiu da conta continua sendo do clube.',
    ],
    'Um valor em quarenta e dois mal move a reta e melhora o ajuste em vinte e quatro pontos. Nenhum desses dois números dá erro, e o segundo é o que alguém levaria para a reunião.',
    ['valor atípico', 'r² inflado'],
    [
      [
        'Com a faixa L no lugar da G, a inclinação sem o atípico continua 0,07 — e o r² salta de 0,62 para 0,86.',
        'A aba Cálculos com as quatro linhas da comparação: inclinação com todos 0,07, sem o atípico 0,07, r² com todos 0,62 e sem o atípico 0,86; a barra de fórmulas mostra a RQUAD lendo a coluna L.',
      ],
    ],
  ),
];

/* ── Módulo 9 — O acaso entre dois grupos (requisito 8) ───────────────────── */

const O_ACASO: TopicoDeVereda[] = [
  t(
    'a-incerteza',
    'Incerteza é o quanto a sua conclusão mudaria se a coleta fosse repetida',
    'E ela existe mesmo quando toda conta está certa.',
    [
      '**Incerteza** não é erro. Erro é conta errada; incerteza é o quanto o resultado depende de **quem** caiu na amostra. Se o clube respondesse de novo, com as mesmas perguntas e outras pessoas presentes, os números sairiam diferentes — e a diferença entre eles é a incerteza.',
      'Ela encolhe com o tamanho do grupo e nunca chega a zero. No campori a Arara tem seis inscritos e o Jaguar cinco: trocar duas pessoas de lado já muda a média de cada uma. Entre duas unidades de trinta, quase nada se moveria.',
      'Declarar a incerteza é parte do resultado. Um número apresentado sem ela parece exato, e o que a plateia ouve é "é isto", quando o que havia era "é por aí".',
    ],
    'Incerteza não se conserta refazendo a conta. Ela se reduz coletando de mais gente, repetindo a coleta, ou decidindo antes o que comparar — e se declara quando não se pode reduzir.',
    ['incerteza'],
  ),
  t(
    'o-embaralho',
    'Embaralhar os rótulos mostra o que o acaso alcança sozinho',
    'Nenhum dado muda: só quem é de qual unidade é sorteado de novo.',
    [
      'No campori, o Jaguar tem média de 5,60 acampamentos e a Arara de 2,50: uma diferença de 3,10. Parece grande. A pergunta é: o acaso alcançaria uma diferença desse tamanho sozinho?',
      'O jeito de ver isso sem cálculo nenhum é **embaralhar os rótulos**. Pega-se a mesma lista de medidas e sorteia-se de novo quem é Arara e quem é Jaguar, mantendo seis e cinco pessoas. Nada nos números mudou — só quem está de qual lado. Então calcula-se a diferença outra vez.',
      'Fazendo isso muitas vezes, aparece uma frequência. Entre a Arara e o Jaguar, uma diferença tão grande quanto a real aparece **cerca de uma vez em dez**, sem que um único dado tenha mudado. Quem viu isso acontecer não precisa de mais nada para desconfiar da diferença entre dois grupos de cinco e seis pessoas.',
    ],
    'Uma leva só não é frequência: ver um embaralho chegar na diferença real diz tanto quanto ver um não chegar. O que se lê é a proporção, e proporção precisa de muitos — é por isso que o botão sorteia vinte e cinco de uma vez, e se aperta mais de uma vez.',
    ['embaralhar os rótulos', 'frequência'],
    [
      [
        'Arara e Jaguar no caderno da análise: cada clique sorteia vinte e cinco vezes quem é de qual unidade, e a tela conta quantos sorteios chegaram à diferença de verdade, 3,10.',
        'O cartão "Arara e Jaguar, com os rótulos embaralhados" com o botão Embaralhar 25 vezes, a diferença de verdade de 3,10 acampamentos, quantos dos cinquenta embaralhos chegaram a ela e as últimas diferenças sorteadas.',
      ],
    ],
  ),
  t(
    'o-que-o-numero-nao-diz',
    'Uma vez em dez é a frequência do sorteio, e não a chance de o Jaguar ser melhor',
    'É o erro mais comum que existe com este tipo de número.',
    [
      'O resultado do embaralho responde a uma pergunta bem específica: **com que frequência o acaso alcança uma diferença deste tamanho**. Ele não diz a chance de uma unidade ser melhor que a outra, e não diz que foi o acaso que produziu a diferença observada.',
      'Pode ter sido o acaso, e pode não ter sido. O que se perdeu foi o **direito de afirmar** — e não a diferença, que existe e foi medida. Negar o número medido é o oposto de desconfiar da conclusão tirada dele.',
      'São três as leituras erradas, e todas são frases que gente formada diz. "Foi o acaso que produziu a diferença" confunde *consegue* com *foi*. "Há 10% de chance de o Jaguar ser mais experiente" troca o sujeito: a frequência é do sorteio, e não das unidades. "A diferença de 3,10 não existe" nega o que foi medido.',
    ],
    'Quem troca o sujeito da frequência sai do cálculo mais confiante do que entrou, que é a pior coisa que uma conta pode fazer com alguém. A diferença entre a leitura certa e as erradas não está no número: está em de quem o número fala — que é o mesmo cuidado do módulo 1.',
    ['frequência do sorteio', 'direito de afirmar'],
  ),
  t(
    'tres-providencias',
    'Mais gente, repetir a coleta, e decidir antes o que comparar',
    'Três coisas que aumentam a confiança — e quatro que só parecem aumentar.',
    [
      '**Coletar de mais gente em cada grupo.** A diferença entre dois grupos de cinco é quase toda sorteio. Entre dois de trinta, o embaralho quase nunca alcança a diferença real.',
      '**Repetir a coleta noutra ocasião.** O acaso não repete o mesmo resultado de propósito. Uma diferença que reaparece numa segunda coleta é uma diferença que não era do dia.',
      '**Decidir antes o que comparar.** Escolher o par depois de ver qual deu a maior diferença é achar o acaso de propósito: entre seis unidades há quinze pares, e alguma dupla vai ter diferença grande por sorteio.',
      'E as que não aumentam: tirar quem está fora da conta (sobe o r², não o acerto), comparar mais pares até um ficar claro (procurar até achar é achar acaso), refazer a aritmética (confere uma conta que já estava certa) e escrever o resultado com mais casas decimais (precisão não é confiança). Nenhuma é bobagem — todas são coisas que se fazem de boa fé achando que ajudam.',
    ],
    'Refazer a conta é certo e não é isto: ela já estava certa. O que está em dúvida não é se a média do Jaguar é 5,60 — é se 5,60 contra 2,50 diz algo sobre as duas unidades.',
    ['providências', 'aumentar a confiança'],
  ),
];

/* ── Módulo 10 — O grau de confiança (requisito 9) ────────────────────────── */

const O_GRAU: TopicoDeVereda[] = [
  t(
    'a-analise-completa',
    'A análise completa inclui o que limita a conclusão',
    'Toda apresentação de dados do mundo abre com o que sustenta e deixa os limites para a pergunta que talvez não venha.',
    [
      'Apresentar a análise não é apresentar os resultados favoráveis. É pôr na mesa tudo o que você descobriu — os números que sustentam a conclusão e os que a limitam —, e a segunda metade é a que quase ninguém traz.',
      'No campori, o que sustenta é concreto: o r entre idade e altura é 0,79, a direção é clara, e a inclinação quase não se move quando se tira o valor atípico. O que limita também: só entrou quem se inscreveu, altura e acampamentos formam um par espúrio, a reta prevê 2,15 m aos vinte e dois anos, o r² salta de 0,62 para 0,86 com uma pessoa a menos, e a diferença entre a Arara e o Jaguar aparece por sorteio cerca de uma vez em dez.',
      'O achado mais difícil de classificar é o r² que subiu: a leitura natural é que a análise melhorou, e ele **limita** — o que subiu foi a confiança aparente. Repare que o mesmo módulo deu os dois lados: a inclinação parada sustenta, e o r² que salta limita.',
    ],
    'Um resultado pode ter os dois lados. A reta não depender de uma pessoa sustenta; o r² subir ao tirá-la limita — e as duas coisas saíram da mesma comparação.',
    ['análise completa', 'o que limita'],
  ),
  t(
    'declarar-o-grau',
    'Dizer de quanto você confia, antes de alguém perguntar',
    'E dois dos quatro graus uma análise como esta não sustenta.',
    [
      'O requisito pede declarar **expressamente** o grau de confiança, e as razões dessa avaliação. Não é o examinador que decide: é você que diz, e depois defende.',
      '**Alta** diz: decida com base nisto, sem olhar mais nada — e para isso nenhum dos seus achados poderia estar limitando a conclusão. **Nenhuma** diz: isto não mostra nada — e para isso nenhum achado poderia estar sustentando, e aí não haveria o que apresentar.',
      'Entre **média** e **baixa** a escolha é sua. Média diz que a conclusão vale e tem limites que você sabe nomear, e é o grau que obriga a apresentar os dois lados. Baixa diz que isto serve para levantar a pergunta, e não para decidir: espere mais dados antes de agir.',
    ],
    'O grau sozinho é uma palavra. As razões são o que a liderança vai ouvir, e elas saem dos seus achados — com os números deles.',
    ['grau de confiança', 'declarar expressamente'],
  ),
];

/* ── Os módulos ──────────────────────────────────────────────────────────── */

/*
 * Os dez módulos, na ordem dos requisitos.
 *
 * Cada um tem uma lição de teoria e um laboratório, e o laboratório é `tipo:
 * 'estatistica'` — o tipo próprio desta vereda, que abre a mesma janela do
 * Excel e o mesmo caderno da CC-ES009 com outras metas.
 */
export const MODULOS_DA_ESTATISTICA: ModuloDeVereda[] = [
  {
    id: 'm1',
    titulo: 'De quem a base fala',
    resumo: 'População e amostra, representativa e enviesada — e os três jeitos de uma coleta torcer, um deles o nosso.',
    licoes: [
      {
        id: 'm1-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_ESTATISTICA['m1-teoria'],
        perguntas: 4,
        titulo: 'A conta fala de quem respondeu',
        resumo: 'E a conclusão fala do clube. A distância entre as duas é onde quase tudo dá errado.',
        topicos: POPULACAO_E_AMOSTRA,
      },
      {
        id: 'm1-lab', tipo: 'estatistica', licao: 'amostra',
        titulo: 'Classificando quatro coletas, inclusive a nossa',
        resumo: 'Três torceram a amostra por mecanismos diferentes, e uma não torceu.',
        verificacoes: ['a-populacao', 'toda-coleta-classificada', 'classificacao-certa'],
      },
    ],
  },
  {
    id: 'm2',
    titulo: 'A correlação',
    resumo: 'A dispersão, o coeficiente, e as duas leituras erradas que um número só convida a fazer.',
    licoes: [
      {
        id: 'm2-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_ESTATISTICA['m2-teoria'],
        perguntas: 4,
        titulo: 'Duas medidas, uma nuvem, um número',
        resumo: 'De −1 a 1, e o que ele diz — mais o que ele não diz.',
        topicos: A_CORRELACAO,
      },
      {
        id: 'm2-lab', tipo: 'estatistica', licao: 'correlacao',
        titulo: 'Desenhando a dispersão e calculando o r',
        resumo: 'E dizendo em palavras o que o número está dizendo.',
        verificacoes: ['a-dispersao', 'o-coeficiente', 'interpretou-o-valor'],
      },
    ],
  },
  {
    id: 'm3',
    titulo: 'Correlação não é causa',
    resumo: 'Três histórias para o mesmo número, e a espúria que mora nesta base.',
    licoes: [
      {
        id: 'm3-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_ESTATISTICA['m3-teoria'],
        perguntas: 4,
        titulo: 'O mesmo padrão, três explicações',
        resumo: 'E a terceira coluna quase sempre está na própria tabela.',
        topicos: NAO_E_CAUSA,
      },
      {
        id: 'm3-lab', tipo: 'estatistica', licao: 'espuria',
        titulo: 'Achando o par em que nada mexe em nada',
        resumo: 'Os três r lado a lado, e a coluna que explica dois deles.',
        verificacoes: ['as-tres-correlacoes', 'achou-a-espuria', 'nomeou-a-escondida'],
      },
    ],
  },
  {
    id: 'm4',
    titulo: 'A reta',
    resumo: 'Quem explica quem, a linha que resume a nuvem, e a equação — que recebe o y primeiro.',
    licoes: [
      {
        id: 'm4-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_ESTATISTICA['m4-teoria'],
        perguntas: 4,
        titulo: 'A reta que resume a nuvem',
        resumo: 'Ela não passa por cima de nenhum ponto, e é isso que a torna útil.',
        topicos: A_RETA,
      },
      {
        id: 'm4-lab', tipo: 'estatistica', licao: 'reta',
        titulo: 'Traçando a tendência e obtendo a equação',
        resumo: 'Duas caixas separadas, porque ver a reta e saber a conta dela são duas coisas.',
        verificacoes: ['qual-eixo-e-qual', 'a-linha-de-tendencia', 'a-equacao'],
      },
    ],
  },
  {
    id: 'm5',
    titulo: 'Prever, e o risco de extrapolar',
    resumo: 'A reta responde para qualquer idade — inclusive para as que ninguém mediu.',
    licoes: [
      {
        id: 'm5-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_ESTATISTICA['m5-teoria'],
        perguntas: 4,
        titulo: 'A previsão que não hesita',
        resumo: '2,58 m para alguém de 25 anos, com a mesma cara de certeza de 1,57 m aos treze.',
        topicos: PREVER,
      },
      {
        id: 'm5-lab', tipo: 'estatistica', licao: 'prever',
        titulo: 'Prevendo dentro e muito fora do intervalo',
        resumo: 'E escrevendo por que a segunda previsão não vale.',
        verificacoes: ['previu-dentro', 'previu-muito-fora', 'escreveu-o-risco'],
      },
    ],
  },
  {
    id: 'm6',
    titulo: 'A qualidade do ajuste',
    resumo: 'Quanto a reta explica, e os dois jeitos de ela não representar os dados.',
    licoes: [
      {
        id: 'm6-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_ESTATISTICA['m6-teoria'],
        perguntas: 4,
        titulo: 'Quanto a reta dá conta',
        resumo: 'O r² se lê como proporção — e ele avisa de um dos dois jeitos de errar.',
        topicos: O_AJUSTE,
      },
      {
        id: 'm6-lab', tipo: 'estatistica', licao: 'ajuste',
        titulo: 'Calculando os três r² e achando o pior',
        resumo: 'O número e a olhada dizem a mesma coisa, e é por isso que os dois existem.',
        verificacoes: ['o-r-quadrado-dos-tres', 'achou-o-pior-ajuste'],
      },
    ],
  },
  {
    id: 'm7',
    titulo: 'A regressão em dado próprio',
    resumo: 'Você escolhe o par. O que se mede é o que você escreve sobre o número.',
    licoes: [
      {
        id: 'm7-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_ESTATISTICA['m7-teoria'],
        perguntas: 4,
        titulo: 'As três perguntas de toda análise',
        resumo: 'O que sugere, que outra história cabe, e que dado decidiria entre elas.',
        topicos: DADO_PROPRIO,
      },
      {
        id: 'm7-lab', tipo: 'estatistica', licao: 'escolhido',
        titulo: 'A relação que você quis olhar',
        resumo: 'Duas colunas escolhidas por você, e três campos escritos sobre elas.',
        verificacoes: [
          'escolheu-e-calculou', 'disse-o-que-sugere', 'disse-outra-explicacao',
          'disse-que-dado-decidiria',
        ],
      },
    ],
  },
  {
    id: 'm8',
    titulo: 'Refazer sem os atípicos',
    resumo: 'A conclusão quase não muda, e o ajuste salta — que é exatamente por que excluir se relata.',
    licoes: [
      {
        id: 'm8-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_ESTATISTICA['m8-teoria'],
        perguntas: 4,
        titulo: 'Excluir sem apagar, e dizer o que mudou',
        resumo: 'O filtro esconde e não exclui; a coluna auxiliar exclui e não apaga.',
        topicos: SEM_OS_ATIPICOS,
      },
      {
        id: 'm8-lab', tipo: 'estatistica', licao: 'exclusao',
        titulo: 'As duas análises, lado a lado',
        resumo: 'Com os quarenta e oito e sem o valor atípico, e o relato do que a exclusão fez.',
        verificacoes: [
          'viu-que-esconder-nao-exclui', 'refez-a-reta-sem-o-atipico',
          'refez-o-ajuste-sem-o-atipico', 'relatou-o-efeito',
        ],
      },
    ],
  },
  {
    id: 'm9',
    titulo: 'O acaso entre dois grupos',
    resumo: 'Incerteza, o embaralho dos rótulos, e as três providências que de fato aumentam a confiança.',
    licoes: [
      {
        id: 'm9-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_ESTATISTICA['m9-teoria'],
        perguntas: 4,
        titulo: 'Uma vez em sete, sem nenhum dado mudar',
        resumo: 'E a frequência é do sorteio, não a chance de uma unidade ser melhor.',
        topicos: O_ACASO,
      },
      {
        id: 'm9-lab', tipo: 'estatistica', licao: 'acaso',
        titulo: 'Embaralhando quem é de qual unidade',
        resumo: 'Vendo o acaso alcançar a diferença real, e escolhendo as três providências.',
        verificacoes: [
          'embaralhou-e-viu-acontecer', 'leu-o-que-o-embaralho-diz',
          'escreveu-por-que-pode-ser-acaso', 'escolheu-as-tres-providencias',
        ],
      },
    ],
  },
  {
    id: 'm10',
    titulo: 'O grau de confiança',
    resumo: 'A análise completa inclui o que a limita — e o grau se declara antes de alguém perguntar.',
    licoes: [
      {
        id: 'm10-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_ESTATISTICA['m10-teoria'],
        perguntas: 4,
        titulo: 'De quanto você confia nisto',
        resumo: 'Dois dos quatro graus esta análise não sustenta, e o cartão de cada um diz por quê.',
        topicos: O_GRAU,
      },
      {
        id: 'm10-lab', tipo: 'estatistica', licao: 'confianca',
        titulo: 'Os oito achados, o grau e as razões',
        resumo: 'Sete se classificam na primeira olhada. O oitavo é o r² que subiu.',
        verificacoes: [
          'classificou-todos-os-achados', 'as-classificacoes-certas',
          'declarou-um-grau-que-se-sustenta', 'escreveu-as-razoes',
        ],
      },
    ],
  },
];
