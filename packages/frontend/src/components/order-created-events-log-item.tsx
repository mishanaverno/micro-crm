import { AbstractEventsLogItem } from './abstract-events-log-item';
import { EventTypeIcon } from './event-type-icon';
import { EventsLogAction } from './events-log-actions';
import { OrderStatusBadge } from './status-badges';
import { LogItemDescription, LogItemMeta } from '../shared/ui/log-item';
import { OrderCreatedEventRecord } from '../shared/types/event';

interface OrderCreatedEventsLogItemProps {
  event: OrderCreatedEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
}

function resolveOrderTitle(event: OrderCreatedEventRecord) {
  const trimmedTitle = event.payload.title?.trim();
  return trimmedTitle ? trimmedTitle : 'order';
}

export function OrderCreatedEventsLogItem({
  event,
  clientLabel,
  commonActions = [],
  cardBorderClassName,
  compact = false,
}: OrderCreatedEventsLogItemProps) {
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
              <EventTypeIcon type="order_created" />
            </span>
            <span>Order:</span>
            <span>#{event.payload.order_id}</span>
            <span>{resolveOrderTitle(event)}</span>
            <OrderStatusBadge status="created" />
          </div>
        )
      }
      icon={<EventTypeIcon type="order_created" />}
      specificActions={[]}
      typeLabel={compact ? 'order created' : undefined}
    >
      {compact ? (
        <LogItemMeta className="normal-case tracking-normal text-xs">
          Order created: #{event.payload.order_id}
        </LogItemMeta>
      ) : (
        <LogItemDescription>{event.payload.content}</LogItemDescription>
      )}
    </AbstractEventsLogItem>
  );
}
