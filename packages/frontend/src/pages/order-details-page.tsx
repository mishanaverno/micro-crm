import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ClientLink } from '../components/client-link';
import { ReminderCalendar } from '../components/reminder-calendar';
import { StatusBadge } from '../components/status-badges';
import { useClients } from '../features/clients/use-clients';
import { useNotes } from '../features/notes/use-notes';
import { useOrder } from '../features/orders/use-order';
import { useReminders } from '../features/reminders/use-reminders';
import { useTasks } from '../features/tasks/use-tasks';
import { useUpdateOrder } from '../features/orders/use-update-order';
import { useUpdateTask } from '../features/tasks/use-update-task';
import { t } from '../shared/lib/i18n';
import { buttonVariants } from '../shared/ui/button';
import { Button } from '../shared/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../shared/ui/card';
import {
  Collapsible,
  CollapsibleContent,
} from '../shared/ui/collapsible';
import { Input } from '../shared/ui/input';
import { Label } from '../shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../shared/ui/select';
import { Textarea } from '../shared/ui/textarea';
import { cn } from '../lib/utils';
import { HttpError } from '../shared/api/http';
import { NoteRecord } from '../shared/types/note';
import { OrderStatus } from '../shared/types/order';
import { TaskRecord } from '../shared/types/task';

const orderStatusOptions = ['created', 'inprogress', 'done'] as const satisfies OrderStatus[];

const initialFormState = {
  title: '',
  price: '',
  content: '',
  status: 'created' as OrderStatus,
};

function formatPrice(price: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(price);
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString() : '—';
}

function formatDateOnly(value?: string | null) {
  return value ? new Date(value).toLocaleDateString() : '—';
}

function formatDuration(milliseconds: number) {
  const absMilliseconds = Math.abs(milliseconds);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (absMilliseconds < hour) {
    const minutes = Math.max(1, Math.round(absMilliseconds / minute));
    return `${minutes} мин.`;
  }

  if (absMilliseconds < day) {
    const hours = Math.max(1, Math.round(absMilliseconds / hour));
    return `${hours} ч.`;
  }

  const days = Math.max(1, Math.round(absMilliseconds / day));
  return `${days} дн.`;
}

function getEndOfCurrentWeek(now = new Date()) {
  const endOfWeek = new Date(now);
  const day = endOfWeek.getDay();
  const daysUntilSunday = day === 0 ? 0 : 7 - day;

  endOfWeek.setDate(endOfWeek.getDate() + daysUntilSunday);
  endOfWeek.setHours(23, 59, 59, 999);

  return endOfWeek;
}

function getDeadlineState(deadline: string) {
  const deadlineDate = new Date(deadline);
  const now = new Date();

  if (Number.isNaN(deadlineDate.getTime())) {
    return 'default';
  }

  if (deadlineDate.getTime() < now.getTime()) {
    return 'overdue';
  }

  if (deadlineDate.getTime() <= getEndOfCurrentWeek(now).getTime()) {
    return 'this-week';
  }

  return 'default';
}

function getDeadlineTooltip(deadline: string) {
  const deadlineDate = new Date(deadline);

  if (Number.isNaN(deadlineDate.getTime())) {
    return '';
  }

  const difference = deadlineDate.getTime() - Date.now();
  const duration = formatDuration(difference);

  return difference < 0
    ? t('common.deadlineOverdueBy', undefined, { duration })
    : t('common.deadlineRemaining', undefined, { duration });
}

function getDeadlineBadgeClassName(deadline: string) {
  switch (getDeadlineState(deadline)) {
    case 'overdue':
      return 'border-transparent bg-rose-700 text-rose-100';
    case 'this-week':
      return 'border-transparent bg-amber-800 text-amber-100';
    default:
      return '';
  }
}

