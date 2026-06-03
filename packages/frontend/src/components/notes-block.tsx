import { t } from '../shared/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/ui/card';
import { NoteRecord } from '../shared/types/note';
import { cn } from '../lib/utils';

function formatDateOnly(value?: string | null) {
  return value ? new Date(value).toLocaleDateString() : '—';
}

export function NotesBlock({
  emptyText,
  errorText,
  isError,
  isLoading,
  notes,
  variant = 'inverse',
}: {
  emptyText: string;
  errorText: string;
  isError: boolean;
  isLoading: boolean;
  notes: NoteRecord[];
  variant?: 'default' | 'inverse';
}) {
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-lg">{t('page.notes')}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : isError ? (
          <p className="text-sm text-rose-700">{errorText}</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          <ul className="grid gap-2">
            {notes.map((note) => (
              <li
                className={cn(
                  'rounded-[8px] px-3 py-2 text-sm',
                  variant === 'inverse'
                    ? 'border border-black bg-black text-white'
                    : 'border border-border bg-background',
                )}
                key={note.id}
              >
                <p
                  className={cn(
                    'text-xs',
                    variant === 'inverse' ? 'text-white/70' : 'text-muted-foreground',
                  )}
                >
                  {t('common.createdFromDate', undefined, {
                    date: formatDateOnly(note.created_at),
                  })}
                </p>
                <p
                  className={cn(
                    'mt-1 font-medium',
                    variant === 'inverse' ? 'text-white' : 'text-foreground',
                  )}
                >
                  {note.content}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
