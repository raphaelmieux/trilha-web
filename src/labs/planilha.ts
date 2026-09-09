import {
  vazia, refazerMesclagens, excluirColunaDe, inserirColunaEm, normalizar,
  LARGURA_PADRAO, ALTURA_PADRAO,
  type Planilha, type Celula, type Faixa,
} from './metasDaAp043';

/*
 * O que a planilha faz, sem tela nenhuma.
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
