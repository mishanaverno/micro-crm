import { AbstractEventsLogItem } from './abstract-events-log-item';
import { LogItemDescription, LogItemTitle } from '../shared/ui/log-item';
import { OrderChangedField, OrderUpdatedEventRecord } from '../shared/types/event';

interface OrderUpdatedEventsLogItemProps {
  event: OrderUpdatedEventRecord;
  clientLabel: string;
}

function describeOrderUpdatedEvent(event: OrderUpdatedEventRecord) {
  const trimmedTitle = event.payload.title?.trim();

  return trimmedTitle
    ? `Order updated: ${trimmedTitle}`
    : `Order updated for ${event.client_id}`;
}

function formatFieldLabel(field: OrderChangedField['field']) {
  switch (field) {
    case 'title':
      return 'Title';
    case 'price':
      return 'Price';
    case 'content':
      return 'Content';
    case 'status':
      return 'Status';
  }
}

function formatFieldValue(value: string | null) {
  if (value === null || value === '') {
    return 'empty';
  }

  return value;
}

export function OrderUpdatedEventsLogItem({
  event,
  clientLabel,
}: OrderUpdatedEventsLogItemProps) {
  const changedFields = event.payload.changed_fields ?? [];

  return (
    <AbstractEventsLogItem
      clientLabel={clientLabel}
      event={event}
      markerClassName="bg-violet-500"
      typeLabel="order updated"
    >
      <LogItemTitle>{describeOrderUpdatedEvent(event)}</LogItemTitle>
      {changedFields.length > 0 ? (
        <div className="mt-3 grid gap-2">
          <LogItemDescription>
            Changed fields: {changedFields.map((item) => formatFieldLabel(item.field)).join(', ')}
          </LogItemDescription>
          <div className="grid gap-1.5 text-xs text-muted-foreground">
            {changedFields.map((item) => (
              <p key={item.field}>
                <span className="font-medium text-foreground">{formatFieldLabel(item.field)}:</span>{' '}
                {formatFieldValue(item.from)} {'->'} {formatFieldValue(item.to)}
              </p>
            ))}
          </div>
        </div>
      ) : null}
    </AbstractEventsLogItem>
  );
}
