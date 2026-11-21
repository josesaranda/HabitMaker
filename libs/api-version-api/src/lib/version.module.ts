import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@habit-maker/api-auth-api';
import { UserEntity } from '@habit-maker/api-auth-infrastructure';
import { AdminRoleGuard } from '@habit-maker/api-admin-api';
import { VersionController } from './version.controller';
import { VersionService } from '@habit-maker/api-version-application';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), AuthModule],
  controllers: [VersionController],
  providers: [VersionService, AdminRoleGuard],
})
export class VersionModule {}
