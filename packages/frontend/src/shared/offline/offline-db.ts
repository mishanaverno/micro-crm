import Dexie, { Table } from 'dexie';
import { ClientDraft, ClientRecord } from '../types/client';

export interface QueuedMutation {
  id?: number;
  entity: 'client';
  operation: 'create';
  payload: ClientDraft;
  created_at: string;
  status: 'pending' | 'processing' | 'failed';
  retry_count: number;
  error_message?: string;
}

export interface OfflineClientRecord extends ClientRecord {
  queued_mutation_id?: number;
}

class OfflineDatabase extends Dexie {
  queued_mutations!: Table<QueuedMutation, number>;
  clients!: Table<OfflineClientRecord, string>;

  constructor() {
    super('project-crm-offline');

    this.version(1).stores({
      queued_mutations: '++id, entity, operation, status, created_at',
      clients: 'id, email, sync_status, created_at',
    });
  }
}

export const offlineDb = new OfflineDatabase();
