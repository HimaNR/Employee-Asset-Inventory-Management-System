import {
  ArrowRightLeft,
  Laptop,
  LayoutDashboard,
  ShieldCheck,
  Tags,
  Undo2,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Inventory',
    items: [
      { label: 'Assets', href: '/assets', icon: Laptop },
      { label: 'Categories', href: '/categories', icon: Tags },
      { label: 'Employees', href: '/employees', icon: Users },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Assignments', href: '/assignments', icon: ArrowRightLeft },
      { label: 'Returns', href: '/returns', icon: Undo2 },
    ],
  },
  {
    title: 'Administration',
    items: [
      { label: 'Users', href: '/users', icon: UserCog },
      { label: 'Roles', href: '/roles', icon: ShieldCheck },
    ],
  },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findNavItem(pathname: string): NavItem | undefined {
  return NAV_SECTIONS.flatMap((section) => section.items).find((item) =>
    isNavItemActive(pathname, item.href),
  );
}
