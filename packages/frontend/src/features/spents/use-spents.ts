import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { fetchSpentsRequest } from '../../shared/api/spents';

export function useSpents() {
  const { access_token } = useAuth();

  return useQuery({
    queryKey: ['spents'],
    queryFn: async () => {
      if (!access_token) {
        throw new Error('Authentication is required to load spents.');
      }

      return fetchSpentsRequest(access_token);
    },
    enabled: Boolean(access_token),
  });
}
