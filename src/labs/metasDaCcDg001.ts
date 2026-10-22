/**
 * O que cada lição da CC-DG001 cobra, e de que estado do arquivo ela parte.
 *
 * Mora fora do componente e fora da trava, pelo motivo escrito no
 * `LICOES_DA_CC_ES013`: quem lê é a tela, que monta a lição, **e** a trava,
 * que confere que nenhuma meta abre verde.
 *
 * ── Cada lição parte de onde a anterior acabou ───────────────────────────
 * O arquivo é um só, e o módulo 2 recebe o cartaz que o módulo 1 arrumou. Onde
 * a mudança é **de medida** — tamanho, posição, cor —, o estado se deriva
 * chamando os comandos do editor; onde ela é **o texto** — a justificativa de
 * cada cor, a análise de cada peça —, ele está escrito, porque não há de onde
 * derivar prosa.
 *
 * ── As medidas são as de `design.ts`, e só elas ──────────────────────────
 * Nenhuma meta mede um princípio por conta própria. A que manda criar
 * hierarquia no cartaz e a que manda julgar a hierarquia do convite chamam a
 * mesma função, e é isso que impede a peça "bem resolvida" da análise de ser
 * julgada por uma régua que o laboratório de refazer não usa.
 */

import {
  PAPEIS, alturaDe, caixaDe, coresDistintas, distanciaDeMatiz, eixosDe, ehDeLeitura,
  FAMILIAS, foraDaGama, hierarquiaFunciona, hslDe, margemMinima, margemPedida, mesmaForma,
  mesmaPeca, mesmoEstilo, mesmoTexto, nivelDoCorpo, objetosForaDaPrancha, pesoVisual,
  proximidadeFunciona, quemEstragaAHierarquia, textos, textosQueNaoSeLeem,
  textosSobrepostos, textosSoltos, umObjeto, umaPrancha, contrasteFunciona,
  alinhamentoFunciona, textoSeLe, duplicarPrancha, mudarObjetos, mudarPrancha, hexDeHsl,
  type Arte, type Objeto, type Papel, type Prancha, type Texto,
} from './design';
import { contrastRatio } from '../lib/imageTools';
import {
  ARTE_INICIAL, AVISO, BATISMO, BATISMO_PECA, CARTAZ, CARTOES, CLASSE_DA_PECA,
  CORPO_DO_FOLHETO, ESCALA, ESCALA_DA_CANTINA, FOLHETO, GRUPOS_DO_AVISO,
  HORAS_DOS_CARTOES, PALAVRA_DA_SITUACAO, PECAS_DA_ANALISE, PROGRAMACAO, TINTA,
  TITULOS_DOS_CARTOES, linhaDaEscala, tituloDaPeca,
  type Classe, type PecaDaAnalise, type Situacao,
} from './arteDoClube';

/* ── A lição, e o que viaja com ela ───────────────────────────────────────── */

export type LicaoDaCcDg001 =
  | 'hierarquia' | 'alinhamento' | 'repeticao' | 'cor'
  | 'tipografia' | 'analise' | 'refazer' | 'contraste';

/** Em que tela a lição abre: o editor, ou a tela da plataforma. */
export type ProgramaDaLicao = 'design' | 'plataforma';

export type Principio = 'hierarquia' | 'contraste' | 'alinhamento';
export const PRINCIPIOS: Principio[] = ['hierarquia', 'contraste', 'alinhamento'];
export const NOME_DO_PRINCIPIO: Record<Principio, string> = {
  hierarquia: 'Hierarquia', contraste: 'Contraste', alinhamento: 'Alinhamento',
};

export type Veredito = 'funciona' | 'falha';

export interface NotaDoPrincipio {
  veredito: Veredito | null;
  /** O id do elemento da peça em que o princípio se vê — o que a pessoa apontou. */
  elemento: string | null;
  texto: string;
}

export interface AnaliseDaPeca {
  classe: Classe | null;
  notas: Record<Principio, NotaDoPrincipio>;
}

const NOTA_VAZIA: NotaDoPrincipio = { veredito: null, elemento: null, texto: '' };
const ANALISE_VAZIA: AnaliseDaPeca = {
  classe: null,
  notas: { hierarquia: NOTA_VAZIA, contraste: NOTA_VAZIA, alinhamento: NOTA_VAZIA },
};

/**
 * O que a pessoa escreveu, e que nenhum editor de design tem onde guardar.
 *
 * É o arranjo do caderno da CC-ES009: o programa desenha, e o porquê de cada
 * escolha mora na plataforma, ao lado dele.
 */
export interface CadernoDoDesign {
  porQueDaCor: Record<Papel, string>;
  parTipografico: string;
  corSozinha: string;
}

export const CADERNO_VAZIO: CadernoDoDesign = {
  porQueDaCor: { fundo: '', texto: '', destaque: '', apoio: '', neutro: '' },
  parTipografico: '',
  corSozinha: '',
};

export interface ContextoDoDesign {
  arte: Arte;
  /**
   * O que a pessoa viu acontecer, e o que mediu.
   *
   * Fica no contexto e não no arquivo: o que aconteceu foi com quem estuda. É
   * a decisão de `descobertas` da CC-ES004, escrita lá.
   */
  descobertas: string[];
  caderno: CadernoDoDesign;
  analise: Record<PecaDaAnalise, AnaliseDaPeca>;
}

export const CHAVE_DA_PROVA = 'viu-a-prova-de-impressao';
export const CHAVE_SEM_COR = 'viu-a-escala-sem-cor';
export const chaveDaMedida = (prancha: string, texto: string) => `mediu:${prancha}:${texto}`;

/* ── Contas de apoio ─────────────────────────────────────────────────────── */

const palavrasDe = (s: string) => s.trim().split(/\s+/).filter(Boolean);
const sem = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const prancha = (c: ContextoDoDesign, id: string) => umaPrancha(c.arte, id);

/** O texto que a peça carrega continua o mesmo — viaja como conjunção, porque abre verde. */
const textoIntacto = (c: ContextoDoDesign, id: string, original: Prancha) => {
  const p = prancha(c, id);
  return !!p && mesmoTexto(p, original);
};

/** Nada encavalado e nada fora da prancha, que também abre verde e também viaja junto. */
const semEncavalar = (p: Prancha) =>
  textosSobrepostos(p).length === 0 && objetosForaDaPrancha(p).length === 0;

