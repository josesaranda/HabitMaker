import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'settings' })
export class SettingEntity {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  namespace!: string;

  @Column({ type: 'simple-json' })
  value!: Record<string, unknown>;

  @Column({ type: 'simple-json', select: false })
  secrets!: Record<string, string>;

  @Column({ type: 'integer', default: 1 })
  schemaVersion!: number;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'varchar', length: 36, nullable: true })
  updatedBy!: string | null;
}
