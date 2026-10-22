/**
 * O modelo do editor de design: a prancha, o que mora nela, e as medidas que
 * dizem se uma peça se lê.
 *
 * ── Por que um editor genérico, e não uma marca ──────────────────────────
 * É a decisão do editor de código, escrita no CLAUDE.md: o desbravador pode
 * encontrar o Canva, o Figma ou o Inkscape, e o que se repete entre os três é
 * o arranjo — a prancha no meio, as camadas de um lado, as propriedades do
 * outro, e a barra de alinhar em cima. Imitar um deles ensinaria a achar os
 * botões daquele; o arranjo ensina a achar os botões de qualquer um.
 *
 * ── As medidas são do princípio, e não da peça ───────────────────────────
 * Hierarquia, contraste, alinhamento, proximidade, repetição e espaço
 * negativo viram contas aqui, e as mesmas contas respondem às oito lições da
 * CC-DG001: a que manda criar hierarquia num cartaz, a que manda **analisar**
 * a hierarquia de três peças prontas e a que manda refazer uma peça mal
 * resolvida. Uma conta por lição divergiria na primeira — a peça "bem
 * resolvida" da análise passaria a ser julgada por uma régua que o
 * laboratório de refazer não usa.
 *
 * E é por isso que a análise do módulo 6 não traz o veredito escrito à mão:
 * `arteDoClube.test.ts` confere que o que a lição chama de "falha" é o que
 * estas contas medem como falha.
 */

import { contrastRatio, hexToRgb } from '../lib/imageTools';
import {
  booleana, caixaDosContornos, contornoDaElipse, contornoDoRetangulo, escalar, transladar,
  type Booleana, type Contorno,
} from './vetor';

/* ── As famílias ─────────────────────────────────────────────────────────── */

/**
 * As famílias que o editor oferece, e a classificação de cada uma.
 *
 * São as que vêm em todo computador — Georgia, Arial, Courier — e é de
 * propósito: o desbravador as reconhece do editor de texto, e o requisito 3.3
 * pede distinguir serifada, sem serifa e monoespaçada nas fontes que ele já
 * viu, e não em três fontes de catálogo que ele nunca vai encontrar.
 */
export type Familia =
  | 'Georgia' | 'Times New Roman' | 'Arial' | 'Verdana' | 'Trebuchet MS'
  | 'Courier New' | 'Impact' | 'Comic Sans MS' | 'Brush Script MT' | 'Space Mono';

export type Classificacao = 'serifada' | 'sem-serifa' | 'monoespacada' | 'decorativa';

export const NOME_DA_CLASSIFICACAO: Record<Classificacao, string> = {
  'serifada': 'Serifada',
  'sem-serifa': 'Sem serifa',
  'monoespacada': 'Monoespaçada',
  'decorativa': 'Decorativa',
};

interface DadosDaFamilia {
  classificacao: Classificacao;
  /** A pilha de CSS: a família, e a genérica que o navegador usa se faltar. */
  pilha: string;
  /**
   * A largura média de um caractere, em fração do corpo.
   *
   * É o que quebra a linha no modelo, e ela é medida e não chutada: a mesma
   * frase em Verdana ocupa um terço a mais do que em Times. Sem isso, trocar
   * de família não mudaria a altura do bloco, e a lição de tipografia — que é
   * sobre exatamente isso — teria uma prancha que não reage.
   */
  largura: number;
}

export const FAMILIAS: Record<Familia, DadosDaFamilia> = {
  'Georgia': { classificacao: 'serifada', pilha: 'Georgia, "Times New Roman", serif', largura: 0.53 },
  'Times New Roman': { classificacao: 'serifada', pilha: '"Times New Roman", Times, serif', largura: 0.46 },
  'Arial': { classificacao: 'sem-serifa', pilha: 'Arial, Helvetica, sans-serif', largura: 0.5 },
  'Verdana': { classificacao: 'sem-serifa', pilha: 'Verdana, Geneva, sans-serif', largura: 0.6 },
  'Trebuchet MS': { classificacao: 'sem-serifa', pilha: '"Trebuchet MS", Helvetica, sans-serif', largura: 0.5 },
  'Courier New': { classificacao: 'monoespacada', pilha: '"Courier New", Courier, monospace', largura: 0.6 },
  'Impact': { classificacao: 'decorativa', pilha: 'Impact, "Arial Black", sans-serif', largura: 0.45 },
  'Comic Sans MS': { classificacao: 'decorativa', pilha: '"Comic Sans MS", "Comic Neue", cursive', largura: 0.53 },
  'Brush Script MT': { classificacao: 'decorativa', pilha: '"Brush Script MT", cursive', largura: 0.42 },
  /* A única cujo arquivo a plataforma carrega, e por isso a única que se
     converte em curvas: converter precisa do desenho de cada letra, e o
     desenho mora no arquivo da fonte. É o que `textoEmCurvas.ts` explica. */
  'Space Mono': { classificacao: 'monoespacada', pilha: '"Space Mono", ui-monospace, monospace', largura: 0.61 },
};

export const LISTA_DE_FAMILIAS = Object.keys(FAMILIAS) as Familia[];

/**
 * Família boa para texto corrido.
 *
 * Serifada e sem serifa. A monoespaçada fica de fora porque cada letra ocupa a
 * mesma largura — o "i" tão largo quanto o "m" — e um parágrafo inteiro nela
 * se lê aos solavancos; é a família do código e da tabela, onde a coluna
 * alinhada é o ponto. A decorativa fica de fora pelo motivo que o nome diz.
 */
export const ehDeLeitura = (f: Familia) =>
  FAMILIAS[f].classificacao === 'serifada' || FAMILIAS[f].classificacao === 'sem-serifa';

/* ── O que mora na prancha ───────────────────────────────────────────────── */

interface Base {
  id: string;
  /** O nome na lista de camadas. */
  nome: string;
  x: number;
  y: number;
  largura: number;
}

export type Alinhamento = 'esquerda' | 'centro' | 'direita';

