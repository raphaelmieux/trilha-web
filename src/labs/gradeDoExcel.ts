/**
 * A grade do Excel, controlada: seleção, edição, teclado e área de
 * transferência.
 *
 * ── Por que ela saiu dos laboratórios ────────────────────────────────────
 * `excel.tsx` já guardava as peças **sem estado** — como uma célula se
 * desenha, onde ficam as alças, o que a faixa selecionada mostra —, e essa
 * divisão está certa: uma grade com seleção própria obrigaria os dois lados a
 * concordar sobre a mesma célula ativa. O que ficou de fora foi o
 * **comportamento**: arrastar para selecionar, digitar por cima, andar de seta,
 * Ctrl+C. Isso estava escrito duas vezes, uma em `PlanilhaLab` e outra em
 * `LaboratorioDePlanilha`.
 *
 * E as duas **já tinham divergido**. O laboratório da AP043 tem Ctrl+C, Ctrl+X
 * e Ctrl+V; o da CC-ES003 não tem nenhum dos três. Quem aprendeu a copiar e
 * colar na trilha chegava na vereda, apertava Ctrl+C, e nada acontecia — sem
 * erro, sem aviso, e sem nada na tela dizendo que ali não existe. É exatamente
 * o defeito que `excel.tsx` existe para impedir, um andar acima.
 *
 * ── E por que é um gancho, e não uma grade com estado ────────────────────
 * O estado continua sendo do laboratório: é ele quem guarda a pasta de
 * trabalho e o histórico, e toda mudança passa pelo `mudar` que ele entrega —
 * que é o que faz o Ctrl+Z alcançar todas. O gancho guarda só o que é do
 * **gesto**: onde está a seleção, o que está sendo digitado, de onde o arrasto
 * começou. É o arranjo de `useAtalhosDoExplorador` em `selecao.ts`, pelo motivo
 * escrito lá.
 */

import { useRef, useState } from 'react';
import type React from 'react';
import {
  type Direcao, type Faixa, type Planilha, type Recorte,
  ALTURA_PADRAO, LARGURA_PADRAO,
  colar as colarEm, copiar as copiarFaixa, escrever, limpar, mover, normalizar,
  preencherAbaixo, preencherADireita, proxima, valorDaGrade,
} from './planilha';
import { mostrar } from './formulas';

export interface UsoDaGrade {
  /** A planilha à vista. Quem a guarda é o laboratório. */
  planilha: Planilha;
  /** Toda mudança passa por aqui, e é por isso que o Ctrl+Z alcança todas. */
  mudar: (f: (p: Planilha) => Planilha) => void;
  desfazer: () => void;
  refazer: () => void;
  /** Recado passageiro para a moldura. Sem ele, os gestos que avisam ficam mudos. */
  avisar?: (texto: string) => void;
  /**
   * Por que uma célula não aceita escrita, quando não aceita.
   *
   * Devolve a frase que o programa diria, ou `null` quando a célula é livre.
   * Quem a passa é o laboratório que tem área protegida — hoje só o da
   * CC-ES008, por causa do relatório de tabela dinâmica, que no Excel recusa
   * a edição com todas as letras. Sem a guarda, digitar ali grava por baixo
   * do resumo: o texto entra na célula, o resumo continua desenhado por cima,
   * e o que foi escrito não aparece em lugar nenhum.
   *
   * Ela **avisa em vez de agir**, que é a decisão do "selecione primeiro" do
   * laboratório de Word e do Aceitar sem marca escolhida do de revisão.
   */
  celulaProtegida?: (l: number, c: number) => string | null;
}

/**
 * O que o gancho devolve.
 *
 * `props` é o núcleo que toda grade precisa; o que é opcional em
 * `PropsDaGradeDoExcel` — a alça de preenchimento, a setinha do filtro, o menu
 * do botão direito — fica de fora de propósito, para o laboratório decidir. É a
 * regra do `aoBuscar` do Explorador: a peça existe quando a lição tem o que
 * fazer com ela.
 */
export interface GradeControlada {
  faixa: Faixa;
  setFaixa: React.Dispatch<React.SetStateAction<Faixa>>;
  /** A célula ativa: o canto de onde a faixa nasceu. */
  sel: { l: number; c: number };
  barra: string;
  setBarra: React.Dispatch<React.SetStateAction<string>>;
  editando: 'celula' | 'barra' | null;
  setEditando: React.Dispatch<React.SetStateAction<'celula' | 'barra' | null>>;
  gradeRef: React.RefObject<HTMLDivElement>;
  recorte: Recorte | null;

