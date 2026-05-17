import { Badge } from '../shared/ui/badge';
import { OrderStatus } from '../shared/types/order';
import { TaskStatus } from '../shared/types/task';

interface StatusBadgeProps {
  className?: string;
}
function StatusLabel({ status }: { status: OrderStatus | TaskStatus }) {
  switch (status) {
    default:
      return (
        status.trim()
      )
  }
}

export function StatusBadge({
  status,
  className,
}: { status: OrderStatus | TaskStatus } & StatusBadgeProps) {
  switch (status) {
    case 'done':
    case 'complete':
      return (
        <Badge
          className={['border-transparent bg-emerald-100 text-emerald-700', className]
            .filter(Boolean)
            .join(' ')}
          variant="secondary"
        >
          <StatusLabel status={status}/>
        </Badge>
      );
    case 'inprogress':
    case 'pending':
      return (
        <Badge className={className} variant="outline">
          <StatusLabel status={status}/>
        </Badge>
      );
    case 'created':
    case 'reopened':
    default:
      return (
        <Badge
          className={['border-transparent bg-foreground text-background', className]
            .filter(Boolean)
            .join(' ')}
          variant="secondary"
        >
          <StatusLabel status={status}/>
        </Badge>
      );
      
  }
}
