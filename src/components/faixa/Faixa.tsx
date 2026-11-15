import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { FaixaEmpacotada, PecaPosta } from '../../lib/faixa/empacotarFaixa';
import { CLASSES } from '../../lib/nivelDaInsignia';
import {
  ButtonAureo, ButtonDePlastico, GizAureo, GizDeClasse, GizOval, GizRedondo, PatchBordado, PinCurioso, PinDeClasse,
} from './desenhoDaPeca';
import { CSS_DA_FAIXA } from './cssDaFaixa';
import type { EstadoDaPeca } from '../../lib/faixa/estadoDaFaixa';

/*
  A Faixa: o tecido que corre na horizontal, com cada peça presa no lugar que
  o empacotador deu.

  ── Rolar ─────────────────────────────────────────────────────────────────
  A Faixa é larga de propósito — doze mil pixels de desenho dizem que há muito
  a fazer —, e por isso se anda nela de todo jeito: arrastando com a mão (e
  ela segue um pouco depois de soltar), com a roda do mouse, que anda para o
  lado, com o dedo, com as setas e pela régua embaixo. Arrastar e soltar em
  cima de uma peça não a abre: quem arrastava não queria clicar.

  ── Toda peça é botão, e a Faixa inteira é uma parada de Tab ──────────────
  A peça acesa abre o que rendeu; o lugar vazio abre o que falta para
  enchê-lo — e um quadro de metas que não diz qual é a meta é só desenho.
  São setecentas peças, e setecentas paradas de Tab fariam a Faixa impossível
  de atravessar pelo teclado: o foco é itinerante. Uma peça só fica na ordem
  do Tab, as setas andam de peça em peça na ordem em que elas se leem, da
  esquerda para a direita, e Home e End vão às pontas. Enter e espaço abrem,
  como em todo botão.
*/

