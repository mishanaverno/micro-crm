import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EventReady } from '../../events/interfaces/event-ready.interface';

export enum TaskStatus {
  PENDING = 'pending',
  COMPLETE = 'complete',
}

@Entity('tasks')
export class Task implements EventReady {
  getPayload: () => Record<string, string | number | null> = () => ({
    task_id: this.id,
    content: this.content,
    status: this.status,
    deadline: this.deadline?.toISOString() ?? null,
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

  @Column({
    type: 'enum',
    enum: TaskStatus,
    enumName: 'task_status',
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @Column({ type: 'timestamp', nullable: true })
  deadline: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;
}
