import { EventsLogAction } from '../../../events-log-actions';
import { TaskEventsLogItem } from './task-events-log-item';
import { TaskCreatedEventRecord } from '../../../../shared/types/event';

interface TaskCreatedEventsLogItemProps {
  event: TaskCreatedEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  specificActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
}

export function TaskCreatedEventsLogItem(props: TaskCreatedEventsLogItemProps) {
  return <TaskEventsLogItem {...props} />;
}
