import { useEvents } from '../features/events/use-events';
import { EventRecord } from '../shared/types/event';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../shared/ui/card';

function describeEvent(event: EventRecord) {
  if (event.type === 'client_created') {
    const firstName =
      typeof event.payload.first_name === 'string' ? event.payload.first_name : '';
    const lastName =
      typeof event.payload.last_name === 'string' ? event.payload.last_name : '';
    const email = typeof event.payload.email === 'string' ? event.payload.email : '';
    const fullName = [firstName, lastName].filter(Boolean).join(' ');

    return fullName || email
      ? `Client created: ${fullName || email}`
      : `Client created for ${event.client_id}`;
  }

  if (event.type === 'note') {
    const content = typeof event.payload.content === 'string' ? event.payload.content : '';
    const trimmedContent = content.trim();

    return trimmedContent
      ? `Note created: ${trimmedContent}`
      : `Note created for ${event.client_id}`;
  }

  return event.comment || `Event: ${event.type}`;
}

export function ActivityLog() {
  const eventsQuery = useEvents(50);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity log</CardTitle>
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
          <div className="grid gap-3">
            {eventsQuery.data.map((event) => (
              <article
                key={event.id}
                className="rounded-3xl border border-border/70 bg-card/70 px-4 py-3 shadow-sm"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="grid gap-1">
                    <p className="text-sm font-medium text-foreground">{describeEvent(event)}</p>
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      {event.type}
                    </p>
                  </div>
                  <time className="text-xs text-muted-foreground" dateTime={event.created_at}>
                    {new Date(event.created_at).toLocaleString()}
                  </time>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No events yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