  selecionar: (l: number, c: number) => void;
  selecionarFaixa: (f: Faixa) => void;
  confirmar: (texto: string, andarPara?: Direcao) => void;
  cancelarEdicao: () => void;

  /**
   * Desfazer e refazer, passando aqui antes de chegar ao histórico.
   *
   * O histórico é do laboratório, mas a edição em curso é do gancho, e voltar
   * o conteúdo deixando o campo aberto por cima dele mostra o rascunho de
   * antes sobre a célula de depois. Os dois laboratórios chamavam o histórico
   * direto do botão da faixa, e só um deles fechava a edição — divergência que
   * não estoura e que a tela mostra errada.
   */
  desfazer: () => void;
  refazer: () => void;

  copiar: () => void;
  recortar: () => void;
  colar: () => void;
  limparConteudo: () => void;

  aoTeclar: (e: React.KeyboardEvent) => void;
  /** As alças de tamanho do cabeçalho. O laboratório decide se as oferece. */
  aoArrastarBorda: (tipo: 'coluna' | 'linha', indice: number, e: React.PointerEvent) => void;
  aoAjustarAoConteudo: (tipo: 'coluna' | 'linha', indice: number) => void;
  /** O começo do arrasto da alça de preenchimento. Idem. */
  aoComecarPreenchimento: (origem: { l: number; c: number }) => void;

  /**
   * O que a barra de fórmulas precisa, montado aqui dentro.
   *
   * Ela não é da grade — é da janela —, mas divide com ela o estado da edição:
   * é a mesma `barra`, o mesmo `editando` e a mesma guarda de cancelamento.
   * Escrever a barra por fora custaria justamente essa guarda: sem ela, sair do
   * campo depois de um Esc **grava** o que o Esc acabou de descartar.
   */
  propsDaBarra: {
    value: string;
    onFocus: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onBlur: () => void;
  };

  props: {
    planilha: Planilha;
    faixa: Faixa;
    ativa: { l: number; c: number };
    rascunho: string | null;
    gradeRef: React.RefObject<HTMLDivElement>;
    aoTeclar: (e: React.KeyboardEvent) => void;
    aoApontarCelula: (l: number, c: number, e: React.PointerEvent) => void;
    aoEntrarNaCelula: (l: number, c: number) => void;
    aoApontarColuna: (c: number, e: React.PointerEvent) => void;
    aoApontarLinha: (l: number, e: React.PointerEvent) => void;
    aoMoverPonteiro: (e: React.PointerEvent) => void;
    aoSoltarPonteiro: () => void;
    aoSairDaGrade: () => void;
    aoAbrirEdicao: (texto: string) => void;
    aoEscrever: (texto: string) => void;
    aoConfirmar: (texto: string, direcao?: Direcao) => void;
    aoCancelar: () => void;
  };
}

const texto = (p: Planilha, l: number, c: number) => p.celulas[l]?.[c]?.texto ?? '';

