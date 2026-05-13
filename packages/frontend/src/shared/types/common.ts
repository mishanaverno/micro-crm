export type OfflineStatus = 'synced' | 'pending' | 'failed';

export interface OfflineRecord {
  id: string;
  user_id?: string;
  sync_status: OfflineStatus;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  queued_mutation_id?: number;
}

export interface OfflineRespository<P extends object, R extends OfflineRecord> {
  createLocal: (payload: P) => R;
}
