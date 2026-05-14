import { AbstractEventsLogItem } from './abstract-events-log-item';
import { EventTypeIcon } from './event-type-icon';
import { EventsLogAction } from './events-log-actions';
import { LogItemTitle } from '../shared/ui/log-item';
import { OrderCreatedEventRecord } from '../shared/types/event';

interface OrderCreatedEventsLogItemProps {
  event: OrderCreatedEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
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
      icon={<EventTypeIcon type="order_created" />}
      markerClassName="bg-amber-500"
      specificActions={[]}
      typeLabel="order created"
    >
      <LogItemTitle>
        {compact ? `Order created: #${event.payload.order_id}` : describeOrderCreatedEvent(event)}
      </LogItemTitle>
    </AbstractEventsLogItem>
  );
}
