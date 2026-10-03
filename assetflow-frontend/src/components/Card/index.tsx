import type { ComponentProps } from 'react';
import { cn } from '@/libs/cn';

interface CardProps extends ComponentProps<'section'> {
  /** Lifts slightly on hover (for clickable or highlighted cards) */
  interactive?: boolean;
}

export default function Card({ interactive = false, className, ...rest }: CardProps) {
  return (
    <section
      className={cn(
        'min-w-0 rounded-3xl border border-line/70 bg-surface/85 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-sm transition-all duration-300',
        interactive && 'hover:-translate-y-1 hover:shadow-xl hover:shadow-black/[0.06]',
        className,
      )}
      {...rest}
    />
  );
}
