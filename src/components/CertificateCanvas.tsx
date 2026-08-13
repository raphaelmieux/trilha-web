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
// name), so only four values are overlaid here: the student's name, the token
// code, the verification URL and the issue date.
//
// Coordinates below are not guesses: the supplied "preenchido" mock-up was diffed
// against the blank artwork pixel by pixel to recover each field's exact ink box.

export const CERT_WIDTH = 2340;
export const CERT_HEIGHT = 1655;

// Name band measured at y 478–598 (ascender top → baseline), x 665–1647.
const NAME_BASELINE_Y = 598;
const NAME_MAX_FONT = 166;
const NAME_MAX_WIDTH = 1800;

// Footer bands measured at y 1473–1503 and 1513–1543, left edge at 119–122,
// right-aligned date ending at 2217.
const FOOTER_LEFT_X = 120;
const FOOTER_RIGHT_X = CERT_WIDTH - 120;
const HASH_BASELINE_Y = 1496;
const VERIFY_BASELINE_Y = 1536;
const FOOTER_FONT = 32;
// The date sits on the same line as the verification URL, so the URL must stop
// before it. Worst realistic date ("30 de setembro de 2026") is ~340px wide.
const VERIFY_MAX_WIDTH = 1660;

/**
 * Shrinks a piece of SVG text until it fits `maxWidth`, measuring the real
 * rendered glyphs rather than guessing from character counts — names and host
 * names vary far too much in width for an average-advance estimate to be safe,
 * and an overflowing name would print straight over the artwork.
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
  verifyUrl: string;
}

export default function CertificateCanvas({ cert, studentName, verifyUrl }: Props) {
  const specialtyCode = cert.curriculum_code === 'AP035' ? 'AP035' : 'AP034';
  const background = `${import.meta.env.BASE_URL}assets/certificates/${specialtyCode}.png`;

  const issuedDate = new Date(cert.issued_at).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const verifyLine = `verifique a validade em ${verifyUrl}`;
  const name = useFittedFontSize(studentName, NAME_MAX_FONT, NAME_MAX_WIDTH);
  const verify = useFittedFontSize(verifyLine, FOOTER_FONT, VERIFY_MAX_WIDTH);

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
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize={name.fontSize}
        fill="#0a0a0a"
      >
        {studentName}
      </text>

      <text
        x={FOOTER_LEFT_X}
        y={HASH_BASELINE_Y}
        fontFamily="'Courier New', Courier, monospace"
        fontSize={FOOTER_FONT}
        fill="#1a1a1a"
      >
        {cert.code}
      </text>

      <text
        ref={verify.ref}
        x={FOOTER_LEFT_X}
        y={VERIFY_BASELINE_Y}
        fontFamily="'Courier New', Courier, monospace"
        fontSize={verify.fontSize}
        fill="#1a1a1a"
      >
        {verifyLine}
      </text>

      <text
        x={FOOTER_RIGHT_X}
        y={VERIFY_BASELINE_Y}
        textAnchor="end"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize={FOOTER_FONT}
        fontWeight="500"
        fill="#1a1a1a"
      >
        {issuedDate}
      </text>
    </svg>
  );
}

/**
 * The printed URL is meant to be readable and retypable, so it deliberately drops
 * the scheme and the `?code=` query string: the token code is already printed on
 * the line above and the verification page asks for it. Keeping the full query
 * here would push the line into the issue date.
 */
export function buildVerifyUrl(): string {
  const base = `${window.location.host}${import.meta.env.BASE_URL}`.replace(/\/+$/, '');
  return `${base}/#/verificar`;
}
