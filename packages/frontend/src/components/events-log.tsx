import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useUpdateEventComment } from '../features/events/use-update-event-comment';
import { EventRecord } from '../shared/types/event';
import { EventsLogAction } from './events-log-actions';
import { useClients } from '../features/clients/use-clients';
import { useEvents } from '../features/events/use-events';
import { useNotes } from '../features/notes/use-notes';
import { useCreateNote } from '../features/notes/use-create-note';
import { useCreateReminder } from '../features/reminders/use-create-reminder';
import { useOrders } from '../features/orders/use-orders';
import { useCreateTask } from '../features/tasks/use-create-task';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../shared/ui/dropdown-menu';
import { Label } from '../shared/ui/label';
import { Textarea } from '../shared/ui/textarea';
import { EventsLogItem } from './events-log-item';
import { EventGraphRow } from './ui/event-graph';
import {
  OrderCompleteEventRecord,
  OrderCreatedEventRecord,
  OrderReopenedEventRecord,
  OrderUpdatedEventRecord,
} from '../shared/types/event';

type OrderActionEventRecord =
  | OrderCreatedEventRecord
  | OrderUpdatedEventRecord
  | OrderCompleteEventRecord
  | OrderReopenedEventRecord;

const ORDER_LANE_CLASSES = [
  {
    railClassName: 'bg-sky-500',
    markerBorderClassName: 'border-sky-500',
    curveClassName: 'text-sky-500',
  },
  {
    railClassName: 'bg-violet-500',
    markerBorderClassName: 'border-violet-500',
    curveClassName: 'text-violet-500',
  },
  {
    railClassName: 'bg-amber-500',
    markerBorderClassName: 'border-amber-500',
    curveClassName: 'text-amber-500',
  },
  {
    railClassName: 'bg-emerald-500',
    markerBorderClassName: 'border-emerald-500',
    curveClassName: 'text-emerald-500',
  },
  {
    railClassName: 'bg-rose-500',
    markerBorderClassName: 'border-rose-500',
    curveClassName: 'text-rose-500',
  },
  {
    railClassName: 'bg-cyan-500',
    markerBorderClassName: 'border-cyan-500',
    curveClassName: 'text-cyan-500',
  },
];
const BASE_LANE_APPEARANCE = {
  railClassName: 'bg-border/80',
  markerBorderClassName: 'border-border',
  curveClassName: 'text-border',
};

function resolveOrderId(
  event: EventRecord,
  noteOrderIdsByNoteId: Map<number, number | null>,
) {
  switch (event.type) {
    case 'order_created':
    case 'order_updated':
    case 'order_complete':
    case 'order_reopened':
    case 'paid':
    case 'task':
    case 'reminder':
      return event.payload.order_id;
    case 'note':
      return noteOrderIdsByNoteId.get(event.payload.note_id) ?? null;
    default:
      return null;
  }
}

function isCompactEvent(
  event: EventRecord,
  noteOrderIdsByNoteId: Map<number, number | null>,
  selectedOrderIdsSet: Set<number>,
  hasOrderFocus: boolean,
) {
  if (!hasOrderFocus) {
    return false;
  }

  const orderId = resolveOrderId(event, noteOrderIdsByNoteId);

  if (orderId == null) {
    return true;
  }

  return !selectedOrderIdsSet.has(orderId);
}

