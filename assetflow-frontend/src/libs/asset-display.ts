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
