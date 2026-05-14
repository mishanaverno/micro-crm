import { AbstractEventsLogItem } from './abstract-events-log-item';
import { EventTypeIcon } from './event-type-icon';
import { EventsLogAction } from './events-log-actions';
import { LogItemDescription, LogItemTitle } from '../shared/ui/log-item';
import { PaidEventRecord } from '../shared/types/event';

interface PaidEventsLogItemProps {
  event: PaidEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
}

function formatValue(value: string | number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export function PaidEventsLogItem({
  event,
  clientLabel,
  commonActions = [],
  cardBorderClassName,
  compact = false,
}: PaidEventsLogItemProps) {
  return (
    <AbstractEventsLogItem
      cardBorderClassName={cardBorderClassName}
      clientLabel={clientLabel}
      compact={compact}
      commonActions={commonActions}
      event={event}
      icon={<EventTypeIcon type="paid" />}
      markerClassName="bg-emerald-500"
      specificActions={[]}
      typeLabel="paid"
    >
      <LogItemTitle>
        {compact ? `Paid: Order #${event.payload.order_id}` : `Paid recorded: ${formatValue(event.payload.value)}`}
      </LogItemTitle>
      {!compact ? <LogItemDescription>{`Order #${event.payload.order_id}`}</LogItemDescription> : null}
    </AbstractEventsLogItem>
  );
}
