import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@habit-maker/api-auth-api';
import { UserEntity } from '@habit-maker/api-auth-infrastructure';
import { HabitEntity } from '@habit-maker/api-habits-infrastructure';
import { HabitCompletionEntity } from '@habit-maker/api-habits-infrastructure';
import { HabitsController } from './habits.controller';
import { HabitsService } from '@habit-maker/api-habits-application';
import { HabitCompletionsController } from './habit-completions.controller';
import { HabitCompletionsService } from '@habit-maker/api-habits-application';

@Module({
  imports: [
    TypeOrmModule.forFeature([HabitEntity, HabitCompletionEntity, UserEntity]),
    AuthModule,
  ],
  controllers: [HabitsController, HabitCompletionsController],
  providers: [HabitsService, HabitCompletionsService],
})
export class HabitsModule {}
