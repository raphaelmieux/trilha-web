/*
 * A pesquisa do bug do milênio — requisito 6 da AP045.
 *
 * "Pesquisar em sites especializados e apresentar um relatório a respeito do
 * que foi o bug do milênio."
 *
 * São duas metades, e esta é a primeira: **pesquisar em sites especializados**.
 * A trilha abriu com o requisito inteiro como lição de teoria — a plataforma
 * contava o que foi o bug, e a pesquisa ficava para fora daqui. Só que ler um
 * resultado de busca e decidir se ele serve é um gesto que se faz numa tela, e
 * é justamente o gesto que o requisito nomeia primeiro.
 *
 * ── A ficha nasce da página, e é decisão ─────────────────────────────────
 * Não há campo para digitar um fato. A ficha se faz clicando numa frase da
 * página aberta, e a fonte vai junto porque ela **é** de onde a frase saiu.
 *
 * Um campo de texto livre com um campo de fonte ao lado teria a forma certa e
 * mediria a coisa errada: o desbravador digitaria o fato de cabeça e escreveria
 * qualquer coisa no campo da fonte, e a plataforma daria por boa uma ficha cuja
 * fonte não sustenta nada. É a família do "Figura 1" digitado da CC-ES002 — um
 * número escrito à mão onde deveria haver um campo.
 *
 * ── Então o que erra? De qual página se tira ─────────────────────────────
 * Toda ficha sai bem formada, inclusive a que veio do fórum. O buscador mistura
 * páginas especializadas, páginas verdadeiras mas **incompletas** e páginas
 * **não confiáveis**, e as três se parecem na lista de resultados — que é como
 * elas se parecem na vida.
 *
 * O que as separa está escrito em cada página, e não num rótulo nosso: quem
 * assina, quando foi publicado, se diz de onde tirou. A lista de tarefas nomeia
 * o critério — "todas as fichas vêm de páginas que dizem quem escreveu e
 * quando" — e nunca qual página é qual. Pôr um selo de "confiável" no resultado
 * resolveria o requisito num olhar, e resolveria só aqui dentro.
 *
 * ── E a notícia de dezembro de 1999 ──────────────────────────────────────
 * Ela é de um jornal sério, tem autor e data, e não tem como responder "o que
 * aconteceu na virada" — porque foi escrita antes. É a página que ensina que
 * fonte boa não é fonte boa **para qualquer pergunta**, e é a razão de a lista
 * cobrar as quatro etapas em vez de só cobrar um número de fichas.
 *
 * ── Os fatos são os mesmos que o relatório confere ───────────────────────
 * Cada frase que vira ficha é, literalmente, um dos fatos que a Edge Function
 * guarda para conferir o relatório da lição seguinte. Conferir o texto contra
 * um fato que a pesquisa não podia ter achado reprovaria quem pesquisou direito
 * — e `pesquisaDoMilenio.test.ts` compara as duas listas, como
 * `ofensiva.test.ts` compara a do banco com a do navegador.
 */

/** As quatro perguntas que o relatório da lição seguinte responde com fatos. */
export type Etapa = 'causa' | 'temor' | 'correcao' | 'resultado';

export const ETAPAS: { id: Etapa; titulo: string; pergunta: string }[] = [
  { id: 'causa', titulo: 'Por que ele existia', pergunta: 'O que era o bug do milênio, e por que ele existia?' },
  { id: 'temor', titulo: 'O que se temia', pergunta: 'O que as pessoas temiam que acontecesse na virada?' },
  { id: 'correcao', titulo: 'O que foi feito', pergunta: 'O que governos e empresas fizeram para evitar o problema?' },
  { id: 'resultado', titulo: 'O que aconteceu', pergunta: 'O que aconteceu de fato em 1º de janeiro de 2000?' },
];

/** Uma frase da página que pode virar ficha. */
export interface FraseDaPagina {
  etapa: Etapa;
  texto: string;
}

