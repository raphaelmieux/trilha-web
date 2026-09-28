import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlignLeft, AlignCenter, AlignRight, ChevronsUp, ChevronsDown, Minus,
  Combine, Split, Rows3, Trash2, Table2, Paintbrush, Grid2x2,
  Sigma, FileCheck2, RotateCcw, Bold, Percent, Palette,
  ChevronDown, Ruler, Copy, ClipboardPaste, Scissors, Eraser, Undo2, Redo2,
  Italic, Underline, PaintBucket,
} from 'lucide-react';
import LaboratorioEmTelaCheia from '../components/LaboratorioEmTelaCheia';
import {
  CSS_EXCEL, BarraDeTituloDoExcel, GuiasDoExcel, AbasDoExcel, GradeDoExcel,
} from './excel';
import { useGradeDoExcel } from './gradeDoExcel';
import {
  upsertRequirementProgress, getRequirementId, getSpecialtyId,
  ensureEnrollment, updateEnrollmentActivity, logActivity,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import type { PropsDeLaboratorio as Props } from './tipos';
import {
  PLANILHA_INICIAL, METAS_DA_PLANILHA as METAS,
  nomeDaCelula, valorDe, ehNumero,
  normalizar, naFaixa, umaCelulaSo, nomeDaFaixa, larguraDaTabela, alturaDaTabela,
  type Planilha, type AlinhaH, type AlinhaV,
} from './metasDaAp043';
import {
  inserirLinha as inserirLinhaEm, excluirLinha as excluirLinhaDe,
  inserirColuna as inserirColunaNa, excluirColuna as excluirColunaNa,
  mesclar as mesclarFaixa, desmesclar as desmesclarFaixa, mesclagemApaga,
  historicoDe, registrar as empilhar, desfazer as desfazerHist, refazer as refazerHist,
  type Historico,
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
  const [aviso, setAviso] = useState('');
  /** Menu do botão direito: onde abriu e sobre o quê. */
  const [contexto, setContexto] = useState<
    { x: number; y: number; alvo: 'celula' | 'coluna' | 'linha' } | null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [gravando, setGravando] = useState(false);
  const [erro, setErro] = useState('');
  const [pronto, setPronto] = useState(false);

  const avisar = (texto: string) => {
    setAviso(texto);
    window.setTimeout(() => setAviso(a => (a === texto ? '' : a)), 7000);
  };

  /** Toda mudança passa por aqui, e por isso Ctrl+Z alcança todas elas. */
  const mudar = (f: (p: Planilha) => Planilha) => setHist(h => empilhar(h, f(h.presente)));

  /*
    A seleção, a edição, o teclado e a área de transferência moram em
    `useGradeDoExcel`.

    Estavam escritas aqui e escritas de novo no laboratório da CC-ES003, e as
    duas já tinham divergido: ali o Ctrl+C não copiava nada. Quem aprendeu a
    copiar e colar nesta trilha chegava na vereda, apertava Ctrl+C, e nada
    acontecia — sem erro, sem aviso, e sem nada na tela dizendo que ali aquilo
    não existe.

    O estado da pasta continua sendo daqui: é este componente que guarda o
    histórico, e é o `mudar` acima que o gancho chama — o que faz o Ctrl+Z
    alcançar tudo, inclusive o que o gancho mexe. O gancho guarda só o que é do
    gesto: onde está a seleção, o que está sendo digitado, de onde o arrasto
    começou.
  */
  const g = useGradeDoExcel({
    planilha: p,
    mudar,
    desfazer: () => setHist(desfazerHist),
    refazer: () => setHist(refazerHist),
    avisar,
  });
  const { faixa, setFaixa, sel, setBarra, setEditando } = g;
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

  /*
    O menu do botão direito é deste laboratório, e não do gancho: a CC-ES003
    não tem nenhum. Então todo gesto que o gancho oferece passa por um
    invólucro que o fecha antes — deixá-lo aberto por cima de uma linha que
    acabou de sumir mostra comandos que agiriam noutra linha.
  */
  const semMenu = <A extends unknown[]>(f: (...a: A) => void) => (...a: A) => { setContexto(null); f(...a); };

  const selecionar = semMenu(g.selecionar);
  const copiar = semMenu(g.copiar);
  const recortar = semMenu(g.recortar);
  const colar = semMenu(g.colar);
  const limparConteudo = semMenu(g.limparConteudo);
  const desfazer = semMenu(g.desfazer);
  const refazer = semMenu(g.refazer);
  const ajustar = semMenu(g.aoAjustarAoConteudo);
  const aoTeclar = (e: React.KeyboardEvent) => { setContexto(null); g.aoTeclar(e); };

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


  const recomecar = () => {
    setHist(historicoDe(PLANILHA_INICIAL));
    setFaixa({ l1: 0, c1: 0, l2: 0, c2: 0 });
    setBarra('');
    setEditando(null);
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
      }, specialtyCode);
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
      /* "excel", e não "planilha": a lembrança do aviso de tela pequena é por
         programa imitado, e os três laboratórios de planilha imitam o mesmo.
         Com duas chaves, quem dispensava o aviso aqui era avisado de novo na
         AP044 e na CC-ES003 — e aviso que volta é o que ensina a pessoa a não
         ler avisos. */
      programa="excel"
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
      rodape={26}
    >
      <style>{CSS_EXCEL}</style>

      <div className="pl-janela">
        <BarraDeTituloDoExcel arquivo="orcamento-do-acampamento" aoAvisar={avisar} />

        {/* Só Página Inicial faz parte deste exercício; as outras aparecem
            apagadas e dizem isso, para que ninguém aprenda que o Excel não as
            tem. A fileira vem de `excel.tsx`, compartilhada com a AP044. */}
        <GuiasDoExcel atual="Página Inicial" usaveis={['Página Inicial']}
          aoTrocar={() => { /* só há uma usável */ }} aoAvisar={avisar} />

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
              <ItemDoMenu aoClicar={() => { ajustar('linha', sel.l); fecharMenu(); }}>
                AutoAjuste da Altura da Linha
              </ItemDoMenu>
              <div className="pl-menu-risco" />
              <ItemDoMenu aoClicar={pedirLargura}>Largura da Coluna…</ItemDoMenu>
              <ItemDoMenu aoClicar={() => { ajustar('coluna', sel.c); fecharMenu(); }}>
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
          <span className="pl-nome" aria-label="Caixa de nome">{nomeDaFaixa(faixa)}</span>
          <span className="pl-fx">fx</span>
          {/* O que a barra faz mora no gancho, junto da edição na célula: as
              duas dividem o mesmo `barra`, o mesmo `editando` e a mesma guarda
              de cancelamento, e escrever uma delas por fora custaria justamente
              essa guarda. Os dois defeitos que esta barra já teve estão
              anotados lá. */}
          <input
            className="pl-entrada"
            {...g.propsDaBarra}
            placeholder="Escreva aqui, ou uma fórmula começando por ="
          />
        </div>

        {/* A grade */}
        {/* A caixa da grade recebe o teclado: `tabIndex` a torna focável, e o
            foco vai para ela sempre que alguém clica numa célula. Sem isso as
            setas rolariam a página em vez de andar pela planilha. */}
        {/*
          A grade mora em excel.tsx, e não aqui.

          Ela saiu no dia em que a CC-ES003 precisou da mesma grade — antes de
          a cópia existir, que é a decisão de word.tsx e de explorer.tsx. O que
          ficou aqui é do exercício: que botões a faixa oferece, que tarefas se
          conferem, e de que planilha se parte.

          Esta tela não passa aoComecarPreenchimento nem aoAbrirFiltro: a alça
          de preenchimento e o filtro não fazem parte do que a AP043 cobra, e
          peça que aparece sem ter o que fazer ensina a desconfiar do programa.

          O `aoContexto` é o contrário: o menu do botão direito é daqui, porque
          é aqui que se inserem e se excluem linhas. `g.props` traz só o núcleo
          que toda grade precisa, e cada laboratório escolhe os extras.
        */}
        <GradeDoExcel
          {...g.props}
          aoTeclar={aoTeclar}
          aoContexto={abrirContexto}
          aoArrastarBorda={g.aoArrastarBorda}
          aoAjustarAoConteudo={ajustar}
          naTabela={(l, c) => l < linhasDaTabela && c < colunasDaTabela}
        />


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
                  <ItemDoMenu aoClicar={() => ajustar('coluna', sel.c)}>AutoAjuste da Largura</ItemDoMenu>
                </>
              )}
              {contexto.alvo === 'linha' && (
                <>
                  <ItemDoMenu aoClicar={inserirLinha}>Inserir linha acima</ItemDoMenu>
                  <ItemDoMenu aoClicar={excluirLinha}>Excluir linha</ItemDoMenu>
                  <div className="pl-menu-risco" />
                  <ItemDoMenu aoClicar={pedirAltura}>Altura da Linha…</ItemDoMenu>
                  <ItemDoMenu aoClicar={() => ajustar('linha', sel.l)}>AutoAjuste da Altura</ItemDoMenu>
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
        <AbasDoExcel nome="Planilha1" aoAvisar={avisar} />

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
