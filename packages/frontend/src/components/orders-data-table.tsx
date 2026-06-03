import { OrderRecord } from '../shared/types/order';
import { t } from '../shared/lib/i18n';
import { StatusBadge } from './status-badges';
import { ClientLink } from './client-link';
import { OrderLink } from './order-link';
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

interface OrdersDataTableProps {
  orders: OrderRecord[];
  resolveClientLabel: (clientId: string) => string;
  onEditOrder: (order: OrderRecord) => void;
  onDeleteOrder: (order: OrderRecord) => void;
  visibleColumns: {
    id: boolean;
    client: boolean;
    title: boolean;
    price: boolean;
    status: boolean;
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

function formatPrice(price: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(price);
}

export function OrdersDataTable({
  orders,
  resolveClientLabel,
  onEditOrder,
  onDeleteOrder,
  visibleColumns,
}: OrdersDataTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {visibleColumns.id ? <TableHead>{t('common.orderId')}</TableHead> : null}
          {visibleColumns.client ? <TableHead>{t('common.client')}</TableHead> : null}
          {visibleColumns.status ? <TableHead>{t('common.status')}</TableHead> : null}
          {visibleColumns.title ? <TableHead>{t('common.title')}</TableHead> : null}
          <TableHead>{t('common.content')}</TableHead>
          {visibleColumns.price ? <TableHead>{t('common.price')}</TableHead> : null}
          {visibleColumns.created_at ? <TableHead>{t('common.createdAt')}</TableHead> : null}
          {visibleColumns.updated_at ? <TableHead>{t('common.updatedAt')}</TableHead> : null}
          <TableHead className="w-0" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            {visibleColumns.id ? (
              <TableCell className="font-medium">
                <OrderLink orderId={order.id}>#{order.id}</OrderLink>
              </TableCell>
            ) : null}
            {visibleColumns.client ? (
              <TableCell className="font-medium text-foreground">
                <ClientLink clientId={order.client_id} name={resolveClientLabel(order.client_id)}>
                  {resolveClientLabel(order.client_id)}
                </ClientLink>
              </TableCell>
            ) : null}
            {visibleColumns.status ? (
              <TableCell>
                <StatusBadge status={order.status} />
              </TableCell>
            ) : null}
            {visibleColumns.title ? (
              <TableCell>
                <OrderLink orderId={order.id}>{order.title || t('empty.orderTitle')}</OrderLink>
              </TableCell>
            ) : null}
            <TableCell className="max-w-[420px] text-muted-foreground">
              <span className="line-clamp-2">{order.content}</span>
            </TableCell>
            {visibleColumns.price ? <TableCell>{formatPrice(order.price)}</TableCell> : null}
            {visibleColumns.created_at ? (
              <TableCell>{order.created_at ? new Date(order.created_at).toLocaleString() : '—'}</TableCell>
            ) : null}
            {visibleColumns.updated_at ? (
              <TableCell>{order.updated_at ? new Date(order.updated_at).toLocaleString() : '—'}</TableCell>
            ) : null}
            <TableCell className="w-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    aria-label={`Actions for order ${order.id}`}
                    className="h-8 w-8 rounded-full p-0"
                    type="button"
                    variant="ghost"
                  >
                    ...
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="gap-2" onSelect={() => onEditOrder(order)}>
                    <EditIcon />
                    <span>{t('actions.edit')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2 text-rose-600 focus:bg-rose-50 focus:text-rose-700"
                    onSelect={() => onDeleteOrder(order)}
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
