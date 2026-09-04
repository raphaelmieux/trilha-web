/*
 * A vereda CC-FE002 CSS.
 *
 * ── De onde ela vem ──────────────────────────────────────────────────────
 * A CC-FE001 ensina a dizer o que cada pedaço da página é. Esta ensina a dizer
 * como ele se parece — e é a continuação natural: quem sai da primeira tem uma
 * página correta e feia, e não sabe por onde começar a arrumá-la.
 *
 * ── A forma ──────────────────────────────────────────────────────────────
 * A mesma da vereda de HTML, de propósito: módulo com uma lição de teoria e um
 * laboratório, tópico com explicação, exemplo que roda, e a armadilha do
 * assunto. Quem percorreu a primeira não aprende uma segunda gramática.
 *
 * ── O que muda ───────────────────────────────────────────────────────────
 * CSS não se vê sozinho. Cada laboratório traz a página a que a folha se
 * aplica — a mesma página o percurso inteiro, ganhando aparência a cada
 * módulo —, aberta e só de leitura na lateral do editor. É assim que se
 * trabalha CSS na vida: a marcação vem dada, e o que se escreve é o estilo.
 *
 * A ordem dos módulos é a ordem do documento oficial: o que a linguagem é, a
 * quem a regra fala, a aparência do texto, o modelo de caixa, os dois modos de
 * alinhar, e a tela pequena. O último laboratório cobra a vereda inteira.
 */

import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DE_CSS } from './questoesDeCss';

/*
  A página do mural, a mesma nos sete laboratórios.

  Uma só, e não uma por módulo, porque o percurso é justamente vê-la melhorar:
  a marcação não muda, o que muda é o que a pessoa já sabe pedir dela. Ela tem
  tag, classe e identificador porque o módulo 2 precisa dos três.

  O `<link>` é real e aponta para o arquivo que a pessoa edita. Ele não faz
  nada aqui — a prévia injeta a folha —, mas está escrito porque é assim que a
  página encontra o estilo fora deste laboratório, e esconder isso ensinaria
  que folha de estilo se aplica por mágica.
*/
const PAGINA_DO_MURAL = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Mural do Clube Falcão Peregrino</title>
  <link rel="stylesheet" href="estilo.css">
</head>
<body>
  <header id="topo">
    <h1>Clube Falcão Peregrino</h1>
    <p class="lema">Sempre prontos, sempre atentos.</p>
  </header>

  <main>
    <p class="aviso">A reunião de sábado começa às 14h, no salão.</p>
    <p>Traga o lenço, a boina e o caderno de especialidades.</p>

    <section class="cartao">
      <h2>Acampamento de julho</h2>
      <p>Saída no dia 12, retorno no dia 14. As inscrições fecham no dia 30.</p>
    </section>

    <section class="cartao">
      <h2>Classe bíblica</h2>
      <p>Todo domingo, às 9h. Traga a Bíblia e o estudo da semana.</p>
    </section>
  </main>

  <footer>
    <p>Mural mantido pela secretaria do clube.</p>
  </footer>
</body>
</html>
`;

/*
  De onde a pessoa parte: um arquivo com o comentário e nada mais.

  Nenhum laboratório desta vereda abre com verificação verde — é a regra da
  casa, e `veredas.test.ts` a cobra. Aqui isso é fácil de respeitar e fácil de
  quebrar sem querer: bastaria deixar uma regra de exemplo no modelo, e a
  primeira tarefa nasceria concluída.
*/
const modelo = (o: string) => `/* ${o}

   A página que este arquivo estiliza é a pagina.html, na lateral.
   Abra-a para ver os nomes das classes e dos identificadores — um
   seletor só funciona se ele encontrar alguém.

   O que falta está na lista de tarefas, ao lado. */
`;

interface Capitulo { id: string; titulo: string; resumo: string; topicos: TopicoDeVereda[] }

const CAPITULOS: Capitulo[] = [
  {
    id: 'regra',
    titulo: 'O que o CSS é',
    resumo: 'A regra de estilo, onde ela mora, e por que isto não é programar.',
    topicos: [
      {
        id: 'seletor-propriedade-valor',
        titulo: 'Seletor, propriedade e valor',
        resumo: 'A quem, o quê, e como.',
        explicacao: [
          'O HTML diz o que cada pedaço da página é. O CSS diz como ele se parece. São duas perguntas diferentes, e por isso duas linguagens.',
          'Uma regra de CSS tem três partes. O seletor diz a quem ela se aplica. Dentro das chaves vêm pares: a propriedade, que é o que muda, e o valor, que é a resposta escolhida.',
          'Cada par termina com ponto e vírgula. Numa regra você escreve quantos pares quiser.',
        ],
        exemplo: `h1 {
  color: crimson;
  font-size: 2rem;
}`,
        exemploComo: 'css',
        exemploMarcacao: `<h1>Clube Pioneiros</h1>
