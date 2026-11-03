import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { AuthService } from './auth.service';
import { EmailService } from '../email/email.service';
import { HabitEntity } from '../habits/habit.entity';
import { HabitCompletionEntity } from '../habits/habit-completion.entity';
import { UserEntity } from './user.entity';

const ADMIN_EMAIL = 'configured-admin@example.com';
const ADMIN_PASSWORD = 'admin-password-123';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let dataSource: DataSource;
  let emailService: { sendPasswordResetEmail: ReturnType<typeof vi.fn> };
  let previousAdminEmail: string | undefined;
  let previousAdminPassword: string | undefined;

  beforeEach(async () => {
    process.env.ADMIN_EMAIL = ADMIN_EMAIL;
    process.env.ADMIN_PASSWORD = ADMIN_PASSWORD;
    jwtService = new JwtService({ secret: 'test-secret' });
    dataSource = new DataSource({
      type: 'sqljs',
      autoSave: false,
      entities: [UserEntity, HabitEntity, HabitCompletionEntity],
      synchronize: true,
    });
    await dataSource.initialize();
    emailService = {
      sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
    };
    service = new AuthService(
      jwtService,
      dataSource.getRepository(UserEntity),
      emailService as unknown as EmailService,
    );
    await service.onModuleInit();
  });

  afterEach(async () => {
    await dataSource.destroy();
  });

  afterAll(() => {
    if (previousAdminEmail === undefined) {
      delete process.env.ADMIN_EMAIL;
    } else {
      process.env.ADMIN_EMAIL = previousAdminEmail;
    }
    if (previousAdminPassword === undefined) {
      delete process.env.ADMIN_PASSWORD;
    } else {
      process.env.ADMIN_PASSWORD = previousAdminPassword;
    }
  });

  beforeAll(() => {
    previousAdminEmail = process.env.ADMIN_EMAIL;
    previousAdminPassword = process.env.ADMIN_PASSWORD;
  });

  it('seeds the administrator from environment credentials with the admin role', async () => {
    const result = await service.login({
      email: ADMIN_EMAIL.toUpperCase(),
      password: ADMIN_PASSWORD,
    });

    const payload = await jwtService.verifyAsync(result.accessToken);
    expect(payload).toMatchObject({
      email: ADMIN_EMAIL,
      role: 'admin',
    });
    expect(result).not.toHaveProperty('user');
  });

  it('does not allow signup to replace the configured administrator account', async () => {
    await expect(
      service.signup({ email: ADMIN_EMAIL, password: 'another-password' }),
    ).rejects.toThrow(ConflictException);
  });

  describe('signup', () => {
    it('creates an account and returns a JWT without user data', async () => {
      const result = await service.signup({
        email: '  USER@example.com ',
        password: 'correct-horse',
      });

      const payload = await jwtService.verifyAsync(result.accessToken);
      expect(payload).toMatchObject({
        email: 'user@example.com',
        role: 'user',
      });
      expect(payload.sub).toBeDefined();
      expect(result).not.toHaveProperty('user');
      expect(result).not.toHaveProperty('password');
    });

    it('rejects duplicate emails', async () => {
      await service.signup({
        email: 'user@example.com',
        password: 'correct-horse',
      });

      await expect(
        service.signup({ email: 'USER@example.com', password: 'another-pass' }),
      ).rejects.toThrow(ConflictException);
    });

    it('requires a valid email and a password of at least 8 characters', async () => {
      await expect(
        service.signup({ email: 'not-an-email', password: 'correct-horse' }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.signup({ email: 'user@example.com', password: 'short' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('authenticates a registered account and returns a JWT', async () => {
      await service.signup({
        email: 'user@example.com',
        password: 'correct-horse',
      });

      const result = await service.login({
        email: 'USER@example.com',
        password: 'correct-horse',
      });

      const payload = await jwtService.verifyAsync(result.accessToken);
      expect(payload).toMatchObject({
        email: 'user@example.com',
        role: 'user',
      });
      expect(result).not.toHaveProperty('user');
    });

    it('rejects unknown accounts and incorrect passwords', async () => {
      await service.signup({
        email: 'user@example.com',
        password: 'correct-horse',
      });

      await expect(
        service.login({
          email: 'user@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.login({
          email: 'other@example.com',
          password: 'correct-horse',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('returns the same response for registered and unknown emails', async () => {
      await service.signup({
        email: 'known@example.com',
        password: ADMIN_PASSWORD,
      });
      const knownEmailResponse = await service.forgotPassword({
        email: 'known@example.com',
      });
      const unknownEmailResponse = await service.forgotPassword({
        email: 'unknown@example.com',
      });

      expect(knownEmailResponse).toEqual(unknownEmailResponse);
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalledOnce();
    });

    it('sends a single-use reset token and updates the password', async () => {
      await service.signup({
        email: 'person@example.com',
        password: 'old-password',
      });
      await service.forgotPassword({ email: 'person@example.com' });
      const [, token] = emailService.sendPasswordResetEmail.mock.calls[0] as [
        string,
        string,
      ];

      await expect(
        service.resetPassword({ token, password: 'new-password' }),
      ).resolves.toEqual({ message: 'Password updated successfully' });
      await expect(
        service.login({
          email: 'person@example.com',
          password: 'old-password',
        }),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.login({
          email: 'person@example.com',
          password: 'new-password',
        }),
      ).resolves.toHaveProperty('accessToken');
      await expect(
        service.resetPassword({ token, password: 'another-password' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects expired reset tokens and short passwords', async () => {
      await service.signup({
        email: 'person@example.com',
        password: 'old-password',
      });
      await service.forgotPassword({ email: 'person@example.com' });
      const [, token] = emailService.sendPasswordResetEmail.mock.calls[0] as [
        string,
        string,
      ];
      await dataSource
        .getRepository(UserEntity)
        .update(
          { email: 'person@example.com' },
          { passwordResetExpiresAt: String(Date.now() - 1000) },
        );

      await expect(
        service.resetPassword({ token, password: 'new-password' }),
      ).rejects.toThrow('The password reset link is invalid or expired');
      await expect(
        service.resetPassword({ token, password: 'short' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
