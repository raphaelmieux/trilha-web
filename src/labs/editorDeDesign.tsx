import { useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import {
  AlignCenterHorizontal, AlignCenterVertical, AlignEndHorizontal, AlignEndVertical,
  AlignHorizontalDistributeCenter, AlignStartHorizontal, AlignStartVertical,
  AlignVerticalDistributeCenter, BringToFront, Copy, Flame, Layers, Mountain,
  MousePointer2, Paintbrush, Redo2, SendToBack, Square, Tent, Trash2, Type, Undo2, Waves,
} from 'lucide-react';
import {
  FAMILIAS, LISTA_DE_FAMILIAS, MATRIZ_DA_DEUTERANOPIA, NOME_DA_CLASSIFICACAO, NOME_DO_PAPEL, PAPEIS,
  alinhar, alturaDe, alturaDaLinha, cmykDe, colarEstilo, contrasteDoTexto, contrasteMinimo, copiarEstilo,
  distribuir, duplicarPrancha, ehHex, ehTextoGrande, excluir, foraDaGama, fundosDoTexto, hexDeHsl,
  hslDe, idNovo, linhasDoTexto, mudarObjetos, mudarOrdem, mudarPrancha, provaDeImpressao, umaPrancha,
  EXTREMIDADE_NO_SVG, moverObjeto, posicionar, redimensionar,
  type Arte, type Borda, type EstiloCopiado, type Familia, type Objeto, type Papel, type Prancha, type Texto,
} from './design';
import { dDosContornos } from './vetor';
import { contrastRatio, hexToRgb } from '../lib/imageTools';

/**
 * A janela do editor de design.
 *
 * ── Um arranjo, e não uma marca ──────────────────────────────────────────
 * Prancha no meio, pranchas e camadas à esquerda, propriedades à direita, a
 * barra de ferramentas e de alinhar em cima. É o que o Canva, o Figma e o
 * Inkscape têm em comum, e é o que `design.ts` explica: imitar um deles
 * ensinaria a achar os botões daquele.
 *
 * A família de Design inteira abre esta janela — a CC-DG001 agora, e as de
 * vetor, identidade e diagramação depois. Ela nasce aqui, e não dentro do
 * laboratório da CC-DG001, pela decisão de `word.tsx` e `excel.tsx`: extrair
 * **antes** de a cópia existir.
 *
 * ── O que ela guarda, e o que não guarda ─────────────────────────────────
 * O arquivo é de quem a abre: chega por `arte` e sai por `mudar`, e é dele que
 * as metas leem. O que fica aqui é o estado **da tela** — qual prancha está à
 * vista, o que está selecionado, que menu está aberto, a simulação de visão —
 * e o histórico do Ctrl+Z, que é do programa em todo programa.
 *
 * O que a lição precisa saber do que a pessoa **viu** sai por `aoVer` e
 * `aoMedir`. A janela diz o que aconteceu; quem decide se isso conta para
 * alguma tarefa é o laboratório.
 *
 * ── O texto quebra pelo modelo ───────────────────────────────────────────
 * Cada linha é um elemento, quebrada por `linhasDoTexto`. Se o navegador
 * quebrasse, a altura na tela seria uma e a da conta outra, e a lição de
 * proximidade mediria vãos que a pessoa não está vendo.
 */

/* ── A folha ──────────────────────────────────────────────────────────────── */

/*
  Comentário dentro deste template não leva crase: fecha a string, e o
  servidor de desenvolvimento continua servindo o módulo antigo. Rode o tsc
  antes de medir qualquer coisa no navegador.
*/
export const CSS_DO_EDITOR_DE_DESIGN = `
.dz-janela {
  flex: 1; min-height: 0; display: flex; flex-direction: column;
  background: #1E1F22; color: #E6E6E6;
  font-family: system-ui, 'Segoe UI', Roboto, sans-serif; font-size: 12.5px;
}
.dz-titulo {
  display: flex; align-items: center; gap: 10px; padding: 6px 10px;
  background: #2B2D31; border-bottom: 1px solid #3A3C42; font-size: 12px;
}
.dz-titulo-app { font-weight: 600; color: #FFFFFF; }
.dz-titulo-arquivo { color: #C7C9CE; }
.dz-titulo-acoes { margin-left: auto; display: flex; gap: 2px; }
.dz-menus { display: flex; gap: 2px; padding: 2px 6px; background: #2B2D31; border-bottom: 1px solid #3A3C42; }
.dz-menu-ancora { position: relative; }
.dz-menu-botao {
  padding: 4px 9px; border-radius: 4px; background: none; border: none;
  color: #E6E6E6; cursor: pointer; font-size: 12.5px;
}
.dz-menu-botao:hover, .dz-menu-botao[aria-expanded="true"] { background: #3A3C42; }
.dz-menu {
  position: absolute; z-index: 40; top: 100%; left: 0; margin-top: 2px; min-width: 230px;
  background: #2B2D31; border: 1px solid #4A4D55; border-radius: 6px; padding: 4px;
  box-shadow: 0 10px 24px rgba(0,0,0,.45);
}
.dz-menu-item {
  display: flex; justify-content: space-between; gap: 16px; width: 100%; text-align: left;
  padding: 6px 10px; border: none; border-radius: 4px; background: none; color: #E6E6E6;
  cursor: pointer; font-size: 12.5px;
}
.dz-menu-item:hover { background: #3D6FE0; color: #FFFFFF; }
.dz-menu-item[aria-checked="true"]::before { content: '✓'; margin-right: 6px; }
.dz-menu-atalho { color: #9A9DA5; }
.dz-menu-item:hover .dz-menu-atalho { color: #FFFFFF; }
.dz-menu-rotulo { padding: 6px 10px 2px; font-size: 10.5px; color: #9A9DA5; text-transform: uppercase; letter-spacing: .05em; }
.dz-menu-divisoria { height: 1px; background: #3A3C42; margin: 4px 2px; }
.dz-barra {
  display: flex; align-items: center; gap: 2px; padding: 4px 6px; flex-wrap: wrap;
  background: #2B2D31; border-bottom: 1px solid #3A3C42;
}
.dz-separador { width: 1px; align-self: stretch; background: #3A3C42; margin: 2px 6px; }
.dz-bt {
  height: 28px; min-width: 28px; padding: 0 6px; border-radius: 4px; border: none;
  background: none; color: #E6E6E6; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; gap: 5px; font-size: 12px;
}
.dz-bt:hover { background: #3A3C42; }
.dz-bt[aria-pressed="true"] { background: #3D6FE0; color: #FFFFFF; }
.dz-bt-largo { width: 100%; justify-content: flex-start; margin-top: 4px; color: #C7C9CE; }
.dz-bt:disabled { color: #6B6E76; cursor: default; background: none; }
.dz-corpo { flex: 1; min-height: 0; display: flex; }
.dz-esquerda, .dz-direita {
  background: #2B2D31; overflow-y: auto; flex: none;
}
.dz-esquerda { width: 200px; border-right: 1px solid #3A3C42; }
.dz-direita { width: 252px; border-left: 1px solid #3A3C42; }
.dz-secao { padding: 8px 10px; border-bottom: 1px solid #3A3C42; }
.dz-secao-titulo {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 10.5px; text-transform: uppercase; letter-spacing: .06em; color: #9A9DA5; margin-bottom: 6px;
}
.dz-lista-item {
  display: flex; align-items: center; gap: 6px; width: 100%; text-align: left;
  padding: 4px 6px; border-radius: 4px; border: none; background: none; color: #E6E6E6;
  cursor: pointer; font-size: 12px;
}
.dz-lista-item:hover { background: #35373C; }
.dz-lista-item[aria-current="true"], .dz-lista-item[aria-selected="true"] { background: #3D6FE0; color: #FFFFFF; }
.dz-mesa {
  flex: 1; min-width: 0; overflow: auto; background: #1A1B1E; position: relative;
  display: flex; align-items: flex-start; justify-content: center; padding: 28px;
}
.dz-mesa:focus { outline: none; }
.dz-mesa:focus-visible { box-shadow: inset 0 0 0 1px rgba(61, 111, 224, .55); }
.dz-prancha-nome { position: absolute; font-size: 11px; color: #9A9DA5; }
.dz-prancha { position: relative; box-shadow: 0 2px 12px rgba(0,0,0,.5); overflow: hidden; flex: none; }
.dz-objeto { position: absolute; }
.dz-objeto-texto { white-space: pre; }
.dz-objeto[data-selecionado="true"] { outline: 1.5px solid #3D6FE0; outline-offset: 1px; }
.dz-foto { display: flex; align-items: center; justify-content: center; }
.dz-abas { display: flex; border-bottom: 1px solid #3A3C42; }
.dz-aba {
  flex: 1; padding: 8px 4px; background: none; border: none; color: #C7C9CE; cursor: pointer;
  font-size: 12px; border-bottom: 2px solid transparent;
}
.dz-aba[aria-selected="true"] { color: #FFFFFF; border-bottom-color: #3D6FE0; }
.dz-campos { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.dz-campos-hsl { grid-template-columns: 1fr 1fr 1fr; }
.dz-campo { display: flex; flex-direction: column; gap: 3px; font-size: 11px; color: #9A9DA5; }
.dz-campo-largo { grid-column: 1 / -1; }
.dz-entrada {
  width: 100%; background: #1E1F22; color: #E6E6E6; border: 1px solid #4A4D55;
  border-radius: 4px; padding: 4px 6px; font-size: 12px; font-family: inherit;
}
.dz-entrada:focus { outline: none; border-color: #3D6FE0; }
.dz-entrada-cor { width: 30px; height: 26px; padding: 0; border: 1px solid #4A4D55; border-radius: 4px; background: none; }
.dz-linha-cor { display: flex; gap: 6px; align-items: center; }
.dz-segmentos { display: flex; gap: 2px; }
.dz-nota { font-size: 11.5px; color: #C7C9CE; line-height: 1.45; }
.dz-aviso { font-size: 11.5px; color: #F2C14E; line-height: 1.45; }
.dz-amostra { width: 22px; height: 22px; border-radius: 4px; border: 1px solid #4A4D55; flex: none; }
.dz-cor { border: 1px solid #3A3C42; border-radius: 6px; padding: 8px; display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }
.dz-cor-cabeca { display: flex; align-items: center; gap: 8px; font-weight: 600; color: #FFFFFF; }
.dz-medida { font-size: 22px; font-weight: 700; color: #FFFFFF; font-variant-numeric: tabular-nums; }
.dz-status {
  height: 24px; flex: none; display: flex; align-items: center; gap: 14px; padding: 0 10px;
  background: #2B2D31; border-top: 1px solid #3A3C42; color: #9A9DA5; font-size: 11px;
  white-space: nowrap; overflow: hidden;
}
@media (max-width: 767px) {
  .dz-corpo { flex-direction: column; overflow-y: auto; }
  .dz-mesa { flex: none; height: 56vh; padding: 16px; order: -1; }
  .dz-esquerda, .dz-direita { width: auto; border: none; border-top: 1px solid #3A3C42; overflow: visible; }
  .dz-titulo-arquivo { display: none; }
}
`;

/* ── O desenho de uma prancha ─────────────────────────────────────────────── */

export type Visao = 'normal' | 'deuteranopia' | 'cinza';

const MOTIVO = { fogueira: Flame, barracas: Tent, trilha: Mountain, piscina: Waves } as const;

const MATRIZ_SVG = [
  ...MATRIZ_DA_DEUTERANOPIA.flatMap(l => [...l, 0, 0]),
  0, 0, 0, 1, 0,
].join(' ');

/**
 * O filtro da deuteranopia, uma vez por página.
 *
 * É a mesma matriz que `comoDeuteranope` usa na conta, e o `feColorMatrix`
 * trabalha em luz linear por padrão — que é onde a matriz foi escrita.
 */
export function FiltrosDeVisao() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <filter id="dz-deuteranopia"><feColorMatrix type="matrix" values={MATRIZ_SVG} /></filter>
    </svg>
  );
}

