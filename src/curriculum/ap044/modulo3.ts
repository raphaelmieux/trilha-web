import type { Module } from '../../types';

/*
 * AP044 módulo 3 — o requisito 6: a agenda com vinte e cinco pessoas.
 *
 * O documento diz "montar um banco de dados", e é aí que quase toda execução
 * desanda: monta-se uma lista no editor de texto, com vinte e cinco nomes
 * digitados um embaixo do outro, e entrega-se isso.
 *
 * A diferença não é o programa usado — dá para fazer banco de dados numa
 * planilha. A diferença é a **estrutura**: campos declarados, um registro por
 * linha, o mesmo tipo de informação sempre na mesma coluna. É isso que permite
 * ordenar por nome, procurar por telefone e gerar um relatório sem redigitar
 * nada. Uma lista escrita à mão não permite nenhuma das três.
 *
 * ── E é o mesmo requisito da vereda CC-ES008 ─────────────────────────────
 * A vereda de Dados e Formulários pede a mesma agenda de vinte e cinco
 * pessoas. Quando ela for escrita, o laboratório é este — e é por isso que ele
 * não se chama "agenda da AP044": chama-se banco de dados, e recebe do
 * currículo o que cobrar.
 */

const conteudo_L1 = `
<h2 class="text-xl font-bold mb-3">Uma lista não é um banco de dados</h2>
<p class="mb-3">Escreva vinte e cinco nomes num caderno, com telefone ao lado.
Agora responda, sem reescrever nada: quem mora no bairro Centro? Quantos têm
e-mail cadastrado? Ponha todos em ordem alfabética.</p>
<p class="mb-3">No caderno, cada uma dessas perguntas custa recomeçar a lista.
Num <strong>banco de dados</strong>, as três são um clique. A diferença não é o
programa — é a <strong>estrutura</strong>.</p>

<h3 class="font-bold mt-4 mb-2">As duas palavras que sustentam tudo</h3>
<ul class="list-disc pl-5 mb-3 space-y-1">
<li><strong>Campo</strong> é o tipo de informação: nome, endereço, telefone,
e-mail. São quatro campos.</li>
<li><strong>Registro</strong> é uma pessoa inteira: os quatro campos
preenchidos para a Joana. Vinte e cinco pessoas são vinte e cinco registros.</li>
</ul>
<p class="mb-3">Se você imaginar uma tabela: cada <strong>coluna</strong> é um
campo e cada <strong>linha</strong> é um registro. A regra que faz tudo
funcionar é uma só — <strong>a mesma informação sempre na mesma coluna</strong>.</p>

<h3 class="font-bold mt-4 mb-2">O que quebra quando a regra é quebrada</h3>
<p class="mb-3">Se numa linha o telefone estiver na coluna do endereço, a
ordenação por telefone põe aquela pessoa no lugar errado, a busca não a
encontra e o relatório sai com o endereço no meio dos números. E nada disso dá
erro: o programa não sabe que aquilo é um telefone. Ele só sabe que está na
coluna do endereço.</p>
<p class="mb-3">É a mesma armadilha do "número guardado como texto" da planilha:
o computador obedece ao que está escrito, e não ao que se quis dizer.</p>

<h3 class="font-bold mt-4 mb-2">Por que declarar o tipo do campo importa</h3>
<p class="mb-3">Um campo pode ser texto, número, data ou e-mail. Dizer qual é
serve para duas coisas:</p>
<ul class="list-disc pl-5 mb-3 space-y-1">
<li><strong>Ordenar direito.</strong> Como texto, "10" vem antes de "9" —
porque o 1 vem antes do 9 na primeira letra. Como número, não.</li>
<li><strong>Recusar o que não serve.</strong> Um campo de e-mail declarado
recusa "joana" sem arroba, na hora de digitar — e não seis meses depois,
quando a mensagem voltar.</li>
</ul>

<div class="p-3 rounded-lg mt-4" style="background: rgba(59,130,246,.12)">
<p class="text-sm"><strong>A regra de ouro:</strong> um campo guarda uma coisa
só. "Rua das Flores, 120 — Centro — (61) 99999-0000" num campo só é um campo
mal feito: são três informações que nunca mais se separam.</p>
</div>
`;

