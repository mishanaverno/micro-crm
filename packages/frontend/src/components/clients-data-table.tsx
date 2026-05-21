import { ClientRecord } from '../shared/types/client';
import { t } from '../shared/lib/i18n';
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

interface ClientsDataTableProps {
  clients: ClientRecord[];
  onEditClient: (client: ClientRecord) => void;
  onDeleteClient: (client: ClientRecord) => void;
  visibleColumns: {
    status: boolean;
    email: boolean;
    phone_number: boolean;
    company: boolean;
    created_at: boolean;
    updated_at: boolean;
  };
}

function formatClientStatus(status: ClientRecord['status']) {
  return status === 'legal_entity'
    ? t('status.legalEntity')
    : t('status.individual');
}

export function ClientsDataTable({
  clients,
  onEditClient,
  onDeleteClient,
  visibleColumns,
}: ClientsDataTableProps) {
  function EditIcon() {
    return (
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
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
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
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
        <path
          d="M10 11v4M14 11v4"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('common.name')}</TableHead>
          {visibleColumns.status ? <TableHead>{t('common.status')}</TableHead> : null}
          {visibleColumns.email ? <TableHead>{t('common.email')}</TableHead> : null}
          {visibleColumns.phone_number ? <TableHead>{t('common.phone')}</TableHead> : null}
          {visibleColumns.company ? <TableHead>{t('common.company')}</TableHead> : null}
          {visibleColumns.created_at ? <TableHead>{t('common.createdAt')}</TableHead> : null}
          {visibleColumns.updated_at ? <TableHead>{t('common.updatedAt')}</TableHead> : null}
          <TableHead className="w-0" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.id}>
            <TableCell className="font-medium text-foreground">
              {client.name || '—'}
            </TableCell>
            {visibleColumns.status ? (
              <TableCell>
                <Badge variant="secondary">{formatClientStatus(client.status)}</Badge>
              </TableCell>
            ) : null}
            {visibleColumns.email ? (
              <TableCell>{client.email || '—'}</TableCell>
            ) : null}
            {visibleColumns.phone_number ? (
              <TableCell>{client.phone_number || '—'}</TableCell>
            ) : null}
            {visibleColumns.company ? (
              <TableCell>{client.company || '—'}</TableCell>
            ) : null}
            {visibleColumns.created_at ? (
              <TableCell>{client.created_at ? new Date(client.created_at).toLocaleString() : '—'}</TableCell>
            ) : null}
            {visibleColumns.updated_at ? (
              <TableCell>{client.updated_at ? new Date(client.updated_at).toLocaleString() : '—'}</TableCell>
            ) : null}
            <TableCell className="w-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    aria-label={`Actions for ${client.name || client.email || client.id}`}
                    className="h-8 w-8 rounded-full p-0"
                    type="button"
                    variant="ghost"
                >
                    ...
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="gap-2"
                    onSelect={() => onEditClient(client)}
                  >
                    <EditIcon />
                    <span>{t('actions.edit')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2 text-rose-600 focus:bg-rose-50 focus:text-rose-700"
                    onSelect={() => onDeleteClient(client)}
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
