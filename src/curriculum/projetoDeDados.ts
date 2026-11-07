import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { telasDoTopico } from './telas';
import { QUESTOES_DO_PROJETO_DE_DADOS } from './questoesDoProjetoDeDados';

/*
 * A vereda CC-ES013 Projeto de Dados.
 *
 * ── O que ela é ─────────────────────────────────────────────────────────
 * A segunda vereda de integração, e a do lado dos números. As contas já foram
 * ensinadas: as medidas e a comparação de grupos na CC-ES009, a dispersão e a
 * reta na CC-ES010, e a fala de dez minutos na CC-ES011 — as duas últimas são
 * as que o requisito 1 exige antes desta.
 *
 * O que ela ensina é o que nenhuma delas podia ensinar: uma pergunta que alguém
 * fez **antes** de olhar o dado, uma base que chega suja e precisa ser limpa
 * sem deixar de existir como chegou, e uma resposta que vai para quem decide.
 * As veredas anteriores entregavam a base fechada e arrumada; aqui arrumá-la é
 * o trabalho, e a bruta continuar bruta é a condição.
 *
 * ── A base é o clube que a CC-ES009 já conhece ──────────────────────────
 * Os mesmos sessenta e um membros, com os nomes, as unidades e as idades de
 * lá, e a pergunta é a deles: quem mora mais longe falta mais às reuniões? Os
 * números que a teoria cita saem dessa base pelo mesmo motor que responde ao
 * desbravador, e `exemplosDoProjetoDeDados.test.ts` os confere.
 *
 * ── E o que ela não confere ─────────────────────────────────────────────
 * O requisito 8 pede apresentar a público real do clube. Isso acontece fora
 * do aplicativo: o que a plataforma faz é preparar o roteiro e guardar o
 * registro do que aconteceu.
 */

/*
  O exemplo é a tela do Excel e da nuvem do laboratório, e não um quadro de
  texto — e a base fotografada é outra.

  A teoria nasceu com um quadro em cada tópico, e o quadro era a própria
  chamada do semestre que o laboratório limpa: a Carla repetida, o 1.250 da
  Isabela, a média de 15,39, a mediana de 5 km, a correlação de -0,70. Quem lia
  a teoria chegava ao laboratório com todas as respostas. Hoje as telas
  mostram o gesto na base do tempo de tela e do sono
  (`src/exemplos/telaESono.ts`), e os tópicos da proposta, da conclusão e da
  apresentação, que acontecem em tela da plataforma, ficam em prosa.
*/
const V = 'CC-ES013';
const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], atencao: string, marcas: string[],
  telas?: [legenda: string, descricao: string][],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, atencao, marcas,
  ...(telas ? { telas: telasDoTopico(V, id, telas) } : {}),
})

/* ── Módulo 1: a proposta ─────────────────────────────────────────────────── */

const A_PROPOSTA: TopicoDeVereda[] = [
  t(
    'a-pergunta-antes-do-dado',
    'A pergunta vem antes do dado',
    'Quem olha a base primeiro escreve a pergunta que ela já respondeu.',
    [
      'O requisito 2 pede uma proposta escrita, aprovada pelo examinador, e diz que a execução **não pode começar** antes da aprovação. Num projeto de dados isso pesa mais do que em qualquer outro: o perigo não é só fazer o trabalho errado, é fazer a pergunta errada.',
      'Quem abre a base antes de escrever a pergunta encontra alguma coisa interessante — sempre encontra — e escreve a pergunta que aquele achado responde. A análise sai bonita e não serve a ninguém, porque ninguém tinha perguntado aquilo.',
      'Uma pergunta é diferente de um assunto. "O sono do clube" é um assunto: qualquer gráfico serve e nenhum responde. "Quem passa mais tempo no celular dorme menos?" é uma pergunta, e o dado pode dizer sim ou não.',
    ],
    'O ponto de interrogação é a parte fácil. O teste de verdade é: dá para responder com um número?',
    ['proposta antes', 'pergunta e assunto'],
  ),
  t(
    'quem-decide-o-que',
    'Quem decide, e o quê',
    'Um projeto de dados existe para alguém fazer alguma coisa com o resultado.',
    [
      'A proposta pede três coisas: a pergunta, a **origem dos dados** e **quem vai tomar alguma decisão** a partir do resultado. A terceira é a que separa um projeto de uma curiosidade.',
      'Dizer só "a diretoria" não basta. Que decisão a diretoria vai tomar? "Se o clube faz com as famílias uma campanha de celular fora do quarto, e com quais unidades começa" é uma decisão: dá para saber, no fim, se o resultado ajudou a tomá-la.',
      'E é ela que decide para quem você vai apresentar no fim. Se a decisão é da diretoria, a apresentação é para a diretoria — e não para a família em casa, que ouve com gosto e não decide nada no clube.',
    ],
    'A origem se escreve antes de buscar a base. Se ela não existe, a proposta descobre isso a tempo.',
    ['quem decide', 'origem dos dados'],
  ),
];

/* ── Módulo 2: a base ─────────────────────────────────────────────────────── */

