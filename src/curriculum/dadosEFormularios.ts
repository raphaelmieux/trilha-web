import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DE_DADOS } from './questoesDeDados';

/*
 * A vereda CC-ES008 Dados e Formulários.
 *
 * ── O que ela é ─────────────────────────────────────────────────────────
 * Todo clube coleta dados: quem vai ao acampamento, quantas diárias, que
 * comida. E quase todo clube os perde do mesmo jeito — não por acidente, mas
 * porque a planilha que guarda virou a planilha que mostra, o Falcão foi
 * escrito de quatro jeitos, e o total foi digitado à mão no ano passado.
 *
 * ── Por que ela exige duas veredas ──────────────────────────────────────
 * Está no requisito 1: a CC-ES003, porque tudo aqui acontece numa planilha e
 * a fórmula, a tabela declarada e a classificação são de lá; e a CC-ES006,
 * porque um formulário coleta dado de outras pessoas, e quem não sabe o que
 * uma pasta compartilhada abre não sabe quem está lendo o que ele coletou.
 *
 * ── E o que carrega esta vereda é o que não dá erro ─────────────────────
 * O telefone gravado como número perde o zero da frente, os parênteses e o
 * traço, e continua sendo um número perfeitamente válido. A soma pula a
 * célula que tem um ponto no lugar da vírgula, e devolve um total plausível e
 * menor. A tabela dinâmica relata dez unidades onde há seis, com o total de
 * respostas certo. O resumo continua mostrando o erro depois de consertado,
 * porque ele guarda o que leu. E o CSV exportado fica na pasta de downloads
 * para sempre, aberto, sem senha e sem dono.
 *
 * Nenhuma dessas telas parece errada, e é essa a matéria.
 */

const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], exemplo: string, atencao: string, marcas: string[],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, exemplo, exemploComo: 'texto' as const, atencao, marcas,
});

/* ── Módulo 1 — Registro, campo e tipo (requisitos 2.1, 2.2 e 4) ──────────── */

const REGISTRO_E_CAMPO: TopicoDeVereda[] = [
  t(
    'registro-e-campo',
    'A linha é a pessoa; a coluna é a pergunta',
    'Duas palavras que descrevem toda tabela de dados que existe.',
    [
      'Registro é tudo o que se sabe sobre uma coisa. Numa lista de inscrições, o registro é um desbravador: o nome dele, a unidade, quantas diárias, o e-mail do responsável. Na tabela, o registro é uma linha.',
      'Campo é uma das coisas que se pergunta. "Unidade" é um campo. Ele vale para todo mundo, e cada registro tem a resposta dele. Na tabela, o campo é uma coluna.',
      'Por isso uma tabela de dados tem uma forma só: uma linha por registro, uma coluna por campo, e o cabeçalho na primeira linha dizendo o nome de cada campo. Quem monta diferente disso não tem uma tabela — tem um desenho.',
    ],
    `Uma linha por desbravador, uma coluna por pergunta

  Nome             Unidade   Diárias   E-mail do responsável
  Ana Beatriz      Falcão    3         marcia.lima@exemplo.com
  Bruno Costa      Falcão    3         paulo.costa@exemplo.com
  Carla Menezes    Águia     2         rita.menezes@exemplo.com

  registro = uma linha inteira
  campo    = uma coluna inteira`,
    'Duas linhas para a mesma pessoa não são dois registros: são o mesmo registro escrito duas vezes. Quem contar as linhas vai contar um inscrito a mais.',
    ['registro', 'campo', 'cabeçalho'],
  ),
  t(
    'tipo-de-dado',
    'O tipo diz o que cabe na resposta',
    'Texto, número, data, escolha — e cada um deixa fazer uma coisa diferente depois.',
    [
      'Tipo de dado é o que aquele campo aceita. Número aceita quantidade e entra em conta. Data aceita dia e entra em ordem de calendário. Texto aceita qualquer coisa e não entra em conta nenhuma.',
      'A escolha do tipo não é um detalhe de aparência: ela decide o que você vai conseguir fazer com aquela coluna daqui a um mês. Quantidade guardada como texto não soma. Data guardada como texto ordena em ordem alfabética, e aí 10 de janeiro vem antes de 2 de fevereiro.',
      'E ela decide o que o formulário aceita na hora de responder. Um campo de lista só deixa escolher o que está na lista; um campo de texto deixa escrever qualquer coisa, inclusive a mesma coisa de quatro jeitos diferentes.',
    ],
    `A mesma resposta, dois tipos

  Como número:   3       soma, tira média, ordena por tamanho
  Como texto:    3       não soma, ordena em ordem de letra

  Datas como texto, ordenadas:
    01/02/2026
    10/01/2026     ← janeiro depois de fevereiro
    2/3/2026`,
    'O requisito conta tipos, e não campos. Cinco perguntas de resposta curta são cinco campos e um tipo só.',
    ['tipo de dado', 'número', 'data', 'texto'],
  ),
  t(
    'telefone-parece-numero',
    'Telefone parece número e é texto',
    'E escolher Número não dá erro: ele aceita, e joga fora o que importa.',
    [
      'Telefone tem parênteses, traço e um zero na frente. Nada disso é conta — é forma de escrever. Guardado como número, o campo aceita sem reclamar e devolve 61999990000, sem os parênteses, sem o traço e sem o zero que vinha antes.',
      'O teste é sempre o mesmo: essa coisa entra em conta? Somar dois telefones não quer dizer nada. Tirar a média de dois CEPs não quer dizer nada. Se a conta não faz sentido, o campo é texto.',
      'Número serve para quantidade, valor e medida. Quantas diárias é número. Quanto custou é número. Telefone, CEP, número da casa e código de inscrição são texto.',
    ],
    `O que o tipo Número faz com um telefone

  Digitado:   (61) 99999-0000
  Guardado:   61999990000
  Mostrado:   61999990000

  E não há erro em lugar nenhum: é um número válido.`,
    'O estrago aparece meses depois, quando alguém precisa ligar. A planilha continua bonita, e ninguém sabe qual telefone perdeu o zero.',
    ['texto', 'número', 'telefone'],
  ),
  t(
    'lista-em-vez-de-texto',
    'Em texto livre, cada um escreve de um jeito',
    'E foi assim que o Falcão virou quatro unidades diferentes.',
    [
      'Um campo de texto aceita qualquer coisa. Perguntando a unidade em texto livre, uma família escreve Falcão, outra escreve falcao sem acento, outra escreve FALCÃO em maiúsculas, e outra deixa um espaço atrás sem perceber.',
      'Para quem lê, são todas a mesma unidade. Para a planilha, são quatro coisas diferentes — e qualquer conta por unidade vai devolver quatro linhas onde deveria haver uma.',
      'A lista resolve na origem: quem responde escolhe, e não digita. Seis unidades na lista, seis respostas possíveis, e nenhuma delas com espaço atrás.',
    ],
    `O mesmo clube, duas formas de perguntar

  Texto livre, 16 respostas:      Lista, 16 respostas:
    Falcão      4                   Falcão      7
    falcao      1                   Águia       4
    FALCÃO      1                   Tucano      3
    Falcao      1                   Arara       2
    Águia       3
    AGUIA       1
    (em branco) 1`,
    'Consertar depois é possível e custa caro: é o módulo 5 inteiro. Perguntar certo na origem custa um clique.',
    ['lista suspensa', 'texto livre', 'inconsistência'],
  ),
];

