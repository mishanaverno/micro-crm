import { PrunePayload } from "vite";

export type OfflineStatus = 'synced' | 'pending' | 'failed';
export interface OfflineRecord {
  id: string;
  sync_status: OfflineStatus;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  queued_mutation_id?: number;
}
export interface OfflineRespository<P extends {}, R extends OfflineRecord> {
    createLocal: (payload: P) => R
    markSynced: ()
}