'use client';

import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { getTheme, setTheme, subscribeTheme, type Theme } from '@/libs/theme';

const getServerTheme = (): Theme => 'light';

export default function ThemeToggle() {
  // Reads the theme from <html class="dark"> and re-renders when it changes
  const theme = useSyncExternalStore(subscribeTheme, getTheme, getServerTheme);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className="group flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 active:scale-95"
    >
      {/* CSS picks the icon, so it is correct even before React hydrates */}
      <Sun
        aria-hidden="true"
        className="h-[18px] w-[18px] transition-transform duration-500 group-hover:rotate-90 dark:hidden"
      />
      <Moon
        aria-hidden="true"
        className="hidden h-[18px] w-[18px] transition-transform duration-500 group-hover:-rotate-12 dark:block"
      />
    </button>
  );
}
