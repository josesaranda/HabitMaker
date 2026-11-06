import { Module } from '@nestjs/common';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { randomBytes } from 'node:crypto';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserEntity } from './user.entity';
import { EmailService } from '../email/email.service';

export function getJwtSignOptions(
  environment: NodeJS.ProcessEnv = process.env,
): NonNullable<JwtModuleOptions['signOptions']> {
  const expiresIn = environment.JWT_EXPIRES_IN?.trim();

  return expiresIn
    ? ({ expiresIn } as NonNullable<JwtModuleOptions['signOptions']>)
    : {};
}

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.register({
      // Set JWT_SECRET in deployed environments so tokens remain verifiable across restarts.
      secret: process.env.JWT_SECRET ?? randomBytes(32).toString('base64url'),
      signOptions: getJwtSignOptions(),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService],
  exports: [JwtModule],
})
export class AuthModule {}