export interface Texto extends Base {
  tipo: 'texto';
  texto: string;
  familia: Familia;
  peso: 400 | 700;
  /** Em pixels da prancha. */
  corpo: number;
  /** Em múltiplos do corpo: 1,4 é uma entrelinha de 140%. */
  entrelinha: number;
  cor: string;
  alinhamento: Alinhamento;
}

/** As três extremidades de traço que todo editor oferece. */
export type Extremidade = 'reta' | 'redonda' | 'quadrada';
export const NOME_DA_EXTREMIDADE: Record<Extremidade, string> = {
  reta: 'Reta', redonda: 'Redonda', quadrada: 'Quadrada',
};
/** O nome que o SVG dá a cada uma, que é o que se lê no arquivo. */
export const EXTREMIDADE_NO_SVG: Record<Extremidade, string> = { reta: 'butt', redonda: 'round', quadrada: 'square' };

export interface Traco {
  cor: string;
  espessura: number;
  extremidade: Extremidade;
}

export interface Forma extends Base {
  tipo: 'retangulo' | 'elipse';
  altura: number;
  preenchimento: string;
  /** A linha em volta. Ausente nas peças da CC-DG001, que não falam dela. */
  traco?: Traco | null;
}

/**
 * O caminho: contornos de nós e alças, com preenchimento e traço.
 *
 * `x`, `y`, `largura` e `altura` são a caixa dos contornos, guardada para que
 * o resto do editor — alinhar, a margem, a lista de propriedades — leia todo
 * objeto do mesmo jeito. Quem mexe nos contornos refaz a caixa por
 * `comCaixaRefeita`; quem mexe na caixa move ou escala os contornos.
 *
 * Preenchimento nulo é "sem preenchimento", e não transparente: num caminho
 * aberto, preencher fecha a forma por uma reta invisível entre as pontas, e o
 * desenho ganha uma mancha que ninguém desenhou.
 */
export interface Caminho extends Base {
  tipo: 'caminho';
  altura: number;
  contornos: Contorno[];
  preenchimento: string | null;
  traco: Traco | null;
}

/** O grupo: objetos que se movem juntos, com um nome na lista de camadas. */
export interface Grupo extends Base {
  tipo: 'grupo';
  altura: number;
  filhos: Objeto[];
}

/**
 * A imagem de referência: o logotipo que o examinador entregou, posto por
 * baixo para servir de guia.
 *
 * Ela é **imagem**, e não vetor: não se converte, não se desagrupa, não entra
 * numa booleana. Os contornos dela existem só para a conta que compara o que
 * a pessoa desenhou com o que foi pedido — se fossem vetor na tela, reproduzir
 * o logotipo seria duplicar a referência.
 */
export interface Referencia extends Base {
  tipo: 'referencia';
  altura: number;
  contornos: Contorno[];
  opacidade: number;
}

/**
 * A fotografia, que o editor desenha mas não guarda em pixels.
 *
 * `tons` é o mais escuro e o mais claro da região, e é o que o medidor de
 * contraste usa: texto por cima de foto não tem **uma** cor de fundo, tem
 * todas as que a foto tiver debaixo dele, e o pior caso é o que se lê.
 */
export interface Foto extends Base {
  tipo: 'foto';
  altura: number;
  motivo: 'fogueira' | 'barracas' | 'trilha' | 'piscina';
  tons: [string, string];
}

export type Objeto = Texto | Forma | Foto | Caminho | Grupo | Referencia;

export interface Prancha {
  id: string;
  nome: string;
  largura: number;
  altura: number;
  fundo: string;
  /** Na ordem de empilhamento: o primeiro fica embaixo de todos. */
  objetos: Objeto[];
}

/** Os cinco papéis da paleta, e a ordem em que o painel os mostra. */
export type Papel = 'fundo' | 'texto' | 'destaque' | 'apoio' | 'neutro';
export const PAPEIS: Papel[] = ['fundo', 'texto', 'destaque', 'apoio', 'neutro'];
export const NOME_DO_PAPEL: Record<Papel, string> = {
  fundo: 'Fundo', texto: 'Texto', destaque: 'Destaque', apoio: 'Apoio', neutro: 'Neutro',
};

export type Paleta = Record<Papel, string | null>;

/** O arquivo: as pranchas e as cores do documento. */
export interface Arte {
  pranchas: Prancha[];
  paleta: Paleta;
}

/**
 * Todo objeto da prancha, com os de dentro dos grupos, na ordem em que se
 * pintam — o grupo vem antes dos filhos, e os filhos onde o grupo está.
 *
 * É por ela que as contas da CC-DG001 continuam valendo com grupos: um texto
 * dentro de um grupo continua sendo um texto da peça, e o fundo dele continua
 * sendo o que se pinta antes.
 */
export function achatarObjetos(os: Objeto[]): Objeto[] {
  return os.flatMap(o => (o.tipo === 'grupo' ? [o, ...achatarObjetos(o.filhos)] : [o]));
}

export const textos = (p: Prancha): Texto[] =>
  achatarObjetos(p.objetos).filter((o): o is Texto => o.tipo === 'texto');
export const umObjeto = (p: Prancha, id: string) => achatarObjetos(p.objetos).find(o => o.id === id);
export const umaPrancha = (a: Arte, id: string) => a.pranchas.find(p => p.id === id);

/* ── O texto quebra em linhas, e a altura sai delas ──────────────────────── */

const larguraDoCaractere = (t: Pick<Texto, 'familia' | 'peso' | 'corpo'>) =>
  t.corpo * FAMILIAS[t.familia].largura * (t.peso === 700 ? 1.07 : 1);

/**
 * As linhas em que o bloco quebra, quebradas pelo modelo e não pelo navegador.
 *
 * O editor desenha **estas** linhas, uma por elemento. Deixar o navegador
 * quebrar daria uma altura na tela e outra na conta: o espaço entre dois
 * blocos que a lição de proximidade mede seria um número, e o que a pessoa vê
 * seria outro — a medida dizendo "encostou" sobre dois blocos visivelmente
 * afastados.
 */
