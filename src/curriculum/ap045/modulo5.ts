import type { Module } from '../../types';

/*
 * AP045 módulo 5 — requisitos 6 e 7.
 *
 * O documento pede pesquisar e apresentar um relatório sobre o bug do milênio
 * (requisito 6, sem piso de palavras — ao contrário do requisito 2, que pede
 * 350) e explicar o que significam upgrade e update (requisito 7). São dois
 * assuntos pequenos e sem relação direta entre si; ficam no mesmo módulo por
 * tamanho, não por parentesco.
 *
 * O requisito 6 não ganha um segundo laboratório de redação guiada: o
 * mecanismo é um roteiro por trilha (`ROTEIROS[especialidade]`), e a AP045 já
 * usa o dela no requisito 2. Sem piso de palavras no documento oficial, o que
 * se mede aqui é o entendimento do assunto — a mesma solução da AP041 para
 * "apresentar ao examinador": a lição ensina o que apresentar, e a
 * apresentação em si acontece fora da plataforma.
 */

const conteudo_L1 = `
<h2 class="text-xl font-bold mb-3">O bug que o mundo temia e não aconteceu como se esperava</h2>
<p class="mb-3">Nos anos 1960 a 1990, memória de computador era cara. Para
economizar espaço, muitos programas guardavam o ano com <strong>apenas dois
dígitos</strong> — 1987 virava só "87". Funcionava bem, até alguém perceber um
problema: o que aconteceria quando o ano virasse <strong>2000</strong>?</p>

<h3 class="font-bold mt-4 mb-2">Por que dois dígitos quebravam tudo</h3>
<p class="mb-3">Um sistema que guardava só "87" para 1987 calculava datas
subtraindo os dois dígitos: 99 menos 87 dá 12 anos de diferença, por exemplo.
Mas quando o ano virasse 2000, o sistema guardaria "00" — e 00 menos 87 dá um
número <strong>negativo</strong>. Alguns programas quebrariam o cálculo por
completo; outros, mais graves, poderiam entender "00" como <strong>1900</strong>
em vez de 2000, o que bagunçaria contratos, juros bancários, aposentadorias e
sistemas de controle que dependiam de datas corretas.</p>

<h3 class="font-bold mt-4 mb-2">O medo, e o que realmente aconteceu</h3>
<p class="mb-3">Esse problema ficou conhecido como <strong>bug do
milênio</strong> (ou "Y2K", de <em>year 2000</em>). Houve previsões
catastróficas: aviões caindo, usinas de energia parando, bancos perdendo o
controle do dinheiro guardado. Nada disso aconteceu — mas não porque o medo
fosse bobagem. Governos e empresas do mundo inteiro gastaram
<strong>bilhões de dólares</strong>, ao longo de anos, revisando e corrigindo
sistemas antes da virada de <strong>31 de dezembro de 1999</strong> para
<strong>1º de janeiro de 2000</strong>. O problema era real; o esforço de
correção foi o que evitou o desastre.</p>

<h3 class="font-bold mt-4 mb-2">O que ficou de lição</h3>
<p class="mb-3">O bug do milênio ensinou algo que continua valendo: uma
decisão pequena, tomada para economizar recursos numa época em que eles eram
caros, pode custar caro décadas depois — quando o programa continua rodando e
a circunstância que a justificou já não existe mais.</p>

<div class="p-3 rounded-lg mt-4" style="background: rgba(234,179,8,.12)">
<p class="text-sm"><strong>Para o relatório:</strong> explique o que causava o
problema (dois dígitos para o ano), o que se temia que aconteceria, e o que
de fato foi feito para evitá-lo — é a diferença entre o medo e o resultado
real que torna a história interessante de contar.</p>
</div>
`;

