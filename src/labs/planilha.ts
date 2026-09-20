import {
  ehNumero, mostrar, nomeDaColuna, numeroDoTexto, valorDaCelula, transporFormula,
  type Formato, type Valor,
} from './formulas';

export type { Formato } from './formulas';

/*
 * A planilha: o modelo e o que se faz com ele, sem tela nenhuma.
 *
 * ── O modelo desceu para cá ──────────────────────────────────────────────
 * A célula, a grade, a faixa e o valor moravam em `metasDaAp043.ts`, junto
 * das tarefas daquele laboratório — e este arquivo importava de lá, o que já
 * era de trás para frente: as operações dependiam das metas de um exercício.
 * Desceram no dia em que a CC-ES003 precisou da mesma grade com formato de
 * célula, formatação condicional e mais de uma aba, e desceram **antes** de a
 * cópia existir, que é a decisão de `word.tsx` e de `explorer.tsx`.
 *
 * O que fica aqui é do **programa**: como uma célula guarda o que foi escrito,
 * o que uma faixa é, como uma coluna some. O que cada laboratório cobra
 * continua no laboratório.
 *
 * ── E por que nada disto mora no componente ──────────────────────────────
 *
 * Mora fora do componente pela razão que `metasDaAp043.ts` e `terminal.ts` já
 * registraram: laboratório que só se confere montando a tela não se confere.
 * E aqui isso pesa mais do que de costume, porque o que entrou agora foi o
 * teclado do Excel — e teclado é justamente o que ninguém percebe estar
 * quebrado até tentar usar.
 *
 * O defeito que trouxe este arquivo à existência é exemplar: escrever na barra
 * de fórmulas aceitava **um caractere**. O `onChange` da barra ligava o modo de
 * edição, a célula passava a desenhar um campo com `autoFocus`, esse campo
 * roubava o foco no meio da digitação, e o `onBlur` da barra — que confirma o
 * que foi escrito — gravava a letra sozinha. Cada tecla virava uma gravação.
 * Nenhum teste pegava, porque nenhum teste digitava.
 */

/*
  'padrao' é o alinhamento que a planilha dá sozinha, e ele não é 'esquerda':
  número vai para a direita, texto para a esquerda. Essa diferença é como se
  descobre que a planilha entendeu o que foi digitado — número que fica à
  esquerda é número guardado como texto, e é o engano mais comum de quem faz
  planilha. Nascendo tudo à esquerda, ninguém aprende a reparar nisso.
*/
export type AlinhaH = 'padrao' | 'esquerda' | 'centro' | 'direita';
export type AlinhaV = 'acima' | 'meio' | 'abaixo';
export type Layout = 'nenhum' | 'automatico' | 'manual';

export interface Celula {
  /** O que está escrito — pode ser texto, número ou fórmula começando por =. */
  texto: string;
  /**
   * Como o valor se mostra. O que está **escrito** não muda com ele.
   *
   * É a distinção que o requisito 3 da CC-ES003 pede: o dado bruto é 1620, a
   * apresentação é R$ 1.620,00, e são coisas separadas. Guardar `'R$ 1.620,00'`
   * em `texto` — que é o que alguém faz digitando o cifrão — transforma o
   * número em texto, e a `SOMA` para de vê-lo. Esse é literalmente o defeito
   * do requisito 7.
   */
  formato: Formato;
  h: AlinhaH;
  v: AlinhaV;
  /** Quantas colunas esta célula ocupa depois de mesclada. 1 é o normal. */
  span: number;
  /** Coberta por uma mesclagem à esquerda: não se desenha. */
  coberta: boolean;
  negrito: boolean;
}

export interface Planilha {
  celulas: Celula[][];
  larguras: number[];
  alturas: number[];
  layout: Layout;
  /** O nome na aba do pé. Uma pasta de trabalho tem várias. */
  nome: string;
  /**
   * O bloco que a planilha reconhece como tabela, com o cabeçalho na primeira
   * linha dele.
   *
   * Ele é declarado, e não adivinhado pelo que está preenchido. Uma planilha
   * de verdade tem título solto, nota de rodapé e bloco de cálculos ao lado —
   * e `larguraDaTabela` acharia tudo isso. Ordenar "a tabela" adivinhada
   * embaralharia o título junto com os dados, sem erro nenhum e sem volta.
   */
  tabela: Faixa | null;
  /** Quantas linhas do alto ficam paradas enquanto o resto rola. */
  congeladas: number;
  /** O filtro esconde linha; nunca apaga nenhuma. `valor` vazio mostra todas. */
  filtro: { coluna: number; valor: string } | null;
  /** A última ordenação aplicada — é dela que sai a setinha do cabeçalho. */
  ordenacao: { coluna: number; crescente: boolean } | null;
  regras: RegraCondicional[];
  grafico: Grafico | null;
}

