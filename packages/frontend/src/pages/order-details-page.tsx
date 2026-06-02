import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ClientLink } from '../components/client-link';
import { ReminderCalendar } from '../components/reminder-calendar';
import { StatusBadge } from '../components/status-badges';
import { useClients } from '../features/clients/use-clients';
import { useNotes } from '../features/notes/use-notes';
import { useDeleteOrder } from '../features/orders/use-delete-order';
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
  CardDescription,
  CardHeader,
  CardTitle,
} from '../shared/ui/card';
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2">
      <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-medium text-foreground">
        {value || '—'}
      </dd>
    </div>
  );
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
      return 'border-transparent bg-rose-100 text-rose-700';
    case 'this-week':
      return 'border-transparent bg-amber-100 text-amber-800';
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
}: {
  emptyText: string;
  errorText: string;
  getMeta?: (item: T) => string | null;
  getTitle: (item: T) => string;
  isError: boolean;
  isLoading: boolean;
  items: T[];
  title: string;
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
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                  key={index}
                >
                  <p className="font-medium text-foreground">{getTitle(item)}</p>
                  {meta ? (
                    <p className="mt-1 text-xs text-muted-foreground">{meta}</p>
                  ) : null}
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
          <ul className="grid gap-2">
            {tasks.map((task) => (
              <li
                className="grid gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm"
                key={task.id}
              >
                {task.deadline ? (
                  <div className="flex justify-end">
                    <span
                      className={cn(
                        'inline-flex rounded-full border px-2.5 py-1 text-xs font-medium',
                        getDeadlineBadgeClassName(task.deadline),
                      )}
                      title={getDeadlineTooltip(task.deadline)}
                    >
                      {t('common.completeBefore', undefined, {
                        deadline: formatDate(task.deadline),
                      })}
                    </span>
                  </div>
                ) : null}
                <div className="flex items-start gap-3">
                  <button
                    aria-label={task.content}
                    aria-checked={task.status === 'complete'}
                    aria-pressed={task.status === 'complete'}
                    className={[
                      'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[3px] border-2 transition-colors',
                      task.status === 'complete'
                        ? 'border-emerald-600 bg-emerald-100 text-emerald-700'
                        : 'border-foreground/70 bg-background text-transparent hover:bg-muted',
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
                    <p className="font-medium text-foreground">{task.content}</p>
                    {!task.deadline ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(task.created_at)}
                      </p>
                    ) : null}
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

export function OrderDetailsPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const orderQuery = useOrder(orderId);
  const clientsQuery = useClients();
  const notesQuery = useNotes({ orderId });
  const tasksQuery = useTasks({ orderId });
  const remindersQuery = useReminders({ orderId });
  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();
  const updateTask = useUpdateTask();
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

  const mutationError = updateOrder.error ?? deleteOrder.error;
  const isBusy = updateOrder.isPending || deleteOrder.isPending;

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
  }

  async function handleDelete() {
    if (!order) {
      return;
    }

    const confirmed = window.confirm(t('dialog.orderDeleteDescription'));

    if (!confirmed) {
      return;
    }

    await deleteOrder.mutateAsync(order.id);
    navigate('/orders');
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

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_380px]">
        <Card>
          <CardHeader>
            <CardTitle>{t('page.orderDetails')}</CardTitle>
            <CardDescription>
              #{order.id} {order.title ? `— ${order.title}` : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={handleSubmit}>
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

              <div className="flex flex-wrap justify-between gap-3">
                <Button
                  className="bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500"
                  disabled={isBusy}
                  type="button"
                  onClick={handleDelete}
                >
                  {deleteOrder.isPending ? t('actions.deleting') : t('actions.delete')}
                </Button>
                <Button disabled={isBusy} type="submit">
                  {updateOrder.isPending ? t('actions.saving') : t('actions.save')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('page.orderSummary')}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-3">
                <DetailRow label={t('common.orderId')} value={`#${order.id}`} />
                <DetailRow
                  label={t('common.client')}
                  value={clientName}
                />
                <DetailRow label={t('common.price')} value={formatPrice(order.price)} />
                <DetailRow label={t('common.createdAt')} value={formatDate(order.created_at)} />
                <DetailRow label={t('common.updatedAt')} value={formatDate(order.updated_at)} />
              </dl>

              <div className="mt-4 rounded-md border border-border bg-background px-3 py-2">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {t('common.status')}
                </p>
                <div className="mt-2">
                  <StatusBadge status={order.status} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('common.client')}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                <ClientLink clientId={order.client_id}>{clientName}</ClientLink>
              </p>
            </CardContent>
          </Card>
        </div>
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
        />
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-lg">{t('page.reminders')}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {remindersQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
            ) : remindersQuery.isError ? (
              <p className="text-sm text-rose-700">{t('feedback.remindersLoadFailed')}</p>
            ) : (remindersQuery.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('empty.orderReminders')}</p>
            ) : (
              <ReminderCalendar reminders={remindersQuery.data ?? []} />
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
