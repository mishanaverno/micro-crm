import { AbstractEventsLogItem } from '../../abstract-events-log-item';
import { EventsLogAction } from '../../../events-log-actions';
import { LogItemDescription } from '../../../../shared/ui/log-item';
import { ReminderEventRecord } from '../../../../shared/types/event';

interface ReminderEventsLogItemProps {
  event: ReminderEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  specificActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
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
  specificActions = [],
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
      type={event.type}
      specificActions={specificActions}
      title={describeReminderTitle(event)}
    >
      <LogItemDescription>
        <p>{event.payload.content}</p>
        <p>Scheduled for {new Date(event.payload.timestamp).toLocaleString()}</p>
      </LogItemDescription>
    </AbstractEventsLogItem>
  );
}
