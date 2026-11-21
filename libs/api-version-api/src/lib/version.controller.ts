import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@habit-maker/api-auth-api';
import { AdminRoleGuard } from '@habit-maker/api-admin-api';
import { VersionService } from '@habit-maker/api-version-application';

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
