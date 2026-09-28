/**
 * A pesquisa do bug do milênio — AP045 requisito 6, primeira metade.
 *
 * "Pesquisar em sites especializados e apresentar um relatório a respeito do
 * que foi o bug do milênio." A frase tem uma palavra que decide tudo:
 * **especializados**. Pesquisar qualquer coisa é digitar e clicar no primeiro
 * resultado. Pesquisar em site especializado é saber distinguir um do outro — e
 * o primeiro resultado raramente é o especializado, porque quem escreve para
 * ser clicado escreve melhor título do que quem escreve para acertar.
 *
 * ── A BNCC por trás ──────────────────────────────────────────────────────
 * O laboratório é a sequência que a BNCC de Língua Portuguesa do 6º ao 9º ano
 * pede para a pesquisa escolar, na ordem dela: fazer o recorte antes de buscar
 * (EF67LP20, EF89LP24), avaliar a fonte — quem escreveu, quando, com que
 * referências (EF69LP32) —, tomar nota com as próprias palavras e com a fonte
 * presa (EF69LP35, EF69LP43), e desconfiar da informação que circula sem dono,
 * que é a notícia falsa de EF09LP01 com vinte e cinco anos de idade. O
 * relatório, na lição seguinte, é escrito a partir das fichas, e não das
 * páginas.
 *
 * ── Os sites são inventados, e os fatos não ──────────────────────────────
 * Nenhuma página imita um site de verdade: fingir ser uma enciclopédia real
 * ou um jornal real seria pôr palavras na boca de quem não as escreveu. O que é
 * de verdade é o que as confiáveis dizem, e é isso que a Edge Function confere
 * no relatório (`ai-gateway/redacao.ts`, projeto `AP045-bug-do-milenio`).
 */

/* ── As perguntas do recorte ───────────────────────────────────────────── */

export type PerguntaId =
  | 'causa' | 'temor' | 'correcao' | 'resultado'
  | 'inventor' | 'rapido' | 'tudo';

export interface PerguntaGuia {
  id: PerguntaId;
  texto: string;
  /** Faz parte do recorte que o relatório precisa. */
  doRecorte: boolean;
  /** Por que ela fica de fora, quando fica — mostrado só depois de conferir. */
  porque?: string;
}

/**
 * Sete candidatas, quatro certas.
 *
 * As três erradas são os três jeitos de errar um recorte: a que é de outro
 * assunto, a que é do assunto e não ajuda a explicá-lo, e a que é grande
 * demais para caber num relatório. A ordem mistura as duas espécies — lista
 * com as certas em cima ensinaria a marcar as primeiras.
 */
export const PERGUNTAS: PerguntaGuia[] = [
  { id: 'causa', texto: 'Por que o bug existia?', doRecorte: true },
  { id: 'inventor', texto: 'Quem inventou o computador?', doRecorte: false,
    porque: 'É outro assunto: a história do computador começa muito antes do problema do ano 2000.' },
  { id: 'temor', texto: 'O que as pessoas temiam que acontecesse?', doRecorte: true },
  { id: 'rapido', texto: 'Qual era o computador mais rápido de 1999?', doRecorte: false,
    porque: 'É da mesma época, mas não explica nada do bug: a velocidade não tinha a ver com a data.' },
  { id: 'correcao', texto: 'O que foi feito para evitar o problema?', doRecorte: true },
  { id: 'tudo', texto: 'Tudo sobre a história da informática', doRecorte: false,
    porque: 'Grande demais: ninguém responde "tudo" num relatório, e a busca devolveria milhões de páginas sem foco.' },
  { id: 'resultado', texto: 'O que aconteceu de fato na virada do ano?', doRecorte: true },
];

export const PERGUNTAS_DO_RECORTE = PERGUNTAS.filter(p => p.doRecorte).map(p => p.id);

export const umaPergunta = (id: PerguntaId) => PERGUNTAS.find(p => p.id === id)!;

/* ── As páginas ────────────────────────────────────────────────────────── */

