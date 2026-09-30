'use client';

import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { findNavItem } from '@/config/navigation.config';

// Routes that render WITHOUT the sidebar/header frame
const BARE_ROUTES = ['/login'];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (BARE_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  const current = findNavItem(pathname);

  return (
    <div className="min-h-screen">
      <Sidebar
        pathname={pathname}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      {/* 15rem sidebar + 0.75rem gap on each side = 16.5rem */}
      <div className="flex min-h-screen min-w-0 flex-col lg:pl-[16.5rem]">
        <Header
          title={current?.label ?? 'AssetFlow'}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <main className="w-full max-w-7xl flex-1 px-4 pt-2 pb-10 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
