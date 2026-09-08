import type { Module } from '../../types';

/*
 * AP043 módulo 2 — o requisito 3, que pede três coisas numa pergunta só: o que
 * backup significa, por que é importante, e como se fazia antes e como se faz
 * hoje.
 *
 * São duas lições porque são duas perguntas de natureza diferente. A primeira é
 * conceito, e o conceito tem uma armadilha específica: quase todo mundo acha
 * que já faz backup. Uma cópia na mesma pasta, um arquivo chamado
 * "trabalho_final_2.docx", a foto que ficou no celular — nada disso é backup,
 * porque tudo isso morre junto com o original. É essa distinção que a lição
 * persegue, e não a definição de dicionário.
 *
 * A segunda é história, e ela existe no requisito por um bom motivo: a lista de
 * mídias antigas explica por que gente mais velha guarda tudo em CD, e a lista
 * de hoje mostra que a escolha continua sendo entre as mesmas duas coisas —
 * alguma coisa física que se pega, ou alguma coisa que está longe.
 *
 * ── Nada de "faça backup toda semana" ────────────────────────────────────
 * Conselho que ninguém segue não ensina. O que a lição faz é a pergunta que
 * decide sozinha a frequência: quanto trabalho você aguenta refazer? Quem
 * responde "um dia" já sabe de quanto em quanto tempo precisa copiar.
 */

const conteudo_L1 = `
<h2 class="text-xl font-bold mb-3">Cópia que morre junto não é backup</h2>
<p class="mb-3"><strong>Backup</strong> é uma cópia de segurança: uma segunda
via dos seus arquivos, guardada em outro lugar, para o caso de o original se
perder.</p>
<p class="mb-3">A parte que quase todo mundo pula é <em>em outro lugar</em>. E
é ela que faz a diferença entre ter backup e achar que tem.</p>

<h3 class="font-bold mt-4 mb-2">O teste da pergunta única</h3>
<p class="mb-3">Para saber se aquilo é backup mesmo, faça uma pergunta:
<strong>se este computador sumisse agora, a cópia sumiria junto?</strong></p>
<ul class="list-disc list-inside mb-3 space-y-1">
  <li>Copiar o trabalho para outra pasta do mesmo computador — <strong>some junto</strong>.</li>
  <li>Salvar como "trabalho_v2" ao lado do original — <strong>some junto</strong>.</li>
  <li>Deixar as fotos só no celular — se o celular cair na água, <strong>somem junto</strong>.</li>
  <li>Copiar para um pen drive guardado na gaveta — <strong>sobrevive</strong>.</li>
  <li>Enviar para a nuvem — <strong>sobrevive</strong>.</li>
</ul>
<p class="mb-3">Cópia no mesmo lugar protege de um erro só: o de você mesmo
apagar o arquivo sem querer. Não protege de disco queimado, de computador
roubado, de raio, de vírus que embaralha tudo — que são justamente as coisas
que acontecem sem aviso.</p>

<h3 class="font-bold mt-4 mb-2">Por que isso importa mais do que parece</h3>
<p class="mb-3">Arquivo não avisa que vai sumir. Disco não fica lento antes de
morrer, computador não pisca antes de ser roubado, e o vírus que sequestra
arquivos faz o trabalho dele em minutos.</p>
<p class="mb-3">E o que se perde raramente é "um arquivo". É a única foto do
acampamento, é o trabalho de dois meses, é a lista de todos os desbravadores da
unidade com telefone dos pais. Coisas que não se refazem digitando mais rápido.</p>

<h3 class="font-bold mt-4 mb-2">De quanto em quanto tempo?</h3>
<p class="mb-3">Não existe resposta única, e "toda semana" é conselho que
ninguém segue. A resposta sai de uma pergunta sobre você:
<strong>quanto trabalho você aguenta refazer?</strong></p>
<p class="mb-3">Se a resposta for "um dia", copie todo dia. Se for "um mês",
copie todo mês. Se for "nenhum", então a cópia precisa acontecer sozinha, sem
depender de você lembrar.</p>

<div class="p-3 rounded-lg mt-4" style="background: rgba(234,179,8,.12)">
<p class="text-sm"><strong>Backup que ninguém testou não é backup.</strong>
Muita gente descobre que o pen drive estava com defeito no dia em que precisou
dele. Abrir um arquivo da cópia, de vez em quando, é o que transforma a
esperança em certeza.</p>
</div>
`;