export interface Paragrafo {
  id: string;
  texto: string;
  /** A pergunta do recorte que este trecho responde, quando responde alguma. */
  responde?: PerguntaId;
  /** O trecho desmente a história dos aviões. */
  desmente?: boolean;
}

export interface Pagina {
  id: string;
  titulo: string;
  site: string;
  endereco: string;
  /** Quem assina — `null` é página sem autor. */
  autor: string | null;
  /** Quando foi publicada — `null` é página sem data. */
  data: string | null;
  /** O resumo que aparece no resultado da busca. */
  resumo: string;
  paragrafos: Paragrafo[];
  /** As referências que a página cita. Vazio é página que não cita nada. */
  fontes: string[];
  /** Confiável ou não: nunca aparece na tela, é o que o desbravador decide. */
  confiavel: boolean;
  /**
   * Por que ela é ou não confiável. Aparece só na tela de conclusão: mostrada
   * ao avaliar, diria se a avaliação estava certa, e dois botões virariam
   * duas tentativas.
   */
  pista: string;
  /** As palavras que fazem a página subir na busca. */
  termos: string[];
}

/*
  As oito páginas.

  Três especializadas e completas, duas especializadas que respondem uma coisa
  só, e três que não são confiáveis por três motivos diferentes: o blog sem
  autor que afirma o que nunca aconteceu, o vídeo que escreve para ser clicado
  e o fórum em que qualquer um responde qualquer coisa.

  As duas incompletas são a razão de a meta das fichas pedir as quatro
  perguntas: com uma página que respondesse tudo, bastaria abrir uma. Mesmo as
  completas deixam algum buraco, de modo que o caderno sai de mais de um site.
*/
export const PAGINAS: Pagina[] = [
  {
    id: 'acervo',
    titulo: 'O bug do milênio: o problema do ano 2000',
    site: 'Acervo Histórico da Computação',
    endereco: 'acervocomputacao.edu.br/y2k',
    autor: 'Profa. Helena Martins, curadora do acervo',
    data: '14/03/2019',
    resumo: 'Por que tantos programas guardavam o ano com dois dígitos, o que se temia na virada de 1999 para 2000 e como o problema foi corrigido.',
    paragrafos: [
      { id: 'acervo-1', responde: 'causa',
        texto: 'Nas décadas de 1960 e 1970, a memória dos computadores era muito cara. Para economizar espaço, muitos programas guardavam o ano com apenas dois dígitos: 1998 virava simplesmente 98. Para o programa, o século era sempre o 19.' },
      { id: 'acervo-2', responde: 'causa',
        texto: 'O problema aparece na virada: o ano 2000 seria gravado como 00. Um programa que calculasse a idade de alguém nascido em 1985 faria 00 menos 85 e chegaria a um número negativo, ou entenderia que o ano era 1900.' },
      { id: 'acervo-3', responde: 'temor',
        texto: 'Temia-se que sistemas de bancos, de energia elétrica, de telefonia e de hospitais falhassem à meia-noite de 31 de dezembro de 1999, justamente porque todos dependiam de contas com datas.' },
      { id: 'acervo-4', responde: 'resultado', desmente: true,
        texto: 'Na virada, os desastres previstos não aconteceram. Nenhum avião caiu por causa do bug e não houve apagão em larga escala. Houve falhas pequenas, como sistemas mostrando o ano 1900, que foram corrigidas em poucos dias.' },
    ],
    fontes: [
      'Relatório final do comitê de acompanhamento do ano 2000, 2000.',
      'Entrevistas com programadores que trabalharam na correção, arquivo do acervo.',
    ],
    confiavel: true,
    pista: 'Tem autora identificada, data de publicação e lista de onde tirou as informações, num site de instituição de ensino.',
    termos: ['bug', 'milenio', 'y2k', '2000', 'ano', 'problema', 'historia', 'computacao'],
  },
  {
    id: 'enciclopedia',
    titulo: 'Problema do ano 2000 (Y2K)',
    site: 'Enciclopédia Livre de Tecnologia',
    endereco: 'enciclotec.org/problema-do-ano-2000',
    autor: 'Verbete escrito e revisado por voluntários — ver histórico de edições',
    data: '02/08/2023',
    resumo: 'O Y2K, também chamado bug do milênio, foi um problema de programação ligado ao registro do ano com dois dígitos.',
    paragrafos: [
      { id: 'enciclo-1', responde: 'causa',
        texto: 'O nome Y2K junta Y, de year (ano, em inglês), com 2K, que quer dizer dois mil. O problema estava no jeito de guardar datas, e não nas máquinas em si.' },
      { id: 'enciclo-2', responde: 'correcao',
        texto: 'Governos e empresas do mundo todo passaram anos revisando programas. A correção mais comum foi guardar o ano com quatro dígitos; outra foi ensinar o programa a entender 00 como 2000. O custo total é estimado em cerca de 300 bilhões de dólares.' },
      { id: 'enciclo-3', responde: 'resultado',
        texto: 'Até hoje se discute se o risco foi exagerado. A maioria dos especialistas atribui a calmaria da virada ao trabalho de correção feito antes dela.' },
    ],
    fontes: [
      'Relatórios de governos sobre a preparação para o ano 2000.',
      'Artigos de revistas de computação publicados entre 1997 e 2001.',
    ],
    confiavel: true,
    pista: 'O verbete diz quem escreve, mostra o histórico de edições, tem data e lista as referências.',
    termos: ['y2k', 'ano', '2000', 'problema', 'bug', 'milenio', 'enciclopedia'],
  },
  {
    id: 'reportagem',
    titulo: 'Dez anos depois: o que o bug do milênio ensinou',
    site: 'Revista Ciência em Pauta',
    endereco: 'cienciaempauta.com.br/2010/01/bug-do-milenio',
    autor: 'Marcos Tavares, repórter de tecnologia',
    data: '01/01/2010',
    resumo: 'Uma década depois da virada, a reportagem volta aos dias de medo e conta o que de fato aconteceu.',
    paragrafos: [
      { id: 'reportagem-1', responde: 'temor',
        texto: 'No fim de 1999 muita gente foi ao mercado estocar água, comida e dinheiro vivo. Havia medo de que os caixas eletrônicos parassem e de que as contas saíssem erradas no começo do ano.' },
      { id: 'reportagem-2', responde: 'correcao',
        texto: 'Programadores aposentados que conheciam a linguagem COBOL, usada nos sistemas antigos dos bancos, foram chamados de volta ao trabalho. Os sistemas foram testados com o relógio adiantado para depois da virada.' },
      { id: 'reportagem-3', responde: 'resultado',
        texto: 'O que se viu em 1º de janeiro foram falhas pequenas: alguns sites mostraram o ano como 19100, e alguns recibos saíram com a data de 1900. Tudo corrigido em pouco tempo.' },
    ],
    fontes: [
      'Entrevistas com técnicos de bancos e de companhias de energia.',
      'Arquivo da própria revista, edições de dezembro de 1999 e janeiro de 2000.',
    ],
    confiavel: true,
    pista: 'Reportagem assinada por um repórter, com data, numa revista de ciência, que conta com quem conversou.',
    termos: ['bug', 'milenio', 'reportagem', '2000', 'virada', 'ano', 'dez', 'anos'],
  },
  {
    id: 'glossario',
    titulo: 'Glossário de informática: Y2K',
    site: 'Portal do Técnico em Informática',
    endereco: 'portaldotecnico.com.br/glossario/y2k',
    autor: 'Equipe de professores do portal',
    data: '20/05/2021',
    resumo: 'Y2K: sigla para o problema do ano 2000, causado pelo registro do ano com dois dígitos.',
    paragrafos: [
      { id: 'glossario-1', responde: 'causa',
        texto: 'Y2K é a sigla do problema do ano 2000. Os programas que guardavam o ano com dois dígitos não sabiam diferenciar 1900 de 2000, porque os dois ficavam escritos como 00.' },
    ],
    fontes: ['Dicionário de termos técnicos de informática, edição de 2018.'],
    confiavel: true,
    pista: 'É um portal de ensino técnico, com autoria e data. Só responde uma coisa, porque é um glossário.',
    termos: ['y2k', 'glossario', 'sigla', 'ano', '2000', 'bug', 'milenio'],
  },
  {
    id: 'linha-do-tempo',
    titulo: 'Linha do tempo da computação: de 1990 a 2000',
    site: 'Associação de Professores de Informática',
    endereco: 'apinformatica.org.br/linha-do-tempo/1990-2000',
    autor: 'Comissão de história da associação',
    data: '10/09/2020',
    resumo: 'Os principais acontecimentos da computação na última década do século 20, ano a ano.',
    paragrafos: [
      { id: 'linha-1',
        texto: '1991: começa a funcionar a World Wide Web. 1995: a internet é aberta ao público no Brasil.' },
      { id: 'linha-2', responde: 'correcao',
        texto: '1997 a 1999: empresas e governos montam equipes para revisar programas antigos antes da virada do ano. No Brasil, bancos e órgãos do governo criam planos de prevenção e testes.' },
    ],
    fontes: ['Arquivos de jornais da década de 1990.', 'Livros de história da computação.'],
    confiavel: true,
    pista: 'Uma associação de professores, com autoria, data e fontes. É confiável, e fala do bug em uma linha só.',
    termos: ['linha', 'tempo', 'computacao', '1990', '2000', 'historia', 'milenio'],
  },
  {
    id: 'blog',
    titulo: 'O DIA EM QUE OS AVIÕES CAÍRAM: a verdade sobre o bug do milênio',
    site: 'Mistérios da Tecnologia',
    endereco: 'misteriosdatecnologia-exemplo.com',
    autor: null,
    data: null,
    resumo: 'Ninguém te contou o que aconteceu de verdade na virada de 2000. Aviões caíram e o governo escondeu tudo.',
    paragrafos: [
      { id: 'blog-1',
        texto: 'Na virada de 2000 vários aviões caíram no mundo inteiro por causa do bug do milênio, mas a mídia escondeu tudo para não assustar ninguém.' },
      { id: 'blog-2',
        texto: 'O bug era um vírus criado por hackers para destruir os computadores no dia 1º de janeiro. Quem tinha antivírus se salvou.' },
    ],
    fontes: [],
    confiavel: false,
    pista: 'Não diz quem escreveu, não tem data e não cita de onde tirou nada. E afirma um segredo que "a mídia escondeu" sem prova nenhuma.',
    termos: ['bug', 'milenio', 'verdade', 'avioes', '2000', 'misterio', 'ano'],
  },
  {
    id: 'video',
    titulo: 'VOCÊ NÃO VAI ACREDITAR no que aconteceu em 2000!!!',
    site: 'TopCuriosidades — vídeos',
    endereco: 'videos-exemplo.com/topcuriosidades/bug2000',
    autor: 'Canal TopCuriosidades',
    data: '07/11/2022',
    resumo: '10 FATOS CHOCANTES sobre o bug do milênio que vão te deixar sem dormir! Assista até o fim!',
    paragrafos: [
      { id: 'video-1',
        texto: 'Descrição do vídeo: o bug do milênio quase acabou com o mundo! Os computadores iam explodir e só não explodiram por sorte. Deixe seu like e se inscreva!' },
    ],
    fontes: [],
    confiavel: false,
    pista: 'O título é escrito para ser clicado, com letras maiúsculas e exclamações, e a descrição exagera sem citar fonte nenhuma. Ter um nome de canal não é ter autoria.',
    termos: ['bug', 'milenio', '2000', 'aconteceu', 'curiosidades', 'video', 'ano'],
  },
  {
    id: 'forum',
    titulo: 'alguém sabe o que foi o bug do milênio?',
    site: 'Fórum Pergunte Aqui',
    endereco: 'pergunteaqui-exemplo.com/t/bug-do-milenio',
    autor: 'usuario_2093 e outros',
    data: '15/06/2016',
    resumo: 'Pergunta de um usuário, com 4 respostas.',
    paragrafos: [
      { id: 'forum-1',
        texto: 'Resposta de gamer_zz: acho que era um vírus, meu tio falou.' },
      { id: 'forum-2',
        texto: 'Resposta de anonimo77: foi quando os computadores pararam de funcionar por uma semana.' },
    ],
    fontes: [],
    confiavel: false,
    pista: 'Qualquer pessoa responde qualquer coisa, com apelido, e as respostas se contradizem. "Meu tio falou" não é fonte.',
    termos: ['bug', 'milenio', 'forum', 'pergunta', 'alguem', 'sabe'],
  },
];

