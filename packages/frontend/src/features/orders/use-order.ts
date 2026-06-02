import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { fetchOrderRequest } from '../../shared/api/orders';

export function useOrder(orderId?: string) {
  const { access_token } = useAuth();

  return useQuery({
    queryKey: ['orders', 'detail', orderId ?? null],
    queryFn: async () => {
      if (!access_token) {
        throw new Error('Authentication is required to load an order.');
      }

      if (!orderId) {
        throw new Error('Order ID is required to load order details.');
      }

      return fetchOrderRequest(orderId, access_token);
    },
    enabled: Boolean(access_token && orderId),
  });
}
