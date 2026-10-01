import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /** Counts by status and category, attention items, recent assignments and activity */
  @Get('summary')
  getSummary() {
    return this.dashboardService.getSummary();
  }
}
