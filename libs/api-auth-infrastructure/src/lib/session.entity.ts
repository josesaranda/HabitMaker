import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'auth_sessions' })
@Index(['userId', 'revokedAt', 'expiresAt'])
export class SessionEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Column({ type: 'varchar', length: 36 })
  userId!: string;

  @Column({ type: 'varchar', length: 160 })
  deviceName!: string;

  @Column({ type: 'bigint' })
  createdAt!: string;

  @Column({ type: 'bigint' })
  lastUsedAt!: string;

  @Column({ type: 'bigint' })
  expiresAt!: string;

  @Column({ type: 'bigint', nullable: true })
  revokedAt!: string | null;
}
