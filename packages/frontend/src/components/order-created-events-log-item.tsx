import { AbstractEventsLogItem } from './abstract-events-log-item';
import { LogItemTitle } from '../shared/ui/log-item';
import { OrderCreatedEventRecord } from '../shared/types/event';

interface OrderCreatedEventsLogItemProps {
  event: OrderCreatedEventRecord;
  clientLabel: string;
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
}: OrderCreatedEventsLogItemProps) {
  return (
    <AbstractEventsLogItem
      clientLabel={clientLabel}
      event={event}
      markerClassName="bg-amber-500"
      typeLabel="order created"
    >
      <LogItemTitle>{describeOrderCreatedEvent(event)}</LogItemTitle>
    </AbstractEventsLogItem>
  );
}
