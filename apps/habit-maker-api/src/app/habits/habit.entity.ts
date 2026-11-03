import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../auth/user.entity';
import { HabitCompletionEntity } from './habit-completion.entity';

@Entity({ name: 'habits' })
export class HabitEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'boolean', default: false })
  reminderEnabled!: boolean;

  @Column({ type: 'varchar', length: 5, nullable: true })
  reminderTime!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reminderTimeZone!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => UserEntity, (user) => user.habits, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: UserEntity;

  @OneToMany(() => HabitCompletionEntity, (completion) => completion.habit)
  completions!: HabitCompletionEntity[];
}
