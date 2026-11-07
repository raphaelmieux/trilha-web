import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DO_PROJETO } from './questoesDoProjeto';
import { telasDoTopico } from './telas';

/*
 * A vereda CC-ES012 Projeto Documental.
 *
 * ── O que ela é ─────────────────────────────────────────────────────────
 * A vereda de integração. Ela não ensina programa nenhum: as cinco peças que
 * o requisito 3 pede já foram ensinadas, cada uma na vereda que o requisito 1
 * exige antes desta — o documento com estilos e sumário é a CC-ES002, a
 * planilha que calcula é a CC-ES003, o dossiê pesquisável é a CC-ES004, o
 * formulário é a CC-ES008, a apresentação é a CC-ES011.
 *
 * O que ela ensina é o que nenhuma delas podia ensinar sozinha: que **as
 * cinco são um conjunto**, e que um conjunto tem uma fonte da verdade. Toda
 * a matéria daqui é feita de conjuntos que funcionam — cinco arquivos soltos
 * na mesma pasta abrem bonitos, o total digitado está certo no dia em que foi
 * escrito, o dossiê gerado antes da mudança imprime perfeitamente, e a pasta
 * com acesso a mais não acusa nada.
 *
 * ── Por que as peças chegam quase prontas ───────────────────────────────
 * Produzi-las é o que as veredas do requisito 1 mediram, uma a uma, e repetir
 * a tarefa aqui mediria de novo o que já foi medido — é a decisão do módulo 6
 * da CC-ES004, escrita lá. O que falta em cada peça é o que a faz parte de um
 * conjunto.
 *
 * ── E o que ela não confere ─────────────────────────────────────────────
 * O requisito 8 pede apresentar ao examinador em até quinze minutos. Isso
 * acontece fora do aplicativo, e a plataforma não confere nada da fala: o que
 * ela faz é **preparar** — mostra as cinco peças de uma vez, com o número que
 * cada uma está dizendo e de onde ele devia vir, para a pessoa ensaiar a
 * demonstração com o próprio conjunto na frente.
 *
 * ── O exemplo é a tela, e o conjunto fotografado é outro ────────────────
 * A vereda nasceu com um quadro de texto em cada tópico, e o quadro era o da
 * própria feira que o laboratório monta: a seção "Onde está cada peça"
 * escrita por inteiro, os quatro nomes de pasta errados, o 240 digitado, o
 * "seis" e o "5 ou 6" que chegam no campo de texto. Era o gabarito das lições
 * desenhado em fonte de máquina de escrever.
 *
 * Os tópicos que ensinam um gesto o mostram nas janelas do laboratório, com o
 * conjunto do Dia de Portas Abertas (`src/exemplos/conjuntoDasPortas.ts`), e
 * os cinco que só existem na proposta, no critério e na demonstração — tela
 * da plataforma, e não programa — ficam em prosa.
 * `exemplosDoProjetoDocumental.test.ts` confere as legendas pelo motor.
 */

const V = 'CC-ES012';
const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], atencao: string, marcas: string[],
  telas?: [legenda: string, descricao: string][],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, atencao, marcas,
  ...(telas ? { telas: telasDoTopico(V, id, telas) } : {}),
});

/* ── Módulo 1: a proposta ─────────────────────────────────────────────────── */

const A_PROPOSTA: TopicoDeVereda[] = [
  t(
    'a-proposta-vem-antes',
    'A proposta é aprovada antes de o conjunto existir',
    'Proposta aprovada depois é proposta que ninguém podia mudar.',
    [
      'O requisito 2 pede uma proposta escrita, aprovada pelo examinador, e diz com todas as letras que a execução **não pode ser iniciada** antes da aprovação. Não é formalidade: é o único momento em que alguém de fora ainda pode mudar o rumo do trabalho.',
      'Quem monta o conjunto inteiro e só então pede aprovação recebe um sim — porque a essa altura não há mais o que discutir. O examinador olha cinco peças prontas e a única resposta possível é concordar. O que se perdeu foi a conversa.',
      'A proposta responde a quatro perguntas: qual necessidade do clube o conjunto atende, para quem ele é, quais peças ele vai ter, e **o que vai contar como pronto**. As três primeiras todo mundo escreve.',
    ],
    'Necessidade real quer dizer que alguém do clube já sofre com ela hoje. "Organizar os documentos" é um desejo permanente: nunca está pronto, e por isso não se aprova nem se avalia.',
    ['proposta escrita', 'aprovação prévia'],
  ),
  t(
    'o-que-conta-como-pronto',
    'O que vai contar como pronto é a pergunta que ninguém escreve',
    'E é a única que dá ao examinador como dizer que o conjunto acabou.',
    [
      'Sem ela, a aprovação é de uma intenção. "Vou fazer um conjunto documental para o Dia de Portas Abertas" pode acabar em cinco arquivos lindos ou em três pela metade, e as duas coisas cumprem a frase.',
      'Escrever o que conta como pronto obriga a imaginar o conjunto funcionando. Nesta vereda a resposta tem nome: o conjunto está pronto quando uma inscrição nova aparece **sozinha** nas outras peças. É o requisito 8 escrito como critério de aceitação, antes de começar.',
      'Quem escreve isso na proposta já sabe, no primeiro dia, que vai precisar de vínculo entre as peças — e não descobre no último.',
    ],
    'O critério não precisa ser difícil. Ele precisa ser verificável: alguém de fora tem de poder olhar e dizer sim ou não.',
    ['o que conta como pronto', 'critério de aceitação'],
  ),
];

/* ── Módulo 2: o documento do conjunto ────────────────────────────────────── */

