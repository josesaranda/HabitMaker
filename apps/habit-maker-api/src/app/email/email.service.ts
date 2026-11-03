import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  async sendPasswordResetEmail(
    recipient: string,
    resetToken: string,
  ): Promise<void> {
    const host = process.env.SMTP_HOST?.trim() ?? '';
    const port = Number.parseInt(process.env.SMTP_PORT?.trim() ?? '', 10);
    const protocol = process.env.SMTP_PROTOCOL?.trim().toLowerCase() ?? '';
    const username = process.env.SMTP_USER?.trim() ?? '';
    const password = process.env.SMTP_PASSWORD ?? '';
    const from = process.env.SMTP_FROM?.trim() ?? '';

    if (
      !host ||
      !Number.isInteger(port) ||
      port < 1 ||
      port > 65535 ||
      (protocol !== 'smtp' && protocol !== 'smtps') ||
      !username ||
      !password.trim() ||
      !from
    ) {
      throw new ServiceUnavailableException('Email delivery is not configured');
    }

    const appUrl = process.env.APP_URL?.trim() || 'http://localhost:4200';
    let resetUrl: URL;
    try {
      resetUrl = new URL('/reset-password', appUrl);
    } catch {
      throw new ServiceUnavailableException('The application URL is invalid');
    }
    resetUrl.searchParams.set('token', resetToken);

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: protocol === 'smtps',
      requireTLS: protocol === 'smtp',
      auth: { user: username, pass: password },
    });

    try {
      await transporter.sendMail({
        from,
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
}