export function EventsLog() {
  const eventsQuery = useEvents(50);
  const clientsQuery = useClients();
  const notesQuery = useNotes();
  const ordersQuery = useOrders();
  const createNote = useCreateNote();
  const createTask = useCreateTask();
  const createReminder = useCreateReminder();
  const updateEventComment = useUpdateEventComment();
  const [eventToComment, setEventToComment] = useState<EventRecord | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [orderEventToNote, setOrderEventToNote] = useState<OrderActionEventRecord | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [orderEventToTask, setOrderEventToTask] = useState<OrderActionEventRecord | null>(null);
  const [taskDraft, setTaskDraft] = useState('');
  const [orderEventToReminder, setOrderEventToReminder] = useState<OrderActionEventRecord | null>(null);
  const [reminderDraft, setReminderDraft] = useState('');
  const [reminderTimeDraft, setReminderTimeDraft] = useState('09:00');
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const didInitializeClientFilter = useRef(false);
  const didInitializeOrderFilter = useRef(false);
  const clients = clientsQuery.data ?? [];
  const orders = ordersQuery.data ?? [];
  const allClientIds = useMemo(() => clients.map((client) => client.id), [clients]);
  const clientLabels = useMemo(
    () =>
      new Map(
        clients.map((client) => [
          client.id,
          [client.first_name, client.last_name].filter(Boolean).join(' ') ||
            client.email ||
            client.id,
        ]),
      ),
    [clients],
  );
  const orderLabels = useMemo(
    () =>
      new Map(
        orders.map((order) => {
          const trimmedTitle = order.title?.trim();

          return [
            Number(order.id),
            trimmedTitle ? `#${order.id} — ${trimmedTitle}` : `#${order.id} — order`,
          ];
        }),
      ),
    [orders],
  );
  const noteOrderIdsByNoteId = useMemo(
    () =>
      new Map(
        (notesQuery.data ?? []).map((note) => [
          Number(note.id),
          note.order_id == null ? null : Number(note.order_id),
        ]),
      ),
    [notesQuery.data],
  );
  const orderStatusesByOrderId = useMemo(
    () =>
      new Map(
        (ordersQuery.data ?? []).map((order) => [Number(order.id), order.status]),
      ),
    [ordersQuery.data],
  );
  const selectedClientIdsSet = useMemo(() => new Set(selectedClientIds), [selectedClientIds]);
  const filteredOrders = useMemo(
    () => orders.filter((order) => selectedClientIdsSet.has(order.client_id)),
    [orders, selectedClientIdsSet],
  );
  const filteredOrderIds = useMemo(
    () => filteredOrders.map((order) => Number(order.id)),
    [filteredOrders],
  );
  const selectedOrderIdsSet = useMemo(() => new Set(selectedOrderIds), [selectedOrderIds]);
  const hasOrderFocus = selectedOrderIds.length > 0;
  const visibleEvents = useMemo(
    () =>
      (eventsQuery.data ?? []).filter((event) => {
        if (!selectedClientIdsSet.has(event.client_id)) {
          return false;
        }
        return true;
      }),
    [eventsQuery.data, selectedClientIdsSet],
  );

  useEffect(() => {
    if (!allClientIds.length) {
      return;
    }

    if (!didInitializeClientFilter.current) {
      setSelectedClientIds(allClientIds);
      didInitializeClientFilter.current = true;
      return;
    }

    setSelectedClientIds((currentSelectedClientIds) =>
      currentSelectedClientIds.filter((clientId) => allClientIds.includes(clientId)),
    );
  }, [allClientIds]);

  useEffect(() => {
    if (!filteredOrderIds.length) {
      setSelectedOrderIds([]);
      return;
    }

    if (!didInitializeOrderFilter.current) {
      setSelectedOrderIds([]);
      didInitializeOrderFilter.current = true;
      return;
    }

    setSelectedOrderIds((currentSelectedOrderIds) =>
      currentSelectedOrderIds.filter((orderId) => filteredOrderIds.includes(orderId)),
    );
  }, [filteredOrderIds]);

  const graphRows = useMemo(() => {
    const events = visibleEvents;
    const orderLaneIndices = new Map<number, number>();
    const orderIdsByLaneIndex = new Map<number, number>();
    const orderLaneRanges = new Map<number, Array<{ start: number; end: number }>>();
    const orderIdsWithVisibleCompletion = new Set<number>();
    let nextLaneIndex = 1;

    function getLaneAppearance(laneIndex: number) {
      return laneIndex === 0
        ? BASE_LANE_APPEARANCE
        : ORDER_LANE_CLASSES[(laneIndex - 1) % ORDER_LANE_CLASSES.length];
    }

    events.forEach((event) => {
      const orderId = resolveOrderId(event, noteOrderIdsByNoteId);

      if (!orderId) {
        return;
      }

      if (event.type === 'order_complete') {
        orderIdsWithVisibleCompletion.add(orderId);
      }

      if (!orderLaneIndices.has(orderId)) {
        orderLaneIndices.set(orderId, nextLaneIndex);
        orderIdsByLaneIndex.set(nextLaneIndex, orderId);
        nextLaneIndex += 1;
      }

      const currentRanges = orderLaneRanges.get(orderId) ?? [];
      orderLaneRanges.set(orderId, currentRanges);
    });

    orderLaneRanges.forEach((_, orderId) => {
      const isClosed = orderStatusesByOrderId.get(orderId) === 'done';
      const hasVisibleCompletion = orderIdsWithVisibleCompletion.has(orderId);
      const ranges: Array<{ start: number; end: number }> = [];
      let activeRangeStart: number | null = !isClosed || !hasVisibleCompletion ? 0 : null;

      events.forEach((event, rowIndex) => {
        if (resolveOrderId(event, noteOrderIdsByNoteId) !== orderId) {
          return;
        }

        if (event.type === 'order_complete') {
          if (activeRangeStart == null) {
            activeRangeStart = rowIndex;
          }
          return;
        }

        if (event.type === 'order_created' || event.type === 'order_reopened') {
          if (activeRangeStart != null) {
            ranges.push({ start: activeRangeStart, end: rowIndex });
            activeRangeStart = null;
          }
        }
      });

      orderLaneRanges.set(orderId, ranges);
    });

    return events.map((event, rowIndex) => {
      const orderId = resolveOrderId(event, noteOrderIdsByNoteId);
      const laneIndex = orderId ? (orderLaneIndices.get(orderId) ?? 0) : 0;
      const compact = isCompactEvent(
        event,
        noteOrderIdsByNoteId,
        selectedOrderIdsSet,
        hasOrderFocus,
      );
      const activeLaneIndices = [0];

      orderLaneRanges.forEach((ranges, rangeOrderId) => {
        const isActive = ranges.some((range) => rowIndex >= range.start && rowIndex <= range.end);

        if (!isActive) {
          return;
        }

        const activeLaneIndex = orderLaneIndices.get(rangeOrderId);

        if (activeLaneIndex != null) {
          activeLaneIndices.push(activeLaneIndex);
        }
      });

      return {
        event,
        laneIndex,
        laneCount: Math.max(nextLaneIndex, 1),
        activeLanes: Array.from(new Set(activeLaneIndices))
          .sort((left, right) => left - right)
          .map((activeLaneIndex) => ({
            laneIndex: activeLaneIndex,
            railClassName:
              activeLaneIndex === 0
                ? BASE_LANE_APPEARANCE.railClassName
                : (() => {
                    const laneOrderId = orderIdsByLaneIndex.get(activeLaneIndex);

                    if (laneOrderId == null) {
                      return getLaneAppearance(activeLaneIndex).railClassName;
                    }

                    return hasOrderFocus && !selectedOrderIdsSet.has(laneOrderId)
                      ? BASE_LANE_APPEARANCE.railClassName
                      : getLaneAppearance(activeLaneIndex).railClassName;
                  })(),
            segment:
              (event.type === 'order_created' || event.type === 'order_reopened') &&
              activeLaneIndex === laneIndex &&
              laneIndex > 0
                ? ('top' as const)
                : event.type === 'order_complete' &&
                    activeLaneIndex === laneIndex &&
                    laneIndex > 0
                  ? ('bottom' as const)
                  : ('full' as const),
          })),
        compact,
        branchFromMain:
          (event.type === 'order_created' || event.type === 'order_reopened') &&
          laneIndex > 0,
        mergeToMain: event.type === 'order_complete' && laneIndex > 0,
        branchClassName: compact
          ? BASE_LANE_APPEARANCE.curveClassName
          : getLaneAppearance(laneIndex).curveClassName,
        nodeBorderClassName: compact
          ? BASE_LANE_APPEARANCE.markerBorderClassName
          : getLaneAppearance(laneIndex).markerBorderClassName,
      };
    });
  }, [hasOrderFocus, noteOrderIdsByNoteId, orderStatusesByOrderId, selectedOrderIdsSet, visibleEvents]);

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

  function openCreateNoteDialog(event: OrderActionEventRecord) {
    createNote.reset();
    setOrderEventToNote(event);
    setNoteDraft('');
  }

  function closeCreateNoteDialog() {
    if (createNote.isPending) {
      return;
    }

    setOrderEventToNote(null);
    setNoteDraft('');
    createNote.reset();
  }

  function openCreateTaskDialog(event: OrderActionEventRecord) {
    createTask.reset();
    setOrderEventToTask(event);
    setTaskDraft('');
  }

  function closeCreateTaskDialog() {
    if (createTask.isPending) {
      return;
    }

    setOrderEventToTask(null);
    setTaskDraft('');
    createTask.reset();
  }

  function openCreateReminderDialog(event: OrderActionEventRecord) {
    createReminder.reset();
    setOrderEventToReminder(event);
    setReminderDraft('');
    setReminderTimeDraft('09:00');
  }

  function closeCreateReminderDialog() {
    if (createReminder.isPending) {
      return;
    }

    setOrderEventToReminder(null);
    setReminderDraft('');
    setReminderTimeDraft('09:00');
    createReminder.reset();
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

  async function clearComment(event: EventRecord) {
    await updateEventComment.mutateAsync({
      eventId: event.id,
      comment: null,
    });

    if (eventToComment?.id === event.id) {
      closeCommentDialog();
    }
  }

  async function handleCreateNoteSubmit(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();

    if (!orderEventToNote) {
      return;
    }

    await createNote.mutateAsync({
      client_id: orderEventToNote.client_id,
      order_id: orderEventToNote.payload.order_id,
      content: noteDraft.trim(),
    });

    closeCreateNoteDialog();
  }

  async function handleCreateTaskSubmit(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();

    if (!orderEventToTask) {
      return;
    }

    await createTask.mutateAsync({
      client_id: orderEventToTask.client_id,
      order_id: orderEventToTask.payload.order_id,
      content: taskDraft.trim(),
      status: 'pending',
    });

    closeCreateTaskDialog();
  }

  async function handleCreateReminderSubmit(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();

    if (!orderEventToReminder) {
      return;
    }

    const now = new Date();
    const [hours, minutes] = reminderTimeDraft.split(':').map(Number);
    const timestamp = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
      0,
      0,
    ).toISOString();

    await createReminder.mutateAsync({
      client_id: orderEventToReminder.client_id,
      order_id: orderEventToReminder.payload.order_id,
      content: reminderDraft.trim(),
      timestamp,
    });

    closeCreateReminderDialog();
  }

  function toggleClient(clientId: string) {
    setSelectedClientIds((currentSelectedClientIds) =>
      currentSelectedClientIds.includes(clientId)
        ? currentSelectedClientIds.filter((selectedClientId) => selectedClientId !== clientId)
        : [...currentSelectedClientIds, clientId],
    );
  }

  function selectOnlyClient(clientId: string) {
    setSelectedClientIds([clientId]);
  }

  function showAllClients() {
    setSelectedClientIds(allClientIds);
  }

  function toggleOrder(orderId: number) {
    setSelectedOrderIds((currentSelectedOrderIds) =>
      currentSelectedOrderIds.includes(orderId)
        ? currentSelectedOrderIds.filter((selectedOrderId) => selectedOrderId !== orderId)
        : [...currentSelectedOrderIds, orderId],
    );
  }

  function selectOnlyOrder(orderId: number) {
    setSelectedOrderIds([orderId]);
  }

  function showAllOrders() {
    setSelectedOrderIds(filteredOrderIds);
  }

  function commonActions(event: EventRecord) {
    const actions = [
      {
        id: `comment-${event.id}`,
        label: event.comment ? 'Edit comment' : 'Add comment',
        onSelect: () => openCommentDialog(event),
      } satisfies EventsLogAction
    ]
    if (event.comment) {
      actions.push({
        id: `clear-comment-${event.id}`,
        label: 'Clear comment',
        onSelect: () => {
          void clearComment(event);
        },
      } satisfies EventsLogAction)
    }
    return actions;
  }

  function specificActions(event: EventRecord) {
    const orderId = resolveOrderId(event, noteOrderIdsByNoteId);
    const actions: EventsLogAction[] = [];

    if (orderId != null) {
      if (selectedOrderIdsSet.has(orderId)) {
        actions.push({
          id: `unfocus-order-${event.id}`,
          label: 'Unfocus',
          onSelect: () => {
            setSelectedOrderIds((currentSelectedOrderIds) =>
              currentSelectedOrderIds.filter((selectedOrderId) => selectedOrderId !== orderId),
            );
          },
        } satisfies EventsLogAction);
      } else {
        actions.push({
          id: `focus-order-${event.id}`,
          label: 'Focus',
          onSelect: () => {
            setSelectedOrderIds((currentSelectedOrderIds) =>
              currentSelectedOrderIds.includes(orderId)
                ? currentSelectedOrderIds
                : [...currentSelectedOrderIds, orderId],
            );
          },
        } satisfies EventsLogAction);
      }
    }

    if (
      event.type === 'order_created' ||
      event.type === 'order_updated' ||
      event.type === 'order_reopened'
    ) {
      actions.push(
        {
          id: `create-note-${event.id}`,
          label: 'Create note',
          onSelect: () => openCreateNoteDialog(event),
        } satisfies EventsLogAction,
        {
          id: `create-task-${event.id}`,
          label: 'Create task',
          onSelect: () => openCreateTaskDialog(event),
        } satisfies EventsLogAction,
        {
          id: `create-reminder-${event.id}`,
          label: 'Create reminder',
          onSelect: () => openCreateReminderDialog(event),
        } satisfies EventsLogAction,
      );
    }

    return actions;
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="grid gap-1">
          <CardTitle>Events log</CardTitle>
          <CardDescription>
            Latest 50 events for the current user, sorted by creation date.
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="secondary"
              >
                {`Clients (${selectedClientIds.length}/${allClientIds.length || 0})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[22rem]">
              <DropdownMenuLabel>Filter by client</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 pb-1">
                <Button
                  className="w-full justify-center"
                  disabled={!allClientIds.length || selectedClientIds.length === allClientIds.length}
                  onClick={showAllClients}
                  type="button"
                  variant="ghost"
                >
                  Show all
                </Button>
              </div>
              <div className="grid gap-1">
                {clients.length > 0 ? (
                  clients.map((client) => {
                    const clientLabel = resolveClientLabel(client.id);
                    const isSelected = selectedClientIdsSet.has(client.id);

                    return (
                      <div
                        className="flex items-center justify-between gap-3 rounded-xl px-2 py-1.5"
                        key={client.id}
                      >
                        <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                          {clientLabel}
                        </span>

                        <div className="flex items-center gap-1">
                          <Button
                            aria-label={`${isSelected ? 'Remove' : 'Add'} ${clientLabel} from filter`}
                            className="h-8 w-8 px-0"
                            onClick={() => toggleClient(client.id)}
                            type="button"
                            variant={isSelected ? 'default' : 'ghost'}
                          >
                            ✓
                          </Button>
                          <Button
                            aria-label={`Show only ${clientLabel}`}
                            className="h-8 w-8 px-0"
                            onClick={() => selectOnlyClient(client.id)}
                            type="button"
                            variant={
                              selectedClientIds.length === 1 && isSelected ? 'default' : 'ghost'
                            }
                          >
                            ✓✓
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="px-2 py-1 text-sm text-muted-foreground">No clients yet.</p>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="secondary">
                {`Order focus (${selectedOrderIds.length}/${filteredOrderIds.length || 0})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[24rem]">
              <DropdownMenuLabel>Focus orders</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 pb-1">
                <Button
                  className="w-full justify-center"
                  disabled={
                    !filteredOrderIds.length || selectedOrderIds.length === filteredOrderIds.length
                  }
                  onClick={showAllOrders}
                  type="button"
                  variant="ghost"
                >
                  Unfocus all
                </Button>
              </div>
              <div className="grid gap-1">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const orderId = Number(order.id);
                    const orderLabel = orderLabels.get(orderId) ?? `#${order.id}`;
                    const isSelected = selectedOrderIdsSet.has(orderId);

                    return (
                      <div
                        className="flex items-center justify-between gap-3 rounded-xl px-2 py-1.5"
                        key={order.id}
                      >
                        <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                          {orderLabel}
                        </span>

                        <div className="flex items-center gap-1">
                          <Button
                            aria-label={`${isSelected ? 'Remove' : 'Add'} ${orderLabel} from filter`}
                            className="h-8 w-8 px-0"
                            onClick={() => toggleOrder(orderId)}
                            type="button"
                            variant={isSelected ? 'default' : 'ghost'}
                          >
                            ✓
                          </Button>
                          <Button
                            aria-label={`Show only ${orderLabel}`}
                            className="h-8 w-8 px-0"
                            onClick={() => selectOnlyOrder(orderId)}
                            type="button"
                            variant={
                              selectedOrderIds.length === 1 && isSelected ? 'default' : 'ghost'
                            }
                          >
                            ✓✓
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="px-2 py-1 text-sm text-muted-foreground">
                    No orders for selected clients.
                  </p>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {eventsQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading recent events...</p>
        ) : eventsQuery.isError ? (
          <p className="text-sm text-rose-700">
            {eventsQuery.error?.message || 'Failed to load recent events.'}
          </p>
        ) : notesQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Preparing graph layout...</p>
        ) : notesQuery.isError ? (
          <p className="text-sm text-rose-700">
            {notesQuery.error?.message || 'Failed to load note context for events graph.'}
          </p>
        ) : ordersQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Preparing order branches...</p>
        ) : ordersQuery.isError ? (
          <p className="text-sm text-rose-700">
            {ordersQuery.error?.message || 'Failed to load order context for events graph.'}
          </p>
        ) : visibleEvents.length > 0 ? (
          <div className="grid">
            {graphRows.map(({ event, laneIndex, laneCount, activeLanes, branchFromMain, mergeToMain, branchClassName, nodeBorderClassName, compact }) => (
              <EventGraphRow
                activeLanes={activeLanes}
                branchFromMain={branchFromMain}
                branchClassName={branchClassName}
                key={event.id}
                laneCount={laneCount}
                laneIndex={laneIndex}
                mergeToMain={mergeToMain}
                nodeBorderClassName={nodeBorderClassName}
              >
                <EventsLogItem
                  cardBorderClassName={nodeBorderClassName}
                  clientLabel={resolveClientLabel(event.client_id)}
                  compact={compact}
                  commonActions={commonActions(event)}
                  event={event}
                  specificActions={specificActions(event)}
                />
              </EventGraphRow>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {selectedClientIds.length === 0
              ? 'Select at least one client to show events.'
              : 'No events match the current client filter.'}
          </p>
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

        <Dialog
          open={Boolean(orderEventToNote)}
          onOpenChange={(open) => {
            if (!open) {
              closeCreateNoteDialog();
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create note</DialogTitle>
              <DialogDescription>
                New note for {orderEventToNote ? resolveClientLabel(orderEventToNote.client_id) : 'client'}{' '}
                {orderEventToNote ? `and order #${orderEventToNote.payload.order_id}` : ''}.
              </DialogDescription>
            </DialogHeader>

            <form className="grid gap-4" id="event-create-note-form" onSubmit={handleCreateNoteSubmit}>
              <div className="grid gap-2">
                <Label>Client</Label>
                <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-foreground">
                  {orderEventToNote ? resolveClientLabel(orderEventToNote.client_id) : '—'}
                </p>
              </div>

              <div className="grid gap-2">
                <Label>Order</Label>
                <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-foreground">
                  {orderEventToNote
                    ? orderLabels.get(orderEventToNote.payload.order_id) ?? `#${orderEventToNote.payload.order_id}`
                    : '—'}
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="event-note-content">Content</Label>
                <Textarea
                  id="event-note-content"
                  value={noteDraft}
                  onChange={(event) => setNoteDraft(event.target.value)}
                />
              </div>
            </form>

            <DialogFooter>
              <Button onClick={closeCreateNoteDialog} type="button" variant="ghost">
                Cancel
              </Button>
              <Button
                disabled={createNote.isPending || !noteDraft.trim()}
                form="event-create-note-form"
                type="submit"
              >
                {createNote.isPending ? 'Creating...' : 'Create note'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(orderEventToTask)}
          onOpenChange={(open) => {
            if (!open) {
              closeCreateTaskDialog();
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create task</DialogTitle>
              <DialogDescription>
                New task for {orderEventToTask ? resolveClientLabel(orderEventToTask.client_id) : 'client'}{' '}
                {orderEventToTask ? `and order #${orderEventToTask.payload.order_id}` : ''}.
              </DialogDescription>
            </DialogHeader>

            <form className="grid gap-4" id="event-create-task-form" onSubmit={handleCreateTaskSubmit}>
              <div className="grid gap-2">
                <Label>Client</Label>
                <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-foreground">
                  {orderEventToTask ? resolveClientLabel(orderEventToTask.client_id) : '—'}
                </p>
              </div>

              <div className="grid gap-2">
                <Label>Order</Label>
                <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-foreground">
                  {orderEventToTask
                    ? orderLabels.get(orderEventToTask.payload.order_id) ?? `#${orderEventToTask.payload.order_id}`
                    : '—'}
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="event-task-content">Content</Label>
                <Textarea
                  id="event-task-content"
                  value={taskDraft}
                  onChange={(event) => setTaskDraft(event.target.value)}
                />
              </div>
            </form>

            <DialogFooter>
              <Button onClick={closeCreateTaskDialog} type="button" variant="ghost">
                Cancel
              </Button>
              <Button
                disabled={createTask.isPending || !taskDraft.trim()}
                form="event-create-task-form"
                type="submit"
              >
                {createTask.isPending ? 'Creating...' : 'Create task'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(orderEventToReminder)}
          onOpenChange={(open) => {
            if (!open) {
              closeCreateReminderDialog();
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create reminder</DialogTitle>
              <DialogDescription>
                New reminder for {orderEventToReminder ? resolveClientLabel(orderEventToReminder.client_id) : 'client'}{' '}
                {orderEventToReminder ? `and order #${orderEventToReminder.payload.order_id}` : ''}.
              </DialogDescription>
            </DialogHeader>

            <form className="grid gap-4" id="event-create-reminder-form" onSubmit={handleCreateReminderSubmit}>
              <div className="grid gap-2">
                <Label>Client</Label>
                <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-foreground">
                  {orderEventToReminder ? resolveClientLabel(orderEventToReminder.client_id) : '—'}
                </p>
              </div>

              <div className="grid gap-2">
                <Label>Order</Label>
                <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-foreground">
                  {orderEventToReminder
                    ? orderLabels.get(orderEventToReminder.payload.order_id) ?? `#${orderEventToReminder.payload.order_id}`
                    : '—'}
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="event-reminder-content">Content</Label>
                <Textarea
                  id="event-reminder-content"
                  value={reminderDraft}
                  onChange={(event) => setReminderDraft(event.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="event-reminder-time">Time</Label>
                <input
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                  id="event-reminder-time"
                  onChange={(event) => setReminderTimeDraft(event.target.value)}
                  type="time"
                  value={reminderTimeDraft}
                />
              </div>
            </form>

            <DialogFooter>
              <Button onClick={closeCreateReminderDialog} type="button" variant="ghost">
                Cancel
              </Button>
              <Button
                disabled={createReminder.isPending || !reminderDraft.trim()}
                form="event-create-reminder-form"
                type="submit"
              >
                {createReminder.isPending ? 'Creating...' : 'Create reminder'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
