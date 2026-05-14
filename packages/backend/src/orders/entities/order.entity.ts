import { EventReady } from '../../events/interfaces/event-ready.interface';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum OrderStatus {
  CREATED = 'created',
  INPROGRESS = 'inprogress',
  DONE = 'done',
}

@Entity('orders')
export class Order implements EventReady {
  getPayload: () => Record<string, string | number | null> = () => ({
    order_id: this.id,
    price: this.price,
    content: this.content,
    status: this.status,
  });

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  client_id: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  price: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  content: string;

  @Column({ type: 'enum', enum: OrderStatus, enumName: 'order_status', default: OrderStatus.CREATED })
  status: OrderStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;
}
