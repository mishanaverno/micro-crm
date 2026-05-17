import { AbstractEventsLogItem } from './abstract-events-log-item';
import { EventsLogAction } from './events-log-actions';
import { ClientCreatedEventRecord } from '../shared/types/event';

interface ClientCreatedEventsLogItemProps {
  event: ClientCreatedEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
}


function describeClientCreatedTitle(event: ClientCreatedEventRecord) {
  return [event.payload.first_name, event.payload.last_name]
    .filter(Boolean)
    .join(' ');
}

export function ClientCreatedEventsLogItem({
  event,
  clientLabel,
  commonActions = [],
  cardBorderClassName,
  compact = false,
}: ClientCreatedEventsLogItemProps) {
  return (
    <AbstractEventsLogItem
      cardBorderClassName={cardBorderClassName}
      clientLabel={clientLabel}
      compact={compact}
      commonActions={commonActions}
      event={event}
      type="client_created"
      specificActions={[]}
      title={`: ${describeClientCreatedTitle(event)}`}
    >
      <p>{event.payload.first_name} {event.payload.last_name}</p>
      <p>{event.payload.company}</p>
      <p>{event.payload.email}</p>
      <p>{event.payload.phone_number}</p>
    </AbstractEventsLogItem>
  );
}
