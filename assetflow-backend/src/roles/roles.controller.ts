import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../common/constants/permissions.constant';
import { Permissions } from '../common/decorators/permissions.decorator';
import { RolesService } from './roles.service';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /** Roles with their permissions and user counts (also used by the user form) */
  @Get()
  @Permissions(PERMISSIONS.USERS_MANAGE)
  findAll() {
    return this.rolesService.findAll();
  }

  @Get('permissions')
  @Permissions(PERMISSIONS.ROLES_MANAGE)
  permissions() {
    return this.rolesService.permissions();
  }
}
