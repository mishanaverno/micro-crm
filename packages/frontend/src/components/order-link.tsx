import { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface OrderLinkProps {
  orderId: string | number;
  className?: string;
  title?: string | null;
}

function truncateLabel(label: string, maxLength = 20) {
  if (label.length <= maxLength) {
    return label;
  }

  return `${label.slice(0, maxLength)}...`;
}

export function OrderLink({
  orderId,
  className,
  title,
  children,
}: PropsWithChildren<OrderLinkProps>) {
  const rawLabel = children ?? title;
  const label =
    typeof rawLabel === 'string' ? truncateLabel(rawLabel) : rawLabel;

  return (
    <Link
      className={cn(
        'group inline-flex items-center gap-1 rounded-sm border border-border underline-offset-4 transition-colors hover:border-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className,
      )}
      to={`/orders/${orderId}`}
    >
      <span className="pointer-events-none inline-flex min-w-7 items-center justify-center rounded-full border border-border bg-muted px-2 py-1.5 text-[11px] font-medium leading-none text-muted-foreground transition-colors group-hover:border-black group-hover:bg-black group-hover:text-white">
        #{orderId}
      </span>
      {label ? (
        <span className="pointer-events-none mr-2 whitespace-nowrap text-foreground">
          {label}
        </span>
      ) : null}
    </Link>
  );
}
