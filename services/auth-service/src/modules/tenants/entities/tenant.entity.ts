import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type SubscriptionTier = 'FREE' | 'PRO' | 'ENTERPRISE';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({
    type: 'enum',
    enum: ['FREE', 'PRO', 'ENTERPRISE'],
    default: 'FREE',
  })
  subscriptionTier: SubscriptionTier;

  @Column({ name: 'admin_email', type: 'varchar', length: 255, nullable: true })
  adminEmail: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
