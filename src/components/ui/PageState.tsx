import type { ReactNode } from 'react';
import { AlertCircle, Inbox } from 'lucide-react';

// Every page hand-rolled its own "Carregando..." / empty-state / error block with
// slightly different markup. One shared shape for all three.
export function LoadingState({ label = 'Carregando...' }: { label?: string }) {
  return <p className="text-sm py-4" style={{ color: 'var(--color-text-dim)' }}>{label}</p>;
}

export function EmptyState({ icon, title, description }: { icon?: ReactNode; title: string; description?: string }) {
  return (
    <div className="text-center py-8">
      {icon ?? <Inbox className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-border-hover)' }} />}
      <p className="font-medium" style={{ color: 'var(--color-text-muted)' }}>{title}</p>
      {description && <p className="text-sm mt-1" style={{ color: 'var(--color-text-dim)' }}>{description}</p>}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="card p-6 text-center">
      <AlertCircle className="w-10 h-10 mx-auto mb-2" style={{ color: 'var(--color-primary)' }} />
      <p style={{ color: 'var(--color-primary)' }}>{message}</p>
    </div>
  );
}
