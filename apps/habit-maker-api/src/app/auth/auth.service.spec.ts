import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService();
  });

  describe('signup', () => {
    it('creates an account and normalizes its email', () => {
      const result = service.signup({
        email: '  USER@example.com ',
        password: 'correct-horse',
      });

      expect(result.user.email).toBe('user@example.com');
      expect(result.user.id).toBeDefined();
      expect(result).not.toHaveProperty('password');
    });

    it('rejects duplicate emails', () => {
      service.signup({ email: 'user@example.com', password: 'correct-horse' });

      expect(() =>
        service.signup({ email: 'USER@example.com', password: 'another-pass' }),
      ).toThrow(ConflictException);
    });

    it('requires a valid email and a password of at least 8 characters', () => {
      expect(() =>
        service.signup({ email: 'not-an-email', password: 'correct-horse' }),
      ).toThrow(BadRequestException);
      expect(() =>
        service.signup({ email: 'user@example.com', password: 'short' }),
      ).toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('authenticates a registered account', () => {
      service.signup({ email: 'user@example.com', password: 'correct-horse' });

      expect(
        service.login({ email: 'USER@example.com', password: 'correct-horse' }),
      ).toMatchObject({ user: { email: 'user@example.com' } });
    });

    it('rejects unknown accounts and incorrect passwords', () => {
      service.signup({ email: 'user@example.com', password: 'correct-horse' });

      expect(() =>
        service.login({
          email: 'user@example.com',
          password: 'wrong-password',
        }),
      ).toThrow(UnauthorizedException);
      expect(() =>
        service.login({
          email: 'other@example.com',
          password: 'correct-horse',
        }),
      ).toThrow(UnauthorizedException);
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