/* ── Módulo 2 — Obrigatório e validação (requisitos 2.4 e 4) ──────────────── */

const OBRIGATORIO_E_VALIDACAO: TopicoDeVereda[] = [
  t(
    'campo-obrigatorio',
    'Obrigatório é o que não passa em branco',
    'E vale de hoje em diante, nunca para trás.',
    [
      'Um campo obrigatório é aquele que o formulário recusa deixar vazio. Quem tenta enviar sem responder recebe um recado embaixo do campo e a resposta não sai.',
      'Ele serve para o que o clube não pode ficar sem. O e-mail do responsável é isso: sem ele não há como avisar de uma mudança de horário. A observação sobre comida não é: quem não tem restrição nenhuma não tem o que escrever.',
      'E ele vale só daqui para a frente. As respostas que já chegaram com o campo vazio continuam vazias — ligar o interruptor não volta no tempo e não avisa ninguém.',
    ],
    `Obrigatório, ligado hoje

  Respostas de antes:   duas sem e-mail    ← continuam lá, vazias
  Respostas de agora:   nenhuma sem e-mail

  O interruptor não conserta o passado. Ele fecha a porta.`,
    'Marcar tudo como obrigatório não é rigor: é o jeito mais rápido de alguém desistir de responder no meio.',
    ['obrigatório', 'campo'],
  ),
  t(
    'o-que-e-validacao',
    'Validação é a regra dentro do que o tipo deixa caber',
    'O tipo diz o que cabe; a validação diz o que vale.',
    [
      'O tipo já filtra: um campo de número não aceita letra. A validação aperta mais: entre 1 e 5, no máximo 200 caracteres, tem que parecer um endereço de e-mail.',
      'São duas coisas separadas porque respondem a perguntas diferentes. "Isto é um número?" é tipo. "Este número faz sentido para a pergunta que eu fiz?" é validação — ninguém se inscreve para trinta diárias num acampamento de três dias.',
      'A validação recusa na hora, com a pessoa ainda na tela. É a única correção que não custa nada: depois que a resposta entrou, consertar significa ligar para a família e perguntar de novo.',
    ],
    `Tipo e validação, no mesmo campo

  Campo: Quantas diárias
    tipo       = número        recusa "três"
    validação  = entre 1 e 5   recusa 30

  Campo: E-mail do responsável
    tipo       = texto curto   aceita qualquer coisa
    validação  = e-mail        recusa "joana.silva"`,
    'Validação não é o mesmo que verdade. Um endereço com a forma certa pode não existir, e a regra aceita.',
    ['validação', 'tipo de dado'],
  ),
  t(
    'regra-sem-numero',
    'Regra sem o número que ela precisa aceita tudo',
    'A caixa fica escrita na tela, e não recusa nada.',
    [
      'As regras de faixa precisam de números: "entre" precisa de dois, "no máximo" precisa de um. Escolher a regra e deixar a caixa em branco cria uma regra que existe e não faz nada.',
      'Pior: ela pode fazer o contrário do que você quis. Um campo em branco costuma valer zero, então "entre" com as duas caixas vazias vira "entre zero e zero", que recusa todo mundo — e "no mínimo em branco" vira "de zero para cima", que aceita todo mundo.',
      'O jeito de saber é o mesmo de sempre: visualizar o formulário e tentar responder errado de propósito. Se ele aceitar o que devia recusar, a regra não está de pé.',
    ],
    `Três regras escritas, uma funcionando

  entre [   ] e [   ]    →  entre 0 e 0: recusa todo mundo
  entre [ 1 ] e [   ]    →  de 1 a 0: recusa todo mundo
  entre [ 1 ] e [ 5 ]    →  esta recusa 30, que é o que se queria`,
    'Interruptor que você liga e nunca vê agir é interruptor que pode não estar fazendo nada. Teste sempre com uma resposta errada.',
    ['validação', 'faixa'],
  ),
];

