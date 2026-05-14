import { AbstractEventsLogItem } from './abstract-events-log-item';
import { EventsLogAction } from './events-log-actions';
import { LogItemDescription, LogItemTitle } from '../shared/ui/log-item';
import { PaidEventRecord } from '../shared/types/event';

interface PaidEventsLogItemProps {
  event: PaidEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
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
}: PaidEventsLogItemProps) {
  return (
    <AbstractEventsLogItem
      clientLabel={clientLabel}
      commonActions={commonActions}
      event={event}
      markerClassName="bg-emerald-500"
      specificActions={[]}
      typeLabel="paid"
    >
      <LogItemTitle>{`Paid recorded: ${formatValue(event.payload.value)}`}</LogItemTitle>
      <LogItemDescription>{`Order #${event.payload.order_id}`}</LogItemDescription>
    </AbstractEventsLogItem>
  );
}
