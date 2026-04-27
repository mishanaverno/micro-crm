import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { deleteClientRequest } from '../../shared/api/clients';

export function useDeleteClient() {
  const queryClient = useQueryClient();
  const { access_token } = useAuth();

  return useMutation({
    mutationKey: ['clients', 'delete'],
    mutationFn: async (clientId: string) => {
      if (!access_token) {
        throw new Error('Authentication is required to delete a client.');
      }

      return deleteClientRequest(clientId, access_token);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
