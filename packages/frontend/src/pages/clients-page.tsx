import { FormEvent, useState } from 'react';
import { useCreateClient } from '../features/clients/use-create-client';
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

const clients = [
  { name: 'Northwind Labs', status: 'active', owner: 'AM', next_touch: '2026-04-28' },
  { name: 'Bright Harbor', status: 'proposal', owner: 'MO', next_touch: '2026-04-29' },
  { name: 'Maple Works', status: 'discovery', owner: 'EK', next_touch: '2026-05-02' },
];

export function ClientsPage() {
  const [form, setForm] = useState(initialFormState);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const createClient = useCreateClient();
  const offlineClients = useOfflineClients();
  const isOnline = useNetworkStatus();

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
    <main className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <CardTitle>Create client</CardTitle>
              <CardDescription>
                If the server or network is unavailable, the mutation is stored in IndexedDB and
                retried after reconnection.
              </CardDescription>
            </div>

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
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Use the modal to create a client with accessible keyboard and focus handling.</p>
          <p>
            Current network mode: {isOnline ? 'online' : 'offline'}. Offline submissions are added
            to the outbox automatically.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Offline outbox preview</CardTitle>
            <CardDescription>
              Local records remain visible before the backend confirms them.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {offlineClients && offlineClients.length > 0 ? (
              offlineClients.map((client) => (
                <div
                  key={client.id}
                  className="rounded-2xl border border-border bg-muted/30 px-4 py-3 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong>
                      {client.first_name} {client.last_name}
                    </strong>
                    <span
                      className={[
                        'rounded-full px-2 py-1 text-xs font-medium',
                        client.sync_status === 'synced'
                          ? 'bg-emerald-100 text-emerald-800'
                          : client.sync_status === 'failed'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-900',
                      ].join(' ')}
                    >
                      {client.sync_status}
                    </span>
                  </div>
                  <p className="mt-2 text-muted-foreground">{client.email}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No locally tracked client writes yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Example list</CardTitle>
            <CardDescription>
              Static placeholder for the future backend-backed client directory.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Client</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Owner</th>
                  <th className="px-3 py-2 font-medium">Next touch</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.name} className="rounded-2xl bg-muted/60">
                    <td className="rounded-l-2xl px-3 py-3 font-medium text-foreground">
                      {client.name}
                    </td>
                    <td className="px-3 py-3 uppercase tracking-wide text-muted-foreground">
                      {client.status}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{client.owner}</td>
                    <td className="rounded-r-2xl px-3 py-3 text-muted-foreground">
                      {client.next_touch}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
