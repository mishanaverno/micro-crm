export type EventType =
  | 'note'
  | 'task'
  | 'client_created'
  | 'order_created'
  | 'order_updated'
  | 'order_complete'
  | 'order_reopened'
  | 'paid';

export interface OrderChangedField {
  field: 'title' | 'price' | 'content' | 'status';
  from: string | null;
  to: string | null;
}

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
  order_id?: number | null;
}

export interface TaskEventPayload {
  task_id: number;
  content: string;
  status: 'pending' | 'complete';
  order_id?: number | null;
}

export interface ClientCreatedEventPayload {
  client_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  company?: string;
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

export type NoteEventRecord = BaseEventRecord<'note', NoteEventPayload>;
export type TaskEventRecord = BaseEventRecord<'task', TaskEventPayload>;

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

export type EventRecord =
  | NoteEventRecord
  | TaskEventRecord
  | ClientCreatedEventRecord
  | OrderCreatedEventRecord
  | OrderUpdatedEventRecord
  | OrderCompleteEventRecord
  | OrderReopenedEventRecord
  | PaidEventRecord;
