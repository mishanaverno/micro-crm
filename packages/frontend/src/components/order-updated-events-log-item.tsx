import { AbstractEventsLogItem } from './abstract-events-log-item';
import { EventTypeIcon } from './event-type-icon';
import { EventsLogAction } from './events-log-actions';
import { OrderStatusBadge } from './status-badges';
import { LogItemDescription, LogItemTitle } from '../shared/ui/log-item';
import { OrderChangedField, OrderUpdatedEventRecord } from '../shared/types/event';

interface OrderUpdatedEventsLogItemProps {
  event: OrderUpdatedEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
}

function describeOrderUpdatedEvent(event: OrderUpdatedEventRecord) {
  const trimmedTitle = event.payload.title?.trim();

  return trimmedTitle
    ? `Order updated: ${trimmedTitle}`
    : `Order updated for ${event.client_id}`;
}

function resolveOrderTitle(event: OrderUpdatedEventRecord) {
  const trimmedTitle = event.payload.title?.trim();
  return trimmedTitle ? trimmedTitle : 'order';
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
  commonActions = [],
  cardBorderClassName,
  compact = false,
}: OrderUpdatedEventsLogItemProps) {
  const changedFields = event.payload.changed_fields ?? [];

  return (
    <AbstractEventsLogItem
      cardBorderClassName={cardBorderClassName}
      clientLabel={clientLabel}
      compact={compact}
      commonActions={commonActions}
      event={event}
      headerContent={
        compact ? undefined : (
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <span className="text-muted-foreground/90">
              <EventTypeIcon type="order_updated" />
            </span>
            <span>Order:</span>
            <span>#{event.payload.order_id}</span>
            <span>{resolveOrderTitle(event)}</span>
            <OrderStatusBadge status={event.payload.status as 'created' | 'inprogress' | 'done'} />
          </div>
        )
      }
      icon={<EventTypeIcon type="order_updated" />}
      specificActions={[]}
      typeLabel={compact ? 'order updated' : undefined}
    >
      <LogItemTitle>
        {compact ? `Order updated: #${event.payload.order_id}` : describeOrderUpdatedEvent(event)}
      </LogItemTitle>
      {!compact && changedFields.length > 0 ? (
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
