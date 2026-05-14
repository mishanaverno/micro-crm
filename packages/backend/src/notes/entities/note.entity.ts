import { EventReady } from '../../events/interfaces/event-ready.interface';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('notes')
export class Note implements EventReady{
  getPayload: () => Record<string, string | number | null> = () => { return { 
    note_id: this.id,
    content: this.content,
    order_id: this.order_id ?? null,
  }};
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

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;
}
