import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { createPaidRequest } from '../../shared/api/paids';
import { PaidDraft } from '../../shared/types/paid';

export function useCreatePaid() {
  const queryClient = useQueryClient();
  const { access_token } = useAuth();

  return useMutation({
    mutationKey: ['paids', 'create'],
    mutationFn: async (payload: PaidDraft) => {
      if (!access_token) {
        throw new Error('Authentication is required to create a paid record.');
      }

      return createPaidRequest(payload, access_token);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['paids'] });
      await queryClient.invalidateQueries({ queryKey: ['finances'] });
      await queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
