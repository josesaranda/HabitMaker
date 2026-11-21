import { Injectable } from '@nestjs/common';
import { AdminPushConfiguration } from '@habit-maker/api-admin-domain';

@Injectable()
export class AdminPushService {
  getConfiguration(): AdminPushConfiguration {
    const publicKeyConfigured = Boolean(
      process.env['VAPID_PUBLIC_KEY']?.trim(),
    );
    const privateKeyConfigured = Boolean(
      process.env['VAPID_PRIVATE_KEY']?.trim(),
    );

    return {
      publicKeyConfigured,
      privateKeyConfigured,
      subjectConfigured: Boolean(process.env['VAPID_SUBJECT']?.trim()),
      isConfigured: publicKeyConfigured && privateKeyConfigured,
    };
  }
}
