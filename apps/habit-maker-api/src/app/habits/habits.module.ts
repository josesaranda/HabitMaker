import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserEntity } from '../auth/user.entity';
import { HabitEntity } from './habit.entity';
import { HabitsController } from './habits.controller';
import { HabitsService } from './habits.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([HabitEntity, UserEntity]), AuthModule],
  controllers: [HabitsController],
  providers: [HabitsService, JwtAuthGuard],
})
export class HabitsModule {}
