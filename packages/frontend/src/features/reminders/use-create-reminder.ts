import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { createReminderRequest } from '../../shared/api/reminders';
import { ReminderDraft } from '../../shared/types/reminder';

export function useCreateReminder() {
  const queryClient = useQueryClient();
  const { access_token } = useAuth();

  return useMutation({
    mutationKey: ['reminders', 'create'],
    mutationFn: async (payload: ReminderDraft) => {
      if (!access_token) {
        throw new Error('Authentication is required to create a reminder.');
      }

      return createReminderRequest(payload, access_token);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['reminders'] });
      await queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
