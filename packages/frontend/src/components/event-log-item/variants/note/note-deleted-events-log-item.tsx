import { EventsLogAction } from '../../../events-log-actions';
import { NoteEventsLogItem } from './note-events-log-item';
import { NoteDeletedEventRecord } from '../../../../shared/types/event';

interface NoteDeletedEventsLogItemProps {
  event: NoteDeletedEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  specificActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
}

export function NoteDeletedEventsLogItem(props: NoteDeletedEventsLogItemProps) {
  return <NoteEventsLogItem {...props} />;
}
