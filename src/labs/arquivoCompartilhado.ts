/**
 * A nuvem de arquivos do clube, sem tela nenhuma.
 *
 * É o motor da CC-ES006 Trabalho Compartilhado: quem tem acesso a quê, como a
 * permissão de uma pasta alcança o que está dentro dela, o que o histórico de
 * versões guarda, e o que acontece quando duas pessoas mexem no mesmo arquivo
 * ao mesmo tempo.
 *
 * ── O que ele reaproveita, e por que ────────────────────────────────────
 * O **documento** não nasce aqui: ele é o `Doc` da CC-ES002, com os trechos,
 * as marcas de revisão por autor e os comentários com resposta e resolução.
 * Não é economia — é a razão de a CC-ES006 exigir a CC-ES002 no requisito 1.
 * O modo de sugestão do Google Docs **é** a marca de revisão do Word vista de
 * outro ângulo, e os comentários são os mesmos comentários. Escrever um
 * segundo modelo de documento aqui seria a plataforma com dois "Word" outra
 * vez, com a divergência aparecendo como texto plausível.
 *
 * O que é novo, e mora aqui, é a camada de **colaboração**: o arquivo, a
 * pasta, quem compartilha com quem, o histórico e o conflito.
 *
 * ── E o que carrega esta vereda é o que parece resolvido ────────────────
 * Dar a alguém permissão de editar parece dar a conta; não dá — quando o dono
 * sai, os arquivos vão com ele. Marcar um arquivo como restrito dentro de uma
 * pasta compartilhada parece restringi-lo; não restringe. Mandar o anexo
 * parece a mesma coisa que mandar o vínculo; é, no dia em que se manda. E
 * restaurar uma versão antiga parece apagar as novas; não apaga, e é por medo
 * disso que ninguém restaura.
 */

import type { Autor, Doc } from './documento';

/* ── Quem é quem ──────────────────────────────────────────────────────────── */

/**
 * As pessoas da nuvem.
 *
 * São os mesmos nomes do `Autor` da CC-ES002 justamente para que quem
 * compartilhou o arquivo e quem assinou a marca de revisão sejam a **mesma**
 * pessoa. Dois conjuntos de nomes divergiriam no primeiro ajuste, e a margem
 * do documento passaria a citar gente que não está na lista de acesso.
 */
export type Pessoa = Autor;

/* ── O que cada papel deixa fazer ─────────────────────────────────────────── */

/**
 * Os três níveis do requisito 4.1, do que menos deixa para o que mais deixa.
 *
 * A ordem é o que faz `maisPermissivo` funcionar, e ela é declarada e não
 * alfabética: `comentarista` viria antes de `editor` por acaso, e
 * `leitor` viria depois dos dois.
 */
export const PAPEIS = ['leitor', 'comentarista', 'editor'] as const;
export type Papel = typeof PAPEIS[number];

export const NOME_DO_PAPEL: Record<Papel, string> = {
  leitor: 'Leitor',
  comentarista: 'Comentarista',
  editor: 'Editor',
};

/**
 * O que cada papel deixa fazer, dito como a caixa de compartilhar diria.
 *
 * O `naoPode` de cada um é o que faz os três níveis serem três coisas, e não
 * três palavras: quem tem permissão de comentar e digita no documento não
 * muda o texto — ele **propõe**, e a proposta fica esperando alguém aceitar.
 * Quem não sabe disso acha que editou.
 */
export const O_QUE_O_PAPEL_DEIXA: Record<Papel, { pode: string; naoPode: string }> = {
  leitor: {
    pode: 'Abrir e ler o arquivo, e baixar uma cópia dele.',
    naoPode: 'Escrever, comentar ou sugerir. Nada do que ele fizer chega ao arquivo.',
  },
  comentarista: {
    pode: 'Ler, comentar, responder comentário e propor alteração em modo de sugestão.',
    naoPode: 'Mudar o texto direto: o que ele escreve vira sugestão e espera alguém aceitar.',
  },
  editor: {
    pode: 'Escrever no arquivo, aceitar e rejeitar sugestões, e compartilhar com mais gente.',
    naoPode: 'Apagar o arquivo para todos nem passar a propriedade dele: isso é de quem é dono.',
  },
};

