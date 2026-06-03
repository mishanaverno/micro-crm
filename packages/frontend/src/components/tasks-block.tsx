import { t } from '../shared/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/ui/card';
import { TaskRecord } from '../shared/types/task';
import { cn } from '../lib/utils';

function formatDateOnly(value?: string | null) {
  return value ? new Date(value).toLocaleDateString() : '—';
}

function formatDuration(milliseconds: number) {
  const absMilliseconds = Math.abs(milliseconds);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (absMilliseconds < hour) {
    const minutes = Math.max(1, Math.round(absMilliseconds / minute));
    return `${minutes} мин.`;
  }

  if (absMilliseconds < day) {
    const hours = Math.max(1, Math.round(absMilliseconds / hour));
    return `${hours} ч.`;
  }

  const days = Math.max(1, Math.round(absMilliseconds / day));
  return `${days} дн.`;
}

function getEndOfCurrentWeek(now = new Date()) {
  const endOfWeek = new Date(now);
  const day = endOfWeek.getDay();
  const daysUntilSunday = day === 0 ? 0 : 7 - day;

  endOfWeek.setDate(endOfWeek.getDate() + daysUntilSunday);
  endOfWeek.setHours(23, 59, 59, 999);

  return endOfWeek;
}

function getDeadlineState(deadline: string) {
  const deadlineDate = new Date(deadline);
  const now = new Date();

  if (Number.isNaN(deadlineDate.getTime())) {
    return 'default';
  }

  if (deadlineDate.getTime() < now.getTime()) {
    return 'overdue';
  }

  if (deadlineDate.getTime() <= getEndOfCurrentWeek(now).getTime()) {
    return 'this-week';
  }

  return 'default';
}

function getDeadlineTooltip(deadline: string) {
  const deadlineDate = new Date(deadline);

  if (Number.isNaN(deadlineDate.getTime())) {
    return '';
  }

  const difference = deadlineDate.getTime() - Date.now();
  const duration = formatDuration(difference);

  return difference < 0
    ? t('common.deadlineOverdueBy', undefined, { duration })
    : t('common.deadlineRemaining', undefined, { duration });
}

function getDeadlineBadgeClassName(deadline: string) {
  switch (getDeadlineState(deadline)) {
    case 'overdue':
      return 'border-transparent bg-rose-700 text-rose-100';
    case 'this-week':
      return 'border-transparent bg-amber-800 text-amber-100';
    default:
      return '';
  }
}

export function TasksBlock({
  emptyText,
  errorText,
  isError,
  isLoading,
  isUpdating,
  onToggleTaskStatus,
  tasks,
}: {
  emptyText: string;
  errorText: string;
  isError: boolean;
  isLoading: boolean;
  isUpdating: boolean;
  onToggleTaskStatus: (task: TaskRecord) => void;
  tasks: TaskRecord[];
}) {
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-lg">{t('page.tasks')}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : isError ? (
          <p className="text-sm text-rose-700">{errorText}</p>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          <ul className="grid gap-2 rounded-[8px] border px-3 py-2">
            {tasks.map((task) => (
              <li className="grid gap-2 border-b py-2 text-sm last:border-b-0" key={task.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs">
                    {t('common.createdFromDate', undefined, {
                      date: formatDateOnly(task.created_at),
                    })}
                  </p>
                  {task.deadline ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{t('common.completeBeforeLabel')}</span>
                      <span
                        className={cn(
                          'inline-flex rounded-full border px-2.5 py-1 text-xs font-medium',
                          getDeadlineBadgeClassName(task.deadline),
                        )}
                        title={getDeadlineTooltip(task.deadline)}
                      >
                        {formatDateOnly(task.deadline)}
                      </span>
                    </div>
                  ) : null}
                </div>
                <div className="flex items-start gap-3">
                  <button
                    aria-label={task.content}
                    aria-checked={task.status === 'complete'}
                    aria-pressed={task.status === 'complete'}
                    className={[
                      'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[3px] border-2 transition-colors',
                      task.status === 'complete'
                        ? 'border-emerald-500 bg-emerald-950 text-emerald-300'
                        : 'border-black/60 text-transparent',
                      isUpdating ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                    ].join(' ')}
                    disabled={isUpdating}
                    role="checkbox"
                    type="button"
                    onClick={() => onToggleTaskStatus(task)}
                  >
                    <svg
                      aria-hidden="true"
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 16 16"
                    >
                      <path
                        d="m3.25 8.25 3 3L12.75 4.75"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.2"
                      />
                    </svg>
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{task.content}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
