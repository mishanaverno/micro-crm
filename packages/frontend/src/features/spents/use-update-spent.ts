import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { updateSpentRequest } from '../../shared/api/spents';
import { SpentDraft, SpentRecord } from '../../shared/types/spent';

interface UpdateSpentInput {
  spentId: string;
  payload: Partial<SpentDraft>;
}

export function useUpdateSpent() {
  const queryClient = useQueryClient();
  const { access_token } = useAuth();

  return useMutation({
    mutationKey: ['spents', 'update'],
    mutationFn: async ({ spentId, payload }: UpdateSpentInput) => {
      if (!access_token) {
        throw new Error('Authentication is required to update a spent record.');
      }

      return updateSpentRequest(spentId, payload, access_token);
    },
    onSuccess: async (updatedSpent) => {
      queryClient.setQueryData<SpentRecord[]>(['spents'], (currentSpents) => {
        if (!currentSpents) {
          return currentSpents;
        }

        return currentSpents.map((spent) =>
          spent.id === updatedSpent.id ? updatedSpent : spent,
        );
      });

      await queryClient.invalidateQueries({ queryKey: ['spents'] });
      await queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
