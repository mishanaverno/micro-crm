import { useQuery } from '@tanstack/react-query';
import { fetchPaginatedClientsRequest } from '../../shared/api/clients';
import { PaginationParams } from '../../shared/types/pagination';
import { useAuth } from '../auth/auth-provider';

interface ClientsSortOptions {
  sortBy?: 'created_at' | 'updated_at' | 'name' | 'company';
  sortDirection?: 'asc' | 'desc';
}

interface ClientsFilterOptions {
  orderState?: 'open_orders';
}

export function usePaginatedClients(
  pagination: PaginationParams,
  sort: ClientsSortOptions = {},
  filters: ClientsFilterOptions = {},
) {
  const { access_token } = useAuth();

  return useQuery({
    queryKey: ['clients', 'paginated', pagination, sort, filters],
    queryFn: async () => {
      if (!access_token) {
        throw new Error('Authentication is required to load clients.');
      }

      return fetchPaginatedClientsRequest(access_token, pagination, sort, filters);
    },
    enabled: Boolean(access_token),
  });
}
