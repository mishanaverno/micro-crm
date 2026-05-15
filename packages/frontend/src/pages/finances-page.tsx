import { FormEvent, useEffect, useMemo, useState } from 'react';
import { FinancesDataTable, FinanceRecord } from '../components/finances-data-table';
import { useClients } from '../features/clients/use-clients';
import { useOrders } from '../features/orders/use-orders';
import { useCreatePaid } from '../features/paids/use-create-paid';
import { useDeletePaid } from '../features/paids/use-delete-paid';
import { usePaids } from '../features/paids/use-paids';
import { useUpdatePaid } from '../features/paids/use-update-paid';
import { useCreateSpent } from '../features/spents/use-create-spent';
import { useDeleteSpent } from '../features/spents/use-delete-spent';
import { useSpents } from '../features/spents/use-spents';
import { useUpdateSpent } from '../features/spents/use-update-spent';
import { Button } from '../shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../shared/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../shared/ui/select';
import { PaidRecord } from '../shared/types/paid';
import { SpentRecord } from '../shared/types/spent';

const initialFormState = {
  client_id: '',
  order_id: '',
  value: '',
};

const FINANCES_TABLE_COLUMNS_STORAGE_KEY = 'finances-table-visible-columns';

const defaultVisibleColumns = {
  type: true,
  client: true,
  order: true,
  value: true,
  created_at: false,
  updated_at: false,
};

type VisibleColumns = typeof defaultVisibleColumns;
type FinanceFormKind = 'paid' | 'spent';
type EditingRecord = (PaidRecord | SpentRecord) & { kind: FinanceFormKind };