const texto = (p: Prancha, id: string) => {
  const o = umObjeto(p, id);
  return o && o.tipo === 'texto' ? o : undefined;
};

/* ── As metas ────────────────────────────────────────────────────────────── */

export interface MetaDoDesign {
  id: string;
  titulo: string;
  detalhe: string;
  onde: string;
  passos: string[];
  feita: (c: ContextoDoDesign) => boolean;
}

/* Módulo 1 — hierarquia */

/** O nível do corpo do cartaz, que é a régua dos dois degraus acima e do de baixo. */
const corpoDoCartaz = (p: Prancha) => nivelDoCorpo(p);

const metasDaHierarquia = (inicio: Prancha): MetaDoDesign[] => [
  {
    id: 'titulo-se-destaca',
    titulo: 'Fazer o título ser lido primeiro',
    detalhe: 'Maior que tudo, sozinho no topo da ordem, e pelo menos quase o dobro do texto comum. Sem mudar uma palavra e sem nada encavalado.',
    onde: 'Propriedades → Texto',
    passos: [
      'Clique no título na prancha (ou na lista de camadas).',
      'No painel de propriedades, aumente o corpo — algo entre 36 e 44 funciona — e ponha em negrito.',
      'Se ele quebrar em duas linhas e encostar na data, desça os blocos de baixo pelo campo Y.',
    ],
    feita: c => {
      const p = prancha(c, CARTAZ);
      return !!p && hierarquiaFunciona(p, 'titulo') && semEncavalar(p) && textoIntacto(c, CARTAZ, inicio);
    },
  },
  {
    id: 'data-no-segundo-degrau',
    titulo: 'Pôr a data no segundo degrau',
    detalhe: 'Menor que o título e maior que o texto comum: é a segunda coisa que quem passa pelo mural precisa saber.',
    onde: 'Propriedades → Texto',
    passos: [
      'Selecione a data.',
      'Aumente o corpo para um tamanho entre o do título e o do texto — 22 ou 24 — ou ponha em negrito.',
      'Confira que o título continua sendo o maior.',
    ],
    feita: c => {
      const p = prancha(c, CARTAZ);
      const titulo = p && texto(p, 'titulo');
      const data = p && texto(p, 'data');
      if (!p || !titulo || !data) return false;
      const base = corpoDoCartaz(p);
      return pesoVisual(data) >= base + 1.5 && pesoVisual(data) <= pesoVisual(titulo) - 1.5
        && semEncavalar(p) && textoIntacto(c, CARTAZ, inicio);
    },
  },
  {
    id: 'clube-por-ultimo',
    titulo: 'Deixar o nome do clube para o fim da leitura',
    detalhe: 'A assinatura é o último degrau: menor que o texto comum. Do mesmo tamanho, ela disputa com a descrição.',
    onde: 'Propriedades → Texto',
    passos: [
      'Selecione a linha do clube, no pé do cartaz.',
      'Diminua o corpo para menos que o do texto comum — 14, por exemplo.',
    ],
    feita: c => {
      const p = prancha(c, CARTAZ);
      const clube = p && texto(p, 'clube');
      return !!p && !!clube && pesoVisual(clube) <= corpoDoCartaz(p) - 1.5
        && semEncavalar(p) && textoIntacto(c, CARTAZ, inicio);
    },
  },
];

/* Módulo 2 — alinhamento e proximidade */

const metasDoAlinhamento = (inicio: Prancha): MetaDoDesign[] => [
  {
    id: 'uma-borda-so',
    titulo: 'Pôr as oito linhas na mesma borda',
    detalhe: 'Todas começando no mesmo ponto. Um bloco a sete pixels dos outros é o degrau que o olho vê antes de saber o que viu.',
    onde: 'Barra de alinhar → Alinhar à esquerda',
    passos: [
      'Selecione todos os textos: clique no primeiro e, segurando Shift, nos outros (ou Ctrl+A).',
      'Clique em Alinhar à esquerda, na barra de cima.',
      'Todos vão para a borda do que estava mais à esquerda.',
    ],
    feita: c => {
      const p = prancha(c, AVISO);
      return !!p && eixosDe(textos(p)) === 1 && semEncavalar(p) && textoIntacto(c, AVISO, inicio);
    },
  },
  {
    id: 'grupos-separados',
    titulo: 'Juntar o que vai junto e afastar o que é outro assunto',
    detalhe: 'O quando (dia, hora, lugar) num bloco, o que levar em outro. O vão entre os blocos precisa ser pelo menos o dobro do vão de dentro.',
    onde: 'Propriedades → Y, e Distribuir verticalmente',
    passos: [
      'Selecione as três linhas do quando e aproxime-as: diminua o Y das de baixo até ficarem quase coladas.',
      'Faça o mesmo com as três do que levar.',
      'Abra um vão maior entre o título, o quando, o que levar e a assinatura.',
      'Distribuir verticalmente, com as três de um grupo selecionadas, iguala o vão de dentro.',
    ],
    feita: c => {
      const p = prancha(c, AVISO);
      return !!p && proximidadeFunciona(p, GRUPOS_DO_AVISO) && semEncavalar(p) && textoIntacto(c, AVISO, inicio);
    },
  },
];

/* Módulo 3 — repetição e espaço negativo */

/** Os cartões na ordem da página, e o vão entre cada par vizinho. */
const vaosEntreCartoes = (p: Prancha) => {
  const cs = CARTOES.map(id => umObjeto(p, id)).filter((o): o is Objeto => !!o).sort((a, b) => a.x - b.x);
  return cs.slice(1).map((o, i) => o.x - (cs[i].x + cs[i].largura));
};

/** O respiro que os textos de um cartão têm até a borda dele. */
const respiroDentroDoCartao = (p: Prancha, cartao: string) => {
  const r = umObjeto(p, cartao);
  if (!r) return -Infinity;
  const c = caixaDe(r);
  const dentro = [`${cartao}-titulo`, `${cartao}-hora`].map(id => umObjeto(p, id)).filter((o): o is Objeto => !!o);
  return Math.min(...dentro.map(o => {
    const t = caixaDe(o);
    return Math.min(t.x - c.x, t.y - c.y, c.x + c.largura - (t.x + t.largura), c.y + c.altura - (t.y + t.altura));
  }));
};

