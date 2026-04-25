import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClientRequest } from '../../shared/api/clients';
import { NetworkError } from '../../shared/api/http';
import { queueClientCreate } from '../../shared/offline/offline-clients';
import { ClientDraft } from '../../shared/types/client';

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['clients', 'create'],
    mutationFn: async (payload: ClientDraft) => {
      try {
        return await createClientRequest(payload);
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