<p>A reunião é sábado, às 14h.</p>`,
        atencao: 'Errar o nome da propriedade não dá erro: o navegador descarta a linha em silêncio e segue. A tela fica igual e nada explica por quê. Quando algo não mudou, releia o nome antes de mexer no valor.',
        marcas: ['seletor', 'propriedade', 'valor'],
      },
      {
        id: 'onde-mora',
        titulo: 'Onde o estilo mora',
        resumo: 'Arquivo separado, e por quê.',
        explicacao: [
          'O estilo pode ir dentro do próprio elemento, num <style> no cabeçalho, ou num arquivo à parte ligado por <link>.',
          'O arquivo à parte é o que se usa de verdade. Um site de quatro páginas com o mesmo estilo tem um arquivo só: mudar a cor do título muda nas quatro de uma vez.',
          'Escrever estilo dentro do elemento parece mais rápido, e é o que mais custa depois — para trocar uma cor você precisa achar todos os lugares onde ela foi escrita.',
        ],
        exemplo: `<head>
  <link rel="stylesheet" href="estilo.css">
</head>`,
        exemploComo: 'html',
        atencao: 'O href aponta para o arquivo a partir da pasta da página. Nome errado, pasta errada ou letra maiúscula fora do lugar produzem o mesmo sintoma: a página abre sem estilo nenhum, e sem aviso.',
        marcas: ['<link>', '<style>', 'href'],
      },
      {
        id: 'nao-e-programacao',
        titulo: 'Por que isto não é programar',
        resumo: 'Descrever o resultado, e não os passos.',
        explicacao: [
          'Programar é escrever uma sequência de decisões: faça isto, depois aquilo, e se acontecer tal coisa faça diferente. A linguagem executa passo a passo.',
          'CSS não executa passo nenhum. Você descreve como quer que as coisas apareçam, e o navegador se vira para chegar lá. Não há ordem de execução para acompanhar nem resultado a calcular.',
          'Isso não a torna menos importante nem mais fácil. É outra categoria: uma linguagem de descrição, como a de uma receita que diz o prato pronto em vez do modo de fazer.',
        ],
        exemplo: `/* Você diz o resultado: */
.aviso { background-color: gold; }

/* E não o caminho:
   "ache os avisos, percorra um a um, pinte cada um" */`,
        exemploComo: 'css',
        exemploMarcacao: `<p>A reunião é sábado.</p>
<p class="aviso">Traga garrafa de água.</p>`,
        atencao: 'CSS moderno tem variáveis e faz contas com calc(). Isso confunde, e não muda a resposta: ele continua descrevendo aparência, e é o que a linguagem faz que a classifica.',
        marcas: ['declarativo', 'calc()'],
      },
    ],
  },

  {
    id: 'seletores',
    titulo: 'A quem a regra fala',
    resumo: 'Os três seletores, a herança, a cascata e a especificidade.',
    topicos: [
      {
        id: 'tres-seletores',
        titulo: 'Elemento, classe e identificador',
        resumo: 'Três formas de apontar, para três situações.',
        explicacao: [
          'O seletor de elemento é o nome da tag, escrito sozinho. Ele pega todos os elementos daquele tipo na página.',
          'O de classe é um ponto colado num nome. A classe você escolhe e escreve no atributo class= de quantos elementos quiser — é para o que se repete.',
          'O de identificador é uma cerquilha colada num nome, escrito no atributo id=. Ele é único: um id só aparece uma vez na página.',
        ],
        exemplo: `p        { line-height: 1.6; }
