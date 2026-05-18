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

export function getReminderDatePart(value: string) {
  return value.split('T')[0] ?? '';
}

export function toReminderLocalDateTime(value: string | undefined) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  const timezoneOffsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
}

function getReminderTimePart(value: string) {
  return value.split('T')[1] ?? '';
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

export function isReminderDateTimeReady(value: string) {
  const datePart = getReminderDatePart(value);
  const timePart = getReminderTimePart(value);

  return Boolean(datePart) && isValidReminderTimeValue(timePart);
}

export function toReminderApiDateTime(value: string) {
  return new Date(value).toISOString();
}

function formatDateLabel(value: string) {
  const datePart = getReminderDatePart(value);

  if (!datePart) {
    return 'Pick a date';
  }

  const [year, month, day] = datePart.split('-').map(Number);
  return format(new Date(year, (month ?? 1) - 1, day ?? 1), 'PPP');
}

function getSelectedDate(value: string) {
  const datePart = getReminderDatePart(value);

  if (!datePart) {
    return undefined;
  }

  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

interface ReminderDateTimeFieldProps {
  idPrefix?: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export function ReminderDateTimeField({
  idPrefix = 'date-time',
  label,
  required = false,
  placeholder = 'Pick a date',
  value,
  onChange,
}: ReminderDateTimeFieldProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const timeInput = getReminderTimePart(value) || '09:00';

  return (
    <div className="grid gap-2">
      <Label htmlFor={`${idPrefix}-date`}>{label}</Label>
      <div className="grid items-center gap-3 sm:grid-cols-[minmax(0,1fr)_150px]">
        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              className="h-11 w-full justify-start rounded-2xl px-4 text-left font-normal shadow-sm"
              data-empty={!value}
              id={`${idPrefix}-date`}
              type="button"
              variant="outline"
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              {value ? (
                formatDateLabel(value)
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto overflow-hidden rounded-2xl p-0">
            <Calendar
              mode="single"
              selected={getSelectedDate(value)}
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
            onChange(mergeReminderDateAndTime(getReminderDatePart(value), nextTime));
          }}
        />
      </div>
    </div>
  );
}
