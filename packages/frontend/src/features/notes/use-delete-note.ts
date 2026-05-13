import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { deleteNoteRequest } from '../../shared/api/notes';

export function useDeleteNote() {
  const queryClient = useQueryClient();
  const { access_token } = useAuth();

  return useMutation({
    mutationKey: ['notes', 'delete'],
    mutationFn: async (noteId: string) => {
      if (!access_token) {
        throw new Error('Authentication is required to delete a note.');
      }

      return deleteNoteRequest(noteId, access_token);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}
