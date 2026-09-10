import type { Module } from '../../types';

/*
 * AP044 módulo 7 — os requisitos 11 e 12: o correio eletrônico.
 *
 * Nove gestos e um princípio. Estão no mesmo módulo porque quase todo gesto
 * daquela lista tem um lado de segurança, e separá-los daria uma aula de
 * botões e outra de sustos.
 *
 * ── O lado que ninguém ensina ────────────────────────────────────────────
 * "Segurança no e-mail" costuma virar uma lista sobre **receber**: não clique,
 * confira o remetente, desconfie de anexo. A AP042 já tem um laboratório
 * inteiro disso, e a AP034 outro — repetir aqui seria dar a terceira versão da
 * mesma aula.
 *
 * O lado que falta é **enviar**. É nele que o desbravador de doze anos faz
 * estrago de verdade, e sem nenhum golpista envolvido: põe sessenta endereços
 * no campo "Para" e entrega o e-mail de sessenta famílias a sessenta pessoas;
 * responde a todos numa lista de duzentos; encaminha uma conversa cujo fim ele
 * não leu. Nada disso dá erro, nada disso volta atrás.
 *
 * Por isso Cco não entra aqui como "o terceiro campo": entra como a resposta a
 * uma pergunta que o desbravador nunca se fez — de quem é o endereço que ele
 * está prestes a mostrar.
 *
 * ── Arquivar não é excluir ───────────────────────────────────────────────
 * O item g) pede arquivar, e é o item que parece o mais bobo da lista. Ele é o
 * que separa quem tem caixa de entrada de quem tem um monte. Arquivar tira da
 * frente e guarda; excluir joga fora. A confusão entre os dois é o motivo de
 * gente guardar tudo na caixa de entrada com medo de perder alguma coisa.
 */

const conteudo_L1 = `
<h2 class="text-xl font-bold mb-3">Três campos, e uma pergunta antes deles</h2>
<p class="mb-3">Você vai avisar as sessenta famílias do clube sobre o
acampamento. Escreve a mensagem, cola os sessenta endereços no campo
<strong>Para</strong> e envia.</p>
<p class="mb-3">Acabou de entregar o e-mail de sessenta famílias a sessenta
pessoas — todo mundo que recebeu está vendo a lista inteira. Ninguém autorizou
isso, ninguém foi avisado, e não há como desfazer.</p>

<h3 class="font-bold mt-4 mb-2">Para, Cc e Cco</h3>
<ul class="list-disc pl-5 mb-3 space-y-1">
<li><strong>Para</strong> — quem precisa responder ou agir. É a mensagem
dele.</li>
<li><strong>Cc</strong> (com cópia) — quem só precisa ficar sabendo. Todos
veem quem está aqui.</li>
<li><strong>Cco</strong> (com cópia oculta) — quem recebe sem que os outros
saibam, e sem ver os outros. É o campo do aviso para muita gente.</li>
</ul>
<p class="mb-3">A pergunta que resolve os três: <strong>estas pessoas se
conhecem e combinaram trocar endereço?</strong> Se não, o lugar delas é o
Cco.</p>

<h3 class="font-bold mt-4 mb-2">Responder, responder a todos, encaminhar</h3>
<p class="mb-3"><strong>Responder</strong> volta só para quem escreveu.
<strong>Responder a todos</strong> volta para a mesa inteira — e "combinado,
obrigado!" para duzentas pessoas é duzentas interrupções.</p>
<p class="mb-3"><strong>Encaminhar</strong> manda a mensagem para alguém novo,
e leva <strong>tudo o que está embaixo</strong>: a conversa anterior inteira,
inclusive o trecho que você não releu. É o jeito mais comum de mostrar a uma
pessoa uma coisa que não era para ela.</p>

<h3 class="font-bold mt-4 mb-2">Anexo, assinatura e arquivar</h3>
<ul class="list-disc pl-5 mb-3 space-y-1">
<li><strong>Anexo</strong> é o arquivo que viaja junto. Confira o que você
anexou antes de enviar: anexar a versão errada é tão comum quanto esquecer de
anexar.</li>
<li><strong>Assinatura</strong> é o texto que entra sozinho no fim de toda
mensagem — nome, função no clube, contato. Ela poupa digitação e diz a quem
recebe quem é você.</li>
<li><strong>Arquivar</strong> tira da caixa de entrada e guarda; a mensagem
continua existindo e continua sendo encontrada na busca. <strong>Excluir</strong>
joga fora. São coisas diferentes, e é por confundir as duas que tanta gente
mantém tudo na caixa de entrada.</li>
</ul>

<h3 class="font-bold mt-4 mb-2">Segurança tem dois lados</h3>
<p class="mb-3">Ao <strong>receber</strong>, você já sabe: não clicar em link
de mensagem inesperada, conferir o endereço de verdade do remetente, não abrir
anexo que seja programa.</p>
<p class="mb-3">Ao <strong>enviar</strong>, valem outras três, e elas custam
mais caro porque não há golpista nenhum envolvido — é você quem faz:</p>
<ul class="list-disc pl-5 mb-3 space-y-1">
<li><strong>Endereço dos outros não é seu para mostrar.</strong> Muita gente
avisada de uma vez vai no Cco.</li>
<li><strong>Senha não anda por e-mail.</strong> A mensagem fica guardada nos
dois lados, para sempre, em texto que se lê.</li>
<li><strong>O que sai não volta.</strong> Reler antes de enviar é a única
correção que existe.</li>
</ul>

<div class="p-3 rounded-lg mt-4" style="background: rgba(234,179,8,.12)">
<p class="text-sm"><strong>Antes de clicar em Enviar:</strong> conferi os
campos, reli o que vai embaixo do encaminhado, e o anexo é mesmo esse?</p>
</div>
`;

