import { FormEvent, useEffect, useMemo, useState } from 'react';
import { EntityListCard } from '../components/entity-list-card';
import { TasksDataTable } from '../components/tasks-data-table';
import {
  ReminderDateTimeField,
  isReminderDateTimeReady,
  toReminderApiDateTime,
  toReminderLocalDateTime,
} from '../components/reminder-date-time-field';
import { useClients } from '../features/clients/use-clients';
import { useOrders } from '../features/orders/use-orders';
import { useCreateTask } from '../features/tasks/use-create-task';
import { useDeleteTask } from '../features/tasks/use-delete-task';
import { usePaginatedTasks } from '../features/tasks/use-paginated-tasks';
import { useUpdateTask } from '../features/tasks/use-update-task';
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
import { Label } from '../shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../shared/ui/select';
import { Textarea } from '../shared/ui/textarea';
import { TaskRecord, TaskStatus } from '../shared/types/task';
import { t } from '../shared/lib/i18n';

const initialFormState = {
  client_id: '',
  order_id: '',
  content: '',
  status: 'pending' as TaskStatus,
  deadline: '',
};

const TASKS_TABLE_COLUMNS_STORAGE_KEY = 'tasks-table-visible-columns';

const defaultVisibleColumns = {
  client: true,
  order: false,
  status: true,
  deadline: true,
  content: true,
  created_at: false,
  updated_at: false,
};

type VisibleColumns = typeof defaultVisibleColumns;
type TasksSortField = 'created_at' | 'updated_at' | 'deadline';
type TaskStatusFilter = 'all' | TaskStatus;