/**
 * Uma regra de formatação condicional.
 *
 * A cor é escolhida de uma lista, e não é uma cor livre: as três têm contraste
 * medido contra o texto que pousa nelas, e "escolha qualquer cor" acabaria
 * com vermelho sobre vermelho num exercício em que o desbravador não teria
 * como saber que errou.
 */
export type EstiloCondicional = 'vermelho' | 'amarelo' | 'verde';

export interface RegraCondicional {
  id: string;
  faixa: Faixa;
  quando: 'maiorQue' | 'menorQue' | 'igualA' | 'contemTexto';
  /** O que se compara. Vai como texto porque é o que a caixa do Excel recebe. */
  valor: string;
  estilo: EstiloCondicional;
}

export type TipoDeGrafico = 'pizza' | 'colunas' | 'linha' | 'dispersao';

export interface Grafico {
  tipo: TipoDeGrafico;
  titulo: string;
  /** O que cada eixo representa, escrito. Gráfico sem eixo identificado não afirma nada. */
  eixoX: string;
  eixoY: string;
  /** De onde saem os dados: primeira coluna é o rótulo, segunda é o valor. */
  faixa: Faixa;
}

/**
 * A pasta de trabalho: várias planilhas num arquivo só.
 *
 * É o que o Excel chama de Pasta de Trabalho, e as abas do pé são as planilhas
 * dentro dela. Sete lições num arquivo só é a mesma decisão do `discoDoClube()`
 * da CC-ES001 e do terminal da CC003: quem abre o módulo 6 reencontra o que o
 * módulo 2 deixou, e sete arquivos diferentes ensinariam que cada exercício
 * acontece numa planilha de mentira.
 */
export interface Caderno {
  planilhas: Planilha[];
  ativa: number;
}

export const planilhaAtiva = (cad: Caderno) => cad.planilhas[cad.ativa];

export function trocarAtiva(cad: Caderno, p: Planilha): Caderno {
  return { ...cad, planilhas: cad.planilhas.map((q, i) => (i === cad.ativa ? p : q)) };
}

export const planilhaPorNome = (cad: Caderno, nome: string) =>
  cad.planilhas.find(p => p.nome === nome) ?? null;

export const vazia = (texto = ''): Celula => ({
  texto, h: 'padrao', v: 'abaixo', span: 1, coberta: false, negrito: false, formato: 'geral',
});

/*
  Reexportado do motor, e não escrito de novo aqui: "é número" precisa querer
  dizer a mesma coisa para quem alinha a célula e para quem a soma. Duas
  definições divergiriam no primeiro ajuste, e aí um valor iria para a direita
  sem entrar na conta — que é exatamente o sintoma que o requisito 7 da
  CC-ES003 manda o desbravador diagnosticar.
*/
export { ehNumero };

/** O alinhamento que a célula de fato usa, depois de aplicado o padrão. */
export const alinhamentoDe = (cel: Celula, mostrado: string): Exclude<AlinhaH, 'padrao'> =>
  cel.h !== 'padrao' ? cel.h : (ehNumero(mostrado) ? 'direita' : 'esquerda');

export const LARGURA_PADRAO = 92;
export const ALTURA_PADRAO = 24;

/*
  A grade é maior do que a tabela, e é isso que faz dela uma planilha.

  Ela tinha exatamente o tamanho dos dados — cinco colunas e sete linhas — e o
  resto da janela ficava branco: na tela aparecia uma tabelinha solta num vazio,
  que não é o que ninguém encontra ao abrir Excel, Calc ou Planilhas. A grade do
  programa de verdade vai até a borda da janela e continua rolando.
*/
export const COLUNAS_DA_GRADE = 12;
export const LINHAS_DA_GRADE = 26;

