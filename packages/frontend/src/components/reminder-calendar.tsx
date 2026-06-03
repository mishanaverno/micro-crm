import { useMemo } from 'react';
import type { DayButtonProps } from 'react-day-picker';
import { Calendar } from '../shared/ui/calendar';
import { t } from '../shared/lib/i18n';
import { TaskRecord } from '../shared/types/task';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../shared/ui/tooltip';
import { ReminderRecord } from '../shared/types/reminder';
import { cn } from '../lib/utils';

function toDateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function toReminderDate(reminder: ReminderRecord) {
  const date = new Date(reminder.timestamp);

  return Number.isNaN(date.getTime()) ? null : date;
}

type CalendarItem =
  | {
      id: string;
      kind: 'reminder';
      content: string;
      timestamp: string;
    }
  | {
      id: string;
      kind: 'task';
      content: string;
      timestamp: string;
    };

function toTaskDeadline(task: TaskRecord) {
  if (!task.deadline) {
    return null;
  }

  const date = new Date(task.deadline);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatCalendarItemTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ReminderTooltipContent({ items }: { items: CalendarItem[] }) {
  return (
    <div className="grid max-w-72 gap-2">
      {items.map((item) => {
        const time = formatCalendarItemTime(item.timestamp);
        const typeLabel = item.kind === 'reminder' ? t('entity.reminder') : t('entity.task');

        return (
          <div
            className="grid gap-1 border-b border-primary-foreground/10 pb-2 last:border-b-0 last:pb-0"
            key={`${item.kind}-${item.id}`}
          >
            <div className="grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1">
              <span className="inline-flex w-fit rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/90">
                {typeLabel}
              </span>
              {time ? (
                <span className="justify-self-end text-xs font-medium text-white/70">
                  {time}
                </span>
              ) : null}
            </div>
            <p className="text-sm leading-5 text-white">{item.content}</p>
          </div>
        );
      })}
    </div>
  );
}

export function ReminderCalendar({
  reminders,
  tasks = [],
}: {
  reminders: ReminderRecord[];
  tasks?: TaskRecord[];
}) {
  const itemsByDate = useMemo(() => {
    const result = new Map<string, CalendarItem[]>();

    reminders.forEach((reminder) => {
      const date = toReminderDate(reminder);

      if (!date) {
        return;
      }

      const dateKey = toDateKey(date);
      const dateItems = result.get(dateKey) ?? [];

      result.set(dateKey, [
        ...dateItems,
        {
          id: reminder.id,
          kind: 'reminder',
          content: reminder.content,
          timestamp: reminder.timestamp,
        },
      ]);
    });

    tasks.forEach((task) => {
      const date = toTaskDeadline(task);

      if (!date) {
        return;
      }

      const dateKey = toDateKey(date);
      const dateItems = result.get(dateKey) ?? [];

      result.set(dateKey, [
        ...dateItems,
        {
          id: task.id,
          kind: 'task',
          content: task.content,
          timestamp: task.deadline ?? '',
        },
      ]);
    });

    return result;
  }, [reminders, tasks]);
  const markedDates = useMemo(
    () =>
      [...reminders.map(toReminderDate), ...tasks.map(toTaskDeadline)]
        .filter((date): date is Date => Boolean(date)),
    [reminders, tasks],
  );
  const defaultMonth = markedDates[0] ?? new Date();

  function ReminderDayButton({
    children,
    className,
    day,
    modifiers,
    ...buttonProps
  }: DayButtonProps) {
    const dayItems = itemsByDate.get(toDateKey(day.date));
    const button = (
      <button
        className={cn(
          className,
          dayItems
            ? 'relative z-0 font-semibold after:absolute after:left-1/2 after:top-1/2 after:-z-10 after:h-7 after:w-7 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-black'
            : undefined,
        )}
        {...buttonProps}
        aria-current={modifiers.today ? 'date' : buttonProps['aria-current']}
      >
        {children}
      </button>
    );

    if (!dayItems?.length) {
      return button;
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent align="center" className="border-black bg-black px-3 py-1.5 text-white">
          <ReminderTooltipContent items={dayItems} />
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <Calendar
        className=""
        components={{ DayButton: ReminderDayButton }}
        defaultMonth={defaultMonth}
        modifiers={{ reminder: markedDates }}
        modifiersClassNames={{
          reminder: '[&>button]:text-white',
        }}
        mode="single"
      />
    </TooltipProvider>
  );
}
