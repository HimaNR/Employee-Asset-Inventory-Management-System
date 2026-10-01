import { SetMetadata } from '@nestjs/common';
import type { Permission } from '../constants/permissions.constant';

export const PERMISSIONS_KEY = 'permissions';

/** The user needs ALL listed permissions: @Permissions(PERMISSIONS.ASSETS_WRITE) */
export const Permissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
