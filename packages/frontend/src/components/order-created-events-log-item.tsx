import { AbstractEventsLogItem } from './abstract-events-log-item';
import { EventsLogAction } from './events-log-actions';
import { LogItemDescription } from '../shared/ui/log-item';
import { OrderCreatedEventRecord } from '../shared/types/event';

interface OrderCreatedEventsLogItemProps {
  event: OrderCreatedEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  specificActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
}

export function OrderCreatedEventsLogItem({
  event,
  clientLabel,
  commonActions = [],
  specificActions = [],
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
      title={`: #${event.payload.order_id} - ${event.payload.title?.trim()} `}
      compactTitle={`: #${event.payload.order_id} `}
      type="order_created"
      specificActions={specificActions}
      badge='created'
    >
      <LogItemDescription>{event.payload.content}</LogItemDescription>
    </AbstractEventsLogItem>
  );
}