export function linhasDoTexto(t: Texto): string[] {
  const cabem = Math.max(1, Math.floor(t.largura / larguraDoCaractere(t)));
  return t.texto.split('\n').flatMap(paragrafo => {
    const palavras = paragrafo.split(/\s+/).filter(Boolean);
    if (palavras.length === 0) return [''];
    const linhas: string[] = [];
    let atual = '';
    for (const palavra of palavras) {
      const tentativa = atual ? `${atual} ${palavra}` : palavra;
      if (tentativa.length > cabem && atual) {
        linhas.push(atual);
        atual = palavra;
      } else {
        atual = tentativa;
      }
    }
    linhas.push(atual);
    return linhas;
  });
}

export const alturaDaLinha = (t: Texto) => t.corpo * t.entrelinha;
export const alturaDoTexto = (t: Texto) => Math.round(linhasDoTexto(t).length * alturaDaLinha(t));
export const alturaDe = (o: Objeto) => (o.tipo === 'texto' ? alturaDoTexto(o) : o.altura);

export interface Caixa { x: number; y: number; largura: number; altura: number }
export const caixaDe = (o: Objeto): Caixa => ({ x: o.x, y: o.y, largura: o.largura, altura: alturaDe(o) });

const contem = (fora: Caixa, x: number, y: number) =>
  x >= fora.x && x <= fora.x + fora.largura && y >= fora.y && y <= fora.y + fora.altura;

const sobrepoe = (a: Caixa, b: Caixa) =>
  a.x < b.x + b.largura && b.x < a.x + a.largura && a.y < b.y + b.altura && b.y < a.y + a.altura;

/* ── Contraste ───────────────────────────────────────────────────────────── */

/**
 * Texto grande, para a régua do contraste.
 *
 * É a régua das diretrizes de acessibilidade da web: 24 pixels, ou 18,66 em
 * negrito. Letra grande se lê com menos contraste — o traço é mais grosso e
 * ocupa mais da retina —, e por isso pede 3:1 e não 4,5:1.
 */
export const ehTextoGrande = (t: Texto) => t.corpo >= 24 || (t.peso === 700 && t.corpo >= 18.66);
export const contrasteMinimo = (t: Texto) => (ehTextoGrande(t) ? 3 : 4.5);

/**
 * As cores que estão atrás do texto.
 *
 * O que estiver mais acima na pilha e contiver o centro do bloco: é o que o
 * olho vê atrás das letras. Uma foto devolve os dois tons dela, porque o texto
 * passa pelos dois.
 */
export function fundosDoTexto(p: Prancha, t: Texto): string[] {
  const c = caixaDe(t);
  const cx = c.x + c.largura / 2;
  const cy = c.y + c.altura / 2;
  const pintados = achatarObjetos(p.objetos);
  const indice = pintados.findIndex(o => o.id === t.id);
  for (let i = indice - 1; i >= 0; i--) {
    const o = pintados[i];
    if (o.tipo === 'texto' || o.tipo === 'grupo' || o.tipo === 'referencia') continue;
    if (!contem(caixaDe(o), cx, cy)) continue;
    if (o.tipo === 'caminho') {
      if (!o.preenchimento) continue;
      return [o.preenchimento];
    }
    return o.tipo === 'foto' ? [...o.tons] : [o.preenchimento];
  }
  return [p.fundo];
}

/** O contraste que se lê: o pior entre o texto e cada cor que está atrás dele. */
export const contrasteDoTexto = (p: Prancha, t: Texto) =>
  Math.min(...fundosDoTexto(p, t).map(f => contrastRatio(t.cor, f)));

export const textoSeLe = (p: Prancha, t: Texto) => contrasteDoTexto(p, t) >= contrasteMinimo(t);

export const textosQueNaoSeLeem = (p: Prancha) => textos(p).filter(t => !textoSeLe(p, t));
export const contrasteFunciona = (p: Prancha) => textosQueNaoSeLeem(p).length === 0;

/* ── Hierarquia ──────────────────────────────────────────────────────────── */

/**
 * O peso visual de um bloco: o corpo, e um pouco mais se for negrito.
 *
 * O negrito sobe um degrau sem mudar o tamanho, e é por isso que ele entra na
 * conta — dois blocos de 18 pixels, um negrito e outro não, não estão no mesmo
 * nível. O fator é pequeno de propósito: negrito sozinho não transforma texto
 * de corpo em título.
 */
export const pesoVisual = (t: Texto) => t.corpo * (t.peso === 700 ? 1.15 : 1);

/** Os níveis distintos de uma prancha, do maior para o menor. */
export function niveisDe(p: Prancha): number[] {
  const niveis: number[] = [];
  for (const v of textos(p).map(pesoVisual).sort((a, b) => b - a)) {
    /* Diferença de um pixel não é nível: o olho não separa 16 de 17. */
    if (!niveis.some(n => Math.abs(n - v) < 1.5)) niveis.push(v);
  }
  return niveis;
}

/**
 * O corpo do texto: o nível que mais blocos usam.
 *
 * É a régua contra a qual o título se mede. No empate vale o menor, que é o
 * que a peça usa para o que se lê de perto.
 */
export function nivelDoCorpo(p: Prancha): number {
  const conta = new Map<number, number>();
  for (const v of textos(p).map(pesoVisual)) {
    const chave = [...conta.keys()].find(k => Math.abs(k - v) < 1.5) ?? v;
    conta.set(chave, (conta.get(chave) ?? 0) + 1);
  }
  return [...conta.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]?.[0] ?? 0;
}

/** Quantas vezes o título é maior que o corpo do texto. */
export const RAZAO_DO_TITULO = 1.8;
export const MAXIMO_DE_NIVEIS = 4;

/**
 * Hierarquia que funciona: o título é o maior **sozinho**, bem maior que o
 * corpo, e a peça não tem mais níveis do que o olho ordena.
 *
 * "Sozinho" é a metade que se esquece: um cartaz com o título e a data no
 * mesmo tamanho tem dois títulos, e o olho não sabe por onde começar. E o teto
 * de níveis é a outra ponta do mesmo defeito — seis tamanhos diferentes não
 * fazem seis degraus, fazem barulho.
 */
