import { FormEvent, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
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
import { Calendar } from '../shared/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../shared/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../shared/ui/select';
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

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height="16"
      viewBox="0 0 16 16"
      width="16"
    >
      <rect
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        width="12"
        x="2"
        y="3"
      />
      <path
        d="M5 2v3M11 2v3M2 6.5h12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function toDatetimeLocalValue(timestamp: string | undefined) {
  if (!timestamp) {
    return '';
  }

  const date = new Date(timestamp);
  const timezoneOffsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
}

function getDatePart(timestamp: string) {
  return timestamp.split('T')[0] ?? '';
}

function getTimePart(timestamp: string) {
  return timestamp.split('T')[1] ?? '';
}

function mergeDateAndTime(nextDate: string, nextTime: string) {
  if (!nextDate && !nextTime) {
    return '';
  }

  if (!nextDate) {
    return '';
  }

  return `${nextDate}T${nextTime || '09:00'}`;
}

function formatTimeInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function isValidTimeValue(value: string) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

function formatDateLabel(timestamp: string) {
  const datePart = getDatePart(timestamp);

  if (!datePart) {
    return 'Pick a date';
  }

  const [year, month, day] = datePart.split('-').map(Number);
  return format(new Date(year, (month ?? 1) - 1, day ?? 1), 'PPP');
}

function getSelectedDate(timestamp: string) {
  const datePart = getDatePart(timestamp);

  if (!datePart) {
    return undefined;
  }

  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function RemindersPage() {
  const [form, setForm] = useState(initialFormState);
  const [timeInput, setTimeInput] = useState('09:00');
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
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
    setTimeInput('09:00');
    setIsDatePickerOpen(false);
    setIsReminderDialogOpen(true);
  }

  function openEditDialog(reminder: ReminderRecord) {
    createReminder.reset();
    updateReminder.reset();
    const localTimestamp = toDatetimeLocalValue(reminder.timestamp);
    setEditingReminder(reminder);
    setForm({
      client_id: reminder.client_id,
      order_id: reminder.order_id ? String(reminder.order_id) : '',
      content: reminder.content,
      timestamp: localTimestamp,
    });
    setTimeInput(getTimePart(localTimestamp) || '09:00');
    setIsDatePickerOpen(false);
    setIsReminderDialogOpen(true);
  }

  function closeDialog() {
    setIsReminderDialogOpen(false);
    setIsDatePickerOpen(false);
    setEditingReminder(null);
    setForm(initialFormState);
    setTimeInput('09:00');
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

    const datePart = getDatePart(form.timestamp);

    if (!datePart || !isValidTimeValue(timeInput)) {
      return;
    }

    const payload = {
      client_id: form.client_id,
      order_id: form.order_id ? Number(form.order_id) : null,
      content: form.content,
      timestamp: new Date(mergeDateAndTime(datePart, timeInput)).toISOString(),
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
                      <Select
                        disabled={clientsQuery.isLoading || clientOptions.length === 0}
                        value={form.client_id || undefined}
                        onValueChange={(value) =>
                          setForm((current) => ({ ...current, client_id: value }))
                        }
                      >
                        <SelectTrigger id="client_id">
                          <SelectValue
                            placeholder={
                              clientsQuery.isLoading ? 'Loading clients...' : 'Select client'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {clientOptions.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {resolveClientLabel(client.id)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="order_id">Order</Label>
                      <Select
                        disabled={ordersQuery.isLoading || !form.client_id}
                        value={form.order_id || '__none__'}
                        onValueChange={(value) =>
                          setForm((current) => ({
                            ...current,
                            order_id: value === '__none__' ? '' : value,
                          }))
                        }
                      >
                        <SelectTrigger id="order_id">
                          <SelectValue placeholder="No order" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">No order</SelectItem>
                          {orderOptions.map((order) => (
                            <SelectItem key={order.id} value={String(order.id)}>
                              {resolveOrderLabel(Number(order.id))}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="timestamp">Timestamp</Label>
                      <div className="grid items-center gap-3 sm:grid-cols-[minmax(0,1fr)_150px]">
                        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              className="h-11 w-full justify-start rounded-2xl px-4 text-left font-normal shadow-sm"
                              data-empty={!form.timestamp}
                              id="timestamp-date"
                              type="button"
                              variant="outline"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                              {form.timestamp ? (
                                formatDateLabel(form.timestamp)
                              ) : (
                                <span className="text-muted-foreground">Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-auto overflow-hidden rounded-2xl p-0">
                            <Calendar
                              mode="single"
                              selected={getSelectedDate(form.timestamp)}
                              onSelect={(date) => {
                                if (!date) {
                                  return;
                                }

                                const nextDate = format(date, 'yyyy-MM-dd');

                                setForm((current) => ({
                                  ...current,
                                  timestamp: mergeDateAndTime(nextDate, timeInput),
                                }));
                                setIsDatePickerOpen(false);
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        <Input
                          id="timestamp-time"
                          aria-invalid={timeInput.length > 0 && !isValidTimeValue(timeInput)}
                          inputMode="numeric"
                          maxLength={5}
                          placeholder="09:00"
                          required
                          type="text"
                          value={timeInput}
                          onChange={(event) => {
                            const nextTime = formatTimeInput(event.target.value);
                            setTimeInput(nextTime);
                            setForm((current) => ({
                              ...current,
                              timestamp: mergeDateAndTime(
                                getDatePart(current.timestamp),
                                nextTime,
                              ),
                            }));
                          }}
                        />
                      </div>
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
                        !getDatePart(form.timestamp) ||
                        !isValidTimeValue(timeInput)
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
