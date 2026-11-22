import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import {
  JwtAuthGuard,
  type AuthenticatedUserRequest,
} from '@habit-maker/api-auth-api';
import { AdminPushService } from '@habit-maker/api-admin-application';
import { AdminRoleGuard } from './admin-role.guard';

@Controller('admin/push')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminPushController {
  constructor(private readonly adminPushService: AdminPushService) {}

  @Get('configuration')
  getConfiguration() {
    return this.adminPushService.getConfiguration();
  }

  @Put('configuration')
  updateConfiguration(
    @Body() body: unknown,
    @Req() request: AuthenticatedUserRequest,
  ) {
    return this.adminPushService.updateConfiguration(body, request.user.id);
  }
}
