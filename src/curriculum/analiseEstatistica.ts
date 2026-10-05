import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DA_ESTATISTICA } from './questoesDaEstatistica';

/*
 * A vereda CC-ES010 Análise Estatística.
 *
 * ── O que ela é ─────────────────────────────────────────────────────────
 * A CC-ES009 ensinou a descrever uma base: média, mediana, grupos, gráficos. O
 * que ela não ensinou foi a **afirmar** — e é disso que esta trata. Duas
 * colunas que sobem juntas, uma reta que resume a nuvem, uma previsão que a
 * reta devolve com a mesma cara de certeza dentro e fora do intervalo
 * observado, e uma diferença entre duas unidades que o acaso alcança uma vez
 * em sete.
 *
 * ── O que carrega esta vereda é o número confiante ──────────────────────
 * A da CC-ES009 era o número plausível. Esta é o número **confiante**: a
 * `PREVISÃO` responde 2,58 m para alguém de 25 anos sem hesitar; o r² sobe de
 * 0,83 para 0,94 quando se exclui um desbravador, e o que subiu foi a
 * aparência de certeza; a diferença de 2,59 acampamentos entre a Arara e a
 * Águia aparece sozinha, por sorteio, uma vez em sete. Nenhuma dessas telas dá
 * erro, e nenhuma delas hesita.
 *
 * ── Por que ela exige a CC-ES009 ────────────────────────────────────────
 * Está no requisito 1. A base é a mesma — os quarenta e oito inscritos do
 * acampamento —, e quem não a descreveu não sabe que a média dos acampamentos
 * é 2,85 num clube em que vinte e nove fizeram dois ou menos. Correlação sobre
 * uma base que não se conhece é conta sobre coluna que ninguém olhou.
 *
 * ── E o quadro de resultado fica desligado ──────────────────────────────
 * Como na CC-ES009: os exemplos daqui são tabelas de números e nuvens de
 * pontos desenhadas em texto, e não há o que executar. Ligá-lo desenharia uma
 * caixa vazia ao lado de cada exemplo, que é fingir que executa.
 */

const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], exemplo: string, atencao: string, marcas: string[],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, exemplo, exemploComo: 'texto' as const, atencao, marcas,
});

/* ── Módulo 1 — De quem a base fala (requisitos 2.1, 2.2 e 4) ─────────────── */

