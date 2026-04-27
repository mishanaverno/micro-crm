import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { ClientDraft } from '../../shared/types/client';
import { updateClientRequest } from '../../shared/api/clients';

interface UpdateClientInput {
  clientId: string;
  payload: ClientDraft;
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  const { access_token } = useAuth();

  return useMutation({
    mutationKey: ['clients', 'update'],
    mutationFn: async ({ clientId, payload }: UpdateClientInput) => {
      if (!access_token) {
        throw new Error('Authentication is required to update a client.');
      }

      return updateClientRequest(clientId, payload, access_token);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