export function hierarquiaFunciona(p: Prancha, tituloId: string): boolean {
  const titulo = umObjeto(p, tituloId);
  if (!titulo || titulo.tipo !== 'texto') return false;
  const v = pesoVisual(titulo);
  const outros = textos(p).filter(t => t.id !== tituloId).map(pesoVisual);
  if (outros.some(o => o > v - 1.5)) return false;
  return v >= RAZAO_DO_TITULO * nivelDoCorpo(p) && niveisDe(p).length <= MAXIMO_DE_NIVEIS;
}

/**
 * Quem estraga a hierarquia: o título, se ele não se destaca, e cada bloco que
 * disputa com ele. É o que a análise do módulo 6 aceita como "onde se vê".
 */
export function quemEstragaAHierarquia(p: Prancha, tituloId: string): string[] {
  const titulo = umObjeto(p, tituloId);
  if (!titulo || titulo.tipo !== 'texto') return [];
  const v = pesoVisual(titulo);
  const rivais = textos(p).filter(t => t.id !== tituloId && pesoVisual(t) > v - 1.5).map(t => t.id);
  return [tituloId, ...rivais];
}

/* ── Alinhamento ─────────────────────────────────────────────────────────── */

export const TOLERANCIA = 2;

/** O eixo de um bloco de texto: a borda pela qual ele está alinhado. */
export function eixoDoTexto(t: Texto): number {
  if (t.alinhamento === 'esquerda') return t.x;
  if (t.alinhamento === 'direita') return t.x + t.largura;
  return t.x + t.largura / 2;
}

const linhasVerticais = (o: Objeto) => [o.x, o.x + o.largura / 2, o.x + o.largura];

/**
 * O texto está apoiado em alguma coisa: o eixo dele cai sobre uma borda ou o
 * centro de outro objeto, ou sobre o centro da prancha.
 *
 * É a regra que o requisito 1.3 descreve sem números — "nada é posto na página
 * por acaso". Um bloco a 47 pixels da borda, quando todos os outros estão a
 * 40, não está alinhado a nada, e o olho percebe o degrau antes de saber o que
 * percebeu.
 */
export function textoApoiado(p: Prancha, t: Texto): boolean {
  const eixo = eixoDoTexto(t);
  const linhas = [p.largura / 2, ...p.objetos.filter(o => o.id !== t.id).flatMap(linhasVerticais)];
  return linhas.some(l => Math.abs(l - eixo) <= TOLERANCIA);
}

export const textosSoltos = (p: Prancha) => textos(p).filter(t => !textoApoiado(p, t));
export const alinhamentoFunciona = (p: Prancha) => textos(p).length > 0 && textosSoltos(p).length === 0;

/** Quantos eixos diferentes os textos da lista usam — um só é uma coluna. */
export function eixosDe(ts: Texto[]): number {
  const eixos: number[] = [];
  for (const e of ts.map(eixoDoTexto)) if (!eixos.some(x => Math.abs(x - e) <= TOLERANCIA)) eixos.push(e);
  return eixos.length;
}

/* ── Proximidade ─────────────────────────────────────────────────────────── */

/** O espaço vertical entre dois blocos, do pé de um à cabeça do outro. */
const vaoEntre = (a: Objeto, b: Objeto) => b.y - (a.y + alturaDe(a));

/** O maior vão dentro de um grupo, com os blocos na ordem em que estão na prancha. */
export function maiorVaoInterno(p: Prancha, ids: string[]): number {
  const os = ids.map(id => umObjeto(p, id)).filter((o): o is Objeto => !!o).sort((a, b) => a.y - b.y);
  let maior = 0;
  for (let i = 1; i < os.length; i++) maior = Math.max(maior, vaoEntre(os[i - 1], os[i]));
  return maior;
}

/** O vão entre o pé de um grupo e a cabeça do seguinte. */
export function vaoEntreGrupos(p: Prancha, de: string[], ate: string[]): number {
  const a = de.map(id => umObjeto(p, id)).filter((o): o is Objeto => !!o);
  const b = ate.map(id => umObjeto(p, id)).filter((o): o is Objeto => !!o);
  if (a.length === 0 || b.length === 0) return 0;
  const pe = Math.max(...a.map(o => o.y + alturaDe(o)));
  const cabeca = Math.min(...b.map(o => o.y));
  return cabeca - pe;
}

/**
 * Proximidade que funciona: entre dois grupos vizinhos, o vão é pelo menos o
 * dobro do maior vão de dentro de cada um.
 *
 * O dobro, e não "maior": um vão de 14 contra um de 12 é diferença que a régua
 * mede e o olho não vê. E vale **par a par**, na ordem da página — um grupo
 * bem separado do de cima e grudado no de baixo continua sendo lido junto com
 * o de baixo.
 */
export function proximidadeFunciona(p: Prancha, grupos: string[][]): boolean {
  if (grupos.length < 2) return false;
  for (let i = 1; i < grupos.length; i++) {
    const entre = vaoEntreGrupos(p, grupos[i - 1], grupos[i]);
    const dentro = Math.max(maiorVaoInterno(p, grupos[i - 1]), maiorVaoInterno(p, grupos[i]));
    if (entre < 2 * Math.max(dentro, 4)) return false;
  }
  return true;
}

/* ── Espaço negativo ─────────────────────────────────────────────────────── */

/**
 * O objeto que sangra: fundo de faixa ou foto que vai de uma borda à outra.
 *
 * Ele fica de fora da conta da margem, porque encostar na borda é o que ele
 * existe para fazer. Texto nunca sangra.
 */
export function sangra(p: Prancha, o: Objeto): boolean {
  if (o.tipo === 'texto') return false;
  const c = caixaDe(o);
  const deLadoALado = c.x <= 0 && c.x + c.largura >= p.largura;
  const deCimaABaixo = c.y <= 0 && c.y + c.altura >= p.altura;
  return deLadoALado || deCimaABaixo;
}

/** A menor distância entre um objeto e a borda da prancha. */
export function margemDe(p: Prancha, o: Objeto): number {
  const c = caixaDe(o);
  return Math.min(c.x, c.y, p.largura - (c.x + c.largura), p.altura - (c.y + c.altura));
}

/** A menor margem da prancha, sem os que sangram. */
export function margemMinima(p: Prancha): number {
  const ms = p.objetos.filter(o => !sangra(p, o)).map(o => margemDe(p, o));
  return ms.length ? Math.min(...ms) : Infinity;
}

