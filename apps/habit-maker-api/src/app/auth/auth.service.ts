import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';

interface User {
  id: string;
  email: string;
}

interface StoredUser extends User {
  salt: string;
  passwordHash: Buffer;
}

interface Credentials {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  private readonly users = new Map<string, StoredUser>();

  signup(input: unknown): { user: User } {
    const { email, password } = this.parseCredentials(input);

    if (password.length < 8) {
      throw new BadRequestException(
        'Password must be at least 8 characters long',
      );
    }

    if (this.users.has(email)) {
      throw new ConflictException('An account with this email already exists');
    }

    const salt = randomBytes(16).toString('hex');
    const user: StoredUser = {
      id: randomUUID(),
      email,
      salt,
      passwordHash: this.hashPassword(password, salt),
    };
    this.users.set(email, user);

    return { user: this.toPublicUser(user) };
  }

  login(input: unknown): { user: User } {
    const { email, password } = this.parseCredentials(input);
    const user = this.users.get(email);

    if (!user || !this.passwordMatches(password, user)) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return { user: this.toPublicUser(user) };
  }

  forgotPassword(input: unknown): { message: string } {
    this.parseEmail(input);

    return {
      message:
        'If an account exists for this email, password reset instructions will be sent.',
    };
  }

  private parseCredentials(input: unknown): Credentials {
    if (!input || typeof input !== 'object') {
      throw new BadRequestException('A request body is required');
    }

    const body = input as Record<string, unknown>;
    const email = this.normalizeEmail(body['email']);
    const password = body['password'];

    if (typeof password !== 'string' || password.length === 0) {
      throw new BadRequestException('A password is required');
    }

    return { email, password };
  }

  private parseEmail(input: unknown): string {
    if (!input || typeof input !== 'object') {
      throw new BadRequestException('A request body is required');
    }

    return this.normalizeEmail((input as Record<string, unknown>)['email']);
  }

  private normalizeEmail(value: unknown): string {
    if (
      typeof value !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
    ) {
      throw new BadRequestException('A valid email is required');
    }

    return value.trim().toLowerCase();
  }

  private hashPassword(password: string, salt: string): Buffer {
    return scryptSync(password, salt, 64);
  }

  private passwordMatches(password: string, user: StoredUser): boolean {
    const candidateHash = this.hashPassword(password, user.salt);
    return timingSafeEqual(candidateHash, user.passwordHash);
  }

  private toPublicUser(user: User): User {
    return { id: user.id, email: user.email };
  }
}
