import { EventsLogAction } from './events-log-actions';
import { ReminderEventsLogItem } from './reminder-events-log-item';
import { ReminderUpdatedEventRecord } from '../shared/types/event';

interface ReminderUpdatedEventsLogItemProps {
  event: ReminderUpdatedEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  specificActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
}

export function ReminderUpdatedEventsLogItem(props: ReminderUpdatedEventsLogItemProps) {
  return <ReminderEventsLogItem {...props} />;
}
