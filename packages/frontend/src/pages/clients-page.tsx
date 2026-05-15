import { FormEvent, useEffect, useState } from 'react';
import { ClientsDataTable } from '../components/clients-data-table';
import { useCreateClient } from '../features/clients/use-create-client';
import { useDeleteClient } from '../features/clients/use-delete-client';
import { useClients } from '../features/clients/use-clients';
import { useUpdateClient } from '../features/clients/use-update-client';
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
import { ClientRecord } from '../shared/types/client';

const initialFormState = {
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  company: '',
};

const CLIENTS_TABLE_COLUMNS_STORAGE_KEY = 'clients-table-visible-columns';

const defaultVisibleColumns = {
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
  const clientsQuery = useClients();

  useEffect(() => {
    window.localStorage.setItem(
      CLIENTS_TABLE_COLUMNS_STORAGE_KEY,
      JSON.stringify(visibleColumns),
    );
  }, [visibleColumns]);

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
      first_name: client.first_name ?? '',
      last_name: client.last_name ?? '',
      email: client.email ?? '',
      phone_number: client.phone_number ?? '',
      company: client.company ?? '',
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
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      phone_number: form.phone_number || undefined,
      company: form.company || undefined,
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
                        <Label htmlFor="first_name">First name</Label>
                        <Input
                          id="first_name"
                          required
                          value={form.first_name}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, first_name: event.target.value }))
                          }
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="last_name">Last name</Label>
                        <Input
                          id="last_name"
                          required
                          value={form.last_name}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, last_name: event.target.value }))
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
                          ? `Client "${
                              [clientToDelete.first_name, clientToDelete.last_name]
                                .filter(Boolean)
                                .join(' ') ||
                              clientToDelete.email ||
                              clientToDelete.id
                            }" will be moved to deleted state and hidden from the default list.`
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
            ) : clientsQuery.data && clientsQuery.data.length > 0 ? (
              <ClientsDataTable
                clients={clientsQuery.data}
                onEditClient={openEditDialog}
                onDeleteClient={openDeleteDialog}
                visibleColumns={visibleColumns}
              />
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