export const VAO_ENTRE_CARTOES = 16;
export const RESPIRO_DENTRO = 8;

const metasDaRepeticao = (inicio: Prancha): MetaDoDesign[] => [
  {
    id: 'cartoes-iguais',
    titulo: 'Fazer os três cartões iguais',
    detalhe: 'Mesma largura, mesma altura, mesma cor. Três cartões diferentes parecem três avisos; três iguais parecem uma programação.',
    onde: 'Propriedades → L e A, e Copiar estilo',
    passos: [
      'Selecione os três cartões (Shift + clique, ou pela lista de camadas).',
      'No painel, escreva a mesma largura e a mesma altura — com os três selecionados, o valor vale para os três.',
      'Escolha uma cor de preenchimento: ela também vale para os três.',
    ],
    feita: c => {
      const p = prancha(c, PROGRAMACAO);
      return !!p && mesmaForma(p, CARTOES) && semEncavalar(p) && textoIntacto(c, PROGRAMACAO, inicio);
    },
  },
  {
    id: 'textos-dos-cartoes-iguais',
    titulo: 'Repetir o estilo dos textos dos cartões',
    detalhe: 'Os três nomes de atividade com o mesmo estilo, e os três horários com outro. É a repetição que diz "isto é a mesma coisa".',
    onde: 'Editar → Copiar estilo e Colar estilo',
    passos: [
      'Selecione o nome de uma atividade e ajuste-o como quer que os três fiquem.',
      'Com ele selecionado, clique em Copiar estilo.',
      'Selecione os outros dois nomes e clique em Colar estilo.',
      'Faça o mesmo com os três horários.',
    ],
    feita: c => {
      const p = prancha(c, PROGRAMACAO);
      return !!p && mesmoEstilo(p, TITULOS_DOS_CARTOES) && mesmoEstilo(p, HORAS_DOS_CARTOES)
        && textoIntacto(c, PROGRAMACAO, inicio);
    },
  },
  {
    id: 'respiro-na-borda',
    titulo: 'Afastar tudo da borda da folha',
    detalhe: `Nada a menos de 24 pixels da borda. Encostado na borda, o título parece cortado — e na impressão, às vezes, é.`,
    onde: 'Propriedades → X e Y',
    passos: [
      'Selecione o título e o rodapé e tire-os da borda pelos campos X e Y.',
      'Os cartões também: o primeiro não pode começar no zero.',
      'Se faltar lugar, estreite os cartões em vez de encostá-los na borda.',
    ],
    feita: c => {
      const p = prancha(c, PROGRAMACAO);
      return !!p && margemMinima(p) >= margemPedida(p) && semEncavalar(p) && textoIntacto(c, PROGRAMACAO, inicio);
    },
  },
  {
    id: 'respiro-entre-cartoes',
    titulo: 'Dar respiro entre os cartões e dentro deles',
    detalhe: `Pelo menos ${VAO_ENTRE_CARTOES} pixels entre um cartão e o vizinho, e ${RESPIRO_DENTRO} entre o texto e a borda do cartão. Espaço vazio é o que separa uma coisa da outra.`,
    onde: 'Propriedades → X, e Distribuir horizontalmente',
    passos: [
      'Selecione os três cartões e clique em Distribuir horizontalmente.',
      'Confira no X de cada um que sobrou um vão entre eles.',
      'Mova cada texto para dentro do cartão dele, longe da borda.',
    ],
    feita: c => {
      const p = prancha(c, PROGRAMACAO);
      if (!p) return false;
      const vaos = vaosEntreCartoes(p);
      return vaos.length === 2 && vaos.every(v => v >= VAO_ENTRE_CARTOES)
        && CARTOES.every(id => respiroDentroDoCartao(p, id) >= RESPIRO_DENTRO)
        && semEncavalar(p) && textoIntacto(c, PROGRAMACAO, inicio);
    },
  },
];

/* Módulo 4 — cor */

export const PALAVRAS_DA_JUSTIFICATIVA = 5;

const cor = (c: ContextoDoDesign, papel: Papel) => c.arte.paleta[papel];

