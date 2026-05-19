import { useEffect, useMemo, useState } from 'react';
import { Button } from '../shared/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../shared/ui/select';

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50];

type TablePaginationState<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
};

type TablePaginationProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
};

export function useTablePagination<T>(
  items: T[],
  initialPageSize = DEFAULT_PAGE_SIZE_OPTIONS[0],
): TablePaginationState<T> {
  const [page, setPage] = useState(1);
  const [pageSize, setRawPageSize] = useState(initialPageSize);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, pageCount);

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount));
  }, [pageCount]);

  const paginatedItems = useMemo(() => {
    const startIndex = (safePage - 1) * pageSize;

    return items.slice(startIndex, startIndex + pageSize);
  }, [items, safePage, pageSize]);

  function updatePageSize(nextPageSize: number) {
    setRawPageSize(nextPageSize);
    setPage(1);
  }

  return {
    items: paginatedItems,
    page: safePage,
    pageSize,
    totalItems: items.length,
    setPage,
    setPageSize: updatePageSize,
  };
}

export function TablePagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: TablePaginationProps) {
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, pageCount);
  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, safePage * pageSize);

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <div>
        Showing {startItem}-{endItem} of {totalItems}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span>Rows</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-9 w-[86px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span>
          Page {safePage} of {pageCount}
        </span>

        <div className="flex items-center gap-2">
          <Button
            className="h-9 px-3"
            disabled={safePage <= 1}
            onClick={() => onPageChange(safePage - 1)}
            type="button"
            variant="outline"
          >
            Previous
          </Button>
          <Button
            className="h-9 px-3"
            disabled={safePage >= pageCount}
            onClick={() => onPageChange(safePage + 1)}
            type="button"
            variant="outline"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
