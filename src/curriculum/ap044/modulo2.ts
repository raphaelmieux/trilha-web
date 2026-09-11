import type { Module } from '../../types';

/*
 * AP044 módulo 2 — os requisitos 3, 4 e 5, que são um assunto só.
 *
 * O que é a internet, o que vem junto com ela, e sair para usá-la. Separados
 * dariam dois módulos de uma pergunta cada e um laboratório sem contexto.
 *
 * ── Vírus, e o que a AP042 já disse ──────────────────────────────────────
 * A AP042 tem um laboratório de ameaças e ensina a reconhecer golpe: link
 * estranho, anexo que é programa, mensagem que apressa. Repetir isso aqui
 * seria dar a mesma lição duas vezes com outro nome.
 *
 * O que muda é a pergunta. Lá era "isto é golpe?"; aqui é "o que é um vírus, e
 * por que ele consegue entrar". A resposta trata da **infecção**: o programa
 * que se copia, o que ele faz depois de dentro, e por que antivírus atualizado
 * e sistema atualizado são duas coisas diferentes — a segunda tapa o buraco, a
 * primeira só reconhece quem já entrou por ele.
 *
 * ── A internet, sem a metáfora da nuvem ──────────────────────────────────
 * "A internet é uma nuvem onde ficam as coisas" é o que quase todo material
 * infantil diz, e é o que faz o desbravador achar que o arquivo dele paira no
 * ar. A internet são cabos, e a maior parte deles está no fundo do mar. O
 * arquivo está num computador de alguém, num prédio que existe, num país que
 * dá para apontar no mapa. Isso muda o que ele entende por privacidade.
 */

const conteudo_L1 = `
<h2 class="text-xl font-bold mb-3">A internet é feita de cabo</h2>
<p class="mb-3">A internet costuma ser desenhada como uma nuvem. É um desenho
ruim, e ele atrapalha: dá a impressão de que as coisas ficam pairando no ar,
sem lugar nenhum.</p>
<p class="mb-3">A internet é o contrário disso. Ela é uma <strong>rede de
computadores ligados por cabo</strong> — e a maior parte dos cabos que ligam um
continente a outro passa pelo <strong>fundo do mar</strong>. São cabos de
verdade, com navios que os instalam e navios que os consertam quando um se
rompe.</p>

<h3 class="font-bold mt-4 mb-2">O que acontece quando você abre uma página</h3>
<p class="mb-3">Seu celular pergunta a um computador que está em outro lugar, e
esse computador responde. Só isso, repetido bilhões de vezes por segundo.</p>
<ul class="list-disc pl-5 mb-3 space-y-1">
<li>O pedido sai do celular e vai até o roteador da casa.</li>
<li>Do roteador vai para a operadora.</li>
<li>Da operadora atravessa cabos até chegar ao computador que guarda o site —
o <strong>servidor</strong>.</li>
<li>O servidor devolve a página pelo mesmo caminho, de volta.</li>
</ul>
<p class="mb-3">Esse computador que guarda o site fica num prédio, num país que
dá para apontar no mapa. Quando você põe uma foto na internet, ela vai para um
computador de alguém. Não paira no ar — e é por isso que "apagar" nem sempre
apaga.</p>

<h3 class="font-bold mt-4 mb-2">O que ela mudou na vida de todo mundo</h3>
<p class="mb-3">A internet não inventou nada disso do zero: ela tirou a
distância e o horário do caminho.</p>
<ul class="list-disc pl-5 mb-3 space-y-1">
<li><strong>Falar</strong> — antes era carta ou telefone caro. Hoje o clube
combina o acampamento inteiro num grupo de mensagens.</li>
<li><strong>Aprender</strong> — antes dependia de ter a enciclopédia em casa.
Hoje uma aula de qualquer assunto está a uma busca de distância.</li>
<li><strong>Trabalhar e estudar</strong> — sem sair de casa, com a aula do
outro lado do país.</li>
<li><strong>Comprar e pagar</strong> — o boleto, o Pix, a inscrição do
acampamento.</li>
</ul>
<p class="mb-3">E o que ela cobra em troca: o que se publica fica; a distração
está sempre à mão; e quem não sabe distinguir informação boa de ruim é levado
pela primeira que aparecer.</p>

<div class="p-3 rounded-lg mt-4" style="background: rgba(59,130,246,.12)">
<p class="text-sm"><strong>A frase que vale guardar:</strong> a internet não é
um lugar, é um caminho. As coisas continuam guardadas em computadores — só que
agora em computadores de outras pessoas.</p>
</div>
`;

