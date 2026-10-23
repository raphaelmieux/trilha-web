import { useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import {
  Crop, Eye, EyeOff, Image as IconeDeImagem, Layers, MousePointer2, Paintbrush, Pipette, Redo2, Stamp, Undo2, Wand2,
} from 'lucide-react';
import {
  AJUSTE_NEUTRO, adicionarMascara, ajustar, apagarSelecao, camadaAtiva, carimbar, comPpi, duplicarCamada,
  achatarDocumento, girar, girarDocumento, imagemDo, inverterMascara, naCamadaAtiva, pintar, pintarMascara, pixel,
  recortarDocumento, redimensionarDocumento, selecionarPorCor, somarMascaras, tamanhoImpresso,
  type Ajuste, type Documento, type Imagem, type Mascara,
} from './raster';
import {
  COM_PERDA, NOME_DO_FORMATO, exportar, tamanhoEscrito,
  type ArquivoDeImagem, type Formato,
} from './formatosDeImagem';

/**
 * A janela do editor de foto.
 *
 * ── Um arranjo, e não uma marca ──────────────────────────────────────────
 * Ferramentas numa coluna à esquerda, a imagem no meio, e à direita os
 * painéis de ajustes, camadas, histograma e informação. É o que o GIMP, o
 * Photopea e o Photoshop têm em comum — a decisão do editor de design e do de
 * código, pelo motivo escrito lá: imitar um deles ensinaria a achar os botões
 * daquele.
 *
 * ── O que ela guarda, e o que não guarda ─────────────────────────────────
 * O documento é de quem a abre: chega por `documento` e sai por `mudar`. Aqui
 * fica o estado da tela — ferramenta, zoom, o recorte que ainda não foi
 * aplicado, os controles de ajuste antes do Aplicar — e o histórico do
 * Ctrl+Z, que é do programa em todo programa.
 *
 * ── E o que aparece pela presença do setter ──────────────────────────────
 * O menu Arquivo só tem Exportar quando o laboratório entrega `aoExportar`, e
 * Abrir quando entrega `aoAbrir`; Antes e depois só existe com `antes`. É a
 * regra do `aoBuscar` do Explorador: comando que não faz nada naquela lição
 * ensinaria a desconfiar do programa.
 */

/* ── A folha ──────────────────────────────────────────────────────────────── */

/*
  Comentário dentro deste template não leva crase: fecha a string. Rode o tsc
  antes de medir qualquer coisa no navegador.
*/
export const CSS_DO_EDITOR_DE_FOTO = `
.ft-janela {
  flex: 1; min-height: 0; display: flex; flex-direction: column;
  background: #26272B; color: #E4E4E7;
  font-family: system-ui, 'Segoe UI', Roboto, sans-serif; font-size: 12.5px;
}
.ft-titulo { display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: #1C1D20; border-bottom: 1px solid #38393E; font-size: 12px; }
.ft-titulo-app { font-weight: 600; color: #FFFFFF; }
.ft-titulo-arquivo { color: #C4C5CA; }
.ft-titulo-acoes { margin-left: auto; display: flex; gap: 2px; }
.ft-menus { display: flex; gap: 2px; padding: 2px 6px; background: #1C1D20; border-bottom: 1px solid #38393E; flex-wrap: wrap; }
.ft-menu-ancora { position: relative; }
.ft-menu-botao { padding: 4px 8px; border-radius: 4px; color: #E4E4E7; background: transparent; }
.ft-menu-botao:hover, .ft-menu-botao[aria-expanded="true"] { background: #3A3B41; }
.ft-menu { position: absolute; top: 100%; left: 0; z-index: 20; min-width: 210px; padding: 4px; background: #2F3036; border: 1px solid #45464D; border-radius: 6px; box-shadow: 0 10px 24px rgba(0,0,0,0.45); }
.ft-menu-item { display: flex; justify-content: space-between; gap: 16px; width: 100%; padding: 6px 10px; border-radius: 4px; text-align: left; color: #E4E4E7; background: transparent; }
.ft-menu-item:hover { background: #3D6FE0; color: #FFFFFF; }
.ft-menu-item[aria-checked="true"]::before { content: '✓'; margin-right: 6px; }
.ft-menu-atalho { color: #A1A1AA; }
.ft-menu-item:hover .ft-menu-atalho { color: #FFFFFF; }
.ft-menu-divisoria { height: 1px; margin: 4px 2px; background: #45464D; }
.ft-corpo { flex: 1; min-height: 0; display: flex; }
.ft-ferramentas { display: flex; flex-direction: column; gap: 2px; padding: 6px 4px; background: #1C1D20; border-right: 1px solid #38393E; }
.ft-bt { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 5px; color: #D4D4D8; background: transparent; }
.ft-bt:hover { background: #3A3B41; }
.ft-bt[aria-pressed="true"] { background: #3D6FE0; color: #FFFFFF; }
.ft-bt:disabled { opacity: 0.4; cursor: not-allowed; }
.ft-mesa { flex: 1; min-width: 0; min-height: 0; overflow: auto; display: flex; align-items: flex-start; justify-content: center; padding: 18px; background: #18181B; }
.ft-tela { position: relative; flex: none; line-height: 0; background-color: #FFFFFF; background-image: linear-gradient(45deg, #CFCFD4 25%, transparent 25%), linear-gradient(-45deg, #CFCFD4 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #CFCFD4 75%), linear-gradient(-45deg, transparent 75%, #CFCFD4 75%); background-size: 16px 16px; background-position: 0 0, 0 8px, 8px -8px, -8px 0; box-shadow: 0 2px 12px rgba(0,0,0,0.5); touch-action: none; }
.ft-tela canvas { display: block; width: 100%; height: 100%; }
.ft-pixelado canvas { image-rendering: pixelated; }
.ft-sobreposta { position: absolute; inset: 0; pointer-events: none; }
.ft-recorte { position: absolute; border: 1px solid #FFFFFF; box-shadow: 0 0 0 9999px rgba(0,0,0,0.45); pointer-events: none; background-image: linear-gradient(to right, transparent 33.2%, rgba(255,255,255,0.6) 33.3%, transparent 33.5%, transparent 66.5%, rgba(255,255,255,0.6) 66.6%, transparent 66.8%), linear-gradient(to bottom, transparent 33.2%, rgba(255,255,255,0.6) 33.3%, transparent 33.5%, transparent 66.5%, rgba(255,255,255,0.6) 66.6%, transparent 66.8%); }
.ft-comparar { display: flex; gap: 12px; align-items: flex-start; }
.ft-comparar figure { margin: 0; display: flex; flex-direction: column; gap: 6px; align-items: center; }
.ft-comparar figcaption { color: #D4D4D8; font-size: 12px; }
.ft-direita { width: 264px; flex: none; overflow-y: auto; background: #202125; border-left: 1px solid #38393E; }
.ft-painel { padding: 10px 12px; border-bottom: 1px solid #38393E; display: flex; flex-direction: column; gap: 8px; }
.ft-painel-titulo { font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #A1A1AA; }
.ft-campo { display: grid; grid-template-columns: 1fr 72px; gap: 6px; align-items: center; }
.ft-campo label { color: #D4D4D8; }
.ft-entrada { width: 100%; padding: 4px 6px; border-radius: 4px; border: 1px solid #45464D; background: #18181B; color: #F4F4F5; font-variant-numeric: tabular-nums; }
.ft-faixa { grid-column: 1 / -1; width: 100%; accent-color: #3D6FE0; }
.ft-botao { padding: 6px 10px; border-radius: 5px; background: #3D6FE0; color: #FFFFFF; font-weight: 600; }
.ft-botao:hover { background: #3462CC; }
.ft-botao:disabled { background: #3A3B41; color: #8B8B93; cursor: not-allowed; }
.ft-botao-claro { padding: 6px 10px; border-radius: 5px; background: #3A3B41; color: #E4E4E7; }
.ft-botao-claro:hover { background: #45464D; }
.ft-botao-claro[aria-pressed="true"] { background: #3D6FE0; color: #FFFFFF; }
.ft-linha { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
.ft-camada { display: flex; align-items: center; gap: 6px; width: 100%; padding: 5px 6px; border-radius: 4px; background: transparent; color: #E4E4E7; text-align: left; }
.ft-camada[aria-current="true"] { background: #33415E; }
.ft-camada-nome { flex: 1; }
.ft-olho { color: #A1A1AA; }
.ft-histograma { width: 100%; height: 64px; background: #18181B; border-radius: 4px; }
.ft-info { font-variant-numeric: tabular-nums; color: #D4D4D8; }
.ft-ajuda { color: #A1A1AA; line-height: 1.4; }
.ft-status { display: flex; gap: 14px; padding: 4px 10px; background: #1C1D20; border-top: 1px solid #38393E; color: #A1A1AA; font-size: 11.5px; font-variant-numeric: tabular-nums; flex-wrap: wrap; }
.ft-fundo-do-dialogo { position: absolute; inset: 0; z-index: 40; background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; padding: 12px; }
.ft-dialogo { width: min(560px, 100%); max-height: 100%; overflow: auto; background: #2B2C31; border: 1px solid #45464D; border-radius: 8px; padding: 16px; display: flex; flex-direction: column; gap: 10px; color: #E4E4E7; }
.ft-dialogo h3 { margin: 0; font-size: 14px; color: #FFFFFF; }
.ft-dialogo-acoes { display: flex; justify-content: flex-end; gap: 8px; }
.ft-previa { position: relative; width: 100%; line-height: 0; border-radius: 4px; overflow: hidden; background: #18181B; }
.ft-previa canvas { width: 100%; height: auto; display: block; image-rendering: pixelated; }
.ft-previa-depois { position: absolute; inset: 0; overflow: hidden; }
.ft-previa-traco { position: absolute; top: 0; bottom: 0; width: 2px; background: #FFFFFF; }
.ft-aviso { padding: 6px 8px; border-radius: 4px; background: #4A3A12; color: #FDE68A; }
.ft-arquivo { display: flex; justify-content: space-between; width: 100%; padding: 6px 8px; border-radius: 4px; background: #33343A; color: #E4E4E7; text-align: left; }
.ft-arquivo:hover { background: #3D6FE0; color: #FFFFFF; }
/* No celular o corpo rola inteiro, e nenhuma faixa encolhe: numa coluna de
   flex a barra de ferramentas, que rola de lado, aceita altura zero, e os
   painéis empurravam a mesa e a barra para fora da vista. */
@media (max-width: 760px) {
  .ft-corpo { flex-direction: column; overflow-y: auto; }
  .ft-ferramentas { flex: none; flex-direction: row; border-right: none; border-bottom: 1px solid #38393E; overflow-x: auto; }
  .ft-mesa { flex: none; height: 46vh; min-height: 240px; padding: 10px; }
  .ft-direita { flex: none; width: auto; border-left: none; border-top: 1px solid #38393E; overflow: visible; }
  .ft-fundo-do-dialogo { align-items: flex-start; padding-top: 24px; }
}
`;

/* ── Peças ────────────────────────────────────────────────────────────────── */

/** Pinta uma imagem num canvas. No jsdom não há canvas, e a janela segue sem pintar. */
function Pintura({ img, rotulo }: { img: Imagem; rotulo: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = ref.current;
    const ctx = el?.getContext?.('2d');
    if (!el || !ctx) return;
    el.width = img.largura; el.height = img.altura;
    ctx.putImageData(new ImageData(new Uint8ClampedArray(img.px), img.largura, img.altura), 0, 0);
  }, [img]);
  return <canvas ref={ref} role="img" aria-label={rotulo} width={img.largura} height={img.altura} />;
}

