import { ServiceUnavailableException } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { AdminEmailService } from './admin-email.service';

vi.mock('nodemailer', () => ({
  default: { createTransport: vi.fn() },
}));

describe('AdminEmailService', () => {
  let service: AdminEmailService;
  const createTransport = vi.mocked(nodemailer.createTransport);
  const sendMail = vi.fn();
  const close = vi.fn();

  beforeEach(() => {
    vi.stubEnv('SMTP_HOST', 'smtp.example.com');
    vi.stubEnv('SMTP_PORT', '465');
    vi.stubEnv('SMTP_PROTOCOL', 'smtps');
    vi.stubEnv('SMTP_USER', 'mailer@example.com');
    vi.stubEnv('SMTP_PASSWORD', 'smtp-secret');
    vi.stubEnv('SMTP_FROM', 'HabitMaker <no-reply@example.com>');
    service = new AdminEmailService();
    sendMail.mockReset().mockResolvedValue({});
    close.mockReset();
    createTransport.mockReset().mockReturnValue({ sendMail, close } as never);
  });

  afterEach(() => vi.unstubAllEnvs());

  it('exposes non-secret SMTP settings and only the password configured state', () => {
    expect(service.getConfiguration()).toEqual({
      host: 'smtp.example.com',
      port: '465',
      protocol: 'smtps',
      user: 'mailer@example.com',
      from: 'HabitMaker <no-reply@example.com>',
      passwordConfigured: true,
      missingVariables: [],
      isConfigured: true,
    });
    expect(service.getConfiguration()).not.toHaveProperty('password');
  });

  it('sends the test message using configured SMTP and closes the transport', async () => {
    await service.sendTestEmail('recipient@example.com');

    expect(createTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 465,
      secure: true,
      requireTLS: false,
      auth: { user: 'mailer@example.com', pass: 'smtp-secret' },
    });
    expect(sendMail).toHaveBeenCalledWith({
      from: 'HabitMaker <no-reply@example.com>',
      to: 'recipient@example.com',
      subject: 'HabitMaker - Test email',
      text: 'This is a test email from HabitMaker.',
    });
    expect(close).toHaveBeenCalledOnce();
  });

  it('rejects delivery when the SMTP host or sender is missing', async () => {
    vi.stubEnv('SMTP_HOST', '');

    await expect(
      service.sendTestEmail('recipient@example.com'),
    ).rejects.toThrow(ServiceUnavailableException);
    expect(createTransport).not.toHaveBeenCalled();
  });

  it('does not reveal SMTP delivery errors to the API caller', async () => {
    sendMail.mockRejectedValueOnce(new Error('sensitive SMTP server response'));

    await expect(
      service.sendTestEmail('recipient@example.com'),
    ).rejects.toThrow(
      'The test email could not be sent. Check the SMTP configuration.',
    );
    expect(close).toHaveBeenCalledOnce();
  });
});
