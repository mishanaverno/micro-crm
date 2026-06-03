import { useQuery } from '@tanstack/react-query';
import { fetchPaginatedTasksRequest } from '../../shared/api/tasks';
import { PaginationParams } from '../../shared/types/pagination';
import { useAuth } from '../auth/auth-provider';

interface TasksSortOptions {
  sortBy?: 'created_at' | 'updated_at' | 'deadline';
  sortDirection?: 'asc' | 'desc';
}

interface TasksFilterOptions {
  status?: 'pending' | 'complete';
}

export function usePaginatedTasks(
  pagination: PaginationParams,
  sort: TasksSortOptions = {},
  filters: TasksFilterOptions = {},
) {
  const { access_token } = useAuth();

  return useQuery({
    queryKey: ['tasks', 'paginated', pagination, sort, filters],
    queryFn: async () => {
      if (!access_token) {
        throw new Error('Authentication is required to load tasks.');
      }

      return fetchPaginatedTasksRequest(access_token, pagination, filters, sort);
    },
    enabled: Boolean(access_token),
  });
}
