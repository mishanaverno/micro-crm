import { useMemo } from 'react';
import type { DayButtonProps } from 'react-day-picker';
import { Calendar } from '../shared/ui/calendar';
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

function formatReminderTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ReminderTooltipContent({ reminders }: { reminders: ReminderRecord[] }) {
  return (
    <div className="grid max-w-64 gap-1.5">
      {reminders.map((reminder) => {
        const time = formatReminderTime(reminder.timestamp);

        return (
          <div className="grid gap-0.5" key={reminder.id}>
            {time ? (
              <span className="text-xs font-semibold text-primary-foreground/80">
                {time}
              </span>
            ) : null}
            <span>{reminder.content}</span>
          </div>
        );
      })}
    </div>
  );
}

export function ReminderCalendar({ reminders }: { reminders: ReminderRecord[] }) {
  const remindersByDate = useMemo(() => {
    const result = new Map<string, ReminderRecord[]>();

    reminders.forEach((reminder) => {
      const date = toReminderDate(reminder);

      if (!date) {
        return;
      }

      const dateKey = toDateKey(date);
      const dateReminders = result.get(dateKey) ?? [];

      result.set(dateKey, [...dateReminders, reminder]);
    });

    return result;
  }, [reminders]);
  const reminderDates = useMemo(
    () =>
      reminders
        .map(toReminderDate)
        .filter((date): date is Date => Boolean(date)),
    [reminders],
  );
  const defaultMonth = reminderDates[0] ?? new Date();

  function ReminderDayButton({
    children,
    className,
    day,
    modifiers,
    ...buttonProps
  }: DayButtonProps) {
    const dayReminders = remindersByDate.get(toDateKey(day.date));
    const button = (
      <button
        className={cn(
          className,
          dayReminders
            ? 'relative z-0 font-semibold after:absolute after:left-1/2 after:top-1/2 after:-z-10 after:h-7 after:w-7 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-amber-100 hover:after:bg-amber-200'
            : undefined,
        )}
        {...buttonProps}
        aria-current={modifiers.today ? 'date' : buttonProps['aria-current']}
      >
        {children}
      </button>
    );

    if (!dayReminders?.length) {
      return button;
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent align="center" className="px-3 py-1.5">
          <ReminderTooltipContent reminders={dayReminders} />
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <Calendar
        className="rounded-md border border-border bg-background"
        components={{ DayButton: ReminderDayButton }}
        defaultMonth={defaultMonth}
        modifiers={{ reminder: reminderDates }}
        modifiersClassNames={{
          reminder: '[&>button]:text-amber-900',
        }}
        mode="single"
      />
    </TooltipProvider>
  );
}
