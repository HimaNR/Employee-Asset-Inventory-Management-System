'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/libs/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

/**
 * Built on the native <dialog> element: the browser gives us focus trapping,
 * Escape-to-close and a backdrop for free.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  // Sync React's "open" prop with the browser's dialog (an external system)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault(); // Escape key: let React decide
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose(); // click on the backdrop
      }}
      className={cn(
        'm-auto w-[calc(100%-2rem)] rounded-lg border border-line bg-white p-0 text-ink shadow-xl backdrop:bg-ink/40',
        SIZES[size],
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
        <div>
          <h2 id={titleId} className="text-base font-semibold">
            {title}
          </h2>
          {description && (
            <p id={descriptionId} className="mt-1 text-sm text-ink-muted">
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-md p-1 text-ink-muted hover:bg-paper hover:text-ink"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {children && <div className="px-5 py-4">{children}</div>}

      {footer && (
        <div className="flex justify-end gap-2 border-t border-line bg-paper/60 px-5 py-3">
          {footer}
        </div>
      )}
    </dialog>
  );
}
