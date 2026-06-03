import { httpRequest } from './http';
import { TaskDraft, TaskRecord } from '../types/task';
import { PaginatedResponse, PaginationParams } from '../types/pagination';
import { toPaginationQuery } from './pagination';

interface TasksRequestFilters {
  clientId?: string;
  orderId?: string;
}

interface TasksSortOptions {
  sortBy?: 'created_at' | 'updated_at' | 'deadline';
  sortDirection?: 'asc' | 'desc';
}

interface ApiTaskRecord extends Omit<TaskRecord, 'id' | 'sync_status'> {
  id: number | string;
  sync_status?: TaskRecord['sync_status'];
}

function toTaskRecord(task: ApiTaskRecord): TaskRecord {
  return {
    ...task,
    id: String(task.id),
    status: task.status ?? 'pending',
    sync_status: task.sync_status ?? 'synced',
    updated_at: task.updated_at ?? task.created_at,
  };
}

function toTasksQuery(filters?: TasksRequestFilters) {
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

export async function fetchTasksRequest(
  accessToken: string,
  filters?: TasksRequestFilters,
) {
  const tasks = await httpRequest<ApiTaskRecord[]>({
    path: `/tasks${toTasksQuery(filters)}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return tasks.map(toTaskRecord);
}

export async function fetchPaginatedTasksRequest(
  accessToken: string,
  pagination: PaginationParams,
  filters?: TasksRequestFilters,
  sort?: TasksSortOptions,
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

  const response = await httpRequest<PaginatedResponse<ApiTaskRecord>>({
    path: `/tasks?${params.toString()}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return {
    ...response,
    items: response.items.map(toTaskRecord),
  };
}

export async function createTaskRequest(payload: TaskDraft, accessToken: string) {
  const task = await httpRequest<ApiTaskRecord>({
    path: '/tasks',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  return toTaskRecord(task);
}

export async function updateTaskRequest(
  taskId: string,
  payload: TaskDraft,
  accessToken: string,
) {
  const task = await httpRequest<ApiTaskRecord>({
    path: `/tasks/${taskId}`,
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  return toTaskRecord(task);
}

export async function deleteTaskRequest(taskId: string, accessToken: string) {
  return httpRequest<TaskRecord>({
    path: `/tasks/${taskId}`,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
