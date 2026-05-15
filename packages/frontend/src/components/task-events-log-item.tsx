import { AbstractEventsLogItem } from './abstract-events-log-item';
import { EventTypeIcon } from './event-type-icon';
import { EventsLogAction } from './events-log-actions';
import { LogItemDescription, LogItemTitle } from '../shared/ui/log-item';
import { TaskEventRecord } from '../shared/types/event';

interface TaskEventsLogItemProps {
  event: TaskEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
}

function describeTaskEvent(event: TaskEventRecord) {
  const trimmedContent = event.payload.content.trim();

  return trimmedContent ? trimmedContent : `Task created for ${event.client_id}`;
}

function formatStatus(status: TaskEventRecord['payload']['status']) {
  return status === 'complete' ? 'Complete' : 'Pending';
}

export function TaskEventsLogItem({
  event,
  clientLabel,
  commonActions = [],
  cardBorderClassName,
  compact = false,
}: TaskEventsLogItemProps) {
  return (
    <AbstractEventsLogItem
      cardBorderClassName={cardBorderClassName}
      clientLabel={clientLabel}
      compact={compact}
      commonActions={commonActions}
      event={event}
      icon={<EventTypeIcon type="task" />}
      markerClassName="bg-cyan-500"
      specificActions={[]}
      typeLabel="task"
    >
      <LogItemTitle>
        {compact && event.payload.order_id != null
          ? `Task: Order #${event.payload.order_id}`
          : describeTaskEvent(event)}
      </LogItemTitle>
      {!compact ? (
        <LogItemDescription>Status: {formatStatus(event.payload.status)}</LogItemDescription>
      ) : null}
    </AbstractEventsLogItem>
  );
}
