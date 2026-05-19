import { useQuery } from '@tanstack/react-query';
import { fetchPaginatedOrdersRequest } from '../../shared/api/orders';
import { PaginationParams } from '../../shared/types/pagination';
import { useAuth } from '../auth/auth-provider';

export function usePaginatedOrders(pagination: PaginationParams) {
  const { access_token } = useAuth();

  return useQuery({
    queryKey: ['orders', 'paginated', pagination],
    queryFn: async () => {
      if (!access_token) {
        throw new Error('Authentication is required to load orders.');
      }

      return fetchPaginatedOrdersRequest(access_token, pagination);
    },
    enabled: Boolean(access_token),
  });
}