export const umaPagina = (id: string) => PAGINAS.find(p => p.id === id);

/** Um trecho, e a página em que ele mora. */
export function acharParagrafo(id: string): { pagina: Pagina; paragrafo: Paragrafo } | undefined {
  for (const pagina of PAGINAS) {
    const paragrafo = pagina.paragrafos.find(x => x.id === id);
    if (paragrafo) return { pagina, paragrafo };
  }
  return undefined;
}

/* ── A busca ───────────────────────────────────────────────────────────── */

/** Sem acento e sem maiúscula: a busca não pode depender de quem lembra do til. */
export const normalizar = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const palavras = (s: string) => normalizar(s).split(/[^a-z0-9]+/).filter(Boolean);

/**
 * O que o buscador devolve para uma busca.
 *
 * A ordem é por quantos termos da busca a página tem, e no empate as não
 * confiáveis sobem: é o que acontece de verdade, porque título escrito para
 * ser clicado é título que repete as palavras que as pessoas digitam. Se o
 * especializado viesse sempre em primeiro, a lição viraria "clique no
 * primeiro", que é o hábito que ela existe para desfazer.
 *
 * Busca que não fala do assunto não devolve nada — e não devolve as oito de
 * qualquer jeito, senão digitar "futebol" levaria ao bug do milênio.
 */
