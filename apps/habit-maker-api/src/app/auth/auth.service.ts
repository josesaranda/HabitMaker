import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  createHash,
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';
import { JwtService } from '@nestjs/jwt';
import { MoreThan, Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { SessionService } from './session.service';
import { EmailService } from '../email/email.service';

interface Credentials {
  email: string;
  password: string;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    private readonly emailService: EmailService,
    private readonly sessionService: SessionService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedAdminFromEnvironment();
  }

  async signup(
    input: unknown,
    userAgent?: string,
  ): Promise<{ accessToken: string }> {
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

    return this.createAccessToken(user, userAgent, false);
  }

  async login(
    input: unknown,
    userAgent?: string,
  ): Promise<{ accessToken: string }> {
    const { email, password } = this.parseCredentials(input);
    const user = await this.users
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();

    if (!user || !this.passwordMatches(password, user)) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const remembered =
      !!input &&
      typeof input === 'object' &&
      (input as Record<string, unknown>)['rememberSession'] === true;
    return this.createAccessToken(user, userAgent, remembered);
  }

  async forgotPassword(input: unknown): Promise<{ message: string }> {
    const email = this.parseEmail(input);
    const user = await this.users.findOneBy({ email });

    if (user) {
      const resetToken = randomBytes(32).toString('base64url');
      const passwordResetTokenHash = this.hashResetToken(resetToken);
      const passwordResetExpiresAt = String(Date.now() + 60 * 60 * 1000);

      await this.users.update(user.id, {
        passwordResetTokenHash,
        passwordResetExpiresAt,
      });

      try {
        await this.emailService.sendPasswordResetEmail(email, resetToken);
      } catch {
        // Keep the public response identical for known and unknown addresses.
        this.logger.error('Password reset email delivery failed');
      }
    }

    return {
      message:
        'If an account exists for this email, password reset instructions will be sent.',
    };
  }

  async resetPassword(input: unknown): Promise<{ message: string }> {
    if (!input || typeof input !== 'object') {
      throw new BadRequestException('A request body is required');
    }

    const body = input as Record<string, unknown>;
    const token = body['token'];
    const password = body['password'];
    if (typeof token !== 'string' || token.length === 0) {
      throw new BadRequestException('A password reset token is required');
    }
    if (typeof password !== 'string' || password.length < 8) {
      throw new BadRequestException(
        'Password must be at least 8 characters long',
      );
    }

    const salt = randomBytes(16).toString('hex');
    const resetTokenHash = this.hashResetToken(token);
    const resetTokenExpiresAt = MoreThan(String(Date.now()));
    await this.users.manager.transaction(async (manager) => {
      const users = manager.getRepository(UserEntity);
      const resetCriteria = {
        passwordResetTokenHash: resetTokenHash,
        passwordResetExpiresAt: resetTokenExpiresAt,
      };
      const user = await users.findOneBy(resetCriteria);
      if (!user) {
        throw new BadRequestException(
          'The password reset link is invalid or expired',
        );
      }

      const result = await users.update(resetCriteria, {
        passwordSalt: salt,
        passwordHash: this.hashPassword(password, salt),
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
      });
      if (!result.affected) {
        throw new BadRequestException(
          'The password reset link is invalid or expired',
        );
      }

      await this.sessionService.revokeAllForUser(user.id, manager);
    });

    return { message: 'Password updated successfully' };
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

  private hashResetToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
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
    userAgent: string | undefined,
    remembered: boolean,
  ): Promise<{ accessToken: string }> {
    const session = await this.sessionService.create(
      user.id,
      userAgent,
      remembered,
    );
    let accessToken: string;
    try {
      accessToken = await this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
        },
        {
          jwtid: session.id,
          expiresIn: remembered ? '30d' : '24h',
        },
      );
    } catch (error) {
      await this.sessionService.revoke(user.id, session.id);
      throw error;
    }

    return { accessToken };
  }
}
