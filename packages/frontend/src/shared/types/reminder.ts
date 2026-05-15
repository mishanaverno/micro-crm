import { OfflineRecord } from './common';

export interface ReminderDraft {
  client_id: string;
  content: string;
  timestamp: string;
  order_id?: number | null;
}

export interface ReminderRecord extends OfflineRecord, ReminderDraft {
  id: string;
  user_id?: string;
}