const A_BASE: TopicoDeVereda[] = [
  t(
    'a-base-que-responde',
    'A base que responde à pergunta',
    'Tamanho é o mínimo; o que pesa é a base falar da pergunta.',
    [
      'O requisito 3 pede uma base com, no mínimo, **sessenta registros e cinco campos**. Registro é uma linha — uma pessoa, um evento, uma coisa contada. Campo é uma coluna — uma informação sobre cada registro.',
      'A base pode ser coletada por você ou vir de fonte pública. Nos dois casos, ela precisa ter **na mesma linha** o que se quer explicar e o que pode explicar. Para a pergunta do sono, isso é o sono de cada desbravador e o tempo de tela de cada um, juntos.',
      'Uma base grande que não fala da pergunta não serve. Uma pesquisa nacional sobre o sono de adolescentes é cuidadosa e oficial — e fala do Brasil inteiro, não de quem dorme pouco no clube.',
    ],
    'A base que já está pronta é a mais tentadora. Confira se ela tem o que a pergunta pede antes de se apegar a ela.',
    ['registro e campo', 'base que responde'],
  ),
  t(
    'origem-e-data',
    'A origem e a data de obtenção',
    'Quem confere precisa buscar o mesmo arquivo de novo.',
    [
      'O requisito 3 pede que você **declare a origem e a data de obtenção**. A origem diz quem forneceu, de que sistema saiu e com o que foi cruzado — o suficiente para outra pessoa ir buscar o mesmo arquivo.',
      'A data de obtenção é o dia em que o arquivo chegou às suas mãos. Ela é diferente do **período** dos dados: o questionário do sono fala de uma semana de agosto, e foi exportado em 2 de setembro. As duas datas aparecem juntas, e é fácil escrever a errada.',
      'A data importa porque a base muda. Uma família pode corrigir a resposta depois, e a sua análise continua sendo sobre a versão de setembro. Sem a data, ninguém sabe de que versão você fala.',
    ],
    '"Da tesouraria" não é origem: é um endereço sem rua. Diga de que formulário, respondido por quem, e quando.',
    ['data de obtenção', 'período dos dados'],
  ),
];

/* ── Módulo 3: a grafia ───────────────────────────────────────────────────── */

const A_GRAFIA: TopicoDeVereda[] = [
  t(
    'a-bruta-continua-bruta',
    'A bruta continua bruta',
    'Limpa-se numa cópia, porque a base como chegou é parte da entrega.',
    [
      'O requisito 9 pede a **base bruta** e a **base tratada** na entrega. Só consegue entregar a bruta quem nunca mexeu nela. Por isso o primeiro passo da limpeza é fazer uma cópia e trabalhar nela.',
      'No Excel isso é **Mover ou Copiar**, em Página Inicial › Células. A caixa **"Criar uma cópia" nasce desmarcada** — quem esquece de marcá-la só troca a aba de lugar e continua limpando o original.',
      'Depois, dê à cópia um nome que diga o que ela é. "Bruta (2)" é o nome que o Excel dá, e entregar a tratada com ele é entregar duas abas que se chamam bruta.',
    ],
    'A bruta não ganha nem uma conta ao lado. Uma CONT.VALORES escrita para conferir as linhas já a deixa de ser como chegou.',
    ['base bruta', 'criar uma cópia'],
    [
      [
        'Na aba Bruta, Página Inicial › Mover ou Copiar abre a caixa com "Criar uma cópia" desmarcada. Marque antes do OK.',
        'Caixa Mover ou Copiar destacada sobre a base do sono, com a opção mover para o final e a caixa Criar uma cópia marcada.',
      ],
      [
        'A cópia aparece ao lado com o nome que o Excel dá: Bruta (2). A Bruta original continua como chegou.',
        'Fileira de abas destacada no pé da planilha, com Bruta e Bruta (2), a cópia ativa.',
      ],
      [
        'Renomear Planilha troca o nome da cópia para Tratada — e é nela que toda a limpeza acontece.',
        'Fileira de abas destacada com Bruta e Tratada, depois de renomear a cópia.',
      ],
    ],
  ),
  t(
    'a-mesma-coisa-um-jeito-so',
    'A mesma coisa escrita de um jeito só',
    'Para a planilha, "jaguar", "JAGUAR" e "Jaguar" são três unidades.',
    [
      'Numa conta por unidade, cada jeito de escrever vira um grupo. O Jaguar aparece dividido em três pedaços, e a média de cada pedaço é de uma ou duas pessoas. Nada dá erro: a tabela só sai com grupos a mais.',
      '**Localizar e Substituir** conserta isso, e tem duas caixas que mudam tudo. "Diferenciar maiúsculas" desmarcada faz `jaguar` achar `JAGUAR` também — mas `falcao` **não** acha `Falcão`, porque o acento é outra letra. "Coincidir conteúdo da célula inteira" faz a troca valer só quando a célula inteira é aquilo.',
      'E o alcance: com uma célula só selecionada, o Excel procura na planilha inteira. Selecione a coluna antes — a régua de baixo da caixa diz onde ele vai procurar. Sem isso e sem a célula inteira, uma troca curta acerta o pedaço de um nome de pessoa, e a contagem de trocas parece exatamente a esperada.',
    ],
    'Depois de substituir, filtre a coluna e conte os valores diferentes. Seis unidades, seis valores.',
    ['localizar e substituir', 'célula inteira'],
    [
      [
        'Com a coluna B selecionada, Substituir troca "jaguar" por "Jaguar", com "célula inteira" marcada. A régua da caixa diz: dentro da seleção.',
        'Caixa Localizar e Substituir destacada com jaguar e Jaguar, Coincidir conteúdo da célula inteira marcada e a linha Dentro: a seleção B1:B70; a coluna B destacada com jaguar na linha 6.',
      ],
      [
        'Substituir tudo troca as duas grafias de uma vez: a Elisa Leite volta a ser do Jaguar.',
        'Célula B6 destacada com Jaguar, na linha da Elisa Leite, depois da troca.',
      ],
    ],
  ),
  t(
    'a-linha-repetida',
    'A linha repetida, e a pessoa com o mesmo nome',
    'Remover Duplicatas compara o que está escrito.',
    [
      'O questionário trouxe a Nina Oliveira duas vezes, a segunda com "aguia" e "fora do quarto" em minúsculas. **Dados › Remover Duplicatas** apaga linhas repetidas — mas compara o que está escrito, e antes de padronizar as duas linhas não são iguais. Rodado antes, ele responde que não há duplicata nenhuma.',
      'A ordem resolve: primeiro padronize a grafia, depois remova as duplicatas. Aí as duas linhas da Nina ficam idênticas, e a de baixo sai.',
      'A caixa abre com todas as colunas marcadas, e é assim que deve ficar. Desmarcar tudo menos o nome parece esperto e apaga gente: há **dois João Victor Alves** no clube, um no Jaguar e outro no Falcão, e são duas pessoas.',
    ],
    '"Nenhum valor duplicado" é uma resposta que ninguém confere duas vezes. Confira a contagem de linhas depois: aqui ficam 62 valores exclusivos.',
    ['remover duplicatas', 'homônimo'],
    [
      [
        'Com a grafia já arrumada, as duas linhas da Nina Oliveira estão iguais. Dados › Remover Duplicatas abre com todas as colunas marcadas.',
        'Caixa Remover Duplicatas destacada com as seis colunas marcadas, e as linhas 15 e 16 destacadas, as duas da Nina Oliveira, Águia, Fora do quarto.',
      ],
      [
        'OK apaga a de baixo: na linha 16 agora está o Otávio Barreto, e os 62 respondentes ficam uma vez cada.',
        'Linhas 15 e 16 destacadas depois do OK, com Nina Oliveira e Otávio Barreto.',
      ],
    ],
  ),
];