const conteudo_L2 = `
<h2 class="text-xl font-bold mb-3">Como se fazia, e como se faz</h2>
<p class="mb-3">A ideia nunca mudou: pôr uma cópia em outro lugar. O que mudou
foi <em>onde</em> — e o tamanho do que cabia lá.</p>

<h3 class="font-bold mt-4 mb-2">Antigamente</h3>
<ul class="list-disc list-inside mb-3 space-y-1">
  <li><strong>Disquete</strong> — um quadrado de plástico rígido que cabia num bolso e guardava
  cerca de 1,4 MB. Uma foto de celular de hoje não caberia em nem um. Backup de um trabalho
  grande ocupava vários, numerados à mão com caneta.</li>
  <li><strong>Fita magnética</strong> — parecida com fita cassete, usada em empresas. Guardava muito
  para a época e era barata, mas para achar um arquivo no meio dela era preciso passar a fita
  inteira, como quem procura uma música na fita do carro.</li>
  <li><strong>CD e DVD graváveis</strong> — o backup doméstico dos anos 2000. O CD guardava cerca de
  700 MB e o DVD, 4,7 GB. Muitos só podiam ser gravados uma vez: se você errasse, o disco ia fora.</li>
  <li><strong>Impressão em papel</strong> — parece piada e não é. Documento importante era impresso e
  arquivado em pasta, porque papel não corrompe e não precisa de aparelho para ser lido.</li>
</ul>
<p class="mb-3">Repare no que todas têm em comum: alguém precisava lembrar de
fazer, pôr a mídia no aparelho, esperar, guardar num lugar seguro e escrever o
que era. Backup dava trabalho, e por isso quase ninguém fazia.</p>

<h3 class="font-bold mt-4 mb-2">Hoje</h3>
<ul class="list-disc list-inside mb-3 space-y-1">
  <li><strong>Pen drive</strong> — o disquete de hoje, com milhares de vezes mais espaço. Prático e
  fácil de perder.</li>
  <li><strong>HD externo ou SSD externo</strong> — o mais comum para copiar um computador inteiro.
  Liga no USB, copia, e volta para a gaveta.</li>
  <li><strong>Nuvem</strong> — Google Drive, OneDrive, iCloud e parecidos. O arquivo vai para o
  computador de uma empresa, longe do seu, e você o alcança de qualquer aparelho.</li>
  <li><strong>Cópia automática</strong> — o celular que manda cada foto para a nuvem sozinho, o
  sistema que copia a pasta de documentos todo dia. É a mudança que mais importa: o backup deixou
  de depender de alguém lembrar.</li>
</ul>

<h3 class="font-bold mt-4 mb-2">A escolha continua sendo a mesma</h3>
<p class="mb-3">No fundo há duas famílias, e as duas têm ponto fraco:</p>
<ul class="list-disc list-inside mb-3 space-y-1">
  <li><strong>Algo físico que você pega</strong> — funciona sem internet e é seu. Mas se estiver na
  mesma casa, o incêndio ou o ladrão levam os dois.</li>
  <li><strong>Algo longe, na nuvem</strong> — sobrevive a incêndio e a roubo. Mas depende de
  internet, de uma conta e de uma senha que você não pode perder.</li>
</ul>
<p class="mb-3">Quem leva a sério faz as duas: uma cópia perto, para pegar
rápido, e uma longe, para o dia ruim.</p>
`;

