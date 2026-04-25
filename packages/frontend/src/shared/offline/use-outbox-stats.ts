import { useLiveQuery } from 'dexie-react-hooks';
import { offlineDb } from './offline-db';

export function useOutboxStats() {
  return useLiveQuery(async () => {
    const pending_count = await offlineDb.queued_mutations
      .where('status')
      .anyOf('pending', 'failed', 'processing')
      .count();

    const failed_count = await offlineDb.queued_mutations.where('status').equals('failed').count();

    return {
      pending_count,
      failed_count,
    };
  }, []);
}
