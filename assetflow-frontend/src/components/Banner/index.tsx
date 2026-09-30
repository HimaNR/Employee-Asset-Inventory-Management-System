import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/libs/cn';

interface BannerProps {
  tone: 'success' | 'error';
  children: ReactNode;
  onDismiss?: () => void;
}

/** Page-level message, e.g. "LAP-0013 was created." */
export default function Banner({ tone, children, onDismiss }: BannerProps) {
  const Icon = tone === 'success' ? CheckCircle2 : AlertCircle;

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm',
        tone === 'success'
          ? 'bg-emerald-500/12 text-emerald-800 dark:text-emerald-300'
          : 'bg-red-500/10 text-red-700 dark:text-red-300',
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="flex-1">{children}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss message"
          className="rounded-full p-1 transition hover:bg-black/5 dark:hover:bg-white/10"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