const O_DOCUMENTO: TopicoDeVereda[] = [
  t(
    'o-conjunto-tem-uma-cara',
    'Cinco peças com cinco caras parecem cinco projetos',
    'Uma fonte de título, uma de corpo e uma cor, repetidas nas cinco.',
    [
      'O requisito 3.6 pede aparência coerente entre todas as peças, e o custo de não ter é invisível de dentro: cada arquivo abre bonito. Quem recebe os cinco é que não tem como saber que eles são do mesmo trabalho.',
      'Coerência aqui é pouca coisa, e é combinada uma vez: duas fontes — uma para título, outra para corpo — e uma cor. Duas fontes, e não uma, porque título e corpo têm trabalhos diferentes: um chama, o outro se lê de perto.',
      'Cada programa guarda essa decisão no lugar dele. O documento guarda no **estilo**; a apresentação, no **slide mestre**; o formulário, no **tema**; a planilha, na **cor da fonte** da célula. São quatro lugares para a mesma escolha, e é por isso que ela se escreve primeiro e se aplica depois.',
    ],
    'A cor do conjunto vai para papel e para tela. A cor oficial do clube pode ser justamente a que não se lê impressa — o laranja do cartaz do Dia de Portas Abertas mede 2,45:1 sobre branco, e só se lê escurecido.',
    ['aparência coerente', 'identidade do conjunto'],
    [
      [
        'No regulamento do Dia de Portas Abertas os títulos estão no azul que o Word põe por padrão. A cor do conjunto entra pelo estilo: Início › Estilos › Título 1.',
        'Word com o regulamento-portas-abertas aberto, o botão Título 1 da faixa destacado e os dois primeiros títulos, ainda azuis, destacados.',
      ],
      [
        'Um clique no estilo, e os seis títulos ficam no laranja do conjunto de uma vez — inclusive os que estão longe da tela. Ninguém pintou título por título.',
        'O mesmo regulamento depois do clique, com o título do documento e os dois primeiros títulos de seção destacados, agora laranja.',
      ],
    ],
  ),
  t(
    'a-peca-que-se-encontra-primeiro',
    'O documento é a peça que o leitor encontra primeiro',
    'Então é a que tem de nomear as outras quatro.',
    [
      'Um conjunto documental não é uma pasta com cinco arquivos: é um arquivo que leva aos outros quatro. Quem abre o regulamento precisa ficar sabendo que existe formulário de inscrição, onde a planilha de controle mora, e o que o dossiê reúne.',
      'Sem essa seção, cada peça é descoberta por acidente — e as que ninguém descobre não são usadas. No ano seguinte, a diretoria nova refaz do zero o que já estava pronto na pasta ao lado.',
      'Acrescentar uma seção não atualiza o sumário: ele guarda o que leu quando foi gerado. Seção nova pede Atualizar Sumário, e sem isso o sumário aponta para as folhas de antes — certo na primeira olhada, errado em toda página que ele cita.',
    ],
    'O sumário automático procura **estilo** de título, e não negrito. Cinco títulos em negrito à mão dão um sumário vazio, com o documento parecendo perfeito.',
    ['Onde está cada peça', 'Atualizar Sumário'],
    [
      [
        'Inserir › Seção nova escreve, no fim do regulamento, a seção "Onde estão as outras peças": o formulário, a planilha de controle, a apresentação e o dossiê.',
        'Guia Inserir do Word com o botão Seção nova destacado, e no fim da folha a seção nova destacada com o título e o parágrafo que aponta para as outras quatro peças.',
      ],
      [
        'Subindo até o sumário, a seção nova não está nele: o sumário ainda lista os seis títulos que leu quando foi gerado.',
        'Sumário do regulamento destacado, com seis entradas e sem a linha Onde estão as outras peças.',
      ],
      [
        'Referências › Atualizar refaz o sumário a partir dos títulos de agora, e a sétima linha aparece.',
        'Guia Referências com o botão Atualizar destacado e o sumário destacado, agora com sete entradas, a última Onde estão as outras peças.',
      ],
    ],
  ),
];

/* ── Módulo 3: a planilha que se refaz ────────────────────────────────────── */

const A_PLANILHA: TopicoDeVereda[] = [
  t(
    'numero-guardado-nao-responde-por-hoje',
    'O número que está certo hoje é o que erra calado amanhã',
    'Total digitado não se refaz, e nada na tela diz que ele é de ontem.',
    [
      'A planilha de controle do Dia de Portas Abertas tem o total do material escrito 135. A conta de hoje dá 135 — três barracas a 45 —, então ninguém desconfia. Quando chegarem cinco barracas, a célula continua dizendo 135 — e continua parecendo certa.',
      'É a mesma família da ofensiva que ficou meses parada em dois dias: número guardado só muda quando alguém o muda. O contador mostra um número plausível, que é exatamente o que se espera de um contador funcionando.',
      'O requisito 3.2 pede cálculo **automático**. Automático não quer dizer que começa por igual: quer dizer que o número se refaz quando o dado muda.',
    ],
    'A fórmula só se distingue do número parado **simulando a mudança**: troca-se um dado e olha-se se o total acompanhou. Nenhuma conta sobre o estado de agora separa os dois.',
    ['cálculo automático', 'número parado'],
    [
      [
        'A célula do total de material diz 135, e a barra de fórmulas também diz 135: é um número digitado, de quando havia três barracas.',
        'Excel com a aba Controle, a célula B6 destacada com 135 e a barra de fórmulas destacada mostrando só o número 135.',
      ],
      [
        'Escrito =B3*B5, o total continua dizendo 135 hoje — e passa a ler as barracas e o material, que é o que o faz mudar quando eles mudarem.',
        'A mesma célula B6 destacada, ainda com 135, e a barra de fórmulas destacada mostrando =B3*B5.',
      ],
    ],
  ),
  t(
    'o-valor-escrito-dentro-da-formula',
    'O valor escrito dentro da fórmula é um número parado disfarçado',
    'Doze fórmulas certas, e a célula do valor que ninguém lê.',
    [
      'Quem escreve o total do material como B3 vezes 45 recebe o número certo. A planilha calcula, a conta fecha, e tudo passa pela primeira conferência.',
      'No ano seguinte o material de cada barraca passa a 50. Trocar o valor na célula do material não muda nada, porque a fórmula não lê essa célula: ela carrega o 45 dentro. O total sai errado sem erro nenhum, e cada fórmula que copiou o 45 sai errada junto.',
      'O número que se repete mora numa célula, e as fórmulas apontam para ela. É o que torna a planilha do ano que vem a mesma planilha, com um número trocado.',
    ],
    'Arrastando para baixo, quem precisa ficar parada é a **linha**: B$1 está certo. Exigir os dois cifrões ensinaria a decorar a forma em vez de entender o que cada um faz.',
    ['referência absoluta', 'valor numa célula'],
  ),
];

