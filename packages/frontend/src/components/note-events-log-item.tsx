import { AbstractEventsLogItem } from './abstract-events-log-item';
import { EventsLogAction } from './events-log-actions';
import { LogItemTitle } from '../shared/ui/log-item';
import { NoteEventRecord } from '../shared/types/event';

interface NoteEventsLogItemProps {
  event: NoteEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
}

function describeNoteEvent(event: NoteEventRecord) {
  const trimmedContent = event.payload.content.trim();

  return trimmedContent ? trimmedContent : `Note created for ${event.client_id}`;
}

export function NoteEventsLogItem({
  event,
  clientLabel,
  commonActions = [],
}: NoteEventsLogItemProps) {
  return (
    <AbstractEventsLogItem
      clientLabel={clientLabel}
      commonActions={commonActions}
      event={event}
      markerClassName="bg-emerald-500"
      specificActions={[]}
      typeLabel="note"
    >
      <LogItemTitle>{describeNoteEvent(event)}</LogItemTitle>
    </AbstractEventsLogItem>
  );
}
