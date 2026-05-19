export type EventType =
  | 'note_created'
  | 'note_updated'
  | 'note_deleted'
  | 'task_created'
  | 'task_updated'
  | 'task_deleted'
  | 'reminder_created'
  | 'reminder_updated'
  | 'reminder_deleted'
  | 'client_created'
  | 'client_updated'
  | 'client_deleted'
  | 'order_created'
  | 'order_updated'
  | 'order_deleted'
  | 'order_complete'
  | 'order_reopened'
  | 'paid_created'
  | 'paid_updated'
  | 'paid_deleted'
  | 'spent_created'
  | 'spent_updated'
  | 'spent_deleted';

export interface OrderChangedField {
  field: 'title' | 'price' | 'content' | 'status';
  from: string | null;
  to: string | null;
}

export interface BaseEventRecord<TType extends EventType, TPayload extends object> {
  id: number;
  original_id: number | null;
  user_id: string;
  client_id: string;
  order_id: number | null;
  type: TType;
  comment: string | null;
  payload: TPayload;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

interface EventDisplaySnapshot {
  client_name?: string | null;
  client_status?: 'individual' | 'legal_entity' | null;
  client_company?: string | null;
  order_title?: string | null;
  order_status?: string | null;
}

export interface NoteEventPayload extends EventDisplaySnapshot {
  note_id: number;
  content: string;
  order_id?: number | null;
}

export interface TaskEventPayload extends EventDisplaySnapshot {
  task_id: number;
  content: string;
  status: 'pending' | 'complete';
  deadline?: string | null;
  order_id?: number | null;
}

export interface ReminderEventPayload extends EventDisplaySnapshot {
  reminder_id: number;
  content: string;
  timestamp: string;
  order_id?: number | null;
}

export interface ClientEventPayload extends EventDisplaySnapshot {
  client_id: string;
  name?: string;
  email?: string;
  phone_number?: string;
  company?: string;
  status?: 'individual' | 'legal_entity';
}

export interface OrderEventPayload extends EventDisplaySnapshot {
  order_id: number;
  title?: string | null;
  price: string | number;
  content: string;
  status: string;
}

export interface OrderUpdatedEventPayload extends OrderEventPayload {
  changed_fields: OrderChangedField[];
}

export interface PaidEventPayload extends EventDisplaySnapshot {
  paid_id: number;
  order_id: number;
  value: string | number;
}

export interface SpentEventPayload extends EventDisplaySnapshot {
  spent_id: number;
  order_id: number;
  value: string | number;
}

export type NoteCreatedEventRecord = BaseEventRecord<'note_created', NoteEventPayload>;
export type NoteUpdatedEventRecord = BaseEventRecord<'note_updated', NoteEventPayload>;
export type NoteDeletedEventRecord = BaseEventRecord<'note_deleted', NoteEventPayload>;
export type NoteEventRecord =
  | NoteCreatedEventRecord
  | NoteUpdatedEventRecord
  | NoteDeletedEventRecord;
export type TaskCreatedEventRecord = BaseEventRecord<'task_created', TaskEventPayload>;
export type TaskUpdatedEventRecord = BaseEventRecord<'task_updated', TaskEventPayload>;
export type TaskDeletedEventRecord = BaseEventRecord<'task_deleted', TaskEventPayload>;
export type TaskEventRecord =
  | TaskCreatedEventRecord
  | TaskUpdatedEventRecord
  | TaskDeletedEventRecord;
export type ReminderCreatedEventRecord = BaseEventRecord<'reminder_created', ReminderEventPayload>;
export type ReminderUpdatedEventRecord = BaseEventRecord<'reminder_updated', ReminderEventPayload>;
export type ReminderDeletedEventRecord = BaseEventRecord<'reminder_deleted', ReminderEventPayload>;
export type ReminderEventRecord =
  | ReminderCreatedEventRecord
  | ReminderUpdatedEventRecord
  | ReminderDeletedEventRecord;

export type ClientCreatedEventRecord = BaseEventRecord<'client_created', ClientEventPayload>;
export type ClientUpdatedEventRecord = BaseEventRecord<'client_updated', ClientEventPayload>;
export type ClientDeletedEventRecord = BaseEventRecord<'client_deleted', ClientEventPayload>;
export type ClientEventRecord =
  | ClientCreatedEventRecord
  | ClientUpdatedEventRecord
  | ClientDeletedEventRecord;

export type OrderCreatedEventRecord = BaseEventRecord<'order_created', OrderEventPayload>;

export type OrderUpdatedEventRecord = BaseEventRecord<'order_updated', OrderUpdatedEventPayload>;
export type OrderDeletedEventRecord = BaseEventRecord<'order_deleted', OrderEventPayload>;

export type OrderCompleteEventRecord = BaseEventRecord<
  'order_complete',
  OrderUpdatedEventPayload
>;

export type OrderReopenedEventRecord = BaseEventRecord<
  'order_reopened',
  OrderUpdatedEventPayload
>;

export type PaidCreatedEventRecord = BaseEventRecord<'paid_created', PaidEventPayload>;
export type PaidUpdatedEventRecord = BaseEventRecord<'paid_updated', PaidEventPayload>;
export type PaidDeletedEventRecord = BaseEventRecord<'paid_deleted', PaidEventPayload>;
export type PaidEventRecord =
  | PaidCreatedEventRecord
  | PaidUpdatedEventRecord
  | PaidDeletedEventRecord;
export type SpentCreatedEventRecord = BaseEventRecord<'spent_created', SpentEventPayload>;
export type SpentUpdatedEventRecord = BaseEventRecord<'spent_updated', SpentEventPayload>;
export type SpentDeletedEventRecord = BaseEventRecord<'spent_deleted', SpentEventPayload>;
export type SpentEventRecord =
  | SpentCreatedEventRecord
  | SpentUpdatedEventRecord
  | SpentDeletedEventRecord;

export type EventRecord =
  | NoteEventRecord
  | TaskEventRecord
  | ReminderEventRecord
  | ClientEventRecord
  | OrderCreatedEventRecord
  | OrderUpdatedEventRecord
  | OrderDeletedEventRecord
  | OrderCompleteEventRecord
  | OrderReopenedEventRecord
  | PaidEventRecord
  | SpentEventRecord;