/* ── Módulo 3 — Base de dados e relatório (requisitos 3, 2.3 e 5.1) ───────── */

const BASE_E_RELATORIO: TopicoDeVereda[] = [
  t(
    'base-e-relatorio',
    'Uma planilha guarda; outra mostra',
    'São duas coisas, e por isso são duas abas.',
    [
      'A base de dados guarda o que foi coletado, do jeito que chegou: uma linha por registro, uma coluna por campo, cabeçalho em cima, e nada mais. Ela não tem título, não tem total, não tem linha em branco separando bloco.',
      'O relatório mostra o que se conclui: quantos por unidade, quanto vai custar, quem falta confirmar. Ele tem título, tem total, tem espaço em branco onde fica melhor de ler.',
      'Misturar as duas parece organização e é o contrário. Um título solto em cima empurra o cabeçalho para a segunda linha, e quem procurar a primeira coluna acha o título. Um TOTAL embaixo dos registros é uma linha como as outras para quem lê a tabela: ele entra na contagem como se fosse mais um inscrito.',
    ],
    `A mesma informação, nos dois lugares certos

  Aba Respostas (base)        Aba Relatório (relatório)
    Enviado em  Nome  ...       Inscrições do acampamento
    08/06  Ana   ...
    08/06  Bruno ...            Diárias somadas    46
    09/06  Carla ...            Unidades           6
                                Falta confirmar    2`,
    'O erro não estoura: a planilha misturada abre, soma e imprime. O que ela faz é contar o TOTAL como um inscrito, e ninguém confere.',
    ['base de dados', 'relatório', 'aba'],
  ),
  t(
    'chave',
    'Chave é o que não se repete',
    'É por ela que um registro se acha e se distingue de outro parecido.',
    [
      'Chave é o campo — ou a combinação de campos — que identifica um registro sem ambiguidade. Num clube, dois desbravadores podem se chamar João Pedro Alves. O nome, então, não serve de chave.',
      'O que serve é algo que nasce único: um código de inscrição, o instante exato em que a resposta chegou, um número de matrícula. O formulário costuma gravar o instante do envio justamente por isso.',
      'Sem chave, não há como dizer se duas linhas parecidas são duas pessoas ou a mesma pessoa que respondeu duas vezes. E é uma decisão que muda a conta: o clube compra comida para quantos?',
    ],
    `Duas linhas parecidas

  Enviado em         Nome              Unidade
  09/06 08:22        João Pedro Alves  Falcão
  09/06 08:22        João Pedro Alves  Falcão   ← mesmo instante: é a mesma

  10/06 14:20        João Pedro Alves  Águia    ← outro instante, outra unidade:
                                                 são duas pessoas`,
    'Chave não é o primeiro campo da tabela nem o campo mais importante. É o que não se repete.',
    ['chave', 'registro', 'duplicata'],
  ),
  t(
    'importar',
    'Importar é trazer as respostas para a planilha',
    'E o que chega é o que foi digitado, com os erros junto.',
    [
      'O formulário guarda as respostas dele. Importar cria uma planilha com uma linha por resposta e uma coluna por pergunta, mais a coluna do instante em que cada uma chegou.',
      'O que chega é exatamente o que as pessoas escreveram. A importação não conserta acento, não tira espaço atrás e não junta o que está escrito de quatro jeitos — e é bom que não junte: consertar por baixo esconderia o problema em vez de mostrá-lo.',
      'Por isso o trabalho começa aqui e não acaba aqui. A planilha importada é matéria-prima: ela precisa virar base antes de virar relatório.',
    ],
    `O que a importação traz

  Enviado em         Nome            Unidade    Diárias
  08/06 19:12        Ana Beatriz     Falcão     3
  08/06 19:40        Bruno Costa     falcao     3
  09/06 09:01        Eduarda Pires              3
  09/06 12:47        Felipe Andrade  Arara      1.5

  Tudo como foi digitado, inclusive o branco e o ponto.`,
    'Quem "arruma" a planilha importada pondo título em cima e total embaixo acabou de transformar a base em relatório.',
    ['importar', 'base de dados'],
  ),
];

/* ── Módulo 4 — Tabela dinâmica (requisito 5.3) ───────────────────────────── */

