import { useQuery } from '@tanstack/react-query';
import { fetchPaginatedClientsRequest } from '../../shared/api/clients';
import { PaginationParams } from '../../shared/types/pagination';
import { useAuth } from '../auth/auth-provider';

export function usePaginatedClients(pagination: PaginationParams) {
  const { access_token } = useAuth();

  return useQuery({
    queryKey: ['clients', 'paginated', pagination],
    queryFn: async () => {
      if (!access_token) {
        throw new Error('Authentication is required to load clients.');
      }

      return fetchPaginatedClientsRequest(access_token, pagination);
    },
    enabled: Boolean(access_token),
  });
}
