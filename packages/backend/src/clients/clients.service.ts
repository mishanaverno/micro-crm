import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, OrderByCondition, Repository, SelectQueryBuilder } from 'typeorm';
import { EventsService } from '../events/events.service';
import { parseSortDirection } from '../common/sorting';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';
import { EventType } from '../events/entities/event.entity';
import { OrderStatus } from '../orders/entities/order.entity';
import {
  createPaginatedResponse,
  getPaginationSkip,
  PaginatedResponse,
  PaginationOptions,
} from '../common/pagination';

type ClientOrderStateFilter = 'open_orders';

@Injectable()
export class ClientsService {
  private resolveOrder(sortBy?: string, sortDirection?: string): FindOptionsOrder<Client> {
    const direction = parseSortDirection(sortDirection);

    switch (sortBy) {
      case 'updated_at':
        return { updated_at: direction, created_at: 'DESC' };
      case 'name':
        return { name: direction, created_at: 'DESC' };
      case 'company':
        return { company: direction, created_at: 'DESC' };
      default:
        return { created_at: direction };
    }
  }

  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    private readonly eventsService: EventsService,
  ) {}

  private parseOrderStateFilter(orderState?: string): ClientOrderStateFilter | undefined {
    return orderState === 'open_orders' ? orderState : undefined;
  }

  private resolveQueryOrder(sortBy?: string, sortDirection?: string): OrderByCondition {
    const direction = parseSortDirection(sortDirection);

    switch (sortBy) {
      case 'updated_at':
        return { 'client.updated_at': direction, 'client.created_at': 'DESC' };
      case 'name':
        return { 'client.name': direction, 'client.created_at': 'DESC' };
      case 'company':
        return { 'client.company': direction, 'client.created_at': 'DESC' };
      default:
        return { 'client.created_at': direction };
    }
  }

  private createListQuery(
    userId: string,
    orderState?: string,
  ): SelectQueryBuilder<Client> {
    const query = this.clientsRepository
      .createQueryBuilder('client')
      .where('client.user_id = :userId', { userId });

    if (this.parseOrderStateFilter(orderState) === 'open_orders') {
      query.andWhere(
        `
          EXISTS (
            SELECT 1
            FROM orders "order"
            WHERE "order".client_id = client.id
              AND "order".user_id = client.user_id
              AND "order".status != :doneStatus
              AND "order".deleted_at IS NULL
          )
        `,
        { doneStatus: OrderStatus.DONE },
      );
    }

    return query;
  }

  private createEventPayload(client: Client) {
    return {
      client_id: client.id,
      client_name: client.name,
      client_status: client.status,
      client_company: client.company ?? null,
      name: client.name,
      email: client.email ?? null,
      phone_number: client.phone_number ?? null,
      company: client.company ?? null,
      status: client.status,
    };
  }

  async create(createClientDto: CreateClientDto, userId: string): Promise<Client> {
    const client = this.clientsRepository.create({
      ...createClientDto,
      user_id: userId,
    });
    const createdClient = await this.clientsRepository.save(client);
    await this.eventsService.createEvent(EventType.CLIENT_CREATED, {
      user_id: createdClient.user_id,
      client_id: createdClient.id,
      getPayload: () => this.createEventPayload(createdClient),
    });
    return createdClient;
  }

  findAll(
    userId: string,
    orderState?: string,
    sortBy?: string,
    sortDirection?: string,
  ): Promise<Client[]> {
    return this.createListQuery(userId, orderState)
      .orderBy(this.resolveQueryOrder(sortBy, sortDirection))
      .getMany();
  }

  async findAllPaginated(
    userId: string,
    pagination: PaginationOptions,
    orderState?: string,
    sortBy?: string,
    sortDirection?: string,
  ): Promise<PaginatedResponse<Client>> {
    const [items, total] = await this.createListQuery(userId, orderState)
      .orderBy(this.resolveQueryOrder(sortBy, sortDirection))
      .skip(getPaginationSkip(pagination))
      .take(pagination.pageSize)
      .getManyAndCount();

    return createPaginatedResponse(items, total, pagination);
  }

  findOne(id: string): Promise<Client | null> {
    return this.clientsRepository.findOneBy({ id });
  }

  findOneOwnedByUser(id: string, userId: string): Promise<Client | null> {
    return this.clientsRepository.findOneBy({ id, user_id: userId });
  }

  async touchClientActivity(id: string, userId: string): Promise<void> {
    await this.clientsRepository
      .createQueryBuilder()
      .update(Client)
      .set({ updated_at: () => 'CURRENT_TIMESTAMP' } as never)
      .where('id = :id AND user_id = :userId', { id, userId })
      .execute();
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client | null> {
    await this.clientsRepository.update(id, updateClientDto);
    const updatedClient = await this.findOne(id);

    if (updatedClient) {
      await this.eventsService.createEvent(
        EventType.CLIENT_UPDATED,
        {
          user_id: updatedClient.user_id,
          client_id: updatedClient.id,
          getPayload: () => this.createEventPayload(updatedClient),
        }
      );
    }

    return updatedClient;
  }

  async remove(id: string, userId: string): Promise<Client | null> {
    const client = await this.findOneOwnedByUser(id, userId);
    if (client) {
      await this.eventsService.createEvent(
        EventType.CLIENT_DELETED,
        {
          user_id: client.user_id,
          client_id: client.id,
          getPayload: () => this.createEventPayload(client),
        }
      );
      await this.clientsRepository.softDelete({ id, user_id: userId });
    }
    return client;
  }
}
