import { EventsLogAction } from '../../../events-log-actions';
import { NoteEventsLogItem } from './note-events-log-item';
import { NoteUpdatedEventRecord } from '../../../../shared/types/event';

interface NoteUpdatedEventsLogItemProps {
  event: NoteUpdatedEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  specificActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
}

export function NoteUpdatedEventsLogItem(props: NoteUpdatedEventsLogItemProps) {
  return <NoteEventsLogItem {...props} />;
}