export interface Pagina {
  id: string;
  titulo: string;
  url: string;
  /** O que a lista de resultados mostra por baixo do título. */
  resumo: string;
  /** Quem assina. Vazio é uma página que não diz — e isso se lê na tela. */
  autor: string;
  /** Quando foi publicado. Vazio é uma página sem data. */
  publicado: string;
  /** De onde a página diz que tirou o que afirma. Vazio é "não diz". */
  referencias: string;
  /** A prosa da página, antes das frases que viram ficha. */
  abertura: string;
  frases: FraseDaPagina[];
  /**
   * Página especializada: diz quem escreveu, quando, e de onde tirou.
   *
   * O campo **não** aparece na tela. Ele existe para a lista de tarefas poder
   * conferir de onde as fichas saíram — e desenhá-lo como um selo resolveria o
   * requisito num olhar, e resolveria só aqui dentro.
   */
  especializada: boolean;
  /** O que há de errado com ela, para a explicação depois de concluída. */
  porQueNaoServe?: string;
}

/* ── As páginas que o buscador devolve ────────────────────────────────────
   Quatro especializadas, duas verdadeiras mas incompletas para a pergunta que
   importa, e duas que afirmam o que não aconteceu. Na lista de resultados as
   oito se parecem. */

export const PAGINAS: Pagina[] = [
  {
    id: 'museu',
    titulo: 'O bug do milênio: o que foi e por que aconteceu',
    url: 'museudacomputacao.org.br/acervo/y2k',
    resumo: 'Verbete do acervo sobre o problema do ano 2000, com a origem técnica do erro e o esforço de correção.',
    autor: 'Equipe de acervo do Museu da Computação',
    publicado: '12 de março de 2024',
    referencias: 'Baseado em relatórios técnicos de 1998 e 1999 citados ao pé da página.',
    especializada: true,
    abertura:
      'O chamado bug do milênio foi um problema de representação de datas que atingiu programas '
      + 'escritos ao longo de várias décadas. Ele não era um vírus nem uma falha de fabricação: era '
      + 'uma decisão de projeto que fazia sentido quando foi tomada e deixou de fazer com o tempo.',
    frases: [
      { etapa: 'causa', texto: 'Muitos sistemas antigos guardavam o ano com apenas dois dígitos — 98 no lugar de 1998 — para economizar memória, que era cara nas décadas de 1960 e 1970.' },
      { etapa: 'causa', texto: 'Com dois dígitos, o ano 2000 virava "00", e um programa podia entendê-lo como 1900.' },
      { etapa: 'causa', texto: 'O problema também é chamado de Y2K: Y de year, ano em inglês, e 2K de dois mil.' },
      { etapa: 'correcao', texto: 'Governos e empresas passaram anos revisando os programas e corrigindo o ano para quatro dígitos, ou ensinando o programa a entender "00" como 2000.' },
      { etapa: 'correcao', texto: 'Programadores de linguagens antigas, como o COBOL, foram chamados de volta ao trabalho para corrigir sistemas.' },
    ],
  },
  {
    id: 'revista',
    titulo: 'Vinte e cinco anos depois: o que realmente aconteceu na virada do milênio',
    url: 'revistacienciahoje.com.br/reportagens/y2k-25-anos',
    resumo: 'Reportagem de retrospectiva sobre o medo, a preparação e o que de fato falhou em 1º de janeiro de 2000.',
    autor: 'Marina Peçanha, repórter de ciência',
    publicado: '2 de janeiro de 2025',
    referencias: 'Entrevistas com três engenheiros que trabalharam na correção, e dados do relatório final do comitê norte-americano.',
    especializada: true,
    abertura:
      'A virada de 1999 para 2000 foi esperada com um misto de festa e apreensão. Vinte e cinco anos '
      + 'depois, o que sobrou é uma discussão que ainda não terminou: o desastre não veio porque o '
      + 'trabalho foi feito, ou porque nunca houve tanto risco assim?',
    frases: [
      { etapa: 'temor', texto: 'Temia-se que sistemas de bancos, energia, hospitais, telefonia e transporte falhassem na virada de 31 de dezembro de 1999 para 1º de janeiro de 2000.' },
      { etapa: 'resultado', texto: 'Na virada para 2000 não aconteceram os desastres previstos: nenhum avião caiu por causa do bug, e não houve apagão em larga escala.' },
      { etapa: 'resultado', texto: 'Houve falhas pequenas e isoladas, como sites e sistemas mostrando o ano como 1900 ou "19100", corrigidas em pouco tempo.' },
      { etapa: 'resultado', texto: 'Especialistas atribuem a calmaria principalmente ao trabalho de correção feito antes; outros acham que o risco foi exagerado.' },
    ],
  },
  {
    id: 'enciclopedia',
    titulo: 'Problema do ano 2000 — verbete',
    url: 'enciclopedialivre.org/wiki/Problema_do_ano_2000',
    resumo: 'Verbete enciclopédico com a definição, os efeitos sobre cálculos com data e o problema equivalente previsto para 2038.',
    autor: 'Verbete coletivo, com histórico de edições assinado',
    publicado: 'Última revisão em 7 de agosto de 2025',
    referencias: 'Trinta e duas referências ao pé do verbete, com link para cada uma.',
    especializada: true,
    abertura:
      'O problema do ano 2000 designa a classe de falhas previstas em sistemas de informação na '
      + 'passagem de 1999 para 2000, decorrente do armazenamento do ano em dois dígitos.',
    frases: [
      { etapa: 'causa', texto: 'Contas que dependem da data — idade, juros, prazos e vencimentos — podiam dar resultado errado ou até negativo.' },
      { etapa: 'correcao', texto: 'Os sistemas foram testados adiantando o relógio para depois da virada, antes de ela acontecer.' },
      { etapa: 'resultado', texto: 'Um problema parecido é esperado para 2038 em sistemas que guardam o tempo em 32 bits.' },
    ],
  },
  {
    id: 'governo',
    titulo: 'Relatório final do grupo de trabalho do ano 2000',
    url: 'arquivo.gov.br/documentos/relatorio-ano-2000',
    resumo: 'Documento oficial sobre a preparação brasileira: bancos, setor elétrico e serviços públicos.',
    autor: 'Grupo de trabalho interministerial',
    publicado: '30 de junho de 2000',
    referencias: 'Anexos com os planos de contingência de cada setor.',
    especializada: true,
    abertura:
      'Este relatório consolida as ações realizadas entre 1997 e 2000 para adequação dos sistemas '
      + 'de informação da administração pública federal e dos setores considerados críticos.',
    frases: [
      { etapa: 'correcao', texto: 'No Brasil, bancos, governo e empresas também fizeram planos de correção e testes.' },
      { etapa: 'correcao', texto: 'O custo da correção no mundo é estimado em centenas de bilhões de dólares — perto de 300 bilhões.' },
      { etapa: 'temor', texto: 'Havia medo de erros em cobranças, pagamentos e registros, e de aparelhos com relógio interno pararem de funcionar.' },
    ],
  },

  /* ── Verdadeiras, e incompletas para a pergunta que importa ──────────── */
  {
    id: 'jornal-1999',
    titulo: 'País se prepara para a virada; bancos garantem normalidade',
    url: 'acervo.jornaldatarde.com.br/1999/12/28/caderno-economia',
    resumo: 'Reportagem publicada três dias antes da virada, com o que se esperava e o que estava sendo feito.',
    autor: 'Redação — caderno de Economia',
    publicado: '28 de dezembro de 1999',
    referencias: 'Fontes ouvidas na matéria: federação dos bancos e concessionárias de energia.',
    especializada: true,
    /* Ela é de um jornal sério, tem autor e data, e **não tem como** responder
       "o que aconteceu na virada", porque foi escrita antes. É a página que
       ensina que fonte boa não é fonte boa para qualquer pergunta — e é por
       isso que a lista cobra as quatro etapas, e não um número de fichas. */
    abertura:
      'A três dias da virada do ano, empresas e órgãos públicos afirmam estar preparados. O que se '
      + 'sabe até aqui, e o que ainda preocupa especialistas ouvidos pela reportagem.',
    frases: [
      { etapa: 'temor', texto: 'Muitas pessoas guardaram comida, água e dinheiro em casa por precaução.' },
      { etapa: 'temor', texto: 'Parte da imprensa e muitos boatos espalharam previsões exageradas, como aviões caindo do céu.' },
    ],
  },
  {
    id: 'blog',
    titulo: 'Lembram do Y2K? Eu lembro da festa e do medo',
    url: 'memoriasdos90.blog/y2k-lembrancas',
    resumo: 'Texto pessoal sobre como foi passar a virada do ano 2000 em família, com o medo no ar.',
    autor: '',
    publicado: '',
    referencias: '',
    especializada: false,
    porQueNaoServe:
      'Não diz quem escreveu nem quando. O que ela conta pode ser verdade, mas não há como conferir '
      + 'nada, nem saber se quem escreveu entendia do assunto.',
    abertura:
      'Eu tinha onze anos e lembro do meu pai enchendo garrafas de água. A gente não sabia direito o '
      + 'que ia acontecer, só que era pra ter medo de alguma coisa dentro dos computadores.',
    frases: [
      { etapa: 'temor', texto: 'Muitas pessoas guardaram comida, água e dinheiro em casa por precaução.' },
    ],
  },

  /* ── Não confiáveis: afirmam, com segurança, o que não aconteceu ─────── */
  {
    id: 'forum',
    titulo: 'A VERDADE sobre o ano 2000 que ninguém conta',
    url: 'forumaberto.net/topico/98211',
    resumo: 'Resposta num fórum aberto afirmando que houve desastres na virada e que eles foram abafados.',
    autor: '',
    publicado: '',
    referencias: '',
    especializada: false,
    porQueNaoServe:
      'É uma resposta de fórum, sem autor identificado e sem nenhuma fonte. E o que ela afirma é '
      + 'desmentido por todas as páginas que dizem de onde tiraram o que escrevem.',
    abertura:
      'Galera, meu tio trabalhava em aeroporto e contou tudo. Na virada caiu avião em vários países '
      + 'e a imprensa foi proibida de falar. Pesquisem que vocês vão ver.',
    frases: [
      { etapa: 'resultado', texto: 'Na virada de 2000 caíram aviões em vários países, e os governos esconderam as notícias.' },
    ],
  },
  {
    id: 'conspiracao',
    titulo: 'Y2K: a maior jogada de marketing da história',
    url: 'averdadeoculta.info/y2k-farsa',
    resumo: 'Artigo afirmando que o bug do milênio nunca existiu e foi inventado para vender computadores novos.',
    autor: '',
    publicado: '',
    referencias: '',
    especializada: false,
    porQueNaoServe:
      'Não assina, não data e não cita nada. Afirma que o problema nunca existiu — e o relatório '
      + 'oficial e os verbetes com referência mostram o contrário, com anexos e números.',
    abertura:
      'Nunca houve bug nenhum. Foi tudo combinado entre as empresas de informática para obrigar o '
      + 'mundo inteiro a trocar de computador na virada do século.',
    frases: [
      { etapa: 'causa', texto: 'O bug do milênio nunca existiu: nenhum sistema guardava o ano em dois dígitos.' },
    ],
  },
];

