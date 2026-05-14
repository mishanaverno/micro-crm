import { PropsWithChildren } from 'react';
import { EventRecord } from '../shared/types/event';
import { EventsLogAction } from './events-log-actions';
import {
  LogItem,
  LogItemBody,
  LogItemContent,
  LogItemFooter,
  LogItemHeader,
  LogItemHeaderActions,
  LogItemHeaderMain,
  LogItemMarker,
  LogItemNote,
  LogItemMeta,
  LogItemTimestamp,
} from '../shared/ui/log-item';
import { Button } from '../shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../shared/ui/dropdown-menu';

interface AbstractEventsLogItemProps<TEvent extends EventRecord> {
  event: TEvent;
  clientLabel: string;
  typeLabel?: string;
  markerClassName?: string;
  commonActions?: EventsLogAction[];
  specificActions?: EventsLogAction[];
}

export function AbstractEventsLogItem<TEvent extends EventRecord>({
  event,
  clientLabel,
  typeLabel,
  markerClassName,
  commonActions = [],
  specificActions = [],
  children,
}: PropsWithChildren<AbstractEventsLogItemProps<TEvent>>) {
  const actions = [...specificActions, ...commonActions];

  return (
    <LogItem>
      <LogItemMarker className={markerClassName} />
      <LogItemContent>
        <LogItemHeader>
          <LogItemHeaderMain>
            <LogItemMeta>{typeLabel ?? event.type.replace('_', ' ')}</LogItemMeta>
          </LogItemHeaderMain>
          <LogItemHeaderActions>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label={`Actions for event ${event.id}`}
                  className="h-8 w-8 rounded-full p-0"
                  type="button"
                  variant="ghost"
              >
                ...
              </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.length > 0 ? (
                  actions.map((action) => (
                    <DropdownMenuItem
                      className={
                        action.tone === 'destructive'
                          ? 'text-rose-600 focus:bg-rose-50 focus:text-rose-700'
                          : undefined
                      }
                      key={action.id}
                      onSelect={action.onSelect}
                    >
                      {action.icon ? <span className="mr-2 inline-flex">{action.icon}</span> : null}
                      <span>{action.label}</span>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem>to do</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </LogItemHeaderActions>
        </LogItemHeader>

        <LogItemBody>{children}</LogItemBody>
        {event.comment ? <LogItemNote>{event.comment}</LogItemNote> : null}

        <LogItemFooter>
          <p>{clientLabel}</p>
          <LogItemTimestamp dateTime={event.created_at}>
            {new Date(event.created_at).toLocaleString()}
          </LogItemTimestamp>
        </LogItemFooter>
      </LogItemContent>
    </LogItem>
  );
}
