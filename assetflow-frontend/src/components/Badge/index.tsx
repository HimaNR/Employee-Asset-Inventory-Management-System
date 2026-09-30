import type { ReactNode } from 'react';
import { cn } from '@/libs/cn';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

const TONES: Record<BadgeTone, { box: string; dot: string }> = {
  neutral: { box: 'bg-zinc-100 text-zinc-700', dot: 'bg-zinc-400' },
  success: { box: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  warning: { box: 'bg-amber-50 text-amber-800', dot: 'bg-amber-500' },
  danger: { box: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
  info: { box: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
};

export default function Badge({ tone = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        TONES[tone].box,
        className,
      )}
    >
      <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full', TONES[tone].dot)} />
      {children}
    </span>
  );
}