const POPULACAO_E_AMOSTRA: TopicoDeVereda[] = [
  t(
    'populacao-e-amostra',
    'A conta fala de quem respondeu; a conclusão fala do clube',
    'São duas coisas, e a distância entre elas é onde quase toda conclusão errada nasce.',
    [
      '**População** é o grupo sobre o qual você quer concluir alguma coisa. **Amostra** é quem de fato entrou na conta. A população do nosso formulário é o clube; a amostra são os quarenta e oito que responderam.',
      'A conta sempre fala da amostra. "A média de acampamentos é 2,85" é uma afirmação sobre os quarenta e oito, e é verdadeira. "No clube, a média é de 2,85 acampamentos" é uma afirmação sobre a população — e para ela valer, a amostra precisa parecer com o clube.',
      'O erro mais comum não é calcular errado: é chamar a amostra de população. Ele não dá erro em lugar nenhum, porque a conta está certa. O que muda é de quem ela fala, e isso não aparece em nenhuma célula.',
    ],
    `A mesma conta, duas frases

  AMOSTRA (48 responderam)
    média de acampamentos = 2,85
    "Entre quem respondeu, a média é 2,85."     → verdadeiro

  POPULAÇÃO (o clube inteiro)
    "No clube, a média é 2,85."                 → só se a amostra
                                                   parecer com o clube

  E o clube tem gente que não respondeu. Quantos? A base não diz.`,
    'A base não tem como dizer de quantas pessoas o clube é feito — ela só conhece quem respondeu. Quem quiser afirmar algo sobre o clube precisa de outro papel: a lista de membros.',
    ['população', 'amostra'],
  ),
  t(
    'representativa-e-enviesada',
    'Representativa é a que parece com o grupo; enviesada é a que torceu',
    'E "torceu" não quer dizer pequena: uma amostra de dez pode ser melhor que uma de mil.',
    [
      'Amostra **representativa** é a que parece com a população naquilo que importa para a pergunta. Se o clube tem seis unidades e a amostra tem gente das seis, em proporções parecidas, ela representa o clube quanto a unidade.',
      'Amostra **enviesada** é a que torceu: algum grupo entrou demais, ou de menos, por causa de **como** a coleta aconteceu. O viés não é falta de gente — é falta de gente **de um lado só**.',
      'É por isso que tamanho não resolve. Uma coleta que só alcança quem está no grupo de WhatsApp fica igualmente torcida com mil respostas: ela multiplica as vozes que já estavam ali e continua sem nenhuma das que ficaram fora.',
    ],
    `Duas amostras do mesmo clube de 60 membros

  A — 10 respostas, uma de cada unidade, sorteadas da lista
      parece com o clube quanto a unidade        → representativa

  B — 40 respostas, todas de quem estava no sábado
      quem falta tem motivo, e o motivo pode ser
      o mesmo que mudaria a resposta             → enviesada

  A de 10 responde melhor que a de 40.`,
    'Viés é do **processo**, e não do número. Olhar o tamanho da amostra para decidir se ela serve é o atalho que faz uma pesquisa grande e torta parecer melhor que uma pequena e honesta.',
    ['representativa', 'enviesada', 'viés'],
  ),
  t(
    'tres-jeitos-de-torcer',
    'Não alcançou, respondeu quem quis, ou a pergunta puxou',
    'Três mecanismos, e saber o nome deles é o que faz alguém reconhecer o viés na pesquisa seguinte.',
    [
      '**Não alcançou todo mundo.** A pergunta não chegou a parte do grupo. Quem não está no grupo de WhatsApp não respondeu "não" — nunca foi perguntado. É o viés da nossa própria coleta.',
      '**Respondeu quem se apresentou.** A pergunta chegou a todos e só parte respondeu, e quem respondeu tem algo em comum: estava no salão naquele sábado, ou se interessa pelo assunto. Quem falta costuma faltar por um motivo, e o motivo às vezes é o mesmo que mudaria a resposta.',
      '**A pergunta puxou a resposta.** Aqui a amostra está inteira e as respostas estão torcidas. "Você concorda que o acampamento de inverno foi o melhor dos últimos anos?" já disse qual é a resposta esperada, e quem tinha dúvida concorda.',
      'Os três erram calado. A planilha recebe as respostas, calcula tudo, e não há nada nela que diga de onde elas vieram.',
    ],
    `Os três, lado a lado

  NÃO ALCANÇOU          quem ficou de fora não aparece em lugar nenhum
    formulário no grupo → quem trocou de número não entra

  QUEM SE APRESENTOU    a amostra é quem estava, não quem é
    pergunta no sábado  → quem faltou não responde

  A PERGUNTA PUXOU      a amostra está inteira; as respostas, não
    "você concorda que   → quem tinha dúvida concorda
     foi o melhor?"

  O terceiro é o único em que contar mais gente não ajuda nada.`,
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
      'No gráfico de colunas, um eixo é categoria e o outro é medida. Na **dispersão**, os dois eixos são medidas: a idade no horizontal, a altura no vertical, e cada desbravador é um ponto. Quarenta e oito pessoas, quarenta e oito pontos.',
      'A nuvem é a mesma em qualquer ordem da tabela. Classificar a base por idade, por nome ou por unidade não move um único ponto — a posição de cada um sai do dado dele, e não da linha em que ele está. Se o seu desenho muda de forma quando alguém ordena a planilha, ele não é uma dispersão.',
      'O que se lê nela é a **forma** da nuvem: subindo da esquerda para a direita, descendo, ou espalhada sem direção. É a primeira coisa a olhar, antes de calcular qualquer número.',
    ],
    `Idade × Altura, 48 pontos

  1,8 |                                    ·  ·
      |                           ·  · ·  ·
  1,6 |                   ·  · ·· ·  ·
      |           ·  · ·· ·  ·
  1,4 |     ·  ·· ·  ·
      |  ·  ·
  1,2 |
      |
  1,0 |  ·                      ← este é o de 1,05 m
      +-------------------------------------------
        10    11    12    13    14    15   (anos)

  Sobe da esquerda para a direita: quem é mais velho é mais alto.`,
    'Para a dispersão a primeira coluna selecionada vai no eixo horizontal. Trocar as duas desenha a nuvem espelhada — que responde a outra pergunta com a mesma cara.',
    ['dispersão', 'nuvem de pontos'],
  ),
  t(
    'o-coeficiente',
    'O r é um número de −1 a 1, e ele resume a nuvem',
    'Sinal diz a direção; tamanho diz o quanto os pontos se aproximam de uma reta.',
    [
      '**Correlação** é o quanto duas medidas andam juntas. O coeficiente de correlação, o **r**, põe isso num número entre −1 e 1. Positivo: quando uma sobe, a outra sobe. Negativo: quando uma sobe, a outra desce. Perto de zero: não andam juntas.',
      'O tamanho diz a força. Acima de 0,7 em módulo é uma relação forte; entre 0,3 e 0,7, moderada; abaixo de 0,3, fraca. Na nossa base, idade e altura dão r = 0,91 — forte, e é o que a nuvem mostra.',
      'Na planilha o r sai de `CORREL`, e ela é **simétrica**: trocar as duas faixas devolve o mesmo número, porque a correlação não tem lado. Isso vai importar no módulo 4, onde as funções da reta **não** são simétricas.',
    ],
    `Os três pares desta base

  idade × altura          r = 0,91    forte
  idade × acampamentos    r = 0,72    forte
  altura × acampamentos   r = 0,62    moderada

  =CORREL(Respostas!F2:F49;Respostas!G2:G49)   → 0,91
  =CORREL(Respostas!G2:G49;Respostas!F2:F49)   → 0,91   (a mesma)`,
    'Calcular é metade do requisito; a outra é interpretar. "r = 0,91" não é uma conclusão — a conclusão é "quem é mais velho é mais alto, e quase sempre, não só às vezes".',
    ['correlação', 'coeficiente de correlação', 'r'],
  ),
  t(
    'o-que-o-r-nao-diz',
    'r alto não é reta perfeita, e r perto de zero não é "sem relação"',
    'As duas leituras erradas que um número só convida a fazer.',
    [
      'r = 0,91 não quer dizer que os pontos estão **sobre** uma reta: quer dizer que eles se aproximam de uma. Numa nuvem de quarenta e oito pessoas, há quem esteja bem longe dela — e o r não aponta quem.',
      'E r perto de zero não quer dizer "estas duas coisas não têm nada a ver". Quer dizer que elas não andam juntas **em linha reta**. Uma relação em forma de U — sobe e depois desce — pode dar r igual a zero com uma relação forte dentro.',
      'Por isso o número nunca substitui a olhada. O r resume a nuvem num algarismo, e todo resumo joga coisa fora: o que ele joga fora é justamente a forma.',
    ],
    `Duas nuvens, o mesmo r perto de zero

  A — espalhada sem direção        B — em forma de U
    ·   ·  ·   ·                     ·                 ·
      ·   ·  ·    ·                    ·             ·
    ·    ·   ·  ·                        ·  ·  ·  ·
    r ≈ 0                            r ≈ 0

  Em A não há relação. Em B há uma relação forte,
  e ela não é reta — que é a única que o r mede.`,
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
    `r = 0,62 entre altura e acampamentos. Qual história?

  1. a altura causa acampamentos      quem é mais alto é levado mais vezes?
  2. acampamentos causam altura        acampar faz crescer?
  3. uma terceira coisa puxa as duas   a idade: quem é mais velho é mais
                                        alto E já teve mais anos de clube
  4. é de quem respondeu               só os veteranos responderam?

  As quatro dão r = 0,62. O número não escolhe.`,
    'A pergunta que separa as histórias é sempre a mesma: **o que mais mudaria junto**? Se existe uma terceira coluna que explicaria as duas, ela é a primeira suspeita — e não a última.',
    ['causalidade', 'correlação espúria'],
  ),
  t(
    'a-espuria-desta-base',
    'A altura não leva ninguém ao acampamento: a idade leva as duas',
    'E é um exemplo real, da base que o clube coletou — não um caso inventado.',
    [
      'Dos três pares da base, dois têm direção defensável e um não tem. Idade e altura: a idade explica a altura, e ninguém fica mais velho por ter crescido. Idade e acampamentos: quem está no clube há mais anos foi a mais acampamentos.',
      'Altura e acampamentos dão r = 0,62, e nenhuma das duas mexe na outra. Quem é mais alto não é convidado mais vezes, e dormir numa barraca não faz crescer. As duas sobem juntas porque as duas sobem com a **idade** — que está na mesma tabela, na coluna ao lado.',
      'Esse par é o que se chama **correlação espúria**: o número existe, foi medido certo, e a relação entre as duas colunas não existe. "Espúria" não quer dizer que a conta está errada — quer dizer que a conclusão que ela sugere está.',
    ],
    `A coluna que explica os dois lados

                   r com altura   r com acampamentos
  idade                0,91              0,72

  altura × acampamentos = 0,62

  As duas têm correlação forte com a idade.
  É ela que faz as duas subirem juntas — e ela está na
  coluna F, duas casas à esquerda.`,
    'A terceira coluna quase sempre está na própria base. Procurá-la ali é o primeiro passo, e é mais rápido do que discutir a história: se existe uma coluna que tem correlação forte com as duas, a suspeita de espúria é séria.',
    ['espúria', 'terceira variável'],
  ),
  t(
    'como-se-testa',
    'A relação sobrevive dentro de quem tem a mesma idade?',
    'O teste que separa "uma causa a outra" de "as duas sobem com uma terceira".',
    [
      'Se altura e acampamentos sobem juntas só porque as duas sobem com a idade, então **dentro de um grupo de mesma idade** a relação deve desaparecer: entre os doze desbravadores de treze anos, ser mais alto não dá mais acampamentos.',
      'Esse é o teste, e ele não exige estatística nova: é olhar a mesma correlação dentro de um pedaço da base em que a terceira coluna não varia. Se ela continua forte, a terceira coluna não era a explicação. Se ela desaparece, era.',
      'Não há como fazer isso sem **ter** a terceira coluna. É por aí que a resposta honesta muitas vezes é "esta base não decide": se a coisa que explicaria as duas não foi coletada, nenhuma conta aqui a traz de volta.',
    ],
    `O teste, em palavras

  Base inteira:              altura × acampamentos   r = 0,62
  Só quem tem 13 anos:       altura × acampamentos   r ≈ ?

  Se cair perto de zero → a idade explicava as duas
  Se continuar forte    → a idade não era a explicação

  E se a coluna da idade não existisse na base?
  → não haveria como fazer o teste, e a resposta honesta
    seria "esta base não decide".`,
    'Com quarenta e oito pessoas e seis idades, cada grupo fica com poucas pessoas — e correlação em grupo pequeno é quase toda sorteio, que é o assunto do módulo 9. O teste aponta a direção; ele não fecha a questão sozinho.',
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
      'Variável **independente** é a que você usa para explicar; **dependente** é a que você quer explicar. Na nossa base a idade explica a altura: criança mais velha é mais alta. O contrário é absurdo — ninguém fica mais velho por ter crescido.',
      'O jeito de decidir é fazer a pergunta nos dois sentidos e ouvir qual soa absurda. "A idade muda a altura?" soa certo. "A altura muda a idade?" não soa. Quando as duas soam possíveis, provavelmente não há direção clara — e aí a reta descreve, mas não explica.',
      'Isso não é formalidade: a reta recebe as duas colunas em ordem, e a ordem decide qual conta sai. Escrever ao contrário devolve a reta de x sobre y, que é outro número com a mesma cara de certo.',
    ],
    `Os três pares, e a direção de cada um

  idade → altura           clara: ninguém envelhece por crescer
  idade → acampamentos     clara: mais anos de clube, mais acampamentos
  altura ↔ acampamentos    nenhuma: é a espúria do módulo 3

  A reta do par claro: altura explicada pela idade.
  A reta do par espúrio: existe, desenha, e não explica nada.`,
    'Direção clara é condição para **explicar**, e não para calcular. A planilha desenha a reta do par espúrio sem reclamar, e ela resume a nuvem corretamente — o que ela não faz é dizer que uma coisa mexe na outra.',
    ['variável dependente', 'variável independente'],
  ),
  t(
    'a-linha-de-tendencia',
    'A reta passa o mais perto possível de todos ao mesmo tempo',
    'E não passa por cima de nenhum ponto. É isso que a torna útil.',
    [
      '**Regressão linear** é achar a reta que resume a nuvem: aquela em que a soma das distâncias até os pontos é a menor possível. Na planilha ela aparece como **linha de tendência** no gráfico de dispersão.',
      'Ela não passa por cima dos pontos, e quem espera isso lê o desenho errado. Passar por todos exigiria que os pontos estivessem alinhados, o que dado de gente nunca está. A reta é um resumo, e todo resumo joga coisa fora.',
      'No programa ela é um **elemento do gráfico**: Elementos do Gráfico → Linha de Tendência. Dá para ver a reta e nunca ler a conta dela, que é o que quase todo mundo faz — e são duas caixas separadas justamente por isso.',
    ],
    `A nuvem e a reta que a resume

  1,8 |                                 /·  ·
      |                          ·  ·/· ·
  1,6 |                   ·  ·/·· ·  ·
      |           ·  · /· ·  ·
  1,4 |     ·  ·/ ·  ·
      |  ·  /·
  1,2 |   /
      | /
  1,0 |  ·                    ← a reta não desce até ele
      +-------------------------------------------
        10    11    12    13    14    15   (anos)`,
    'Marcar a linha de tendência não traz a equação. São dois cliques em duas caixas, e o requisito pede os dois: ajustar a linha **e** obter a equação dela.',
    ['regressão linear', 'linha de tendência'],
  ),
  t(
    'a-equacao-e-a-ordem',
    'Dois números descrevem a reta, e as funções recebem o y primeiro',
    'A inclinação diz quanto a altura sobe por ano; a intercepção, onde a reta corta o eixo.',
    [
      'A reta se escreve como altura = inclinação × idade + intercepção. Nesta base a inclinação é 0,08 metro por ano de idade — oito centímetros e meio — e a intercepção é 0,48. É a equação, e é ela que deixa prever sem medir o gráfico com a régua.',
      'A intercepção costuma não querer dizer nada sozinha: 0,48 metro seria a altura de alguém de zero ano segundo esta reta, e não há ninguém de zero ano na base. Ela é a peça que posiciona a reta, e não uma previsão.',
      '`INCLINAÇÃO` e `INTERCEPÇÃO` recebem **o y primeiro**: a coluna explicada, e depois a que explica. Isso é do programa, e é a armadilha: quem escreve `=INCLINAÇÃO(idades; alturas)` pensando "a idade explica a altura" recebe a inclinação de idade sobre altura, que é outra reta, sem erro nenhum.',
    ],
    `A equação desta base

  =INCLINAÇÃO(Respostas!G2:G49;Respostas!F2:F49)   → 0,08
  =INTERCEPÇÃO(Respostas!G2:G49;Respostas!F2:F49)  → 0,48
                 ↑ altura (y)      ↑ idade (x)

  altura = 0,08 × idade + 0,48

  Ao contrário:
  =INCLINAÇÃO(Respostas!F2:F49;Respostas!G2:G49)   → 9,85
                 ↑ idade          ↑ altura
  Dez vezes maior, nenhum erro na tela, e outra reta.`,
    'CORREL é simétrica e estas três não são. Trocar a ordem ali devolve um número plausível sobre a pergunta invertida — e a planilha não tem como saber qual você queria.',
    ['inclinação', 'intercepção', 'equação da reta'],
  ),
];

