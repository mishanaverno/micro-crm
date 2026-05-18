import { AbstractEventsLogItem } from './abstract-events-log-item';
import { EventsLogAction } from './events-log-actions';
import { LogItemDescription } from '../shared/ui/log-item';
import { TaskEventRecord } from '../shared/types/event';

interface TaskEventsLogItemProps {
  event: TaskEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  specificActions?: EventsLogAction[];
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
  specificActions = [],
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
      title={
        event.payload.order_id 
        ? ` for order #${event.payload.order_id}` 
        : ''
      }
      compactTitle={
        event.payload.order_id 
        ? `: Order #${event.payload.order_id}` 
        : ''
      }
      type="task"
      badge={event.payload.status}
      specificActions={specificActions}
    >
      <LogItemDescription>
        <span className="inline-flex items-center gap-2">
          <input
            checked={event.payload.status === 'complete'}
            className="h-4 w-4 cursor-default accent-foreground"
            disabled
            readOnly
            type="checkbox"
          />
          <span>{describeTaskEvent(event)}</span>
        </span>
        {event.payload.deadline ? (
          <p>Deadline {new Date(event.payload.deadline).toLocaleString()}</p>
        ) : null}
      </LogItemDescription>
    </AbstractEventsLogItem>
  );
}
