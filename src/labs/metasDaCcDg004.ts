/**
 * O que cada lição da CC-DG004 cobra, e de que estado da marca ela parte.
 *
 * Mora fora do componente e fora da trava, pelo motivo escrito em
 * `metasDaCcDg001.ts`: quem lê é a tela **e** a trava.
 *
 * ── A marca é a da unidade Ipê, do começo ao fim ─────────────────────────
 * Cada lição parte de onde a anterior chegou — o conceito escrito, os
 * rascunhos, o símbolo, as versões, a paleta —, e é o arranjo de
 * `identidadeDoClube.ts`, escrito lá.
 *
 * ── Conferir o que a marca faz, e não o gesto ────────────────────────────
 * A versão negativa não é "a marca pintada de branco": é uma tinta só, mais
 * clara que o fundo, lida contra ele. O uso incorreto não é "um rótulo
 * dizendo que está errado": é a marca esticada, de outra cor, sem contraste,
 * em outra letra ou com um vizinho encostado — e cada um se mede. As contas
 * moram em `identidade.ts`.
 *
 * ── O que fica fora do aplicativo ────────────────────────────────────────
 * Os dez rascunhos do requisito 4.2 são **à mão**, e a plataforma não tem
 * como ver papel. O que ela faz é o que um caderno de projeto faz: registra
 * cada um, qual seguiu e por que os outros não — que é exatamente o que o
 * requisito 7 manda defender diante do examinador.
 */

import {
  achatarObjetos, duplicarPrancha, ehDeLeitura, escalarPorIgual, moverObjeto, mudarPrancha, recolorir, umaPrancha,
  type Arte, type Caminho, type Forma, type Grupo, type Objeto, type Prancha, type Texto,
} from './design';
import { contrastRatio } from '../lib/imageTools';
import {
  defeitosDe, distorcida, ehColorida, ehMonocromatica, ehNegativa, familiasDa, invasoes, larguraMinimaMedida,
  logotipoDe, marcasNa, minimoHonesto, tintasForaDaPaleta,
  type Defeito, type Regras,
} from './identidade';
import {
  ASSINATURA, CAMISETA, CRACHA, MANUAL, NOME_DA_MARCA, PALETA_DA_IPE, POST, SIMBOLO, TAMANHO_MINIMO,
  TIPOGRAFIA, VERDE, arteDaPaleta, arteDasAplicacoes, arteDasVersoes, arteDoManual, arteDoMinimo, arteDoSimbolo,
  assinaturaDaIpe,
} from './identidadeDoClube';

/* ── A lição, e o que viaja com ela ───────────────────────────────────────── */

export type LicaoDaCcDg004 =
  | 'conceito' | 'rascunhos' | 'simbolo' | 'versoes' | 'paleta'
  | 'protecao' | 'aplicacoes' | 'manual' | 'defesa';

/** O editor de design, ou só o caderno — que é tela da plataforma. */
export type ProgramaDaLicao = 'design' | 'plataforma';

export interface Rascunho {
  ideia: string;
  /** Por que não seguiu. Vazio no que seguiu. */
  porQueNao: string;
}

export interface CadernoDaIdentidade {
  oQueComunica: string;
  aQuem: string;
  palavras: [string, string, string];
  rascunhos: Rascunho[];
  /** O índice do rascunho que virou o símbolo. */
  escolhido: number | null;
  porQueUmaCor: string;
  /** A área de proteção, em fração da altura do símbolo. */
  protecao: number | null;
  /** A largura mínima da assinatura, em pixels. */
  minimo: number | null;
  defesa: string;
  /** O descarte que a pessoa escolheu contar ao examinador, e o que ele ensinou. */
  descarteContado: number | null;
  oQueODescarteEnsinou: string;
}

export interface ContextoDaIdentidade {
  arte: Arte;
  descobertas: string[];
  caderno: CadernoDaIdentidade;
}

export const RASCUNHOS = 10;

export const CADERNO_VAZIO: CadernoDaIdentidade = {
  oQueComunica: '', aQuem: '', palavras: ['', '', ''],
  rascunhos: Array.from({ length: RASCUNHOS }, () => ({ ideia: '', porQueNao: '' })),
  escolhido: null, porQueUmaCor: '', protecao: null, minimo: null, defesa: '', descarteContado: null, oQueODescarteEnsinou: '',
};

export const chaveDosTamanhos = (prancha: string) => `tamanhos:${prancha}`;

/* ── Contas de apoio ─────────────────────────────────────────────────────── */

const palavrasDe = (s: string) => s.trim().split(/\s+/).filter(Boolean);
const sem = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const prancha = (c: ContextoDaIdentidade, id: string) => umaPrancha(c.arte, id);

/** A assinatura mestra: a da prancha de referência, que nenhuma lição manda mexer. */
export const mestreDe = (c: ContextoDaIdentidade): Grupo | null => {
  const p = prancha(c, ASSINATURA);
  return p ? marcasNa(p, NOME_DA_MARCA)[0] ?? null : null;
};

/** A assinatura de referência, para as lições que perdessem a delas. */
const MESTRE = assinaturaDaIpe();

const regrasDe = (c: ContextoDaIdentidade): Regras => ({
  nome: NOME_DA_MARCA, mestre: mestreDe(c) ?? MESTRE, protecao: c.caderno.protecao ?? 0.5,
});

