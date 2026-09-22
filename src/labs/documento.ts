/**
 * O documento de texto, como os laboratórios de Word o guardam.
 *
 * ── Por que ele saiu do arquivo de metas ─────────────────────────────────
 * Ele morava em `metasDaAp044.ts`, misturado com o que aquele exercício cobra,
 * e saiu no dia em que a CC-ES002 precisou do mesmo documento — antes de a
 * cópia existir, e não depois. É a decisão de `word.tsx`, de `excel.tsx` e de
 * `explorer.tsx`, um nível abaixo: duas cópias do modelo divergem no primeiro
 * ajuste, e aí o mesmo "Word" passa a guardar duas coisas diferentes.
 *
 * O que ficou aqui é do **documento**: o que é um parágrafo, o que é um
 * estilo, o que o sumário lê. O que ficou lá é do **exercício**: de que
 * documento se parte e o que se cobra dele.
 *
 * ── O sumário guarda o que leu, e isso é do modelo ───────────────────────
 * `sumario` é uma lista gravada, e não uma conta feita na hora. Não é preguiça
 * de modelagem: é o comportamento do Word, e é a metade da lição que ninguém
 * conta — trocar um título depois de gerar deixa o sumário mostrando o texto
 * velho, e nada na tela avisa. Um modelo que recalculasse o sumário a cada
 * leitura apagaria a lição inteira, e o laboratório passaria a premiar um
 * cuidado que ele não teve como cobrar.
 *
 * ── A seção é um parâmetro, e não uma lista fechada ──────────────────────
 * Cada laboratório tem as seções do documento dele — a AP044 tem capa,
 * abertura e programação; a CC-ES002 terá outras. Deixar a lista aqui
 * obrigaria os dois a caber na mesma, e a alternativa preguiçosa seria trocar
 * tudo por `string`, o que devolveria o erro de digitar uma seção que não
 * existe. Com o parâmetro, cada lado declara a sua e continua conferido.
 */

import type { CSSProperties } from 'react';

/* ── Estilos ──────────────────────────────────────────────────────────────── */

/**
 * Os estilos de parágrafo que os laboratórios da plataforma desenham.
 *
 * A lista é do Word, e não de um exercício: cada laboratório oferece na galeria
 * dele os que a lição usa, e os outros continuam existindo no modelo. Foi assim
 * que a AP044 pôde ficar com quatro sem que a CC-ES002 tivesse de inventar
 * nomes novos para Título 3 e Legenda.
 *
 * Ênfase não está aqui: ela é estilo de **caractere**, vale para o trecho
 * selecionado e mora em `Trecho`. A diferença não é detalhe de implementação —
 * é a razão de Ênfase não entrar no sumário e Título 2 entrar.
 */
export type Estilo =
  | 'Normal'
  | 'Título 1'
  | 'Título 2'
  | 'Título 3'
  | 'Subtítulo'
  | 'Citação'
  | 'Legenda';

/** Os estilos que o sumário procura, e o nível que cada um rende. */
export const NIVEL_DO_TITULO: Partial<Record<Estilo, 1 | 2 | 3>> = {
  'Título 1': 1,
  'Título 2': 2,
  'Título 3': 3,
};

export const ehTitulo = (e: Estilo) => NIVEL_DO_TITULO[e] !== undefined;

export type Posicao = 'normal' | 'sobrescrito' | 'subscrito';
export type Realce = 'nenhum' | 'amarelo' | 'verde' | 'ciano' | 'rosa';

/* ── Aparência de cada estilo, com os números do Word ───────────────────────
   Título 1 é 16 pt azul #2F5496, Título 2 é 13 pt no mesmo azul, Citação é
   itálico recuado. Não são escolhas nossas: é o que a galeria de Estilos do
   Word aplica, e o desbravador precisa reconhecer o resultado lá.

   Ela mora junto da lista dos estilos, e não no laboratório, por dois motivos.
   O primeiro é o de sempre: dois laboratórios desenham a mesma galeria, e duas
   tabelas de aparência divergiriam no primeiro ajuste — o mesmo Título 1 sairia
   azul num e preto no outro. O segundo é que um estilo **é** o nome mais a
   aparência; separá-los deixaria a lista de nomes aqui e o que eles significam
   noutro arquivo, e acrescentar um estilo passaria a ser dois trabalhos, com o
   segundo fácil de esquecer.

   Nenhuma entrada usa a forma curta `margin`: misturar `margin` com
   `marginLeft` no mesmo objeto faz o React reclamar e, pior, deixa a ordem de
   aplicação decidir quem vence. Cada lado é escrito por extenso. */
export const APARENCIA_DO_ESTILO: Record<Estilo, CSSProperties> = {
  'Normal': {
    fontSize: 11, color: '#201F1E',
    marginTop: 0, marginBottom: 5, marginLeft: 0, marginRight: 0,
  },
  'Título 1': {
    fontSize: 16, color: '#2F5496', fontWeight: 400,
    marginTop: 10, marginBottom: 4, marginLeft: 0, marginRight: 0,
  },
  'Título 2': {
    fontSize: 13, color: '#2F5496', fontWeight: 600,
    marginTop: 8, marginBottom: 3, marginLeft: 0, marginRight: 0,
  },
  'Título 3': {
    fontSize: 12, color: '#1F3864', fontWeight: 600,
    marginTop: 6, marginBottom: 3, marginLeft: 0, marginRight: 0,
  },
  'Subtítulo': {
    fontSize: 13, color: '#5A5A5A', fontStyle: 'italic',
    marginTop: 2, marginBottom: 8, marginLeft: 0, marginRight: 0,
  },
  'Citação': {
    fontSize: 11, color: '#404040', fontStyle: 'italic',
    marginTop: 6, marginBottom: 6, marginLeft: 26, marginRight: 26,
  },
  'Legenda': {
    fontSize: 9, color: '#44546A', fontStyle: 'italic',
    marginTop: 2, marginBottom: 8, marginLeft: 0, marginRight: 0,
  },
};

/* ── As peças ─────────────────────────────────────────────────────────────── */

/**
 * Formatação direta: negrito, tamanho e cor postos no trecho, por cima do que
 * o estilo dele já diz.
 *
 * É o que o requisito 6 da CC-ES002 manda substituir por estilo, e por isso
 * precisa existir como estado — um documento em que ela não pudesse ser
 * representada não teria como chegar mal formatado, e o exercício inteiro
 * dependeria de acreditar num enunciado.
 *
 * Ela **vence** o estilo na hora de desenhar, como no Word. É essa precedência
 * que faz o documento mal formatado parecer pronto: os títulos estão em negrito
 * e grandes, só que continuam sendo parágrafos Normal — e o sumário, que lê
 * estilo e não aparência, sai vazio sem nada na tela explicando por quê.
 */
