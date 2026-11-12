import { useEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { ouvirDicionario } from '../lib/dicionarioPessoal';
import { carregarCorretor, corretorPronto, palavrasDoTexto, type Corretor } from './ortografia';
import { NOME_DO_DESTAQUE, registro } from './sublinhadoOrtografico';

/*
  A ortografia numa superfície cujo texto mora no próprio DOM.

  A folha do Word é desenhada do modelo, e por isso tem `useOrtografia`, que lê
  o documento. Há superfícies em que quem guarda o texto enquanto se digita é
  o navegador — o corpo do slide é uma lista editável, e o modelo só lê de
  volta —, e para elas o que se confere são os nós de texto. É o mesmo
  corretor, o mesmo dicionário pessoal e o mesmo vermelho; muda só de onde as
  palavras saem.

  ── O corretor do navegador sai de cena onde este entra ────────────────────
  Quem usa este gancho põe `spellCheck={false}` no elemento. Os dois juntos
  dariam dois sublinhados com dois dicionários, e o do navegador não conhece o
  dicionário pessoal: a palavra acrescentada continuaria vermelha por baixo.

  ── A sugestão entra como digitação ─────────────────────────────────────────
  Trocar a palavra por `insertText` faz o elemento receber o mesmo `input` de
  uma tecla: o modelo lê de volta pelo caminho de sempre, e o Ctrl+Z do
  navegador desfaz a troca.
*/

interface ErroNoPonto {
  palavra: string;
  no: Text;
  ini: number;
  fim: number;
  sugestoes: string[];
}

/** O nó de texto e a posição debaixo de um ponto da tela. */
function textoNoPonto(x: number, y: number): { no: Text; offset: number } | null {
  const d = document as Document & {
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
  };
  const pos = d.caretPositionFromPoint?.(x, y);
  if (pos?.offsetNode instanceof Text) return { no: pos.offsetNode, offset: pos.offset };
  const r = d.caretRangeFromPoint?.(x, y);
  if (r?.startContainer instanceof Text) return { no: r.startContainer, offset: r.startOffset };
  return null;
}

/** Troca a palavra como se tivesse sido digitada por cima. */
function trocarPalavra(el: HTMLElement, e: ErroNoPonto, por: string) {
  el.focus();
  const r = document.createRange();
  r.setStart(e.no, e.ini);
  r.setEnd(e.no, e.fim);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(r);
  /* Onde o insertText não existe (o jsdom), troca-se o nó e avisa-se o
     elemento do mesmo jeito que a tecla avisaria. */
  const foi = typeof document.execCommand === 'function' && document.execCommand('insertText', false, por);
  if (!foi) {
    e.no.replaceData(e.ini, e.fim - e.ini, por);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

export interface OrtografiaNoElemento {
  /** Para o `onContextMenu` do elemento: abre as sugestões em cima de palavra sublinhada. */
  aoMenu: (ev: React.MouseEvent) => void;
  /** O menu, quando aberto; vai para o `body` por portal. */
  menu: React.ReactNode;
}

export function useOrtografiaNoElemento(ref: RefObject<HTMLElement | null>, ativo = true): OrtografiaNoElemento {
  const [corretor, setCorretor] = useState<Corretor | null>(corretorPronto);
  const [versao, setVersao] = useState(0);
  const [aberto, setAberto] = useState<{ x: number; y: number; erro: ErroNoPonto } | null>(null);
  /* Ignorar Tudo vale para esta superfície, como no Word vale para o documento. */
  const ignoradas = useRef(new Set<string>());
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ativo || corretor || !registro()) return;
    let vivo = true;
    void carregarCorretor().then(c => { if (vivo && c) setCorretor(c); });
    return () => { vivo = false; };
  }, [ativo, corretor]);

  useEffect(() => ouvirDicionario(() => setVersao(v => v + 1)), []);

  /*
    O texto muda sem o React saber — é o navegador que escreve —, então o
    sublinhado se refaz pela observação do próprio elemento. E pela seleção:
    a palavra que termina no cursor, enquanto se digita, espera o espaço.
  */
  useEffect(() => {
    const el = ref.current;
    const reg = registro();
    if (!ativo || !el || !corretor || !reg) return;
    const destaque = reg.get(NOME_DO_DESTAQUE)!;
    let atuais: Range[] = [];
    const pintar = () => {
      atuais.forEach(r => destaque.delete(r));
      atuais = [];
      const sel = document.getSelection();
      const emFoco = el.contains(document.activeElement);
      const andar = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let n = andar.nextNode(); n; n = andar.nextNode()) {
        const no = n as Text;
        for (const p of palavrasDoTexto(no.data)) {
          if (ignoradas.current.has(p.palavra) || corretor.confere(p.palavra)) continue;
          if (emFoco && sel?.isCollapsed && sel.anchorNode === no && sel.anchorOffset === p.fim) continue;
          const r = document.createRange();
          r.setStart(no, p.ini);
          r.setEnd(no, p.fim);
          atuais.push(r);
          destaque.add(r);
        }
      }
    };
    pintar();
    const observador = new MutationObserver(pintar);
    observador.observe(el, { characterData: true, childList: true, subtree: true });
    document.addEventListener('selectionchange', pintar);
    el.addEventListener('focusout', pintar);
    return () => {
      observador.disconnect();
      document.removeEventListener('selectionchange', pintar);
      el.removeEventListener('focusout', pintar);
      atuais.forEach(r => destaque.delete(r));
    };
  }, [ativo, corretor, ref, versao]);

  useEffect(() => {
    if (!aberto) return;
    const fechar = () => setAberto(null);
    const fora = (ev: MouseEvent) => { if (!caixa.current?.contains(ev.target as Node)) fechar(); };
    const esc = (ev: KeyboardEvent) => { if (ev.key === 'Escape') fechar(); };
    document.addEventListener('mousedown', fora);
    document.addEventListener('keydown', esc);
    window.addEventListener('scroll', fechar, true);
    return () => {
      document.removeEventListener('mousedown', fora);
      document.removeEventListener('keydown', esc);
      window.removeEventListener('scroll', fechar, true);
    };
  }, [aberto]);

  const aoMenu = (ev: React.MouseEvent) => {
    const el = ref.current;
    if (!ativo || !el || !corretor) return;
    const ponto = textoNoPonto(ev.clientX, ev.clientY);
    if (!ponto || !el.contains(ponto.no)) return;
    const p = palavrasDoTexto(ponto.no.data).find(x => x.ini <= ponto.offset && ponto.offset <= x.fim);
    if (!p || ignoradas.current.has(p.palavra) || corretor.confere(p.palavra)) return;
    /* Só em cima de palavra sublinhada o menu é nosso; no resto continua o do
       sistema, que é onde moram Recortar, Copiar e Colar desta caixa. */
    ev.preventDefault();
    ev.stopPropagation();
    setAberto({
      x: ev.clientX, y: ev.clientY,
      erro: { palavra: p.palavra, no: ponto.no, ini: p.ini, fim: p.fim, sugestoes: corretor.sugere(p.palavra) },
    });
  };

  let menu: React.ReactNode = null;
  if (aberto && ref.current) {
    const { erro } = aberto;
    const el = ref.current;
    const fazer = (f: () => void) => { setAberto(null); f(); };
    const altura = 30 * (Math.max(1, erro.sugestoes.length) + 2) + 12;
    menu = createPortal(
      <div ref={caixa} className="ort-menu" role="menu" aria-label={`Ortografia: ${erro.palavra}`}
        style={{
          left: Math.max(4, Math.min(aberto.x, window.innerWidth - 230)),
          top: Math.max(4, Math.min(aberto.y, window.innerHeight - altura)),
        }}
        onMouseDown={ev => ev.preventDefault()}>
        <style>{CSS_DO_MENU}</style>
        {erro.sugestoes.length ? erro.sugestoes.map(s => (
          <button key={s} type="button" role="menuitem" className="ort-item ort-sugestao"
            onClick={() => fazer(() => trocarPalavra(el, erro, s))}>{s}</button>
        )) : (
          <button type="button" role="menuitem" className="ort-item" disabled>(Nenhuma sugestão de ortografia)</button>
        )}
        <div className="ort-linha" />
        <button type="button" role="menuitem" className="ort-item"
          onClick={() => fazer(() => { ignoradas.current.add(erro.palavra); setVersao(v => v + 1); })}>
          Ignorar Tudo
        </button>
        <button type="button" role="menuitem" className="ort-item"
          onClick={() => fazer(() => corretor?.acrescentar(erro.palavra))}>
          Adicionar ao Dicionário
        </button>
      </div>,
      document.body,
    );
  }
  return { aoMenu, menu };
}

/*
  O menu tem a cara do Office, que é a de todo programa que esta plataforma
  imita com corretor. Mora no body, fora do elemento editável — dentro, o
  navegador o trataria como texto da caixa —, e acima da moldura da plataforma,
  como o menu da folha do Word.
*/
const CSS_DO_MENU = `
  .ort-menu {
    position: fixed; z-index: 1000; background: #FFFFFF; color: #201F1E;
    border: 1px solid #C8C6C4; border-radius: 4px; box-shadow: 0 6px 18px rgba(0,0,0,.22);
    padding: 4px 0; min-width: 210px; font-size: 12.5px;
    font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
  }
  .ort-item {
    display: block; width: 100%; text-align: left; padding: 6px 14px;
    border: none; background: none; cursor: pointer; color: #201F1E; font-size: 12.5px;
  }
  .ort-item:hover:not(:disabled) { background: #EDEBE9; }
  .ort-item:disabled { color: #8A8886; cursor: default; }
  .ort-sugestao { font-weight: 700; }
  .ort-linha { height: 1px; background: #E1DFDD; margin: 4px 0; }
`;
