interface ProgressBarProps {
  percent: number;
  color?: string;
  height?: 'sm' | 'md' | 'lg';
}

const heights = { sm: 'h-1.5', md: 'h-3', lg: 'h-4' };

// Every page that shows progress (Dashboard, Specialty, lesson rows) hand-rolled its
// own two-div progress bar with the same background/rounding — this is the one
// version, defaulting to the success color once a track hits 100%.
export default function ProgressBar({ percent, color, height = 'md' }: ProgressBarProps) {
  const fill = percent >= 100 ? 'var(--color-success)' : color || 'var(--color-primary)';
  return (
    <div className={`w-full rounded-full ${heights[height]} overflow-hidden`} style={{ backgroundColor: 'var(--color-bg-hover)' }}>
      <div className={`${heights[height]} rounded-full transition-all duration-500`} style={{ width: `${Math.min(100, Math.max(0, percent))}%`, background: fill }} />
    </div>
  );
}
