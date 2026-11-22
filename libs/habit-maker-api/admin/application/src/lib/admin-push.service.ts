import { Injectable } from '@nestjs/common';
import type { AdminPushConfiguration } from '@habit-maker/api-admin-domain';
import { SettingsService } from '@habit-maker/api-settings-infrastructure';

@Injectable()
export class AdminPushService {
  constructor(private readonly settingsService: SettingsService) {}

  getConfiguration(): Promise<AdminPushConfiguration> {
    return this.settingsService.getPublic('push.vapid');
  }

  async updateConfiguration(
    input: unknown,
    userId: string,
  ): Promise<AdminPushConfiguration> {
    await this.settingsService.update('push.vapid', input, userId);
    return this.getConfiguration();
  }
}
