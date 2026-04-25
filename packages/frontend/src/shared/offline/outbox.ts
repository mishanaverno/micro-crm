import { createClientRequest } from '../api/clients';
import { HttpError, NetworkError } from '../api/http';
import { offlineDb, QueuedMutation } from './offline-db';
import { markClientFailed, markClientSynced } from './offline-clients';

async function processMutation(mutation: QueuedMutation & { id: number }) {
  await offlineDb.queued_mutations.update(mutation.id, {
    status: 'processing',
    retry_count: mutation.retry_count + 1,
    error_message: undefined,
  });

  if (mutation.entity === 'client' && mutation.operation === 'create') {
    const savedClient = await createClientRequest(mutation.payload);

    await markClientSynced(mutation.id, savedClient);
    await offlineDb.queued_mutations.delete(mutation.id);
  }
}

export async function flushOutbox() {
  if (!navigator.onLine) {
    return { processed: 0 };
  }

  const pending = await offlineDb.queued_mutations
    .where('status')
    .anyOf('pending', 'failed')
    .sortBy('created_at');

  let processed = 0;

  for (const mutation of pending) {
    if (!mutation.id) {
      continue;
    }

    try {
      await processMutation({ ...mutation, id: mutation.id });
      processed += 1;
    } catch (error) {
      if (error instanceof NetworkError) {
        await offlineDb.queued_mutations.update(mutation.id, {
          status: 'pending',
          error_message: error.message,
        });

        break;
      }

      if (error instanceof HttpError) {
        await markClientFailed(mutation.id, `${error.status}: ${error.message}`);
        continue;
      }

      await markClientFailed(
        mutation.id,
        error instanceof Error ? error.message : 'Unknown outbox replay error',
      );
    }
  }

  return { processed };
}
