import { EventsLogAction } from './events-log-actions';
import { PaidEventsLogItem } from './paid-events-log-item';
import { PaidDeletedEventRecord } from '../shared/types/event';

interface PaidDeletedEventsLogItemProps {
  event: PaidDeletedEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  specificActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
}

export function PaidDeletedEventsLogItem(props: PaidDeletedEventsLogItemProps) {
  return <PaidEventsLogItem {...props} />;
}
