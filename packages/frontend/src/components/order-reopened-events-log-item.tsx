import { AbstractEventsLogItem } from './abstract-events-log-item';
import { EventTypeIcon } from './event-type-icon';
import { EventsLogAction } from './events-log-actions';
import { OrderStatusBadge } from './status-badges';
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
      icon={<EventTypeIcon type="order_reopened" />}
      specificActions={[]}
      typeLabel="order reopened"
    >
      <LogItemTitle>{describeOrderReopenedEvent(event)}</LogItemTitle>
      {!compact ? (
        <LogItemDescription>
          <span className="inline-flex items-center gap-2">
            <OrderStatusBadge status={event.payload.status as 'created' | 'inprogress' | 'done'} />
            <span>Status changed from done.</span>
          </span>
        </LogItemDescription>
      ) : null}
    </AbstractEventsLogItem>
  );
}
