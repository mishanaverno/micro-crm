import { TaskRecord } from '../shared/types/task';
import { t } from '../shared/lib/i18n';
import { StatusBadge } from './status-badges';
import { ClientLink } from './client-link';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

interface TasksDataTableProps {
  tasks: TaskRecord[];
  resolveClientLabel: (clientId: string) => string;
  resolveOrderLabel: (orderId: number | null | undefined) => string;
  onEditTask: (task: TaskRecord) => void;
  onDeleteTask: (task: TaskRecord) => void;
  visibleColumns: {
    client: boolean;
    order: boolean;
    status: boolean;
    deadline: boolean;
    content: boolean;
    created_at: boolean;
    updated_at: boolean;
  };
}

function EditIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M4 20h4l10-10-4-4L4 16v4Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="m13 7 4 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M5 7h14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M9 7V5h6v2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M8 7l.7 11h6.6L16 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path d="M10 11v4M14 11v4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

export function TasksDataTable({
  tasks,
  resolveClientLabel,
  resolveOrderLabel,
  onEditTask,
  onDeleteTask,
  visibleColumns,
}: TasksDataTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {visibleColumns.client ? <TableHead>{t('common.client')}</TableHead> : null}
          {visibleColumns.order ? <TableHead>{t('common.order')}</TableHead> : null}
          {visibleColumns.status ? <TableHead>{t('common.status')}</TableHead> : null}
          {visibleColumns.deadline ? <TableHead>{t('common.deadline')}</TableHead> : null}
          {visibleColumns.content ? <TableHead>{t('common.content')}</TableHead> : null}
          {visibleColumns.created_at ? <TableHead>{t('common.createdAt')}</TableHead> : null}
          {visibleColumns.updated_at ? <TableHead>{t('common.updatedAt')}</TableHead> : null}
          <TableHead className="w-0" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            {visibleColumns.client ? (
              <TableCell className="font-medium text-foreground">
                <ClientLink clientId={task.client_id} name={resolveClientLabel(task.client_id)}>
                  {resolveClientLabel(task.client_id)}
                </ClientLink>
              </TableCell>
            ) : null}
            {visibleColumns.order ? <TableCell>{resolveOrderLabel(task.order_id)}</TableCell> : null}
            {visibleColumns.status ? (
              <TableCell>
                <StatusBadge status={task.status} />
              </TableCell>
            ) : null}
            {visibleColumns.deadline ? (
              <TableCell>{task.deadline ? new Date(task.deadline).toLocaleString() : '—'}</TableCell>
            ) : null}
            {visibleColumns.content ? (
              <TableCell className="max-w-[560px] text-muted-foreground">
                <span className="line-clamp-2">{task.content}</span>
              </TableCell>
            ) : null}
            {visibleColumns.created_at ? (
              <TableCell>{task.created_at ? new Date(task.created_at).toLocaleString() : '—'}</TableCell>
            ) : null}
            {visibleColumns.updated_at ? (
              <TableCell>{task.updated_at ? new Date(task.updated_at).toLocaleString() : '—'}</TableCell>
            ) : null}
            <TableCell className="w-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    aria-label={`Actions for task ${task.id}`}
                    className="h-8 w-8 rounded-full p-0"
                    type="button"
                    variant="ghost"
                  >
                    ...
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="gap-2" onSelect={() => onEditTask(task)}>
                    <EditIcon />
                    <span>{t('actions.edit')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2 text-rose-600 focus:bg-rose-50 focus:text-rose-700"
                    onSelect={() => onDeleteTask(task)}
                  >
                    <TrashIcon />
                    <span>{t('actions.delete')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
