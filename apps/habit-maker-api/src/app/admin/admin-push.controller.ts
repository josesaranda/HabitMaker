import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../habits/jwt-auth.guard';
import { AdminRoleGuard } from './admin-role.guard';
import { AdminPushService } from './admin-push.service';

@Controller('admin/push')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminPushController {
  constructor(private readonly adminPushService: AdminPushService) {}

  @Get('configuration')
  getConfiguration() {
    return this.adminPushService.getConfiguration();
  }
}
