import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../habits/jwt-auth.guard';
import { AdminRoleGuard } from '../admin/admin-role.guard';
import { VersionService } from './version.service';

@Controller('version')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class VersionController {
  constructor(private readonly versionService: VersionService) {}

  @Get()
  currentVersion() {
    return this.versionService.getCurrentVersion();
  }

  @Get('check')
  checkForUpdates() {
    return this.versionService.checkForUpdates();
  }
}
