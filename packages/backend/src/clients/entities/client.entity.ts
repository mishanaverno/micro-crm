import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

export enum ClientStatus {
  INDIVIDUAL = 'individual',
  LEGAL_ENTITY = 'legal_entity',
}

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone_number?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  company?: string | null;

  @Column({ type: 'varchar', length: 32, default: ClientStatus.INDIVIDUAL })
  status: ClientStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;
}
