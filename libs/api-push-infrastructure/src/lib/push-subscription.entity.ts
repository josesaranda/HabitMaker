import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Column,
  Unique,
} from 'typeorm';
import { UserEntity } from '@habit-maker/api-auth-infrastructure';
import type { PushLanguage } from '@habit-maker/api-push-domain';

@Entity({ name: 'push_subscriptions' })
@Unique(['endpoint'])
export class PushSubscriptionEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Column({ type: 'text' })
  endpoint!: string;

  @Column({ type: 'text' })
  p256dh!: string;

  @Column({ type: 'text' })
  auth!: string;

  @Column({ type: 'varchar', length: 2, default: 'en' })
  language!: PushLanguage;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: UserEntity;
}
