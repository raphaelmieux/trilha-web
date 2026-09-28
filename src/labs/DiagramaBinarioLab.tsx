import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  MousePointer2, Cable, Trash2, Play, ArrowLeftRight, FileImage, RotateCcw, X, FileCheck2, Share2,
} from 'lucide-react';
import LaboratorioEmTelaCheia from '../components/LaboratorioEmTelaCheia';
import Prancheta from './editorDeDiagrama';
import { ICONE_DA_PECA } from './pecasDoDiagrama';
import {
  ALTURA, DIAGRAMA_INICIAL, LARGURA, METAS_DO_DIAGRAMA, NOME_DA_PECA, PALETA, VALORES_DAS_CHAVES,
  assinatura, bitsComoTexto, comSimulacao, problemaDaSeta, roteiroDoDiagrama, simular, valorDosBits,
  type Diagrama, type TipoDePeca,
} from './diagramaDoComputador';
import {
  upsertRequirementProgress, getRequirementId, getSpecialtyId,
  ensureEnrollment, updateEnrollmentActivity, logActivity, registrarConclusaoDeLicao,
} from '../lib/progress';
import type { PropsDeLaboratorio as Props } from './tipos';

/*
 * AP045 requisito 5 — o diagrama do caminho da informação.
 *
 * O desbravador recebe um rascunho com uma seta ao contrário e termina com o
 * diagrama que vai mostrar ao examinador: as peças, as setas no sentido em que
 * a informação anda, o código binário da letra C escrito na seta que sai do
 * teclado, e uma simulação que solta os bits e mostra onde eles chegam — ou
 * onde param.
 *
 * ── Por que um editor de diagramas, e não um formulário ─────────────────
 * O requisito diz "montar um diagrama". Um formulário com "de onde / para
 * onde" mediria saber a resposta; o editor mede montar, que é o gesto: pôr a
 * peça, puxar a seta, errar o sentido e ver a simulação parar.
 *
 * ── E o celular ─────────────────────────────────────────────────────────
 * Arrastar uma seta de uma caixa até outra com o dedo é impreciso, e quem usa
 * teclado não arrasta nada. Por isso a seta nasce em dois toques — Conectar,
 * a peça de onde sai, a peça onde chega —, que é como os editores de diagrama
 * no celular fazem. As peças se movem arrastando e também pelas setas do
 * teclado: reduzir a tela nunca reduz o que dá para fazer nela.
 *
 * O modelo, as metas e o passo a passo moram em `diagramaDoComputador.ts`.
 */

type Modo = 'mover' | 'conectar';