const conteudo_L2 = `
<h2 class="text-xl font-bold mb-3">Upgrade e update: duas palavras que se confundem</h2>
<p class="mb-3">Você já viu as duas palavras na tela do seu celular ou
computador, e é fácil confundir uma com a outra — mas elas significam coisas
diferentes.</p>

<h3 class="font-bold mt-4 mb-2">Update: a mesma coisa, corrigida</h3>
<p class="mb-3"><strong>Update</strong> (atualização) é quando um programa ou
sistema que você já tem recebe uma versão nova, sem trocar de peça nenhuma:
corrige falhas de segurança, conserta erros, às vezes acrescenta um recurso
pequeno. O aplicativo do celular que pede para "atualizar" está pedindo um
update — continua sendo o mesmo aplicativo, só que numa versão mais nova.</p>

<h3 class="font-bold mt-4 mb-2">Upgrade: trocar por algo melhor</h3>
<p class="mb-3"><strong>Upgrade</strong> (melhoria) é quando você troca uma
peça ou um sistema inteiro por algo <strong>superior</strong> — não é a mesma
coisa numa versão mais nova, é uma coisa diferente e mais capaz. Trocar a
memória RAM de 4 GB por uma de 16 GB é um upgrade de hardware. Trocar o
sistema operacional do celular por uma versão que exige um aparelho mais
potente também pode ser chamado de upgrade.</p>

<h3 class="font-bold mt-4 mb-2">Como não confundir</h3>
<p class="mb-3">Uma forma de lembrar: <strong>update</strong> mexe no
<strong>software</strong> que você já tem, deixando-o em dia; um
<strong>upgrade</strong> muda para algo <strong>diferente e superior</strong> —
seja hardware (memória, disco, processador) ou uma mudança maior de versão de
software. Baixar a correção de segurança do celular é update. Comprar um
computador novo, mais potente, para rodar um programa pesado é upgrade.</p>

<div class="p-3 rounded-lg mt-4" style="background: rgba(59,130,246,.12)">
<p class="text-sm"><strong>Um jeito rápido de decidir:</strong> se a resposta à
pergunta "isso trocou de peça, ou virou algo mais potente?" for sim, é
upgrade. Se a resposta for "continua a mesma coisa, só numa versão mais
nova", é update.</p>
</div>
`;

