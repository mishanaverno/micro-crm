import { AbstractEventsLogItem } from './abstract-events-log-item';
import { EventsLogAction } from './events-log-actions';
import { LogItemTitle } from '../shared/ui/log-item';
import { OrderCreatedEventRecord } from '../shared/types/event';

interface OrderCreatedEventsLogItemProps {
  event: OrderCreatedEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
}

function describeOrderCreatedEvent(event: OrderCreatedEventRecord) {
  const trimmedContent = event.payload.content.trim();

  return trimmedContent
    ? `Order created: ${trimmedContent}`
    : `Order created for ${event.client_id}`;
}

export function OrderCreatedEventsLogItem({
  event,
  clientLabel,
  commonActions = [],
}: OrderCreatedEventsLogItemProps) {
  return (
    <AbstractEventsLogItem
      clientLabel={clientLabel}
      commonActions={commonActions}
      event={event}
      markerClassName="bg-amber-500"
      specificActions={[]}
      typeLabel="order created"
    >
      <LogItemTitle>{describeOrderCreatedEvent(event)}</LogItemTitle>
    </AbstractEventsLogItem>
  );
}
