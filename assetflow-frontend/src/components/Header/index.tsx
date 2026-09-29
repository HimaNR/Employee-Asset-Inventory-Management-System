import { Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur sm:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="rounded-md p-1.5 text-ink-muted hover:bg-paper hover:text-ink lg:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <h1 className="text-lg font-semibold">{title}</h1>

      {/* Placeholder until authentication (Phase 7) */}
      <div className="ml-auto flex items-center gap-3">
        <span className="hidden text-sm text-ink-muted sm:inline">Administrator</span>
        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white"
        >
          AD
        </span>
      </div>
    </header>
  );
}
