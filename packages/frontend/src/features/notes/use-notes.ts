import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { fetchNotesRequest } from '../../shared/api/notes';

export function useNotes() {
  const { access_token } = useAuth();

  return useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      if (!access_token) {
        throw new Error('Authentication is required to load notes.');
      }

      return fetchNotesRequest(access_token);
    },
    enabled: Boolean(access_token),
  });
}
