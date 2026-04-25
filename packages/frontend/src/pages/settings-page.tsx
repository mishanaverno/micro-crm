import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../shared/ui/card';
import { useNetworkStatus } from '../shared/lib/network';
import { useOutboxStats } from '../shared/offline/use-outbox-stats';

const checkpoints = [
  'Persist write intents in IndexedDB instead of keeping them only in memory.',
  'Keep replay logic outside route components so navigation does not interrupt sync.',
  'Treat temporary network failures differently from permanent server-side validation errors.',
];

export function SettingsPage() {
  const stats = useOutboxStats();
  const isOnline = useNetworkStatus();

  return (
    <main className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
      <Card>
        <CardHeader>
          <CardTitle>Offline mode strategy</CardTitle>
          <CardDescription>
            The app shell is ready for a local-first evolution path instead of a network-first UI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-muted-foreground">
            {checkpoints.map((item) => (
              <li key={item} className="rounded-2xl border border-border bg-muted/40 px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current runtime</CardTitle>
          <CardDescription>
            These values reflect the actual network and persistent outbox state in the browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground">
          <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3">
            network_status: {isOnline ? 'online' : 'offline'}
          </div>
          <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3">
            queued_mutations: {stats?.pending_count ?? 0}
          </div>
          <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3">
            failed_mutations: {stats?.failed_count ?? 0}
          </div>
          <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3">
            storage_engine: IndexedDB via Dexie
          </div>
          <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3">
            server_state: TanStack Query
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
