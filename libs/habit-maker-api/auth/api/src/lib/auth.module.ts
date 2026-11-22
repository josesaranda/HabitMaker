import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { randomBytes } from 'node:crypto';
import { AuthController } from './auth.controller';
import { AuthService } from '@habit-maker/api-auth-application';
import { UserEntity } from '@habit-maker/api-auth-infrastructure';
import { SessionEntity } from '@habit-maker/api-auth-infrastructure';
import { SessionService } from '@habit-maker/api-auth-application';
import { EmailService } from '@habit-maker/api-auth-infrastructure';
import { SettingsModule } from '@habit-maker/api-settings-api';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, SessionEntity]),
    SettingsModule,
    JwtModule.register({
      // Set JWT_SECRET in deployed environments so tokens remain verifiable across restarts.
      secret:
        process.env['JWT_SECRET'] ?? randomBytes(32).toString('base64url'),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SessionService, EmailService, JwtAuthGuard],
  exports: [JwtModule, SessionService, JwtAuthGuard],
})
export class AuthModule {}
