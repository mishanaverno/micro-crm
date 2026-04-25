import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { flushOutbox } from './outbox';
import { useNetworkStatus } from '../lib/network';

export function useOutboxAutoFlush() {
  const queryClient = useQueryClient();
  const isOnline = useNetworkStatus();
  const [isFlushing, setIsFlushing] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      return;
    }

    let isCancelled = false;

    async function run() {
      setIsFlushing(true);

      try {
        const result = await flushOutbox();

        if (!isCancelled && result.processed > 0) {
          await queryClient.invalidateQueries({ queryKey: ['clients'] });
        }
      } finally {
        if (!isCancelled) {
          setIsFlushing(false);
        }
      }
    }

    void run();

    return () => {
      isCancelled = true;
    };
  }, [isOnline, queryClient]);

  return {
    is_online: isOnline,
    is_flushing: isFlushing,
  };
}
