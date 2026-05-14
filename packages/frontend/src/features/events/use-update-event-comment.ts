import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/auth-provider';
import { updateEventCommentRequest } from '../../shared/api/events';
import { EventRecord } from '../../shared/types/event';

interface UpdateEventCommentInput {
  eventId: number;
  comment: string | null;
}

export function useUpdateEventComment() {
  const queryClient = useQueryClient();
  const { access_token } = useAuth();

  return useMutation({
    mutationKey: ['events', 'comment'],
    mutationFn: async ({ eventId, comment }: UpdateEventCommentInput) => {
      if (!access_token) {
        throw new Error('Authentication is required to update event comment.');
      }

      return updateEventCommentRequest(eventId, comment, access_token);
    },
    onSuccess: async (updatedEvent) => {
      queryClient.setQueryData<EventRecord[]>(['events', 50], (currentEvents) => {
        if (!currentEvents) {
          return currentEvents;
        }

        return currentEvents.map((event) =>
          event.id === updatedEvent.id ? updatedEvent : event,
        );
      });

      await queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
