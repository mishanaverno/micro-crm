import { AbstractEventsLogItem } from './abstract-events-log-item';
import { LogItemDescription, LogItemTitle } from '../shared/ui/log-item';
import { OrderReopenedEventRecord } from '../shared/types/event';

interface OrderReopenedEventsLogItemProps {
  event: OrderReopenedEventRecord;
  clientLabel: string;
}

function describeOrderReopenedEvent(event: OrderReopenedEventRecord) {
  const trimmedTitle = event.payload.title?.trim();

  return trimmedTitle
    ? `Order reopened: ${trimmedTitle}`
    : `Order reopened for ${event.client_id}`;
}

export function OrderReopenedEventsLogItem({
  event,
  clientLabel,
}: OrderReopenedEventsLogItemProps) {
  return (
    <AbstractEventsLogItem
      clientLabel={clientLabel}
      event={event}
      markerClassName="bg-sky-500"
      typeLabel="order reopened"
    >
      <LogItemTitle>{describeOrderReopenedEvent(event)}</LogItemTitle>
      <LogItemDescription>Status changed from done.</LogItemDescription>
    </AbstractEventsLogItem>
  );
}