export default function Faixa({ faixa, estado, aoAbrir }: {
  faixa: FaixaEmpacotada;
  estado: (p: PecaPosta) => EstadoDaPeca;
  aoAbrir: (p: PecaPosta) => void;
}) {
  const rolo = useRef<HTMLDivElement>(null);
  const regua = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(1);
  const [janela, setJanela] = useState({ de: 0, largura: 0.1 });
  const [dicaVisivel, setDicaVisivel] = useState(true);
  const arrastou = useRef(false);

  /* A ordem de leitura do foco itinerante: da esquerda para a direita, e de
     cima para baixo quando duas peças dividem a coluna. */
  const ordem = useMemo(() => [...faixa.pecas].sort((a, b) => a.x - b.x || a.y - b.y).map(p => p.id), [faixa]);
  const [foco, setFoco] = useState<string | undefined>(undefined);
  const daVez = foco && ordem.includes(foco) ? foco : ordem[0];
  const andar = (de: string, tecla: string) => {
    const i = ordem.indexOf(de);
    const destino = ({
      ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: ordem.length - 1,
    } as Record<string, number>)[tecla];
    if (destino === undefined) return false;
    const id = ordem[Math.max(0, Math.min(ordem.length - 1, destino))];
    setFoco(id);
    const alvo = rolo.current?.querySelector<HTMLElement>(`[data-peca="${CSS.escape(id)}"]`);
    alvo?.focus({ preventScroll: true });
    const calmo = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    alvo?.scrollIntoView?.({ inline: 'center', block: 'nearest', behavior: calmo ? 'auto' : 'smooth' });
    return true;
  };

  /* A Faixa ocupa uns dois terços da altura da janela, entre 330 e 560 px: no
     celular deitado ela não esconde o resto da tela, e no monitor grande ela
     não fica uma tira fina. */
  useLayoutEffect(() => {
    const ajustar = () => {
      const alvo = Math.max(330, Math.min(560, window.innerHeight * 0.62));
      setEscala(alvo / faixa.altura);
    };
    ajustar();
    window.addEventListener('resize', ajustar);
    return () => window.removeEventListener('resize', ajustar);
  }, [faixa.altura]);

  const medirJanela = useCallback(() => {
    const r = rolo.current;
    if (!r) return;
    const total = r.scrollWidth || 1;
    setJanela({ de: r.scrollLeft / total, largura: Math.min(1, r.clientWidth / total) });
    if (r.scrollLeft > 30) setDicaVisivel(false);
  }, []);
  useEffect(() => { medirJanela(); }, [escala, medirJanela]);

  /* O arrasto com a mão, e a inércia depois de soltar. Só o mouse: no dedo e
     na caneta a rolagem nativa já faz isso, e melhor. */
  useEffect(() => {
    const r = rolo.current;
    if (!r) return;
    const calmo = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    let arrasto: { x: number; left: number; id: number; ultX: number; ultT: number; vel: number; preso: boolean } | null = null;
    let inercia = 0;
    const descer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      cancelAnimationFrame(inercia);
      arrasto = { x: e.clientX, left: r.scrollLeft, id: e.pointerId, ultX: e.clientX, ultT: performance.now(), vel: 0, preso: false };
      arrastou.current = false;
    };
    const mover = (e: PointerEvent) => {
      if (!arrasto || e.pointerId !== arrasto.id) return;
      const dx = e.clientX - arrasto.x;
      if (!arrasto.preso && Math.abs(dx) > 5) {
        arrasto.preso = true;
        arrastou.current = true;
        r.setPointerCapture?.(arrasto.id);
        r.classList.add('fx-arrastando');
        setDicaVisivel(false);
      }
      if (!arrasto.preso) return;
      r.scrollLeft = arrasto.left - dx;
      const agora = performance.now(), dt = Math.max(1, agora - arrasto.ultT);
      arrasto.vel = 0.8 * ((e.clientX - arrasto.ultX) / dt) + 0.2 * arrasto.vel;
      arrasto.ultX = e.clientX;
      arrasto.ultT = agora;
    };
    const soltar = (e: PointerEvent) => {
      if (!arrasto || e.pointerId !== arrasto.id) return;
      const { vel, preso } = arrasto;
      arrasto = null;
      r.classList.remove('fx-arrastando');
      if (!preso || calmo) return;
      let v = -vel * 16;
      const passo = () => { r.scrollLeft += v; v *= 0.93; if (Math.abs(v) > 0.4) inercia = requestAnimationFrame(passo); };
      inercia = requestAnimationFrame(passo);
    };
    /* O clique que fecha um arrasto não abre a peça em que a mão parou. */
    const engolir = (e: MouseEvent) => {
      if (arrastou.current) { e.stopPropagation(); e.preventDefault(); arrastou.current = false; }
    };
    /* A roda anda para o lado — mas só enquanto há para onde andar: no fim da
       Faixa, ela volta a rolar a página, senão a pessoa ficaria presa. */
    const roda = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const max = r.scrollWidth - r.clientWidth;
      const indo = e.deltaY > 0 ? r.scrollLeft < max - 1 : r.scrollLeft > 0;
      if (!indo) return;
      e.preventDefault();
      r.scrollLeft += e.deltaY;
      setDicaVisivel(false);
    };
    r.addEventListener('pointerdown', descer);
    window.addEventListener('pointermove', mover);
    window.addEventListener('pointerup', soltar);
    window.addEventListener('pointercancel', soltar);
    r.addEventListener('click', engolir, true);
    r.addEventListener('wheel', roda, { passive: false });
    return () => {
      cancelAnimationFrame(inercia);
      r.removeEventListener('pointerdown', descer);
      window.removeEventListener('pointermove', mover);
      window.removeEventListener('pointerup', soltar);
      window.removeEventListener('pointercancel', soltar);
      r.removeEventListener('click', engolir, true);
      r.removeEventListener('wheel', roda);
    };
  }, []);

  const teclar = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const r = rolo.current;
    if (!r || e.target !== r) return;
    const calmo = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const comportamento: ScrollBehavior = calmo ? 'auto' : 'smooth';
    const passo = ({ ArrowRight: 220, ArrowLeft: -220, PageDown: r.clientWidth * 0.8, PageUp: -r.clientWidth * 0.8 } as Record<string, number>)[e.key];
    if (e.key === 'Home') r.scrollTo({ left: 0, behavior: comportamento });
    else if (e.key === 'End') r.scrollTo({ left: r.scrollWidth, behavior: comportamento });
    else if (passo) r.scrollBy({ left: passo, behavior: comportamento });
    else return;
    e.preventDefault();
  };

  /* A régua: um trecho por grupo, e cada um começa onde o anterior termina —
     os grupos se encaixam no tecido, e na régua eles não podem se sobrepor. */
  const trechosDaRegua = useMemo(() => {
    let inicio = 0;
    return faixa.trechos.map((t, i) => {
      const proximo = faixa.trechos[i + 1];
      const fim = proximo ? (t.ate + proximo.de) / 2 : faixa.largura;
      const r = { ...t, de: inicio, ate: fim };
      inicio = fim;
      return r;
    });
  }, [faixa]);
  const zonas = useMemo(() => {
    const lista: { zona: string; de: number; ate: number }[] = [];
    for (const t of trechosDaRegua) {
      const z = lista[lista.length - 1];
      if (z && z.zona === t.zona) z.ate = t.ate; else lista.push({ zona: t.zona, de: t.de, ate: t.ate });
    }
    return lista;
  }, [trechosDaRegua]);
  const pct = (x: number) => `${(x / faixa.largura) * 100}%`;

  const irPara = (clientX: number) => {
    const r = rolo.current, rg = regua.current;
    if (!r || !rg) return;
    const caixa = rg.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (clientX - caixa.left) / Math.max(1, caixa.width)));
    r.scrollLeft = f * r.scrollWidth - r.clientWidth / 2;
    setDicaVisivel(false);
  };
  const naRegua = useRef(false);

  /* O nome de um trecho só aparece onde cabe inteiro; o resto fica no title.
     Cortado ao meio ("SCADA", "OSIDA"), ele não diz nada e ainda encosta no
     vizinho — no celular, a régua inteira virava uma linha de pedaços. */
  useLayoutEffect(() => {
    const rg = regua.current;
    if (!rg) return;
    const medir = () => rg.querySelectorAll<HTMLElement>('.fx-trecho > span').forEach(s => {
      s.style.visibility = s.scrollWidth <= s.clientWidth + 1 ? 'visible' : 'hidden';
    });
    medir();
    void document.fonts?.ready.then(medir);
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, [trechosDaRegua]);

  return (
    <div className="fx">
      <style>{CSS_DA_FAIXA}</style>
      <p className={`fx-dica${dicaVisivel ? '' : ' fx-some'}`} aria-hidden={!dicaVisivel}>
        Arraste a faixa para o lado, ou use a régua embaixo dela
      </p>
      <div
        ref={rolo}
        className="fx-rolo"
        tabIndex={0}
        role="region"
        aria-label="Faixa de conquistas. Use as setas para andar."
        onScroll={medirJanela}
        onKeyDown={teclar}
      >
        <div className="fx-tecido" style={{ width: faixa.largura * escala, height: faixa.altura * escala }}>
          <div className="fx-pano" style={{ width: faixa.largura, height: faixa.altura, transform: `scale(${escala})` }}>
            {faixa.pecas.map(p => (
              <Peca
                key={p.id} p={p} estado={estado(p)} daVez={p.id === daVez}
                aoAbrir={x => { setFoco(x.id); aoAbrir(x); }}
                aoTeclar={e => { if (andar(p.id, e.key)) e.preventDefault(); }}
              />
            ))}
          </div>
        </div>
      </div>
      <div
        ref={regua}
        className="fx-regua"
        tabIndex={0}
        role="slider"
        aria-label="Posição na faixa"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round((janela.de / Math.max(0.0001, 1 - janela.largura)) * 100)}
        onPointerDown={e => { naRegua.current = true; e.currentTarget.setPointerCapture?.(e.pointerId); irPara(e.clientX); }}
        onPointerMove={e => { if (naRegua.current) irPara(e.clientX); }}
        onPointerUp={() => { naRegua.current = false; }}
        onKeyDown={e => {
          const d = ({ ArrowRight: 1, ArrowLeft: -1 } as Record<string, number>)[e.key];
          if (!d || !rolo.current) return;
          e.preventDefault();
          rolo.current.scrollBy({ left: d * rolo.current.clientWidth * 0.5 });
        }}
      >
        {zonas.map(z => (
          <span key={`z-${z.zona}-${z.de}`} className={`fx-trecho fx-zona fx-zona-${z.zona}`} style={{ left: pct(z.de), width: pct(z.ate - z.de) }}>
            <span>{NOME_DA_ZONA[z.zona] ?? z.zona}</span>
          </span>
        ))}
        {trechosDaRegua.map(t => (
          <span key={`f-${t.nome}`} className={`fx-trecho fx-familia fx-zona-${t.zona}`} title={t.nome} style={{ left: pct(t.de), width: pct(t.ate - t.de) }}>
            <span>{t.nome}</span>
          </span>
        ))}
        <span className="fx-janela" style={{ left: `${janela.de * 100}%`, width: `${janela.largura * 100}%` }} />
      </div>
    </div>
  );
}

