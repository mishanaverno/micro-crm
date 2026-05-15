import { FormEvent, useEffect, useMemo, useState } from 'react';
import { OrdersDataTable } from '../components/orders-data-table';
import { useClients } from '../features/clients/use-clients';
import { useCreateOrder } from '../features/orders/use-create-order';
import { useDeleteOrder } from '../features/orders/use-delete-order';
import { useOrders } from '../features/orders/use-orders';
import { useUpdateOrder } from '../features/orders/use-update-order';
import { Button } from '../shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../shared/ui/select';
import { Textarea } from '../shared/ui/textarea';
import { OrderRecord, OrderStatus } from '../shared/types/order';

const initialFormState = {
  client_id: '',
  title: '',
  price: '',
  content: '',
  status: 'created' as OrderStatus,
};

const ORDERS_TABLE_COLUMNS_STORAGE_KEY = 'orders-table-visible-columns';

const defaultVisibleColumns = {
  id: true,
  client: true,
  title: true,
  price: true,
  status: true,
  created_at: false,
  updated_at: false,
};

type VisibleColumns = typeof defaultVisibleColumns;

export function OrdersPage() {
  const [form, setForm] = useState(initialFormState);
  const [formError, setFormError] = useState<string | null>(null);
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
    setFormError(null);
    setEditingOrder(null);
    setForm({
      client_id: clientOptions[0]?.id ?? '',
      title: '',
      price: '',
      content: '',
      status: 'created',
    });
    setIsOrderDialogOpen(true);
  }

  function openEditDialog(order: OrderRecord) {
    createOrder.reset();
    updateOrder.reset();
    setFormError(null);
    setEditingOrder(order);
    setForm({
      client_id: order.client_id,
      title: order.title ?? '',
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
    setFormError(null);
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

    if (!form.client_id) {
      setFormError('Select a client before saving the order.');
      return;
    }

    if (!form.price || Number.isNaN(Number(form.price))) {
      setFormError('Enter a valid order price.');
      return;
    }

    setFormError(null);

    const payload = {
      title: form.title || undefined,
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
      await createOrder.mutateAsync({
        ...payload,
        client_id: form.client_id,
      });
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
                    checked={visibleColumns.id}
                    onCheckedChange={() => toggleColumn('id')}
                  >
                    Order ID
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.client}
                    onCheckedChange={() => toggleColumn('client')}
                  >
                    Client
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.title}
                    onCheckedChange={() => toggleColumn('title')}
                  >
                    Title
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
                      <Select
                        disabled={
                          Boolean(editingOrder) ||
                          clientsQuery.isLoading ||
                          clientOptions.length === 0
                        }
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
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={form.title}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, title: event.target.value }))
                        }
                      />
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
                      <Select
                        value={form.status}
                        onValueChange={(value) =>
                          setForm((current) => ({
                            ...current,
                            status: value as OrderStatus,
                          }))
                        }
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="created">created</SelectItem>
                          <SelectItem value="inprogress">inprogress</SelectItem>
                          <SelectItem value="done">done</SelectItem>
                        </SelectContent>
                      </Select>
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
          {formError ? (
            <p className="mb-4 text-sm text-rose-700">{formError}</p>
          ) : null}

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