const conteudo_L2 = `
<h2 class="text-xl font-bold mb-3">O que é um vírus de computador</h2>
<p class="mb-3">Vírus é um <strong>programa</strong>. Não é magia, não é fumaça
e não é a máquina "ficando velha": é um programa que alguém escreveu, que entrou
na máquina e que está rodando ali.</p>
<p class="mb-3">O nome veio da biologia por causa de uma característica: ele
<strong>se copia</strong>. Um vírus de verdade se espalha de célula em célula;
o de computador se espalha de arquivo em arquivo, de pendrive em pendrive, de
mensagem em mensagem.</p>

<h3 class="font-bold mt-4 mb-2">O que ele faz depois de entrar</h3>
<ul class="list-disc pl-5 mb-3 space-y-1">
<li><strong>Rouba</strong> — senha digitada, foto guardada, conversa.</li>
<li><strong>Sequestra</strong> — embaralha seus arquivos e pede dinheiro para
devolvê-los. É o que se chama de <em>resgate</em>.</li>
<li><strong>Usa a sua máquina</strong> — ela passa a trabalhar de graça para
outra pessoa, e o que você percebe é lentidão.</li>
<li><strong>Se espalha</strong> — manda mensagem para os seus contatos, em seu
nome. É por isso que golpe costuma chegar de quem você conhece.</li>
</ul>

<h3 class="font-bold mt-4 mb-2">Por dentro de que porta ele entra</h3>
<p class="mb-3">Quase sempre por uma destas quatro:</p>
<ul class="list-disc pl-5 mb-3 space-y-1">
<li>Um <strong>anexo</strong> que parece documento e é programa — o famoso
arquivo terminado em <code>.pdf.exe</code>.</li>
<li>Um <strong>programa pirata</strong>, baixado de um site qualquer.</li>
<li>Um <strong>pendrive</strong> que passou por muitos computadores.</li>
<li>Um <strong>buraco</strong> no sistema ou no navegador que nunca foi
tapado.</li>
</ul>

<h3 class="font-bold mt-4 mb-2">As duas proteções, e por que são duas</h3>
<p class="mb-3">Muita gente acha que antivírus é a proteção inteira. Não é —
são duas coisas, e elas fazem trabalhos diferentes:</p>
<ul class="list-disc pl-5 mb-3 space-y-1">
<li><strong>Manter o sistema atualizado</strong> tapa o buraco por onde o vírus
entraria. Atualização é chata, e é a que mais protege.</li>
<li><strong>Antivírus atualizado</strong> reconhece quem tentou entrar. Ele
trabalha com uma lista do que já se conhece — por isso precisa de atualização
também, e por isso ele não vê o que é novo demais.</li>
</ul>
<p class="mb-3">E há a terceira, que não é programa nenhum: <strong>desconfiar
do anexo e do link</strong>, e ter <strong>cópia de segurança</strong>. Contra
sequestro de arquivos, o backup é a única defesa que funciona depois do
estrago.</p>

<div class="p-3 rounded-lg mt-4" style="background: rgba(234,179,8,.12)">
<p class="text-sm"><strong>Cuidado com a conclusão fácil:</strong> "tenho
antivírus, então estou protegido" é falso do mesmo jeito que "tenho cinto,
então posso correr". As duas coisas reduzem o estrago; nenhuma das duas
autoriza o risco.</p>
</div>
`;

const conteudo_L3 = `
<h2 class="text-xl font-bold mb-3">Cinco sites que ensinam alguma coisa</h2>
<p class="mb-3">O requisito pede acessar cinco sites com conteúdo educativo e
descrever o que cada um tem. Parece a tarefa mais simples da trilha, e é a que
mais gente faz mal — porque descrever não é copiar o nome do site.</p>
<p class="mb-3">Descrever é responder três coisas: <strong>de que assunto ele
trata</strong>, <strong>para quem ele serve</strong> e <strong>o que dá para
fazer nele</strong> que não dá em outro. Um site de vídeos de matemática e uma
enciclopédia tratam de assuntos parecidos e servem para coisas diferentes.</p>
<p class="mb-3">No laboratório você vai abrir os cinco, olhar a primeira página
de cada um e escrever a descrição. Os endereços são seus — escolha sites que
você usaria de verdade, e não os cinco primeiros que aparecerem.</p>
`;

