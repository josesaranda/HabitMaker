import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@habit-maker/api-auth-api';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HabitsModule } from '@habit-maker/api-habits-api';
import { AdminModule } from '@habit-maker/api-admin-api';
import { VersionModule } from '@habit-maker/api-version-api';
import { getDatabaseConfig } from '@habit-maker/api-platform-infrastructure';
import { PushModule } from '@habit-maker/api-push-api';

@Module({
  imports: [
    TypeOrmModule.forRoot(getDatabaseConfig()),
    AuthModule,
    HabitsModule,
    AdminModule,
    VersionModule,
    PushModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
