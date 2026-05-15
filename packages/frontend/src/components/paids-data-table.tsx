import { PaidRecord } from '../shared/types/paid';
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

interface PaidsDataTableProps {
  paids: PaidRecord[];
  resolveClientLabel: (clientId: string) => string;
  resolveOrderLabel: (orderId: number | null | undefined) => string;
  onEditPaid: (paid: PaidRecord) => void;
  onDeletePaid: (paid: PaidRecord) => void;
  visibleColumns: {
    client: boolean;
    order: boolean;
    value: boolean;
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

function formatValue(value: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(value);
}

export function PaidsDataTable({
  paids,
  resolveClientLabel,
  resolveOrderLabel,
  onEditPaid,
  onDeletePaid,
  visibleColumns,
}: PaidsDataTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {visibleColumns.client ? <TableHead>Client</TableHead> : null}
          {visibleColumns.order ? <TableHead>Order</TableHead> : null}
          {visibleColumns.value ? <TableHead>Value</TableHead> : null}
          {visibleColumns.created_at ? <TableHead>Created at</TableHead> : null}
          {visibleColumns.updated_at ? <TableHead>Updated at</TableHead> : null}
          <TableHead className="w-0" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {paids.map((paid) => (
          <TableRow key={paid.id}>
            {visibleColumns.client ? (
              <TableCell className="font-medium text-foreground">
                {resolveClientLabel(paid.client_id)}
              </TableCell>
            ) : null}
            {visibleColumns.order ? <TableCell>{resolveOrderLabel(paid.order_id)}</TableCell> : null}
            {visibleColumns.value ? (
              <TableCell className="text-foreground">
                {formatValue(paid.value)}
              </TableCell>
            ) : null}
            {visibleColumns.created_at ? (
              <TableCell>{paid.created_at ? new Date(paid.created_at).toLocaleString() : '—'}</TableCell>
            ) : null}
            {visibleColumns.updated_at ? (
              <TableCell>{paid.updated_at ? new Date(paid.updated_at).toLocaleString() : '—'}</TableCell>
            ) : null}
            <TableCell className="w-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    aria-label={`Actions for paid ${paid.id}`}
                    className="h-8 w-8 rounded-full p-0"
                    type="button"
                    variant="ghost"
                  >
                    ...
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="gap-2" onSelect={() => onEditPaid(paid)}>
                    <EditIcon />
                    <span>Изменить</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2 text-rose-600 focus:bg-rose-50 focus:text-rose-700"
                    onSelect={() => onDeletePaid(paid)}
                  >
                    <TrashIcon />
                    <span>Удалить</span>
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
