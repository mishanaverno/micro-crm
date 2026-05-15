import { OfflineRecord } from './common';

export interface SpentDraft {
  client_id: string;
  order_id: number;
  value: number;
}

export interface SpentRecord extends OfflineRecord, SpentDraft {
  id: string;
  user_id?: string;
}