export interface Direta {
  negrito?: boolean;
  italico?: boolean;
  tamanho?: number;
  cor?: string;
}

/**
 * Um campo de numeração — o que `Referências › Inserir Legenda` insere.
 *
 * Ele não guarda o número: o número sai da **posição** entre os campos do
 * mesmo tipo, contada na hora de desenhar. É essa a diferença inteira do
 * requisito 4.3, e ela só existe se o modelo se recusar a guardar o número:
 * um campo que gravasse `'Figura 1'` seria texto digitado com outro nome, e
 * entrar uma figura no meio o deixaria dizendo 1 para sempre.
 */
export type Campo = 'figura' | 'tabela' | 'pagina';

/** Como cada campo se lê na folha. A página não leva nome: é só o número. */
export const NOME_DO_CAMPO: Record<Campo, string> = {
  figura: 'Figura',
  tabela: 'Tabela',
  pagina: '',
};

/**
 * Os campos que se numeram pela **posição no documento**, cada um na série
 * dele.
 *
 * O da página não entra, e não é exceção arbitrária: ele é de outra natureza.
 * Figura e Tabela contam quantos vieram antes no texto; o da página conta em
 * que folha ele está sendo desenhado, e a mesma ocorrência dele — uma só, no
 * rodapé — mostra um número diferente em cada página. No Word são dois campos
 * diferentes pela mesma razão, SEQ e PAGE.
 */
export const CAMPOS_EM_SERIE: readonly Campo[] = ['figura', 'tabela'];

/**
 * Quem assina uma marca de revisão ou um comentário.
 *
 * São dois de propósito, e não uma `string` com o nome de quem quer que seja:
 * o documento do módulo 5 chega revisado pela liderança, e o que a lição cobra
 * é a diferença entre **a marca que veio de fora** e a que a pessoa acabou de
 * fazer. Com nome livre, "aceite as marcas da liderança" viraria comparação de
 * texto, e um erro de digitação no nome deixaria a tarefa impossível sem nada
 * acusar.
 */
/*
  A CC-ES006 acrescentou três nomes, e não trocou os dois que já estavam aqui.

  A vereda de Trabalho Compartilhado precisa de gente com nome: o requisito 8
  pede um documento feito com **no mínimo duas outras pessoas**, comprovado no
  histórico, e "Liderança" não é uma pessoa — é um papel, e o documento da
  CC-ES002 tem razão de chamá-la assim, porque lá ela é quem revisa e não
  importa quem seja.

  Alargar a união e não trocá-la custa duas linhas e mantém a CC-ES002
  intocada. E o compilador cobra o resto sozinho: `NOME_DO_AUTOR` e
  `COR_DO_AUTOR` são `Record<Autor, …>`, então um nome novo sem cor não
  compila — que é o contrário do mapa que aceita a chave faltando e desenha
  `undefined` na tela.
*/
export type Autor = 'voce' | 'lideranca' | 'marta' | 'ronaldo' | 'cleide';

/** Como o autor se assina na margem e no balão. */
export const NOME_DO_AUTOR: Record<Autor, string> = {
  voce: 'Você',
  lideranca: 'Liderança',
  marta: 'Marta',
  ronaldo: 'Ronaldo',
  cleide: 'Cleide',
};

/**
 * A cor de cada revisor, e por que ela é constante e não só uma classe.
 *
 * `aparenciaDoTrecho` devolve `style` inline — é ela que carrega a formatação
 * direta —, e estilo inline vence classe. A regra de folha existia, media
 * 7,3:1 e 5,4:1 sobre o papel branco, e **nunca chegava à tela**: as duas
 * marcas saíam na cor do corpo do documento, com o traço e o sublinhado
 * certos e a autoria dizendo nada. Quem viu foi o navegador; no jsdom não há
 * cascata para atropelar.
 *
 * Então a cor vai inline por cima, que também é o que o Word faz: a marca de
 * revisão pinta o texto na cor do revisor seja qual for a cor dele no
 * documento.
 */
export const COR_DO_AUTOR: Record<Autor, string> = {
  lideranca: '#A4262C',
  voce: '#0F6CBD',
  /* As três da CC-ES006 foram medidas sobre o papel branco como as duas de
     cima, e são distinguíveis entre si também por quem não separa vermelho de
     verde: os tons ficam em claridades diferentes, e não só em matizes
     diferentes. É a razão de a marca ser riscada **e** sublinhada além de
     colorida. */
  marta: '#B14A00',
  ronaldo: '#146B4F',
  cleide: '#6B2FA8',
};

/** O que a marca fez com o trecho: ele entrou, ou ele saiu. */
export interface Revisao {
  autor: Autor;
  tipo: 'inserido' | 'excluido';
}

export interface Trecho {
  id: string;
  /**
   * O texto **digitado**. Num trecho que é campo ele fica vazio: o que se lê
   * ali é calculado, e guardar as duas coisas deixaria a folha mostrando uma e
   * a conferência lendo a outra.
   */
  texto: string;
  /** Quando presente, este trecho é um campo de numeração, e não texto. */
  campo?: Campo;
  /**
   * Quebra de linha **antes** deste trecho — o `Shift+Enter` do Word.
   *
   * Ela desce uma linha sem fechar o parágrafo, então mora dentro do bloco e
   * não entre blocos. É essa a diferença que o requisito 2.3 pede: três Enters
   * num endereço são três parágrafos, e ganham três vezes o espaçamento de
   * depois; duas quebras de linha são um parágrafo só, com as linhas coladas.
   *
   * Sem ela no modelo, o endereço só poderia ser escrito do jeito errado, e a
   * lição não teria o que consertar.
   */
  quebra?: boolean;
  /** Formatação direta, quando há. Ausente é o normal. */
  direta?: Direta;
  posicao: Posicao;
  realce: Realce;
  /** Estilo de caractere — o único é Ênfase, e é de propósito. */
  enfase: boolean;
  /**
   * Formatação direta que veio de fora e foi mantida na colagem.
   *
   * É o que "Manter Formatação Original" preserva e o que "Manter Somente
   * Texto" descarta: a fonte, o tamanho e a cor do lugar de origem, que não
   * são os do documento.
   */
  deFora?: boolean;
  /**
   * A marca de revisão, quando este trecho entrou ou saiu com o controle de
   * alterações ligado.
   *
   * Ela mora no trecho, e não no parágrafo, porque é isso que ela é: no Word
   * a marca é de um pedaço de texto, e o mesmo parágrafo tem palavra inserida,
   * palavra riscada e palavra intocada ao mesmo tempo. Marca por parágrafo
   * obrigaria a lição a riscar a frase inteira para trocar uma palavra, que é
   * o contrário do que o recurso mostra.
   *
   * Nada disso é definitivo, e é aí que está a lição: o texto só muda de
   * verdade quando alguém aceita ou rejeita. Um `'excluido'` continua na tela,
   * riscado, e volta inteiro se for rejeitado.
   */
  revisao?: Revisao;
}

