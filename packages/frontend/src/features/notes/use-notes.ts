import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { fetchNotesRequest } from '../../shared/api/notes';

interface UseNotesOptions {
  clientId?: string;
}

export function useNotes(options: UseNotesOptions = {}) {
  const { access_token } = useAuth();
  const { clientId } = options;

  return useQuery({
    queryKey: ['notes', { clientId: clientId ?? null }],
    queryFn: async () => {
      if (!access_token) {
        throw new Error('Authentication is required to load notes.');
      }

      return fetchNotesRequest(access_token, { clientId });
    },
    enabled: Boolean(access_token) && (clientId !== undefined ? Boolean(clientId) : true),
  });
}