const METAS_DA_COR: MetaDoDesign[] = [
  {
    id: 'texto-sobre-fundo',
    titulo: 'Escolher um texto que se lê sobre o fundo',
    detalhe: 'A cor de texto e a de fundo da paleta precisam medir pelo menos 4,5:1 uma contra a outra.',
    onde: 'Cores do documento → Texto',
    passos: [
      'Abra o painel Cores do documento.',
      'Clique na cor de Texto e escureça-a pela luminosidade (L), até a medida ao lado passar de 4,5:1.',
    ],
    feita: c => {
      const [t, f] = [cor(c, 'texto'), cor(c, 'fundo')];
      return !!t && !!f && contrastRatio(t, f) >= 4.5;
    },
  },
  {
    id: 'apoio-do-destaque',
    titulo: 'Fazer a cor de apoio do mesmo matiz do destaque, mais apagada',
    detalhe: 'Mesmo matiz (até 15° de diferença) e saturação bem menor. É o mesmo vermelho, só que sem gritar.',
    onde: 'Cores do documento → Apoio',
    passos: [
      'Escolha a cor de Destaque — uma cor viva, que a tinta alcance.',
      'Clique na de Apoio e ponha o mesmo número de matiz (H) do destaque.',
      'Baixe a saturação (S) dela em pelo menos 20 pontos.',
    ],
    feita: c => {
      const [d, a] = [cor(c, 'destaque'), cor(c, 'apoio')];
      if (!d || !a) return false;
      const [hd, ha] = [hslDe(d), hslDe(a)];
      return hd.s >= 0.4 && distanciaDeMatiz(hd.h, ha.h) <= 15 && hd.s - ha.s >= 0.2;
    },
  },
  {
    id: 'neutro-neutro',
    titulo: 'Fazer o neutro ser neutro',
    detalhe: 'Saturação perto de zero — um cinza, que pode puxar levemente para um matiz. Ouro não é neutro: ele disputa com o destaque.',
    onde: 'Cores do documento → Neutro',
    passos: [
      'Clique na cor Neutro.',
      'Baixe a saturação (S) para 15 ou menos.',
      'Escolha uma luminosidade que não seja a do fundo nem a do texto.',
    ],
    feita: c => {
      const [n, f, t] = [cor(c, 'neutro'), cor(c, 'fundo'), cor(c, 'texto')];
      return !!n && !!f && !!t && hslDe(n).s <= 0.15 && coresDistintas(n, f) && coresDistintas(n, t);
    },
  },
  {
    id: 'imprime-como-aparece',
    titulo: 'Conferir na prova de impressão, e ficar com cinco cores que a tinta alcança',
    detalhe: 'Cinco cores diferentes entre si, e nenhuma que mude no papel. Ver a prova é parte da tarefa: ninguém descobre isto olhando só a tela.',
    onde: 'Exibir → Prova de impressão (CMYK)',
    passos: [
      'Abra Exibir e ligue Prova de impressão.',
      'Repare qual cor da paleta perde o brilho — o aviso ao lado dela diz que está fora do que a tinta alcança.',
      'Troque essa cor por uma menos saturada, e confira as cinco de novo.',
    ],
    feita: c => {
      const cores = PAPEIS.map(p => cor(c, p));
      if (cores.some(x => !x)) return false;
      const cs = cores as string[];
      const distintas = cs.every((a, i) => cs.every((b, j) => i === j || coresDistintas(a, b)));
      return c.descobertas.includes(CHAVE_DA_PROVA) && distintas && cs.every(x => !foraDaGama(x));
    },
  },
  {
    id: 'cada-cor-justificada',
    titulo: 'Escrever por que cada cor está na paleta',
    detalhe: `Uma frase para cada uma, de pelo menos ${PALAVRAS_DA_JUSTIFICATIVA} palavras, dizendo o papel dela. Cinco frases iguais não justificam nada.`,
    onde: 'Painel de tarefas → Abrir o caderno',
    passos: [
      'Abra o caderno pelo painel de tarefas.',
      'Para cada cor, escreva o que ela faz na peça e por que ela, e não outra.',
    ],
    feita: c => {
      const frases = PAPEIS.map(p => c.caderno.porQueDaCor[p].trim());
      return frases.every(f => palavrasDe(f).length >= PALAVRAS_DA_JUSTIFICATIVA)
        && new Set(frases.map(sem)).size === frases.length;
    },
  },
];

/* Módulo 5 — tipografia */

export const PALAVRAS_DO_PAR = 15;
export const CORPO_MINIMO_DE_LEITURA = 14;

const familiasDa = (p: Prancha) => [...new Set(textos(p).map(t => t.familia))];

const metasDaTipografia = (inicio: Prancha): MetaDoDesign[] => {
  const pronto = (c: ContextoDoDesign) => {
    const p = prancha(c, FOLHETO);
    return p && semEncavalar(p) && textoIntacto(c, FOLHETO, inicio) ? p : null;
  };
  return [
    {
      id: 'duas-familias-que-contrastam',
      titulo: 'Usar duas famílias que contrastam, e não que brigam',
      detalhe: 'Exatamente duas famílias na peça, de classificações diferentes — uma serifada e uma sem serifa, por exemplo. Duas sem serifa parecidas parecem engano.',
      onde: 'Propriedades → Família',
      passos: [
        'Selecione o título e escolha uma família de outra classificação — a lista diz a de cada uma.',
        'Confira que o subtítulo e os parágrafos usam uma só família, a outra.',
      ],
      feita: c => {
        const p = pronto(c);
        if (!p) return false;
        const fs = familiasDa(p);
        return fs.length === 2 && FAMILIAS[fs[0]].classificacao !== FAMILIAS[fs[1]].classificacao;
      },
    },
    {
      id: 'corpo-de-leitura',
      titulo: 'Deixar o texto corrido confortável de ler',
      detalhe: `Os dois parágrafos na mesma família de leitura, com corpo de ${CORPO_MINIMO_DE_LEITURA} ou mais e entrelinha entre 130% e 170%.`,
      onde: 'Propriedades → Corpo e Entrelinha',
      passos: [
        'Selecione os dois parágrafos.',
        `Suba o corpo para ${CORPO_MINIMO_DE_LEITURA} ou 15.`,
        'Suba a entrelinha para 1,4 ou 1,5.',
        'Os parágrafos crescem: desça o segundo para não encavalar.',
      ],
      feita: c => {
        const p = pronto(c);
        if (!p) return false;
        const ps = CORPO_DO_FOLHETO.map(id => texto(p, id));
        if (ps.some(t => !t)) return false;
        const ts = ps as Texto[];
        return new Set(ts.map(t => t.familia)).size === 1 && ehDeLeitura(ts[0].familia)
          && ts.every(t => t.corpo >= CORPO_MINIMO_DE_LEITURA && t.entrelinha >= 1.3 && t.entrelinha <= 1.7);
      },
    },
    {
      id: 'subtitulo-pelo-peso',
      titulo: 'Separar o subtítulo pelo peso, e não por outra família',
      detalhe: 'O subtítulo na mesma família dos parágrafos, em negrito. Família é o desenho; peso é a espessura do mesmo desenho.',
      onde: 'Propriedades → Peso',
      passos: [
        'Selecione o subtítulo.',
        'Ponha nele a família dos parágrafos.',
        'Ligue o negrito.',
      ],
      feita: c => {
        const p = pronto(c);
        const sub = p && texto(p, 'subtitulo');
        const par = p && texto(p, CORPO_DO_FOLHETO[0]);
        return !!sub && !!par && sub.familia === par.familia && sub.peso === 700;
      },
    },
    {
      id: 'par-explicado',
      titulo: 'Explicar por que as duas funcionam juntas',
      detalhe: `Pelo menos ${PALAVRAS_DO_PAR} palavras, citando as duas famílias que ficaram na peça pelo nome.`,
      onde: 'Painel de tarefas → Abrir o caderno',
      passos: [
        'Abra o caderno pelo painel de tarefas.',
        'Escreva o nome das duas famílias e o que cada uma faz na peça.',
        'Diga o que as torna diferentes o bastante para não parecerem engano.',
      ],
      feita: c => {
        const p = prancha(c, FOLHETO);
        if (!p) return false;
        const fs = familiasDa(p);
        const t = sem(c.caderno.parTipografico);
        return fs.length === 2 && palavrasDe(c.caderno.parTipografico).length >= PALAVRAS_DO_PAR
          && fs.every(f => t.includes(sem(f)));
      },
    },
  ];
};