const RESUMO: TopicoDeVereda[] = [
  t(
    'o-que-e-tabela-dinamica',
    'Tabela dinâmica responde "quantos por"',
    'Sem você contar na mão, e sem escrever fórmula nenhuma.',
    [
      'Uma tabela dinâmica pega uma tabela grande e responde uma pergunta do tipo "quantos por unidade", "quanto por mês", "qual a média por turma". Você diz o que vira linha e o que vira conta, e ela monta.',
      'Ela não muda a tabela de origem. É um resumo desenhado em outro lugar — numa aba de relatório, que é onde resumo mora.',
      'A conta pode ser contagem, soma ou média. Contagem conta linhas: quantas respostas por unidade. Soma soma valores: quantas diárias por unidade. São perguntas diferentes, e o número que sai é diferente.',
    ],
    `A mesma tabela, duas perguntas

  Contagem de respostas       Soma de diárias
    Falcão     7                Falcão    20
    Águia      4                Águia     11
    Tucano     3                Tucano     9

  Sete famílias do Falcão pediram vinte diárias no total.`,
    'Contagem e soma respondem coisas diferentes. Trocar uma pela outra dá um número plausível e errado.',
    ['tabela dinâmica', 'contagem', 'soma'],
  ),
  t(
    'agrupa-pelo-escrito',
    'Ela agrupa pelo que está escrito',
    'E é assim que ela mostra o que a base tem de errado.',
    [
      'A tabela dinâmica junta as linhas que têm o mesmo valor escrito na coluna escolhida. Mesmo valor escrito, e não mesmo valor pretendido: Falcão e falcao são duas coisas, e viram dois grupos.',
      'Isso parece um defeito e é a coisa mais útil que ela faz. Um clube com seis unidades que vê dez linhas no resumo acabou de descobrir que quatro respostas estão escritas de outro jeito — sem procurar, sem conferir uma a uma.',
      'E há sempre uma linha a mais para procurar: o grupo escrito "(vazio)". Ele é quem não respondeu aquela pergunta. Conta no total e não pertence a unidade nenhuma.',
    ],
    `Seis unidades, dez linhas no resumo

  Falcão      4
  falcao      1     ← a mesma, sem acento
  FALCÃO      1     ← a mesma, em maiúsculas
  Falcao      1     ← a mesma, com espaço atrás
  Águia       3
  AGUIA       1     ← a mesma
  Tucano      3
  Arara       1
  (vazio)     1     ← quem não escolheu unidade
                    total de respostas: 16, e este está certo`,
    'O total de respostas fica certo mesmo com os grupos errados. É por isso que ninguém percebe olhando só o total.',
    ['tabela dinâmica', 'agrupamento', 'vazio'],
  ),
  t(
    'guarda-o-que-leu',
    'Ela guarda o que leu, e não se refaz sozinha',
    'Consertar a base não muda o resumo, e nada na tela avisa.',
    [
      'A tabela dinâmica é um retrato: ela lê a origem no momento em que é criada e guarda o resultado. Depois disso, mexer na base não muda nada nela.',
      'Então a sequência certa é consertar e mandar atualizar. Quem conserta e não atualiza continua vendo dez unidades; quem atualiza sem consertar continua vendo dez também. Só as duas coisas juntas dão seis.',
      'É a mesma armadilha do sumário de um documento, que continua mostrando o título antigo depois de você trocá-lo. O retrato não envelhece sozinho — ele só não é mais verdade.',
    ],
    `A ordem importa

  1. resumo criado         10 grupos
  2. base consertada       10 grupos   ← a base já está certa
  3. Atualizar              6 grupos

  Pular o passo 3 entrega um relatório que discorda da própria base.`,
    'Nada na tela diz que o resumo está velho. Ele mostra números plausíveis, que é o que se espera de um resumo funcionando.',
    ['tabela dinâmica', 'atualizar', 'retrato'],
  ),
];

/* ── Módulo 5 — Consertar inconsistências (requisito 5.2) ─────────────────── */

