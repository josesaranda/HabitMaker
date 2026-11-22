import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@habit-maker/api-auth-api';
import { UserEntity } from '@habit-maker/api-auth-infrastructure';
import { AdminRoleGuard } from './admin-role.guard';
import { AdminEmailController } from './admin-email.controller';
import { AdminEmailService } from '@habit-maker/api-admin-infrastructure';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from '@habit-maker/api-admin-application';
import { AdminPushController } from './admin-push.controller';
import { AdminPushService } from '@habit-maker/api-admin-application';
import { AdminSettingsController } from './admin-settings.controller';
import { SettingsModule } from '@habit-maker/api-settings-api';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), AuthModule, SettingsModule],
  controllers: [
    AdminUsersController,
    AdminEmailController,
    AdminPushController,
    AdminSettingsController,
  ],
  providers: [
    AdminUsersService,
    AdminEmailService,
    AdminPushService,
    AdminRoleGuard,
  ],
})
export class AdminModule {}
