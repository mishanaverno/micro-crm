import { AbstractEventsLogItem } from './abstract-events-log-item';
import { LogItemDescription, LogItemTitle } from '../shared/ui/log-item';
import { PaidEventRecord } from '../shared/types/event';

interface PaidEventsLogItemProps {
  event: PaidEventRecord;
  clientLabel: string;
}

function formatValue(value: string | number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export function PaidEventsLogItem({ event, clientLabel }: PaidEventsLogItemProps) {
  return (
    <AbstractEventsLogItem
      clientLabel={clientLabel}
      event={event}
      markerClassName="bg-emerald-500"
      typeLabel="paid"
    >
      <LogItemTitle>{`Paid recorded: ${formatValue(event.payload.value)}`}</LogItemTitle>
      <LogItemDescription>{`Order #${event.payload.order_id}`}</LogItemDescription>
    </AbstractEventsLogItem>
  );
}
