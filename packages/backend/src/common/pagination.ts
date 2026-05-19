export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> extends PaginationOptions {
  items: T[];
  total: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function parsePositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

export function hasPaginationParams(page?: string, pageSize?: string) {
  return page !== undefined || pageSize !== undefined;
}

export function parsePaginationParams(
  page?: string,
  pageSize?: string,
): PaginationOptions {
  return {
    page: parsePositiveInteger(page, DEFAULT_PAGE),
    pageSize: Math.min(
      parsePositiveInteger(pageSize, DEFAULT_PAGE_SIZE),
      MAX_PAGE_SIZE,
    ),
  };
}

export function getPaginationSkip({ page, pageSize }: PaginationOptions) {
  return (page - 1) * pageSize;
}

export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  options: PaginationOptions,
): PaginatedResponse<T> {
  return {
    items,
    total,
    page: options.page,
    pageSize: options.pageSize,
  };
}
