import { useLayoutEffect, useRef, useState } from 'react';
import type { Certification } from '../types';

// The certificate is drawn as an SVG with a fixed viewBox matching the background
// artwork's native resolution (2340 x 1655 px, which is A4 landscape to within a
// rounding error). Everything inside is positioned in those same pixel units, so
// the whole thing scales exactly — on screen at any width, and on paper at 297mm —
// without a single media query or clamp() guess.
//
// The background art already carries the fixed wording ("Este documento certifica
// que", "terminou com sucesso a Trilha.Web() da especialidade" and the specialty
// name), so only three values are overlaid here: the student's name, the token
// code and the issue date.
//
// Coordinates below are not guesses: the supplied "preenchido" mock-up was diffed
// against the blank artwork pixel by pixel to recover each field's exact ink box.

export const CERT_WIDTH = 2340;
export const CERT_HEIGHT = 1655;

// Matches the app's Helvetica-first stack. Arial is metrically identical to
// Helvetica, so the fitted size computed on one machine holds on the others.
const SANS_STACK = "'Helvetica Neue', Helvetica, Arial, 'Liberation Sans', sans-serif";

// Name band measured at y 478–598 (ascender top → baseline), x 665–1647.
const NAME_BASELINE_Y = 598;
const NAME_MAX_FONT = 150;
const NAME_MAX_WIDTH = 1800;

// Footer band measured at y 1473–1503, left edge at 119–122, right-aligned date
// ending at 2217. Both items share a single line.
const FOOTER_LEFT_X = 120;
const FOOTER_RIGHT_X = CERT_WIDTH - 120;
const FOOTER_BASELINE_Y = 1520;
const FOOTER_FONT = 32;

/**
 * Shrinks a piece of SVG text until it fits `maxWidth`, measuring the real
 * rendered glyphs rather than guessing from character counts — names vary far
 * too much in width for an average-advance estimate to be safe, and an
 * overflowing name would print straight over the artwork.
 */
function useFittedFontSize(text: string, baseSize: number, maxWidth: number) {
  const ref = useRef<SVGTextElement>(null);
  const [fontSize, setFontSize] = useState(baseSize);

  useLayoutEffect(() => {
    setFontSize(baseSize);
  }, [text, baseSize]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || fontSize !== baseSize) return;
    const width = el.getBBox().width;
    if (width > maxWidth) {
      setFontSize(Math.floor(baseSize * (maxWidth / width)));
    }
  }, [text, baseSize, maxWidth, fontSize]);

  return { ref, fontSize };
}

interface Props {
  cert: Certification;
  studentName: string;
}

export default function CertificateCanvas({ cert, studentName }: Props) {
  const specialtyCode = cert.curriculum_code === 'AP035' ? 'AP035' : 'AP034';
  const background = `${import.meta.env.BASE_URL}assets/certificates/${specialtyCode}.png`;

  const issuedDate = new Date(cert.issued_at).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const name = useFittedFontSize(studentName, NAME_MAX_FONT, NAME_MAX_WIDTH);

  return (
    <svg
      className="cert-svg"
      viewBox={`0 0 ${CERT_WIDTH} ${CERT_HEIGHT}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Certificado ${specialtyCode} de ${studentName}`}
    >
      <image href={background} x="0" y="0" width={CERT_WIDTH} height={CERT_HEIGHT} />

      <text
        ref={name.ref}
        x={CERT_WIDTH / 2}
        y={NAME_BASELINE_Y}
        textAnchor="middle"
        fontFamily={SANS_STACK}
        fontSize={name.fontSize}
        fill="#0a0a0a"
      >
        {studentName}
      </text>

      <text
        x={FOOTER_LEFT_X}
        y={FOOTER_BASELINE_Y}
        fontFamily={SANS_STACK}
        fontSize={FOOTER_FONT}
        letterSpacing="1"
        fill="#1a1a1a"
      >
        {cert.code}
      </text>

      <text
        x={FOOTER_RIGHT_X}
        y={FOOTER_BASELINE_Y}
        textAnchor="end"
        fontFamily={SANS_STACK}
        fontSize={FOOTER_FONT}
        fill="#1a1a1a"
      >
        {issuedDate}
      </text>
    </svg>
  );
}
