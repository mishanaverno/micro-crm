import { ClientDraft, ClientRecord } from '../types/client';
import { httpRequest } from './http';

export async function createClientRequest(payload: ClientDraft, accessToken: string) {
  return httpRequest<ClientRecord>({
    path: '/clients',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}
