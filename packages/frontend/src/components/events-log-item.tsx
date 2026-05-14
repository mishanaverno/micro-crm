import { ClientCreatedEventsLogItem } from './client-created-events-log-item';
import { NoteEventsLogItem } from './note-events-log-item';
import { EventRecord } from '../shared/types/event';

interface EventsLogItemProps {
  event: EventRecord;
  clientLabel: string;
}

export function EventsLogItem({ event, clientLabel }: EventsLogItemProps) {
  switch (event.type) {
    case 'client_created':
      return <ClientCreatedEventsLogItem clientLabel={clientLabel} event={event} />;
    case 'note':
      return <NoteEventsLogItem clientLabel={clientLabel} event={event} />;
    default:
      return null;
  }
}
