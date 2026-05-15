import { Badge } from '../shared/ui/badge';
import { OrderStatus } from '../shared/types/order';
import { TaskStatus } from '../shared/types/task';

interface StatusBadgeProps {
  className?: string;
}

export function OrderStatusBadge({
  status,
  className,
}: { status: OrderStatus } & StatusBadgeProps) {
  switch (status) {
    case 'done':
      return (
        <Badge
          className={['border-transparent bg-emerald-100 text-emerald-700', className]
            .filter(Boolean)
            .join(' ')}
          variant="secondary"
        >
          Done
        </Badge>
      );
    case 'inprogress':
      return <Badge className={className} variant="outline">In progress</Badge>;
    case 'created':
    default:
      return (
        <Badge
          className={['border-transparent bg-foreground text-background', className]
            .filter(Boolean)
            .join(' ')}
          variant="secondary"
        >
          Created
        </Badge>
      );
  }
}

export function TaskStatusBadge({
  status,
  className,
}: { status: TaskStatus } & StatusBadgeProps) {
  return status === 'complete' ? (
    <Badge
      className={['border-transparent bg-emerald-100 text-emerald-700', className]
        .filter(Boolean)
        .join(' ')}
      variant="secondary"
    >
      Complete
    </Badge>
  ) : (
    <Badge className={className} variant="outline">Pending</Badge>
  );
}
