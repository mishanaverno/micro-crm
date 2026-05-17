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
        <span className={labelClassName(className)}>Client created</span>
      );
    case 'note':
      return (
       <span className={labelClassName(className)}>Note</span>
      );
    case 'task':
      return (
        <span className={labelClassName(className)}>Task</span>
      );
    case 'reminder':
      return (
        <span className={labelClassName(className)}>Reminder</span>
      );
    case 'order_created':
      return (
        <span className={labelClassName(className)}>Order created</span>
      );
    case 'order_updated':
      return (
        <span className={labelClassName(className)}>Order updated</span>
      );
    case 'order_complete':
      return (
        <span className={labelClassName(className)}>Order complete</span>
      );
    case 'order_reopened':
      return (
        <span className={labelClassName(className)}>Order reopened</span>
      );
    case 'paid':
      return (
        <span className={labelClassName(className)}>Paid</span>
      );
  }
}
