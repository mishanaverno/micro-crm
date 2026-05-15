import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { EventReady } from '../../events/interfaces/event-ready.interface';

@Entity('reminders')
export class Reminder implements EventReady {
  getPayload: () => Record<string, string | number | null> = () => ({
    reminder_id: this.id,
    content: this.content,
    timestamp: this.timestamp.toISOString(),
    order_id: this.order_id ?? null,
  });

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  client_id: string;

  @Column({ type: 'integer', nullable: true })
  order_id: number | null;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;
}