/* ── Módulo 4: o formulário desenhado para a planilha ─────────────────────── */

const O_FORMULARIO: TopicoDeVereda[] = [
  t(
    'o-formulario-se-desenha-de-tras-para-frente',
    'O formulário se desenha olhando a planilha que vai recebê-lo',
    'Cada pergunta vira uma coluna, e pergunta mal partida vira coluna inútil.',
    [
      'O requisito 4 pede alimentar a planilha com os dados do formulário **sem redigitação manual**. Isso se decide no desenho do formulário, e não na hora de importar.',
      'Uma pergunta que junta duas coisas — "unidade e barraca" — vira uma coluna com as duas dentro. Contar por unidade exige a unidade sozinha, então alguém vai abrir cada linha e partir o texto à mão. É a redigitação que o requisito proíbe, chegando pela porta do desenho.',
      'Desenhar de trás para frente é escrever primeiro as colunas que a planilha precisa, e só então as perguntas que as produzem. Uma coluna, uma pergunta.',
    ],
    'Trocar o tipo ou partir o campo **depois** de as respostas chegarem não conserta o que já entrou. O tipo vale para o que vem depois, e é por isso que o formulário se desenha antes de abrir.',
    ['uma coluna, uma pergunta', 'sem redigitação'],
    [
      [
        'A inscrição de barraca chega com uma pergunta só para duas coisas: "Unidade e barraca". Na planilha isso vira uma coluna com as duas dentro.',
        'Construtor de formulários com o cartão da pergunta Unidade e barraca, em resposta curta, destacado.',
      ],
      [
        'Separada, a pergunta vira Unidade, numa lista com as cinco unidades, e Barraca, em resposta curta: uma pergunta, uma coluna.',
        'O botão Separar a pergunta em duas destacado, e os cartões Unidade, com Arara, Jaguar, Sabiá, Tucano e Coruja, e Barraca destacados juntos.',
      ],
    ],
  ),
  t(
    'o-tipo-do-campo-impede-a-resposta-errada',
    'O tipo do campo é o que impede a resposta errada de entrar',
    'Em texto curto chega "quatro", chega "uns 6", e a SOMA pula as duas.',
    [
      'Num campo de texto curto, a pergunta "quantos voluntários ficam na barraca" recebe o que as pessoas falam: quatro, uns 6, 3 ou 4. Tudo chega, nada dá erro, e na planilha a SOMA pula essas linhas e fecha a conta com um número **menor** — plausível, e errado.',
      'Com o tipo número, essas respostas não entram: quem responde é obrigado a decidir. O formulário deixou de aceitar o que a planilha não sabe somar.',
      'A unidade é lista pelo mesmo motivo, do outro lado: em texto curto chegam Falcão, falcao e Falcão com espaço atrás — três grafias que a tabela dinâmica abre como três grupos, com o nome escrito igual.',
    ],
    'O tipo diz o que **cabe**; a regra de validação diz o que **vale**. Número é tipo; entre 1 e 20 é regra. São coisas separadas, e nem o Access nem o LibreOffice Base têm um "tipo e-mail".',
    ['tipo do campo', 'regra de validação'],
    [
      [
        'A pergunta "Quantos voluntários ficam na barraca" está em Resposta curta. O seletor de tipo abre a lista inteira.',
        'Menu de tipos aberto e destacado embaixo do cartão da quantidade, com Resposta curta marcada e Número entre as opções.',
      ],
      [
        'Em Número, o formulário só aceita algarismo: "uns 6" não entra mais, e quem responde precisa decidir quantos são.',
        'Cartão Quantos voluntários ficam na barraca destacado, agora com o tipo Número.',
      ],
    ],
  ),
];

/* ── Módulo 5: sem redigitar ───────────────────────────────────────────────── */

