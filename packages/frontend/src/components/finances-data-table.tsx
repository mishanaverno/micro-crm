import { Badge } from './ui/badge';
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
import { FinanceRecord } from '../shared/types/finance';
import { t } from '../shared/lib/i18n';
import { ClientLink } from './client-link';
import { OrderLink } from './order-link';

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
          {visibleColumns.type ? <TableHead>{t('common.type')}</TableHead> : null}
          {visibleColumns.client ? <TableHead>{t('common.client')}</TableHead> : null}
          {visibleColumns.order ? <TableHead>{t('common.order')}</TableHead> : null}
          {visibleColumns.value ? <TableHead>{t('common.value')}</TableHead> : null}
          {visibleColumns.created_at ? <TableHead>{t('common.createdAt')}</TableHead> : null}
          {visibleColumns.updated_at ? <TableHead>{t('common.updatedAt')}</TableHead> : null}
          <TableHead className="w-0" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => (
          <TableRow key={`${record.kind}-${record.id}`}>
            {visibleColumns.type ? (
              <TableCell>
                <Badge variant="secondary" className="border-transparent bg-emerald-100 text-emerald-700">
                  {t('entity.paid')}
                </Badge>
              </TableCell>
            ) : null}
            {visibleColumns.client ? (
              <TableCell className="font-medium text-foreground">
                <ClientLink clientId={record.client_id} name={resolveClientLabel(record.client_id)}>
                  {resolveClientLabel(record.client_id)}
                </ClientLink>
              </TableCell>
            ) : null}
            {visibleColumns.order ? (
              <TableCell>
                {record.order_id ? (
                  <OrderLink orderId={record.order_id}>
                    {resolveOrderLabel(record.order_id)}
                  </OrderLink>
                ) : (
                  '—'
                )}
              </TableCell>
            ) : null}
            {visibleColumns.value ? (
              <TableCell className="text-foreground">{formatValue(record.value)}</TableCell>
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
                    <span>{t('actions.edit')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2 text-rose-600 focus:bg-rose-50 focus:text-rose-700"
                    onSelect={() => onDeleteRecord(record)}
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
