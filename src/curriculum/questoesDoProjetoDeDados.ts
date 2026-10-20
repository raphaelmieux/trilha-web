import type { Question } from '../types';

/*
 * As questões das lições de teoria da CC-ES013 Projeto de Dados.
 *
 * ── O que elas medem ──────────────────────────────────────────────────────
 * A mecânica das contas já foi medida na CC-ES009 e na CC-ES010. O que carrega
 * esta vereda é a **decisão**: limpar numa cópia ou no original, corrigir ou
 * deixar em branco, excluir a linha ou manter, média ou mediana, linha ou
 * colunas, editor ou leitor. Cada uma tem questão própria, e quase todas são
 * de diagnóstico — porque a matéria inteira é feita de bases que **funcionam**:
 * a média que pula o texto sem avisar, o Remover Duplicatas que não acha nada,
 * a pizza de médias com fatias plausíveis.
 *
 * Toda alternativa errada diz por que está errada, no campo porque, e a certa
 * não carrega motivo nenhum: o porquê tem lugar próprio, o explanation. E nada
 * de crase nem de asterisco — a questão vai para o QuestionRenderer, que
 * imprime texto puro.
 *
 * A certa é uma afirmação curta, de propósito, pela razão escrita na CC-ES012:
 * o hábito de pôr o porquê dentro dela entrega a resposta pelo tamanho. E os
 * números citados são os da base, pelo mesmo motor que responde ao
 * desbravador — `exemplosDoProjetoDeDados.test.ts` os confere.
 */

