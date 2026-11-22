import { ServiceUnavailableException } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { SettingsService } from '@habit-maker/api-settings-infrastructure';
import { AdminEmailService } from './admin-email.service';

vi.mock('nodemailer', () => ({
  default: { createTransport: vi.fn() },
}));

describe('AdminEmailService', () => {
  const createTransport = vi.mocked(nodemailer.createTransport);
  const sendMail = vi.fn();
  const close = vi.fn();
  const getInternal = vi.fn();
  const getPublic = vi.fn();
  const update = vi.fn();
  let service: AdminEmailService;

  beforeEach(() => {
    getInternal.mockReset().mockResolvedValue({
      host: 'smtp.example.com',
      port: 465,
      protocol: 'smtps',
      user: 'mailer@example.com',
      password: 'smtp-secret',
      from: 'HabitMaker <no-reply@example.com>',
    });
    getPublic.mockReset().mockResolvedValue({
      host: 'smtp.example.com',
      port: '465',
      protocol: 'smtps',
      user: 'mailer@example.com',
      from: 'HabitMaker <no-reply@example.com>',
      passwordConfigured: true,
      missingVariables: [],
      isConfigured: true,
      source: 'database',
      enabled: true,
    });
    update.mockReset().mockResolvedValue(undefined);
    service = new AdminEmailService({
      getInternal,
      getPublic,
      update,
    } as unknown as SettingsService);
    sendMail.mockReset().mockResolvedValue({});
    close.mockReset();
    createTransport.mockReset().mockReturnValue({ sendMail, close } as never);
  });

  it('exposes the public SMTP configuration without the password', async () => {
    const configuration = await service.getConfiguration();

    expect(getPublic).toHaveBeenCalledWith('email.smtp');
    expect(configuration).toMatchObject({
      host: 'smtp.example.com',
      passwordConfigured: true,
      isConfigured: true,
      source: 'database',
      enabled: true,
    });
    expect(configuration).not.toHaveProperty('password');
  });

  it('persists the SMTP configuration through the settings service', async () => {
    const input = {
      host: 'smtp.example.com',
      port: '465',
      protocol: 'smtps',
      user: 'mailer@example.com',
      from: 'HabitMaker <no-reply@example.com>',
    };

    await service.updateConfiguration(input, 'admin-1');

    expect(update).toHaveBeenCalledWith('email.smtp', input, 'admin-1');
    expect(getPublic).toHaveBeenCalledWith('email.smtp');
  });

  it('sends the test message using the resolved settings and closes the transport', async () => {
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

  it('rejects delivery when the SMTP configuration is incomplete', async () => {
    getInternal.mockResolvedValue({ host: '' });

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
