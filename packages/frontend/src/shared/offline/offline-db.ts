import Dexie, { Table } from 'dexie';
import { ClientRecord } from '../types/client';
import { Mutation } from '../types/mutation';
import { OfflineRecord } from '../types/common';

class OfflineDatabase extends Dexie {
  queued_mutations!: Table<Mutation, number>;
  clients!: Table<ClientRecord, string>;

  constructor() {
    super('project-crm-offline');

    this.version(1).stores({
      queued_mutations: '++id, entity, operation, created_at, status',
      clients: 'id, email, sync_status, created_at',
    });
  }
}

export const offlineDb = new OfflineDatabase();

export class OfflineRespository<D extends {}, R extends OfflineRecord> {
  createLocal = (draft: D): R => {
    return {
      id: crypto.randomUUID(),
      ...draft,
      sync_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as unknown as R
  }
}