/*
  Onde a tabela acaba.

  Com a grade maior do que os dados, "a tabela" deixou de ser "a planilha
  inteira" — e as tarefas falam da tabela. Ela vai até a última coluna com
  alguma coisa escrita; a coluna vazia do meio continua dentro, que é
  justamente o defeito que a tarefa manda consertar.
*/
export const larguraDaTabela = (p: Planilha): number => {
  let ultima = -1;
  p.celulas.forEach(linha => linha.forEach((cel, c) => {
    if (cel.texto.trim() !== '' && c > ultima) ultima = c;
  }));
  return ultima + 1;
};

export const alturaDaTabela = (p: Planilha): number => {
  let ultima = -1;
  p.celulas.forEach((linha, l) => {
    if (linha.some(cel => cel.texto.trim() !== '') && l > ultima) ultima = l;
  });
  return ultima + 1;
};

/** A1, B3 — o nome que a caixa de nome mostra e que a fórmula usa. */
export const nomeDaCelula = (l: number, c: number) => `${nomeDaColuna(c)}${l + 1}`;

/*
  Uma faixa de células: da âncora, onde o clique começou, até onde ele parou.

  A planilha não tinha faixa nenhuma — só a célula do cursor —, e tudo o que
  precisa de faixa saiu torto por causa disso. Mesclar ia da célula escolhida
  até o fim da linha, porque não havia como dizer "até D1"; a tarefa mandava
  mesclar de A1 até D1, e isso era impossível de fazer na tela. Selecionar uma
  faixa é o gesto mais básico de uma planilha: é assim que se mescla, que se
  soma e que se formata.
*/
export interface Faixa { l1: number; c1: number; l2: number; c2: number }

export const normalizar = (f: Faixa) => ({
  topo: Math.min(f.l1, f.l2), base: Math.max(f.l1, f.l2),
  esq: Math.min(f.c1, f.c2), dir: Math.max(f.c1, f.c2),
});

export const naFaixa = (f: Faixa, l: number, c: number) => {
  const n = normalizar(f);
  return l >= n.topo && l <= n.base && c >= n.esq && c <= n.dir;
};

export const umaCelulaSo = (f: Faixa) => f.l1 === f.l2 && f.c1 === f.c2;

/** A1, ou A1:D1 quando a faixa tem mais de uma célula. */
export const nomeDaFaixa = (f: Faixa) => {
  const n = normalizar(f);
  const inicio = nomeDaCelula(n.topo, n.esq);
  return umaCelulaSo(f) ? inicio : `${inicio}:${nomeDaCelula(n.base, n.dir)}`;
};

/**
 * Resolve o que a célula mostra.
 *
 * Fórmula é o coração do requisito, e por isso ela é calculada de verdade em
 * cima dos valores da grade — e não guardada como número. É essa diferença que
 * a tarefa da soma cobra: mudar um inscrito muda o total sozinho.
 *
 * Quem calcula é `formulas.ts`, e não este arquivo. Ele entendia `=SOMA` e
 * `=MÉDIA` de uma faixa retangular e devolvia `#NOME?` para todo o resto, o
 * que bastava enquanto a AP043 era a única planilha da plataforma. Dois
 * avaliadores de fórmula na mesma base seriam os dois "Word" outra vez: a
 * mesma fórmula daria dois resultados em duas lições.
 */
export function valorDe(p: Planilha, l: number, c: number): string {
  return mostrar(valorDaCelula((li, ci) => p.celulas[li]?.[ci]?.texto ?? '', l, c));
}

/*
  Refaz `coberta` a partir dos `span` gravados, e apara o que não cabe mais.

  Antes isto reescrevia toda mesclagem como "daqui até o fim da linha", porque
  era só isso que dava para mesclar. Agora o span diz quantas colunas a
  mesclagem tem de verdade, e refazer é redesenhar o que ele diz — cortando no
  fim da linha quando a linha encurta, senão o navegador desenha uma célula
  estourando a tabela.
*/
export function refazerMesclagens(celulas: Celula[][]): Celula[][] {
  return celulas.map(linha => {
    const saida = linha.map(c => ({ ...c, coberta: false }));
    for (let i = 0; i < saida.length; i++) {
      saida[i].span = Math.max(1, Math.min(saida[i].span, saida.length - i));
      for (let j = i + 1; j < i + saida[i].span; j++) {
        saida[j].coberta = true;
        saida[j].span = 1;
      }
      i += saida[i].span - 1;
    }
    return saida;
  });
}

