/**
 * The brand, typed out the way it would be written in an editor.
 *
 * The name is a function call — Trilha.Web() — so watching it appear character by
 * character behind a caret says what the platform is about before any text does.
 *
 * Done entirely in CSS rather than with a timer in React. A JS typewriter would
 * re-render this component a dozen times per second on every screen it appears
 * on, including the navigation bar that is mounted for the whole session; the
 * animation below runs on the compositor and costs nothing after the first
 * paint. It also means the effect cannot desynchronise from React's render
 * cycle, and `prefers-reduced-motion` disables it with one rule instead of a
 * branch in the component.
 *
 * The width is expressed in `ch`. In a monospaced face one character is exactly
 * 1ch, so `steps(12)` lands precisely on a character boundary every time — no
 * half-drawn glyphs, and no measuring in JavaScript.
 */

const NOME = 'Trilha.Web()';

export default function BrandMark({
  tamanho = 'nav',
  className = '',
}: {
  tamanho?: 'nav' | 'hero' | 'entrada';
  className?: string;
}) {
  return (
    <span
      className={`marca marca-${tamanho} ${className}`}
      role="img"
      aria-label={NOME}
    >
      {/*
        Reserves the final width so nothing around the logo moves while it types.
        Without this the navigation items would slide left and settle, which is
        the usual tell of a typewriter effect done carelessly.
      */}
      <span className="marca-espaco" aria-hidden="true">{NOME}</span>
      <span className="marca-texto" aria-hidden="true">{NOME}</span>
    </span>
  );
}