/** A marca não mudou de forma nem de letra — o que separa versão de outra marca. */
const mesmaMarca = (c: ContextoDaIdentidade, g: Grupo) => {
  const r = regrasDe(c);
  const logo = logotipoDe(g, NOME_DA_MARCA);
  const doMestre = logotipoDe(r.mestre, NOME_DA_MARCA);
  return !distorcida(g, r.mestre) && !!logo && !!doMestre && logo.familia === doMestre.familia;
};

/**
 * A colorida continua de pé na prancha de referência. Mexer nela para fazer a
 * monocromática é o atalho que apaga a versão principal da marca, e é
 * condição, e não tarefa: como item da lista ela abriria verde.
 */
const coloridaIntacta = (c: ContextoDaIdentidade) => {
  const p = prancha(c, ASSINATURA);
  const m = mestreDe(c);
  return !!p && !!m && ehColorida(p, m);
};

const marcasDoArquivo = (c: ContextoDaIdentidade) =>
  c.arte.pranchas.flatMap(p => marcasNa(p, NOME_DA_MARCA).map(g => ({ p, g })));

/** Uma página do manual é uma prancha cujo nome começa por "Manual". */
export const paginasDoManual = (c: ContextoDaIdentidade) =>
  c.arte.pranchas.filter(p => sem(p.nome).startsWith('manual'));

/* ── As metas ────────────────────────────────────────────────────────────── */

export interface MetaDaIdentidade {
  id: string;
  titulo: string;
  detalhe: string;
  onde: string;
  passos: string[];
  feita: (c: ContextoDaIdentidade) => boolean;
}

/* Módulo 1 — o conceito */

export const PALAVRAS_DO_CONCEITO = 12;
export const PALAVRAS_DO_PUBLICO = 4;

/**
 * "Todo mundo" não é público. Marca feita para todos é feita para ninguém, e o
 * requisito 4.1 pede "a quem" justamente para obrigar a escolher.
 */
const PUBLICO_VAGO = ['todo mundo', 'todos', 'qualquer pessoa', 'qualquer um', 'as pessoas', 'geral'];

const METAS_DO_CONCEITO: MetaDaIdentidade[] = [
  {
    id: 'disse-o-que-comunica', titulo: 'Escrever o que a marca deve comunicar',
    detalhe: `Pelo menos ${PALAVRAS_DO_CONCEITO} palavras sobre a unidade Ipê: o que ela é, e o que quem vê a marca deve sentir.`,
    onde: 'Caderno → Conceito',
    passos: ['Pense no que a unidade tem de diferente das outras.', 'Escreva o que a marca precisa dizer sem palavra nenhuma.'],
    feita: c => palavrasDe(c.caderno.oQueComunica).length >= PALAVRAS_DO_CONCEITO,
  },
  {
    id: 'disse-a-quem', titulo: 'Dizer a quem a marca fala',
    detalhe: 'Um público de verdade, e não "todo mundo".',
    onde: 'Caderno → Público',
    passos: ['Quem vai ver a marca primeiro? Os desbravadores da unidade, os pais, o distrito?', 'Escreva quem, e com que idade.'],
    feita: c => {
      const t = sem(c.caderno.aQuem);
      return palavrasDe(t).length >= PALAVRAS_DO_PUBLICO && !PUBLICO_VAGO.some(v => t === v || t.startsWith(`${v} `) || t.endsWith(` ${v}`));
    },
  },
  {
    id: 'tres-palavras', titulo: 'Escolher três palavras para a marca',
    detalhe: 'Três palavras diferentes, que vão decidir cada escolha daqui para a frente.',
    onde: 'Caderno → Três palavras',
    passos: ['Escreva três palavras que a marca precisa transmitir.', 'Prefira palavras que se desenham: "firme" ajuda mais que "legal".'],
    feita: c => {
      const ps = c.caderno.palavras.map(sem).filter(Boolean);
      return ps.length === 3 && new Set(ps).size === 3 && ps.every(p => palavrasDe(p).length <= 2);
    },
  },
];

/* Módulo 2 — os rascunhos */

export const PALAVRAS_DA_IDEIA = 3;
export const PALAVRAS_DO_DESCARTE = 6;

const descartados = (c: ContextoDaIdentidade) =>
  c.caderno.rascunhos.map((r, i) => ({ r, i })).filter(({ i }) => i !== c.caderno.escolhido);

