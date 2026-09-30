import Link from 'next/link';
import { ArrowUpRight, ArrowRightLeft, Laptop, Tags } from 'lucide-react';
import Card from '@/components/Card';

const LINKS = [
  { href: '/assets', label: 'Register or find an asset', icon: Laptop },
  { href: '/categories', label: 'Manage categories', icon: Tags },
  { href: '/assignments', label: 'Assign an asset', icon: ArrowRightLeft },
];

export function QuickLinksCard() {
  return (
    <Card interactive>
      <h3 className="text-lg font-medium">Quick actions</h3>
      <ul className="mt-4 space-y-2">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="group flex items-center gap-3 rounded-2xl bg-surface-2 px-4 py-3 text-sm transition-all duration-200 hover:bg-contrast hover:text-contrast-fg"
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="flex-1">{label}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-ink transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
