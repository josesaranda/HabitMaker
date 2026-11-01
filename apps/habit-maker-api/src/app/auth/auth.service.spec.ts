import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService({ secret: 'test-secret' });
    service = new AuthService(jwtService);
  });

  describe('signup', () => {
    it('creates an account and returns a JWT without user data', async () => {
      const result = await service.signup({
        email: '  USER@example.com ',
        password: 'correct-horse',
      });

      const payload = await jwtService.verifyAsync(result.accessToken);
      expect(payload).toMatchObject({ email: 'user@example.com' });
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
      expect(payload.email).toBe('user@example.com');
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
    it('returns the same response for registered and unknown emails', () => {
      const knownEmailResponse = service.forgotPassword({
        email: 'known@example.com',
      });
      const unknownEmailResponse = service.forgotPassword({
        email: 'unknown@example.com',
      });

      expect(knownEmailResponse).toEqual(unknownEmailResponse);
    });
  });
});
