import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import nodemailer from 'nodemailer';
import type { AdminEmailConfiguration } from '@habit-maker/api-admin-domain';
import {
  EmailSmtpSettings,
  parseEmailSmtpSettings,
} from '@habit-maker/api-settings-domain';
import { SettingsService } from '@habit-maker/api-settings-infrastructure';

@Injectable()
export class AdminEmailService {
  constructor(private readonly settingsService: SettingsService) {}

  getConfiguration(): Promise<AdminEmailConfiguration> {
    return this.settingsService.getPublic('email.smtp');
  }

  async updateConfiguration(
    input: unknown,
    userId: string,
  ): Promise<AdminEmailConfiguration> {
    await this.settingsService.update('email.smtp', input, userId);
    return this.getConfiguration();
  }

  async sendTestEmail(recipient: string): Promise<void> {
    const configuration = await this.getSmtpSettings();

    const transporter = nodemailer.createTransport({
      host: configuration.host,
      port: configuration.port,
      secure: configuration.protocol === 'smtps',
      requireTLS: configuration.protocol === 'smtp',
      auth: { user: configuration.user, pass: configuration.password },
    });

    try {
      await transporter.sendMail({
        from: configuration.from,
        to: recipient,
        subject: 'HabitMaker - Test email',
        text: 'This is a test email from HabitMaker.',
      });
    } catch {
      throw new ServiceUnavailableException(
        'The test email could not be sent. Check the SMTP configuration.',
      );
    } finally {
      transporter.close();
    }
  }

  private async getSmtpSettings(): Promise<EmailSmtpSettings> {
    const settings = await this.settingsService.getInternal('email.smtp');

    try {
      const parsed = parseEmailSmtpSettings(settings);
      if (!parsed.enabled) {
        throw new ServiceUnavailableException('Email delivery is disabled');
      }
      return parsed;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      throw new ServiceUnavailableException(
        'All SMTP settings must be configured with valid values',
      );
    }
  }
}