/* ── Módulo 4: números, impossíveis e ausências ───────────────────────────── */

const OS_NUMEROS: TopicoDeVereda[] = [
  t(
    'numero-guardado-como-texto',
    'Número guardado como texto',
    '"4 h" e "3.5" encostam à esquerda, e a média os pula.',
    [
      'A planilha só soma o que é número. "4 h" e "4h" têm letra, e "3.5" tem ponto no lugar da vírgula — em português, o ponto só vale como separador de milhar. Os três ficam guardados como **texto**.',
      'Texto encosta à esquerda na célula, e a MÉDIA o pula sem avisar. A conta sai plausível, e sobre menos gente do que a base tem. Selecione a coluna e olhe a régua do Excel embaixo: a **Contagem** conta toda célula preenchida, e a **Média** e a **Soma**, só os números.',
      'Para consertar, selecione **só os números** da coluna, da segunda linha até a última, e use Substituir: o " h" e o "h" por nada, e o ponto pela vírgula. Só os números, porque o cabeçalho "Tela (h por dia)" também tem "h" — e selecionando pela letra da coluna ele vai junto.',
    ],
    'Substituir dentro da seleção, e nunca na planilha inteira: o nome de alguém pode ter a letra que você está tirando.',
    ['número como texto', 'contagem na régua'],
    [
      [
        'Selecionada a coluna da tela, a régua diz Contagem 60 e Soma 250: quatro células têm "4 h", "4h", "3.5" e "2.5", que a soma pulou.',
        'Coluna Tela com 4 h e 3.5 encostados à esquerda nas linhas 4 e 11, destacada, e a régua de status destacada com Média 4,46, Contagem 60 e Soma 250.',
      ],
      [
        'Depois de tirar o " h" e o "h" e trocar o ponto pela vírgula, a Contagem continua 60 e a Soma passa a 264: as horas que eram texto entraram na conta.',
        'A mesma coluna destacada, agora com 4 e 3,50 à direita, e a régua destacada com Média 4,40, Contagem 60 e Soma 264.',
      ],
    ],
  ),
  t(
    'valor-impossivel',
    'O valor impossível, com evidência e sem',
    'Corrige-se o que tem evidência; o resto vira ausência.',
    [
      'O Emanuel Macedo aparece com **35 horas de tela por dia** — num dia que tem 24. A planilha lê 35 como número, e é o único defeito da base que ela aceita sem reclamar: a média da tela sobe sem nenhuma célula com cara de errada.',
      'Esse valor tem evidência do certo: o questionário de papel da família diz "três e meia", e quem digitou esqueceu a vírgula. O certo é **3,5**, e você pode corrigir.',
      'A Elisa Prates aparece com **21 anos**. Pode ser 11, pode ser 12 — os dois algarismos podem ter trocado de lugar — e nada na base diz qual. Sem evidência, a célula fica **vazia**, e a linha fica: o sono e a tela dela valem. Adivinhar 12 seria inventar um dado com cara de dado.',
    ],
    'Ache os impossíveis olhando os extremos: classifique a coluna, ou peça o MÁXIMO, e pergunte se aquele número pode existir.',
    ['valor impossível', 'evidência'],
    [
      [
        'Com o cursor na coluna da tela, Dados › Classificar de Z a A leva o maior para cima: 35 horas por dia, na linha do Emanuel Macedo.',
        'Linha 2 destacada depois de classificar a tela em ordem decrescente, com Emanuel Macedo, Onça, 11 anos, No quarto, 35 horas de tela.',
      ],
      [
        'Classificando a idade do mesmo jeito, o topo é a Elisa Prates com 21 anos — impossível num clube de desbravadores, e sem nada dizendo qual era o certo.',
        'Linha 2 destacada depois de classificar a idade em ordem decrescente, com Elisa Prates, Tucano, 21 anos.',
      ],
    ],
  ),
  t(
    'a-ausencia',
    'O que falta não se inventa',
    'Três famílias não responderam. A linha fica, e o valor fica em branco.',
    [
      'Letícia Aragão, Heloísa Neves e Pietra Macedo não têm celular, tela nem sono: as famílias não responderam ao questionário. O nome, a unidade e a idade delas estão na base e valem.',
      'Há dois atalhos, e os dois estragam. **Excluir as linhas** derruba a base de 62 para 59 — abaixo dos sessenta do requisito. **Preencher com a média** inventa três tempos de tela iguais que ninguém mediu, e deixa a reta mais confiante do que o dado.',
      'O certo é deixar as células em branco. As funções da planilha pulam o vazio: a média do sono passa a ser de quem respondeu, que é o que ela de fato é — e o relatório diz isso.',
    ],
    'Ausência documentada não é defeito: é o que o diário de limpeza existe para contar.',
    ['ausência', 'não inventar'],
  ),
  t(
    'o-diario-de-limpeza',
    'O diário de limpeza',
    'Cada decisão por escrito: o que você fez, e por quê.',
    [
      'O requisito 4 pede para **documentar por escrito cada decisão de limpeza**. Quem abrir a base tratada no ano que vem precisa saber o que mudou da bruta para ela — e por quê.',
      'Uma decisão tem duas metades. O que se fez: "troquei jaguar e JAGUAR por Jaguar, só na coluna Unidade". E por quê: "para a conta por unidade não separar a mesma unidade em três".',
      'Uma decisão por problema e por coluna. A tela e a idade tiveram valores impossíveis tratados de jeitos diferentes, e é exatamente isso que quem ler precisa saber: por que um foi corrigido e o outro não.',
    ],
    '"Arrumei a base" não é decisão. É o resumo que não deixa ninguém refazer o caminho.',
    ['documentar a decisão', 'diário'],
  ),
];

