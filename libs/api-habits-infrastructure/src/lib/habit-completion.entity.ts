import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { HabitEntity } from './habit.entity';

const completedAtTransformer = {
  to: (value: Date | null): string | null => value?.toISOString() ?? null,
  from: (value: string | null): Date | null =>
    value === null ? null : new Date(value),
};

@Entity({ name: 'habit_completions' })
@Unique(['habit', 'date'])
export class HabitCompletionEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  // Keep this as an ISO date-only value (YYYY-MM-DD), not a timestamp, so the
  // completion is not shifted by timezone conversion.
  @Column({ type: 'varchar', length: 10 })
  date!: string;

  @Column({ type: 'boolean', default: false })
  completed!: boolean;

  @Column({
    type: 'text',
    nullable: true,
    transformer: completedAtTransformer,
  })
  completedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => HabitEntity, (habit) => habit.completions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'habitId' })
  habit!: HabitEntity;
}
