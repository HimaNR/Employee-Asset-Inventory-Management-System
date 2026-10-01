import { apiClient } from '@/libs/api/api-client';
import type { Assignment } from '@/types/assignment.types';
import type { CreateReturnInput } from '@/types/return.types';

export const returnsService = {
  /** Closes an ACTIVE assignment; returns the updated (RETURNED) assignment */
  create: (input: CreateReturnInput) => apiClient.post<Assignment>('/returns', input),
};
