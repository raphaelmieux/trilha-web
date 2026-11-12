import { useLayoutEffect, useRef } from 'react';
import { useOrtografiaNoElemento } from '../../labs/ortografiaNoElemento';

/*
  Um campo de texto de várias linhas que passa pelo corretor da plataforma.

  É o `<textarea>` com outra pele, e existe porque o `<textarea>` não recebe o
  sublinhado: a API de destaque pinta intervalos do documento, e o texto de um
  campo não está no documento. Num `<textarea>` só o corretor do navegador
  sublinha — com o dicionário do aparelho, que não conhece o dicionário pessoal
  nem as palavras do clube —, e a palavra que a pessoa acrescentou no Word
  continuaria vermelha na redação. Sobrepor uma camada pintada ao `<textarea>`
  não serve: ela desalinha na primeira quebra de linha, que é o defeito que a
  régua do editor de código já ensinou.

  Por fora, ele se comporta como o `<textarea>` que substitui: `value` e
  `onChange` de texto puro, `onBlur`, `rows`, `placeholder`. Por dentro é um
  elemento editável em texto puro — o que se cola chega sem formatação, e o
  Ctrl+B não escreve `<b>`.

  ── O DOM é de quem digita ─────────────────────────────────────────────────
  É a decisão do corpo do slide: reescrever o elemento a cada tecla jogaria o
  cursor para o começo. O valor só é posto no DOM quando ele e o DOM
  discordam — uma mudança vinda de fora, como "Montar de novo".
*/

/** `plaintext-only` existe em todo navegador atual, mas não em todo aparelho do clube. */
const MODO_TEXTO = (() => {
  try {
    const d = document.createElement('div');
    d.contentEditable = 'plaintext-only';
    return d.contentEditable === 'plaintext-only' ? 'plaintext-only' : 'true';
  } catch {
    return 'true';
  }
})();

/**
 * O texto do elemento, com as quebras de linha que a pessoa digitou. O
 * `innerText` as dá em todo navegador, seja `\n` seja `<br>`; o jsdom não tem
 * `innerText`, e lá o `textContent` diz o mesmo porque não há `<br>`.
 */
function textoDoCampo(el: HTMLElement): string {
  const bruto = typeof el.innerText === 'string' ? el.innerText : (el.textContent ?? '');
  /* O navegador deixa um `<br>` sozinho num campo esvaziado, e o `innerText`
     o lê como uma quebra: o campo vazio diria que tem uma linha. */
  return bruto === '\n' ? '' : bruto.replace(/\u00a0/g, ' ');
}

export default function CampoComOrtografia({
  value, onChange, onBlur, rows = 4, className = '', placeholder, rotulo,
}: {
  value: string;
  onChange: (texto: string) => void;
  onBlur?: () => void;
  rows?: number;
  className?: string;
  placeholder?: string;
  rotulo?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const ortografia = useOrtografiaNoElemento(ref);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el && textoDoCampo(el) !== value) el.textContent = value;
  }, [value]);

  return (
    <>
      {ortografia.menu}
      <div
        ref={ref}
        className={`campo-com-ortografia ${className}`}
        contentEditable={MODO_TEXTO}
        suppressContentEditableWarning
        spellCheck={false}
        role="textbox"
        aria-multiline="true"
        aria-label={rotulo ?? placeholder}
        aria-placeholder={placeholder}
        data-placeholder={placeholder}
        data-vazio={value === '' ? 'sim' : undefined}
        style={{ minHeight: `calc(${rows * 1.5}em + 1.25rem)` }}
        onInput={ev => onChange(textoDoCampo(ev.currentTarget))}
        onBlur={onBlur}
        onContextMenu={ortografia.aoMenu}
        /* Onde só existe o modo rico, o texto colado chega puro e o Enter
           quebra a linha em vez de abrir um bloco que o texto não guarda. */
        onPaste={MODO_TEXTO === 'true' ? ev => {
          ev.preventDefault();
          document.execCommand('insertText', false, ev.clipboardData.getData('text/plain'));
        } : undefined}
        onKeyDown={MODO_TEXTO === 'true' ? ev => {
          if (ev.key === 'Enter') { ev.preventDefault(); document.execCommand('insertLineBreak'); }
          if ((ev.ctrlKey || ev.metaKey) && ['b', 'i', 'u'].includes(ev.key.toLowerCase())) ev.preventDefault();
        } : undefined}
      />
    </>
  );
}
