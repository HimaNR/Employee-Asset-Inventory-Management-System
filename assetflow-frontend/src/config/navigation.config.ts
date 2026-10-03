import {
  ArrowRightLeft,
  Backpack,
  Laptop,
  LayoutDashboard,
  ShieldCheck,
  Tags,
  Undo2,
  UserCircle,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { PERMISSIONS, type UserProfile } from '@/types/auth.types';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** The user needs this permission to see the link and open the page */
  permission?: string;
  /** Only for users linked to an employee record */
  requiresEmployee?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: PERMISSIONS.DASHBOARD_READ },
      { label: 'My assets', href: '/my-assets', icon: Backpack, requiresEmployee: true },
    ],
  },
  {
    title: 'Inventory',
    items: [
      { label: 'Assets', href: '/assets', icon: Laptop, permission: PERMISSIONS.ASSETS_READ },
      { label: 'Categories', href: '/categories', icon: Tags, permission: PERMISSIONS.CATEGORIES_READ },
      { label: 'Employees', href: '/employees', icon: Users, permission: PERMISSIONS.EMPLOYEES_READ },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Assignments', href: '/assignments', icon: ArrowRightLeft, permission: PERMISSIONS.ASSIGNMENTS_READ },
      { label: 'Returns', href: '/returns', icon: Undo2, permission: PERMISSIONS.ASSIGNMENTS_READ },
    ],
  },
  {
    title: 'Administration',
    items: [
      { label: 'Users', href: '/users', icon: UserCog, permission: PERMISSIONS.USERS_MANAGE },
      { label: 'Roles', href: '/roles', icon: ShieldCheck, permission: PERMISSIONS.ROLES_MANAGE },
    ],
  },
  {
    title: 'Account',
    // Everyone who is signed in can open their own profile
    items: [{ label: 'My profile', href: '/profile', icon: UserCircle }],
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

export function canSeeItem(user: UserProfile, item: NavItem): boolean {
  if (item.requiresEmployee && !user.employee) return false;
  if (item.permission && !user.permissions.includes(item.permission)) return false;
  return true;
}

/** Sections with only the links this user may open (empty sections are removed) */
export function navSectionsFor(user: UserProfile): NavSection[] {
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => canSeeItem(user, item)),
  })).filter((section) => section.items.length > 0);
}

/**
 * First page this user may open (Dashboard for managers, My assets for employees).
 * null = the account can open NO page (e.g. Employee role without a linked employee).
 */
export function homePathFor(user: UserProfile): string | null {
  return navSectionsFor(user)[0]?.items[0]?.href ?? null;
}
