import { useQuery } from '@tanstack/react-query';
import { fetchPaginatedFinancesRequest } from '../../shared/api/finances';
import { PaginationParams } from '../../shared/types/pagination';
import { useAuth } from '../auth/auth-provider';

export function usePaginatedFinances(pagination: PaginationParams) {
  const { access_token } = useAuth();

  return useQuery({
    queryKey: ['finances', 'paginated', pagination],
    queryFn: async () => {
      if (!access_token) {
        throw new Error('Authentication is required to load finance records.');
      }

      return fetchPaginatedFinancesRequest(access_token, pagination);
    },
    enabled: Boolean(access_token),
  });
}
