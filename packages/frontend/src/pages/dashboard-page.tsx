import { ReactNode, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ClientLink } from '../components/client-link';
import { useClients } from '../features/clients/use-clients';
import { useOrders } from '../features/orders/use-orders';
import { usePaids } from '../features/paids/use-paids';
import { useReminders } from '../features/reminders/use-reminders';
import { useTasks } from '../features/tasks/use-tasks';
import { StatusBadge } from '../components/status-badges';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../shared/ui/card';
import { t } from '../shared/lib/i18n';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(value);
}

function startOfCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function parseNumericValue(value: string | number | undefined | null) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

interface MetricCardProps {
  title: string;
  description: string;
  value: string;
  helper: string;
  isLoading?: boolean;
  error?: string | null;
}

function MetricCard({
  title,
  description,
  value,
  helper,
  isLoading = false,
  error = null,
}: MetricCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <>
            <p className="text-3xl font-semibold tracking-tight">
              {isLoading ? '...' : value}
            </p>
            <p className="text-sm text-muted-foreground">{isLoading ? t('common.loading') : helper}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface ListCardProps {
  title: string;
  description: string;
  items: Array<{
    key: string;
    label: ReactNode;
    description?: ReactNode;
    leading?: ReactNode;
    trailing?: ReactNode;
    to?: string;
  }>;
  emptyText: string;
  isLoading?: boolean;
  error?: string | null;
}

function ListCard({
  title,
  description,
  items,
  emptyText,
  isLoading = false,
  error = null,
}: ListCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          <ul className="grid gap-2">
            {items.map((item) => (
              <li
                key={item.key}
                className="rounded-md border border-border bg-card px-3 py-2 text-sm"
              >
                {item.to ? (
                  <Link
                    className="flex min-w-0 items-center gap-2 rounded-sm font-medium text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    to={item.to}
                  >
                    {item.leading}
                    <span className="min-w-0 flex-1 truncate">
                      {item.description ? (
                        <span className="mr-2 text-muted-foreground">{item.description}</span>
                      ) : null}
                      {item.label}
                    </span>
                    {item.trailing ? (
                      <span className="ml-auto shrink-0">{item.trailing}</span>
                    ) : null}
                  </Link>
                ) : (
                  <span className="flex min-w-0 items-center gap-2">
                    {item.leading}
                    <span className="min-w-0 flex-1 truncate">
                      {item.description ? (
                        <span className="mr-2 text-muted-foreground">{item.description}</span>
                      ) : null}
                      {item.label}
                    </span>
                    {item.trailing ? (
                      <span className="ml-auto shrink-0">{item.trailing}</span>
                    ) : null}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const clientsQuery = useClients();
  const ordersQuery = useOrders();
  const remindersQuery = useReminders();
  const tasksQuery = useTasks();
  const paidsQuery = usePaids();

  const clientLabels = useMemo(
    () =>
      new Map(
        (clientsQuery.data ?? []).map((client) => [
          client.id,
          client.name || client.email || client.id,
        ]),
      ),
    [clientsQuery.data],
  );

  const openOrders = useMemo(
    () =>
      (ordersQuery.data ?? [])
        .filter((order) => order.status !== 'done')
        .sort((left, right) => {
          const leftTime = left.created_at ? new Date(left.created_at).getTime() : 0;
          const rightTime = right.created_at ? new Date(right.created_at).getTime() : 0;
          return rightTime - leftTime;
        })
        .map((order) => ({
          key: String(order.id),
          description: (
            <ClientLink className="text-muted-foreground hover:text-primary" clientId={order.client_id}>
              {clientLabels.get(order.client_id) ?? order.client_id}
            </ClientLink>
          ),
          label: `#${order.id} — ${order.title || t('empty.orderTitle')}`,
          trailing: <StatusBadge status={order.status} />,
        })),
    [clientLabels, ordersQuery.data],
  );

  const incomingReminders = useMemo(() => {
    const now = Date.now();

    return (remindersQuery.data ?? []).filter((reminder) => {
      const timestamp = new Date(reminder.timestamp).getTime();
      return Number.isFinite(timestamp) && timestamp < now;
    })
    .sort((left, right) => {
      const leftTime = new Date(left.timestamp).getTime();
      const rightTime = new Date(right.timestamp).getTime();
      return leftTime - rightTime;
    })
    .map((reminder) => {
      const dateLabel = new Date(reminder.timestamp).toLocaleString();
      const content = reminder.content.trim() || `Reminder #${reminder.id}`;
      return {
        key: String(reminder.id),
        label: `${dateLabel} — ${content}`,
      };
    });
  }, [remindersQuery.data]);

  const incompleteTasks = useMemo(
    () =>
      (tasksQuery.data ?? [])
        .filter((task) => task.status === 'pending')
        .sort((left, right) => {
          const leftTime = left.created_at ? new Date(left.created_at).getTime() : 0;
          const rightTime = right.created_at ? new Date(right.created_at).getTime() : 0;
          return rightTime - leftTime;
        })
        .map((task) => ({
          key: String(task.id),
          label: task.content.trim() || `Task #${task.id}`,
          leading: (
            <input
              aria-label={`Task ${task.status}`}
              checked={task.status === 'complete'}
              className="h-4 w-4 shrink-0 accent-foreground"
              disabled
              readOnly
              type="checkbox"
            />
          ),
          trailing:
            task.order_id == null ? undefined : (
              <span className="text-muted-foreground">{`#${task.order_id}`}</span>
            ),
        })),
    [tasksQuery.data],
  );

  const monthIncome = useMemo(() => {
    const monthStart = startOfCurrentMonth().getTime();

    const paidTotal = (paidsQuery.data ?? []).reduce((sum, paid) => {
      const createdAt = new Date(paid.created_at).getTime();
      if (!Number.isFinite(createdAt) || createdAt < monthStart) {
        return sum;
      }

      return sum + parseNumericValue(paid.value);
    }, 0);

    return paidTotal;
  }, [paidsQuery.data]);

  return (
    <main className="grid gap-4 md:grid-cols-2">
      <MetricCard
        description={t('dashboard.monthIncomeDescription')}
        error={
          paidsQuery.error instanceof Error
            ? paidsQuery.error.message
            : null
        }
        helper={t('dashboard.monthIncomeHelper')}
        isLoading={paidsQuery.isLoading}
        title={t('dashboard.monthIncome')}
        value={formatCurrency(monthIncome)}
      />
      <ListCard
        description={t('dashboard.openOrdersDescription')}
        error={ordersQuery.error instanceof Error ? ordersQuery.error.message : null}
        emptyText={t('empty.openOrders')}
        isLoading={ordersQuery.isLoading}
        items={openOrders}
        title={t('dashboard.openOrders')}
      />
      <ListCard
        description={t('dashboard.incomingRemindersDescription')}
        error={remindersQuery.error instanceof Error ? remindersQuery.error.message : null}
        emptyText={t('empty.incomingReminders')}
        isLoading={remindersQuery.isLoading}
        items={incomingReminders}
        title={t('dashboard.incomingReminders')}
      />
      <ListCard
        description={t('dashboard.incompleteTasksDescription')}
        error={tasksQuery.error instanceof Error ? tasksQuery.error.message : null}
        emptyText={t('empty.incompleteTasks')}
        isLoading={tasksQuery.isLoading}
        items={incompleteTasks}
        title={t('dashboard.incompleteTasks')}
      />
    </main>
  );
}
