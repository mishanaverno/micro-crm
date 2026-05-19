import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, BarStack, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import { FinancesDataTable } from '../components/finances-data-table';
import { TablePagination } from '../components/table-pagination';
import { useClients } from '../features/clients/use-clients';
import { usePaginatedFinances } from '../features/finances/use-paginated-finances';
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
import { Card, CardContent, CardHeader, CardTitle } from '../shared/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartLegendContent,
  ChartTooltipContent,
} from '../shared/ui/chart';
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
import { FinanceRecord } from '../shared/types/finance';

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
type FinanceChartMode = 'month' | 'year';
type FinanceChartDatum = {
  period: string;
  tooltipLabel: string;
  paid: number;
  income: number;
  spent: number;
};

const financeChartConfig = {
  paid: {
    label: 'Paid',
    color: '#111827',
    marker: {
      colors: ['#ef4444', '#22c55e'],
    },
  },
  income: {
    label: 'Income',
    color: '#22c55e',
  },
  spent: {
    label: 'Spent',
    color: '#ef4444',
  }
} satisfies ChartConfig;

function parseNumericValue(value: unknown) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function formatCurrency(value: unknown) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(parseNumericValue(value));
}

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
  });
}

function formatMonthOptionLabel(value: string) {
  const [year, month] = value.split('-').map(Number);
  const date = new Date(year, month, 1);

  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function getDaysInMonth(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month + 1, 0).getDate();
}

function toFinanceChartDatum(
  period: string,
  tooltipLabel: string,
  paid: number,
  spent: number,
): FinanceChartDatum {
  return {
    period,
    tooltipLabel,
    paid,
    income: paid - spent,
    spent,
  };
}