export function buscar(consulta: string): Pagina[] {
  const pedidas = new Set(palavras(consulta));
  if (pedidas.size === 0) return [];
  const pontos = (p: Pagina) => p.termos.filter(t => pedidas.has(t)).length;
  const assunto = ['bug', 'milenio', 'y2k', '2000'].some(t => pedidas.has(t));
  if (!assunto) return [];
  return PAGINAS
    .map(p => ({ p, n: pontos(p) }))
    .filter(x => x.n > 0)
    .sort((a, b) => b.n - a.n || Number(a.p.confiavel) - Number(b.p.confiavel))
    .map(x => x.p);
}

/* ── As fichas ─────────────────────────────────────────────────────────── */

export type Avaliacao = 'confiavel' | 'nao-confiavel';

export type Ficha = {
  id: string;
  /** O trecho de onde ela saiu — é daí que vêm a página e a fonte. */
  paragrafoId: string;
  pergunta: PerguntaId;
  /** O que a pessoa anotou, com as próprias palavras. */
  anotacao: string;
  /** Marcada por quem anotou: este trecho desmente o que outra página afirmou. */
  desmente: boolean;
};

export type Caderno = {
  /** As perguntas que a pessoa marcou para guiar a pesquisa. */
  recorte: PerguntaId[];
  /** As buscas feitas, na ordem. */
  buscas: string[];
  /** As páginas abertas. */
  abertas: string[];
  /** Como a pessoa avaliou cada página aberta. */
  avaliacoes: Record<string, Avaliacao>;
  fichas: Ficha[];
};

