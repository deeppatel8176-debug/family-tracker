import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';

@Controller('api/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  async getOverview(@CurrentUser() user: CurrentUserPayload) {
    return this.dashboardService.getOverview(user.familyId);
  }

  @Get('recent-activity')
  async getRecentActivity(@CurrentUser() user: CurrentUserPayload) {
    return this.dashboardService.getRecentActivity(user.familyId);
  }

  @Get('member-status')
  async getMemberStatus(@CurrentUser() user: CurrentUserPayload) {
    return this.dashboardService.getMemberStatus(user.familyId);
  }
}
