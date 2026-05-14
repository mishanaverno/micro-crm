import { OfflineRecord } from './common';

export type OrderStatus = 'created' | 'inprogress' | 'done';

export interface OrderDraft {
  client_id: string;
  price: number;
  content: string;
  status: OrderStatus;
}

export interface OrderRecord extends OfflineRecord, OrderDraft {
  id: string;
}
