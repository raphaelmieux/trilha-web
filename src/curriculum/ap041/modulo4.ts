import type { Module } from '../../types';

/*
 * AP041 módulo 4 — os três cuidados do requisito 3.
 *
 * O documento pede "apresentar ao examinador" como proteger da sujeira, o que é
 * manutenção preventiva e como ligar e desligar corretamente. Apresentar se faz
 * no laboratório, que vem depois; esta lição é o que a pessoa precisa saber para
 * ter o que apresentar.
 *
 * O foco é o porquê, não a lista. "Não coma perto do computador" decorado dura
 * até a próxima fome; entender que a migalha entra entre as teclas, junta poeira
 * e trava a tecla é o que faz o desbravador levantar e ir comer na cozinha.
 */

const conteudo_L1 = `
<h2 class="text-xl font-bold mb-3">Um computador dura o quanto cuidam dele</h2>
<p class="mb-3">Computador não estraga de repente. Quase sempre ele avisa, e
quase sempre o que o matou foi uma coisa pequena repetida por muito tempo:
poeira, calor, um desligamento errado atrás do outro.</p>

<h3 class="font-bold mt-4 mb-2">A sujeira: o inimigo mais paciente</h3>
<p class="mb-3">Todo computador tem saídas de ar, e um ventilador que empurra o ar
quente para fora. A <strong>poeira entope essas saídas</strong>. Sem ar, o calor
fica preso lá dentro, e calor é o que mais estraga peça eletrônica.</p>
<p class="mb-3">Migalha é pior que poeira: cai entre as teclas, junta sujeira e
trava a tecla. E líquido derrubado no teclado costuma ser o fim dele — por isso
comer e beber é na cozinha, não na frente da máquina.</p>
<p class="mb-3">Para limpar, o computador precisa estar <strong>desligado</strong>.
Pano seco e macio, e nunca o produto de limpeza direto na tela: molha-se o pano,
não o aparelho.</p>
<p class="mb-3">Onde a máquina fica também conta. Computador no chão engole
poeira e pelo de bicho; encostado na parede, não tem por onde soltar o ar quente.
E notebook em cima da cama, do sofá ou do travesseiro é o erro mais comum de
todos: <strong>as saídas de ar dele ficam embaixo</strong>, e o tecido tapa
todas de uma vez. Mesa, ou qualquer superfície dura e plana.</p>

<h3 class="font-bold mt-4 mb-2">Manutenção preventiva: cuidar antes de quebrar</h3>
<p class="mb-3"><strong>Manutenção preventiva</strong> é o que se faz enquanto
está tudo bem, para não quebrar depois. É o contrário da corretiva, que é
consertar o que já parou.</p>
<p class="mb-3">É a mesma ideia de escovar os dentes: ninguém escova porque está
doendo, escova para não doer. No computador, isso quer dizer:</p>
<ul class="mb-3 ml-5 list-disc space-y-1">
  <li>tirar a poeira de tempos em tempos;</li>
  <li>manter o sistema e o antivírus atualizados;</li>
  <li>apagar o que não usa mais, para não lotar o disco;</li>
  <li>fazer <strong>cópia de segurança</strong> dos arquivos importantes.</li>
</ul>
<p class="mb-3">A cópia de segurança é a que mais salva. Peça quebrada se compra
outra; trabalho de escola de três meses, não.</p>

<h3 class="font-bold mt-4 mb-2">Ligar e desligar do jeito certo</h3>
<p class="mb-3">Para ligar, aperte o botão <strong>uma vez</strong> e espere.
Apertar de novo porque "demorou" costuma desligar a máquina no meio da
inicialização.</p>
<p class="mb-3">Para desligar, use o <strong>menu do sistema</strong>, na opção
Desligar. Isso não é frescura: o sistema precisa fechar os arquivos que estão
abertos e gravar no disco o que ainda estava na memória RAM. Cortar a energia no
meio disso pode corromper o arquivo — e a RAM, você já sabe, esvazia sozinha.</p>
<p class="mb-3">Por isso <strong>não se desliga pela tomada</strong>, nem
segurando o botão. Segurar o botão é recurso de emergência, para quando a máquina
travou e não responde mais a nada.</p>
<p class="mb-3">E nunca desligue durante uma atualização: é o momento em que o
sistema está sendo reescrito, e interromper ali pode deixar o computador sem
conseguir ligar de novo.</p>

<div class="p-3 rounded-lg mb-3" style="background-color: var(--color-secondary-a08); border: 1px solid var(--color-secondary-a20)">
  <p><strong>Os três de uma vez:</strong> deixe o ar passar, cuide antes de
  quebrar, e dê ao sistema o tempo de se despedir.</p>
</div>
`;