/* ── Módulo 5 — Prever, e o risco de extrapolar (requisito 5.4) ───────────── */

const PREVER: TopicoDeVereda[] = [
  t(
    'prever-com-a-equacao',
    'Com a equação, dá para estimar um valor que ninguém mediu',
    'E é para isso que ela serve: a reta responde para qualquer idade que você perguntar.',
    [
      'A equação aceita qualquer x. Para treze anos, altura = 0,08 × 13 + 0,48, e a planilha responde 1,57 m. Há desbravadores de treze anos na base, e a conta diz: a altura **típica** nessa idade é essa.',
      'Na planilha isso é `PREVISÃO(x; conhecidos_y; conhecidos_x)` — e repare na ordem: o x primeiro, depois a coluna explicada, depois a que explica. É diferente da ordem de `INCLINAÇÃO`, e o programa não avisa.',
      'A previsão é uma estimativa, e não uma medida. 1,57 m não é a altura de ninguém em particular: é o centro da faixa onde a reta espera encontrar os de treze anos.',
    ],
    `A mesma equação, cinco perguntas

  =PREVISÃO(10;Respostas!G2:G49;Respostas!F2:F49)  → 1,32
  =PREVISÃO(13;Respostas!G2:G49;Respostas!F2:F49)  → 1,57
  =PREVISÃO(15;Respostas!G2:G49;Respostas!F2:F49)  → 1,74
  =PREVISÃO(16;Respostas!G2:G49;Respostas!F2:F49)  → 1,83
  =PREVISÃO(25;Respostas!G2:G49;Respostas!F2:F49)  → 2,58

  A base vai de 10 a 15 anos. Três respostas estão dentro
  do que foi observado; duas estão fora.`,
    'A previsão sai do mesmo motor que a reta. Ela é a reta avaliada num ponto, e não uma segunda conta: se a reta estiver errada, a previsão herda o erro inteiro.',
    ['previsão', 'estimar'],
  ),
  t(
    'extrapolar',
    'Fora do intervalo observado a reta continua respondendo, e deixa de valer',
    'Ela não hesita, não avisa, e dá um número com a mesma cara dos outros.',
    [
      'A base vai de dez a quinze anos. Perguntar a altura de alguém de vinte e cinco é **extrapolar**: sair da faixa onde há dado. A reta responde 2,58 m — mais alto do que qualquer pessoa que já viveu.',
      'Esse é o caso fácil, porque o absurdo se vê. O caso difícil é dezesseis anos: a reta responde 1,83 m, que é alto e possível, e quem a visse concluiria que ela funciona fora do intervalo. Não funciona: ela só não foi longe o bastante para se delatar.',
      'O motivo é que a reta não sabe de biologia. Ela foi ajustada a seis idades de criança e aprendeu "oito centímetros e meio por ano". Nada nela diz que as pessoas param de crescer, porque na base ninguém parou.',
    ],
    `Onde a reta foi vista funcionar

              |<--- observado --->|
    ----------+===================+-------------------------
             10                  15        20        25
              1,32            1,74       2,16      2,58
                                          ↑         ↑
                               fora: a reta responde
                               com a mesma confiança

  2,58 m é absurdo e se vê. 1,83 m aos 16 é plausível
  e não se vê — e é o perigoso.`,
    'Quem recebe uma previsão precisa receber junto o intervalo em que os dados estão. Sem isso, qualquer número vira resposta, e a reta nunca se recusa a dar um.',
    ['extrapolação', 'intervalo observado'],
  ),
];

