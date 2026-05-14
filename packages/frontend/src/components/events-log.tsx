import { FormEvent, useMemo, useState } from 'react';
import { useUpdateEventComment } from '../features/events/use-update-event-comment';
import { EventRecord } from '../shared/types/event';
import { EventsLogAction } from './events-log-actions';
import { useClients } from '../features/clients/use-clients';
import { useEvents } from '../features/events/use-events';
import { Button } from '../shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../shared/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../shared/ui/dialog';
import { Label } from '../shared/ui/label';
import { Textarea } from '../shared/ui/textarea';
import { EventsLogItem } from './events-log-item';

export function EventsLog() {
  const eventsQuery = useEvents(50);
  const clientsQuery = useClients();
  const updateEventComment = useUpdateEventComment();
  const [eventToComment, setEventToComment] = useState<EventRecord | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
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

  function openCommentDialog(event: EventRecord) {
    updateEventComment.reset();
    setEventToComment(event);
    setCommentDraft(event.comment ?? '');
  }

  function closeCommentDialog() {
    if (updateEventComment.isPending) {
      return;
    }

    setEventToComment(null);
    setCommentDraft('');
    updateEventComment.reset();
  }

  async function handleCommentSubmit(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();

    if (!eventToComment) {
      return;
    }

    await updateEventComment.mutateAsync({
      eventId: eventToComment.id,
      comment: commentDraft.trim() ? commentDraft.trim() : null,
    });

    closeCommentDialog();
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
                commonActions={[
                  {
                    id: `comment-${event.id}`,
                    label: event.comment ? 'Edit comment' : 'Add comment',
                    onSelect: () => openCommentDialog(event),
                  } satisfies EventsLogAction,
                ]}
                key={event.id}
                event={event}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No events yet.</p>
        )}

        <Dialog
          open={Boolean(eventToComment)}
          onOpenChange={(open) => {
            if (!open) {
              closeCommentDialog();
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{eventToComment?.comment ? 'Edit comment' : 'Add comment'}</DialogTitle>
              <DialogDescription>
                Common event action. Type-specific actions can be added later using the same action
                list on each event component.
              </DialogDescription>
            </DialogHeader>

            <form className="grid gap-4" id="event-comment-form" onSubmit={handleCommentSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="event-comment">Comment</Label>
                <Textarea
                  id="event-comment"
                  maxLength={255}
                  value={commentDraft}
                  onChange={(event) => setCommentDraft(event.target.value)}
                />
              </div>
            </form>

            <DialogFooter>
              <Button onClick={closeCommentDialog} type="button" variant="ghost">
                Cancel
              </Button>
              <Button
                disabled={updateEventComment.isPending}
                form="event-comment-form"
                type="submit"
              >
                {updateEventComment.isPending ? 'Saving...' : 'Save comment'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