/*
  Excluir e inserir coluna, com a mesclagem acompanhando.

  Moram aqui, e não na tela, porque o caso difícil não se vê clicando: tirar
  uma coluna de dentro de um título mesclado tem de encolher a mesclagem em
  um, e não deixá-la com o tamanho antigo sobrando para fora da tabela. É
  exatamente a ordem que o exercício pede — mesclar o título e depois tirar a
  coluna vazia que ficou debaixo dele.
*/
const ajustarSpans = (linha: Celula[], c: number, delta: number) =>
  linha.map((cel, i) => (
    cel.span > 1 && i < c && c < i + cel.span ? { ...cel, span: cel.span + delta } : cel
  ));

export function excluirColunaDe(celulas: Celula[][], c: number): Celula[][] {
  return refazerMesclagens(celulas.map(linha =>
    ajustarSpans(linha, c, -1).filter((_, i) => i !== c)));
}

export function inserirColunaEm(celulas: Celula[][], c: number): Celula[][] {
  return refazerMesclagens(celulas.map(linha => {
    const nova = [...ajustarSpans(linha, c, 1)];
    nova.splice(c, 0, vazia());
    return nova;
  }));
}

/* ── Andar pela grade ─────────────────────────────────────────────────────── */

export type Direcao = 'cima' | 'baixo' | 'esquerda' | 'direita';

const preso = (n: number, teto: number) => Math.max(0, Math.min(teto, n));

/**
 * Move o cursor, ou estende a faixa quando `estendendo`.
 *
 * Estender mexe só no foco e deixa a âncora onde está — é o que o Shift+seta
 * faz no Excel, e é por isso que a faixa cresce e encolhe a partir de onde a
 * seleção começou, e não a partir da última célula visitada.
 */
export function mover(
  p: Planilha, f: Faixa, direcao: Direcao, estendendo = false,
): Faixa {
  const dl = direcao === 'cima' ? -1 : direcao === 'baixo' ? 1 : 0;
  const dc = direcao === 'esquerda' ? -1 : direcao === 'direita' ? 1 : 0;
  const l = preso((estendendo ? f.l2 : f.l1) + dl, p.celulas.length - 1);
  const c = preso((estendendo ? f.c2 : f.c1) + dc, p.celulas[0].length - 1);
  return estendendo
    ? { ...f, l2: l, c2: c }
    : { l1: l, c1: c, l2: l, c2: c };
}

/** Tab e Enter: anda uma célula e nunca estende — como no Excel. */
export const proxima = (p: Planilha, f: Faixa, direcao: Direcao): Faixa =>
  mover(p, { l1: f.l1, c1: f.c1, l2: f.l1, c2: f.c1 }, direcao);

/* ── Escrever e limpar ────────────────────────────────────────────────────── */

export function escrever(p: Planilha, l: number, c: number, texto: string): Planilha {
  return {
    ...p,
    celulas: p.celulas.map((linha, i) => (i !== l ? linha : linha.map((cel, j) => (
      j === c ? { ...cel, texto } : cel)))),
  };
}

/**
 * Limpa o conteúdo da faixa, e só o conteúdo.
 *
 * Delete no Excel apaga o que está escrito e deixa a formatação de pé — quem
 * apertou Delete não pediu para perder o negrito nem a mesclagem. Limpar tudo
 * é outro item do menu, e não é este.
 */
export function limpar(p: Planilha, f: Faixa): Planilha {
  const a = normalizar(f);
  return {
    ...p,
    celulas: p.celulas.map((linha, l) => (l < a.topo || l > a.base ? linha : linha.map((cel, c) => (
      c >= a.esq && c <= a.dir ? { ...cel, texto: '' } : cel)))),
  };
}

/* ── Área de transferência ────────────────────────────────────────────────── */

export type Recorte = { celulas: Celula[][] };

export function copiar(p: Planilha, f: Faixa): Recorte {
  const a = normalizar(f);
  return {
    celulas: p.celulas.slice(a.topo, a.base + 1)
      .map(linha => linha.slice(a.esq, a.dir + 1).map(cel => ({ ...cel }))),
  };
}

/**
 * Cola a partir do canto de cima e da esquerda da faixa.
 *
 * O recorte é colado inteiro, e não recortado pelo tamanho da seleção: no
 * Excel, copiar quatro células e colar com uma só selecionada escreve as
 * quatro. O que não cabe na grade é descartado, que também é o que ele faz.
 */