const METAS_DOS_RASCUNHOS: MetaDaIdentidade[] = [
  {
    id: 'dez-rascunhos', titulo: 'Registrar os dez rascunhos feitos à mão',
    detalhe: `Cada um com a ideia em pelo menos ${PALAVRAS_DA_IDEIA} palavras, e nenhum repetido.`,
    onde: 'Caderno → Rascunhos',
    passos: ['Desenhe no papel, rápido: dez ideias, sem apagar nenhuma.', 'Anote aqui a ideia de cada uma, na ordem em que saíram.'],
    feita: c => {
      const ideias = c.caderno.rascunhos.map(r => sem(r.ideia));
      return ideias.length >= RASCUNHOS && ideias.every(i => palavrasDe(i).length >= PALAVRAS_DA_IDEIA) && new Set(ideias).size === ideias.length;
    },
  },
  {
    id: 'escolheu-um', titulo: 'Escolher o rascunho que vai virar símbolo',
    detalhe: 'Um só segue para o computador.',
    onde: 'Caderno → Rascunhos → Seguir com este',
    passos: ['Releia as três palavras do conceito.', 'Marque o rascunho que diz as três com menos traços.'],
    feita: c => c.caderno.escolhido !== null && c.caderno.escolhido < c.caderno.rascunhos.length
      && palavrasDe(c.caderno.rascunhos[c.caderno.escolhido].ideia).length >= PALAVRAS_DA_IDEIA,
  },
  {
    id: 'justificou-os-descartes', titulo: 'Dizer por que cada um dos outros ficou para trás',
    detalhe: `Pelo menos ${PALAVRAS_DO_DESCARTE} palavras em cada, e um motivo para cada — copiar a mesma frase nove vezes não justifica nada.`,
    onde: 'Caderno → Rascunhos → Por que não',
    passos: ['Para cada rascunho descartado, diga o que faltou ou o que sobrou.', 'Use o conceito: qual das três palavras ele não dizia?'],
    feita: c => {
      if (c.caderno.escolhido === null) return false;
      const motivos = descartados(c).map(({ r }) => sem(r.porQueNao));
      return motivos.length >= RASCUNHOS - 1 && motivos.every(m => palavrasDe(m).length >= PALAVRAS_DO_DESCARTE)
        && new Set(motivos).size === motivos.length;
    },
  },
];

/* Módulo 3 — o símbolo */

const COR_DO_EDITOR = '#d9d9d9';

const formasDoSimbolo = (p: Prancha) =>
  achatarObjetos(p.objetos).filter((o): o is Forma | Caminho => o.tipo === 'retangulo' || o.tipo === 'elipse' || o.tipo === 'caminho');

const METAS_DO_SIMBOLO: MetaDaIdentidade[] = [
  {
    id: 'desenhou-o-simbolo', titulo: 'Desenhar o símbolo em vetor',
    detalhe: 'Pelo menos duas formas, pintadas — o cinza que o editor dá a toda forma nova ainda não é escolha de ninguém.',
    onde: 'Ferramentas → Elipse, Retângulo, Caneta',
    passos: ['Redesenhe o rascunho escolhido com formas simples.', 'Pinte cada forma com uma cor da marca.'],
    feita: c => {
      const p = prancha(c, SIMBOLO);
      if (!p) return false;
      const fs = formasDoSimbolo(p);
      return fs.length >= 2 && fs.every(f => {
        const cor = f.tipo === 'caminho' ? f.preenchimento ?? f.traco?.cor : f.preenchimento;
        return !!cor && cor.toLowerCase() !== COR_DO_EDITOR;
      });
    },
  },
  {
    id: 'viu-pequeno', titulo: 'Ver o símbolo em 64, 32 e 16 pixels',
    detalhe: 'O símbolo vai para o ícone do grupo da unidade e para o carimbo. Ele precisa existir pequeno.',
    onde: 'Exibir → Ver em 64, 32 e 16 px',
    passos: ['Abra Exibir.', 'Escolha Ver em 64, 32 e 16 px e olhe o de 16.'],
    feita: c => c.descobertas.includes(chaveDosTamanhos(SIMBOLO)),
  },
  {
    id: 'montou-a-assinatura', titulo: 'Montar a assinatura: símbolo e logotipo juntos',
    detalhe: `O nome "${NOME_DA_MARCA}" escrito ao lado do símbolo, os dois agrupados.`,
    onde: 'Ferramenta Texto, e Objeto → Agrupar',
    passos: [`Escreva "${NOME_DA_MARCA}" com a ferramenta Texto.`, 'Selecione o símbolo e o texto juntos.', 'Agrupe (Ctrl+G).'],
    feita: c => {
      const p = prancha(c, SIMBOLO);
      return !!p && marcasNa(p, NOME_DA_MARCA).length > 0;
    },
  },
];

/* Módulo 4 — as versões */

export const PALAVRAS_DO_PORQUE = 15;

const versao = (c: ContextoDaIdentidade, teste: (p: Prancha, g: Grupo) => boolean) =>
  coloridaIntacta(c) && marcasDoArquivo(c).some(({ p, g }) => p.id !== ASSINATURA && teste(p, g) && mesmaMarca(c, g));

const METAS_DAS_VERSOES: MetaDaIdentidade[] = [
  {
    id: 'versao-monocromatica', titulo: 'Fazer a versão monocromática',
    detalhe: 'A marca inteira numa cor só, numa prancha própria. A colorida continua onde está.',
    onde: 'Prancha → Duplicar prancha; grupo → Recolorir tudo',
    passos: ['Duplique a prancha Assinatura.', 'Na cópia, selecione a assinatura.', 'Em Cores do grupo, pinte tudo de uma cor só.'],
    feita: c => versao(c, ehMonocromatica),
  },
  {
    id: 'versao-negativa', titulo: 'Fazer a versão negativa',
    detalhe: 'Uma cor só, clara, sobre fundo escuro — é a que vai na camiseta verde da unidade.',
    onde: 'Prancha → Fundo da prancha; grupo → Recolorir tudo',
    passos: ['Duplique a prancha Assinatura de novo.', 'Pinte o fundo da prancha de uma cor escura.', 'Recolora a assinatura de uma cor clara.'],
    feita: c => versao(c, ehNegativa),
  },
  {
    id: 'porque-uma-cor', titulo: 'Explicar por que a marca precisa funcionar numa cor só',
    detalhe: `Pelo menos ${PALAVRAS_DO_PORQUE} palavras, falando de cor e de tamanho.`,
    onde: 'Painel de tarefas → Abrir o caderno',
    passos: ['Pense onde a marca vai parar: carimbo, bordado, cópia em preto e branco, ícone pequeno.', 'Escreva o que acontece com uma marca que só funciona colorida e grande.'],
    feita: c => {
      const t = sem(c.caderno.porQueUmaCor);
      return palavrasDe(t).length >= PALAVRAS_DO_PORQUE && /\bcor/.test(t) && /(pequen|tamanho|reduzid|minim)/.test(t);
    },
  },
];

