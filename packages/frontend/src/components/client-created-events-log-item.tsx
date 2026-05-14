import { AbstractEventsLogItem } from './abstract-events-log-item';
import { ClientCreatedEventRecord } from '../shared/types/event';
import { LogItemTitle } from '../shared/ui/log-item';

interface ClientCreatedEventsLogItemProps {
  event: ClientCreatedEventRecord;
  clientLabel: string;
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
}: ClientCreatedEventsLogItemProps) {
  return (
    <AbstractEventsLogItem
      clientLabel={clientLabel}
      event={event}
      markerClassName="bg-sky-500"
      typeLabel="client created"
    >
      <LogItemTitle>{describeClientCreatedEvent(event)}</LogItemTitle>
    </AbstractEventsLogItem>
  );
}