export function colar(p: Planilha, f: Faixa, recorte: Recorte): Planilha {
  const a = normalizar(f);
  const celulas = p.celulas.map(linha => linha.map(cel => ({ ...cel })));
  recorte.celulas.forEach((linha, dl) => linha.forEach((cel, dc) => {
    const l = a.topo + dl;
    const c = a.esq + dc;
    if (l < celulas.length && c < celulas[l].length) celulas[l][c] = { ...cel };
  }));
  return { ...p, celulas: refazerMesclagens(celulas) };
}

/* ── Linhas e colunas ─────────────────────────────────────────────────────── */

export function inserirLinha(p: Planilha, l: number): Planilha {
  const celulas = [...p.celulas];
  celulas.splice(l, 0, p.celulas[0].map(() => vazia()));
  const alturas = [...p.alturas];
  alturas.splice(l, 0, ALTURA_PADRAO);
  return { ...p, celulas, alturas };
}

export function excluirLinha(p: Planilha, l: number): Planilha | null {
  /* A grade não pode ficar sem linha nenhuma: uma planilha vazia de linhas não
     existe no Excel, e aqui deixaria a tela sem onde clicar. */
  if (p.celulas.length <= 2) return null;
  return {
    ...p,
    celulas: p.celulas.filter((_, i) => i !== l),
    alturas: p.alturas.filter((_, i) => i !== l),
  };
}

export function inserirColuna(p: Planilha, c: number): Planilha {
  const larguras = [...p.larguras];
  larguras.splice(c, 0, LARGURA_PADRAO);
  return { ...p, celulas: inserirColunaEm(p.celulas, c), larguras };
}

export function excluirColuna(p: Planilha, c: number): Planilha | null {
  if (p.celulas[0].length <= 2) return null;
  return {
    ...p,
    celulas: excluirColunaDe(p.celulas, c),
    larguras: p.larguras.filter((_, i) => i !== c),
  };
}

/* ── Mesclar ──────────────────────────────────────────────────────────────── */

/** Diz se a mesclagem apagaria conteúdo — o Excel avisa antes de fazer isso. */
export function mesclagemApaga(p: Planilha, f: Faixa): boolean {
  const a = normalizar(f);
  return p.celulas.slice(a.topo, a.base + 1)
    .some(l => l.slice(a.esq + 1, a.dir + 1).some(c => c.texto.trim() !== ''));
}

export function mesclar(p: Planilha, f: Faixa): Planilha | null {
  const a = normalizar(f);
  const largura = a.dir - a.esq + 1;
  if (largura < 2) return null;
  return {
    ...p,
    celulas: refazerMesclagens(p.celulas.map((linha, l) => (
      l < a.topo || l > a.base ? linha : linha.map((cel, c) => {
        if (c === a.esq) return { ...cel, span: largura, h: 'centro' as const };
        if (c > a.esq && c <= a.dir) return { ...cel, coberta: true, texto: '' };
        return cel;
      })
    ))),
  };
}

export function desmesclar(p: Planilha, f: Faixa): Planilha {
  const a = normalizar(f);
  return {
    ...p,
    celulas: p.celulas.map((linha, l) => (
      l < a.topo || l > a.base ? linha : linha.map(cel => ({ ...cel, span: 1, coberta: false })))),
  };
}

/* ── Desfazer e refazer ───────────────────────────────────────────────────── */

/*
  Ctrl+Z é a tecla que se aperta sem pensar, e uma planilha que não a tem
  ensina a ter medo de experimentar. Ela importa mais aqui do que num programa
  qualquer: uma das tarefas manda mesclar e desmesclar *para ver o que a
  mesclagem faz*, e mesclar apaga conteúdo. Sem desfazer, experimentar custa.
*/
export interface Historico {
  passado: Planilha[];
  presente: Planilha;
  futuro: Planilha[];
}

/** Quantos passos o histórico guarda. Fundo infinito guardaria a sessão toda. */
export const PASSOS_GUARDADOS = 40;

export const historicoDe = (p: Planilha): Historico =>
  ({ passado: [], presente: p, futuro: [] });

