import { FormEvent, useEffect, useMemo, useState } from 'react';
import { TasksDataTable } from '../components/tasks-data-table';
import { useClients } from '../features/clients/use-clients';
import { useOrders } from '../features/orders/use-orders';
import { useCreateTask } from '../features/tasks/use-create-task';
import { useDeleteTask } from '../features/tasks/use-delete-task';
import { useTasks } from '../features/tasks/use-tasks';
import { useUpdateTask } from '../features/tasks/use-update-task';
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

const initialFormState = {
  client_id: '',
  order_id: '',
  content: '',
  status: 'pending' as TaskStatus,
};

const TASKS_TABLE_COLUMNS_STORAGE_KEY = 'tasks-table-visible-columns';

const defaultVisibleColumns = {
  client: true,
  order: false,
  status: true,
  content: true,
  created_at: false,
  updated_at: false,
};

type VisibleColumns = typeof defaultVisibleColumns;

export function TasksPage() {
  const [form, setForm] = useState(initialFormState);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskRecord | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TaskRecord | null>(null);
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
  const tasksQuery = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const mutationError = createTask.error ?? updateTask.error ?? deleteTask.error;

  useEffect(() => {
    window.localStorage.setItem(
      TASKS_TABLE_COLUMNS_STORAGE_KEY,
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
    createTask.reset();
    updateTask.reset();
    setEditingTask(null);
    setForm({
      client_id: clientOptions[0]?.id ?? '',
      order_id: '',
      content: '',
      status: 'pending',
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
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1.5">
              <CardTitle>Tasks</CardTitle>
              <CardDescription>
                Action items for your clients, loaded from the API and editable from one workspace.
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
                    checked={visibleColumns.status}
                    onCheckedChange={() => toggleColumn('status')}
                  >
                    Status
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

              <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateDialog}>Create task</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingTask ? 'Edit task' : 'New task'}</DialogTitle>
                    <DialogDescription>
                      {editingTask
                        ? 'Update the selected task for the client.'
                        : 'Create a new task for one of your clients.'}
                    </DialogDescription>
                  </DialogHeader>

                  <form className="grid gap-4" id="create-task-form" onSubmit={handleSubmit}>
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
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={form.status}
                        onValueChange={(value) =>
                          setForm((current) => ({
                            ...current,
                            status: value as TaskStatus,
                          }))
                        }
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="complete">Complete</SelectItem>
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
                        createTask.isPending ||
                        updateTask.isPending ||
                        clientOptions.length === 0 ||
                        !form.client_id
                      }
                      form="create-task-form"
                      type="submit"
                    >
                      {createTask.isPending || updateTask.isPending
                        ? 'Saving...'
                        : editingTask
                          ? 'Save changes'
                          : 'Save task'}
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
                    <DialogTitle>Delete task</DialogTitle>
                    <DialogDescription>
                      {taskToDelete
                        ? `Task for "${resolveClientLabel(
                            taskToDelete.client_id,
                          )}" will be permanently removed.`
                        : 'Selected task will be deleted.'}
                    </DialogDescription>
                  </DialogHeader>

                  <DialogFooter>
                    <Button
                      disabled={deleteTask.isPending}
                      onClick={closeDeleteDialog}
                      type="button"
                      variant="ghost"
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-rose-600 text-white hover:bg-rose-700"
                      disabled={deleteTask.isPending}
                      onClick={() => void handleConfirmDelete()}
                      type="button"
                    >
                      {deleteTask.isPending ? 'Deleting...' : 'Delete'}
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
              {mutationError.message || 'Failed to save task changes.'}
            </p>
          ) : null}

          {tasksQuery.isLoading || clientsQuery.isLoading || ordersQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading tasks...</p>
          ) : tasksQuery.isError ? (
            <p className="text-sm text-rose-700">Failed to load tasks from the backend.</p>
          ) : tasksQuery.data && tasksQuery.data.length > 0 ? (
            <TasksDataTable
              onDeleteTask={openDeleteDialog}
              onEditTask={openEditDialog}
              resolveClientLabel={resolveClientLabel}
              resolveOrderLabel={resolveOrderLabel}
              tasks={tasksQuery.data}
              visibleColumns={visibleColumns}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              No tasks returned by the backend yet.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
