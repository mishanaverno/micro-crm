import { ClientDraft, ClientRecord } from '../types/client';
import { httpRequest } from './http';

interface ApiClientRecord extends Omit<ClientRecord, 'sync_status'> {
  sync_status?: ClientRecord['sync_status'];
}

function toClientRecord(client: ApiClientRecord): ClientRecord {
  return {
    ...client,
    sync_status: client.sync_status ?? 'synced',
    updated_at: client.updated_at ?? client.created_at,
  };
}

export async function fetchClientsRequest(accessToken: string) {
  const clients = await httpRequest<ApiClientRecord[]>({
    path: '/clients',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return clients.map(toClientRecord);
}

export async function createClientRequest(payload: ClientDraft, accessToken: string) {
  const client = await httpRequest<ApiClientRecord>({
    path: '/clients',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  return toClientRecord(client);
}
