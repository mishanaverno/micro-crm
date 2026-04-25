import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useAuth } from '../features/auth/auth-provider';
import { useNetworkStatus } from '../shared/lib/network';
import { useOutboxStats } from '../shared/offline/use-outbox-stats';

export function AppLayout() {
  const isOnline = useNetworkStatus();
  const stats = useOutboxStats();
  const { user } = useAuth();

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset className="bg-background text-foreground">
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-8 overflow-hidden rounded-[28px] border border-border/70 bg-card/80 p-5 shadow-panel backdrop-blur">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 flex items-center gap-3">
                  <SidebarTrigger />
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">
                    Project CRM
                  </p>
                </div>
                <h1 className="text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
                  Offline-safe SPA for day-to-day CRM workflows.
                </h1>
                <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
                  Routing uses hash navigation so the app remains deployable on static hosting and
                  keeps opening correctly even without server-side rewrite rules.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
                  <span
                    className={[
                      'rounded-full px-3 py-1',
                      isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900',
                    ].join(' ')}
                  >
                    {isOnline ? 'network: online' : 'network: offline'}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                    outbox: {stats?.pending_count ?? 0}
                  </span>
                  <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700">
                    failed: {stats?.failed_count ?? 0}
                  </span>
                  {user ? (
                    <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-800">
                      signed in as: {user.email}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </header>

          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
