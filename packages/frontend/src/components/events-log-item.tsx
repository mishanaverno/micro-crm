import { memo } from 'react';
import { ClientCreatedEventsLogItem } from './client-created-events-log-item';
import { EventsLogAction } from './events-log-actions';
import { NoteEventsLogItem } from './note-events-log-item';
import { OrderCreatedEventsLogItem } from './order-created-events-log-item';
import { OrderCompleteEventsLogItem } from './order-complete-events-log-item';
import { OrderReopenedEventsLogItem } from './order-reopened-events-log-item';
import { OrderUpdatedEventsLogItem } from './order-updated-events-log-item';
import { PaidEventsLogItem } from './paid-events-log-item';
import { ReminderEventsLogItem } from './reminder-events-log-item';
import { SpentEventsLogItem } from './spent-events-log-item';
import { TaskEventsLogItem } from './task-events-log-item';
import { EventRecord } from '../shared/types/event';

interface EventsLogItemProps {
  event: EventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  specificActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
}

function EventsLogItemComponent({
  event,
  clientLabel,
  commonActions = [],
  specificActions = [],
  cardBorderClassName,
  compact = false,
}: EventsLogItemProps) {
  switch (event.type) {
    case 'client_created':
    case 'client_updated':
    case 'client_deleted':
      return <ClientCreatedEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} />;
    case 'note_created':
    case 'note_updated':
    case 'note_deleted':
      return <NoteEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} specificActions={specificActions} />;
    case 'task_created':
    case 'task_updated':
    case 'task_deleted':
      return <TaskEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} specificActions={specificActions} />;
    case 'reminder_created':
    case 'reminder_updated':
    case 'reminder_deleted':
      return <ReminderEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} specificActions={specificActions} />;
    case 'order_created':
      return <OrderCreatedEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} specificActions={specificActions} />;
    case 'order_updated':
      return <OrderUpdatedEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} specificActions={specificActions} />;
    case 'order_complete':
      return <OrderCompleteEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} specificActions={specificActions} />;
    case 'order_reopened':
      return <OrderReopenedEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} specificActions={specificActions} />;
    case 'order_deleted':
      return <OrderUpdatedEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} specificActions={specificActions} />;
    case 'paid_created':
    case 'paid_updated':
    case 'paid_deleted':
      return <PaidEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} specificActions={specificActions} />;
    case 'spent_created':
    case 'spent_updated':
    case 'spent_deleted':
      return <SpentEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} specificActions={specificActions} />;
    default:
      return null;
  }
}

export const EventsLogItem = memo(EventsLogItemComponent);