/* ── Módulo 5: as medidas ─────────────────────────────────────────────────── */

const AS_MEDIDAS: TopicoDeVereda[] = [
  t(
    'medidas-sobre-a-tratada',
    'As medidas, sobre a tratada',
    'Média, mediana e desvio das duas variáveis da pergunta.',
    [
      'O requisito 5.1 pede **medidas descritivas das variáveis principais**. Principais são as da pergunta: o sono, que é o que se quer explicar, e o tempo de tela, que é a suspeita. Medir todas as colunas da base transforma o relatório numa tabela que ninguém lê.',
      'Escreva as contas numa aba própria, apontando para a **tratada**: `=MÉDIA(Tratada!F2:F63)`. O sono médio é **8,41** horas por noite, a mediana é **8,5**, e o desvio padrão é **0,89**. O desvio é DESVPADP, com P, porque a base é o clube inteiro.',
      'Apontar para a bruta é o erro que mais engana: com o 35 lá dentro e a Nina contada duas vezes, a média da tela sai maior, e nada na célula diz de que aba ela veio.',
    ],
    'Fórmula que lê a outra aba começa pelo nome dela e uma exclamação: Tratada!F2.',
    ['medidas descritivas', 'aba tratada'],
    [
      [
        'Na aba Cálculos, as seis medidas leem a tratada: a tela tem média 3,87, mediana 3,50 e desvio 1,84; o sono, 8,41, 8,50 e 0,89.',
        'Bloco A2 a B7 da aba Cálculos destacado com as seis medidas, e a barra de fórmulas destacada com =MÉDIA(Tratada!F2:F63).',
      ],
    ],
  ),
  t(
    'media-ou-mediana',
    'Média ou mediana, para o tempo de tela típico',
    'Quando poucos estão muito acima, a média anda para o lado deles.',
    [
      'O tempo de tela médio é **3,87 horas** por dia, e a mediana é **3,5 horas**. Metade do clube usa a tela 3,5 horas ou menos — e a média diz 3,87 porque uns poucos passam de 9 horas e puxam a conta para cima.',
      'Quando os valores se espalham de um lado só, a **mediana** descreve melhor quem está no meio. A média continua certa como conta, e erra como resumo.',
      'No sono as duas ficam perto — 8,41 e 8,5 —, e qualquer uma serve. É comparando as duas que se sabe qual usar.',
    ],
    'Média muito maior que a mediana é o sinal de que alguns valores altos estão puxando a conta.',
    ['média e mediana', 'assimetria'],
    [
      [
        'Lado a lado, a média da tela dá 3,87 e a mediana, 3,50: os poucos que passam de 9 horas puxam a média, e a mediana fica onde está quem está no meio.',
        'Células A2 a B3 da aba Cálculos destacadas com Tela média 3,87 e Tela mediana 3,50, e a barra de fórmulas destacada com =MED(Tratada!E2:E63).',
      ],
    ],
  ),
];

/* ── Módulo 6: os grupos ──────────────────────────────────────────────────── */

