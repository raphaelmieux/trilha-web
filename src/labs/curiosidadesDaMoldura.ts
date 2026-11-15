import { registrarCuriosidade } from '../lib/registroDeCuriosidades';

/*
  As duas curiosidades que acontecem em todo programa imitado: o atalho de
  teclado (Mão no Teclado) e o menu do botão direito (Botão Direito).

  ── Na moldura, e não em cada laboratório ──────────────────────────────────
  São trinta e tantos programas, cada um com os seus atalhos e os seus menus.
  Gravar dentro de cada `onKeyDown` seria lembrar disso em todo laboratório
  novo — e o que esquecesse calaria a curiosidade naquele programa, sem nada
  reprovar. A moldura já é o lugar que serve a todos: é ela que instala o
  toque longo, pelo mesmo motivo.

  ── "Atendido" é o `preventDefault` ────────────────────────────────────────
  A pergunta não é "apertou Ctrl com alguma letra", que conta tecla que não
  faz nada; é "o programa fez alguma coisa com isso". Quem atende um atalho
  ou abre o próprio menu chama `preventDefault` — senão o navegador faria o
  dele por cima. A pergunta é feita **depois** de o evento terminar de
  passar por todo mundo, e não quando ele chega aqui: um laboratório que
  ouve na própria janela pode ter se inscrito depois da moldura, e aí
  ouviria depois dela. Lido no instante seguinte, `defaultPrevented` já tem
  a resposta de todos.

  O toque longo do celular passa pelo mesmo caminho: `toqueLongo.ts`
  dispara um `contextmenu` de verdade, e o menu que o recebe o previne.
*/

const MODIFICADORES = new Set(['Control', 'Shift', 'Alt', 'Meta', 'AltGraph', 'CapsLock']);

/**
 * O nome do atalho como se escreve nas dicas da faixa: "Ctrl+Shift+N", "F5".
 * Devolve `undefined` para o que não é atalho — letra solta, seta, Enter.
 */
export function nomeDoAtalho(e: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey' | 'shiftKey'>): string | undefined {
  if (MODIFICADORES.has(e.key)) return undefined;
  const funcao = /^F([1-9]|1[0-2])$/.test(e.key);
  if (!e.ctrlKey && !e.metaKey && !e.altKey && !funcao) return undefined;
  /* A letra sai maiúscula, que é como a dica a escreve; o Shift já está no
     nome, e "Ctrl+Shift+n" e "Ctrl+Shift+N" seriam dois atalhos. */
  const tecla = e.key.length === 1 ? e.key.toUpperCase() : e.key;
  return [
    e.ctrlKey || e.metaKey ? 'Ctrl' : '',
    e.altKey ? 'Alt' : '',
    e.shiftKey ? 'Shift' : '',
    tecla,
  ].filter(Boolean).join('+');
}

/** Passa a ouvir. Devolve quem para de ouvir, para a limpeza do efeito. */
export function ouvirCuriosidadesDaMoldura(alvo: Window): () => void {
  const depois = (f: () => void) => { setTimeout(f, 0); };
  const aoTeclar = (e: KeyboardEvent) => {
    const atalho = nomeDoAtalho(e);
    if (atalho) depois(() => { if (e.defaultPrevented) registrarCuriosidade('atalho', { atalho }); });
  };
  const aoMenu = (e: MouseEvent) => {
    depois(() => { if (e.defaultPrevented) registrarCuriosidade('menu'); });
  };
  alvo.addEventListener('keydown', aoTeclar);
  alvo.addEventListener('contextmenu', aoMenu);
  return () => {
    alvo.removeEventListener('keydown', aoTeclar);
    alvo.removeEventListener('contextmenu', aoMenu);
  };
}
