import { memo } from 'react';
import { ClientDeletedEventsLogItem } from './client-deleted-events-log-item';
import { ClientCreatedEventsLogItem } from './client-created-events-log-item';
import { ClientUpdatedEventsLogItem } from './client-updated-events-log-item';
import { EventsLogAction } from './events-log-actions';
import { NoteCreatedEventsLogItem } from './note-created-events-log-item';
import { NoteDeletedEventsLogItem } from './note-deleted-events-log-item';
import { NoteUpdatedEventsLogItem } from './note-updated-events-log-item';
import { OrderCreatedEventsLogItem } from './order-created-events-log-item';
import { OrderCompleteEventsLogItem } from './order-complete-events-log-item';
import { OrderDeletedEventsLogItem } from './order-deleted-events-log-item';
import { OrderReopenedEventsLogItem } from './order-reopened-events-log-item';
import { OrderUpdatedEventsLogItem } from './order-updated-events-log-item';
import { PaidCreatedEventsLogItem } from './paid-created-events-log-item';
import { PaidDeletedEventsLogItem } from './paid-deleted-events-log-item';
import { PaidUpdatedEventsLogItem } from './paid-updated-events-log-item';
import { ReminderCreatedEventsLogItem } from './reminder-created-events-log-item';
import { ReminderDeletedEventsLogItem } from './reminder-deleted-events-log-item';
import { ReminderUpdatedEventsLogItem } from './reminder-updated-events-log-item';
import { SpentCreatedEventsLogItem } from './spent-created-events-log-item';
import { SpentDeletedEventsLogItem } from './spent-deleted-events-log-item';
import { SpentUpdatedEventsLogItem } from './spent-updated-events-log-item';
import { TaskCreatedEventsLogItem } from './task-created-events-log-item';
import { TaskDeletedEventsLogItem } from './task-deleted-events-log-item';
import { TaskUpdatedEventsLogItem } from './task-updated-events-log-item';
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
      return <ClientCreatedEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} />;
    case 'client_updated':
      return <ClientUpdatedEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} />;
    case 'client_deleted':
      return <ClientDeletedEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} />;
    case 'note_created':
      return <NoteCreatedEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} specificActions={specificActions} />;
    case 'note_updated':
      return <NoteUpdatedEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} specificActions={specificActions} />;
    case 'note_deleted':
      return <NoteDeletedEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} specificActions={specificActions} />;
    case 'task_created':
      return <TaskCreatedEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} specificActions={specificActions} />;
    case 'task_updated':
      return <TaskUpdatedEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} specificActions={specificActions} />;
    case 'task_deleted':
      return <TaskDeletedEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} specificActions={specificActions} />;
    case 'reminder_created':
      return <ReminderCreatedEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} specificActions={specificActions} />;
    case 'reminder_updated':
      return <ReminderUpdatedEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} specificActions={specificActions} />;
    case 'reminder_deleted':
      return <ReminderDeletedEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} specificActions={specificActions} />;
    case 'order_created':
      return <OrderCreatedEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} specificActions={specificActions} />;
    case 'order_updated':
      return <OrderUpdatedEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} specificActions={specificActions} />;
    case 'order_complete':
      return <OrderCompleteEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} specificActions={specificActions} />;
    case 'order_reopened':
      return <OrderReopenedEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} specificActions={specificActions} />;
    case 'order_deleted':
      return <OrderDeletedEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} specificActions={specificActions} />;
    case 'paid_created':
      return <PaidCreatedEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} specificActions={specificActions} />;
    case 'paid_updated':
      return <PaidUpdatedEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} specificActions={specificActions} />;
    case 'paid_deleted':
      return <PaidDeletedEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} specificActions={specificActions} />;
    case 'spent_created':
      return <SpentCreatedEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} specificActions={specificActions} />;
    case 'spent_updated':
      return <SpentUpdatedEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} specificActions={specificActions} />;
    case 'spent_deleted':
      return <SpentDeletedEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} specificActions={specificActions} />;
    default:
      return null;
  }
}

export const EventsLogItem = memo(EventsLogItemComponent);