const A_IMPORTACAO: TopicoDeVereda[] = [
  t(
    'redigitar-e-perder-duas-vezes',
    'Redigitar custa meia hora e um erro que ninguém acha',
    'A planilha fica igual, e é esse o problema.',
    [
      'Doze respostas redigitadas à mão dão doze linhas certas — menos um dígito, em algum lugar, que ninguém vai procurar porque a planilha está com cara de certa. E no ano que vem são outras doze.',
      'Importar liga cada linha ao envio pela chave que o formulário já guarda: o **instante**. Duas pessoas podem ter o mesmo nome; dois envios não têm o mesmo instante. Base cuja chave é o nome é a base que perde uma das duas Joanas.',
      'A importação **refaz** a aba de respostas em vez de acrescentar linhas. Acrescentar deixaria o mesmo inscrito em duas linhas depois da segunda importação, e a planilha contaria a mesma barraca duas vezes, com um total perfeitamente plausível.',
    ],
    'Importar enche a aba e **não mexe nas contas**. Com o número de unidades digitado na aba de controle, importar resposta nova não muda nada no resto do conjunto.',
    ['importar respostas', 'chave do envio'],
    [
      [
        'As cinco inscrições estão na aba Respostas do formulário, cada uma com o instante em que foi enviada. A planilha ainda não tem nenhuma.',
        'Aba Respostas do construtor com a tabela das cinco inscrições destacada e o aviso Faltam 5 respostas na aba Respostas destacado.',
      ],
      [
        'Importar para a planilha leva as cinco de uma vez, e o aviso troca: a aba Respostas tem as 5 respostas.',
        'Botão Importar para a planilha destacado e o aviso destacado dizendo que a aba Respostas tem as 5 respostas e que as fórmulas podem ler dali.',
      ],
      [
        'Na planilha, pela barra de tarefas, a aba Respostas mostra uma linha por envio, com a coluna Enviado em que ninguém digitou.',
        'Excel aberto pela barra de tarefas, com o botão Excel destacado e a grade da aba Respostas destacada, com as colunas Enviado em, Unidade, Barraca e a quantidade.',
      ],
    ],
  ),
  t(
    'a-formula-faz-a-importacao-valer',
    'A fórmula é o que faz a importação valer para alguma coisa',
    'A aba cresce, e sem fórmula todas as contas continuam as de antes.',
    [
      'Depois de importar, as contas da aba de controle precisam **ler** a aba de respostas. Enquanto o número de unidades estiver digitado, a aba de respostas pode crescer o quanto quiser: o conjunto inteiro continua contando quatro.',
      'A fórmula que atravessa a aba se escreve com o nome da aba, uma exclamação, e a faixa. A exclamação é o que separa a aba da faixa — sem ela, o que vem antes parece nome de função, e a fórmula devolve erro de nome.',
      'E a faixa vai **além** da última resposta de hoje, para a inscrição nova cair dentro dela. Faixa que termina na sexta resposta dá o número certo hoje e para de crescer: o mesmo defeito do número digitado, agora com cara de fórmula.',
    ],
    'A CONT.VALORES conta o que está preenchido, inclusive texto; a CONT.NÚM conta só número. A diferença entre as duas é uma das pistas do número guardado como texto.',
    ['fórmula entre abas', 'faixa com folga'],
    [
      [
        'Na aba Controle, as barracas passam a ser =CONT.VALORES(Respostas!B2:B20) e os voluntários, =SOMA(Respostas!D2:D20): 5 e 23, lidos da outra aba.',
        'Células B3 e B4 da aba Controle destacadas com 5 e 23, e a barra de fórmulas destacada com a contagem que cita a aba Respostas.',
      ],
      [
        'O total de material, que é =B3*B5, foi junto sozinho: 225, cinco barracas a 45. Ninguém mexeu nele.',
        'Célula B6 destacada com 225 e a barra de fórmulas destacada com =B3*B5.',
      ],
    ],
  ),
];

/* ── Módulo 6: a apresentação que acompanha ───────────────────────────────── */

const A_APRESENTACAO: TopicoDeVereda[] = [
  t(
    'as-quatro-maneiras-de-um-numero-chegar',
    'Há quatro maneiras de um número chegar a uma peça, e uma só acompanha',
    'Digitado, figura colada, cópia incorporada e vinculado.',
    [
      'As quatro chegam ao mesmo lugar na tela, com o mesmo número. O que as separa é o que acontece quando o dado muda — e isso não se vê olhando a peça.',
      '**Digitado** não se refaz nunca, e nada na tela diz que ele é de ontem: é o pior dos quatro, porque é o único que não se denuncia. **Figura colada** mostra o retrato de quando foi colada; ao menos se vê que é uma figura. **Cópia incorporada** leva uma planilha dentro do arquivo e viaja sozinha — e o que ela acompanha é a cópia, que é uma segunda fonte.',
      '**Vinculado** lê a planilha de controle agora. É o único que se propaga, e o preço dele é precisar que a planilha viaje junto: sem ela, o quadro fica vazio no computador do clube.',
    ],
    'Vinculado e incorporado são o par que mais se confunde. A pergunta que os separa é "mexer na planilha de controle chega até ele?" — e só um dos dois responde sim.',
    ['colar vínculo', 'cópia incorporada'],
    [
      [
        'O slide das barracas confirmadas tem um gráfico colado como figura, com três barracas. A régua de baixo diz o que ele não faz: não se refaz.',
        'PowerPoint no slide 3, Barracas confirmadas, destacado com três colunas, e a barra de status destacada dizendo que o gráfico não se refaz.',
      ],
      [
        'Inserir › Gráfico com vínculo troca a figura por um gráfico que lê a planilha de controle: agora são as cinco barracas, e a régua avisa que a planilha precisa viajar junto.',
        'Botão Gráfico da guia Inserir destacado, o slide destacado com cinco colunas e a barra de status destacada dizendo que precisa da planilha ao lado.',
      ],
    ],
  ),
  t(
    'uma-fonte-da-verdade',
    'Um conjunto com duas fontes conta dois números',
    'E nenhum dos dois com cara de errado.',
    [
      'Quem lê a apresentação diz três barracas; quem lê a planilha diz cinco. Na mesma tarde, no mesmo clube, com os dois documentos oficiais. Nenhum programa avisa, porque cada arquivo está certo em relação à fonte dele.',
      'Fonte da verdade é a peça de onde os números saem. Nesta vereda é a planilha de controle, e as outras leem dela — ou não leem de ninguém. Toda cópia é uma segunda fonte, e duas fontes divergem no primeiro ajuste.',
      'É por isso que a aparência vai no mestre e os números vão por vínculo: as duas decisões são a mesma, de ângulos diferentes. Uma coisa combinada num lugar só, e as outras herdando.',
    ],
    'Concordar hoje é fácil: é assim que um conjunto de cinco fontes começa. O que distingue uma fonte de cinco é o que acontece quando o dado muda.',
    ['fonte da verdade', 'uma decisão, um lugar'],
    [
      [
        'A aparência também tem uma fonte só, e ela é o slide mestre: Exibir › Slide Mestre mostra o botão que veste a identidade do conjunto.',
        'Guia Exibir com Slide Mestre ligado, o botão Identidade destacado e a tira com os quatro slides de títulos pretos destacada.',
      ],
      [
        'Um clique no mestre, e os quatro títulos ficam no laranja e na letra do conjunto, sem ninguém abrir slide por slide.',
        'A tira dos quatro slides e o slide 1 destacados, com Dia de Portas Abertas e os outros títulos agora laranja.',
      ],
    ],
  ),
];