const FORCA: Record<Papel, number> = { leitor: 0, comentarista: 1, editor: 2 };

/** O mais permissivo de dois papéis. É a regra da nuvem, e é o requisito 5. */
export const maisPermissivo = (a: Papel, b: Papel): Papel => (FORCA[a] >= FORCA[b] ? a : b);

export const papelAlcanca = (papel: Papel, minimo: Papel) => FORCA[papel] >= FORCA[minimo];

/* ── Os três modos de trabalhar no documento ──────────────────────────────── */

/**
 * Em que modo a pessoa está escrevendo.
 *
 * O `sugestao` é o requisito 4.4 inteiro: quem escreve nele **não muda o
 * texto**, propõe — e a proposta fica esperando alguém aceitar ou rejeitar.
 * É a marca de revisão do Word vista de outro ângulo, que é por que o
 * documento guarda a mesma coisa dos dois lados.
 */
export type ModoDeTrabalho = 'edicao' | 'sugestao' | 'visualizacao';

/**
 * O que cada modo faz, dito como o próprio editor diria.
 *
 * É **conteúdo**, e por isso mora aqui e não na janela: o passo a passo da
 * lição e as metas leem estas frases. O desenho de cada um fica em
 * `editorNaNuvem.tsx`, sem sair de lá. É o corte de `capturaDoScanner.ts`,
 * e foi o próprio lint que o apontou nos dois.
 */
export const MODOS_DE_TRABALHO: Record<ModoDeTrabalho, { nome: string; diz: string }> = {
  edicao: { nome: 'Edição', diz: 'Você escreve direto no documento.' },
  sugestao: {
    nome: 'Sugestão',
    diz: 'O que você escrever vira sugestão, e espera alguém aceitar.',
  },
  visualizacao: {
    nome: 'Visualização',
    diz: 'Você lê o documento limpo, sem marcas nem comentários.',
  },
};

/* ── O arquivo ────────────────────────────────────────────────────────────── */

export interface Acesso {
  quem: Pessoa;
  papel: Papel;
}

export interface Versao {
  id: string;
  quando: string;
  /**
   * Quem **escreveu** nesta versão.
   *
   * É o que o requisito 8 manda comprovar, e é por isso que quem só abriu o
   * arquivo não entra aqui: ler não é participar, e um histórico que contasse
   * leitura deixaria "produzimos juntos" verdadeiro para quem só olhou.
   */
  porQuem: Pessoa[];
  /** O retrato do documento naquele momento, quando o arquivo é documento. */
  doc?: Doc<string>;
}

export type TipoDeArquivo = 'documento' | 'planilha' | 'pasta' | 'imagem' | 'pdf';

export interface ArquivoDaNuvem {
  id: string;
  nome: string;
  tipo: TipoDeArquivo;
  /**
   * De quem é o arquivo.
   *
   * **Um só, e diferente de quem edita.** É o requisito 2.5, e a distinção que
   * quase ninguém faz: dar permissão de editar parece dar a conta, e não dá.
   * Quando o dono sai do clube, é a conta dele que some — e os arquivos dele
   * somem junto, por mais gente que tivesse acesso.
   */
  dono: Pessoa;
  /** Quem mais entra, e como. Não inclui o dono: ele entra por ser dono. */
  acessos: Acesso[];
  /** A pasta em que ele está. Ausente, ele está na raiz. */
  pasta?: string;
  /**
   * Cópia solta, sem vínculo com o original.
   *
   * É o que "mandar por anexo" produz, e o campo existe para o requisito 3
   * ter o que mostrar: o id do arquivo de que ela saiu, para a divergência
   * poder ser calculada. A cópia **não** volta a se ligar ao original: é isso
   * que a torna uma cópia.
   */
  copiaDe?: string;
  versoes: Versao[];
}

export interface Nuvem {
  arquivos: ArquivoDaNuvem[];
}