/**
 * O que todo bloco do corpo tem, seja ele parágrafo, tabela ou imagem.
 *
 * A quebra de página fica aqui e não no parágrafo porque `Ctrl+Enter` empurra
 * o que vier depois, e o que vem depois pode ser uma tabela. Deixá-la só no
 * parágrafo obrigaria quem quisesse a tabela na folha seguinte a pôr um
 * parágrafo vazio antes dela — que é exatamente o gesto que o módulo 2 existe
 * para desensinar.
 */
interface BlocoBase<S extends string> {
  id: string;
  secao: S;
  /**
   * Quebra de página antes deste bloco — `Ctrl+Enter`.
   *
   * É o que empurra texto para a folha seguinte sem os oito parágrafos vazios
   * que a teoria desaconselha. Os dois se parecem na tela do dia em que foram
   * escritos, e só um continua certo quando o texto de cima cresce.
   */
  quebraDePagina?: boolean;
}

export interface Paragrafo<S extends string = string> extends BlocoBase<S> {
  tipo: 'paragrafo';
  trechos: Trecho[];
  estilo: Estilo;
  /** Nota de rodapé pendurada neste parágrafo. */
  nota?: string;
}

/**
 * Os estilos da galeria de tabela, com os nomes do Word em português.
 *
 * `'Tabela com Grade'` é o que `Inserir › Tabela` aplica sozinho — a grade
 * crua, linha preta fina em tudo. Ela está na lista, e não fora dela, porque
 * é um estilo de verdade e não um estado de "sem estilo": tratá-la como
 * ausência obrigaria a folha a ter um desenho para o caso de não haver nenhum,
 * e aí a galeria passaria a ter quatro entradas em vez de três.
 */
export const ESTILOS_DE_TABELA = [
  'Tabela com Grade',
  'Tabela de Lista 3',
  'Tabela de Grade 4 — Ênfase 1',
] as const;

export type EstiloDeTabela = typeof ESTILOS_DE_TABELA[number];

/** O que `Inserir › Tabela` aplica sem ninguém escolher nada. */
export const ESTILO_PADRAO_DE_TABELA: EstiloDeTabela = 'Tabela com Grade';

export interface TabelaDoDoc<S extends string = string> extends BlocoBase<S> {
  tipo: 'tabela';
  /**
   * As células, linha a linha. Toda linha tem o mesmo número de células —
   * é o que `larguraDaTabela` confere, porque uma linha curta desenharia uma
   * tabela com buraco e nada estouraria.
   */
  linhas: string[][];
  /**
   * A primeira linha é cabeçalho.
   *
   * Não é enfeite: é ela que se repete no alto da folha seguinte quando a
   * tabela atravessa duas páginas. Uma tabela que muda de página sem cabeçalho
   * marcado vira, na segunda folha, uma tabela sem títulos de coluna — e quem
   * a lê não tem como saber o que é cada uma.
   */
  cabecalho: boolean;
  estilo: EstiloDeTabela;
}

/**
 * A disposição do texto em volta da imagem, com os seis nomes do Word.
 *
 * `'alinhada'` é como a imagem **nasce**: ela entra na linha como se fosse uma
 * letra gigante, empurrando o parágrafo inteiro. Os cinco outros a tiram da
 * linha — e só três deles arrumam o texto em volta dela, que é o que o
 * requisito 4.3 chama de ajustar ao texto.
 */
export type Disposicao =
  | 'alinhada'
  | 'quadrada'
  | 'proxima'
  | 'atras'
  | 'frente'
  | 'acima-e-abaixo';

export const NOMES_DA_DISPOSICAO: Record<Disposicao, string> = {
  alinhada: 'Alinhada com o Texto',
  quadrada: 'Quadrada',
  proxima: 'Próxima',
  atras: 'Atrás do Texto',
  frente: 'À Frente do Texto',
  'acima-e-abaixo': 'Acima e Abaixo',
};

/**
 * As disposições que de fato **arrumam o texto** em volta da imagem.
 *
 * Atrás e à frente não entram, e não é rigor nosso: elas fazem o texto
 * *ignorar* a imagem, que é o contrário de ajustá-la a ele. É a mesma
 * distinção do "abrir com" que não é "definir padrão" — dois comandos que se
 * parecem na hora de clicar e respondem a perguntas diferentes.
 */
export const DISPOSICOES_QUE_AJUSTAM: readonly Disposicao[] =
  ['quadrada', 'proxima', 'acima-e-abaixo'];

export interface ImagemDoDoc<S extends string = string> extends BlocoBase<S> {
  tipo: 'imagem';
  /** O nome do arquivo, que é o que o painel de informações mostra. */
  arquivo: string;
  /** O que a foto mostra. É isto que a folha desenha, já que não há foto. */
  descricao: string;
  disposicao: Disposicao;
}

/**
 * Um bloco do corpo do documento.
 *
 * Tabela e imagem **não são parágrafos**, e é por isso que elas são membros da
 * união em vez de campos pendurados num. No Word também não são: o cursor não
 * anda dentro delas como anda no texto, elas não têm estilo de parágrafo, e
 * elas convocam guias contextuais que o texto não convoca. Um `tabela?:` dentro
 * do parágrafo deixaria representável o parágrafo que é tabela **e** tem
 * trechos, que não existe — e cada leitor teria de lembrar qual dos dois vale.
 *
 * A legenda, sim, é parágrafo: no Word ela é um parágrafo de estilo Legenda com
 * um campo dentro. Pendurá-la na imagem tiraria dela o estilo, e com ele o
 * índice de figuras e a metade do requisito 4.3 que o módulo 1 já ensinou.
 */
export type Bloco<S extends string = string> =
  | Paragrafo<S>
  | TabelaDoDoc<S>
  | ImagemDoDoc<S>;

