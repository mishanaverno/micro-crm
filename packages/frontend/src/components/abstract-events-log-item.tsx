import { PropsWithChildren, ReactNode } from 'react';
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
  icon?: ReactNode;
  markerClassName?: string;
  cardBorderClassName?: string;
  compact?: boolean;
  commonActions?: EventsLogAction[];
  specificActions?: EventsLogAction[];
}

export function AbstractEventsLogItem<TEvent extends EventRecord>({
  event,
  clientLabel,
  typeLabel,
  icon,
  markerClassName: _markerClassName,
  cardBorderClassName,
  compact = false,
  commonActions = [],
  specificActions = [],
  children,
}: PropsWithChildren<AbstractEventsLogItemProps<TEvent>>) {
  const actions = [...specificActions, ...commonActions];

  return (
    <LogItem>
      <LogItemContent
        className={
          cardBorderClassName
            ? `${cardBorderClassName} border-[3px] transition-[max-width,padding,border-color,box-shadow,background-color] duration-300 ease-out ${compact ? 'inline-block w-fit max-w-[22rem] px-3 py-2' : ''}`
            : compact
              ? 'inline-block w-fit max-w-[22rem] px-3 py-2 transition-[max-width,padding,box-shadow,background-color] duration-300 ease-out'
              : undefined
        }
      >
        <LogItemHeader
          className={
            compact
              ? '-mx-3 -mt-2 mb-0 items-center border-b border-border/70 bg-muted/70 px-3 py-2 transition-[gap,padding,margin,background-color,border-color] duration-300 ease-out gap-2'
              : '-mx-4 -mt-4 mb-0 items-center border-b border-border/70 bg-muted/70 px-4 py-3 transition-[gap,padding,margin,background-color,border-color] duration-300 ease-out'
          }
        >
          <LogItemHeaderMain className={compact ? 'gap-1 self-center transition-[gap] duration-300 ease-out' : 'self-center transition-[gap] duration-300 ease-out'}>
            <LogItemMeta className={compact ? 'flex items-center gap-1.5 leading-none text-[10px] tracking-[0.2em] transition-[font-size,letter-spacing] duration-300 ease-out' : 'flex items-center gap-2 leading-none transition-[font-size,letter-spacing] duration-300 ease-out'}>
              {icon ? (
                <span className={compact ? 'text-muted-foreground/90' : 'text-muted-foreground/90'}>
                  {icon}
                </span>
              ) : null}
              {typeLabel ?? event.type.replace('_', ' ')}
            </LogItemMeta>
          </LogItemHeaderMain>
          <LogItemHeaderActions>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label={`Actions for event ${event.id}`}
                  className={
                    compact
                      ? 'h-7 w-7 rounded-full border border-border/80 bg-background/90 p-0 text-sm font-semibold text-muted-foreground shadow-sm transition-[width,height,font-size,background-color,border-color,box-shadow,color] duration-300 ease-out hover:bg-muted hover:text-foreground'
                      : 'h-8 w-8 rounded-full border border-border/80 bg-background/90 p-0 text-base font-semibold text-muted-foreground shadow-sm transition-[width,height,font-size,background-color,border-color,box-shadow,color] duration-300 ease-out hover:bg-muted hover:text-foreground'
                  }
                  type="button"
                  variant="secondary"
              >
                <span aria-hidden="true" className="-mt-0.5">
                  ⋯
                </span>
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

        {!compact ? <LogItemBody className="mt-3">{children}</LogItemBody> : null}
        {!compact && event.comment ? <LogItemNote>{event.comment}</LogItemNote> : null}

        {compact ? (
          <LogItemFooter className="mt-2 gap-1 pt-2 text-[10px] transition-[margin,padding,gap] duration-300 ease-out">
            <LogItemTimestamp className="text-[11px] transition-[font-size] duration-300 ease-out" dateTime={event.created_at}>
              {new Date(event.created_at).toLocaleString()}
            </LogItemTimestamp>
          </LogItemFooter>
        ) : (
          <LogItemFooter className="transition-[margin,padding,gap] duration-300 ease-out">
            <p>{clientLabel}</p>
            <LogItemTimestamp className="transition-[font-size] duration-300 ease-out" dateTime={event.created_at}>
              {new Date(event.created_at).toLocaleString()}
            </LogItemTimestamp>
          </LogItemFooter>
        )}
      </LogItemContent>
    </LogItem>
  );
}