/* ── Módulo 7: o dossiê ───────────────────────────────────────────────────── */

const O_DOSSIE: TopicoDeVereda[] = [
  t(
    'o-dossie-e-o-que-sai-do-clube',
    'O dossiê é o que sai do clube, e o que sai é decisão',
    'Reunir tudo o que se tem é o caminho que o requisito pede para não tomar.',
    [
      'O requisito 3.5 pede um dossiê reunindo as peças **destinadas a distribuição**. Não as cinco: as de distribuição. O regulamento e a apresentação vão para as famílias; a planilha de controle tem o que o clube gasta e o nome de cada conselheiro responsável, e nunca foi para elas.',
      'Juntar a planilha "porque faz parte do conjunto" é o gesto natural, e é o que entrega dado pessoal e número de orçamento a quem nunca pediu. O que vai para fora se escolhe uma vez, no dossiê.',
      'E reunir se conta por **origem**, e não por página: o mesmo documento combinado três vezes dá um arquivo de três páginas sem ter reunido nada. O número está certo, e não é o número que a tarefa queria.',
    ],
    'O formulário não entra porque não é um arquivo: ele é um endereço que se abre. O que vai no dossiê é o link dele, escrito no regulamento.',
    ['peças de distribuição', 'combinar arquivos'],
    [
      [
        'No leitor de PDF, o dossiê junta só o que sai do clube: Documento e Apresentação marcados. A planilha de controle, que mora na pasta da tesouraria, fica de fora.',
        'Lista Peças a combinar destacada, com Documento e Apresentação marcados e Planilha de controle, na pasta da tesouraria, desmarcada.',
      ],
      [
        'Combinar gera o dossie-portas-abertas com cinco páginas, e a régua de baixo diz o que ele reúne.',
        'Botão Combinar destacado, a fileira de cinco miniaturas destacada e a régua destacada com Reúne: Documento, Apresentação.',
      ],
    ],
  ),
  t(
    'pesquisavel-se-nasce-do-programa',
    'Pesquisável se nasce do programa, não da qualidade da foto',
    'Exportado tem camada de texto; digitalizado é uma imagem.',
    [
      'Um PDF exportado do editor nasce com a camada de texto: o programa sabe quais letras escreveu e grava isso junto. A família acha a data procurando por ela.',
      'O mesmo documento impresso e digitalizado é uma foto. Abre igual, imprime igual, e a busca não acha uma palavra. Para ele ficar pesquisável é preciso reconhecer o texto depois — e reconhecimento **adivinha**: ele troca m por rn, l por I, e a palavra errada é lida como a certa.',
      'A ordem entre reduzir o tamanho e reconhecer o texto custa, e nada avisa. A nitidez só desce: reduzir antes deixa o reconhecimento com menos para ler, e o texto sai furado — num arquivo que continua dizendo pesquisável. Reduzir depois não mexe no texto, que é leve e já está gravado.',
    ],
    'Reconhecer texto num dossiê inteiro **relê** as páginas que já tinham texto exato, e troca exato por adivinhado — num arquivo que continua se dizendo pesquisável.',
    ['camada de texto', 'reconhecer texto'],
    [
      [
        'Procurar "Monteiro Lobato" no dossiê acha 2 páginas: as duas peças saíram do próprio programa e trouxeram a camada de texto junto.',
        'Caixa de procurar destacada com Monteiro Lobato e o resultado 2 páginas, e a folha do regulamento destacada com o nome da escola no alto.',
      ],
    ],
  ),
];

/* ── Módulo 8: o repositório ──────────────────────────────────────────────── */

