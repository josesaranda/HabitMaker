import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import nodemailer from 'nodemailer';

export interface AdminEmailConfiguration {
  host: string;
  port: string;
  protocol: string;
  user: string;
  from: string;
  passwordConfigured: boolean;
  missingVariables: string[];
  isConfigured: boolean;
}

const REQUIRED_SMTP_VARIABLES = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_PROTOCOL',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'SMTP_FROM',
] as const;

@Injectable()
export class AdminEmailService {
  getConfiguration(): AdminEmailConfiguration {
    const host = process.env.SMTP_HOST?.trim() ?? '';
    const port = process.env.SMTP_PORT?.trim() ?? '';
    const protocol = process.env.SMTP_PROTOCOL?.trim().toLowerCase() ?? '';
    const user = process.env.SMTP_USER?.trim() ?? '';
    const from = process.env.SMTP_FROM?.trim() ?? '';
    const passwordConfigured = Boolean(process.env.SMTP_PASSWORD?.trim());
    const missingVariables = REQUIRED_SMTP_VARIABLES.filter(
      (variable) => !process.env[variable]?.trim(),
    );
    const numericPort = Number.parseInt(port, 10);
    const validPort =
      Number.isInteger(numericPort) && numericPort > 0 && numericPort <= 65535;
    const validProtocol = protocol === 'smtp' || protocol === 'smtps';

    return {
      host,
      port,
      protocol,
      user,
      from,
      passwordConfigured,
      missingVariables: [...missingVariables],
      isConfigured: missingVariables.length === 0 && validPort && validProtocol,
    };
  }

  async sendTestEmail(recipient: string): Promise<void> {
    const configuration = this.getConfiguration();
    const username = process.env.SMTP_USER?.trim() ?? '';
    const password = process.env.SMTP_PASSWORD ?? '';

    if (!configuration.isConfigured) {
      throw new ServiceUnavailableException(
        'All SMTP environment variables must be configured with valid values',
      );
    }

    const transporter = nodemailer.createTransport({
      host: configuration.host,
      port: Number.parseInt(configuration.port, 10),
      secure: configuration.protocol === 'smtps',
      requireTLS: configuration.protocol === 'smtp',
      auth: { user: username, pass: password },
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
}