const OS_GRUPOS: TopicoDeVereda[] = [
  t(
    'a-media-de-cada-grupo',
    'A média de cada grupo, sem MÉDIASE',
    'A soma do grupo dividida pela quantidade dele.',
    [
      'O requisito 5.2 pede a **comparação entre, no mínimo, dois grupos**. Aqui os grupos são onde o celular fica à noite: no quarto, fora do quarto, e quem não tem celular.',
      'Esta planilha não tem MÉDIASE, e é a mesma conta da CC-ES009: `CONT.SE` conta quantos há no grupo, e `SOMASE` soma a coluna que interessa só para aquele grupo. A média é a soma dividida pela contagem.',
      'Quem não respondeu ao questionário não tem o celular escrito, e por isso não entra na soma nem na contagem de grupo nenhum — a conta continua certa. Os três grupos somam 59, que é quem respondeu.',
    ],
    'Escreva a primeira linha com cifrão no intervalo — $D$2:$D$63 — e arraste para baixo. Sem o cifrão, o intervalo desce junto e a última linha conta metade do clube.',
    ['comparar grupos', 'SOMASE e CONT.SE'],
    [
      [
        'Na aba Grupos, CONT.SE conta cada grupo e SOMASE dividido pela contagem dá as médias: no quarto são 28, com 4,29 h de tela e 7,75 h de sono; fora do quarto, 27, com 3,87 e 8,91; sem celular, 4, com 1 e 9,63.',
        'Tabela A1 a D4 da aba Grupos destacada, e a barra de fórmulas destacada com =SOMASE(Tratada!$D$2:$D$63;A2;Tratada!$F$2:$F$63)/B2.',
      ],
    ],
  ),
  t(
    'o-que-a-comparacao-mostra',
    'O que a comparação mostra',
    'No quarto e fora do quarto, a tela é parecida, e o sono é muito diferente.',
    [
      'Quem dorme com o celular no quarto usa a tela, em média, **4,29 horas** por dia; quem o deixa fora do quarto, **3,87** — menos de meia hora de diferença. E o sono é **7,75** horas para o primeiro grupo e **8,91** para o segundo: mais de uma hora por noite.',
      'É essa comparação que muda a conversa. Se fosse só o tempo de tela, os dois grupos dormiriam parecido. Não dormem — e o que os separa é onde o celular passa a noite.',
      'O grupo sem celular tem o maior sono, e tem **quatro pessoas**. Uma que durma pouco muda a média inteira, e por isso ele não sustenta conclusão nenhuma. Média de grupo pequeno se mostra, e não se usa para decidir.',
    ],
    'Antes de comparar médias, olhe o tamanho de cada grupo. Quatro pessoas não pesam o mesmo que vinte e oito.',
    ['grupo pequeno', 'comparação'],
  ),
];

/* ── Módulo 7: a relação ──────────────────────────────────────────────────── */

const A_RELACAO: TopicoDeVereda[] = [
  t(
    'a-dispersao-da-base-inteira',
    'A dispersão, com a base inteira',
    'Cada ponto é uma pessoa: a tela de um lado, o sono do outro.',
    [
      'O requisito 5.3 pede **uma relação entre duas variáveis, com gráfico de dispersão e linha de tendência**. É a mecânica da CC-ES010, agora sobre a base que você limpou.',
      'Selecione as duas colunas inteiras da tratada — a tela e o sono, que ficam lado a lado — e insira uma dispersão. Os 59 que responderam viram 59 pontos; os três sem resposta ficam de fora sozinhos, porque ponto precisa dos dois números.',
      'Depois, nos elementos do gráfico, marque **Linha de Tendência** e **Exibir Equação**. A nuvem desce da esquerda para a direita, e a reta também: a correlação é **-0,71**.',
    ],
    'Selecionar só uma parte das linhas desenha uma nuvem plausível sobre metade do clube.',
    ['dispersão', 'linha de tendência'],
    [
      [
        'Com E1 a F63 selecionadas, Inserir › Gráfico com a dispersão escolhida, a pergunta no título e o nome de cada eixo.',
        'Caixa Inserir Gráfico destacada com Dados de E1:F63, Tipo Dispersão, Título Quem usa mais tela dorme menos?, Tela por dia (h) e Sono por noite (h).',
      ],
      [
        'No gráfico, Linha de Tendência e Exibir Equação marcadas: a reta desce, e a equação aparece ao lado dela.',
        'Gráfico de dispersão destacado sobre a planilha, com a nuvem de pontos, a reta de tendência descendo e as caixas Linha de Tendência e Exibir Equação no gráfico marcadas.',
      ],
    ],
  ),
  t(
    'o-que-a-relacao-nao-prova',
    'O que a relação não prova',
    'Quem usa mais tela dorme menos — e quem usa mais tela também dorme com o celular no quarto.',
    [
      'Uma correlação de -0,71 é forte: quem passa mais tempo na tela tende a dormir menos. Isso **não prova** que a tela é a causa.',
      'Quem usa mais tela também é quem mais dorme com o celular no quarto, e o celular no quarto pode ser o problema — a notificação de madrugada, a luz da tela antes de dormir. A comparação de grupos já mostrou isso: fora do quarto, a tela é quase a mesma e o sono é muito maior.',
      'É a correlação espúria da CC-ES010 do lado da decisão. Se a causa fosse o tempo de tela, a saída seria proibir o celular. Se for onde ele dorme, uma campanha de celular fora do quarto resolve — e a recomendação muda inteira.',
    ],
    'Antes de escrever a conclusão, pergunte: que outra coisa anda junto com o tempo de tela?',
    ['correlação e causa', 'outra explicação'],
  ),
];

/* ── Módulo 8: o painel ───────────────────────────────────────────────────── */

const O_PAINEL: TopicoDeVereda[] = [
  t(
    'cada-grafico-uma-pergunta',
    'Cada gráfico responde a uma pergunta',
    'O título é a pergunta, escrita como pergunta.',
    [
      'O requisito 6 pede **painel ou relatório com, no mínimo, quatro gráficos, cada um respondendo a uma pergunta declarada expressamente**. Declarada quer dizer escrita — e o lugar dela é o título.',
      '"Sono por unidade" é um assunto. "Alguma unidade dorme menos que as outras?" é uma pergunta, e quem olha o gráfico sabe o que procurar nele. As quatro perguntas são diferentes: dois gráficos para a mesma pergunta ocupam lugar e não dizem nada novo.',
      'Gráfico sobre faixa vazia conta como gráfico e não mostra nada. Confira que cada um desenhou.',
    ],
    'Escreva a pergunta antes de escolher o tipo. O tipo sai da pergunta, e não o contrário.',
    ['painel', 'pergunta no título'],
  ),
  t(
    'o-tipo-que-responde',
    'O tipo que responde',
    'Linha é para tempo; pizza é para partes de um todo.',
    [
      'São as regras da CC-ES009, e valem aqui igual. **Colunas** comparam: qual é maior que qual. **Dispersão** relaciona duas medidas. **Pizza** mostra de que o todo é feito — e só quando as partes somam o todo.',
      '**Linha** mostra evolução ao longo do tempo, e esta base não tem tempo: ligar o Falcão ao Tucano com um traço afirma que um virou o outro.',
      'A pizza das médias de sono por unidade sai com fatias perfeitamente plausíveis de um todo que não existe — média não soma. A pizza de **quantos** deixam o celular em cada lugar soma o clube, e responde.',
    ],
    'Gráfico errado não dá erro. Ele desenha certinho uma coisa que não quer dizer nada.',
    ['tipo de gráfico', 'pizza de contagem'],
  ),
];

