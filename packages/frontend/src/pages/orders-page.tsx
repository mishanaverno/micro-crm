import { FormEvent, useEffect, useMemo, useState } from 'react';
import { OrdersDataTable } from '../components/orders-data-table';
import { useClients } from '../features/clients/use-clients';
import { useCreateOrder } from '../features/orders/use-create-order';
import { useDeleteOrder } from '../features/orders/use-delete-order';
import { useOrders } from '../features/orders/use-orders';
import { useUpdateOrder } from '../features/orders/use-update-order';
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
import { OrderRecord, OrderStatus } from '../shared/types/order';

const initialFormState = {
  client_id: '',
  price: '',
  content: '',
  status: 'created' as OrderStatus,
};

const ORDERS_TABLE_COLUMNS_STORAGE_KEY = 'orders-table-visible-columns';

const defaultVisibleColumns = {
  client: true,
  price: true,
  status: true,
  created_at: false,
  updated_at: false,
};

type VisibleColumns = typeof defaultVisibleColumns;

export function OrdersPage() {
  const [form, setForm] = useState(initialFormState);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderRecord | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<OrderRecord | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>(() => {
    if (typeof window === 'undefined') {
      return defaultVisibleColumns;
    }

    const storedValue = window.localStorage.getItem(ORDERS_TABLE_COLUMNS_STORAGE_KEY);

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
  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();
  const mutationError = createOrder.error ?? updateOrder.error ?? deleteOrder.error;

  useEffect(() => {
    window.localStorage.setItem(
      ORDERS_TABLE_COLUMNS_STORAGE_KEY,
      JSON.stringify(visibleColumns),
    );
  }, [visibleColumns]);

  const clientOptions = clientsQuery.data ?? [];

  useEffect(() => {
    if (!isOrderDialogOpen || editingOrder || form.client_id || clientOptions.length === 0) {
      return;
    }

    setForm((current) => ({
      ...current,
      client_id: clientOptions[0].id,
    }));
  }, [clientOptions, editingOrder, form.client_id, isOrderDialogOpen]);

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

  function toggleColumn(column: keyof VisibleColumns) {
    setVisibleColumns((current: VisibleColumns) => ({
      ...current,
      [column]: !current[column],
    }));
  }

  function openCreateDialog() {
    createOrder.reset();
    updateOrder.reset();
    setEditingOrder(null);
    setForm({
      client_id: clientOptions[0]?.id ?? '',
      price: '',
      content: '',
      status: 'created',
    });
    setIsOrderDialogOpen(true);
  }

  function openEditDialog(order: OrderRecord) {
    createOrder.reset();
    updateOrder.reset();
    setEditingOrder(order);
    setForm({
      client_id: order.client_id,
      price: String(order.price),
      content: order.content,
      status: order.status,
    });
    setIsOrderDialogOpen(true);
  }

  function closeDialog() {
    setIsOrderDialogOpen(false);
    setEditingOrder(null);
    setForm(initialFormState);
    createOrder.reset();
    updateOrder.reset();
  }

  function openDeleteDialog(order: OrderRecord) {
    deleteOrder.reset();
    setOrderToDelete(order);
  }

  function closeDeleteDialog() {
    if (deleteOrder.isPending) {
      return;
    }

    setOrderToDelete(null);
    deleteOrder.reset();
  }

  async function handleConfirmDelete() {
    if (!orderToDelete) {
      return;
    }

    await deleteOrder.mutateAsync(orderToDelete.id);
    setOrderToDelete(null);
    deleteOrder.reset();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      client_id: form.client_id,
      price: Number(form.price),
      content: form.content,
      status: form.status,
    };

    if (editingOrder) {
      await updateOrder.mutateAsync({
        orderId: editingOrder.id,
        payload,
      });
    } else {
      await createOrder.mutateAsync(payload);
    }

    closeDialog();
  }

  return (
    <main className="grid gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1.5">
              <CardTitle>Orders</CardTitle>
              <CardDescription>
                Orders linked to clients, loaded from the API and editable from one workspace.
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
                    checked={visibleColumns.price}
                    onCheckedChange={() => toggleColumn('price')}
                  >
                    Price
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.status}
                    onCheckedChange={() => toggleColumn('status')}
                  >
                    Status
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

              <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateDialog}>Create order</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingOrder ? 'Edit order' : 'New order'}</DialogTitle>
                    <DialogDescription>
                      {editingOrder
                        ? 'Update the selected order for the client.'
                        : 'Create a new order for one of your clients.'}
                    </DialogDescription>
                  </DialogHeader>

                  <form className="grid gap-4" id="create-order-form" onSubmit={handleSubmit}>
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
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        min="0"
                        required
                        step="0.01"
                        type="number"
                        value={form.price}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, price: event.target.value }))
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <select
                        id="status"
                        className="flex h-12 w-full rounded-3xl border border-input bg-background px-4 text-sm text-foreground shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        required
                        value={form.status}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            status: event.target.value as OrderStatus,
                          }))
                        }
                      >
                        <option value="created">created</option>
                        <option value="inprogress">inprogress</option>
                        <option value="done">done</option>
                      </select>
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
                        createOrder.isPending ||
                        updateOrder.isPending ||
                        clientOptions.length === 0 ||
                        !form.client_id
                      }
                      form="create-order-form"
                      type="submit"
                    >
                      {createOrder.isPending || updateOrder.isPending
                        ? 'Saving...'
                        : editingOrder
                          ? 'Save changes'
                          : 'Save order'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog
                open={Boolean(orderToDelete)}
                onOpenChange={(open) => {
                  if (!open) {
                    closeDeleteDialog();
                  }
                }}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete order</DialogTitle>
                    <DialogDescription>
                      {orderToDelete
                        ? `Order for "${resolveClientLabel(
                            orderToDelete.client_id,
                          )}" will be removed.`
                        : 'Selected order will be deleted.'}
                    </DialogDescription>
                  </DialogHeader>

                  <DialogFooter>
                    <Button
                      disabled={deleteOrder.isPending}
                      onClick={closeDeleteDialog}
                      type="button"
                      variant="ghost"
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-rose-600 text-white hover:bg-rose-700"
                      disabled={deleteOrder.isPending}
                      onClick={() => void handleConfirmDelete()}
                      type="button"
                    >
                      {deleteOrder.isPending ? 'Deleting...' : 'Delete'}
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
              {mutationError.message || 'Failed to save order changes.'}
            </p>
          ) : null}

          {ordersQuery.isLoading || clientsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading orders...</p>
          ) : ordersQuery.isError ? (
            <p className="text-sm text-rose-700">Failed to load orders from the backend.</p>
          ) : ordersQuery.data && ordersQuery.data.length > 0 ? (
            <OrdersDataTable
              onDeleteOrder={openDeleteDialog}
              onEditOrder={openEditDialog}
              orders={ordersQuery.data}
              resolveClientLabel={resolveClientLabel}
              visibleColumns={visibleColumns}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              No orders returned by the backend yet.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
