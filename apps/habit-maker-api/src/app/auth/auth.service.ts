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
import { JwtService } from '@nestjs/jwt';

type UserRole = 'admin' | 'user';

interface User {
  id: string;
  email: string;
  role: UserRole;
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

  constructor(private readonly jwtService: JwtService) {
    this.seedAdminFromEnvironment();
  }

  async signup(input: unknown): Promise<{ accessToken: string }> {
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
      role: 'user',
      salt,
      passwordHash: this.hashPassword(password, salt),
    };
    this.users.set(email, user);

    return this.createAccessToken(user);
  }

  async login(input: unknown): Promise<{ accessToken: string }> {
    const { email, password } = this.parseCredentials(input);
    const user = this.users.get(email);

    if (!user || !this.passwordMatches(password, user)) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.createAccessToken(user);
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

  private seedAdminFromEnvironment(): void {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail && !adminPassword) {
      return;
    }
    if (!adminEmail || !adminPassword) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must both be configured');
    }

    let email: string;
    try {
      email = this.normalizeEmail(adminEmail);
    } catch {
      throw new Error('ADMIN_EMAIL must be a valid email address');
    }
    if (adminPassword.length < 8) {
      throw new Error('ADMIN_PASSWORD must be at least 8 characters long');
    }

    const salt = randomBytes(16).toString('hex');
    const admin: StoredUser = {
      id: randomUUID(),
      email,
      role: 'admin',
      salt,
      passwordHash: this.hashPassword(adminPassword, salt),
    };
    this.users.set(email, admin);
  }

  private async createAccessToken(
    user: User,
  ): Promise<{ accessToken: string }> {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { accessToken };
  }
}