export const CADERNO_VAZIO: Caderno = { recorte: [], buscas: [], abertas: [], avaliacoes: {}, fichas: [] };

export const contarPalavras = (s: string) => palavras(s).length;

/**
 * A anotação repete a fonte? Oito palavras seguidas iguais é cópia.
 *
 * Oito, e não menos, porque três ou quatro palavras em comum acontecem em
 * qualquer paráfrase honesta — "o ano 2000", "de dois dígitos". Oito seguidas
 * não acontecem sem copiar. A conta ignora acento e maiúscula, senão trocar
 * uma letra por maiúscula viraria paráfrase.
 */
export function copiaDaFonte(anotacao: string, fonte: string, seguidas = 8): boolean {
  const a = palavras(anotacao);
  const f = palavras(fonte);
  if (a.length < seguidas) return false;
  const pedacos = new Set<string>();
  for (let i = 0; i + seguidas <= f.length; i++) pedacos.add(f.slice(i, i + seguidas).join(' '));
  for (let i = 0; i + seguidas <= a.length; i++) {
    if (pedacos.has(a.slice(i, i + seguidas).join(' '))) return true;
  }
  return false;
}

/** O mínimo de uma anotação: menos que isto é título, e não nota. */
export const MIN_PALAVRAS_DA_FICHA = 8;

