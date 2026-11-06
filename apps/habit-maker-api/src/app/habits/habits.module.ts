import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserEntity } from '../auth/user.entity';
import { HabitEntity } from './habit.entity';
import { HabitCompletionEntity } from './habit-completion.entity';
import { HabitsController } from './habits.controller';
import { HabitsService } from './habits.service';
import { HabitCompletionsController } from './habit-completions.controller';
import { HabitCompletionsService } from './habit-completions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([HabitEntity, HabitCompletionEntity, UserEntity]),
    AuthModule,
  ],
  controllers: [HabitsController, HabitCompletionsController],
  providers: [HabitsService, HabitCompletionsService],
})
export class HabitsModule {}