/** A margem que a CC-DG001 cobra: 5% da largura, que num A4 é um centímetro. */
export const margemPedida = (p: Prancha) => Math.round(p.largura * 0.05);

/** Dois textos um em cima do outro, que é o espaço negativo virando zero. */
export function textosSobrepostos(p: Prancha): [string, string][] {
  const ts = textos(p);
  const pares: [string, string][] = [];
  for (let i = 0; i < ts.length; i++) {
    for (let j = i + 1; j < ts.length; j++) {
      if (sobrepoe(caixaDe(ts[i]), caixaDe(ts[j]))) pares.push([ts[i].id, ts[j].id]);
    }
  }
  return pares;
}

/** O que passa da borda da prancha e vai ser cortado ao exportar. */
export const objetosForaDaPrancha = (p: Prancha) => p.objetos.filter(o => !sangra(p, o) && margemDe(p, o) < 0);

/* ── Repetição ───────────────────────────────────────────────────────────── */

const estiloDoTexto = (t: Texto) =>
  [t.familia, t.peso, t.corpo, t.cor.toLowerCase(), t.entrelinha].join('|');

/** Os textos da lista com o mesmo estilo — família, peso, corpo, cor e entrelinha. */
export function mesmoEstilo(p: Prancha, ids: string[]): boolean {
  const ts = ids.map(id => umObjeto(p, id));
  if (ts.length < 2 || ts.some(t => !t || t.tipo !== 'texto')) return false;
  return new Set((ts as Texto[]).map(estiloDoTexto)).size === 1;
}

/** As formas da lista com o mesmo tamanho e o mesmo preenchimento. */
export function mesmaForma(p: Prancha, ids: string[]): boolean {
  const fs = ids.map(id => umObjeto(p, id));
  if (fs.length < 2 || fs.some(f => !f || f.tipo === 'texto' || f.tipo === 'foto')) return false;
  return new Set((fs as Forma[]).map(f => `${f.largura}|${f.altura}|${f.preenchimento.toLowerCase()}`)).size === 1;
}

/* ── Cor ─────────────────────────────────────────────────────────────────── */

export interface Hsl { h: number; s: number; l: number }

/** Matiz em graus, saturação e luminosidade de 0 a 1. */
export function hslDe(hex: string): Hsl {
  const rgb = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 };
  const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: h * 60, s, l };
}

const hex2 = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');

export function hexDeHsl({ h, s, l }: Hsl): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hh = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  const [r1, g1, b1] =
    hh < 1 ? [c, x, 0] : hh < 2 ? [x, c, 0] : hh < 3 ? [0, c, x]
      : hh < 4 ? [0, x, c] : hh < 5 ? [x, 0, c] : [c, 0, x];
  const m = l - c / 2;
  return `#${hex2((r1 + m) * 255)}${hex2((g1 + m) * 255)}${hex2((b1 + m) * 255)}`.toUpperCase();
}

/** A distância entre dois matizes, pelo lado curto do círculo. */
export const distanciaDeMatiz = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

/**
 * A mesma cor em CMYK, pela conversão ingênua.
 *
 * É a conta que todo seletor de cor mostra quando não sabe em que papel e em
 * que máquina a peça vai sair — a gráfica usa um perfil de cor, e o número
 * dela é outro. Serve para ver que são **quatro** tintas, e que o preto é uma
 * delas; não serve para mandar à gráfica.
 */
export function cmykDe(hex: string): [number, number, number, number] {
  const rgb = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 };
  const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
  const k = 1 - Math.max(r, g, b);
  if (k >= 1) return [0, 0, 0, 100];
  const pct = (v: number) => Math.round(((1 - v - k) / (1 - k)) * 100);
  return [pct(r), pct(g), pct(b), Math.round(k * 100)];
}

/**
 * A cor que a tinta não alcança.
 *
 * A tela acende luz e o papel reflete o que a tinta deixa passar, e há cores
 * que só a luz faz: o verde-limão, o azul elétrico, o laranja fosforescente.
 * São as muito saturadas, de luminosidade média, nas regiões em que o ciano,
 * o magenta e o amarelo misturados ficam mais longe do que o monitor acende.
 *
 * É um modelo — a fronteira de verdade depende do papel e da máquina —, e é o
 * mesmo aviso que os programas de edição dão. O que ele ensina vale para todo
 * perfil: a cor que brilha na tela é a que mais muda no papel.
 */
export function foraDaGama(hex: string): boolean {
  const { h, s, l } = hslDe(hex);
  if (s < 0.75 || l < 0.3 || l > 0.72) return false;
  return (h >= 75 && h <= 265) || (h >= 18 && h <= 45);
}

/** Como a cor sai do papel: sem o brilho que só a luz da tela tinha. */
export function provaDeImpressao(hex: string): string {
  if (!foraDaGama(hex)) return hex.toUpperCase();
  const { h, l } = hslDe(hex);
  return hexDeHsl({ h, s: 0.55, l: l * 0.9 });
}

/** Duas cores que o olho separa: algum canal difere em pelo menos 24. */
export function coresDistintas(a: string, b: string): boolean {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  if (!x || !y) return false;
  return Math.max(Math.abs(x.r - y.r), Math.abs(x.g - y.g), Math.abs(x.b - y.b)) >= 24;
}

export const ehHex = (s: string) => /^#[0-9a-f]{6}$/i.test(s);

/* ── Como quem não distingue vermelho de verde vê ────────────────────────── */

/**
 * A matriz da deuteranopia, a mais comum das três formas de daltonismo.
 *
 * É a de Machado, Oliveira e Fernandes (2009), aplicada à luz **linear**, e não
 * aos números do hexadecimal: a matriz antiga que circula pela internet, posta
 * direto no sRGB, escurece o verde e clareia o vermelho, e um par que quem tem
 * deuteranopia de fato confunde sairia da simulação com contraste de 3:1 — a
 * lição mostraria o problema resolvido justamente onde ele mora. É também
 * linear que o `feColorMatrix` do filtro trabalha, por padrão, e por isso o
 * mesmo número serve aos dois.
 *
 * Mora aqui, e não só no filtro da tela, porque as duas coisas precisam
 * concordar: a lição do módulo 8 mostra a escala da cantina pela simulação, e
 * `arteDoClube.test.ts` confere que o verde e o vermelho de lá ficam de fato
 * parecidos depois dela.
 */
