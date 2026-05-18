export type EventType =
  | 'note'
  | 'task'
  | 'reminder'
  | 'client_created'
  | 'order_created'
  | 'order_updated'
  | 'order_complete'
  | 'order_reopened'
  | 'paid'
  | 'spent';

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
  order_id?: number | null;
}

export interface TaskEventPayload {
  task_id: number;
  content: string;
  status: 'pending' | 'complete';
  order_id?: number | null;
}

export interface ReminderEventPayload {
  reminder_id: number;
  content: string;
  timestamp: string;
  order_id?: number | null;
}

export interface ClientCreatedEventPayload {
  client_id: string;
  name?: string;
  email?: string;
  phone_number?: string;
  company?: string;
  status?: 'individual' | 'legal_entity';
}

export interface OrderEventPayload {
  order_id: number;
  title?: string | null;
  price: string | number;
  content: string;
  status: string;
}

export interface OrderUpdatedEventPayload extends OrderEventPayload {
  changed_fields: OrderChangedField[];
}

export interface PaidEventPayload {
  paid_id: number;
  order_id: number;
  value: string | number;
}

export interface SpentEventPayload {
  spent_id: number;
  order_id: number;
  value: string | number;
}

export type NoteEventRecord = BaseEventRecord<'note', NoteEventPayload>;
export type TaskEventRecord = BaseEventRecord<'task', TaskEventPayload>;
export type ReminderEventRecord = BaseEventRecord<'reminder', ReminderEventPayload>;

export type ClientCreatedEventRecord = BaseEventRecord<
  'client_created',
  ClientCreatedEventPayload
>;

export type OrderCreatedEventRecord = BaseEventRecord<'order_created', OrderEventPayload>;

export type OrderUpdatedEventRecord = BaseEventRecord<'order_updated', OrderUpdatedEventPayload>;

export type OrderCompleteEventRecord = BaseEventRecord<
  'order_complete',
  OrderUpdatedEventPayload
>;

export type OrderReopenedEventRecord = BaseEventRecord<
  'order_reopened',
  OrderUpdatedEventPayload
>;

export type PaidEventRecord = BaseEventRecord<'paid', PaidEventPayload>;
export type SpentEventRecord = BaseEventRecord<'spent', SpentEventPayload>;

export type EventRecord =
  | NoteEventRecord
  | TaskEventRecord
  | ReminderEventRecord
  | ClientCreatedEventRecord
  | OrderCreatedEventRecord
  | OrderUpdatedEventRecord
  | OrderCompleteEventRecord
  | OrderReopenedEventRecord
  | PaidEventRecord
  | SpentEventRecord;
