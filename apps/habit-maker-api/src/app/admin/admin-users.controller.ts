import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { AdminRoleGuard } from './admin-role.guard';
import { JwtAuthGuard } from '../habits/jwt-auth.guard';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  findAll() {
    return this.adminUsersService.findAll();
  }
}
