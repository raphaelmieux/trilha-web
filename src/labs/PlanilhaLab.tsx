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
  vazia, nomeDaCelula, valorDe, refazerMesclagens,
  type Planilha, type AlinhaH, type AlinhaV,
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
  const [sel, setSel] = useState<{ l: number; c: number }>({ l: 0, c: 0 });
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
    setSel({ l, c });
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
    const linha = p.celulas[sel.l];
    const restantes = linha.length - sel.c;
    if (restantes < 2) { avisar('Não há colunas suficientes à direita para mesclar.'); return; }
    const perdido = linha.slice(sel.c + 1).some(c => c.texto.trim() !== '');
    mudar(a => ({
      ...a,
      celulas: a.celulas.map((l, i) => (i !== sel.l ? l : l.map((cel, j) => {
        if (j === sel.c) return { ...cel, span: restantes, h: 'centro' as AlinhaH };
        if (j > sel.c) return { ...cel, coberta: true, texto: '' };
        return cel;
      }))),
    }));
    if (perdido) {
      avisar('Mesclar manteve só o conteúdo da primeira célula — o das outras foi apagado. É assim na planilha de verdade, e desfazer a mesclagem não o traz de volta.');
    }
  };

  const desmesclar = () => {
    mudar(a => ({
      ...a,
      celulas: a.celulas.map((l, i) => (i !== sel.l ? l : l.map(cel => ({ ...cel, span: 1, coberta: false })))),
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
    setSel(s => ({ ...s, l: Math.max(0, s.l - 1) }));
  };

  const inserirColuna = () => mudar(a => ({
    ...a,
    celulas: refazerMesclagens(a.celulas.map(l => {
      const nova = [...l];
      nova.splice(sel.c + 1, 0, vazia());
      return nova;
    })),
    larguras: (() => { const w = [...a.larguras]; w.splice(sel.c + 1, 0, LARGURA_PADRAO); return w; })(),
  }));

  const excluirColuna = () => {
    if (p.celulas[0].length <= 2) { avisar('A planilha ficaria quase sem colunas.'); return; }
    mudar(a => ({
      ...a,
      celulas: refazerMesclagens(a.celulas.map(l => l.filter((_, i) => i !== sel.c))),
      larguras: a.larguras.filter((_, i) => i !== sel.c),
    }));
    setSel(s => ({ ...s, c: Math.max(0, s.c - 1) }));
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
    setSel({ l: 0, c: 0 });
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
                setBarra(`=SOMA(${String.fromCharCode(65 + sel.c)}1:${String.fromCharCode(65 + sel.c)}${sel.l})`);
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
          <span className="pl-nome">{nomeDaCelula(sel.l, sel.c)}</span>
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
        <div className="pl-grade-caixa" onPointerMove={moverArrasto} onPointerUp={soltarArrasto}>
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
                    const ativa = sel.l === l && sel.c === c;
                    return (
                      <td
                        key={c}
                        colSpan={cel.span}
                        onClick={() => selecionar(l, c)}
                        className={ativa ? 'pl-ativa' : ''}
                        style={{
                          textAlign: cel.h === 'centro' ? 'center' : cel.h === 'direita' ? 'right' : 'left',
                          verticalAlign: cel.v === 'meio' ? 'middle' : cel.v === 'acima' ? 'top' : 'bottom',
                          fontWeight: cel.negrito ? 700 : 400,
                        }}>
                        {ativa && editando ? (
                          <input className="pl-celula-entrada" autoFocus value={barra}
                            onChange={e => setBarra(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') confirmar(barra); }}
                            onBlur={() => confirmar(barra)} />
                        ) : (
                          <span
                            onDoubleClick={() => { setBarra(cel.texto); setEditando(true); }}
                            className="pl-valor">
                            {valorDe(p, l, c)}
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

        {/* Barra de status */}
        <div className="pl-status">
          <span>Planilha1</span>
          <span>{nomeDaCelula(sel.l, sel.c)}</span>
          <span className="ml-auto">
            {p.celulas[sel.l][sel.c].texto.startsWith('=')
              ? `Fórmula — resultado ${valorDe(p, sel.l, sel.c)}`
              : 'Pronto'}
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
.pl-valor { display: block; min-height: 15px; cursor: cell; }
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
.pl-layout-automatico td { border-color: #A9C7B1; }
.pl-layout-automatico tr:nth-child(n+3):nth-child(even) td { background: #EAF3EC; }
.pl-layout-automatico tr:nth-child(2) td { background: #217346; color: #FFFFFF; font-weight: 600; }
/* Manual: bordas e preenchimento escolhidos, sem faixa alternada. */
.pl-layout-manual td { border: 1px solid #605E5C; background: #FBFBF9; }

.pl-status {
  display: flex; align-items: center; gap: 14px; padding: 4px 10px;
  background: #F3F2F1; border-top: 1px solid #E1DFDD; font-size: 11.5px; color: #605E5C;
}
`;