/* ── Quem alcança o quê ───────────────────────────────────────────────────── */

const acharArquivo = (n: Nuvem, id: string) => n.arquivos.find(a => a.id === id);

/** A cadeia de pastas até a raiz, da mais próxima para a mais distante. */
export function pastasAcima(n: Nuvem, id: string): ArquivoDaNuvem[] {
  const acima: ArquivoDaNuvem[] = [];
  const vistos = new Set<string>();
  let atual = acharArquivo(n, id);
  while (atual?.pasta && !vistos.has(atual.pasta)) {
    vistos.add(atual.pasta);
    const mae = acharArquivo(n, atual.pasta);
    if (!mae) break;
    acima.push(mae);
    atual = mae;
  }
  return acima;
}

/**
 * O papel que **de fato** vale para esta pessoa neste arquivo.
 *
 * É o requisito 5 inteiro, e a armadilha dele. A permissão de uma pasta
 * alcança tudo o que está dentro dela, inclusive o que for posto lá depois — e
 * quando as duas discordam, **vence a mais permissiva**, que é o que a nuvem
 * de verdade faz.
 *
 * O efeito é o que ninguém espera: pôr um arquivo com acesso restrito dentro
 * de uma pasta compartilhada com o clube inteiro **não o restringe**. Ele
 * continua com o "só eu" escrito na caixa dele, e todo mundo o abre. Nada
 * estoura, nada avisa, e o arquivo está aberto porque alguém o arrastou para a
 * pasta errada.
 *
 * Devolve `undefined` quando a pessoa não alcança o arquivo de jeito nenhum.
 */
export function papelDe(n: Nuvem, id: string, quem: Pessoa): Papel | undefined {
  const arq = acharArquivo(n, id);
  if (!arq) return undefined;
  if (arq.dono === quem) return 'editor';

  const proprios = arq.acessos.filter(a => a.quem === quem).map(a => a.papel);
  const herdados = pastasAcima(n, id).flatMap(p =>
    (p.dono === quem ? ['editor' as Papel] : p.acessos.filter(a => a.quem === quem).map(a => a.papel)));

  const todos = [...proprios, ...herdados];
  return todos.length === 0 ? undefined : todos.reduce(maisPermissivo);
}

export const podeVer = (n: Nuvem, id: string, quem: Pessoa) => papelDe(n, id, quem) !== undefined;

export const podeComentar = (n: Nuvem, id: string, quem: Pessoa) => {
  const p = papelDe(n, id, quem);
  return !!p && papelAlcanca(p, 'comentarista');
};

export const podeEditar = (n: Nuvem, id: string, quem: Pessoa) => {
  const p = papelDe(n, id, quem);
  return !!p && papelAlcanca(p, 'editor');
};

/**
 * Os arquivos que estão com acesso mais aberto do que a caixa deles diz.
 *
 * É o relatório que a lição do requisito 5 usa: um arquivo cuja permissão
 * própria é mais fechada do que a que ele herda da pasta. O número é o que
 * espanta — e ele não aparece em tela nenhuma da nuvem de verdade.
 */
export function abertosPelaPasta(n: Nuvem): { arquivo: ArquivoDaNuvem; quem: Pessoa[] }[] {
  return n.arquivos.flatMap(arq => {
    if (arq.tipo === 'pasta') return [];
    const herdam = pastasAcima(n, arq.id).flatMap(p => p.acessos.map(a => a.quem));
    const quem = [...new Set(herdam)].filter(q =>
      q !== arq.dono && !arq.acessos.some(a => a.quem === q));
    return quem.length > 0 ? [{ arquivo: arq, quem }] : [];
  });
}

/* ── Compartilhar ─────────────────────────────────────────────────────────── */

const mexerNo = (n: Nuvem, id: string, f: (a: ArquivoDaNuvem) => ArquivoDaNuvem): Nuvem =>
  ({ arquivos: n.arquivos.map(a => (a.id === id ? f(a) : a)) });

