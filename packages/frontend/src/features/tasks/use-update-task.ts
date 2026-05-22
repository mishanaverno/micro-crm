import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { updateTaskRequest } from '../../shared/api/tasks';
import { TaskDraft, TaskRecord } from '../../shared/types/task';

interface UpdateTaskInput {
  taskId: string;
  payload: TaskDraft;
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { access_token } = useAuth();

  return useMutation({
    mutationKey: ['tasks', 'update'],
    mutationFn: async ({ taskId, payload }: UpdateTaskInput) => {
      if (!access_token) {
        throw new Error('Authentication is required to update a task.');
      }

      return updateTaskRequest(taskId, payload, access_token);
    },
    onSuccess: async (updatedTask) => {
      queryClient.setQueriesData({ queryKey: ['tasks'] }, (currentTasks) => {
        if (!Array.isArray(currentTasks)) {
          return currentTasks;
        }

        return (currentTasks as TaskRecord[]).map((task) =>
          task.id === updatedTask.id ? updatedTask : task,
        );
      });

      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      await queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
