import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  createPaginatedResponse,
  getPaginationSkip,
  PaginatedResponse,
  PaginationOptions,
} from '../common/pagination';
import { Paid } from '../paids/entities/paid.entity';

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

interface RawFinanceRecord extends Omit<FinanceRecord, 'id' | 'order_id'> {
  id: string | number;
  order_id: string | number;
}

@Injectable()
export class FinancesService {
  constructor(
    @InjectRepository(Paid)
    private readonly paidsRepository: Repository<Paid>,
  ) {}

  async findAllPaginated(
    userId: string,
    pagination: PaginationOptions,
  ): Promise<PaginatedResponse<FinanceRecord>> {
    const [paidTotal, rawItems] = await Promise.all([
      this.paidsRepository.count({ where: { user_id: userId } }),
      this.paidsRepository.query(
        `
          SELECT
            'paid' AS kind,
            id,
            user_id,
            client_id,
            order_id,
            value,
            created_at,
            updated_at
          FROM paids
          WHERE user_id = $1 AND deleted_at IS NULL
          ORDER BY created_at DESC, id DESC
          LIMIT $2 OFFSET $3
        `,
        [userId, pagination.pageSize, getPaginationSkip(pagination)],
      ) as Promise<RawFinanceRecord[]>,
    ]);

    const items = rawItems.map((item) => ({
      ...item,
      id: Number(item.id),
      order_id: Number(item.order_id),
    }));

    return createPaginatedResponse(items, paidTotal, pagination);
  }
}