.aviso   { background-color: gold; }
#topo    { text-align: center; }`,
        exemploComo: 'css',
        exemploMarcacao: `<p id="topo">Clube Pioneiros</p>
<p>Reunião de sábado, às 14h.</p>
<p class="aviso">Traga garrafa de água.</p>`,
        atencao: 'O nome no CSS tem de ser exatamente o do HTML. `.Aviso` não acerta `class="aviso"`, e nada avisa: a regra fica no arquivo, válida e sem efeito.',
        marcas: ['p', '.classe', '#identificador'],
      },
      {
        id: 'heranca',
        titulo: 'Herança',
        resumo: 'O que desce de uma caixa para as de dentro.',
        explicacao: [
          'Algumas propriedades passam do elemento para os que estão dentro dele. Definir a fonte no body faz a página inteira mudar de fonte, sem escrever regra para cada parágrafo.',
          'Herdam-se as coisas do texto: fonte, tamanho, cor, altura da linha, alinhamento.',
          'Não se herdam as coisas da caixa: margem, borda, espaçamento interno, fundo. Cada caixa tem os seus, e faz sentido — uma borda que descesse para todos os filhos desenharia molduras dentro de molduras.',
        ],
        exemplo: `body {
  font-family: Georgia, serif;
  color: #2E2E2E;
}
/* Todo texto da página nasce assim,
   sem uma regra para cada elemento. */`,
        exemploComo: 'css',
        exemploMarcacao: `<h2>Unidade Falcão</h2>
<p>Todo texto desta página herdou a letra e a cor do body.</p>
<p>Nenhuma regra fala destes parágrafos.</p>`,
        atencao: 'Herança não é cascata. Herança é o valor descendo de fora para dentro; cascata é a disputa entre regras que miram o mesmo elemento. Confundir as duas leva a procurar o problema no lugar errado.',
        marcas: ['herança', 'font-family', 'color'],
      },
      {
        id: 'cascata',
        titulo: 'Cascata',
        resumo: 'Quando duas regras falam do mesmo elemento.',
        explicacao: [
          'Nada impede que duas regras mirem o mesmo elemento e peçam coisas diferentes. O navegador precisa escolher uma, e a escolha segue uma ordem conhecida.',
          'Primeiro ele compara o peso dos seletores. Se empatar, vence a que está escrita por último no arquivo.',
          'É por isso que o CSS se chama assim: as regras caem em cascata, e a de baixo cobre a de cima quando as duas têm o mesmo peso.',
        ],
        exemplo: `p { color: gray; }
p { color: navy; }

/* Mesmo peso, então vence a última:
   os parágrafos ficam azul-marinho. */`,
        exemploComo: 'css',
        exemploMarcacao: `<p>As duas regras falam deste parágrafo.</p>
<p>Vence a última que foi escrita.</p>`,
        atencao: 'A ordem só decide o empate. Uma regra de classe escrita no começo do arquivo vence uma de elemento escrita no fim, porque o peso vem antes da posição.',
        marcas: ['cascata', 'ordem'],
      },
      {
        id: 'especificidade',
        titulo: 'Especificidade',
        resumo: 'Quanto cada seletor pesa na disputa.',
        explicacao: [
          'Quanto mais restrito o alcance do seletor, mais ele pesa. Elemento pesa pouco, porque atinge muita gente. Classe pesa mais. Identificador pesa mais ainda, porque é de um elemento só.',
          'Estilo escrito no atributo style= do próprio elemento pesa mais que tudo isso — e é justamente por isso que se evita usá-lo: para mudar depois, não há regra que ganhe dele.',
          'Quando a regra certa não está valendo, quase sempre é uma mais pesada em algum lugar do arquivo. Procure o seletor mais restrito antes de mexer no valor.',
        ],
        exemplo: `p        { color: gray; }   /* peso 1 */
.aviso   { color: navy; }   /* peso 10 */
#urgente { color: crimson; } /* peso 100 */

/* Num <p class="aviso" id="urgente">, vence o vermelho. */`,
        exemploComo: 'css',
        exemploMarcacao: `<p>Sou só um parágrafo: cinza.</p>
<p class="aviso">Tenho classe: azul-marinho.</p>
<p class="aviso" id="urgente">Tenho classe e identificador: vermelho.</p>`,
        atencao: 'A saída fácil para vencer uma disputa é !important. Ele resolve hoje e cria a disputa de amanhã: o próximo ajuste precisará de outro !important, e daí ninguém mais sabe qual regra manda.',
        marcas: ['especificidade', '!important'],
      },
    ],
  },

  {
    id: 'aparencia',
    titulo: 'Cores, letras e medidas',
    resumo: 'Como se escolhe a cor, a fonte e o tamanho — e qual unidade usar.',
    topicos: [
      {
        id: 'cores',
        titulo: 'Cores',
        resumo: 'Três formas de escrever a mesma cor.',
        explicacao: [
          'Pelo nome: crimson, navy, gold. São cento e quarenta e poucos nomes, bons para começar e limitados depois.',
          'Pelo código de seis dígitos depois de uma cerquilha: dois para o vermelho, dois para o verde, dois para o azul. É a forma mais comum, e é o que todo programa de desenho copia para você.',
          'Por rgb(), com os três valores separados. A vantagem é aceitar um quarto número, a opacidade, em rgba() — útil para um fundo que deixa ver o que está atrás.',
        ],
        exemplo: `.aviso { background-color: gold; }
.cartao { background-color: #F4F1EA; }
#topo { color: white; background-color: rgb(27, 77, 62); }`,
        exemploComo: 'css',
        exemploMarcacao: `<p id="topo">Clube Pioneiros</p>
<p class="aviso">Traga garrafa de água.</p>
<div class="cartao">Unidade Falcão</div>`,
        atencao: 'Cor de texto e cor de fundo se decidem juntas. Cinza-claro sobre branco fica bonito na tela do quarto e some no sol da rua — e some sempre para quem enxerga pouco.',
        marcas: ['color', 'background-color', '#hex', 'rgb()'],
      },
      {
        id: 'fontes',
        titulo: 'Tipografia',
        resumo: 'A fonte, a reserva, e o espaço entre as linhas.',
        explicacao: [
          'font-family recebe uma lista, e não uma fonte. O navegador tenta a primeira; se não estiver no computador de quem lê, passa para a seguinte.',
          'A última da lista é sempre uma família genérica — serif, sans-serif ou monospace —, que existe em todo aparelho. Sem ela, o navegador escolhe sozinho e o resultado varia.',
          'line-height é o espaço entre as linhas. Texto grudado cansa; algo entre 1.4 e 1.7 costuma resolver, escrito sem unidade para acompanhar o tamanho da letra.',
        ],
        exemplo: `body {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1rem;
  line-height: 1.6;
}`,
        exemploComo: 'css',
        exemploMarcacao: `<h2>Unidade Falcão</h2>
<p>Georgia é uma fonte serifada: repare nos pezinhos das letras.</p>
<p>A entrelinha de 1,6 é o ar entre uma linha e a de baixo — é ela que deixa um
texto longo confortável de ler até o fim.</p>`,
        atencao: 'Nome de fonte com mais de uma palavra vai entre aspas. Sem elas o navegador lê duas fontes onde havia uma, e nenhuma das duas existe.',
        marcas: ['font-family', 'font-size', 'line-height'],
      },
      {
        id: 'unidades',
        titulo: 'px, %, em e rem',
        resumo: 'Quatro medidas, e quando cada uma é a certa.',
        explicacao: [
          'px é fixo. Dezesseis pixels são dezesseis pixels, não importa a tela nem a preferência de quem lê. Serve para o que precisa ser exato: a espessura de uma borda.',
          '% é relativo ao espaço disponível. Largura em % é o que faz a caixa caber tanto no celular quanto no computador.',
          'em parte do tamanho de letra do elemento que envolve. Bom para espaçamento que deve acompanhar o texto ao redor — e cuidado, porque se acumula em caixas dentro de caixas.',
          'rem parte do tamanho de letra da raiz da página, que é o que a pessoa escolheu no navegador. É a medida que respeita quem aumentou a letra para enxergar.',
        ],
        exemplo: `.cartao {
  border: 1px solid #DDD;  /* exato */
  width: 90%;              /* do espaço */
  padding: 0.75em;         /* do texto local */
  font-size: 1.125rem;     /* da raiz */
}`,
        exemploComo: 'css',
        exemploMarcacao: `<div class="cartao">Cada medida desta caixa vem de uma unidade diferente.</div>`,
        atencao: 'Uma página inteira escrita em px ignora quem aumentou a letra do navegador por não enxergar bem: o texto continua do mesmo tamanho. É a decisão mais fácil de tomar sem perceber, e uma das que mais excluem gente.',
        marcas: ['px', '%', 'em', 'rem'],
      },
    ],
  },

  {
    id: 'caixa',
    titulo: 'O modelo de caixa',
    resumo: 'Toda coisa na página é uma caixa, e ela tem quatro camadas.',
    topicos: [
      {
        id: 'quatro-camadas',
        titulo: 'As quatro camadas',
        resumo: 'Conteúdo, espaçamento interno, borda e margem.',
        explicacao: [
          'Todo elemento é uma caixa retangular, mesmo quando não parece. Um parágrafo é uma caixa; uma imagem é uma caixa.',
          'Do centro para fora são quatro camadas. O conteúdo, que é o texto ou a imagem. O padding, espaço entre o conteúdo e a borda. A borda, a linha do contorno. E a margem, o espaço entre esta caixa e as vizinhas.',
          'Quando o espaço está no lugar errado, a pergunta é sempre a mesma: é de dentro ou de fora? De dentro é padding; de fora é margem.',
        ],
        exemplo: `.cartao {
  padding: 1rem;
  border: 1px solid #DDD;
  margin: 1rem 0;
}`,
        exemploComo: 'css',
        exemploMarcacao: `<div class="cartao">O padding é o ar entre este texto e a linha em volta.</div>
<div class="cartao">E a margem é o espaço entre um cartão e o outro, por fora da linha.</div>`,
        atencao: 'Aumentar a margem para afastar o texto da borda não funciona: a margem move a caixa inteira, e o texto continua grudado. O que afasta o texto da borda é o padding.',
        marcas: ['padding', 'border', 'margin'],
      },
      {
        id: 'borda',
        titulo: 'A borda',
        resumo: 'Espessura, estilo e cor — e o estilo é obrigatório.',
        explicacao: [
          'A forma curta traz as três de uma vez: a espessura, o estilo do traço e a cor.',
          'O estilo não é opcional. O padrão é none, então uma borda com espessura e cor e sem estilo simplesmente não se desenha — e nada avisa.',
          'border-radius arredonda os cantos. Um valor grande, como 50%, transforma um quadrado num círculo.',
        ],
        exemplo: `#topo {
  border: 2px solid #1B4D3E;
  border-radius: 8px;
}`,
        exemploComo: 'css',
        exemploMarcacao: `<p id="topo">Clube Pioneiros</p>`,
        atencao: 'Espessura de borda é o caso em que px é a escolha certa: uma linha de contorno precisa ser exata, e não acompanhar o tamanho da letra.',
        marcas: ['border', 'solid', 'border-radius'],
      },
      {
        id: 'box-sizing',
        titulo: 'Onde a largura começa',
        resumo: 'Por que 200px viram 240px, e como consertar.',
        explicacao: [
          'Por padrão, width vale só para o conteúdo. O padding e a borda somam por fora, então uma caixa de 200px com 20px de padding ocupa 240px na tela.',
          'Isso surpreende todo mundo uma vez, e atrapalha sempre que se monta uma grade: as colunas param de fechar a conta.',
          'box-sizing: border-box muda a regra — a largura declarada passa a incluir o padding e a borda. É por isso que quase todo projeto começa aplicando isso a tudo.',
        ],
        exemplo: `* {
  box-sizing: border-box;
}

.cartao {
  width: 50%;   /* agora 50% de verdade */
  padding: 1rem;
}`,
        exemploComo: 'css',
        atencao: 'O asterisco pega todos os elementos da página. É a única situação em que ele se justifica: uma decisão que vale para a página inteira, escrita uma vez.',
        marcas: ['box-sizing', 'border-box', 'width'],
      },
    ],
  },

  {
    id: 'flex',
    titulo: 'Alinhar numa direção',
    resumo: 'Flexbox: pôr as peças em linha ou em coluna, e distribuir o espaço.',
    topicos: [
      {
        id: 'liga-o-modo',
        titulo: 'display: flex liga o modo',
        resumo: 'A caixa de fora manda, e as de dentro obedecem.',
        explicacao: [
          'Quem recebe display: flex é o contêiner — a caixa que envolve —, e não as peças. É ela que passa a decidir como dispor o que tem dentro.',
          'Assim que o modo liga, as peças ficam lado a lado, na ordem em que estão no HTML.',
          'Só isso, porém, não alinha nada. display: flex é a permissão; a disposição vem das propriedades seguintes.',
        ],
        exemplo: `#topo {
  display: flex;
}`,
        exemploComo: 'css',
        exemploMarcacao: `<header id="topo">
  <h1>Clube Pioneiros</h1>
  <p class="lema">Sempre prontos, sempre atentos.</p>
</header>`,
        atencao: 'Declarar display: flex nas peças em vez do contêiner não faz nada de útil. Se as peças não se moveram, confira em qual caixa a declaração está.',
        marcas: ['display: flex', 'contêiner'],
      },
      {
        id: 'dois-eixos',
        titulo: 'Os dois eixos',
        resumo: 'justify-content ao longo da linha, align-items no outro sentido.',
        explicacao: [
          'Numa linha, justify-content distribui as peças da esquerda para a direita: no começo, no meio, no fim, ou com o espaço repartido entre elas.',
          'align-items trata do outro sentido, o vertical: em cima, no meio, embaixo, ou esticadas até a mesma altura.',
          'flex-direction: column troca os dois de papel — o eixo principal vira o vertical, e justify-content passa a distribuir de cima para baixo.',
        ],
        exemplo: `#topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
}`,
        exemploComo: 'css',
        exemploMarcacao: `<header id="topo">
  <h1>Pioneiros</h1>
  <p class="lema">Sempre prontos.</p>
</header>`,
        atencao: 'A dupla se confunde justamente porque os nomes não dizem "horizontal" e "vertical" — e não dizem de propósito, porque qual é qual depende de flex-direction.',
        marcas: ['justify-content', 'align-items', 'flex-direction'],
      },
      {
        id: 'gap-e-wrap',
        titulo: 'gap e a quebra de linha',
        resumo: 'Espaço entre as peças, e permissão para descer.',
        explicacao: [
          'gap põe espaço entre as peças, e só entre. Resolve o que a margem resolvia mal: com margem, sempre sobrava espaço numa das pontas.',
          'Por padrão o flex não quebra linha — ele espreme as peças até caberem. Num celular, cinco cartões viram cinco tirinhas ilegíveis.',
          'flex-wrap: wrap é a permissão para a peça que não cabe descer para a linha de baixo. Com ele, o mesmo arranjo serve às duas telas.',
        ],
        exemplo: `main {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}`,
        exemploComo: 'css',
        exemploMarcacao: `<main>
  <div class="cartao">Unidade Falcão</div>
  <div class="cartao">Unidade Águia</div>
  <div class="cartao">Unidade Tucano</div>
  <div class="cartao">Unidade Arara Azul</div>
</main>`,
        atencao: 'Quando as peças ficam espremidas em vez de descerem, o que falta quase sempre é o wrap — e não uma consulta de mídia.',
        marcas: ['gap', 'flex-wrap'],
      },
    ],
  },

  {
    id: 'grid',
    titulo: 'Alinhar em duas direções',
    resumo: 'Grid: linhas e colunas que se alinham entre si.',
    topicos: [
      {
        id: 'linhas-e-colunas',
        titulo: 'A grade',
        resumo: 'Dizer quantas colunas, e de que tamanho.',
        explicacao: [
          'display: grid liga a grade no contêiner, como o flex. A diferença é que a grade tem duas dimensões: linhas e colunas.',
          'grid-template-columns diz o formato. Cada valor é uma coluna, então dois valores fazem duas colunas.',
          'Sem esse formato, a grade nasce com uma coluna só — e as peças continuam empilhadas, o que faz parecer que o display não funcionou.',
        ],
        exemplo: `main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}`,
        exemploComo: 'css',
        exemploMarcacao: `<main>
  <div class="cartao">Falcão</div>
  <div class="cartao">Águia</div>
  <div class="cartao">Tucano</div>
  <div class="cartao">Arara</div>
</main>`,
        atencao: 'O número de colunas é o número de valores, e não um número que se escreve. Três colunas iguais são três valores: 1fr 1fr 1fr.',
        marcas: ['display: grid', 'grid-template-columns'],
      },
      {
        id: 'fracao',
        titulo: 'A fração do espaço',
        resumo: 'fr divide o que sobrou.',
        explicacao: [
          'fr não é uma medida fixa: é uma fatia do espaço que sobrou depois do que tem tamanho definido.',
          '2fr 1fr divide em três partes e dá duas para a primeira coluna. 1fr 1fr divide em duas iguais.',
          'Dá para misturar: 200px 1fr faz uma coluna fixa de 200 pixels e outra que ocupa todo o resto.',
        ],
        exemplo: `main {
  display: grid;
  grid-template-columns: 2fr 1fr;
}`,
        exemploComo: 'css',
        exemploMarcacao: `<main>
  <div class="cartao">Esta coluna vale 2fr, e por isso fica com o dobro do espaço da outra.</div>
  <div class="cartao">Esta vale 1fr.</div>
</main>`,
        atencao: 'fr resolve o que a porcentagem complica: 50% e 50% com gap no meio estoura a largura, porque a soma passa de cem por cento. Com fr, o gap é descontado antes da divisão.',
        marcas: ['fr', 'gap'],
      },
      {
        id: 'qual-usar',
        titulo: 'Flex ou Grid?',
        resumo: 'Uma direção ou duas.',
        explicacao: [
          'Flex pensa numa direção: uma fila de botões, uma barra de topo, uma lista de etiquetas. As peças se acomodam conforme o tamanho de cada uma.',
          'Grid pensa em duas: uma galeria de cartões em que as colunas precisam se alinhar, um layout de página com cabeçalho, lateral e conteúdo.',
          'Os dois convivem, e o mais comum é usar os dois na mesma página — grid para o arranjo geral, flex dentro de cada peça.',
        ],
        exemplo: `/* grade de cartões */
main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* fila dentro de cada cartão */
.cartao {
  display: flex;
  justify-content: space-between;
}`,
        exemploComo: 'css',
        exemploMarcacao: `<main>
  <div class="cartao"><span>Unidade Falcão</span><span>12</span></div>
  <div class="cartao"><span>Unidade Águia</span><span>9</span></div>
</main>`,
        atencao: 'Grid não substituiu o flex. Escolher grid para uma fila de três botões dá mais trabalho e não devolve nada.',
        marcas: ['flex', 'grid'],
      },
    ],
  },

  {
    id: 'telas',
    titulo: 'A mesma página em qualquer tela',
    resumo: 'Por que a página quebra no celular, e o que a consulta de mídia resolve.',
    topicos: [
      {
        id: 'por-que-quebra',
        titulo: 'Por que a página sai pela lateral',
        resumo: 'Quase sempre é uma largura fixa.',
        explicacao: [
          'A página fica boa no computador e no celular aparece uma barra de rolagem lateral. A causa mais comum é uma caixa com largura em px maior do que a tela.',
          'Medida que encolhe resolve boa parte disso antes de qualquer outra coisa: % para largura, ou max-width, que põe um teto sem obrigar a caixa a ter aquele tamanho.',
          'A imagem é o outro culpado frequente. Uma foto de 1200 pixels empurra a página inteira até que se diga que ela pode encolher.',
        ],
        exemplo: `.cartao {
  max-width: 40rem;
  width: 100%;
}

img {
  max-width: 100%;
}`,
        exemploComo: 'css',
        atencao: 'Antes de escrever a primeira consulta de mídia, procure a largura fixa. Consulta de mídia que remenda uma medida errada esconde o problema em vez de resolvê-lo.',
        marcas: ['max-width', 'width: 100%'],
      },
      {
        id: 'consulta',
        titulo: 'A consulta de mídia',
        resumo: 'Regras que só valem em certas larguras.',
        explicacao: [
          '@media abre um bloco de regras que só entram em vigor quando a condição é verdadeira. Fora dela, nada muda.',
          '(max-width: 600px) é um teto: vale de 600 pixels para baixo. (min-width: 900px) é um piso: vale de 900 para cima.',
          'Dentro do bloco vão seletores completos, como em qualquer outro lugar do arquivo. O que muda é só quando eles valem.',
        ],
        exemplo: `main {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

@media (max-width: 600px) {
  main { grid-template-columns: 1fr; }
}`,
        exemploComo: 'css',
        atencao: 'São duas chaves a fechar: a da regra e a da consulta. Esquecer uma faz o navegador descartar o bloco inteiro, em silêncio, e nada muda em tela nenhuma.',
        marcas: ['@media', 'max-width', 'min-width'],
      },
      {
        id: 'pequeno-primeiro',
        titulo: 'Começar pelo pequeno',
        resumo: 'O que não pode faltar vem primeiro.',
        explicacao: [
          'Escrever primeiro o estilo do celular obriga a decidir o que é essencial. O que sobra é o que se acrescenta quando há espaço.',
          'Fazendo o contrário — começar pelo computador e ir cortando — a tela pequena vira uma versão mutilada da grande, e o corte é sempre feito às pressas.',
          'Na prática: o arquivo começa com as regras que valem para todo mundo, e as consultas de mídia com min-width acrescentam o que só faz sentido em tela larga.',
        ],
        exemplo: `/* vale para todos */
main { display: grid; grid-template-columns: 1fr; }

/* a partir de tablet */
@media (min-width: 700px) {
  main { grid-template-columns: 1fr 1fr; }
}`,
        exemploComo: 'css',
        atencao: 'Medida relativa resolve tamanho; consulta de mídia resolve arranjo. Três colunas que viram uma não são questão de encolher — é decisão de arranjo, e só a consulta de mídia toma.',
        marcas: ['min-width', 'mobile-first'],
      },
    ],
  },

];

