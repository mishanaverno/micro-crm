import { AbstractEventsLogItem } from './abstract-events-log-item';
import { EventTypeIcon } from './event-type-icon';
import { EventsLogAction } from './events-log-actions';
import { OrderStatusBadge } from './status-badges';
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

function resolveOrderTitle(event: OrderCompleteEventRecord) {
  const trimmedTitle = event.payload.title?.trim();
  return trimmedTitle ? trimmedTitle : 'order';
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
      headerContent={
        compact ? undefined : (
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <span className="text-muted-foreground/90">
              <EventTypeIcon type="order_complete" />
            </span>
            <span>Order:</span>
            <span>#{event.payload.order_id}</span>
            <span>{resolveOrderTitle(event)}</span>
            <OrderStatusBadge status="done" />
          </div>
        )
      }
      icon={<EventTypeIcon type="order_complete" />}
      markerClassName="bg-emerald-500"
      specificActions={[]}
      typeLabel={compact ? 'order complete' : undefined}
    >
      <LogItemTitle>
        {compact ? `Order complete: #${event.payload.order_id}` : describeOrderCompleteEvent(event)}
      </LogItemTitle>
      {!compact ? (
        <LogItemDescription>
          Status changed to done.
        </LogItemDescription>
      ) : null}
    </AbstractEventsLogItem>
  );
}
