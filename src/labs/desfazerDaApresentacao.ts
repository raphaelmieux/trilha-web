import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import type { Apresentacao, Slide } from './apresentacao';

/**
 * O Ctrl+Z e o Ctrl+Y dos laboratórios de PowerPoint.
 *
 * Eles não existiam: excluir o slide errado, apagar uma caixa ou aplicar o
 * modelo errado só tinha Recomeçar como volta, que joga fora a lição inteira.
 * O botão Desfazer da barra de acesso rápido dizia que não fazia parte do
 * exercício — e Desfazer é a primeira coisa que alguém aperta quando o slide
 * fica estranho, em qualquer programa.
 *
 * ── O PDF exportado não se desfaz ───────────────────────────────────────
 * Desfaz-se o que está na apresentação — o modelo, o mestre e os slides — e
 * não o arquivo que já saiu dela. No PowerPoint, Ctrl+Z depois de exportar não
 * apaga o PDF da pasta; aqui, desfazer levaria junto o retrato que a tarefa do
 * PDF confere, e a tarefa que fechou voltaria a abrir sem ninguém ter mexido
 * no arquivo.
 *
 * ── Digitar é um passo só por trecho ────────────────────────────────────
 * Cada letra do título muda a apresentação, e um passo de desfazer por letra
 * faria o Ctrl+Z apagar o título de trás para a frente, uma letra por vez. As
 * mudanças **só de texto** que chegam em seguida se juntam num passo; excluir
 * um slide logo depois de outro continua sendo dois.
 */
type Retrato = Pick<Apresentacao, 'modelo' | 'mestre' | 'slides'>;

const LIMITE = 100;
/** Quanto tempo entre duas mudanças de texto ainda conta como o mesmo passo. */
const JUNTAR_EM_MS = 1000;

const retratoDe = (a: Apresentacao): Retrato => ({ modelo: a.modelo, mestre: a.mestre, slides: a.slides });
const mesmo = (a: Retrato, b: Retrato) => a.modelo === b.modelo && a.mestre === b.mestre && a.slides === b.slides;

/** Os campos que se digitam, e que por isso se juntam num passo. */
const DE_DIGITAR: (keyof Slide)[] = ['titulo', 'topicos', 'notas'];

/** As duas versões só diferem no que se digita, nos mesmos slides? */
function soTexto(a: Retrato, b: Retrato): boolean {
  if (a.modelo !== b.modelo || a.mestre !== b.mestre || a.slides.length !== b.slides.length) return false;
  return a.slides.every((s, i) => {
    const t = b.slides[i];
    if (s === t) return true;
    if (s.id !== t.id) return false;
    return (Object.keys(s) as (keyof Slide)[]).every(k => DE_DIGITAR.includes(k) || s[k] === t[k]);
  });
}

export interface DesfazerDaApresentacao {
  desfazer: () => void;
  refazer: () => void;
  podeDesfazer: boolean;
  podeRefazer: boolean;
}

/**
 * Observa a apresentação e guarda as versões anteriores. `aplicar` recebe a
 * transformação, para o laboratório decidir onde a apresentação mora — na
 * CC-ES011 ela fica dentro do contexto da lição, junto do que a pessoa já
 * descobriu, e descoberta não se desfaz: o que se viu, viu-se.
 */
export function useDesfazerDaApresentacao(
  ap: Apresentacao, aplicar: (f: (a: Apresentacao) => Apresentacao) => void,
): DesfazerDaApresentacao {
  const passado = useRef<Retrato[]>([]);
  const futuro = useRef<Retrato[]>([]);
  const ultimo = useRef<Retrato>(retratoDe(ap));
  const quando = useRef(0);
  const voltando = useRef(false);
  const [, setVersao] = useState(0);

  useEffect(() => {
    const novo = retratoDe(ap);
    const velho = ultimo.current;
    if (mesmo(novo, velho)) return;
    ultimo.current = novo;
    if (voltando.current) {
      voltando.current = false;
      setVersao(v => v + 1);
      return;
    }
    const agora = Date.now();
    const junta = agora - quando.current < JUNTAR_EM_MS && passado.current.length > 0 && soTexto(velho, novo);
    quando.current = soTexto(velho, novo) ? agora : 0;
    if (!junta) {
      passado.current.push(velho);
      if (passado.current.length > LIMITE) passado.current.shift();
    }
    futuro.current = [];
    setVersao(v => v + 1);
  }, [ap]);

  const voltar = useCallback((de: MutableRefObject<Retrato[]>, para: MutableRefObject<Retrato[]>) => {
    const alvo = de.current.pop();
    if (!alvo) return;
    para.current.push(ultimo.current);
    voltando.current = true;
    quando.current = 0;
    aplicar(a => ({ ...a, ...alvo }));
  }, [aplicar]);

  return {
    desfazer: () => voltar(passado, futuro),
    refazer: () => voltar(futuro, passado),
    podeDesfazer: passado.current.length > 0,
    podeRefazer: futuro.current.length > 0,
  };
}

/** O alvo da tecla escreve texto por conta própria, e tem o Ctrl+Z dele? */
export const ehCampoDeTexto = (alvo: EventTarget | null) =>
  alvo instanceof HTMLElement
  && (alvo.isContentEditable || !!alvo.closest('input, textarea, select, [contenteditable="true"], [contenteditable="plaintext-only"]'));

/**
 * Ctrl+Z, Ctrl+Y e Ctrl+Shift+Z na janela inteira, fora dos campos de texto.
 * Dentro deles o desfazer é o do próprio campo, que desfaz a digitação — é o
 * que o PowerPoint faz com o cursor numa caixa.
 */
export function useTeclasDeDesfazer(d: DesfazerDaApresentacao, ativo = true) {
  const atual = useRef(d);
  atual.current = d;
  useEffect(() => {
    if (!ativo) return;
    const aoTeclar = (ev: KeyboardEvent) => {
      if (!(ev.ctrlKey || ev.metaKey) || ev.altKey || ehCampoDeTexto(ev.target)) return;
      const t = ev.key.toLowerCase();
      if (t === 'z' && !ev.shiftKey) { ev.preventDefault(); atual.current.desfazer(); }
      else if (t === 'y' || (t === 'z' && ev.shiftKey)) { ev.preventDefault(); atual.current.refazer(); }
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [ativo]);
}
