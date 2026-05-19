import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { updatePaidRequest } from '../../shared/api/paids';
import { PaidDraft, PaidRecord } from '../../shared/types/paid';

interface UpdatePaidInput {
  paidId: string;
  payload: Partial<PaidDraft>;
}

export function useUpdatePaid() {
  const queryClient = useQueryClient();
  const { access_token } = useAuth();

  return useMutation({
    mutationKey: ['paids', 'update'],
    mutationFn: async ({ paidId, payload }: UpdatePaidInput) => {
      if (!access_token) {
        throw new Error('Authentication is required to update a paid record.');
      }

      return updatePaidRequest(paidId, payload, access_token);
    },
    onSuccess: async (updatedPaid) => {
      queryClient.setQueryData<PaidRecord[]>(['paids'], (currentPaids) => {
        if (!currentPaids) {
          return currentPaids;
        }

        return currentPaids.map((paid) => (paid.id === updatedPaid.id ? updatedPaid : paid));
      });

      await queryClient.invalidateQueries({ queryKey: ['paids'] });
      await queryClient.invalidateQueries({ queryKey: ['finances'] });
      await queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
