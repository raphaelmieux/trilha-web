type Tone = 'success' | 'error' | 'warning' | 'neutral' | 'secondary' | 'tertiary';

const toneStyles: Record<Tone, { bg: string; fg: string }> = {
  success: { bg: 'var(--color-success-a20)', fg: 'var(--color-success)' },
  error: { bg: 'var(--color-error-a20)', fg: 'var(--color-error)' },
  warning: { bg: 'var(--color-warning-a10)', fg: 'var(--color-warning)' },
  neutral: { bg: 'var(--color-bg-hover)', fg: 'var(--color-text-muted)' },
  secondary: { bg: 'var(--color-secondary-a10)', fg: 'var(--color-secondary)' },
  tertiary: { bg: 'var(--color-tertiary-a10)', fg: 'var(--color-tertiary-light)' },
};

// The active/revoked, admin-yes/no, tier chips across Admin/Dashboard/Verify all
// used the same "pill with a background/foreground pair" shape with one-off inline
// styles per call site. One component, one palette of tones.
export default function StatusBadge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const { bg, fg } = toneStyles[tone];
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: bg, color: fg }}>
      {children}
    </span>
  );
}
