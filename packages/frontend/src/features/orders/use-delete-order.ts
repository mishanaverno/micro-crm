import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { deleteOrderRequest } from '../../shared/api/orders';

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  const { access_token } = useAuth();

  return useMutation({
    mutationKey: ['orders', 'delete'],
    mutationFn: async (orderId: string) => {
      if (!access_token) {
        throw new Error('Authentication is required to delete an order.');
      }

      return deleteOrderRequest(orderId, access_token);
    },
    onSuccess: async (_, orderId) => {
      queryClient.removeQueries({ queryKey: ['orders', 'detail', orderId] });
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      await queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
