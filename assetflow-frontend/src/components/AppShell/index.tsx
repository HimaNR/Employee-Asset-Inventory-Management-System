'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import Button from '@/components/Button';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Spinner from '@/components/Spinner';
import { canSeeItem, findNavItem, homePathFor, navSectionsFor } from '@/config/navigation.config';
import { useSession } from '@/libs/auth/use-session';
import { clearSession } from '@/libs/session-storage';
import { authService } from '@/services/auth/auth.service';

// Routes that render WITHOUT the sidebar/header frame and without a session
const PUBLIC_ROUTES = ['/login'];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isPublic = PUBLIC_ROUTES.includes(pathname);
  const navItem = findNavItem(pathname);
  const user = session?.user ?? null;
  const isAllowed = !user || !navItem || canSeeItem(user, navItem);
  const homePath = user ? homePathFor(user) : null;

  // Route protection: redirects are side effects on the router (an external system)
  useEffect(() => {
    if (isPublic) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (homePath && (!isAllowed || pathname === '/')) {
      router.replace(homePath); // e.g. employees land on "My assets"
    }
  }, [isPublic, user, isAllowed, homePath, pathname, router]);

  if (isPublic) return <>{children}</>;

  const logout = async () => {
    try {
      await authService.logout(); // ends the refresh token on the server
    } catch {
      // Even if the server is unreachable, sign out locally
    }
    clearSession();
    router.replace('/login');
  };

  // Signed in, but the role gives access to no page at all: explain instead of looping
  if (user && !homePath) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-sm rounded-3xl border border-line bg-surface p-8 text-center">
          <h1 className="text-2xl font-light">No access yet</h1>
          <p className="mt-2 text-sm text-ink-muted">
            {user.email} has no pages available. Ask an administrator to link your employee
            record or give you a different role.
          </p>
          <Button className="mt-6" onClick={() => void logout()}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  if (!user || !isAllowed) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-sm text-ink-muted">
        <Spinner /> Checking your session...
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Sidebar
        sections={navSectionsFor(user)}
        pathname={pathname}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      {/* 15rem sidebar + 0.75rem gap on each side = 16.5rem */}
      <div className="flex min-h-screen min-w-0 flex-col lg:pl-[16.5rem]">
        <Header
          title={navItem?.label ?? 'AssetFlow'}
          user={user}
          onMenuClick={() => setIsSidebarOpen(true)}
          onLogout={() => void logout()}
        />
        <main className="w-full max-w-7xl flex-1 px-4 pt-2 pb-10 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