export const MATRIZ_DA_DEUTERANOPIA = [
  [0.367322, 0.860646, -0.227968],
  [0.280085, 0.672501, 0.047413],
  [-0.01182, 0.04294, 0.968881],
] as const;

const paraLinear = (c: number) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const deLinear = (v: number) => {
  const c = Math.max(0, Math.min(1, v));
  return 255 * (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);
};

export function comoDeuteranope(hex: string): string {
  const rgb = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 };
  const v = [rgb.r, rgb.g, rgb.b].map(paraLinear);
  const [r, g, b] = MATRIZ_DA_DEUTERANOPIA.map(linha => deLinear(linha.reduce((s, k, i) => s + k * v[i], 0)));
  return `#${hex2(r)}${hex2(g)}${hex2(b)}`.toUpperCase();
}

/* ── Os comandos ─────────────────────────────────────────────────────────── */

export const mudarPrancha = (a: Arte, id: string, f: (p: Prancha) => Prancha): Arte =>
  ({ ...a, pranchas: a.pranchas.map(p => (p.id === id ? f(p) : p)) });

/**
 * Mudar os objetos de uma lista de ids, onde quer que eles estejam — dentro
 * de grupo inclusive. O grupo que teve um filho mudado refaz a própria caixa.
 */
export function mudarObjetos(p: Prancha, ids: string[], f: (o: Objeto) => Objeto): Prancha {
  const mudar = (os: Objeto[]): Objeto[] => os.map(o => {
    if (ids.includes(o.id)) return f(o);
    if (o.tipo !== 'grupo') return o;
    const filhos = mudar(o.filhos);
    return filhos.every((x, i) => x === o.filhos[i]) ? o : comCaixaRefeita({ ...o, filhos });
  });
  return { ...p, objetos: mudar(p.objetos) };
}

/* ── Mover, posicionar e medir o que não é retângulo ─────────────────────── */

/** A caixa refeita a partir do que o objeto tem dentro. */
export function comCaixaRefeita<O extends Objeto>(o: O): O {
  if (o.tipo === 'caminho' || o.tipo === 'referencia') {
    const c = caixaDosContornos(o.contornos);
    return { ...o, x: c.x, y: c.y, largura: c.largura, altura: c.altura };
  }
  if (o.tipo === 'grupo') {
    const cs = o.filhos.map(caixaDe);
    if (cs.length === 0) return o;
    const x = Math.min(...cs.map(c => c.x));
    const y = Math.min(...cs.map(c => c.y));
    return {
      ...o, x, y,
      largura: Math.max(...cs.map(c => c.x + c.largura)) - x,
      altura: Math.max(...cs.map(c => c.y + c.altura)) - y,
    };
  }
  return o;
}

/** Mover um objeto, levando o que ele tem dentro. */
export function moverObjeto(o: Objeto, dx: number, dy: number): Objeto {
  if (dx === 0 && dy === 0) return o;
  if (o.tipo === 'caminho' || o.tipo === 'referencia') {
    return { ...o, x: o.x + dx, y: o.y + dy, contornos: transladar(o.contornos, dx, dy) };
  }
  if (o.tipo === 'grupo') {
    return { ...o, x: o.x + dx, y: o.y + dy, filhos: o.filhos.map(f => moverObjeto(f, dx, dy)) };
  }
  return { ...o, x: o.x + dx, y: o.y + dy };
}

export const posicionar = (o: Objeto, x: number, y: number) => moverObjeto(o, x - o.x, y - o.y);

/**
 * Mudar largura e altura pela caixa.
 *
 * O caminho escala a partir do canto de cima à esquerda, que é o que a caixa
 * de propriedades faz em todo editor. O grupo não se redimensiona por aqui:
 * escalar um grupo com texto dentro pediria escolher entre esticar a letra e
 * mudar o corpo, e as duas respostas são erradas em metade dos casos.
 */
export function redimensionar(o: Objeto, largura: number | undefined, altura: number | undefined): Objeto {
  if (o.tipo === 'grupo') return o;
  if (o.tipo === 'texto') return largura === undefined ? o : { ...o, largura };
  if (o.tipo === 'caminho' || o.tipo === 'referencia') {
    const sx = largura === undefined || o.largura === 0 ? 1 : largura / o.largura;
    const sy = altura === undefined || o.altura === 0 ? 1 : altura / o.altura;
    return comCaixaRefeita({ ...o, contornos: escalar(o.contornos, { x: o.x, y: o.y }, sx, sy) });
  }
  return { ...o, largura: largura ?? o.largura, altura: altura ?? o.altura };
}

export type Borda = 'esquerda' | 'centro-h' | 'direita' | 'topo' | 'meio-v' | 'base';

/**
 * Alinhar os selecionados entre si — ou à prancha, quando só um está
 * selecionado, que é o que todo editor faz: alinhar um objeto a si mesmo não
 * moveria nada, e o botão pareceria quebrado.
 */
export function alinhar(p: Prancha, ids: string[], borda: Borda): Prancha {
  const os = ids.map(id => umObjeto(p, id)).filter((o): o is Objeto => !!o);
  if (os.length === 0) return p;
  const cs = os.map(caixaDe);
  const ref: Caixa = os.length === 1
    ? { x: 0, y: 0, largura: p.largura, altura: p.altura }
    : {
      x: Math.min(...cs.map(c => c.x)),
      y: Math.min(...cs.map(c => c.y)),
      largura: Math.max(...cs.map(c => c.x + c.largura)) - Math.min(...cs.map(c => c.x)),
      altura: Math.max(...cs.map(c => c.y + c.altura)) - Math.min(...cs.map(c => c.y)),
    };
  return mudarObjetos(p, ids, o => {
    const c = caixaDe(o);
    switch (borda) {
      case 'esquerda': return posicionar(o, ref.x, o.y);
      case 'centro-h': return posicionar(o, Math.round(ref.x + ref.largura / 2 - c.largura / 2), o.y);
      case 'direita': return posicionar(o, ref.x + ref.largura - c.largura, o.y);
      case 'topo': return posicionar(o, o.x, ref.y);
      case 'meio-v': return posicionar(o, o.x, Math.round(ref.y + ref.altura / 2 - c.altura / 2));
      case 'base': return posicionar(o, o.x, ref.y + ref.altura - c.altura);
    }
  });
}

