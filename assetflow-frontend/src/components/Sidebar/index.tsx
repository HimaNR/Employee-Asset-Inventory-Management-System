import Link from 'next/link';
import { X } from 'lucide-react';
import { NAV_SECTIONS, isNavItemActive } from '@/config/navigation.config';
import { cn } from '@/libs/cn';

interface SidebarProps {
  pathname: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ pathname, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Dark overlay behind the drawer on mobile */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        aria-label="Main navigation"
        className={cn(
          'fixed z-40 flex w-60 flex-col bg-sidebar text-sidebar-fg shadow-2xl shadow-black/20 transition-transform duration-300 ease-out',
          'inset-y-0 left-0 rounded-r-3xl',
          'lg:inset-y-3 lg:left-3 lg:translate-x-0 lg:rounded-3xl',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-20 items-center justify-between px-5">
          <Link href="/dashboard" onClick={onClose} className="group flex items-center gap-3 rounded-full">
            <BrandTag />
            <span className="text-xl font-medium tracking-tight">AssetFlow</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-full p-1.5 text-sidebar-fg/60 hover:bg-white/10 hover:text-sidebar-fg lg:hidden"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4 [scrollbar-color:rgba(255,255,255,0.15)_transparent] [scrollbar-width:thin]">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="mb-5">
              <p className="px-3.5 pb-2 text-[11px] font-medium tracking-wide text-sidebar-fg/40">
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.items.map(({ href, label, icon: Icon }) => {
                  const isActive = isNavItemActive(pathname, href);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={onClose}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'group flex items-center gap-3 rounded-full px-3.5 py-2.5 text-sm transition-all duration-200',
                          isActive
                            ? 'bg-tag font-medium text-tag-ink shadow-[0_8px_24px_-8px_rgba(246,207,69,0.65)]'
                            : 'text-sidebar-fg/65 hover:translate-x-1 hover:bg-white/[0.07] hover:text-sidebar-fg',
                        )}
                      >
                        <Icon
                          className="h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110"
                          aria-hidden="true"
                        />
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="m-3 rounded-2xl bg-white/[0.06] px-4 py-3 text-xs text-sidebar-fg/50">
          Every asset, tracked from purchase to retirement.
        </div>
      </aside>
    </>
  );
}

/** Brand mark shaped like a physical asset tag */
function BrandTag() {
  return (
    <span
      aria-hidden="true"
      className="relative inline-flex h-8 w-11 items-center justify-end rounded-lg bg-tag pr-2 text-xs font-semibold text-tag-ink transition-transform duration-300 group-hover:-rotate-6"
    >
      <span className="absolute left-2 h-1.5 w-1.5 rounded-full bg-sidebar" />
      AF
    </span>
  );
}
