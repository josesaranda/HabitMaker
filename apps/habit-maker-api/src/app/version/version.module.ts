import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserEntity } from '../auth/user.entity';
import { AdminRoleGuard } from '../admin/admin-role.guard';
import { VersionController } from './version.controller';
import { VersionService } from './version.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), AuthModule],
  controllers: [VersionController],
  providers: [VersionService, AdminRoleGuard],
})
export class VersionModule {}
