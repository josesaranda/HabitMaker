import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserEntity } from '../auth/user.entity';
import { HabitEntity } from '../habits/habit.entity';
import { HabitCompletionEntity } from '../habits/habit-completion.entity';
import { PushController } from './push.controller';
import { PushDeliveryEntity } from './push-delivery.entity';
import { PushSubscriptionEntity } from './push-subscription.entity';
import { PushService } from './push.service';

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
  ],
  controllers: [PushController],
  providers: [PushService],
})
export class PushModule {}