/* ── Módulo 6 — A qualidade do ajuste (requisito 5.5) ─────────────────────── */

const O_AJUSTE: TopicoDeVereda[] = [
  t(
    'o-r-quadrado',
    'O r² diz quanto da variação a reta explica',
    'É o r elevado ao quadrado, e ele se lê como proporção.',
    [
      'O **r²** é o quadrado do coeficiente de correlação, e ele responde: de toda a variação da coluna explicada, quanto a reta dá conta? Para idade e altura o r é 0,91 e o r² é 0,83 — a reta explica a maior parte da variação da altura, e sobra pouco.',
      'Ele vai de 0 a 1 e não tem sinal: elevar ao quadrado apaga a direção. Por isso ele não substitui o r — diz o quanto, e não para onde.',
      'Na planilha é `RQUAD`, e ela recebe o y primeiro, como `INCLINAÇÃO`. Como é o quadrado do r, trocar a ordem aqui não muda o número: o quadrado de um simétrico é simétrico. Continua sendo bom hábito escrever na ordem certa.',
    ],
    `Os três pares, do melhor ajuste ao pior

  idade × altura          r = 0,91    r² = 0,83
  idade × acampamentos    r = 0,72    r² = 0,51
  altura × acampamentos   r = 0,62    r² = 0,38

  No primeiro a reta dá conta de quatro quintos da variação.
  No último, de pouco mais de um terço: a nuvem é larga,
  e a reta passa pelo meio de muita coisa que ela não explica.`,
    'r² alto não quer dizer que a conclusão está certa — quer dizer que a reta resume bem **aquela** nuvem. O par espúrio desta base tem r² de 0,38 e ainda assim nenhuma das duas colunas mexe na outra.',
    ['r²', 'qualidade do ajuste'],
  ),
  t(
    'quando-a-reta-nao-serve',
    'Dois jeitos de a reta não representar: nuvem larga e forma errada',
    'E o número avisa do primeiro, não do segundo.',
    [
      'O primeiro jeito é a **nuvem larga**: os pontos se espalham longe da reta, o r² é baixo, e o resumo diz pouco. Aqui o número avisa — 0,38 é um aviso.',
      'O segundo é a **forma errada**: a nuvem tem padrão, e o padrão não é reto. Uma nuvem em U pode ter r² perto de zero com uma relação forte dentro, e nesse caso o número avisa pelo motivo errado. Pior: há curvas em que o r² sai alto e a reta ainda assim descreve mal os extremos.',
      'Por isso os dois se olham juntos: o r² e o desenho. O número diz o quanto os pontos se afastam da reta; só o desenho diz se uma reta era o resumo certo.',
    ],
    `Mesma reta, duas nuvens

  A — larga                      B — forma errada
    ·     ·    ·                      ·         ·
       ·/  ·  ·   ·                 ·   \\     /   ·
    ·  /·    ·                        ·  \\· ·/  ·
      /   ·    ·                         \\  /
    r² = 0,38                         r² = 0,02

  Em A a reta serve e explica pouco.
  Em B a reta não serve, e o número não diz isso: ele só
  diz que os pontos estão longe dela.`,
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
      'Os módulos anteriores apontaram os pares. Este pede o contrário: escolher duas colunas da base, calcular o r delas, e escrever o que esse número sugere. Nenhuma das quatro colunas de medida é errada, e nenhuma vem com resposta pronta.',
      'Escolher um par que as lições não usaram é a ideia. Idade e diárias, por exemplo, dão r = 0,33: uma relação fraca, que existe e é pequena. Relação fraca é material de análise como qualquer outra — o que ela não é é prova de nada.',
      'E a escolha muda o trabalho: não há gabarito para "o que a relação sugere", então o que se cobra é que a frase fale do par que você escolheu, com o número que você calculou.',
    ],
    `As quatro colunas de medida, e os pares que sobram

                idade   altura   acamp.   diárias
  idade           —      0,91     0,72      0,33
  altura                   —      0,62      0,25
  acampamentos                      —       0,14
  diárias                                     —

  Três pares já foram vistos nas lições. Os outros três
  estão aqui, e nenhum deles vem com conclusão escrita.`,
    'Relação fraca não é relação ausente, e não é relação errada. Dizer "o r deu 0,33, então as duas quase não andam juntas" é uma conclusão completa — e mais honesta que esticar um número pequeno.',
    ['dado próprio', 'relação fraca'],
  ),
  t(
    'as-tres-perguntas',
    'O que sugere, que outra história cabe, e que dado decidiria',
    'As três juntas são a diferença entre calcular e analisar.',
    [
      '**O que a relação sugere.** Em palavras, com o número: as duas andam juntas ou em sentidos contrários, e o quanto. É a interpretação, e ela é sobre as duas colunas que você escolheu.',
      '**Que outra explicação cabe no mesmo padrão.** É o módulo 3 virando hábito: pensar numa terceira coisa que puxaria as duas, ou numa direção invertida, ou em algo de quem respondeu. Quase sempre existe, e escrevê-la é o que impede de afirmar demais.',
      '**Que dado a mais decidiria entre as duas.** Duas explicações para o mesmo padrão não se resolvem discutindo: resolvem-se medindo mais uma coisa. Pode ser uma coluna que a base não tem — e aí a resposta honesta é que esta base não decide.',
    ],
    `Um exemplo completo, com idade × diárias (r = 0,33)

  O que sugere
    Quem é mais velho tende a dormir um pouco mais noites,
    mas muito pouco: 0,33 é fraco.

  Outra explicação
    Talvez quem mora longe durma todas as noites e quem mora
    perto vá e volte, e os que moram longe sejam por acaso os
    mais velhos. A distância explicaria as duas.

  Que dado decidiria
    A distância entre a casa de cada um e o lugar do
    acampamento. Esta base não a tem, então ela não decide.`,
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
      'O jeito que funciona é a **coluna auxiliar**: numa coluna livre ao lado, copiar a coluna que interessa e limpar a célula da linha a excluir. Depois as funções leem a coluna nova, e o dado original continua intacto. Você só apaga um dos dois lados — o par cai inteiro quando falta um número de qualquer um deles.',
    ],
    `Os três caminhos

  FILTRO          esconde a linha            inclinação: 0,08  (não mudou)
  APAGAR A LINHA  destrói o dado             inclinação: 0,08  (e a base foi)
  COLUNA AUXILIAR cópia sem a linha          inclinação: 0,08  (e a base fica)

  A coluna auxiliar, célula por célula:
    L2  =G2        ← cópia
    L3  =G3
    ...
    L41 (vazia)    ← a linha do valor atípico
    ...
  =INCLINAÇÃO(Respostas!L2:L49;Respostas!F2:F49)`,
    'A coluna auxiliar não mexe no dado, e isso não é detalhe: as duas contas de "sem o atípico" são conferidas contra a base como ela chegou. Apagar a linha e usar a faixa inteira devolve o número certo com a fórmula errada.',
    ['coluna auxiliar', 'filtro não exclui'],
  ),
  t(
    'o-que-a-exclusao-faz',
    'A conclusão quase não muda, e o ajuste salta',
    'É o resultado desta base, e é o que torna a exclusão perigosa.',
    [
      'A base tem um valor atípico na altura: 1,05 m, de um desbravador de onze anos. Tirando-o, a reta passa a dizer 8,0 centímetros por ano em vez de 8,4, e a altura prevista para treze anos anda meio centímetro. A conclusão é praticamente a mesma.',
      'O que muda é o **r²**: de 0,83 para 0,94. A reta passou a parecer muito mais certa sem ter ficado mais certa. Quem apresentasse só o segundo número estaria apresentando um ajuste comprado com a exclusão de uma pessoa.',
      'E é por isso que excluir se **relata**, e não se faz calado. Um r² de 0,94 obtido tirando gente é um motivo para desconfiar do r², e não para confiar na reta. A pessoa que saiu da conta é do clube, e continua sendo.',
    ],
    `Com todos e sem o atípico

                          com os 48      sem ele (47)
  inclinação              8,4 cm/ano      8,0 cm/ano
  altura prevista aos 13     1,57 m         1,58 m
  r²                          0,83           0,94

  A reta afirma quase a mesma coisa.
  A confiança aparente subiu um terço do que faltava.`,
    'Um valor em quarenta e oito move a reta meio milímetro por ano e melhora o ajuste em onze pontos. Nenhum desses dois números dá erro, e o segundo é o que alguém levaria para a reunião.',
    ['valor atípico', 'r² inflado'],
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
      'Ela encolhe com o tamanho do grupo e nunca chega a zero. Entre duas unidades de sete e oito pessoas, trocar duas de lado já muda a média de cada uma. Entre duas de trinta, muito menos.',
      'Declarar a incerteza é parte do resultado. Um número apresentado sem ela parece exato, e o que a plateia ouve é "é isto", quando o que havia era "é por aí".',
    ],
    `A mesma pergunta, dois tamanhos de grupo

  Grupos de 7 e 8 pessoas (Arara e Águia)
    trocar 2 pessoas de lado muda a média de cada uma
    → a diferença varia muito de coleta para coleta

  Grupos de 30 pessoas
    trocar 2 de lado quase não move nada
    → a diferença varia pouco

  Nos dois casos a conta está certa.`,
    'Incerteza não se conserta refazendo a conta. Ela se reduz coletando de mais gente, repetindo a coleta, ou decidindo antes o que comparar — e se declara quando não se pode reduzir.',
    ['incerteza'],
  ),
  t(
    'o-embaralho',
    'Embaralhar os rótulos mostra o que o acaso alcança sozinho',
    'Nenhum dado muda: só quem é de qual unidade é sorteado de novo.',
    [
      'A Arara tem média de 4,71 acampamentos e a Águia 2,13: uma diferença de 2,59. Parece grande, e é a maior da base. A pergunta é: o acaso alcançaria uma diferença desse tamanho sozinho?',
      'O jeito de ver isso sem cálculo nenhum é **embaralhar os rótulos**. Pega-se a mesma lista de medidas e sorteia-se de novo quem é Arara e quem é Águia, mantendo sete e oito pessoas. Nada nos números mudou — só quem está de qual lado. Então calcula-se a diferença outra vez.',
      'Fazendo isso muitas vezes, aparece uma frequência. Nesta base, uma diferença tão grande quanto a real aparece **cerca de uma vez em sete**, sem que um único dado tenha mudado. Quem viu isso acontecer não precisa de mais nada para desconfiar da diferença entre dois grupos de sete pessoas.',
    ],
    `Vinte e cinco embaralhos, e o que saiu

  real: 2,59

  0,43  1,21  2,73  0,09  1,55  0,88  2,61  1,02  0,37
  1,94  0,66  3,12  1,48  0,21  2,05  1,73  0,54  1,16
  0,92  2,88  1,34  0,77  2,42  1,59  0,48

  Quatro em vinte e cinco chegaram a 2,59 ou mais.
  E nenhum número da base mudou de lugar.`,
    'Uma leva só não é frequência: ver um embaralho chegar na diferença real diz tanto quanto ver um não chegar. O que se lê é a proporção, e proporção precisa de muitos.',
    ['embaralhar os rótulos', 'frequência'],
  ),
  t(
    'o-que-o-numero-nao-diz',
    'Uma vez em sete é a frequência do sorteio, e não a chance de a Arara ser melhor',
    'É o erro mais comum que existe com este tipo de número.',
    [
      'O resultado do embaralho responde a uma pergunta bem específica: **com que frequência o acaso alcança uma diferença deste tamanho**. Ele não diz a chance de uma unidade ser melhor que a outra, e não diz que foi o acaso que produziu a diferença observada.',
      'Pode ter sido o acaso, e pode não ter sido. O que se perdeu foi o **direito de afirmar** — e não a diferença, que existe e foi medida. Negar o número medido é o oposto de desconfiar da conclusão tirada dele.',
      'Quem troca o sujeito da frequência sai do cálculo mais confiante do que entrou, que é a pior coisa que uma conta pode fazer com alguém.',
    ],
    `Quatro leituras do mesmo resultado

  "O acaso alcança uma diferença assim em cerca de
   uma vez em sete."                            → o que o embaralho diz

  "Foi o acaso que produziu a diferença."        → ele mostrou que o acaso
                                                   consegue, não que foi

  "Há 14% de chance de a Arara ser melhor."      → troca o sujeito: a
                                                   frequência é do sorteio

  "A diferença de 2,59 não existe."              → existe e foi medida`,
    'As três leituras erradas são frases que gente formada diz. A diferença entre elas e a certa não está no número: está em de quem o número fala — que é o mesmo cuidado do módulo 1, aplicado a uma frequência.',
    ['frequência do sorteio', 'direito de afirmar'],
  ),
  t(
    'tres-providencias',
    'Mais gente, repetir a coleta, e decidir antes o que comparar',
    'Três coisas que aumentam a confiança — e quatro que só parecem aumentar.',
    [
      '**Coletar de mais gente em cada grupo.** A diferença entre dois grupos de sete é quase toda sorteio. Entre dois de trinta, o embaralho quase nunca alcança a diferença real.',
      '**Repetir a coleta noutra ocasião.** O acaso não repete o mesmo resultado de propósito. Uma diferença que reaparece numa segunda coleta é uma diferença que não era do dia.',
      '**Decidir antes o que comparar.** Escolher o par depois de ver qual deu a maior diferença é achar o acaso de propósito: entre oito unidades há vinte e oito pares, e alguma dupla vai ter diferença grande por sorteio.',
      'E as que não aumentam: tirar quem está fora da conta, comparar mais pares até um ficar claro, refazer a aritmética, e escrever o resultado com mais casas decimais. Nenhuma é bobagem — todas são coisas que se fazem de boa fé achando que ajudam.',
    ],
    `Aumenta ou só parece aumentar?

  AUMENTA
    mais gente em cada grupo        o acaso encolhe
    repetir a coleta                 o acaso não repete
    decidir antes o que comparar     não se procura até achar

  SÓ PARECE
    tirar quem está fora             sobe o r², não o acerto
    comparar mais pares              procurar até achar é achar acaso
    refazer a conta                  confere aritmética que já estava certa
    mais casas decimais              precisão não é confiança`,
    'Refazer a conta é certo e não é isto: ela já estava certa. O que está em dúvida não é se a média é 4,71 — é se 4,71 contra 2,13 diz algo sobre as duas unidades.',
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
      'Nesta base, o que sustenta é concreto: o r entre idade e altura é 0,91, o r² é 0,83, a direção é clara, e a relação sobrevive à exclusão do valor atípico. O que limita também: a coleta foi enviesada, há um par espúrio, a reta extrapola sem avisar, o r² sobe quando se exclui gente, e a diferença entre duas unidades aparece por sorteio uma vez em sete.',
      'O achado mais difícil de classificar é o r² que subiu de 0,83 para 0,94: a leitura natural é que a análise melhorou, e ele **limita** — o que subiu foi a confiança aparente. Quem classifica esse certo entendeu a vereda inteira.',
    ],
    `Os dois lados desta base

  SUSTENTAM
    r = 0,91 e r² = 0,83 entre idade e altura
    direção clara: a idade explica a altura
    a reta sobrevive à exclusão do atípico

  LIMITAM
    a coleta não alcançou quem não estava no grupo
    altura × acampamentos é espúria: a idade explica as duas
    a reta prevê 2,58 m aos 25 anos
    o r² sobe para 0,94 quando se exclui uma pessoa
    a diferença entre Arara e Águia sai por sorteio 1 vez em 7

  O mesmo resultado do módulo 8 aparece dos dois lados.`,
    'Um resultado tem os dois lados. A reta não depender de uma pessoa sustenta; o r² subir ao tirá-la limita — e as duas coisas saíram do mesmo módulo.',
    ['análise completa', 'o que limita'],
  ),
  t(
    'declarar-o-grau',
    'Dizer de quanto você confia, antes de alguém perguntar',
    'E dois dos quatro graus esta análise não sustenta.',
    [
      'O requisito pede declarar **expressamente** o grau de confiança, e as razões dessa avaliação. Não é o examinador que decide: é você que diz, e depois defende.',
      'Declarar **alta** compromete você a dizer que o clube pode decidir com base nisto sem olhar mais nada — e para isso nenhum dos seus achados poderia estar limitando a conclusão. Você acabou de nomear cinco que limitam.',
      'Declarar **nenhuma** compromete você a dizer que a análise não mostra nada — e para isso nenhum achado poderia estar sustentando, e aí não haveria o que apresentar. Entre **média** e **baixa** a escolha é sua: média diz que a conclusão vale e tem limites que você sabe nomear; baixa diz que isto serve para levantar a pergunta, e não para decidir.',
    ],
    `A que cada grau compromete

  ALTA      decida com base nisto, sem olhar mais nada
            → exige que nada esteja limitando

  MÉDIA     vale, e tem limites que eu sei nomear
            → é o grau que obriga a apresentar os dois lados

  BAIXA     serve para levantar a pergunta, não para decidir
            → espere mais dados antes de agir

  NENHUMA   não mostra nada
            → exige que nada esteja sustentando`,
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
