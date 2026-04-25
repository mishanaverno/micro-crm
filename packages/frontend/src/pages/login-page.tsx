import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../features/auth/auth-provider';
import { HttpError } from '../shared/api/http';
import { Button } from '../shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../shared/ui/card';
import { Input } from '../shared/ui/input';
import { Label } from '../shared/ui/label';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTarget = searchParams.get('redirect') || '/';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate(redirectTarget, { replace: true });
    } catch (error) {
      if (error instanceof HttpError) {
        setErrorMessage(error.message || 'Unable to sign in.');
      } else {
        setErrorMessage('Unable to sign in right now. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Auth</p>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Use your CRM account to access the dashboard and offline-safe client workflows.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {errorMessage ? (
              <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </p>
            ) : null}

            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>

            <p className="text-sm text-muted-foreground">
              No account yet?{' '}
              <Link className="font-medium text-primary hover:underline" to="/register">
                Create one
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
