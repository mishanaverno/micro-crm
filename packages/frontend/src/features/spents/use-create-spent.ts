import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { createSpentRequest } from '../../shared/api/spents';
import { SpentDraft } from '../../shared/types/spent';

export function useCreateSpent() {
  const queryClient = useQueryClient();
  const { access_token } = useAuth();

  return useMutation({
    mutationKey: ['spents', 'create'],
    mutationFn: async (payload: SpentDraft) => {
      if (!access_token) {
        throw new Error('Authentication is required to create a spent record.');
      }

      return createSpentRequest(payload, access_token);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['spents'] });
    },
  });
}
