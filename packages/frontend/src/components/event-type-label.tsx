import { EventType } from '../shared/types/event';

interface EventTypeLabelProps {
  type: EventType;
  className?: string;
}

function labelClassName(className?: string) {
  return `shrink-0 text-sm font-medium text-foreground ${className ?? ''}`.trim();
}

export function EventTypelabel({ type, className }: EventTypeLabelProps) {
  switch (type) {
    case 'client_created':
      return (
        <p className={labelClassName(className)}>Client created</p>
      );
    case 'note':
      return (
       <p className={labelClassName(className)}>Note</p>
      );
    case 'task':
      return (
        <p className={labelClassName(className)}>Task</p>
      );
    case 'reminder':
      return (
        <p className={labelClassName(className)}>Reminder</p>
      );
    case 'order_created':
      return (
        <p className={labelClassName(className)}>Order created</p>
      );
    case 'order_updated':
      return (
        <p className={labelClassName(className)}>Order updated</p>
      );
    case 'order_complete':
      return (
        <p className={labelClassName(className)}>Order complete</p>
      );
    case 'order_reopened':
      return (
        <p className={labelClassName(className)}>Order reopened</p>
      );
    case 'paid':
      return (
        <p className={labelClassName(className)}>Paid</p>
      );
  }
}
