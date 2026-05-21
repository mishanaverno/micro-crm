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
    case 'client_updated':
      return (
        <span className={labelClassName(className)}>Client updated</span>
      );
    case 'client_deleted':
      return (
        <span className={labelClassName(className)}>Client deleted</span>
      );
    case 'note_created':
      return (
       <span className={labelClassName(className)}>Note created</span>
      );
    case 'note_updated':
      return (
       <span className={labelClassName(className)}>Note updated</span>
      );
    case 'note_deleted':
      return (
       <span className={labelClassName(className)}>Note deleted</span>
      );
    case 'task_created':
      return (
        <span className={labelClassName(className)}>Task created</span>
      );
    case 'task_updated':
      return (
        <span className={labelClassName(className)}>Task updated</span>
      );
    case 'task_deleted':
      return (
        <span className={labelClassName(className)}>Task deleted</span>
      );
    case 'reminder_created':
      return (
        <span className={labelClassName(className)}>Reminder created</span>
      );
    case 'reminder_updated':
      return (
        <span className={labelClassName(className)}>Reminder updated</span>
      );
    case 'reminder_deleted':
      return (
        <span className={labelClassName(className)}>Reminder deleted</span>
      );
    case 'order_created':
      return (
        <span className={labelClassName(className)}>Order created</span>
      );
    case 'order_updated':
      return (
        <span className={labelClassName(className)}>Order updated</span>
      );
    case 'order_deleted':
      return (
        <span className={labelClassName(className)}>Order deleted</span>
      );
    case 'order_complete':
      return (
        <span className={labelClassName(className)}>Order complete</span>
      );
    case 'order_reopened':
      return (
        <span className={labelClassName(className)}>Order reopened</span>
      );
    case 'paid_created':
      return (
        <span className={labelClassName(className)}>Paid created</span>
      );
    case 'paid_updated':
      return (
        <span className={labelClassName(className)}>Paid updated</span>
      );
    case 'paid_deleted':
      return (
        <span className={labelClassName(className)}>Paid deleted</span>
      );
  }
}