/**
 * Distribuir: o mesmo vão entre cada par vizinho, sem mexer no primeiro nem no
 * último.
 *
 * É o vão **entre** os objetos, e não a distância entre os topos, que é a
 * conta que os editores fazem: com blocos de alturas diferentes, topos
 * equidistantes deixam vãos diferentes, e é o vão que o olho lê.
 */
export function distribuir(p: Prancha, ids: string[], eixo: 'vertical' | 'horizontal'): Prancha {
  const os = ids.map(id => umObjeto(p, id)).filter((o): o is Objeto => !!o);
  if (os.length < 3) return p;
  const vert = eixo === 'vertical';
  const pos = (o: Objeto) => (vert ? o.y : o.x);
  const tam = (o: Objeto) => (vert ? alturaDe(o) : o.largura);
  const ordem = [...os].sort((a, b) => pos(a) - pos(b));
  const inicio = pos(ordem[0]);
  const fim = pos(ordem[ordem.length - 1]) + tam(ordem[ordem.length - 1]);
  const ocupado = ordem.reduce((s, o) => s + tam(o), 0);
  const vao = (fim - inicio - ocupado) / (ordem.length - 1);
  const novas = new Map<string, number>();
  let cursor = inicio;
  for (const o of ordem) {
    novas.set(o.id, Math.round(cursor));
    cursor += tam(o) + vao;
  }
  return mudarObjetos(p, ids, o => (vert ? posicionar(o, o.x, novas.get(o.id)!) : posicionar(o, novas.get(o.id)!, o.y)));
}

export interface EstiloCopiado {
  texto?: Pick<Texto, 'familia' | 'peso' | 'corpo' | 'entrelinha' | 'cor'>;
  forma?: { preenchimento: string | null; traco: Traco | null };
}

export function copiarEstilo(o: Objeto): EstiloCopiado {
  if (o.tipo === 'texto') {
    const { familia, peso, corpo, entrelinha, cor } = o;
    return { texto: { familia, peso, corpo, entrelinha, cor } };
  }
  if (o.tipo === 'retangulo' || o.tipo === 'elipse') return { forma: { preenchimento: o.preenchimento, traco: o.traco ?? null } };
  if (o.tipo === 'caminho') return { forma: { preenchimento: o.preenchimento, traco: o.traco } };
  return {};
}

/**
 * Colar estilo vale para o tipo que o estilo veio: texto em texto, forma em
 * forma. O caminho conta como forma — traço e preenchimento são os mesmos —, e
 * a forma retangular não aceita "sem preenchimento", que é coisa de caminho.
 */
export function colarEstilo(p: Prancha, ids: string[], e: EstiloCopiado): Prancha {
  return mudarObjetos(p, ids, o => {
    if (o.tipo === 'texto' && e.texto) return { ...o, ...e.texto };
    if ((o.tipo === 'retangulo' || o.tipo === 'elipse') && e.forma) {
      return { ...o, preenchimento: e.forma.preenchimento ?? o.preenchimento, traco: e.forma.traco };
    }
    if (o.tipo === 'caminho' && e.forma) return { ...o, ...e.forma };
    return o;
  });
}

/** Trazer para frente ou mandar para trás, um degrau, entre os irmãos. */
export function mudarOrdem(p: Prancha, id: string, para: 'frente' | 'tras'): Prancha {
  const trocar = (os: Objeto[]): Objeto[] => {
    const i = os.findIndex(o => o.id === id);
    if (i < 0) return os.map(o => (o.tipo === 'grupo' ? { ...o, filhos: trocar(o.filhos) } : o));
    const j = para === 'frente' ? i + 1 : i - 1;
    if (j < 0 || j >= os.length) return os;
    const novos = [...os];
    [novos[i], novos[j]] = [novos[j], novos[i]];
    return novos;
  };
  return { ...p, objetos: trocar(p.objetos) };
}

/** Excluir onde quer que esteja; o grupo que fica vazio sai junto. */
export function excluir(p: Prancha, ids: string[]): Prancha {
  const tirar = (os: Objeto[]): Objeto[] => os.flatMap((o): Objeto[] => {
    if (ids.includes(o.id)) return [];
    if (o.tipo !== 'grupo') return [o];
    const filhos = tirar(o.filhos);
    if (filhos.length === 0) return [];
    return [filhos.length === o.filhos.length ? o : comCaixaRefeita({ ...o, filhos })];
  });
  return { ...p, objetos: tirar(p.objetos) };
}

/** Um id que a prancha ainda não usa. */
export function idNovo(a: Arte, prefixo: string): string {
  const usados = new Set(a.pranchas.flatMap(p => [p.id, ...achatarObjetos(p.objetos).map(o => o.id)]));
  for (let i = 1; ; i++) if (!usados.has(`${prefixo}-${i}`)) return `${prefixo}-${i}`;
}

/* ── Agrupar, converter e combinar ───────────────────────────────────────── */

/**
 * Agrupar irmãos: só objetos do mesmo nível entram no mesmo grupo, e o grupo
 * fica onde estava o de cima — é o que mantém a ordem em que eles se pintam.
 */
export function agrupar(p: Prancha, ids: string[], id: string, nome = 'Grupo'): Prancha {
  const juntar = (os: Objeto[]): Objeto[] => {
    const dentro = os.filter(o => ids.includes(o.id));
    if (dentro.length === ids.length && dentro.length >= 2) {
      const ultimo = Math.max(...dentro.map(o => os.indexOf(o)));
      const grupo = comCaixaRefeita<Grupo>({ id, nome, tipo: 'grupo', x: 0, y: 0, largura: 0, altura: 0, filhos: dentro });
      return os.flatMap((o, i) => (i === ultimo ? [grupo] : ids.includes(o.id) ? [] : [o]));
    }
    return os.map(o => (o.tipo === 'grupo' ? { ...o, filhos: juntar(o.filhos) } : o));
  };
  return { ...p, objetos: juntar(p.objetos) };
}