const filtroDe = (v: Visao) =>
  v === 'deuteranopia' ? 'url(#dz-deuteranopia)' : v === 'cinza' ? 'grayscale(1)' : undefined;

export interface PropsDoDesenho {
  prancha: Prancha;
  escala?: number;
  selecionados?: string[];
  visao?: Visao;
  prova?: boolean;
  /** Apertar um objeto. Sem ele, o desenho é só de olhar. */
  aoApertar?: (id: string, e: React.PointerEvent) => void;
  /** Apertar o vazio da prancha, com o ponto em pixels da prancha. */
  aoApertarVazio?: (x: number, y: number, e: React.PointerEvent) => void;
  rotulo?: string;
}

/**
 * Uma prancha desenhada, sem estado nenhum.
 *
 * Serve ao editor e à tela de análise, que é da plataforma: a peça que a
 * pessoa julga precisa ser desenhada pelo mesmo código que desenha a que ela
 * edita, senão "o título some na foto" seria verdade numa tela e não na outra.
 */
export function DesenhoDaPrancha({
  prancha: p, escala = 1, selecionados = [], visao = 'normal', prova = false,
  aoApertar, aoApertarVazio, rotulo,
}: PropsDoDesenho) {
  const cor = (hex: string) => (prova ? provaDeImpressao(hex) : hex);
  return (
    <div
      className="dz-prancha"
      role="img"
      aria-label={rotulo ?? `Prancha ${p.nome}`}
      style={{
        position: 'relative', overflow: 'hidden', flex: 'none',
        width: p.largura * escala, height: p.altura * escala, background: cor(p.fundo), filter: filtroDe(visao),
      }}
      onPointerDown={aoApertarVazio ? e => {
        if (e.target !== e.currentTarget) return;
        const r = e.currentTarget.getBoundingClientRect();
        aoApertarVazio((e.clientX - r.left) / escala, (e.clientY - r.top) / escala, e);
      } : undefined}
    >
      {p.objetos.map(o => (
        <DesenhoDoObjeto key={o.id} o={o} escala={escala} cor={cor}
          selecionado={selecionados.includes(o.id)} aoApertar={aoApertar} />
      ))}
    </div>
  );
}

