import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { deleteReminderRequest } from '../../shared/api/reminders';

export function useDeleteReminder() {
  const queryClient = useQueryClient();
  const { access_token } = useAuth();

  return useMutation({
    mutationKey: ['reminders', 'delete'],
    mutationFn: async (reminderId: string) => {
      if (!access_token) {
        throw new Error('Authentication is required to delete a reminder.');
      }

      return deleteReminderRequest(reminderId, access_token);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}