/* Módulo 6 — análise */

export const PALAVRAS_DA_NOTA = 6;

/** O que as medidas dizem de cada princípio numa peça. */
export function vereditoMedido(p: Prancha, principio: Principio): Veredito {
  switch (principio) {
    case 'hierarquia': return hierarquiaFunciona(p, tituloDaPeca(p)) ? 'funciona' : 'falha';
    case 'contraste': return contrasteFunciona(p) ? 'funciona' : 'falha';
    case 'alinhamento': return alinhamentoFunciona(p) ? 'funciona' : 'falha';
  }
}

/**
 * Onde a falha se vê: os elementos que a medida acusa.
 *
 * Apontar o rodapé para dizer que o título não se lê seria acertar o veredito
 * e errar o lugar, e quem analisa uma peça diante do examinador precisa pôr o
 * dedo no que está errado.
 */
export function culpados(p: Prancha, principio: Principio): string[] {
  switch (principio) {
    case 'hierarquia': return quemEstragaAHierarquia(p, tituloDaPeca(p));
    case 'contraste': return textosQueNaoSeLeem(p).map(t => t.id);
    case 'alinhamento': return textosSoltos(p).map(t => t.id);
  }
}

const notaCerta = (p: Prancha, principio: Principio, n: NotaDoPrincipio) => {
  const medido = vereditoMedido(p, principio);
  if (n.veredito !== medido || !n.elemento || !umObjeto(p, n.elemento)) return false;
  if (medido === 'falha' && !culpados(p, principio).includes(n.elemento)) return false;
  return palavrasDe(n.texto).length >= PALAVRAS_DA_NOTA;
};

const metaDoPrincipio = (principio: Principio, onde: string): MetaDoDesign => ({
  id: `analise-de-${principio}`,
  titulo: `Analisar o ${NOME_DO_PRINCIPIO[principio].toLowerCase()} das três peças`,
  detalhe: `Em cada peça: se funciona ou falha, em que elemento isso se vê — clicando nele —, e uma frase de pelo menos ${PALAVRAS_DA_NOTA} palavras. Quando falha, o elemento apontado tem de ser o que falha.`,
  onde,
  passos: [
    'Abra cada peça pela aba dela.',
    `Em ${NOME_DO_PRINCIPIO[principio]}, marque Funciona ou Falha.`,
    'Clique em "Apontar" e depois no elemento da peça em que você vê isso.',
    'Escreva o que você viu, com as suas palavras.',
  ],
  feita: c => PECAS_DA_ANALISE.every(id => {
    const p = prancha(c, id);
    return !!p && notaCerta(p, principio, c.analise[id].notas[principio]);
  }),
});

const METAS_DA_ANALISE: MetaDoDesign[] = [
  {
    id: 'classificou-as-tres',
    titulo: 'Dizer qual peça é bem resolvida, qual é mal resolvida e qual é discutível',
    detalhe: 'Uma de cada. A discutível é a que acerta em quase tudo e erra num lugar só.',
    onde: 'Análise → Classificação',
    passos: [
      'Olhe as três peças pelas abas.',
      'Em cada uma, escolha a classificação.',
      'Se ficar em dúvida entre "bem" e "discutível", procure o único lugar que não se lê.',
    ],
    feita: c => PECAS_DA_ANALISE.every(id => c.analise[id].classe === CLASSE_DA_PECA[id]),
  },
  metaDoPrincipio('hierarquia', 'Análise → Hierarquia'),
  metaDoPrincipio('contraste', 'Análise → Contraste'),
  metaDoPrincipio('alinhamento', 'Análise → Alinhamento'),
];

/* Módulo 7 — refazer */

/**
 * As duas versões: a de antes, guardada intacta, e a nova, com o mesmo texto.
 *
 * Qualquer uma das duas pranchas pode ser a nova. Quem duplicou e mexeu na
 * original fez a mesma coisa que quem mexeu na cópia, e cobrar um lado só
 * reprovaria metade das pessoas por um detalhe que o requisito não pede.
 */
export function versoesDoBatismo(a: Arte): { antes?: Prancha; depois?: Prancha } {
  const antes = a.pranchas.find(p => mesmaPeca(p, BATISMO_PECA));
  const depois = a.pranchas.find(p => p !== antes && mesmoTexto(p, BATISMO_PECA) && !mesmaPeca(p, BATISMO_PECA));
  return { antes, depois };
}

const comDepois = (f: (p: Prancha) => boolean) => (c: ContextoDoDesign) => {
  const { depois } = versoesDoBatismo(c.arte);
  return !!depois && f(depois);
};

const METAS_DO_REFAZER: MetaDoDesign[] = [
  {
    id: 'versao-anterior-guardada',
    titulo: 'Guardar a versão anterior antes de refazer',
    detalhe: 'O requisito pede as duas. Duplique a prancha e refaça uma delas: a outra fica como chegou.',
    onde: 'Pranchas → Duplicar prancha',
    passos: [
      'Na lista de pranchas, à esquerda, escolha o Convite do batismo.',
      'Clique em Duplicar prancha.',
      'Faça as mudanças só na cópia.',
    ],
    feita: c => {
      const { antes, depois } = versoesDoBatismo(c.arte);
      return !!antes && !!depois;
    },
  },
  {
    id: 'hierarquia-refeita',
    titulo: 'Dar ao convite uma hierarquia',
    detalhe: 'O título sozinho no topo da ordem, bem maior que o texto, e no máximo quatro tamanhos.',
    onde: 'Propriedades → Texto',
    passos: [
      'Aumente o título e troque a letra cursiva por uma que se leia de longe.',
      'Escolha um tamanho para o texto comum e use-o nas linhas comuns.',
    ],
    feita: comDepois(p => hierarquiaFunciona(p, tituloDaPeca(p))),
  },
  {
    id: 'contraste-refeito',
    titulo: 'Fazer todo texto do convite se ler',
    detalhe: 'Nenhum texto abaixo do mínimo: 4,5:1 para o comum, 3:1 para o grande.',
    onde: 'Plugins → Medidor de contraste',
    passos: [
      'Abra o Medidor de contraste e clique em cada texto.',
      'O que ficar abaixo do mínimo, escureça pela cor.',
    ],
    feita: comDepois(p => contrasteFunciona(p)),
  },
  {
    id: 'alinhamento-refeito',
    titulo: 'Apoiar cada linha do convite em alguma coisa',
    detalhe: 'Todos na mesma borda, ou todos centrados no centro da folha — mas nenhum num centro só seu.',
    onde: 'Barra de alinhar',
    passos: [
      'Selecione todos os textos.',
      'Escolha Alinhar à esquerda, ou ponha todos centrados e use Centralizar na horizontal.',
    ],
    feita: comDepois(p => alinhamentoFunciona(p)),
  },
  {
    id: 'respiro-refeito',
    titulo: 'Tirar o convite da borda e desencavalar o que encostou',
    detalhe: 'Nada a menos de 24 pixels da borda, e nenhum texto em cima de outro.',
    onde: 'Propriedades → X e Y',
    passos: [
      'Desça o nome do clube, que está colado no topo.',
      'Confira que nenhuma linha passou por cima de outra depois de crescer.',
    ],
    feita: comDepois(p => margemMinima(p) >= margemPedida(p) && semEncavalar(p)),
  },
];

