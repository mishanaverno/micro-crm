import { useLiveQuery } from 'dexie-react-hooks';
import { offlineDb } from '../../shared/offline/offline-db';

export function useOfflineClients() {
  return useLiveQuery(
    () => offlineDb.clients.orderBy('created_at').reverse().toArray(),
    [],
    [],
  );
}
