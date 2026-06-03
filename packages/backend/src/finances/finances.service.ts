import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, Repository } from 'typeorm';
import {
  createPaginatedResponse,
  getPaginationSkip,
  PaginatedResponse,
  PaginationOptions,
} from '../common/pagination';
import { Paid } from '../paids/entities/paid.entity';
import { parseSortDirection } from '../common/sorting';

export type FinanceRecordKind = 'paid';

export interface FinanceRecord {
  id: number;
  kind: FinanceRecordKind;
  user_id: string;
  client_id: string;
  order_id: number;
  value: string;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class FinancesService {
  private resolveOrder(sortBy?: string, sortDirection?: string): FindOptionsOrder<Paid> {
    const direction = parseSortDirection(sortDirection);

    switch (sortBy) {
      case 'updated_at':
        return { updated_at: direction, created_at: 'DESC', id: 'DESC' };
      case 'value':
        return { value: direction, created_at: 'DESC', id: 'DESC' };
      default:
        return { created_at: direction, id: 'DESC' };
    }
  }

  constructor(
    @InjectRepository(Paid)
    private readonly paidsRepository: Repository<Paid>,
  ) {}

  async findAllPaginated(
    userId: string,
    pagination: PaginationOptions,
    sortBy?: string,
    sortDirection?: string,
  ): Promise<PaginatedResponse<FinanceRecord>> {
    const [items, total] = await this.paidsRepository.findAndCount({
      where: { user_id: userId },
      order: this.resolveOrder(sortBy, sortDirection),
      skip: getPaginationSkip(pagination),
      take: pagination.pageSize,
    });

    return createPaginatedResponse(
      items.map((item) => ({
        kind: 'paid',
        id: item.id,
        user_id: item.user_id,
        client_id: item.client_id,
        order_id: item.order_id,
        value: item.value,
        created_at: item.created_at,
        updated_at: item.updated_at,
      })),
      total,
      pagination,
    );
  }
}
