export type EventPayload = Record<string, unknown>;

export type EventType = 'note' | 'client_created';

export interface EventRecord {
  id: number;
  user_id: string;
  client_id: string;
  type: EventType;
  comment: string | null;
  payload: EventPayload;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}
