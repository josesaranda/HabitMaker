import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@habit-maker/api-auth-api';
import { UserEntity } from '@habit-maker/api-auth-infrastructure';
import { HabitEntity } from '@habit-maker/api-habits-infrastructure';
import { HabitCompletionEntity } from '@habit-maker/api-habits-infrastructure';
import { PushController } from './push.controller';
import { PushDeliveryEntity } from '@habit-maker/api-push-infrastructure';
import { PushSubscriptionEntity } from '@habit-maker/api-push-infrastructure';
import { PushService } from '@habit-maker/api-push-application';
import { SettingsModule } from '@habit-maker/api-settings-api';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      HabitEntity,
      HabitCompletionEntity,
      PushSubscriptionEntity,
      PushDeliveryEntity,
    ]),
    AuthModule,
    SettingsModule,
  ],
  controllers: [PushController],
  providers: [PushService],
})
export class PushModule {}