/* Módulo 5 — paleta e tipografia */

const METAS_DA_PALETA: MetaDaIdentidade[] = [
  {
    id: 'definiu-a-paleta', titulo: 'Definir a paleta da identidade',
    detalhe: 'Fundo e texto preenchidos, e toda cor que a assinatura usa dentro da paleta.',
    onde: 'Painel Cores do documento',
    passos: ['Abra a aba Cores.', 'Leia no conta-gotas as cores da assinatura e escreva cada uma num papel.', 'Escolha um fundo claro e uma cor de texto.'],
    feita: c => {
      const m = mestreDe(c);
      return !!m && !!c.arte.paleta.fundo && !!c.arte.paleta.texto && tintasForaDaPaleta(c.arte, m).length === 0;
    },
  },
  {
    id: 'paleta-legivel', titulo: 'Texto da paleta que se lê sobre o fundo dela',
    detalhe: 'A cor de texto sobre a cor de fundo a 4,5:1 ou mais — senão o manual e o site da unidade saem ilegíveis.',
    onde: 'Painel Cores do documento → Texto',
    passos: ['Olhe o contraste que o painel mostra embaixo da cor de texto.', 'Escureça o texto ou clareie o fundo até passar de 4,5:1.'],
    feita: c => {
      const { fundo, texto } = c.arte.paleta;
      return !!fundo && !!texto && contrastRatio(texto, fundo) >= 4.5;
    },
  },
  {
    id: 'definiu-a-tipografia', titulo: 'Definir a tipografia',
    detalhe: 'Na prancha Tipografia: um título na letra do logotipo e um texto corrido, em duas famílias no máximo.',
    onde: 'Prancha Tipografia → ferramenta Texto',
    passos: ['Escreva um título com a família do logotipo.', 'Escreva um parágrafo de corpo pequeno numa família boa de ler.', 'Não use mais que duas famílias.'],
    feita: c => {
      const p = prancha(c, TIPOGRAFIA);
      const m = mestreDe(c);
      const logo = m ? logotipoDe(m, NOME_DA_MARCA) : null;
      if (!p || !logo) return false;
      const ts = achatarObjetos(p.objetos).filter((o): o is Texto => o.tipo === 'texto');
      const familias = familiasDa(p);
      const titulo = ts.some(t => t.familia === logo.familia && t.corpo >= 24);
      const corrido = ts.some(t => t.corpo <= 18 && ehDeLeitura(t.familia) && palavrasDe(t.texto).length >= 8);
      return familias.length <= 2 && titulo && corrido;
    },
  },
];

/* Módulo 6 — área de proteção e tamanho mínimo */

const METAS_DA_PROTECAO: MetaDaIdentidade[] = [
  {
    id: 'declarou-a-protecao', titulo: 'Declarar a área de proteção',
    detalhe: 'Em fração da altura do símbolo, entre um quarto e uma altura inteira.',
    onde: 'Painel de tarefas → Abrir o caderno',
    passos: ['Decida quanto espaço vazio a assinatura precisa em volta.', 'Escreva em fração da altura do símbolo: 0,5 é meia altura.'],
    feita: c => c.caderno.protecao !== null && c.caderno.protecao >= 0.25 && c.caderno.protecao <= 1,
  },
  {
    id: 'declarou-o-minimo', titulo: 'Declarar o tamanho mínimo',
    detalhe: 'A menor largura em que a assinatura ainda se lê, em pixels — nem menor do que se lê, nem tão grande que proíba o crachá.',
    onde: 'Painel de tarefas → Abrir o caderno',
    passos: ['Na prancha Tamanho mínimo, cole a assinatura e diminua a largura até a letra começar a sumir.', 'Escreva no caderno a largura em que ela ainda se lia.'],
    feita: c => {
      const m = mestreDe(c);
      return !!m && c.caderno.minimo !== null && minimoHonesto(c.caderno.minimo, larguraMinimaMedida(m, NOME_DA_MARCA));
    },
  },
  {
    id: 'provou-o-minimo', titulo: 'Mostrar a assinatura no tamanho mínimo, com a área livre',
    detalhe: 'Na prancha Tamanho mínimo, a assinatura na largura declarada, sem esticar, e com a área de proteção vazia.',
    onde: 'Editar → Copiar e Colar; propriedades → L',
    passos: ['Copie a assinatura (Ctrl+C) e cole na prancha Tamanho mínimo (Ctrl+V).', 'Mude a largura do grupo para o mínimo declarado.', 'Deixe espaço em volta.'],
    feita: c => {
      const p = prancha(c, TAMANHO_MINIMO);
      const min = c.caderno.minimo;
      if (!p || min === null || c.caderno.protecao === null) return false;
      return marcasNa(p, NOME_DA_MARCA).some(g =>
        Math.abs(g.largura - min) <= min * 0.03 && mesmaMarca(c, g) && invasoes(p, g, c.caderno.protecao!).length === 0);
    },
  },
];

