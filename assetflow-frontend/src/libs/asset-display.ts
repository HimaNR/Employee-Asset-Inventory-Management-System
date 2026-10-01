import type { BadgeTone } from '@/components/Badge';
import type { AssetCondition, AssetStatus } from '@/types/asset.types';

/** One place for how statuses look. Assets, Assignments and Returns pages all reuse it. */
export const ASSET_STATUS_DISPLAY: Record<AssetStatus, { label: string; tone: BadgeTone }> = {
  AVAILABLE: { label: 'Available', tone: 'success' },
  ASSIGNED: { label: 'Assigned', tone: 'info' },
  DAMAGED: { label: 'Damaged', tone: 'danger' },
  UNDER_REPAIR: { label: 'Under repair', tone: 'warning' },
  LOST: { label: 'Lost', tone: 'danger' },
  RETIRED: { label: 'Retired', tone: 'neutral' },
};

export const ASSET_CONDITION_LABEL: Record<AssetCondition, string> = {
  NEW: 'New',
  GOOD: 'Good',
  FAIR: 'Fair',
  DAMAGED: 'Damaged',
};

/**
 * Mirror of the backend's MANUAL_STATUS_TRANSITIONS (common/constants/asset-status.constant.ts).
 * The UI uses it to show only valid buttons; the backend still checks every request.
 */
export const MANUAL_STATUS_TRANSITIONS: Record<AssetStatus, readonly AssetStatus[]> = {
  AVAILABLE: ['RETIRED', 'LOST'],
  ASSIGNED: ['LOST'],
  DAMAGED: ['UNDER_REPAIR', 'RETIRED'],
  UNDER_REPAIR: ['AVAILABLE', 'RETIRED'],
  LOST: ['AVAILABLE'],
  RETIRED: ['AVAILABLE'],
};

/** Button wording for "from -> to" (the same target can mean different things) */
export function statusActionLabel(from: AssetStatus, to: AssetStatus): string {
  if (to === 'UNDER_REPAIR') return 'Send to repair';
  if (to === 'RETIRED') return 'Retire';
  if (to === 'LOST') return 'Mark as lost';
  if (to === 'AVAILABLE' && from === 'UNDER_REPAIR') return 'Mark repaired';
  if (to === 'AVAILABLE' && from === 'LOST') return 'Mark as found';
  if (to === 'AVAILABLE' && from === 'RETIRED') return 'Reinstate';
  return `Set ${ASSET_STATUS_DISPLAY[to].label}`;
}

/** Brief: good return -> AVAILABLE, damaged return -> DAMAGED */
export function statusAfterReturn(condition: AssetCondition): AssetStatus {
  return condition === 'DAMAGED' ? 'DAMAGED' : 'AVAILABLE';
}
