import { ClientCreatedEventsLogItem } from './client-created-events-log-item';
import { EventsLogAction } from './events-log-actions';
import { NoteEventsLogItem } from './note-events-log-item';
import { OrderCreatedEventsLogItem } from './order-created-events-log-item';
import { OrderCompleteEventsLogItem } from './order-complete-events-log-item';
import { OrderReopenedEventsLogItem } from './order-reopened-events-log-item';
import { OrderUpdatedEventsLogItem } from './order-updated-events-log-item';
import { PaidEventsLogItem } from './paid-events-log-item';
import { EventRecord } from '../shared/types/event';

interface EventsLogItemProps {
  event: EventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
}

export function EventsLogItem({
  event,
  clientLabel,
  commonActions = [],
  cardBorderClassName,
  compact = false,
}: EventsLogItemProps) {
  switch (event.type) {
    case 'client_created':
      return <ClientCreatedEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} />;
    case 'note':
      return <NoteEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} />;
    case 'order_created':
      return <OrderCreatedEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} />;
    case 'order_updated':
      return <OrderUpdatedEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} />;
    case 'order_complete':
      return <OrderCompleteEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} />;
    case 'order_reopened':
      return <OrderReopenedEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} />;
    case 'paid':
      return <PaidEventsLogItem cardBorderClassName={cardBorderClassName} clientLabel={clientLabel} commonActions={commonActions} compact={compact} event={event} />;
    default:
      return null;
  }
}
