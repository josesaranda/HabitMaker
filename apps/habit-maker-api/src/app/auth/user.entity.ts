import { Column, Entity, OneToMany, PrimaryColumn, Unique } from 'typeorm';
import { HabitEntity } from '../habits/habit.entity';

export type UserRole = 'admin' | 'user';

@Entity({ name: 'users' })
@Unique(['email'])
export class UserEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Column({ type: 'varchar', length: 254 })
  email!: string;

  @Column({ type: 'varchar', length: 16 })
  role!: UserRole;

  @Column({ type: 'varchar', length: 32 })
  passwordSalt!: string;

  @Column({ type: 'varchar', length: 128, select: false })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 64, nullable: true, select: false })
  passwordResetTokenHash!: string | null;

  @Column({ type: 'bigint', nullable: true, select: false })
  passwordResetExpiresAt!: string | null;

  @OneToMany(() => HabitEntity, (habit) => habit.user)
  habits!: HabitEntity[];
}
