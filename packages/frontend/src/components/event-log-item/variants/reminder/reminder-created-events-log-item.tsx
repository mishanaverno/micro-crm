import { EventsLogAction } from '../../../events-log-actions';
import { ReminderEventsLogItem } from './reminder-events-log-item';
import { ReminderCreatedEventRecord } from '../../../../shared/types/event';

interface ReminderCreatedEventsLogItemProps {
  event: ReminderCreatedEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  specificActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
}

export function ReminderCreatedEventsLogItem(props: ReminderCreatedEventsLogItemProps) {
  return <ReminderEventsLogItem {...props} />;
}
