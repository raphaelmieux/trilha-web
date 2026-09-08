import type { Module } from '../../types';

/*
 * AP043 módulo 3 — o requisito 4, as quatro inserções num editor de texto.
 *
 * Uma lição de teoria e um laboratório, como na AP042. A teoria não repete o
 * que o laboratório vai fazer: ela cuida do que não se aprende clicando, que
 * são duas ideias.
 *
 * A primeira é a **guia contextual**: as ferramentas da tabela só existem
 * quando o cursor está dentro dela. Quem não sabe disso procura em Inserir para
 * sempre, e conclui que o Word não deixa acrescentar linha.
 *
 * A segunda é a diferença entre **campo e texto digitado**. Numeração de página
 * não é escrever "1" no rodapé: é um campo que o programa recalcula. Digitado,
 * ele fica igual nas duas páginas — e ninguém percebe até imprimir.
 */

const conteudo_L1 = `
<h2 class="text-xl font-bold mb-3">Um documento tem mais do que parágrafos</h2>
<p class="mb-3">Na Computação 2 você formatou texto: fonte, negrito, alinhamento,
margens. Tudo isso muda a aparência do que já está escrito. Agora é outra coisa:
<strong>acrescentar peças</strong> que não são parágrafo — uma tabela, uma foto,
um cabeçalho, um número de página.</p>
<p class="mb-3">Todas elas moram na mesma guia, chamada
<strong>Inserir</strong>. Se você está procurando como pôr alguma coisa no
documento, é ali.</p>

<h3 class="font-bold mt-4 mb-2">A guia que aparece e some</h3>
<p class="mb-3">Insira uma tabela e olhe para o alto da janela: apareceram duas
guias novas, coloridas, que não estavam lá — <em>Layout da Tabela</em> e
<em>Design da Tabela</em>. Clique fora da tabela e elas somem.</p>
<p class="mb-3">Elas se chamam <strong>guias contextuais</strong>, e existem
porque só fazem sentido com uma tabela selecionada. É ali, e só ali, que se
acrescenta linha, se exclui coluna e se escolhe o estilo.</p>
<p class="mb-3">Esse é o motivo de tanta gente dizer que "não achei onde
adicionar linha": procuraram em Inserir, que é onde a tabela nasceu, e a guia
que faz isso só existe com o cursor dentro dela.</p>

<h3 class="font-bold mt-4 mb-2">A imagem entra como se fosse uma letra</h3>
<p class="mb-3">Quando você insere uma foto, ela entra
<strong>alinhada com o texto</strong>: o programa a trata como uma letra
gigante, e o parágrafo é empurrado para baixo. Não é defeito — é o padrão.</p>
<p class="mb-3">Ajustar a imagem ao texto é escolher outra
<strong>quebra de texto</strong>. A mais usada é a <em>quadrada</em>: o texto
passa a contornar a foto, e a página deixa de ter um buraco.</p>

<h3 class="font-bold mt-4 mb-2">Cabeçalho, rodapé e a diferença que importa</h3>
<p class="mb-3">O <strong>cabeçalho</strong> é a faixa no alto de toda página, e
o <strong>rodapé</strong> é a de baixo. O que se escreve neles aparece
<em>em todas as páginas</em>, sem ninguém repetir nada.</p>
<p class="mb-3">Não se digita neles clicando no meio da folha: é preciso abrir a
área do cabeçalho, e enquanto ela está aberta o resto do documento fica
apagado. Para sair, clica-se em <em>Fechar Cabeçalho e Rodapé</em>.</p>

<div class="p-3 rounded-lg mt-4" style="background: rgba(234,179,8,.12)">
<p class="text-sm"><strong>Número de página é campo, e não número.</strong>
Escrever "1" no rodapé escreve 1 em todas as páginas — inclusive na segunda,
que passa a ser a página 1 também. A numeração de verdade é um campo que o
programa recalcula sozinho, e por isso a segunda página mostra 2 sem ninguém
ter digitado nada lá.</p>
</div>
`;

