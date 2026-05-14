import { AbstractEventsLogItem } from './abstract-events-log-item';
import { LogItemTitle } from '../shared/ui/log-item';
import { OrderUpdatedEventRecord } from '../shared/types/event';

interface OrderUpdatedEventsLogItemProps {
  event: OrderUpdatedEventRecord;
  clientLabel: string;
}

function describeOrderUpdatedEvent(event: OrderUpdatedEventRecord) {
  const trimmedContent = event.payload.content.trim();

  return trimmedContent
    ? `Order updated: ${trimmedContent}`
    : `Order updated for ${event.client_id}`;
}

export function OrderUpdatedEventsLogItem({
  event,
  clientLabel,
}: OrderUpdatedEventsLogItemProps) {
  return (
    <AbstractEventsLogItem
      clientLabel={clientLabel}
      event={event}
      markerClassName="bg-violet-500"
      typeLabel="order updated"
    >
      <LogItemTitle>{describeOrderUpdatedEvent(event)}</LogItemTitle>
    </AbstractEventsLogItem>
  );
}