const O_REPOSITORIO: TopicoDeVereda[] = [
  t(
    'pasta-com-nome-que-ordena',
    'Pasta com nome que ordena é o padrão da CC-ES001',
    'Um molde só, com data e versão — e são duas contas, não uma.',
    [
      'O requisito 5 manda nomear as pastas segundo o padrão adotado na CC-ES001. São as mesmas duas contas de lá: todos os nomes no **mesmo molde**, e cada nome com **data e versão**.',
      'Nenhuma substitui a outra. O molde é justamente o que apaga a diferença entre uma data e um número qualquer, e dez nomes datados em dez moldes diferentes não ordenam. Portas Abertas, textos portas, GASTOS PORTAS ABERTAS e divulga_final_2 são quatro moldes, e nenhum deles tem data.',
      'O custo aparece no ano que vem, quando quatro pastas novas ficam ao lado destas e nada diz qual é de qual ano.',
    ],
    'O padrão é **próprio**: o que se cobra é que ele exista e seja um só, e não que seja este. O que não se aceita é cada pasta com o seu.',
    ['padrão de nomeação', 'data e versão'],
    [
      [
        'Dentro de "Portas Abertas", as três pastas têm três moldes — divulga_final_2, GASTOS PORTAS ABERTAS, textos portas — e nenhuma tem data.',
        'Nuvem do Clube aberta na pasta Portas Abertas, com a lista das três subpastas destacada e o aviso de quatro pastas fora do padrão.',
      ],
      [
        'No padrão da CC-ES001, as quatro ficam num molde só, com data e versão, e a lista passa a se ordenar sozinha.',
        'Botão Renomear no padrão destacado e a lista destacada com divulgacao, secretaria e tesouraria-portas-abertas-2026-07-14-v01, e o caminho com evento-portas-abertas-2026-07-14-v01.',
      ],
    ],
  ),
  t(
    'permissao-por-funcao-sobrevive-a-pessoa',
    'Permissão por função sobrevive à saída da pessoa',
    'Dada por nome, ela morre com a conta — e a transferência vira vinte gestos.',
    [
      'A nuvem compartilha com pessoas: ela não sabe quem é tesoureiro. "Por função" é uma disciplina, e o que a torna conferível é comparar quem tem acesso a uma pasta com quem exerce a função que aquela pasta serve.',
      'As duas contas custam, e são erros diferentes. Acesso **a mais** é a pasta de contas aberta para quem não é dela: alguém da secretaria ficou editora em julho porque foi conferir um recibo, ninguém tirou, e ninguém notou — e ninguém apaga de propósito, apaga arrastando. Acesso **a menos** é a tesoureira sem como lançar o pagamento, que vai pedir o arquivo por mensagem e criar a cópia que diverge.',
      'E a permissão da pasta alcança o que está dentro dela, com um efeito que ninguém espera: pôr um arquivo restrito numa pasta aberta **não o restringe**. Ele continua com o "só você" escrito na caixa dele, e todo mundo o abre.',
    ],
    'Dar editor na raiz resolve a reclamação de que ninguém consegue mexer em nada, e põe o conjunto inteiro ao alcance de todo mundo por herança. É o contrário de por função.',
    ['permissão por função', 'herança pela pasta'],
    [
      [
        'A pasta da tesouraria tem a Marta, que é a tesoureira — e a Cleide, da secretaria, como editora, desde o dia em que foi conferir um recibo.',
        'Caixa Compartilhar «GASTOS PORTAS ABERTAS» com a linha da Cleide, Editor, destacada entre Marta e Liderança.',
      ],
      [
        'Remover acesso deixa a pasta com quem exerce a função dela: a tesoureira para editar e a liderança para ler.',
        'A mesma caixa destacada, agora com Você como proprietário, Marta como editora e Liderança como leitora, sem a Cleide.',
      ],
    ],
  ),
  t(
    'o-historico-e-quem-prova',
    'Quem prova a colaboração é o histórico de versões',
    'E ler não é participar.',
    [
      'O requisito 6 pede o trabalho feito com, no mínimo, uma outra pessoa, comprovado pelo histórico de versões. Não é uma declaração: é um registro que a nuvem escreve sozinha, com o nome de quem escreveu cada versão.',
      'Quem só abriu o arquivo não entra. Um histórico que contasse leitura deixaria "produzimos juntos" verdadeiro para quem só olhou — e para quem colou dentro o texto que as outras duas escreveram.',
      'Restaurar uma versão antiga **não apaga** as mais novas: acrescenta uma. É a metade do recurso que decide se alguém o usa, porque quem acha que restaurar destrói o que veio depois nunca restaura, e refaz tudo à mão.',
    ],
    'Dar acesso de editor e ninguém escrever não comprova nada. A prova é a versão com o nome da outra pessoa, e ela só existe depois de a pessoa escrever.',
    ['histórico de versões', 'restaurar versão'],
    [
      [
        'Na caixa de compartilhar do regulamento, "Quem escreveu" diz só Você: o histórico ainda não comprova trabalho com ninguém.',
        'Caixa Compartilhar do regulamento-portas-abertas aberta dentro de textos portas, com a linha Quem escreveu: Você destacada.',
      ],
      [
        'Depois de a Cleide receber acesso e escrever uma versão, a mesma linha diz Você, Cleide — é a nuvem quem escreve isso, e não quem pede.',
        'A caixa reaberta, com a linha da Cleide como editora destacada e Quem escreveu destacado com Você, Cleide.',
      ],
    ],
  ),
];

/* ── Módulo 9: as instruções ──────────────────────────────────────────────── */

const AS_INSTRUCOES: TopicoDeVereda[] = [
  t(
    'o-conjunto-do-ano-que-vem',
    'As instruções são escritas para quem não estava aqui',
    'Quatro coisas, e a terceira é a que ninguém escreve.',
    [
      'O requisito 7 pede instruções que permitam a **outra pessoa da diretoria** reaproveitar o conjunto no ano seguinte. Quem escreve supondo que o leitor sabe por que a célula do total é fórmula escreve para ninguém.',
      'São quatro: por onde começar, o que se troca a cada ano, **o que não se mexe e por quê**, e como o acesso se transfere. A terceira é a que falta em quase todo conjunto — e é a que evita alguém apagar o vínculo sem saber que era ele que fazia tudo funcionar.',
      'Elas moram na descrição da pasta do projeto, que é onde a próxima diretoria vai de fato olhar: ela abre a pasta antes de abrir qualquer peça. Escrever num documento à parte cria uma sexta peça que ninguém abre, porque nada aponta para ela.',
    ],
    'Instrução não é manual do programa: a diretoria nova sabe usar o Excel. O que ela não sabe é como **este** conjunto funciona.',
    ['instruções de uso', 'descrição da pasta'],
    [
      [
        'A descrição da pasta tem quatro campos. O que não se mexe é o que ninguém escreve, e diz por quê: é das células de fórmula que o resto do conjunto tira os números.',
        'Painel Descrição da pasta do projeto, com o campo O que não se mexe, e por quê destacado e preenchido com a explicação sobre a aba Respostas e as células de fórmula.',
      ],
    ],
  ),
  t(
    'dar-acesso-nao-e-dar-a-conta',
    'Dar acesso de editar não é dar a conta',
    'O arquivo mora na conta do dono, e some com ela.',
    [
      'Dar permissão de editar parece dar o arquivo, e não dá. Ele continua morando na conta de quem o criou — e quando essa pessoa sai do clube, é a conta dela que é fechada. Os arquivos somem junto, por mais gente que tivesse acesso.',
      'Transferir a propriedade é um gesto separado, e a nuvem o esconde: ele mora **dentro do seletor de papel** de quem vai receber. Por isso só se transfere para quem já tem acesso — a ordem é dar o acesso e transferir depois.',
      'E transferir não é perder: quem entrega continua editor. Se perdesse, ninguém transferiria nunca, e o clube ficaria com tudo na conta de uma pessoa — que é exatamente o que a transferência existe para desfazer.',
    ],
    'A transferência é por arquivo. Três peças são três transferências, cada uma precedida de dar acesso a quem vai receber.',
    ['transferir propriedade', 'conta do clube'],
    [
      [
        'Para transferir, primeiro se dá acesso: a Liderança entra como editora do regulamento, que continua na sua conta.',
        'Caixa Compartilhar do regulamento com a linha da Liderança, Editor, destacada logo abaixo de Você, proprietário.',
      ],
      [
        'No seletor de papel da Liderança, Transferir propriedade: ela passa a ser a proprietária, e você continua editor.',
        'As duas linhas destacadas juntas: Liderança como Proprietário e Você (você) como Editor.',
      ],
    ],
  ),
];

