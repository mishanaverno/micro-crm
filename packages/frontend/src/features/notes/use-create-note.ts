import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { createNoteRequest } from '../../shared/api/notes';
import { NoteDraft } from '../../shared/types/note';

export function useCreateNote() {
  const queryClient = useQueryClient();
  const { access_token } = useAuth();

  return useMutation({
    mutationKey: ['notes', 'create'],
    mutationFn: async (payload: NoteDraft) => {
      if (!access_token) {
        throw new Error('Authentication is required to create a note.');
      }

      return createNoteRequest(payload, access_token);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}
