import type { AssetCondition } from './asset.types';

/** Body from the assessment brief: POST /returns */
export interface CreateReturnInput {
  assignmentId: string;
  returnedAt?: string; // ISO date-time
  condition: AssetCondition;
  notes?: string;
}