/* Módulo 8 — contraste medido e cor que não carrega sozinha */

export const PALAVRAS_DA_COR_SOZINHA = 15;

/**
 * O que está escrito na linha de uma pessoa da escala.
 *
 * Pela faixa da linha, e não pelo id: a palavra pode estar no nome, num texto
 * novo ao lado, ou num selo que alguém desenhou. O que importa é estar na
 * mesma linha que o ponto colorido.
 */
export function escritoNaLinha(p: Prancha, i: number): string {
  const topo = linhaDaEscala(i) - 6;
  const pe = linhaDaEscala(i) + 30;
  return textos(p)
    .filter(t => {
      const meio = t.y + alturaDe(t) / 2;
      return meio >= topo && meio <= pe;
    })
    .map(t => sem(t.texto))
    .join(' ');
}

const situacaoEscrita = (p: Prancha) => ESCALA_DA_CANTINA.every(({ situacao }, i) => {
  const escrito = escritoNaLinha(p, i);
  return (Object.keys(PALAVRA_DA_SITUACAO) as Situacao[])
    .every(s => escrito.includes(PALAVRA_DA_SITUACAO[s]) === (s === situacao));
});

const METAS_DO_CONTRASTE: MetaDoDesign[] = [
  {
    id: 'mediu-a-sua-peca',
    titulo: 'Medir o contraste de cada texto do seu convite',
    detalhe: 'Com o medidor, um por um — e todos passando do mínimo. Achar que está bom não é medir.',
    onde: 'Plugins → Medidor de contraste',
    passos: [
      'Abra a prancha do convite que você refez.',
      'Abra Plugins → Medidor de contraste.',
      'Clique em cada texto da prancha e leia a medida.',
      'Se algum estiver abaixo do mínimo, corrija a cor e meça de novo.',
    ],
    feita: c => {
      const { depois } = versoesDoBatismo(c.arte);
      if (!depois) return false;
      return textos(depois).every(t => c.descobertas.includes(chaveDaMedida(depois.id, t.id)) && textoSeLe(depois, t));
    },
  },
  {
    id: 'viu-a-escala-sem-cor',
    titulo: 'Ver a escala da cantina como quem não distingue vermelho de verde',
    detalhe: 'Pela simulação do próprio editor. Uma em cada doze pessoas com cromossomo XY enxerga assim.',
    onde: 'Exibir → Simular visão',
    passos: [
      'Abra a prancha Escala da cantina.',
      'Em Exibir, escolha Simular visão → Deuteranopia.',
      'Tente dizer quem confirmou e quem cancelou.',
    ],
    feita: c => c.descobertas.includes(CHAVE_SEM_COR),
  },
  {
    id: 'situacao-tambem-por-palavra',
    titulo: 'Escrever a situação de cada pessoa ao lado do ponto',
    detalhe: 'A cor pode continuar, mas a informação não pode depender só dela: a palavra certa na linha de cada um, e nenhuma errada.',
    onde: 'Ferramenta Texto, ou Propriedades → Texto',
    passos: [
      'Para cada pessoa, acrescente na mesma linha a palavra da situação dela — confirmado, pendente ou cancelado.',
      'Dá para escrever no próprio nome ("Davi Moreira — cancelado") ou criar um texto novo ao lado.',
    ],
    feita: c => {
      const p = prancha(c, ESCALA);
      return !!p && situacaoEscrita(p);
    },
  },
  {
    id: 'cor-sozinha-explicada',
    titulo: 'Explicar por que a cor sozinha não pode carregar informação',
    detalhe: `Pelo menos ${PALAVRAS_DA_COR_SOZINHA} palavras, com as suas palavras.`,
    onde: 'Painel de tarefas → Abrir o caderno',
    passos: [
      'Abra o caderno pelo painel de tarefas.',
      'Escreva o que você viu na simulação, e quem fica sem a informação quando só a cor a carrega.',
    ],
    feita: c => palavrasDe(c.caderno.corSozinha).length >= PALAVRAS_DA_COR_SOZINHA,
  },
];

/* ── As soluções de referência, que são a partida da lição seguinte ────────── */

const reposicionar = (p: Prancha, mudancas: Record<string, object>): Prancha =>
  mudarObjetos(p, Object.keys(mudancas), o => ({ ...o, ...mudancas[o.id] }) as Objeto);

export const comCartazHierarquizado = (a: Arte): Arte => mudarPrancha(a, CARTAZ, p => reposicionar(p, {
  titulo: { corpo: 40, peso: 700, entrelinha: 1.15, y: 40 },
  data: { corpo: 24, peso: 700, y: 150 },
  local: { y: 190 },
  descricao: { y: 236 },
  inscricao: { y: 326 },
  clube: { corpo: 14, y: 390 },
  foto: { y: 430, altura: 200 },
}));

