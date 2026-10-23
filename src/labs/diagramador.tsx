import { useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import { Image as IconeDeImagem, MousePointer2, Redo2, Type, Undo2 } from 'lucide-react';
import {
  PONTO_EM_MM, PPI_DE_IMPRESSAO, SANGRIA_DA_GRAFICA, cabecalhoDaPagina, colunasDa, efetivo, estiloDe,
  exportarPdf, fluxo, guiasVerticais, imagemDe, margensDa, numeroDaPagina, ppiEfetivo, temFormatacaoDireta,
  type Documento, type Malha, type OpcoesDoPdf, type Pdf, type QuadroDeImagem, type QuadroDeTexto, type TextoSolto,
} from './diagramacao';
import { FAMILIAS, provaDeImpressao } from './design';

/**
 * A janela do programa de diagramação.
 *
 * ── Um arranjo, e não uma marca ──────────────────────────────────────────
 * Páginas à esquerda, a página no meio com as guias da malha e a sangria em
 * volta, propriedades e amostras à direita. É o que o Scribus, o InDesign e o
 * Affinity Publisher têm em comum — a decisão do editor de design, pelo
 * motivo escrito lá.
 *
 * ── O que ela guarda, e o que não guarda ─────────────────────────────────
 * O documento chega por `documento` e sai por `mudar`. Aqui fica o estado da
 * tela — página à vista, seleção, ferramenta, prova de cores, diálogo aberto
 * — e o histórico do Ctrl+Z, que é do programa em todo programa.
 *
 * ── O texto que sobra se vê ──────────────────────────────────────────────
 * O "+" vermelho no último quadro e a contagem na barra de status são o
 * aviso de texto excedente de todo programa de diagramação. Sem ele, o fim da
 * matéria simplesmente não apareceria, e ninguém perceberia que faltou.
 */

/* Comentário dentro deste template não leva crase: fecha a string. */
export const CSS_DO_DIAGRAMADOR = `
.dg-janela { flex: 1; min-height: 0; display: flex; flex-direction: column; background: #2A2B30; color: #E4E4E7; font-family: system-ui, 'Segoe UI', Roboto, sans-serif; font-size: 12.5px; }
.dg-titulo { display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: #1E1F23; border-bottom: 1px solid #3A3B41; }
.dg-titulo-app { font-weight: 600; color: #FFFFFF; }
.dg-titulo-arquivo { color: #C4C5CA; }
.dg-titulo-acoes { margin-left: auto; display: flex; gap: 2px; }
.dg-menus { display: flex; flex-wrap: wrap; gap: 2px; padding: 2px 6px; background: #1E1F23; border-bottom: 1px solid #3A3B41; }
.dg-menu-ancora { position: relative; }
.dg-menu-botao { padding: 4px 8px; border-radius: 4px; color: #E4E4E7; background: transparent; }
.dg-menu-botao:hover, .dg-menu-botao[aria-expanded="true"] { background: #3A3B41; }
.dg-menu { position: absolute; top: 100%; left: 0; z-index: 20; min-width: 220px; padding: 4px; background: #33343A; border: 1px solid #4A4B52; border-radius: 6px; box-shadow: 0 10px 24px rgba(0,0,0,0.45); }
.dg-menu-item { display: flex; justify-content: space-between; gap: 16px; width: 100%; padding: 6px 10px; border-radius: 4px; text-align: left; color: #E4E4E7; background: transparent; }
.dg-menu-item:hover { background: #C2185B; color: #FFFFFF; }
.dg-menu-item[aria-checked="true"]::before { content: '✓'; margin-right: 6px; }
.dg-ferramentas { display: flex; gap: 4px; align-items: center; padding: 4px 8px; background: #26272B; border-bottom: 1px solid #3A3B41; flex-wrap: wrap; }
.dg-bt { display: inline-flex; align-items: center; justify-content: center; gap: 4px; min-width: 30px; height: 30px; padding: 0 6px; border-radius: 5px; color: #D4D4D8; background: transparent; }
.dg-bt:hover { background: #3A3B41; }
.dg-bt[aria-pressed="true"] { background: #C2185B; color: #FFFFFF; }
.dg-bt:disabled { opacity: 0.4; cursor: not-allowed; }
.dg-corpo { flex: 1; min-height: 0; display: flex; }
.dg-esquerda { width: 150px; flex: none; overflow-y: auto; background: #26272B; border-right: 1px solid #3A3B41; padding: 8px; display: flex; flex-direction: column; gap: 8px; }
.dg-pagina-item { display: flex; flex-direction: column; gap: 4px; padding: 6px; border-radius: 5px; background: #2F3036; }
.dg-pagina-item[aria-current="true"] { outline: 2px solid #C2185B; }
.dg-pagina-botao { text-align: left; color: #FFFFFF; font-weight: 600; background: transparent; }
.dg-mesa { flex: 1; min-width: 0; min-height: 0; overflow: auto; display: flex; align-items: flex-start; justify-content: center; padding: 28px; background: #3B3C42; }
.dg-papel-externo { position: relative; flex: none; }
.dg-sangria { position: absolute; border: 1px dashed #E57373; pointer-events: none; }
.dg-papel { position: absolute; background: #FFFFFF; box-shadow: 0 2px 14px rgba(0,0,0,0.5); overflow: visible; color: #1F2A24; }
.dg-guia { position: absolute; top: 0; bottom: 0; width: 0; border-left: 1px solid rgba(194,24,91,0.55); pointer-events: none; }
.dg-margem { position: absolute; border: 1px solid rgba(124,77,255,0.6); pointer-events: none; }
.dg-quadro { position: absolute; outline: 1px dotted rgba(0,0,0,0.25); overflow: hidden; }
.dg-quadro[aria-selected="true"] { outline: 2px solid #1E88E5; z-index: 3; }
.dg-linha { position: absolute; left: 0; right: 0; white-space: nowrap; overflow: hidden; }
.dg-excesso { position: absolute; right: -9px; bottom: -9px; width: 16px; height: 16px; border-radius: 2px; background: #D32F2F; color: #FFFFFF; font-weight: 700; font-size: 13px; line-height: 16px; text-align: center; z-index: 4; }
.dg-imagem { position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; color: #FFFFFF; text-align: center; font-size: 10px; background: linear-gradient(135deg, #4B6B5A, #2E4A3E 60%, #6E5A3A); z-index: 2; }
.dg-imagem[aria-selected="true"] { outline: 2px solid #1E88E5; }
.dg-imagem-ppi { padding: 1px 5px; border-radius: 3px; background: rgba(0,0,0,0.55); }
.dg-imagem-ppi[data-baixo="true"] { background: #D32F2F; }
.dg-solto { position: absolute; z-index: 3; white-space: nowrap; }
.dg-solto[aria-selected="true"] { outline: 2px solid #1E88E5; }
.dg-mestre { position: absolute; font-size: 9px; color: #555555; pointer-events: none; z-index: 3; }
.dg-faixa { position: absolute; display: flex; pointer-events: none; z-index: 1; }
.dg-faixa span { flex: 1; }
.dg-direita { width: 250px; flex: none; overflow-y: auto; background: #26272B; border-left: 1px solid #3A3B41; }
.dg-painel { padding: 10px 12px; border-bottom: 1px solid #3A3B41; display: flex; flex-direction: column; gap: 8px; }
.dg-painel-titulo { font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #A1A1AA; }
.dg-campo { display: grid; grid-template-columns: 1fr 86px; gap: 6px; align-items: center; color: #D4D4D8; }
.dg-entrada { width: 100%; padding: 4px 6px; border-radius: 4px; border: 1px solid #4A4B52; background: #1E1F23; color: #F4F4F5; font-variant-numeric: tabular-nums; }
.dg-nota { color: #A1A1AA; line-height: 1.4; }
.dg-aviso { padding: 6px 8px; border-radius: 4px; background: #4A3A12; color: #FDE68A; }
.dg-amostras { display: flex; flex-wrap: wrap; gap: 6px; }
.dg-amostra { width: 30px; height: 30px; border-radius: 4px; border: 1px solid #4A4B52; }
.dg-botao { padding: 6px 10px; border-radius: 5px; background: #C2185B; color: #FFFFFF; font-weight: 600; }
.dg-botao:hover { background: #AD1457; }
.dg-botao-claro { padding: 6px 10px; border-radius: 5px; background: #3A3B41; color: #E4E4E7; }
.dg-botao-claro:hover { background: #4A4B52; }
.dg-status { display: flex; gap: 14px; flex-wrap: wrap; padding: 4px 10px; background: #1E1F23; border-top: 1px solid #3A3B41; color: #A1A1AA; font-size: 11.5px; font-variant-numeric: tabular-nums; }
.dg-status-excesso { color: #EF9A9A; font-weight: 600; }
.dg-fundo-do-dialogo { position: absolute; inset: 0; z-index: 40; background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; padding: 12px; }
.dg-dialogo { width: min(560px, 100%); max-height: 100%; overflow: auto; background: #2F3036; border: 1px solid #4A4B52; border-radius: 8px; padding: 16px; display: flex; flex-direction: column; gap: 10px; color: #E4E4E7; }
.dg-dialogo h3 { margin: 0; font-size: 14px; color: #FFFFFF; }
.dg-dialogo-acoes { display: flex; justify-content: flex-end; gap: 8px; }
.dg-materia { display: flex; flex-direction: column; gap: 6px; }
.dg-materia-linha { display: grid; grid-template-columns: 1fr 120px auto; gap: 6px; align-items: center; padding: 6px; border-radius: 4px; background: #26272B; }
.dg-materia-texto { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dg-materia-estilo { font-size: 11px; color: #A1A1AA; }
.dg-previa { position: relative; margin: 0 auto; background: #FFFFFF; }
.dg-marca-de-corte { position: absolute; background: #000000; }
@media (max-width: 760px) {
  .dg-corpo { flex-direction: column; overflow-y: auto; }
  .dg-esquerda { width: auto; flex: none; flex-direction: row; overflow-x: auto; border-right: none; border-bottom: 1px solid #3A3B41; }
  .dg-pagina-item { flex: none; }
  .dg-mesa { flex: none; height: 62vh; min-height: 320px; padding: 14px; }
  .dg-direita { width: auto; flex: none; border-left: none; border-top: 1px solid #3A3B41; overflow: visible; }
  .dg-materia-linha { grid-template-columns: 1fr; }
  .dg-fundo-do-dialogo { align-items: flex-start; padding-top: 24px; }
}
`;

/** Pixels por milímetro na tela: A5 sai com 385 de largura. */
export const ESCALA = 2.6;

type Selecao = { tipo: 'texto' | 'imagem' | 'solto'; id: string } | null;
type Ferramenta = 'selecionar' | 'texto' | 'imagem';
type Dialogo = null | 'margens' | 'documento' | 'mestre' | 'pdf' | 'materia';
type Menu = null | 'arquivo' | 'editar' | 'layout' | 'texto' | 'paginas' | 'exibir';

const NOME_DO_MENU: Record<Exclude<Menu, null>, string> = {
  arquivo: 'Arquivo', editar: 'Editar', layout: 'Layout', texto: 'Texto', paginas: 'Páginas', exibir: 'Exibir',
};

const arredonda = (v: number) => Math.round(v * 100) / 100;
const mmEmTexto = (v: number) => `${arredonda(v).toLocaleString('pt-BR')} mm`;

function CampoNumero({ rotulo, valor, aoMudar, passo = 0.5 }: { rotulo: string; valor: number; aoMudar: (n: number) => void; passo?: number }) {
  const [rascunho, setRascunho] = useState(String(arredonda(valor)));
  useEffect(() => { setRascunho(String(arredonda(valor))); }, [valor]);
  const confirmar = () => {
    const n = Number(rascunho.replace(',', '.'));
    if (Number.isFinite(n) && n !== valor) aoMudar(n); else setRascunho(String(arredonda(valor)));
  };
  return (
    <label className="dg-campo">
      {rotulo}
      <input className="dg-entrada" aria-label={rotulo} inputMode="decimal" step={passo} value={rascunho}
        onChange={e => setRascunho(e.target.value)} onBlur={confirmar}
        onKeyDown={e => { if (e.key === 'Enter') confirmar(); }} />
    </label>
  );
}

export interface PropsDoDiagramador {
  documento: Documento;
  mudar: (d: Documento) => void;
  paginaInicial?: number;
  aoVer?: (chave: string) => void;
  aoAvisar?: (texto: string) => void;
  /** Exportar PDF só existe quando o laboratório recebe o arquivo. */
  aoExportar?: (pdf: Pdf) => void;
}

export function Diagramador({ documento: d, mudar, paginaInicial = 0, aoVer, aoAvisar, aoExportar }: PropsDoDiagramador) {
  const [pagina, setPagina] = useState(paginaInicial);
  const [selecao, setSelecao] = useState<Selecao>(null);
  const [ferramenta, setFerramenta] = useState<Ferramenta>('selecionar');
  const [imagemNova, setImagemNova] = useState(d.biblioteca[0]?.id ?? '');
  const [dialogo, setDialogo] = useState<Dialogo>(null);
  const [menu, setMenu] = useState<Menu>(null);
  const [prova, setProva] = useState(false);
  const [guias, setGuias] = useState(true);
  const [desfazer, setDesfazer] = useState<Documento[]>([]);
  const [refazer, setRefazer] = useState<Documento[]>([]);
  const papelRef = useRef<HTMLDivElement>(null);
  const avisos = useRef({ aoVer, aoAvisar });
  avisos.current = { aoVer, aoAvisar };

  useEffect(() => { if (prova) avisos.current.aoVer?.('prova-de-cores'); }, [prova]);

  const corDe = (hex: string) => (prova ? provaDeImpressao(hex) : hex);
  const f = useMemo(() => fluxo(d), [d]);
  const ultimoQuadro = useMemo(() => [...d.quadros].sort((a, b) => b.ordem - a.ordem)[0], [d.quadros]);

  const aplicar = (novo: Documento) => {
    setDesfazer(h => [...h.slice(-49), d]);
    setRefazer([]);
    mudar(novo);
  };
  const voltar = () => {
    const anterior = desfazer[desfazer.length - 1];
    if (!anterior) return;
    setDesfazer(h => h.slice(0, -1));
    setRefazer(r => [...r, d]);
    mudar(anterior);
  };
  const avancar = () => {
    const proximo = refazer[refazer.length - 1];
    if (!proximo) return;
    setRefazer(r => r.slice(0, -1));
    setDesfazer(h => [...h, d]);
    mudar(proximo);
  };

  const excluir = () => {
    if (!selecao) return;
    const { tipo, id } = selecao;
    aplicar({
      ...d,
      quadros: tipo === 'texto' ? d.quadros.filter(q => q.id !== id) : d.quadros,
      imagens: tipo === 'imagem' ? d.imagens.filter(q => q.id !== id) : d.imagens,
      soltos: tipo === 'solto' ? d.soltos.filter(q => q.id !== id) : d.soltos,
    });
    setSelecao(null);
  };

  const idNovo = (prefixo: string) => {
    const usados = new Set([...d.quadros, ...d.imagens, ...d.soltos].map(x => x.id));
    for (let i = 1; ; i++) if (!usados.has(`${prefixo}-${i}`)) return `${prefixo}-${i}`;
  };

  /** O ponto na página, em milímetros. No jsdom a caixa mede zero, e o ponteiro chega em milímetros. */
  const pontoEmMm = (e: React.PointerEvent) => {
    const r = papelRef.current?.getBoundingClientRect();
    if (!r || r.width === 0) return { x: e.clientX, y: e.clientY };
    return { x: (e.clientX - r.left) / ESCALA, y: (e.clientY - r.top) / ESCALA };
  };

  const criar = (e: React.PointerEvent) => {
    if (ferramenta === 'selecionar') { setSelecao(null); return; }
    const { x, y } = pontoEmMm(e);
    const largura = colunasDa(d, pagina)[0]?.largura ?? 50;
    if (ferramenta === 'texto') {
      const id = idNovo('quadro');
      const ordem = Math.max(0, ...d.quadros.map(q => q.ordem)) + 1;
      aplicar({ ...d, quadros: [...d.quadros, { id, pagina, ordem, x: arredonda(x), y: arredonda(y), largura, altura: 60 }] });
      setSelecao({ tipo: 'texto', id });
    } else {
      const img = imagemDe(d, imagemNova);
      if (!img) return;
      const id = idNovo('imagem');
      aplicar({ ...d, imagens: [...d.imagens, { id, pagina, imagem: img.id, x: arredonda(x), y: arredonda(y), largura, altura: arredonda(largura * img.altura / img.largura) }] });
      setSelecao({ tipo: 'imagem', id });
    }
    setFerramenta('selecionar');
  };

  const teclas = (e: React.KeyboardEvent) => {
    const alvo = e.target as HTMLElement;
    if (alvo.closest('input, textarea, select')) return;
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) avancar(); else voltar(); return; }
    if (ctrl && e.key.toLowerCase() === 'y') { e.preventDefault(); avancar(); return; }
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); excluir(); return; }
    if (e.key === 'Escape') { setSelecao(null); setMenu(null); setDialogo(null); }
  };

  const escolher = (s: Selecao) => (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    if (ferramenta !== 'selecionar') return;
    setSelecao(s);
  };

  const item = (rotulo: string, acao: () => void, atalho?: string, marcado?: boolean) => (
    <button key={rotulo} type="button" role="menuitem" className="dg-menu-item" aria-checked={marcado}
      onClick={() => { setMenu(null); acao(); }}>
      <span>{rotulo}</span>{atalho && <span style={{ color: '#A1A1AA' }}>{atalho}</span>}
    </button>
  );

  /* ── O que se desenha ── */

  const m = margensDa(d, pagina);
  const W = d.formato.largura * ESCALA;
  const H = d.formato.altura * ESCALA;
  const S = d.sangria * ESCALA;
  const daPagina = <T extends { pagina: number }>(xs: T[]) => xs.filter(x => x.pagina === pagina);
  const caixa = (r: { x: number; y: number; largura: number; altura: number }): React.CSSProperties =>
    ({ left: r.x * ESCALA, top: r.y * ESCALA, width: r.largura * ESCALA, height: r.altura * ESCALA });

  const selecionado = selecao
    ? (selecao.tipo === 'texto' ? d.quadros : selecao.tipo === 'imagem' ? d.imagens : d.soltos).find(x => x.id === selecao.id) ?? null
    : null;
  const mudarSelecionado = (g: (r: QuadroDeTexto & QuadroDeImagem & TextoSolto) => object) => {
    if (!selecao) return;
    const troca = <T extends { id: string }>(xs: T[]) => xs.map(x => (x.id === selecao.id ? { ...x, ...g(x as never) } : x));
    aplicar({
      ...d,
      quadros: selecao.tipo === 'texto' ? troca(d.quadros) : d.quadros,
      imagens: selecao.tipo === 'imagem' ? troca(d.imagens) : d.imagens,
      soltos: selecao.tipo === 'solto' ? troca(d.soltos) : d.soltos,
    });
  };

  const numero = numeroDaPagina(d, pagina);
  const cabecalho = cabecalhoDaPagina(d, pagina);

  return (
    <div className="dg-janela" onKeyDown={teclas} style={{ position: 'relative' }}>
      <div className="dg-titulo">
        <span className="dg-titulo-app">Diagramador</span>
        <span className="dg-titulo-arquivo">{d.nome}</span>
        <span className="dg-titulo-acoes">
          <button type="button" className="dg-bt" aria-label="Desfazer (Ctrl+Z)" onClick={voltar} disabled={desfazer.length === 0}><Undo2 className="w-4 h-4" /></button>
          <button type="button" className="dg-bt" aria-label="Refazer (Ctrl+Y)" onClick={avancar} disabled={refazer.length === 0}><Redo2 className="w-4 h-4" /></button>
        </span>
      </div>

      <div className="dg-menus" role="menubar">
        {(Object.keys(NOME_DO_MENU) as Exclude<Menu, null>[]).map(mm => (
          <div key={mm} className="dg-menu-ancora">
            <button type="button" className="dg-menu-botao" aria-haspopup="menu" aria-expanded={menu === mm} onClick={() => setMenu(menu === mm ? null : mm)}>
              {NOME_DO_MENU[mm]}
            </button>
            {menu === mm && (
              <div className="dg-menu" role="menu">
                {mm === 'arquivo' && <>
                  {item('Configurar documento…', () => setDialogo('documento'))}
                  {aoExportar && item('Exportar PDF…', () => setDialogo('pdf'))}
                </>}
                {mm === 'editar' && <>
                  {item('Desfazer', voltar, 'Ctrl+Z')}
                  {item('Refazer', avancar, 'Ctrl+Y')}
                  {item('Excluir', excluir, 'Del')}
                </>}
                {mm === 'layout' && item('Margens e colunas…', () => setDialogo('margens'))}
                {mm === 'texto' && item('Editar matéria…', () => setDialogo('materia'))}
                {mm === 'paginas' && item('Página-mestre A…', () => setDialogo('mestre'))}
                {mm === 'exibir' && <>
                  {item('Prova de cores (CMYK)', () => setProva(v => !v), undefined, prova)}
                  {item('Mostrar guias', () => setGuias(v => !v), undefined, guias)}
                </>}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="dg-ferramentas" role="toolbar" aria-label="Ferramentas">
        <button type="button" className="dg-bt" aria-label="Selecionar (V)" aria-pressed={ferramenta === 'selecionar'} onClick={() => setFerramenta('selecionar')}><MousePointer2 className="w-4 h-4" /></button>
        <button type="button" className="dg-bt" aria-label="Quadro de texto (T)" aria-pressed={ferramenta === 'texto'} onClick={() => setFerramenta('texto')}><Type className="w-4 h-4" /></button>
        <button type="button" className="dg-bt" aria-label="Quadro de imagem (F)" aria-pressed={ferramenta === 'imagem'} onClick={() => setFerramenta('imagem')}><IconeDeImagem className="w-4 h-4" /></button>
        {ferramenta === 'imagem' && (
          <select className="dg-entrada" style={{ width: 'auto' }} aria-label="Imagem a pôr" value={imagemNova} onChange={e => setImagemNova(e.target.value)}>
            {d.biblioteca.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
          </select>
        )}
        {ferramenta !== 'selecionar' && <span className="dg-nota">Clique na página para criar o quadro.</span>}
      </div>

      <div className="dg-corpo">
        <div className="dg-esquerda" aria-label="Páginas">
          {d.paginas.map((pg, i) => (
            <div key={pg.id} className="dg-pagina-item" aria-current={i === pagina}>
              <button type="button" className="dg-pagina-botao" onClick={() => { setPagina(i); setSelecao(null); }}>
                Página {i + 1}{i === 0 ? ' (capa)' : ''}
              </button>
              <label className="dg-nota" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                Mestre
                <select className="dg-entrada" aria-label={`Mestre da página ${i + 1}`} value={pg.mestre}
                  onChange={e => aplicar({ ...d, paginas: d.paginas.map((x, j) => (j === i ? { ...x, mestre: e.target.value as 'A' | 'nenhuma' } : x)) })}>
                  <option value="A">A</option>
                  <option value="nenhuma">Nenhuma</option>
                </select>
              </label>
            </div>
          ))}
        </div>

        <div className="dg-mesa" aria-label="Mesa de montagem">
          <div className="dg-papel-externo" style={{ width: W + 2 * S, height: H + 2 * S }}>
            {d.sangria > 0 && <div className="dg-sangria" style={{ left: 0, top: 0, width: W + 2 * S, height: H + 2 * S }} aria-hidden="true" />}
            <div ref={papelRef} className="dg-papel" aria-label={`Página ${pagina + 1}`} style={{ left: S, top: S, width: W, height: H }}
              onPointerDown={criar}>
              {pagina > 0 && (
                <div className="dg-faixa" style={{ left: 0, top: 0, width: W, height: 4 * ESCALA }} aria-hidden="true">
                  {d.cores.map(c => <span key={c} style={{ background: corDe(c) }} />)}
                </div>
              )}
              {guias && <>
                <div className="dg-margem" style={{ left: m.esquerda * ESCALA, top: m.topo * ESCALA, right: m.direita * ESCALA, bottom: m.base * ESCALA }} />
                {guiasVerticais(d, pagina).map(g => <div key={g} className="dg-guia" style={{ left: g * ESCALA }} />)}
              </>}
              {daPagina(d.imagens).map(q => {
                const img = imagemDe(d, q.imagem);
                const ppi = Math.round(ppiEfetivo(d, q));
                return (
                  <div key={q.id} className="dg-imagem" style={caixa(q)} aria-label={`Imagem ${img?.nome ?? q.imagem}`}
                    aria-selected={selecao?.id === q.id} onPointerDown={escolher({ tipo: 'imagem', id: q.id })}>
                    <span>{img?.nome}</span>
                    <span className="dg-imagem-ppi" data-baixo={ppi < PPI_DE_IMPRESSAO}>{ppi} ppi</span>
                  </div>
                );
              })}
              {daPagina(d.quadros).map(q => (
                <div key={q.id} className="dg-quadro" style={caixa(q)} aria-label={`Quadro de texto ${q.ordem}`}
                  aria-selected={selecao?.id === q.id} onPointerDown={escolher({ tipo: 'texto', id: q.id })}>
                  {(f.porQuadro[q.id] ?? []).map((l, i) => {
                    const p = d.historia.find(x => x.id === l.paragrafo)!;
                    const e = efetivo(d, p);
                    return (
                      <div key={i} className="dg-linha" style={{
                        top: l.y * ESCALA, height: l.altura * ESCALA, lineHeight: `${l.altura * ESCALA}px`,
                        fontSize: e.corpo * PONTO_EM_MM * ESCALA, fontWeight: e.peso, fontFamily: FAMILIAS[e.familia].pilha,
                      }}>{l.texto}</div>
                    );
                  })}
                  {q.id === ultimoQuadro?.id && f.excesso > 0 && <span className="dg-excesso" title="Texto excedente">+</span>}
                </div>
              ))}
              {daPagina(d.soltos).map(s => (
                <div key={s.id} className="dg-solto" aria-selected={selecao?.id === s.id}
                  style={{ left: s.x * ESCALA, top: s.y * ESCALA, fontSize: s.corpo * PONTO_EM_MM * ESCALA, fontWeight: s.peso, color: s.cor }}
                  onPointerDown={escolher({ tipo: 'solto', id: s.id })}>{s.texto}</div>
              ))}
              {cabecalho && <div className="dg-mestre" style={{ left: m.esquerda * ESCALA, top: (m.topo - 6) * ESCALA }}>{cabecalho}</div>}
              {numero && <div className="dg-mestre" aria-label="Número da página" style={{ left: (d.formato.largura / 2) * ESCALA, top: (d.formato.altura - m.base + 6) * ESCALA }}>{numero}</div>}
            </div>
          </div>
        </div>

        <div className="dg-direita">
          <div className="dg-painel">
            <div className="dg-painel-titulo">{selecionado ? 'Propriedades' : `Página ${pagina + 1}`}</div>
            {!selecionado && (
              <p className="dg-nota">
                Clique num quadro para ver as propriedades. Margens {mmEmTexto(m.topo)} em cima, {d.malha.colunas} {d.malha.colunas === 1 ? 'coluna' : 'colunas'}, sangria {mmEmTexto(d.sangria)}.
              </p>
            )}
            {selecionado && <>
              <CampoNumero rotulo="X (mm)" valor={selecionado.x} aoMudar={x => mudarSelecionado(() => ({ x }))} />
              <CampoNumero rotulo="Y (mm)" valor={selecionado.y} aoMudar={y => mudarSelecionado(() => ({ y }))} />
              <CampoNumero rotulo="Largura (mm)" valor={selecionado.largura} aoMudar={largura => mudarSelecionado(() => ({ largura }))} />
              <CampoNumero rotulo="Altura (mm)" valor={selecionado.altura} aoMudar={altura => mudarSelecionado(() => ({ altura }))} />
              {selecao?.tipo === 'imagem' && (() => {
                const q = selecionado as QuadroDeImagem;
                const img = imagemDe(d, q.imagem);
                const ppi = Math.round(ppiEfetivo(d, q));
                return (
                  <>
                    <p className="dg-nota">{img?.nome} · {img?.largura} × {img?.altura} pixels · {img?.modo.toUpperCase()}</p>
                    <p className={ppi < PPI_DE_IMPRESSAO ? 'dg-aviso' : 'dg-nota'}>ppi efetivo: {ppi}</p>
                    <button type="button" className="dg-botao-claro" onClick={() => mudarSelecionado(r => ({ altura: arredonda(r.largura * (img?.altura ?? 1) / (img?.largura ?? 1)) }))}>
                      Ajustar altura à foto
                    </button>
                  </>
                );
              })()}
              {selecao?.tipo === 'texto' && <p className="dg-nota">Quadro {(selecionado as QuadroDeTexto).ordem} da matéria. O texto corre do quadro 1 em diante.</p>}
              {selecao?.tipo === 'solto' && <p className="dg-nota">Texto solto: “{(selecionado as TextoSolto).texto}”.</p>}
            </>}
          </div>
          <div className="dg-painel">
            <div className="dg-painel-titulo">Amostras</div>
            <div className="dg-amostras">
              {d.cores.map(c => <span key={c} className="dg-amostra" title={c} aria-label={`Amostra ${c}`} style={{ background: corDe(c) }} />)}
            </div>
            {prova && <p className="dg-nota">Prova de cores ligada: a tela simula as tintas da impressora.</p>}
          </div>
        </div>
      </div>

      <div className="dg-status">
        <span>Página {pagina + 1} de {d.paginas.length}</span>
        <span>{d.formato.largura} × {d.formato.altura} mm</span>
        {f.excesso > 0
          ? <span className="dg-status-excesso">Texto excedente: {f.excesso} {f.excesso === 1 ? 'linha' : 'linhas'}</span>
          : <span>Sem texto excedente</span>}
        {prova && <span>Prova de cores</span>}
      </div>

      {dialogo === 'margens' && <DialogoDeMargens malha={d.malha} aoFechar={() => setDialogo(null)} aoConfirmar={malha => { aplicar({ ...d, malha }); setDialogo(null); }} />}
      {dialogo === 'documento' && <DialogoDoDocumento sangria={d.sangria} aoFechar={() => setDialogo(null)} aoConfirmar={sangria => { aplicar({ ...d, sangria }); setDialogo(null); }} />}
      {dialogo === 'mestre' && <DialogoDaMestre mestre={d.mestre} aoFechar={() => setDialogo(null)} aoConfirmar={mestre => { aplicar({ ...d, mestre }); setDialogo(null); }} />}
      {dialogo === 'materia' && <EditorDeMateria documento={d} aoMudar={aplicar} aoFechar={() => setDialogo(null)} />}
      {dialogo === 'pdf' && aoExportar && (
        <DialogoDoPdf documento={d} aoFechar={() => setDialogo(null)}
          aoExportar={(nome, opcoes) => { aoExportar(exportarPdf(d, nome, opcoes)); setDialogo(null); avisos.current.aoAvisar?.(`${nome} exportado.`); }} />
      )}
    </div>
  );
}

/* ── Os diálogos ──────────────────────────────────────────────────────────── */

function Dialogo({ titulo, children, aoFechar, aoConfirmar, rotuloDoOk = 'OK' }: {
  titulo: string; children: React.ReactNode; aoFechar: () => void; aoConfirmar: () => void; rotuloDoOk?: string;
}) {
  return (
    <div className="dg-fundo-do-dialogo" onPointerDown={e => { if (e.target === e.currentTarget) aoFechar(); }}>
      <div className="dg-dialogo" role="dialog" aria-label={titulo}>
        <h3>{titulo}</h3>
        {children}
        <div className="dg-dialogo-acoes">
          <button type="button" className="dg-botao-claro" onClick={aoFechar}>Cancelar</button>
          <button type="button" className="dg-botao" onClick={aoConfirmar}>{rotuloDoOk}</button>
        </div>
      </div>
    </div>
  );
}

function DialogoDeMargens({ malha, aoFechar, aoConfirmar }: { malha: Malha; aoFechar: () => void; aoConfirmar: (m: Malha) => void }) {
  const [m, setM] = useState(malha);
  const mg = (campo: keyof Malha['margens']) => (n: number) => setM(x => ({ ...x, margens: { ...x.margens, [campo]: n } }));
  return (
    <Dialogo titulo="Margens e colunas" aoFechar={aoFechar} aoConfirmar={() => aoConfirmar(m)}>
      <CampoNumero rotulo="Margem de cima (mm)" valor={m.margens.topo} aoMudar={mg('topo')} />
      <CampoNumero rotulo="Margem de baixo (mm)" valor={m.margens.base} aoMudar={mg('base')} />
      <CampoNumero rotulo="Margem interna (mm)" valor={m.margens.interna} aoMudar={mg('interna')} />
      <CampoNumero rotulo="Margem externa (mm)" valor={m.margens.externa} aoMudar={mg('externa')} />
      <CampoNumero rotulo="Colunas" valor={m.colunas} passo={1} aoMudar={n => setM(x => ({ ...x, colunas: Math.max(1, Math.round(n)) }))} />
      <CampoNumero rotulo="Medianiz (mm)" valor={m.medianiz} aoMudar={n => setM(x => ({ ...x, medianiz: Math.max(0, n) }))} />
      <p className="dg-nota">A interna fica junto da dobra, e troca de lado entre a página da esquerda e a da direita.</p>
    </Dialogo>
  );
}

function DialogoDoDocumento({ sangria, aoFechar, aoConfirmar }: { sangria: number; aoFechar: () => void; aoConfirmar: (s: number) => void }) {
  const [s, setS] = useState(sangria);
  return (
    <Dialogo titulo="Configurar documento" aoFechar={aoFechar} aoConfirmar={() => aoConfirmar(s)}>
      <p className="dg-nota">Formato A5, 148 × 210 mm, retrato.</p>
      <CampoNumero rotulo="Sangria (mm)" valor={s} aoMudar={n => setS(Math.max(0, n))} />
      <p className="dg-nota">A sangria é a faixa fora do papel, que a guilhotina corta fora.</p>
    </Dialogo>
  );
}

function DialogoDaMestre({ mestre, aoFechar, aoConfirmar }: { mestre: Documento['mestre']; aoFechar: () => void; aoConfirmar: (m: Documento['mestre']) => void }) {
  const [m, setM] = useState(mestre);
  return (
    <Dialogo titulo="Página-mestre A" aoFechar={aoFechar} aoConfirmar={() => aoConfirmar(m)}>
      <label className="dg-campo" style={{ gridTemplateColumns: 'auto 1fr' }}>
        <input type="checkbox" aria-label="Número de página automático" checked={m.numero} onChange={e => setM(x => ({ ...x, numero: e.target.checked }))} />
        Número de página automático
      </label>
      <label className="dg-campo" style={{ gridTemplateColumns: '1fr' }}>
        Cabeçalho corrente
        <input className="dg-entrada" aria-label="Cabeçalho corrente" value={m.cabecalho} onChange={e => setM(x => ({ ...x, cabecalho: e.target.value }))} />
      </label>
      <p className="dg-nota">O que está na mestre aparece em toda página que a usa.</p>
    </Dialogo>
  );
}

function EditorDeMateria({ documento: d, aoMudar, aoFechar }: { documento: Documento; aoMudar: (d: Documento) => void; aoFechar: () => void }) {
  return (
    <div className="dg-fundo-do-dialogo" onPointerDown={e => { if (e.target === e.currentTarget) aoFechar(); }}>
      <div className="dg-dialogo" role="dialog" aria-label="Editar matéria" style={{ width: 'min(720px, 100%)' }}>
        <h3>Editar matéria</h3>
        <p className="dg-nota">O "+" depois do nome do estilo quer dizer formatação aplicada à mão por cima dele.</p>
        <div className="dg-materia">
          {d.historia.map((p, i) => {
            const estilo = estiloDe(d, p.estilo);
            const mais = temFormatacaoDireta(p);
            return (
              <div key={p.id} className="dg-materia-linha">
                <span className="dg-materia-texto">
                  <span className="dg-materia-estilo">{estilo?.nome}{mais ? '+' : ''} · </span>{p.texto}
                </span>
                <select className="dg-entrada" aria-label={`Estilo do parágrafo ${i + 1}`} value={p.estilo}
                  onChange={e => aoMudar({ ...d, historia: d.historia.map(x => (x.id === p.id ? { ...x, estilo: e.target.value } : x)) })}>
                  {d.estilos.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </select>
                <button type="button" className="dg-botao-claro" aria-label={`Limpar formatação do parágrafo ${i + 1}`} disabled={!mais}
                  onClick={() => aoMudar({ ...d, historia: d.historia.map(x => (x.id === p.id ? { id: x.id, papel: x.papel, estilo: x.estilo, texto: x.texto } : x)) })}>
                  Limpar formatação
                </button>
              </div>
            );
          })}
        </div>
        <div className="dg-dialogo-acoes">
          <button type="button" className="dg-botao" onClick={aoFechar}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

/**
 * A exportação do PDF, com a prévia do que a gráfica vai receber: o papel, a
 * sangria em volta e as marcas de corte fora dela. A prévia mostra o que sai —
 * sem sangria, a foto da capa para na borda; com sangria, ela passa.
 */
function DialogoDoPdf({ documento: d, aoFechar, aoExportar }: {
  documento: Documento; aoFechar: () => void; aoExportar: (nome: string, opcoes: OpcoesDoPdf) => void;
}) {
  const [nome, setNome] = useState('boletim-de-inverno.pdf');
  const [opcoes, setOpcoes] = useState<OpcoesDoPdf>({ sangria: 0, marcasDeCorte: false, cor: 'rgb' });
  const k = 1.1;
  const s = Math.min(opcoes.sangria, d.sangria) * k;
  const fora = opcoes.marcasDeCorte ? 8 : 0;
  const W = d.formato.largura * k;
  const H = d.formato.altura * k;
  const capa = d.imagens.find(i => i.pagina === 0);
  const marcas = opcoes.marcasDeCorte
    ? [[0, 0], [1, 0], [0, 1], [1, 1]].flatMap(([cx, cy]) => {
      const x = fora + s + cx * W;
      const y = fora + s + cy * H;
      return [
        { left: cx ? x + s + 2 : x - s - 2 - 6, top: y, width: 6, height: 1 },
        { left: x, top: cy ? y + s + 2 : y - s - 2 - 6, width: 1, height: 6 },
      ];
    })
    : [];
  return (
    <Dialogo titulo="Exportar PDF" aoFechar={aoFechar} aoConfirmar={() => aoExportar(nome.trim() || 'boletim.pdf', opcoes)} rotuloDoOk="Exportar">
      <label className="dg-campo" style={{ gridTemplateColumns: '1fr' }}>
        Nome do arquivo
        <input className="dg-entrada" aria-label="Nome do arquivo" value={nome} onChange={e => setNome(e.target.value)} />
      </label>
      <CampoNumero rotulo="Sangria no PDF (mm)" valor={opcoes.sangria} aoMudar={n => setOpcoes(o => ({ ...o, sangria: Math.max(0, n) }))} />
      <label className="dg-campo" style={{ gridTemplateColumns: 'auto 1fr' }}>
        <input type="checkbox" aria-label="Marcas de corte" checked={opcoes.marcasDeCorte} onChange={e => setOpcoes(o => ({ ...o, marcasDeCorte: e.target.checked }))} />
        Marcas de corte
      </label>
      <label className="dg-campo" style={{ gridTemplateColumns: '1fr 160px' }}>
        Cor
        <select className="dg-entrada" aria-label="Cor" value={opcoes.cor} onChange={e => setOpcoes(o => ({ ...o, cor: e.target.value as OpcoesDoPdf['cor'] }))}>
          <option value="rgb">RGB (tela)</option>
          <option value="cmyk">CMYK (impressão)</option>
        </select>
      </label>
      {opcoes.sangria > d.sangria && (
        <p className="dg-nota">O documento reserva {mmEmTexto(d.sangria)} de sangria: o PDF não pode levar mais do que existe.</p>
      )}
      <div className="dg-previa" aria-label="Prévia da capa" style={{ width: W + 2 * (s + fora), height: H + 2 * (s + fora), background: '#E5E5E5' }}>
        <div style={{ position: 'absolute', left: fora, top: fora, width: W + 2 * s, height: H + 2 * s, background: '#FFFFFF', overflow: 'hidden' }}>
          {capa && (
            <div style={{
              position: 'absolute', background: 'linear-gradient(135deg, #4B6B5A, #2E4A3E 60%, #6E5A3A)',
              left: s + capa.x * k, top: s + capa.y * k, width: capa.largura * k, height: capa.altura * k,
            }} />
          )}
        </div>
        {marcas.map((r, i) => <span key={i} className="dg-marca-de-corte" style={r} />)}
      </div>
      <p className="dg-nota">A gráfica recebe o que está na prévia. A sangria mínima que ela costuma pedir é {SANGRIA_DA_GRAFICA} mm.</p>
    </Dialogo>
  );
}

