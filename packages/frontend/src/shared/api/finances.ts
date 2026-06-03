import { FinanceRecord } from '../types/finance';
import { PaginatedResponse, PaginationParams } from '../types/pagination';
import { httpRequest } from './http';
import { toPaginationQuery } from './pagination';

interface FinancesSortOptions {
  sortBy?: 'created_at' | 'updated_at' | 'value';
  sortDirection?: 'asc' | 'desc';
}

interface ApiFinanceRecord extends Omit<FinanceRecord, 'id' | 'value' | 'sync_status'> {
  id: number | string;
  value: number | string;
  sync_status?: FinanceRecord['sync_status'];
}

function toFinanceRecord(record: ApiFinanceRecord): FinanceRecord {
  return {
    ...record,
    id: String(record.id),
    value: Number(record.value),
    sync_status: record.sync_status ?? 'synced',
    updated_at: record.updated_at ?? record.created_at,
  } as FinanceRecord;
}

export async function fetchPaginatedFinancesRequest(
  accessToken: string,
  pagination: PaginationParams,
  sort?: FinancesSortOptions,
) {
  const params = new URLSearchParams(toPaginationQuery(pagination));

  if (sort?.sortBy) {
    params.set('sortBy', sort.sortBy);
  }

  if (sort?.sortDirection) {
    params.set('sortDirection', sort.sortDirection);
  }

  const response = await httpRequest<PaginatedResponse<ApiFinanceRecord>>({
    path: `/finances?${params.toString()}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return {
    ...response,
    items: response.items.map(toFinanceRecord),
  };
}
