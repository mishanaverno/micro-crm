import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { updateOrderRequest } from '../../shared/api/orders';
import { OrderRecord, UpdateOrderDraft } from '../../shared/types/order';

interface UpdateOrderInput {
  orderId: string;
  payload: UpdateOrderDraft;
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  const { access_token } = useAuth();

  return useMutation({
    mutationKey: ['orders', 'update'],
    mutationFn: async ({ orderId, payload }: UpdateOrderInput) => {
      if (!access_token) {
        throw new Error('Authentication is required to update an order.');
      }

      return updateOrderRequest(orderId, payload, access_token);
    },
    onSuccess: async (updatedOrder) => {
      queryClient.setQueryData<OrderRecord[]>(['orders'], (currentOrders) => {
        if (!currentOrders) {
          return currentOrders;
        }

        return currentOrders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order,
        );
      });

      await queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
