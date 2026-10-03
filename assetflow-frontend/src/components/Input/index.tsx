'use client';

import { useId, useState, type ComponentProps } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/libs/cn';

interface InputProps extends ComponentProps<'input'> {
  label: string;
  hint?: string;
  error?: string;
  hideLabel?: boolean;
}

export default function Input({
  label,
  hint,
  error,
  hideLabel = false,
  id,
  required,
  className,
  type,
  ...rest
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  // Password fields get a show / hide button
  const isPassword = type === 'password';
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={inputId}
        className={cn('text-sm text-ink-muted', hideLabel && 'sr-only')}
      >
        {label}
        {required && <span className="ml-0.5 text-red-600">*</span>}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={isPassword && isVisible ? 'text' : type}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
          className={cn(
            'h-11 w-full rounded-xl border bg-surface-2 px-4 text-sm text-ink transition-all duration-200 placeholder:text-ink-muted/70 hover:border-ink-muted/40 focus:bg-surface disabled:opacity-60',
            error ? 'border-red-500' : 'border-transparent',
            isPassword && 'pr-12',
          )}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setIsVisible((visible) => !visible)}
            aria-label={isVisible ? 'Hide password' : 'Show password'}
            aria-pressed={isVisible}
            className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface hover:text-ink"
          >
            {isVisible ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {hint && !error && (
        <p id={hintId} className="text-xs text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
