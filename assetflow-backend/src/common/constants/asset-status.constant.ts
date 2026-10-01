import type { AssetCondition, AssetStatus } from '../../generated/prisma/enums';

/**
 * Asset lifecycle from the assessment brief.
 * ASSIGNED is never set here: it only happens through POST /assignments,
 * and leaving ASSIGNED normally happens through POST /returns.
 *
 *   ASSIGNED -> LOST
 *   AVAILABLE -> RETIRED | LOST
 *   DAMAGED -> UNDER_REPAIR | RETIRED
 *   UNDER_REPAIR -> AVAILABLE (repaired) | RETIRED
 *   LOST -> AVAILABLE (found again)                       extension
 *   RETIRED -> AVAILABLE (reinstated, authorised workflow)  brief: "unless explicitly reactivated"
 */
export const MANUAL_STATUS_TRANSITIONS: Record<AssetStatus, readonly AssetStatus[]> = {
  AVAILABLE: ['RETIRED', 'LOST'],
  ASSIGNED: ['LOST'],
  DAMAGED: ['UNDER_REPAIR', 'RETIRED'],
  UNDER_REPAIR: ['AVAILABLE', 'RETIRED'],
  LOST: ['AVAILABLE'],
  RETIRED: ['AVAILABLE'],
};

export function canChangeStatus(from: AssetStatus, to: AssetStatus): boolean {
  return MANUAL_STATUS_TRANSITIONS[from].includes(to);
}

/** Brief: "return (good condition) -> AVAILABLE", "return damaged -> DAMAGED" */
export function statusAfterReturn(condition: AssetCondition): AssetStatus {
  return condition === 'DAMAGED' ? 'DAMAGED' : 'AVAILABLE';
}

export function statusLabel(status: string): string {
  return status.replace('_', ' ').toLowerCase();
}
