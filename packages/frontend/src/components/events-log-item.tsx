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
}

export function EventsLogItem({ event, clientLabel, commonActions = [] }: EventsLogItemProps) {
  switch (event.type) {
    case 'client_created':
      return <ClientCreatedEventsLogItem clientLabel={clientLabel} commonActions={commonActions} event={event} />;
    case 'note':
      return <NoteEventsLogItem clientLabel={clientLabel} commonActions={commonActions} event={event} />;
    case 'order_created':
      return <OrderCreatedEventsLogItem clientLabel={clientLabel} commonActions={commonActions} event={event} />;
    case 'order_updated':
      return <OrderUpdatedEventsLogItem clientLabel={clientLabel} commonActions={commonActions} event={event} />;
    case 'order_complete':
      return <OrderCompleteEventsLogItem clientLabel={clientLabel} commonActions={commonActions} event={event} />;
    case 'order_reopened':
      return <OrderReopenedEventsLogItem clientLabel={clientLabel} commonActions={commonActions} event={event} />;
    case 'paid':
      return <PaidEventsLogItem clientLabel={clientLabel} commonActions={commonActions} event={event} />;
    default:
      return null;
  }
}