/* Módulo 7 — as aplicações */

/** A aplicação está certa: nenhum defeito, e no tamanho mínimo ou acima. */
const aplicada = (c: ContextoDaIdentidade, id: string) => {
  const p = prancha(c, id);
  if (!p) return false;
  const r = regrasDe(c);
  return marcasNa(p, NOME_DA_MARCA).some(g =>
    defeitosDe(c.arte, p, g, r).length === 0 && g.largura >= (c.caderno.minimo ?? 0));
};

const METAS_DAS_APLICACOES: MetaDaIdentidade[] = [
  {
    id: 'na-camiseta', titulo: 'Aplicar a marca na camiseta',
    detalhe: 'Tecido verde-escuro: a versão colorida não se lê nele.',
    onde: 'Prancha Camiseta',
    passos: ['Cole a assinatura na camiseta.', 'Use a versão que se lê em fundo escuro.', 'Deixe a área de proteção livre.'],
    feita: c => aplicada(c, CAMISETA),
  },
  {
    id: 'no-cracha', titulo: 'Aplicar a marca no crachá',
    detalhe: 'Pouco espaço, uma foto e um nome: a marca cabe acima da foto, sem encostar em nada e sem ficar abaixo do mínimo.',
    onde: 'Prancha Crachá',
    passos: ['Cole a assinatura no crachá.', 'Diminua pela largura do grupo, sem passar do mínimo.', 'Confira que a área de proteção não encosta na foto nem na borda.'],
    feita: c => aplicada(c, CRACHA),
  },
  {
    id: 'no-post', titulo: 'Aplicar a marca no post',
    detalhe: 'Por cima da foto do acampamento, que é escura — e a chamada também precisa de espaço.',
    onde: 'Prancha Post',
    passos: ['Cole a assinatura no post.', 'Escolha a versão que se lê sobre a foto.', 'Afaste-a da chamada.'],
    feita: c => aplicada(c, POST),
  },
];

/* Módulo 8 — o manual */

export const PAGINAS_DO_MANUAL = 4;
export const USOS_INCORRETOS = 3;

/** Os defeitos de cada marca das páginas do manual, sem contar as vizinhas como invasão. */
export function defeitosNoManual(c: ContextoDaIdentidade): { pagina: string; defeitos: Defeito[] }[] {
  const r = regrasDe(c);
  return paginasDoManual(c).flatMap(p => {
    const ms = marcasNa(p, NOME_DA_MARCA);
    const ids = ms.flatMap(g => achatarObjetos([g]).map(o => o.id));
    return ms.map(g => ({ pagina: p.id, defeitos: defeitosDe(c.arte, p, g, r, ids) }));
  });
}

const METAS_DO_MANUAL: MetaDaIdentidade[] = [
  {
    id: 'quatro-paginas', titulo: 'Montar o manual com quatro páginas',
    detalhe: 'Quatro pranchas com nome começando por "Manual", nenhuma em branco.',
    onde: 'Prancha → Nova prancha; propriedades → Nome da prancha',
    passos: ['Crie mais páginas com Nova prancha.', 'Dê a cada uma um nome começando por Manual.', 'Ponha conteúdo em todas.'],
    feita: c => {
      const ps = paginasDoManual(c);
      return ps.length >= PAGINAS_DO_MANUAL && ps.every(p => p.objetos.length > 0);
    },
  },
  {
    id: 'usos-corretos', titulo: 'Mostrar as três versões, certas',
    detalhe: 'Numa página do manual: a colorida, a monocromática e a negativa, sem defeito nenhum de cor, forma ou letra.',
    onde: 'Página do manual → Colar',
    passos: ['Cole as três versões numa página.', 'A negativa vai sobre um retângulo escuro.', 'Confira que nenhuma foi esticada.'],
    feita: c => paginasDoManual(c).some(p => {
      const ms = marcasNa(p, NOME_DA_MARCA).filter(g => mesmaMarca(c, g) && tintasForaDaPaleta(c.arte, g).length === 0);
      return ms.some(g => ehColorida(p, g)) && ms.some(g => ehMonocromatica(p, g) && !ehNegativa(p, g)) && ms.some(g => ehNegativa(p, g));
    }),
  },
  {
    id: 'paleta-no-manual', titulo: 'Mostrar a paleta no manual',
    detalhe: 'Uma amostra de cada cor da paleta, numa mesma página.',
    onde: 'Página do manual → Retângulo',
    passos: ['Desenhe um retângulo por cor da paleta.', 'Pinte cada um com uma das cores.'],
    feita: c => {
      const cores = Object.values(c.arte.paleta).filter((x): x is string => !!x).map(x => x.toLowerCase());
      return cores.length > 0 && paginasDoManual(c).some(p => {
        const pintadas = new Set(achatarObjetos(p.objetos)
          .filter((o): o is Forma => o.tipo === 'retangulo' || o.tipo === 'elipse').map(f => f.preenchimento.toLowerCase()));
        return cores.every(cor => pintadas.has(cor));
      });
    },
  },
  {
    id: 'tres-incorretos', titulo: 'Ilustrar três usos incorretos',
    detalhe: 'Três marcas estragadas, cada uma de um jeito diferente: esticada, de outra cor, sem contraste, em outra letra ou encostada.',
    onde: 'Página do manual → Colar, e estragar de propósito',
    passos: ['Cole três assinaturas numa página.', 'Estrague cada uma de um jeito: estique só a copa, troque a cor, ponha sobre um fundo que não deixa ler.'],
    feita: c => {
      const ruins = defeitosNoManual(c).filter(d => d.defeitos.length > 0);
      return ruins.length >= USOS_INCORRETOS && new Set(ruins.flatMap(d => d.defeitos)).size >= USOS_INCORRETOS;
    },
  },
];

