import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { deleteTaskRequest } from '../../shared/api/tasks';

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { access_token } = useAuth();

  return useMutation({
    mutationKey: ['tasks', 'delete'],
    mutationFn: async (taskId: string) => {
      if (!access_token) {
        throw new Error('Authentication is required to delete a task.');
      }

      return deleteTaskRequest(taskId, access_token);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
