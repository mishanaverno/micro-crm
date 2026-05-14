import { useMemo } from 'react';
import { useClients } from '../features/clients/use-clients';
import { useEvents } from '../features/events/use-events';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../shared/ui/card';
import { EventsLogItem } from './events-log-item';

export function EventsLog() {
  const eventsQuery = useEvents(50);
  const clientsQuery = useClients();
  const clientLabels = useMemo(
    () =>
      new Map(
        (clientsQuery.data ?? []).map((client) => [
          client.id,
          [client.first_name, client.last_name].filter(Boolean).join(' ') ||
            client.email ||
            client.id,
        ]),
      ),
    [clientsQuery.data],
  );

  function resolveClientLabel(clientId: string) {
    return clientLabels.get(clientId) ?? clientId;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Events log</CardTitle>
        <CardDescription>
          Latest 50 events for the current user, sorted by creation date.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {eventsQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading recent events...</p>
        ) : eventsQuery.isError ? (
          <p className="text-sm text-rose-700">
            {eventsQuery.error?.message || 'Failed to load recent events.'}
          </p>
        ) : eventsQuery.data && eventsQuery.data.length > 0 ? (
          <div className="relative grid gap-4 pl-0 before:absolute before:bottom-2 before:left-[0.4375rem] before:top-2 before:w-px before:bg-border/80">
            {eventsQuery.data.map((event) => (
              <EventsLogItem
                clientLabel={resolveClientLabel(event.client_id)}
                key={event.id}
                event={event}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No events yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
