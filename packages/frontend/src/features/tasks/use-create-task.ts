import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { createTaskRequest } from '../../shared/api/tasks';
import { TaskDraft } from '../../shared/types/task';

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { access_token } = useAuth();

  return useMutation({
    mutationKey: ['tasks', 'create'],
    mutationFn: async (payload: TaskDraft) => {
      if (!access_token) {
        throw new Error('Authentication is required to create a task.');
      }

      return createTaskRequest(payload, access_token);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      await queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
