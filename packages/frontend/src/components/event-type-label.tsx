import { EventType } from '../shared/types/event';
import { t, type TranslationKey } from '../shared/lib/i18n';

interface EventTypeLabelProps {
  type: EventType;
  className?: string;
}

function labelClassName(className?: string) {
  return `shrink-0 text-sm font-medium text-foreground ${className ?? ''}`.trim();
}

export function EventTypelabel({ type, className }: EventTypeLabelProps) {
  const labels: Record<EventType, TranslationKey> = {
    client_created: 'event.clientCreated',
    client_updated: 'event.clientUpdated',
    client_deleted: 'event.clientDeleted',
    note_created: 'event.noteCreated',
    note_updated: 'event.noteUpdated',
    note_deleted: 'event.noteDeleted',
    task_created: 'event.taskCreated',
    task_updated: 'event.taskUpdated',
    task_deleted: 'event.taskDeleted',
    reminder_created: 'event.reminderCreated',
    reminder_updated: 'event.reminderUpdated',
    reminder_deleted: 'event.reminderDeleted',
    order_created: 'event.orderCreated',
    order_updated: 'event.orderUpdated',
    order_deleted: 'event.orderDeleted',
    order_complete: 'event.orderComplete',
    order_reopened: 'event.orderReopened',
    paid_created: 'event.paidCreated',
    paid_updated: 'event.paidUpdated',
    paid_deleted: 'event.paidDeleted',
  };

  return <span className={labelClassName(className)}>{t(labels[type])}</span>;
}