const NOME_DA_ZONA: Record<string, string> = {
  trilhas: 'Trilhas', escadas: 'Escadas', curiosidades: 'Curiosidades', veredas: 'Veredas', antiga: 'Edição antiga',
};

/** O que o leitor de tela diz de cada peça, cheia ou vazia. */
function rotuloDaPeca(p: PecaPosta, estado: EstadoDaPeca): string {
  const classe = p.classe ? ` (${CLASSES[p.classe].nome})` : '';
  if (estado === 'vazia' && p.dica) return `Segredo ainda não achado. Dica: ${p.dica}`;
  if (estado === 'vazia') return `${p.nome}${classe}${p.emBreve ? ', em breve' : ''} — ainda não conquistada. Ver o que falta`;
  if (estado === 'revogada') return `${p.nome} — Token.Web() revogado`;
  if (p.token) return `${p.nome} — concluída. Ver o Token.Web()`;
  return `${p.nome}${classe} — conquistada`;
}

function Peca({ p, estado, daVez, aoAbrir, aoTeclar }: {
  p: PecaPosta;
  estado: EstadoDaPeca;
  daVez: boolean;
  aoAbrir: (p: PecaPosta) => void;
  aoTeclar: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}) {
  const cheia = estado !== 'vazia';
  /* O segredo vazio ocupa o lugar de um pin pequeno de giz com "?", qualquer
     que seja o tamanho da peça que ele vai virar — o ME006 é um patch, mas a
     forma dele seria metade da resposta. */
  const segredoVazio = !cheia && !!p.dica;
  const [w, h] = segredoVazio ? [58, 58] : [p.w, p.h];
  const estilo: CSSProperties = {
    left: p.x - w / 2, top: p.y - h / 2, width: w, height: h,
    ['--giro' as string]: `${p.giro}deg`,
  };
  const classes = ['fx-peca', `fx-${p.material}`, `fx-${estado}`, p.material === 'pin' && p.icone === 'lab' ? 'fx-satelite' : ''].join(' ');
  const rotulo = rotuloDaPeca(p, estado);

  const desenho = (() => {
    if (segredoVazio) return <GizRedondo interrogacao />;
    switch (p.material) {
      case 'patch': return cheia ? <PatchBordado arte={p.arte!} /> : <GizOval rotulo={p.rotulo} emBreve={p.emBreve} />;
      case 'button': return cheia ? <ButtonDePlastico arte={p.arte!} /> : <GizRedondo rotulo={p.rotulo} emBreve={p.emBreve} />;
      case 'button-aureo': return cheia ? <ButtonAureo arte={p.arte!} nome={p.nome} /> : <GizAureo rotulo={p.nome} />;
      case 'pin': return cheia ? <PinDeClasse classe={p.classe!} icone={p.icone ?? 'award'} /> : <GizDeClasse classe={p.classe!} />;
      case 'pin-curioso': return cheia ? <PinCurioso arte={p.arte!} icone={p.icone} /> : <GizRedondo />;
    }
  })();

  return (
    <button
      type="button" className={classes} style={estilo} data-peca={p.id}
      aria-label={rotulo} title={cheia ? undefined : rotulo} tabIndex={daVez ? 0 : -1}
      onClick={() => aoAbrir(p)} onKeyDown={aoTeclar}
    >
      {desenho}
    </button>
  );
}
