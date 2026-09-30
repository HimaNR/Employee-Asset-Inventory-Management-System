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
        'm-auto w-[calc(100%-2rem)] rounded-3xl border border-line bg-surface p-0 text-ink shadow-2xl shadow-black/20',
        'backdrop:bg-black/40 backdrop:backdrop-blur-sm',
        // Pop-in animation when the dialog opens
        'transition-[opacity,transform] duration-200 ease-out starting:open:translate-y-2 starting:open:scale-95 starting:open:opacity-0',
        SIZES[size],
      )}
    >
      <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-2">
        <div>
          <h2 id={titleId} className="text-lg font-medium">
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
          className="rounded-full p-1.5 text-ink-muted transition hover:rotate-90 hover:bg-surface-2 hover:text-ink"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {children && <div className="px-6 py-4">{children}</div>}

      {footer && (
        <div className="flex justify-end gap-2 px-6 pt-2 pb-6">
          {footer}
        </div>
      )}
    </dialog>
  );
}
