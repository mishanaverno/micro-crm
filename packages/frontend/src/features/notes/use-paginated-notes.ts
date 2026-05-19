import { useQuery } from '@tanstack/react-query';
import { fetchPaginatedNotesRequest } from '../../shared/api/notes';
import { PaginationParams } from '../../shared/types/pagination';
import { useAuth } from '../auth/auth-provider';

export function usePaginatedNotes(pagination: PaginationParams) {
  const { access_token } = useAuth();

  return useQuery({
    queryKey: ['notes', 'paginated', pagination],
    queryFn: async () => {
      if (!access_token) {
        throw new Error('Authentication is required to load notes.');
      }

      return fetchPaginatedNotesRequest(access_token, pagination);
    },
    enabled: Boolean(access_token),
  });
}
