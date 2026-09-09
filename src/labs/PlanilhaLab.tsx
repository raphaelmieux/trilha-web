import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlignLeft, AlignCenter, AlignRight, ChevronsUp, ChevronsDown, Minus,
  Combine, Split, Rows3, Trash2, Table2, Paintbrush, Grid2x2,
  Sigma, FileCheck2, RotateCcw, X, Bold, Percent, Palette,
  ChevronDown, Ruler, Copy, ClipboardPaste, Scissors, Eraser, Undo2, Redo2,
  Italic, Underline, PaintBucket,
} from 'lucide-react';
import LaboratorioEmTelaCheia from '../components/LaboratorioEmTelaCheia';
import {
  upsertRequirementProgress, getRequirementId, getSpecialtyId,
  ensureEnrollment, updateEnrollmentActivity, logActivity,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import type { PropsDeLaboratorio as Props } from './tipos';
import {
  PLANILHA_INICIAL, ALTURA_PADRAO, METAS_DA_PLANILHA as METAS,
  nomeDaCelula, valorDe, alinhamentoDe, ehNumero,
  normalizar, naFaixa, umaCelulaSo, nomeDaFaixa, larguraDaTabela, alturaDaTabela,
  type Planilha, type AlinhaH, type AlinhaV, type Faixa,
} from './metasDaAp043';
import {
  mover, proxima, escrever as escreverEm, limpar, copiar as copiarFaixa, colar as colarEm,
  inserirLinha as inserirLinhaEm, excluirLinha as excluirLinhaDe,
  inserirColuna as inserirColunaNa, excluirColuna as excluirColunaNa,
  mesclar as mesclarFaixa, desmesclar as desmesclarFaixa, mesclagemApaga,
  historicoDe, registrar as empilhar, desfazer as desfazerHist, refazer as refazerHist,
  type Historico, type Recorte, type Direcao,
} from './planilha';

/*
 * AP043 requisito 5 — as seis demonstrações numa planilha eletrônica.
 *
 * Ajustar linha e coluna, alinhar dentro da célula nos dois eixos, mesclar e
 * desfazer, inserir e excluir linha e coluna, formatar o layout, e usar soma e
 * média. Seis gestos, e nenhum deles se prova em múltipla escolha: dá para
 * acertar a alternativa sobre mesclagem sem nunca ter mesclado nada.
 *
 * ── Por que um programa novo, e não um cartão ────────────────────────────
 * Planilha é grade, e grade é o programa. Cabeçalho de coluna com letra,
 * cabeçalho de linha com número, célula selecionada com borda grossa, caixa de
 * nome mostrando B3, barra de fórmulas mostrando o que está escrito. Uma tabela
 * da plataforma com botões ao lado praticaria as operações e ensinaria a
 * procurá-las num lugar que não existe.
 *
 * ── Era uma planilha genérica, e virou o Excel ──────────────────────────
 * Estava escrito aqui que a planilha imitava o arranjo comum a Excel, Calc e
 * Google Planilhas, sem marca — o mesmo raciocínio do editor de código da
 * vereda. A decisão mudou por pedido de quem coordena a trilha, e a razão é
 * boa: no clube e na escola o programa que está instalado é o Excel, e a
 * distância entre "o arranjo comum" e o Excel aparece justamente nos lugares
 * em que se procura alguma coisa — Inserir e Excluir moram num menu suspenso,
 * o botão direito abre um menu que resolve quase tudo, e o teclado faz metade
 * do trabalho. Genérico demais deixa de ser reconhecível.
 *
 * Fica registrado para não ser "consertado" de volta.
 *
 * ── O que a mão de quem usa Excel já sabe ────────────────────────────────
 * Teclado antes de tudo: setas andam, Shift+setas estendem, Enter desce, Tab
 * anda de lado, F2 edita, Delete limpa, Esc cancela, e **digitar sobre uma
 * célula selecionada substitui o conteúdo** — que é o gesto mais usado do
 * programa e não existia aqui. Ctrl+C, Ctrl+X, Ctrl+V e Ctrl+Z também.
 *
 * As operações moram em `planilha.ts`, fora da tela, porque teclado é
 * exatamente o que ninguém percebe estar quebrado até tentar usar: escrever na
 * barra de fórmulas aceitava um caractere e a suíte inteira passava.
 *
 * ── As armadilhas, uma por tarefa ────────────────────────────────────────
 *   tamanho    — largura de coluna não se ajusta digitando: arrasta-se a borda
 *                do cabeçalho, ou dá-se dois cliques nela para caber o
 *                conteúdo. Quem não sabe disso escreve espaços;
 *   alinhar    — são dois eixos, e quase todo mundo conhece um. Alinhar
 *                verticalmente só se percebe em linha alta — e é por isso que a
 *                tarefa pede a linha alta antes;
 *   mesclar    — mesclar apaga o conteúdo de todas as células menos a primeira,
 *                e o programa avisa. Desfazer não traz o que foi apagado de
 *                volta, e é isso que a tarefa mostra: o aviso não é decoração;
 *   linha      — inserir linha empurra o resto para baixo, e a fórmula que
 *                somava até a linha 5 passa a somar até a 6 sozinha. É a
 *                diferença entre a fórmula e o número digitado;
 *   layout     — "de forma automática e manual", diz o documento. Automático é
 *                o estilo pronto; manual é escolher borda e preenchimento. Os
 *                dois estão aqui, e o painel cobra os dois;
 *   funções    — =SOMA(B2:B5) não é uma conta feita à mão. Quando um valor
 *                muda, o resultado muda junto — e a tarefa faz esse valor mudar.
 */

/* ── O laboratório ─────────────────────────────────────────────────────────── */

export default function PlanilhaLab({
  specialtyCode, lessonCode, lessonTitle, requirementCodes, userId,
}: Props) {
  /*
    A planilha vive dentro de um histórico, e não solta: é o que faz Ctrl+Z
    existir. `p` continua sendo o presente, e toda mudança passa por `mudar`,
    que empilha o estado anterior.
  */
  const [hist, setHist] = useState<Historico>(() => historicoDe(PLANILHA_INICIAL));
  const p = hist.presente;
  /* A seleção é uma faixa: `l1/c1` é a âncora, onde o clique começou, e
     `l2/c2` é onde ele parou. Clique simples deixa as duas iguais, e aí a
     faixa é uma célula só — que era tudo o que existia aqui antes. */
  const [faixa, setFaixa] = useState<Faixa>({ l1: 0, c1: 0, l2: 0, c2: 0 });
  const [arrastandoFaixa, setArrastandoFaixa] = useState(false);
  const sel = { l: faixa.l1, c: faixa.c1 };
  const area = normalizar(faixa);

  /* Até onde a tabela vai. Formatar como tabela pinta o que está dentro deste
     retângulo, e não a grade inteira: o estilo automático saía por cima das
     doze colunas e das vinte e seis linhas, e a planilha inteira virava uma
     tabela verde. Estilo é da tabela; a grade em volta continua grade. */
  const colunasDaTabela = larguraDaTabela(p);
  const linhasDaTabela = alturaDaTabela(p);

  /* Média, contagem e soma da faixa — só quando ela tem mais de uma célula e
     algum número dentro, que é quando a planilha de verdade os mostra. */
  const resumoDaFaixa = (() => {
    if (umaCelulaSo(faixa)) return null;
    const numeros: number[] = [];
    for (let l = area.topo; l <= area.base; l++) {
      for (let c = area.esq; c <= area.dir; c++) {
        const t = valorDe(p, l, c);
        if (ehNumero(t)) numeros.push(Number(t.replace(',', '.')));
      }
    }
    if (numeros.length === 0) return null;
    const soma = numeros.reduce((a, b) => a + b, 0);
    const media = soma / numeros.length;
    const escrever = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','));
    return `Média: ${escrever(media)}    Contagem: ${numeros.length}    Soma: ${escrever(soma)}`;
  })();
  const [barra, setBarra] = useState('');
  /*
    Onde a edição está acontecendo, e não só *se* está.

    Era um booleano, e foi ele o defeito: escrever na barra de fórmulas ligava
    o modo de edição, a célula passava a desenhar um campo com autoFocus, e
    esse campo roubava o foco da barra no meio da digitação. O onBlur da barra
    então confirmava o que havia — uma letra. Cada tecla virava uma gravação.

    Sabendo *onde*, só a célula recebe autoFocus, e só quando a edição começou
    nela. A barra fica com o foco enquanto quem escreve está escrevendo nela.
  */
  const [editando, setEditando] = useState<'celula' | 'barra' | null>(null);
  /** Área de transferência: o que Ctrl+C guardou. */
  const [recorte, setRecorte] = useState<Recorte | null>(null);
  /** Menu do botão direito: onde abriu e sobre o quê. */
  const [contexto, setContexto] = useState<
    { x: number; y: number; alvo: 'celula' | 'coluna' | 'linha' } | null>(null);
  const gradeRef = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [aviso, setAviso] = useState('');
  const [gravando, setGravando] = useState(false);
  const [erro, setErro] = useState('');
  const [pronto, setPronto] = useState(false);
  /** O arrasto em curso no cabeçalho, se houver. */
  const arrasto = useRef<{ tipo: 'coluna' | 'linha'; indice: number; inicio: number; base: number } | null>(null);

  const avisar = (texto: string) => {
    setAviso(texto);
    window.setTimeout(() => setAviso(a => (a === texto ? '' : a)), 7000);
  };

  /** Toda mudança passa por aqui, e por isso Ctrl+Z alcança todas elas. */
  const mudar = (f: (p: Planilha) => Planilha) => setHist(h => empilhar(h, f(h.presente)));

  /* ── Seleção e escrita ── */

  const selecionar = (l: number, c: number) => {
    setFaixa({ l1: l, c1: c, l2: l, c2: c });
    setBarra(p.celulas[l][c].texto);
    setEditando(null);
    setContexto(null);
  };

  /**
   * Grava o que foi escrito e, se pedirem, anda — como o Enter e o Tab do
   * Excel, que confirmam *e* saem da célula no mesmo gesto.
   */
  const confirmar = (texto: string, andarPara?: Direcao) => {
    mudar(a => escreverEm(a, sel.l, sel.c, texto));
    setEditando(null);
    if (andarPara) {
      const destino = proxima(p, faixa, andarPara);
      setFaixa(destino);
      setBarra(p.celulas[destino.l1][destino.c1].texto);
    }
  };

  /*
    Esc desiste, e precisa ganhar do onBlur.

    O campo da célula grava no onBlur — o que está certo, porque no Excel
    clicar noutra célula durante a edição grava o que foi escrito. Só que Esc
    também tira o foco, e o onBlur disparava logo depois, gravando exatamente
    o que Esc acabara de descartar: apertar F2, escrever, e apertar Esc
    deixava o texto novo na célula.

    A bandeira é um ref e não um estado porque o onBlur roda antes de qualquer
    re-renderização: um estado ainda estaria com o valor velho quando ele lê.
  */
  const cancelando = useRef(false);

  const cancelarEdicao = () => {
    cancelando.current = true;
    setEditando(null);
    setBarra(p.celulas[sel.l][sel.c].texto);
  };

  /** Começa a editar do zero, com a tecla que a pessoa acabou de apertar. */
  const digitarPorCima = (tecla: string) => {
    setBarra(tecla);
    setEditando('celula');
  };

  /* ── Alinhamento: vale para a faixa inteira, como no Excel ── */

  const alinharH = (h: AlinhaH) => mudar(a => ({
    ...a,
    celulas: a.celulas.map((linha, i) => linha.map((cel, j) => (
      naFaixa(faixa, i, j) ? { ...cel, h } : cel))),
  }));

  const alinharV = (v: AlinhaV) => mudar(a => ({
    ...a,
    celulas: a.celulas.map((linha, i) => linha.map((cel, j) => (
      naFaixa(faixa, i, j) ? { ...cel, v } : cel))),
  }));

  const negritar = () => mudar(a => {
    const ligando = !a.celulas[sel.l][sel.c].negrito;
    return {
      ...a,
      celulas: a.celulas.map((linha, i) => linha.map((cel, j) => (
        naFaixa(faixa, i, j) ? { ...cel, negrito: ligando } : cel))),
    };
  });

  /* ── Área de transferência ── */

  const copiar = () => {
    setRecorte(copiarFaixa(p, faixa));
    setContexto(null);
  };

  const recortar = () => {
    setRecorte(copiarFaixa(p, faixa));
    mudar(a => limpar(a, faixa));
    setContexto(null);
  };

  const colar = () => {
    setContexto(null);
    if (!recorte) { avisar('Não há nada copiado ainda. Selecione as células e use Copiar, ou Ctrl+C.'); return; }
    mudar(a => colarEm(a, faixa, recorte));
  };

  const limparConteudo = () => { mudar(a => limpar(a, faixa)); setContexto(null); };

  /* ── Desfazer e refazer ── */

  const desfazer = () => { setHist(desfazerHist); setEditando(null); };
  const refazer = () => { setHist(refazerHist); setEditando(null); };

  /* ── Mesclar ── */

  const mesclar = () => {
    setContexto(null);
    const feita = mesclarFaixa(p, faixa);
    if (!feita) {
      avisar('Selecione mais de uma célula antes de mesclar: clique numa e arraste até a última.');
      return;
    }
    /* Só o conteúdo da primeira célula sobrevive, como na planilha de verdade.
       Avisar disso importa porque é irreversível pela desmesclagem — o que
       traz de volta é o Ctrl+Z, e é bom que se saiba. */
    const apaga = mesclagemApaga(p, faixa);
    mudar(() => feita);
    if (apaga) {
      avisar('Mesclar manteve só o conteúdo da primeira célula — o das outras foi apagado. É assim na planilha de verdade; desfazer a mesclagem não traz de volta, mas o Ctrl+Z traz.');
    }
  };

  const desmesclar = () => { mudar(a => desmesclarFaixa(a, faixa)); setContexto(null); };

  /* ── Linhas e colunas ── */

  const inserirLinha = () => {
    /* O Excel insere *acima* da linha selecionada, e não abaixo. Quem insere
       esperando a linha nova em cima e a vê embaixo escreve no lugar errado. */
    mudar(a => inserirLinhaEm(a, sel.l));
    setContexto(null);
  };

  const excluirLinha = () => {
    setContexto(null);
    const feita = excluirLinhaDe(p, sel.l);
    if (!feita) { avisar('A planilha ficaria quase sem linhas.'); return; }
    mudar(() => feita);
    setFaixa(f => { const l = Math.max(0, Math.min(f.l1, feita.celulas.length - 1)); return { l1: l, c1: f.c1, l2: l, c2: f.c1 }; });
  };

  const inserirColuna = () => {
    /* Também à esquerda, como o Excel. */
    mudar(a => inserirColunaNa(a, sel.c));
    setContexto(null);
  };

  const excluirColuna = () => {
    setContexto(null);
    const feita = excluirColunaNa(p, sel.c);
    if (!feita) { avisar('A planilha ficaria quase sem colunas.'); return; }
    mudar(() => feita);
    setFaixa(f => { const c = Math.max(0, Math.min(f.c1, feita.celulas[0].length - 1)); return { l1: f.l1, c1: c, l2: f.l1, c2: c }; });
  };

  /* ── Largura e altura pedidas por escrito, como o menu do Excel faz ── */

  const pedirLargura = () => {
    setContexto(null);
    const atual = Math.round(p.larguras[sel.c]);
    const dito = window.prompt('Largura da coluna (em pixels):', String(atual));
    const n = Number(dito);
    if (!dito || Number.isNaN(n) || n < 30) return;
    mudar(a => ({ ...a, larguras: a.larguras.map((w, i) => (i === sel.c ? Math.min(400, n) : w)) }));
  };

  const pedirAltura = () => {
    setContexto(null);
    const atual = Math.round(p.alturas[sel.l]);
    const dito = window.prompt('Altura da linha (em pixels):', String(atual));
    const n = Number(dito);
    if (!dito || Number.isNaN(n) || n < 16) return;
    mudar(a => ({ ...a, alturas: a.alturas.map((h, i) => (i === sel.l ? Math.min(240, n) : h)) }));
  };


  /*
    O teclado.

    É metade do Excel, e não existia nenhum pedaço dele. O que a mão de quem
    usa planilha já sabe fazer: as setas andam, Shift+setas estendem a faixa,
    Enter desce, Shift+Enter sobe, Tab anda de lado, F2 edita no lugar, Delete
    limpa, Esc cancela — e **digitar sobre a célula selecionada substitui o
    conteúdo**, que é o gesto mais usado do programa inteiro. Sem ele, a única
    forma de escrever era dar dois cliques, que quase ninguém tenta primeiro.
  */
  const aoTeclar = (e: React.KeyboardEvent) => {
    if (contexto) setContexto(null);

    /* Editando, o teclado é do campo de texto — menos as teclas que fecham a
       edição, que continuam sendo da planilha. */
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
      if (!e.shiftKey) setBarra(p.celulas[destino.l1][destino.c1].texto);
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const destino = proxima(p, faixa, e.shiftKey ? 'cima' : 'baixo');
      setFaixa(destino);
      setBarra(p.celulas[destino.l1][destino.c1].texto);
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const destino = proxima(p, faixa, e.shiftKey ? 'esquerda' : 'direita');
      setFaixa(destino);
      setBarra(p.celulas[destino.l1][destino.c1].texto);
      return;
    }

    if (e.key === 'F2') {
      e.preventDefault();
      setBarra(p.celulas[sel.l][sel.c].texto);
      setEditando('celula');
      return;
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      mudar(a => limpar(a, faixa));
      setBarra('');
      return;
    }

    /* Qualquer caractere que se possa escrever começa a edição por cima do que
       estava lá. É o comportamento do Excel, e é o que faz a planilha parecer
       responder em vez de estar travada. */
    if (e.key.length === 1 && !e.altKey) {
      e.preventDefault();
      digitarPorCima(e.key);
    }
  };

  /* ── Arrastar o cabeçalho ── */

  const comecarArrasto = (tipo: 'coluna' | 'linha', indice: number, e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
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
    const valor = Math.max(a.tipo === 'coluna' ? 40 : 18, Math.round(a.base + delta));
    mudar(atual => (a.tipo === 'coluna'
      ? { ...atual, larguras: atual.larguras.map((w, i) => (i === a.indice ? valor : w)) }
      : { ...atual, alturas: atual.alturas.map((h, i) => (i === a.indice ? valor : h)) }));
  };

  const soltarArrasto = () => { arrasto.current = null; };

  /* Dois cliques na borda ajustam ao conteúdo, como na planilha de verdade. */
  const ajustarAoConteudo = (indice: number) => {
    const maior = p.celulas.reduce((m, linha) => Math.max(m, (linha[indice]?.texto ?? '').length), 0);
    mudar(a => ({ ...a, larguras: a.larguras.map((w, i) => (i === indice ? Math.max(60, maior * 8 + 20) : w)) }));
  };

  const recomecar = () => {
    setHist(historicoDe(PLANILHA_INICIAL));
    setFaixa({ l1: 0, c1: 0, l2: 0, c2: 0 });
    setBarra('');
    setEditando(null);
    setRecorte(null);
    setContexto(null);
    setAviso('');
  };

  const tarefas = METAS.map(m => ({
    id: m.id, titulo: m.titulo, detalhe: m.detalhe, onde: m.onde, passos: m.passos,
    feita: m.feita(p),
  }));
  const tudoFeito = tarefas.every(t => t.feita);

  const registrar = async () => {
    setErro('');
    setGravando(true);
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) {
      await ensureEnrollment(userId, specId);
      await updateEnrollmentActivity(userId, specId);
    }
    await registrarConclusaoDeLicao(userId, lessonCode);
    let gravados = 0;
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (!reqId) continue;
      await upsertRequirementProgress(userId, reqId, {
        status: 'completed', mastery_score: 100, checkpoint_passed: true,
        attempts: 1, correct_count: METAS.length, total_questions: METAS.length,
      });
      gravados++;
    }
    setGravando(false);
    if (gravados < requirementCodes.length) {
      setErro('Você montou a planilha, mas o progresso não pôde ser guardado agora. Avise a liderança do clube.');
      return;
    }
    await logActivity(userId, 'planilha_concluida', { specialtyCode, lessonCode, metas: METAS.length });
    setPronto(true);
  };

  if (pronto) {
    return (
      <div className="card p-6 text-center">
        <FileCheck2 className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
        <h2 className="text-xl font-bold mb-2">Planilha entregue</h2>
        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Tamanho, alinhamento, mesclagem, linhas, layout e fórmulas — as seis demonstrações do requisito 5.
        </p>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary">
          Voltar para a trilha
        </Link>
      </div>
    );
  }

  const Bt = ({ dica, ativo, aoClicar, children }: {
    dica: string; ativo?: boolean; aoClicar: () => void; children: React.ReactNode;
  }) => (
    <button type="button" title={dica} aria-label={dica} aria-pressed={ativo}
      onClick={aoClicar} className="pl-bt"
      style={{
        background: ativo ? '#D6E3D2' : 'transparent',
        border: ativo ? '1px solid #8FAF87' : '1px solid transparent',
      }}>
      {children}
    </button>
  );


  /* ── Menus: os da faixa e o do botão direito ── */

  const fecharMenu = () => setMenu(null);

  const ItemDoMenu = ({ aoClicar, atalho, children }: {
    aoClicar: () => void; atalho?: string; children: React.ReactNode;
  }) => (
    <button type="button" role="menuitem" className="pl-menu-item"
      onClick={() => { aoClicar(); fecharMenu(); }}>
      <span className="pl-menu-rotulo">{children}</span>
      {atalho && <span className="pl-menu-atalho">{atalho}</span>}
    </button>
  );

  /** Botão da faixa que abre um menu — Inserir, Excluir e Formatar. */
  const BtMenu = ({ id, rotulo, icone, children }: {
    id: string; rotulo: string; icone: React.ReactNode; children: React.ReactNode;
  }) => (
    <div style={{ position: 'relative' }}>
      <button type="button" className="pl-bt" title={rotulo} aria-haspopup="menu"
        aria-expanded={menu === id}
        style={{
          flexDirection: 'column', height: 'auto', padding: '2px 6px',
          background: menu === id ? '#D6E3D2' : 'transparent',
          border: menu === id ? '1px solid #8FAF87' : '1px solid transparent',
        }}
        onClick={() => setMenu(m => (m === id ? null : id))}>
        {icone}
        <span style={{ fontSize: 9, display: 'flex', alignItems: 'center', gap: 1 }}>
          {rotulo}<ChevronDown className="w-2.5 h-2.5" />
        </span>
      </button>
      {menu === id && <div className="pl-menu" role="menu">{children}</div>}
    </div>
  );

  /* Dois cliques na borda de baixo do cabeçalho de linha ajustam a altura,
     como o AutoAjuste do Excel. A altura mínima é a padrão: linha que
     encolhesse abaixo dela esconderia o texto. */
  const ajustarLinhaAoConteudo = (indice: number) => {
    mudar(a => ({ ...a, alturas: a.alturas.map((h, i) => (i === indice ? ALTURA_PADRAO : h)) }));
  };

  /**
   * Abre o menu do botão direito.
   *
   * Quem usa Excel resolve quase tudo por aqui — inserir, excluir, copiar,
   * colar, limpar, largura da coluna. Clicar fora de uma faixa já selecionada
   * seleciona a célula debaixo do ponteiro antes de abrir, que é o que o Excel
   * faz; clicar dentro dela mantém a faixa, senão o menu perderia a seleção
   * sobre a qual ele ia agir.
   */
  const abrirContexto = (
    e: React.MouseEvent, alvo: 'celula' | 'coluna' | 'linha', l: number, c: number,
  ) => {
    e.preventDefault();
    fecharMenu();
    if (alvo === 'coluna') setFaixa({ l1: 0, c1: c, l2: p.celulas.length - 1, c2: c });
    else if (alvo === 'linha') setFaixa({ l1: l, c1: 0, l2: l, c2: p.celulas[0].length - 1 });
    else if (!naFaixa(faixa, l, c)) selecionar(l, c);
    setContexto({ x: e.clientX, y: e.clientY, alvo });
  };

  const Grupo = ({ nome, children }: { nome: string; children: React.ReactNode }) => (
    <div className="pl-grupo">
      <div className="pl-grupo-corpo">{children}</div>
      <div className="pl-grupo-nome">{nome}</div>
    </div>
  );

  const Enfeite = ({ dica, children }: { dica: string; children: React.ReactNode }) => (
    <Bt dica={dica} aoClicar={() => avisar(`${dica} existe na planilha de verdade, e não faz parte deste exercício.`)}>
      {children}
    </Bt>
  );

  const acoes = (
    <div className="flex flex-col gap-2">
      {tudoFeito && (
        <>
          {erro && <p style={{ fontSize: 11.5, color: 'var(--color-error)' }}>{erro}</p>}
          <button onClick={registrar} disabled={gravando} className="btn-primary text-sm w-full justify-center">
            {gravando ? 'Guardando…' : 'Entregar a planilha'}
          </button>
        </>
      )}
      <button onClick={recomecar} className="btn-secondary text-xs py-2 w-full justify-center inline-flex items-center gap-1">
        <RotateCcw className="w-3 h-3" /> Recomeçar a planilha
      </button>
    </div>
  );

  return (
    <LaboratorioEmTelaCheia
      trilha={specialtyCode}
      voltarPara={`/especialidade/${specialtyCode}`}
      titulo={lessonTitle}
      programa="planilha"
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
      rodape={26}
    >
      <style>{CSS_PLANILHA}</style>

      <div className="pl-janela">
        {/* Barra de título */}
        <div className="pl-titulo">
          <span style={{ color: '#217346', fontWeight: 700, fontSize: 13 }}>▦</span>
          <span style={{ fontWeight: 600 }}>orcamento-do-acampamento</span>
          <span style={{ color: '#605E5C' }}>— Salvo</span>
          <span className="ml-auto flex items-center gap-2" style={{ color: '#605E5C' }}>
            <button type="button" className="px-1" onClick={() => avisar('Minimizar não faz parte deste exercício.')}>—</button>
            <button type="button" className="px-1" onClick={() => avisar('Fechar a planilha não faz parte deste exercício.')}>
              <X className="w-3 h-3" />
            </button>
          </span>
        </div>

        {/* Guias — as do Excel em português, na ordem dele. Só Página Inicial
            faz parte do exercício; as outras aparecem e dizem isso, para que
            ninguém aprenda que o Excel não as tem. */}
        <div className="pl-guias" role="tablist">
          <button type="button" className="pl-guia pl-guia-arquivo"
            onClick={() => avisar('A guia Arquivo existe no Excel de verdade, e não faz parte deste exercício.')}>
            Arquivo
          </button>
          <button type="button" role="tab" aria-selected="true" className="pl-guia">Página Inicial</button>
          {['Inserir', 'Layout da Página', 'Fórmulas', 'Dados', 'Revisão', 'Exibir', 'Ajuda'].map(g => (
            <button key={g} type="button" className="pl-guia" style={{ color: '#8A8886' }}
              onClick={() => avisar(g === 'Fórmulas'
                ? 'A guia Fórmulas existe no Excel de verdade. Aqui a fórmula se escreve direto na célula, que é como se faz na prática.'
                : `A guia ${g} existe no Excel de verdade, e não faz parte deste exercício.`)}>
              {g}
            </button>
          ))}
        </div>

        {/* Faixa de opções */}
        <div className="pl-faixa" style={{ overflowX: menu ? 'visible' : 'auto' }}>
          <Grupo nome="Área de Transferência">
            <Bt dica="Colar (Ctrl+V)" aoClicar={colar}>
              <span className="flex flex-col items-center">
                <ClipboardPaste className="w-5 h-5" />
                <span style={{ fontSize: 9 }}>Colar</span>
              </span>
            </Bt>
            <div className="pl-linhas">
              <Bt dica="Recortar (Ctrl+X)" aoClicar={recortar}><Scissors className="w-3.5 h-3.5" /></Bt>
              <Bt dica="Copiar (Ctrl+C)" aoClicar={copiar}><Copy className="w-3.5 h-3.5" /></Bt>
              <Bt dica="Limpar Conteúdo (Delete)" aoClicar={limparConteudo}><Eraser className="w-3.5 h-3.5" /></Bt>
            </div>
          </Grupo>

          <Grupo nome="Desfazer">
            <div className="pl-linhas">
              <Bt dica="Desfazer (Ctrl+Z)" aoClicar={desfazer}><Undo2 className="w-3.5 h-3.5" /></Bt>
              <Bt dica="Refazer (Ctrl+Y)" aoClicar={refazer}><Redo2 className="w-3.5 h-3.5" /></Bt>
            </div>
          </Grupo>

          {/* Fonte e Número ficam desenhados quase inteiros porque é por eles
              que se reconhece a faixa: um grupo com dois botões não parece o
              grupo do Excel, parece um resumo dele. O que não faz parte do
              exercício responde dizendo isso. */}
          <Grupo nome="Fonte">
            <div className="pl-linhas">
              <div className="flex items-center gap-1">
                <span className="pl-combo" style={{ width: 96 }}>Aptos Narrow</span>
                <span className="pl-combo" style={{ width: 38 }}>11</span>
                <Enfeite dica="Aumentar Tamanho da Fonte"><span style={{ fontSize: 13, fontWeight: 600 }}>A</span></Enfeite>
                <Enfeite dica="Diminuir Tamanho da Fonte"><span style={{ fontSize: 10 }}>A</span></Enfeite>
              </div>
              <div className="flex items-center gap-1">
                <Bt dica="Negrito (Ctrl+N)" ativo={p.celulas[sel.l][sel.c].negrito} aoClicar={negritar}>
                  <Bold className="w-3.5 h-3.5" />
                </Bt>
                <Enfeite dica="Itálico (Ctrl+I)"><Italic className="w-3.5 h-3.5" /></Enfeite>
                <Enfeite dica="Sublinhado (Ctrl+S)"><Underline className="w-3.5 h-3.5" /></Enfeite>
                <Enfeite dica="Bordas"><Grid2x2 className="w-3.5 h-3.5" /></Enfeite>
                <Enfeite dica="Cor do Preenchimento"><PaintBucket className="w-3.5 h-3.5" /></Enfeite>
                <Enfeite dica="Cor da Fonte"><Palette className="w-3.5 h-3.5" /></Enfeite>
              </div>
            </div>
          </Grupo>

          <Grupo nome="Alinhamento">
            <Bt dica="Alinhar em Cima" ativo={p.celulas[sel.l][sel.c].v === 'acima'} aoClicar={() => alinharV('acima')}>
              <ChevronsUp className="w-4 h-4" />
            </Bt>
            <Bt dica="Alinhar no Meio" ativo={p.celulas[sel.l][sel.c].v === 'meio'} aoClicar={() => alinharV('meio')}>
              <Minus className="w-4 h-4" />
            </Bt>
            <Bt dica="Alinhar Embaixo" ativo={p.celulas[sel.l][sel.c].v === 'abaixo'} aoClicar={() => alinharV('abaixo')}>
              <ChevronsDown className="w-4 h-4" />
            </Bt>
            <span className="pl-sep" />
            <Bt dica="Alinhar à Esquerda" ativo={p.celulas[sel.l][sel.c].h === 'esquerda'} aoClicar={() => alinharH('esquerda')}>
              <AlignLeft className="w-4 h-4" />
            </Bt>
            <Bt dica="Centralizar" ativo={p.celulas[sel.l][sel.c].h === 'centro'} aoClicar={() => alinharH('centro')}>
              <AlignCenter className="w-4 h-4" />
            </Bt>
            <Bt dica="Alinhar à Direita" ativo={p.celulas[sel.l][sel.c].h === 'direita'} aoClicar={() => alinharH('direita')}>
              <AlignRight className="w-4 h-4" />
            </Bt>
            <span className="pl-sep" />
            <Bt dica="Mesclar e Centralizar" aoClicar={mesclar}>
              <span className="flex items-center gap-1">
                <Combine className="w-4 h-4" />
                <span style={{ fontSize: 10 }}>Mesclar</span>
              </span>
            </Bt>
            <Bt dica="Desfazer Mesclagem" aoClicar={desmesclar}>
              <span className="flex items-center gap-1">
                <Split className="w-4 h-4" />
                <span style={{ fontSize: 10 }}>Desfazer</span>
              </span>
            </Bt>
          </Grupo>

          <Grupo nome="Número">
            <div className="pl-linhas">
              <span className="pl-combo" style={{ width: 96 }}>Geral</span>
              <div className="flex items-center gap-1">
                <Enfeite dica="Formato de Número de Contabilização"><span style={{ fontSize: 12 }}>R$</span></Enfeite>
                <Enfeite dica="Estilo de Separador de Milhares"><span style={{ fontSize: 12 }}>000</span></Enfeite>
                <Enfeite dica="Aumentar Casas Decimais"><span style={{ fontSize: 11 }}>,0→</span></Enfeite>
              </div>
            </div>
            <Enfeite dica="Porcentagem"><Percent className="w-4 h-4" /></Enfeite>
          </Grupo>

          <Grupo nome="Estilos">
            <Bt dica="Formatar como Tabela" ativo={p.layout === 'automatico'}
              aoClicar={() => mudar(a => ({ ...a, layout: 'automatico' }))}>
              <span className="flex flex-col items-center">
                <Table2 className="w-4 h-4" />
                <span style={{ fontSize: 9 }}>Automático</span>
              </span>
            </Bt>
            <Bt dica="Bordas e Preenchimento" ativo={p.layout === 'manual'}
              aoClicar={() => mudar(a => ({ ...a, layout: 'manual' }))}>
              <span className="flex flex-col items-center">
                <Paintbrush className="w-4 h-4" />
                <span style={{ fontSize: 9 }}>Manual</span>
              </span>
            </Bt>
            <Bt dica="Sem Formatação" ativo={p.layout === 'nenhum'}
              aoClicar={() => mudar(a => ({ ...a, layout: 'nenhum' }))}>
              <span className="flex flex-col items-center">
                <Grid2x2 className="w-4 h-4" />
                <span style={{ fontSize: 9 }}>Nenhum</span>
              </span>
            </Bt>
          </Grupo>

          <Grupo nome="Células">
            {/* No Excel são três botões com menu suspenso, e não seis botões
                soltos: Inserir, Excluir e Formatar. Quem procura "inserir
                linha" procura debaixo de Inserir, e é lá que está. */}
            <BtMenu id="inserir" rotulo="Inserir" icone={<Rows3 className="w-4 h-4" />}>
              <ItemDoMenu aoClicar={inserirLinha}>Inserir Linhas na Planilha</ItemDoMenu>
              <ItemDoMenu aoClicar={inserirColuna}>Inserir Colunas na Planilha</ItemDoMenu>
              <ItemDoMenu aoClicar={() => avisar('Inserir outra planilha não faz parte deste exercício.')}>
                Inserir Planilha
              </ItemDoMenu>
            </BtMenu>
            <BtMenu id="excluir" rotulo="Excluir" icone={<Trash2 className="w-4 h-4" />}>
              <ItemDoMenu aoClicar={excluirLinha}>Excluir Linhas da Planilha</ItemDoMenu>
              <ItemDoMenu aoClicar={excluirColuna}>Excluir Colunas da Planilha</ItemDoMenu>
            </BtMenu>
            <BtMenu id="formatar" rotulo="Formatar" icone={<Ruler className="w-4 h-4" />}>
              <ItemDoMenu aoClicar={pedirAltura}>Altura da Linha…</ItemDoMenu>
              <ItemDoMenu aoClicar={() => { ajustarLinhaAoConteudo(sel.l); fecharMenu(); }}>
                AutoAjuste da Altura da Linha
              </ItemDoMenu>
              <div className="pl-menu-risco" />
              <ItemDoMenu aoClicar={pedirLargura}>Largura da Coluna…</ItemDoMenu>
              <ItemDoMenu aoClicar={() => { ajustarAoConteudo(sel.c); fecharMenu(); }}>
                AutoAjuste da Largura da Coluna
              </ItemDoMenu>
            </BtMenu>
          </Grupo>

          <Grupo nome="Edição">
            <Bt dica="Soma automática"
              aoClicar={() => {
                /* Com faixa selecionada, soma a faixa — que é o que a planilha
                   de verdade faz. Sem faixa, propõe a coluna acima do cursor,
                   que é o palpite dela quando não há seleção. */
                const alvo = umaCelulaSo(faixa)
                  ? `${String.fromCharCode(65 + sel.c)}1:${String.fromCharCode(65 + sel.c)}${Math.max(1, sel.l)}`
                  : `${nomeDaCelula(area.topo, area.esq)}:${nomeDaCelula(area.base, area.dir)}`;
                setBarra(`=SOMA(${alvo})`);
                setEditando('celula');
              }}>
              <span className="flex flex-col items-center">
                <Sigma className="w-4 h-4" />
                <span style={{ fontSize: 9 }}>Soma</span>
              </span>
            </Bt>
          </Grupo>
        </div>

        {/* Caixa de nome e barra de fórmulas */}
        <div className="pl-formula">
          <span className="pl-nome">{nomeDaFaixa(faixa)}</span>
          <span className="pl-fx">fx</span>
          {/* Escrever aqui liga a edição *na barra*, e não na célula: era a
              célula que ganhava foco no meio da digitação, roubava a tecla
              seguinte e fazia o onBlur daqui gravar uma letra sozinha.

              E o onBlur não confirma mais nada. Sair da barra clicando noutro
              lugar é desistir, não gravar — gravar é Enter, como no Excel. Um
              onBlur que grava é o que transforma um clique acidental numa
              alteração que ninguém pediu. */}
          <input
            className="pl-entrada"
            value={editando ? barra : p.celulas[sel.l][sel.c].texto}
            onChange={e => { setBarra(e.target.value); setEditando('barra'); }}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); confirmar(barra, 'baixo'); }
              if (e.key === 'Escape') { e.preventDefault(); cancelarEdicao(); }
            }}
            placeholder="Escreva aqui, ou uma fórmula começando por ="
          />
        </div>

        {/* A grade */}
        {/* A caixa da grade recebe o teclado: `tabIndex` a torna focável, e o
            foco vai para ela sempre que alguém clica numa célula. Sem isso as
            setas rolariam a página em vez de andar pela planilha. */}
        <div
          ref={gradeRef}
          className="pl-grade-caixa"
          tabIndex={0}
          onKeyDown={aoTeclar}
          onPointerMove={moverArrasto}
          onPointerUp={() => { soltarArrasto(); setArrastandoFaixa(false); }}
          onPointerLeave={() => setArrastandoFaixa(false)}>
          <table className={`pl-grade pl-layout-${p.layout}`}>
            <thead>
              <tr>
                <th className="pl-canto" />
                {p.larguras.map((w, c) => (
                  <th key={c} className="pl-cab-col" style={{ width: w, minWidth: w }}
                    onPointerDown={e => {
                      if (e.button !== 0) return;
                      gradeRef.current?.focus();
                      setFaixa({ l1: 0, c1: c, l2: p.celulas.length - 1, c2: c });
                    }}
                    onContextMenu={e => abrirContexto(e, 'coluna', 0, c)}>
                    {String.fromCharCode(65 + c)}
                    <span
                      className="pl-alca-col"
                      title="Arraste para mudar a largura, ou dois cliques para caber o conteúdo"
                      onPointerDown={e => comecarArrasto('coluna', c, e)}
                      onDoubleClick={() => ajustarAoConteudo(c)} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {p.celulas.map((linha, l) => (
                <tr key={l} style={{ height: p.alturas[l] }}>
                  <th className="pl-cab-lin"
                    onPointerDown={e => {
                      if (e.button !== 0) return;
                      gradeRef.current?.focus();
                      setFaixa({ l1: l, c1: 0, l2: l, c2: p.celulas[0].length - 1 });
                    }}
                    onContextMenu={e => abrirContexto(e, 'linha', l, 0)}>
                    {l + 1}
                    <span
                      className="pl-alca-lin"
                      title="Arraste para mudar a altura, ou dois cliques para o AutoAjuste"
                      onPointerDown={e => comecarArrasto('linha', l, e)}
                      onDoubleClick={() => ajustarLinhaAoConteudo(l)} />
                  </th>
                  {linha.map((cel, c) => {
                    if (cel.coberta) return null;
                    const ancora = sel.l === l && sel.c === c;
                    const dentro = naFaixa(faixa, l, c);
                    const mostrado = valorDe(p, l, c);
                    const h = alinhamentoDe(cel, mostrado);
                    return (
                      <td
                        key={c}
                        colSpan={cel.span}
                        /* Apontar começa a faixa, arrastar a estende e soltar a
                           fecha — o mesmo gesto da planilha de verdade. Sem ele
                           não havia como dizer "de A1 até D1", e a tarefa de
                           mesclar pedia uma coisa que a tela não fazia. */
                        onPointerDown={e => {
                          gradeRef.current?.focus();
                          if (e.button !== 0) return;
                          if (e.shiftKey) { setFaixa(f => ({ ...f, l2: l, c2: c })); return; }
                          selecionar(l, c);
                          setArrastandoFaixa(true);
                        }}
                        onContextMenu={e => abrirContexto(e, 'celula', l, c)}
                        onPointerEnter={() => {
                          if (arrastandoFaixa) setFaixa(f => ({ ...f, l2: l, c2: c }));
                        }}
                        className={[
                          ancora ? 'pl-ativa' : '',
                          dentro && !ancora ? 'pl-na-faixa' : '',
                          l < linhasDaTabela && c < colunasDaTabela ? 'pl-na-tabela' : '',
                        ].filter(Boolean).join(' ')}
                        style={{
                          textAlign: h === 'centro' ? 'center' : h === 'direita' ? 'right' : 'left',
                          verticalAlign: cel.v === 'meio' ? 'middle' : cel.v === 'acima' ? 'top' : 'bottom',
                          fontWeight: cel.negrito ? 700 : 400,
                        }}>
                        {/* O autoFocus é só de quem começou a editar *na
                            célula*: dado à célula durante a digitação na barra,
                            era ele que roubava o foco a cada tecla. */}
                        {ancora && editando === 'celula' ? (
                          <input
                            className="pl-celula-entrada"
                            autoFocus
                            value={barra}
                            onChange={e => setBarra(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') { e.preventDefault(); confirmar(barra, e.shiftKey ? 'cima' : 'baixo'); gradeRef.current?.focus(); }
                              if (e.key === 'Tab') { e.preventDefault(); confirmar(barra, e.shiftKey ? 'esquerda' : 'direita'); gradeRef.current?.focus(); }
                              if (e.key === 'Escape') { e.preventDefault(); cancelarEdicao(); gradeRef.current?.focus(); }
                            }}
                            onBlur={() => {
                              if (cancelando.current) { cancelando.current = false; return; }
                              confirmar(barra);
                            }} />
                        ) : (
                          <span
                            onDoubleClick={() => { setBarra(cel.texto); setEditando('celula'); }}
                            className="pl-valor">
                            {mostrado}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>


        {/* ── O menu do botão direito ──────────────────────────────────────
            Quem usa Excel resolve quase tudo por aqui, e é o primeiro lugar
            onde essa pessoa clica quando quer inserir ou excluir uma linha.
            Os itens são os do Excel, e mudam conforme o clique foi na célula,
            no cabeçalho da coluna ou no da linha. */}
        {contexto && (
          <>
            <div className="pl-veu" onPointerDown={() => setContexto(null)} onContextMenu={e => { e.preventDefault(); setContexto(null); }} />
            <div
              className="pl-contexto" role="menu"
              style={{ left: Math.min(contexto.x, window.innerWidth - 240), top: Math.min(contexto.y, window.innerHeight - 320) }}>
              <ItemDoMenu aoClicar={recortar} atalho="Ctrl+X">
                <Scissors className="w-3.5 h-3.5" /> Recortar
              </ItemDoMenu>
              <ItemDoMenu aoClicar={copiar} atalho="Ctrl+C">
                <Copy className="w-3.5 h-3.5" /> Copiar
              </ItemDoMenu>
              <ItemDoMenu aoClicar={colar} atalho="Ctrl+V">
                <ClipboardPaste className="w-3.5 h-3.5" /> Colar
              </ItemDoMenu>
              <div className="pl-menu-risco" />
              {contexto.alvo === 'coluna' && (
                <>
                  <ItemDoMenu aoClicar={inserirColuna}>Inserir coluna à esquerda</ItemDoMenu>
                  <ItemDoMenu aoClicar={excluirColuna}>Excluir coluna</ItemDoMenu>
                  <div className="pl-menu-risco" />
                  <ItemDoMenu aoClicar={pedirLargura}>Largura da Coluna…</ItemDoMenu>
                  <ItemDoMenu aoClicar={() => ajustarAoConteudo(sel.c)}>AutoAjuste da Largura</ItemDoMenu>
                </>
              )}
              {contexto.alvo === 'linha' && (
                <>
                  <ItemDoMenu aoClicar={inserirLinha}>Inserir linha acima</ItemDoMenu>
                  <ItemDoMenu aoClicar={excluirLinha}>Excluir linha</ItemDoMenu>
                  <div className="pl-menu-risco" />
                  <ItemDoMenu aoClicar={pedirAltura}>Altura da Linha…</ItemDoMenu>
                  <ItemDoMenu aoClicar={() => ajustarLinhaAoConteudo(sel.l)}>AutoAjuste da Altura</ItemDoMenu>
                </>
              )}
              {contexto.alvo === 'celula' && (
                <>
                  <ItemDoMenu aoClicar={inserirLinha}>Inserir linha acima</ItemDoMenu>
                  <ItemDoMenu aoClicar={inserirColuna}>Inserir coluna à esquerda</ItemDoMenu>
                  <ItemDoMenu aoClicar={excluirLinha}>Excluir linha</ItemDoMenu>
                  <ItemDoMenu aoClicar={excluirColuna}>Excluir coluna</ItemDoMenu>
                  <div className="pl-menu-risco" />
                  <ItemDoMenu aoClicar={limparConteudo} atalho="Delete">
                    <Eraser className="w-3.5 h-3.5" /> Limpar conteúdo
                  </ItemDoMenu>
                  <ItemDoMenu aoClicar={mesclar}>
                    <Combine className="w-3.5 h-3.5" /> Mesclar e centralizar
                  </ItemDoMenu>
                  <ItemDoMenu aoClicar={desmesclar}>
                    <Split className="w-3.5 h-3.5" /> Desfazer mesclagem
                  </ItemDoMenu>
                  <div className="pl-menu-risco" />
                  <ItemDoMenu aoClicar={() => avisar('A caixa Formatar Células existe no Excel de verdade. Aqui a formatação está na faixa, em Fonte, Alinhamento e Estilos.')}>
                    Formatar Células…
                  </ItemDoMenu>
                </>
              )}
            </div>
          </>
        )}

        {/* As guias de planilha, e o + de acrescentar.

            É a fileira que mais diz "isto é uma planilha", e ela não existia:
            o nome da planilha aparecia solto na barra de status, onde ninguém
            procura por ele. */}
        <div className="pl-abas">
          <button type="button" className="pl-aba" aria-current="true">Planilha1</button>
          <button type="button" className="pl-aba-mais" title="Nova planilha"
            onClick={() => avisar('Acrescentar planilhas existe no programa de verdade, e não faz parte deste exercício.')}>
            +
          </button>
        </div>

        {/* Barra de status.

            Com faixa selecionada ela mostra média, contagem e soma — que é o
            que a planilha de verdade põe aí, e é como muita gente soma uma
            coluna sem escrever fórmula nenhuma. */}
        <div className="pl-status">
          <span>{resumoDaFaixa ?? 'Pronto'}</span>
          <span className="ml-auto">{nomeDaFaixa(faixa)}</span>
          <span>
            {p.celulas[sel.l][sel.c].texto.startsWith('=')
              ? `Fórmula — resultado ${valorDe(p, sel.l, sel.c)}`
              : ''}
          </span>
        </div>
      </div>
    </LaboratorioEmTelaCheia>
  );
}

/*
  A planilha genérica: o verde da guia, o cinza dos cabeçalhos, a borda grossa
  da célula ativa. As três planilhas que o desbravador pode encontrar arrumam
  isso do mesmo jeito, e é o arranjo que ele precisa reconhecer.
*/
const CSS_PLANILHA = `
.pl-janela {
  background: #F3F2F1; color: #201F1E;
  flex: 1; display: flex; flex-direction: column; min-height: 0;
  font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
}
.pl-titulo {
  background: #F9F8F7; border-bottom: 1px solid #E1DFDD;
  display: flex; align-items: center; gap: 10px; padding: 6px 10px; font-size: 12px;
}
.pl-guias { display: flex; background: #F3F2F1; border-bottom: 1px solid #E1DFDD; padding: 0 6px; }
.pl-guia {
  padding: 6px 12px; font-size: 12.5px; color: #201F1E;
  border-bottom: 2px solid transparent; background: transparent;
}
.pl-guia:hover { background: #EDEBE9; }
.pl-guia[aria-selected="true"] { color: #217346; border-bottom-color: #217346; font-weight: 600; }
.pl-faixa {
  display: flex; gap: 2px; background: #FFFFFF; border-bottom: 1px solid #E1DFDD;
  padding: 3px 6px 0; overflow-x: auto;
}
.pl-grupo { display: flex; flex-direction: column; border-right: 1px solid #E1DFDD; padding: 0 6px; }
.pl-grupo-corpo { display: flex; align-items: flex-start; gap: 3px; padding: 2px 0 4px; }
.pl-grupo-nome {
  font-size: 10px; color: #605E5C; text-align: center; padding-bottom: 3px;
  /* Nome de grupo não quebra: "Área de Transferência" em duas linhas empurrava
     a faixa inteira para baixo, e o Excel não faz isso. */
  white-space: nowrap;
}
.pl-bt {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 24px; padding: 4px 5px; border-radius: 3px; color: #201F1E;
}
.pl-bt:hover { background: #EDEBE9 !important; }
.pl-bt:focus-visible { outline: 2px solid #217346; outline-offset: 1px; }
.pl-sep { width: 1px; align-self: stretch; background: #E1DFDD; margin: 2px 3px; }

.pl-formula {
  display: flex; align-items: center; gap: 6px; padding: 4px 8px;
  background: #FFFFFF; border-bottom: 1px solid #E1DFDD;
}
.pl-nome {
  min-width: 62px; font-size: 12px; padding: 3px 6px;
  border: 1px solid #D2D0CE; border-radius: 2px; background: #FFFFFF;
}
.pl-fx { font-style: italic; color: #605E5C; font-size: 12px; }
.pl-entrada {
  flex: 1; border: 1px solid #D2D0CE; border-radius: 2px; padding: 3px 6px;
  font-size: 12.5px; font-family: inherit; background: #FFFFFF; color: #201F1E;
}
.pl-entrada:focus { outline: 1px solid #217346; }

.pl-grade-caixa { flex: 1; min-height: 0; overflow: auto; background: #FFFFFF; padding-bottom: 20px; }
.pl-grade { border-collapse: collapse; table-layout: fixed; }
.pl-canto { width: 34px; background: #F3F2F1; border: 1px solid #D2D0CE; position: sticky; left: 0; z-index: 2; }
.pl-cab-col, .pl-cab-lin {
  background: #F3F2F1; border: 1px solid #D2D0CE; color: #605E5C;
  font-size: 11.5px; font-weight: 600; position: relative;
}
.pl-cab-col { height: 20px; }
.pl-cab-lin { width: 34px; position: sticky; left: 0; z-index: 1; }
/* As alças ficam por cima da borda do cabeçalho, como na planilha de verdade:
   é ali que o ponteiro vira seta dupla. */
.pl-alca-col { position: absolute; top: 0; right: -3px; width: 7px; height: 100%; cursor: col-resize; }
.pl-alca-lin { position: absolute; left: 0; bottom: -3px; height: 7px; width: 100%; cursor: row-resize; }

.pl-grade td {
  border: 1px solid #E1DFDD; padding: 2px 5px; font-size: 12.5px;
  overflow: hidden; white-space: nowrap;
}
.pl-ativa { outline: 2px solid #217346; outline-offset: -2px; }
/* A faixa selecionada: azulada, com a âncora branca por dentro. É assim que a
   planilha mostra o que vai ser mesclado, somado ou formatado — sem isso, quem
   arrasta não vê que arrastou. */
.pl-na-faixa { background: #E3EFE8; }
.pl-valor { display: block; min-height: 15px; cursor: cell; }
/* A grade não é para selecionar texto com o ponteiro: arrastar seleciona
   células, e o texto azul do navegador por cima disso confunde as duas coisas. */
.pl-grade { user-select: none; }
.pl-celula-entrada, .pl-entrada { user-select: text; }
.pl-celula-entrada {
  width: 100%; border: none; outline: none; background: transparent;
  font: inherit; color: inherit;
}

/* Formatação automática: o estilo pronto, com cabeçalho pintado e faixas.

   A faixa alternada começa na linha 3, e não na 2: a linha 2 é o cabeçalho, e
   ela também é par. Com as duas regras valendo, a de baixo levava o fundo — o
   cabeçalho ficava verde-claro com a letra branca por cima, ilegível, e a
   tabela continuava parecendo formatada. É a armadilha de sempre: a superfície
   clara precisa dizer a própria cor. */
/* O estilo pega só o que está dentro da tabela, marcado pela classe pl-na-tabela.
   As listras começam na terceira linha porque a segunda é o cabeçalho, e as
   duas regras casavam com ela: a última escrita ganhava o fundo, e o cabeçalho
   saía branco sobre verde claro em vez de branco sobre verde escuro. */
.pl-layout-automatico td.pl-na-tabela { border-color: #A9C7B1; }
.pl-layout-automatico tr:nth-child(n+3):nth-child(even) td.pl-na-tabela { background: #EAF3EC; }
.pl-layout-automatico tr:nth-child(2) td.pl-na-tabela { background: #217346; color: #FFFFFF; font-weight: 600; }
/* Manual: bordas e preenchimento escolhidos, sem faixa alternada. */
.pl-layout-manual td.pl-na-tabela { border: 1px solid #605E5C; background: #FBFBF9; }

.pl-status {
  display: flex; align-items: center; gap: 14px; padding: 4px 10px;
  background: #F3F2F1; border-top: 1px solid #E1DFDD; font-size: 11.5px; color: #605E5C;
}
.pl-menu {
  position: absolute; z-index: 40; top: 100%; left: 0; margin-top: 2px;
  background: #FFFFFF; border: 1px solid #C8C6C4; border-radius: 3px;
  box-shadow: 0 6px 18px rgba(0,0,0,.22); min-width: 232px; padding: 4px;
}
/* O menu do botão direito é preso à janela, e não à célula: célula com
   overflow escondido recortaria o menu pela metade. */
.pl-contexto {
  position: fixed; z-index: 60;
  background: #FFFFFF; border: 1px solid #C8C6C4; border-radius: 4px;
  box-shadow: 0 8px 24px rgba(0,0,0,.26); min-width: 224px; padding: 4px;
}
.pl-veu { position: fixed; inset: 0; z-index: 50; }
.pl-menu-item {
  display: flex; align-items: center; gap: 8px; width: 100%; text-align: left;
  padding: 7px 10px; font-size: 12.5px; border: none; border-radius: 2px;
  cursor: pointer; color: #201F1E; background: transparent;
}
.pl-menu-item:hover { background: #EDEBE9; }
/* O rótulo é uma linha só, com o ícone ao lado do texto: sem isto o ícone
   empurrava a palavra para a linha de baixo e cada item ficava com dois
   andares. */
.pl-menu-rotulo { display: flex; align-items: center; gap: 8px; white-space: nowrap; }
.pl-menu-atalho { margin-left: auto; padding-left: 18px; color: #8A8886; font-size: 11px; }
.pl-menu-risco { height: 1px; background: #E1DFDD; margin: 4px 6px; }
.pl-linhas { display: flex; flex-direction: column; gap: 3px; }
.pl-combo {
  display: inline-flex; align-items: center; height: 22px; padding: 0 6px;
  border: 1px solid #C8C6C4; background: #FFFFFF; color: #201F1E;
  border-radius: 2px; font-size: 11.5px; white-space: nowrap; overflow: hidden;
}
/* A grade tem foco para receber o teclado, e o contorno do navegador em volta
   dela inteira não diz nada — quem mostra onde está o cursor é a célula. */
.pl-grade-caixa:focus { outline: none; }
.pl-guia-arquivo { background: #217346; color: #FFFFFF; border-radius: 3px 3px 0 0; }
.pl-abas {
  display: flex; align-items: stretch; gap: 2px; padding: 0 8px;
  background: #F3F2F1; border-top: 1px solid #E1DFDD;
}
.pl-aba {
  padding: 5px 14px; font-size: 12px; color: #201F1E; background: transparent;
  border: none; border-top: 2px solid transparent; cursor: pointer;
}
.pl-aba[aria-current="true"] {
  background: #FFFFFF; color: #217346; font-weight: 600; border-top-color: #217346;
}
.pl-aba-mais {
  padding: 5px 10px; font-size: 14px; color: #605E5C; background: transparent;
  border: none; cursor: pointer;
}
.pl-aba-mais:hover { background: #EDEBE9; }
`;
