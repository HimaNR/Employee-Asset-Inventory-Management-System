import { useId, type ComponentProps } from 'react';
import { cn } from '@/libs/cn';

interface TextareaProps extends ComponentProps<'textarea'> {
  label: string;
  hint?: string;
  error?: string;
}

export default function Textarea({
  label,
  hint,
  error,
  id,
  required,
  rows = 3,
  className,
  ...rest
}: TextareaProps) {
  const autoId = useId();
  const textareaId = id ?? autoId;
  const hintId = hint ? `${textareaId}-hint` : undefined;
  const errorId = error ? `${textareaId}-error` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={textareaId} className="text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-0.5 text-red-600">*</span>}
      </label>
      <textarea
        id={textareaId}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        className={cn(
          'rounded-md border bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted/70',
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