export function registrar(h: Historico, novo: Planilha): Historico {
  return {
    passado: [...h.passado, h.presente].slice(-PASSOS_GUARDADOS),
    presente: novo,
    /* Fazer alguma coisa depois de desfazer descarta o que havia à frente —
       senão refazer devolveria um estado que não é mais o que veio depois. */
    futuro: [],
  };
}

export function desfazer(h: Historico): Historico {
  if (h.passado.length === 0) return h;
  return {
    passado: h.passado.slice(0, -1),
    presente: h.passado[h.passado.length - 1],
    futuro: [h.presente, ...h.futuro],
  };
}

export function refazer(h: Historico): Historico {
  if (h.futuro.length === 0) return h;
  return {
    passado: [...h.passado, h.presente],
    presente: h.futuro[0],
    futuro: h.futuro.slice(1),
  };
}

/* ── O que a planilha esconde, pinta e reordena ───────────────────────────── */

/*
  Filtro esconde linha; nunca apaga nenhuma. É o mal-entendido que custa caro,
  e é por isso que ele é uma pergunta sobre a **tela** e não sobre os dados: a
  linha continua ali, a `SOMA` continua somando-a, e quem lê o total sem saber
  disso manda para a liderança um número que não corresponde ao que está vendo.
*/
export function linhaEscondida(p: Planilha, linha: number): boolean {
  if (!p.filtro || !p.tabela || p.filtro.valor === '') return false;
  const n = normalizar(p.tabela);
  /* O cabeçalho nunca some: sem ele não haveria onde clicar para tirar o
     filtro, e a tabela ficaria escondida para sempre. */
  if (linha <= n.topo || linha > n.base) return false;
  const texto = p.celulas[linha]?.[p.filtro.coluna]?.texto ?? '';
  return texto.trim() !== p.filtro.valor;
}

/** O valor calculado da célula — a porta pela qual a planilha fala com o motor. */
export const valorDaGrade = (p: Planilha, l: number, c: number): Valor =>
  valorDaCelula((li, ci) => p.celulas[li]?.[ci]?.texto ?? '', l, c);

/**
 * A cor que uma regra de formatação condicional pinta nesta célula.
 *
 * A última regra que casa é a que vale, como no Excel: regras se empilham, e a
 * de baixo ganha. Devolver a primeira faria a regra recém-criada não pintar
 * nada, e quem acabou de criá-la concluiria que ela não funciona.
 */
export function estiloCondicional(p: Planilha, l: number, c: number): EstiloCondicional | null {
  let achou: EstiloCondicional | null = null;
  for (const r of p.regras) {
    if (!naFaixa(r.faixa, l, c)) continue;
    if (regraCasa(p, r, l, c)) achou = r.estilo;
  }
  return achou;
}

function regraCasa(p: Planilha, r: RegraCondicional, l: number, c: number): boolean {
  /*
    Regra sem valor de comparação não casa com nada.

    É "zero link não é zero link quebrado" aplicado à formatação condicional, e
    o estrago é grande porque `Number('')` é **zero**, e não NaN: uma regra
    "maior que" com o campo em branco pintaria toda célula positiva da faixa, e
    uma regra "igual a" em branco pintaria todas as vazias. Nos dois casos a
    planilha fica colorida e a pessoa conclui que a regra funcionou.
  */
  if (r.valor.trim() === '') return false;

  const v = valorDaGrade(p, l, c);
  /*
    Célula com erro fica de fora: uma regra sobre texto não é sobre `#DIV/0!`.
    Sem isto, "contém DIV" pegaria toda célula com divisão por zero, e a
    pessoa que escreveu a regra para achar "Divisão de tarefas" veria pintada
    uma célula que não tem essa palavra em lugar nenhum. O Excel trata erro
    numa regra própria, e aqui ele simplesmente não casa.
  */
  if (v.tipo === 'erro') return false;

  if (r.quando === 'contemTexto') {
    const t = mostrar(v).toLocaleLowerCase('pt-BR');
    return t.includes(r.valor.toLocaleLowerCase('pt-BR'));
  }

  const alvo = Number(r.valor.replace(',', '.'));
  /*
    A célula vazia vale **zero** na comparação numérica, e isso é o Excel.

    A primeira versão daqui a excluía, e estava errada nos dois sentidos: era
    código morto — a guarda de valor em branco, logo acima, já cobria tudo o
    que ela alcançava — e era mentira sobre o programa. No Excel, "menor que
    10" pinta a metade em branco da coluna, e é uma das reclamações mais
    antigas que a formatação condicional tem.

    Simulação que "conserta" isso ensina errado: o desbravador aplicaria a
    mesma regra no computador do clube e veria a coluna acender inteira, sem
    nada aqui tendo avisado. A lição de módulo 5 nomeia o caso — a faixa da
    regra vai até a última linha com dado, e não até o fim da coluna.
  */
  if (v.tipo !== 'numero' && v.tipo !== 'vazio') {
    return r.quando === 'igualA' && mostrar(v) === r.valor;
  }
  if (Number.isNaN(alvo)) return false;
  const n = v.tipo === 'numero' ? v.n : 0;
  if (r.quando === 'maiorQue') return n > alvo;
  if (r.quando === 'menorQue') return n < alvo;
  return n === alvo;
}