/* ── Módulo 10: os quinze minutos ─────────────────────────────────────────── */

const OS_QUINZE_MINUTOS: TopicoDeVereda[] = [
  t(
    'demonstrar-e-mostrar-o-conjunto-reagindo',
    'A demonstração abre pelo dado que muda, e não pela primeira peça',
    'Quinze minutos para cinco peças é pouco, e é de propósito.',
    [
      'O requisito 8 pede apresentar o conjunto em até quinze minutos, demonstrando a alteração de um dado que se propague automaticamente pelas demais peças. O limite é a pergunta disfarçada: o que você mostraria se só pudesse mostrar uma coisa?',
      'Quem abre as cinco peças e passa por todas as telas gasta os quinze sem chegar ao dado que se propaga. O que se mostra é o conjunto **reagindo**: uma inscrição nova entra pelo formulário, e o total, o regulamento e o gráfico dizem o número novo sem ninguém abrir nenhum dos três.',
      'Enquanto alguma peça não acompanha, a demonstração mostra um conjunto que conta dois números para o mesmo evento. É o momento em que o defeito finalmente aparece — e é só aí, porque até então tudo estava plausível.',
    ],
    'Vincular o número e deixar o retrato antigo guardado é pior do que não vincular: agora nada mais indica que aquele número pode estar velho.',
    ['demonstrar a propagação', 'quinze minutos'],
  ),
  t(
    'o-pdf-congela-e-se-exporta-de-novo',
    'O dossiê não acompanha, e é por isso que ele serve',
    'O PDF guarda o retrato de quando saiu.',
    [
      'Das cinco peças, o dossiê é a única que o requisito 8 não propaga — e não é defeito: é o que faz um PDF servir para distribuir. Ele chega a todo mundo igual, em qualquer computador, sem precisar de nada ao lado.',
      'O preço é que mudança depois dele pede **exportar de novo**. Entregar às famílias um dossiê gerado antes da inscrição nova é entregar o número de antes, com todo o resto do conjunto certo — e nada na tela dizendo isso.',
      'Quem conserta dentro do PDF acaba com dois documentos diferentes, e o editável, que é o que vai ser usado no ano que vem, fica sendo o errado. O conserto é sempre voltar à peça e exportar outra vez.',
    ],
    'A ordem na demonstração importa: mostrar o dossiê **antes** de exportá-lo de novo é o que faz quem assiste entender por que ele é diferente dos outros três.',
    ['o PDF congela', 'exportar de novo'],
  ),
];

/* ── Os dez módulos ──────────────────────────────────────────────────────── */

