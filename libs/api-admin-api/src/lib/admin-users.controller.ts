import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminUsersService } from '@habit-maker/api-admin-application';
import { AdminRoleGuard } from './admin-role.guard';
import { JwtAuthGuard } from '@habit-maker/api-auth-api';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  findAll() {
    return this.adminUsersService.findAll();
  }
}
