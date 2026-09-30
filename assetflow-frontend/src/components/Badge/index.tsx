import type { ReactNode } from 'react';
import { cn } from '@/libs/cn';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

const TONES: Record<BadgeTone, { box: string; dot: string }> = {
  neutral: { box: 'bg-ink/[0.06] text-ink-muted', dot: 'bg-ink-muted' },
  success: { box: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
  warning: { box: 'bg-amber-500/15 text-amber-800 dark:text-amber-300', dot: 'bg-amber-500' },
  danger: { box: 'bg-red-500/12 text-red-700 dark:text-red-300', dot: 'bg-red-500' },
  info: { box: 'bg-sky-500/12 text-sky-700 dark:text-sky-300', dot: 'bg-sky-500' },
};

export default function Badge({ tone = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap',
        TONES[tone].box,
        className,
      )}
    >
      <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full', TONES[tone].dot)} />
      {children}
    </span>
  );
}
