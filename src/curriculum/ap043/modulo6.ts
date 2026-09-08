import type { Module } from '../../types';

/*
 * AP043 módulo 6 — o requisito 8, as cinco demonstrações no próprio sistema.
 *
 * A teoria daqui responde uma pergunta só, e é a que o requisito esconde: onde
 * o Windows guarda cada resposta. Consultar a memória, os detalhes de um
 * arquivo e o relógio são três perguntas parecidas que moram em três lugares
 * diferentes, e quem não sabe disso procura tudo no Explorador.
 *
 * A segunda ideia é a distinção entre **atalho e arquivo**, que custa caro na
 * vida real: arrastar o arquivo para a área de trabalho o move, e quem faz isso
 * tira o documento da pasta compartilhada do clube sem perceber. O laboratório
 * deixa esse caminho errado disponível e avisa na hora — é o mesmo tratamento
 * que a AP042 dá a arrastar o atalho para a lixeira achando que desinstala.
 */

const conteudo_L1 = `
<h2 class="text-xl font-bold mb-3">Cada resposta mora num lugar</h2>
<p class="mb-3">"Quanta memória tem esse computador?", "que tamanho tem esse
arquivo?", "por que a hora está errada?" — são três perguntas parecidas, e o
Windows guarda as respostas em três lugares diferentes. Saber onde procurar é
metade do trabalho.</p>

<h3 class="font-bold mt-4 mb-2">Configurações: o que é da máquina</h3>
<p class="mb-3">As <strong>informações técnicas</strong> — processador, memória
instalada, armazenamento, versão do Windows — ficam em
<strong>Configurações › Sistema › Sobre</strong>. É a tela para abrir quando
alguém pergunta se o computador aguenta um programa.</p>
<p class="mb-3">No mesmo lugar, em <strong>Hora e idioma</strong>, fica o
relógio. E ali existe uma chave que engana muita gente:
<em>definir horário automaticamente</em>. Enquanto ela estiver ligada, os
campos de data e hora ficam apagados e não aceitam nada — não porque estejam
quebrados, mas porque quem está acertando o relógio é a internet.</p>

<h3 class="font-bold mt-4 mb-2">Explorador: o que é do arquivo</h3>
<p class="mb-3">Os <strong>detalhes de um arquivo</strong> não estão em
Configurações: estão no próprio arquivo. Clique nele com o botão direito e
escolha <strong>Propriedades</strong>.</p>
<p class="mb-3">A lista do Explorador já mostra alguma coisa — nome, data,
tipo, tamanho arredondado. As Propriedades mostram o resto: o tamanho exato em
bytes, o caminho completo da pasta, a data de criação separada da data de
modificação, e com qual programa aquele arquivo abre.</p>

<h3 class="font-bold mt-4 mb-2">Atalho não é o arquivo</h3>
<p class="mb-3">Um <strong>atalho</strong> é um apontador: um ícone que diz
"o que você quer está lá". Ele tem uma setinha no canto inferior esquerdo, e é
por ela que se reconhece.</p>
<p class="mb-3">Apagar um atalho não apaga nada além dele. Mas
<strong>arrastar</strong> um arquivo para a área de trabalho não cria atalho:
<em>move</em> o arquivo — ele sai da pasta onde estava. Numa pasta
compartilhada do clube, isso significa que o documento sumiu para todo mundo.</p>
<p class="mb-3">O caminho certo é <strong>Enviar para › Área de Trabalho
(criar atalho)</strong>, ou o menu da própria área de trabalho, em
<strong>Novo › Atalho</strong>.</p>

<div class="p-3 rounded-lg mt-4" style="background: rgba(234,179,8,.12)">
<p class="text-sm"><strong>Print da tela.</strong> No Windows 11 a tecla
<em>Print Screen</em> abre a Ferramenta de Captura, que também está no menu
Iniciar. E há uma diferença que importa: capturar põe a imagem na memória, e
<strong>salvar</strong> a transforma em arquivo. Print que fica só na memória
se perde na próxima vez que alguém copiar qualquer coisa.</p>
</div>
`;

