import { FormEvent, useEffect, useMemo, useState } from 'react';
import { PaidsDataTable } from '../components/paids-data-table';
import { useClients } from '../features/clients/use-clients';
import { useCreatePaid } from '../features/paids/use-create-paid';
import { useDeletePaid } from '../features/paids/use-delete-paid';
import { usePaids } from '../features/paids/use-paids';
import { useUpdatePaid } from '../features/paids/use-update-paid';
import { useOrders } from '../features/orders/use-orders';
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
import { PaidRecord } from '../shared/types/paid';

const initialFormState = {
  client_id: '',
  order_id: '',
  value: '',
};

const PAIDS_TABLE_COLUMNS_STORAGE_KEY = 'paids-table-visible-columns';

const defaultVisibleColumns = {
  client: true,
  order: true,
  value: true,
  created_at: false,
  updated_at: false,
};

type VisibleColumns = typeof defaultVisibleColumns;

export function PaidsPage() {
  const [form, setForm] = useState(initialFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPaidDialogOpen, setIsPaidDialogOpen] = useState(false);
  const [editingPaid, setEditingPaid] = useState<PaidRecord | null>(null);
  const [paidToDelete, setPaidToDelete] = useState<PaidRecord | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>(() => {
    if (typeof window === 'undefined') {
      return defaultVisibleColumns;
    }

    const storedValue = window.localStorage.getItem(PAIDS_TABLE_COLUMNS_STORAGE_KEY);

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
  const createPaid = useCreatePaid();
  const updatePaid = useUpdatePaid();
  const deletePaid = useDeletePaid();
  const mutationError = createPaid.error ?? updatePaid.error ?? deletePaid.error;

  useEffect(() => {
    window.localStorage.setItem(
      PAIDS_TABLE_COLUMNS_STORAGE_KEY,
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
    if (!isPaidDialogOpen || editingPaid || form.client_id || clientOptions.length === 0) {
      return;
    }

    setForm((current) => ({
      ...current,
      client_id: clientOptions[0].id,
    }));
  }, [clientOptions, editingPaid, form.client_id, isPaidDialogOpen]);

  useEffect(() => {
    if (!isPaidDialogOpen || editingPaid || form.order_id || orderOptions.length === 0) {
      return;
    }

    setForm((current) => ({
      ...current,
      order_id: String(orderOptions[0].id),
    }));
  }, [editingPaid, form.order_id, isPaidDialogOpen, orderOptions]);

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
    setVisibleColumns((current) => ({
      ...current,
      [column]: !current[column],
    }));
  }

  function openCreateDialog() {
    createPaid.reset();
    updatePaid.reset();
    setFormError(null);
    setEditingPaid(null);
    setForm({
      client_id: clientOptions[0]?.id ?? '',
      order_id: '',
      value: '',
    });
    setIsPaidDialogOpen(true);
  }

  function openEditDialog(paid: PaidRecord) {
    createPaid.reset();
    updatePaid.reset();
    setFormError(null);
    setEditingPaid(paid);
    setForm({
      client_id: paid.client_id,
      order_id: String(paid.order_id),
      value: String(paid.value),
    });
    setIsPaidDialogOpen(true);
  }

  function closeDialog() {
    setIsPaidDialogOpen(false);
    setEditingPaid(null);
    setForm(initialFormState);
    setFormError(null);
    createPaid.reset();
    updatePaid.reset();
  }

  function openDeleteDialog(paid: PaidRecord) {
    deletePaid.reset();
    setPaidToDelete(paid);
  }

  function closeDeleteDialog() {
    if (deletePaid.isPending) {
      return;
    }

    setPaidToDelete(null);
    deletePaid.reset();
  }

  async function handleConfirmDelete() {
    if (!paidToDelete) {
      return;
    }

    await deletePaid.mutateAsync(paidToDelete.id);
    setPaidToDelete(null);
    deletePaid.reset();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.client_id) {
      setFormError('Select a client before saving the paid record.');
      return;
    }

    if (!form.order_id) {
      setFormError('Select an order before saving the paid record.');
      return;
    }

    if (!form.value || Number.isNaN(Number(form.value)) || Number(form.value) <= 0) {
      setFormError('Enter a paid value greater than zero.');
      return;
    }

    setFormError(null);

    const payload = {
      client_id: form.client_id,
      order_id: Number(form.order_id),
      value: Number(form.value),
    };

    if (editingPaid) {
      await updatePaid.mutateAsync({
        paidId: editingPaid.id,
        payload,
      });
    } else {
      await createPaid.mutateAsync(payload);
    }

    closeDialog();
  }

  return (
    <main className="grid gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1.5">
              <CardTitle>Paid</CardTitle>
              <CardDescription>
                Payments and adjustments linked to client orders.
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

              <Dialog open={isPaidDialogOpen} onOpenChange={setIsPaidDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateDialog}>Create paid</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingPaid ? 'Edit paid' : 'New paid'}</DialogTitle>
                    <DialogDescription>
                      {editingPaid
                        ? 'Update the selected paid record for the order.'
                        : 'Create a new paid record for one of your client orders.'}
                    </DialogDescription>
                  </DialogHeader>

                  <form className="grid gap-4" id="create-paid-form" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                      <Label htmlFor="client_id">Client</Label>
                      <select
                        id="client_id"
                        className="flex h-12 w-full rounded-3xl border border-input bg-background px-4 text-sm text-foreground shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        disabled={clientsQuery.isLoading || clientOptions.length === 0}
                        required
                        value={form.client_id}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            client_id: event.target.value,
                          }))
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
                        required
                        value={form.order_id}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            order_id: event.target.value,
                          }))
                        }
                      >
                        <option value="">
                          {ordersQuery.isLoading ? 'Loading orders...' : 'Select order'}
                        </option>
                        {orderOptions.map((order) => (
                          <option key={order.id} value={order.id}>
                            {resolveOrderLabel(Number(order.id))}
                          </option>
                        ))}
                      </select>
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
                      disabled={createPaid.isPending || updatePaid.isPending}
                      form="create-paid-form"
                      type="submit"
                    >
                      {createPaid.isPending || updatePaid.isPending
                        ? 'Saving...'
                        : editingPaid
                          ? 'Save changes'
                          : 'Save paid'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog
                open={Boolean(paidToDelete)}
                onOpenChange={(open) => {
                  if (!open) {
                    closeDeleteDialog();
                  }
                }}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete paid</DialogTitle>
                    <DialogDescription>
                      {paidToDelete
                        ? `Paid record for "${resolveClientLabel(paidToDelete.client_id)}" will be removed.`
                        : 'Selected paid record will be deleted.'}
                    </DialogDescription>
                  </DialogHeader>

                  <DialogFooter>
                    <Button
                      disabled={deletePaid.isPending}
                      onClick={closeDeleteDialog}
                      type="button"
                      variant="ghost"
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-rose-600 text-white hover:bg-rose-700"
                      disabled={deletePaid.isPending}
                      onClick={() => void handleConfirmDelete()}
                      type="button"
                    >
                      {deletePaid.isPending ? 'Deleting...' : 'Delete'}
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
              {mutationError.message || 'Failed to save paid changes.'}
            </p>
          ) : null}

          {paidsQuery.isLoading || clientsQuery.isLoading || ordersQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading paid records...</p>
          ) : paidsQuery.isError ? (
            <p className="text-sm text-rose-700">Failed to load paid records from the backend.</p>
          ) : paidsQuery.data && paidsQuery.data.length > 0 ? (
            <PaidsDataTable
              onDeletePaid={openDeleteDialog}
              onEditPaid={openEditDialog}
              paids={paidsQuery.data}
              resolveClientLabel={resolveClientLabel}
              resolveOrderLabel={resolveOrderLabel}
              visibleColumns={visibleColumns}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              No paid records returned by the backend yet.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
