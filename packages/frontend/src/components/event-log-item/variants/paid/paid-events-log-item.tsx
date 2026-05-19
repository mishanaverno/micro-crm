import { AbstractEventsLogItem } from '../../abstract-events-log-item';
import { EventsLogAction } from '../../../events-log-actions';
import { LogItemDescription } from '../../../../shared/ui/log-item';
import { PaidEventRecord } from '../../../../shared/types/event';

interface PaidEventsLogItemProps {
  event: PaidEventRecord;
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
  }).format(Number(value));
}

export function PaidEventsLogItem({
  event,
  clientLabel,
  commonActions = [],
  specificActions = [],
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
      compactTitle={`Paid: Order #${event.payload.order_id}`}
      type={event.type}
      specificActions={specificActions}
      title={`Paid ${event.type === 'paid_updated' ? 'updated' : event.type === 'paid_deleted' ? 'deleted' : 'recorded'}: ${formatValue(event.payload.value)}`}
    >
      <LogItemDescription>{`Order #${event.payload.order_id}`}</LogItemDescription>
    </AbstractEventsLogItem>
  );
}
