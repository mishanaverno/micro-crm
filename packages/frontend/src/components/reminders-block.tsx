import { ReminderCalendar } from './reminder-calendar';
import { t } from '../shared/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/ui/card';
import { ReminderRecord } from '../shared/types/reminder';
import { TaskRecord } from '../shared/types/task';

export function RemindersBlock({
  emptyText,
  errorText,
  isError,
  isLoading,
  reminders,
  tasks = [],
}: {
  emptyText: string;
  errorText: string;
  isError: boolean;
  isLoading: boolean;
  reminders: ReminderRecord[];
  tasks?: TaskRecord[];
}) {
  const tasksWithDeadlines = tasks.filter((task) => Boolean(task.deadline));
  const hasCalendarItems = reminders.length > 0 || tasksWithDeadlines.length > 0;

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-lg">{t('page.reminders')}</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center px-4 pb-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : isError ? (
          <p className="text-sm text-rose-700">{errorText}</p>
        ) : !hasCalendarItems ? (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          <ReminderCalendar reminders={reminders} tasks={tasksWithDeadlines} />
        )}
      </CardContent>
    </Card>
  );
}
