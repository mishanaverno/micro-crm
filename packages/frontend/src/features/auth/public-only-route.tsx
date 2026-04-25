import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './auth-provider';

export function PublicOnlyRoute() {
  const { is_authenticated, is_bootstrapping } = useAuth();

  if (is_bootstrapping) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="rounded-3xl border border-border bg-card px-6 py-5 text-sm text-muted-foreground shadow-panel">
          Restoring your session...
        </div>
      </main>
    );
  }

  if (is_authenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
