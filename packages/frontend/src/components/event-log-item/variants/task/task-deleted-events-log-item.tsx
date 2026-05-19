import { EventsLogAction } from '../../../events-log-actions';
import { TaskEventsLogItem } from './task-events-log-item';
import { TaskDeletedEventRecord } from '../../../../shared/types/event';

interface TaskDeletedEventsLogItemProps {
  event: TaskDeletedEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  specificActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
}

export function TaskDeletedEventsLogItem(props: TaskDeletedEventsLogItemProps) {
  return <TaskEventsLogItem {...props} />;
}