export const modulo7: Module = {
  code: 'AP044.7',
  title: 'O correio do clube',
  description: 'Para, Cc e Cco, encaminhar sem vazar, arquivar sem perder — e a segurança do lado de quem envia.',
  lessons: [
    {
      code: 'AP044.7-L1',
      title: 'Os três campos e os dois lados da segurança',
      type: 'theory',
      content: conteudo_L1,
      requirementCodes: ['AP044-12.1'],
      perguntas: 5,
      questions: [
        {
          id: 'AP044.7-L1-Q1', type: 'multiple_choice',
          prompt: 'Você precisa avisar as sessenta famílias do clube sobre o acampamento. Onde vão os endereços?',
          data: { options: [
            { id: 'a', text: 'No Cco, porque as famílias não combinaram trocar endereço entre si.', correct: true },
            { id: 'b', text: 'No Para, porque é a eles que a mensagem se destina.',
              porque: 'No Para todos veem a lista inteira: seria entregar o endereço de sessenta famílias a sessenta pessoas.' },
            { id: 'c', text: 'No Cc, porque é o campo próprio para enviar a muita gente de uma vez.',
              porque: 'O Cc também mostra a lista a todos. Quem esconde é o Cco.' },
            { id: 'd', text: 'Divididos entre Para e Cc, para que a lista não fique longa demais.',
              porque: 'O tamanho da lista não é o problema: é ela ficar visível, e nos dois campos fica.' },
          ]},
          explanation: 'A pergunta é sempre: estas pessoas combinaram trocar endereço? Se não, Cco.',
        },
        {
          id: 'AP044.7-L1-Q2', type: 'multiple_choice',
          prompt: 'Qual é a diferença entre Para e Cc?',
          data: { options: [
            { id: 'a', text: 'No Para vai quem precisa agir; no Cc, quem só precisa ficar sabendo.', correct: true },
            { id: 'b', text: 'O Para aceita um endereço só, e o Cc aceita vários de uma vez.',
              porque: 'Os dois aceitam quantos endereços você puser. A diferença é o papel de quem está ali.' },
            { id: 'c', text: 'Quem está no Cc não consegue responder à mensagem recebida.',
              porque: 'Consegue responder normalmente. O campo não tira nenhuma função.' },
            { id: 'd', text: 'O Cc esconde os endereços dos demais destinatários da mensagem.',
              porque: 'Quem esconde é o Cco. No Cc a lista aparece para todo mundo.' },
          ]},
          explanation: 'É uma diferença de papel, e não de mecanismo: os dois entregam igual.',
        },
        {
          id: 'AP044.7-L1-Q3', type: 'multiple_choice',
          prompt: 'Por que encaminhar uma conversa longa exige cuidado?',
          data: { options: [
            { id: 'a', text: 'Porque vai junto tudo o que está embaixo, inclusive o que não era para a pessoa nova.', correct: true },
            { id: 'b', text: 'Porque encaminhar avisa o autor original de que a mensagem dele foi repassada.',
              porque: 'Ninguém é avisado. É justamente por isso que o descuido não aparece.' },
            { id: 'c', text: 'Porque a mensagem encaminhada perde os anexos que vieram com ela.',
              porque: 'Os anexos costumam seguir junto — e às vezes esse é o problema.' },
            { id: 'd', text: 'Porque só é possível encaminhar para uma pessoa de cada vez.',
              porque: 'Dá para encaminhar para quantas pessoas quiser, o que aumenta o risco.' },
          ]},
          explanation: 'Encaminhar leva a história inteira. Reler o que vai embaixo é parte do gesto.',
        },
        {
          id: 'AP044.7-L1-Q4', type: 'multiple_choice',
          prompt: 'Qual é a diferença entre arquivar e excluir um e-mail?',
          data: { options: [
            { id: 'a', text: 'Arquivar tira da caixa de entrada e guarda; excluir joga fora.', correct: true },
            { id: 'b', text: 'Arquivar guarda por trinta dias e depois apaga sozinho a mensagem.',
              porque: 'Arquivo não tem prazo: a mensagem fica guardada e continua aparecendo na busca.' },
            { id: 'c', text: 'Arquivar copia a mensagem para o computador e a tira do servidor.',
              porque: 'Ela continua no servidor, apenas fora da caixa de entrada.' },
            { id: 'd', text: 'São a mesma coisa, e o nome muda conforme o programa de e-mail usado.',
              porque: 'São operações diferentes em qualquer programa: uma guarda, a outra descarta.' },
          ]},
          explanation: 'Quem sabe a diferença esvazia a caixa de entrada sem medo de perder nada.',
        },
        {
          id: 'AP044.7-L1-Q5', type: 'true_false',
          prompt: 'Mandar a senha do Wi-Fi do clube por e-mail é seguro, desde que só para uma pessoa.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', porque: 'É falso: a mensagem fica guardada nos dois lados, por tempo indefinido, em texto que qualquer um que abra a conta lê.' },
            { id: 'b', text: 'Falso', correct: true },
          ]},
          explanation: 'Senha não anda por e-mail. O que sai não volta, e fica guardado.',
        },
        {
          id: 'AP044.7-L1-Q6', type: 'multiple_choice',
          prompt: 'Numa lista com duzentas pessoas, alguém envia um aviso e você quer agradecer. O que fazer?',
          data: { options: [
            { id: 'a', text: 'Responder só a quem escreveu, e não a todos.', correct: true },
            { id: 'b', text: 'Responder a todos, para que a lista saiba que o aviso foi recebido.',
              porque: 'Seriam duzentas interrupções por uma informação que interessa a uma pessoa.' },
            { id: 'c', text: 'Encaminhar o aviso de volta para quem enviou, com o agradecimento.',
              porque: 'Encaminhar cria uma mensagem nova fora da conversa, e ainda leva a história junto.' },
            { id: 'd', text: 'Responder a todos com cópia oculta para quem enviou o aviso.',
              porque: 'Responder a todos já alcança a lista inteira: o Cco não desfaz isso.' },
          ]},
          explanation: 'Responder a todos é para o que interessa a todos.',
        },
        {
          id: 'AP044.7-L1-Q7', type: 'matching',
          prompt: 'Ligue cada situação ao campo ou gesto certo.',
          data: { pairs: [
            { left: 'Quem precisa tomar a providência', right: 'Para' },
            { left: 'O diretor, que só acompanha', right: 'Cc' },
            { left: 'Sessenta famílias que não se conhecem', right: 'Cco' },
            { left: 'Mensagem resolvida, e sem lixo', right: 'Arquivar' },
          ]},
          explanation: 'Cada campo diz um papel. Errar o campo é dizer a coisa errada sobre quem está ali.',
        },
        {
          id: 'AP044.7-L1-Q8', type: 'multiple_choice',
          prompt: 'Para que serve configurar uma assinatura no programa de e-mail?',
          data: { options: [
            { id: 'a', text: 'Para que nome, função e contato entrem sozinhos no fim de toda mensagem.', correct: true },
            { id: 'b', text: 'Para provar que a mensagem foi mesmo escrita por você, e não por outra pessoa.',
              porque: 'Isso é assinatura digital, que é outra coisa: qualquer um pode escrever o mesmo texto no fim.' },
            { id: 'c', text: 'Para que o programa recuse mensagens recebidas sem assinatura no fim.',
              porque: 'Ela não filtra nada do que chega: só acrescenta texto ao que você envia.' },
            { id: 'd', text: 'Para registrar a data e a hora exatas em que a mensagem foi escrita.',
              porque: 'Data e hora já vão no cabeçalho, sem que ninguém configure nada.' },
          ]},
          explanation: 'É texto repetido que o programa digita por você — e diz a quem recebe quem é você.',
        },
      ],
    },
    {
      code: 'AP044.7-L2',
      title: 'Escrevendo o aviso do acampamento',
      type: 'lab',
      content: '',
      requirementCodes: [
        'AP044-11.1', 'AP044-11.2', 'AP044-11.3', 'AP044-11.4', 'AP044-11.5',
        'AP044-11.6', 'AP044-11.7', 'AP044-11.8', 'AP044-11.9',
      ],
      labType: 'correio_completo',
    },
  ],
};
