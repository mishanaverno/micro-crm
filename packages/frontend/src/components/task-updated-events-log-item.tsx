import { EventsLogAction } from './events-log-actions';
import { TaskEventsLogItem } from './task-events-log-item';
import { TaskUpdatedEventRecord } from '../shared/types/event';

interface TaskUpdatedEventsLogItemProps {
  event: TaskUpdatedEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  specificActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
}

export function TaskUpdatedEventsLogItem(props: TaskUpdatedEventsLogItemProps) {
  return <TaskEventsLogItem {...props} />;
}