export const modulo6: Module = {
  code: 'AP043.6',
  title: 'Achando as respostas no sistema',
  description: 'Informações técnicas, detalhes de arquivo, atalhos na área de trabalho, print da tela e o relógio.',
  lessons: [
    {
      code: 'AP043.6-L1',
      title: 'Onde o Windows guarda cada coisa',
      type: 'theory',
      content: conteudo_L1,
      requirementCodes: ['AP043-8.1', 'AP043-8.2', 'AP043-8.3'],
      questions: [
        {
          id: 'AP043.6-L1-Q1', type: 'multiple_choice',
          prompt: 'Onde se descobre quanta memória e qual processador o computador tem?',
          data: { options: [
            { id: 'a', text: 'Em Configurações, na página Sistema › Sobre.', correct: true },
            { id: 'b', text: 'No Explorador, clicando com o botão direito em Este Computador.',
              porque: 'Ali aparece espaço em disco. Memória e processador não estão nessa tela.' },
            { id: 'c', text: 'Na lixeira, que guarda o registro do que já passou pela máquina.',
              porque: 'A lixeira guarda arquivos apagados, e nada sobre as peças do computador.' },
            { id: 'd', text: 'Na etiqueta colada na caixa, já que o sistema não informa isso.',
              porque: 'O sistema informa, e melhor do que a etiqueta: ele mostra o que está instalado agora.' },
          ]},
          explanation: 'É a tela que responde "esse computador aguenta?" — e ela não fica no Explorador.',
        },
        {
          id: 'AP043.6-L1-Q2', type: 'multiple_choice',
          prompt: 'O que as Propriedades de um arquivo mostram que a lista do Explorador não mostra?',
          data: { options: [
            { id: 'a', text: 'O tamanho exato em bytes, o caminho completo e a data de criação.', correct: true },
            { id: 'b', text: 'O conteúdo do arquivo, sem precisar abri-lo no programa dele.',
              porque: 'Propriedades fala sobre o arquivo, e não mostra o que está escrito dentro dele.' },
            { id: 'c', text: 'A lista de todas as pessoas que já abriram aquele arquivo.',
              porque: 'O Windows não guarda essa lista num arquivo comum.' },
            { id: 'd', text: 'Uma cópia de segurança, para o caso de o arquivo se perder.',
              porque: 'Propriedades não guarda cópia nenhuma. Cópia de segurança é backup, e é outra coisa.' },
          ]},
          explanation: 'A lista arredonda o tamanho e esconde o resto. O detalhe mora no botão direito.',
        },
        {
          id: 'AP043.6-L1-Q3', type: 'multiple_choice',
          prompt: 'Você arrasta um documento da pasta do clube para a área de trabalho. O que acontece com ele?',
          data: { options: [
            { id: 'a', text: 'Ele é movido: some da pasta do clube.', correct: true },
            { id: 'b', text: 'Um atalho é criado, e o arquivo continua na pasta do clube.',
              porque: 'Atalho não sai de arrastar. Sai de Enviar para › Área de Trabalho (criar atalho).' },
            { id: 'c', text: 'Uma cópia é criada, ficando um arquivo em cada lugar.',
              porque: 'Copiar acontece entre discos diferentes. Dentro do mesmo disco, arrastar move.' },
            { id: 'd', text: 'Nada acontece, porque a área de trabalho não aceita documentos.',
              porque: 'Ela aceita qualquer arquivo — e é justamente por isso que o engano é fácil.' },
          ]},
          explanation: 'Numa pasta compartilhada do clube, isso quer dizer que o documento sumiu para todo mundo.',
        },
        {
          id: 'AP043.6-L1-Q4', type: 'true_false',
          prompt: 'Apagar o atalho de um programa da área de trabalho apaga também o programa.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', porque: 'É falso. Atalho é só um apontador: apagá-lo tira o ícone, e o programa continua instalado.' },
            { id: 'b', text: 'Falso', correct: true },
          ]},
          explanation: 'É a mesma ideia da Computação 2: quem desinstala programa é Configurações, e não a lixeira.',
        },
        {
          id: 'AP043.6-L1-Q5', type: 'multiple_choice',
          prompt: 'Os campos de data e hora estão apagados e não aceitam mudança. Por quê?',
          data: { options: [
            { id: 'a', text: 'Porque a chave "definir horário automaticamente" está ligada.', correct: true },
            { id: 'b', text: 'Porque só quem tem senha de administrador consegue ver esses campos.',
              porque: 'Eles aparecem para qualquer um. O que os desliga é a chave logo acima deles.' },
            { id: 'c', text: 'Porque a data e a hora só podem ser mudadas com o computador reiniciando.',
              porque: 'Mudam com a máquina ligada e valem na hora. Não há reinício envolvido.' },
            { id: 'd', text: 'Porque o relógio do computador quebrou e precisa de peça nova.',
              porque: 'O relógio não deu defeito: ele está sendo acertado pela internet, e por isso não aceita ajuste manual.' },
          ]},
          explanation: 'Não está quebrado. Está sendo acertado por outro — desligue a chave e os campos acordam.',
        },
        {
          id: 'AP043.6-L1-Q6', type: 'matching',
          prompt: 'Ligue cada pergunta ao lugar onde o Windows guarda a resposta.',
          data: { pairs: [
            { left: 'Quanta memória tem a máquina?', right: 'Configurações › Sistema › Sobre' },
            { left: 'Que tamanho exato tem este arquivo?', right: 'Botão direito no arquivo › Propriedades' },
            { left: 'Por que a hora está errada?', right: 'Configurações › Hora e idioma' },
          ]},
          explanation: 'Três perguntas parecidas, três lugares. Saber onde procurar é metade do trabalho.',
        },
      ],
    },
    {
      code: 'AP043.6-L2',
      title: 'Descobrindo o que a máquina do clube tem',
      type: 'lab',
      content: '',
      requirementCodes: ['AP043-8.1', 'AP043-8.2', 'AP043-8.3', 'AP043-8.4', 'AP043-8.5'],
      labType: 'area_de_trabalho',
    },
  ],
};
