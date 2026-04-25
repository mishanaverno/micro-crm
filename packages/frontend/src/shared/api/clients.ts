import { ClientDraft, ClientRecord } from '../types/client';
import { httpRequest } from './http';

export async function createClientRequest(payload: ClientDraft) {
  return httpRequest<ClientRecord>({
    path: '/clients',
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
