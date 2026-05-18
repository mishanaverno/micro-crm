import { OfflineRecord } from './common';

export type TaskStatus = 'pending' | 'complete';

export interface TaskDraft {
  client_id: string;
  content: string;
  order_id?: number | null;
  status?: TaskStatus;
  deadline?: string | null;
}

export interface TaskRecord extends OfflineRecord, TaskDraft {
  id: string;
  user_id?: string;
  status: TaskStatus;
}