export const modulo4: Module = {
  code: 'AP041.4',
  title: 'Cuidar da máquina',
  description: 'Sujeira, manutenção preventiva e o jeito certo de ligar e desligar.',
  lessons: [
    {
      code: 'AP041.4-L1',
      title: 'Cuidados que fazem o computador durar',
      type: 'theory',
      content: conteudo_L1,
      requirementCodes: ['AP041-3.1', 'AP041-3.2', 'AP041-3.3'],
      questions: [
        {
          id: 'AP041.4-L1-Q1', type: 'multiple_choice',
          prompt: 'Por que a poeira faz mal ao computador?',
          data: { options: [
            { id: 'a', text: 'Ela deixa a tela suja e atrapalha quem está olhando nela.',
              porque: 'Isso incomoda, mas não estraga. O problema sério é a poeira que entra e bloqueia o ar.' },
            { id: 'b', text: 'Ela entope as saídas de ar, e a máquina esquenta demais.', correct: true },
            { id: 'c', text: 'Ela apaga os arquivos que estavam guardados no disco rígido.',
              porque: 'Poeira não apaga arquivo. O estrago dela é o calor, que danifica as peças.' },
            { id: 'd', text: 'Ela deixa a internet mais lenta por atrapalhar o sinal do Wi-Fi.',
              porque: 'Poeira não tem efeito sobre o sinal. O que ela atrapalha é a ventilação.' },
          ]},
          explanation: 'Sem ar saindo, o calor fica preso — e calor é o que mais estraga peça eletrônica.',
        },
        {
          id: 'AP041.4-L1-Q2', type: 'multiple_choice',
          prompt: 'O que é manutenção preventiva?',
          data: { options: [
            { id: 'a', text: 'Cuidar da máquina antes que ela dê problema.', correct: true },
            { id: 'b', text: 'Consertar o computador logo depois que ele para de funcionar.',
              porque: 'Isso é manutenção corretiva. Preventiva é o que se faz antes, para não quebrar.' },
            { id: 'c', text: 'Trocar as peças velhas por peças novas uma vez por ano.',
              porque: 'Trocar peça boa é desperdício. Prevenir é limpar, atualizar e fazer cópia.' },
            { id: 'd', text: 'Chamar um técnico sempre que aparecer algo estranho na tela.',
              porque: 'Chamar ajuda é bom, mas é reação. Prevenção acontece quando ainda está tudo bem.' },
          ]},
          explanation: 'É a mesma ideia de escovar os dentes: ninguém escova porque está doendo, escova para não doer.',
        },
        {
          id: 'AP041.4-L1-Q3', type: 'multiple_choice',
          prompt: 'Qual é o jeito certo de desligar o computador?',
          data: { options: [
            { id: 'a', text: 'Segurando o botão de ligar até a tela apagar de uma vez.',
              porque: 'Isso corta a energia na força. Só serve quando a máquina travou e não responde mais.' },
            { id: 'b', text: 'Tirando o cabo da tomada assim que terminar de usar o computador.',
              porque: 'É o pior jeito: o sistema não fecha os arquivos, e trabalho salvo pode se perder.' },
            { id: 'c', text: 'Pelo menu do sistema, na opção Desligar, e esperando ele apagar.', correct: true },
            { id: 'd', text: 'Fechando a tampa do notebook e guardando ele dentro da mochila.',
              porque: 'Fechar a tampa costuma suspender, não desligar — e ele segue ligado na mochila, sem ar.' },
          ]},
          explanation: 'O sistema precisa fechar os arquivos abertos e gravar no disco o que ainda estava na RAM.',
        },
        {
          id: 'AP041.4-L1-Q4', type: 'true_false',
          prompt: 'Desligar o computador tirando o cabo da tomada é rápido e não faz mal nenhum.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro',
              porque: 'Faz mal. O sistema não chega a fechar os arquivos abertos, e o que estava sendo gravado pode se corromper.' },
            { id: 'b', text: 'Falso', correct: true },
          ]},
          explanation: 'Cortar a energia no meio de uma gravação é como arrancar a folha da mão de quem ainda está escrevendo.',
        },
        {
          id: 'AP041.4-L1-Q5', type: 'scenario',
          prompt: 'O João vai lanchar enquanto joga no computador da família. O que ele deve fazer?',
          data: { scenarios: [
            { id: 'a', text: 'Comer em cima do teclado mesmo, tomando cuidado para não derrubar nada.',
              porque: 'Cuidado não basta: migalha cai sem a gente ver, e um copo derrubado acaba com o teclado.' },
            { id: 'b', text: 'Comer longe do computador, porque migalha e líquido estragam o teclado.', correct: true },
            { id: 'c', text: 'Comer perto, desde que limpe o teclado com um pano molhado depois.',
              porque: 'Pano molhado em teclado é outro problema. Melhor não deixar a sujeira chegar lá.' },
            { id: 'd', text: 'Comer perto, porque só bebida faz mal, e comida seca não atrapalha nada.',
              porque: 'Migalha entra entre as teclas, junta poeira e trava a tecla. Comida seca também estraga.' },
          ]},
          explanation: 'Comer e beber é na cozinha. O teclado não tem conserto barato depois do suco derrubado.',
        },
        {
          id: 'AP041.4-L1-Q6', type: 'matching',
          prompt: 'Ligue cada cuidado ao motivo dele.',
          data: { pairs: [
            { left: 'Tirar a poeira', right: 'Deixa o ar circular e a máquina não esquentar' },
            { left: 'Fazer cópia de segurança', right: 'Garante que nada se perde se der problema' },
            { left: 'Desligar pelo menu', right: 'Deixa o sistema fechar tudo antes de apagar' },
            { left: 'Não comer perto', right: 'Evita migalha e líquido dentro do teclado' },
          ]},
          explanation: 'Deixe o ar passar, cuide antes de quebrar, e dê ao sistema o tempo de se despedir.',
        },
        {
          id: 'AP041.4-L1-Q7', type: 'scenario',
          prompt: 'O Davi assiste a vídeos com o notebook em cima da cama, apoiado no edredom. Ele reclama que o aparelho esquenta muito. Por quê?',
          data: { scenarios: [
            { id: 'a', text: 'Porque as saídas de ar ficam embaixo, e o edredom tapa elas.', correct: true },
            { id: 'b', text: 'Porque o quarto é mais quente que a sala onde ele costuma ficar.',
              porque: 'A temperatura do quarto ajuda pouco. O que prende o calor é o ar que não consegue sair.' },
            { id: 'c', text: 'Porque assistir a vídeo é o que mais esquenta qualquer computador.',
              porque: 'Vídeo dá trabalho à máquina, mas na mesa ela daria conta. O problema é a ventilação.' },
            { id: 'd', text: 'Porque a bateria esquenta sempre que o aparelho fica sem tomada.',
              porque: 'A bateria esquenta um pouco, e esquentaria igual na mesa. O tecido é que muda tudo.' },
          ]},
          explanation: 'Mesa, chão de madeira, uma tábua — qualquer superfície dura e plana resolve. O que não pode é tecido tapando a saída do ar.',
        },
        {
          id: 'AP041.4-L1-Q8', type: 'ordering',
          prompt: 'Ordene os passos de desligar o computador do jeito certo.',
          data: {
            items: [
              { id: 'a', text: 'Salvar o que estava fazendo e fechar os programas', order: 1 },
              { id: 'b', text: 'Abrir o menu do sistema e escolher Desligar', order: 2 },
              { id: 'c', text: 'Esperar a tela apagar sozinha, sem apertar nada', order: 3 },
              { id: 'd', text: 'Só então, se for preciso, tirar da tomada', order: 4 },
            ],
          },
          explanation: 'Cada passo dá tempo ao seguinte. Pular um é pedir que o sistema pare no meio de uma gravação.',
        },
        {
          id: 'AP041.4-L1-Q9', type: 'multiple_choice',
          prompt: 'Por que não se pode desligar o computador durante uma atualização?',
          data: { options: [
            { id: 'a', text: 'Porque o sistema está sendo reescrito e pode ficar pela metade.', correct: true },
            { id: 'b', text: 'Porque a atualização precisa ser paga de novo se for interrompida.',
              porque: 'Atualização do sistema não se paga por tentativa. O risco é outro, e é bem pior.' },
            { id: 'c', text: 'Porque a máquina fica mais lenta por alguns dias depois disso.',
              porque: 'O estrago não é lentidão passageira: o computador pode não conseguir ligar de novo.' },
            { id: 'd', text: 'Porque os arquivos pessoais são apagados quando isso acontece.',
              porque: 'Os arquivos costumam continuar lá. Quem fica quebrado é o sistema que os abre.' },
          ]},
          explanation: 'É como arrancar as páginas de um livro enquanto alguém troca o miolo: o que fica não serve mais para ler.',
        },
        {
          id: 'AP041.4-L1-Q10', type: 'scenario',
          prompt: 'O computador da Rita queimou e não liga mais. Ela tinha cópia dos arquivos numa nuvem. O que ela perdeu?',
          data: { scenarios: [
            { id: 'a', text: 'A máquina, que terá de ser consertada ou trocada por outra.', correct: true },
            { id: 'b', text: 'Tudo, porque arquivo copiado some junto com o computador de origem.',
              porque: 'A cópia fica em outro lugar. É exatamente para isso que ela existe.' },
            { id: 'c', text: 'Só as fotos, porque cópia de segurança guarda apenas documentos.',
              porque: 'A cópia guarda o que você mandar guardar, incluindo foto, vídeo e trabalho de escola.' },
            { id: 'd', text: 'Nada, porque o computador volta a ligar assim que a cópia for baixada.',
              porque: 'A cópia salva os arquivos, não a peça queimada. A máquina continua precisando de conserto.' },
          ]},
          explanation: 'Peça quebrada se compra outra; três meses de trabalho de escola, não. É por isso que a cópia é o cuidado que mais salva.',
        },
      ],
    },
    {
      code: 'AP041.4-L2',
      title: 'Cuidando do computador',
      type: 'lab',
      content: '',
      requirementCodes: ['AP041-3.1', 'AP041-3.2', 'AP041-3.3'],
      labType: 'computer_care',
    },
  ],
};