export const modulo5: Module = {
  code: 'AP045.5',
  title: 'O bug do milênio, upgrade e update',
  description: 'O problema que o mundo gastou bilhões para evitar, e as duas palavras que a maioria das pessoas troca uma pela outra.',
  lessons: [
    {
      code: 'AP045.5-L1',
      title: 'O bug do milênio',
      type: 'theory',
      content: conteudo_L1,
      requirementCodes: ['AP045-6.1'],
      questions: [
        {
          id: 'AP045.5-L1-Q1', type: 'multiple_choice',
          prompt: 'Por que guardar o ano com apenas dois dígitos criava um problema na virada para o ano 2000?',
          data: { options: [
            { id: 'a', text: 'Porque "00" podia ser confundido com 1900 em vez de 2000, bagunçando cálculos de data.', correct: true },
            { id: 'b', text: 'Porque dois dígitos ocupavam mais espaço na memória do que quatro dígitos.',
              porque: 'É o contrário: dois dígitos ocupavam menos espaço — foi exatamente por isso que a prática surgiu.' },
            { id: 'c', text: 'Porque os computadores da época não conseguiam ligar depois do ano 2000.',
              porque: 'O problema não era ligar o computador: era o cálculo de datas dar resultado errado dentro dos programas.' },
            { id: 'd', text: 'Porque a internet ainda não existia e os sistemas não sabiam a data certa.',
              porque: 'O problema era interno ao próprio sistema — como ele guardava e calculava a data —, e não dependia da internet.' },
          ]},
          explanation: '"00" menos "87" dá um número negativo, e um sistema podia entender "00" como 1900 — os dois quebravam cálculos que dependiam da data.',
        },
        {
          id: 'AP045.5-L1-Q2', type: 'multiple_choice',
          prompt: 'Por que muitos sistemas antigos guardavam o ano com apenas dois dígitos?',
          data: { options: [
            { id: 'a', text: 'Porque memória de computador era cara, e dois dígitos economizavam espaço.', correct: true },
            { id: 'b', text: 'Porque os programadores da época não sabiam que os anos passariam de 1999.',
              porque: 'Os programadores sabiam que o tempo passaria; a escolha foi de economia de recursos, não de desconhecimento do calendário.' },
            { id: 'c', text: 'Porque os teclados antigos só tinham espaço para digitar dois números por vez.',
              porque: 'O teclado não limitava quantos dígitos se digitavam. A limitação era de espaço de armazenamento no sistema.' },
            { id: 'd', text: 'Porque a lei da época proibia guardar datas com quatro dígitos.',
              porque: 'Não havia lei sobre isso — foi uma escolha técnica para economizar memória, que era cara na época.' },
          ]},
          explanation: 'Numa época em que cada byte de memória custava caro, economizar dois dígitos por data parecia uma boa ideia.',
        },
        {
          id: 'AP045.5-L1-Q3', type: 'true_false',
          prompt: 'O bug do milênio causou desastres graves, como aviões caindo e usinas de energia parando, na virada para o ano 2000.',
          data: { options: [
            { id: 'a', text: 'Falso', correct: true },
            { id: 'b', text: 'Verdadeiro', porque: 'Não aconteceram desastres desse tipo — mas não porque o medo fosse infundado, e sim porque bilhões de dólares foram gastos corrigindo sistemas antes da virada.' },
          ]},
          explanation: 'O problema era real; o desastre não aconteceu porque um esforço enorme de correção foi feito antes de 1º de janeiro de 2000.',
        },
        {
          id: 'AP045.5-L1-Q4', type: 'multiple_choice',
          prompt: 'Por que os desastres previstos para o bug do milênio não aconteceram?',
          data: { options: [
            { id: 'a', text: 'Porque governos e empresas gastaram bilhões de dólares corrigindo sistemas antes da virada do ano.', correct: true },
            { id: 'b', text: 'Porque o problema nunca existiu de fato, e era só um boato espalhado pela imprensa.',
              porque: 'O problema era real — dois dígitos guardando o ano — e por isso exigiu um esforço real de correção.' },
            { id: 'c', text: 'Porque todos os computadores do mundo pararam de funcionar automaticamente antes de 2000, evitando o erro sozinhos.',
              porque: 'Nada parou sozinho; o resultado veio de correções feitas de propósito por pessoas, e não por acaso.' },
            { id: 'd', text: 'Porque todos os computadores do mundo foram trocados por modelos novos antes da virada.',
              porque: 'A solução foi principalmente corrigir os sistemas existentes, não trocar todos os computadores do planeta.' },
          ]},
          explanation: 'O resultado — nada de grave acontecer — foi fruto de anos de trabalho de correção, não de sorte.',
        },
        {
          id: 'AP045.5-L1-Q5', type: 'multiple_choice',
          prompt: 'Qual lição o bug do milênio deixou para quem programa hoje?',
          data: { options: [
            { id: 'a', text: 'Uma decisão tomada para economizar recursos numa época pode custar caro décadas depois, quando o programa ainda está em uso.', correct: true },
            { id: 'b', text: 'Que datas nunca devem ser guardadas em nenhum sistema de computador.',
              porque: 'Guardar data continua sendo necessário; o problema não era guardar data, e sim guardá-la com poucos dígitos.' },
            { id: 'c', text: 'Que memória de computador nunca deve ser economizada de jeito nenhum, em hipótese alguma, em nenhum programa novo.',
              porque: 'Economizar recursos continua sendo uma prática válida; o ponto é pensar no que aquela economia pode custar no futuro.' },
            { id: 'd', text: 'Que todo programa deve parar de funcionar automaticamente após vinte anos.',
              porque: 'A lição não é sobre programas pararem de funcionar sozinhos, e sim sobre prever consequências de longo prazo de uma decisão técnica.' },
          ]},
          explanation: 'A memória era cara nos anos 1970; o custo daquela economia só apareceu décadas depois, quando os mesmos sistemas ainda rodavam.',
        },
      ],
    },
    {
      code: 'AP045.5-L2',
      title: 'Upgrade e update',
      type: 'theory',
      content: conteudo_L2,
      requirementCodes: ['AP045-7.1'],
      questions: [
        {
          id: 'AP045.5-L2-Q1', type: 'multiple_choice',
          prompt: 'O que é um update?',
          data: { options: [
            { id: 'a', text: 'Uma versão nova do mesmo programa, que corrige falhas ou acrescenta um recurso pequeno.', correct: true },
            { id: 'b', text: 'A troca de uma peça do computador por outra mais potente, como memória RAM.',
              porque: 'Isso é um upgrade — troca por algo diferente e superior, não uma nova versão do que já existia.' },
            { id: 'c', text: 'A compra de um aparelho totalmente novo para substituir o antigo.',
              porque: 'Comprar um aparelho novo é mais próximo de um upgrade. Update mexe no software que você já tem.' },
            { id: 'd', text: 'A instalação de um programa que nunca existiu antes no aparelho.',
              porque: 'Instalar algo novo pela primeira vez não é atualizar nada existente — update pressupõe uma versão anterior.' },
          ]},
          explanation: 'Update deixa em dia o que você já tem: mesmo programa, versão mais nova.',
        },
        {
          id: 'AP045.5-L2-Q2', type: 'multiple_choice',
          prompt: 'Trocar a memória RAM de um computador de 4 GB para 16 GB é um exemplo de quê?',
          data: { options: [
            { id: 'a', text: 'Upgrade.', correct: true },
            { id: 'b', text: 'Update.',
              porque: 'Update mexe no software de uma versão para outra. Trocar uma peça de hardware por outra melhor é upgrade.' },
            { id: 'c', text: 'Backup.',
              porque: 'Backup é cópia de segurança de arquivos — não tem relação com trocar peças ou versões.' },
            { id: 'd', text: 'Download.',
              porque: 'Download é baixar um arquivo da internet — não é sobre trocar uma peça do computador.' },
          ]},
          explanation: 'Trocar por algo diferente e mais capaz é a marca do upgrade — nesse caso, de hardware.',
        },
        {
          id: 'AP045.5-L2-Q3', type: 'true_false',
          prompt: 'Baixar a correção de segurança mais recente de um aplicativo que você já usa é um exemplo de update.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', correct: true },
            { id: 'b', text: 'Falso', porque: 'É verdadeiro: continua sendo o mesmo aplicativo, só que numa versão mais nova — isso é justamente o que update significa.' },
          ]},
          explanation: 'Mesmo programa, versão mais nova: é a definição de update.',
        },
        {
          id: 'AP045.5-L2-Q4', type: 'multiple_choice',
          prompt: 'Qual pergunta ajuda a distinguir update de upgrade?',
          data: { options: [
            { id: 'a', text: '"Isso trocou de peça, ou virou algo mais potente?" — se sim, é upgrade; se continua o mesmo em versão nova, é update.', correct: true },
            { id: 'b', text: '"Isso custou dinheiro?" — se sim, é upgrade; se foi de graça, é update.',
              porque: 'O preço não é o que separa os dois termos: um update também pode ser pago, e um upgrade às vezes é gratuito.' },
            { id: 'c', text: '"Isso demorou mais de uma hora para terminar de instalar no aparelho?" — se sim, é upgrade; se foi rápido, é update.',
              porque: 'O tempo de instalação não define o termo — o que define é se houve troca por algo superior, ou apenas uma nova versão do mesmo.' },
            { id: 'd', text: '"Isso veio pela internet?" — se sim, é update; se veio numa loja física, é upgrade.',
              porque: 'A forma de obter não define o termo: um upgrade de software também pode chegar pela internet.' },
          ]},
          explanation: 'O que distingue os dois é a natureza da mudança — continuar a mesma coisa em dia, ou trocar por algo superior.',
        },
        {
          id: 'AP045.5-L2-Q5', type: 'scenario',
          prompt: 'O celular de um desbravador está lento para rodar um jogo novo, e ele decide comprar um aparelho mais potente para substituí-lo. Como chamar essa troca?',
          data: { scenarios: [
            { id: 'a', text: 'Upgrade, porque ele está trocando por um aparelho diferente e superior.', correct: true },
            { id: 'b', text: 'Update, porque o aparelho continua sendo usado para o mesmo tipo de tarefa.',
              porque: 'Update seria baixar uma versão nova de um programa que ele já tem — aqui ele está trocando o aparelho inteiro.' },
            { id: 'c', text: 'Download, porque ele vai baixar os jogos de novo no aparelho novo.',
              porque: 'Baixar os jogos é uma etapa depois da troca, mas a troca do aparelho em si é o upgrade.' },
            { id: 'd', text: 'Backup, porque ele vai guardar os dados do celular antigo antes de trocar.',
              porque: 'Guardar os dados antes de trocar é backup, mas a troca do aparelho por um mais potente é o upgrade.' },
          ]},
          explanation: 'Trocar por um aparelho diferente e mais capaz — não a mesma coisa numa versão nova — é a marca do upgrade.',
        },
      ],
    },
  ],
};
