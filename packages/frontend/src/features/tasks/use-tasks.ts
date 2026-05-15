import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { fetchTasksRequest } from '../../shared/api/tasks';

export function useTasks() {
  const { access_token } = useAuth();

  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      if (!access_token) {
        throw new Error('Authentication is required to load tasks.');
      }

      return fetchTasksRequest(access_token);
    },
    enabled: Boolean(access_token),
  });
}