const CONSERTO: TopicoDeVereda[] = [
  t(
    'mesma-coisa-escrita-diferente',
    'Três diferenças que os olhos não pegam',
    'Acento, caixa e o espaço atrás.',
    [
      'Falcão e falcao diferem por um acento. Falcão e FALCÃO diferem por caixa. Falcão e "Falcão " diferem por um espaço no fim, que não aparece na tela de jeito nenhum.',
      'Para a planilha, as três diferenças valem o mesmo: são valores diferentes. A conta por unidade, a classificação e o PROCV tratam cada um como um item à parte.',
      'O espaço atrás é o mais cruel dos três, porque é invisível. Duas células podem parecer idênticas, lado a lado, e não casar em conta nenhuma. Quando uma linha "some" de um agrupamento sem explicação, é ele.',
    ],
    `Quatro células, quatro valores

  Falcão        6 letras
  falcao        6 letras, sem acento
  FALCÃO        6 letras, maiúsculas
  Falcão␣       7 caracteres  ← o último não se vê

  Na tela: quase iguais. Para a planilha: quatro grupos.`,
    'O jeito de achar o espaço atrás não é olhar: é agrupar. A tabela dinâmica mostra dois grupos com o mesmo nome escrito.',
    ['inconsistência', 'espaço', 'acento'],
  ),
  t(
    'arrumar-nao-e-apagar',
    'Arrumar não é apagar',
    'O caminho rápido resolve a coluna e perde o desbravador.',
    [
      'Diante de quatro linhas com a unidade escrita errado, o gesto mais rápido é apagar as quatro. A coluna fica impecável, o resumo fica com seis grupos, e o clube fica com doze inscritos em vez de dezesseis.',
      'O mesmo vale para a linha sem unidade. Apagar resolve o grupo "(vazio)" perdendo uma pessoa que se inscreveu de verdade. O que ela não escolheu foi a unidade — ela não deixou de existir.',
      'Consertar é descobrir e escrever: ligar para a família, perguntar de que unidade é, e preencher. O dado que falta vem de fora da planilha, sempre. A planilha não sabe.',
    ],
    `Dois caminhos, dois resultados

  Apagar as linhas esquisitas:
    coluna limpa, resumo com 6 grupos, 12 inscritos
    o clube compra comida para 12 e recebe 16

  Consertar a escrita:
    coluna limpa, resumo com 6 grupos, 16 inscritos`,
    'Nenhuma tela reclama de uma linha apagada. O erro aparece no dia do acampamento, na fila da comida.',
    ['conserto', 'registro'],
  ),
  t(
    'numero-que-e-texto',
    'Número guardado como texto some da soma',
    'E deixa um total plausível e menor.',
    [
      'No Brasil, o separador decimal é a vírgula. Quem escreve 1.5 numa planilha brasileira não escreveu um número e meio: escreveu um texto que parece número, e a planilha o trata como texto.',
      'A soma pula texto. Com duas células assim numa coluna de dezesseis, o total sai menor e não há erro em lugar nenhum — ele continua sendo um número que cabe na realidade.',
      'Há duas pistas, e as duas são fracas sozinhas. A primeira é o alinhamento: número encosta à direita, texto encosta à esquerda. A segunda é contar — a função que conta números devolve um a menos do que a que conta valores preenchidos.',
    ],
    `Doze células, duas delas texto

  Diárias        CONT.VALORES = 12
    3            CONT.NÚM     = 10   ← duas não são número
    3
    1.5    ← encostada à esquerda
    2.5    ← encostada à esquerda

  SOMA da coluna: pula as duas, e o total fica menor.`,
    'Apagar a célula não é consertar: tira o ponto e tira o número junto, e a coluna fica com um buraco no lugar do defeito.',
    ['número', 'texto', 'separador decimal'],
  ),
];

/* ── Módulo 6 — CSV (requisitos 2.5 e 5.4) ────────────────────────────────── */

const CSV: TopicoDeVereda[] = [
  t(
    'o-que-e-csv',
    'CSV é a planilha sem a planilha',
    'Só o texto, numa linha por registro.',
    [
      'CSV quer dizer valores separados por um separador. É um arquivo de texto puro: a primeira linha é o cabeçalho, cada linha seguinte é um registro, e dentro da linha um caractere separa uma coluna da outra.',
      'Ele existe porque todo programa lê texto. Uma planilha do Excel só o Excel abre direito; um CSV abre no Excel, no Google Planilhas, num programa de banco de dados e no bloco de notas. É o formato para mandar dados de um lugar para outro.',
      'O preço é que ele guarda só isso. Sem cor, sem negrito, sem fórmula, sem largura de coluna e sem as outras abas. O que ele guarda é o resultado, e não a conta que o produziu.',
    ],
    `O mesmo arquivo, nos dois programas

  Na planilha:
    Nome            Unidade   Diárias
    Ana Beatriz     Falcão    3

  No bloco de notas:
    Nome;Unidade;Diárias
    Ana Beatriz;Falcão;3`,
    'Salvar uma pasta de trabalho como CSV guarda a aba ativa e joga fora as outras, sem perguntar duas vezes.',
    ['CSV', 'texto puro', 'cabeçalho'],
  ),
  t(
    'o-separador',
    'O separador muda de país',
    'E é por isso que aqui ele costuma ser ponto e vírgula.',
    [
      'O nome do formato fala em vírgula, e em inglês é vírgula mesmo. No Brasil não dá: a vírgula já é o separador decimal, e 1,5 viraria duas colunas — uma com 1 e outra com 5.',
      'Por isso os programas brasileiros usam ponto e vírgula. Um arquivo gerado aqui e aberto lá — ou o contrário — mostra tudo numa coluna só, porque o programa procurou o separador errado.',
      'Não há como adivinhar olhando de longe: quem gerou o arquivo é quem sabe. Abrir no bloco de notas e olhar a primeira linha resolve em dois segundos.',
    ],
    `A mesma linha, dois separadores

  Com vírgula:          Ana Beatriz,Falcão,1,5
    lido como 4 colunas: Ana Beatriz | Falcão | 1 | 5

  Com ponto e vírgula:  Ana Beatriz;Falcão;1,5
    lido como 3 colunas: Ana Beatriz | Falcão | 1,5`,
    'Arquivo que abre com tudo numa coluna só quase nunca está corrompido: é o separador errado.',
    ['separador', 'vírgula', 'ponto e vírgula'],
  ),
  t(
    'as-aspas',
    'Quando o separador aparece dentro da resposta',
    'O arquivo põe aspas em volta dela, e é por isso que ele funciona.',
    [
      'Se o separador é ponto e vírgula e alguém escreveu um ponto e vírgula dentro da observação, a linha desandaria: aquele pedaço viraria uma coluna nova, e todas as seguintes andariam um lugar para o lado.',
      'A saída é padrão em todo CSV: quando o valor contém o separador, ele sai entre aspas. Quem lê o arquivo sabe que o que está entre aspas é um valor só, com separador e tudo dentro.',
      'E se o valor tiver uma aspa dentro dele, ela é escrita duas vezes. É a mesma ideia levada um passo adiante: o formato precisa de um jeito de dizer "esta aspa é do texto, e não a que fecha o valor".',
    ],
    `Uma observação com ponto e vírgula dentro

  Na planilha:
    Vegetariana; chega no sábado

  No arquivo:
    Ana Beatriz;Falcão;3;"Vegetariana; chega no sábado"

  Sem as aspas, a linha teria cinco colunas em vez de quatro.`,
    'As aspas não fazem parte da resposta. Quem as vê no bloco de notas e as apaga acabou de quebrar o arquivo.',
    ['aspas', 'separador', 'CSV'],
  ),
];

