import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../common/constants/permissions.constant';
import { Permissions } from '../common/decorators/permissions.decorator';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /** Counts by status and category, attention items, recent assignments and activity */
  @Get('summary')
  @Permissions(PERMISSIONS.DASHBOARD_READ)
  getSummary() {
    return this.dashboardService.getSummary();
  }
}
