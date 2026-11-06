import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DE_DADOS } from './questoesDeDados';
import { telasDoTopico } from './telas';

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

/*
 * ── O exemplo é a tela ───────────────────────────────────────────────────
 * Os tópicos que ensinam um gesto trazem as janelas do próprio laboratório,
 * passo a passo — o construtor, o Excel e o Bloco de Notas —, abertas na
 * encomenda da camiseta do clube (`src/exemplos/camisetaDoClube.ts`), e não
 * na inscrição do acampamento, que é a das lições. Eram quadros de texto
 * desenhando tabelas com traços, e citavam as grafias do Falcão e as diárias
 * com ponto que o laboratório manda achar. Os três tópicos do módulo 8 não
 * têm janela: classificar e escolher cuidado são tela da plataforma, e ficam
 * em prosa.
 */
const V = 'CC-ES008';
const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], atencao: string, marcas: string[],
  telas?: [string, string][],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, atencao, marcas,
  ...(telas ? { telas: telasDoTopico(V, id, telas) } : {}),
});

/* ── Módulo 1 — Registro, campo e tipo (requisitos 2.1, 2.2 e 4) ──────────── */

const REGISTRO_E_CAMPO: TopicoDeVereda[] = [
  t(
    'registro-e-campo',
    'A linha é a pessoa; a coluna é a pergunta',
    'Duas palavras que descrevem toda tabela de dados que existe.',
    [
      'Registro é tudo o que se sabe sobre uma coisa. Numa encomenda de camisetas, o registro é um desbravador: o nome dele, a unidade, o telefone do responsável, quanto pagou e o tamanho. Na tabela, o registro é uma linha.',
      'Campo é uma das coisas que se pergunta. "Unidade" é um campo. Ele vale para todo mundo, e cada registro tem a resposta dele. No formulário, o campo é uma pergunta; na tabela, é uma coluna.',
      'Por isso uma tabela de dados tem uma forma só: uma linha por registro, uma coluna por campo, e o cabeçalho na primeira linha dizendo o nome de cada campo. Quem monta diferente disso não tem uma tabela — tem um desenho.',
    ],
    'Duas linhas para a mesma pessoa não são dois registros: são o mesmo registro escrito duas vezes. Quem contar as linhas vai contar um desbravador a mais.',
    ['registro', 'campo', 'cabeçalho'],
    [
      [
        'No construtor, cada cartão é um campo: Nome do desbravador, Unidade, Telefone do responsável, Valor pago.',
        'O construtor de formulários com a encomenda da camiseta do clube aberta. Um círculo envolve os quatro primeiros cartões de pergunta, cada um com o nome do campo à esquerda e o tipo de resposta à direita.',
      ],
      [
        'Na aba Respostas, a linha da Cecília é um registro, e a coluna Unidade é um campo.',
        'A aba Respostas do construtor, com 14 respostas numa tabela. Um círculo marca a linha inteira da Cecília Ramos, da Águia; outro marca a coluna Unidade de cima a baixo, com Tucano, tucano, Águia, Onca, Onça e as outras.',
      ],
    ],
  ),
  t(
    'tipo-de-dado',
    'O tipo diz o que cabe na resposta',
    'Texto, número, data, lista — e cada um deixa fazer uma coisa diferente depois.',
    [
      'Tipo de dado é o que aquele campo aceita. Número aceita quantidade e valor, e entra em conta. Data aceita dia e entra em ordem de calendário. Texto aceita qualquer coisa e não entra em conta nenhuma.',
      'A escolha do tipo não é um detalhe de aparência: ela decide o que você vai conseguir fazer com aquela coluna daqui a um mês. Valor guardado como texto não soma. Data guardada como texto ordena em ordem alfabética, e aí 10 de janeiro vem antes de 2 de fevereiro.',
      'E ela decide o que o formulário oferece a quem responde. Um campo de lista só deixa escolher o que está na lista; um campo de texto deixa escrever qualquer coisa, inclusive a mesma coisa de quatro jeitos diferentes.',
    ],
    'O requisito conta tipos, e não campos. Cinco perguntas de resposta curta são cinco campos e um tipo só.',
    ['tipo de dado', 'número', 'data', 'texto'],
    [
      [
        'O tipo se troca no menu à direita do cartão: Resposta curta, Parágrafo, Múltipla escolha, Caixas de seleção, Lista suspensa, Número e Data.',
        'O cartão Valor pago (R$) ativo, com o menu de tipo aberto e circulado. A lista mostra sete tipos de resposta, com Resposta curta marcada.',
      ],
      [
        'Escolhido Número, o cartão do valor passa a dizer Número, e a planilha vai poder somar a coluna.',
        'O mesmo cartão depois da escolha. O seletor circulado mostra o símbolo # e a palavra Número; os outros cartões continuam em Resposta curta e Parágrafo.',
      ],
    ],
  ),
  t(
    'telefone-parece-numero',
    'Telefone parece número e é texto',
    'E escolher Número não dá erro: ele aceita, e joga fora o que importa.',
    [
      'Telefone tem parênteses, traço e às vezes um zero na frente. Nada disso é conta — é forma de escrever. Num programa que guarda o telefone como número, o campo aceita sem reclamar e devolve 61981234501, sem os parênteses, sem o traço e sem o zero que vinha antes.',
      'O teste é sempre o mesmo: essa coisa entra em conta? Somar dois telefones não quer dizer nada. Tirar a média de dois CEPs não quer dizer nada. Se a conta não faz sentido, o campo é texto.',
      'Número serve para quantidade, valor e medida. Quanto foi pago é número. Telefone, CEP, número da casa e código de inscrição são texto — e, se a forma importa, quem a garante é a validação de telefone, que recusa o que não vier escrito do jeito combinado.',
    ],
    'O estrago aparece meses depois, quando alguém precisa ligar. A planilha continua bonita, e ninguém sabe qual telefone perdeu o zero.',
    ['texto', 'número', 'telefone'],
    [
      [
        'O telefone fica em Resposta curta, que é texto; o valor pago é que vira Número.',
        'Os cartões Telefone do responsável e Valor pago (R$), com os dois seletores de tipo circulados: o do telefone diz Resposta curta, o do valor diz Número.',
      ],
      [
        'Com a validação de telefone, a visualização recusa quem escreve só os números, e diz o formato certo.',
        'A visualização do formulário. No campo Telefone do responsável alguém escreveu 61981234599; logo abaixo, em vermelho e circulado, o recado: use o formato (61) 99999-0000.',
      ],
    ],
  ),
  t(
    'lista-em-vez-de-texto',
    'Em texto livre, cada um escreve de um jeito',
    'E foi assim que o Tucano virou três unidades diferentes.',
    [
      'Um campo de texto aceita qualquer coisa. Perguntando a unidade em texto livre, uma família escreve Tucano, outra escreve tucano, outra escreve TUCANO, e outra deixa um espaço atrás sem perceber.',
      'Para quem lê, são todas a mesma unidade. Para a planilha, são coisas diferentes — e qualquer conta por unidade vai devolver várias linhas onde deveria haver uma.',
      'A lista resolve na origem: quem responde escolhe, e não digita. Seis unidades na lista, seis respostas possíveis, e nenhuma delas com espaço atrás.',
    ],
    'Consertar depois é possível e custa caro: é o módulo 5 inteiro. Perguntar certo na origem custa um clique.',
    ['lista suspensa', 'texto livre', 'inconsistência'],
    [
      [
        'Em texto livre, a coluna Unidade chegou com Tucano, tucano, TUCANO, Onca, Onça e uma resposta em branco.',
        'A aba Respostas do construtor, com a coluna Unidade circulada de cima a baixo. Aparecem Tucano, tucano, Águia, Onca, Onça, TUCANO, Arara, uma célula vazia, Jaguar, Falcão e outras.',
      ],
      [
        'A troca é no menu de tipo do cartão Unidade: Lista suspensa.',
        'O cartão Unidade com o menu de tipo aberto; o item Lista suspensa está circulado, entre Caixas de seleção e Número.',
      ],
    ],
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
      'Ele serve para o que o clube não pode ficar sem. O telefone do responsável é isso: sem ele não há como avisar que a camiseta chegou. O tamanho escrito com observação não é: quem não tem nada a acrescentar não tem o que escrever.',
      'E ele vale só daqui para a frente. As respostas que já chegaram com o campo vazio continuam vazias — ligar o interruptor não volta no tempo e não avisa ninguém.',
    ],
    'Marcar tudo como obrigatório não é rigor: é o jeito mais rápido de alguém desistir de responder no meio.',
    ['obrigatório', 'campo'],
    [
      [
        'O interruptor Obrigatório fica no pé do cartão; ligado, ele fica roxo.',
        'O cartão Telefone do responsável, com o interruptor Obrigatório circulado e ligado, em roxo.',
      ],
      [
        'Na visualização, quem envia sem o telefone recebe o recado e a resposta não sai.',
        'A visualização do formulário com um asterisco vermelho ao lado de Telefone do responsável. O campo está vazio e, circulado embaixo dele, o recado: Telefone do responsável: é obrigatório.',
      ],
      [
        'Na aba Respostas, a encomenda do Lucas continua sem telefone: o obrigatório não volta no tempo.',
        'A aba Respostas, com 14 respostas. Na linha do Lucas Brandão, a célula do telefone está vazia e circulada.',
      ],
    ],
  ),
  t(
    'o-que-e-validacao',
    'Validação é a regra dentro do que o tipo deixa caber',
    'O tipo diz o que cabe; a validação diz o que vale.',
    [
      'O tipo diz como a resposta chega à planilha: como número que entra em conta, ou como texto. A validação aperta mais: entre 30 e 120, no máximo 200 caracteres, tem que parecer um telefone.',
      'São duas coisas separadas porque respondem a perguntas diferentes. "Isto vai entrar em conta?" é tipo. "Este número faz sentido para a pergunta que eu fiz?" é validação — ninguém paga 375 reais por uma camiseta de 37,50.',
      'A validação recusa na hora, com a pessoa ainda na tela. É a única correção que não custa nada: depois que a resposta entrou, consertar significa ligar para a família e perguntar de novo.',
    ],
    'Validação não é o mesmo que verdade. Um telefone com a forma certa pode não ser de ninguém, e a regra aceita.',
    ['validação', 'tipo de dado'],
    [
      [
        'No menu de três pontos do cartão, Validação de resposta abre a regra: aqui, um número entre 30 e 120.',
        'A caixa Validação de resposta circulada, por cima do construtor. A resposta precisa ser: É um número entre; De 30; Até 120; e os botões Cancelar e Salvar.',
      ],
      [
        'Na visualização, 375 é recusado: precisa estar entre 30 e 120.',
        'A visualização do formulário. No campo Valor pago (R$) está escrito 375, e o recado vermelho circulado embaixo diz: precisa estar entre 30 e 120.',
      ],
    ],
  ),
  t(
    'regra-sem-numero',
    'Regra sem o número que ela precisa aceita tudo',
    'A caixa fica escrita na tela, e não recusa nada.',
    [
      'As regras de faixa precisam de números: "entre" precisa de dois, "no máximo" precisa de um. Escolher a regra e deixar a caixa em branco cria uma regra que existe e não faz nada.',
      'Pior: ela pode fazer o contrário do que você quis. Um campo em branco costuma valer zero, então "entre" com as duas caixas vazias vira "entre zero e zero", que recusa todo mundo — e "no mínimo" em branco vira "de zero para cima", que aceita todo mundo.',
      'O jeito de saber é o mesmo de sempre: visualizar o formulário e tentar responder errado de propósito. Se ele aceitar o que devia recusar, a regra não está de pé.',
    ],
    'Interruptor que você liga e nunca vê agir é interruptor que pode não estar fazendo nada. Teste sempre com uma resposta errada.',
    ['validação', 'faixa'],
    [
      [
        'Com a regra escolhida e as duas caixas vazias, o aviso amarelo diz que ela não recusa nada.',
        'A caixa Validação de resposta com É um número entre escolhido e as caixas De e Até vazias. Circulado, o aviso amarelo: do jeito que está, esta regra não recusa nada: ela precisa do número que a completa.',
      ],
      [
        'Só com o De preenchido, o aviso continua: falta o outro lado da faixa.',
        'A mesma caixa com 30 em De e Até ainda vazio; o aviso amarelo circulado continua na tela.',
      ],
      [
        'Com De 30 e Até 120, o aviso some: agora a regra recusa o que ficar de fora.',
        'A caixa com 30 em De e 120 em Até, as duas circuladas, e nenhum aviso abaixo delas.',
      ],
    ],
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
      'O relatório mostra o que se conclui: quantos por unidade, quanto foi recebido, quem falta pagar. Ele tem título, tem total, tem espaço em branco onde fica melhor de ler.',
      'Misturar as duas parece organização e é o contrário. Um título solto em cima empurra o cabeçalho para a segunda linha, e quem procurar a primeira coluna acha o título. Um TOTAL embaixo dos registros é uma linha como as outras para quem lê a tabela: ele entra na contagem como se fosse mais uma encomenda.',
      'O conserto é tirar as duas linhas da aba de respostas e pôr a conta na aba Relatório, onde ela pode ter título à vontade.',
    ],
    'O erro não estoura: a planilha misturada abre, soma e imprime. O que ela faz é contar o TOTAL como uma encomenda, e ninguém confere.',
    ['base de dados', 'relatório', 'aba'],
    [
      [
        'A pasta como chegou: um título em A1 e uma linha TOTAL embaixo dos registros, as duas dentro da base.',
        'O Excel com a aba Respostas aberta. Circulados, o título Encomendas da camiseta 2026 na célula A1, acima do cabeçalho, e a linha 18 com TOTAL na coluna A e 562,50 na coluna E.',
      ],
      [
        'Depois de Excluir Linhas da Planilha nas duas, o cabeçalho volta para a linha 1 e só sobram registros.',
        'A mesma aba depois das exclusões: a linha 1 circulada tem o cabeçalho Enviado em, Nome do desbravador, Unidade, Telefone do responsável, Valor pago (R$) e Tamanho, e as linhas 2 a 15 têm as catorze encomendas.',
      ],
    ],
  ),
  t(
    'chave',
    'Chave é o que não se repete',
    'É por ela que um registro se acha e se distingue de outro parecido.',
    [
      'Chave é o campo — ou a combinação de campos — que identifica um registro sem ambiguidade. Num clube, dois desbravadores podem ter o mesmo nome. O nome, então, não serve de chave.',
      'O que serve é algo que nasce único: um código de inscrição, o instante exato em que a resposta chegou, um número de matrícula. O formulário grava o instante do envio — a coluna Enviado em — justamente por isso.',
      'Sem chave, não há como dizer se duas linhas parecidas são duas pessoas ou a mesma pessoa que respondeu duas vezes. Mesmo instante e mesmas respostas é a mesma pessoa que apertou Enviar duas vezes; instantes diferentes e unidades diferentes são duas pessoas. E a decisão muda a conta: o clube encomenda quantas camisetas?',
    ],
    'Chave não é o primeiro campo da tabela nem o campo mais importante. É o que não se repete.',
    ['chave', 'registro', 'duplicata'],
    [
      [
        'Duas Kátia Nunes: o nome se repete, mas o instante do envio e a unidade não. São duas pessoas.',
        'A aba Respostas no Excel. Circulados nas linhas 12 e 13: os dois nomes Kátia Nunes, os instantes 2026-08-06T17:14 e 2026-08-06T19:52, e as unidades Águia e Falcão.',
      ],
    ],
  ),
  t(
    'importar',
    'Importar é trazer as respostas para a planilha',
    'E o que chega é o que foi digitado, com os erros junto.',
    [
      'O formulário guarda as respostas dele. Importar cria uma planilha com uma linha por resposta e uma coluna por pergunta, mais a coluna do instante em que cada uma chegou.',
      'O que chega é exatamente o que as pessoas escreveram. A importação não conserta acento, não tira espaço atrás e não junta o que está escrito de três jeitos — e é bom que não junte: consertar por baixo esconderia o problema em vez de mostrá-lo.',
      'Por isso o trabalho começa aqui e não acaba aqui. A planilha importada é matéria-prima: ela precisa virar base antes de virar relatório.',
    ],
    'Quem "arruma" a planilha importada pondo título em cima e total embaixo acabou de transformar a base em relatório.',
    ['importar', 'base de dados'],
    [
      [
        'A importação traz tudo como foi digitado: tucano em minúscula, o 37.5 com ponto e a unidade do Heitor em branco.',
        'A aba Respostas importada no Excel. Circuladas, três células: tucano na coluna Unidade da linha 4, 37.5 encostado à esquerda na coluna Valor pago da linha 8, e a célula vazia da Unidade na linha 10.',
      ],
    ],
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
      'Ela não muda a tabela de origem. É um resumo desenhado em outro lugar — na aba Relatório, que é onde resumo mora.',
      'A conta pode ser contagem, soma ou média. Contagem conta linhas: quantas encomendas por unidade. Soma soma valores: quanto cada unidade pagou. São perguntas diferentes, e o número que sai é diferente.',
    ],
    'Contagem e soma respondem coisas diferentes. Trocar uma pela outra dá um número plausível e errado.',
    ['tabela dinâmica', 'contagem', 'soma'],
    [
      [
        'Em Inserir › Tabela dinâmica, escolhe-se o que vira linha (Unidade), de que coluna (Valor pago) e a conta (Contagem).',
        'A caixa Criar tabela dinâmica circulada, por cima da aba Respostas. Linhas: Unidade; Valores: Valor pago (R$); Resumir por: Contagem; e os botões Cancelar e Criar.',
      ],
      [
        'O resumo aparece na aba Relatório: uma linha por unidade, com quantas encomendas cada uma tem.',
        'A aba Relatório com o resumo circulado a partir da célula A4: Rótulos de Linha e Contagem no cabeçalho, e embaixo Tucano 1, tucano 1, Águia 2, Onca 1, Onça 1, TUCANO 1, Arara 1, (vazio) 1, Jaguar 1, Falcão 3 e Jaguar 1.',
      ],
    ],
  ),
  t(
    'agrupa-pelo-escrito',
    'Ela agrupa pelo que está escrito',
    'E é assim que ela mostra o que a base tem de errado.',
    [
      'A tabela dinâmica junta as linhas que têm o mesmo valor escrito na coluna escolhida. Mesmo valor escrito, e não mesmo valor pretendido: Tucano e tucano são duas coisas, e viram dois grupos.',
      'Isso parece um defeito e é a coisa mais útil que ela faz. Um clube com seis unidades que vê onze linhas no resumo acabou de descobrir que algumas respostas estão escritas de outro jeito — sem procurar, sem conferir uma a uma.',
      'E há sempre uma linha a mais para procurar: o grupo escrito "(vazio)". Ele é quem não respondeu aquela pergunta. Conta no total e não pertence a unidade nenhuma.',
    ],
    'O total de encomendas fica certo mesmo com os grupos errados. É por isso que ninguém percebe olhando só o total.',
    ['tabela dinâmica', 'agrupamento', 'vazio'],
    [
      [
        'Seis unidades e onze linhas: tucano, Onca, TUCANO, (vazio) e um segundo Jaguar são o que a base tem de errado.',
        'A aba Relatório com o resumo por unidade. Circulados na coluna A: tucano, Onca, TUCANO, (vazio) e o último Jaguar, que aparece de novo na linha 15 além do Jaguar da linha 13.',
      ],
    ],
  ),
  t(
    'guarda-o-que-leu',
    'Ela guarda o que leu, e não se refaz sozinha',
    'Consertar a base não muda o resumo, e nada na tela avisa.',
    [
      'A tabela dinâmica é um retrato: ela lê a origem no momento em que é criada e guarda o resultado. Depois disso, mexer na base não muda nada nela.',
      'Então a sequência certa é consertar e mandar atualizar. Quem conserta e não atualiza continua vendo os grupos velhos; quem atualiza sem consertar continua vendo os mesmos grupos também. Só as duas coisas juntas dão uma linha por unidade.',
      'O botão fica em Dados › Atualizar Tudo. É a mesma armadilha do sumário de um documento, que continua mostrando o título antigo depois de você trocá-lo. O retrato não envelhece sozinho — ele só não é mais verdade.',
    ],
    'Nada na tela diz que o resumo está velho. Ele mostra números plausíveis, que é o que se espera de um resumo funcionando.',
    ['tabela dinâmica', 'atualizar', 'retrato'],
    [
      [
        'O tucano do Bernardo já foi corrigido para Tucano na aba Respostas, e o resumo continua com as duas linhas.',
        'A aba Relatório depois do conserto na base. Circuladas, as duas primeiras linhas do resumo: Tucano 1 e tucano 1.',
      ],
      [
        'Em Dados › Atualizar Tudo, o resumo relê a base, e as duas viram uma: Tucano 2.',
        'A guia Dados aberta, com o botão Atualizar circulado. No resumo, a linha Tucano circulada agora mostra 2, e a linha tucano sumiu.',
      ],
    ],
  ),
];

