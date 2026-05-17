import { AbstractEventsLogItem } from './abstract-events-log-item';
import { EventsLogAction } from './events-log-actions';
import { NoteEventRecord } from '../shared/types/event';
import { LogItemDescription } from './ui/log-item';

interface NoteEventsLogItemProps {
  event: NoteEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  specificActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
}

function describeNoteEvent(event: NoteEventRecord) {
  return event.payload.content.trim();
}

function describeCompactNoteTitle(event: NoteEventRecord) {
  return event.payload.order_id != null
    ? `: Order #${event.payload.order_id}`
    : '';
}

function describeNoteTitle(event: NoteEventRecord) {
  return event.payload.order_id != null
    ? ` created for order #${event.payload.order_id}`
    : '';
}

export function NoteEventsLogItem({
  event,
  clientLabel,
  commonActions = [],
  specificActions = [],
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
      title={describeNoteTitle(event)}
      compactTitle={describeCompactNoteTitle(event)}
      type="note"
      specificActions={specificActions}
    >
      <LogItemDescription>{describeNoteEvent(event)}</LogItemDescription>
    </AbstractEventsLogItem>
  );
}
