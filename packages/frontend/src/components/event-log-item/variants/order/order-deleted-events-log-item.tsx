import { AbstractEventsLogItem } from '../../abstract-events-log-item';
import { EventsLogAction } from '../../../events-log-actions';
import { LogItemDescription } from '../../../../shared/ui/log-item';
import { OrderDeletedEventRecord } from '../../../../shared/types/event';
import { OrderStatus } from '@/shared/types/order';

interface OrderDeletedEventsLogItemProps {
  event: OrderDeletedEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  specificActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
}

export function OrderDeletedEventsLogItem({
  event,
  clientLabel,
  commonActions = [],
  specificActions = [],
  cardBorderClassName,
  compact = false,
}: OrderDeletedEventsLogItemProps) {
  return (
    <AbstractEventsLogItem
      cardBorderClassName={cardBorderClassName}
      clientLabel={clientLabel}
      compact={compact}
      commonActions={commonActions}
      event={event}
      compactTitle={`: #${event.payload.order_id}`}
      type="order_deleted"
      specificActions={specificActions}
      title={`: #${event.payload.order_id} - ${event.payload.title?.trim()}`}
      badge={event.payload.status as OrderStatus}
    >
      <LogItemDescription>{event.payload.content}</LogItemDescription>
    </AbstractEventsLogItem>
  );
}