export const paginaPorId = (id: string): Pagina | undefined => PAGINAS.find(p => p.id === id);

/* ── O buscador ───────────────────────────────────────────────────────────── */

/**
 * O que a busca devolve.
 *
 * Ela casa palavra a palavra contra o título e o resumo, e **não** ordena as
 * confiáveis primeiro: uma lista que pusesse as especializadas no topo faria o
 * requisito ser cumprido clicando de cima para baixo. A ordem é a do índice,
 * que é como um resultado de busca de verdade mistura as duas.
 *
 * Busca vazia não devolve nada, em vez de devolver tudo: um buscador que
 * entrega o índice inteiro sem se perguntar nada não é um buscador.
 */
export function buscar(termo: string): Pagina[] {
  const palavras = termo.toLowerCase().split(/\s+/).filter(p => p.length >= 3);
  if (palavras.length === 0) return [];
  return PAGINAS.filter(p => {
    const texto = `${p.titulo} ${p.resumo} ${p.url}`.toLowerCase();
    return palavras.some(w => texto.includes(w));
  });
}

/* ── As fichas ────────────────────────────────────────────────────────────── */

export interface Ficha {
  /** A frase, como ela está na página. Ninguém a digita. */
  fato: string;
  etapa: Etapa;
  /** De onde ela saiu. Vai junto porque a ficha nasceu da página. */
  pagina: string;
}

