import type { Module } from '../../types';

/*
 * AP045 módulo 1 — o relatório que o requisito 2 pede.
 *
 * O documento oficial manda "apresentar um relatório sobre a evolução da
 * computação nas áreas de inteligência artificial, mundo virtual, internet e
 * intranets de, no mínimo, 350 palavras". É a mesma forma do requisito 1 da
 * AP041 — pesquisar e escrever, com um piso de palavras —, e por isso passa
 * pelo mesmo caminho: uma lição teórica que dá o esqueleto, e a redação guiada
 * que constrói o texto por etapas, pergunta a pergunta, em vez de entregar uma
 * caixa vazia.
 *
 * Os fatos abaixo são os mesmos que a Edge Function usa para conferir as
 * respostas da redação (supabase/functions/ai-gateway/redacao.ts). Divergir
 * aqui faria a lição ensinar uma coisa e o conferidor recusar outra.
 */

const conteudo_L1 = `
<h2 class="text-xl font-bold mb-3">Quatro áreas, uma mesma pergunta</h2>
<p class="mb-3">"Evolução da computação" parece assunto grande demais para um
relatório. Fica menor quando se olha por partes: o requisito pede quatro áreas
— <strong>inteligência artificial</strong>, <strong>mundo virtual</strong>,
<strong>internet</strong> e <strong>intranets</strong> — e a mesma pergunta
serve para todas: <em>como isso era antes, e o que mudou?</em></p>

<h3 class="font-bold mt-4 mb-2">Inteligência artificial: de seguir regras a aprender sozinha</h3>
<p class="mb-3">O termo <strong>inteligência artificial</strong> (IA) nasceu em
<strong>1956</strong>, numa conferência na Universidade de Dartmouth, nos
Estados Unidos. As primeiras IAs seguiam <strong>regras escritas à mão</strong>
por programadores — "se acontecer isto, faça aquilo". Em
<strong>1997</strong>, o programa de xadrez <strong>Deep Blue</strong>, da IBM,
venceu o campeão mundial Garry Kasparov jogando assim: regra em cima de regra,
calculadas muito rápido.</p>
<p class="mb-3">A partir dos anos 2010, uma técnica chamada
<strong>aprendizado de máquina</strong> mudou o jeito de construir uma IA: em
vez de escrever a regra, mostram-se milhares de exemplos e o programa aprende
o padrão sozinho — é assim que um celular reconhece um rosto numa foto. Em
<strong>novembro de 2022</strong>, o <strong>ChatGPT</strong> popularizou a
<strong>IA generativa</strong>: uma IA que não só reconhece, mas
<strong>cria</strong> texto, imagem, áudio ou vídeo novo a partir de um pedido
escrito.</p>

<h3 class="font-bold mt-4 mb-2">Mundo virtual: do fliperama ao óculos que engana os olhos</h3>
<p class="mb-3">Um <strong>mundo virtual</strong> (ou realidade virtual, VR) é
um ambiente 3D gerado por computador em que a pessoa se move como se estivesse
dentro dele. Um dos primeiros aparelhos a tentar essa imersão foi o
<strong>Sensorama</strong>, de <strong>1962</strong>, que juntava imagem, som,
vento e até cheiro. Em <strong>2012</strong> chegou o <strong>Oculus
Rift</strong>, um dos primeiros óculos de VR pensados para o público comum, que
popularizou a tecnologia entre quem joga.</p>
<p class="mb-3">Hoje mundos virtuais também treinam pilotos e médicos em
simulações onde o erro não custa nada de verdade, e o termo
<strong>metaverso</strong> nomeia mundos virtuais persistentes e
compartilhados, em que várias pessoas usam avatares ao mesmo tempo.</p>

<h3 class="font-bold mt-4 mb-2">Internet: da linha telefônica ao 5G no bolso</h3>
<p class="mb-3">A <strong>internet discada</strong>, comum no Brasil nos anos
1990, usava a própria linha do telefone e chegava a poucos kilobits por
segundo — mal dava para abrir uma foto. A <strong>banda larga</strong>, que
chegou por aqui a partir de meados dos anos 2000, trouxe velocidade sem
prender a linha. E o acesso deixou de depender de um computador de mesa: a
maior parte dos brasileiros acessa a internet pelo celular hoje, segundo
pesquisas do <strong>CGI.br</strong> (o comitê que acompanha a internet
brasileira).</p>

<h3 class="font-bold mt-4 mb-2">Intranet: a mesma tecnologia, com a porta fechada</h3>
<p class="mb-3">Uma <strong>intranet</strong> usa a mesma tecnologia da
internet — páginas, links, servidores — mas é <strong>fechada</strong>: só
quem está dentro da rede de uma empresa, escola ou órgão consegue acessar. É
onde ficam avisos internos, sistemas de RH, documentos que não são para o
público de fora. Uma <strong>extranet</strong> é parecida, mas abre uma porta
controlada para gente de fora — um fornecedor, por exemplo.</p>

<div class="p-3 rounded-lg mt-4" style="background: rgba(59,130,246,.12)">
<p class="text-sm"><strong>O fio comum:</strong> as quatro áreas seguem o
mesmo caminho — o que era feito por regra fixa, controlado por hardware caro
ou trancado atrás de uma porta foi, aos poucos, ficando mais inteligente, mais
imersivo, mais rápido e mais acessível.</p>
</div>
`;

