import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ColumnVisibilityMenu } from '../components/column-visibility-menu';
import { EntityListToolbar } from '../components/entity-list-toolbar';
import { EntitySortSelect } from '../components/entity-sort-select';
import { RemindersDataTable } from '../components/reminders-data-table';
import {
  isReminderDateTimeReady,
  toReminderApiDateTime,
  toReminderLocalDateTime,
} from '../components/reminder-date-time-field';
import { ReminderDialog } from '../components/reminder-dialog';
import { TablePagination } from '../components/table-pagination';
import { useClients } from '../features/clients/use-clients';
import { useOrders } from '../features/orders/use-orders';
import { useCreateReminder } from '../features/reminders/use-create-reminder';
import { useDeleteReminder } from '../features/reminders/use-delete-reminder';
import { usePaginatedReminders } from '../features/reminders/use-paginated-reminders';
import { useUpdateReminder } from '../features/reminders/use-update-reminder';
import { Button } from '../shared/ui/button';
import { Card, CardContent } from '../shared/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../shared/ui/dialog';
import { ReminderRecord } from '../shared/types/reminder';
import { t } from '../shared/lib/i18n';

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
type RemindersSortField = 'created_at' | 'updated_at' | 'timestamp';

export function RemindersPage() {
  const [form, setForm] = useState(initialFormState);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<ReminderRecord | null>(null);
  const [reminderToDelete, setReminderToDelete] = useState<ReminderRecord | null>(null);
  const [remindersPage, setRemindersPage] = useState(1);
  const [remindersPageSize, setRemindersPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<RemindersSortField>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
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
  const remindersQuery = usePaginatedReminders(
    { page: remindersPage, pageSize: remindersPageSize },
    {
      sortBy,
      sortDirection,
    },
  );
  const createReminder = useCreateReminder();
  const updateReminder = useUpdateReminder();
  const deleteReminder = useDeleteReminder();
  const mutationError = createReminder.error ?? updateReminder.error ?? deleteReminder.error;
  const reminders = remindersQuery.data?.items ?? [];
  const remindersTotal = remindersQuery.data?.total ?? 0;

  useEffect(() => {
    window.localStorage.setItem(
      REMINDERS_TABLE_COLUMNS_STORAGE_KEY,
      JSON.stringify(visibleColumns),
    );
  }, [visibleColumns]);

  useEffect(() => {
    const pageCount = Math.max(1, Math.ceil(remindersTotal / remindersPageSize));

    if (remindersPage > pageCount) {
      setRemindersPage(pageCount);
    }
  }, [remindersPage, remindersPageSize, remindersTotal]);

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
        client.name || client.email || client.id,
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

    return `#${order.id} — ${order.title || t('empty.orderTitle')}`;
  }

  function toggleColumn(column: keyof VisibleColumns) {
    setVisibleColumns((current: VisibleColumns) => ({
      ...current,
      [column]: !current[column],
    }));
  }

  const columnOptions: Array<{ key: keyof VisibleColumns; label: string }> = [
    { key: 'client', label: t('common.client') },
    { key: 'order', label: t('common.order') },
    { key: 'timestamp', label: t('common.timestamp') },
    { key: 'content', label: t('common.content') },
    { key: 'created_at', label: t('common.createdAt') },
    { key: 'updated_at', label: t('common.updatedAt') },
  ];

  const sortOptions: Array<{ value: RemindersSortField; label: string }> = [
    { value: 'created_at', label: t('common.createdAt') },
    { value: 'updated_at', label: t('common.updatedAt') },
    { value: 'timestamp', label: t('common.timestamp') },
  ];

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
    const localTimestamp = toReminderLocalDateTime(reminder.timestamp);
    setEditingReminder(reminder);
    setForm({
      client_id: reminder.client_id,
      order_id: reminder.order_id ? String(reminder.order_id) : '',
      content: reminder.content,
      timestamp: localTimestamp,
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

    if (!isReminderDateTimeReady(form.timestamp)) {
      return;
    }

    const payload = {
      client_id: form.client_id,
      order_id: form.order_id ? Number(form.order_id) : null,
      content: form.content,
      timestamp: toReminderApiDateTime(form.timestamp),
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
        <EntityListToolbar title={t('page.reminders')}>
              <EntitySortSelect
                onSortByChange={setSortBy}
                onSortDirectionChange={setSortDirection}
                options={sortOptions}
                sortBy={sortBy}
                sortDirection={sortDirection}
              />
              <ColumnVisibilityMenu
                columns={columnOptions}
                visibleColumns={visibleColumns}
                onToggle={toggleColumn}
              />
              <Button onClick={openCreateDialog}>{t('actions.create')}</Button>
              <ReminderDialog
                clientField={{
                  mode: 'select',
                  value: form.client_id,
                  options: clientOptions.map((client) => ({
                    value: client.id,
                    label: resolveClientLabel(client.id),
                  })),
                  disabled: clientsQuery.isLoading || clientOptions.length === 0,
                  placeholder: clientsQuery.isLoading
                    ? t('placeholder.loadingClients')
                    : t('placeholder.selectClient'),
                  onChange: (value) =>
                    setForm((current) => ({ ...current, client_id: value })),
                }}
                content={form.content}
                description={
                  editingReminder
                    ? t('dialog.reminderEditDescription')
                    : t('dialog.reminderCreateDescription')
                }
                formId="create-reminder-form"
                isPending={createReminder.isPending || updateReminder.isPending}
                isSubmitDisabled={clientOptions.length === 0 || !form.client_id}
                open={isReminderDialogOpen}
                onContentChange={(content) =>
                  setForm((current) => ({ ...current, content }))
                }
                onOpenChange={(open) => {
                  if (!open) {
                    closeDialog();
                    return;
                  }

                  setIsReminderDialogOpen(true);
                }}
                onSubmit={handleSubmit}
                onTimestampChange={(timestamp) =>
                  setForm((current) => ({ ...current, timestamp }))
                }
                orderField={{
                  mode: 'select',
                  value: form.order_id,
                  options: orderOptions.map((order) => ({
                    value: String(order.id),
                    label: resolveOrderLabel(Number(order.id)),
                  })),
                  disabled: ordersQuery.isLoading || !form.client_id,
                  placeholder: t('placeholder.noOrder'),
                  emptyLabel: t('placeholder.noOrder'),
                  onChange: (value) =>
                    setForm((current) => ({ ...current, order_id: value })),
                }}
                submitLabel={t('actions.save')}
                timestamp={form.timestamp}
                title={
                  editingReminder
                    ? t('dialog.editReminderTitle')
                    : t('dialog.newReminderTitle')
                }
              />

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
                    <DialogTitle>{t('dialog.deleteReminderTitle')}</DialogTitle>
                    <DialogDescription>
                      {reminderToDelete
                        ? t('dialog.reminderDeleteNamedDescription', undefined, {
                            name: resolveClientLabel(reminderToDelete.client_id),
                          })
                        : t('dialog.reminderDeleteDescription')}
                    </DialogDescription>
                  </DialogHeader>

                  <DialogFooter>
                    <Button
                      disabled={deleteReminder.isPending}
                      onClick={closeDeleteDialog}
                      type="button"
                      variant="ghost"
                    >
                      {t('actions.cancel')}
                    </Button>
                    <Button
                      className="bg-rose-600 text-white hover:bg-rose-700"
                      disabled={deleteReminder.isPending}
                      onClick={() => void handleConfirmDelete()}
                      type="button"
                    >
                      {deleteReminder.isPending ? t('actions.deleting') : t('actions.delete')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
        </EntityListToolbar>

        <CardContent>
          {mutationError ? (
            <p className="mb-4 text-sm text-rose-700">
              {mutationError.message || t('feedback.reminderSaveFailed')}
            </p>
          ) : null}

          {remindersQuery.isLoading || clientsQuery.isLoading || ordersQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">{t('placeholder.loadingReminders')}</p>
          ) : remindersQuery.isError ? (
            <p className="text-sm text-rose-700">{t('feedback.remindersLoadFailed')}</p>
          ) : reminders.length > 0 ? (
            <>
              <RemindersDataTable
                onDeleteReminder={openDeleteDialog}
                onEditReminder={openEditDialog}
                reminders={reminders}
                resolveClientLabel={resolveClientLabel}
                resolveOrderLabel={resolveOrderLabel}
                visibleColumns={visibleColumns}
              />
              <TablePagination
                page={remindersPage}
                pageSize={remindersPageSize}
                totalItems={remindersTotal}
                onPageChange={setRemindersPage}
                onPageSizeChange={(pageSize) => {
                  setRemindersPageSize(pageSize);
                  setRemindersPage(1);
                }}
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('empty.reminders')}
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
