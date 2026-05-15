import { AbstractEventsLogItem } from './abstract-events-log-item';
import { EventTypeIcon } from './event-type-icon';
import { EventsLogAction } from './events-log-actions';
import { LogItemDescription, LogItemTitle } from '../shared/ui/log-item';
import { ReminderEventRecord } from '../shared/types/event';

interface ReminderEventsLogItemProps {
  event: ReminderEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
}

function describeReminderEvent(event: ReminderEventRecord) {
  const trimmedContent = event.payload.content.trim();

  return trimmedContent ? trimmedContent : `Reminder created for ${event.client_id}`;
}

export function ReminderEventsLogItem({
  event,
  clientLabel,
  commonActions = [],
  cardBorderClassName,
  compact = false,
}: ReminderEventsLogItemProps) {
  return (
    <AbstractEventsLogItem
      cardBorderClassName={cardBorderClassName}
      clientLabel={clientLabel}
      compact={compact}
      commonActions={commonActions}
      event={event}
      icon={<EventTypeIcon type="reminder" />}
      specificActions={[]}
      typeLabel="reminder"
    >
      <LogItemTitle>
        {compact && event.payload.order_id != null
          ? `Reminder: Order #${event.payload.order_id}`
          : describeReminderEvent(event)}
      </LogItemTitle>
      {!compact ? (
        <LogItemDescription>
          Scheduled for {new Date(event.payload.timestamp).toLocaleString()}
        </LogItemDescription>
      ) : null}
    </AbstractEventsLogItem>
  );
}
