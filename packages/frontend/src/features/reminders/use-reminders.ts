import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { fetchRemindersRequest } from '../../shared/api/reminders';

interface UseRemindersOptions {
  clientId?: string;
}

export function useReminders(options: UseRemindersOptions = {}) {
  const { access_token } = useAuth();
  const { clientId } = options;

  return useQuery({
    queryKey: ['reminders', { clientId: clientId ?? null }],
    queryFn: async () => {
      if (!access_token) {
        throw new Error('Authentication is required to load reminders.');
      }

      return fetchRemindersRequest(access_token, { clientId });
    },
    enabled: Boolean(access_token) && (clientId !== undefined ? Boolean(clientId) : true),
  });
}
