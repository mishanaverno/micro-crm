import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ClientAvatar } from '../components/client-avatar';
import { StatusBadge } from '../components/status-badges';
import { TablePagination } from '../components/table-pagination';
import { useClients } from '../features/clients/use-clients';
import { useNotes } from '../features/notes/use-notes';
import { useOrders } from '../features/orders/use-orders';
import { useReminders } from '../features/reminders/use-reminders';
import { useTasks } from '../features/tasks/use-tasks';
import { t } from '../shared/lib/i18n';
import { Badge } from '../shared/ui/badge';
import { buttonVariants } from '../shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../shared/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../shared/ui/select';
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

type OrderStatusFilter = 'all' | OrderStatus;

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

export function ClientDetailsPage() {
  const { clientId } = useParams();
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersPageSize, setOrdersPageSize] = useState(10);
  const [orderStatusFilter, setOrderStatusFilter] =
    useState<OrderStatusFilter>('all');
  const clientsQuery = useClients();
  const ordersQuery = useOrders();
  const notesQuery = useNotes();
  const tasksQuery = useTasks();
  const remindersQuery = useReminders();
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
        .filter((order) => order.client_id === clientId)
        .filter((order) =>
          orderStatusFilter === 'all' ? true : order.status === orderStatusFilter,
        )
        .sort((left, right) => {
          const leftTime = left.created_at ? new Date(left.created_at).getTime() : 0;
          const rightTime = right.created_at ? new Date(right.created_at).getTime() : 0;

          return rightTime - leftTime;
        }),
    [clientId, orderStatusFilter, ordersQuery.data],
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

  function handleStatusFilterChange(value: string) {
    setOrderStatusFilter(value as OrderStatusFilter);
    setOrdersPage(1);
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
        <ClientItemsBlock<TaskRecord>
          emptyText={t('empty.clientTasks')}
          errorText={t('feedback.tasksLoadFailed')}
          getMeta={(task) =>
            task.deadline
              ? `${t('common.deadline')}: ${formatDate(task.deadline)}`
              : formatDate(task.created_at)
          }
          getTitle={(task) => task.content}
          isError={tasksQuery.isError}
          isLoading={tasksQuery.isLoading}
          items={baseTasks}
          title={t('page.tasks')}
        />
        <ClientItemsBlock<ReminderRecord>
          emptyText={t('empty.clientReminders')}
          errorText={t('feedback.remindersLoadFailed')}
          getMeta={(reminder) => formatDate(reminder.timestamp)}
          getTitle={(reminder) => reminder.content}
          isError={remindersQuery.isError}
          isLoading={remindersQuery.isLoading}
          items={baseReminders}
          title={t('page.reminders')}
        />
      </section>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle>{t('page.orders')}</CardTitle>
              <CardDescription>{t('dashboard.openOrdersDescription')}</CardDescription>
            </div>
            <Select
              value={orderStatusFilter}
              onValueChange={handleStatusFilterChange}
            >
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('placeholder.allStatuses')}</SelectItem>
                <SelectItem value="created">{t('status.created')}</SelectItem>
                <SelectItem value="inprogress">{t('status.inProgress')}</SelectItem>
                <SelectItem value="done">{t('status.done')}</SelectItem>
                <SelectItem value="reopened">{t('status.reopened')}</SelectItem>
              </SelectContent>
            </Select>
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
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell>{order.title || t('empty.orderTitle')}</TableCell>
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
