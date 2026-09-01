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
 * A ordem dos módulos é a ordem do documento oficial: o que a linguagem é,
 * como se escolhe a quem falar, e como se decide a aparência do texto.
 */

import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DE_CSS } from './questoesDeCss';

/*
  A página do mural, a mesma nos três laboratórios.

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
#topo { background-color: rgb(27, 77, 62); }`,
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
        atencao: 'Uma página inteira escrita em px ignora quem aumentou a letra do navegador por não enxergar bem: o texto continua do mesmo tamanho. É a decisão mais fácil de tomar sem perceber, e uma das que mais excluem gente.',
        marcas: ['px', '%', 'em', 'rem'],
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
];
