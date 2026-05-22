import { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface ClientLinkProps {
  clientId: string;
  className?: string;
}

export function ClientLink({
  clientId,
  className,
  children,
}: PropsWithChildren<ClientLinkProps>) {
  return (
    <Link
      className={cn(
        'rounded-sm text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className,
      )}
      to={`/clients/${clientId}`}
    >
      {children}
    </Link>
  );
}
