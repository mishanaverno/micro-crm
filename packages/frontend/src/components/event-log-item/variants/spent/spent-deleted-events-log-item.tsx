import { EventsLogAction } from '../../../events-log-actions';
import { SpentEventsLogItem } from '../../spent-events-log-item';
import { SpentDeletedEventRecord } from '../../../../shared/types/event';

interface SpentDeletedEventsLogItemProps {
  event: SpentDeletedEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  specificActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
}

export function SpentDeletedEventsLogItem(props: SpentDeletedEventsLogItemProps) {
  return <SpentEventsLogItem {...props} />;
}