export const QUESTOES_DO_PROJETO_DE_DADOS: Record<string, Question[]> = {
  /* ──────────────────────────────────────────────────────────────────────
     Módulo 1 — A pergunta vem antes do dado (requisito 2)
     ────────────────────────────────────────────────────────────────────── */
  'm1-teoria': [
    {
      id: 'ES13-M1-Q1', type: 'multiple_choice',
      prompt: 'Por que a proposta de um projeto de dados é aprovada antes de abrir a base?',
      data: { options: [
        { id: 'a', text: 'Para a pergunta não sair do que a base já mostra.', correct: true },
        { id: 'b', text: 'Porque a base só pode ser baixada depois do sim.', porque: 'A base está ao alcance antes; o problema é o que olhar para ela faz com a pergunta.' },
        { id: 'c', text: 'Porque o examinador precisa conferir a base antes.', porque: 'O examinador aprova a pergunta e o uso, e não o arquivo.' },
        { id: 'd', text: 'Para o projeto ganhar mais pontos na avaliação.', porque: 'A vereda não tem nota: o que a ordem protege é a pergunta.' },
      ]},
      explanation: 'Quem olha o dado primeiro encontra alguma coisa interessante e escreve a pergunta que aquele achado responde. A análise sai bonita e não serve a quem precisava decidir.',
    },
    {
      id: 'ES13-M1-Q2', type: 'multiple_choice',
      prompt: 'Qual destas é uma pergunta, e não um assunto?',
      data: { options: [
        { id: 'a', text: 'Quem mora mais longe falta mais às reuniões?', correct: true },
        { id: 'b', text: 'A presença dos desbravadores no clube.', porque: 'É um assunto: qualquer gráfico serve e nenhum responde.' },
        { id: 'c', text: 'Presença e distância no primeiro semestre.', porque: 'Junta dois assuntos, e continua sem dizer o que se quer saber.' },
        { id: 'd', text: 'Um estudo sobre a frequência das unidades.', porque: 'É o nome de um trabalho, e não uma coisa que o dado responde.' },
      ]},
      explanation: 'Pergunta é o que o dado pode responder com sim, não ou um número. Assunto é onde a pergunta mora.',
    },
    {
      id: 'ES13-M1-Q3', type: 'multiple_choice',
      prompt: 'A proposta diz "quem decide: a diretoria". O que ainda falta?',
      data: { options: [
        { id: 'a', text: 'Que decisão a diretoria vai tomar.', correct: true },
        { id: 'b', text: 'O nome de cada pessoa da diretoria.', porque: 'Os nomes cabem no registro do fim; a proposta precisa da decisão.' },
        { id: 'c', text: 'A data da reunião da diretoria.', porque: 'Útil para marcar a apresentação, mas não diz para que serve o resultado.' },
        { id: 'd', text: 'A assinatura da diretoria na proposta.', porque: 'Quem aprova a proposta é o examinador, e não quem vai decidir.' },
      ]},
      explanation: 'Sem a decisão, "a diretoria" é um nome, e não um uso. "Se monta uma lista de carona, e para quem" dá para conferir no fim.',
    },
    {
      id: 'ES13-M1-Q4', type: 'true_false',
      prompt: 'Abrir a base para dar uma olhada antes de escrever a proposta não atrapalha nada.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Atrapalha: o que se viu na base passa a escrever a pergunta por você.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O requisito diz que a execução não começa antes da aprovação, e olhar a base é o começo da execução.',
    },
    {
      id: 'ES13-M1-Q5', type: 'multiple_choice',
      prompt: 'Por que a origem dos dados entra na proposta, antes de a base ser buscada?',
      data: { options: [
        { id: 'a', text: 'Se ela não existe, a proposta descobre a tempo.', correct: true },
        { id: 'b', text: 'Porque a origem é a mesma coisa que a pergunta.', porque: 'A pergunta é o que se quer saber; a origem é onde o dado mora.' },
        { id: 'c', text: 'Para o examinador baixar a base no seu lugar.', porque: 'Quem busca a base é quem faz o projeto.' },
        { id: 'd', text: 'Porque sem ela o arquivo não abre na planilha.', porque: 'A planilha abre qualquer arquivo; a origem diz se ele responde.' },
      ]},
      explanation: 'Escrever de onde o dado vai sair é a primeira conferência de que a pergunta tem resposta possível.',
    },
    {
      id: 'ES13-M1-Q6', type: 'multiple_choice',
      prompt: 'Para quem faz sentido apresentar o resultado deste projeto?',
      data: { options: [
        { id: 'a', text: 'Para quem a proposta diz que vai decidir.', correct: true },
        { id: 'b', text: 'Para a família, que vai ouvir com atenção.', porque: 'Ouvir com atenção é ótimo para ensaiar; a família não decide nada no clube.' },
        { id: 'c', text: 'Para a turma da escola, que conhece estatística.', porque: 'Saber estatística não dá a ninguém o poder de montar a carona.' },
        { id: 'd', text: 'Para quem respondeu ao questionário.', porque: 'Quem respondeu merece saber do resultado, mas a decisão é de outra pessoa.' },
      ]},
      explanation: 'A apresentação existe para alguém fazer alguma coisa com o resultado — e quem é esse alguém está na proposta desde o primeiro dia.',
    },
    {
      id: 'ES13-M1-Q7', type: 'multiple_choice',
      prompt: 'Uma proposta pergunta: "Os desbravadores gostam do clube?" Qual é o problema?',
      data: { options: [
        { id: 'a', text: 'Gostar não aparece em base nenhuma do clube.', correct: true },
        { id: 'b', text: 'A pergunta é curta demais para ser aprovada.', porque: 'O tamanho não é o problema; o que falta é dado que responda.' },
        { id: 'c', text: 'Pergunta não pode ter ponto de interrogação.', porque: 'Pode e deve: o problema é outro.' },
        { id: 'd', text: 'Ela fala de pessoas, e o projeto é sobre números.', porque: 'A presença também fala de pessoas, e a chamada a conta.' },
      ]},
      explanation: 'Uma boa pergunta tem um dado que a responde. Gostar se pergunta numa pesquisa nova — e aí a origem é outra, e precisa estar na proposta.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 2 — A base que responde (requisito 3)
     ────────────────────────────────────────────────────────────────────── */
  'm2-teoria': [
    {
      id: 'ES13-M2-Q1', type: 'multiple_choice',
      prompt: 'Na chamada do semestre, o que é um registro?',
      data: { options: [
        { id: 'a', text: 'Uma linha: um desbravador.', correct: true },
        { id: 'b', text: 'Uma coluna: uma informação.', porque: 'Coluna é campo; registro é a linha.' },
        { id: 'c', text: 'Uma reunião do semestre.', porque: 'As reuniões estão contadas dentro do registro, na presença.' },
        { id: 'd', text: 'Uma unidade do clube.', porque: 'A unidade é um campo de cada registro.' },
      ]},
      explanation: 'Registro é a linha — uma pessoa, um evento, uma coisa contada. O requisito pede pelo menos sessenta.',
    },
    {
      id: 'ES13-M2-Q2', type: 'multiple_choice',
      prompt: 'A base de inscrições do acampamento tem 48 registros e 11 campos. Ela serve?',
      data: { options: [
        { id: 'a', text: 'Não: tem menos de sessenta registros.', correct: true },
        { id: 'b', text: 'Sim: onze campos compensam os registros.', porque: 'Os dois mínimos valem juntos; um não compensa o outro.' },
        { id: 'c', text: 'Sim: ela já está arrumada pela CC-ES008.', porque: 'Estar arrumada não muda o tamanho, e o requisito pede sessenta.' },
        { id: 'd', text: 'Não: tem campos demais para analisar.', porque: 'Campos a mais não atrapalham; o que falta são registros.' },
      ]},
      explanation: 'Sessenta registros e cinco campos são mínimos que valem juntos. E ela tem mais um problema: não fala de quem falta às reuniões.',
    },
    {
      id: 'ES13-M2-Q3', type: 'multiple_choice',
      prompt: 'A chamada do ano passado tem 66 registros e 3 campos: nome, unidade e presença. O que falta?',
      data: { options: [
        { id: 'a', text: 'Campos, e o que poderia explicar a presença.', correct: true },
        { id: 'b', text: 'Registros: sessenta e seis ainda é pouco.', porque: 'Sessenta e seis passa do mínimo; o que falta é o resto.' },
        { id: 'c', text: 'Nada: a presença é o que a pergunta quer.', porque: 'A pergunta quer explicar a presença, e sem a distância não há o que relacionar.' },
        { id: 'd', text: 'A data de obtenção do arquivo.', porque: 'A data se declara de qualquer base; o problema é o conteúdo.' },
      ]},
      explanation: 'Três campos é menos que cinco, e nenhum deles é a suspeita. Uma base responde quando tem, na mesma linha, o que se quer explicar e o que pode explicar.',
    },
    {
      id: 'ES13-M2-Q4', type: 'multiple_choice',
      prompt: 'A pesquisa pública de deslocamento do DF tem dados oficiais. Por que ela não responde à pergunta?',
      data: { options: [
        { id: 'a', text: 'Ela fala de regiões, e não de quem falta.', correct: true },
        { id: 'b', text: 'Porque base pública nunca pode ser usada.', porque: 'O requisito aceita fonte pública, desde que declarada.' },
        { id: 'c', text: 'Porque ela é de 2024, e não deste ano.', porque: 'A data importa, mas o problema é de quem ela fala.' },
        { id: 'd', text: 'Porque dados do governo têm erros demais.', porque: 'A pesquisa é cuidadosa; ela só não é sobre o clube.' },
      ]},
      explanation: 'Uma base boa sobre outra coisa continua sendo sobre outra coisa. A pergunta é sobre os desbravadores, e é deles que a base precisa falar.',
    },
    {
      id: 'ES13-M2-Q5', type: 'multiple_choice',
      prompt: 'A chamada é de fevereiro a julho e chegou em 3 de agosto. Qual é a data de obtenção?',
      data: { options: [
        { id: 'a', text: '3 de agosto.', correct: true },
        { id: 'b', text: 'Fevereiro, quando os dados começam.', porque: 'Esse é o começo do período; obtenção é quando o arquivo chegou.' },
        { id: 'c', text: 'Julho, quando os dados terminam.', porque: 'Esse é o fim do período; o arquivo chegou depois.' },
        { id: 'd', text: 'O dia em que a análise ficar pronta.', porque: 'A obtenção é o começo do trabalho, e não o fim.' },
      ]},
      explanation: 'Período é a época de que o dado fala; obtenção é o dia em que a cópia chegou às suas mãos. É ela que diz de que versão da base a análise fala.',
    },
    {
      id: 'ES13-M2-Q6', type: 'true_false',
      prompt: 'Declarar a data de obtenção importa porque a base pode ser corrigida depois.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Importa: a secretaria pode corrigir uma presença em setembro, e a análise continua sendo da versão de agosto.' },
      ]},
      explanation: 'Sem a data, ninguém sabe de que versão a análise fala — e duas análises da mesma base podem discordar por isso.',
    },
    {
      id: 'ES13-M2-Q7', type: 'multiple_choice',
      prompt: 'Qual destas é uma origem bem declarada?',
      data: { options: [
        { id: 'a', text: 'Sistema de chamada, cruzado com o questionário.', correct: true },
        { id: 'b', text: 'Da secretaria do clube.', porque: 'Diz quem, e não de onde: outra pessoa não acharia o mesmo arquivo.' },
        { id: 'c', text: 'Um arquivo que recebi por mensagem da secretaria.', porque: 'Não diz de que sistema saiu nem com o que foi cruzado.' },
        { id: 'd', text: 'A planilha que estava na nuvem do clube.', porque: 'Diz onde estava, e não de onde o dado veio.' },
      ]},
      explanation: 'A origem deixa outra pessoa buscar o mesmo arquivo: quem forneceu, de que sistema saiu, e com que outro dado foi cruzado.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 3 — A mesma coisa escrita de um jeito só (requisito 4)
     ────────────────────────────────────────────────────────────────────── */
  'm3-teoria': [
    {
      id: 'ES13-M3-Q1', type: 'multiple_choice',
      prompt: 'Por que a limpeza acontece numa cópia da aba, e não na base que chegou?',
      data: { options: [
        { id: 'a', text: 'Porque a bruta também é entregue no fim.', correct: true },
        { id: 'b', text: 'Porque a planilha não deixa editar a original.', porque: 'Deixa, e é por isso que o cuidado é seu.' },
        { id: 'c', text: 'Porque a cópia ocupa menos espaço.', porque: 'A cópia ocupa o mesmo; o motivo é o que a original prova.' },
        { id: 'd', text: 'Porque a cópia já vem sem os erros.', porque: 'A cópia nasce idêntica, com os mesmos erros, para você limpar.' },
      ]},
      explanation: 'O requisito 9 pede a base bruta e a tratada. Só entrega a bruta quem nunca mexeu nela.',
    },
    {
      id: 'ES13-M3-Q2', type: 'multiple_choice',
      prompt: 'Você abriu Mover ou Copiar e apertou OK sem mexer em nada. O que aconteceu?',
      data: { options: [
        { id: 'a', text: 'A aba só mudou de lugar.', correct: true },
        { id: 'b', text: 'Nasceu uma cópia chamada Bruta (2).', porque: 'Só nasce cópia com "Criar uma cópia" marcada, e ela vem desmarcada.' },
        { id: 'c', text: 'A aba foi apagada.', porque: 'Mover não apaga; muda a posição.' },
        { id: 'd', text: 'Nada, porque faltou escolher o destino.', porque: 'O destino tem um valor escolhido de partida, e a aba vai para lá.' },
      ]},
      explanation: 'A caixa "Criar uma cópia" nasce desmarcada. Quem esquece dela continua limpando o original sem perceber.',
    },
    {
      id: 'ES13-M3-Q3', type: 'multiple_choice',
      prompt: 'Substituir "aguia" por "Águia" com "Diferenciar maiúsculas" desmarcada pega quais grafias?',
      data: { options: [
        { id: 'a', text: 'aguia, AGUIA e Aguia, mas não Águia.', correct: true },
        { id: 'b', text: 'Todas, inclusive as com acento.', porque: 'O acento é outra letra: "aguia" não acha "Águia".' },
        { id: 'c', text: 'Só aguia, escrita igualzinha.', porque: 'Isso seria com "Diferenciar maiúsculas" marcada.' },
        { id: 'd', text: 'Nenhuma, porque falta selecionar a coluna.', porque: 'Sem seleção ele procura na planilha inteira, e acha.' },
      ]},
      explanation: 'Maiúscula e minúscula viram a mesma letra com a caixa desmarcada; acento continua sendo outra. Por isso "ônibus" pede uma segunda passada.',
    },
    {
      id: 'ES13-M3-Q4', type: 'multiple_choice',
      prompt: 'Depois de substituir "aguia" por "Águia", o Pedro Aguiar virou Pedro Águiar. O que faltou?',
      data: { options: [
        { id: 'a', text: 'Selecionar a coluna e marcar célula inteira.', correct: true },
        { id: 'b', text: 'Marcar a caixa "Diferenciar maiúsculas".', porque: 'Ajudaria por acaso aqui, mas "aguia" minúsculo dentro de outro nome ainda seria trocado.' },
        { id: 'c', text: 'Rodar Remover Duplicatas antes de trocar.', porque: 'Duplicatas não têm nada a ver com trocar texto dentro de nome.' },
        { id: 'd', text: 'Escrever "Aguia" com a primeira maiúscula.', porque: 'Com a caixa desmarcada, maiúscula e minúscula dão no mesmo.' },
      ]},
      explanation: 'Sem seleção, o alcance é a planilha inteira; sem célula inteira, a troca vale dentro do texto. As duas juntas fazem o estrago — e a contagem de trocas parece a esperada.',
    },
    {
      id: 'ES13-M3-Q5', type: 'multiple_choice',
      prompt: 'Remover Duplicatas respondeu "Nenhum valor duplicado encontrado", mas a Carla aparece duas vezes. Por quê?',
      data: { options: [
        { id: 'a', text: 'As duas linhas estão escritas diferente.', correct: true },
        { id: 'b', text: 'O comando só olha a primeira coluna.', porque: 'Ele olha as colunas marcadas, e todas vêm marcadas.' },
        { id: 'c', text: 'A Carla repetida é outra pessoa.', porque: 'É a mesma Carla, exportada duas vezes.' },
        { id: 'd', text: 'O comando só funciona em tabela pequena.', porque: 'Funciona em qualquer tabela; ele compara o que está escrito.' },
      ]},
      explanation: 'A segunda linha veio com "aguia" e "onibus". Padronize primeiro, e aí as duas ficam idênticas e a de baixo sai.',
    },
    {
      id: 'ES13-M3-Q6', type: 'true_false',
      prompt: 'Para achar duplicatas mais depressa, basta deixar marcada só a coluna do nome.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Apaga gente: há duas Ana Clara Ribeiro, de unidades e idades diferentes.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'As colunas marcadas definem o que é "igual". Com só o nome, duas pessoas com o mesmo nome viram uma, e a que sumiu sumiu da base inteira.',
    },
    {
      id: 'ES13-M3-Q7', type: 'multiple_choice',
      prompt: 'O que acontece numa conta por unidade se "aguia", "AGUIA" e "Águia" ficarem na base?',
      data: { options: [
        { id: 'a', text: 'A Águia vira três grupos diferentes.', correct: true },
        { id: 'b', text: 'A conta dá erro de nome.', porque: 'Não dá erro nenhum: os grupos só saem a mais.' },
        { id: 'c', text: 'A planilha junta as três sozinha.', porque: 'Ela compara o que está escrito, e as três são diferentes para ela.' },
        { id: 'd', text: 'As linhas com grafia errada somem.', porque: 'Elas continuam lá, cada uma no seu grupo.' },
      ]},
      explanation: 'Nada estoura: a tabela sai com grupos a mais, cada um com duas ou três pessoas, e uma média para cada pedaço da mesma unidade.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 4 — Números, impossíveis e ausências (requisito 4)
     ────────────────────────────────────────────────────────────────────── */
  'm4-teoria': [
    {
      id: 'ES13-M4-Q1', type: 'multiple_choice',
      prompt: 'Uma célula da distância mostra "3,75 km". O que a MÉDIA faz com ela?',
      data: { options: [
        { id: 'a', text: 'Pula a célula, sem avisar.', correct: true },
        { id: 'b', text: 'Lê 3,75 e ignora o km.', porque: 'Com letra junto, a célula é texto inteira.' },
        { id: 'c', text: 'Mostra um erro na célula da média.', porque: 'Não mostra erro: a média sai plausível, sobre menos gente.' },
        { id: 'd', text: 'Conta a célula como zero.', porque: 'Texto não vira zero na MÉDIA; ele é deixado de fora.' },
      ]},
      explanation: 'Texto encosta à esquerda e as funções o pulam. A conta sai sobre menos gente do que a base tem, e nada na tela avisa.',
    },
    {
      id: 'ES13-M4-Q2', type: 'multiple_choice',
      prompt: 'Selecionando a coluna da distância, a régua do Excel mostra Contagem 57, e a Média leva só 52 números. O que isso diz?',
      data: { options: [
        { id: 'a', text: 'Há cinco números guardados como texto.', correct: true },
        { id: 'b', text: 'Há cinco linhas repetidas na coluna.', porque: 'Repetição não muda a diferença entre contagem e números.' },
        { id: 'c', text: 'Há cinco células vazias na coluna.', porque: 'Célula vazia não entra na Contagem.' },
        { id: 'd', text: 'A régua do Excel errou a conta.', porque: 'A régua acertou: ela conta o que está preenchido, e a média só o que é número.' },
      ]},
      explanation: 'A Contagem conta toda célula preenchida; a Média e a Soma só os números. A diferença é a quantidade de texto com cara de número.',
    },
    {
      id: 'ES13-M4-Q3', type: 'multiple_choice',
      prompt: 'Por que a Isabela a "1.250 km" pode ser corrigida para 1,25?',
      data: { options: [
        { id: 'a', text: 'Há evidência: ela vem a pé.', correct: true },
        { id: 'b', text: 'Todo valor alto deve ser dividido por mil.', porque: 'Dividir sem evidência é inventar outro número.' },
        { id: 'c', text: 'Porque a planilha não aceita esse número.', porque: 'Aceita, e é isso que o torna perigoso: ele entra nas contas.' },
        { id: 'd', text: 'Porque ela é da mesma unidade que outros.', porque: 'A unidade não diz nada sobre a distância de alguém.' },
      ]},
      explanation: 'Ela vem a pé, e a mesma coluna tem outros números com ponto no lugar da vírgula. Correção pede evidência do valor certo — e aqui há.',
    },
    {
      id: 'ES13-M4-Q4', type: 'multiple_choice',
      prompt: 'A Ana Clara aparece com 41 anos. Pode ser 11 ou 14. O que se faz?',
      data: { options: [
        { id: 'a', text: 'A célula fica vazia, e a linha fica.', correct: true },
        { id: 'b', text: 'Troca para 14, que é o mais provável.', porque: 'Provável não é evidência: seria inventar um dado com cara de dado.' },
        { id: 'c', text: 'Apaga a linha inteira dela.', porque: 'A presença dela vale, e a base perderia uma pessoa.' },
        { id: 'd', text: 'Deixa o 41, porque foi o que chegou.', porque: 'Um impossível na base estraga a média da idade sem avisar.' },
      ]},
      explanation: 'Sem evidência de qual é o certo, o valor vira ausência. A linha fica porque as outras colunas dela valem.',
    },
    {
      id: 'ES13-M4-Q5', type: 'multiple_choice',
      prompt: 'Quatro famílias não responderam ao questionário. Por que não excluir essas linhas?',
      data: { options: [
        { id: 'a', text: 'A base cairia para 57, abaixo de 60.', correct: true },
        { id: 'b', text: 'Porque a planilha não deixa excluir linhas.', porque: 'Deixa; o problema é o que se perde.' },
        { id: 'c', text: 'Porque eles são da mesma unidade.', porque: 'São de unidades diferentes, e isso não muda a decisão.' },
        { id: 'd', text: 'Porque a distância deles é zero.', porque: 'Ninguém sabe a distância deles: zero seria inventar.' },
      ]},
      explanation: 'Excluir derruba a base abaixo do requisito e joga fora quatro presenças verdadeiras. A ausência é de duas colunas, e não da pessoa.',
    },
    {
      id: 'ES13-M4-Q6', type: 'true_false',
      prompt: 'Preencher a distância que falta com a média da coluna deixa a análise mais confiável.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Deixa menos: são quatro distâncias inventadas, todas iguais, que encolhem o desvio.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Quatro valores iguais que ninguém mediu fazem a nuvem parecer mais certinha do que é, e a reta mais confiante do que o dado.',
    },
    {
      id: 'ES13-M4-Q7', type: 'multiple_choice',
      prompt: 'Qual destas é uma decisão bem escrita no diário de limpeza?',
      data: { options: [
        { id: 'a', text: 'Tirei o " km" da distância, para a média ler o número.', correct: true },
        { id: 'b', text: 'Arrumei a coluna da distância, que estava toda errada.', porque: 'Não diz o que mudou nem por quê: ninguém refaz o caminho.' },
        { id: 'c', text: 'A distância estava com problema em várias células.', porque: 'Descreve o problema e não a decisão.' },
        { id: 'd', text: 'Fiz o que a lição mandou fazer na coluna da distância.', porque: 'Quem ler a base no ano que vem não tem a lição na frente.' },
      ]},
      explanation: 'Uma decisão tem duas metades: o que se fez e por quê. É o que deixa outra pessoa entender a diferença entre a bruta e a tratada.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 5 — As medidas (requisito 5.1)
     ────────────────────────────────────────────────────────────────────── */
  'm5-teoria': [
    {
      id: 'ES13-M5-Q1', type: 'multiple_choice',
      prompt: 'Quais são as variáveis principais da pergunta sobre a presença?',
      data: { options: [
        { id: 'a', text: 'A presença e a distância.', correct: true },
        { id: 'b', text: 'Todas as seis colunas da base.', porque: 'Medir tudo faz um relatório que ninguém lê; principais são as da pergunta.' },
        { id: 'c', text: 'O nome e a unidade.', porque: 'Nome não se mede, e a unidade é um grupo, e não uma medida.' },
        { id: 'd', text: 'A idade e a unidade.', porque: 'Nenhuma das duas aparece na pergunta.' },
      ]},
      explanation: 'A presença é o que se quer explicar, e a distância é a suspeita. São elas que recebem média, mediana e desvio.',
    },
    {
      id: 'ES13-M5-Q2', type: 'multiple_choice',
      prompt: 'A mediana da presença dá 16 na tratada e 16 na bruta. O que isso mostra?',
      data: { options: [
        { id: 'a', text: 'Conferir só o número não basta.', correct: true },
        { id: 'b', text: 'Que a limpeza não mudou nada.', porque: 'Mudou a distância e a idade; a presença só tinha a linha repetida.' },
        { id: 'c', text: 'Que tanto faz qual aba a fórmula lê.', porque: 'A média da distância muda de 6 para perto de 30: faz toda diferença.' },
        { id: 'd', text: 'Que a mediana está errada nas duas.', porque: 'Está certa nas duas, e é por isso que engana.' },
      ]},
      explanation: 'Uma conta sobre a base suja pode dar o mesmo número por acaso. Por isso se confere também que a fórmula lê a tratada.',
    },
    {
      id: 'ES13-M5-Q3', type: 'multiple_choice',
      prompt: 'Por que o desvio padrão aqui é DESVPADP, com P?',
      data: { options: [
        { id: 'a', text: 'A base é o clube inteiro, e não uma amostra.', correct: true },
        { id: 'b', text: 'Porque P quer dizer presença.', porque: 'P quer dizer população: a base inteira, e não um pedaço dela.' },
        { id: 'c', text: 'Porque DESVPAD não existe nesta planilha.', porque: 'Existe; a escolha é pelo que a base representa.' },
        { id: 'd', text: 'Porque dá um número maior.', porque: 'Dá um pouco menor, e não é por isso que se escolhe.' },
      ]},
      explanation: 'A chamada tem todos os sessenta e um membros. Quando a base é a população inteira, o desvio é o de população.',
    },
    {
      id: 'ES13-M5-Q4', type: 'multiple_choice',
      prompt: 'A distância média é 6,43 km e a mediana é 5 km. O que explica a diferença?',
      data: { options: [
        { id: 'a', text: 'Uns poucos moram muito longe e puxam a média.', correct: true },
        { id: 'b', text: 'A média está calculada errado na aba Cálculos.', porque: 'A conta está certa; ela só descreve mal quem está no meio.' },
        { id: 'c', text: 'A mediana pulou quem mora longe do clube.', porque: 'A mediana olha todos; ela só não se mexe com os extremos.' },
        { id: 'd', text: 'Metade do clube mora a exatamente 6,43 km.', porque: 'Metade mora até 5 km: é o que a mediana diz.' },
      ]},
      explanation: 'Quando os valores se espalham de um lado só, a média anda para o lado deles e a mediana fica com quem está no meio.',
    },
    {
      id: 'ES13-M5-Q5', type: 'true_false',
      prompt: 'Na presença, a média 15,39 e a mediana 16 estão perto, e qualquer uma descreve bem.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Estão perto: quando as duas quase coincidem, qualquer uma serve.' },
      ]},
      explanation: 'É comparando as duas que se sabe qual usar: perto, tanto faz; longe, a mediana descreve melhor quem está no meio.',
    },
    {
      id: 'ES13-M5-Q6', type: 'multiple_choice',
      prompt: 'Como uma fórmula na aba Cálculos lê a coluna da presença da aba Tratada?',
      data: { options: [
        { id: 'a', text: 'Escrevendo Tratada!F2:F62 dentro dela.', correct: true },
        { id: 'b', text: 'Copiando a coluna para a aba Cálculos.', porque: 'A cópia não acompanha quando a tratada muda.' },
        { id: 'c', text: 'Escrevendo só F2:F62.', porque: 'Sem o nome da aba, a fórmula lê a própria aba Cálculos.' },
        { id: 'd', text: 'Abrindo as duas abas ao mesmo tempo.', porque: 'A planilha mostra uma aba de cada vez; a fórmula é que diz onde ler.' },
      ]},
      explanation: 'O nome da aba e uma exclamação antes do intervalo dizem à fórmula de onde ler.',
    },
    {
      id: 'ES13-M5-Q7', type: 'multiple_choice',
      prompt: 'A média da presença está escrita como =SOMA(Tratada!F2:F62)/61. Qual é o problema?',
      data: { options: [
        { id: 'a', text: 'O 61 não muda quando a base muda.', correct: true },
        { id: 'b', text: 'SOMA não funciona em outra aba.', porque: 'Funciona: o problema é o número digitado.' },
        { id: 'c', text: 'O resultado está errado hoje.', porque: 'Está certo hoje, e é por isso que ninguém desconfia.' },
        { id: 'd', text: 'Dividir não é permitido em fórmula.', porque: 'É permitido; o perigo é o divisor digitado.' },
      ]},
      explanation: 'É o número digitado dentro da fórmula da CC-ES003: certo hoje, errado no dia em que alguém entrar ou sair do clube.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 6 — Comparando grupos (requisito 5.2)
     ────────────────────────────────────────────────────────────────────── */
  'm6-teoria': [
    {
      id: 'ES13-M6-Q1', type: 'multiple_choice',
      prompt: 'Sem MÉDIASE, como se acha a média de presença de quem vem de ônibus?',
      data: { options: [
        { id: 'a', text: 'SOMASE do grupo dividido pelo CONT.SE dele.', correct: true },
        { id: 'b', text: 'MÉDIA da coluna inteira de presença.', porque: 'Essa é a média do clube todo, e não do grupo.' },
        { id: 'c', text: 'CONT.SE do grupo dividido por 61.', porque: 'Isso é a parte do clube que vem de ônibus, e não a presença dele.' },
        { id: 'd', text: 'SOMA da presença dividida por 20.', porque: 'Vinte é o número de reuniões, e não de pessoas do grupo.' },
      ]},
      explanation: 'CONT.SE conta quantos há no grupo; SOMASE soma a presença só deles. A média é a soma pela contagem.',
    },
    {
      id: 'ES13-M6-Q2', type: 'multiple_choice',
      prompt: 'Carona e ônibus moram a 8,37 e 9,05 km. A presença é 17,37 e 11,35. O que isso sugere?',
      data: { options: [
        { id: 'a', text: 'O jeito de chegar pesa mais que a distância.', correct: true },
        { id: 'b', text: 'Quem vem de carona mora mais perto.', porque: 'Mora quase igual: é por isso que a comparação é forte.' },
        { id: 'c', text: 'Ônibus e carona faltam o mesmo tanto.', porque: 'São seis reuniões de diferença no semestre.' },
        { id: 'd', text: 'A distância explica toda a falta.', porque: 'Na mesma distância, a presença muda muito com o transporte.' },
      ]},
      explanation: 'Se fosse só a distância, os dois grupos faltariam parecido. O que os separa é o jeito de chegar.',
    },
    {
      id: 'ES13-M6-Q3', type: 'multiple_choice',
      prompt: 'O grupo de bicicleta tem a segunda maior presença. O que ele permite concluir?',
      data: { options: [
        { id: 'a', text: 'Pouco: são só quatro pessoas.', correct: true },
        { id: 'b', text: 'Que bicicleta faz vir mais.', porque: 'Com quatro pessoas, uma que falte muito muda a média inteira.' },
        { id: 'c', text: 'Que o clube deve comprar bicicletas.', porque: 'Decisão grande demais para quatro pessoas de dado.' },
        { id: 'd', text: 'Que bicicleta é melhor que carona.', porque: 'A diferença é pequena e o grupo é minúsculo.' },
      ]},
      explanation: 'Média de grupo pequeno se mostra, e não se usa para decidir. Antes de comparar médias, olhe o tamanho de cada grupo.',
    },
    {
      id: 'ES13-M6-Q4', type: 'multiple_choice',
      prompt: 'Os quatro grupos somam 57 pessoas, e o clube tem 61. Onde estão as outras quatro?',
      data: { options: [
        { id: 'a', text: 'Não responderam ao questionário.', correct: true },
        { id: 'b', text: 'Foram apagadas na limpeza.', porque: 'Elas continuam na base, com o transporte em branco.' },
        { id: 'c', text: 'Estão no grupo de quem vem a pé.', porque: 'Sem resposta, elas não estão em grupo nenhum.' },
        { id: 'd', text: 'A conta de grupos está errada.', porque: 'Está certa: quem não tem grupo não entra em contagem de grupo.' },
      ]},
      explanation: 'Quem não tem o jeito de chegar escrito não entra na soma nem na contagem de grupo nenhum, e a média de cada grupo continua certa.',
    },
    {
      id: 'ES13-M6-Q5', type: 'true_false',
      prompt: 'A primeira fórmula do grupo precisa de cifrão no intervalo antes de ser arrastada.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Sem o cifrão, o intervalo desce junto e a última linha conta só parte do clube.' },
      ]},
      explanation: 'O intervalo da base é o mesmo para todos os grupos; o que muda é o grupo de cada linha. É a referência absoluta da CC-ES003.',
    },
    {
      id: 'ES13-M6-Q6', type: 'multiple_choice',
      prompt: 'O requisito pede comparar no mínimo dois grupos. Quais servem melhor à pergunta?',
      data: { options: [
        { id: 'a', text: 'Carona e ônibus, que moram longe parecido.', correct: true },
        { id: 'b', text: 'A pé e bicicleta, os que vêm mais.', porque: 'Os dois moram perto: a comparação não separa distância de transporte.' },
        { id: 'c', text: 'Falcão e Onça, a maior e a menor unidade.', porque: 'Unidade não é a suspeita da pergunta.' },
        { id: 'd', text: 'Os mais novos e os mais velhos.', porque: 'Idade não está na pergunta da proposta.' },
      ]},
      explanation: 'Comparar quem mora à mesma distância com transportes diferentes é o que separa as duas explicações.',
    },
    {
      id: 'ES13-M6-Q7', type: 'multiple_choice',
      prompt: 'Uma comparação diz "quem vem de ônibus falta mais". O que falta nela?',
      data: { options: [
        { id: 'a', text: 'Os números dos dois grupos.', correct: true },
        { id: 'b', text: 'O nome de quem vem de ônibus.', porque: 'Nomes não entram numa comparação de grupos.' },
        { id: 'c', text: 'Um gráfico de linha.', porque: 'Linha é para tempo; comparação é colunas.' },
        { id: 'd', text: 'A fórmula usada na planilha.', porque: 'A fórmula fica na planilha; a comparação diz o resultado.' },
      ]},
      explanation: '"Falta mais" é uma impressão. "11,35 contra 17,37 reuniões" é um resultado que outra pessoa pode conferir.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 7 — A relação (requisito 5.3)
     ────────────────────────────────────────────────────────────────────── */
  'm7-teoria': [
    {
      id: 'ES13-M7-Q1', type: 'multiple_choice',
      prompt: 'Na dispersão da distância com a presença, o que é cada ponto?',
      data: { options: [
        { id: 'a', text: 'Um desbravador.', correct: true },
        { id: 'b', text: 'Uma reunião do semestre.', porque: 'As reuniões estão somadas na presença de cada um.' },
        { id: 'c', text: 'Uma unidade do clube.', porque: 'Cada unidade tem várias pessoas, e cada pessoa é um ponto.' },
        { id: 'd', text: 'Um jeito de chegar.', porque: 'O jeito de chegar é um grupo, e a dispersão não agrupa.' },
      ]},
      explanation: 'Cada linha da tratada vira um ponto: a distância dela num eixo, a presença no outro.',
    },
    {
      id: 'ES13-M7-Q2', type: 'multiple_choice',
      prompt: 'A tratada tem 61 pessoas, e a dispersão mostra 57 pontos. Por quê?',
      data: { options: [
        { id: 'a', text: 'Quatro não têm distância.', correct: true },
        { id: 'b', text: 'Quatro pontos ficaram em cima de outros.', porque: 'Pode haver sobreposição, mas não é isso que tira quatro da conta.' },
        { id: 'c', text: 'A seleção esqueceu as últimas linhas.', porque: 'Com a seleção inteira, os 57 são todos os que têm os dois números.' },
        { id: 'd', text: 'A dispersão pula quem falta muito.', porque: 'Ela mostra todo mundo que tem os dois números.' },
      ]},
      explanation: 'Ponto precisa dos dois números. Quem não respondeu ao questionário fica de fora sozinho, sem ninguém precisar apagar nada.',
    },
    {
      id: 'ES13-M7-Q3', type: 'multiple_choice',
      prompt: 'A correlação entre distância e presença é -0,70. O que ela diz?',
      data: { options: [
        { id: 'a', text: 'Quem mora mais longe tende a ir a menos reuniões.', correct: true },
        { id: 'b', text: 'Setenta por cento do clube falta às reuniões.', porque: 'O r não é porcentagem de gente: é a força da relação.' },
        { id: 'c', text: 'A distância é a causa de alguém faltar.', porque: 'Correlação mostra que andam juntas, e não quem causa quem.' },
        { id: 'd', text: 'Quem mora longe nunca vem às reuniões de sábado.', porque: 'Tende a vir menos; há quem more longe e venha sempre.' },
      ]},
      explanation: 'Negativa quer dizer que uma sobe enquanto a outra desce; forte quer dizer que a nuvem fica perto da reta.',
    },
    {
      id: 'ES13-M7-Q4', type: 'true_false',
      prompt: 'Uma correlação forte entre distância e presença prova que a distância causa a falta.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Não prova: quem mora longe também pega ônibus, e o ônibus pode ser a causa.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'É a correlação espúria da CC-ES010: uma terceira coisa — o transporte — anda junto com a distância.',
    },
    {
      id: 'ES13-M7-Q5', type: 'multiple_choice',
      prompt: 'Se a causa da falta for o ônibus de sábado, e não a distância, o que muda?',
      data: { options: [
        { id: 'a', text: 'A recomendação: carona, e não mudar o clube.', correct: true },
        { id: 'b', text: 'Nada: a recomendação é a mesma.', porque: 'Muda inteira: distância não se conserta, transporte sim.' },
        { id: 'c', text: 'Só o gráfico, que precisa ser outro.', porque: 'O gráfico continua certo; o que muda é a leitura dele.' },
        { id: 'd', text: 'A base, que precisa ser coletada de novo.', porque: 'A base já mostra a pista, na comparação de grupos.' },
      ]},
      explanation: 'Se a causa fosse a distância, a única saída seria mudar o clube de lugar. Se for o transporte, uma lista de carona resolve.',
    },
    {
      id: 'ES13-M7-Q6', type: 'multiple_choice',
      prompt: 'Onde se marca a linha de tendência e a equação dela?',
      data: { options: [
        { id: 'a', text: 'Em Elementos do Gráfico.', correct: true },
        { id: 'b', text: 'Na caixa de inserir o gráfico.', porque: 'A linha é elemento de um gráfico que já existe.' },
        { id: 'c', text: 'Numa fórmula na aba Cálculos.', porque: 'A fórmula dá o r; a reta é desenho do gráfico.' },
        { id: 'd', text: 'No título do gráfico.', porque: 'O título é a pergunta, e não a reta.' },
      ]},
      explanation: 'São duas caixas, como na CC-ES010: dá para ver a reta e nunca ler a equação dela.',
    },
    {
      id: 'ES13-M7-Q7', type: 'multiple_choice',
      prompt: 'Que outra coisa anda junto com a distância nesta base?',
      data: { options: [
        { id: 'a', text: 'O jeito de chegar.', correct: true },
        { id: 'b', text: 'O nome do desbravador.', porque: 'Nome não anda junto com distância nenhuma.' },
        { id: 'c', text: 'O número de reuniões do semestre.', porque: 'É o mesmo para todos: vinte.' },
        { id: 'd', text: 'A data de obtenção da base.', porque: 'É uma só para a base inteira.' },
      ]},
      explanation: 'Quem mora longe tende a vir de ônibus ou de carona; quem mora perto vem a pé. É por isso que a distância sozinha não conta a história.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 8 — O painel (requisito 6)
     ────────────────────────────────────────────────────────────────────── */
  'm8-teoria': [
    {
      id: 'ES13-M8-Q1', type: 'multiple_choice',
      prompt: 'Qual destes títulos declara a pergunta do gráfico?',
      data: { options: [
        { id: 'a', text: 'Alguma unidade falta mais que as outras?', correct: true },
        { id: 'b', text: 'Presença por unidade no primeiro semestre', porque: 'É o assunto do gráfico, e não o que ele responde.' },
        { id: 'c', text: 'Gráfico 3 do painel da presença', porque: 'Diz a posição, e nada sobre a pergunta.' },
        { id: 'd', text: 'Unidades do Clube Pioneiros em 2026', porque: 'Diz de quem é o dado, e não o que se quer saber.' },
      ]},
      explanation: 'Declarada quer dizer escrita, e o lugar dela é o título. Quem olha sabe o que procurar no gráfico.',
    },
    {
      id: 'ES13-M8-Q2', type: 'multiple_choice',
      prompt: 'Por que não usar gráfico de linha nesta base?',
      data: { options: [
        { id: 'a', text: 'Porque ela não tem tempo.', correct: true },
        { id: 'b', text: 'Porque linha não aceita números.', porque: 'Aceita; o que ela afirma é que um ponto virou o outro.' },
        { id: 'c', text: 'Porque a planilha não desenha linha.', porque: 'Desenha, e é por isso que o erro é fácil.' },
        { id: 'd', text: 'Porque linha só serve para pizza.', porque: 'Linha e pizza são tipos diferentes.' },
      ]},
      explanation: 'Linha mostra evolução. Ligar o Falcão ao Tucano com um traço afirma que um virou o outro.',
    },
    {
      id: 'ES13-M8-Q3', type: 'multiple_choice',
      prompt: 'Uma pizza com a média de presença de cada unidade. Qual é o problema?',
      data: { options: [
        { id: 'a', text: 'Médias não somam um todo.', correct: true },
        { id: 'b', text: 'Pizza não aceita seis fatias.', porque: 'Aceita; o problema é o que as fatias somam.' },
        { id: 'c', text: 'As cores das fatias confundem.', porque: 'As cores podem ser boas; as fatias é que não fazem sentido.' },
        { id: 'd', text: 'Falta título na pizza.', porque: 'Com título ou sem, as fatias são de um todo que não existe.' },
      ]},
      explanation: 'Pizza mostra de que o todo é feito. A soma das médias não é nada, e as fatias saem plausíveis do mesmo jeito.',
    },
    {
      id: 'ES13-M8-Q4', type: 'multiple_choice',
      prompt: 'Qual pizza responde a uma pergunta nesta base?',
      data: { options: [
        { id: 'a', text: 'Quantos moram em cada faixa de distância.', correct: true },
        { id: 'b', text: 'A média de presença de cada grupo.', porque: 'Média não soma: as fatias seriam de um todo que não existe.' },
        { id: 'c', text: 'A distância média de cada unidade.', porque: 'Também é média, e média não soma.' },
        { id: 'd', text: 'A correlação de cada unidade.', porque: 'Correlação não é parte de um todo.' },
      ]},
      explanation: 'Contagem soma o clube inteiro: as fatias são partes de um todo que existe.',
    },
    {
      id: 'ES13-M8-Q5', type: 'true_false',
      prompt: 'Dois gráficos que respondem à mesma pergunta contam como dois dos quatro do painel.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Contam como gráficos, mas não como perguntas: o requisito pede cada um respondendo a uma.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Dois gráficos para a mesma pergunta ocupam lugar e não dizem nada novo.',
    },
    {
      id: 'ES13-M8-Q6', type: 'multiple_choice',
      prompt: 'Para comparar a presença dos quatro jeitos de chegar, qual tipo serve?',
      data: { options: [
        { id: 'a', text: 'Colunas.', correct: true },
        { id: 'b', text: 'Linha.', porque: 'Linha é evolução no tempo, e os jeitos de chegar não são tempo.' },
        { id: 'c', text: 'Pizza.', porque: 'Médias de presença não somam um todo.' },
        { id: 'd', text: 'Dispersão.', porque: 'Dispersão relaciona duas medidas; o jeito de chegar é categoria.' },
      ]},
      explanation: 'Colunas comparam: qual é maior que qual. Servem a qualquer conjunto de categorias.',
    },
    {
      id: 'ES13-M8-Q7', type: 'multiple_choice',
      prompt: 'Em que ordem se monta um gráfico do painel?',
      data: { options: [
        { id: 'a', text: 'A pergunta primeiro, depois o tipo.', correct: true },
        { id: 'b', text: 'O tipo mais bonito primeiro.', porque: 'Bonito não responde: o tipo sai da pergunta.' },
        { id: 'c', text: 'O título por último, se sobrar tempo.', porque: 'O título é a pergunta, e ela vem antes.' },
        { id: 'd', text: 'Os dados primeiro, depois a pergunta.', porque: 'É o caminho de quem acha um desenho e inventa a pergunta dele.' },
      ]},
      explanation: 'O tipo sai da pergunta, e não o contrário. Escolher pelo desenho dá um gráfico que não sabe o que responde.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 9 — A conclusão (requisito 7)
     ────────────────────────────────────────────────────────────────────── */
  'm9-teoria': [
    {
      id: 'ES13-M9-Q1', type: 'multiple_choice',
      prompt: 'Quais são as três partes da conclusão que o requisito pede?',
      data: { options: [
        { id: 'a', text: 'O que mostram, o que não permitem e a recomendação.', correct: true },
        { id: 'b', text: 'Introdução, desenvolvimento e conclusão.', porque: 'Essa é a forma de uma redação, e não o que o requisito pede.' },
        { id: 'c', text: 'A base, a limpeza e os gráficos.', porque: 'Isso é o caminho, que já está no diário e no painel.' },
        { id: 'd', text: 'A pergunta, a resposta e o agradecimento.', porque: 'Falta o que os dados não permitem e a recomendação.' },
      ]},
      explanation: 'O que os dados mostram, o que eles não permitem afirmar, e uma recomendação prática ao clube — em no máximo duas páginas.',
    },
    {
      id: 'ES13-M9-Q2', type: 'multiple_choice',
      prompt: 'O rascunho tem três páginas, e uma delas reconta a limpeza. O que fazer?',
      data: { options: [
        { id: 'a', text: 'Tirar a limpeza: ela está no diário.', correct: true },
        { id: 'b', text: 'Diminuir o tamanho da letra.', porque: 'A página cabe e o texto continua contando o que não decide nada.' },
        { id: 'c', text: 'Tirar o que os dados não permitem.', porque: 'É a parte que mais protege quem decide.' },
        { id: 'd', text: 'Entregar assim: três é quase duas.', porque: 'Duas páginas é o limite do requisito.' },
      ]},
      explanation: 'O diário vai junto no relatório. Na conclusão fica o que muda a decisão.',
    },
    {
      id: 'ES13-M9-Q3', type: 'multiple_choice',
      prompt: 'Qual frase diz o que os dados mostram, como resultado?',
      data: { options: [
        { id: 'a', text: 'Quem vem de ônibus vai a 11,35 de 20 reuniões.', correct: true },
        { id: 'b', text: 'Quem mora longe parece faltar mais.', porque: 'É uma impressão sem número para conferir.' },
        { id: 'c', text: 'Os dados mostram muita coisa interessante.', porque: 'Não diz nenhuma das coisas.' },
        { id: 'd', text: 'A presença é um problema do clube.', porque: 'É um julgamento, e não o que os dados mostram.' },
      ]},
      explanation: 'Resultado vem com o número, que outra pessoa pode conferir no painel.',
    },
    {
      id: 'ES13-M9-Q4', type: 'multiple_choice',
      prompt: 'Qual destes a base da presença não permite afirmar?',
      data: { options: [
        { id: 'a', text: 'Por que quem saiu do clube saiu.', correct: true },
        { id: 'b', text: 'Que quem mora longe tende a faltar mais.', porque: 'Isso ela mostra, com r de -0,70.' },
        { id: 'c', text: 'Que carona e ônibus moram longe parecido.', porque: 'Isso ela mostra, na aba de grupos.' },
        { id: 'd', text: 'Quantos vêm de ônibus.', porque: 'Isso ela conta: vinte.' },
      ]},
      explanation: 'Quem já saiu não está na chamada — e talvez tenha saído justamente por morar longe. A base não tem como dizer.',
    },
    {
      id: 'ES13-M9-Q5', type: 'true_false',
      prompt: 'Escrever o que os dados não permitem afirmar deixa a conclusão mais fraca.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Deixa mais forte: quem decide passa a confiar no que você afirma.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Escrever o limite impede quem decide de pedir à análise mais do que ela pode dar — e faz confiar no resto.',
    },
    {
      id: 'ES13-M9-Q6', type: 'multiple_choice',
      prompt: 'Qual destas é uma recomendação prática?',
      data: { options: [
        { id: 'a', text: 'Que a diretoria monte uma lista de carona.', correct: true },
        { id: 'b', text: 'O clube deveria melhorar a presença.', porque: 'Não tem dono: ninguém sabe quem faz, e ninguém faz.' },
        { id: 'c', text: 'Todos deveriam se esforçar mais.', porque: 'Não diz quem nem o quê.' },
        { id: 'd', text: 'É preciso estudar mais o assunto.', porque: 'Adia a decisão sem dizer o que fazer.' },
      ]},
      explanation: 'Recomendação prática diz quem faz o quê — e dá para conferir depois se foi feito.',
    },
    {
      id: 'ES13-M9-Q7', type: 'multiple_choice',
      prompt: 'Quantas palavras cabem, mais ou menos, em duas páginas de conclusão?',
      data: { options: [
        { id: 'a', text: 'Perto de novecentas.', correct: true },
        { id: 'b', text: 'Perto de duzentas.', porque: 'Isso é menos de meia página.' },
        { id: 'c', text: 'Perto de três mil.', porque: 'Isso dá umas sete páginas.' },
        { id: 'd', text: 'Não importa: o limite é de páginas.', porque: 'Importa: é contando palavras que se sabe se cabe.' },
      ]},
      explanation: 'Uma página tem perto de 450 palavras com títulos e espaço entre as partes. Conte antes de entregar.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 10 — A apresentação (requisito 8)
     ────────────────────────────────────────────────────────────────────── */
  'm10-teoria': [
    {
      id: 'ES13-M10-Q1', type: 'multiple_choice',
      prompt: 'Qual destes é público real do clube para o requisito 8?',
      data: { options: [
        { id: 'a', text: 'A diretoria.', correct: true },
        { id: 'b', text: 'A família, em casa.', porque: 'Ótima para ensaiar, mas não decide nada no clube.' },
        { id: 'c', text: 'A turma da escola.', porque: 'Não é do clube, e não pode decidir a carona.' },
        { id: 'd', text: 'Um grupo de mensagens.', porque: 'Mandar o relatório não é apresentar.' },
      ]},
      explanation: 'Diretoria, unidade ou conselho: gente do clube que pode fazer alguma coisa com a recomendação.',
    },
    {
      id: 'ES13-M10-Q2', type: 'multiple_choice',
      prompt: 'O roteiro gasta seis minutos na limpeza. O que está errado?',
      data: { options: [
        { id: 'a', text: 'Falta tempo para o que quem decide precisa.', correct: true },
        { id: 'b', text: 'A limpeza não deveria aparecer.', porque: 'Aparece, num minuto; o diário vai junto.' },
        { id: 'c', text: 'Seis minutos é pouco para a limpeza.', porque: 'É muito: sobra pouco para a recomendação.' },
        { id: 'd', text: 'A limpeza devia vir no fim.', porque: 'A ordem não é o problema; o tempo é.' },
      ]},
      explanation: 'Quem decide precisa da pergunta, do painel, da recomendação e de tempo para perguntar.',
    },
    {
      id: 'ES13-M10-Q3', type: 'multiple_choice',
      prompt: 'Por que reservar um minuto para perguntas de quem decide?',
      data: { options: [
        { id: 'a', text: 'A decisão sai da conversa.', correct: true },
        { id: 'b', text: 'Para completar os dez minutos.', porque: 'Não é enchimento: é onde a recomendação vira decisão.' },
        { id: 'c', text: 'Porque o requisito pede perguntas.', porque: 'O requisito pede registrar a decisão, e ela nasce ali.' },
        { id: 'd', text: 'Para descansar entre as partes.', porque: 'É a parte mais importante, e não um intervalo.' },
      ]},
      explanation: 'Quem decide quase sempre pergunta antes de decidir. Sem tempo para isso, a decisão fica para depois.',
    },
    {
      id: 'ES13-M10-Q4', type: 'multiple_choice',
      prompt: 'A diretoria disse "vamos pensar até a próxima reunião". O que se registra?',
      data: { options: [
        { id: 'a', text: 'Exatamente isso, com a data e quem estava.', correct: true },
        { id: 'b', text: 'Nada, porque não houve decisão.', porque: 'O requisito aceita a reação, e essa é uma reação.' },
        { id: 'c', text: 'Que aprovaram, porque vão aprovar.', porque: 'Registro é do que aconteceu, e não do que se espera.' },
        { id: 'd', text: 'Só a data da próxima reunião.', porque: 'Falta o que disseram e quem estava.' },
      ]},
      explanation: '"Vão pensar" é registro, e diz que a recomendação ainda não virou decisão.',
    },
    {
      id: 'ES13-M10-Q5', type: 'true_false',
      prompt: 'O registro deve ser escrito no mesmo dia da apresentação.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Uma semana depois, a lembrança já virou o que você queria que tivessem dito.' },
      ]},
      explanation: 'No mesmo dia, com as palavras de quem decidiu.',
    },
    {
      id: 'ES13-M10-Q6', type: 'multiple_choice',
      prompt: 'O que a plataforma confere da apresentação?',
      data: { options: [
        { id: 'a', text: 'O roteiro e o registro que você escreve.', correct: true },
        { id: 'b', text: 'A fala, por uma gravação da apresentação.', porque: 'Nada é gravado: a apresentação acontece fora do aplicativo.' },
        { id: 'c', text: 'Se a diretoria aprovou a recomendação.', porque: 'Aprovar ou não é da diretoria; a plataforma guarda o registro.' },
        { id: 'd', text: 'O tempo, com um cronômetro na tela.', porque: 'O tempo é planejado no roteiro, e não cronometrado.' },
      ]},
      explanation: 'A apresentação acontece diante do clube. A plataforma prepara o roteiro e guarda o registro do que aconteceu.',
    },
    {
      id: 'ES13-M10-Q7', type: 'multiple_choice',
      prompt: 'Uma reação negativa da diretoria entra no registro?',
      data: { options: [
        { id: 'a', text: 'Sim, como qualquer reação.', correct: true },
        { id: 'b', text: 'Não: só decisão favorável conta.', porque: 'O requisito pede a decisão ou a reação, qualquer que seja.' },
        { id: 'c', text: 'Só se ela for por escrito.', porque: 'Quem escreve o registro é você.' },
        { id: 'd', text: 'Só depois de apresentar de novo.', porque: 'A reação desta apresentação é a que se registra.' },
      ]},
      explanation: 'Uma recusa é resultado do projeto tanto quanto um sim — e diz o que a recomendação precisava ter.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 11 — A entrega (requisito 9)
     ────────────────────────────────────────────────────────────────────── */
  'm11-teoria': [
    {
      id: 'ES13-M11-Q1', type: 'multiple_choice',
      prompt: 'O que vai na pasta da entrega?',
      data: { options: [
        { id: 'a', text: 'A bruta, a tratada e o relatório.', correct: true },
        { id: 'b', text: 'Tudo o que foi feito no projeto.', porque: 'Rascunho e foto são seus: quem confere não deveria adivinhar qual vale.' },
        { id: 'c', text: 'Só o relatório final.', porque: 'O requisito pede as duas bases também.' },
        { id: 'd', text: 'Só a tratada, que é a limpa.', porque: 'A bruta também: é a prova do que chegou.' },
      ]},
      explanation: 'Três entregáveis, e só eles.',
    },
    {
      id: 'ES13-M11-Q2', type: 'multiple_choice',
      prompt: 'Há duas cópias da exportação com o mesmo nome. Como saber qual é a bruta?',
      data: { options: [
        { id: 'a', text: 'Pelo histórico de versões.', correct: true },
        { id: 'b', text: 'Pela que tem o nome mais curto.', porque: 'O nome não diz se alguém mexeu.' },
        { id: 'c', text: 'Pela mais nova.', porque: 'A mais nova pode ser justamente a mexida.' },
        { id: 'd', text: 'Tanto faz, se o nome é igual.', porque: 'Uma foi editada: já não é bruta.' },
      ]},
      explanation: 'O histórico diz quem escreveu cada versão, e quando. A bruta tem uma versão só, a da secretaria.',
    },
    {
      id: 'ES13-M11-Q3', type: 'multiple_choice',
      prompt: 'Com que papel se compartilha a pasta com quem examina?',
      data: { options: [
        { id: 'a', text: 'Leitor ou comentarista.', correct: true },
        { id: 'b', text: 'Editor, para corrigir se precisar.', porque: 'Editor pode mudar a bruta sem querer, e ela deixa de ser a prova.' },
        { id: 'c', text: 'Proprietário, para garantir acesso.', porque: 'A pasta é sua; o examinador só precisa ver.' },
        { id: 'd', text: 'Nenhum: basta mandar o link aberto.', porque: 'Link aberto é para qualquer pessoa, e a base tem nomes de crianças.' },
      ]},
      explanation: 'Quem examina confere, e não edita. Leitor basta; comentarista deixa apontar alguma coisa sem mudar nada.',
    },
    {
      id: 'ES13-M11-Q4', type: 'true_false',
      prompt: 'Compartilhar a pasta já dá acesso aos arquivos que estão dentro dela.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'A permissão da pasta alcança o que está dentro, como a CC-ES006 ensinou.' },
      ]},
      explanation: 'Não é preciso compartilhar arquivo por arquivo: a pasta leva o acesso para dentro.',
    },
    {
      id: 'ES13-M11-Q5', type: 'multiple_choice',
      prompt: 'Por que o acesso geral da pasta fica em Restrito?',
      data: { options: [
        { id: 'a', text: 'A base tem o nome de crianças do clube.', correct: true },
        { id: 'b', text: 'Porque o link aberto é mais lento.', porque: 'A velocidade é a mesma; o problema é quem entra.' },
        { id: 'c', text: 'Porque o examinador não usa link.', porque: 'Usa, e entra pelo nome dele na lista.' },
        { id: 'd', text: 'Porque Restrito deixa editar.', porque: 'Restrito só diz que entra quem está na lista.' },
      ]},
      explanation: '"Qualquer pessoa com o link" é qualquer pessoa — inclusive quem recebeu o link encaminhado.',
    },
    {
      id: 'ES13-M11-Q6', type: 'multiple_choice',
      prompt: 'O rascunho da conclusão ficou na pasta da entrega. Qual é o problema?',
      data: { options: [
        { id: 'a', text: 'Quem confere pode ler a versão errada.', correct: true },
        { id: 'b', text: 'Nenhum: mostra o esforço.', porque: 'O esforço está no relatório; o rascunho só confunde.' },
        { id: 'c', text: 'O rascunho ocupa espaço demais.', porque: 'O espaço é pouco; a confusão é o problema.' },
        { id: 'd', text: 'O rascunho apaga o relatório.', porque: 'Os dois convivem; quem lê é que não sabe qual vale.' },
      ]},
      explanation: 'Na entrega, cada arquivo é um entregável. Um a mais obriga quem confere a adivinhar.',
    },
    {
      id: 'ES13-M11-Q7', type: 'multiple_choice',
      prompt: 'O que a última alteração das duas cópias da bruta já sugere?',
      data: { options: [
        { id: 'a', text: 'Que uma foi mexida depois de chegar.', correct: true },
        { id: 'b', text: 'Que as duas são a mesma.', porque: 'Datas diferentes dizem que alguém salvou de novo.' },
        { id: 'c', text: 'Que a mais nova é a certa.', porque: 'A mais nova é justamente a que foi mexida.' },
        { id: 'd', text: 'Nada: data não diz nada.', porque: 'Ela dá a pista; o histórico confirma.' },
      ]},
      explanation: 'A cópia baixada e depois editada tem data de alteração mais nova. O histórico diz quem a editou.',
    },
  ],
};
