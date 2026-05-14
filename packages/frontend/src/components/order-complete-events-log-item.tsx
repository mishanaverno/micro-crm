import { AbstractEventsLogItem } from './abstract-events-log-item';
import { EventsLogAction } from './events-log-actions';
import { LogItemDescription, LogItemTitle } from '../shared/ui/log-item';
import { OrderCompleteEventRecord } from '../shared/types/event';

interface OrderCompleteEventsLogItemProps {
  event: OrderCompleteEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
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
  commonActions = [],
  cardBorderClassName,
  compact = false,
}: OrderCompleteEventsLogItemProps) {
  return (
    <AbstractEventsLogItem
      cardBorderClassName={cardBorderClassName}
      clientLabel={clientLabel}
      compact={compact}
      commonActions={commonActions}
      event={event}
      markerClassName="bg-emerald-500"
      specificActions={[]}
      typeLabel="order complete"
    >
      <LogItemTitle>{describeOrderCompleteEvent(event)}</LogItemTitle>
      {!compact ? <LogItemDescription>Status changed to done.</LogItemDescription> : null}
    </AbstractEventsLogItem>
  );
}
