import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './auth-provider';

export function ProtectedRoute() {
  const { is_authenticated, is_bootstrapping } = useAuth();
  const location = useLocation();

  if (is_bootstrapping) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="rounded-3xl border border-border bg-card px-6 py-5 text-sm text-muted-foreground shadow-panel">
          Restoring your session...
        </div>
      </main>
    );
  }

  if (!is_authenticated) {
    const redirectTo = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirectTo)}`} replace />;
  }

  return <Outlet />;
}
