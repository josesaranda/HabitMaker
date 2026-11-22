import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  JwtAuthGuard,
  type AuthenticatedUserRequest,
} from '@habit-maker/api-auth-api';
import type { SettingsNamespace } from '@habit-maker/api-settings-domain';
import {
  isSettingsNamespace,
  SettingsService,
} from '@habit-maker/api-settings-infrastructure';
import { AdminRoleGuard } from './admin-role.guard';

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  list() {
    return this.settingsService.getPublicAll();
  }

  @Get(':namespace')
  get(@Param('namespace') namespace: string) {
    return this.settingsService.getPublic(this.requireNamespace(namespace));
  }

  @Put(':namespace')
  async update(
    @Param('namespace') namespace: string,
    @Body() body: unknown,
    @Req() request: AuthenticatedUserRequest,
  ) {
    const settingsNamespace = this.requireNamespace(namespace);
    await this.settingsService.update(settingsNamespace, body, request.user.id);
    return this.settingsService.getPublic(settingsNamespace);
  }

  @Delete(':namespace')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reset(@Param('namespace') namespace: string): Promise<void> {
    await this.settingsService.reset(this.requireNamespace(namespace));
  }

  private requireNamespace(value: string): SettingsNamespace {
    if (!isSettingsNamespace(value)) {
      throw new BadRequestException(`Unknown settings namespace: ${value}`);
    }

    return value;
  }
}