export const modulo3: Module = {
  code: 'AP044.3',
  title: 'A agenda do clube',
  description: 'Campo, registro e tipo — e por que a mesma lista vira útil quando ganha estrutura.',
  lessons: [
    {
      code: 'AP044.3-L1',
      title: 'Campo, registro e tipo',
      type: 'theory',
      content: conteudo_L1,
      requirementCodes: ['AP044-6.1'],
      perguntas: 5,
      questions: [
        {
          id: 'AP044.3-L1-Q1', type: 'multiple_choice',
          prompt: 'Numa agenda com nome, endereço, telefone e e-mail de 25 pessoas, o que são os campos e o que são os registros?',
          data: { options: [
            { id: 'a', text: 'Os campos são os quatro tipos de informação; os registros são as 25 pessoas.', correct: true },
            { id: 'b', text: 'Os campos são as 25 pessoas; os registros são as quatro informações de cada uma.',
              porque: 'É o contrário: campo é o tipo de informação, registro é a entidade inteira.' },
            { id: 'c', text: 'Campos e registros são a mesma coisa, e os nomes mudam conforme o programa.',
              porque: 'São coisas diferentes em qualquer programa: um é coluna, o outro é linha.' },
            { id: 'd', text: 'Os campos são os dados digitados; os registros são as buscas feitas depois.',
              porque: 'Busca não é registro. Registro é a linha guardada, exista busca ou não.' },
          ]},
          explanation: 'Coluna é campo, linha é registro. Quatro campos, vinte e cinco registros.',
        },
        {
          id: 'AP044.3-L1-Q2', type: 'multiple_choice',
          prompt: 'Qual é a diferença que faz uma lista virar banco de dados?',
          data: { options: [
            { id: 'a', text: 'A estrutura: a mesma informação sempre na mesma coluna, com um registro por linha.', correct: true },
            { id: 'b', text: 'O programa usado: lista se faz no editor de texto, banco de dados só em programa próprio.',
              porque: 'Dá para montar banco de dados numa planilha. O que decide é a estrutura, não o programa.' },
            { id: 'c', text: 'A quantidade: acima de vinte e cinco linhas, uma lista passa a ser banco de dados.',
              porque: 'Quantidade não muda nada: dez registros bem estruturados já são um banco de dados.' },
            { id: 'd', text: 'A ordem alfabética: banco de dados é uma lista que foi ordenada pelo nome.',
              porque: 'Ordenar é uma consequência da estrutura, e não a estrutura.' },
          ]},
          explanation: 'É a estrutura que permite ordenar, buscar e gerar relatório sem redigitar nada.',
        },
        {
          id: 'AP044.3-L1-Q3', type: 'multiple_choice',
          prompt: 'Numa linha, o telefone foi digitado na coluna do endereço. O que acontece?',
          data: { options: [
            { id: 'a', text: 'Nada dá erro, e a busca por telefone deixa de encontrar aquela pessoa.', correct: true },
            { id: 'b', text: 'O programa avisa na hora que o dado está na coluna errada.',
              porque: 'Ele não sabe o que é um telefone: só sabe em que coluna a pessoa escreveu.' },
            { id: 'c', text: 'A linha inteira é recusada e some da tabela até ser corrigida.',
              porque: 'A linha continua lá, com a informação no lugar errado — e é isso que a torna perigosa.' },
            { id: 'd', text: 'O telefone é movido automaticamente para a coluna certa pelo programa.',
              porque: 'Nenhum programa adivinha intenção: ele guarda o que foi escrito onde foi escrito.' },
          ]},
          explanation: 'Erro que não estoura é o pior tipo: a agenda parece certa e responde errado.',
        },
        {
          id: 'AP044.3-L1-Q4', type: 'multiple_choice',
          prompt: 'Por que declarar que um campo é número, e não texto?',
          data: { options: [
            { id: 'a', text: 'Porque como texto a ordenação põe "10" antes de "9", comparando letra por letra.', correct: true },
            { id: 'b', text: 'Porque campos de texto ocupam muito mais espaço em disco do que os de número.',
              porque: 'A diferença de espaço é irrelevante nessa escala. O que muda é o comportamento.' },
            { id: 'c', text: 'Porque só campos de número podem ser mostrados num relatório impresso.',
              porque: 'Relatório imprime texto o tempo todo — nome e endereço são texto.' },
            { id: 'd', text: 'Porque campos de texto não permitem que se faça busca dentro deles.',
              porque: 'Busca em texto é justamente o que mais se usa. O tipo muda ordenação e validação.' },
          ]},
          explanation: '"10" antes de "9" é a surpresa clássica de quem guardou número como texto.',
        },
        {
          id: 'AP044.3-L1-Q5', type: 'true_false',
          prompt: 'Guardar "Rua das Flores, 120 — Centro — (61) 99999-0000" num campo só é uma boa forma de economizar colunas.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', porque: 'É falso: são três informações que nunca mais se separam, e nenhuma delas poderá ser ordenada ou buscada sozinha.' },
            { id: 'b', text: 'Falso', correct: true },
          ]},
          explanation: 'Um campo guarda uma coisa só. Juntar é fácil depois; separar, não.',
        },
        {
          id: 'AP044.3-L1-Q6', type: 'multiple_choice',
          prompt: 'Qual é a vantagem prática de declarar um campo como e-mail?',
          data: { options: [
            { id: 'a', text: 'Ele recusa "joana" sem arroba na hora de digitar, e não meses depois.', correct: true },
            { id: 'b', text: 'Ele envia a mensagem automaticamente para o endereço cadastrado.',
              porque: 'Declarar o tipo não envia nada: ele apenas confere a forma do que foi escrito.' },
            { id: 'c', text: 'Ele descobre sozinho o e-mail da pessoa a partir do nome dela.',
              porque: 'Nenhum campo adivinha dado que ninguém digitou.' },
            { id: 'd', text: 'Ele impede que o mesmo e-mail seja cadastrado para duas pessoas.',
              porque: 'Isso é uma regra de chave única, e é outra configuração — não vem do tipo do campo.' },
          ]},
          explanation: 'Validação é o erro pego na porta de entrada, e não na hora do estrago.',
        },
        {
          id: 'AP044.3-L1-Q7', type: 'matching',
          prompt: 'Ligue cada campo ao tipo que faz sentido declarar para ele.',
          data: { pairs: [
            { left: 'Nome da pessoa', right: 'Texto' },
            { left: 'Data de nascimento', right: 'Data' },
            { left: 'Endereço eletrônico', right: 'E-mail' },
            { left: 'Quantidade de acampamentos', right: 'Número' },
          ]},
          explanation: 'O tipo declarado decide como se ordena e o que é recusado na digitação.',
        },
        {
          id: 'AP044.3-L1-Q8', type: 'multiple_choice',
          prompt: 'O que a estrutura de banco de dados permite fazer que uma lista escrita à mão não permite?',
          data: { options: [
            { id: 'a', text: 'Ordenar, buscar e gerar relatório sem reescrever nada.', correct: true },
            { id: 'b', text: 'Guardar mais pessoas do que caberia numa lista comum.',
              porque: 'Caber cabe nas duas. O que muda é o que se consegue fazer com o que está guardado.' },
            { id: 'c', text: 'Proteger os dados para que ninguém além do dono consiga lê-los.',
              porque: 'Proteção vem de permissão e senha, e não da estrutura da tabela.' },
            { id: 'd', text: 'Corrigir automaticamente os erros de digitação dos nomes cadastrados.',
              porque: 'Nenhuma estrutura corrige nome mal digitado: ela só recusa o que viola o tipo declarado.' },
          ]},
          explanation: 'As três coisas que o caderno cobra recomeçar são as três que a estrutura dá de graça.',
        },
      ],
    },
    {
      code: 'AP044.3-L2',
      title: 'Montando a agenda do clube',
      type: 'lab',
      content: '',
      requirementCodes: ['AP044-6.1'],
      labType: 'banco_de_dados',
    },
  ],
};
