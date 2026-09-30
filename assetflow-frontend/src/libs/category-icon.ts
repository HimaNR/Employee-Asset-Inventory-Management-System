import {
  Cable,
  Camera,
  Headphones,
  Keyboard,
  Laptop,
  Monitor,
  Mouse,
  Package,
  Printer,
  Server,
  Smartphone,
  Tablet,
  type LucideIcon,
} from 'lucide-react';
import { createElement } from 'react';

/** Keyword -> icon. The first rule whose keyword appears in the name wins. */
const RULES: Array<{ keywords: string[]; icon: LucideIcon }> = [
  { keywords: ['laptop', 'notebook', 'macbook'], icon: Laptop },
  { keywords: ['monitor', 'display', 'screen'], icon: Monitor },
  { keywords: ['tablet', 'ipad'], icon: Tablet },
  { keywords: ['phone', 'mobile'], icon: Smartphone },
  { keywords: ['dock', 'cable', 'adapter', 'charger'], icon: Cable },
  { keywords: ['keyboard'], icon: Keyboard },
  { keywords: ['mouse'], icon: Mouse },
  { keywords: ['headset', 'headphone', 'accessor'], icon: Headphones },
  { keywords: ['printer', 'scanner'], icon: Printer },
  { keywords: ['server', 'network', 'router'], icon: Server },
  { keywords: ['camera', 'webcam'], icon: Camera },
];

/** A friendly icon for a category name; unknown names get a box */
export function categoryIcon(categoryName: string): LucideIcon {
  const name = categoryName.toLowerCase();
  return RULES.find((rule) => rule.keywords.some((k) => name.includes(k)))?.icon ?? Package;
}

/**
 * <CategoryIcon name="Laptop" /> renders the matching icon.
 * createElement (not <Icon />) because the icon is chosen at runtime:
 * React's lint rule forbids creating component variables inside render.
 */
export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  return createElement(categoryIcon(name), { className, 'aria-hidden': true });
}
