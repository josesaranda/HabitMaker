import { Column, Entity, PrimaryColumn, Unique } from 'typeorm';

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
}