export function useGradeDoExcel({
  planilha: p, mudar, desfazer: desfazerHist, refazer: refazerHist, avisar,
  celulaProtegida,
}: UsoDaGrade): GradeControlada {
  const [faixa, setFaixa] = useState<Faixa>({ l1: 0, c1: 0, l2: 0, c2: 0 });
  const [arrastandoFaixa, setArrastandoFaixa] = useState(false);
  /* De onde a alça de preenchimento começou a ser arrastada, se estiver. */
  const [preenchendo, setPreenchendo] = useState<{ l: number; c: number } | null>(null);
  const [barra, setBarra] = useState(() => texto(p, 0, 0));
  /*
    Onde a edição começou. Era um booleano na primeira versão da AP043, e foi
    ele o defeito: escrever na barra ligava o modo de edição, a célula ganhava
    um campo com autoFocus, e esse campo roubava o foco a cada tecla.
  */
  const [editando, setEditando] = useState<'celula' | 'barra' | null>(null);
  const [recorte, setRecorte] = useState<Recorte | null>(null);
  const gradeRef = useRef<HTMLDivElement>(null);
  /*
    A edição já foi resolvida, e o blur que vem atrás não a resolve de novo.

    O campo da célula grava no blur — o que está certo, porque no Excel clicar
    noutra célula durante a edição grava o que foi escrito. Só que Enter, Tab e
    Esc devolvem o foco à grade logo depois de resolver a edição, e esse foco
    dispara o blur do campo que ainda está montado: o Esc gravava exatamente o
    que acabara de descartar, e o Enter gravava a mesma coisa duas vezes,
    empilhando dois passos de histórico idênticos — quem escrevia numa célula e
    apertava Ctrl+Z via a planilha não mudar, e concluía que o desfazer não
    funciona.

    É um ref e não um estado porque o blur roda antes de qualquer
    re-renderização: um estado ainda estaria com o valor velho quando ele lê.
  */
  const jaResolvida = useRef(false);
  const arrasto = useRef<{ tipo: 'coluna' | 'linha'; indice: number; inicio: number; base: number } | null>(null);

  const sel = { l: faixa.l1, c: faixa.c1 };

  /* ── Seleção e escrita ─────────────────────────────────────────────────── */

  const selecionar = (l: number, c: number) => {
    setFaixa({ l1: l, c1: c, l2: l, c2: c });
    setBarra(texto(p, l, c));
    setEditando(null);
  };

  const selecionarFaixa = (f: Faixa) => {
    setFaixa(f);
    setBarra(texto(p, f.l1, f.c1));
    setEditando(null);
  };

  /** A frase de recusa da faixa inteira, ou `null` se toda ela aceita escrita. */
  const recusaDaFaixa = (f: Faixa): string | null => {
    if (!celulaProtegida) return null;
    const n = normalizar(f);
    for (let l = n.topo; l <= n.base; l++) {
      for (let c = n.esq; c <= n.dir; c++) {
        const porque = celulaProtegida(l, c);
        if (porque) return porque;
      }
    }
    return null;
  };

  const confirmar = (valor: string, andarPara?: Direcao) => {
    const porque = celulaProtegida?.(sel.l, sel.c);
    if (porque) {
      avisar?.(porque);
      setEditando(null);
      setBarra(texto(p, sel.l, sel.c));
      return;
    }
    mudar(q => escrever(q, sel.l, sel.c, valor));
    setEditando(null);
    if (andarPara) {
      const destino = proxima(p, faixa, andarPara);
      setFaixa(destino);
      setBarra(texto(p, destino.l1, destino.c1));
    } else {
      setBarra(valor);
    }
  };

  const cancelarEdicao = () => {
    jaResolvida.current = true;
    setEditando(null);
    setBarra(texto(p, sel.l, sel.c));
  };

  /* ── Área de transferência ─────────────────────────────────────────────── */

  const copiar = () => setRecorte(copiarFaixa(p, faixa));

  const recortar = () => {
    setRecorte(copiarFaixa(p, faixa));
    mudar(q => limpar(q, faixa));
  };

  const colar = () => {
    if (!recorte) {
      avisar?.('Não há nada copiado ainda. Selecione as células e use Copiar, ou Ctrl+C.');
      return;
    }
    const porque = recusaDaFaixa({
      l1: faixa.l1, c1: faixa.c1,
      l2: faixa.l1 + recorte.celulas.length - 1,
      c2: faixa.c1 + (recorte.celulas[0]?.length ?? 1) - 1,
    });
    if (porque) { avisar?.(porque); return; }
    mudar(q => colarEm(q, faixa, recorte));
  };

  const limparConteudo = () => {
    const porque = recusaDaFaixa(faixa);
    if (porque) { avisar?.(porque); return; }
    mudar(q => limpar(q, faixa));
    setBarra('');
  };

  const desfazer = () => { setEditando(null); desfazerHist(); };
  const refazer = () => { setEditando(null); refazerHist(); };

  /* ── O teclado do Excel ────────────────────────────────────────────────── */

  const aoTeclar = (e: React.KeyboardEvent) => {
    /*
      Editando, o teclado é do campo de texto — menos o Escape, que continua
      sendo da planilha. As demais teclas chegam aqui vindas do campo da
      célula, e devolvê-las à grade faria a seta andar enquanto se digita.
    */
    if (editando) {
      if (e.key === 'Escape') { e.preventDefault(); cancelarEdicao(); }
      return;
    }

    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl) {
      const k = e.key.toLowerCase();
      if (k === 'c') { e.preventDefault(); copiar(); return; }
      if (k === 'x') { e.preventDefault(); recortar(); return; }
      if (k === 'v') { e.preventDefault(); colar(); return; }
      if (k === 'z') { e.preventDefault(); desfazer(); return; }
      if (k === 'y') { e.preventDefault(); refazer(); return; }
      return;
    }

    const setas: Record<string, Direcao> = {
      ArrowUp: 'cima', ArrowDown: 'baixo', ArrowLeft: 'esquerda', ArrowRight: 'direita',
    };
    if (setas[e.key]) {
      e.preventDefault();
      const destino = mover(p, faixa, setas[e.key], e.shiftKey);
      setFaixa(destino);
      /* Com Shift a faixa cresce e a âncora fica: a barra continua mostrando a
         célula de onde a seleção partiu, que é o que o Excel mostra. */
      if (!e.shiftKey) setBarra(texto(p, destino.l1, destino.c1));
      return;
    }

    if (e.key === 'Enter') { e.preventDefault(); selecionarFaixa(proxima(p, faixa, e.shiftKey ? 'cima' : 'baixo')); return; }
    if (e.key === 'Tab') { e.preventDefault(); selecionarFaixa(proxima(p, faixa, e.shiftKey ? 'esquerda' : 'direita')); return; }
    if (e.key === 'F2') { e.preventDefault(); setBarra(texto(p, sel.l, sel.c)); setEditando('celula'); return; }
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); limparConteudo(); return; }
    if (e.key === 'Escape') { e.preventDefault(); cancelarEdicao(); return; }

    /* Digitar sobre a célula selecionada substitui o conteúdo — o gesto mais
       usado do programa, e o que não existia na primeira versão da AP043. */
    if (!e.altKey && e.key.length === 1) {
      e.preventDefault();
      setBarra(e.key);
      setEditando('celula');
    }
  };

  /* ── Arrastar a borda do cabeçalho ─────────────────────────────────────── */

  const aoArrastarBorda = (tipo: 'coluna' | 'linha', indice: number, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    /*
      A alça captura o ponteiro: sem isso, arrastar depressa até fora da grade
      interrompe o redimensionamento no meio, e a coluna para numa largura que
      ninguém escolheu. O jsdom não implementa `setPointerCapture`, e chamá-lo
      lá estoura — é a mesma mentira do `pointerenter` que o React não escuta.
    */
    const alca = e.currentTarget as HTMLElement;
    if (typeof alca.setPointerCapture === 'function') alca.setPointerCapture(e.pointerId);
    arrasto.current = {
      tipo, indice,
      inicio: tipo === 'coluna' ? e.clientX : e.clientY,
      base: tipo === 'coluna' ? p.larguras[indice] : p.alturas[indice],
    };
  };

  const moverArrasto = (e: React.PointerEvent) => {
    const a = arrasto.current;
    if (!a) return;
    const delta = (a.tipo === 'coluna' ? e.clientX : e.clientY) - a.inicio;
    const minimo = a.tipo === 'coluna' ? 28 : 16;
    const valor = Math.max(minimo, Math.round(a.base + delta));
    mudar(q => (a.tipo === 'coluna'
      ? { ...q, larguras: q.larguras.map((w, i) => (i === a.indice ? valor : w)) }
      : { ...q, alturas: q.alturas.map((h, i) => (i === a.indice ? valor : h)) }));
  };

  /*
    Dois cliques na borda ajustam ao conteúdo, como no Excel.

    Sete pixels por caractere é a medida da fonte da grade, e as duas margens de
    cinco são o padding da célula — os mesmos números que a tarefa do módulo 1
    da CC-ES003 usa para saber se o nome mais comprido cabe.
  */
  const aoAjustarAoConteudo = (tipo: 'coluna' | 'linha', indice: number) => {
    if (tipo === 'linha') {
      mudar(q => ({ ...q, alturas: q.alturas.map((h, i) => (i === indice ? ALTURA_PADRAO : h)) }));
      return;
    }
    const maior = p.celulas.reduce(
      (a, linha, l) => Math.max(a, mostrar(valorDaGrade(p, l, indice), linha[indice]?.formato).length),
      0);
    mudar(q => ({
      ...q,
      larguras: q.larguras.map((w, i) => (i === indice ? Math.max(LARGURA_PADRAO, maior * 7 + 10) : w)),
    }));
  };

  /* ── A alça de preenchimento ───────────────────────────────────────────── */

  const soltarPreenchimento = () => {
    if (!preenchendo) return;
    const origem = preenchendo;
    setPreenchendo(null);
    const n = normalizar(faixa);
    const desceu = n.base - origem.l;
    const andou = n.dir - origem.c;
    if (desceu <= 0 && andou <= 0) return;
    /* Arrastar na diagonal é um gesto que o Excel resolve de um jeito só:
       vale o lado que andou mais. Adivinhar o outro faria a coluna aparecer
       preenchida onde ninguém pediu. */
    if (desceu >= andou) mudar(q => preencherAbaixo(q, origem, n.base));
    else mudar(q => preencherADireita(q, origem, n.dir));
  };

  return {
    faixa, setFaixa, sel, barra, setBarra, editando, setEditando, gradeRef, recorte,
    selecionar, selecionarFaixa, confirmar, cancelarEdicao, desfazer, refazer,
    copiar, recortar, colar, limparConteudo,
    aoTeclar, aoArrastarBorda, aoAjustarAoConteudo,
    aoComecarPreenchimento: setPreenchendo,
    propsDaBarra: {
      value: editando ? barra : texto(p, sel.l, sel.c),
      onFocus: () => setEditando('barra'),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setBarra(e.target.value),
      onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') { e.preventDefault(); confirmar(barra, 'baixo'); gradeRef.current?.focus(); }
        if (e.key === 'Escape') { e.preventDefault(); cancelarEdicao(); gradeRef.current?.focus(); }
      },
      /*
        Sair da barra é desistir, e não gravar — gravar é Enter, como no Excel.

        Um onBlur que grava transforma um clique acidental numa alteração que
        ninguém pediu, e foi assim que a primeira versão da AP043 gravava uma
        letra sozinha a cada tecla. A guarda do `jaResolvida` continua existindo
        para o campo *da célula*, que grava no blur de propósito: lá, clicar
        noutra célula no meio da edição grava, como no programa de verdade. E é
        por causa dela que o blur daqui a baixa: o Esc na barra a levanta e
        depois devolve o foco à grade, e uma bandeira esquecida de pé engoliria
        a gravação da próxima célula editada.
      */
      onBlur: () => {
        jaResolvida.current = false;
        setEditando(e => (e === 'barra' ? null : e));
      },
    },
    props: {
      planilha: p,
      faixa,
      ativa: sel,
      rascunho: editando === 'celula' ? barra : null,
      gradeRef,
      aoTeclar,
      aoApontarCelula: (l, c, e) => {
        gradeRef.current?.focus();
        if (e.button !== 0) return;
        if (e.shiftKey) { setFaixa(f => ({ ...f, l2: l, c2: c })); return; }
        selecionar(l, c);
        setArrastandoFaixa(true);
      },
      aoEntrarNaCelula: (l, c) => {
        if (preenchendo) { setFaixa(f => ({ ...f, l2: l, c2: c })); return; }
        if (arrastandoFaixa) setFaixa(f => ({ ...f, l2: l, c2: c }));
      },
      aoApontarColuna: (c, e) => {
        if (e.button !== 0) return;
        gradeRef.current?.focus();
        setFaixa({ l1: 0, c1: c, l2: p.celulas.length - 1, c2: c });
      },
      aoApontarLinha: (l, e) => {
        if (e.button !== 0) return;
        gradeRef.current?.focus();
        setFaixa({ l1: l, c1: 0, l2: l, c2: p.celulas[0].length - 1 });
      },
      aoMoverPonteiro: moverArrasto,
      aoSoltarPonteiro: () => {
        arrasto.current = null;
        setArrastandoFaixa(false);
        soltarPreenchimento();
      },
      aoSairDaGrade: () => setArrastandoFaixa(false),
      aoAbrirEdicao: (t) => { setBarra(t); setEditando('celula'); },
      aoEscrever: setBarra,
      aoConfirmar: (t, direcao) => {
        if (jaResolvida.current) { jaResolvida.current = false; return; }
        /* Enter e Tab confirmam *e* saem da célula, e é a saída que dispara o
           blur de logo depois. Blur sozinho — clicar noutra célula no meio da
           edição — não levanta a bandeira, e grava, como no Excel. */
        if (direcao) jaResolvida.current = true;
        confirmar(t, direcao);
      },
      aoCancelar: cancelarEdicao,
    },
  };
}