export function FinancesPage() {
  const now = new Date();
  const [form, setForm] = useState(initialFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const [dialogKind, setDialogKind] = useState<FinanceFormKind>('paid');
  const [editingRecord, setEditingRecord] = useState<EditingRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<EditingRecord | null>(null);
  const [recordsPage, setRecordsPage] = useState(1);
  const [recordsPageSize, setRecordsPageSize] = useState(10);
  const [chartMode, setChartMode] = useState<FinanceChartMode>('month');
  const [selectedChartMonth, setSelectedChartMonth] = useState(getMonthKey(now));
  const [selectedChartYear, setSelectedChartYear] = useState(String(now.getFullYear()));
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
  const financeRecordsQuery = usePaginatedFinances({
    page: recordsPage,
    pageSize: recordsPageSize,
  });
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
          client.name || client.email || client.id,
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
  const tableRecords = financeRecordsQuery.data?.items ?? [];
  const recordsTotal = financeRecordsQuery.data?.total ?? 0;

  useEffect(() => {
    const pageCount = Math.max(1, Math.ceil(recordsTotal / recordsPageSize));

    if (recordsPage > pageCount) {
      setRecordsPage(pageCount);
    }
  }, [recordsPage, recordsPageSize, recordsTotal]);

  const availableChartYears = useMemo(() => {
    const years = new Set([now.getFullYear()]);

    records.forEach((record) => {
      const createdAt = record.created_at ? new Date(record.created_at) : null;

      if (createdAt && !Number.isNaN(createdAt.getTime())) {
        years.add(createdAt.getFullYear());
      }
    });

    return Array.from(years).sort((left, right) => right - left);
  }, [now, records]);

  const monthOptions = useMemo(
    () =>
      availableChartYears.flatMap((year) =>
        Array.from({ length: 12 }, (_, month) => `${year}-${month}`),
      ),
    [availableChartYears],
  );

  const chartData = useMemo<FinanceChartDatum[]>(() => {
    if (chartMode === 'year') {
      const year = Number(selectedChartYear);

      return Array.from({ length: 12 }, (_, month) => {
        const monthStart = new Date(year, month, 1);

        return {
          period: formatMonthLabel(monthStart),
          tooltipLabel: monthStart.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          }),
          paid: 0,
          spent: 0,
          month,
        };
      }).map((bucket) => {
        records.forEach((record) => {
          const createdAt = record.created_at ? new Date(record.created_at) : null;

          if (
            !createdAt ||
            Number.isNaN(createdAt.getTime()) ||
            createdAt.getFullYear() !== year ||
            createdAt.getMonth() !== bucket.month
          ) {
            return;
          }

          if (record.kind === 'paid') {
            bucket.paid += parseNumericValue(record.value);
          } else {
            bucket.spent += parseNumericValue(record.value);
          }
        });

        return toFinanceChartDatum(
          bucket.period,
          bucket.tooltipLabel,
          bucket.paid,
          bucket.spent,
        );
      });
    }

    const [year, month] = selectedChartMonth.split('-').map(Number);
    const daysInMonth = getDaysInMonth(selectedChartMonth);

    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;

      return {
        period: String(day),
        paid: 0,
        spent: 0,
        day,
      };
    }).map((bucket) => {
      records.forEach((record) => {
        const createdAt = record.created_at ? new Date(record.created_at) : null;

        if (
          !createdAt ||
          Number.isNaN(createdAt.getTime()) ||
          createdAt.getFullYear() !== year ||
          createdAt.getMonth() !== month ||
          createdAt.getDate() !== bucket.day
        ) {
          return;
        }

        if (record.kind === 'paid') {
          bucket.paid += parseNumericValue(record.value);
        } else {
          bucket.spent += parseNumericValue(record.value);
        }
      });

      return toFinanceChartDatum(
        bucket.period,
        new Date(year, month, bucket.day).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        bucket.paid,
        bucket.spent,
      );
    });
  }, [chartMode, records, selectedChartMonth, selectedChartYear]);

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

  const isChartLoading = paidsQuery.isLoading || spentsQuery.isLoading;
  const isChartError = paidsQuery.isError || spentsQuery.isError;
  const isTableLoading =
    financeRecordsQuery.isLoading || clientsQuery.isLoading || ordersQuery.isLoading;
  const isTableError = financeRecordsQuery.isError;

  return (
    <main className="grid gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle>Finance chart</CardTitle>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-md border border-border bg-muted p-1">
                <Button
                  className="h-8 rounded-sm px-3"
                  onClick={() => setChartMode('month')}
                  type="button"
                  variant={chartMode === 'month' ? 'default' : 'ghost'}
                >
                  Month
                </Button>
                <Button
                  className="h-8 rounded-sm px-3"
                  onClick={() => setChartMode('year')}
                  type="button"
                  variant={chartMode === 'year' ? 'default' : 'ghost'}
                >
                  Year
                </Button>
              </div>

              {chartMode === 'month' ? (
                <Select value={selectedChartMonth} onValueChange={setSelectedChartMonth}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((month) => (
                      <SelectItem key={month} value={month}>
                        {formatMonthOptionLabel(month)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select value={selectedChartYear} onValueChange={setSelectedChartYear}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableChartYears.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isChartLoading ? (
            <p className="text-sm text-muted-foreground">Loading finance chart...</p>
          ) : isChartError ? (
            <p className="text-sm text-rose-700">Failed to load finance chart data.</p>
          ) : chartData.length > 0 ? (
            <ChartContainer className="h-[320px] w-full" config={financeChartConfig}>
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="period"
                  tickLine={false}
                  tickMargin={10}
                />
                <YAxis
                  axisLine={false}
                  tickFormatter={(value) => formatCurrency(Number(value))}
                  tickLine={false}
                  tickMargin={10}
                  width={96}
                />
                <Tooltip
                  content={<ChartTooltipContent valueFormatter={formatCurrency} />}
                  cursor={false}
                />
                <Legend content={<ChartLegendContent />} />
                <BarStack radius={4}>
                  <Bar
                    dataKey="income"
                    fill="var(--color-income)"
                    stackId="finance"
                  />
                  <Bar
                    dataKey="spent"
                    fill="var(--color-spent)"
                    stackId="finance"
                  />
                </BarStack>
              </BarChart>
            </ChartContainer>
          ) : (
            <p className="text-sm text-muted-foreground">
              No finance records returned by the backend yet.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1.5">
              <CardTitle>Finances</CardTitle>
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

          {isTableLoading ? (
            <p className="text-sm text-muted-foreground">Loading finance records...</p>
          ) : isTableError ? (
            <p className="text-sm text-rose-700">Failed to load finance records from the backend.</p>
          ) : tableRecords.length > 0 ? (
            <>
              <FinancesDataTable
                onDeleteRecord={openDeleteDialog}
                onEditRecord={openEditDialog}
                records={tableRecords}
                resolveClientLabel={resolveClientLabel}
                resolveOrderLabel={resolveOrderLabel}
                visibleColumns={visibleColumns}
              />
              <TablePagination
                page={recordsPage}
                pageSize={recordsPageSize}
                totalItems={recordsTotal}
                onPageChange={setRecordsPage}
                onPageSizeChange={(pageSize) => {
                  setRecordsPageSize(pageSize);
                  setRecordsPage(1);
                }}
              />
            </>
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
