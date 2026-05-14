import { OfflineRecord } from './common';

export interface NoteDraft {
  client_id: string;
  content: string;
  order_id?: number | null;
}

export interface NoteRecord extends OfflineRecord, NoteDraft {
  id: string;
  user_id?: string;
}
