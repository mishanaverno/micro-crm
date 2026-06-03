import { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { ClientAvatar } from './client-avatar';

interface ClientLinkProps {
  clientId: string;
  className?: string;
  name?: string | null;
}

export function ClientLink({
  clientId,
  className,
  name,
  children,
}: PropsWithChildren<ClientLinkProps>) {
  return (
    <Link
      className={cn(
        'inline-flex items-center gap-1 rounded-sm text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className,
      )}
      to={`/clients/${clientId}`}
    >
      <span className="pointer-events-none">
        <ClientAvatar className="h-7 w-7 text-[11px]" name={name} />
      </span>
      <span>{children}</span>
    </Link>
  );
}
