import { httpRequest } from './http';
import { PaidDraft, PaidRecord } from '../types/paid';

interface ApiPaidRecord extends Omit<PaidRecord, 'id' | 'sync_status'> {
  id: number | string;
  sync_status?: PaidRecord['sync_status'];
}

function toPaidRecord(paid: ApiPaidRecord): PaidRecord {
  return {
    ...paid,
    id: String(paid.id),
    value: Number(paid.value),
    sync_status: paid.sync_status ?? 'synced',
    updated_at: paid.updated_at ?? paid.created_at,
  };
}

export async function fetchPaidsRequest(accessToken: string) {
  const paids = await httpRequest<ApiPaidRecord[]>({
    path: '/paids',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return paids.map(toPaidRecord);
}

export async function createPaidRequest(payload: PaidDraft, accessToken: string) {
  const paid = await httpRequest<ApiPaidRecord>({
    path: '/paids',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  return toPaidRecord(paid);
}

export async function updatePaidRequest(
  paidId: string,
  payload: Partial<PaidDraft>,
  accessToken: string,
) {
  const paid = await httpRequest<ApiPaidRecord>({
    path: `/paids/${paidId}`,
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  return toPaidRecord(paid);
}

export async function deletePaidRequest(paidId: string, accessToken: string) {
  return httpRequest<PaidRecord>({
    path: `/paids/${paidId}`,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