export const ehParagrafo = <S extends string>(b: Bloco<S>): b is Paragrafo<S> =>
  b.tipo === 'paragrafo';

export const ehTabela = <S extends string>(b: Bloco<S>): b is TabelaDoDoc<S> =>
  b.tipo === 'tabela';

export const ehImagem = <S extends string>(b: Bloco<S>): b is ImagemDoDoc<S> =>
  b.tipo === 'imagem';

/* ── Comentários ──────────────────────────────────────────────────────────── */

/** Uma resposta dentro de um comentário. A conversa fica encadeada ali. */
export interface RespostaDeComentario {
  id: string;
  autor: Autor;
  texto: string;
}

/**
 * Um comentário da margem, preso a um trecho do texto.
 *
 * Ele **não é o texto**: não sai na impressão comum, não entra no sumário e
 * não conta para "sem alterar uma palavra do texto". É por isso que ele é
 * lista à parte no `Doc` e não um `Trecho` com uma marca — pendurá-lo no texto
 * o faria aparecer em `textoDoDoc`, e a trava do módulo 1 passaria a acusar de
 * mudança de redação quem só tivesse perguntado uma coisa na margem.
 *
 * `resolvido` e apagar não são a mesma coisa, como no Word: o resolvido some
 * de quem só lê e continua lá para quem procura. Comentário que fica para
 * sempre vira ruído, e o próximo leitor não sabe se aquilo ainda importa.
 */
export interface Comentario {
  id: string;
  /** O id do trecho a que ele está preso. */
  trecho: string;
  autor: Autor;
  texto: string;
  respostas: RespostaDeComentario[];
  resolvido: boolean;
}

export const comentariosDoDoc = (d: Doc<string>): Comentario[] => d.comentarios ?? [];

/**
 * As quatro operações da margem.
 *
 * Elas moram aqui e não na tela porque são do **documento**: o balão desenha,
 * mas quem guarda a conversa é o arquivo, e é ele que a trava lê. Ficando na
 * tela, "resolvido sem resposta" só se testaria clicando.
 */
export const acrescentarComentario = <S extends string>(d: Doc<S>, c: Comentario): Doc<S> =>
  ({ ...d, comentarios: [...comentariosDoDoc(d), c] });

export const responderComentario = <S extends string>(
  d: Doc<S>, comentarioId: string, resposta: RespostaDeComentario,
): Doc<S> => ({
  ...d,
  comentarios: comentariosDoDoc(d).map(c =>
    c.id === comentarioId ? { ...c, respostas: [...c.respostas, resposta] } : c),
});

/**
 * Resolver e apagar não são a mesma coisa, e o Word tem os dois.
 *
 * Resolvido some de quem só lê e continua lá para quem procura; apagado não
 * volta. Oferecer só um deles faria a lição ensinar que comentário resolvido
 * desaparece, que é o contrário do que ele faz.
 */
export const resolverComentario = <S extends string>(
  d: Doc<S>, comentarioId: string, resolvido = true,
): Doc<S> => ({
  ...d,
  comentarios: comentariosDoDoc(d).map(c =>
    c.id === comentarioId ? { ...c, resolvido } : c),
});

export const removerComentario = <S extends string>(d: Doc<S>, comentarioId: string): Doc<S> =>
  ({ ...d, comentarios: comentariosDoDoc(d).filter(c => c.id !== comentarioId) });

/** Uma linha do sumário, como ela foi lida no momento em que ele foi gerado. */
export interface ItemDeSumario {
  texto: string;
  nivel: 1 | 2 | 3;
  /**
   * A folha em que o título estava **quando o sumário foi gerado**.
   *
   * Ela é gravada, e não calculada na leitura, pela mesma razão que o texto: o
   * sumário guarda o que leu. É justamente o número de página que envelhece
   * primeiro num documento de verdade — acrescentar uma seção no meio empurra
   * todas as seguintes, e o sumário continua mandando quem lê para a folha
   * errada sem nada avisar.
   */
  pagina: number;
}

/**
 * O que a caixa "Modificar Estilo" do Word deixa mudar, e só isso.
 *
 * Não é `CSSProperties` de propósito: a caixa do Word oferece fonte, tamanho,
 * cor, negrito e itálico, e abrir a porta para qualquer propriedade CSS daria
 * ao laboratório poderes que o programa imitado não tem — que é a forma mais
 * rápida de a simulação ensinar um gesto que não existe.
 */
export interface AjusteDeEstilo {
  tamanho?: number;
  cor?: string;
  negrito?: boolean;
  italico?: boolean;
}

/**
 * O cabeçalho ou o rodapé: o que se repete em toda página.
 *
 * É uma lista de trechos, e não uma `string`, porque o que mora aí dentro
 * quase sempre inclui um **campo** — o número da página. Guardar texto puro
 * obrigaria a inventar um marcador dentro dele, e aí a diferença entre o
 * número digitado e o número calculado, que é a lição do requisito 4.4,
 * deixaria de estar representada.
 */
export interface FaixaDaPagina {
  trechos: Trecho[];
}

export interface Doc<S extends string = string> {
  blocos: Bloco<S>[];
  /** A faixa acima da margem de cima. `null` enquanto ninguém a abriu. */
  cabecalho?: FaixaDaPagina | null;
  /** A faixa abaixo da margem de baixo. */
  rodape?: FaixaDaPagina | null;
  /**
   * A primeira página não leva as faixas — a caixa "Primeira página
   * diferente" do Word.
   *
   * Ela existe para a capa, e é o que evita a gambiarra de pôr a capa num
   * arquivo separado. Sem ela no modelo, um documento com capa não teria como
   * ficar certo, e a tarefa que a pede não teria o que medir.
   */
  primeiraPaginaDiferente?: boolean;
  /**
   * As redefinições de estilo que moram **neste documento**.
   *
   * No Word o estilo é do documento, e não do programa: é por isso que mudar
   * Título 1 aqui não mexe no Título 1 de outro arquivo. Guardar as
   * redefinições num módulo global faria a plataforma inteira mudar de
   * aparência quando alguém mexesse num exercício — e faria o requisito 8
   * ("demonstrar que a alteração de um único estilo modifica o documento
   * inteiro") virar uma afirmação sobre o programa em vez de sobre o documento.
   */
  estilos?: Partial<Record<Estilo, AjusteDeEstilo>>;
  /**
   * A fonte do corpo do documento.
   *
   * Duas famílias, e não uma lista de nomes: o requisito 2.4 pede a distinção
   * entre serifada e sem serifa, e é ela que a decisão usa — "texto longo
   * impresso" contra "tela e título". Guardar "Times New Roman" como string
   * deixaria a trava conferindo um nome em vez da escolha, e qualquer fonte
   * nova pediria um novo `if`.
   */
  fonte?: 'serifada' | 'sem-serifa';
  /** Quantas colunas cada seção usa. Uma é o padrão do Word. */
  colunas: Record<S, number>;
  /**
   * O sumário, ou `null` enquanto ninguém mandou gerar.
   *
   * Ele guarda o que leu **na hora em que foi gerado**, pela razão escrita no
   * alto deste arquivo. Só "Atualizar Sumário" o alcança.
   */
  sumario: ItemDeSumario[] | null;
  /**
   * O controle de alterações está ligado?
   *
   * Ele é do **documento** e não da sessão de quem edita, como no Word: o
   * arquivo carrega o estado, e quem abre um documento que veio com o controle
   * ligado continua marcando sem ter ligado nada. É metade da lição — a outra
   * metade é que desligá-lo não apaga marca nenhuma.
   */
  controlarAlteracoes?: boolean;
  /** Os comentários da margem. Ausente é o mesmo que nenhum. */
  comentarios?: Comentario[];
}

