import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUpdateEventComment } from '../features/events/use-update-event-comment';
import { EventRecord } from '../shared/types/event';
import { EventsLogAction } from './events-log-actions';
import { useEvents } from '../features/events/use-events';
import { useCreateNote } from '../features/notes/use-create-note';
import { useCreateReminder } from '../features/reminders/use-create-reminder';
import { useCreateTask } from '../features/tasks/use-create-task';
import { useUpdateTask } from '../features/tasks/use-update-task';
import { Button } from '../shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/ui/card';
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
import { ToggleGroup, ToggleGroupItem } from '../shared/ui/toggle-group';
import { EventsLogItem } from './event-log-item/events-log-item';
import { EventGraphRow } from './ui/event-graph';
import { ReminderDialog } from './reminder-dialog';
import { ClientLink } from './client-link';
import {
  isReminderDateTimeReady,
  toReminderApiDateTime,
} from './reminder-date-time-field';
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
const FILTERABLE_EVENT_TYPES = ['note', 'reminder', 'task', 'paid'] as const;
type FilterableEventType = (typeof FILTERABLE_EVENT_TYPES)[number];
const FILTERABLE_EVENT_TYPE_LABELS: Record<FilterableEventType, string> = {
  note: 'Note',
  reminder: 'Reminder',
  task: 'Task',
  paid: 'Paid',
};

function resolveFilterableEventType(event: EventRecord): FilterableEventType | null {
  if (
    event.type === 'note_created' ||
    event.type === 'note_updated' ||
    event.type === 'note_deleted'
  ) {
    return 'note';
  }

  if (
    event.type === 'task_created' ||
    event.type === 'task_updated' ||
    event.type === 'task_deleted'
  ) {
    return 'task';
  }

  if (
    event.type === 'reminder_created' ||
    event.type === 'reminder_updated' ||
    event.type === 'reminder_deleted'
  ) {
    return 'reminder';
  }

  if (
    event.type === 'paid_created' ||
    event.type === 'paid_updated' ||
    event.type === 'paid_deleted'
  ) {
    return 'paid';
  }

  return null;
}

interface EventLogClientOption {
  id: string;
  label: string;
}

interface EventLogOrderOption {
  id: number;
  client_id: string;
  label: string;
  status: string | null;
}

function resolveOrderId(event: EventRecord) {
  if (event.order_id != null) {
    return event.order_id;
  }

  switch (event.type) {
    case 'order_created':
    case 'order_updated':
    case 'order_deleted':
    case 'order_complete':
    case 'order_reopened':
    case 'paid_created':
    case 'paid_updated':
    case 'paid_deleted':
    case 'task_created':
    case 'task_updated':
    case 'task_deleted':
    case 'reminder_created':
    case 'reminder_updated':
    case 'reminder_deleted':
      return event.payload.order_id;
    case 'note_created':
    case 'note_updated':
    case 'note_deleted':
      return event.payload.order_id ?? null;
    default:
      return null;
  }
}

function isCompactEvent(
  event: EventRecord,
  selectedOrderIdsSet: Set<number>,
  hasOrderFocus: boolean,
) {
  if (!hasOrderFocus) {
    return false;
  }

  const orderId = resolveOrderId(event);

  if (orderId == null) {
    return true;
  }

  return !selectedOrderIdsSet.has(orderId);
}