function OrderItemsBlock<T>({
  emptyText,
  errorText,
  getMeta,
  getTitle,
  isError,
  isLoading,
  items,
  title,
  variant = 'default',
}: {
  emptyText: string;
  errorText: string;
  getMeta?: (item: T) => string | null;
  getTitle: (item: T) => string;
  isError: boolean;
  isLoading: boolean;
  items: T[];
  title: string;
  variant?: 'default' | 'inverse';
}) {
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : isError ? (
          <p className="text-sm text-rose-700">{errorText}</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          <ul className="grid gap-2">
            {items.map((item, index) => {
              const meta = getMeta?.(item);

              return (
                <li
                  className={cn(
                    'rounded-[8px] px-3 py-2 text-sm',
                    variant === 'inverse'
                      ? 'border border-black bg-black text-white'
                      : 'border border-border bg-background',
                  )}
                  key={index}
                >
                  {meta ? (
                    <p
                      className={cn(
                        'mt-1 text-xs',
                        variant === 'inverse' ? 'text-white/70' : 'text-muted-foreground',
                      )}
                    >
                      {t('common.createdFromDate', undefined, {
                        date: formatDateOnly(meta),
                      })}
                    </p>
                  ) : null}
                  <p
                    className={cn(
                      'font-medium',
                      variant === 'inverse' ? 'text-white' : 'text-foreground',
                    )}
                  >
                    {getTitle(item)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function OrderTasksBlock({
  emptyText,
  errorText,
  isError,
  isLoading,
  isUpdating,
  onToggleTaskStatus,
  tasks,
}: {
  emptyText: string;
  errorText: string;
  isError: boolean;
  isLoading: boolean;
  isUpdating: boolean;
  onToggleTaskStatus: (task: TaskRecord) => void;
  tasks: TaskRecord[];
}) {
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-lg">{t('page.tasks')}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : isError ? (
          <p className="text-sm text-rose-700">{errorText}</p>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          <ul className="grid gap-2 rounded-[8px] border px-3 py-2">
            {tasks.map((task) => (
              <li
                className="grid gap-2 border-b py-2 text-sm last:border-b-0"
                key={task.id}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs">
                    {t('common.createdFromDate', undefined, {
                      date: formatDateOnly(task.created_at),
                    })}
                  </p>
                  {task.deadline ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{t('common.completeBeforeLabel')}</span>
                      <span
                        className={cn(
                          'inline-flex rounded-full border px-2.5 py-1 text-xs font-medium',
                          getDeadlineBadgeClassName(task.deadline),
                        )}
                        title={getDeadlineTooltip(task.deadline)}
                      >
                        {formatDateOnly(task.deadline)}
                      </span>
                    </div>
                  ) : null}
                </div>
                <div className="flex items-start gap-3">
                  <button
                    aria-label={task.content}
                    aria-checked={task.status === 'complete'}
                    aria-pressed={task.status === 'complete'}
                    className={[
                      'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[3px] border-2 transition-colors',
                      task.status === 'complete'
                        ? 'border-emerald-500 bg-emerald-950 text-emerald-300'
                        : 'border-black/60 text-transparent',
                      isUpdating ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                    ].join(' ')}
                    disabled={isUpdating}
                    role="checkbox"
                    type="button"
                    onClick={() => onToggleTaskStatus(task)}
                  >
                    <svg
                      aria-hidden="true"
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 16 16"
                    >
                      <path
                        d="m3.25 8.25 3 3L12.75 4.75"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.2"
                      />
                    </svg>
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{task.content}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={cn('h-4 w-4 transition-transform', isOpen ? 'rotate-180' : 'rotate-0')}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function OrderDetailsPage() {
  const { orderId } = useParams();
  const orderQuery = useOrder(orderId);
  const clientsQuery = useClients();
  const notesQuery = useNotes({ orderId });
  const tasksQuery = useTasks({ orderId });
  const remindersQuery = useReminders({ orderId });
  const updateOrder = useUpdateOrder();
  const updateTask = useUpdateTask();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [formError, setFormError] = useState<string | null>(null);

  const order = orderQuery.data;

  useEffect(() => {
    if (!order) {
      return;
    }

    setForm({
      title: order.title ?? '',
      price: String(order.price),
      content: order.content,
      status: order.status,
    });
    setFormError(null);
  }, [order]);

  const clientName = useMemo(() => {
    const clients = clientsQuery.data ?? [];
    const client = clients.find((item) => item.id === order?.client_id);

    return client?.name || client?.email || order?.client_id || '—';
  }, [clientsQuery.data, order?.client_id]);

  const mutationError = updateOrder.error;
  const isBusy = updateOrder.isPending;
  const tasksWithDeadlines = useMemo(
    () => (tasksQuery.data ?? []).filter((task) => Boolean(task.deadline)),
    [tasksQuery.data],
  );
  const hasReminderCalendarItems =
    (remindersQuery.data?.length ?? 0) > 0 || tasksWithDeadlines.length > 0;
  const hasChanges = useMemo(() => {
    if (!order) {
      return false;
    }

    return (
      (order.title ?? '') !== form.title ||
      String(order.price) !== form.price ||
      order.content !== form.content ||
      order.status !== form.status
    );
  }, [form.content, form.price, form.status, form.title, order]);

  async function toggleTaskStatus(task: TaskRecord) {
    await updateTask.mutateAsync({
      taskId: task.id,
      payload: {
        client_id: task.client_id,
        content: task.content,
        order_id: task.order_id,
        deadline: task.deadline ?? null,
        status: task.status === 'complete' ? 'pending' : 'complete',
      },
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!order) {
      return;
    }

    if (!form.price || Number.isNaN(Number(form.price))) {
      setFormError(t('form.invalidOrderPrice'));
      return;
    }

    setFormError(null);

    await updateOrder.mutateAsync({
      orderId: order.id,
      payload: {
        title: form.title || undefined,
        price: Number(form.price),
        content: form.content,
        status: form.status,
      },
    });

    setIsEditOpen(false);
  }

  if (orderQuery.isLoading) {
    return (
      <main className="grid gap-4">
        <p className="text-sm text-muted-foreground">{t('placeholder.loadingOrders')}</p>
      </main>
    );
  }

  if (orderQuery.isError || !order) {
    const errorMessage =
      orderQuery.error instanceof HttpError && orderQuery.error.status === 404
        ? t('feedback.orderNotFound')
        : t('feedback.ordersLoadFailed');

    return (
      <main className="grid gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link className={cn(buttonVariants({ variant: 'outline' }), 'w-fit')} to="/orders">
            {t('actions.backToOrders')}
          </Link>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-rose-700">{errorMessage}</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link className={cn(buttonVariants({ variant: 'outline' }), 'w-fit')} to="/orders">
          {t('actions.backToOrders')}
        </Link>
      </div>

      <section className="grid gap-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-2">
                <CardTitle>{`#${order.id} - ${order.title || t('empty.orderTitle')}`}</CardTitle>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <StatusBadge status={order.status} />
                  <ClientLink clientId={order.client_id} name={clientName}>{clientName}</ClientLink>
                  <span>{formatPrice(order.price)}</span>
                  <span>
                    {t('common.createdAt')}: {formatDate(order.created_at)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 xl:ml-auto">
                {!hasChanges ? (
                  <Button
                    className="w-fit gap-2"
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditOpen((current) => !current)}
                  >
                    <ChevronIcon isOpen={isEditOpen} />
                    {t('actions.edit')}
                  </Button>
                ) : null}
                {hasChanges ? (
                  <Button disabled={isBusy} form="order-edit-form" type="submit">
                    {updateOrder.isPending ? t('actions.saving') : t('actions.save')}
                  </Button>
                ) : null}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Collapsible
              className="bg-background"
              open={isEditOpen}
              onOpenChange={setIsEditOpen}
            >
              <CollapsibleContent className="data-[state=closed]:hidden">
                <form className="grid gap-4 pt-2" id="order-edit-form" onSubmit={handleSubmit}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="order-title">{t('common.title')}</Label>
                      <Input
                        id="order-title"
                        value={form.title}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            title: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="order-price">{t('common.price')}</Label>
                      <Input
                        id="order-price"
                        inputMode="decimal"
                        type="number"
                        value={form.price}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            price: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="order-status">{t('common.status')}</Label>
                    <Select
                      value={form.status}
                      onValueChange={(value: OrderStatus) =>
                        setForm((current) => ({
                          ...current,
                          status: value,
                        }))
                      }
                    >
                      <SelectTrigger id="order-status">
                        <SelectValue placeholder={t('placeholder.selectStatus')} />
                      </SelectTrigger>
                      <SelectContent>
                        {orderStatusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status === 'created'
                              ? t('status.created')
                              : status === 'inprogress'
                                ? t('status.inProgress')
                                : t('status.done')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="order-content">{t('common.content')}</Label>
                    <Textarea
                      id="order-content"
                      rows={10}
                      value={form.content}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          content: event.target.value,
                        }))
                      }
                    />
                  </div>

                  {formError ? <p className="text-sm text-rose-700">{formError}</p> : null}
                {mutationError instanceof Error ? (
                  <p className="text-sm text-rose-700">
                    {mutationError.message || t('feedback.orderSaveFailed')}
                  </p>
                ) : null}
                </form>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <OrderTasksBlock
          emptyText={t('empty.orderTasks')}
          errorText={t('feedback.tasksLoadFailed')}
          isError={tasksQuery.isError}
          isLoading={tasksQuery.isLoading}
          isUpdating={updateTask.isPending}
          tasks={tasksQuery.data ?? []}
          onToggleTaskStatus={toggleTaskStatus}
        />
        <OrderItemsBlock<NoteRecord>
          emptyText={t('empty.orderNotes')}
          errorText={t('feedback.notesLoadFailed')}
          getMeta={(note) => formatDate(note.created_at)}
          getTitle={(note) => note.content}
          isError={notesQuery.isError}
          isLoading={notesQuery.isLoading}
          items={notesQuery.data ?? []}
          title={t('page.notes')}
          variant="inverse"
        />
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-lg">{t('page.reminders')}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 flex justify-center">
            {remindersQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
            ) : remindersQuery.isError ? (
              <p className="text-sm text-rose-700">{t('feedback.remindersLoadFailed')}</p>
            ) : !hasReminderCalendarItems ? (
              <p className="text-sm text-muted-foreground">{t('empty.orderReminders')}</p>
            ) : (
              <ReminderCalendar
                reminders={remindersQuery.data ?? []}
                tasks={tasksWithDeadlines}
              />
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
