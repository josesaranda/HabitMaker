import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import nodemailer from 'nodemailer';
import {
  EmailSmtpSettings,
  parseEmailSmtpSettings,
} from '@habit-maker/api-settings-domain';
import { SettingsService } from '@habit-maker/api-settings-infrastructure';

@Injectable()
export class EmailService {
  constructor(private readonly settingsService: SettingsService) {}

  async sendPasswordResetEmail(
    recipient: string,
    resetToken: string,
  ): Promise<void> {
    const settings = await this.getSmtpSettings();

    const appUrl = process.env['APP_URL']?.trim() || 'http://localhost:4200';
    let resetUrl: URL;
    try {
      resetUrl = new URL('/reset-password', appUrl);
    } catch {
      throw new ServiceUnavailableException('The application URL is invalid');
    }
    resetUrl.searchParams.set('token', resetToken);

    const transporter = nodemailer.createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.protocol === 'smtps',
      requireTLS: settings.protocol === 'smtp',
      auth: { user: settings.user, pass: settings.password },
    });

    try {
      await transporter.sendMail({
        from: settings.from,
        to: recipient,
        subject: 'HabitMaker - Reset your password',
        text: `We received a request to reset your HabitMaker password. Open this link to choose a new password (it expires in one hour): ${resetUrl.toString()}\n\nIf you did not request this, you can ignore this email.`,
        html: `<p>We received a request to reset your HabitMaker password.</p><p><a href="${resetUrl.toString()}">Choose a new password</a></p><p>This link expires in one hour. If you did not request this, you can ignore this email.</p>`,
      });
    } catch {
      throw new ServiceUnavailableException(
        'The password reset email could not be sent',
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
      throw new ServiceUnavailableException('Email delivery is not configured');
    }
  }
}
