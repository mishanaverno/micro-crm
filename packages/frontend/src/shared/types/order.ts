import { OfflineRecord } from './common';

export type OrderStatus = 'created' | 'inprogress' | 'done' | 'reopened';

export interface OrderDraft {
  client_id: string;
  title?: string | null;
  price: number;
  content: string;
  status: OrderStatus;
}

export interface UpdateOrderDraft extends Omit<OrderDraft, 'client_id'> {}

export interface OrderRecord extends OfflineRecord, OrderDraft {
  id: string;
}
