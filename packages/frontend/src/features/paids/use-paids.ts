import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { fetchPaidsRequest } from '../../shared/api/paids';

export function usePaids() {
  const { access_token } = useAuth();

  return useQuery({
    queryKey: ['paids'],
    queryFn: async () => {
      if (!access_token) {
        throw new Error('Authentication is required to load paids.');
      }

      return fetchPaidsRequest(access_token);
    },
    enabled: Boolean(access_token),
  });
}
