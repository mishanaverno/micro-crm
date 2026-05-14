import { AbstractEventsLogItem } from './abstract-events-log-item';
import { LogItemTitle } from '../shared/ui/log-item';
import { NoteEventRecord } from '../shared/types/event';

interface NoteEventsLogItemProps {
  event: NoteEventRecord;
  clientLabel: string;
}

function describeNoteEvent(event: NoteEventRecord) {
  const trimmedContent = event.payload.content.trim();

  return trimmedContent ? trimmedContent : `Note created for ${event.client_id}`;
}

export function NoteEventsLogItem({ event, clientLabel }: NoteEventsLogItemProps) {
  return (
    <AbstractEventsLogItem
      clientLabel={clientLabel}
      event={event}
      markerClassName="bg-emerald-500"
      typeLabel="note"
    >
      <LogItemTitle>{describeNoteEvent(event)}</LogItemTitle>
    </AbstractEventsLogItem>
  );
}
