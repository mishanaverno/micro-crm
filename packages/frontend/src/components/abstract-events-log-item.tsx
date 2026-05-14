import { PropsWithChildren, ReactNode } from 'react';
import { EventRecord } from '../shared/types/event';
import {
  LogItem,
  LogItemBody,
  LogItemContent,
  LogItemFooter,
  LogItemHeader,
  LogItemHeaderActions,
  LogItemHeaderMain,
  LogItemMarker,
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
  actions?: ReactNode;
}

export function AbstractEventsLogItem<TEvent extends EventRecord>({
  event,
  clientLabel,
  typeLabel,
  markerClassName,
  actions,
  children,
}: PropsWithChildren<AbstractEventsLogItemProps<TEvent>>) {
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
                {actions ?? <DropdownMenuItem>to do</DropdownMenuItem>}
              </DropdownMenuContent>
            </DropdownMenu>
          </LogItemHeaderActions>
        </LogItemHeader>

        <LogItemBody>{children}</LogItemBody>

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