const cap = (id: string): Capitulo => {
  const c = CAPITULOS.find(x => x.id === id);
  if (!c) throw new Error(`Capítulo de CSS desconhecido: ${id}`);
  return c;
};

/** O laboratório desta vereda: sempre a mesma página, sempre a folha em branco. */
const laboratorio = (
  id: string, titulo: string, resumo: string, comentario: string, verificacoes: string[],
) => ({
  id, tipo: 'laboratorio' as const, titulo, resumo,
  linguagem: 'css' as const,
  arquivo: 'estilo.css',
  projeto: 'mural-do-clube',
  marcacao: PAGINA_DO_MURAL,
  modelo: modelo(comentario),
  verificacoes,
});

export const MODULOS_DE_CSS: ModuloDeVereda[] = [
  {
    id: 'm1',
    titulo: 'O que o CSS é',
    resumo: 'A regra de estilo, o arquivo onde ela mora, e por que isto não é programar.',
    licoes: [
      {
        id: 'm1-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_CSS['m1-teoria'],
        titulo: 'Seletor, propriedade e valor',
        resumo: 'As três partes de uma regra, e onde a folha de estilo mora.',
        topicos: cap('regra').topicos,
      },
      laboratorio(
        'm1-lab',
        'A primeira folha de estilo',
        'Pinte o mural: uma regra de elemento, uma cor de texto e uma cor de fundo.',
        'Sua primeira folha de estilo.',
        ['seletorElemento', 'cor', 'corDeFundo'],
      ),
    ],
  },

  {
    id: 'm2',
    titulo: 'A quem a regra fala',
    resumo: 'Elemento, classe e identificador; herança, cascata e especificidade.',
    licoes: [
      {
        id: 'm2-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_CSS['m2-teoria'],
        titulo: 'Os três seletores, e quem vence',
        resumo: 'Como apontar para o elemento certo, e o que acontece quando duas regras discordam.',
        topicos: cap('seletores').topicos,
      },
      laboratorio(
        'm2-lab',
        'Cada peça no seu lugar',
        'Use os três seletores no mesmo mural: a tag, a classe e o identificador.',
        'Agora com os três seletores.',
        ['seletorElemento', 'seletorClasse', 'seletorId'],
      ),
    ],
  },

  {
    id: 'm3',
    titulo: 'Cores, letras e medidas',
    resumo: 'A cor, a fonte, o tamanho do texto e a unidade que acompanha a tela.',
    licoes: [
      {
        id: 'm3-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_CSS['m3-teoria'],
        titulo: 'A aparência do texto',
        resumo: 'Escrever cor, escolher fonte com reserva, e decidir entre px, %, em e rem.',
        topicos: cap('aparencia').topicos,
      },
      laboratorio(
        'm3-lab',
        'A cara do mural',
        'Dê fonte, tamanho e cor ao mural — e ao menos uma medida que acompanhe a tela.',
        'A tipografia do mural.',
        ['tipografia', 'tamanhoDeTexto', 'cor', 'corDeFundo', 'unidadeRelativa'],
      ),
    ],
  },

  {
    id: 'm4',
    titulo: 'O modelo de caixa',
    resumo: 'As quatro camadas de toda caixa, a borda, e onde a largura começa.',
    licoes: [
      {
        id: 'm4-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_CSS['m4-teoria'],
        titulo: 'Dentro, fora e a linha entre os dois',
        resumo: 'Conteúdo, padding, borda e margem — e por que 200px viram 240px.',
        topicos: cap('caixa').topicos,
      },
      laboratorio(
        'm4-lab',
        'O mural respira',
        'Dê espaço aos cartões: por dentro, por fora, e uma linha em volta.',
        'Agora o espaço.',
        ['espacamento', 'borda', 'margem'],
      ),
    ],
  },

  {
    id: 'm5',
    titulo: 'Alinhar numa direção',
    resumo: 'Flexbox: pôr em linha, distribuir o espaço e deixar quebrar.',
    licoes: [
      {
        id: 'm5-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_CSS['m5-teoria'],
        titulo: 'O contêiner manda',
        resumo: 'Os dois eixos, o espaço entre as peças, e a permissão para descer.',
        topicos: cap('flex').topicos,
      },
      laboratorio(
        'm5-lab',
        'O topo em linha',
        'Ponha o nome do clube e o lema lado a lado, alinhados e com respiro entre eles.',
        'O cabeçalho em linha.',
        ['flex', 'espacamento'],
      ),
    ],
  },

  {
    id: 'm6',
    titulo: 'Alinhar em duas direções',
    resumo: 'Grid: colunas que se alinham, e a fração do espaço.',
    licoes: [
      {
        id: 'm6-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_CSS['m6-teoria'],
        titulo: 'A grade e a fração',
        resumo: 'Quantas colunas, de que tamanho, e quando grid é melhor que flex.',
        topicos: cap('grid').topicos,
      },
      laboratorio(
        'm6-lab',
        'Os cartões em grade',
        'Ponha os dois cartões do mural lado a lado, numa grade com espaço entre eles.',
        'Os cartões em grade.',
        ['grid', 'unidadeRelativa'],
      ),
    ],
  },

  {
    id: 'm7',
    titulo: 'A mesma página em qualquer tela',
    resumo: 'Por que a página quebra no celular, e o que a consulta de mídia resolve.',
    licoes: [
      {
        id: 'm7-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_CSS['m7-teoria'],
        titulo: 'Consulta de mídia',
        resumo: 'A largura fixa que estoura, o bloco que só vale às vezes, e por onde começar.',
        topicos: cap('telas').topicos,
      },
      /*
        O último laboratório cobra a vereda inteira.
        
        É o requisito 6 do documento — a página legível em celular, tablet e
        computador — e o 7, reproduzir um arranjo dado: o mural terminado é o
        arranjo, e o que se confere é que todas as peças aprendidas estão nele.
      */
      laboratorio(
        'm7-lab',
        'O mural em qualquer tela',
        'O mural terminado: os três seletores, o espaço, o alinhamento nas duas direções e o ajuste para o celular.',
        'O mural terminado.',
        [
          'seletorElemento', 'seletorClasse', 'seletorId',
          'cor', 'corDeFundo', 'tipografia', 'tamanhoDeTexto',
          'margem', 'espacamento', 'borda',
          'unidadeRelativa', 'flex', 'grid', 'consultaDeMidia',
        ],
      ),
    ],
  },
];
