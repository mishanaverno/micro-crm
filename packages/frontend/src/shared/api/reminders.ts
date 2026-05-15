import { httpRequest } from './http';
import { ReminderDraft, ReminderRecord } from '../types/reminder';

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

export async function fetchRemindersRequest(accessToken: string) {
  const reminders = await httpRequest<ApiReminderRecord[]>({
    path: '/reminders',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return reminders.map(toReminderRecord);
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
