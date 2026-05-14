import { httpRequest } from './http';
import { EventRecord } from '../types/event';

export async function fetchEventsRequest(accessToken: string, limit = 50) {
  return httpRequest<EventRecord[]>({
    path: `/events?limit=${limit}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function updateEventCommentRequest(
  eventId: number,
  comment: string | null,
  accessToken: string,
) {
  return httpRequest<EventRecord>({
    path: `/events/${eventId}/comment`,
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ comment }),
  });
}
