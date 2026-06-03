export type SortDirection = 'ASC' | 'DESC';

export function parseSortDirection(direction?: string): SortDirection {
  return direction?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
}
