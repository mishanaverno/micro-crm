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

export type FinanceRecord = {
  id: string;
  kind: 'paid' | 'spent';
  client_id: string;
  order_id: number;
  value: number;
  created_at?: string;
  updated_at?: string;
};

interface FinancesDataTableProps {
  records: FinanceRecord[];
  resolveClientLabel: (clientId: string) => string;
  resolveOrderLabel: (orderId: number | null | undefined) => string;
  onEditRecord: (record: FinanceRecord) => void;
  onDeleteRecord: (record: FinanceRecord) => void;
  visibleColumns: {
    type: boolean;
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

function formatRecordValue(record: FinanceRecord) {
  return formatValue(record.kind === 'spent' ? -Math.abs(record.value) : record.value);
}

function formatKind(kind: FinanceRecord['kind']) {
  return kind === 'paid' ? 'Paid' : 'Spent';
}

export function FinancesDataTable({
  records,
  resolveClientLabel,
  resolveOrderLabel,
  onEditRecord,
  onDeleteRecord,
  visibleColumns,
}: FinancesDataTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {visibleColumns.type ? <TableHead>Type</TableHead> : null}
          {visibleColumns.client ? <TableHead>Client</TableHead> : null}
          {visibleColumns.order ? <TableHead>Order</TableHead> : null}
          {visibleColumns.value ? <TableHead>Value</TableHead> : null}
          {visibleColumns.created_at ? <TableHead>Created at</TableHead> : null}
          {visibleColumns.updated_at ? <TableHead>Updated at</TableHead> : null}
          <TableHead className="w-0" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => (
          <TableRow key={`${record.kind}-${record.id}`}>
            {visibleColumns.type ? (
              <TableCell>
                <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground/80">
                  {formatKind(record.kind)}
                </span>
              </TableCell>
            ) : null}
            {visibleColumns.client ? (
              <TableCell className="font-medium text-foreground">
                {resolveClientLabel(record.client_id)}
              </TableCell>
            ) : null}
            {visibleColumns.order ? (
              <TableCell>{resolveOrderLabel(record.order_id)}</TableCell>
            ) : null}
            {visibleColumns.value ? (
              <TableCell className="text-foreground">{formatRecordValue(record)}</TableCell>
            ) : null}
            {visibleColumns.created_at ? (
              <TableCell>
                {record.created_at ? new Date(record.created_at).toLocaleString() : '—'}
              </TableCell>
            ) : null}
            {visibleColumns.updated_at ? (
              <TableCell>
                {record.updated_at ? new Date(record.updated_at).toLocaleString() : '—'}
              </TableCell>
            ) : null}
            <TableCell className="w-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    aria-label={`Actions for ${record.kind} ${record.id}`}
                    className="h-8 w-8 rounded-full p-0"
                    type="button"
                    variant="ghost"
                  >
                    ...
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="gap-2" onSelect={() => onEditRecord(record)}>
                    <EditIcon />
                    <span>Изменить</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2 text-rose-600 focus:bg-rose-50 focus:text-rose-700"
                    onSelect={() => onDeleteRecord(record)}
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
