import { FormEvent, useState } from 'react';
import { useCreateClient } from '../features/clients/use-create-client';
import { useClients } from '../features/clients/use-clients';
import { useOfflineClients } from '../features/clients/use-offline-clients';
import { useNetworkStatus } from '../shared/lib/network';
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
import { Input } from '../shared/ui/input';
import { Label } from '../shared/ui/label';

const initialFormState = {
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  company: '',
};

export function ClientsPage() {
  const [form, setForm] = useState(initialFormState);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const createClient = useCreateClient();
  const clientsQuery = useClients();


  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await createClient.mutateAsync({
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      phone_number: form.phone_number || undefined,
      company: form.company || undefined,
    });

    setForm(initialFormState);
    setIsCreateDialogOpen(false);
  }

  return (
    <main className="grid gap-4">
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Clients</CardTitle>
            <CardDescription>
              This list is loaded from the API and refreshed after successful writes.
            </CardDescription>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>Create client</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New client</DialogTitle>
                  <DialogDescription>
                    Create a client record. If the app is offline, the write will be queued and
                    replayed later.
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
                    onClick={() => setIsCreateDialogOpen(false)}
                    type="button"
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                  <Button disabled={createClient.isPending} form="create-client-form" type="submit">
                    {createClient.isPending ? 'Saving...' : 'Save client'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {clientsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading clients...</p>
            ) : clientsQuery.isError ? (
              <p className="text-sm text-rose-700">
                Failed to load clients from the backend.
              </p>
            ) : clientsQuery.data && clientsQuery.data.length > 0 ? (
              <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-left text-sm">
                <thead className="text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Client</th>
                    <th className="px-3 py-2 font-medium">Email</th>
                    <th className="px-3 py-2 font-medium">Phone</th>
                    <th className="px-3 py-2 font-medium">Company</th>
                    <th className="px-3 py-2 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {clientsQuery.data.map((client) => (
                    <tr key={client.id} className="rounded-2xl bg-muted/60">
                      <td className="rounded-l-2xl px-3 py-3 font-medium text-foreground">
                        {[client.first_name, client.last_name].filter(Boolean).join(' ') || 'Unnamed client'}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {client.email || 'No email'}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {client.phone_number || 'No phone'}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {client.company || 'No company'}
                      </td>
                      <td className="rounded-r-2xl px-3 py-3 text-muted-foreground">
                        {new Date(client.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