/* ── Montar ───────────────────────────────────────────────────────────────── */

export const trechoDe = (id: string, texto: string): Trecho =>
  ({ id, texto, posicao: 'normal', realce: 'nenhum', enfase: false });

/** Um trecho que é campo de numeração. O texto fica vazio de propósito. */
export const campoDe = (id: string, campo: Campo): Trecho =>
  ({ ...trechoDe(id, ''), campo });

export const blocoDe = <S extends string>(id: string, secao: S, trechos: Trecho[]): Paragrafo<S> =>
  ({ tipo: 'paragrafo', id, secao, trechos, estilo: 'Normal' });

export const linhaDe = <S extends string>(id: string, secao: S, texto: string): Paragrafo<S> =>
  blocoDe(id, secao, [trechoDe(`${id}-a`, texto)]);

/* ── Ler ──────────────────────────────────────────────────────────────────── */

/** Os parágrafos do documento, na ordem. Tabela e imagem não são parágrafos. */
export const paragrafos = <S extends string>(d: Doc<S>): Paragrafo<S>[] =>
  d.blocos.filter(ehParagrafo);

/**
 * O texto **digitado** de um bloco.
 *
 * Campo não entra: o que ele mostra é calculado, e somá-lo aqui faria o
 * "sem alterar uma palavra do texto" do requisito 6 acusar de edição uma
 * figura que entrou noutro lugar do documento.
 */
export const textoDoBloco = (b: Bloco<string>): string => {
  switch (b.tipo) {
    case 'paragrafo': return b.trechos.map(x => (x.campo ? '' : x.texto)).join('');
    /* As células, como o Word as copia: tabulação entre colunas, quebra entre
       linhas. É o mesmo texto que a conversão de tabela em texto devolveria. */
    case 'tabela': return b.linhas.map(l => l.join('\t')).join('\n');
    /* Imagem não tem texto. A legenda dela é outro bloco, e tem o próprio. */
    case 'imagem': return '';
    default: {
      const naoTratado: never = b;
      throw new Error(`bloco de tipo não tratado: ${JSON.stringify(naoTratado)}`);
    }
  }
};

/**
 * Todo o texto do documento, na ordem, sem formatação nenhuma.
 *
 * É com isto que se confere "sem alterar uma palavra do texto", que são as
 * palavras do requisito 6. A comparação é com o documento **de partida**, e não
 * com uma cópia feita no meio do caminho: quem apagasse um parágrafo e o
 * reescrevesse passaria por qualquer conferência que só olhasse para o estado
 * de agora.
 */
export const textoDoDoc = (d: Doc<string>) =>
  d.blocos.map(textoDoBloco).join('\n');

/* ── Controle de alterações ───────────────────────────────────────────────── */

/**
 * O texto que se **lê** hoje, com as marcas pendentes ainda na tela.
 *
 * O que está riscado não entra: ele continua desenhado, mas ninguém o lê como
 * texto do documento. O que está inserido entra, porque está lá.
 *
 * É outra leitura, e não um substituto de `textoDoDoc`: aquele responde pelo
 * que foi **digitado** — é ele que diz "sem alterar uma palavra do texto" — e
 * este responde pelo que a página diz. A distância entre os dois é a lição
 * inteira do controle de alterações: enquanto ninguém aceita nem rejeita, o
 * documento tem dois textos ao mesmo tempo.
 */
export const textoVisivel = (d: Doc<string>): string =>
  paragrafos(d)
    .map(b => b.trechos
      .filter(x => x.revisao?.tipo !== 'excluido')
      .map(x => textoDoTrecho(d, x))
      .join(''))
    .join('\n');

/** As marcas de revisão que ainda esperam alguém, na ordem do documento. */
export const revisoesPendentes = <S extends string>(d: Doc<S>) =>
  paragrafos(d).flatMap(b => b.trechos
    .filter((x): x is Trecho & { revisao: Revisao } => !!x.revisao)
    .map(x => ({ bloco: b.id, trecho: x })));

/** As marcas de um autor só — "as que a liderança fez". */
export const revisoesDe = <S extends string>(d: Doc<S>, autor: Autor) =>
  revisoesPendentes(d).filter(r => r.trecho.revisao.autor === autor);

/**
 * Aceitar ou rejeitar uma marca, que são a mesma operação espelhada.
 *
 * Aceitar um inserido é tirar a marca e deixar o texto; aceitar um excluído é
 * apagar o trecho. Rejeitar troca os dois. Escrever as quatro combinações em
 * dois `if` separados foi a primeira tentativa, e as duas funções divergiram na
 * primeira correção — aceitar deixou de apagar o excluído e o texto riscado
 * ficava no documento final, sem marca nenhuma explicando por que ele estava
 * ali.
 */
const resolverMarca = <S extends string>(
  d: Doc<S>, trechoId: string, fica: 'inserido' | 'excluido',
): Doc<S> => ({
  ...d,
  blocos: d.blocos.map(b => {
    if (!ehParagrafo(b)) return b;
    if (!b.trechos.some(x => x.id === trechoId)) return b;
    return {
      ...b,
      trechos: b.trechos.flatMap(x => {
        if (x.id !== trechoId || !x.revisao) return [x];
        if (x.revisao.tipo !== fica) return [];
        /* A marca sai, e o resto do trecho fica: `delete` numa cópia, e não
           `revisao: undefined`, porque a chave presente com `undefined`
           continua sendo chave — e `!!x.revisao` é falso enquanto
           `'revisao' in x` é verdadeiro, que é a divergência que faria duas
           leituras do mesmo trecho discordarem. */
        const semMarca: Trecho = { ...x };
        delete semMarca.revisao;
        return [semMarca];
      }),
    };
  }),
});