/* Módulo 9 — a defesa */

export const PALAVRAS_DA_DEFESA = 40;
export const PALAVRAS_DO_ENSINO = 15;

const METAS_DA_DEFESA: MetaDaIdentidade[] = [
  {
    id: 'defendeu-o-conceito', titulo: 'Escrever a defesa do conceito',
    detalhe: `Pelo menos ${PALAVRAS_DA_DEFESA} palavras, usando pelo menos duas das três palavras do conceito.`,
    onde: 'Caderno → Defesa',
    passos: ['Diga o que a marca comunica e a quem.', 'Mostre onde cada palavra do conceito aparece no desenho.'],
    feita: c => {
      const t = sem(c.caderno.defesa);
      const usadas = c.caderno.palavras.map(sem).filter(p => p && t.includes(p));
      return palavrasDe(t).length >= PALAVRAS_DA_DEFESA && usadas.length >= 2;
    },
  },
  {
    id: 'contou-um-descarte', titulo: 'Contar o descarte que mais ensinou',
    detalhe: `Escolha um rascunho descartado e diga, em pelo menos ${PALAVRAS_DO_ENSINO} palavras, o que ele mostrou.`,
    onde: 'Caderno → Defesa → Descarte',
    passos: ['Escolha um rascunho que ficou para trás.', 'Diga o que ele tinha de bom, e por que mesmo assim não seguiu.'],
    feita: c => {
      const i = c.caderno.descarteContado;
      return i !== null && i !== c.caderno.escolhido && i < c.caderno.rascunhos.length
        && palavrasDe(c.caderno.oQueODescarteEnsinou).length >= PALAVRAS_DO_ENSINO
        && sem(c.caderno.oQueODescarteEnsinou) !== sem(c.caderno.rascunhos[i].porQueNao);
    },
  },
];

/* ── As soluções de referência, que são também o ponto de partida ────────── */

export const CONCEITO_ESCRITO = {
  oQueComunica: 'A Ipê é a unidade que floresce no inverno: firme no seco, alegre quando ninguém espera, e unida como a copa de uma árvore.',
  aQuem: 'Os desbravadores de dez a doze anos da unidade e as famílias deles.',
  palavras: ['firme', 'alegre', 'unida'] as [string, string, string],
};

const IDEIAS = [
  'Copa redonda roxa sobre tronco reto',
  'Folha de ipê com nervuras em V',
  'Flor de cinco pétalas vista de cima',
  'Árvore inteira com raízes aparecendo embaixo',
  'Letra I virando tronco de árvore',
  'Três flores caindo em diagonal',
  'Sol nascendo atrás da copa',
  'Escudo com uma árvore dentro',
  'Mão aberta segurando uma flor',
  'Galho torto com quatro flores',
];

const MOTIVOS = [
  '',
  'Folha sozinha parece de qualquer árvore, não do ipê.',
  'Cinco pétalas pequenas somem no tamanho de um carimbo.',
  'As raízes viram rabisco quando a marca fica pequena.',
  'A letra I só funciona para quem já sabe o nome da unidade.',
  'Flores caindo passam tristeza, e o conceito pede alegria.',
  'O sol atrás da copa é a marca de três outros clubes.',
  'Escudo deixa a marca pesada e parecida com a do clube.',
  'A mão fica difícil de desenhar igual em cada aplicação.',
  'O galho torto não passa a ideia de unidade firme.',
];

export const RASCUNHOS_FEITOS: Rascunho[] = IDEIAS.map((ideia, i) => ({ ideia, porQueNao: MOTIVOS[i] }));

export const POR_QUE_UMA_COR =
  'A marca vai parar em carimbo, bordado de uma linha e cópia em preto e branco, e no ícone pequeno do grupo; se ela só funciona com todas as cores e grande, some justamente onde a unidade mais aparece.';

export const DEFESA_ESCRITA =
  'A copa redonda é a unidade junta, e o tronco reto embaixo deixa a marca firme mesmo pequena. O roxo é a cor do ipê que floresce no inverno, e é ela que deixa a marca alegre sem precisar de desenho a mais. Escolhi duas formas porque a marca precisa caber no carimbo e no crachá.';

export const DESCARTE_CONTADO = {
  indice: 2,
  texto: 'A flor de cinco pétalas era a mais bonita no papel, mas no crachá as pétalas viraram uma mancha só e aprendi a desenhar pensando no tamanho menor.',
};