export const modulo1: Module = {
  code: 'AP045.1',
  title: 'Quatro décadas em quatro áreas',
  description: 'Como a inteligência artificial, o mundo virtual, a internet e a intranet mudaram — e o relatório que reúne as quatro.',
  lessons: [
    {
      code: 'AP045.1-L1',
      title: 'A evolução da computação, em quatro frentes',
      type: 'theory',
      content: conteudo_L1,
      requirementCodes: ['AP045-2.1'],
      questions: [
        {
          id: 'AP045.1-L1-Q1', type: 'multiple_choice',
          prompt: 'Como as primeiras inteligências artificiais funcionavam, antes do aprendizado de máquina?',
          data: { options: [
            { id: 'a', text: 'Seguindo regras escritas à mão por um programador, sem aprender com exemplos.', correct: true },
            { id: 'b', text: 'Aprendendo padrões sozinhas a partir de milhares de fotos e textos.',
              porque: 'Isso descreve o aprendizado de máquina, que só veio a se popularizar décadas depois.' },
            { id: 'c', text: 'Copiando o comportamento de outro programa já pronto, sem regra nenhuma.',
              porque: 'Não havia o que copiar: eram as primeiras. A lógica delas vinha de regras escritas por pessoas.' },
            { id: 'd', text: 'Gerando texto e imagem novos a partir de um pedido em linguagem comum.',
              porque: 'Isso é IA generativa, o tipo mais recente. As primeiras IAs não criavam nada — só seguiam regras.' },
          ]},
          explanation: 'Regra em cima de regra: foi assim que o Deep Blue venceu Kasparov em 1997, décadas antes do aprendizado de máquina.',
        },
        {
          id: 'AP045.1-L1-Q2', type: 'multiple_choice',
          prompt: 'O que é uma IA generativa, e o que a diferencia de uma IA mais antiga?',
          data: { options: [
            { id: 'a', text: 'Ela cria conteúdo novo — texto, imagem, áudio — a partir de um pedido escrito.', correct: true },
            { id: 'b', text: 'Ela joga xadrez seguindo regras, como o programa que venceu Kasparov em 1997.',
              porque: 'Esse é o exemplo mais antigo, de regra fixa. A geração de conteúdo novo é o que veio depois.' },
            { id: 'c', text: 'Ela reconhece um rosto numa foto comparando com fotos já cadastradas.',
              porque: 'Reconhecer é comparar e classificar; gerar é criar algo que não existia. São tarefas diferentes.' },
            { id: 'd', text: 'Ela roda mais rápido que as IAs antigas, mas faz exatamente a mesma coisa que elas.',
              porque: 'Não é só velocidade: mudou o tipo de tarefa. Uma cria conteúdo, a outra seguia instruções fixas.' },
          ]},
          explanation: 'ChatGPT, em 2022, popularizou esse tipo de IA — que gera o que pediram, em vez de só reconhecer ou calcular.',
        },
        {
          id: 'AP045.1-L1-Q3', type: 'true_false',
          prompt: 'O Sensorama, de 1962, foi um dos primeiros aparelhos a tentar simular uma experiência imersiva, juntando imagem, som e até cheiro.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', correct: true },
            { id: 'b', text: 'Falso', porque: 'É verdadeiro: décadas antes do óculos de realidade virtual, o Sensorama já buscava envolver vários sentidos de uma vez.' },
          ]},
          explanation: 'Trinta anos antes do óculos de VR ficar comum, já havia gente tentando simular uma experiência com vários sentidos ao mesmo tempo.',
        },
        {
          id: 'AP045.1-L1-Q4', type: 'multiple_choice',
          prompt: 'O que é um "metaverso"?',
          data: { options: [
            { id: 'a', text: 'Um mundo virtual persistente e compartilhado, em que várias pessoas usam avatares ao mesmo tempo.', correct: true },
            { id: 'b', text: 'O primeiro óculos de realidade virtual, lançado para o público em geral.',
              porque: 'Isso descreve o Oculus Rift, de 2012. Metaverso é o nome do tipo de mundo, não do aparelho.' },
            { id: 'c', text: 'Uma simulação usada só para treinar pilotos e médicos, sem gente comum dentro.',
              porque: 'Simuladores de treino são um uso da realidade virtual, mas o metaverso é aberto a qualquer pessoa.' },
            { id: 'd', text: 'Um jogo de computador comum, que roda numa tela plana qualquer, sem óculos e sem nenhum tipo de imersão em três dimensões.',
              porque: 'Sem imersão não há mundo virtual: a ideia do metaverso é justamente estar "dentro" do ambiente.' },
          ]},
          explanation: 'Persistente quer dizer que continua existindo mesmo quando você sai; compartilhado, que outras pessoas estão lá com você.',
        },
        {
          id: 'AP045.1-L1-Q5', type: 'multiple_choice',
          prompt: 'Por que a internet discada dos anos 1990 quase não conseguia mostrar uma foto rapidamente?',
          data: { options: [
            { id: 'a', text: 'Porque ela usava a linha telefônica e chegava a poucos kilobits por segundo.', correct: true },
            { id: 'b', text: 'Porque os computadores da época não sabiam abrir arquivos de imagem.',
              porque: 'Os computadores sabiam abrir imagem; o que faltava era velocidade para baixá-la rápido.' },
            { id: 'c', text: 'Porque as fotos digitais só foram inventadas bem depois de a banda larga chegar às casas das famílias.',
              porque: 'A fotografia digital já existia; o gargalo era a velocidade de transmitir o arquivo pela linha.' },
            { id: 'd', text: 'Porque o Brasil não tinha nenhuma companhia de telefone naquela década.',
              porque: 'Havia companhias de telefone — era exatamente a linha delas que a internet discada usava.' },
          ]},
          explanation: 'Poucos kilobits por segundo é uma fração do que uma foto de celular pesa hoje — a espera podia levar minutos.',
        },
        {
          id: 'AP045.1-L1-Q6', type: 'multiple_choice',
          prompt: 'O que muda de acesso à internet nos últimos anos, segundo pesquisas do CGI.br?',
          data: { options: [
            { id: 'a', text: 'A maior parte dos brasileiros passou a acessar a internet pelo celular, e não por um computador de mesa.', correct: true },
            { id: 'b', text: 'O acesso à internet no Brasil parou de crescer desde os anos 1990.',
              porque: 'O texto descreve o contrário: o acesso cresceu e mudou de aparelho, da mesa para o bolso.' },
            { id: 'c', text: 'A internet discada voltou a ser a forma mais comum de conexão usada pelas famílias brasileiras.',
              porque: 'Foi o oposto: a banda larga substituiu a discada, e depois o celular ficou ainda mais comum.' },
            { id: 'd', text: 'Só empresas grandes têm acesso à internet hoje em dia no Brasil.',
              porque: 'A pesquisa citada é justamente sobre o acesso das pessoas, não só das empresas.' },
          ]},
          explanation: 'O computador de mesa deixou de ser a única porta de entrada — hoje ela cabe no bolso.',
        },
        {
          id: 'AP045.1-L1-Q7', type: 'matching',
          prompt: 'Ligue cada termo à definição certa.',
          data: { pairs: [
            { left: 'Intranet', right: 'Rede com a mesma tecnologia da internet, mas fechada a quem está de fora' },
            { left: 'Extranet', right: 'Parecida com a intranet, mas abre uma porta controlada para gente de fora' },
            { left: 'IA generativa', right: 'Cria texto, imagem, áudio ou vídeo novos a partir de um pedido' },
            { left: 'Metaverso', right: 'Mundo virtual persistente, com várias pessoas em avatares ao mesmo tempo' },
          ]},
          explanation: 'Intranet e extranet diferem só em quem pode entrar; IA generativa e metaverso vêm de áreas diferentes da computação.',
        },
        {
          id: 'AP045.1-L1-Q8', type: 'multiple_choice',
          prompt: 'Uma empresa quer que só os próprios funcionários vejam os avisos de RH, mas quer que um fornecedor de fora acesse uma página específica de pedidos. O que ela precisa, além da intranet comum?',
          data: { options: [
            { id: 'a', text: 'Uma extranet, que abre uma porta controlada para quem está fora da empresa.', correct: true },
            { id: 'b', text: 'Nada além da intranet, porque ela já é acessível para qualquer pessoa da internet.',
              porque: 'É o contrário: a intranet é fechada. Para deixar alguém de fora entrar, é preciso abrir uma porta específica.' },
            { id: 'c', text: 'Um metaverso próprio, para reunir funcionários e fornecedores num mesmo ambiente 3D.',
              porque: 'Metaverso é sobre mundos virtuais imersivos, e não sobre controlar quem acessa uma página de pedidos.' },
            { id: 'd', text: 'Trocar a intranet por uma internet discada, que é mais simples de configurar.',
              porque: 'A internet discada é só uma forma antiga e lenta de conexão — não resolve quem pode ou não acessar algo.' },
          ]},
          explanation: 'Extranet é o meio-termo: mantém a intranet fechada para o público, e abre uma porta específica para quem precisa.',
        },
        {
          id: 'AP045.1-L1-Q9', type: 'ordering',
          prompt: 'Ordene os fatos da inteligência artificial, do mais antigo para o mais recente.',
          data: { items: [
            { id: 'a', text: 'O termo "inteligência artificial" é criado numa conferência em Dartmouth', order: 1 },
            { id: 'b', text: 'O Deep Blue, seguindo regras, vence o campeão mundial de xadrez', order: 2 },
            { id: 'c', text: 'O aprendizado de máquina passa a reconhecer padrões a partir de exemplos', order: 3 },
            { id: 'd', text: 'O ChatGPT populariza a IA generativa, capaz de criar texto e imagem', order: 4 },
          ]},
          explanation: 'De regra escrita à mão a aprender sozinha, e daí a criar coisa nova: é a mesma direção das outras três áreas.',
        },
      ],
    },
    {
      code: 'AP045.1-L2',
      title: 'Escrevendo o relatório sobre a evolução da computação',
      type: 'lab',
      content: '',
      requirementCodes: ['AP045-2.1'],
      labType: 'redacao_guiada',
    },
  ],
};