/** O texto inserido fica; o riscado vai embora. */
export const aceitarRevisao = <S extends string>(d: Doc<S>, trechoId: string) =>
  resolverMarca(d, trechoId, 'inserido');

/** O texto riscado volta inteiro; o inserido nunca existiu. */
export const rejeitarRevisao = <S extends string>(d: Doc<S>, trechoId: string) =>
  resolverMarca(d, trechoId, 'excluido');

/** Os dois botões grossos da guia Revisão, que resolvem tudo de uma vez. */
export const aceitarTodasAsRevisoes = <S extends string>(d: Doc<S>): Doc<S> =>
  revisoesPendentes(d).reduce((acc, r) => aceitarRevisao(acc, r.trecho.id), d);

export const rejeitarTodasAsRevisoes = <S extends string>(d: Doc<S>): Doc<S> =>
  revisoesPendentes(d).reduce((acc, r) => rejeitarRevisao(acc, r.trecho.id), d);

/* ── Localizar e substituir ───────────────────────────────────────────────── */

/**
 * As duas caixas que quase ninguém marca, e que são a lição do requisito 5.
 *
 * Elas são campo, e não um comportamento fixo, porque o laboratório precisa
 * **deixar errar**: uma substituição que protegesse sozinha ensinaria que o
 * programa protege, e ele não protege. O que ele faz é oferecer as caixas.
 */
export interface OpcoesDeBusca {
  diferenciarMaiusculas: boolean;
  palavrasInteiras: boolean;
}

export const BUSCA_CRUA: OpcoesDeBusca = {
  diferenciarMaiusculas: false,
  palavrasInteiras: false,
};

const escaparRegex = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * O que "palavra inteira" quer dizer, e por que não é `\b`.
 *
 * `\b` do JavaScript é fronteira entre `[A-Za-z0-9_]` e o resto, e português
 * tem acento: em "criança", o `ç` já não é palavra para ele, então `\bcriança\b`
 * casa no meio de "acriançada" e deixa de casar onde devia. A fronteira aqui é
 * "o vizinho não é letra", com as letras acentuadas dentro da conta.
 */
const LETRA = 'A-Za-zÀ-ÖØ-öø-ÿ0-9';

const padraoDaBusca = (procurar: string, op: OpcoesDeBusca): RegExp => {
  const alvo = escaparRegex(procurar);
  const corpo = op.palavrasInteiras
    ? `(?<![${LETRA}])${alvo}(?![${LETRA}])`
    : alvo;
  return new RegExp(corpo, op.diferenciarMaiusculas ? 'g' : 'gi');
};

/** Quantas ocorrências a busca acha hoje, sem trocar nada. */
export const ocorrencias = (d: Doc<string>, procurar: string, op: OpcoesDeBusca): number =>
  procurar === '' ? 0 : paragrafos(d).reduce((n, b) => n + b.trechos
    .filter(x => x.revisao?.tipo !== 'excluido')
    .reduce((m, x) => m + (x.texto.match(padraoDaBusca(procurar, op))?.length ?? 0), 0), 0);

/**
 * Substituir em todo o documento.
 *
 * Três decisões moram aqui, e as três são do Word:
 *
 * **O que está riscado não se substitui.** Ele já saiu do texto; trocar palavra
 * dentro dele encheria o documento de marcas sobre marcas e mudaria o texto que
 * voltaria se alguém rejeitasse a marca.
 *
 * **Com o controle ligado, a troca sai marcada** — o velho riscado, o novo
 * inserido — como qualquer outra edição. Fazê-la em silêncio pareceria mais
 * limpo e ensinaria o contrário do que a lição diz: que o controle marca
 * **toda** edição, inclusive a que se fez de uma vez em dezoito lugares.
 *
 * **O pedaço de antes fica com o id original.** Os comentários se penduram em
 * id de trecho: renumerar tudo faria a margem esvaziar sozinha na primeira
 * substituição, sem erro nenhum e sem nada explicando para onde foi a pergunta
 * da liderança.
 */
export function substituirTudo<S extends string>(
  d: Doc<S>, procurar: string, por: string, op: OpcoesDeBusca,
): { doc: Doc<S>; trocas: number } {
  if (procurar === '') return { doc: d, trocas: 0 };
  const marcado = d.controlarAlteracoes === true;
  let trocas = 0;

  const blocos = d.blocos.map(b => {
    if (!ehParagrafo(b)) return b;
    const trechos = b.trechos.flatMap((x): Trecho[] => {
      if (x.revisao?.tipo === 'excluido' || x.campo) return [x];
      const padrao = padraoDaBusca(procurar, op);
      if (!padrao.test(x.texto)) return [x];

      const pedacos: Trecho[] = [];
      let resto = x.texto;
      let n = 0;
      let primeiro = true;
      const busca = padraoDaBusca(procurar, op);
      let m: RegExpExecArray | null;
      let cursor = 0;
      while ((m = busca.exec(x.texto)) !== null) {
        const antes = x.texto.slice(cursor, m.index);
        if (antes !== '') {
          pedacos.push({ ...x, id: primeiro ? x.id : `${x.id}-a${n}`, texto: antes });
          primeiro = false;
        }
        if (marcado) {
          pedacos.push({ ...x, id: `${x.id}-v${n}`, texto: m[0], revisao: { autor: 'voce', tipo: 'excluido' } });
          pedacos.push({ ...x, id: `${x.id}-n${n}`, texto: por, revisao: { autor: 'voce', tipo: 'inserido' } });
        } else {
          pedacos.push({ ...x, id: primeiro ? x.id : `${x.id}-n${n}`, texto: por });
        }
        primeiro = false;
        cursor = m.index + m[0].length;
        n += 1;
        trocas += 1;
      }
      resto = x.texto.slice(cursor);
      if (resto !== '') pedacos.push({ ...x, id: `${x.id}-z`, texto: resto });
      /* Nenhum pedaço sobrou com o id original: o comentário preso a este
         trecho ficaria órfão. Devolve o primeiro com ele. */
      if (pedacos.length > 0 && !pedacos.some(p => p.id === x.id)) {
        pedacos[0] = { ...pedacos[0], id: x.id };
      }
      return pedacos;
    });
    return { ...b, trechos };
  });

  return { doc: { ...d, blocos }, trocas };
}

