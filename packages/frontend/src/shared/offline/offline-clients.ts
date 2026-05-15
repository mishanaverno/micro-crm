import { offlineDb } from './offline-db';
import { ClientDraft, ClientRecord } from '../types/client';

function createLocalClient(payload: ClientDraft): ClientRecord {
  return {
    id: crypto.randomUUID(),
    ...payload,
    sync_status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function queueClientCreate(payload: ClientDraft) {
  const localClient = createLocalClient(payload);

  const queuedMutationId = await offlineDb.queued_mutations.add({
    entity: 'client',
    operation: 'create',
    payload,
    created_at: new Date().toISOString(),
    status: 'pending',
    retry_count: 0,
  });

  await offlineDb.clients.put({
    ...localClient,
    queued_mutation_id: queuedMutationId,
  });

  return localClient;
}

export async function markClientSynced(queuedMutationId: number, client: ClientRecord) {
  const localClient = await offlineDb.clients
    .where('queued_mutation_id')
    .equals(queuedMutationId)
    .first();

  if (localClient?.id) {
    await offlineDb.clients.delete(localClient.id);
  }

  await offlineDb.clients.put({
    ...client,
    sync_status: 'synced',
  });
}

export async function markClientFailed(queuedMutationId: number, message: string) {
  const localClient = await offlineDb.clients
    .where('queued_mutation_id')
    .equals(queuedMutationId)
    .first();

  if (!localClient) {
    return;
  }

  await offlineDb.clients.put({
    ...localClient,
    sync_status: 'failed',
  });

  await offlineDb.queued_mutations.update(queuedMutationId, {
    status: 'failed',
    error_message: message,
  });
}