function DesenhoDoObjeto({ o, escala: k, cor, selecionado, aoApertar, alvo }: {
  o: Objeto; escala: number; cor: (h: string) => string; selecionado: boolean;
  aoApertar?: (id: string, e: React.PointerEvent) => void;
  /** Quem o clique seleciona: o próprio objeto, ou o grupo em que ele está. */
  alvo?: string;
}) {
  const quem = alvo ?? o.id;
  /* O grupo não tem tinta: desenha os filhos, e o clique em qualquer um deles
     seleciona o grupo inteiro — que é o que um grupo é. Entrar nele para mexer
     num filho se faz pela lista de camadas. */
  if (o.tipo === 'grupo') {
    return (
      <>
        {o.filhos.map(f => (
          <DesenhoDoObjeto key={f.id} o={f} escala={k} cor={cor} selecionado={selecionado}
            aoApertar={aoApertar} alvo={quem} />
        ))}
      </>
    );
  }
  /* A posição vai inline, e não só na folha: a tela de análise é da
     plataforma e desenha a peça sem a folha do editor, e uma peça desenhada
     sem posição sai com todos os blocos empilhados um embaixo do outro. */
  const caixa: React.CSSProperties = {
    position: 'absolute', left: o.x * k, top: o.y * k, width: o.largura * k, height: alturaDe(o) * k,
    cursor: aoApertar ? 'pointer' : undefined,
  };
  const comum = {
    className: `dz-objeto${o.tipo === 'texto' ? ' dz-objeto-texto' : ''}${o.tipo === 'foto' ? ' dz-foto' : ''}`,
    'data-objeto': o.id,
    'data-selecionado': selecionado ? 'true' : undefined,
    role: aoApertar ? 'button' : undefined,
    'aria-label': aoApertar ? `Camada: ${o.nome}` : undefined,
    onPointerDown: aoApertar ? (e: React.PointerEvent) => { e.stopPropagation(); aoApertar(quem, e); } : undefined,
  };
  if (o.tipo === 'caminho' || o.tipo === 'referencia') {
    /* O caminho se desenha num SVG do tamanho da caixa, com folga para o
       traço, e com as coordenadas da prancha no viewBox: os números do d são
       os mesmos que o arquivo exportado vai ter. */
    const folga = o.tipo === 'caminho' && o.traco ? o.traco.espessura : 0;
    const [vx, vy, vl, va] = [o.x - folga, o.y - folga, o.largura + 2 * folga, o.altura + 2 * folga];
    const traco = o.tipo === 'caminho' ? o.traco : null;
    return (
      <svg {...comum}
        style={{ ...caixa, left: vx * k, top: vy * k, width: vl * k, height: va * k, overflow: 'visible', pointerEvents: 'none' }}
        viewBox={`${vx} ${vy} ${Math.max(vl, 0.01)} ${Math.max(va, 0.01)}`} preserveAspectRatio="none">
        <path d={dDosContornos(o.contornos)} fillRule="evenodd"
          style={{ pointerEvents: aoApertar && o.tipo === 'caminho' ? 'visiblePainted' : 'none' }}
          onPointerDown={comum.onPointerDown}
          fill={o.tipo === 'referencia' ? '#1F2A24' : o.preenchimento ? cor(o.preenchimento) : 'none'}
          fillOpacity={o.tipo === 'referencia' ? o.opacidade : undefined}
          stroke={traco ? cor(traco.cor) : 'none'} strokeWidth={traco?.espessura}
          strokeLinecap={traco ? EXTREMIDADE_NO_SVG[traco.extremidade] as 'butt' | 'round' | 'square' : undefined}
          strokeLinejoin="round" />
      </svg>
    );
  }
  if (o.tipo === 'texto') {
    return (
      <div {...comum} style={{
        ...caixa, whiteSpace: 'pre', color: cor(o.cor), fontFamily: FAMILIAS[o.familia].pilha, fontWeight: o.peso,
        fontSize: o.corpo * k, lineHeight: `${alturaDaLinha(o) * k}px`,
        textAlign: o.alinhamento === 'esquerda' ? 'left' : o.alinhamento === 'direita' ? 'right' : 'center',
      }}>
        {linhasDoTexto(o).map((l, i) => <div key={i}>{l || ' '}</div>)}
      </div>
    );
  }
  if (o.tipo === 'foto') {
    const Icone = MOTIVO[o.motivo];
    return (
      <div {...comum} style={{
        ...caixa, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(180deg, ${cor(o.tons[0])}, ${cor(o.tons[1])})`,
      }}>
        <Icone style={{ width: 48 * k, height: 48 * k, color: 'rgba(255,255,255,.35)' }} aria-hidden="true" />
      </div>
    );
  }
  const traco = o.traco;
  return (
    <div {...comum} style={{
      ...caixa, background: cor(o.preenchimento), borderRadius: o.tipo === 'elipse' ? '50%' : 0,
      /* O traço centrado na borda, como no SVG: metade para fora, metade para
         dentro. Com border do CSS ele sairia todo para dentro, e a forma com
         traço grosso pareceria menor do que a medida diz. */
      boxShadow: traco ? `0 0 0 ${(traco.espessura / 2) * k}px ${cor(traco.cor)}, inset 0 0 0 ${(traco.espessura / 2) * k}px ${cor(traco.cor)}` : undefined,
    }} />
  );
}

/* ── A janela ─────────────────────────────────────────────────────────────── */

export interface PropsDoEditor {
  arte: Arte;
  mudar: (a: Arte) => void;
  /** A prancha à vista quando a janela abre. */
  pranchaInicial: string;
  nomeDoArquivo?: string;
  /** O que a pessoa viu: `prova:<prancha>` ou `visao:<modo>:<prancha>`. */
  aoVer?: (chave: string) => void;
  /** Um texto que o medidor de contraste mediu. */
  aoMedir?: (prancha: string, texto: string) => void;
}

type Ferramenta = 'selecionar' | 'texto' | 'retangulo';
type Aba = 'propriedades' | 'cores' | 'medidor';
type Menu = 'editar' | 'exibir' | 'plugins' | null;

const fmt = (n: number, casas = 1) => n.toLocaleString('pt-BR', { maximumFractionDigits: casas, minimumFractionDigits: casas });

export function EditorDeDesign({ arte, mudar, pranchaInicial, nomeDoArquivo = 'Arquivo do clube', aoVer, aoMedir }: PropsDoEditor) {
  const [ativa, setAtiva] = useState(pranchaInicial);
  const [selecao, setSelecao] = useState<string[]>([]);
  const [ferramenta, setFerramenta] = useState<Ferramenta>('selecionar');
  const [aba, setAba] = useState<Aba>('propriedades');
  const [medidorAberto, setMedidorAberto] = useState(false);
  const [menu, setMenu] = useState<Menu>(null);
  const [visao, setVisao] = useState<Visao>('normal');
  const [prova, setProva] = useState(false);
  const [estilo, setEstilo] = useState<EstiloCopiado | null>(null);
  const [desfazer, setDesfazer] = useState<Arte[]>([]);
  const [refazer, setRefazer] = useState<Arte[]>([]);
  const [escala, setEscala] = useState(1);
  const mesaRef = useRef<HTMLDivElement>(null);
  const arraste = useRef<{ x: number; y: number; origem: Arte; moveu: boolean } | null>(null);

  const p = umaPrancha(arte, ativa) ?? arte.pranchas[0];
  const selecionados = useMemo(
    () => selecao.map(id => p.objetos.find(o => o.id === id)).filter((o): o is Objeto => !!o),
    [selecao, p],
  );

  /* A seleção é podada contra a prancha à vista: o id de um objeto excluído
     continuaria lá, e o comando seguinte agiria sobre o que ninguém vê. É a
     regra de selecao.ts do Explorador. */
  useEffect(() => {
    setSelecao(s => s.filter(id => p.objetos.some(o => o.id === id)));
  }, [p]);

  /* A prancha cabe na mesa: a escala sai da largura dela, e o navegador sem
     ResizeObserver — o de teste — desenha em tamanho natural. */
  useEffect(() => {
    const mesa = mesaRef.current;
    if (!mesa || typeof ResizeObserver === 'undefined') return;
    const medir = () => {
      const largura = mesa.clientWidth - 56;
      const altura = mesa.clientHeight - 56;
      setEscala(Math.max(0.3, Math.min(1, largura / p.largura, altura > 200 ? altura / p.altura : 1)));
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(mesa);
    return () => ro.disconnect();
  }, [p.largura, p.altura]);

  /* Os avisos ao laboratório vão por ref: quem os passa costuma passar uma
     função nova a cada desenho, e com ela na lista de dependências o efeito
     correria a cada desenho — avisando de novo o que já avisou. */
  const avisos = useRef({ aoVer, aoMedir });
  avisos.current = { aoVer, aoMedir };

  useEffect(() => {
    if (prova) avisos.current.aoVer?.(`prova:${p.id}`);
    if (visao !== 'normal') avisos.current.aoVer?.(`visao:${visao}:${p.id}`);
  }, [prova, visao, p.id]);

  const textoSelecionado = selecionados.length === 1 && selecionados[0].tipo === 'texto' ? selecionados[0] : null;
  const idMedido = medidorAberto && aba === 'medidor' ? textoSelecionado?.id : undefined;
  useEffect(() => {
    if (idMedido) avisos.current.aoMedir?.(p.id, idMedido);
  }, [idMedido, p.id]);

  /* ── Os comandos ── */

  const aplicar = (nova: Arte, origem: Arte = arte) => {
    setDesfazer(h => [...h.slice(-49), origem]);
    setRefazer([]);
    mudar(nova);
  };
  const naPrancha = (f: (q: Prancha) => Prancha) => aplicar(mudarPrancha(arte, p.id, f));
  const nosSelecionados = (f: (o: Objeto) => Objeto) => naPrancha(q => mudarObjetos(q, selecao, f));

  const voltar = () => {
    const anterior = desfazer[desfazer.length - 1];
    if (!anterior) return;
    setDesfazer(h => h.slice(0, -1));
    setRefazer(r => [...r, arte]);
    mudar(anterior);
  };
  const avancar = () => {
    const proximo = refazer[refazer.length - 1];
    if (!proximo) return;
    setRefazer(r => r.slice(0, -1));
    setDesfazer(h => [...h, arte]);
    mudar(proximo);
  };

  const comandos = {
    alinhar: (b: Borda) => selecao.length > 0 && naPrancha(q => alinhar(q, selecao, b)),
    distribuir: (eixo: 'vertical' | 'horizontal') => selecao.length >= 3 && naPrancha(q => distribuir(q, selecao, eixo)),
    copiarEstilo: () => { if (selecionados.length === 1) setEstilo(copiarEstilo(selecionados[0])); },
    colarEstilo: () => { if (estilo && selecao.length > 0) naPrancha(q => colarEstilo(q, selecao, estilo)); },
    excluir: () => { if (selecao.length > 0) { naPrancha(q => excluir(q, selecao)); setSelecao([]); } },
    frente: () => { if (selecao.length === 1) naPrancha(q => mudarOrdem(q, selecao[0], 'frente')); },
    tras: () => { if (selecao.length === 1) naPrancha(q => mudarOrdem(q, selecao[0], 'tras')); },
    duplicarPrancha: () => {
      const nova = duplicarPrancha(arte, p.id);
      aplicar(nova);
      setAtiva(nova.pranchas[nova.pranchas.findIndex(x => x.id === p.id) + 1].id);
      setSelecao([]);
    },
    tudo: () => setSelecao(p.objetos.map(o => o.id)),
  };

  const criar = (x: number, y: number) => {
    const id = idNovo(arte, ferramenta === 'texto' ? 'texto' : 'forma');
    const novo: Objeto = ferramenta === 'texto'
      ? {
        id, nome: 'Texto', tipo: 'texto', texto: 'Texto', x: Math.round(x), y: Math.round(y), largura: 200,
        familia: 'Arial', peso: 400, corpo: 16, entrelinha: 1.4, cor: '#1F2A24', alinhamento: 'esquerda',
      }
      : { id, nome: 'Retângulo', tipo: 'retangulo', x: Math.round(x), y: Math.round(y), largura: 120, altura: 60, preenchimento: '#D9D9D9' };
    naPrancha(q => ({ ...q, objetos: [...q.objetos, novo] }));
    setSelecao([id]);
    setFerramenta('selecionar');
    setAba('propriedades');
  };

  /* ── O ponteiro na prancha ── */

  const apertar = (id: string, e: React.PointerEvent) => {
    const nova = e.shiftKey
      ? (selecao.includes(id) ? selecao.filter(s => s !== id) : [...selecao, id])
      : (selecao.includes(id) ? selecao : [id]);
    setSelecao(nova);
    if (!e.shiftKey) {
      arraste.current = { x: e.clientX, y: e.clientY, origem: arte, moveu: false };
      (e.target as Element).setPointerCapture?.(e.pointerId);
    }
    mesaRef.current?.focus({ preventScroll: true });
  };

  const mover = (e: React.PointerEvent) => {
    const a = arraste.current;
    if (!a) return;
    const dx = Math.round((e.clientX - a.x) / escala);
    const dy = Math.round((e.clientY - a.y) / escala);
    if (!a.moveu && Math.abs(dx) + Math.abs(dy) < 2) return;
    a.moveu = true;
    mudar(mudarPrancha(a.origem, p.id, q => mudarObjetos(q, selecao, o => moverObjeto(o, dx, dy))));
  };

  const soltar = () => {
    const a = arraste.current;
    arraste.current = null;
    /* O arraste inteiro é um passo só no Ctrl+Z, e não um por pixel. */
    if (a?.moveu) { setDesfazer(h => [...h.slice(-49), a.origem]); setRefazer([]); }
  };

  const teclas = (e: React.KeyboardEvent) => {
    const alvo = e.target as HTMLElement;
    if (alvo.closest('input, textarea, select')) return;
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) avancar(); else voltar(); return; }
    if (ctrl && e.key.toLowerCase() === 'y') { e.preventDefault(); avancar(); return; }
    if (ctrl && e.key.toLowerCase() === 'a') { e.preventDefault(); comandos.tudo(); return; }
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); comandos.excluir(); return; }
    if (e.key === 'Escape') { setSelecao([]); setMenu(null); return; }
    const passo = e.shiftKey ? 10 : 1;
    const seta: Record<string, [number, number]> = {
      ArrowLeft: [-passo, 0], ArrowRight: [passo, 0], ArrowUp: [0, -passo], ArrowDown: [0, passo],
    };
    if (seta[e.key] && selecao.length > 0) {
      e.preventDefault();
      const [dx, dy] = seta[e.key];
      nosSelecionados(o => moverObjeto(o, dx, dy));
    }
  };

  /* ── O que se desenha ── */

  const bt = (rotulo: string, Icone: typeof Type, acao: () => void, opcoes: { ativo?: boolean; desligado?: boolean } = {}) => (
    <button type="button" className="dz-bt" title={rotulo} aria-label={rotulo}
      aria-pressed={opcoes.ativo === undefined ? undefined : opcoes.ativo}
      disabled={opcoes.desligado} onClick={acao}>
      <Icone className="w-4 h-4" aria-hidden="true" />
    </button>
  );

  const item = (rotulo: string, acao: () => void, atalho?: string, marcado?: boolean) => (
    <button type="button" className="dz-menu-item" role={marcado === undefined ? 'menuitem' : 'menuitemcheckbox'}
      aria-checked={marcado} onClick={() => { acao(); setMenu(null); }}>
      <span>{rotulo}</span>{atalho && <span className="dz-menu-atalho">{atalho}</span>}
    </button>
  );

  const abrirMedidor = () => { setMedidorAberto(true); setAba('medidor'); };

  return (
    <div className="dz-janela" onKeyDown={teclas}>
      <FiltrosDeVisao />
      <div className="dz-titulo">
        <Layers className="w-4 h-4" aria-hidden="true" />
        <span className="dz-titulo-app">Editor de design</span>
        <span className="dz-titulo-arquivo">{nomeDoArquivo}</span>
        <div className="dz-titulo-acoes">
          {bt('Desfazer (Ctrl+Z)', Undo2, voltar, { desligado: desfazer.length === 0 })}
          {bt('Refazer (Ctrl+Y)', Redo2, avancar, { desligado: refazer.length === 0 })}
        </div>
      </div>

      <div className="dz-menus" role="menubar">
        {(['editar', 'exibir', 'plugins'] as const).map(m => (
          <div key={m} className="dz-menu-ancora">
            <button type="button" className="dz-menu-botao" aria-haspopup="menu" aria-expanded={menu === m}
              onClick={() => setMenu(menu === m ? null : m)}>
              {m === 'editar' ? 'Editar' : m === 'exibir' ? 'Exibir' : 'Plugins'}
            </button>
            {menu === m && (
              <div className="dz-menu" role="menu">
                {m === 'editar' && <>
                  {item('Desfazer', voltar, 'Ctrl+Z')}
                  {item('Refazer', avancar, 'Ctrl+Y')}
                  <div className="dz-menu-divisoria" />
                  {item('Selecionar tudo', comandos.tudo, 'Ctrl+A')}
                  {item('Copiar estilo', comandos.copiarEstilo)}
                  {item('Colar estilo', comandos.colarEstilo)}
                  {item('Excluir', comandos.excluir, 'Del')}
                  <div className="dz-menu-divisoria" />
                  {item('Duplicar prancha', comandos.duplicarPrancha)}
                </>}
                {m === 'exibir' && <>
                  <div className="dz-menu-rotulo">Simular visão</div>
                  {item('Normal', () => setVisao('normal'), undefined, visao === 'normal')}
                  {item('Deuteranopia (verde e vermelho)', () => setVisao('deuteranopia'), undefined, visao === 'deuteranopia')}
                  {item('Tons de cinza', () => setVisao('cinza'), undefined, visao === 'cinza')}
                  <div className="dz-menu-divisoria" />
                  {item('Prova de impressão (CMYK)', () => setProva(v => !v), undefined, prova)}
                </>}
                {m === 'plugins' && item('Medidor de contraste', abrirMedidor)}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="dz-barra" role="toolbar" aria-label="Ferramentas">
        {bt('Selecionar (V)', MousePointer2, () => setFerramenta('selecionar'), { ativo: ferramenta === 'selecionar' })}
        {bt('Texto (T)', Type, () => setFerramenta('texto'), { ativo: ferramenta === 'texto' })}
        {bt('Retângulo (R)', Square, () => setFerramenta('retangulo'), { ativo: ferramenta === 'retangulo' })}
        <span className="dz-separador" />
        {bt('Alinhar à esquerda', AlignStartVertical, () => comandos.alinhar('esquerda'), { desligado: selecao.length === 0 })}
        {bt('Centralizar na horizontal', AlignCenterVertical, () => comandos.alinhar('centro-h'), { desligado: selecao.length === 0 })}
        {bt('Alinhar à direita', AlignEndVertical, () => comandos.alinhar('direita'), { desligado: selecao.length === 0 })}
        {bt('Alinhar ao topo', AlignStartHorizontal, () => comandos.alinhar('topo'), { desligado: selecao.length === 0 })}
        {bt('Centralizar na vertical', AlignCenterHorizontal, () => comandos.alinhar('meio-v'), { desligado: selecao.length === 0 })}
        {bt('Alinhar à base', AlignEndHorizontal, () => comandos.alinhar('base'), { desligado: selecao.length === 0 })}
        <span className="dz-separador" />
        {bt('Distribuir verticalmente', AlignVerticalDistributeCenter, () => comandos.distribuir('vertical'), { desligado: selecao.length < 3 })}
        {bt('Distribuir horizontalmente', AlignHorizontalDistributeCenter, () => comandos.distribuir('horizontal'), { desligado: selecao.length < 3 })}
        <span className="dz-separador" />
        {bt('Copiar estilo', Copy, comandos.copiarEstilo, { desligado: selecionados.length !== 1 })}
        {bt('Colar estilo', Paintbrush, comandos.colarEstilo, { desligado: !estilo || selecao.length === 0 })}
        {bt('Trazer para frente', BringToFront, comandos.frente, { desligado: selecao.length !== 1 })}
        {bt('Enviar para trás', SendToBack, comandos.tras, { desligado: selecao.length !== 1 })}
        {bt('Excluir (Del)', Trash2, comandos.excluir, { desligado: selecao.length === 0 })}
      </div>

      <div className="dz-corpo">
        <div className="dz-esquerda">
          <div className="dz-secao">
            <div className="dz-secao-titulo"><span>Pranchas</span></div>
            {arte.pranchas.map(q => (
              <button key={q.id} type="button" className="dz-lista-item" aria-current={q.id === p.id}
                onClick={() => { setAtiva(q.id); setSelecao([]); }}>
                {q.nome}
              </button>
            ))}
            <button type="button" className="dz-bt dz-bt-largo" onClick={comandos.duplicarPrancha}>
              <Copy className="w-3.5 h-3.5" aria-hidden="true" /> Duplicar prancha
            </button>
          </div>
          <div className="dz-secao">
            <div className="dz-secao-titulo"><span>Camadas</span></div>
            {[...p.objetos].reverse().map(o => (
              <button key={o.id} type="button" className="dz-lista-item" aria-selected={selecao.includes(o.id)}
                onClick={e => setSelecao(e.shiftKey || e.ctrlKey || e.metaKey
                  ? (selecao.includes(o.id) ? selecao.filter(s => s !== o.id) : [...selecao, o.id])
                  : [o.id])}>
                {o.tipo === 'texto' ? <Type className="w-3 h-3" aria-hidden="true" /> : <Square className="w-3 h-3" aria-hidden="true" />}
                {o.nome}
              </button>
            ))}
          </div>
        </div>

        <div className="dz-mesa" ref={mesaRef} tabIndex={0} aria-label="Mesa de trabalho"
          onPointerMove={mover} onPointerUp={soltar} onPointerCancel={soltar}
          onPointerDown={e => { if (e.target === e.currentTarget) setSelecao([]); }}>
          <DesenhoDaPrancha
            prancha={p} escala={escala} selecionados={selecao} visao={visao} prova={prova}
            aoApertar={(id, e) => { if (ferramenta === 'selecionar') apertar(id, e); }}
            aoApertarVazio={(x, y) => { if (ferramenta === 'selecionar') setSelecao([]); else criar(x, y); }}
          />
        </div>

        <div className="dz-direita">
          <div className="dz-abas" role="tablist">
            <button type="button" role="tab" className="dz-aba" aria-selected={aba === 'propriedades'} onClick={() => setAba('propriedades')}>Propriedades</button>
            <button type="button" role="tab" className="dz-aba" aria-selected={aba === 'cores'} onClick={() => setAba('cores')}>Cores</button>
            {medidorAberto && (
              <button type="button" role="tab" className="dz-aba" aria-selected={aba === 'medidor'} onClick={() => setAba('medidor')}>Contraste</button>
            )}
          </div>
          {aba === 'propriedades' && (
            <Propriedades prancha={p} selecionados={selecionados}
              mudarSelecionados={nosSelecionados}
              mudarPranchaAtiva={f => naPrancha(f)} />
          )}
          {aba === 'cores' && (
            <CoresDoDocumento arte={arte} prova={prova}
              mudarPaleta={(papel, hex) => aplicar({ ...arte, paleta: { ...arte.paleta, [papel]: hex } })} />
          )}
          {aba === 'medidor' && <MedidorDeContraste prancha={p} texto={textoSelecionado} />}
        </div>
      </div>

      <div className="dz-status">
        <span>{p.nome} · {p.largura} × {p.altura} px</span>
        <span>{selecao.length === 0 ? 'Nada selecionado' : selecao.length === 1 ? '1 selecionado' : `${selecao.length} selecionados`}</span>
        <span>Zoom {Math.round(escala * 100)}%</span>
        {visao !== 'normal' && <span>Simulando: {visao === 'deuteranopia' ? 'deuteranopia' : 'tons de cinza'}</span>}
        {prova && <span>Prova de impressão</span>}
      </div>
    </div>
  );
}

/* ── O painel de propriedades ─────────────────────────────────────────────── */

/** O valor comum aos selecionados, ou nada quando eles divergem. */
function comum<T>(os: Objeto[], ler: (o: Objeto) => T | undefined): T | undefined {
  const vs = os.map(ler);
  return vs.every(v => v === vs[0]) ? vs[0] : undefined;
}

function CampoNumero({ rotulo, valor, aoMudar, passo = 1, minimo, desligado }: {
  rotulo: string; valor: number | undefined; aoMudar: (n: number) => void;
  passo?: number; minimo?: number; desligado?: boolean;
}) {
  const [rascunho, setRascunho] = useState(valor === undefined ? '' : String(valor));
  useEffect(() => { setRascunho(valor === undefined ? '' : String(valor)); }, [valor]);
  const confirmar = () => {
    const n = Number(rascunho.replace(',', '.'));
    if (rascunho.trim() === '' || !Number.isFinite(n)) { setRascunho(valor === undefined ? '' : String(valor)); return; }
    if (n !== valor) aoMudar(minimo !== undefined ? Math.max(minimo, n) : n);
  };
  return (
    <label className="dz-campo">
      {rotulo}
      <input className="dz-entrada" inputMode="decimal" value={rascunho} placeholder={valor === undefined ? 'Vários' : ''}
        disabled={desligado} aria-label={rotulo} data-passo={passo}
        onChange={e => setRascunho(e.target.value)} onBlur={confirmar}
        onKeyDown={e => { if (e.key === 'Enter') confirmar(); }} />
    </label>
  );
}

function CampoCor({ rotulo, valor, aoMudar }: { rotulo: string; valor: string | undefined; aoMudar: (hex: string) => void }) {
  const [rascunho, setRascunho] = useState(valor ?? '');
  useEffect(() => { setRascunho(valor ?? ''); }, [valor]);
  const confirmar = (v: string) => {
    const hex = v.startsWith('#') ? v : `#${v}`;
    if (ehHex(hex)) { if (hex.toUpperCase() !== valor?.toUpperCase()) aoMudar(hex.toUpperCase()); }
    else setRascunho(valor ?? '');
  };
  return (
    <label className="dz-campo dz-campo-largo">
      {rotulo}
      <span className="dz-linha-cor">
        <input type="color" className="dz-entrada-cor" value={valor && ehHex(valor) ? valor.toLowerCase() : '#000000'}
          aria-label={`${rotulo} (seletor)`} onChange={e => aoMudar(e.target.value.toUpperCase())} />
        <input className="dz-entrada" value={rascunho} aria-label={rotulo} placeholder={valor === undefined ? 'Vários' : ''}
          onChange={e => setRascunho(e.target.value)} onBlur={e => confirmar(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') confirmar((e.target as HTMLInputElement).value); }} />
      </span>
    </label>
  );
}

function Propriedades({ prancha, selecionados: os, mudarSelecionados, mudarPranchaAtiva }: {
  prancha: Prancha;
  selecionados: Objeto[];
  mudarSelecionados: (f: (o: Objeto) => Objeto) => void;
  mudarPranchaAtiva: (f: (p: Prancha) => Prancha) => void;
}) {
  if (os.length === 0) {
    return (
      <div className="dz-secao">
        <div className="dz-secao-titulo"><span>Prancha</span></div>
        <div className="dz-campos">
          <CampoCor rotulo="Fundo da prancha" valor={prancha.fundo}
            aoMudar={hex => mudarPranchaAtiva(q => ({ ...q, fundo: hex }))} />
        </div>
        <p className="dz-nota" style={{ marginTop: 8 }}>
          Clique num objeto da prancha, ou na lista de camadas, para ver as propriedades dele. Shift + clique soma à seleção.
        </p>
      </div>
    );
  }

  const ts = os.filter((o): o is Texto => o.tipo === 'texto');
  const soTextos = ts.length === os.length;
  const formas = os.filter(o => o.tipo === 'retangulo' || o.tipo === 'elipse');
  const comAltura = os.every(o => o.tipo !== 'texto');
  const set = (f: (o: Objeto) => Objeto) => mudarSelecionados(f);
  const doTexto = (f: (t: Texto) => Texto) => set(o => (o.tipo === 'texto' ? f(o) : o));

  return (
    <>
      <div className="dz-secao">
        <div className="dz-secao-titulo">
          <span>{os.length === 1 ? os[0].nome : `${os.length} objetos`}</span>
        </div>
        <div className="dz-campos">
          <CampoNumero rotulo="X" valor={comum(os, o => o.x)} aoMudar={n => set(o => posicionar(o, Math.round(n), o.y))} />
          <CampoNumero rotulo="Y" valor={comum(os, o => o.y)} aoMudar={n => set(o => posicionar(o, o.x, Math.round(n)))} />
          <CampoNumero rotulo="L" valor={comum(os, o => o.largura)} minimo={8}
            aoMudar={n => set(o => redimensionar(o, Math.round(n), undefined))} />
          <CampoNumero rotulo="A" valor={comum(os, o => alturaDe(o))} minimo={4} desligado={!comAltura}
            aoMudar={n => set(o => redimensionar(o, undefined, Math.round(n)))} />
        </div>
        {!comAltura && <p className="dz-nota" style={{ marginTop: 6 }}>A altura de um texto sai das linhas dele.</p>}
      </div>

      {soTextos && (
        <div className="dz-secao">
          <div className="dz-secao-titulo"><span>Texto</span></div>
          <div className="dz-campos">
            {ts.length === 1 && (
              <label className="dz-campo dz-campo-largo">
                Conteúdo
                <TextoEditavel valor={ts[0].texto} aoMudar={v => doTexto(t => ({ ...t, texto: v }))} />
              </label>
            )}
            <label className="dz-campo dz-campo-largo">
              Família
              <select className="dz-entrada" aria-label="Família" value={comum(ts, o => (o as Texto).familia) ?? ''}
                onChange={e => doTexto(t => ({ ...t, familia: e.target.value as Familia }))}>
                {comum(ts, o => (o as Texto).familia) === undefined && <option value="">Várias</option>}
                {LISTA_DE_FAMILIAS.map(f => (
                  <option key={f} value={f}>{f} — {NOME_DA_CLASSIFICACAO[FAMILIAS[f].classificacao].toLowerCase()}</option>
                ))}
              </select>
            </label>
            <label className="dz-campo">
              Peso
              <select className="dz-entrada" aria-label="Peso" value={String(comum(ts, o => (o as Texto).peso) ?? '')}
                onChange={e => doTexto(t => ({ ...t, peso: Number(e.target.value) as 400 | 700 }))}>
                {comum(ts, o => (o as Texto).peso) === undefined && <option value="">Vários</option>}
                <option value="400">Normal</option>
                <option value="700">Negrito</option>
              </select>
            </label>
            <CampoNumero rotulo="Corpo" valor={comum(ts, o => (o as Texto).corpo)} minimo={6}
              aoMudar={n => doTexto(t => ({ ...t, corpo: n }))} />
            <CampoNumero rotulo="Entrelinha" valor={comum(ts, o => (o as Texto).entrelinha)} passo={0.05} minimo={0.8}
              aoMudar={n => doTexto(t => ({ ...t, entrelinha: Math.round(n * 100) / 100 }))} />
            <div className="dz-campo">
              Alinhamento
              <span className="dz-segmentos">
                {(['esquerda', 'centro', 'direita'] as const).map(a => (
                  <button key={a} type="button" className="dz-bt" aria-pressed={comum(ts, o => (o as Texto).alinhamento) === a}
                    aria-label={`Texto ${a === 'centro' ? 'centrado' : `à ${a}`}`}
                    onClick={() => doTexto(t => ({ ...t, alinhamento: a }))}>
                    {a === 'esquerda' ? 'E' : a === 'centro' ? 'C' : 'D'}
                  </button>
                ))}
              </span>
            </div>
            <CampoCor rotulo="Cor do texto" valor={comum(ts, o => (o as Texto).cor)}
              aoMudar={hex => doTexto(t => ({ ...t, cor: hex }))} />
          </div>
        </div>
      )}

      {formas.length === os.length && (
        <div className="dz-secao">
          <div className="dz-secao-titulo"><span>Preenchimento</span></div>
          <div className="dz-campos">
            <CampoCor rotulo="Preenchimento" valor={comum(os, o => (o.tipo === 'retangulo' || o.tipo === 'elipse' ? o.preenchimento : undefined))}
              aoMudar={hex => set(o => (o.tipo === 'retangulo' || o.tipo === 'elipse' ? { ...o, preenchimento: hex } : o))} />
          </div>
        </div>
      )}
    </>
  );
}

/** O conteúdo do texto, gravado ao sair do campo: um passo do Ctrl+Z por edição, e não por letra. */
function TextoEditavel({ valor, aoMudar }: { valor: string; aoMudar: (v: string) => void }) {
  const [rascunho, setRascunho] = useState(valor);
  useEffect(() => { setRascunho(valor); }, [valor]);
  return (
    <textarea className="dz-entrada" rows={3} aria-label="Conteúdo do texto" value={rascunho}
      onChange={e => setRascunho(e.target.value)}
      onBlur={() => { if (rascunho !== valor) aoMudar(rascunho); }} />
  );
}

/* ── As cores do documento ────────────────────────────────────────────────── */

function CoresDoDocumento({ arte, prova, mudarPaleta }: {
  arte: Arte; prova: boolean; mudarPaleta: (papel: Papel, hex: string) => void;
}) {
  const { fundo, texto } = arte.paleta;
  return (
    <div className="dz-secao">
      <div className="dz-secao-titulo"><span>Cores do documento</span></div>
      {PAPEIS.map(papel => {
        const hex = arte.paleta[papel];
        const hsl = hex ? hslDe(hex) : null;
        const rgb = hex ? hexToRgb(hex) : null;
        const mostrada = hex ? (prova ? provaDeImpressao(hex) : hex) : 'transparent';
        const mudarHsl = (campo: 'h' | 's' | 'l', n: number) => {
          if (!hsl) return;
          const novo = { ...hsl, [campo]: campo === 'h' ? ((n % 360) + 360) % 360 : Math.max(0, Math.min(100, n)) / 100 };
          mudarPaleta(papel, hexDeHsl(novo));
        };
        return (
          <div key={papel} className="dz-cor" role="group" aria-label={`Cor ${NOME_DO_PAPEL[papel]}`}>
            <div className="dz-cor-cabeca">
              <span className="dz-amostra" style={{ background: mostrada }} aria-hidden="true" />
              {NOME_DO_PAPEL[papel]}
            </div>
            <div className="dz-campos">
              <CampoCor rotulo={`${NOME_DO_PAPEL[papel]} (hexadecimal)`} valor={hex ?? undefined} aoMudar={h => mudarPaleta(papel, h)} />
            </div>
            {hsl && (
              <div className="dz-campos dz-campos-hsl">
                <CampoNumero rotulo={`${NOME_DO_PAPEL[papel]} — H`} valor={Math.round(hsl.h)} aoMudar={n => mudarHsl('h', n)} />
                <CampoNumero rotulo={`${NOME_DO_PAPEL[papel]} — S`} valor={Math.round(hsl.s * 100)} aoMudar={n => mudarHsl('s', n)} />
                <CampoNumero rotulo={`${NOME_DO_PAPEL[papel]} — L`} valor={Math.round(hsl.l * 100)} aoMudar={n => mudarHsl('l', n)} />
              </div>
            )}
            {hex && rgb && (
              <p className="dz-nota">
                RGB {rgb.r}, {rgb.g}, {rgb.b} · CMYK {cmykDe(hex).join(', ')}
              </p>
            )}
            {hex && foraDaGama(hex) && (
              <p className="dz-aviso">Fora da gama de impressão: no papel esta cor sai mais apagada.</p>
            )}
            {papel === 'texto' && fundo && texto && (
              <p className="dz-nota">Sobre o fundo: {fmt(contrastRatio(texto, fundo), 2)}:1</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── O medidor de contraste ───────────────────────────────────────────────── */

/**
 * O plugin de contraste: relata a medida, e não julga a tarefa.
 *
 * Diz a razão, o mínimo das diretrizes para aquele tamanho de letra e se a
 * medida fica acima ou abaixo dele — que é o que um medidor de verdade
 * escreve. Nunca diz "tarefa cumprida": é a regra do painel de
 * acessibilidade da CC-ES011.
 */
function MedidorDeContraste({ prancha, texto }: { prancha: Prancha; texto: Texto | null }) {
  if (!texto) {
    return (
      <div className="dz-secao">
        <div className="dz-secao-titulo"><span>Medidor de contraste</span></div>
        <p className="dz-nota">Clique num texto da prancha para medir o contraste dele com o que está atrás.</p>
      </div>
    );
  }
  const razao = contrasteDoTexto(prancha, texto);
  const minimo = contrasteMinimo(texto);
  const fundos = fundosDoTexto(prancha, texto);
  return (
    <div className="dz-secao" aria-live="polite">
      <div className="dz-secao-titulo"><span>Medidor de contraste</span></div>
      <p className="dz-nota">{texto.nome}</p>
      <div className="dz-medida">{fmt(razao, 2)}:1</div>
      <div className="dz-linha-cor" style={{ margin: '6px 0' }}>
        <span className="dz-amostra" style={{ background: texto.cor }} aria-hidden="true" />
        <span className="dz-nota">Texto {texto.cor}</span>
      </div>
      {fundos.map(f => (
        <div key={f} className="dz-linha-cor" style={{ marginBottom: 6 }}>
          <span className="dz-amostra" style={{ background: f }} aria-hidden="true" />
          <span className="dz-nota">Atrás {f}</span>
        </div>
      ))}
      {fundos.length > 1 && <p className="dz-nota">Sobre foto vale o pior trecho: é por onde a letra passa.</p>}
      <p className="dz-nota">
        {ehTextoGrande(texto) ? 'Texto grande' : 'Texto normal'}: mínimo de {fmt(minimo, 1)}:1.
      </p>
      <p className={razao >= minimo ? 'dz-nota' : 'dz-aviso'}>
        {razao >= minimo ? 'Acima do mínimo.' : 'Abaixo do mínimo.'}
      </p>
    </div>
  );
}