/* ── Módulo 9: a conclusão ────────────────────────────────────────────────── */

const A_CONCLUSAO: TopicoDeVereda[] = [
  t(
    'tres-partes-duas-paginas',
    'Três partes, em duas páginas',
    'O que os dados mostram, o que não permitem afirmar, e o que recomendar.',
    [
      'O requisito 7 pede uma conclusão de **no máximo duas páginas** com três partes: o que os dados mostram, o que **não permitem afirmar**, e uma recomendação prática ao clube.',
      'Duas páginas é o limite, e não a meta. A primeira versão costuma recontar a limpeza inteira — e ela já está no diário, que vai junto no relatório. O que fica na conclusão é o que muda a decisão.',
      'O que os dados mostram vem **com os números**. "Quem usa celular dorme pouco" é uma impressão; "quem dorme com o celular no quarto dorme 7,75 horas, e quem o deixa fora, 8,91" é um resultado.',
    ],
    'Uma página tem perto de 450 palavras. Conte antes de entregar.',
    ['duas páginas', 'três partes'],
  ),
  t(
    'o-que-nao-permitem-afirmar',
    'O que os dados não permitem afirmar',
    'A parte que quase ninguém escreve, e a que mais protege quem decide.',
    [
      'Toda base tem um limite, e escrever esse limite é o que impede quem decide de pedir à análise mais do que ela pode dar.',
      'Nesta base: é **uma semana só**; **três famílias** não responderam; as horas são **as que a família estimou**, e não medidas por relógio nenhum; e a relação **não prova causa**.',
      'A recomendação vem depois disso, e diz **quem faz o quê**. "O clube deveria cuidar do sono" não tem dono, e ninguém a cumpre. "Que a diretoria proponha às famílias o celular fora do quarto, e que a secretaria repita o questionário em novembro" se aprova, se faz e se confere.',
    ],
    'Escrever o limite não enfraquece a conclusão. É o que faz quem decide confiar no resto.',
    ['limites da base', 'recomendação prática'],
  ),
];

/* ── Módulo 10: a apresentação ────────────────────────────────────────────── */

const A_APRESENTACAO: TopicoDeVereda[] = [
  t(
    'dez-minutos-para-quem-decide',
    'Dez minutos para quem decide',
    'A pergunta, o painel, a recomendação, e tempo para perguntarem.',
    [
      'O requisito 8 pede apresentar o resultado **em até dez minutos** a público real do clube — diretoria, unidade ou conselho. Público real quer dizer gente que pode decidir alguma coisa com a recomendação.',
      'O roteiro que todo mundo escreve primeiro gasta seis minutos contando a limpeza. É trabalho de verdade, e quem decide não precisa dele: precisa da pergunta, do painel, da recomendação e de **tempo para perguntar**. A limpeza cabe em um minuto, e o diário vai junto para quem quiser ler.',
      'É a regra da CC-ES011, do outro lado: a fala carrega o que o slide não diz, e o slide não carrega a fala.',
    ],
    'A família em casa ouve com gosto e não decide nada no clube. Ensaie com ela; apresente para quem decide.',
    ['dez minutos', 'público real'],
  ),
  t(
    'registrar-a-decisao',
    'Registrar a decisão, ou a reação',
    'O que aconteceu, e não o que se esperava.',
    [
      'Depois de apresentar, o requisito pede **registrar por escrito a decisão tomada ou a reação obtida**: quando foi, quem estava, e o que disseram.',
      'O registro é do que aconteceu. "A diretoria aprovou a campanha com as famílias e pediu o questionário de novembro para comparar" é decisão. "Vão pensar até a próxima reunião" também é registro — e diz que a recomendação ainda não virou decisão.',
      'Escreva com as palavras de quem decidiu, e no mesmo dia. Uma semana depois, a lembrança já virou o que você queria que eles tivessem dito.',
    ],
    'Reação negativa também se registra. Ela é o resultado do projeto tanto quanto um sim.',
    ['registro da decisão', 'reação'],
  ),
];

/* ── Módulo 11: a entrega ─────────────────────────────────────────────────── */

