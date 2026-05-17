import { AbstractEventsLogItem } from './abstract-events-log-item';
import { EventTypeIcon } from './event-type-icon';
import { EventsLogAction } from './events-log-actions';
import { LogItemDescription } from '../shared/ui/log-item';
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

function describeReminderTitle(event: ReminderEventRecord) {
  return event.payload.order_id != null
    ? `for order #${event.payload.order_id}`
    : '';
}

function describeCompactReminderTitle(event: ReminderEventRecord) {
  return event.payload.order_id != null
    ? `: Order #${event.payload.order_id}`
    : '';
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
      compactTitle={describeCompactReminderTitle(event)}
      type="reminder"
      specificActions={[]}
      title={describeReminderTitle(event)}
    >
      <LogItemDescription>
        <p>{event.payload.content}</p>
        <p>Scheduled for {new Date(event.payload.timestamp).toLocaleString()}</p>
      </LogItemDescription>
    </AbstractEventsLogItem>
  );
}
