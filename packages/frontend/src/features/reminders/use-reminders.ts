import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { fetchRemindersRequest } from '../../shared/api/reminders';

interface UseRemindersOptions {
  clientId?: string;
  orderId?: string;
}

export function useReminders(options: UseRemindersOptions = {}) {
  const { access_token } = useAuth();
  const { clientId, orderId } = options;

  return useQuery({
    queryKey: ['reminders', { clientId: clientId ?? null, orderId: orderId ?? null }],
    queryFn: async () => {
      if (!access_token) {
        throw new Error('Authentication is required to load reminders.');
      }

      return fetchRemindersRequest(access_token, { clientId, orderId });
    },
    enabled:
      Boolean(access_token) &&
      (clientId !== undefined ? Boolean(clientId) : true) &&
      (orderId !== undefined ? Boolean(orderId) : true),
  });
}
