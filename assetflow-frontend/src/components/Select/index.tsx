import { useId, type ComponentProps } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/libs/cn';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<ComponentProps<'select'>, 'children'> {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  hint?: string;
  error?: string;
  hideLabel?: boolean;
  /** "field" for forms, "filter" for pill-shaped filter bars */
  variant?: 'field' | 'filter';
}

export default function Select({
  label,
  options,
  placeholder,
  hint,
  error,
  hideLabel = false,
  variant = 'field',
  id,
  required,
  className,
  value,
  ...rest
}: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const hintId = hint ? `${selectId}-hint` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  // A filter pill turns dark when something is selected, so active filters stand out
  const isActiveFilter = variant === 'filter' && value !== undefined && value !== '';

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={selectId}
        className={cn('text-sm text-ink-muted', hideLabel && 'sr-only')}
      >
        {label}
        {required && <span className="ml-0.5 text-red-600">*</span>}
      </label>
      <div className="relative">
        <select
          id={selectId}
          value={value}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
          className={cn(
            'w-full cursor-pointer appearance-none text-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60',
            variant === 'field' &&
              'h-11 rounded-xl border bg-surface-2 pr-10 pl-4 text-ink hover:border-ink-muted/40 focus:bg-surface',
            variant === 'field' && (error ? 'border-red-500' : 'border-transparent'),
            variant === 'filter' &&
              'h-10 rounded-full border pr-9 pl-4 font-medium shadow-sm hover:-translate-y-0.5 hover:shadow-md',
            variant === 'filter' &&
              (isActiveFilter
                ? 'border-contrast bg-contrast text-contrast-fg'
                : 'border-line bg-surface text-ink'),
          )}
          {...rest}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2',
            isActiveFilter ? 'text-contrast-fg' : 'text-ink-muted',
          )}
        />
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
