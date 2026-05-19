export type PaginationParams = {
  page: number;
  pageSize: number;
};

export type PaginatedResponse<T> = PaginationParams & {
  items: T[];
  total: number;
};