export function TasksPage() {
  const [form, setForm] = useState(initialFormState);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskRecord | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TaskRecord | null>(null);
  const [tasksPage, setTasksPage] = useState(1);
  const [tasksPageSize, setTasksPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('all');
  const [sortBy, setSortBy] = useState<TasksSortField>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>(() => {
    if (typeof window === 'undefined') {
      return defaultVisibleColumns;
    }

    const storedValue = window.localStorage.getItem(TASKS_TABLE_COLUMNS_STORAGE_KEY);

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
  const tasksQuery = usePaginatedTasks(
    { page: tasksPage, pageSize: tasksPageSize },
    {
      sortBy,
      sortDirection,
    },
    {
      status: statusFilter === 'all' ? undefined : statusFilter,
    },
  );
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const mutationError = createTask.error ?? updateTask.error ?? deleteTask.error;
  const tasks = tasksQuery.data?.items ?? [];
  const tasksTotal = tasksQuery.data?.total ?? 0;

  useEffect(() => {
    window.localStorage.setItem(
      TASKS_TABLE_COLUMNS_STORAGE_KEY,
      JSON.stringify(visibleColumns),
    );
  }, [visibleColumns]);

  useEffect(() => {
    const pageCount = Math.max(1, Math.ceil(tasksTotal / tasksPageSize));

    if (tasksPage > pageCount) {
      setTasksPage(pageCount);
    }
  }, [tasksPage, tasksPageSize, tasksTotal]);

  const clientOptions = clientsQuery.data ?? [];
  const orderOptions = useMemo(
    () =>
      (ordersQuery.data ?? []).filter((order) =>
        form.client_id ? order.client_id === form.client_id : true,
      ),
    [form.client_id, ordersQuery.data],
  );

  useEffect(() => {
    if (!isTaskDialogOpen || editingTask || form.client_id || clientOptions.length === 0) {
      return;
    }

    setForm((current) => ({
      ...current,
      client_id: clientOptions[0].id,
    }));
  }, [clientOptions, editingTask, form.client_id, isTaskDialogOpen]);

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
    { key: 'status', label: t('common.status') },
    { key: 'deadline', label: t('common.deadline') },
    { key: 'content', label: t('common.content') },
    { key: 'created_at', label: t('common.createdAt') },
    { key: 'updated_at', label: t('common.updatedAt') },
  ];

  const sortOptions: Array<{ value: TasksSortField; label: string }> = [
    { value: 'created_at', label: t('common.createdAt') },
    { value: 'updated_at', label: t('common.updatedAt') },
    { value: 'deadline', label: t('common.deadline') },
  ];

  const statusFilterOptions: Array<{ value: TaskStatusFilter; label: string }> = [
    { value: 'all', label: t('common.all') },
    { value: 'pending', label: t('status.pending') },
    { value: 'complete', label: t('status.complete') },
  ];

  function openCreateDialog() {
    createTask.reset();
    updateTask.reset();
    setEditingTask(null);
    setForm({
      client_id: clientOptions[0]?.id ?? '',
      order_id: '',
      content: '',
      status: 'pending',
      deadline: '',
    });
    setIsTaskDialogOpen(true);
  }

  function openEditDialog(task: TaskRecord) {
    createTask.reset();
    updateTask.reset();
    setEditingTask(task);
    setForm({
      client_id: task.client_id,
      order_id: task.order_id ? String(task.order_id) : '',
      content: task.content,
      status: task.status,
      deadline: toReminderLocalDateTime(task.deadline ?? undefined),
    });
    setIsTaskDialogOpen(true);
  }

  function closeDialog() {
    setIsTaskDialogOpen(false);
    setEditingTask(null);
    setForm(initialFormState);
    createTask.reset();
    updateTask.reset();
  }

  function openDeleteDialog(task: TaskRecord) {
    deleteTask.reset();
    setTaskToDelete(task);
  }

  function closeDeleteDialog() {
    if (deleteTask.isPending) {
      return;
    }

    setTaskToDelete(null);
    deleteTask.reset();
  }

  async function handleConfirmDelete() {
    if (!taskToDelete) {
      return;
    }

    await deleteTask.mutateAsync(taskToDelete.id);
    setTaskToDelete(null);
    deleteTask.reset();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      client_id: form.client_id,
      order_id: form.order_id ? Number(form.order_id) : null,
      content: form.content,
      status: form.status,
      deadline: form.deadline && isReminderDateTimeReady(form.deadline)
        ? toReminderApiDateTime(form.deadline)
        : null,
    };

    if (editingTask) {
      await updateTask.mutateAsync({
        taskId: editingTask.id,
        payload,
      });
    } else {
      await createTask.mutateAsync(payload);
    }

    closeDialog();
  }

  return (
    <main className="grid gap-4">
      <EntityListCard
        actions={
          <>
              <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateDialog}>{t('actions.create')}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingTask ? t('dialog.editTaskTitle') : t('dialog.newTaskTitle')}
                    </DialogTitle>
                    <DialogDescription>
                      {editingTask
                        ? t('dialog.taskEditDescription')
                        : t('dialog.taskCreateDescription')}
                    </DialogDescription>
                  </DialogHeader>

                  <form className="grid gap-4" id="create-task-form" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                      <Label htmlFor="client_id">{t('common.client')}</Label>
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
                      <Label htmlFor="order_id">{t('common.order')}</Label>
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
                          <SelectValue placeholder={t('placeholder.noOrder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">{t('placeholder.noOrder')}</SelectItem>
                          {orderOptions.map((order) => (
                            <SelectItem key={order.id} value={String(order.id)}>
                              {resolveOrderLabel(Number(order.id))}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <ReminderDateTimeField
                        idPrefix="task-deadline"
                        label={t('common.deadline')}
                        placeholder={t('placeholder.noDeadline')}
                        value={form.deadline}
                        onChange={(deadline) =>
                          setForm((current) => ({ ...current, deadline }))
                        }
                      />
                      {form.deadline ? (
                        <Button
                          className="h-auto justify-self-start px-0 text-muted-foreground hover:text-foreground"
                          type="button"
                          variant="ghost"
                          onClick={() =>
                            setForm((current) => ({ ...current, deadline: '' }))
                          }
                        >
                          {t('actions.clear')}
                        </Button>
                      ) : null}
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
                        createTask.isPending ||
                        updateTask.isPending ||
                        clientOptions.length === 0 ||
                        !form.client_id
                      }
                      form="create-task-form"
                      type="submit"
                    >
                      {createTask.isPending || updateTask.isPending
                        ? t('actions.saving')
                        : editingTask
                          ? t('actions.save')
                          : t('actions.save')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog
                open={Boolean(taskToDelete)}
                onOpenChange={(open) => {
                  if (!open) {
                    closeDeleteDialog();
                  }
                }}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('dialog.deleteTaskTitle')}</DialogTitle>
                    <DialogDescription>
                      {taskToDelete
                        ? t('dialog.taskDeleteNamedDescription', undefined, {
                            name: resolveClientLabel(taskToDelete.client_id),
                          })
                        : t('dialog.taskDeleteDescription')}
                    </DialogDescription>
                  </DialogHeader>

                  <DialogFooter>
                    <Button
                      disabled={deleteTask.isPending}
                      onClick={closeDeleteDialog}
                      type="button"
                      variant="ghost"
                    >
                      {t('actions.cancel')}
                    </Button>
                    <Button
                      className="bg-rose-600 text-white hover:bg-rose-700"
                      disabled={deleteTask.isPending}
                      onClick={() => void handleConfirmDelete()}
                      type="button"
                    >
                      {deleteTask.isPending ? t('actions.deleting') : t('actions.delete')}
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
              const nextValue = (value || 'all') as TaskStatusFilter;
              setStatusFilter(nextValue);
              setTasksPage(1);
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
        title={t('page.tasks')}
        onSortChange={(nextSort) => {
          setSortBy(nextSort.sortBy);
          setSortDirection(nextSort.sortDirection);
        }}
        pagination={{
          page: tasksPage,
          pageSize: tasksPageSize,
          totalItems: tasksTotal,
          onPageChange: setTasksPage,
          onPageSizeChange: (pageSize) => {
            setTasksPageSize(pageSize);
            setTasksPage(1);
          },
        }}
      >
          {mutationError ? (
            <p className="mb-4 text-sm text-rose-700">
              {mutationError.message || t('feedback.taskSaveFailed')}
            </p>
          ) : null}

          {tasksQuery.isLoading || clientsQuery.isLoading || ordersQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">{t('placeholder.loadingTasks')}</p>
          ) : tasksQuery.isError ? (
            <p className="text-sm text-rose-700">{t('feedback.tasksLoadFailed')}</p>
          ) : tasks.length > 0 ? (
            <>
              <TasksDataTable
                onDeleteTask={openDeleteDialog}
                onEditTask={openEditDialog}
                resolveClientLabel={resolveClientLabel}
                resolveOrderLabel={resolveOrderLabel}
                tasks={tasks}
                visibleColumns={visibleColumns}
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('empty.tasks')}
            </p>
          )}
      </EntityListCard>
    </main>
  );
}
