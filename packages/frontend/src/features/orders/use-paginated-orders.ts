import { useQuery } from '@tanstack/react-query';
import { fetchPaginatedOrdersRequest } from '../../shared/api/orders';
import { PaginationParams } from '../../shared/types/pagination';
import { useAuth } from '../auth/auth-provider';

interface OrdersSortOptions {
  sortBy?: 'created_at' | 'updated_at' | 'price' | 'status';
  sortDirection?: 'asc' | 'desc';
}

export function usePaginatedOrders(
  pagination: PaginationParams,
  sort: OrdersSortOptions = {},
) {
  const { access_token } = useAuth();

  return useQuery({
    queryKey: ['orders', 'paginated', pagination, sort],
    queryFn: async () => {
      if (!access_token) {
        throw new Error('Authentication is required to load orders.');
      }

      return fetchPaginatedOrdersRequest(access_token, pagination, undefined, sort);
    },
    enabled: Boolean(access_token),
  });
}
