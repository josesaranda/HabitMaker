import {
  BadRequestException,
  ConflictException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';

interface Credentials {
  email: string;
  password: string;
}

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedAdminFromEnvironment();
  }

  async signup(input: unknown): Promise<{ accessToken: string }> {
    const { email, password } = this.parseCredentials(input);

    if (password.length < 8) {
      throw new BadRequestException(
        'Password must be at least 8 characters long',
      );
    }

    if (await this.users.findOneBy({ email })) {
      throw new ConflictException('An account with this email already exists');
    }

    const salt = randomBytes(16).toString('hex');
    const user = this.users.create({
      id: randomUUID(),
      email,
      role: 'user',
      passwordSalt: salt,
      passwordHash: this.hashPassword(password, salt),
    });

    try {
      await this.users.save(user);
    } catch (error) {
      // Keep duplicate-email responses consistent even for concurrent signups.
      if (await this.users.findOneBy({ email })) {
        throw new ConflictException(
          'An account with this email already exists',
        );
      }
      throw error;
    }

    return this.createAccessToken(user);
  }

  async login(input: unknown): Promise<{ accessToken: string }> {
    const { email, password } = this.parseCredentials(input);
    const user = await this.users
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();

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

  private hashPassword(password: string, salt: string): string {
    return scryptSync(password, salt, 64).toString('hex');
  }

  private passwordMatches(password: string, user: UserEntity): boolean {
    const candidateHash = Buffer.from(
      this.hashPassword(password, user.passwordSalt),
      'hex',
    );
    const storedHash = Buffer.from(user.passwordHash, 'hex');

    return (
      candidateHash.length === storedHash.length &&
      timingSafeEqual(candidateHash, storedHash)
    );
  }

  private async seedAdminFromEnvironment(): Promise<void> {
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
    if (await this.users.findOneBy({ email })) {
      return;
    }

    const salt = randomBytes(16).toString('hex');
    const admin = this.users.create({
      id: randomUUID(),
      email,
      role: 'admin',
      passwordSalt: salt,
      passwordHash: this.hashPassword(adminPassword, salt),
    });
    await this.users.save(admin);
  }

  private async createAccessToken(
    user: UserEntity,
  ): Promise<{ accessToken: string }> {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { accessToken };
  }
}
