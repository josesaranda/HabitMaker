import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { HabitEntity } from '../habits/habit.entity';
import { PushSubscriptionEntity } from './push-subscription.entity';

@Entity({ name: 'push_deliveries' })
@Unique(['habit', 'subscription', 'localDate'])
export class PushDeliveryEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @ManyToOne(() => HabitEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'habitId' })
  habit!: HabitEntity;

  @ManyToOne(() => PushSubscriptionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subscriptionId' })
  subscription!: PushSubscriptionEntity;

  @Column({ type: 'varchar', length: 10 })
  localDate!: string;

  @CreateDateColumn()
  attemptedAt!: Date;
}
