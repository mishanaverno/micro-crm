import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EventReady } from '../../events/interfaces/event-ready.interface';

@Entity('spents')
export class Spent implements EventReady {
  getPayload: () => Record<string, unknown> = () => ({
    spent_id: this.id,
    order_id: this.order_id,
    value: this.value,
  });

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  client_id: string;

  @Column({ type: 'integer' })
  order_id: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  value: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;
}
