import Link from 'next/link';
import { X } from 'lucide-react';
import { NAV_SECTIONS, isNavItemActive } from '@/config/navigation.config';

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
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
        />
      )}

      <aside
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-ink text-white transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/dashboard" onClick={onClose} className="flex items-center gap-3 rounded-md">
            <BrandTag />
            <span className="text-lg font-semibold tracking-tight">AssetFlow</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-md p-1 text-white/70 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="mb-6">
              <p className="px-3 pb-2 text-xs font-medium text-white/45">{section.title}</p>
              <ul className="space-y-0.5">
                {section.items.map(({ href, label, icon: Icon }) => {
                  const isActive = isNavItemActive(pathname, href);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={onClose}
                        aria-current={isActive ? 'page' : undefined}
                        className={`relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? 'bg-white/10 font-medium text-white'
                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className="absolute inset-y-1.5 left-0 w-1 rounded-r bg-tag"
                          />
                        )}
                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

/** Brand mark shaped like a physical asset tag */
function BrandTag() {
  return (
    <span
      aria-hidden="true"
      className="relative inline-flex h-7 w-10 items-center justify-end rounded-[5px] bg-tag pr-1.5 text-[11px] font-bold text-tag-ink"
    >
      <span className="absolute left-1.5 h-1.5 w-1.5 rounded-full bg-ink" />
      AF
    </span>
  );
}
