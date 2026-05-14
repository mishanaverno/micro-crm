import { AbstractEventsLogItem } from './abstract-events-log-item';
import { LogItemDescription, LogItemTitle } from '../shared/ui/log-item';
import { OrderCompleteEventRecord } from '../shared/types/event';

interface OrderCompleteEventsLogItemProps {
  event: OrderCompleteEventRecord;
  clientLabel: string;
}

function describeOrderCompleteEvent(event: OrderCompleteEventRecord) {
  const trimmedTitle = event.payload.title?.trim();

  return trimmedTitle
    ? `Order completed: ${trimmedTitle}`
    : `Order completed for ${event.client_id}`;
}

export function OrderCompleteEventsLogItem({
  event,
  clientLabel,
}: OrderCompleteEventsLogItemProps) {
  return (
    <AbstractEventsLogItem
      clientLabel={clientLabel}
      event={event}
      markerClassName="bg-emerald-500"
      typeLabel="order complete"
    >
      <LogItemTitle>{describeOrderCompleteEvent(event)}</LogItemTitle>
      <LogItemDescription>Status changed to done.</LogItemDescription>
    </AbstractEventsLogItem>
  );
}
