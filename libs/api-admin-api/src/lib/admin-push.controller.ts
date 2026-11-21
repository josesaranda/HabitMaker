import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@habit-maker/api-auth-api';
import { AdminRoleGuard } from './admin-role.guard';
import { AdminPushService } from '@habit-maker/api-admin-application';

@Controller('admin/push')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminPushController {
  constructor(private readonly adminPushService: AdminPushService) {}

  @Get('configuration')
  getConfiguration() {
    return this.adminPushService.getConfiguration();
  }
}
