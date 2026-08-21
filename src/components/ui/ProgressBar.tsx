interface ProgressBarProps {
  percent: number;
  /**
   * Trecho "a recuperar", desenhado em âmbar logo após o trecho cumprido.
   * Vem de requisitos cuja melhor tentativa ficou abaixo dos 80% exigidos.
   */
  partial?: number;
  color?: string;
  height?: 'sm' | 'md' | 'lg';
}

const heights = { sm: 'h-1.5', md: 'h-3', lg: 'h-4' };

/*
  Every page that shows progress (Dashboard, Specialty, lesson rows) hand-rolled
  its own two-div progress bar with the same background/rounding — this is the
  one version, defaulting to the success color once a track hits 100%.

  A barra passou a ter dois trechos. Com um só, uma lição em que a pessoa
  acertou 6 de 8 ficava idêntica a uma que ela nunca abriu: ambas em zero, já
  que só requisito concluído contava. Separar em vez de somar mantém legível o
  que está cumprido — que é o que o relatório atesta — sem esconder o caminho
  andado.
*/
export default function ProgressBar({ percent, partial = 0, color, height = 'md' }: ProgressBarProps) {
  const feito = Math.min(100, Math.max(0, percent));
  const recuperar = Math.min(100 - feito, Math.max(0, partial));
  const fill = feito >= 100 ? 'var(--color-success)' : color || 'var(--color-primary)';

  return (
    <div className={`w-full rounded-full ${heights[height]} overflow-hidden flex`} style={{ backgroundColor: 'var(--color-bg-hover)' }}>
      <div
        className={`${heights[height]} transition-all duration-500`}
        style={{
          width: `${feito}%`,
          background: fill,
          borderTopLeftRadius: 9999, borderBottomLeftRadius: 9999,
          /* Só arredonda a ponta direita quando nada vem depois, senão fica uma
             emenda com falha entre os dois trechos. */
          borderTopRightRadius: recuperar > 0 ? 0 : 9999,
          borderBottomRightRadius: recuperar > 0 ? 0 : 9999,
        }}
      />
      <div
        className={`${heights[height]} transition-all duration-500`}
        style={{
          width: `${recuperar}%`,
          background: 'var(--color-secondary)',
          opacity: 0.55,
          borderTopLeftRadius: feito > 0 ? 0 : 9999,
          borderBottomLeftRadius: feito > 0 ? 0 : 9999,
          borderTopRightRadius: 9999, borderBottomRightRadius: 9999,
        }}
      />
    </div>
  );
}
