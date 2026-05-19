import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { deletePaidRequest } from '../../shared/api/paids';

export function useDeletePaid() {
  const queryClient = useQueryClient();
  const { access_token } = useAuth();

  return useMutation({
    mutationKey: ['paids', 'delete'],
    mutationFn: async (paidId: string) => {
      if (!access_token) {
        throw new Error('Authentication is required to delete a paid record.');
      }

      return deletePaidRequest(paidId, access_token);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['paids'] });
      await queryClient.invalidateQueries({ queryKey: ['finances'] });
      await queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
