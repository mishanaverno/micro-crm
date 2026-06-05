import { ClientDraft, ClientRecord } from '../types/client';
import { PaginatedResponse, PaginationParams } from '../types/pagination';
import { httpRequest } from './http';
import { toPaginationQuery } from './pagination';

interface ClientsSortOptions {
  sortBy?: 'created_at' | 'updated_at' | 'name' | 'company';
  sortDirection?: 'asc' | 'desc';
}

interface ClientsFilterOptions {
  orderState?: 'open_orders';
}

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

export async function fetchPaginatedClientsRequest(
  accessToken: string,
  pagination: PaginationParams,
  sort?: ClientsSortOptions,
  filters?: ClientsFilterOptions,
) {
  const params = new URLSearchParams(toPaginationQuery(pagination));

  if (sort?.sortBy) {
    params.set('sortBy', sort.sortBy);
  }

  if (sort?.sortDirection) {
    params.set('sortDirection', sort.sortDirection);
  }

  if (filters?.orderState) {
    params.set('orderState', filters.orderState);
  }

  const response = await httpRequest<PaginatedResponse<ApiClientRecord>>({
    path: `/clients?${params.toString()}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return {
    ...response,
    items: response.items.map(toClientRecord),
  };
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

export async function updateClientRequest(
  clientId: string,
  payload: ClientDraft,
  accessToken: string,
) {
  const client = await httpRequest<ApiClientRecord>({
    path: `/clients/${clientId}`,
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  return toClientRecord(client);
}

export async function deleteClientRequest(clientId: string, accessToken: string) {
  return httpRequest<ClientRecord>({
    path: `/clients/${clientId}`,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
