import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ClientAvatar } from '../components/client-avatar';
import { NotesBlock } from '../components/notes-block';
import { OrderLink } from '../components/order-link';
import { RemindersBlock } from '../components/reminders-block';
import { StatusBadge } from '../components/status-badges';
import { TablePagination } from '../components/table-pagination';
import { TasksBlock } from '../components/tasks-block';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { ClientRecord } from '../shared/types/client';
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-border bg-background px-3 py-2">
      <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-medium text-foreground">
        {value || '—'}
      </dd>
    </div>
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
        <NotesBlock
          emptyText={t('empty.clientNotes')}
          errorText={t('feedback.notesLoadFailed')}
          isError={notesQuery.isError}
          isLoading={notesQuery.isLoading}
          notes={baseNotes}
          variant="inverse"
        />
        <TasksBlock
          emptyText={t('empty.clientTasks')}
          errorText={t('feedback.tasksLoadFailed')}
          isError={tasksQuery.isError}
          isLoading={tasksQuery.isLoading}
          isUpdating={updateTask.isPending}
          onToggleTaskStatus={toggleTaskStatus}
          tasks={baseTasks}
        />
        <RemindersBlock
          emptyText={t('empty.clientReminders')}
          errorText={t('feedback.remindersLoadFailed')}
          isError={remindersQuery.isError}
          isLoading={remindersQuery.isLoading}
          reminders={baseReminders}
          tasks={baseTasks}
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