const A_ENTREGA: TopicoDeVereda[] = [
  t(
    'tres-entregaveis',
    'A bruta, a tratada e o relatório, juntos',
    'Num repositório compartilhado, e só os três.',
    [
      'O requisito 9 pede entregar ao examinador **a base bruta, a base tratada e o relatório final**, mantidos em repositório compartilhado — uma pasta na nuvem, compartilhada com quem examina.',
      'Só os três. O rascunho dos gráficos e a foto da reunião são seus, e não da entrega: quem confere não deveria ter de adivinhar qual arquivo vale.',
      'E a bruta é a que **ninguém editou**. Quem baixa o mesmo anexo duas vezes fica com duas cópias de mesmo nome; se uma delas foi aberta e mexida, ela já não é bruta. O **histórico de versões** diz qual é qual: quem escreveu cada versão, e quando.',
    ],
    'Abra o histórico das duas cópias antes de escolher. A data da última alteração já dá a pista.',
    ['entrega', 'histórico de versões'],
    [
      [
        'O histórico de "questionario_sono_2026 (1)" mostra duas versões: a da Marta, em 2 de setembro, e uma sua, dois dias depois. Essa cópia foi mexida, e não é a bruta.',
        'Caixa Histórico de versões destacada, com 04/09/2026, versão atual, por Você, e 02/09/2026 por Marta.',
      ],
    ],
  ),
  t(
    'compartilhar-para-conferir',
    'Compartilhar para conferir',
    'Quem examina lê; não edita. E o link fica restrito.',
    [
      'O examinador precisa ver os três arquivos — e não mexer neles. Compartilhe a pasta como **leitor** ou **comentarista**: editor pode mudar uma célula da bruta sem querer, e aí ela deixa de ser a prova do que chegou.',
      'Compartilhar a pasta alcança o que está dentro, como a CC-ES006 ensinou: não é preciso compartilhar arquivo por arquivo.',
      'E o acesso geral fica **Restrito**. A base tem o nome e o sono de sessenta e duas crianças do clube, e "qualquer pessoa com o link" é qualquer pessoa — inclusive quem recebeu o link encaminhado por alguém que você nem conhece.',
    ],
    'Na caixa de compartilhar, a lista de nomes e o acesso geral são duas coisas. Confira as duas.',
    ['leitor e editor', 'link restrito'],
    [
      [
        'A pasta do projeto compartilhada com a Liderança como Leitor, e o acesso geral em Restrito: só quem está na lista abre.',
        'Caixa Compartilhar «Projeto de dados — tela e sono» destacada, com Você proprietário, Liderança leitor e o acesso geral Restrito.',
      ],
    ],
  ),
];

/* ── Os onze módulos ─────────────────────────────────────────────────────── */

const Q = QUESTOES_DO_PROJETO_DE_DADOS;

