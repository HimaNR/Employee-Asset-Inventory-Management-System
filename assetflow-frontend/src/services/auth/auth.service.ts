import { apiClient } from '@/libs/api/api-client';
import type { PaginatedResponse } from '@/types/api.types';
import type { AuthTokens, MyProfile, UserProfile } from '@/types/auth.types';
import type { EmployeeAssignment } from '@/types/employee.types';

export const authService = {
  login: (email: string, password: string) =>
    apiClient.post<AuthTokens>('/auth/login', { email, password }, { auth: false }),

  logout: () => apiClient.post<void>('/auth/logout'),

  me: (signal?: AbortSignal) => apiClient.get<UserProfile>('/auth/me', { signal }),

  /** Account + linked employee details for "My profile" */
  profile: (signal?: AbortSignal) => apiClient.get<MyProfile>('/auth/me/profile', { signal }),

  /** Change your own password; returns fresh tokens (other devices are signed out) */
  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post<AuthTokens>('/auth/me/password', { currentPassword, newPassword }),

  /** Assets currently assigned to the signed-in employee */
  myAssets: (signal?: AbortSignal) =>
    apiClient.get<PaginatedResponse<EmployeeAssignment>>('/auth/me/assets', { signal }),
};