/** Dar acesso, ou trocar o papel de quem já tem. Nunca duplicar a linha. */
export const compartilhar = (n: Nuvem, id: string, quem: Pessoa, papel: Papel): Nuvem =>
  mexerNo(n, id, a => ({
    ...a,
    acessos: a.acessos.some(x => x.quem === quem)
      ? a.acessos.map(x => (x.quem === quem ? { ...x, papel } : x))
      : [...a.acessos, { quem, papel }],
  }));

export const tirarAcessoDoArquivo = (n: Nuvem, id: string, quem: Pessoa): Nuvem =>
  mexerNo(n, id, a => ({ ...a, acessos: a.acessos.filter(x => x.quem !== quem) }));

/**
 * Passar a propriedade do arquivo.
 *
 * É gesto **separado** de dar permissão de editar, e o requisito 4.6 existe
 * por isso. Quem recebe a propriedade passa a poder apagar e a poder
 * compartilhar sem limite; quem a entrega vira editor, e não some da lista —
 * numa nuvem de verdade o dono anterior continua com acesso, e fingir o
 * contrário ensinaria que transferir é perder.
 */
export const transferirPropriedade = (n: Nuvem, id: string, para: Pessoa): Nuvem =>
  mexerNo(n, id, a => (a.dono === para ? a : {
    ...a,
    dono: para,
    acessos: [
      ...a.acessos.filter(x => x.quem !== para),
      { quem: a.dono, papel: 'editor' as Papel },
    ],
  }));

/**
 * O que o clube perde no dia em que esta pessoa sair.
 *
 * É a conta do requisito 2.5, e a mesma da CC-ES005 um nível acima: dar
 * permissão de editar a mais três pessoas não muda nada aqui. Some a conta de
 * quem é dono, e somem os arquivos dela — com todo mundo tendo acesso até o
 * dia anterior.
 */
export const arquivosQueVaoJunto = (n: Nuvem, quem: Pessoa) =>
  n.arquivos.filter(a => a.dono === quem);

/* ── Anexo ou vínculo: o requisito 3 ──────────────────────────────────────── */

/**
 * Mandar o arquivo por anexo.
 *
 * O que sai é uma **cópia solta**: ela guarda de quem saiu, para a lição poder
 * mostrar a divergência, e não volta a se ligar ao original. É isso que a
 * torna uma cópia, e são os dois problemas que o requisito 3 manda apontar:
 *
 * — o que for escrito num lado não aparece no outro, e em pouco tempo há duas
 *   versões e ninguém sabe qual vale;
 * — quem recebeu fica com ela para sempre. Tirar o acesso ao original não
 *   alcança a cópia, que é a mesma lição de "tirar o acesso não apaga a senha
 *   da memória de quem saiu", da CC-ES005.
 */
export function mandarPorAnexo(n: Nuvem, id: string, para: Pessoa, quando: string): Nuvem {
  const orig = acharArquivo(n, id);
  if (!orig) return n;
  const copia: ArquivoDaNuvem = {
    id: `${orig.id}-copia-${para}`,
    nome: `${orig.nome} (cópia de ${para})`,
    tipo: orig.tipo,
    dono: para,
    acessos: [],
    copiaDe: orig.id,
    versoes: [{ id: `${orig.id}-copia-${para}-v1`, quando, porQuem: [para], doc: versaoAtual(orig)?.doc }],
  };
  return { arquivos: [...n.arquivos, copia] };
}

/**
 * As cópias soltas de um arquivo que já discordam do original.
 *
 * Uma cópia recém-tirada ainda diz a mesma coisa — e é por isso que ela parece
 * inofensiva no dia em que se manda. A divergência aparece depois, quando
 * alguém escreve de um dos lados.
 */
export function copiasQueDivergiram(n: Nuvem, id: string): ArquivoDaNuvem[] {
  const orig = acharArquivo(n, id);
  if (!orig) return [];
  const textoOrig = versaoAtual(orig)?.doc;
  return n.arquivos.filter(a => a.copiaDe === id
    && JSON.stringify(versaoAtual(a)?.doc) !== JSON.stringify(textoOrig));
}