/**
 * Os parágrafos vazios — Enter apertado para empurrar texto.
 *
 * Ele olha só para parágrafos, e não para todo bloco sem texto: imagem não tem
 * texto nenhum, e contá-la aqui faria a meta do módulo 2 pedir que se apagasse
 * a foto para ficar verde.
 */
export const paragrafosVazios = <S extends string>(d: Doc<S>) =>
  paragrafos(d).filter(b => textoDoBloco(b).trim() === '');

/** As pilhas de nomes de fonte que cada família rende, com os nomes do Word. */
export const FONTES: Record<'serifada' | 'sem-serifa', string> = {
  serifada: 'Georgia, "Times New Roman", serif',
  'sem-serifa': 'Calibri, Arial, sans-serif',
};

/** Os parágrafos que ainda carregam formatação direta. */
export const comFormatacaoDireta = <S extends string>(d: Doc<S>) =>
  paragrafos(d).filter(b => b.trechos.some(x => x.direta && Object.keys(x.direta).length > 0));

/**
 * A aparência com que um estilo é desenhado **neste** documento: a do Word,
 * com a redefinição por cima quando existe.
 */
export function aparenciaDe(d: Doc<string>, e: Estilo): CSSProperties {
  const base = APARENCIA_DO_ESTILO[e];
  const ajuste = d.estilos?.[e];
  if (!ajuste) return base;
  return {
    ...base,
    ...(ajuste.tamanho !== undefined ? { fontSize: ajuste.tamanho } : {}),
    ...(ajuste.cor !== undefined ? { color: ajuste.cor } : {}),
    ...(ajuste.negrito !== undefined ? { fontWeight: ajuste.negrito ? 700 : 400 } : {}),
    ...(ajuste.italico !== undefined ? { fontStyle: ajuste.italico ? 'italic' : 'normal' } : {}),
  };
}

/** A aparência de um trecho: a do estilo do bloco, com a direta por cima. */
export function aparenciaDoTrecho(d: Doc<string>, b: Paragrafo<string>, x: Trecho): CSSProperties {
  const doEstilo = aparenciaDe(d, b.estilo);
  if (!x.direta) return doEstilo;
  const { negrito, italico, tamanho, cor } = x.direta;
  return {
    ...doEstilo,
    ...(tamanho !== undefined ? { fontSize: tamanho } : {}),
    ...(cor !== undefined ? { color: cor } : {}),
    ...(negrito !== undefined ? { fontWeight: negrito ? 700 : 400 } : {}),
    ...(italico !== undefined ? { fontStyle: italico ? 'italic' : 'normal' } : {}),
  };
}

/** Os títulos do documento, na ordem, como o sumário os leria agora. */
export function titulosDoDoc(d: Doc<string>): ItemDeSumario[] {
  /* A folha de cada título sai da mesma repartição que a tela desenha: duas
     contas de página divergiriam, e o sumário passaria a apontar para uma
     folha que não é a que o desbravador vê. */
  const paginas = paginasDoDoc(d);
  const folhaDoBloco = new Map<string, number>();
  paginas.forEach((blocos, i) => blocos.forEach(b => folhaDoBloco.set(b.id, i + 1)));

  return paragrafos(d)
    .filter(b => ehTitulo(b.estilo))
    .map(b => ({
      texto: textoDoBloco(b),
      nivel: NIVEL_DO_TITULO[b.estilo]!,
      pagina: folhaDoBloco.get(b.id) ?? 1,
    }));
}

/* ── Os campos de numeração ───────────────────────────────────────────────── */

/**
 * Os trechos que são campo, na ordem do documento.
 *
 * A ordem é a do documento e não a de inserção, e é ela que faz a numeração
 * andar sozinha: entrar uma figura no meio muda a posição de todas as
 * seguintes, e nenhum campo precisou ser tocado.
 */
export function camposDoDoc(d: Doc<string>): { bloco: string; trecho: Trecho }[] {
  return paragrafos(d).flatMap(b =>
    b.trechos.filter(x => x.campo).map(x => ({ bloco: b.id, trecho: x })));
}

/**
 * O número que um campo mostra: a posição dele entre os campos **do mesmo
 * tipo**, contada na ordem do documento.
 *
 * Figura e tabela contam separado, como no Word — a Figura 1 e a Tabela 1
 * convivem, e uma série não empurra a outra.
 *
 * Devolve 0 para trecho que não é campo, e quem pergunta por um trecho que não
 * está no documento recebe 0 também: não há posição para contar.
 */
export function numeroDoCampo(d: Doc<string>, trechoId: string): number {
  const alvo = camposDoDoc(d).find(c => c.trecho.id === trechoId);
  if (!alvo || !alvo.trecho.campo) return 0;
  if (!CAMPOS_EM_SERIE.includes(alvo.trecho.campo)) return 0;
  return camposDoDoc(d)
    .filter(c => c.trecho.campo === alvo.trecho.campo)
    .findIndex(c => c.trecho.id === trechoId) + 1;
}

/**
 * O que um trecho mostra na folha: o texto digitado, ou o campo resolvido.
 *
 * É a única leitura que a tela usa, e ela é separada de `textoDoBloco` de
 * propósito. As duas respondem a perguntas diferentes — uma é "o que se lê",
 * a outra é "o que foi digitado" —, e é justamente a distância entre elas que
 * este módulo ensina: a legenda digitada à mão responde a mesma coisa nas
 * duas, e é por isso que ela não se corrige sozinha.
 */
export function textoDoTrecho(d: Doc<string>, x: Trecho, pagina?: number): string {
  if (!x.campo) return x.texto;
  /* O da página não tem posição no texto: ele diz em que folha está sendo
     desenhado, e é a folha que informa. Sem número de página — porque quem
     desenha não é a folha — ele sai como 1, que é onde ele estaria. */
  if (x.campo === 'pagina') return String(pagina ?? 1);
  return `${NOME_DO_CAMPO[x.campo]} ${numeroDoCampo(d, x.id)}`;
}

/** O que um parágrafo mostra na folha, com os campos já resolvidos. */
export const textoNaTela = (d: Doc<string>, b: Paragrafo<string>, pagina?: number) =>
  b.trechos.map(x => textoDoTrecho(d, x, pagina)).join('');

/** O que uma faixa mostra na folha indicada. */
export const textoDaFaixa = (d: Doc<string>, faixa: FaixaDaPagina, pagina: number) =>
  faixa.trechos.map(x => textoDoTrecho(d, x, pagina)).join('');

