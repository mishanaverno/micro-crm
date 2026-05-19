import { EventsLogAction } from './events-log-actions';
import { PaidEventsLogItem } from './paid-events-log-item';
import { PaidUpdatedEventRecord } from '../shared/types/event';

interface PaidUpdatedEventsLogItemProps {
  event: PaidUpdatedEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  specificActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
}

export function PaidUpdatedEventsLogItem(props: PaidUpdatedEventsLogItemProps) {
  return <PaidEventsLogItem {...props} />;
}
