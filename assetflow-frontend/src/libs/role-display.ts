import type { BadgeTone } from '@/components/Badge';

export const ROLE_DISPLAY: Record<string, { label: string; tone: BadgeTone }> = {
  ADMIN: { label: 'Administrator', tone: 'danger' },
  ASSET_MANAGER: { label: 'Asset manager', tone: 'info' },
  EMPLOYEE: { label: 'Employee', tone: 'neutral' },
};

export function roleDisplay(name: string) {
  return ROLE_DISPLAY[name] ?? { label: name, tone: 'neutral' as BadgeTone };
}
