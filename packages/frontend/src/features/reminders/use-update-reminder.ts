import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { updateReminderRequest } from '../../shared/api/reminders';
import { ReminderDraft, ReminderRecord } from '../../shared/types/reminder';

interface UpdateReminderInput {
  reminderId: string;
  payload: ReminderDraft;
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();
  const { access_token } = useAuth();

  return useMutation({
    mutationKey: ['reminders', 'update'],
    mutationFn: async ({ reminderId, payload }: UpdateReminderInput) => {
      if (!access_token) {
        throw new Error('Authentication is required to update a reminder.');
      }

      return updateReminderRequest(reminderId, payload, access_token);
    },
    onSuccess: async (updatedReminder) => {
      queryClient.setQueriesData({ queryKey: ['reminders'] }, (currentReminders) => {
        if (!Array.isArray(currentReminders)) {
          return currentReminders;
        }

        return (currentReminders as ReminderRecord[]).map((reminder) =>
          reminder.id === updatedReminder.id ? updatedReminder : reminder,
        );
      });

      await queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}
