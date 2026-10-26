import type { Question } from '../types';

/*
 * As questões das lições de teoria da CC005 SQL.
 *
 * A definição vale uma vez por lição; o resto é consequência e diagnóstico —
 * a consulta que volta vazia sem erro, a junção que perde alguém, a média que
 * conta o vazio, o UPDATE que muda as duas Anas, o commit que faltou. Toda
 * errada diz por que está errada no campo porque, a certa é uma afirmação
 * curta e o porquê dela mora no explanation. Sem crase nem asterisco: a
 * questão vai para o QuestionRenderer, que imprime texto puro.
 */

const v = (porque?: string) => ({ id: 'v', text: 'Verdadeiro', ...(porque ? { porque } : { correct: true }) });
const f = (porque?: string) => ({ id: 'f', text: 'Falso', ...(porque ? { porque } : { correct: true }) });

export const QUESTOES_DE_SQL: Record<string, Question[]> = {
  /* ── Módulo 1 — o banco de dados (requisitos 2.1, 2.2, 2.5 e 2.6) ──────── */
  'm1-teoria': [
    {
      id: 'SQL-M1-Q1', type: 'multiple_choice',
      prompt: 'O que é um sistema gerenciador de banco de dados?',
      data: { options: [
        { id: 'a', text: 'O programa que guarda e devolve os dados do banco.', correct: true },
        { id: 'b', text: 'A pessoa responsável pela secretaria do clube.', porque: 'Quem cuida do banco é um programa, e não uma pessoa.' },
        { id: 'c', text: 'O arquivo em que as tabelas ficam gravadas.', porque: 'O arquivo é onde o banco mora; o gerenciador é quem o abre e mexe nele.' },
        { id: 'd', text: 'Uma planilha com várias abas.', porque: 'Planilha não confere regra de coluna nenhuma, e o gerenciador confere.' },
      ]},
      explanation: 'SQLite, PostgreSQL e MySQL são gerenciadores: recebem o pedido, conferem e respondem.',
    },
    {
      id: 'SQL-M1-Q2', type: 'multiple_choice',
      prompt: 'Na tabela de membros, o que é uma linha?',
      data: { options: [
        { id: 'a', text: 'Um membro do clube.', correct: true },
        { id: 'b', text: 'A idade de todos os membros.', porque: 'A idade de todos é uma coluna, que atravessa as linhas.' },
        { id: 'c', text: 'O nome da tabela.', porque: 'O nome identifica a tabela, e não uma das coisas guardadas nela.' },
        { id: 'd', text: 'Uma unidade e seus membros.', porque: 'Unidade é assunto de outra tabela.' },
      ]},
      explanation: 'Cada linha é uma coisa do assunto da tabela; cada coluna é um dado que toda linha tem.',
    },
    {
      id: 'SQL-M1-Q3', type: 'multiple_choice',
      prompt: 'Você quer ver só o nome e o conselheiro de cada unidade. Qual consulta pede isso?',
      data: { options: [
        { id: 'a', text: 'SELECT nome, conselheiro FROM unidades;', correct: true },
        { id: 'b', text: 'SELECT * FROM unidades;', porque: 'O asterisco traz as quatro colunas, e não só as duas pedidas.' },
        { id: 'c', text: 'SELECT unidades FROM nome, conselheiro;', porque: 'As colunas vêm depois do SELECT, e a tabela depois do FROM.' },
        { id: 'd', text: 'FROM unidades SELECT nome;', porque: 'O SELECT vem primeiro, e o conselheiro ficou de fora.' },
      ]},
      explanation: 'SELECT diz as colunas e FROM diz a tabela, nessa ordem.',
    },
    {
      id: 'SQL-M1-Q4', type: 'multiple_choice',
      prompt: 'Depois de rodar SELECT nome AS Unidade FROM unidades, o que aconteceu com a tabela?',
      data: { options: [
        { id: 'a', text: 'Nada: o nome novo vale só no resultado.', correct: true },
        { id: 'b', text: 'A coluna nome passou a se chamar Unidade.', porque: 'O AS muda o cabeçalho da resposta, e a tabela continua igual.' },
        { id: 'c', text: 'Ganhou uma coluna nova chamada Unidade.', porque: 'Consulta não acrescenta coluna nenhuma.' },
        { id: 'd', text: 'Perdeu as outras colunas.', porque: 'A resposta mostra uma coluna; a tabela continua com as quatro.' },
      ]},
      explanation: 'SELECT só lê. Quem muda a tabela são outros comandos, que vêm mais adiante.',
    },
    {
      id: 'SQL-M1-Q5', type: 'multiple_choice',
      prompt: 'Uma consulta devolve o quê?',
      data: { options: [
        { id: 'a', text: 'Uma tabela com a resposta.', correct: true },
        { id: 'b', text: 'Sempre um número só.', porque: 'Pode devolver muitas linhas e muitas colunas.' },
        { id: 'c', text: 'O banco inteiro, para conferir.', porque: 'Devolve só o que foi pedido.' },
        { id: 'd', text: 'Uma mensagem dizendo se deu certo.', porque: 'Mensagem é o que um comando de mudança devolve; a consulta devolve dados.' },
      ]},
      explanation: 'Até a resposta de uma conta é uma tabela: uma linha e uma coluna.',
    },
    {
      id: 'SQL-M1-Q6', type: 'true_false',
      prompt: 'Toda linha de uma tabela tem as mesmas colunas.',
      data: { options: [v(), f('A coluna é da tabela: quando o dado falta, ela fica vazia, mas continua existindo na linha.')] },
      explanation: 'O dado que falta vira NULL, e a coluna continua lá.',
    },
    {
      id: 'SQL-M1-Q7', type: 'true_false',
      prompt: 'Rodar várias consultas seguidas pode estragar os dados do banco.',
      data: { options: [v('SELECT só lê: consultar à vontade não muda nada.'), f()] },
      explanation: 'Só INSERT, UPDATE, DELETE e os comandos de estrutura mudam o banco.',
    },
  ],

  /* ── Módulo 2 — filtrar e ordenar (requisitos 3 e 6.3) ───────────────── */
  'm2-teoria': [
    {
      id: 'SQL-M2-Q1', type: 'multiple_choice',
      prompt: 'O que o WHERE faz numa consulta?',
      data: { options: [
        { id: 'a', text: 'Escolhe quais linhas entram na resposta.', correct: true },
        { id: 'b', text: 'Escolhe quais colunas aparecem.', porque: 'Quem escolhe as colunas é o SELECT.' },
        { id: 'c', text: 'Diz em que tabela procurar.', porque: 'A tabela vem no FROM.' },
        { id: 'd', text: 'Põe as linhas em ordem.', porque: 'Ordem é o ORDER BY.' },
      ]},
      explanation: 'WHERE idade >= 14 deixa passar só quem tem catorze anos ou mais.',
    },
    {
      id: 'SQL-M2-Q2', type: 'multiple_choice',
      prompt: 'A consulta WHERE idade = NULL roda sem erro e não devolve ninguém. Por quê?',
      data: { options: [
        { id: 'a', text: 'Nada é igual a NULL; a pergunta é IS NULL.', correct: true },
        { id: 'b', text: 'Ninguém está sem idade no clube.', porque: 'Uma das Ana Clara Ribeiro está sem idade, e IS NULL a encontra.' },
        { id: 'c', text: 'O banco apagou quem estava sem idade.', porque: 'Consulta não apaga nada.' },
        { id: 'd', text: 'NULL só funciona em texto.', porque: 'NULL vale para qualquer tipo de coluna.' },
      ]},
      explanation: 'Zero linhas não é zero erro: a consulta respondeu certo à pergunta errada.',
    },
    {
      id: 'SQL-M2-Q3', type: 'multiple_choice',
      prompt: 'Uma consulta sem ORDER BY devolveu os membros em ordem de inscrição. O que se pode concluir?',
      data: { options: [
        { id: 'a', text: 'Nada: sem pedir, a ordem não é garantida.', correct: true },
        { id: 'b', text: 'Que o banco sempre devolve nessa ordem.', porque: 'A ordem sem ORDER BY é a que o banco achou mais fácil hoje.' },
        { id: 'c', text: 'Que a tabela está ordenada por nome.', porque: 'Ordem de inscrição não é ordem de nome.' },
        { id: 'd', text: 'Que o ORDER BY é desnecessário.', porque: 'Quem precisa de ordem precisa pedir, porque amanhã pode mudar.' },
      ]},
      explanation: 'Ordem que aparece sem ser pedida é acaso, e acaso não se promete a ninguém.',
    },
    {
      id: 'SQL-M2-Q4', type: 'multiple_choice',
      prompt: 'Qual consulta lista os da Jaguar do mais velho ao mais novo?',
      data: { options: [
        { id: 'a', text: 'Com ORDER BY idade DESC no fim.', correct: true },
        { id: 'b', text: 'Com ORDER BY idade no fim.', porque: 'Sem DESC a ordem vai do mais novo ao mais velho.' },
        { id: 'c', text: 'Com ORDER BY DESC antes do WHERE.', porque: 'O ORDER BY vem depois do WHERE, e precisa da coluna.' },
        { id: 'd', text: 'Com WHERE idade DESC.', porque: 'WHERE filtra; não ordena.' },
      ]},
      explanation: 'DESC inverte a ordem: do maior para o menor.',
    },
    {
      id: 'SQL-M2-Q5', type: 'multiple_choice',
      prompt: 'Por que o SQL é chamado de linguagem declarativa?',
      data: { options: [
        { id: 'a', text: 'Porque se diz o que se quer, e não como achar.', correct: true },
        { id: 'b', text: 'Porque cada linha declara uma variável.', porque: 'Isso não tem a ver com o nome; SQL nem usa variáveis assim.' },
        { id: 'c', text: 'Porque roda mais devagar que o Python.', porque: 'Ser declarativa diz como se escreve, e não a velocidade.' },
        { id: 'd', text: 'Porque precisa de um laço para cada consulta.', porque: 'Laço é o caminho que o Python escreve; no SQL quem acha o caminho é o banco.' },
      ]},
      explanation: 'Em Python se escreve o laço; em SQL se escreve o pedido, e o gerenciador escolhe o caminho.',
    },
    {
      id: 'SQL-M2-Q6', type: 'true_false',
      prompt: 'Em SQL, texto se escreve entre aspas simples.',
      data: { options: [v(), f('No SQLite, aspas duplas são para nome de coluna; o texto vai entre aspas simples.')] },
      explanation: "WHERE nome = 'Lara Cunha' compara com o texto; com aspas duplas, o banco procuraria uma coluna.",
    },
    {
      id: 'SQL-M2-Q7', type: 'true_false',
      prompt: 'O programa em Python e a consulta em SQL não conseguem chegar na mesma resposta.',
      data: { options: [v('Os dois devolvem a mesma lista; muda só quem decide o caminho.'), f()] },
      explanation: 'O procura.py e a consulta do módulo 2 imprimem os mesmos dez nomes da Águia.',
    },
  ],

  /* ── Módulo 3 — chaves e junção (requisitos 2.3, 2.4 e 6.6) ──────────── */
  'm3-teoria': [
    {
      id: 'SQL-M3-Q1', type: 'multiple_choice',
      prompt: 'O que é a chave primária de uma tabela?',
      data: { options: [
        { id: 'a', text: 'A coluna que identifica cada linha sem repetir.', correct: true },
        { id: 'b', text: 'A coluna mais importante para o clube.', porque: 'Importância não conta; conta não se repetir e não mudar.' },
        { id: 'c', text: 'A primeira coluna escrita na tabela.', porque: 'A posição não faz de uma coluna a chave.' },
        { id: 'd', text: 'A senha para abrir o banco.', porque: 'Chave aqui é identificação de linha, e não acesso.' },
      ]},
      explanation: 'Duas linhas nunca têm a mesma chave primária, e nenhuma fica sem.',
    },
    {
      id: 'SQL-M3-Q2', type: 'multiple_choice',
      prompt: 'Por que o nome não serve de chave primária na tabela de membros?',
      data: { options: [
        { id: 'a', text: 'Porque o clube tem duas Ana Clara Ribeiro.', correct: true },
        { id: 'b', text: 'Porque nome é texto, e chave precisa ser número.', porque: 'Texto pode ser chave; o problema do nome é repetir.' },
        { id: 'c', text: 'Porque nome é comprido demais.', porque: 'O tamanho não importa para a chave.' },
        { id: 'd', text: 'Porque todo nome tem acento.', porque: 'Acento não impede nada.' },
      ]},
      explanation: 'Chave que se repete não diz de quem se está falando; o id diz.',
    },
    {
      id: 'SQL-M3-Q3', type: 'multiple_choice',
      prompt: 'A coluna unidade_id da tabela de membros é o quê?',
      data: { options: [
        { id: 'a', text: 'Uma chave estrangeira.', correct: true },
        { id: 'b', text: 'A chave primária dos membros.', porque: 'A chave dos membros é o id; unidade_id aponta para outra tabela.' },
        { id: 'c', text: 'O nome da unidade escrito de outro jeito.', porque: 'Ela guarda o número da unidade, e não o nome.' },
        { id: 'd', text: 'Uma coluna sem regra nenhuma.', porque: 'O banco recusa número de unidade que não existe.' },
      ]},
      explanation: 'Chave estrangeira aponta para a chave primária de outra tabela.',
    },
    {
      id: 'SQL-M3-Q4', type: 'multiple_choice',
      prompt: 'Alguém escreveu FROM membros, unidades sem condição nenhuma. O que sai?',
      data: { options: [
        { id: 'a', text: 'Cada membro repetido com todas as unidades.', correct: true },
        { id: 'b', text: 'Um erro dizendo que falta o ON.', porque: 'O banco não reclama: junta tudo com tudo.' },
        { id: 'c', text: 'Cada membro com a unidade certa.', porque: 'Sem dizer qual coluna combina, nada liga o membro à unidade dele.' },
        { id: 'd', text: 'Só os membros, sem as unidades.', porque: 'As duas tabelas entram, multiplicadas.' },
      ]},
      explanation: 'Sessenta e dois membros vezes seis unidades: trezentas e setenta e duas linhas.',
    },
    {
      id: 'SQL-M3-Q5', type: 'multiple_choice',
      prompt: 'A junção de membros com unidades devolveu 61 linhas, e o clube tem 62 membros. O que houve?',
      data: { options: [
        { id: 'a', text: 'Alguém sem unidade ficou de fora.', correct: true },
        { id: 'b', text: 'O banco perdeu um membro.', porque: 'O membro continua na tabela; só não tem par na junção.' },
        { id: 'c', text: 'Duas pessoas viraram uma.', porque: 'A junção não junta pessoas.' },
        { id: 'd', text: 'A consulta está certa e o clube tem 61.', porque: 'A tabela de membros tem 62 linhas.' },
      ]},
      explanation: 'A junção comum só devolve quem tem par; o LEFT JOIN guarda todo mundo da esquerda.',
    },
    {
      id: 'SQL-M3-Q6', type: 'true_false',
      prompt: 'Quando duas tabelas têm uma coluna com o mesmo nome, escreve-se o nome da tabela na frente dela.',
      data: { options: [v(), f('Sem a tabela na frente, o banco não sabe de qual nome se fala, e recusa.')] },
      explanation: 'membros.nome e unidades.nome são duas colunas diferentes.',
    },
    {
      id: 'SQL-M3-Q7', type: 'true_false',
      prompt: 'Uma junção pela coluna errada sempre termina com mensagem de erro.',
      data: { options: [v('ON membros.id = unidades.id roda e devolve seis linhas com cara de certas.'), f()] },
      explanation: 'Junção errada é das que não estouram: o resultado é plausível e está errado.',
    },
  ],

  /* ── Módulo 4 — agregação com agrupamento (requisito 6.7) ─────────────── */
  'm4-teoria': [
    {
      id: 'SQL-M4-Q1', type: 'multiple_choice',
      prompt: 'O que faz uma função de agregação como COUNT ou AVG?',
      data: { options: [
        { id: 'a', text: 'Transforma muitas linhas num número.', correct: true },
        { id: 'b', text: 'Acrescenta uma linha à tabela.', porque: 'Ela só calcula; não grava nada.' },
        { id: 'c', text: 'Junta duas tabelas.', porque: 'Juntar é o JOIN.' },
        { id: 'd', text: 'Ordena o resultado.', porque: 'Ordenar é o ORDER BY.' },
      ]},
      explanation: 'COUNT conta, SUM soma, AVG tira a média, MIN e MAX acham as pontas.',
    },
    {
      id: 'SQL-M4-Q2', type: 'multiple_choice',
      prompt: 'COUNT(*) dá 62 e COUNT(idade) dá 61 na tabela de membros. Por quê?',
      data: { options: [
        { id: 'a', text: 'Uma pessoa está sem idade registrada.', correct: true },
        { id: 'b', text: 'Uma pessoa tem idade repetida.', porque: 'Repetir não diminui a contagem.' },
        { id: 'c', text: 'COUNT(*) conta as colunas.', porque: 'Os dois contam linhas; o segundo pula as de idade vazia.' },
        { id: 'd', text: 'O banco errou a conta.', porque: 'As duas estão certas, e contam coisas diferentes.' },
      ]},
      explanation: 'COUNT de uma coluna deixa o NULL de fora.',
    },
    {
      id: 'SQL-M4-Q3', type: 'multiple_choice',
      prompt: 'Para saber quantos membros cada unidade tem, o que falta em SELECT unidades.nome, COUNT(*) com a junção?',
      data: { options: [
        { id: 'a', text: 'GROUP BY unidades.nome.', correct: true },
        { id: 'b', text: 'ORDER BY unidades.nome.', porque: 'Ordenar não separa a contagem por unidade.' },
        { id: 'c', text: 'WHERE COUNT(*) > 0.', porque: 'WHERE não aceita a contagem, e não agrupa.' },
        { id: 'd', text: 'Nada; já sai uma linha por unidade.', porque: 'Sem GROUP BY o COUNT conta a tabela inteira.' },
      ]},
      explanation: 'O GROUP BY faz a função ser calculada uma vez para cada grupo.',
    },
    {
      id: 'SQL-M4-Q4', type: 'multiple_choice',
      prompt: 'Uma consulta com WHERE COUNT(*) > 9 foi recusada. Como se escreve?',
      data: { options: [
        { id: 'a', text: 'Com HAVING COUNT(*) > 9 depois do GROUP BY.', correct: true },
        { id: 'b', text: 'Com o WHERE depois do GROUP BY.', porque: 'A posição não muda: WHERE filtra linhas, nunca grupos.' },
        { id: 'c', text: 'Com COUNT(*) > 9 no SELECT.', porque: 'Isso mostra verdadeiro ou falso, e não filtra.' },
        { id: 'd', text: 'Não tem como filtrar por contagem.', porque: 'É para isso que o HAVING existe.' },
      ]},
      explanation: 'O WHERE roda antes de agrupar, quando a contagem ainda não existe.',
    },
    {
      id: 'SQL-M4-Q5', type: 'multiple_choice',
      prompt: 'Calcular a média do Tucano com SUM(idade) / COUNT(*) deu 11. A média de verdade é 12,44. O que aconteceu?',
      data: { options: [
        { id: 'a', text: 'O vazio contou e a divisão cortou as casas.', correct: true },
        { id: 'b', text: 'O Tucano tem gente de 11 anos.', porque: 'Ter gente de 11 não faz a média ser 11.' },
        { id: 'c', text: 'A média com AVG também dá 11.', porque: 'O AVG deixa o NULL de fora e devolve a média com casas.' },
        { id: 'd', text: 'Faltou um ORDER BY.', porque: 'A ordem não mexe em conta nenhuma.' },
      ]},
      explanation: 'COUNT(*) contou a Ana Clara sem idade, e inteiro dividido por inteiro dá inteiro no SQLite.',
    },
    {
      id: 'SQL-M4-Q6', type: 'true_false',
      prompt: 'O AVG ignora as linhas em que a coluna está vazia.',
      data: { options: [v(), f('O AVG calcula só sobre quem tem o dado, e é por isso que a média dele está certa.')] },
      explanation: 'A média de idade é a de quem tem idade registrada.',
    },
    {
      id: 'SQL-M4-Q7', type: 'true_false',
      prompt: 'O SQLite sempre recusa uma coluna solta que não está no GROUP BY.',
      data: { options: [v('Ele aceita, e põe ali o valor de uma linha qualquer do grupo.'), f()] },
      explanation: 'Não dar erro não quer dizer que está certo: o número ao lado pode ser de outra pessoa.',
    },
  ],

  /* ── Módulo 5 — normalização (requisito 4) ────────────────────────────── */
  'm5-teoria': [
    {
      id: 'SQL-M5-Q1', type: 'multiple_choice',
      prompt: 'O que é normalizar um banco de dados?',
      data: { options: [
        { id: 'a', text: 'Guardar cada informação num lugar só.', correct: true },
        { id: 'b', text: 'Escrever todos os nomes com maiúscula.', porque: 'Isso padroniza texto, e não a estrutura das tabelas.' },
        { id: 'c', text: 'Juntar tudo numa tabela grande.', porque: 'Uma tabela grande é justamente onde o dado se repete.' },
        { id: 'd', text: 'Apagar as tabelas que ninguém usa.', porque: 'Apagar tabela não evita repetição.' },
      ]},
      explanation: 'Quem precisa do telefone do conselheiro aponta para a unidade, em vez de copiar o número.',
    },
    {
      id: 'SQL-M5-Q2', type: 'multiple_choice',
      prompt: 'A Tia Rute trocou de celular e a secretaria atualizou a tabela de unidades. O que aconteceu com a lista do acampamento?',
      data: { options: [
        { id: 'a', text: 'Ficou com o número antigo, sem aviso.', correct: true },
        { id: 'b', text: 'Mudou sozinha junto com a de unidades.', porque: 'Era uma cópia; cópia não acompanha o original.' },
        { id: 'c', text: 'O banco recusou a atualização.', porque: 'Nada impede mudar um dos dois lugares.' },
        { id: 'd', text: 'Apagou as inscrições da Águia.', porque: 'Ninguém apagou nada; o número só envelheceu.' },
      ]},
      explanation: 'Dado repetido em tabelas distintas envelhece separado, e o banco passa a ter duas respostas.',
    },
    {
      id: 'SQL-M5-Q3', type: 'multiple_choice',
      prompt: 'Como se acham as inscrições com o telefone desencontrado?',
      data: { options: [
        { id: 'a', text: 'Juntando as tabelas e comparando os dois telefones.', correct: true },
        { id: 'b', text: 'Contando as inscrições da Águia.', porque: 'Contar não diz qual número está errado.' },
        { id: 'c', text: 'Ordenando a lista pelo telefone.', porque: 'A ordem mostra os números, sem comparar com o da unidade.' },
        { id: 'd', text: 'Lendo o banco linha por linha.', porque: 'Funciona com oito linhas e não com oitocentas; a consulta compara todas.' },
      ]},
      explanation: 'WHERE com os dois telefones diferentes devolve exatamente as que envelheceram.',
    },
    {
      id: 'SQL-M5-Q4', type: 'multiple_choice',
      prompt: 'Qual é o conserto de verdade para o telefone repetido?',
      data: { options: [
        { id: 'a', text: 'Tirar a cópia e ler pela junção.', correct: true },
        { id: 'b', text: 'Atualizar as oito cópias com o número novo.', porque: 'Resolve hoje e deixa o problema para a próxima troca.' },
        { id: 'c', text: 'Apagar a tabela de unidades.', porque: 'Apagaria o lugar certo e deixaria só as cópias.' },
        { id: 'd', text: 'Pedir à Tia Rute para voltar ao número velho.', porque: 'O defeito é do banco, e não do celular dela.' },
      ]},
      explanation: 'Sem cópia, a próxima troca se faz numa linha só.',
    },
    {
      id: 'SQL-M5-Q5', type: 'multiple_choice',
      prompt: 'Depois de normalizar, o que a tabela de inscrições precisa guardar?',
      data: { options: [
        { id: 'a', text: 'Quem se inscreveu e quantas diárias.', correct: true },
        { id: 'b', text: 'A unidade, o conselheiro e o telefone.', porque: 'Esses moram em outras tabelas, e por isso saem.' },
        { id: 'c', text: 'Só o número da inscrição.', porque: 'Sem o membro e as diárias a inscrição não diz nada.' },
        { id: 'd', text: 'Uma cópia da tabela de membros.', porque: 'Copiar o membro é repetir de novo.' },
      ]},
      explanation: 'O membro_id leva ao membro, e o membro leva à unidade.',
    },
    {
      id: 'SQL-M5-Q6', type: 'true_false',
      prompt: 'Duas tabelas com o mesmo telefone bem escrito podem estar com uma informação desatualizada.',
      data: { options: [v(), f('Cada cópia pode estar bem escrita e mesmo assim ser o número de antes.')] },
      explanation: 'Nada estoura no dado repetido: as duas linhas parecem certas.',
    },
    {
      id: 'SQL-M5-Q7', type: 'true_false',
      prompt: 'DROP COLUMN guarda os dados da coluna para quem quiser desfazer depois.',
      data: { options: [v('Os dados vão junto com a coluna, e não há desfazer.'), f()] },
      explanation: 'Antes de tirar a coluna, confira que o dado dela mora mesmo em outro lugar.',
    },
  ],

  /* ── Módulo 6 — o diagrama (requisito 5) ──────────────────────────────── */
  'm6-teoria': [
    {
      id: 'SQL-M6-Q1', type: 'multiple_choice',
      prompt: 'O que a cardinalidade de uma ligação diz?',
      data: { options: [
        { id: 'a', text: 'Quantos de um lado combinam com quantos do outro.', correct: true },
        { id: 'b', text: 'Quantas colunas cada tabela tem.', porque: 'Isso é o tamanho da tabela, e não a ligação.' },
        { id: 'c', text: 'Qual tabela é a mais importante.', porque: 'A ligação não ordena tabelas por importância.' },
        { id: 'd', text: 'A cor da linha no diagrama.', porque: 'A notação é o traço e o pé de galinha, e não a cor.' },
      ]},
      explanation: 'Uma unidade tem muitos membros, e cada membro é de uma: um para muitos.',
    },
    {
      id: 'SQL-M6-Q2', type: 'multiple_choice',
      prompt: 'Na ligação um para muitos entre unidades e membros, onde mora a chave estrangeira?',
      data: { options: [
        { id: 'a', text: 'Na tabela de membros.', correct: true },
        { id: 'b', text: 'Na tabela de unidades.', porque: 'A unidade teria de guardar uma lista de membros, e coluna não guarda lista.' },
        { id: 'c', text: 'Nas duas tabelas.', porque: 'Apontar dos dois lados é guardar a mesma ligação duas vezes.' },
        { id: 'd', text: 'Numa tabela do meio.', porque: 'Tabela do meio é para muitos para muitos.' },
      ]},
      explanation: 'A chave estrangeira fica do lado muitos: cada membro aponta para a sua unidade.',
    },
    {
      id: 'SQL-M6-Q3', type: 'multiple_choice',
      prompt: 'Um membro conquista muitas especialidades, e uma especialidade é de muitos membros. Como se modela?',
      data: { options: [
        { id: 'a', text: 'Com uma tabela de conquistas no meio.', correct: true },
        { id: 'b', text: 'Com uma coluna de especialidades no membro.', porque: 'Uma coluna guarda uma especialidade só.' },
        { id: 'c', text: 'Com uma coluna de membros na especialidade.', porque: 'Uma coluna guarda um membro só.' },
        { id: 'd', text: 'Juntando as duas numa tabela só.', porque: 'Repetiria o membro em cada especialidade dele.' },
      ]},
      explanation: 'A ligação muitos para muitos vira duas ligações um para muitos e uma tabela no meio.',
    },
    {
      id: 'SQL-M6-Q4', type: 'multiple_choice',
      prompt: 'Onde deve ficar a data em que alguém conquistou uma especialidade?',
      data: { options: [
        { id: 'a', text: 'Na tabela de conquistas.', correct: true },
        { id: 'b', text: 'Na tabela de membros.', porque: 'O membro tem muitas conquistas, cada uma numa data.' },
        { id: 'c', text: 'Na tabela de especialidades.', porque: 'A especialidade é conquistada por muitos, em datas diferentes.' },
        { id: 'd', text: 'Na tabela de unidades.', porque: 'A unidade nada tem a ver com a data da conquista.' },
      ]},
      explanation: 'A data é do encontro entre o membro e a especialidade, e esse encontro é a linha da conquista.',
    },
    {
      id: 'SQL-M6-Q5', type: 'multiple_choice',
      prompt: 'Por que desenhar o diagrama antes de criar as tabelas?',
      data: { options: [
        { id: 'a', text: 'Porque mudar o desenho custa menos.', correct: true },
        { id: 'b', text: 'Porque o banco exige um desenho para funcionar.', porque: 'O banco funciona sem desenho; quem ganha com ele é quem planeja.' },
        { id: 'c', text: 'Porque o diagrama cria as tabelas sozinho.', porque: 'Aqui as tabelas se criam com CREATE TABLE, no módulo 7.' },
        { id: 'd', text: 'Porque o diagrama guarda os dados.', porque: 'Ele mostra a estrutura; os dados ficam no banco.' },
      ]},
      explanation: 'Mudar uma tabela cheia de dados custa uma tarde; mudar uma caixa custa um clique.',
    },
    {
      id: 'SQL-M6-Q6', type: 'true_false',
      prompt: 'No diagrama, o pé de galinha marca o lado muitos da ligação.',
      data: { options: [v(), f('O pé de galinha, três traços abertos, é o lado muitos; o traço atravessado é o lado um.')] },
      explanation: 'É a notação que todo modelador de tabelas usa.',
    },
    {
      id: 'SQL-M6-Q7', type: 'true_false',
      prompt: 'Uma ligação muitos para muitos desenhada no diagrama vira uma coluna no banco.',
      data: { options: [v('Nenhuma coluna guarda uma lista; ela vira uma tabela do meio.'), f()] },
      explanation: 'Os modeladores oferecem N:N no menu, e no banco ela sempre vira tabela.',
    },
  ],

  /* ── Módulo 7 — criar tabelas (requisito 6.1) ─────────────────────────── */
  'm7-teoria': [
    {
      id: 'SQL-M7-Q1', type: 'multiple_choice',
      prompt: 'Qual é o tipo certo para o telefone de um conselheiro?',
      data: { options: [
        { id: 'a', text: 'TEXT.', correct: true },
        { id: 'b', text: 'INTEGER, porque telefone é feito de números.', porque: 'Ninguém faz conta com telefone, e o número perde o zero da frente.' },
        { id: 'c', text: 'REAL, para caber o número inteiro.', porque: 'REAL é número com casas decimais.' },
        { id: 'd', text: 'DATE.', porque: 'Telefone não é data.' },
      ]},
      explanation: 'O que parece número e não serve para conta é texto: telefone, código, CEP.',
    },
    {
      id: 'SQL-M7-Q2', type: 'multiple_choice',
      prompt: 'Como se guarda a data 14 de março de 2026 para que ela se ordene certo?',
      data: { options: [
        { id: 'a', text: "Como '2026-03-14'.", correct: true },
        { id: 'b', text: "Como '14/03/2026'.", porque: 'Nesse formato a ordem do texto é pelo dia, e 01/04 vem antes de 14/03.' },
        { id: 'c', text: 'Como 14032026.', porque: 'Esse número também se ordena pelo dia, e não pela data.' },
        { id: 'd', text: "Como 'março de 2026'.", porque: 'Perde o dia, e o nome do mês não se ordena.' },
      ]},
      explanation: 'No formato ano-mês-dia, a ordem do texto é a ordem do calendário.',
    },
    {
      id: 'SQL-M7-Q3', type: 'multiple_choice',
      prompt: 'O que faz NOT NULL numa coluna?',
      data: { options: [
        { id: 'a', text: 'Recusa linha com aquela coluna vazia.', correct: true },
        { id: 'b', text: 'Recusa valores repetidos.', porque: 'Recusar repetição é o UNIQUE.' },
        { id: 'c', text: 'Apaga as linhas vazias.', porque: 'Regra de coluna não apaga nada; ela recusa o que chega.' },
        { id: 'd', text: 'Preenche o vazio com zero.', porque: 'Ela não preenche: recusa.' },
      ]},
      explanation: 'Uma especialidade sem nome é recusada pelo próprio banco.',
    },
    {
      id: 'SQL-M7-Q4', type: 'multiple_choice',
      prompt: 'A tabela de conquistas aponta para a de especialidades. Em que ordem se criam?',
      data: { options: [
        { id: 'a', text: 'Especialidades primeiro.', correct: true },
        { id: 'b', text: 'Conquistas primeiro.', porque: 'Ela apontaria para uma tabela que ainda não existe.' },
        { id: 'c', text: 'Tanto faz.', porque: 'Quem aponta precisa que o apontado já exista.' },
        { id: 'd', text: 'As duas num comando só.', porque: 'Cada CREATE TABLE cria uma tabela.' },
      ]},
      explanation: 'A tabela apontada vem antes da que aponta.',
    },
    {
      id: 'SQL-M7-Q5', type: 'multiple_choice',
      prompt: 'O código 034 foi gravado numa coluna INTEGER e saiu 34. O que aconteceu?',
      data: { options: [
        { id: 'a', text: 'O número jogou fora o zero da frente.', correct: true },
        { id: 'b', text: 'O banco errou a gravação.', porque: 'Ele fez o que o tipo manda: guardou um número.' },
        { id: 'c', text: 'O código estava digitado errado.', porque: 'Estava certo; quem perdeu o zero foi a conversão para número.' },
        { id: 'd', text: 'Faltou o NOT NULL.', porque: 'NOT NULL só trata do vazio.' },
      ]},
      explanation: 'Código com zero na frente é texto, e se declara TEXT.',
    },
    {
      id: 'SQL-M7-Q6', type: 'true_false',
      prompt: 'Uma coluna INTEGER PRIMARY KEY se numera sozinha quando o id não é escrito.',
      data: { options: [v(), f('No SQLite, a chave inteira recebe o próximo número sozinha.')] },
      explanation: 'Por isso o INSERT de uma especialidade nova não precisa do id.',
    },
    {
      id: 'SQL-M7-Q7', type: 'true_false',
      prompt: 'Quando o banco recusa um comando, ele está com defeito.',
      data: { options: [v('A recusa é a regra da tabela funcionando.'), f()] },
      explanation: 'NOT NULL, UNIQUE e REFERENCES existem para recusar o que não cabe.',
    },
  ],

  /* ── Módulo 8 — inserir, atualizar e remover (requisitos 6.2, 6.4, 6.5) ─ */
  'm8-teoria': [
    {
      id: 'SQL-M8-Q1', type: 'multiple_choice',
      prompt: 'Qual comando acrescenta uma linha a uma tabela?',
      data: { options: [
        { id: 'a', text: 'INSERT.', correct: true },
        { id: 'b', text: 'UPDATE.', porque: 'UPDATE muda linhas que já existem.' },
        { id: 'c', text: 'SELECT.', porque: 'SELECT só lê.' },
        { id: 'd', text: 'CREATE.', porque: 'CREATE cria a tabela, e não a linha.' },
      ]},
      explanation: 'INSERT INTO tabela (colunas) VALUES (valores).',
    },
    {
      id: 'SQL-M8-Q2', type: 'multiple_choice',
      prompt: "UPDATE membros SET idade = 11 WHERE nome = 'Ana Clara Ribeiro' mudou duas linhas. Por quê?",
      data: { options: [
        { id: 'a', text: 'Porque o nome não identifica uma pessoa só.', correct: true },
        { id: 'b', text: 'Porque o UPDATE sempre muda duas linhas.', porque: 'Ele muda quantas o WHERE escolher.' },
        { id: 'c', text: 'Porque faltou o SET.', porque: 'O SET está lá; o problema é o WHERE.' },
        { id: 'd', text: 'Porque o banco duplicou a Ana Clara.', porque: 'São duas pessoas de verdade, em duas unidades.' },
      ]},
      explanation: 'Para mudar uma pessoa, o WHERE usa o id, que não se repete.',
    },
    {
      id: 'SQL-M8-Q3', type: 'multiple_choice',
      prompt: 'O que acontece com um UPDATE escrito sem WHERE?',
      data: { options: [
        { id: 'a', text: 'Muda a tabela inteira.', correct: true },
        { id: 'b', text: 'É recusado pelo banco.', porque: 'O banco aceita, e muda todas as linhas.' },
        { id: 'c', text: 'Muda só a primeira linha.', porque: 'Sem filtro, todas entram.' },
        { id: 'd', text: 'Não muda nada até alguém confirmar.', porque: 'Não há confirmação: ele muda na hora.' },
      ]},
      explanation: 'Escreva o WHERE antes do SET: assim o comando nunca fica pela metade sem ele.',
    },
    {
      id: 'SQL-M8-Q4', type: 'multiple_choice',
      prompt: 'O banco recusou apagar o Henrique Dias, que tem conquistas. Qual é o caminho certo?',
      data: { options: [
        { id: 'a', text: 'Apagar antes as conquistas dele.', correct: true },
        { id: 'b', text: 'Apagar todas as conquistas do clube.', porque: 'Levaria as conquistas dos outros junto.' },
        { id: 'c', text: 'Desligar a chave estrangeira.', porque: 'Ficariam conquistas de ninguém no banco.' },
        { id: 'd', text: 'Trocar o nome dele por outro.', porque: 'Trocar o nome não tira ninguém do clube.' },
      ]},
      explanation: 'Primeiro sai o que aponta, depois o que é apontado.',
    },
    {
      id: 'SQL-M8-Q5', type: 'multiple_choice',
      prompt: 'Para que serve abrir uma transação com BEGIN antes de mexer em muitas linhas?',
      data: { options: [
        { id: 'a', text: 'Para poder desfazer tudo com ROLLBACK.', correct: true },
        { id: 'b', text: 'Para o comando rodar mais rápido.', porque: 'A transação é sobre poder desfazer, e não sobre velocidade.' },
        { id: 'c', text: 'Para apagar o que estava antes.', porque: 'BEGIN não apaga nada.' },
        { id: 'd', text: 'Para o banco aceitar UPDATE sem WHERE.', porque: 'O banco aceita UPDATE sem WHERE de qualquer jeito.' },
      ]},
      explanation: 'COMMIT grava tudo de uma vez; ROLLBACK desfaz tudo de uma vez.',
    },
    {
      id: 'SQL-M8-Q6', type: 'true_false',
      prompt: 'No texto de um INSERT, a aspa simples dentro de um nome se escreve dobrada.',
      data: { options: [v(), f("O sobrenome D'Ávila se escreve 'D''Ávila' dentro do comando.")] },
      explanation: 'Uma aspa sozinha fecharia o texto no meio do nome.',
    },
    {
      id: 'SQL-M8-Q7', type: 'true_false',
      prompt: 'No banco do clube, um DELETE errado se desfaz com Ctrl+Z.',
      data: { options: [v('Não há desfazer no banco: só a transação aberta antes deixa voltar.'), f()] },
      explanation: 'No editor desta vereda o banco volta a cada execução; no de verdade, não.',
    },
  ],

  /* ── Módulo 9 — o banco no programa (requisito 7) ─────────────────────── */
  'm9-teoria': [
    {
      id: 'SQL-M9-Q1', type: 'multiple_choice',
      prompt: 'O que sqlite3.connect("clube.db") devolve?',
      data: { options: [
        { id: 'a', text: 'A conexão com o banco.', correct: true },
        { id: 'b', text: 'Todas as linhas do banco.', porque: 'As linhas vêm de uma consulta, depois.' },
        { id: 'c', text: 'O texto do arquivo.', porque: 'O banco não é lido como texto.' },
        { id: 'd', text: 'Uma mensagem de que deu certo.', porque: 'Devolve o objeto por onde os comandos passam.' },
      ]},
      explanation: 'Todo execute, commit e close passa pela conexão.',
    },
    {
      id: 'SQL-M9-Q2', type: 'multiple_choice',
      prompt: 'O programa conectou em "clube.bd", com as letras trocadas, e a consulta disse no such table. Por quê?',
      data: { options: [
        { id: 'a', text: 'Ele criou um banco novo e vazio.', correct: true },
        { id: 'b', text: 'O banco do clube foi apagado.', porque: 'O clube.db continua lá; o programa abriu outro arquivo.' },
        { id: 'c', text: 'A tabela mudou de nome.', porque: 'A tabela está no outro arquivo.' },
        { id: 'd', text: 'Faltou o commit.', porque: 'Commit não cria tabela.' },
      ]},
      explanation: 'Nome de arquivo errado não dá erro no connect: dá erro na primeira consulta.',
    },
    {
      id: 'SQL-M9-Q3', type: 'multiple_choice',
      prompt: 'Qual é o jeito certo de passar o nome de um membro novo para o INSERT?',
      data: { options: [
        { id: 'a', text: 'Com ? no comando e o nome numa tupla.', correct: true },
        { id: 'b', text: 'Colando o nome no comando com f-string.', porque: 'O apóstrofo de um sobrenome fecha a aspa no meio do comando.' },
        { id: 'c', text: 'Somando o nome ao texto do comando.', porque: 'É colar do mesmo jeito, com o mesmo defeito.' },
        { id: 'd', text: 'Escrevendo o nome direto, sem aspas.', porque: 'Sem aspas o banco lê o nome como coluna.' },
      ]},
      explanation: 'Com o ?, o valor viaja separado e nunca vira comando.',
    },
    {
      id: 'SQL-M9-Q4', type: 'multiple_choice',
      prompt: 'O programa inseriu um membro, consultou e o viu na lista. Ao abrir o banco depois, ele não estava. O que faltou?',
      data: { options: [
        { id: 'a', text: 'O commit.', correct: true },
        { id: 'b', text: 'Um segundo INSERT.', porque: 'Inserir de novo também ficaria pendente.' },
        { id: 'c', text: 'O fetchall.', porque: 'O fetchall só traz linhas de uma consulta.' },
        { id: 'd', text: 'Fechar com close.', porque: 'Fechar sem commit desfaz o que estava pendente.' },
      ]},
      explanation: 'O programa via o registro porque estava dentro da transação; o arquivo, não.',
    },
    {
      id: 'SQL-M9-Q5', type: 'multiple_choice',
      prompt: 'O que fetchall() devolve depois de uma consulta?',
      data: { options: [
        { id: 'a', text: 'Uma lista de tuplas, uma por linha.', correct: true },
        { id: 'b', text: 'Um texto com a tabela desenhada.', porque: 'Devolve dados, e não um desenho.' },
        { id: 'c', text: 'Só a primeira linha.', porque: 'Só a primeira é o fetchone.' },
        { id: 'd', text: 'Um dicionário com o nome das colunas.', porque: 'Cada linha chega como tupla, na ordem do SELECT.' },
      ]},
      explanation: 'Percorre-se a lista com for, desempacotando cada tupla.',
    },
    {
      id: 'SQL-M9-Q6', type: 'true_false',
      prompt: 'Mesmo um valor só vai numa tupla, com a vírgula: (nome,).',
      data: { options: [v(), f('Sem a vírgula, os parênteses não fazem tupla, e o execute recusa.')] },
      explanation: '(nome) é só o nome; (nome,) é uma tupla de um elemento.',
    },
    {
      id: 'SQL-M9-Q7', type: 'true_false',
      prompt: 'Colar o valor no comando com f-string é seguro quando o nome não tem apóstrofo.',
      data: { options: [v('O próximo nome pode ter, e um nome escrito de propósito pode virar comando.'), f()] },
      explanation: 'O ? protege seja qual for o valor; a f-string depende de ninguém escrever o que não deve.',
    },
  ],
};