export const MODULOS_DO_PROJETO_DE_DADOS: ModuloDeVereda[] = [
  {
    id: 'm1', titulo: 'A pergunta vem antes do dado',
    resumo: 'A proposta, aprovada antes de abrir qualquer base.',
    licoes: [
      {
        id: 'm1-teoria', tipo: 'teoria', questoes: Q['m1-teoria'], perguntas: 4,
        titulo: 'Pergunta, origem e quem decide',
        resumo: 'O que a proposta precisa dizer antes de o dado existir.',
        topicos: A_PROPOSTA,
      },
      {
        id: 'm1-lab', tipo: 'projeto-de-dados', licao: 'proposta',
        titulo: 'Escrevendo a proposta do projeto',
        resumo: 'E descobrindo o que custa abrir a base antes da aprovação.',
        verificacoes: ['proposta-pergunta', 'proposta-quem-decide', 'proposta-aprovada-antes'],
      },
    ],
  },
  {
    id: 'm2', titulo: 'A base que responde',
    resumo: 'Sessenta registros, cinco campos, e a pergunta na mesma linha.',
    licoes: [
      {
        id: 'm2-teoria', tipo: 'teoria', questoes: Q['m2-teoria'], perguntas: 4,
        titulo: 'Escolher a base e declarar de onde ela veio',
        resumo: 'Tamanho, pergunta, origem e as duas datas que se confundem.',
        topicos: A_BASE,
      },
      {
        id: 'm2-lab', tipo: 'projeto-de-dados', licao: 'base',
        titulo: 'Escolhendo a base e preenchendo a ficha',
        resumo: 'Quatro arquivos ao alcance, e um que serve.',
        verificacoes: ['base-que-serve', 'origem-declarada', 'data-de-obtencao'],
      },
    ],
  },
  {
    id: 'm3', titulo: 'A mesma coisa escrita de um jeito só',
    resumo: 'Limpar numa cópia, padronizar a grafia e tirar a linha repetida.',
    licoes: [
      {
        id: 'm3-teoria', tipo: 'teoria', questoes: Q['m3-teoria'], perguntas: 4,
        titulo: 'A bruta, a cópia e a grafia',
        resumo: 'Mover ou Copiar, Localizar e Substituir, Remover Duplicatas.',
        topicos: A_GRAFIA,
      },
      {
        id: 'm3-lab', tipo: 'projeto-de-dados', licao: 'grafia',
        titulo: 'Limpando a grafia numa cópia',
        resumo: 'Sem estragar o Pedro Aguiar, e sem apagar uma das Anas.',
        verificacoes: ['copia-com-nome', 'unidades-padronizadas', 'transporte-padronizado', 'sem-repetida', 'diario-da-grafia'],
      },
    ],
  },
  {
    id: 'm4', titulo: 'Números, impossíveis e ausências',
    resumo: 'O que a média pula, o que não existe, e o que falta.',
    licoes: [
      {
        id: 'm4-teoria', tipo: 'teoria', questoes: Q['m4-teoria'], perguntas: 4,
        titulo: 'Consertar, corrigir com evidência, e não inventar',
        resumo: 'Número como texto, valor impossível, ausência e o diário.',
        topicos: OS_NUMEROS,
      },
      {
        id: 'm4-lab', tipo: 'projeto-de-dados', licao: 'numeros',
        titulo: 'Consertando números e decidindo o que falta',
        resumo: 'E escrevendo no diário por que cada decisão foi tomada.',
        verificacoes: ['texto-virou-numero', 'impossiveis-tratados', 'ausencias-de-pe', 'diario-dos-numeros'],
      },
    ],
  },
  {
    id: 'm5', titulo: 'As medidas de quem está no meio',
    resumo: 'Média, mediana e desvio das variáveis da pergunta.',
    licoes: [
      {
        id: 'm5-teoria', tipo: 'teoria', questoes: Q['m5-teoria'], perguntas: 4,
        titulo: 'Medidas sobre a tratada',
        resumo: 'E quando a mediana descreve melhor que a média.',
        topicos: AS_MEDIDAS,
      },
      {
        id: 'm5-lab', tipo: 'projeto-de-dados', licao: 'descritivas',
        titulo: 'As medidas da presença e da distância',
        resumo: 'Seis contas, todas lendo a tratada.',
        verificacoes: ['medidas-da-presenca', 'medidas-da-distancia', 'medida-tipica'],
      },
    ],
  },
  {
    id: 'm6', titulo: 'Comparando grupos',
    resumo: 'Quem chega de cada jeito, e quanto falta cada grupo.',
    licoes: [
      {
        id: 'm6-teoria', tipo: 'teoria', questoes: Q['m6-teoria'], perguntas: 4,
        titulo: 'A média de cada grupo',
        resumo: 'SOMASE dividido por CONT.SE, e o grupo pequeno demais.',
        topicos: OS_GRUPOS,
      },
      {
        id: 'm6-lab', tipo: 'projeto-de-dados', licao: 'grupos',
        titulo: 'A presença de quem chega de cada jeito',
        resumo: 'Carona e ônibus, na mesma distância.',
        verificacoes: ['quantos-por-grupo', 'medias-por-grupo', 'comparacao-escrita'],
      },
    ],
  },
  {
    id: 'm7', titulo: 'Duas medidas que andam juntas',
    resumo: 'A dispersão da distância com a presença, e o que ela não prova.',
    licoes: [
      {
        id: 'm7-teoria', tipo: 'teoria', questoes: Q['m7-teoria'], perguntas: 4,
        titulo: 'A relação, e outra explicação',
        resumo: 'A reta, o r, e a variável que anda junto.',
        topicos: A_RELACAO,
      },
      {
        id: 'm7-lab', tipo: 'projeto-de-dados', licao: 'relacao',
        titulo: 'A distância e a presença na mesma nuvem',
        resumo: 'Com a reta, a equação e a correlação.',
        verificacoes: ['dispersao-da-base', 'reta-e-equacao', 'correlacao-calculada', 'relacao-lida'],
      },
    ],
  },
  {
    id: 'm8', titulo: 'Um painel de perguntas',
    resumo: 'Quatro gráficos, cada um com a pergunta que ele responde.',
    licoes: [
      {
        id: 'm8-teoria', tipo: 'teoria', questoes: Q['m8-teoria'], perguntas: 4,
        titulo: 'A pergunta no título, e o tipo que responde',
        resumo: 'Colunas, dispersão, pizza — e por que não linha.',
        topicos: O_PAINEL,
      },
      {
        id: 'm8-lab', tipo: 'projeto-de-dados', licao: 'painel',
        titulo: 'Quatro gráficos, quatro perguntas',
        resumo: 'E nenhuma pizza de médias.',
        verificacoes: ['quatro-graficos', 'cada-um-uma-pergunta', 'cada-tipo-responde'],
      },
    ],
  },
  {
    id: 'm9', titulo: 'A conclusão em duas páginas',
    resumo: 'O que mostram, o que não permitem, e quem faz o quê.',
    licoes: [
      {
        id: 'm9-teoria', tipo: 'teoria', questoes: Q['m9-teoria'], perguntas: 4,
        titulo: 'Três partes, e o limite da base',
        resumo: 'A parte que quase ninguém escreve, e a recomendação com dono.',
        topicos: A_CONCLUSAO,
      },
      {
        id: 'm9-lab', tipo: 'projeto-de-dados', licao: 'conclusao',
        titulo: 'Reescrevendo a conclusão',
        resumo: 'Do rascunho de três páginas para duas que decidem.',
        verificacoes: ['tres-partes-em-duas-paginas', 'mostram-com-numero', 'o-que-nao-permitem', 'recomendacao-pratica'],
      },
    ],
  },
  {
    id: 'm10', titulo: 'Dez minutos para quem decide',
    resumo: 'O roteiro, o público, e o registro do que aconteceu.',
    licoes: [
      {
        id: 'm10-teoria', tipo: 'teoria', questoes: Q['m10-teoria'], perguntas: 4,
        titulo: 'Apresentar e registrar',
        resumo: 'O que cabe em dez minutos, e o que se escreve depois.',
        topicos: A_APRESENTACAO,
      },
      {
        id: 'm10-lab', tipo: 'projeto-de-dados', licao: 'apresentacao',
        titulo: 'O roteiro e o registro da decisão',
        resumo: 'Da limpeza em seis minutos para a recomendação com tempo.',
        verificacoes: ['cabe-em-dez-minutos', 'publico-que-decide', 'registro-da-decisao'],
      },
    ],
  },
  {
    id: 'm11', titulo: 'A entrega',
    resumo: 'A bruta, a tratada e o relatório, numa pasta compartilhada.',
    licoes: [
      {
        id: 'm11-teoria', tipo: 'teoria', questoes: Q['m11-teoria'], perguntas: 4,
        titulo: 'O que se entrega, e para quem ler',
        resumo: 'Os três arquivos, a bruta que ninguém editou, e o link restrito.',
        topicos: A_ENTREGA,
      },
      {
        id: 'm11-lab', tipo: 'projeto-de-dados', licao: 'entrega',
        titulo: 'Bruta, tratada e relatório na pasta do projeto',
        resumo: 'E o histórico de versões, que diz qual bruta é bruta.',
        verificacoes: ['entregaveis-na-pasta', 'bruta-nunca-editada', 'compartilhada-para-conferir'],
      },
    ],
  },
];
