import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ClientLink } from '../components/client-link';
import { NotesBlock } from '../components/notes-block';
import { RemindersBlock } from '../components/reminders-block';
import { StatusBadge } from '../components/status-badges';
import { TasksBlock } from '../components/tasks-block';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../shared/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '../shared/ui/sheet';
import { Input } from '../shared/ui/input';
import { Label } from '../shared/ui/label';
import { Textarea } from '../shared/ui/textarea';
import { cn } from '../lib/utils';
import { HttpError } from '../shared/api/http';
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

  function openEditSheet() {
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
    setIsEditOpen(true);
  }

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
                <Button
                  className="w-fit"
                  type="button"
                  variant="outline"
                  onClick={openEditSheet}
                >
                  {t('actions.edit')}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm leading-6 text-foreground">
              {order.content || '—'}
            </div>
          </CardContent>
        </Card>
      </section>

      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{t('dialog.editOrderTitle')}</SheetTitle>
            <SheetDescription>{t('dialog.orderEditDescription')}</SheetDescription>
          </SheetHeader>

          <form className="grid gap-4" id="order-edit-form" onSubmit={handleSubmit}>
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

          <SheetFooter>
            <Button onClick={() => setIsEditOpen(false)} type="button" variant="ghost">
              {t('actions.cancel')}
            </Button>
            <Button disabled={isBusy || !hasChanges} form="order-edit-form" type="submit">
              {updateOrder.isPending ? t('actions.saving') : t('actions.save')}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <section className="grid gap-4 xl:grid-cols-3">
        <TasksBlock
          emptyText={t('empty.orderTasks')}
          errorText={t('feedback.tasksLoadFailed')}
          isError={tasksQuery.isError}
          isLoading={tasksQuery.isLoading}
          isUpdating={updateTask.isPending}
          tasks={tasksQuery.data ?? []}
          onToggleTaskStatus={toggleTaskStatus}
        />
        <NotesBlock
          emptyText={t('empty.orderNotes')}
          errorText={t('feedback.notesLoadFailed')}
          isError={notesQuery.isError}
          isLoading={notesQuery.isLoading}
          notes={notesQuery.data ?? []}
          variant="inverse"
        />
        <RemindersBlock
          emptyText={t('empty.orderReminders')}
          errorText={t('feedback.remindersLoadFailed')}
          isError={remindersQuery.isError}
          isLoading={remindersQuery.isLoading}
          reminders={remindersQuery.data ?? []}
          tasks={tasksQuery.data ?? []}
        />
      </section>
    </main>
  );
}