/**
 * O que a tela pode dizer de uma anotação enquanto ela é escrita.
 *
 * Só tamanho e cópia. Se a fonte é confiável ela **não** diz: avisar "esta
 * página não é confiável" na hora de fazer a ficha responderia a outra tarefa
 * inteira, e dois botões de avaliação virariam duas tentativas.
 */
export function problemaDaAnotacao(f: Pick<Ficha, 'paragrafoId' | 'anotacao'>): string | null {
  const achado = acharParagrafo(f.paragrafoId);
  if (!achado) return 'O trecho desta ficha não existe mais.';
  if (contarPalavras(f.anotacao) < MIN_PALAVRAS_DA_FICHA) return `Escreva a anotação com pelo menos ${MIN_PALAVRAS_DA_FICHA} palavras.`;
  if (copiaDaFonte(f.anotacao, achado.paragrafo.texto)) return 'A anotação repete o texto da página. Escreva com as suas palavras.';
  return null;
}

/** Por que uma ficha não vale para o relatório, ou `null` quando vale. */
export function problemaDaFicha(f: Ficha): string | null {
  const achado = acharParagrafo(f.paragrafoId);
  if (!achado) return 'O trecho desta ficha não existe mais.';
  if (!achado.pagina.confiavel) return `Esta ficha saiu de "${achado.pagina.site}", que não é uma fonte em que se possa confiar.`;
  return problemaDaAnotacao(f);
}

/**
 * A ficha responde à pergunta que diz responder?
 *
 * Separada de `problemaDaFicha` porque é uma coisa que a tela **não** diz:
 * afirmar "este trecho não fala disso" entregaria qual trecho fala. A conta
 * serve à meta, que fica vermelha e manda reler.
 */
export const fichaResponde = (f: Ficha): boolean =>
  acharParagrafo(f.paragrafoId)?.paragrafo.responde === f.pergunta;

/** A referência, do jeito que vai para o fim do relatório. */
export function referenciaDaPagina(p: Pagina): string {
  const autor = p.autor ? `${p.autor}. ` : '';
  const data = p.data ? ` Publicado em ${p.data}.` : '';
  return `${autor}${p.titulo}. ${p.site}. Disponível em: ${p.endereco}.${data}`;
}

/* ── As metas ──────────────────────────────────────────────────────────── */

const mesmoConjunto = <T>(a: readonly T[], b: readonly T[]) =>
  a.length === b.length && new Set(a).size === a.length && a.every(x => b.includes(x));

export interface MetaDaPesquisa {
  id: string;
  titulo: string;
  detalhe: string;
  onde: string;
  passos: string[];
  feita: (c: Caderno) => boolean;
}

