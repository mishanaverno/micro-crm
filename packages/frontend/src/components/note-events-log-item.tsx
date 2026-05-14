import { AbstractEventsLogItem } from './abstract-events-log-item';
import { EventTypeIcon } from './event-type-icon';
import { EventsLogAction } from './events-log-actions';
import { LogItemTitle } from '../shared/ui/log-item';
import { NoteEventRecord } from '../shared/types/event';

interface NoteEventsLogItemProps {
  event: NoteEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
}

function describeNoteEvent(event: NoteEventRecord) {
  const trimmedContent = event.payload.content.trim();

  return trimmedContent ? trimmedContent : `Note created for ${event.client_id}`;
}

export function NoteEventsLogItem({
  event,
  clientLabel,
  commonActions = [],
  cardBorderClassName,
  compact = false,
}: NoteEventsLogItemProps) {
  return (
    <AbstractEventsLogItem
      cardBorderClassName={cardBorderClassName}
      clientLabel={clientLabel}
      compact={compact}
      commonActions={commonActions}
      event={event}
      icon={<EventTypeIcon type="note" />}
      markerClassName="bg-emerald-500"
      specificActions={[]}
      typeLabel="note"
    >
      <LogItemTitle>
        {compact && event.payload.order_id != null
          ? `Note: Order #${event.payload.order_id}`
          : describeNoteEvent(event)}
      </LogItemTitle>
    </AbstractEventsLogItem>
  );
}