export function FinancesPage() {
  const [form, setForm] = useState(initialFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const [dialogKind, setDialogKind] = useState<FinanceFormKind>('paid');
  const [editingRecord, setEditingRecord] = useState<EditingRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<EditingRecord | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>(() => {
    if (typeof window === 'undefined') {
      return defaultVisibleColumns;
    }

    const storedValue = window.localStorage.getItem(FINANCES_TABLE_COLUMNS_STORAGE_KEY);

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
  const paidsQuery = usePaids();
  const spentsQuery = useSpents();
  const createPaid = useCreatePaid();
  const updatePaid = useUpdatePaid();
  const deletePaid = useDeletePaid();
  const createSpent = useCreateSpent();
  const updateSpent = useUpdateSpent();
  const deleteSpent = useDeleteSpent();
  const mutationError =
    createPaid.error ??
    updatePaid.error ??
    deletePaid.error ??
    createSpent.error ??
    updateSpent.error ??
    deleteSpent.error;

  useEffect(() => {
    window.localStorage.setItem(
      FINANCES_TABLE_COLUMNS_STORAGE_KEY,
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
    if (!isRecordDialogOpen || editingRecord || form.client_id || clientOptions.length === 0) {
      return;
    }

    setForm((current) => ({
      ...current,
      client_id: clientOptions[0].id,
    }));
  }, [clientOptions, editingRecord, form.client_id, isRecordDialogOpen]);

  useEffect(() => {
    if (!isRecordDialogOpen || editingRecord || form.order_id || orderOptions.length === 0) {
      return;
    }

    setForm((current) => ({
      ...current,
      order_id: String(orderOptions[0].id),
    }));
  }, [editingRecord, form.order_id, isRecordDialogOpen, orderOptions]);

  useEffect(() => {
    if (!form.order_id) {
      return;
    }

    const hasSelectedOrder = orderOptions.some((order) => String(order.id) === form.order_id);

    if (!hasSelectedOrder) {
      setForm((current) => ({
        ...current,
        order_id: '',
      }));
    }
  }, [form.order_id, orderOptions]);

  const clientLabels = useMemo(
    () =>
      new Map(
        clientOptions.map((client) => [
          client.id,
          [client.first_name, client.last_name].filter(Boolean).join(' ') ||
            client.email ||
            client.id,
        ]),
      ),
    [clientOptions],
  );

  const records = useMemo<FinanceRecord[]>(() => {
    const paidRecords = (paidsQuery.data ?? []).map((paid) => ({
      ...paid,
      kind: 'paid' as const,
    }));
    const spentRecords = (spentsQuery.data ?? []).map((spent) => ({
      ...spent,
      kind: 'spent' as const,
    }));

    return [...paidRecords, ...spentRecords].sort((left, right) => {
      const leftTime = left.created_at ? new Date(left.created_at).getTime() : 0;
      const rightTime = right.created_at ? new Date(right.created_at).getTime() : 0;

      return rightTime - leftTime;
    });
  }, [paidsQuery.data, spentsQuery.data]);

  function resolveClientLabel(clientId: string) {
    return clientLabels.get(clientId) ?? clientId;
  }

  function resolveOrderLabel(orderId: number | null | undefined) {
    if (!orderId) {
      return '—';
    }

    const order = (ordersQuery.data ?? []).find((item) => Number(item.id) === Number(orderId));

    if (!order) {
      return `#${orderId}`;
    }

    return `#${order.id} — ${order.title || 'order'}`;
  }

  function toggleColumn(column: keyof VisibleColumns) {
    setVisibleColumns((current) => ({
      ...current,
      [column]: !current[column],
    }));
  }

  function openCreateDialog(kind: FinanceFormKind) {
    createPaid.reset();
    updatePaid.reset();
    deletePaid.reset();
    createSpent.reset();
    updateSpent.reset();
    deleteSpent.reset();
    setDialogKind(kind);
    setFormError(null);
    setEditingRecord(null);
    setForm({
      client_id: clientOptions[0]?.id ?? '',
      order_id: '',
      value: '',
    });
    setIsRecordDialogOpen(true);
  }

  function openEditDialog(record: FinanceRecord) {
    createPaid.reset();
    updatePaid.reset();
    createSpent.reset();
    updateSpent.reset();
    setDialogKind(record.kind);
    setFormError(null);
    setEditingRecord(record as EditingRecord);
    setForm({
      client_id: record.client_id,
      order_id: String(record.order_id),
      value: String(record.value),
    });
    setIsRecordDialogOpen(true);
  }

  function closeDialog() {
    setIsRecordDialogOpen(false);
    setEditingRecord(null);
    setForm(initialFormState);
    setFormError(null);
    createPaid.reset();
    updatePaid.reset();
    createSpent.reset();
    updateSpent.reset();
  }

  function openDeleteDialog(record: FinanceRecord) {
    deletePaid.reset();
    deleteSpent.reset();
    setRecordToDelete(record as EditingRecord);
  }

  function closeDeleteDialog() {
    if (deletePaid.isPending || deleteSpent.isPending) {
      return;
    }

    setRecordToDelete(null);
    deletePaid.reset();
    deleteSpent.reset();
  }

  async function handleConfirmDelete() {
    if (!recordToDelete) {
      return;
    }

    if (recordToDelete.kind === 'paid') {
      await deletePaid.mutateAsync(recordToDelete.id);
    } else {
      await deleteSpent.mutateAsync(recordToDelete.id);
    }

    setRecordToDelete(null);
    deletePaid.reset();
    deleteSpent.reset();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.client_id) {
      setFormError(`Select a client before saving the ${dialogKind} record.`);
      return;
    }

    if (!form.order_id) {
      setFormError(`Select an order before saving the ${dialogKind} record.`);
      return;
    }

    if (!form.value || Number.isNaN(Number(form.value)) || Number(form.value) <= 0) {
      setFormError(`Enter a ${dialogKind} value greater than zero.`);
      return;
    }

    setFormError(null);

    const payload = {
      client_id: form.client_id,
      order_id: Number(form.order_id),
      value: Number(form.value),
    };

    if (editingRecord) {
      if (editingRecord.kind === 'paid') {
        await updatePaid.mutateAsync({
          paidId: editingRecord.id,
          payload,
        });
      } else {
        await updateSpent.mutateAsync({
          spentId: editingRecord.id,
          payload,
        });
      }
    } else if (dialogKind === 'paid') {
      await createPaid.mutateAsync(payload);
    } else {
      await createSpent.mutateAsync(payload);
    }

    closeDialog();
  }

  const isLoading =
    paidsQuery.isLoading ||
    spentsQuery.isLoading ||
    clientsQuery.isLoading ||
    ordersQuery.isLoading;
  const isError = paidsQuery.isError || spentsQuery.isError;

  return (
    <main className="grid gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1.5">
              <CardTitle>Finances</CardTitle>
              <CardDescription>
                Paid and spent records linked to client orders.
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
                    checked={visibleColumns.type}
                    onCheckedChange={() => toggleColumn('type')}
                  >
                    Type
                  </DropdownMenuCheckboxItem>
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
                    checked={visibleColumns.value}
                    onCheckedChange={() => toggleColumn('value')}
                  >
                    Value
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

              <Dialog open={isRecordDialogOpen} onOpenChange={setIsRecordDialogOpen}>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => openCreateDialog('paid')}>Create paid</Button>
                  <Button onClick={() => openCreateDialog('spent')} variant="secondary">
                    Create spent
                  </Button>
                </div>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingRecord
                        ? `Edit ${editingRecord.kind}`
                        : dialogKind === 'paid'
                          ? 'New paid'
                          : 'New spent'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingRecord
                        ? `Update the selected ${editingRecord.kind} record for the order.`
                        : dialogKind === 'paid'
                          ? 'Create a new paid record for one of your client orders.'
                          : 'Create a new spent record for one of your client orders.'}
                    </DialogDescription>
                  </DialogHeader>

                  <form className="grid gap-4" id="finance-record-form" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                      <Label htmlFor="client_id">Client</Label>
                      <Select
                        disabled={clientsQuery.isLoading || clientOptions.length === 0}
                        value={form.client_id || undefined}
                        onValueChange={(value) =>
                          setForm((current) => ({
                            ...current,
                            client_id: value,
                          }))
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
                        value={form.order_id || undefined}
                        onValueChange={(value) =>
                          setForm((current) => ({
                            ...current,
                            order_id: value,
                          }))
                        }
                      >
                        <SelectTrigger id="order_id">
                          <SelectValue
                            placeholder={
                              ordersQuery.isLoading ? 'Loading orders...' : 'Select order'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {orderOptions.map((order) => (
                            <SelectItem key={order.id} value={String(order.id)}>
                              {resolveOrderLabel(Number(order.id))}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="value">Value</Label>
                      <Input
                        id="value"
                        min="0.01"
                        placeholder="15000.00"
                        required
                        step="0.01"
                        type="number"
                        value={form.value}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            value: event.target.value,
                          }))
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
                        createPaid.isPending ||
                        updatePaid.isPending ||
                        createSpent.isPending ||
                        updateSpent.isPending
                      }
                      form="finance-record-form"
                      type="submit"
                    >
                      {createPaid.isPending ||
                      updatePaid.isPending ||
                      createSpent.isPending ||
                      updateSpent.isPending
                        ? 'Saving...'
                        : editingRecord
                          ? 'Save changes'
                          : dialogKind === 'paid'
                            ? 'Save paid'
                            : 'Save spent'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog
                open={Boolean(recordToDelete)}
                onOpenChange={(open) => {
                  if (!open) {
                    closeDeleteDialog();
                  }
                }}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {recordToDelete ? `Delete ${recordToDelete.kind}` : 'Delete record'}
                    </DialogTitle>
                    <DialogDescription>
                      {recordToDelete
                        ? `${recordToDelete.kind === 'paid' ? 'Paid' : 'Spent'} record for "${resolveClientLabel(recordToDelete.client_id)}" will be removed.`
                        : 'Selected finance record will be deleted.'}
                    </DialogDescription>
                  </DialogHeader>

                  <DialogFooter>
                    <Button
                      disabled={deletePaid.isPending || deleteSpent.isPending}
                      onClick={closeDeleteDialog}
                      type="button"
                      variant="ghost"
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-rose-600 text-white hover:bg-rose-700"
                      disabled={deletePaid.isPending || deleteSpent.isPending}
                      onClick={() => void handleConfirmDelete()}
                      type="button"
                    >
                      {deletePaid.isPending || deleteSpent.isPending ? 'Deleting...' : 'Delete'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {formError ? <p className="mb-4 text-sm text-rose-700">{formError}</p> : null}

          {mutationError ? (
            <p className="mb-4 text-sm text-rose-700">
              {mutationError.message || 'Failed to save finance changes.'}
            </p>
          ) : null}

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading finance records...</p>
          ) : isError ? (
            <p className="text-sm text-rose-700">Failed to load finance records from the backend.</p>
          ) : records.length > 0 ? (
            <FinancesDataTable
              onDeleteRecord={openDeleteDialog}
              onEditRecord={openEditDialog}
              records={records}
              resolveClientLabel={resolveClientLabel}
              resolveOrderLabel={resolveOrderLabel}
              visibleColumns={visibleColumns}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              No finance records returned by the backend yet.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
