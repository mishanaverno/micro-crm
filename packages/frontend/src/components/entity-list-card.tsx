import { ReactNode, useMemo, useState } from 'react';
import { ColumnVisibilityMenu } from './column-visibility-menu';
import { EntitySortSelect } from './entity-sort-select';
import { EntityListToolbar } from './entity-list-toolbar';
import { Card, CardContent } from '../shared/ui/card';

type SortDirection = 'asc' | 'desc';

export type EntityListSortState<TSort extends string> = {
  sortBy: TSort;
  sortDirection: SortDirection;
};

type EntityListCardColumns<TColumn extends string> = {
  columns: Array<{ key: TColumn; label: string }>;
  visibleColumns: Record<TColumn, boolean>;
  onToggle: (column: TColumn) => void;
};

type EntityListCardProps<TSort extends string, TColumn extends string> = {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  sortOptions?: Array<{ value: TSort; label: string }>;
  sort?: EntityListSortState<TSort>;
  defaultSort?: EntityListSortState<TSort>;
  onSortChange?: (nextSort: EntityListSortState<TSort>) => void;
  columns?: EntityListCardColumns<TColumn>;
};

export function EntityListCard<TSort extends string, TColumn extends string>({
  title,
  actions,
  children,
  ...props
}: EntityListCardProps<TSort, TColumn>) {
  const sortOptions = props.sortOptions ?? [];
  const hasSort = sortOptions.length > 0;
  const fallbackSortBy = sortOptions[0]?.value;

  const [internalSort, setInternalSort] = useState<EntityListSortState<TSort> | null>(() => {
    if (!hasSort || !fallbackSortBy) {
      return null;
    }

    return props.defaultSort ?? {
      sortBy: fallbackSortBy,
      sortDirection: 'desc',
    };
  });

  const activeSort = useMemo(() => {
    if (!hasSort) {
      return null;
    }

    return props.sort ?? internalSort;
  }, [hasSort, internalSort, props.sort]);

  function handleSortChange(nextSort: EntityListSortState<TSort>) {
    if (!hasSort) {
      return;
    }

    if (!props.sort) {
      setInternalSort(nextSort);
    }

    props.onSortChange?.(nextSort);
  }

  return (
    <Card>
      <EntityListToolbar title={title}>
        {hasSort && activeSort ? (
          <EntitySortSelect
            onSortByChange={(sortBy) =>
              handleSortChange({
                sortBy,
                sortDirection: activeSort.sortDirection,
              })
            }
            onSortDirectionChange={(sortDirection) =>
              handleSortChange({
                sortBy: activeSort.sortBy,
                sortDirection,
              })
            }
            options={sortOptions}
            sortBy={activeSort.sortBy}
            sortDirection={activeSort.sortDirection}
          />
        ) : null}
        {props.columns ? (
          <ColumnVisibilityMenu
            columns={props.columns.columns}
            onToggle={props.columns.onToggle}
            visibleColumns={props.columns.visibleColumns}
          />
        ) : null}
        {actions}
      </EntityListToolbar>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
