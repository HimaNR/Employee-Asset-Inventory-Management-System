import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PERMISSIONS } from '../common/constants/permissions.constant';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CreateReturnDto } from './dto/create-return.dto';
import { ReturnsService } from './returns.service';

@ApiTags('Returns')
@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  /** Close an ACTIVE assignment; the asset becomes AVAILABLE or DAMAGED */
  @Post()
  @Permissions(PERMISSIONS.RETURNS_WRITE)
  create(@Body() dto: CreateReturnDto, @CurrentUser() user: AuthenticatedUser) {
    return this.returnsService.create(dto, user.id);
  }
}
