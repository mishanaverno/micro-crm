import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EventType {
  NOTE_CREATED = 'note_created',
  NOTE_UPDATED = 'note_updated',
  NOTE_DELETED = 'note_deleted',
  TASK_CREATED = 'task_created',
  TASK_UPDATED = 'task_updated',
  TASK_DELETED = 'task_deleted',
  REMINDER_CREATED = 'reminder_created',
  REMINDER_UPDATED = 'reminder_updated',
  REMINDER_DELETED = 'reminder_deleted',
  CLIENT_CREATED = 'client_created',
  CLIENT_UPDATED = 'client_updated',
  CLIENT_DELETED = 'client_deleted',
  ORDER_CREATED = 'order_created',
  ORDER_UPDATED = 'order_updated',
  ORDER_DELETED = 'order_deleted',
  ORDER_COMPLETE = 'order_complete',
  ORDER_REOPENED = 'order_reopened',
  PAID_CREATED = 'paid_created',
  PAID_UPDATED = 'paid_updated',
  PAID_DELETED = 'paid_deleted',
  SPENT_CREATED = 'spent_created',
  SPENT_UPDATED = 'spent_updated',
  SPENT_DELETED = 'spent_deleted',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: true })
  original_id: number | null;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  client_id: string;

  @Column({ type: 'integer', nullable: true })
  order_id: number | null;

  @Column({ type: 'enum', enum: EventType, enumName: 'event_type' })
  type: EventType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  comment: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  payload: Record<string, unknown>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;
}
