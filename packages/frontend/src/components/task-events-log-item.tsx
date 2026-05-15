import { AbstractEventsLogItem } from './abstract-events-log-item';
import { EventTypeIcon } from './event-type-icon';
import { EventsLogAction } from './events-log-actions';
import { TaskStatusBadge } from './status-badges';
import { LogItemTitle } from '../shared/ui/log-item';
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
      specificActions={[]}
      typeLabel="task"
    >
      <LogItemTitle>
        {compact ? (
          event.payload.order_id != null ? `Task: Order #${event.payload.order_id}` : 'Task'
        ) : (
          <span className="inline-flex items-center gap-2">
            <input
              checked={event.payload.status === 'complete'}
              className="h-4 w-4 cursor-default accent-foreground"
              disabled
              readOnly
              type="checkbox"
            />
            <span>{describeTaskEvent(event)}</span>
            <TaskStatusBadge status={event.payload.status} />
          </span>
        )}
      </LogItemTitle>
    </AbstractEventsLogItem>
  );
}