/** Desagrupar: os filhos voltam para o lugar do grupo, na mesma ordem. */
export function desagrupar(p: Prancha, id: string): Prancha {
  const soltar = (os: Objeto[]): Objeto[] => os.flatMap((o): Objeto[] => {
    if (o.id === id && o.tipo === 'grupo') return o.filhos;
    return o.tipo === 'grupo' ? [{ ...o, filhos: soltar(o.filhos) }] : [o];
  });
  return { ...p, objetos: soltar(p.objetos) };
}

/**
 * Converter uma forma em caminho: o retângulo vira quatro nós de canto, a
 * elipse vira quatro nós suaves. O texto não passa por aqui — o desenho das
 * letras mora no arquivo da fonte, e quem o lê é `textoEmCurvas.ts`.
 */
export function emCaminho(o: Objeto): Caminho | null {
  if (o.tipo === 'caminho') return o;
  if (o.tipo !== 'retangulo' && o.tipo !== 'elipse') return null;
  const contorno = o.tipo === 'retangulo'
    ? contornoDoRetangulo(o.x, o.y, o.largura, o.altura)
    : contornoDaElipse(o.x, o.y, o.largura, o.altura);
  return {
    id: o.id, nome: o.nome, tipo: 'caminho', x: o.x, y: o.y, largura: o.largura, altura: o.altura,
    contornos: [contorno], preenchimento: o.preenchimento, traco: o.traco ?? null,
  };
}

export const NOME_DA_BOOLEANA: Record<Booleana, string> = {
  uniao: 'Unir', subtracao: 'Subtrair', intersecao: 'Intersectar',
};

/**
 * União, subtração e interseção entre objetos irmãos.
 *
 * Os objetos se combinam **na ordem da pilha**: o de baixo é a base, e os de
 * cima entram nela — somados, subtraídos ou intersectados. Na subtração é o de
 * baixo que perde o pedaço, que é a regra do Figma e do Inkscape. O resultado
 * herda o nome, o preenchimento e o traço do de baixo, e fica no lugar dele.
 */
export function combinar(p: Prancha, ids: string[], op: Booleana): Prancha {
  const irmaos = (os: Objeto[]): Objeto[] | null => {
    if (ids.every(id => os.some(o => o.id === id))) return os;
    for (const o of os) {
      if (o.tipo !== 'grupo') continue;
      const achado = irmaos(o.filhos);
      if (achado) return achado;
    }
    return null;
  };
  const lista = irmaos(p.objetos);
  if (!lista || ids.length < 2) return p;
  const ordem = lista.filter(o => ids.includes(o.id));
  const caminhos = ordem.map(emCaminho);
  if (caminhos.some(c => !c)) return p;
  const [base, ...resto] = caminhos as Caminho[];
  let contornos = base.contornos;
  if (op === 'subtracao') {
    const tirar = resto.reduce<Contorno[]>((acc, c) => (acc.length ? booleana(acc, c.contornos, 'uniao') : c.contornos), []);
    contornos = booleana(contornos, tirar, 'subtracao');
  } else {
    for (const c of resto) contornos = booleana(contornos, c.contornos, op);
  }
  const resultado = comCaixaRefeita<Caminho>({ ...base, contornos });
  const trocar = (os: Objeto[]): Objeto[] => {
    if (os !== lista) return os.map(o => (o.tipo === 'grupo' ? comCaixaRefeita({ ...o, filhos: trocar(o.filhos) }) : o));
    return os.flatMap(o => (o.id === base.id ? [resultado] : ids.includes(o.id) ? [] : [o]));
  };
  return { ...p, objetos: trocar(p.objetos) };
}

/**
 * Duplicar a prancha, que é como se guarda a versão anterior antes de refazer.
 *
 * Os objetos ganham ids novos: com os mesmos, selecionar um título na cópia
 * selecionaria o da original junto, e mexer numa mexeria nas duas — que é
 * exatamente o que a cópia existe para não deixar acontecer.
 */
export function duplicarPrancha(a: Arte, id: string): Arte {
  const origem = umaPrancha(a, id);
  if (!origem) return a;
  const novoId = idNovo(a, `${origem.id}-copia`);
  const copia: Prancha = {
    ...origem,
    id: novoId,
    nome: `${origem.nome} (cópia)`,
    objetos: comIdsNovos(origem.objetos, `${novoId}-`),
  };
  const i = a.pranchas.findIndex(p => p.id === id);
  return { ...a, pranchas: [...a.pranchas.slice(0, i + 1), copia, ...a.pranchas.slice(i + 1)] };
}

/** Os mesmos objetos, com um prefixo nos ids — os dos filhos de grupo também. */
function comIdsNovos(os: Objeto[], prefixo: string): Objeto[] {
  return os.map(o => (o.tipo === 'grupo'
    ? { ...o, id: `${prefixo}${o.id}`, filhos: comIdsNovos(o.filhos, prefixo) }
    : { ...o, id: `${prefixo}${o.id}` }));
}

/** O texto que a prancha carrega, como conjunto: é o que "sem perder informação" mede. */
export const textoDaPrancha = (p: Prancha) =>
  textos(p).map(t => t.texto.replace(/\s+/g, ' ').trim()).sort();

export const mesmoTexto = (a: Prancha, b: Prancha) =>
  JSON.stringify(textoDaPrancha(a)) === JSON.stringify(textoDaPrancha(b));

const semIds = (os: Objeto[]): unknown[] => os.map(o => {
  const resto: Record<string, unknown> = { ...o };
  delete resto.id;
  delete resto.nome;
  if (o.tipo === 'grupo') resto.filhos = semIds(o.filhos);
  return resto;
});

/** Prancha idêntica à outra, sem contar os ids: é a versão anterior guardada. */
export function mesmaPeca(a: Prancha, b: Prancha): boolean {
  const semId = (p: Prancha) => JSON.stringify(
    [p.largura, p.altura, p.fundo.toLowerCase(), semIds(p.objetos)],
  );
  return semId(a) === semId(b);
}
