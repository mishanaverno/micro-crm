import { useQuery } from '@tanstack/react-query';
import { fetchPaginatedClientsRequest } from '../../shared/api/clients';
import { PaginationParams } from '../../shared/types/pagination';
import { useAuth } from '../auth/auth-provider';

interface ClientsSortOptions {
  sortBy?: 'created_at' | 'updated_at' | 'name' | 'company';
  sortDirection?: 'asc' | 'desc';
}

export function usePaginatedClients(
  pagination: PaginationParams,
  sort: ClientsSortOptions = {},
) {
  const { access_token } = useAuth();

  return useQuery({
    queryKey: ['clients', 'paginated', pagination, sort],
    queryFn: async () => {
      if (!access_token) {
        throw new Error('Authentication is required to load clients.');
      }

      return fetchPaginatedClientsRequest(access_token, pagination, sort);
    },
    enabled: Boolean(access_token),
  });
}
