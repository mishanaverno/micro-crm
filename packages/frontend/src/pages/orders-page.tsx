import { FormEvent, useEffect, useMemo, useState } from 'react';
import { EntityListCard } from '../components/entity-list-card';
import { OrdersDataTable } from '../components/orders-data-table';
import { useClients } from '../features/clients/use-clients';
import { useCreateOrder } from '../features/orders/use-create-order';
import { useDeleteOrder } from '../features/orders/use-delete-order';
import { usePaginatedOrders } from '../features/orders/use-paginated-orders';
import { useUpdateOrder } from '../features/orders/use-update-order';
import { Button } from '../shared/ui/button';
import { ToggleGroup, ToggleGroupItem } from '../shared/ui/toggle-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../shared/ui/dialog';
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
import { t } from '../shared/lib/i18n';

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
type OrdersSortField = 'created_at' | 'updated_at' | 'price' | 'status';
type OrderStatusFilter = 'all' | OrderStatus;

export function OrdersPage() {
  const [form, setForm] = useState(initialFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderRecord | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<OrderRecord | null>(null);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersPageSize, setOrdersPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all');
  const [sortBy, setSortBy] = useState<OrdersSortField>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
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
  const ordersQuery = usePaginatedOrders(
    { page: ordersPage, pageSize: ordersPageSize },
    {
      sortBy,
      sortDirection,
    },
    {
      status: statusFilter === 'all' ? undefined : statusFilter,
    },
  );
  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();
  const mutationError = createOrder.error ?? updateOrder.error ?? deleteOrder.error;
  const orders = ordersQuery.data?.items ?? [];
  const ordersTotal = ordersQuery.data?.total ?? 0;

  useEffect(() => {
    window.localStorage.setItem(
      ORDERS_TABLE_COLUMNS_STORAGE_KEY,
      JSON.stringify(visibleColumns),
    );
  }, [visibleColumns]);

  useEffect(() => {
    const pageCount = Math.max(1, Math.ceil(ordersTotal / ordersPageSize));

    if (ordersPage > pageCount) {
      setOrdersPage(pageCount);
    }
  }, [ordersPage, ordersPageSize, ordersTotal]);

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
        client.name || client.email || client.id,
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

  const columnOptions: Array<{ key: keyof VisibleColumns; label: string }> = [
    { key: 'id', label: t('common.orderId') },
    { key: 'client', label: t('common.client') },
    { key: 'title', label: t('common.title') },
    { key: 'price', label: t('common.price') },
    { key: 'status', label: t('common.status') },
    { key: 'created_at', label: t('common.createdAt') },
    { key: 'updated_at', label: t('common.updatedAt') },
  ];

  const sortOptions: Array<{ value: OrdersSortField; label: string }> = [
    { value: 'created_at', label: t('common.createdAt') },
    { value: 'updated_at', label: t('common.updatedAt') },
    { value: 'price', label: t('common.price') },
    { value: 'status', label: t('common.status') },
  ];

  const statusFilterOptions: Array<{ value: OrderStatusFilter; label: string }> = [
    { value: 'all', label: t('common.all') },
    { value: 'created', label: t('status.created') },
    { value: 'inprogress', label: t('status.inProgress') },
    { value: 'done', label: t('status.done') },
  ];

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
      setFormError(t('form.clientRequiredForOrder'));
      return;
    }

    if (!form.price || Number.isNaN(Number(form.price))) {
      setFormError(t('form.invalidOrderPrice'));
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
      <EntityListCard
        actions={
          <>
              <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateDialog}>{t('actions.create')}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingOrder ? t('dialog.editOrderTitle') : t('dialog.newOrderTitle')}
                    </DialogTitle>
                    <DialogDescription>
                      {editingOrder
                        ? t('dialog.orderEditDescription')
                        : t('dialog.orderCreateDescription')}
                    </DialogDescription>
                  </DialogHeader>

                  <form className="grid gap-4" id="create-order-form" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                      <Label htmlFor="client_id">{t('common.client')}</Label>
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
                              clientsQuery.isLoading
                                ? t('placeholder.loadingClients')
                                : t('placeholder.selectClient')
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
                      <Label htmlFor="title">{t('common.title')}</Label>
                      <Input
                        id="title"
                        value={form.title}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, title: event.target.value }))
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="price">{t('common.price')}</Label>
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
                      <Label htmlFor="content">{t('common.content')}</Label>
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
                      {t('actions.cancel')}
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
                        ? t('actions.saving')
                        : editingOrder
                          ? t('actions.save')
                          : t('actions.save')}
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
                    <DialogTitle>{t('dialog.deleteOrderTitle')}</DialogTitle>
                    <DialogDescription>
                      {orderToDelete
                        ? t('dialog.orderDeleteNamedDescription', undefined, {
                            name: resolveClientLabel(orderToDelete.client_id),
                          })
                        : t('dialog.orderDeleteDescription')}
                    </DialogDescription>
                  </DialogHeader>

                  <DialogFooter>
                    <Button
                      disabled={deleteOrder.isPending}
                      onClick={closeDeleteDialog}
                      type="button"
                      variant="ghost"
                    >
                      {t('actions.cancel')}
                    </Button>
                    <Button
                      className="bg-rose-600 text-white hover:bg-rose-700"
                      disabled={deleteOrder.isPending}
                      onClick={() => void handleConfirmDelete()}
                      type="button"
                    >
                      {deleteOrder.isPending ? t('actions.deleting') : t('actions.delete')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
          </>
        }
        columns={{
          columns: columnOptions,
          visibleColumns,
          onToggle: toggleColumn,
        }}
        leadingControls={
          <ToggleGroup
            className="rounded-full border border-input bg-background p-1"
            onValueChange={(value) => {
              const nextValue = (value || 'all') as OrderStatusFilter;
              setStatusFilter(nextValue);
              setOrdersPage(1);
            }}
            type="single"
            value={statusFilter}
            variant="ghost"
          >
            {statusFilterOptions.map((option) => (
              <ToggleGroupItem
                className="h-8 rounded-full px-3 text-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                key={option.value}
                value={option.value}
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        }
        sort={{
          sortBy,
          sortDirection,
        }}
        sortOptions={sortOptions}
        title={t('page.orders')}
        onSortChange={(nextSort) => {
          setSortBy(nextSort.sortBy);
          setSortDirection(nextSort.sortDirection);
        }}
        pagination={{
          page: ordersPage,
          pageSize: ordersPageSize,
          totalItems: ordersTotal,
          onPageChange: setOrdersPage,
          onPageSizeChange: (pageSize) => {
            setOrdersPageSize(pageSize);
            setOrdersPage(1);
          },
        }}
      >
          {formError ? (
            <p className="mb-4 text-sm text-rose-700">{formError}</p>
          ) : null}

          {mutationError ? (
            <p className="mb-4 text-sm text-rose-700">
              {mutationError.message || t('feedback.orderSaveFailed')}
            </p>
          ) : null}

          {ordersQuery.isLoading || clientsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">{t('placeholder.loadingOrders')}</p>
          ) : ordersQuery.isError ? (
            <p className="text-sm text-rose-700">{t('feedback.ordersLoadFailed')}</p>
          ) : orders.length > 0 ? (
            <>
              <OrdersDataTable
                onDeleteOrder={openDeleteDialog}
                onEditOrder={openEditDialog}
                orders={orders}
                resolveClientLabel={resolveClientLabel}
                visibleColumns={visibleColumns}
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('empty.orders')}
            </p>
          )}
      </EntityListCard>
    </main>
  );
}