/** A faixa tem um campo de página, em vez de um número digitado? */
export const faixaTemCampoDePagina = (faixa: FaixaDaPagina | null | undefined) =>
  !!faixa?.trechos.some(x => x.campo === 'pagina');

/* ── As folhas ────────────────────────────────────────────────────────────── */

/**
 * O documento repartido em folhas, pelas quebras de página que ele carrega.
 *
 * O Word reparte pela altura do que cabe; aqui é pela quebra explícita, e a
 * diferença não custa a lição: o que os requisitos 4.4 e 4.5 pedem é ver o
 * cabeçalho se repetir e o número mudar de uma folha para a outra, e para isso
 * basta haver mais de uma folha. Simular o corte por altura pediria medir
 * texto, que é trabalho do navegador e não do modelo — e daria uma paginação
 * que muda com a fonte de quem está olhando.
 *
 * Devolve sempre ao menos uma folha, mesmo num documento sem bloco nenhum: a
 * folha em branco existe no Word, e uma lista vazia faria a tela não desenhar
 * papel nenhum.
 */
export function paginasDoDoc<S extends string>(d: Doc<S>): Bloco<S>[][] {
  const paginas: Bloco<S>[][] = [[]];
  for (const b of d.blocos) {
    const atual = paginas[paginas.length - 1];
    /* Quebra na primeira posição não abre folha em branco antes dela. */
    if (b.quebraDePagina && atual.length > 0) paginas.push([]);
    paginas[paginas.length - 1].push(b);
  }
  return paginas;
}

/** Quantas folhas o documento tem hoje. */
export const quantasPaginas = (d: Doc<string>) => paginasDoDoc(d).length;

/* ── Tabelas ──────────────────────────────────────────────────────────────── */

/**
 * Quantas colunas a tabela tem, medida pela linha mais larga.
 *
 * Ela existe para que a folha nunca desenhe uma tabela com buraco: uma linha
 * curta sai com uma célula a menos e a borda da direita sobe uma linha, sem
 * erro nenhum. Quem acrescenta linha ou coluna preenche por aqui.
 */
export const larguraDaTabela = (t: TabelaDoDoc<string>) =>
  t.linhas.reduce((maior, l) => Math.max(maior, l.length), 0);

/** A tabela é retangular: toda linha com o mesmo número de células. */
export const tabelaRetangular = (t: TabelaDoDoc<string>) =>
  t.linhas.every(l => l.length === larguraDaTabela(t));

/** O sumário existe e diz o que os títulos dizem hoje. */
export function sumarioAtualizado(d: Doc<string>): boolean {
  if (!d.sumario) return false;
  const agora = titulosDoDoc(d);
  if (agora.length !== d.sumario.length) return false;
  return agora.every((x, i) => x.texto === d.sumario![i].texto
    && x.nivel === d.sumario![i].nivel
    && x.pagina === d.sumario![i].pagina);
}

/**
 * Depois de que bloco da primeira folha o sumário se desenha.
 *
 * No Word o sumário é um campo posto onde o cursor está, e quem o põe o põe
 * embaixo do título: ele é a porta do documento, e um sumário acima do nome do
 * documento anuncia o que o leitor ainda não sabe o que é. Aqui `sumario` é
 * campo do documento e não bloco posicionado — pela razão escrita no alto
 * deste arquivo —, então a posição sai de uma regra.
 *
 * A regra é a `secao`: o sumário fecha a **abertura**, que é o título e as
 * linhas que viajam com ele, e vem antes da primeira seção de conteúdo.
 *
 * Ela não pergunta por título de propósito. O documento do módulo 1 chega sem
 * um único parágrafo com estilo de título — é o defeito que a lição existe
 * para mostrar —, e uma regra que procurasse o título não acharia nenhum:
 * jogaria o sumário vazio no pé da última folha, que é justamente onde ninguém
 * vai ler "Nenhuma entrada de sumário foi encontrada". A `secao` responde o
 * mesmo antes e depois de os estilos entrarem, então o sumário não muda de
 * lugar enquanto se trabalha nele.
 *
 * A abertura é o **começo** da folha, e não toda ocorrência daquela seção
 * nela: o laço para na primeira mudança. Uma seção que voltasse mais adiante
 * empurraria o sumário para o meio do conteúdo, sem nada acusar.
 *
 * Devolve o id do bloco depois do qual ele vai, ou `null` para o topo — que é
 * o que sobra numa folha sem bloco nenhum.
 */
export function blocoAntesDoSumario<S extends string>(d: Doc<S>): string | null {
  const primeira = paginasDoDoc(d)[0];
  if (primeira.length === 0) return null;
  const abertura = primeira[0].secao;
  let ultimo = primeira[0];
  for (const b of primeira) {
    if (b.secao !== abertura) break;
    ultimo = b;
  }
  return ultimo.id;
}

/* ── O botão Aa ───────────────────────────────────────────────────────────── */

/** Os cinco modos do botão Aa do Word, com os nomes que ele usa. */
export type ModoDeCaixa = 'frase' | 'minusculas' | 'maiusculas' | 'palavras' | 'alternar';

export const NOMES_DA_CAIXA: Record<ModoDeCaixa, string> = {
  frase: 'Primeira letra da frase em maiúscula.',
  minusculas: 'minúsculas',
  maiusculas: 'MAIÚSCULAS',
  palavras: 'Colocar Cada Palavra Em Maiúscula',
  alternar: 'aLTERNAR mAIÚSCULAS/mINÚSCULAS',
};

export function aplicarCaixa(texto: string, modo: ModoDeCaixa): string {
  switch (modo) {
    case 'minusculas': return texto.toLocaleLowerCase('pt-BR');
    case 'maiusculas': return texto.toLocaleUpperCase('pt-BR');
    case 'palavras':
      return texto.toLocaleLowerCase('pt-BR')
        .replace(/(^|\s)(\p{L})/gu, (_m, antes: string, letra: string) => antes + letra.toLocaleUpperCase('pt-BR'));
    case 'alternar':
      return [...texto].map(c => {
        const alto = c.toLocaleUpperCase('pt-BR');
        return c === alto ? c.toLocaleLowerCase('pt-BR') : alto;
      }).join('');
    case 'frase':
    default: {
      const baixo = texto.toLocaleLowerCase('pt-BR');
      return baixo.replace(/(^\s*|[.!?]\s+)(\p{L})/gu,
        (_m, antes: string, letra: string) => antes + letra.toLocaleUpperCase('pt-BR'));
    }
  }
}
