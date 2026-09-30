import type { ComponentProps } from 'react';
import Spinner from '@/components/Spinner';
import { cn } from '@/libs/cn';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-ink text-white hover:bg-ink/90',
  secondary: 'border border-line bg-white text-ink hover:bg-paper',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-ink-muted hover:bg-paper hover:text-ink',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 gap-1.5 px-3 text-sm',
  md: 'h-10 gap-2 px-4 text-sm',
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
        'inline-flex shrink-0 items-center justify-center rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
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
