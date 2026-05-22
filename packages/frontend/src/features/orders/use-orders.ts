import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { fetchOrdersRequest } from '../../shared/api/orders';

interface UseOrdersOptions {
  clientId?: string;
}

export function useOrders(options: UseOrdersOptions = {}) {
  const { access_token } = useAuth();
  const { clientId } = options;

  return useQuery({
    queryKey: ['orders', { clientId: clientId ?? null }],
    queryFn: async () => {
      if (!access_token) {
        throw new Error('Authentication is required to load orders.');
      }

      return fetchOrdersRequest(access_token, { clientId });
    },
    enabled: Boolean(access_token) && (clientId !== undefined ? Boolean(clientId) : true),
  });
}
