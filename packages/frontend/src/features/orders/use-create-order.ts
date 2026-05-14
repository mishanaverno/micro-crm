import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { createOrderRequest } from '../../shared/api/orders';
import { OrderDraft } from '../../shared/types/order';

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { access_token } = useAuth();

  return useMutation({
    mutationKey: ['orders', 'create'],
    mutationFn: async (payload: OrderDraft) => {
      if (!access_token) {
        throw new Error('Authentication is required to create an order.');
      }

      return createOrderRequest(payload, access_token);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
