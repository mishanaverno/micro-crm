import { memo } from 'react';
import { ClientDeletedEventsLogItem } from './variants/client/client-deleted-events-log-item';
import { ClientCreatedEventsLogItem } from './variants/client/client-created-events-log-item';
import { ClientUpdatedEventsLogItem } from './variants/client/client-updated-events-log-item';
import { EventsLogAction } from '../events-log-actions';
import { NoteCreatedEventsLogItem } from './variants/note/note-created-events-log-item';
import { NoteDeletedEventsLogItem } from './variants/note/note-deleted-events-log-item';
import { NoteUpdatedEventsLogItem } from './variants/note/note-updated-events-log-item';
import { OrderCreatedEventsLogItem } from './variants/order/order-created-events-log-item';
import { OrderCompleteEventsLogItem } from './variants/order/order-complete-events-log-item';
import { OrderDeletedEventsLogItem } from './variants/order/order-deleted-events-log-item';
import { OrderReopenedEventsLogItem } from './variants/order/order-reopened-events-log-item';
import { OrderUpdatedEventsLogItem } from './variants/order/order-updated-events-log-item';
import { PaidCreatedEventsLogItem } from './variants/paid/paid-created-events-log-item';
import { PaidDeletedEventsLogItem } from './variants/paid/paid-deleted-events-log-item';
import { PaidUpdatedEventsLogItem } from './variants/paid/paid-updated-events-log-item';
import { ReminderCreatedEventsLogItem } from './variants/reminder/reminder-created-events-log-item';
import { ReminderDeletedEventsLogItem } from './variants/reminder/reminder-deleted-events-log-item';
import { ReminderUpdatedEventsLogItem } from './variants/reminder/reminder-updated-events-log-item';
import { SpentCreatedEventsLogItem } from './variants/spent/spent-created-events-log-item';
import { SpentDeletedEventsLogItem } from './variants/spent/spent-deleted-events-log-item';
import { SpentUpdatedEventsLogItem } from './variants/spent/spent-updated-events-log-item';
import { TaskCreatedEventsLogItem } from './variants/task/task-created-events-log-item';
import { TaskDeletedEventsLogItem } from './variants/task/task-deleted-events-log-item';
import { TaskUpdatedEventsLogItem } from './variants/task/task-updated-events-log-item';
import { EventRecord } from '../../shared/types/event';

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