export const MODULOS_DO_PROJETO: ModuloDeVereda[] = [
  {
    id: 'm1',
    titulo: 'A proposta',
    resumo: 'O combinado que vem antes do trabalho — e a pergunta que ninguém escreve nele.',
    licoes: [
      {
        id: 'm1-teoria', tipo: 'teoria',
        questoes: QUESTOES_DO_PROJETO['m1-teoria'],
        perguntas: 4,
        titulo: 'O que uma proposta promete',
        resumo: 'Quatro perguntas, aprovadas antes de a primeira peça existir.',
        topicos: A_PROPOSTA,
      },
      {
        id: 'm1-lab', tipo: 'projeto', licao: 'proposta',
        titulo: 'Escrevendo a proposta do conjunto',
        resumo: 'E descobrindo o que custa começar a montar antes da aprovação.',
        verificacoes: ['proposta-escrita', 'proposta-cinco-pecas', 'proposta-aprovada-antes'],
      },
    ],
  },
  {
    id: 'm2',
    titulo: 'O documento do conjunto',
    resumo: 'A identidade que as cinco peças dividem, e a seção que leva às outras quatro.',
    licoes: [
      {
        id: 'm2-teoria', tipo: 'teoria',
        questoes: QUESTOES_DO_PROJETO['m2-teoria'],
        perguntas: 4,
        titulo: 'Cinco peças com a mesma cara',
        resumo: 'Onde cada programa guarda a identidade, e por que o documento nomeia os outros.',
        topicos: O_DOCUMENTO,
      },
      {
        id: 'm2-lab', tipo: 'projeto', licao: 'documento',
        titulo: 'Vestindo o regulamento e apontando as peças',
        resumo: 'E atualizando o sumário, que guarda o que leu.',
        verificacoes: ['doc-identidade', 'doc-aponta-as-pecas'],
      },
    ],
  },
  {
    id: 'm3',
    titulo: 'A planilha que se refaz',
    resumo: 'O total que está certo hoje, e o que ele diz no ano que vem.',
    licoes: [
      {
        id: 'm3-teoria', tipo: 'teoria',
        questoes: QUESTOES_DO_PROJETO['m3-teoria'],
        perguntas: 4,
        titulo: 'Cálculo automático não é começar por igual',
        resumo: 'Três totais que começam por igual, e um só continua certo amanhã.',
        topicos: A_PLANILHA,
      },
      {
        id: 'm3-lab', tipo: 'projeto', licao: 'planilha',
        titulo: 'Trocando o total digitado por uma conta',
        resumo: 'E provando que ela se refaz, mexendo no valor por unidade.',
        verificacoes: ['total-em-formula', 'planilha-identidade'],
      },
    ],
  },
  {
    id: 'm4',
    titulo: 'O formulário desenhado para a planilha',
    resumo: 'Uma coluna, uma pergunta — e o tipo que impede a resposta errada.',
    licoes: [
      {
        id: 'm4-teoria', tipo: 'teoria',
        questoes: QUESTOES_DO_PROJETO['m4-teoria'],
        perguntas: 4,
        titulo: 'O formulário se desenha de trás para frente',
        resumo: 'Pergunta mal partida vira coluna que alguém vai redigitar.',
        topicos: O_FORMULARIO,
      },
      {
        id: 'm4-lab', tipo: 'projeto', licao: 'formulario',
        titulo: 'Partindo a pergunta e trocando o tipo',
        resumo: 'Unidade e especialidade em campos separados, quantidade como número.',
        verificacoes: ['form-separa-os-campos', 'form-quantidade-numero', 'form-identidade'],
      },
    ],
  },
  {
    id: 'm5',
    titulo: 'Do formulário para a planilha',
    resumo: 'Sem redigitar — e com as contas lendo a aba que cresce.',
    licoes: [
      {
        id: 'm5-teoria', tipo: 'teoria',
        questoes: QUESTOES_DO_PROJETO['m5-teoria'],
        perguntas: 4,
        titulo: 'Importar, e fazer a importação valer',
        resumo: 'A chave que ninguém digita, e a fórmula sem a qual a aba cresce em vão.',
        topicos: A_IMPORTACAO,
      },
      {
        id: 'm5-lab', tipo: 'projeto', licao: 'importar',
        titulo: 'Importando as respostas e ligando as contas a elas',
        resumo: 'Do construtor para a planilha, pela barra de tarefas.',
        verificacoes: ['importou-sem-redigitar', 'contagem-vem-das-respostas', 'soma-vem-das-respostas'],
      },
    ],
  },
  {
    id: 'm6',
    titulo: 'A apresentação que acompanha',
    resumo: 'As quatro maneiras de um número chegar, e a única que se propaga.',
    licoes: [
      {
        id: 'm6-teoria', tipo: 'teoria',
        questoes: QUESTOES_DO_PROJETO['m6-teoria'],
        perguntas: 4,
        titulo: 'Uma fonte da verdade',
        resumo: 'Digitado, figura, incorporado e vinculado — e o que cada um não faz.',
        topicos: A_APRESENTACAO,
      },
      {
        id: 'm6-lab', tipo: 'projeto', licao: 'apresentacao',
        titulo: 'Trocando a figura colada por um gráfico que lê a planilha',
        resumo: 'E pondo a identidade do conjunto no mestre.',
        verificacoes: ['ap-identidade', 'ap-grafico-acompanha'],
      },
    ],
  },
  {
    id: 'm7',
    titulo: 'O dossiê',
    resumo: 'O que sai do clube é decisão, e pesquisável se nasce do programa.',
    licoes: [
      {
        id: 'm7-teoria', tipo: 'teoria',
        questoes: QUESTOES_DO_PROJETO['m7-teoria'],
        perguntas: 4,
        titulo: 'Reunir as peças de distribuição',
        resumo: 'E não as cinco: a planilha leva gastos e nomes que nunca foram para fora.',
        topicos: O_DOSSIE,
      },
      {
        id: 'm7-lab', tipo: 'projeto', licao: 'dossie',
        titulo: 'Montando o dossiê para as famílias',
        resumo: 'Escolhendo o que vai, e conferindo que a busca acha.',
        verificacoes: ['dossie-reune-as-de-distribuicao', 'dossie-pesquisavel'],
      },
    ],
  },
  {
    id: 'm8',
    titulo: 'O repositório',
    resumo: 'Pasta com nome que ordena, acesso por função, e o histórico que prova.',
    licoes: [
      {
        id: 'm8-teoria', tipo: 'teoria',
        questoes: QUESTOES_DO_PROJETO['m8-teoria'],
        perguntas: 4,
        titulo: 'Onde o conjunto mora',
        resumo: 'O padrão da CC-ES001, a permissão que sobrevive à pessoa, e ler que não é participar.',
        topicos: O_REPOSITORIO,
      },
      {
        id: 'm8-lab', tipo: 'projeto', licao: 'repositorio',
        titulo: 'Arrumando as pastas e o acesso',
        resumo: 'E deixando o histórico mostrar mais de uma pessoa escrevendo.',
        verificacoes: ['pastas-no-padrao', 'acesso-por-funcao', 'colaboracao-no-historico'],
      },
    ],
  },
  {
    id: 'm9',
    titulo: 'As instruções',
    resumo: 'Para quem não estava aqui — e a conta em que o conjunto mora.',
    licoes: [
      {
        id: 'm9-teoria', tipo: 'teoria',
        questoes: QUESTOES_DO_PROJETO['m9-teoria'],
        perguntas: 4,
        titulo: 'O conjunto do ano que vem',
        resumo: 'Quatro instruções, e a diferença entre dar acesso e dar a conta.',
        topicos: AS_INSTRUCOES,
      },
      {
        id: 'm9-lab', tipo: 'projeto', licao: 'instrucoes',
        titulo: 'Escrevendo a entrega e passando a propriedade',
        resumo: 'Na descrição da pasta, e peça por peça.',
        verificacoes: ['instrucoes-completas', 'conjunto-na-conta-do-clube'],
      },
    ],
  },
  {
    id: 'm10',
    titulo: 'Os quinze minutos',
    resumo: 'Um dado muda, e as outras peças dizem o número novo.',
    licoes: [
      {
        id: 'm10-teoria', tipo: 'teoria',
        questoes: QUESTOES_DO_PROJETO['m10-teoria'],
        perguntas: 4,
        titulo: 'Demonstrar o conjunto reagindo',
        resumo: 'Abrir pelo dado que muda, e explicar por que o dossiê não acompanha.',
        topicos: OS_QUINZE_MINUTOS,
      },
      {
        id: 'm10-lab', tipo: 'projeto', licao: 'quinze-minutos',
        titulo: 'Vendo o dado chegar nas outras peças',
        resumo: 'Vinculando os números, provocando a mudança e refazendo o dossiê.',
        verificacoes: [
          'numeros-do-regulamento-vinculados', 'viu-o-dado-propagar',
          'dossie-refeito', 'dentro-dos-quinze',
        ],
      },
    ],
  },
];
