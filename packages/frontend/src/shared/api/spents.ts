import { httpRequest } from './http';
import { SpentDraft, SpentRecord } from '../types/spent';

interface ApiSpentRecord extends Omit<SpentRecord, 'id' | 'sync_status'> {
  id: number | string;
  sync_status?: SpentRecord['sync_status'];
}

function toSpentRecord(spent: ApiSpentRecord): SpentRecord {
  return {
    ...spent,
    id: String(spent.id),
    value: Number(spent.value),
    sync_status: spent.sync_status ?? 'synced',
    updated_at: spent.updated_at ?? spent.created_at,
  };
}

export async function fetchSpentsRequest(accessToken: string) {
  const spents = await httpRequest<ApiSpentRecord[]>({
    path: '/spents',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return spents.map(toSpentRecord);
}

export async function createSpentRequest(payload: SpentDraft, accessToken: string) {
  const spent = await httpRequest<ApiSpentRecord>({
    path: '/spents',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  return toSpentRecord(spent);
}

export async function updateSpentRequest(
  spentId: string,
  payload: Partial<SpentDraft>,
  accessToken: string,
) {
  const spent = await httpRequest<ApiSpentRecord>({
    path: `/spents/${spentId}`,
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  return toSpentRecord(spent);
}

export async function deleteSpentRequest(spentId: string, accessToken: string) {
  return httpRequest<SpentRecord>({
    path: `/spents/${spentId}`,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
