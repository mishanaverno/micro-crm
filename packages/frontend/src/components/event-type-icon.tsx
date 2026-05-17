import { EventType } from '../shared/types/event';

interface EventTypeIconProps {
  type: EventType;
  className?: string;
}

function iconClassName(className?: string) {
  return `h-4 w-4 shrink-0 mr-1 ${className ?? ''}`.trim();
}

export function EventTypeIcon({ type, className }: EventTypeIconProps) {
  switch (type) {
    case 'client_created':
      return (
        <svg
          aria-hidden="true"
          className={iconClassName(className)}
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 13.5c2.9 0 5.25-2.35 5.25-5.25S14.9 3 12 3 6.75 5.35 6.75 8.25 9.1 13.5 12 13.5Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
          <path
            d="M4.5 20.25c1.57-3.13 4.19-4.75 7.5-4.75s5.93 1.62 7.5 4.75"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
          <path
            d="M18.75 4.5v4.5M16.5 6.75H21"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.7"
          />
        </svg>
      );
    case 'note':
      return (
        <svg
          aria-hidden="true"
          className={iconClassName(className)}
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M7.5 3.75h6.88a2.25 2.25 0 0 1 1.6.66l3.61 3.61a2.25 2.25 0 0 1 .66 1.59V18A2.25 2.25 0 0 1 18 20.25H7.5A2.25 2.25 0 0 1 5.25 18V6A2.25 2.25 0 0 1 7.5 3.75Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
          <path
            d="M14.25 3.75V8.25H18.75"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
          <path
            d="M8.25 12h7.5M8.25 15.75h5.25"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.7"
          />
        </svg>
      );
    case 'task':
      return (
        <svg
          aria-hidden="true"
          className={iconClassName(className)}
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M9 12.75 11.25 15l3.75-5.25"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
          <path
            d="M7.5 4.5h9A2.25 2.25 0 0 1 18.75 6.75v10.5A2.25 2.25 0 0 1 16.5 19.5h-9a2.25 2.25 0 0 1-2.25-2.25V6.75A2.25 2.25 0 0 1 7.5 4.5Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        </svg>
      );
    case 'reminder':
      return (
        <svg
          aria-hidden="true"
          className={iconClassName(className)}
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 6v6l3 2.25"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
          <path
            d="M18 18.75H6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.7"
          />
          <path
            d="M19.5 11.25a7.5 7.5 0 1 0-15 0c0 2.08-.6 3.63-1.5 5.25h18c-.9-1.62-1.5-3.17-1.5-5.25Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        </svg>
      );
    case 'order_created':
      return (
        <svg
          aria-hidden="true"
          className={iconClassName(className)}
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 3.75 4.5 7.5 12 11.25 19.5 7.5 12 3.75Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
          <path
            d="M4.5 7.5v9L12 20.25l7.5-3.75v-9M12 11.25v9"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        </svg>
      );
    case 'order_updated':
      return (
        <svg
          aria-hidden="true"
          className={iconClassName(className)}
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M5.25 16.5v2.25h2.25L17.78 8.47 15.53 6.22 5.25 16.5Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
          <path
            d="m14.47 7.28 2.25 2.25M9 20.25h9.75"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        </svg>
      );
    case 'order_complete':
      return (
        <svg
          aria-hidden="true"
          className={iconClassName(className)}
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M21 12a9 9 0 1 1-4.06-7.56"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
          <path
            d="m9.75 12.75 1.75 1.75L19.5 6.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        </svg>
      );
    case 'order_reopened':
      return (
        <svg
          aria-hidden="true"
          className={iconClassName(className)}
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M7.5 7.5H3.75v3.75"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
          <path
            d="M4.07 10.32A8.25 8.25 0 1 0 6.84 6.4L3.75 9.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        </svg>
      );
    case 'paid':
      return (
        <svg
          aria-hidden="true"
          className={iconClassName(className)}
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M4.5 6.75A2.25 2.25 0 0 1 6.75 4.5h10.5A2.25 2.25 0 0 1 19.5 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 17.25V6.75Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
          <path
            d="M19.5 8.25h-4.12a1.88 1.88 0 1 0 0 3.75H19.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
          <circle cx="15.75" cy="10.125" fill="currentColor" r="0.8" />
        </svg>
      );
  }
}
