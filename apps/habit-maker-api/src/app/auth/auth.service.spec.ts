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
import { SessionEntity } from './session.entity';
import { SessionService } from './session.service';

const ADMIN_EMAIL = 'configured-admin@example.com';
const ADMIN_PASSWORD = 'admin-password-123';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let dataSource: DataSource;
  let sessionService: SessionService;
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
      entities: [UserEntity, SessionEntity, HabitEntity, HabitCompletionEntity],
      synchronize: true,
    });
    await dataSource.initialize();
    emailService = {
      sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
    };
    sessionService = new SessionService(
      dataSource.getRepository(SessionEntity),
    );
    service = new AuthService(
      jwtService,
      dataSource.getRepository(UserEntity),
      emailService as unknown as EmailService,
      sessionService,
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
      expect(payload.jti).toBeDefined();
      expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
      expect(result).not.toHaveProperty('user');
      expect(result).not.toHaveProperty('password');
    });

    it('creates device sessions with short and remembered expirations', async () => {
      const user = await service.signup({
        email: 'sessions@example.com',
        password: 'correct-horse',
      });
      const userId = (await jwtService.verifyAsync(user.accessToken)).sub;
      const shortLogin = await service.login(
        {
          email: 'sessions@example.com',
          password: 'correct-horse',
        },
        'Mozilla/5.0 (Macintosh; Intel Mac OS X) Chrome/124.0 Safari/537.36',
      );
      const rememberedLogin = await service.login(
        {
          email: 'sessions@example.com',
          password: 'correct-horse',
          rememberSession: true,
        },
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/605.1',
      );
      const shortClaims = await jwtService.verifyAsync(shortLogin.accessToken);
      const rememberedClaims = await jwtService.verifyAsync(
        rememberedLogin.accessToken,
      );
      const sessions = await dataSource
        .getRepository(SessionEntity)
        .findBy({ userId: userId as string });

      expect(shortClaims.exp - shortClaims.iat).toBe(24 * 60 * 60);
      expect(rememberedClaims.exp - rememberedClaims.iat).toBe(
        30 * 24 * 60 * 60,
      );
      expect(sessions.map(({ deviceName }) => deviceName)).toContain(
        'Chrome on macOS',
      );
      expect(sessions.map(({ deviceName }) => deviceName)).toContain(
        'Safari on iOS',
      );
    });

    it('lists only the account sessions and revokes the selected sessions', async () => {
      const firstUser = await service.signup({
        email: 'first@example.com',
        password: 'correct-horse',
      });
      const firstUserId = (await jwtService.verifyAsync(firstUser.accessToken))
        .sub as string;
      const current = await service.login({
        email: 'first@example.com',
        password: 'correct-horse',
      });
      const otherSession = await service.login({
        email: 'first@example.com',
        password: 'correct-horse',
      });
      const secondUser = await service.signup({
        email: 'second@example.com',
        password: 'correct-horse',
      });
      const currentClaims = await jwtService.verifyAsync(current.accessToken);
      const otherClaims = await jwtService.verifyAsync(
        otherSession.accessToken,
      );
      const secondClaims = await jwtService.verifyAsync(secondUser.accessToken);

      const sessions = await sessionService.listForUser(
        firstUserId,
        currentClaims.jti,
      );
      expect(sessions).toHaveLength(3);
      expect(sessions.filter(({ isCurrent }) => isCurrent)).toHaveLength(1);

      await sessionService.revoke(firstUserId, otherClaims.jti);
      await expect(
        sessionService.findActiveSession(otherClaims.jti, firstUserId),
      ).resolves.toBeNull();
      await expect(
        sessionService.findActiveSession(secondClaims.jti, secondClaims.sub),
      ).resolves.not.toBeNull();

      await sessionService.revokeOthers(firstUserId, currentClaims.jti);
      await expect(
        sessionService.listForUser(firstUserId, currentClaims.jti),
      ).resolves.toHaveLength(1);
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

    it('revokes active sessions after a successful password reset', async () => {
      await service.signup({
        email: 'revoke@example.com',
        password: 'old-password',
      });
      const login = await service.login({
        email: 'revoke@example.com',
        password: 'old-password',
      });
      await service.forgotPassword({ email: 'revoke@example.com' });
      const [, token] = emailService.sendPasswordResetEmail.mock.calls.at(
        -1,
      ) as [string, string];

      await service.resetPassword({ token, password: 'new-password' });

      const claims = await jwtService.verifyAsync(login.accessToken);
      await expect(
        sessionService.findActiveSession(claims.jti, claims.sub),
      ).resolves.toBeNull();
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
