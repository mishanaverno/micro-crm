import { EventsLogAction } from '../../../events-log-actions';
import { NoteEventsLogItem } from './note-events-log-item';
import { NoteCreatedEventRecord } from '../../../../shared/types/event';

interface NoteCreatedEventsLogItemProps {
  event: NoteCreatedEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  specificActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
}

export function NoteCreatedEventsLogItem(props: NoteCreatedEventsLogItemProps) {
  return <NoteEventsLogItem {...props} />;
}
