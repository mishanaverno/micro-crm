import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from '../shared/ui/calendar';
import { Button } from '../shared/ui/button';
import { Input } from '../shared/ui/input';
import { Label } from '../shared/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../shared/ui/popover';

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height="16"
      viewBox="0 0 16 16"
      width="16"
    >
      <rect
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        width="12"
        x="2"
        y="3"
      />
      <path
        d="M5 2v3M11 2v3M2 6.5h12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function getReminderDatePart(timestamp: string) {
  return timestamp.split('T')[0] ?? '';
}

export function toReminderLocalTimestamp(timestamp: string | undefined) {
  if (!timestamp) {
    return '';
  }

  const date = new Date(timestamp);
  const timezoneOffsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
}

function getReminderTimePart(timestamp: string) {
  return timestamp.split('T')[1] ?? '';
}

function mergeReminderDateAndTime(nextDate: string, nextTime: string) {
  if (!nextDate && !nextTime) {
    return '';
  }

  if (!nextDate) {
    return '';
  }

  return `${nextDate}T${nextTime || '09:00'}`;
}

function formatReminderTimeInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export function isValidReminderTimeValue(value: string) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

export function isReminderTimestampReady(timestamp: string) {
  const datePart = getReminderDatePart(timestamp);
  const timePart = getReminderTimePart(timestamp);

  return Boolean(datePart) && isValidReminderTimeValue(timePart);
}

export function toReminderApiTimestamp(timestamp: string) {
  return new Date(timestamp).toISOString();
}

function formatDateLabel(timestamp: string) {
  const datePart = getReminderDatePart(timestamp);

  if (!datePart) {
    return 'Pick a date';
  }

  const [year, month, day] = datePart.split('-').map(Number);
  return format(new Date(year, (month ?? 1) - 1, day ?? 1), 'PPP');
}

function getSelectedDate(timestamp: string) {
  const datePart = getReminderDatePart(timestamp);

  if (!datePart) {
    return undefined;
  }

  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

interface ReminderTimestampFieldProps {
  idPrefix?: string;
  label?: string;
  required?: boolean;
  timestamp: string;
  onChange: (timestamp: string) => void;
}

export function ReminderTimestampField({
  idPrefix = 'timestamp',
  label = 'Timestamp',
  required = false,
  timestamp,
  onChange,
}: ReminderTimestampFieldProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const timeInput = getReminderTimePart(timestamp) || '09:00';

  return (
    <div className="grid gap-2">
      <Label htmlFor={`${idPrefix}-date`}>{label}</Label>
      <div className="grid items-center gap-3 sm:grid-cols-[minmax(0,1fr)_150px]">
        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              className="h-11 w-full justify-start rounded-2xl px-4 text-left font-normal shadow-sm"
              data-empty={!timestamp}
              id={`${idPrefix}-date`}
              type="button"
              variant="outline"
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              {timestamp ? (
                formatDateLabel(timestamp)
              ) : (
                <span className="text-muted-foreground">Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto overflow-hidden rounded-2xl p-0">
            <Calendar
              mode="single"
              selected={getSelectedDate(timestamp)}
              onSelect={(date) => {
                if (!date) {
                  return;
                }

                const nextDate = format(date, 'yyyy-MM-dd');
                onChange(mergeReminderDateAndTime(nextDate, timeInput));
                setIsDatePickerOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
        <Input
          id={`${idPrefix}-time`}
          aria-invalid={timeInput.length > 0 && !isValidReminderTimeValue(timeInput)}
          inputMode="numeric"
          maxLength={5}
          placeholder="09:00"
          required={required}
          type="text"
          value={timeInput}
          onChange={(event) => {
            const nextTime = formatReminderTimeInput(event.target.value);
            onChange(mergeReminderDateAndTime(getReminderDatePart(timestamp), nextTime));
          }}
        />
      </div>
    </div>
  );
}