/* ── Módulo 7 — Agenda e relatório ordenado (requisito 6) ─────────────────── */

const AGENDA: TopicoDeVereda[] = [
  t(
    'ordem-de-entrada',
    'A agenda guarda na ordem em que as pessoas chegaram',
    'E essa ordem é um dado, como qualquer outro.',
    [
      'Uma agenda cresce uma linha por vez: alguém entra no clube e é escrito no fim. A ordem das linhas, então, conta uma história — quem estava desde o começo, quem chegou no ano passado.',
      'Essa ordem não tem cópia em lugar nenhum. Não há uma coluna escrita "entrou em"; ela existe só como a posição de cada linha. Reordenar a agenda apaga essa informação para sempre.',
      'Por isso o pedido é gerar um relatório ordenado, e não ordenar a agenda. O relatório é outra folha, com as mesmas pessoas, numa ordem que serve para procurar. A agenda fica como está.',
    ],
    `Duas folhas, duas ordens, a mesma gente

  Agenda (ordem de entrada)     Relatório (ordem de nome)
    Gustavo Ramos                 Ana Beatriz Lima
    Ana Beatriz Lima              Bruno Costa
    Tiago Moreira                 Carla Menezes
    Daniel Rocha                  Daniel Rocha`,
    'Ordenar a própria agenda parece resolver e é o que não tem volta: a lista fica em ordem alfabética e a ordem de entrada não existe mais.',
    ['agenda', 'relatório', 'ordenação'],
  ),
  t(
    'linha-inteira',
    'Ordenar leva a linha inteira, sempre',
    'Ordenar só a coluna do nome embaralha o cadastro.',
    [
      'Quando se ordena por nome, cada nome tem que viajar com o telefone dele, o endereço dele e o e-mail dele. É a linha que troca de lugar, e não a célula.',
      'Selecionar só a coluna do nome e mandar ordenar faz exatamente o que foi pedido: ordena aquela coluna. As outras ficam onde estavam, e o resultado é um cadastro em que cada pessoa está ao lado do telefone de outra.',
      'E não dá erro. A tabela continua com vinte e cinco linhas, vinte e cinco nomes e vinte e cinco telefones, todos plausíveis. O jeito de evitar é declarar a tabela inteira antes de ordenar.',
    ],
    `O que acontece ordenando só uma coluna

  Antes:                        Depois:
    Gustavo   (61) 98888-1111     Ana       (61) 98888-1111
    Ana       (61) 97777-2222     Bruno     (61) 97777-2222
    Tiago     (61) 96666-3333     Carla     (61) 96666-3333

  Os telefones não se moveram. Os nomes, sim.`,
    'Não há desfazer depois de salvar e fechar. O cadastro continua parecendo certo, e ninguém confere telefone por telefone.',
    ['ordenação', 'tabela', 'cadastro'],
  ),
  t(
    'quatro-campos',
    'Quatro campos, quatro jeitos de alcançar alguém',
    'E cada um falha de um jeito diferente.',
    [
      'O requisito pede nome, endereço, telefone e endereço eletrônico. Não é excesso: cada um serve a uma situação, e nenhum serve a todas.',
      'Telefone alcança na hora e falha quando o número muda. E-mail alcança quem está longe e falha quando ninguém lê a caixa. Endereço serve para mandar o que é de papel e para saber quem mora perto de quem — útil na hora de organizar carona.',
      'Um cadastro com um campo só é um cadastro que para de funcionar no dia em que aquele campo envelhece. Com quatro, sempre sobra por onde tentar.',
    ],
    `A mesma pessoa, quatro portas

  Nome       Ana Beatriz Lima
  Telefone   (61) 98888-1111    imediato, muda de dono
  E-mail     marcia@exemplo.com fica, e pode não ser lido
  Endereço   Quadra 12, casa 8  para papel e para carona`,
    'Cadastro que ninguém revisa envelhece calado: o telefone continua lá, certinho, e pertence a outra pessoa.',
    ['cadastro', 'campo'],
  ),
];

/* ── Módulo 8 — Dado pessoal e entrega (requisitos 7 e 8) ─────────────────── */

