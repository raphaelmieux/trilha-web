import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlignLeft, AlignCenter, AlignRight, ChevronsUp, ChevronsDown, Minus,
  Combine, Split, Rows3, Columns3, Trash2, Table2, Paintbrush, Grid2x2,
  Sigma, FileCheck2, RotateCcw, X, Bold, Percent, Palette,
} from 'lucide-react';
import LaboratorioEmTelaCheia from '../components/LaboratorioEmTelaCheia';
import {
  upsertRequirementProgress, getRequirementId, getSpecialtyId,
  ensureEnrollment, updateEnrollmentActivity, logActivity,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import type { PropsDeLaboratorio as Props } from './tipos';
import {
  PLANILHA_INICIAL, LARGURA_PADRAO, ALTURA_PADRAO, METAS_DA_PLANILHA as METAS,
  vazia, nomeDaCelula, valorDe, refazerMesclagens, alinhamentoDe, ehNumero,
  normalizar, naFaixa, umaCelulaSo, nomeDaFaixa, larguraDaTabela, alturaDaTabela,
  excluirColunaDe, inserirColunaEm,
  type Planilha, type AlinhaH, type AlinhaV, type Faixa,
} from './metasDaAp043';

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
 * O programa imitado é a planilha genérica, e não uma marca — como o editor de
 * código da vereda, e ao contrário do Word. Excel, Calc e Google Planilhas
 * arrumam essas peças no mesmo lugar, e o desbravador vai encontrar qualquer um
 * dos três. O que se repete entre eles é o arranjo, e é ele que está aqui.
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
  const [p, setP] = useState<Planilha>(PLANILHA_INICIAL);
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
  const [editando, setEditando] = useState(false);
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

  const mudar = (f: (p: Planilha) => Planilha) => setP(f);

  /* ── Seleção e escrita ── */

  const selecionar = (l: number, c: number) => {
    setFaixa({ l1: l, c1: c, l2: l, c2: c });
    setBarra(p.celulas[l][c].texto);
    setEditando(false);
  };

  const confirmar = (texto: string) => {
    mudar(atual => ({
      ...atual,
      celulas: atual.celulas.map((linha, i) =>
        linha.map((cel, j) => (i === sel.l && j === sel.c ? { ...cel, texto } : cel))),
    }));
    setEditando(false);
  };

  /* ── Alinhamento ── */

  const alinharH = (h: AlinhaH) => mudar(a => ({
    ...a,
    celulas: a.celulas.map((linha, i) => linha.map((cel, j) => (i === sel.l && j === sel.c ? { ...cel, h } : cel))),
  }));

  const alinharV = (v: AlinhaV) => mudar(a => ({
    ...a,
    celulas: a.celulas.map((linha, i) => linha.map((cel, j) => (i === sel.l && j === sel.c ? { ...cel, v } : cel))),
  }));

  /* ── Mesclar ── */

  const mesclar = () => {
    const largura = area.dir - area.esq + 1;
    if (largura < 2) {
      avisar('Selecione mais de uma célula antes de mesclar: clique numa e arraste até a última.');
      return;
    }
    /* Só o conteúdo da primeira célula sobrevive, como na planilha de verdade.
       Avisar disso importa porque é irreversível: desfazer a mesclagem devolve
       as células vazias, e não o que estava escrito nelas. */
    const perdido = p.celulas
      .slice(area.topo, area.base + 1)
      .some(l => l.slice(area.esq + 1, area.dir + 1).some(c => c.texto.trim() !== ''));
    mudar(a => ({
      ...a,
      celulas: refazerMesclagens(a.celulas.map((l, i) => (
        i < area.topo || i > area.base ? l : l.map((cel, j) => {
          if (j === area.esq) return { ...cel, span: largura, h: 'centro' as AlinhaH };
          if (j > area.esq && j <= area.dir) return { ...cel, coberta: true, texto: '' };
          return cel;
        })
      ))),
    }));
    if (perdido) {
      avisar('Mesclar manteve só o conteúdo da primeira célula — o das outras foi apagado. É assim na planilha de verdade, e desfazer a mesclagem não o traz de volta.');
    }
  };

  const desmesclar = () => {
    mudar(a => ({
      ...a,
      celulas: a.celulas.map((l, i) => (
        i < area.topo || i > area.base ? l : l.map(cel => ({ ...cel, span: 1, coberta: false })))),
    }));
  };

  /* ── Linhas e colunas ── */

  const inserirLinha = () => mudar(a => {
    const celulas = [...a.celulas];
    celulas.splice(sel.l + 1, 0, a.celulas[0].map(() => vazia()));
    const alturas = [...a.alturas];
    alturas.splice(sel.l + 1, 0, ALTURA_PADRAO);
    return { ...a, celulas, alturas };
  });

  const excluirLinha = () => {
    if (p.celulas.length <= 2) { avisar('A planilha ficaria quase sem linhas.'); return; }
    mudar(a => ({
      ...a,
      celulas: a.celulas.filter((_, i) => i !== sel.l),
      alturas: a.alturas.filter((_, i) => i !== sel.l),
    }));
    setFaixa(f => { const l = Math.max(0, f.l1 - 1); return { l1: l, c1: f.c1, l2: l, c2: f.c1 }; });
  };

  const inserirColuna = () => mudar(a => ({
    ...a,
    celulas: inserirColunaEm(a.celulas, sel.c + 1),
    larguras: (() => { const w = [...a.larguras]; w.splice(sel.c + 1, 0, LARGURA_PADRAO); return w; })(),
  }));

  const excluirColuna = () => {
    if (p.celulas[0].length <= 2) { avisar('A planilha ficaria quase sem colunas.'); return; }
    mudar(a => ({
      ...a,
      celulas: excluirColunaDe(a.celulas, sel.c),
      larguras: a.larguras.filter((_, i) => i !== sel.c),
    }));
    setFaixa(f => { const c = Math.max(0, f.c1 - 1); return { l1: f.l1, c1: c, l2: f.l1, c2: c }; });
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
    setP(PLANILHA_INICIAL);
    setFaixa({ l1: 0, c1: 0, l2: 0, c2: 0 });
    setBarra('');
    setEditando(false);
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

        {/* Guias */}
        <div className="pl-guias" role="tablist">
          <button role="tab" aria-selected="true" className="pl-guia">Início</button>
          <button role="tab" aria-selected="false" className="pl-guia"
            onClick={() => avisar('A guia Inserir existe na planilha de verdade, e não faz parte deste exercício.')}>
            Inserir
          </button>
          <button role="tab" aria-selected="false" className="pl-guia"
            onClick={() => avisar('A guia Fórmulas existe na planilha de verdade. Aqui a fórmula se escreve direto na célula, que é como se faz na prática.')}>
            Fórmulas
          </button>
        </div>

        {/* Faixa de opções */}
        <div className="pl-faixa">
          <Grupo nome="Fonte">
            <Bt dica="Negrito" ativo={p.celulas[sel.l][sel.c].negrito}
              aoClicar={() => mudar(a => ({
                ...a,
                celulas: a.celulas.map((l, i) => l.map((cel, j) =>
                  (i === sel.l && j === sel.c ? { ...cel, negrito: !cel.negrito } : cel))),
              }))}>
              <Bold className="w-4 h-4" />
            </Bt>
            <Enfeite dica="Cor da fonte"><Palette className="w-4 h-4" /></Enfeite>
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
            <Bt dica="Inserir Linha" aoClicar={inserirLinha}>
              <span className="flex flex-col items-center">
                <Rows3 className="w-4 h-4" />
                <span style={{ fontSize: 9 }}>+ linha</span>
              </span>
            </Bt>
            <Bt dica="Inserir Coluna" aoClicar={inserirColuna}>
              <span className="flex flex-col items-center">
                <Columns3 className="w-4 h-4" />
                <span style={{ fontSize: 9 }}>+ coluna</span>
              </span>
            </Bt>
            <Bt dica="Excluir Linha" aoClicar={excluirLinha}>
              <span className="flex flex-col items-center">
                <Trash2 className="w-4 h-4" />
                <span style={{ fontSize: 9 }}>− linha</span>
              </span>
            </Bt>
            <Bt dica="Excluir Coluna" aoClicar={excluirColuna}>
              <span className="flex flex-col items-center">
                <Trash2 className="w-4 h-4" />
                <span style={{ fontSize: 9 }}>− coluna</span>
              </span>
            </Bt>
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
                setEditando(true);
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
          <input
            className="pl-entrada"
            value={editando ? barra : p.celulas[sel.l][sel.c].texto}
            onChange={e => { setBarra(e.target.value); setEditando(true); }}
            onKeyDown={e => { if (e.key === 'Enter') confirmar(barra); }}
            onBlur={() => editando && confirmar(barra)}
            placeholder="Escreva aqui, ou uma fórmula começando por ="
          />
        </div>

        {/* A grade */}
        <div
          className="pl-grade-caixa"
          onPointerMove={moverArrasto}
          onPointerUp={() => { soltarArrasto(); setArrastandoFaixa(false); }}
          onPointerLeave={() => setArrastandoFaixa(false)}>
          <table className={`pl-grade pl-layout-${p.layout}`}>
            <thead>
              <tr>
                <th className="pl-canto" />
                {p.larguras.map((w, c) => (
                  <th key={c} className="pl-cab-col" style={{ width: w, minWidth: w }}>
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
                  <th className="pl-cab-lin">
                    {l + 1}
                    <span
                      className="pl-alca-lin"
                      title="Arraste para mudar a altura"
                      onPointerDown={e => comecarArrasto('linha', l, e)} />
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
                          if (e.button !== 0) return;
                          if (e.shiftKey) { setFaixa(f => ({ ...f, l2: l, c2: c })); return; }
                          selecionar(l, c);
                          setArrastandoFaixa(true);
                        }}
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
                        {ancora && editando ? (
                          <input className="pl-celula-entrada" autoFocus value={barra}
                            onChange={e => setBarra(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') confirmar(barra); }}
                            onBlur={() => confirmar(barra)} />
                        ) : (
                          <span
                            onDoubleClick={() => { setBarra(cel.texto); setEditando(true); }}
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
.pl-grupo-nome { font-size: 10px; color: #605E5C; text-align: center; padding-bottom: 3px; }
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
