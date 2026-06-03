import { useQuery } from '@tanstack/react-query';
import { fetchPaginatedTasksRequest } from '../../shared/api/tasks';
import { PaginationParams } from '../../shared/types/pagination';
import { useAuth } from '../auth/auth-provider';

interface TasksSortOptions {
  sortBy?: 'created_at' | 'updated_at' | 'deadline';
  sortDirection?: 'asc' | 'desc';
}

export function usePaginatedTasks(
  pagination: PaginationParams,
  sort: TasksSortOptions = {},
) {
  const { access_token } = useAuth();

  return useQuery({
    queryKey: ['tasks', 'paginated', pagination, sort],
    queryFn: async () => {
      if (!access_token) {
        throw new Error('Authentication is required to load tasks.');
      }

      return fetchPaginatedTasksRequest(access_token, pagination, undefined, sort);
    },
    enabled: Boolean(access_token),
  });
}
