import { FormEvent, useEffect, useMemo, useState } from 'react';
import { RemindersDataTable } from '../components/reminders-data-table';
import { useClients } from '../features/clients/use-clients';
import { useOrders } from '../features/orders/use-orders';
import { useCreateReminder } from '../features/reminders/use-create-reminder';
import { useDeleteReminder } from '../features/reminders/use-delete-reminder';
import { useReminders } from '../features/reminders/use-reminders';
import { useUpdateReminder } from '../features/reminders/use-update-reminder';
import { Button } from '../shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../shared/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../shared/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../shared/ui/dropdown-menu';
import { Input } from '../shared/ui/input';
import { Label } from '../shared/ui/label';
import { Textarea } from '../shared/ui/textarea';
import { ReminderRecord } from '../shared/types/reminder';

const initialFormState = {
  client_id: '',
  order_id: '',
  content: '',
  timestamp: '',
};

const REMINDERS_TABLE_COLUMNS_STORAGE_KEY = 'reminders-table-visible-columns';

const defaultVisibleColumns = {
  client: true,
  order: false,
  timestamp: true,
  content: true,
  created_at: false,
  updated_at: false,
};

type VisibleColumns = typeof defaultVisibleColumns;

function toDatetimeLocalValue(timestamp: string | undefined) {
  if (!timestamp) {
    return '';
  }

  const date = new Date(timestamp);
  const timezoneOffsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
}

