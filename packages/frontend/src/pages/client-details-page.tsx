import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ClientAvatar } from '../components/client-avatar';
import { ReminderCalendar } from '../components/reminder-calendar';
import { OrderLink } from '../components/order-link';
import { StatusBadge } from '../components/status-badges';
import { TablePagination } from '../components/table-pagination';
import { useClients } from '../features/clients/use-clients';
import { useNotes } from '../features/notes/use-notes';
import { useOrders } from '../features/orders/use-orders';
import { useReminders } from '../features/reminders/use-reminders';
import { useTasks } from '../features/tasks/use-tasks';
import { useUpdateTask } from '../features/tasks/use-update-task';
import { t } from '../shared/lib/i18n';
import { Badge } from '../shared/ui/badge';
import { buttonVariants } from '../shared/ui/button';
import { Button } from '../shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../shared/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../shared/ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { ClientRecord } from '../shared/types/client';
import { NoteRecord } from '../shared/types/note';
import { ReminderRecord } from '../shared/types/reminder';
import { TaskRecord } from '../shared/types/task';
import { OrderStatus } from '../shared/types/order';

const orderStatusOptions = ['created', 'inprogress', 'done'] as const satisfies OrderStatus[];

function formatClientStatus(status: ClientRecord['status']) {
  return status === 'legal_entity'
    ? t('status.legalEntity')
    : t('status.individual');
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString() : '—';
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(price);
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

function ClientItemsBlock<T>({
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

function ClientTasksBlock({
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
                    <TooltipProvider delayDuration={150}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex shrink-0 cursor-help" tabIndex={0}>
                            <Badge
                              className={getDeadlineBadgeClassName(task.deadline)}
                              variant="secondary"
                            >
                              {t('common.completeBefore', undefined, {
                                deadline: formatDate(task.deadline),
                              })}
                            </Badge>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent align="end">
                          {getDeadlineTooltip(task.deadline)}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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

function ClientRemindersBlock({
  emptyText,
  errorText,
  isError,
  isLoading,
  reminders,
}: {
  emptyText: string;
  errorText: string;
  isError: boolean;
  isLoading: boolean;
  reminders: ReminderRecord[];
}) {
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-lg">{t('page.reminders')}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 px-4 pb-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : isError ? (
          <p className="text-sm text-rose-700">{errorText}</p>
        ) : reminders.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          <div className="flex justify-center">
            <ReminderCalendar reminders={reminders} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ClientDetailsPage() {
  const { clientId } = useParams();
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersPageSize, setOrdersPageSize] = useState(10);
  const [selectedOrderStatuses, setSelectedOrderStatuses] = useState<OrderStatus[]>([
    'created',
    'inprogress',
  ]);
  const clientsQuery = useClients();
  const ordersQuery = useOrders({ clientId });
  const notesQuery = useNotes({ clientId });
  const tasksQuery = useTasks({ clientId });
  const updateTask = useUpdateTask();
  const remindersQuery = useReminders({ clientId });
  const client = (clientsQuery.data ?? []).find((item) => item.id === clientId);
  const baseNotes = (notesQuery.data ?? [])
    .filter((note) => note.client_id === clientId && note.order_id == null)
    .sort((left, right) => {
      const leftTime = left.created_at ? new Date(left.created_at).getTime() : 0;
      const rightTime = right.created_at ? new Date(right.created_at).getTime() : 0;

      return rightTime - leftTime;
    });
  const baseTasks = (tasksQuery.data ?? [])
    .filter((task) => task.client_id === clientId && task.order_id == null)
    .sort((left, right) => {
      const leftTime = left.created_at ? new Date(left.created_at).getTime() : 0;
      const rightTime = right.created_at ? new Date(right.created_at).getTime() : 0;

      return rightTime - leftTime;
    });
  const baseReminders = (remindersQuery.data ?? [])
    .filter((reminder) => reminder.client_id === clientId && reminder.order_id == null)
    .sort((left, right) => {
      const leftTime = left.timestamp ? new Date(left.timestamp).getTime() : 0;
      const rightTime = right.timestamp ? new Date(right.timestamp).getTime() : 0;

      return leftTime - rightTime;
    });
  const orders = useMemo(
    () =>
      (ordersQuery.data ?? [])
        .filter((order) =>
          selectedOrderStatuses.length === 0
            ? true
            : selectedOrderStatuses.includes(order.status),
        )
        .sort((left, right) => {
          const leftTime = left.created_at ? new Date(left.created_at).getTime() : 0;
          const rightTime = right.created_at ? new Date(right.created_at).getTime() : 0;

          return rightTime - leftTime;
        }),
    [clientId, selectedOrderStatuses, ordersQuery.data],
  );
  const ordersTotal = orders.length;
  const paginatedOrders = useMemo(() => {
    const startIndex = (ordersPage - 1) * ordersPageSize;

    return orders.slice(startIndex, startIndex + ordersPageSize);
  }, [orders, ordersPage, ordersPageSize]);
  const isLoading =
    clientsQuery.isLoading ||
    ordersQuery.isLoading ||
    notesQuery.isLoading ||
    tasksQuery.isLoading ||
    remindersQuery.isLoading;
  const isError =
    clientsQuery.isError ||
    ordersQuery.isError ||
    notesQuery.isError ||
    tasksQuery.isError ||
    remindersQuery.isError;

  useEffect(() => {
    const pageCount = Math.max(1, Math.ceil(ordersTotal / ordersPageSize));

    if (ordersPage > pageCount) {
      setOrdersPage(pageCount);
    }
  }, [ordersPage, ordersPageSize, ordersTotal]);

  function toggleOrderStatusFilter(status: OrderStatus) {
    setSelectedOrderStatuses((current) =>
      current.includes(status)
        ? current.filter((item) => item !== status)
        : [...current, status],
    );
    setOrdersPage(1);
  }

  function toggleTaskStatus(task: TaskRecord) {
    void updateTask.mutateAsync({
      taskId: task.id,
      payload: {
        client_id: task.client_id,
        content: task.content,
        order_id: task.order_id ?? null,
        status: task.status === 'complete' ? 'pending' : 'complete',
        deadline: task.deadline ?? null,
      },
    });
  }

  return (
    <main className="grid gap-4">
      <div>
        <Link className={buttonVariants({ variant: 'secondary' })} to="/clients">
          {t('actions.backToClients')}
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              {client ? <ClientAvatar className="h-10 w-10 text-sm" name={client.name} /> : null}
              <div className="grid gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <CardTitle>{client?.name || t('page.clientDetails')}</CardTitle>
                  {client ? (
                    <Badge variant="secondary">{formatClientStatus(client.status)}</Badge>
                  ) : null}
                </div>
                <CardDescription>
                  {client?.company || '-'}
                </CardDescription>
              </div>
            </div>
            {client ? (
              <div className="text-sm text-muted-foreground lg:text-right">
                <span className="font-medium text-foreground">{t('common.createdAt')}:</span>{' '}
                {formatDate(client.created_at)}
              </div>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
          ) : isError ? (
            <p className="text-sm text-rose-700">{t('feedback.clientsLoadFailed')}</p>
          ) : !client ? (
            <p className="text-sm text-muted-foreground">{t('feedback.clientNotFound')}</p>
          ) : (
            <dl className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <DetailRow label={t('common.email')} value={client.email} />
              <DetailRow label={t('common.phone')} value={client.phone_number ?? ''} />
            </dl>
          )}
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-3">
        <ClientItemsBlock<NoteRecord>
          emptyText={t('empty.clientNotes')}
          errorText={t('feedback.notesLoadFailed')}
          getMeta={(note) => formatDate(note.created_at)}
          getTitle={(note) => note.content}
          isError={notesQuery.isError}
          isLoading={notesQuery.isLoading}
          items={baseNotes}
          title={t('page.notes')}
        />
        <ClientTasksBlock
          emptyText={t('empty.clientTasks')}
          errorText={t('feedback.tasksLoadFailed')}
          isError={tasksQuery.isError}
          isLoading={tasksQuery.isLoading}
          isUpdating={updateTask.isPending}
          onToggleTaskStatus={toggleTaskStatus}
          tasks={baseTasks}
        />
        <ClientRemindersBlock
          emptyText={t('empty.clientReminders')}
          errorText={t('feedback.remindersLoadFailed')}
          isError={remindersQuery.isError}
          isLoading={remindersQuery.isLoading}
          reminders={baseReminders}
        />
      </section>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle>{t('page.orders')}</CardTitle>
              <CardDescription>{t('dashboard.openOrdersDescription')}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {orderStatusOptions.map((status) => (
                <Button
                  className="h-8 px-3"
                  key={status}
                  onClick={() => toggleOrderStatusFilter(status)}
                  type="button"
                  variant={selectedOrderStatuses.includes(status) ? 'default' : 'outline'}
                >
                  {status === 'created'
                    ? t('status.created')
                    : status === 'inprogress'
                      ? t('status.inProgress')
                      : t('status.done')}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
          ) : isError ? (
            <p className="text-sm text-rose-700">{t('feedback.ordersLoadFailed')}</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('empty.clientOrders')}</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.orderId')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead>{t('common.title')}</TableHead>
                    <TableHead>{t('common.content')}</TableHead>
                    <TableHead>{t('common.price')}</TableHead>
                    <TableHead>{t('common.createdAt')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        <OrderLink orderId={order.id}>#{order.id}</OrderLink>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell>
                        <OrderLink orderId={order.id}>
                          {order.title || t('empty.orderTitle')}
                        </OrderLink>
                      </TableCell>
                      <TableCell className="max-w-[420px] text-muted-foreground">
                        <span className="line-clamp-2">{order.content}</span>
                      </TableCell>
                      <TableCell>{formatPrice(order.price)}</TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                page={ordersPage}
                pageSize={ordersPageSize}
                totalItems={ordersTotal}
                onPageChange={setOrdersPage}
                onPageSizeChange={(pageSize) => {
                  setOrdersPageSize(pageSize);
                  setOrdersPage(1);
                }}
              />
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
