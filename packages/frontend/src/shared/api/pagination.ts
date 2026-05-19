import { PaginationParams } from '../types/pagination';

export function toPaginationQuery(params: PaginationParams) {
  return new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  }).toString();
}