export const modulo3: Module = {
  code: 'AP043.3',
  title: 'Inserir num documento',
  description: 'Tabela, imagem, cabeçalho, rodapé e numeração de páginas num documento.',
  lessons: [
    {
      code: 'AP043.3-L1',
      title: 'Onde ficam as coisas que se inserem',
      type: 'theory',
      content: conteudo_L1,
      requirementCodes: ['AP043-4.1', 'AP043-4.3', 'AP043-4.4'],
      questions: [
        {
          id: 'AP043.3-L1-Q1', type: 'multiple_choice',
          prompt: 'Você inseriu uma tabela e quer acrescentar uma linha. Onde está esse comando?',
          data: { options: [
            { id: 'a', text: 'Na guia Layout da Tabela, que só aparece com o cursor dentro dela.', correct: true },
            { id: 'b', text: 'Na guia Inserir, no mesmo botão que criou a tabela.',
              porque: 'Inserir cria a tabela. Depois de criada, quem cuida dela são as guias que aparecem com o cursor dentro.' },
            { id: 'c', text: 'Na guia Início, no grupo Parágrafo, junto dos marcadores.',
              porque: 'Ali ficam os comandos do texto corrido. A tabela tem guias próprias.' },
            { id: 'd', text: 'Em nenhum lugar: para ter mais linhas é preciso apagar a tabela e criar outra maior.',
              porque: 'Acrescentar linha é comando comum, e existe justamente para não ter de refazer a tabela.' },
          ]},
          explanation: 'É guia contextual: existe enquanto o contexto existe, e some quando o cursor sai.',
        },
        {
          id: 'AP043.3-L1-Q2', type: 'multiple_choice',
          prompt: 'Por que as guias da tabela desaparecem quando você clica num parágrafo?',
          data: { options: [
            { id: 'a', text: 'Porque elas só fazem sentido com uma tabela selecionada.', correct: true },
            { id: 'b', text: 'Porque o programa esconde guias que não são usadas há algum tempo.',
              porque: 'Nenhuma guia some por falta de uso. O que decide é onde está o cursor.' },
            { id: 'c', text: 'Porque a tabela foi desfeita quando o cursor saiu de dentro dela.',
              porque: 'A tabela continua no documento. O que saiu de cena foram as ferramentas dela.' },
            { id: 'd', text: 'Porque só uma guia colorida pode ficar visível de cada vez na janela.',
              porque: 'Podem aparecer várias ao mesmo tempo — tabela selecionada mostra duas.' },
          ]},
          explanation: 'É a mesma lógica em toda ferramenta do tipo: imagem selecionada traz a guia da imagem.',
        },
        {
          id: 'AP043.3-L1-Q3', type: 'multiple_choice',
          prompt: 'A foto entrou no documento e empurrou o parágrafo inteiro para baixo. O que fazer para o texto passar ao lado dela?',
          data: { options: [
            { id: 'a', text: 'Mudar a quebra de texto da imagem para quadrada.', correct: true },
            { id: 'b', text: 'Diminuir a imagem até ela caber no espaço que sobrou na linha.',
              porque: 'Ela continuaria alinhada com o texto, só que menor. O que muda o comportamento é a quebra.' },
            { id: 'c', text: 'Apagar a foto e inseri-la de novo, agora clicando no lugar certo da página.',
              porque: 'Ela entra do mesmo jeito de novo: alinhada com o texto é o padrão de toda inserção.' },
            { id: 'd', text: 'Alinhar o parágrafo à direita para ele se afastar da imagem.',
              porque: 'Isso move o texto dentro da linha dele. A imagem continua ocupando a linha inteira.' },
          ]},
          explanation: 'Ela entra como se fosse uma letra gigante, e a quebra é o que muda isso.',
        },
        {
          id: 'AP043.3-L1-Q4', type: 'true_false',
          prompt: 'Escrever "1" no rodapé da primeira página é a mesma coisa que inserir numeração de páginas.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', porque: 'É falso. O rodapé se repete igual em todas as páginas: a segunda também mostraria 1.' },
            { id: 'b', text: 'Falso', correct: true },
          ]},
          explanation: 'Numeração é campo, e campo se recalcula. Número digitado fica igual até alguém trocar à mão.',
        },
        {
          id: 'AP043.3-L1-Q5', type: 'multiple_choice',
          prompt: 'O que acontece com o texto do cabeçalho num documento de cinco páginas?',
          data: { options: [
            { id: 'a', text: 'Ele aparece igual no alto das cinco.', correct: true },
            { id: 'b', text: 'Ele aparece só na primeira, que é onde foi digitado.',
              porque: 'Se ficasse só numa página, seria um parágrafo comum. O cabeçalho existe justamente para se repetir.' },
            { id: 'c', text: 'Ele aparece nas páginas ímpares, e o rodapé nas pares.',
              porque: 'Dá para configurar páginas diferentes, mas não é o padrão: por padrão os dois valem para todas.' },
            { id: 'd', text: 'Ele some ao imprimir, porque serve apenas para orientar quem está editando.',
              porque: 'Cabeçalho é impresso. Quem não sai no papel é a régua e as marcas de parágrafo.' },
          ]},
          explanation: 'É por isso que nome do clube, logotipo e data moram nele: escreve-se uma vez.',
        },
        {
          id: 'AP043.3-L1-Q6', type: 'ordering',
          prompt: 'Ponha na ordem os passos para pôr o nome do clube no alto de todas as páginas.',
          data: { items: [
            { id: 'i1', text: 'Abrir a guia Inserir', order: 1 },
            { id: 'i2', text: 'Clicar em Cabeçalho', order: 2 },
            { id: 'i3', text: 'Escrever o nome do clube na área que abriu', order: 3 },
            { id: 'i4', text: 'Clicar em Fechar Cabeçalho e Rodapé', order: 4 },
          ]},
          explanation: 'Sem fechar a área, o resto do documento continua apagado e não aceita edição.',
        },
      ],
    },
    {
      code: 'AP043.3-L2',
      title: 'Montando o relatório do acampamento',
      type: 'lab',
      content: '',
      requirementCodes: ['AP043-4.1', 'AP043-4.2', 'AP043-4.3', 'AP043-4.4'],
      labType: 'insercao_texto',
    },
  ],
};
