import type { Question } from '../types';

/*
 * As questões das lições de teoria da CC006 Projeto de Programa.
 *
 * A definição vale uma vez por lição; o resto é consequência e diagnóstico —
 * a proposta sem usuário, o import que não acha o arquivo, o "dez" que derruba,
 * o texto vazio que o banco aceita, o except que esconde o erro de digitação,
 * o commit que junta quatro assuntos, o exemplo inventado. Toda errada diz por
 * que está errada no campo porque, a certa é uma afirmação curta e o porquê
 * dela mora no explanation. Sem crase nem asterisco: a questão vai para o
 * QuestionRenderer, que imprime texto puro.
 */

const v = (porque?: string) => ({ id: 'v', text: 'Verdadeiro', ...(porque ? { porque } : { correct: true }) });
const f = (porque?: string) => ({ id: 'f', text: 'Falso', ...(porque ? { porque } : { correct: true }) });

export const QUESTOES_DO_PROJETO_DE_PROGRAMA: Record<string, Question[]> = {
  /* ── Módulo 1 — a proposta (requisito 2) ─────────────────────────────── */
  'm1-teoria': [
    {
      id: 'PP-M1-Q1', type: 'multiple_choice',
      prompt: 'Qual destas frases descreve um problema, e não uma solução?',
      data: { options: [
        { id: 'a', text: 'Ninguém sabe o que o clube tem antes do acampamento.', correct: true },
        { id: 'b', text: 'Fazer um programa de estoque em Python para o almoxarifado.', porque: 'Isso já é a solução; o problema é o que acontece hoje sem ela.' },
        { id: 'c', text: 'Usar um banco SQLite para guardar o material.', porque: 'É como o programa vai ser feito, e não o que está dando errado.' },
        { id: 'd', text: 'Criar um menu com quatro opções e sair.', porque: 'É parte do programa, e não o motivo de ele existir.' },
      ]},
      explanation: 'O problema se conta como quem descreve o que acontece hoje. É contra ele que se confere, no fim, se o programa deu certo.',
    },
    {
      id: 'PP-M1-Q2', type: 'multiple_choice',
      prompt: 'Uma proposta diz que o usuário-alvo é "todo mundo". O que o examinador perde com isso?',
      data: { options: [
        { id: 'a', text: 'O jeito de saber se o programa serve.', correct: true },
        { id: 'b', text: 'Nada: quanto mais gente, melhor o programa.', porque: 'Programa feito para todos não foi pensado para ninguém em particular.' },
        { id: 'c', text: 'A lista das funcionalidades.', porque: 'A lista é outra parte da proposta, e pode estar completa mesmo assim.' },
        { id: 'd', text: 'O nome do arquivo do banco.', porque: 'Isso é detalhe de execução, e não aparece na proposta.' },
      ]},
      explanation: 'Quem usa decide o resto: o menu, as palavras, o que precisa ser explicado. Sem ele, não há com o que comparar.',
    },
    {
      id: 'PP-M1-Q3', type: 'multiple_choice',
      prompt: 'Qual destas é uma funcionalidade, escrita do jeito certo?',
      data: { options: [
        { id: 'a', text: 'Alterar a quantidade de um material.', correct: true },
        { id: 'b', text: 'Ser rápido e fácil de usar.', porque: 'Isso não se confere com sim ou não olhando o programa.' },
        { id: 'c', text: 'Usar parâmetros nos comandos SQL.', porque: 'É como o programa é feito por dentro, e quem usa não vê isso.' },
        { id: 'd', text: 'Ter o código bem organizado e fácil de ler.', porque: 'É qualidade do código, e não uma coisa que o programa faz para alguém.' },
      ]},
      explanation: 'Funcionalidade é um verbo e o que ele mexe, do ponto de vista de quem usa.',
    },
    {
      id: 'PP-M1-Q4', type: 'multiple_choice',
      prompt: 'A proposta lista cadastrar, listar e alterar. O que o requisito ainda cobra dela?',
      data: { options: [
        { id: 'a', text: 'Remover um material.', correct: true },
        { id: 'b', text: 'Imprimir um relatório.', porque: 'O requisito não pede relatório; ele pede as quatro operações.' },
        { id: 'c', text: 'Mandar um e-mail ao conselheiro.', porque: 'Isso nenhum requisito desta vereda pede.' },
        { id: 'd', text: 'Nada: três operações bastam.', porque: 'O programa precisa criar, consultar, alterar e remover.' },
      ]},
      explanation: 'Criar, consultar, alterar e remover são as quatro do requisito 3.2, e a proposta tem de prever as quatro.',
    },
    {
      id: 'PP-M1-Q5', type: 'multiple_choice',
      prompt: 'Por que a aprovação da proposta vem antes de programar?',
      data: { options: [
        { id: 'a', text: 'Mudar a proposta custa pouco; mudar o código custa muito.', correct: true },
        { id: 'b', text: 'Porque o computador só deixa programar depois do aceite do examinador.', porque: 'Nada no computador impede: é a ordem que o requisito pede.' },
        { id: 'c', text: 'Para o examinador escrever o programa junto.', porque: 'Quem escreve o programa é você; o examinador aprova o que vai ser feito.' },
        { id: 'd', text: 'Porque a proposta é mais importante que o programa.', porque: 'Os dois contam; a ordem é que muda o custo de errar.' },
      ]},
      explanation: 'Se o examinador pedir outra coisa, riscar uma linha da proposta é barato. Jogar fora o código já escrito não é.',
    },
    {
      id: 'PP-M1-Q6', type: 'true_false',
      prompt: 'A lista de funcionalidades também serve para dizer o que fica para depois.',
      data: { options: [v(), f('Tudo o que não está na lista fica de fora, e é isso que impede o projeto de crescer sem fim.')] },
      explanation: 'A lista é um acordo: o que está nela é o que vai ser cobrado, e o resto espera.',
    },
    {
      id: 'PP-M1-Q7', type: 'true_false',
      prompt: 'Pedir a aprovação depois de o programa pronto cumpre o requisito, desde que a proposta esteja completa.',
      data: { options: [v('A aprovação de um programa pronto não deixa o examinador mudar nada, e o requisito pede que ela venha antes.'), f()] },
      explanation: 'O requisito diz que a execução não pode começar antes da aprovação. A ordem é a regra.',
    },
  ],

  /* ── Módulo 2 — o esqueleto (requisitos 3.1 e 3.5) ───────────────────── */
  'm2-teoria': [
    {
      id: 'PP-M2-Q1', type: 'multiple_choice',
      prompt: 'Por que o requisito pede o programa em mais de um arquivo?',
      data: { options: [
        { id: 'a', text: 'Para saber em que arquivo mexer quando algo mudar.', correct: true },
        { id: 'b', text: 'Porque o Python não aceita arquivos grandes demais num projeto.', porque: 'O Python aceita arquivos de qualquer tamanho.' },
        { id: 'c', text: 'Para o programa rodar mais rápido.', porque: 'Dividir em arquivos não muda a velocidade de nada aqui.' },
        { id: 'd', text: 'Porque cada função precisa do seu arquivo.', porque: 'Um arquivo guarda várias funções do mesmo assunto.' },
      ]},
      explanation: 'O que fala com o banco num lugar, o menu em outro: quando o banco mudar, mexe-se num arquivo só.',
    },
    {
      id: 'PP-M2-Q2', type: 'multiple_choice',
      prompt: 'O principal.py tem from banco import conectar, e o Python responde ModuleNotFoundError. O que é mais provável?',
      data: { options: [
        { id: 'a', text: 'O banco.py tem outro nome ou está noutra pasta.', correct: true },
        { id: 'b', text: 'A função conectar tem um erro dentro.', porque: 'Erro dentro da função apareceria só ao chamá-la, com outro nome.' },
        { id: 'c', text: 'O banco de dados ainda não existe no computador do clube.', porque: 'O import procura o arquivo .py, e não o arquivo do banco.' },
        { id: 'd', text: 'Falta escrever import sqlite3 no principal.', porque: 'O sqlite3 é importado pelo banco.py, que é quem o usa.' },
      ]},
      explanation: 'O nome do módulo é o nome do arquivo sem o .py, e ele precisa estar na mesma pasta do programa.',
    },
    {
      id: 'PP-M2-Q3', type: 'multiple_choice',
      prompt: 'O que CREATE TABLE IF NOT EXISTS faz quando a tabela já existe?',
      data: { options: [
        { id: 'a', text: 'Nada, e o programa segue.', correct: true },
        { id: 'b', text: 'Apaga a tabela e cria de novo, vazia.', porque: 'Isso perderia todo o material; ele só cria quando falta.' },
        { id: 'c', text: 'Dá erro dizendo que a tabela já existe.', porque: 'É o CREATE TABLE sem o IF NOT EXISTS que dá esse erro.' },
        { id: 'd', text: 'Cria uma segunda tabela com o mesmo nome.', porque: 'Não existem duas tabelas com o mesmo nome no banco.' },
      ]},
      explanation: 'É por isso que ele pode rodar toda vez que o programa abre: cria na primeira, e não mexe nas outras.',
    },
    {
      id: 'PP-M2-Q4', type: 'multiple_choice',
      prompt: 'Um programa tem as funções conectar e main, mas termina sem fazer nada. O que falta?',
      data: { options: [
        { id: 'a', text: 'A chamada main() no fim do arquivo.', correct: true },
        { id: 'b', text: 'Um print dentro do def main, logo no começo.', porque: 'Sem a chamada, nem o print de dentro da função roda.' },
        { id: 'c', text: 'Um import no começo do arquivo.', porque: 'Faltando o import, o programa daria erro, e não ficaria quieto.' },
        { id: 'd', text: 'Mais uma função para chamar a main.', porque: 'Essa outra função também precisaria ser chamada.' },
      ]},
      explanation: 'Definir não executa. O def guarda a função; só a chamada a faz rodar.',
    },
    {
      id: 'PP-M2-Q5', type: 'multiple_choice',
      prompt: 'Na tabela materiais, o que a regra UNIQUE na coluna nome garante?',
      data: { options: [
        { id: 'a', text: 'Que não haja dois materiais com o mesmo nome.', correct: true },
        { id: 'b', text: 'Que todo material tenha um nome escrito no cadastro.', porque: 'Isso é o NOT NULL; o UNIQUE fala de repetição.' },
        { id: 'c', text: 'Que o nome seja escrito em maiúsculas.', porque: 'Nenhuma das duas regras mexe na forma das letras.' },
        { id: 'd', text: 'Que o nome sirva de chave primária.', porque: 'A chave primária é o id; o nome só não se repete.' },
      ]},
      explanation: 'O banco passa a recusar o segundo "Corda", e o programa precisa saber o que fazer com essa recusa.',
    },
    {
      id: 'PP-M2-Q6', type: 'true_false',
      prompt: 'Um arquivo-fonte que nenhum outro importa conta como divisão do programa.',
      data: { options: [v('Arquivo que ninguém importa é um arquivo ao lado: o programa não usa nada dele.'), f()] },
      explanation: 'A divisão existe quando o principal chama o que mora no outro arquivo.',
    },
    {
      id: 'PP-M2-Q7', type: 'true_false',
      prompt: 'Abrir o banco dentro de uma função evita que importar o banco.py já abra o arquivo.',
      data: { options: [v(), f('O que está solto no topo roda ao importar; o que está dentro de função só roda quando ela é chamada.')] },
      explanation: 'Importar executa o que está fora das funções. Por isso a conexão mora dentro de conectar().',
    },
  ],

  /* ── Módulo 3 — o menu e as quatro operações (requisito 3.2) ────────── */
  'm3-teoria': [
    {
      id: 'PP-M3-Q1', type: 'multiple_choice',
      prompt: 'O menu compara opcao == 1 e nunca entra na opção de cadastrar. Por quê?',
      data: { options: [
        { id: 'a', text: 'O input devolve texto, e "1" não é igual a 1.', correct: true },
        { id: 'b', text: 'O while True não deixa o if de dentro rodar nunca.', porque: 'O if roda a cada volta do laço; o problema é a comparação.' },
        { id: 'c', text: 'Falta um break depois do if.', porque: 'O break serve para sair do laço, e não para entrar na opção.' },
        { id: 'd', text: 'A pessoa precisa digitar um.', porque: 'Digitando "um" seria pior: nem número seria.' },
      ]},
      explanation: 'A resposta do input é sempre texto. Compara-se com "1", entre aspas, ou converte-se antes.',
    },
    {
      id: 'PP-M3-Q2', type: 'multiple_choice',
      prompt: 'Qual comando SQL a função de alterar a quantidade usa?',
      data: { options: [
        { id: 'a', text: 'UPDATE', correct: true },
        { id: 'b', text: 'INSERT', porque: 'INSERT acrescenta um material novo, e não muda um que existe.' },
        { id: 'c', text: 'SELECT', porque: 'SELECT só lê; não muda nada no banco.' },
        { id: 'd', text: 'CREATE TABLE', porque: 'CREATE cria a tabela, e não mexe nas linhas dela.' },
      ]},
      explanation: 'UPDATE materiais SET quantidade = ? WHERE id = ? muda só a linha daquele id.',
    },
    {
      id: 'PP-M3-Q3', type: 'multiple_choice',
      prompt: 'Por que alterar e remover pelo id, e não pelo nome?',
      data: { options: [
        { id: 'a', text: 'O id identifica uma linha só.', correct: true },
        { id: 'b', text: 'Porque o nome é texto e o id é número.', porque: 'O tipo não importa; importa o que identifica uma linha só.' },
        { id: 'c', text: 'Porque o nome pode ter acento.', porque: 'Acento não impede o banco de comparar nomes.' },
        { id: 'd', text: 'Porque o id é mais curto de digitar.', porque: 'Pode ser, mas não é por isso que ele é usado.' },
      ]},
      explanation: 'É a lição das duas Anas da CC005: o nome é o que se lê, o id é o que aponta para uma linha só.',
    },
    {
      id: 'PP-M3-Q4', type: 'multiple_choice',
      prompt: 'O DELETE com um id que não existe roda. O que o banco faz?',
      data: { options: [
        { id: 'a', text: 'Remove zero linhas, sem erro.', correct: true },
        { id: 'b', text: 'Dá IntegrityError.', porque: 'Nenhuma regra foi quebrada: ele só não achou ninguém.' },
        { id: 'c', text: 'Remove o último material cadastrado.', porque: 'O WHERE não achou ninguém, e nada é removido.' },
        { id: 'd', text: 'Fecha o programa com traceback.', porque: 'Não houve erro para fechar o programa.' },
      ]},
      explanation: 'Procurar e não achar não é erro para o banco. Quem sabe que nada mudou é o rowcount, que fica em zero.',
    },
    {
      id: 'PP-M3-Q5', type: 'multiple_choice',
      prompt: 'O programa cadastra a Lanterna, lista e ela aparece; ao abrir de novo, ela sumiu. O que faltou?',
      data: { options: [
        { id: 'a', text: 'O commit depois do INSERT.', correct: true },
        { id: 'b', text: 'Um SELECT depois do INSERT.', porque: 'O SELECT só lê; ele mostrou a Lanterna e não gravou nada.' },
        { id: 'c', text: 'O IF NOT EXISTS no CREATE TABLE.', porque: 'A tabela existia, e o material entrou nela até o programa fechar.' },
        { id: 'd', text: 'Um ? no lugar do nome.', porque: 'Sem o ?, o comando quebraria no apóstrofo, e não sumiria depois.' },
      ]},
      explanation: 'Sem o commit, o próprio programa vê o que inseriu, e o arquivo não guarda nada quando ele fecha.',
    },
    {
      id: 'PP-M3-Q6', type: 'true_false',
      prompt: 'O que se digita no input aparece de novo na saída do programa.',
      data: { options: [v('O input escreve a pergunta e lê a resposta, mas não a repete na saída.'), f()] },
      explanation: 'É por isso que, na saída, a resposta seguinte vem colada na pergunta.',
    },
    {
      id: 'PP-M3-Q7', type: 'true_false',
      prompt: 'O rowcount do cursor diz quantas linhas um UPDATE ou um DELETE mexeu.',
      data: { options: [v(), f('É exatamente o que ele diz, e é por ele que o programa sabe que o id não existia.')] },
      explanation: 'Zero quer dizer que nada mudou. As funções de alterar e remover devolvem esse número para o menu decidir o que dizer.',
    },
  ],

  /* ── Módulo 4 — validar a entrada (requisito 3.3) ───────────────────── */
  'm4-teoria': [
    {
      id: 'PP-M4-Q1', type: 'multiple_choice',
      prompt: 'O que int("dez") faz?',
      data: { options: [
        { id: 'a', text: 'Dá ValueError.', correct: true },
        { id: 'b', text: 'Devolve 10.', porque: 'O int converte algarismos, e não número escrito por extenso.' },
        { id: 'c', text: 'Devolve 0.', porque: 'Ele não inventa um número: recusa o texto.' },
        { id: 'd', text: 'Devolve o texto sem mudar.', porque: 'Ou ele devolve um inteiro, ou dá erro.' },
      ]},
      explanation: 'Se ninguém apanhar o ValueError, o programa fecha no meio do cadastro.',
    },
    {
      id: 'PP-M4-Q2', type: 'multiple_choice',
      prompt: 'O programa aceita -3 como quantidade de barracas. Que validação falta?',
      data: { options: [
        { id: 'a', text: 'Conferir que o número é de zero para cima.', correct: true },
        { id: 'b', text: 'Conferir que é um número inteiro.', porque: '-3 é um inteiro: essa conferência ele já passa.' },
        { id: 'c', text: 'Conferir que não é vazio antes de converter.', porque: '-3 não é vazio; o problema é o valor.' },
        { id: 'd', text: 'Nenhuma: o banco recusa negativo.', porque: 'A coluna é INTEGER NOT NULL, e -3 cabe nela.' },
      ]},
      explanation: 'Validar é conferir o tipo e o que faz sentido. Quantidade negativa é um inteiro que não existe no armário.',
    },
    {
      id: 'PP-M4-Q3', type: 'multiple_choice',
      prompt: 'A pessoa aperta Enter no nome. O banco tem nome TEXT NOT NULL. O que acontece sem validação no programa?',
      data: { options: [
        { id: 'a', text: 'O material entra com nome vazio.', correct: true },
        { id: 'b', text: 'O banco recusa por causa do NOT NULL.', porque: 'O texto vazio não é NULL, e o NOT NULL só recusa o NULL.' },
        { id: 'c', text: 'O programa fecha com ValueError.', porque: 'Nada converte o nome em número, então nada dá ValueError.' },
        { id: 'd', text: 'O input espera até vir alguma letra.', porque: 'O input devolve o que veio, inclusive nada.' },
      ]},
      explanation: 'O vazio do teclado é um texto com zero letras. Quem o recusa é o programa, com strip e uma pergunta de novo.',
    },
    {
      id: 'PP-M4-Q4', type: 'multiple_choice',
      prompt: 'Na função ler_inteiro, o que o continue faz depois do aviso?',
      data: { options: [
        { id: 'a', text: 'Volta ao começo do laço e pergunta de novo.', correct: true },
        { id: 'b', text: 'Sai da função devolvendo zero.', porque: 'Quem sai da função é o return; o continue fica no laço.' },
        { id: 'c', text: 'Segue para a próxima linha que vem dentro do laço.', porque: 'Ele pula o resto do laço e volta ao começo.' },
        { id: 'd', text: 'Encerra o programa.', porque: 'O continue não encerra nada: é ele que faz perguntar outra vez.' },
      ]},
      explanation: 'O laço só termina pelo return, quando a resposta serve. Até lá, cada resposta errada volta à pergunta.',
    },
    {
      id: 'PP-M4-Q5', type: 'multiple_choice',
      prompt: 'Por que ler_inteiro recebe o mínimo como parâmetro?',
      data: { options: [
        { id: 'a', text: 'Porque o id começa em 1 e a quantidade em 0.', correct: true },
        { id: 'b', text: 'Porque todo parâmetro deixa a função mais rápida.', porque: 'Parâmetro não muda velocidade; ele deixa a função servir a mais de um caso.' },
        { id: 'c', text: 'Porque o Python exige dois parâmetros.', porque: 'A função poderia ter um parâmetro só; o segundo é escolha.' },
        { id: 'd', text: 'Para aceitar números negativos.', porque: 'O mínimo existe justamente para recusá-los.' },
      ]},
      explanation: 'Uma função só serve à quantidade, ao id e à nova quantidade, porque o que muda entre elas é o mínimo.',
    },
    {
      id: 'PP-M4-Q6', type: 'true_false',
      prompt: 'Validar a entrada só importa nos campos de número.',
      data: { options: [v('O nome também precisa ser conferido, e a opção do menu também: toda entrada.'), f()] },
      explanation: 'O requisito diz toda entrada. O nome vazio e a opção 9 são entradas tanto quanto a quantidade.',
    },
    {
      id: 'PP-M4-Q7', type: 'true_false',
      prompt: 'int(" 12 ") devolve 12, mesmo com os espaços em volta.',
      data: { options: [v(), f('O int ignora espaço antes e depois; ele recusa o que não é algarismo no meio.')] },
      explanation: 'Espaço em volta não atrapalha. Letra, vírgula e texto vazio atrapalham.',
    },
  ],

  /* ── Módulo 5 — erros sem fechar o programa (requisito 3.4) ─────────── */
  'm5-teoria': [
    {
      id: 'PP-M5-Q1', type: 'multiple_choice',
      prompt: 'O que é o encerramento abrupto que o requisito proíbe?',
      data: { options: [
        { id: 'a', text: 'O programa fechar no meio por um erro.', correct: true },
        { id: 'b', text: 'A pessoa escolher a opção de sair do menu.', porque: 'Sair pela opção é o programa terminando do jeito combinado.' },
        { id: 'c', text: 'O programa demorar para responder.', porque: 'Demorar não é encerrar.' },
        { id: 'd', text: 'O computador do clube desligar.', porque: 'Isso não depende do programa.' },
      ]},
      explanation: 'O erro que ninguém apanha escreve o traceback e termina o programa ali, no meio do que a pessoa fazia.',
    },
    {
      id: 'PP-M5-Q2', type: 'multiple_choice',
      prompt: 'Cadastrar a Corda pela segunda vez dá qual erro, com o UNIQUE no nome?',
      data: { options: [
        { id: 'a', text: 'sqlite3.IntegrityError', correct: true },
        { id: 'b', text: 'ValueError', porque: 'ValueError é da conversão do int; aqui quem recusa é o banco.' },
        { id: 'c', text: 'NameError', porque: 'NameError é nome de variável que não existe no código.' },
        { id: 'd', text: 'Nenhum: o banco guarda as duas.', porque: 'O UNIQUE existe para recusar a segunda.' },
      ]},
      explanation: 'O banco recusa a regra quebrada com IntegrityError, e o programa decide o que dizer.',
    },
    {
      id: 'PP-M5-Q3', type: 'multiple_choice',
      prompt: 'Por que except sem nome é pior do que except sqlite3.IntegrityError?',
      data: { options: [
        { id: 'a', text: 'Ele apanha também os erros que ninguém previu.', correct: true },
        { id: 'b', text: 'Porque o Python não aceita except sem nome.', porque: 'O Python aceita; o problema é o que ele esconde.' },
        { id: 'c', text: 'Porque ele deixa o programa mais lento.', porque: 'A velocidade não muda; muda o que fica escondido.' },
        { id: 'd', text: 'Porque ele não apanha o IntegrityError do banco.', porque: 'Apanha, e apanha todo o resto junto.' },
      ]},
      explanation: 'Um erro de digitação no código vira "Já existe um material com esse nome." para sempre, e ninguém descobre por quê.',
    },
    {
      id: 'PP-M5-Q4', type: 'multiple_choice',
      prompt: 'Remover o id 99 não derruba o programa e não diz nada. O que falta?',
      data: { options: [
        { id: 'a', text: 'Avisar quando o rowcount é zero.', correct: true },
        { id: 'b', text: 'Um try em volta do comando DELETE.', porque: 'O DELETE não dá erro nenhum para o try apanhar.' },
        { id: 'c', text: 'Um commit depois do DELETE.', porque: 'O commit grava o que mudou, e aqui nada mudou.' },
        { id: 'd', text: 'Nada: não cair já basta.', porque: 'Sem aviso, a pessoa sai achando que removeu.' },
      ]},
      explanation: 'Tratar erro tem duas metades: não cair e dizer. O id que não existe só se descobre pelo rowcount.',
    },
    {
      id: 'PP-M5-Q5', type: 'multiple_choice',
      prompt: 'O try deve ficar em volta de quê?',
      data: { options: [
        { id: 'a', text: 'Da linha que pode dar aquele erro.', correct: true },
        { id: 'b', text: 'Do menu inteiro, para garantir que nada escape.', porque: 'Um try enorme apanha erros de outras linhas que não tinham nada a ver.' },
        { id: 'c', text: 'De todo o arquivo principal.py.', porque: 'Aí qualquer erro, de qualquer lugar, cairia no mesmo aviso.' },
        { id: 'd', text: 'Do import sqlite3.', porque: 'O import não é onde o nome repetido é recusado.' },
      ]},
      explanation: 'Pequeno e com nome: o try em volta do cadastrar, com except sqlite3.IntegrityError.',
    },
    {
      id: 'PP-M5-Q6', type: 'true_false',
      prompt: 'Um programa que apanha todo erro e segue calado cumpre o requisito de tratar erros.',
      data: { options: [v('Não cair é metade; a outra metade é dizer à pessoa o que não aconteceu.'), f()] },
      explanation: 'Calado, ele engana: quem tentou cadastrar ou remover sai achando que deu certo.',
    },
    {
      id: 'PP-M5-Q7', type: 'true_false',
      prompt: 'Depois do aviso de erro, o programa deve voltar ao menu.',
      data: { options: [v(), f('Voltar ao menu é o que deixa a pessoa tentar de novo sem abrir tudo outra vez.')] },
      explanation: 'O laço do menu continua; o erro tratado só pula aquela operação.',
    },
  ],

  /* ── Módulo 6 — versionar (requisito 4) ─────────────────────────────── */
  'm6-teoria': [
    {
      id: 'PP-M6-Q1', type: 'multiple_choice',
      prompt: 'Quatro arquivos mudaram, cada um com um assunto. O que faz git add . seguido de um commit?',
      data: { options: [
        { id: 'a', text: 'Junta os quatro assuntos num commit só.', correct: true },
        { id: 'b', text: 'Faz quatro commits, um para cada arquivo mudado.', porque: 'Um commit é um commit: o git add . prepara tudo para ele.' },
        { id: 'c', text: 'Guarda só o primeiro arquivo da lista.', porque: 'O ponto quer dizer tudo o que mudou na pasta.' },
        { id: 'd', text: 'Dá erro por haver mais de um arquivo.', porque: 'O Git aceita quantos arquivos se preparar.' },
      ]},
      explanation: 'Para um assunto por commit, prepara-se um arquivo por vez, com git add e o nome dele.',
    },
    {
      id: 'PP-M6-Q2', type: 'multiple_choice',
      prompt: 'Que comando mostra o que mudou dentro de um arquivo antes do commit?',
      data: { options: [
        { id: 'a', text: 'git diff', correct: true },
        { id: 'b', text: 'git status', porque: 'O status diz que o arquivo mudou, e não o que mudou nele.' },
        { id: 'c', text: 'git log', porque: 'O log mostra os commits já feitos.' },
        { id: 'd', text: 'git add', porque: 'O add prepara o arquivo, e não mostra nada.' },
      ]},
      explanation: 'O diff marca com menos a linha que saiu e com mais a que entrou. É lendo ele que se escreve a mensagem.',
    },
    {
      id: 'PP-M6-Q3', type: 'multiple_choice',
      prompt: 'Qual destas é uma boa mensagem de commit?',
      data: { options: [
        { id: 'a', text: 'Avisa quando não há material cadastrado', correct: true },
        { id: 'b', text: 'ajustes', porque: 'Daqui a um mês ninguém sabe o que foi ajustado.' },
        { id: 'c', text: 'update', porque: 'Todo commit é uma atualização; a palavra não diz qual.' },
        { id: 'd', text: 'mudanças feitas hoje no principal.py e no banco.py', porque: 'Diz onde e quando, e não o que mudou.' },
      ]},
      explanation: 'A mensagem diz o que o commit fez, numa frase que completa "este commit...".',
    },
    {
      id: 'PP-M6-Q4', type: 'multiple_choice',
      prompt: 'Onde se vê em que dia cada commit foi feito?',
      data: { options: [
        { id: 'a', text: 'Na linha Date do git log.', correct: true },
        { id: 'b', text: 'Na mensagem de cada commit.', porque: 'A mensagem diz o que mudou; a data é gravada à parte.' },
        { id: 'c', text: 'No git status.', porque: 'O status fala do que ainda não tem commit.' },
        { id: 'd', text: 'No nome dos arquivos.', porque: 'O nome do arquivo não muda a cada commit.' },
      ]},
      explanation: 'É por ela que o examinador confere os quatro dias distintos do requisito.',
    },
    {
      id: 'PP-M6-Q5', type: 'multiple_choice',
      prompt: 'Por que o arquivo almoxarifado.db fica no .gitignore?',
      data: { options: [
        { id: 'a', text: 'É dado, e cada computador cria o seu.', correct: true },
        { id: 'b', text: 'Porque o Git não aceita arquivos de banco.', porque: 'Aceitaria; não é para guardar que ele fica de fora.' },
        { id: 'c', text: 'Para o programa rodar mais rápido.', porque: 'O .gitignore não muda nada no programa.' },
        { id: 'd', text: 'Porque ele tem senha.', porque: 'O banco do almoxarifado não tem senha nenhuma.' },
      ]},
      explanation: 'O repositório guarda o código. O banco nasce na primeira vez que o programa roda, em cada computador.',
    },
    {
      id: 'PP-M6-Q6', type: 'true_false',
      prompt: 'Fazer os quinze commits no último dia cumpre o requisito, se as mensagens forem boas.',
      data: { options: [v('O requisito pede quatro dias distintos, e cada commit leva a data do dia em que foi feito.'), f()] },
      explanation: 'A data é o que o requisito lê, e ela mostra um projeto feito ao longo do tempo.',
    },
    {
      id: 'PP-M6-Q7', type: 'true_false',
      prompt: 'Uma mensagem que precisa de "e" para caber costuma ser sinal de dois assuntos no mesmo commit.',
      data: { options: [v(), f('Quando a frase precisa juntar duas coisas, o commit juntou duas mudanças.')] },
      explanation: 'Dois assuntos pedem dois commits, cada um com a sua mensagem.',
    },
  ],

  /* ── Módulo 7 — o README (requisito 5) ──────────────────────────────── */
  'm7-teoria': [
    {
      id: 'PP-M7-Q1', type: 'multiple_choice',
      prompt: 'Quais são as quatro partes que o requisito pede no README?',
      data: { options: [
        { id: 'a', text: 'Descrição, instalação, uso e exemplo de execução.', correct: true },
        { id: 'b', text: 'Título, nome do autor, data de criação e a licença de uso.', porque: 'Podem até aparecer, mas não são as quatro do requisito.' },
        { id: 'c', text: 'Problema, solução, código e testes.', porque: 'O README não traz o código; ele explica o programa.' },
        { id: 'd', text: 'Menu, banco, erros e commits.', porque: 'São partes do projeto, e não do README.' },
      ]},
      explanation: 'O que é, como instalar, como usar e como fica — na ordem em que alguém pergunta.',
    },
    {
      id: 'PP-M7-Q2', type: 'multiple_choice',
      prompt: 'O que vai na seção de instalação do almoxarifado?',
      data: { options: [
        { id: 'a', text: 'Ter o Python 3 e baixar a pasta.', correct: true },
        { id: 'b', text: 'O comando que abre o menu.', porque: 'Isso é uso: vem depois de instalado.' },
        { id: 'c', text: 'A lista de funcionalidades.', porque: 'Isso é descrição, e não instalação.' },
        { id: 'd', text: 'Como criar a tabela à mão, no SQLite.', porque: 'O programa cria a tabela sozinho na primeira vez.' },
      ]},
      explanation: 'Instalação é o que é preciso ter e fazer antes da primeira vez.',
    },
    {
      id: 'PP-M7-Q3', type: 'multiple_choice',
      prompt: 'No Markdown, como se marca um título de seção?',
      data: { options: [
        { id: 'a', text: 'Com ## no começo da linha.', correct: true },
        { id: 'b', text: 'Escrevendo tudo em maiúsculas.', porque: 'Maiúscula é só texto; o Markdown lê a cerquilha.' },
        { id: 'c', text: 'Com três crases antes e depois.', porque: 'As três crases fazem o bloco de código.' },
        { id: 'd', text: 'Pulando duas linhas antes.', porque: 'Linha em branco separa parágrafos, e não faz título.' },
      ]},
      explanation: 'Uma cerquilha é o título do documento; duas, o título de cada seção.',
    },
    {
      id: 'PP-M7-Q4', type: 'multiple_choice',
      prompt: 'Por que o exemplo de execução vai dentro de um bloco de código?',
      data: { options: [
        { id: 'a', text: 'Para aparecer exatamente como na tela.', correct: true },
        { id: 'b', text: 'Para o exemplo rodar sozinho dentro do site.', porque: 'O bloco só mostra o texto; nada roda ali.' },
        { id: 'c', text: 'Para esconder o exemplo de quem lê.', porque: 'O bloco mostra, e não esconde.' },
        { id: 'd', text: 'Porque o Git exige.', porque: 'O Git guarda qualquer texto; quem desenha é o site.' },
      ]},
      explanation: 'Sem o bloco, as linhas do menu se juntam num parágrafo, e o exemplo deixa de parecer com a tela.',
    },
    {
      id: 'PP-M7-Q5', type: 'multiple_choice',
      prompt: 'O exemplo do README mostra a opção 5 - Relatório, que o programa não tem. O que acontece com quem chega?',
      data: { options: [
        { id: 'a', text: 'Acha que instalou errado.', correct: true },
        { id: 'b', text: 'Nada: ninguém lê o exemplo.', porque: 'O exemplo é justamente o que se compara com a tela.' },
        { id: 'c', text: 'O programa ganha a opção 5.', porque: 'O README não muda o programa.' },
        { id: 'd', text: 'O Git recusa o commit do README.', porque: 'O Git não confere o que o README diz.' },
      ]},
      explanation: 'Exemplo se cola de uma execução de verdade. Inventado, ele erra em detalhe, e o detalhe é o que se compara.',
    },
    {
      id: 'PP-M7-Q6', type: 'true_false',
      prompt: 'Escrever o README no disco basta: ele entra no repositório sozinho.',
      data: { options: [v('Ele precisa de git add README.md e de um commit, como todo arquivo.'), f()] },
      explanation: 'Mexeu depois do commit? Outro commit. O README do disco tem de ser o do último commit.',
    },
    {
      id: 'PP-M7-Q7', type: 'true_false',
      prompt: 'O README é escrito para quem nunca viu o projeto.',
      data: { options: [v(), f('É para essa pessoa que ele existe: quem fez o projeto não precisa dele para usar.')] },
      explanation: 'Por isso "rode o programa" não serve: qual programa, de que pasta, com que comando?',
    },
  ],

  /* ── Módulo 8 — o diário de bordo (requisito 6) ─────────────────────── */
  'm8-teoria': [
    {
      id: 'PP-M8-Q1', type: 'multiple_choice',
      prompt: 'O que se anota num diário de bordo de programação?',
      data: { options: [
        { id: 'a', text: 'O problema, como apareceu e o que se fez.', correct: true },
        { id: 'b', text: 'Cada linha de código escrita no dia, na ordem.', porque: 'O código já está no repositório; o diário conta o caminho.' },
        { id: 'c', text: 'Só os erros que ficaram sem solução.', porque: 'O requisito pede a solução adotada para cada um.' },
        { id: 'd', text: 'A hora em que se começou e parou.', porque: 'Tempo não diz o que deu errado nem como se resolveu.' },
      ]},
      explanation: 'É o que o código não mostra: o tropeço e o que se aprendeu com ele.',
    },
    {
      id: 'PP-M8-Q2', type: 'multiple_choice',
      prompt: 'Qual destas é um sintoma, e não a causa?',
      data: { options: [
        { id: 'a', text: 'O programa fechou com ValueError.', correct: true },
        { id: 'b', text: 'O int recebia o texto sem conferir.', porque: 'Essa é a causa: o que estava errado no programa.' },
        { id: 'c', text: 'Faltava o laço que pergunta de novo.', porque: 'Também é causa, dita pelo que faltava.' },
        { id: 'd', text: 'A conversão foi para um try.', porque: 'Isso é a solução.' },
      ]},
      explanation: 'O sintoma é o que apareceu na tela; é ele que faz alguém reconhecer o problema da próxima vez.',
    },
    {
      id: 'PP-M8-Q3', type: 'multiple_choice',
      prompt: 'Qual solução ensina alguma coisa a quem ler o diário?',
      data: { options: [
        { id: 'a', text: 'Pus o cadastrar num try com except IntegrityError.', correct: true },
        { id: 'b', text: 'Arrumei.', porque: 'Não diz o que foi feito nem por que resolveu.' },
        { id: 'c', text: 'O programa fechava, e aí depois parou de fechar sozinho.', porque: 'Repete o problema e não conta o que mudou.' },
        { id: 'd', text: 'Pesquisei e deu certo.', porque: 'Não diz o que se achou, nem o que se mudou.' },
      ]},
      explanation: 'A solução diz o que mudou no programa, e quem lê consegue fazer igual.',
    },
    {
      id: 'PP-M8-Q4', type: 'multiple_choice',
      prompt: 'O mesmo ValueError apareceu na quantidade, no id e na nova quantidade. Como entra no diário?',
      data: { options: [
        { id: 'a', text: 'Como um problema só.', correct: true },
        { id: 'b', text: 'Como três problemas, um por pergunta.', porque: 'A causa é a mesma, e a solução também: uma função só.' },
        { id: 'c', text: 'Não entra, porque é um erro comum.', porque: 'Comum ou não, ele pode estar entre os que mais pesaram.' },
        { id: 'd', text: 'Como uma lista de todas as vezes.', porque: 'O diário pede problemas e soluções, e não contagem.' },
      ]},
      explanation: 'Problemas que se repetem contam uma vez. Três registros iguais deixam de fora outros dois problemas.',
    },
    {
      id: 'PP-M8-Q5', type: 'multiple_choice',
      prompt: 'O que torna um problema um dos três maiores?',
      data: { options: [
        { id: 'a', text: 'Ter custado muito ou ensinado muito.', correct: true },
        { id: 'b', text: 'Ter sido o primeiro a aparecer.', porque: 'Aparecer primeiro não diz quanto ele pesou.' },
        { id: 'c', text: 'Ter a mensagem de erro mais comprida.', porque: 'O tamanho da mensagem não mede o problema.' },
        { id: 'd', text: 'Ter sido resolvido mais depressa.', porque: 'O rápido costuma ser o menor dos três.' },
      ]},
      explanation: 'Custou tempo ou trabalho perdido, ou mudou o jeito de fazer o resto do programa.',
    },
    {
      id: 'PP-M8-Q6', type: 'true_false',
      prompt: 'O diário de bordo escrito uma semana depois é tão útil quanto o escrito no dia.',
      data: { options: [v('Uma semana depois sobra "deu um erro no banco", sem a mensagem nem o que se fez.'), f()] },
      explanation: 'Escreve-se perto de quando aconteceu, enquanto a mensagem e a solução ainda estão na cabeça.',
    },
    {
      id: 'PP-M8-Q7', type: 'true_false',
      prompt: 'Um erro bobo pode estar entre os três maiores, se custou caro.',
      data: { options: [v(), f('O tamanho do problema é o que ele custou, e não quão simples foi a solução.')] },
      explanation: 'O commit esquecido que apagou uma hora de trabalho é grande, por mais simples que seja o conserto.',
    },
  ],

  /* ── Módulo 9 — a apresentação (requisito 7) ────────────────────────── */
  'm9-teoria': [
    {
      id: 'PP-M9-Q1', type: 'multiple_choice',
      prompt: 'Num roteiro de quinze minutos, qual parte leva a maior fatia?',
      data: { options: [
        { id: 'a', text: 'O programa funcionando.', correct: true },
        { id: 'b', text: 'O problema e quem usa.', porque: 'Ele se conta em uma ou duas frases.' },
        { id: 'c', text: 'As perguntas do examinador.', porque: 'Elas ficam com o que sobrar.' },
        { id: 'd', text: 'A leitura do código, linha por linha.', porque: 'O requisito pede o programa funcionando, e não lido.' },
      ]},
      explanation: 'O requisito pede demonstrar o funcionamento. É ele que o examinador precisa ver.',
    },
    {
      id: 'PP-M9-Q2', type: 'multiple_choice',
      prompt: 'Por que pôr um erro de propósito na demonstração?',
      data: { options: [
        { id: 'a', text: 'Para mostrar a validação e o tratamento.', correct: true },
        { id: 'b', text: 'Para o examinador achar o erro sozinho na hora.', porque: 'O erro é seu, de propósito, para mostrar o que o programa faz com ele.' },
        { id: 'c', text: 'Para gastar o tempo que sobra.', porque: 'Tempo de sobra fica para as perguntas.' },
        { id: 'd', text: 'Porque todo programa tem erro.', porque: 'Não é sobre ter erro, é sobre atravessá-lo sem cair.' },
      ]},
      explanation: 'Digitar "dez" ou cadastrar um nome repetido mostra o requisito 3.3 e o 3.4 acontecendo.',
    },
    {
      id: 'PP-M9-Q3', type: 'multiple_choice',
      prompt: 'Qual destas é uma decisão técnica do almoxarifado?',
      data: { options: [
        { id: 'a', text: 'Passar os valores com ? no comando.', correct: true },
        { id: 'b', text: 'Fazer o projeto para o almoxarifado do clube.', porque: 'Isso é o problema, e não como o programa foi feito.' },
        { id: 'c', text: 'Apresentar em quinze minutos.', porque: 'É regra da apresentação.' },
        { id: 'd', text: 'Ter a proposta aprovada.', porque: 'É etapa do projeto, e não escolha de como fazê-lo.' },
      ]},
      explanation: 'Decisão técnica é escolha sobre como o programa foi feito, e toda escolha tem uma alternativa.',
    },
    {
      id: 'PP-M9-Q4', type: 'multiple_choice',
      prompt: 'O que falta em "usei o SQLite porque é melhor"?',
      data: { options: [
        { id: 'a', text: 'Comparar com a alternativa.', correct: true },
        { id: 'b', text: 'Dizer a versão do SQLite.', porque: 'A versão não justifica nada.' },
        { id: 'c', text: 'Nada: está justificado.', porque: '"Melhor" sem dizer do que, e em quê, não justifica.' },
        { id: 'd', text: 'Mostrar o código do banco.py.', porque: 'O código mostra o que foi feito, e não por que esse jeito.' },
      ]},
      explanation: 'Justificar é dizer por que esta e não a outra, com um exemplo do próprio programa.',
    },
    {
      id: 'PP-M9-Q5', type: 'multiple_choice',
      prompt: 'O programa trava no meio da demonstração. O que fazer?',
      data: { options: [
        { id: 'a', text: 'Dizer o que aconteceu e o que o causou.', correct: true },
        { id: 'b', text: 'Fingir que era de propósito.', porque: 'O examinador percebe, e a explicação some.' },
        { id: 'c', text: 'Pular para as perguntas.', porque: 'A demonstração ficaria pela metade.' },
        { id: 'd', text: 'Recomeçar a apresentação desde o início.', porque: 'Os quinze minutos não recomeçam.' },
      ]},
      explanation: 'Quem ensaiou sabe onde travou e explica — e isso mostra que o programa é seu.',
    },
    {
      id: 'PP-M9-Q6', type: 'true_false',
      prompt: 'Uma lista de trinta materiais na tela ajuda o examinador a ver o que mudou.',
      data: { options: [v('Uma lista longa esconde a linha que acabou de mudar.'), f()] },
      explanation: 'Comece com o banco vazio ou com poucos materiais: cada mudança fica à vista.',
    },
    {
      id: 'PP-M9-Q7', type: 'true_false',
      prompt: 'Toda decisão técnica tem um custo, e a justificativa deve dizê-lo.',
      data: { options: [v(), f('Toda escolha deixa algo de lado, e quem a defende precisa saber o quê.')] },
      explanation: 'O banco não se abre num editor de texto; o CSV sim. Quem escolheu o banco sabe disso e explica por que valeu.',
    },
  ],
};
