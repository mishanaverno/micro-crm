import { EventsLogAction } from '../../../events-log-actions';
import { PaidEventsLogItem } from './paid-events-log-item';
import { PaidCreatedEventRecord } from '../../../../shared/types/event';

interface PaidCreatedEventsLogItemProps {
  event: PaidCreatedEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  specificActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
}

export function PaidCreatedEventsLogItem(props: PaidCreatedEventsLogItemProps) {
  return <PaidEventsLogItem {...props} />;
}
