import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClientRequest } from '../../shared/api/clients';
import { NetworkError } from '../../shared/api/http';
import { useAuth } from '../auth/auth-provider';
import { queueClientCreate } from '../../shared/offline/offline-clients.deprecated';
import { ClientDraft } from '../../shared/types/client';

export function useCreateClient() {
  const queryClient = useQueryClient();
  const { access_token } = useAuth();

  return useMutation({
    mutationKey: ['clients', 'create'],
    mutationFn: async (payload: ClientDraft) => {
      if (!access_token) {
        throw new Error('Authentication is required to create a client.');
      }

      try {
        return await createClientRequest(payload, access_token);
      } catch (error) {
        if (error instanceof NetworkError) {
          return queueClientCreate(payload);
        }

        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
