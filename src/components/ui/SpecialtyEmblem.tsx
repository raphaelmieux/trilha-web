import { Award, CheckCircle2, Circle, Lock } from 'lucide-react';

/**
 * The specialty emblem, shown at the size it deserves.
 *
 * This is the insignia the Pathfinder sews onto their sash once the club
 * certifies the specialty — it is the point of the whole trilha. On the
 * dashboard it was a 32px image tucked inline beside the heading text, the same
 * size as the status tick next to it, so the thing being earned looked like
 * decoration and the checkbox looked like the subject.
 *
 * Here it leads the card: 88px, on its own tinted disc, with a ring that turns
 * amber once the Token.Web() is issued. The status moves to a small badge on the
 * emblem's corner, where it annotates the insignia instead of competing with it.
 */

export type EmblemStatus = 'certificado' | 'concluido' | 'em-andamento' | 'bloqueado';

const RING: Record<EmblemStatus, string> = {
  certificado: 'var(--color-secondary)',
  concluido: 'var(--color-success)',
  'em-andamento': 'var(--color-border-hover)',
  bloqueado: 'var(--color-border)',
};

export default function SpecialtyEmblem({
  code,
  status,
  size = 88,
}: {
  /*
    O código da trilha, e não um par fechado.

    Estava tipado como 'AP034' | 'AP035'. O componente só monta o caminho de um
    SVG a partir dele, então a união literal não protegia nada — apenas impedia
    que a terceira trilha usasse o emblema, e a AP041 já tem o dela em
    public/assets/specialties. Um código sem arte cai no onError abaixo.
  */
  code: string;
  status: EmblemStatus;
  size?: number;
}) {
  const ring = RING[status];
  const bloqueado = status === 'bloqueado';

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div
        className="w-full h-full rounded-full flex items-center justify-center transition"
        style={{
          // Two rings: a solid edge in the status colour and a soft halo, so the
          // emblem reads as a medal rather than a cropped picture.
          border: `2px solid ${ring}`,
          boxShadow: status === 'certificado'
            ? '0 0 0 6px rgba(245, 166, 35, 0.12), 0 4px 18px rgba(0, 0, 0, 0.35)'
            : '0 0 0 6px rgba(255, 255, 255, 0.04), 0 4px 14px rgba(0, 0, 0, 0.30)',
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
        }}
      >
        <img
          src={`${import.meta.env.BASE_URL}assets/specialties/${code}.svg`}
          alt={`Emblema da especialidade ${code}`}
          /* Sem arte, o disco e o selo de status continuam de pé; o que não
             pode aparecer é o ícone de imagem quebrada dentro da medalha. */
          onError={ev => { (ev.currentTarget as HTMLImageElement).style.display = 'none'; }}
          style={{
            width: size * 0.72,
            height: size * 0.72,
            // A locked trilha shows the emblem it leads to, dimmed — the reward
            // stays visible, which is the reason to unlock it.
            opacity: bloqueado ? 0.35 : 1,
            filter: bloqueado ? 'grayscale(1)' : 'none',
          }}
        />
      </div>

      <span
        className="absolute rounded-full flex items-center justify-center"
        style={{
          right: -2, bottom: -2, width: size * 0.32, height: size * 0.32,
          backgroundColor: 'var(--color-bg-card)',
          border: `2px solid ${ring}`,
        }}
        title={
          status === 'certificado' ? 'Token.Web() emitido'
            : status === 'concluido' ? 'Requisitos concluídos'
            : status === 'bloqueado' ? 'Trilha bloqueada'
            : 'Em andamento'
        }
      >
        {status === 'certificado' ? <Award style={{ width: '58%', height: '58%', color: 'var(--color-secondary)' }} />
          : status === 'concluido' ? <CheckCircle2 style={{ width: '58%', height: '58%', color: 'var(--color-success)' }} />
          : status === 'bloqueado' ? <Lock style={{ width: '52%', height: '52%', color: 'var(--color-text-faint)' }} />
          : <Circle style={{ width: '52%', height: '52%', color: 'var(--color-border-hover)' }} />}
      </span>
    </div>
  );
}
