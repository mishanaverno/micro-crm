import { AbstractEventsLogItem } from './abstract-events-log-item';
import { EventsLogAction } from './events-log-actions';
import { LogItemDescription } from '../shared/ui/log-item';
import { SpentEventRecord } from '../shared/types/event';

interface SpentEventsLogItemProps {
  event: SpentEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  specificActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
}

function formatValue(value: string | number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(-Math.abs(Number(value)));
}

export function SpentEventsLogItem({
  event,
  clientLabel,
  commonActions = [],
  specificActions = [],
  cardBorderClassName,
  compact = false,
}: SpentEventsLogItemProps) {
  return (
    <AbstractEventsLogItem
      cardBorderClassName={cardBorderClassName}
      clientLabel={clientLabel}
      compact={compact}
      commonActions={commonActions}
      event={event}
      compactTitle={`Spent: Order #${event.payload.order_id}`}
      type={event.type}
      specificActions={specificActions}
      title={`Spent ${event.type === 'spent_updated' ? 'updated' : event.type === 'spent_deleted' ? 'deleted' : 'recorded'}: ${formatValue(event.payload.value)}`}
    >
      <LogItemDescription>{`Order #${event.payload.order_id}`}</LogItemDescription>
    </AbstractEventsLogItem>
  );
}
