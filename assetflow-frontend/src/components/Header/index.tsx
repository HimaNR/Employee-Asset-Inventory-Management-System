import Link from 'next/link';
import { LogOut, Menu } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { initials } from '@/libs/initials';
import type { UserProfile } from '@/types/auth.types';

interface HeaderProps {
  title: string;
  user: UserProfile;
  onMenuClick: () => void;
  onLogout: () => void;
}

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administrator',
  ASSET_MANAGER: 'Asset manager',
  EMPLOYEE: 'Employee',
};

export default function Header({ title, user, onMenuClick, onLogout }: HeaderProps) {
  const displayName = user.employee?.fullName ?? user.email;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 bg-canvas/70 px-4 backdrop-blur-md sm:h-20 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink transition hover:shadow-md lg:hidden"
      >
        <Menu className="h-[18px] w-[18px]" aria-hidden="true" />
      </button>

      <h1 className="min-w-0 truncate text-lg font-medium tracking-tight sm:text-xl">{title}</h1>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <ThemeToggle />
        <div className="flex items-center gap-1 rounded-full border border-line bg-surface py-1 pr-1 pl-1 transition hover:shadow-md">
          {/* Avatar + name open "My profile" */}
          <Link
            href="/profile"
            title="My profile"
            className="flex min-w-0 items-center gap-2.5 rounded-full pr-2 transition hover:bg-surface-2"
          >
            <span
              aria-hidden="true"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-contrast text-xs font-medium text-contrast-fg"
            >
              {initials(displayName)}
            </span>
            <span className="hidden min-w-0 leading-tight sm:block">
              <span className="block max-w-[11rem] truncate text-sm">{displayName}</span>
              <span className="block text-[11px] text-ink-muted">{ROLE_LABEL[user.role] ?? user.role}</span>
            </span>
            <span className="sr-only">Open my profile</span>
          </Link>
          <button
            type="button"
            onClick={onLogout}
            aria-label="Sign out"
            title="Sign out"
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition hover:bg-red-500/10 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
