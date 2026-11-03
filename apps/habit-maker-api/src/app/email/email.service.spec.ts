import { ServiceUnavailableException } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { EmailService } from './email.service';

vi.mock('nodemailer', () => ({
  default: { createTransport: vi.fn() },
}));

describe('EmailService', () => {
  const createTransport = vi.mocked(nodemailer.createTransport);
  const sendMail = vi.fn();
  const close = vi.fn();
  let service: EmailService;

  beforeEach(() => {
    vi.stubEnv('SMTP_HOST', 'smtp.example.com');
    vi.stubEnv('SMTP_PORT', '465');
    vi.stubEnv('SMTP_PROTOCOL', 'smtps');
    vi.stubEnv('SMTP_USER', 'mailer@example.com');
    vi.stubEnv('SMTP_PASSWORD', 'smtp-secret');
    vi.stubEnv('SMTP_FROM', 'HabitMaker <no-reply@example.com>');
    vi.stubEnv('APP_URL', 'https://habitmaker.example');
    service = new EmailService();
    sendMail.mockReset().mockResolvedValue({});
    close.mockReset();
    createTransport.mockReset().mockReturnValue({ sendMail, close } as never);
  });

  afterEach(() => vi.unstubAllEnvs());

  it('sends a password-reset link over the configured SMTP transport', async () => {
    await service.sendPasswordResetEmail('person@example.com', 'secret-token');

    expect(createTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 465,
      secure: true,
      requireTLS: false,
      auth: { user: 'mailer@example.com', pass: 'smtp-secret' },
    });
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'HabitMaker <no-reply@example.com>',
        to: 'person@example.com',
        subject: 'HabitMaker - Reset your password',
        text: expect.stringContaining(
          'https://habitmaker.example/reset-password?token=secret-token',
        ),
      }),
    );
    expect(close).toHaveBeenCalledOnce();
  });

  it('rejects delivery when SMTP is not configured', async () => {
    vi.stubEnv('SMTP_HOST', '');

    await expect(
      service.sendPasswordResetEmail('person@example.com', 'secret-token'),
    ).rejects.toThrow(ServiceUnavailableException);
    expect(createTransport).not.toHaveBeenCalled();
  });
});
