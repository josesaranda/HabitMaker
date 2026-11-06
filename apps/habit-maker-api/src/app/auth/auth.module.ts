import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { randomBytes } from 'node:crypto';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserEntity } from './user.entity';
import { SessionEntity } from './session.entity';
import { SessionService } from './session.service';
import { EmailService } from '../email/email.service';
import { JwtAuthGuard } from '../habits/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, SessionEntity]),
    JwtModule.register({
      // Set JWT_SECRET in deployed environments so tokens remain verifiable across restarts.
      secret: process.env.JWT_SECRET ?? randomBytes(32).toString('base64url'),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SessionService, EmailService, JwtAuthGuard],
  exports: [JwtModule, SessionService, JwtAuthGuard],
})
export class AuthModule {}