const cadernoDepoisDoConceito: CadernoDaIdentidade = { ...CADERNO_VAZIO, ...CONCEITO_ESCRITO };
const cadernoDepoisDosRascunhos: CadernoDaIdentidade = { ...cadernoDepoisDoConceito, rascunhos: RASCUNHOS_FEITOS, escolhido: 0 };

/** O símbolo da referência, desenhado na prancha vazia do módulo 3. */
function arteComSimbolo(): Arte {
  const a = arteDoSimbolo();
  const g = assinaturaDaIpe('simbolo', 40, 130);
  return mudarPrancha(a, SIMBOLO, p => ({ ...p, objetos: [g] }));
}

/** As três versões, cada uma na sua prancha: duplicar e recolorir. */
function arteComVersoes(): Arte {
  let a = duplicarPrancha(arteDasVersoes(), ASSINATURA);
  a = duplicarPrancha(a, ASSINATURA);
  const [, negativa, mono] = a.pranchas;
  a = mudarPrancha(a, mono.id, p => ({ ...p, nome: 'Monocromática', objetos: p.objetos.map(o => recolorir(o, '#000000')) }));
  a = mudarPrancha(a, negativa.id, p => ({ ...p, nome: 'Negativa', fundo: VERDE, objetos: p.objetos.map(o => recolorir(o, '#FFFFFF')) }));
  return a;
}

const TITULO_DA_TIPOGRAFIA: Texto = {
  id: 'tipo-titulo', nome: 'Título', tipo: 'texto', texto: 'Unidade Ipê', x: 40, y: 40, largura: 320,
  familia: 'Trebuchet MS', peso: 700, corpo: 32, entrelinha: 1.2, cor: '#1F2A24', alinhamento: 'esquerda',
};
const CORPO_DA_TIPOGRAFIA: Texto = {
  id: 'tipo-corpo', nome: 'Texto corrido', tipo: 'texto',
  texto: 'O texto corrido do manual, dos avisos e do site da unidade sai nesta letra, que se lê bem pequena.',
  x: 40, y: 100, largura: 320, familia: 'Georgia', peso: 400, corpo: 14, entrelinha: 1.5, cor: '#1F2A24', alinhamento: 'esquerda',
};

function arteComPaleta(): Arte {
  const a = arteDaPaleta();
  return { ...mudarPrancha(a, TIPOGRAFIA, p => ({ ...p, objetos: [TITULO_DA_TIPOGRAFIA, CORPO_DA_TIPOGRAFIA] })), paleta: PALETA_DA_IPE };
}

export const PROTECAO_DECLARADA = 0.5;
export const MINIMO_DECLARADO = 40;

/** Uma cópia da assinatura, na largura pedida, com o canto em (x, y). */
export function assinaturaEm(prefixo: string, largura: number, x: number, y: number, cor?: string): Grupo {
  const base = assinaturaDaIpe(prefixo);
  const escalada = escalarPorIgual(base, largura / base.largura) as Grupo;
  const posta = moverObjeto(escalada, x - escalada.x, y - escalada.y) as Grupo;
  return cor ? recolorir(posta, cor) as Grupo : posta;
}

function arteComMinimo(): Arte {
  return mudarPrancha(arteDoMinimo(), TAMANHO_MINIMO, p => ({ ...p, objetos: [assinaturaEm('minimo', MINIMO_DECLARADO, 180, 180)] }));
}

function arteComAplicacoes(): Arte {
  let a = arteDasAplicacoes();
  a = mudarPrancha(a, CAMISETA, p => ({ ...p, objetos: [...p.objetos, assinaturaEm('camiseta', 150, 80, 120, '#FFFFFF')] }));
  a = mudarPrancha(a, CRACHA, p => ({ ...p, objetos: [...p.objetos, assinaturaEm('cracha', 105, 67, 26)] }));
  a = mudarPrancha(a, POST, p => ({ ...p, objetos: [...p.objetos, assinaturaEm('post', 180, 60, 60, '#FFFFFF')] }));
  return a;
}

const amostra = (id: string, x: number, cor: string): Forma =>
  ({ id, nome: `Amostra ${cor}`, tipo: 'retangulo', x, y: 420, largura: 64, altura: 64, preenchimento: cor });

function arteComManual(): Arte {
  const base = arteDoManual();
  const pagina = (id: string, nome: string, objetos: Objeto[]): Prancha => ({ id, nome, largura: 420, altura: 594, fundo: '#FFFFFF', objetos });
  const esticada = (() => {
    const g = assinaturaEm('torta', 120, 40, 420);
    return { ...g, filhos: g.filhos.map(f => (f.tipo === 'elipse' ? { ...f, largura: f.largura * 1.6 } : f)) } as Grupo;
  })();
  const paginas: Prancha[] = [
    pagina(MANUAL, 'Manual — Versões', [
      assinaturaEm('m-colorida', 150, 40, 60),
      assinaturaEm('m-mono', 150, 230, 60, '#000000'),
      { id: 'm-faixa', nome: 'Faixa escura', tipo: 'retangulo', x: 0, y: 240, largura: 420, altura: 160, preenchimento: VERDE },
      assinaturaEm('m-negativa', 150, 135, 280, '#FFFFFF'),
    ]),
    pagina('manual-paleta', 'Manual — Cores e letras', [
      { ...TITULO_DA_TIPOGRAFIA, id: 'mp-titulo' }, { ...CORPO_DA_TIPOGRAFIA, id: 'mp-corpo' },
      ...Object.values(PALETA_DA_IPE).filter((x): x is string => !!x).map((cor, i) => amostra(`mp-amostra-${i}`, 20 + i * 78, cor)),
    ]),
    pagina('manual-protecao', 'Manual — Área de proteção', [assinaturaEm('m-protecao', 200, 110, 200)]),
    pagina('manual-incorretos', 'Manual — Usos incorretos', [
      assinaturaEm('m-vermelha', 120, 40, 60, '#B03A2E'),
      { id: 'm-escuro', nome: 'Fundo escuro', tipo: 'retangulo', x: 0, y: 200, largura: 420, altura: 160, preenchimento: '#2B2B2B' },
      assinaturaEm('m-sem-contraste', 120, 150, 250),
      esticada,
    ]),
  ];
  return { ...base, pranchas: [base.pranchas[0], ...paginas] };
}

