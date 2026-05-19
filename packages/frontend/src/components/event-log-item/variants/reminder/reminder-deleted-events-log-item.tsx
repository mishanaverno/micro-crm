import { EventsLogAction } from '../../../events-log-actions';
import { ReminderEventsLogItem } from './reminder-events-log-item';
import { ReminderDeletedEventRecord } from '../../../../shared/types/event';

interface ReminderDeletedEventsLogItemProps {
  event: ReminderDeletedEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  specificActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
}

export function ReminderDeletedEventsLogItem(props: ReminderDeletedEventsLogItemProps) {
  return <ReminderEventsLogItem {...props} />;
}
