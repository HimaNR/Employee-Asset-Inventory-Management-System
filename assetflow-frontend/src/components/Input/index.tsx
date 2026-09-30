import { useId, type ComponentProps } from 'react';
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
  ...rest
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={inputId}
        className={cn('text-sm font-medium text-ink', hideLabel && 'sr-only')}
      >
        {label}
        {required && <span className="ml-0.5 text-red-600">*</span>}
      </label>
      <input
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        className={cn(
          'h-10 rounded-md border bg-white px-3 text-sm text-ink placeholder:text-ink-muted/70 disabled:bg-paper disabled:text-ink-muted',
          error ? 'border-red-500' : 'border-line',
        )}
        {...rest}
      />
      {hint && !error && (
        <p id={hintId} className="text-xs text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
