import { useQuery } from '@tanstack/react-query';
import { fetchPaginatedFinancesRequest } from '../../shared/api/finances';
import { PaginationParams } from '../../shared/types/pagination';
import { useAuth } from '../auth/auth-provider';

interface FinancesSortOptions {
  sortBy?: 'created_at' | 'updated_at' | 'value';
  sortDirection?: 'asc' | 'desc';
}

export function usePaginatedFinances(
  pagination: PaginationParams,
  sort: FinancesSortOptions = {},
) {
  const { access_token } = useAuth();

  return useQuery({
    queryKey: ['finances', 'paginated', pagination, sort],
    queryFn: async () => {
      if (!access_token) {
        throw new Error('Authentication is required to load finance records.');
      }

      return fetchPaginatedFinancesRequest(access_token, pagination, sort);
    },
    enabled: Boolean(access_token),
  });
}
