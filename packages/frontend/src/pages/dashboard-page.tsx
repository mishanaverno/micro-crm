import { useMemo } from 'react';
import { useOrders } from '../features/orders/use-orders';
import { usePaids } from '../features/paids/use-paids';
import { useReminders } from '../features/reminders/use-reminders';
import { useSpents } from '../features/spents/use-spents';
import { useTasks } from '../features/tasks/use-tasks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../shared/ui/card';

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
            <p className="text-sm text-muted-foreground">{isLoading ? 'Loading...' : helper}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface ListCardProps {
  title: string;
  description: string;
  items: string[];
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
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          <ul className="grid gap-2">
            {items.map((item) => (
              <li
                key={item}
                className="rounded-md border border-border bg-card px-3 py-2 text-sm"
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const ordersQuery = useOrders();
  const remindersQuery = useReminders();
  const tasksQuery = useTasks();
  const paidsQuery = usePaids();
  const spentsQuery = useSpents();

  const openOrders = useMemo(
    () =>
      (ordersQuery.data ?? [])
        .filter((order) => order.status !== 'done')
        .sort((left, right) => {
          const leftTime = left.created_at ? new Date(left.created_at).getTime() : 0;
          const rightTime = right.created_at ? new Date(right.created_at).getTime() : 0;
          return rightTime - leftTime;
        })
        .map((order) => `#${order.id} — ${order.title || 'order'}`),
    [ordersQuery.data],
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
      return `${dateLabel} — ${content}`;
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
        .map((task) => task.content.trim() || `Task #${task.id}`),
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

    const spentTotal = (spentsQuery.data ?? []).reduce((sum, spent) => {
      const createdAt = new Date(spent.created_at).getTime();
      if (!Number.isFinite(createdAt) || createdAt < monthStart) {
        return sum;
      }

      return sum + parseNumericValue(spent.value);
    }, 0);

    return paidTotal - spentTotal;
  }, [paidsQuery.data, spentsQuery.data]);

  return (
    <main className="grid gap-4 md:grid-cols-2">
      <ListCard
        description="Orders that still require work."
        error={ordersQuery.error instanceof Error ? ordersQuery.error.message : null}
        emptyText="No open orders."
        isLoading={ordersQuery.isLoading}
        items={openOrders}
        title="Open orders"
      />
      <ListCard
        description="Reminders that are already due."
        error={remindersQuery.error instanceof Error ? remindersQuery.error.message : null}
        emptyText="No incoming reminders."
        isLoading={remindersQuery.isLoading}
        items={incomingReminders}
        title="Incoming reminders"
      />
      <ListCard
        description="Tasks that are not completed yet."
        error={tasksQuery.error instanceof Error ? tasksQuery.error.message : null}
        emptyText="No incomplete tasks."
        isLoading={tasksQuery.isLoading}
        items={incompleteTasks}
        title="Incomplete tasks"
      />
      <MetricCard
        description="This month paid amounts minus spent amounts."
        error={
          paidsQuery.error instanceof Error
            ? paidsQuery.error.message
            : spentsQuery.error instanceof Error
              ? spentsQuery.error.message
              : null
        }
        helper="Calculated from finance records created this month."
        isLoading={paidsQuery.isLoading || spentsQuery.isLoading}
        title="Month income"
        value={formatCurrency(monthIncome)}
      />
    </main>
  );
}
