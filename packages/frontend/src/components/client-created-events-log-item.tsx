import { AbstractEventsLogItem } from './abstract-events-log-item';
import { EventsLogAction } from './events-log-actions';
import { ClientEventRecord } from '../shared/types/event';

interface ClientCreatedEventsLogItemProps {
  event: ClientEventRecord;
  clientLabel: string;
  commonActions?: EventsLogAction[];
  cardBorderClassName?: string;
  compact?: boolean;
}


function describeClientCreatedTitle(event: ClientEventRecord) {
  return event.payload.name || 'Client';
}

function formatClientStatus(status?: ClientEventRecord['payload']['status']) {
  if (status === 'legal_entity') {
    return 'Юр лицо';
  }

  if (status === 'individual') {
    return 'Физ лицо';
  }

  return null;
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
      type={event.type}
      specificActions={[]}
      title={`: ${describeClientCreatedTitle(event)}`}
    >
      <p>{event.payload.name}</p>
      {formatClientStatus(event.payload.status) ? (
        <p>{formatClientStatus(event.payload.status)}</p>
      ) : null}
      {event.payload.company ? <p>{event.payload.company}</p> : null}
      {event.payload.email ? <p>{event.payload.email}</p> : null}
      {event.payload.phone_number ? <p>{event.payload.phone_number}</p> : null}
    </AbstractEventsLogItem>
  );
}
