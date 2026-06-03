import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../shared/ui/dropdown-menu';
import { Button } from '../shared/ui/button';
import { t } from '../shared/lib/i18n';

export function ColumnVisibilityMenu<TColumn extends string>({
  columns,
  visibleColumns,
  onToggle,
}: {
  columns: Array<{ key: TColumn; label: string }>;
  visibleColumns: Record<TColumn, boolean>;
  onToggle: (column: TColumn) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="secondary">
          {t('common.columns')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t('columns.toggle')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            checked={visibleColumns[column.key]}
            key={column.key}
            onCheckedChange={() => onToggle(column.key)}
          >
            {column.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