const DADO_PESSOAL: TopicoDeVereda[] = [
  t(
    'o-que-e-dado-pessoal',
    'Dado pessoal é o que aponta para uma pessoa',
    'Sozinho ou junto com os outros da mesma linha.',
    [
      'Nome aponta para uma pessoa. Telefone e e-mail apontam e ainda dizem como falar com ela. Endereço diz onde ela mora. Uma observação sobre comida diz o que ela come, e às vezes por quê.',
      'A unidade, sozinha, não aponta para ninguém: metade do clube é do Falcão. Mas ela está na mesma linha que o nome, e é isso que transforma a tabela inteira num conjunto de dados pessoais — não é cada coluna que importa, é a linha.',
      'Dado de criança e de adolescente pede mais cuidado ainda, e é disso que este cadastro é feito. Quem coleta assume a responsabilidade por ele.',
    ],
    `Uma linha da base

  Nome        Ana Beatriz Lima       aponta
  Unidade     Falcão                 sozinha, não aponta
  E-mail      marcia@exemplo.com     aponta, e alcança
  Observação  Vegetariana            aponta, e diz mais do que parece

  Juntas na mesma linha: um dado pessoal só.`,
    'Marcar tudo como pessoal não é classificar — é marcar. Classificar é olhar cada campo e decidir.',
    ['dado pessoal', 'campo', 'registro'],
  ),
  t(
    'guarda',
    'Guardar bem é decidir quem alcança',
    'E a pasta compartilhada alcança o que está dentro dela.',
    [
      'O primeiro cuidado é o mais simples e o mais esquecido: só quem precisa dos dados tem acesso ao arquivo. Não é desconfiança de ninguém — é que cada pessoa a mais é um computador a mais de onde a lista pode sair.',
      'E acesso não é só o que está escrito na caixa do arquivo. Um arquivo restrito dentro de uma pasta compartilhada com o clube inteiro continua com o "só você" escrito nele, e todo mundo o abre — a permissão da pasta alcança o que está dentro.',
      'Pôr senha no arquivo parece um cuidado e não é: quem sabe a senha salva sem ela, e a partir daí o arquivo circula aberto. É pedido, e não trava.',
    ],
    `Onde o arquivo está vale mais do que o que está escrito nele

  Ficha dos inscritos
    acesso do arquivo:  só você
    dentro da pasta:    Clube — todos podem editar
    quem abre de fato:  todos

  O conserto é mover o arquivo, e não mexer na caixa dele.`,
    'Nenhuma tela diz "este arquivo está aberto para o clube inteiro". Só quem olha a pasta acima dele descobre.',
    ['guarda', 'acesso', 'pasta'],
  ),
  t(
    'descarte',
    'Descartar é o cuidado que ninguém lembra',
    'A cópia exportada continua na pasta de downloads.',
    [
      'Durante o trabalho, o arquivo é copiado várias vezes: exporta-se o CSV, manda-se uma cópia por mensagem, baixa-se outra no computador do clube. Cada cópia é mais um lugar de onde a lista pode sair, e nenhuma delas tem dono.',
      'O CSV é o pior de todos, porque é texto puro: qualquer pessoa que abrir o computador lê a base inteira sem precisar de programa nenhum.',
      'Então o descarte tem prazo e tem lugar. Acabado o acampamento, o que não serve mais se apaga — e apagar quer dizer apagar da lixeira também. Guardar tudo para sempre por segurança é o contrário de segurança.',
    ],
    `Onde a base está, depois do trabalho pronto

  a planilha na nuvem          precisa continuar
  o CSV em Downloads           não precisa
  o CSV na lixeira             ainda está lá
  o anexo na conversa          está no aparelho de quem recebeu`,
    'Apagar da pasta e esquecer a lixeira é meio caminho. O arquivo continua lá, a um clique de voltar.',
    ['descarte', 'cópia', 'lixeira'],
  ),
];

/* ── Os módulos ───────────────────────────────────────────────────────────── */