export const comAvisoAlinhado = (a: Arte): Arte => mudarPrancha(a, AVISO, p => reposicionar(p, {
  'titulo': { x: 40, y: 48 },
  'quando-dia': { x: 40, y: 126 },
  'quando-hora': { x: 40, y: 154 },
  'quando-local': { x: 40, y: 182 },
  'levar-titulo': { x: 40, y: 240 },
  'levar-1': { x: 40, y: 268 },
  'levar-2': { x: 40, y: 296 },
  'assinatura': { x: 40, y: 354 },
}));

const CARTAO = { largura: 128, altura: 150, preenchimento: '#E8F0E8' };
const ESTILO_DO_NOME: Partial<Texto> = { familia: 'Arial', peso: 700, corpo: 16, entrelinha: 1.4, cor: TINTA, largura: 108 };
const ESTILO_DA_HORA: Partial<Texto> = { familia: 'Arial', peso: 400, corpo: 14, entrelinha: 1.4, cor: TINTA, largura: 108 };

export const comProgramacaoArrumada = (a: Arte): Arte => mudarPrancha(a, PROGRAMACAO, p => reposicionar(p, {
  'titulo': { x: 32, y: 40, largura: 416 },
  ...Object.fromEntries([32, 176, 320].flatMap((x, i) => [
    [`cartao-${i + 1}`, { ...CARTAO, x, y: 100 }],
    [`cartao-${i + 1}-titulo`, { ...ESTILO_DO_NOME, x: x + 10, y: 112 }],
    [`cartao-${i + 1}-hora`, { ...ESTILO_DA_HORA, x: x + 10, y: 200 }],
  ])),
  'rodape': { x: 32, y: 630, largura: 416 },
}));

/** O vermelho do clube no destaque, e o apoio do mesmo matiz, apagado. */
const DESTAQUE = '#C13516';
const APOIO = hexDeHsl({ h: hslDe(DESTAQUE).h, s: hslDe(DESTAQUE).s - 0.3, l: 0.62 });

export const PALETA_COMPOSTA: Arte['paleta'] = {
  fundo: '#FFFFFF', texto: TINTA, destaque: DESTAQUE, apoio: APOIO, neutro: '#8C918E',
};

export const JUSTIFICATIVAS: Record<Papel, string> = {
  fundo: 'Branco, porque o cartaz vai para o mural e o papel já é branco.',
  texto: 'Verde quase preto, que mede mais de doze para um sobre o branco e lembra a camisa do clube.',
  destaque: 'O vermelho do clube, para a data e o que precisa ser visto primeiro.',
  apoio: 'O mesmo vermelho apagado, para faixas e fundos que não podem disputar com o destaque.',
  neutro: 'Um cinza quase sem cor para linhas, rodapé e tudo o que é secundário.',
};

export const comFolhetoTipografado = (a: Arte): Arte => mudarPrancha(a, FOLHETO, p => reposicionar(p, {
  'titulo': { familia: 'Georgia', y: 48 },
  'subtitulo': { familia: 'Arial', peso: 700, y: 104 },
  'paragrafo-1': { familia: 'Arial', corpo: 15, entrelinha: 1.5, y: 150 },
  'paragrafo-2': { familia: 'Arial', corpo: 15, entrelinha: 1.5, y: 256 },
}));

export const PAR_EXPLICADO =
  'A Georgia é serifada e vai no título, onde o desenho dela aparece; a Arial é sem serifa e fica no texto, simples e limpa no tamanho pequeno. São diferentes o bastante para não parecer engano.';

const FRASES_DA_ANALISE: Record<Principio, Record<Veredito, string>> = {
  hierarquia: {
    funciona: 'O título é o maior de longe, e o olho começa por ele.',
    falha: 'O título tem o mesmo tamanho da data, e nada diz por onde começar.',
  },
  contraste: {
    funciona: 'Todos os textos se leem bem sobre o fundo que têm atrás.',
    falha: 'Este texto quase some no fundo, e de longe ninguém o lê.',
  },
  alinhamento: {
    funciona: 'Todas as linhas começam na mesma borda, formando uma coluna só.',
    falha: 'Cada linha está centrada num ponto diferente, e a coluna fica torta.',
  },
};

export function analiseDeReferencia(a: Arte): Record<PecaDaAnalise, AnaliseDaPeca> {
  return Object.fromEntries(PECAS_DA_ANALISE.map(id => {
    const p = umaPrancha(a, id)!;
    const notas = Object.fromEntries(PRINCIPIOS.map(pr => {
      const v = vereditoMedido(p, pr);
      const elemento = v === 'falha' ? culpados(p, pr)[0] : tituloDaPeca(p);
      return [pr, { veredito: v, elemento, texto: FRASES_DA_ANALISE[pr][v] }];
    })) as Record<Principio, NotaDoPrincipio>;
    return [id, { classe: CLASSE_DA_PECA[id], notas }];
  })) as Record<PecaDaAnalise, AnaliseDaPeca>;
}

export const comBatismoRefeito = (a: Arte): Arte => {
  const comCopia = duplicarPrancha(a, BATISMO);
  const copia = comCopia.pranchas[comCopia.pranchas.findIndex(p => p.id === BATISMO) + 1];
  const k = (id: string) => `${copia.id}-${id}`;
  const comum: Partial<Texto> = { x: 40, largura: 400, alinhamento: 'esquerda', familia: 'Arial', cor: '#333333' };
  return mudarPrancha(comCopia, copia.id, p => reposicionar(p, {
    [k('titulo')]: { ...comum, familia: 'Georgia', corpo: 40, peso: 700, entrelinha: 1.15, cor: TINTA, y: 48 },
    [k('data')]: { ...comum, corpo: 22, peso: 700, cor: TINTA, y: 160 },
    [k('hora')]: { ...comum, corpo: 18, y: 198 },
    [k('local')]: { ...comum, corpo: 18, y: 226 },
    [k('convite')]: { ...comum, corpo: 18, y: 276 },
    [k('foto')]: { x: 40, y: 350, largura: 400, altura: 230 },
    [k('rodape')]: { ...comum, corpo: 14, cor: '#555555', y: 616 },
  }));
};

export const comEscalaEscrita = (a: Arte): Arte => mudarPrancha(a, ESCALA, p => reposicionar(p,
  Object.fromEntries(ESCALA_DA_CANTINA.map(({ nome, situacao }, i) =>
    [`nome-${i + 1}`, { texto: `${nome} — ${PALAVRA_DA_SITUACAO[situacao]}` }])),
));