/**
 * Ordena as linhas da tabela por uma coluna.
 *
 * Ordenar **mexe nos dados**, ao contrário de filtrar e de congelar: a linha
 * troca de lugar de verdade, e é por isso que ordenar só metade de uma tabela
 * embaralha um cadastro inteiro — o nome de uma pessoa passa a ficar ao lado
 * do telefone de outra. Por isso ela anda sempre com a linha inteira, e por
 * isso `tabela` é declarada em vez de adivinhada.
 */
export function ordenar(p: Planilha, coluna: number, crescente: boolean): Planilha {
  if (!p.tabela) return p;
  const n = normalizar(p.tabela);
  const primeira = n.topo + 1;
  if (primeira > n.base) return p;

  const corpo = p.celulas.slice(primeira, n.base + 1);
  const chave = (linha: Celula[]) => {
    const texto = linha[coluna]?.texto ?? '';
    /* `numeroDoTexto` e não uma conversão escrita aqui: "é número" precisa
       querer dizer a mesma coisa para quem ordena e para quem soma. */
    return { num: numeroDoTexto(texto), texto };
  };
  const ordenado = [...corpo].sort((a, b) => {
    const ka = chave(a);
    const kb = chave(b);
    const d = ka.num !== null && kb.num !== null
      ? ka.num - kb.num
      : ka.texto.localeCompare(kb.texto, 'pt-BR', { sensitivity: 'accent' });
    return crescente ? d : -d;
  });

  return {
    ...p,
    celulas: p.celulas.map((linha, i) => (i >= primeira && i <= n.base ? ordenado[i - primeira] : linha)),
    ordenacao: { coluna, crescente },
  };
}

/**
 * A alça de preenchimento: copia a célula de origem para baixo.
 *
 * É o gesto que faz a referência relativa significar alguma coisa. Sem ele,
 * "relativa" e "absoluta" são duas palavras que se decoram e se trocam na
 * prova; com ele, a fórmula anda na frente de quem arrasta e o `$` passa a ter
 * um efeito que se vê.
 */
export function preencherAbaixo(p: Planilha, origem: { l: number; c: number }, ate: number): Planilha {
  const base = p.celulas[origem.l]?.[origem.c];
  if (!base || ate <= origem.l) return p;
  return {
    ...p,
    celulas: p.celulas.map((linha, i) => (i > origem.l && i <= ate
      ? linha.map((cel, j) => (j === origem.c
        ? { ...base, texto: transporFormula(base.texto, i - origem.l, 0) }
        : cel))
      : linha)),
  };
}

/**
 * A mesma alça, arrastada para o lado.
 *
 * Existe porque a linha de totais do orçamento se preenche assim, e porque
 * arrastar só para baixo ensinaria que a alça tem uma direção só. Aqui quem
 * anda é a **coluna** da referência, e é por isso que o cifrão que importa
 * muda de lado: descendo, trava-se a linha; indo para o lado, trava-se a
 * coluna.
 */
export function preencherADireita(p: Planilha, origem: { l: number; c: number }, ate: number): Planilha {
  const base = p.celulas[origem.l]?.[origem.c];
  if (!base || ate <= origem.c) return p;
  return {
    ...p,
    celulas: p.celulas.map((linha, i) => (i !== origem.l
      ? linha
      : linha.map((cel, j) => (j > origem.c && j <= ate
        ? { ...base, texto: transporFormula(base.texto, 0, j - origem.c) }
        : cel)))),
  };
}
