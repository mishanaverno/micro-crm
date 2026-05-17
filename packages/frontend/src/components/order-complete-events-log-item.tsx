import { AbstractEventsLogItem } from './abstract-events-log-item';
import { EventsLogAction } from './events-log-actions';
import { LogItemDescription } from '../shared/ui/log-item';
import { OrderCompleteEventRecord } from '../shared/types/event';

interface OrderCompleteEventsLogItemProps {
  event: OrderCompleteEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  specificActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
}


export function OrderCompleteEventsLogItem({
  event,
  clientLabel,
  commonActions = [],
  specificActions = [],
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
      type="order_complete"
      specificActions={specificActions}
      title={`: #${event.payload.order_id} - ${event.payload.title?.trim()}`}
      compactTitle={`: #${event.payload.order_id}`}
      badge='created'
    >
      <LogItemDescription>Order done.</LogItemDescription>
    </AbstractEventsLogItem>
  );
}
