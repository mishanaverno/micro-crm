import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { updateNoteRequest } from '../../shared/api/notes';
import { NoteDraft, NoteRecord } from '../../shared/types/note';

interface UpdateNoteInput {
  noteId: string;
  payload: NoteDraft;
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  const { access_token } = useAuth();

  return useMutation({
    mutationKey: ['notes', 'update'],
    mutationFn: async ({ noteId, payload }: UpdateNoteInput) => {
      if (!access_token) {
        throw new Error('Authentication is required to update a note.');
      }

      return updateNoteRequest(noteId, payload, access_token);
    },
    onSuccess: async (updatedNote) => {
      queryClient.setQueryData<NoteRecord[]>(['notes'], (currentNotes) => {
        if (!currentNotes) {
          return currentNotes;
        }

        return currentNotes.map((note) =>
          note.id === updatedNote.id ? updatedNote : note,
        );
      });

      await queryClient.invalidateQueries({ queryKey: ['notes'] });
      await queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
