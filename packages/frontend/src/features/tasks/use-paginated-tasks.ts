import { useQuery } from '@tanstack/react-query';
import { fetchPaginatedTasksRequest } from '../../shared/api/tasks';
import { PaginationParams } from '../../shared/types/pagination';
import { useAuth } from '../auth/auth-provider';

export function usePaginatedTasks(pagination: PaginationParams) {
  const { access_token } = useAuth();

  return useQuery({
    queryKey: ['tasks', 'paginated', pagination],
    queryFn: async () => {
      if (!access_token) {
        throw new Error('Authentication is required to load tasks.');
      }

      return fetchPaginatedTasksRequest(access_token, pagination);
    },
    enabled: Boolean(access_token),
  });
}
