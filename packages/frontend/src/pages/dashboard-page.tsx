import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../shared/ui/card';
import { Button } from '../shared/ui/button';
import { useNetworkStatus } from '../shared/lib/network';
import { useOutboxStats } from '../shared/offline/use-outbox-stats';

const highlights = [
  {
    title: 'Client Hub',
    description: 'Bring contacts, statuses, and next steps together in one local-first view.',
  },
  {
    title: 'Pipeline Signals',
    description: 'Keep your opportunity flow visible even when connectivity is unstable.',
  },
  {
    title: 'Field-Ready Usage',
    description: 'Design choices prioritize resilient navigation and storage-friendly structure.',
  },
];

export function DashboardPage() {
  const isOnline = useNetworkStatus();
  const stats = useOutboxStats();

  return (
    <main className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
      <Card className="overflow-hidden border-none bg-gradient-to-br from-orange-100 via-amber-50 to-white">
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">
            Foundation
          </p>
          <CardTitle className="max-w-2xl text-3xl tracking-[-0.04em] sm:text-4xl">
            Router and UI baseline are ready for an offline-safe CRM shell.
          </CardTitle>
          <CardDescription className="max-w-xl text-base text-slate-600">
            The frontend now includes the base for a durable outbox, so failed writes can be
            remembered locally and replayed after the network comes back.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button>New client</Button>
          <Button variant="secondary">Review pipeline</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Offline-safe notes</CardTitle>
          <CardDescription>
            The app is being shaped around queued writes, not just cached reads.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>`createHashRouter` avoids hard dependency on server rewrites.</p>
          <p>`TanStack Query` manages server-state and invalidation rules.</p>
          <p>`Dexie` stores a persistent IndexedDB outbox for failed write requests.</p>
          <p>
            Runtime now: {isOnline ? 'online' : 'offline'}, queued writes: {stats?.pending_count ?? 0}.
          </p>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-3 lg:col-span-2">
        {highlights.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </main>
  );
}
