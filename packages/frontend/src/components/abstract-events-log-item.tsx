import { PropsWithChildren, ReactNode } from 'react';
import { EventRecord, EventType } from '../shared/types/event';
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
  LogItemTimestamp,
  LogItemTitle,
} from '../shared/ui/log-item';
import { Button } from '../shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../shared/ui/dropdown-menu';
import { EventTypeIcon } from './event-type-icon';
import { EventTypelabel } from './event-type-label';
import { TaskStatus } from '@/shared/types/task';
import { OrderStatus } from '@/shared/types/order';
import { StatusBadge } from './status-badges';

interface AbstractEventsLogItemProps<TEvent extends EventRecord> {
  event: TEvent;
  clientLabel: string;
  type: EventType;
  compact: boolean;
  title: ReactNode;
  compactTitle?: ReactNode;
  cardBorderClassName?: string;
  badge?: TaskStatus | OrderStatus;
  commonActions: EventsLogAction[];
  specificActions: EventsLogAction[];
}

export function AbstractEventsLogItem<TEvent extends EventRecord>({
  event,
  clientLabel,
  type,
  title,
  compactTitle,
  cardBorderClassName,
  badge,
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
            ? `${cardBorderClassName} border-[3px] transition-[max-width,padding,border-color,box-shadow,background-color] duration-300 ease-out ${compact ? 'inline-block w-fit max-w-[22rem] px-3' : ''}`
            : compact
              ? 'inline-block w-fit max-w-[22rem] px-3 transition-[max-width,padding,box-shadow,background-color] duration-300 ease-out'
              : undefined
        }
      >
        <LogItemHeader
          className={
            compact
              ? '-mx-3 py-1 mb-0 items-center border-b border-border/80 bg-zinc-200 px-3 transition-[gap,padding,margin,background-color,border-color] duration-300 ease-out gap-2'
              : '-mx-4 py-1 mb-0 items-center border-b border-border/80 bg-zinc-200 px-4 transition-[gap,padding,margin,background-color,border-color] duration-300 ease-out'
          }
        >
          <LogItemHeaderMain className={'self-center items-center transition-[gap] duration-300 ease-out'}>
            <EventTypeIcon type={type}/>
            <EventTypelabel type={type}/>
            <span> </span>
            <LogItemTitle>
              {compact ? (compactTitle ? compactTitle : title) : title}
            </LogItemTitle>
            {!compact && badge ? <StatusBadge status={badge} className='ml-1'></StatusBadge> : ''}
          </LogItemHeaderMain>
          <LogItemHeaderActions>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label={`Actions for event ${event.id}`}
                  className={
                    compact
                      ? 'h-5 w-5 rounded-[8px] border border-border/80 bg-background/90 p-0 text-sm font-semibold text-muted-foreground transition-[width,height,font-size,background-color,border-color,box-shadow,color] duration-300 ease-out hover:bg-muted hover:text-foreground'
                      : 'h-5 w-5 rounded-[8px] border border-border/80 bg-background/90 p-0 text-sm font-semibold text-muted-foreground transition-[width,height,font-size,background-color,border-color,box-shadow,color] duration-300 ease-out hover:bg-muted hover:text-foreground'
                  }
                  type="button"
                  variant="secondary"
                >
                  <span aria-hidden="true" className="">
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

        {!compact ? (
          <LogItemBody className="mt-3">
            {children}
          </LogItemBody>
        ) : null}
        {!compact && event.comment ? <LogItemNote>{event.comment}</LogItemNote> : null}
        <LogItemFooter className={`transition-[margin,padding,gap] duration-300 ease-out ${compact ? '' : 'border-t mt-3'}`}>
          <p>{clientLabel}</p>
          <LogItemTimestamp className="transition-[font-size] duration-300 ease-out" dateTime={event.created_at}>
            {new Date(event.created_at).toLocaleString()}
          </LogItemTimestamp>
        </LogItemFooter>
      </LogItemContent>
    </LogItem>
  );
}
