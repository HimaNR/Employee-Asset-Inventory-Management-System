import { Menu } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-20 items-center gap-3 bg-canvas/70 px-4 backdrop-blur-md sm:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink transition hover:shadow-md lg:hidden"
      >
        <Menu className="h-[18px] w-[18px]" aria-hidden="true" />
      </button>

      <h1 className="text-xl font-medium tracking-tight">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        {/* Placeholder until authentication (Phase 7) */}
        <div className="flex items-center gap-2.5 rounded-full border border-line bg-surface py-1 pr-4 pl-1 transition hover:shadow-md">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-contrast text-xs font-medium text-contrast-fg"
          >
            AD
          </span>
          <span className="hidden text-sm sm:inline">Administrator</span>
        </div>
      </div>
    </header>
  );
}
