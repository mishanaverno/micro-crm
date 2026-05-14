import { OfflineRecord } from './common';

export interface PaidDraft {
  client_id: string;
  order_id: number;
  value: number;
}

export interface PaidRecord extends OfflineRecord, PaidDraft {
  id: string;
  user_id?: string;
}
