import { AbstractEventsLogItem } from './abstract-events-log-item';
import { EventsLogAction } from './events-log-actions';
import { LogItemDescription, LogItemTitle } from '../shared/ui/log-item';
import { OrderReopenedEventRecord } from '../shared/types/event';

interface OrderReopenedEventsLogItemProps {
  event: OrderReopenedEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
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
  commonActions = [],
  cardBorderClassName,
  compact = false,
}: OrderReopenedEventsLogItemProps) {
  return (
    <AbstractEventsLogItem
      cardBorderClassName={cardBorderClassName}
      clientLabel={clientLabel}
      compact={compact}
      commonActions={commonActions}
      event={event}
      markerClassName="bg-sky-500"
      specificActions={[]}
      typeLabel="order reopened"
    >
      <LogItemTitle>{describeOrderReopenedEvent(event)}</LogItemTitle>
      {!compact ? <LogItemDescription>Status changed from done.</LogItemDescription> : null}
    </AbstractEventsLogItem>
  );
}
