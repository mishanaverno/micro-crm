import { FormEvent, useEffect, useState } from 'react';
import { ClientsDataTable } from '../components/clients-data-table';
import { TablePagination } from '../components/table-pagination';
import { useCreateClient } from '../features/clients/use-create-client';
import { useDeleteClient } from '../features/clients/use-delete-client';
import { usePaginatedClients } from '../features/clients/use-paginated-clients';
import { useUpdateClient } from '../features/clients/use-update-client';
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
import { ClientRecord, ClientStatus } from '../shared/types/client';

const initialFormState = {
  name: '',
  email: '',
  phone_number: '',
  company: '',
  status: 'individual' as ClientStatus,
};

const CLIENTS_TABLE_COLUMNS_STORAGE_KEY = 'clients-table-visible-columns';

const defaultVisibleColumns = {
  status: true,
  email: false,
  phone_number: true,
  company: false,
  created_at: false,
  updated_at: false,
};

type VisibleColumns = typeof defaultVisibleColumns;

export function ClientsPage() {
  const [form, setForm] = useState(initialFormState);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientRecord | null>(null);
  const [clientToDelete, setClientToDelete] = useState<ClientRecord | null>(null);
  const [clientsPage, setClientsPage] = useState(1);
  const [clientsPageSize, setClientsPageSize] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>(() => {
    if (typeof window === 'undefined') {
      return defaultVisibleColumns;
    }

    const storedValue = window.localStorage.getItem(
      CLIENTS_TABLE_COLUMNS_STORAGE_KEY,
    );

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
  const createClient = useCreateClient();
  const deleteClient = useDeleteClient();
  const updateClient = useUpdateClient();
  const clientsQuery = usePaginatedClients({ page: clientsPage, pageSize: clientsPageSize });
  const clients = clientsQuery.data?.items ?? [];
  const clientsTotal = clientsQuery.data?.total ?? 0;

  useEffect(() => {
    window.localStorage.setItem(
      CLIENTS_TABLE_COLUMNS_STORAGE_KEY,
      JSON.stringify(visibleColumns),
    );
  }, [visibleColumns]);

  useEffect(() => {
    const pageCount = Math.max(1, Math.ceil(clientsTotal / clientsPageSize));

    if (clientsPage > pageCount) {
      setClientsPage(pageCount);
    }
  }, [clientsPage, clientsPageSize, clientsTotal]);

  function toggleColumn(column: keyof VisibleColumns) {
    setVisibleColumns((current: VisibleColumns) => ({
      ...current,
      [column]: !current[column],
    }));
  }

  function openCreateDialog() {
    setEditingClient(null);
    setForm(initialFormState);
    setIsCreateDialogOpen(true);
  }

  function openEditDialog(client: ClientRecord) {
    setEditingClient(client);
    setForm({
      name: client.name ?? '',
      email: client.email ?? '',
      phone_number: client.phone_number ?? '',
      company: client.company ?? '',
      status: client.status ?? 'individual',
    });
    setIsCreateDialogOpen(true);
  }

  function closeDialog() {
    setIsCreateDialogOpen(false);
    setEditingClient(null);
    setForm(initialFormState);
  }

  function openDeleteDialog(client: ClientRecord) {
    setClientToDelete(client);
  }

  function closeDeleteDialog() {
    if (deleteClient.isPending) {
      return;
    }

    setClientToDelete(null);
  }

  async function handleConfirmDelete() {
    if (!clientToDelete) {
      return;
    }

    await deleteClient.mutateAsync(clientToDelete.id);
    setClientToDelete(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      name: form.name,
      email: form.email,
      phone_number: form.phone_number || undefined,
      company: form.company || undefined,
      status: form.status,
    };

    if (editingClient) {
      await updateClient.mutateAsync({
        clientId: editingClient.id,
        payload,
      });
    } else {
      await createClient.mutateAsync(payload);
    }

    closeDialog();
  }

  return (
    <main className="grid gap-4">
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-1.5">
                <CardTitle>Clients</CardTitle>
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
                      checked={visibleColumns.status}
                      onCheckedChange={() => toggleColumn('status')}
                    >
                      Status
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={visibleColumns.email}
                      onCheckedChange={() => toggleColumn('email')}
                    >
                      Email
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={visibleColumns.phone_number}
                      onCheckedChange={() => toggleColumn('phone_number')}
                    >
                      Phone
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={visibleColumns.company}
                      onCheckedChange={() => toggleColumn('company')}
                    >
                      Company
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

                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openCreateDialog}>Create client</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingClient ? 'Edit client' : 'New client'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingClient
                          ? 'Update the client record and save the latest details.'
                          : 'Create a client record. If the app is offline, the write will be queued and replayed later.'}
                      </DialogDescription>
                    </DialogHeader>

                    <form className="grid gap-4" id="create-client-form" onSubmit={handleSubmit}>
                      <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          required
                          value={form.name}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, name: event.target.value }))
                          }
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          required
                          type="email"
                          value={form.email}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, email: event.target.value }))
                          }
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="phone_number">Phone</Label>
                        <Input
                          id="phone_number"
                          value={form.phone_number}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, phone_number: event.target.value }))
                          }
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="client-status">Status</Label>
                        <Select
                          value={form.status}
                          onValueChange={(value) =>
                            setForm((current) => ({
                              ...current,
                              status: value as ClientStatus,
                            }))
                          }
                        >
                          <SelectTrigger id="client-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="individual">Физ лицо</SelectItem>
                            <SelectItem value="legal_entity">Юр лицо</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={form.company}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, company: event.target.value }))
                          }
                        />
                      </div>
                    </form>

                    <DialogFooter>
                      <Button
                        onClick={closeDialog}
                        type="button"
                        variant="ghost"
                      >
                        Cancel
                      </Button>
                      <Button
                        disabled={createClient.isPending || updateClient.isPending}
                        form="create-client-form"
                        type="submit"
                      >
                        {createClient.isPending || updateClient.isPending
                          ? 'Saving...'
                          : editingClient
                            ? 'Save changes'
                            : 'Save client'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={Boolean(clientToDelete)}
                  onOpenChange={(open) => {
                    if (!open) {
                      closeDeleteDialog();
                    }
                  }}
                >
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete client</DialogTitle>
                      <DialogDescription>
                        {clientToDelete
                          ? `Client "${clientToDelete.name || clientToDelete.email || clientToDelete.id}" will be moved to deleted state and hidden from the default list.`
                          : 'Selected client will be moved to deleted state.'}
                      </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                      <Button
                        disabled={deleteClient.isPending}
                        onClick={closeDeleteDialog}
                        type="button"
                        variant="ghost"
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-rose-600 text-white hover:bg-rose-700"
                        disabled={deleteClient.isPending}
                        onClick={() => void handleConfirmDelete()}
                        type="button"
                      >
                        {deleteClient.isPending ? 'Deleting...' : 'Delete'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {clientsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading clients...</p>
            ) : clientsQuery.isError ? (
              <p className="text-sm text-rose-700">
                Failed to load clients from the backend.
              </p>
            ) : clients.length > 0 ? (
              <>
                <ClientsDataTable
                  clients={clients}
                  onEditClient={openEditDialog}
                  onDeleteClient={openDeleteDialog}
                  visibleColumns={visibleColumns}
                />
                <TablePagination
                  page={clientsPage}
                  pageSize={clientsPageSize}
                  totalItems={clientsTotal}
                  onPageChange={setClientsPage}
                  onPageSizeChange={(pageSize) => {
                    setClientsPageSize(pageSize);
                    setClientsPage(1);
                  }}
                />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No clients returned by the backend yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
