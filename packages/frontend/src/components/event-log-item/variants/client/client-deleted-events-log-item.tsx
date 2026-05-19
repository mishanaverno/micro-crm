import { EventsLogAction } from '../../../events-log-actions';
import { ClientCreatedEventsLogItem } from './client-created-events-log-item';
import { ClientDeletedEventRecord } from '../../../../shared/types/event';

interface ClientDeletedEventsLogItemProps {
  event: ClientDeletedEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
}

export function ClientDeletedEventsLogItem(props: ClientDeletedEventsLogItemProps) {
  return <ClientCreatedEventsLogItem {...props} />;
}