/* ── O histórico de versões: o requisito 4.5 ──────────────────────────────── */

export const versaoAtual = (a: ArquivoDaNuvem): Versao | undefined => a.versoes[a.versoes.length - 1];

/** Gravar uma versão nova. Quem escreveu entra no histórico; quem só leu, não. */
export const gravarVersao = (
  n: Nuvem, id: string, quando: string, porQuem: Pessoa[], doc?: Doc<string>,
): Nuvem => mexerNo(n, id, a => ({
  ...a,
  versoes: [...a.versoes, { id: `${a.id}-v${a.versoes.length + 1}`, quando, porQuem, doc }],
}));

/**
 * Restaurar uma versão anterior.
 *
 * **Ela não apaga as mais novas: acrescenta uma.** É o que a nuvem de verdade
 * faz, e é a metade da lição que decide se alguém usa o recurso ou não — quem
 * acha que restaurar destrói o que veio depois nunca restaura, e prefere
 * refazer o trabalho à mão.
 *
 * E quem restaura entra no histórico: restaurar é uma edição, e no dia
 * seguinte a pergunta vai ser quem desfez aquilo.
 */
export function restaurarVersao(
  n: Nuvem, id: string, versaoId: string, quem: Pessoa, quando: string,
): Nuvem {
  const arq = acharArquivo(n, id);
  const v = arq?.versoes.find(x => x.id === versaoId);
  if (!arq || !v) return n;
  return gravarVersao(n, id, quando, [quem], v.doc);
}

/**
 * Quem de fato escreveu neste arquivo, segundo o histórico.
 *
 * É a prova que o requisito 8 pede. Ler não conta, e é de propósito: um
 * histórico que contasse leitura deixaria "produzimos juntos" verdadeiro para
 * quem só abriu — e deixaria também para o caso que de fato acontece, o de uma
 * pessoa colar o texto das outras duas e o histórico dizer um nome só.
 */
export const quemEscreveu = (a: ArquivoDaNuvem): Pessoa[] =>
  [...new Set(a.versoes.flatMap(v => v.porQuem))];

/* ── O conflito de edição: o requisito 6 ──────────────────────────────────── */

/**
 * O que acontece quando duas pessoas mexem no mesmo arquivo **sincronizado**.
 *
 * Num arquivo da nuvem aberto no navegador não há conflito: as duas edições
 * entram na mesma hora, e é isso que o requisito 4.2 mostra. O conflito é de
 * **arquivo sincronizado** — o que mora na pasta do computador e sobe sozinho.
 * Quem estava sem internet volta, e as duas versões chegam ao servidor.
 *
 * E a nuvem não escolhe: ela **guarda as duas**, e a segunda vira um arquivo
 * ao lado, com "(cópia em conflito de Fulano)" no nome. É aí que o trabalho se
 * perde — não por ser sobrescrito, mas por ficar num arquivo que ninguém abre,
 * na mesma pasta, com nome parecido.
 */
export function conflitoDeSincronizacao(
  n: Nuvem, id: string, quem: Pessoa, doc: Doc<string> | undefined, quando: string,
): Nuvem {
  const orig = acharArquivo(n, id);
  if (!orig) return n;
  const conflito: ArquivoDaNuvem = {
    id: `${orig.id}-conflito-${quem}`,
    nome: `${orig.nome} (cópia em conflito de ${quem})`,
    tipo: orig.tipo,
    dono: orig.dono,
    acessos: orig.acessos,
    pasta: orig.pasta,
    copiaDe: orig.id,
    versoes: [{ id: `${orig.id}-conflito-${quem}-v1`, quando, porQuem: [quem], doc }],
  };
  return { arquivos: [...n.arquivos, conflito] };
}

export const copiasEmConflito = (n: Nuvem) =>
  n.arquivos.filter(a => a.nome.includes('cópia em conflito'));

