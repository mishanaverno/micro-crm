import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { fetchNotesRequest } from '../../shared/api/notes';

interface UseNotesOptions {
  clientId?: string;
  orderId?: string;
}

export function useNotes(options: UseNotesOptions = {}) {
  const { access_token } = useAuth();
  const { clientId, orderId } = options;

  return useQuery({
    queryKey: ['notes', { clientId: clientId ?? null, orderId: orderId ?? null }],
    queryFn: async () => {
      if (!access_token) {
        throw new Error('Authentication is required to load notes.');
      }

      return fetchNotesRequest(access_token, { clientId, orderId });
    },
    enabled:
      Boolean(access_token) &&
      (clientId !== undefined ? Boolean(clientId) : true) &&
      (orderId !== undefined ? Boolean(orderId) : true),
  });
}
