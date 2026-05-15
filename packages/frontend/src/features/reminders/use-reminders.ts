import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { fetchRemindersRequest } from '../../shared/api/reminders';

export function useReminders() {
  const { access_token } = useAuth();

  return useQuery({
    queryKey: ['reminders'],
    queryFn: async () => {
      if (!access_token) {
        throw new Error('Authentication is required to load reminders.');
      }

      return fetchRemindersRequest(access_token);
    },
    enabled: Boolean(access_token),
  });
}
