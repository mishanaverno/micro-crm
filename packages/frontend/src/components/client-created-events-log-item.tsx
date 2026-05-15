import { AbstractEventsLogItem } from './abstract-events-log-item';
import { EventTypeIcon } from './event-type-icon';
import { EventsLogAction } from './events-log-actions';
import { ClientCreatedEventRecord } from '../shared/types/event';
import { LogItemTitle } from '../shared/ui/log-item';

interface ClientCreatedEventsLogItemProps {
  event: ClientCreatedEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
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
      icon={<EventTypeIcon type="client_created" />}
      specificActions={[]}
      typeLabel="client created"
    >
      <LogItemTitle>{describeClientCreatedEvent(event)}</LogItemTitle>
    </AbstractEventsLogItem>
  );
}