/** A seleção pintada de azul translúcido por cima da imagem. */
function SelecaoPintada({ m }: { m: Mascara }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = ref.current;
    const ctx = el?.getContext?.('2d');
    if (!el || !ctx) return;
    el.width = m.largura; el.height = m.altura;
    const px = new Uint8ClampedArray(m.v.length * 4);
    for (let k = 0; k < m.v.length; k++) { px[k * 4] = 61; px[k * 4 + 1] = 111; px[k * 4 + 2] = 224; px[k * 4 + 3] = m.v[k] * 0.45; }
    ctx.putImageData(new ImageData(px, m.largura, m.altura), 0, 0);
  }, [m]);
  return <canvas ref={ref} className="ft-sobreposta" aria-hidden="true" />;
}

/** O histograma da luminância, com o pico das pontas à vista. */
function Histograma({ img }: { img: Imagem }) {
  const barras = useMemo(() => {
    const b = new Array<number>(64).fill(0);
    for (let i = 0; i < img.px.length; i += 16) {
      if (img.px[i + 3] < 128) continue;
      b[Math.min(63, Math.floor((0.2126 * img.px[i] + 0.7152 * img.px[i + 1] + 0.0722 * img.px[i + 2]) / 4))]++;
    }
    const max = Math.max(1, ...b);
    return b.map(v => v / max);
  }, [img]);
  const d = `M0,64 ${barras.map((v, i) => `L${i * 4},${64 - v * 62} L${i * 4 + 4},${64 - v * 62}`).join(' ')} L256,64 Z`;
  return (
    <svg className="ft-histograma" viewBox="0 0 256 64" preserveAspectRatio="none" role="img" aria-label="Histograma da luz, do escuro à esquerda ao claro à direita">
      <path d={d} fill="#A1A1AA" />
    </svg>
  );
}