export const modulo2: Module = {
  code: 'AP043.2',
  title: 'A cópia que salva',
  description: 'O que é uma cópia de segurança de verdade, por que ela importa, e como se fazia antes e como se faz hoje.',
  lessons: [
    {
      code: 'AP043.2-L1',
      title: 'Cópia que morre junto não é backup',
      type: 'theory',
      content: conteudo_L1,
      requirementCodes: ['AP043-3.1'],
      questions: [
        {
          id: 'AP043.2-L1-Q1', type: 'multiple_choice',
          prompt: 'O que é backup?',
          data: { options: [
            { id: 'a', text: 'Uma cópia dos arquivos guardada em outro lugar, para o caso de o original se perder.', correct: true },
            { id: 'b', text: 'Um programa que recupera arquivos apagados por engano do computador.',
              porque: 'Programa de recuperação tenta resgatar o que já foi perdido. Backup é a cópia feita antes de perder.' },
            { id: 'c', text: 'Uma pasta escondida onde o sistema guarda tudo o que passou pela lixeira.',
              porque: 'A lixeira fica no mesmo computador e é esvaziada. Backup precisa estar fora dele.' },
            { id: 'd', text: 'Um jeito de comprimir os arquivos para que eles ocupem menos espaço no disco.',
              porque: 'Isso é compactação, que a Computação 2 ensinou. Ela reduz o tamanho, e não protege de perda.' },
          ]},
          explanation: 'A expressão que carrega o peso é "em outro lugar" — sem ela, é só uma segunda via.',
        },
        {
          id: 'AP043.2-L1-Q2', type: 'multiple_choice',
          prompt: 'Ana copiou o trabalho da escola para outra pasta do mesmo computador. Isso é backup?',
          data: { options: [
            { id: 'a', text: 'Não: se o computador se perder, as duas cópias se perdem juntas.', correct: true },
            { id: 'b', text: 'Sim, porque agora existem dois arquivos em vez de um só.',
              porque: 'Dois arquivos no mesmo lugar correm o mesmo risco. O que protege é a distância, e não a quantidade.' },
            { id: 'c', text: 'Sim, desde que a outra pasta esteja num disco diferente do mesmo computador.',
              porque: 'Ajuda contra disco queimado, mas roubo, raio e vírus continuam levando os dois.' },
            { id: 'd', text: 'Não, porque backup só vale se for feito em CD ou DVD gravável.',
              porque: 'A mídia não decide. Pen drive e nuvem são backup do mesmo jeito — o que decide é estar fora.' },
          ]},
          explanation: 'Faça sempre a pergunta: se este computador sumisse agora, a cópia sumiria junto?',
        },
        {
          id: 'AP043.2-L1-Q3', type: 'true_false',
          prompt: 'Deixar as fotos guardadas apenas no celular já conta como ter um backup delas.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', porque: 'É falso. Existe uma via só: se o celular cair na água, as fotos vão junto.' },
            { id: 'b', text: 'Falso', correct: true },
          ]},
          explanation: 'Uma via só nunca é backup, esteja ela onde estiver.',
        },
        {
          id: 'AP043.2-L1-Q4', type: 'multiple_choice',
          prompt: 'Qual pergunta ajuda a decidir de quanto em quanto tempo fazer backup?',
          data: { options: [
            { id: 'a', text: 'Quanto trabalho eu aguento refazer se perder tudo agora?', correct: true },
            { id: 'b', text: 'Quantos gigabytes de espaço livre ainda restam no meu pen drive?',
              porque: 'O espaço decide onde cabe a cópia, e não com que frequência ela precisa acontecer.' },
            { id: 'c', text: 'Quantas horas por dia eu costumo deixar o computador ligado?',
              porque: 'Tempo ligado não mede o que se perde. O que mede é o trabalho acumulado desde a última cópia.' },
            { id: 'd', text: 'Qual é a idade do computador e quanto tempo falta para a garantia acabar?',
              porque: 'Computador novo também é roubado e também pega vírus. Idade não protege ninguém.' },
          ]},
          explanation: 'Quem responde "um dia" copia todo dia. É a resposta que decide a frequência.',
        },
        {
          id: 'AP043.2-L1-Q5', type: 'multiple_choice',
          prompt: 'Por que vale a pena abrir de vez em quando um arquivo do backup?',
          data: { options: [
            { id: 'a', text: 'Para descobrir agora, e não no dia da emergência, se a cópia está boa.', correct: true },
            { id: 'b', text: 'Para que o pen drive não desligue sozinho por ficar muito tempo parado.',
              porque: 'Pen drive parado não se apaga por falta de uso. O risco é ele estar com defeito sem ninguém saber.' },
            { id: 'c', text: 'Para que o sistema atualize a data do arquivo e o backup continue valendo.',
              porque: 'A data do arquivo não vence. O que se testa é se ele ainda abre.' },
            { id: 'd', text: 'Para liberar espaço, já que arquivos abertos ocupam menos que arquivos fechados.',
              porque: 'Abrir um arquivo não muda o tamanho dele. O motivo do teste é outro: conferir se a cópia presta.' },
          ]},
          explanation: 'Muita gente descobre que a mídia estava com defeito justamente no dia em que precisou dela.',
        },
      ],
    },
    {
      code: 'AP043.2-L2',
      title: 'Do disquete à nuvem',
      type: 'theory',
      content: conteudo_L2,
      requirementCodes: ['AP043-3.1'],
      questions: [
        {
          id: 'AP043.2-L2-Q1', type: 'ordering',
          prompt: 'Ponha as mídias de backup na ordem em que se tornaram comuns, da mais antiga para a mais recente.',
          data: { items: [
            { id: 'i1', text: 'Disquete', order: 1 },
            { id: 'i2', text: 'CD gravável', order: 2 },
            { id: 'i3', text: 'Pen drive', order: 3 },
            { id: 'i4', text: 'Nuvem', order: 4 },
          ]},
          explanation: 'A ideia é a mesma desde o disquete: pôr uma cópia em outro lugar. O que mudou foi o lugar.',
        },
        {
          id: 'AP043.2-L2-Q2', type: 'multiple_choice',
          prompt: 'Por que empresas usavam fita magnética para backup?',
          data: { options: [
            { id: 'a', text: 'Porque guardava muito para a época e custava barato.', correct: true },
            { id: 'b', text: 'Porque era a única mídia que permitia achar qualquer arquivo instantaneamente.',
              porque: 'É o contrário: para achar um arquivo no meio da fita era preciso passar a fita inteira.' },
            { id: 'c', text: 'Porque a fita podia ser lida em qualquer aparelho de som comum da empresa.',
              porque: 'Ela se parece com fita cassete, mas exigia um leitor próprio, de computador.' },
            { id: 'd', text: 'Porque a fita não se estraga com o tempo, ao contrário de todas as outras mídias.',
              porque: 'Fita magnética se deteriora como qualquer mídia. Nenhuma dura para sempre.' },
          ]},
          explanation: 'Capacidade e preço compensavam a lentidão — que era o preço que se pagava.',
        },
        {
          id: 'AP043.2-L2-Q3', type: 'multiple_choice',
          prompt: 'Qual é o ponto fraco de guardar o backup na nuvem?',
          data: { options: [
            { id: 'a', text: 'Depende de internet, de uma conta e de uma senha que não se pode perder.', correct: true },
            { id: 'b', text: 'A cópia se perde junto com o computador se ele for roubado ou queimar.',
              porque: 'Esse é justamente o ponto forte dela: os arquivos estão longe da sua casa.' },
            { id: 'c', text: 'Os arquivos precisam ser enviados de novo toda vez que o computador é ligado.',
              porque: 'O envio acontece uma vez por arquivo, e depois só o que muda sobe de novo.' },
            { id: 'd', text: 'Só cabem arquivos pequenos, porque a nuvem não aceita foto nem vídeo.',
              porque: 'Foto e vídeo são justamente o que mais gente guarda na nuvem hoje.' },
          ]},
          explanation: 'Cada família tem o seu ponto fraco. Por isso quem leva a sério mantém uma cópia perto e uma longe.',
        },
        {
          id: 'AP043.2-L2-Q4', type: 'true_false',
          prompt: 'Um pen drive guardado na mesma casa protege contra disco queimado, mas não contra um incêndio.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', correct: true },
            { id: 'b', text: 'Falso', porque: 'É verdadeiro. Ele salva o arquivo de um disco que morreu, e queima junto com a casa.' },
          ]},
          explanation: 'Protege contra disco queimado e contra apagar sem querer. Contra o que atinge a casa inteira, não.',
        },
        {
          id: 'AP043.2-L2-Q5', type: 'multiple_choice',
          prompt: 'Qual foi a maior mudança do backup de hoje em relação ao de antigamente?',
          data: { options: [
            { id: 'a', text: 'Ele pode acontecer sozinho, sem depender de alguém lembrar de fazer.', correct: true },
            { id: 'b', text: 'Ele deixou de ser necessário, porque os arquivos de hoje não se perdem mais.',
              porque: 'Perdem-se do mesmo jeito, e agora há mais coisa a perder. Só o modo de copiar melhorou.' },
            { id: 'c', text: 'Passou a ser feito só por empresas, já que em casa a nuvem faz tudo sozinha.',
              porque: 'A nuvem serve a qualquer pessoa, e continua sendo escolha de quem usa o computador.' },
            { id: 'd', text: 'A cópia virou instantânea, e não leva mais tempo nenhum para ser concluída.',
              porque: 'Enviar arquivo grande continua levando tempo, ainda mais pela internet.' },
          ]},
          explanation: 'Backup dava trabalho, e por isso quase ninguém fazia. Quando ele deixou de pedir memória humana, passou a acontecer.',
        },
      ],
    },
  ],
};