export const METAS_DA_PESQUISA: MetaDaPesquisa[] = [
  {
    id: 'recorte',
    titulo: 'Escolher as perguntas que a pesquisa vai responder',
    detalhe: 'Antes de buscar, decida o que você quer descobrir. Das sete perguntas do caderno, quatro servem a um relatório sobre o bug do milênio.',
    onde: 'Caderno de pesquisa › Perguntas',
    passos: [
      'Abra o caderno, no painel ao lado do navegador.',
      'Em Perguntas, marque só as que ajudam a explicar o que foi o bug.',
      'Deixe de fora a que é de outro assunto, a que não explica nada e a que é grande demais.',
    ],
    /* Conjunto igual, e não "contém": marcar as sete deixaria o recorte
       sem recorte nenhum. */
    feita: c => mesmoConjunto(c.recorte, PERGUNTAS_DO_RECORTE),
  },
  {
    id: 'fontes',
    titulo: 'Avaliar cada resultado da busca',
    detalhe: 'Abra os oito resultados e diga, de cada um, se é uma fonte confiável. Olhe quem escreveu, quando, e de onde a página tirou o que diz.',
    onde: 'Botões "Confiável" e "Não confiável", no alto de cada página',
    passos: [
      'Busque por "bug do milênio" e abra o primeiro resultado.',
      'Procure o autor, a data e a lista de fontes no fim da página.',
      'Marque Confiável ou Não confiável e volte aos resultados para abrir o próximo.',
    ],
    feita: c => PAGINAS.every(p => c.avaliacoes[p.id] === (p.confiavel ? 'confiavel' : 'nao-confiavel')),
  },
  {
    id: 'fichas',
    titulo: 'Fazer fichas que respondam às quatro perguntas',
    detalhe: 'Cada ficha guarda um trecho, a pergunta que ele responde e a sua anotação, com as suas palavras. A fonte vai presa a ela sozinha. Ficha de página não confiável não pode ficar no caderno.',
    onde: 'Botão "Fazer ficha" ao lado de cada trecho',
    passos: [
      'Numa página confiável, clique em "Fazer ficha" no trecho que responde a uma pergunta.',
      'Escolha a pergunta e escreva, com as suas palavras, o que o trecho diz.',
      'Faça pelo menos uma ficha para cada uma das quatro perguntas, e apague qualquer ficha que tenha vindo de página não confiável.',
    ],
    /*
      As quatro cobertas por ficha que vale **e** que responde, e nenhuma
      ficha de fonte ruim sobrando. A segunda metade é condição, e não item
      próprio: como item ela abriria verde, porque um caderno sem ficha nenhuma
      não tem ficha ruim.
    */
    feita: c => PERGUNTAS_DO_RECORTE.every(q =>
      c.fichas.some(f => f.pergunta === q && problemaDaFicha(f) === null && fichaResponde(f)))
      && c.fichas.every(f => acharParagrafo(f.paragrafoId)?.pagina.confiavel === true),
  },
  {
    id: 'mito',
    titulo: 'Desmentir a história dos aviões com uma fonte confiável',
    detalhe: 'Uma das páginas afirma que aviões caíram na virada do ano. Ache numa fonte confiável o trecho que diz o que aconteceu, e marque a ficha como "desmente".',
    onde: 'Caixa "Esta ficha desmente o que outra página afirmou", na ficha',
    passos: [
      'Leia o que a página sem autor diz sobre os aviões — sem fazer ficha dela.',
      'Procure, nas páginas confiáveis, o trecho que conta o que aconteceu de fato na virada.',
      'Faça a ficha desse trecho e marque a caixa "desmente".',
    ],
    feita: c => c.fichas.some(f => f.desmente
      && problemaDaFicha(f) === null
      && acharParagrafo(f.paragrafoId)?.paragrafo.desmente === true),
  },
];

/* ── O que a lição seguinte recebe ─────────────────────────────────────── */

/**
 * A ficha como ela viaja para o relatório: com a fonte já escrita.
 *
 * Vai no evento de conclusão, e não numa tabela nova — é a mesma decisão de
 * "lição vencida é um evento". O relatório lê a última pesquisa concluída e
 * não precisa conhecer as páginas: a referência já sai pronta daqui, e o
 * trecho vai junto para a conferência de cópia.
 */
export type FichaEntregue = {
  id: string;
  pergunta: PerguntaId;
  anotacao: string;
  trecho: string;
  desmente: boolean;
  fonte: string;
  site: string;
};

export function fichasParaEntregar(c: Caderno): FichaEntregue[] {
  return c.fichas.flatMap(f => {
    const achado = acharParagrafo(f.paragrafoId);
    if (!achado || problemaDaFicha(f) !== null) return [];
    return [{
      id: f.id, pergunta: f.pergunta, anotacao: f.anotacao.trim(),
      trecho: achado.paragrafo.texto, desmente: f.desmente,
      fonte: referenciaDaPagina(achado.pagina), site: achado.pagina.site,
    }];
  });
}
