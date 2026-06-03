import { useQuery } from '@tanstack/react-query';
import { fetchPaginatedNotesRequest } from '../../shared/api/notes';
import { PaginationParams } from '../../shared/types/pagination';
import { useAuth } from '../auth/auth-provider';

interface NotesSortOptions {
  sortBy?: 'created_at' | 'updated_at';
  sortDirection?: 'asc' | 'desc';
}

export function usePaginatedNotes(
  pagination: PaginationParams,
  sort: NotesSortOptions = {},
) {
  const { access_token } = useAuth();

  return useQuery({
    queryKey: ['notes', 'paginated', pagination, sort],
    queryFn: async () => {
      if (!access_token) {
        throw new Error('Authentication is required to load notes.');
      }

      return fetchPaginatedNotesRequest(access_token, pagination, undefined, sort);
    },
    enabled: Boolean(access_token),
  });
}
