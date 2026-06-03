import { httpRequest } from './http';
import { ReminderDraft, ReminderRecord } from '../types/reminder';
import { PaginatedResponse, PaginationParams } from '../types/pagination';
import { toPaginationQuery } from './pagination';

interface RemindersRequestFilters {
  clientId?: string;
  orderId?: string;
}

interface RemindersSortOptions {
  sortBy?: 'created_at' | 'updated_at' | 'timestamp';
  sortDirection?: 'asc' | 'desc';
}

interface ApiReminderRecord extends Omit<ReminderRecord, 'id' | 'sync_status'> {
  id: number | string;
  sync_status?: ReminderRecord['sync_status'];
}

function toReminderRecord(reminder: ApiReminderRecord): ReminderRecord {
  return {
    ...reminder,
    id: String(reminder.id),
    sync_status: reminder.sync_status ?? 'synced',
    updated_at: reminder.updated_at ?? reminder.created_at,
  };
}

function toRemindersQuery(filters?: RemindersRequestFilters) {
  const params = new URLSearchParams();

  if (filters?.clientId) {
    params.set('client_id', filters.clientId);
  }

  if (filters?.orderId) {
    params.set('order_id', filters.orderId);
  }

  const query = params.toString();

  return query ? `?${query}` : '';
}

export async function fetchRemindersRequest(
  accessToken: string,
  filters?: RemindersRequestFilters,
) {
  const reminders = await httpRequest<ApiReminderRecord[]>({
    path: `/reminders${toRemindersQuery(filters)}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return reminders.map(toReminderRecord);
}

export async function fetchPaginatedRemindersRequest(
  accessToken: string,
  pagination: PaginationParams,
  filters?: RemindersRequestFilters,
  sort?: RemindersSortOptions,
) {
  const params = new URLSearchParams(toPaginationQuery(pagination));

  if (filters?.clientId) {
    params.set('client_id', filters.clientId);
  }

  if (filters?.orderId) {
    params.set('order_id', filters.orderId);
  }

  if (sort?.sortBy) {
    params.set('sortBy', sort.sortBy);
  }

  if (sort?.sortDirection) {
    params.set('sortDirection', sort.sortDirection);
  }

  const response = await httpRequest<PaginatedResponse<ApiReminderRecord>>({
    path: `/reminders?${params.toString()}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return {
    ...response,
    items: response.items.map(toReminderRecord),
  };
}

export async function createReminderRequest(payload: ReminderDraft, accessToken: string) {
  const reminder = await httpRequest<ApiReminderRecord>({
    path: '/reminders',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  return toReminderRecord(reminder);
}

export async function updateReminderRequest(
  reminderId: string,
  payload: ReminderDraft,
  accessToken: string,
) {
  const reminder = await httpRequest<ApiReminderRecord>({
    path: `/reminders/${reminderId}`,
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  return toReminderRecord(reminder);
}

export async function deleteReminderRequest(reminderId: string, accessToken: string) {
  return httpRequest<ReminderRecord>({
    path: `/reminders/${reminderId}`,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
