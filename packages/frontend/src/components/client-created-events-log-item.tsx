import { AbstractEventsLogItem } from './abstract-events-log-item';
import { EventsLogAction } from './events-log-actions';
import { ClientCreatedEventRecord } from '../shared/types/event';
import { LogItemTitle } from '../shared/ui/log-item';

interface ClientCreatedEventsLogItemProps {
  event: ClientCreatedEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
}

function describeClientCreatedEvent(event: ClientCreatedEventRecord) {
  const fullName = [event.payload.first_name, event.payload.last_name]
    .filter(Boolean)
    .join(' ');

  return fullName || event.payload.email
    ? `Client created: ${fullName || event.payload.email}`
    : `Client created for ${event.client_id}`;
}

export function ClientCreatedEventsLogItem({
  event,
  clientLabel,
  commonActions = [],
}: ClientCreatedEventsLogItemProps) {
  return (
    <AbstractEventsLogItem
      clientLabel={clientLabel}
      commonActions={commonActions}
      event={event}
      markerClassName="bg-sky-500"
      specificActions={[]}
      typeLabel="client created"
    >
      <LogItemTitle>{describeClientCreatedEvent(event)}</LogItemTitle>
    </AbstractEventsLogItem>
  );
}
