import { httpRequest } from './http';
import { TaskDraft, TaskRecord } from '../types/task';

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

export async function fetchTasksRequest(accessToken: string) {
  const tasks = await httpRequest<ApiTaskRecord[]>({
    path: '/tasks',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return tasks.map(toTaskRecord);
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
