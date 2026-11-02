import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserEntity } from './auth/user.entity';
import { HabitEntity } from './habits/habit.entity';
import { HabitCompletionEntity } from './habits/habit-completion.entity';
import { HabitsModule } from './habits/habits.module';
import { AdminModule } from './admin/admin.module';
import { VersionModule } from './version/version.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqljs',
      // sql.js creates a fresh in-memory database when no location is set.
      autoSave: false,
      entities: [UserEntity, HabitEntity, HabitCompletionEntity],
      synchronize: true,
    }),
    AuthModule,
    HabitsModule,
    AdminModule,
    VersionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
