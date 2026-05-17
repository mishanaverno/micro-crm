import { AbstractEventsLogItem } from './abstract-events-log-item';
import { EventsLogAction } from './events-log-actions';
import { LogItemDescription } from '../shared/ui/log-item';
import { OrderCreatedEventRecord } from '../shared/types/event';

interface OrderCreatedEventsLogItemProps {
  event: OrderCreatedEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
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
      title={`: #${event.payload.order_id}`}
      compactTitle={`: #${event.payload.order_id} - ${event.payload.title?.trim()} `}
      type="order_created"
      specificActions={[]}
      badge='created'
    >
      <LogItemDescription>{event.payload.content}</LogItemDescription>
    </AbstractEventsLogItem>
  );
}
