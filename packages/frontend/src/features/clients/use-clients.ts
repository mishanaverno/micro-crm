import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { fetchClientsRequest } from '../../shared/api/clients';

export function useClients() {
  const { access_token } = useAuth();

  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      if (!access_token) {
        throw new Error('Authentication is required to load clients.');
      }

      return fetchClientsRequest(access_token);
    },
    enabled: Boolean(access_token),
  });
}