const cm = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
const MAXIMO_DE_LADO = 6000;

/* ── A janela ────────────────────────────────────────────────────────────── */

type Ferramenta = 'mover' | 'recortar' | 'conta-gotas' | 'carimbo' | 'pincel' | 'varinha';
type Menu = 'arquivo' | 'editar' | 'imagem' | 'camada' | 'selecao' | 'exibir' | null;
type Zoom = 'ajustar' | number;

export interface PropsDoEditorDeFoto {
  documento: Documento;
  mudar: (d: Documento) => void;
  /** Os arquivos da pasta, para Abrir e para avisar quando exportar escreve por cima. */
  pasta?: { nome: string }[];
  aoAbrir?: (nome: string) => void;
  aoExportar?: (a: ArquivoDeImagem) => void;
  /** A imagem de antes da edição, para Exibir → Antes e depois. */
  antes?: Imagem;
  aoVer?: (chave: string) => void;
  aoAvisar?: (texto: string) => void;
}

export function EditorDeFoto({ documento: d, mudar, pasta = [], aoAbrir, aoExportar, antes, aoVer, aoAvisar }: PropsDoEditorDeFoto) {
  const [ferramenta, setFerramenta] = useState<Ferramenta>('mover');
  const [menu, setMenu] = useState<Menu>(null);
  const [zoom, setZoom] = useState<Zoom>('ajustar');
  const [comparando, setComparando] = useState(false);
  const [info, setInfo] = useState<{ x: number; y: number; cor: number[] } | null>(null);
  const [ajuste, setAjuste] = useState<Ajuste>(AJUSTE_NEUTRO);
  const [raio, setRaio] = useState(26);
  const [corDoPincel, setCorDoPincel] = useState('#5A9646');
  const [valorDaMascara, setValorDaMascara] = useState<0 | 255>(0);
  const [tolerancia, setTolerancia] = useState(32);
  const [contigua, setContigua] = useState(true);
  const [origem, setOrigem] = useState<{ x: number; y: number } | null>(null);
  const [definindoOrigem, setDefinindoOrigem] = useState(false);
  const deslocamento = useRef<{ dx: number; dy: number } | null>(null);
  const [angulo, setAngulo] = useState(0);
  const [corte, setCorte] = useState<{ x: number; y: number; l: number; a: number } | null>(null);
  const [dialogo, setDialogo] = useState<'tamanho' | 'exportar' | 'abrir' | null>(null);
  const passado = useRef<Documento[]>([]);
  const futuro = useRef<Documento[]>([]);
  const traco = useRef<Documento | null>(null);
  const avisos = useRef({ aoVer, aoAvisar });
  avisos.current = { aoVer, aoAvisar };

  const vista = useMemo(() => imagemDo(d), [d]);
  const ativa = camadaAtiva(d);
  const { largura, altura } = vista;
  const avisar = (t: string) => avisos.current.aoAvisar?.(t);

  /* Ajuste ainda não aplicado aparece na tela, como em todo editor: é olhando
     que se decide quanto subir. */
  const previa = useMemo(() => {
    if (ferramenta === 'recortar' && angulo !== 0) return girar(vista, angulo);
    if (ajuste === AJUSTE_NEUTRO || d.naMascara) return vista;
    const comAjuste = { ...d, camadas: d.camadas.map(c => (c.id === d.ativa ? { ...c, imagem: ajustar(c.imagem, ajuste) } : c)) };
    return imagemDo(comAjuste);
  }, [vista, ajuste, d, ferramenta, angulo]);

  const aplicar = (novo: Documento) => {
    passado.current.push(d);
    if (passado.current.length > 12) passado.current.shift();
    futuro.current = [];
    mudar(novo);
  };
  const voltar = () => { const a = passado.current.pop(); if (a) { futuro.current.push(d); mudar(a); } };
  const avancar = () => { const a = futuro.current.pop(); if (a) { passado.current.push(d); mudar(a); } };

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement | null;
      if (alvo && (alvo.tagName === 'INPUT' || alvo.tagName === 'TEXTAREA' || alvo.tagName === 'SELECT')) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); voltar(); }
      else if (mod && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) { e.preventDefault(); avancar(); }
      else if (e.key === 'Delete' && d.selecao) { e.preventDefault(); excluirSelecao(); }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  });

  const mudarZoom = (z: Zoom) => {
    setZoom(z);
    if (typeof z === 'number' && z >= 16) avisos.current.aoVer?.('zoom:1600');
  };

  /* ── Comandos ── */

  const excluirSelecao = () => {
    if (!d.selecao) { avisar('Não há nada selecionado para excluir. Use a Varinha antes.'); return; }
    if (ativa.mascara && d.naMascara) { avisar('Excluir age nos pontos da camada. Saia da máscara no painel Camadas.'); return; }
    aplicar({ ...naCamadaAtiva(d, img => apagarSelecao(img, d.selecao!)), selecao: d.selecao });
  };

  const aplicarAjuste = () => {
    if (ajuste === AJUSTE_NEUTRO) return;
    aplicar(naCamadaAtiva(d, img => ajustar(img, ajuste)));
    setAjuste(AJUSTE_NEUTRO);
  };

  const aplicarRecorte = () => {
    const r = corte ?? { x: 0, y: 0, l: largura, a: altura };
    let novo = d;
    if (angulo !== 0) novo = girarDocumento(novo, angulo);
    if (r.x !== 0 || r.y !== 0 || r.l !== largura || r.a !== altura) novo = recortarDocumento(novo, r);
    if (novo === d) { avisar('Nada a aplicar: o ângulo é zero e o recorte é a imagem inteira.'); return; }
    aplicar(novo);
    setAngulo(0); setCorte(null);
  };

  /* ── O ponteiro ── */

  const ponto = (e: React.PointerEvent) => {
    const r = (e.currentTarget as Element).getBoundingClientRect();
    const k = r.width ? r.width / largura : 1;
    return { x: Math.round((e.clientX - r.left) / k), y: Math.round((e.clientY - r.top) / k) };
  };

  const pincelada = (base: Documento, p: { x: number; y: number }) => {
    if (ferramenta === 'carimbo') {
      if (!deslocamento.current) return base;
      return naCamadaAtiva(base, img => carimbar(img, p, deslocamento.current!, raio));
    }
    if (ativa.mascara && d.naMascara) return pintarMascara(base, p, valorDaMascara, raio);
    const h = corDoPincel.replace('#', '');
    const cor: [number, number, number] = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    return naCamadaAtiva(base, img => pintar(img, p, cor, raio));
  };

  const apertou = (e: React.PointerEvent) => {
    if (comparando) return;
    const p = ponto(e);
    if (ferramenta === 'conta-gotas') {
      setInfo({ ...p, cor: pixel(vista, p.x, p.y) });
      avisos.current.aoVer?.('conta-gotas');
      return;
    }
    if (ferramenta === 'varinha') {
      const nova = selecionarPorCor(vista, p.x, p.y, tolerancia, contigua);
      mudar({ ...d, selecao: e.shiftKey && d.selecao ? somarMascaras(d.selecao, nova) : nova });
      return;
    }
    if (ferramenta === 'carimbo') {
      if (definindoOrigem || !origem) {
        setOrigem(p); setDefinindoOrigem(false); deslocamento.current = null;
        if (!origem && !definindoOrigem) avisar('Origem definida aí. Agora clique onde quer cobrir.');
        return;
      }
      if (!deslocamento.current) deslocamento.current = { dx: origem.x - p.x, dy: origem.y - p.y };
    }
    if (ferramenta === 'carimbo' || ferramenta === 'pincel') {
      traco.current = d;
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      mudar(pincelada(d, p));
    }
  };
  const moveu = (e: React.PointerEvent) => {
    if (!traco.current) return;
    mudar(pincelada(d, ponto(e)));
  };
  const soltou = () => {
    if (!traco.current) return;
    passado.current.push(traco.current);
    futuro.current = [];
    traco.current = null;
  };

  /* ── Desenho ── */

  const escala = zoom === 'ajustar' ? null : zoom;
  const estiloDaTela: React.CSSProperties = escala
    ? { width: largura * escala, height: altura * escala }
    : { width: `min(100%, ${largura}px)`, aspectRatio: `${largura} / ${altura}` };

  const item = (rotulo: string, acao: () => void, atalho?: string, marcado?: boolean) => (
    <button key={rotulo} type="button" className="ft-menu-item" role={marcado === undefined ? 'menuitem' : 'menuitemcheckbox'}
      aria-checked={marcado} onClick={() => { acao(); setMenu(null); }}>
      <span>{rotulo}</span>{atalho && <span className="ft-menu-atalho">{atalho}</span>}
    </button>
  );

  const NOME_DO_MENU: Record<Exclude<Menu, null>, string> = {
    arquivo: 'Arquivo', editar: 'Editar', imagem: 'Imagem', camada: 'Camada', selecao: 'Seleção', exibir: 'Exibir',
  };

  const ferramentaBt = (rotulo: string, Icone: typeof Crop, f: Ferramenta) => (
    <button type="button" className="ft-bt" title={rotulo} aria-label={rotulo} aria-pressed={ferramenta === f}
      onClick={() => { setFerramenta(f); setDefinindoOrigem(false); }}>
      <Icone className="w-4 h-4" aria-hidden="true" />
    </button>
  );

  const numero = (rotulo: string, valor: number, aoMudar: (v: number) => void, min: number, max: number, passo = 1, faixa = false) => (
    <div className="ft-campo">
      <label htmlFor={`ft-${rotulo}`}>{rotulo}</label>
      <input id={`ft-${rotulo}`} className="ft-entrada" type="number" aria-label={rotulo} value={valor} min={min} max={max} step={passo}
        onChange={e => { const v = Number(e.target.value); if (Number.isFinite(v)) aoMudar(Math.min(max, Math.max(min, v))); }} />
      {faixa && (
        <input className="ft-faixa" type="range" aria-label={`${rotulo} (faixa)`} value={valor} min={min} max={max} step={passo}
          onChange={e => aoMudar(Number(e.target.value))} />
      )}
    </div>
  );

  const papel = tamanhoImpresso(vista);
  const r = corte ?? { x: 0, y: 0, l: largura, a: altura };

  return (
    <div className="ft-janela">
      <div className="ft-titulo">
        <IconeDeImagem className="w-4 h-4" aria-hidden="true" />
        <span className="ft-titulo-app">Editor de foto</span>
        <span className="ft-titulo-arquivo">{d.nome}</span>
        <span className="ft-titulo-acoes">
          <button type="button" className="ft-bt" aria-label="Desfazer (Ctrl+Z)" title="Desfazer (Ctrl+Z)" onClick={voltar} disabled={!passado.current.length}>
            <Undo2 className="w-4 h-4" aria-hidden="true" />
          </button>
          <button type="button" className="ft-bt" aria-label="Refazer (Ctrl+Y)" title="Refazer (Ctrl+Y)" onClick={avancar} disabled={!futuro.current.length}>
            <Redo2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </span>
      </div>

      <div className="ft-menus" role="menubar">
        {(Object.keys(NOME_DO_MENU) as Exclude<Menu, null>[]).filter(m => m !== 'arquivo' || aoExportar || aoAbrir).map(m => (
          <div key={m} className="ft-menu-ancora">
            <button type="button" className="ft-menu-botao" aria-haspopup="menu" aria-expanded={menu === m}
              onClick={() => setMenu(menu === m ? null : m)}>
              {NOME_DO_MENU[m]}
            </button>
            {menu === m && (
              <div className="ft-menu" role="menu">
                {m === 'arquivo' && <>
                  {aoAbrir && item('Abrir…', () => setDialogo('abrir'), 'Ctrl+O')}
                  {aoExportar && item('Exportar como…', () => setDialogo('exportar'), 'Ctrl+Shift+E')}
                </>}
                {m === 'editar' && <>
                  {item('Desfazer', voltar, 'Ctrl+Z')}
                  {item('Refazer', avancar, 'Ctrl+Y')}
                  <div className="ft-menu-divisoria" />
                  {item('Excluir', excluirSelecao, 'Del')}
                </>}
                {m === 'imagem' && item('Tamanho da imagem…', () => setDialogo('tamanho'), 'Alt+Ctrl+I')}
                {m === 'camada' && <>
                  {item('Duplicar camada', () => aplicar(duplicarCamada(d, `camada-${d.camadas.length + 1}`)))}
                  {item('Adicionar máscara', () => {
                    if (ativa.mascara) { avisar('Esta camada já tem máscara.'); return; }
                    aplicar(adicionarMascara(d));
                  })}
                  {item('Achatar imagem', () => aplicar(achatarDocumento(d)))}
                </>}
                {m === 'selecao' && <>
                  {item('Inverter seleção', () => { if (d.selecao) mudar({ ...d, selecao: inverterMascara(d.selecao) }); else avisar('Não há seleção para inverter.'); }, 'Shift+Ctrl+I')}
                  {item('Desmarcar', () => mudar({ ...d, selecao: null }), 'Ctrl+D')}
                </>}
                {m === 'exibir' && <>
                  {item('Ajustar à tela', () => mudarZoom('ajustar'), undefined, zoom === 'ajustar')}
                  {[0.25, 0.5, 1, 2, 4, 8, 16].map(z => item(`${z * 100}%`, () => mudarZoom(z), undefined, zoom === z))}
                  {antes && <>
                    <div className="ft-menu-divisoria" />
                    {item('Antes e depois', () => { setComparando(v => !v); avisos.current.aoVer?.('antes-e-depois'); }, undefined, comparando)}
                  </>}
                </>}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="ft-corpo">
        <div className="ft-ferramentas" role="toolbar" aria-label="Ferramentas">
          {ferramentaBt('Mover (V)', MousePointer2, 'mover')}
          {ferramentaBt('Recortar (C)', Crop, 'recortar')}
          {ferramentaBt('Conta-gotas (I)', Pipette, 'conta-gotas')}
          {ferramentaBt('Carimbo (S)', Stamp, 'carimbo')}
          {ferramentaBt('Pincel (B)', Paintbrush, 'pincel')}
          {ferramentaBt('Varinha (W)', Wand2, 'varinha')}
        </div>

        <div className="ft-mesa" aria-label="Mesa">
          {comparando && antes ? (
            <div className="ft-comparar">
              <figure><div className="ft-tela" style={{ width: 'min(42vw, 520px)', aspectRatio: `${antes.largura} / ${antes.altura}` }}><Pintura img={antes} rotulo="Antes" /></div><figcaption>Antes</figcaption></figure>
              <figure><div className="ft-tela" style={{ width: 'min(42vw, 520px)', aspectRatio: `${largura} / ${altura}` }}><Pintura img={vista} rotulo="Depois" /></div><figcaption>Depois</figcaption></figure>
            </div>
          ) : (
            <div className={`ft-tela${escala && escala >= 2 ? ' ft-pixelado' : ''}`} style={estiloDaTela} aria-label="Área da imagem"
              onPointerDown={apertou} onPointerMove={moveu} onPointerUp={soltou} onPointerCancel={soltou}>
              <Pintura img={previa} rotulo={`Imagem ${d.nome}`} />
              {d.selecao && <SelecaoPintada m={d.selecao} />}
              {ferramenta === 'recortar' && (
                <div className="ft-recorte" style={{
                  left: `${(r.x / largura) * 100}%`, top: `${(r.y / altura) * 100}%`,
                  width: `${(r.l / largura) * 100}%`, height: `${(r.a / altura) * 100}%`,
                }} />
              )}
            </div>
          )}
        </div>

        <div className="ft-direita">
          {ferramenta === 'recortar' && (
            <div className="ft-painel" aria-label="Recortar">
              <div className="ft-painel-titulo">Recortar e endireitar</div>
              {numero('Endireitar (graus)', angulo, setAngulo, -45, 45, 0.1, true)}
              {numero('X do recorte', r.x, v => setCorte({ ...r, x: v }), 0, largura - 1)}
              {numero('Y do recorte', r.y, v => setCorte({ ...r, y: v }), 0, altura - 1)}
              {numero('Largura do recorte', r.l, v => setCorte({ ...r, l: v }), 1, largura)}
              {numero('Altura do recorte', r.a, v => setCorte({ ...r, a: v }), 1, altura)}
              <p className="ft-ajuda">A grade divide o quadro em terços. Girar abre cantos sem foto, que o recorte precisa deixar de fora.</p>
              <button type="button" className="ft-botao" onClick={aplicarRecorte}>Aplicar recorte</button>
            </div>
          )}
          {ferramenta === 'carimbo' && (
            <div className="ft-painel" aria-label="Carimbo">
              <div className="ft-painel-titulo">Carimbo</div>
              {numero('Raio do pincel', raio, setRaio, 2, 200)}
              <button type="button" className="ft-botao-claro" aria-pressed={definindoOrigem} onClick={() => setDefinindoOrigem(true)}>Definir origem</button>
              <p className="ft-ajuda">{origem ? `Origem em ${origem.x}, ${origem.y}. O carimbo copia de lá, mantendo a mesma distância.` : 'Clique primeiro onde está o que vai ser copiado.'}</p>
            </div>
          )}
          {ferramenta === 'pincel' && (
            <div className="ft-painel" aria-label="Pincel">
              <div className="ft-painel-titulo">Pincel{d.naMascara && ativa.mascara ? ' — na máscara' : ''}</div>
              {numero('Raio do pincel', raio, setRaio, 2, 200)}
              {d.naMascara && ativa.mascara ? (
                <div className="ft-linha">
                  <button type="button" className="ft-botao-claro" aria-pressed={valorDaMascara === 0} onClick={() => setValorDaMascara(0)}>Preto (esconde)</button>
                  <button type="button" className="ft-botao-claro" aria-pressed={valorDaMascara === 255} onClick={() => setValorDaMascara(255)}>Branco (mostra)</button>
                </div>
              ) : (
                <div className="ft-campo"><label htmlFor="ft-cor">Cor do pincel</label>
                  <input id="ft-cor" type="color" aria-label="Cor do pincel" value={corDoPincel} onChange={e => setCorDoPincel(e.target.value)} /></div>
              )}
            </div>
          )}
          {ferramenta === 'varinha' && (
            <div className="ft-painel" aria-label="Varinha">
              <div className="ft-painel-titulo">Varinha</div>
              {numero('Tolerância', tolerancia, setTolerancia, 0, 255)}
              <label className="ft-linha"><input type="checkbox" checked={contigua} onChange={e => setContigua(e.target.checked)} /> Contígua</label>
              <p className="ft-ajuda">Shift + clique soma à seleção. Seleção → Inverter troca o escolhido pelo resto.</p>
            </div>
          )}

          <div className="ft-painel" aria-label="Ajustes">
            <div className="ft-painel-titulo">Ajustes{d.naMascara && ativa.mascara ? ' (saia da máscara para usar)' : ''}</div>
            {numero('Exposição', ajuste.exposicao, v => setAjuste({ ...ajuste, exposicao: v }), -3, 3, 0.1, true)}
            {numero('Contraste', ajuste.contraste, v => setAjuste({ ...ajuste, contraste: v }), -100, 100, 1, true)}
            {numero('Temperatura', ajuste.temperatura, v => setAjuste({ ...ajuste, temperatura: v }), -100, 100, 1, true)}
            <div className="ft-linha">
              <button type="button" className="ft-botao" disabled={ajuste === AJUSTE_NEUTRO || (d.naMascara && !!ativa.mascara)} onClick={aplicarAjuste}>Aplicar ajustes</button>
              <button type="button" className="ft-botao-claro" onClick={() => setAjuste(AJUSTE_NEUTRO)}>Redefinir</button>
            </div>
          </div>

          <div className="ft-painel" aria-label="Camadas">
            <div className="ft-painel-titulo"><Layers className="w-3.5 h-3.5 inline" aria-hidden="true" /> Camadas</div>
            {[...d.camadas].reverse().map(c => (
              <div key={c.id} className="ft-linha">
                <button type="button" className="ft-olho" aria-label={`${c.visivel ? 'Esconder' : 'Mostrar'} ${c.nome}`}
                  onClick={() => mudar({ ...d, camadas: d.camadas.map(x => (x.id === c.id ? { ...x, visivel: !x.visivel } : x)) })}>
                  {c.visivel ? <Eye className="w-4 h-4" aria-hidden="true" /> : <EyeOff className="w-4 h-4" aria-hidden="true" />}
                </button>
                <button type="button" className="ft-camada" aria-current={c.id === d.ativa} style={{ flex: 1 }}
                  onClick={() => mudar({ ...d, ativa: c.id, naMascara: false })}>
                  <span className="ft-camada-nome">{c.nome}</span>
                  {c.mascara && <span className="ft-ajuda">com máscara</span>}
                </button>
              </div>
            ))}
            {ativa.mascara && (
              <div className="ft-linha">
                <button type="button" className="ft-botao-claro" aria-pressed={!d.naMascara} onClick={() => mudar({ ...d, naMascara: false })}>Editar a camada</button>
                <button type="button" className="ft-botao-claro" aria-pressed={d.naMascara} onClick={() => mudar({ ...d, naMascara: true })}>Editar a máscara</button>
              </div>
            )}
          </div>

          <div className="ft-painel" aria-label="Histograma">
            <div className="ft-painel-titulo">Histograma</div>
            <Histograma img={previa} />
          </div>

          <div className="ft-painel" aria-label="Info">
            <div className="ft-painel-titulo">Info</div>
            <div className="ft-info">
              {info ? `x ${info.x}, y ${info.y} — R ${info.cor[0]}  G ${info.cor[1]}  B ${info.cor[2]}` : 'Use o Conta-gotas para ler um pixel.'}
            </div>
          </div>
        </div>
      </div>

      <div className="ft-status">
        <span>{largura} × {altura} px</span>
        <span>{vista.ppi} ppi</span>
        <span>{cm(papel.l)} × {cm(papel.a)} cm no papel</span>
        <span>Zoom {zoom === 'ajustar' ? 'ajustado' : `${zoom * 100}%`}</span>
        {d.selecao && <span>Seleção ativa</span>}
      </div>

      {dialogo === 'tamanho' && (
        <DialogoDeTamanho d={d} aoFechar={() => setDialogo(null)} aoAvisar={avisar}
          aoAplicar={novo => { aplicar(novo); setDialogo(null); }} />
      )}
      {dialogo === 'exportar' && aoExportar && (
        <DialogoDeExportar img={vista} nome={d.nome} pasta={pasta} aoFechar={() => setDialogo(null)}
          aoExportar={a => { aoExportar(a); setDialogo(null); avisar(`Exportado: ${a.nome}, ${tamanhoEscrito(a.bytes)}.`); }} />
      )}
      {dialogo === 'abrir' && aoAbrir && (
        <div className="ft-fundo-do-dialogo">
          <div className="ft-dialogo" role="dialog" aria-modal="true" aria-label="Abrir">
            <h3>Abrir</h3>
            {pasta.length === 0 ? <p className="ft-ajuda">A pasta está vazia.</p> : pasta.map(a => (
              <button key={a.nome} type="button" className="ft-arquivo" onClick={() => { aoAbrir(a.nome); setDialogo(null); passado.current = []; futuro.current = []; }}>
                <span>{a.nome}</span>
              </button>
            ))}
            <div className="ft-dialogo-acoes"><button type="button" className="ft-botao-claro" onClick={() => setDialogo(null)}>Cancelar</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Tamanho da imagem ───────────────────────────────────────────────────── */

/**
 * A caixa mais mal entendida de todo editor de foto, e por isso o requisito
 * 4.5. Com Reamostrar marcado, mudar o ppi mantendo os centímetros muda os
 * pixels — inventa ou joga fora. Desmarcado, os pixels ficam e só os
 * centímetros mudam. A caixa diz as duas contas antes do OK, como as de
 * verdade dizem.
 */
function DialogoDeTamanho({ d, aoAplicar, aoFechar, aoAvisar }: {
  d: Documento; aoAplicar: (d: Documento) => void; aoFechar: () => void; aoAvisar: (t: string) => void;
}) {
  const img = imagemDo(d);
  const [reamostrar, setReamostrar] = useState(true);
  const [largura, setLargura] = useState(img.largura);
  const [ppi, setPpi] = useState(img.ppi);
  const altura = Math.round(largura * img.altura / img.largura);
  const lPx = reamostrar ? largura : img.largura;
  const aPx = reamostrar ? altura : img.altura;
  const megabytes = (lPx * aPx * 4) / (1024 * 1024);

  const ok = () => {
    if (lPx > MAXIMO_DE_LADO || aPx > MAXIMO_DE_LADO) {
      aoAvisar(`Este editor trabalha com até ${MAXIMO_DE_LADO} pixels de lado.`);
      return;
    }
    let novo = d;
    if (reamostrar && (lPx !== img.largura || aPx !== img.altura)) novo = redimensionarDocumento(novo, lPx, aPx);
    if (ppi !== img.ppi) novo = comPpi(novo, ppi);
    if (novo === d) { aoFechar(); return; }
    aoAplicar(novo);
  };

  const mudarPpi = (v: number) => {
    // Com Reamostrar marcado, o ppi novo mantém os centímetros: são os pixels que acompanham.
    if (reamostrar) setLargura(Math.round((img.largura / img.ppi) * v));
    setPpi(v);
  };

  return (
    <div className="ft-fundo-do-dialogo">
      <div className="ft-dialogo" role="dialog" aria-modal="true" aria-label="Tamanho da imagem">
        <h3>Tamanho da imagem</h3>
        <div className="ft-campo"><label htmlFor="ft-larg">Largura (px)</label>
          <input id="ft-larg" className="ft-entrada" type="number" aria-label="Largura (px)" value={lPx} disabled={!reamostrar}
            onChange={e => setLargura(Math.max(1, Math.round(Number(e.target.value) || 1)))} /></div>
        <div className="ft-campo"><label htmlFor="ft-alt">Altura (px)</label>
          <input id="ft-alt" className="ft-entrada" type="number" aria-label="Altura (px)" value={aPx} disabled /></div>
        <div className="ft-campo"><label htmlFor="ft-ppi">Resolução (ppi)</label>
          <input id="ft-ppi" className="ft-entrada" type="number" aria-label="Resolução (ppi)" value={ppi}
            onChange={e => mudarPpi(Math.max(1, Math.round(Number(e.target.value) || 1)))} /></div>
        <label className="ft-linha"><input type="checkbox" aria-label="Reamostrar" checked={reamostrar} onChange={e => { setReamostrar(e.target.checked); if (!e.target.checked) setLargura(img.largura); }} /> Reamostrar</label>
        <p className="ft-info">No papel: {cm((lPx / ppi) * 2.54)} × {cm((aPx / ppi) * 2.54)} cm · Na memória: {megabytes.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} MB</p>
        <p className="ft-ajuda">{reamostrar ? 'Reamostrar muda quantos pixels a imagem tem.' : 'Sem reamostrar, os pixels ficam os mesmos: só o tamanho no papel muda.'}</p>
        <div className="ft-dialogo-acoes">
          <button type="button" className="ft-botao-claro" onClick={aoFechar}>Cancelar</button>
          <button type="button" className="ft-botao" onClick={ok}>OK</button>
        </div>
      </div>
    </div>
  );
}

/* ── Exportar como ───────────────────────────────────────────────────────── */

/**
 * O tamanho do arquivo é calculado antes de exportar, e a prévia tem a
 * divisória do antes e depois: comprimir só ensina quando dá para ver o que
 * se perdeu, que é a regra do compressor da trilha. Ela não avisa que o JPG
 * joga fora a transparência: a prévia mostra o fundo saindo branco, que é como
 * o programa de verdade conta, e um aviso escrito poria na tela a resposta da
 * lição 6. E exportar com o nome de
 * um arquivo que já está na pasta escreve por cima dele — a caixa avisa, como
 * a de verdade avisa, e deixa.
 */
function DialogoDeExportar({ img, nome, pasta, aoExportar, aoFechar }: {
  img: Imagem; nome: string; pasta: { nome: string }[]; aoExportar: (a: ArquivoDeImagem) => void; aoFechar: () => void;
}) {
  const base = nome.replace(/\.[a-z0-9]+$/i, '');
  const [formato, setFormato] = useState<Formato>('jpg');
  const [qualidade, setQualidade] = useState(85);
  const [nomeNovo, setNomeNovo] = useState(`${base}-editada`);
  const [divisoria, setDivisoria] = useState(50);
  const extensao = formato === 'tiff' ? 'tif' : formato;
  const nomeFinal = /\.[a-z0-9]+$/i.test(nomeNovo) ? nomeNovo : `${nomeNovo}.${extensao}`;
  const arquivo = useMemo(() => exportar(img, formato, nomeFinal, qualidade), [img, formato, qualidade, nomeFinal]);
  const existe = pasta.some(a => a.nome === nomeFinal);

  return (
    <div className="ft-fundo-do-dialogo">
      <div className="ft-dialogo" role="dialog" aria-modal="true" aria-label="Exportar como">
        <h3>Exportar como</h3>
        <div className="ft-campo" style={{ gridTemplateColumns: '1fr 2fr' }}><label htmlFor="ft-nome">Nome do arquivo</label>
          <input id="ft-nome" className="ft-entrada" aria-label="Nome do arquivo" value={nomeNovo} onChange={e => setNomeNovo(e.target.value)} /></div>
        <div className="ft-campo" style={{ gridTemplateColumns: '1fr 2fr' }}><label htmlFor="ft-formato">Formato</label>
          <select id="ft-formato" className="ft-entrada" aria-label="Formato" value={formato} onChange={e => setFormato(e.target.value as Formato)}>
            {(['jpg', 'png', 'webp', 'tiff'] as Formato[]).map(f => <option key={f} value={f}>{NOME_DO_FORMATO[f]}</option>)}
          </select></div>
        {COM_PERDA[formato] && (
          <div className="ft-campo"><label htmlFor="ft-q">Qualidade</label>
            <input id="ft-q" className="ft-entrada" type="number" aria-label="Qualidade" min={1} max={100} value={qualidade}
              onChange={e => setQualidade(Math.min(100, Math.max(1, Math.round(Number(e.target.value) || 1))))} />
            <input className="ft-faixa" type="range" aria-label="Qualidade (faixa)" min={1} max={100} value={qualidade} onChange={e => setQualidade(Number(e.target.value))} />
          </div>
        )}
        <p className="ft-info">{nomeFinal} · {img.largura} × {img.altura} px · Tamanho do arquivo: {tamanhoEscrito(arquivo.bytes)}</p>
        <div className="ft-previa" aria-label="Prévia: antes à esquerda, depois à direita">
          <Pintura img={img} rotulo="Antes de exportar" />
          <div className="ft-previa-depois" style={{ clipPath: `inset(0 0 0 ${divisoria}%)` }}><Pintura img={arquivo.imagem} rotulo="Como o arquivo vai ficar" /></div>
          <div className="ft-previa-traco" style={{ left: `${divisoria}%` }} />
        </div>
        <input className="ft-faixa" type="range" aria-label="Divisória" min={0} max={100} value={divisoria} onChange={e => setDivisoria(Number(e.target.value))} />
        {existe && <p className="ft-aviso">Já existe um arquivo com este nome na pasta. Exportar vai substituí-lo.</p>}
        <div className="ft-dialogo-acoes">
          <button type="button" className="ft-botao-claro" onClick={aoFechar}>Cancelar</button>
          <button type="button" className="ft-botao" onClick={() => aoExportar(arquivo)}>{existe ? 'Substituir' : 'Exportar'}</button>
        </div>
      </div>
    </div>
  );
}
