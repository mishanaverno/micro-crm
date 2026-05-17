import { AbstractEventsLogItem } from './abstract-events-log-item';
import { EventsLogAction } from './events-log-actions';
import { LogItemDescription } from '../shared/ui/log-item';
import { OrderReopenedEventRecord } from '../shared/types/event';

interface OrderReopenedEventsLogItemProps {
  event: OrderReopenedEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
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
      compactTitle={`: #${event.payload.order_id}`}
      type="order_reopened"
      badge='reopened'
      specificActions={[]}
      title={`: #${event.payload.order_id} - ${event.payload.title?.trim()}`}
    >
      {!compact ? (
        <LogItemDescription>
          <span className="inline-flex items-center gap-2">
            <span>Status changed from done.</span>
          </span>
        </LogItemDescription>
      ) : null}
    </AbstractEventsLogItem>
  );
}