export const COR_SOZINHA_EXPLICADA =
  'Na simulação o verde e o vermelho viraram o mesmo marrom, e quem tem daltonismo não saberia quem cancelou. Escrita, a palavra chega a todo mundo, inclusive na cópia em preto e branco.';

/* ── O registro ──────────────────────────────────────────────────────────── */

export interface LicaoDoDesign {
  contexto: ContextoDoDesign;
  programa: ProgramaDaLicao;
  /** A prancha em que a lição abre. */
  prancha: string;
  /** Se a lição tem caderno ao lado do editor. */
  caderno: boolean;
  metas: MetaDoDesign[];
}

const analiseVazia = (): Record<PecaDaAnalise, AnaliseDaPeca> =>
  Object.fromEntries(PECAS_DA_ANALISE.map(id => [id, ANALISE_VAZIA])) as Record<PecaDaAnalise, AnaliseDaPeca>;

const PARTIDA: ContextoDoDesign = {
  arte: ARTE_INICIAL, descobertas: [], caderno: CADERNO_VAZIO, analise: analiseVazia(),
};

/** O contexto da lição seguinte: o arquivo e o caderno seguem, as descobertas não. */
const seguinte = (c: ContextoDoDesign, mudar: Partial<ContextoDoDesign>): ContextoDoDesign =>
  ({ ...c, ...mudar, descobertas: [] });

const pr = (a: Arte, id: string) => umaPrancha(a, id)!;

const DEPOIS_DA_HIERARQUIA = seguinte(PARTIDA, { arte: comCartazHierarquizado(PARTIDA.arte) });
const DEPOIS_DO_ALINHAMENTO = seguinte(DEPOIS_DA_HIERARQUIA, { arte: comAvisoAlinhado(DEPOIS_DA_HIERARQUIA.arte) });
const DEPOIS_DA_REPETICAO = seguinte(DEPOIS_DO_ALINHAMENTO, {
  arte: comProgramacaoArrumada(DEPOIS_DO_ALINHAMENTO.arte),
});
const DEPOIS_DA_COR = seguinte(DEPOIS_DA_REPETICAO, {
  arte: { ...DEPOIS_DA_REPETICAO.arte, paleta: PALETA_COMPOSTA },
  caderno: { ...DEPOIS_DA_REPETICAO.caderno, porQueDaCor: JUSTIFICATIVAS },
});
const DEPOIS_DA_TIPOGRAFIA = seguinte(DEPOIS_DA_COR, {
  arte: comFolhetoTipografado(DEPOIS_DA_COR.arte),
  caderno: { ...DEPOIS_DA_COR.caderno, parTipografico: PAR_EXPLICADO },
});
const DEPOIS_DA_ANALISE = seguinte(DEPOIS_DA_TIPOGRAFIA, { analise: analiseDeReferencia(DEPOIS_DA_TIPOGRAFIA.arte) });
const DEPOIS_DO_REFAZER = seguinte(DEPOIS_DA_ANALISE, { arte: comBatismoRefeito(DEPOIS_DA_ANALISE.arte) });

const depoisDoContraste = (): ContextoDoDesign => {
  const arte = comEscalaEscrita(DEPOIS_DO_REFAZER.arte);
  const { depois } = versoesDoBatismo(arte);
  return {
    ...DEPOIS_DO_REFAZER,
    arte,
    caderno: { ...DEPOIS_DO_REFAZER.caderno, corSozinha: COR_SOZINHA_EXPLICADA },
    descobertas: [CHAVE_SEM_COR, ...textos(depois!).map(t => chaveDaMedida(depois!.id, t.id))],
  };
};

export const LICOES_DA_CC_DG001: Record<LicaoDaCcDg001, LicaoDoDesign> = {
  hierarquia: {
    contexto: PARTIDA, programa: 'design', prancha: CARTAZ, caderno: false,
    metas: metasDaHierarquia(pr(PARTIDA.arte, CARTAZ)),
  },
  alinhamento: {
    contexto: DEPOIS_DA_HIERARQUIA, programa: 'design', prancha: AVISO, caderno: false,
    metas: metasDoAlinhamento(pr(DEPOIS_DA_HIERARQUIA.arte, AVISO)),
  },
  repeticao: {
    contexto: DEPOIS_DO_ALINHAMENTO, programa: 'design', prancha: PROGRAMACAO, caderno: false,
    metas: metasDaRepeticao(pr(DEPOIS_DO_ALINHAMENTO.arte, PROGRAMACAO)),
  },
  cor: { contexto: DEPOIS_DA_REPETICAO, programa: 'design', prancha: CARTAZ, caderno: true, metas: METAS_DA_COR },
  tipografia: {
    contexto: DEPOIS_DA_COR, programa: 'design', prancha: FOLHETO, caderno: true,
    metas: metasDaTipografia(pr(DEPOIS_DA_COR.arte, FOLHETO)),
  },
  analise: { contexto: DEPOIS_DA_TIPOGRAFIA, programa: 'plataforma', prancha: PECAS_DA_ANALISE[0], caderno: false, metas: METAS_DA_ANALISE },
  refazer: { contexto: DEPOIS_DA_ANALISE, programa: 'design', prancha: BATISMO, caderno: false, metas: METAS_DO_REFAZER },
  contraste: { contexto: DEPOIS_DO_REFAZER, programa: 'design', prancha: ESCALA, caderno: true, metas: METAS_DO_CONTRASTE },
};

export const metasDa = (licao: LicaoDaCcDg001) => LICOES_DA_CC_DG001[licao].metas;

/** O estado depois de cada lição — a solução de referência que a trava usa. */
export const ESTADO_DEPOIS: Record<LicaoDaCcDg001, ContextoDoDesign> = {
  hierarquia: DEPOIS_DA_HIERARQUIA,
  alinhamento: DEPOIS_DO_ALINHAMENTO,
  repeticao: DEPOIS_DA_REPETICAO,
  cor: { ...DEPOIS_DA_COR, descobertas: [CHAVE_DA_PROVA] },
  tipografia: DEPOIS_DA_TIPOGRAFIA,
  analise: DEPOIS_DA_ANALISE,
  refazer: DEPOIS_DO_REFAZER,
  contraste: depoisDoContraste(),
};
