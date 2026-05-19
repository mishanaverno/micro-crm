import { EventsLogAction } from '../../../events-log-actions';
import { ClientCreatedEventsLogItem } from './client-created-events-log-item';
import { ClientUpdatedEventRecord } from '../../../../shared/types/event';

interface ClientUpdatedEventsLogItemProps {
  event: ClientUpdatedEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
}

export function ClientUpdatedEventsLogItem(props: ClientUpdatedEventsLogItemProps) {
  return <ClientCreatedEventsLogItem {...props} />;
}