export const MODULOS_DE_DADOS: ModuloDeVereda[] = [
  {
    id: 'm1',
    titulo: 'Registro, campo e tipo',
    resumo: 'A linha é a pessoa, a coluna é a pergunta — e o tipo decide o que dá para fazer depois.',
    licoes: [
      {
        id: 'm1-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_DADOS['m1-teoria'],
        perguntas: 4,
        titulo: 'O que é um dado, afinal',
        resumo: 'Registro, campo, tipo — e o telefone que parece número.',
        topicos: REGISTRO_E_CAMPO,
      },
      {
        id: 'm1-lab', tipo: 'dados', licao: 'campos',
        titulo: 'Arrumando o formulário de inscrição',
        resumo: 'Três tipos diferentes, e a unidade saindo de uma lista.',
        verificacoes: ['tres-tipos', 'unidade-em-lista', 'diarias-numero'],
      },
    ],
  },
  {
    id: 'm2',
    titulo: 'Obrigatório e validação',
    resumo: 'O que o formulário não deixa passar, e a regra que aceita tudo sem ninguém notar.',
    licoes: [
      {
        id: 'm2-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_DADOS['m2-teoria'],
        perguntas: 4,
        titulo: 'A porta que o formulário fecha',
        resumo: 'Obrigatório, validação, e a regra em branco que não recusa nada.',
        topicos: OBRIGATORIO_E_VALIDACAO,
      },
      {
        id: 'm2-lab', tipo: 'dados', licao: 'validacao',
        titulo: 'Fazendo o formulário recusar',
        resumo: 'E vendo uma resposta boa atravessar as regras que você escreveu.',
        verificacoes: ['um-obrigatorio', 'uma-validacao', 'viu-a-recusa', 'uma-resposta-nova'],
      },
    ],
  },
  {
    id: 'm3',
    titulo: 'Base de dados e relatório',
    resumo: 'Uma planilha guarda e outra mostra, e misturar as duas custa caro.',
    licoes: [
      {
        id: 'm3-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_DADOS['m3-teoria'],
        perguntas: 4,
        titulo: 'Duas planilhas, dois trabalhos',
        resumo: 'Base, relatório, chave — e o TOTAL que vira um inscrito.',
        topicos: BASE_E_RELATORIO,
      },
      {
        id: 'm3-lab', tipo: 'dados', licao: 'base',
        titulo: 'Separando o que guarda do que mostra',
        resumo: 'Tirando o título e o total de dentro da base.',
        verificacoes: ['base-abre-no-cabecalho', 'base-sem-total', 'total-no-relatorio', 'faixa-da-tabela'],
      },
    ],
  },
  {
    id: 'm4',
    titulo: 'O resumo por tabela dinâmica',
    resumo: 'Quantos por unidade — e as dez linhas que denunciam a base.',
    licoes: [
      {
        id: 'm4-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_DADOS['m4-teoria'],
        perguntas: 4,
        titulo: 'O resumo que mostra o problema',
        resumo: 'Ela agrupa pelo que está escrito, e guarda o que leu.',
        topicos: RESUMO,
      },
      {
        id: 'm4-lab', tipo: 'dados', licao: 'resumo',
        titulo: 'Contando quantos por unidade',
        resumo: 'E achando as unidades que o clube não tem.',
        verificacoes: ['criou-o-resumo', 'viu-grupos-demais', 'viu-o-grupo-vazio'],
      },
    ],
  },
  {
    id: 'm5',
    titulo: 'Consertando o preenchimento',
    resumo: 'Acento, caixa, espaço atrás e o ponto no lugar da vírgula.',
    licoes: [
      {
        id: 'm5-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_DADOS['m5-teoria'],
        perguntas: 4,
        titulo: 'O que os olhos não pegam',
        resumo: 'Três diferenças invisíveis, e por que apagar não conserta.',
        topicos: CONSERTO,
      },
      {
        id: 'm5-lab', tipo: 'dados', licao: 'conserto',
        titulo: 'Uma grafia por unidade',
        resumo: 'Sem perder ninguém, e com o resumo atualizado depois.',
        verificacoes: [
          'uma-grafia-por-unidade', 'sem-branco-na-unidade', 'diarias-sao-numero',
          'resumo-com-uma-linha-por-unidade',
        ],
      },
    ],
  },
  {
    id: 'm6',
    titulo: 'CSV',
    resumo: 'A planilha sem a planilha, e a aspa que impede a linha de desandar.',
    licoes: [
      {
        id: 'm6-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_DADOS['m6-teoria'],
        perguntas: 4,
        titulo: 'O formato que todo programa lê',
        resumo: 'Separador, aspas, e o que o arquivo joga fora.',
        topicos: CSV,
      },
      {
        id: 'm6-lab', tipo: 'dados', licao: 'csv',
        titulo: 'Abrindo o arquivo no bloco de notas',
        resumo: 'E provocando a aspa para ver por que ela existe.',
        verificacoes: ['exportou', 'abriu-no-editor', 'fez-a-aspa-aparecer'],
      },
    ],
  },
  {
    id: 'm7',
    titulo: 'A agenda do clube',
    resumo: 'Vinte e cinco pessoas, e um relatório ordenado que não desmancha o cadastro.',
    licoes: [
      {
        id: 'm7-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_DADOS['m7-teoria'],
        perguntas: 4,
        titulo: 'Duas ordens para a mesma gente',
        resumo: 'A ordem de entrada é um dado, e ordenar leva a linha inteira.',
        topicos: AGENDA,
      },
      {
        id: 'm7-lab', tipo: 'dados', licao: 'agenda',
        titulo: 'Gerando o relatório em ordem de nome',
        resumo: 'Sem mexer na agenda, e com cada telefone no lugar.',
        verificacoes: ['relatorio-ordenado', 'linha-inteira'],
      },
    ],
  },
  {
    id: 'm8',
    titulo: 'Dado pessoal e entrega',
    resumo: 'Quais dos dados apontam para alguém, e o que se faz com eles depois.',
    licoes: [
      {
        id: 'm8-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_DADOS['m8-teoria'],
        perguntas: 4,
        titulo: 'O que se guarda, e por quanto tempo',
        resumo: 'Dado pessoal, quem alcança, e a cópia que fica na pasta.',
        topicos: DADO_PESSOAL,
      },
      {
        id: 'm8-lab', tipo: 'dados', licao: 'entrega',
        titulo: 'Classificando e descartando',
        resumo: 'Três cuidados escolhidos, e a cópia exportada fora da pasta.',
        verificacoes: ['classificou-os-pessoais', 'tres-cuidados', 'descartou-a-copia'],
      },
    ],
  },
];