export const FICHAS_INICIAIS: Ficha[] = [];

/** Guardar a mesma frase duas vezes não acrescenta pesquisa nenhuma. */
export function guardar(fichas: Ficha[], f: Ficha): Ficha[] {
  if (fichas.some(x => x.fato === f.fato && x.pagina === f.pagina)) return fichas;
  return [...fichas, f];
}

export function descartar(fichas: Ficha[], fato: string, pagina: string): Ficha[] {
  return fichas.filter(f => !(f.fato === fato && f.pagina === pagina));
}

const fontesDe = (fichas: Ficha[]): string[] => [...new Set(fichas.map(f => f.pagina))];

const daEtapa = (fichas: Ficha[], e: Etapa) => fichas.filter(f => f.etapa === e);

/** As fichas que vieram de página que não diz quem escreveu nem quando. */
export const fichasSemFonteConfiavel = (fichas: Ficha[]): Ficha[] =>
  fichas.filter(f => !paginaPorId(f.pagina)?.especializada);

/* ── O que a lição cobra ──────────────────────────────────────────────────── */

export interface Verificacao {
  id: string;
  rotulo: string;
  dica: string;
  feita: (fichas: Ficha[]) => boolean;
}

export const VERIFICACOES: Verificacao[] = [
  {
    id: 'quatro-etapas',
    rotulo: 'Há pelo menos uma ficha para cada uma das quatro perguntas',
    dica: 'Uma página pode responder muito bem a uma pergunta e não ter como responder a outra — repare na data em que ela foi publicada.',
    feita: fichas => ETAPAS.every(e => daEtapa(fichas, e.id).length > 0),
  },
  {
    id: 'tres-fontes',
    rotulo: 'As fichas vêm de pelo menos três páginas diferentes',
    dica: 'O requisito fala em "sites especializados", no plural: uma página só não se confere contra nada.',
    feita: fichas => fontesDe(fichas).length >= 3,
  },
  {
    id: 'so-especializadas',
    rotulo: 'Todas as fichas vêm de páginas que dizem quem escreveu, quando, e de onde tiraram',
    /* A dica nomeia o critério, e nunca qual página é qual. Um selo de
       "confiável" no resultado da busca resolveria o requisito num olhar — e
       resolveria só aqui dentro, onde há alguém pondo o selo. */
    dica: 'Abra cada página e olhe o cabeçalho dela: tem autor? tem data? diz de onde tirou o que afirma? Descarte as fichas que vieram das que não têm.',
    feita: fichas => fichas.length > 0 && fichasSemFonteConfiavel(fichas).length === 0,
  },
  {
    id: 'oito-fichas',
    rotulo: 'Há pelo menos oito fichas guardadas',
    dica: 'O relatório da próxima lição é escrito a partir delas: com duas ou três não há o que escrever.',
    feita: fichas => fichas.length >= 8,
  },
];

export const quantasFeitas = (fichas: Ficha[]): number => VERIFICACOES.filter(v => v.feita(fichas)).length;
export const tudoFeito = (fichas: Ficha[]): boolean => VERIFICACOES.every(v => v.feita(fichas));
