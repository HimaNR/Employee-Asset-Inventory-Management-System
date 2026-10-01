'use client';

import { useEffect, useId, useState, type KeyboardEvent } from 'react';
import { Check, Search, X } from 'lucide-react';
import Spinner from '@/components/Spinner';
import { isAbortError } from '@/libs/api/api-error';
import { cn } from '@/libs/cn';
import { useDebouncedValue } from '@/libs/use-debounced-value';

export interface SearchOption {
  value: string;
  label: string;
  description?: string;
}

interface SearchSelectProps {
  label: string;
  value: SearchOption | null;
  onChange: (option: SearchOption | null) => void;
  /**
   * Loads options for the typed text. Wrap it in useCallback in the parent:
   * a new function on every render would reload the list every render.
   */
  loadOptions: (search: string, signal: AbortSignal) => Promise<SearchOption[]>;
  placeholder?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  emptyMessage?: string;
}

/**
 * Searchable dropdown (ARIA combobox pattern).
 * Keyboard: Arrow up/down to move, Enter to pick, Escape to close.
 */
export default function SearchSelect({
  label,
  value,
  onChange,
  loadOptions,
  placeholder = 'Type to search...',
  hint,
  error,
  required,
  disabled,
  emptyMessage = 'No matches.',
}: SearchSelectProps) {
  const inputId = useId();
  const listId = useId();
  const hintId = useId();
  const errorId = useId();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<SearchOption[]>([]);
  const [highlighted, setHighlighted] = useState(0);
  const [loadedQuery, setLoadedQuery] = useState<string | null>(null);
  const debouncedQuery = useDebouncedValue(query, 250);
  const isLoading = isOpen && loadedQuery !== debouncedQuery;

  // Load options while the list is open (setState only inside the callbacks)
  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    loadOptions(debouncedQuery, controller.signal)
      .then((result) => {
        setOptions(result);
        setHighlighted(0);
        setLoadedQuery(debouncedQuery);
      })
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        setOptions([]);
        setLoadedQuery(debouncedQuery);
      });
    return () => controller.abort();
  }, [isOpen, debouncedQuery, loadOptions]);

  const open = () => {
    if (disabled) return;
    setQuery('');
    setIsOpen(true);
  };

  const pick = (option: SearchOption) => {
    onChange(option);
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!isOpen) return open();
      setHighlighted((i) => Math.min(i + 1, options.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter' && isOpen) {
      event.preventDefault(); // never submit the form from here
      const option = options[highlighted];
      if (option) pick(option);
    } else if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      event.stopPropagation(); // close the list, not the surrounding modal
      setIsOpen(false);
    }
  };

  const activeOptionId = isOpen && options[highlighted] ? `${listId}-${highlighted}` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm text-ink-muted">
        {label}
        {required && <span className="ml-0.5 text-red-600">*</span>}
      </label>

      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-ink-muted"
        />
        <input
          id={inputId}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeOptionId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          autoComplete="off"
          disabled={disabled}
          value={isOpen ? query : (value?.label ?? '')}
          placeholder={value && isOpen ? value.label : placeholder}
          onFocus={open}
          onBlur={() => setIsOpen(false)}
          onChange={(event) => {
            setQuery(event.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            'h-11 w-full rounded-xl border bg-surface-2 pr-10 pl-11 text-sm text-ink transition-all duration-200 placeholder:text-ink-muted/70 hover:border-ink-muted/40 focus:bg-surface disabled:opacity-60',
            error ? 'border-red-500' : 'border-transparent',
          )}
        />
        {value && !disabled && (
          <button
            type="button"
            aria-label={`Clear ${label}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onChange(null)}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-ink-muted transition hover:bg-surface-2 hover:text-ink"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}

        {isOpen && (
          <ul
            id={listId}
            role="listbox"
            aria-label={label}
            // Keep focus in the input while clicking an option
            onMouseDown={(event) => event.preventDefault()}
            className="absolute top-full right-0 left-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-line bg-surface p-1.5 shadow-xl shadow-black/10"
          >
            {isLoading && options.length === 0 && (
              <li className="flex items-center gap-2 px-3 py-2.5 text-sm text-ink-muted">
                <Spinner /> Searching...
              </li>
            )}
            {!isLoading && options.length === 0 && (
              <li className="px-3 py-2.5 text-sm text-ink-muted">{emptyMessage}</li>
            )}
            {options.map((option, index) => {
              const isSelected = option.value === value?.value;
              return (
                <li
                  key={option.value}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => pick(option)}
                  onMouseEnter={() => setHighlighted(index)}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                    index === highlighted && 'bg-tag/20',
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{option.label}</p>
                    {option.description && (
                      <p className="truncate text-xs text-ink-muted">{option.description}</p>
                    )}
                  </div>
                  {isSelected && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
                </li>
              );
            })}
          </ul>
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
