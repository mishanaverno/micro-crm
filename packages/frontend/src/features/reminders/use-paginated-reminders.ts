import { useQuery } from '@tanstack/react-query';
import { fetchPaginatedRemindersRequest } from '../../shared/api/reminders';
import { PaginationParams } from '../../shared/types/pagination';
import { useAuth } from '../auth/auth-provider';

interface RemindersSortOptions {
  sortBy?: 'created_at' | 'updated_at' | 'timestamp';
  sortDirection?: 'asc' | 'desc';
}

export function usePaginatedReminders(
  pagination: PaginationParams,
  sort: RemindersSortOptions = {},
) {
  const { access_token } = useAuth();

  return useQuery({
    queryKey: ['reminders', 'paginated', pagination, sort],
    queryFn: async () => {
      if (!access_token) {
        throw new Error('Authentication is required to load reminders.');
      }

      return fetchPaginatedRemindersRequest(access_token, pagination, undefined, sort);
    },
    enabled: Boolean(access_token),
  });
}