/* ── Módulo 5 — Consertar inconsistências (requisito 5.2) ─────────────────── */

const CONSERTO: TopicoDeVereda[] = [
  t(
    'mesma-coisa-escrita-diferente',
    'Três diferenças que os olhos não pegam',
    'Acento, caixa e o espaço atrás.',
    [
      'Onça e Onca diferem por um acento — aqui, a cedilha. Tucano e TUCANO diferem por caixa. Jaguar e "Jaguar " diferem por um espaço no fim, que não aparece na tela de jeito nenhum.',
      'Para a planilha, as três diferenças valem o mesmo: são valores diferentes. A conta por unidade, a classificação e o PROCV tratam cada um como um item à parte.',
      'O espaço atrás é o mais cruel dos três, porque é invisível — nem a barra de fórmulas o mostra. Duas células podem parecer idênticas, lado a lado, e não casar em conta nenhuma. Quando uma linha aparece duas vezes num agrupamento sem explicação, é ele.',
    ],
    'O jeito de achar o espaço atrás não é olhar: é agrupar. A tabela dinâmica mostra dois grupos com o mesmo nome escrito.',
    ['inconsistência', 'espaço', 'acento'],
    [
      [
        'Na base, tucano, Onca, TUCANO e o Jaguar da linha 14; na barra de fórmulas, o Jaguar parece igual a qualquer outro.',
        'A aba Respostas com quatro células circuladas na coluna Unidade: tucano, Onca, TUCANO e Jaguar na linha 14, que está selecionada. A barra de fórmulas, também circulada, mostra só a palavra Jaguar.',
      ],
      [
        'No resumo, Jaguar aparece duas vezes: uma das duas tem o espaço que ninguém vê.',
        'A aba Relatório com o resumo por unidade. Circuladas, as linhas 13 e 15, as duas escritas Jaguar, cada uma com contagem 1.',
      ],
    ],
  ),
  t(
    'arrumar-nao-e-apagar',
    'Arrumar não é apagar',
    'O caminho rápido resolve a coluna e perde o desbravador.',
    [
      'Diante das linhas com a unidade escrita errado, o gesto mais rápido é apagar todas. A coluna fica impecável, o resumo fica com seis grupos, e o clube fica com menos encomendas do que recebeu.',
      'O mesmo vale para a linha sem unidade. Apagar resolve o grupo "(vazio)" perdendo uma pessoa que encomendou de verdade. O que ela não escolheu foi a unidade — ela não deixou de existir, e o dinheiro dela entrou.',
      'Consertar é descobrir e escrever: ligar para a família, perguntar de que unidade é, e preencher. O dado que falta vem de fora da planilha, sempre. A planilha não sabe.',
    ],
    'Nenhuma tela reclama de uma linha apagada. O erro aparece no dia da entrega, com uma camiseta paga e sem dono na lista.',
    ['conserto', 'registro'],
    [
      [
        'A encomenda do Heitor chegou sem unidade, mas com telefone, valor e tamanho: é alguém que pagou.',
        'A aba Respostas com a linha 9 inteira circulada: 2026-08-05T13:22, Heitor Vaz, a célula de Unidade vazia, o telefone, 37,50 e o tamanho M.',
      ],
      [
        'A família disse que ele é da Arara, e a célula se preenche: a linha continua lá.',
        'A mesma aba com a célula C9 circulada mostrando Arara; a caixa de nome diz C9 e a barra de fórmulas mostra Arara.',
      ],
    ],
  ),
  t(
    'numero-que-e-texto',
    'Número guardado como texto some da soma',
    'E deixa um total plausível e menor.',
    [
      'No Brasil, o separador decimal é a vírgula. Quem escreve 37.5 numa planilha brasileira não escreveu trinta e sete e meio: escreveu um texto que parece número, e a planilha o trata como texto.',
      'A soma pula texto. Com uma célula assim na coluna, o total sai menor e não há erro em lugar nenhum — ele continua sendo um valor que cabe na realidade.',
      'Há duas pistas, e as duas são fracas sozinhas. A primeira é o alinhamento: número encosta à direita, texto encosta à esquerda. A segunda é contar: selecionando a coluna, a barra de status conta catorze células e soma só as que são número.',
    ],
    'Apagar a célula não é consertar: tira o ponto e tira o valor junto, e a coluna fica com um buraco no lugar do defeito.',
    ['número', 'texto', 'separador decimal'],
    [
      [
        'Com a coluna selecionada, o 37.5 encosta à esquerda, e a barra de status conta 14 e soma 562,50.',
        'A coluna Valor pago selecionada de E2 a E15. Circulados, a célula E7 com 37.5 encostado à esquerda, enquanto os outros valores encostam à direita, e a barra de status, que diz Média 43,27, Contagem 14 e Soma 562,50.',
      ],
      [
        'Reescrito como 37,5, ele encosta à direita, e a soma sobe para 600.',
        'A mesma seleção depois do conserto. A célula E7 circulada mostra 37,50 à direita, como as outras, e a barra de status diz Média 42,86, Contagem 14 e Soma 600.',
      ],
    ],
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
      'Ele existe porque todo programa lê texto. Uma pasta do Excel só o Excel abre direito; um CSV abre no Excel, no Google Planilhas, num programa de banco de dados e no Bloco de Notas. É o formato para mandar dados de um lugar para outro.',
      'O preço é que ele guarda só isso. Sem cor, sem negrito, sem fórmula, sem largura de coluna e sem as outras abas. O que ele guarda é o resultado, e não a conta que o produziu. Para salvar, é Arquivo › Salvar como, e o tipo CSV.',
    ],
    'Salvar uma pasta de trabalho como CSV guarda a aba ativa e joga fora as outras — o Excel avisa uma vez, em letra miúda.',
    ['CSV', 'texto puro', 'cabeçalho'],
    [
      [
        'Em Arquivo › Salvar como, o tipo é CSV (separado por ponto e vírgula), e o aviso diz o que fica para trás.',
        'A caixa Salvar como circulada sobre o Excel. Nome do arquivo: camisetas-2026-08-14-v01. Tipo: CSV (separado por ponto e vírgula). Embaixo, o aviso: este tipo de arquivo guarda só a planilha ativa, e sem cor, sem fórmula e sem as outras abas.',
      ],
      [
        'Aberto no Bloco de Notas, o arquivo é isto: texto, uma linha por encomenda.',
        'O Bloco de Notas com o arquivo camisetas-2026-08-14-v01.csv aberto e o texto circulado: a linha do cabeçalho e uma linha por encomenda, com os campos separados por ponto e vírgula.',
      ],
    ],
  ),
  t(
    'o-separador',
    'O separador muda de país',
    'E é por isso que aqui ele costuma ser ponto e vírgula.',
    [
      'O nome do formato fala em vírgula, e em inglês é vírgula mesmo. No Brasil não dá: a vírgula já é o separador decimal, e 37,5 viraria duas colunas — uma com 37 e outra com 5.',
      'Por isso os programas brasileiros usam ponto e vírgula. Um arquivo gerado aqui e aberto lá — ou o contrário — mostra tudo numa coluna só, porque o programa procurou o separador errado.',
      'Não há como adivinhar olhando de longe: quem gerou o arquivo é quem sabe. Abrir no Bloco de Notas e olhar a primeira linha resolve em dois segundos.',
    ],
    'Arquivo que abre com tudo numa coluna só quase nunca está corrompido: é o separador errado.',
    ['separador', 'vírgula', 'ponto e vírgula'],
    [
      [
        'Na planilha, a encomenda da Alice ocupa seis células, uma por campo.',
        'A aba Respostas no Excel com a linha 2 circulada: 2026-08-03T18:05, Alice Fontes, Tucano, (61) 98123-4501, 37,50 e M.',
      ],
      [
        'No Bloco de Notas, as mesmas seis viram uma linha com ponto e vírgula entre elas — e o 37,5 mantém a vírgula dele.',
        'O Bloco de Notas com o CSV aberto e o texto circulado. A segunda linha diz 2026-08-03T18:05;Alice Fontes;Tucano;(61) 98123-4501;37,5;M.',
      ],
    ],
  ),
  t(
    'as-aspas',
    'Quando o separador aparece dentro da resposta',
    'O arquivo põe aspas em volta dela, e é por isso que ele funciona.',
    [
      'Se o separador é ponto e vírgula e alguém escreveu um ponto e vírgula dentro da resposta, a linha desandaria: aquele pedaço viraria uma coluna nova, e todas as seguintes andariam um lugar para o lado.',
      'A saída é padrão em todo CSV: quando o valor contém o separador, ele sai entre aspas. Quem lê o arquivo sabe que o que está entre aspas é um valor só, com separador e tudo dentro.',
      'E se o valor tiver uma aspa dentro dele, ela é escrita duas vezes. É a mesma ideia levada um passo adiante: o formato precisa de um jeito de dizer "esta aspa é do texto, e não a que fecha o valor".',
    ],
    'As aspas não fazem parte da resposta. Quem as vê no Bloco de Notas e as apaga acabou de quebrar o arquivo.',
    ['aspas', 'separador', 'CSV'],
    [
      [
        'A Íris escreveu um ponto e vírgula dentro do tamanho: M; manga longa, se tiver.',
        'A aba Respostas no Excel com a célula F10 circulada, que diz M; manga longa, se tiver.',
      ],
      [
        'No arquivo, essa resposta sai entre aspas, e a linha dela continua com seis campos.',
        'O Bloco de Notas com o CSV aberto e o texto circulado. Na linha da Íris Campelo, o último campo aparece como "M; manga longa, se tiver", entre aspas.',
      ],
    ],
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
      'Por isso o pedido é gerar um relatório ordenado, e não ordenar a agenda. O relatório é outra aba, com as mesmas pessoas copiadas, formatadas como tabela e classificadas de A a Z. A agenda fica como está.',
    ],
    'Ordenar a própria agenda parece resolver e é o que não tem volta: a lista fica em ordem alfabética e a ordem de entrada não existe mais.',
    ['agenda', 'relatório', 'ordenação'],
    [
      [
        'A agenda dos instrutores, na ordem em que foram convidados: Rogério primeiro, Helena por último.',
        'A aba Agenda no Excel com os nomes circulados de A2 a A9: Rogério Paiva, Dona Zélia Pinto, Caio Medeiros, Tânia Freitas, Augusto Leme, Mirela Duarte, Benedito Sá e Helena Brito.',
      ],
      [
        'Copiada para a aba Agenda em ordem e classificada de A a Z, a mesma gente sai em ordem de nome.',
        'A aba Agenda em ordem, também circulada no pé da janela, com os nomes circulados de A2 a A9: Augusto Leme, Benedito Sá, Caio Medeiros, Dona Zélia Pinto, Helena Brito, Mirela Duarte, Rogério Paiva e Tânia Freitas.',
      ],
    ],
  ),
  t(
    'linha-inteira',
    'Ordenar leva a linha inteira, sempre',
    'Ordenar só a coluna do nome embaralha o cadastro.',
    [
      'Quando se ordena por nome, cada nome tem que viajar com o telefone dele, o endereço dele e o e-mail dele. É a linha que troca de lugar, e não a célula.',
      'Selecionar só a coluna do nome e mandar ordenar, num programa que deixa, faz exatamente o que foi pedido: ordena aquela coluna. As outras ficam onde estavam, e o resultado é um cadastro em que cada pessoa está ao lado do telefone de outra.',
      'E não dá erro. A tabela continua com o mesmo número de linhas, nomes e telefones, todos plausíveis. O jeito de evitar é declarar a tabela inteira antes de ordenar — em Inserir › Formatar como Tabela —, e conferir uma pessoa nas duas abas depois.',
    ],
    'Não há desfazer depois de salvar e fechar. O cadastro continua parecendo certo, e ninguém confere telefone por telefone.',
    ['ordenação', 'tabela', 'cadastro'],
    [
      [
        'No relatório ordenado, o Augusto Leme veio com o telefone, o endereço e o e-mail dele.',
        'A aba Agenda em ordem com a linha 2 circulada: Augusto Leme, (61) 99410-2205, Quadra 7, casa 2, augusto.leme@exemplo.com.',
      ],
      [
        'Na agenda, a linha dele diz a mesma coisa: a linha inteira viajou junto.',
        'A aba Agenda com a linha 6 circulada: Augusto Leme, (61) 99410-2205, Quadra 7, casa 2, augusto.leme@exemplo.com.',
      ],
    ],
  ),
  t(
    'quatro-campos',
    'Quatro campos, quatro jeitos de alcançar alguém',
    'E cada um falha de um jeito diferente.',
    [
      'O requisito pede nome, endereço, telefone e endereço eletrônico. Não é excesso: cada um serve a uma situação, e nenhum serve a todas.',
      'Telefone alcança na hora e falha quando o número muda de dono. E-mail alcança quem está longe e falha quando ninguém lê a caixa. Endereço serve para mandar o que é de papel e para saber quem mora perto de quem — útil na hora de organizar carona.',
      'Um cadastro com um campo só é um cadastro que para de funcionar no dia em que aquele campo envelhece. Com quatro, sempre sobra por onde tentar.',
    ],
    'Cadastro que ninguém revisa envelhece calado: o telefone continua lá, certinho, e pertence a outra pessoa.',
    ['cadastro', 'campo'],
    [
      [
        'O cabeçalho da agenda: Nome, Telefone, Endereço e E-mail, um campo por coluna.',
        'A aba Agenda no Excel com a linha 1 circulada: Nome, Telefone, Endereço e E-mail, e embaixo os oito instrutores.',
      ],
    ],
  ),
];