export function EventsLog() {
  const [searchParams] = useSearchParams();
  const eventsQuery = useEvents(50);
  const createNote = useCreateNote();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
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
  const [reminderTimestampDraft, setReminderTimestampDraft] = useState('');
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [selectedEventTypes, setSelectedEventTypes] = useState<FilterableEventType[]>([
    ...FILTERABLE_EVENT_TYPES,
  ]);
  const didInitializeClientFilter = useRef(false);
  const didInitializeOrderFilter = useRef(false);
  const appliedUrlFocusKeyRef = useRef<string | null>(null);
  const scrolledUrlTargetKeyRef = useRef<string | null>(null);
  const events = eventsQuery.data ?? [];
  const focusOrderIdParam = searchParams.get('focusOrderId');
  const scrollEventTypeParam = searchParams.get('scrollEvent') ?? 'order_created';
  const urlFocusOrderId = focusOrderIdParam == null ? null : Number(focusOrderIdParam);
  const hasValidUrlFocusOrderId = urlFocusOrderId != null && Number.isFinite(urlFocusOrderId);
  const clients = useMemo<EventLogClientOption[]>(() => {
    const labelsByClientId = new Map<string, string>();

    events.forEach((event) => {
      if (labelsByClientId.has(event.client_id)) {
        return;
      }

      labelsByClientId.set(
        event.client_id,
        event.payload.client_name || event.client_id,
      );
    });

    return Array.from(labelsByClientId, ([id, label]) => ({ id, label }));
  }, [events]);
  const allClientIds = useMemo(() => clients.map((client) => client.id), [clients]);
  const clientLabels = useMemo(
    () => new Map(clients.map((client) => [client.id, client.label])),
    [clients],
  );
  const orders = useMemo<EventLogOrderOption[]>(() => {
    const ordersById = new Map<number, EventLogOrderOption>();

    events.forEach((event) => {
      const orderId = resolveOrderId(event);

      if (orderId == null || ordersById.has(orderId)) {
        return;
      }

      const rawTitle =
        event.payload.order_title ??
        (event.type === 'order_created' ||
        event.type === 'order_updated' ||
        event.type === 'order_deleted' ||
        event.type === 'order_complete' ||
        event.type === 'order_reopened'
          ? event.payload.title
          : null);
      const trimmedTitle = rawTitle?.trim();

      ordersById.set(orderId, {
        id: orderId,
        client_id: event.client_id,
        label: trimmedTitle ? `#${orderId} — ${trimmedTitle}` : `#${orderId} — order`,
        status:
          event.payload.order_status ??
          (event.type === 'order_created' ||
          event.type === 'order_updated' ||
          event.type === 'order_deleted' ||
          event.type === 'order_complete' ||
          event.type === 'order_reopened'
            ? event.payload.status
            : null),
      });
    });

    return Array.from(ordersById.values());
  }, [events]);
  const orderLabels = useMemo(
    () => new Map(orders.map((order) => [order.id, order.label])),
    [orders],
  );
  const orderStatusesByOrderId = useMemo(
    () => new Map(orders.map((order) => [order.id, order.status])),
    [orders],
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
  const selectedEventTypesSet = useMemo(
    () => new Set<string>(selectedEventTypes),
    [selectedEventTypes],
  );
  const hasOrderFocus = selectedOrderIds.length > 0;
  const visibleEvents = useMemo(
    () =>
      (eventsQuery.data ?? []).filter((event) => {
        if (!selectedClientIdsSet.has(event.client_id)) {
          return false;
        }

        const eventFilterType = resolveFilterableEventType(event);

        if (eventFilterType && !selectedEventTypesSet.has(eventFilterType)) {
          return false;
        }

        return true;
      }),
    [eventsQuery.data, selectedClientIdsSet, selectedEventTypesSet],
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
      didInitializeOrderFilter.current = true;

      if (
        hasValidUrlFocusOrderId &&
        urlFocusOrderId != null &&
        filteredOrderIds.includes(urlFocusOrderId)
      ) {
        setSelectedOrderIds([urlFocusOrderId]);
      } else {
        setSelectedOrderIds([]);
      }

      return;
    }

    setSelectedOrderIds((currentSelectedOrderIds) =>
      currentSelectedOrderIds.filter((orderId) => filteredOrderIds.includes(orderId)),
    );
  }, [filteredOrderIds, hasValidUrlFocusOrderId, urlFocusOrderId]);

  useEffect(() => {
    if (!hasValidUrlFocusOrderId || urlFocusOrderId == null || !orders.length) {
      return;
    }

    const targetOrder = orders.find((order) => order.id === urlFocusOrderId);

    if (!targetOrder) {
      return;
    }

    const focusKey = `${urlFocusOrderId}:${scrollEventTypeParam}`;

    if (appliedUrlFocusKeyRef.current === focusKey) {
      return;
    }

    setSelectedClientIds((currentSelectedClientIds) =>
      currentSelectedClientIds.includes(targetOrder.client_id)
        ? currentSelectedClientIds
        : [...currentSelectedClientIds, targetOrder.client_id],
    );
    setSelectedOrderIds([urlFocusOrderId]);
    appliedUrlFocusKeyRef.current = focusKey;
  }, [hasValidUrlFocusOrderId, orders, scrollEventTypeParam, urlFocusOrderId]);

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
      const orderId = resolveOrderId(event);

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
        if (resolveOrderId(event) !== orderId) {
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
      const orderId = resolveOrderId(event);
      const laneIndex = orderId ? (orderLaneIndices.get(orderId) ?? 0) : 0;
      const compact = isCompactEvent(
        event,
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
  }, [hasOrderFocus, orderStatusesByOrderId, selectedOrderIdsSet, visibleEvents]);

  const eventCommonActions = useMemo(
    () =>
      new Map(
        visibleEvents.map((event) => {
          const actions = [
            {
              id: `comment-${event.id}`,
              label: event.comment ? 'Edit comment' : 'Add comment',
              onSelect: () => openCommentDialog(event),
            } satisfies EventsLogAction,
          ];

          if (event.comment) {
            actions.push({
              id: `clear-comment-${event.id}`,
              label: 'Clear comment',
              onSelect: () => {
                void clearComment(event);
              },
            } satisfies EventsLogAction);
          }

          return [event.id, actions];
        }),
      ),
    [visibleEvents, updateEventComment.isPending],
  );

  const eventSpecificActions = useMemo(
    () =>
      new Map(
        visibleEvents.map((event) => {
          const orderId = resolveOrderId(event);
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
            (event.type === 'task_created' || event.type === 'task_updated') &&
            event.payload.status === 'pending'
          ) {
            actions.push({
              id: `complete-task-${event.id}`,
              label: 'Complete',
              onSelect: () => {
                void completeTask(event);
              },
            } satisfies EventsLogAction);
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

          return [event.id, actions];
        }),
      ),
    [selectedOrderIdsSet, visibleEvents],
  );

  useEffect(() => {
    if (!hasValidUrlFocusOrderId || urlFocusOrderId == null) {
      return;
    }

    if (!selectedOrderIdsSet.has(urlFocusOrderId)) {
      return;
    }

    const targetEvent = visibleEvents.find(
      (event) =>
        event.type === scrollEventTypeParam &&
        resolveOrderId(event) === urlFocusOrderId,
    );

    if (!targetEvent) {
      return;
    }

    const targetKey = `${urlFocusOrderId}:${scrollEventTypeParam}:${targetEvent.id}`;

    if (scrolledUrlTargetKeyRef.current === targetKey) {
      return;
    }

    requestAnimationFrame(() => {
      const targetElement = document.getElementById(`event-log-event-${targetEvent.id}`);

      targetElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });

      window.setTimeout(() => {
        targetElement?.scrollIntoView({ behavior: 'auto', block: 'center' });
      }, 180);
    });
    scrolledUrlTargetKeyRef.current = targetKey;
  }, [
    hasValidUrlFocusOrderId,
    scrollEventTypeParam,
    selectedOrderIdsSet,
    urlFocusOrderId,
    visibleEvents,
  ]);

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
    setReminderTimestampDraft('');
  }

  function closeCreateReminderDialog() {
    if (createReminder.isPending) {
      return;
    }

    setOrderEventToReminder(null);
    setReminderDraft('');
    setReminderTimestampDraft('');
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
      deadline: null,
    });

    closeCreateTaskDialog();
  }

  async function handleCreateReminderSubmit(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();

    if (!orderEventToReminder || !isReminderDateTimeReady(reminderTimestampDraft)) {
      return;
    }

    await createReminder.mutateAsync({
      client_id: orderEventToReminder.client_id,
      order_id: orderEventToReminder.payload.order_id,
      content: reminderDraft.trim(),
      timestamp: toReminderApiDateTime(reminderTimestampDraft),
    });

    closeCreateReminderDialog();
  }

  async function completeTask(event: EventRecord) {
    if (event.type !== 'task_created' && event.type !== 'task_updated') {
      return;
    }

    await updateTask.mutateAsync({
      taskId: String(event.payload.task_id),
      payload: {
        client_id: event.client_id,
        order_id: event.payload.order_id ?? null,
        content: event.payload.content,
        status: 'complete',
        deadline: event.payload.deadline ?? null,
      },
    });
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="grid gap-1">
          <CardTitle>Events log</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <ToggleGroup
            aria-label="Filter event types"
            className="rounded-md border border-border bg-muted p-1"
            type="multiple"
            value={selectedEventTypes}
            variant="ghost"
            onValueChange={(value) => setSelectedEventTypes(value as FilterableEventType[])}
          >
            {FILTERABLE_EVENT_TYPES.map((eventType) => (
              <ToggleGroupItem
                aria-label={`Toggle ${FILTERABLE_EVENT_TYPE_LABELS[eventType]} events`}
                key={eventType}
                value={eventType}
              >
                {FILTERABLE_EVENT_TYPE_LABELS[eventType]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

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
        ) : visibleEvents.length > 0 ? (
          <div className="grid">
            {graphRows.map(({ event, laneIndex, laneCount, activeLanes, branchFromMain, mergeToMain, branchClassName, nodeBorderClassName, compact }) => (
              <div
                className="scroll-mt-6"
                id={`event-log-event-${event.id}`}
                key={event.id}
              >
                <EventGraphRow
                  activeLanes={activeLanes}
                  branchFromMain={branchFromMain}
                  branchClassName={branchClassName}
                  laneCount={laneCount}
                  laneIndex={laneIndex}
                  mergeToMain={mergeToMain}
                  nodeBorderClassName={nodeBorderClassName}
                >
                  <EventsLogItem
                    cardBorderClassName={nodeBorderClassName}
                    clientLabel={resolveClientLabel(event.client_id)}
                    compact={compact}
                    commonActions={eventCommonActions.get(event.id) ?? []}
                    event={event}
                    specificActions={eventSpecificActions.get(event.id) ?? []}
                  />
                </EventGraphRow>
              </div>
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
                  New note for{' '}
                  {orderEventToNote ? (
                    <ClientLink clientId={orderEventToNote.client_id}>
                      {resolveClientLabel(orderEventToNote.client_id)}
                    </ClientLink>
                  ) : (
                    'client'
                  )}{' '}
                  {orderEventToNote ? `and order #${orderEventToNote.payload.order_id}` : ''}.
                </DialogDescription>
              </DialogHeader>

            <form className="grid gap-4" id="event-create-note-form" onSubmit={handleCreateNoteSubmit}>
              <div className="grid gap-2">
                <Label>Client</Label>
                <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-foreground">
                  {orderEventToNote ? (
                    <ClientLink clientId={orderEventToNote.client_id}>
                      {resolveClientLabel(orderEventToNote.client_id)}
                    </ClientLink>
                  ) : (
                    '—'
                  )}
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
                  New task for{' '}
                  {orderEventToTask ? (
                    <ClientLink clientId={orderEventToTask.client_id}>
                      {resolveClientLabel(orderEventToTask.client_id)}
                    </ClientLink>
                  ) : (
                    'client'
                  )}{' '}
                  {orderEventToTask ? `and order #${orderEventToTask.payload.order_id}` : ''}.
                </DialogDescription>
              </DialogHeader>

            <form className="grid gap-4" id="event-create-task-form" onSubmit={handleCreateTaskSubmit}>
              <div className="grid gap-2">
                <Label>Client</Label>
                <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-foreground">
                  {orderEventToTask ? (
                    <ClientLink clientId={orderEventToTask.client_id}>
                      {resolveClientLabel(orderEventToTask.client_id)}
                    </ClientLink>
                  ) : (
                    '—'
                  )}
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

        <ReminderDialog
          clientField={{
            mode: 'fixed',
            label: orderEventToReminder ? (
              <ClientLink clientId={orderEventToReminder.client_id}>
                {resolveClientLabel(orderEventToReminder.client_id)}
              </ClientLink>
            ) : (
              '—'
            ),
          }}
          content={reminderDraft}
          description={
            <>
              New reminder for{' '}
              {orderEventToReminder ? (
                <ClientLink clientId={orderEventToReminder.client_id}>
                  {resolveClientLabel(orderEventToReminder.client_id)}
                </ClientLink>
              ) : (
                'client'
              )}
              {orderEventToReminder ? ` and order #${orderEventToReminder.payload.order_id}` : ''}
              .
            </>
          }
          formId="event-create-reminder-form"
          isPending={createReminder.isPending}
          isSubmitDisabled={!reminderDraft.trim()}
          open={Boolean(orderEventToReminder)}
          onContentChange={setReminderDraft}
          onOpenChange={(open) => {
            if (!open) {
              closeCreateReminderDialog();
            }
          }}
          onSubmit={handleCreateReminderSubmit}
          onTimestampChange={setReminderTimestampDraft}
          orderField={{
            mode: 'fixed',
            label: orderEventToReminder
              ? orderLabels.get(orderEventToReminder.payload.order_id) ??
                `#${orderEventToReminder.payload.order_id}`
              : '—',
          }}
          submitLabel="Create reminder"
          timestamp={reminderTimestampDraft}
          title="Create reminder"
        />
      </CardContent>
    </Card>
  );
}
