import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserEntity } from '../auth/user.entity';
import { JwtAuthGuard } from '../habits/jwt-auth.guard';
import { AdminRoleGuard } from './admin-role.guard';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), AuthModule],
  controllers: [AdminUsersController],
  providers: [AdminUsersService, JwtAuthGuard, AdminRoleGuard],
})
export class AdminModule {}