/* ── O registro das lições ───────────────────────────────────────────────── */

export interface LicaoDaIdentidade {
  contexto: () => ContextoDaIdentidade;
  programa: ProgramaDaLicao;
  prancha: string;
  caderno: boolean;
  metas: MetaDaIdentidade[];
}

const ctx = (arte: Arte, caderno: CadernoDaIdentidade, descobertas: string[] = []): ContextoDaIdentidade =>
  ({ arte, caderno, descobertas });

const cadernoDasVersoes = (): CadernoDaIdentidade => cadernoDepoisDosRascunhos;
const cadernoDaProtecao = (): CadernoDaIdentidade => ({ ...cadernoDepoisDosRascunhos, porQueUmaCor: POR_QUE_UMA_COR });
const cadernoDasAplicacoes = (): CadernoDaIdentidade =>
  ({ ...cadernoDaProtecao(), protecao: PROTECAO_DECLARADA, minimo: MINIMO_DECLARADO });

export const LICOES_DA_CC_DG004: Record<LicaoDaCcDg004, LicaoDaIdentidade> = {
  'conceito': { contexto: () => ctx(arteDoSimbolo(), CADERNO_VAZIO), programa: 'plataforma', prancha: SIMBOLO, caderno: true, metas: METAS_DO_CONCEITO },
  'rascunhos': { contexto: () => ctx(arteDoSimbolo(), cadernoDepoisDoConceito), programa: 'plataforma', prancha: SIMBOLO, caderno: true, metas: METAS_DOS_RASCUNHOS },
  'simbolo': { contexto: () => ctx(arteDoSimbolo(), cadernoDepoisDosRascunhos), programa: 'design', prancha: SIMBOLO, caderno: false, metas: METAS_DO_SIMBOLO },
  'versoes': { contexto: () => ctx(arteDasVersoes(), cadernoDasVersoes()), programa: 'design', prancha: ASSINATURA, caderno: true, metas: METAS_DAS_VERSOES },
  'paleta': { contexto: () => ctx(arteDaPaleta(), cadernoDaProtecao()), programa: 'design', prancha: ASSINATURA, caderno: false, metas: METAS_DA_PALETA },
  'protecao': { contexto: () => ctx(arteDoMinimo(), cadernoDaProtecao()), programa: 'design', prancha: TAMANHO_MINIMO, caderno: true, metas: METAS_DA_PROTECAO },
  'aplicacoes': { contexto: () => ctx(arteDasAplicacoes(), cadernoDasAplicacoes()), programa: 'design', prancha: CAMISETA, caderno: false, metas: METAS_DAS_APLICACOES },
  'manual': { contexto: () => ctx(arteDoManual(), cadernoDasAplicacoes()), programa: 'design', prancha: MANUAL, caderno: false, metas: METAS_DO_MANUAL },
  'defesa': { contexto: () => ctx(arteDoManual(), cadernoDasAplicacoes()), programa: 'plataforma', prancha: MANUAL, caderno: true, metas: METAS_DA_DEFESA },
};

export const metasDa = (licao: LicaoDaCcDg004) => LICOES_DA_CC_DG004[licao].metas;

/** O estado depois de cada lição — a solução de referência que a trava usa. */
export function estadoDepois(licao: LicaoDaCcDg004): ContextoDaIdentidade {
  switch (licao) {
    case 'conceito': return ctx(arteDoSimbolo(), cadernoDepoisDoConceito);
    case 'rascunhos': return ctx(arteDoSimbolo(), cadernoDepoisDosRascunhos);
    case 'simbolo': return ctx(arteComSimbolo(), cadernoDepoisDosRascunhos, [chaveDosTamanhos(SIMBOLO)]);
    case 'versoes': return ctx(arteComVersoes(), cadernoDaProtecao());
    case 'paleta': return ctx(arteComPaleta(), cadernoDaProtecao());
    case 'protecao': return ctx(arteComMinimo(), cadernoDasAplicacoes());
    case 'aplicacoes': return ctx(arteComAplicacoes(), cadernoDasAplicacoes());
    case 'manual': return ctx(arteComManual(), cadernoDasAplicacoes());
    case 'defesa': return ctx(arteDoManual(), {
      ...cadernoDasAplicacoes(), defesa: DEFESA_ESCRITA,
      descarteContado: DESCARTE_CONTADO.indice, oQueODescarteEnsinou: DESCARTE_CONTADO.texto,
    });
    default: {
      const nunca: never = licao;
      return nunca;
    }
  }
}