/* ── Módulo 8 — Dado pessoal e entrega (requisitos 7 e 8) ─────────────────── */

const DADO_PESSOAL: TopicoDeVereda[] = [
  t(
    'o-que-e-dado-pessoal',
    'Dado pessoal é o que aponta para uma pessoa',
    'Sozinho ou junto com os outros da mesma linha.',
    [
      'Nome aponta para uma pessoa. Telefone e e-mail apontam e ainda dizem como falar com ela. Endereço diz onde ela mora. Uma observação sobre comida diz o que ela come, e às vezes por quê — uma alergia, uma religião, um remédio.',
      'A unidade, sozinha, não aponta para ninguém: metade do clube está nas mesmas seis unidades. Mas ela está na mesma linha que o nome, e é isso que transforma a tabela inteira num conjunto de dados pessoais — não é cada coluna que importa, é a linha.',
      'Dado de criança e de adolescente pede mais cuidado ainda, e é disso que o cadastro de um clube é feito. Quem coleta assume a responsabilidade por ele.',
    ],
    'Marcar tudo como pessoal não é classificar — é marcar. Classificar é olhar cada campo e decidir.',
    ['dado pessoal', 'campo', 'registro'],
  ),
  t(
    'guarda',
    'Guardar bem é decidir quem alcança',
    'E a pasta compartilhada alcança o que está dentro dela.',
    [
      'O primeiro cuidado é o mais simples e o mais esquecido: só quem precisa dos dados tem acesso ao arquivo. Não é desconfiança de ninguém — é que cada pessoa a mais é um computador a mais de onde a lista pode sair.',
      'E acesso não é só o que está escrito na caixa do arquivo. Um arquivo restrito dentro de uma pasta compartilhada com o clube inteiro continua com o "só você" escrito nele, e todo mundo o abre — a permissão da pasta alcança o que está dentro. O conserto é mover o arquivo, e não mexer na caixa dele; é a lição da pasta na vereda de Trabalho Compartilhado.',
      'Pôr senha no arquivo parece um cuidado e não é: quem sabe a senha salva sem ela, e a partir daí o arquivo circula aberto. É pedido, e não trava.',
    ],
    'Nenhuma tela diz "este arquivo está aberto para o clube inteiro". Só quem olha a pasta acima dele descobre.',
    ['guarda', 'acesso', 'pasta'],
  ),
  t(
    'descarte',
    'Descartar é o cuidado que ninguém lembra',
    'A cópia exportada continua na pasta de downloads.',
    [
      'Durante o trabalho, o arquivo é copiado várias vezes: exporta-se o CSV, manda-se uma cópia por mensagem, baixa-se outra no computador do clube. Cada cópia é mais um lugar de onde a lista pode sair, e nenhuma delas tem dono.',
      'O CSV é o pior de todos, porque é texto puro: qualquer pessoa que abrir o computador lê a base inteira sem precisar de programa nenhum — foi o que o Bloco de Notas mostrou no módulo 6.',
      'Então o descarte tem prazo e tem lugar. Acabado o trabalho, a planilha na nuvem continua; o CSV em Downloads sai, e sai da lixeira também; e o anexo mandado por mensagem está no aparelho de quem recebeu, e é a essa pessoa que se pede para apagar. Guardar tudo para sempre por segurança é o contrário de segurança.',
    ],
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