export const modulo2: Module = {
  code: 'AP044.2',
  title: 'A internet, os vírus e cinco sites',
  description: 'O que é a rede e o que ela mudou; o que é um vírus e como não pegar um; e sair para descrever cinco sites que ensinam.',
  lessons: [
    {
      code: 'AP044.2-L1',
      title: 'O que é a internet',
      type: 'theory',
      content: conteudo_L1,
      requirementCodes: ['AP044-4.1'],
      perguntas: 5,
      questions: [
        {
          id: 'AP044.2-L1-Q1', type: 'multiple_choice',
          prompt: 'O que é a internet?',
          data: { options: [
            { id: 'a', text: 'Uma rede de computadores ligados entre si, em boa parte por cabos.', correct: true },
            { id: 'b', text: 'Um espaço na nuvem onde os arquivos das pessoas ficam guardados.',
              porque: 'Nuvem é um desenho, não um lugar: os arquivos estão em computadores de outras pessoas.' },
            { id: 'c', text: 'Um programa que vem instalado no celular e permite abrir páginas.',
              porque: 'Isso é o navegador. Ele é o programa que usa a internet, e não a internet.' },
            { id: 'd', text: 'O sinal de antena que as operadoras transmitem para os aparelhos.',
              porque: 'A antena é o último trecho do caminho. A rede continua por cabo até o computador que responde.' },
          ]},
          explanation: 'Computadores ligados a computadores. A maior parte dos cabos entre continentes está no fundo do mar.',
        },
        {
          id: 'AP044.2-L1-Q2', type: 'ordering',
          prompt: 'Você abre uma página no celular. Ponha em ordem o caminho que o pedido faz.',
          data: { items: [
            { id: 'i1', text: 'O pedido sai do celular', order: 1 },
            { id: 'i2', text: 'Chega ao roteador da casa', order: 2 },
            { id: 'i3', text: 'Vai para a operadora', order: 3 },
            { id: 'i4', text: 'Atravessa os cabos até o servidor do site', order: 4 },
            { id: 'i5', text: 'O servidor devolve a página pelo mesmo caminho', order: 5 },
          ]},
          explanation: 'Pergunta e resposta, ida e volta. É esse caminho que existe por trás de cada página que abre.',
        },
        {
          id: 'AP044.2-L1-Q3', type: 'multiple_choice',
          prompt: 'Por que dizer que a foto publicada "fica na nuvem" atrapalha o entendimento?',
          data: { options: [
            { id: 'a', text: 'Porque ela está num computador de alguém, num prédio que existe no mapa.', correct: true },
            { id: 'b', text: 'Porque a palavra nuvem é usada só por empresas grandes e confunde quem é novo.',
              porque: 'O problema não é quem usa a palavra: é a ideia de que o arquivo não está em lugar nenhum.' },
            { id: 'c', text: 'Porque a foto na verdade continua apenas no celular de quem publicou.',
              porque: 'Ao publicar, ela é copiada para o servidor — passa a existir também lá.' },
            { id: 'd', text: 'Porque nuvem é um termo técnico que significa outra coisa completamente diferente.',
              porque: 'O termo existe e é usado assim mesmo; o que engana é a imagem de algo pairando no ar.' },
          ]},
          explanation: 'Se está num computador de alguém, apagar do seu aparelho não apaga de lá.',
        },
        {
          id: 'AP044.2-L1-Q4', type: 'true_false',
          prompt: 'A maior parte dos cabos que ligam a internet entre continentes passa pelo fundo do mar.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', correct: true },
            { id: 'b', text: 'Falso', porque: 'É verdadeiro: são cabos submarinos, instalados e consertados por navios.' },
          ]},
          explanation: 'Satélite existe, mas leva uma fração pequena do tráfego. O grosso vai por cabo.',
        },
        {
          id: 'AP044.2-L1-Q5', type: 'multiple_choice',
          prompt: 'Qual destas é uma mudança que a internet trouxe, e não uma coisa que ela criou do nada?',
          data: { options: [
            { id: 'a', text: 'Falar com quem está longe, que já existia por carta e telefone.', correct: true },
            { id: 'b', text: 'A escrita, que antes da internet não podia ser transmitida a distância.',
              porque: 'Carta e telegrama transmitiam escrita a distância muito antes da internet.' },
            { id: 'c', text: 'O comércio, que só passou a existir quando surgiram as lojas na internet.',
              porque: 'Comércio é milenar. O que a internet mudou foi onde e quando ele acontece.' },
            { id: 'd', text: 'A fotografia, que antes não podia ser copiada nem enviada a outra pessoa.',
              porque: 'Foto se copiava e se enviava pelo correio. O que mudou foi o custo e a velocidade.' },
          ]},
          explanation: 'Ela tirou a distância e o horário do caminho. Quase tudo o mais já existia.',
        },
        {
          id: 'AP044.2-L1-Q6', type: 'multiple_choice',
          prompt: 'O que é um servidor?',
          data: { options: [
            { id: 'a', text: 'O computador que guarda o site e responde ao pedido de quem o abre.', correct: true },
            { id: 'b', text: 'A empresa que vende o acesso à internet para as casas de um bairro.',
              porque: 'Essa é a operadora ou provedor. O servidor é a máquina do outro lado que responde.' },
            { id: 'c', text: 'O aparelho da casa que distribui o sinal sem fio para os celulares.',
              porque: 'Esse é o roteador, e ele fica no começo do caminho, não no fim.' },
            { id: 'd', text: 'O programa que o navegador usa para desenhar a página na tela.',
              porque: 'Quem desenha a página é o próprio navegador, com o que recebeu do servidor.' },
          ]},
          explanation: 'É uma máquina, num prédio, que existe para responder a pedidos.',
        },
        {
          id: 'AP044.2-L1-Q7', type: 'multiple_choice',
          prompt: 'Qual é o preço que a internet cobra, e que vale conhecer antes de publicar?',
          data: { options: [
            { id: 'a', text: 'O que se publica fica, mesmo depois de apagado do próprio aparelho.', correct: true },
            { id: 'b', text: 'Que cada publicação consome parte do pacote de dados de quem a vê.',
              porque: 'Consome, mas isso é custo de quem acessa, e não o que torna publicar uma decisão séria.' },
            { id: 'c', text: 'Que o site cobra uma taxa por cada foto guardada além do limite gratuito.',
              porque: 'Alguns cobram armazenamento, mas isso é comercial: não é o que muda ao publicar.' },
            { id: 'd', text: 'Que o computador fica mais lento a cada arquivo enviado para a internet.',
              porque: 'Enviar não deixa a máquina lenta depois. O arquivo sai e a máquina segue igual.' },
          ]},
          explanation: 'Copiado por outra pessoa, guardado por um serviço, achado numa busca antiga — sai do seu controle.',
        },
        {
          id: 'AP044.2-L1-Q8', type: 'true_false',
          prompt: 'A internet e o navegador são a mesma coisa.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', porque: 'É falso: a internet é a rede; o navegador é um dos programas que a usam, como o de mensagens.' },
            { id: 'b', text: 'Falso', correct: true },
          ]},
          explanation: 'O aplicativo de mensagens também usa a internet, e não é navegador nenhum.',
        },
      ],
    },
    {
      code: 'AP044.2-L2',
      title: 'Vírus, e as duas proteções',
      type: 'theory',
      content: conteudo_L2,
      requirementCodes: ['AP044-3.1'],
      perguntas: 6,
      questions: [
        {
          id: 'AP044.2-L2-Q1', type: 'multiple_choice',
          prompt: 'O que é um vírus de computador?',
          data: { options: [
            { id: 'a', text: 'Um programa escrito por alguém, que entra na máquina e se copia.', correct: true },
            { id: 'b', text: 'Um defeito que aparece nas peças do computador com o passar dos anos.',
              porque: 'Peça velha dá defeito, mas não se copia nem se espalha para outra máquina.' },
            { id: 'c', text: 'Um arquivo corrompido que o sistema não consegue mais abrir corretamente.',
              porque: 'Arquivo corrompido fica parado. Vírus é programa, e programa roda.' },
            { id: 'd', text: 'Uma propaganda que aparece na tela enquanto se navega pela internet.',
              porque: 'Propaganda incomoda, mas é conteúdo da página. O vírus está instalado na máquina.' },
          ]},
          explanation: 'Programa que se copia. O nome veio da biologia justamente por isso.',
        },
        {
          id: 'AP044.2-L2-Q2', type: 'multiple_choice',
          prompt: 'Qual é a diferença entre manter o sistema atualizado e ter antivírus atualizado?',
          data: { options: [
            { id: 'a', text: 'A atualização tapa o buraco; o antivírus reconhece quem tentou entrar por ele.', correct: true },
            { id: 'b', text: 'Nenhuma: as duas fazem a mesma varredura, e ter as duas é desperdício de espaço.',
              porque: 'São trabalhos diferentes — uma fecha a porta, a outra vigia quem passa por ela.' },
            { id: 'c', text: 'A atualização do sistema serve só para mudar a aparência das telas.',
              porque: 'Boa parte de cada atualização é justamente conserto de falhas de segurança.' },
            { id: 'd', text: 'O antivírus dispensa a atualização do sistema, porque cobre as mesmas falhas.',
              porque: 'Ele não conserta falha do sistema: só reconhece programas conhecidos que se aproveitam dela.' },
          ]},
          explanation: 'Uma fecha a porta, a outra reconhece quem bateu. Faltando qualquer uma, sobra caminho.',
        },
        {
          id: 'AP044.2-L2-Q3', type: 'multiple_choice',
          prompt: 'Um vírus embaralhou os arquivos do computador do clube e pede dinheiro para devolvê-los. O que resolve depois do estrago feito?',
          data: { options: [
            { id: 'a', text: 'Ter cópia de segurança feita antes: é a única defesa que funciona depois.', correct: true },
            { id: 'b', text: 'Instalar um antivírus melhor, que desfaça o embaralhamento dos arquivos.',
              porque: 'O antivírus remove o programa, mas não desembaralha o que já foi embaralhado.' },
            { id: 'c', text: 'Pagar o que é pedido, porque quem cobra costuma devolver os arquivos.',
              porque: 'Pagar financia o crime e não garante devolução nenhuma — muita gente paga e não recebe nada.' },
            { id: 'd', text: 'Formatar o computador, que traz os arquivos de volta ao estado anterior.',
              porque: 'Formatar apaga tudo, inclusive os arquivos embaralhados. Sem backup, eles se perdem de vez.' },
          ]},
          explanation: 'Contra sequestro de arquivo, backup é a resposta — e ele precisa existir antes.',
        },
        {
          id: 'AP044.2-L2-Q4', type: 'multiple_choice',
          prompt: 'Por que golpe costuma chegar de gente que você conhece?',
          data: { options: [
            { id: 'a', text: 'Porque o vírus na máquina dela manda mensagem para os contatos, em nome dela.', correct: true },
            { id: 'b', text: 'Porque quem aplica golpe pesquisa quem são seus amigos antes de mandar.',
              porque: 'Acontece, mas o caminho comum é mais simples: a conta do conhecido foi tomada.' },
            { id: 'c', text: 'Porque os aplicativos de mensagem entregam primeiro o que vem de contatos salvos.',
              porque: 'A entrega priorizada não explica por que a mensagem partiu do conhecido.' },
            { id: 'd', text: 'Porque golpe só consegue ser enviado por quem já está na sua lista de contatos.',
              porque: 'Golpe chega de desconhecido também, o tempo todo. O de conhecido é o que engana mais.' },
          ]},
          explanation: 'É por isso que "veio da Joana" não é garantia de nada.',
        },
        {
          id: 'AP044.2-L2-Q5', type: 'true_false',
          prompt: 'Ter antivírus instalado significa que se pode abrir qualquer anexo sem risco.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', porque: 'É falso: o antivírus trabalha com o que já é conhecido, e não vê o que é novo demais.' },
            { id: 'b', text: 'Falso', correct: true },
          ]},
          explanation: 'É como o cinto: reduz o estrago, e não autoriza o risco.',
        },
        {
          id: 'AP044.2-L2-Q6', type: 'multiple_choice',
          prompt: 'O computador do clube ficou muito lento e nada mais foi instalado nele. O que isso pode indicar?',
          data: { options: [
            { id: 'a', text: 'Que algum programa está usando a máquina para trabalhar de graça para outra pessoa.', correct: true },
            { id: 'b', text: 'Que a internet do clube ficou mais lenta e isso reduz a velocidade do computador.',
              porque: 'Internet lenta atrasa páginas e downloads, e não deixa a máquina inteira lenta.' },
            { id: 'c', text: 'Que a energia elétrica do lugar está fraca e o processador reduz a velocidade.',
              porque: 'Oscilação de energia derruba ou danifica; não produz lentidão contínua desse tipo.' },
            { id: 'd', text: 'Que o computador precisa de uma tela maior para trabalhar na velocidade correta.',
              porque: 'Tamanho de tela não altera a velocidade de nada dentro da máquina.' },
          ]},
          explanation: 'Lentidão sem causa é um dos sinais clássicos — a máquina está ocupada com o que não é seu.',
        },
        {
          id: 'AP044.2-L2-Q7', type: 'matching',
          prompt: 'Ligue cada porta de entrada ao cuidado que a fecha.',
          data: { pairs: [
            { left: 'Anexo terminado em .pdf.exe', right: 'Olhar o fim do nome antes de abrir' },
            { left: 'Programa pirata baixado de qualquer site', right: 'Instalar só de fonte oficial' },
            { left: 'Pendrive que passou por muitos computadores', right: 'Passar o antivírus antes de abrir' },
            { left: 'Buraco no sistema nunca tapado', right: 'Manter o sistema atualizado' },
          ]},
          explanation: 'Quatro portas, quatro cuidados. Nenhum deles é o antivírus sozinho.',
        },
        {
          id: 'AP044.2-L2-Q8', type: 'multiple_choice',
          prompt: 'Por que o antivírus precisa ser atualizado com frequência?',
          data: { options: [
            { id: 'a', text: 'Porque ele reconhece só o que já está na lista, e ela cresce todo dia.', correct: true },
            { id: 'b', text: 'Porque a versão antiga do programa deixa de abrir depois de certo tempo.',
              porque: 'Ele continua abrindo; o que fica velho é o que ele sabe reconhecer.' },
            { id: 'c', text: 'Porque a atualização é o que lhe dá permissão para varrer o disco inteiro.',
              porque: 'A permissão vem da instalação. A atualização traz conhecimento novo, não permissão.' },
            { id: 'd', text: 'Porque sem atualizar ele passa a acusar arquivos comuns como perigosos.',
              porque: 'Acontece o contrário: ele deixa de reconhecer o que é novo, e não passa a acusar o que é velho.' },
          ]},
          explanation: 'Sem lista nova, ele não enxerga o vírus que apareceu esta semana.',
        },
        {
          id: 'AP044.2-L2-Q9', type: 'multiple_choice',
          prompt: 'Qual destas NÃO é uma coisa que um vírus costuma fazer depois de entrar?',
          data: { options: [
            { id: 'a', text: 'Aumentar a capacidade do disco para caber mais arquivos.', correct: true },
            { id: 'b', text: 'Roubar senhas digitadas e fotos guardadas na máquina.',
              porque: 'Essa é justamente uma das ações mais comuns.' },
            { id: 'c', text: 'Embaralhar os arquivos e pedir dinheiro para devolvê-los.',
              porque: 'É o vírus de resgate, e ele é comum.' },
            { id: 'd', text: 'Mandar mensagem para os contatos em nome de quem foi infectado.',
              porque: 'É assim que ele se espalha, e é por isso que golpe chega de conhecido.' },
          ]},
          explanation: 'Nenhum programa aumenta o disco: ele tem o tamanho físico que tem.',
        },
      ],
    },
    {
      code: 'AP044.2-L3',
      title: 'Visitando cinco sites educativos',
      type: 'lab',
      content: conteudo_L3,
      requirementCodes: ['AP044-5.1'],
      labType: 'web_lab',
    },
  ],
};