export default function DiagramaBinarioLab({ specialtyCode, lessonCode, lessonTitle, requirementCodes, userId }: Props) {
  const [d, setD] = useState<Diagrama>(DIAGRAMA_INICIAL);
  const [modo, setModo] = useState<Modo>('mover');
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [origem, setOrigem] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [aviso, setAviso] = useState('');
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState('');
  const [gravando, setGravando] = useState(false);
  const arrasto = useRef<{ id: string; dx: number; dy: number; moveu: boolean } | null>(null);
  const svg = useRef<SVGSVGElement | null>(null);

  const tarefas = METAS_DO_DIAGRAMA.map(m => ({
    id: m.id, titulo: m.titulo, detalhe: m.detalhe, onde: m.onde, passos: m.passos, feita: m.feita(d),
  }));
  const tudoFeito = tarefas.every(t => t.feita);

  /* A simulação só pinta o caminho enquanto vale para o desenho de agora. */
  const simulacaoAtual = d.simulacao && d.simulacao.assinatura === assinatura(d) ? simular(d) : null;
  const caminho = simulacaoAtual?.chegou ? simulacaoAtual.passos.map(p => p.setaId) : [];
  const erradas = simulacaoAtual ? simulacaoAtual.problemas.map(p => p.setaId) : [];

  const pecaSel = d.pecas.find(p => p.id === selecionada);
  const setaSel = d.setas.find(s => s.id === selecionada);

  /* ── Peças ──────────────────────────────────────────────────────────── */

  const porPeca = (tipo: TipoDePeca) => {
    /* Nasce num lugar livre da grade, e não em cima de outra peça. */
    const livres = [];
    for (let y = 80; y <= ALTURA - 60; y += 110) {
      for (let x = 100; x <= LARGURA - 90; x += 150) {
        if (!d.pecas.some(p => Math.abs(p.x - x) < 120 && Math.abs(p.y - y) < 80)) livres.push({ x, y });
      }
    }
    const lugar = livres[0] ?? { x: LARGURA / 2, y: ALTURA / 2 };
    const id = `p-${tipo}-${Date.now().toString(36)}`;
    setD(x => ({ ...x, pecas: [...x.pecas, { id, tipo, ...lugar }] }));
    setSelecionada(id);
    setAviso(`${NOME_DA_PECA[tipo]} na prancheta. Arraste para arrumar o desenho.`);
  };

  const excluir = () => {
    if (!selecionada) { setAviso('Selecione uma peça ou uma seta antes de excluir.'); return; }
    setD(x => ({
      ...x,
      pecas: x.pecas.filter(p => p.id !== selecionada),
      /* Seta sem uma das pontas não tem o que dizer: sai junto da peça. */
      setas: x.setas.filter(s => s.id !== selecionada && s.de !== selecionada && s.para !== selecionada),
    }));
    setSelecionada(null);
    setAviso('Excluído.');
  };

  const conectar = (id: string) => {
    if (!origem) {
      setOrigem(id);
      setAviso(`A seta vai sair de ${NOME_DA_PECA[d.pecas.find(p => p.id === id)!.tipo]}. Agora toque na peça onde ela chega.`);
      return;
    }
    if (origem === id) { setOrigem(null); setAviso('Seta cancelada.'); return; }
    if (d.setas.some(s => s.de === origem && s.para === id)) {
      setOrigem(null);
      setAviso('Já existe uma seta entre essas duas peças, nesse sentido.');
      return;
    }
    const nova = { id: `s-${Date.now().toString(36)}`, de: origem, para: id, rotulo: '' };
    setD(x => ({ ...x, setas: [...x.setas, nova] }));
    setOrigem(null);
    setSelecionada(nova.id);
    setAviso('Seta criada. Escreva no painel Propriedades o que passa por ela.');
  };

  const pontoNaPrancheta = (e: { clientX: number; clientY: number }) => {
    const el = svg.current;
    const ctm = el?.getScreenCTM?.();
    if (!el || !ctm) return null;
    const pt = el.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  };

  const aoApertarPeca = (id: string, e: PointerEvent<SVGGElement>) => {
    e.stopPropagation();
    if (modo === 'conectar') { conectar(id); return; }
    setSelecionada(id);
    const ponto = pontoNaPrancheta(e);
    const peca = d.pecas.find(p => p.id === id)!;
    if (ponto) {
      arrasto.current = { id, dx: ponto.x - peca.x, dy: ponto.y - peca.y, moveu: false };
      svg.current?.setPointerCapture?.(e.pointerId);
    }
  };

  const aoMover = (e: PointerEvent<SVGSVGElement>) => {
    const a = arrasto.current;
    if (!a) return;
    const ponto = pontoNaPrancheta(e);
    if (!ponto) return;
    a.moveu = true;
    const x = limitar(ponto.x - a.dx, 60, LARGURA - 60);
    const y = limitar(ponto.y - a.dy, 36, ALTURA - 36);
    setD(v => ({ ...v, pecas: v.pecas.map(p => (p.id === a.id ? { ...p, x, y } : p)) }));
  };

  const aoSoltar = () => { arrasto.current = null; };

  const aoTeclarPeca = (id: string, e: KeyboardEvent<SVGGElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (modo === 'conectar') conectar(id); else setSelecionada(id);
      return;
    }
    const passo: Record<string, [number, number]> = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] };
    const m = passo[e.key];
    if (m) {
      e.preventDefault();
      setSelecionada(id);
      setD(v => ({ ...v, pecas: v.pecas.map(p => (p.id === id
        ? { ...p, x: limitar(p.x + m[0], 60, LARGURA - 60), y: limitar(p.y + m[1], 36, ALTURA - 36) } : p)) }));
    }
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); setSelecionada(id); excluirPorId(id); }
  };

  const excluirPorId = (id: string) => {
    setD(x => ({ ...x, pecas: x.pecas.filter(p => p.id !== id), setas: x.setas.filter(s => s.id !== id && s.de !== id && s.para !== id) }));
    setSelecionada(null);
  };

  /* ── Setas ──────────────────────────────────────────────────────────── */

  const mudarSeta = (id: string, m: Partial<{ rotulo: string; de: string; para: string }>) =>
    setD(x => ({ ...x, setas: x.setas.map(s => (s.id === id ? { ...s, ...m } : s)) }));

  const inverter = () => {
    if (!setaSel) return;
    if (d.setas.some(s => s.de === setaSel.para && s.para === setaSel.de)) {
      setAviso('Já existe uma seta no sentido contrário entre essas duas peças.');
      return;
    }
    mudarSeta(setaSel.id, { de: setaSel.para, para: setaSel.de });
    setAviso('Sentido invertido.');
  };

  /* ── Código, simulação, exportação ─────────────────────────────────── */

  const alternarBit = (i: number) =>
    setD(x => ({ ...x, bits: x.bits.map((b, j) => (j === i ? !b : b)) }));

  const rodarSimulacao = () => {
    const r = simular(d);
    setD(comSimulacao(d));
    setModo('mover'); setOrigem(null);
    if (!r.chegou) setAviso(r.motivo ?? 'Os bits pararam.');
    else if (r.problemas.length) setAviso(`A letra ${r.letra} chegou ao monitor, mas ${r.problemas.length === 1 ? 'uma seta está' : `${r.problemas.length} setas estão`} no sentido errado — veja em vermelho.`);
    else setAviso(`Os bits ${bitsComoTexto(d.bits)} saíram do teclado e o monitor acendeu a letra ${r.letra}.`);
  };

  const exportar = () => {
    setMenu(false);
    setD(x => ({ ...x, exportado: assinatura(x) }));
    setExportando(true);
    setAviso('Imagem exportada. Ela guarda o desenho de agora: mudou alguma coisa, exporte de novo.');
  };

  const recomecar = () => {
    setD(DIAGRAMA_INICIAL);
    setSelecionada(null); setOrigem(null); setModo('mover');
    setMenu(false); setExportando(false); setAviso('');
  };

  const registrar = async () => {
    setErro(''); setGravando(true);
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) { await ensureEnrollment(userId, specId); await updateEnrollmentActivity(userId, specId); }
    await registrarConclusaoDeLicao(userId, lessonCode);
    let gravados = 0;
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (!reqId) continue;
      await upsertRequirementProgress(userId, reqId, {
        status: 'completed', mastery_score: 100, checkpoint_passed: true,
        attempts: 1, correct_count: METAS_DO_DIAGRAMA.length, total_questions: METAS_DO_DIAGRAMA.length,
      }, specialtyCode);
      gravados++;
    }
    setGravando(false);
    if (gravados < requirementCodes.length) {
      setErro('Você montou o diagrama, mas o progresso não pôde ser guardado agora. Avise a liderança do clube.');
      return;
    }
    await logActivity(userId, 'diagrama_concluido', {
      specialtyCode, lessonCode, metas: METAS_DO_DIAGRAMA.length, codigo: bitsComoTexto(d.bits),
    });
    setPronto(true);
  };

  if (pronto) {
    return (
      <div className="card p-6 text-center">
        <FileCheck2 className="w-16 h-16 mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
        <h2 className="text-xl font-bold mb-2">Diagrama pronto!</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Do teclado à tela, com o código binário escrito na seta e cada peça no
          sentido em que a informação anda. Leve a imagem e o roteiro: é com eles
          que você explica ao examinador.
        </p>
        <ol className="text-left text-sm mt-4 space-y-1 list-decimal pl-5" style={{ color: 'var(--color-text-muted)' }}>
          {roteiroDoDiagrama(d).map((f, i) => <li key={i}>{f}</li>)}
        </ol>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary mt-4 inline-flex">
          Voltar para a Trilha
        </Link>
      </div>
    );
  }

  const acoes = (
    <div className="flex flex-col gap-2">
      {tudoFeito && (
        <>
          {erro && <p style={{ fontSize: 11.5, color: 'var(--color-error)' }}>{erro}</p>}
          <button onClick={registrar} disabled={gravando} className="btn-primary text-sm w-full justify-center">
            {gravando ? 'Guardando…' : 'Entregar o diagrama'}
          </button>
        </>
      )}
      <button onClick={recomecar} className="btn-secondary text-xs py-2 w-full justify-center inline-flex items-center gap-1">
        <RotateCcw className="w-3 h-3" /> Recomeçar o diagrama
      </button>
    </div>
  );

  const valor = valorDosBits(d.bits);

  return (
    <LaboratorioEmTelaCheia
      trilha={specialtyCode}
      voltarPara={`/especialidade/${specialtyCode}`}
      titulo={lessonTitle}
      programa="diagrama"
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
    >
      <style>{CSS_DO_EDITOR}</style>
      <div className="dg-janela">
        <div className="dg-titulo">
          <Share2 className="w-4 h-4" aria-hidden />
          <span>caminho-da-informacao.diagrama — Editor de diagramas</span>
        </div>
        <div className="dg-menus">
          <div style={{ position: 'relative' }}>
            <button type="button" className="dg-menu-botao" aria-expanded={menu} onClick={() => setMenu(m => !m)}>Arquivo</button>
            {menu && (
              <div className="dg-menu" role="menu">
                <button type="button" role="menuitem" className="dg-menu-item" onClick={exportar}>
                  <FileImage className="w-4 h-4" aria-hidden /> Exportar como imagem
                </button>
                <button type="button" role="menuitem" className="dg-menu-item" onClick={() => { setMenu(false); recomecar(); }}>
                  <RotateCcw className="w-4 h-4" aria-hidden /> Abrir o rascunho de novo
                </button>
              </div>
            )}
          </div>
          <div className="dg-ferramentas" role="toolbar" aria-label="Ferramentas">
            <button type="button" className="dg-bt" aria-pressed={modo === 'mover'} title="Selecionar e mover" aria-label="Selecionar"
              onClick={() => { setModo('mover'); setOrigem(null); }}>
              <MousePointer2 className="w-4 h-4" aria-hidden /> <span>Selecionar</span>
            </button>
            <button type="button" className="dg-bt" aria-pressed={modo === 'conectar'} title="Conectar duas peças com uma seta" aria-label="Conectar"
              onClick={() => { setModo('conectar'); setOrigem(null); setAviso('Toque na peça de onde a seta sai.'); }}>
              <Cable className="w-4 h-4" aria-hidden /> <span>Conectar</span>
            </button>
            <button type="button" className="dg-bt" title="Excluir o que está selecionado" aria-label="Excluir" onClick={excluir}>
              <Trash2 className="w-4 h-4" aria-hidden /> <span>Excluir</span>
            </button>
            <button type="button" className="dg-bt dg-bt-simular" title="Soltar os bits no teclado e seguir as setas" aria-label="Simular" onClick={rodarSimulacao}>
              <Play className="w-4 h-4" aria-hidden /> <span>Simular</span>
            </button>
          </div>
        </div>

        <div className="dg-corpo">
          <aside className="dg-paleta" aria-label="Peças">
            <p className="dg-rotulo-painel">Peças</p>
            <div className="dg-paleta-lista">
              {PALETA.map(t => {
                const Icone = ICONE_DA_PECA[t];
                return (
                  <button key={t} type="button" className="dg-paleta-item" onClick={() => porPeca(t)}
                    title={`Pôr ${NOME_DA_PECA[t]} na prancheta`}>
                    <Icone size={18} aria-hidden /> <span>{NOME_DA_PECA[t]}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="dg-palco">
            <div ref={el => { svg.current = el?.querySelector('svg') ?? null; }} className="dg-folha">
              <Prancheta
                diagrama={d} selecionada={selecionada} origem={origem}
                caminho={caminho} erradas={erradas}
                letra={simulacaoAtual?.chegou ? simulacaoAtual.letra : null}
                aoApertarPeca={aoApertarPeca} aoTeclarPeca={aoTeclarPeca}
                aoEscolherSeta={id => { if (modo === 'conectar') return; setSelecionada(id); }}
                aoApertarFundo={() => { setSelecionada(null); if (modo === 'conectar' && origem) { setOrigem(null); setAviso('Seta cancelada.'); } }}
                aoMover={aoMover} aoSoltar={aoSoltar}
              />
            </div>

            <section className="dg-codigo" aria-label="Código binário">
              <p className="dg-rotulo-painel">Código binário da tecla</p>
              <div className="dg-chaves">
                {VALORES_DAS_CHAVES.map((v, i) => (
                  <button key={v} type="button" className="dg-chave" aria-pressed={d.bits[i]}
                    aria-label={`Chave de valor ${v}: ${d.bits[i] ? '1' : '0'}`} onClick={() => alternarBit(i)}>
                    <span className="dg-chave-bit">{d.bits[i] ? '1' : '0'}</span>
                    <span className="dg-chave-valor">{v}</span>
                  </button>
                ))}
              </div>
              <p className="dg-soma">
                {bitsComoTexto(d.bits)} = {VALORES_DAS_CHAVES.filter((_, i) => d.bits[i]).join(' + ') || '0'}{valor ? ` = ${valor}` : ''}
              </p>
            </section>

            {simulacaoAtual && (
              <section className="dg-resultado" aria-label="Resultado da simulação">
                <p className="dg-rotulo-painel">Simulação</p>
                <ol>
                  {simulacaoAtual.passos.map(p => (
                    <li key={p.setaId}>{NOME_DA_PECA[p.de]} → {NOME_DA_PECA[p.para]}: <code>{p.leva}</code></li>
                  ))}
                </ol>
                {simulacaoAtual.chegou
                  ? <p>O monitor acendeu a letra <strong>{simulacaoAtual.letra}</strong>.</p>
                  : <p>{simulacaoAtual.motivo}</p>}
                {simulacaoAtual.problemas.map(p => <p key={p.setaId} className="dg-problema">{p.motivo}</p>)}
              </section>
            )}
          </main>

          <aside className="dg-props" aria-label="Propriedades">
            <p className="dg-rotulo-painel">Propriedades</p>
            {setaSel && (() => {
              const de = d.pecas.find(p => p.id === setaSel.de);
              const para = d.pecas.find(p => p.id === setaSel.para);
              const problema = problemaDaSeta(d, setaSel);
              return (
                <div className="dg-props-corpo">
                  <p><strong>Seta</strong></p>
                  <p>De: {de ? NOME_DA_PECA[de.tipo] : '—'}</p>
                  <p>Para: {para ? NOME_DA_PECA[para.tipo] : '—'}</p>
                  <label className="dg-campo">
                    Rótulo
                    <input value={setaSel.rotulo} maxLength={40}
                      onChange={e => mudarSeta(setaSel.id, { rotulo: e.target.value })}
                      placeholder="O que passa por esta seta" />
                  </label>
                  <button type="button" className="dg-bt" onClick={inverter}>
                    <ArrowLeftRight className="w-4 h-4" aria-hidden /> Inverter sentido
                  </button>
                  <button type="button" className="dg-bt" onClick={excluir}>
                    <Trash2 className="w-4 h-4" aria-hidden /> Excluir seta
                  </button>
                  {/* O editor diz o que a peça faz, e não o que a seta
                      deveria ser — como um verificador de desenho diria. */}
                  {problema && <p className="dg-problema">{problema}</p>}
                </div>
              );
            })()}
            {pecaSel && (
              <div className="dg-props-corpo">
                <p><strong>{NOME_DA_PECA[pecaSel.tipo]}</strong></p>
                <p>Setas saindo: {d.setas.filter(s => s.de === pecaSel.id).length}</p>
                <p>Setas chegando: {d.setas.filter(s => s.para === pecaSel.id).length}</p>
                <button type="button" className="dg-bt" onClick={() => { setModo('conectar'); setOrigem(pecaSel.id); setAviso('Agora toque na peça onde a seta chega.'); }}>
                  <Cable className="w-4 h-4" aria-hidden /> Puxar seta daqui
                </button>
                <button type="button" className="dg-bt" onClick={excluir}>
                  <Trash2 className="w-4 h-4" aria-hidden /> Excluir peça
                </button>
                <p className="dg-dica">Arraste para mover, ou use as setas do teclado.</p>
              </div>
            )}
            {!setaSel && !pecaSel && (
              <p className="dg-dica">Clique numa peça ou numa seta para ver as propriedades dela.</p>
            )}
          </aside>
        </div>

        {exportando && (
          <div className="dg-dialogo-fundo" role="dialog" aria-modal="true" aria-label="Imagem exportada">
            <div className="dg-dialogo">
              <div className="dg-dialogo-topo">
                <strong>caminho-da-informacao.png</strong>
                <button type="button" className="dg-bt" aria-label="Fechar" onClick={() => setExportando(false)}>
                  <X className="w-4 h-4" aria-hidden />
                </button>
              </div>
              <div className="dg-dialogo-corpo">
                <div className="dg-previa">
                  <Prancheta diagrama={d} selecionada={null} origem={null} caminho={[]} erradas={[]} letra={null}
                    aoApertarPeca={() => {}} aoTeclarPeca={() => {}} aoEscolherSeta={() => {}}
                    aoApertarFundo={() => {}} aoMover={() => {}} aoSoltar={() => {}} interativa={false} />
                </div>
                <div className="dg-roteiro">
                  <p className="dg-rotulo-painel">Roteiro para explicar</p>
                  {roteiroDoDiagrama(d).length > 0
                    ? <ol>{roteiroDoDiagrama(d).map((f, i) => <li key={i}>{f}</li>)}</ol>
                    : <p>O roteiro sai do caminho que a simulação percorre. Enquanto os bits não chegam ao monitor, não há caminho para contar.</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </LaboratorioEmTelaCheia>
  );
}

const limitar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/*
  A folha do editor. Superfície clara dentro da moldura diz a própria cor em
  tudo, porque a plataforma pinta títulos de quase branco — certo num
  aplicativo escuro, invisível em cima de painel branco.
*/
const CSS_DO_EDITOR = `
.dg-janela {
  background: #F2F4F7; color: #101828; flex: 1; min-height: 0;
  display: flex; flex-direction: column;
  font-family: system-ui, 'Segoe UI', Roboto, sans-serif; font-size: 13px;
}
.dg-titulo {
  display: flex; align-items: center; gap: 8px; padding: 6px 12px;
  background: #1D2939; color: #FFFFFF; font-size: 12.5px;
}
.dg-menus {
  display: flex; align-items: center; gap: 8px; padding: 4px 8px;
  background: #FFFFFF; border-bottom: 1px solid #D0D5DD; flex-wrap: wrap;
}
.dg-menu-botao { background: none; border: none; padding: 5px 10px; color: #101828; cursor: pointer; border-radius: 6px; }
.dg-menu-botao:hover, .dg-menu-botao[aria-expanded="true"] { background: #F2F4F7; }
.dg-menu {
  position: absolute; top: 100%; left: 0; z-index: 30; min-width: 220px;
  background: #FFFFFF; border: 1px solid #D0D5DD; border-radius: 8px;
  box-shadow: 0 8px 24px rgba(16,24,40,.16); padding: 4px;
}
.dg-menu-item {
  display: flex; align-items: center; gap: 8px; width: 100%; text-align: left;
  background: none; border: none; padding: 7px 10px; border-radius: 6px; color: #101828; cursor: pointer;
}
.dg-menu-item:hover { background: #F2F4F7; }
.dg-ferramentas { display: flex; gap: 4px; flex-wrap: wrap; }
.dg-bt {
  display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px;
  background: #FFFFFF; color: #101828; border: 1px solid #D0D5DD; border-radius: 6px; cursor: pointer;
}
.dg-bt:hover { background: #F9FAFB; }
.dg-bt[aria-pressed="true"] { background: #EFF8FF; border-color: #1570EF; color: #175CD3; }
.dg-bt-simular { background: #067647; border-color: #067647; color: #FFFFFF; }
.dg-bt-simular:hover { background: #085D3A; }
.dg-corpo {
  flex: 1; min-height: 0; display: grid;
  grid-template-columns: 170px minmax(0, 1fr) 230px; gap: 0;
}
.dg-paleta, .dg-props { background: #FFFFFF; padding: 10px; overflow-y: auto; color: #101828; }
.dg-paleta { border-right: 1px solid #D0D5DD; }
.dg-props { border-left: 1px solid #D0D5DD; }
.dg-rotulo-painel { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #475467; margin-bottom: 6px; }
.dg-paleta-lista { display: flex; flex-direction: column; gap: 4px; }
.dg-paleta-item {
  display: flex; align-items: center; gap: 8px; padding: 6px 8px; text-align: left;
  background: #FFFFFF; border: 1px solid #EAECF0; border-radius: 6px; color: #101828; cursor: pointer;
}
.dg-paleta-item:hover { background: #F9FAFB; border-color: #D0D5DD; }
.dg-palco { overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 12px; }
.dg-folha { background: #FFFFFF; border: 1px solid #D0D5DD; border-radius: 8px; }
.dg-prancheta { display: block; width: 100%; height: auto; touch-action: none; user-select: none; }
.dg-peca { cursor: grab; }
.dg-peca:focus-visible rect, .dg-seta:focus-visible line { outline: none; stroke: #1570EF; }
.dg-seta { cursor: pointer; }
.dg-bits { animation: dg-andar .8s linear infinite; }
@keyframes dg-andar { to { stroke-dashoffset: -26; } }
@media (prefers-reduced-motion: reduce) { .dg-bits { animation: none; } }
.dg-codigo, .dg-resultado { background: #FFFFFF; border: 1px solid #D0D5DD; border-radius: 8px; padding: 10px; color: #101828; }
.dg-chaves { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 6px; }
.dg-chave {
  display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 0;
  background: #F9FAFB; border: 1px solid #D0D5DD; border-radius: 6px; color: #101828; cursor: pointer;
}
.dg-chave[aria-pressed="true"] { background: #1D2939; border-color: #1D2939; color: #FFFFFF; }
.dg-chave-bit { font: 700 18px ui-monospace, Consolas, monospace; }
.dg-chave-valor { font-size: 11px; opacity: .85; }
.dg-soma { margin-top: 8px; font: 600 13px ui-monospace, Consolas, monospace; color: #101828; }
.dg-resultado ol { list-style: decimal; padding-left: 20px; margin-bottom: 6px; }
.dg-resultado code { font-family: ui-monospace, Consolas, monospace; background: #F2F4F7; padding: 0 4px; border-radius: 4px; }
.dg-problema { color: #B42318; font-size: 12.5px; margin-top: 4px; }
.dg-props-corpo { display: flex; flex-direction: column; gap: 8px; }
.dg-campo { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #344054; }
.dg-campo input {
  padding: 6px 8px; border: 1px solid #D0D5DD; border-radius: 6px; background: #FFFFFF; color: #101828;
  font-family: ui-monospace, Consolas, monospace;
}
.dg-dica { color: #475467; font-size: 12px; }
.dg-dialogo-fundo {
  position: fixed; inset: 0; z-index: 40; background: rgba(16,24,40,.45);
  display: flex; align-items: center; justify-content: center; padding: 16px;
}
.dg-dialogo {
  background: #FFFFFF; color: #101828; border-radius: 10px; width: min(960px, 100%);
  max-height: calc(100vh - 32px); overflow-y: auto; box-shadow: 0 16px 48px rgba(16,24,40,.3);
}
.dg-dialogo-topo { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-bottom: 1px solid #EAECF0; }
.dg-dialogo-corpo { display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); gap: 12px; padding: 12px; }
.dg-previa { border: 1px solid #D0D5DD; border-radius: 6px; }
.dg-roteiro ol { list-style: decimal; padding-left: 20px; display: flex; flex-direction: column; gap: 6px; }
@media (max-width: 767px) {
  .dg-corpo { grid-template-columns: minmax(0, 1fr); grid-auto-rows: auto; overflow-y: auto; }
  .dg-paleta { border-right: none; border-bottom: 1px solid #D0D5DD; }
  .dg-paleta-lista { flex-direction: row; overflow-x: auto; }
  .dg-paleta-item { flex: 0 0 auto; }
  .dg-props { border-left: none; border-top: 1px solid #D0D5DD; padding-bottom: 96px; }
  .dg-palco { overflow: visible; }
  .dg-ferramentas .dg-bt span { display: none; }
  .dg-chave-bit { font-size: 15px; }
  .dg-dialogo-corpo { grid-template-columns: minmax(0, 1fr); }
  /* O diálogo sobe no celular: a cápsula de tarefas mora no canto de baixo.
     Esta regra vem depois da que centra, e tem de vir. */
  .dg-dialogo-fundo { align-items: flex-start; }
}
`;
