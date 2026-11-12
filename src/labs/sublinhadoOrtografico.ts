import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ehParagrafo, type Doc } from './documento';
import { domDoPonto } from './cursorNaFolha';
import { recolhida, type Selecao } from './edicao';
import { ouvirDicionario } from '../lib/dicionarioPessoal';
import {
  carregarCorretor, corretorPronto, errosDoParagrafo, palavraNaPosicao, type Corretor,
} from './ortografia';

/*
  O sublinhado vermelho na folha do Word, e o que o botão direito oferece em
  cima de uma palavra sublinhada.

  ── O sublinhado não mexe no HTML da folha ──────────────────────────────────
  A folha é desenhada do modelo, e o modelo não sabe de ortografia: pôr um
  <span> em volta de cada palavra errada faria o documento ter na tela o que ele
  não tem, e o cursor do navegador cairia dentro de elementos que o modelo não
  conhece. O sublinhado é a API de destaque do CSS (CSS.highlights), que pinta
  intervalos do texto sem tocar nele — e é ela que o Chromium, o Safari e o
  Firefox usam para os próprios sublinhados. Navegador sem ela fica sem o
  vermelho, e não baixa o dicionário à toa.

  ── A palavra que se está digitando não fica vermelha ───────────────────────
  O Word sublinha quando a pessoa sai da palavra, e não a cada letra: "acam" é
  erro só para quem desistiu dela. A palavra que termina exatamente onde o
  cursor está, com a folha em foco, espera o espaço.

  ── Ignorar Tudo vale para este documento; Adicionar, para a pessoa ───────
  É a diferença que o Word faz entre os dois itens. Ignorar é dizer "aqui está
  certo"; adicionar é dizer "esta palavra existe", e ela passa a existir em
  todo documento e em toda simulação — é o dicionário pessoal, de
  `lib/dicionarioPessoal.ts`, e este gancho o ouve para tirar o vermelho na
  hora em que outra tela acrescenta uma palavra.
*/

/** O nome do destaque que o CSS pinta: `::highlight(ortografia)`. */
export const NOME_DO_DESTAQUE = 'ortografia';

/** O que o CSS.highlights precisa, sem depender da versão da lib do DOM. */
interface RegistroDeDestaques {
  get(nome: string): Set<AbstractRange> | undefined;
  set(nome: string, destaque: Set<AbstractRange>): void;
}

/**
 * O registro de destaques do navegador, com o da ortografia já criado; `null`
 * onde a API não existe — e aí nenhuma superfície baixa o dicionário.
 */
export function registro(): RegistroDeDestaques | null {
  const css = (globalThis as { CSS?: { highlights?: RegistroDeDestaques } }).CSS;
  const Destaque = (globalThis as { Highlight?: new () => Set<AbstractRange> }).Highlight;
  if (!css?.highlights || !Destaque) return null;
  if (!css.highlights.get(NOME_DO_DESTAQUE)) css.highlights.set(NOME_DO_DESTAQUE, new Destaque());
  return css.highlights;
}

/** Uma palavra sublinhada sob o cursor, com o que pôr no lugar dela. */
export interface ErroNoCursor {
  palavra: string;
  alvo: Selecao;
  sugestoes: string[];
}

export interface OrtografiaDaFolha {
  /** A palavra sublinhada onde o botão direito caiu, ou `null`. */
  erroEm: (s: Selecao | null) => ErroNoCursor | null;
  ignorar: (palavra: string) => void;
  acrescentar: (palavra: string) => void;
}

export function useOrtografia(
  doc: Doc<string>,
  raiz: { readonly current: HTMLElement | null } | undefined,
  selecao: Selecao | null | undefined,
): OrtografiaDaFolha | null {
  const [corretor, setCorretor] = useState<Corretor | null>(corretorPronto);
  const [, setVersao] = useState(0);
  const ignoradas = useRef(new Set<string>());
  const ativo = !!raiz;

  useEffect(() => {
    if (!ativo || corretor || !registro()) return;
    let vivo = true;
    void carregarCorretor().then(c => { if (vivo && c) setCorretor(c); });
    return () => { vivo = false; };
  }, [ativo, corretor]);

  useEffect(() => ouvirDicionario(() => setVersao(v => v + 1)), []);

  /*
    A cada desenho, porque a folha se redesenha do modelo e os nós de texto de
    antes já não existem. A conta é barata: a resposta do dicionário fica
    guardada por palavra, e só o que mudou de palavra pergunta de novo.
  */
  useLayoutEffect(() => {
    const el = raiz?.current;
    const reg = registro();
    if (!el || !corretor || !reg) return;
    const destaque = reg.get(NOME_DO_DESTAQUE)!;
    const emFoco = document.activeElement === el;
    const intervalos: Range[] = [];
    for (const b of doc.blocos) {
      if (!ehParagrafo(b)) continue;
      for (const e of errosDoParagrafo(b, corretor, ignoradas.current)) {
        if (emFoco && selecao && recolhida(selecao) && selecao.foco.bloco === b.id && selecao.foco.offset === e.fim) continue;
        const ini = domDoPonto(el, { bloco: b.id, offset: e.ini });
        const fim = domDoPonto(el, { bloco: b.id, offset: e.fim });
        if (!ini || !fim) continue;
        const r = document.createRange();
        try {
          r.setStart(ini.no, ini.offset);
          r.setEnd(fim.no, fim.offset);
        } catch {
          continue;
        }
        intervalos.push(r);
      }
    }
    intervalos.forEach(r => destaque.add(r));
    return () => intervalos.forEach(r => destaque.delete(r));
  });

  const erroEm = useCallback((s: Selecao | null): ErroNoCursor | null => {
    if (!corretor || !s || s.ancora.bloco !== s.foco.bloco) return null;
    const b = doc.blocos.find(x => x.id === s.foco.bloco);
    if (!b || !ehParagrafo(b)) return null;
    const p = palavraNaPosicao(b, s.foco.offset);
    if (!p || ignoradas.current.has(p.palavra) || corretor.confere(p.palavra)) return null;
    /* Com texto selecionado, a seleção precisa estar dentro da palavra: o
       botão direito numa frase inteira não é pergunta sobre uma palavra. */
    if (!recolhida(s) && (Math.min(s.ancora.offset, s.foco.offset) < p.ini || Math.max(s.ancora.offset, s.foco.offset) > p.fim)) return null;
    return {
      palavra: p.palavra,
      alvo: { ancora: { bloco: b.id, offset: p.ini }, foco: { bloco: b.id, offset: p.fim } },
      sugestoes: corretor.sugere(p.palavra),
    };
  }, [corretor, doc]);

  const ignorar = useCallback((palavra: string) => {
    ignoradas.current.add(palavra);
    setVersao(v => v + 1);
  }, []);

  const acrescentar = useCallback((palavra: string) => {
    corretor?.acrescentar(palavra);
    setVersao(v => v + 1);
  }, [corretor]);

  if (!ativo) return null;
  return { erroEm, ignorar, acrescentar };
}