/**
 * Resolver o conflito: o conteúdo juntado fica, e a cópia sai da pasta.
 *
 * As duas metades são necessárias, e é aí que a lição mora. Juntar sem apagar
 * a cópia deixa na pasta um arquivo quase igual, que alguém vai abrir por
 * engano no mês que vem; apagar sem juntar joga fora o que a outra pessoa
 * escreveu, que é justamente o que o conflito existia para não deixar
 * acontecer.
 */
export function resolverConflito(
  n: Nuvem, id: string, conflitoId: string, juntado: Doc<string> | undefined,
  quem: Pessoa, quando: string,
): Nuvem {
  const semCopia = { arquivos: n.arquivos.filter(a => a.id !== conflitoId) };
  return gravarVersao(semCopia, id, quando, [quem], juntado);
}

/* ── A nuvem do clube, como ela chega ─────────────────────────────────────── */

export const arquivoDe = (
  id: string, nome: string, tipo: TipoDeArquivo, dono: Pessoa,
  extra: Partial<ArquivoDaNuvem> = {},
): ArquivoDaNuvem => ({
  id, nome, tipo, dono, acessos: [], versoes: [{ id: `${id}-v1`, quando: 'há 2 meses', porQuem: [dono] }],
  ...extra,
});

/**
 * A nuvem do clube, do jeito que a diretoria a deixou.
 *
 * Ela chega errada de quatro jeitos, e nenhum deles dá erro em lugar nenhum —
 * a pasta abre, os arquivos abrem, e todo mundo acha o que procura:
 *
 * — a ficha médica das crianças está dentro da pasta que o clube inteiro
 *   enxerga. A caixa dela diz "só você", e não é verdade: a pasta é mais
 *   permissiva e a pasta vence;
 * — o combinado do acampamento ficou de fora de toda pasta, e por isso foi
 *   mandado por anexo em vez de compartilhado;
 * — quase tudo é de uma pessoa só. Dar acesso a mais gente não muda isso;
 * — e há uma cópia em conflito parada na pasta desde a semana passada, com um
 *   parágrafo que ninguém leu.
 */
export const nuvemDoClube = (): Nuvem => ({
  arquivos: [
    arquivoDe('pasta-clube', 'Clube Pioneiros', 'pasta', 'marta', {
      acessos: [
        { quem: 'voce', papel: 'editor' },
        { quem: 'ronaldo', papel: 'editor' },
        { quem: 'cleide', papel: 'leitor' },
      ],
    }),
    arquivoDe('pasta-acampamento', 'Acampamento de julho', 'pasta', 'marta', {
      pasta: 'pasta-clube',
    }),
    arquivoDe('fichas', 'Fichas médicas 2026', 'planilha', 'marta', {
      pasta: 'pasta-acampamento',
      /* Sem acesso próprio nenhum — e mesmo assim quatro pessoas a abrem, pela
         pasta. É o requisito 5 inteiro, e é o arquivo em que ele mais custa. */
    }),
    /*
      Ele está **fora** das pastas, e é de propósito.

      Duas lições precisam disso, e nenhuma das duas acontece lá dentro. O
      modo de sugestão do requisito 4.4 só existe para quem comenta e não
      edita — e dentro de "Clube Pioneiros" toda permissão de comentar é
      atropelada pela de editar que a pasta dá. E o requisito 3 pede tirar o
      acesso ao original depois de mandar o anexo: dentro da pasta, tirar não
      tira nada.

      É também por que ele foi mandado por anexo na vida real: arquivo que não
      está num lugar compartilhado é arquivo que alguém manda de outro jeito.
    */
    arquivoDe('combinado', 'Combinado do acampamento', 'documento', 'marta', {
      acessos: [{ quem: 'voce', papel: 'comentarista' }],
    }),
    arquivoDe('escala', 'Escala das unidades', 'documento', 'ronaldo', {
      pasta: 'pasta-clube',
      acessos: [{ quem: 'voce', papel: 'editor' }, { quem: 'marta', papel: 'editor' }],
    }),
    arquivoDe('ata', 'Ata da reunião de junho', 'documento', 'marta', {
      pasta: 'pasta-clube',
    }),
  ],
});
