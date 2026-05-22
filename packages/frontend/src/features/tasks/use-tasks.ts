import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { fetchTasksRequest } from '../../shared/api/tasks';

interface UseTasksOptions {
  clientId?: string;
}

export function useTasks(options: UseTasksOptions = {}) {
  const { access_token } = useAuth();
  const { clientId } = options;

  return useQuery({
    queryKey: ['tasks', { clientId: clientId ?? null }],
    queryFn: async () => {
      if (!access_token) {
        throw new Error('Authentication is required to load tasks.');
      }

      return fetchTasksRequest(access_token, { clientId });
    },
    enabled: Boolean(access_token) && (clientId !== undefined ? Boolean(clientId) : true),
  });
}
