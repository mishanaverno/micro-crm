import { EventsLogAction } from '../../../events-log-actions';
import { SpentEventsLogItem } from './spent-events-log-item';
import { SpentCreatedEventRecord } from '../../../../shared/types/event';

interface SpentCreatedEventsLogItemProps {
  event: SpentCreatedEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  specificActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
}

export function SpentCreatedEventsLogItem(props: SpentCreatedEventsLogItemProps) {
  return <SpentEventsLogItem {...props} />;
}
