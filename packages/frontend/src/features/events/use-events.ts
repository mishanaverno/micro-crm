import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { fetchEventsRequest } from '../../shared/api/events';

export function useEvents(limit = 50) {
  const { access_token } = useAuth();

  return useQuery({
    queryKey: ['events', limit],
    queryFn: async () => {
      if (!access_token) {
        throw new Error('Authentication is required to load events.');
      }

      return fetchEventsRequest(access_token, limit);
    },
    enabled: Boolean(access_token),
  });
}
