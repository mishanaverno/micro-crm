import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { fetchOrdersRequest } from '../../shared/api/orders';

export function useOrders() {
  const { access_token } = useAuth();

  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!access_token) {
        throw new Error('Authentication is required to load orders.');
      }

      return fetchOrdersRequest(access_token);
    },
    enabled: Boolean(access_token),
  });
}
