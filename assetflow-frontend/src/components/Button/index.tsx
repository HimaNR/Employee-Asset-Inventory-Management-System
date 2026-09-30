import type { ComponentProps } from 'react';
import Spinner from '@/components/Spinner';
import { cn } from '@/libs/cn';

type Variant = 'primary' | 'accent' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-contrast text-contrast-fg hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10',
  accent: 'bg-tag text-tag-ink hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#f6cf45]/30',
  secondary: 'border border-line bg-surface text-ink hover:-translate-y-0.5 hover:bg-surface-2 hover:shadow-md',
  danger: 'bg-red-600 text-white hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/20',
  ghost: 'text-ink-muted hover:bg-surface-2 hover:text-ink',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 gap-1.5 px-3.5 text-sm',
  md: 'h-10 gap-2 px-5 text-sm',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-medium transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {isLoading && <Spinner label="Working" />}
      {children}
    </button>
  );
}