export function RemindersPage() {
  const [form, setForm] = useState(initialFormState);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<ReminderRecord | null>(null);
  const [reminderToDelete, setReminderToDelete] = useState<ReminderRecord | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>(() => {
    if (typeof window === 'undefined') {
      return defaultVisibleColumns;
    }

    const storedValue = window.localStorage.getItem(REMINDERS_TABLE_COLUMNS_STORAGE_KEY);

    if (!storedValue) {
      return defaultVisibleColumns;
    }

    try {
      const parsedValue = JSON.parse(storedValue);

      return {
        ...defaultVisibleColumns,
        ...parsedValue,
      };
    } catch {
      return defaultVisibleColumns;
    }
  });

  const clientsQuery = useClients();
  const ordersQuery = useOrders();
  const remindersQuery = useReminders();
  const createReminder = useCreateReminder();
  const updateReminder = useUpdateReminder();
  const deleteReminder = useDeleteReminder();
  const mutationError = createReminder.error ?? updateReminder.error ?? deleteReminder.error;

  useEffect(() => {
    window.localStorage.setItem(
      REMINDERS_TABLE_COLUMNS_STORAGE_KEY,
      JSON.stringify(visibleColumns),
    );
  }, [visibleColumns]);

  const clientOptions = clientsQuery.data ?? [];
  const orderOptions = useMemo(
    () =>
      (ordersQuery.data ?? []).filter((order) =>
        form.client_id ? order.client_id === form.client_id : true,
      ),
    [form.client_id, ordersQuery.data],
  );

  useEffect(() => {
    if (!isReminderDialogOpen || editingReminder || form.client_id || clientOptions.length === 0) {
      return;
    }

    setForm((current) => ({
      ...current,
      client_id: clientOptions[0].id,
    }));
  }, [clientOptions, editingReminder, form.client_id, isReminderDialogOpen]);

  useEffect(() => {
    if (!form.order_id) {
      return;
    }

    const hasSelectedOrder = orderOptions.some((order) => order.id === form.order_id);

    if (!hasSelectedOrder) {
      setForm((current) => ({
        ...current,
        order_id: '',
      }));
    }
  }, [form.order_id, orderOptions]);

  const clientLabels = useMemo(() => {
    return new Map(
      clientOptions.map((client) => [
        client.id,
        [client.first_name, client.last_name].filter(Boolean).join(' ') || client.email || client.id,
      ]),
    );
  }, [clientOptions]);

  function resolveClientLabel(clientId: string) {
    return clientLabels.get(clientId) ?? clientId;
  }

  function resolveOrderLabel(orderId: number | null | undefined) {
    if (!orderId) {
      return '—';
    }

    const order = (ordersQuery.data ?? []).find((item) => Number(item.id) === orderId);

    if (!order) {
      return `#${orderId}`;
    }

    return `#${order.id} — ${order.title || 'order'}`;
  }

  function toggleColumn(column: keyof VisibleColumns) {
    setVisibleColumns((current: VisibleColumns) => ({
      ...current,
      [column]: !current[column],
    }));
  }

  function openCreateDialog() {
    createReminder.reset();
    updateReminder.reset();
    setEditingReminder(null);
    setForm({
      client_id: clientOptions[0]?.id ?? '',
      order_id: '',
      content: '',
      timestamp: '',
    });
    setIsReminderDialogOpen(true);
  }

  function openEditDialog(reminder: ReminderRecord) {
    createReminder.reset();
    updateReminder.reset();
    setEditingReminder(reminder);
    setForm({
      client_id: reminder.client_id,
      order_id: reminder.order_id ? String(reminder.order_id) : '',
      content: reminder.content,
      timestamp: toDatetimeLocalValue(reminder.timestamp),
    });
    setIsReminderDialogOpen(true);
  }

  function closeDialog() {
    setIsReminderDialogOpen(false);
    setEditingReminder(null);
    setForm(initialFormState);
    createReminder.reset();
    updateReminder.reset();
  }

  function openDeleteDialog(reminder: ReminderRecord) {
    deleteReminder.reset();
    setReminderToDelete(reminder);
  }

  function closeDeleteDialog() {
    if (deleteReminder.isPending) {
      return;
    }

    setReminderToDelete(null);
    deleteReminder.reset();
  }

  async function handleConfirmDelete() {
    if (!reminderToDelete) {
      return;
    }

    await deleteReminder.mutateAsync(reminderToDelete.id);
    setReminderToDelete(null);
    deleteReminder.reset();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      client_id: form.client_id,
      order_id: form.order_id ? Number(form.order_id) : null,
      content: form.content,
      timestamp: new Date(form.timestamp).toISOString(),
    };

    if (editingReminder) {
      await updateReminder.mutateAsync({
        reminderId: editingReminder.id,
        payload,
      });
    } else {
      await createReminder.mutateAsync(payload);
    }

    closeDialog();
  }

  return (
    <main className="grid gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1.5">
              <CardTitle>Reminders</CardTitle>
              <CardDescription>
                Scheduled reminders for your clients, loaded from the API and editable from one workspace.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="secondary">
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.client}
                    onCheckedChange={() => toggleColumn('client')}
                  >
                    Client
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.order}
                    onCheckedChange={() => toggleColumn('order')}
                  >
                    Order
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.timestamp}
                    onCheckedChange={() => toggleColumn('timestamp')}
                  >
                    Timestamp
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.content}
                    onCheckedChange={() => toggleColumn('content')}
                  >
                    Content
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.created_at}
                    onCheckedChange={() => toggleColumn('created_at')}
                  >
                    Created at
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.updated_at}
                    onCheckedChange={() => toggleColumn('updated_at')}
                  >
                    Updated at
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateDialog}>Create reminder</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingReminder ? 'Edit reminder' : 'New reminder'}</DialogTitle>
                    <DialogDescription>
                      {editingReminder
                        ? 'Update the selected reminder for the client.'
                        : 'Create a new reminder for one of your clients.'}
                    </DialogDescription>
                  </DialogHeader>

                  <form className="grid gap-4" id="create-reminder-form" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                      <Label htmlFor="client_id">Client</Label>
                      <select
                        id="client_id"
                        className="flex h-12 w-full rounded-3xl border border-input bg-background px-4 text-sm text-foreground shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        disabled={clientsQuery.isLoading || clientOptions.length === 0}
                        required
                        value={form.client_id}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, client_id: event.target.value }))
                        }
                      >
                        <option value="" disabled>
                          {clientsQuery.isLoading ? 'Loading clients...' : 'Select client'}
                        </option>
                        {clientOptions.map((client) => (
                          <option key={client.id} value={client.id}>
                            {resolveClientLabel(client.id)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="order_id">Order</Label>
                      <select
                        id="order_id"
                        className="flex h-12 w-full rounded-3xl border border-input bg-background px-4 text-sm text-foreground shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        disabled={ordersQuery.isLoading || !form.client_id}
                        value={form.order_id}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, order_id: event.target.value }))
                        }
                      >
                        <option value="">No order</option>
                        {orderOptions.map((order) => (
                          <option key={order.id} value={order.id}>
                            {resolveOrderLabel(Number(order.id))}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="timestamp">Timestamp</Label>
                      <Input
                        id="timestamp"
                        required
                        type="datetime-local"
                        value={form.timestamp}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, timestamp: event.target.value }))
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        required
                        value={form.content}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, content: event.target.value }))
                        }
                      />
                    </div>
                  </form>

                  <DialogFooter>
                    <Button onClick={closeDialog} type="button" variant="ghost">
                      Cancel
                    </Button>
                    <Button
                      disabled={
                        createReminder.isPending ||
                        updateReminder.isPending ||
                        clientOptions.length === 0 ||
                        !form.client_id ||
                        !form.timestamp
                      }
                      form="create-reminder-form"
                      type="submit"
                    >
                      {createReminder.isPending || updateReminder.isPending
                        ? 'Saving...'
                        : editingReminder
                          ? 'Save changes'
                          : 'Save reminder'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog
                open={Boolean(reminderToDelete)}
                onOpenChange={(open) => {
                  if (!open) {
                    closeDeleteDialog();
                  }
                }}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete reminder</DialogTitle>
                    <DialogDescription>
                      {reminderToDelete
                        ? `Reminder for "${resolveClientLabel(
                            reminderToDelete.client_id,
                          )}" will be permanently removed.`
                        : 'Selected reminder will be deleted.'}
                    </DialogDescription>
                  </DialogHeader>

                  <DialogFooter>
                    <Button
                      disabled={deleteReminder.isPending}
                      onClick={closeDeleteDialog}
                      type="button"
                      variant="ghost"
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-rose-600 text-white hover:bg-rose-700"
                      disabled={deleteReminder.isPending}
                      onClick={() => void handleConfirmDelete()}
                      type="button"
                    >
                      {deleteReminder.isPending ? 'Deleting...' : 'Delete'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {mutationError ? (
            <p className="mb-4 text-sm text-rose-700">
              {mutationError.message || 'Failed to save reminder changes.'}
            </p>
          ) : null}

          {remindersQuery.isLoading || clientsQuery.isLoading || ordersQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading reminders...</p>
          ) : remindersQuery.isError ? (
            <p className="text-sm text-rose-700">Failed to load reminders from the backend.</p>
          ) : remindersQuery.data && remindersQuery.data.length > 0 ? (
            <RemindersDataTable
              onDeleteReminder={openDeleteDialog}
              onEditReminder={openEditDialog}
              reminders={remindersQuery.data}
              resolveClientLabel={resolveClientLabel}
              resolveOrderLabel={resolveOrderLabel}
              visibleColumns={visibleColumns}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              No reminders returned by the backend yet.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
