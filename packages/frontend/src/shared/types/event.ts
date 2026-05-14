export type EventType = 'note' | 'client_created';

export interface BaseEventRecord<TType extends EventType, TPayload extends object> {
  id: number;
  user_id: string;
  client_id: string;
  type: TType;
  comment: string | null;
  payload: TPayload;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface NoteEventPayload {
  note_id: number;
  content: string;
}

export interface ClientCreatedEventPayload {
  client_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  company?: string;
}

export type NoteEventRecord = BaseEventRecord<'note', NoteEventPayload>;

export type ClientCreatedEventRecord = BaseEventRecord<
  'client_created',
  ClientCreatedEventPayload
>;

export type EventRecord = NoteEventRecord | ClientCreatedEventRecord;
