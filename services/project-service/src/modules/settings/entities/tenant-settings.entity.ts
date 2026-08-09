import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tenant_settings')
export class TenantSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', unique: true })
  tenantId: string;

  @Column({ type: 'jsonb', default: {} })
  settings: any;

  @Column({ type: 'jsonb', nullable: true })
  apiKeys: any;

  @Column({ type: 'jsonb', default: [] })
  webhookUrls: string[];

  @Column({ type: 'jsonb', default: {} })
  integrations: any;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
