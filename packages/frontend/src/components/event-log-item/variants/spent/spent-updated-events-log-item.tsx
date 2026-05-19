import { EventsLogAction } from '../../../events-log-actions';
import { SpentEventsLogItem } from './spent-events-log-item';
import { SpentUpdatedEventRecord } from '../../../../shared/types/event';

interface SpentUpdatedEventsLogItemProps {
  event: SpentUpdatedEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  specificActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
}

export function SpentUpdatedEventsLogItem(props: SpentUpdatedEventsLogItemProps) {
  return <SpentEventsLogItem {...props} />;
}
