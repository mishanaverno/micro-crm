import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { deleteSpentRequest } from '../../shared/api/spents';

export function useDeleteSpent() {
  const queryClient = useQueryClient();
  const { access_token } = useAuth();

  return useMutation({
    mutationKey: ['spents', 'delete'],
    mutationFn: async (spentId: string) => {
      if (!access_token) {
        throw new Error('Authentication is required to delete a spent record.');
      }

      return deleteSpentRequest(spentId, access_token);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['spents'] });
    },
  });
}
